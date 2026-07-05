"use client";

import { useState, useCallback } from "react";
import { applyNodeChanges, applyEdgeChanges, addEdge, Connection, Node, Edge } from '@xyflow/react';
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { ActivityFeed, ActivityLog } from "@/components/activity-feed";
import { LiveAssistant, ChatMessage } from "@/components/live-assistant";
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
  
  // States
  const [workflowNodes, setWorkflowNodes] = useState<Node[]>(initialWorkflowNodes);
  const [workflowEdges, setWorkflowEdges] = useState<Edge[]>(initialWorkflowEdges);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([{ id: 'init', sender: 'Assistant', text: 'Waiting for pipeline execution...' }]);
  const [recentFiles, setRecentFiles] = useState<string[]>([]);
  
  const onNodesChange = useCallback((changes: any) => setWorkflowNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: any) => setWorkflowEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params: Connection) => setWorkflowEdges((eds) => addEdge(params, eds)), []);

  const runDemo = () => {
    // Reset
    setWorkflowNodes(initialWorkflowNodes);
    setLogs([{ time: new Date().toLocaleTimeString(), message: 'Triggered pipeline execution', status: 'info' }]);
    setChatMessages([]);
    setRecentFiles([]);

    const updateNode = (id: string, status: string, progress: number, duration: string) => {
      setWorkflowNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, status, progress, duration } } : n));
    };

    const addLog = (message: string, status: any) => {
      setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message, status }]);
    };

    const addChat = (text: string | React.ReactNode) => {
      setChatMessages(prev => [...prev, { id: Date.now().toString(), sender: 'Assistant', text }]);
    };

    // Step 1: Office Hours Running
    setTimeout(() => {
      updateNode('1', 'Running', 50, '12s');
      addLog('/office-hours started...', 'running');
    }, 1000);

    // Step 2: Office Hours Done, CEO Review Running
    setTimeout(() => {
      updateNode('1', 'Done', 100, '32s');
      updateNode('2', 'Running', 20, '4s');
      addLog('/office-hours completed successfully', 'success');
      addLog('CEO Review started', 'running');
      addChat('Office Hours complete. Extracted key business context. Beginning CEO review phase.');
    }, 4000);

    // Step 3: CEO Review Done, G-Brain Sync, Eng Review
    setTimeout(() => {
      updateNode('2', 'Done', 100, '45s');
      updateNode('3', 'Running', 10, '2s');
      addLog('CEO Review completed', 'success');
      addLog('Generated pricing.md', 'info');
      addLog('Engineering Review started', 'running');
      setRecentFiles(prev => ['pricing.md', 'ceo-review.md', ...prev]);
      addChat(
        <div>
          CEO Review completed.<br/><br/>
          <strong>Key findings:</strong><br/>
          • Narrow ICP<br/>
          • Add onboarding<br/>
          • Improve retention<br/><br/>
          Saved to G-Brain as <code>pricing.md</code> and <code>ceo-review.md</code>.
        </div>
      );
    }, 8000);

    // Step 4: Eng Review Done, Implementation
    setTimeout(() => {
      updateNode('3', 'Done', 100, '1m 12s');
      updateNode('4', 'Running', 60, '45s');
      addLog('Engineering Review completed', 'success');
      addLog('Implementation started', 'running');
      addLog('Generated architecture.md', 'info');
      setRecentFiles(prev => ['architecture.md', ...prev]);
      addChat('Engineering phase approved. Writing architecture specifications.');
    }, 12000);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-900">
      <TopBar />
      <div className="flex flex-1 h-full overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 h-full">
          <ResizablePanelGroup orientation="horizontal" className="h-full w-full">
            <ResizablePanel defaultSize={75} minSize={50} className="flex flex-col h-full bg-white relative">
              {/* Run Demo Button inside Workspace */}
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button onClick={runDemo} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md transition-all active:scale-95 cursor-pointer">
                  <PlayCircle className="w-4 h-4" /> Run Execution
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
              <LiveAssistant messages={chatMessages} recentFiles={recentFiles} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </main>
      </div>
    </div>
  );
}
