"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { applyNodeChanges, applyEdgeChanges, addEdge, Connection, Node, Edge } from '@xyflow/react';
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { ActivityFeed, ActivityLog } from "@/components/activity-feed";
import { WorkflowBuilder, SkillMessage, WorkflowPhase } from "@/components/workflow-builder";
import { GBrainGraph } from "@/components/g-brain-graph";
import { ConnectedApps } from "@/components/connected-apps";
import { SKILL_DEFINITIONS } from "@/data/skill-definitions";
import { PlayCircle, RotateCcw, Bot, X, Loader2, FileText } from "lucide-react";

// ── Workflow Node Definitions ──────────────────────────────────────────────────
const makeInitialNodes = (): Node[] => [
  { id: '1', type: 'workflowNode', position: { x: 250, y: 30  }, data: { label: '/office-hours',     status: 'Pending', duration: '--', progress: 0 } },
  { id: '2', type: 'workflowNode', position: { x: 250, y: 200 }, data: { label: '/plan-ceo-review',  status: 'Pending', duration: '--', progress: 0 } },
  { id: '3', type: 'workflowNode', position: { x: 250, y: 370 }, data: { label: '/plan-eng-review',  status: 'Pending', duration: '--', progress: 0 } },
  { id: '4', type: 'workflowNode', position: { x: 250, y: 540 }, data: { label: 'Implementation',    status: 'Pending', duration: '--', progress: 0 } },
  { id: '5', type: 'workflowNode', position: { x: 250, y: 710 }, data: { label: '/qa',               status: 'Pending', duration: '--', progress: 0 } },
];

const INITIAL_EDGES: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
  { id: 'e3-4', source: '3', target: '4', animated: true },
  { id: 'e4-5', source: '4', target: '5', animated: true },
];

// Ordered step IDs for the pipeline
const PIPELINE_STEPS = ['1', '2', '3', '4', '5'];

