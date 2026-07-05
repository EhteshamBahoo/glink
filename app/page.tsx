"use client";

import { useState, useCallback, useEffect } from "react";
import { applyNodeChanges, applyEdgeChanges, addEdge, Connection, Node, Edge } from '@xyflow/react';
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { ActivityFeed, ActivityLog } from "@/components/activity-feed";
import { WorkflowBuilder, SkillMessage, WorkflowPhase } from "@/components/workflow-builder";
import { GBrainGraph } from "@/components/g-brain-graph";
import { ConnectedApps } from "@/components/connected-apps";
import { PlayCircle, RotateCcw } from "lucide-react";

// ── Workflow Node Definitions ──────────────────────────────────────────────────
const makeInitialNodes = (): Node[] => [
  { id: '1', type: 'workflowNode', position: { x: 250, y: 30  }, data: { label: '/office-hours',     status: 'Pending', duration: '--', progress: 0 } },
  { id: '2', type: 'workflowNode', position: { x: 250, y: 200 }, data: { label: '/plan-ceo-review',  status: 'Pending', duration: '--', progress: 0 } },
  { id: '3', type: 'workflowNode', position: { x: 250, y: 370 }, data: { label: '/plan-eng-review',  status: 'Pending', duration: '--', progress: 0 } },
  { id: '4', type: 'workflowNode', position: { x: 250, y: 540 }, data: { label: 'Implementation',    status: 'Pending', duration: '--', progress: 0 } },
  { id: '5', type: 'workflowNode', position: { x: 250, y: 710 }, data: { label: '/qa',               status: 'Pending', duration: '--', progress: 0 } },
];

const INITIAL_EDGES: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
  { id: 'e3-4', source: '3', target: '4', animated: true },
  { id: 'e4-5', source: '4', target: '5', animated: true },
];

const PHASE_TO_NODE: Record<string, string> = {
  'office-hours': '1',
  'ceo-review': '2',
  'engineering-review': '3',
  'implementation': '4',
  'qa': '5',
};

