import { Coins, FileText, Activity, Bot } from "lucide-react";

export function TopBar() {
  return (
    <div className="h-12 border-b bg-white flex items-center px-4 justify-between shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
        <span className="font-semibold text-sm tracking-tight text-slate-800">G Link Workspace</span>
      </div>
      <div className="flex items-center gap-6 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <Coins className="w-3.5 h-3.5 text-slate-400" />
          <span>Tokens: <strong className="text-slate-800">842K</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">$</span>
          <span>Cost: <strong className="text-slate-800">$1.27</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span>Markdown Files: <strong className="text-slate-800">18</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-slate-400" />
          <span>Workflow: <strong className="text-green-600">Running</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Bot className="w-3.5 h-3.5 text-slate-400" />
          <span>AI Agents: <strong className="text-slate-800">4</strong></span>
        </div>
      </div>
    </div>
  );
}
