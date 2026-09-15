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
  Zap,
  Radio,
  Sliders,
  Sparkles,
  ArrowRight,
  Split
} from 'lucide-react';

interface FamilyBlockInfo {
  id: string;
  title: string;
  category: 'cpu' | 'memory' | 'timers' | 'ports' | 'interrupts';
  desc: string;
  specs: {
    part8051: string;
    part8052: string;
    part8031: string;
    part8751_80750?: string;
  };
  details: string[];
}

const FAMILY_BLOCKS: Record<string, FamilyBlockInfo> = {
  cpu: {
    id: 'cpu',
    title: '8-Bit CPU (Central Processing Unit)',
    category: 'cpu',
    desc: 'The central arithmetic and control processing engine that coordinates all instruction fetching, decoding, execution, and bus arbitration across the entire 8051 family.',
    specs: {
      part8051: '8-bit ALU, Accumulator (A), B Register, PC (16-bit), DPTR (16-bit)',
      part8052: 'Identical 8-bit instruction set & register architecture + extra SFR controls',
      part8031: 'Identical 8-bit CPU core, requires external ROM for all execution',
      part8751_80750: 'Identical 8-bit core architecture with on-chip EPROM / OTP ROM'
    },
    details: [
      'Executes byte-oriented and bit-oriented (Boolean processor) instructions.',
      'Connects directly to the bidirectional internal bus to communicate with on-chip ROM, RAM, I/O ports, and serial controller.',
      'Driven by the on-chip oscillator clock generator connected to external quartz crystal.',
      'Coordinates with the Interrupt block to service hardware and software vector routines.'
    ]
  },
  rom: {
    id: 'rom',
    title: 'On-Chip Program ROM (Code Memory)',
    category: 'memory',
    desc: 'Internal non-volatile memory storing application firmware and machine code. The 8051 family variants are primarily distinguished by their on-chip ROM capacity and technology.',
    specs: {
      part8051: '4 KB on-chip Mask ROM / Flash (addresses 0000H to 0FFFH)',
      part8052: '8 KB on-chip ROM / Flash (addresses 0000H to 1FFFH)',
      part8031: 'None (ROMless) – all instruction fetching MUST come from external ROM (EA# tied to GND)',
      part8751_80750: '4 KB / 8 KB UV-erasable EPROM or One-Time Programmable (OTP) ROM'
    },
    details: [
      '8051 has 4 KB on-chip ROM, expandable up to 64 KB total program memory.',
      '8052 doubles internal ROM to 8 KB, accommodating larger embedded firmware without external memory chips.',
      '8031 contains NO on-chip ROM; EA# (pin 31) must be tied to GND (0V), forcing CPU to fetch code from external EPROM/Flash via Port 0 (AD0–AD7) and Port 2 (A8–A15).',
      'Interrupt vectors reside in lower ROM: 0003H (INT0), 000BH (T0), 0013H (INT1), 001BH (T1), 0023H (UART), 002BH (T2 on 8052).'
    ]
  },
  ram: {
    id: 'ram',
    title: 'Internal Data RAM (Scratchpad Memory)',
    category: 'memory',
    desc: 'High-speed on-chip SRAM for variables, register banks, bit flags, and the system stack. Capacity scales significantly between 8051, 8052, and specialized derivatives.',
    specs: {
      part8051: '128 Bytes internal RAM (00H to 7FH) + 128 Bytes SFR space (80H to FFH)',
      part8052: '256 Bytes internal RAM (00H to FFH: lower 128B direct/indirect, upper 128B indirect only) + SFRs',
      part8031: '128 Bytes internal RAM (identical to standard 8051)',
      part8751_80750: '64 Bytes to 128 Bytes depending on specific low-cost mask derivative'
    },
    details: [
      '8051 (128 Bytes): 00H–1FH (4 Register Banks R0–R7), 20H–2FH (128 bit-addressable locations), 30H–7FH (80 bytes general scratchpad/stack).',
      '8052 (256 Bytes): Adds upper 128 bytes (80H–FFH) accessible strictly via indirect addressing (@R0, @R1) to coexist with Special Function Registers (which use direct addressing).',
      '8031 provides the standard 128 bytes internal RAM.',
      'Derivatives like 80750/80C51 family variants may feature 64 bytes for ultra-compact microcontroller footprints.'
    ]
  },
  timers: {
    id: 'timers',
    title: 'Timers / Counters (Timer 0, Timer 1, Timer 2)',
    category: 'timers',
    desc: 'Hardware 16-bit timer/counter blocks used for precise time delays, external pulse counting, and UART baud rate generation. Timer 2 is the premier enhancement of the 8052.',
    specs: {
      part8051: '2 Timers/Counters: Timer 0 & Timer 1 (16-bit, TL0/TH0, TL1/TH1)',
      part8052: '3 Timers/Counters: Timer 0, Timer 1, PLUS 16-bit Timer 2 (RCAP2L/RCAP2H, auto-reload & capture)',
      part8031: '2 Timers/Counters: Timer 0 & Timer 1 (same as 8051)',
      part8751_80750: '2 Timers/Counters: Timer 0 & Timer 1'
    },
    details: [
      'Counter Inputs: External event pulses arrive via pin T0 (P3.4) and pin T1 (P3.5). Timer 2 in 8052 has external pin T2 (P1.0) and T2EX (P1.1).',
      'Timer 0 & Timer 1: Configured via TMOD (89H) and TCON (88H). Support Mode 0 (13-bit), Mode 1 (16-bit), Mode 2 (8-bit auto-reload for UART), and Mode 3 (split timer).',
      'Timer 2 (8052 Exclusive): Dedicated 16-bit timer with auto-reload, capture mode, and dedicated high-baud UART clock generator using T2CON (C8H).',
      'Feeds timer overflow interrupt flags (TF0, TF1, TF2) directly into the Interrupt controller.'
    ]
  },
  interrupts: {
    id: 'interrupts',
    title: 'Interrupt Controller Unit',
    category: 'interrupts',
    desc: 'Arbitrates internal timer/serial interrupt requests and external hardware interrupt pins, pausing CPU execution to jump to dedicated vector addresses.',
    specs: {
      part8051: '5 Interrupt sources (2 external, 2 timer, 1 serial) with 2 priority levels',
      part8052: '6 Interrupt sources (2 external, 3 timer including Timer 2, 1 serial) with 2 priority levels',
      part8031: '5 Interrupt sources (identical to 8051)',
      part8751_80750: '5 Interrupt sources'
    },
    details: [
      'External Interrupts: Active-LOW level or falling-edge sensitive pins INT0# (P3.2) and INT1# (P3.3).',
      'Timer Interrupts: Overflow flags TF0, TF1 (and TF2 on 8052) automatically trigger ISR vector jumps.',
      'Serial Interrupts: Logical OR of RI (Receive Interrupt) and TI (Transmit Interrupt) from UART.',
      'Controlled by IE (Interrupt Enable, A8H) and IP (Interrupt Priority, B8H) SFR registers.'
    ]
  },
  io_ports: {
    id: 'io_ports',
    title: 'Four 8-Bit Parallel I/O Ports (P0, P1, P2, P3)',
    category: 'ports',
    desc: 'Provides 32 bidirectional I/O pins for interfacing with the external environment, peripherals, displays, and external memory buses.',
    specs: {
      part8051: '4 Ports (P0, P1, P2, P3) = 32 programmable pins',
      part8052: '4 Ports (P0, P1, P2, P3); P1.0 and P1.1 have alternate Timer 2 functions (T2 & T2EX)',
      part8031: '4 Ports; P0 & P2 permanently dedicated to external bus (AD0–AD7, A8–A15) for ROM',
      part8751_80750: '4 Ports (32 pins)'
    },
    details: [
      'Port 0 (80H): Open-drain bidirectional bus; multiplexes low-order address/data (AD0–AD7).',
      'Port 1 (90H): Quasi-bidirectional port with internal pull-ups. Pure I/O on 8051; handles T2/T2EX on 8052.',
      'Port 2 (A0H): Quasi-bidirectional port; emits high-order address bus (A8–A15) for external memory.',
      'Port 3 (B0H): Quasi-bidirectional port; provides alternate functions (RXD, TXD, INT0#, INT1#, T0, T1, WR#, RD#).'
    ]
  },
  serial_port: {
    id: 'serial_port',
    title: 'Full-Duplex Serial Port (UART)',
    category: 'ports',
    desc: 'On-chip asynchronous serial receiver/transmitter supporting multi-processor communications, modem interfaces, and RS-232 / USB communication.',
    specs: {
      part8051: 'Full-duplex UART with SBUF (99H) & SCON (98H); baud rates from Timer 1 Mode 2',
      part8052: 'Full-duplex UART; can use Timer 1 OR Timer 2 for baud rate generation',
      part8031: 'Identical full-duplex UART',
      part8751_80750: 'Identical full-duplex UART'
    },
    details: [
      'RXD (P3.0): Receives serial data bitstream with hardware start/stop/parity check.',
      'TXD (P3.1): Transmits serialized data from SBUF.',
      'Modes: Mode 0 (synchronous shift register at f_osc/12), Mode 1 (8-bit UART variable baud), Mode 2 (9-bit UART at fixed f_osc/32 or f_osc/64), Mode 3 (9-bit variable baud).',
      'Double-buffered receive register prevents overrun during active reception.'
    ]
  },
  bus_control: {
    id: 'bus_control',
    title: 'Bus Control Unit',
    category: 'ports',
    desc: 'Decodes CPU memory cycle requests and asserts external control strobes (ALE, PSEN#, RD#, WR#) to multiplex and demultiplex off-chip data/address buses.',
    specs: {
      part8051: 'ALE (Address Latch Enable), PSEN# (Program Store Enable), EA# (External Access)',
      part8052: 'Identical bus control timings and pinouts',
      part8031: 'Continuously active ALE and PSEN# since all instruction execution occurs externally',
      part8751_80750: 'Identical bus control'
    },
    details: [
      'ALE: Pulses at 1/6 oscillator frequency to latch address A0–A7 from Port 0 into 74LS373.',
      'PSEN#: Active-LOW read strobe for external Program ROM.',
      'RD# (P3.7) & WR# (P3.6): Read and write strobes for external Data RAM.',
      'EA#: Tied to +5V for internal ROM execution; tied to GND to force external ROM fetch.'
    ]
  },
  oscillator: {
    id: 'oscillator',
    title: 'On-Chip Clock Oscillator & Crystal',
    category: 'cpu',
    desc: 'High-frequency inverting amplifier circuit driven by an external quartz crystal to generate internal two-phase clock pulses (P1 and P2).',
    specs: {
      part8051: 'Typically 11.0592 MHz or 12 MHz crystal with two 33 pF capacitors',
      part8052: '12 MHz to 24 MHz depending on CMOS/NMOS process',
      part8031: 'Typically 11.0592 MHz (standard for precise baud rates)',
      part8751_80750: '12 MHz standard clock'
    },
    details: [
      'Connected across XTAL1 (pin 19) and XTAL2 (pin 18).',
      '1 Machine Cycle = 6 Clock States (S1–S6) = 12 Oscillator Clock Periods.',
      'At 12 MHz, 1 machine cycle = 1.0 microsecond.',
      'At 11.0592 MHz, allows exact UART baud rate division for 9600, 19200, 57600 baud with zero rounding error.'
    ]
  }
};

