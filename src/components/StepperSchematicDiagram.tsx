import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCw, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  CheckCircle2,
  Info,
  Layers
} from 'lucide-react';

interface StepperSchematicDiagramProps {
  currentStep?: number;
  driveMode?: 'wave' | 'full' | 'half';
  direction?: 'cw' | 'ccw';
  isExternalRunning?: boolean;
}

export default function StepperSchematicDiagram({
  driveMode = 'full',
  direction = 'cw',
  isExternalRunning = false
}: StepperSchematicDiagramProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const [localRunning, setLocalRunning] = useState<boolean>(true);
  const [localStep, setLocalStep] = useState<number>(0);
  const [activeDrive, setActiveDrive] = useState<'wave' | 'full' | 'half'>(driveMode);
  const [activeDir, setActiveDir] = useState<'cw' | 'ccw'>(direction);
  const [activeLogicProbe, setActiveLogicProbe] = useState<number>(0); // 0 = Active LOW (CS=0)

  // Stepper output sequences for Port A (PA0..PA3)
  const sequences = {
    wave: activeDir === 'cw' ? [0x01, 0x02, 0x04, 0x08] : [0x08, 0x04, 0x02, 0x01],
    full: activeDir === 'cw' ? [0x03, 0x06, 0x0C, 0x09] : [0x09, 0x0C, 0x06, 0x03],
    half: activeDir === 'cw' 
      ? [0x01, 0x03, 0x02, 0x06, 0x04, 0x0C, 0x08, 0x09] 
      : [0x09, 0x08, 0x0C, 0x04, 0x06, 0x02, 0x03, 0x01]
  };

  const currentSeq = sequences[activeDrive];
  const activePattern = currentSeq[localStep % currentSeq.length];

  // Active Phase status
  const pa0 = (activePattern & 1) !== 0;
  const pa1 = (activePattern & 2) !== 0;
  const pa2 = (activePattern & 4) !== 0;
  const pa3 = (activePattern & 8) !== 0;

  useEffect(() => {
    if (!localRunning) return;
    const interval = setInterval(() => {
      setLocalStep((prev) => (prev + 1) % currentSeq.length);
    }, 650);
    return () => clearInterval(interval);
  }, [localRunning, currentSeq.length]);

  const chipInfo: Record<string, { title: string; subtitle: string; desc: string; pins: { pin: string; func: string }[] }> = {
    u2: {
      title: 'U2: Intel 8086 16-Bit Microprocessor',
      subtitle: 'Minimum Mode Master Controller',
      desc: 'Configured in Minimum Mode by connecting Pin 33 (MN/MX#) to +5V VCC. Generates multiplexed address/data on AD[0..15], ALE (Pin 25) for address demultiplexing, RD# (Pin 32), WR# (Pin 29), and M/IO# (Pin 28) for 8255 I/O port mapping.',
      pins: [
        { pin: 'Pin 33 (MN/MX#)', func: 'Tied to +5V VCC to set Minimum Mode operation.' },
        { pin: 'Pin 25 (ALE)', func: 'Address Latch Enable connected to 74HC373 Pin 11 (LE) to latch lower address lines.' },
        { pin: 'Pin 28 (M/IO#)', func: 'Outputs LOW during IN/OUT instructions to drive 8255 Chip Select (CS# Pin 6).' },
        { pin: 'Pin 32 (RD#) / Pin 29 (WR#)', func: 'Directly wired to 8255 RD# (Pin 5) and WR# (Pin 36).' },
        { pin: 'Pins 21, 22, 18, 31, 23, 17', func: 'Tied to GND reference (RESET=0, READY=1/GND, INTR=0, HOLD=0, TEST=0, NMI=0).' }
      ]
    },
    u3: {
      title: 'U3: 74HC373 Octal Transparent D-Latch',
      subtitle: 'Lower Address Demultiplexer',
      desc: 'Latches lower address bits from multiplexed AD0–AD7 during T1 clock state using the ALE strobe on LE (Pin 11). Provides steady demultiplexed address outputs A0 (from Q1) and A1 (from Q2) to the 8255.',
      pins: [
        { pin: 'Pin 11 (LE)', func: 'Latch Enable driven by 8086 ALE (Pin 25).' },
        { pin: 'Pin 1 (OE#)', func: 'Output Enable tied to GND (0V) for active 3-state outputs.' },
        { pin: 'Pins 3, 4, 7, 8, 13, 14, 17, 18 (D0–D7)', func: 'Inputs wired to 8086 AD0–AD7 data/address bus.' },
        { pin: 'Pin 5 (Q1) & Pin 6 (Q2)', func: 'Demultiplexed address outputs wired to 8255 A0 and A1.' },
        { pin: 'Pin 9 (Q3)', func: 'Latched control line wired to 8255 RESET (Pin 35).' }
      ]
    },
    u4: {
      title: 'U4: Intel 8255A Programmable Peripheral Interface (PPI)',
      subtitle: 'Parallel Port Expansion Interface',
      desc: 'Operates in Mode 0 (Basic I/O). Port A (PA0–PA3) is configured as an output port to issue the 4-phase unipolar stepper motor excitation sequence to the ULN2003 driver.',
      pins: [
        { pin: 'Pins 34–27 (D0–D7)', func: 'Bidirectional data bus wired to 8086 AD0–AD7.' },
        { pin: 'Pin 6 (CS#)', func: 'Active-low chip select activated by 8086 M/IO# signal.' },
        { pin: 'Pin 9 (A0) & Pin 8 (A1)', func: 'Port register selection (00=Port A, 01=Port B, 10=Port C, 11=Control Word).' },
        { pin: 'Pins 4, 3, 2, 1 (PA0–PA3)', func: 'Output phase signals wired straight to ULN2003 inputs 1B–4B.' }
      ]
    },
    u5: {
      title: 'U5: ULN2003A Darlington Driver Array',
      subtitle: 'High-Current Motor Driver with Clamping Diodes',
      desc: 'Contains 7 high-voltage, high-current Darlington pairs (500mA sink capability per channel). Boosts 5V TTL logic levels from 8255 Port A to sink high coil current from the +12V stepper motor. Pin 9 (COM) is connected to +12V for inductive kickback protection.',
      pins: [
        { pin: 'Pins 1–4 (1B–4B)', func: 'Base inputs driven by 8255 PA0–PA3.' },
        { pin: 'Pins 16–13 (1C–4C)', func: 'Open-collector outputs sinking current through motor phase coils A, B, C, D.' },
        { pin: 'Pin 9 (COM)', func: 'Common cathode flyback diode return connected to +12V DC power supply.' },
        { pin: 'Pin 8 (GND)', func: 'Common emitter ground reference.' }
      ]
    },
    motor: {
      title: 'Unipolar 4-Phase Stepper Motor',
      subtitle: 'Actuator with Center-Tapped Stator Windings',
      desc: 'Has center-tapped coils tied directly to +12V DC Battery (B1). When ULN2003 drivers switch ON, current sinks through each phase winding in sequence, causing the permanent-magnet rotor to rotate precisely.',
      pins: [
        { pin: 'Center Tap', func: 'Connected to +12V DC power rail.' },
        { pin: 'Phase A (Coil 1)', func: 'Energized by ULN2003 1C (Pin 16) driven by PA0.' },
        { pin: 'Phase B (Coil 2)', func: 'Energized by ULN2003 2C (Pin 15) driven by PA1.' },
        { pin: 'Phase C (Coil 3)', func: 'Energized by ULN2003 3C (Pin 14) driven by PA2.' },
        { pin: 'Phase D (Coil 4)', func: 'Energized by ULN2003 4C (Pin 13) driven by PA3.' }
      ]
    },
    b1: {
      title: 'B1: 12V DC Power Source',
      subtitle: 'Motor Excitation Supply',
      desc: 'Delivers +12V DC power to the stepper motor common coil tap and the ULN2003 COM free-wheeling diode bus.',
      pins: [
        { pin: 'Positive (+12V)', func: 'Connected to Motor center tap & ULN2003 Pin 9 (COM).' },
        { pin: 'Negative (GND)', func: 'Connected to common system ground.' }
      ]
    }
  };

  return (
    <div className="bg-white text-slate-800 p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs font-sans">
      {/* Title & Interactive Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-extrabold text-sm md:text-base text-slate-900 flex items-center gap-2">
            <span>Circuit Diagram: 8086 and Stepper Motor Interfacing (Unipolar)</span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-mono font-bold">
              High-Precision Schematic
            </span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Single 8255 System: 8086 CPU (U2) ↔ 74HC373 (U3) ↔ 8255A PPI (U4) ↔ ULN2003A (U5) ↔ 12V Stepper Motor (B1)
          </p>
        </div>

        {/* Live Simulation Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Drive Mode Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px] font-mono">
            <button
              onClick={() => setActiveDrive('full')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeDrive === 'full' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Full-Step
            </button>
            <button
              onClick={() => setActiveDrive('wave')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeDrive === 'wave' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Wave (1-Phase)
            </button>
            <button
              onClick={() => setActiveDrive('half')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeDrive === 'half' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Half-Step
            </button>
          </div>

          {/* Direction Toggle */}
          <button
            onClick={() => setActiveDir(activeDir === 'cw' ? 'ccw' : 'cw')}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 font-mono text-[11px] font-bold flex items-center gap-1 cursor-pointer"
          >
            {activeDir === 'cw' ? <RotateCw className="w-3.5 h-3.5 text-indigo-600" /> : <RotateCcw className="w-3.5 h-3.5 text-amber-600" />}
            <span>{activeDir.toUpperCase()}</span>
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={() => setLocalRunning(!localRunning)}
            className={`px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1.5 cursor-pointer transition-all shadow-xs ${
              localRunning ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {localRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{localRunning ? 'Pause Pulse' : 'Start Pulse'}</span>
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setZoomLevel(Math.max(0.7, zoomLevel - 0.1))}
              className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[10px] px-1 text-slate-600 font-bold">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel(Math.min(1.4, zoomLevel + 0.1))}
              className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Reset Zoom"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Schematic Frame Canvas */}
      <div className="bg-slate-50/50 border-2 border-slate-200 rounded-2xl p-4 overflow-x-auto shadow-inner">
        <div 
          className="min-w-[1400px] transition-transform duration-200 origin-top-left bg-white p-4 rounded-xl border border-slate-200 shadow-xs"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Header Title inside schematic */}
          <div className="text-center py-2 mb-2 border-b border-slate-200">
            <h2 className="font-serif font-extrabold text-base md:text-lg text-slate-900 tracking-wide">
              Circuit Diagram: 8086 and Stepper Motor Interfacing (Unipolar)
            </h2>
          </div>

          <svg viewBox="0 0 1560 660" width="100%" height="600" className="select-none font-sans">
            {/* Grid background pattern for clean CAD feel */}
            <defs>
              <pattern id="cadGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.5" fill="#cbd5e1" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="1560" height="660" fill="url(#cadGrid)" opacity="0.6" />

            {/* ======================================================== */}
            {/* BUS: TOP MAIN AD[0..15] BLUE BUS (Elevation y = 80)     */}
            {/* ======================================================== */}
            {/* Bus from 8086 rising to top rail */}
            <path d="M 320 180 L 350 180 L 350 75" fill="none" stroke="#1d4ed8" strokeWidth="6" strokeLinecap="round" />
            <polygon points="350,65 343,80 357,80" fill="#1d4ed8" />
            <text x="310" y="60" className="font-mono text-xs font-black fill-blue-900">AD[0..15]</text>

            {/* Bus tap down to 74HC373 D0..D7 */}
            <line x1="430" y1="75" x2="430" y2="330" stroke="#1d4ed8" strokeWidth="6" strokeLinecap="round" />
            <polygon points="430,65 423,80 437,80" fill="#1d4ed8" />
            <text x="390" y="60" className="font-mono text-xs font-black fill-blue-900">AD[0..15]</text>

            {/* Bus tap down to 8255A D0..D7 */}
            <line x1="740" y1="75" x2="740" y2="330" stroke="#1d4ed8" strokeWidth="6" strokeLinecap="round" />
            <polygon points="740,65 733,80 747,80" fill="#1d4ed8" />
            <text x="700" y="60" className="font-mono text-xs font-black fill-blue-900">AD[0..15]</text>

            {/* ======================================================== */}
            {/* COMPONENT 1: U2 (8086 CPU)                                */}
            {/* x = 80, y = 140, width = 240, height = 400               */}
            {/* ======================================================== */}
            <g 
              className="cursor-pointer group"
              onClick={() => setSelectedChip('u2')}
            >
              {/* Chip Headers */}
              <rect x="80" y="140" width="240" height="400" fill="#ffffff" stroke="#78350f" strokeWidth="2.5" rx="4" />
              <rect x="80" y="140" width="240" height="26" fill="#fef3c7" stroke="#78350f" strokeWidth="2.5" rx="3" />
              <text x="200" y="158" textAnchor="middle" className="font-mono font-extrabold text-sm fill-amber-950">U2 : 8086</text>

              {/* LEFT PINS: Dedicated Lead Wire + Clear Pin Number + Inside Name */}
              {[
                { pin: '21', label: 'RESET', y: 185, gnd: true },
                { pin: '22', label: 'READY', y: 215, gnd: true },
                { pin: '24', label: 'INTA/QS1', y: 245, gnd: false },
                { pin: '18', label: 'INTR', y: 275, gnd: true },
                { pin: '31', label: 'HOLD/GT1', y: 305, gnd: true },
                { pin: '30', label: 'HLDA/GT0', y: 335, gnd: false },
                { pin: '23', label: 'TEST', y: 365, gnd: true },
                { pin: '17', label: 'NMI', y: 395, gnd: true },
                { pin: '33', label: 'MN/MX', y: 435, vcc: true },
                { pin: '19', label: 'CLK', y: 475, gnd: false },
              ].map((p, idx) => (
                <g key={idx}>
                  {/* Lead wire from left */}
                  <line x1={p.vcc ? "30" : "55"} y1={p.y} x2="80" y2={p.y} stroke="#16a34a" strokeWidth="1.6" />
                  {/* Pin number on the lead wire */}
                  <rect x="58" y={p.y - 12} width="18" height="11" fill="#f8fafc" rx="2" />
                  <text x="67" y={p.y - 3} textAnchor="middle" className="font-mono text-[9px] font-bold fill-slate-500">{p.pin}</text>
                  {/* Pin label inside the chip with ample padding */}
                  <text x="92" y={p.y + 4} textAnchor="start" className="font-mono text-xs font-extrabold fill-slate-900">{p.label}</text>
                </g>
              ))}

              {/* RIGHT PINS: Inside Name + Pin Number on Lead + Lead Wire */}
              {[
                { pin: '', label: 'AD[0..15]', y: 180, bubble: false },
                { pin: '', label: 'A[16..19]', y: 210, bubble: false },
                { pin: '25', label: 'ALE/QS0', y: 245, bubble: false },
                { pin: '34', label: 'BHE', y: 280, bubble: false },
                { pin: '27', label: 'DT/R/S1', y: 315, bubble: false },
                { pin: '26', label: 'DEN/S2', y: 350, bubble: false },
                { pin: '32', label: 'RD', y: 385, bubble: true },
                { pin: '29', label: 'WR/LOCK', y: 425, bubble: true },
                { pin: '28', label: 'M/IO/S0', y: 465, bubble: true },
              ].map((p, idx) => (
                <g key={idx}>
                  {/* Pin label inside chip aligned to right border with 15px safe padding */}
                  <text x="290" y={p.y + 4} textAnchor="end" className="font-mono text-xs font-extrabold fill-slate-900">{p.label}</text>
                  {/* Lead wire extending right */}
                  <line x1="320" y1={p.y} x2="350" y2={p.y} stroke="#16a34a" strokeWidth="1.6" />
                  {/* Pin number if applicable */}
                  {p.pin && (
                    <g>
                      <rect x="328" y={p.y - 12} width="18" height="11" fill="#f8fafc" rx="2" />
                      <text x="337" y={p.y - 3} textAnchor="middle" className="font-mono text-[9px] font-bold fill-slate-500">{p.pin}</text>
                    </g>
                  )}
                  {/* Inversion bubble */}
                  {p.bubble && (
                    <circle cx="320" cy={p.y} r="3" fill="#ffffff" stroke="#78350f" strokeWidth="1.4" />
                  )}
                </g>
              ))}
            </g>

            {/* 8086 External Power/GND Rails */}
            {/* +5V Rail on Pin 33 (MN/MX) */}
            <line x1="30" y1="435" x2="30" y2="120" stroke="#16a34a" strokeWidth="1.8" />
            <polygon points="30,105 23,120 37,120" fill="#16a34a" />
            <text x="30" y="98" textAnchor="middle" className="font-mono font-black text-xs fill-emerald-800">+5V</text>

            {/* GND Bus on left */}
            <line x1="55" y1="185" x2="55" y2="400" stroke="#16a34a" strokeWidth="1.8" />
            <line x1="55" y1="400" x2="55" y2="500" stroke="#16a34a" strokeWidth="1.8" />
            <circle cx="55" cy="185" r="3" fill="#dc2626" />
            <circle cx="55" cy="215" r="3" fill="#dc2626" />
            <circle cx="55" cy="275" r="3" fill="#dc2626" />
            <circle cx="55" cy="305" r="3" fill="#dc2626" />
            <circle cx="55" cy="365" r="3" fill="#dc2626" />
            <circle cx="55" cy="395" r="3" fill="#dc2626" />
            {/* Ground symbol */}
            <line x1="40" y1="500" x2="70" y2="500" stroke="#16a34a" strokeWidth="2.5" />
            <line x1="46" y1="506" x2="64" y2="506" stroke="#16a34a" strokeWidth="2" />
            <line x1="51" y1="512" x2="59" y2="512" stroke="#16a34a" strokeWidth="1.5" />

            {/* ======================================================== */}
            {/* COMPONENT 2: U3 (74HC373 Octal Transparent Latch)         */}
            {/* x = 470, y = 140, width = 150, height = 340               */}
            {/* ======================================================== */}
            <g 
              className="cursor-pointer group"
              onClick={() => setSelectedChip('u3')}
            >
              <rect x="470" y="140" width="150" height="340" fill="#ffffff" stroke="#78350f" strokeWidth="2.5" rx="4" />
              <rect x="470" y="140" width="150" height="26" fill="#fef3c7" stroke="#78350f" strokeWidth="2.5" rx="3" />
              <text x="545" y="158" textAnchor="middle" className="font-mono font-extrabold text-sm fill-amber-950">U3 : 74HC373</text>

              {/* 74HC373 Inputs D0..D7 */}
              {[
                { pin: '3', label: 'D0', y: 180 },
                { pin: '4', label: 'D1', y: 205 },
                { pin: '7', label: 'D2', y: 230 },
                { pin: '8', label: 'D3', y: 255 },
                { pin: '13', label: 'D4', y: 280 },
                { pin: '14', label: 'D5', y: 305 },
                { pin: '17', label: 'D6', y: 330 },
                { pin: '18', label: 'D7', y: 355 },
              ].map((p, idx) => (
                <g key={idx}>
                  {/* Clean straight wire from blue bus tap */}
                  <line x1="430" y1={p.y} x2="470" y2={p.y} stroke="#16a34a" strokeWidth="1.6" />
                  <rect x="444" y={p.y - 12} width="16" height="11" fill="#f8fafc" rx="2" />
                  <text x="452" y={p.y - 3} textAnchor="middle" className="font-mono text-[9px] font-bold fill-slate-500">{p.pin}</text>
                  <text x="480" y={p.y + 4} textAnchor="start" className="font-mono text-xs font-extrabold fill-slate-900">{p.label}</text>
                </g>
              ))}

              {/* Control Inputs: OE# and LE */}
              <g>
                <text x="480" y="404" textAnchor="start" className="font-mono text-xs font-extrabold fill-slate-900">OE</text>
                <circle cx="470" cy="400" r="3" fill="#ffffff" stroke="#78350f" strokeWidth="1.4" />
                <rect x="444" y="388" width="16" height="11" fill="#f8fafc" rx="2" />
                <text x="452" y="397" textAnchor="middle" className="font-mono text-[9px] font-bold fill-slate-500">1</text>
                <line x1="400" y1="400" x2="467" y2="400" stroke="#16a34a" strokeWidth="1.6" />

                <text x="480" y="444" textAnchor="start" className="font-mono text-xs font-extrabold fill-slate-900">LE</text>
                <rect x="444" y="428" width="16" height="11" fill="#f8fafc" rx="2" />
                <text x="452" y="437" textAnchor="middle" className="font-mono text-[9px] font-bold fill-slate-500">11</text>
                <line x1="390" y1="440" x2="470" y2="440" stroke="#16a34a" strokeWidth="1.6" />
              </g>

              {/* 74HC373 Outputs Q0..Q7 */}
              {[
                { pin: '2', label: 'Q0', y: 180 },
                { pin: '5', label: 'Q1 (A0)', y: 205, active: true },
                { pin: '6', label: 'Q2 (A1)', y: 230, active: true },
                { pin: '9', label: 'Q3 (RST)', y: 255, active: true },
                { pin: '12', label: 'Q4', y: 280 },
                { pin: '15', label: 'Q5', y: 305 },
                { pin: '16', label: 'Q6', y: 330 },
                { pin: '19', label: 'Q7', y: 355 },
              ].map((p, idx) => (
                <g key={idx}>
                  <text x="610" y={p.y + 4} textAnchor="end" className={`font-mono text-xs font-extrabold ${p.active ? 'fill-indigo-900' : 'fill-slate-600'}`}>{p.label}</text>
                  <line x1="620" y1={p.y} x2="650" y2={p.y} stroke="#16a34a" strokeWidth="1.6" />
                  <rect x="628" y={p.y - 12} width="16" height="11" fill="#f8fafc" rx="2" />
                  <text x="636" y={p.y - 3} textAnchor="middle" className="font-mono text-[9px] font-bold fill-slate-500">{p.pin}</text>
                </g>
              ))}
            </g>

            {/* ALE Route: 8086 Pin 25 -> 74HC373 Pin 11 (LE) */}
            <path d="M 350 245 L 390 245 L 390 440 L 470 440" fill="none" stroke="#16a34a" strokeWidth="1.6" />
            <circle cx="390" cy="245" r="3" fill="#dc2626" />

            {/* 74HC373 OE# (Pin 1) to GND */}
            <path d="M 400 400 L 400 500 L 70 500" fill="none" stroke="#16a34a" strokeWidth="1.6" />
            <circle cx="400" cy="500" r="3" fill="#dc2626" />

            {/* ======================================================== */}
            {/* COMPONENT 3: U4 (Intel 8255A PPI)                         */}
            {/* x = 790, y = 140, width = 190, height = 440               */}
            {/* ======================================================== */}
            <g 
              className="cursor-pointer group"
              onClick={() => setSelectedChip('u4')}
            >
              <rect x="790" y="140" width="190" height="440" fill="#ffffff" stroke="#78350f" strokeWidth="2.5" rx="4" />
              <rect x="790" y="140" width="190" height="26" fill="#fef3c7" stroke="#78350f" strokeWidth="2.5" rx="3" />
              <text x="885" y="158" textAnchor="middle" className="font-mono font-extrabold text-sm fill-amber-950">U4 : 8255A</text>

              {/* 8255 Inputs D0..D7 */}
              {[
                { pin: '34', label: 'D0', y: 180 },
                { pin: '33', label: 'D1', y: 205 },
                { pin: '32', label: 'D2', y: 230 },
                { pin: '31', label: 'D3', y: 255 },
                { pin: '30', label: 'D4', y: 280 },
                { pin: '29', label: 'D5', y: 305 },
                { pin: '28', label: 'D6', y: 330 },
                { pin: '27', label: 'D7', y: 355 },
              ].map((p, idx) => (
                <g key={idx}>
                  <line x1="740" y1={p.y} x2="790" y2={p.y} stroke="#16a34a" strokeWidth="1.6" />
                  <rect x="760" y={p.y - 12} width="18" height="11" fill="#f8fafc" rx="2" />
                  <text x="769" y={p.y - 3} textAnchor="middle" className="font-mono text-[9px] font-bold fill-slate-500">{p.pin}</text>
                  <text x="800" y={p.y + 4} textAnchor="start" className="font-mono text-xs font-extrabold fill-slate-900">{p.label}</text>
                </g>
              ))}

              {/* 8255 Control Inputs */}
              {[
                { pin: '5', label: 'RD', y: 395, bubble: true },
                { pin: '36', label: 'WR', y: 430, bubble: true },
                { pin: '9', label: 'A0', y: 465, bubble: false },
                { pin: '8', label: 'A1', y: 495, bubble: false },
                { pin: '35', label: 'RESET', y: 525, bubble: false },
                { pin: '6', label: 'CS', y: 555, bubble: true },
              ].map((p, idx) => (
                <g key={idx}>
                  <line x1="740" y1={p.y} x2="790" y2={p.y} stroke="#16a34a" strokeWidth="1.6" />
                  <rect x="760" y={p.y - 12} width="18" height="11" fill="#f8fafc" rx="2" />
                  <text x="769" y={p.y - 3} textAnchor="middle" className="font-mono text-[9px] font-bold fill-slate-500">{p.pin}</text>
                  <text x="800" y={p.y + 4} textAnchor="start" className="font-mono text-xs font-extrabold fill-slate-900">{p.label}</text>
                  {p.bubble && (
                    <circle cx="790" cy={p.y} r="3" fill="#ffffff" stroke="#78350f" strokeWidth="1.4" />
                  )}
                </g>
              ))}

              {/* 8255 Port A Outputs PA0..PA7 */}
              {[
                { pin: '4', label: 'PA0', y: 180, active: pa0 },
                { pin: '3', label: 'PA1', y: 210, active: pa1 },
                { pin: '2', label: 'PA2', y: 240, active: pa2 },
                { pin: '1', label: 'PA3', y: 270, active: pa3 },
                { pin: '40', label: 'PA4', y: 300, active: false },
                { pin: '39', label: 'PA5', y: 330, active: false },
                { pin: '38', label: 'PA6', y: 360, active: false },
                { pin: '37', label: 'PA7', y: 390, active: false },
              ].map((p, idx) => (
                <g key={idx}>
                  <text x="965" y={p.y + 4} textAnchor="end" className={`font-mono text-xs font-extrabold ${p.active ? 'fill-rose-700' : 'fill-slate-900'}`}>{p.label}</text>
                  <line x1="980" y1={p.y} x2="1010" y2={p.y} stroke={p.active ? '#dc2626' : '#16a34a'} strokeWidth={p.active ? 2.2 : 1.6} />
                  <rect x="986" y={p.y - 12} width="18" height="11" fill="#f8fafc" rx="2" />
                  <text x="995" y={p.y - 3} textAnchor="middle" className="font-mono text-[9px] font-bold fill-slate-500">{p.pin}</text>
                </g>
              ))}

              {/* Ports B & C labels */}
              <text x="965" y="440" textAnchor="end" className="font-mono text-[11px] font-bold fill-slate-400">PB0–PB7 (Unused)</text>
              <text x="965" y="480" textAnchor="end" className="font-mono text-[11px] font-bold fill-slate-400">PC0–PC7 (Unused)</text>
            </g>

            {/* Clean Wires from 74HC373 Outputs to 8255 Inputs (A0, A1, RESET) */}
            {/* Q1 (Pin 5) -> A0 (Pin 9) */}
            <path d="M 650 205 L 680 205 L 680 465 L 740 465" fill="none" stroke="#16a34a" strokeWidth="1.6" />
            
            {/* Q2 (Pin 6) -> A1 (Pin 8) */}
            <path d="M 650 230 L 695 230 L 695 495 L 740 495" fill="none" stroke="#16a34a" strokeWidth="1.6" />

            {/* Q3 (Pin 9) -> RESET (Pin 35) */}
            <path d="M 650 255 L 710 255 L 710 525 L 740 525" fill="none" stroke="#16a34a" strokeWidth="1.6" />

            {/* Control Signals Routing from 8086 to 8255 */}
            {/* RD# (8086 Pin 32 -> 8255 Pin 5) via bottom route */}
            <path d="M 350 385 L 370 385 L 370 590 L 725 590 L 725 395 L 740 395" fill="none" stroke="#16a34a" strokeWidth="1.6" />

            {/* WR# (8086 Pin 29 -> 8255 Pin 36) via bottom route */}
            <path d="M 350 425 L 360 425 L 360 615 L 735 615 L 735 430 L 740 430" fill="none" stroke="#16a34a" strokeWidth="1.6" />

            {/* M/IO# (8086 Pin 28 -> 8255 Pin 6 CS#) */}
            <path d="M 350 465 L 420 465 L 420 555 L 740 555" fill="none" stroke="#16a34a" strokeWidth="1.6" />

            {/* Interactive Logic State Probe [0] on M/IO# */}
            <g 
              className="cursor-pointer"
              onClick={() => setActiveLogicProbe(activeLogicProbe === 0 ? 1 : 0)}
              title="Click to toggle Logic State Probe"
            >
              <rect x="435" y="542" width="26" height="26" fill="#1e3a8a" stroke="#ffffff" strokeWidth="1.5" rx="4" />
              <text x="448" y="560" textAnchor="middle" className="font-mono font-black text-sm fill-white">
                {activeLogicProbe}
              </text>
              <circle cx="470" cy="548" r="3.5" fill="#dc2626" />
              <circle cx="480" cy="548" r="3.5" fill="#dc2626" />
            </g>

            {/* ======================================================== */}
            {/* COMPONENT 4: U5 (ULN2003A Darlington Driver)              */}
            {/* x = 1110, y = 140, width = 140, height = 320              */}
            {/* ======================================================== */}
            <g 
              className="cursor-pointer group"
              onClick={() => setSelectedChip('u5')}
            >
              <rect x="1110" y="140" width="140" height="320" fill="#ffffff" stroke="#78350f" strokeWidth="2.5" rx="4" />
              <rect x="1110" y="140" width="140" height="26" fill="#fef3c7" stroke="#78350f" strokeWidth="2.5" rx="3" />
              <text x="1180" y="158" textAnchor="middle" className="font-mono font-extrabold text-sm fill-amber-950">U5 : ULN2003A</text>

              {/* ULN2003 Inputs 1B..7B */}
              {[
                { pin: '1', label: '1B', y: 180, active: pa0 },
                { pin: '2', label: '2B', y: 210, active: pa1 },
                { pin: '3', label: '3B', y: 240, active: pa2 },
                { pin: '4', label: '4B', y: 270, active: pa3 },
                { pin: '5', label: '5B', y: 300, active: false },
                { pin: '6', label: '6B', y: 330, active: false },
                { pin: '7', label: '7B', y: 360, active: false },
              ].map((p, idx) => (
                <g key={idx}>
                  <line x1="1080" y1={p.y} x2="1110" y2={p.y} stroke={p.active ? '#dc2626' : '#16a34a'} strokeWidth={p.active ? 2.2 : 1.6} />
                  <rect x="1086" y={p.y - 12} width="16" height="11" fill="#f8fafc" rx="2" />
                  <text x="1094" y={p.y - 3} textAnchor="middle" className="font-mono text-[9px] font-bold fill-slate-500">{p.pin}</text>
                  <text x="1120" y={p.y + 4} textAnchor="start" className={`font-mono text-xs font-extrabold ${p.active ? 'fill-rose-700' : 'fill-slate-900'}`}>{p.label}</text>
                </g>
              ))}

              {/* COM Pin 9 */}
              <g>
                <text x="1235" y="184" textAnchor="end" className="font-mono text-xs font-black fill-rose-700">COM</text>
                <line x1="1250" y1="180" x2="1280" y2="180" stroke="#16a34a" strokeWidth="1.8" />
                <rect x="1256" y="168" width="16" height="11" fill="#f8fafc" rx="2" />
                <text x="1264" y="177" textAnchor="middle" className="font-mono text-[9px] font-bold fill-slate-500">9</text>
              </g>

              {/* ULN2003 Outputs 1C..7C */}
              {[
                { pin: '16', label: '1C', y: 210, active: pa0 },
                { pin: '15', label: '2C', y: 240, active: pa1 },
                { pin: '14', label: '3C', y: 270, active: pa2 },
                { pin: '13', label: '4C', y: 300, active: pa3 },
                { pin: '12', label: '5C', y: 330, active: false },
                { pin: '11', label: '6C', y: 360, active: false },
                { pin: '10', label: '7C', y: 390, active: false },
              ].map((p, idx) => (
                <g key={idx}>
                  <text x="1235" y={p.y + 4} textAnchor="end" className={`font-mono text-xs font-extrabold ${p.active ? 'fill-rose-700' : 'fill-slate-900'}`}>{p.label}</text>
                  <line x1="1250" y1={p.y} x2="1280" y2={p.y} stroke={p.active ? '#dc2626' : '#16a34a'} strokeWidth={p.active ? 2.2 : 1.6} />
                  <rect x="1256" y={p.y - 12} width="18" height="11" fill="#f8fafc" rx="2" />
                  <text x="1265" y={p.y - 3} textAnchor="middle" className="font-mono text-[9px] font-bold fill-slate-500">{p.pin}</text>
                </g>
              ))}
            </g>

            {/* STRAIGHT PARALLEL LINES FROM 8255 (PA0..PA6) INTO ULN2003 (1B..7B) */}
            {[
              { y: 180, active: pa0 },
              { y: 210, active: pa1 },
              { y: 240, active: pa2 },
              { y: 270, active: pa3 },
              { y: 300, active: false },
              { y: 330, active: false },
              { y: 360, active: false },
            ].map((w, idx) => (
              <line 
                key={idx}
                x1="1010" y1={w.y} x2="1080" y2={w.y} 
                stroke={w.active ? '#dc2626' : '#16a34a'} 
                strokeWidth={w.active ? 2.2 : 1.6} 
              />
            ))}

            {/* ======================================================== */}
            {/* COMPONENT 5: STEPPER MOTOR & +12V DC SUPPLY (B1)         */}
            {/* ======================================================== */}
            {/* Battery B1 at Top Right */}
            <g 
              className="cursor-pointer group"
              onClick={() => setSelectedChip('b1')}
            >
              <text x="1360" y="55" className="font-mono font-black text-sm fill-slate-900">B1</text>
              <text x="1360" y="90" className="font-mono font-bold text-xs fill-slate-700">12V</text>

              {/* Battery cell plates */}
              <line x1="1350" y1="65" x2="1350" y2="80" stroke="#16a34a" strokeWidth="3" />
              <line x1="1360" y1="60" x2="1360" y2="85" stroke="#16a34a" strokeWidth="1.8" />
              <line x1="1350" y1="72" x2="1360" y2="72" stroke="#16a34a" strokeWidth="1" strokeDasharray="1,1" />

              <line x1="1390" y1="60" x2="1390" y2="85" stroke="#16a34a" strokeWidth="1.8" />
              <line x1="1400" y1="65" x2="1400" y2="80" stroke="#16a34a" strokeWidth="3" />
              <line x1="1390" y1="72" x2="1400" y2="72" stroke="#16a34a" strokeWidth="1" strokeDasharray="1,1" />
              <line x1="1360" y1="72" x2="1390" y2="72" stroke="#16a34a" strokeWidth="1" strokeDasharray="2,2" />

              {/* Battery Ground */}
              <line x1="1400" y1="72" x2="1430" y2="72" stroke="#16a34a" strokeWidth="1.6" />
              <line x1="1430" y1="72" x2="1430" y2="100" stroke="#16a34a" strokeWidth="1.6" />
              <line x1="1420" y1="100" x2="1440" y2="100" stroke="#16a34a" strokeWidth="2.5" />
              <line x1="1424" y1="105" x2="1436" y2="105" stroke="#16a34a" strokeWidth="2" />
              <line x1="1428" y1="110" x2="1432" y2="110" stroke="#16a34a" strokeWidth="1.5" />
            </g>

            {/* +12V Line from positive terminal of B1 to ULN2003 COM (pin 9) and Motor common tap */}
            <path d="M 1350 72 L 1320 72 L 1320 180 L 1280 180" fill="none" stroke="#16a34a" strokeWidth="2" />
            <circle cx="1320" cy="120" r="3.5" fill="#16a34a" />
            <path d="M 1320 120 L 1370 120 L 1370 180" fill="none" stroke="#16a34a" strokeWidth="1.8" />

            {/* STEPPER MOTOR UNIT */}
            <g 
              className="cursor-pointer group"
              onClick={() => setSelectedChip('motor')}
            >
              {/* Stepper Outer Body Frame */}
              <rect x="1350" y="160" width="160" height="230" fill="#ffffff" stroke="#78350f" strokeWidth="2.5" rx="5" />
              <rect x="1350" y="160" width="160" height="26" fill="#fef3c7" stroke="#78350f" strokeWidth="2.5" rx="4" />
              <text x="1430" y="178" textAnchor="middle" className="font-mono font-extrabold text-sm fill-amber-950">STEPPER MOTOR</text>

              {/* Digital LED Angle Display */}
              <rect x="1360" y="195" width="16" height="42" fill="#15803d" rx="3" />
              <text x="1368" y="222" textAnchor="middle" className="text-[8.5px] font-mono fill-white font-black" transform="rotate(-90 1368 222)">
                +88.8
              </text>

              {/* Rotor Circle */}
              <circle cx="1440" cy="275" r="42" fill="#f8fafc" stroke="#78350f" strokeWidth="2.5" />
              
              {/* Animated Rotating Rotor Cross */}
              <g 
                style={{ 
                  transformOrigin: '1440px 275px', 
                  transform: `rotate(${localStep * (activeDir === 'cw' ? 45 : -45)}deg)`,
                  transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
                }}
              >
                <circle cx="1440" cy="275" r="30" fill="#ffffff" stroke="#dc2626" strokeWidth="2.2" />
                <path d="M 1425 265 Q 1440 256 1455 265 Q 1440 274 1425 265" fill="#dc2626" />
                <path d="M 1425 285 Q 1440 276 1455 285 Q 1440 294 1425 285" fill="#dc2626" />
                <circle cx="1440" cy="275" r="6" fill="#78350f" />
              </g>

              {/* Stator Windings Label */}
              <text x="1440" y="355" textAnchor="middle" className="font-mono text-xs font-black fill-slate-800">4-PHASE UNIPOLAR</text>
            </g>

            {/* STRAIGHT CONNECTION WIRES FROM ULN2003 (1C..4C) INTO MOTOR PHASES */}
            {[
              { pin: '1C', y: 210, label: 'Phase A', active: pa0 },
              { pin: '2C', y: 240, label: 'Phase B', active: pa1 },
              { pin: '3C', y: 270, label: 'Phase C', active: pa2 },
              { pin: '4C', y: 300, label: 'Phase D', active: pa3 },
            ].map((p, idx) => (
              <g key={idx}>
                <line 
                  x1="1280" y1={p.y} x2="1350" y2={p.y} 
                  stroke={p.active ? '#dc2626' : '#16a34a'} 
                  strokeWidth={p.active ? 2.4 : 1.6} 
                />
                <circle cx="1350" cy={p.y} r="3" fill={p.active ? '#dc2626' : '#16a34a'} />
              </g>
            ))}

            {/* Motor Bottom Ground Reference */}
            <path d="M 1440 390 L 1440 420 L 1380 420" fill="none" stroke="#16a34a" strokeWidth="1.6" />
          </svg>
        </div>
      </div>

      {/* Interactive Active Signal Telemetry & Logic Probe Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
        <div className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
          pa0 ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-bold text-[10px]">Phase A (PA0)</span>
            <span className={`w-2.5 h-2.5 rounded-full ${pa0 ? 'bg-emerald-500 shadow-xs shadow-emerald-400' : 'bg-slate-300'}`} />
          </div>
          <span className="font-mono text-xs font-bold mt-1">{pa0 ? 'HIGH (1) • 1C ON' : 'LOW (0) • OFF'}</span>
        </div>

        <div className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
          pa1 ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-bold text-[10px]">Phase B (PA1)</span>
            <span className={`w-2.5 h-2.5 rounded-full ${pa1 ? 'bg-emerald-500 shadow-xs shadow-emerald-400' : 'bg-slate-300'}`} />
          </div>
          <span className="font-mono text-xs font-bold mt-1">{pa1 ? 'HIGH (1) • 2C ON' : 'LOW (0) • OFF'}</span>
        </div>

        <div className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
          pa2 ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-bold text-[10px]">Phase C (PA2)</span>
            <span className={`w-2.5 h-2.5 rounded-full ${pa2 ? 'bg-emerald-500 shadow-xs shadow-emerald-400' : 'bg-slate-300'}`} />
          </div>
          <span className="font-mono text-xs font-bold mt-1">{pa2 ? 'HIGH (1) • 3C ON' : 'LOW (0) • OFF'}</span>
        </div>

        <div className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
          pa3 ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-bold text-[10px]">Phase D (PA3)</span>
            <span className={`w-2.5 h-2.5 rounded-full ${pa3 ? 'bg-emerald-500 shadow-xs shadow-emerald-400' : 'bg-slate-300'}`} />
          </div>
          <span className="font-mono text-xs font-bold mt-1">{pa3 ? 'HIGH (1) • 4C ON' : 'LOW (0) • OFF'}</span>
        </div>

        <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl flex flex-col justify-between text-indigo-950">
          <span className="font-bold text-[10px]">Active Output Byte</span>
          <span className="font-mono text-sm font-black text-indigo-700">
            0x{activePattern < 16 ? '0' : ''}{activePattern.toString(16).toUpperCase()}H
          </span>
        </div>

        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex flex-col justify-between text-amber-950">
          <span className="font-bold text-[10px]">8255 CS# Select</span>
          <span className="font-mono text-xs font-bold text-amber-800">
            M/IO# = {activeLogicProbe} ({activeLogicProbe === 0 ? 'Active LOW' : 'Disabled'})
          </span>
        </div>
      </div>

      {/* Component Details Modal on Chip Click */}
      {selectedChip && chipInfo[selectedChip] && (
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-indigo-600 text-white rounded font-mono text-[10px] font-bold">CHIP DETAILS</span>
              <h4 className="font-bold text-slate-900 text-xs">{chipInfo[selectedChip].title}</h4>
              <span className="text-[10px] text-slate-500">({chipInfo[selectedChip].subtitle})</span>
            </div>
            <button
              onClick={() => setSelectedChip(null)}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer px-1.5 py-0.5"
            >
              ✕ Close
            </button>
          </div>
          <p className="text-[11px] text-slate-700 leading-relaxed">{chipInfo[selectedChip].desc}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
            {chipInfo[selectedChip].pins.map((p, idx) => (
              <div key={idx} className="bg-white p-2 rounded-lg border border-slate-200 text-[10.5px]">
                <strong className="text-indigo-800 font-mono font-bold block">{p.pin}</strong>
                <span className="text-slate-600">{p.func}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
