import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, ChevronRight, RotateCcw, 
  HelpCircle, Sparkles, BookOpen, User, 
  Layers, Cpu, ArrowRight, CheckCircle
} from 'lucide-react';

interface TraceStep {
  clock: number;
  biuAction: string;
  biuStatus: 'Fetching' | 'Idle';
  queue: string[];
  euAction: string;
  euStatus: 'Executing' | 'Idle';
  explanation: string;
  activeInstructionIdx: number; // 0, 1, 2, or -1
}

// Exactly the 14-step deterministic clock cycle trace representing standard 8086 FIFO pipelining
const TRACE_STEPS: TraceStep[] = [
  {
    clock: 0,
    biuAction: 'Idle',
    biuStatus: 'Idle',
    queue: [],
    euAction: 'Idle',
    euStatus: 'Idle',
    explanation: 'Simulation is ready. Click "Start Simulation" or "Next Cycle" to watch the pipeline run.',
    activeInstructionIdx: -1
  },
  {
    clock: 1,
    biuAction: 'Fetching byte B8',
    biuStatus: 'Fetching',
    queue: ['B8'],
    euAction: 'Idle',
    euStatus: 'Idle',
    explanation: 'The BIU fetches the first opcode byte (B8) of Instruction 1 from Memory into the Prefetch Queue.',
    activeInstructionIdx: 0
  },
  {
    clock: 2,
    biuAction: 'Fetching byte 34',
    biuStatus: 'Fetching',
    queue: ['B8', '34'],
    euAction: 'Idle',
    euStatus: 'Idle',
    explanation: 'The BIU fetches the next byte (34) of Instruction 1 (low byte of immediate value 1234H) and appends it to the queue.',
    activeInstructionIdx: 0
  },
  {
    clock: 3,
    biuAction: 'Fetching byte 12',
    biuStatus: 'Fetching',
    queue: ['B8', '34', '12'],
    euAction: 'Idle',
    euStatus: 'Idle',
    explanation: 'The BIU fetches the third byte (12) of Instruction 1 (high byte of 1234H). Instruction 1 is now fully prefetched and ready in the queue.',
    activeInstructionIdx: 0
  },
  {
    clock: 4,
    biuAction: 'Fetching byte BB',
    biuStatus: 'Fetching',
    queue: ['34', '12', 'BB'],
    euAction: 'Executing MOV AX, 1234H (B8)',
    euStatus: 'Executing',
    explanation: '🚀 PIPELINING BEGINS! The EU starts executing Instruction 1 by consuming its first byte (B8). Simultaneously, the BIU prefetches the opcode byte (BB) of Instruction 2 from Memory.',
    activeInstructionIdx: 0
  },
  {
    clock: 5,
    biuAction: 'Fetching byte 78',
    biuStatus: 'Fetching',
    queue: ['12', 'BB', '78'],
    euAction: 'Executing MOV AX, 1234H (34)',
    euStatus: 'Executing',
    explanation: 'The EU consumes byte (34) to continue executing Instruction 1. Simultaneously, the BIU prefetches the next byte (78) of Instruction 2.',
    activeInstructionIdx: 0
  },
  {
    clock: 6,
    biuAction: 'Fetching byte 56',
    biuStatus: 'Fetching',
    queue: ['BB', '78', '56'],
    euAction: 'Executing MOV AX, 1234H (12)',
    euStatus: 'Executing',
    explanation: 'The EU consumes the final byte (12) to complete Instruction 1. Simultaneously, the BIU prefetches byte (56) to finish prefetching Instruction 2.',
    activeInstructionIdx: 0
  },
  {
    clock: 7,
    biuAction: 'Fetching byte B9',
    biuStatus: 'Fetching',
    queue: ['78', '56', 'B9'],
    euAction: 'Executing MOV BX, 5678H (BB)',
    euStatus: 'Executing',
    explanation: 'The EU begins executing Instruction 2 by consuming its opcode byte (BB). In parallel, the BIU prefetches byte (B9) (opcode of Instruction 3) into the queue.',
    activeInstructionIdx: 1
  },
  {
    clock: 8,
    biuAction: 'Fetching byte BC',
    biuStatus: 'Fetching',
    queue: ['56', 'B9', 'BC'],
    euAction: 'Executing MOV BX, 5678H (78)',
    euStatus: 'Executing',
    explanation: 'The EU consumes byte (78) to continue Instruction 2, while the BIU prefetches byte (BC) of Instruction 3.',
    activeInstructionIdx: 1
  },
  {
    clock: 9,
    biuAction: 'Fetching byte 9A',
    biuStatus: 'Fetching',
    queue: ['B9', 'BC', '9A'],
    euAction: 'Executing MOV BX, 5678H (56)',
    euStatus: 'Executing',
    explanation: 'The EU consumes the final byte (56) to complete Instruction 2. Simultaneously, the BIU prefetches the last byte (9A) of Instruction 3.',
    activeInstructionIdx: 1
  },
  {
    clock: 10,
    biuAction: 'Idle (All bytes prefetched)',
    biuStatus: 'Idle',
    queue: ['BC', '9A'],
    euAction: 'Executing MOV CX, 9ABCH (B9)',
    euStatus: 'Executing',
    explanation: 'The EU begins executing Instruction 3 by consuming its opcode byte (B9). The BIU is now Idle since all 9 bytes of the instruction stream have been prefetched.',
    activeInstructionIdx: 2
  },
  {
    clock: 11,
    biuAction: 'Idle (All bytes prefetched)',
    biuStatus: 'Idle',
    queue: ['9A'],
    euAction: 'Executing MOV CX, 9ABCH (BC)',
    euStatus: 'Executing',
    explanation: 'The EU consumes the second byte (BC) of Instruction 3. Only 1 byte remains in the queue.',
    activeInstructionIdx: 2
  },
  {
    clock: 12,
    biuAction: 'Idle (All bytes prefetched)',
    biuStatus: 'Idle',
    queue: [],
    euAction: 'Executing MOV CX, 9ABCH (9A)',
    euStatus: 'Executing',
    explanation: 'The EU consumes the final byte (9A) to complete Instruction 3. The prefetch queue is now completely empty.',
    activeInstructionIdx: 2
  },
  {
    clock: 13,
    biuAction: 'Idle',
    biuStatus: 'Idle',
    queue: [],
    euAction: 'Idle',
    euStatus: 'Idle',
    explanation: '🎉 Simulation complete! All 3 instructions were prefetched by the BIU and executed by the EU in parallel, showcasing the power of overlapping CPU operations.',
    activeInstructionIdx: -1
  }
];

