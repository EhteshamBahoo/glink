import { ScrollArea } from "./ui/scroll-area";

export type ActivityLog = {
  time: string;
  message: string;
  status?: 'success' | 'running' | 'pending' | 'info' | 'error';
};

export function ActivityFeed({ logs }: { logs: ActivityLog[] }) {
  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-[#cccccc] font-mono text-xs">
      <div className="px-4 py-1.5 border-b border-[#333] flex items-center bg-[#252526]">
        <span className="uppercase text-[10px] tracking-wider text-[#999]">Terminal Output</span>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-1">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-4 hover:bg-[#2a2d2e] px-1 py-0.5 rounded">
              <span className="text-[#858585] shrink-0">{log.time}</span>
              <span className={
                log.status === 'success' ? 'text-[#89d185]' :
                log.status === 'running' ? 'text-[#e2c08d]' :
                log.status === 'error' ? 'text-[#f48771]' :
                log.status === 'pending' ? 'text-[#cccccc]' : 'text-[#4fc1ff]'
              }>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
