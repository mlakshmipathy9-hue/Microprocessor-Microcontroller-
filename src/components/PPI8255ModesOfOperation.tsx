import React, { useState } from 'react';
import PPI8255Mode1Waveforms from './PPI8255Mode1Waveforms';
import { 
  Zap, 
  Layers, 
  ArrowRight, 
  ArrowLeftRight, 
  CheckCircle2, 
  Sliders, 
  Info, 
  Cpu, 
  ToggleLeft, 
  ToggleRight, 
  ShieldCheck, 
  HelpCircle,
  Activity,
  FileText,
  Play,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  ArrowUpRight,
  ArrowDownLeft,
  Radio
} from 'lucide-react';

export default function PPI8255ModesOfOperation() {
  const [selectedSubView, setSelectedSubView] = useState<'overview' | 'bsr' | 'mode0' | 'mode1' | 'mode2' | 'table'>('overview');
  
  // Interactive Mode 1 Handshake Stepper State
  const [mode1Type, setMode1Type] = useState<'input' | 'output'>('input');
  const [mode1Step, setMode1Step] = useState<number>(0);

  // Interactive Mode 2 Bidirectional State
  const [mode2Dir, setMode2Dir] = useState<'tx' | 'rx'>('tx');
  const [mode2Step, setMode2Step] = useState<number>(0);

  // Show 16 Configurations Table in Mode 0
  const [showConfigTable, setShowConfigTable] = useState<boolean>(false);

  // Interactive BSR Demo
  const [demoBsrBit, setDemoBsrBit] = useState<number>(3);
  const [demoBsrVal, setDemoBsrVal] = useState<number>(1);
  const [demoPortCBits, setDemoPortCBits] = useState<number[]>([0, 1, 0, 1, 0, 0, 1, 0]);

  const applyDemoBsr = () => {
    const updated = [...demoPortCBits];
    updated[demoBsrBit] = demoBsrVal;
    setDemoPortCBits(updated);
  };

  // TypeScript Interfaces for Steppers
  interface Mode1Step {
    title: string;
    cpuAction: string;
    periphAction: string;
    ppiAction: string;
    hardwareState: string;
    stb?: number;
    ibf?: number;
    intr?: number;
    rd?: number;
    wr?: number;
    obf?: number;
    ack?: number;
  }

  interface Mode2Step {
    title: string;
    busDir: string;
    desc: string;
    pinStatus: string;
    wr?: number;
    rd?: number;
    obfa?: number;
    acka?: number;
    intra?: number;
    stba?: number;
    ibfa?: number;
  }

  // Mode 1 Steps Definition
  const mode1InputSteps: Mode1Step[] = [
    {
      title: 'Step 1: Peripheral Sends Data & Asserts STB# = 0',
      stb: 0,
      ibf: 0,
      intr: 0,
      rd: 1,
      cpuAction: '8086 CPU is executing background routines (waiting or polling).',
      periphAction: 'External Device (e.g. Keyboard/ADC) places 8-bit data onto PA0–PA7 and pulses STB# = 0.',
      ppiAction: '8255 detects falling edge of STB# and latches external data into Port A input register.',
      hardwareState: 'Data latched into Port A register'
    },
    {
      title: 'Step 2: 8255 Drives IBF = 1 (Input Buffer Full)',
      stb: 0,
      ibf: 1,
      intr: 0,
      rd: 1,
      cpuAction: '8086 has not yet read the data.',
      periphAction: 'External device detects IBF = 1 (Busy) and pauses sending any further data.',
      ppiAction: '8255 automatically drives IBF = HIGH (PC5) to acknowledge latching and prevent data overwrite.',
      hardwareState: 'IBF active (Peripheral inhibited from writing)'
    },
    {
      title: 'Step 3: STB# Returns High & 8255 Asserts INTR = 1',
      stb: 1,
      ibf: 1,
      intr: 1,
      rd: 1,
      cpuAction: '8086 receives hardware Interrupt on INTR pin (or reads status register in polling).',
      periphAction: 'Peripheral line STB# returns to HIGH (idle).',
      ppiAction: 'When STB# is HIGH, IBF is HIGH, and INTE is enabled, 8255 asserts INTR = HIGH (PC3) to signal 8086.',
      hardwareState: 'Interrupt raised to CPU (INTR = 1)'
    },
    {
      title: 'Step 4: 8086 CPU Executes "IN AL, PortA" (RD# = 0)',
      stb: 1,
      ibf: 1,
      intr: 0,
      rd: 0,
      cpuAction: '8086 enters Interrupt Service Routine (ISR) and executes IN AL, 00H (asserts RD# = 0).',
      periphAction: 'Peripheral is idle, waiting for buffer to free.',
      ppiAction: 'Falling edge of RD# automatically resets INTR = 0 and places latched data on system data bus D0–D7.',
      hardwareState: 'INTR cleared; Data transferred to CPU AL'
    },
    {
      title: 'Step 5: RD# Returns High → IBF Resets to 0 (Buffer Empty)',
      stb: 1,
      ibf: 0,
      intr: 0,
      rd: 1,
      cpuAction: '8086 stores AL in RAM and completes the I/O read cycle.',
      periphAction: 'Peripheral detects IBF = 0 ("Buffer Empty") and is now ready to transmit the next byte!',
      ppiAction: 'Rising edge of RD# automatically resets IBF = 0 (PC5). Handshake cycle complete!',
      hardwareState: 'Buffer cleared; Ready for next byte'
    }
  ];

  const mode1OutputSteps: Mode1Step[] = [
    {
      title: 'Step 1: 8086 CPU Executes "OUT PortA, AL" (WR# = 0)',
      wr: 0,
      obf: 1,
      ack: 1,
      intr: 0,
      cpuAction: '8086 writes data byte to Port A by asserting WR# = LOW.',
      periphAction: 'External device (e.g. Printer) is in standby.',
      ppiAction: '8255 receives WR# = 0 and accepts data from system bus D0–D7.',
      hardwareState: 'Data writing into Port A output latch'
    },
    {
      title: 'Step 2: WR# Returns High → 8255 Asserts OBF# = 0',
      wr: 1,
      obf: 0,
      ack: 1,
      intr: 0,
      cpuAction: '8086 finishes OUT instruction and continues execution.',
      periphAction: 'Printer detects OBF# = LOW ("Data is ready on Port A pins").',
      ppiAction: 'On rising edge of WR#, 8255 latches data to output pins (PA0–PA7) and asserts OBF# = LOW (PC7).',
      hardwareState: 'OBF# = 0 (Data valid on Port A pins)'
    },
    {
      title: 'Step 3: Peripheral Latches Data & Sends ACK# = 0',
      wr: 1,
      obf: 1,
      ack: 0,
      intr: 0,
      cpuAction: '8086 is doing other tasks or waiting for completion.',
      periphAction: 'Printer reads the byte from PA0–PA7 and sends a LOW pulse ACK# = 0 (PC6).',
      ppiAction: 'Falling edge of ACK# automatically resets OBF# = HIGH (indicating data has been accepted).',
      hardwareState: 'OBF# reset to 1; Peripheral processing byte'
    },
    {
      title: 'Step 4: ACK# Returns High → 8255 Asserts INTR = 1',
      wr: 1,
      obf: 1,
      ack: 1,
      intr: 1,
      cpuAction: '8086 receives INTR = 1 indicating printer is ready for next character.',
      periphAction: 'Printer finishes print cycle and returns ACK# to HIGH.',
      ppiAction: 'On rising edge of ACK# (with OBF#=1 and INTE=1), 8255 drives INTR = HIGH (PC3).',
      hardwareState: 'INTR = 1 (Requests next byte from CPU)'
    },
    {
      title: 'Step 5: CPU Writes Next Byte → INTR Cleared to 0',
      wr: 0,
      obf: 1,
      ack: 1,
      intr: 0,
      cpuAction: '8086 ISR executes OUT PortA, AL for next byte, asserting WR# = LOW.',
      periphAction: 'Peripheral waits for next OBF# strobe.',
      ppiAction: 'Falling edge of WR# immediately clears INTR = 0. New transfer begins!',
      hardwareState: 'Next byte handshake initiated'
    }
  ];

  // Mode 2 Steps Definition
  const mode2TxSteps: Mode2Step[] = [
    {
      title: 'Mode 2 Transmit (CPU → Device): Step 1 - CPU Writes Data',
      wr: 0,
      obfa: 0,
      acka: 1,
      intra: 0,
      busDir: 'CPU → 8255 Output Latch',
      desc: '8086 CPU executes OUT PortA, AL (WR# = 0). Data is written into Port A output latch.',
      pinStatus: 'PA0–PA7 outputs held; OBF_A# (PC7) goes LOW on rising edge of WR#.'
    },
    {
      title: 'Mode 2 Transmit: Step 2 - Device Pulses ACK_A# = 0',
      wr: 1,
      obfa: 1,
      acka: 0,
      intra: 0,
      busDir: '8255 PA Pins → Device Bus',
      desc: 'Device responds with ACK_A# = 0. This enables Port A output buffers to drive external bus.',
      pinStatus: 'ACK_A# (PC6) = 0 enables Port A tri-state drivers; OBF_A# goes HIGH.'
    },
    {
      title: 'Mode 2 Transmit: Step 3 - Transmission Complete (INTR_A = 1)',
      wr: 1,
      obfa: 1,
      acka: 1,
      intra: 1,
      busDir: 'Bus floats back to High-Z',
      desc: 'On rising edge of ACK_A#, 8255 disables output buffers (High-Z) and asserts INTR_A = 1 (PC3).',
      pinStatus: 'INTR_A = 1 signals CPU that device is ready for next byte.'
    }
  ];

  const mode2RxSteps: Mode2Step[] = [
    {
      title: 'Mode 2 Receive (Device → CPU): Step 1 - Device Sends STB_A# = 0',
      rd: 1,
      stba: 0,
      ibfa: 1,
      intra: 0,
      busDir: 'Device → 8255 Input Latch',
      desc: 'External Device places data on bidirectional Port A lines and pulses STB_A# = 0 (PC4).',
      pinStatus: 'Data latched into Port A input register; IBF_A (PC5) goes HIGH.'
    },
    {
      title: 'Mode 2 Receive: Step 2 - STB_A# Returns High → INTR_A = 1',
      rd: 1,
      stba: 1,
      ibfa: 1,
      intra: 1,
      busDir: 'Data held safely in 8255 register',
      desc: 'When STB_A# returns HIGH, 8255 asserts INTR_A = 1 (PC3) requesting CPU to read data.',
      pinStatus: 'INTR_A = 1 interrupts 8086 CPU; IBF_A remains HIGH (device inhibited).'
    },
    {
      title: 'Mode 2 Receive: Step 3 - CPU Reads Data (RD# = 0)',
      rd: 0,
      stba: 1,
      ibfa: 0,
      intra: 0,
      busDir: '8255 → 8086 CPU Bus',
      desc: '8086 CPU executes IN AL, PortA (RD# = 0). INTR_A resets on RD# falling edge; IBF_A resets on RD# rising edge.',
      pinStatus: 'RD# = 0 transfers data to CPU AL; IBF_A clears to 0 (ready for next input).'
    }
  ];

  // 16 Mode 0 Configurations data
  const mode0Configs = [
    { num: 1, pa: 'Output (0)', pcu: 'Output (0)', pb: 'Output (0)', pcl: 'Output (0)', bin: '1000 0000', hex: '80H', desc: 'All ports output (Displays, LEDs, Motors)' },
    { num: 2, pa: 'Output (0)', pcu: 'Output (0)', pb: 'Output (0)', pcl: 'Input (1)', bin: '1000 0001', hex: '81H', desc: 'Port A/B/PC_up out, PC_low in' },
    { num: 3, pa: 'Output (0)', pcu: 'Output (0)', pb: 'Input (1)', pcl: 'Output (0)', bin: '1000 0010', hex: '82H', desc: 'Port A/PC out, Port B in' },
    { num: 4, pa: 'Output (0)', pcu: 'Output (0)', pb: 'Input (1)', pcl: 'Input (1)', bin: '1000 0011', hex: '83H', desc: 'Port A/PC_up out, Port B/PC_low in' },
    { num: 5, pa: 'Output (0)', pcu: 'Input (1)', pb: 'Output (0)', pcl: 'Output (0)', bin: '1000 1000', hex: '88H', desc: 'Port A/B/PC_low out, PC_up in' },
    { num: 6, pa: 'Output (0)', pcu: 'Input (1)', pb: 'Output (0)', pcl: 'Input (1)', bin: '1000 1001', hex: '89H', desc: 'Port A/B out, Port C in' },
    { num: 7, pa: 'Output (0)', pcu: 'Input (1)', pb: 'Input (1)', pcl: 'Output (0)', bin: '1000 1010', hex: '8AH', desc: 'Port A/PC_low out, Port B/PC_up in' },
    { num: 8, pa: 'Output (0)', pcu: 'Input (1)', pb: 'Input (1)', pcl: 'Input (1)', bin: '1000 1011', hex: '8BH', desc: 'Port A out, Ports B & C in' },
    { num: 9, pa: 'Input (1)', pcu: 'Output (0)', pb: 'Output (0)', pcl: 'Output (0)', bin: '1001 0000', hex: '90H', desc: 'Port A in, Ports B & C out' },
    { num: 10, pa: 'Input (1)', pcu: 'Output (0)', pb: 'Output (0)', pcl: 'Input (1)', bin: '1001 0001', hex: '91H', desc: 'Port A/PC_low in, Port B/PC_up out' },
    { num: 11, pa: 'Input (1)', pcu: 'Output (0)', pb: 'Input (1)', pcl: 'Output (0)', bin: '1001 0010', hex: '92H', desc: 'Port A/B in, Port C out' },
    { num: 12, pa: 'Input (1)', pcu: 'Output (0)', pb: 'Input (1)', pcl: 'Input (1)', bin: '1001 0011', hex: '93H', desc: 'Port A/B/PC_low in, PC_up out' },
    { num: 13, pa: 'Input (1)', pcu: 'Input (1)', pb: 'Output (0)', pcl: 'Output (0)', bin: '1001 1000', hex: '98H', desc: 'Port A/PC_up in, Port B/PC_low out' },
    { num: 14, pa: 'Input (1)', pcu: 'Input (1)', pb: 'Output (0)', pcl: 'Input (1)', bin: '1001 1001', hex: '99H', desc: 'Port A/PC in, Port B out' },
    { num: 15, pa: 'Input (1)', pcu: 'Input (1)', pb: 'Input (1)', pcl: 'Output (0)', bin: '1001 1010', hex: '9AH', desc: 'Port A/B/PC_up in, PC_low out' },
    { num: 16, pa: 'Input (1)', pcu: 'Input (1)', pb: 'Input (1)', pcl: 'Input (1)', bin: '1001 1011', hex: '9BH', desc: 'All ports input (Sensors, Switches)' }
  ];

  return (
    <div className="space-y-5 font-sans">
      {/* Sub-Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 px-1 text-[11px] font-bold text-slate-700">
          <Layers className="w-3.5 h-3.5 text-indigo-600" />
          <span>Select Mode View:</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {[
            { id: 'overview', label: 'All Modes Bento' },
            { id: 'bsr', label: 'BSR Mode (D7 = 0)' },
            { id: 'mode0', label: 'Mode 0 (Basic I/O)' },
            { id: 'mode1', label: 'Mode 1 (Handshake)' },
            { id: 'mode2', label: 'Mode 2 (Bi-directional)' },
            { id: 'table', label: 'Comparison Matrix' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedSubView(item.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedSubView === item.id
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. OVERVIEW: BENTO GRID OF ALL 8255 MODES                                */}
      {/* ========================================================================= */}
      {(selectedSubView === 'overview' || selectedSubView === 'table') && (
        <div className="space-y-4">
          {/* Top Banner: Control Word MSB (D7) Determination */}
          <div className="bg-gradient-to-br from-indigo-50/90 via-white to-blue-50/70 p-4 rounded-xl border border-indigo-200/80 shadow-2xs space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-600 text-white rounded-lg font-bold text-xs font-mono">
                D7 MSB
              </span>
              <h4 className="font-extrabold text-slate-900 text-sm">
                Primary Mode Classification via Control Word Bit 7 (D7)
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              The 8255 operates in two primary functional regimes selected by the MSB of the Control Word:
              when <strong className="text-indigo-900 font-mono">D7 = 0</strong>, the chip enters <strong className="text-indigo-900">Bit Set/Reset (BSR) Mode</strong> for Port C bit manipulation; when <strong className="text-indigo-900 font-mono">D7 = 1</strong>, the chip enters <strong className="text-indigo-900">I/O Mode</strong> (subdivided into Mode 0, Mode 1, and Mode 2).
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: BSR Mode */}
            <div 
              onClick={() => setSelectedSubView('bsr')}
              className="bg-white p-4 rounded-xl border border-amber-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer space-y-2.5 group"
            >
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                  D7 = 0 • Port C Only
                </span>
                <ArrowRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform" />
              </div>
              <h5 className="font-bold text-sm text-slate-900 group-hover:text-amber-700">
                1. BSR (Bit Set / Reset) Mode
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                Allows individual setting (<code className="text-amber-800 font-bold">1</code>) or resetting (<code className="text-amber-800 font-bold">0</code>) of any single bit in <strong>Port C (PC0–PC7)</strong> using a single control word write, leaving all other pins unaffected.
              </p>
              <div className="bg-amber-50/60 p-2.5 rounded-lg text-[11px] text-amber-950 font-medium space-y-1 border border-amber-150">
                <div>⚡ <strong>No effect on Ports A or B.</strong></div>
                <div>🎯 <strong>Used for:</strong> Stepper motor control pulses, LED toggling, generating handshake strobes.</div>
              </div>
            </div>

            {/* Card 2: Mode 0 (Basic I/O) */}
            <div 
              onClick={() => setSelectedSubView('mode0')}
              className="bg-white p-4 rounded-xl border border-emerald-200 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer space-y-2.5 group"
            >
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                  D7 = 1 • Basic Simple I/O
                </span>
                <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform" />
              </div>
              <h5 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700">
                2. Mode 0: Basic / Simple I/O
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                Standard unidirectional I/O without hardware handshaking. Ports A, B, C Upper (PC4–PC7), and C Lower (PC0–PC3) can be independently programmed as input or output.
              </p>
              <div className="bg-emerald-50/60 p-2.5 rounded-lg text-[11px] text-emerald-950 font-medium space-y-1 border border-emerald-150">
                <div>🔒 <strong>Outputs are latched;</strong> Inputs are buffered (unlatched).</div>
                <div>🧩 <strong>16 possible port combinations</strong> with 0 handshake lines needed.</div>
              </div>
            </div>

            {/* Card 3: Mode 1 (Strobed I/O) */}
            <div 
              onClick={() => setSelectedSubView('mode1')}
              className="bg-white p-4 rounded-xl border border-indigo-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer space-y-2.5 group"
            >
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-900 border border-indigo-300">
                  D7 = 1 • Handshake I/O
                </span>
                <ArrowRight className="w-4 h-4 text-indigo-500 group-hover:translate-x-1 transition-transform" />
              </div>
              <h5 className="font-bold text-sm text-slate-900 group-hover:text-indigo-700">
                3. Mode 1: Strobed / Handshake I/O
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                Synchronized 8-bit data transfers for <strong>Port A</strong> and <strong>Port B</strong> using dedicated <strong>Port C</strong> lines as hardware handshake and interrupt request signals.
              </p>
              <div className="bg-indigo-50/60 p-2.5 rounded-lg text-[11px] text-indigo-950 font-medium space-y-1 border border-indigo-150">
                <div>🔄 <strong>Input Handshake:</strong> STB#, IBF, INTR, INTE.</div>
                <div>📤 <strong>Output Handshake:</strong> OBF#, ACK#, INTR, INTE.</div>
              </div>
            </div>

            {/* Card 4: Mode 2 (Bi-directional Bus) */}
            <div 
              onClick={() => setSelectedSubView('mode2')}
              className="bg-white p-4 rounded-xl border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all cursor-pointer space-y-2.5 group"
            >
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-900 border border-purple-300">
                  D7 = 1 • Port A Only
                </span>
                <ArrowRight className="w-4 h-4 text-purple-500 group-hover:translate-x-1 transition-transform" />
              </div>
              <h5 className="font-bold text-sm text-slate-900 group-hover:text-purple-700">
                4. Mode 2: Strobed Bi-directional Bus
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                Allows <strong>Port A</strong> to function as a bidirectional 8-bit bus with 5 handshake lines supplied by <strong>Port C (PC3–PC7)</strong>.
              </p>
              <div className="bg-purple-50/60 p-2.5 rounded-lg text-[11px] text-purple-950 font-medium space-y-1 border border-purple-150">
                <div>🔁 <strong>Port A:</strong> 8-bit bidirectional data bus (both in &amp; out).</div>
                <div>📦 <strong>Port B:</strong> Remains in Mode 0 or Mode 1 with PC0–PC2.</div>
              </div>
            </div>
          </div>

          {/* Quick Comparison Summary Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                8255 Operating Modes Comparison Matrix
              </span>
              <span className="text-[10px] font-mono text-slate-500">Quick Reference Guide</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-700">
                    <th className="p-2.5">Mode</th>
                    <th className="p-2.5">Port A (8-bit)</th>
                    <th className="p-2.5">Port B (8-bit)</th>
                    <th className="p-2.5">Port C (8-bit)</th>
                    <th className="p-2.5">Handshake?</th>
                    <th className="p-2.5">Typical Applications</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className="hover:bg-amber-50/40">
                    <td className="p-2.5 font-bold text-amber-900">BSR Mode (D7 = 0)</td>
                    <td className="p-2.5 text-slate-400">Unaffected</td>
                    <td className="p-2.5 text-slate-400">Unaffected</td>
                    <td className="p-2.5 font-mono text-amber-900">Bit Set / Reset (PC0–PC7)</td>
                    <td className="p-2.5 font-semibold text-slate-500">No</td>
                    <td className="p-2.5">Stepper motor control, strobe generation, bit pulsing.</td>
                  </tr>
                  <tr className="hover:bg-emerald-50/40">
                    <td className="p-2.5 font-bold text-emerald-900">Mode 0 (D7 = 1)</td>
                    <td className="p-2.5 font-semibold text-emerald-950">Simple Input / Output</td>
                    <td className="p-2.5 font-semibold text-emerald-950">Simple Input / Output</td>
                    <td className="p-2.5 font-semibold text-emerald-950">2 × 4-bit Simple I/O (Upper &amp; Lower)</td>
                    <td className="p-2.5 font-semibold text-slate-500">No</td>
                    <td className="p-2.5">Reading switches, driving 7-segment displays, DIP switches.</td>
                  </tr>
                  <tr className="hover:bg-indigo-50/40">
                    <td className="p-2.5 font-bold text-indigo-900">Mode 1 (D7 = 1)</td>
                    <td className="p-2.5 font-semibold text-indigo-950">Strobed Input / Output</td>
                    <td className="p-2.5 font-semibold text-indigo-950">Strobed Input / Output</td>
                    <td className="p-2.5 font-mono text-indigo-900">Handshake &amp; Interrupt lines (STB#, IBF, OBF#, ACK#, INTR)</td>
                    <td className="p-2.5 font-bold text-indigo-700">Yes</td>
                    <td className="p-2.5">Centronics printer interface, ADC/DAC synchronisation, keyboard encoders.</td>
                  </tr>
                  <tr className="hover:bg-purple-50/40">
                    <td className="p-2.5 font-bold text-purple-900">Mode 2 (D7 = 1)</td>
                    <td className="p-2.5 font-black text-purple-950">Bidirectional 8-bit Bus</td>
                    <td className="p-2.5 font-semibold text-slate-700">Mode 0 or Mode 1</td>
                    <td className="p-2.5 font-mono text-purple-900">5 Handshake lines (PC3–PC7) + 3 I/O lines (PC0–PC2)</td>
                    <td className="p-2.5 font-bold text-purple-700">Yes</td>
                    <td className="p-2.5">Interfacing with external microcontrollers, shared RAM buffers, DMA master-slave.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. BSR MODE DEEP DIVE                                                     */}
      {/* ========================================================================= */}
      {selectedSubView === 'bsr' && (
        <div className="space-y-4">
          <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-200 space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-amber-600 text-white rounded-md font-bold text-xs">BSR</span>
              <h4 className="font-bold text-amber-950 text-sm">
                Bit Set / Reset (BSR) Mode Format (D7 = 0)
              </h4>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              BSR mode is used exclusively to set or reset any single bit of <strong>Port C (PC0 to PC7)</strong> without affecting any other bits in Port C or any bits in Port A or Port B.
            </p>

            {/* BSR Bit Structure Visualizer */}
            <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                BSR Control Word Bit Layout:
              </span>
              <div className="grid grid-cols-8 gap-1.5 text-center font-mono text-xs">
                <div className="bg-amber-100 p-2 rounded border border-amber-300">
                  <span className="text-[9px] text-amber-800 block">D7</span>
                  <span className="font-extrabold text-amber-950">0</span>
                  <span className="text-[8px] text-amber-700 block">BSR Flag</span>
                </div>
                <div className="bg-slate-100 p-2 rounded border border-slate-200">
                  <span className="text-[9px] text-slate-500 block">D6</span>
                  <span className="font-bold text-slate-600">X</span>
                  <span className="text-[8px] text-slate-400 block">Don't Care</span>
                </div>
                <div className="bg-slate-100 p-2 rounded border border-slate-200">
                  <span className="text-[9px] text-slate-500 block">D5</span>
                  <span className="font-bold text-slate-600">X</span>
                  <span className="text-[8px] text-slate-400 block">Don't Care</span>
                </div>
                <div className="bg-slate-100 p-2 rounded border border-slate-200">
                  <span className="text-[9px] text-slate-500 block">D4</span>
                  <span className="font-bold text-slate-600">X</span>
                  <span className="text-[8px] text-slate-400 block">Don't Care</span>
                </div>
                <div className="bg-amber-100 p-2 rounded border border-amber-300 col-span-3">
                  <span className="text-[9px] text-amber-800 block">D3 • D2 • D1</span>
                  <span className="font-extrabold text-amber-950">
                    {demoBsrBit.toString(2).padStart(3, '0')} (Bit {demoBsrBit})
                  </span>
                  <span className="text-[8px] text-amber-700 block">Bit Select (PC0–PC7)</span>
                </div>
                <div className="bg-amber-200/80 p-2 rounded border border-amber-400">
                  <span className="text-[9px] text-amber-900 block">D0</span>
                  <span className="font-black text-amber-950">{demoBsrVal}</span>
                  <span className="text-[8px] text-amber-800 block">{demoBsrVal === 1 ? '1 = SET' : '0 = RESET'}</span>
                </div>
              </div>
            </div>

            {/* Interactive BSR Bit Toggle Demo */}
            <div className="bg-white p-4 rounded-xl border border-amber-200 space-y-3">
              <span className="font-bold text-slate-900 text-xs block">
                Interactive BSR Test Console:
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-600">Select Port C Bit:</span>
                  <select
                    value={demoBsrBit}
                    onChange={(e) => setDemoBsrBit(Number(e.target.value))}
                    className="p-1 bg-slate-50 border border-slate-300 rounded font-mono font-bold text-slate-900 text-xs"
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((b) => (
                      <option key={b} value={b}>PC{b}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-600">Action:</span>
                  <button
                    onClick={() => setDemoBsrVal(1)}
                    className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer ${
                      demoBsrVal === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    SET (1)
                  </button>
                  <button
                    onClick={() => setDemoBsrVal(0)}
                    className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer ${
                      demoBsrVal === 0 ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    RESET (0)
                  </button>
                </div>

                <button
                  onClick={applyDemoBsr}
                  className="px-4 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-xs cursor-pointer shadow-2xs ml-auto"
                >
                  Apply BSR Control Word
                </button>
              </div>

              {/* Current Port C Live Status */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">
                  Resulting Port C Logic Levels (PC7 down to PC0):
                </span>
                <div className="grid grid-cols-8 gap-1 font-mono text-center">
                  {demoPortCBits.map((val, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded border text-xs font-bold transition-all ${
                        idx === demoBsrBit
                          ? 'bg-amber-100 border-amber-500 text-amber-950 scale-105 shadow-xs ring-1 ring-amber-400'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="text-[9px] text-slate-400 block">PC{idx}</span>
                      <span className="text-sm font-black">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MODE 0 DEEP DIVE                                                       */}
      {/* ========================================================================= */}
      {selectedSubView === 'mode0' && (
        <div className="space-y-4">
          <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-emerald-600 text-white rounded-md font-bold text-xs">Mode 0</span>
                <h4 className="font-bold text-emerald-950 text-sm">
                  Mode 0: Basic / Simple Input / Output (Unstrobed)
                </h4>
              </div>

              <button
                onClick={() => setShowConfigTable(!showConfigTable)}
                className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
              >
                <FileText className="w-3.5 h-3.5" />
                {showConfigTable ? 'Hide 16 Configurations Table' : 'View All 16 Possible Configurations'}
              </button>
            </div>

            <p className="text-xs text-emerald-900 leading-relaxed">
              Mode 0 provides simple input and output operations for each of the three ports without handshaking signals. Data is simply written to or read from the specified port.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-emerald-150 space-y-2">
                <h5 className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Key Mode 0 Characteristics:
                </h5>
                <ul className="list-disc pl-4 text-xs text-slate-600 space-y-1 leading-relaxed">
                  <li><strong>Outputs are Latched:</strong> Data written by the CPU is held in output latches until rewritten.</li>
                  <li><strong>Inputs are Buffered:</strong> Data from external devices is buffered but NOT latched (CPU reads real-time pin state).</li>
                  <li><strong>Independent Programming:</strong> Port A (8-bit), Port B (8-bit), Port C Upper (4-bit), and Port C Lower (4-bit) can be configured independently as Input or Output.</li>
                  <li><strong>16 Possible Configurations:</strong> Any combination of input and output ports is allowed ($2^4 = 16$).</li>
                </ul>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-emerald-150 space-y-2">
                <h5 className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  Typical Mode 0 Hardware Interfacing:
                </h5>
                <ul className="list-disc pl-4 text-xs text-slate-600 space-y-1 leading-relaxed">
                  <li>Reading simple DIP switches, push-button matrices, or status sensors.</li>
                  <li>Driving status LEDs, bar-graph indicators, or relays.</li>
                  <li>Interfacing with 7-segment LED displays via BCD or hex decoders.</li>
                  <li>Outputting fixed control signals to peripheral chips.</li>
                </ul>
              </div>
            </div>

            {/* Key Difference: Buffered vs Latched Comparison Table */}
            <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-1.5">
                <h5 className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-emerald-600" />
                  Key Difference: Buffered (Inputs) vs. Latched (Outputs)
                </h5>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                  Mode 0 Architecture Insight
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700">
                      <th className="p-2 border-r border-slate-200 w-1/4">Parameter / Feature</th>
                      <th className="p-2 border-r border-slate-200 w-3/8 text-blue-900 bg-blue-50/50">
                        Buffered (Mode 0 Inputs)
                      </th>
                      <th className="p-2 w-3/8 text-emerald-900 bg-emerald-50/50">
                        Latched (Mode 0 Outputs)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    <tr className="hover:bg-slate-50/60">
                      <td className="p-2 font-bold text-slate-800 border-r border-slate-200">
                        Data Storage / Memory
                      </td>
                      <td className="p-2 font-medium text-slate-700 border-r border-slate-200">
                        ❌ <strong>No storage.</strong> Real-time pass-through.
                      </td>
                      <td className="p-2 font-medium text-emerald-950">
                        ✅ <strong>Yes.</strong> Retains and freezes data.
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/60">
                      <td className="p-2 font-bold text-slate-800 border-r border-slate-200">
                        Output Behavior When Input Changes
                      </td>
                      <td className="p-2 font-medium text-slate-700 border-r border-slate-200">
                        Output changes immediately with input.
                      </td>
                      <td className="p-2 font-medium text-emerald-950">
                        Output stays fixed until a new latch strobe arrives.
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/60">
                      <td className="p-2 font-bold text-slate-800 border-r border-slate-200">
                        Trigger / Strobe
                      </td>
                      <td className="p-2 font-medium text-slate-700 border-r border-slate-200">
                        Enabled by Read Strobe (<code className="bg-slate-100 px-1 py-0.5 rounded text-blue-800 font-mono text-[10px]">RD#=0</code>)
                      </td>
                      <td className="p-2 font-medium text-emerald-950">
                        Clocked by Write Strobe (<code className="bg-emerald-100 px-1 py-0.5 rounded text-emerald-900 font-mono text-[10px]">WR#=0</code>)
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/60">
                      <td className="p-2 font-bold text-slate-800 border-r border-slate-200">
                        Purpose in 8255
                      </td>
                      <td className="p-2 font-medium text-slate-700 border-r border-slate-200">
                        Allows CPU to sample live real-time external switch/sensor state.
                      </td>
                      <td className="p-2 font-medium text-emerald-950">
                        Maintains continuous voltage levels to keep LEDs/displays on after CPU moves on.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Expandable 16 Configurations Table */}
            {showConfigTable && (
              <div className="bg-white p-3.5 rounded-xl border border-emerald-300 shadow-sm space-y-2">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-1.5">
                  <h5 className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    Complete List of All 16 Mode 0 Configurations (2⁴ Combinations)
                  </h5>
                  <span className="text-[10px] font-mono text-slate-500 font-semibold">
                    D7=1 (I/O), D6=0, D5=0 (Mode 0), D2=0 (Mode 0)
                  </span>
                </div>

                <div className="overflow-x-auto max-h-72">
                  <table className="w-full text-left text-xs border-collapse font-mono">
                    <thead className="sticky top-0 bg-slate-100 border-b border-slate-300 text-[11px] font-bold text-slate-700">
                      <tr>
                        <th className="p-1.5">#</th>
                        <th className="p-1.5">Port A (D4)</th>
                        <th className="p-1.5">Port C Upper (D3)</th>
                        <th className="p-1.5">Port B (D1)</th>
                        <th className="p-1.5">Port C Lower (D0)</th>
                        <th className="p-1.5">Binary Word</th>
                        <th className="p-1.5">Hex Code</th>
                        <th className="p-1.5 font-sans">Typical Application</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {mode0Configs.map((cfg) => (
                        <tr key={cfg.num} className="hover:bg-emerald-50/50">
                          <td className="p-1.5 font-bold text-slate-800">{cfg.num}</td>
                          <td className={`p-1.5 ${cfg.pa.includes('Input') ? 'text-blue-700 font-bold' : 'text-emerald-700'}`}>{cfg.pa}</td>
                          <td className={`p-1.5 ${cfg.pcu.includes('Input') ? 'text-blue-700 font-bold' : 'text-emerald-700'}`}>{cfg.pcu}</td>
                          <td className={`p-1.5 ${cfg.pb.includes('Input') ? 'text-blue-700 font-bold' : 'text-emerald-700'}`}>{cfg.pb}</td>
                          <td className={`p-1.5 ${cfg.pcl.includes('Input') ? 'text-blue-700 font-bold' : 'text-emerald-700'}`}>{cfg.pcl}</td>
                          <td className="p-1.5 font-bold text-indigo-900">{cfg.bin}</td>
                          <td className="p-1.5 font-extrabold text-amber-900 bg-amber-50 rounded">{cfg.hex}</td>
                          <td className="p-1.5 font-sans text-slate-600 text-[10.5px]">{cfg.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODE 1 DEEP DIVE & WORKING DEMONSTRATION                               */}
      {/* ========================================================================= */}
      {selectedSubView === 'mode1' && (
        <div className="space-y-4">
          <div className="bg-indigo-50/80 p-4 rounded-xl border border-indigo-200 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-indigo-600 text-white rounded-md font-bold text-xs">Mode 1 Demo</span>
                <h4 className="font-bold text-indigo-950 text-sm">
                  Mode 1: Strobed / Handshake Input &amp; Output Working Demonstration
                </h4>
              </div>

              {/* Toggle Input / Output Handshaking */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-indigo-200">
                <button
                  onClick={() => { setMode1Type('input'); setMode1Step(0); }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    mode1Type === 'input' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  Strobed Input Handshake (e.g. Keyboard/ADC)
                </button>
                <button
                  onClick={() => { setMode1Type('output'); setMode1Step(0); }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    mode1Type === 'output' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Strobed Output Handshake (e.g. Printer/DAC)
                </button>
              </div>
            </div>

            <p className="text-xs text-indigo-900 leading-relaxed">
              Mode 1 synchronizes data transfers between the high-speed 8086 CPU and asynchronous external peripherals using dedicated hardware control lines from Port C.
            </p>

            {/* Handshake Stepper Interactive Player */}
            {(() => {
              const steps = mode1Type === 'input' ? mode1InputSteps : mode1OutputSteps;
              const curStep = steps[mode1Step];

              return (
                <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-sm space-y-4">
                  {/* Stepper Header & Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        Handshake Protocol Step {mode1Step + 1} of {steps.length}
                      </span>
                      <h5 className="font-extrabold text-slate-900 text-sm mt-1">
                        {curStep.title}
                      </h5>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setMode1Step(Math.max(0, mode1Step - 1))}
                        disabled={mode1Step === 0}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold disabled:opacity-40 cursor-pointer flex items-center gap-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Prev
                      </button>
                      
                      <button
                        onClick={() => setMode1Step(0)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                        title="Reset Sequence"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setMode1Step((mode1Step + 1) % steps.length)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 shadow-xs"
                      >
                        {mode1Step === steps.length - 1 ? 'Restart Cycle ↻' : 'Next Step →'}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Visual Handshake Timing & Architecture Diagram */}
                  <div className="bg-slate-50 p-3.5 rounded-xl text-slate-800 font-mono text-xs overflow-x-auto border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-[11px] text-slate-500">
                      <span className="font-bold">HARDWARE SIGNAL FLOW DIAGRAM (MODE 1 {mode1Type.toUpperCase()})</span>
                      <span className="text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">{curStep.hardwareState}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 text-center font-sans">
                      {/* Left: 8086 CPU */}
                      <div className="p-3 bg-white rounded-lg border border-blue-200 space-y-2 shadow-2xs">
                        <span className="text-[10px] font-bold text-blue-700 uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-200">8086 CPU</span>
                        <div className="text-xs text-slate-700 font-sans leading-relaxed">
                          {curStep.cpuAction}
                        </div>
                        <div className="flex justify-around text-[10px] font-mono pt-1 text-slate-500 border-t border-slate-100">
                          {mode1Type === 'input' ? (
                            <span className={curStep.rd === 0 ? 'text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200' : 'text-slate-500'}>
                              RD# = {curStep.rd}
                            </span>
                          ) : (
                            <span className={curStep.wr === 0 ? 'text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200' : 'text-slate-500'}>
                              WR# = {curStep.wr}
                            </span>
                          )}
                          <span className={curStep.intr === 1 ? 'text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 animate-pulse' : 'text-slate-500'}>
                            INTR = {curStep.intr}
                          </span>
                        </div>
                      </div>

                      {/* Middle: 8255 PPI Controller */}
                      <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-200 space-y-2 shadow-2xs">
                        <span className="text-[10px] font-bold text-indigo-800 uppercase bg-indigo-100/70 px-2 py-0.5 rounded border border-indigo-300">8255 PPI (Port A + Port C)</span>
                        <div className="text-xs text-indigo-950 font-sans leading-relaxed">
                          {curStep.ppiAction}
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-[10px] font-mono pt-1 border-t border-indigo-150">
                          {mode1Type === 'input' ? (
                            <>
                              <span className={curStep.stb === 0 ? 'text-amber-800 font-bold bg-amber-100/80 px-1 py-0.5 rounded border border-amber-300' : 'text-slate-500'}>
                                STB#={curStep.stb}
                              </span>
                              <span className={curStep.ibf === 1 ? 'text-cyan-800 font-bold bg-cyan-100/80 px-1 py-0.5 rounded border border-cyan-300' : 'text-slate-500'}>
                                IBF={curStep.ibf}
                              </span>
                              <span className={curStep.intr === 1 ? 'text-rose-800 font-bold bg-rose-100/80 px-1 py-0.5 rounded border border-rose-300' : 'text-slate-500'}>
                                INTR={curStep.intr}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className={curStep.obf === 0 ? 'text-cyan-800 font-bold bg-cyan-100/80 px-1 py-0.5 rounded border border-cyan-300' : 'text-slate-500'}>
                                OBF#={curStep.obf}
                              </span>
                              <span className={curStep.ack === 0 ? 'text-amber-800 font-bold bg-amber-100/80 px-1 py-0.5 rounded border border-amber-300' : 'text-slate-500'}>
                                ACK#={curStep.ack}
                              </span>
                              <span className={curStep.intr === 1 ? 'text-rose-800 font-bold bg-rose-100/80 px-1 py-0.5 rounded border border-rose-300' : 'text-slate-500'}>
                                INTR={curStep.intr}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right: External Peripheral */}
                      <div className="p-3 bg-white rounded-lg border border-emerald-200 space-y-2 shadow-2xs">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {mode1Type === 'input' ? 'External Input Device (ADC/KB)' : 'External Output Device (Printer)'}
                        </span>
                        <div className="text-xs text-slate-700 font-sans leading-relaxed">
                          {curStep.periphAction}
                        </div>
                        <div className="flex justify-around text-[10px] font-mono pt-1 text-slate-500 border-t border-slate-100">
                          {mode1Type === 'input' ? (
                            <span className={curStep.stb === 0 ? 'text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200' : 'text-slate-500'}>
                              STB# (PC4) = {curStep.stb}
                            </span>
                          ) : (
                            <span className={curStep.ack === 0 ? 'text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200' : 'text-slate-500'}>
                              ACK# (PC6) = {curStep.ack}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pin Signal Assignment Reference Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {mode1Type === 'input' ? (
                      <>
                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                          <strong className="text-indigo-900 block font-mono">PC4: STB_A#</strong>
                          <span className="text-[11px] text-slate-600">Strobe input from device to latch data</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                          <strong className="text-indigo-900 block font-mono">PC5: IBF_A</strong>
                          <span className="text-[11px] text-slate-600">Input buffer full output from 8255</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                          <strong className="text-indigo-900 block font-mono">PC3: INTR_A</strong>
                          <span className="text-[11px] text-slate-600">Interrupt request output to 8086 CPU</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                          <strong className="text-indigo-900 block font-mono">PC4 BSR: INTE_A</strong>
                          <span className="text-[11px] text-slate-600">Internal flip-flop to mask/unmask INTR</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                          <strong className="text-indigo-900 block font-mono">PC7: OBF_A#</strong>
                          <span className="text-[11px] text-slate-600">Output buffer full strobe to peripheral</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                          <strong className="text-indigo-900 block font-mono">PC6: ACK_A#</strong>
                          <span className="text-[11px] text-slate-600">Acknowledge input from peripheral</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                          <strong className="text-indigo-900 block font-mono">PC3: INTR_A</strong>
                          <span className="text-[11px] text-slate-600">Interrupt request output to 8086 CPU</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                          <strong className="text-indigo-900 block font-mono">PC6 BSR: INTE_A</strong>
                          <span className="text-[11px] text-slate-600">Internal flip-flop to mask/unmask INTR</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Integrated Digital Oscilloscope / Timing Waveform Analyzer */}
            <div className="pt-2">
              <PPI8255Mode1Waveforms 
                initialType={mode1Type} 
                currentStep={mode1Step} 
                onStepChange={(st) => setMode1Step(st)} 
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODE 2 DEEP DIVE & WORKING DEMONSTRATION                               */}
      {/* ========================================================================= */}
      {selectedSubView === 'mode2' && (
        <div className="space-y-4">
          <div className="bg-purple-50/80 p-4 rounded-xl border border-purple-200 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-purple-600 text-white rounded-md font-bold text-xs">Mode 2 Demo</span>
                <h4 className="font-bold text-purple-950 text-sm">
                  Mode 2: Strobed Bi-directional Bus I/O Working Demonstration (Port A Only)
                </h4>
              </div>

              {/* Mode 2 Direction Selection */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-purple-200">
                <button
                  onClick={() => { setMode2Dir('tx'); setMode2Step(0); }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    mode2Dir === 'tx' ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Transmit (CPU &rarr; Device)
                </button>
                <button
                  onClick={() => { setMode2Dir('rx'); setMode2Step(0); }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    mode2Dir === 'rx' ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  Receive (Device &rarr; CPU)
                </button>
              </div>
            </div>

            <p className="text-xs text-purple-900 leading-relaxed">
              Mode 2 transforms <strong>Port A (PA0–PA7)</strong> into an 8-bit bidirectional data bus capable of both input and output operations with full hardware handshaking using 5 Port C lines (<strong>PC3–PC7</strong>).
            </p>

            {/* Interactive Mode 2 Workflow Demonstration */}
            {(() => {
              const steps = mode2Dir === 'tx' ? mode2TxSteps : mode2RxSteps;
              const curStep = steps[mode2Step];

              return (
                <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-sm space-y-4">
                  {/* Step Control Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-100 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        {mode2Dir === 'tx' ? 'TRANSMIT' : 'RECEIVE'} SEQUENCE: STEP {mode2Step + 1} OF {steps.length}
                      </span>
                      <h5 className="font-extrabold text-slate-900 text-sm mt-1">
                        {curStep.title}
                      </h5>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setMode2Step(Math.max(0, mode2Step - 1))}
                        disabled={mode2Step === 0}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold disabled:opacity-40 cursor-pointer flex items-center gap-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Prev
                      </button>
                      
                      <button
                        onClick={() => setMode2Step(0)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                        title="Reset Sequence"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setMode2Step((mode2Step + 1) % steps.length)}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 shadow-xs"
                      >
                        {mode2Step === steps.length - 1 ? 'Restart Cycle ↻' : 'Next Step →'}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Mode 2 Architecture Diagram & Active Signals */}
                  <div className="bg-purple-50/60 p-4 rounded-xl text-slate-900 font-mono text-xs space-y-3 border border-purple-200 shadow-2xs">
                    <div className="flex items-center justify-between text-[11px] border-b border-purple-200 pb-2">
                      <span className="text-purple-800 font-bold">PORT A BIDIRECTIONAL BUS STATE: {curStep.busDir}</span>
                      <span className="text-slate-600 bg-white px-2 py-0.5 rounded border border-purple-200">PINS: PA0–PA7 (Pins 4–1, 40–37)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-sans">
                      <div className="p-3 bg-white rounded-lg border border-purple-200 space-y-1.5 shadow-2xs">
                        <span className="text-[10px] font-bold text-purple-700 uppercase bg-purple-50 px-2 py-0.5 rounded border border-purple-200">Operational Detail:</span>
                        <p className="text-purple-950 text-xs leading-relaxed">{curStep.desc}</p>
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5 shadow-2xs">
                        <span className="text-[10px] font-bold text-amber-800 uppercase bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Handshake Pin Status:</span>
                        <p className="text-slate-700 text-xs leading-relaxed">{curStep.pinStatus}</p>
                      </div>
                    </div>

                    {/* Mode 2 5-Handshake Pins Monitor */}
                    <div className="pt-2 border-t border-purple-200">
                      <span className="text-[10px] font-bold text-slate-700 uppercase block mb-1.5">
                        Active Port C Handshake Pins (PC7 &rarr; PC3):
                      </span>
                      <div className="grid grid-cols-5 gap-1.5 text-center font-mono text-[11px]">
                        <div className={`p-1.5 rounded border ${mode2Dir === 'tx' && curStep.obfa === 0 ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold shadow-2xs' : 'bg-white border-slate-200 text-slate-400'}`}>
                          <div className="text-[9px] text-slate-500">PC7</div>
                          <div className="font-bold">OBF_A#</div>
                        </div>
                        <div className={`p-1.5 rounded border ${mode2Dir === 'tx' && curStep.acka === 0 ? 'bg-cyan-100 border-cyan-400 text-cyan-900 font-bold shadow-2xs' : 'bg-white border-slate-200 text-slate-400'}`}>
                          <div className="text-[9px] text-slate-500">PC6</div>
                          <div className="font-bold">ACK_A#</div>
                        </div>
                        <div className={`p-1.5 rounded border ${mode2Dir === 'rx' && curStep.ibfa === 1 ? 'bg-cyan-100 border-cyan-400 text-cyan-900 font-bold shadow-2xs' : 'bg-white border-slate-200 text-slate-400'}`}>
                          <div className="text-[9px] text-slate-500">PC5</div>
                          <div className="font-bold">IBF_A</div>
                        </div>
                        <div className={`p-1.5 rounded border ${mode2Dir === 'rx' && curStep.stba === 0 ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold shadow-2xs' : 'bg-white border-slate-200 text-slate-400'}`}>
                          <div className="text-[9px] text-slate-500">PC4</div>
                          <div className="font-bold">STB_A#</div>
                        </div>
                        <div className={`p-1.5 rounded border ${curStep.intra === 1 ? 'bg-rose-100 border-rose-400 text-rose-900 font-bold shadow-2xs animate-pulse' : 'bg-white border-slate-200 text-slate-400'}`}>
                          <div className="text-[9px] text-slate-500">PC3</div>
                          <div className="font-bold">INTR_A</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mode 2 Architecture Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-150 space-y-1">
                      <h6 className="font-bold text-xs text-purple-950">How Bus Contention is Prevented:</h6>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Port A output drivers are strictly tri-stated (High-Z) until the external device explicitly pulls <code className="font-mono text-purple-900 font-bold">ACK_A# = 0</code>. This prevents electrical shorts with external drivers.
                      </p>
                    </div>

                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-150 space-y-1">
                      <h6 className="font-bold text-xs text-purple-950">Port B Independence in Mode 2:</h6>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        While Port A is in Mode 2, <strong>Port B</strong> is completely free to operate in <strong>Mode 0</strong> (using PC0–PC2 as general I/O) or <strong>Mode 1</strong> (using PC0–PC2 for Group B handshaking).
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
