import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Layers, ListChecks, ArrowRight, BookOpen, Network, Database, Sparkles, HelpCircle, Zap, Activity } from 'lucide-react';

interface Generation {
  year: string;
  name: string;
  bits: string;
  transistors: string;
  speed: string;
  description: string;
  milestone: string;
}

const intelGenerations: Generation[] = [
  {
    year: '1971',
    name: 'Intel 4004',
    bits: '4-bit',
    transistors: '2,300',
    speed: '740 kHz',
    description: 'The world\'s first commercially available single-chip microprocessor. Designed specifically for Busicom calculators.',
    milestone: 'First commercial micro-processor.'
  },
  {
    year: '1972',
    name: 'Intel 8008',
    bits: '8-bit',
    transistors: '3,500',
    speed: '500-800 kHz',
    description: 'First 8-bit microprocessor, ordered by Computer Terminal Corporation for their Datapoint 2200 terminal.',
    milestone: 'Entry into 8-bit computation.'
  },
  {
    year: '1974',
    name: 'Intel 8080',
    bits: '8-bit',
    transistors: '6,000',
    speed: '2 MHz',
    description: 'Became the brain of the first personal computer (Altair 8800). Required 3 power supplies (+5V, -5V, +12V).',
    milestone: 'Birth of PC revolution.'
  },
  {
    year: '1976',
    name: 'Intel 8085',
    bits: '8-bit',
    transistors: '6,500',
    speed: '3-6 MHz',
    description: 'Enhanced version of 8080. Operating on single +5V supply. Built-in serial I/O and interrupt controller.',
    milestone: 'Integrated single-supply processor.'
  },
  {
    year: '1978',
    name: 'Intel 8086',
    bits: '16-bit',
    transistors: '29,000',
    speed: '5-10 MHz',
    description: 'The legendary 16-bit processor that established the x86 instruction set architecture. Addresses 1 MB of segmented memory.',
    milestone: 'Establishing the legendary x86 architecture.'
  },
  {
    year: '1982',
    name: 'Intel 80286',
    bits: '16-bit',
    transistors: '134,000',
    speed: '6-25 MHz',
    description: 'Introduced protected mode allowing memory protection, virtual memory addressing up to 16 MB, and active multitasking.',
    milestone: 'Multitasking & Memory Protection.'
  },
  {
    year: '1985',
    name: 'Intel 80386',
    bits: '32-bit',
    transistors: '275,000',
    speed: '12-40 MHz',
    description: 'Intel\'s first 32-bit processor. Introduced a fully flat memory model and hardware-based paging/virtual 8086 mode.',
    milestone: 'Transition to 32-bit Architecture.'
  },
  {
    year: '1989',
    name: 'Intel 80486',
    bits: '32-bit',
    transistors: '1.2 Million',
    speed: '16-100 MHz',
    description: 'Highly integrated processor featuring an on-chip math coprocessor (FPU), unified level 1 cache, and optimized execution pipelines.',
    milestone: 'On-chip FPU and L1 Cache Integration.'
  },
  {
    year: '1993',
    name: 'Intel Pentium Series',
    bits: '32-bit',
    transistors: '3.1 Million+',
    speed: '60-300 MHz',
    description: 'Superscalar architecture featuring dual instruction pipelines, executing multiple instructions per clock cycle. Later added MMX for multimedia.',
    milestone: 'Superscalar execution era.'
  },
  {
    year: '2005',
    name: 'Intel Pentium D',
    bits: '64-bit',
    transistors: '230 Million',
    speed: '2.6-3.2 GHz',
    description: 'Intel\'s first mainstream dual-core desktop processor. Placed two Pentium 4 dies together on a single package.',
    milestone: 'Beginning of dual-core processors.'
  },
  {
    year: '2011',
    name: 'Intel Core i7 (Sandy Bridge)',
    bits: '64-bit',
    transistors: '1.16 Billion',
    speed: '2.5-3.8 GHz',
    description: 'Unified ring-bus architecture integrating CPU cores, level 3 cache, and GPU on a single die. Introduced Intel Turbo Boost 2.0.',
    milestone: 'Ring-bus integration and dynamic boost.'
  },
  {
    year: '2026',
    name: 'Intel Core Ultra (Series 2)',
    bits: '64-bit Hybrid',
    transistors: '30+ Billion',
    speed: '4.0-5.7 GHz',
    description: 'Heterogeneous 3D tile architecture with performance cores (P-cores), efficient cores (E-cores), and built-in Neural Processing Unit (NPU) for high-performance AI processing.',
    milestone: 'Heterogeneous tile and NPU integration.'
  }
];

