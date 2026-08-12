import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  RefreshCw, 
  Play, 
  Pause, 
  Database, 
  Cpu, 
  Binary, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Layers,
  ArrowDown,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface CodeLine {
  offset: string;
  decimalOffset: number;
  label?: string;
  instruction: string;
  comment: string;
  size: number;
  hex: string;
}

const PROGRAM_LINES: CodeLine[] = [
  { offset: '0000H', decimalOffset: 0, instruction: 'MOV AX, 0005H', comment: 'Load AX register with immediate value 05H', size: 3, hex: 'B8 05 00' },
  { offset: '0003H', decimalOffset: 3, instruction: 'CMP AX, 0005H', comment: 'Compare register AX contents with 05H', size: 3, hex: '3D 05 00' },
  { offset: '0006H', decimalOffset: 6, instruction: 'JE  MATCH_FOUND', comment: 'Forward Jump if Equal to label MATCH_FOUND', size: 2, hex: '74 03' },
  { offset: '0008H', decimalOffset: 8, instruction: 'ADD AX, 0002H', comment: 'Add 02H to AX (only runs if AX != 5)', size: 3, hex: '05 02 00' },
  { offset: '000BH', decimalOffset: 11, label: 'MATCH_FOUND', instruction: 'MOV BX, AX', comment: 'Target of JE jump. Move AX to BX', size: 2, hex: '8B D8' },
  { offset: '000DH', decimalOffset: 13, instruction: 'HLT', comment: 'Halt the processor execution', size: 1, hex: 'F4' }
];

