import fs from 'node:fs';
import path from 'node:path';
import chokidar from 'chokidar';
import { getBrainRoot } from './brain';

/**
 * Global event bus: everything live in the dashboard flows through here.
 *  - a chokidar watcher on the Brain Repo (markdown created/updated/removed)
 *  - a tailer on logs/gstack.log (workflow phase events from the runner)
 * Stored on globalThis so the singleton survives dev-server HMR reloads.
 */

export type GLinkEvent = {
  id: number;
  ts: string;
  kind: 'file' | 'workflow' | 'log' | 'sync';
  action?: string;
  phase?: string;
  progress?: number;
  duration?: string;
  path?: string;
  message: string;
  status: 'success' | 'running' | 'info' | 'error';
};

type Listener = (e: GLinkEvent) => void;

type Bus = {
  seq: number;
  listeners: Set<Listener>;
  backlog: GLinkEvent[];
  logOffset: number;
  started: boolean;
};

export function getLogPath(): string {
  return process.env.GSTACK_LOG_PATH
    ? path.resolve(process.env.GSTACK_LOG_PATH)
    : path.join(process.cwd(), 'logs', 'gstack.log');
}

function getBus(): Bus {
  const g = globalThis as typeof globalThis & { __glinkBus?: Bus };
  if (!g.__glinkBus) {
    g.__glinkBus = { seq: 0, listeners: new Set(), backlog: [], logOffset: 0, started: false };
  }
  return g.__glinkBus;
}

export function emitEvent(e: Omit<GLinkEvent, 'id' | 'ts'> & { ts?: string }): void {
  const bus = getBus();
  const event: GLinkEvent = { id: ++bus.seq, ts: e.ts ?? new Date().toISOString(), ...e };
  bus.backlog.push(event);
  if (bus.backlog.length > 200) bus.backlog.shift();
  for (const fn of bus.listeners) fn(event);
}

export function subscribe(fn: Listener): () => void {
  ensureWatchers();
  const bus = getBus();
  bus.listeners.add(fn);
  return () => bus.listeners.delete(fn);
}

export function getBacklog(limit = 50): GLinkEvent[] {
  ensureWatchers();
  return getBus().backlog.slice(-limit);
}

/* ── gstack.log line protocol ──
 * <ISO-ts> RUN_START <runId>
 * <ISO-ts> PHASE_START <phase> <label…>
 * <ISO-ts> PROGRESS <phase> <pct>
 * <ISO-ts> WRITE <brain-repo relative path>
 * <ISO-ts> INFO|ERROR <message…>
 * <ISO-ts> PHASE_END <phase> <duration>
 * <ISO-ts> RUN_END <success|error>
 * Anything else is surfaced as a plain log line (lets a real G-Stack run,
 * piped into the log file, still light up the feed).
 */
const LINE = /^(\S+)\s+(RUN_START|RUN_END|PHASE_START|PHASE_END|PROGRESS|WRITE|INFO|ERROR)\s*(.*)$/;

// Heuristic phase detection for unstructured (real G-Stack) output.
const PHASE_HINTS: [RegExp, string][] = [
  [/office.?hours/i, 'office-hours'],
  [/ceo\s+review/i, 'ceo-review'],
  [/eng(ineering)?\s+review/i, 'engineering-review'],
  [/implement/i, 'implementation'],
  [/\bqa\b|quality/i, 'qa'],
];

function parseLogLine(line: string): void {
  const trimmed = line.trim();
  if (!trimmed) return;
  const m = trimmed.match(LINE);
  if (m) {
    const [, ts, verb, rest] = m;
    const [head, ...tail] = rest.split(/\s+/);
    switch (verb) {
      case 'RUN_START':
        emitEvent({ ts, kind: 'workflow', action: 'run_start', message: `Pipeline run ${head} started`, status: 'running' });
        return;
      case 'RUN_END':
        emitEvent({ ts, kind: 'workflow', action: 'run_end', message: `Pipeline run finished: ${head}`, status: head === 'success' ? 'success' : 'error' });
        return;
      case 'PHASE_START':
        emitEvent({ ts, kind: 'workflow', action: 'phase_start', phase: head, message: `${tail.join(' ') || head} started`, status: 'running' });
        return;
      case 'PHASE_END':
        emitEvent({ ts, kind: 'workflow', action: 'phase_end', phase: head, duration: tail[0], message: `${head} completed in ${tail[0] ?? '?'}`, status: 'success' });
        return;
      case 'PROGRESS':
        emitEvent({ ts, kind: 'workflow', action: 'progress', phase: head, progress: Number(tail[0]) || 0, message: `${head} ${tail[0]}%`, status: 'running' });
        return;
      case 'WRITE':
        emitEvent({ ts, kind: 'workflow', action: 'write', path: rest, message: `Agent wrote ${rest}`, status: 'info' });
        return;
      case 'ERROR':
        emitEvent({ ts, kind: 'log', message: rest, status: 'error' });
        return;
      default:
        emitEvent({ ts, kind: 'log', message: rest, status: 'info' });
        return;
    }
  }
  // Unstructured line — infer phase if possible, always surface it.
  const hint = PHASE_HINTS.find(([re]) => re.test(trimmed));
  emitEvent({
    kind: 'log',
    phase: hint?.[1],
    message: trimmed,
    status: /error|fail/i.test(trimmed) ? 'error' : 'info',
  });
}

function drainLog(): void {
  const bus = getBus();
  const logPath = getLogPath();
  let stat: fs.Stats;
  try {
    stat = fs.statSync(logPath);
  } catch {
    return;
  }
  if (stat.size < bus.logOffset) bus.logOffset = 0; // truncated / new run
  if (stat.size === bus.logOffset) return;
  const fd = fs.openSync(logPath, 'r');
  const buf = Buffer.alloc(stat.size - bus.logOffset);
  fs.readSync(fd, buf, 0, buf.length, bus.logOffset);
  fs.closeSync(fd);
  bus.logOffset = stat.size;
  for (const line of buf.toString('utf8').split('\n')) parseLogLine(line);
}

function ensureWatchers(): void {
  const bus = getBus();
  if (bus.started) return;
  bus.started = true;

  const brainRoot = getBrainRoot();
  const logPath = getLogPath();
  fs.mkdirSync(path.dirname(logPath), { recursive: true });

  // Skip the existing log content — only stream lines appended from now on.
  try {
    bus.logOffset = fs.statSync(logPath).size;
  } catch {
    bus.logOffset = 0;
  }

  chokidar
    .watch(brainRoot, { ignoreInitial: true, ignored: /(^|[/\\])\./, depth: 5 })
    .on('all', (action, fullPath) => {
      if (!fullPath.endsWith('.md')) return;
      const rel = path.relative(brainRoot, fullPath);
      const verb = action === 'add' ? 'created' : action === 'unlink' ? 'deleted' : 'updated';
      emitEvent({
        kind: 'file',
        action,
        path: rel,
        message: `Markdown ${verb}: ${rel}`,
        status: action === 'unlink' ? 'error' : action === 'add' ? 'success' : 'info',
      });
    });

  chokidar
    .watch(logPath, { ignoreInitial: true })
    .on('all', (action) => {
      if (action === 'add' || action === 'change') drainLog();
    });
}
