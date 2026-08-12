import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Cpu,
  Info,
  Layers,
  Zap,
  Activity,
  Sliders,
  CheckCircle2,
  HelpCircle,
  Clock,
  Binary,
  ArrowRightLeft,
  Settings
} from 'lucide-react';

interface PinData {
  num: number;
  minName: string;
  maxName: string;
  category: 'address-data' | 'control' | 'status' | 'system' | 'power';
  direction: 'Input' | 'Output' | 'Bi-directional' | 'Power';
  desc: string;
  minDetail: string;
  maxDetail: string;
}

const PIN_LIST: PinData[] = [
  // Left side: Pins 1 to 20
  {
    num: 1,
    minName: 'GND',
    maxName: 'GND',
    category: 'power',
    direction: 'Power',
    desc: 'Ground connection (0V reference).',
    minDetail: 'Ground connection to common power supply line.',
    maxDetail: 'Ground connection to common power supply line.'
  },
  {
    num: 2,
    minName: 'AD14',
    maxName: 'AD14',
    category: 'address-data',
    direction: 'Bi-directional',
    desc: 'Address/Data Line 14 (Multiplexed).',
    minDetail: 'T1: Output Address bit A14. T2-T4: Input/Output Data bit D14.',
    maxDetail: 'T1: Output Address bit A14. T2-T4: Input/Output Data bit D14.'
  },
  {
    num: 3,
    minName: 'AD13',
    maxName: 'AD13',
    category: 'address-data',
    direction: 'Bi-directional',
    desc: 'Address/Data Line 13 (Multiplexed).',
    minDetail: 'T1: Output Address bit A13. T2-T4: Input/Output Data bit D13.',
    maxDetail: 'T1: Output Address bit A13. T2-T4: Input/Output Data bit D13.'
  },
  {
    num: 4,
    minName: 'AD12',
    maxName: 'AD12',
    category: 'address-data',
    direction: 'Bi-directional',
    desc: 'Address/Data Line 12 (Multiplexed).',
    minDetail: 'T1: Output Address bit A12. T2-T4: Input/Output Data bit D12.',
    maxDetail: 'T1: Output Address bit A12. T2-T4: Input/Output Data bit D12.'
  },
  {
    num: 5,
    minName: 'AD11',
    maxName: 'AD11',
    category: 'address-data',
    direction: 'Bi-directional',
    desc: 'Address/Data Line 11 (Multiplexed).',
    minDetail: 'T1: Output Address bit A11. T2-T4: Input/Output Data bit D11.',
    maxDetail: 'T1: Output Address bit A11. T2-T4: Input/Output Data bit D11.'
  },
  {
    num: 6,
    minName: 'AD10',
    maxName: 'AD10',
    category: 'address-data',
    direction: 'Bi-directional',
    desc: 'Address/Data Line 10 (Multiplexed).',
    minDetail: 'T1: Output Address bit A10. T2-T4: Input/Output Data bit D10.',
    maxDetail: 'T1: Output Address bit A10. T2-T4: Input/Output Data bit D10.'
  },
  {
    num: 7,
    minName: 'AD9',
    maxName: 'AD9',
    category: 'address-data',
    direction: 'Bi-directional',
    desc: 'Address/Data Line 9 (Multiplexed).',
    minDetail: 'T1: Output Address bit A9. T2-T4: Input/Output Data bit D9.',
    maxDetail: 'T1: Output Address bit A9. T2-T4: Input/Output Data bit D9.'
  },
  {
    num: 8,
    minName: 'AD8',
    maxName: 'AD8',
    category: 'address-data',
    direction: 'Bi-directional',
    desc: 'Address/Data Line 8 (Multiplexed).',
    minDetail: 'T1: Output Address bit A8. T2-T4: Input/Output Data bit D8.',
    maxDetail: 'T1: Output Address bit A8. T2-T4: Input/Output Data bit D8.'
  },
  {
    num: 9,
    minName: 'AD7',
    maxName: 'AD7',
    category: 'address-data',
    direction: 'Bi-directional',
    desc: 'Address/Data Line 7 (Multiplexed).',
    minDetail: 'T1: Output Address bit A7. T2-T4: Input/Output Data bit D7.',
    maxDetail: 'T1: Output Address bit A7. T2-T4: Input/Output Data bit D7.'
  },
  {
    num: 10,
    minName: 'AD6',
    maxName: 'AD6',
    category: 'address-data',
    direction: 'Bi-directional',
    desc: 'Address/Data Line 6 (Multiplexed).',
    minDetail: 'T1: Output Address bit A6. T2-T4: Input/Output Data bit D6.',
    maxDetail: 'T1: Output Address bit A6. T2-T4: Input/Output Data bit D6.'
  },
  {
    num: 11,
    minName: 'AD5',
    maxName: 'AD5',
    category: 'address-data',
    direction: 'Bi-directional',
    desc: 'Address/Data Line 5 (Multiplexed).',
    minDetail: 'T1: Output Address bit A5. T2-T4: Input/Output Data bit D5.',
    maxDetail: 'T1: Output Address bit A5. T2-T4: Input/Output Data bit D5.'
  },
  {
    num: 12,
    minName: 'AD4',
    maxName: 'AD4',
    category: 'address-data',
    direction: 'Bi-directional',
    desc: 'Address/Data Line 4 (Multiplexed).',
    minDetail: 'T1: Output Address bit A4. T2-T4: Input/Output Data bit D4.',
    maxDetail: 'T1: Output Address bit A4. T2-T4: Input/Output Data bit D4.'
  },
  {
    num: 13,
    minName: 'AD3',
    maxName: 'AD3',
    category: 'address-data',
    direction: 'Bi-directional',
    desc: 'Address/Data Line 3 (Multiplexed).',
    minDetail: 'T1: Output Address bit A3. T2-T4: Input/Output Data bit D3.',
    maxDetail: 'T1: Output Address bit A3. T2-T4: Input/Output Data bit D3.'
  },
  {
    num: 14,
    minName: 'AD2',
    maxName: 'AD2',
    category: 'address-data',
    direction: 'Bi-directional',
    desc: 'Address/Data Line 2 (Multiplexed).',
    minDetail: 'T1: Output Address bit A2. T2-T4: Input/Output Data bit D2.',
    maxDetail: 'T1: Output Address bit A2. T2-T4: Input/Output Data bit D2.'
  },
  {
    num: 15,
    minName: 'AD1',
    maxName: 'AD1',
    category: 'address-data',
    direction: 'Bi-directional',
    desc: 'Address/Data Line 1 (Multiplexed).',
    minDetail: 'T1: Output Address bit A1. T2-T4: Input/Output Data bit D1.',
    maxDetail: 'T1: Output Address bit A1. T2-T4: Input/Output Data bit D1.'
  },
  {
    num: 16,
    minName: 'AD0',
    maxName: 'AD0',
    category: 'address-data',
    direction: 'Bi-directional',
    desc: 'Address/Data Line 0 (Multiplexed).',
    minDetail: 'T1: Output Address bit A0. T2-T4: Input/Output Data bit D0.',
    maxDetail: 'T1: Output Address bit A0. T2-T4: Input/Output Data bit D0.'
  },
  {
    num: 17,
    minName: 'NMI',
    maxName: 'NMI',
    category: 'system',
    direction: 'Input',
    desc: 'Non-Maskable Interrupt request.',
    minDetail: 'Edge-triggered interrupt. Vector 2. Cannot be masked by IF flag.',
    maxDetail: 'Edge-triggered interrupt. Vector 2. Cannot be masked by IF flag.'
  },
  {
    num: 18,
    minName: 'INTR',
    maxName: 'INTR',
    category: 'system',
    direction: 'Input',
    desc: 'Maskable Interrupt Request.',
    minDetail: 'Level-triggered interrupt input. Sampled during last clock cycle of instruction.',
    maxDetail: 'Level-triggered interrupt input. Sampled during last clock cycle of instruction.'
  },
  {
    num: 19,
    minName: 'CLK',
    maxName: 'CLK',
    category: 'power',
    direction: 'Input',
    desc: 'System Clock input (33% duty cycle).',
    minDetail: 'Provided by 8284 Clock Generator. Typically 5 MHz, 8 MHz or 10 MHz.',
    maxDetail: 'Provided by 8284 Clock Generator. Typically 5 MHz, 8 MHz or 10 MHz.'
  },
  {
    num: 20,
    minName: 'GND',
    maxName: 'GND',
    category: 'power',
    direction: 'Power',
    desc: 'Ground connection (0V reference).',
    minDetail: 'Second ground pin for balanced power plane.',
    maxDetail: 'Second ground pin for balanced power plane.'
  },

  // Right side: Pins 21 to 40 (Top to bottom)
  {
    num: 21,
    minName: 'RESET',
    maxName: 'RESET',
    category: 'system',
    direction: 'Input',
    desc: 'System Reset signal.',
    minDetail: 'Must be active high for at least 4 clock cycles. Sets CS=FFFFh, IP=0000h.',
    maxDetail: 'Must be active high for at least 4 clock cycles. Sets CS=FFFFh, IP=0000h.'
  },
  {
    num: 22,
    minName: 'READY',
    maxName: 'READY',
    category: 'system',
    direction: 'Input',
    desc: 'Bus Ready acknowledge signal from memory/peripherals.',
    minDetail: 'Used to insert wait states (TW) when interfacing slow memory/IO.',
    maxDetail: 'Used to insert wait states (TW) when interfacing slow memory/IO.'
  },
  {
    num: 23,
    minName: '/TEST',
    maxName: '/TEST',
    category: 'control',
    direction: 'Input',
    desc: 'Test input sampled by WAIT instruction.',
    minDetail: 'If LOW, execution continues. Used to synchronize with 8087 math coprocessor.',
    maxDetail: 'If LOW, execution continues. Used to synchronize with 8087 math coprocessor.'
  },
  {
    num: 24,
    minName: 'INTA',
    maxName: 'QS1',
    category: 'status',
    direction: 'Output',
    desc: 'Min: Interrupt Acknowledge | Max: Queue Status 1',
    minDetail: 'MIN MODE: Output pulse acknowledging INTR to request vector byte from 8259A.',
    maxDetail: 'MAX MODE: QS1 status bit outputting instruction prefetch queue activity state.'
  },
  {
    num: 25,
    minName: 'ALE',
    maxName: 'QS0',
    category: 'control',
    direction: 'Output',
    desc: 'Min: Address Latch Enable | Max: Queue Status 0',
    minDetail: 'MIN MODE: High pulse demultiplexes AD0-AD15 address into 8282 latches.',
    maxDetail: 'MAX MODE: QS0 status bit indicating opcode/byte queue operations.'
  },
  {
    num: 26,
    minName: '/DEN',
    maxName: '/S0',
    category: 'control',
    direction: 'Output',
    desc: 'Min: Data Enable | Max: Status Line 0',
    minDetail: 'MIN MODE: Active-low enable for 8286 data bus transceivers during T2-T4.',
    maxDetail: 'MAX MODE: Output status line 0 sent to 8288 Bus Controller.'
  },
  {
    num: 27,
    minName: 'DT//R',
    maxName: '/S1',
    category: 'control',
    direction: 'Output',
    desc: 'Min: Data Transmit/Receive | Max: Status Line 1',
    minDetail: 'MIN MODE: Transceiver direction control (HIGH=Transmit, LOW=Receive).',
    maxDetail: 'MAX MODE: Output status line 1 sent to 8288 Bus Controller.'
  },
  {
    num: 28,
    minName: 'M//IO',
    maxName: '/S2',
    category: 'control',
    direction: 'Output',
    desc: 'Min: Memory / I/O space select | Max: Status Line 2',
    minDetail: 'MIN MODE: Memory access when HIGH (1), I/O port access when LOW (0).',
    maxDetail: 'MAX MODE: Output status line 2 encoding machine cycle classification.'
  },
  {
    num: 29,
    minName: '/WR',
    maxName: '/LOCK',
    category: 'control',
    direction: 'Output',
    desc: 'Min: Write Strobe | Max: Bus Lock Output',
    minDetail: 'MIN MODE: Active-low strobe indicating processor is writing data to bus.',
    maxDetail: 'MAX MODE: Active-low signal generated by LOCK prefix to prevent bus takeover.'
  },
  {
    num: 30,
    minName: 'HLDA',
    maxName: '/RQ//GT1',
    category: 'control',
    direction: 'Output',
    desc: 'Min: Hold Acknowledge | Max: Request/Grant 1',
    minDetail: 'MIN MODE: High output acknowledging HOLD and releasing system buses.',
    maxDetail: 'MAX MODE: Bidirectional bus request/grant line 1 for multiprocessor arbitration.'
  },
  {
    num: 31,
    minName: 'HOLD',
    maxName: '/RQ//GT0',
    category: 'control',
    direction: 'Input',
    desc: 'Min: Hold Request | Max: Request/Grant 0',
    minDetail: 'MIN MODE: High input from DMA controller (8237) requesting bus control.',
    maxDetail: 'MAX MODE: Bidirectional bus request/grant line 0 (higher priority than RQ/GT1).'
  },
  {
    num: 32,
    minName: '/RD',
    maxName: '/RD',
    category: 'control',
    direction: 'Output',
    desc: 'Read Strobe signal.',
    minDetail: 'Active-low signal indicating processor is reading data from memory/IO.',
    maxDetail: 'Active-low read strobe generated directly by CPU in both modes.'
  },
  {
    num: 33,
    minName: 'MN//MX',
    maxName: 'MN//MX',
    category: 'system',
    direction: 'Input',
    desc: 'Minimum / Maximum Mode selection pin.',
    minDetail: 'Wired directly to Vcc (+5V) to configure CPU for Minimum Mode operation.',
    maxDetail: 'Wired directly to GND (0V) to configure CPU for Maximum Mode (Multiprocessor).'
  },
  {
    num: 34,
    minName: '/BHE / S7',
    maxName: '/BHE / S7',
    category: 'address-data',
    direction: 'Output',
    desc: 'Bus High Enable / Status Line S7.',
    minDetail: 'T1: Active-low enable for high byte data bus (D8-D15). T2-T4: Status output S7.',
    maxDetail: 'T1: Active-low enable for high byte data bus (D8-D15). T2-T4: Status output S7.'
  },
  {
    num: 35,
    minName: 'A19 / S6',
    maxName: 'A19 / S6',
    category: 'address-data',
    direction: 'Output',
    desc: 'Address Line 19 / Status Line 6.',
    minDetail: 'T1: Upper address bit A19. T2-T4: Status S6 (always LOW on 8086).',
    maxDetail: 'T1: Upper address bit A19. T2-T4: Status S6 (always LOW on 8086).'
  },
  {
    num: 36,
    minName: 'A18 / S5',
    maxName: 'A18 / S5',
    category: 'address-data',
    direction: 'Output',
    desc: 'Address Line 18 / Status Line 5.',
    minDetail: 'T1: Upper address bit A18. T2-T4: Status S5 (reflects Interrupt Enable IF flag).',
    maxDetail: 'T1: Upper address bit A18. T2-T4: Status S5 (reflects Interrupt Enable IF flag).'
  },
  {
    num: 37,
    minName: 'A17 / S4',
    maxName: 'A17 / S4',
    category: 'address-data',
    direction: 'Output',
    desc: 'Address Line 17 / Status Line 4.',
    minDetail: 'T1: Upper address bit A17. T2-T4: Status S4 (S3/S4 encode active segment register).',
    maxDetail: 'T1: Upper address bit A17. T2-T4: Status S4 (S3/S4 encode active segment register).'
  },
  {
    num: 38,
    minName: 'A16 / S3',
    maxName: 'A16 / S3',
    category: 'address-data',
    direction: 'Output',
    desc: 'Address Line 16 / Status Line 3.',
    minDetail: 'T1: Upper address bit A16. T2-T4: Status S3 (S3/S4 encode active segment register).',
    maxDetail: 'T1: Upper address bit A16. T2-T4: Status S3 (S3/S4 encode active segment register).'
  },
  {
    num: 39,
    minName: 'AD15',
    maxName: 'AD15',
    category: 'address-data',
    direction: 'Bi-directional',
    desc: 'Address/Data Line 15 (Multiplexed MSB).',
    minDetail: 'T1: Output Address bit A15. T2-T4: Input/Output Data bit D15.',
    maxDetail: 'T1: Output Address bit A15. T2-T4: Input/Output Data bit D15.'
  },
  {
    num: 40,
    minName: 'VCC',
    maxName: 'VCC',
    category: 'power',
    direction: 'Power',
    desc: 'Primary Power Supply (+5V DC ± 10%).',
    minDetail: 'Main supply input. Operating current approx 340mA.',
    maxDetail: 'Main supply input. Operating current approx 340mA.'
  }
];

