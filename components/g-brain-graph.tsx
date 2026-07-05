"use client";

import { useState, useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  MiniMap,
  useNodesState,
  useEdgesState,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { BRAIN_FILES, getFilesByTier, BrainFile } from "@/data/brain-files";
import { X, FileText, Loader2, ChevronRight } from "lucide-react";

// ── Tier color palette ──────────────────────────────────────────────────────
const TIER_COLORS = {
  1: { bg: "#f59e0b", border: "#d97706", glow: "rgba(245,158,11,0.4)", text: "#78350f", label: "Core Strategy" },
  2: { bg: "#6366f1", border: "#4f46e5", glow: "rgba(99,102,241,0.35)", text: "#312e81", label: "Team & Dept" },
  3: { bg: "#22c55e", border: "#16a34a", glow: "rgba(34,197,94,0.3)", text: "#14532d", label: "Operational" },
};

// ── Custom Node ──────────────────────────────────────────────────────────────
function FileNode({ data }: { data: any }) {
  const colors = TIER_COLORS[data.tier as keyof typeof TIER_COLORS];
  return (
    <div
      onClick={() => data.onClick(data.file)}
      style={{
        background: "#ffffff",
        border: `2px solid ${colors.border}`,
        boxShadow: `0 0 12px ${colors.glow}, 0 2px 8px rgba(0,0,0,0.08)`,
        borderRadius: 10,
        padding: "6px 10px",
        cursor: "pointer",
        minWidth: 130,
        maxWidth: 160,
        transition: "all 0.15s",
      }}
      className="hover:scale-105"
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: colors.bg,
            boxShadow: `0 0 6px ${colors.glow}`,
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 11, fontWeight: 600, color: "#1e293b", lineHeight: 1.3 }}>
          {data.label}
        </span>
      </div>
      <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 2, marginLeft: 14 }}>
        {data.category}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
}

