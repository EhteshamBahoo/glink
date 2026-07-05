"use client";

import { useCallback, useRef, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  EdgeProps,
  getBezierPath,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Play, FileText, CheckCircle2, Clock, X, ChevronRight, Loader2 } from "lucide-react";
import { SKILL_DEFINITIONS } from "@/data/skill-definitions";

// ── Types ─────────────────────────────────────────────────────────────────────
export type SkillMessage = {
  id: string;
  sender: 'skill' | 'user' | 'system';
  text: string;
};

export type WorkflowPhase =
  | 'idle'
  | 'skill-waiting'   // no longer used since it's real
  | 'skill-running'   // analytical/progress steps: auto-playing
  | 'complete';

// ── Custom Deletable Edge ─────────────────────────────────────────────────────
function DeletableEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, markerEnd, data }: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  return (
    <>
      <path id={id} style={style} className="react-flow__edge-path" d={edgePath} markerEnd={markerEnd} />
      <foreignObject width={20} height={20} x={labelX - 10} y={labelY - 10}>
        <button
          onClick={(e) => { e.stopPropagation(); if (data?.onDelete && typeof data.onDelete === 'function') data.onDelete(id); }}
          style={{
            width: 20, height: 20, background: "#ef4444", border: "1px solid #dc2626",
            borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", color: "white", fontSize: 11, fontWeight: "bold",
          }}
        >×</button>
      </foreignObject>
    </>
  );
}

