"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { applyNodeChanges, applyEdgeChanges, addEdge, Connection, Node, Edge } from '@xyflow/react';
import { io as connectSocket, Socket } from "socket.io-client";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { ActivityFeed, ActivityLog } from "@/components/activity-feed";
import { LiveAssistant, ChatMessage, ToolUseEvent } from "@/components/live-assistant";
import { WorkflowBuilder } from "@/components/workflow-builder";
import { GBrainGraph } from "@/components/g-brain-graph";
import { ConnectedApps } from "@/components/connected-apps";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { PlayCircle } from "lucide-react";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";

const initialWorkflowNodes: Node[] = [
  { id: '1', type: 'workflowNode', position: { x: 250, y: 50 }, data: { label: '/office-hours', status: 'Pending', duration: '--', progress: 0 } },
  { id: '2', type: 'workflowNode', position: { x: 250, y: 220 }, data: { label: 'CEO Review', status: 'Pending', duration: '--', progress: 0 } },
  { id: '3', type: 'workflowNode', position: { x: 250, y: 390 }, data: { label: 'Engineering Review', status: 'Pending', duration: '--', progress: 0 } },
  { id: '4', type: 'workflowNode', position: { x: 250, y: 560 }, data: { label: 'Implementation', status: 'Pending', duration: '--', progress: 0 } },
  { id: '5', type: 'workflowNode', position: { x: 250, y: 730 }, data: { label: 'QA', status: 'Pending', duration: '--', progress: 0 } },
];

const initialWorkflowEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
  { id: 'e3-4', source: '3', target: '4', animated: true },
  { id: 'e4-5', source: '4', target: '5', animated: true },
];

// Derives run order from the graph via a topological sort over edges
// (source -> target). Nodes unreachable from any root (disconnected
// islands, e.g. a freshly dragged node with no connections) run last,
// in their array order.
function computeStepOrder(nodes: Node[], edges: Edge[]): Node[] {
  const incoming = new Map<string, number>();
  const adjacency = new Map<string, string[]>();
  nodes.forEach((n) => {
    incoming.set(n.id, 0);
    adjacency.set(n.id, []);
  });
  edges.forEach((e) => {
    if (!adjacency.has(e.source) || !incoming.has(e.target)) return;
    adjacency.get(e.source)!.push(e.target);
    incoming.set(e.target, (incoming.get(e.target) ?? 0) + 1);
  });

  const queue = nodes.filter((n) => incoming.get(n.id) === 0).map((n) => n.id);
  const order: string[] = [];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    order.push(id);
    for (const next of adjacency.get(id) || []) {
      incoming.set(next, (incoming.get(next) ?? 0) - 1);
      if (incoming.get(next) === 0) queue.push(next);
    }
  }
  nodes.forEach((n) => {
    if (!visited.has(n.id)) order.push(n.id);
  });

  const byId = new Map(nodes.map((n) => [n.id, n]));
  return order.map((id) => byId.get(id)).filter((n): n is Node => Boolean(n));
}

