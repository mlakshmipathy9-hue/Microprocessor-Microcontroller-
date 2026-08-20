import React, { useState } from 'react';
import { Layers, Zap, Info, CheckCircle2, Sliders, ArrowRight, Eye, RefreshCw, Cpu, ShieldCheck } from 'lucide-react';

interface PPI8255ArchitectureDiagramProps {
  onSelectBlock?: (blockId: string) => void;
}

export default function PPI8255ArchitectureDiagram({ onSelectBlock }: PPI8255ArchitectureDiagramProps) {
  const [selectedBlock, setSelectedBlock] = useState<string>('data_bus_buffer');
  const [animating, setAnimating] = useState<boolean>(true);

  const blockDetails: Record<string, {
    title: string;
    category: string;
    color: string;
    pins: string[];
    description: string;
    keyPoints: string[];
  }> = {
    data_bus_buffer: {
      title: 'Data Bus Buffer (8-Bit Bi-Directional)',
      category: 'System Bus Interface',
      color: 'emerald',
      pins: ['D7 – D0 (Pins 27–34)'],
      description: 'Tri-state 8-bit bidirectional buffer that interfaces the internal 8255 8-bit data bus to the 8086 system data bus. It transmits data, control words, and reads status information.',
      keyPoints: [
        'Active only during valid CPU read (RD#=0) or write (WR#=0) cycles with CS#=0',
        'Remains in high-impedance (High-Z) tristate when CS# is HIGH (deselected)',
        'Driven directly by internal read/write control logic'
      ]
    },
    rw_control_logic: {
      title: 'Read/Write Control Logic',
      category: 'Internal Control & Timing',
      color: 'emerald',
      pins: ['RD# (Pin 5)', 'WR# (Pin 36)', 'A1 (Pin 8)', 'A0 (Pin 9)', 'RESET (Pin 35)', 'CS# (Pin 6)'],
      description: 'Manages all internal read and write operations. Decodes address pins A0, A1, and control strobes to route data between system data bus and internal port registers.',
      keyPoints: [
        'CS# = 0 enables 8255 communication; CS# = 1 isolates 8255 from system bus',
        'A1, A0 = 00 (Port A), 01 (Port B), 10 (Port C), 11 (Control Register)',
        'RESET pulses HIGH to clear all internal registers and set all 24 I/O pins into Mode 0 Input state'
      ]
    },
    group_a_control: {
      title: 'Group A Control Unit',
      category: 'Group A Controller',
      color: 'emerald',
      pins: ['Internal control lines to Port A and Port C Upper'],
      description: 'Decodes control words written to the 8255 control register and configures Group A ports (Port A & Port C Upper) into Mode 0 (Basic I/O), Mode 1 (Strobed I/O), or Mode 2 (Bi-directional Bus).',
      keyPoints: [
        'Controls 8-bit Port A (PA7–PA0) and 4-bit Port C Upper (PC7–PC4)',
        'Supports all three operating modes: Mode 0, Mode 1, and Mode 2',
        'Generates handshake timing for strobed I/O operations'
      ]
    },
    group_b_control: {
      title: 'Group B Control Unit',
      category: 'Group B Controller',
      color: 'emerald',
      pins: ['Internal control lines to Port B and Port C Lower'],
      description: 'Decodes control words written to the 8255 control register and configures Group B ports (Port B & Port C Lower) into Mode 0 (Basic I/O) or Mode 1 (Strobed I/O).',
      keyPoints: [
        'Controls 8-bit Port B (PB7–PB0) and 4-bit Port C Lower (PC3–PC0)',
        'Supports Mode 0 (Basic I/O) and Mode 1 (Strobed I/O) only; does NOT support Mode 2',
        'Manages Port B handshaking signals (STB_B#, IBF_B, INTR_B) via Port C Lower'
      ]
    },
    port_a: {
      title: 'Group A Port A (8-Bit I/O)',
      category: 'Group A Port',
      color: 'pink',
      pins: ['PA7 – PA0 (Pins 37–40, 1–4)'],
      description: '8-bit data output latch/buffer and data input latch. Highly versatile port that can operate in Mode 0 (Simple I/O), Mode 1 (Strobed Handshake I/O), or Mode 2 (8-bit Bidirectional Bus).',
      keyPoints: [
        'Mode 0: Simple unlatched input or latched output',
        'Mode 1: Latched input/output with handshaking on Port C Upper lines',
        'Mode 2: 8-bit bidirectional bus using PC7–PC3 for handshake (PC7=OBF#, PC6=ACK#, PC5=IBF, PC4=STB#, PC3=INTR)'
      ]
    },
    port_c_upper: {
      title: 'Group A Port C Upper (4-Bit I/O)',
      category: 'Group A Port',
      color: 'pink',
      pins: ['PC7 – PC4 (Pins 10–13)'],
      description: '4-bit port associated with Group A. In Mode 0, it acts as a simple 4-bit input or output port. In Mode 1 and Mode 2, these pins serve as dedicated handshake control signals for Port A.',
      keyPoints: [
        'PC7 = OBF_A# (Output Buffer Full) / general I/O',
        'PC6 = ACK_A# (Acknowledge input) / general I/O',
        'PC5 = IBF_A (Input Buffer Full) / general I/O',
        'PC4 = STB_A# (Strobe input) / general I/O',
        'Supports individual bit set/reset via BSR Mode (D7=0 in control word)'
      ]
    },
    port_c_lower: {
      title: 'Group B Port C Lower (4-Bit I/O)',
      category: 'Group B Port',
      color: 'amber',
      pins: ['PC3 – PC0 (Pins 17, 16, 15, 14)'],
      description: '4-bit port associated with Group B. In Mode 0, functions as a 4-bit nibble I/O port. In Mode 1, provides handshake control signals for Port B.',
      keyPoints: [
        'PC3 = INTR_A (Port A Interrupt Request in Mode 1/2) or general I/O',
        'PC2 = STB_B# / ACK_B# (Strobe/Acknowledge for Port B)',
        'PC1 = IBF_B / OBF_B# (Buffer Full indicator for Port B)',
        'PC0 = INTR_B (Port B Interrupt Request in Mode 1)',
        'Independently manipulatable via BSR (Bit Set/Reset) commands'
      ]
    },
    port_b: {
      title: 'Group B Port B (8-Bit I/O)',
      category: 'Group B Port',
      color: 'amber',
      pins: ['PB7 – PB0 (Pins 25–18)'],
      description: '8-bit data input/output latch/buffer for peripheral communication. Operates in Mode 0 (Basic I/O) or Mode 1 (Strobed Handshake I/O).',
      keyPoints: [
        'Mode 0: Unlatched 8-bit input or latched 8-bit output',
        'Mode 1: Latched input/output using PC0–PC2 for handshake lines',
        'Does NOT support Mode 2 bidirectional operation'
      ]
    },
    internal_bus: {
      title: '8-Bit Internal Data Bus',
      category: 'Internal Highway',
      color: 'indigo',
      pins: ['Internal 8-bit parallel bus lines'],
      description: 'High-speed internal communication backbone connecting the Data Bus Buffer, Group A & B Control Units, and all three I/O ports (Ports A, B, and C).',
      keyPoints: [
        'Facilitates rapid bidirectional transfer of 8-bit operands and control bytes',
        'Directs control words from CPU into Group A & B registers',
        'Routes peripheral inputs into Data Bus Buffer for CPU read cycles'
      ]
    },
    power_supplies: {
      title: 'Power Supplies (+5V & GND)',
      category: 'Power Rails',
      color: 'slate',
      pins: ['VCC (Pin 26 = +5V DC)', 'GND (Pin 7 = 0V Reference)'],
      description: 'Provides regulated +5V DC operating voltage and system ground reference for the entire 8255 NMOS/CMOS integrated circuit.',
      keyPoints: [
        'VCC: +5V ± 10% DC power supply rail',
        'GND: 0V common ground return connection',
        'Low static power consumption in standby state'
      ]
    }
  };

  const handleBlockClick = (blockId: string) => {
    setSelectedBlock(blockId);
    if (onSelectBlock) onSelectBlock(blockId);
  };

  const currentInfo = blockDetails[selectedBlock] || blockDetails.data_bus_buffer;

  return (
    <div className="bg-white text-slate-800 p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4 font-sans text-xs">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-amber-700">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              Intel 8255 Internal Architecture Diagram
            </h3>
            <p className="text-[11px] text-slate-500">
              Clean architectural block diagram cropped to highlight core functional blocks &amp; signal interconnects
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAnimating(!animating)}
            className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              animating
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${animating ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
            {animating ? 'Signal Flow: Active' : 'Signal Flow: Paused'}
          </button>
        </div>
      </div>

      {/* Main Diagram Area & Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* SVG Diagram Canvas (Col 8) */}
        <div className="lg:col-span-8 bg-[#F9F7EE] rounded-2xl border-2 border-[#6E5A2D] p-2 sm:p-3 shadow-inner relative overflow-hidden flex flex-col items-center justify-center">
          <div className="w-full max-w-[800px] aspect-[820/540]">
            <svg
              viewBox="0 0 820 540"
              className="w-full h-full select-none"
              style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            >
              <defs>
                {/* Marker Arrow heads */}
                <marker id="arrow-black" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <polygon points="0 0, 6 3, 0 6" fill="#1E293B" />
                </marker>
                <marker id="arrow-purple" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <polygon points="0 0, 6 3, 0 6" fill="#4338CA" />
                </marker>
                <marker id="arrow-purple-start" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto">
                  <polygon points="6 0, 0 3, 6 6" fill="#4338CA" />
                </marker>

                {/* Flow Animation dashes */}
                {animating && (
                  <style>{`
                    @keyframes dashFlow {
                      to {
                        stroke-dashoffset: -20;
                      }
                    }
                    .animated-flow {
                      stroke-dasharray: 4 3;
                      animation: dashFlow 1.2s linear infinite;
                    }
                  `}</style>
                )}
              </defs>

              {/* Outer Diagram Border Box */}
              <rect
                x="15"
                y="15"
                width="790"
                height="510"
                fill="#FAF7EE"
                stroke="#6B5927"
                strokeWidth="1.5"
                rx="4"
              />

              {/* ============================================================ */}
              {/* TOP-LEFT: POWER SUPPLIES                                     */}
              {/* ============================================================ */}
              <g
                className="cursor-pointer transition-transform hover:opacity-90"
                onClick={() => handleBlockClick('power_supplies')}
              >
                <text x="75" y="65" fontSize="11" fontWeight="600" fill="#1E293B" textAnchor="end">
                  Power
                </text>
                <text x="75" y="80" fontSize="11" fontWeight="600" fill="#1E293B" textAnchor="end">
                  Supplies
                </text>

                {/* Bracket */}
                <path
                  d="M 85 55 L 95 55 L 95 72 L 98 72 L 95 72 L 95 90 L 85 90"
                  fill="none"
                  stroke="#1E293B"
                  strokeWidth="1.5"
                />

                {/* +5V and GND labels & arrows */}
                <path d="M 105 60 L 155 60" fill="none" stroke="#1E293B" strokeWidth="1.5" markerEnd="url(#arrow-black)" />
                <text x="170" y="63" fontSize="11" fontWeight="bold" fill="#B91C1C">+ 5 V</text>

                <path d="M 105 84 L 155 84" fill="none" stroke="#1E293B" strokeWidth="1.5" markerEnd="url(#arrow-black)" />
                <text x="170" y="87" fontSize="11" fontWeight="bold" fill="#1E293B">GND</text>
              </g>

              {/* ============================================================ */}
              {/* LEFT COLUMN: CPU INTERFACE BUS                               */}
              {/* ============================================================ */}

              {/* Bi-directional Data Bus D7 - D0 Label & Arrow */}
              <g>
                <text x="75" y="195" fontSize="10.5" fontWeight="600" fill="#1E293B" textAnchor="middle">
                  Bi-directional
                </text>
                <text x="75" y="209" fontSize="10.5" fontWeight="600" fill="#1E293B" textAnchor="middle">
                  data bus
                </text>
                <text x="75" y="235" fontSize="11" fontWeight="bold" fill="#1E293B" textAnchor="middle">
                  D7 - D0
                </text>

                {/* Thick Bi-directional Arrow to Data Bus Buffer */}
                <polygon
                  points="50,220 60,214 60,218 100,218 100,214 110,220 100,226 100,222 60,222 60,226"
                  fill="#93C5FD"
                  stroke="#1E40AF"
                  strokeWidth="1"
                />
              </g>

              {/* Block 1: Data Bus Buffer */}
              <g
                className="cursor-pointer transition-all hover:brightness-95"
                onClick={() => handleBlockClick('data_bus_buffer')}
              >
                <rect
                  x="115"
                  y="180"
                  width="65"
                  height="70"
                  fill={selectedBlock === 'data_bus_buffer' ? '#A7F3D0' : '#D1FAE5'}
                  stroke={selectedBlock === 'data_bus_buffer' ? '#047857' : '#059669'}
                  strokeWidth={selectedBlock === 'data_bus_buffer' ? '2.5' : '1.5'}
                  rx="3"
                />
                <text x="147" y="210" fontSize="11" fontWeight="bold" fill="#065F46" textAnchor="middle">
                  Data
                </text>
                <text x="147" y="224" fontSize="11" fontWeight="bold" fill="#065F46" textAnchor="middle">
                  bus
                </text>
                <text x="147" y="238" fontSize="11" fontWeight="bold" fill="#065F46" textAnchor="middle">
                  buffer
                </text>
              </g>

              {/* Arrow from Data Bus Buffer to Internal Bus */}
              <polygon
                points="180,220 190,215 190,218 360,218 360,215 370,220 360,225 360,222 190,222 190,225"
                fill="#A5B4FC"
                stroke="#4338CA"
                strokeWidth="1"
              />

              {/* Control Inputs on Left of Read/Write Logic */}
              <g>
                {/* RD# */}
                <text x="35" y="340" fontSize="11" fontWeight="bold" fill="#1E293B">RD</text>
                <line x1="35" y1="330" x2="52" y2="330" stroke="#1E293B" strokeWidth="1.5" />
                <path d="M 55 337 L 115 337" fill="none" stroke="#1E293B" strokeWidth="1.2" markerEnd="url(#arrow-black)" />

                {/* WR# */}
                <text x="32" y="365" fontSize="11" fontWeight="bold" fill="#1E293B">WR</text>
                <line x1="32" y1="355" x2="53" y2="355" stroke="#1E293B" strokeWidth="1.5" />
                <path d="M 55 362 L 115 362" fill="none" stroke="#1E293B" strokeWidth="1.2" markerEnd="url(#arrow-black)" />

                {/* A1 */}
                <text x="42" y="388" fontSize="11" fontWeight="bold" fill="#1E293B">A1</text>
                <path d="M 60 385 L 115 385" fill="none" stroke="#1E293B" strokeWidth="1.2" markerEnd="url(#arrow-black)" />

                {/* A0 */}
                <text x="42" y="413" fontSize="11" fontWeight="bold" fill="#1E293B">A0</text>
                <path d="M 60 410 L 115 410" fill="none" stroke="#1E293B" strokeWidth="1.2" markerEnd="url(#arrow-black)" />

                {/* Reset */}
                <text x="25" y="438" fontSize="10.5" fontWeight="bold" fill="#1E293B">Reset</text>
                <path d="M 60 435 L 115 435" fill="none" stroke="#1E293B" strokeWidth="1.2" markerEnd="url(#arrow-black)" />

                {/* CS# at bottom */}
                <text x="38" y="500" fontSize="11" fontWeight="bold" fill="#1E293B">CS</text>
                <line x1="38" y1="490" x2="53" y2="490" stroke="#1E293B" strokeWidth="1.5" />
                <path
                  d="M 56 497 L 147 497 L 147 480"
                  fill="none"
                  stroke="#1E293B"
                  strokeWidth="1.2"
                  markerEnd="url(#arrow-black)"
                />
              </g>

              {/* Block 2: Read/Write Control Logic */}
              <g
                className="cursor-pointer transition-all hover:brightness-95"
                onClick={() => handleBlockClick('rw_control_logic')}
              >
                <rect
                  x="115"
                  y="280"
                  width="65"
                  height="195"
                  fill={selectedBlock === 'rw_control_logic' ? '#A7F3D0' : '#D1FAE5'}
                  stroke={selectedBlock === 'rw_control_logic' ? '#047857' : '#059669'}
                  strokeWidth={selectedBlock === 'rw_control_logic' ? '2.5' : '1.5'}
                  rx="3"
                />
                <text x="147" y="360" fontSize="10.5" fontWeight="bold" fill="#065F46" textAnchor="middle">
                  Read/
                </text>
                <text x="147" y="375" fontSize="10.5" fontWeight="bold" fill="#065F46" textAnchor="middle">
                  Write
                </text>
                <text x="147" y="390" fontSize="10.5" fontWeight="bold" fill="#065F46" textAnchor="middle">
                  Control
                </text>
                <text x="147" y="405" fontSize="10.5" fontWeight="bold" fill="#065F46" textAnchor="middle">
                  Logic
                </text>
              </g>

              {/* Interconnecting Control Traces from Read/Write Logic */}
              {/* To Data Bus Buffer */}
              <path
                d="M 147 280 L 147 250"
                fill="none"
                stroke="#047857"
                strokeWidth="1.5"
                markerEnd="url(#arrow-black)"
                className={animating ? 'animated-flow' : ''}
              />

              {/* To Group A Control */}
              <path
                d="M 180 330 L 210 330 L 210 90 L 230 90"
                fill="none"
                stroke="#047857"
                strokeWidth="1.5"
                markerEnd="url(#arrow-black)"
                className={animating ? 'animated-flow' : ''}
              />

              {/* To Group B Control */}
              <path
                d="M 180 430 L 230 430"
                fill="none"
                stroke="#047857"
                strokeWidth="1.5"
                markerEnd="url(#arrow-black)"
                className={animating ? 'animated-flow' : ''}
              />

              {/* ============================================================ */}
              {/* CENTER COLUMN: GROUP CONTROLLERS & 8-BIT INTERNAL BUS        */}
              {/* ============================================================ */}

              {/* Block 3: Group A Control */}
              <g
                className="cursor-pointer transition-all hover:brightness-95"
                onClick={() => handleBlockClick('group_a_control')}
              >
                <rect
                  x="230"
                  y="50"
                  width="65"
                  height="80"
                  fill={selectedBlock === 'group_a_control' ? '#A7F3D0' : '#D1FAE5'}
                  stroke={selectedBlock === 'group_a_control' ? '#047857' : '#059669'}
                  strokeWidth={selectedBlock === 'group_a_control' ? '2.5' : '1.5'}
                  rx="3"
                />
                <text x="262" y="85" fontSize="11" fontWeight="bold" fill="#065F46" textAnchor="middle">
                  Group
                </text>
                <text x="262" y="100" fontSize="11" fontWeight="bold" fill="#065F46" textAnchor="middle">
                  A
                </text>
                <text x="262" y="115" fontSize="11" fontWeight="bold" fill="#065F46" textAnchor="middle">
                  control
                </text>
              </g>

              {/* Arrow from Internal Bus into Group A Control */}
              <polygon
                points="295,90 305,85 305,88 370,88 370,92 305,92 305,95"
                fill="#A5B4FC"
                stroke="#4338CA"
                strokeWidth="1"
              />

              {/* Control Lines from Group A Control to Port A & Port C Upper */}
              <path
                d="M 262 50 L 262 25 L 460 25 L 460 65"
                fill="none"
                stroke="#047857"
                strokeWidth="1.2"
                markerEnd="url(#arrow-black)"
              />
              <path
                d="M 460 25 L 515 25 L 515 150 L 490 150"
                fill="none"
                stroke="#047857"
                strokeWidth="1.2"
                markerEnd="url(#arrow-black)"
              />

              {/* Block 4: Group B Control */}
              <g
                className="cursor-pointer transition-all hover:brightness-95"
                onClick={() => handleBlockClick('group_b_control')}
              >
                <rect
                  x="230"
                  y="390"
                  width="65"
                  height="80"
                  fill={selectedBlock === 'group_b_control' ? '#A7F3D0' : '#D1FAE5'}
                  stroke={selectedBlock === 'group_b_control' ? '#047857' : '#059669'}
                  strokeWidth={selectedBlock === 'group_b_control' ? '2.5' : '1.5'}
                  rx="3"
                />
                <text x="262" y="425" fontSize="11" fontWeight="bold" fill="#065F46" textAnchor="middle">
                  Group
                </text>
                <text x="262" y="440" fontSize="11" fontWeight="bold" fill="#065F46" textAnchor="middle">
                  B
                </text>
                <text x="262" y="455" fontSize="11" fontWeight="bold" fill="#065F46" textAnchor="middle">
                  control
                </text>
              </g>

              {/* Arrow from Internal Bus into Group B Control */}
              <polygon
                points="295,430 305,425 305,428 370,428 370,432 305,432 305,435"
                fill="#A5B4FC"
                stroke="#4338CA"
                strokeWidth="1"
              />

              {/* Control Lines from Group B Control to Port C Lower & Port B */}
              <path
                d="M 262 470 L 262 505 L 515 505 L 515 320 L 490 320"
                fill="none"
                stroke="#047857"
                strokeWidth="1.2"
                markerEnd="url(#arrow-black)"
              />
              <path
                d="M 515 450 L 490 450"
                fill="none"
                stroke="#047857"
                strokeWidth="1.2"
                markerEnd="url(#arrow-black)"
              />

              {/* Block 5: 8-Bit Internal Data Bus (Prominent Vertical Bar) */}
              <g
                className="cursor-pointer transition-all hover:brightness-95"
                onClick={() => handleBlockClick('internal_bus')}
              >
                <rect
                  x="355"
                  y="40"
                  width="14"
                  height="395"
                  fill={selectedBlock === 'internal_bus' ? '#818CF8' : '#C7D2FE'}
                  stroke={selectedBlock === 'internal_bus' ? '#312E81' : '#4338CA'}
                  strokeWidth={selectedBlock === 'internal_bus' ? '2.5' : '1.5'}
                  rx="2"
                />
                {/* Label next to internal bus */}
                <g transform="translate(325, 235)">
                  <text x="0" y="0" fontSize="10" fontWeight="bold" fill="#312E81" textAnchor="middle">
                    8 bit
                  </text>
                  <text x="0" y="13" fontSize="10" fontWeight="bold" fill="#312E81" textAnchor="middle">
                    internal
                  </text>
                  <text x="0" y="26" fontSize="10" fontWeight="bold" fill="#312E81" textAnchor="middle">
                    data bus
                  </text>
                </g>
              </g>

              {/* ============================================================ */}
              {/* RIGHT COLUMN: I/O PORTS & OUTPUT BUSSES                      */}
              {/* ============================================================ */}

              {/* Port A Connection from Internal Bus */}
              <polygon
                points="370,80 380,75 380,78 430,78 430,75 440,80 430,85 430,82 380,82 380,85"
                fill="#A5B4FC"
                stroke="#4338CA"
                strokeWidth="1"
              />

              {/* Block 6: Group A Port A (8) */}
              <g
                className="cursor-pointer transition-all hover:brightness-95"
                onClick={() => handleBlockClick('port_a')}
              >
                <rect
                  x="440"
                  y="45"
                  width="50"
                  height="85"
                  fill={selectedBlock === 'port_a' ? '#FECDD3' : '#FFE4E6'}
                  stroke={selectedBlock === 'port_a' ? '#BE123C' : '#E11D48'}
                  strokeWidth={selectedBlock === 'port_a' ? '2.5' : '1.5'}
                  rx="3"
                />
                <text x="465" y="70" fontSize="9.5" fontWeight="bold" fill="#9F1239" textAnchor="middle">
                  Group
                </text>
                <text x="465" y="82" fontSize="9.5" fontWeight="bold" fill="#9F1239" textAnchor="middle">
                  A
                </text>
                <text x="465" y="96" fontSize="9.5" fontWeight="bold" fill="#9F1239" textAnchor="middle">
                  Port
                </text>
                <text x="465" y="110" fontSize="9.5" fontWeight="bold" fill="#9F1239" textAnchor="middle">
                  A
                </text>
                <text x="465" y="123" fontSize="9.5" fontWeight="bold" fill="#9F1239" textAnchor="middle">
                  (8)
                </text>
              </g>

              {/* Port A Output Arrow & Pin Label */}
              <polygon
                points="490,88 500,83 500,86 540,86 540,81 552,88 540,95 540,90 500,90 500,93"
                fill="#A5B4FC"
                stroke="#4338CA"
                strokeWidth="1"
              />
              <text x="560" y="85" fontSize="10.5" fontWeight="bold" fill="#1E293B">I/O</text>
              <text x="560" y="98" fontSize="11" fontWeight="bold" fill="#1E293B">PA7 - PA0</text>

              {/* Port C Upper Connection from Internal Bus */}
              <polygon
                points="370,185 380,180 380,183 440,183 440,180 450,185 440,190 440,187 380,187 380,190"
                fill="#A5B4FC"
                stroke="#4338CA"
                strokeWidth="1"
              />

              {/* Block 7: Group A Port C Upper (4) */}
              <g
                className="cursor-pointer transition-all hover:brightness-95"
                onClick={() => handleBlockClick('port_c_upper')}
              >
                <rect
                  x="440"
                  y="150"
                  width="50"
                  height="85"
                  fill={selectedBlock === 'port_c_upper' ? '#FECDD3' : '#FFE4E6'}
                  stroke={selectedBlock === 'port_c_upper' ? '#BE123C' : '#E11D48'}
                  strokeWidth={selectedBlock === 'port_c_upper' ? '2.5' : '1.5'}
                  rx="3"
                />
                <text x="465" y="172" fontSize="9" fontWeight="bold" fill="#9F1239" textAnchor="middle">
                  Group A
                </text>
                <text x="465" y="185" fontSize="9" fontWeight="bold" fill="#9F1239" textAnchor="middle">
                  Port C
                </text>
                <text x="465" y="200" fontSize="9" fontWeight="bold" fill="#9F1239" textAnchor="middle">
                  Upper
                </text>
                <text x="465" y="215" fontSize="9.5" fontWeight="bold" fill="#9F1239" textAnchor="middle">
                  (4)
                </text>
              </g>

              {/* Port C Upper Output Arrow & Pin Label */}
              <polygon
                points="490,190 500,185 500,188 540,188 540,183 552,190 540,197 540,192 500,192 500,195"
                fill="#A5B4FC"
                stroke="#4338CA"
                strokeWidth="1"
              />
              <text x="560" y="188" fontSize="10.5" fontWeight="bold" fill="#1E293B">I/O</text>
              <text x="560" y="201" fontSize="11" fontWeight="bold" fill="#1E293B">PC7 - PC4</text>

              {/* Port C Lower Connection from Internal Bus */}
              <polygon
                points="370,305 380,300 380,303 440,303 440,300 450,305 440,310 440,307 380,307 380,310"
                fill="#A5B4FC"
                stroke="#4338CA"
                strokeWidth="1"
              />

              {/* Block 8: Group B Port C Lower (4) */}
              <g
                className="cursor-pointer transition-all hover:brightness-95"
                onClick={() => handleBlockClick('port_c_lower')}
              >
                <rect
                  x="440"
                  y="270"
                  width="50"
                  height="85"
                  fill={selectedBlock === 'port_c_lower' ? '#FDE68A' : '#FEF3C7'}
                  stroke={selectedBlock === 'port_c_lower' ? '#B45309' : '#D97706'}
                  strokeWidth={selectedBlock === 'port_c_lower' ? '2.5' : '1.5'}
                  rx="3"
                />
                <text x="465" y="292" fontSize="9" fontWeight="bold" fill="#92400E" textAnchor="middle">
                  Group B
                </text>
                <text x="465" y="305" fontSize="9" fontWeight="bold" fill="#92400E" textAnchor="middle">
                  Port C
                </text>
                <text x="465" y="320" fontSize="9" fontWeight="bold" fill="#92400E" textAnchor="middle">
                  Lower
                </text>
                <text x="465" y="335" fontSize="9.5" fontWeight="bold" fill="#92400E" textAnchor="middle">
                  (4)
                </text>
              </g>

              {/* Port C Lower Output Arrow & Pin Label */}
              <polygon
                points="490,310 500,305 500,308 540,308 540,303 552,310 540,317 540,312 500,312 500,315"
                fill="#A5B4FC"
                stroke="#4338CA"
                strokeWidth="1"
              />
              <text x="560" y="308" fontSize="10.5" fontWeight="bold" fill="#1E293B">I/O</text>
              <text x="560" y="321" fontSize="11" fontWeight="bold" fill="#1E293B">PC3 - PC0</text>

              {/* Port B Connection from Internal Bus */}
              <polygon
                points="370,420 380,415 380,418 440,418 440,415 450,420 440,425 440,422 380,422 380,425"
                fill="#A5B4FC"
                stroke="#4338CA"
                strokeWidth="1"
              />

              {/* Block 9: Group B Port B (8) */}
              <g
                className="cursor-pointer transition-all hover:brightness-95"
                onClick={() => handleBlockClick('port_b')}
              >
                <rect
                  x="440"
                  y="385"
                  width="50"
                  height="85"
                  fill={selectedBlock === 'port_b' ? '#FDE68A' : '#FEF3C7'}
                  stroke={selectedBlock === 'port_b' ? '#B45309' : '#D97706'}
                  strokeWidth={selectedBlock === 'port_b' ? '2.5' : '1.5'}
                  rx="3"
                />
                <text x="465" y="410" fontSize="9.5" fontWeight="bold" fill="#92400E" textAnchor="middle">
                  Group
                </text>
                <text x="465" y="422" fontSize="9.5" fontWeight="bold" fill="#92400E" textAnchor="middle">
                  B
                </text>
                <text x="465" y="436" fontSize="9.5" fontWeight="bold" fill="#92400E" textAnchor="middle">
                  Port
                </text>
                <text x="465" y="450" fontSize="9.5" fontWeight="bold" fill="#92400E" textAnchor="middle">
                  B
                </text>
                <text x="465" y="463" fontSize="9.5" fontWeight="bold" fill="#92400E" textAnchor="middle">
                  (8)
                </text>
              </g>

              {/* Port B Output Arrow & Pin Label */}
              <polygon
                points="490,425 500,420 500,423 540,423 540,418 552,425 540,432 540,427 500,427 500,430"
                fill="#A5B4FC"
                stroke="#4338CA"
                strokeWidth="1"
              />
              <text x="560" y="423" fontSize="10.5" fontWeight="bold" fill="#1E293B">I/O</text>
              <text x="560" y="436" fontSize="11" fontWeight="bold" fill="#1E293B">PB7 - PB0</text>
            </svg>
          </div>

          {/* Diagram interactive note */}
          <div className="mt-1 text-center text-[10px] text-slate-500 font-medium">
            💡 Click any architectural block above (Data Bus Buffer, Ports, Group Controls, Bus) to inspect its technical details.
          </div>
        </div>

        {/* Block Inspector Sidebar (Col 4) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-indigo-600" />
                  Block Inspector
                </span>
              </div>
              <span className={`text-[9.5px] px-2 py-0.5 rounded font-bold uppercase ${
                currentInfo.color === 'emerald' ? 'bg-emerald-100 text-emerald-800' :
                currentInfo.color === 'pink' ? 'bg-rose-100 text-rose-800' :
                currentInfo.color === 'amber' ? 'bg-amber-100 text-amber-800' :
                currentInfo.color === 'indigo' ? 'bg-indigo-100 text-indigo-800' :
                'bg-slate-200 text-slate-700'
              }`}>
                {currentInfo.category}
              </span>
            </div>

            <div>
              <h4 className="font-bold text-xs text-slate-900 mb-1">
                {currentInfo.title}
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                {currentInfo.description}
              </p>
            </div>

            {/* Pins list */}
            <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1">
              <strong className="text-[10px] uppercase font-bold text-slate-500 block">
                Associated Pins / Terminals:
              </strong>
              <div className="flex flex-wrap gap-1">
                {currentInfo.pins.map((pin, idx) => (
                  <span key={idx} className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono text-slate-800 font-bold">
                    {pin}
                  </span>
                ))}
              </div>
            </div>

            {/* Key Technical Highlights */}
            <div className="space-y-1.5">
              <strong className="text-[10px] uppercase font-bold text-slate-500 block">
                Key Architectural Highlights:
              </strong>
              <ul className="space-y-1 text-[11px] text-slate-700">
                {currentInfo.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Block Selector buttons */}
            <div className="pt-2 border-t border-slate-200 space-y-1.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">
                Quick Select Block:
              </span>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <button
                  onClick={() => handleBlockClick('data_bus_buffer')}
                  className={`px-2 py-1 rounded text-left truncate font-semibold border cursor-pointer ${
                    selectedBlock === 'data_bus_buffer' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Data Bus Buffer
                </button>
                <button
                  onClick={() => handleBlockClick('rw_control_logic')}
                  className={`px-2 py-1 rounded text-left truncate font-semibold border cursor-pointer ${
                    selectedBlock === 'rw_control_logic' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Read/Write Logic
                </button>
                <button
                  onClick={() => handleBlockClick('group_a_control')}
                  className={`px-2 py-1 rounded text-left truncate font-semibold border cursor-pointer ${
                    selectedBlock === 'group_a_control' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Group A Control
                </button>
                <button
                  onClick={() => handleBlockClick('group_b_control')}
                  className={`px-2 py-1 rounded text-left truncate font-semibold border cursor-pointer ${
                    selectedBlock === 'group_b_control' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Group B Control
                </button>
                <button
                  onClick={() => handleBlockClick('port_a')}
                  className={`px-2 py-1 rounded text-left truncate font-semibold border cursor-pointer ${
                    selectedBlock === 'port_a' ? 'bg-rose-100 text-rose-900 border-rose-300' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Group A Port A
                </button>
                <button
                  onClick={() => handleBlockClick('port_c_upper')}
                  className={`px-2 py-1 rounded text-left truncate font-semibold border cursor-pointer ${
                    selectedBlock === 'port_c_upper' ? 'bg-rose-100 text-rose-900 border-rose-300' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Port C Upper (4)
                </button>
                <button
                  onClick={() => handleBlockClick('port_c_lower')}
                  className={`px-2 py-1 rounded text-left truncate font-semibold border cursor-pointer ${
                    selectedBlock === 'port_c_lower' ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Port C Lower (4)
                </button>
                <button
                  onClick={() => handleBlockClick('port_b')}
                  className={`px-2 py-1 rounded text-left truncate font-semibold border cursor-pointer ${
                    selectedBlock === 'port_b' ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Group B Port B
                </button>
                <button
                  onClick={() => handleBlockClick('internal_bus')}
                  className={`px-2 py-1 rounded text-left truncate font-semibold border cursor-pointer ${
                    selectedBlock === 'internal_bus' ? 'bg-indigo-100 text-indigo-900 border-indigo-300' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  8-Bit Internal Bus
                </button>
                <button
                  onClick={() => handleBlockClick('power_supplies')}
                  className={`px-2 py-1 rounded text-left truncate font-semibold border cursor-pointer ${
                    selectedBlock === 'power_supplies' ? 'bg-slate-200 text-slate-900 border-slate-400' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Power Supplies
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* USER'S POINT OF VIEW & ADDRESS LINES (A1, A0) SELECTION TABLE             */}
      {/* ========================================================================= */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wide">
                3 Ports in 8255 from User's Point of View
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                Hardware mapping of Port A, Port B, Port C (Upper/Lower), and Address Lines A1, A0
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[10.5px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
            CS#: Active LOW (0)
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Left: Port Overview (User's Perspective) */}
          <div className="lg:col-span-6 bg-white p-3.5 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <h5 className="font-bold text-xs text-indigo-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                3 Ports Organization (24 Programmable I/O Lines):
              </h5>
              
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <strong className="text-emerald-950 font-bold">❖ Port A (PA0–PA7):</strong>
                    <span className="text-[10px] font-mono font-bold text-emerald-800 bg-white px-1.5 py-0.5 rounded border border-emerald-200">8-Bit I/O</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Full 8-bit bidirectional data port supporting Mode 0 (Basic I/O), Mode 1 (Strobed I/O), or Mode 2 (Bidirectional Bus).
                  </p>
                </li>

                <li className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-200 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <strong className="text-indigo-950 font-bold">❖ Port B (PB0–PB7):</strong>
                    <span className="text-[10px] font-mono font-bold text-indigo-800 bg-white px-1.5 py-0.5 rounded border border-indigo-200">8-Bit I/O</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Full 8-bit data port supporting Mode 0 (Basic I/O) or Mode 1 (Strobed I/O).
                  </p>
                </li>

                <li className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-amber-950 font-bold">❖ Port C (PC0–PC7):</strong>
                    <span className="text-[10px] font-mono font-bold text-amber-800 bg-white px-1.5 py-0.5 rounded border border-amber-200">2 × 4-Bit Ports</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Port C is composed of two independent 4-bit ports:
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 text-[10.5px] pt-1">
                    <div className="p-1.5 bg-white rounded border border-amber-200">
                      <span className="font-bold text-amber-900 block font-mono">PC7–PC4 (PC Upper)</span>
                      <span className="text-[10px] text-slate-500">Group A Handshake / I/O</span>
                    </div>
                    <div className="p-1.5 bg-white rounded border border-amber-200">
                      <span className="font-bold text-amber-900 block font-mono">PC3–PC0 (PC Lower)</span>
                      <span className="text-[10px] text-slate-500">Group B Handshake / I/O</span>
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            <div className="p-2.5 bg-blue-50/80 rounded-lg border border-blue-200 text-[11px] text-blue-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>CS (Chip Select):</strong> Enables or disables the 8255 IC. When <code className="font-mono font-bold text-blue-950">CS# = 0</code>, the 8255 is selected for CPU communication. When <code className="font-mono font-bold text-blue-950">CS# = 1</code>, the internal bus buffers are held in High-Z (tri-state).
              </div>
            </div>
          </div>

          {/* Right: Address Lines A1, A0 Selection Table */}
          <div className="lg:col-span-6 bg-white p-3.5 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  Address Lines A1, A0 Selection Table
                </h5>
                <span className="text-[10.5px] text-slate-500 font-mono font-semibold">
                  Internal Register Decoding
                </span>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                      <th className="py-2.5 px-3 text-center w-16">A1</th>
                      <th className="py-2.5 px-3 text-center w-16">A0</th>
                      <th className="py-2.5 px-4 font-bold text-slate-900">Selected Port / Function</th>
                      <th className="py-2.5 px-3 text-right">Data Transfer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11.5px]">
                    <tr className="hover:bg-emerald-50/50 transition-colors">
                      <td className="py-2 px-3 text-center font-bold text-emerald-700 bg-emerald-50/40">0</td>
                      <td className="py-2 px-3 text-center font-bold text-emerald-700 bg-emerald-50/40">0</td>
                      <td className="py-2 px-4 font-sans font-bold text-emerald-950">Port A</td>
                      <td className="py-2 px-3 text-right text-[10.5px] font-sans text-slate-600">8-Bit Data (D0–D7)</td>
                    </tr>
                    <tr className="hover:bg-indigo-50/50 transition-colors">
                      <td className="py-2 px-3 text-center font-bold text-indigo-700 bg-indigo-50/40">0</td>
                      <td className="py-2 px-3 text-center font-bold text-indigo-700 bg-indigo-50/40">1</td>
                      <td className="py-2 px-4 font-sans font-bold text-indigo-950">Port B</td>
                      <td className="py-2 px-3 text-right text-[10.5px] font-sans text-slate-600">8-Bit Data (D0–D7)</td>
                    </tr>
                    <tr className="hover:bg-amber-50/50 transition-colors">
                      <td className="py-2 px-3 text-center font-bold text-amber-700 bg-amber-50/40">1</td>
                      <td className="py-2 px-3 text-center font-bold text-amber-700 bg-amber-50/40">0</td>
                      <td className="py-2 px-4 font-sans font-bold text-amber-950">Port C</td>
                      <td className="py-2 px-3 text-right text-[10.5px] font-sans text-slate-600">8-Bit Data / Handshake</td>
                    </tr>
                    <tr className="hover:bg-purple-50/50 transition-colors bg-purple-50/30">
                      <td className="py-2 px-3 text-center font-bold text-purple-700 bg-purple-100/50">1</td>
                      <td className="py-2 px-3 text-center font-bold text-purple-700 bg-purple-100/50">1</td>
                      <td className="py-2 px-4 font-sans font-bold text-purple-950">Control Port (Register)</td>
                      <td className="py-2 px-3 text-right text-[10.5px] font-sans text-purple-800 font-bold">Write CW Only</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-2.5 bg-slate-100 rounded-lg text-[10.5px] text-slate-600 space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-indigo-600" />
                Interfacing with 8086 Microprocessor:
              </div>
              <p className="leading-relaxed">
                In 8086 systems, 8255 pins <code className="font-mono font-bold text-slate-900">A1</code> and <code className="font-mono font-bold text-slate-900">A0</code> are connected directly to latched address lines (e.g. A2, A1 or A1, A0) to assign sequential contiguous I/O port addresses.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
