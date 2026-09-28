import React, { useState } from 'react';
import {
  Layers,
  Database,
  Cpu,
  Zap,
  ArrowRight,
  ShieldCheck,
  Code2,
  HelpCircle,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Split,
  Binary
} from 'lucide-react';

interface ROMVector {
  address: string;
  name: string;
  type: 'reset' | 'interrupt' | 'user' | 'external';
  description: string;
  codeSnippet: string;
  bytes: number;
}

const romVectors: ROMVector[] = [
  {
    address: '0000H',
    name: 'Reset Vector',
    type: 'reset',
    description: 'When 8051 is powered on or RST pin goes HIGH for >= 2 machine cycles, PC is initialized to 0000H. Standard code places an LJMP here to branch over the interrupt vector table.',
    codeSnippet: 'ORG 0000H\nLJMP MAIN       ; Jump past vector table to main code',
    bytes: 3
  },
  {
    address: '0003H',
    name: 'External Interrupt 0 (INT0)',
    type: 'interrupt',
    description: 'Triggered when Pin 3.2 (P3.2/INT0) senses a LOW level or falling edge (configured via IT0 bit in TCON). Vector location is 0003H.',
    codeSnippet: 'ORG 0003H\nLJMP ISR_EXT0   ; Jump to External Interrupt 0 service routine',
    bytes: 8
  },
  {
    address: '000BH',
    name: 'Timer 0 Overflow (TF0)',
    type: 'interrupt',
    description: 'Triggered when Timer 0 rolls over from FFH to 00H (Mode 2) or FFFFH to 0000H (Mode 1), setting the TF0 flag in TCON. Vector is 000BH.',
    codeSnippet: 'ORG 000BH\nLJMP ISR_TIMER0 ; Jump to Timer 0 ISR',
    bytes: 8
  },
  {
    address: '0013H',
    name: 'External Interrupt 1 (INT1)',
    type: 'interrupt',
    description: 'Triggered by external input on Pin 3.3 (P3.3/INT1) based on IT1 flag configuration in TCON. Vector location is 0013H.',
    codeSnippet: 'ORG 0013H\nLJMP ISR_EXT1   ; Jump to External Interrupt 1 service routine',
    bytes: 8
  },
  {
    address: '001BH',
    name: 'Timer 1 Overflow (TF1)',
    type: 'interrupt',
    description: 'Triggered when Timer 1 counter overflows, setting TF1 in TCON. Vector location is 001BH.',
    codeSnippet: 'ORG 001BH\nLJMP ISR_TIMER1 ; Jump to Timer 1 ISR',
    bytes: 8
  },
  {
    address: '0023H',
    name: 'Serial Port UART (RI / TI)',
    type: 'interrupt',
    description: 'Triggered on receive buffer full (RI = 1) or transmit buffer empty (TI = 1). Vector location is 0023H. ISR must check RI/TI and clear them in software.',
    codeSnippet: 'ORG 0023H\nLJMP ISR_SERIAL ; Shared vector for UART RX and TX',
    bytes: 8
  },
  {
    address: '0030H–0FFFH',
    name: 'On-Chip User Program & Tables (4 KB Boundary)',
    type: 'user',
    description: 'Main firmware application space, subroutines, arithmetic algorithms, and constant lookup tables (DB/DW). 0FFFH is the upper boundary of internal 4KB ROM (4,096 bytes).',
    codeSnippet: 'ORG 0030H\nMAIN:   MOV SP, #2FH    ; Reallocate stack\n        MOV P1, #0FFH   ; Initialize Port 1\nHERE:   SJMP HERE',
    bytes: 4048
  },
  {
    address: '1000H–FFFFH',
    name: 'External Program Memory Space (Up to 64 KB Total)',
    type: 'external',
    description: 'External EPROM / Flash expansion up to 64 KB. If EA pin is HIGH (+5V), execution automatically switches here when PC exceeds 0FFFH. If EA is LOW (0V), CPU accesses external ROM across the entire 0000H–FFFFH range.',
    codeSnippet: '; External EPROM / Flash (60 KB expansion)\n; Fetched via Port 0 (AD0-AD7), Port 2 (A8-A15), and PSEN read strobe',
    bytes: 61440
  }
];

