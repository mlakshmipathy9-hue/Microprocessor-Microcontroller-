import React, { useState } from 'react';
import {
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Info,
  CheckCircle2,
  Cpu,
  Layers,
  HardDrive,
  FileText,
  Sliders,
  Zap,
  Activity,
  Sparkles
} from 'lucide-react';

interface BlockInfo {
  id: string;
  title: string;
  category: 'cpu' | 'memory' | 'ports' | 'control' | 'timers';
  desc: string;
  details: string[];
}

const BLOCK_DATA: Record<string, BlockInfo> = {
  alu: {
    id: 'alu',
    title: 'Arithmetic and Logic Unit (ALU)',
    category: 'cpu',
    desc: 'The 8-bit computational core of the 8051. Executes 8-bit arithmetic, Boolean bitwise manipulation, and BCD conversion.',
    details: [
      'Arithmetic: 8-bit ADD, ADDC, SUBB, INC, DEC, and hardware MUL AB & DIV AB.',
      'Logic: ANL (AND), ORL (OR), XRL (XOR), CLR, CPL (1s complement), RL/RRC (Rotate Left), RR/RRC (Rotate Right), and SWAP nibbles.',
      'Boolean Processor: Direct single-bit ALU engine operating on bit-addressable RAM (20H–2FH) and SFR bits with the Carry flag (C) acting as a 1-bit accumulator.',
      'Connected directly to Accumulator (A), B Register, and updates Program Status Word (PSW).'
    ]
  },
  acc: {
    id: 'acc',
    title: 'Accumulator (A / ACC)',
    category: 'cpu',
    desc: 'Primary 8-bit working register (SFR address E0H, bit-addressable). Default source and destination for almost all ALU operations.',
    details: [
      'Byte Address: E0H | Bit Addresses: E0H to E7H.',
      'Directly feeds input operand 1 to the ALU and receives the computed ALU result.',
      'Implicit register used in instruction opcodes (e.g., ADD A, R0; MOVX A, @DPTR; MOVC A, @A+DPTR).',
      'Provides parity status (P bit) automatically updated in the PSW after every instruction cycle.'
    ]
  },
  b_reg: {
    id: 'b_reg',
    title: 'B Register',
    category: 'cpu',
    desc: 'Special 8-bit math register (SFR address F0H, bit-addressable) used alongside the Accumulator during multiplication and division.',
    details: [
      'Byte Address: F0H | Bit Addresses: F0H to F7H.',
      'Hardware Multiplication (MUL AB): Multiplies 8-bit A by 8-bit B. High-order byte of 16-bit product is placed in B, low-order byte in A. Overflow (OV) is set if B ≠ 0.',
      'Hardware Division (DIV AB): Divides A by B. Quotient is stored in A, Remainder is stored in B.',
      'Can be utilized as a general scratchpad byte register when not performing MUL/DIV operations.'
    ]
  },
  psw: {
    id: 'psw',
    title: 'Program Status Word (PSW Flag Register)',
    category: 'cpu',
    desc: '8-bit status and control register (SFR address D0H, bit-addressable) holding condition flags and Register Bank selection bits.',
    details: [
      'CY (Bit 7 / D7H): Carry Flag set on arithmetic carry out of bit 7 or borrow during subtraction.',
      'AC (Bit 6 / D6H): Auxiliary Carry set on carry from bit 3 to bit 4 (used for BCD / DA A).',
      'F0 (Bit 5 / D5H): General-purpose User Flag 0 available for programmer software flags.',
      'RS1, RS0 (Bits 4, 3 / D4H, D3H): Register Bank selector (Bank 0: 00H–07H, Bank 1: 08H–0FH, Bank 2: 10H–17H, Bank 3: 18H–1FH).',
      'OV (Bit 2 / D2H): Overflow Flag set on 2\'s complement signed overflow during math operations.',
      'P (Bit 0 / D0H): Parity Flag automatically set to 1 if Accumulator has odd number of 1s (odd parity), 0 for even parity.'
    ]
  },
  pc: {
    id: 'pc',
    title: 'Program Counter (PC)',
    category: 'cpu',
    desc: '16-bit dedicated pointer register that holds the memory address of the next instruction byte to be fetched from ROM.',
    details: [
      '16-bit address reach (0000H to FFFFH = 64 KB total program code space).',
      'Automatically increments after fetching each instruction byte.',
      'Reset Vector: Initializes to address 0000H upon hardware RESET pulse on the RST pin.',
      'Modified by branching instructions (LJMP, AJMP, SJMP, JZ, JNZ, CJNE, DJNZ) and subroutine calls/returns (LCALL, ACALL, RET, RETI).'
    ]
  },
  dptr: {
    id: 'dptr',
    title: 'Data Pointer (DPTR: DPH + DPL)',
    category: 'cpu',
    desc: '16-bit register composed of two independent 8-bit SFRs: DPH (83H) and DPL (82H). Used to point to external data RAM and lookup tables in ROM.',
    details: [
      'Byte Addresses: DPL = 82H (Low Byte), DPH = 83H (High Byte). Not bit-addressable.',
      'External RAM Access: Primary pointer for MOVX instructions (e.g., MOVX A, @DPTR and MOVX @DPTR, A) across 64 KB external data memory.',
      'ROM Lookup Tables: Used in indexed addressing with MOVC (e.g., MOVC A, @A+DPTR) for constant tables, 7-segment lookup tables, and ASCII conversion.',
      'Can be incremented using the INC DPTR 1-byte instruction.'
    ]
  },
  rom: {
    id: 'rom',
    title: 'Program ROM (4 KB On-Chip Flash/EPROM)',
    category: 'memory',
    desc: 'Internal non-volatile code memory residing at addresses 0000H to 0FFFH. Holds the compiled machine code instructions.',
    details: [
      'Internal Capacity: 4 KB (0000H to 0FFFH on standard 8051; flash variants like 89C51 have 4 KB/8 KB/16 KB).',
      'E̅A̅ Pin Selection: When E̅A̅ (External Access) is tied to VCC (+5V), code from 0000H–0FFFH is fetched internally, and code above 0FFFH fetches from external ROM. If E̅A̅ is tied to GND, ALL code fetches occur from external memory starting at 0000H.',
      'Interrupt Vector Locations: 0000H (Reset), 0003H (External Interrupt 0 / I̅N̅T̅0̅), 000BH (Timer 0 / TF0), 0013H (External Interrupt 1 / I̅N̅T̅1̅), 001BH (Timer 1 / TF1), 0023H (Serial Port / RI+TI).',
      'Connected to the internal 8-bit Data Bus and accessed via the 16-bit Address Bus.'
    ]
  },
  sfr_ram: {
    id: 'sfr_ram',
    title: 'Special Function Registers (SFR RAM: 80H–FFH)',
    category: 'memory',
    desc: 'Upper memory address block (80H to FFH) providing memory-mapped hardware control and status registers.',
    details: [
      'Address Range: 80H to FFH (128 bytes address space, 21 active registers in standard 8051).',
      'Bit Addressability: Any SFR whose byte address is divisible by 8 (ends with 0H or 8H) is individually bit-addressable (e.g., P0=80H, TCON=88H, P1=90H, SCON=98H, P2=A0H, IE=A8H, P3=B0H, IP=B8H, PSW=D0H, ACC=E0H, B=F0H).',
      'Only accessible via Direct Addressing mode (e.g., MOV A, 80H or MOV P1, #55H).',
      'Directly controls timers, serial communications, interrupt priorities, and I/O port pin states.'
    ]
  },
  internal_ram: {
    id: 'internal_ram',
    title: 'Internal RAM Structure (128 Bytes: 00H–7FH)',
    category: 'memory',
    desc: '128 Bytes of high-speed internal SRAM organized into Register Banks, Bit-Addressable RAM, and Scratchpad RAM.',
    details: [
      'Register Banks (00H–1FH, 32 Bytes): 4 switchable banks (Bank 0, 1, 2, 3), each containing eight 8-bit registers (R0 to R7). Active bank selected by RS1 and RS0 in PSW.',
      'Bit-Addressable RAM (20H–2FH, 16 Bytes): 128 individually addressable bits (bit addresses 00H to 7FH). Ideal for Boolean logic flags and bit variables.',
      'General Purpose Scratchpad RAM (30H–7FH, 80 Bytes): Byte-addressable RAM used for variables, buffer arrays, and user stack.',
      'Stack Pointer (SP): Defaults to address 07H upon reset (placing stack in Bank 1). Programmers typically initialize SP to 30H or higher (e.g., MOV SP, #2FH).'
    ]
  },
  port0: {
    id: 'port0',
    title: 'Port 0 & Latch (Pins 32–39: P0.0–P0.7)',
    category: 'ports',
    desc: 'True bidirectional open-drain 8-bit I/O port at SFR address 80H. Functions as multiplexed low-order Address/Data bus (AD0–AD7) in external memory systems.',
    details: [
      'Open-Drain Structure: Has no internal pull-up FETs. Requires external 10 kΩ pull-up resistor pack when used as general-purpose output port.',
      'Multiplexed Bus (AD0–AD7): In external memory access, outputs low byte address A0–A7 during ALE=1, then switches to bidirectional data bus D0–D7 during R̅D̅/W̅R̅ active.',
      'De-multiplexing: Uses ALE pin with external 74LS373 latch to separate address lines A0–A7 from data lines D0–D7.',
      'Writing 1 to latch configures pins as high-impedance inputs.'
    ]
  },
  port1: {
    id: 'port1',
    title: 'Port 1 & Latch (Pins 1–8: P1.0–P1.7)',
    category: 'ports',
    desc: 'Dedicated 8-bit quasi-bidirectional I/O port at SFR address 90H with built-in internal pull-up resistors.',
    details: [
      'Quasi-Bidirectional: Contains internal pull-up transistors. No external pull-up resistors required for standard logic interfacing.',
      'Pure I/O: Sole port on standard 8051 with no multiplexed alternate bus or memory duties.',
      'Input Configuration: To read external logic from Port 1 pins, software must first write 1 to the port latch (e.g., MOV P1, #0FFH).',
      'Commonly interfaced with LEDs, push-buttons, keypad matrices, LCD data lines, and ADC/DAC converters.'
    ]
  },
  port2: {
    id: 'port2',
    title: 'Port 2 & Latch (Pins 21–28: P2.0–P2.7)',
    category: 'ports',
    desc: '8-bit quasi-bidirectional I/O port at SFR address A0H. Outputs high-order address bus (A8–A15) for external memory systems.',
    details: [
      'Has internal pull-up resistors; operates as general-purpose 8-bit parallel I/O port when external memory is not used.',
      'High-Order Address Bus (A8–A15): In systems interfacing external RAM/ROM (via MOVX @DPTR or external instruction fetch), Port 2 automatically emits the upper address byte A8–A15.',
      'Does not require de-multiplexing latch because upper address remains stable throughout the complete machine cycle.',
      'Writing 1 to port latch enables general input sensing.'
    ]
  },
  port3: {
    id: 'port3',
    title: 'Port 3 & Latch (Pins 10–17: P3.0–P3.7)',
    category: 'ports',
    desc: 'Multi-functional 8-bit port at SFR address B0H with internal pull-ups. Every pin serves crucial alternate timing, interrupt, or control functions.',
    details: [
      'P3.0 (Pin 10): RXD (Serial Data Input for UART).',
      'P3.1 (Pin 11): TXD (Serial Data Output for UART).',
      'P3.2 (Pin 12): I̅N̅T̅0̅ (External Hardware Interrupt 0 input, active-LOW or falling-edge).',
      'P3.3 (Pin 13): I̅N̅T̅1̅ (External Hardware Interrupt 1 input, active-LOW or falling-edge).',
      'P3.4 (Pin 14): T0 (External Clock/Event Input for Timer 0 counter mode).',
      'P3.5 (Pin 15): T1 (External Clock/Event Input for Timer 1 counter mode).',
      'P3.6 (Pin 16): W̅R̅ (External Data RAM Write Strobe, active-LOW).',
      'P3.7 (Pin 17): R̅D̅ (External Data RAM Read Strobe, active-LOW).'
    ]
  },
  system_control: {
    id: 'system_control',
    title: 'System Timing, Interrupts, Timers & Memory Control',
    category: 'control',
    desc: 'The central synchronization engine coordinating clock distribution, bus multiplexing, interrupt arbitrating, and external memory strobes.',
    details: [
      'E̅A̅ / VPP (Pin 31): External Access Enable. Tied to VCC (+5V) for on-chip ROM execution; tied to GND for external ROM.',
      'ALE / P̅R̅O̅G̅ (Pin 30): Address Latch Enable pulses HIGH at 1/6th oscillator frequency to latch A0–A7 from Port 0 into 74LS373.',
      'P̅S̅E̅N̅ (Pin 29): Program Store Enable is the active-LOW read strobe for external Program ROM (connected to O̅E̅ of external ROM).',
      'XTAL1 & XTAL2 (Pins 19, 18): Input/output pins for internal crystal oscillator inverter (typically 11.0592 MHz or 12 MHz with 33 pF capacitors).',
      'RST (Pin 9): Active-HIGH Reset input. Must remain HIGH for at least 2 machine cycles (24 oscillator periods) to initialize the 8051.',
      'VCC (Pin 40, +5V) & GND (Pin 20, 0V): Primary power supply rails.'
    ]
  },
  internal_buses: {
    id: 'internal_buses',
    title: '8-Bit Data/Address Bus & 16-Bit Address Bus',
    category: 'control',
    desc: 'The dual-bus internal interconnect architecture enabling parallel transfers between the ALU, registers, internal RAM, and I/O ports.',
    details: [
      'Internal 8-Bit Data Bus: Carries 8-bit operand data between ALU, ACC, B, PSW, RAM, SFRs, and Port latches.',
      '16-Bit Address Bus: Drives address generation from Program Counter (PC) and Data Pointer (DPTR) to internal ROM and external memory interfaces (Port 0 + Port 2).',
      'Harvard Architecture Separation: Separate physical paths ensure code and data do not contend on the same bus during internal operations.',
      'Bus Buffers: Bidirectional tri-state buffers isolate functional blocks during different clock phases (P1 and P2 of clock states).'
    ]
  }
};

