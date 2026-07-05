import { useState } from "react";
import { Database, GitCommit, FileText } from "lucide-react";

export function GBrainGraph() {
  const [activeNode, setActiveNode] = useState<any>(null);

  const nodes = [
    { id: 1, label: 'Garry Tan', tier: 1, type: 'person', x: '50%', y: '50%', color: 'bg-yellow-400', glow: true, summary: 'President & CEO of Y Combinator. Key contact. Active research: Recent tweets about San Francisco tech.' },
    { id: 2, label: 'Paul Graham', tier: 1, type: 'person', x: '58%', y: '42%', color: 'bg-yellow-400', glow: true, summary: 'Founder of Y Combinator. Frequent mentions in startup strategy docs.' },
    { id: 3, label: 'Stripe', tier: 2, type: 'company', x: '30%', y: '60%', color: 'bg-blue-400', summary: 'Major payment processor. Mentioned in pricing.md.' },
    { id: 4, label: 'Vercel', tier: 2, type: 'company', x: '65%', y: '70%', color: 'bg-blue-400', summary: 'Hosting provider for Next.js. Mentioned in architecture.md.' },
    { id: 5, label: 'Alex (Coffee)', tier: 3, type: 'stub', x: '15%', y: '20%', color: 'bg-slate-400', summary: 'Minor mention: Met at coffee shop yesterday. No deep enrichment. Kept as stub.' },
    { id: 6, label: 'TechCrunch', tier: 3, type: 'stub', x: '80%', y: '85%', color: 'bg-slate-400', summary: 'News source mention in random Slack export.' },
    { id: 7, label: 'OpenAI', tier: 2, type: 'company', x: '70%', y: '30%', color: 'bg-blue-400', summary: 'AI API provider. Mentioned 4 times in tech specs. Research workflow executed.' },
  ];

  return (
    <div className="w-full h-full bg-[#111] text-slate-200 flex flex-col p-6 overflow-hidden font-sans">
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">G-Brain Explorer</h2>
          <p className="text-sm text-slate-400 mt-1">Enrichment Tiers & Storage routing</p>
        </div>
      </div>

      <div className="flex-1 flex gap-6 h-full min-h-0">
        
        {/* Enrichment Radar */}
        <div className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-2xl p-6 flex flex-col relative overflow-hidden shadow-xl">
          <h3 className="font-semibold text-slate-300 mb-4 z-10 text-sm uppercase tracking-wider">Enrichment Radar</h3>
          
          <div className="absolute inset-0 m-auto w-[400px] h-[400px] flex items-center justify-center">
            {/* Tiers Background */}
            <div className="absolute w-[400px] h-[400px] rounded-full border border-[#444] border-dashed" title="Tier 3" />
            <div className="absolute w-[250px] h-[250px] rounded-full border border-[#555] border-dashed bg-[#222]/30" title="Tier 2" />
            <div className="absolute w-[100px] h-[100px] rounded-full border border-[#777] bg-[#333]/50 shadow-[0_0_30px_rgba(255,255,255,0.05)]" title="Tier 1" />

            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 font-bold">TIER 3 (STUBS)</div>
            <div className="absolute top-[80px] left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-bold">TIER 2 (NOTABLE)</div>
            <div className="absolute top-[165px] left-1/2 -translate-x-1/2 text-[10px] text-slate-300 font-bold">TIER 1 (CORE)</div>

            {/* Nodes */}
            {nodes.map(node => (
              <div 
                key={node.id}
                className={`absolute w-3.5 h-3.5 rounded-full cursor-pointer transition-all hover:scale-150 ${node.color} ${node.glow ? 'shadow-[0_0_15px_rgba(250,204,21,0.6)] ring-2 ring-yellow-400/50' : ''}`}
                style={{ left: node.x, top: node.y, transform: 'translate(-50%, -50%)' }}
                onClick={() => setActiveNode(node)}
                title={node.label}
              >
                <span className="absolute top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-300 whitespace-nowrap bg-black/80 px-2 py-0.5 rounded opacity-0 hover:opacity-100 transition-opacity">
                  {node.label}
                </span>
              </div>
            ))}
          </div>

          {/* Node Info Popover */}
          {activeNode && (
            <div className="absolute bottom-6 left-6 right-6 bg-[#252525] border border-[#444] rounded-xl p-4 shadow-xl z-20 animate-in slide-in-from-bottom-2">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${activeNode.color}`} />
                  {activeNode.label}
                </h4>
                <span className="text-xs font-mono font-bold text-slate-300 bg-[#111] px-2 py-1 rounded border border-[#333]">Tier {activeNode.tier}</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{activeNode.summary}</p>
            </div>
          )}
        </div>

        {/* Storage Splitter */}
        <div className="w-80 bg-[#1a1a1a] border border-[#333] rounded-2xl p-6 flex flex-col relative shadow-xl">
          <h3 className="font-semibold text-slate-300 mb-8 text-sm uppercase tracking-wider">Storage Splitter</h3>
          
          <div className="flex flex-col items-center flex-1 justify-center gap-12 relative">
            
            {/* Input Stream */}
            <div className="w-full flex justify-center relative">
              <div className="w-16 h-16 bg-[#2a2a2a] rounded-xl border border-[#555] flex flex-col items-center justify-center z-10 shadow-lg relative">
                <FileText className="w-6 h-6 text-slate-200 mb-1" />
                <span className="text-[9px] text-slate-400 font-bold">INCOMING</span>
                <div className="absolute -bottom-8 w-0.5 h-8 bg-gradient-to-b from-[#555] to-transparent" />
              </div>
            </div>

            {/* Split Router */}
            <div className="w-full flex justify-between items-center relative mt-4">
              {/* Connector lines */}
              <div className="absolute -top-10 left-12 right-12 h-10 border-b border-l border-r border-[#444] rounded-b-xl -z-10" />

              {/* Git Vault */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-[#2a2a2a] rounded-full border-2 border-green-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.15)] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-green-500/10 group-hover:bg-green-500/20 transition-colors" />
                  <GitCommit className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold text-white mb-0.5">db_tracked</div>
                  <div className="text-[10px] text-slate-400">Git Vault (Core .md)</div>
                </div>
              </div>

              {/* DB Silo */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-[#2a2a2a] rounded-full border-2 border-blue-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.15)] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors" />
                  <Database className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold text-white mb-0.5">db_only</div>
                  <div className="text-[10px] text-slate-400">DB Silo (Bulk JSON)</div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
