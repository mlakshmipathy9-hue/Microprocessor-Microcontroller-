import React, { useState } from "react";
import {
  Cpu,
  Layers,
  Zap,
  Binary,
  Sliders
} from "lucide-react";

interface PinData {
  num: number;
  minName: string;
  maxName: string;
  category: "address-data" | "control" | "status" | "system" | "power";
  direction: "Input" | "Output" | "Bi-directional" | "Power";
  desc: string;
  minDetail: string;
  maxDetail: string;
}

export function ActiveLow({ children }: { children: React.ReactNode; key?: React.Key }) {
  return (
    <span className="relative inline-block pt-[2px] leading-none">
      <span className="absolute top-[0px] left-0 right-0 h-[1.5px] bg-current rounded-xs" />
      {children}
    </span>
  );
}

export function PinLabel({ name }: { name: string }) {
  switch (name) {
    case "TEST#":
      return <ActiveLow>TEST</ActiveLow>;
    case "INTA#":
      return <ActiveLow>INTA</ActiveLow>;
    case "DEN#":
      return <ActiveLow>DEN</ActiveLow>;
    case "WR#":
      return <ActiveLow>WR</ActiveLow>;
    case "RD#":
      return <ActiveLow>RD</ActiveLow>;
    case "LOCK#":
      return <ActiveLow>LOCK</ActiveLow>;
    case "S0#":
      return <span><ActiveLow>S</ActiveLow><sub>0</sub></span>;
    case "S1#":
      return <span><ActiveLow>S</ActiveLow><sub>1</sub></span>;
    case "S2#":
      return <span><ActiveLow>S</ActiveLow><sub>2</sub></span>;
    case "BHE#/S7":
      return <span><ActiveLow>BHE</ActiveLow> / S<sub>7</sub></span>;
    case "DT/R#":
      return <span>DT / <ActiveLow>R</ActiveLow></span>;
    case "M/IO#":
      return <span>M / <ActiveLow>IO</ActiveLow></span>;
    case "MN/MX#":
      return <span>MN / <ActiveLow>MX</ActiveLow></span>;
    case "RQ#/GT0#":
      return <span><ActiveLow>RQ</ActiveLow> / <ActiveLow>GT</ActiveLow><sub>0</sub></span>;
    case "RQ#/GT1#":
      return <span><ActiveLow>RQ</ActiveLow> / <ActiveLow>GT</ActiveLow><sub>1</sub></span>;
    case "A19/S6":
      return <span>A<sub>19</sub> / S<sub>6</sub></span>;
    case "A18/S5":
      return <span>A<sub>18</sub> / S<sub>5</sub></span>;
    case "A17/S4":
      return <span>A<sub>17</sub> / S<sub>4</sub></span>;
    case "A16/S3":
      return <span>A<sub>16</sub> / S<sub>3</sub></span>;
    default:
      return <span>{name}</span>;
  }
}

export function FormattedSignalText({ text }: { text: string }) {
  if (!text) return null;

  const regex = /(BHE#\/S7|BHE#|RD#|WR#|DEN#|INTA#|TEST#|LOCK#|MN\/MX#|DT\/R#|M\/IO#|S0#–S2#|S0#|S1#|S2#|RQ#\/GT0#|RQ#\/GT1#|RQ#|GT0#|GT1#|TEST̄|RD̄|MN\/MX̄|BHĒ)/g;

  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) => {
        switch (part) {
          case "BHE#":
          case "BHĒ":
            return <ActiveLow key={index}>BHE</ActiveLow>;
          case "RD#":
          case "RD̄":
            return <ActiveLow key={index}>RD</ActiveLow>;
          case "WR#":
            return <ActiveLow key={index}>WR</ActiveLow>;
          case "DEN#":
            return <ActiveLow key={index}>DEN</ActiveLow>;
          case "INTA#":
            return <ActiveLow key={index}>INTA</ActiveLow>;
          case "TEST#":
          case "TEST̄":
            return <ActiveLow key={index}>TEST</ActiveLow>;
          case "LOCK#":
            return <ActiveLow key={index}>LOCK</ActiveLow>;
          case "MN/MX#":
          case "MN/MX̄":
            return <span key={index}>MN/<ActiveLow>MX</ActiveLow></span>;
          case "DT/R#":
            return <span key={index}>DT/<ActiveLow>R</ActiveLow></span>;
          case "M/IO#":
            return <span key={index}>M/<ActiveLow>IO</ActiveLow></span>;
          case "S0#":
            return <span key={index}><ActiveLow>S</ActiveLow><sub>0</sub></span>;
          case "S1#":
            return <span key={index}><ActiveLow>S</ActiveLow><sub>1</sub></span>;
          case "S2#":
            return <span key={index}><ActiveLow>S</ActiveLow><sub>2</sub></span>;
          case "S0#–S2#":
            return <span key={index}><ActiveLow>S</ActiveLow><sub>0</sub>–<ActiveLow>S</ActiveLow><sub>2</sub></span>;
          case "BHE#/S7":
            return <span key={index}><ActiveLow>BHE</ActiveLow>/S<sub>7</sub></span>;
          case "RQ#":
            return <ActiveLow key={index}>RQ</ActiveLow>;
          case "GT0#":
            return <span key={index}><ActiveLow>GT</ActiveLow><sub>0</sub></span>;
          case "GT1#":
            return <span key={index}><ActiveLow>GT</ActiveLow><sub>1</sub></span>;
          case "RQ#/GT0#":
            return <span key={index}><ActiveLow>RQ</ActiveLow>/<ActiveLow>GT</ActiveLow><sub>0</sub></span>;
          case "RQ#/GT1#":
            return <span key={index}><ActiveLow>RQ</ActiveLow>/<ActiveLow>GT</ActiveLow><sub>1</sub></span>;
          default:
            return part;
        }
      })}
    </span>
  );
}

