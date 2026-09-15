import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  CheckCircle2,
  Info,
  Layers,
  Sparkles,
  RefreshCw,
  Cpu
} from 'lucide-react';

interface DisplaySchematicDiagramProps {
  initialDigit?: string;
  initialType?: 'cathode' | 'anode';
  initialMode?: 'single' | 'multiplexed';
}

export default function DisplaySchematicDiagram({
  initialDigit = '8',
  initialType = 'cathode',
  initialMode = 'single'
}: DisplaySchematicDiagramProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const [digitHex, setDigitHex] = useState<string>(initialDigit);
  const [displayType, setDisplayType] = useState<'cathode' | 'anode'>(initialType);
  const [circuitMode, setCircuitMode] = useState<'single' | 'multiplexed'>(initialMode);
  const [isAutoCycling, setIsAutoCycling] = useState<boolean>(true);
  const [activeMuxDigit, setActiveMuxDigit] = useState<number>(0);

  // Common Cathode segment patterns (Active HIGH: 1 = ON, 0 = OFF)
  // [a, b, c, d, e, f, g, dp]
  const segmentLookupCC: Record<string, number> = {
    '0': 0x3F, '1': 0x06, '2': 0x5B, '3': 0x4F,
    '4': 0x66, '5': 0x6D, '6': 0x7D, '7': 0x07,
    '8': 0x7F, '9': 0x6F, 'A': 0x77, 'B': 0x7C,
    'C': 0x39, 'D': 0x5E, 'E': 0x79, 'F': 0x71
  };

  const rawCodeCC = segmentLookupCC[digitHex] ?? 0x3F;
  const activePattern = displayType === 'cathode' ? rawCodeCC : ((~rawCodeCC) & 0xFF);

  // Segment bit flags: bit0=a, bit1=b, bit2=c, bit3=d, bit4=e, bit5=f, bit6=g, bit7=dp
  const segA = displayType === 'cathode' ? ((activePattern >> 0) & 1) === 1 : ((activePattern >> 0) & 1) === 0;
  const segB = displayType === 'cathode' ? ((activePattern >> 1) & 1) === 1 : ((activePattern >> 1) & 1) === 0;
  const segC = displayType === 'cathode' ? ((activePattern >> 2) & 1) === 1 : ((activePattern >> 2) & 1) === 0;
  const segD = displayType === 'cathode' ? ((activePattern >> 3) & 1) === 1 : ((activePattern >> 3) & 1) === 0;
  const segE = displayType === 'cathode' ? ((activePattern >> 4) & 1) === 1 : ((activePattern >> 4) & 1) === 0;
  const segF = displayType === 'cathode' ? ((activePattern >> 5) & 1) === 1 : ((activePattern >> 5) & 1) === 0;
  const segG = displayType === 'cathode' ? ((activePattern >> 6) & 1) === 1 : ((activePattern >> 6) & 1) === 0;
  const segDP = displayType === 'cathode' ? ((activePattern >> 7) & 1) === 1 : ((activePattern >> 7) & 1) === 0;

  // Auto-cycle through digits or multiplexed scanning
  useEffect(() => {
    if (!isAutoCycling) return;
    const interval = setInterval(() => {
      if (circuitMode === 'single') {
        setDigitHex((prev) => {
          const digits = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'];
          const idx = digits.indexOf(prev);
          return digits[(idx + 1) % digits.length];
        });
      } else {
        setActiveMuxDigit((prev) => (prev + 1) % 4);
      }
    }, circuitMode === 'single' ? 1200 : 400);
    return () => clearInterval(interval);
  }, [isAutoCycling, circuitMode]);

  const muxDigits = ['1', '9', '8', '6'];
  const currentDisplayedChar = circuitMode === 'single' ? digitHex : muxDigits[activeMuxDigit];
  const currentMuxRawCC = segmentLookupCC[currentDisplayedChar] ?? 0x3F;
  const currentMuxPattern = displayType === 'cathode' ? currentMuxRawCC : ((~currentMuxRawCC) & 0xFF);

  const curSegA = displayType === 'cathode' ? ((currentMuxPattern >> 0) & 1) === 1 : ((currentMuxPattern >> 0) & 1) === 0;
  const curSegB = displayType === 'cathode' ? ((currentMuxPattern >> 1) & 1) === 1 : ((currentMuxPattern >> 1) & 1) === 0;
  const curSegC = displayType === 'cathode' ? ((currentMuxPattern >> 2) & 1) === 1 : ((currentMuxPattern >> 2) & 1) === 0;
  const curSegD = displayType === 'cathode' ? ((currentMuxPattern >> 3) & 1) === 1 : ((currentMuxPattern >> 3) & 1) === 0;
  const curSegE = displayType === 'cathode' ? ((currentMuxPattern >> 4) & 1) === 1 : ((currentMuxPattern >> 4) & 1) === 0;
  const curSegF = displayType === 'cathode' ? ((currentMuxPattern >> 5) & 1) === 1 : ((currentMuxPattern >> 5) & 1) === 0;
  const curSegG = displayType === 'cathode' ? ((currentMuxPattern >> 6) & 1) === 1 : ((currentMuxPattern >> 6) & 1) === 0;
  const curSegDP = displayType === 'cathode' ? ((currentMuxPattern >> 7) & 1) === 1 : ((currentMuxPattern >> 7) & 1) === 0;

  const chipInfo: Record<string, { title: string; subtitle: string; desc: string; pins: { pin: string; func: string }[] }> = {
    u1: {
      title: 'U1: Intel 8086 16-Bit Microprocessor',
      subtitle: 'Part: 8086 • Component: Microprocessor (CPU)',
      desc: 'Executes 7-segment display driver software, outputs BCD/hex lookup segment patterns via OUT 80H, AL, and generates multiplexing digit strobe controls on Port C.',
      pins: [
        { pin: 'Pin 33 (MN/MX#)', func: 'Tied to +5V VCC to configure 8086 in Minimum Mode.' },
        { pin: 'Pin 25 (ALE)', func: 'Address Latch Enable connected to 74LS373 Pin 11 (LE) to latch lower address bits A0–A7.' },
        { pin: 'Pin 28 (M/IO#)', func: 'Outputs LOW (0V) during I/O operations to enable 74LS138 decoder.' },
        { pin: 'Pin 29 (WR#)', func: 'Active-low write strobe connected to 8255 WR# (Pin 36).' },
        { pin: 'Pin 32 (RD#)', func: 'Active-low read strobe connected to 8255 RD# (Pin 5).' },
        { pin: 'Pins AD0–AD7', func: 'Multiplexed address/data bus connected to 74LS373 inputs and 8255 D0–D7 lines.' }
      ]
    },
    u2: {
      title: 'U2: 74LS373 Octal Transparent D-Latch',
      subtitle: 'Part: 74LS373 • Component: Octal Address Latch',
      desc: 'Captures and holds stable address lines A0, A1, A2 from AD0–AD7 when ALE pulses HIGH during clock cycle T1.',
      pins: [
        { pin: 'Pin 11 (LE)', func: 'Connected to 8086 ALE (Pin 25).' },
        { pin: 'Pin 1 (OE#)', func: 'Connected to GND (0V) for active transparent output driving.' },
        { pin: 'Pins Q0, Q1', func: 'Latched address outputs connected to 8255 A0 (Pin 9) and A1 (Pin 8).' }
      ]
    },
    u3: {
      title: 'U3: 74LS138 3-to-8 Line Address Decoder',
      subtitle: 'Part: 74LS138 • Component: 3-to-8 Address Decoder',
      desc: 'Decodes upper address lines (A2–A7) and M/IO# to generate active-low CS# for the 8255 PPI at base I/O address 80H–86H.',
      pins: [
        { pin: 'Pin 6 (G1)', func: 'Active-HIGH enable tied to +5V VCC.' },
        { pin: 'Pins 4, 5 (G2A#, G2B#)', func: 'Active-LOW enables tied to 8086 M/IO# and address line A7.' },
        { pin: 'Pin 15 (Y0#)', func: 'Asserted LOW when address is 80H–87H, connected to 8255 CS# (Pin 6).' }
      ]
    },
    u4: {
      title: 'U4: Intel 8255A Programmable Peripheral Interface (PPI)',
      subtitle: 'Part: 8255A • Component: Programmable Peripheral Interface (PPI)',
      desc: 'Initialized with Control Word 80H (Mode 0, all ports output). Port A (PA0–PA7) drives 7-segment data (a–g, dp). Port C (PC0–PC3) drives digit enable switching transistors.',
      pins: [
        { pin: 'Pins 34–27 (D0–D7)', func: '8-bit bidirectional data bus from 8086 CPU.' },
        { pin: 'Pins 4–1, 40–37 (PA0–PA7)', func: 'Segment data lines driving anodes/cathodes a, b, c, d, e, f, g, dp.' },
        { pin: 'Pins 14–17 (PC0–PC3)', func: 'Digit select strobe lines driving multiplexing transistors Q1–Q4.' },
        { pin: 'Pin 6 (CS#)', func: 'Chip Select from 74LS138 Y0# (Address 80H).' }
      ]
    },
    rn1: {
      title: 'RN1: 8 × 330Ω Current-Limiting Resistor Array',
      subtitle: 'Part: RN1 (8×330Ω) • Component: Resistor Network Pack',
      desc: 'Limits forward LED segment current to safe levels (~10 mA per segment at 2.0V forward drop: R = (5.0V - 2.0V) / 10mA = 300Ω → standard 330Ω). Protects 8255 output buffers and display LEDs from thermal overload.',
      pins: [
        { pin: 'Pins 1–8 (Inputs)', func: 'Connected to 8255 Port A pins PA0–PA7.' },
        { pin: 'Pins 9–16 (Outputs)', func: 'Connected to 7-segment display pins a, b, c, d, e, f, g, dp.' }
      ]
    },
    disp: {
      title: 'DISP1: 7-Segment LED Display Unit',
      subtitle: displayType === 'cathode' ? 'Part: DISP1 • Component: Common Cathode (CC) Display' : 'Part: DISP1 • Component: Common Anode (CA) Display',
      desc: displayType === 'cathode'
        ? 'Common Cathode: All LED cathodes tied to GND (0V) or switched via NPN transistor (BC547). Segment illuminated by driving corresponding anode pin HIGH (+5V).'
        : 'Common Anode: All LED anodes tied to +5V VCC or switched via PNP transistor (BC557). Segment illuminated by driving corresponding cathode pin LOW (0V).',
      pins: [
        { pin: 'Pins a, b, c, d, e, f, g, dp', func: 'Individual segment LED terminals.' },
        { pin: 'Common Pin (COM / DIG)', func: displayType === 'cathode' ? 'Tied to GND (or NPN Collector)' : 'Tied to +5V (or PNP Collector)' }
      ]
    },
    trans: {
      title: 'Q1–Q4: Digit Multiplexing Transistors',
      subtitle: displayType === 'cathode' ? 'Part: BC547 • Component: NPN Common-Cathode Drivers' : 'Part: BC557 • Component: PNP Common-Anode Drivers',
      desc: 'Allows 4 distinct digits to be time-multiplexed using a single 8-bit segment data bus. Each digit is energized in rapid succession (~50–200 Hz), relying on persistence of vision (POV) to create a flicker-free multi-digit display.',
      pins: [
        { pin: 'Base (B)', func: 'Driven by 8255 Port C pins (PC0–PC3) through 1kΩ base resistors.' },
        { pin: 'Collector (C)', func: 'Connected to Display Common Cathode (CC) or Common Anode (CA) pin.' },
        { pin: 'Emitter (E)', func: displayType === 'cathode' ? 'Connected to GND (0V)' : 'Connected to +5V VCC' }
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
              <span>Proteus Schematic: 8086 + 8255A ↔ 7-Segment LED Display</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-sans font-bold">
                Interactive EDA Circuit
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-sans">
              8086 (U1) ↔ 74LS373 (U2) ↔ 74LS138 (U3) ↔ 8255A (U4) ↔ 330Ω Pack (RN1) ↔ 7-Seg LED ({displayType.toUpperCase()})
            </p>
          </div>
        </div>

        {/* Live Controls & Injection */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-sans">
          {/* Digit Selector */}
          <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-slate-500 text-[10px] font-medium">Digit:</span>
            <select
              value={digitHex}
              onChange={(e) => {
                setDigitHex(e.target.value);
                setIsAutoCycling(false);
              }}
              className="bg-slate-50 border border-slate-300 text-indigo-700 font-mono text-xs px-1.5 py-0.5 rounded font-bold cursor-pointer focus:outline-hidden"
            >
              {['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'].map((ch) => (
                <option key={ch} value={ch}>'{ch}'</option>
              ))}
            </select>
          </div>

          {/* Polarity Toggle */}
          <button
            onClick={() => setDisplayType(displayType === 'cathode' ? 'anode' : 'cathode')}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
          >
            <span className="text-slate-500">Type:</span>
            <span className="text-indigo-700 font-mono">{displayType === 'cathode' ? 'CC (Active-HI)' : 'CA (Active-LO)'}</span>
          </button>

          {/* Mode Toggle */}
          <button
            onClick={() => setCircuitMode(circuitMode === 'single' ? 'multiplexed' : 'single')}
            className={`px-2.5 py-1 rounded-lg border font-bold text-[10px] cursor-pointer transition-all shadow-2xs ${
              circuitMode === 'multiplexed' 
                ? 'bg-indigo-600 border-indigo-600 text-white' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {circuitMode === 'single' ? 'Single Digit' : '4-Digit Multiplexed'}
          </button>

          {/* Auto Cycle Toggle */}
          <button
            onClick={() => setIsAutoCycling(!isAutoCycling)}
            className={`px-2.5 py-1 rounded-lg border font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all shadow-2xs ${
              isAutoCycling 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {isAutoCycling ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isAutoCycling ? 'Auto Stepping' : 'Manual'}</span>
          </button>

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
              <pattern id="edaGridDisp" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.8" fill="#cbd5e1" opacity="0.8" />
              </pattern>
              {/* LED Glow filter */}
              <filter id="ledGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <rect width="1080" height="500" fill="url(#edaGridDisp)" />

            {/* ============================================================== */}
            {/* 1. POWER RAILS & BUS TRACES                                    */}
            {/* ============================================================== */}
            {/* +5V VCC Top Bus */}
            <line x1="25" y1="20" x2="1055" y2="20" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,2" />
            <text x="35" y="15" fill="#dc2626" fontSize="9" fontWeight="bold">+5V VCC (System Power Rail)</text>

            {/* GND Bottom Bus */}
            <line x1="25" y1="480" x2="1055" y2="480" stroke="#2563eb" strokeWidth="2" />
            <text x="35" y="475" fill="#1d4ed8" fontSize="9" fontWeight="bold">GND (0V Common Reference)</text>

            {/* ============================================================== */}
            {/* 2. CHIP U1: 8086 CPU                                           */}
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
              <text x="72.5" y="13" fill="#312e81" fontWeight="bold" textAnchor="middle" fontSize="10.5">U1 : 8086</text>
              <text x="72.5" y="24" fill="#4338ca" fontWeight="bold" textAnchor="middle" fontSize="7.5">16-BIT MICROPROCESSOR (CPU)</text>

              {/* Mode & Operational Info */}
              <text x="10" y="46" fill="#64748b" fontSize="8" fontWeight="bold">MIN MODE (MN/MX#=1)</text>
              <text x="10" y="58" fill="#64748b" fontSize="8">CLK: 5MHz • VCC: +5V</text>

              <text x="10" y="325" fill="#4338ca" fontSize="8.5" fontWeight="bold">I/O Base: 80H</text>
              <text x="10" y="342" fill="#1e293b" fontSize="8.5" fontWeight="bold">OUT 80H, AL</text>
              <text x="10" y="358" fill="#64748b" fontSize="7.5">7-Seg Segment Data</text>

              {/* Right Pin Labels (Aligned with Interconnect Traces) */}
              <text x="135" y="84" fill="#dc2626" fontWeight="bold" textAnchor="end">AD0–AD7</text>
              <text x="135" y="114" fill="#dc2626" textAnchor="end">AD8–AD15</text>
              <text x="135" y="144" fill="#059669" fontWeight="bold" textAnchor="end">ALE (Pin 25)</text>
              <text x="135" y="174" fill="#d97706" fontWeight="bold" textAnchor="end">M/IO# (Pin 28)</text>
              <text x="135" y="204" fill="#d97706" fontWeight="bold" textAnchor="end">WR# (Pin 29)</text>
              <text x="135" y="234" fill="#d97706" textAnchor="end">RD# (Pin 32)</text>
              <text x="135" y="264" fill="#64748b" textAnchor="end">RESET (Pin 21)</text>

              {/* Right Pin Output Terminals */}
              {[80, 110, 140, 170, 200, 230, 260].map((y, i) => (
                <circle key={i} cx="145" cy={y} r="3" fill="#4f46e5" />
              ))}
            </g>

            {/* ============================================================== */}
            {/* 3. CHIP U2: 74LS373 OCTAL ADDRESS LATCH                        */}
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
              <text x="82.5" y="13" fill="#14532d" fontWeight="bold" textAnchor="middle" fontSize="10.5">U2 : 74LS373</text>
              <text x="82.5" y="24" fill="#15803d" fontWeight="bold" textAnchor="middle" fontSize="7.5">OCTAL ADDRESS LATCH</text>

              {/* Left Inputs */}
              <text x="10" y="84" fill="#dc2626" fontWeight="bold">AD0–AD7</text>
              <text x="10" y="114" fill="#64748b">OE# (Pin 1: GND)</text>
              <text x="10" y="144" fill="#059669" fontWeight="bold">LE (Pin 11)</text>

              {/* Right Outputs (Spaced and Un-overlapping) */}
              <text x="155" y="84" fill="#2563eb" textAnchor="end" fontWeight="bold">A0 (Q0: Pin 2)</text>
              <text x="155" y="114" fill="#2563eb" textAnchor="end" fontWeight="bold">A1 (Q1: Pin 5)</text>
              <text x="155" y="144" fill="#2563eb" textAnchor="end">A2–A7 (Q2–Q7)</text>

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
            {/* 4. CHIP U3: 74LS138 3-to-8 ADDRESS DECODER                     */}
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
              <text x="82.5" y="13" fill="#78350f" fontWeight="bold" textAnchor="middle" fontSize="10.5">U3 : 74LS138</text>
              <text x="82.5" y="24" fill="#b45309" fontWeight="bold" textAnchor="middle" fontSize="7.5">3-TO-8 ADDRESS DECODER</text>

              {/* Left Inputs */}
              <text x="10" y="54" fill="#d97706" fontWeight="bold">A2, A3, A4</text>
              <text x="10" y="84" fill="#d97706">G1 (Pin 6: +5V)</text>
              <text x="10" y="114" fill="#d97706" fontWeight="bold">G2A# (Pin 4: M/IO#)</text>
              <text x="10" y="144" fill="#d97706">G2B# (Pin 5: A7)</text>

              {/* Right Outputs (Clear vertical and horizontal clearance) */}
              <text x="155" y="74" fill="#059669" textAnchor="end" fontWeight="bold">Y0# (Pin 15: 80H)</text>
              <text x="155" y="124" fill="#94a3b8" textAnchor="end">Y1#–Y7# (Unused)</text>

              <circle cx="0" cy="50" r="3" fill="#d97706" />
              <circle cx="0" cy="80" r="2.5" fill="#d97706" />
              <circle cx="0" cy="110" r="3" fill="#d97706" />
              <circle cx="0" cy="140" r="2.5" fill="#d97706" />
              <circle cx="165" cy="70" r="3" fill="#059669" />
              <circle cx="165" cy="120" r="2.5" fill="#94a3b8" />
            </g>

            {/* ============================================================== */}
            {/* 5. INTERCONNECT WIRES: CPU -> LATCH & DECODER                  */}
            {/* ============================================================== */}
            {/* AD0–AD7 Bus: 100% Horizontal from U1 (y=125) to U2 (y=125) */}
            <line x1="170" y1="125" x2="245" y2="125" stroke="#dc2626" strokeWidth="2.5" />
            {/* Junction dot on AD bus for 8255 D0-D7 branch */}
            <circle cx="205" cy="125" r="3.5" fill="#dc2626" />

            {/* D0-D7 branch bypassing over U2 to 8255 Pin D0-D7 (y=95) */}
            <path d="M 205 125 L 205 38 L 450 38 L 450 95 L 475 95" fill="none" stroke="#dc2626" strokeWidth="2" strokeDasharray="6,2" />
            <text x="328" y="34" fill="#dc2626" fontSize="7.5" fontWeight="bold" textAnchor="middle">D0–D7 (Bidirectional Data Bus)</text>

            {/* ALE wire: 100% Horizontal from U1 (y=185) to U2 LE (y=185) */}
            <line x1="170" y1="185" x2="245" y2="185" stroke="#059669" strokeWidth="2" />
            <text x="207" y="180" fill="#059669" fontSize="8" fontWeight="bold" textAnchor="middle">ALE</text>

            {/* M/IO# wire: Clean 90-degree orthogonal path from U1 (y=215) down to U3 G2A# (y=345) */}
            <path d="M 170 215 L 195 215 L 195 345 L 245 345" fill="none" stroke="#d97706" strokeWidth="1.5" />
            <text x="180" y="275" fill="#d97706" fontSize="8" fontWeight="bold" textAnchor="middle">M/IO#</text>

            {/* Latched Address A2-A7 wire from U2 to U3 */}
            <path d="M 410 185 L 425 185 L 425 220 L 230 220 L 230 285 L 245 285" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="4,2" />

            {/* ============================================================== */}
            {/* 6. CHIP U4: INTEL 8255A PPI                                    */}
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
                height="380"
                rx="6"
                fill="#ffffff"
                stroke={selectedChip === 'u4' ? '#4f46e5' : '#818cf8'}
                strokeWidth={selectedChip === 'u4' ? '2.5' : '2'}
              />
              <rect x="0" y="0" width="190" height="30" rx="6" fill="#eef2ff" stroke="#c7d2fe" strokeWidth="1" />
              <text x="95" y="13" fill="#312e81" fontWeight="bold" textAnchor="middle" fontSize="10.5">U4 : 8255A</text>
              <text x="95" y="24" fill="#4338ca" fontWeight="bold" textAnchor="middle" fontSize="7">PROGRAMMABLE PERIPHERAL INTERFACE (PPI)</text>
              <text x="95" y="42" fill="#4f46e5" fontSize="8" fontWeight="bold" textAnchor="middle">MODE 0 (CW = 80H) • Base: 80H</text>

              {/* Left Control & Bus Inputs */}
              <text x="10" y="54" fill="#dc2626" fontWeight="bold">D0–D7 (Pins 34–27)</text>
              <text x="10" y="84" fill="#2563eb" fontWeight="bold">A0 (Pin 9)</text>
              <text x="10" y="114" fill="#2563eb" fontWeight="bold">A1 (Pin 8)</text>
              <text x="10" y="144" fill="#059669" fontWeight="bold">CS# (Pin 6: 80H)</text>
              <text x="10" y="174" fill="#d97706" fontWeight="bold">WR# (Pin 36)</text>
              <text x="10" y="204" fill="#d97706">RD# (Pin 5)</text>
              <text x="10" y="234" fill="#64748b">RESET (Pin 35 = 0)</text>

              {/* Right Output Ports (Port A Segments a..dp) */}
              <text x="180" y="54" fill="#059669" fontWeight="bold" textAnchor="end">PA0 (a)</text>
              <text x="180" y="78" fill="#059669" fontWeight="bold" textAnchor="end">PA1 (b)</text>
              <text x="180" y="102" fill="#059669" fontWeight="bold" textAnchor="end">PA2 (c)</text>
              <text x="180" y="126" fill="#059669" fontWeight="bold" textAnchor="end">PA3 (d)</text>
              <text x="180" y="150" fill="#059669" fontWeight="bold" textAnchor="end">PA4 (e)</text>
              <text x="180" y="174" fill="#059669" fontWeight="bold" textAnchor="end">PA5 (f)</text>
              <text x="180" y="198" fill="#059669" fontWeight="bold" textAnchor="end">PA6 (g)</text>
              <text x="180" y="222" fill="#059669" fontWeight="bold" textAnchor="end">PA7 (dp)</text>

              {/* Right Port C Digit Strobes (for Multiplexing) */}
              <text x="180" y="274" fill="#7c3aed" textAnchor="end" fontWeight="bold">PC0 (DIG 1)</text>
              <text x="180" y="296" fill="#7c3aed" textAnchor="end" fontWeight="bold">PC1 (DIG 2)</text>
              <text x="180" y="318" fill="#7c3aed" textAnchor="end" fontWeight="bold">PC2 (DIG 3)</text>
              <text x="180" y="340" fill="#7c3aed" textAnchor="end" fontWeight="bold">PC3 (DIG 4)</text>

              {/* Input Pins dots */}
              <circle cx="0" cy="50" r="3" fill="#dc2626" />
              <circle cx="0" cy="80" r="3" fill="#2563eb" />
              <circle cx="0" cy="110" r="3" fill="#2563eb" />
              <circle cx="0" cy="140" r="3" fill="#059669" />
              <circle cx="0" cy="170" r="3" fill="#d97706" />
              <circle cx="0" cy="200" r="2.5" fill="#d97706" />
              <circle cx="0" cy="230" r="2.5" fill="#64748b" />

              {/* Output Pins dots */}
              {[50, 74, 98, 122, 146, 170, 194, 218].map((y, i) => (
                <circle key={i} cx="190" cy={y} r="3" fill="#059669" />
              ))}
              {[270, 292, 314, 336].map((y, i) => (
                <circle key={i} cx="190" cy={y} r="3" fill="#7c3aed" />
              ))}
            </g>

            {/* Interconnects between U2, U3 and U4 */}
            {/* Latch Q0 to 8255 A0: 100% Straight Horizontal Line at y=125 */}
            <line x1="410" y1="125" x2="475" y2="125" stroke="#2563eb" strokeWidth="2" />
            <text x="442" y="120" fill="#2563eb" fontSize="7.5" fontWeight="bold" textAnchor="middle">A0</text>

            {/* Latch Q1 to 8255 A1: 100% Straight Horizontal Line at y=155 */}
            <line x1="410" y1="155" x2="475" y2="155" stroke="#2563eb" strokeWidth="2" />
            <text x="442" y="150" fill="#2563eb" fontSize="7.5" fontWeight="bold" textAnchor="middle">A1</text>

            {/* Decoder Y0# to 8255 CS#: Clean Orthogonal Route */}
            <path d="M 410 305 L 440 305 L 440 185 L 475 185" fill="none" stroke="#059669" strokeWidth="2" />
            <text x="446" y="248" fill="#059669" fontSize="7.5" fontWeight="bold">CS#</text>

            {/* CPU WR# to 8255 WR#: Clean Orthogonal Route */}
            <path d="M 170 245 L 205 245 L 205 228 L 460 228 L 460 215 L 475 215" fill="none" stroke="#d97706" strokeWidth="1.5" strokeDasharray="5,2" />

            {/* ============================================================== */}
            {/* 7. RN1: CURRENT LIMITING RESISTORS (8x 330Ω)                   */}
            {/* ============================================================== */}
            <g 
              onClick={() => setSelectedChip('rn1')}
              className="cursor-pointer transition-all group"
              transform="translate(705, 45)"
            >
              <title>RN1: 8 × 330Ω Current-Limiting Resistor Array</title>
              <rect
                x="0"
                y="0"
                width="65"
                height="235"
                rx="4"
                fill="#f8fafc"
                stroke={selectedChip === 'rn1' ? '#4f46e5' : '#cbd5e1'}
                strokeWidth="1.5"
              />
              {/* Header Box spaced completely above all resistors */}
              <rect x="0" y="0" width="65" height="28" rx="4" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
              <text x="32.5" y="12" fill="#b45309" fontWeight="bold" textAnchor="middle" fontSize="8">RN1 : 330Ω</text>
              <text x="32.5" y="23" fill="#64748b" fontSize="6.5" textAnchor="middle" fontWeight="bold">RESISTOR ARRAY</text>

              {/* 8 Resistors with perfectly matched Y spacing aligned with PA0-PA7 */}
              {[50, 74, 98, 122, 146, 170, 194, 218].map((y, idx) => (
                <g key={idx}>
                  <line x1="5" y1={y} x2="14" y2={y} stroke="#64748b" strokeWidth="1.5" />
                  <rect x="14" y={y - 6} width="36" height="12" rx="2" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
                  <text x="32" y={y + 3.5} fill="#0f172a" fontSize="7.5" textAnchor="middle" fontWeight="bold">330Ω</text>
                  <line x1="50" y1={y} x2="60" y2={y} stroke="#64748b" strokeWidth="1.5" />
                </g>
              ))}
            </g>

            {/* Wires from 8255 PA0-PA7 to RN1 Resistors: 100% Straight Horizontal Lines */}
            {[
              { y: 95, active: curSegA, label: 'a' },
              { y: 119, active: curSegB, label: 'b' },
              { y: 143, active: curSegC, label: 'c' },
              { y: 167, active: curSegD, label: 'd' },
              { y: 191, active: curSegE, label: 'e' },
              { y: 215, active: curSegF, label: 'f' },
              { y: 239, active: curSegG, label: 'g' },
              { y: 263, active: curSegDP, label: 'dp' }
            ].map((wire, idx) => (
              <g key={idx}>
                <line 
                  x1="665" 
                  y1={wire.y} 
                  x2="705" 
                  y2={wire.y} 
                  stroke={wire.active ? '#059669' : '#cbd5e1'} 
                  strokeWidth={wire.active ? '2' : '1.2'} 
                />
                {wire.active && (
                  <circle cx="685" cy={wire.y} r="2.5" fill="#059669" filter="url(#ledGlow)" />
                )}
              </g>
            ))}

            {/* ============================================================== */}
            {/* 8. 7-SEGMENT DISPLAY MODULE (DISP1)                            */}
            {/* ============================================================== */}
            <g 
              onClick={() => setSelectedChip('disp')}
              className="cursor-pointer transition-all group"
              transform="translate(805, 45)"
            >
              <title>DISP1: 7-Segment LED Display Module</title>
              {/* Outer Display Enclosure */}
              <rect
                x="0"
                y="0"
                width="255"
                height="285"
                rx="8"
                fill="#ffffff"
                stroke={selectedChip === 'disp' ? '#4f46e5' : '#cbd5e1'}
                strokeWidth={selectedChip === 'disp' ? '2.5' : '2'}
              />
              <rect x="0" y="0" width="255" height="26" rx="8" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1" />
              <text x="127.5" y="17" fill="#0f172a" fontWeight="bold" textAnchor="middle" fontSize="10.5">
                {circuitMode === 'single' ? 'DISP1: 7-SEGMENT LED' : 'DISP: 4-DIGIT MULTIPLEXED ARRAY'}
              </text>
              <text x="127.5" y="38" fill={displayType === 'cathode' ? '#059669' : '#db2777'} fontSize="8" textAnchor="middle" fontWeight="bold">
                {displayType === 'cathode' ? 'COMMON CATHODE (Active HIGH)' : 'COMMON ANODE (Active LOW)'}
              </text>

              {/* Segment Input Pins on Left Edge */}
              {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'dp'].map((seg, sIdx) => {
                const yPos = 50 + sIdx * 24;
                return (
                  <g key={seg}>
                    <circle cx="0" cy={yPos} r="3" fill="#059669" />
                    <text x="8" y={yPos + 3} fill="#059669" fontSize="7.5" fontWeight="bold">{seg}</text>
                  </g>
                );
              })}

              {/* In Single Mode: Large 7-Segment SVG */}
              {circuitMode === 'single' ? (
                <g transform="translate(75, 55)">
                  {/* Segment a (top) */}
                  <polygon 
                    points="15,10 75,10 65,22 25,22" 
                    fill={curSegA ? '#ef4444' : '#e2e8f0'} 
                    stroke={curSegA ? '#dc2626' : '#cbd5e1'}
                    filter={curSegA ? 'url(#ledGlow)' : undefined}
                  />
                  {/* Segment b (top-right) */}
                  <polygon 
                    points="77,12 87,22 87,78 75,68" 
                    fill={curSegB ? '#ef4444' : '#e2e8f0'} 
                    stroke={curSegB ? '#dc2626' : '#cbd5e1'}
                    filter={curSegB ? 'url(#ledGlow)' : undefined}
                  />
                  {/* Segment c (bottom-right) */}
                  <polygon 
                    points="75,82 87,72 87,138 77,148" 
                    fill={curSegC ? '#ef4444' : '#e2e8f0'} 
                    stroke={curSegC ? '#dc2626' : '#cbd5e1'}
                    filter={curSegC ? 'url(#ledGlow)' : undefined}
                  />
                  {/* Segment d (bottom) */}
                  <polygon 
                    points="25,138 65,138 75,150 15,150" 
                    fill={curSegD ? '#ef4444' : '#e2e8f0'} 
                    stroke={curSegD ? '#dc2626' : '#cbd5e1'}
                    filter={curSegD ? 'url(#ledGlow)' : undefined}
                  />
                  {/* Segment e (bottom-left) */}
                  <polygon 
                    points="13,82 25,72 25,138 13,148" 
                    fill={curSegE ? '#ef4444' : '#e2e8f0'} 
                    stroke={curSegE ? '#dc2626' : '#cbd5e1'}
                    filter={curSegE ? 'url(#ledGlow)' : undefined}
                  />
                  {/* Segment f (top-left) */}
                  <polygon 
                    points="13,12 25,22 25,78 13,68" 
                    fill={curSegF ? '#ef4444' : '#e2e8f0'} 
                    stroke={curSegF ? '#dc2626' : '#cbd5e1'}
                    filter={curSegF ? 'url(#ledGlow)' : undefined}
                  />
                  {/* Segment g (center) */}
                  <polygon 
                    points="25,75 30,70 60,70 65,75 60,80 30,80" 
                    fill={curSegG ? '#ef4444' : '#e2e8f0'} 
                    stroke={curSegG ? '#dc2626' : '#cbd5e1'}
                    filter={curSegG ? 'url(#ledGlow)' : undefined}
                  />
                  {/* Decimal point (dp) */}
                  <circle 
                    cx="98" 
                    cy="145" 
                    r="5" 
                    fill={curSegDP ? '#ef4444' : '#e2e8f0'} 
                    stroke={curSegDP ? '#dc2626' : '#cbd5e1'}
                    filter={curSegDP ? 'url(#ledGlow)' : undefined}
                  />

                  {/* Character Badge */}
                  <text x="45" y="195" fill="#4338ca" fontSize="16" fontWeight="bold" textAnchor="middle">
                    Hex: {digitHex}
                  </text>
                  <text x="45" y="212" fill="#64748b" fontSize="9" textAnchor="middle" fontWeight="bold">
                    Byte: 0x{currentMuxPattern.toString(16).toUpperCase().padStart(2, '0')}H
                  </text>
                </g>
              ) : (
                /* Multiplexed 4-Digit Array Visual */
                <g transform="translate(18, 55)">
                  {[0, 1, 2, 3].map((digIdx) => {
                    const isDigActive = activeMuxDigit === digIdx;
                    const charVal = muxDigits[digIdx];
                    const rawCC = segmentLookupCC[charVal];
                    const p = displayType === 'cathode' ? rawCC : ((~rawCC) & 0xFF);
                    const sA = displayType === 'cathode' ? ((p >> 0) & 1) === 1 : ((p >> 0) & 1) === 0;
                    const sB = displayType === 'cathode' ? ((p >> 1) & 1) === 1 : ((p >> 1) & 1) === 0;
                    const sC = displayType === 'cathode' ? ((p >> 2) & 1) === 1 : ((p >> 2) & 1) === 0;
                    const sD = displayType === 'cathode' ? ((p >> 3) & 1) === 1 : ((p >> 3) & 1) === 0;
                    const sE = displayType === 'cathode' ? ((p >> 4) & 1) === 1 : ((p >> 4) & 1) === 0;
                    const sF = displayType === 'cathode' ? ((p >> 5) & 1) === 1 : ((p >> 5) & 1) === 0;
                    const sG = displayType === 'cathode' ? ((p >> 6) & 1) === 1 : ((p >> 6) & 1) === 0;

                    return (
                      <g key={digIdx} transform={`translate(${digIdx * 54}, 0)`}>
                        <rect
                          x="2"
                          y="0"
                          width="50"
                          height="120"
                          rx="4"
                          fill={isDigActive ? '#eef2ff' : '#f8fafc'}
                          stroke={isDigActive ? '#6366f1' : '#cbd5e1'}
                          strokeWidth={isDigActive ? '2' : '1'}
                        />
                        {/* Mini Segments */}
                        <polygon points="12,12 40,12 36,18 16,18" fill={(isDigActive && sA) ? '#ef4444' : '#e2e8f0'} />
                        <polygon points="41,13 46,18 46,55 40,50" fill={(isDigActive && sB) ? '#ef4444' : '#e2e8f0'} />
                        <polygon points="40,55 46,50 46,92 41,97" fill={(isDigActive && sC) ? '#ef4444' : '#e2e8f0'} />
                        <polygon points="16,92 36,92 40,98 12,98" fill={(isDigActive && sD) ? '#ef4444' : '#e2e8f0'} />
                        <polygon points="11,55 17,50 17,92 11,97" fill={(isDigActive && sE) ? '#ef4444' : '#e2e8f0'} />
                        <polygon points="11,13 17,18 17,55 11,50" fill={(isDigActive && sF) ? '#ef4444' : '#e2e8f0'} />
                        <polygon points="16,52 36,52 38,55 36,58 16,58 14,55" fill={(isDigActive && sG) ? '#ef4444' : '#e2e8f0'} />

                        <text x="27" y="112" fill={isDigActive ? '#4338ca' : '#64748b'} fontSize="9" textAnchor="middle" fontWeight="bold">
                          DIG {digIdx + 1}
                        </text>
                        {isDigActive && (
                          <circle cx="27" cy="128" r="3" fill="#059669" filter="url(#ledGlow)" />
                        )}
                      </g>
                    );
                  })}
                  <text x="110" y="160" fill="#0f172a" fontSize="11" textAnchor="middle" fontWeight="bold">
                    Multiplexed Output: "1986"
                  </text>
                  <text x="110" y="178" fill="#4338ca" fontSize="8.5" textAnchor="middle" fontWeight="bold">
                    Active Scan: DIG {activeMuxDigit + 1} (PC{activeMuxDigit} = {displayType === 'cathode' ? 'HIGH' : 'LOW'})
                  </text>
                </g>
              )}
            </g>

            {/* Wires from Resistor Pack to 7-Segment Display Inputs: 100% Straight Horizontal Lines */}
            {[95, 119, 143, 167, 191, 215, 239, 263].map((y, idx) => (
              <line key={idx} x1="770" y1={y} x2="805" y2={y} stroke="#059669" strokeWidth="1.5" />
            ))}

            {/* ============================================================== */}
            {/* 9. TRANSISTOR MULTIPLEXING DRIVERS (Q1–Q4)                     */}
            {/* ============================================================== */}
            <g 
              onClick={() => setSelectedChip('trans')}
              className="cursor-pointer transition-all group"
              transform="translate(805, 345)"
            >
              <title>Q1–Q4: Digit Multiplexing Transistors</title>
              <rect
                x="0"
                y="0"
                width="255"
                height="80"
                rx="6"
                fill="#ffffff"
                stroke={selectedChip === 'trans' ? '#4f46e5' : '#cbd5e1'}
                strokeWidth="1.5"
              />
              <text x="127.5" y="16" fill="#7c3aed" fontWeight="bold" textAnchor="middle" fontSize="9">
                {displayType === 'cathode' ? 'Q1–Q4: BC547 NPN DRIVERS (CC)' : 'Q1–Q4: BC557 PNP DRIVERS (CA)'}
              </text>
              <text x="127.5" y="30" fill="#64748b" fontSize="7.5" textAnchor="middle">
                Driven by 8255 Port C (PC0–PC3) via 1kΩ Base Resistors
              </text>

              {/* Transistor Symbols */}
              {[0, 1, 2, 3].map((tIdx) => {
                const xPos = 25 + tIdx * 58;
                const isTActive = activeMuxDigit === tIdx;
                return (
                  <g key={tIdx} transform={`translate(${xPos}, 38)`}>
                    <circle cx="12" cy="14" r="11" fill="#f8fafc" stroke={isTActive ? '#059669' : '#cbd5e1'} strokeWidth="1.5" />
                    <text x="12" y="17.5" fill={isTActive ? '#059669' : '#64748b'} fontSize="7.5" textAnchor="middle" fontWeight="bold">
                      Q{tIdx + 1}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* Port C Wires down to Transistors: Clean stepped bus bracket */}
            <path 
              d="M 665 330 L 685 330 L 685 385 L 805 385" 
              fill="none" 
              stroke="#7c3aed" 
              strokeWidth="2" 
              strokeDasharray="5,2"
            />
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

      {/* Segment Encoding Truth Table & Quick Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-sans">
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block text-[9px] font-bold uppercase">Active Hex Digit:</span>
          <span className="text-slate-900 font-mono font-extrabold text-xs">'{currentDisplayedChar}'</span>
          <p className="text-[9px] text-slate-400 mt-0.5">Lookup index in table</p>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block text-[9px] font-bold uppercase">8255 Port A Code:</span>
          <span className="text-emerald-700 font-mono font-extrabold text-xs">0x{currentMuxPattern.toString(16).toUpperCase().padStart(2, '0')}H</span>
          <p className="text-[9px] text-slate-400 mt-0.5">{displayType === 'cathode' ? 'Active HIGH (CC)' : 'Active LOW (CA)'}</p>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block text-[9px] font-bold uppercase">Active Segments:</span>
          <span className="text-indigo-700 font-mono font-extrabold text-xs">
            {[
              curSegA ? 'a' : '',
              curSegB ? 'b' : '',
              curSegC ? 'c' : '',
              curSegD ? 'd' : '',
              curSegE ? 'e' : '',
              curSegF ? 'f' : '',
              curSegG ? 'g' : '',
              curSegDP ? 'dp' : ''
            ].filter(Boolean).join(', ')}
          </span>
          <p className="text-[9px] text-slate-400 mt-0.5">Illuminated branches</p>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block text-[9px] font-bold uppercase">Protection Network:</span>
          <span className="text-amber-700 font-mono font-extrabold text-xs">8 × 330Ω (RN1)</span>
          <p className="text-[9px] text-slate-400 mt-0.5">I_seg ≈ 10 mA @ 2.0V drop</p>
        </div>
      </div>
    </div>
  );
}
