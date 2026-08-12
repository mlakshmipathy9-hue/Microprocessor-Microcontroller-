import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, BookOpen, ArrowRight, Play, RefreshCw, Cpu } from 'lucide-react';

interface InterruptType {
  type: number;
  name: string;
  category: 'hardware' | 'software' | 'internal';
  ivtAddress: string;
  description: string;
  isrAddress: string;
}

const interruptList: InterruptType[] = [
  {
    type: 0,
    name: 'Divide by Zero Error',
    category: 'internal',
    ivtAddress: '00000H - 00003H',
    description: 'Triggered automatically by the ALU when a division instruction (DIV) has a divisor of zero.',
    isrAddress: '8A50:0100'
  },
  {
    type: 1,
    name: 'Single-Step Trap',
    category: 'internal',
    ivtAddress: '00004H - 00007H',
    description: 'Triggered after every instruction when the Trap Flag (TF) is set to 1. Used by debuggers to inspect registers.',
    isrAddress: '9000:03F0'
  },
  {
    type: 2,
    name: 'NMI (Non-Maskable Interrupt)',
    category: 'hardware',
    ivtAddress: '00008H - 0000BH',
    description: 'Triggered by a high level on the physical NMI input pin. Cannot be disabled by CLI (Software). Used for critical power failures.',
    isrAddress: 'F000:E050'
  },
  {
    type: 3,
    name: 'Breakpoint (INT 3)',
    category: 'software',
    ivtAddress: '0000CH - 0000FH',
    description: 'A 1-byte software instruction used by programmers to place breakpoints in their program to halt execution.',
    isrAddress: '8F00:10A0'
  },
  {
    type: 4,
    name: 'Overflow Error (INTO)',
    category: 'software',
    ivtAddress: '00010H - 00013H',
    description: 'Triggered by the INTO instruction if the Overflow Flag (OF) is set to 1 after an arithmetic operation.',
    isrAddress: '8A50:0200'
  }
];

