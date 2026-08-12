import React, { useState } from 'react';
import { Cpu, Zap, ShieldAlert, CheckCircle2, Play, RefreshCw, Sliders } from 'lucide-react';

export default function Interrupt8259Simulator() {
  const [activeTab, setActiveTab] = useState<'pic' | 'icw' | 'ivt'>('pic');

  // 8259 PIC State
  const [irrBits, setIrrBits] = useState<number>(0x05); // IR0 and IR2 active
  const [imrBits, setImrBits] = useState<number>(0x00); // No masks
  const [isrBits, setIsrBits] = useState<number>(0x00); // In service
  const [baseVector, setBaseVector] = useState<number>(0x08); // ICW2 default base vector 08H

  // Unmasked requests = IRR AND (NOT IMR)
  const unmaskedRequests = irrBits & (~imrBits & 0xFF);

  // Highest priority unmasked bit (0 highest, 7 lowest)
  let activeIrq = -1;
  for (let i = 0; i < 8; i++) {
    if (((unmaskedRequests >> i) & 1) === 1) {
      activeIrq = i;
      break;
    }
  }

  const activeVector = activeIrq !== -1 ? (baseVector + activeIrq) : -1;
  const ivtPhysicalAddress = activeVector !== -1 ? (activeVector * 4) : -1;
  const ivtHex = ivtPhysicalAddress !== -1 ? ivtPhysicalAddress.toString(16).toUpperCase().padStart(5, '0') + 'H' : 'N/A';

  const handleAcknowledgeInterrupt = () => {
    if (activeIrq !== -1) {
      // Clear IRR bit and set ISR bit
      setIrrBits((prev) => prev & ~(1 << activeIrq));
      setIsrBits((prev) => prev | (1 << activeIrq));
    }
  };

  const handleSendEOI = () => {
    // Clear lowest set bit in ISR
    for (let i = 0; i < 8; i++) {
      if (((isrBits >> i) & 1) === 1) {
        setIsrBits((prev) => prev & ~(1 << i));
        break;
      }
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 p-4 md:p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4 text-xs font-sans">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600/20 rounded-xl border border-indigo-500/30 text-indigo-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Intel 8259 Programmable Interrupt Controller (PIC)</h3>
            <p className="text-[11px] text-slate-400">IRR, ISR, IMR Register Vectors &amp; Priority Resolver</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 gap-1">
          <button
            onClick={() => setActiveTab('pic')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'pic' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            PIC Registers &amp; Vectors
          </button>
          <button
            onClick={() => setActiveTab('icw')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'icw' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            ICW &amp; OCW Commands
          </button>
        </div>
      </div>

      {/* TAB 1: PIC Registers & Priority Resolver */}
      {activeTab === 'pic' && (
        <div className="space-y-3">
          {/* IR0 to IR7 Pin Toggles */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <span className="font-bold text-indigo-300 text-xs uppercase tracking-wider block">
              1. Hardware Interrupt Request Pins (IR0 to IR7) - Click to Assert Request
            </span>
            <div className="grid grid-cols-8 gap-1.5 font-mono text-center">
              {Array.from({ length: 8 }, (_, i) => {
                const isRequested = ((irrBits >> i) & 1) === 1;
                const isMasked = ((imrBits >> i) & 1) === 1;
                const isInService = ((isrBits >> i) & 1) === 1;
                const isSelected = activeIrq === i;

                return (
                  <button
                    key={i}
                    onClick={() => setIrrBits(irrBits ^ (1 << i))}
                    className={`p-2 rounded-lg border flex flex-col items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-lg scale-105'
                        : isRequested
                        ? 'bg-amber-500/30 border-amber-500 text-amber-200'
                        : isInService
                        ? 'bg-indigo-900/60 border-indigo-500 text-indigo-200'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span className="text-[10px] font-bold">IR{i}</span>
                    <span className="text-[9px] mt-1">
                      {isSelected ? 'ACTIVE' : isRequested ? 'REQ' : isInService ? 'SERVICING' : 'Idle'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Internal Registers View */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* IRR */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-amber-400 font-bold text-[10px] uppercase tracking-wider block">IRR (Request Register)</span>
              <p className="text-[10px] text-slate-400">Holds incoming pending requests.</p>
              <div className="font-mono text-xs text-white font-bold bg-slate-900 p-1.5 rounded text-center">
                0x{irrBits.toString(16).toUpperCase().padStart(2, '0')} (B: {irrBits.toString(2).padStart(8, '0')})
              </div>
            </div>

            {/* IMR */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-rose-400 font-bold text-[10px] uppercase tracking-wider block">IMR (Mask Register)</span>
              <p className="text-[10px] text-slate-400">1 = Masked/Disabled bit.</p>
              <div className="font-mono text-xs text-white font-bold bg-slate-900 p-1.5 rounded text-center">
                0x{imrBits.toString(16).toUpperCase().padStart(2, '0')} (B: {imrBits.toString(2).padStart(8, '0')})
              </div>
            </div>

            {/* ISR */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-indigo-400 font-bold text-[10px] uppercase tracking-wider block">ISR (In-Service Register)</span>
              <p className="text-[10px] text-slate-400">Holds currently executing ISRs.</p>
              <div className="font-mono text-xs text-white font-bold bg-slate-900 p-1.5 rounded text-center">
                0x{isrBits.toString(16).toUpperCase().padStart(2, '0')} (B: {isrBits.toString(2).padStart(8, '0')})
              </div>
            </div>
          </div>

          {/* Active Vector Resolution */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-indigo-800/60 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block">Priority Resolver Output</span>
              {activeIrq !== -1 ? (
                <div className="text-slate-200 font-mono text-xs mt-0.5">
                  Winning Request: <strong className="text-emerald-400">IR{activeIrq}</strong> | INT Vector Type: <strong className="text-indigo-300">0x{activeVector.toString(16).toUpperCase().padStart(2, '0')}H</strong> | IVT Target Addr: <strong className="text-white">{ivtHex}</strong>
                </div>
              ) : (
                <div className="text-slate-400 text-xs mt-0.5">No unmasked interrupt request currently pending.</div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAcknowledgeInterrupt}
                disabled={activeIrq === -1}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all"
              >
                Acknowledge (INTA Pulse)
              </button>
              <button
                onClick={handleSendEOI}
                disabled={isrBits === 0}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all"
              >
                Send EOI Command
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ICW & OCW Commands */}
      {activeTab === 'icw' && (
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
          <div className="font-bold text-indigo-300 text-xs uppercase tracking-wider border-b border-slate-800 pb-1">
            8259 Command Words Configuration
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1.5">
              <strong className="text-amber-400 text-xs block">ICW1 &amp; ICW2 (Initialization Words)</strong>
              <p className="text-[11px] text-slate-300">
                ICW1 selects single or cascaded mode and trigger mode (Edge vs Level). ICW2 defines base interrupt vector offset (e.g. 08H mapped to IR0–IR7).
              </p>
            </div>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1.5">
              <strong className="text-emerald-400 text-xs block">OCW1 &amp; OCW2 (Operation Words)</strong>
              <p className="text-[11px] text-slate-300">
                OCW1 updates IMR mask bits on-the-fly. OCW2 issues End of Interrupt (EOI) or rotates priority among IR lines.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
