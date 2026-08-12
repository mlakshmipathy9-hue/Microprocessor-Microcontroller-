import React, { useState } from 'react';
import { Cpu, Sliders, CheckCircle2, Zap, ArrowRight, ToggleLeft, ToggleRight, Settings } from 'lucide-react';

export default function PPI8255Simulator() {
  const [activeTab, setActiveTab] = useState<'iomode' | 'bsr' | 'pins'>('iomode');

  // I/O Mode Config state
  const [groupAMode, setGroupAMode] = useState<'mode0' | 'mode1' | 'mode2'>('mode0');
  const [portADir, setPortADir] = useState<'input' | 'output'>('output');
  const [portCUpperDir, setPortCUpperDir] = useState<'input' | 'output'>('output');

  const [groupBMode, setGroupBMode] = useState<'mode0' | 'mode1'>('mode0');
  const [portBDir, setPortBDir] = useState<'input' | 'output'>('output');
  const [portCLowerDir, setPortCLowerDir] = useState<'input' | 'output'>('output');

  // BSR Mode state
  const [bsrBit, setBsrBit] = useState<number>(0); // 0 to 7
  const [bsrSetReset, setBsrSetReset] = useState<number>(1); // 1 = Set, 0 = Reset

  // Interactive Port Data Values
  const [portAVal, setPortAVal] = useState<number>(0xAA);
  const [portBVal, setPortBVal] = useState<number>(0x55);
  const [portCVal, setPortCVal] = useState<number>(0x0F);

  // Compute 8255 I/O Control Word Byte
  // D7 = 1 (I/O Mode)
  // D6,D5 = Group A Mode (00=Mode0, 01=Mode1, 1X=Mode2)
  // D4 = Port A Dir (1=In, 0=Out)
  // D3 = Port C Upper Dir (1=In, 0=Out)
  // D2 = Group B Mode (0=Mode0, 1=Mode1)
  // D1 = Port B Dir (1=In, 0=Out)
  // D0 = Port C Lower Dir (1=In, 0=Out)
  let d6d5 = 0;
  if (groupAMode === 'mode1') d6d5 = 1;
  if (groupAMode === 'mode2') d6d5 = 2; // 10 binary

  const d4 = portADir === 'input' ? 1 : 0;
  const d3 = portCUpperDir === 'input' ? 1 : 0;
  const d2 = groupBMode === 'mode1' ? 1 : 0;
  const d1 = portBDir === 'input' ? 1 : 0;
  const d0 = portCLowerDir === 'input' ? 1 : 0;

  const controlWordByte = (1 << 7) | (d6d5 << 5) | (d4 << 4) | (d3 << 3) | (d2 << 2) | (d1 << 1) | d0;
  const controlWordHex = controlWordByte.toString(16).toUpperCase().padStart(2, '0') + 'H';

  // Compute BSR Control Word Byte
  // D7 = 0 (BSR Mode)
  // D6,D5,D4 = 000
  // D3,D2,D1 = Bit Select (000 to 111)
  // D0 = Set/Reset (1=Set, 0=Reset)
  const bsrControlWordByte = (bsrBit << 1) | bsrSetReset;
  const bsrControlWordHex = bsrControlWordByte.toString(16).toUpperCase().padStart(2, '0') + 'H';

  const handleApplyBSR = () => {
    let newPortC = portCVal;
    if (bsrSetReset === 1) {
      newPortC |= (1 << bsrBit);
    } else {
      newPortC &= ~(1 << bsrBit);
    }
    setPortCVal(newPortC);
  };

  return (
    <div className="bg-slate-900 text-slate-100 p-4 md:p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4 text-xs font-sans">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600/20 rounded-xl border border-indigo-500/30 text-indigo-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Intel 8255 Programmable Peripheral Interface (PPI)</h3>
            <p className="text-[11px] text-slate-400">24 Programmable I/O Lines (Ports A, B, C) & Control Word Architecture</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 gap-1">
          <button
            onClick={() => setActiveTab('iomode')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'iomode' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            I/O Control Word
          </button>
          <button
            onClick={() => setActiveTab('bsr')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'bsr' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            BSR Mode (Port C)
          </button>
          <button
            onClick={() => setActiveTab('pins')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'pins' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Pin Monitor
          </button>
        </div>
      </div>

      {/* TAB 1: I/O Mode Set Control Word */}
      {activeTab === 'iomode' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Group A Control */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2.5">
              <span className="font-bold text-indigo-400 text-xs uppercase tracking-wider block border-b border-slate-800 pb-1">
                Group A (Port A &amp; Port C Upper)
              </span>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Group A Operating Mode</label>
                <div className="grid grid-cols-3 gap-1.5 font-semibold">
                  <button
                    onClick={() => setGroupAMode('mode0')}
                    className={`py-1 rounded border ${groupAMode === 'mode0' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    Mode 0 (Basic)
                  </button>
                  <button
                    onClick={() => setGroupAMode('mode1')}
                    className={`py-1 rounded border ${groupAMode === 'mode1' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    Mode 1 (Strobed)
                  </button>
                  <button
                    onClick={() => setGroupAMode('mode2')}
                    className={`py-1 rounded border ${groupAMode === 'mode2' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    Mode 2 (Bi-dir)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Port A Direction</label>
                  <button
                    onClick={() => setPortADir(portADir === 'input' ? 'output' : 'input')}
                    className={`w-full py-1 rounded font-bold border ${portADir === 'input' ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300' : 'bg-amber-950/60 border-amber-500 text-amber-300'}`}
                  >
                    {portADir === 'input' ? 'INPUT (1)' : 'OUTPUT (0)'}
                  </button>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Port C Upper Direction</label>
                  <button
                    onClick={() => setPortCUpperDir(portCUpperDir === 'input' ? 'output' : 'input')}
                    className={`w-full py-1 rounded font-bold border ${portCUpperDir === 'input' ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300' : 'bg-amber-950/60 border-amber-500 text-amber-300'}`}
                  >
                    {portCUpperDir === 'input' ? 'INPUT (1)' : 'OUTPUT (0)'}
                  </button>
                </div>
              </div>
            </div>

            {/* Group B Control */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2.5">
              <span className="font-bold text-indigo-400 text-xs uppercase tracking-wider block border-b border-slate-800 pb-1">
                Group B (Port B &amp; Port C Lower)
              </span>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Group B Operating Mode</label>
                <div className="grid grid-cols-2 gap-1.5 font-semibold">
                  <button
                    onClick={() => setGroupBMode('mode0')}
                    className={`py-1 rounded border ${groupBMode === 'mode0' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    Mode 0 (Basic I/O)
                  </button>
                  <button
                    onClick={() => setGroupBMode('mode1')}
                    className={`py-1 rounded border ${groupBMode === 'mode1' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    Mode 1 (Strobed I/O)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Port B Direction</label>
                  <button
                    onClick={() => setPortBDir(portBDir === 'input' ? 'output' : 'input')}
                    className={`w-full py-1 rounded font-bold border ${portBDir === 'input' ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300' : 'bg-amber-950/60 border-amber-500 text-amber-300'}`}
                  >
                    {portBDir === 'input' ? 'INPUT (1)' : 'OUTPUT (0)'}
                  </button>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Port C Lower Direction</label>
                  <button
                    onClick={() => setPortCLowerDir(portCLowerDir === 'input' ? 'output' : 'input')}
                    className={`w-full py-1 rounded font-bold border ${portCLowerDir === 'input' ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300' : 'bg-amber-950/60 border-amber-500 text-amber-300'}`}
                  >
                    {portCLowerDir === 'input' ? 'INPUT (1)' : 'OUTPUT (0)'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Generated Control Byte Display */}
          <div className="bg-slate-950 p-3 rounded-xl border border-indigo-800/60 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider block">Generated 8255 Control Word</span>
              <div className="font-mono text-xs text-slate-300 mt-0.5">
                Binary: <strong className="text-white">{controlWordByte.toString(2).padStart(8, '0')}</strong>
              </div>
            </div>
            <div className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg font-mono font-extrabold text-sm border border-indigo-400 shadow-md">
              Control Byte: {controlWordHex}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BSR Mode */}
      {activeTab === 'bsr' && (
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-indigo-300 text-xs uppercase tracking-wider">Bit Set / Reset (BSR) Mode for Port C</span>
            <span className="text-[10px] text-slate-400 font-mono">D7 = 0 (BSR Control Word)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Select Port C Bit Pin (PC0–PC7)</label>
              <div className="grid grid-cols-4 gap-1">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((b) => (
                  <button
                    key={b}
                    onClick={() => setBsrBit(b)}
                    className={`py-1 rounded font-mono font-bold border cursor-pointer ${bsrBit === b ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    PC{b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Operation Action</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setBsrSetReset(1)}
                  className={`flex-1 py-1.5 rounded font-bold border cursor-pointer ${bsrSetReset === 1 ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                >
                  SET (1)
                </button>
                <button
                  onClick={() => setBsrSetReset(0)}
                  className={`flex-1 py-1.5 rounded font-bold border cursor-pointer ${bsrSetReset === 0 ? 'bg-rose-600 border-rose-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                >
                  RESET (0)
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
            <div className="font-mono text-xs">
              BSR Control Word: <strong className="text-indigo-300">{bsrControlWordHex}</strong>
            </div>
            <button
              onClick={handleApplyBSR}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg font-bold text-xs cursor-pointer transition-all"
            >
              Execute BSR Action on PC{bsrBit}
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: Live Pin Monitor */}
      {activeTab === 'pins' && (
        <div className="space-y-3">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <div className="font-bold text-indigo-300 text-xs uppercase tracking-wider">8255 Port Register Pin States</div>

            {/* Port A */}
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <strong className="text-emerald-400">Port A (PA0–PA7)</strong>
                <span className="font-mono text-slate-400">0x{portAVal.toString(16).toUpperCase().padStart(2, '0')}</span>
              </div>
              <div className="grid grid-cols-8 gap-1 font-mono text-center">
                {Array.from({ length: 8 }, (_, i) => {
                  const bit = (portAVal >> (7 - i)) & 1;
                  return (
                    <button
                      key={i}
                      onClick={() => setPortAVal(portAVal ^ (1 << (7 - i)))}
                      className={`py-1 rounded font-bold text-[10px] cursor-pointer ${bit ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}
                    >
                      PA{7 - i}: {bit}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Port B */}
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <strong className="text-indigo-400">Port B (PB0–PB7)</strong>
                <span className="font-mono text-slate-400">0x{portBVal.toString(16).toUpperCase().padStart(2, '0')}</span>
              </div>
              <div className="grid grid-cols-8 gap-1 font-mono text-center">
                {Array.from({ length: 8 }, (_, i) => {
                  const bit = (portBVal >> (7 - i)) & 1;
                  return (
                    <button
                      key={i}
                      onClick={() => setPortBVal(portBVal ^ (1 << (7 - i)))}
                      className={`py-1 rounded font-bold text-[10px] cursor-pointer ${bit ? 'bg-indigo-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}
                    >
                      PB{7 - i}: {bit}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Port C */}
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <strong className="text-amber-400">Port C (PC0–PC7)</strong>
                <span className="font-mono text-slate-400">0x{portCVal.toString(16).toUpperCase().padStart(2, '0')}</span>
              </div>
              <div className="grid grid-cols-8 gap-1 font-mono text-center">
                {Array.from({ length: 8 }, (_, i) => {
                  const bit = (portCVal >> (7 - i)) & 1;
                  return (
                    <button
                      key={i}
                      onClick={() => setPortCVal(portCVal ^ (1 << (7 - i)))}
                      className={`py-1 rounded font-bold text-[10px] cursor-pointer ${bit ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}
                    >
                      PC{7 - i}: {bit}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