const PIN_LIST: PinData[] = [
  { num: 1, minName: "GND", maxName: "GND", category: "power", direction: "Power", desc: "Ground connection (0V reference).", minDetail: "Ground connection to common power supply line.", maxDetail: "Ground connection to common power supply line." },
  { num: 2, minName: "AD14", maxName: "AD14", category: "address-data", direction: "Bi-directional", desc: "Address/Data Line 14 (Multiplexed).", minDetail: "T1: Output Address bit A14. T2-T4: Data bit D14.", maxDetail: "T1: Output Address bit A14. T2-T4: Data bit D14." },
  { num: 3, minName: "AD13", maxName: "AD13", category: "address-data", direction: "Bi-directional", desc: "Address/Data Line 13 (Multiplexed).", minDetail: "T1: Output Address bit A13. T2-T4: Data bit D13.", maxDetail: "T1: Output Address bit A13. T2-T4: Data bit D13." },
  { num: 4, minName: "AD12", maxName: "AD12", category: "address-data", direction: "Bi-directional", desc: "Address/Data Line 12 (Multiplexed).", minDetail: "T1: Output Address bit A12. T2-T4: Data bit D12.", maxDetail: "T1: Output Address bit A12. T2-T4: Data bit D12." },
  { num: 5, minName: "AD11", maxName: "AD11", category: "address-data", direction: "Bi-directional", desc: "Address/Data Line 11 (Multiplexed).", minDetail: "T1: Output Address bit A11. T2-T4: Data bit D11.", maxDetail: "T1: Output Address bit A11. T2-T4: Data bit D11." },
  { num: 6, minName: "AD10", maxName: "AD10", category: "address-data", direction: "Bi-directional", desc: "Address/Data Line 10 (Multiplexed).", minDetail: "T1: Output Address bit A10. T2-T4: Data bit D10.", maxDetail: "T1: Output Address bit A10. T2-T4: Data bit D10." },
  { num: 7, minName: "AD9", maxName: "AD9", category: "address-data", direction: "Bi-directional", desc: "Address/Data Line 9 (Multiplexed).", minDetail: "T1: Output Address bit A9. T2-T4: Data bit D9.", maxDetail: "T1: Output Address bit A9. T2-T4: Data bit D9." },
  { num: 8, minName: "AD8", maxName: "AD8", category: "address-data", direction: "Bi-directional", desc: "Address/Data Line 8 (Multiplexed).", minDetail: "T1: Output Address bit A8. T2-T4: Data bit D8.", maxDetail: "T1: Output Address bit A8. T2-T4: Data bit D8." },
  { num: 9, minName: "AD7", maxName: "AD7", category: "address-data", direction: "Bi-directional", desc: "Address/Data Line 7 (Multiplexed).", minDetail: "T1: Output Address bit A7. T2-T4: Data bit D7.", maxDetail: "T1: Output Address bit A7. T2-T4: Data bit D7." },
  { num: 10, minName: "AD6", maxName: "AD6", category: "address-data", direction: "Bi-directional", desc: "Address/Data Line 6 (Multiplexed).", minDetail: "T1: Output Address bit A6. T2-T4: Data bit D6.", maxDetail: "T1: Output Address bit A6. T2-T4: Data bit D6." },
  { num: 11, minName: "AD5", maxName: "AD5", category: "address-data", direction: "Bi-directional", desc: "Address/Data Line 5 (Multiplexed).", minDetail: "T1: Output Address bit A5. T2-T4: Data bit D5.", maxDetail: "T1: Output Address bit A5. T2-T4: Data bit D5." },
  { num: 12, minName: "AD4", maxName: "AD4", category: "address-data", direction: "Bi-directional", desc: "Address/Data Line 4 (Multiplexed).", minDetail: "T1: Output Address bit A4. T2-T4: Data bit D4.", maxDetail: "T1: Output Address bit A4. T2-T4: Data bit D4." },
  { num: 13, minName: "AD3", maxName: "AD3", category: "address-data", direction: "Bi-directional", desc: "Address/Data Line 3 (Multiplexed).", minDetail: "T1: Output Address bit A3. T2-T4: Data bit D3.", maxDetail: "T1: Output Address bit A3. T2-T4: Data bit D3." },
  { num: 14, minName: "AD2", maxName: "AD2", category: "address-data", direction: "Bi-directional", desc: "Address/Data Line 2 (Multiplexed).", minDetail: "T1: Output Address bit A2. T2-T4: Data bit D2.", maxDetail: "T1: Output Address bit A2. T2-T4: Data bit D2." },
  { num: 15, minName: "AD1", maxName: "AD1", category: "address-data", direction: "Bi-directional", desc: "Address/Data Line 1 (Multiplexed).", minDetail: "T1: Output Address bit A1. T2-T4: Data bit D1.", maxDetail: "T1: Output Address bit A1. T2-T4: Data bit D1." },
  { num: 16, minName: "AD0", maxName: "AD0", category: "address-data", direction: "Bi-directional", desc: "Address/Data Line 0 (Multiplexed).", minDetail: "T1: Output Address bit A0. T2-T4: Data bit D0.", maxDetail: "T1: Output Address bit A0. T2-T4: Data bit D0." },
  { num: 17, minName: "NMI", maxName: "NMI", category: "system", direction: "Input", desc: "Non-Maskable Interrupt request.", minDetail: "Edge-triggered interrupt. Vector 2.", maxDetail: "Edge-triggered interrupt. Vector 2." },
  { num: 18, minName: "INTR", maxName: "INTR", category: "system", direction: "Input", desc: "Maskable Interrupt Request.", minDetail: "Level-triggered interrupt input.", maxDetail: "Level-triggered interrupt input." },
  { num: 19, minName: "CLK", maxName: "CLK", category: "power", direction: "Input", desc: "System Clock input (33% duty cycle).", minDetail: "Provided by 8284 Clock Generator.", maxDetail: "Provided by 8284 Clock Generator." },
  { num: 20, minName: "GND", maxName: "GND", category: "power", direction: "Power", desc: "Ground connection (0V reference).", minDetail: "Second ground pin.", maxDetail: "Second ground pin." },
  { num: 21, minName: "RESET", maxName: "RESET", category: "system", direction: "Input", desc: "System Reset signal.", minDetail: "Sets CS=FFFFh, IP=0000h.", maxDetail: "Sets CS=FFFFh, IP=0000h." },
  { num: 22, minName: "READY", maxName: "READY", category: "system", direction: "Input", desc: "Bus Ready acknowledge signal.", minDetail: "Inserts wait states (TW).", maxDetail: "Inserts wait states (TW)." },
  { num: 23, minName: "TEST#", maxName: "TEST#", category: "system", direction: "Input", desc: "Test input sampled by WAIT instruction. Active-LOW (TEST̄).", minDetail: "Sampled by WAIT instruction. If LOW (0V), execution continues; if HIGH (+5V), CPU remains in idle wait states until TEST# goes LOW. Synchronizes with 8087 NDP.", maxDetail: "Sampled by WAIT instruction to synchronize with 8087 math coprocessor." },
  { num: 24, minName: "INTA#", maxName: "QS1", category: "status", direction: "Output", desc: "Min: Interrupt Acknowledge (INTA#) | Max: Queue Status 1 (QS1)", minDetail: "MIN: Active-low interrupt acknowledge strobe sent to 8259A PIC.", maxDetail: "MAX: Instruction queue status bit 1." },
  { num: 25, minName: "ALE", maxName: "QS0", category: "control", direction: "Output", desc: "Min: Address Latch Enable (ALE) | Max: Queue Status 0 (QS0)", minDetail: "MIN: Active-high pulse in T1 state to latch multiplexed address bits A0-A15.", maxDetail: "MAX: Instruction queue status bit 0." },
  { num: 26, minName: "DEN#", maxName: "S0#", category: "control", direction: "Output", desc: "Min: Data Enable (DEN#) | Max: Status Line 0 (S0#)", minDetail: "MIN: Active-low strobe enabling 8286 transceiver outputs.", maxDetail: "MAX: Active-low status output line 0 sent to 8288 Bus Controller." },
  { num: 27, minName: "DT/R#", maxName: "S1#", category: "control", direction: "Output", desc: "Min: Data Transmit/Receive# (DT/R#) | Max: Status Line 1 (S1#)", minDetail: "MIN: Transceiver direction control. HIGH (+5V) = Transmit (Write); LOW (0V) = Receive (Read).", maxDetail: "MAX: Active-low status output line 1 sent to 8288 Bus Controller." },
  { num: 28, minName: "M/IO#", maxName: "S2#", category: "control", direction: "Output", desc: "Min: Memory / I/O Select (M/IO#) | Max: Status Line 2 (S2#)", minDetail: "MIN: Selects memory vs I/O. HIGH (+5V) = 1 MB Memory; LOW (0V) = 64 KB I/O.", maxDetail: "MAX: Active-low status output line 2 sent to 8288 Bus Controller." },
  { num: 29, minName: "WR#", maxName: "LOCK#", category: "control", direction: "Output", desc: "Min: Write Strobe (WR#) | Max: Bus Lock Output (LOCK#)", minDetail: "MIN: Active-low write strobe signaling valid data on data bus.", maxDetail: "MAX: Active-low bus lock prefix output preventing other bus masters from gaining bus control." },
  { num: 30, minName: "HLDA", maxName: "RQ#/GT1#", category: "control", direction: "Output", desc: "Min: Hold Acknowledge (HLDA) | Max: Request/Grant 1 (RQ#/GT1#)", minDetail: "MIN: Active-high output indicating CPU has relinquished bus in response to HOLD.", maxDetail: "MAX: Bidirectional active-low request/grant line 1 for co-processor bus arbitration." },
  { num: 31, minName: "HOLD", maxName: "RQ#/GT0#", category: "control", direction: "Input", desc: "Min: Hold Request (HOLD) | Max: Request/Grant 0 (RQ#/GT0#)", minDetail: "MIN: Active-high input from DMA controller requesting CPU to release bus.", maxDetail: "MAX: Bidirectional active-low request/grant line 0 (higher priority) for co-processor bus arbitration." },
  { num: 32, minName: "RD#", maxName: "RD#", category: "control", direction: "Output", desc: "Read Strobe signal. Active-LOW (RD̄).", minDetail: "Active-low read strobe indicating CPU is reading data from memory or I/O port.", maxDetail: "Active-low read strobe indicating CPU is reading data from memory or I/O port." },
  { num: 33, minName: "MN/MX#", maxName: "MN/MX#", category: "system", direction: "Input", desc: "Minimum / Maximum Mode selection pin (MN/MX̄).", minDetail: "Wired to VCC (+5V) for MIN mode (single CPU mode).", maxDetail: "Wired to GND (0V) for MAX mode (multi-processor mode with 8288 Bus Controller)." },
  { num: 34, minName: "BHE#/S7", maxName: "BHE#/S7", category: "address-data", direction: "Output", desc: "Bus High Enable (BHE#) / Status S7.", minDetail: "During T1: Active-low BHE# enables upper byte data bus D8-D15. During T2-T4: Outputs status bit S7.", maxDetail: "During T1: Active-low BHE# enables upper byte data bus D8-D15. During T2-T4: Outputs status bit S7." },
  { num: 35, minName: "A19/S6", maxName: "A19/S6", category: "address-data", direction: "Output", desc: "Address Line 19 / Status S6.", minDetail: "Upper address bit A19 / Status S6 (Bus ownership status, always 0).", maxDetail: "Upper address bit A19 / Status S6 (Bus ownership status, always 0)." },
  { num: 36, minName: "A18/S5", maxName: "A18/S5", category: "address-data", direction: "Output", desc: "Address Line 18 / Status S5.", minDetail: "Upper address bit A18 / Status S5 (Reflects Interrupt Enable Flag IF).", maxDetail: "Upper address bit A18 / Status S5 (Reflects Interrupt Enable Flag IF)." },
  { num: 37, minName: "A17/S4", maxName: "A17/S4", category: "address-data", direction: "Output", desc: "Address Line 17 / Status S4.", minDetail: "Upper address bit A17 / Status S4 (Segment selection status).", maxDetail: "Upper address bit A17 / Status S4 (Segment selection status)." },
  { num: 38, minName: "A16/S3", maxName: "A16/S3", category: "address-data", direction: "Output", desc: "Address Line 16 / Status S3.", minDetail: "Upper address bit A16 / Status S3 (Segment selection status).", maxDetail: "Upper address bit A16 / Status S3 (Segment selection status)." },
  { num: 39, minName: "AD15", maxName: "AD15", category: "address-data", direction: "Bi-directional", desc: "Address/Data Line 15 (Multiplexed MSB).", minDetail: "T1: Address A15. T2-T4: Data D15.", maxDetail: "T1: Address A15. T2-T4: Data D15." },
  { num: 40, minName: "VCC", maxName: "VCC", category: "power", direction: "Power", desc: "Primary Power Supply (+5V DC).", minDetail: "Main +5V power input.", maxDetail: "Main +5V power input." }
];

