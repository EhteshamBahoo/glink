export type BrainFile = {
  id: string;
  name: string;
  tier: 1 | 2 | 3;
  category: string;
  content: string;
};

export const BRAIN_FILES: BrainFile[] = [
  // ─── TIER 1: Core Strategy & Executive (8 files) ───────────────────────────
  {
    id: 'T1-001',
    name: 'project-charter.md',
    tier: 1,
    category: 'Strategy',
    content: `# AI Employee Progress Tracking — Project Charter

## Vision
Build an AI-native system to monitor, analyze, and improve employee performance across the organization using continuous data ingestion from multiple sources.

## Objectives
- Reduce manual performance review time by 80%
- Surface underperformers before quarterly cycles
- Provide real-time skill gap detection
- Enable predictive attrition modeling

## Scope
Phase 1: 3 departments (Engineering, Product, Sales)
Phase 2: Company-wide rollout (6 months)

## Success Metrics
- Manager review time: 4 hours → 45 minutes
- Early attrition detection: 60 days advance notice
- Employee satisfaction (eNPS) improvement of +15 points

## Stakeholders
- CEO (Sponsor)
- Head of HR (Owner)
- CTO (Technical Sponsor)
- 3x Department Heads (Champions)`,
  },
  {
    id: 'T1-002',
    name: 'executive-summary.md',
    tier: 1,
    category: 'Strategy',
    content: `# Executive Summary

## Problem
Existing performance tracking is reactive, annual-only, and based on subjective manager opinions. We lose ~12% of top performers yearly to preventable attrition, costing $2.4M in replacement costs.

## Solution
An AI system that ingests daily signals (PR activity, Slack sentiment, meeting attendance, ticket velocity) and surfaces actionable insights weekly.

## Business Impact
- $2.4M saved annually from reduced attrition
- 1,200 manager-hours reclaimed per quarter
- 23% faster promotion cycles for top performers

## Timeline
Q1: Pilot (Engineering, 40 employees)
Q2: Expansion (Product + Sales, 120 additional)
Q3: AI model tuning + attrition prediction live
Q4: Full company rollout (500 employees)`,
  },
  {
    id: 'T1-003',
    name: 'ai-model-architecture.md',
    tier: 1,
    category: 'Technical',
    content: `# AI Model Architecture

## Data Pipeline
1. **Ingestion Layer**: Slack, GitHub, Jira, Calendar APIs → Kafka streams
2. **Feature Engineering**: Rolling 7/30/90 day windows per employee
3. **Model Layer**: 
   - Sentiment analysis (distilBERT fine-tuned on internal comms)
   - Velocity scoring (custom regression on ticket metrics)
   - Engagement classifier (XGBoost on meeting + Slack signals)
4. **Output Layer**: Unified score card per employee, updated daily

## Key Features Used
| Feature | Source | Weight |
|---------|--------|--------|
| PR merge rate | GitHub | 0.22 |
| Slack response time | Slack | 0.15 |
| Meeting attendance | Calendar | 0.18 |
| Ticket close rate | Jira | 0.25 |
| Peer feedback sentiment | Slack | 0.20 |

## Infrastructure
- LLM: Gemini 1.5 Pro for narrative summarization
- Embedding: text-embedding-004 for similarity scoring
- Database: PostgreSQL (metrics) + Pinecone (embeddings)`,
  },
  {
    id: 'T1-004',
    name: 'data-privacy-policy.md',
    tier: 1,
    category: 'Legal',
    content: `# Data Privacy Policy — Employee AI Tracking

## Principles
1. **Transparency**: All employees notified of data collection scope
2. **Minimization**: Only work-related signals, never personal device data
3. **Right to Review**: Employees can request their full data profile
4. **Human Override**: No disciplinary action taken based on AI alone

## Data Collected
- ✅ GitHub commits, PRs, code review comments
- ✅ Jira ticket assignments, completion times, blockers
- ✅ Calendar meeting attendance (anonymized titles)
- ✅ Slack message frequency (NOT content — only metadata)
- ❌ Personal Slack messages
- ❌ Emails outside work domain
- ❌ Any data outside work hours

## Retention
- Raw signals: 90 days rolling
- Aggregated scores: 3 years
- Attrition predictions: Deleted after employee departure + 30 days

## Legal Basis
GDPR Article 6(1)(f) — Legitimate interests, balanced against employee rights.`,
  },
  {
    id: 'T1-005',
    name: 'kpis-and-metrics.md',
    tier: 1,
    category: 'Strategy',
    content: `# KPIs & Metrics Framework

## System Health KPIs
| Metric | Target | Current |
|--------|--------|---------|
| Data freshness | < 2 hours | 1.4 hrs |
| Model accuracy (attrition) | > 80% | 76% |
| False positive rate | < 5% | 3.2% |
| Dashboard uptime | 99.9% | 99.7% |

## Business KPIs
| Metric | Baseline | 6-Month Target |
|--------|---------|---------------|
| Avg review prep time | 4.2 hrs | 0.75 hrs |
| Attrition rate | 12% | 8% |
| Internal mobility rate | 6% | 12% |
| eNPS score | 28 | 43 |

## Employee Performance Score Bands
- 🟢 High Performer: 80–100
- 🔵 On Track: 60–79
- 🟡 Needs Support: 40–59
- 🔴 At Risk: 0–39`,
  },
  {
    id: 'T1-006',
    name: 'roadmap-q3-q4.md',
    tier: 1,
    category: 'Planning',
    content: `# Product Roadmap — Q3 & Q4

## Q3 Milestones
- [ ] Attrition prediction model v1.0 (August)
- [ ] Manager dashboard beta (August)
- [ ] Employee self-service portal (September)
- [ ] Slack bot for weekly nudges (September)
- [ ] Integration with HRIS (Workday) (October)

## Q4 Milestones
- [ ] Full 500-employee rollout (November)
- [ ] Annual review automation (November)
- [ ] Skills gap analysis module (December)
- [ ] API for external HR consultants (December)

## Dependencies
- Legal sign-off on privacy policy: July 31
- Slack Enterprise Grid upgrade: August 15
- ML infra capacity expansion: August 1

## Risks
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Employee pushback | Medium | High | Transparent comms campaign |
| Data quality issues | High | Medium | Dedicated data eng sprint |
| Model bias | Low | High | Bias audit every quarter |`,
  },
  {
    id: 'T1-007',
    name: 'vendor-contracts.md',
    tier: 1,
    category: 'Legal',
    content: `# Vendor Contracts & Integrations

## Active Contracts
| Vendor | Purpose | Cost/Mo | Renewal |
|--------|---------|---------|---------|
| Google Cloud | GKE + Vertex AI | $8,400 | Jan 2026 |
| Pinecone | Vector DB | $1,200 | Monthly |
| Proxycurl | LinkedIn enrichment | $600 | Monthly |
| Crunchbase | Company data | $2,400 | Annual |

## Integration Status
- ✅ GitHub Enterprise: Connected, 45 users
- ✅ Jira Cloud: Connected, all projects
- ✅ Slack: Enterprise Grid pending approval
- 🔄 Workday: In progress (API docs review)
- ❌ Salesforce: Not started

## SLA Requirements
- GitHub API: 99.9% uptime
- Vertex AI: < 200ms inference latency
- All data encrypted in transit (TLS 1.3)`,
  },
  {
    id: 'T1-008',
    name: 'change-management-plan.md',
    tier: 1,
    category: 'Strategy',
    content: `# Change Management Plan

## Communication Strategy
**Week 1**: CEO all-hands announcement — "AI for us, not against us"
**Week 2**: Department head briefings with Q&A
**Week 3**: Employee FAQ published on intranet
**Week 4**: Pilot cohort onboarding (Engineering team)

## Training Plan
- Manager training: 2-hour workshop on reading AI dashboards
- Employee orientation: 30-minute self-paced course
- HR admin: Full-day certification program

## Resistance Management
| Concern | Response |
|---------|----------|
| "AI is watching me" | Show exactly what is and isn't collected |
| "This will replace HR" | AI augments, HR makes final calls |
| "Scores are unfair" | Appeal process + human review mandatory |

## Success Indicators
- 80%+ employees complete orientation
- < 5 formal complaints in first 90 days
- Manager NPS > 60 within first quarter`,
  },

  // ─── TIER 2: Department / Team Level (15 files) ────────────────────────────
  {
    id: 'T2-001',
    name: 'engineering-team-report.md',
    tier: 2,
    category: 'Engineering',
    content: `# Engineering Team — Monthly Progress Report

## Team Overview
- Size: 22 engineers (8 senior, 9 mid, 5 junior)
- Average performance score: 72.4 / 100
- High performers (>80): 6 engineers
- At-risk (<40): 1 engineer (follow-up scheduled)

## Velocity Metrics
- Sprint completion rate: 87% (target: 85%)
- Bug escape rate: 3.2% (target: < 5%)
- Code review turnaround: 18 hours avg

## Key Wins This Month
- Shipped payments v3 ahead of schedule
- Zero P0 incidents
- 3 engineers completed AWS certifications

## Issues to Address
- 2 engineers showing Slack disengagement (-40% messages)
- Junior dev onboarding taking 20% longer than target`,
  },
  {
    id: 'T2-002',
    name: 'product-team-report.md',
    tier: 2,
    category: 'Product',
    content: `# Product Team — Monthly Progress Report

## Team Overview
- Size: 8 product managers
- Average performance score: 68.1 / 100
- Trending up: 5 PMs
- Trending down: 2 PMs (root cause: roadmap instability)

## Output Metrics
- PRDs written: 12 (target: 10)
- Feature launches: 4 (target: 5)
- Stakeholder satisfaction: 7.8 / 10

## Issues
- One PM on performance improvement plan (PIP)
- Feature scope creep causing engineering friction
- 2 PMs have low calendar utilization (< 60% of meetings attended)`,
  },
  {
    id: 'T2-003',
    name: 'sales-team-report.md',
    tier: 2,
    category: 'Sales',
    content: `# Sales Team — Monthly Progress Report

## Team Overview
- Size: 15 AEs + 4 SDRs
- Average performance score: 65.3 / 100
- Quota attainment: 78% of team at or above quota

## Revenue Metrics
- Pipeline generated: $4.2M
- Deals closed: $1.8M
- Win rate: 24% (industry avg: 22%)

## Coaching Opportunities
- 3 AEs with declining call-to-meeting conversion
- 2 SDRs with low outreach volume (AI flagged as potential burnout signals)

## Training Needs (AI Detected)
- Objection handling (4 AEs)
- Enterprise discovery calls (2 AEs)`,
  },
  {
    id: 'T2-004',
    name: 'hr-operations-report.md',
    tier: 2,
    category: 'HR',
    content: `# HR Operations — AI System Usage Report

## Dashboard Usage
- Weekly active managers: 18/21 (86%)
- Avg time in dashboard per session: 22 minutes
- Alerts actioned within 48 hours: 91%

## AI Flags Issued This Month
- High attrition risk: 4 employees
- Disengagement detected: 7 employees
- Outstanding performer: 3 employees

## HR Actions Taken
- 4 1:1 retention conversations scheduled
- 2 compensation reviews fast-tracked
- 1 wellness program referral

## System Feedback from Managers
- "Finally I can see trends before they become problems" — VP Eng
- "The weekly digest saves me hours" — Sales Director`,
  },
  {
    id: 'T2-005',
    name: 'sprint-velocity-analysis.md',
    tier: 2,
    category: 'Engineering',
    content: `# Sprint Velocity Analysis — Engineering

## 12-Week Trend
| Sprint | Points Committed | Points Completed | Completion % |
|--------|-----------------|-----------------|--------------|
| S-14 | 89 | 76 | 85% |
| S-15 | 92 | 88 | 96% |
| S-16 | 85 | 71 | 84% |
| S-17 | 90 | 90 | 100% |
| S-18 | 94 | 87 | 93% |

## AI Observations
- Team velocity peaks mid-quarter, drops in final sprint (deadline pressure pattern)
- 3 engineers consistently over-commit (commitment calibration needed)
- Senior engineers carry disproportionate review burden (45% of reviews by 2 people)`,
  },
  {
    id: 'T2-006',
    name: 'attrition-risk-q3.md',
    tier: 2,
    category: 'HR',
    content: `# Attrition Risk Analysis — Q3

## Summary
- Total employees analyzed: 185
- High risk (>70% probability): 6 employees
- Medium risk (40-70%): 14 employees
- Low risk (<40%): 165 employees

## High Risk Profiles (Anonymized)
| ID | Department | Tenure | Risk Score | Primary Signal |
|----|-----------|--------|-----------|----------------|
| E-042 | Engineering | 3.5 yrs | 82% | Declining PR activity, market job search signals |
| E-117 | Sales | 1.2 yrs | 78% | Below quota for 3 consecutive months |
| E-203 | Product | 4.1 yrs | 74% | Reduced meeting engagement, lateral move request |

## Recommended Actions
1. Immediate 1:1 with direct manager
2. Compensation benchmarking review
3. Internal mobility conversation`,
  },
  {
    id: 'T2-007',
    name: 'skill-gap-analysis.md',
    tier: 2,
    category: 'Learning',
    content: `# Skill Gap Analysis — Organization Wide

## Critical Skill Gaps Detected
| Skill | Employees Lacking | Business Impact | Training Priority |
|-------|-----------------|-----------------|------------------|
| AI/ML Fundamentals | 47 | High | P1 |
| System Design | 12 (junior eng) | Medium | P2 |
| Data Analysis (SQL) | 23 (non-tech) | High | P1 |
| Stakeholder Management | 8 (senior ICs) | Medium | P2 |

## Learning Path Recommendations
- AI Literacy: 4-week internal bootcamp (Gemini-powered)
- SQL: 2-week self-paced + certification
- System Design: Bi-weekly eng talks + book club

## Investment Required
- Internal training content: 120 hours of creation
- External certifications: $45,000 budget
- Expected ROI: Reduce external hiring by 15%`,
  },
  {
    id: 'T2-008',
    name: 'manager-effectiveness-scores.md',
    tier: 2,
    category: 'HR',
    content: `# Manager Effectiveness Report

## Overall
- Managers evaluated: 21
- Average effectiveness score: 74.2 / 100
- Range: 48 – 96

## Top Performers
| Manager | Score | Team Size | Team eNPS | Team Attrition |
|---------|-------|----------|-----------|----------------|
| Sarah K. | 96 | 7 | 72 | 0% |
| Marcus T. | 91 | 5 | 68 | 0% |

## Needs Improvement
| Manager | Score | Issues |
|---------|-------|--------|
| Greg P. | 48 | High team attrition (25%), low 1:1 cadence |
| Linda F. | 52 | Poor feedback quality scores |

## AI Recommendations
- Coaching program for bottom-quartile managers
- Pair low-scoring managers with high-scoring mentors`,
  },
  {
    id: 'T2-009',
    name: 'onboarding-effectiveness.md',
    tier: 2,
    category: 'HR',
    content: `# Onboarding Effectiveness Analysis

## Time to Productivity (TTP)
| Role | Target TTP | Actual TTP | Delta |
|------|-----------|-----------|-------|
| Junior Engineer | 60 days | 74 days | +23% |
| Senior Engineer | 30 days | 27 days | -10% |
| Product Manager | 45 days | 51 days | +13% |
| SDR | 21 days | 18 days | -14% |

## Root Cause Analysis (AI)
Junior engineer TTP is extended due to:
1. Insufficient codebase documentation
2. Buddy program inconsistently applied (6/10 cases)
3. Dev environment setup taking avg 4.5 days

## Recommendations
- Automate dev environment setup (Docker)
- Require buddy assignment confirmation in day-1 checklist
- Generate AI-assisted codebase tour for each new hire`,
  },
  {
    id: 'T2-010',
    name: 'performance-review-automation.md',
    tier: 2,
    category: 'HR',
    content: `# Performance Review Automation — Design Doc

## Old Process (Manual)
- Manager spends 4 hrs gathering data
- Writes performance narrative (1.5 hrs)
- Submits to HR for calibration (1 week process)
- Total: ~8 hours per employee review

## New Process (AI-Assisted)
- AI pre-generates draft from 90 days of signals (0 manager time)
- Manager reviews, edits, approves (30 min)
- Auto-submitted to HR calibration dashboard
- Total: ~30 minutes per employee review

## Time Savings
- 185 employees × 7.5 hours saved = **1,387 hours/cycle**
- At $85/hr blended manager cost = **$117,895 per review cycle**

## Quality Improvements
- Data-driven (not memory-based)
- Consistent scoring rubric applied to all
- Bias reduction (AI flags inconsistent ratings)`,
  },
  {
    id: 'T2-011',
    name: 'feedback-sentiment-analysis.md',
    tier: 2,
    category: 'Analytics',
    content: `# Feedback Sentiment Analysis

## Peer Feedback Summary (Last Quarter)
- Total feedback items analyzed: 1,247
- Positive sentiment: 68%
- Neutral: 22%
- Negative: 10%

## Common Positive Themes
- "Reliable and communicative" (mentioned 143x)
- "Strong technical skills" (mentioned 98x)
- "Great at unblocking others" (mentioned 87x)

## Common Negative Themes
- "Hard to get hold of" (mentioned 34x)
- "Misses deadlines" (mentioned 29x)
- "Needs to be more proactive" (mentioned 22x)

## Department Breakdown
| Dept | Positive % | Negative % | Key Concern |
|------|-----------|-----------|-------------|
| Engineering | 72% | 8% | Communication |
| Sales | 61% | 14% | Accountability |
| Product | 71% | 9% | Scope management |`,
  },
  {
    id: 'T2-012',
    name: 'engagement-trends.md',
    tier: 2,
    category: 'Analytics',
    content: `# Employee Engagement Trend Analysis

## eNPS Trend
| Quarter | Score | Responses |
|---------|-------|----------|
| Q1 2024 | 24 | 142 |
| Q2 2024 | 28 | 158 |
| Q3 2024 | 31 | 161 |
| Q4 2024 | 38 | 175 |
| Q1 2025 | 41 | 182 |

## AI Engagement Signals (Real-time)
- Slack active users (daily): 178/185 (96%)
- Avg messages/day/employee: 47 (up from 38 Q1)
- After-hours Slack activity: 12% (down from 19% — good sign)

## Red Flags This Week
- 3 employees with zero Slack messages for 5+ days
- Meeting acceptance rate dropped 8% in Sales team`,
  },
  {
    id: 'T2-013',
    name: 'compensation-benchmarking.md',
    tier: 2,
    category: 'HR',
    content: `# Compensation Benchmarking Report

## Market Data Sources
- Levels.fyi (Engineering)
- Glassdoor (All functions)
- Radford Survey (HR benchmark)
- LinkedIn Salary Insights

## Key Findings
| Role | Our Median | Market P50 | Delta |
|------|-----------|-----------|-------|
| Senior Engineer | $178K | $192K | -7.3% |
| Product Manager | $154K | $148K | +4.1% |
| SDR | $72K | $68K | +5.9% |
| AE | $115K | $118K | -2.5% |

## Attrition Risk by Compensation Band
- Below market >10%: 4 employees — HIGH risk
- Below market 5-10%: 11 employees — MEDIUM risk
- At/above market: 170 employees — LOW risk

## Recommended Adjustments
Total budget needed for corrections: $340,000/year`,
  },
  {
    id: 'T2-014',
    name: 'team-health-scorecard.md',
    tier: 2,
    category: 'Analytics',
    content: `# Team Health Scorecard — All Departments

## Health Dimensions Tracked
- 🔵 Velocity: Are we shipping at a consistent pace?
- 🟢 Wellbeing: Are people burning out?
- 🟡 Alignment: Do teams understand priorities?
- 🔴 Retention Risk: Who might leave?

## Current Scorecard
| Team | Velocity | Wellbeing | Alignment | Retention |
|------|---------|-----------|----------|-----------|
| Engineering | 🟢 85 | 🟡 62 | 🟢 80 | 🟡 70 |
| Product | 🟡 68 | 🟢 71 | 🟡 65 | 🟢 82 |
| Sales | 🟡 71 | 🔴 55 | 🟢 78 | 🟡 66 |
| HR/Ops | 🟢 88 | 🟢 79 | 🟢 85 | 🟢 88 |`,
  },
  {
    id: 'T2-015',
    name: 'pilot-phase-retrospective.md',
    tier: 2,
    category: 'Planning',
    content: `# Pilot Phase Retrospective

## What We Tested
- 40 Engineering employees over 8 weeks
- Full AI tracking pipeline live
- Manager dashboards deployed

## What Worked
1. **Weekly digests**: 100% of managers read them
2. **Alert accuracy**: 89% of flagged employees confirmed as having real issues
3. **Time savings**: Managers saved avg 3.2 hrs/week

## What Didn't Work
1. **Data lag**: GitHub to dashboard took 4-6 hours (needed < 2)
2. **False positives**: 3 high performers flagged at-risk during vacation
3. **Dashboard UX**: Too many metrics on one screen

## Changes for Phase 2
- Implement vacation calendar exclusions in scoring
- Reduce dashboard to 5 primary metrics (down from 14)
- Real-time GitHub webhook integration`,
  },

  // ─── TIER 3: Individual / Operational (17 files) ───────────────────────────
  {
    id: 'T3-001',
    name: 'employee-E042-profile.md',
    tier: 3,
    category: 'Employee',
    content: `# Employee Profile: E-042 (Alex Chen)
Role: Senior Software Engineer | Dept: Engineering | Tenure: 3.5 years
Performance Score: 61 | Trend: ↓ | Attrition Risk: 82%

## Signal Summary
- PR merge rate down 34% last 30 days
- Slack response time: 6.2 hrs avg (was 1.8 hrs)
- Completed 0 code reviews last sprint
- Job search signals: LinkedIn activity spike detected

## Manager Notes
Last 1:1: 3 weeks ago. Alex mentioned feeling "stuck in maintenance mode."

## AI Recommendation
Immediate retention conversation. Discuss career trajectory. 
Consider moving to greenfield project on Platform team.`,
  },
  {
    id: 'T3-002',
    name: 'employee-E117-profile.md',
    tier: 3,
    category: 'Employee',
    content: `# Employee Profile: E-117 (Maya Patel)
Role: Account Executive | Dept: Sales | Tenure: 1.2 years
Performance Score: 38 | Trend: ↓↓ | Attrition Risk: 78%

## Signal Summary
- Quota attainment: 52% (3rd consecutive miss)
- Call activity down 22% vs peers
- Pipeline added: $180K (team avg: $420K)
- Disengagement detected in team Slack

## Manager Notes
Recently promoted to Mid-Market AE. May be struggling with deal complexity.

## AI Recommendation
PIP review needed. Root cause unclear: skills gap vs territory mismatch vs personal issues.
Schedule structured coaching sessions with top AE as shadow mentor.`,
  },
  {
    id: 'T3-003',
    name: 'employee-E203-profile.md',
    tier: 3,
    category: 'Employee',
    content: `# Employee Profile: E-203 (James O'Brien)
Role: Senior Product Manager | Dept: Product | Tenure: 4.1 years
Performance Score: 59 | Trend: ↓ | Attrition Risk: 74%

## Signal Summary
- PRDs delivered on time: 50% (was 90%)
- Meeting attendance: 64% (was 88%)
- Lateral move request submitted 6 weeks ago (no response yet)

## Manager Notes
James appears disengaged. Has been vocal about wanting to move into AI product space.

## AI Recommendation
Priority action: Address the lateral move request. Delay is the likely driver of disengagement.
Consider internal transfer to AI product team — aligns with his stated interests.`,
  },
  {
    id: 'T3-004',
    name: 'employee-E089-profile.md',
    tier: 3,
    category: 'Employee',
    content: `# Employee Profile: E-089 (Sarah Kim)
Role: Staff Engineer | Dept: Engineering | Tenure: 5.2 years
Performance Score: 94 | Trend: ↑ | Attrition Risk: 8%

## Signal Summary
- PR merge rate: +18% above team avg
- Mentoring 3 junior engineers (self-initiated)
- Leading architecture review working group
- eNPS score submitted: 9/10

## Manager Notes
Sarah is a culture anchor. Strong candidate for Engineering Manager track.

## AI Recommendation
Immediate: Promotion discussion. Risk of losing her if career path isn't clarified.
Initiate engineering management track conversation.`,
  },
  {
    id: 'T3-005',
    name: 'employee-E155-profile.md',
    tier: 3,
    category: 'Employee',
    content: `# Employee Profile: E-155 (Daniel Park)
Role: Junior Software Engineer | Dept: Engineering | Tenure: 0.4 years
Performance Score: 52 | Trend: → | Attrition Risk: 22%

## Signal Summary
- Onboarding checklist completion: 78% (target: 100% by day 30)
- PRs opened: 3 (team junior avg: 8)
- Buddy program engagement: Low (2 meetings in 4 weeks)

## Manager Notes
Daniel is quiet in stand-ups. May be overwhelmed by codebase size.

## AI Recommendation
Increase buddy meeting frequency. Assign smaller, self-contained tickets to build confidence.
No attrition risk yet but early intervention critical.`,
  },
  {
    id: 'T3-006',
    name: 'employee-E071-profile.md',
    tier: 3,
    category: 'Employee',
    content: `# Employee Profile: E-071 (Rachel Torres)
Role: Product Designer | Dept: Product | Tenure: 2.8 years
Performance Score: 81 | Trend: ↑ | Attrition Risk: 12%

## Signal Summary
- Design reviews received avg 4.8/5 stars
- Cross-functional collaboration score: 92
- Figma file output: +28% vs last quarter

## Manager Notes
Rachel has been key to the new design system. Deserves recognition.

## AI Recommendation
Consider for "Spotlight" in next all-hands. No action needed — monitor.`,
  },
  {
    id: 'T3-007',
    name: 'employee-E112-profile.md',
    tier: 3,
    category: 'Employee',
    content: `# Employee Profile: E-112 (Tom Wright)
Role: Sales Development Rep | Dept: Sales | Tenure: 0.8 years
Performance Score: 45 | Trend: → | Attrition Risk: 41%

## Signal Summary
- Outreach calls this week: 34 (target: 60)
- Meeting booked rate: 8% (team avg: 12%)
- Response to manager messages: avg 4.1 hours

## Manager Notes
Tom started strong in month 1 but has plateaued. Seems demotivated.

## AI Recommendation
1:1 wellbeing check-in. Call recording review to identify skills gap.
Burnout risk is moderate — check in on workload perception.`,
  },
  {
    id: 'T3-008',
    name: 'meeting-notes-2025-06-15.md',
    tier: 3,
    category: 'Meeting',
    content: `# Meeting Notes — AI System Review
Date: June 15, 2025 | Attendees: CEO, CTO, Head of HR, VP Engineering

## Agenda Items
1. Pilot results review
2. Phase 2 expansion decision
3. Employee concerns raised in Slack survey

## Key Decisions
- ✅ Approved Phase 2 expansion to Product + Sales
- ✅ Budget approved: $180K for Q3 infra + tooling
- ❌ Rejected: Real-time Slack content scanning (privacy concern)

## Action Items
| Owner | Action | Deadline |
|-------|--------|---------|
| CTO | Scale Kafka pipeline for 200+ users | July 15 |
| HR | Send employee communication plan draft | June 22 |
| CEO | Record short video message to all staff | June 25 |`,
  },
  {
    id: 'T3-009',
    name: 'meeting-notes-2025-06-28.md',
    tier: 3,
    category: 'Meeting',
    content: `# Meeting Notes — Manager Training Session
Date: June 28, 2025 | Attendees: 21 managers + HR team

## Session Goals
- Train managers on reading AI performance dashboards
- Address concerns about AI replacing manager judgment
- Walk through alert workflow

## Key Feedback from Managers
- "I like the weekly summary but want to configure my own alerts"
- "The attrition score explanation is unclear — needs plain English"
- "When can I see the historical data going back further?"

## Action Items
| Owner | Action | Deadline |
|-------|--------|---------|
| Product | Add custom alert config to roadmap | July 5 |
| ML Team | Add plain-English attrition explanation | July 8 |
| Eng | Backfill historical data (6 months) | July 20 |`,
  },
  {
    id: 'T3-010',
    name: 'slack-integration-setup.md',
    tier: 3,
    category: 'Technical',
    content: `# Slack Integration — Technical Setup Notes

## Current Status
- Enterprise Grid upgrade: Approved (July 15 cutover)
- Bot scope approved: users:read, channels:history (metadata only)
- Data extraction method: Event API (NOT web scraping)

## Signals Being Extracted
- Message send timestamps (NOT content)
- Channel membership changes
- Reaction counts per user
- Direct message count (NOT content)

## Privacy Controls
- Content is hashed before transmission
- No message text leaves Slack
- All metadata anonymized in storage

## Gotchas
- Rate limit: 100 requests/minute per workspace
- Enterprise Grid requires separate app install per workspace
- "Status" emojis excluded from mood analysis (too unreliable)`,
  },
  {
    id: 'T3-011',
    name: 'github-integration-setup.md',
    tier: 3,
    category: 'Technical',
    content: `# GitHub Enterprise Integration — Setup Notes

## Connection Method
GitHub App (preferred over PAT for audit trail)
App Name: g-brain-tracker | Installed on: EhteshamCo org

## Webhooks Configured
- push: PR opened, merged, closed
- pull_request_review: Review submitted
- issues: Issue assigned, closed
- workflow_run: CI pass/fail

## Metrics Derived
- Commit frequency (daily)
- PR cycle time (open → merge)
- Review participation rate
- CI failure rate by author

## Known Issues
- Rebased commits inflate commit count — using merge commits only
- Bots filtered by checking for [bot] suffix in username`,
  },
  {
    id: 'T3-012',
    name: 'jira-integration-setup.md',
    tier: 3,
    category: 'Technical',
    content: `# Jira Cloud Integration — Setup Notes

## Auth
OAuth 2.0 with 3LO, scoped to read:jira-work

## Fields Extracted
- Assignee, Reporter, Status, Story Points
- Sprint membership
- Time in status transitions
- Comments per ticket (count only)

## Derived Metrics
- Ticket close rate per sprint
- Avg days tickets stay In Progress
- Blocker identification (label = blocker)
- Estimation accuracy (committed vs delivered SP)

## Caveats
- Different teams use Jira differently (not normalized yet)
- Story point inflation detected in 2 teams (calibration needed)`,
  },
  {
    id: 'T3-013',
    name: 'data-pipeline-incident-log.md',
    tier: 3,
    category: 'Technical',
    content: `# Data Pipeline — Incident Log

## Incident P2 — June 4, 2025
**Duration**: 6 hours
**Root Cause**: Kafka consumer lag spike caused by GitHub rate limit exhaustion
**Impact**: Performance scores stale for 6 hours for Engineering team
**Resolution**: Implemented exponential backoff + request queue
**Status**: Resolved ✅

## Incident P3 — June 18, 2025
**Duration**: 2 hours  
**Root Cause**: Jira OAuth token expired (rotation not automated)
**Impact**: Jira metrics missing from daily update
**Resolution**: Automated token rotation via Cloud Scheduler
**Status**: Resolved ✅

## Improvements Made
- Added synthetic monitoring on all 5 data sources
- PagerDuty alert if data freshness > 3 hours`,
  },
  {
    id: 'T3-014',
    name: 'employee-E199-stub.md',
    tier: 3,
    category: 'Employee',
    content: `# Employee Profile: E-199 (Marcus Webb)
Role: Account Executive | Dept: Sales | Tenure: 2.1 years
Performance Score: 76 | Trend: → | Attrition Risk: 18%

## Signal Summary
- Quota attainment: 98%
- Call activity: On target
- No red flags detected

## AI Status
Low-touch monitoring. Next full review at quarter end.`,
  },
  {
    id: 'T3-015',
    name: 'employee-E023-stub.md',
    tier: 3,
    category: 'Employee',
    content: `# Employee Profile: E-023 (Linda Foster)
Role: Engineering Manager | Dept: Engineering | Tenure: 6.3 years
Performance Score: 52 | Trend: ↓ | Attrition Risk: 35%

## Signal Summary
- Team attrition under her: 2 departures in 3 months
- Direct report satisfaction (anon survey): 5.9/10
- 1:1 cadence: 62% (target: 90%)

## AI Recommendation
Manager effectiveness coaching. Pair with high-performing manager mentor.`,
  },
  {
    id: 'T3-016',
    name: 'model-retraining-log.md',
    tier: 3,
    category: 'Technical',
    content: `# ML Model Retraining Log

## Attrition Model v1.0 → v1.1 (June 20, 2025)
**Trigger**: 4 false positives in pilot (employees flagged who did not leave)
**Changes**:
- Added vacation calendar as exclusion feature
- Increased lookback window from 30 to 45 days
- Weighted manager feedback signal higher (+0.08)
**Result**: False positive rate dropped 3.2% → 1.8%

## Sentiment Model v2.3 (June 25, 2025)
**Trigger**: Poor performance on sarcasm detection
**Changes**: Fine-tuned on 500 labeled internal Slack examples
**Result**: Accuracy improved 71% → 84% on held-out set`,
  },
  {
    id: 'T3-017',
    name: 'q3-budget-allocation.md',
    tier: 3,
    category: 'Finance',
    content: `# Q3 Budget Allocation — AI Tracking System

## Total Q3 Budget: $180,000

## Breakdown
| Category | Budget | Spent | Remaining |
|---------|--------|-------|----------|
| Cloud Infrastructure (GCP) | $45,000 | $28,400 | $16,600 |
| ML Model Costs (Vertex AI) | $30,000 | $12,100 | $17,900 |
| External APIs (Proxycurl, etc) | $15,000 | $8,200 | $6,800 |
| Engineering Headcount | $75,000 | $75,000 | $0 |
| Training & Change Mgmt | $15,000 | $3,400 | $11,600 |

## Forecast
On track to be 8% under budget. Reserve buffer for Workday integration (est. $12K).`,
  },
];

export function getFilesByTier(tier: 1 | 2 | 3) {
  return BRAIN_FILES.filter(f => f.tier === tier);
}

export function getFileById(id: string) {
  return BRAIN_FILES.find(f => f.id === id);
}
