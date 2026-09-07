import React, { useState } from 'react';
import { 
  Inbox, 
  Settings, 
  Binary, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Sliders, 
  Cpu, 
  Sparkles,
  Info
} from 'lucide-react';

interface RegisterInfo {
  id: 'A' | 'B' | 'C' | 'CWR';
  name: string;
  shortName: string;
  a1: 0 | 1;
  a0: 0 | 1;
  binaryAddr: string;
  type: 'Data Register' | 'Control Register';
  size: string;
  access: 'Read / Write (R/W)' | 'Write-Only';
  pins: string;
  analogy: string;
  analogyEmoji: string;
  simpleExplanation: string;
  keyPoints: string[];
  themeColor: {
    bg: string;
    border: string;
    text: string;
    badge: string;
    accent: string;
    activeBorder: string;
  };
}

const REGISTERS: RegisterInfo[] = [
  {
    id: 'A',
    name: 'Port A Data Register',
    shortName: 'Port A',
    a1: 0,
    a0: 0,
    binaryAddr: '00',
    type: 'Data Register',
    size: '8-bit',
    access: 'Read / Write (R/W)',
    pins: 'PA0 – PA7 (Pins 1–4, 37–40)',
    analogy: 'Mailbox for Device A',
    analogyEmoji: '📮',
    simpleExplanation: 'Stores 8 bits of data going to or coming from an external peripheral connected to Port A (such as an ADC, LED display, or DAC).',
    keyPoints: [
      'Has both an 8-bit input latch and 8-bit output latch',
      'Supports Mode 0 (Basic), Mode 1 (Strobed), and Mode 2 (Bi-directional bus)',
      'Directly accessed with address inputs A1 = 0, A0 = 0'
    ],
    themeColor: {
      bg: 'bg-emerald-50/70',
      border: 'border-emerald-200',
      text: 'text-emerald-950',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      accent: 'emerald',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-300'
    }
  },
  {
    id: 'B',
    name: 'Port B Data Register',
    shortName: 'Port B',
    a1: 0,
    a0: 1,
    binaryAddr: '01',
    type: 'Data Register',
    size: '8-bit',
    access: 'Read / Write (R/W)',
    pins: 'PB0 – PB7 (Pins 18–25)',
    analogy: 'Mailbox for Device B',
    analogyEmoji: '📮',
    simpleExplanation: 'Stores 8 bits of data going to or coming from a second peripheral connected to Port B (such as a matrix keypad or sensor array).',
    keyPoints: [
      'Has an 8-bit output latch and 8-bit input buffer',
      'Supports Mode 0 (Basic I/O) and Mode 1 (Strobed I/O)',
      'Directly accessed with address inputs A1 = 0, A0 = 1'
    ],
    themeColor: {
      bg: 'bg-indigo-50/70',
      border: 'border-indigo-200',
      text: 'text-indigo-950',
      badge: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      accent: 'indigo',
      activeBorder: 'border-indigo-500 ring-2 ring-indigo-300'
    }
  },
  {
    id: 'C',
    name: 'Port C Data Register',
    shortName: 'Port C',
    a1: 1,
    a0: 0,
    binaryAddr: '10',
    type: 'Data Register',
    size: '8-bit (Split into two 4-bit nibbles)',
    access: 'Read / Write (R/W)',
    pins: 'PC0 – PC7 (Pins 10–17)',
    analogy: 'Mailbox for Control / Two 4-wire boxes',
    analogyEmoji: '📦',
    simpleExplanation: 'Can be used as an 8-bit data port, two separate 4-bit ports (PC Upper & PC Lower), or as individual handshaking and status wires.',
    keyPoints: [
      'Split into Port C Upper (PC4–PC7) and Port C Lower (PC0–PC3)',
      'Provides handshake signals (STB#, IBF, OBF#, ACK#, INTR) in Mode 1 & 2',
      'Any individual bit can be set or cleared using BSR Mode',
      'Directly accessed with address inputs A1 = 1, A0 = 0'
    ],
    themeColor: {
      bg: 'bg-amber-50/70',
      border: 'border-amber-200',
      text: 'text-amber-950',
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
      accent: 'amber',
      activeBorder: 'border-amber-500 ring-2 ring-amber-300'
    }
  },
  {
    id: 'CWR',
    name: 'Control Word Register (CWR)',
    shortName: 'Control Reg',
    a1: 1,
    a0: 1,
    binaryAddr: '11',
    type: 'Control Register',
    size: '8-bit',
    access: 'Write-Only',
    pins: 'Internal Register (Decoded inside 8255)',
    analogy: 'Instruction Manual / Settings Switch',
    analogyEmoji: '⚙️',
    simpleExplanation: 'Holds the rules and operating settings for the whole chip. The CPU writes 1 byte here to choose modes (Mode 0/1/2) and set pin directions.',
    keyPoints: [
      'Write-Only register: The CPU can write to it, but cannot read it back',
      'D7 = 1: Configures I/O Modes (Mode 0, 1, or 2) and Input/Output directions',
      'D7 = 0: Selects BSR Mode to set/reset any individual Port C pin',
      'Directly accessed with address inputs A1 = 1, A0 = 1'
    ],
    themeColor: {
      bg: 'bg-purple-50/70',
      border: 'border-purple-200',
      text: 'text-purple-950',
      badge: 'bg-purple-100 text-purple-800 border-purple-300',
      accent: 'purple',
      activeBorder: 'border-purple-500 ring-2 ring-purple-300'
    }
  }
];

