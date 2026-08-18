import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, ChevronRight, RotateCcw, 
  HelpCircle, Sparkles, BookOpen, User, 
  Layers, Cpu, ArrowRight, CheckCircle,
  Activity, BarChart3, Clock, Zap, GitBranch,
  ArrowRightLeft, Gauge, Eye
} from 'lucide-react';

interface TraceStep {
  clock: number;
  biuAction: string;
  biuStatus: 'Fetching' | 'Idle';
  biuAddress: string;
  biuByte: string;
  queue: string[];
  euAction: string;
  euStatus: 'Executing' | 'Idle';
  euInst: string;
  explanation: string;
  activeInstructionIdx: number; // 0, 1, 2, or -1
}

// 14-step deterministic clock cycle trace representing 8086 FIFO pipelining
const TRACE_STEPS: TraceStep[] = [
  {
    clock: 0,
    biuAction: 'Idle',
    biuStatus: 'Idle',
    biuAddress: '----',
    biuByte: '--',
    queue: [],
    euAction: 'Idle',
    euStatus: 'Idle',
    euInst: 'None',
    explanation: 'Simulation ready. Click "Start Simulation" or step with "Next Cycle" to watch the 8086 pipeline and digital waveforms evolve.',
    activeInstructionIdx: -1
  },
  {
    clock: 1,
    biuAction: 'Fetching opcode byte B8',
    biuStatus: 'Fetching',
    biuAddress: '01000H',
    biuByte: 'B8',
    queue: ['B8'],
    euAction: 'Idle (Queue filling)',
    euStatus: 'Idle',
    euInst: 'Waiting',
    explanation: 'C1: BIU initiates Memory Read at 01000H and fetches opcode B8 (MOV AX opcode) into Queue Slot 1.',
    activeInstructionIdx: 0
  },
  {
    clock: 2,
    biuAction: 'Fetching low operand byte 34',
    biuStatus: 'Fetching',
    biuAddress: '01001H',
    biuByte: '34',
    queue: ['B8', '34'],
    euAction: 'Idle (Queue filling)',
    euStatus: 'Idle',
    euInst: 'Waiting',
    explanation: 'C2: BIU fetches immediate low byte 34 from 01001H into Queue Slot 2.',
    activeInstructionIdx: 0
  },
  {
    clock: 3,
    biuAction: 'Fetching high operand byte 12',
    biuStatus: 'Fetching',
    biuAddress: '01002H',
    biuByte: '12',
    queue: ['B8', '34', '12'],
    euAction: 'Idle (Queue filling)',
    euStatus: 'Idle',
    euInst: 'Waiting',
    explanation: 'C3: BIU fetches immediate high byte 12 from 01002H. Instruction 1 (MOV AX, 1234H) is now fully prefetched in the queue.',
    activeInstructionIdx: 0
  },
  {
    clock: 4,
    biuAction: 'Fetching opcode byte BB (Inst 2)',
    biuStatus: 'Fetching',
    biuAddress: '01003H',
    biuByte: 'BB',
    queue: ['34', '12', 'BB'],
    euAction: 'Executing MOV AX, 1234H (Decodes B8)',
    euStatus: 'Executing',
    euInst: 'MOV AX, 1234H',
    explanation: '⚡ C4 PIPELINE OVERLAP: EU pulls B8 from Queue and begins executing Inst 1. Simultaneously, BIU fetches opcode BB for Inst 2!',
    activeInstructionIdx: 0
  },
  {
    clock: 5,
    biuAction: 'Fetching low byte 78 (Inst 2)',
    biuStatus: 'Fetching',
    biuAddress: '01004H',
    biuByte: '78',
    queue: ['12', 'BB', '78'],
    euAction: 'Executing MOV AX, 1234H (Loads 34)',
    euStatus: 'Executing',
    euInst: 'MOV AX, 1234H',
    explanation: '⚡ C5 OVERLAP: EU processes low byte 34. Concurrently, BIU fetches operand byte 78 of Inst 2.',
    activeInstructionIdx: 0
  },
  {
    clock: 6,
    biuAction: 'Fetching high byte 56 (Inst 2)',
    biuStatus: 'Fetching',
    biuAddress: '01005H',
    biuByte: '56',
    queue: ['BB', '78', '56'],
    euAction: 'Executing MOV AX, 1234H (Completes AX=1234H)',
    euStatus: 'Executing',
    euInst: 'MOV AX, 1234H',
    explanation: '⚡ C6 OVERLAP: EU completes Inst 1 (AX ← 1234H). BIU finishes fetching all 3 bytes of Inst 2 into the queue.',
    activeInstructionIdx: 0
  },
  {
    clock: 7,
    biuAction: 'Fetching opcode byte B9 (Inst 3)',
    biuStatus: 'Fetching',
    biuAddress: '01006H',
    biuByte: 'B9',
    queue: ['78', '56', 'B9'],
    euAction: 'Executing MOV BX, 5678H (Decodes BB)',
    euStatus: 'Executing',
    euInst: 'MOV BX, 5678H',
    explanation: '⚡ C7 OVERLAP: EU starts Inst 2 immediately (0 memory delay!). BIU concurrently fetches opcode B9 of Inst 3.',
    activeInstructionIdx: 1
  },
  {
    clock: 8,
    biuAction: 'Fetching low byte BC (Inst 3)',
    biuStatus: 'Fetching',
    biuAddress: '01007H',
    biuByte: 'BC',
    queue: ['56', 'B9', 'BC'],
    euAction: 'Executing MOV BX, 5678H (Loads 78)',
    euStatus: 'Executing',
    euInst: 'MOV BX, 5678H',
    explanation: '⚡ C8 OVERLAP: EU processes low byte 78 for BX. BIU fetches byte BC of Inst 3 into queue.',
    activeInstructionIdx: 1
  },
  {
    clock: 9,
    biuAction: 'Fetching high byte 9A (Inst 3)',
    biuStatus: 'Fetching',
    biuAddress: '01008H',
    biuByte: '9A',
    queue: ['B9', 'BC', '9A'],
    euAction: 'Executing MOV BX, 5678H (Completes BX=5678H)',
    euStatus: 'Executing',
    euInst: 'MOV BX, 5678H',
    explanation: '⚡ C9 OVERLAP: EU completes Inst 2 (BX ← 5678H). BIU finishes prefetching all 3 bytes of Inst 3.',
    activeInstructionIdx: 1
  },
  {
    clock: 10,
    biuAction: 'Idle (All 9 stream bytes prefetched)',
    biuStatus: 'Idle',
    biuAddress: '----',
    biuByte: '--',
    queue: ['BC', '9A'],
    euAction: 'Executing MOV CX, 9ABCH (Decodes B9)',
    euStatus: 'Executing',
    euInst: 'MOV CX, 9ABCH',
    explanation: 'C10: EU immediately starts executing Inst 3 from queue (B9). BIU is Idle as entire instruction stream is prefetched.',
    activeInstructionIdx: 2
  },
  {
    clock: 11,
    biuAction: 'Idle (Prefetch complete)',
    biuStatus: 'Idle',
    biuAddress: '----',
    biuByte: '--',
    queue: ['9A'],
    euAction: 'Executing MOV CX, 9ABCH (Loads BC)',
    euStatus: 'Executing',
    euInst: 'MOV CX, 9ABCH',
    explanation: 'C11: EU loads low byte BC into CX. Queue now holds only the final byte.',
    activeInstructionIdx: 2
  },
  {
    clock: 12,
    biuAction: 'Idle (Prefetch complete)',
    biuStatus: 'Idle',
    biuAddress: '----',
    biuByte: '--',
    queue: [],
    euAction: 'Executing MOV CX, 9ABCH (Completes CX=9ABCH)',
    euStatus: 'Executing',
    euInst: 'MOV CX, 9ABCH',
    explanation: 'C12: EU completes Inst 3 (CX ← 9ABCH). All 3 instructions executed in only 12 clock cycles total!',
    activeInstructionIdx: 2
  },
  {
    clock: 13,
    biuAction: 'Idle',
    biuStatus: 'Idle',
    biuAddress: '----',
    biuByte: '--',
    queue: [],
    euAction: 'Idle (Completed)',
    euStatus: 'Idle',
    euInst: 'Done',
    explanation: '🎉 Pipelining complete! Without pipelining, 3 instructions × 6 cycles = 18 clocks. With 8086 pipelining = 12 clocks (33.3% speedup).',
    activeInstructionIdx: -1
  }
];