export default function MCU8051SchematicDiagram() {
  const [selectedBlockId, setSelectedBlockId] = useState<string>('alu');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeFilter, setActiveFilter] = useState<'all' | 'cpu' | 'memory' | 'ports' | 'control'>('all');

  const selectedBlock = BLOCK_DATA[selectedBlockId] || BLOCK_DATA.alu;

  const isHighlighted = (category: string) => {
    if (activeFilter === 'all') return true;
    return activeFilter === category;
  };

  const getBlockStroke = (blockId: string, category: string) => {
    if (selectedBlockId === blockId) {
      return '#4f46e5'; // indigo-600 selected
    }
    if (activeFilter !== 'all' && activeFilter !== category) {
      return '#cbd5e1'; // muted
    }
    return '#1e293b'; // sharp crisp slate-800 like engineering drawing
  };

  const getBlockFill = (blockId: string, category: string) => {
    if (selectedBlockId === blockId) {
      return '#e0e7ff'; // indigo-100
    }
    if (activeFilter !== 'all' && activeFilter !== category) {
      return '#f8fafc'; // pale gray
    }
    switch (category) {
      case 'cpu':
        return '#f0fdf4'; // emerald-50 tint
      case 'memory':
        return '#eff6ff'; // blue-50 tint
      case 'ports':
        return '#fffbeb'; // amber-50 tint
      case 'control':
        return '#faf5ff'; // purple-50 tint
      default:
        return '#ffffff';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Control bar with unit filters and zoom */}
      <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-1 bg-indigo-100 text-indigo-700 rounded-md">
            <Cpu className="w-3.5 h-3.5" />
          </span>
          <span className="text-[11px] font-mono font-bold text-slate-700">
            Hardware Schematic
          </span>
        </div>

        {/* Filters & Zoom */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter Pills */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2 py-1 rounded-md font-medium transition-all cursor-pointer ${
                activeFilter === 'all' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Units
            </button>
            <button
              onClick={() => setActiveFilter('cpu')}
              className={`px-2 py-1 rounded-md font-medium transition-all cursor-pointer ${
                activeFilter === 'cpu' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ALU &amp; CPU
            </button>
            <button
              onClick={() => setActiveFilter('memory')}
              className={`px-2 py-1 rounded-md font-medium transition-all cursor-pointer ${
                activeFilter === 'memory' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Memory &amp; SFR
            </button>
            <button
              onClick={() => setActiveFilter('ports')}
              className={`px-2 py-1 rounded-md font-medium transition-all cursor-pointer ${
                activeFilter === 'ports' ? 'bg-white text-amber-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              I/O Ports 0–3
            </button>
            <button
              onClick={() => setActiveFilter('control')}
              className={`px-2 py-1 rounded-md font-medium transition-all cursor-pointer ${
                activeFilter === 'control' ? 'bg-white text-purple-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              System Control
            </button>
          </div>

          {/* Zoom buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.85, prev - 0.1))}
              className="p-1 hover:bg-white text-slate-700 rounded transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono font-bold text-slate-600 px-1">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(1.3, prev + 0.1))}
              className="p-1 hover:bg-white text-slate-700 rounded transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 hover:bg-white text-slate-700 rounded transition cursor-pointer"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Schematic Canvas (Left) + Detail Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Interactive SVG Schematic Canvas */}
        <div className="lg:col-span-8 bg-slate-50/50 rounded-2xl border border-slate-200 p-4 shadow-xs overflow-x-auto flex flex-col items-center">
          <div
            className="transition-transform duration-200 origin-top"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* SVG Engineering Schematic matching the exact uploaded textbook diagram */}
            <svg
              viewBox="0 0 920 660"
              className="w-[900px] h-[640px] select-none font-sans"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Arrow markers */}
                <marker
                  id="arrow-black"
                  markerWidth="8"
                  markerHeight="8"
                  refX="6"
                  refY="4"
                  orient="auto"
                >
                  <path d="M 0 1 L 7 4 L 0 7 z" fill="#1e293b" />
                </marker>
                <marker
                  id="arrow-indigo"
                  markerWidth="8"
                  markerHeight="8"
                  refX="6"
                  refY="4"
                  orient="auto"
                >
                  <path d="M 0 1 L 7 4 L 0 7 z" fill="#4f46e5" />
                </marker>
                <marker
                  id="arrow-both"
                  markerWidth="8"
                  markerHeight="8"
                  refX="4"
                  refY="4"
                  orient="auto"
                >
                  <path d="M 1 4 L 7 1 L 7 7 z" fill="#1e293b" />
                </marker>

                {/* Subtle drop shadow filter for active selection */}
                <filter id="glow-selected" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#6366f1" floodOpacity="0.4" />
                </filter>
              </defs>

              {/* Background canvas panel */}
              <rect x="5" y="5" width="910" height="650" rx="14" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />

              {/* TOP HEADER TITLE INSIDE SVG */}
              <text x="40" y="32" fontSize="13" fontWeight="bold" fill="#334155" fontFamily="monospace">
                INTEL 8051 MICROCONTROLLER INTERNAL ARCHITECTURE
              </text>

              {/* ========================================================================= */}
              {/* 1. INTERCONNECT BUSES (Central Arteries)                                  */}
              {/* ========================================================================= */}

              {/* Central 8-Bit Data and Address Bus (Thick Line) */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedBlockId('internal_buses')}
              >
                <line
                  x1="370"
                  y1="175"
                  x2="550"
                  y2="175"
                  stroke={selectedBlockId === 'internal_buses' ? '#4f46e5' : '#0f172a'}
                  strokeWidth={selectedBlockId === 'internal_buses' ? '5' : '4'}
                />
                <line
                  x1="465"
                  y1="120"
                  x2="465"
                  y2="175"
                  stroke={selectedBlockId === 'internal_buses' ? '#4f46e5' : '#0f172a'}
                  strokeWidth="3.5"
                />
                <line
                  x1="465"
                  y1="175"
                  x2="465"
                  y2="205"
                  stroke={selectedBlockId === 'internal_buses' ? '#4f46e5' : '#0f172a'}
                  strokeWidth="3.5"
                />
                {/* Horizontal main feed to Latches */}
                <line
                  x1="465"
                  y1="175"
                  x2="535"
                  y2="175"
                  stroke={selectedBlockId === 'internal_buses' ? '#4f46e5' : '#0f172a'}
                  strokeWidth="3.5"
                />
                <line
                  x1="535"
                  y1="175"
                  x2="555"
                  y2="175"
                  stroke={selectedBlockId === 'internal_buses' ? '#4f46e5' : '#0f172a'}
                  strokeWidth="3.5"
                />

                {/* Vertical Port distribution bus (feeds Port 0, 1, 2, 3 latches) */}
                <line
                  x1="535"
                  y1="75"
                  x2="535"
                  y2="365"
                  stroke={selectedBlockId === 'internal_buses' ? '#4f46e5' : '#0f172a'}
                  strokeWidth="3.5"
                />
                {/* Branches to Latches */}
                <line x1="535" y1="75" x2="555" y2="75" stroke="#0f172a" strokeWidth="2.5" />
                <line x1="535" y1="175" x2="555" y2="175" stroke="#0f172a" strokeWidth="2.5" />
                <line x1="535" y1="275" x2="555" y2="275" stroke="#0f172a" strokeWidth="2.5" />
                <line x1="535" y1="365" x2="555" y2="365" stroke="#0f172a" strokeWidth="2.5" />

                {/* Bus Label */}
                <rect x="375" y="145" width="135" height="24" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="442" y="161" fontSize="10.5" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  8-Bit Data and Address Bus
                </text>
              </g>

              {/* 16-Bit Address Bus (Lower Left towards Latches / ROM) */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedBlockId('internal_buses')}
              >
                {/* Horizontal lower branch */}
                <line
                  x1="260"
                  y1="310"
                  x2="510"
                  y2="310"
                  stroke={selectedBlockId === 'internal_buses' ? '#4f46e5' : '#0f172a'}
                  strokeWidth="3"
                />
                {/* PC to 16-bit bus */}
                <line x1="260" y1="280" x2="260" y2="310" stroke="#0f172a" strokeWidth="2.5" />
                {/* DPTR to 16-bit bus */}
                <line x1="300" y1="280" x2="300" y2="310" stroke="#0f172a" strokeWidth="2.5" />
                {/* Branch up into ROM */}
                <line x1="405" y1="310" x2="405" y2="280" stroke="#0f172a" strokeWidth="2.5" />
                {/* Extension to Port 2 latch area */}
                <line x1="510" y1="310" x2="510" y2="275" stroke="#0f172a" strokeWidth="2.5" />
                <line x1="510" y1="275" x2="555" y2="275" stroke="#0f172a" strokeWidth="2" strokeDasharray="3 3" />

                {/* 16-Bit Address Bus Label */}
                <rect x="320" y="295" width="120" height="20" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="380" y="309" fontSize="10" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  16-Bit Address Bus
                </text>
              </g>

              {/* Connections from ALU / A / B to bus */}
              {/* ALU to PSW */}
              <line x1="325" y1="75" x2="355" y2="75" stroke="#0f172a" strokeWidth="2.5" />
              {/* PSW to 8-Bit Bus */}
              <line x1="370" y1="95" x2="370" y2="175" stroke="#0f172a" strokeWidth="2.5" />
              {/* A to ALU */}
              <line x1="260" y1="135" x2="260" y2="105" stroke="#0f172a" strokeWidth="2.5" />
              {/* B to ALU */}
              <line x1="300" y1="135" x2="300" y2="105" stroke="#0f172a" strokeWidth="2.5" />
              {/* A/B bus hookup */}
              <line x1="280" y1="175" x2="370" y2="175" stroke="#0f172a" strokeWidth="2.5" />
              <line x1="280" y1="165" x2="280" y2="175" stroke="#0f172a" strokeWidth="2" />
              <line x1="260" y1="165" x2="300" y2="165" stroke="#0f172a" strokeWidth="2" />
              <line x1="260" y1="165" x2="260" y2="175" stroke="#0f172a" strokeWidth="2" />
              <line x1="300" y1="165" x2="300" y2="175" stroke="#0f172a" strokeWidth="2" />

              {/* DPTR to 8-Bit bus */}
              <line x1="370" y1="175" x2="370" y2="225" stroke="#0f172a" strokeWidth="2" />
              <line x1="325" y1="225" x2="370" y2="225" stroke="#0f172a" strokeWidth="2" />

              {/* ========================================================================= */}
              {/* 2. TOP-LEFT: ARITHMETIC & LOGIC UNIT (ALU) & REGISTERS                    */}
              {/* ========================================================================= */}

              {/* Arithmetic and Logic Unit Box */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedBlockId('alu')}
                filter={selectedBlockId === 'alu' ? 'url(#glow-selected)' : undefined}
              >
                <rect
                  x="240"
                  y="45"
                  width="85"
                  height="60"
                  rx="4"
                  fill={getBlockFill('alu', 'cpu')}
                  stroke={getBlockStroke('alu', 'cpu')}
                  strokeWidth={selectedBlockId === 'alu' ? '2.5' : '2'}
                />
                <text x="282.5" y="68" fontSize="10" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  Arithmetic
                </text>
                <text x="282.5" y="80" fontSize="10" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  and
                </text>
                <text x="282.5" y="92" fontSize="10" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  Logic Unit
                </text>
              </g>

              {/* Program Status Word (PSW) */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedBlockId('psw')}
                filter={selectedBlockId === 'psw' ? 'url(#glow-selected)' : undefined}
              >
                <rect
                  x="355"
                  y="55"
                  width="35"
                  height="40"
                  rx="4"
                  fill={getBlockFill('psw', 'cpu')}
                  stroke={getBlockStroke('psw', 'cpu')}
                  strokeWidth={selectedBlockId === 'psw' ? '2.5' : '2'}
                />
                <text x="372.5" y="79" fontSize="11" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  PSW
                </text>
              </g>

              {/* Accumulator (A) */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedBlockId('acc')}
                filter={selectedBlockId === 'acc' ? 'url(#glow-selected)' : undefined}
              >
                <rect
                  x="245"
                  y="135"
                  width="35"
                  height="30"
                  rx="3"
                  fill={getBlockFill('acc', 'cpu')}
                  stroke={getBlockStroke('acc', 'cpu')}
                  strokeWidth={selectedBlockId === 'acc' ? '2.5' : '2'}
                />
                <text x="262.5" y="154" fontSize="12" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  A
                </text>
              </g>

              {/* B Register */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedBlockId('b_reg')}
                filter={selectedBlockId === 'b_reg' ? 'url(#glow-selected)' : undefined}
              >
                <rect
                  x="288"
                  y="135"
                  width="35"
                  height="30"
                  rx="3"
                  fill={getBlockFill('b_reg', 'cpu')}
                  stroke={getBlockStroke('b_reg', 'cpu')}
                  strokeWidth={selectedBlockId === 'b_reg' ? '2.5' : '2'}
                />
                <text x="305.5" y="154" fontSize="12" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  B
                </text>
              </g>

              {/* Program Counter (PC) */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedBlockId('pc')}
                filter={selectedBlockId === 'pc' ? 'url(#glow-selected)' : undefined}
              >
                <rect
                  x="245"
                  y="205"
                  width="35"
                  height="60"
                  rx="3"
                  fill={getBlockFill('pc', 'cpu')}
                  stroke={getBlockStroke('pc', 'cpu')}
                  strokeWidth={selectedBlockId === 'pc' ? '2.5' : '2'}
                />
                <text x="262.5" y="239" fontSize="11" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  PC
                </text>
              </g>

              {/* Data Pointer (DPTR: DPH, DPL) */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedBlockId('dptr')}
                filter={selectedBlockId === 'dptr' ? 'url(#glow-selected)' : undefined}
              >
                <rect
                  x="288"
                  y="205"
                  width="38"
                  height="60"
                  rx="3"
                  fill={getBlockFill('dptr', 'cpu')}
                  stroke={getBlockStroke('dptr', 'cpu')}
                  strokeWidth={selectedBlockId === 'dptr' ? '2.5' : '2'}
                />
                <text x="307" y="222" fontSize="9.5" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  DPTR
                </text>
                <text x="307" y="238" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  DPH
                </text>
                <text x="307" y="253" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  DPL
                </text>
              </g>

              {/* ========================================================================= */}
              {/* 3. CENTER COLUMN: SPECIAL FUNCTION REGISTERS & PROGRAM ROM                */}
              {/* ========================================================================= */}

              {/* Special-Function Registers RAM */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedBlockId('sfr_ram')}
                filter={selectedBlockId === 'sfr_ram' ? 'url(#glow-selected)' : undefined}
              >
                <rect
                  x="440"
                  y="45"
                  width="55"
                  height="65"
                  rx="4"
                  fill={getBlockFill('sfr_ram', 'memory')}
                  stroke={getBlockStroke('sfr_ram', 'memory')}
                  strokeWidth={selectedBlockId === 'sfr_ram' ? '2.5' : '2'}
                />
                <text x="467.5" y="65" fontSize="8.5" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  Special-
                </text>
                <text x="467.5" y="77" fontSize="8.5" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  Function
                </text>
                <text x="467.5" y="89" fontSize="8.5" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  Registers
                </text>
                <text x="467.5" y="101" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  RAM
                </text>
              </g>

              {/* Program ROM */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedBlockId('rom')}
                filter={selectedBlockId === 'rom' ? 'url(#glow-selected)' : undefined}
              >
                <rect
                  x="440"
                  y="205"
                  width="55"
                  height="70"
                  rx="4"
                  fill={getBlockFill('rom', 'memory')}
                  stroke={getBlockStroke('rom', 'memory')}
                  strokeWidth={selectedBlockId === 'rom' ? '2.5' : '2'}
                />
                <text x="467.5" y="244" fontSize="12" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  ROM
                </text>
              </g>

              {/* ========================================================================= */}
              {/* 4. RIGHT COLUMN: 4 PARALLEL I/O PORTS & LATCHES                           */}
              {/* ========================================================================= */}

              {/* PORT 0 Latch & Port */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedBlockId('port0')}
                filter={selectedBlockId === 'port0' ? 'url(#glow-selected)' : undefined}
              >
                {/* Latch */}
                <rect
                  x="555"
                  y="45"
                  width="35"
                  height="60"
                  rx="3"
                  fill={getBlockFill('port0', 'ports')}
                  stroke={getBlockStroke('port0', 'ports')}
                  strokeWidth={selectedBlockId === 'port0' ? '2.5' : '2'}
                />
                <text
                  x="572.5"
                  y="79"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#0f172a"
                  textAnchor="middle"
                  transform="rotate(-90 572.5 75)"
                >
                  Latch
                </text>
                {/* Connecting Line */}
                <line x1="590" y1="75" x2="610" y2="75" stroke="#0f172a" strokeWidth="2.5" />
                {/* Port 0 Block */}
                <rect
                  x="610"
                  y="45"
                  width="35"
                  height="60"
                  rx="3"
                  fill={getBlockFill('port0', 'ports')}
                  stroke={getBlockStroke('port0', 'ports')}
                  strokeWidth={selectedBlockId === 'port0' ? '2.5' : '2'}
                />
                <text
                  x="627.5"
                  y="79"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#0f172a"
                  textAnchor="middle"
                  transform="rotate(-90 627.5 75)"
                >
                  Port 0
                </text>
                {/* Pin lines & labels */}
                <line x1="645" y1="55" x2="665" y2="55" stroke="#0f172a" strokeWidth="1.5" />
                <line x1="645" y1="65" x2="665" y2="65" stroke="#0f172a" strokeWidth="1.5" />
                <line x1="645" y1="75" x2="665" y2="75" stroke="#0f172a" strokeWidth="1.5" />
                <line x1="645" y1="95" x2="665" y2="95" stroke="#0f172a" strokeWidth="1.5" />
                <text x="675" y="58" fontSize="10" fontWeight="bold" fill="#0f172a">
                  I/O
                </text>
                <text x="675" y="74" fontSize="10" fontWeight="bold" fill="#0f172a">
                  A0-A7
                </text>
                <text x="675" y="90" fontSize="10" fontWeight="bold" fill="#0f172a">
                  D0-D7
                </text>
              </g>

              {/* PORT 1 Latch & Port */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedBlockId('port1')}
                filter={selectedBlockId === 'port1' ? 'url(#glow-selected)' : undefined}
              >
                {/* Latch */}
                <rect
                  x="555"
                  y="145"
                  width="35"
                  height="60"
                  rx="3"
                  fill={getBlockFill('port1', 'ports')}
                  stroke={getBlockStroke('port1', 'ports')}
                  strokeWidth={selectedBlockId === 'port1' ? '2.5' : '2'}
                />
                <text
                  x="572.5"
                  y="179"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#0f172a"
                  textAnchor="middle"
                  transform="rotate(-90 572.5 175)"
                >
                  Latch
                </text>
                {/* Connecting Line */}
                <line x1="590" y1="175" x2="610" y2="175" stroke="#0f172a" strokeWidth="2.5" />
                {/* Port 1 Block */}
                <rect
                  x="610"
                  y="145"
                  width="35"
                  height="60"
                  rx="3"
                  fill={getBlockFill('port1', 'ports')}
                  stroke={getBlockStroke('port1', 'ports')}
                  strokeWidth={selectedBlockId === 'port1' ? '2.5' : '2'}
                />
                <text
                  x="627.5"
                  y="179"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#0f172a"
                  textAnchor="middle"
                  transform="rotate(-90 627.5 175)"
                >
                  Port 1
                </text>
                {/* Pin lines & labels */}
                <line x1="645" y1="155" x2="665" y2="155" stroke="#0f172a" strokeWidth="1.5" />
                <line x1="645" y1="165" x2="665" y2="165" stroke="#0f172a" strokeWidth="1.5" />
                <line x1="645" y1="175" x2="665" y2="175" stroke="#0f172a" strokeWidth="1.5" />
                <line x1="645" y1="195" x2="665" y2="195" stroke="#0f172a" strokeWidth="1.5" />
                <text x="675" y="179" fontSize="11" fontWeight="bold" fill="#0f172a">
                  I/O
                </text>
              </g>

              {/* PORT 2 Latch & Port */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedBlockId('port2')}
                filter={selectedBlockId === 'port2' ? 'url(#glow-selected)' : undefined}
              >
                {/* Latch */}
                <rect
                  x="555"
                  y="245"
                  width="35"
                  height="60"
                  rx="3"
                  fill={getBlockFill('port2', 'ports')}
                  stroke={getBlockStroke('port2', 'ports')}
                  strokeWidth={selectedBlockId === 'port2' ? '2.5' : '2'}
                />
                <text
                  x="572.5"
                  y="279"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#0f172a"
                  textAnchor="middle"
                  transform="rotate(-90 572.5 275)"
                >
                  Latch
                </text>
                {/* Connecting Line */}
                <line x1="590" y1="275" x2="610" y2="275" stroke="#0f172a" strokeWidth="2.5" />
                {/* Port 2 Block */}
                <rect
                  x="610"
                  y="245"
                  width="35"
                  height="60"
                  rx="3"
                  fill={getBlockFill('port2', 'ports')}
                  stroke={getBlockStroke('port2', 'ports')}
                  strokeWidth={selectedBlockId === 'port2' ? '2.5' : '2'}
                />
                <text
                  x="627.5"
                  y="279"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#0f172a"
                  textAnchor="middle"
                  transform="rotate(-90 627.5 275)"
                >
                  Port 2
                </text>
                {/* Pin lines & labels */}
                <line x1="645" y1="255" x2="665" y2="255" stroke="#0f172a" strokeWidth="1.5" />
                <line x1="645" y1="265" x2="665" y2="265" stroke="#0f172a" strokeWidth="1.5" />
                <line x1="645" y1="275" x2="665" y2="275" stroke="#0f172a" strokeWidth="1.5" />
                <line x1="645" y1="295" x2="665" y2="295" stroke="#0f172a" strokeWidth="1.5" />
                <text x="675" y="268" fontSize="10" fontWeight="bold" fill="#0f172a">
                  I/O
                </text>
                <text x="675" y="285" fontSize="10" fontWeight="bold" fill="#0f172a">
                  A8-A15
                </text>
              </g>

              {/* PORT 3 Latch & Port */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedBlockId('port3')}
                filter={selectedBlockId === 'port3' ? 'url(#glow-selected)' : undefined}
              >
                {/* Latch */}
                <rect
                  x="555"
                  y="335"
                  width="35"
                  height="60"
                  rx="3"
                  fill={getBlockFill('port3', 'ports')}
                  stroke={getBlockStroke('port3', 'ports')}
                  strokeWidth={selectedBlockId === 'port3' ? '2.5' : '2'}
                />
                <text
                  x="572.5"
                  y="369"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#0f172a"
                  textAnchor="middle"
                  transform="rotate(-90 572.5 365)"
                >
                  Latch
                </text>
                {/* Connecting Line */}
                <line x1="590" y1="365" x2="610" y2="365" stroke="#0f172a" strokeWidth="2.5" />
                {/* Port 3 Block */}
                <rect
                  x="610"
                  y="335"
                  width="35"
                  height="60"
                  rx="3"
                  fill={getBlockFill('port3', 'ports')}
                  stroke={getBlockStroke('port3', 'ports')}
                  strokeWidth={selectedBlockId === 'port3' ? '2.5' : '2'}
                />
                <text
                  x="627.5"
                  y="369"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#0f172a"
                  textAnchor="middle"
                  transform="rotate(-90 627.5 365)"
                >
                  Port 3
                </text>
                {/* Pin lines & labels */}
                <line x1="645" y1="345" x2="665" y2="345" stroke="#0f172a" strokeWidth="1.5" />
                <line x1="645" y1="355" x2="665" y2="355" stroke="#0f172a" strokeWidth="1.5" />
                <line x1="645" y1="365" x2="665" y2="365" stroke="#0f172a" strokeWidth="1.5" />
                <line x1="645" y1="385" x2="665" y2="385" stroke="#0f172a" strokeWidth="1.5" />
                <text x="675" y="342" fontSize="9.5" fontWeight="bold" fill="#0f172a">
                  I/O
                </text>
                <text x="675" y="356" fontSize="9.5" fontWeight="bold" fill="#0f172a">
                  Interrupt
                </text>
                <text x="675" y="370" fontSize="9.5" fontWeight="bold" fill="#0f172a">
                  Counter
                </text>
                <text x="675" y="384" fontSize="9.5" fontWeight="bold" fill="#0f172a">
                  Serial Data
                </text>
                <text x="675" y="398" fontSize="9.5" fontWeight="bold" fill="#0f172a">
                  RD - WR
                </text>
              </g>

              {/* RIGHT VERTICAL TEXT "8 0 5 1  I n t e r n a l  A r c h i t e c t u r e" */}
              <g transform="translate(775, 45)">
                <text x="0" y="35" fontSize="14" fontWeight="bold" fill="#1e293b" letterSpacing="3">
                  8 0 5 1
                </text>
                <text x="8" y="70" fontSize="13" fontWeight="bold" fill="#475569">
                  I
                </text>
                <text x="8" y="95" fontSize="13" fontWeight="bold" fill="#475569">
                  n
                </text>
                <text x="8" y="120" fontSize="13" fontWeight="bold" fill="#475569">
                  t
                </text>
                <text x="8" y="145" fontSize="13" fontWeight="bold" fill="#475569">
                  e
                </text>
                <text x="8" y="170" fontSize="13" fontWeight="bold" fill="#475569">
                  r
                </text>
                <text x="8" y="195" fontSize="13" fontWeight="bold" fill="#475569">
                  n
                </text>
                <text x="8" y="220" fontSize="13" fontWeight="bold" fill="#475569">
                  a
                </text>
                <text x="8" y="245" fontSize="13" fontWeight="bold" fill="#475569">
                  l
                </text>

                <text x="8" y="295" fontSize="13" fontWeight="bold" fill="#475569">
                  A
                </text>
                <text x="8" y="320" fontSize="13" fontWeight="bold" fill="#475569">
                  r
                </text>
                <text x="8" y="345" fontSize="13" fontWeight="bold" fill="#475569">
                  c
                </text>
                <text x="8" y="370" fontSize="13" fontWeight="bold" fill="#475569">
                  h
                </text>
                <text x="8" y="395" fontSize="13" fontWeight="bold" fill="#475569">
                  i
                </text>
                <text x="8" y="420" fontSize="13" fontWeight="bold" fill="#475569">
                  t
                </text>
                <text x="8" y="445" fontSize="13" fontWeight="bold" fill="#475569">
                  e
                </text>
                <text x="8" y="470" fontSize="13" fontWeight="bold" fill="#475569">
                  c
                </text>
                <text x="8" y="495" fontSize="13" fontWeight="bold" fill="#475569">
                  t
                </text>
                <text x="8" y="520" fontSize="13" fontWeight="bold" fill="#475569">
                  u
                </text>
                <text x="8" y="545" fontSize="13" fontWeight="bold" fill="#475569">
                  r
                </text>
                <text x="8" y="570" fontSize="13" fontWeight="bold" fill="#475569">
                  e
                </text>
              </g>

              {/* ========================================================================= */}
              {/* 5. BOTTOM SECTION: SYSTEM TIMING & CONTROL + INTERNAL RAM STRUCTURE       */}
              {/* ========================================================================= */}

              {/* System Timing / Control Box */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedBlockId('system_control')}
                filter={selectedBlockId === 'system_control' ? 'url(#glow-selected)' : undefined}
              >
                {/* External Pin Lines on Left */}
                {/* E̅A̅ */}
                <line x1="215" y1="410" x2="245" y2="410" stroke="#0f172a" strokeWidth="1.5" />
                <text x="210" y="413" fontSize="9.5" fontWeight="bold" fill="#0f172a" textAnchor="end">
                  EA
                </text>
                <line x1="195" y1="403" x2="210" y2="403" stroke="#0f172a" strokeWidth="1.2" />

                {/* ALE */}
                <line x1="215" y1="428" x2="245" y2="428" stroke="#0f172a" strokeWidth="1.5" />
                <text x="210" y="432" fontSize="9.5" fontWeight="bold" fill="#0f172a" textAnchor="end">
                  ALE
                </text>

                {/* PSEN */}
                <line x1="215" y1="446" x2="245" y2="446" stroke="#0f172a" strokeWidth="1.5" />
                <text x="210" y="450" fontSize="9.5" fontWeight="bold" fill="#0f172a" textAnchor="end">
                  PSEN
                </text>
                <line x1="183" y1="440" x2="210" y2="440" stroke="#0f172a" strokeWidth="1.2" />

                {/* XTAL1 */}
                <line x1="215" y1="464" x2="245" y2="464" stroke="#0f172a" strokeWidth="1.5" />
                <text x="210" y="468" fontSize="9.5" fontWeight="bold" fill="#0f172a" textAnchor="end">
                  XTAL1
                </text>

                {/* XTAL2 */}
                <line x1="215" y1="482" x2="245" y2="482" stroke="#0f172a" strokeWidth="1.5" />
                <text x="210" y="486" fontSize="9.5" fontWeight="bold" fill="#0f172a" textAnchor="end">
                  XTAL2
                </text>

                {/* RESET */}
                <line x1="215" y1="500" x2="245" y2="500" stroke="#0f172a" strokeWidth="1.5" />
                <text x="210" y="504" fontSize="9.5" fontWeight="bold" fill="#0f172a" textAnchor="end">
                  RESET
                </text>

                {/* Vcc */}
                <line x1="215" y1="535" x2="245" y2="535" stroke="#0f172a" strokeWidth="1.5" />
                <text x="210" y="539" fontSize="9.5" fontWeight="bold" fill="#0f172a" textAnchor="end">
                  Vcc
                </text>

                {/* GND */}
                <line x1="215" y1="555" x2="245" y2="555" stroke="#0f172a" strokeWidth="1.5" />
                <text x="210" y="559" fontSize="9.5" fontWeight="bold" fill="#0f172a" textAnchor="end">
                  GND
                </text>

                {/* Main Box */}
                <rect
                  x="245"
                  y="395"
                  width="78"
                  height="175"
                  rx="4"
                  fill={getBlockFill('system_control', 'control')}
                  stroke={getBlockStroke('system_control', 'control')}
                  strokeWidth={selectedBlockId === 'system_control' ? '2.5' : '2'}
                />
                <text x="284" y="420" fontSize="9.5" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  System
                </text>
                <text x="284" y="433" fontSize="9.5" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  Timing
                </text>

                <text x="284" y="460" fontSize="9.5" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  System
                </text>
                <text x="284" y="473" fontSize="9.5" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  Interrupts
                </text>
                <text x="284" y="486" fontSize="9.5" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  Timers
                </text>

                <text x="284" y="518" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  Data Buffers
                </text>
                <text x="284" y="535" fontSize="8.5" fontStyle="italic" fill="#475569" textAnchor="middle">
                  Memory Control
                </text>
              </g>

              {/* Dashed line connecting System Control to Port 3 */}
              <path
                d="M 284 570 L 284 620 L 627.5 620 L 627.5 395"
                fill="none"
                stroke="#0f172a"
                strokeWidth="2"
                strokeDasharray="6 4"
              />

              {/* INTERNAL RAM STRUCTURE (Register Banks + Special Function Registers) */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedBlockId('internal_ram')}
                filter={selectedBlockId === 'internal_ram' ? 'url(#glow-selected)' : undefined}
              >
                {/* 1. Left Sub-Column: Register Banks & Bit-Addresses */}
                {/* Byte/Bit Addresses Header */}
                <rect
                  x="350"
                  y="395"
                  width="55"
                  height="60"
                  rx="3"
                  fill={getBlockFill('internal_ram', 'memory')}
                  stroke={getBlockStroke('internal_ram', 'memory')}
                  strokeWidth="1.8"
                />
                <text x="377.5" y="420" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  Byte/Bit
                </text>
                <text x="377.5" y="433" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  Addresses
                </text>

                {/* Register Bank 3 */}
                <rect
                  x="350"
                  y="455"
                  width="55"
                  height="50"
                  rx="0"
                  fill="#ffffff"
                  stroke="#1e293b"
                  strokeWidth="1.8"
                />
                <text x="377.5" y="478" fontSize="8.5" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  Register
                </text>
                <text x="377.5" y="490" fontSize="8.5" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  Bank 3
                </text>

                {/* Register Bank 2 */}
                <rect
                  x="350"
                  y="505"
                  width="55"
                  height="50"
                  rx="0"
                  fill="#ffffff"
                  stroke="#1e293b"
                  strokeWidth="1.8"
                />
                <text x="377.5" y="528" fontSize="8.5" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  Register
                </text>
                <text x="377.5" y="540" fontSize="8.5" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  Bank 2
                </text>

                {/* Register Bank 1 */}
                <rect
                  x="350"
                  y="555"
                  width="55"
                  height="50"
                  rx="0"
                  fill="#ffffff"
                  stroke="#1e293b"
                  strokeWidth="1.8"
                />
                <text x="377.5" y="578" fontSize="8.5" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  Register
                </text>
                <text x="377.5" y="590" fontSize="8.5" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  Bank 1
                </text>

                {/* Register Bank 0 */}
                <rect
                  x="350"
                  y="605"
                  width="55"
                  height="45"
                  rx="0"
                  fill="#ffffff"
                  stroke="#1e293b"
                  strokeWidth="1.8"
                />
                <text x="377.5" y="625" fontSize="8.5" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  Register
                </text>
                <text x="377.5" y="637" fontSize="8.5" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  Bank 0
                </text>

                {/* 2. Right Sub-Column: Special-Function Registers Table */}
                {/* Special-Function Registers Header */}
                <rect
                  x="430"
                  y="395"
                  width="55"
                  height="60"
                  rx="3"
                  fill={getBlockFill('internal_ram', 'memory')}
                  stroke={getBlockStroke('internal_ram', 'memory')}
                  strokeWidth="1.8"
                />
                <text x="457.5" y="420" fontSize="8.5" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  Special-
                </text>
                <text x="457.5" y="432" fontSize="8.5" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  Function
                </text>
                <text x="457.5" y="444" fontSize="8.5" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  Registers
                </text>

                {/* IE */}
                <rect x="430" y="455" width="55" height="19" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                <text x="457.5" y="468" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  IE
                </text>

                {/* IP */}
                <rect x="430" y="474" width="55" height="19" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                <text x="457.5" y="487" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  IP
                </text>

                {/* PCON */}
                <rect x="430" y="493" width="55" height="19" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                <text x="457.5" y="506" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  PCON
                </text>

                {/* SBUF */}
                <rect x="430" y="512" width="55" height="19" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                <text x="457.5" y="525" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  SBUF
                </text>

                {/* SCON */}
                <rect x="430" y="531" width="55" height="19" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                <text x="457.5" y="544" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  SCON
                </text>

                {/* TCON */}
                <rect x="430" y="550" width="55" height="19" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                <text x="457.5" y="563" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  TCON
                </text>

                {/* TMOD */}
                <rect x="430" y="569" width="55" height="19" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                <text x="457.5" y="582" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  TMOD
                </text>

                {/* TL0 */}
                <rect x="430" y="588" width="55" height="17" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                <text x="457.5" y="600" fontSize="8.5" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  TL0
                </text>

                {/* TH0 */}
                <rect x="430" y="605" width="55" height="17" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                <text x="457.5" y="617" fontSize="8.5" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  TH0
                </text>

                {/* TL1 */}
                <rect x="430" y="622" width="55" height="16" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                <text x="457.5" y="634" fontSize="8.5" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  TL1
                </text>

                {/* TH1 */}
                <rect x="430" y="638" width="55" height="16" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                <text x="457.5" y="650" fontSize="8.5" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  TH1
                </text>

                {/* Subtitle Caption */}
                <text x="417.5" y="655" fontSize="10" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  Internal RAM Structure
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* Right: Detailed Hardware Inspector Panel */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            {/* Header / Active block indicator */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                    Active Component Inspector
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 leading-tight">
                    {selectedBlock.title}
                  </h4>
                </div>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border capitalize ${
                  selectedBlock.category === 'cpu'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : selectedBlock.category === 'memory'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : selectedBlock.category === 'ports'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-purple-50 text-purple-700 border-purple-200'
                }`}
              >
                {selectedBlock.category} unit
              </span>
            </div>

            {/* Description summary */}
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              {selectedBlock.desc}
            </p>

            {/* In-depth syllabus breakdown */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider block">
                Technical Specifications &amp; Syllabus Points:
              </span>
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {selectedBlock.details.map((point, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-xs bg-slate-50/70 p-2.5 rounded-lg border border-slate-100 text-slate-700"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
                    <span className="leading-snug">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Quick Select Strip */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase">
              Quick Select Block:
            </span>
            <div className="flex flex-wrap gap-1">
              {Object.keys(BLOCK_DATA).map(key => {
                const b = BLOCK_DATA[key];
                const isCur = selectedBlockId === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedBlockId(key)}
                    className={`px-2 py-1 text-[10.5px] rounded font-mono font-medium transition cursor-pointer ${
                      isCur
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                    }`}
                  >
                    {b.title.split('(')[0].trim().slice(0, 14)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