const GROUP_INFO: Record<string, { title: string; desc: string; bg: string; text: string; border: string; pillBg: string }> = {
  "broad-common": {
    title: "1. Common Signals Group (32 Pins)",
    desc: "Pins 1–23 & 32–40 perform identical functions in both Minimum (+5V) and Maximum (GND) modes. Includes multiplexed Address/Data bus (AD0–AD15), upper address/status (A16/S3–A19/S6), BHE#/S7, RD#, CLK, RESET, READY, INTR, NMI, TEST#, MN/MX#, VCC, and GND.",
    bg: "bg-blue-50/80",
    text: "text-blue-900",
    border: "border-blue-200",
    pillBg: "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200"
  },
  "broad-min": {
    title: "2. Minimum Mode Signals Group (8 Pins)",
    desc: "Pins 24–31 active when MN/MX# = +5V (Single CPU mode). The 8086 directly outputs system control strobes: INTA# (24), ALE (25), DEN# (26), DT/R# (27), M/IO# (28), WR# (29), HLDA (30), and HOLD (31).",
    bg: "bg-indigo-50/80",
    text: "text-indigo-900",
    border: "border-indigo-200",
    pillBg: "bg-indigo-100 text-indigo-800 border-indigo-300 hover:bg-indigo-200"
  },
  "broad-max": {
    title: "3. Maximum Mode Signals Group (8 Pins)",
    desc: "Pins 24–31 active when MN/MX# = 0V (Multiprocessor mode). Reconfigured for status output and queue control: QS1 (24), QS0 (25), S0# (26), S1# (27), S2# (28), LOCK# (29), RQ#/GT1# (30), and RQ#/GT0# (31). Decoded by external 8288 Bus Controller.",
    bg: "bg-purple-50/80",
    text: "text-purple-900",
    border: "border-purple-200",
    pillBg: "bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200"
  },
  "address-data": {
    title: "Address / Data Bus Group",
    desc: "Provides 20-bit address capability (A0–A19) and 16-bit data transfers (D0–D15). Multiplexed in time (Address in T1 state, Data/Status in T2–T4 states). Includes Bus High Enable (BHE#) for odd memory bank access.",
    bg: "bg-blue-50/80",
    text: "text-blue-900",
    border: "border-blue-200",
    pillBg: "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200"
  },
  control: {
    title: "Control & Bus Management Group",
    desc: "Generates timing strobes and bus transceiver signals. In Minimum Mode (+5V), CPU provides RD#, WR#, ALE, DEN#, DT/R#, M/IO#, INTA#, HOLD, HLDA directly. In Maximum Mode (0V), pins 24–28 transition to status lines S0#–S2# and queue status QS0–QS1.",
    bg: "bg-amber-50/80",
    text: "text-amber-900",
    border: "border-amber-200",
    pillBg: "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200"
  },
  status: {
    title: "Status & Queue Signals Group",
    desc: "Provides processor status and instruction queue feedback. Includes segment selection status (S3–S4), interrupt flag status (S5), bus ownership (S6), and BHE#/S7. In Maximum Mode, expands to include S0#–S2# for 8288 bus decoding, instruction queue status (QS0, QS1), and bus locking (LOCK#).",
    bg: "bg-purple-50/80",
    text: "text-purple-900",
    border: "border-purple-200",
    pillBg: "bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200"
  },
  system: {
    title: "System & Interrupt Control Group",
    desc: "Controls hardware interrupts, CPU reset sequence, wait-state synchronization, and operating mode selection. Includes INTR (Maskable), NMI (Non-Maskable Vector 2), RESET (CS=FFFFH, IP=0000H), READY (Wait-state generator), TEST# (WAIT sync), and MN/MX# (Mode strap).",
    bg: "bg-emerald-50/80",
    text: "text-emerald-900",
    border: "border-emerald-200",
    pillBg: "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200"
  },
  power: {
    title: "Power Supply & Clock Group",
    desc: "Supplies power and system clocking to the 8086 IC. Includes main power line VCC (Pin 40, +5V DC), two ground references GND (Pins 1 & 20, 0V), and CLK (Pin 19, 33% duty cycle clock input from 8284 clock generator).",
    bg: "bg-rose-50/80",
    text: "text-rose-900",
    border: "border-rose-200",
    pillBg: "bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200"
  }
};

