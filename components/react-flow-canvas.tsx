"use client";

import { useState, useCallback, useEffect } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  applyNodeChanges, 
  applyEdgeChanges,
  Node,
  Edge,
  NodeChange,
  EdgeChange
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Design HTML' },
    position: { x: 250, y: 50 },
    className: 'bg-white border-slate-200 rounded-xl shadow-sm px-4 py-2 font-medium text-sm'
  },
  {
    id: '2',
    data: { label: 'QA / Review' },
    position: { x: 250, y: 150 },
    className: 'bg-white border-slate-200 rounded-xl shadow-sm px-4 py-2 font-medium text-sm'
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
];

export function ReactFlowCanvas({ newTelemetry }: { newTelemetry: any }) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  useEffect(() => {
    if (newTelemetry) {
      setNodes((nds) => [
        ...nds,
        {
          id: `telemetry-${Date.now()}`,
          data: { label: newTelemetry.data.title || 'Telemetry Node' },
          position: { x: Math.random() * 300 + 100, y: Math.random() * 200 + 100 },
          className: 'bg-green-50 border border-green-200 text-green-700 rounded-xl shadow-sm px-4 py-2 font-medium text-sm'
        }
      ]);
    }
  }, [newTelemetry]);

  return (
    <div className="w-full h-full bg-slate-50/30">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background color="#ccc" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