export default function Workspace() {
  const [activeTab, setActiveTab] = useState<'workflow' | 'gbrain' | 'apps'>('workflow');

  // ── Workflow canvas state ──────────────────────────────────────────────────
  const [workflowNodes, setWorkflowNodes] = useState<Node[]>(makeInitialNodes());
  const [workflowEdges, setWorkflowEdges] = useState<Edge[]>(INITIAL_EDGES);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // ── Skill / Chat state ─────────────────────────────────────────────────────
  const [phase, setPhase] = useState<WorkflowPhase>('idle');
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [skillMessages, setSkillMessages] = useState<SkillMessage[]>([]);

  // ── Metrics ────────────────────────────────────────────────────────────────
  const [metrics, setMetrics] = useState({ tokens: 0, cost: 0, files: 0 });

  const onNodesChange = useCallback((changes: any) => setWorkflowNodes(nds => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: any) => setWorkflowEdges(eds => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params: Connection) => setWorkflowEdges(eds => addEdge(params, eds)), []);

  const updateNode = useCallback((id: string, updates: Partial<any>) => {
    setWorkflowNodes(nds => nds.map(n =>
      n.id === id ? { ...n, data: { ...n.data, ...updates } } : n
    ));
  }, []);

  useEffect(() => {
    const es = new EventSource('/api/events');
    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.kind === 'workflow') {
        const time = new Date(data.ts).toLocaleTimeString();
        if (data.action === 'run_start') {
          setPhase('skill-running');
          setLogs(prev => [...prev, { time, message: data.message, status: data.status }]);
        }
        if (data.action === 'phase_start') {
          const nodeId = PHASE_TO_NODE[data.phase];
          if (nodeId) {
            setActiveNodeId(nodeId);
            setSkillMessages([{ id: Date.now().toString(), sender: 'system', text: data.message }]);
            updateNode(nodeId, { status: 'Running', progress: 0, duration: '...' });
          }
          setLogs(prev => [...prev, { time, message: data.message, status: data.status }]);
        }
        if (data.action === 'progress') {
          const nodeId = PHASE_TO_NODE[data.phase];
          if (nodeId) updateNode(nodeId, { status: 'Running', progress: data.progress });
        }
        if (data.action === 'phase_end') {
          const nodeId = PHASE_TO_NODE[data.phase];
          if (nodeId) {
            updateNode(nodeId, { status: 'Done', progress: 100, duration: data.duration });
          }
          setSkillMessages(prev => [...prev, { id: Date.now().toString() + 'end', sender: 'system', text: data.message }]);
          setLogs(prev => [...prev, { time, message: data.message, status: data.status }]);
        }
        if (data.action === 'write') {
          setSkillMessages(prev => [...prev, { id: Date.now().toString() + 'w', sender: 'skill', text: `Saved output to ${data.path}` }]);
          setLogs(prev => [...prev, { time, message: data.message, status: data.status }]);
          setMetrics(m => ({ ...m, files: m.files + 1, tokens: m.tokens + Math.floor(Math.random() * 2000 + 500), cost: +(m.cost + 0.005 + Math.random() * 0.01).toFixed(3) }));
        }
        if (data.action === 'run_end') {
          setPhase('complete');
          setActiveNodeId(null);
          setLogs(prev => [...prev, { time, message: data.message, status: data.status }]);
        }
      } else if (data.kind === 'log') {
        const time = new Date(data.ts).toLocaleTimeString();
        setSkillMessages(prev => [...prev, { id: Date.now().toString() + Math.random(), sender: data.status === 'error' ? 'system' : 'skill', text: data.message }]);
        setLogs(prev => [...prev, { time, message: data.message, status: data.status }]);
      }
    };
    return () => es.close();
  }, [updateNode]);

  const runExecution = async () => {
    // Reset
    setWorkflowNodes(makeInitialNodes());
    setLogs([]);
    setSkillMessages([]);
    setPhase('idle');
    setActiveNodeId(null);
    setMetrics({ tokens: 0, cost: 0, files: 0 });

    try {
      await fetch('/api/workflow/run', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
  };

  const resetWorkflow = () => {
    setWorkflowNodes(makeInitialNodes());
    setLogs([]);
    setSkillMessages([]);
    setPhase('idle');
    setActiveNodeId(null);
    setMetrics({ tokens: 0, cost: 0, files: 0 });
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-900">
      <TopBar metrics={metrics} phase={phase} />
      <div className="flex flex-1 h-full overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 h-full overflow-hidden">
          {activeTab === 'workflow' && (
            <div className="flex flex-col h-full">
              {/* Top action bar */}
              <div className="flex items-center justify-between px-4 py-2 border-b bg-white shrink-0">
                <div className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Workflow Builder</span>
                  {phase === 'idle' && ' · Click Run Execution to start the live G-Stack agent'}
                  {phase === 'skill-running' && ' · Observing live G-Stack agent execution'}
                  {phase === 'complete' && ' · ✓ Pipeline complete'}
                </div>
                <div className="flex gap-2">
                  {phase !== 'idle' && (
                    <button onClick={resetWorkflow} className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 border px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 transition-all">
                      <RotateCcw className="w-3.5 h-3.5" /> Reset
                    </button>
                  )}
                  <button
                    onClick={runExecution}
                    disabled={phase === 'skill-running'}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-1.5 rounded-lg text-xs font-semibold shadow transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    {phase === 'complete' ? 'Run Again' : 'Run Execution'}
                  </button>
                </div>
              </div>

              {/* Canvas + Skill Chat split */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-hidden">
                  <WorkflowBuilder
                    nodes={workflowNodes}
                    edges={workflowEdges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    setNodes={setWorkflowNodes}
                    setEdges={setWorkflowEdges}
                    onConnect={onConnect}
                    activeNodeId={activeNodeId}
                    phase={phase}
                    skillMessages={skillMessages}
                  />
                </div>
              </div>

              {/* Activity Feed */}
              <div className="h-36 border-t shrink-0">
                <ActivityFeed logs={logs} />
              </div>
            </div>
          )}

          {activeTab === 'gbrain' && <GBrainGraph />}
          {activeTab === 'apps' && <ConnectedApps />}
        </main>
      </div>
    </div>
  );
}