interface Status8288Mapping {
  s2: number;
  s1: number;
  s0: number;
  cycleType: string;
  commandGenerated: string;
  commandBadge: string;
  busActionDesc: string;
  controlSignals: {
    ale: string;
    den: string;
    dtr: string;
    mIo: string;
  };
}

const DECODING_8288_DATA: Status8288Mapping[] = [
  {
    s2: 0, s1: 0, s0: 0,
    cycleType: "Interrupt Acknowledge",
    commandGenerated: "INTA#",
    commandBadge: "text-emerald-700 bg-emerald-100 border-emerald-300 font-bold",
    busActionDesc: "CPU receives an INTR interrupt. 8288 generates two INTA# pulses to acknowledge the interrupt request and read the 8-bit interrupt vector type from the data bus.",
    controlSignals: { ale: "HIGH (T1)", den: "LOW (T2-T3)", dtr: "LOW (Read)", mIo: "LOW (I/O)" }
  },
  {
    s2: 0, s1: 0, s0: 1,
    cycleType: "Read I/O Port",
    commandGenerated: "IORC#",
    commandBadge: "text-blue-700 bg-blue-100 border-blue-300 font-bold",
    busActionDesc: "Activates I/O Read Command (IORC#) line to enable an I/O peripheral device to place data onto the system bus (IN instruction).",
    controlSignals: { ale: "HIGH (T1)", den: "LOW (T2-T3)", dtr: "LOW (Read)", mIo: "LOW (I/O)" }
  },
  {
    s2: 0, s1: 1, s0: 0,
    cycleType: "Write I/O Port",
    commandGenerated: "IOWC# / AIOWC#",
    commandBadge: "text-amber-700 bg-amber-100 border-amber-300 font-bold",
    busActionDesc: "Activates I/O Write Command (IOWC#) & Advanced I/O Write Command (AIOWC#) to transfer data from CPU to an I/O port (OUT instruction).",
    controlSignals: { ale: "HIGH (T1)", den: "LOW (T2-T3)", dtr: "HIGH (Write)", mIo: "LOW (I/O)" }
  },
  {
    s2: 0, s1: 1, s0: 1,
    cycleType: "Halt / Passive",
    commandGenerated: "None (Idle)",
    commandBadge: "text-slate-600 bg-slate-100 border-slate-300 font-medium",
    busActionDesc: "CPU executes HALT instruction. Bus controller enters passive/idle state with all command lines inactive (HIGH).",
    controlSignals: { ale: "LOW", den: "HIGH", dtr: "HIGH", mIo: "HIGH" }
  },
  {
    s2: 1, s1: 0, s0: 0,
    cycleType: "Instruction Fetch",
    commandGenerated: "MRDC#",
    commandBadge: "text-indigo-700 bg-indigo-100 border-indigo-300 font-bold",
    busActionDesc: "Bus Interface Unit (BIU) fetches instruction opcode bytes from Code Segment (CS) memory into the 6-byte instruction queue using Memory Read Command (MRDC#).",
    controlSignals: { ale: "HIGH (T1)", den: "LOW (T2-T3)", dtr: "LOW (Read)", mIo: "HIGH (Mem)" }
  },
  {
    s2: 1, s1: 0, s0: 1,
    cycleType: "Read Memory",
    commandGenerated: "MRDC#",
    commandBadge: "text-blue-700 bg-blue-100 border-blue-300 font-bold",
    busActionDesc: "Activates Memory Read Command (MRDC#) line to read memory operand data from RAM/ROM into internal processor registers.",
    controlSignals: { ale: "HIGH (T1)", den: "LOW (T2-T3)", dtr: "LOW (Read)", mIo: "HIGH (Mem)" }
  },
  {
    s2: 1, s1: 1, s0: 0,
    cycleType: "Write Memory",
    commandGenerated: "MWTC# / AMWC#",
    commandBadge: "text-amber-700 bg-amber-100 border-amber-300 font-bold",
    busActionDesc: "Activates Memory Write Command (MWTC#) and Advanced Memory Write Command (AMWC#) to store register data into system memory.",
    controlSignals: { ale: "HIGH (T1)", den: "LOW (T2-T3)", dtr: "HIGH (Write)", mIo: "HIGH (Mem)" }
  },
  {
    s2: 1, s1: 1, s0: 1,
    cycleType: "Passive / Idle State",
    commandGenerated: "None (Passive)",
    commandBadge: "text-slate-600 bg-slate-100 border-slate-300 font-medium",
    busActionDesc: "No active bus cycle. Processor is executing internal operations or waiting for next bus state. All command outputs disabled (HIGH).",
    controlSignals: { ale: "LOW", den: "HIGH", dtr: "HIGH", mIo: "HIGH" }
  }
];

