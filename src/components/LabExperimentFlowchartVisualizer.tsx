import React, { useState } from 'react';
import {
  Compass,
  ArrowDown,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Cpu,
  Binary,
  HelpCircle,
  Zap,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { LAB_FLOWCHARTS, FlowchartNode, resolveBranchTarget } from '../data/labFlowchartsComprehensiveData';

interface LabExperimentFlowchartVisualizerProps {
  expId: string;
  activeStepIndex?: number | null;
  onSelectNode?: (node: FlowchartNode, idx: number) => void;
  onHoverNode?: (node: FlowchartNode, idx: number) => void;
}

export const LabExperimentFlowchartVisualizer: React.FC<LabExperimentFlowchartVisualizerProps> = ({
  expId,
  activeStepIndex = null,
  onSelectNode,
  onHoverNode
}) => {
  const [internalActiveNodeId, setInternalActiveNodeId] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Record<string, 'yes' | 'no'>>({});
  const [showLegend, setShowLegend] = useState(false);

  const flowchart = LAB_FLOWCHARTS[expId] || LAB_FLOWCHARTS.exp1;

  const handleNodeClick = (node: FlowchartNode, idx: number) => {
    setInternalActiveNodeId(node.id === internalActiveNodeId ? null : node.id);
    if (onSelectNode) {
      onSelectNode(node, idx);
    }
  };

  const handleNodeMouseEnter = (node: FlowchartNode, idx: number) => {
    if (onHoverNode) {
      onHoverNode(node, idx);
    }
  };

  const toggleBranch = (nodeId: string, branch: 'yes' | 'no') => {
    setSelectedBranch((prev) => ({
      ...prev,
      [nodeId]: prev[nodeId] === branch ? ('yes' as const) : branch
    }));
  };

  return (
    <div className="bg-white rounded-2xl p-4 md:p-5 border border-[#B8D4E8] space-y-4 shadow-2xs">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#B8D4E8]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] border border-[#2563EB]/20 shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-[#163A5F] tracking-tight">
              Flow Chart
            </h3>
            <p className="text-xs sm:text-[13px] font-semibold text-[#2563EB]">
              {flowchart.title} - Logic Flowchart
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-bold text-[#163A5F] bg-[#EAF4FB] hover:bg-[#D4E8F8] rounded-lg border border-[#B8D4E8] transition-all cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>{showLegend ? 'Hide Legend' : 'Symbol Legend'}</span>
            {showLegend ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Symbol Standard Legend (Collapsible) */}
      {showLegend && (
        <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#B8D4E8] grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-[#163A5F] animate-fadeIn">
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-[#E2E8F0]">
            <div className="w-6 h-3.5 rounded-full bg-emerald-500/20 border border-emerald-600 shrink-0" />
            <div>
              <div className="font-bold text-[10px]">Oval / Capsule</div>
              <div className="text-[9px] text-[#64748B]">Start / Stop Terminal</div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-[#E2E8F0]">
            <div className="w-6 h-4 rounded bg-blue-500/20 border border-blue-600 shrink-0" />
            <div>
              <div className="font-bold text-[10px]">Rectangle</div>
              <div className="text-[9px] text-[#64748B]">ALU Process / Operation</div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-amber-300 bg-amber-50/40">
            <div className="w-4 h-4 rotate-45 bg-amber-400/30 border-2 border-amber-500 shrink-0 mx-1" />
            <div>
              <div className="font-bold text-[10px] text-amber-900">Rhombus (Diamond)</div>
              <div className="text-[9px] text-amber-700">Decision (YES / NO Branch)</div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-[#E2E8F0]">
            <div className="w-6 h-4 -skew-x-12 bg-purple-500/20 border border-purple-600 shrink-0" />
            <div>
              <div className="font-bold text-[10px]">Parallelogram</div>
              <div className="text-[9px] text-[#64748B]">I/O & Memory Storage</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Flowchart Stage Canvas */}
      <div className="bg-[#EAF4FB]/50 rounded-2xl p-4 md:p-6 border border-[#B8D4E8] flex flex-col items-center space-y-3 overflow-y-auto max-h-[620px] scrollbar-thin">
        {flowchart.nodes.map((node, idx) => {
          const isSelected = activeStepIndex !== null && activeStepIndex !== undefined
            ? (activeStepIndex === idx || (flowchart.nodes[activeStepIndex] && flowchart.nodes[activeStepIndex].id === node.id))
            : (internalActiveNodeId === node.id);
          const isStartStop = node.type === 'start' || node.type === 'stop';
          const isDecision = node.type === 'decision';
          const isIO = node.type === 'io';
          const currentBranch = selectedBranch[node.id] || 'yes';

          return (
            <React.Fragment key={node.id}>
              {/* NODE RENDERING */}
              {isDecision ? (() => {
                const yesTarget = resolveBranchTarget(node.yesBranch, flowchart.nodes, idx);
                const noTarget = resolveBranchTarget(node.noBranch, flowchart.nodes, idx);

                return (
                  /* RHOMBUS / DIAMOND DECISION BOX & FLOW BRANCHES */
                  <div 
                    onMouseEnter={() => handleNodeMouseEnter(node, idx)}
                    className="w-full max-w-xl flex flex-col items-center my-3 space-y-3"
                  >
                    {/* Outer Rhombus Wrapper */}
                    <div
                      onClick={() => handleNodeClick(node, idx)}
                      className={`relative cursor-pointer transition-all duration-200 group flex flex-col items-center w-full max-w-[480px] ${
                        isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'
                      }`}
                    >
                      {/* SVG Diamond Background Frame with Spacious Proportions */}
                      <div className="relative w-full h-48 sm:h-52 flex items-center justify-center">
                        <svg
                          className="absolute inset-0 w-full h-full filter drop-shadow-md transition-all"
                          viewBox="0 0 480 208"
                          preserveAspectRatio="none"
                        >
                          {/* Outer Glow / Ring when selected */}
                          {isSelected && (
                            <polygon
                              points="240,2 476,104 240,206 4,104"
                              className="fill-blue-500/10 stroke-blue-500 stroke-[5]"
                            />
                          )}
                          {/* Main Diamond Body */}
                          <polygon
                            points="240,6 470,104 240,202 10,104"
                            className={`transition-all ${
                              isSelected
                                ? 'fill-amber-100/95 stroke-blue-600 stroke-[3.5]'
                                : 'fill-amber-50 stroke-amber-500 stroke-[2.5] group-hover:stroke-amber-600 group-hover:fill-amber-100/80'
                            }`}
                          />
                        </svg>

                        {/* Content Centered Strictly Inside Rhombus Safe Area */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-12 sm:px-16 pointer-events-none space-y-1.5 z-10">
                          <div className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${
                            isSelected ? 'bg-blue-600 text-white border-blue-700' : 'bg-amber-200 text-amber-900 border-amber-400'
                          }`}>
                            <HelpCircle className="w-3 h-3" />
                            <span>DECISION (RHOMBUS) • STEP {idx + 1}</span>
                          </div>
                          
                          <h4 className={`text-sm sm:text-base font-bold leading-tight max-w-[280px] sm:max-w-[320px] ${
                            isSelected ? 'text-blue-950 font-black' : 'text-amber-950'
                          }`}>
                            {node.label}
                          </h4>

                          {node.decisionQuery && (
                            <div className="text-[11px] font-mono font-bold text-amber-900 bg-amber-200/70 px-2.5 py-0.5 rounded-md border border-amber-300 inline-block max-w-[280px] sm:max-w-[320px] truncate">
                              {node.decisionQuery}
                            </div>
                          )}

                          {node.hardwareFlagTested && (
                            <div className="text-[10px] font-mono text-amber-800 font-semibold">
                              Flag Tested: <span className="font-bold underline decoration-amber-500">{node.hardwareFlagTested}</span>
                            </div>
                          )}
                        </div>

                        {/* Direct Diagrammatic Branch Arrow Labels on Diamond Edges */}
                        {/* BOTTOM TIP -> YES Exit Badge with exact target step */}
                        <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
                          <span className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] sm:text-[11px] font-mono font-bold px-3 py-0.5 rounded-full shadow-md border border-emerald-300 flex items-center gap-1.5 transition-all">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>YES ↓ Go to Step {yesTarget?.targetStepNum || idx + 2}</span>
                          </span>
                        </div>

                        {/* RIGHT TIP -> NO Exit Badge with exact target step */}
                        <div className="absolute top-1/2 -translate-y-1/2 -right-3.5 sm:-right-6 z-20">
                          <span className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] sm:text-[11px] font-mono font-bold px-3 py-0.5 rounded-full shadow-md border border-rose-300 flex items-center gap-1.5 transition-all">
                            <XCircle className="w-3 h-3" />
                            <span>NO → Go to Step {noTarget?.targetStepNum || (idx + 1)}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* VISUAL FLOW BRANCHES: CRYSTAL CLEAR YES / NO SPLIT MATRIX */}
                    <div className="w-full bg-white rounded-xl p-3.5 border-2 border-amber-300 shadow-xs space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono font-bold text-[#163A5F] pb-2 border-b border-amber-200">
                        <span className="flex items-center gap-1.5 text-amber-900">
                          <Zap className="w-4 h-4 text-amber-600" />
                          <span>Branch Target Routing (Step {idx + 1} Decision)</span>
                        </span>
                        <span className="text-[11px] text-[#64748B] font-medium hidden sm:inline">
                          Click branch to inspect execution path
                        </span>
                      </div>

                      {/* STUDENT LAB RECORD WRITING GUIDE BANNER */}
                      <div className="bg-amber-50/90 border border-amber-200 rounded-lg p-2.5 text-[11px] font-mono text-[#163A5F] space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-amber-900">
                          <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          <span>Standard Text to Write in Observation Book / Exam:</span>
                        </div>
                        <p className="bg-white/80 p-1.5 rounded border border-amber-200/80 text-[#163A5F] font-semibold leading-relaxed">
                          "{node.label.replace(/^Is\s+/i, 'Check whether ')}. <span className="text-emerald-700 font-bold">If YES</span>, go to <span className="underline decoration-emerald-500 font-bold">Step {yesTarget?.targetStepNum}</span> ({yesTarget?.targetTitle}); <span className="text-rose-700 font-bold">If NO</span>, go to <span className="underline decoration-rose-500 font-bold">Step {noTarget?.targetStepNum}</span> ({noTarget?.targetTitle})."
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* ================= YES PATH CARD ================= */}
                        {node.yesBranch && (
                          <div
                            onClick={() => toggleBranch(node.id, 'yes')}
                            className={`p-3 rounded-xl border-2 transition-all cursor-pointer space-y-2 relative overflow-hidden ${
                              currentBranch === 'yes'
                                ? 'bg-emerald-50/90 border-emerald-600 ring-2 ring-emerald-500/30 shadow-xs'
                                : 'bg-[#F8FAFC] border-emerald-200/90 hover:bg-emerald-50/50 hover:border-emerald-400'
                            }`}
                          >
                            <div className="flex items-center justify-between border-b border-emerald-200 pb-1.5">
                              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-lg border border-emerald-400 shadow-2xs">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                <span>{node.yesBranch.label}</span>
                              </span>
                              
                              {yesTarget?.isLoopBack ? (
                                <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                                  <RotateCcw className="w-3 h-3 text-amber-600" /> Loop Back
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                                  <ArrowDown className="w-3 h-3 text-emerald-600" /> Proceed Forward
                                </span>
                              )}
                            </div>

                            {/* DESTINATION CALLOUT */}
                            <div className="bg-emerald-100/80 border border-emerald-300 rounded-lg p-1.5 flex items-center gap-1.5 text-emerald-950 font-mono text-xs font-bold">
                              <ArrowRight className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                              <span>Go to Step {yesTarget?.targetStepNum}:</span>
                              <span className="truncate text-emerald-800 font-semibold">{yesTarget?.targetTitle}</span>
                            </div>

                            {/* Condition Description */}
                            <div className="space-y-1">
                              <div className="text-[10px] font-mono uppercase font-bold text-emerald-800">
                                Condition Met:
                              </div>
                              <div className="text-xs font-bold text-emerald-950">
                                {node.yesBranch.conditionText}
                              </div>
                            </div>

                            {/* Action Description */}
                            <div className="space-y-1">
                              <div className="text-[10px] font-mono uppercase font-bold text-emerald-800">
                                Action Taken:
                              </div>
                              <div className="text-xs text-emerald-900 leading-relaxed font-medium">
                                {node.yesBranch.action}
                              </div>
                            </div>

                            {/* 8086 Assembly Branch Instruction */}
                            {node.yesBranch.asmBranchInstruction && (
                              <div className="space-y-0.5 pt-1">
                                <div className="text-[9px] font-mono text-emerald-700 font-bold uppercase">
                                  8086 Instruction:
                                </div>
                                <div className="bg-[#0F172A] text-emerald-300 p-2 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre border border-emerald-900/50">
                                  {node.yesBranch.asmBranchInstruction}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* ================= NO PATH CARD ================= */}
                        {node.noBranch && (
                          <div
                            onClick={() => toggleBranch(node.id, 'no')}
                            className={`p-3 rounded-xl border-2 transition-all cursor-pointer space-y-2 relative overflow-hidden ${
                              currentBranch === 'no'
                                ? 'bg-rose-50/90 border-rose-600 ring-2 ring-rose-500/30 shadow-xs'
                                : 'bg-[#F8FAFC] border-rose-200/90 hover:bg-rose-50/50 hover:border-rose-400'
                            }`}
                          >
                            <div className="flex items-center justify-between border-b border-rose-200 pb-1.5">
                              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-rose-900 bg-rose-100 px-2.5 py-0.5 rounded-lg border border-rose-400 shadow-2xs">
                                <XCircle className="w-3.5 h-3.5 text-rose-700" />
                                <span>{node.noBranch.label}</span>
                              </span>
                              
                              {noTarget?.isLoopBack ? (
                                <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                                  <RotateCcw className="w-3 h-3 text-amber-600" /> Loop Back
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-300 flex items-center gap-1">
                                  <ArrowRight className="w-3 h-3 text-slate-600" /> Branch Target
                                </span>
                              )}
                            </div>

                            {/* DESTINATION CALLOUT */}
                            <div className="bg-rose-100/80 border border-rose-300 rounded-lg p-1.5 flex items-center gap-1.5 text-rose-950 font-mono text-xs font-bold">
                              <ArrowRight className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                              <span>Go to Step {noTarget?.targetStepNum}:</span>
                              <span className="truncate text-rose-800 font-semibold">{noTarget?.targetTitle}</span>
                            </div>

                            {/* Condition Description */}
                            <div className="space-y-1">
                              <div className="text-[10px] font-mono uppercase font-bold text-rose-800">
                                Condition Failed / Alternate:
                              </div>
                              <div className="text-xs font-bold text-rose-950">
                                {node.noBranch.conditionText}
                              </div>
                            </div>

                            {/* Action Description */}
                            <div className="space-y-1">
                              <div className="text-[10px] font-mono uppercase font-bold text-rose-800">
                                Action Taken:
                              </div>
                              <div className="text-xs text-rose-900 leading-relaxed font-medium">
                                {node.noBranch.action}
                              </div>
                            </div>

                            {/* 8086 Assembly Branch Instruction */}
                            {node.noBranch.asmBranchInstruction && (
                              <div className="space-y-0.5 pt-1">
                                <div className="text-[9px] font-mono text-rose-700 font-bold uppercase">
                                  8086 Instruction:
                                </div>
                                <div className="bg-[#0F172A] text-rose-300 p-2 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre border border-rose-900/50">
                                  {node.noBranch.asmBranchInstruction}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })() : isStartStop ? (
                /* START / STOP TERMINAL NODE */
                <div
                  onMouseEnter={() => handleNodeMouseEnter(node, idx)}
                  onClick={() => handleNodeClick(node, idx)}
                  className={`w-full max-w-sm px-6 py-3 rounded-full text-center transition-all cursor-pointer shadow-2xs border-2 ${
                    node.type === 'start'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-emerald-400'
                      : 'bg-gradient-to-r from-slate-800 to-slate-900 text-white border-slate-600'
                  } ${isSelected ? 'ring-4 ring-[#2563EB] scale-105 shadow-md' : 'hover:scale-101'}`}
                >
                  <div className="text-[9px] font-mono uppercase tracking-widest text-emerald-200 font-bold">
                    Terminal Node
                  </div>
                  <div className="text-sm font-bold tracking-wide">{node.label}</div>
                  {node.subLabel && (
                    <div className="text-[10px] text-emerald-100/90 font-mono mt-0.5">
                      {node.subLabel}
                    </div>
                  )}
                </div>
              ) : isIO ? (
                /* I/O PARALLELOGRAM NODE */
                <div
                  onMouseEnter={() => handleNodeMouseEnter(node, idx)}
                  onClick={() => handleNodeClick(node, idx)}
                  className={`w-full max-w-md p-3.5 -skew-x-6 rounded-xl transition-all cursor-pointer shadow-2xs border-2 border-purple-400 bg-purple-50/80 ${
                    isSelected ? 'ring-4 ring-[#2563EB] scale-105 bg-purple-100 shadow-md border-purple-600' : 'hover:scale-101'
                  }`}
                >
                  <div className="skew-x-6 space-y-1 text-center">
                    <div className="text-[9px] font-mono uppercase tracking-wider text-purple-800 font-bold">
                      Data I/O & Memory Storage
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-purple-950">{node.label}</h4>
                    {node.subLabel && (
                      <div className="text-[10px] font-mono text-purple-800">{node.subLabel}</div>
                    )}
                  </div>
                </div>
              ) : (
                /* RECTANGLE PROCESS NODE */
                <div
                  onMouseEnter={() => handleNodeMouseEnter(node, idx)}
                  onClick={() => handleNodeClick(node, idx)}
                  className={`w-full max-w-md p-3.5 rounded-xl transition-all cursor-pointer shadow-2xs border ${
                    isSelected
                      ? 'ring-4 ring-[#2563EB] border-[#2563EB] bg-[#EAF4FB] scale-105 shadow-md'
                      : 'border-[#B8D4E8] bg-white hover:scale-101 hover:border-[#2563EB]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="text-[9px] font-mono uppercase tracking-wider text-[#2563EB] font-bold flex items-center gap-1">
                        <Cpu className="w-2.5 h-2.5" />
                        <span>Process Stage</span>
                      </div>
                      <h4 className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-[#2563EB]' : 'text-[#163A5F]'}`}>{node.label}</h4>
                      {node.subLabel && (
                        <p className="text-[11px] text-[#475569] leading-relaxed">
                          {node.subLabel}
                        </p>
                      )}
                    </div>
                  </div>
                  {node.asmCode && isSelected && (
                    <div className="mt-2 pt-2 border-t border-[#B8D4E8]">
                      <div className="bg-[#0F172A] text-cyan-300 p-2 rounded-lg text-[10px] font-mono overflow-x-auto whitespace-pre">
                        {node.asmCode}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* FLOW DIRECTION ARROW TO NEXT NODE */}
              {idx < flowchart.nodes.length - 1 && (
                <div className="flex flex-col items-center py-0.5">
                  <div className="w-0.5 h-3.5 bg-[#2563EB]/70"></div>
                  <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-[#2563EB]"></div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
