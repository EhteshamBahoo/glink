"use client";

import { useState, useCallback } from "react";
import { applyNodeChanges, applyEdgeChanges, addEdge, Connection, Node, Edge } from '@xyflow/react';
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { ActivityFeed, ActivityLog } from "@/components/activity-feed";
import { WorkflowBuilder } from "@/components/workflow-builder";
import { GBrainGraph } from "@/components/g-brain-graph";
import { ConnectedApps } from "@/components/connected-apps";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { PlayCircle } from "lucide-react";

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

export default function Workspace() {
  const [activeTab, setActiveTab] = useState<'workflow' | 'gbrain' | 'apps'>('workflow');
  
  const [workflowNodes, setWorkflowNodes] = useState<Node[]>(initialWorkflowNodes);
  const [workflowEdges, setWorkflowEdges] = useState<Edge[]>(initialWorkflowEdges);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  
  const onNodesChange = useCallback((changes: any) => setWorkflowNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: any) => setWorkflowEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params: Connection) => setWorkflowEdges((eds) => addEdge(params, eds)), []);

  const runDemo = () => {
    setWorkflowNodes(initialWorkflowNodes.map(n => ({ ...n, data: { ...n.data, status: 'Pending', progress: 0, duration: '--' } })));
    setLogs([{ time: new Date().toLocaleTimeString(), message: 'Triggered pipeline execution', status: 'info' }]);

    const updateNode = (id: string, status: string, progress: number, duration: string) => {
      setWorkflowNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, status, progress, duration } } : n));
    };
    const addLog = (message: string, status: any) => {
      setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message, status }]);
    };

    setTimeout(() => { updateNode('1', 'Running', 50, '12s'); addLog('/office-hours started...', 'running'); }, 1000);
    setTimeout(() => { updateNode('1', 'Done', 100, '32s'); updateNode('2', 'Running', 20, '4s'); addLog('/office-hours completed', 'success'); addLog('CEO Review started', 'running'); }, 4000);
    setTimeout(() => { updateNode('2', 'Done', 100, '45s'); updateNode('3', 'Running', 10, '2s'); addLog('CEO Review completed', 'success'); addLog('Engineering Review started', 'running'); }, 8000);
    setTimeout(() => { updateNode('3', 'Done', 100, '1m 12s'); updateNode('4', 'Running', 60, '45s'); addLog('Engineering Review completed', 'success'); addLog('Implementation started', 'running'); }, 12000);
    setTimeout(() => { updateNode('4', 'Done', 100, '3m 44s'); updateNode('5', 'Running', 80, '28s'); addLog('Implementation completed', 'success'); addLog('QA started', 'running'); }, 17000);
    setTimeout(() => { updateNode('5', 'Done', 100, '55s'); addLog('QA passed ✅ Pipeline complete', 'success'); }, 21000);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-900">
      <TopBar />
      <div className="flex flex-1 h-full overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 h-full overflow-hidden">
          {activeTab === 'workflow' && (
            <div className="flex flex-col h-full">
              {/* Top action bar */}
              <div className="flex items-center justify-between px-4 py-2 border-b bg-white shrink-0">
                <div className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Workflow Builder</span> · Drag steps from the palette · Connect nodes by dragging from <span className="font-mono">●</span> to <span className="font-mono">●</span> · Delete with <span className="font-mono">×</span> or Backspace
                </div>
                <button onClick={runDemo} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-semibold shadow transition-all active:scale-95 cursor-pointer">
                  <PlayCircle className="w-3.5 h-3.5" /> Run Execution
                </button>
              </div>
              <ResizablePanelGroup orientation="vertical" className="flex-1">
                <ResizablePanel defaultSize={65} minSize={40}>
                  <WorkflowBuilder
                    nodes={workflowNodes}
                    edges={workflowEdges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    setNodes={setWorkflowNodes}
                    setEdges={setWorkflowEdges}
                    onConnect={onConnect}
                  />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={35} minSize={15}>
                  <ActivityFeed logs={logs} />
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          )}

          {activeTab === 'gbrain' && <GBrainGraph />}
          
          {activeTab === 'apps' && <ConnectedApps />}
        </main>
      </div>
    </div>
  );
}
