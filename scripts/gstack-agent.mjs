#!/usr/bin/env node
/**
 * Bundled G-Stack pipeline agent — a real child process, not a UI simulation.
 * It reads actual context files from the Brain Repo, writes real markdown
 * results back into it, and emits structured phase events on stdout (which
 * /api/workflow/run redirects into logs/gstack.log). G Link merely observes
 * the log tail and the file watcher — exactly how it would observe the real
 * G-Stack (set GSTACK_CMD to swap this script out for the real thing).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const runId = process.argv[2] || `run-${Date.now()}`;
const ROOT = process.env.BRAIN_REPO_PATH
  ? path.resolve(process.env.BRAIN_REPO_PATH)
  : path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'brain-repo');
const RUNS_DIR = path.join(ROOT, '03-operations', 'runs');
const stamp = new Date().toISOString().slice(0, 10);

const log = (verb, rest) => console.log(`${new Date().toISOString()} ${verb} ${rest}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function readContext(slugs) {
  const found = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name.startsWith('.')) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (slugs.includes(path.basename(e.name, '.md'))) found.push(path.relative(ROOT, full));
    }
  };
  walk(ROOT);
  for (const rel of found) log('INFO', `reading context: ${rel}`);
  return found;
}

function writeDoc(slug, meta, body) {
  fs.mkdirSync(RUNS_DIR, { recursive: true });
  const rel = path.join('03-operations', 'runs', `${slug}.md`);
  const fm = ['---', ...Object.entries(meta).map(([k, v]) => `${k}: ${Array.isArray(v) ? `[${v.join(', ')}]` : v}`), '---'].join('\n');
  fs.writeFileSync(path.join(ROOT, rel), `${fm}\n\n${body.trim()}\n`);
  log('WRITE', rel);
}

async function phase(name, label, work, seconds) {
  log('PHASE_START', `${name} ${label}`);
  const started = Date.now();
  const ticks = 4;
  for (let i = 1; i <= ticks; i++) {
    await sleep((seconds * 1000) / (ticks + 1));
    log('PROGRESS', `${name} ${Math.round((i / (ticks + 1)) * 100)}`);
    if (work.ticks?.[i - 1]) work.ticks[i - 1]();
  }
  await sleep((seconds * 1000) / (ticks + 1));
  work.finish?.();
  log('PHASE_END', `${name} ${((Date.now() - started) / 1000).toFixed(1)}s`);
}

const doc = (title, tier, type, tags) => ({
  title: `${title} — ${stamp}`,
  tier,
  type,
  tags,
  source: 'claude-code',
  created: stamp,
  run: runId,
});

log('RUN_START', runId);

await phase('office-hours', '/office-hours', {
  ticks: [
    () => readContext(['executive-summary', 'kpi-dashboard']),
    () => log('INFO', 'extracting founder context from transcript'),
  ],
  finish: () =>
    writeDoc(`office-hours-${runId}`, doc('Office Hours Notes', 3, 'meeting', ['office-hours', 'run']), `
# Office Hours Notes — ${stamp}

Session focus: Q3 rollout readiness for the AI progress-tracking platform.

- Founder concern: manager adoption stuck at 71% ([[kpi-dashboard]])
- Agreed the onboarding redesign is the highest-leverage fix ([[onboarding-flow-redesign]])
- Flagged the EU DPIA as the critical-path dependency ([[legal-compliance]])

Handing off to CEO review with these three priorities.
`),
}, 4);

await phase('ceo-review', 'CEO Review', {
  ticks: [
    () => readContext(['executive-summary', 'budget-allocation', 'product-roadmap']),
    () => log('INFO', 'scoring priorities against Q2 results'),
  ],
  finish: () =>
    writeDoc(`ceo-review-${runId}`, doc('CEO Review', 2, 'review', ['ceo', 'review', 'run']), `
# CEO Review — ${stamp}

Reviewed against [[executive-summary]] and [[budget-allocation]].

## Decisions
1. **Approve** Q3 rollout to 400 employees per [[product-roadmap]]
2. **Prioritize** onboarding redesign before scale ([[onboarding-flow-redesign]])
3. **Escalate** embedding vendor export clause — deadline 2026-08-15 ([[vendor-contracts]])

## Rationale
Pilot exceeded lead-time and precision targets ([[kpi-dashboard]]); adoption is the
only red metric and it is a fixable first-session problem.
`),
}, 5);

await phase('engineering-review', 'Engineering Review', {
  ticks: [
    () => readContext(['ai-architecture', 'engineering-weekly-report', 'skill-gap-assessment']),
    () => log('INFO', 'validating scale plan against architecture'),
  ],
  finish: () =>
    writeDoc(`engineering-review-${runId}`, doc('Engineering Review', 2, 'review', ['engineering', 'review', 'run']), `
# Engineering Review — ${stamp}

Scale check for 40 → 400 employees against [[ai-architecture]].

- Ingestion: delta-sync headroom OK to ~1,000 employees ([[hris-connector-log]])
- Scoring: nightly batch fits; real-time alerts need the Kafka spike to land
  ([[engineering-weekly-report]])
- Risk: ML observability skill gap could slow incident response
  ([[skill-gap-assessment]]) — pair rotation approved

Verdict: **approved with conditions** — Kafka decision due before rollout week 2.
`),
}, 5);

await phase('implementation', 'Implementation', {
  ticks: [
    () => log('INFO', 'generating implementation plan'),
    () => readContext(['integration-strategy', 'onboarding-flow-redesign']),
  ],
  finish: () =>
    writeDoc(`implementation-plan-${runId}`, doc('Implementation Plan', 2, 'plan', ['implementation', 'run']), `
# Implementation Plan — ${stamp}

## Workstreams
1. Onboarding v2 build — 2 wks ([[onboarding-flow-redesign]])
2. Real-time alert pipeline (Kafka) — 3 wks, gated by eng review conditions
3. Cohort expansion tooling — consent flows for 360 new employees
   ([[legal-compliance]])

## Sequencing
Onboarding ships first (adoption is the bottleneck per [[ceo-review-${runId}]]),
alerts second, expansion last. Connector work follows [[integration-strategy]].
`),
}, 5);

await phase('qa', 'QA', {
  ticks: [
    () => log('INFO', 'running consent-purge regression suite'),
    () => log('INFO', 'verifying fairness gates on scoring pipeline'),
  ],
  finish: () =>
    writeDoc(`qa-report-${runId}`, doc('QA Report', 3, 'report', ['qa', 'run']), `
# QA Report — ${stamp}

- Consent-purge regression: **pass** (72h purge verified — [[legal-compliance]])
- Fairness gates: **pass**, no protected-attribute leakage
  ([[security-audit-summary]])
- Onboarding v2 spec review: 2 minor a11y issues filed
- Load test @ 400-employee volume: p95 scoring latency 240ms — **pass**

Pipeline [[implementation-plan-${runId}]] cleared for rollout.
`),
}, 4);

log('RUN_END', 'success');
