import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { FileText, CheckCircle2, Send, Loader2, TerminalSquare, XCircle } from "lucide-react";

export type ChatMessage = {
  id: string;
  sender: 'User' | 'Assistant';
  text: string | React.ReactNode;
};

// Compact, non-bubble element for a tool_use event, distinct from a text
// chat bubble so it's visually clear the agent is running a command.
export function ToolUseEvent({ name, input, status }: { name: string; input: any; status: 'running' | 'done' | 'error' }) {
  const summary = typeof input?.command === 'string' ? input.command
    : typeof input?.file_path === 'string' ? input.file_path
    : typeof input?.pattern === 'string' ? input.pattern
    : JSON.stringify(input ?? {}).slice(0, 100);

  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-600 max-w-full">
      <TerminalSquare className="w-3.5 h-3.5 text-blue-500 shrink-0" />
      <span className="font-semibold text-slate-700 shrink-0">{name}</span>
      <span className="truncate text-slate-500">{summary}</span>
      {status === 'running' && <Loader2 className="w-3 h-3 animate-spin text-slate-400 ml-auto shrink-0" />}
      {status === 'done' && <CheckCircle2 className="w-3 h-3 text-green-500 ml-auto shrink-0" />}
      {status === 'error' && <XCircle className="w-3 h-3 text-red-500 ml-auto shrink-0" />}
    </div>
  );
}

export function LiveAssistant({
  messages,
  recentFiles,
  onSend,
  isLoading,
}: {
  messages: ChatMessage[];
  recentFiles: string[];
  onSend: (text: string) => void;
  isLoading: boolean;
}) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 50);
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');
    onSend(userMsg);
  };

  return (
    <div className="flex flex-col h-full bg-white border-l relative">
      <div className="p-3 border-b bg-slate-50 flex flex-col gap-1 shrink-0">
        <h3 className="font-semibold text-sm text-slate-800">Workflow Assistant</h3>
        <p className="text-[11px] text-slate-500 uppercase tracking-wide">Context: Active Workflow & G-Brain</p>
      </div>
      
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-6 pb-4">
          {messages.map((msg) => (
            <div key={msg.id} className="flex flex-col gap-1.5">
              <span className={`text-xs font-semibold uppercase tracking-wide ${msg.sender === 'User' ? 'text-blue-500' : 'text-slate-500'}`}>
                {msg.sender}
              </span>
              <div className={`text-sm leading-relaxed whitespace-pre-wrap ${msg.sender === 'Assistant' ? 'text-slate-800' : 'text-slate-600'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-3 border-t bg-white shrink-0">
        <div className="flex items-center gap-2 bg-slate-50 border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all">
          <input 
            type="text" 
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-400"
            placeholder="Ask about workflow or G-Brain..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button 
            className="text-blue-500 hover:text-blue-600 disabled:opacity-50"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Fake G-Brain Sync Panel */}
      <div className="h-40 border-t bg-slate-50 flex flex-col shrink-0">
        <div className="px-3 py-2 border-b text-xs font-semibold text-slate-600 flex items-center gap-1.5 shrink-0">
          <FileText className="w-3.5 h-3.5" />
          Recent Knowledge (G-Brain)
        </div>
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-0.5">
            {recentFiles.map(file => (
              <div key={file} className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-200 rounded cursor-pointer transition-colors">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                {file}
              </div>
            ))}
            {recentFiles.length === 0 && (
              <div className="text-slate-400 text-xs text-center mt-4">Waiting for markdown output...</div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