export default function PipeliningSimulator() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

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
      }, 2200);
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

  // Memory byte stream representation for Section 2 & 3
  const memoryBytes = [
    { value: 'B8', inst: 1, label: 'B8 (MOV AX opcode)' },
    { value: '34', inst: 1, label: '34 (AX Low Byte)' },
    { value: '12', inst: 1, label: '12 (AX High Byte)' },
    { value: 'BB', inst: 2, label: 'BB (MOV BX opcode)' },
    { value: '78', inst: 2, label: '78 (BX Low Byte)' },
    { value: '56', inst: 2, label: '56 (BX High Byte)' },
    { value: 'B9', inst: 3, label: 'B9 (MOV CX opcode)' },
    { value: 'BC', inst: 3, label: 'BC (CX Low Byte)' },
    { value: '9A', inst: 3, label: '9A (CX High Byte)' },
  ];

  // Helper to determine active queue byte index
  const renderQueueBoxes = () => {
    const boxes = [];
    for (let i = 0; i < 6; i++) {
      const byte = stepData.queue[i] || '';
      boxes.push(
        <motion.div
          key={i}
          layoutId={`queue-box-${i}-${byte}`}
          className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center border-2 font-mono text-base font-bold transition-all relative ${
            byte 
              ? 'bg-indigo-600 text-white border-indigo-700 shadow-md shadow-indigo-600/10' 
              : 'bg-slate-50 text-slate-300 border-dashed border-slate-300'
          }`}
        >
          {byte ? (
            <motion.span 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-lg tracking-tight"
            >
              {byte}
            </motion.span>
          ) : (
            <span className="text-xs text-slate-400 font-normal">empty</span>
          )}
          <span className="absolute -top-6 text-[10px] text-slate-400 font-mono">Slot {i + 1}</span>
        </motion.div>
      );
    }
    return boxes;
  };

  return (
    <div id="pipelining-simulator-container" className="w-full max-w-7xl mx-auto p-4 md:p-8 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-8 select-none">
      
      {/* SECTION 1 — TITLE */}
      <div className="border-b border-slate-100 pb-5 space-y-1">
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
          8086 Instruction Pipelining – Learn by Simulation
        </h1>
        <p className="text-slate-600 text-sm md:text-base font-medium">
          See how the BIU fetches instructions while the EU executes them.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* LEFT COLUMN (Simulation & Live visualization) - 7 cols */}
        <div className="lg:col-span-7 space-y-8 flex flex-col justify-between">
          
          {/* SECTION 2 — SIMPLE PIPELINE DIAGRAM */}
          <div className="space-y-3 bg-slate-50/60 border border-slate-200/80 p-5 md:p-6 rounded-2xl">
            <h2 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-slate-400" />
              Section 2 — Simple Pipeline Diagram
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
                  {stepData.biuStatus === 'Fetching' ? '🔄 Active Fetching' : '💤 Idle'}
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
          <div className="bg-slate-50/40 border border-slate-200/60 p-6 md:p-8 rounded-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-widest">
                Section 4 — 6-Byte Prefetch Queue
              </h2>
              <span className="text-xs font-semibold font-sans text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-150 animate-pulse">
                BIU fills the queue → EU consumes bytes
              </span>
            </div>

            {/* Queue Horizontal Boxes */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
              <AnimatePresence mode="popLayout">
                {renderQueueBoxes()}
              </AnimatePresence>
            </div>

            <div className="text-center text-xs text-slate-500 font-mono pt-2">
              FIFO Buffer: Bytes enter at Slot 6 (from right) and shift left. EU always consumes the front-most byte from Slot 1 (left).
            </div>
          </div>

          {/* SECTION 5 — CLOCK-BY-CLOCK SIMULATION TABLE & CONTROLS */}
          <div className="space-y-4 bg-white border border-slate-200 p-5 md:p-6 rounded-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-widest">
                Section 5 — Clock-by-Clock Simulation
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
            <div className="overflow-x-auto border border-slate-150 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10.5px] font-mono uppercase tracking-wider text-slate-600 border-b border-slate-150">
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
                <p className="text-slate-700 text-[13.5px] font-medium leading-relaxed mt-0.5">
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
            
            <div className="space-y-3 pt-2">
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
                  <strong className="text-slate-800 font-extrabold text-base">MOV AX, 1234H</strong>
                  <span className="font-mono text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                    Machine Code: B8 34 12
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
                  <strong className="text-slate-800 font-extrabold text-base">MOV BX, 5678H</strong>
                  <span className="font-mono text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                    Machine Code: BB 78 56
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
                  <strong className="text-slate-800 font-extrabold text-base">MOV CX, 9ABCH</strong>
                  <span className="font-mono text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                    Machine Code: B9 BC 9A
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 6 — CURRENT ACTIVITY */}
          <div className="space-y-3 bg-white border border-slate-200 p-5 md:p-6 rounded-2xl">
            <h2 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-widest">
              Section 6 — Current Activity
            </h2>

            <div className="grid grid-cols-3 gap-3 pt-2">
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
              Section 7 — Simple Explanation
            </h2>
            
            <p className="text-slate-800 text-sm font-semibold leading-relaxed">
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

            <div className="text-center font-display font-extrabold text-xs text-indigo-700 bg-indigo-50/50 py-1.5 rounded-lg border border-indigo-100 uppercase tracking-wider">
              "Overlapping Fetch and Execute = PIPELINING"
            </div>
          </div>

          {/* SECTION 8 — SIMPLE ANALOGY */}
          <div className="bg-indigo-50/40 border border-indigo-150 p-5 md:p-6 rounded-2xl space-y-4">
            <h2 className="text-xs font-extrabold font-mono text-indigo-700 uppercase tracking-widest flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-500" />
              Section 8 — Real-World Analogy
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1 text-xs">
              <div className="bg-white p-3 rounded-xl border border-indigo-100/60 shadow-2xs">
                <span className="font-bold text-indigo-700 block mb-0.5">BIU (Fetch)</span>
                <p className="text-slate-600 font-medium leading-normal">
                  Person bringing books from the library.
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-indigo-100/60 shadow-2xs">
                <span className="font-bold text-indigo-700 block mb-0.5">Queue (Store)</span>
                <p className="text-slate-600 font-medium leading-normal">
                  Books waiting in a pile on a desk.
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-indigo-100/60 shadow-2xs">
                <span className="font-bold text-indigo-700 block mb-0.5">EU (Execute)</span>
                <p className="text-slate-600 font-medium leading-normal">
                  Student reading the books one by one.
                </p>
              </div>
            </div>

            <p className="text-slate-700 text-xs font-semibold leading-relaxed pt-1 border-t border-indigo-100/40">
              "While the student reads one book, the person brings the next book. This saves time."
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