export default function Workspace() {
  const [activeTab, setActiveTab] = useState<'workflow' | 'gbrain' | 'apps'>('workflow');

  // ── Workflow canvas state ──────────────────────────────────────────────────
  const [workflowNodes, setWorkflowNodes] = useState<Node[]>(makeInitialNodes());
  const [workflowEdges, setWorkflowEdges] = useState<Edge[]>(INITIAL_EDGES);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // ── Skill / Chat state ─────────────────────────────────────────────────────
  const [phase, setPhase] = useState<WorkflowPhase>('idle');
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [skillMessages, setSkillMessages] = useState<SkillMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);   // for office-hours
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // ── Gemini Report State ────────────────────────────────────────────────────
  const [report, setReport] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // ── Metrics (animate during run) ──────────────────────────────────────────
  const [metrics, setMetrics] = useState({ tokens: 0, cost: 0, files: 0 });
  const metricsRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const onNodesChange = useCallback((changes: any) => setWorkflowNodes(nds => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: any) => setWorkflowEdges(eds => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params: Connection) => setWorkflowEdges(eds => addEdge(params, eds)), []);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const addLog = useCallback((message: string, status: ActivityLog['status']) => {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message, status }]);
  }, []);

  const updateNode = useCallback((id: string, status: string, progress: number, duration: string) => {
    setWorkflowNodes(nds => nds.map(n =>
      n.id === id ? { ...n, data: { ...n.data, status, progress, duration } } : n
    ));
  }, []);

  const addSkillMsg = useCallback((text: string, sender: SkillMessage['sender']) => {
    setSkillMessages(prev => [...prev, { id: `${Date.now()}-${Math.random()}`, sender, text }]);
  }, []);

  const tickMetrics = () => {
    if (metricsRef.current) clearInterval(metricsRef.current);
    metricsRef.current = setInterval(() => {
      setMetrics(m => ({
        tokens: Math.min(m.tokens + Math.floor(Math.random() * 4800 + 200), 842000),
        cost: Math.min(+(m.cost + 0.003 + Math.random() * 0.007).toFixed(3), 4.80),
        files: Math.min(m.files + (Math.random() > 0.85 ? 1 : 0), 40),
      }));
    }, 400);
  };

  // ── Start a non-interactive (analytical/progress) step ────────────────────
  const runAnalyticalStep = useCallback((stepId: string, stepIdx: number) => {
    const skill = SKILL_DEFINITIONS[stepId];
    if (!skill) return;

    setActiveNodeId(stepId);
    setPhase('skill-running');
    setSkillMessages([]);
    updateNode(stepId, 'Running', 10, '...');
    addLog(`${skill.label} started`, 'running');

    // Welcome
    setTimeout(() => addSkillMsg(skill.welcomeMessage, 'skill'), 400);

    const messages = skill.analysisMessages || [];
    let totalDelay = 1000;

    messages.forEach((msg, i) => {
      totalDelay += 1800 + i * 400;
      const d = totalDelay;
      setTimeout(() => {
        addSkillMsg(msg, 'skill');
        updateNode(stepId, 'Running', Math.round(((i + 1) / messages.length) * 85), `${i + 2}s`);
      }, d);
    });

    // Complete
    totalDelay += 2000;
    setTimeout(() => {
      addSkillMsg(skill.completionMessage, 'system');
      updateNode(stepId, 'Done', 100, `${Math.floor(totalDelay / 1000)}s`);
      addLog(`${skill.label} completed`, 'success');

      // Advance to next step
      const nextIdx = stepIdx + 1;
      if (nextIdx < PIPELINE_STEPS.length) {
        setTimeout(() => {
          setCurrentStepIndex(nextIdx);
          runAnalyticalStep(PIPELINE_STEPS[nextIdx], nextIdx);
        }, 1500);
      } else {
        // All done
        setPhase('complete');
        setActiveNodeId(null);
        addLog('🎉 Pipeline complete — all steps finished', 'success');
        if (metricsRef.current) clearInterval(metricsRef.current);
        setMetrics({ tokens: 842000, cost: 4.80, files: 40 });
      }
    }, totalDelay);
  }, [addLog, addSkillMsg, updateNode]);

  // ── Start office-hours (interactive) ─────────────────────────────────────
  const startOfficeHours = useCallback(() => {
    const skill = SKILL_DEFINITIONS['1'];
    setActiveNodeId('1');
    setPhase('skill-waiting');
    setSkillMessages([]);
    setQuestionIndex(0);
    setCurrentStepIndex(0);
    updateNode('1', 'Running', 10, '...');
    addLog('/office-hours started — awaiting user input', 'running');

    setTimeout(() => {
      addSkillMsg(skill.welcomeMessage, 'skill');
      setTimeout(() => addSkillMsg(skill.questions![0], 'skill'), 800);
    }, 400);
  }, [addLog, addSkillMsg, updateNode]);

  // ── Handle user answer in office-hours ───────────────────────────────────
  const onSkillSend = useCallback(() => {
    if (!chatInput.trim() || phase !== 'skill-waiting') return;
    const answer = chatInput.trim();
    setChatInput('');
    addSkillMsg(answer, 'user');

    const skill = SKILL_DEFINITIONS['1'];
    const questions = skill.questions!;
    const nextQIdx = questionIndex + 1;

    if (nextQIdx < questions.length) {
      // Ask next question
      setQuestionIndex(nextQIdx);
      updateNode('1', 'Running', Math.round((nextQIdx / questions.length) * 80), `${nextQIdx * 8}s`);
      setTimeout(() => addSkillMsg(questions[nextQIdx], 'skill'), 600);
    } else {
      // All questions answered
      setPhase('skill-running');
      updateNode('1', 'Running', 90, '42s');
      setTimeout(() => {
        addSkillMsg(skill.completionMessage, 'system');
        setTimeout(() => {
          updateNode('1', 'Done', 100, '48s');
          addLog('/office-hours completed — design doc saved to G-Brain', 'success');
          // Advance to CEO Review
          setTimeout(() => {
            setCurrentStepIndex(1);
            runAnalyticalStep('2', 1);
          }, 1500);
        }, 1800);
      }, 800);
    }
  }, [chatInput, phase, questionIndex, addSkillMsg, updateNode, addLog, runAnalyticalStep]);

  // ── Generate Gemini Report when complete ─────────────────────────────────
  useEffect(() => {
    if (phase === 'complete' && !report && !isGeneratingReport) {
      // We only want to use answers provided during office-hours, which means sender === 'user'
      const userAnswers = skillMessages.filter(m => m.sender === 'user').map(m => m.text).join('\n\n');
      if (!userAnswers.trim()) return;

      setIsGeneratingReport(true);
      setShowReportModal(true);

      const prompt = `You are the G-Stack AI Agent Engine. Based on the following answers provided by the user during the /office-hours step:\n\n"${userAnswers}"\n\nGenerate a brief (3-4 paragraphs) Executive Project Report. Use clear spacing and bullet points. Do not use Markdown headers like #. Make it sound highly professional and strategic, summarizing what the system will now build.`;

      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt })
      })
      .then(r => r.json())
      .then(data => {
        setReport(data.reply);
        setIsGeneratingReport(false);
      })
      .catch(() => {
        setReport("Failed to generate report. Make sure your GEMINI_API_KEY is set in .env.local.");
        setIsGeneratingReport(false);
      });
    }
  }, [phase, report, isGeneratingReport, skillMessages]);

  // ── Run Execution button ──────────────────────────────────────────────────
  const runExecution = () => {
    // Reset everything
    setWorkflowNodes(makeInitialNodes());
    setLogs([{ time: new Date().toLocaleTimeString(), message: 'Pipeline triggered — starting /office-hours', status: 'info' }]);
    setSkillMessages([]);
    setPhase('idle');
    setActiveNodeId(null);
    setQuestionIndex(0);
    setCurrentStepIndex(0);
    setMetrics({ tokens: 0, cost: 0, files: 0 });
    setReport(null);
    setShowReportModal(false);
    setIsGeneratingReport(false);

    tickMetrics();

    // Small delay, then kick off office-hours
    setTimeout(() => startOfficeHours(), 800);
  };

  const resetWorkflow = () => {
    setWorkflowNodes(makeInitialNodes());
    setLogs([]);
    setSkillMessages([]);
    setPhase('idle');
    setActiveNodeId(null);
    setQuestionIndex(0);
    setCurrentStepIndex(0);
    setMetrics({ tokens: 0, cost: 0, files: 0 });
    setReport(null);
    setShowReportModal(false);
    setIsGeneratingReport(false);
    if (metricsRef.current) clearInterval(metricsRef.current);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-900">
      <TopBar metrics={metrics} phase={phase} />
      <div className="flex flex-1 h-full overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 h-full overflow-hidden relative">
          {activeTab === 'workflow' && (
            <div className="flex flex-col h-full">
              {/* Top action bar */}
              <div className="flex items-center justify-between px-4 py-2 border-b bg-white shrink-0">
                <div className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Workflow Builder</span>
                  {phase === 'idle' && ' · Click Run Execution to start the interactive G-Stack pipeline'}
                  {phase === 'skill-waiting' && ' · ⏸ Office Hours is waiting for your answers in the chat below'}
                  {phase === 'skill-running' && ' · The active skill is executing automatically'}
                  {phase === 'complete' && ' · ✓ Pipeline complete'}
                </div>
                <div className="flex gap-2">
                  {phase === 'complete' && report && (
                    <button onClick={() => setShowReportModal(true)} className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 border border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 transition-all mr-2">
                      <FileText className="w-3.5 h-3.5" /> View Project Report
                    </button>
                  )}
                  {phase !== 'idle' && (
                    <button onClick={resetWorkflow} className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 border px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 transition-all">
                      <RotateCcw className="w-3.5 h-3.5" /> Reset
                    </button>
                  )}
                  <button
                    onClick={runExecution}
                    disabled={phase === 'skill-waiting' || phase === 'skill-running'}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-1.5 rounded-lg text-xs font-semibold shadow transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    {phase === 'complete' ? 'Run Again' : 'Run Execution'}
                  </button>
                </div>
              </div>

              {/* Canvas + Skill Chat split */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-hidden">
                  <WorkflowBuilder
                    nodes={workflowNodes}
                    edges={workflowEdges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    setNodes={setWorkflowNodes}
                    setEdges={setWorkflowEdges}
                    onConnect={onConnect}
                    activeNodeId={activeNodeId}
                    phase={phase}
                    skillMessages={skillMessages}
                    chatInput={chatInput}
                    setChatInput={setChatInput}
                    onSkillSend={onSkillSend}
                  />
                </div>
              </div>

              {/* Activity Feed */}
              <div className="h-36 border-t shrink-0">
                <ActivityFeed logs={logs} />
              </div>
            </div>
          )}

          {activeTab === 'gbrain' && <GBrainGraph />}
          {activeTab === 'apps' && <ConnectedApps />}
          
          {/* Gemini Report Modal */}
          {showReportModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b bg-slate-50 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-800 text-lg leading-tight">G-Stack Executive Report</h2>
                      <p className="text-xs text-slate-500">Generated by Gemini from your /office-hours session</p>
                    </div>
                  </div>
                  <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-slate-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1 bg-white">
                  {isGeneratingReport ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-4 text-slate-500">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                      <p className="text-sm font-medium animate-pulse">Gemini is synthesizing the project report...</p>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-700 leading-relaxed space-y-4">
                      {report?.split('\n').map((line, i) => {
                        if (line.startsWith('* ') || line.startsWith('- ')) {
                          return <div key={i} className="pl-4 flex gap-2"><span className="text-indigo-500">•</span> <span>{line.substring(2)}</span></div>;
                        }
                        if (line.trim() === '') return <br key={i} />;
                        // Bold formatting rudimentary support
                        const boldParts = line.split(/\*\*(.*?)\*\*/g);
                        return (
                          <p key={i}>
                            {boldParts.map((part, j) => j % 2 === 1 ? <strong key={j} className="font-semibold text-slate-900">{part}</strong> : part)}
                          </p>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                <div className="px-6 py-4 border-t bg-slate-50 shrink-0 flex justify-end">
                  <button 
                    onClick={() => setShowReportModal(false)} 
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
                  >
                    Close Report
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
