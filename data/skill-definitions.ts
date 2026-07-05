export type SkillMode = 'interactive' | 'analytical' | 'progress' | 'review' | 'qa';

export type SkillDefinition = {
  label: string;
  emoji: string;
  accentColor: string;
  bgColor: string;
  borderColor: string;
  headerBg: string;
  mode: SkillMode;
  welcomeMessage: string;
  questions?: string[];         // for interactive mode
  analysisMessages?: string[];  // for analytical/progress mode
  completionMessage: string;
};

export const SKILL_DEFINITIONS: Record<string, SkillDefinition> = {
  '1': {
    label: '/office-hours',
    emoji: '🟡',
    accentColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    headerBg: 'bg-amber-500',
    mode: 'interactive',
    welcomeMessage: "Starting Office Hours. I'll ask you a few questions to build your design document. Answer each one — the workflow will advance once we're done.",
    questions: [
      "What's the specific problem you're solving? Be as concrete as possible.",
      "Who experiences this problem most acutely? Describe your ideal user in one sentence.",
      "What's the smallest version you could ship in 2 weeks?",
      "What does success look like in 90 days? Give me a specific metric.",
      "What's the biggest risk or unknown right now?",
    ],
    completionMessage: "✓ Office Hours complete. Generating design document from your answers...\n\nSaved to G-Brain as `office-hours-output.md`. Passing context downstream to CEO Review.",
  },
  '2': {
    label: '/plan-ceo-review',
    emoji: '🟣',
    accentColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    headerBg: 'bg-purple-600',
    mode: 'analytical',
    welcomeMessage: "I've reviewed your Office Hours design document. Here are my observations:",
    analysisMessages: [
      "**Positioning**: Your ICP definition is solid but too broad. The problem you're describing resonates most strongly with Series A founders running teams of 10–30. I'd narrow your initial wedge there before expanding.",
      "**Risk**: The biggest unaddressed risk isn't technical — it's adoption. The 90-day success metric you defined is achievable, but it assumes manager buy-in which your current plan doesn't explicitly address. I'd add a 'champion identification' step to the rollout plan.",
      "**Opportunity**: There's an under-exploited insight in your answers. The 'smallest version' you described is actually your best demo hook — I'd lead with that in the pitch, not the full product vision.",
      "Saving CEO Review notes to G-Brain as `ceo-review.md`. Flagging the 3 points above for engineering to address in the next phase.",
    ],
    completionMessage: "✓ CEO Review complete. Design doc updated with product critique. Passing to Engineering Review.",
  },
  '3': {
    label: '/plan-eng-review',
    emoji: '🔵',
    accentColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    headerBg: 'bg-blue-600',
    mode: 'analytical',
    welcomeMessage: "Engineering Review. Reading the updated design doc and CEO notes...",
    analysisMessages: [
      "**Architecture**: The data pipeline approach is sound. I'd recommend Kafka for the ingestion layer given the multi-source nature — it gives you replay capability which you'll need when the schema evolves.",
      "**Scope Risk**: The 'smallest version in 2 weeks' requires 4 integrations (GitHub, Slack, Jira, Calendar). That's 2 weeks of integration work alone, leaving no time for the core ML layer. I'd cut to GitHub-only for the first sprint.",
      "**Dependencies**: Pinecone for embeddings is fine, but add a local fallback (pgvector) so the demo runs offline during the hackathon.",
      "Saving to G-Brain as `eng-review.md` and `architecture.md`. Updating the roadmap with sprint 1 scope cut.",
    ],
    completionMessage: "✓ Engineering Review complete. Architecture doc saved. Handing off to Implementation.",
  },
  '4': {
    label: 'Implementation',
    emoji: '⚙️',
    accentColor: 'text-slate-700',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-300',
    headerBg: 'bg-slate-700',
    mode: 'progress',
    welcomeMessage: "Implementation started. Reading context from G-Brain...",
    analysisMessages: [
      "Read `architecture.md`, `ceo-review.md`, `office-hours-output.md` from G-Brain. Context loaded.",
      "Scaffolding GitHub integration layer... PR webhook configured. Commit frequency metric implemented.",
      "Writing `github-integration.md` back to G-Brain with implementation notes.",
      "Core scoring model skeleton complete. Placeholder for ML layer — flagged for sprint 2.",
    ],
    completionMessage: "✓ Implementation complete. 6 files written to G-Brain. Passing to QA.",
  },
  '5': {
    label: '/qa',
    emoji: '🟢',
    accentColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    headerBg: 'bg-green-600',
    mode: 'qa',
    welcomeMessage: "QA started. Running test suite against the implementation...",
    analysisMessages: [
      "✓ Unit tests: 47 passed, 0 failed",
      "✓ GitHub integration: webhook fires correctly on PR merge",
      "⚠️ Slack metadata extraction: rate limit hit in load test — adding exponential backoff",
      "✓ Retry logic added. Re-running Slack tests... all passed.",
      "✓ End-to-end pipeline test: 3 employees processed, scores generated correctly.",
      "All tests passing. QA report saved to G-Brain as `qa-report.md`.",
    ],
    completionMessage: "✓ QA complete. Pipeline is verified end-to-end. Ready to ship.",
  },
};
