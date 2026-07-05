"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  addEdge,
  Connection,
  EdgeProps,
  getBezierPath,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Play, FileText, CheckCircle2, Clock, X, ChevronRight, Loader2 } from "lucide-react";

// ── Custom Deletable Edge ─────────────────────────────────────────────────────
function DeletableEdge({
  id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, markerEnd, data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  return (
    <>
      <path id={id} style={style} className="react-flow__edge-path" d={edgePath} markerEnd={markerEnd} />
      <foreignObject
        width={20}
        height={20}
        x={labelX - 10}
        y={labelY - 10}
        className="edgebutton-foreignobject"
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <button
          className="edgebutton"
          onClick={(e) => {
            e.stopPropagation();
            if (data?.onDelete && typeof data.onDelete === 'function') data.onDelete(id);
          }}
          style={{
            width: 20,
            height: 20,
            background: "#ef4444",
            border: "1px solid #dc2626",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 10,
            fontWeight: "bold",
          }}
        >
          ×
        </button>
      </foreignObject>
    </>
  );
}

// ── Custom Workflow Node ──────────────────────────────────────────────────────
function WorkflowNode({ data, id }: { data: any; id: string }) {
  return (
    <div
      className={`w-64 rounded-xl border bg-white shadow-sm overflow-hidden ${
        data.status === "Running" ? "border-blue-400 ring-1 ring-blue-400" : "border-slate-200"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-slate-300 !border-2 !border-white" />
      <div className="p-3 border-b bg-slate-50 flex items-center justify-between">
        <span className="font-semibold text-sm text-slate-800">{data.label}</span>
        <div className="flex items-center gap-1.5">
          {data.status === "Done" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
          {data.status === "Running" && <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />}
          {(data.status === "Waiting" || data.status === "Pending") && <Clock className="w-4 h-4 text-slate-400" />}
          {data.onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); data.onDelete(id); }}
              className="text-slate-300 hover:text-red-500 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <div className="p-3 flex flex-col gap-2 text-xs">
        <div className="flex justify-between items-center text-slate-600">
          <span>
            Status:{" "}
            <strong
              className={
                data.status === "Done"
                  ? "text-green-600"
                  : data.status === "Running"
                  ? "text-blue-600"
                  : ""
              }
            >
              {data.status}
            </strong>
          </span>
          <span>Duration: {data.duration}</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${
              data.status === "Done" ? "bg-green-500" : "bg-blue-500 transition-all duration-1000"
            }`}
            style={{ width: `${data.progress}%` }}
          />
        </div>
        <div className="flex gap-2 mt-2">
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
  "Slack Notification",
  "Design Approval",
  "Custom Python Script",
  "Deploy to AWS",
  "Email Founder",
  "Security Scan",
  "Code Review Gate",
  "Load Test",
];

export function WorkflowBuilder({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  setNodes,
  setEdges,
  onConnect,
}: any) {
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { sender: "Assistant", text: "I'm your Workflow Assistant. Ask me about the pipeline steps, how to connect nodes, or what each stage does in the G-Stack lifecycle." },
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const deleteEdge = useCallback(
    (edgeId: string) => {
      setEdges((eds: any[]) => eds.filter((e) => e.id !== edgeId));
    },
    [setEdges]
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds: any[]) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds: any[]) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    },
    [setNodes, setEdges]
  );

  // Inject delete callbacks into nodes and edges
  const nodesWithDelete = nodes.map((n: any) => ({
    ...n,
    data: { ...n.data, onDelete: deleteNode },
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

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();
      const label = event.dataTransfer.getData("application/label");
      if (!label) return;
      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left - 128,
        y: event.clientY - reactFlowBounds.top - 40,
      };
      const newNode = {
        id: `dndnode_${Date.now()}`,
        type: "workflowNode",
        position,
        data: { label, status: "Waiting", duration: "--", progress: 0 },
      };
      setNodes((nds: any) => nds.concat(newNode));
    },
    [setNodes]
  );

  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { sender: "User", text: msg }]);
    setChatLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      setChatMessages((prev) => [...prev, { sender: "Assistant", text: data.reply }]);
    } catch {
      setChatMessages((prev) => [...prev, { sender: "Assistant", text: "Error connecting to API." }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full">
      {/* Node Palette */}
      <div className="w-48 border-r bg-white flex flex-col h-full shrink-0">
        <div className="px-4 pt-4 pb-2 border-b">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Custom Steps</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Drag onto canvas</div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {CUSTOM_STEPS.map((step) => (
            <div
              key={step}
              className="p-2.5 text-xs border rounded-lg bg-slate-50 text-slate-700 cursor-grab hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 shadow-sm transition-all active:cursor-grabbing"
              draggable
              onDragStart={(e) => onDragStart(e, step)}
            >
              {step}
            </div>
          ))}
        </div>
        <div className="p-3 border-t bg-slate-50">
          <div className="text-[9px] text-slate-400 text-center">Drag step → canvas<br/>Draw edge from ● to ●<br/>× button to delete</div>
        </div>
      </div>

      {/* Main Area: Canvas + Chat */}
      <div className="flex-1 flex flex-col h-full">
        {/* Canvas */}
        <div className="flex-1" onDrop={onDrop} onDragOver={onDragOver}>
          <ReactFlow
            nodes={nodesWithDelete}
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

        {/* Workflow Chat — embedded at bottom */}
        <div className="h-56 border-t flex flex-col bg-white shrink-0">
          <div className="px-4 py-2.5 border-b bg-slate-50 shrink-0 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <div className="text-sm font-semibold text-slate-700">Workflow Assistant</div>
            <span className="text-xs text-slate-400 ml-auto">Ask about the G-Stack pipeline</span>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {chatMessages.map((m, i) => (
              <div key={i} className="flex flex-col gap-0.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${m.sender === "User" ? "text-blue-500" : "text-slate-500"}`}>
                  {m.sender}
                </span>
                <span className="text-xs text-slate-700 leading-relaxed">{m.text}</span>
              </div>
            ))}
            {chatLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="px-4 pb-3 shrink-0">
            <div className="flex items-center gap-2 bg-slate-50 border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:border-blue-500 transition-all">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
                placeholder="Ask about the pipeline..."
                className="flex-1 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 outline-none"
              />
              <button onClick={handleChatSend} disabled={!chatInput.trim() || chatLoading} className="text-blue-500 hover:text-blue-600 disabled:opacity-30">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
