import { 
  Activity, 
  Database, 
  Settings, 
  LayoutDashboard,
  BrainCircuit,
  TerminalSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export function Sidebar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: 'workflow' | 'gbrain' | 'apps') => void }) {
  return (
    <div className="w-56 border-r bg-slate-50/50 flex flex-col h-full shrink-0">
      <div className="p-4 border-b flex items-center gap-2">
        <BrainCircuit className="w-6 h-6 text-blue-600" />
        <span className="font-bold text-lg tracking-tight">G Link</span>
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Workspaces</div>
          <Button 
            variant={activeTab === 'workflow' ? "secondary" : "ghost"} 
            className={`w-full justify-start gap-2 ${activeTab === 'workflow' ? 'shadow-sm font-semibold' : 'text-slate-600'}`}
            onClick={() => setActiveTab('workflow')}
          >
            <LayoutDashboard className="w-4 h-4" />
            Workflow Builder
          </Button>
          <Button 
            variant={activeTab === 'gbrain' ? "secondary" : "ghost"} 
            className={`w-full justify-start gap-2 ${activeTab === 'gbrain' ? 'shadow-sm font-semibold' : 'text-slate-600'}`}
            onClick={() => setActiveTab('gbrain')}
          >
            <Database className="w-4 h-4" />
            G-Brain Explorer
          </Button>
          <Button 
            variant={activeTab === 'apps' ? "secondary" : "ghost"} 
            className={`w-full justify-start gap-2 ${activeTab === 'apps' ? 'shadow-sm font-semibold' : 'text-slate-600'}`}
            onClick={() => setActiveTab('apps')}
          >
            <Activity className="w-4 h-4" />
            Connected Apps
          </Button>
          
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mt-8 mb-2">Views</div>
          <Button variant="ghost" className="w-full justify-start gap-2 text-slate-500 hover:text-slate-900">
            <Activity className="w-4 h-4" />
            Observability
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2 text-slate-500 hover:text-slate-900">
            <TerminalSquare className="w-4 h-4" />
            Execution Engine
          </Button>
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start gap-2 text-slate-500 hover:text-slate-900">
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </div>
    </div>
  );
}
