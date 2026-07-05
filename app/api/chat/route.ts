import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const userMsg = message.toLowerCase();
    
    let reply = "I am currently monitoring the G-Stack workflow. How can I assist you?";

    // Highly realistic Mock Responses based on G-Brain/G-Stack context
    if (userMsg.includes('office hours') || userMsg.includes('summary')) {
      reply = "Office Hours context extracted.\n\n**Key takeaways:**\n- Founder is struggling with Top of Funnel.\n- Recommended focusing on single ICP.\n- G-Brain has updated `founders.md` with these notes.";
    } else if (userMsg.includes('qa') || userMsg.includes('blocked') || userMsg.includes('waiting')) {
      reply = "QA is currently waiting for the `Engineering Review` to finish. You can inspect the pending tasks in the Execution Engine or manually unblock it by running `/approve-eng`.";
    } else if (userMsg.includes('tier') || userMsg.includes('enrichment')) {
      reply = "G-Brain enrichment tiers dictate research depth:\n\n1. **Tier 1 (Core)**: Full web & LinkedIn research (e.g., Key Investors).\n2. **Tier 2 (Notable)**: Light social lookup.\n3. **Tier 3 (Stubs)**: Mention tracked, no API execution.\n\nCurrently tracking 12 Tier 1 profiles.";
    } else if (userMsg.includes('pricing') || userMsg.includes('markdown')) {
      reply = "I've located `pricing.md`. It was generated during the last CEO Review. The strategy focuses on a freemium model with a $20/mo pro tier. Should I open it in your editor?";
    } else if (userMsg.includes('storage') || userMsg.includes('split') || userMsg.includes('git')) {
      reply = "G-Brain splits storage to keep Git lightweight:\n- **db_tracked**: Core markdown files stored in Git.\n- **db_only**: Heavy JSON/Transcripts offloaded to local Postgres.\n\nEverything is fully synced.";
    } else {
      reply = `Received: "${message}".\n\nI've logged this to the G-Brain context. The active pipeline is continuing to execute. Let me know if you want me to fetch specific insights from the knowledge graph.`;
    }

    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 800));

    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process chat message' }, { status: 500 });
  }
}
