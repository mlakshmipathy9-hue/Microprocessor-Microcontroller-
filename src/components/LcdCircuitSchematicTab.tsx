import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Layers,
  Cpu,
  Zap,
  CheckCircle2,
  SlidersHorizontal,
  Table,
  Check
} from 'lucide-react';
import { LabManualPage } from '../data/labExperimentsData';

interface LcdCircuitSchematicTabProps {
  expId: string;
  manualPage: LabManualPage;
}

interface LcdPinInfo {
  pin: number;
  symbol: string;
  name: string;
  direction: 'Input' | 'Power' | 'Bias' | 'Output (Busy)';
  mcuConnection: string;
  mcuPinNum: string;
  voltageLevel: string;
  role8Bit: string;
  role4Bit: string;
  activeInMode: 'both' | '8bit_only' | '4bit_only';
  instructions: string;
}

const LCD_PINOUT_DATA: LcdPinInfo[] = [
  {
    pin: 1,
    symbol: 'VSS',
    name: 'Ground (0V)',
    direction: 'Power',
    mcuConnection: 'System Ground (GND Rail)',
    mcuPinNum: 'GND Rail (0V)',
    voltageLevel: '0V (Ground)',
    role8Bit: 'Power supply reference ground for HD44780 controller logic.',
    role4Bit: 'Power supply reference ground for HD44780 controller logic.',
    activeInMode: 'both',
    instructions: 'Hardware Ground Rail'
  },
  {
    pin: 2,
    symbol: 'VDD',
    name: 'Supply Voltage (+5V)',
    direction: 'Power',
    mcuConnection: 'Power Supply (+5V VCC Rail)',
    mcuPinNum: '+5V VCC Rail',
    voltageLevel: '+5.0V DC (±10%)',
    role8Bit: 'Main DC operating voltage for internal CMOS logic circuitry.',
    role4Bit: 'Main DC operating voltage for internal CMOS logic circuitry.',
    activeInMode: 'both',
    instructions: 'Hardware +5V Rail'
  },
  {
    pin: 3,
    symbol: 'VEE / V0',
    name: 'Contrast Voltage (V0)',
    direction: 'Bias',
    mcuConnection: 'Tied to Ground (GND / 0V)',
    mcuPinNum: 'GND Rail (0V)',
    voltageLevel: '0V (Maximum Contrast)',
    role8Bit: 'Contrast voltage input tied directly to Ground (0V) for fixed high-contrast display without an external trimmer.',
    role4Bit: 'Contrast voltage input tied directly to Ground (0V) for fixed high-contrast display without an external trimmer.',
    activeInMode: 'both',
    instructions: 'Direct Ground Connection'
  },
  {
    pin: 4,
    symbol: 'RS',
    name: 'Register Select',
    direction: 'Input',
    mcuConnection: '8051 Port 2 Pin 0 (P2.0)',
    mcuPinNum: 'Pin 21 (P2.0)',
    voltageLevel: 'TTL Logic: 0 = Low (0V), 1 = High (+5V)',
    role8Bit: 'RS = 0 selects Instruction Register (IR); RS = 1 selects Data Register (DR / DDRAM).',
    role4Bit: 'RS = 0 selects Instruction Register (IR); RS = 1 selects Data Register (DR / DDRAM).',
    activeInMode: 'both',
    instructions: 'CLR P2.0 (Cmd) / SETB P2.0 (Data)'
  },
  {
    pin: 5,
    symbol: 'RW',
    name: 'Read / Write Control',
    direction: 'Input',
    mcuConnection: '8051 Port 2 Pin 1 (P2.1) / Tied to GND',
    mcuPinNum: 'Pin 22 (P2.1) or GND',
    voltageLevel: 'TTL Logic: 0 = Write (0V), 1 = Read (+5V)',
    role8Bit: 'RW = 0 writes command or ASCII data to LCD; RW = 1 reads status/data or Busy Flag (BF).',
    role4Bit: 'RW = 0 writes command or ASCII data to LCD; RW = 1 reads status/data or Busy Flag (BF).',
    activeInMode: 'both',
    instructions: 'CLR P2.1 (Write to LCD)'
  },
  {
    pin: 6,
    symbol: 'EN',
    name: 'Enable Strobe (Latch Trigger)',
    direction: 'Input',
    mcuConnection: '8051 Port 2 Pin 2 (P2.2)',
    mcuPinNum: 'Pin 23 (P2.2)',
    voltageLevel: 'Active High Pulse: Min pulse width tpw ≥ 450 ns',
    role8Bit: 'High-to-Low transition latches byte from Port P1 into LCD controller registers.',
    role4Bit: 'High-to-Low transition latches each 4-bit nibble from P1.4–P1.7 into LCD registers.',
    activeInMode: 'both',
    instructions: 'SETB P2.2 -> ACALL DELAY -> CLR P2.2'
  },
  {
    pin: 7,
    symbol: 'D0',
    name: 'Data Bit 0 (LSB)',
    direction: 'Input',
    mcuConnection: '8051 Port 1 Pin 0 (P1.0)',
    mcuPinNum: 'Pin 1 (P1.0)',
    voltageLevel: 'TTL Logic (0V / 5V)',
    role8Bit: 'Carries Bit 0 of 8-bit command or ASCII character code.',
    role4Bit: 'NOT CONNECTED (NC) or Tied to GND in 4-bit mode. P1.0 on 8051 is FREE.',
    activeInMode: '8bit_only',
    instructions: 'MOV P1, A (Bit 0 on P1.0)'
  },
  {
    pin: 8,
    symbol: 'D1',
    name: 'Data Bit 1',
    direction: 'Input',
    mcuConnection: '8051 Port 1 Pin 1 (P1.1)',
    mcuPinNum: 'Pin 2 (P1.1)',
    voltageLevel: 'TTL Logic (0V / 5V)',
    role8Bit: 'Carries Bit 1 of 8-bit command or ASCII character code.',
    role4Bit: 'NOT CONNECTED (NC) or Tied to GND in 4-bit mode. P1.1 on 8051 is FREE.',
    activeInMode: '8bit_only',
    instructions: 'MOV P1, A (Bit 1 on P1.1)'
  },
  {
    pin: 9,
    symbol: 'D2',
    name: 'Data Bit 2',
    direction: 'Input',
    mcuConnection: '8051 Port 1 Pin 2 (P1.2)',
    mcuPinNum: 'Pin 3 (P1.2)',
    voltageLevel: 'TTL Logic (0V / 5V)',
    role8Bit: 'Carries Bit 2 of 8-bit command or ASCII character code.',
    role4Bit: 'NOT CONNECTED (NC) or Tied to GND in 4-bit mode. P1.2 on 8051 is FREE.',
    activeInMode: '8bit_only',
    instructions: 'MOV P1, A (Bit 2 on P1.2)'
  },
  {
    pin: 10,
    symbol: 'D3',
    name: 'Data Bit 3',
    direction: 'Input',
    mcuConnection: '8051 Port 1 Pin 3 (P1.3)',
    mcuPinNum: 'Pin 4 (P1.3)',
    voltageLevel: 'TTL Logic (0V / 5V)',
    role8Bit: 'Carries Bit 3 of 8-bit command or ASCII character code.',
    role4Bit: 'NOT CONNECTED (NC) or Tied to GND in 4-bit mode. P1.3 on 8051 is FREE.',
    activeInMode: '8bit_only',
    instructions: 'MOV P1, A (Bit 3 on P1.3)'
  },
  {
    pin: 11,
    symbol: 'D4',
    name: 'Data Bit 4',
    direction: 'Input',
    mcuConnection: '8051 Port 1 Pin 4 (P1.4)',
    mcuPinNum: 'Pin 5 (P1.4)',
    voltageLevel: 'TTL Logic (0V / 5V)',
    role8Bit: 'Carries Bit 4 of 8-bit command or ASCII character code.',
    role4Bit: 'Carries Bit 4 (during High Nibble) and Bit 0 (during Low Nibble).',
    activeInMode: 'both',
    instructions: 'ANL A, #0F0H / ORL P1, A'
  },
  {
    pin: 12,
    symbol: 'D5',
    name: 'Data Bit 5',
    direction: 'Input',
    mcuConnection: '8051 Port 1 Pin 5 (P1.5)',
    mcuPinNum: 'Pin 6 (P1.5)',
    voltageLevel: 'TTL Logic (0V / 5V)',
    role8Bit: 'Carries Bit 5 of 8-bit command or ASCII character code.',
    role4Bit: 'Carries Bit 5 (during High Nibble) and Bit 1 (during Low Nibble).',
    activeInMode: 'both',
    instructions: 'ANL A, #0F0H / ORL P1, A'
  },
  {
    pin: 13,
    symbol: 'D6',
    name: 'Data Bit 6',
    direction: 'Input',
    mcuConnection: '8051 Port 1 Pin 6 (P1.6)',
    mcuPinNum: 'Pin 7 (P1.6)',
    voltageLevel: 'TTL Logic (0V / 5V)',
    role8Bit: 'Carries Bit 6 of 8-bit command or ASCII character code.',
    role4Bit: 'Carries Bit 6 (during High Nibble) and Bit 2 (during Low Nibble).',
    activeInMode: 'both',
    instructions: 'ANL A, #0F0H / ORL P1, A'
  },
  {
    pin: 14,
    symbol: 'D7',
    name: 'Data Bit 7 (MSB / Busy Flag)',
    direction: 'Input',
    mcuConnection: '8051 Port 1 Pin 7 (P1.7)',
    mcuPinNum: 'Pin 8 (P1.7)',
    voltageLevel: 'TTL Logic (0V / 5V)',
    role8Bit: 'Carries Bit 7 of byte. In read mode, reflects Busy Flag BF (1 = Busy, 0 = Ready).',
    role4Bit: 'Carries Bit 7 (High Nibble) and Bit 3 (Low Nibble). Also acts as Busy Flag in read.',
    activeInMode: 'both',
    instructions: 'ANL A, #0F0H / ORL P1, A'
  },
  {
    pin: 15,
    symbol: 'LED+ / A',
    name: 'Backlight Anode (+5V via 220Ω)',
    direction: 'Power',
    mcuConnection: '+5V VCC through 220Ω Resistor',
    mcuPinNum: '+5V via 220Ω',
    voltageLevel: '+4.2V to +5.0V (Current ≤ 20mA)',
    role8Bit: 'Powers internal LED matrix backlight for display illumination.',
    role4Bit: 'Powers internal LED matrix backlight for display illumination.',
    activeInMode: 'both',
    instructions: 'Hardware Current Limiter (220Ω)'
  },
  {
    pin: 16,
    symbol: 'LED- / K',
    name: 'Backlight Cathode (GND)',
    direction: 'Power',
    mcuConnection: 'System Ground (GND Rail)',
    mcuPinNum: 'GND Rail',
    voltageLevel: '0V (Ground)',
    role8Bit: 'Cathode ground return path for the LED backlight module.',
    role4Bit: 'Cathode ground return path for the LED backlight module.',
    activeInMode: 'both',
    instructions: 'Hardware Ground Rail'
  }
];