export default function AssemblerPassSimulator() {
  const [mode, setMode] = useState<'twopass' | 'onepass'>('twopass');
  
  // Two-Pass states
  const [twopassActivePass, setTwopassActivePass] = useState<1 | 2>(1);
  const [twopassStep, setTwopassStep] = useState<number>(0); // 0 to 7 (step 7 is complete)
  
  // One-Pass states
  const [onepassStep, setOnepassStep] = useState<number>(0); // 0 to 7 (step 7 is complete)
  
  // Auto-play state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1500); // ms per step
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean play/pause interval
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        handleNextStep();
      }, playbackSpeed);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, mode, twopassActivePass, twopassStep, onepassStep, playbackSpeed]);

  const resetAll = () => {
    setIsPlaying(false);
    setTwopassStep(0);
    setTwopassActivePass(1);
    setOnepassStep(0);
  };

  const handleNextStep = () => {
    if (mode === 'twopass') {
      if (twopassActivePass === 1) {
        if (twopassStep < 6) {
          setTwopassStep(prev => prev + 1);
        } else {
          // Transition to Pass 2
          setTwopassActivePass(2);
          setTwopassStep(0);
        }
      } else {
        if (twopassStep < 6) {
          setTwopassStep(prev => prev + 1);
        } else {
          setIsPlaying(false); // Finished Pass 2
          setTwopassStep(7); // Completed
        }
      }
    } else {
      // One-Pass
      if (onepassStep < 6) {
        setOnepassStep(prev => prev + 1);
      } else {
        setIsPlaying(false);
        setOnepassStep(7);
      }
    }
  };

  const handlePrevStep = () => {
    if (mode === 'twopass') {
      if (twopassActivePass === 2) {
        if (twopassStep > 0) {
          setTwopassStep(prev => prev - 1);
        } else {
          // Roll back to end of Pass 1
          setTwopassActivePass(1);
          setTwopassStep(6);
        }
      } else {
        if (twopassStep > 0) {
          setTwopassStep(prev => prev - 1);
        }
      }
    } else {
      // One-pass
      if (onepassStep > 0) {
        setOnepassStep(prev => prev - 1);
      }
    }
  };

  // Helper values for active steps
  const activeStepIndex = mode === 'twopass' ? twopassStep : onepassStep;
  const isCompleted = mode === 'twopass' 
    ? (twopassActivePass === 2 && twopassStep >= 6) 
    : onepassStep >= 6;

  // Compute what goes in the Symbol Table at this point
  const getSymbolTable = () => {
    const table: { symbol: string; value: string; status: 'unresolved' | 'resolved' }[] = [];
    
    if (mode === 'twopass') {
      if (twopassActivePass === 1) {
        // Pass 1 builds table
        // JE MATCH_FOUND is scanned at step 2 (index 2). 
        // In Pass 1, at step 2, the assembler notices MATCH_FOUND but doesn't have an address yet
        if (twopassStep >= 2 && twopassStep < 4) {
          table.push({ symbol: 'MATCH_FOUND', value: 'Unresolved (Pending)', status: 'unresolved' });
        } else if (twopassStep >= 4) {
          // At step 4, the assembler registers MATCH_FOUND at offset 000BH
          table.push({ symbol: 'MATCH_FOUND', value: '000BH', status: 'resolved' });
        }
      } else {
        // Pass 2 already has full Symbol Table
        table.push({ symbol: 'MATCH_FOUND', value: '000BH', status: 'resolved' });
      }
    } else {
      // One-Pass Symbol Table
      if (onepassStep >= 2 && onepassStep < 4) {
        // Scanned JE, but hasn't reached MATCH_FOUND yet
        table.push({ symbol: 'MATCH_FOUND', value: 'Unresolved (Forward Reference)', status: 'unresolved' });
      } else if (onepassStep >= 4) {
        table.push({ symbol: 'MATCH_FOUND', value: '000BH', status: 'resolved' });
      }
    }
    return table;
  };

  // Compute backpatch list for One-pass
  const getBackpatchList = () => {
    const list: { sourceOffset: string; destOffset: string; targetLabel: string; status: 'pending' | 'patched' }[] = [];
    if (mode === 'onepass') {
      if (onepassStep >= 2 && onepassStep < 4) {
        list.push({ 
          sourceOffset: '0007H', 
          destOffset: '??', 
          targetLabel: 'MATCH_FOUND', 
          status: 'pending' 
        });
      } else if (onepassStep >= 4) {
        list.push({ 
          sourceOffset: '0007H', 
          destOffset: '03H', 
          targetLabel: 'MATCH_FOUND', 
          status: 'patched' 
        });
      }
    }
    return list;
  };

  // Create explanation message based on exact step
  const getStepExplanation = (): string => {
    if (mode === 'twopass') {
      if (twopassActivePass === 1) {
        switch (twopassStep) {
          case 0:
            return "Pass 1: Reading 'MOV AX, 0005H'. Since it is an instruction, we calculate its size (3 bytes). The Location Counter (LC) starts at 0000H. It will increment to 0003H for the next line.";
          case 1:
            return "Pass 1: Reading 'CMP AX, 0005H'. Size is 3 bytes. Location Counter increments from 0003H to 0006H. No machine code is output yet.";
          case 2:
            return "Pass 1: Reading 'JE MATCH_FOUND'. Size is 2 bytes. The assembler notes a reference to 'MATCH_FOUND' but hasn't seen its definition yet. It labels it as 'Pending' and continues scanning. LC increments to 0008H.";
          case 3:
            return "Pass 1: Reading 'ADD AX, 0002H'. Size is 3 bytes. Location Counter increments from 0008H to 000BH.";
          case 4:
            return "Pass 1: Reading label definition 'MATCH_FOUND:' followed by 'MOV BX, AX' (2 bytes). The assembler instantly registers 'MATCH_FOUND = 000BH' in the Symbol Table! LC increments to 000DH.";
          case 5:
            return "Pass 1: Reading 'HLT'. Size is 1 byte. LC increments to 000EH. End of assembly file reached.";
          case 6:
            return "Pass 1 Completed! We now have a completed Symbol Table containing 'MATCH_FOUND = 000BH'. Click Next Step to start Pass 2.";
          default:
            return "Pass 1 complete. Ready to translate code.";
        }
      } else {
        // Pass 2
        switch (twopassStep) {
          case 0:
            return "Pass 2: Re-scanning from the top. Reading 'MOV AX, 0005H'. Instantly generates the machine bytes: 'B8 05 00'.";
          case 1:
            return "Pass 2: Reading 'CMP AX, 0005H'. Translates to '3D 05 00'. No forward reference here.";
          case 2:
            return "Pass 2: Reading 'JE MATCH_FOUND'. Since this is Pass 2, the assembler queries the completed Symbol Table and finds 'MATCH_FOUND = 000BH'. It calculates the relative distance from the next instruction (000BH - 0008H = 3 bytes) and outputs '74 03' perfectly!";
          case 3:
            return "Pass 2: Reading 'ADD AX, 0002H'. Translates to its hex representation: '05 02 00'.";
          case 4:
            return "Pass 2: Reading 'MOV BX, AX' at label MATCH_FOUND. Translates to '8B D8'.";
          case 5:
            return "Pass 2: Reading 'HLT'. Translates to opcode 'F4'.";
          case 6:
          case 7:
            return "Two-Pass Assembly Fully Successful! Forward references were resolved gracefully by scanning the file twice. Standard tools like MASM / TASM work exactly this way.";
          default:
            return "";
        }
      }
    } else {
      // One-Pass
      switch (onepassStep) {
        case 0:
          return "One-Pass: Reading 'MOV AX, 0005H'. Outputs machine bytes 'B8 05 00' directly to memory. LC starts at 0000H and advances to 0003H.";
        case 1:
          return "One-Pass: Reading 'CMP AX, 0005H'. Outputs machine bytes '3D 05 00' directly to memory. LC advances to 0006H.";
        case 2:
          return "One-Pass: Reading 'JE MATCH_FOUND'. Uh-oh! 'MATCH_FOUND' is not defined yet in the Symbol Table! To avoid stopping, the assembler outputs '74 ??' to memory, leaving a placeholder. It adds an entry to the Backpatch List: 'At offset 0007H, fill in offset when MATCH_FOUND is defined'.";
        case 3:
          return "One-Pass: Reading 'ADD AX, 0002H'. Outputs machine bytes '05 02 00' to memory. LC advances to 000BH.";
        case 4:
          return "One-Pass: Reading label definition 'MATCH_FOUND:' followed by 'MOV BX, AX'. The assembler registers 'MATCH_FOUND = 000BH' in the table. Boom! It immediately checks the Backpatch List, calculates the relative offset (000BH - 0008H = 03H), and updates the placeholder from '??' to '03' in memory! It then outputs '8B D8' for the instruction.";
        case 5:
          return "One-Pass: Reading 'HLT'. Outputs 'F4' immediately. LC advances to 000EH.";
        case 6:
        case 7:
          return "One-Pass Assembly Complete! The assembler scanned the code only once. To handle the forward reference, it had to back-patch (retroactively rewrite) the placeholder in memory once the label was resolved.";
        default:
          return "";
      }
    }
  };

  return (
    <div id="assembler-pass-simulator" className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 text-slate-800 shadow-sm flex flex-col justify-between h-full">
      <div>
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 mb-4 gap-2">
          <div>
            <h2 className="text-lg md:text-xl font-bold font-display text-indigo-600 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              One-Pass vs Two-Pass Interactive Laboratory
            </h2>
            <p className="text-slate-500 text-[13px] mt-0.5">Step through and compare how assemblers resolve Forward References</p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
            <button
              onClick={() => { setMode('twopass'); resetAll(); }}
              className={`px-3 py-1.5 text-[13px] font-bold rounded-lg cursor-pointer transition-all ${
                mode === 'twopass'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Two-Pass Assembler
            </button>
            <button
              onClick={() => { setMode('onepass'); resetAll(); }}
              className={`px-3 py-1.5 text-[13px] font-bold rounded-lg cursor-pointer transition-all ${
                mode === 'onepass'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              One-Pass Assembler
            </button>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* COLUMN A: Program Source Code */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex-1">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-3 text-[13px] text-slate-400 font-mono font-bold uppercase tracking-wider">
                <span>Assembly Code listing</span>
                <span>LC: {
                  mode === 'twopass' 
                    ? (twopassActivePass === 1 
                        ? PROGRAM_LINES[Math.min(twopassStep, 5)].offset 
                        : PROGRAM_LINES[Math.min(twopassStep, 5)].offset)
                    : PROGRAM_LINES[Math.min(onepassStep, 5)].offset
                }</span>
              </div>
              
              <div className="space-y-1.5 font-mono text-[13px]">
                {PROGRAM_LINES.map((line, idx) => {
                  const isActive = activeStepIndex === idx && !isCompleted;
                  return (
                    <div
                      key={idx}
                      className={`p-2 rounded-xl border transition-all flex flex-col justify-between ${
                        isActive
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-950 shadow-xs'
                          : 'bg-transparent border-transparent text-slate-500'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-2">
                          <span className={`text-[13px] select-none ${isActive ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
                            {line.offset}
                          </span>
                          <span className={isActive ? 'text-indigo-900 font-bold' : 'text-slate-800'}>
                            {line.instruction}
                          </span>
                        </div>
                        {isActive && (
                          <span className="text-[13px] font-bold px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-md font-sans">
                            Active
                          </span>
                        )}
                      </div>
                      <span className="text-[13px] text-slate-400 mt-1 pl-10 block font-sans">
                        ; {line.comment}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step Controls */}
            <div className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrevStep}
                  disabled={(mode === 'twopass' ? twopassStep === 0 && twopassActivePass === 1 : onepassStep === 0)}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-800 disabled:opacity-40 cursor-pointer transition-colors shadow-xs"
                  title="Previous Step"
                >
                  <RefreshCw className="w-4 h-4 transform -scale-x-100" />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`p-2 rounded-lg border text-white font-bold cursor-pointer transition-colors shadow-xs ${
                    isPlaying ? 'bg-amber-600 border-amber-600' : 'bg-indigo-600 border-indigo-600 hover:bg-indigo-700'
                  }`}
                  title={isPlaying ? 'Pause auto-run' : 'Auto run compilation'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={isCompleted}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-800 disabled:opacity-40 cursor-pointer transition-colors shadow-xs"
                  title="Next Step"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-slate-400">SPEED:</span>
                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  className="bg-white border border-slate-200 rounded-lg text-[13px] font-bold text-slate-600 p-1 focus:outline-none"
                >
                  <option value={2500}>Slow (2.5s)</option>
                  <option value={1500}>Normal (1.5s)</option>
                  <option value={800}>Fast (0.8s)</option>
                </select>
                <button
                  onClick={resetAll}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 cursor-pointer shadow-xs"
                  title="Reset Simulation"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* COLUMN B: Assembler Internal Architecture & Data Structures */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            
            {/* Top Badge: Mode Status */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-[13px] font-bold text-slate-400 font-mono uppercase tracking-wider">
                  Assembler Status & Stage
                </span>
                <span className="font-mono text-[13px] font-bold text-indigo-700">
                  {mode === 'twopass' 
                    ? `Pass ${twopassActivePass} / 2` 
                    : 'Single Pass / Backpatch mode'}
                </span>
              </div>
              
              {/* Visual Pipeline representation */}
              {mode === 'twopass' ? (
                <div className="flex items-center justify-between gap-2.5">
                  <div className={`flex-1 p-2 rounded-xl text-center border text-[13px] font-bold transition-all ${
                    twopassActivePass === 1 
                      ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-xs scale-102' 
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    <span className="block text-[13px] uppercase tracking-wider font-mono text-slate-400">Stage 1</span>
                    Pass 1: Symbol Table Sizing
                  </div>
                  <ArrowRight className={`w-4 h-4 shrink-0 ${twopassActivePass === 2 ? 'text-indigo-600' : 'text-slate-300'}`} />
                  <div className={`flex-1 p-2 rounded-xl text-center border text-[13px] font-bold transition-all ${
                    twopassActivePass === 2 
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-800 shadow-xs scale-102' 
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    <span className="block text-[13px] uppercase tracking-wider font-mono text-slate-400">Stage 2</span>
                    Pass 2: Binary Code Gen
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="text-[13px] font-sans font-bold text-indigo-900 leading-normal">
                      One-Pass assemblers must maintain a "Back-patching" queue to fix labels referenced before they are declared!
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom structures: Symbol Table vs RAM Output */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              
              {/* Box 1: Symbol Table Structure */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="border-b border-slate-200 pb-1.5 mb-2 flex items-center justify-between">
                    <span className="text-[13px] font-bold text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-indigo-600" />
                      Symbol Table
                    </span>
                    <span className="text-[13px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold">
                      IN-MEMORY
                    </span>
                  </div>
                  
                  {getSymbolTable().length > 0 ? (
                    <div className="space-y-2">
                      {getSymbolTable().map((sym, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 p-2 rounded-xl flex items-center justify-between text-[13px] font-mono">
                          <span className="text-slate-700 font-bold">{sym.symbol}</span>
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[13px] ${
                            sym.status === 'resolved' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                              : 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
                          }`}>
                            {sym.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-400 text-[13px] italic font-sans flex flex-col items-center gap-1">
                      <HelpCircle className="w-5 h-5 text-slate-300" />
                      No labels registered yet
                    </div>
                  )}
                </div>

                {/* Auxiliary data structure display */}
                <div className="mt-3 pt-3 border-t border-slate-200">
                  {mode === 'twopass' ? (
                    <div>
                      <span className="text-[13px] font-mono text-slate-400 font-bold block uppercase tracking-wider">Pass 1 output:</span>
                      <p className="text-[13px] text-slate-500 font-sans mt-0.5 leading-normal">
                        Outputs no executable bytes yet. Focus is calculating the Symbol offsets of every line to prevent forward jump failure.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[13px] font-mono text-slate-400 font-bold block uppercase tracking-wider">Back-patch Queues:</span>
                      {getBackpatchList().length > 0 ? (
                        <div className="space-y-1.5 mt-1.5">
                          {getBackpatchList().map((bp, idx) => (
                            <div key={idx} className={`p-1.5 px-2 rounded-lg border text-[13px] font-mono flex items-center justify-between ${
                              bp.status === 'pending'
                                ? 'bg-amber-50 border-amber-200 text-amber-800 animate-pulse'
                                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            }`}>
                              <span>Patch {bp.sourceOffset} ({bp.targetLabel})</span>
                              <span className="font-bold">{bp.status === 'pending' ? 'Pending' : 'Patched \u2714'}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[13px] text-slate-400 font-sans mt-0.5 italic">
                          No pending forward references
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Box 2: Machine Code Output (The RAM) */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="border-b border-slate-200 pb-1.5 mb-2 flex items-center justify-between">
                    <span className="text-[13px] font-bold text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                      <Binary className="w-3.5 h-3.5 text-indigo-600" />
                      Generated OBJ
                    </span>
                    <span className="text-[13px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold">
                      OFFSET : HEX
                    </span>
                  </div>

                  <div className="space-y-1 text-[13px] font-mono">
                    {PROGRAM_LINES.map((line, idx) => {
                      const isLineProcessed = mode === 'twopass'
                        ? (twopassActivePass === 2 && twopassStep >= idx)
                        : (onepassStep >= idx);
                      
                      // For One-pass match_found back-patch highlight
                      const isBackpatchCell = mode === 'onepass' && idx === 2;
                      const isBackpatchedNow = onepassStep >= 4;

                      return (
                        <div 
                          key={idx} 
                          className={`p-1.5 px-2 rounded-lg border flex items-center justify-between transition-all ${
                            isLineProcessed
                              ? 'bg-white border-slate-200 text-slate-800'
                              : 'bg-transparent border-dashed border-slate-200 text-slate-300'
                          }`}
                        >
                          <span className="font-bold text-[13px]">{line.offset}:</span>
                          {isLineProcessed ? (
                            <span className="font-bold tracking-wider text-indigo-600">
                              {isBackpatchCell ? (
                                isBackpatchedNow ? (
                                  <span className="text-emerald-600 font-extrabold bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">74 03</span>
                                ) : (
                                  <span className="text-amber-600 font-extrabold bg-amber-50 px-1 py-0.5 rounded border border-amber-200 animate-pulse">74 ??</span>
                                )
                              ) : (
                                line.hex
                              )}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-bold">-- -- --</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200 text-center">
                  <div className="bg-white border border-slate-200 p-2 rounded-xl inline-flex items-center justify-center gap-1.5 w-full">
                    <span className="text-[13px] font-mono font-bold text-slate-400">Total compiled:</span>
                    <span className="text-[13px] font-mono font-extrabold text-slate-700">
                      {mode === 'twopass'
                        ? (twopassActivePass === 2 ? PROGRAM_LINES.slice(0, twopassStep + 1).reduce((acc, curr) => acc + curr.size, 0) : 0)
                        : PROGRAM_LINES.slice(0, onepassStep + 1).reduce((acc, curr) => acc + curr.size, 0)
                      } Bytes
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
        
        {/* Step log Explanation */}
        <div className="bg-indigo-50 border border-indigo-100 p-3.5 rounded-2xl mt-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-[13px] font-bold text-indigo-700 uppercase tracking-widest block font-mono">
              Trace Explanation:
            </span>
            <p className="text-[13px] text-indigo-950 font-sans leading-relaxed text-justify">
              {getStepExplanation()}
            </p>
          </div>
        </div>

        {/* COMPREHENSIVE ONE-PASS VS TWO-PASS COMPARISON MATRIX */}
        <div className="mt-6 border border-slate-200 rounded-2xl p-5 bg-gradient-to-br from-indigo-50/30 to-slate-50">
          <h3 className="text-sm md:text-base font-extrabold text-indigo-900 flex items-center gap-2 mb-3">
            <Layers className="w-4.5 h-4.5 text-indigo-600" />
            Comparison Matrix: One-Pass vs. Two-Pass Assembler
          </h3>
          <p className="text-[13px] text-slate-600 mb-4">
            Understanding how the two types of assemblers process files resolves typical confusion about how machine code gets compiled:
          </p>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="p-3">Feature</th>
                  <th className="p-3 text-indigo-800 bg-indigo-50/20">One-Pass Assembler</th>
                  <th className="p-3 text-indigo-950">Two-Pass Assembler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                <tr>
                  <td className="p-3 font-semibold text-slate-700">Source Code Scans</td>
                  <td className="p-3 text-indigo-900 bg-indigo-50/10 font-medium">
                    **Only 1 Scan**. Processes line-by-line from top to bottom.
                  </td>
                  <td className="p-3 text-slate-800">
                    **Exactly 2 Scans**. (Pass 1 scans symbols, Pass 2 translates code).
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-700">Forward Jumps / Labels</td>
                  <td className="p-3 text-indigo-900 bg-indigo-50/10">
                    Saves references as **Pending** in a **Backpatch Table**. Fills placeholders with <span className="bg-amber-100 text-amber-800 px-1 py-0.5 rounded font-mono font-bold text-[11px]">74 ??</span> and updates them retroactively once the label is defined.
                  </td>
                  <td className="p-3 text-slate-800">
                    Pass 1 maps label offsets to the **Symbol Table** (e.g. <span className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono font-bold text-[11px]">MATCH_FOUND = 000BH</span>). Pass 2 translates forward jumps with perfect offsets instantly.
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-700">Memory Consumption</td>
                  <td className="p-3 text-indigo-900 bg-indigo-50/10">
                    **Higher**. The assembler must keep all generated code and the backpatch table in active memory until patches are resolved.
                  </td>
                  <td className="p-3 text-slate-800">
                    **Lower**. Only requires keeping the completed Symbol Table structure in RAM.
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-700">Main Benefit</td>
                  <td className="p-3 text-indigo-900 bg-indigo-50/10 font-semibold">
                    Faster assembly speed because there is no dual disk I/O scan. Excellent for early or low-resource computers.
                  </td>
                  <td className="p-3 text-slate-800 font-semibold">
                    Highly modular and reliable. Seamlessly handles complex cross-segment references, directives, and segment combinations.
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-700">Examples</td>
                  <td className="p-3 text-indigo-900 bg-indigo-50/10">
                    AS_ONE, some simple embedded system assemblers.
                  </td>
                  <td className="p-3 text-slate-800">
                    **MASM**, **TASM**, and NASM (standard industry standards).
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="text-[13px] text-slate-400 font-mono text-right pt-4 border-t border-slate-100 shrink-0 mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span>Courseware Supplementary — Section 11.3 Assembler Passes</span>
        <span className="font-bold text-indigo-600 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
          Active: {mode === 'twopass' ? 'Two-Pass Resolver' : 'One-Pass Backpatcher'}
        </span>
      </div>
    </div>
  );
}
