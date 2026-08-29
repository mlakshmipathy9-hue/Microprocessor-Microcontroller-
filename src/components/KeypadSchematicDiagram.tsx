import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Sparkles,
  Layers,
  Activity,
  Cpu
} from 'lucide-react';

interface KeypadSchematicDiagramProps {
  initialRowScan?: number; // 0..3
}

export default function KeypadSchematicDiagram({
  initialRowScan = 0
}: KeypadSchematicDiagramProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const [activeRowScan, setActiveRowScan] = useState<number>(initialRowScan); // 0 = Row 0, 1 = Row 1, etc.
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [pressedKey, setPressedKey] = useState<{ r: number; c: number; label: string } | null>({ r: 1, c: 2, label: '6' });

  // 4x4 Matrix Layout: 16 Keys
  const keyMatrix = [
    ['1', '2', '3', 'A'],
    ['4', '5', '6', 'B'],
    ['7', '8', '9', 'C'],
    ['*', '0', '#', 'D']
  ];

  // Auto-scan rows continuously (Grounding Row 0, then Row 1, Row 2, Row 3)
  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setActiveRowScan((prev) => (prev + 1) % 4);
    }, 700);
    return () => clearInterval(interval);
  }, [isScanning]);

  // Port A Outputs (Row drive): Active-LOW
  // Row 0 active: 0xFE (11111110b) -> PA0=0, PA1=1, PA2=1, PA3=1
  // Row 1 active: 0xFD (11111101b) -> PA0=1, PA1=0, PA2=1, PA3=1
  // Row 2 active: 0xFB (11111011b) -> PA0=1, PA1=1, PA2=0, PA3=1
  // Row 3 active: 0xF7 (11110111b) -> PA0=1, PA1=1, PA2=1, PA3=0
  const rowBitActive = [
    activeRowScan === 0 ? 0 : 1,
    activeRowScan === 1 ? 0 : 1,
    activeRowScan === 2 ? 0 : 1,
    activeRowScan === 3 ? 0 : 1
  ];
  const portAValue = 0xF0 | (rowBitActive[3] << 3) | (rowBitActive[2] << 2) | (rowBitActive[1] << 1) | rowBitActive[0];

  // Port B Inputs (Column sense): Pulled HIGH to 1 by default (10kΩ).
  // If a key at (pressedKey.r, pressedKey.c) is closed, AND the current scanned row equals pressedKey.r,
  // then Column pressedKey.c is pulled LOW to 0 (Grounded through that row)!
  const colBit = [1, 1, 1, 1];
  if (pressedKey && pressedKey.r === activeRowScan) {
    colBit[pressedKey.c] = 0; // Grounded!
  }
  const portBValue = 0xF0 | (colBit[3] << 3) | (colBit[2] << 2) | (colBit[1] << 1) | colBit[0];

  const keyDetected = pressedKey && pressedKey.r === activeRowScan;

  const chipInfo: Record<string, { title: string; subtitle: string; desc: string; pins: { pin: string; func: string }[] }> = {
    u1: {
      title: 'U1: Intel 8086 16-Bit Microprocessor',
      subtitle: 'Minimum Mode Master Controller',
      desc: 'Executes the matrix scanning software loop. Sends active-LOW row grounding masks to 8255 Port A (80H), reads Port B (82H) column inputs, and applies a 20 ms debounce delay subroutine before keycode translation.',
      pins: [
        { pin: 'Pin 33 (MN/MX#)', func: 'Tied to +5V VCC for Minimum Mode.' },
        { pin: 'Pin 25 (ALE)', func: 'Address Latch Enable to 74LS373 (Pin 11).' },
        { pin: 'Pin 28 (M/IO#)', func: 'Asserted LOW during I/O operations.' },
        { pin: 'Pin 32 (RD#) / Pin 29 (WR#)', func: 'Control read/write strobe lines to 8255.' },
        { pin: 'AD0–AD7', func: 'Multiplexed address/data bus lines.' }
      ]
    },
    u2: {
      title: 'U2: 74LS373 Octal Transparent D-Latch',
      subtitle: 'Lower Address Demultiplexer',
      desc: 'Latches lower address bits A0–A7 from multiplexed AD0–AD7 when ALE pulses HIGH during clock cycle T1, providing stable A0 and A1 lines to select 8255 registers.',
      pins: [
        { pin: 'Pin 11 (LE)', func: 'Driven by 8086 ALE (Pin 25).' },
        { pin: 'Pin 1 (OE#)', func: 'Tied to GND (0V) for permanent 3-state output enable.' },
        { pin: 'Pins Q0, Q1', func: 'Latched address outputs connected to 8255 A0 and A1.' }
      ]
    },
    u3: {
      title: 'U3: 74LS138 3-to-8 Line Decoder',
      subtitle: 'Port Chip Select Generator (Base 80H)',
      desc: 'Decodes upper address lines A2–A7 and M/IO# to assert active-low CS# (Pin 6) on the 8255 whenever an I/O instruction references port addresses 80H–87H.',
      pins: [
        { pin: 'Pin 6 (G1)', func: 'Tied to +5V VCC.' },
        { pin: 'Pins 4, 5 (G2A#, G2B#)', func: 'Tied to 8086 M/IO# and A7.' },
        { pin: 'Pin 15 (Y0#)', func: 'Asserted LOW for addresses 80H–87H -> 8255 CS#.' }
      ]
    },
    u4: {
      title: 'U4: Intel 8255A Programmable Peripheral Interface (PPI)',
      subtitle: 'Keypad Matrix Interface (Control Word = 82H)',
      desc: 'Configured in Mode 0 (Basic I/O) with Control Word 82H (10000010b): Port A is initialized as an OUTPUT port (driving Rows R0–R3), and Port B is initialized as an INPUT port (reading Columns C0–C3).',
      pins: [
        { pin: 'Pins 4, 3, 2, 1 (PA0–PA3)', func: 'Outputs driving Keypad Rows R0, R1, R2, R3 (Active-LOW grounding).' },
        { pin: 'Pins 18–21 (PB0–PB3)', func: 'Inputs sensing Keypad Columns C0, C1, C2, C3.' },
        { pin: 'Pins 34–27 (D0–D7)', func: '8-bit data bus connected to 8086 CPU.' },
        { pin: 'Pin 6 (CS#)', func: 'Chip Select from 74LS138 Y0# (Address 80H).' }
      ]
    },
    rp1: {
      title: 'RP1: 4 × 10kΩ Pull-Up Resistor Network',
      subtitle: 'Column Input Line Stabilizer',
      desc: 'Ties column lines C0–C3 to +5V VCC. Guarantees that when no key is pressed, all Port B column inputs read Logic HIGH (\'1\'). When a switch is pressed on an energized (grounded) row, it pulls that column input solidly to Logic LOW (0V).',
      pins: [
        { pin: 'Pin 1 (Common VCC)', func: 'Connected to +5V VCC power rail.' },
        { pin: 'Pins 2–5', func: 'Connected to Column lines C0, C1, C2, C3 and 8255 Port B (PB0–PB3).' }
      ]
    },
    matrix: {
      title: '4×4 Keypad Matrix Switch Grid',
      subtitle: '16 Momentary Tactile SPST Pushbuttons',
      desc: 'Arranges 16 mechanical switches at the intersections of 4 rows and 4 columns, requiring only 8 microcontroller I/O pins instead of 16 dedicated wires. Pressing a key electrically bridges that specific Row and Column line.',
      pins: [
        { pin: 'Row Lines (R0–R3)', func: 'Horizontal bus lines driven by 8255 PA0–PA3.' },
        { pin: 'Column Lines (C0–C3)', func: 'Vertical bus lines sensed by 8255 PB0–PB3.' }
      ]
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-800 shadow-2xs space-y-3 font-sans">
      {/* Top Schematic Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>Proteus Schematic: 8086 + 8255A ↔ 4×4 Matrix Keypad</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded font-sans font-bold">
                Active-LOW Row Scan
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-sans">
              8086 (U1) ↔ 74LS373 (U2) ↔ 74LS138 (U3) ↔ 8255A (U4) ↔ 10kΩ Pull-Ups (RP1) ↔ 4×4 Pushbutton Grid
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-sans">
          {/* Active Key Indicator */}
          <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-slate-500 text-[10px] font-medium">Active Key:</span>
            <span className="text-emerald-700 font-mono font-bold">
              {pressedKey ? `'${pressedKey.label}' (R${pressedKey.r}, C${pressedKey.c})` : 'None (Open)'}
            </span>
          </div>

          {/* Row Select Manual */}
          <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-slate-500 text-[10px] font-medium">Row:</span>
            <select
              value={activeRowScan}
              onChange={(e) => {
                setActiveRowScan(parseInt(e.target.value));
                setIsScanning(false);
              }}
              className="bg-slate-50 border border-slate-300 text-indigo-700 font-mono text-xs px-1.5 py-0.5 rounded font-bold cursor-pointer focus:outline-hidden"
            >
              <option value={0}>Row 0 (PA0=0)</option>
              <option value={1}>Row 1 (PA1=0)</option>
              <option value={2}>Row 2 (PA2=0)</option>
              <option value={3}>Row 3 (PA3=0)</option>
            </select>
          </div>

          {/* Auto Scan Toggle */}
          <button
            onClick={() => setIsScanning(!isScanning)}
            className={`px-2.5 py-1 rounded-lg border font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all shadow-2xs ${
              isScanning 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {isScanning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isScanning ? 'Auto Scanning' : 'Manual Step'}</span>
          </button>

          {/* Clear key button */}
          {pressedKey && (
            <button
              onClick={() => setPressedKey(null)}
              className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[10px] cursor-pointer shadow-2xs font-bold"
            >
              Release Key
            </button>
          )}

          {/* Zoom controls */}
          <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
            <button
              onClick={() => setZoomLevel(Math.max(0.75, zoomLevel - 0.1))}
              className="p-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-[10px] px-1 text-slate-700 font-mono font-bold">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel(Math.min(1.35, zoomLevel + 0.1))}
              className="p-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Reset Zoom"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main EDA Schematic Canvas (SVG) */}
      <div className="relative bg-slate-50/50 rounded-xl border border-slate-200 overflow-x-auto overflow-y-hidden shadow-inner p-2">
        <div 
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
          className="transition-transform duration-200 min-w-[940px] bg-white p-3 rounded-lg border border-slate-200"
        >
          <svg viewBox="0 0 960 480" className="w-full h-auto select-none font-mono text-[10px]">
            {/* Grid Pattern Background */}
            <defs>
              <pattern id="edaGridKeypad" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.8" fill="#cbd5e1" opacity="0.8" />
              </pattern>
              <filter id="keyGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <rect width="960" height="480" fill="url(#edaGridKeypad)" />

            {/* Top +5V Power Rail */}
            <line x1="30" y1="25" x2="990" y2="25" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,2" />
            <text x="40" y="20" fill="#dc2626" fontSize="9" fontWeight="bold">+5V VCC (Power Rail)</text>

            {/* Bottom GND Rail */}
            <line x1="30" y1="465" x2="990" y2="465" stroke="#2563eb" strokeWidth="2" />
            <text x="40" y="460" fill="#1d4ed8" fontSize="9" fontWeight="bold">GND (0V Reference)</text>

            {/* ============================================================== */}
            {/* 1. CHIP U1: 8086 CPU                                           */}
            {/* ============================================================== */}
            <g 
              onClick={() => setSelectedChip('u1')}
              className="cursor-pointer transition-all"
              transform="translate(30, 60)"
            >
              <rect
                x="0"
                y="0"
                width="135"
                height="360"
                rx="6"
                fill="#ffffff"
                stroke={selectedChip === 'u1' ? '#4f46e5' : '#94a3b8'}
                strokeWidth={selectedChip === 'u1' ? '2.5' : '1.5'}
              />
              <rect x="0" y="0" width="135" height="26" rx="6" fill="#eef2ff" stroke="#c7d2fe" strokeWidth="1" />
              <text x="67.5" y="17" fill="#4338ca" fontWeight="bold" textAnchor="middle" fontSize="11">U1: 8086 CPU</text>
              <text x="67.5" y="38" fill="#64748b" fontSize="8" textAnchor="middle">MIN MODE (5 MHz)</text>

              {/* Pin Labels */}
              <text x="10" y="70" fill="#dc2626" fontWeight="bold">AD0–AD7</text>
              <text x="10" y="95" fill="#dc2626">AD8–AD15</text>
              <text x="10" y="120" fill="#059669" fontWeight="bold">ALE (Pin 25)</text>
              <text x="10" y="145" fill="#d97706" fontWeight="bold">M/IO# (Pin 28)</text>
              <text x="10" y="170" fill="#d97706">WR# (Pin 29)</text>
              <text x="10" y="195" fill="#d97706">RD# (Pin 32)</text>
              <text x="10" y="225" fill="#64748b">A16–A19</text>
              <text x="10" y="270" fill="#4338ca" fontSize="8.5" fontWeight="bold">Keypad ALP Scan:</text>
              <text x="10" y="290" fill="#1e293b" fontSize="8">OUT 80H, AL (Rows)</text>
              <text x="10" y="308" fill="#1e293b" fontSize="8">IN AL, 82H (Cols)</text>
              <text x="10" y="326" fill="#6366f1" fontSize="8" fontWeight="bold">CALL DEBOUNCE</text>

              {[70, 95, 120, 145, 170, 195].map((y, i) => (
                <circle key={i} cx="135" cy={y} r="3" fill="#4f46e5" />
              ))}
            </g>

            {/* ============================================================== */}
            {/* 2. CHIP U2: 74LS373 LATCH                                      */}
            {/* ============================================================== */}
            <g 
              onClick={() => setSelectedChip('u2')}
              className="cursor-pointer transition-all"
              transform="translate(195, 60)"
            >
              <rect
                x="0"
                y="0"
                width="125"
                height="150"
                rx="6"
                fill="#ffffff"
                stroke={selectedChip === 'u2' ? '#4f46e5' : '#94a3b8'}
                strokeWidth={selectedChip === 'u2' ? '2.5' : '1.5'}
              />
              <rect x="0" y="0" width="125" height="24" rx="6" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1" />
              <text x="62.5" y="16" fill="#15803d" fontWeight="bold" textAnchor="middle" fontSize="10.5">U2: 74LS373</text>
              <text x="62.5" y="34" fill="#64748b" fontSize="8" textAnchor="middle">OCTAL LATCH</text>

              <text x="8" y="55" fill="#dc2626" fontWeight="bold">AD0–AD7</text>
              <text x="8" y="80" fill="#059669" fontWeight="bold">LE (Pin 11)</text>
              <text x="8" y="105" fill="#64748b">OE# (GND)</text>

              <text x="117" y="55" fill="#2563eb" textAnchor="end" fontWeight="bold">A0 (Q0)</text>
              <text x="117" y="80" fill="#2563eb" textAnchor="end" fontWeight="bold">A1 (Q1)</text>
              <text x="117" y="105" fill="#2563eb" textAnchor="end">A2–A7</text>

              <circle cx="0" cy="55" r="3" fill="#dc2626" />
              <circle cx="0" cy="80" r="3" fill="#059669" />
              <circle cx="125" cy="55" r="3" fill="#2563eb" />
              <circle cx="125" cy="80" r="3" fill="#2563eb" />
              <circle cx="125" cy="105" r="3" fill="#2563eb" />
            </g>

            {/* ============================================================== */}
            {/* 3. CHIP U3: 74LS138 DECODER                                    */}
            {/* ============================================================== */}
            <g 
              onClick={() => setSelectedChip('u3')}
              className="cursor-pointer transition-all"
              transform="translate(195, 240)"
            >
              <rect
                x="0"
                y="0"
                width="125"
                height="180"
                rx="6"
                fill="#ffffff"
                stroke={selectedChip === 'u3' ? '#4f46e5' : '#94a3b8'}
                strokeWidth={selectedChip === 'u3' ? '2.5' : '1.5'}
              />
              <rect x="0" y="0" width="125" height="24" rx="6" fill="#fffbeb" stroke="#fef08a" strokeWidth="1" />
              <text x="62.5" y="16" fill="#b45309" fontWeight="bold" textAnchor="middle" fontSize="10.5">U3: 74LS138</text>
              <text x="62.5" y="34" fill="#64748b" fontSize="8" textAnchor="middle">DECODER (80H)</text>

              <text x="8" y="55" fill="#d97706" fontWeight="bold">A2, A3, A4</text>
              <text x="8" y="80" fill="#d97706">G1 (+5V)</text>
              <text x="8" y="105" fill="#d97706">G2A# (M/IO#)</text>
              <text x="8" y="130" fill="#d97706">G2B# (A7)</text>

              <text x="117" y="75" fill="#059669" textAnchor="end" fontWeight="bold">Y0# (CS#)</text>
              <text x="117" y="115" fill="#94a3b8" textAnchor="end">Y1#–Y7#</text>

              <circle cx="0" cy="55" r="3" fill="#d97706" />
              <circle cx="0" cy="105" r="3" fill="#d97706" />
              <circle cx="125" cy="75" r="3" fill="#059669" />
            </g>

            {/* Wires CPU -> Latch & Decoder */}
            <path d="M 165 180 L 180 180 L 180 140 L 195 140" fill="none" stroke="#059669" strokeWidth="1.5" />
            <path d="M 165 130 L 195 115" fill="none" stroke="#dc2626" strokeWidth="2" />
            <path d="M 165 205 L 180 205 L 180 345 L 195 345" fill="none" stroke="#d97706" strokeWidth="1.5" />

            {/* ============================================================== */}
            {/* 4. CHIP U4: INTEL 8255A PPI                                    */}
            {/* ============================================================== */}
            <g 
              onClick={() => setSelectedChip('u4')}
              className="cursor-pointer transition-all"
              transform="translate(355, 60)"
            >
              <rect
                x="0"
                y="0"
                width="185"
                height="360"
                rx="6"
                fill="#ffffff"
                stroke={selectedChip === 'u4' ? '#4f46e5' : '#818cf8'}
                strokeWidth={selectedChip === 'u4' ? '2.5' : '2'}
              />
              <rect x="0" y="0" width="185" height="26" rx="6" fill="#eef2ff" stroke="#c7d2fe" strokeWidth="1" />
              <text x="92.5" y="17" fill="#3730a3" fontWeight="bold" textAnchor="middle" fontSize="11">U4: 8255A PPI</text>
              <text x="92.5" y="38" fill="#4f46e5" fontSize="8" textAnchor="middle">MODE 0 (CW = 82H)</text>

              {/* Left Control & Bus Inputs */}
              <text x="10" y="55" fill="#dc2626" fontWeight="bold">D0–D7 (Bus)</text>
              <text x="10" y="80" fill="#2563eb" fontWeight="bold">A0 (Pin 9)</text>
              <text x="10" y="105" fill="#2563eb" fontWeight="bold">A1 (Pin 8)</text>
              <text x="10" y="135" fill="#059669" fontWeight="bold">CS# (Pin 6)</text>
              <text x="10" y="160" fill="#d97706">WR# (Pin 36)</text>
              <text x="10" y="185" fill="#d97706">RD# (Pin 5)</text>
              <text x="10" y="210" fill="#64748b">RESET = 0</text>
              <text x="10" y="240" fill="#4f46e5" fontSize="8.5" fontWeight="bold">Base Port: 80H</text>

              {/* Right Output Rows (Port A: PA0–PA3) */}
              <text x="175" y="55" fill={rowBitActive[0] === 0 ? '#059669' : '#94a3b8'} fontWeight="bold" textAnchor="end">
                PA0 (R0) [{rowBitActive[0]}]
              </text>
              <text x="175" y="80" fill={rowBitActive[1] === 0 ? '#059669' : '#94a3b8'} fontWeight="bold" textAnchor="end">
                PA1 (R1) [{rowBitActive[1]}]
              </text>
              <text x="175" y="105" fill={rowBitActive[2] === 0 ? '#059669' : '#94a3b8'} fontWeight="bold" textAnchor="end">
                PA2 (R2) [{rowBitActive[2]}]
              </text>
              <text x="175" y="130" fill={rowBitActive[3] === 0 ? '#059669' : '#94a3b8'} fontWeight="bold" textAnchor="end">
                PA3 (R3) [{rowBitActive[3]}]
              </text>

              {/* Right Input Columns (Port B: PB0–PB3) */}
              <text x="175" y="180" fill={colBit[0] === 0 ? '#e11d48' : '#d97706'} fontWeight="bold" textAnchor="end">
                PB0 (C0) [{colBit[0]}]
              </text>
              <text x="175" y="205" fill={colBit[1] === 0 ? '#e11d48' : '#d97706'} fontWeight="bold" textAnchor="end">
                PB1 (C1) [{colBit[1]}]
              </text>
              <text x="175" y="230" fill={colBit[2] === 0 ? '#e11d48' : '#d97706'} fontWeight="bold" textAnchor="end">
                PB2 (C2) [{colBit[2]}]
              </text>
              <text x="175" y="255" fill={colBit[3] === 0 ? '#e11d48' : '#d97706'} fontWeight="bold" textAnchor="end">
                PB3 (C3) [{colBit[3]}]
              </text>

              <text x="92.5" y="305" fill="#059669" fontSize="8.5" fontWeight="bold" textAnchor="middle">Port A: Output (Rows)</text>
              <text x="92.5" y="325" fill="#d97706" fontSize="8.5" fontWeight="bold" textAnchor="middle">Port B: Input (Cols)</text>

              {/* Input Pins dots */}
              <circle cx="0" cy="55" r="3" fill="#dc2626" />
              <circle cx="0" cy="80" r="3" fill="#2563eb" />
              <circle cx="0" cy="105" r="3" fill="#2563eb" />
              <circle cx="0" cy="135" r="3" fill="#059669" />

              {[55, 80, 105, 130, 180, 205, 230, 255].map((y, i) => (
                <circle key={i} cx="185" cy={y} r="3" fill={i < 4 ? '#059669' : '#d97706'} />
              ))}
            </g>

            {/* Wires to 8255 */}
            <path d="M 320 115 L 338 115 L 338 140 L 355 140" fill="none" stroke="#2563eb" strokeWidth="1.5" />
            <path d="M 320 140 L 338 140 L 338 165 L 355 165" fill="none" stroke="#2563eb" strokeWidth="1.5" />
            <path d="M 320 315 L 338 315 L 338 195 L 355 195" fill="none" stroke="#059669" strokeWidth="2" />

            {/* ============================================================== */}
            {/* 5. RP1: 4x 10kΩ PULL-UP RESISTOR NETWORK (tied to +5V)         */}
            {/* ============================================================== */}
            <g 
              onClick={() => setSelectedChip('rp1')}
              className="cursor-pointer transition-all"
              transform="translate(570, 235)"
            >
              <rect
                x="0"
                y="0"
                width="60"
                height="130"
                rx="4"
                fill="#f8fafc"
                stroke={selectedChip === 'rp1' ? '#4f46e5' : '#cbd5e1'}
                strokeWidth="1.5"
              />
              <text x="30" y="16" fill="#dc2626" fontWeight="bold" textAnchor="middle" fontSize="9">RP1 (10kΩ)</text>
              <text x="30" y="28" fill="#64748b" fontSize="7.5" textAnchor="middle">PULL-UPS (+5V)</text>

              {/* 4 Resistors */}
              {[40, 65, 90, 115].map((y, idx) => (
                <g key={idx}>
                  <line x1="5" y1={y} x2="12" y2={y} stroke="#ef4444" strokeWidth="1.5" />
                  <rect x="12" y={y - 5} width="35" height="10" rx="2" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
                  <text x="29" y={y + 3} fill="#0f172a" fontSize="7" textAnchor="middle" fontWeight="bold">10k</text>
                  <line x1="47" y1={y} x2="55" y2={y} stroke="#d97706" strokeWidth="1.5" />
                </g>
              ))}
            </g>

            {/* Connect RP1 top pin to +5V Rail */}
            <path d="M 575 235 L 575 25" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,1" />

            {/* ============================================================== */}
            {/* 6. 4×4 MATRIX KEYPAD GRID                                      */}
            {/* ============================================================== */}
            <g 
              onClick={() => setSelectedChip('matrix')}
              className="cursor-pointer transition-all"
              transform="translate(675, 60)"
            >
              <rect
                x="0"
                y="0"
                width="265"
                height="360"
                rx="10"
                fill="#ffffff"
                stroke={selectedChip === 'matrix' ? '#4f46e5' : '#cbd5e1'}
                strokeWidth={selectedChip === 'matrix' ? '2.5' : '2'}
              />
              <rect x="0" y="0" width="260" height="26" rx="10" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1" />
              <text x="130" y="17" fill="#0f172a" fontWeight="bold" textAnchor="middle" fontSize="10.5">
                4×4 MATRIX KEYPAD (16 KEYS)
              </text>

              {/* Column labels at top */}
              {['C0', 'C1', 'C2', 'C3'].map((cName, cIdx) => (
                <text 
                  key={cIdx} 
                  x={45 + cIdx * 55} 
                  y="45" 
                  fill={colBit[cIdx] === 0 ? '#e11d48' : '#d97706'} 
                  fontSize="9" 
                  fontWeight="bold" 
                  textAnchor="middle"
                >
                  {cName} [{colBit[cIdx]}]
                </text>
              ))}

              {/* Matrix Switches */}
              {keyMatrix.map((row, rIdx) => {
                const isRowActive = activeRowScan === rIdx;
                const rowY = 70 + rIdx * 65;

                return (
                  <g key={rIdx}>
                    {/* Row Label on left */}
                    <text 
                      x="12" 
                      y={rowY + 22} 
                      fill={isRowActive ? '#059669' : '#64748b'} 
                      fontSize="9" 
                      fontWeight="bold"
                    >
                      R{rIdx}
                    </text>

                    {/* Horizontal Row Wire */}
                    <line 
                      x1="28" 
                      y1={rowY + 20} 
                      x2="240" 
                      y2={rowY + 20} 
                      stroke={isRowActive ? '#059669' : '#cbd5e1'} 
                      strokeWidth={isRowActive ? '2' : '1'} 
                    />

                    {/* 4 Keys on this row */}
                    {row.map((kLabel, cIdx) => {
                      const keyX = 45 + cIdx * 55;
                      const isThisKeyPressed = pressedKey && pressedKey.r === rIdx && pressedKey.c === cIdx;
                      const isBridged = isThisKeyPressed && isRowActive;

                      return (
                        <g 
                          key={cIdx}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isThisKeyPressed) {
                              setPressedKey(null);
                            } else {
                              setPressedKey({ r: rIdx, c: cIdx, label: kLabel });
                            }
                          }}
                          className="cursor-pointer"
                        >
                          {/* Vertical Column Wire segment */}
                          <line 
                            x1={keyX} 
                            y1={rowY - 10} 
                            x2={keyX} 
                            y2={rowY + 45} 
                            stroke={colBit[cIdx] === 0 ? '#e11d48' : '#94a3b8'} 
                            strokeWidth="1" 
                          />

                          {/* Key Switch Housing */}
                          <rect
                            x={keyX - 18}
                            y={rowY + 2}
                            width="36"
                            height="36"
                            rx="6"
                            fill={isThisKeyPressed ? (isBridged ? '#ecfdf5' : '#eff6ff') : '#f8fafc'}
                            stroke={isThisKeyPressed ? (isBridged ? '#059669' : '#3b82f6') : '#cbd5e1'}
                            strokeWidth={isThisKeyPressed ? '2' : '1'}
                            filter={isBridged ? 'url(#keyGlow)' : undefined}
                          />

                          {/* Pushbutton Icon / Cap */}
                          <circle
                            cx={keyX}
                            cy={rowY + 20}
                            r="12"
                            fill={isThisKeyPressed ? (isBridged ? '#10b981' : '#3b82f6') : '#e2e8f0'}
                            stroke={isThisKeyPressed ? '#059669' : '#94a3b8'}
                            strokeWidth="0.8"
                          />

                          {/* Key Character */}
                          <text
                            x={keyX}
                            y={rowY + 24}
                            fill={isThisKeyPressed ? '#ffffff' : '#0f172a'}
                            fontWeight="bold"
                            fontSize="11"
                            textAnchor="middle"
                          >
                            {kLabel}
                          </text>

                          {/* Switch contact indicator */}
                          {isThisKeyPressed && (
                            <circle cx={keyX + 10} cy={rowY + 10} r="2.5" fill="#059669" />
                          )}
                        </g>
                      );
                    })}
                  </g>
                );
              })}

              {/* Bottom Status Banner inside Keypad box */}
              <rect x="15" y="325" width="230" height="25" rx="4" fill="#f8fafc" stroke="#e2e8f0" />
              <text x="130" y="341" fill={keyDetected ? '#059669' : '#64748b'} fontSize="8.5" textAnchor="middle" fontWeight="bold">
                {keyDetected 
                  ? `KEY HIT DETECTED: '${pressedKey?.label}' (Row ${pressedKey?.r} LOW, Col ${pressedKey?.c} = 0V)`
                  : pressedKey 
                    ? `Key '${pressedKey.label}' Held Down (Waiting for Row ${pressedKey.r} scan...)`
                    : 'Click any key button above to simulate a keypress'}
              </text>
            </g>

            {/* ============================================================== */}
            {/* 7. WIRES FROM 8255 TO MATRIX & PULL-UPS                        */}
            {/* ============================================================== */}
            {/* Port A Row Output Wires (PA0–PA3) -> Keypad Rows R0–R3 */}
            {[
              { y8255: 115, yKey: 150, active: rowBitActive[0] === 0 },
              { y8255: 140, yKey: 215, active: rowBitActive[1] === 0 },
              { y8255: 165, yKey: 280, active: rowBitActive[2] === 0 },
              { y8255: 190, yKey: 345, active: rowBitActive[3] === 0 }
            ].map((w, idx) => (
              <path 
                key={idx}
                d={`M 540 ${w.y8255} L 555 ${w.y8255} L 555 ${w.yKey} L 675 ${w.yKey}`}
                fill="none"
                stroke={w.active ? '#059669' : '#cbd5e1'}
                strokeWidth={w.active ? '2' : '1'}
              />
            ))}

            {/* Port B Column Sense Wires (PB0–PB3) <- Pull-ups & Keypad Cols */}
            {[
              { y8255: 240, yRp: 275, active: colBit[0] === 0 },
              { y8255: 265, yRp: 300, active: colBit[1] === 0 },
              { y8255: 290, yRp: 325, active: colBit[2] === 0 },
              { y8255: 315, yRp: 350, active: colBit[3] === 0 }
            ].map((w, idx) => (
              <g key={idx}>
                <line 
                  x1="540" 
                  y1={w.y8255} 
                  x2="570" 
                  y2={w.yRp} 
                  stroke={w.active ? '#e11d48' : '#d97706'} 
                  strokeWidth={w.active ? '2' : '1.2'} 
                />
                {/* Wires from RP1 to Keypad */}
                <line 
                  x1="630" 
                  y1={w.yRp} 
                  x2="675" 
                  y2={w.yRp} 
                  stroke={w.active ? '#e11d48' : '#d97706'} 
                  strokeWidth={w.active ? '2' : '1.2'} 
                />
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Interactive Chip Inspector Modal / Info Card */}
      {selectedChip && chipInfo[selectedChip] && (
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-2 font-sans shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">{chipInfo[selectedChip].title}</h4>
                <p className="text-[10px] text-indigo-600 font-bold">{chipInfo[selectedChip].subtitle}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedChip(null)}
              className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer font-bold"
            >
              Close Info
            </button>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            {chipInfo[selectedChip].desc}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] pt-1">
            {chipInfo[selectedChip].pins.map((p, idx) => (
              <div key={idx} className="bg-slate-50 p-1.5 rounded border border-slate-200">
                <strong className="text-indigo-700 font-mono block">{p.pin}</strong>
                <span className="text-slate-600">{p.func}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Keypad Scanning Register Live Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-sans">
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block text-[9px] font-bold uppercase">8255 Port A (Rows):</span>
          <span className="text-emerald-700 font-mono font-extrabold text-xs">
            0x{portAValue.toString(16).toUpperCase().padStart(2, '0')}H
          </span>
          <p className="text-[9px] text-slate-400 mt-0.5">Row {activeRowScan} is Grounded (0V)</p>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block text-[9px] font-bold uppercase">8255 Port B (Cols):</span>
          <span className="text-amber-700 font-mono font-extrabold text-xs">
            0x{portBValue.toString(16).toUpperCase().padStart(2, '0')}H
          </span>
          <p className="text-[9px] text-slate-400 mt-0.5">
            {keyDetected ? `Col ${pressedKey?.c} pulled LOW!` : 'All Columns HIGH (1111b)'}
          </p>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block text-[9px] font-bold uppercase">Debounce State:</span>
          <span className="text-indigo-700 font-mono font-extrabold text-xs">
            {pressedKey ? '20 ms Delay Verified' : 'Idle / Standby'}
          </span>
          <p className="text-[9px] text-slate-400 mt-0.5">Eliminates contact bounce</p>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block text-[9px] font-bold uppercase">Decoded Key Code:</span>
          <span className="text-slate-900 font-mono font-extrabold text-xs">
            {pressedKey ? `'${pressedKey.label}' (ASCII 0x${pressedKey.label.charCodeAt(0).toString(16).toUpperCase()}H)` : 'None'}
          </span>
          <p className="text-[9px] text-slate-400 mt-0.5">Looked up via XLAT table</p>
        </div>
      </div>
    </div>
  );
}
