import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { FileText, CheckCircle2, Send, Loader2 } from "lucide-react";

export type ChatMessage = {
  id: string;
  sender: 'User' | 'Assistant';
  text: string | React.ReactNode;
};

export function LiveAssistant({ messages: initialMessages, recentFiles }: { messages: ChatMessage[], recentFiles: string[] }) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync external messages from the demo flow while keeping internal ones
  useEffect(() => {
    if (initialMessages.length === 0) {
      setMessages([]);
    } else {
      setMessages(prev => {
        // Simple way to merge or just replace if it's the demo flow updating
        const newIds = initialMessages.map(m => m.id);
        const existingIds = prev.map(m => m.id);
        const added = initialMessages.filter(m => !existingIds.includes(m.id));
        return [...prev, ...added];
      });
    }
  }, [initialMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 50);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input.trim();
    setInput('');
    
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'User', text: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      
      const data = await res.json();
      
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        sender: 'Assistant', 
        text: data.reply 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        sender: 'Assistant', 
        text: 'Error connecting to G-Brain API.' 
      }]);
    } finally {
      setIsLoading(false);
    }
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
