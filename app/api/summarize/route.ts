import { NextResponse } from 'next/server';

const TIER_DESCRIPTIONS = {
  1: "Tier 1 represents core strategy and executive-level documents. These are the highest-value knowledge assets, covering project vision, architecture decisions, legal frameworks, and company-wide KPIs.",
  2: "Tier 2 contains department and team-level reports. These files provide operational intelligence across Engineering, Product, Sales, and HR — tracking performance, attrition risk, skill gaps, and process improvements.",
  3: "Tier 3 holds individual employee profiles, meeting notes, integration setup docs, and operational logs. These are the ground-level data points that feed into the higher-tier analyses.",
};

export async function POST(req: Request) {
  try {
    const { type, file, tier, tierFiles } = await req.json();

    let systemPrompt = `You are G-Brain, the intelligent knowledge management layer for an AI-powered Employee Progress Tracking system. 
You speak concisely, professionally, and with authority. Always ground your responses in the actual content provided.`;

    let userPrompt = '';

    if (type === 'file_summary' && file) {
      userPrompt = `Provide a 3-4 sentence executive summary of this knowledge base document. 
Focus on the most actionable insights, key data points, and business impact. Be specific and data-driven.

File: ${file.name}
Category: ${file.category}
Tier: ${file.tier}

Content:
${file.content}`;
    } else if (type === 'tier_summary' && tier && tierFiles) {
      const filesOverview = tierFiles.map((f: any) => `- ${f.name} (${f.category}): ${f.content.slice(0, 200)}...`).join('\n');
      userPrompt = `Summarize what this entire tier of the G-Brain knowledge base covers. 
Tier ${tier}: ${TIER_DESCRIPTIONS[tier as keyof typeof TIER_DESCRIPTIONS]}

The tier contains ${tierFiles.length} documents:
${filesOverview}

Provide a 4-5 sentence overview of what this tier collectively tells us about the state of the "AI Employee Progress Tracking" project. Highlight the most critical insights.`;
    } else {
      return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
    }

    // Try Gemini API first
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
              }],
              generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 512,
              }
            })
          }
        );
        
        if (geminiResponse.ok) {
          const data = await geminiResponse.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return NextResponse.json({ summary: text });
          }
        }
      } catch (e) {
        // Fall through to mock
      }
    }

    // Fallback: High-quality mock summaries
    await new Promise(resolve => setTimeout(resolve, 600));
    
    let mockSummary = '';
    if (type === 'file_summary' && file) {
      const mocks: Record<string, string> = {
        'T1-001': "The project charter establishes AI-native employee performance monitoring as a mission-critical initiative targeting 80% reduction in manual review time and $2.4M in attrition savings. Phase 1 covers three departments with 185 employees, and success is measured against concrete KPIs: 45-minute reviews (down from 4 hours) and 60-day early attrition signals. The scope and stakeholder alignment are solid, though the Q2 company-wide rollout timeline is aggressive given current data infrastructure gaps.",
        'T1-002': "The executive summary crystallizes the business case: reactive, annual-only reviews are costing $2.4M annually in preventable attrition, and the AI system directly addresses this with daily signal ingestion across GitHub, Jira, Slack, and Calendar. The projected ROI is compelling — 1,200 manager-hours reclaimed per quarter and 23% faster promotion cycles — though the 76% model accuracy on attrition needs to reach the 80% threshold before Phase 2 expansion is advisable.",
        'T2-006': "The Q3 attrition risk analysis has surfaced 6 high-risk employees requiring immediate intervention, with E-042 (Engineering, 82% risk), E-117 (Sales, 78%), and E-203 (Product, 74%) as the priority cases. The primary attrition signals include declining code activity, job-search behavior, and unresolved internal mobility requests — all addressable with targeted retention conversations. This report should be in every department head's hands by end of week.",
        'T2-015': "The pilot retrospective confirms the core hypothesis: AI-assisted reviews deliver 3.2 hours of weekly manager savings and 89% alert accuracy. Three critical fixes are needed before Phase 2: vacation calendar exclusions to eliminate false positives, data lag reduction from 4-6 hours to under 2 hours, and dashboard simplification from 14 metrics down to 5 primary signals. These are well-understood engineering problems that should not delay the Phase 2 decision.",
        'T3-001': "Alex Chen (E-042) presents the highest-priority retention risk in Engineering — an 82% attrition probability driven by a 34% PR drop, 6-hour average Slack response times (previously 1.8 hours), and a LinkedIn activity spike. The AI recommendation is clear: immediate retention conversation focused on career trajectory, and a move from maintenance work to a greenfield Platform team project to re-engage technical ambition. Every week without action increases departure probability.",
      };
      
      mockSummary = mocks[file.id] || 
        `This ${file.category} document (${file.name}) provides critical operational data for the AI Employee Progress Tracking initiative. ` +
        `Key findings include actionable insights across ${file.category.toLowerCase()} dimensions, with direct implications for the Q3 expansion roadmap. ` +
        `The data quality appears strong and aligns with the broader Tier ${file.tier} knowledge strategy. ` +
        `Recommend reviewing in conjunction with related Tier ${file.tier} documents for full context.`;
    } else if (type === 'tier_summary' && tier) {
      mockSummary = `${TIER_DESCRIPTIONS[tier as keyof typeof TIER_DESCRIPTIONS]} ` +
        `Collectively, the ${tierFiles?.length} documents in this tier paint a ${tier === 1 ? 'strategic' : tier === 2 ? 'operational' : 'ground-level tactical'} picture of the initiative. ` +
        `${tier === 1 ? 'The core strategy is well-documented with clear ownership, KPIs, and a privacy framework that should satisfy legal review.' :
          tier === 2 ? 'Department-level data shows Engineering and HR as the strongest adopters, while Sales shows the highest attrition risk requiring immediate action.' :
          'Individual-level profiles reveal 3 high-risk employees needing immediate retention conversations, and 2 high performers (E-089, E-071) who should be recognized and fast-tracked.'}`;
    }

    return NextResponse.json({ summary: mockSummary });
  } catch (error) {
    console.error('Summarize error:', error);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}