export default function Workspace() {
  const [activeTab, setActiveTab] = useState<'workflow' | 'gbrain' | 'apps'>('workflow');
  
  // States
  const [workflowNodes, setWorkflowNodes] = useState<Node[]>(initialWorkflowNodes);
  const [workflowEdges, setWorkflowEdges] = useState<Edge[]>(initialWorkflowEdges);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([{ id: 'init', sender: 'Assistant', text: 'Waiting for pipeline execution...' }]);
  const [recentFiles, setRecentFiles] = useState<string[]>([]);
  
  const [isRunning, setIsRunning] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const currentRunIdRef = useRef<string | null>(null);
  // Maps a tool_use id to the chat message rendering it, so the matching
  // tool_result event can flip that same card from "running" to "done"/"error".
  const toolUseMapRef = useRef<Record<string, { msgId: string; name: string; input: any }>>({});

  const onNodesChange = useCallback((changes: any) => setWorkflowNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: any) => setWorkflowEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params: Connection) => setWorkflowEdges((eds) => addEdge(params, eds)), []);

  const addLog = useCallback((message: string, status: ActivityLog['status']) => {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message, status }]);
  }, []);

  const addChatText = useCallback((text: string) => {
    setChatMessages(prev => [...prev, { id: crypto.randomUUID(), sender: 'Assistant', text }]);
  }, []);

  const addChatNode = useCallback((id: string, node: React.ReactNode) => {
    setChatMessages(prev => [...prev, { id, sender: 'Assistant', text: node }]);
  }, []);

  // Turns one parsed stream-json event from a real Claude Code process into
  // chat panel content: assistant text becomes a bubble, tool_use becomes a
  // distinct compact card, and its matching tool_result flips that card's status.
  const handleClaudeEvent = useCallback((evt: any) => {
    if (evt.type === 'system' && evt.subtype === 'init') {
      addLog(`Session started (${String(evt.session_id).slice(0, 8)})`, 'info');
      return;
    }

    if (evt.type === 'assistant') {
      const parts = evt.message?.content || [];
      for (const part of parts) {
        if (part.type === 'text' && part.text?.trim()) {
          addChatText(part.text);
        } else if (part.type === 'tool_use') {
          const msgId = crypto.randomUUID();
          toolUseMapRef.current[part.id] = { msgId, name: part.name, input: part.input };
          addChatNode(msgId, <ToolUseEvent name={part.name} input={part.input} status="running" />);
          addLog(`tool_use: ${part.name}`, 'running');
        }
      }
      return;
    }

    if (evt.type === 'user') {
      const parts = evt.message?.content || [];
      for (const part of parts) {
        if (part.type === 'tool_result') {
          const entry = toolUseMapRef.current[part.tool_use_id];
          if (entry) {
            const status = part.is_error ? 'error' : 'done';
            setChatMessages(prev => prev.map(m => m.id === entry.msgId
              ? { ...m, text: <ToolUseEvent name={entry.name} input={entry.input} status={status} /> }
              : m));
          }
        }
      }
      return;
    }

    if (evt.type === 'result' && evt.subtype !== 'success') {
      addLog(`error: ${evt.result || 'claude reported an error'}`, 'error');
    }
  }, [addLog, addChatText, addChatNode]);

  useEffect(() => {
    const socket = connectSocket(SERVER_URL);
    socketRef.current = socket;

    socket.on('workflow:step-status', ({ runId, stepId, status, duration, error }: any) => {
      if (runId !== currentRunIdRef.current) return;
      const label = status === 'done' ? 'Done' : status === 'error' ? 'Error' : 'Running';
      const progress = status === 'running' ? 50 : 100;
      setWorkflowNodes(nds => nds.map(n => n.id === stepId
        ? { ...n, data: { ...n.data, status: label, progress, duration: duration ?? n.data.duration } }
        : n));
      if (status === 'running') addLog(`${stepId}: step started`, 'running');
      if (status === 'done') addLog(`${stepId}: step completed (${duration})`, 'success');
      if (status === 'error') addLog(`${stepId}: step failed — ${error}`, 'error');
    });

    socket.on('workflow:event', ({ runId, event }: any) => {
      if (runId !== currentRunIdRef.current) return;
      handleClaudeEvent(event);
    });

    socket.on('workflow:run-complete', ({ runId, status }: any) => {
      if (runId !== currentRunIdRef.current) return;
      setIsRunning(false);
      addLog(`Workflow run ${status === 'success' ? 'completed' : 'failed'}`, status === 'success' ? 'success' : 'error');
    });

    socket.on('chat:event', ({ event }: any) => handleClaudeEvent(event));
    socket.on('chat:done', ({ status, error }: any) => {
      setIsChatLoading(false);
      if (status === 'error') addChatText(`Error: ${error}`);
    });

    return () => {
      socket.disconnect();
    };
  }, [addLog, addChatText, handleClaudeEvent]);

  const runWorkflow = async () => {
    if (isRunning) return;
    const steps = computeStepOrder(workflowNodes, workflowEdges).map(n => ({ id: n.id, label: n.data.label as string }));
    if (steps.length === 0) return;

    setIsRunning(true);
    toolUseMapRef.current = {};
    setWorkflowNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, status: 'Pending', progress: 0, duration: '--' } })));
    setLogs([{ time: new Date().toLocaleTimeString(), message: `Triggered workflow execution (${steps.length} steps)`, status: 'info' }]);
    setChatMessages([]);
    setRecentFiles([]);

    try {
      const res = await fetch(`${SERVER_URL}/api/execute-workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steps }),
      });
      if (!res.ok) throw new Error(`server responded ${res.status}`);
      const data = await res.json();
      currentRunIdRef.current = data.runId;
    } catch (err) {
      setIsRunning(false);
      addLog(`Failed to start workflow: ${err}`, 'error');
    }
  };

  const sendChatMessage = async (text: string) => {
    setChatMessages(prev => [...prev, { id: crypto.randomUUID(), sender: 'User', text }]);
    setIsChatLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/api/chat-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) throw new Error(`server responded ${res.status}`);
    } catch (err) {
      setIsChatLoading(false);
      addChatText(`Error connecting to backend: ${err}`);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-900">
      <TopBar />
      <div className="flex flex-1 h-full overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 h-full">
          <ResizablePanelGroup orientation="horizontal" className="h-full w-full">
            <ResizablePanel defaultSize={75} minSize={50} className="flex flex-col h-full bg-white relative">
              {/* Run Execution Button inside Workspace */}
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button
                  onClick={runWorkflow}
                  disabled={isRunning}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <PlayCircle className="w-4 h-4" /> {isRunning ? 'Running…' : 'Run Execution'}
                </button>
              </div>

              <ResizablePanelGroup orientation="vertical" className="h-full w-full">
                <ResizablePanel defaultSize={70} minSize={40}>
                  {activeTab === 'workflow' ? (
                    <WorkflowBuilder 
                      nodes={workflowNodes} 
                      edges={workflowEdges} 
                      onNodesChange={onNodesChange} 
                      onEdgesChange={onEdgesChange} 
                      setNodes={setWorkflowNodes}
                      onConnect={onConnect}
                    />
                  ) : activeTab === 'gbrain' ? (
                    <GBrainGraph />
                  ) : (
                    <ConnectedApps />
                  )}
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={30} minSize={15}>
                  <ActivityFeed logs={logs} />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>

            <ResizableHandle withHandle />
            
            <ResizablePanel defaultSize={25} minSize={15}>
              <LiveAssistant
                messages={chatMessages}
                recentFiles={recentFiles}
                onSend={sendChatMessage}
                isLoading={isChatLoading}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </main>
      </div>
    </div>
  );
}