const otherGenerations: Generation[] = [
  {
    year: '1974',
    name: 'Motorola 6800',
    bits: '8-bit',
    transistors: '4,100',
    speed: '1-2 MHz',
    description: 'Motorola\'s primary competitor to the Intel 8080. Required only a single +5V power supply and was highly influential in industrial electronics.',
    milestone: 'First major alternative 8-bit architecture.'
  },
  {
    year: '1976',
    name: 'Zilog Z80',
    bits: '8-bit',
    transistors: '8,500',
    speed: '2.5-8 MHz',
    description: 'An enhanced derivative of the Intel 8080 design. Features twice as many registers, single +5V supply, built-in DRAM refresh, and complete binary compatibility with 8080 assembly.',
    milestone: 'Extremely popular 8-bit chiplet of home PCs.'
  },
  {
    year: '1979',
    name: 'Motorola 68000',
    bits: '16/32-bit',
    transistors: '68,000',
    speed: '4-12.5 MHz',
    description: 'Advanced design with 32-bit registers internally but a 16-bit external data bus. Powered early Apple Macintosh computers and legendary arcade hardware.',
    milestone: 'High-performance CISC alternative.'
  },
  {
    year: '1999',
    name: 'AMD Athlon',
    bits: '32-bit',
    transistors: '22 Million',
    speed: '500 MHz - 1 GHz',
    description: 'Competed with Pentium III. Reached the historic 1 GHz clock speed milestone first. Featured a high-performance EV6 bus licensed from DEC Alpha.',
    milestone: 'AMD first-to-1GHz milestone.'
  },
  {
    year: '2003',
    name: 'AMD Athlon 64',
    bits: '64-bit',
    transistors: '105 Million',
    speed: '1.0-2.4 GHz',
    description: 'Pioneered AMD64 (x86-64) instruction set extension, which Intel eventually had to license. Included an on-die memory controller to reduce memory access latency.',
    milestone: 'Pioneered modern 64-bit x86 architecture.'
  },
  {
    year: '2017',
    name: 'AMD Ryzen (Zen 1)',
    bits: '64-bit',
    transistors: '4.8 Billion',
    speed: '3.0-4.0 GHz',
    description: 'Disrupted the industry with high-efficiency multi-die chiplet modules linked by AMD Infinity Fabric, returning AMD to high-end processor competitiveness.',
    milestone: 'Revolutionary high-yield chiplet design.'
  },
  {
    year: '2020',
    name: 'Apple M1 SoC',
    bits: '64-bit ARM',
    transistors: '16 Billion',
    speed: '2.1-3.2 GHz',
    description: 'Highly integrated System-on-Chip (SoC) using custom 5nm ARM architecture. Combines CPU, GPU, Neural Engine, and unified DRAM in a single low-power package.',
    milestone: 'Revolutionary performance-per-watt SoC.'
  },
  {
    year: '2026',
    name: 'AMD Ryzen AI Series',
    bits: '64-bit Hybrid',
    transistors: '25+ Billion',
    speed: '3.8-5.4 GHz',
    description: 'The latest competitor featuring custom Zen 5 cores combined with powerful XDNA AI engines, delivering industry-leading local NPU operations per second (TOPS).',
    milestone: 'High-performance local NPU competitor.'
  }
];

