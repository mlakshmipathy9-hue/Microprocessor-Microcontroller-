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
    <div className="bg-white text-slate-800 p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs font-sans">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-200 text-indigo-600">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Intel 8259 Programmable Interrupt Controller (PIC)</h3>
            <p className="text-[11px] text-slate-500">IRR, ISR, IMR Register Vectors &amp; Priority Resolver</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
          <button
            onClick={() => setActiveTab('pic')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'pic' ? 'bg-white text-indigo-700 shadow-xs font-bold border border-slate-200/80' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            PIC Registers &amp; Vectors
          </button>
          <button
            onClick={() => setActiveTab('icw')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'icw' ? 'bg-white text-indigo-700 shadow-xs font-bold border border-slate-200/80' : 'text-slate-600 hover:text-slate-900'
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
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-indigo-950 text-xs uppercase tracking-wider block">
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
                        ? 'bg-emerald-600 text-white border-emerald-600 font-extrabold shadow-sm scale-105'
                        : isRequested
                        ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                        : isInService
                        ? 'bg-indigo-100 border-indigo-300 text-indigo-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
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
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <span className="text-amber-800 font-bold text-[10px] uppercase tracking-wider block">IRR (Request Register)</span>
              <p className="text-[10px] text-slate-500">Holds incoming pending requests.</p>
              <div className="font-mono text-xs text-slate-900 font-bold bg-white border border-slate-200 p-1.5 rounded text-center shadow-2xs">
                0x{irrBits.toString(16).toUpperCase().padStart(2, '0')} (B: {irrBits.toString(2).padStart(8, '0')})
              </div>
            </div>

            {/* IMR */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <span className="text-rose-800 font-bold text-[10px] uppercase tracking-wider block">IMR (Mask Register)</span>
              <p className="text-[10px] text-slate-500">1 = Masked/Disabled bit.</p>
              <div className="font-mono text-xs text-slate-900 font-bold bg-white border border-slate-200 p-1.5 rounded text-center shadow-2xs">
                0x{imrBits.toString(16).toUpperCase().padStart(2, '0')} (B: {imrBits.toString(2).padStart(8, '0')})
              </div>
            </div>

            {/* ISR */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <span className="text-indigo-900 font-bold text-[10px] uppercase tracking-wider block">ISR (In-Service Register)</span>
              <p className="text-[10px] text-slate-500">Holds currently executing ISRs.</p>
              <div className="font-mono text-xs text-slate-900 font-bold bg-white border border-slate-200 p-1.5 rounded text-center shadow-2xs">
                0x{isrBits.toString(16).toUpperCase().padStart(2, '0')} (B: {isrBits.toString(2).padStart(8, '0')})
              </div>
            </div>
          </div>

          {/* Active Vector Resolution */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-indigo-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div>
              <span className="text-[10px] text-indigo-950 font-bold uppercase tracking-wider block">Priority Resolver Output</span>
              {activeIrq !== -1 ? (
                <div className="text-slate-700 font-mono text-xs mt-0.5">
                  Winning Request: <strong className="text-emerald-700 font-bold">IR{activeIrq}</strong> | INT Vector Type: <strong className="text-indigo-700 font-bold">0x{activeVector.toString(16).toUpperCase().padStart(2, '0')}H</strong> | IVT Target Addr: <strong className="text-slate-900 font-bold">{ivtHex}</strong>
                </div>
              ) : (
                <div className="text-slate-500 text-xs mt-0.5">No unmasked interrupt request currently pending.</div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAcknowledgeInterrupt}
                disabled={activeIrq === -1}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white px-3.5 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all shadow-xs"
              >
                Acknowledge (INTA Pulse)
              </button>
              <button
                onClick={handleSendEOI}
                disabled={isrBits === 0}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white px-3.5 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all shadow-xs"
              >
                Send EOI Command
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ICW & OCW Commands */}
      {activeTab === 'icw' && (
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
          <div className="font-bold text-indigo-950 text-xs uppercase tracking-wider border-b border-slate-200 pb-1">
            8259 Command Words Configuration
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-1.5 shadow-2xs">
              <strong className="text-amber-800 text-xs block font-bold">ICW1 &amp; ICW2 (Initialization Words)</strong>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                ICW1 selects single or cascaded mode and trigger mode (Edge vs Level). ICW2 defines base interrupt vector offset (e.g. 08H mapped to IR0–IR7).
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-1.5 shadow-2xs">
              <strong className="text-emerald-800 text-xs block font-bold">OCW1 &amp; OCW2 (Operation Words)</strong>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                OCW1 updates IMR mask bits on-the-fly. OCW2 issues End of Interrupt (EOI) or rotates priority among IR lines.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
