import React, { useState } from 'react';
import { 
  Activity, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Info, 
  RotateCcw, 
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Zap,
  Clock
} from 'lucide-react';

interface PPI8255Mode1WaveformsProps {
  initialType?: 'input' | 'output';
  currentStep?: number;
  onStepChange?: (step: number) => void;
}

export default function PPI8255Mode1Waveforms({
  initialType = 'input',
  currentStep = 0,
  onStepChange
}: PPI8255Mode1WaveformsProps) {
  const [waveformType, setWaveformType] = useState<'input' | 'output'>(initialType);
  const [activeStep, setActiveStep] = useState<number>(currentStep);
  const [showDetails, setShowDetails] = useState<boolean>(true);

  const handleStepSelect = (step: number) => {
    setActiveStep(step);
    if (onStepChange) {
      onStepChange(step);
    }
  };

  // Step information for Input Handshake Waveform
  const inputWaveformSteps = [
    {
      step: 0,
      title: 'T1: External Data Valid & STB# Pulse Low',
      timeMarker: 't = 120ns',
      signals: {
        data: 'VALID DATA (PA/PB)',
        stb: 'LOW (Active Strobe)',
        ibf: 'HIGH (Latched)',
        intr: 'LOW (Inactive)',
        rd: 'HIGH (Idle)'
      },
      causalRelation: 'Peripheral asserts STB# = 0; Falling edge of STB# latches data into 8255 input register.',
      criticalTiming: 't_SD (Data Setup Time) ≥ 100ns before STB# rising edge.'
    },
    {
      step: 1,
      title: 'T2: 8255 Asserts IBF = HIGH',
      timeMarker: 't = 220ns',
      signals: {
        data: 'VALID DATA (Held in Register)',
        stb: 'LOW → HIGH transition',
        ibf: 'HIGH (Buffer Busy)',
        intr: 'LOW',
        rd: 'HIGH (Idle)'
      },
      causalRelation: 'Falling edge of STB# drives IBF = 1 (PC5). Informs peripheral not to send new data.',
      criticalTiming: 't_SIB (STB# low to IBF high delay) ≤ 300ns max.'
    },
    {
      step: 2,
      title: 'T3: STB# Returns HIGH → INTR Triggered',
      timeMarker: 't = 400ns',
      signals: {
        data: 'LATCHED DATA IN 8255',
        stb: 'HIGH (Idle)',
        ibf: 'HIGH (Full)',
        intr: 'HIGH (Interrupt Active)',
        rd: 'HIGH (Idle)'
      },
      causalRelation: 'Rising edge of STB# (while IBF=1 & INTE=1) generates active-HIGH interrupt INTR = 1 on PC3 to 8086 CPU.',
      criticalTiming: 't_SIT (STB# high to INTR high delay) ≤ 250ns.'
    },
    {
      step: 3,
      title: 'T4: 8086 CPU Asserts RD# = LOW (IN AL, PortA)',
      timeMarker: 't = 600ns',
      signals: {
        data: 'TRANSFERRED TO D0–D7',
        stb: 'HIGH',
        ibf: 'HIGH',
        intr: 'LOW (Cleared on RD# falling edge)',
        rd: 'LOW (Read Strobe Active)'
      },
      causalRelation: 'CPU enters ISR and executes IN instruction (RD# = 0). Falling edge of RD# automatically resets INTR = 0.',
      criticalTiming: 't_RIT (RD# low to INTR low reset delay) ≤ 200ns.'
    },
    {
      step: 4,
      title: 'T5: RD# Returns HIGH → IBF Resets to 0',
      timeMarker: 't = 780ns',
      signals: {
        data: 'IDLE / READY FOR NEXT BYTE',
        stb: 'HIGH (Ready)',
        ibf: 'LOW (Buffer Empty)',
        intr: 'LOW',
        rd: 'HIGH (Cycle Complete)'
      },
      causalRelation: 'Rising edge of RD# completes the I/O read cycle and automatically resets IBF = 0. Peripheral is free to strobe next byte.',
      criticalTiming: 't_RIB (RD# high to IBF low delay) ≤ 200ns.'
    }
  ];

  // Step information for Output Handshake Waveform
  const outputWaveformSteps = [
    {
      step: 0,
      title: 'T1: 8086 CPU Executes OUT Port, AL (WR# = LOW)',
      timeMarker: 't = 100ns',
      signals: {
        wr: 'LOW (Write Strobe Active)',
        data: 'CPU DATA ON D0–D7',
        obf: 'HIGH (Initial)',
        ack: 'HIGH (Idle)',
        intr: 'LOW (Cleared)'
      },
      causalRelation: 'CPU writes data to 8255 output latch via WR# = 0. Falling edge of WR# clears any pending INTR.',
      criticalTiming: 't_WIT (WR# low to INTR low reset delay) ≤ 200ns.'
    },
    {
      step: 1,
      title: 'T2: WR# Returns HIGH → 8255 Asserts OBF# = LOW',
      timeMarker: 't = 280ns',
      signals: {
        wr: 'HIGH (Write Completed)',
        data: 'VALID OUTPUT ON PA/PB PINS',
        obf: 'LOW (Output Buffer Full Strobe)',
        ack: 'HIGH (Idle)',
        intr: 'LOW'
      },
      causalRelation: 'Rising edge of WR# latches data to Port output pins and asserts OBF# = 0 (PC7). Signals printer that data is ready.',
      criticalTiming: 't_WOB (WR# high to OBF# low delay) ≤ 250ns.'
    },
    {
      step: 2,
      title: 'T3: Peripheral Reads Data & Sends ACK# = LOW',
      timeMarker: 't = 480ns',
      signals: {
        wr: 'HIGH',
        data: 'ACCEPTED BY PERIPHERAL',
        obf: 'HIGH (Reset on ACK# falling edge)',
        ack: 'LOW (Acknowledge Strobe)',
        intr: 'LOW'
      },
      causalRelation: 'Peripheral (printer) reads data from Port pins and pulses ACK# = 0. Falling edge of ACK# resets OBF# = 1.',
      criticalTiming: 't_AOB (ACK# low to OBF# high reset delay) ≤ 200ns.'
    },
    {
      step: 3,
      title: 'T4: ACK# Returns HIGH → 8255 Asserts INTR = HIGH',
      timeMarker: 't = 660ns',
      signals: {
        wr: 'HIGH',
        data: 'TRANSFER PROCESSED',
        obf: 'HIGH',
        ack: 'HIGH (Strobe Ended)',
        intr: 'HIGH (Interrupt to 8086 CPU)'
      },
      causalRelation: 'Rising edge of ACK# (with OBF#=1 & INTE=1) raises INTR = 1 on PC3 to signal CPU for the next byte.',
      criticalTiming: 't_AIT (ACK# high to INTR high delay) ≤ 250ns.'
    },
    {
      step: 4,
      title: 'T5: CPU Initiates Next Write Cycle (WR# = LOW)',
      timeMarker: 't = 850ns',
      signals: {
        wr: 'LOW (Next Byte OUT)',
        data: 'NEW DATA ON D0–D7',
        obf: 'HIGH',
        ack: 'HIGH',
        intr: 'LOW (Reset on WR# falling edge)'
      },
      causalRelation: 'CPU begins next output transfer. Falling edge of WR# immediately clears INTR = 0. Handshake cycle repeats.',
      criticalTiming: 'Cycle complete; new transmission initiated.'
    }
  ];

  const currentStepData = waveformType === 'input' 
    ? inputWaveformSteps[activeStep] 
    : outputWaveformSteps[activeStep];

  // X coordinate markers for timing steps
  const inputStepXCoords = [110, 230, 390, 550, 690];
  const outputStepXCoords = [110, 260, 440, 600, 720];
  const activeX = waveformType === 'input' ? inputStepXCoords[activeStep] : outputStepXCoords[activeStep];

  return (
    <div className="bg-white text-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 font-sans">
      {/* Header with Mode Toggle and Step Nav */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200 shadow-2xs">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span>8255 Mode 1 Handshake Timing Waveforms</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                Timing Analyzer
              </span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Interactive timing diagram showing exact strobe edges, setup times, and causal relationships
            </p>
          </div>
        </div>

        {/* Input / Output Waveform Mode Switch */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => { setWaveformType('input'); setActiveStep(0); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              waveformType === 'input' 
                ? 'bg-indigo-600 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            Strobed Input Waveforms
          </button>
          <button
            onClick={() => { setWaveformType('output'); setActiveStep(0); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              waveformType === 'output' 
                ? 'bg-indigo-600 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Strobed Output Waveforms
          </button>
        </div>
      </div>

      {/* Interactive Step Scrubber Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="text-slate-500 font-medium">TIMELINE POSITION:</span>
          <span className="font-bold text-indigo-900 bg-indigo-100/70 px-2 py-0.5 rounded border border-indigo-200">
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
                  ? 'bg-indigo-600 text-white shadow-xs'
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
            className="p-1 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white cursor-pointer shadow-2xs"
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

      {/* SVG DIGITAL TIMING WAVEFORM DISPLAY - LIGHT BACKGROUND */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 overflow-x-auto shadow-inner">
        <div className="min-w-[760px] relative">
          <svg viewBox="0 0 800 360" className="w-full h-auto select-none font-mono">
            {/* Background Grid Pattern */}
            <defs>
              <pattern id="lightGrid" width="40" height="20" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.75" strokeDasharray="2,2" />
              </pattern>
            </defs>

            <rect width="800" height="360" fill="#f8fafc" rx="8" />
            <rect x="100" y="20" width="680" height="320" fill="url(#lightGrid)" />

            {/* Time Phase Background Highlights */}
            {waveformType === 'input' ? (
              <>
                <rect x="100" y="20" width="80" height="320" fill={activeStep === 0 ? '#e0e7ff' : '#ffffff'} opacity={activeStep === 0 ? '0.9' : '0.4'} />
                <rect x="180" y="20" width="160" height="320" fill={activeStep === 1 ? '#e0e7ff' : '#f1f5f9'} opacity={activeStep === 1 ? '0.9' : '0.4'} />
                <rect x="340" y="20" width="160" height="320" fill={activeStep === 2 ? '#e0e7ff' : '#ffffff'} opacity={activeStep === 2 ? '0.9' : '0.4'} />
                <rect x="500" y="20" width="160" height="320" fill={activeStep === 3 ? '#e0e7ff' : '#f1f5f9'} opacity={activeStep === 3 ? '0.9' : '0.4'} />
                <rect x="660" y="20" width="120" height="320" fill={activeStep === 4 ? '#e0e7ff' : '#ffffff'} opacity={activeStep === 4 ? '0.9' : '0.4'} />
              </>
            ) : (
              <>
                <rect x="100" y="20" width="120" height="320" fill={activeStep === 0 ? '#e0e7ff' : '#ffffff'} opacity={activeStep === 0 ? '0.9' : '0.4'} />
                <rect x="220" y="20" width="160" height="320" fill={activeStep === 1 ? '#e0e7ff' : '#f1f5f9'} opacity={activeStep === 1 ? '0.9' : '0.4'} />
                <rect x="380" y="20" width="160" height="320" fill={activeStep === 2 ? '#e0e7ff' : '#ffffff'} opacity={activeStep === 2 ? '0.9' : '0.4'} />
                <rect x="540" y="20" width="140" height="320" fill={activeStep === 3 ? '#e0e7ff' : '#f1f5f9'} opacity={activeStep === 3 ? '0.9' : '0.4'} />
                <rect x="680" y="20" width="100" height="320" fill={activeStep === 4 ? '#e0e7ff' : '#ffffff'} opacity={activeStep === 4 ? '0.9' : '0.4'} />
              </>
            )}

            {/* Time Axis Labels Top */}
            <g fontSize="10" fill="#475569" fontWeight="bold">
              {waveformType === 'input' ? (
                <>
                  <text x="140" y="15" textAnchor="middle">T1: STB# Pulse</text>
                  <text x="260" y="15" textAnchor="middle">T2: IBF High</text>
                  <text x="420" y="15" textAnchor="middle">T3: INTR High</text>
                  <text x="580" y="15" textAnchor="middle">T4: RD# Pulse</text>
                  <text x="720" y="15" textAnchor="middle">T5: Buffer Free</text>
                </>
              ) : (
                <>
                  <text x="160" y="15" textAnchor="middle">T1: CPU WR#</text>
                  <text x="300" y="15" textAnchor="middle">T2: OBF# Low</text>
                  <text x="460" y="15" textAnchor="middle">T3: Peripheral ACK#</text>
                  <text x="610" y="15" textAnchor="middle">T4: INTR High</text>
                  <text x="730" y="15" textAnchor="middle">T5: Next WR#</text>
                </>
              )}
            </g>

            {/* ======================================================= */}
            {/* WAVEFORMS SECTION 1: MODE 1 INPUT WAVEFORMS             */}
            {/* ======================================================= */}
            {waveformType === 'input' && (
              <g>
                {/* 1. PORT DATA INPUT BUS (PA0-PA7 / PB0-PB7) */}
                <text x="15" y="55" fontSize="11" fill="#0284c7" fontWeight="bold">Port Data</text>
                <text x="15" y="68" fontSize="8" fill="#64748b">PA / PB</text>
                {/* Bus waveform (Hexagon packet) */}
                <path d="M 100 55 L 120 40 L 480 40 L 500 55 L 480 70 L 120 70 Z" fill="#bae6fd" fillOpacity="0.7" stroke="#0284c7" strokeWidth="2" />
                <line x1="100" y1="55" x2="120" y2="55" stroke="#0284c7" strokeWidth="1.5" />
                <line x1="500" y1="55" x2="780" y2="55" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3,3" />
                <text x="300" y="58" fontSize="10" fill="#0369a1" textAnchor="middle" fontWeight="bold">VALID INPUT DATA (from Keyboard / ADC)</text>

                {/* 2. STB# (Strobe Input, PC4/PC2) */}
                <text x="15" y="115" fontSize="11" fill="#d97706" fontWeight="bold">STB#</text>
                <text x="15" y="128" fontSize="8" fill="#64748b">PC4 / PC2</text>
                {/* Active-LOW pulse */}
                <path d="M 100 100 L 140 100 L 150 130 L 340 130 L 350 100 L 780 100" fill="none" stroke="#d97706" strokeWidth="2.5" />
                <text x="245" y="124" fontSize="9" fill="#92400e" textAnchor="middle" fontWeight="bold">STB# PULSE (LOW)</text>

                {/* 3. IBF (Input Buffer Full, PC5/PC1) */}
                <text x="15" y="175" fontSize="11" fill="#0891b2" fontWeight="bold">IBF</text>
                <text x="15" y="188" fontSize="8" fill="#64748b">PC5 / PC1</text>
                {/* Active-HIGH signal */}
                <path d="M 100 190 L 150 190 L 160 160 L 680 160 L 690 190 L 780 190" fill="none" stroke="#0891b2" strokeWidth="2.5" />
                <text x="420" y="173" fontSize="9" fill="#155e75" textAnchor="middle" fontWeight="bold">IBF = HIGH (Buffer Busy)</text>

                {/* 4. INTR (Interrupt Request, PC3/PC0) */}
                <text x="15" y="235" fontSize="11" fill="#e11d48" fontWeight="bold">INTR</text>
                <text x="15" y="248" fontSize="8" fill="#64748b">PC3 / PC0</text>
                {/* Active-HIGH signal triggered on STB# rising edge, cleared on RD# falling edge */}
                <path d="M 100 250 L 350 250 L 360 220 L 530 220 L 540 250 L 780 250" fill="none" stroke="#e11d48" strokeWidth="2.5" />
                <text x="445" y="233" fontSize="9" fill="#be123c" textAnchor="middle" fontWeight="bold">INTR = 1 (Interrupt CPU)</text>

                {/* 5. RD# (Read Strobe from CPU) */}
                <text x="15" y="295" fontSize="11" fill="#16a34a" fontWeight="bold">RD#</text>
                <text x="15" y="308" fontSize="8" fill="#64748b">8086 Pin</text>
                {/* Active-LOW read pulse */}
                <path d="M 100 280 L 530 280 L 540 310 L 680 310 L 690 280 L 780 280" fill="none" stroke="#16a34a" strokeWidth="2.5" />
                <text x="610" y="304" fontSize="9" fill="#166534" textAnchor="middle" fontWeight="bold">CPU "IN" CYCLE (RD# = 0)</text>

                {/* 6. CPU DATA BUS (D0-D7) */}
                <text x="15" y="340" fontSize="10" fill="#7c3aed" fontWeight="bold">D0–D7</text>
                <line x1="100" y1="340" x2="540" y2="340" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3,3" />
                <path d="M 540 340 L 550 330 L 670 330 L 680 340 L 670 350 L 550 350 Z" fill="#ddd6fe" fillOpacity="0.8" stroke="#7c3aed" strokeWidth="2" />
                <line x1="680" y1="340" x2="780" y2="340" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3,3" />
                <text x="610" y="344" fontSize="9" fill="#5b21b6" textAnchor="middle" fontWeight="bold">DATA TO CPU AL</text>

                {/* Causal Trigger Arrows & Annotations */}
                <path d="M 150 130 L 150 150 L 160 160" fill="none" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="2,2" />
                <path d="M 350 100 L 350 210 L 360 220" fill="none" stroke="#e11d48" strokeWidth="1.5" strokeDasharray="2,2" />
                <path d="M 540 280 L 540 255" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeDasharray="2,2" />
                <path d="M 680 280 L 680 195" fill="none" stroke="#0891b2" strokeWidth="1.5" strokeDasharray="2,2" />
              </g>
            )}

            {/* ======================================================= */}
            {/* WAVEFORMS SECTION 2: MODE 1 OUTPUT WAVEFORMS            */}
            {/* ======================================================= */}
            {waveformType === 'output' && (
              <g>
                {/* 1. WR# (Write Strobe from CPU) */}
                <text x="15" y="55" fontSize="11" fill="#16a34a" fontWeight="bold">WR#</text>
                <text x="15" y="68" fontSize="8" fill="#64748b">8086 Pin</text>
                {/* First WR# pulse */}
                <path d="M 100 40 L 120 40 L 130 70 L 220 70 L 230 40 L 680 40 L 690 70 L 770 70 L 780 40" fill="none" stroke="#16a34a" strokeWidth="2.5" />
                <text x="175" y="64" fontSize="9" fill="#166534" textAnchor="middle" fontWeight="bold">CPU "OUT" CYCLE (WR# = 0)</text>
                <text x="730" y="64" fontSize="8" fill="#166534" textAnchor="middle" fontWeight="bold">NEXT "OUT"</text>

                {/* 2. PORT DATA OUTPUT BUS (PA0-PA7 / PB0-PB7) */}
                <text x="15" y="115" fontSize="11" fill="#0284c7" fontWeight="bold">Port Data</text>
                <text x="15" y="128" fontSize="8" fill="#64748b">PA / PB</text>
                <line x1="100" y1="115" x2="220" y2="115" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3,3" />
                <path d="M 220 115 L 235 100 L 685 100 L 700 115 L 685 130 L 235 130 Z" fill="#bae6fd" fillOpacity="0.7" stroke="#0284c7" strokeWidth="2" />
                <text x="460" y="118" fontSize="10" fill="#0369a1" textAnchor="middle" fontWeight="bold">VALID OUTPUT DATA HELD ON PORT PINS</text>

                {/* 3. OBF# (Output Buffer Full, PC7/PC1) */}
                <text x="15" y="175" fontSize="11" fill="#0891b2" fontWeight="bold">OBF#</text>
                <text x="15" y="188" fontSize="8" fill="#64748b">PC7 / PC1</text>
                {/* Active-LOW signal: goes low on WR# rising edge, goes high on ACK# falling edge */}
                <path d="M 100 160 L 230 160 L 240 190 L 400 190 L 410 160 L 780 160" fill="none" stroke="#0891b2" strokeWidth="2.5" />
                <text x="320" y="184" fontSize="9" fill="#155e75" textAnchor="middle" fontWeight="bold">OBF# = LOW (Data Ready Strobe)</text>

                {/* 4. ACK# (Acknowledge Input from Peripheral, PC6/PC2) */}
                <text x="15" y="235" fontSize="11" fill="#d97706" fontWeight="bold">ACK#</text>
                <text x="15" y="248" fontSize="8" fill="#64748b">PC6 / PC2</text>
                {/* Active-LOW pulse from printer */}
                <path d="M 100 220 L 390 220 L 400 250 L 540 250 L 550 220 L 780 220" fill="none" stroke="#d97706" strokeWidth="2.5" />
                <text x="470" y="244" fontSize="9" fill="#92400e" textAnchor="middle" fontWeight="bold">PRINTER ACK# PULSE (LOW)</text>

                {/* 5. INTR (Interrupt Request, PC3/PC0) */}
                <text x="15" y="295" fontSize="11" fill="#e11d48" fontWeight="bold">INTR</text>
                <text x="15" y="308" fontSize="8" fill="#64748b">PC3 / PC0</text>
                {/* Active-HIGH signal: goes high on ACK# rising edge, clears on WR# falling edge */}
                <path d="M 100 310 L 550 310 L 560 280 L 680 280 L 690 310 L 780 310" fill="none" stroke="#e11d48" strokeWidth="2.5" />
                <text x="620" y="294" fontSize="9" fill="#be123c" textAnchor="middle" fontWeight="bold">INTR = 1 (Request Next Byte)</text>

                {/* Causal Trigger Arrows */}
                <path d="M 230 70 L 230 180 L 240 190" fill="none" stroke="#0891b2" strokeWidth="1.5" strokeDasharray="2,2" />
                <path d="M 400 220 L 400 170 L 410 160" fill="none" stroke="#d97706" strokeWidth="1.5" strokeDasharray="2,2" />
                <path d="M 550 220 L 550 270 L 560 280" fill="none" stroke="#e11d48" strokeWidth="1.5" strokeDasharray="2,2" />
                <path d="M 680 70 L 680 300" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeDasharray="2,2" />
              </g>
            )}

            {/* TIMELINE VERTICAL CURSOR (ACTIVE STEP HIGHLIGHT) */}
            <g>
              <line 
                x1={activeX} 
                y1="20" 
                x2={activeX} 
                y2="340" 
                stroke="#4f46e5" 
                strokeWidth="2" 
                strokeDasharray="4,4" 
              />
              <circle cx={activeX} cy="20" r="5" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" />
              <circle cx={activeX} cy="340" r="5" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" />
            </g>
          </svg>
        </div>
      </div>

      {/* Dynamic Detail Card for the Selected Waveform Step */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
        {/* Left: Step Explanation & Causal Chain */}
        <div className="md:col-span-7 bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 font-mono">
              ACTIVE TIME WINDOW: PHASE T{activeStep + 1}
            </span>
            <span className="text-[10px] font-mono text-amber-900 font-bold bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
              {currentStepData.timeMarker}
            </span>
          </div>

          <h5 className="font-extrabold text-xs text-slate-900">
            {currentStepData.title}
          </h5>

          <p className="text-xs text-slate-700 leading-relaxed font-sans">
            {currentStepData.causalRelation}
          </p>

          <div className="pt-2 border-t border-slate-200 flex items-center gap-2 text-[11px] text-slate-600 font-mono">
            <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span><strong>Timing Parameter:</strong> {currentStepData.criticalTiming}</span>
          </div>
        </div>

        {/* Right: Live Logic State Table */}
        <div className="md:col-span-5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 font-mono">
              PIN LOGIC LEVELS AT T{activeStep + 1}
            </span>
            <span className="text-[10px] text-indigo-700 font-bold font-mono">
              {waveformType === 'input' ? 'STB / IBF / INTR / RD' : 'WR / OBF / ACK / INTR'}
            </span>
          </div>

          <div className="space-y-1.5 font-mono text-[11px]">
            {Object.entries(currentStepData.signals).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between p-1 px-2.5 rounded bg-white border border-slate-200 shadow-2xs">
                <span className="font-bold text-slate-600 uppercase">{key}:</span>
                <span className={`font-bold ${
                  val.includes('LOW') || val.includes('Cleared')
                    ? 'text-amber-700'
                    : val.includes('HIGH') || val.includes('Active') || val.includes('VALID')
                    ? 'text-emerald-700'
                    : 'text-indigo-700'
                }`}>
                  {val}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timing Formula Reference Bar */}
      <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200 text-xs text-indigo-950 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="text-[11px] leading-relaxed">
            {waveformType === 'input' ? (
              <>
                <strong>Input Handshake Timing Rules:</strong> <code className="font-mono font-bold text-amber-900 bg-amber-100 px-1 py-0.5 rounded">IBF = STB# ↓</code> (Latches data &amp; sets busy) &nbsp;|&nbsp; <code className="font-mono font-bold text-rose-900 bg-rose-100 px-1 py-0.5 rounded">INTR = STB# ↑</code> (Requests CPU) &nbsp;|&nbsp; <code className="font-mono font-bold text-emerald-900 bg-emerald-100 px-1 py-0.5 rounded">IBF Reset = RD# ↑</code>
              </>
            ) : (
              <>
                <strong>Output Handshake Timing Rules:</strong> <code className="font-mono font-bold text-cyan-900 bg-cyan-100 px-1 py-0.5 rounded">OBF# = WR# ↑</code> (Data valid on pins) &nbsp;|&nbsp; <code className="font-mono font-bold text-amber-900 bg-amber-100 px-1 py-0.5 rounded">OBF# Reset = ACK# ↓</code> &nbsp;|&nbsp; <code className="font-mono font-bold text-rose-900 bg-rose-100 px-1 py-0.5 rounded">INTR = ACK# ↑</code> (Ready for next byte)
              </>
            )}
          </span>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-[11px] text-indigo-700 hover:text-indigo-900 font-bold underline cursor-pointer"
        >
          {showDetails ? 'Hide Waveform Details' : 'Show Waveform Details'}
        </button>
      </div>
    </div>
  );
}