interface MCU8051ROMDiagramProps {
  defaultTab?: 'map' | 'signals' | 'instructions' | 'harvard';
}

export default function MCU8051ROMDiagram({ defaultTab = 'map' }: MCU8051ROMDiagramProps) {
  const [eaPinState, setEaPinState] = useState<'high' | 'low'>('high'); // 'high' = +5V (Internal 4KB), 'low' = 0V (External 64KB)
  const [selectedVector, setSelectedVector] = useState<ROMVector>(romVectors[0]);
  const [activeTab, setActiveTab] = useState<'map' | 'signals' | 'instructions' | 'harvard'>(defaultTab);

  // Interactive MOVC simulator state
  const [simAccumulator, setSimAccumulator] = useState<number>(3); // offset in A (0-15)
  const [simBaseMode, setSimBaseMode] = useState<'DPTR' | 'PC'>('DPTR');
  const dptrBaseAddress = 0x0200;
  const pcBaseAddress = 0x0040;
  const effectiveAddress = (simBaseMode === 'DPTR' ? dptrBaseAddress : pcBaseAddress) + simAccumulator;

  const lookupSample = [
    { offset: 0, valHex: '30H', char: "'0'" },
    { offset: 1, valHex: '31H', char: "'1'" },
    { offset: 2, valHex: '32H', char: "'2'" },
    { offset: 3, valHex: '33H', char: "'3'" },
    { offset: 4, valHex: '34H', char: "'4'" },
    { offset: 5, valHex: '35H', char: "'5'" },
    { offset: 6, valHex: '36H', char: "'6'" },
    { offset: 7, valHex: '37H', char: "'7'" },
  ];

  return (
    <div className="w-full flex flex-col gap-5 font-sans">
      {/* Top Banner & Mode Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 font-mono font-bold text-xs flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-indigo-600" />
            8051 Program Memory (ROM / Flash) Architecture
          </span>
          <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
            4 KB On-Chip Flash/ROM • Expandable to 64 KB
          </span>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1 font-mono font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'map'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            ROM Memory Map &amp; EA̅
          </button>
          <button
            onClick={() => setActiveTab('signals')}
            className={`px-3 py-1 font-mono font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'signals'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Bus Signals &amp; PSEN̅
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`px-3 py-1 font-mono font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'instructions'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            MOVC Instruction Simulator
          </button>
          <button
            onClick={() => setActiveTab('harvard')}
            className={`px-3 py-1 font-mono font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'harvard'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            RAM vs ROM Comparison
          </button>
        </div>
      </div>

      {/* Main Tab 1: ROM Memory Map & EA Pin Control */}
      {activeTab === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Interactive Visual Memory Map & EA Toggle */}
          <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-slate-900 space-y-4">
            {/* EA Pin Control Bar */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-amber-50 text-amber-800 rounded font-mono text-xs font-bold px-2 py-0.5 border border-amber-200">
                  Pin 31 (E̅A̅ / VPP)
                </span>
                <span className="text-xs text-slate-700 font-medium">
                  External Access Control:
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEaPinState('high')}
                  className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                    eaPinState === 'high'
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  E̅A̅ = HIGH (+5V)
                </button>
                <button
                  onClick={() => setEaPinState('low')}
                  className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                    eaPinState === 'low'
                      ? 'bg-amber-600 border-amber-500 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  E̅A̅ = LOW (0V / GND)
                </button>
              </div>
            </div>

            {/* Mode Explanation Notice */}
            <div
              className={`p-3 rounded-xl border text-xs leading-relaxed transition-all ${
                eaPinState === 'high'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5 mb-1 font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                {eaPinState === 'high'
                  ? 'INTERNAL 4KB ROM ENABLED (E̅A̅ = +5V)'
                  : 'EXTERNAL MEMORY FORCED MODE (E̅A̅ = 0V)'}
              </div>
              {eaPinState === 'high' ? (
                <p className="text-slate-700">
                  Execution starts from the <strong className="text-slate-950">on-chip 4KB ROM</strong> (0000H to 0FFFH). When the Program Counter (PC) increments past <code className="text-emerald-800 bg-emerald-100/70 px-1 py-0.5 rounded font-mono">0FFFH</code>, the 8051 automatically switches bus activity to fetch opcodes from <strong className="text-slate-950">External ROM</strong> (1000H to FFFFH).
                </p>
              ) : (
                <p className="text-slate-700">
                  On-chip 4KB ROM is <strong className="text-slate-950">completely bypassed</strong>. All instruction fetches—including the Power-on Reset vector at 0000H—are directed exclusively to <strong className="text-slate-950">External EPROM / Flash</strong> across the entire 64 KB range (0000H–FFFFH) via P̅S̅E̅N̅.
                </p>
              )}
            </div>

            {/* Visual Interactive Memory Stack */}
            <div className="space-y-1.5 font-mono text-xs select-none">
              <div className="text-[11px] font-sans font-semibold text-slate-500 uppercase tracking-wider mb-2 flex justify-between items-center">
                <span>Click a memory zone to inspect</span>
                <span>Address Range: 0000H – FFFFH</span>
              </div>

              {/* Vector Zone (0000H - 002AH) */}
              <div className="border border-indigo-200 rounded-xl p-2.5 bg-indigo-50/50 space-y-1.5">
                <div className="text-[10px] uppercase font-bold text-indigo-900 font-sans tracking-wide">
                  Interrupt &amp; Reset Vector Table (0000H – 002FH • 48 Bytes)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {romVectors.slice(0, 6).map((vec) => {
                    const isSelected = selectedVector.address === vec.address;
                    return (
                      <button
                        key={vec.address}
                        onClick={() => setSelectedVector(vec)}
                        className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-700 text-white shadow-xs ring-2 ring-indigo-200'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/40'
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className={isSelected ? 'text-indigo-100' : 'text-indigo-700'}>{vec.address}</span>
                          <span className={isSelected ? 'text-indigo-200 text-[9px]' : 'text-slate-400 text-[9px]'}>{vec.bytes}B</span>
                        </div>
                        <div className={`font-sans font-bold text-[11px] truncate mt-0.5 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {vec.name}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Internal User Program (0030H - 0FFFH) */}
              <button
                onClick={() => setSelectedVector(romVectors[6])}
                className={`w-full p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                  selectedVector.address === romVectors[6].address
                    ? 'bg-emerald-600 border-emerald-700 text-white shadow-xs ring-2 ring-emerald-200'
                    : eaPinState === 'high'
                    ? 'bg-emerald-50/60 border-emerald-200 text-slate-800 hover:bg-emerald-100/60'
                    : 'bg-slate-100 border-slate-200 text-slate-400 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <span className={selectedVector.address === romVectors[6].address ? 'font-mono text-white' : 'font-mono text-emerald-800'}>0030H – 0FFFH</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-sans border ${
                      selectedVector.address === romVectors[6].address 
                        ? 'bg-emerald-700/80 text-white border-emerald-400' 
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}>
                      {eaPinState === 'high' ? 'On-Chip 4KB Flash/ROM (Active)' : 'Bypassed (E̅A̅=0)'}
                    </span>
                  </div>
                  <div className={`font-sans text-xs mt-1 ${selectedVector.address === romVectors[6].address ? 'text-emerald-100' : 'text-slate-600'}`}>
                    Application Code, Subroutines, and Constant Lookup Tables (~4,048 Bytes)
                  </div>
                </div>
                <ArrowRight className={`w-4 h-4 shrink-0 ${selectedVector.address === romVectors[6].address ? 'text-white' : 'text-emerald-700'}`} />
              </button>

              {/* External Expansion Space (1000H - FFFFH) */}
              <button
                onClick={() => setSelectedVector(romVectors[7])}
                className={`w-full p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                  selectedVector.address === romVectors[7].address
                    ? 'bg-amber-600 border-amber-700 text-white shadow-xs ring-2 ring-amber-200'
                    : 'bg-amber-50/60 border-amber-200 text-slate-800 hover:bg-amber-100/60'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <span className={selectedVector.address === romVectors[7].address ? 'font-mono text-white' : 'font-mono text-amber-800'}>
                      {eaPinState === 'high' ? '1000H – FFFFH' : '0000H – FFFFH'}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-sans border ${
                      selectedVector.address === romVectors[7].address 
                        ? 'bg-amber-700/80 text-white border-amber-400' 
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {eaPinState === 'high' ? 'External Expansion (60 KB)' : 'External Only (64 KB Total)'}
                    </span>
                  </div>
                  <div className={`font-sans text-xs mt-1 ${selectedVector.address === romVectors[7].address ? 'text-amber-100' : 'text-slate-600'}`}>
                    External EPROM/Flash accessed via Port 0 (AD0–AD7), Port 2 (A8–A15), and P̅S̅E̅N̅
                  </div>
                </div>
                <ArrowRight className={`w-4 h-4 shrink-0 ${selectedVector.address === romVectors[7].address ? 'text-white' : 'text-amber-700'}`} />
              </button>
            </div>
          </div>

          {/* Right Column: Zone Inspector & Assembly Details */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 tracking-wider">
                  Zone Inspector
                </span>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  {selectedVector.name}
                </h3>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-1 rounded border border-slate-200 text-slate-800">
                {selectedVector.address}
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              {selectedVector.description}
            </p>

            {/* Assembly Implementation Template */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500 flex items-center gap-1">
                <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                Typical Assembly Implementation:
              </span>
              <pre className="bg-slate-50 text-indigo-950 p-3 rounded-xl text-xs font-mono overflow-x-auto border border-slate-200 leading-normal">
                {selectedVector.codeSnippet}
              </pre>
            </div>

            {/* Key Engineering Specifications */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-sans">Addressing Range:</span>
                <span className="font-bold text-slate-900">{selectedVector.address}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-sans">Capacity / Size:</span>
                <span className="font-bold text-slate-900">{selectedVector.bytes} Bytes</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-sans">Active Control Pin:</span>
                <span className="font-bold text-indigo-600">
                  {selectedVector.type === 'external' ? 'P̅S̅E̅N̅ (Pin 29) + ALE (Pin 30)' : 'Internal Bus / PC'}
                </span>
              </div>
            </div>

            {/* Did you know note */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex gap-2 items-start">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Why vectors are spaced 8 bytes apart:</strong>
                Each interrupt vector slot has exactly 8 bytes (e.g. 0003H to 000AH). If an ISR takes more than 8 bytes, programmers insert an <code className="font-mono font-bold bg-amber-100 px-1 rounded">LJMP ISR_NAME</code> to prevent the code from overflowing into the next interrupt vector!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Tab 2: Bus Signals & Interfacing Hardware */}
      {activeTab === 'signals' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 font-mono font-bold text-xs">
                Pin 29
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">P̅S̅E̅N̅ (Program Store Enable)</h4>
                <span className="text-[11px] text-slate-500">Active-LOW Read Strobe</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Connects directly to the Output Enable (<code className="font-mono bg-slate-100 px-1 rounded">O̅E̅</code>) pin of external EPROM/ROM chips. It pulses LOW twice every machine cycle during external instruction fetches, but remains HIGH during internal ROM execution or external RAM data transfers.
            </p>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-700">
              <strong className="block text-[10px] text-indigo-600 font-sans uppercase">Timing:</strong>
              Pulses active-LOW 2x per machine cycle (states S1P2 to S2P2 and S4P2 to S5P2).
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600 font-mono font-bold text-xs">
                Pin 30
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">ALE (Address Latch Enable)</h4>
                <span className="text-[11px] text-slate-500">Bus Demultiplexing Signal</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Demultiplexes the combined address/data bus on Port 0. ALE pulses HIGH at a constant rate of 1/6 oscillator frequency (<code className="font-mono bg-slate-100 px-1 rounded">fOSC / 6</code>) to latch lower address bits (<code className="font-mono bg-slate-100 px-1 rounded">A0–A7</code>) into an external 74LS373 transparent latch.
            </p>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-700">
              <strong className="block text-[10px] text-blue-600 font-sans uppercase">Application:</strong>
              Essential for interfacing any external memory device without losing address bits.
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600 font-mono font-bold text-xs">
                P0 &amp; P2
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Address &amp; Data Buses</h4>
                <span className="text-[11px] text-slate-500">16-Bit Addressing Space</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-900">Port 0 (Pins 32–39):</strong> Acts as multiplexed low-order address (<code className="font-mono bg-slate-100 px-1 rounded">A0–A7</code>) and data bus (<code className="font-mono bg-slate-100 px-1 rounded">D0–D7</code>).<br />
              <strong className="text-slate-900">Port 2 (Pins 21–28):</strong> Provides high-order address bits (<code className="font-mono bg-slate-100 px-1 rounded">A8–A15</code>) during external memory operations.
            </p>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-700">
              <strong className="block text-[10px] text-purple-600 font-sans uppercase">Total Reach:</strong>
              16 address lines provide 2<sup>16</sup> = 65,536 bytes (64 KB) address space.
            </div>
          </div>
        </div>
      )}

      {/* Main Tab 3: MOVC Instruction Simulator */}
      {activeTab === 'instructions' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 tracking-wider">
              ROM Constant Lookup
            </span>
            <h3 className="text-base font-bold text-slate-900 font-display">
              MOVC (Move from Code Memory / ROM) Simulator
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Because 8051 uses Harvard Architecture, standard <code className="font-mono text-indigo-600 bg-slate-100 px-1 rounded">MOV</code> cannot read Program ROM. The specialized <code className="font-mono text-indigo-600 bg-slate-100 px-1 rounded">MOVC</code> instruction computes an effective address and reads constants into the Accumulator.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Interactive Control Panel */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 font-mono">Instruction Mode:</span>
                <div className="flex gap-1 bg-slate-200 p-1 rounded-lg text-xs font-mono">
                  <button
                    onClick={() => setSimBaseMode('DPTR')}
                    className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                      simBaseMode === 'DPTR'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    MOVC A, @A+DPTR
                  </button>
                  <button
                    onClick={() => setSimBaseMode('PC')}
                    className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                      simBaseMode === 'PC'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    MOVC A, @A+PC
                  </button>
                </div>
              </div>

              {/* Offset Slider in Accumulator */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">Accumulator Offset (A):</span>
                  <span className="font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    A = {simAccumulator} ({simAccumulator.toString(16).toUpperCase().padStart(2, '0')}H)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="7"
                  value={simAccumulator}
                  onChange={(e) => setSimAccumulator(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Offset 0 (00H)</span>
                  <span>Offset 7 (07H)</span>
                </div>
              </div>

              {/* Formula Calculation Box */}
              <div className="bg-indigo-50/70 border border-indigo-200 text-slate-800 p-3.5 rounded-xl space-y-2 text-xs font-mono">
                <div className="text-[10px] text-indigo-700 font-sans uppercase font-bold">Address Arithmetic:</div>
                <div className="text-indigo-900 text-sm font-bold">
                  Effective ROM Address = {simBaseMode} + A
                </div>
                <div className="text-slate-700">
                  = {simBaseMode === 'DPTR' ? '0200H' : '0040H'} + {simAccumulator.toString(16).toUpperCase().padStart(2, '0')}H
                  {' '}&rarr;{' '}
                  <span className="text-amber-800 font-bold bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                    {effectiveAddress.toString(16).toUpperCase().padStart(4, '0')}H
                  </span>
                </div>
              </div>
            </div>

            {/* Simulated ROM Table Inspector */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 font-mono">
                  ROM Table at {simBaseMode === 'DPTR' ? '0200H' : '0040H'}
                </span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                  Target Fetched: {lookupSample[simAccumulator].valHex} ({lookupSample[simAccumulator].char})
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 font-mono text-xs">
                {lookupSample.map((item) => {
                  const isTarget = item.offset === simAccumulator;
                  const itemAddr = ((simBaseMode === 'DPTR' ? dptrBaseAddress : pcBaseAddress) + item.offset)
                    .toString(16)
                    .toUpperCase()
                    .padStart(4, '0');
                  return (
                    <div
                      key={item.offset}
                      onClick={() => setSimAccumulator(item.offset)}
                      className={`p-2 rounded-lg border text-center cursor-pointer transition-all ${
                        isTarget
                          ? 'bg-indigo-600 text-white border-indigo-700 ring-2 ring-indigo-400 shadow-sm'
                          : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-[9px] opacity-70">{itemAddr}H</div>
                      <div className="font-bold text-sm my-0.5">{item.valHex}</div>
                      <div className="text-[10px] text-amber-500 font-bold">{item.char}</div>
                    </div>
                  );
                })}
              </div>

              <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                <strong className="text-indigo-600 font-mono">Result:</strong> Upon execution of{' '}
                <code className="font-mono bg-slate-100 px-1 rounded">MOVC A, @A+{simBaseMode}</code>, the Accumulator is overwritten with{' '}
                <strong className="text-slate-900 font-mono">{lookupSample[simAccumulator].valHex}</strong> (ASCII {lookupSample[simAccumulator].char}).
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Tab 4: Harvard Architecture Comparison (RAM vs ROM) */}
      {activeTab === 'harvard' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Split className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                8051 Harvard Memory Model: Program ROM vs. Data RAM
              </h3>
              <p className="text-xs text-slate-600">
                The 8051 implements a strict Harvard Architecture where Program Memory (ROM) and Data Memory (RAM) have independent physical address spaces and separate control lines.
              </p>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden font-sans">
              <thead className="bg-slate-100 text-slate-800 font-mono text-[11px] uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Feature</th>
                  <th className="p-3 bg-emerald-50 text-emerald-900">Program Memory (ROM)</th>
                  <th className="p-3 bg-blue-50 text-blue-900">Internal Data RAM</th>
                  <th className="p-3 bg-amber-50 text-amber-900">External Data RAM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                <tr>
                  <td className="p-3 font-bold font-sans text-slate-700">Storage Capacity</td>
                  <td className="p-3 bg-emerald-50/40 text-emerald-900 font-bold">4 KB on-chip (to 64 KB)</td>
                  <td className="p-3 bg-blue-50/40 text-blue-900 font-bold">128 Bytes (+ 128B SFRs)</td>
                  <td className="p-3 bg-amber-50/40 text-amber-900 font-bold">Up to 64 KB</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold font-sans text-slate-700">Address Range</td>
                  <td className="p-3 bg-emerald-50/40">0000H – 0FFFH (internal) / FFFFH</td>
                  <td className="p-3 bg-blue-50/40">00H – 7FH (RAM), 80H–FFH (SFR)</td>
                  <td className="p-3 bg-amber-50/40">0000H – FFFFH</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold font-sans text-slate-700">Address Pointer</td>
                  <td className="p-3 bg-emerald-50/40">Program Counter (PC), DPTR</td>
                  <td className="p-3 bg-blue-50/40">R0, R1 (indirect), SP (stack), Direct</td>
                  <td className="p-3 bg-amber-50/40">DPTR (16-bit) or R0, R1 (8-bit)</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold font-sans text-slate-700">Read Strobe</td>
                  <td className="p-3 bg-emerald-50/40 font-bold text-emerald-800">P̅S̅E̅N̅ (Pin 29)</td>
                  <td className="p-3 bg-blue-50/40">Internal clock timing</td>
                  <td className="p-3 bg-amber-50/40 font-bold text-amber-800">R̅D̅ (Pin 3.7 / Pin 17)</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold font-sans text-slate-700">Write Strobe</td>
                  <td className="p-3 bg-emerald-50/40 text-slate-400">Read-Only at runtime</td>
                  <td className="p-3 bg-blue-50/40">Internal clock timing</td>
                  <td className="p-3 bg-amber-50/40 font-bold text-amber-800">W̅R̅ (Pin 3.6 / Pin 16)</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold font-sans text-slate-700">Primary Instructions</td>
                  <td className="p-3 bg-emerald-50/40 text-emerald-900 font-bold">MOVC A, @A+DPTR / MOVC A, @A+PC</td>
                  <td className="p-3 bg-blue-50/40 text-blue-900 font-bold">MOV, PUSH, POP, XCH</td>
                  <td className="p-3 bg-amber-50/40 text-amber-900 font-bold">MOVX A, @DPTR / MOVX @DPTR, A</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold font-sans text-slate-700">Volatility</td>
                  <td className="p-3 bg-emerald-50/40">Non-volatile (retains on power down)</td>
                  <td className="p-3 bg-blue-50/40">Volatile (cleared on power down)</td>
                  <td className="p-3 bg-amber-50/40">Volatile SRAM</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
