import React, { useState } from 'react';
import { 
  Activity, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight,
  Info, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Zap, 
  Clock,
  ShieldCheck
} from 'lucide-react';

interface PPI8255Mode2WaveformsProps {
  initialType?: 'tx' | 'rx' | 'bidir';
  currentStep?: number;
  onStepChange?: (step: number) => void;
}

export default function PPI8255Mode2Waveforms({
  initialType = 'tx',
  currentStep = 0,
  onStepChange
}: PPI8255Mode2WaveformsProps) {
  const [waveformType, setWaveformType] = useState<'tx' | 'rx' | 'bidir'>(initialType);
  const [activeStep, setActiveStep] = useState<number>(currentStep);
  const [showDetails, setShowDetails] = useState<boolean>(true);

  const handleStepSelect = (step: number) => {
    setActiveStep(step);
    if (onStepChange) {
      onStepChange(step);
    }
  };

  // Step details for Transmit (Output) Waveform
  const txWaveformSteps = [
    {
      step: 0,
      title: 'T1: 8086 CPU Writes Data (WR# Pulse Low)',
      timeMarker: 't = 100ns',
      signals: {
        wr: 'LOW (Active Write)',
        dBus: 'CPU DATA VALID (D0–D7)',
        obfa: 'HIGH (Idle)',
        acka: 'HIGH (Idle)',
        paBus: 'HIGH-IMPEDANCE (Hi-Z)',
        intra: 'LOW (Cleared)'
      },
      causalRelation: 'CPU asserts WR# = 0 during OUT PortA, AL. Data from CPU is placed on internal data bus.',
      criticalTiming: 't_DW (Data to WR# Setup Time) ≥ 100ns before WR# rising edge.'
    },
    {
      step: 1,
      title: 'T2: WR# Rising Edge → OBF_A# Latches LOW',
      timeMarker: 't = 260ns',
      signals: {
        wr: 'HIGH (Write Complete)',
        dBus: 'FLOAT / NEXT CYCLE',
        obfa: 'LOW (Output Buffer Full)',
        acka: 'HIGH (Idle)',
        paBus: 'DATA LATCHED (Buffers Still Disabled)',
        intra: 'LOW'
      },
      causalRelation: 'Rising edge of WR# causes OBF_A# (PC7) to go LOW, signaling peripheral that new byte is ready.',
      criticalTiming: 't_WOB (WR# rising to OBF_A# falling delay) ≤ 650ns max.'
    },
    {
      step: 2,
      title: 'T3: Peripheral Pulses ACK_A# Low → Port A Bus Drives',
      timeMarker: 't = 450ns',
      signals: {
        wr: 'HIGH',
        dBus: 'IDLE',
        obfa: 'LOW → HIGH (Reset on ACK# fall)',
        acka: 'LOW (Active Acknowledge)',
        paBus: 'DRIVEN ACTIVE: VALID DATA ON PA0–PA7',
        intra: 'LOW'
      },
      causalRelation: 'Peripheral brings ACK_A# (PC6) = 0. Falling edge of ACK_A# immediately enables Port A tri-state output drivers and resets OBF_A# = 1.',
      criticalTiming: 't_AOB (ACK_A# falling to OBF_A# rising delay) ≤ 300ns.'
    },
    {
      step: 3,
      title: 'T4: ACK_A# Rising Edge → INTR_A Asserts HIGH',
      timeMarker: 't = 650ns',
      signals: {
        wr: 'HIGH',
        dBus: 'IDLE',
        obfa: 'HIGH',
        acka: 'HIGH (Acknowledge Finished)',
        paBus: 'RETURNS TO HIGH-IMPEDANCE (Hi-Z)',
        intra: 'HIGH (Interrupt 8086 CPU)'
      },
      causalRelation: 'Rising edge of ACK_A# disables Port A output buffers back to Hi-Z and triggers INTR_A = 1 (PC3), alerting 8086 that peripheral received byte.',
      criticalTiming: 't_AIT (ACK_A# rising to INTR_A rising delay) ≤ 350ns.'
    },
    {
      step: 4,
      title: 'T5: Next CPU WR# Clears INTR_A to LOW',
      timeMarker: 't = 820ns',
      signals: {
        wr: 'LOW (Next OUT Instruction)',
        dBus: 'NEXT BYTE VALID',
        obfa: 'HIGH',
        acka: 'HIGH',
        paBus: 'Hi-Z',
        intra: 'LOW (Cleared on WR# falling edge)'
      },
      causalRelation: 'Falling edge of the subsequent WR# automatically resets INTR_A = 0. New transmit cycle begins.',
      criticalTiming: 't_WIT (WR# falling to INTR_A reset delay) ≤ 400ns.'
    }
  ];

  // Step details for Receive (Input) Waveform
  const rxWaveformSteps = [
    {
      step: 0,
      title: 'T1: External Peripheral Drives Port A & Asserts STB_A# = 0',
      timeMarker: 't = 120ns',
      signals: {
        paBus: 'PERIPHERAL DRIVES DATA (PA0–PA7)',
        stba: 'LOW (Active Strobe)',
        ibfa: 'HIGH (Latched)',
        intra: 'LOW (Inactive)',
        rd: 'HIGH (Idle)',
        dBus: 'Hi-Z'
      },
      causalRelation: 'External device places data onto bidirectional Port A lines and pulses STB_A# (PC4) = LOW.',
      criticalTiming: 't_SD (Input Data Setup Time) ≥ 100ns before STB_A# rising edge.'
    },
    {
      step: 1,
      title: 'T2: 8255 Asserts IBF_A = HIGH (Input Buffer Full)',
      timeMarker: 't = 240ns',
      signals: {
        paBus: 'HELD IN REGISTER',
        stba: 'LOW → RISING',
        ibfa: 'HIGH (Buffer Busy)',
        intra: 'LOW',
        rd: 'HIGH',
        dBus: 'Hi-Z'
      },
      causalRelation: 'Falling edge of STB_A# drives IBF_A (PC5) = 1, warning peripheral not to overwrite Port A.',
      criticalTiming: 't_SIB (STB_A# falling to IBF_A rising delay) ≤ 300ns.'
    },
    {
      step: 2,
      title: 'T3: STB_A# Rising Edge → INTR_A Asserts HIGH',
      timeMarker: 't = 420ns',
      signals: {
        paBus: 'FLOATING / SAFE IN REGISTER',
        stba: 'HIGH (Idle)',
        ibfa: 'HIGH (Full)',
        intra: 'HIGH (Interrupt 8086 CPU)',
        rd: 'HIGH',
        dBus: 'Hi-Z'
      },
      causalRelation: 'Rising edge of STB_A# (while IBF_A=1 and INTE_2=1) asserts INTR_A = 1 on PC3, interrupting CPU to read data.',
      criticalTiming: 't_SIT (STB_A# rising to INTR_A rising delay) ≤ 250ns.'
    },
    {
      step: 3,
      title: 'T4: 8086 CPU Asserts RD# = LOW (IN AL, PortA)',
      timeMarker: 't = 620ns',
      signals: {
        paBus: 'Hi-Z',
        stba: 'HIGH',
        ibfa: 'HIGH',
        intra: 'LOW (Cleared on RD# fall)',
        rd: 'LOW (Read Strobe Active)',
        dBus: '8255 DRIVES D0–D7 TO CPU'
      },
      causalRelation: 'CPU executes IN instruction (RD# = 0). Falling edge of RD# automatically clears INTR_A = 0 and outputs data onto D0–D7.',
      criticalTiming: 't_RIT (RD# falling to INTR_A reset delay) ≤ 200ns.'
    },
    {
      step: 4,
      title: 'T5: RD# Rising Edge → IBF_A Clears to 0',
      timeMarker: 't = 800ns',
      signals: {
        paBus: 'Hi-Z (Ready for next input)',
        stba: 'HIGH',
        ibfa: 'LOW (Buffer Free / Ready)',
        intra: 'LOW',
        rd: 'HIGH (Read Complete)',
        dBus: 'Hi-Z'
      },
      causalRelation: 'Rising edge of RD# resets IBF_A = 0 (PC5), indicating to peripheral that Port A is ready for the next byte.',
      criticalTiming: 't_RIB (RD# rising to IBF_A falling delay) ≤ 300ns.'
    }
  ];

  // Combined Bidirectional Interleaved Steps
  const biDirSteps = [
    {
      step: 0,
      title: 'Phase 1: Transmit Data Written (WR# = 0 → OBF_A# = 0)',
      timeMarker: 'Transmit Phase',
      signals: {
        busDir: 'CPU → 8255 Output Latch',
        obf: 'LOW (Active)',
        ibf: 'LOW (Empty)',
        paBus: 'Hi-Z (Safe)',
        intr: 'LOW'
      },
      causalRelation: 'CPU writes byte to Port A. OBF_A# falls LOW to inform external device.'
    },
    {
      step: 1,
      title: 'Phase 2: Device Drives ACK_A# = 0 → Port A Outputs Active',
      timeMarker: 'Transmit Phase',
      signals: {
        busDir: '8255 PA Pins → Device Bus',
        obf: 'HIGH (Reset)',
        ibf: 'LOW',
        paBus: 'DRIVEN OUTPUT (Data Out)',
        intr: 'LOW'
      },
      causalRelation: 'ACK_A# = 0 enables 8255 output buffers. Port A is strongly driven with output byte.'
    },
    {
      step: 2,
      title: 'Phase 3: Bus Floats Back to High-Z (Safe Bus Turnaround)',
      timeMarker: 'Bus Turnaround',
      signals: {
        busDir: 'Bidirectional Bus in Hi-Z',
        obf: 'HIGH',
        ibf: 'LOW',
        paBus: 'HIGH-IMPEDANCE (Hi-Z)',
        intr: 'HIGH (TX Finished)'
      },
      causalRelation: 'ACK_A# returns HIGH, releasing Port A bus back to High-Z so external device can transmit without bus contention.'
    },
    {
      step: 3,
      title: 'Phase 4: Device Drives Bus & Pulses STB_A# = 0',
      timeMarker: 'Receive Phase',
      signals: {
        busDir: 'Device → 8255 Input Latch',
        obf: 'HIGH',
        ibf: 'HIGH (Full)',
        paBus: 'DEVICE DRIVES DATA IN',
        intr: 'LOW'
      },
      causalRelation: 'Device safely takes control of the bus, outputs data, and pulses STB_A# = 0 to latch into 8255.'
    },
    {
      step: 4,
      title: 'Phase 5: CPU Reads Data (RD# = 0) → Cycle Complete',
      timeMarker: 'Receive Phase',
      signals: {
        busDir: '8255 → 8086 CPU Bus',
        obf: 'HIGH',
        ibf: 'LOW (Cleared)',
        paBus: 'Hi-Z',
        intr: 'LOW (Cleared)'
      },
      causalRelation: 'CPU reads byte via RD# = 0. INTR_A and IBF_A clear, restoring both channels to idle readiness.'
    }
  ];

  const currentStepsList = 
    waveformType === 'tx' ? txWaveformSteps :
    waveformType === 'rx' ? rxWaveformSteps : biDirSteps;

  const currentStepData = currentStepsList[activeStep] || currentStepsList[0];

  return (
    <div className="bg-white rounded-2xl border border-purple-200 p-4 md:p-5 shadow-sm space-y-4">
      {/* Header & Waveform Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-150 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-purple-600 text-white rounded-lg">
            <Activity className="w-4 h-4" />
          </span>
          <div>
            <h4 className="font-extrabold text-sm md:text-base text-slate-900 flex items-center gap-2">
              Mode 2 Digital Timing Waveforms (Bi-directional Bus)
              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-[10px] font-mono font-bold">
                Port A (PC7–PC3 Handshakes)
              </span>
            </h4>
            <p className="text-xs text-slate-500">
              Interactive pulse diagram showing handshakes, causal edges, tri-state bus transitions, and INTR timing.
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-purple-50 p-1 rounded-xl border border-purple-200">
          <button
            onClick={() => { setWaveformType('tx'); setActiveStep(0); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              waveformType === 'tx' 
                ? 'bg-purple-600 text-white shadow-xs' 
                : 'text-purple-900 hover:bg-purple-100/70'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Transmit (TX)
          </button>
          <button
            onClick={() => { setWaveformType('rx'); setActiveStep(0); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              waveformType === 'rx' 
                ? 'bg-purple-600 text-white shadow-xs' 
                : 'text-purple-900 hover:bg-purple-100/70'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            Receive (RX)
          </button>
          <button
            onClick={() => { setWaveformType('bidir'); setActiveStep(0); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              waveformType === 'bidir' 
                ? 'bg-purple-600 text-white shadow-xs' 
                : 'text-purple-900 hover:bg-purple-100/70'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Interleaved TX &amp; RX
          </button>
        </div>
      </div>

      {/* Interactive Step Scrubber Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <Clock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
          <span className="text-slate-500 font-medium">TIMELINE CURSOR:</span>
          <span className="font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded border border-purple-200">
            Phase T{activeStep + 1} ({currentStepData.timeMarker})
          </span>
        </div>

        {/* Step buttons */}
        <div className="flex items-center gap-1">
          {[0, 1, 2, 3, 4].map((stepIdx) => (
            <button
              key={stepIdx}
              onClick={() => handleStepSelect(stepIdx)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeStep === stepIdx
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              T{stepIdx + 1}
            </button>
          ))}

          <div className="h-4 w-px bg-slate-300 mx-1" />

          <button
            onClick={() => handleStepSelect(Math.max(0, activeStep - 1))}
            disabled={activeStep === 0}
            className="p-1 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 rounded-md text-slate-700 cursor-pointer"
            title="Previous Step"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleStepSelect((activeStep + 1) % 5)}
            className="p-1 bg-purple-600 hover:bg-purple-700 rounded-md text-white cursor-pointer shadow-2xs"
            title="Next Step"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleStepSelect(0)}
            className="p-1 bg-white border border-slate-200 hover:bg-slate-100 rounded-md text-slate-700 cursor-pointer"
            title="Reset Timeline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG DIGITAL TIMING WAVEFORM DISPLAY */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 overflow-x-auto shadow-inner">
        <div className="min-w-[760px] relative">
          <svg viewBox="0 0 800 370" className="w-full h-auto select-none font-mono">
            {/* Background Grid Pattern */}
            <defs>
              <pattern id="m2Grid" width="40" height="20" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.75" strokeDasharray="2,2" />
              </pattern>
            </defs>

            <rect width="800" height="370" fill="#f8fafc" rx="8" />
            <rect x="110" y="20" width="670" height="330" fill="url(#m2Grid)" />

            {/* Time Phase Background Column Highlights */}
            <rect x="110" y="20" width="120" height="330" fill={activeStep === 0 ? '#f3e8ff' : '#ffffff'} opacity={activeStep === 0 ? '0.9' : '0.35'} />
            <rect x="230" y="20" width="140" height="330" fill={activeStep === 1 ? '#f3e8ff' : '#f1f5f9'} opacity={activeStep === 1 ? '0.9' : '0.35'} />
            <rect x="370" y="20" width="140" height="330" fill={activeStep === 2 ? '#f3e8ff' : '#ffffff'} opacity={activeStep === 2 ? '0.9' : '0.35'} />
            <rect x="510" y="20" width="140" height="330" fill={activeStep === 3 ? '#f3e8ff' : '#f1f5f9'} opacity={activeStep === 3 ? '0.9' : '0.35'} />
            <rect x="650" y="20" width="130" height="330" fill={activeStep === 4 ? '#f3e8ff' : '#ffffff'} opacity={activeStep === 4 ? '0.9' : '0.35'} />

            {/* Time Phase Vertical Dividers */}
            <line x1="230" y1="20" x2="230" y2="350" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" />
            <line x1="370" y1="20" x2="370" y2="350" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" />
            <line x1="510" y1="20" x2="510" y2="350" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" />
            <line x1="650" y1="20" x2="650" y2="350" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" />

            {/* Time Axis Labels Top */}
            <g fontSize="9.5" fill="#475569" fontWeight="bold">
              {waveformType === 'tx' && (
                <>
                  <text x="170" y="15" textAnchor="middle">T1: CPU WR# Active</text>
                  <text x="300" y="15" textAnchor="middle">T2: OBF_A# Low</text>
                  <text x="440" y="15" textAnchor="middle">T3: Peripheral ACK#</text>
                  <text x="580" y="15" textAnchor="middle">T4: INTR_A High</text>
                  <text x="715" y="15" textAnchor="middle">T5: Next WR#</text>
                </>
              )}
              {waveformType === 'rx' && (
                <>
                  <text x="170" y="15" textAnchor="middle">T1: STB_A# Pulse</text>
                  <text x="300" y="15" textAnchor="middle">T2: IBF_A High</text>
                  <text x="440" y="15" textAnchor="middle">T3: INTR_A High</text>
                  <text x="580" y="15" textAnchor="middle">T4: CPU RD# Pulse</text>
                  <text x="715" y="15" textAnchor="middle">T5: IBF_A Reset</text>
                </>
              )}
              {waveformType === 'bidir' && (
                <>
                  <text x="170" y="15" textAnchor="middle">Phase 1: TX WR#</text>
                  <text x="300" y="15" textAnchor="middle">Phase 2: TX ACK#</text>
                  <text x="440" y="15" textAnchor="middle">Phase 3: Hi-Z Float</text>
                  <text x="580" y="15" textAnchor="middle">Phase 4: RX STB#</text>
                  <text x="715" y="15" textAnchor="middle">Phase 5: RX RD#</text>
                </>
              )}
            </g>

            {/* ================================================================= */}
            {/* 1. TRANSMIT (TX) WAVEFORMS                                        */}
            {/* ================================================================= */}
            {waveformType === 'tx' && (
              <g>
                {/* Line 1: WR# (Write Strobe from 8086 CPU) */}
                <text x="15" y="55" fontSize="11" fill="#b45309" fontWeight="bold">WR#</text>
                <text x="15" y="68" fontSize="8" fill="#64748b">Pin 36 (CPU)</text>
                <path d="M 110 40 L 130 40 L 140 70 L 210 70 L 220 40 L 670 40 L 680 70 L 750 70 L 760 40 L 780 40" fill="none" stroke="#b45309" strokeWidth="2.5" />
                <text x="175" y="64" fontSize="8.5" fill="#92400e" textAnchor="middle" fontWeight="bold">WR# PULSE</text>

                {/* Line 2: CPU Internal Data Bus D0-D7 */}
                <text x="15" y="105" fontSize="11" fill="#0284c7" fontWeight="bold">D0–D7</text>
                <text x="15" y="118" fontSize="8" fill="#64748b">CPU Bus</text>
                <path d="M 110 105 L 125 90 L 225 90 L 240 105 L 225 120 L 125 120 Z" fill="#bae6fd" fillOpacity="0.7" stroke="#0284c7" strokeWidth="2" />
                <line x1="240" y1="105" x2="665" y2="105" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3,3" />
                <path d="M 665 105 L 675 90 L 770 90 L 780 105 L 770 120 L 675 120 Z" fill="#bae6fd" fillOpacity="0.7" stroke="#0284c7" strokeWidth="2" />
                <text x="180" y="108" fontSize="9" fill="#0369a1" textAnchor="middle" fontWeight="bold">BYTE 1 DATA</text>

                {/* Line 3: OBF_A# (Output Buffer Full, PC7) */}
                <text x="15" y="160" fontSize="11" fill="#0891b2" fontWeight="bold">OBF_A#</text>
                <text x="15" y="173" fontSize="8" fill="#64748b">PC7 (Pin 14)</text>
                {/* Falls on WR# rising edge (x=220), rises on ACK_A# falling edge (x=400) */}
                <path d="M 110 150 L 220 150 L 230 180 L 400 180 L 410 150 L 780 150" fill="none" stroke="#0891b2" strokeWidth="2.5" />
                <text x="315" y="174" fontSize="8.5" fill="#155e75" textAnchor="middle" fontWeight="bold">OBF_A# = LOW (Valid Data in Latch)</text>

                {/* Line 4: ACK_A# (Acknowledge Input from Peripheral, PC6) */}
                <text x="15" y="215" fontSize="11" fill="#d97706" fontWeight="bold">ACK_A#</text>
                <text x="15" y="228" fontSize="8" fill="#64748b">PC6 (Pin 15)</text>
                {/* Peripheral pulses low at x=390 to x=490 */}
                <path d="M 110 205 L 390 205 L 400 235 L 490 235 L 500 205 L 780 205" fill="none" stroke="#d97706" strokeWidth="2.5" />
                <text x="445" y="228" fontSize="8.5" fill="#92400e" textAnchor="middle" fontWeight="bold">ACK_A# PULSE</text>

                {/* Line 5: Port A Bidirectional Bus (PA0-PA7) */}
                <text x="15" y="270" fontSize="11" fill="#7c3aed" fontWeight="bold">Port A</text>
                <text x="15" y="283" fontSize="8" fill="#64748b">PA0–PA7 Pins</text>
                {/* Hi-Z line from 110 to 400 */}
                <line x1="110" y1="270" x2="400" y2="270" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,4" />
                <text x="250" y="266" fontSize="8" fill="#64748b" textAnchor="middle">Hi-Z (TRI-STATED)</text>
                {/* Driven active during ACK_A# = 0 (400 to 500) */}
                <path d="M 400 270 L 410 255 L 490 255 L 500 270 L 490 285 L 410 285 Z" fill="#ddd6fe" fillOpacity="0.8" stroke="#7c3aed" strokeWidth="2" />
                <text x="450" y="273" fontSize="8.5" fill="#5b21b6" textAnchor="middle" fontWeight="bold">DRIVEN OUT</text>
                {/* Returns to Hi-Z after ACK_A# goes high */}
                <line x1="500" y1="270" x2="780" y2="270" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,4" />
                <text x="630" y="266" fontSize="8" fill="#64748b" textAnchor="middle">Hi-Z (BUS RELEASED)</text>

                {/* Line 6: INTR_A (Interrupt Request, PC3) */}
                <text x="15" y="325" fontSize="11" fill="#e11d48" fontWeight="bold">INTR_A</text>
                <text x="15" y="338" fontSize="8" fill="#64748b">PC3 (Pin 17)</text>
                {/* Rises on ACK_A# rising edge (x=500), clears on next WR# falling edge (x=680) */}
                <path d="M 110 340 L 500 340 L 510 310 L 670 310 L 680 340 L 780 340" fill="none" stroke="#e11d48" strokeWidth="2.5" />
                <text x="590" y="325" fontSize="8.5" fill="#9f1239" textAnchor="middle" fontWeight="bold">INTR_A = 1 (Requests Next Byte)</text>

                {/* Causal Annotations & Curved Arrows */}
                <path d="M 220 40 Q 225 100 228 145" fill="none" stroke="#0891b2" strokeWidth="1.5" strokeDasharray="2,2" />
                <text x="235" y="135" fontSize="7.5" fill="#0891b2" fontWeight="bold">WR# &uarr; triggers OBF# &darr;</text>

                <path d="M 400 205 Q 405 235 408 260" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="2,2" />
                <text x="355" y="248" fontSize="7.5" fill="#7c3aed" fontWeight="bold">ACK# &darr; enables PA Drivers</text>

                <path d="M 500 205 Q 505 260 508 305" fill="none" stroke="#e11d48" strokeWidth="1.5" strokeDasharray="2,2" />
                <text x="515" y="255" fontSize="7.5" fill="#e11d48" fontWeight="bold">ACK# &uarr; triggers INTR_A &uarr;</text>
              </g>
            )}

            {/* ================================================================= */}
            {/* 2. RECEIVE (RX) WAVEFORMS                                         */}
            {/* ================================================================= */}
            {waveformType === 'rx' && (
              <g>
                {/* Line 1: Port A Bidirectional Bus (External Device Input) */}
                <text x="15" y="55" fontSize="11" fill="#7c3aed" fontWeight="bold">Port A</text>
                <text x="15" y="68" fontSize="8" fill="#64748b">PA0–PA7 Pins</text>
                <line x1="110" y1="55" x2="130" y2="55" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,4" />
                <path d="M 130 55 L 145 40 L 460 40 L 475 55 L 460 70 L 145 70 Z" fill="#ddd6fe" fillOpacity="0.8" stroke="#7c3aed" strokeWidth="2" />
                <text x="300" y="58" fontSize="9" fill="#5b21b6" textAnchor="middle" fontWeight="bold">EXTERNAL DEVICE DRIVES VALID INPUT DATA</text>
                <line x1="475" y1="55" x2="780" y2="55" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,4" />

                {/* Line 2: STB_A# (Strobe Input from Device, PC4) */}
                <text x="15" y="110" fontSize="11" fill="#d97706" fontWeight="bold">STB_A#</text>
                <text x="15" y="123" fontSize="8" fill="#64748b">PC4 (Pin 13)</text>
                <path d="M 110 95 L 170 95 L 180 125 L 350 125 L 360 95 L 780 95" fill="none" stroke="#d97706" strokeWidth="2.5" />
                <text x="265" y="118" fontSize="8.5" fill="#92400e" textAnchor="middle" fontWeight="bold">STB_A# PULSE (LOW)</text>

                {/* Line 3: IBF_A (Input Buffer Full, PC5) */}
                <text x="15" y="165" fontSize="11" fill="#0891b2" fontWeight="bold">IBF_A</text>
                <text x="15" y="178" fontSize="8" fill="#64748b">PC5 (Pin 16)</text>
                {/* Goes high on STB_A# falling edge (x=180), resets on RD# rising edge (x=680) */}
                <path d="M 110 180 L 180 180 L 190 150 L 670 150 L 680 180 L 780 180" fill="none" stroke="#0891b2" strokeWidth="2.5" />
                <text x="430" y="163" fontSize="8.5" fill="#155e75" textAnchor="middle" fontWeight="bold">IBF_A = 1 (Input Buffer Full / Inhibit Device)</text>

                {/* Line 4: INTR_A (Interrupt Request, PC3) */}
                <text x="15" y="220" fontSize="11" fill="#e11d48" fontWeight="bold">INTR_A</text>
                <text x="15" y="233" fontSize="8" fill="#64748b">PC3 (Pin 17)</text>
                {/* Goes high on STB_A# rising edge (x=360), clears on RD# falling edge (x=520) */}
                <path d="M 110 235 L 360 235 L 370 205 L 510 205 L 520 235 L 780 235" fill="none" stroke="#e11d48" strokeWidth="2.5" />
                <text x="440" y="218" fontSize="8.5" fill="#9f1239" textAnchor="middle" fontWeight="bold">INTR_A = 1 (Alerts CPU to Read)</text>

                {/* Line 5: RD# (Read Strobe from 8086 CPU) */}
                <text x="15" y="275" fontSize="11" fill="#059669" fontWeight="bold">RD#</text>
                <text x="15" y="288" fontSize="8" fill="#64748b">Pin 5 (CPU)</text>
                <path d="M 110 260 L 510 260 L 520 290 L 660 290 L 670 260 L 780 260" fill="none" stroke="#059669" strokeWidth="2.5" />
                <text x="590" y="284" fontSize="8.5" fill="#065f46" textAnchor="middle" fontWeight="bold">RD# PULSE (IN AL, PortA)</text>

                {/* Line 6: CPU Internal Data Bus D0-D7 */}
                <text x="15" y="330" fontSize="11" fill="#0284c7" fontWeight="bold">D0–D7</text>
                <text x="15" y="343" fontSize="8" fill="#64748b">CPU Bus</text>
                <line x1="110" y1="330" x2="515" y2="330" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3,3" />
                <path d="M 515 330 L 525 315 L 665 315 L 675 330 L 665 345 L 525 345 Z" fill="#bae6fd" fillOpacity="0.7" stroke="#0284c7" strokeWidth="2" />
                <line x1="675" y1="330" x2="780" y2="330" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3,3" />
                <text x="595" y="333" fontSize="8.5" fill="#0369a1" textAnchor="middle" fontWeight="bold">DATA DELIVERED TO CPU</text>

                {/* Causal Annotations */}
                <path d="M 180 125 Q 185 140 188 150" fill="none" stroke="#0891b2" strokeWidth="1.5" strokeDasharray="2,2" />
                <text x="195" y="142" fontSize="7.5" fill="#0891b2" fontWeight="bold">STB# &darr; sets IBF &uarr;</text>

                <path d="M 360 95 Q 365 150 368 200" fill="none" stroke="#e11d48" strokeWidth="1.5" strokeDasharray="2,2" />
                <text x="375" y="160" fontSize="7.5" fill="#e11d48" fontWeight="bold">STB# &uarr; triggers INTR &uarr;</text>

                <path d="M 520 260 Q 515 245 512 215" fill="none" stroke="#059669" strokeWidth="1.5" strokeDasharray="2,2" />
                <text x="525" y="248" fontSize="7.5" fill="#059669" fontWeight="bold">RD# &darr; clears INTR &darr;</text>
              </g>
            )}

            {/* ================================================================= */}
            {/* 3. INTERLEAVED TX & RX WAVEFORMS (FULL-DUPLEX ARCHITECTURE)      */}
            {/* ================================================================= */}
            {waveformType === 'bidir' && (
              <g>
                {/* 1. Port A Bidirectional Bus: Shows TX Driving -> Hi-Z -> RX Device Driving */}
                <text x="15" y="55" fontSize="11" fill="#7c3aed" fontWeight="bold">Port A</text>
                <text x="15" y="68" fontSize="8" fill="#64748b">PA0–PA7 Pins</text>
                {/* TX phase (110 to 330) */}
                <line x1="110" y1="55" x2="160" y2="55" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3,3" />
                <path d="M 160 55 L 175 40 L 310 40 L 325 55 L 310 70 L 175 70 Z" fill="#ddd6fe" fillOpacity="0.8" stroke="#7c3aed" strokeWidth="2" />
                <text x="242" y="58" fontSize="8.5" fill="#5b21b6" textAnchor="middle" fontWeight="bold">TX: 8255 DRIVES BUS (ACK_A#=0)</text>
                
                {/* Turnaround Hi-Z phase (325 to 490) */}
                <line x1="325" y1="55" x2="490" y2="55" stroke="#dc2626" strokeWidth="2" strokeDasharray="3,3" />
                <text x="408" y="50" fontSize="8" fill="#dc2626" textAnchor="middle" fontWeight="bold">BUS TURNAROUND (Hi-Z)</text>

                {/* RX phase (490 to 720) */}
                <path d="M 490 55 L 505 40 L 690 40 L 705 55 L 690 70 L 505 70 Z" fill="#bae6fd" fillOpacity="0.8" stroke="#0284c7" strokeWidth="2" />
                <text x="597" y="58" fontSize="8.5" fill="#0369a1" textAnchor="middle" fontWeight="bold">RX: PERIPHERAL DRIVES BUS (STB_A#=0)</text>
                <line x1="705" y1="55" x2="780" y2="55" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3,3" />

                {/* 2. Output Handshakes: WR# and OBF_A# */}
                <text x="15" y="115" fontSize="11" fill="#0891b2" fontWeight="bold">OBF_A#</text>
                <text x="15" y="128" fontSize="8" fill="#64748b">PC7 (TX)</text>
                <path d="M 110 110 L 130 110 L 140 135 L 280 135 L 290 110 L 780 110" fill="none" stroke="#0891b2" strokeWidth="2.5" />
                <text x="210" y="129" fontSize="8" fill="#155e75" textAnchor="middle" fontWeight="bold">OBF_A# ACTIVE (TX)</text>

                {/* 3. Output Acknowledge: ACK_A# */}
                <text x="15" y="170" fontSize="11" fill="#d97706" fontWeight="bold">ACK_A#</text>
                <text x="15" y="183" fontSize="8" fill="#64748b">PC6 (TX)</text>
                <path d="M 110 160 L 180 160 L 190 190 L 300 190 L 310 160 L 780 160" fill="none" stroke="#d97706" strokeWidth="2.5" />
                <text x="245" y="184" fontSize="8" fill="#92400e" textAnchor="middle" fontWeight="bold">ACK_A# ACTIVE</text>

                {/* 4. Input Strobe: STB_A# */}
                <text x="15" y="225" fontSize="11" fill="#d97706" fontWeight="bold">STB_A#</text>
                <text x="15" y="238" fontSize="8" fill="#64748b">PC4 (RX)</text>
                <path d="M 110 215 L 500 215 L 510 245 L 610 245 L 620 215 L 780 215" fill="none" stroke="#d97706" strokeWidth="2.5" />
                <text x="560" y="239" fontSize="8" fill="#92400e" textAnchor="middle" fontWeight="bold">STB_A# ACTIVE (RX)</text>

                {/* 5. Input Buffer Full: IBF_A */}
                <text x="15" y="280" fontSize="11" fill="#0891b2" fontWeight="bold">IBF_A</text>
                <text x="15" y="293" fontSize="8" fill="#64748b">PC5 (RX)</text>
                <path d="M 110 295 L 510 295 L 520 265 L 710 265 L 720 295 L 780 295" fill="none" stroke="#0891b2" strokeWidth="2.5" />
                <text x="615" y="278" fontSize="8" fill="#155e75" textAnchor="middle" fontWeight="bold">IBF_A ACTIVE (RX)</text>

                {/* 6. Shared Interrupt Line: INTR_A (PC3) */}
                <text x="15" y="335" fontSize="11" fill="#e11d48" fontWeight="bold">INTR_A</text>
                <text x="15" y="348" fontSize="8" fill="#64748b">PC3 (Shared)</text>
                {/* TX interrupt pulse (310 to 420) and RX interrupt pulse (620 to 710) */}
                <path d="M 110 350 L 310 350 L 320 320 L 420 320 L 430 350 L 620 350 L 630 320 L 710 320 L 720 350 L 780 350" fill="none" stroke="#e11d48" strokeWidth="2.5" />
                <text x="370" y="335" fontSize="8" fill="#9f1239" textAnchor="middle" fontWeight="bold">TX INTR (ACK &uarr;)</text>
                <text x="670" y="335" fontSize="8" fill="#9f1239" textAnchor="middle" fontWeight="bold">RX INTR (STB &uarr;)</text>
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Step Description & Signal Logic Inspector */}
      <div className="bg-purple-50/60 p-3.5 rounded-xl border border-purple-200 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-purple-150 pb-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-purple-600 text-white rounded text-[11px] font-bold">
              PHASE T{activeStep + 1}
            </span>
            <h5 className="font-extrabold text-sm text-purple-950">
              {currentStepData.title}
            </h5>
          </div>
          <span className="text-[11px] font-mono text-purple-700 bg-white px-2 py-0.5 rounded border border-purple-200">
            {currentStepData.timeMarker}
          </span>
        </div>

        {/* Real-Time Pin States Ribbon */}
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Logic Signal States at Cursor:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center font-mono text-xs">
            {Object.entries(currentStepData.signals).map(([sigKey, sigVal], sIdx) => (
              <div 
                key={sIdx} 
                className="bg-white p-2 rounded-lg border border-purple-200 shadow-2xs flex flex-col justify-between"
              >
                <span className="text-[10px] font-bold text-slate-500 uppercase">{sigKey}</span>
                <span className={`text-[11px] font-extrabold mt-1 ${
                  sigVal.includes('LOW') || sigVal.includes('Active') || sigVal.includes('DRIVEN')
                    ? 'text-purple-700' 
                    : sigVal.includes('HIGH') || sigVal.includes('VALID')
                    ? 'text-emerald-700'
                    : 'text-slate-600'
                }`}>
                  {sigVal}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Causal Explanation & Timing Spec */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="bg-white p-3 rounded-lg border border-purple-200 space-y-1">
            <h6 className="font-bold text-xs text-purple-900 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-purple-600" />
              Causal Hardware Trigger:
            </h6>
            <p className="text-xs text-slate-700 leading-relaxed font-sans">
              {currentStepData.causalRelation}
            </p>
          </div>

          <div className="bg-white p-3 rounded-lg border border-purple-200 space-y-1">
            <h6 className="font-bold text-xs text-purple-900 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Critical Timing / Bus Rule:
            </h6>
            <p className="text-xs text-slate-700 leading-relaxed font-sans">
              {(currentStepData as any).criticalTiming || 'Port A tri-state buffers guarantee zero bus collision during turnaround.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
