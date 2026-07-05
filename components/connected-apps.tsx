"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2, AlertTriangle, RefreshCw, Plus, X, Settings, Folder,
  GitBranch, FileText,
  ChevronRight, Zap, Activity, Database, Eye, ArrowRight,
  HardDrive, Search, Network
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
type SourceStatus = "connected" | "syncing" | "warning" | "disconnected";
type DataSource = {
  id: string;
  name: string;
  type: string;
  category: string;
  status: SourceStatus;
  files: number;
  lastSync: string;
  icon: string;
  description: string;
  health: number;
  settings: Record<string, boolean | string>;
};

type SyncJob = {
  id: string;
  source: string;
  status: "completed" | "syncing" | "waiting" | "error";
  progress: number;
  files: number;
  time: string;
};

type AutoRule = {
  trigger: string;
  actions: string[];
};

// ── Data ─────────────────────────────────────────────────────────────────────
const SOURCES: DataSource[] = [
  {
    id: "s1", name: "Local Markdown Vault", type: "folder", category: "Notes",
    status: "connected", files: 482, lastSync: "2 min ago", icon: "📁",
    description: "~/Documents/Brain — Primary knowledge store",
    health: 98,
    settings: { autoSync: true, frequency: "5 min", summarize: true, extractEntities: true, buildGraph: true, generateTags: true, createBacklinks: true, detectCompanies: true, detectPeople: true, exclude: "archive/, images/" }
  },
  {
    id: "s2", name: "Obsidian Vault", type: "obsidian", category: "Notes",
    status: "connected", files: 1247, lastSync: "5 min ago", icon: "🔮",
    description: "~/obsidian/main — Personal notes & research",
    health: 100,
    settings: { autoSync: true, frequency: "2 min", summarize: true, extractEntities: true, buildGraph: true, generateTags: true, createBacklinks: true, detectCompanies: false, detectPeople: true, exclude: ".obsidian/" }
  },
  {
    id: "s3", name: "Notion", type: "notion", category: "Notes",
    status: "connected", files: 312, lastSync: "15 min ago", icon: "📝",
    description: "Workspace — Team wikis & roadmaps",
    health: 96,
    settings: { autoSync: true, frequency: "15 min", summarize: true, extractEntities: true, buildGraph: false, generateTags: true, createBacklinks: false, detectCompanies: true, detectPeople: true, exclude: "" }
  },
  {
    id: "s4", name: "GitHub Repository", type: "github", category: "Development",
    status: "connected", files: 891, lastSync: "10 min ago", icon: "🐙",
    description: "EhteshamBahoo/glink — Codebase + docs",
    health: 100,
    settings: { autoSync: true, frequency: "10 min", summarize: true, extractEntities: false, buildGraph: false, generateTags: true, createBacklinks: false, detectCompanies: false, detectPeople: false, exclude: "node_modules/, .next/" }
  },
  {
    id: "s5", name: "Gmail", type: "email", category: "Communication",
    status: "warning", files: 3420, lastSync: "1 hr ago", icon: "📧",
    description: "founder@glink.com — OAuth expires in 2 days",
    health: 72,
    settings: { autoSync: true, frequency: "30 min", summarize: true, extractEntities: true, buildGraph: true, generateTags: true, createBacklinks: true, detectCompanies: true, detectPeople: true, exclude: "promotions/, spam/" }
  },
  {
    id: "s6", name: "Google Calendar", type: "calendar", category: "Communication",
    status: "connected", files: 847, lastSync: "30 min ago", icon: "📅",
    description: "Meeting transcripts + event context",
    health: 94,
    settings: { autoSync: true, frequency: "30 min", summarize: true, extractEntities: true, buildGraph: true, generateTags: false, createBacklinks: true, detectCompanies: true, detectPeople: true, exclude: "personal calendar" }
  },
  {
    id: "s7", name: "Claude Code", type: "claude", category: "AI Runtime",
    status: "connected", files: 0, lastSync: "Live", icon: "🤖",
    description: "MCP Server — Real-time agent memory sync",
    health: 100,
    settings: { autoSync: true, frequency: "real-time", summarize: false, extractEntities: false, buildGraph: true, generateTags: false, createBacklinks: false, detectCompanies: false, detectPeople: false, exclude: "" }
  },
  {
    id: "s8", name: "Cursor", type: "cursor", category: "AI Runtime",
    status: "connected", files: 0, lastSync: "Live", icon: "⚡",
    description: "MCP Integration — Context injection on demand",
    health: 100,
    settings: { autoSync: true, frequency: "real-time", summarize: false, extractEntities: false, buildGraph: true, generateTags: false, createBacklinks: false, detectCompanies: false, detectPeople: false, exclude: "" }
  },
  {
    id: "s9", name: "OpenClaw", type: "openclaw", category: "AI Runtime",
    status: "connected", files: 0, lastSync: "Live", icon: "🦞",
    description: "Always-running agent runtime — persistent memory",
    health: 100,
    settings: { autoSync: true, frequency: "real-time", summarize: false, extractEntities: false, buildGraph: true, generateTags: false, createBacklinks: false, detectCompanies: false, detectPeople: false, exclude: "" }
  },
  {
    id: "s10", name: "Twitter / X", type: "twitter", category: "Web",
    status: "connected", files: 2341, lastSync: "1 hr ago", icon: "𝕏",
    description: "Tracked accounts + saved threads",
    health: 88,
    settings: { autoSync: true, frequency: "1 hour", summarize: true, extractEntities: true, buildGraph: true, generateTags: true, createBacklinks: false, detectCompanies: true, detectPeople: true, exclude: "" }
  },
  {
    id: "s11", name: "Slack", type: "slack", category: "Communication",
    status: "syncing", files: 0, lastSync: "Syncing...", icon: "💬",
    description: "Enterprise Grid — Metadata only (content excluded)",
    health: 85,
    settings: { autoSync: true, frequency: "5 min", summarize: false, extractEntities: false, buildGraph: false, generateTags: false, createBacklinks: false, detectCompanies: false, detectPeople: false, exclude: "DMs, personal channels" }
  },
  {
    id: "s12", name: "Meeting Transcripts", type: "transcripts", category: "Communication",
    status: "connected", files: 183, lastSync: "3 hr ago", icon: "🎙️",
    description: "Otter.ai + Zoom recordings — auto-imported",
    health: 91,
    settings: { autoSync: true, frequency: "manual", summarize: true, extractEntities: true, buildGraph: true, generateTags: true, createBacklinks: true, detectCompanies: true, detectPeople: true, exclude: "" }
  },
];

