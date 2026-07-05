import { NextResponse } from 'next/server';
import { spawn, ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { getLogPath } from '@/lib/events';

export const dynamic = 'force-dynamic';

/**
 * POST /api/workflow/run — launch a real G-Stack pipeline run.
 * By default this spawns scripts/gstack-agent.mjs, an actual child process
 * that writes markdown into the Brain Repo and phase events into
 * logs/gstack.log — the dashboard only observes. Set GSTACK_CMD to run the
 * real G-Stack instead; its output is captured into the same log file and
 * parsed heuristically.
 */

type RunState = { child: ChildProcess | null; lastRun: { id: string; startedAt: string; status: string } | null };

function getRunState(): RunState {
  const g = globalThis as typeof globalThis & { __glinkRun?: RunState };
  if (!g.__glinkRun) g.__glinkRun = { child: null, lastRun: null };
  return g.__glinkRun;
}

export async function GET() {
  const state = getRunState();
  return NextResponse.json({
    running: state.child !== null && state.child.exitCode === null,
    lastRun: state.lastRun,
  });
}

export async function POST() {
  const state = getRunState();
  if (state.child && state.child.exitCode === null) {
    return NextResponse.json({ error: 'A pipeline run is already in progress' }, { status: 409 });
  }

  const runId = `run-${Date.now()}`;
  const logPath = getLogPath();
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  const logFd = fs.openSync(logPath, 'a');

  const custom = process.env.GSTACK_CMD;
  const child = custom
    ? spawn(custom, { shell: true, cwd: process.cwd(), stdio: ['ignore', logFd, logFd] })
    : spawn(process.execPath, [path.join(process.cwd(), 'scripts', 'gstack-agent.mjs'), runId], {
        cwd: process.cwd(),
        stdio: ['ignore', logFd, logFd],
      });

  state.child = child;
  state.lastRun = { id: runId, startedAt: new Date().toISOString(), status: 'running' };

  child.on('exit', (code) => {
    fs.closeSync(logFd);
    const s = getRunState();
    if (s.lastRun?.id === runId) s.lastRun.status = code === 0 ? 'success' : 'error';
    s.child = null;
  });

  return NextResponse.json({ started: true, runId, mode: custom ? 'gstack-cmd' : 'bundled-agent' });
}