// ── Tier Hub Node ────────────────────────────────────────────────────────────
function TierNode({ data }: { data: any }) {
  const colors = TIER_COLORS[data.tier as keyof typeof TIER_COLORS];
  return (
    <div
      onClick={() => data.onClick(data.tier)}
      style={{
        background: colors.bg,
        border: `3px solid ${colors.border}`,
        boxShadow: `0 0 24px ${colors.glow}, 0 4px 16px rgba(0,0,0,0.15)`,
        borderRadius: 16,
        padding: "10px 18px",
        cursor: "pointer",
        minWidth: 160,
        textAlign: "center",
        transition: "all 0.15s",
      }}
      className="hover:scale-105"
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div style={{ fontSize: 10, fontWeight: 700, color: colors.text, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        Tier {data.tier}
      </div>
      <div style={{ fontSize: 13, fontWeight: 800, color: colors.text, marginTop: 2 }}>
        {colors.label}
      </div>
      <div style={{ fontSize: 10, color: colors.text, opacity: 0.7, marginTop: 1 }}>
        {data.count} files · click to summarize
      </div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
}

const nodeTypes = { fileNode: FileNode, tierNode: TierNode };

// ── Layout: concentric rings around a center ─────────────────────────────────
function buildGraph(onFileClick: (f: BrainFile) => void, onTierClick: (t: number) => void) {
  const nodes: any[] = [];
  const edges: any[] = [];

  // Center project node
  nodes.push({
    id: "center",
    type: "default",
    position: { x: 0, y: 0 },
    data: { label: "AI Employee\nProgress Tracking" },
    style: {
      background: "#0f172a",
      color: "#f8fafc",
      border: "3px solid #334155",
      borderRadius: 20,
      padding: "12px 20px",
      fontWeight: 800,
      fontSize: 13,
      boxShadow: "0 0 40px rgba(15,23,42,0.4)",
      textAlign: "center",
      width: 170,
      whiteSpace: "pre-line",
    },
  });

  const TIER_POSITIONS = [
    { radius: 280, yOffset: -20 },  // Tier 1
    { radius: 520, yOffset: 0 },    // Tier 2
    { radius: 760, yOffset: 0 },    // Tier 3
  ];

  [1, 2, 3].forEach((tier) => {
    const files = getFilesByTier(tier as 1 | 2 | 3);
    const { radius, yOffset } = TIER_POSITIONS[tier - 1];
    const angleStep = (2 * Math.PI) / files.length;

    // Tier hub
    const hubId = `tier-${tier}`;
    const hubAngle = -Math.PI / 2; // top
    nodes.push({
      id: hubId,
      type: "tierNode",
      position: { x: radius * Math.cos(hubAngle), y: radius * Math.sin(hubAngle) + yOffset },
      data: { tier, count: files.length, onClick: onTierClick },
    });

    edges.push({
      id: `center-${hubId}`,
      source: "center",
      target: hubId,
      style: { stroke: TIER_COLORS[tier as keyof typeof TIER_COLORS].border, strokeWidth: 2, opacity: 0.6 },
      animated: tier === 1,
    });

    files.forEach((file, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle) + yOffset;

      nodes.push({
        id: file.id,
        type: "fileNode",
        position: { x, y },
        data: {
          label: file.name.replace(".md", ""),
          category: file.category,
          tier: file.tier,
          file,
          onClick: onFileClick,
        },
      });

      edges.push({
        id: `hub-${file.id}`,
        source: hubId,
        target: file.id,
        style: {
          stroke: TIER_COLORS[tier as keyof typeof TIER_COLORS].bg,
          strokeWidth: 1.5,
          opacity: 0.5,
        },
      });
    });
  });

  return { nodes, edges };
}

// ── Main Component ────────────────────────────────────────────────────────────
export function GBrainGraph() {
  const [selectedFile, setSelectedFile] = useState<BrainFile | null>(null);
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string }[]>([
    { sender: "Assistant", text: "Click any node or tier in the G-Brain graph to get an AI-generated summary. You can also ask me questions about the knowledge base." }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  const handleFileClick = useCallback(async (file: BrainFile) => {
    setSelectedFile(file);
    setSelectedTier(null);
    setSummary("");
    setLoading(true);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "file_summary", file }),
      });
      const data = await res.json();
      setSummary(data.summary || "Unable to generate summary.");
    } catch {
      setSummary("Error generating summary. Check API connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleTierClick = useCallback(async (tier: number) => {
    setSelectedTier(tier);
    setSelectedFile(null);
    setSummary("");
    setLoading(true);
    const tierFiles = getFilesByTier(tier as 1 | 2 | 3);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "tier_summary", tier, tierFiles }),
      });
      const data = await res.json();
      setSummary(data.summary || "Unable to generate summary.");
    } catch {
      setSummary("Error generating summary.");
    } finally {
      setLoading(false);
    }
  }, []);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildGraph(handleFileClick, handleTierClick),
    [handleFileClick, handleTierClick]
  );

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { sender: "User", text: msg }]);
    setChatLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { sender: "Assistant", text: data.reply }]);
    } catch {
      setChatMessages(prev => [...prev, { sender: "Assistant", text: "Error connecting to G-Brain API." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const tierColors = TIER_COLORS;

  return (
    <div className="flex h-full w-full bg-[#0a0f1e] overflow-hidden">
      {/* Graph Canvas */}
      <div className="flex-1 h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          style={{ background: "#0a0f1e" }}
          minZoom={0.1}
          maxZoom={2}
        >
          <Background color="#1e293b" gap={32} size={1} />
          <Controls style={{ background: "#1e293b", border: "1px solid #334155" }} />
          <MiniMap
            style={{ background: "#1e293b", border: "1px solid #334155" }}
            nodeColor={(n) => {
              if (n.type === "fileNode") return tierColors[n.data?.tier as keyof typeof tierColors]?.bg || "#6b7280";
              if (n.type === "tierNode") return tierColors[n.data?.tier as keyof typeof tierColors]?.bg || "#6b7280";
              return "#0f172a";
            }}
          />
          <Panel position="top-left">
            <div className="bg-[#1e293b]/90 border border-[#334155] rounded-xl p-4 backdrop-blur-sm">
              <div className="text-white font-bold text-sm mb-3">G-Brain Knowledge Graph</div>
              <div className="text-slate-400 text-xs mb-3">AI Employee Progress Tracking — {BRAIN_FILES.length} documents</div>
              <div className="space-y-2">
                {([1, 2, 3] as const).map(t => (
                  <div key={t} className="flex items-center gap-2 cursor-pointer" onClick={() => handleTierClick(t)}>
                    <div className="w-3 h-3 rounded-full" style={{ background: tierColors[t].bg, boxShadow: `0 0 6px ${tierColors[t].glow}` }} />
                    <span className="text-xs text-slate-300">Tier {t}: {tierColors[t].label}</span>
                    <span className="text-xs text-slate-500">({getFilesByTier(t).length})</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Right Panel: Summary + Chat */}
      <div className="w-96 h-full flex flex-col border-l border-[#1e293b] bg-[#0d1424]">
        {/* Summary Panel */}
        <div className="flex-1 overflow-y-auto p-5 border-b border-[#1e293b]">
          {!selectedFile && !selectedTier && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#1e293b] flex items-center justify-center">
                <FileText className="w-8 h-8 text-slate-500" />
              </div>
              <div>
                <div className="text-slate-300 font-semibold text-sm">Select a node to explore</div>
                <div className="text-slate-500 text-xs mt-1">Click any file or tier hub to get an AI-generated summary</div>
              </div>
            </div>
          )}

          {selectedFile && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: tierColors[selectedFile.tier].bg }} />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tier {selectedFile.tier} · {selectedFile.category}</span>
                  </div>
                  <div className="font-bold text-white text-base">{selectedFile.name}</div>
                </div>
                <button onClick={() => { setSelectedFile(null); setSummary(""); }} className="text-slate-500 hover:text-white p-1 mt-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {loading ? (
                <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating summary...
                </div>
              ) : summary ? (
                <div className="bg-[#1e293b] rounded-xl p-4 border border-[#334155]">
                  <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">AI Summary</div>
                  <p className="text-slate-300 text-sm leading-relaxed">{summary}</p>
                </div>
              ) : null}

              <div className="bg-[#1e293b] rounded-xl p-4 border border-[#334155]">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Raw Content</div>
                <pre className="text-slate-400 text-xs leading-relaxed whitespace-pre-wrap font-mono overflow-y-auto max-h-60">
                  {selectedFile.content}
                </pre>
              </div>
            </div>
          )}

          {selectedTier && !selectedFile && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: tierColors[selectedTier as keyof typeof tierColors].bg }} />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tier {selectedTier} Overview</span>
                  </div>
                  <div className="font-bold text-white text-base">{tierColors[selectedTier as keyof typeof tierColors].label}</div>
                  <div className="text-slate-500 text-xs mt-0.5">{getFilesByTier(selectedTier as 1 | 2 | 3).length} documents</div>
                </div>
                <button onClick={() => { setSelectedTier(null); setSummary(""); }} className="text-slate-500 hover:text-white p-1 mt-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {loading ? (
                <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
                  <Loader2 className="w-4 h-4 animate-spin" /> Analyzing {getFilesByTier(selectedTier as 1 | 2 | 3).length} files...
                </div>
              ) : summary ? (
                <div className="bg-[#1e293b] rounded-xl p-4 border border-[#334155]">
                  <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">AI Tier Summary</div>
                  <p className="text-slate-300 text-sm leading-relaxed">{summary}</p>
                </div>
              ) : null}

              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Files in this tier</div>
                {getFilesByTier(selectedTier as 1 | 2 | 3).map(f => (
                  <div
                    key={f.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#1e293b] cursor-pointer group"
                    onClick={() => handleFileClick(f)}
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
                    <span className="text-slate-400 text-xs group-hover:text-slate-200 flex-1">{f.name}</span>
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chat Panel */}
        <div className="h-72 flex flex-col bg-[#0a0f1e]">
          <div className="px-4 py-3 border-b border-[#1e293b] shrink-0">
            <div className="text-slate-200 font-semibold text-sm">G-Brain Assistant</div>
            <div className="text-slate-500 text-xs">Ask about any document or knowledge pattern</div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {chatMessages.map((m, i) => (
              <div key={i}>
                <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${m.sender === "User" ? "text-indigo-400" : "text-amber-400"}`}>{m.sender}</div>
                <div className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">{m.text}</div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
              </div>
            )}
          </div>
          <div className="px-4 pb-4 shrink-0">
            <div className="flex items-center gap-2 bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 focus-within:border-indigo-500 transition-colors">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleChatSend()}
                placeholder="Ask about G-Brain..."
                className="flex-1 bg-transparent text-xs text-slate-200 placeholder:text-slate-600 outline-none"
              />
              <button onClick={handleChatSend} disabled={!chatInput.trim() || chatLoading} className="text-indigo-400 hover:text-indigo-300 disabled:opacity-30">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