const SYNC_JOBS: SyncJob[] = [
  { id: "j1", source: "Obsidian Vault", status: "completed", progress: 100, files: 41, time: "10:32" },
  { id: "j2", source: "Gmail", status: "syncing", progress: 62, files: 18, time: "10:31" },
  { id: "j3", source: "GitHub", status: "completed", progress: 100, files: 7, time: "10:28" },
  { id: "j4", source: "Google Calendar", status: "completed", progress: 100, files: 23, time: "10:26" },
  { id: "j5", source: "Twitter/X", status: "waiting", progress: 0, files: 0, time: "10:24" },
  { id: "j6", source: "Markdown Vault", status: "completed", progress: 100, files: 482, time: "10:20" },
  { id: "j7", source: "Meeting Transcripts", status: "completed", progress: 100, files: 6, time: "10:15" },
  { id: "j8", source: "Notion", status: "completed", progress: 100, files: 14, time: "10:08" },
];

const AUTOMATION_RULES: AutoRule[] = [
  { trigger: "Email arrives from known contact", actions: ["Summarize thread", "Create markdown", "Link to person.md", "Update company.md", "Refresh graph"] },
  { trigger: "GitHub PR merged", actions: ["Read diff & README", "Update project.md", "Tag relevant entities", "Notify agent context"] },
  { trigger: "Meeting transcript uploaded", actions: ["Transcribe audio", "Extract action items", "Link attendees", "Create meeting.md", "Update G-Brain"] },
  { trigger: "Dream Cycle (nightly 2am)", actions: ["Find duplicate entities", "Merge overlapping stubs", "Repair broken links", "Update all summaries", "Rebuild search index"] },
];