export default function PinConfigurationSimulator() {
  const [mode, setMode] = useState<"MIN" | "MAX">("MIN");
  const [selectedPinNum, setSelectedPinNum] = useState<number>(25);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [s2Bit, setS2Bit] = useState<number>(1);
  const [s1Bit, setS1Bit] = useState<number>(0);
  const [s0Bit, setS0Bit] = useState<number>(1);

  const active8288Mapping = DECODING_8288_DATA.find(
    (item) => item.s2 === s2Bit && item.s1 === s1Bit && item.s0 === s0Bit
  ) || DECODING_8288_DATA[5];

  const selectedPin = PIN_LIST.find((p) => p.num === selectedPinNum) || PIN_LIST[24];

  const getEffectiveCategory = (pin: PinData, currentMode: "MIN" | "MAX") => {
    if (currentMode === "MAX" && [24, 25, 26, 27, 28].includes(pin.num)) {
      return "status";
    }
    if (currentMode === "MIN" && [24, 25, 26, 27, 28].includes(pin.num)) {
      return "control";
    }
    return pin.category;
  };

  const isPinInGroup = (pin: PinData, group: string, currentMode: "MIN" | "MAX") => {
    if (group === "all") return true;

    if (group === "broad-common") {
      return pin.num < 24 || pin.num > 31;
    }

    if (group === "broad-min") {
      return pin.num >= 24 && pin.num <= 31;
    }

    if (group === "broad-max") {
      return pin.num >= 24 && pin.num <= 31;
    }

    const effCat = getEffectiveCategory(pin, currentMode);

    if (group === "status") {
      if ([34, 35, 36, 37, 38].includes(pin.num)) return true;
      if (currentMode === "MAX" && [24, 25, 26, 27, 28].includes(pin.num)) return true;
      return effCat === "status";
    }

    if (group === "address-data") {
      if ([34, 35, 36, 37, 38].includes(pin.num)) return true;
      return effCat === "address-data";
    }

    return effCat === group;
  };

  const isPinMatching = (pin: PinData) => {
    const signalName = mode === "MIN" ? pin.minName : pin.maxName;
    const matchesCat = isPinInGroup(pin, filterCategory, mode);
    const q = searchQuery.trim().toLowerCase();
    const matchesQ =
      q === "" ||
      signalName.toLowerCase().includes(q) ||
      pin.minName.toLowerCase().includes(q) ||
      pin.maxName.toLowerCase().includes(q) ||
      pin.desc.toLowerCase().includes(q) ||
      pin.num.toString() === q;
    return matchesCat && matchesQ;
  };

  const getGroupCount = (groupId: string) => {
    return PIN_LIST.filter((pin) => isPinInGroup(pin, groupId, mode)).length;
  };

  const getPinColor = (category: string) => {
    switch (category) {
      case "address-data":
        return "bg-blue-500 hover:bg-blue-600 border-blue-600 text-white";
      case "control":
        return "bg-amber-500 hover:bg-amber-600 border-amber-600 text-white";
      case "status":
        return "bg-purple-500 hover:bg-purple-600 border-purple-600 text-white";
      case "system":
        return "bg-emerald-500 hover:bg-emerald-600 border-emerald-600 text-white";
      case "power":
        return "bg-rose-500 hover:bg-rose-600 border-rose-600 text-white";
      default:
        return "bg-slate-500 hover:bg-slate-600 border-slate-600 text-white";
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 bg-white text-slate-900 rounded-2xl shadow-sm border border-slate-200 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-slate-50/80 p-5 rounded-xl border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              8086 40-Pin Dual In-line Package (DIP)
            </h3>
            <div className="inline-flex rounded-lg bg-slate-200/70 p-1 border border-slate-300">
              <button
                onClick={() => {
                  setMode("MIN");
                  if (filterCategory === "broad-max") setFilterCategory("broad-min");
                }}
                className={`px-3 py-1 text-xs font-mono font-bold rounded-md transition-all cursor-pointer ${
                  mode === "MIN"
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                MIN Mode (+5V)
              </button>
              <button
                onClick={() => {
                  setMode("MAX");
                  if (filterCategory === "broad-min") setFilterCategory("broad-max");
                }}
                className={`px-3 py-1 text-xs font-mono font-bold rounded-md transition-all cursor-pointer ${
                  mode === "MAX"
                    ? "bg-purple-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                MAX Mode (0V)
              </button>
            </div>
          </div>

          {/* Primary Signal Classification (3 Main Groups) */}
          <div className="bg-slate-100/90 p-2.5 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                Broad Signal Categorization (3 Major Groups)
              </span>
              {filterCategory.startsWith("broad-") && (
                <button
                  onClick={() => setFilterCategory("all")}
                  className="text-[10px] text-slate-500 hover:text-indigo-600 font-mono font-bold underline cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => setFilterCategory("broad-common")}
                className={`p-2 rounded-lg text-left transition-all border cursor-pointer ${
                  filterCategory === "broad-common"
                    ? "bg-blue-600 text-white border-blue-700 shadow-xs font-bold"
                    : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50"
                }`}
              >
                <div className="text-[11px] font-bold font-mono flex items-center justify-between">
                  <span>1. Common Signals</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${filterCategory === "broad-common" ? "bg-blue-700 text-white" : "bg-blue-100 text-blue-800"}`}>
                    32 Pins
                  </span>
                </div>
                <div className="text-[10px] opacity-85 mt-1 line-clamp-1">
                  Identical in MIN & MAX modes (Pins 1–23 & 32–40)
                </div>
              </button>

              <button
                onClick={() => {
                  setFilterCategory("broad-min");
                  setMode("MIN");
                }}
                className={`p-2 rounded-lg text-left transition-all border cursor-pointer ${
                  filterCategory === "broad-min"
                    ? "bg-indigo-600 text-white border-indigo-700 shadow-xs font-bold"
                    : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50"
                }`}
              >
                <div className="text-[11px] font-bold font-mono flex items-center justify-between">
                  <span>2. Minimum Mode</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${filterCategory === "broad-min" ? "bg-indigo-700 text-white" : "bg-indigo-100 text-indigo-800"}`}>
                    8 Pins
                  </span>
                </div>
                <div className="text-[10px] opacity-85 mt-1 line-clamp-1">
                  Single CPU control (Pins 24–31 when MN/MX = 1)
                </div>
              </button>

              <button
                onClick={() => {
                  setFilterCategory("broad-max");
                  setMode("MAX");
                }}
                className={`p-2 rounded-lg text-left transition-all border cursor-pointer ${
                  filterCategory === "broad-max"
                    ? "bg-purple-600 text-white border-purple-700 shadow-xs font-bold"
                    : "bg-white text-slate-700 border-slate-200 hover:border-purple-300 hover:bg-purple-50/50"
                }`}
              >
                <div className="text-[11px] font-bold font-mono flex items-center justify-between">
                  <span>3. Maximum Mode</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${filterCategory === "broad-max" ? "bg-purple-700 text-white" : "bg-purple-100 text-purple-800"}`}>
                    8 Pins
                  </span>
                </div>
                <div className="text-[10px] opacity-85 mt-1 line-clamp-1">
                  Multi CPU control (Pins 24–31 when MN/MX = 0)
                </div>
              </button>
            </div>
          </div>

          <div className="relative bg-slate-50 border-2 border-slate-300 rounded-2xl p-4 sm:p-6 shadow-2xs">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-4 bg-slate-200 rounded-b-full border-b border-x border-slate-300" />
            <div className="text-center my-2">
              <span className="text-xs font-mono font-bold text-slate-600 uppercase tracking-widest block">INTEL 8086</span>
            </div>

            <div className="grid grid-cols-2 gap-x-8 sm:gap-x-12 relative my-4">
              <div className="space-y-1.5">
                {PIN_LIST.slice(0, 20).map((pin) => {
                  const signalName = mode === "MIN" ? pin.minName : pin.maxName;
                  const isSelected = selectedPinNum === pin.num;
                  const matches = isPinMatching(pin);
                  return (
                    <button
                      key={pin.num}
                      onClick={() => setSelectedPinNum(pin.num)}
                      className={`w-full flex items-center justify-between px-2.5 py-1 sm:py-1.5 rounded-lg border text-left text-xs transition-all ${
                        !matches
                          ? "opacity-25 grayscale hover:opacity-80 border-slate-200 bg-slate-50"
                          : isSelected
                          ? "ring-2 ring-indigo-500 bg-indigo-50 border-indigo-400 font-bold scale-[1.02] shadow-2xs"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs"
                      }`}
                    >
                      <span className="font-mono text-slate-500 w-6 text-[11px]">{pin.num}</span>
                      <span className={`px-2 py-1 rounded text-[11px] font-mono font-bold ${getPinColor(getEffectiveCategory(pin, mode))}`}>
                        <PinLabel name={signalName} />
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-1.5">
                {PIN_LIST.slice(20, 40)
                  .reverse()
                  .map((pin) => {
                    const signalName = mode === "MIN" ? pin.minName : pin.maxName;
                    const isSelected = selectedPinNum === pin.num;
                    const matches = isPinMatching(pin);
                    return (
                      <button
                        key={pin.num}
                        onClick={() => setSelectedPinNum(pin.num)}
                        className={`w-full flex items-center justify-between px-2.5 py-1 sm:py-1.5 rounded-lg border text-left text-xs transition-all ${
                          !matches
                            ? "opacity-25 grayscale hover:opacity-80 border-slate-200 bg-slate-50"
                            : isSelected
                            ? "ring-2 ring-indigo-500 bg-indigo-50 border-indigo-400 font-bold scale-[1.02] shadow-2xs"
                            : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs"
                        }`}
                      >
                        <span className={`px-2 py-1 rounded text-[11px] font-mono font-bold ${getPinColor(getEffectiveCategory(pin, mode))}`}>
                          <PinLabel name={signalName} />
                        </span>
                        <span className="font-mono text-slate-500 w-6 text-right text-[11px]">{pin.num}</span>
                      </button>
                    );
                  })}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-3 border-t border-slate-200 text-[11px] font-medium text-slate-700">
              <span className="text-slate-500 font-mono text-[10px] uppercase font-semibold mr-1">Pin Groupings:</span>
              {[
                { id: "all", label: `All (${getGroupCount("all")})`, bg: "bg-slate-600" },
                { id: "address-data", label: `Address/Data (${getGroupCount("address-data")})`, bg: "bg-blue-500" },
                { id: "control", label: `Control (${getGroupCount("control")})`, bg: "bg-amber-500" },
                { id: "status", label: `Status (${getGroupCount("status")})`, bg: "bg-purple-500" },
                { id: "system", label: `System (${getGroupCount("system")})`, bg: "bg-emerald-500" },
                { id: "power", label: `Power/CLK (${getGroupCount("power")})`, bg: "bg-rose-500" },
              ].map((grp) => (
                <button
                  key={grp.id}
                  onClick={() => setFilterCategory(grp.id)}
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                    filterCategory === grp.id
                      ? "ring-2 ring-indigo-500 bg-slate-100 font-bold shadow-2xs"
                      : "hover:bg-slate-100 opacity-80 hover:opacity-100"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${grp.bg}`} />
                  {grp.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-slate-50/80 p-5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-600 font-semibold">Pin Inspector</span>
              <span className="text-xs bg-indigo-50 text-indigo-900 font-mono px-2 py-0.5 rounded font-bold border border-indigo-200">
                Pin #{selectedPin.num}
              </span>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-xl font-extrabold text-slate-900 font-mono">
                    <PinLabel name={mode === "MIN" ? selectedPin.minName : selectedPin.maxName} />
                  </h4>
                  {selectedPin.minName !== selectedPin.maxName && (
                    <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                      (Alt: <PinLabel name={mode === "MIN" ? selectedPin.maxName : selectedPin.minName} />)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-[11px] px-2 py-0.5 rounded font-bold font-mono ${getPinColor(selectedPin.category)}`}>
                    {selectedPin.category.toUpperCase()}
                  </span>
                  <span className="text-[11px] bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded border border-slate-200">
                    Direction: {selectedPin.direction}
                  </span>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2 shadow-2xs">
                <p className="leading-relaxed font-sans"><FormattedSignalText text={selectedPin.desc} /></p>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide block">
                  Current Mode Operation ({mode} Mode):
                </span>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-mono shadow-2xs">
                  <FormattedSignalText text={mode === "MIN" ? selectedPin.minDetail : selectedPin.maxDetail} />
                </div>
              </div>

              {filterCategory !== "all" && GROUP_INFO[filterCategory] && (
                <div className={`p-3.5 rounded-xl border ${GROUP_INFO[filterCategory].bg} ${GROUP_INFO[filterCategory].border} space-y-2.5 shadow-2xs mt-3`}>
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      <h4 className={`text-[11px] font-bold font-mono uppercase tracking-wide ${GROUP_INFO[filterCategory].text}`}>
                        {GROUP_INFO[filterCategory].title} ({getGroupCount(filterCategory)} Pins)
                      </h4>
                    </div>
                    <button
                      onClick={() => setFilterCategory("all")}
                      className="text-[10px] font-mono bg-white text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 hover:bg-slate-100 transition-colors"
                    >
                      Reset Filter
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    <FormattedSignalText text={GROUP_INFO[filterCategory].desc} />
                  </p>
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                      Group Pins (Click to inspect):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {PIN_LIST.filter((pin) => isPinInGroup(pin, filterCategory, mode)).map((pin) => {
                        const sigName = mode === "MIN" ? pin.minName : pin.maxName;
                        const isSelected = selectedPinNum === pin.num;
                        return (
                          <button
                            key={pin.num}
                            onClick={() => setSelectedPinNum(pin.num)}
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-indigo-600 text-white font-bold border-indigo-700 shadow-2xs ring-2 ring-indigo-300"
                                : `${GROUP_INFO[filterCategory].pillBg}`
                            }`}
                          >
                            <span className="opacity-75">#{pin.num}:</span>
                            <PinLabel name={sigName} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search pin name or function..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-800 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500 shadow-2xs"
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {["all", "address-data", "control", "status", "system", "power"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`text-[10px] font-mono px-2 py-1 rounded transition-all ${
                    filterCategory === cat
                      ? "bg-indigo-600 text-white font-bold"
                      : "bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200"
                  }`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive 8288 Bus Controller Status Line Decoding (Always Dynamic & Interactive) */}
      <div className="bg-purple-50/50 p-5 rounded-2xl border-2 border-purple-200/80 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-200/80 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-purple-950 flex items-center gap-2 font-mono">
              <Binary className="w-4 h-4 text-purple-700" />
              Dynamic 8288 Bus Controller Status Line Decoding (Pins 28, 27, 26: <ActiveLow>S2</ActiveLow>, <ActiveLow>S1</ActiveLow>, <ActiveLow>S0</ActiveLow>)
            </h3>
            <p className="text-xs text-purple-800 mt-0.5 font-sans">
              Toggle the status bit inputs or click any row in the truth table below to observe dynamic 8288 command signal generation.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono bg-purple-100 text-purple-900 font-bold px-2.5 py-1 rounded-lg border border-purple-300 shrink-0">
              {mode === "MAX" ? "Active in Maximum Mode" : "Decoded when MN/MX# = 0V"}
            </span>
          </div>
        </div>

        {/* Live Bit Controls & Interactive Decoder Inspector Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Input Bit Toggles */}
          <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-purple-200 space-y-3.5 shadow-2xs">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-900 block border-b border-slate-100 pb-1.5">
              1. Set Input Status Lines (<ActiveLow>S2</ActiveLow>, <ActiveLow>S1</ActiveLow>, <ActiveLow>S0</ActiveLow>)
            </span>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="space-y-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-mono font-bold text-slate-600 block">
                  <ActiveLow>S2</ActiveLow> (Pin 28)
                </span>
                <div className="flex gap-1 justify-center">
                  {[0, 1].map((val) => (
                    <button
                      key={val}
                      onClick={() => setS2Bit(val)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold cursor-pointer transition-all ${
                        s2Bit === val
                          ? "bg-purple-600 text-white shadow-2xs ring-2 ring-purple-300"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-mono font-bold text-slate-600 block">
                  <ActiveLow>S1</ActiveLow> (Pin 27)
                </span>
                <div className="flex gap-1 justify-center">
                  {[0, 1].map((val) => (
                    <button
                      key={val}
                      onClick={() => setS1Bit(val)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold cursor-pointer transition-all ${
                        s1Bit === val
                          ? "bg-purple-600 text-white shadow-2xs ring-2 ring-purple-300"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-mono font-bold text-slate-600 block">
                  <ActiveLow>S0</ActiveLow> (Pin 26)
                </span>
                <div className="flex gap-1 justify-center">
                  {[0, 1].map((val) => (
                    <button
                      key={val}
                      onClick={() => setS0Bit(val)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold cursor-pointer transition-all ${
                        s0Bit === val
                          ? "bg-purple-600 text-white shadow-2xs ring-2 ring-purple-300"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Cycle Preset Selector */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">
                Quick Select Cycle Type:
              </span>
              <div className="flex flex-wrap gap-1">
                {DECODING_8288_DATA.map((item) => {
                  const isSelected = item.s2 === s2Bit && item.s1 === s1Bit && item.s0 === s0Bit;
                  return (
                    <button
                      key={`${item.s2}-${item.s1}-${item.s0}`}
                      onClick={() => {
                        setS2Bit(item.s2);
                        setS1Bit(item.s1);
                        setS0Bit(item.s0);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-purple-700 text-white font-bold border-purple-800 shadow-2xs"
                          : "bg-slate-100 text-slate-700 hover:bg-purple-100 border-slate-200"
                      }`}
                    >
                      {item.cycleType} ({item.s2}{item.s1}{item.s0})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Live Decoder Output Display */}
          <div className="lg:col-span-7 bg-white p-4 rounded-xl border border-purple-200 space-y-3 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-purple-600" />
                  2. Live 8288 Decoder Output
                </span>
                <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  Input: <ActiveLow>S2</ActiveLow>={s2Bit}, <ActiveLow>S1</ActiveLow>={s1Bit}, <ActiveLow>S0</ActiveLow>={s0Bit}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                <div className="bg-purple-50/70 p-2.5 rounded-lg border border-purple-200">
                  <span className="text-[10px] font-mono uppercase text-purple-800 block font-semibold">Active Cycle Type:</span>
                  <span className="text-xs font-bold text-purple-950 font-mono mt-0.5 block">{active8288Mapping.cycleType}</span>
                </div>

                <div className="bg-purple-50/70 p-2.5 rounded-lg border border-purple-200">
                  <span className="text-[10px] font-mono uppercase text-purple-800 block font-semibold">Generated 8288 Command:</span>
                  <span className={`text-xs px-2 py-0.5 rounded border inline-block mt-0.5 font-mono ${active8288Mapping.commandBadge}`}>
                    <FormattedSignalText text={active8288Mapping.commandGenerated} />
                  </span>
                </div>
              </div>

              <div className="mt-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans">
                <p><strong className="text-slate-900 font-mono">Bus Action: </strong>{active8288Mapping.busActionDesc}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-100 text-center font-mono text-[10px]">
              <div className="p-1 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block font-bold">ALE</span>
                <span className="font-bold text-slate-800">{active8288Mapping.controlSignals.ale}</span>
              </div>
              <div className="p-1 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block font-bold"><ActiveLow>DEN</ActiveLow></span>
                <span className="font-bold text-slate-800">{active8288Mapping.controlSignals.den}</span>
              </div>
              <div className="p-1 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block font-bold">DT/<ActiveLow>R</ActiveLow></span>
                <span className="font-bold text-slate-800">{active8288Mapping.controlSignals.dtr}</span>
              </div>
              <div className="p-1 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block font-bold">M/<ActiveLow>IO</ActiveLow></span>
                <span className="font-bold text-slate-800">{active8288Mapping.controlSignals.mIo}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Decoding Table */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-900 block">
            3. 8288 Status Decoding Truth Table (Click any row to test dynamically)
          </span>
          <div className="overflow-x-auto rounded-xl border border-purple-200 bg-white shadow-2xs">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead>
                <tr className="border-b border-purple-200 text-purple-950 font-mono bg-purple-100/80">
                  <th className="p-2.5 font-bold"><ActiveLow>S2</ActiveLow> (Pin 28)</th>
                  <th className="p-2.5 font-bold"><ActiveLow>S1</ActiveLow> (Pin 27)</th>
                  <th className="p-2.5 font-bold"><ActiveLow>S0</ActiveLow> (Pin 26)</th>
                  <th className="p-2.5 font-bold">Processor Cycle Type</th>
                  <th className="p-2.5 font-bold">8288 Output Command Generated</th>
                  <th className="p-2.5 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {DECODING_8288_DATA.map((row) => {
                  const isSelected = row.s2 === s2Bit && row.s1 === s1Bit && row.s0 === s0Bit;
                  return (
                    <tr
                      key={`${row.s2}-${row.s1}-${row.s0}`}
                      onClick={() => {
                        setS2Bit(row.s2);
                        setS1Bit(row.s1);
                        setS0Bit(row.s0);
                      }}
                      className={`transition-all cursor-pointer ${
                        isSelected
                          ? "bg-purple-100/90 font-bold border-l-4 border-l-purple-600 text-purple-950 shadow-2xs"
                          : "hover:bg-purple-50/60 text-slate-800"
                      }`}
                    >
                      <td className="p-2.5 text-purple-900 font-extrabold">{row.s2}</td>
                      <td className="p-2.5 text-purple-900 font-extrabold">{row.s1}</td>
                      <td className="p-2.5 text-purple-900 font-extrabold">{row.s0}</td>
                      <td className="p-2.5 font-sans font-medium">{row.cycleType}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded border text-[10px] ${row.commandBadge}`}>
                          <FormattedSignalText text={row.commandGenerated} />
                        </span>
                      </td>
                      <td className="p-2.5 text-right font-sans">
                        {isSelected ? (
                          <span className="text-[10px] bg-purple-700 text-white font-bold font-mono px-2 py-0.5 rounded shadow-2xs">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">
                            Click to test
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-200 space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 font-mono">
          <Layers className="w-4 h-4 text-purple-600" />
          Complete 8086 Status Signals Summary (S0 – S7 & QS0, QS1)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between font-mono font-bold text-purple-900">
              <span>S0, S1, S2 (Max Mode)</span>
              <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded">Pins 26, 27, 28</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Decoded by external <strong>8288 Bus Controller</strong> to determine the bus cycle type (Memory Read/Write, I/O Read/Write, INTA#, Halt).
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between font-mono font-bold text-blue-900">
              <span>S3, S4 (Segment Selection)</span>
              <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded">Pins 38, 37</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Output during T2–T4 clock cycles to indicate which Segment Register is being accessed:
              <br />
              <code className="text-indigo-600 font-bold">00</code>: ES | <code className="text-indigo-600 font-bold">01</code>: SS | <code className="text-indigo-600 font-bold">10</code>: CS | <code className="text-indigo-600 font-bold">11</code>: DS
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between font-mono font-bold text-emerald-900">
              <span>S5 (Interrupt Flag Status)</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">Pin 36</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Reflects the current state of the <strong>Interrupt Enable Flag (IF)</strong> inside the 8086 Flag Register. Updated at the start of each bus cycle.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between font-mono font-bold text-slate-900">
              <span>S6 (Bus Ownership Status)</span>
              <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded">Pin 35</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Always driven <strong>LOW (0)</strong> by the 8086 CPU when it is actively holding bus mastership.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between font-mono font-bold text-amber-900">
              <span>S7 / BHE# (Bus High Enable)</span>
              <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">Pin 34</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Multiplexed with BHE#. During T1, acts as BHE# to enable upper data bank (D8–D15). During T2–T4, outputs status S7 (spare/reserved).
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between font-mono font-bold text-indigo-900">
              <span>QS0, QS1 (Queue Status)</span>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded">Pins 25, 24 (Max)</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Indicates the state of the 6-byte instruction prefetch queue:
              <br />
              <code className="text-purple-700 font-bold">00</code>: No Op | <code className="text-purple-700 font-bold">01</code>: First Byte | <code className="text-purple-700 font-bold">10</code>: Queue Empty | <code className="text-purple-700 font-bold">11</code>: Subsequent Byte
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
