import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Check, HelpCircle, Layers, Cpu } from 'lucide-react';

interface ModeDetail {
  title: string;
  pins: string[];
  controller: string;
  multiprocessor: string;
  cost: string;
  useCase: string;
}

export default function OperatingModeSimulator() {
  const [activeMode, setActiveMode] = useState<'minimum' | 'maximum' | 'comparison'>('minimum');

  const modeData: Record<'minimum' | 'maximum', ModeDetail> = {
    minimum: {
      title: 'Minimum Mode (Single-Processor System)',
      pins: ['WR', 'M/IO', 'DT/R', 'DEN', 'ALE', 'INTA', 'HLDA', 'HOLD'],
      controller: 'No external bus controller required. The 8086 itself generates all control and command signals directly.',
      multiprocessor: 'Does not support co-processors or multiple bus master configurations directly.',
      cost: 'Simple wiring, highly cost-effective, low board-space requirement.',
      useCase: 'Used in small, stand-alone embedded systems (e.g. smart calculators, custom testers).'
    },
    maximum: {
      title: 'Maximum Mode (Multi-Processor System)',
      pins: ['LOCK', 'S2', 'S1', 'S0', 'QS0', 'QS1', 'RQ/GT0', 'RQ/GT1'],
      controller: 'Requires an external Intel 8288 Bus Controller to decode status pins S0, S1, S2 and generate standard bus controls.',
      multiprocessor: 'Perfectly supports numeric coprocessors (like 8087) and multi-processor arrangements.',
      cost: 'More complex design, higher component count, expensive implementation.',
      useCase: 'Used in generic high-performance computers, industrial workstations, and complex multi-tasking engines.'
    }
  };

  const comparisonRows = [
    {
      parameter: "System Architecture",
      minMode: "Single CPU Core System",
      minDetails: "The 8086 is the absolute bus master of the entire motherboard.",
      maxMode: "Multi-Processor Cluster",
      maxDetails: "Co-processors (8087 Math, 8089 I/O) share system resources.",
      practicalUtility: "Minimum Mode keeps hardware simple, cheap, and compact for standalone devices. Maximum Mode enables intense scientific computations & scalable hardware expansions."
    },
    {
      parameter: "Bus Control Signals",
      minMode: "CPU-Generated Control",
      minDetails: "Direct lines like M/IO, WR, RD, ALE, DEN, DT/R go from CPU to RAM/IO.",
      maxMode: "8288 Controller-Generated",
      maxDetails: "S0, S1, S2 decoded externally to generate standard memory/IO command lines.",
      practicalUtility: "Minimum Mode minimizes chip-count, reducing hardware bugs and trace lengths. Maximum Mode offloads bus coordination, ensuring reliable memory timings in large computers."
    },
    {
      parameter: "Co-processor Support",
      minMode: "Unsupported",
      minDetails: "No clean hardware protocol exists to attach auxiliary processors.",
      maxMode: "Native Dual-Core Support",
      maxDetails: "Supports Intel 8087 Floating Point Unit & Intel 8089 DMA Co-processor.",
      practicalUtility: "Maximum Mode is essential for complex engineering CAD stations (8087 adds 80-bit float operations) and server I/O tasks."
    },
    {
      parameter: "Bus Arbitration System",
      minMode: "Direct HOLD / HLDA Handshake",
      minDetails: "Single external DMA device can request temporary bus mastership.",
      maxMode: "RQ/GT0, RQ/GT1 Pins",
      maxDetails: "Full bidirectional request/grant lines with priority queuing logic.",
      practicalUtility: "Minimum Mode is perfect for a simple display driver or keyboard DMA. Maximum Mode allows high-performance multi-master operations on standard computer buses (like Multibus)."
    },
    {
      parameter: "Hardware Complexity & Cost",
      minMode: "Extremely Low & Compact",
      minDetails: "Direct wiring between CPU, latches, and buffers. Minimum board layers.",
      maxMode: "High Complexity & Premium Cost",
      maxDetails: "Requires external 8288 Bus Controller, clocks, and extra PCB routing space.",
      practicalUtility: "Minimum Mode drastically reduces Bill of Materials (BOM) cost and assembly complexity for cost-sensitive consumer appliances."
    },
    {
      parameter: "Typical Real-world Use Cases",
      minMode: "Dedicated Controllers",
      minDetails: "Smart calculators, custom instruments, industrial test benches.",
      maxMode: "General-Purpose Computers",
      maxDetails: "Early IBM PC/XT clones, multi-user workstations, telemetry processors.",
      practicalUtility: "Enables distinct market targeting: budget, simple single-purpose devices (Min Mode) vs. powerful multi-purpose workstations (Max Mode)."
    }
  ];

  const renderPinName = (pinName: string) => {
    if (pinName === 'M/IO') {
      return (
        <span className="inline-flex items-center">
          <span>M/</span>
          <span className="overline font-semibold">IO</span>
        </span>
      );
    }
    if (pinName === 'BHE/S7') {
      return (
        <span className="inline-flex items-center">
          <span className="overline font-semibold">BHE</span>
          <span>/S7</span>
        </span>
      );
    }
    if (pinName === 'DT/R') {
      return (
        <span className="inline-flex items-center">
          <span>DT/</span>
          <span className="overline font-semibold">R</span>
        </span>
      );
    }
    if (['RD', 'WR', 'DEN', 'LOCK', 'INTA', 'TEST', 'S0', 'S1', 'S2'].includes(pinName)) {
      return <span className="overline font-semibold">{pinName}</span>;
    }
    if (pinName === 'RQ/GT0') {
      return (
        <span className="inline-flex items-center">
          <span className="overline font-semibold">RQ</span>
          <span>/</span>
          <span className="overline font-semibold">GT0</span>
        </span>
      );
    }
    if (pinName === 'RQ/GT1') {
      return (
        <span className="inline-flex items-center">
          <span className="overline font-semibold">RQ</span>
          <span>/</span>
          <span className="overline font-semibold">GT1</span>
        </span>
      );
    }
    return <span>{pinName}</span>;
  };

  const selectedMode = activeMode !== 'comparison' ? modeData[activeMode] : null;

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-slate-150 bg-slate-50/50 gap-3">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-semibold text-slate-800 font-display">8086 Minimum vs Maximum Operating Modes</span>
        </div>

        {/* Toggle buttons */}
        <div className="inline-flex rounded-lg bg-slate-200/60 p-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveMode('minimum')}
            className={`px-3 py-1.5 text-[13px] font-semibold rounded-md transition-all ${
              activeMode === 'minimum' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Minimum Mode
          </button>
          <button
            onClick={() => setActiveMode('maximum')}
            className={`px-3 py-1.5 text-[13px] font-semibold rounded-md transition-all ${
              activeMode === 'maximum' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Maximum Mode
          </button>
          <button
            onClick={() => setActiveMode('comparison')}
            className={`px-3 py-1.5 text-[13px] font-semibold rounded-md transition-all ${
              activeMode === 'comparison' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Practical Comparison
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeMode === 'comparison' ? (
          <motion.div
            key="comparison-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="flex-1 p-5 overflow-y-auto space-y-4"
          >
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100 flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-[13px] font-bold text-slate-900">Why does the 8086 have two modes?</h4>
                <p className="text-[13px] text-slate-600 leading-relaxed mt-1">
                  Intel designed the 8086 with dual-mode flexibility to serve two separate market needs with a single CPU chip. Pin strap configuration (MN/MX pin) allows the chip to run either as a low-cost standalone controller (Minimum Mode) or as an expandable, high-performance computing workstation with co-processors (Maximum Mode).
                </p>
              </div>
            </div>

            {/* Responsive Table Grid */}
            <div className="border border-slate-150 rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-mono text-[13px] uppercase tracking-wider">
                      <th className="py-3 px-4 font-bold">Parameter / Feature</th>
                      <th className="py-3 px-4 font-bold text-indigo-700">Minimum Mode (Single CPU)</th>
                      <th className="py-3 px-4 font-bold text-purple-700">Maximum Mode (Multi CPU)</th>
                      <th className="py-3 px-4 font-bold text-emerald-800">Practical Utility & Advantage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[13px] text-slate-700">
                    {comparisonRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-800 align-top bg-slate-50/30">
                          {row.parameter}
                        </td>
                        <td className="py-3 px-4 align-top">
                          <span className="font-semibold block text-indigo-600">{row.minMode}</span>
                          <span className="text-[13px] text-slate-500 block mt-0.5 leading-relaxed">{row.minDetails}</span>
                        </td>
                        <td className="py-3 px-4 align-top">
                          <span className="font-semibold block text-purple-600">{row.maxMode}</span>
                          <span className="text-[13px] text-slate-500 block mt-0.5 leading-relaxed">{row.maxDetails}</span>
                        </td>
                        <td className="py-3 px-4 align-top bg-emerald-50/10">
                          <p className="text-[13px] text-slate-600 leading-relaxed font-normal">
                            {row.practicalUtility}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Insight Badge */}
            <div className="bg-amber-50/60 border border-amber-200/50 p-4 rounded-xl flex items-start gap-3">
              <Layers className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <strong className="text-amber-800 text-[13px] font-bold block uppercase tracking-wider font-mono">Real-World Engineering Fact:</strong>
                <p className="text-[13px] text-amber-900 mt-0.5 leading-relaxed">
                  In early systems like the <strong>IBM PC</strong> and <strong>IBM PC/XT</strong>, the 8086/8088 was configured in <strong>Maximum Mode</strong>. This allowed IBM to easily offer socket expansions for the Intel 8087 Math Co-processor. Users who purchased the co-processor saw spreadsheet math and floating point operations run up to 100 times faster!
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="diagram-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="flex-1 p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-y-auto"
          >
            {/* Left: Graphical Circuit Layout Blocks */}
            <div className="lg:col-span-7 bg-slate-50/50 rounded-2xl border border-slate-100 p-5 flex flex-col justify-between min-h-[420px]">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[13px] font-bold text-slate-400 font-mono tracking-wider uppercase">Interactive Signal Routing Layout</span>
                  <span className="text-[13px] text-indigo-600 font-mono">Observe how control lines are wired</span>
                </div>

                <div className="relative border border-slate-200 rounded-xl bg-white p-5 space-y-4 shadow-2xs">
                  {/* CPU block visual */}
                  <div className="flex items-center justify-between">
                    <div className="bg-zinc-900 text-white p-3 rounded-lg border-2 border-zinc-950 font-mono font-bold text-[13px] text-center w-32 shadow-md">
                      <Cpu className="w-5 h-5 mx-auto mb-1 text-zinc-400" />
                      i8086 CPU
                      <span className="block text-[13px] text-zinc-500 font-normal mt-0.5">MN/MX = {activeMode === 'minimum' ? '+5V' : 'GND'}</span>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
                      {/* Routing wires representation */}
                      <div className="w-full h-1 bg-indigo-200 relative">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
                      </div>
                      <span className="text-[13px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100 mt-1">
                        {activeMode === 'minimum' ? 'Direct Control Lines' : 'S0, S1, S2 Status Lines'}
                      </span>
                    </div>

                    {activeMode === 'minimum' ? (
                      <div className="bg-indigo-50 text-indigo-950 p-3 rounded-lg border border-indigo-200 text-[13px] w-36 font-semibold text-center shadow-xs">
                        Peripherals &amp; Memory
                        <span className="block text-[13px] text-slate-500 font-normal mt-1">Responds directly to CPU signals (ALE, RD, WR)</span>
                      </div>
                    ) : (
                      <div className="bg-amber-50 text-amber-950 p-3 rounded-lg border border-amber-200 text-[13px] w-36 font-semibold text-center shadow-xs space-y-1.5">
                        <div className="bg-amber-600 text-white rounded py-0.5 font-mono font-bold text-[13px]">Intel 8288</div>
                        <span>Bus Controller</span>
                        <span className="block text-[13px] text-slate-500 font-normal">Decodes status and generates clean bus controls</span>
                      </div>
                    )}
                  </div>

                  {/* Wire details list */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono text-[13px] space-y-1 text-slate-600">
                    <div className="font-bold text-slate-800 uppercase text-[13px] mb-1">Active Mode Pins on CPU (Pins 24-31)</div>
                    <div className="grid grid-cols-2 gap-1">
                      {selectedMode?.pins.map(pin => (
                        <div key={pin} className="flex items-center gap-1.5 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block"></span>
                          <strong className="text-[13px]">{renderPinName(pin)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Syllabus key point */}
              <div className="bg-indigo-50/40 text-slate-800 p-3.5 rounded-xl border border-indigo-100 flex items-start gap-3 mt-4 text-[13px]">
                <div className="space-y-1">
                  <span className="text-indigo-600 font-bold font-mono text-[13px] uppercase block">B.Tech Exam Corner</span>
                  <p className="text-[13px] text-slate-600 leading-relaxed">
                    In maximum mode, status pins <strong>S0, S1, S2</strong> encode the CPU operation. For instance, <strong>011</strong> indicates Halt, <strong>101</strong> represents Read I/O, and <strong>110</strong> represents Write I/O. The external <strong>8288 Bus Controller</strong> intercepts this encoding to coordinate complex memory timings perfectly!
                  </p>
                </div>
              </div>
            </div>

            {/* Right Detail Cards */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-4 h-full flex flex-col justify-between">
                <div className="space-y-3.5">
                  <div>
                    <h4 className="font-display font-bold text-slate-800 text-base">
                      {selectedMode?.title}
                    </h4>
                    <p className="text-[13px] text-slate-400 mt-0.5">Explore key structural properties below.</p>
                  </div>

                  <div className="border-t border-slate-100 pt-3.5 space-y-3 text-[13px]">
                    <div>
                      <span className="text-[13px] uppercase font-mono text-slate-400 block font-semibold">Bus Controller Requirement</span>
                      <p className="text-slate-600 leading-relaxed mt-0.5">{selectedMode?.controller}</p>
                    </div>

                    <div>
                      <span className="text-[13px] uppercase font-mono text-slate-400 block font-semibold">Co-processor Support</span>
                      <p className="text-slate-600 leading-relaxed mt-0.5">{selectedMode?.multiprocessor}</p>
                    </div>

                    <div>
                      <span className="text-[13px] uppercase font-mono text-slate-400 block font-semibold">Typical Applications & Use Cases</span>
                      <p className="text-slate-600 leading-relaxed mt-0.5">{selectedMode?.useCase}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Summary comparison stats */}
                <div className="bg-indigo-50/60 p-3 rounded-lg border border-indigo-100/50 text-[13px] text-indigo-950 space-y-1">
                  <span className="font-mono font-bold text-indigo-700 uppercase tracking-wide block text-[13px]">Comparative Summary</span>
                  <div className="flex justify-between">
                    <span className="text-slate-500">System Complexity:</span>
                    <span className="font-semibold text-slate-800">{activeMode === 'minimum' ? 'Low (Minimalist)' : 'High (Complex)'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Board Space:</span>
                    <span className="font-semibold text-slate-800">{activeMode === 'minimum' ? 'Saves Space' : 'Requires More Components'}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