// ── Custom Workflow Node ──────────────────────────────────────────────────────
function WorkflowNode({ data, id }: { data: any; id: string }) {
  const isActive = data.isActiveSkill;
  const skill = SKILL_DEFINITIONS[id];
  const accentBorder = isActive && skill ? skill.borderColor : data.status === 'Running' ? 'border-blue-400' : 'border-slate-200';
  const ring = isActive && skill ? `ring-2 ${skill.borderColor.replace('border-', 'ring-')}` : data.status === 'Running' ? 'ring-1 ring-blue-400' : '';

  return (
    <div className={`w-64 rounded-xl border bg-white shadow-sm overflow-hidden ${accentBorder} ${ring}`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-slate-300 !border-2 !border-white" />
      <div className={`p-3 border-b flex items-center justify-between ${isActive && skill ? skill.bgColor : 'bg-slate-50'}`}>
        <span className="font-semibold text-sm text-slate-800">{data.label}</span>
        <div className="flex items-center gap-1.5">
          {data.status === 'Done' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
          {data.status === 'Running' && !isActive && <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />}
          {isActive && <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" title="Executing" />}
          {(data.status === 'Waiting' || data.status === 'Pending') && !isActive && <Clock className="w-4 h-4 text-slate-400" />}
          {data.onDelete && (
            <button onClick={(e) => { e.stopPropagation(); data.onDelete(id); }} className="text-slate-300 hover:text-red-500 transition-colors ml-1">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <div className="p-3 flex flex-col gap-2 text-xs">
        <div className="flex justify-between items-center text-slate-600">
          <span>Status: <strong className={data.status === 'Done' ? 'text-green-600' : data.status === 'Running' || isActive ? 'text-blue-600' : ''}>
            {data.status}
          </strong></span>
          <span>Duration: {data.duration}</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full ${data.status === 'Done' ? 'bg-green-500' : 'bg-blue-500'} transition-all duration-1000`}
            style={{ width: `${data.progress}%` }} />
        </div>
        <div className="flex gap-2 mt-1">
          <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors">
            <FileText className="w-3.5 h-3.5" /> MD Output
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors">
            <Play className="w-3.5 h-3.5" /> Open Log
          </button>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-slate-300 !border-2 !border-white" />
    </div>
  );
}

const nodeTypes = { workflowNode: WorkflowNode };
const edgeTypes = { deletableEdge: DeletableEdge };

const CUSTOM_STEPS = [
  "Slack Notification", "Design Approval", "Custom Python Script",
  "Deploy to AWS", "Email Founder", "Security Scan", "Code Review Gate", "Load Test",
];

// ── Skill Chat Panel ──────────────────────────────────────────────────────────
function SkillChatPanel({
  activeNodeId,
  phase,
  messages,
}: {
  activeNodeId: string | null;
  phase: WorkflowPhase;
  messages: SkillMessage[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const skill = activeNodeId ? SKILL_DEFINITIONS[activeNodeId] : null;

  if (phase === 'idle') {
    return (
      <div className="h-64 border-t flex flex-col bg-white shrink-0">
        <div className="px-4 py-3 border-b bg-slate-50 flex items-center gap-2 shrink-0">
          <div className="w-2 h-2 rounded-full bg-slate-300" />
          <span className="text-sm font-semibold text-slate-500">Live Agent Console</span>
          <span className="text-xs text-slate-400 ml-auto">Idle — click Run Execution to start</span>
        </div>
        <div className="flex-1 flex items-center justify-center text-slate-400 text-xs text-center p-4">
          This console will show the real-time execution logs from the active G-Stack agent.
        </div>
      </div>
    );
  }

  return (
    <div className={`h-72 border-t flex flex-col shrink-0 ${skill?.bgColor || 'bg-white'}`}>
      {/* Skill Header */}
      <div className={`px-4 py-2.5 border-b flex items-center gap-2 shrink-0 ${skill ? skill.headerBg : 'bg-slate-700'}`}>
        <span className="text-base">{skill?.emoji || '⚙️'}</span>
        <span className="text-sm font-bold text-white">{skill?.label || 'Workflow'}</span>
        {phase === 'skill-running' && (
          <span className="ml-auto text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full flex items-center gap-1.5">
            <Loader2 className="w-3 h-3 animate-spin" /> RUNNING
          </span>
        )}
        {phase === 'complete' && (
          <span className="ml-auto text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">
            ✓ COMPLETE
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-white/60" ref={scrollRef}>
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col gap-0.5 items-start`}>
            <span className={`text-[9px] font-bold uppercase tracking-wider ${
              m.sender === 'system' ? 'text-green-600' :
              skill?.accentColor || 'text-slate-600'
            }`}>
              {m.sender === 'system' ? '✓ System' : skill?.label || 'Agent'}
            </span>
            <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
              m.sender === 'system'
                ? 'bg-green-50 text-green-800 border border-green-200 rounded-tl-sm'
                : `bg-white border ${skill?.borderColor || 'border-slate-200'} text-slate-800 rounded-tl-sm shadow-sm font-mono text-[11px]`
            }`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Placeholder */}
      <div className="px-4 pb-3 pt-2 shrink-0 bg-white border-t">
        <div className="text-[10px] text-center text-slate-400 py-1">
          {phase === 'skill-running' ? 'Agent is executing automatically...' : phase === 'complete' ? '✓ All workflow steps complete.' : ''}
        </div>
      </div>
    </div>
  );
}

// ── Main WorkflowBuilder ──────────────────────────────────────────────────────
export function WorkflowBuilder({
  nodes, edges, onNodesChange, onEdgesChange, setNodes, setEdges, onConnect,
  activeNodeId, phase, skillMessages,
}: any) {

  const deleteEdge = useCallback((edgeId: string) => {
    setEdges((eds: any[]) => eds.filter((e) => e.id !== edgeId));
  }, [setEdges]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds: any[]) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds: any[]) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
  }, [setNodes, setEdges]);

  const nodesWithMeta = nodes.map((n: any) => ({
    ...n,
    data: { ...n.data, onDelete: deleteNode, isActiveSkill: n.id === activeNodeId && phase === 'skill-running' },
  }));

  const edgesWithDelete = edges.map((e: any) => ({
    ...e,
    type: "deletableEdge",
    data: { onDelete: deleteEdge },
    animated: e.animated ?? true,
    style: { stroke: "#94a3b8", strokeWidth: 2 },
  }));

  const onDragStart = (event: any, label: string) => {
    event.dataTransfer.setData("application/reactflow", "workflowNode");
    event.dataTransfer.setData("application/label", label);
    event.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback((event: any) => {
    event.preventDefault();
    const label = event.dataTransfer.getData("application/label");
    if (!label) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const position = { x: event.clientX - bounds.left - 128, y: event.clientY - bounds.top - 40 };
    setNodes((nds: any) => nds.concat({
      id: `dndnode_${Date.now()}`, type: "workflowNode", position,
      data: { label, status: "Waiting", duration: "--", progress: 0 },
    }));
  }, [setNodes]);

  return (
    <div className="flex h-full w-full">
      {/* Node Palette */}
      <div className="w-44 border-r bg-white flex flex-col h-full shrink-0">
        <div className="px-3 pt-4 pb-2 border-b">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Custom Steps</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Drag onto canvas</div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {CUSTOM_STEPS.map(step => (
            <div key={step}
              className="p-2 text-xs border rounded-lg bg-slate-50 text-slate-700 cursor-grab hover:border-blue-300 hover:bg-blue-50 shadow-sm transition-all"
              draggable onDragStart={(e) => onDragStart(e, step)}
            >
              {step}
            </div>
          ))}
        </div>
        <div className="p-2 border-t bg-slate-50">
          <div className="text-[9px] text-slate-400 text-center">Drag ● to ● to connect<br/>× or Backspace to delete</div>
        </div>
      </div>

      {/* Canvas + Skill Chat */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex-1" onDrop={onDrop} onDragOver={onDragOver}>
          <ReactFlow
            nodes={nodesWithMeta}
            edges={edgesWithDelete}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            deleteKeyCode={["Backspace", "Delete"]}
            fitView
          >
            <Background color="#e2e8f0" gap={20} />
            <Controls />
          </ReactFlow>
        </div>

        <SkillChatPanel
          activeNodeId={activeNodeId}
          phase={phase}
          messages={skillMessages}
        />
      </div>
    </div>
  );
}
