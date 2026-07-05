import fs from 'node:fs';
import path from 'node:path';

/**
 * Local Brain Repo access layer. This is the fallback implementation of the
 * same operations the `gbrain` CLI exposes (search / get_page / graph) so the
 * dashboard works against a plain markdown directory when the CLI is absent.
 */

export type BrainFile = {
  slug: string;
  relPath: string;
  title: string;
  tier: 1 | 2 | 3;
  type: string;
  tags: string[];
  source: string;
  created: string;
  links: string[];
  excerpt: string;
  size: number;
  mtime: number;
};

export type BrainGraph = {
  nodes: (BrainFile & { inbound: number; outbound: number })[];
  edges: { id: string; source: string; target: string }[];
};

export function getBrainRoot(): string {
  return process.env.BRAIN_REPO_PATH
    ? path.resolve(process.env.BRAIN_REPO_PATH)
    : path.join(process.cwd(), 'brain-repo');
}

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  if (!raw.startsWith('---')) return { meta: {}, body: raw };
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { meta: {}, body: raw };
  const meta: Record<string, string> = {};
  for (const line of raw.slice(3, end).split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: raw.slice(end + 4).replace(/^\n+/, '') };
}

function parseTags(v: string | undefined): string[] {
  if (!v) return [];
  return v.replace(/^\[|\]$/g, '').split(',').map((t) => t.trim()).filter(Boolean);
}

const WIKILINK = /\[\[([^\]|#]+)(?:[|#][^\]]*)?\]\]/g;

function extractLinks(body: string): string[] {
  const links = new Set<string>();
  for (const m of body.matchAll(WIKILINK)) links.add(m[1].trim());
  return [...links];
}

function firstParagraph(body: string): string {
  const text = body
    .split('\n')
    .filter((l) => l.trim() && !l.startsWith('#') && !l.startsWith('|') && !l.startsWith('---'))
    .join(' ')
    .replace(/\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g, '$1')
    .replace(/[*_`]/g, '');
  return text.slice(0, 220) + (text.length > 220 ? '…' : '');
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

export function scanFiles(): BrainFile[] {
  const root = getBrainRoot();
  if (!fs.existsSync(root)) return [];
  return walk(root).map((full) => {
    const raw = fs.readFileSync(full, 'utf8');
    const stat = fs.statSync(full);
    const { meta, body } = parseFrontmatter(raw);
    const relPath = path.relative(root, full);
    const slug = path.basename(full, '.md');
    const tier = Number(meta.tier);
    return {
      slug,
      relPath,
      title: meta.title || slug,
      tier: (tier === 1 || tier === 2 || tier === 3 ? tier : 3) as 1 | 2 | 3,
      type: meta.type || 'note',
      tags: parseTags(meta.tags),
      source: meta.source || 'markdown-vault',
      created: meta.created || '',
      links: extractLinks(body),
      excerpt: firstParagraph(body),
      size: stat.size,
      mtime: stat.mtimeMs,
    };
  });
}

/** Read one file by repo-relative path, guarded against traversal. */
export function readBrainFile(relPath: string): { file: BrainFile; content: string } | null {
  const root = getBrainRoot();
  const full = path.resolve(root, relPath);
  if (!full.startsWith(root + path.sep) || !full.endsWith('.md') || !fs.existsSync(full)) return null;
  const file = scanFiles().find((f) => f.relPath === relPath);
  if (!file) return null;
  const { body } = parseFrontmatter(fs.readFileSync(full, 'utf8'));
  return { file, content: body };
}

export function findBySlug(slug: string): BrainFile | undefined {
  return scanFiles().find((f) => f.slug === slug);
}

export function buildGraph(): BrainGraph {
  const files = scanFiles();
  const bySlug = new Map(files.map((f) => [f.slug, f]));
  const inbound = new Map<string, number>();
  const edges: BrainGraph['edges'] = [];
  for (const f of files) {
    for (const target of f.links) {
      if (!bySlug.has(target) || target === f.slug) continue;
      edges.push({ id: `${f.slug}->${target}`, source: f.slug, target });
      inbound.set(target, (inbound.get(target) ?? 0) + 1);
    }
  }
  return {
    nodes: files.map((f) => ({
      ...f,
      inbound: inbound.get(f.slug) ?? 0,
      outbound: f.links.filter((l) => bySlug.has(l)).length,
    })),
    edges,
  };
}

export type SearchHit = { file: BrainFile; score: number; snippet: string };

export function searchFiles(query: string, limit = 5): SearchHit[] {
  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  if (terms.length === 0) return [];
  const root = getBrainRoot();
  const hits: SearchHit[] = [];
  for (const file of scanFiles()) {
    const raw = fs.readFileSync(path.join(root, file.relPath), 'utf8').toLowerCase();
    let score = 0;
    let firstIdx = -1;
    for (const term of terms) {
      if (file.title.toLowerCase().includes(term)) score += 10;
      if (file.slug.includes(term)) score += 8;
      if (file.tags.some((t) => t.toLowerCase().includes(term))) score += 5;
      let idx = raw.indexOf(term);
      while (idx !== -1) {
        score += 1;
        if (firstIdx === -1) firstIdx = idx;
        idx = raw.indexOf(term, idx + term.length);
      }
    }
    if (score > 0) {
      const start = Math.max(0, firstIdx - 80);
      const snippet = raw.slice(start, start + 240).replace(/\s+/g, ' ').trim();
      hits.push({ file, score, snippet: `…${snippet}…` });
    }
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function getStats() {
  const graph = buildGraph();
  const tags = new Set<string>();
  const sources = new Set<string>();
  for (const n of graph.nodes) {
    n.tags.forEach((t) => tags.add(t));
    sources.add(n.source);
  }
  return {
    files: graph.nodes.length,
    relationships: graph.edges.length,
    entities: tags.size + graph.nodes.length,
    sources: sources.size,
    byTier: {
      1: graph.nodes.filter((n) => n.tier === 1).length,
      2: graph.nodes.filter((n) => n.tier === 2).length,
      3: graph.nodes.filter((n) => n.tier === 3).length,
    },
    totalBytes: graph.nodes.reduce((s, n) => s + n.size, 0),
    root: getBrainRoot(),
  };
}
