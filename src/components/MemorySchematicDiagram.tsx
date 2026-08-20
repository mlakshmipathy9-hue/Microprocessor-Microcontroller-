import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  CheckCircle2, 
  Info, 
  Layers, 
  Database, 
  Cpu, 
  Zap, 
  ArrowRight,
  ShieldAlert,
  Binary,
  Radio,
  CircuitBoard
} from 'lucide-react';

const Overline = ({ children }: { children: React.ReactNode }) => (
  <span className="overline decoration-current inline-block font-bold" style={{ textDecoration: 'overline' }}>
    {children}
  </span>
);

export type MemoryCycleScenario = 
  | 'aligned-word-ram-write'
  | 'aligned-word-ram-read'
  | 'even-byte-ram-read'
  | 'odd-byte-ram-read'
  | 'out-of-range-access';

export interface MemorySchematicDiagramProps {
  initialScenario?: MemoryCycleScenario;
}

export default function MemorySchematicDiagram({
  initialScenario = 'aligned-word-ram-write'
}: MemorySchematicDiagramProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedChip, setSelectedChip] = useState<string | null>('ram1');
  const [activeScenario, setActiveScenario] = useState<MemoryCycleScenario>(initialScenario);
  const [tState, setTState] = useState<1 | 2 | 3 | 4>(1);
  const [isAutoStepping, setIsAutoStepping] = useState<boolean>(true);
  const [customHexAddress, setCustomHexAddress] = useState<string>('00100');
  const [useCustomAddress, setUseCustomAddress] = useState<boolean>(false);
  const [customAccessType, setCustomAccessType] = useState<'byte' | 'word'>('word');
  const [customOpType, setCustomOpType] = useState<'read' | 'write'>('write');

  // Auto-advance T-States when running
  useEffect(() => {
    if (!isAutoStepping) return;
    const interval = setInterval(() => {
      setTState((prev) => ((prev % 4) + 1) as 1 | 2 | 3 | 4);
    }, 900);
    return () => clearInterval(interval);
  }, [isAutoStepping]);

  // Derive parameters from scenario or custom address
  let addressHex = '00100';
  let isWord = true;
  let isWrite = true;
  let scenarioTitle = '';
  let scenarioDesc = '';

  if (useCustomAddress) {
    addressHex = customHexAddress.padStart(5, '0').slice(-5).toUpperCase();
    isWord = customAccessType === 'word';
    isWrite = customOpType === 'write';
    scenarioTitle = `Custom Access at ${addressHex}H (${isWord ? '16-bit Word' : '8-bit Byte'} ${isWrite ? 'Write' : 'Read'})`;
    scenarioDesc = `Simulating user-defined address ${addressHex}H for the 32 KB RAM array (00000H–07FFFH).`;
  } else {
    switch (activeScenario) {
      case 'aligned-word-ram-write':
        addressHex = '00200';
        isWord = true;
        isWrite = true;
        scenarioTitle = '1. Aligned 16-Bit Word RAM Write (Address 00200H)';
        scenarioDesc = 'Writes a full 16-bit word simultaneously to BOTH Even (RAM_1) and Odd (RAM_2) 16 KB RAM chips in a single bus cycle (A0=0, BHE#=0, CS#=0, CE1#=0, CE2#=0, WR#=0, D0–D15).';
        break;
      case 'aligned-word-ram-read':
        addressHex = '00100';
        isWord = true;
        isWrite = false;
        scenarioTitle = '2. Aligned 16-Bit Word RAM Read (Address 00100H)';
        scenarioDesc = 'Reads a 16-bit word from both 16 KB RAM banks simultaneously across D0–D15 in a single bus cycle (A0=0, BHE#=0, CS#=0, CE1#=0, CE2#=0, RD#=0).';
        break;
      case 'even-byte-ram-read':
        addressHex = '00102';
        isWord = false;
        isWrite = false;
        scenarioTitle = '3. Even Byte RAM Read (Address 00102H)';
        scenarioDesc = 'Reads 1 byte from RAM_1 (Even Bank, D0–D7). RAM_2 (Odd Bank) is disabled (A0=0, BHE#=1, CE1#=0, CE2#=1, RD#=0).';
        break;
      case 'odd-byte-ram-read':
        addressHex = '00103';
        isWord = false;
        isWrite = false;
        scenarioTitle = '4. Odd Byte RAM Read (Address 00103H)';
        scenarioDesc = 'Reads 1 byte from RAM_2 (Odd Bank, D8–D15). RAM_1 (Even Bank) is disabled (A0=1, BHE#=0, CE1#=1, CE2#=0, RD#=0).';
        break;
      case 'out-of-range-access':
        addressHex = '08000';
        isWord = true;
        isWrite = false;
        scenarioTitle = '5. Out-of-Range Memory Access (Address 08000H - Beyond 32 KB)';
        scenarioDesc = 'Address 08000H has A15=1. The Absolute NAND decoder detects address outside 00000H–07FFFH, outputting CS#=1 (Inactive). Both 16 KB RAM chips remain in Standby!';
        break;
    }
  }

  const addrVal = parseInt(addressHex, 16) || 0;
  const isEvenAddress = (addrVal % 2) === 0;

  // Signal computations
  const a0 = isEvenAddress ? 0 : 1;
  const bhe = (isWord || !isEvenAddress) ? 0 : 1;

  // High address lines for 32 KB Absolute Decoder (A15–A19)
  const a19 = (addrVal >> 19) & 1;
  const a18 = (addrVal >> 18) & 1;
  const a17 = (addrVal >> 17) & 1;
  const a16 = (addrVal >> 16) & 1;
  const a15 = (addrVal >> 15) & 1;

  // M/IO# signal (Memory = 1, I/O = 0 for 8086 Minimum Mode)
  const mio = 1;

  // Absolute NAND Decoder: CS# = NOT( NOT A19 * NOT A18 * NOT A17 * NOT A16 * NOT A15 * M/IO# )
  // For 00000H to 07FFFH, A19..A15 must all be 0, and M/IO# must be 1.
  const isAddressInRange = (a19 === 0 && a18 === 0 && a17 === 0 && a16 === 0 && a15 === 0 && mio === 1);
  const csBar = isAddressInRange ? 0 : 1; // Active LOW

  // Bank qualification using OR gates (74LS32):
  // CE1# = CS# OR A0
  // CE2# = CS# OR BHE#
  const ce1Bar = (csBar === 0 && a0 === 0) ? 0 : 1;
  const ce2Bar = (csBar === 0 && bhe === 0) ? 0 : 1;

  // Bus Control Strobes based on T-State
  const ale = tState === 1 ? 1 : 0;
  const rd = (!isWrite && (tState === 2 || tState === 3)) ? 0 : 1;
  const wr = (isWrite && (tState === 2 || tState === 3)) ? 0 : 1;
  const den = (tState >= 2 && tState <= 4) ? 0 : 1;
  const dtr = isWrite ? 1 : 0; // 1 = Transmit (Write), 0 = Receive (Read)

  const ram1EvenActive = ce1Bar === 0;
  const ram2OddActive = ce2Bar === 0;

  // Transceiver Active States
  const lowerTransceiverActive = (den === 0) && (a0 === 0 || isWord);
  const upperTransceiverActive = (den === 0) && (bhe === 0 || isWord);

  // Address connected to RAM chips: A1–A14 (shifted by 1 bit, A0 used for bank select)
  const chipAddrOffset = (addrVal >> 1) & 0x3FFF; // 14 bits (0..16383)
  const chipAddrHex = chipAddrOffset.toString(16).padStart(4, '0').toUpperCase();

  const chipData: Record<string, { 
    title: string; 
    subtitle: string; 
    desc: string; 
    techSpecs: { label: string; val: string }[];
    pins: { pin: string; role: string; state: string }[] 
  }> = {
    u1: {
      title: 'U1: Intel 8086 16-Bit Microprocessor',
      subtitle: 'Minimum Mode Master Controller (MN/MX# = +5V)',
      desc: 'The central processing unit that executes memory bus cycles. In Minimum Mode (Pin 33 tied to +5V), it directly generates bus control signals ALE, M/IO#, RD#, WR#, DEN#, and DT/R# without needing an external 8288 bus controller.',
      techSpecs: [
        { label: 'Clock Frequency', val: '5 MHz / 8 MHz (Standard 8086)' },
        { label: 'Address Bus', val: '20-bit (A0–A19) addressing 1 MB space' },
        { label: 'Multiplexed Bus', val: 'AD0–AD15 (Address in T1, Data in T2–T4)' },
        { label: 'Target Memory', val: '32 KB RAM at 00000H–07FFFH' }
      ],
      pins: [
        { pin: 'AD0–AD15 (Pins 16–2, 39)', role: 'Time-multiplexed Address (T1) and Data (T2–T4)', state: tState === 1 ? `Addr: ${addressHex}H` : (isWrite ? 'Data Out (CPU->RAM)' : 'Data In (RAM->CPU)') },
        { pin: 'A16–A19 (Pins 35–38)', role: 'Time-multiplexed Upper Address (to Decoder)', state: `A19..A15: ${a19}${a18}${a17}${a16}${a15}b` },
        { pin: 'BHE#/S7 (Pin 34)', role: 'Bus High Enable (Active LOW for Odd Bank RAM_2)', state: bhe === 0 ? '0 (LOW - Odd Bank ENABLED)' : '1 (HIGH - Odd Bank Inactive)' },
        { pin: 'ALE (Pin 25)', role: 'Address Latch Enable strobe for 74LS373', state: ale === 1 ? '1 (PULSE HIGH in T1)' : '0 (LOW in T2–T4)' },
        { pin: 'M/IO# (Pin 28)', role: 'Memory (HIGH) vs I/O (LOW) selector', state: '1 (HIGH - Memory Cycle)' },
        { pin: 'RD# (Pin 32)', role: 'Active-LOW Memory Read strobe', state: rd === 0 ? '0 (ACTIVE READ)' : '1 (IDLE)' },
        { pin: 'WR# (Pin 29)', role: 'Active-LOW Memory Write strobe', state: wr === 0 ? '0 (ACTIVE WRITE)' : '1 (IDLE)' },
        { pin: 'DEN# (Pin 26)', role: 'Data Enable (Active LOW for 74LS245 Transceivers)', state: den === 0 ? '0 (ACTIVE LOW)' : '1 (Tristate)' },
        { pin: 'DT/R# (Pin 27)', role: 'Data Transmit (1=Write) / Receive (0=Read)', state: dtr === 1 ? '1 (TRANSMIT)' : '0 (RECEIVE)' }
      ]
    },
    u2: {
      title: 'U2A, U2B, U2C: 3× 74LS373 Octal Latches',
      subtitle: 'Demultiplexes AD0–AD15 & A16–A19/BHE# into Pure Address Lines',
      desc: 'Latches the address lines during T1 on the falling edge of ALE. U2A produces A0–A7, U2B produces A8–A15, and U2C produces A16–A19 and BHE#. Holds stable addresses throughout T2, T3, and T4.',
      techSpecs: [
        { label: 'Latch Type', val: '8-bit transparent D-type latch (3 units used)' },
        { label: 'Control Pin', val: 'Pin 11 (LE) driven by 8086 ALE; Pin 1 (OE#) grounded' },
        { label: 'Memory Feeds', val: 'Latched A1–A14 wired to RAM address inputs A0–A13' }
      ],
      pins: [
        { pin: 'LE (Pin 11)', role: 'Latch Enable driven by 8086 ALE', state: ale === 1 ? '1 (TRANSPARENT)' : '0 (LATCHED)' },
        { pin: 'A0 (From U2A)', role: 'Even Bank enable line to OR Gate 1', state: a0 === 0 ? '0 (Even Address)' : '1 (Odd Address)' },
        { pin: 'A1–A14 (U2A & U2B)', role: '14 Address Lines to RAM A0–A13', state: `${chipAddrHex}H (Offset within 16KB)` },
        { pin: 'A15–A19 (U2B & U2C)', role: '5 High Address Lines to Absolute NAND Decoder', state: `${a19}${a18}${a17}${a16}${a15}b` },
        { pin: 'BHE# (From U2C)', role: 'Odd Bank enable line to OR Gate 2', state: bhe === 0 ? '0 (LOW)' : '1 (HIGH)' }
      ]
    },
    u3_dec: {
      title: 'Absolute Address Decoder (Inverters + 6-Input NAND 74LS30)',
      subtitle: 'Decodes A15–A19 & M/IO# for Exact 32 KB Block (00000H–07FFFH)',
      desc: 'Performs absolute address decoding. Inverters invert A15, A16, A17, A18, A19. A 6-input NAND gate combines NOT(A19), NOT(A18), NOT(A17), NOT(A16), NOT(A15), and M/IO# to produce active-LOW Chip Select (CS# = 0) ONLY when addressing 00000H–07FFFH.',
      techSpecs: [
        { label: 'Logic Equation', val: 'CS# = NOT( NOT A19 • NOT A18 • NOT A17 • NOT A16 • NOT A15 • M/IO# )' },
        { label: 'Address Range', val: '00000H to 07FFFH (Total 32,768 bytes)' },
        { label: 'Foldback / Shadow', val: 'None (Absolute decoding eliminates all aliasing)' }
      ],
      pins: [
        { pin: 'A15–A19 Inputs', role: 'Upper address bits from 74LS373 Latches', state: `${a19}${a18}${a17}${a16}${a15}b (Inverted: ${1-a19}${1-a18}${1-a17}${1-a16}${1-a15}b)` },
        { pin: 'M/IO# Input', role: 'Memory cycle enable (active HIGH)', state: '1 (HIGH)' },
        { pin: 'CS# Output', role: 'Active-LOW Master Chip Select for 32 KB RAM array', state: csBar === 0 ? '0 (LOW - 32 KB RAM SELECTED)' : '1 (HIGH - INACTIVE)' }
      ]
    },
    u_or: {
      title: 'Bank Qualification OR Gates (74LS32 Quad 2-Input OR)',
      subtitle: 'Generates Independent Chip Enables CE1# (Even) and CE2# (Odd)',
      desc: 'Combines master CS# with bank selection signals A0 and BHE#. Because inputs and outputs are active-LOW, the OR gate functions as an active-LOW AND qualifier.',
      techSpecs: [
        { label: 'OR Gate 1', val: 'CE1# = CS# OR A0 (Enables Even Bank RAM_1 on D0–D7)' },
        { label: 'OR Gate 2', val: 'CE2# = CS# OR BHE# (Enables Odd Bank RAM_2 on D8–D15)' },
        { label: 'Word Transfer', val: 'When A0=0 & BHE#=0, BOTH CE1# and CE2# go LOW (0)' }
      ],
      pins: [
        { pin: 'OR Gate 1 Inputs', role: 'CS# and A0', state: `CS#=${csBar}, A0=${a0}` },
        { pin: 'CE1# Output', role: 'Even Bank RAM_1 Chip Enable', state: ce1Bar === 0 ? '0 (LOW - ACTIVE)' : '1 (HIGH - DISABLED)' },
        { pin: 'OR Gate 2 Inputs', role: 'CS# and BHE#', state: `CS#=${csBar}, BHE#=${bhe}` },
        { pin: 'CE2# Output', role: 'Odd Bank RAM_2 Chip Enable', state: ce2Bar === 0 ? '0 (LOW - ACTIVE)' : '1 (HIGH - DISABLED)' }
      ]
    },
    u4: {
      title: 'U4A & U4B: 2× 74LS245 Octal Bus Transceivers',
      subtitle: 'Bidirectional Bus Buffers for Lower (D0–D7) & Upper (D8–D15) Data Buses',
      desc: 'Isolates the 8086 multiplexed data bus and boosts current drive to RAM chips. U4A connects AD0–AD7 to RAM_1 D0–D7; U4B connects AD8–AD15 to RAM_2 D8–D15.',
      techSpecs: [
        { label: 'DIR (Pin 1)', val: 'Direction driven by DT/R# (1 = CPU->RAM Write, 0 = RAM->CPU Read)' },
        { label: 'OE# (Pin 19)', val: 'Output Enable driven by 8086 DEN# (Active LOW)' }
      ],
      pins: [
        { pin: 'DIR (Pin 1)', role: 'Driven by 8086 DT/R#', state: dtr === 1 ? '1 (TRANSMIT / WRITE)' : '0 (RECEIVE / READ)' },
        { pin: 'OE# (Pin 19)', role: 'Driven by 8086 DEN#', state: den === 0 ? '0 (BUFFERS ACTIVE)' : '1 (TRISTATE)' },
        { pin: 'U4A (Lower Transceiver)', role: 'Buffers Even Data Byte (D0–D7)', state: lowerTransceiverActive ? 'Active Bus Driving' : 'High-Z' },
        { pin: 'U4B (Upper Transceiver)', role: 'Buffers Odd Data Byte (D8–D15)', state: upperTransceiverActive ? 'Active Bus Driving' : 'High-Z' }
      ]
    },
    ram1: {
      title: 'RAM 1: 16 KB Static RAM (Even Bank - 16 KB × 8, e.g. 62128)',
      subtitle: 'Lower Byte RAM for Even Addresses: 00000H, 00002H, ... 07FFEH',
      desc: 'Stores bytes located at even physical addresses. Selected when CS#=0 and A0=0 (CE1#=0). Data pins connected to lower bus D0–D7. Address inputs A0–A13 connect to system lines A1–A14.',
      techSpecs: [
        { label: 'Capacity', val: '16,384 Bytes (16 KB × 8-bit SRAM)' },
        { label: 'Address Inputs', val: '14 Address Lines: A0–A13 connected to latched A1–A14' },
        { label: 'Data Bus', val: 'D0–D7 (Lower 8 bits of 16-bit bus)' },
        { label: 'Address Range', val: '00000H to 07FFEH (Even byte locations)' },
        { label: 'Chip Enable', val: 'CE1# = CS# OR A0 (Active LOW)' }
      ],
      pins: [
        { pin: 'CE1# (Chip Enable)', role: 'Gated by CS# and A0 from OR Gate 1', state: ce1Bar === 0 ? '0 (CHIP SELECTED / ACTIVE)' : '1 (STANDBY / HIGH-Z)' },
        { pin: 'OE# (Output Enable)', role: 'Connected to 8086 RD#', state: rd === 0 ? '0 (READ ENABLED)' : '1 (HIGH)' },
        { pin: 'WE# (Write Enable)', role: 'Connected to 8086 WR#', state: wr === 0 ? '0 (WRITE ENABLED)' : '1 (HIGH)' },
        { pin: 'A0–A13 (14 lines)', role: 'Connected to 8086 latched A1–A14', state: `${chipAddrHex}H` },
        { pin: 'D0–D7 (Data Bus)', role: 'Connected to Transceiver U4A', state: ram1EvenActive ? (isWrite ? 'Writing Data In' : 'Driving Data Out') : 'High-Z' }
      ]
    },
    ram2: {
      title: 'RAM 2: 16 KB Static RAM (Odd Bank - 16 KB × 8, e.g. 62128)',
      subtitle: 'Upper Byte RAM for Odd Addresses: 00001H, 00003H, ... 07FFFH',
      desc: 'Stores bytes located at odd physical addresses. Selected when CS#=0 and BHE#=0 (CE2#=0). Data pins connected to upper bus D8–D15. Address inputs A0–A13 connect to system lines A1–A14.',
      techSpecs: [
        { label: 'Capacity', val: '16,384 Bytes (16 KB × 8-bit SRAM)' },
        { label: 'Address Inputs', val: '14 Address Lines: A0–A13 connected to latched A1–A14' },
        { label: 'Data Bus', val: 'D8–D15 (Upper 8 bits of 16-bit bus)' },
        { label: 'Address Range', val: '00001H to 07FFFH (Odd byte locations)' },
        { label: 'Chip Enable', val: 'CE2# = CS# OR BHE# (Active LOW)' }
      ],
      pins: [
        { pin: 'CE2# (Chip Enable)', role: 'Gated by CS# and BHE# from OR Gate 2', state: ce2Bar === 0 ? '0 (CHIP SELECTED / ACTIVE)' : '1 (STANDBY / HIGH-Z)' },
        { pin: 'OE# (Output Enable)', role: 'Connected to 8086 RD#', state: rd === 0 ? '0 (READ ENABLED)' : '1 (HIGH)' },
        { pin: 'WE# (Write Enable)', role: 'Connected to 8086 WR#', state: wr === 0 ? '0 (WRITE ENABLED)' : '1 (HIGH)' },
        { pin: 'A0–A13 (14 lines)', role: 'Connected to 8086 latched A1–A14', state: `${chipAddrHex}H` },
        { pin: 'D0–D7 (Data Bus)', role: 'Connected to Upper Transceiver U4B (D8–D15)', state: ram2OddActive ? (isWrite ? 'Writing Data In' : 'Driving Data Out') : 'High-Z' }
      ]
    }
  };

  const currentChipInfo = selectedChip ? chipData[selectedChip] : chipData.ram1;

  return (
    <div className="bg-white text-slate-800 p-3 md:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4 font-sans select-none">
      {/* Top Header & Interactive Scenario Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-xl shadow-xs">
            <CircuitBoard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm md:text-base text-slate-900 tracking-wide">
                8086 32 KB RAM Interfacing Complete Circuit Schematic 📐💾
              </h3>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">
                2 × 16 KB RAM (00000H–07FFFH)
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Continuation of Design Steps 1–5: Absolute NAND/OR Decoding • 3× 74LS373 Latches • 2× 74LS245 Transceivers • Even &amp; Odd 16 KB SRAM Banks
            </p>
          </div>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.7, +(z - 0.1).toFixed(1)))}
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-white transition-all cursor-pointer shadow-2xs"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono font-bold text-indigo-700 px-1.5 min-w-[3rem] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.5, +(z + 0.1).toFixed(1)))}
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-white transition-all cursor-pointer shadow-2xs"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-white transition-all cursor-pointer shadow-2xs"
            title="Reset Zoom"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preset Scenarios Selector Strip */}
      <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-indigo-600" /> Select 32 KB RAM Interfacing Test Scenario:
          </span>
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-slate-700 flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={useCustomAddress}
                onChange={(e) => setUseCustomAddress(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-0 cursor-pointer"
              />
              <span className="font-semibold">Custom Address Mode</span>
            </label>
          </div>
        </div>

        {!useCustomAddress ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {[
              { id: 'aligned-word-ram-write', label: '16-bit Word RAM Write', tag: '00200H (Both Banks)' },
              { id: 'aligned-word-ram-read', label: '16-bit Word RAM Read', tag: '00100H (Both Banks)' },
              { id: 'even-byte-ram-read', label: 'Even Byte RAM Read', tag: '00102H (RAM_1 Only)' },
              { id: 'odd-byte-ram-read', label: 'Odd Byte RAM Read', tag: '00103H (RAM_2 Only)' },
              { id: 'out-of-range-access', label: 'Out-of-Range (A15=1)', tag: '08000H (CS# Inactive)' }
            ].map((sc) => {
              const isSel = activeScenario === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => {
                    setActiveScenario(sc.id as MemoryCycleScenario);
                    setUseCustomAddress(false);
                  }}
                  className={`p-2.5 rounded-xl text-left transition-all border cursor-pointer flex flex-col justify-between ${
                    isSel 
                      ? 'bg-indigo-600 border-indigo-600 shadow-sm text-white' 
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="font-bold text-xs leading-tight mb-1">{sc.label}</div>
                  <div className={`text-[10px] font-mono ${isSel ? 'text-indigo-100' : 'text-slate-500'}`}>{sc.tag}</div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-700 font-bold">20-bit Hex Address:</span>
              <input
                type="text"
                maxLength={5}
                value={customHexAddress}
                onChange={(e) => setCustomHexAddress(e.target.value.toUpperCase().replace(/[^0-9A-F]/g, ''))}
                className="bg-slate-50 text-indigo-950 font-mono font-bold text-sm px-2.5 py-1 rounded border border-slate-300 w-24 focus:outline-none focus:border-indigo-600 text-center uppercase"
                placeholder="00100"
              />
              <span className="font-mono text-xs text-slate-500">H</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-700 font-bold">Width:</span>
              <button
                onClick={() => setCustomAccessType('byte')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer border ${customAccessType === 'byte' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-100 text-slate-700 border-slate-200'}`}
              >
                8-bit Byte
              </button>
              <button
                onClick={() => setCustomAccessType('word')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer border ${customAccessType === 'word' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-100 text-slate-700 border-slate-200'}`}
              >
                16-bit Word
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-700 font-bold">Operation:</span>
              <button
                onClick={() => setCustomOpType('read')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer border ${customOpType === 'read' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-100 text-slate-700 border-slate-200'}`}
              >
                Read (RD#=0)
              </button>
              <button
                onClick={() => setCustomOpType('write')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer border ${customOpType === 'write' ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-100 text-slate-700 border-slate-200'}`}
              >
                Write (WR#=0)
              </button>
            </div>

            <div className="text-xs text-slate-500 font-mono ml-auto">
              Range: {isAddressInRange ? <span className="text-emerald-700 font-bold">00000H–07FFFH (Valid 32 KB RAM)</span> : <span className="text-red-700 font-bold">Outside 32 KB (CS#=1 Disabled)</span>}
            </div>
          </div>
        )}

        {/* Live Scenario Description & Bus Status */}
        <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="space-y-0.5">
            <div className="font-bold text-slate-900">{scenarioTitle}</div>
            <p className="text-slate-600 text-[11px]">{scenarioDesc}</p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
            <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-700">
              Addr: <strong className="text-slate-950">{addressHex}H</strong>
            </span>
            <span className={`px-2 py-0.5 rounded border ${isAddressInRange ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-red-50 text-red-800 border-red-300'}`}>
              CS#: <strong>{csBar}</strong>
            </span>
            <span className={`px-2 py-0.5 rounded border ${ce1Bar === 0 ? 'bg-indigo-50 text-indigo-800 border-indigo-300' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
              RAM_1 CE1#: <strong>{ce1Bar}</strong>
            </span>
            <span className={`px-2 py-0.5 rounded border ${ce2Bar === 0 ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
              RAM_2 CE2#: <strong>{ce2Bar}</strong>
            </span>
            <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-700">
              Offset A1–A14: <strong className="text-slate-900">{chipAddrHex}H</strong>
            </span>
          </div>
        </div>
      </div>

      {/* T-State Stepper Controls */}
      <div className="bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-indigo-950 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-indigo-600" /> 8086 4-Clock Bus Cycle:
          </span>
          <div className="flex items-center gap-1">
            {([1, 2, 3, 4] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTState(t);
                  setIsAutoStepping(false);
                }}
                className={`w-7 h-7 rounded-lg font-mono font-bold transition-all border cursor-pointer ${
                  tState === t 
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm scale-105' 
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                T{t}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-slate-600 font-medium ml-1">
            {tState === 1 && '— T1: Address Driven on AD0–AD15; ALE Pulses HIGH (Latches A0–A19)'}
            {tState === 2 && '— T2: Bus switches to Data; RD#/WR# & DEN# Asserted LOW'}
            {tState === 3 && '— T3: RAM Chips decode & drive data / latch write data'}
            {tState === 4 && '— T4: Cycle completes; Bus returns to Tri-state'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAutoStepping(!isAutoStepping)}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg font-semibold text-xs transition-all border cursor-pointer ${
              isAutoStepping 
                ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200' 
                : 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
            }`}
          >
            {isAutoStepping ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {isAutoStepping ? 'Pause Clock' : 'Auto Clock (5 MHz)'}
          </button>
          <button
            onClick={() => {
              setTState(1);
              setIsAutoStepping(true);
            }}
            className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-white cursor-pointer"
            title="Reset Cycle"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Full Schematic Circuit SVG (Vector Diagram) */}
      <div 
        className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 transition-all relative"
        style={{ minHeight: '520px' }}
      >
        <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left', width: `${100 / zoomLevel}%` }}>
          <svg 
            viewBox="0 0 1320 680" 
            className="w-full h-auto font-mono text-[11px]"
            style={{ minWidth: '1100px' }}
          >
            <defs>
              <pattern id="grid-light" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.75" fill="#e2e8f0" />
              </pattern>
              {/* Bus trace glowing filters */}
              <filter id="glow-indigo" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#6366f1" floodOpacity="0.4" />
              </filter>
              <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#f59e0b" floodOpacity="0.4" />
              </filter>
              <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#10b981" floodOpacity="0.4" />
              </filter>
            </defs>

            {/* Background Grid */}
            <rect x="0" y="0" width="1320" height="680" fill="url(#grid-light)" />

            {/* Circuit Boundary Frame */}
            <rect x="10" y="10" width="1300" height="660" rx="14" fill="#fafbfc" stroke="#cbd5e1" strokeWidth="1.5" />

            {/* ========================================================================================= */}
            {/* 1. INTEL 8086 MPU (MINIMUM MODE) */}
            {/* ========================================================================================= */}
            <g 
              id="chip-8086"
              onClick={() => setSelectedChip('u1')}
              className="cursor-pointer group"
            >
              <rect 
                x="40" y="45" width="220" height="585" rx="10" 
                fill={selectedChip === 'u1' ? '#f0fdf4' : '#ffffff'} 
                stroke={selectedChip === 'u1' ? '#16a34a' : '#94a3b8'} 
                strokeWidth={selectedChip === 'u1' ? 2.5 : 1.5}
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.04))"
              />
              <rect x="40" y="45" width="220" height="38" rx="10" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
              <text x="150" y="65" textAnchor="middle" fill="#0f172a" fontWeight="bold" fontSize="13" fontFamily="sans-serif">
                Intel 8086 MPU (U1)
              </text>
              <text x="150" y="78" textAnchor="middle" fill="#15803d" fontSize="9.5" fontWeight="bold">
                MIN MODE (MN/MX# = +5V)
              </text>

              {/* CPU Multiplexed Bus Pins */}
              {/* AD0–AD7 */}
              <text x="52" y="118" fill="#475569" fontSize="10">AD0–AD7 (Pins 16–9)</text>
              <line x1="260" y1="115" x2="350" y2="115" stroke={tState === 1 ? '#6366f1' : '#94a3b8'} strokeWidth="2.5" />

              {/* AD8–AD15 */}
              <text x="52" y="198" fill="#475569" fontSize="10">AD8–AD15 (Pins 39, 2–8)</text>
              <line x1="260" y1="195" x2="350" y2="195" stroke={tState === 1 ? '#6366f1' : '#94a3b8'} strokeWidth="2.5" />

              {/* A16–A19 & BHE# */}
              <text x="52" y="268" fill="#475569" fontSize="10">A16–A19 / S3–S6 (35–38)</text>
              <text x="52" y="284" fill="#475569" fontSize="10">BHE# / S7 (Pin 34)</text>
              <line x1="260" y1="275" x2="350" y2="275" stroke={tState === 1 ? '#a855f7' : '#94a3b8'} strokeWidth="2.5" />

              {/* Control Strobes */}
              {/* ALE (Pin 25) */}
              <text x="52" y="334" fill="#9a3412" fontSize="10" fontWeight="bold">ALE (Pin 25)</text>
              <circle cx="260" cy="330" r="3.5" fill={ale === 1 ? '#ea580c' : '#94a3b8'} />
              <line x1="260" y1="330" x2="350" y2="330" stroke={ale === 1 ? '#ea580c' : '#cbd5e1'} strokeWidth={ale === 1 ? 2.5 : 1.5} />

              {/* M/IO# (Pin 28) */}
              <text x="52" y="384" fill="#15803d" fontSize="10" fontWeight="bold">M/IO# (Pin 28) = 1</text>
              <circle cx="260" cy="380" r="3.5" fill="#15803d" />
              <line x1="260" y1="380" x2="560" y2="380" stroke="#15803d" strokeWidth="2" />

              {/* RD# (Pin 32) */}
              <text x="52" y="474" fill="#0369a1" fontSize="10" fontWeight="bold">RD# (Pin 32)</text>
              <circle cx="260" cy="470" r="3.5" fill={rd === 0 ? '#0284c7' : '#94a3b8'} />
              <line x1="260" y1="470" x2="980" y2="470" stroke={rd === 0 ? '#0284c7' : '#cbd5e1'} strokeWidth={rd === 0 ? 2.5 : 1.5} />

              {/* WR# (Pin 29) */}
              <text x="52" y="514" fill="#b45309" fontSize="10" fontWeight="bold">WR# (Pin 29)</text>
              <circle cx="260" cy="510" r="3.5" fill={wr === 0 ? '#d97706' : '#94a3b8'} />
              <line x1="260" y1="510" x2="960" y2="510" stroke={wr === 0 ? '#d97706' : '#cbd5e1'} strokeWidth={wr === 0 ? 2.5 : 1.5} />

              {/* DEN# (Pin 26) & DT/R# (Pin 27) */}
              <text x="52" y="564" fill="#64748b" fontSize="10">DEN# (Pin 26)</text>
              <line x1="260" y1="560" x2="600" y2="560" stroke={den === 0 ? '#6366f1' : '#cbd5e1'} strokeWidth="1.5" />
              <text x="52" y="594" fill="#64748b" fontSize="10">DT/R# (Pin 27)</text>
              <line x1="260" y1="590" x2="600" y2="590" stroke="#64748b" strokeWidth="1.5" />
            </g>

            {/* ========================================================================================= */}
            {/* 2. 3× 74LS373 OCTAL LATCHES (U2A, U2B, U2C) */}
            {/* ========================================================================================= */}
            <g 
              id="chip-74ls373"
              onClick={() => setSelectedChip('u2')}
              className="cursor-pointer group"
            >
              {/* U2A: AD0-AD7 -> A0-A7 */}
              <rect 
                x="350" y="80" width="160" height="70" rx="6" 
                fill={selectedChip === 'u2' ? '#eef2ff' : '#ffffff'} 
                stroke={selectedChip === 'u2' ? '#6366f1' : '#94a3b8'} 
                strokeWidth="1.5"
              />
              <text x="430" y="98" textAnchor="middle" fill="#1e1b4b" fontWeight="bold" fontSize="10.5">U2A: 74LS373 (Low)</text>
              <text x="358" y="118" fill="#475569" fontSize="9">AD0–AD7</text>
              <text x="460" y="118" fill="#1e1b4b" fontSize="9" fontWeight="bold">A0–A7</text>
              <text x="430" y="138" textAnchor="middle" fill="#ea580c" fontSize="8">LE = ALE, OE# = GND</text>

              {/* U2B: AD8-AD15 -> A8-A15 */}
              <rect 
                x="350" y="160" width="160" height="70" rx="6" 
                fill={selectedChip === 'u2' ? '#eef2ff' : '#ffffff'} 
                stroke={selectedChip === 'u2' ? '#6366f1' : '#94a3b8'} 
                strokeWidth="1.5"
              />
              <text x="430" y="178" textAnchor="middle" fill="#1e1b4b" fontWeight="bold" fontSize="10.5">U2B: 74LS373 (Mid)</text>
              <text x="358" y="198" fill="#475569" fontSize="9">AD8–AD15</text>
              <text x="458" y="198" fill="#1e1b4b" fontSize="9" fontWeight="bold">A8–A15</text>
              <text x="430" y="218" textAnchor="middle" fill="#ea580c" fontSize="8">LE = ALE, OE# = GND</text>

              {/* U2C: A16-A19 & BHE# */}
              <rect 
                x="350" y="240" width="160" height="70" rx="6" 
                fill={selectedChip === 'u2' ? '#eef2ff' : '#ffffff'} 
                stroke={selectedChip === 'u2' ? '#6366f1' : '#94a3b8'} 
                strokeWidth="1.5"
              />
              <text x="430" y="258" textAnchor="middle" fill="#1e1b4b" fontWeight="bold" fontSize="10.5">U2C: 74LS373 (High)</text>
              <text x="358" y="278" fill="#475569" fontSize="9">A16–A19, BHE#</text>
              <text x="442" y="278" fill="#7e22ce" fontSize="8.5" fontWeight="bold">A16–A19, BHE#</text>
              <text x="430" y="298" textAnchor="middle" fill="#ea580c" fontSize="8">LE = ALE, OE# = GND</text>

              {/* ALE Distribution bus line */}
              <line x1="350" y1="330" x2="350" y2="135" stroke={ale === 1 ? '#ea580c' : '#cbd5e1'} strokeWidth="2" strokeDasharray="3 3" />
            </g>

            {/* Latched Address Distribution Paths */}
            {/* A0 path -> OR Gate 1 (Pin for Even Bank) */}
            <path d="M 510 115 L 850 115 L 850 170 L 890 170" fill="none" stroke="#2563eb" strokeWidth="2" />
            <text x="630" y="110" fill="#2563eb" fontSize="9.5" fontWeight="bold">A0 (Even Bank Enable)</text>

            {/* A1–A14 Address Bus (14 lines) -> to both RAM1 and RAM2 Address inputs A0–A13 */}
            <path d="M 510 135 L 530 135 L 530 35 L 1030 35" fill="none" stroke="#0f172a" strokeWidth="2.5" />
            {/* Dropdown into RAM 1 address inputs */}
            <path d="M 1030 35 L 1030 105" fill="none" stroke="#0f172a" strokeWidth="2" />
            {/* Dropdown into RAM 2 address inputs */}
            <path d="M 1020 35 L 1020 385 L 1030 385" fill="none" stroke="#0f172a" strokeWidth="2" />
            <text x="545" y="28" fill="#0f172a" fontSize="10" fontWeight="bold">A1–A14 Latched Address Bus (14 lines) → Connected to RAM 1 &amp; RAM 2 A0–A13</text>

            {/* BHE# path -> OR Gate 2 (Pin for Odd Bank) */}
            <path d="M 510 295 L 850 295 L 850 260 L 890 260" fill="none" stroke="#7e22ce" strokeWidth="2" />
            <text x="630" y="290" fill="#7e22ce" fontSize="9.5" fontWeight="bold">BHE# (Odd Bank Enable)</text>

            {/* A15–A19 path -> Absolute NAND Decoder */}
            <path d="M 510 205 L 535 205 L 535 460 L 560 460" fill="none" stroke="#7e22ce" strokeWidth="2" />
            <path d="M 510 275 L 545 275 L 545 425 L 560 425" fill="none" stroke="#7e22ce" strokeWidth="2" />
            <text x="515" y="340" fill="#7e22ce" fontSize="9.5" fontWeight="bold">A15–A19</text>

            {/* ========================================================================================= */}
            {/* 3. ABSOLUTE ADDRESS DECODER (INVERTERS + 6-INPUT NAND 74LS30) */}
            {/* ========================================================================================= */}
            <g 
              id="chip-decoder"
              onClick={() => setSelectedChip('u3_dec')}
              className="cursor-pointer group"
            >
              <rect 
                x="560" y="350" width="220" height="165" rx="8" 
                fill={selectedChip === 'u3_dec' ? '#fdf4ff' : '#ffffff'} 
                stroke={selectedChip === 'u3_dec' ? '#c026d3' : '#94a3b8'} 
                strokeWidth={selectedChip === 'u3_dec' ? 2.5 : 1.5}
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.04))"
              />
              <rect x="560" y="350" width="220" height="25" rx="8" fill="#fae8ff" stroke="#f0abfc" strokeWidth="1" />
              <text x="670" y="367" textAnchor="middle" fill="#701a75" fontWeight="bold" fontSize="10.5">
                Absolute Decoder (74LS30 + 74LS04)
              </text>
              <text x="670" y="387" textAnchor="middle" fill="#86198f" fontSize="8.5" fontWeight="bold">
                Range: 00000H–07FFFH (32 KB RAM)
              </text>

              {/* Inverter indicators & Inputs */}
              <text x="572" y="407" fill="#475569" fontSize="8.5">M/IO# (Pin 28) = 1</text>
              <text x="572" y="425" fill="#701a75" fontSize="8.5">NOT A19 = {1 - a19}</text>
              <text x="572" y="443" fill="#701a75" fontSize="8.5">NOT A18 = {1 - a18}</text>
              <text x="572" y="461" fill="#701a75" fontSize="8.5">NOT A17 = {1 - a17}</text>
              <text x="572" y="479" fill="#701a75" fontSize="8.5">NOT A16 = {1 - a16}</text>
              <text x="572" y="497" fill="#701a75" fontSize="8.5">NOT A15 = {1 - a15}</text>

              {/* Output CS# */}
              <circle cx="780" cy="435" r="4" fill={csBar === 0 ? '#16a34a' : '#dc2626'} />
              <text x="755" y="430" fill={csBar === 0 ? '#15803d' : '#b91c1c'} fontSize="10" fontWeight="bold">CS#</text>
            </g>

            {/* Master CS# Line distribution to Bank OR Gates */}
            <path d="M 780 435 L 820 435 L 820 190 L 890 190" fill="none" stroke={csBar === 0 ? '#16a34a' : '#cbd5e1'} strokeWidth="2.5" />
            <path d="M 820 240 L 890 240" fill="none" stroke={csBar === 0 ? '#16a34a' : '#cbd5e1'} strokeWidth="2.5" />
            <text x="825" y="340" fill={csBar === 0 ? '#15803d' : '#64748b'} fontSize="9" fontWeight="bold">CS# (32 KB)</text>

            {/* ========================================================================================= */}
            {/* 4. BANK QUALIFICATION OR GATES (74LS32) */}
            {/* ========================================================================================= */}
            <g 
              id="chip-or"
              onClick={() => setSelectedChip('u_or')}
              className="cursor-pointer group"
            >
              {/* OR Gate 1: CS# OR A0 -> CE1# (Even Bank) */}
              <path 
                d="M 890 160 Q 905 160 915 180 Q 905 200 890 200 Q 898 180 890 160 Z" 
                fill={selectedChip === 'u_or' ? '#e0f2fe' : '#ffffff'} 
                stroke={selectedChip === 'u_or' ? '#0284c7' : '#475569'} 
                strokeWidth="1.8" 
              />
              <text x="900" y="183" fill="#0369a1" fontSize="7.5" fontWeight="bold">OR 1</text>
              <text x="860" y="154" fill="#475569" fontSize="8.5">CS# + A0</text>
              <line x1="915" y1="180" x2="1030" y2="180" stroke={ce1Bar === 0 ? '#16a34a' : '#cbd5e1'} strokeWidth="2.5" />
              <text x="935" y="173" fill={ce1Bar === 0 ? '#15803d' : '#64748b'} fontSize="9" fontWeight="bold">
                CE1# = {ce1Bar}
              </text>

              {/* OR Gate 2: CS# OR BHE# -> CE2# (Odd Bank) */}
              <path 
                d="M 890 230 Q 905 230 915 250 Q 905 270 890 270 Q 898 250 890 230 Z" 
                fill={selectedChip === 'u_or' ? '#fef3c7' : '#ffffff'} 
                stroke={selectedChip === 'u_or' ? '#d97706' : '#475569'} 
                strokeWidth="1.8" 
              />
              <text x="900" y="253" fill="#b45309" fontSize="7.5" fontWeight="bold">OR 2</text>
              <text x="855" y="285" fill="#475569" fontSize="8.5">CS# + BHE#</text>
              {/* Route CE2# from OR2 down to RAM2 CE2# pin at y=450 */}
              <path d="M 915 250 L 970 250 L 970 450 L 1030 450" fill="none" stroke={ce2Bar === 0 ? '#d97706' : '#cbd5e1'} strokeWidth="2.5" />
              <text x="925" y="243" fill={ce2Bar === 0 ? '#b45309' : '#64748b'} fontSize="9" fontWeight="bold">
                CE2# = {ce2Bar}
              </text>
            </g>

            {/* ========================================================================================= */}
            {/* 5. 2× 74LS245 OCTAL DATA TRANSCEIVERS (U4A, U4B) */}
            {/* ========================================================================================= */}
            <g 
              id="chip-74ls245"
              onClick={() => setSelectedChip('u4')}
              className="cursor-pointer group"
            >
              {/* U4A: Lower Data Bus (AD0-AD7 -> D0-D7) */}
              <rect 
                x="600" y="535" width="170" height="42" rx="6" 
                fill={selectedChip === 'u4' ? '#f8fafc' : '#ffffff'} 
                stroke={selectedChip === 'u4' ? '#475569' : '#94a3b8'} 
                strokeWidth="1.5"
              />
              <text x="685" y="550" textAnchor="middle" fill="#0f172a" fontWeight="bold" fontSize="9.5">U4A: 74LS245 (Lower)</text>
              <text x="610" y="567" fill="#475569" fontSize="8">AD0–AD7</text>
              <text x="725" y="567" fill="#2563eb" fontSize="8" fontWeight="bold">D0–D7</text>

              {/* U4B: Upper Data Bus (AD8-AD15 -> D8-D15) */}
              <rect 
                x="600" y="590" width="170" height="42" rx="6" 
                fill={selectedChip === 'u4' ? '#f8fafc' : '#ffffff'} 
                stroke={selectedChip === 'u4' ? '#475569' : '#94a3b8'} 
                strokeWidth="1.5"
              />
              <text x="685" y="605" textAnchor="middle" fill="#0f172a" fontWeight="bold" fontSize="9.5">U4B: 74LS245 (Upper)</text>
              <text x="610" y="622" fill="#475569" fontSize="8">AD8–AD15</text>
              <text x="725" y="622" fill="#d97706" fontSize="8" fontWeight="bold">D8–D15</text>
            </g>

            {/* Data Bus Distribution Paths to RAM Chips */}
            {/* D0–D7 -> RAM 1 (Even Bank) */}
            <path d="M 770 556 L 990 556 L 990 135 L 1030 135" fill="none" stroke="#2563eb" strokeWidth="2.5" />
            <text x="780" y="550" fill="#2563eb" fontSize="9" fontWeight="bold">D0–D7 (Even Byte Data Bus)</text>

            {/* D8–D15 -> RAM 2 (Odd Bank) */}
            <path d="M 770 611 L 1005 611 L 1005 415 L 1030 415" fill="none" stroke="#d97706" strokeWidth="2.5" />
            <text x="780" y="605" fill="#d97706" fontSize="9" fontWeight="bold">D8–D15 (Odd Byte Data Bus)</text>

            {/* RD# & WR# Bus taps to RAM 1 and RAM 2 */}
            {/* RD# tap into RAM 1 (y=215) and RAM 2 (y=485) */}
            <path d="M 980 470 L 980 215 L 1030 215" fill="none" stroke={rd === 0 ? '#0284c7' : '#cbd5e1'} strokeWidth={rd === 0 ? 2.5 : 1.5} />
            <path d="M 980 470 L 980 485 L 1030 485" fill="none" stroke={rd === 0 ? '#0284c7' : '#cbd5e1'} strokeWidth={rd === 0 ? 2.5 : 1.5} />

            {/* WR# tap into RAM 1 (y=250) and RAM 2 (y=520) */}
            <path d="M 960 510 L 960 250 L 1030 250" fill="none" stroke={wr === 0 ? '#d97706' : '#cbd5e1'} strokeWidth={wr === 0 ? 2.5 : 1.5} />
            <path d="M 960 510 L 960 520 L 1030 520" fill="none" stroke={wr === 0 ? '#d97706' : '#cbd5e1'} strokeWidth={wr === 0 ? 2.5 : 1.5} />

            {/* ========================================================================================= */}
            {/* 6. THE TWO 16 KB RAM MEMORY CHIPS (RAM 1: EVEN BANK & RAM 2: ODD BANK) */}
            {/* ========================================================================================= */}
            {/* RAM 1: 16 KB Even Bank SRAM (e.g. 62128) */}
            <g 
              id="chip-ram1"
              onClick={() => setSelectedChip('ram1')}
              className="cursor-pointer group"
            >
              <rect 
                x="1030" y="48" width="250" height="240" rx="10" 
                fill={selectedChip === 'ram1' ? '#eef2ff' : (ram1EvenActive ? '#f0fdf4' : '#ffffff')} 
                stroke={selectedChip === 'ram1' ? '#4f46e5' : (ram1EvenActive ? '#16a34a' : '#94a3b8')} 
                strokeWidth={selectedChip === 'ram1' || ram1EvenActive ? 2.5 : 1.5}
                filter="drop-shadow(0 2px 6px rgba(0,0,0,0.05))"
              />
              <rect x="1030" y="48" width="250" height="34" rx="10" fill="#e0e7ff" stroke="#c7d2fe" strokeWidth="1" />
              <text x="1155" y="66" textAnchor="middle" fill="#1e1b4b" fontWeight="bold" fontSize="11.5">
                RAM 1: 16 KB SRAM (Even Bank)
              </text>
              <text x="1155" y="78" textAnchor="middle" fill="#3730a3" fontSize="8.5">
                62128 (16K × 8) • Range: 00000H–07FFEH
              </text>

              {/* Status Badge */}
              <rect 
                x="1160" y="88" width="110" height="18" rx="4" 
                fill={ram1EvenActive ? '#dcfce7' : '#f1f5f9'} 
                stroke={ram1EvenActive ? '#86efac' : '#cbd5e1'} 
              />
              <text 
                x="1215" y="100" textAnchor="middle" 
                fill={ram1EvenActive ? '#15803d' : '#64748b'} 
                fontSize="8.5" fontWeight="bold"
              >
                {ram1EvenActive ? '● ACTIVE (EVEN)' : '○ STANDBY'}
              </text>

              {/* RAM 1 Pin Labels */}
              <text x="1042" y="108" fill="#475569" fontSize="9">A0–A13 (14 pins) ← A1–A14</text>
              <text x="1042" y="139" fill="#2563eb" fontSize="9" fontWeight="bold">D0–D7 (Data Bus)</text>
              <text x="1042" y="184" fill={ce1Bar === 0 ? '#15803d' : '#94a3b8'} fontSize="9" fontWeight="bold">
                CE1# (Pin) = {ce1Bar}
              </text>
              <text x="1042" y="219" fill={rd === 0 ? '#0284c7' : '#94a3b8'} fontSize="9" fontWeight="bold">
                OE# (Pin) = {rd} (RD#)
              </text>
              <text x="1042" y="254" fill={wr === 0 ? '#d97706' : '#94a3b8'} fontSize="9" fontWeight="bold">
                WE# (Pin) = {wr} (WR#)
              </text>
            </g>

            {/* RAM 2: 16 KB Odd Bank SRAM (e.g. 62128) */}
            <g 
              id="chip-ram2"
              onClick={() => setSelectedChip('ram2')}
              className="cursor-pointer group"
            >
              <rect 
                x="1030" y="330" width="250" height="240" rx="10" 
                fill={selectedChip === 'ram2' ? '#fffbeb' : (ram2OddActive ? '#fefce8' : '#ffffff')} 
                stroke={selectedChip === 'ram2' ? '#d97706' : (ram2OddActive ? '#eab308' : '#94a3b8')} 
                strokeWidth={selectedChip === 'ram2' || ram2OddActive ? 2.5 : 1.5}
                filter="drop-shadow(0 2px 6px rgba(0,0,0,0.05))"
              />
              <rect x="1030" y="330" width="250" height="34" rx="10" fill="#fef3c7" stroke="#fde68a" strokeWidth="1" />
              <text x="1155" y="348" textAnchor="middle" fill="#78350f" fontWeight="bold" fontSize="11.5">
                RAM 2: 16 KB SRAM (Odd Bank)
              </text>
              <text x="1155" y="360" textAnchor="middle" fill="#92400e" fontSize="8.5">
                62128 (16K × 8) • Range: 00001H–07FFFH
              </text>

              {/* Status Badge */}
              <rect 
                x="1160" y="370" width="110" height="18" rx="4" 
                fill={ram2OddActive ? '#fef9c3' : '#f1f5f9'} 
                stroke={ram2OddActive ? '#fde047' : '#cbd5e1'} 
              />
              <text 
                x="1215" y="382" textAnchor="middle" 
                fill={ram2OddActive ? '#854d0e' : '#64748b'} 
                fontSize="8.5" fontWeight="bold"
              >
                {ram2OddActive ? '● ACTIVE (ODD)' : '○ STANDBY'}
              </text>

              {/* RAM 2 Pin Labels */}
              <text x="1042" y="388" fill="#475569" fontSize="9">A0–A13 (14 pins) ← A1–A14</text>
              <text x="1042" y="419" fill="#d97706" fontSize="9" fontWeight="bold">D8–D15 (Data Bus)</text>
              <text x="1042" y="454" fill={ce2Bar === 0 ? '#b45309' : '#94a3b8'} fontSize="9" fontWeight="bold">
                CE2# (Pin) = {ce2Bar}
              </text>
              <text x="1042" y="489" fill={rd === 0 ? '#0284c7' : '#94a3b8'} fontSize="9" fontWeight="bold">
                OE# (Pin) = {rd} (RD#)
              </text>
              <text x="1042" y="524" fill={wr === 0 ? '#d97706' : '#94a3b8'} fontSize="9" fontWeight="bold">
                WE# (Pin) = {wr} (WR#)
              </text>
            </g>

            {/* Bottom Legend */}
            <g transform="translate(40, 642)">
              <text x="0" y="15" fill="#475569" fontSize="10" fontWeight="bold">Schematic Legend:</text>
              <circle cx="120" cy="12" r="4" fill="#2563eb" />
              <text x="130" y="15" fill="#334155" fontSize="9.5">Address / Lower Data (D0–D7)</text>
              <circle cx="310" cy="12" r="4" fill="#d97706" />
              <text x="320" y="15" fill="#334155" fontSize="9.5">Upper Data (D8–D15)</text>
              <circle cx="470" cy="12" r="4" fill="#16a34a" />
              <text x="480" y="15" fill="#334155" fontSize="9.5">Active Low Chip Select (CS#/CE#)</text>
              <circle cx="680" cy="12" r="4" fill="#ea580c" />
              <text x="690" y="15" fill="#334155" fontSize="9.5">Control Strobes (ALE, RD#, WR#)</text>
            </g>
          </svg>
        </div>
      </div>

      {/* Chip Technical Inspector Panel */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-3 md:p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
              <Layers className="w-4 h-4" />
            </span>
            <div>
              <h4 className="font-bold text-xs md:text-sm text-slate-900">{currentChipInfo.title}</h4>
              <p className="text-[11px] text-slate-500">{currentChipInfo.subtitle}</p>
            </div>
          </div>

          {/* Chip Quick Selector Buttons */}
          <div className="flex flex-wrap items-center gap-1 text-xs">
            <span className="text-[11px] text-slate-500 font-semibold mr-1">Inspect IC:</span>
            {[
              { id: 'ram1', label: 'RAM 1 (Even 16KB)' },
              { id: 'ram2', label: 'RAM 2 (Odd 16KB)' },
              { id: 'u1', label: '8086 MPU' },
              { id: 'u2', label: '74LS373 Latches' },
              { id: 'u3_dec', label: 'NAND Decoder' },
              { id: 'u_or', label: 'Bank OR Gates' },
              { id: 'u4', label: '74LS245 Buffers' },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => setSelectedChip(chip.id)}
                className={`px-2 py-1 rounded-lg font-semibold transition-all border cursor-pointer ${
                  selectedChip === chip.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">{currentChipInfo.desc}</p>

        {/* Technical Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {currentChipInfo.techSpecs.map((spec, idx) => (
            <div key={idx} className="bg-white p-2 rounded-xl border border-slate-200 space-y-0.5">
              <div className="text-[10px] uppercase font-bold text-slate-400">{spec.label}</div>
              <div className="font-semibold text-slate-800 text-[11px]">{spec.val}</div>
            </div>
          ))}
        </div>

        {/* Real-time Pin State Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Real-time Pin Logic &amp; Bus States (Clock State: T{tState})</span>
            <span className="font-mono text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              Live Evaluation
            </span>
          </div>
          <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
            {currentChipInfo.pins.map((pin, idx) => (
              <div key={idx} className="px-3 py-1.5 flex items-center justify-between text-xs hover:bg-slate-50">
                <div className="font-mono font-bold text-slate-800 w-1/3 truncate">{pin.pin}</div>
                <div className="text-slate-500 text-[11px] w-1/3 truncate">{pin.role}</div>
                <div className="font-mono font-semibold text-indigo-900 text-right w-1/3 truncate">
                  {pin.state}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