export default function EvolutionTimeline({ defaultTab = 'timeline' }: { defaultTab?: 'timeline' | 'vs' }) {
  const [selectedIdx, setSelectedIdx] = useState(4); // default to 8086 index
  const [timelineType, setTimelineType] = useState<'intel' | 'others'>('intel');
  const [activeTab, setActiveTab] = useState<'timeline' | 'vs'>(defaultTab);
  const [decodedTerm, setDecodedTerm] = useState<'ring-bus' | 'gpu' | 'l3-cache'>('ring-bus');

  const currentList = timelineType === 'intel' ? intelGenerations : otherGenerations;

  const handleTimelineTypeChange = (type: 'intel' | 'others') => {
    setTimelineType(type);
    setSelectedIdx(type === 'intel' ? 4 : 0); // Reset safely based on selected brand
  };

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  return (
    <div className="flex flex-col h-full">
      {/* Tab Switcher */}
      <div className="flex bg-slate-100/80 p-1 rounded-xl mb-4 max-w-md self-start">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`py-1.5 px-4 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === 'timeline'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          Evolution Timeline
        </button>
        <button
          onClick={() => setActiveTab('vs')}
          className={`py-1.5 px-4 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === 'vs'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Microprocessor vs Microcontroller
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'timeline' ? (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full"
            >
              {/* Left Timeline Selector */}
              <div className="md:col-span-5 flex flex-col border-r border-slate-100 pr-4">
                <div>
                  <h3 className="font-display text-lg font-semibold text-slate-800 mb-1 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    Evolutionary Milestones
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Select a line to explore parallel chip developments:
                  </p>

                  {/* Parallel/Intel Selector buttons */}
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg mb-4">
                    <button
                      onClick={() => handleTimelineTypeChange('intel')}
                      className={`py-1.5 px-2 text-[11px] font-bold rounded transition-all text-center ${
                        timelineType === 'intel'
                          ? 'bg-white text-indigo-600 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Intel CPU Line
                    </button>
                    <button
                      onClick={() => handleTimelineTypeChange('others')}
                      className={`py-1.5 px-2 text-[11px] font-bold rounded transition-all text-center ${
                        timelineType === 'others'
                          ? 'bg-white text-indigo-600 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Parallel Competitors
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {currentList.map((g, idx) => (
                      <button
                        key={g.name}
                        onClick={() => setSelectedIdx(idx)}
                        className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                          selectedIdx === idx
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-950 shadow-xs'
                            : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-xs text-indigo-600/80 font-mono">{g.year}</div>
                          <div className="font-bold text-sm">{g.name}</div>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                            selectedIdx === idx ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {g.bits}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Processor Details Card */}
              <div className="md:col-span-7 flex flex-col justify-start">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${timelineType}-${selectedIdx}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.15 }}
                    className="bg-slate-50/50 rounded-xl p-5 border border-slate-100 space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-indigo-600 font-mono bg-indigo-50 px-2 py-1 rounded-sm">
                          YEAR {currentList[selectedIdx]?.year || '1971'}
                        </span>
                        <h4 className="font-display text-2xl font-bold text-slate-800 mt-1.5">
                          {currentList[selectedIdx]?.name || 'Processor'}
                        </h4>
                      </div>
                      <div className="text-right bg-white p-2 rounded-lg shadow-xs border border-slate-100 text-xs">
                        <span className="text-slate-400 block font-mono">Word Length</span>
                        <span className="font-bold text-indigo-600 font-mono text-base">{currentList[selectedIdx]?.bits || '8-bit'}</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3">
                      <p className="text-slate-600 text-sm leading-relaxed mb-4">
                        {currentList[selectedIdx]?.description}
                      </p>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-white p-3 rounded-lg border border-slate-100">
                          <span className="text-[10px] uppercase font-mono text-slate-400 block">Transistor Count</span>
                          <span className="font-bold text-slate-800 font-mono text-sm">{currentList[selectedIdx]?.transistors}</span>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-slate-100">
                          <span className="text-[10px] uppercase font-mono text-slate-400 block">Typical Clock Speed</span>
                          <span className="font-bold text-slate-800 font-mono text-sm">{currentList[selectedIdx]?.speed}</span>
                        </div>
                      </div>

                      <div className="bg-indigo-50/50 text-slate-800 p-3 rounded-lg flex items-center gap-3 border border-indigo-100/60">
                        <div className="p-1.5 bg-indigo-100 rounded-lg">
                          <ListChecks className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <div className="text-[10px] text-indigo-600 font-mono uppercase tracking-wider font-semibold">Key Significance</div>
                          <div className="text-xs font-medium">{currentList[selectedIdx]?.milestone}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="vs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-4">
                {/* Microprocessor card */}
                <div className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-indigo-600 text-white rounded-lg">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-indigo-950">Microprocessor (MPU)</h4>
                      <p className="text-xs text-indigo-600 font-medium">e.g., Intel 8086, 8085, Core i7</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-xs text-indigo-950">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
                      <span><strong>Dependent System</strong>: Requires external support chips (RAM, ROM, I/O ports, clock generator) to form a functioning computer.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
                      <span><strong>CPU Only</strong>: Contains ONLY the central processing unit on a single silicon chip.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
                      <span><strong>External Peripherals</strong>: Memory (RAM/ROM), I/O ports, timers, and serial ports are connected externally.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
                      <span><strong>System Design</strong>: Complex circuitry, high board space required, expensive to manufacture complete system.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
                      <span><strong>Performance</strong>: Very fast execution speeds (MHz to GHz), flexible, handles generic multi-tasking computing easily.</span>
                    </li>
                  </ul>
                </div>

                {/* Microcontroller card */}
                <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-emerald-600 text-white rounded-lg">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-emerald-950">Microcontroller (MCU)</h4>
                      <p className="text-xs text-emerald-600 font-medium">e.g., Intel 8051, PIC, Arduino (ATmega328)</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-xs text-emerald-950">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span><strong>Independent System</strong>: Self-contained standalone system-on-chip that operates independently without external memory/I/O ICs.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span><strong>System-on-Chip (SoC)</strong>: Combines CPU, RAM, ROM, I/O, Timers, and ADC on a SINGLE silicon chip.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span><strong>Internal Peripherals</strong>: All essential modules are on-chip, minimizing external components.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span><span><strong>System Design</strong>: Simplified routing, compact layout, significantly cheaper for embedded devices.</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span><strong>Performance</strong>: Slower clock speeds (kHz to MHz), custom application-specific, perfect for single dedicated tasks (washing machines, cars).</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Quick Summary comparison table */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2 font-mono">Summary Comparison Table</h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-mono">
                        <th className="pb-1.5 font-semibold">Feature</th>
                        <th className="pb-1.5 font-semibold">Microprocessor (e.g. 8086)</th>
                        <th className="pb-1.5 font-semibold">Microcontroller (e.g. 8051)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr>
                        <td className="py-2 font-medium">System Type (Autonomy)</td>
                        <td className="py-2"><strong>Dependent System</strong> (Requires external RAM, ROM, I/O ports &amp; clock generator to function)</td>
                        <td className="py-2"><strong>Independent System</strong> (Self-contained standalone system-on-chip with built-in RAM, ROM, &amp; I/O)</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-medium">Component Independence</td>
                        <td className="py-2"><strong>Independent Modules</strong> (External RAM/ROM/I/O can be expanded or replaced independently)</td>
                        <td className="py-2"><strong>Fixed Dependent Integration</strong> (On-chip memory &amp; peripherals are fixed by silicon design)</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-medium">Internal Structure</td>
                        <td className="py-2">Only CPU (ALU, CU, Registers)</td>
                        <td className="py-2">CPU + RAM + ROM + Timers + I/O Ports</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-medium">Memory Architecture</td>
                        <td className="py-2">Von Neumann or Harvard, external connections</td>
                        <td className="py-2">Mostly Harvard (Separate Program/Data Memory)</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-medium">Cost & Size</td>
                        <td className="py-2">Bulkier board, more expensive overall system</td>
                        <td className="py-2">Highly compact, extremely cost-effective</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-medium">Primary Usage</td>
                        <td className="py-2">General purpose computing, high processing power</td>
                        <td className="py-2">Embedded control, smart sensors, dedicated systems</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Silicon Terms Decoder Section */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-display font-bold text-slate-800 text-sm">Interactive Silicon Concept Decoder</h3>
              <p className="text-xs text-slate-500">Demystifying advanced hardware features from university exams and latest architectures.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 bg-slate-50 rounded-xl p-4 md:p-5 border border-slate-150">
            {/* Left selector */}
            <div className="lg:col-span-5 space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Select a hardware concept:</span>
              <div className="space-y-1.5">
                <button
                  onClick={() => setDecodedTerm('ring-bus')}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center gap-3 ${
                    decodedTerm === 'ring-bus'
                      ? 'bg-white border-indigo-200 text-indigo-950 shadow-xs'
                      : 'border-transparent hover:bg-white/50 text-slate-600 hover:text-slate-950'
                  }`}
                >
                  <div className={`p-1.5 rounded ${decodedTerm === 'ring-bus' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200/60 text-slate-500'}`}>
                    <Network className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate">Unified Ring-Bus Architecture</div>
                    <div className="text-[10px] text-slate-400 truncate">How CPU cores share data on-chip</div>
                  </div>
                </button>

                <button
                  onClick={() => setDecodedTerm('gpu')}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center gap-3 ${
                    decodedTerm === 'gpu'
                      ? 'bg-white border-indigo-200 text-indigo-950 shadow-xs'
                      : 'border-transparent hover:bg-white/50 text-slate-600 hover:text-slate-950'
                  }`}
                >
                  <div className={`p-1.5 rounded ${decodedTerm === 'gpu' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200/60 text-slate-500'}`}>
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate">Integrated GPU (Graphics Processor)</div>
                    <div className="text-[10px] text-slate-400 truncate">On-chip parallel floating-point engine</div>
                  </div>
                </button>

                <button
                  onClick={() => setDecodedTerm('l3-cache')}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center gap-3 ${
                    decodedTerm === 'l3-cache'
                      ? 'bg-white border-indigo-200 text-indigo-950 shadow-xs'
                      : 'border-transparent hover:bg-white/50 text-slate-600 hover:text-slate-950'
                  }`}
                >
                  <div className={`p-1.5 rounded ${decodedTerm === 'l3-cache' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200/60 text-slate-500'}`}>
                    <Database className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate">Level 3 (L3) Shared Cache</div>
                    <div className="text-[10px] text-slate-400 truncate">The shared memory latency buffer</div>
                  </div>
                </button>


              </div>
            </div>

            {/* Right Interactive explanation */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-150 p-4 flex flex-col justify-between">
              <AnimatePresence mode="wait">
                {decodedTerm === 'ring-bus' && (
                  <motion.div
                    key="ring-bus"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-4 h-full flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-150 font-mono">Silicon Architecture</span>
                        <strong className="text-slate-800 text-sm font-display">Unified Ring-Bus interconnect</strong>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Rather than connecting each CPU core, cache partition, and graphics engine with slow motherboard traces or complicated star-point wire grids (crossbars) that consume massive physical space, the chip features a <strong>circular bidirectional highway</strong> (a Ring Bus) etched on the silicon substrate.
                      </p>
                    </div>

                    {/* INTERACTIVE DIAGRAM */}
                    <div className="border border-slate-150 rounded-lg p-3 bg-slate-50/50 my-2">
                      <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block mb-2 text-center">Interactive Ring-Bus Highway</span>
                      
                      <div className="flex flex-col items-center justify-center space-y-2">
                        {/* Ring bus flow */}
                        <div className="grid grid-cols-4 gap-2 w-full text-center text-[10px]">
                          <div className="bg-white border border-slate-200 p-1.5 rounded font-bold text-slate-700 shadow-3xs">Core 1</div>
                          <div className="bg-white border border-slate-200 p-1.5 rounded font-bold text-slate-700 shadow-3xs">Core 2</div>
                          <div className="bg-white border border-slate-200 p-1.5 rounded font-bold text-slate-700 shadow-3xs">Core 3</div>
                          <div className="bg-white border border-slate-200 p-1.5 rounded font-bold text-slate-700 shadow-3xs">Core 4</div>
                        </div>

                        {/* Ring visual line */}
                        <div className="relative w-[85%] h-10 border-4 border-dashed border-indigo-500 rounded-full flex items-center justify-between px-6">
                          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-[8px] font-mono px-2 py-0.5 rounded-full animate-pulse">Bidirectional Ring Bus</span>
                          <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce"></span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 w-full text-center text-[10px]">
                          <div className="bg-white border border-indigo-150 p-1.5 rounded font-bold text-indigo-700 shadow-3xs">System Agent (RAM)</div>
                          <div className="bg-white border border-slate-200 p-1.5 rounded font-bold text-slate-700 shadow-3xs">Shared L3 Cache</div>
                          <div className="bg-white border border-emerald-150 p-1.5 rounded font-bold text-emerald-700 shadow-3xs">Integrated GPU</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-indigo-50/60 p-2.5 rounded border border-indigo-100 text-[11px] text-slate-700">
                      <span className="font-bold text-indigo-700 font-mono text-[9px] uppercase block mb-0.5">Analogy &amp; Benefit</span>
                      Think of it as a <strong>circular high-speed subway train</strong>: Data hops onto the Ring Bus at Core 1, and circles around sequentially to reach the Shared Cache or GPU in picoseconds, eliminating latency!
                    </div>
                  </motion.div>
                )}

                {decodedTerm === 'gpu' && (
                  <motion.div
                    key="gpu"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-4 h-full flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-150 font-mono">Graphics on Silicon</span>
                        <strong className="text-slate-800 text-sm font-display">Integrated GPU (Graphics Processing Unit)</strong>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Historically, the graphics adapter was a separate expansion card (dGPU). Modern microprocessors integrate hundreds of execution engines (the <strong>Integrated GPU</strong>) directly onto the same CPU package. This shares the same thermal limits and provides almost direct access to memory.
                      </p>
                    </div>

                    {/* DIAGRAM */}
                    <div className="border border-slate-150 rounded-lg p-3 bg-slate-50/50 my-2">
                      <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block mb-2 text-center">Physical Die Layout (On-Die Integration)</span>
                      
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-2.5 bg-white relative">
                        <span className="absolute -top-2 left-3 bg-indigo-600 text-white text-[7px] font-mono px-1 rounded">SINGLE SILICON CHIP (DIE)</span>
                        <div className="grid grid-cols-12 gap-2 text-center text-[10px]">
                          <div className="col-span-4 bg-indigo-50 border border-indigo-200 p-3 rounded font-bold text-indigo-800">
                            CPU Cores
                            <div className="text-[8px] font-normal text-indigo-600 mt-1">Logic / Control</div>
                          </div>
                          <div className="col-span-4 bg-slate-100 border border-slate-200 p-3 rounded font-bold text-slate-700">
                            Shared L3 Cache
                            <div className="text-[8px] font-normal text-slate-500 mt-1">Unified Data Pool</div>
                          </div>
                          <div className="col-span-4 bg-emerald-50 border border-emerald-200 p-3 rounded font-bold text-emerald-800">
                            Integrated GPU
                            <div className="text-[8px] font-normal text-emerald-600 mt-1">Parallel Math &amp; Display</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-indigo-50/60 p-2.5 rounded border border-indigo-100 text-[11px] text-slate-700">
                      <span className="font-bold text-indigo-700 font-mono text-[9px] uppercase block mb-0.5">Why it matters</span>
                      Without crossing physical motherboard paths, the GPU can query data from the CPU's memory space instantly. This drastically accelerates image processing, hardware video decoding (AV1/H.265), and local parallel math models.
                    </div>
                  </motion.div>
                )}

                {decodedTerm === 'l3-cache' && (
                  <motion.div
                    key="l3-cache"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-4 h-full flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-150 font-mono">Memory Tier</span>
                        <strong className="text-slate-800 text-sm font-display">Level 3 (L3) Last Level Cache (LLC)</strong>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Caches are tiny buffers of extremely fast SRAM. While <strong>L1</strong> and <strong>L2</strong> are super fast but private to individual cores, <strong>L3 cache</strong> acts as a massive shared pool. Cores check the L3 cache before spending 80 nanoseconds waiting for data from the slow external system RAM.
                      </p>
                    </div>

                    {/* MEMORY HIERARCHY LATENCY TIMELINE */}
                    <div className="border border-slate-150 rounded-lg p-3 bg-slate-50/50 my-2">
                      <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block mb-1 text-center">Memory Latency Hierarchy (Lower is better)</span>
                      
                      <div className="space-y-1.5">
                        <div className="flex items-center text-[10px]">
                          <span className="w-20 font-mono text-slate-500">L1 Cache</span>
                          <div className="flex-1 bg-slate-200 h-3 rounded overflow-hidden">
                            <div className="bg-indigo-600 h-full w-[2%]"></div>
                          </div>
                          <span className="w-14 text-right font-mono font-bold text-indigo-700">~1 ns</span>
                        </div>
                        <div className="flex items-center text-[10px]">
                          <span className="w-20 font-mono text-slate-500">L2 Cache</span>
                          <div className="flex-1 bg-slate-200 h-3 rounded overflow-hidden">
                            <div className="bg-indigo-500 h-full w-[6%]"></div>
                          </div>
                          <span className="w-14 text-right font-mono font-bold text-indigo-700">~3 ns</span>
                        </div>
                        <div className="flex items-center text-[10px]">
                          <span className="w-20 font-mono text-slate-500">L3 Cache</span>
                          <div className="flex-1 bg-slate-200 h-3 rounded overflow-hidden">
                            <div className="bg-indigo-400 h-full w-[24%]"></div>
                          </div>
                          <span className="w-14 text-right font-mono font-bold text-indigo-700">~12 ns</span>
                        </div>
                        <div className="flex items-center text-[10px]">
                          <span className="w-20 font-mono text-slate-500">System RAM</span>
                          <div className="flex-1 bg-slate-200 h-3 rounded overflow-hidden">
                            <div className="bg-rose-500 h-full w-[100%]"></div>
                          </div>
                          <span className="w-14 text-right font-mono font-bold text-rose-600">~80 ns ⚠️</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-indigo-50/60 p-2.5 rounded border border-indigo-100 text-[11px] text-slate-700">
                      <span className="font-bold text-indigo-700 font-mono text-[9px] uppercase block mb-0.5">The Math</span>
                      A CPU clock cycle is roughly 0.2 nanoseconds. If it misses in L1, L2, and L3, it must wait <strong>400+ clock cycles</strong> doing nothing while waiting for System RAM. Keeping L3 cache large directly increases CPU performance!
                    </div>
                  </motion.div>
                )}


              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