export default function PinConfigurationSimulator() {
  const [mode, setMode] = useState<'MIN' | 'MAX'>('MIN');
  const [selectedPinNum, setSelectedPinNum] = useState<number>(25); // Default ALE
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [simCycle, setSimCycle] = useState<'T1' | 'T2' | 'T3' | 'T4'>('T1');
  const [simAction, setSimAction] = useState<'READ' | 'WRITE'>('READ');

  const selectedPin = PIN_LIST.find((p) => p.num === selectedPinNum) || PIN_LIST[24];

  const filteredPins = PIN_LIST.filter((pin) => {
    const name = mode === 'MIN' ? pin.minName : pin.maxName;
    const matchesCat = filterCategory === 'all' || pin.category === filterCategory;
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pin.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pin.num.toString().includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  const getPinColor = (category: string) => {
    switch (category) {
      case 'address-data':
        return 'bg-blue-500 hover:bg-blue-600 border-blue-600 text-white';
      case 'control':
        return 'bg-amber-500 hover:bg-amber-600 border-amber-600 text-white';
      case 'status':
        return 'bg-purple-500 hover:bg-purple-600 border-purple-600 text-white';
      case 'system':
        return 'bg-emerald-500 hover:bg-emerald-600 border-emerald-600 text-white';
      case 'power':
        return 'bg-rose-500 hover:bg-rose-600 border-rose-600 text-white';
      default:
        return 'bg-slate-500 hover:bg-slate-600 border-slate-600 text-white';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-7 h-7 text-indigo-400" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              8086 Microprocessor Pin Configuration & Bus Simulator
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Explore 40-pin DIP layout, hardware pin multiplexing, and Minimum vs Maximum mode signals.
          </p>
        </div>

        {/* Operating Mode Toggle */}
        <div className="flex items-center bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60">
          <button
            onClick={() => setMode('MIN')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              mode === 'MIN'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Minimum Mode (MN/MX = 1)
          </button>
          <button
            onClick={() => setMode('MAX')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              mode === 'MAX'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Maximum Mode (MN/MX = 0)
          </button>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 40-Pin DIP Package Visualizer (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950/70 p-5 rounded-xl border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              8086 40-Pin Dual In-line Package (DIP)
            </h3>
            <span className="text-[11px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
              Active Mode: <strong className={mode === 'MIN' ? 'text-indigo-400' : 'text-purple-400'}>{mode === 'MIN' ? 'MIN (Single CPU)' : 'MAX (Multi CPU)'}</strong>
            </span>
          </div>

          {/* IC Container */}
          <div className="relative bg-slate-900 border-2 border-slate-700 rounded-2xl p-4 sm:p-6 shadow-inner">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-4 bg-slate-950 rounded-b-full border-b border-x border-slate-700" />
            <div className="text-center my-2">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest block">INTEL 8086</span>
            </div>

            {/* Pins Grid: Left (1-20) and Right (40-21) */}
            <div className="grid grid-cols-2 gap-x-8 sm:gap-x-12 relative my-4">
              {/* Left Column: Pins 1 to 20 */}
              <div className="space-y-1.5">
                {PIN_LIST.slice(0, 20).map((pin) => {
                  const signalName = mode === 'MIN' ? pin.minName : pin.maxName;
                  const isSelected = selectedPinNum === pin.num;
                  return (
                    <button
                      key={pin.num}
                      onClick={() => setSelectedPinNum(pin.num)}
                      className={`w-full flex items-center justify-between px-2.5 py-1 sm:py-1.5 rounded-lg border text-left text-xs transition-all ${
                        isSelected
                          ? 'ring-2 ring-indigo-400 bg-slate-800 border-indigo-500 font-bold scale-[1.02] shadow-lg'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                      }`}
                    >
                      <span className="font-mono text-slate-400 w-6 text-[11px]">{pin.num}</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${getPinColor(pin.category)}`}>
                        {signalName}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Pins 40 down to 21 */}
              <div className="space-y-1.5">
                {PIN_LIST.slice(20, 40)
                  .reverse()
                  .map((pin) => {
                    const signalName = mode === 'MIN' ? pin.minName : pin.maxName;
                    const isSelected = selectedPinNum === pin.num;
                    return (
                      <button
                        key={pin.num}
                        onClick={() => setSelectedPinNum(pin.num)}
                        className={`w-full flex items-center justify-between px-2.5 py-1 sm:py-1.5 rounded-lg border text-left text-xs transition-all ${
                          isSelected
                            ? 'ring-2 ring-indigo-400 bg-slate-800 border-indigo-500 font-bold scale-[1.02] shadow-lg'
                            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                        }`}
                      >
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${getPinColor(pin.category)}`}>
                          {signalName}
                        </span>
                        <span className="font-mono text-slate-400 w-6 text-right text-[11px]">{pin.num}</span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-slate-800 text-[11px]">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Address/Data</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Control</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Status</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> System</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Power</span>
            </div>
          </div>
        </div>

        {/* Right Column: Pin Inspector & Details (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950/70 p-5 rounded-xl border border-slate-800/80 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Pin Inspector</span>
              <span className="text-xs bg-slate-800 text-indigo-300 font-mono px-2 py-0.5 rounded font-bold border border-slate-700">
                Pin #{selectedPin.num}
              </span>
            </div>

            {/* Selected Pin Card */}
            <div className="mt-4 space-y-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-xl font-extrabold text-white font-mono">
                    {mode === 'MIN' ? selectedPin.minName : selectedPin.maxName}
                  </h4>
                  {selectedPin.minName !== selectedPin.maxName && (
                    <span className="text-xs text-slate-400 font-mono">
                      (Alt: {mode === 'MIN' ? selectedPin.maxName : selectedPin.minName})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-[11px] px-2 py-0.5 rounded font-bold font-mono ${getPinColor(selectedPin.category)}`}>
                    {selectedPin.category.toUpperCase()}
                  </span>
                  <span className="text-[11px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700">
                    Direction: {selectedPin.direction}
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
                <p className="leading-relaxed font-sans">{selectedPin.desc}</p>
              </div>

              {/* Min Mode vs Max Mode Context */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block">
                  Current Mode Operation ({mode} Mode):
                </span>
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed font-mono">
                  {mode === 'MIN' ? selectedPin.minDetail : selectedPin.maxDetail}
                </div>
              </div>
            </div>
          </div>

          {/* Search / Filter Quick Tool */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search pin name or function..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {['all', 'address-data', 'control', 'status', 'system', 'power'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`text-[10px] font-mono px-2 py-1 rounded transition-all ${
                    filterCategory === cat
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bus Demultiplexing & Machine Cycle Simulator Section */}
      <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Bus Demultiplexing & Machine Cycle Simulation (T1 – T4)
            </h3>
            <p className="text-xs text-slate-400">
              Observe how multiplexed Address/Data pins (AD0–AD15) transition across clock states T1 to T4.
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-400 px-2 font-mono text-[11px]">Bus Action:</span>
              <button
                onClick={() => setSimAction('READ')}
                className={`px-2.5 py-1 rounded font-bold transition-all ${
                  simAction === 'READ' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                READ
              </button>
              <button
                onClick={() => setSimAction('WRITE')}
                className={`px-2.5 py-1 rounded font-bold transition-all ${
                  simAction === 'WRITE' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                WRITE
              </button>
            </div>

            <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-mono">
              {(['T1', 'T2', 'T3', 'T4'] as const).map((cycle) => (
                <button
                  key={cycle}
                  onClick={() => setSimCycle(cycle)}
                  className={`px-2.5 py-1 rounded font-bold transition-all ${
                    simCycle === cycle ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cycle}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bus State Flow Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${simCycle === 'T1' ? 'bg-indigo-950/80 border-indigo-500 text-white ring-1 ring-indigo-400' : 'bg-slate-900/60 border-slate-800 text-slate-400'}`}>
            <div className="flex justify-between items-center font-bold font-mono">
              <span>T1 Clock State</span>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">Address Phase</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              CPU places 20-bit address (A0–A19) on AD0–AD15 and A16/S3–A19/S6. Asserts <strong>ALE = HIGH</strong> to latch address into external 8282 latches.
            </p>
          </div>

          <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${simCycle === 'T2' ? 'bg-indigo-950/80 border-indigo-500 text-white ring-1 ring-indigo-400' : 'bg-slate-900/60 border-slate-800 text-slate-400'}`}>
            <div className="flex justify-between items-center font-bold font-mono">
              <span>T2 Clock State</span>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">Bus Turnaround</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              ALE drops LOW. CPU sets <strong>DT/R</strong> (direction) and asserts <strong>DEN = LOW</strong> to enable 8286 transceivers. Drives /RD or /WR low.
            </p>
          </div>

          <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${simCycle === 'T3' ? 'bg-indigo-950/80 border-indigo-500 text-white ring-1 ring-indigo-400' : 'bg-slate-900/60 border-slate-800 text-slate-400'}`}>
            <div className="flex justify-between items-center font-bold font-mono">
              <span>T3 Clock State</span>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">Data Transfer</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Data (D0–D15) is transferred over the bus. CPU samples <strong>READY</strong> input pin; if LOW, wait states (Tw) are inserted.
            </p>
          </div>

          <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${simCycle === 'T4' ? 'bg-indigo-950/80 border-indigo-500 text-white ring-1 ring-indigo-400' : 'bg-slate-900/60 border-slate-800 text-slate-400'}`}>
            <div className="flex justify-between items-center font-bold font-mono">
              <span>T4 Clock State</span>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">Cycle Completion</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              /RD or /WR control signals return HIGH. DEN goes HIGH to disable transceivers. Data bus is released for next machine cycle.
            </p>
          </div>
        </div>
      </div>

      {/* Maximum Mode Status Line Decoder Reference Table */}
      {mode === 'MAX' && (
        <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800/80 space-y-3">
          <h3 className="text-sm font-semibold text-purple-300 flex items-center gap-2 font-mono">
            <Binary className="w-4 h-4 text-purple-400" />
            8288 Bus Controller Status Line Decoding (/S2, /S1, /S0)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono bg-slate-900">
                  <th className="p-2 font-semibold">/S2</th>
                  <th className="p-2 font-semibold">/S1</th>
                  <th className="p-2 font-semibold">/S0</th>
                  <th className="p-2 font-semibold">Processor Cycle Type</th>
                  <th className="p-2 font-semibold">8288 Output Command Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 font-mono text-[11px]">
                <tr className="hover:bg-slate-900/50"><td className="p-2 text-purple-400 font-bold">0</td><td className="p-2 text-purple-400 font-bold">0</td><td className="p-2 text-purple-400 font-bold">0</td><td className="p-2">Interrupt Acknowledge</td><td className="p-2 text-emerald-400">INTA</td></tr>
                <tr className="hover:bg-slate-900/50"><td className="p-2 text-purple-400 font-bold">0</td><td className="p-2 text-purple-400 font-bold">0</td><td className="p-2 text-purple-400 font-bold">1</td><td className="p-2">Read I/O Port</td><td className="p-2 text-blue-400">IORC</td></tr>
                <tr className="hover:bg-slate-900/50"><td className="p-2 text-purple-400 font-bold">0</td><td className="p-2 text-purple-400 font-bold">1</td><td className="p-2 text-purple-400 font-bold">0</td><td className="p-2">Write I/O Port</td><td className="p-2 text-amber-400">IOWC / AIOWC</td></tr>
                <tr className="hover:bg-slate-900/50"><td className="p-2 text-purple-400 font-bold">0</td><td className="p-2 text-purple-400 font-bold">1</td><td className="p-2 text-purple-400 font-bold">1</td><td className="p-2">Halt / Passive</td><td className="p-2 text-slate-500">None</td></tr>
                <tr className="hover:bg-slate-900/50"><td className="p-2 text-purple-400 font-bold">1</td><td className="p-2 text-purple-400 font-bold">0</td><td className="p-2 text-purple-400 font-bold">0</td><td className="p-2">Instruction Fetch</td><td className="p-2 text-blue-400">MRDC</td></tr>
                <tr className="hover:bg-slate-900/50"><td className="p-2 text-purple-400 font-bold">1</td><td className="p-2 text-purple-400 font-bold">0</td><td className="p-2 text-purple-400 font-bold">1</td><td className="p-2">Read Memory</td><td className="p-2 text-blue-400">MRDC</td></tr>
                <tr className="hover:bg-slate-900/50"><td className="p-2 text-purple-400 font-bold">1</td><td className="p-2 text-purple-400 font-bold">1</td><td className="p-2 text-purple-400 font-bold">0</td><td className="p-2">Write Memory</td><td className="p-2 text-amber-400">MWTC / AMWC</td></tr>
                <tr className="hover:bg-slate-900/50"><td className="p-2 text-purple-400 font-bold">1</td><td className="p-2 text-purple-400 font-bold">1</td><td className="p-2 text-purple-400 font-bold">1</td><td className="p-2">Passive / Idle State</td><td className="p-2 text-slate-500">None</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