export const PPI8255RegistersOverview: React.FC = () => {
  const [a1, setA1] = useState<0 | 1>(0);
  const [a0, setA0] = useState<0 | 1>(0);

  // Determine which register is selected by A1, A0
  const selectedRegister = REGISTERS.find(r => r.a1 === a1 && r.a0 === a0) || REGISTERS[0];

  const handleSelectReg = (targetA1: 0 | 1, targetA0: 0 | 1) => {
    setA1(targetA1);
    setA0(targetA0);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 font-mono text-xs font-bold uppercase tracking-wider">
                Intel 8255 Architecture
              </span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-medium">
                4 Registers Total
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Internal Registers in Intel 8255 PPI
            </h3>
          </div>

          {/* Quick Summary Badge */}
          <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl p-3 text-center min-w-[200px]">
            <div className="text-[11px] uppercase tracking-wider text-indigo-200 font-semibold">Total Addressable Registers</div>
            <div className="text-2xl font-black text-amber-300 mt-0.5">
              3 Data + 1 Control
            </div>
            <div className="text-[10px] text-slate-300 mt-0.5">= 4 Internal Registers</div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Interactive Address Switcher Bar */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-600" />
                Interactive Address Decoder (Pins A1 &amp; A0)
              </div>
            </div>

            {/* Address Pin Buttons */}
            <div className="flex items-center gap-3 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-700">A1:</span>
                <button
                  onClick={() => setA1(a1 === 1 ? 0 : 1)}
                  className={`px-3 py-1 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                    a1 === 1 
                      ? 'bg-indigo-600 text-white shadow-2xs scale-105' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {a1}
                </button>
              </div>

              <span className="text-slate-300 font-bold">•</span>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-700">A0:</span>
                <button
                  onClick={() => setA0(a0 === 1 ? 0 : 1)}
                  className={`px-3 py-1 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                    a0 === 1 
                      ? 'bg-indigo-600 text-white shadow-2xs scale-105' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {a0}
                </button>
              </div>

              <div className="h-6 w-px bg-slate-200 mx-1" />

              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-500">Decoded:</span>
                <span className="font-mono font-black text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  A1={a1}, A0={a0} ({a1}{a0}₂)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* The 4 Storage Boxes (Cards Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {REGISTERS.map((reg) => {
            const isSelected = reg.id === selectedRegister.id;
            return (
              <div
                key={reg.id}
                onClick={() => handleSelectReg(reg.a1, reg.a0)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected 
                    ? `${reg.themeColor.bg} ${reg.themeColor.activeBorder} shadow-md scale-[1.02]` 
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 shadow-2xs'
                }`}
              >
                {/* Selection Indicator Pill */}
                {isSelected && (
                  <div className="absolute -top-2.5 right-3 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Selected Register
                  </div>
                )}

                <div className="space-y-3">
                  {/* Top Header & Address */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{reg.analogyEmoji}</span>
                      <div>
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Box {reg.id === 'A' ? '1' : reg.id === 'B' ? '2' : reg.id === 'C' ? '3' : '4'}
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 leading-tight">
                          {reg.name}
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Address Badge */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${reg.themeColor.badge}`}>
                      A1={reg.a1}, A0={reg.a0} ({reg.binaryAddr}₂)
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                      {reg.size}
                    </span>
                  </div>

                  {/* Real-Life Analogy Box */}
                  <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/80 space-y-1">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Analogy: {reg.analogy}
                    </div>
                  </div>
                </div>

                {/* Footer Tag */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Access:</span>
                  <span className={`font-bold ${reg.access === 'Write-Only' ? 'text-purple-700' : 'text-emerald-700'}`}>
                    {reg.access}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Register Deep Dive Card */}
        <div className={`p-5 rounded-2xl border transition-all ${selectedRegister.themeColor.bg} ${selectedRegister.themeColor.border} space-y-4`}>
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
            <div className="flex items-center gap-3">
              <span className="text-3xl p-2 bg-white rounded-xl shadow-2xs border border-slate-200">
                {selectedRegister.analogyEmoji}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Detailed Profile • Box {selectedRegister.id === 'A' ? '1' : selectedRegister.id === 'B' ? '2' : selectedRegister.id === 'C' ? '3' : '4'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${selectedRegister.themeColor.badge}`}>
                    A1={selectedRegister.a1}, A0={selectedRegister.a0}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mt-0.5">
                  {selectedRegister.name} ({selectedRegister.type})
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-lg bg-white font-semibold text-slate-700 border border-slate-200 shadow-2xs">
                Pins: <strong className="font-mono text-slate-900">{selectedRegister.pins}</strong>
              </span>
              <span className="px-3 py-1 rounded-lg bg-white font-semibold text-slate-700 border border-slate-200 shadow-2xs">
                Access: <strong className="font-mono text-indigo-700">{selectedRegister.access}</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-4 h-4 text-indigo-600" />
                What this register does:
              </h5>
              <p className="text-xs text-slate-700 leading-relaxed bg-white/70 p-3 rounded-xl border border-slate-200/80">
                {selectedRegister.simpleExplanation}
              </p>
            </div>

            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Key Technical Facts:
              </h5>
              <ul className="space-y-1.5 bg-white/70 p-3 rounded-xl border border-slate-200/80 text-xs text-slate-700">
                {selectedRegister.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Master Comparison Table */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Binary className="w-4 h-4 text-indigo-600" />
              Quick Reference Table: All 4 Registers at a Glance
            </div>
            <span className="text-[11px] text-slate-500">CS# = 0 (Chip Select Enabled)</span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
                  <th className="p-2.5 text-center">A1</th>
                  <th className="p-2.5 text-center">A0</th>
                  <th className="p-2.5">Selected Register</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Read/Write Access</th>
                  <th className="p-2.5">Primary Purpose / Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr 
                  onClick={() => handleSelectReg(0, 0)}
                  className={`cursor-pointer transition-colors ${selectedRegister.id === 'A' ? 'bg-emerald-50/80 font-bold' : 'hover:bg-slate-50'}`}
                >
                  <td className="p-2.5 text-center font-mono font-bold text-emerald-800">0</td>
                  <td className="p-2.5 text-center font-mono font-bold text-emerald-800">0</td>
                  <td className="p-2.5 text-emerald-950 font-bold">Port A Data Register</td>
                  <td className="p-2.5 text-slate-600">Data (8-bit)</td>
                  <td className="p-2.5 text-emerald-700 font-semibold">Read &amp; Write</td>
                  <td className="p-2.5 text-slate-600">Data transfer to/from Port A pins (PA0–PA7).</td>
                </tr>

                <tr 
                  onClick={() => handleSelectReg(0, 1)}
                  className={`cursor-pointer transition-colors ${selectedRegister.id === 'B' ? 'bg-indigo-50/80 font-bold' : 'hover:bg-slate-50'}`}
                >
                  <td className="p-2.5 text-center font-mono font-bold text-indigo-800">0</td>
                  <td className="p-2.5 text-center font-mono font-bold text-indigo-800">1</td>
                  <td className="p-2.5 text-indigo-950 font-bold">Port B Data Register</td>
                  <td className="p-2.5 text-slate-600">Data (8-bit)</td>
                  <td className="p-2.5 text-emerald-700 font-semibold">Read &amp; Write</td>
                  <td className="p-2.5 text-slate-600">Data transfer to/from Port B pins (PB0–PB7).</td>
                </tr>

                <tr 
                  onClick={() => handleSelectReg(1, 0)}
                  className={`cursor-pointer transition-colors ${selectedRegister.id === 'C' ? 'bg-amber-50/80 font-bold' : 'hover:bg-slate-50'}`}
                >
                  <td className="p-2.5 text-center font-mono font-bold text-amber-800">1</td>
                  <td className="p-2.5 text-center font-mono font-bold text-amber-800">0</td>
                  <td className="p-2.5 text-amber-950 font-bold">Port C Data Register</td>
                  <td className="p-2.5 text-slate-600">Data / Handshake (8-bit)</td>
                  <td className="p-2.5 text-emerald-700 font-semibold">Read &amp; Write</td>
                  <td className="p-2.5 text-slate-600">Data transfer, two 4-bit nibbles, or Mode 1/2 handshaking lines.</td>
                </tr>

                <tr 
                  onClick={() => handleSelectReg(1, 1)}
                  className={`cursor-pointer transition-colors ${selectedRegister.id === 'CWR' ? 'bg-purple-50/80 font-bold' : 'hover:bg-slate-50'}`}
                >
                  <td className="p-2.5 text-center font-mono font-bold text-purple-800">1</td>
                  <td className="p-2.5 text-center font-mono font-bold text-purple-800">1</td>
                  <td className="p-2.5 text-purple-950 font-bold">Control Register (CWR)</td>
                  <td className="p-2.5 text-purple-700 font-bold">Configuration</td>
                  <td className="p-2.5 text-purple-700 font-bold">Write-Only</td>
                  <td className="p-2.5 text-slate-600">Configures operating mode (Mode 0, 1, 2) or BSR single-bit control.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Takeaway Callout */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900 shadow-2xs">
          <span className="text-xl">💡</span>
          <div>
            <strong className="font-bold text-amber-950">Simple Rule to Remember:</strong>
            <p className="mt-0.5 leading-relaxed text-amber-900/90">
              There are only <strong>4 registers</strong> in the 8255. 
              Three of them (Port A, B, C) are <strong>data mailboxes</strong> for external wires. 
              The fourth one (Control Register) is the <strong>settings switch</strong> where the CPU tells the chip how to behave.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PPI8255RegistersOverview;
