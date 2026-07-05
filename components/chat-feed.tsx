"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef } from "react";

export type Message = {
  id: string;
  sender: 'CEO' | 'Eng';
  text: string;
};

export function ChatFeed({ messages }: { messages: Message[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      // Small timeout to allow DOM to update before scrolling
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 10);
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-white border-t">
      <div className="p-3 border-b bg-slate-50/50">
        <h3 className="font-medium text-sm text-slate-700">Agent War-Room</h3>
      </div>
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="p-4 space-y-4 flex flex-col">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.sender === 'CEO' ? 'justify-start' : 'justify-end'}`}
            >
              <div 
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  msg.sender === 'CEO' 
                    ? 'bg-blue-500 text-white rounded-bl-sm' 
                    : 'bg-slate-100 text-slate-800 rounded-br-sm'
                }`}
              >
                <div className={`font-semibold text-xs opacity-75 mb-1 ${msg.sender === 'CEO' ? 'text-blue-100' : 'text-slate-500'}`}>
                  {msg.sender}
                </div>
                {msg.text}
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="text-center text-slate-400 text-sm mt-10">
              No messages yet. Waiting for execution...
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