export const LcdCircuitSchematicTab: React.FC<LcdCircuitSchematicTabProps> = ({
  expId,
  manualPage
}) => {
  const is4Bit = expId === 'exp_8051_lcd_4bit';
  const [wireFilter, setWireFilter] = useState<'all' | 'data_bus' | 'control_bus' | 'power_clock'>('all');
  const [selectedPin, setSelectedPin] = useState<number | null>(4); // Default to RS pin (Pin 4)

  const activePinData = LCD_PINOUT_DATA.find((p) => p.pin === selectedPin) || LCD_PINOUT_DATA[3];

  return (
    <motion.div
      key="circuit_schematic"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-3"
    >
      {/* 1. Header Card with Architecture & Mode Badges */}
      <div className="bg-[#EAF4FB] rounded-2xl p-3.5 md:p-4 border border-[#B8D4E8] shadow-2xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[#2563EB] font-mono text-xs font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4 text-[#2563EB]" />
            <span>Circuit Schematic & Microcontroller Hardware Interfacing</span>
          </div>

          <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
            <span className="px-2 py-0.5 rounded-md bg-[#2563EB] text-white font-bold shadow-2xs">
              {is4Bit ? '4-BIT DUAL-NIBBLE INTERFACE' : '8-BIT FULL PARALLEL INTERFACE'}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white border border-[#B8D4E8] text-[#163A5F] font-semibold">
              AT89C51 DIP-40 ↔ HD44780 16×2 LCD
            </span>
            <span className={`px-2 py-0.5 rounded-md border font-bold ${
              is4Bit ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-blue-100 text-blue-800 border-blue-300'
            }`}>
              {is4Bit ? '7 I/O Lines (+4 Pins Saved)' : '11 Total I/O Lines Used'}
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#163A5F] leading-relaxed">
          {is4Bit ? (
            <>
              Complete electronic schematic diagram showing the <strong>8051 Microcontroller (AT89C51)</strong> interfaced with a <strong>16×2 Alphanumeric LCD Module (HD44780 controller)</strong> in <strong>4-Bit Mode</strong>.
              Only 4 data lines (<strong>P1.4–P1.7</strong>) and 3 control lines (<strong>RS=P2.0, RW=P2.1, EN=P2.2</strong>) are utilized, freeing pins <strong>P1.0–P1.3</strong> for auxiliary peripherals. LCD pins D0–D3 and contrast pin V0 are tied directly to Ground (0V).
            </>
          ) : (
            <>
              Complete electronic schematic diagram showing the <strong>8051 Microcontroller (AT89C51)</strong> interfaced with a <strong>16×2 Alphanumeric LCD Module (HD44780 controller)</strong> in <strong>8-Bit Parallel Mode</strong>.
              All 8 bidirectional data lines (<strong>D0–D7</strong>) are mapped directly to 8051 <strong>Port P1 (P1.0–P1.7)</strong>, and control lines to <strong>RS=P2.0</strong>, <strong>RW=P2.1</strong>, and <strong>EN=P2.2</strong>. Contrast pin V0 is tied to Ground (0V) for direct fixed high contrast.
            </>
          )}
        </p>
      </div>

      {/* 2. Interactive SVG Schematic Circuit Canvas */}
      <div className="bg-white rounded-2xl p-3.5 border border-[#B8D4E8] shadow-2xs space-y-3">
        {/* Schematic Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#B8D4E8]">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#2563EB]" />
            <span className="text-xs font-mono font-bold text-[#163A5F] uppercase">
              Schematic Diagram (EDA / Proteus Design Standard)
            </span>
          </div>

          {/* Wire Focus Filters */}
          <div className="flex items-center gap-1 bg-[#EAF4FB] p-1 rounded-xl border border-[#B8D4E8]">
            <span className="text-[10px] font-mono text-[#52799F] px-1.5 font-bold uppercase hidden sm:inline">
              Wire Highlight:
            </span>
            {[
              { id: 'all', label: 'All Wires' },
              { id: 'data_bus', label: is4Bit ? '4-Bit Data Bus' : '8-Bit Data Bus' },
              { id: 'control_bus', label: 'Control (RS/RW/EN)' },
              { id: 'power_clock', label: 'Power & Clock' }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setWireFilter(filter.id as any)}
                className={`px-2 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                  wireFilter === filter.id
                    ? 'bg-[#2563EB] text-white shadow-2xs'
                    : 'text-[#163A5F] hover:bg-white/80'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Schematic Canvas */}
        <div className="relative w-full overflow-x-auto rounded-xl border border-[#B8D4E8] bg-[#F8FAFC] p-2 sm:p-4">
          <svg
            viewBox="0 0 1020 540"
            className="w-full min-w-[840px] h-auto select-none"
            style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
          >
            <defs>
              {/* Grid pattern */}
              <pattern id="schematicGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" strokeWidth="0.8" />
              </pattern>
            </defs>

            {/* Background Grid */}
            <rect width="1020" height="540" fill="url(#schematicGrid)" rx="8" />

            {/* ========================================================================= */}
            {/* 1. AT89C51 / 8051 MICROCONTROLLER IC (DIP-40 SYMBOL)                      */}
            {/* ========================================================================= */}
            <g transform="translate(65, 30)">
              {/* IC Body */}
              <rect
                x="0"
                y="0"
                width="240"
                height="480"
                rx="6"
                fill="#1E293B"
                stroke="#0F172A"
                strokeWidth="2.5"
                className="drop-shadow-sm"
              />
              {/* IC Top Notch */}
              <path d="M 105 0 A 15 15 0 0 0 135 0 Z" fill="#334155" />

              {/* IC Header Label */}
              <text x="120" y="28" fill="#F8FAFC" fontSize="13" fontWeight="bold" textAnchor="middle">
                AT89C51 / 8051
              </text>
              <text x="120" y="42" fill="#94A3B8" fontSize="9.5" textAnchor="middle">
                40-PIN CMOS MICROCONTROLLER
              </text>

              {/* LEFT-SIDE PINS (Power, EA, RST, XTAL, GND) */}
              {/* Pin 40: VCC (+5V) at y = 80 */}
              <g transform="translate(0, 80)">
                <line x1="-25" y1="0" x2="0" y2="0" stroke="#DC2626" strokeWidth="2" />
                <circle cx="-25" cy="0" r="3" fill="#DC2626" />
                <text x="12" y="3.5" fill="#F8FAFC" fontSize="9" fontWeight="bold">40: VCC (+5V)</text>
              </g>

              {/* Pin 31: EA#/VPP at y = 108 */}
              <g transform="translate(0, 108)">
                <line x1="-25" y1="0" x2="0" y2="0" stroke="#DC2626" strokeWidth="2" />
                <circle cx="-25" cy="0" r="3" fill="#DC2626" />
                <text x="12" y="3.5" fill="#F8FAFC" fontSize="9">31: EA#/VPP (→ +5V)</text>
              </g>

              {/* Pin 9: RST at y = 160 */}
              <g transform="translate(0, 160)">
                <line x1="-25" y1="0" x2="0" y2="0" stroke="#0284C7" strokeWidth="2" />
                <circle cx="-25" cy="0" r="3" fill="#0284C7" />
                <text x="12" y="3.5" fill="#38BDF8" fontSize="9" fontWeight="bold">9: RST (Reset)</text>
              </g>

              {/* Pin 19: XTAL1 at y = 220 */}
              <g transform="translate(0, 220)">
                <line x1="-25" y1="0" x2="0" y2="0" stroke="#EAB308" strokeWidth="2" />
                <circle cx="-25" cy="0" r="3" fill="#EAB308" />
                <text x="12" y="3.5" fill="#FDE047" fontSize="9">19: XTAL1 (Osc In)</text>
              </g>

              {/* Pin 18: XTAL2 at y = 246 */}
              <g transform="translate(0, 246)">
                <line x1="-25" y1="0" x2="0" y2="0" stroke="#EAB308" strokeWidth="2" />
                <circle cx="-25" cy="0" r="3" fill="#EAB308" />
                <text x="12" y="3.5" fill="#FDE047" fontSize="9">18: XTAL2 (Osc Out)</text>
              </g>

              {/* Pin 20: GND at y = 286 */}
              <g transform="translate(0, 286)">
                <line x1="-25" y1="0" x2="0" y2="0" stroke="#64748B" strokeWidth="2" />
                <circle cx="-25" cy="0" r="3" fill="#64748B" />
                <text x="12" y="3.5" fill="#94A3B8" fontSize="9" fontWeight="bold">20: GND (0V)</text>
              </g>

              {/* RIGHT-SIDE CONTROL PINS: PORT 2 (Pins 21, 22, 23) */}
              <g transform="translate(240, 0)">
                <rect x="-108" y="100" width="104" height="92" rx="4" fill="#0F172A" stroke="#334155" strokeWidth="1" />
                <text x="-56" y="112" fill="#34D399" fontSize="8" fontWeight="bold" textAnchor="middle">PORT 2 (CTRL)</text>

                {/* Pin 21: P2.0 (RS) at y = 115 (Global y = 145) */}
                <g transform="translate(0, 115)">
                  <line x1="0" y1="0" x2="25" y2="0" stroke="#059669" strokeWidth="2" />
                  <circle cx="25" cy="0" r="3" fill="#059669" />
                  <text x="-8" y="3.5" fill="#6EE7B7" fontSize="9" textAnchor="end" fontWeight="bold">21: P2.0 (RS)</text>
                </g>

                {/* Pin 22: P2.1 (RW) at y = 142 (Global y = 172) */}
                <g transform="translate(0, 142)">
                  <line x1="0" y1="0" x2="25" y2="0" stroke="#D97706" strokeWidth="2" />
                  <circle cx="25" cy="0" r="3" fill="#D97706" />
                  <text x="-8" y="3.5" fill="#FCD34D" fontSize="9" textAnchor="end" fontWeight="bold">22: P2.1 (RW)</text>
                </g>

                {/* Pin 23: P2.2 (EN) at y = 169 (Global y = 199) */}
                <g transform="translate(0, 169)">
                  <line x1="0" y1="0" x2="25" y2="0" stroke="#7C3AED" strokeWidth="2" />
                  <circle cx="25" cy="0" r="3" fill="#7C3AED" />
                  <text x="-8" y="3.5" fill="#C4B5FD" fontSize="9" textAnchor="end" fontWeight="bold">23: P2.2 (EN)</text>
                </g>
              </g>

              {/* RIGHT-SIDE DATA PINS: PORT 1 (Pins 1..8) */}
              <g transform="translate(240, 0)">
                <rect x="-108" y="194" width="104" height="218" rx="4" fill="#0F172A" stroke="#334155" strokeWidth="1" />
                <text x="-56" y="204" fill="#60A5FA" fontSize="8" fontWeight="bold" textAnchor="middle">PORT 1 (DATA)</text>

                {[
                  { pinNum: 1, name: 'P1.0', y: 205, active: !is4Bit }, // Global y = 235
                  { pinNum: 2, name: 'P1.1', y: 230, active: !is4Bit }, // Global y = 260
                  { pinNum: 3, name: 'P1.2', y: 255, active: !is4Bit }, // Global y = 285
                  { pinNum: 4, name: 'P1.3', y: 280, active: !is4Bit }, // Global y = 310
                  { pinNum: 5, name: 'P1.4', y: 305, active: true },    // Global y = 335
                  { pinNum: 6, name: 'P1.5', y: 330, active: true },    // Global y = 360
                  { pinNum: 7, name: 'P1.6', y: 355, active: true },    // Global y = 385
                  { pinNum: 8, name: 'P1.7', y: 380, active: true }     // Global y = 410
                ].map((p) => (
                  <g key={p.pinNum} transform={`translate(0, ${p.y})`}>
                    <line
                      x1="0"
                      y1="0"
                      x2="25"
                      y2="0"
                      stroke={p.active ? '#2563EB' : '#94A3B8'}
                      strokeWidth={p.active ? 2 : 1.2}
                      strokeDasharray={p.active ? 'none' : '2,2'}
                    />
                    <circle cx="25" cy="0" r="3" fill={p.active ? '#2563EB' : '#94A3B8'} />
                    <text
                      x="-8"
                      y="3.5"
                      fill={p.active ? '#93C5FD' : '#64748B'}
                      fontSize="9"
                      textAnchor="end"
                      fontWeight={p.active ? 'bold' : 'normal'}
                    >
                      {p.pinNum}: {p.name}
                    </text>
                    {is4Bit && !p.active && (
                      <text x="-56" y="3.5" fill="#10B981" fontSize="7.5" fontWeight="bold">FREE</text>
                    )}
                  </g>
                ))}
              </g>

              {/* Status Note inside 8051 */}
              <rect x="12" y="418" width="216" height="52" rx="4" fill="#0F172A" stroke="#334155" />
              <text x="20" y="433" fill="#38BDF8" fontSize="8" fontWeight="bold">SYSTEM CLOCK & LOGIC:</text>
              <text x="20" y="446" fill="#E2E8F0" fontSize="8">11.0592 MHz Crystal (1.085 µs)</text>
              <text x="20" y="459" fill="#FDE047" fontSize="7.5">Internal Pull-Ups Active on P1 & P2</text>
            </g>

            {/* ========================================================================= */}
            {/* 2. RESET & CRYSTAL OSCILLATOR SUBSYSTEMS (LEFT OF 8051)                   */}
            {/* ========================================================================= */}
            {/* Power Terminals on Left of MCU */}
            <g opacity={wireFilter === 'control_bus' || wireFilter === 'data_bus' ? 0.25 : 1}>
              {/* Pin 40 VCC (+5V) at y = 110 */}
              <circle cx="36" cy="110" r="4" fill="#DC2626" />
              <text x="32" y="105" fill="#DC2626" fontSize="8" fontWeight="bold" textAnchor="end">+5V</text>

              {/* Pin 31 EA#/VPP at y = 138 */}
              <circle cx="36" cy="138" r="4" fill="#DC2626" />
              <text x="32" y="134" fill="#DC2626" fontSize="8" fontWeight="bold" textAnchor="end">+5V</text>

              {/* Pin 20 GND at y = 316 */}
              <line x1="28" y1="316" x2="40" y2="316" stroke="#64748B" strokeWidth="2" />
              <line x1="31" y1="319" x2="37" y2="319" stroke="#64748B" strokeWidth="1.5" />
              <line x1="33" y1="322" x2="35" y2="322" stroke="#64748B" strokeWidth="1" />
              <text x="24" y="319" fill="#64748B" fontSize="8" fontWeight="bold" textAnchor="end">GND</text>
            </g>

            {/* Reset Circuit (POR) at y = 190 (Pin 9 at MCU y = 160 -> Global y = 190) */}
            <g transform="translate(12, 160)" opacity={wireFilter === 'control_bus' || wireFilter === 'data_bus' ? 0.25 : 1}>
              <rect x="-4" y="-10" width="28" height="66" rx="3" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1" />
              <text x="10" y="0" fill="#0369A1" fontSize="7" fontWeight="bold" textAnchor="middle">POR</text>
              <text x="10" y="11" fill="#DC2626" fontSize="6.5" fontWeight="bold" textAnchor="middle">+5V</text>
              <line x1="10" y1="14" x2="10" y2="20" stroke="#0284C7" strokeWidth="1.5" />
              <text x="10" y="28" fill="#0F172A" fontSize="6.5" fontWeight="bold" textAnchor="middle">10µF</text>
              <line x1="10" y1="31" x2="10" y2="37" stroke="#0284C7" strokeWidth="1.5" />
              <text x="10" y="45" fill="#0F172A" fontSize="6.5" textAnchor="middle">10kΩ</text>
              <text x="10" y="53" fill="#64748B" fontSize="6" textAnchor="middle">GND</text>
            </g>

            {/* Crystal Subsystem at y = 250 (Pin 19 at y = 250, Pin 18 at y = 276) */}
            <g transform="translate(12, 240)" opacity={wireFilter === 'control_bus' || wireFilter === 'data_bus' ? 0.25 : 1}>
              <rect x="-4" y="-8" width="28" height="52" rx="3" fill="#FEF9C3" stroke="#CA8A04" strokeWidth="1" />
              <text x="10" y="2" fill="#854D0E" fontSize="7" fontWeight="bold" textAnchor="middle">XTAL</text>
              <text x="10" y="14" fill="#A16207" fontSize="6" textAnchor="middle">11.059</text>
              <text x="10" y="23" fill="#A16207" fontSize="6" textAnchor="middle">MHz</text>
              <text x="10" y="34" fill="#713F12" fontSize="6" textAnchor="middle">2×33pF</text>
              <text x="10" y="42" fill="#64748B" fontSize="5.5" textAnchor="middle">GND</text>
            </g>

            {/* ========================================================================= */}
            {/* 3. 16×2 CHARACTER LCD MODULE (HITACHI HD44780 CONTROLLER)                */}
            {/* ========================================================================= */}
            <g transform="translate(690, 30)">
              {/* Outer LCD Bezel */}
              <rect
                x="0"
                y="0"
                width="280"
                height="480"
                rx="8"
                fill="#064E3B"
                stroke="#047857"
                strokeWidth="2.5"
                className="drop-shadow-sm"
              />

              {/* LCD Header Label */}
              <text x="140" y="22" fill="#A7F3D0" fontSize="12" fontWeight="bold" textAnchor="middle">
                16×2 LCD MODULE (HD44780)
              </text>
              <text x="140" y="34" fill="#6EE7B7" fontSize="8" textAnchor="middle">
                {is4Bit ? '4-BIT DUAL-NIBBLE BUS' : '8-BIT FULL PARALLEL BUS'}
              </text>

              {/* LCD Dot Matrix Screen Display */}
              <g transform="translate(15, 42)">
                <rect
                  x="0"
                  y="0"
                  width="250"
                  height="44"
                  rx="4"
                  fill="#065F46"
                  stroke="#10B981"
                  strokeWidth="1.2"
                />
                <rect x="2" y="2" width="246" height="40" fill="#022C22" rx="3" />

                {/* Row 1 Text on LCD Screen */}
                <text x="10" y="18" fill="#34D399" fontSize="10" fontWeight="bold" letterSpacing="1">
                  {is4Bit ? '4-BIT LCD MODE  ' : '8051 INTERFACE  '}
                </text>
                {/* Row 2 Text on LCD Screen */}
                <text x="10" y="32" fill="#34D399" fontSize="10" fontWeight="bold" letterSpacing="1">
                  {is4Bit ? 'AT89C51 SAVES P1' : '16x2 LCD 8-BIT  '}
                </text>

                <rect x="228" y="9" width="6" height="9" fill="#34D399" opacity="0.8" className="animate-pulse" />
              </g>

              {/* 16-PIN CONNECTOR HEADER (Pins 1..16 aligned with exact matching Y positions) */}
              <g transform="translate(0, 0)">
                <rect x="-1" y="92" width="28" height="380" fill="#0F172A" rx="4" stroke="#334155" />

                {[
                  { pin: 1, symbol: 'VSS', y: 35, name: 'Ground (0V)' },         // Global y = 65
                  { pin: 2, symbol: 'VDD', y: 60, name: 'Supply (+5V)' },       // Global y = 90
                  { pin: 3, symbol: 'V0', y: 85, name: 'Contrast (GND)' },       // Global y = 115
                  { pin: 4, symbol: 'RS', y: 115, name: 'Register Select' },     // Global y = 145
                  { pin: 5, symbol: 'RW', y: 142, name: 'Read/Write (GND)' },   // Global y = 172
                  { pin: 6, symbol: 'EN', y: 169, name: 'Enable Strobe' },       // Global y = 199
                  { pin: 7, symbol: 'D0', y: 205, name: 'Data Bit 0' },          // Global y = 235
                  { pin: 8, symbol: 'D1', y: 230, name: 'Data Bit 1' },          // Global y = 260
                  { pin: 9, symbol: 'D2', y: 255, name: 'Data Bit 2' },          // Global y = 285
                  { pin: 10, symbol: 'D3', y: 280, name: 'Data Bit 3' },         // Global y = 310
                  { pin: 11, symbol: 'D4', y: 305, name: 'Data Bit 4' },         // Global y = 335
                  { pin: 12, symbol: 'D5', y: 330, name: 'Data Bit 5' },         // Global y = 360
                  { pin: 13, symbol: 'D6', y: 355, name: 'Data Bit 6' },         // Global y = 385
                  { pin: 14, symbol: 'D7', y: 380, name: 'Data Bit 7 (MSB)' },   // Global y = 410
                  { pin: 15, symbol: 'LED+', y: 415, name: 'Backlight Anode' },  // Global y = 445
                  { pin: 16, symbol: 'LED-', y: 440, name: 'Backlight Cathode' } // Global y = 470
                ].map((p) => {
                  const isSelected = selectedPin === p.pin;
                  const isDimmed =
                    (wireFilter === 'data_bus' && !p.symbol.startsWith('D')) ||
                    (wireFilter === 'control_bus' && !['RS', 'RW', 'EN'].includes(p.symbol)) ||
                    (wireFilter === 'power_clock' && ['D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'RS', 'RW', 'EN'].includes(p.symbol));
                  const isInactiveIn4Bit = is4Bit && ['D0', 'D1', 'D2', 'D3'].includes(p.symbol);

                  return (
                    <g
                      key={p.pin}
                      transform={`translate(0, ${p.y})`}
                      onClick={() => setSelectedPin(p.pin)}
                      className="cursor-pointer group"
                      opacity={isDimmed ? 0.25 : 1}
                    >
                      {/* Pin wire lead extending left */}
                      <line
                        x1="-25"
                        y1="0"
                        x2="0"
                        y2="0"
                        stroke={
                          isSelected
                            ? '#F59E0B'
                            : isInactiveIn4Bit
                            ? '#94A3B8'
                            : p.symbol.startsWith('D')
                            ? '#2563EB'
                            : p.symbol === 'RS'
                            ? '#059669'
                            : p.symbol === 'RW'
                            ? '#D97706'
                            : p.symbol === 'EN'
                            ? '#7C3AED'
                            : p.symbol.includes('V') || p.symbol.includes('LED')
                            ? '#DC2626'
                            : '#64748B'
                        }
                        strokeWidth={isSelected ? 3 : isInactiveIn4Bit ? 1.2 : 2}
                        strokeDasharray={isInactiveIn4Bit ? '2,2' : 'none'}
                      />
                      <circle
                        cx="-25"
                        cy="0"
                        r={isSelected ? 4.5 : 3}
                        fill={isSelected ? '#F59E0B' : '#E2E8F0'}
                        stroke="#0F172A"
                        strokeWidth="1"
                      />

                      {/* Pin Row Background Highlight */}
                      <rect
                        x="2"
                        y="-9"
                        width="270"
                        height="18"
                        rx="3"
                        fill={isSelected ? '#047857' : 'transparent'}
                        className="group-hover:fill-[#047857]/50 transition-colors"
                      />

                      {/* Pin Number */}
                      <text x="6" y="3.5" fill={isSelected ? '#FDE047' : '#A7F3D0'} fontSize="9" fontWeight="bold">
                        {p.pin}:
                      </text>

                      {/* Pin Symbol */}
                      <text x="24" y="3.5" fill={isSelected ? '#FFFFFF' : '#F8FAFC'} fontSize="9" fontWeight="bold">
                        {p.symbol}
                      </text>

                      {/* Pin Name */}
                      <text x="68" y="3.5" fill={isInactiveIn4Bit ? '#94A3B8' : isSelected ? '#A7F3D0' : '#CBD5E1'} fontSize="8">
                        {isInactiveIn4Bit ? 'NC / Tied to GND (P1 Free)' : p.name}
                      </text>

                      {/* Mode Badge */}
                      {isInactiveIn4Bit && (
                        <text x="225" y="3.5" fill="#F87171" fontSize="7.5" fontWeight="bold">
                          GND
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            </g>

            {/* ========================================================================= */}
            {/* 4. SIGNAL BUS WIRING INTERCONNECTIONS (PERFECTLY STRAIGHT & ZERO OVERLAP) */}
            {/* ========================================================================= */}

            {/* ------------------------------------------------------------------------- */}
            {/* 4A. POWER & CONTRAST (TOP REGION: PINS 1, 2, 3) - NO INTERSECTION         */}
            {/* ------------------------------------------------------------------------- */}
            <g opacity={wireFilter === 'data_bus' || wireFilter === 'control_bus' ? 0.15 : 1}>
              {/* LCD Pin 1: VSS -> Ground (Global y = 65) */}
              <line x1="665" y1="65" x2="600" y2="65" stroke="#64748B" strokeWidth="2" />
              <line x1="600" y1="59" x2="600" y2="71" stroke="#64748B" strokeWidth="2.5" />
              <line x1="596" y1="62" x2="596" y2="68" stroke="#64748B" strokeWidth="2" />
              <line x1="592" y1="64" x2="592" y2="66" stroke="#64748B" strokeWidth="1.5" />
              <text x="585" y="68" fill="#64748B" fontSize="8" fontWeight="bold" textAnchor="end">VSS (GND 0V)</text>

              {/* LCD Pin 2: VDD -> +5V VCC (Global y = 90) */}
              <line x1="665" y1="90" x2="570" y2="90" stroke="#DC2626" strokeWidth="2" />
              <circle cx="566" cy="90" r="4" fill="#DC2626" />
              <text x="556" y="93" fill="#DC2626" fontSize="8.5" fontWeight="bold" textAnchor="end">VDD (+5V VCC)</text>

              {/* LCD Pin 3: VEE / V0 -> Tied directly to GND (Global y = 115) - NO TRIMMER */}
              <line x1="665" y1="115" x2="580" y2="115" stroke="#0284C7" strokeWidth="2" />
              <line x1="580" y1="109" x2="580" y2="121" stroke="#0284C7" strokeWidth="2.5" />
              <line x1="576" y1="112" x2="576" y2="118" stroke="#0284C7" strokeWidth="2" />
              <line x1="572" y1="114" x2="572" y2="116" stroke="#0284C7" strokeWidth="1.5" />
              <rect x="420" y="106" width="145" height="18" rx="3" fill="#F0F9FF" stroke="#0284C7" strokeWidth="1" />
              <text x="492" y="118" fill="#0369A1" fontSize="7.5" fontWeight="bold" textAnchor="middle">
                V0 → GND (Direct Full Contrast)
              </text>
            </g>

            {/* ------------------------------------------------------------------------- */}
            {/* 4B. CONTROL LINES (RS, RW, EN) - 100% STRAIGHT HORIZONTAL CONNECTIONS    */}
            {/* MCU Pin 21 (P2.0), Pin 22 (P2.1), Pin 23 (P2.2) at y = 145, 172, 199      */}
            {/* LCD Pin 4 (RS), Pin 5 (RW), Pin 6 (EN) at y = 145, 172, 199               */}
            {/* ------------------------------------------------------------------------- */}
            <g opacity={wireFilter === 'data_bus' || wireFilter === 'power_clock' ? 0.15 : 1}>
              {/* RS: P2.0 (x=330, y=145) -> LCD Pin 4 (x=665, y=145) */}
              <line x1="330" y1="145" x2="665" y2="145" stroke="#059669" strokeWidth="2.5" />
              <rect x="445" y="136" width="110" height="18" rx="3" fill="#ECFDF5" stroke="#059669" strokeWidth="1" />
              <text x="500" y="148" fill="#065F46" fontSize="8" fontWeight="bold" textAnchor="middle">
                RS: P2.0 → Pin 4 (Cmd/Data)
              </text>

              {/* RW: P2.1 (x=330, y=172) -> LCD Pin 5 (x=665, y=172) */}
              <line x1="330" y1="172" x2="665" y2="172" stroke="#D97706" strokeWidth="2.5" />
              <rect x="445" y="163" width="110" height="18" rx="3" fill="#FFFBEB" stroke="#D97706" strokeWidth="1" />
              <text x="500" y="175" fill="#92400E" fontSize="8" fontWeight="bold" textAnchor="middle">
                RW: P2.1 → Pin 5 (Write: 0V)
              </text>

              {/* EN: P2.2 (x=330, y=199) -> LCD Pin 6 (x=665, y=199) */}
              <line x1="330" y1="199" x2="665" y2="199" stroke="#7C3AED" strokeWidth="2.5" />
              <rect x="445" y="190" width="110" height="18" rx="3" fill="#F5F3FF" stroke="#7C3AED" strokeWidth="1" />
              <text x="500" y="202" fill="#5B21B6" fontSize="8" fontWeight="bold" textAnchor="middle">
                EN: P2.2 → Pin 6 (Strobe 1→0)
              </text>
            </g>

            {/* ------------------------------------------------------------------------- */}
            {/* 4C. DATA BUS LINES (D0..D7) - 100% STRAIGHT HORIZONTAL CONNECTIONS        */}
            {/* MCU Pin 1..8 (P1.0..P1.7) at y = 235, 260, 285, 310, 335, 360, 385, 410  */}
            {/* LCD Pin 7..14 (D0..D7) at y = 235, 260, 285, 310, 335, 360, 385, 410    */}
            {/* ------------------------------------------------------------------------- */}
            <g opacity={wireFilter === 'control_bus' || wireFilter === 'power_clock' ? 0.15 : 1}>
              {/* D0: P1.0 to LCD Pin 7 (y = 235) */}
              {!is4Bit ? (
                <g>
                  <line x1="330" y1="235" x2="665" y2="235" stroke="#2563EB" strokeWidth="2" />
                  <rect x="465" y="227" width="70" height="16" rx="2" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="0.8" />
                  <text x="500" y="238" fill="#1E40AF" fontSize="7.5" fontWeight="bold" textAnchor="middle">D0 (P1.0)</text>
                </g>
              ) : (
                <g>
                  <line x1="665" y1="235" x2="620" y2="235" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3,2" />
                  <line x1="620" y1="235" x2="620" y2="320" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3,2" />
                </g>
              )}

              {/* D1: P1.1 to LCD Pin 8 (y = 260) */}
              {!is4Bit ? (
                <g>
                  <line x1="330" y1="260" x2="665" y2="260" stroke="#2563EB" strokeWidth="2" />
                  <rect x="465" y="252" width="70" height="16" rx="2" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="0.8" />
                  <text x="500" y="263" fill="#1E40AF" fontSize="7.5" fontWeight="bold" textAnchor="middle">D1 (P1.1)</text>
                </g>
              ) : (
                <g>
                  <line x1="665" y1="260" x2="620" y2="260" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3,2" />
                </g>
              )}

              {/* D2: P1.2 to LCD Pin 9 (y = 285) */}
              {!is4Bit ? (
                <g>
                  <line x1="330" y1="285" x2="665" y2="285" stroke="#2563EB" strokeWidth="2" />
                  <rect x="465" y="277" width="70" height="16" rx="2" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="0.8" />
                  <text x="500" y="288" fill="#1E40AF" fontSize="7.5" fontWeight="bold" textAnchor="middle">D2 (P1.2)</text>
                </g>
              ) : (
                <g>
                  <line x1="665" y1="285" x2="620" y2="285" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3,2" />
                </g>
              )}

              {/* D3: P1.3 to LCD Pin 10 (y = 310) */}
              {!is4Bit ? (
                <g>
                  <line x1="330" y1="310" x2="665" y2="310" stroke="#2563EB" strokeWidth="2" />
                  <rect x="465" y="302" width="70" height="16" rx="2" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="0.8" />
                  <text x="500" y="313" fill="#1E40AF" fontSize="7.5" fontWeight="bold" textAnchor="middle">D3 (P1.3)</text>
                </g>
              ) : (
                <g>
                  <line x1="665" y1="310" x2="620" y2="310" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3,2" />
                  {/* Ground symbol for D0..D3 in 4-bit mode */}
                  <line x1="614" y1="320" x2="626" y2="320" stroke="#94A3B8" strokeWidth="2" />
                  <line x1="616" y1="323" x2="624" y2="323" stroke="#94A3B8" strokeWidth="1.5" />
                  <line x1="618" y1="326" x2="622" y2="326" stroke="#94A3B8" strokeWidth="1" />
                  <rect x="420" y="268" width="185" height="24" rx="4" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1" />
                  <text x="512" y="283" fill="#64748B" fontSize="8" fontWeight="bold" textAnchor="middle">
                    D0–D3 Tied to GND (P1.0–P1.3 Free)
                  </text>
                </g>
              )}

              {/* D4: P1.4 to LCD Pin 11 (y = 335) */}
              <line x1="330" y1="335" x2="665" y2="335" stroke="#2563EB" strokeWidth={is4Bit ? 2.5 : 2} />
              <rect x="465" y="327" width="70" height="16" rx="2" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="0.8" />
              <text x="500" y="338" fill="#1E40AF" fontSize="7.5" fontWeight="bold" textAnchor="middle">D4 (P1.4)</text>

              {/* D5: P1.5 to LCD Pin 12 (y = 360) */}
              <line x1="330" y1="360" x2="665" y2="360" stroke="#2563EB" strokeWidth={is4Bit ? 2.5 : 2} />
              <rect x="465" y="352" width="70" height="16" rx="2" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="0.8" />
              <text x="500" y="363" fill="#1E40AF" fontSize="7.5" fontWeight="bold" textAnchor="middle">D5 (P1.5)</text>

              {/* D6: P1.6 to LCD Pin 13 (y = 385) */}
              <line x1="330" y1="385" x2="665" y2="385" stroke="#2563EB" strokeWidth={is4Bit ? 2.5 : 2} />
              <rect x="465" y="377" width="70" height="16" rx="2" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="0.8" />
              <text x="500" y="388" fill="#1E40AF" fontSize="7.5" fontWeight="bold" textAnchor="middle">D6 (P1.6)</text>

              {/* D7: P1.7 to LCD Pin 14 (y = 410) */}
              <line x1="330" y1="410" x2="665" y2="410" stroke="#2563EB" strokeWidth={is4Bit ? 2.5 : 2} />
              <rect x="465" y="402" width="70" height="16" rx="2" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="0.8" />
              <text x="500" y="413" fill="#1E40AF" fontSize="7.5" fontWeight="bold" textAnchor="middle">D7 (P1.7)</text>
            </g>

            {/* ------------------------------------------------------------------------- */}
            {/* 4D. BACKLIGHT POWER (BOTTOM REGION: PINS 15, 16) - NO INTERSECTION        */}
            {/* ------------------------------------------------------------------------- */}
            <g opacity={wireFilter === 'data_bus' || wireFilter === 'control_bus' ? 0.15 : 1}>
              {/* LCD Pin 15: LED+ -> +5V via 220Ω Current Limiter Resistor (Global y = 445) */}
              <line x1="665" y1="445" x2="585" y2="445" stroke="#DC2626" strokeWidth="2" />
              {/* 220Ω Resistor Box */}
              <rect x="535" y="437" width="50" height="16" rx="2" fill="#FEE2E2" stroke="#DC2626" strokeWidth="1.5" />
              <text x="560" y="449" fill="#991B1B" fontSize="7.5" fontWeight="bold" textAnchor="middle">220Ω</text>
              <line x1="535" y1="445" x2="495" y2="445" stroke="#DC2626" strokeWidth="2" />
              <circle cx="491" cy="445" r="4" fill="#DC2626" />
              <text x="481" y="448" fill="#DC2626" fontSize="8" fontWeight="bold" textAnchor="end">+5V VCC</text>

              {/* LCD Pin 16: LED- -> GND (Global y = 470) */}
              <line x1="665" y1="470" x2="600" y2="470" stroke="#64748B" strokeWidth="2" />
              <line x1="600" y1="464" x2="600" y2="476" stroke="#64748B" strokeWidth="2.5" />
              <line x1="596" y1="467" x2="596" y2="473" stroke="#64748B" strokeWidth="2" />
              <line x1="592" y1="469" x2="592" y2="471" stroke="#64748B" strokeWidth="1.5" />
              <text x="585" y="473" fill="#64748B" fontSize="8" fontWeight="bold" textAnchor="end">LED- (GND)</text>
            </g>
          </svg>
        </div>

        {/* Interactive Pin Inspector Card */}
        {activePinData && (
          <div className="bg-[#EAF4FB]/60 rounded-xl p-3 border border-[#B8D4E8] space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#2563EB] text-white font-mono font-bold text-xs flex items-center justify-center">
                  {activePinData.pin}
                </span>
                <span className="font-mono font-bold text-[#163A5F] text-sm">
                  LCD Pin {activePinData.pin}: <code className="text-[#2563EB]">{activePinData.symbol}</code> ({activePinData.name})
                </span>
              </div>

              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <span className="px-2 py-0.5 rounded bg-white border border-[#B8D4E8] text-[#163A5F] font-semibold">
                  Hardware Wire: <strong>{activePinData.mcuConnection}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold border border-blue-200">
                  {activePinData.voltageLevel}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#1F2937] leading-relaxed">
              {is4Bit ? activePinData.role4Bit : activePinData.role8Bit}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-[#B8D4E8]/60 text-[11px] font-mono">
              <div className="flex items-center gap-1.5 text-[#163A5F]">
                <span className="text-[#52799F] font-bold">Assembly Driving Instruction:</span>
                <code className="bg-white px-2 py-0.5 rounded border border-[#B8D4E8] text-[#2563EB] font-bold">
                  {activePinData.instructions}
                </code>
              </div>
              <span className="text-[#52799F] text-[10px]">
                Click on any pin in the diagram or table below to inspect details
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Comprehensive Pin Connection Matrix Table */}
      <div className="bg-white rounded-2xl p-3.5 border border-[#B8D4E8] shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#163A5F] font-mono text-xs font-bold uppercase tracking-wider">
            <Table className="w-4 h-4 text-[#2563EB]" />
            <span>Complete Hardware Pin Interfacing Matrix (LCD Header Pin 1..16)</span>
          </div>
          <span className="text-[11px] font-mono text-[#52799F]">
            {is4Bit ? '4-Bit Mode: 7 Active I/O Lines' : '8-Bit Mode: 11 Active I/O Lines'}
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#B8D4E8]">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#EAF4FB] text-[#163A5F] border-b border-[#B8D4E8]">
              <tr>
                <th className="p-2 w-12 text-center">Pin #</th>
                <th className="p-2 w-20">Symbol</th>
                <th className="p-2 w-48">8051 Pin & Port / Rail</th>
                <th className="p-2 w-28">Direction</th>
                <th className="p-2 w-40">Voltage Level</th>
                <th className="p-2">Role in {is4Bit ? '4-Bit Mode' : '8-Bit Mode'}</th>
                <th className="p-2 w-48">Assembly Instruction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#B8D4E8]/60">
              {LCD_PINOUT_DATA.map((p) => {
                const isSelected = selectedPin === p.pin;
                const isUnused = is4Bit && ['D0', 'D1', 'D2', 'D3'].includes(p.symbol);

                return (
                  <tr
                    key={p.pin}
                    onClick={() => setSelectedPin(p.pin)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50/80 font-semibold'
                        : isUnused
                        ? 'bg-slate-50/60 text-slate-400'
                        : 'hover:bg-[#EAF4FB]/50'
                    }`}
                  >
                    <td className="p-2 text-center font-bold text-[#2563EB]">
                      {p.pin}
                    </td>
                    <td className="p-2 font-bold text-[#163A5F]">
                      <span className={`px-1.5 py-0.5 rounded border ${
                        p.symbol.startsWith('D')
                          ? isUnused ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-blue-100 text-blue-800 border-blue-200'
                          : p.symbol === 'RS'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : p.symbol === 'RW'
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : p.symbol === 'EN'
                          ? 'bg-purple-100 text-purple-800 border-purple-200'
                          : 'bg-rose-100 text-rose-800 border-rose-200'
                      }`}>
                        {p.symbol}
                      </span>
                    </td>
                    <td className="p-2 font-semibold text-[#163A5F]">
                      {isUnused ? (
                        <span className="text-emerald-700 font-bold">Unconnected (P1 freed)</span>
                      ) : (
                        p.mcuConnection
                      )}
                    </td>
                    <td className="p-2 text-[#52799F]">
                      {p.direction}
                    </td>
                    <td className="p-2 text-[#163A5F]">
                      {p.voltageLevel}
                    </td>
                    <td className="p-2 text-[#1F2937] font-sans text-xs">
                      {is4Bit ? p.role4Bit : p.role8Bit}
                    </td>
                    <td className="p-2 text-[#2563EB] font-bold">
                      <code>{p.instructions}</code>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Subsystem Hardware Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Card 1: Control Lines Timing & Strobe Mechanism */}
        <div className="bg-white rounded-2xl p-3.5 border border-[#B8D4E8] shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-[#163A5F] font-mono text-xs font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4 text-[#2563EB]" />
            <span>Control Signals & High-to-Low Strobe Timing</span>
          </div>

          <div className="space-y-2 text-xs text-[#1F2937] leading-relaxed">
            <div className="p-2.5 rounded-xl bg-[#EAF4FB]/50 border border-[#B8D4E8] space-y-1 font-mono">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-emerald-700 font-bold">RS (Register Select - P2.0):</span>
                <span className="text-[#163A5F]">0 = Instruction Reg (IR) | 1 = Data Reg (DR)</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-amber-700 font-bold">RW (Read/Write - P2.1):</span>
                <span className="text-[#163A5F]">0 = Write to LCD | 1 = Read Busy Flag / RAM</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-purple-700 font-bold">EN (Enable Strobe - P2.2):</span>
                <span className="text-[#163A5F]">High-to-Low Pulse (min pulse width tpw ≥ 450 ns)</span>
              </div>
            </div>

            <p className="font-sans">
              The Hitachi HD44780 controller latches the byte present on the data pins on the <strong>falling edge (1 → 0 transition)</strong> of the Enable (EN) pulse.
              In 8051 assembly, the pulse is generated using:
            </p>
            <div className="p-2 rounded-lg bg-[#0F172A] text-[#38BDF8] font-mono text-xs space-y-0.5">
              <p>SETB P2.2        ; Drive EN = 1 (High)</p>
              <p>ACALL DELAY      ; Hold High for ≥ 450 ns</p>
              <p>CLR P2.2         ; Falling edge 1-&gt;0 latches data into LCD</p>
            </div>
          </div>
        </div>

        {/* Card 2: 4-Bit vs 8-Bit Interfacing Comparison / Mode Specifics */}
        <div className="bg-white rounded-2xl p-3.5 border border-[#B8D4E8] shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-[#163A5F] font-mono text-xs font-bold uppercase tracking-wider">
            <SlidersHorizontal className="w-4 h-4 text-[#2563EB]" />
            <span>{is4Bit ? '4-Bit Dual-Nibble Protocol Mechanics' : '8-Bit Single-Cycle Transfer Mechanics'}</span>
          </div>

          <div className="space-y-2 text-xs text-[#1F2937] leading-relaxed">
            {is4Bit ? (
              <>
                <p className="font-sans">
                  In <strong>4-Bit Mode</strong>, every 8-bit command or ASCII character byte is split into two consecutive 4-bit nibbles sent over lines <strong>P1.4–P1.7</strong>:
                </p>
                <ol className="list-decimal list-inside space-y-1 font-mono text-[11px] text-[#163A5F] bg-[#EAF4FB]/50 p-2.5 rounded-xl border border-[#B8D4E8]">
                  <li><strong>Upper Nibble (Bits 7..4):</strong> Output directly on P1.4–P1.7, strobe EN (1→0).</li>
                  <li><strong>Lower Nibble (Bits 3..0):</strong> Executed via <code>SWAP A</code> to place bits 3..0 into bits 7..4, output on P1.4–P1.7, strobe EN (1→0).</li>
                  <li><strong>Power-on Initialization:</strong> Special sequence (33H, 32H, 28H) forces LCD controller into 4-bit mode reliably.</li>
                </ol>
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] font-mono">
                  ★ <strong>Pin Economy Advantage:</strong> Saves 4 I/O pins (P1.0–P1.3) on the 8051 for keypad matrix or ADC sensors.
                </div>
              </>
            ) : (
              <>
                <p className="font-sans">
                  In <strong>8-Bit Mode</strong>, the complete 8-bit ASCII character or configuration command byte is transferred directly in a single strobe cycle:
                </p>
                <ul className="space-y-1 font-mono text-[11px] text-[#163A5F] bg-[#EAF4FB]/50 p-2.5 rounded-xl border border-[#B8D4E8]">
                  <li>• <strong>Data Bus:</strong> Full Port P1 (P1.0 to P1.7) connected directly to LCD D0 to D7.</li>
                  <li>• <strong>Initialization Command:</strong> <code>38H</code> (2 lines, 5×7 character font, 8-bit bus mode).</li>
                  <li>• <strong>Speed:</strong> Maximum data throughput since each character requires only 1 Enable pulse instead of 2.</li>
                </ul>
                <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-[11px] font-mono">
                  ★ <strong>Single Strobe Transfer:</strong> Simpler assembly code with direct <code>MOV P1, A</code> instructions.
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 5. Physical Lab Hardware Wiring Checklist & Diagnostics */}
      <div className="bg-[#EAF4FB]/40 rounded-2xl p-3.5 border border-[#B8D4E8] shadow-2xs space-y-2">
        <div className="flex items-center gap-2 text-[#163A5F] font-mono text-xs font-bold uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Hardware Breadboard & Proteus EDA Wiring Checklist</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 font-mono text-xs">
          <div className="p-2.5 rounded-xl bg-white border border-[#B8D4E8] space-y-1">
            <span className="text-[11px] font-bold text-[#2563EB] block">1. Contrast (V0) Grounding</span>
            <p className="text-[11px] text-[#52799F] font-sans">
              Connect Pin 3 (V0) directly to Ground (0V) for standard fixed high-contrast display without an external potentiometer.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-[#B8D4E8] space-y-1">
            <span className="text-[11px] font-bold text-[#2563EB] block">2. EA Pin Pull-Up</span>
            <p className="text-[11px] text-[#52799F] font-sans">
              Pin 31 (EA#/VPP) of 8051 MUST be connected to +5V (VCC) to execute program from on-chip Flash ROM.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-[#B8D4E8] space-y-1">
            <span className="text-[11px] font-bold text-[#2563EB] block">3. Reset Timing</span>
            <p className="text-[11px] text-[#52799F] font-sans">
              Ensure Pin 9 (RST) has 10µF cap to VCC and 10kΩ to GND for 100 ms power-on reset stabilization before LCD commands.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-[#B8D4E8] space-y-1">
            <span className="text-[11px] font-bold text-[#2563EB] block">4. Backlight Protection</span>
            <p className="text-[11px] text-[#52799F] font-sans">
              Always place a 220Ω or 330Ω current-limiting resistor between +5V and Pin 15 (LED+) to prevent LED burnout.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