export default function PipeliningSimulator() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'simulator' | 'waveforms' | 'comparison'>('simulator');

  const stepData = TRACE_STEPS[currentStep];

  useEffect(() => {
    let intervalId: any = null;
    if (isPlaying) {
      intervalId = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < TRACE_STEPS.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 2000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying]);

  const handleStartStop = () => {
    if (currentStep === TRACE_STEPS.length - 1) {
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleNextStep = () => {
    setIsPlaying(false);
    if (currentStep < TRACE_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const memoryBytes = [
    { value: 'B8', inst: 1, label: 'B8 (MOV AX opcode)', addr: '01000H' },
    { value: '34', inst: 1, label: '34 (AX Low Byte)', addr: '01001H' },
    { value: '12', inst: 1, label: '12 (AX High Byte)', addr: '01002H' },
    { value: 'BB', inst: 2, label: 'BB (MOV BX opcode)', addr: '01003H' },
    { value: '78', inst: 2, label: '78 (BX Low Byte)', addr: '01004H' },
    { value: '56', inst: 2, label: '56 (BX High Byte)', addr: '01005H' },
    { value: 'B9', inst: 3, label: 'B9 (MOV CX opcode)', addr: '01006H' },
    { value: 'BC', inst: 3, label: 'BC (CX Low Byte)', addr: '01007H' },
    { value: '9A', inst: 3, label: '9A (CX High Byte)', addr: '01008H' },
  ];

  const renderQueueBoxes = () => {
    const boxes = [];
    for (let i = 0; i < 6; i++) {
      const byte = stepData.queue[i] || '';
      boxes.push(
        <motion.div
          key={i}
          layoutId={`queue-box-${i}-${byte}`}
          className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex flex-col items-center justify-center border-2 font-mono text-base font-bold transition-all relative ${
            byte 
              ? 'bg-indigo-600 text-white border-indigo-700 shadow-md shadow-indigo-600/10' 
              : 'bg-slate-50 text-slate-300 border-dashed border-slate-300'
          }`}
        >
          {byte ? (
            <motion.span 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-base md:text-lg tracking-tight"
            >
              {byte}
            </motion.span>
          ) : (
            <span className="text-[11px] text-slate-400 font-normal">empty</span>
          )}
          <span className="absolute -top-5 text-[9px] text-slate-400 font-mono">Slot {i + 1}</span>
        </motion.div>
      );
    }
    return boxes;
  };

  // Graphical Waveform Renderer for Clocks 1 to 12
  const renderWaveformDiagram = (isFullView: boolean = false) => {
    const clockNumbers = Array.from({ length: 12 }, (_, i) => i + 1);

    return (
      <div className="bg-white text-slate-900 rounded-2xl p-4 md:p-6 border border-slate-200 shadow-xs overflow-hidden">
        {/* Header inside waveform container */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm md:text-base font-bold font-mono text-slate-900 flex items-center gap-2">
                Digital Timing Waveforms – 8086 Instruction Pipeline
              </h3>
              <p className="text-xs text-slate-500">
                Shows simultaneous BIU (Bus Fetch) & EU (Execution) activity across clock cycles $C_1$ to $C_{12}$.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Active Scrubber: <strong className="text-indigo-950">C{currentStep}</strong>
            </span>
          </div>
        </div>

        {/* Waveform Canvas / Timeline Grid */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[700px] select-none">
            
            {/* Clock Header Track */}
            <div className="grid grid-cols-13 gap-0 border-b border-slate-200 pb-2 mb-2 items-center">
              <div className="col-span-1 text-right pr-3 font-mono text-[11px] font-bold text-slate-500">
                SIGNAL
              </div>
              <div className="col-span-12 grid grid-cols-12 gap-1 text-center font-mono">
                {clockNumbers.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentStep(c);
                    }}
                    className={`py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      currentStep === c
                        ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-300'
                        : c >= 4 && c <= 9
                          ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/80'
                    }`}
                  >
                    C{c}
                    {c >= 4 && c <= 9 && (
                      <span className="block text-[8px] text-emerald-700 font-semibold">Overlap</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Overlap Zone Banner */}
            <div className="grid grid-cols-13 gap-0 mb-3 items-center">
              <div className="col-span-1 text-right pr-3 font-mono text-[10px] text-slate-400 font-bold">
                STATE
              </div>
              <div className="col-span-12 grid grid-cols-12 gap-1">
                <div className="col-span-3 bg-indigo-50 border border-indigo-200 rounded px-2 py-1 text-[10px] font-mono text-indigo-700 text-center font-semibold">
                  Queue Initial Fill (C1–C3)
                </div>
                <div className="col-span-6 bg-emerald-50 border border-emerald-300 rounded px-2 py-1 text-[10px] font-mono font-bold text-emerald-800 text-center flex items-center justify-center gap-1 shadow-2xs">
                  <Zap className="w-3 h-3 text-emerald-600" />
                  ⚡ 100% PARALLEL PIPELINE OVERLAP ZONE (C4–C9: BIU + EU Active)
                </div>
                <div className="col-span-3 bg-amber-50 border border-amber-200 rounded px-2 py-1 text-[10px] font-mono text-amber-800 text-center font-semibold">
                  Queue Drain (C10–C12)
                </div>
              </div>
            </div>

            {/* 1. CLOCK WAVEFORM (Square Wave) */}
            <div className="grid grid-cols-13 gap-0 mb-3 items-center">
              <div className="col-span-1 text-right pr-3 font-mono text-[11px] font-bold text-blue-700">
                CLK
              </div>
              <div className="col-span-12 grid grid-cols-12 gap-1">
                {clockNumbers.map((c) => (
                  <div 
                    key={c} 
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentStep(c);
                    }}
                    className={`h-9 rounded-md border flex items-center justify-center cursor-pointer transition-all ${
                      currentStep === c 
                        ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-200' 
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <svg className="w-full h-8" viewBox="0 0 100 40" preserveAspectRatio="none">
                      <path
                        d="M 0 32 L 0 8 L 50 8 L 50 32 L 100 32"
                        stroke={currentStep === c ? '#4338ca' : '#2563eb'}
                        strokeWidth="2.5"
                        fill="none"
                      />
                    </svg>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. BIU BUS FETCH TRACK */}
            <div className="grid grid-cols-13 gap-0 mb-3 items-center">
              <div className="col-span-1 text-right pr-3 font-mono text-[11px] font-bold text-amber-800 leading-tight">
                BIU FETCH
                <span className="block text-[9px] font-normal text-slate-500">(Bus)</span>
              </div>
              <div className="col-span-12 grid grid-cols-12 gap-1">
                {clockNumbers.map((c) => {
                  const step = TRACE_STEPS[c];
                  const isFetching = step?.biuStatus === 'Fetching';
                  const isCurrent = currentStep === c;

                  return (
                    <div
                      key={c}
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentStep(c);
                      }}
                      className={`h-11 rounded-md border flex flex-col items-center justify-center cursor-pointer transition-all ${
                        isCurrent 
                          ? 'ring-2 ring-amber-500 shadow-xs scale-105 z-10' 
                          : 'hover:brightness-95'
                      } ${
                        isFetching
                          ? c <= 3
                            ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                            : c <= 6
                              ? 'bg-orange-50 border-orange-300 text-orange-900 font-bold'
                              : 'bg-yellow-50 border-yellow-300 text-yellow-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <span className="font-mono text-[11px] font-extrabold">
                        {isFetching ? `Fetch ${step.biuByte}` : 'IDLE'}
                      </span>
                      {isFetching && (
                        <span className="font-mono text-[8px] opacity-80 text-slate-600">
                          {step.biuAddress}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. EU EXECUTION TRACK */}
            <div className="grid grid-cols-13 gap-0 mb-3 items-center">
              <div className="col-span-1 text-right pr-3 font-mono text-[11px] font-bold text-emerald-800 leading-tight">
                EU EXECUTE
                <span className="block text-[9px] font-normal text-slate-500">(ALU)</span>
              </div>
              <div className="col-span-12 grid grid-cols-12 gap-1">
                {/* Clocks 1 to 3: Idle */}
                <div 
                  onClick={() => { setIsPlaying(false); setCurrentStep(1); }}
                  className={`col-span-3 h-11 rounded-md border border-dashed border-slate-300 bg-slate-50 text-slate-400 flex flex-col items-center justify-center font-mono text-xs cursor-pointer ${
                    currentStep >= 1 && currentStep <= 3 ? 'ring-2 ring-slate-400 bg-slate-100' : 'hover:bg-slate-100'
                  }`}
                >
                  <span className="text-[10px] font-semibold uppercase">EU Idle</span>
                  <span className="text-[8px] text-slate-500">Waiting for Queue</span>
                </div>

                {/* Clocks 4 to 6: Inst 1 (MOV AX, 1234H) */}
                <div 
                  onClick={() => { setIsPlaying(false); setCurrentStep(4); }}
                  className={`col-span-3 h-11 rounded-md border border-emerald-300 bg-emerald-50 text-emerald-900 flex flex-col items-center justify-center font-mono text-xs cursor-pointer shadow-2xs ${
                    currentStep >= 4 && currentStep <= 6 ? 'ring-2 ring-emerald-500 bg-emerald-100' : 'hover:bg-emerald-100/70'
                  }`}
                >
                  <span className="text-[10px] font-extrabold text-emerald-900">Execute Inst 1</span>
                  <span className="text-[8px] text-emerald-700 font-semibold">MOV AX, 1234H</span>
                </div>

                {/* Clocks 7 to 9: Inst 2 (MOV BX, 5678H) */}
                <div 
                  onClick={() => { setIsPlaying(false); setCurrentStep(7); }}
                  className={`col-span-3 h-11 rounded-md border border-teal-300 bg-teal-50 text-teal-900 flex flex-col items-center justify-center font-mono text-xs cursor-pointer shadow-2xs ${
                    currentStep >= 7 && currentStep <= 9 ? 'ring-2 ring-teal-500 bg-teal-100' : 'hover:bg-teal-100/70'
                  }`}
                >
                  <span className="text-[10px] font-extrabold text-teal-900">Execute Inst 2</span>
                  <span className="text-[8px] text-teal-700 font-semibold">MOV BX, 5678H</span>
                </div>

                {/* Clocks 10 to 12: Inst 3 (MOV CX, 9ABCH) */}
                <div 
                  onClick={() => { setIsPlaying(false); setCurrentStep(10); }}
                  className={`col-span-3 h-11 rounded-md border border-cyan-300 bg-cyan-50 text-cyan-900 flex flex-col items-center justify-center font-mono text-xs cursor-pointer shadow-2xs ${
                    currentStep >= 10 && currentStep <= 12 ? 'ring-2 ring-cyan-500 bg-cyan-100' : 'hover:bg-cyan-100/70'
                  }`}
                >
                  <span className="text-[10px] font-extrabold text-cyan-900">Execute Inst 3</span>
                  <span className="text-[8px] text-cyan-700 font-semibold">MOV CX, 9ABCH</span>
                </div>
              </div>
            </div>

            {/* 4. PREFETCH QUEUE FILL LEVEL TRACK */}
            <div className="grid grid-cols-13 gap-0 items-center">
              <div className="col-span-1 text-right pr-3 font-mono text-[11px] font-bold text-indigo-800 leading-tight">
                QUEUE FILL
                <span className="block text-[9px] font-normal text-slate-500">(0–6 Bytes)</span>
              </div>
              <div className="col-span-12 grid grid-cols-12 gap-1">
                {clockNumbers.map((c) => {
                  const qLen = TRACE_STEPS[c]?.queue.length || 0;
                  const isCurrent = currentStep === c;

                  return (
                    <div
                      key={c}
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentStep(c);
                      }}
                      className={`h-9 rounded-md border flex items-center justify-center cursor-pointer transition-all ${
                        isCurrent 
                          ? 'bg-indigo-600 text-white border-indigo-700 ring-2 ring-indigo-300' 
                          : 'bg-indigo-50/70 border-indigo-200 text-indigo-800 hover:bg-indigo-100'
                      }`}
                    >
                      <span className="font-mono text-xs font-bold">
                        {qLen}B
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Waveform Legend & Interactive Guidance */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-600">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
              BIU Fetch (Bus Read)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              EU Execution Active
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600" />
              FIFO Queue Depth
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-300" />
              Idle / Stalled
            </span>
          </div>

          <div className="text-emerald-700 font-bold flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Click any clock (C1–C12) to jump simulator state!
          </div>
        </div>
      </div>
    );
  };

  // Comparative Waveform: Sequential (Non-Pipelined) vs. Pipelined 8086
  const renderComparisonSection = () => {
    return (
      <div className="space-y-6">
        {/* Comparative Banner */}
        <div className="bg-gradient-to-r from-indigo-50 via-slate-50 to-emerald-50 p-6 rounded-2xl text-slate-900 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700">
              Hardware Performance Benchmark
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
            Non-Pipelined vs. 8086 Pipelined Timing Comparison
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
            In non-pipelined microprocessors (like the 8085), the CPU must sequentially fetch all instruction bytes before executing, keeping the Execution Unit stalled during fetches and the Bus idle during execution.
            The 8086 achieves true concurrency via its partitioned BIU and EU architecture.
          </p>
        </div>

        {/* Timing Diagram 1: Without Pipelining (18 Clocks) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <h3 className="font-mono text-sm font-bold text-slate-900">
                1. Without Pipelining (Sequential 8085 Style) – 18 Clock Cycles Total
              </h3>
            </div>
            <span className="text-xs font-mono font-bold bg-rose-50 text-rose-700 px-2.5 py-1 rounded-md border border-rose-200">
              Execution Time: 18 Clocks
            </span>
          </div>

          <p className="text-xs text-slate-600 font-sans">
            Each 3-byte MOV instruction takes 3 cycles to fetch + 3 cycles to execute = 6 cycles per instruction. For 3 instructions: 6 × 3 = <strong>18 cycles</strong>.
          </p>

          <div className="overflow-x-auto pb-2">
            <div className="min-w-[700px] space-y-1.5 font-mono text-[11px]">
              {/* Timeline row */}
              <div className="grid grid-cols-18 gap-1 text-center font-bold">
                {Array.from({ length: 18 }, (_, i) => i + 1).map((c) => (
                  <div key={c} className="py-0.5 text-[10px] text-slate-400 bg-slate-50 rounded">
                    C{c}
                  </div>
                ))}
              </div>

              {/* Operations row */}
              <div className="grid grid-cols-18 gap-1 text-center font-bold">
                {/* Inst 1 */}
                <div className="col-span-3 bg-amber-100 text-amber-900 border border-amber-300 rounded p-1.5">
                  Fetch Inst 1 (B8, 34, 12)
                </div>
                <div className="col-span-3 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded p-1.5">
                  Exec Inst 1 (MOV AX)
                </div>
                {/* Inst 2 */}
                <div className="col-span-3 bg-amber-100 text-amber-900 border border-amber-300 rounded p-1.5">
                  Fetch Inst 2 (BB, 78, 56)
                </div>
                <div className="col-span-3 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded p-1.5">
                  Exec Inst 2 (MOV BX)
                </div>
                {/* Inst 3 */}
                <div className="col-span-3 bg-amber-100 text-amber-900 border border-amber-300 rounded p-1.5">
                  Fetch Inst 3 (B9, BC, 9A)
                </div>
                <div className="col-span-3 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded p-1.5">
                  Exec Inst 3 (MOV CX)
                </div>
              </div>

              <div className="grid grid-cols-18 gap-1 text-center text-[9.5px]">
                <div className="col-span-3 text-rose-600 bg-rose-50 rounded py-0.5 border border-rose-100 font-semibold">EU Stalled (3C)</div>
                <div className="col-span-3 text-slate-500 bg-slate-50 rounded py-0.5 border border-slate-200">Bus Idle (3C)</div>
                <div className="col-span-3 text-rose-600 bg-rose-50 rounded py-0.5 border border-rose-100 font-semibold">EU Stalled (3C)</div>
                <div className="col-span-3 text-slate-500 bg-slate-50 rounded py-0.5 border border-slate-200">Bus Idle (3C)</div>
                <div className="col-span-3 text-rose-600 bg-rose-50 rounded py-0.5 border border-rose-100 font-semibold">EU Stalled (3C)</div>
                <div className="col-span-3 text-slate-500 bg-slate-50 rounded py-0.5 border border-slate-200">Bus Idle (3C)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Timing Diagram 2: With 8086 Pipelining (12 Clocks) */}
        <div className="bg-white rounded-2xl border-2 border-emerald-300 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-mono text-sm font-extrabold text-slate-900 flex items-center gap-2">
                2. With 8086 Pipelined Architecture – 12 Clock Cycles Total
              </h3>
            </div>
            <span className="text-xs font-mono font-extrabold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-md border border-emerald-300 shadow-2xs">
              ⚡ 6 Cycles Saved (33.3% Faster!)
            </span>
          </div>

          <p className="text-xs text-slate-600 font-sans">
            BIU fetches Inst 2 while EU executes Inst 1. Zero waiting time for memory fetches during steady state execution!
          </p>

          <div className="overflow-x-auto pb-2">
            <div className="min-w-[700px] space-y-2 font-mono text-[11px]">
              {/* Clocks row */}
              <div className="grid grid-cols-12 gap-1 text-center font-bold">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((c) => (
                  <div key={c} className={`py-0.5 text-[10px] rounded ${c >= 4 && c <= 9 ? 'bg-emerald-100 text-emerald-900 font-extrabold' : 'bg-slate-100 text-slate-500'}`}>
                    C{c}
                  </div>
                ))}
              </div>

              {/* BIU Row */}
              <div className="grid grid-cols-12 gap-1 text-center">
                <div className="col-span-3 bg-amber-100 text-amber-900 border border-amber-300 rounded p-1.5 font-bold">
                  BIU: Fetch Inst 1 (B8,34,12)
                </div>
                <div className="col-span-3 bg-orange-100 text-orange-900 border border-orange-300 rounded p-1.5 font-bold">
                  BIU: Fetch Inst 2 (BB,78,56)
                </div>
                <div className="col-span-3 bg-yellow-100 text-yellow-900 border border-yellow-300 rounded p-1.5 font-bold">
                  BIU: Fetch Inst 3 (B9,BC,9A)
                </div>
                <div className="col-span-3 bg-slate-100 text-slate-400 border border-slate-200 rounded p-1.5 italic text-[10px] flex items-center justify-center">
                  BIU Idle (Prefetch Done)
                </div>
              </div>

              {/* EU Row */}
              <div className="grid grid-cols-12 gap-1 text-center">
                <div className="col-span-3 bg-slate-100 text-slate-400 border border-dashed border-slate-300 rounded p-1.5 italic text-[10px] flex items-center justify-center">
                  EU Idle (Initial Fill)
                </div>
                <div className="col-span-3 bg-emerald-100 text-emerald-900 border border-emerald-400 rounded p-1.5 font-bold">
                  EU: Exec Inst 1 (MOV AX)
                </div>
                <div className="col-span-3 bg-teal-100 text-teal-900 border border-teal-400 rounded p-1.5 font-bold">
                  EU: Exec Inst 2 (MOV BX)
                </div>
                <div className="col-span-3 bg-cyan-100 text-cyan-900 border border-cyan-400 rounded p-1.5 font-bold">
                  EU: Exec Inst 3 (MOV CX)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Comparative Summary Table */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">Clock Savings</span>
            <div className="text-2xl font-black text-emerald-600 font-mono">18 → 12 Cycles</div>
            <p className="text-xs text-slate-600 font-sans">
              33.3% reduction in execution time for 3 sequential instructions.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">EU Stall Time</span>
            <div className="text-2xl font-black text-indigo-600 font-mono">9 Cycles → 3 Cycles</div>
            <p className="text-xs text-slate-600 font-sans">
              EU only stalls during the very first 3 startup clocks. Zero stall thereafter.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">Bus Efficiency</span>
            <div className="text-2xl font-black text-amber-600 font-mono">100% Prefetch Overlap</div>
            <p className="text-xs text-slate-600 font-sans">
              BIU continuously keeps the 6-byte FIFO queue saturated with future instructions.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="pipelining-simulator-container" className="w-full max-w-7xl mx-auto p-4 md:p-8 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-6 select-none">
      
      {/* SECTION 1 — HEADER & NAVIGATION TABS */}
      <div className="border-b border-slate-100 pb-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-mono font-bold text-indigo-700 flex items-center gap-1 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                Parallel Execution
              </span>
              <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-xs font-mono font-bold text-emerald-700">
                8086 Architecture
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              8086 Instruction Pipelining & Waveform Explorer
            </h1>
            <p className="text-slate-600 text-xs md:text-sm font-medium">
              Explore how the Bus Interface Unit (BIU) and Execution Unit (EU) overlap fetch and execute cycles via the 6-byte prefetch queue.
            </p>
          </div>

          {/* Navigation View Switcher */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-mono font-bold self-start md:self-auto border border-slate-200">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'simulator'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Live Pipeline Simulator
            </button>
            <button
              onClick={() => setActiveTab('waveforms')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'waveforms'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Graphical Waveforms
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'comparison'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Pipelined vs Sequential
            </button>
          </div>
        </div>
      </div>

      {/* RENDER ACTIVE TAB CONTENT */}
      {activeTab === 'waveforms' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                Simulation Step: Clock C{currentStep} / C12
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleStartStop}
                className={`px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  isPlaying 
                    ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                {isPlaying ? 'Pause' : 'Play Timeline'}
              </button>

              <button
                onClick={handleNextStep}
                disabled={currentStep === TRACE_STEPS.length - 1}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer flex items-center gap-1 disabled:opacity-40"
              >
                Next Clock
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleReset}
                className="p-2 bg-white hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer"
                title="Reset"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Full Waveform Diagram */}
          {renderWaveformDiagram(true)}

          {/* Current Step Detailed Breakdown */}
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
            <h3 className="font-mono text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Cycle C{currentStep} Waveform State Summary
            </h3>
            <p className="text-sm text-slate-700 font-medium leading-relaxed">
              {stepData.explanation}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 font-mono text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">BIU Bus Signal</span>
                <span className={`font-extrabold block mt-0.5 ${stepData.biuStatus === 'Fetching' ? 'text-amber-700' : 'text-slate-500'}`}>
                  {stepData.biuAction}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Queue Fill State</span>
                <span className="font-extrabold text-indigo-700 block mt-0.5">
                  {stepData.queue.length} Bytes ({stepData.queue.length > 0 ? stepData.queue.join(', ') : 'Empty'})
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">EU ALU Activity</span>
                <span className={`font-extrabold block mt-0.5 ${stepData.euStatus === 'Executing' ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {stepData.euAction}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'comparison' && renderComparisonSection()}

      {activeTab === 'simulator' && (
        <div className="space-y-8">
          {/* TOP: LIVE INTEGRATED GRAPHICAL WAVEFORMS */}
          {renderWaveformDiagram(false)}

          {/* MAIN SIMULATOR GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* LEFT COLUMN (Simulation & Live visualization) - 7 cols */}
            <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
              
              {/* SECTION 2 — SIMPLE PIPELINE DIAGRAM */}
              <div className="space-y-3 bg-slate-50/60 border border-slate-200/80 p-5 md:p-6 rounded-2xl">
                <h2 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-slate-400" />
                  Section 2 — Simple Pipeline Architecture Diagram
                </h2>
                
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
                  {/* Memory Node */}
                  <div className="flex-1 bg-white border border-slate-200 p-3 rounded-xl text-center shadow-2xs relative">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Source</span>
                    <span className="text-sm font-bold text-slate-800">MEMORY</span>
                    <div className="mt-1 flex justify-center gap-1 overflow-hidden max-w-full">
                      {memoryBytes.map((mb, idx) => {
                        const isFetched = currentStep > 0 && memoryBytes.slice(0, currentStep).some(m => m.value === mb.value);
                        return (
                          <span 
                            key={idx} 
                            className={`text-[9px] font-mono font-semibold px-1 rounded ${
                              isFetched 
                                ? 'bg-slate-100 text-slate-400 line-through' 
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                            }`}
                          >
                            {mb.value}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center justify-center text-slate-400 shrink-0">
                    <ArrowRight className="w-5 h-5 rotate-90 md:rotate-0" />
                  </div>

                  {/* BIU - Fetch Node */}
                  <div className={`flex-1 p-3 rounded-xl text-center shadow-2xs transition-all border ${
                    stepData.biuStatus === 'Fetching' 
                      ? 'bg-amber-50 border-amber-300 text-amber-900 ring-4 ring-amber-100' 
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider block opacity-70">Unit 1</span>
                    <span className="text-sm font-extrabold block">BIU – FETCH</span>
                    <span className="text-[10.5px] font-mono font-medium opacity-90 block mt-0.5 min-h-[16px]">
                      {stepData.biuStatus === 'Fetching' ? '🔄 Active Fetch' : '💤 Idle'}
                    </span>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center justify-center text-slate-400 shrink-0">
                    <ArrowRight className="w-5 h-5 rotate-90 md:rotate-0" />
                  </div>

                  {/* Queue Node */}
                  <div className="flex-1 bg-indigo-50 border border-indigo-200 p-3 rounded-xl text-center shadow-2xs">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-500 block">FIFO Buffer</span>
                    <span className="text-sm font-extrabold text-indigo-950">6-BYTE QUEUE</span>
                    <span className="text-xs font-semibold text-indigo-700 block mt-0.5">
                      {stepData.queue.length} / 6 Bytes filled
                    </span>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center justify-center text-slate-400 shrink-0">
                    <ArrowRight className="w-5 h-5 rotate-90 md:rotate-0" />
                  </div>

                  {/* EU - Execute Node */}
                  <div className={`flex-1 p-3 rounded-xl text-center shadow-2xs transition-all border ${
                    stepData.euStatus === 'Executing' 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 ring-4 ring-emerald-100' 
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider block opacity-70">Unit 2</span>
                    <span className="text-sm font-extrabold block">EU – EXECUTE</span>
                    <span className="text-[10.5px] font-mono font-medium opacity-90 block mt-0.5 min-h-[16px]">
                      {stepData.euStatus === 'Executing' ? '⚡ Executing' : '💤 Idle'}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 4 — 6-BYTE PREFETCH QUEUE */}
              <div className="bg-slate-50/40 border border-slate-200/60 p-5 md:p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-widest">
                    Section 4 — 6-Byte Prefetch Queue (FIFO)
                  </h2>
                  <span className="text-xs font-semibold font-sans text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-150 animate-pulse">
                    BIU fills queue → EU consumes front byte
                  </span>
                </div>

                {/* Queue Horizontal Boxes */}
                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-3">
                  <AnimatePresence mode="popLayout">
                    {renderQueueBoxes()}
                  </AnimatePresence>
                </div>

                <div className="text-center text-xs text-slate-500 font-mono pt-1">
                  FIFO Buffer: Bytes enter at Slot 6 (right) and shift left. EU consumes front-most byte from Slot 1 (left).
                </div>
              </div>

              {/* SECTION 5 — CLOCK-BY-CLOCK SIMULATION TABLE & CONTROLS */}
              <div className="space-y-4 bg-white border border-slate-200 p-5 md:p-6 rounded-2xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h2 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-widest">
                    Section 5 — Clock-by-Clock Trace Table
                  </h2>
                  
                  {/* Simulation Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleStartStop}
                      className={`px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                        isPlaying 
                          ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Start Simulation
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleNextStep}
                      disabled={currentStep === TRACE_STEPS.length - 1}
                      className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                    >
                      Next Cycle
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={handleReset}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      title="Reset Simulator"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Clock Table */}
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10.5px] font-mono uppercase tracking-wider text-slate-600 border-b border-slate-200">
                        <th className="py-2.5 px-4 font-extrabold w-20">Clock</th>
                        <th className="py-2.5 px-4 font-extrabold w-44">BIU Fetch</th>
                        <th className="py-2.5 px-4 font-extrabold">Queue State (FIFO)</th>
                        <th className="py-2.5 px-4 font-extrabold w-52">EU Execute</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-mono">
                      {TRACE_STEPS.slice(1, currentStep + 1).map((row, idx) => (
                        <tr 
                          key={idx} 
                          className={`transition-colors ${
                            row.clock === currentStep 
                              ? 'bg-indigo-50/80 font-bold text-indigo-900' 
                              : 'text-slate-600'
                          }`}
                        >
                          <td className="py-2 px-4 text-slate-500 font-bold">C{row.clock}</td>
                          <td className="py-2 px-4">
                            <span className={row.biuStatus === 'Fetching' ? 'text-amber-700' : 'text-slate-400'}>
                              {row.biuAction}
                            </span>
                          </td>
                          <td className="py-2 px-4">
                            <div className="flex gap-1.5">
                              {row.queue.length === 0 ? (
                                <span className="text-slate-400 font-normal italic">empty []</span>
                              ) : (
                                row.queue.map((qb, qIdx) => (
                                  <span 
                                    key={qIdx} 
                                    className="bg-indigo-100 text-indigo-800 text-[10px] px-1.5 py-0.5 rounded border border-indigo-200"
                                  >
                                    {qb}
                                  </span>
                                ))
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-4">
                            <span className={row.euStatus === 'Executing' ? 'text-emerald-700' : 'text-slate-400'}>
                              {row.euAction}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {currentStep === 0 && (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-slate-400 italic">
                            No cycles executed yet. Click Start or Next Cycle above to populate clock records.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Live Explanation Overlay */}
                <div className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-xl flex items-start gap-3 mt-2">
                  <HelpCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-mono font-bold text-indigo-800 uppercase tracking-wider block">Cycle C{stepData.clock} Narrative</span>
                    <p className="text-slate-700 text-[13px] font-medium leading-relaxed mt-0.5">
                      {stepData.explanation}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN (Information, Current Activity, Instructions, Analogy) - 5 cols */}
            <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
              
              {/* SECTION 3 — INSTRUCTION STREAM */}
              <div className="space-y-3 bg-white border border-slate-200 p-5 md:p-6 rounded-2xl">
                <h2 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-widest">
                  Section 3 — Instruction Stream
                </h2>
                
                <div className="space-y-3 pt-1">
                  {/* Instruction 1 */}
                  <div className={`p-3.5 rounded-xl border transition-all ${
                    stepData.activeInstructionIdx === 0
                      ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200 shadow-xs'
                      : 'bg-white border-slate-100 opacity-75'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Instruction 1</span>
                      {stepData.activeInstructionIdx === 0 && (
                        <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase font-mono tracking-wider animate-pulse">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-baseline mt-1">
                      <strong className="text-slate-800 font-extrabold text-sm md:text-base">MOV AX, 1234H</strong>
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                        B8 34 12
                      </span>
                    </div>
                  </div>

                  {/* Instruction 2 */}
                  <div className={`p-3.5 rounded-xl border transition-all ${
                    stepData.activeInstructionIdx === 1
                      ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200 shadow-xs'
                      : 'bg-white border-slate-100 opacity-75'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Instruction 2</span>
                      {stepData.activeInstructionIdx === 1 && (
                        <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase font-mono tracking-wider animate-pulse">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-baseline mt-1">
                      <strong className="text-slate-800 font-extrabold text-sm md:text-base">MOV BX, 5678H</strong>
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                        BB 78 56
                      </span>
                    </div>
                  </div>

                  {/* Instruction 3 */}
                  <div className={`p-3.5 rounded-xl border transition-all ${
                    stepData.activeInstructionIdx === 2
                      ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200 shadow-xs'
                      : 'bg-white border-slate-100 opacity-75'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Instruction 3</span>
                      {stepData.activeInstructionIdx === 2 && (
                        <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase font-mono tracking-wider animate-pulse">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-baseline mt-1">
                      <strong className="text-slate-800 font-extrabold text-sm md:text-base">MOV CX, 9ABCH</strong>
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                        B9 BC 9A
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 6 — CURRENT ACTIVITY */}
              <div className="space-y-3 bg-white border border-slate-200 p-5 md:p-6 rounded-2xl">
                <h2 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-widest">
                  Section 6 — Current Hardware Activity
                </h2>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center">
                    <span className="text-[9px] font-mono text-slate-400 font-bold uppercase block">BIU Status</span>
                    <span className={`text-xs font-extrabold mt-1 inline-block px-2 py-0.5 rounded-full ${
                      stepData.biuStatus === 'Fetching' 
                        ? 'bg-amber-100 text-amber-800 border border-amber-250 animate-pulse' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {stepData.biuStatus}
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center">
                    <span className="text-[9px] font-mono text-slate-400 font-bold uppercase block">Queue Bytes</span>
                    <span className="text-xs font-mono font-extrabold text-slate-800 mt-1 block">
                      {stepData.queue.length > 0 ? stepData.queue.join(', ') : 'None'}
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center">
                    <span className="text-[9px] font-mono text-slate-400 font-bold uppercase block">EU Status</span>
                    <span className={`text-xs font-extrabold mt-1 inline-block px-2 py-0.5 rounded-full ${
                      stepData.euStatus === 'Executing' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-250' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {stepData.euStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 7 — SIMPLE EXPLANATION */}
              <div className="bg-slate-50 border border-slate-200/80 p-5 md:p-6 rounded-2xl space-y-4">
                <h2 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  Section 7 — The Core Principle
                </h2>
                
                <p className="text-slate-800 text-xs md:text-sm font-semibold leading-relaxed">
                  "While the EU executes the current instruction, the BIU fetches the next instruction and stores its bytes in the 6-byte prefetch queue."
                </p>

                <div className="grid grid-cols-3 gap-2 py-1 bg-white p-3 rounded-xl border border-slate-100 font-mono text-xs font-extrabold text-center text-slate-800">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-indigo-600 font-bold uppercase">BIU</span>
                    <span className="text-slate-700">↓</span>
                    <span className="bg-indigo-50 text-indigo-900 px-2 py-1 rounded w-full border border-indigo-100">FETCH</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">QUEUE</span>
                    <span className="text-slate-500">↓</span>
                    <span className="bg-slate-50 text-slate-700 px-2 py-1 rounded w-full border border-slate-100">STORE</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-emerald-600 font-bold uppercase">EU</span>
                    <span className="text-slate-700">↓</span>
                    <span className="bg-emerald-50 text-emerald-900 px-2 py-1 rounded w-full border border-emerald-100">EXECUTE</span>
                  </div>
                </div>

                <div className="text-center font-mono font-extrabold text-xs text-indigo-700 bg-indigo-50/50 py-1.5 rounded-lg border border-indigo-100 uppercase tracking-wider">
                  "Overlapping Fetch and Execute = PIPELINING"
                </div>
              </div>

              {/* SECTION 8 — REAL WORLD ANALOGY */}
              <div className="bg-indigo-50/40 border border-indigo-150 p-5 md:p-6 rounded-2xl space-y-3">
                <h2 className="text-xs font-extrabold font-mono text-indigo-700 uppercase tracking-widest flex items-center gap-1.5">
                  <User className="w-4 h-4 text-indigo-500" />
                  Section 8 — Real-World Analogy
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-indigo-100/60 shadow-2xs">
                    <span className="font-bold text-indigo-700 block mb-0.5 text-[11px]">BIU (Fetch)</span>
                    <p className="text-slate-600 font-medium text-[11px] leading-snug">
                      Person bringing books from the library.
                    </p>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-indigo-100/60 shadow-2xs">
                    <span className="font-bold text-indigo-700 block mb-0.5 text-[11px]">Queue (Store)</span>
                    <p className="text-slate-600 font-medium text-[11px] leading-snug">
                      Books waiting in a pile on a desk.
                    </p>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-indigo-100/60 shadow-2xs">
                    <span className="font-bold text-indigo-700 block mb-0.5 text-[11px]">EU (Execute)</span>
                    <p className="text-slate-600 font-medium text-[11px] leading-snug">
                      Student reading the books one by one.
                    </p>
                  </div>
                </div>

                <p className="text-slate-700 text-xs font-semibold leading-relaxed pt-1 border-t border-indigo-100/40">
                  "While the student reads one book, the assistant brings the next book. This completely saves waiting time."
                </p>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
