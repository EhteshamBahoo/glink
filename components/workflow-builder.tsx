import { useCallback } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  Handle,
  Position,
  useReactFlow
} from '@xyflow/react';
import { Play, FileText, CheckCircle2, Clock, XCircle } from 'lucide-react';
import '@xyflow/react/dist/style.css';

// Custom Node Component
function WorkflowNode({ data }: { data: any }) {
  return (
    <div className={`w-64 rounded-xl border bg-white shadow-sm overflow-hidden ${
      data.status === 'Running' ? 'border-blue-400 ring-1 ring-blue-400' :
      data.status === 'Error' ? 'border-red-400 ring-1 ring-red-400' :
      'border-slate-200'
    }`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-slate-300" />
      <div className="p-3 border-b bg-slate-50 flex items-center justify-between">
        <span className="font-semibold text-sm text-slate-800">{data.label}</span>
        {data.status === 'Done' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
        {data.status === 'Running' && <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />}
        {data.status === 'Pending' && <Clock className="w-4 h-4 text-slate-400" />}
        {data.status === 'Error' && <XCircle className="w-4 h-4 text-red-500" />}
      </div>
      <div className="p-3 flex flex-col gap-2 text-xs">
        <div className="flex justify-between items-center text-slate-600">
          <span>Status: <strong className={
            data.status === 'Done' ? 'text-green-600' :
            data.status === 'Running' ? 'text-blue-600' :
            data.status === 'Error' ? 'text-red-600' : ''
          }>{data.status}</strong></span>
          <span>Duration: {data.duration}</span>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${
              data.status === 'Done' ? 'bg-green-500' :
              data.status === 'Error' ? 'bg-red-500' :
              'bg-blue-500 transition-all duration-1000'
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
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-slate-300" />
    </div>
  );
}

const nodeTypes = { workflowNode: WorkflowNode };

export function WorkflowBuilder({ nodes, edges, onNodesChange, onEdgesChange, setNodes, onConnect }: any) {
  
  const onDragStart = (event: any, nodeType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('application/label');

      if (typeof type === 'undefined' || !type) return;

      const position = {
        x: event.clientX - 250, // rough offset
        y: event.clientY - 100,
      };

      const newNode = {
        id: `dndnode_${Date.now()}`,
        type,
        position,
        data: { label, status: 'Pending', duration: '--', progress: 0 },
      };

      setNodes((nds: any) => nds.concat(newNode));
    },
    [setNodes],
  );

  return (
    <div className="flex h-full w-full">
      {/* Node Palette */}
      <div className="w-48 border-r bg-white p-4 flex flex-col gap-3">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Custom Steps</div>
        {[
          'Slack Notification', 
          'Design Approval', 
          'Custom Python Script', 
          'Deploy to AWS', 
          'Email Founder', 
          'Security Scan'
        ].map(step => (
          <div 
            key={step}
            className="p-2 text-sm border rounded bg-slate-50 text-slate-700 cursor-grab hover:border-slate-300 shadow-sm"
            draggable
            onDragStart={(e) => onDragStart(e, 'workflowNode', step)}
          >
            {step}
          </div>
        ))}
      </div>
      {/* Canvas */}
      <div className="flex-1 bg-slate-50/50" onDrop={onDrop} onDragOver={onDragOver}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Background color="#ccc" gap={16} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