const WATCHED_FOLDERS = [
  { path: "~/Documents/Brain", freq: "2 min", exclude: ".obsidian, archive/" },
  { path: "~/Projects", freq: "5 min", exclude: "node_modules/, .git/" },
  { path: "~/Notes", freq: "2 min", exclude: "images/, attachments/" },
  { path: "~/Research", freq: "10 min", exclude: "" },
];

const SOURCE_OPTIONS = [
  { icon: "📁", label: "Folder / Vault" }, { icon: "🐙", label: "Git Repository" },
  { icon: "📝", label: "Notes App" }, { icon: "📧", label: "Email" },
  { icon: "🌐", label: "Browser / Bookmarks" }, { icon: "📅", label: "Calendar" },
  { icon: "🎙️", label: "Meeting Recorder" }, { icon: "🤖", label: "MCP Client" },
  { icon: "⚡", label: "API Endpoint" }, { icon: "🔗", label: "Custom Webhook" },
];

const CATEGORIES = ["All", "Notes", "Development", "Communication", "AI Runtime", "Web"];

// ── Sub-components ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: SourceStatus }) {
  const map = {
    connected: "bg-green-100 text-green-700 border-green-200",
    syncing: "bg-blue-100 text-blue-700 border-blue-200",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
    disconnected: "bg-slate-100 text-slate-500 border-slate-200",
  };
  const labels = { connected: "Connected", syncing: "Syncing", warning: "Warning", disconnected: "Off" };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${map[status]}`}>
      {status === "connected" && <CheckCircle2 className="w-3 h-3" />}
      {status === "syncing" && <RefreshCw className="w-3 h-3 animate-spin" />}
      {status === "warning" && <AlertTriangle className="w-3 h-3" />}
      {labels[status]}
    </span>
  );
}

function HealthBar({ value }: { value: number }) {
  const color = value >= 90 ? "bg-green-500" : value >= 70 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[10px] font-bold text-slate-500 w-8 text-right">{value}%</span>
    </div>
  );
}

function SyncProgressBar({ job }: { job: SyncJob }) {
  const colors: Record<string, string> = {
    completed: "bg-green-500",
    syncing: "bg-blue-500",
    waiting: "bg-slate-300",
    error: "bg-red-500",
  };
  return (
    <div className="flex items-center gap-3">
      <div className="w-36 text-xs text-slate-700 font-medium truncate">{job.source}</div>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${colors[job.status]} ${job.status === "syncing" ? "animate-pulse" : ""}`} style={{ width: `${job.progress}%` }} />
      </div>
      <span className={`text-[10px] font-bold w-20 ${job.status === "completed" ? "text-green-600" : job.status === "syncing" ? "text-blue-600" : "text-slate-400"}`}>
        {job.status === "completed" ? `✓ ${job.files} files` : job.status === "syncing" ? `${job.progress}%...` : "Waiting"}
      </span>
      <span className="text-[10px] text-slate-400 w-10 text-right">{job.time}</span>
    </div>
  );
}

