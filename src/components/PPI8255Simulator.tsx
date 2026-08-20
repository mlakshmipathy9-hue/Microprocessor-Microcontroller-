import React, { useState, useEffect } from 'react';
import { Cpu, Sliders, CheckCircle2, Zap, ArrowRight, ToggleLeft, ToggleRight, Settings, Layers, Hash, Info, Eye } from 'lucide-react';
import PPI8255ArchitectureDiagram from './PPI8255ArchitectureDiagram';
import PPI8255ModesOfOperation from './PPI8255ModesOfOperation';

export type PPI8255Tab = 'diagram' | 'pins' | 'architecture' | 'modes' | 'iomode' | 'bsr' | 'registers';

interface PPI8255SimulatorProps {
  initialTab?: PPI8255Tab;
  allowedTabs?: PPI8255Tab[];
}

export default function PPI8255Simulator({
  initialTab = 'pins',
  allowedTabs,
}: PPI8255SimulatorProps) {
  const [activeTab, setActiveTab] = useState<PPI8255Tab>(initialTab);
  const [selectedPin, setSelectedPin] = useState<number | null>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

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

  // 40-Pin DIP Pinout Definition for Intel 8255 PPI
  const pinData: Record<number, { name: string; type: 'Port A' | 'Port B' | 'Port C' | 'Control & Bus' | 'Power'; desc: string; details: string }> = {
    1: { name: 'PA3', type: 'Port A', desc: 'Port A Bit 3 bidirectional I/O line.', details: 'Group A 8-bit port pin. Programmable as Input, Output, or bidirectional bus (Mode 2).' },
    2: { name: 'PA2', type: 'Port A', desc: 'Port A Bit 2 bidirectional I/O line.', details: 'Group A 8-bit port pin. Can drive standard TTL loads (sink 1.6mA - 2.5mA).' },
    3: { name: 'PA1', type: 'Port A', desc: 'Port A Bit 1 bidirectional I/O line.', details: 'Group A 8-bit port pin.' },
    4: { name: 'PA0', type: 'Port A', desc: 'Port A Bit 0 (LSB) bidirectional I/O line.', details: 'Group A port LSB. Mode 0 basic I/O, Mode 1 strobed, or Mode 2 bi-directional.' },
    5: { name: 'RD#', type: 'Control & Bus', desc: 'Read Strobe (Active LOW input).', details: 'CPU asserts RD# LOW to read data from the selected 8255 port or control register onto D0–D7.' },
    6: { name: 'CS#', type: 'Control & Bus', desc: 'Chip Select (Active LOW input).', details: 'A LOW on CS# enables 8255 communication with CPU. High disables bus buffers (high-impedance).' },
    7: { name: 'GND', type: 'Power', desc: 'System Ground reference (0V).', details: 'Connects to common DC ground rail (0V).' },
    8: { name: 'A1', type: 'Control & Bus', desc: 'Internal Port Address Line 1.', details: 'Used with A0 to select Port A (00), Port B (01), Port C (10), or Control Register (11).' },
    9: { name: 'A0', type: 'Control & Bus', desc: 'Internal Port Address Line 0.', details: 'Connects to latched address line A0 or A1 from CPU.' },
    10: { name: 'PC7', type: 'Port C', desc: 'Port C Upper Bit 7 / OBF_A# / Handshake.', details: 'Group A handshake line or general-purpose 4-bit upper I/O line with individual BSR capability.' },
    11: { name: 'PC6', type: 'Port C', desc: 'Port C Upper Bit 6 / ACK_A# / Handshake.', details: 'Group A handshake line in Mode 1/2 or general I/O.' },
    12: { name: 'PC5', type: 'Port C', desc: 'Port C Upper Bit 5 / IBF_A / Handshake.', details: 'Input Buffer Full signal for Port A in Mode 1/2.' },
    13: { name: 'PC4', type: 'Port C', desc: 'Port C Upper Bit 4 / STB_A# / Handshake.', details: 'Strobe input for Port A in Mode 1.' },
    14: { name: 'PC0', type: 'Port C', desc: 'Port C Lower Bit 0 / Handshake.', details: 'Group B 4-bit lower I/O line or interrupt request line.' },
    15: { name: 'PC1', type: 'Port C', desc: 'Port C Lower Bit 1 / Handshake.', details: 'Group B handshake line or general I/O line.' },
    16: { name: 'PC2', type: 'Port C', desc: 'Port C Lower Bit 2 / Handshake.', details: 'Group B handshake line or general I/O line.' },
    17: { name: 'PC3', type: 'Port C', desc: 'Port C Lower Bit 3 / INTR_A / Handshake.', details: 'Interrupt Request line for Group A or general I/O line.' },
    18: { name: 'PB0', type: 'Port B', desc: 'Port B Bit 0 (LSB) bidirectional I/O line.', details: 'Group B 8-bit port pin. Operates in Mode 0 (Basic I/O) or Mode 1 (Strobed I/O).' },
    19: { name: 'PB1', type: 'Port B', desc: 'Port B Bit 1 bidirectional I/O line.', details: 'Group B 8-bit port pin.' },
    20: { name: 'PB2', type: 'Port B', desc: 'Port B Bit 2 bidirectional I/O line.', details: 'Group B 8-bit port pin.' },
    21: { name: 'PB3', type: 'Port B', desc: 'Port B Bit 3 bidirectional I/O line.', details: 'Group B 8-bit port pin.' },
    22: { name: 'PB4', type: 'Port B', desc: 'Port B Bit 4 bidirectional I/O line.', details: 'Group B 8-bit port pin.' },
    23: { name: 'PB5', type: 'Port B', desc: 'Port B Bit 5 bidirectional I/O line.', details: 'Group B 8-bit port pin.' },
    24: { name: 'PB6', type: 'Port B', desc: 'Port B Bit 6 bidirectional I/O line.', details: 'Group B 8-bit port pin.' },
    25: { name: 'PB7', type: 'Port B', desc: 'Port B Bit 7 (MSB) bidirectional I/O line.', details: 'Group B 8-bit port MSB.' },
    26: { name: 'VCC', type: 'Power', desc: 'Primary Power Supply (+5V DC).', details: 'Standard +5V ±10% regulated DC power rail.' },
    27: { name: 'D7', type: 'Control & Bus', desc: 'Bidirectional Data Bus Bit 7 (MSB).', details: 'Connects to CPU data bus D7. Transfers data & control words.' },
    28: { name: 'D6', type: 'Control & Bus', desc: 'Bidirectional Data Bus Bit 6.', details: 'Connects to CPU data bus D6.' },
    29: { name: 'D5', type: 'Control & Bus', desc: 'Bidirectional Data Bus Bit 5.', details: 'Connects to CPU data bus D5.' },
    30: { name: 'D4', type: 'Control & Bus', desc: 'Bidirectional Data Bus Bit 4.', details: 'Connects to CPU data bus D4.' },
    31: { name: 'D3', type: 'Control & Bus', desc: 'Bidirectional Data Bus Bit 3.', details: 'Connects to CPU data bus D3.' },
    32: { name: 'D2', type: 'Control & Bus', desc: 'Bidirectional Data Bus Bit 2.', details: 'Connects to CPU data bus D2.' },
    33: { name: 'D1', type: 'Control & Bus', desc: 'Bidirectional Data Bus Bit 1.', details: 'Connects to CPU data bus D1.' },
    34: { name: 'D0', type: 'Control & Bus', desc: 'Bidirectional Data Bus Bit 0 (LSB).', details: 'Connects to CPU data bus D0.' },
    35: { name: 'RESET', type: 'Control & Bus', desc: 'Reset Input (Active HIGH).', details: 'A HIGH on RESET clears the internal control register and sets all 24 I/O ports (A, B, C) to Input Mode.' },
    36: { name: 'WR#', type: 'Control & Bus', desc: 'Write Strobe (Active LOW input).', details: 'CPU asserts WR# LOW to write data or control words from CPU into 8255 ports/registers.' },
    37: { name: 'PA7', type: 'Port A', desc: 'Port A Bit 7 (MSB) bidirectional I/O line.', details: 'Group A 8-bit port MSB.' },
    38: { name: 'PA6', type: 'Port A', desc: 'Port A Bit 6 bidirectional I/O line.', details: 'Group A 8-bit port pin.' },
    39: { name: 'PA5', type: 'Port A', desc: 'Port A Bit 5 bidirectional I/O line.', details: 'Group A 8-bit port pin.' },
    40: { name: 'PA4', type: 'Port A', desc: 'Port A Bit 4 bidirectional I/O line.', details: 'Group A 8-bit port pin.' },
  };

  const getPinColor = (pinNum: number) => {
    const pin = pinData[pinNum];
    if (!pin) return 'bg-slate-100 text-slate-700 border-slate-300';
    if (selectedPin === pinNum) return 'bg-amber-400 text-amber-950 border-amber-600 font-extrabold ring-2 ring-amber-400';
    
    switch (pin.type) {
      case 'Port A': return 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100';
      case 'Port B': return 'bg-indigo-50 text-indigo-800 border-indigo-300 hover:bg-indigo-100';
      case 'Port C': return 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100';
      case 'Control & Bus': return 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100';
      case 'Power': return 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-300';
    }
  };

  const tabLabels: Record<PPI8255Tab, { label: string; title: string; subtitle: string }> = {
    diagram: {
      label: 'Architecture',
      title: 'Figure 1.3: Intel 8255 Internal Architecture Block Diagram',
      subtitle: '8-Bit Data Bus Buffer • Read/Write Control Logic • Group A & B Controllers • Ports A, B & C'
    },
    pins: {
      label: '40-Pin DIP IC Diagram',
      title: 'Intel 8255 PPI 40-Pin DIP Pinout & Architecture',
      subtitle: 'Complete 40-Pin Package Layout • Ports A, B, C (24 I/O Pins) • Bus Control & Power Rails'
    },
    architecture: {
      label: 'Functional Blocks',
      title: 'Intel 8255 PPI Internal Block Architecture',
      subtitle: 'Group A & Group B Control Units • 8-Bit Internal Data Bus Buffer • Read/Write Control Logic'
    },
    modes: {
      label: 'Modes of Operation ⚙️',
      title: 'Intel 8255 PPI Modes of Operation & Architecture',
      subtitle: 'BSR Mode (D7=0) • Mode 0 (Basic I/O) • Mode 1 (Strobed Handshake) • Mode 2 (Bi-directional Bus)'
    },
    iomode: {
      label: 'I/O Control Word (Mode 0/1/2)',
      title: '8255 Mode Set Control Word Generator (D7 = 1)',
      subtitle: 'Mode 0 (Basic I/O), Mode 1 (Strobed Handshake), Mode 2 (Bi-directional Bus)'
    },
    bsr: {
      label: 'BSR Mode (Bit Set/Reset)',
      title: 'Port C Bit Set / Reset (BSR) Mode Architecture (D7 = 0)',
      subtitle: 'Individual Bit Manipulation on PC0–PC7 without altering other port pins'
    },
    registers: {
      label: 'Port Registers Monitor',
      title: 'Live 8255 Port Register State & Logic Probe',
      subtitle: 'Real-time bit toggling and logic level monitoring for Port A, Port B, and Port C'
    }
  };

  const displayedTabs = allowedTabs && allowedTabs.length > 0
    ? allowedTabs
    : (['diagram', 'pins', 'architecture', 'iomode', 'bsr', 'registers'] as PPI8255Tab[]);

  const currentTabInfo = tabLabels[activeTab] || tabLabels.pins;

  return (
    <div className="bg-white text-slate-800 p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs font-sans">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-200 text-indigo-600 shadow-2xs">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">{currentTabInfo.title}</h3>
            <p className="text-[11px] text-slate-500">{currentTabInfo.subtitle}</p>
          </div>
        </div>

        {/* Tab Switcher */}
        {displayedTabs.length > 1 && (
          <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 shadow-inner">
            {displayedTabs.map((tabKey) => {
              const isSelected = activeTab === tabKey;
              return (
                <button
                  key={tabKey}
                  onClick={() => setActiveTab(tabKey)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer text-[11px] ${
                    isSelected
                      ? 'bg-white text-indigo-700 shadow-xs font-bold border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tabLabels[tabKey].label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: 40-PIN DIP PIN DIAGRAM                                             */}
      {/* ========================================================================= */}
      {activeTab === 'pins' && (
        <div className="space-y-4">
          {/* Functional Group Legend */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
              <span>Pin Group Legend:</span>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px]">
              <span className="px-2 py-0.5 rounded-md font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                Port A (8 Pins: PA0–PA7)
              </span>
              <span className="px-2 py-0.5 rounded-md font-bold bg-indigo-100 text-indigo-900 border border-indigo-300">
                Port B (8 Pins: PB0–PB7)
              </span>
              <span className="px-2 py-0.5 rounded-md font-bold bg-amber-100 text-amber-900 border border-amber-300">
                Port C (8 Pins: PC0–PC7)
              </span>
              <span className="px-2 py-0.5 rounded-md font-bold bg-blue-100 text-blue-900 border border-blue-300">
                Bus &amp; Control (14 Pins)
              </span>
              <span className="px-2 py-0.5 rounded-md font-bold bg-rose-100 text-rose-900 border border-rose-300">
                Power (VCC 26, GND 7)
              </span>
            </div>
          </div>

          {/* Interactive 40-Pin DIP Package Visualizer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* DIP IC Canvas */}
            <div className="lg:col-span-7 bg-slate-100 p-5 rounded-2xl border-2 border-slate-300 shadow-sm flex flex-col items-center relative overflow-hidden">
              {/* Notch at Top of IC */}
              <div className="w-10 h-4 bg-slate-200 rounded-b-full border-b border-x border-slate-400 mb-3 shadow-inner flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 block" />
              </div>

              <div className="text-center mb-4">
                <span className="text-indigo-900 font-mono text-xs tracking-widest font-extrabold uppercase">
                  INTEL 8255A / 8255A-5 PPI
                </span>
                <p className="text-[10px] text-slate-500 font-mono">40-PIN DUAL IN-LINE PACKAGE (DIP)</p>
              </div>

              {/* Pins Container: Left (1-20) vs Right (40-21) */}
              <div className="w-full max-w-md grid grid-cols-2 gap-4">
                {/* Left Side: Pins 1 to 20 */}
                <div className="space-y-1">
                  {Array.from({ length: 20 }, (_, i) => {
                    const pinNum = i + 1;
                    const pin = pinData[pinNum];
                    return (
                      <button
                        key={pinNum}
                        onClick={() => setSelectedPin(pinNum)}
                        className={`w-full flex items-center justify-between px-2 py-1 rounded-md border text-[10.5px] font-mono cursor-pointer transition-all duration-150 ${getPinColor(
                          pinNum
                        )}`}
                      >
                        <span className="font-bold text-[9px] text-slate-500 opacity-80">{pinNum}</span>
                        <span className="font-bold">{pin.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Right Side: Pins 40 down to 21 */}
                <div className="space-y-1">
                  {Array.from({ length: 20 }, (_, i) => {
                    const pinNum = 40 - i;
                    const pin = pinData[pinNum];
                    return (
                      <button
                        key={pinNum}
                        onClick={() => setSelectedPin(pinNum)}
                        className={`w-full flex items-center justify-between px-2 py-1 rounded-md border text-[10.5px] font-mono cursor-pointer transition-all duration-150 ${getPinColor(
                          pinNum
                        )}`}
                      >
                        <span className="font-bold">{pin.name}</span>
                        <span className="font-bold text-[9px] text-slate-500 opacity-80">{pinNum}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="text-[10px] text-slate-600 font-mono mt-4 text-center font-medium">
                Click any pin to inspect its signal description, electrical characteristics, and microprocessor bus interfacing.
              </div>
            </div>

            {/* Selected Pin Details Panel & Pinout Reference Table */}
            <div className="lg:col-span-5 space-y-3">
              {/* Selected Pin Detail Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-mono font-extrabold flex items-center justify-center text-xs">
                      {selectedPin ? selectedPin : 'i'}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">
                        {selectedPin ? `Pin ${selectedPin}: ${pinData[selectedPin].name}` : 'Pin Inspector'}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {selectedPin ? pinData[selectedPin].type : 'Click a pin on the left to inspect'}
                      </span>
                    </div>
                  </div>
                  {selectedPin && (
                    <span className="px-2 py-0.5 rounded text-[9.5px] font-bold uppercase font-mono bg-indigo-100 text-indigo-800">
                      {pinData[selectedPin].type}
                    </span>
                  )}
                </div>

                {selectedPin ? (
                  <div className="space-y-2 text-[11px]">
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <strong className="text-slate-800 block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                        Signal Description:
                      </strong>
                      <p className="text-slate-700 leading-relaxed font-sans">{pinData[selectedPin].desc}</p>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <strong className="text-slate-800 block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                        Architectural Function:
                      </strong>
                      <p className="text-slate-600 leading-relaxed font-sans">{pinData[selectedPin].details}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-slate-500 text-[11px] bg-white rounded-lg border border-slate-200">
                    <Info className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                    Select any of the 40 pins on the DIP package diagram to see its bus timing role, electrical direction, and internal group assignment.
                  </div>
                )}
              </div>

              {/* 8255 Internal Address Decoding Summary (A1, A0, CS#, RD#, WR#) */}
              <div className="bg-indigo-50 text-slate-900 p-3.5 rounded-xl border border-indigo-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between border-b border-indigo-200 pb-1.5">
                  <span className="font-bold text-[11px] text-indigo-950 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                    8255 Internal Address Decoding Table
                  </span>
                  <span className="text-[9px] font-mono text-indigo-700 font-bold">CS# = 0 (Active)</span>
                </div>
                <div className="overflow-x-auto text-[10px] font-mono">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-indigo-200 text-indigo-900">
                        <th className="py-1 px-1">A1</th>
                        <th className="py-1 px-1">A0</th>
                        <th className="py-1 px-1">RD#</th>
                        <th className="py-1 px-1">WR#</th>
                        <th className="py-1 px-1 text-right">Selected Port / Operation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-100 text-slate-800">
                      <tr>
                        <td className="py-1 px-1 text-emerald-700 font-bold">0</td>
                        <td className="py-1 px-1 text-emerald-700 font-bold">0</td>
                        <td className="py-1 px-1">0</td>
                        <td className="py-1 px-1">1</td>
                        <td className="py-1 px-1 text-right text-emerald-800 font-sans font-medium">Read Port A → Data Bus</td>
                      </tr>
                      <tr>
                        <td className="py-1 px-1 text-emerald-700 font-bold">0</td>
                        <td className="py-1 px-1 text-emerald-700 font-bold">0</td>
                        <td className="py-1 px-1">1</td>
                        <td className="py-1 px-1">0</td>
                        <td className="py-1 px-1 text-right text-emerald-800 font-sans font-medium">Write Data Bus → Port A</td>
                      </tr>
                      <tr>
                        <td className="py-1 px-1 text-indigo-700 font-bold">0</td>
                        <td className="py-1 px-1 text-indigo-700 font-bold">1</td>
                        <td className="py-1 px-1">0/1</td>
                        <td className="py-1 px-1">1/0</td>
                        <td className="py-1 px-1 text-right text-indigo-800 font-sans font-medium">Read / Write Port B</td>
                      </tr>
                      <tr>
                        <td className="py-1 px-1 text-amber-700 font-bold">1</td>
                        <td className="py-1 px-1 text-amber-700 font-bold">0</td>
                        <td className="py-1 px-1">0/1</td>
                        <td className="py-1 px-1">1/0</td>
                        <td className="py-1 px-1 text-right text-amber-800 font-sans font-medium">Read / Write Port C</td>
                      </tr>
                      <tr className="bg-indigo-100/70">
                        <td className="py-1 px-1 text-purple-700 font-bold">1</td>
                        <td className="py-1 px-1 text-purple-700 font-bold">1</td>
                        <td className="py-1 px-1">1</td>
                        <td className="py-1 px-1">0</td>
                        <td className="py-1 px-1 text-right text-purple-900 font-sans font-bold">Write Control Register</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BLOCK ARCHITECTURE                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'architecture' && (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-inner space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-xs text-indigo-950 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Intel 8255 Internal Functional Architecture Block Diagram
              </span>
              <span className="text-[10px] font-mono text-slate-500">24 Programmable Pins • 2 Group Controllers</span>
            </div>

            {/* Architecture Blocks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
              {/* Left Column: CPU Bus Interface */}
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                    <strong className="text-blue-900 font-mono text-xs">Data Bus Buffer</strong>
                    <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-bold">8-Bit Bi-Dir</span>
                  </div>
                  <p className="text-slate-600 text-[10px]">
                    Tri-state 8-bit bidirectional buffer interfacing 8255 internal bus with system data bus (<strong>D0–D7</strong>). Transmits data, control words, and status information.
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                    <strong className="text-blue-900 font-mono text-xs">Read/Write Control Logic</strong>
                    <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-bold">Control</span>
                  </div>
                  <p className="text-slate-600 text-[10px]">
                    Decodes <strong>RD#</strong>, <strong>WR#</strong>, <strong>CS#</strong>, <strong>A0</strong>, <strong>A1</strong>, and <strong>RESET</strong> signals to direct internal data flow to the appropriate port registers.
                  </p>
                </div>
              </div>

              {/* Middle Column: Group A Controller & Ports */}
              <div className="space-y-3">
                <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-1">
                    <strong className="text-emerald-900 font-mono text-xs">Group A Control</strong>
                    <span className="text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">Mode 0,1,2</span>
                  </div>
                  <div className="space-y-1.5 text-[10px]">
                    <div className="bg-white p-2 rounded-lg border border-emerald-200">
                      <strong className="text-emerald-900 block font-mono">Port A (PA0–PA7):</strong>
                      <span className="text-slate-600">8-bit data output latch/buffer and 8-bit data input latch. Supports Modes 0, 1, and 2.</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-emerald-200">
                      <strong className="text-emerald-900 block font-mono">Port C Upper (PC4–PC7):</strong>
                      <span className="text-slate-600">4-bit I/O port or handshake control lines for Port A. Individual bit set/reset via BSR.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Group B Controller & Ports */}
              <div className="space-y-3">
                <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between border-b border-indigo-200 pb-1">
                    <strong className="text-indigo-900 font-mono text-xs">Group B Control</strong>
                    <span className="text-[9px] px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded font-bold">Mode 0,1</span>
                  </div>
                  <div className="space-y-1.5 text-[10px]">
                    <div className="bg-white p-2 rounded-lg border border-indigo-200">
                      <strong className="text-indigo-900 block font-mono">Port B (PB0–PB7):</strong>
                      <span className="text-slate-600">8-bit data I/O latch/buffer. Supports Mode 0 (Basic I/O) and Mode 1 (Strobed Handshake).</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-indigo-200">
                      <strong className="text-indigo-900 block font-mono">Port C Lower (PC0–PC3):</strong>
                      <span className="text-slate-600">4-bit I/O port or handshake control lines for Port B. Individual bit set/reset via BSR.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: I/O MODE CONFIGURATOR                                              */}
      {/* ========================================================================= */}
      {activeTab === 'iomode' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* GROUP A CONTROLS */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="font-bold text-xs text-indigo-900 uppercase">Group A Configuration</span>
                <span className="text-[10px] font-mono text-indigo-600 font-bold">Port A + Port C Upper</span>
              </div>

              {/* Mode selection for Group A */}
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Group A Operating Mode (D6, D5)</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setGroupAMode('mode0')}
                    className={`py-1 px-2 rounded-lg font-bold border cursor-pointer transition-all ${
                      groupAMode === 'mode0' ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Mode 0 (Basic)
                  </button>
                  <button
                    onClick={() => setGroupAMode('mode1')}
                    className={`py-1 px-2 rounded-lg font-bold border cursor-pointer transition-all ${
                      groupAMode === 'mode1' ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Mode 1 (Strobe)
                  </button>
                  <button
                    onClick={() => setGroupAMode('mode2')}
                    className={`py-1 px-2 rounded-lg font-bold border cursor-pointer transition-all ${
                      groupAMode === 'mode2' ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Mode 2 (Bi-dir)
                  </button>
                </div>
              </div>

              {/* Port A Direction (D4) */}
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Port A Direction (D4)</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPortADir('output')}
                    className={`flex-1 py-1 rounded font-bold border cursor-pointer transition-all ${
                      portADir === 'output' ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Output (0)
                  </button>
                  <button
                    onClick={() => setPortADir('input')}
                    className={`flex-1 py-1 rounded font-bold border cursor-pointer transition-all ${
                      portADir === 'input' ? 'bg-blue-600 border-blue-600 text-white shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Input (1)
                  </button>
                </div>
              </div>

              {/* Port C Upper Direction (D3) */}
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Port C Upper (PC4–PC7) Direction (D3)</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPortCUpperDir('output')}
                    className={`flex-1 py-1 rounded font-bold border cursor-pointer transition-all ${
                      portCUpperDir === 'output' ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Output (0)
                  </button>
                  <button
                    onClick={() => setPortCUpperDir('input')}
                    className={`flex-1 py-1 rounded font-bold border cursor-pointer transition-all ${
                      portCUpperDir === 'input' ? 'bg-blue-600 border-blue-600 text-white shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Input (1)
                  </button>
                </div>
              </div>
            </div>

            {/* GROUP B CONTROLS */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="font-bold text-xs text-indigo-900 uppercase">Group B Configuration</span>
                <span className="text-[10px] font-mono text-indigo-600 font-bold">Port B + Port C Lower</span>
              </div>

              {/* Mode selection for Group B */}
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Group B Operating Mode (D2)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setGroupBMode('mode0')}
                    className={`py-1 px-2 rounded-lg font-bold border cursor-pointer transition-all ${
                      groupBMode === 'mode0' ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Mode 0 (Basic I/O)
                  </button>
                  <button
                    onClick={() => setGroupBMode('mode1')}
                    className={`py-1 px-2 rounded-lg font-bold border cursor-pointer transition-all ${
                      groupBMode === 'mode1' ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Mode 1 (Strobe I/O)
                  </button>
                </div>
              </div>

              {/* Port B Direction (D1) */}
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Port B Direction (D1)</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPortBDir('output')}
                    className={`flex-1 py-1 rounded font-bold border cursor-pointer transition-all ${
                      portBDir === 'output' ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Output (0)
                  </button>
                  <button
                    onClick={() => setPortBDir('input')}
                    className={`flex-1 py-1 rounded font-bold border cursor-pointer transition-all ${
                      portBDir === 'input' ? 'bg-blue-600 border-blue-600 text-white shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Input (1)
                  </button>
                </div>
              </div>

              {/* Port C Lower Direction (D0) */}
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Port C Lower (PC0–PC3) Direction (D0)</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPortCLowerDir('output')}
                    className={`flex-1 py-1 rounded font-bold border cursor-pointer transition-all ${
                      portCLowerDir === 'output' ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Output (0)
                  </button>
                  <button
                    onClick={() => setPortCLowerDir('input')}
                    className={`flex-1 py-1 rounded font-bold border cursor-pointer transition-all ${
                      portCLowerDir === 'input' ? 'bg-blue-600 border-blue-600 text-white shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Input (1)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Control Word Byte Bit Breakdown */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800 uppercase">Calculated I/O Control Word Byte</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                  {controlWordHex}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  ({controlWordByte.toString(2).padStart(8, '0')}b)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-8 gap-1 font-mono text-center text-[10px]">
              <div className="bg-indigo-50 p-2 rounded border border-indigo-200">
                <div className="font-bold text-indigo-900">D7</div>
                <div className="text-indigo-700 font-extrabold text-xs">1</div>
                <div className="text-[8px] text-slate-500">I/O Set</div>
              </div>
              <div className="bg-slate-50 p-2 rounded border border-slate-200">
                <div className="font-bold text-slate-700">D6</div>
                <div className="text-slate-900 font-extrabold text-xs">{(d6d5 >> 1) & 1}</div>
                <div className="text-[8px] text-slate-500">Grp A Mode</div>
              </div>
              <div className="bg-slate-50 p-2 rounded border border-slate-200">
                <div className="font-bold text-slate-700">D5</div>
                <div className="text-slate-900 font-extrabold text-xs">{d6d5 & 1}</div>
                <div className="text-[8px] text-slate-500">Grp A Mode</div>
              </div>
              <div className="bg-emerald-50 p-2 rounded border border-emerald-200">
                <div className="font-bold text-emerald-900">D4</div>
                <div className="text-emerald-700 font-extrabold text-xs">{d4}</div>
                <div className="text-[8px] text-slate-500">Port A</div>
              </div>
              <div className="bg-amber-50 p-2 rounded border border-amber-200">
                <div className="font-bold text-amber-900">D3</div>
                <div className="text-amber-700 font-extrabold text-xs">{d3}</div>
                <div className="text-[8px] text-slate-500">Port C Up</div>
              </div>
              <div className="bg-slate-50 p-2 rounded border border-slate-200">
                <div className="font-bold text-slate-700">D2</div>
                <div className="text-slate-900 font-extrabold text-xs">{d2}</div>
                <div className="text-[8px] text-slate-500">Grp B Mode</div>
              </div>
              <div className="bg-indigo-50 p-2 rounded border border-indigo-200">
                <div className="font-bold text-indigo-900">D1</div>
                <div className="text-indigo-700 font-extrabold text-xs">{d1}</div>
                <div className="text-[8px] text-slate-500">Port B</div>
              </div>
              <div className="bg-amber-50 p-2 rounded border border-amber-200">
                <div className="font-bold text-amber-900">D0</div>
                <div className="text-amber-700 font-extrabold text-xs">{d0}</div>
                <div className="text-[8px] text-slate-500">Port C Low</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: BSR MODE                                                           */}
      {/* ========================================================================= */}
      {activeTab === 'bsr' && (
        <div className="space-y-4">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="font-bold text-xs text-indigo-900 uppercase">Bit Set / Reset (BSR) Mode Configurator (D7 = 0)</span>
              <span className="text-[10px] font-mono text-slate-500">Affects Port C Only</span>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Target Port C Bit (PC0 to PC7)</label>
              <div className="grid grid-cols-8 gap-1">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((b) => (
                  <button
                    key={b}
                    onClick={() => setBsrBit(b)}
                    className={`py-1.5 rounded font-mono font-bold border cursor-pointer transition-all ${
                      bsrBit === b ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    PC{b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Operation Action (D0)</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setBsrSetReset(1)}
                  className={`flex-1 py-1.5 rounded font-bold border cursor-pointer transition-all ${
                    bsrSetReset === 1 ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  SET (Logic 1)
                </button>
                <button
                  onClick={() => setBsrSetReset(0)}
                  className={`flex-1 py-1.5 rounded font-bold border cursor-pointer transition-all ${
                    bsrSetReset === 0 ? 'bg-rose-600 border-rose-600 text-white shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  RESET (Logic 0)
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
            <div className="font-mono text-xs text-slate-700">
              BSR Control Word: <strong className="text-indigo-700 font-bold">{bsrControlWordHex}</strong>
            </div>
            <button
              onClick={handleApplyBSR}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all shadow-xs"
            >
              Execute BSR Action on PC{bsrBit}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: PORT REGISTERS MONITOR                                             */}
      {/* ========================================================================= */}
      {activeTab === 'registers' && (
        <div className="space-y-3">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <div className="font-bold text-indigo-950 text-xs uppercase tracking-wider">8255 Port Register Pin States</div>

            {/* Port A */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5 shadow-2xs">
              <div className="flex justify-between items-center text-[10px]">
                <strong className="text-emerald-800 font-bold">Port A (PA0–PA7)</strong>
                <span className="font-mono text-slate-600 font-semibold">0x{portAVal.toString(16).toUpperCase().padStart(2, '0')}</span>
              </div>
              <div className="grid grid-cols-8 gap-1 font-mono text-center">
                {Array.from({ length: 8 }, (_, i) => {
                  const bit = (portAVal >> (7 - i)) & 1;
                  return (
                    <button
                      key={i}
                      onClick={() => setPortAVal(portAVal ^ (1 << (7 - i)))}
                      className={`py-1.5 rounded font-bold text-[10px] cursor-pointer transition-all ${
                        bit ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      PA{7 - i}: {bit}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Port B */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5 shadow-2xs">
              <div className="flex justify-between items-center text-[10px]">
                <strong className="text-indigo-800 font-bold">Port B (PB0–PB7)</strong>
                <span className="font-mono text-slate-600 font-semibold">0x{portBVal.toString(16).toUpperCase().padStart(2, '0')}</span>
              </div>
              <div className="grid grid-cols-8 gap-1 font-mono text-center">
                {Array.from({ length: 8 }, (_, i) => {
                  const bit = (portBVal >> (7 - i)) & 1;
                  return (
                    <button
                      key={i}
                      onClick={() => setPortBVal(portBVal ^ (1 << (7 - i)))}
                      className={`py-1.5 rounded font-bold text-[10px] cursor-pointer transition-all ${
                        bit ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      PB{7 - i}: {bit}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Port C */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5 shadow-2xs">
              <div className="flex justify-between items-center text-[10px]">
                <strong className="text-amber-800 font-bold">Port C (PC0–PC7)</strong>
                <span className="font-mono text-slate-600 font-semibold">0x{portCVal.toString(16).toUpperCase().padStart(2, '0')}</span>
              </div>
              <div className="grid grid-cols-8 gap-1 font-mono text-center">
                {Array.from({ length: 8 }, (_, i) => {
                  const bit = (portCVal >> (7 - i)) & 1;
                  return (
                    <button
                      key={i}
                      onClick={() => setPortCVal(portCVal ^ (1 << (7 - i)))}
                      className={`py-1.5 rounded font-bold text-[10px] cursor-pointer transition-all ${
                        bit ? 'bg-amber-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
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

      {/* ========================================================================= */}
      {/* TAB 0: FIGURE 1.3 ARCHITECTURE DIAGRAM                                   */}
      {/* ========================================================================= */}
      {activeTab === 'diagram' && (
        <PPI8255ArchitectureDiagram />
      )}

      {/* ========================================================================= */}
      {/* TAB: MODES OF OPERATION                                                   */}
      {/* ========================================================================= */}
      {activeTab === 'modes' && (
        <PPI8255ModesOfOperation />
      )}
    </div>
  );
}
