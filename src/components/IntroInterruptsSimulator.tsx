import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, HelpCircle, BookOpen, Cpu, Zap, Clock, ArrowRight, CheckCircle2, 
  AlertCircle, Play, RotateCcw, Info, Layers, Award, Terminal, ChevronRight, 
  ChevronLeft, ShieldAlert, BookOpenCheck, Settings, CornerDownRight, Check
} from 'lucide-react';

// Define the topics menu list
interface TopicItem {
  id: number;
  title: string;
  shortTitle: string;
  icon: any;
}

const TOPICS: TopicItem[] = [
  { id: 0, title: '1. Introduction', shortTitle: 'Introduction', icon: Zap },
  { id: 1, title: '2. What is an Interrupt?', shortTitle: 'Definition', icon: HelpCircle },
  { id: 2, title: '3. Why are they Needed?', shortTitle: 'Importance', icon: Clock },
  { id: 3, title: '4. The Interrupt Process', shortTitle: 'Core Flow', icon: Layers },
  { id: 4, title: '5. What is an ISR?', shortTitle: 'ISR Details', icon: Terminal },
  { id: 5, title: '6. Types of Interrupts', shortTitle: 'Classifications', icon: Cpu },
  { id: 6, title: '7. Important Type List', shortTitle: 'Interrupt Types', icon: Info },
  { id: 7, title: '8. Interrupt Vector Table', shortTitle: 'IVT Map', icon: BookOpen },
  { id: 8, title: '9. Interactive Simulation', shortTitle: 'Live Simulator', icon: Play },
  { id: 9, title: '10. Summary (Remember)', shortTitle: 'Remember', icon: Award },
  { id: 10, title: '11. Quick Check Quiz', shortTitle: 'Quiz Assessment', icon: BookOpenCheck },
];