export default function InterruptVectorTableSimulator() {
  const [selectedType, setSelectedType] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const interrupt = interruptList.find(i => i.type === selectedType) || interruptList[0];

  const steps = [
    {
      title: '1. Interrupt Event Triggered',
      desc: `The processor detects a ${interrupt.name} (Type ${interrupt.type}) condition.`
    },
    {
      title: '2. Save Flag Register',
      desc: 'The CPU pushes the current 16-bit Flag Register onto the Stack memory to preserve system status.'
    },
    {
      title: '3. Disable Interrupts (Clear IF & TF)',
      desc: 'The CPU sets IF = 0 and TF = 0. This disables further maskable hardware interrupts during the ISR execution.'
    },
    {
      title: '4. Save Return Address',
      desc: 'The CPU pushes CS (Code Segment) then IP (Instruction Pointer) of the next instruction onto the Stack.'
    },
    {
      title: '5. Compute IVT Pointer',
      desc: `CPU multiplies Type by 4. Address = Type * 4. For Type ${interrupt.type}, it reads vector from address ${interrupt.ivtAddress}.`
    },
    {
      title: '6. Load CS:IP & Jump',
      desc: `Loads target ISR Vector ${interrupt.isrAddress} into CS and IP. Execution jumps to the Interrupt Service Routine!`
    }
  ];

  const runNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsSimulating(false);
    }
  };

  const startSimulation = () => {
    setCurrentStep(0);
    setIsSimulating(true);
  };

  const resetSimulation = () => {
    setCurrentStep(0);
    setIsSimulating(false);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
      {/* Title */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <span className="text-sm font-semibold text-slate-700 font-display">8086 Interrupt Vector Table & Flow Simulator</span>
        </div>
      </div>

      <div className="flex-1 p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-y-auto">
        {/* Left: IVT Address Map */}
        <div className="lg:col-span-5 flex flex-col justify-between border-r border-slate-100 pr-4">
          <div>
            <h4 className="font-display font-semibold text-sm text-slate-800 mb-1 flex items-center gap-1">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              Interrupt Vector Table (IVT)
            </h4>
            <p className="text-[11px] text-slate-500 mb-3">
              First 1 KB of RAM (00000H to 003FFH) stores 256 vector addresses (4 bytes each).
            </p>

            <div className="space-y-1.5">
              {interruptList.map(item => (
                <button
                  key={item.type}
                  disabled={isSimulating}
                  onClick={() => {
                    setSelectedType(item.type);
                    resetSimulation();
                  }}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                    selectedType === item.type
                      ? 'bg-rose-50 border-rose-200 text-rose-950 shadow-xs'
                      : 'border-slate-100 hover:bg-slate-50 text-slate-700 disabled:opacity-50'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs">Type {item.type}: {item.name}</div>
                    <span className="text-[10px] font-mono text-slate-400 block mt-0.5">IVT Address: {item.ivtAddress}</span>
                  </div>
                  <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                    item.category === 'hardware' ? 'bg-amber-100 text-amber-800' :
                    item.category === 'software' ? 'bg-blue-100 text-blue-800' :
                    'bg-slate-200 text-slate-700'
                  }`}>
                    {item.category}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mt-4 text-xs text-slate-600">
            <span className="font-semibold block text-slate-800 mb-0.5">What is a Vector?</span>
            A Vector consists of 4 bytes: 2 bytes for CS (Code Segment) and 2 bytes for IP (Instruction Pointer).
          </div>
        </div>

        {/* Right: Simulation Walkthrough */}
        <div className="lg:col-span-7 bg-slate-50/50 rounded-xl p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-display font-bold text-slate-800 text-sm">
                  Interrupt Response Step-by-Step Flow
                </h4>
                <p className="text-xs text-slate-500">
                  Observe the hardware sequence that routes execution to the ISR.
                </p>
              </div>

              {!isSimulating ? (
                <button
                  onClick={startSimulation}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                >
                  <Play className="w-3.5 h-3.5" />
                  Run Simulation
                </button>
              ) : (
                <button
                  onClick={resetSimulation}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset
                </button>
              )}
            </div>

            <div className="border-t border-slate-100 pt-3">
              {isSimulating ? (
                <div className="space-y-4">
                  {/* Step Display Card */}
                  <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm space-y-2">
                    <div className="font-display font-bold text-sm text-indigo-700">
                      {steps[currentStep].title}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {steps[currentStep].desc}
                    </p>
                  </div>

                  {/* Execution Flow Indicators */}
                  <div className="flex justify-between items-center bg-slate-100/60 p-2 rounded-lg font-mono text-[10px] text-slate-600 border">
                    <div className="text-center">
                      <span className="block text-slate-400">STACK</span>
                      <strong className={currentStep >= 1 ? 'text-indigo-600 font-bold' : ''}>
                        {currentStep >= 4 ? '[Flags][CS][IP]' : currentStep >= 1 ? '[Flags]' : 'Empty'}
                      </strong>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                    <div className="text-center">
                      <span className="block text-slate-400">FLAGS (IF)</span>
                      <strong className={currentStep >= 2 ? 'text-rose-600' : 'text-emerald-600'}>
                        {currentStep >= 2 ? 'IF=0 (Disabled)' : 'IF=1 (Enabled)'}
                      </strong>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                    <div className="text-center">
                      <span className="block text-slate-400">CS:IP</span>
                      <strong className={currentStep === 5 ? 'text-indigo-600 font-bold' : ''}>
                        {currentStep === 5 ? interrupt.isrAddress : 'User Program'}
                      </strong>
                    </div>
                  </div>

                  <button
                    onClick={runNextStep}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2 rounded-lg transition-all shadow-xs"
                  >
                    {currentStep < steps.length - 1 ? 'Next Step' : 'Finish Simulation'}
                  </button>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <Play className="w-10 h-10 mx-auto mb-2 text-indigo-400 opacity-60" />
                  <p className="text-xs font-semibold text-slate-600">Simulation Ready</p>
                  <p className="text-[11px] text-slate-400 mt-1">Select an interrupt on the left, then click &quot;Run Simulation&quot; to see the exact microcode sequence.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick tips */}
          <div className="bg-rose-50 border border-rose-100/50 p-3 rounded-lg text-rose-950 text-xs mt-4">
            <span className="font-bold text-rose-800 block mb-0.5">Hardware vs Software Interrupts</span>
            <strong>Hardware:</strong> Triggered by physical pins (INTR, NMI).<br />
            <strong>Software:</strong> Triggered by executing instructions inside code (e.g., <span className="font-mono bg-rose-100 text-rose-800 px-1 rounded-sm">INT 21H</span>, <span className="font-mono bg-rose-100 text-rose-800 px-1 rounded-sm">INT 3</span>).
          </div>
        </div>
      </div>
    </div>
  );
}
