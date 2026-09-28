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
  const [scanSpeedMs, setScanSpeedMs] = useState<number>(400); // Reduced simulation time (down from 1100ms)
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
    }, scanSpeedMs);
    return () => clearInterval(interval);
  }, [isScanning, scanSpeedMs]);

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
      subtitle: 'Part: 8086 • Component: Microprocessor (CPU)',
      desc: 'Executes the matrix scanning software loop. Sends active-LOW row grounding masks to 8255 Port A (80H), reads Port B (82H) column inputs, and applies a 20 ms debounce delay subroutine before keycode translation.',
      pins: [
        { pin: 'Pin 33 (MN/M̅X̅)', func: 'Tied to +5V VCC for Minimum Mode.' },
        { pin: 'Pin 25 (ALE)', func: 'Address Latch Enable to 74LS373 (Pin 11).' },
        { pin: 'Pin 28 (M/I̅O̅)', func: 'Asserted LOW during I/O operations.' },
        { pin: 'Pin 32 (R̅D̅) / Pin 29 (W̅R̅)', func: 'Control read/write strobe lines to 8255.' },
        { pin: 'AD0–AD7', func: 'Multiplexed address/data bus lines.' }
      ]
    },
    u2: {
      title: 'U2: 74LS373 Octal Transparent D-Latch',
      subtitle: 'Part: 74LS373 • Component: Octal Address Latch',
      desc: 'Latches lower address bits A0–A7 from multiplexed AD0–AD7 when ALE pulses HIGH during clock cycle T1, providing stable A0 and A1 lines to select 8255 registers.',
      pins: [
        { pin: 'Pin 11 (LE)', func: 'Driven by 8086 ALE (Pin 25).' },
        { pin: 'Pin 1 (O̅E̅)', func: 'Tied to GND (0V) for permanent 3-state output enable.' },
        { pin: 'Pins Q0, Q1', func: 'Latched address outputs connected to 8255 A0 and A1.' }
      ]
    },
    u3: {
      title: 'U3: 74LS138 3-to-8 Line Decoder',
      subtitle: 'Part: 74LS138 • Component: 3-to-8 Address Decoder',
      desc: 'Decodes upper address lines A2–A7 and M/I̅O̅ to assert active-low C̅S̅ (Pin 6) on the 8255 whenever an I/O instruction references port addresses 80H–87H.',
      pins: [
        { pin: 'Pin 6 (G1)', func: 'Tied to +5V VCC.' },
        { pin: 'Pins 4, 5 (G̅2̅A̅, G̅2̅B̅)', func: 'Tied to 8086 M/I̅O̅ and A7.' },
        { pin: 'Pin 15 (Y̅0̅)', func: 'Asserted LOW for addresses 80H–87H -> 8255 C̅S̅.' }
      ]
    },
    u4: {
      title: 'U4: Intel 8255A Programmable Peripheral Interface (PPI)',
      subtitle: 'Part: 8255A • Component: Programmable Peripheral Interface (PPI)',
      desc: 'Configured in Mode 0 (Basic I/O) with Control Word 82H (10000010b): Port A is initialized as an OUTPUT port (driving Rows R0–R3), and Port B is initialized as an INPUT port (reading Columns C0–C3).',
      pins: [
        { pin: 'Pins 4, 3, 2, 1 (PA0–PA3)', func: 'Outputs driving Keypad Rows R0, R1, R2, R3 (Active-LOW grounding).' },
        { pin: 'Pins 18–21 (PB0–PB3)', func: 'Inputs sensing Keypad Columns C0, C1, C2, C3.' },
        { pin: 'Pins 34–27 (D0–D7)', func: '8-bit data bus connected to 8086 CPU.' },
        { pin: 'Pin 6 (C̅S̅)', func: 'Chip Select from 74LS138 Y̅0̅ (Address 80H).' }
      ]
    },
    rp1: {
      title: 'RP1: 4 × 10kΩ Pull-Up Resistor Network',
      subtitle: 'Part: RP1 (4×10kΩ) • Component: Pull-Up Resistor Network',
      desc: 'Ties column lines C0–C3 to +5V VCC. Guarantees that when no key is pressed, all Port B column inputs read Logic HIGH (\'1\'). When a switch is pressed on an energized (grounded) row, it pulls that column input solidly to Logic LOW (0V).',
      pins: [
        { pin: 'Pin 1 (Common VCC)', func: 'Connected to +5V VCC power rail.' },
        { pin: 'Pins 2–5', func: 'Connected to Column lines C0, C1, C2, C3 and 8255 Port B (PB0–PB3).' }
      ]
    },
    matrix: {
      title: '4×4 Keypad Matrix Switch Grid',
      subtitle: 'Part: 4×4 Matrix • Component: 16-Key Tactile Switch Grid',
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

          {/* Simulation Scan Speed Selector */}
          <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs text-[9.5px]">
            <span className="text-[9px] px-1.5 text-slate-500 font-bold uppercase">Speed:</span>
            {[
              { label: 'Fast (200ms)', ms: 200 },
              { label: 'Normal (400ms)', ms: 400 },
              { label: 'Slow (750ms)', ms: 750 }
            ].map((spd) => (
              <button
                key={spd.label}
                onClick={() => setScanSpeedMs(spd.ms)}
                className={`px-1.5 py-0.5 rounded font-bold cursor-pointer transition-all ${
                  scanSpeedMs === spd.ms
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {spd.label}
              </button>
            ))}
          </div>

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
          className="transition-transform duration-200 min-w-[960px] bg-white p-3 rounded-lg border border-slate-200"
        >
          <svg viewBox="0 0 1080 500" className="w-full h-auto select-none font-mono text-[10px]">
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

            <rect width="1080" height="500" fill="url(#edaGridKeypad)" />

            {/* Top +5V Power Rail */}
            <line x1="25" y1="20" x2="1055" y2="20" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,2" />
            <text x="35" y="15" fill="#dc2626" fontSize="9" fontWeight="bold">+5V VCC (Power Rail)</text>

            {/* Bottom GND Rail */}
            <line x1="25" y1="480" x2="1055" y2="480" stroke="#2563eb" strokeWidth="2" />
            <text x="35" y="475" fill="#1d4ed8" fontSize="9" fontWeight="bold">GND (0V Reference)</text>

            {/* IC Ground drops to bottom rail */}
            {/* 8086 Pins 1, 20 to GND */}
            <line x1="97" y1="425" x2="97" y2="480" stroke="#2563eb" strokeWidth="1.5" />
            <circle cx="97" cy="480" r="2.5" fill="#2563eb" />
            <text x="101" y="460" fill="#2563eb" fontSize="6.5">8086 Pins 1, 20 (GND)</text>

            {/* 74LS138 Pin 8 to GND */}
            <line x1="275" y1="425" x2="275" y2="480" stroke="#2563eb" strokeWidth="1.5" />
            <circle cx="275" cy="480" r="2.5" fill="#2563eb" />
            <text x="279" y="460" fill="#2563eb" fontSize="6.5">74LS138 Pin 8 (GND)</text>

            {/* 8255 Pin 7 to GND */}
            <line x1="510" y1="470" x2="510" y2="480" stroke="#2563eb" strokeWidth="1.5" />
            <circle cx="510" cy="480" r="2.5" fill="#2563eb" />
            <text x="515" y="475" fill="#2563eb" fontSize="6.5">8255 Pin 7 (GND Sink for Rows)</text>

            {/* Keypad column reference label */}
            <text x="932.5" y="475" fill="#64748b" fontSize="6" textAnchor="middle" fontStyle="italic">
              Keypad Columns float HIGH (+5V via RP1) • Sunk to 0V dynamically through 8255 Rows
            </text>

            {/* ============================================================== */}
            {/* 1. CHIP U1: 8086 CPU                                           */}
            {/* ============================================================== */}
            <g 
              onClick={() => setSelectedChip('u1')}
              className="cursor-pointer transition-all group"
              transform="translate(25, 45)"
            >
              <title>U1: Intel 8086 16-Bit Microprocessor (CPU)</title>
              <rect
                x="0"
                y="0"
                width="145"
                height="380"
                rx="6"
                fill="#ffffff"
                stroke={selectedChip === 'u1' ? '#4f46e5' : '#94a3b8'}
                strokeWidth={selectedChip === 'u1' ? '2.5' : '1.5'}
              />
              <rect x="0" y="0" width="145" height="30" rx="6" fill="#eef2ff" stroke="#c7d2fe" strokeWidth="1" />
              <text x="72.5" y="13" fill="#312e81" fontWeight="bold" textAnchor="middle" fontSize="9.5">U1 : 8086</text>
              <text x="72.5" y="24" fill="#4338ca" fontWeight="bold" textAnchor="middle" fontSize="7">16-BIT MICROPROCESSOR (CPU)</text>

              {/* Mode & Operational Info */}
              <text x="10" y="46" fill="#64748b" fontSize="7.5" fontWeight="bold">MIN MODE (MN/M̅X̅=1)</text>
              <text x="10" y="58" fill="#64748b" fontSize="7.5">CLK: 5MHz • VCC: +5V</text>

              <text x="10" y="280" fill="#4338ca" fontSize="7.5" fontWeight="bold">Keypad Scan Loop:</text>
              <text x="10" y="298" fill="#1e293b" fontSize="7">OUT 80H, AL (Rows)</text>
              <text x="10" y="314" fill="#1e293b" fontSize="7">IN AL, 82H (Cols)</text>
              <text x="10" y="332" fill="#6366f1" fontSize="7" fontWeight="bold">CALL DEBOUNCE</text>

              {/* Right Pin Labels (Aligned with Interconnect Traces) */}
              <text x="135" y="84" fill="#dc2626" fontWeight="bold" textAnchor="end" fontSize="7.5">AD0–AD7</text>
              <text x="135" y="114" fill="#dc2626" textAnchor="end" fontSize="7.5">AD8–AD15</text>
              <text x="135" y="144" fill="#059669" fontWeight="bold" textAnchor="end" fontSize="7.5">ALE (Pin 25)</text>
              <text x="135" y="174" fill="#d97706" fontWeight="bold" textAnchor="end" fontSize="7.5">M/I̅O̅ (Pin 28)</text>
              <text x="135" y="204" fill="#d97706" fontWeight="bold" textAnchor="end" fontSize="7.5">W̅R̅ (Pin 29)</text>
              <text x="135" y="234" fill="#d97706" textAnchor="end" fontSize="7.5">R̅D̅ (Pin 32)</text>
              <text x="135" y="264" fill="#64748b" textAnchor="end" fontSize="7.5">RESET (Pin 21)</text>

              {[80, 110, 140, 170, 200, 230, 260].map((y, i) => (
                <circle key={i} cx="145" cy={y} r="3" fill="#4f46e5" />
              ))}
            </g>

            {/* ============================================================== */}
            {/* 2. CHIP U2: 74LS373 OCTAL ADDRESS LATCH                        */}
            {/* ============================================================== */}
            <g 
              onClick={() => setSelectedChip('u2')}
              className="cursor-pointer transition-all group"
              transform="translate(245, 45)"
            >
              <title>U2: 74LS373 Octal Transparent D-Type Latch</title>
              <rect
                x="0"
                y="0"
                width="165"
                height="165"
                rx="6"
                fill="#ffffff"
                stroke={selectedChip === 'u2' ? '#4f46e5' : '#94a3b8'}
                strokeWidth={selectedChip === 'u2' ? '2.5' : '1.5'}
              />
              <rect x="0" y="0" width="165" height="30" rx="6" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1" />
              <text x="82.5" y="13" fill="#14532d" fontWeight="bold" textAnchor="middle" fontSize="9.5">U2 : 74LS373</text>
              <text x="82.5" y="24" fill="#15803d" fontWeight="bold" textAnchor="middle" fontSize="7">OCTAL ADDRESS LATCH</text>

              {/* Left Inputs */}
              <text x="10" y="84" fill="#dc2626" fontWeight="bold" fontSize="7.5">AD0–AD7</text>
              <text x="10" y="114" fill="#64748b" fontSize="7">O̅E̅ (Pin 1: GND)</text>
              <text x="10" y="144" fill="#059669" fontWeight="bold" fontSize="7.5">LE (Pin 11)</text>

              {/* Right Outputs (Spaced and Un-overlapping) */}
              <text x="155" y="84" fill="#2563eb" textAnchor="end" fontWeight="bold" fontSize="7">A0 (Q0: Pin 2)</text>
              <text x="155" y="114" fill="#2563eb" textAnchor="end" fontWeight="bold" fontSize="7">A1 (Q1: Pin 5)</text>
              <text x="155" y="144" fill="#2563eb" textAnchor="end" fontSize="7">A2–A7 (Q2–Q7)</text>

              {/* Input Pin Dots */}
              <circle cx="0" cy="80" r="3" fill="#dc2626" />
              <circle cx="0" cy="110" r="2.5" fill="#64748b" />
              <circle cx="0" cy="140" r="3" fill="#059669" />

              {/* Output Pin Dots */}
              <circle cx="165" cy="80" r="3" fill="#2563eb" />
              <circle cx="165" cy="110" r="3" fill="#2563eb" />
              <circle cx="165" cy="140" r="3" fill="#2563eb" />
            </g>

            {/* ============================================================== */}
            {/* 3. CHIP U3: 74LS138 3-to-8 ADDRESS DECODER                     */}
            {/* ============================================================== */}
            <g 
              onClick={() => setSelectedChip('u3')}
              className="cursor-pointer transition-all group"
              transform="translate(245, 235)"
            >
              <title>U3: 74LS138 3-to-8 Line Address Decoder</title>
              <rect
                x="0"
                y="0"
                width="165"
                height="190"
                rx="6"
                fill="#ffffff"
                stroke={selectedChip === 'u3' ? '#4f46e5' : '#94a3b8'}
                strokeWidth={selectedChip === 'u3' ? '2.5' : '1.5'}
              />
              <rect x="0" y="0" width="165" height="30" rx="6" fill="#fffbeb" stroke="#fef08a" strokeWidth="1" />
              <text x="82.5" y="13" fill="#78350f" fontWeight="bold" textAnchor="middle" fontSize="9.5">U3 : 74LS138</text>
              <text x="82.5" y="24" fill="#b45309" fontWeight="bold" textAnchor="middle" fontSize="7">3-TO-8 ADDRESS DECODER</text>

              {/* Left Inputs */}
              <text x="10" y="54" fill="#d97706" fontWeight="bold" fontSize="7.5">A2, A3, A4</text>
              <text x="10" y="84" fill="#d97706" fontSize="7">G1 (Pin 6: +5V)</text>
              <text x="10" y="114" fill="#d97706" fontWeight="bold" fontSize="7">G̅2̅A̅ (Pin 4: M/I̅O̅)</text>
              <text x="10" y="144" fill="#d97706" fontSize="7">G̅2̅B̅ (Pin 5: A7)</text>

              {/* Right Outputs */}
              <text x="155" y="74" fill="#059669" textAnchor="end" fontWeight="bold" fontSize="7.5">Y̅0̅ (Pin 15: 80H)</text>
              <text x="155" y="124" fill="#94a3b8" textAnchor="end" fontSize="7">Y̅1̅–Y̅7̅ (Unused)</text>

              <circle cx="0" cy="50" r="3" fill="#d97706" />
              <circle cx="0" cy="80" r="2.5" fill="#d97706" />
              <circle cx="0" cy="110" r="3" fill="#d97706" />
              <circle cx="0" cy="140" r="2.5" fill="#d97706" />
              <circle cx="165" cy="70" r="3" fill="#059669" />
              <circle cx="165" cy="120" r="2.5" fill="#94a3b8" />
            </g>

            {/* Wires CPU -> Latch & Decoder */}
            {/* AD0–AD7 Bus: 100% Horizontal from U1 (y=125) to U2 (y=125) */}
            <line x1="170" y1="125" x2="245" y2="125" stroke="#dc2626" strokeWidth="2.5" />
            <circle cx="205" cy="125" r="3.5" fill="#dc2626" />

            {/* D0-D7 branch bypassing over U2 to 8255 Pin D0-D7 (y=95) */}
            <path d="M 205 125 L 205 38 L 450 38 L 450 95 L 475 95" fill="none" stroke="#dc2626" strokeWidth="2" strokeDasharray="6,2" />
            <text x="328" y="34" fill="#dc2626" fontSize="7.5" fontWeight="bold" textAnchor="middle">D0–D7 (Bidirectional Data Bus)</text>

            {/* ALE wire: 100% Horizontal from U1 (y=185) to U2 LE (y=185) */}
            <line x1="170" y1="185" x2="245" y2="185" stroke="#059669" strokeWidth="2" />
            <text x="207" y="180" fill="#059669" fontSize="8" fontWeight="bold" textAnchor="middle">ALE</text>

            {/* M/I̅O̅ wire to Decoder */}
            <path d="M 170 215 L 195 215 L 195 345 L 245 345" fill="none" stroke="#d97706" strokeWidth="1.5" />
            <text x="180" y="275" fill="#d97706" fontSize="8" fontWeight="bold" textAnchor="middle">M/I̅O̅</text>

            {/* Latched Address A2-A7 wire from U2 to U3 */}
            <path d="M 410 185 L 425 185 L 425 220 L 230 220 L 230 285 L 245 285" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="4,2" />

            {/* ============================================================== */}
            {/* 4. CHIP U4: INTEL 8255A PPI                                    */}
            {/* ============================================================== */}
            <g 
              onClick={() => setSelectedChip('u4')}
              className="cursor-pointer transition-all group"
              transform="translate(475, 45)"
            >
              <title>U4: Intel 8255A Programmable Peripheral Interface (PPI)</title>
              <rect
                x="0"
                y="0"
                width="190"
                height="425"
                rx="6"
                fill="#ffffff"
                stroke={selectedChip === 'u4' ? '#4f46e5' : '#818cf8'}
                strokeWidth={selectedChip === 'u4' ? '2.5' : '2'}
              />
              <rect x="0" y="0" width="190" height="30" rx="6" fill="#eef2ff" stroke="#c7d2fe" strokeWidth="1" />
              <text x="95" y="13" fill="#312e81" fontWeight="bold" textAnchor="middle" fontSize="9.5">U4 : 8255A</text>
              <text x="95" y="24" fill="#4338ca" fontWeight="bold" textAnchor="middle" fontSize="6.5">PROGRAMMABLE PERIPHERAL INTERFACE (PPI)</text>
              <text x="95" y="42" fill="#4f46e5" fontSize="7.5" fontWeight="bold" textAnchor="middle">MODE 0 (CW = 82H) • Base: 80H</text>

              {/* Left Control & Bus Inputs */}
              <text x="10" y="54" fill="#dc2626" fontWeight="bold" fontSize="7.5">D0–D7 (Pins 34–27)</text>
              <text x="10" y="84" fill="#2563eb" fontWeight="bold" fontSize="7.5">A0 (Pin 9)</text>
              <text x="10" y="114" fill="#2563eb" fontWeight="bold" fontSize="7.5">A1 (Pin 8)</text>
              <text x="10" y="144" fill="#059669" fontWeight="bold" fontSize="7.5">C̅S̅ (Pin 6: 80H)</text>
              <text x="10" y="174" fill="#d97706" fontWeight="bold" fontSize="7.5">W̅R̅ (Pin 36)</text>
              <text x="10" y="204" fill="#d97706" fontSize="7.5">R̅D̅ (Pin 5)</text>
              <text x="10" y="234" fill="#64748b" fontSize="7.5">RESET (Pin 35 = 0)</text>

              {/* Right Output Rows (Port A: PA0–PA3: 100% Horizontal aligned with Keypad Rows) */}
              <text x="180" y="88" fill={rowBitActive[0] === 0 ? '#059669' : '#94a3b8'} fontWeight="bold" textAnchor="end" fontSize="7.5">
                PA0 (R0) [{rowBitActive[0]}]
              </text>
              <text x="180" y="153" fill={rowBitActive[1] === 0 ? '#059669' : '#94a3b8'} fontWeight="bold" textAnchor="end" fontSize="7.5">
                PA1 (R1) [{rowBitActive[1]}]
              </text>
              <text x="180" y="218" fill={rowBitActive[2] === 0 ? '#059669' : '#94a3b8'} fontWeight="bold" textAnchor="end" fontSize="7.5">
                PA2 (R2) [{rowBitActive[2]}]
              </text>
              <text x="180" y="283" fill={rowBitActive[3] === 0 ? '#059669' : '#94a3b8'} fontWeight="bold" textAnchor="end" fontSize="7.5">
                PA3 (R3) [{rowBitActive[3]}]
              </text>

              {/* Right Input Columns (Port B: PB0–PB3: Sensed via RP1) */}
              <text x="180" y="336" fill={colBit[0] === 0 ? '#e11d48' : '#d97706'} fontWeight="bold" textAnchor="end" fontSize="7.5">
                PB0 (C0) [{colBit[0]}]
              </text>
              <text x="180" y="352" fill={colBit[1] === 0 ? '#e11d48' : '#d97706'} fontWeight="bold" textAnchor="end" fontSize="7.5">
                PB1 (C1) [{colBit[1]}]
              </text>
              <text x="180" y="368" fill={colBit[2] === 0 ? '#e11d48' : '#d97706'} fontWeight="bold" textAnchor="end" fontSize="7.5">
                PB2 (C2) [{colBit[2]}]
              </text>
              <text x="180" y="384" fill={colBit[3] === 0 ? '#e11d48' : '#d97706'} fontWeight="bold" textAnchor="end" fontSize="7.5">
                PB3 (C3) [{colBit[3]}]
              </text>

              <text x="95" y="305" fill="#059669" fontSize="7" fontWeight="bold" textAnchor="middle">Port A (80H): Output (Rows)</text>
              <text x="95" y="322" fill="#d97706" fontSize="7" fontWeight="bold" textAnchor="middle">Port B (82H): Input (Cols)</text>

              {/* Input Pins dots */}
              <circle cx="0" cy="50" r="3" fill="#dc2626" />
              <circle cx="0" cy="80" r="3" fill="#2563eb" />
              <circle cx="0" cy="110" r="3" fill="#2563eb" />
              <circle cx="0" cy="140" r="3" fill="#059669" />
              <circle cx="0" cy="170" r="3" fill="#d97706" />
              <circle cx="0" cy="200" r="2.5" fill="#d97706" />
              <circle cx="0" cy="230" r="2.5" fill="#64748b" />

              {/* Output Rows Dots (Aligned with R0–R3 at 130, 195, 260, 325) */}
              {[85, 150, 215, 280].map((y, i) => (
                <circle key={i} cx="190" cy={y} r="3" fill="#059669" />
              ))}
              {/* Input Column Dots (Aligned with PB0–PB3 at 378, 394, 410, 426) */}
              {[333, 349, 365, 381].map((y, i) => (
                <circle key={i} cx="190" cy={y} r="3" fill="#d97706" />
              ))}
            </g>

            {/* Interconnects between U2, U3 and U4 */}
            {/* Latch Q0 to 8255 A0: 100% Straight Horizontal Line at y=125 */}
            <line x1="410" y1="125" x2="475" y2="125" stroke="#2563eb" strokeWidth="2" />
            <text x="442" y="120" fill="#2563eb" fontSize="7.5" fontWeight="bold" textAnchor="middle">A0</text>

            {/* Latch Q1 to 8255 A1: 100% Straight Horizontal Line at y=155 */}
            <line x1="410" y1="155" x2="475" y2="155" stroke="#2563eb" strokeWidth="2" />
            <text x="442" y="150" fill="#2563eb" fontSize="7.5" fontWeight="bold" textAnchor="middle">A1</text>

            {/* Decoder Y̅0̅ to 8255 C̅S̅: Clean Orthogonal Route */}
            <path d="M 410 305 L 440 305 L 440 185 L 475 185" fill="none" stroke="#059669" strokeWidth="2" />
            <text x="446" y="248" fill="#059669" fontSize="7.5" fontWeight="bold">C̅S̅</text>

            {/* CPU W̅R̅ to 8255 W̅R̅: Clean Orthogonal Route */}
            <path d="M 170 245 L 205 245 L 205 228 L 460 228 L 460 215 L 475 215" fill="none" stroke="#d97706" strokeWidth="1.5" strokeDasharray="5,2" />

            {/* ============================================================== */}
            {/* 5. RP1: 4x 10kΩ PULL-UP RESISTOR NETWORK (tied to +5V)         */}
            {/* Positioned cleanly below Row 3 (y=325) with zero overlap       */}
            {/* ============================================================== */}
            <g 
              onClick={() => setSelectedChip('rp1')}
              className="cursor-pointer transition-all group"
              transform="translate(705, 345)"
            >
              <title>RP1: 4 × 10kΩ Pull-Up Resistor Array (Column Sense)</title>
              <rect
                x="0"
                y="0"
                width="65"
                height="94"
                rx="4"
                fill="#f8fafc"
                stroke={selectedChip === 'rp1' ? '#4f46e5' : '#cbd5e1'}
                strokeWidth={1.5}
              />
              <rect x="0" y="0" width="65" height="23" rx="4" fill="#fee2e2" stroke="#fca5a5" strokeWidth="1" />
              <text x="32.5" y="10" fill="#dc2626" fontWeight="bold" textAnchor="middle" fontSize="7">RP1 : 10kΩ</text>
              <text x="32.5" y="19" fill="#991b1b" fontSize="5.5" textAnchor="middle" fontWeight="bold">PULL-UP TO +5V</text>

              {/* VCC Power Indicator on top of RP1 */}
              <line x1="32.5" y1="0" x2="32.5" y2="-6" stroke="#ef4444" strokeWidth="1.5" />
              <polygon points="29.5,-6 35.5,-6 32.5,-11" fill="#ef4444" />
              <text x="32.5" y="-13" fill="#dc2626" fontSize="6.5" fontWeight="bold" textAnchor="middle">+5V VCC</text>

              {/* 4 Resistors aligned with Port B C0-C3 at y = 33, 49, 65, 81 */}
              {[33, 49, 65, 81].map((y, idx) => (
                <g key={idx}>
                  <line x1="4" y1={y} x2="14" y2={y} stroke={colBit[idx] === 0 ? '#e11d48' : '#d97706'} strokeWidth="1.5" />
                  <rect x="14" y={y - 5.5} width="36" height="11" rx="2" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
                  <text x="32" y={y + 3} fill="#0f172a" fontSize="6.5" textAnchor="middle" fontWeight="bold">10k</text>
                  <line x1="50" y1={y} x2="61" y2={y} stroke={colBit[idx] === 0 ? '#e11d48' : '#d97706'} strokeWidth="1.5" />
                </g>
              ))}
            </g>

            {/* ============================================================== */}
            {/* 6. 4×4 MATRIX KEYPAD GRID                                      */}
            {/* ============================================================== */}
            <g 
              onClick={() => setSelectedChip('matrix')}
              className="cursor-pointer transition-all group"
              transform="translate(805, 45)"
            >
              <title>4×4 Matrix Keypad (16 Tactile Switches)</title>
              <rect
                x="0"
                y="0"
                width="255"
                height="425"
                rx="8"
                fill="#ffffff"
                stroke={selectedChip === 'matrix' ? '#4f46e5' : '#cbd5e1'}
                strokeWidth={selectedChip === 'matrix' ? '2.5' : '2'}
              />
              <rect x="0" y="0" width="255" height="28" rx="8" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1" />
              <text x="127.5" y="14" fill="#0f172a" fontWeight="bold" textAnchor="middle" fontSize="9">
                4×4 MATRIX KEYPAD (16 KEYS)
              </text>
              <text x="127.5" y="23" fill="#64748b" fontSize="5.5" textAnchor="middle" fontWeight="bold">
                Cols: +5V Pull-Up (RP1) • Rows: Active-LOW Grounded (PA0–PA3)
              </text>

              {/* Column labels at top */}
              {['C0', 'C1', 'C2', 'C3'].map((cName, cIdx) => (
                <text 
                  key={cIdx} 
                  x={45 + cIdx * 54} 
                  y="46" 
                  fill={colBit[cIdx] === 0 ? '#e11d48' : '#d97706'} 
                  fontSize="7.5" 
                  fontWeight="bold" 
                  textAnchor="middle"
                >
                  {cName} [{colBit[cIdx]}]
                </text>
              ))}

              {/* Matrix Switches */}
              {keyMatrix.map((row, rIdx) => {
                const isRowActive = activeRowScan === rIdx;
                const rowY = 65 + rIdx * 65;

                return (
                  <g key={rIdx}>
                    {/* Row Label on left */}
                    <text 
                      x="10" 
                      y={rowY + 22} 
                      fill={isRowActive ? '#059669' : '#64748b'} 
                      fontSize="7.5" 
                      fontWeight="bold"
                    >
                      R{rIdx}
                    </text>

                    {/* Horizontal Row Wire */}
                    <line 
                      x1="24" 
                      y1={rowY + 20} 
                      x2="235" 
                      y2={rowY + 20} 
                      stroke={isRowActive ? '#059669' : '#cbd5e1'} 
                      strokeWidth={isRowActive ? '2' : '1'} 
                    />

                    {/* 4 Keys on this row */}
                    {row.map((kLabel, cIdx) => {
                      const keyX = 45 + cIdx * 54;
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
                            y2={rIdx === 3 ? [333, 349, 365, 381][cIdx] : rowY + 45} 
                            stroke={colBit[cIdx] === 0 ? '#e11d48' : '#94a3b8'} 
                            strokeWidth="1.2" 
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
                            fontSize="10"
                            textAnchor="middle"
                          >
                            {kLabel}
                          </text>

                          {/* Switch contact bridging indicator */}
                          {isThisKeyPressed && (
                            <g>
                              <line
                                x1={keyX - 16}
                                y1={rowY + 20}
                                x2={keyX}
                                y2={rowY + 20}
                                stroke={isBridged ? '#059669' : '#3b82f6'}
                                strokeWidth="2.5"
                              />
                              <circle cx={keyX} cy={rowY + 20} r="3" fill={isBridged ? '#059669' : '#3b82f6'} />
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </g>
                );
              })}

              {/* Column Sense Internal Buses from Left edge to each Column Wire */}
              {[
                { relY: 333, keyX: 45, idx: 0 },
                { relY: 349, keyX: 99, idx: 1 },
                { relY: 365, keyX: 153, idx: 2 },
                { relY: 381, keyX: 207, idx: 3 }
              ].map((c) => (
                <g key={c.idx}>
                  <line 
                    x1="0" 
                    y1={c.relY} 
                    x2={c.keyX} 
                    y2={c.relY} 
                    stroke={colBit[c.idx] === 0 ? '#e11d48' : '#d97706'} 
                    strokeWidth={colBit[c.idx] === 0 ? '2' : '1.2'} 
                  />
                  <circle 
                    cx={c.keyX} 
                    cy={c.relY} 
                    r="2.5" 
                    fill={colBit[c.idx] === 0 ? '#e11d48' : '#d97706'} 
                  />
                </g>
              ))}

              {/* Bottom Status Banner inside Keypad box */}
              <rect x="12" y="394" width="231" height="24" rx="4" fill="#f8fafc" stroke="#e2e8f0" />
              <text x="127.5" y="405" fill={keyDetected ? '#059669' : '#64748b'} fontSize="6.5" textAnchor="middle" fontWeight="bold">
                {keyDetected 
                  ? `KEY HIT: '${pressedKey?.label}' (Row ${pressedKey?.r}=0V GND -> Col ${pressedKey?.c}=0V)`
                  : pressedKey 
                    ? `Key '${pressedKey.label}' Pressed (Waiting for Row ${pressedKey.r} to be Grounded)`
                    : 'Click any key button above to simulate a keypress'}
              </text>
              <text x="127.5" y="414" fill="#64748b" fontSize="5.5" textAnchor="middle">
                Columns are NOT hardwired to GND • Pulled to 0V only when closed key switch hits a 0V Row
              </text>
            </g>

            {/* ============================================================== */}
            {/* 7. WIRES FROM 8255 TO MATRIX & PULL-UPS                        */}
            {/* 100% straight horizontal rows with zero overlap or crossings   */}
            {/* ============================================================== */}
            {/* Port A Row Output Wires (PA0–PA3) -> Keypad Rows R0–R3 */}
            {[
              { y: 130, active: rowBitActive[0] === 0 },
              { y: 195, active: rowBitActive[1] === 0 },
              { y: 260, active: rowBitActive[2] === 0 },
              { y: 325, active: rowBitActive[3] === 0 }
            ].map((w, idx) => (
              <g key={idx}>
                <line 
                  x1="665" 
                  y1={w.y} 
                  x2="805" 
                  y2={w.y} 
                  stroke={w.active ? '#059669' : '#cbd5e1'} 
                  strokeWidth={w.active ? '2.5' : '1.2'} 
                />
                <circle cx="665" cy={w.y} r="2.5" fill={w.active ? '#059669' : '#94a3b8'} />
                <circle cx="805" cy={w.y} r="2.5" fill={w.active ? '#059669' : '#94a3b8'} />
              </g>
            ))}

            {/* Port B Column Sense Wires (PB0–PB3) through RP1 Pull-ups to Keypad Columns */}
            {[
              { y: 378, active: colBit[0] === 0 },
              { y: 394, active: colBit[1] === 0 },
              { y: 410, active: colBit[2] === 0 },
              { y: 426, active: colBit[3] === 0 }
            ].map((w, idx) => (
              <g key={idx}>
                {/* 8255 to RP1: 100% Straight Horizontal Line */}
                <line 
                  x1="665" 
                  y1={w.y} 
                  x2="705" 
                  y2={w.y} 
                  stroke={w.active ? '#e11d48' : '#d97706'} 
                  strokeWidth={w.active ? '2' : '1.2'} 
                />
                {/* RP1 to Keypad: 100% Straight Horizontal Line */}
                <line 
                  x1="770" 
                  y1={w.y} 
                  x2="805" 
                  y2={w.y} 
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

      {/* Educational Callout: Why Columns Are NOT Hardwired to Ground */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 text-[11px] font-sans text-amber-950 flex items-start gap-2.5 shadow-2xs">
        <div className="p-1 bg-amber-200 text-amber-900 rounded-md shrink-0 mt-0.5">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <div className="space-y-1">
          <p className="font-bold text-amber-950 text-xs">
            Why Keypad Columns are NOT Connected to Ground (GND):
          </p>
          <p className="text-amber-900 leading-relaxed text-[11px]">
            1. <strong>Pull-Up Resistor Architecture (RP1):</strong> Columns are <em>input lines</em> sensed by 8255 Port B (<code className="font-mono text-indigo-700 bg-amber-100/60 px-1 rounded">PB0–PB3</code>). They are pulled <strong>HIGH to +5V</strong> via the 10kΩ resistor pack (<span className="font-mono font-bold">RP1</span>) so that when all switches are open (idle state), every column reads Logic 1 (<code className="font-mono text-slate-800 bg-amber-100/60 px-1 rounded">1111b = 0FH</code>).
          </p>
          <p className="text-amber-900 leading-relaxed text-[11px]">
            2. <strong>Dynamic Active-LOW Grounding:</strong> Ground (<span className="font-mono font-bold text-emerald-800">0V</span>) is supplied by the <strong>8255 Output Rows (PA0–PA3)</strong> during active-LOW matrix scanning (driving one row LOW at a time, e.g. <code className="font-mono text-emerald-800 bg-amber-100/60 px-1 rounded">FEH, FDH, FBH, F7H</code>).
          </p>
          <p className="text-amber-900 leading-relaxed text-[11px]">
            3. <strong>Grounding on Keypress:</strong> When you press a key switch, it bridges that column to that row. If that row is currently energized to <span className="font-mono font-bold text-emerald-800">0V (GND)</span>, current sinks into the 8255, pulling that specific column down to <strong className="text-emerald-800">0.0V (Logic 0)</strong>.
          </p>
          <p className="text-rose-900 font-semibold text-[10.5px]">
            ⚠️ Electrical Note: If columns were hardwired permanently to Ground, they would permanently read 0000b (no key detection possible), and pressing a key on any unenergized HIGH row (+5V) would create a dead short-circuit to GND, damaging the 8255 output drivers!
          </p>
        </div>
      </div>
    </div>
  );
}