export default function IntroInterruptsSimulator() {
  const [activeTopic, setActiveTopic] = useState<number>(0);
  const [completedTopics, setCompletedTopics] = useState<number[]>([]);

  // Track completed topics as the user views them
  useEffect(() => {
    if (!completedTopics.includes(activeTopic)) {
      setCompletedTopics(prev => [...prev, activeTopic]);
    }
  }, [activeTopic]);

  const handleNextTopic = () => {
    if (activeTopic < TOPICS.length - 1) {
      setActiveTopic(prev => prev + 1);
    }
  };

  const handlePrevTopic = () => {
    if (activeTopic > 0) {
      setActiveTopic(prev => prev - 1);
    }
  };

  // State for Section 4 (Interrupt Process steps)
  const [processStep, setProcessStep] = useState<number>(0);
  const processSteps = [
    { title: 'MAIN PROGRAM RUNNING', desc: 'The 8086 executes instructions sequentially from memory. CS and IP registers point to current operations.' },
    { title: 'INTERRUPT REQUEST OCCURS', desc: 'An external hardware signal (on INTR or NMI pins) or internal software command (INT) triggers a request.' },
    { title: 'COMPLETES CURRENT INSTRUCTION', desc: 'The 8086 does not stop mid-operation. It fully completes the current clock-cycles and retires the active instruction.' },
    { title: 'SAVES FLAGS, CS AND IP', desc: 'Critical context is pushed onto the stack memory. SP decrements by 6 total bytes. Flags, CS, and IP are saved to preserve resume state.' },
    { title: 'FINDS ISR ADDRESS IN IVT', desc: 'The 8086 calculates the address (Type * 4) and reads the 4-byte Interrupt Vector Table to find the target CS and IP.' },
    { title: 'EXECUTES ISR (INTERRUPT SERVICE)', desc: 'The new CS and IP are loaded. The 8086 begins executing the special custom handler subroutine code.' },
    { title: 'IRET RETURNS TO MAIN PROGRAM', desc: 'The IRET instruction at the end of the ISR pops the saved IP, CS, and FLAGS back. Normal instruction stream resumes seamlessly.' },
  ];

  // State for Section 8 (IVT dynamic address calculator)
  const [ivtInput, setIvtInput] = useState<string>('3');
  const [ivtAddressHex, setIvtAddressHex] = useState<string>('0000CH');
  const [ivtRangeHex, setIvtRangeHex] = useState<string>('0000CH - 0000FH');

  const calculateIvtAddress = (val: string) => {
    setIvtInput(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 0 && num <= 255) {
      const startAddr = num * 4;
      const endAddr = startAddr + 3;
      
      const startHex = startAddr.toString(16).toUpperCase().padStart(5, '0') + 'H';
      const endHex = endAddr.toString(16).toUpperCase().padStart(5, '0') + 'H';
      
      setIvtAddressHex(startHex);
      setIvtRangeHex(`${startHex} - ${endHex}`);
    } else {
      setIvtAddressHex('Invalid');
      setIvtRangeHex('Invalid Type (0-255)');
    }
  };

  // State for Section 9 (Interactive CPU & Interrupt Simulator)
  const [simStep, setSimStep] = useState<number>(0); // 0=idle, 1=executing-inst-1, 2=executing-inst-2, 3=interrupt-triggered, 4=save-context, 5=load-isr-address, 6=executing-isr, 7=iret-call, 8=completed
  const [regAX, setRegAX] = useState<string>('0000H');
  const [regBX, setRegBX] = useState<string>('0000H');
  const [regCX, setRegCX] = useState<string>('0000H');
  const [regIP, setRegIP] = useState<string>('0100H');
  const [regSP, setRegSP] = useState<string>('FFFEH');
  const [flagIF, setFlagIF] = useState<number>(1);
  const [simMessage, setSimMessage] = useState<string>('Click "Run Instruction Step" to begin executing the program.');
  const [stackMem, setStackMem] = useState<{ addr: string; val: string; desc: string }[]>([]);

  const handleSimStep = () => {
    if (simStep === 0) {
      // Step 1: Execute MOV AX, 1234H
      setRegAX('1234H');
      setRegIP('0103H');
      setSimStep(1);
      setSimMessage('Executed instruction: "MOV AX, 1234H". Value loaded into AX accumulator.');
    } else if (simStep === 1) {
      // Step 2: Execute MOV BX, 5678H
      setRegBX('5678H');
      setRegIP('0106H');
      setSimStep(2);
      setSimMessage('Executed instruction: "MOV BX, 5678H". Value loaded into BX base register. Program is running normally.');
    } else if (simStep === 2) {
      // Normal flow continues
      setRegAX('69ACH'); // ADD AX, BX (1234H + 5678H = 69ACH)
      setRegIP('0108H');
      setSimStep(8);
      setSimMessage('No interrupt was triggered. Program completed normally with AX = 69ACH (ADD AX, BX).');
    }
  };

  const handleTriggerInterrupt = () => {
    // Can trigger interrupt after step 1 or step 2 is active, or from idle
    if (simStep === 8) {
      // Restart and trigger
      setRegAX('1234H');
      setRegBX('5678H');
      setRegIP('0106H');
      setSimStep(3);
      setSimMessage('⚠️ hardware Interrupt request detected on INTR pin! The CPU finishes current instruction "MOV BX, 5678H".');
    } else {
      setSimStep(3);
      setSimMessage('⚠️ Hardware Interrupt request detected on INTR pin! The CPU finishes current instruction first before responding.');
    }
  };

  const handleSimContinue = () => {
    if (simStep === 3) {
      // Step 4: Save Context (Flags, CS, IP to stack)
      // Stack decreases by 6: FFFEH -> FFFCH -> FFFAH -> FFF8H
      setRegSP('FFF8H');
      setStackMem([
        { addr: 'FFFAH', val: '0106H', desc: 'Saved IP (Next Instruction)' },
        { addr: 'FFFCH', val: '1000H', desc: 'Saved CS (Code Segment)' },
        { addr: 'FFFEH', val: '0240H', desc: 'Saved FLAGS' },
      ]);
      setFlagIF(0); // clear interrupt enable flag automatically
      setSimStep(4);
      setSimMessage('Context saved to Stack memory! FLAGS, CS, and return IP offset (0106H) pushed. SP changed. Interrupt Flag (IF) cleared.');
    } else if (simStep === 4) {
      // Step 5: Read IVT and Load ISR CS:IP
      setRegIP('0400H'); // Jump to ISR offset address
      setSimStep(5);
      setSimMessage('Calculated IVT pointer (Type 3 * 4). Read address and loaded new target ISR address (CS=1000H, IP=0400H) into registers.');
    } else if (simStep === 5) {
      // Step 6: Execute ISR code
      setRegCX('FFFFH'); // Simulating reading keyboard status
      setRegIP('0403H');
      setSimStep(6);
      setSimMessage('Executing Interrupt Service Routine (ISR) instructions. Value FFFFH loaded to CX representing device buffer confirmation.');
    } else if (simStep === 6) {
      // Step 7: IRET
      setRegIP('0106H'); // pops back
      setRegSP('FFFEH');
      setFlagIF(1); // restored from flags
      setStackMem([]);
      setSimStep(7);
      setSimMessage('ISR finishes with "IRET" command! Popped saved FLAGS (restoring IF=1), CS, and return IP from Stack. SP restored.');
    } else if (simStep === 7) {
      // Resume and add
      setRegAX('69ACH');
      setRegCX('69ACH'); // MOV CX, AX (now CX = AX = 69ACH)
      setRegIP('010AH');
      setSimStep(8);
      setSimMessage('Main program resumed seamlessly! Executed "MOV CX, AX", program completes with CX = 69ACH. Success!');
    }
  };

  const handleResetSim = () => {
    setSimStep(0);
    setRegAX('0000H');
    setRegBX('0000H');
    setRegCX('0000H');
    setRegIP('0100H');
    setRegSP('FFFEH');
    setFlagIF(1);
    setStackMem([]);
    setSimMessage('Simulator reset. Click "Run Instruction Step" to start again.');
  };

  // State for Section 11 (Quiz questions)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number | null>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  const QUIZ_QUESTIONS = [
    {
      id: 1,
      q: 'What is an interrupt in the context of the 8086 microprocessor?',
      options: [
        'A physical crash in the CPU logic gates',
        'A signal or event that temporarily stops normal program execution to handle an urgent event',
        'An instruction that forces the program to loop infinitely',
        'A method of increasing the clock cycle frequency of the motherboard'
      ],
      correct: 1,
      exp: 'An interrupt is an event that forces the microprocessor to pause its current execution, save its current state, and run a specialized Interrupt Service Routine (ISR) before returning to the original task.'
    },
    {
      id: 2,
      q: 'What does "ISR" stand for?',
      options: [
        'Instruction Setup Registry',
        'Internal Segment Router',
        'Interrupt Service Routine',
        'Intel Standard Reference'
      ],
      correct: 2,
      exp: 'ISR stands for Interrupt Service Routine. It is a dedicated helper subroutine written to process a specific interrupt event and ends with an "IRET" instruction.'
    },
    {
      id: 3,
      q: 'Where is the Interrupt Vector Table (IVT) located in the 8086 physical memory space?',
      options: [
        'At the very high addresses (FFFF0H to FFFFFH)',
        'Inside the CPU execution register array',
        'At the lowest 1 KB of memory (00000H to 003FFH)',
        'In the primary stack segment (SS:0000H)'
      ],
      correct: 2,
      exp: 'The IVT occupies the lowest 1 KB of physical RAM, from 00000H to 003FFH. It holds 256 vector pointers, where each pointer is 4 bytes (2 for CS base, 2 for IP offset).'
    },
    {
      id: 4,
      q: 'Which of the following hardware interrupts cannot be ignored or disabled by clearing the Interrupt Flag (CLI instruction)?',
      options: [
        'INTR',
        'INT 21H',
        'NMI (Non-Maskable Interrupt)',
        'INT 3'
      ],
      correct: 2,
      exp: 'NMI (Non-Maskable Interrupt, connected to Pin 17) is a hardware interrupt that bypasses the Interrupt Flag (IF). The CPU must always respond to NMI immediately, making it critical for handling things like power failures.'
    },
    {
      id: 5,
      q: 'How many total interrupt types does the 8086 architecture support?',
      options: [
        '16 types',
        '256 types',
        '1024 types',
        '64 types'
      ],
      correct: 1,
      exp: 'The 8086 supports 256 distinct interrupt types, ranging from Type 0 to Type 255. Each type is mapped to a specific slot in the IVT.'
    }
  ];

  const handleSelectQuizOption = (qIdx: number, oIdx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: oIdx }));
  };

  const handleSubmitQuiz = () => {
    let finalScore = 0;
    QUIZ_QUESTIONS.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) {
        finalScore++;
      }
    });
    setScore(finalScore);
    setQuizSubmitted(true);
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setScore(0);
  };

  return (
    <div className="flex flex-col xl:flex-row h-full min-h-[500px] bg-slate-50 border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs hover:border-indigo-150 transition-all duration-300">
      {/* LEFT NAVIGATION MENU (Topic list) */}
      <div className="w-full xl:w-72 bg-white border-b xl:border-b-0 xl:border-r border-slate-250 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100 bg-sky-50/20 shrink-0">
          <span className="text-[10px] font-extrabold font-mono text-indigo-600 uppercase tracking-widest block mb-1">
            UNIT-1: SYSTEM ARCHITECTURE
          </span>
          <h2 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            8086 Interrupt Module
          </h2>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
            <div 
              className="bg-indigo-600 h-full transition-all duration-500" 
              style={{ width: `${(completedTopics.length / TOPICS.length) * 100}%` }}
            ></div>
          </div>
          <span className="text-[9px] text-slate-500 font-mono block mt-1.5">
            Module progress: {completedTopics.length} of {TOPICS.length} topics viewed
          </span>
        </div>

        <div className="flex flex-row xl:flex-col overflow-x-auto xl:overflow-x-hidden xl:overflow-y-auto flex-1 p-2 gap-1.5 scrollbar-thin">
          {TOPICS.map((topic) => {
            const IconComponent = topic.icon;
            const isActive = activeTopic === topic.id;
            const isCompleted = completedTopics.includes(topic.id);
            return (
              <button
                key={topic.id}
                onClick={() => setActiveTopic(topic.id)}
                className={`flex items-center gap-2.5 px-3 py-2 xl:py-2.5 rounded-xl text-xs font-bold transition-all text-left whitespace-nowrap cursor-pointer border ${
                  isActive 
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm' 
                    : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className={`p-1 rounded-lg shrink-0 ${isActive ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-indigo-600'}`}>
                  <IconComponent className="w-3.5 h-3.5" />
                </div>
                <span className="truncate flex-1">{topic.title}</span>
                {isCompleted && !isActive && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 hidden xl:block" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT DISPLAY VIEW (Active learning content card) */}
      <div className="flex-1 flex flex-col justify-between overflow-y-auto p-6 md:p-8 min-w-0 bg-white">
        <div className="flex-1 min-h-0 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTopic}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col justify-between"
            >
              <div>
                {/* SECTION 1 - HERO INTRODUCTION */}
                {activeTopic === 0 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full uppercase tracking-widest inline-block">
                        Topic 1 • Introduction to Interrupts
                      </span>
                      <h1 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-none pt-1">
                        1. Introduction to 8086 Interrupts
                      </h1>
                      <p className="text-slate-600 text-base md:text-[17px] font-medium leading-relaxed max-w-2xl">
                        "How the 8086 temporarily stops its current work to respond to an important event."
                      </p>
                    </div>

                    <div className="bg-slate-50/50 border border-slate-150 p-6 md:p-8 rounded-2xl flex flex-col items-center justify-center space-y-4 shadow-3xs">
                      <h3 className="text-xs font-mono font-extrabold uppercase tracking-widest text-slate-400">
                        8086 Execution Flow with Interrupt
                      </h3>
                      
                      <div className="flex flex-col items-center w-full max-w-md space-y-3.5 font-mono text-[11.5px] font-bold">
                        <motion.div 
                          animate={{ y: [0, 4, 0] }}
                          transition={{ repeat: Infinity, duration: 2.2 }}
                          className="w-full text-center py-2.5 px-4 bg-slate-900 text-white rounded-xl border border-slate-950 shadow-sm"
                        >
                          8086 IS EXECUTING A PROGRAM
                        </motion.div>

                        <div className="flex flex-col items-center justify-center text-indigo-600">
                          <span className="text-sm">↓</span>
                          <span className="text-[10px] font-extrabold uppercase bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md mt-1 animate-pulse">
                            INTERRUPT OCCURS
                          </span>
                        </div>

                        <motion.div 
                          initial={{ scale: 0.98 }}
                          animate={{ scale: [0.98, 1.02, 0.98] }}
                          transition={{ repeat: Infinity, duration: 1.8 }}
                          className="w-full text-center py-2.5 px-4 bg-rose-50 border border-rose-200 text-rose-850 rounded-xl"
                        >
                          8086 PAUSES CURRENT PROGRAM
                        </motion.div>

                        <div className="flex flex-col items-center justify-center text-rose-500">
                          <span className="text-sm">↓</span>
                        </div>

                        <motion.div 
                          animate={{ x: [-3, 3, -3] }}
                          transition={{ repeat: Infinity, duration: 2.5 }}
                          className="w-full text-center py-2.5 px-4 bg-indigo-600 text-white rounded-xl shadow-xs"
                        >
                          EXECUTES INTERRUPT SERVICE ROUTINE (ISR)
                        </motion.div>

                        <div className="flex flex-col items-center justify-center text-indigo-500">
                          <span className="text-sm">↓</span>
                        </div>

                        <motion.div 
                          className="w-full text-center py-2.5 px-4 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-xl"
                        >
                          RETURNS TO ORIGINAL PROGRAM
                        </motion.div>
                      </div>
                    </div>
                    
                    <p className="text-slate-600 text-sm leading-relaxed text-justify max-w-3xl">
                      Just like a human coordinator, the 8086 CPU needs a way to handle sudden events—like a keystroke from a keyboard, a timer signal, or an arithmetic fault (like divide-by-zero)—without crashing or slowing down. Interrupts provide this precise system control mechanism.
                    </p>
                  </div>
                )}

                {/* SECTION 2 - WHAT IS AN INTERRUPT? */}
                {activeTopic === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-600 block">
                        Core Concepts
                      </span>
                      <h2 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">
                        2. What is an Interrupt?
                      </h2>
                    </div>

                    <div className="p-5 md:p-6 rounded-2xl bg-indigo-50/40 border border-indigo-100 flex gap-4 items-start shadow-3xs">
                      <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs mt-0.5">
                        <Bell className="w-5 h-5 animate-swing" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-display font-bold text-slate-900 text-base">Scientific Definition</h4>
                        <p className="text-slate-800 text-[15px] font-medium leading-relaxed">
                          "An <strong className="text-indigo-700 font-extrabold">interrupt</strong> is a signal or event that temporarily stops the normal execution of a program and causes the 8086 to execute a special routine called an <strong className="text-indigo-700 font-extrabold">Interrupt Service Routine (ISR)</strong>."
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                      <div className="p-5 border border-slate-200/80 rounded-2xl bg-white shadow-3xs flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-mono font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                            Golden Rule Equation
                          </p>
                          <h4 className="font-display font-black text-xl text-indigo-700 mt-1">
                            INTERRUPT = Request for CPU Attention
                          </h4>
                          <p className="text-slate-600 text-xs mt-2.5 leading-relaxed">
                            It tells the microprocessor: "Stop what you are doing, look over here right now, deal with this urgent event, then go back to your original job."
                          </p>
                        </div>
                      </div>

                      <div className="p-5 border border-slate-200/80 rounded-2xl bg-slate-50 shadow-3xs">
                        <p className="text-xs font-mono font-extrabold text-indigo-600 uppercase tracking-widest mb-1.5">
                          The Doorbell Analogy
                        </p>
                        <p className="text-slate-700 text-[13.5px] font-medium leading-relaxed italic">
                          "Imagine you are studying for an exam. Suddenly, the doorbell rings. You pause studying, answer the door, and then return to your studies."
                        </p>
                        <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] font-mono font-bold pt-2.5 border-t border-slate-200">
                          <div className="text-slate-500">Studying <span className="text-slate-900">→ Main Program</span></div>
                          <div className="text-indigo-600">Doorbell <span className="text-slate-900">→ Interrupt</span></div>
                          <div className="text-slate-500">Answering Door <span className="text-indigo-700">→ ISR</span></div>
                          <div className="text-slate-500">Back to study <span className="text-slate-900">→ Resume</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 3 - WHY DO WE NEED INTERRUPTS? */}
                {activeTopic === 2 && (
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-600 block">
                        Efficiency & Design
                      </span>
                      <h2 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">
                        3. Why Do We Need Interrupts?
                      </h2>
                      <p className="text-slate-500 text-xs">
                        Modern computers would be incredibly slow without interrupts. Here is why:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5 pt-2">
                      <div className="p-4.5 rounded-2xl bg-white border border-slate-150 hover:border-indigo-150 transition-colors shadow-3xs">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-rose-50 text-rose-600 rounded-lg border border-rose-100">
                            <Zap className="w-4 h-4" />
                          </div>
                          <h4 className="font-display font-extrabold text-slate-900 text-sm uppercase">
                            ⚡ Quick Response
                          </h4>
                        </div>
                        <p className="text-slate-600 text-xs leading-relaxed">
                          The CPU can respond immediately to high-priority events, safety shutdowns, or real-time measurements rather than wait for standard polling loops.
                        </p>
                      </div>

                      <div className="p-4.5 rounded-2xl bg-white border border-slate-150 hover:border-indigo-150 transition-colors shadow-3xs">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
                            <Clock className="w-4 h-4" />
                          </div>
                          <h4 className="font-display font-extrabold text-slate-900 text-sm uppercase">
                            ⌛ Save CPU Time
                          </h4>
                        </div>
                        <p className="text-slate-600 text-xs leading-relaxed">
                          Saves valuable instruction cycles. Instead of continuously running "check status" loops (polling), the CPU goes full speed. Hardware wakes it when ready.
                        </p>
                      </div>

                      <div className="p-4.5 rounded-2xl bg-white border border-slate-150 hover:border-indigo-150 transition-colors shadow-3xs">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                            <Cpu className="w-4 h-4" />
                          </div>
                          <h4 className="font-display font-extrabold text-slate-900 text-sm uppercase">
                            🔌 Handle I/O Devices
                          </h4>
                        </div>
                        <p className="text-slate-600 text-xs leading-relaxed">
                          Printers, disk controllers, and keyboards can communicate asynchronous data safely. The CPU only services them when they actually request work.
                        </p>
                      </div>

                      <div className="p-4.5 rounded-2xl bg-white border border-slate-150 hover:border-indigo-150 transition-colors shadow-3xs">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
                            <Layers className="w-4 h-4" />
                          </div>
                          <h4 className="font-display font-extrabold text-slate-900 text-sm uppercase">
                            🔄 Multitasking Events
                          </h4>
                        </div>
                        <p className="text-slate-600 text-xs leading-relaxed">
                          Enables true-feeling background tasks. The operating system uses hardware timer interrupts to distribute CPU runtime slices between running software.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 4 - INTERRUPT PROCESS */}
                {activeTopic === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-600 block">
                        Sequence Flow Diagram
                      </span>
                      <h2 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">
                        4. The 8086 Interrupt Response Process
                      </h2>
                      <p className="text-slate-500 text-xs">
                        Click on the steps on the left to see what the 8086 does behind the scenes during an interrupt cycle.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                      {/* Step index chooser */}
                      <div className="lg:col-span-5 space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
                        {processSteps.map((step, idx) => (
                          <button
                            key={idx}
                            onClick={() => setProcessStep(idx)}
                            className={`w-full text-left p-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                              processStep === idx 
                                ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs' 
                                : 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <span>Step {idx + 1}: {step.title}</span>
                            <ChevronRight className={`w-3.5 h-3.5 ${processStep === idx ? 'text-white rotate-90' : 'text-slate-400'}`} />
                          </button>
                        ))}
                      </div>

                      {/* Display panel with explanation */}
                      <div className="lg:col-span-7 p-5 rounded-2xl bg-indigo-50/30 border border-indigo-100/50 flex flex-col justify-between shadow-3xs">
                        <div className="space-y-3">
                          <span className="text-[10px] font-mono font-extrabold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full uppercase">
                            Active Stage: Step {processStep + 1}
                          </span>
                          <h4 className="font-display font-extrabold text-slate-900 text-base leading-tight">
                            {processSteps[processStep].title}
                          </h4>
                          <p className="text-slate-700 text-xs md:text-[13px] leading-relaxed">
                            {processSteps[processStep].desc}
                          </p>
                        </div>

                        {/* Custom flowchart display */}
                        <div className="border-t border-slate-200 mt-4 pt-4 flex items-center justify-center">
                          <div className="flex flex-wrap items-center justify-center gap-1.5 font-mono text-[9px] font-bold text-slate-500">
                            <span className={`px-1.5 py-1 rounded-md border ${processStep === 0 ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white border-slate-200'}`}>MAIN</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <span className={`px-1.5 py-1 rounded-md border ${processStep === 1 ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white border-slate-200'}`}>INTERRUPT</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <span className={`px-1.5 py-1 rounded-md border ${processStep === 3 ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white border-slate-200'}`}>SAVE CONTEXT</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <span className={`px-1.5 py-1 rounded-md border ${processStep === 4 ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white border-slate-200'}`}>LOAD IVT</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <span className={`px-1.5 py-1 rounded-md border ${processStep === 5 ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white border-slate-200'}`}>ISR CODE</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <span className={`px-1.5 py-1 rounded-md border ${processStep === 6 ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white border-slate-200'}`}>IRET</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 5 - INTERRUPT SERVICE ROUTINE (ISR) */}
                {activeTopic === 4 && (
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-600 block">
                        Software Subroutine
                      </span>
                      <h2 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">
                        5. What is an Interrupt Service Routine (ISR)?
                      </h2>
                    </div>

                    <p className="text-slate-600 text-sm leading-relaxed max-w-3xl">
                      An <strong className="text-indigo-700 font-extrabold">Interrupt Service Routine (ISR)</strong> is a special, dedicated program block designed solely to handle a specific interrupt event. Just like standard functions, but triggered by hardware or INT signals, and ending with <code className="bg-slate-100 text-indigo-600 px-1 py-0.5 rounded text-xs font-bold font-mono">IRET</code> rather than normal return instruction.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-2">
                      <div className="md:col-span-4 bg-slate-50 border border-slate-200 p-4 rounded-xl font-mono text-[11px] font-bold space-y-2 text-center">
                        <span className="text-slate-400 text-[10px] block font-semibold">ISR FLOW CHART</span>
                        <div className="py-1 px-2.5 bg-rose-50 border border-rose-200 rounded-md text-rose-800">INTERRUPT EVENT</div>
                        <div className="text-slate-400">↓</div>
                        <div className="py-1 px-2.5 bg-indigo-50 border border-indigo-200 rounded-md text-indigo-800">LAUNCH TARGET ISR</div>
                        <div className="text-slate-400">↓</div>
                        <div className="py-1 px-2.5 bg-slate-900 text-white rounded-md">HANDLE THE HARDWARE EVENT</div>
                        <div className="text-slate-400">↓</div>
                        <div className="py-1 px-2.5 bg-indigo-600 text-white rounded-md">EXECUTE "IRET"</div>
                        <div className="text-slate-400">↓</div>
                        <div className="py-1 px-2.5 bg-emerald-50 border border-emerald-250 rounded-md text-emerald-800">RETURN TO MAIN CODE</div>
                      </div>

                      <div className="md:col-span-8 space-y-4">
                        <h4 className="font-display font-bold text-slate-950 text-sm flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-indigo-600" />
                          Keyboard Press Example
                        </h4>
                        
                        <div className="p-4 rounded-xl border border-slate-150 bg-white shadow-3xs text-xs space-y-2 leading-relaxed text-slate-600">
                          <div className="flex gap-2 items-center text-slate-900 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                            <span>Asynchronous Event Trigger</span>
                          </div>
                          <p>
                            1. You press the key <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded font-mono text-[10px] font-bold text-slate-800">A</kbd> on your keyboard.
                          </p>
                          <p>
                            2. Keyboard hardware alerts the system controller, pulling the 8086 <code className="font-mono text-indigo-600 font-semibold bg-indigo-50/50 px-1 rounded">INTR</code> line high.
                          </p>
                          <p>
                            3. The 8086 pauses execution and reads the address of the Keyboard ISR from the vector table.
                          </p>
                          <p>
                            4. The Keyboard ISR executes: It reads the physical key code (scancode) from physical I/O port, stores 'A' into keyboard buffer, and triggers screen feedback.
                          </p>
                          <p>
                            5. Calls <code className="font-mono font-bold text-slate-800">IRET</code>. Normal execution resumes without delay!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 6 - TYPES OF 8086 INTERRUPTS */}
                {activeTopic === 5 && (
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-600 block">
                        Dual Categorizations
                      </span>
                      <h2 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">
                        6. Classifications of 8086 Interrupts
                      </h2>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col items-center">
                      <span className="text-[10px] font-mono font-black text-slate-400 tracking-wider uppercase mb-4">
                        Interrupt Hierarchy
                      </span>
                      <div className="flex flex-col md:flex-row gap-6 items-stretch w-full max-w-4xl font-mono text-[11px] font-bold">
                        {/* Hardware Block */}
                        <div className="flex-1 p-4 bg-white border border-slate-200 rounded-xl flex flex-col justify-between space-y-3 shadow-3xs">
                          <div>
                            <span className="text-[10px] font-mono font-extrabold text-indigo-600 uppercase">Category 1</span>
                            <h4 className="text-slate-900 text-sm font-extrabold font-display uppercase tracking-tight mt-0.5">
                              Hardware Interrupts
                            </h4>
                          </div>
                          <p className="text-slate-500 font-normal font-sans text-xs">
                            Generated by external microchips or hardware devices connecting to pins.
                          </p>
                          <div className="pt-2 border-t border-slate-100 flex flex-col gap-1 text-[10px] text-slate-700">
                            <span className="flex items-center gap-1"><CornerDownRight className="w-3 h-3 text-indigo-500" /> NMI (Non-Maskable Pin)</span>
                            <span className="flex items-center gap-1"><CornerDownRight className="w-3 h-3 text-indigo-500" /> INTR (Maskable Pin)</span>
                          </div>
                        </div>

                        {/* Software Block */}
                        <div className="flex-1 p-4 bg-white border border-slate-200 rounded-xl flex flex-col justify-between space-y-3 shadow-3xs">
                          <div>
                            <span className="text-[10px] font-mono font-extrabold text-indigo-600 uppercase">Category 2</span>
                            <h4 className="text-slate-900 text-sm font-extrabold font-display uppercase tracking-tight mt-0.5">
                              Software Interrupts
                            </h4>
                          </div>
                          <p className="text-slate-500 font-normal font-sans text-xs">
                            Generated internally by running program instructions or CPU error triggers.
                          </p>
                          <div className="pt-2 border-t border-slate-100 flex flex-col gap-1 text-[10px] text-slate-700">
                            <span className="flex items-center gap-1"><CornerDownRight className="w-3 h-3 text-indigo-500" /> INT instruction (INT 21H)</span>
                            <span className="flex items-center gap-1"><CornerDownRight className="w-3 h-3 text-indigo-500" /> DIV error (Divide by 0)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 7 - IMPORTANT 8086 INTERRUPT TYPES */}
                {activeTopic === 6 && (
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-600 block">
                        The Type Allocation Map
                      </span>
                      <h2 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">
                        7. Important 8086 Interrupt Types
                      </h2>
                      <p className="text-slate-500 text-xs">
                        The 8086 divides its 256 interrupts (Type 0 to 255) into standard dedicated slots:
                      </p>
                    </div>

                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-3xs bg-white text-xs">
                      <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-200 font-mono text-[10px] font-bold text-slate-400 py-2.5 px-4">
                        <div className="col-span-3">INTERRUPT TYPE</div>
                        <div className="col-span-5">STANDARD ASSIGNMENT</div>
                        <div className="col-span-4">DESCRIPTION</div>
                      </div>

                      <div className="divide-y divide-slate-100 font-medium">
                        {[
                          { type: 'Type 0', name: 'Divide Error', desc: 'Triggered automatically if divisor is zero.' },
                          { type: 'Type 1', name: 'Single Step', desc: 'CPU halts after each instruction if TF flag is set.' },
                          { type: 'Type 2', name: 'NMI (Non-Maskable)', desc: 'Hardware emergency (power failure alert).' },
                          { type: 'Type 3', name: 'Breakpoint', desc: '1-byte instruction used by debuggers to pause code.' },
                          { type: 'Type 4', name: 'Overflow Error', desc: 'Triggered by INTO if overflow flag is 1.' },
                          { type: 'Type 5–31', name: 'Reserved Space', desc: 'Intel hardware/coprocessor reserved slot.' },
                          { type: 'Type 32–255', name: 'User Defined', desc: 'Software interrupts (like DOS INT 21H).' },
                        ].map((row, idx) => (
                          <div key={idx} className="grid grid-cols-12 py-3 px-4 items-center">
                            <div className="col-span-3 font-mono font-bold text-indigo-600">{row.type}</div>
                            <div className="col-span-5 font-bold text-slate-900">{row.name}</div>
                            <div className="col-span-4 text-slate-500 text-[11px]">{row.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 8 - INTERRUPT VECTOR TABLE */}
                {activeTopic === 7 && (
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-600 block">
                        Memory Architecture (IVT)
                      </span>
                      <h2 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">
                        8. Interrupt Vector Table (IVT) Map
                      </h2>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-150 flex gap-3.5 items-start">
                      <div className="p-2 bg-indigo-600 text-white rounded-lg shrink-0 mt-0.5 shadow-xs">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <p className="text-slate-700 text-xs md:text-[13px] leading-relaxed">
                        "How does the 8086 find the address of the correct ISR? It uses the <strong className="text-indigo-700 font-extrabold">Interrupt Vector Table (IVT)</strong>, which acts as an address directory occupying the first <strong className="text-indigo-700 font-extrabold">1 KB of system memory (00000H to 003FFH)</strong>."
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-1">
                      {/* Interactive address generator calculator */}
                      <div className="lg:col-span-6 p-5 border border-slate-200/80 rounded-2xl bg-white shadow-3xs space-y-4">
                        <h4 className="font-display font-bold text-slate-950 text-sm flex items-center gap-1.5">
                          <Settings className="w-4 h-4 text-indigo-600" />
                          IVT Address Calculator
                        </h4>
                        
                        <div className="space-y-2">
                          <label className="block text-[11px] font-mono font-bold text-slate-500 uppercase">
                            Enter Interrupt Type (0 - 255)
                          </label>
                          <div className="flex gap-2">
                            <input 
                              type="number"
                              min="0"
                              max="255"
                              value={ivtInput}
                              onChange={(e) => calculateIvtAddress(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-250 rounded-xl px-4 py-2 font-mono text-sm font-bold text-indigo-700 focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 font-mono text-[11px] font-bold text-slate-600 space-y-2">
                          <div className="flex justify-between">
                            <span>Vector Offset Formula:</span>
                            <span className="text-indigo-700">Type * 4 Bytes</span>
                          </div>
                          <div className="flex justify-between border-t border-indigo-100 pt-2 text-slate-900">
                            <span>Physical RAM Offset:</span>
                            <span className="text-indigo-600">{ivtAddressHex}</span>
                          </div>
                          <div className="flex justify-between text-slate-900">
                            <span>Address Slot Range (4 Bytes):</span>
                            <span className="text-indigo-600">{ivtRangeHex}</span>
                          </div>
                        </div>
                      </div>

                      {/* Map chart drawing */}
                      <div className="lg:col-span-6 bg-slate-900 text-white p-5 rounded-2xl font-mono text-[10px] space-y-1.5 shadow-md">
                        <span className="text-slate-400 text-[9px] block uppercase font-extrabold tracking-widest text-center mb-1">
                          IVT Physical Memory Map
                        </span>
                        <div className="flex justify-between border-b border-slate-800 pb-1 font-bold text-slate-400">
                          <span>RAM ADDRESS</span>
                          <span>VECTOR TARGET IN IVT</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800/40">
                          <span className="text-slate-400">00000H - 00003H</span>
                          <span className="text-indigo-400">Type 0 (Divide Error Vector)</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800/40">
                          <span className="text-slate-400">00004H - 00007H</span>
                          <span className="text-indigo-400">Type 1 (Single Step Vector)</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800/40">
                          <span className="text-slate-400">00008H - 0000BH</span>
                          <span className="text-indigo-400">Type 2 (NMI Vector)</span>
                        </div>
                        <div className="text-center text-slate-500 py-1 font-extrabold">...</div>
                        <div className="flex justify-between py-1 border-t border-slate-800/40">
                          <span className="text-slate-400">003FCH - 003FFH</span>
                          <span className="text-indigo-400">Type 255 (User Defined software)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 9 - QUICK INTERACTIVE EXAMPLE */}
                {activeTopic === 8 && (
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-600 block">
                        Interactive Hardware Simulation
                      </span>
                      <h2 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">
                        9. Interactive Interrupt Execution Simulator
                      </h2>
                      <p className="text-slate-500 text-xs">
                        See how the registers, stack, and execution pointers change during a hardware interrupt cycle.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
                      {/* CPU Code Block & Registers */}
                      <div className="lg:col-span-7 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {/* Program box */}
                          <div className="p-4 rounded-xl bg-slate-900 text-white font-mono text-[10.5px] space-y-1 shadow-sm">
                            <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider mb-2">Main Assembly Code</span>
                            <div className={`p-1 rounded flex justify-between ${simStep === 0 ? 'bg-indigo-600/65 font-bold border border-indigo-500' : ''}`}>
                              <span>0100H: MOV AX, 1234H</span>
                              {simStep === 0 && <span className="text-[8px] uppercase font-black bg-indigo-500 px-1 py-0.5 rounded text-white shrink-0">NEXT</span>}
                            </div>
                            <div className={`p-1 rounded flex justify-between ${simStep === 1 ? 'bg-indigo-600/65 font-bold border border-indigo-500' : ''}`}>
                              <span>0103H: MOV BX, 5678H</span>
                              {simStep === 1 && <span className="text-[8px] uppercase font-black bg-indigo-500 px-1 py-0.5 rounded text-white shrink-0">NEXT</span>}
                            </div>
                            <div className={`p-1 rounded flex justify-between ${simStep === 2 || simStep === 3 || simStep === 7 ? 'bg-indigo-600/35 border border-indigo-500/20' : ''}`}>
                              <span>0106H: ADD AX, BX</span>
                            </div>
                            <div className="p-1 rounded text-slate-500">
                              <span>0108H: MOV CX, AX</span>
                            </div>

                            {/* Separator for ISR */}
                            <div className="pt-2 border-t border-slate-800 mt-2">
                              <span className="text-[9px] font-bold text-indigo-400 block uppercase tracking-wider mb-1">Keyboard ISR Code</span>
                              <div className={`p-1 rounded ${simStep === 5 ? 'bg-indigo-600/65 font-bold border border-indigo-500' : ''}`}>
                                <span>0400H: MOV CX, FFFFH</span>
                              </div>
                              <div className={`p-1 rounded ${simStep === 6 ? 'bg-indigo-600/65 font-bold border border-indigo-500' : ''}`}>
                                <span>0403H: IRET</span>
                              </div>
                            </div>
                          </div>

                          {/* Register array box */}
                          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 font-mono text-[11px] font-bold space-y-2.5">
                            <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">CPU Registers</span>
                            <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                              <span>AX (Accumulator):</span>
                              <span className="text-indigo-600">{regAX}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                              <span>BX (Base Pointer):</span>
                              <span className="text-indigo-600">{regBX}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                              <span>CX (Count):</span>
                              <span className="text-indigo-600">{regCX}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                              <span>IP (Offset Pointer):</span>
                              <span className="text-indigo-600">{regIP}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                              <span>SP (Stack Pointer):</span>
                              <span className="text-indigo-600">{regSP}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                              <span>IF (Interrupt Enable):</span>
                              <span className={`px-2 py-0.5 rounded text-[9px] text-white ${flagIF === 1 ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                                {flagIF === 1 ? 'Enabled (1)' : 'Disabled (0)'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive trigger and step action buttons */}
                        <div className="flex gap-2 justify-center">
                          {/* Idle or normal instruction step button */}
                          {simStep <= 2 && (
                            <button
                              onClick={handleSimStep}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                            >
                              Run Instruction Step
                            </button>
                          )}

                          {/* Trigger hardware interrupt (INTR pin) button */}
                          {simStep <= 2 && (
                            <button
                              onClick={handleTriggerInterrupt}
                              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1"
                            >
                              <Zap className="w-3.5 h-3.5" />
                              Trigger Interrupt (INTR)
                            </button>
                          )}

                          {/* Continuing the interrupt execution flow step-by-step */}
                          {simStep >= 3 && simStep < 8 && (
                            <button
                              onClick={handleSimContinue}
                              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1"
                            >
                              <span>Continue Interrupt Sequence</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          )}

                          {/* Reset Simulator */}
                          <button
                            onClick={handleResetSim}
                            className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reset
                          </button>
                        </div>
                      </div>

                      {/* Display Stack Memory and Sequence logger explanation */}
                      <div className="lg:col-span-5 space-y-4">
                        {/* Simulation Logging console */}
                        <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/20 text-xs min-h-[100px] flex flex-col justify-between">
                          <span className="text-[9px] font-bold text-indigo-700 uppercase tracking-wider block mb-1">Execution Status Log</span>
                          <p className="text-slate-800 leading-relaxed font-medium">
                            {simMessage}
                          </p>
                          <div className="text-[9.5px] font-bold font-mono text-indigo-500 mt-2 pt-2 border-t border-indigo-100/40">
                            CPU STATUS: {simStep === 0 ? 'READY' : simStep >= 3 && simStep < 7 ? '⚠️ ISR SERVICING' : 'PROGRAM STREAM'}
                          </div>
                        </div>

                        {/* Stack Memory Monitor */}
                        <div className="p-4 rounded-xl border border-slate-200 bg-white font-mono text-[10px] space-y-2 shadow-3xs min-h-[140px]">
                          <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Stack RAM Monitor</span>
                          <div className="flex justify-between border-b border-slate-100 pb-1 font-bold text-slate-400">
                            <span>STACK ADDR</span>
                            <span>DATA (16-BIT)</span>
                            <span>ROLE</span>
                          </div>
                          {stackMem.length === 0 ? (
                            <div className="text-center text-slate-400 py-6 italic">
                              Stack memory empty (SP = FFFEH)
                            </div>
                          ) : (
                            stackMem.map((item, idx) => (
                              <div key={idx} className="flex justify-between py-1 border-b border-slate-50 text-slate-700">
                                <span className="font-bold">{item.addr}</span>
                                <span className="text-indigo-600 font-extrabold">{item.val}</span>
                                <span className="text-slate-500 text-[9.5px]">{item.desc}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 10 - REMEMBER */}
                {activeTopic === 9 && (
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-600 block">
                        Module Recap Summary
                      </span>
                      <h2 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">
                        10. Brain Recall Summary
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                      <div className="p-5 rounded-2xl bg-indigo-50/35 border border-indigo-100 space-y-3.5 shadow-3xs">
                        <h4 className="font-display font-black text-slate-900 text-sm flex items-center gap-1.5 uppercase">
                          <Award className="w-4 h-4 text-indigo-600 animate-pulse" />
                          Core Definitions
                        </h4>
                        
                        <div className="space-y-2 text-xs font-semibold text-slate-700">
                          <div className="flex gap-2.5 items-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0"></span>
                            <p><strong className="text-indigo-700">Interrupt</strong> = Request for CPU attention.</p>
                          </div>
                          <div className="flex gap-2.5 items-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0"></span>
                            <p><strong className="text-indigo-700">ISR</strong> = Interrupt Service Routine (special handler subroutine).</p>
                          </div>
                          <div className="flex gap-2.5 items-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0"></span>
                            <p><strong className="text-indigo-700">IVT</strong> = Stores CS:IP addresses of 256 interrupts. Resides in first 1 KB of RAM.</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-3 shadow-3xs">
                        <h4 className="font-display font-black text-slate-950 text-sm flex items-center gap-1.5 uppercase">
                          <Layers className="w-4 h-4 text-indigo-600" />
                          The Response Loop
                        </h4>
                        
                        <div className="flex flex-col gap-1 font-mono text-[10px] font-bold text-slate-600 pl-2">
                          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 text-[9px] flex items-center justify-center font-bold">1</span> EVENT OCCURS</div>
                          <div className="h-2 border-l border-indigo-200 ml-2"></div>
                          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 text-[9px] flex items-center justify-center font-bold">2</span> SAVE CONTEXT (FLAGS, CS, IP TO STACK)</div>
                          <div className="h-2 border-l border-indigo-200 ml-2"></div>
                          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 text-[9px] flex items-center justify-center font-bold">3</span> RUN ISR CODE BLOCK</div>
                          <div className="h-2 border-l border-indigo-200 ml-2"></div>
                          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 text-[9px] flex items-center justify-center font-bold">4</span> IRET COMMAND RESUMES ORIGINAL CODE</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 11 - QUICK CHECK QUIZ */}
                {activeTopic === 10 && (
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-600 block">
                        Student Self Assessment
                      </span>
                      <h2 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">
                        11. Module Concept Quick Quiz
                      </h2>
                    </div>

                    {!quizSubmitted ? (
                      <div className="space-y-6 max-h-[380px] overflow-y-auto pr-1">
                        {QUIZ_QUESTIONS.map((q, qIdx) => (
                          <div key={q.id} className="p-4 border border-slate-200 bg-white rounded-xl space-y-3 shadow-3xs">
                            <h4 className="font-display font-extrabold text-slate-900 text-[13px] leading-tight">
                              {qIdx + 1}. {q.q}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                              {q.options.map((opt, oIdx) => {
                                const isSelected = selectedAnswers[qIdx] === oIdx;
                                return (
                                  <button
                                    key={oIdx}
                                    onClick={() => handleSelectQuizOption(qIdx, oIdx)}
                                    className={`w-full text-left p-2.5 rounded-lg border transition-all font-semibold cursor-pointer ${
                                      isSelected 
                                        ? 'bg-indigo-600 text-white border-indigo-700' 
                                        : 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}

                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={handleSubmitQuiz}
                            disabled={Object.keys(selectedAnswers).length < QUIZ_QUESTIONS.length}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          >
                            Submit Assessment ({Object.keys(selectedAnswers).length} of {QUIZ_QUESTIONS.length} answered)
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 space-y-4 max-w-md mx-auto">
                        <div className="p-3 bg-emerald-50 text-emerald-700 rounded-full inline-block border border-emerald-200">
                          <Check className="w-10 h-10" />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-lg text-slate-950">Assessment Completed!</h3>
                          <p className="text-xs text-slate-500 mt-1">Excellent job walking through the 8086 Interrupt core lessons.</p>
                        </div>

                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-150 font-mono text-center">
                          <span className="text-slate-600 text-[11px] block uppercase tracking-wider font-bold">Your Score</span>
                          <strong className="text-xl text-indigo-700">{score} / {QUIZ_QUESTIONS.length} Correct</strong>
                        </div>

                        <div className="space-y-4 text-left max-h-[220px] overflow-y-auto pr-1">
                          {QUIZ_QUESTIONS.map((q, idx) => {
                            const isCorrect = selectedAnswers[idx] === q.correct;
                            return (
                              <div key={q.id} className="p-3 border rounded-xl bg-slate-50 text-xs">
                                <div className="flex items-center gap-1.5 font-bold mb-1">
                                  {isCorrect ? (
                                    <span className="text-emerald-600">✓ Correct</span>
                                  ) : (
                                    <span className="text-rose-600">✗ Incorrect</span>
                                  )}
                                  <span className="text-slate-400">| Question {idx + 1}</span>
                                </div>
                                <p className="text-slate-700 font-medium mb-1.5">{q.q}</p>
                                <p className="text-slate-500 text-[11px] italic leading-relaxed">{q.exp}</p>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex justify-center gap-2">
                          <button
                            onClick={handleResetQuiz}
                            className="px-4 py-2 text-xs border border-slate-200 rounded-xl text-slate-800 bg-white hover:bg-slate-50 transition-all font-bold cursor-pointer"
                          >
                            Retake Quiz
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SECTION NAVIGATION CONTROLS inside simulator layout */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-6 bg-white shrink-0">
                <button
                  onClick={handlePrevTopic}
                  disabled={activeTopic === 0}
                  className="px-3.5 py-2 text-xs border border-slate-200 rounded-xl text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 transition-all font-bold flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Back: {activeTopic > 0 ? TOPICS[activeTopic - 1].shortTitle : 'Start'}
                </button>

                <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-mono font-extrabold uppercase">
                  <span>Topic {activeTopic + 1} / {TOPICS.length}</span>
                </div>

                <button
                  onClick={handleNextTopic}
                  disabled={activeTopic === TOPICS.length - 1}
                  className="px-4 py-2 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-750 rounded-xl border border-indigo-100 transition-all font-bold flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next: {activeTopic < TOPICS.length - 1 ? TOPICS[activeTopic + 1].shortTitle : 'Finish'}
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
