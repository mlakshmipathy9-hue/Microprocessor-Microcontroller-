import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Sparkles,
  Layers,
  Timer,
  AlertTriangle,
  RotateCw,
  Cpu
} from 'lucide-react';

interface TrafficSchematicDiagramProps {
  initialPhase?: number; // 0..3
}

export default function TrafficSchematicDiagram({
  initialPhase = 0
}: TrafficSchematicDiagramProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const [phaseIndex, setPhaseIndex] = useState<number>(initialPhase);
  const [isAutoCycling, setIsAutoCycling] = useState<boolean>(true);
  const [emergencyMode, setEmergencyMode] = useState<'normal' | 'all_red' | 'ns_priority' | 'ew_priority'>('normal');
  const [pedestrianRequested, setPedestrianRequested] = useState<boolean>(false);

  // 4 Main Traffic States
  const phases = [
    {
      id: 0,
      title: 'Phase 1: North-South GREEN, East-West RED',
      codePortA: 0x21, // PA5(EW G)=0, PA4(EW Y)=0, PA3(EW R)=1, PA2(NS G)=1, PA1(NS Y)=0, PA0(NS R)=0 -> 00100001b = 21H
      ns: 'green',
      ew: 'red',
      duration: 3500,
      desc: 'NS Corridor Traffic Flowing (30s)'
    },
    {
      id: 1,
      title: 'Phase 2: North-South YELLOW, East-West RED',
      codePortA: 0x11, // PA5=0, PA4=0, PA3=1, PA2=0, PA1=1, PA0=0 -> 00010001b = 11H
      ns: 'yellow',
      ew: 'red',
      duration: 1500,
      desc: 'NS Corridor Clearance Warning (5s)'
    },
    {
      id: 2,
      title: 'Phase 3: North-South RED, East-West GREEN',
      codePortA: 0x0C, // PA5=0, PA4=0, PA3=0, PA2=0, PA1=0, PA0=1 + PA5 EW G -> PA5=1, PA0=1 -> 00100100b or 0CH / 24H (EW Green = 1, NS Red = 1)
      ns: 'red',
      ew: 'green',
      duration: 3500,
      desc: 'EW Corridor Traffic Flowing (30s)'
    },
    {
      id: 3,
      title: 'Phase 4: North-South RED, East-West YELLOW',
      codePortA: 0x0A, // PA4=1 (EW Yellow), PA0=1 (NS Red) -> 00010001b or 0AH / 12H
      ns: 'red',
      ew: 'yellow',
      duration: 1500,
      desc: 'EW Corridor Clearance Warning (5s)'
    }
  ];

  const currentPhase = phases[phaseIndex];

  // Effective lights calculation
  let effectiveNS = currentPhase.ns;
  let effectiveEW = currentPhase.ew;
  let activeCode = currentPhase.codePortA;

  if (emergencyMode === 'all_red') {
    effectiveNS = 'red';
    effectiveEW = 'red';
    activeCode = 0x09; // NS Red (PA0) + EW Red (PA3)
  } else if (emergencyMode === 'ns_priority') {
    effectiveNS = 'green';
    effectiveEW = 'red';
    activeCode = 0x21;
  } else if (emergencyMode === 'ew_priority') {
    effectiveNS = 'red';
    effectiveEW = 'green';
    activeCode = 0x0C;
  }

  // Bit states:
  // PA0: NS Red, PA1: NS Yellow, PA2: NS Green
  // PA3: EW Red, PA4: EW Yellow, PA5: EW Green
  const pa0_ns_red = effectiveNS === 'red';
  const pa1_ns_yel = effectiveNS === 'yellow';
  const pa2_ns_grn = effectiveNS === 'green';

  const pa3_ew_red = effectiveEW === 'red';
  const pa4_ew_yel = effectiveEW === 'yellow';
  const pa5_ew_grn = effectiveEW === 'green';

  // Auto state cycling
  useEffect(() => {
    if (!isAutoCycling || emergencyMode !== 'normal') return;
    const interval = setTimeout(() => {
      setPhaseIndex((prev) => (prev + 1) % phases.length);
    }, currentPhase.duration);
    return () => clearTimeout(interval);
  }, [isAutoCycling, phaseIndex, emergencyMode, currentPhase.duration, phases.length]);

  const chipInfo: Record<string, { title: string; subtitle: string; desc: string; pins: { pin: string; func: string }[] }> = {
    u1: {
      title: 'U1: Intel 8086 16-Bit Microprocessor',
      subtitle: 'Traffic Intersection State Controller',
      desc: 'Executes the 4-phase traffic state sequencer program. Writes LED activation bytes (21H, 11H, 0CH, 0AH) to 8255 Port A (80H), calls nested software delay loops (~30s Green, ~5s Yellow), and polls Port C for pedestrian pushbuttons.',
      pins: [
        { pin: 'Pin 33 (MN/MX#)', func: 'Tied to +5V VCC to set Minimum Mode.' },
        { pin: 'Pin 25 (ALE)', func: 'Address Latch Enable connected to 74LS373 (Pin 11).' },
        { pin: 'Pin 28 (M/IO#)', func: 'Asserted LOW for I/O cycles to enable 74LS138 decoder.' },
        { pin: 'Pin 29 (WR#)', func: 'Write strobe connected to 8255 WR# (Pin 36).' },
        { pin: 'AD0–AD7', func: 'Multiplexed address/data bus lines.' }
      ]
    },
    u2: {
      title: 'U2: 74LS373 Octal Transparent D-Latch',
      subtitle: 'Lower Address Demultiplexer',
      desc: 'Latches lower address bits A0–A7 from multiplexed AD0–AD7 when ALE pulses HIGH during clock cycle T1, providing stable A0 and A1 lines to select 8255 internal registers.',
      pins: [
        { pin: 'Pin 11 (LE)', func: 'Driven by 8086 ALE (Pin 25).' },
        { pin: 'Pin 1 (OE#)', func: 'Connected to GND (0V) for active 3-state output.' },
        { pin: 'Pins Q0, Q1', func: 'Latched address outputs connected to 8255 A0 and A1.' }
      ]
    },
    u3: {
      title: 'U3: 74LS138 3-to-8 Line Decoder',
      subtitle: 'I/O Chip Select Generator (Base 80H)',
      desc: 'Decodes upper address lines A2–A7 and M/IO# to assert active-low CS# (Pin 6) on the 8255 for I/O port address range 80H–87H.',
      pins: [
        { pin: 'Pin 6 (G1)', func: 'Tied to +5V VCC.' },
        { pin: 'Pins 4, 5 (G2A#, G2B#)', func: 'Tied to 8086 M/IO# and A7.' },
        { pin: 'Pin 15 (Y0#)', func: 'Asserted LOW for addresses 80H–87H -> 8255 CS#.' }
      ]
    },
    u4: {
      title: 'U4: Intel 8255A Programmable Peripheral Interface (PPI)',
      subtitle: 'Traffic Signal I/O Interface (CW = 80H)',
      desc: 'Configured in Mode 0 (Basic I/O) with Control Word 80H. Port A (PA0–PA5) outputs active signal bits for North-South and East-West traffic light LEDs. Port C senses pedestrian crosswalk buttons.',
      pins: [
        { pin: 'PA0, PA1, PA2', func: 'North-South RED, YELLOW, GREEN output lines.' },
        { pin: 'PA3, PA4, PA5', func: 'East-West RED, YELLOW, GREEN output lines.' },
        { pin: 'PC0 (Pin 14)', func: 'Pedestrian Crossing Request Pushbutton input.' },
        { pin: 'Pins 34–27 (D0–D7)', func: '8-bit bidirectional data bus from 8086 CPU.' }
      ]
    },
    u5: {
      title: 'U5: 7407 / 74LS244 Hex Buffer / Driver IC',
      subtitle: 'High-Current LED Driver Array',
      desc: 'Open-collector buffer capable of sinking up to 30–40 mA per channel at up to +15V. Protects 8255 PPI output pins from heavy current draw when illuminating 12 high-brightness LEDs simultaneously.',
      pins: [
        { pin: 'Inputs (1A–6A)', func: 'Driven by 8255 Port A pins (PA0–PA5).' },
        { pin: 'Outputs (1Y–6Y)', func: 'Connected to LED cathodes/anodes through current limiting resistors.' }
      ]
    },
    signals: {
      title: '4-Way Traffic Intersection Signal Heads',
      subtitle: 'North, South, East, West 12-LED Array',
      desc: 'Consists of 4 traffic signal clusters. Each signal head contains Red (630 nm), Yellow (590 nm), and Green (525 nm) LEDs with 330Ω ballast resistors, providing clear optical guidance for intersecting traffic corridors.',
      pins: [
        { pin: 'North & South Heads', func: 'Synchronized in parallel to guarantee identical corridor rights-of-way.' },
        { pin: 'East & West Heads', func: 'Synchronized in parallel perpendicular to North-South corridor.' }
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
              <span>Proteus Schematic: 8086 + 8255A ↔ Traffic Light Controller</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-sans font-bold">
                4-Way Intersection
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-sans">
              8086 (U1) ↔ 74LS373 (U2) ↔ 74LS138 (U3) ↔ 8255A (U4) ↔ 7407 Driver (U5) ↔ NS &amp; EW LED Clusters
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-sans">
          {/* Phase Selector */}
          <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-slate-500 text-[10px] font-medium">Phase:</span>
            <select
              value={phaseIndex}
              onChange={(e) => {
                setPhaseIndex(parseInt(e.target.value));
                setIsAutoCycling(false);
                setEmergencyMode('normal');
              }}
              className="bg-slate-50 border border-slate-300 text-indigo-700 font-mono text-xs px-1.5 py-0.5 rounded font-bold cursor-pointer focus:outline-hidden"
            >
              <option value={0}>Phase 1: NS Green / EW Red</option>
              <option value={1}>Phase 2: NS Yellow / EW Red</option>
              <option value={2}>Phase 3: NS Red / EW Green</option>
              <option value={3}>Phase 4: NS Red / EW Yellow</option>
            </select>
          </div>

          {/* Auto Cycle Button */}
          <button
            onClick={() => {
              setIsAutoCycling(!isAutoCycling);
              setEmergencyMode('normal');
            }}
            className={`px-2.5 py-1 rounded-lg border font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all shadow-2xs ${
              isAutoCycling && emergencyMode === 'normal'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {isAutoCycling ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isAutoCycling ? 'Auto Sequencing' : 'Manual Mode'}</span>
          </button>

          {/* Emergency Modes */}
          <select
            value={emergencyMode}
            onChange={(e) => {
              setEmergencyMode(e.target.value as any);
              setIsAutoCycling(false);
            }}
            className="bg-white border border-slate-200 text-amber-700 font-sans text-[10px] px-2 py-1 rounded-lg font-bold cursor-pointer shadow-2xs focus:outline-hidden"
          >
            <option value="normal">Mode: Normal Cycle</option>
            <option value="all_red">Emergency: All RED</option>
            <option value="ns_priority">Priority: North-South</option>
            <option value="ew_priority">Priority: East-West</option>
          </select>

          {/* Pedestrian Request Button */}
          <button
            onClick={() => {
              setPedestrianRequested(true);
              setTimeout(() => setPedestrianRequested(false), 3000);
            }}
            className={`px-2 py-1 rounded-lg border text-[10px] font-bold cursor-pointer transition-all shadow-2xs ${
              pedestrianRequested
                ? 'bg-amber-500 text-white border-amber-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {pedestrianRequested ? 'Walk Button Pressed (PC0=1)' : 'Press Pedestrian Call'}
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
          <svg viewBox="0 0 980 490" className="w-full h-auto select-none font-mono text-[10px]">
            {/* Grid Pattern Background */}
            <defs>
              <pattern id="edaGridTraffic" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.8" fill="#cbd5e1" opacity="0.8" />
              </pattern>
              <filter id="trafficGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <rect width="980" height="490" fill="url(#edaGridTraffic)" />

            {/* Power Rails */}
            <line x1="30" y1="25" x2="990" y2="25" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,2" />
            <text x="40" y="20" fill="#dc2626" fontSize="9" fontWeight="bold">+5V VCC (Power Rail)</text>

            <line x1="30" y1="475" x2="990" y2="475" stroke="#2563eb" strokeWidth="2" />
            <text x="40" y="470" fill="#1d4ed8" fontSize="9" fontWeight="bold">GND (0V Reference)</text>

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
                height="370"
                rx="6"
                fill="#ffffff"
                stroke={selectedChip === 'u1' ? '#4f46e5' : '#94a3b8'}
                strokeWidth={selectedChip === 'u1' ? '2.5' : '1.5'}
              />
              <rect x="0" y="0" width="135" height="26" rx="6" fill="#eef2ff" stroke="#c7d2fe" strokeWidth="1" />
              <text x="67.5" y="17" fill="#4338ca" fontWeight="bold" textAnchor="middle" fontSize="11">U1: 8086 CPU</text>
              <text x="67.5" y="38" fill="#64748b" fontSize="8" textAnchor="middle">MIN MODE (5 MHz)</text>

              <text x="10" y="70" fill="#dc2626" fontWeight="bold">AD0–AD7</text>
              <text x="10" y="95" fill="#dc2626">AD8–AD15</text>
              <text x="10" y="120" fill="#059669" fontWeight="bold">ALE (Pin 25)</text>
              <text x="10" y="145" fill="#d97706" fontWeight="bold">M/IO# (Pin 28)</text>
              <text x="10" y="170" fill="#d97706">WR# (Pin 29)</text>
              <text x="10" y="195" fill="#d97706">RD# (Pin 32)</text>
              <text x="10" y="230" fill="#4338ca" fontSize="8.5" fontWeight="bold">Traffic Code (AL):</text>
              <text x="10" y="250" fill="#1e293b" fontSize="8">P1: 21H (NS G/EW R)</text>
              <text x="10" y="268" fill="#1e293b" fontSize="8">P2: 11H (NS Y/EW R)</text>
              <text x="10" y="286" fill="#1e293b" fontSize="8">P3: 0CH (NS R/EW G)</text>
              <text x="10" y="304" fill="#1e293b" fontSize="8">P4: 0AH (NS R/EW Y)</text>
              <text x="10" y="325" fill="#6366f1" fontSize="8" fontWeight="bold">OUT 80H, AL</text>

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
                height="190"
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
                height="370"
                rx="6"
                fill="#ffffff"
                stroke={selectedChip === 'u4' ? '#4f46e5' : '#818cf8'}
                strokeWidth={selectedChip === 'u4' ? '2.5' : '2'}
              />
              <rect x="0" y="0" width="185" height="26" rx="6" fill="#eef2ff" stroke="#c7d2fe" strokeWidth="1" />
              <text x="92.5" y="17" fill="#3730a3" fontWeight="bold" textAnchor="middle" fontSize="11">U4: 8255A PPI</text>
              <text x="92.5" y="38" fill="#4f46e5" fontSize="8" textAnchor="middle">MODE 0 (CW = 80H)</text>

              {/* Left Control & Bus Inputs */}
              <text x="10" y="55" fill="#dc2626" fontWeight="bold">D0–D7 (Bus)</text>
              <text x="10" y="80" fill="#2563eb" fontWeight="bold">A0 (Pin 9)</text>
              <text x="10" y="105" fill="#2563eb" fontWeight="bold">A1 (Pin 8)</text>
              <text x="10" y="135" fill="#059669" fontWeight="bold">CS# (Pin 6)</text>
              <text x="10" y="160" fill="#d97706">WR# (Pin 36)</text>
              <text x="10" y="185" fill="#d97706">RD# (Pin 5)</text>
              <text x="10" y="210" fill="#64748b">RESET = 0</text>
              <text x="10" y="240" fill="#4f46e5" fontSize="8.5" fontWeight="bold">Base Port: 80H</text>

              {/* Right Output Lines (Port A: PA0–PA5) */}
              <text x="175" y="55" fill={pa0_ns_red ? '#dc2626' : '#94a3b8'} fontWeight="bold" textAnchor="end">
                PA0: NS RED [{pa0_ns_red ? '1' : '0'}]
              </text>
              <text x="175" y="80" fill={pa1_ns_yel ? '#d97706' : '#94a3b8'} fontWeight="bold" textAnchor="end">
                PA1: NS YEL [{pa1_ns_yel ? '1' : '0'}]
              </text>
              <text x="175" y="105" fill={pa2_ns_grn ? '#059669' : '#94a3b8'} fontWeight="bold" textAnchor="end">
                PA2: NS GRN [{pa2_ns_grn ? '1' : '0'}]
              </text>
              <text x="175" y="130" fill={pa3_ew_red ? '#dc2626' : '#94a3b8'} fontWeight="bold" textAnchor="end">
                PA3: EW RED [{pa3_ew_red ? '1' : '0'}]
              </text>
              <text x="175" y="155" fill={pa4_ew_yel ? '#d97706' : '#94a3b8'} fontWeight="bold" textAnchor="end">
                PA4: EW YEL [{pa4_ew_yel ? '1' : '0'}]
              </text>
              <text x="175" y="180" fill={pa5_ew_grn ? '#059669' : '#94a3b8'} fontWeight="bold" textAnchor="end">
                PA5: EW GRN [{pa5_ew_grn ? '1' : '0'}]
              </text>

              {/* Port C Input line for Pedestrian Call */}
              <text x="175" y="240" fill={pedestrianRequested ? '#d97706' : '#94a3b8'} fontWeight="bold" textAnchor="end">
                PC0 (Pedestrian Call)
              </text>

              {/* Input Pins dots */}
              <circle cx="0" cy="55" r="3" fill="#dc2626" />
              <circle cx="0" cy="80" r="3" fill="#2563eb" />
              <circle cx="0" cy="105" r="3" fill="#2563eb" />
              <circle cx="0" cy="135" r="3" fill="#059669" />

              {[55, 80, 105, 130, 155, 180, 240].map((y, i) => (
                <circle key={i} cx="185" cy={y} r="3" fill={i < 6 ? '#4f46e5' : '#d97706'} />
              ))}
            </g>

            {/* Wires to 8255 */}
            <path d="M 320 115 L 338 115 L 338 140 L 355 140" fill="none" stroke="#2563eb" strokeWidth="1.5" />
            <path d="M 320 140 L 338 140 L 338 165 L 355 165" fill="none" stroke="#2563eb" strokeWidth="1.5" />
            <path d="M 320 315 L 338 315 L 338 195 L 355 195" fill="none" stroke="#059669" strokeWidth="2" />

            {/* ============================================================== */}
            {/* 5. CHIP U5: 7407 / BUFFER DRIVERS (6 Channels)                 */}
            {/* ============================================================== */}
            <g 
              onClick={() => setSelectedChip('u5')}
              className="cursor-pointer transition-all"
              transform="translate(575, 95)"
            >
              <rect
                x="0"
                y="0"
                width="65"
                height="170"
                rx="4"
                fill="#f8fafc"
                stroke={selectedChip === 'u5' ? '#4f46e5' : '#cbd5e1'}
                strokeWidth="1.5"
              />
              <text x="32.5" y="16" fill="#4338ca" fontWeight="bold" textAnchor="middle" fontSize="9">U5: 7407</text>
              <text x="32.5" y="28" fill="#64748b" fontSize="7.5" textAnchor="middle">HEX BUFFERS</text>

              {/* Buffer Gates */}
              {[20, 45, 70, 95, 120, 145].map((y, idx) => (
                <g key={idx}>
                  <line x1="5" y1={y} x2="16" y2={y} stroke="#94a3b8" strokeWidth="1" />
                  <polygon points={`16,${y-7} 38,${y} 16,${y+7}`} fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
                  <line x1="38" y1={y} x2="60" y2={y} stroke="#94a3b8" strokeWidth="1" />
                </g>
              ))}
            </g>

            {/* Wires 8255 to 7407 Buffers */}
            {[
              { y: 115, active: pa0_ns_red, color: '#dc2626' },
              { y: 140, active: pa1_ns_yel, color: '#d97706' },
              { y: 165, active: pa2_ns_grn, color: '#059669' },
              { y: 190, active: pa3_ew_red, color: '#dc2626' },
              { y: 215, active: pa4_ew_yel, color: '#d97706' },
              { y: 240, active: pa5_ew_grn, color: '#059669' }
            ].map((w, idx) => (
              <line
                key={idx}
                x1="540"
                y1={w.y}
                x2="575"
                y2={w.y}
                stroke={w.active ? w.color : '#cbd5e1'}
                strokeWidth={w.active ? '2' : '1'}
              />
            ))}

            {/* ============================================================== */}
            {/* 6. TRAFFIC SIGNAL HEADS (NORTH, SOUTH, EAST, WEST)             */}
            {/* ============================================================== */}
            <g 
              onClick={() => setSelectedChip('signals')}
              className="cursor-pointer transition-all"
              transform="translate(680, 50)"
            >
              <rect
                x="0"
                y="0"
                width="265"
                height="380"
                rx="10"
                fill="#ffffff"
                stroke={selectedChip === 'signals' ? '#4f46e5' : '#cbd5e1'}
                strokeWidth={selectedChip === 'signals' ? '2.5' : '2'}
              />
              <rect x="0" y="0" width="260" height="26" rx="10" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1" />
              <text x="130" y="17" fill="#0f172a" fontWeight="bold" textAnchor="middle" fontSize="10.5">
                4-WAY TRAFFIC SIGNAL HEADS
              </text>

              {/* North-South Cluster Housing */}
              <g transform="translate(20, 38)">
                <rect x="0" y="0" width="105" height="150" rx="8" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />
                <text x="52" y="16" fill="#4338ca" fontSize="9" fontWeight="bold" textAnchor="middle">
                  NORTH / SOUTH
                </text>

                {/* Red LED */}
                <circle cx="52" cy="40" r="16" fill={pa0_ns_red ? '#ef4444' : '#fee2e2'} stroke={pa0_ns_red ? '#dc2626' : '#fca5a5'} strokeWidth="1.5" filter={pa0_ns_red ? 'url(#trafficGlow)' : undefined} />
                <text x="52" y="44" fill={pa0_ns_red ? '#ffffff' : '#b91c1c'} fontSize="8" fontWeight="bold" textAnchor="middle">RED</text>

                {/* Yellow LED */}
                <circle cx="52" cy="80" r="16" fill={pa1_ns_yel ? '#f59e0b' : '#fef3c7'} stroke={pa1_ns_yel ? '#d97706' : '#fcd34d'} strokeWidth="1.5" filter={pa1_ns_yel ? 'url(#trafficGlow)' : undefined} />
                <text x="52" y="84" fill={pa1_ns_yel ? '#ffffff' : '#b45309'} fontSize="8" fontWeight="bold" textAnchor="middle">YEL</text>

                {/* Green LED */}
                <circle cx="52" cy="120" r="16" fill={pa2_ns_grn ? '#10b981' : '#d1fae5'} stroke={pa2_ns_grn ? '#059669' : '#6ee7b7'} strokeWidth="1.5" filter={pa2_ns_grn ? 'url(#trafficGlow)' : undefined} />
                <text x="52" y="124" fill={pa2_ns_grn ? '#ffffff' : '#047857'} fontSize="8" fontWeight="bold" textAnchor="middle">GRN</text>
              </g>

              {/* East-West Cluster Housing */}
              <g transform="translate(135, 38)">
                <rect x="0" y="0" width="105" height="150" rx="8" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />
                <text x="52" y="16" fill="#b45309" fontSize="9" fontWeight="bold" textAnchor="middle">
                  EAST / WEST
                </text>

                {/* Red LED */}
                <circle cx="52" cy="40" r="16" fill={pa3_ew_red ? '#ef4444' : '#fee2e2'} stroke={pa3_ew_red ? '#dc2626' : '#fca5a5'} strokeWidth="1.5" filter={pa3_ew_red ? 'url(#trafficGlow)' : undefined} />
                <text x="52" y="44" fill={pa3_ew_red ? '#ffffff' : '#b91c1c'} fontSize="8" fontWeight="bold" textAnchor="middle">RED</text>

                {/* Yellow LED */}
                <circle cx="52" cy="80" r="16" fill={pa4_ew_yel ? '#f59e0b' : '#fef3c7'} stroke={pa4_ew_yel ? '#d97706' : '#fcd34d'} strokeWidth="1.5" filter={pa4_ew_yel ? 'url(#trafficGlow)' : undefined} />
                <text x="52" y="84" fill={pa4_ew_yel ? '#ffffff' : '#b45309'} fontSize="8" fontWeight="bold" textAnchor="middle">YEL</text>

                {/* Green LED */}
                <circle cx="52" cy="120" r="16" fill={pa5_ew_grn ? '#10b981' : '#d1fae5'} stroke={pa5_ew_grn ? '#059669' : '#6ee7b7'} strokeWidth="1.5" filter={pa5_ew_grn ? 'url(#trafficGlow)' : undefined} />
                <text x="52" y="124" fill={pa5_ew_grn ? '#ffffff' : '#047857'} fontSize="8" fontWeight="bold" textAnchor="middle">GRN</text>
              </g>

              {/* Status Banner inside Traffic Enclosure */}
              <rect x="15" y="200" width="230" height="75" rx="6" fill="#f8fafc" stroke="#e2e8f0" />
              <text x="130" y="220" fill="#4338ca" fontSize="9.5" fontWeight="bold" textAnchor="middle">
                {currentPhase.title}
              </text>
              <text x="130" y="238" fill="#64748b" fontSize="8" textAnchor="middle">
                Port A Byte: 0x{activeCode.toString(16).toUpperCase().padStart(2, '0')}H ({activeCode.toString(2).padStart(8, '0')}b)
              </text>
              <text x="130" y="256" fill={emergencyMode === 'normal' ? '#059669' : '#dc2626'} fontSize="8" textAnchor="middle" fontWeight="bold">
                {emergencyMode === 'normal' ? `Status: Active Normal Sequencing (~${currentPhase.duration/1000}s)` : `EMERGENCY OVERRIDE: ${emergencyMode.toUpperCase()}`}
              </text>

              {/* Pedestrian Crossing Strobe */}
              <rect x="15" y="285" width="235" height="80" rx="6" fill="#f8fafc" stroke="#e2e8f0" />
              <text x="132.5" y="302" fill="#0f172a" fontSize="9" fontWeight="bold" textAnchor="middle">
                PEDESTRIAN CROSSWALK
              </text>
              <g>
                <text x="75" y="335" fill={effectiveNS === 'red' ? '#059669' : '#dc2626'} fontSize="11" fontWeight="bold" textAnchor="middle">
                  {effectiveNS === 'red' ? 'WALK (NS)' : 'DON\'T WALK'}
                </text>
                <text x="190" y="335" fill={effectiveEW === 'red' ? '#059669' : '#dc2626'} fontSize="11" fontWeight="bold" textAnchor="middle">
                  {effectiveEW === 'red' ? 'WALK (EW)' : 'DON\'T WALK'}
                </text>
              </g>
              <text x="132.5" y="355" fill="#64748b" fontSize="7.5" textAnchor="middle">
                {pedestrianRequested ? 'Sensor Active (Port C PC0=1)' : 'Pushbutton Idle (Ready for Call)'}
              </text>
            </g>

            {/* Wires 7407 Buffers to Traffic Signal Heads */}
            {[
              { yBuf: 115, ySig: 128, active: pa0_ns_red, color: '#dc2626' },
              { yBuf: 140, ySig: 168, active: pa1_ns_yel, color: '#d97706' },
              { yBuf: 165, ySig: 208, active: pa2_ns_grn, color: '#059669' },
              { yBuf: 190, ySig: 128, active: pa3_ew_red, color: '#dc2626' },
              { yBuf: 215, ySig: 168, active: pa4_ew_yel, color: '#d97706' },
              { yBuf: 240, ySig: 208, active: pa5_ew_grn, color: '#059669' }
            ].map((w, idx) => (
              <line
                key={idx}
                x1="640"
                y1={w.yBuf}
                x2="680"
                y2={w.ySig}
                stroke={w.active ? w.color : '#cbd5e1'}
                strokeWidth={w.active ? '2' : '1'}
              />
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

      {/* Traffic Controller Live Truth Table Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-sans">
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block text-[9px] font-bold uppercase">8255 Port A Data:</span>
          <span className="text-emerald-700 font-mono font-extrabold text-xs">
            0x{activeCode.toString(16).toUpperCase().padStart(2, '0')}H
          </span>
          <p className="text-[9px] text-slate-400 mt-0.5">Control byte output to LEDs</p>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block text-[9px] font-bold uppercase">North-South Signal:</span>
          <span className={`font-mono font-extrabold text-xs ${
            effectiveNS === 'green' ? 'text-emerald-700' : effectiveNS === 'yellow' ? 'text-amber-700' : 'text-rose-700'
          }`}>
            {effectiveNS.toUpperCase()} (PA{effectiveNS === 'red' ? '0' : effectiveNS === 'yellow' ? '1' : '2'}=1)
          </span>
          <p className="text-[9px] text-slate-400 mt-0.5">Flowing corridor state</p>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block text-[9px] font-bold uppercase">East-West Signal:</span>
          <span className={`font-mono font-extrabold text-xs ${
            effectiveEW === 'green' ? 'text-emerald-700' : effectiveEW === 'yellow' ? 'text-amber-700' : 'text-rose-700'
          }`}>
            {effectiveEW.toUpperCase()} (PA{effectiveEW === 'red' ? '3' : effectiveEW === 'yellow' ? '4' : '5'}=1)
          </span>
          <p className="text-[9px] text-slate-400 mt-0.5">Cross corridor state</p>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block text-[9px] font-bold uppercase">Buffer Driver IC:</span>
          <span className="text-indigo-700 font-mono font-extrabold text-xs">7407 Hex Buffer</span>
          <p className="text-[9px] text-slate-400 mt-0.5">Sinks 30mA per LED channel</p>
        </div>
      </div>
    </div>
  );
}