export default function MCU8051FamilyDiagram() {
  const [selectedBlockId, setSelectedBlockId] = useState<string>('rom');
  const [activePartFilter, setActivePartFilter] = useState<'all' | '8051' | '8052' | '8031' | '80750'>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const selectedBlock = FAMILY_BLOCKS[selectedBlockId] || FAMILY_BLOCKS.rom;

  return (
    <div className="flex flex-col gap-4">
      {/* Control bar with variant filters and zoom */}
      <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Variant filter buttons and Zoom */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
            <span className="px-2 py-1 text-[10px] font-mono text-slate-400 font-bold uppercase">
              Highlight Variant:
            </span>
            <button
              onClick={() => setActivePartFilter('all')}
              className={`px-2 py-1 rounded-md font-medium transition cursor-pointer ${
                activePartFilter === 'all'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Variants
            </button>
            <button
              onClick={() => setActivePartFilter('8051')}
              className={`px-2 py-1 rounded-md font-medium transition cursor-pointer ${
                activePartFilter === '8051'
                  ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              8051 (4K/128B)
            </button>
            <button
              onClick={() => setActivePartFilter('8052')}
              className={`px-2 py-1 rounded-md font-medium transition cursor-pointer ${
                activePartFilter === '8052'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              8052 (8K/256B/Timer 2)
            </button>
            <button
              onClick={() => setActivePartFilter('8031')}
              className={`px-2 py-1 rounded-md font-medium transition cursor-pointer ${
                activePartFilter === '8031'
                  ? 'bg-white text-purple-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              8031 (ROMless)
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

      {/* Main Grid: SVG Diagram (Left) + Family Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: SVG Diagram Matching Exact Image */}
        <div className="lg:col-span-8 bg-slate-50/50 rounded-2xl border border-slate-200 p-4 shadow-xs overflow-x-auto flex flex-col items-center">
          <div
            className="transition-transform duration-200 origin-top"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <svg
              viewBox="0 0 880 620"
              className="w-[860px] h-[600px] select-none font-sans"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <marker
                  id="fam-arrow-down"
                  markerWidth="8"
                  markerHeight="8"
                  refX="4"
                  refY="7"
                  orient="auto"
                >
                  <polygon points="0 0, 8 0, 4 7" fill="#1e293b" />
                </marker>
                <marker
                  id="fam-arrow-up"
                  markerWidth="8"
                  markerHeight="8"
                  refX="4"
                  refY="1"
                  orient="auto"
                >
                  <polygon points="0 7, 8 7, 4 0" fill="#1e293b" />
                </marker>
                <marker
                  id="fam-arrow-left"
                  markerWidth="8"
                  markerHeight="8"
                  refX="1"
                  refY="4"
                  orient="auto"
                >
                  <polygon points="7 0, 7 8, 0 4" fill="#1e293b" />
                </marker>
                <marker
                  id="fam-arrow-right"
                  markerWidth="8"
                  markerHeight="8"
                  refX="7"
                  refY="4"
                  orient="auto"
                >
                  <polygon points="0 0, 0 8, 7 4" fill="#1e293b" />
                </marker>

                {/* Shading gradients for 3D card appearance like uploaded textbook */}
                <linearGradient id="metal-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="40%" stopColor="#f1f5f9" />
                  <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>

                <linearGradient id="selected-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="30%" stopColor="#e0e7ff" />
                  <stop offset="100%" stopColor="#c7d2fe" />
                </linearGradient>

                <filter id="fam-glow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#3b82f6" floodOpacity="0.35" />
                </filter>
              </defs>

              {/* Outside IC boundary package */}
              <rect
                x="80"
                y="60"
                width="640"
                height="390"
                rx="6"
                fill="#fafafa"
                stroke="#1e293b"
                strokeWidth="2.5"
              />

              {/* ========================================================================= */}
              {/* EXTERNAL INTERRUPT INPUTS (Top Left into Interrupts block)               */}
              {/* ========================================================================= */}
              <g>
                <text x="135" y="30" fontSize="12" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  external
                </text>
                <text x="135" y="44" fontSize="12" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  interrupts
                </text>
                {/* Arrow 1 */}
                <line x1="120" y1="50" x2="120" y2="100" stroke="#0f172a" strokeWidth="2" markerEnd="url(#fam-arrow-down)" />
                {/* Arrow 2 */}
                <line x1="140" y1="50" x2="140" y2="100" stroke="#0f172a" strokeWidth="2" markerEnd="url(#fam-arrow-down)" />
              </g>

              {/* ========================================================================= */}
              {/* 1. INTERRUPTS BLOCK                                                       */}
              {/* ========================================================================= */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedBlockId('interrupts')}
                filter={selectedBlockId === 'interrupts' ? 'url(#fam-glow)' : undefined}
              >
                <rect
                  x="98"
                  y="105"
                  width="115"
                  height="75"
                  rx="3"
                  fill={selectedBlockId === 'interrupts' ? 'url(#selected-grad)' : 'url(#metal-grad)'}
                  stroke={selectedBlockId === 'interrupts' ? '#4f46e5' : '#1e293b'}
                  strokeWidth={selectedBlockId === 'interrupts' ? '2.5' : '1.8'}
                />
                <text x="155.5" y="148" fontSize="14" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  Interrupts
                </text>
              </g>

              {/* ========================================================================= */}
              {/* 2. CPU BLOCK                                                              */}
              {/* ========================================================================= */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedBlockId('cpu')}
                filter={selectedBlockId === 'cpu' ? 'url(#fam-glow)' : undefined}
              >
                {/* Connection between Interrupts and CPU (bidirectional vertical line) */}
                <line x1="155" y1="180" x2="155" y2="210" stroke="#0f172a" strokeWidth="2" markerEnd="url(#fam-arrow-down)" markerStart="url(#fam-arrow-up)" />

                <rect
                  x="98"
                  y="215"
                  width="115"
                  height="75"
                  rx="3"
                  fill={selectedBlockId === 'cpu' ? 'url(#selected-grad)' : 'url(#metal-grad)'}
                  stroke={selectedBlockId === 'cpu' ? '#4f46e5' : '#1e293b'}
                  strokeWidth={selectedBlockId === 'cpu' ? '2.5' : '1.8'}
                />
                <text x="155.5" y="258" fontSize="15" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  CPU
                </text>
              </g>

              {/* ========================================================================= */}
              {/* 3. OSCILLATOR & CRYSTAL BLOCK                                             */}
              {/* ========================================================================= */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedBlockId('oscillator')}
                filter={selectedBlockId === 'oscillator' ? 'url(#fam-glow)' : undefined}
              >
                {/* Connection between CPU and Oscillator */}
                <line x1="155" y1="290" x2="155" y2="320" stroke="#0f172a" strokeWidth="2" markerEnd="url(#fam-arrow-down)" markerStart="url(#fam-arrow-up)" />

                {/* Oscillator inside chip */}
                <rect
                  x="110"
                  y="325"
                  width="90"
                  height="65"
                  rx="3"
                  fill="#ffffff"
                  stroke={selectedBlockId === 'oscillator' ? '#4f46e5' : '#1e293b'}
                  strokeWidth={selectedBlockId === 'oscillator' ? '2.5' : '1.8'}
                />
                <text x="155" y="362" fontSize="13" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  oscillator
                </text>

                {/* Lines out to external crystal */}
                <line x1="135" y1="390" x2="135" y2="475" stroke="#0f172a" strokeWidth="2" />
                <line x1="175" y1="390" x2="175" y2="475" stroke="#0f172a" strokeWidth="2" />

                {/* External Crystal Block */}
                <rect
                  x="110"
                  y="475"
                  width="90"
                  height="50"
                  rx="3"
                  fill={selectedBlockId === 'oscillator' ? 'url(#selected-grad)' : 'url(#metal-grad)'}
                  stroke={selectedBlockId === 'oscillator' ? '#4f46e5' : '#1e293b'}
                  strokeWidth={selectedBlockId === 'oscillator' ? '2.5' : '1.8'}
                />
                <text x="155" y="505" fontSize="14" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  Crystal
                </text>
              </g>

              {/* ========================================================================= */}
              {/* 4. CENTRAL INTERNAL BUS                                                   */}
              {/* ========================================================================= */}
              {/* CPU large arrow pointing into internal bus */}
              <polygon
                points="213,252.5 228,240 228,246 235,246 235,259 228,259 228,265"
                fill="#ffffff"
                stroke="#1e293b"
                strokeWidth="1.5"
              />

              {/* Main internal bus hollow bar */}
              <g>
                <rect
                  x="235"
                  y="238"
                  width="470"
                  height="28"
                  rx="3"
                  fill="#ffffff"
                  stroke="#1e293b"
                  strokeWidth="2"
                />
                <text x="470" y="256" fontSize="13" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  internal bus
                </text>
              </g>

              {/* ========================================================================= */}
              {/* 5. TOP MEMORY BLOCKS: ROM & RAM WITH VARIANT TABLES                      */}
              {/* ========================================================================= */}

              {/* ROM Block */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedBlockId('rom')}
                filter={selectedBlockId === 'rom' ? 'url(#fam-glow)' : undefined}
              >
                <rect
                  x="280"
                  y="85"
                  width="105"
                  height="105"
                  rx="3"
                  fill={selectedBlockId === 'rom' ? 'url(#selected-grad)' : '#f8fafc'}
                  stroke={selectedBlockId === 'rom' ? '#2563eb' : '#1e293b'}
                  strokeWidth={selectedBlockId === 'rom' ? '2.5' : '1.8'}
                />
                <text x="332.5" y="108" fontSize="13" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  ROM
                </text>
                <text
                  x="332.5"
                  y="128"
                  fontSize="11.5"
                  fontWeight={activePartFilter === '8051' ? 'bold' : 'normal'}
                  fill={activePartFilter === '8051' ? '#16a34a' : '#0f172a'}
                  textAnchor="middle"
                >
                  8051-4K
                </text>
                <text
                  x="332.5"
                  y="148"
                  fontSize="11.5"
                  fontWeight={activePartFilter === '8052' ? 'bold' : 'normal'}
                  fill={activePartFilter === '8052' ? '#2563eb' : '#0f172a'}
                  textAnchor="middle"
                >
                  8052-8K
                </text>
                <text
                  x="332.5"
                  y="168"
                  fontSize="11.5"
                  fontWeight={activePartFilter === '8031' ? 'bold' : 'normal'}
                  fill={activePartFilter === '8031' ? '#9333ea' : '#0f172a'}
                  textAnchor="middle"
                >
                  8031-none
                </text>

                {/* Hollow downward arrow from ROM into internal bus */}
                <polygon
                  points="324,190 341,190 341,222 349,222 332.5,238 316,222 324,222"
                  fill="#ffffff"
                  stroke="#1e293b"
                  strokeWidth="1.8"
                />
              </g>

              {/* RAM Block */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedBlockId('ram')}
                filter={selectedBlockId === 'ram' ? 'url(#fam-glow)' : undefined}
              >
                <rect
                  x="420"
                  y="85"
                  width="110"
                  height="105"
                  rx="3"
                  fill={selectedBlockId === 'ram' ? 'url(#selected-grad)' : '#f8fafc'}
                  stroke={selectedBlockId === 'ram' ? '#2563eb' : '#1e293b'}
                  strokeWidth={selectedBlockId === 'ram' ? '2.5' : '1.8'}
                />
                <text x="475" y="108" fontSize="13" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  RAM
                </text>
                <text
                  x="475"
                  y="128"
                  fontSize="11.5"
                  fontWeight={activePartFilter === '8051' ? 'bold' : 'normal'}
                  fill={activePartFilter === '8051' ? '#16a34a' : '#0f172a'}
                  textAnchor="middle"
                >
                  8051-128
                </text>
                <text
                  x="475"
                  y="148"
                  fontSize="11.5"
                  fontWeight={activePartFilter === '8052' ? 'bold' : 'normal'}
                  fill={activePartFilter === '8052' ? '#2563eb' : '#0f172a'}
                  textAnchor="middle"
                >
                  8052-256
                </text>
                <text
                  x="475"
                  y="168"
                  fontSize="11.5"
                  fontWeight={activePartFilter === '80750' ? 'bold' : 'normal'}
                  fill={activePartFilter === '80750' ? '#ea580c' : '#0f172a'}
                  textAnchor="middle"
                >
                  80750-64
                </text>

                {/* Hollow bidirectional vertical arrow between RAM and internal bus */}
                <polygon
                  points="466,198 474.5,190 483,198 478.5,198 478.5,230 483,230 474.5,238 466,230 470.5,230 470.5,198"
                  fill="#ffffff"
                  stroke="#1e293b"
                  strokeWidth="1.8"
                />
              </g>

              {/* Signals from RAM/ROM and Timers to Interrupts */}
              {/* Bus signal taps from ROM and RAM routing over to Interrupts */}
              <g stroke="#1e293b" strokeWidth="1.5" fill="none">
                {/* Path from Timer 0/1 area into Interrupts */}
                <path d="M 545 130 L 220 130 L 213 130" markerEnd="url(#fam-arrow-left)" />
                <path d="M 545 150 L 225 150 L 213 150" markerEnd="url(#fam-arrow-left)" />
                <path d="M 545 170 L 230 170 L 213 170" markerEnd="url(#fam-arrow-left)" />
                <path d="M 230 200 L 213 180" markerEnd="url(#fam-arrow-left)" />
              </g>

              {/* ========================================================================= */}
              {/* 6. TIMERS & COUNTERS (Upper Right)                                        */}
              {/* ========================================================================= */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedBlockId('timers')}
                filter={selectedBlockId === 'timers' ? 'url(#fam-glow)' : undefined}
              >
                {/* Timer 2 (8052 Exclusive) */}
                <rect
                  x="560"
                  y="70"
                  width="110"
                  height="36"
                  fill={activePartFilter === '8052' ? '#dbeafe' : '#ffffff'}
                  stroke="#1e293b"
                  strokeWidth="1.8"
                />
                <text x="615" y="93" fontSize="12.5" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  timer 2
                </text>
                <text x="660" y="80" fontSize="8" fontWeight="bold" fill="#2563eb">
                  (8052)
                </text>

                {/* Timer 1 */}
                <rect
                  x="560"
                  y="106"
                  width="110"
                  height="36"
                  fill="url(#metal-grad)"
                  stroke="#1e293b"
                  strokeWidth="1.8"
                />
                <text x="615" y="129" fontSize="12.5" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  Timer 1
                </text>

                {/* Timer 0 */}
                <rect
                  x="560"
                  y="142"
                  width="110"
                  height="38"
                  fill="url(#metal-grad)"
                  stroke="#1e293b"
                  strokeWidth="1.8"
                />
                <text x="615" y="166" fontSize="12.5" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  Timer 0
                </text>

                {/* Counter Inputs from right margin */}
                <line x1="710" y1="88" x2="670" y2="88" stroke="#0f172a" strokeWidth="2" markerEnd="url(#fam-arrow-left)" />
                <line x1="710" y1="124" x2="670" y2="124" stroke="#0f172a" strokeWidth="2" markerEnd="url(#fam-arrow-left)" />
                <line x1="710" y1="161" x2="670" y2="161" stroke="#0f172a" strokeWidth="2" markerEnd="url(#fam-arrow-left)" />

                <text x="735" y="120" fontSize="13" fontWeight="bold" fill="#0f172a">
                  counter
                </text>
                <text x="735" y="136" fontSize="13" fontWeight="bold" fill="#0f172a">
                  inputs
                </text>

                {/* Hollow bidirectional arrow from Timers down to internal bus */}
                <polygon
                  points="606,188 615,180 624,188 619.5,188 619.5,230 624,230 615,238 606,230 610.5,230 610.5,188"
                  fill="#ffffff"
                  stroke="#1e293b"
                  strokeWidth="1.8"
                />
              </g>

              {/* ========================================================================= */}
              {/* 7. LOWER SECTION: BUS CONTROL, I/O PORT, SERIAL PORT                     */}
              {/* ========================================================================= */}

              {/* Bus Control */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedBlockId('bus_control')}
                filter={selectedBlockId === 'bus_control' ? 'url(#fam-glow)' : undefined}
              >
                {/* Hollow arrow from internal bus into bus control */}
                <polygon
                  points="292,266 312,266 312,298 320,298 302,314 284,298 292,298"
                  fill="#ffffff"
                  stroke="#1e293b"
                  strokeWidth="1.8"
                />

                <rect
                  x="270"
                  y="318"
                  width="65"
                  height="65"
                  rx="3"
                  fill="#ffffff"
                  stroke={selectedBlockId === 'bus_control' ? '#4f46e5' : '#1e293b'}
                  strokeWidth={selectedBlockId === 'bus_control' ? '2.5' : '1.8'}
                />
                <text x="302.5" y="346" fontSize="12.5" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  bus
                </text>
                <text x="302.5" y="362" fontSize="12.5" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  control
                </text>

                {/* Control lines between bus control and I/O Port */}
                <path d="M 335 340 L 355 345" stroke="#0f172a" strokeWidth="1.8" />
                <path d="M 335 360 L 355 365" stroke="#0f172a" strokeWidth="1.8" />
              </g>

              {/* I/O Port Block */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedBlockId('io_ports')}
                filter={selectedBlockId === 'io_ports' ? 'url(#fam-glow)' : undefined}
              >
                {/* Hollow bidirectional arrow from internal bus to I/O Port */}
                <polygon
                  points="456,274 465,266 474,274 469.5,274 469.5,310 474,310 465,318 456,310 460.5,310 460.5,274"
                  fill="#ffffff"
                  stroke="#1e293b"
                  strokeWidth="1.8"
                />

                <rect
                  x="355"
                  y="318"
                  width="200"
                  height="65"
                  rx="3"
                  fill={selectedBlockId === 'io_ports' ? 'url(#selected-grad)' : 'url(#metal-grad)'}
                  stroke={selectedBlockId === 'io_ports' ? '#4f46e5' : '#1e293b'}
                  strokeWidth={selectedBlockId === 'io_ports' ? '2.5' : '1.8'}
                />
                <text x="455" y="356" fontSize="15" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  I/O Port
                </text>
              </g>

              {/* Serial Port Block */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedBlockId('serial_port')}
                filter={selectedBlockId === 'serial_port' ? 'url(#fam-glow)' : undefined}
              >
                {/* Hollow bidirectional arrow from internal bus to Serial Port */}
                <polygon
                  points="621,274 630,266 639,274 634.5,274 634.5,310 639,310 630,318 621,310 625.5,310 625.5,274"
                  fill="#ffffff"
                  stroke="#1e293b"
                  strokeWidth="1.8"
                />

                <rect
                  x="575"
                  y="318"
                  width="110"
                  height="65"
                  rx="3"
                  fill={selectedBlockId === 'serial_port' ? 'url(#selected-grad)' : 'url(#metal-grad)'}
                  stroke={selectedBlockId === 'serial_port' ? '#4f46e5' : '#1e293b'}
                  strokeWidth={selectedBlockId === 'serial_port' ? '2.5' : '1.8'}
                />
                <text x="630" y="346" fontSize="14" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  Serial
                </text>
                <text x="630" y="364" fontSize="14" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  Port
                </text>
              </g>

              {/* ========================================================================= */}
              {/* 8. EXTERNAL PORT PINS & BUS ARROWS (Bottom)                               */}
              {/* ========================================================================= */}

              {/* Label address/data on the left of ports */}
              <text x="360" y="440" fontSize="13" fontWeight="bold" fill="#0f172a" textAnchor="end">
                address/data
              </text>

              {/* Port 0 Arrow */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedBlockId('io_ports')}
              >
                <polygon
                  points="382,383 392,383 392,442 399,442 387,458 375,442 382,442"
                  fill="#ffffff"
                  stroke="#1e293b"
                  strokeWidth="1.8"
                />
                <text
                  x="387"
                  y="420"
                  fontSize="11"
                  fontWeight="bold"
                  fill="#0f172a"
                  textAnchor="middle"
                  transform="rotate(-90 387 415)"
                >
                  P0
                </text>
              </g>

              {/* Port 2 Arrow */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedBlockId('io_ports')}
              >
                <polygon
                  points="427,383 437,383 437,442 444,442 432,458 420,442 427,442"
                  fill="#ffffff"
                  stroke="#1e293b"
                  strokeWidth="1.8"
                />
                <text
                  x="432"
                  y="420"
                  fontSize="11"
                  fontWeight="bold"
                  fill="#0f172a"
                  textAnchor="middle"
                  transform="rotate(-90 432 415)"
                >
                  P2
                </text>
              </g>

              {/* Port 1 Arrow */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedBlockId('io_ports')}
              >
                <polygon
                  points="472,383 482,383 482,442 489,442 477,458 465,442 472,442"
                  fill="#ffffff"
                  stroke="#1e293b"
                  strokeWidth="1.8"
                />
                <text
                  x="477"
                  y="420"
                  fontSize="11"
                  fontWeight="bold"
                  fill="#0f172a"
                  textAnchor="middle"
                  transform="rotate(-90 477 415)"
                >
                  P1
                </text>
              </g>

              {/* Port 3 Arrow */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedBlockId('io_ports')}
              >
                <polygon
                  points="517,383 527,383 527,442 534,442 522,458 510,442 517,442"
                  fill="#ffffff"
                  stroke="#1e293b"
                  strokeWidth="1.8"
                />
                <text
                  x="522"
                  y="420"
                  fontSize="11"
                  fontWeight="bold"
                  fill="#0f172a"
                  textAnchor="middle"
                  transform="rotate(-90 522 415)"
                >
                  P3
                </text>
              </g>

              {/* RXD & TXD Pins below Serial Port */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedBlockId('serial_port')}
              >
                {/* RXD input arrow (up into chip) */}
                <line x1="605" y1="440" x2="605" y2="385" stroke="#0f172a" strokeWidth="2" markerEnd="url(#fam-arrow-up)" />
                <text x="605" y="460" fontSize="13" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  RXD
                </text>

                {/* TXD output arrow (down out of chip) */}
                <line x1="655" y1="385" x2="655" y2="440" stroke="#0f172a" strokeWidth="2" markerEnd="url(#fam-arrow-down)" />
                <text x="655" y="460" fontSize="13" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                  TXD
                </text>
              </g>

              {/* ========================================================================= */}
              {/* 9. BOTTOM FIGURE CAPTION                                                  */}
              {/* ========================================================================= */}
              <text x="440" y="555" fontSize="18" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                8051 Family internal architecture¹⁰
              </text>
            </svg>
          </div>
        </div>

        {/* Right: Technical Inspector & Variant Breakdown */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                    Family Architecture Inspector
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 leading-tight">
                    {selectedBlock.title}
                  </h4>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200 capitalize">
                {selectedBlock.category}
              </span>
            </div>

            {/* Overview */}
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              {selectedBlock.desc}
            </p>

            {/* 8051 Family Variant Comparison Table */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider block">
                8051 Family Specifications Matrix:
              </span>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200 text-xs">
                <div className={`p-2.5 flex items-start justify-between gap-2 ${activePartFilter === '8051' ? 'bg-emerald-50/70 font-semibold' : 'bg-white'}`}>
                  <span className="font-bold text-slate-800 shrink-0 font-mono">8051:</span>
                  <span className="text-slate-600 text-right">{selectedBlock.specs.part8051}</span>
                </div>
                <div className={`p-2.5 flex items-start justify-between gap-2 ${activePartFilter === '8052' ? 'bg-blue-50/70 font-semibold' : 'bg-slate-50/50'}`}>
                  <span className="font-bold text-blue-800 shrink-0 font-mono">8052:</span>
                  <span className="text-slate-600 text-right">{selectedBlock.specs.part8052}</span>
                </div>
                <div className={`p-2.5 flex items-start justify-between gap-2 ${activePartFilter === '8031' ? 'bg-purple-50/70 font-semibold' : 'bg-white'}`}>
                  <span className="font-bold text-purple-800 shrink-0 font-mono">8031:</span>
                  <span className="text-slate-600 text-right">{selectedBlock.specs.part8031}</span>
                </div>
                {selectedBlock.specs.part8751_80750 && (
                  <div className={`p-2.5 flex items-start justify-between gap-2 ${activePartFilter === '80750' ? 'bg-amber-50/70 font-semibold' : 'bg-slate-50/50'}`}>
                    <span className="font-bold text-amber-800 shrink-0 font-mono">80750 / 8751:</span>
                    <span className="text-slate-600 text-right">{selectedBlock.specs.part8751_80750}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bullet Points */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider block">
                Hardware &amp; Interconnect Details:
              </span>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {selectedBlock.details.map((pt, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-xs bg-slate-50/70 p-2.5 rounded-lg border border-slate-100 text-slate-700"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                    <span className="leading-snug">{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Select Buttons */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase">
              Quick Select Module:
            </span>
            <div className="flex flex-wrap gap-1">
              {Object.keys(FAMILY_BLOCKS).map(key => {
                const b = FAMILY_BLOCKS[key];
                const isCur = selectedBlockId === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedBlockId(key)}
                    className={`px-2 py-1 text-[10.5px] rounded font-mono font-medium transition cursor-pointer ${
                      isCur
                        ? 'bg-blue-600 text-white font-bold'
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