// ── Settings Drawer ───────────────────────────────────────────────────────────
function SourceSettingsDrawer({ source, onClose }: { source: DataSource; onClose: () => void }) {
  const [settings, setSettings] = useState(source.settings);
  const boolKeys = ["summarize", "extractEntities", "buildGraph", "generateTags", "createBacklinks", "autoSync", "detectCompanies", "detectPeople"];
  const labels: Record<string, string> = {
    summarize: "Summarize content", extractEntities: "Extract entities",
    buildGraph: "Build knowledge graph", generateTags: "Generate tags",
    createBacklinks: "Create backlinks", autoSync: "Auto sync",
    detectCompanies: "Detect companies", detectPeople: "Detect people",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end" onClick={onClose}>
      <div className="w-[420px] h-full bg-white border-l shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b bg-slate-50 flex justify-between items-start">
          <div>
            <div className="text-2xl mb-1">{source.icon}</div>
            <h2 className="font-bold text-slate-900 text-lg">{source.name}</h2>
            <p className="text-xs text-slate-500">{source.description}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Status & Health */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Status</div>
            <div className="flex items-center justify-between mb-2">
              <StatusBadge status={source.status} />
              <span className="text-xs text-slate-500">Last sync: {source.lastSync}</span>
            </div>
            <HealthBar value={source.health} />
          </div>

          {/* Sync Settings */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Sync Settings</div>
            <div className="space-y-3">
              {boolKeys.map(key => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">{labels[key]}</span>
                  <button
                    onClick={() => setSettings(s => ({ ...s, [key]: !s[key] }))}
                    className={`w-10 h-5 rounded-full transition-colors ${settings[key] ? "bg-blue-500" : "bg-slate-200"}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${settings[key] ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Exclude paths */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Exclude Paths</div>
            <textarea
              className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              rows={3}
              value={settings.exclude as string}
              onChange={e => setSettings(s => ({ ...s, exclude: e.target.value }))}
            />
          </div>

          {/* Graph Preview */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Processing Pipeline</div>
            <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap">
              {["Ingest", "Parse", "Summarize", "Extract Entities", "Build Graph", "Index"].map((step, i, arr) => (
                <span key={step} className="flex items-center gap-1">
                  <span className="bg-slate-100 border rounded px-2 py-1">{step}</span>
                  {i < arr.length - 1 && <ChevronRight className="w-3 h-3 text-slate-400" />}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-lg flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Sync Now
            </button>
            <button className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-lg border border-red-200">
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Add Source Modal ──────────────────────────────────────────────────────────
function AddSourceModal({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-6" onClick={onClose}>
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="font-bold text-slate-900 text-lg">Add Data Source</h2>
            <p className="text-xs text-slate-500 mt-0.5">Choose where G-Brain should pull knowledge from</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3">
            {SOURCE_OPTIONS.map(opt => (
              <button
                key={opt.label}
                onClick={() => setSelected(opt.label)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  selected === opt.label ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span className="text-2xl">{opt.icon}</span>
                <span className="text-sm font-medium text-slate-700">{opt.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            <button
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                selected ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
              disabled={!selected}
              onClick={onClose}
            >
              <ArrowRight className="w-4 h-4" /> Connect {selected || "Source"}
            </button>
            <button onClick={onClose} className="px-4 py-2.5 border rounded-xl text-sm text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
type SubTab = "sources" | "sync" | "rules" | "automation" | "watchers";

export function ConnectedApps() {
  const [subTab, setSubTab] = useState<SubTab>("sources");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSource, setSelectedSource] = useState<DataSource | null>(null);
  const [liveStats, setLiveStats] = useState({ files: 0, entities: 0, relationships: 0, sources: 0 });

  useEffect(() => {
    fetch('/api/brain/stats')
      .then(r => r.json())
      .then(d => {
        if (d.status === 'healthy') {
          setLiveStats({ files: d.files, entities: d.entities, relationships: d.relationships, sources: d.sources });
        }
      });
  }, []);

  const filteredSources = categoryFilter === "All"
    ? SOURCES
    : SOURCES.filter(s => s.category === categoryFilter);

  const stats = {
    sources: liveStats.sources || SOURCES.length,
    files: (liveStats.files || SOURCES.reduce((a, s) => a + s.files, 0)).toLocaleString(),
    entities: liveStats.entities ? liveStats.entities.toLocaleString() : "31,492",
    relationships: liveStats.relationships ? liveStats.relationships.toLocaleString() : "89,122",
    syncJobs: 83,
    storage: "2.4 GB",
  };

  const subTabs: { id: SubTab; label: string; icon: React.ReactNode }[] = [
    { id: "sources", label: "Connected Sources", icon: <Database className="w-4 h-4" /> },
    { id: "sync", label: "Sync Status", icon: <RefreshCw className="w-4 h-4" /> },
    { id: "watchers", label: "Folder Watchers", icon: <Eye className="w-4 h-4" /> },
    { id: "rules", label: "Processing Rules", icon: <Settings className="w-4 h-4" /> },
    { id: "automation", label: "Automation", icon: <Zap className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] font-sans overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b px-8 pt-6 pb-0 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Data Sources</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Control where G-Brain gets its knowledge — the memory layer for G-Stack agents
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Source
          </button>
        </div>
        {/* Sub Tabs */}
        <div className="flex gap-1">
          {subTabs.map(t => (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                subTab === t.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-8 py-6">

        {/* ── CONNECTED SOURCES ── */}
        {subTab === "sources" && (
          <div>
            {/* Category Filter */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    categoryFilter === c
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Source Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredSources.map(source => (
                <div
                  key={source.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border">
                        {source.icon}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm leading-tight">{source.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{source.category}</div>
                      </div>
                    </div>
                    <StatusBadge status={source.status} />
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">{source.description}</p>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-slate-50 rounded-xl p-2 border">
                      <div className="text-base font-bold text-slate-900">
                        {source.files > 0 ? source.files.toLocaleString() : "Live"}
                      </div>
                      <div className="text-[10px] text-slate-500">{source.files > 0 ? "Files" : "Stream"}</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2 border">
                      <div className="text-base font-bold text-slate-900">{source.lastSync}</div>
                      <div className="text-[10px] text-slate-500">Last Sync</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-500 mb-1.5 font-semibold">Health</div>
                    <HealthBar value={source.health} />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setSelectedSource(source)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5" /> Configure
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold border border-blue-200 transition-colors">
                      <RefreshCw className="w-3.5 h-3.5" /> Sync Now
                    </button>
                  </div>
                </div>
              ))}

              {/* Add Source Tile */}
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-white rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50 p-5 flex flex-col items-center justify-center gap-3 transition-all min-h-[240px] group"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                  <Plus className="w-6 h-6 text-slate-400 group-hover:text-blue-500" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-slate-500 group-hover:text-blue-600">Add Data Source</div>
                  <div className="text-xs text-slate-400 mt-0.5">Connect a new knowledge stream</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ── SYNC STATUS ── */}
        {subTab === "sync" && (
          <div className="max-w-3xl space-y-6">
            <div className="bg-white rounded-2xl border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-slate-800">Current Sync Jobs</h2>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">{new Date().toLocaleTimeString()}</span>
              </div>
              <div className="space-y-3">
                {SYNC_JOBS.map(job => <SyncProgressBar key={job.id} job={job} />)}
              </div>
            </div>

            <div className="bg-white rounded-2xl border p-6 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">Sync History</h2>
              <div className="space-y-3">
                {[
                  { time: "10:32", msg: "Imported 41 markdown files from Obsidian", type: "success" },
                  { time: "10:31", msg: "Indexed 7 PDFs from meeting transcripts", type: "success" },
                  { time: "10:28", msg: "Updated 18 GitHub README files", type: "success" },
                  { time: "10:26", msg: "Extracted 142 entities from Calendar events", type: "success" },
                  { time: "10:24", msg: "Dream Cycle completed — 23 entities merged", type: "info" },
                  { time: "10:18", msg: "OAuth token refreshed for Gmail", type: "info" },
                  { time: "09:45", msg: "Warning: Gmail OAuth token expires in 2 days", type: "warning" },
                  { time: "09:30", msg: "Slack Enterprise Grid sync initialized", type: "success" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b last:border-0">
                    <span className="text-[10px] text-slate-400 font-mono w-10 shrink-0 mt-0.5">{item.time}</span>
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                      item.type === "success" ? "bg-green-500" : item.type === "warning" ? "bg-amber-500" : "bg-blue-500"
                    }`} />
                    <span className="text-xs text-slate-600">{item.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── FOLDER WATCHERS ── */}
        {subTab === "watchers" && (
          <div className="max-w-2xl space-y-4">
            <div className="bg-white rounded-2xl border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-slate-800">Watched Folders</h2>
                <button className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700">
                  <Plus className="w-3.5 h-3.5" /> Add Folder
                </button>
              </div>
              <div className="space-y-3">
                {WATCHED_FOLDERS.map((f, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border hover:border-slate-300 transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm text-slate-800 font-semibold">{f.path}</div>
                      {f.exclude && <div className="text-xs text-slate-400 mt-0.5">Exclude: {f.exclude}</div>}
                    </div>
                    <div className="text-center shrink-0">
                      <div className="text-xs font-bold text-slate-700">Every {f.freq}</div>
                      <div className="text-[10px] text-slate-400">Auto Sync</div>
                    </div>
                    <button className="text-slate-400 hover:text-slate-700"><Settings className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border p-6 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">Import Wizard</h2>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center gap-3 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group">
                <div className="w-14 h-14 bg-slate-100 group-hover:bg-blue-100 rounded-2xl flex items-center justify-center transition-colors">
                  <FileText className="w-7 h-7 text-slate-400 group-hover:text-blue-500" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-slate-700">Drop files to import</div>
                  <div className="text-xs text-slate-500 mt-1">Markdown · PDF · TXT · CSV · JSON · ZIP · Git Repo</div>
                </div>
                <button className="mt-2 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700">
                  Browse Files
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── PROCESSING RULES ── */}
        {subTab === "rules" && (
          <div className="max-w-2xl space-y-4">
            {SOURCES.slice(0, 5).map(source => {
              const boolSettings = ["summarize", "extractEntities", "buildGraph", "generateTags", "createBacklinks", "detectCompanies", "detectPeople"] as const;
              const labels: Record<string, string> = {
                summarize: "Summarize content",
                extractEntities: "Extract entities",
                buildGraph: "Build knowledge graph",
                generateTags: "Generate tags",
                createBacklinks: "Create backlinks",
                detectCompanies: "Detect companies",
                detectPeople: "Detect people",
              };
              return (
                <div key={source.id} className="bg-white rounded-2xl border p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xl">{source.icon}</span>
                    <div>
                      <div className="font-bold text-slate-800">{source.name}</div>
                      <div className="text-xs text-slate-400">{source.category}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                    {boolSettings.map(key => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-xs text-slate-600">{labels[key]}</span>
                        <div className={`w-8 h-4 rounded-full flex items-center px-0.5 ${source.settings[key] ? "bg-blue-500" : "bg-slate-200"}`}>
                          <div className={`w-3 h-3 bg-white rounded-full shadow transition-transform ${source.settings[key] ? "translate-x-4" : "translate-x-0"}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── AUTOMATION ── */}
        {subTab === "automation" && (
          <div className="max-w-2xl space-y-4">
            {AUTOMATION_RULES.map((rule, i) => (
              <div key={i} className="bg-white rounded-2xl border p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">When</div>
                  <div className="font-semibold text-slate-800 text-sm">{rule.trigger}</div>
                </div>
                <div className="flex flex-col gap-2">
                  {rule.actions.map((action, j) => (
                    <div key={j} className="flex items-center gap-3">
                      {j > 0 && <div className="w-px h-4 bg-slate-200 ml-2 -mt-2" />}
                      <div className="flex items-center gap-2 bg-slate-50 border rounded-xl px-3 py-2 w-full">
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-xs text-slate-700">{action}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors">Edit Rule</button>
                  <button className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl border transition-colors">Run Now</button>
                </div>
              </div>
            ))}

            <button className="w-full py-4 bg-white rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-500 hover:text-blue-600 font-semibold text-sm flex items-center justify-center gap-2 transition-all">
              <Plus className="w-4 h-4" /> Add Automation Rule
            </button>
          </div>
        )}
      </div>

      {/* ── Bottom Stats Bar ── */}
      <div className="bg-white border-t px-8 py-3 flex items-center gap-8 shrink-0">
        {[
          { icon: <Database className="w-3.5 h-3.5" />, label: "Sources", value: stats.sources },
          { icon: <FileText className="w-3.5 h-3.5" />, label: "Files", value: stats.files },
          { icon: <Search className="w-3.5 h-3.5" />, label: "Entities", value: stats.entities },
          { icon: <Network className="w-3.5 h-3.5" />, label: "Relationships", value: stats.relationships },
          { icon: <RefreshCw className="w-3.5 h-3.5" />, label: "Sync Jobs Today", value: stats.syncJobs },
          { icon: <HardDrive className="w-3.5 h-3.5" />, label: "Storage", value: stats.storage },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="text-slate-400">{s.icon}</span>
            <span className="text-xs font-bold text-slate-800">{s.value}</span>
            <span className="text-xs text-slate-400">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Modals / Drawers */}
      {showAddModal && <AddSourceModal onClose={() => setShowAddModal(false)} />}
      {selectedSource && <SourceSettingsDrawer source={selectedSource} onClose={() => setSelectedSource(null)} />}
    </div>
  );
}
