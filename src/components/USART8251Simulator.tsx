import React, { useState } from 'react';
import { Cpu, Zap, Activity, CheckCircle2, ArrowRight } from 'lucide-react';

export default function USART8251Simulator() {
  const [activeTab, setActiveTab] = useState<'mode' | 'frame'>('mode');

  // Mode Instruction Register State
  const [baudFactor, setBaudFactor] = useState<number>(16); // 1, 16, 64
  const [charLength, setCharLength] = useState<number>(8); // 5, 6, 7, 8
  const [parityEnable, setParityEnable] = useState<boolean>(false);
  const [parityType, setParityType] = useState<'even' | 'odd'>('even');
  const [stopBits, setStopBits] = useState<number>(1); // 1, 1.5, 2

  // Character Framing State
  const [txChar, setTxChar] = useState<string>('A');

  // Compute Mode Instruction Control Byte
  // D1,D0 = Baud Factor (01=x1, 10=x16, 11=x64)
  // D3,D2 = Char Length (00=5bit, 01=6bit, 10=7bit, 11=8bit)
  // D4 = Parity Enable (1=Enable, 0=Disable)
  // D5 = Parity Type (1=Even, 0=Odd)
  // D7,D6 = Stop Bits (01=1bit, 10=1.5bits, 11=2bits)
  let d1d0 = 2; // x16
  if (baudFactor === 1) d1d0 = 1;
  if (baudFactor === 64) d1d0 = 3;

  let d3d2 = 3; // 8 bits
  if (charLength === 5) d3d2 = 0;
  if (charLength === 6) d3d2 = 1;
  if (charLength === 7) d3d2 = 2;

  const d4 = parityEnable ? 1 : 0;
  const d5 = parityType === 'even' ? 1 : 0;

  let d7d6 = 1; // 1 stop bit
  if (stopBits === 1.5) d7d6 = 2;
  if (stopBits === 2) d7d6 = 3;

  const modeByte = (d7d6 << 6) | (d5 << 5) | (d4 << 4) | (d3d2 << 2) | d1d0;
  const modeHex = modeByte.toString(16).toUpperCase().padStart(2, '0') + 'H';

  // Compute Character Framing Bits
  const charCode = (txChar || 'A').charCodeAt(0);
  const charBits = Array.from({ length: charLength }, (_, i) => (charCode >> i) & 1);

  return (
    <div className="bg-white text-slate-800 p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs font-sans">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-200 text-indigo-600">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Intel 8251 Universal Synchronous/Asynchronous Receiver Transmitter (USART)</h3>
            <p className="text-[11px] text-slate-500">Mode Word Configuration &amp; Serial Asynchronous Frame Bit Stream</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
          <button
            onClick={() => setActiveTab('mode')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'mode' ? 'bg-white text-indigo-700 shadow-xs font-bold border border-slate-200/80' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mode Instruction Register
          </button>
          <button
            onClick={() => setActiveTab('frame')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'frame' ? 'bg-white text-indigo-700 shadow-xs font-bold border border-slate-200/80' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Serial Bit Frame &amp; RS-232
          </button>
        </div>
      </div>

      {/* TAB 1: Mode Instruction Register */}
      {activeTab === 'mode' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Baud & Length */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-bold uppercase tracking-wider">Baud Rate Factor Clock Multiplier</label>
                <div className="grid grid-cols-3 gap-1.5 font-semibold">
                  {[1, 16, 64].map((f) => (
                    <button
                      key={f}
                      onClick={() => setBaudFactor(f)}
                      className={`py-1.5 rounded border cursor-pointer transition-all ${baudFactor === f ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs font-bold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                    >
                      x{f} Clock
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-bold uppercase tracking-wider">Character Length (Bits per Frame)</label>
                <div className="grid grid-cols-4 gap-1.5 font-semibold">
                  {[5, 6, 7, 8].map((len) => (
                    <button
                      key={len}
                      onClick={() => setCharLength(len)}
                      className={`py-1.5 rounded border cursor-pointer transition-all ${charLength === len ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs font-bold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                    >
                      {len} Bits
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Parity & Stop Bits */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-bold uppercase tracking-wider">Parity Configuration</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setParityEnable(!parityEnable)}
                    className={`flex-1 py-1.5 rounded-lg font-semibold border cursor-pointer transition-all ${parityEnable ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    {parityEnable ? 'Parity ENABLED' : 'Parity Disabled'}
                  </button>
                  {parityEnable && (
                    <button
                      onClick={() => setParityType(parityType === 'even' ? 'odd' : 'even')}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold border border-indigo-600 shadow-2xs cursor-pointer"
                    >
                      {parityType.toUpperCase()}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-bold uppercase tracking-wider">Stop Bit Count</label>
                <div className="grid grid-cols-3 gap-1.5 font-semibold">
                  {[1, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStopBits(s)}
                      className={`py-1.5 rounded border cursor-pointer transition-all ${stopBits === s ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs font-bold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                    >
                      {s} Stop Bit{s > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mode Word Hex Output */}
          <div className="bg-slate-50 p-3 rounded-xl border border-indigo-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div>
              <span className="text-[10px] text-indigo-950 uppercase font-bold tracking-wider block">Calculated 8251 Mode Instruction Word</span>
              <div className="font-mono text-xs text-slate-700 mt-0.5">
                Binary: <strong className="text-slate-900 font-bold">{modeByte.toString(2).padStart(8, '0')}</strong>
              </div>
            </div>
            <div className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg font-mono font-extrabold text-sm border border-indigo-600 shadow-xs">
              Mode Control Byte: {modeHex}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Serial Bit Frame & RS-232 */}
      {activeTab === 'frame' && (
        <div className="space-y-3">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-950 text-xs uppercase tracking-wider">Asynchronous Character Framing Visualizer</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-600 text-[10px] font-bold">Enter Character:</span>
                <input
                  type="text"
                  maxLength={1}
                  value={txChar}
                  onChange={(e) => setTxChar(e.target.value.toUpperCase())}
                  className="bg-white border border-slate-300 text-indigo-900 font-mono text-center font-bold text-sm w-12 py-1 rounded-lg shadow-2xs focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Serial Frame Stream */}
            <div className="flex items-center gap-1.5 overflow-x-auto p-3 bg-white rounded-xl border border-slate-200 font-mono shadow-2xs">
              {/* Start Bit */}
              <div className="px-3 py-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-center shrink-0">
                <div className="text-[9px] text-rose-500 font-bold uppercase">START</div>
                <div className="font-bold text-xs">0</div>
              </div>

              {/* Data Bits */}
              {charBits.map((b, idx) => (
                <div key={idx} className="px-3 py-2 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-lg text-center shrink-0">
                  <div className="text-[9px] text-indigo-500 font-bold uppercase">D{idx}</div>
                  <div className="font-bold text-xs">{b}</div>
                </div>
              ))}

              {/* Stop Bit */}
              <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-center shrink-0">
                <div className="text-[9px] text-emerald-500 font-bold uppercase">STOP</div>
                <div className="font-bold text-xs">1</div>
              </div>
            </div>

            {/* MAX232 Level Shifting Info */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between text-[11px] font-sans shadow-2xs">
              <div className="text-slate-700 leading-relaxed">
                <strong className="text-amber-800 font-bold">MAX232 Voltage Shifting: </strong>
                TTL 0V / +5V is converted to RS-232 bipolar levels (<strong className="text-slate-900">-12V</strong> for Mark 1, <strong className="text-slate-900">+12V</strong> for Space 0).
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
