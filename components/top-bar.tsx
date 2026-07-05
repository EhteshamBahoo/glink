import { Coins, FileText, Activity, Bot, Loader2 } from "lucide-react";
import { WorkflowPhase } from "@/components/workflow-builder";

export function TopBar({ metrics, phase }: { metrics?: { tokens: number; cost: number; files: number }; phase?: WorkflowPhase }) {
  const tokens = metrics?.tokens ?? 0;
  const cost = metrics?.cost ?? 0;
  const files = metrics?.files ?? 0;

  const workflowLabel = phase === 'skill-running' ? 'Running'
    : phase === 'complete' ? '✓ Done'
    : 'Idle';

  const workflowColor = phase === 'skill-running' ? 'text-blue-600'
    : phase === 'complete' ? 'text-green-600'
    : 'text-slate-400';

  return (
    <div className="h-12 border-b bg-white flex items-center px-4 justify-between shrink-0">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${phase === 'skill-running' ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`} />
        <span className="font-semibold text-sm tracking-tight text-slate-800">G Link Workspace</span>
        <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded ml-2">Live Connected</span>
      </div>
      <div className="flex items-center gap-6 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <Coins className="w-3.5 h-3.5 text-slate-400" />
          <span>Tokens: <strong className="text-slate-800 tabular-nums">{tokens >= 1000 ? `${(tokens / 1000).toFixed(0)}K` : tokens}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">$</span>
          <span>Cost: <strong className="text-slate-800 tabular-nums">${cost.toFixed(2)}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span>MD Files: <strong className="text-slate-800 tabular-nums">{files}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-slate-400" />
          <span>Workflow: <strong className={`${workflowColor} flex items-center gap-1`}>
            {phase === 'skill-running' && <Loader2 className="w-3 h-3 animate-spin" />}
            {workflowLabel}
          </strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Bot className="w-3.5 h-3.5 text-slate-400" />
          <span>AI Agents: <strong className="text-slate-800">4</strong></span>
        </div>
      </div>
    </div>
  );
}
