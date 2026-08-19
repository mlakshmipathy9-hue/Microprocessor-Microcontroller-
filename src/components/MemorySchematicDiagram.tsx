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
  Radio
} from 'lucide-react';

export type MemoryCycleScenario = 
  | 'even-byte-ram-read'
  | 'odd-byte-ram-read'
  | 'aligned-word-ram-write'
  | 'boot-eprom-read'
  | 'misaligned-word-read';

export interface MemorySchematicDiagramProps {
  initialScenario?: MemoryCycleScenario;
}

export default function MemorySchematicDiagram({
  initialScenario = 'aligned-word-ram-write'
}: MemorySchematicDiagramProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedChip, setSelectedChip] = useState<string | null>('u1');
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
    scenarioDesc = `Simulating user-defined address ${addressHex}H on the 8086 system bus.`;
  } else {
    switch (activeScenario) {
      case 'even-byte-ram-read':
        addressHex = '00100';
        isWord = false;
        isWrite = false;
        scenarioTitle = '1. Even Byte SRAM Read (Address 00100H)';
        scenarioDesc = '8086 reads 1 byte from Even RAM Bank via lower data bus D0–D7 (A0=0, BHE#=1, RD#=0, Y0#=0).';
        break;
      case 'odd-byte-ram-read':
        addressHex = '00101';
        isWord = false;
        isWrite = false;
        scenarioTitle = '2. Odd Byte SRAM Read (Address 00101H)';
        scenarioDesc = '8086 reads 1 byte from Odd RAM Bank via upper data bus D8–D15 (A0=1, BHE#=0, RD#=0, Y0#=0).';
        break;
      case 'aligned-word-ram-write':
        addressHex = '00200';
        isWord = true;
        isWrite = true;
        scenarioTitle = '3. Aligned 16-Bit Word SRAM Write (Address 00200H)';
        scenarioDesc = '8086 writes a full 16-bit word to BOTH Even & Odd RAM banks in a SINGLE bus cycle (A0=0, BHE#=0, WR#=0, Y0#=0).';
        break;
      case 'boot-eprom-read':
        addressHex = 'FFFF0';
        isWord = true;
        isWrite = false;
        scenarioTitle = '4. 8086 RESET Boot Vector Fetch from EPROM (Address FFFF0H)';
        scenarioDesc = 'Upon RESET, 8086 fetches initial instruction word from EPROM banks at top of memory (A17–A19=111b, Y7#=0, RD#=0).';
        break;
      case 'misaligned-word-read':
        addressHex = '00101';
        isWord = true;
        isWrite = false;
        scenarioTitle = '5. Misaligned 16-Bit Word Access (Address 00101H)';
        scenarioDesc = 'Word starts at odd address 00101H: Requires 2 sequential bus cycles (Cycle 1: Odd byte at 00101H; Cycle 2: Even byte at 00102H).';
        break;
    }
  }

  const addrVal = parseInt(addressHex, 16) || 0;
  const isEvenAddress = (addrVal % 2) === 0;

  // Signal computations
  const a0 = isEvenAddress ? 0 : 1;
  const bhe = (isWord || !isEvenAddress) ? 0 : 1;

  // High address lines for 74LS138 decoder
  const a19 = (addrVal >> 19) & 1;
  const a18 = (addrVal >> 18) & 1;
  const a17 = (addrVal >> 17) & 1;

  // M/IO# signal (Memory = 1, I/O = 0 for 8086 Minimum Mode)
  const mio = 1;

  // Decoder 74LS138: G1=M/IO# (1), G2A#=0, G2B#=0
  const decoderSelect = (a19 << 2) | (a18 << 1) | a17;
  const y0 = decoderSelect === 0 ? 0 : 1; // SRAM Range (00000H - 1FFFFH)
  const y7 = decoderSelect === 7 ? 0 : 1; // EPROM Range (E0000H - FFFFFH)

  // Bus Control Strobes based on T-State
  const ale = tState === 1 ? 1 : 0;
  const rd = (!isWrite && (tState === 2 || tState === 3)) ? 0 : 1;
  const wr = (isWrite && (tState === 2 || tState === 3)) ? 0 : 1;
  const den = (tState >= 2 && tState <= 4) ? 0 : 1;
  const dtr = isWrite ? 1 : 0; // 1 = Transmit (Write), 0 = Receive (Read)

  // Chip Enable conditions
  const isSramTarget = y0 === 0;
  const isEpromTarget = y7 === 0;

  const evenSramActive = isSramTarget && (a0 === 0);
  const oddSramActive = isSramTarget && (bhe === 0);
  const evenEpromActive = isEpromTarget && (a0 === 0);
  const oddEpromActive = isEpromTarget && (bhe === 0);

  // Transceiver Active States
  const lowerTransceiverActive = (den === 0) && (a0 === 0 || isWord);
  const upperTransceiverActive = (den === 0) && (bhe === 0 || isWord);

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
      desc: 'The central processing unit that executes memory bus cycles. In Minimum Mode (Pin 33 connected to +5V), it directly outputs bus control signals ALE, M/IO#, RD#, WR#, DEN#, and DT/R# without needing an external 8288 bus controller.',
      techSpecs: [
        { label: 'Clock Frequency', val: '5 MHz (Standard 8086) / 8 MHz (8086-2)' },
        { label: 'Address Bus', val: '20-bit (A0–A19) addressing 1 MB space' },
        { label: 'Data Bus', val: '16-bit multiplexed (AD0–AD15)' },
        { label: 'Memory Banks', val: 'Even Bank (D0–D7) & Odd Bank (D8–D15)' }
      ],
      pins: [
        { pin: 'AD0–AD15 (Pins 16–2, 39)', role: 'Time-multiplexed Address (T1) and Data (T2–T4)', state: tState === 1 ? `Addr: ${addressHex}H` : (isWrite ? 'Data Out (CPU->Mem)' : 'Data In (Mem->CPU)') },
        { pin: 'A16–A19 (Pins 35–38)', role: 'Time-multiplexed Upper Address and Status (S3–S6)', state: `${a19}${a18}${a17} (High bits for Decoder)` },
        { pin: 'BHE#/S7 (Pin 34)', role: 'Bus High Enable (Active LOW for Odd Bank)', state: bhe === 0 ? '0 (LOW - Odd Bank ENABLED)' : '1 (HIGH - Odd Inactive)' },
        { pin: 'ALE (Pin 25)', role: 'Address Latch Enable strobe for 74LS373', state: ale === 1 ? '1 (PULSE HIGH in T1)' : '0 (LOW in T2–T4)' },
        { pin: 'M/IO# (Pin 28)', role: 'Memory (HIGH) vs I/O (LOW) cycle selector', state: '1 (HIGH - Memory Cycle)' },
        { pin: 'RD# (Pin 32)', role: 'Active-LOW Memory Read strobe', state: rd === 0 ? '0 (ACTIVE READ)' : '1 (IDLE)' },
        { pin: 'WR# (Pin 29)', role: 'Active-LOW Memory Write strobe', state: wr === 0 ? '0 (ACTIVE WRITE)' : '1 (IDLE)' },
        { pin: 'DEN# (Pin 26)', role: 'Data Enable (Active LOW for 74LS245 Buffers)', state: den === 0 ? '0 (ACTIVE LOW)' : '1 (Tristate)' },
        { pin: 'DT/R# (Pin 27)', role: 'Data Transmit (1=Write) / Receive (0=Read)', state: dtr === 1 ? '1 (TRANSMIT)' : '0 (RECEIVE)' }
      ]
    },
    u2a: {
      title: 'U2A: 74LS373 Octal Transparent D-Latch (Lower Address)',
      subtitle: 'Demultiplexes AD0–AD7 into Dedicated Address Lines A0–A7',
      desc: 'During clock state T1, the 8086 drives the lower address byte on AD0–AD7 and pulses ALE HIGH. On the falling edge of ALE at the end of T1, U2A latches and holds stable address bits A0–A7 throughout T2, T3, and T4.',
      techSpecs: [
        { label: 'Latch Type', val: '8-bit transparent D-type latch with 3-state outputs' },
        { label: 'Propagation Delay', val: '~12 ns from LE to Q' },
        { label: 'Output Drive', val: 'Sinks 24 mA on bus lines' }
      ],
      pins: [
        { pin: 'LE (Pin 11)', role: 'Latch Enable driven by 8086 ALE (Pin 25)', state: ale === 1 ? '1 (TRANSPARENT)' : '0 (LATCHED)' },
        { pin: 'OE# (Pin 1)', role: 'Output Enable tied permanently to GND (0V)', state: '0 (ALWAYS ACTIVE)' },
        { pin: 'D0–D7 (Inputs)', role: 'Connected to 8086 multiplexed AD0–AD7', state: `AD0..AD7 from CPU` },
        { pin: 'Q0–Q7 (Outputs)', role: 'Demultiplexed address lines A0–A7', state: `A0=${a0}, A1–A7 to Memory` }
      ]
    },
    u2b: {
      title: 'U2B: 74LS373 Octal Transparent D-Latch (Middle Address)',
      subtitle: 'Demultiplexes AD8–AD15 into Dedicated Address Lines A8–A15',
      desc: 'Latches address bits A8–A15 from multiplexed lines AD8–AD15 during T1 using ALE. Supplies address lines A8–A15 directly to the address inputs of all SRAM and EPROM chips.',
      techSpecs: [
        { label: 'Inputs', val: 'AD8–AD15 from 8086' },
        { label: 'Outputs', val: 'Stable A8–A15 to memory array' },
        { label: 'Control', val: 'LE driven by ALE, OE# grounded' }
      ],
      pins: [
        { pin: 'LE (Pin 11)', role: 'Driven by 8086 ALE', state: ale === 1 ? '1 (HIGH)' : '0 (LATCHED)' },
        { pin: 'Q0–Q7 (Outputs)', role: 'A8–A15 to memory chips', state: `A8..A15 Active` }
      ]
    },
    u2c: {
      title: 'U2C: 74LS373 Octal Transparent D-Latch (Upper Address & BHE#)',
      subtitle: 'Latches A16–A19 and BHE# to Provide Steady Decoder & Bank Signals',
      desc: 'Latches the high-order address lines A16, A17, A18, A19 (multiplexed with status lines S3–S6) and BHE# (multiplexed with S7). Feeds A17–A19 into the 74LS138 decoder to select the target memory chip.',
      techSpecs: [
        { label: 'Inputs', val: 'A16/S3 – A19/S6, BHE#/S7' },
        { label: 'Outputs', val: 'Latched A16–A19 (to Decoder) and latched BHE#' },
        { label: 'Decoder Feeds', val: 'A17->A, A18->B, A19->C on 74LS138' }
      ],
      pins: [
        { pin: 'LE (Pin 11)', role: 'Driven by 8086 ALE', state: ale === 1 ? '1 (HIGH)' : '0 (LATCHED)' },
        { pin: 'Latched BHE#', role: 'Odd memory bank select line', state: bhe === 0 ? '0 (LOW - ACTIVE)' : '1 (HIGH)' },
        { pin: 'Latched A17–A19', role: 'Wired to 74LS138 inputs A, B, C', state: `${a19}${a18}${a17}b` }
      ]
    },
    u3: {
      title: 'U3: 74LS138 3-to-8 Line Address Decoder',
      subtitle: 'High-Order Address Decoder & Chip Select (CS#) Generator',
      desc: 'Decodes high-order address lines A17, A18, A19 to partition the 1 MB address space into 8 discrete 128 KB blocks. Generates active-low Chip Select outputs: Y0# selects SRAM (00000H–1FFFFH) and Y7# selects EPROM (E0000H–FFFFFH).',
      techSpecs: [
        { label: 'Decoder Type', val: '3-to-8 binary decoder / demultiplexer' },
        { label: 'Enable Pins', val: 'G1 (Active HIGH), G2A# & G2B# (Active LOW)' },
        { label: 'Block Size', val: '128 KB per output pin (2^17 bytes)' }
      ],
      pins: [
        { pin: 'A, B, C (Pins 1, 2, 3)', role: 'Select inputs wired to Latched A17, A18, A19', state: `C=${a19}, B=${a18}, A=${a17} (Index: ${decoderSelect})` },
        { pin: 'G1 (Pin 6)', role: 'Active-HIGH enable driven by 8086 M/IO# (Pin 28)', state: '1 (HIGH - Memory enabled)' },
        { pin: 'G2A#, G2B# (Pins 4, 5)', role: 'Active-LOW enables tied to GND (0V)', state: '0 (ENABLED)' },
        { pin: 'Y0# (Pin 15)', role: 'Active-LOW CS for SRAM (00000H–1FFFFH)', state: y0 === 0 ? '0 (SELECTED / LOW)' : '1 (HIGH)' },
        { pin: 'Y7# (Pin 7)', role: 'Active-LOW CS for EPROM (E0000H–FFFFFH)', state: y7 === 0 ? '0 (SELECTED / LOW)' : '1 (HIGH)' }
      ]
    },
    u4a: {
      title: 'U4A: 74LS245 Octal Bus Transceiver (Lower Data Bus D0–D7)',
      subtitle: 'Bidirectional Buffer for Even Memory Bank',
      desc: 'Buffers data flow between 8086 multiplexed AD0–AD7 and Even Memory Bank D0–D7. Isolates the CPU from capacitive bus loading and ensures adequate current drive during reads and writes.',
      techSpecs: [
        { label: 'DIR (Pin 1)', val: 'Direction: 1 = Transmit (A->B, CPU to Mem), 0 = Receive (B->A, Mem to CPU)' },
        { label: 'OE# (Pin 19)', val: 'Output Enable: Driven by 8086 DEN# (Active LOW)' }
      ],
      pins: [
        { pin: 'DIR (Pin 1)', role: 'Driven by 8086 DT/R# (Pin 27)', state: dtr === 1 ? '1 (TRANSMIT / WRITE)' : '0 (RECEIVE / READ)' },
        { pin: 'OE# (Pin 19)', role: 'Driven by 8086 DEN# (Pin 26)', state: den === 0 ? '0 (BUFFER ACTIVE)' : '1 (TRISTATE)' },
        { pin: 'A0–A7 (CPU side)', role: 'Wired to 8086 AD0–AD7', state: 'Lower byte bus' },
        { pin: 'B0–B7 (Memory side)', role: 'Wired to Even Bank D0–D7', state: lowerTransceiverActive ? 'Passing Data' : 'High-Z' }
      ]
    },
    u4b: {
      title: 'U4B: 74LS245 Octal Bus Transceiver (Upper Data Bus D8–D15)',
      subtitle: 'Bidirectional Buffer for Odd Memory Bank',
      desc: 'Buffers data flow between 8086 multiplexed AD8–AD15 and Odd Memory Bank D8–D15. Activated whenever the 8086 performs a 16-bit word transfer or an 8-bit odd-byte transfer.',
      techSpecs: [
        { label: 'DIR (Pin 1)', val: 'Direction driven by DT/R#' },
        { label: 'OE# (Pin 19)', val: 'Output Enable driven by DEN#' }
      ],
      pins: [
        { pin: 'DIR (Pin 1)', role: 'Driven by 8086 DT/R#', state: dtr === 1 ? '1 (TRANSMIT)' : '0 (RECEIVE)' },
        { pin: 'OE# (Pin 19)', role: 'Driven by 8086 DEN#', state: den === 0 ? '0 (BUFFER ACTIVE)' : '1 (TRISTATE)' },
        { pin: 'B0–B7 (Memory side)', role: 'Wired to Odd Bank D8–D15', state: upperTransceiverActive ? 'Passing Data' : 'High-Z' }
      ]
    },
    u5a: {
      title: 'U5A: 62256 Static RAM (Even Bank - 32 KB × 8)',
      subtitle: 'Lower Byte RAM for Even Addresses (00000H, 00002H, 00004H...)',
      desc: 'Stores bytes located at even physical addresses. Selected when Y0#=0 and A0=0 (via OR gate). Data bus connected to D0–D7. OE# connects to 8086 RD#, WE# connects to 8086 WR#.',
      techSpecs: [
        { label: 'Capacity', val: '32,768 Bytes (32 KB × 8-bit)' },
        { label: 'Data Bus', val: 'D0–D7 (Lower 8 bits)' },
        { label: 'Address Inputs', val: 'A0–A14 connected to latched A1–A15' },
        { label: 'Bank Selection', val: 'CE# = Y0# OR A0 (Active when both LOW)' }
      ],
      pins: [
        { pin: 'CE# (Chip Enable)', role: 'Gated by Y0# and A0', state: evenSramActive ? '0 (CHIP SELECTED)' : '1 (DESELECTED)' },
        { pin: 'OE# (Output Enable)', role: 'Connected to 8086 RD#', state: rd === 0 ? '0 (OUTPUT ENABLED)' : '1 (HIGH)' },
        { pin: 'WE# (Write Enable)', role: 'Connected to 8086 WR#', state: wr === 0 ? '0 (WRITE ENABLED)' : '1 (HIGH)' },
        { pin: 'D0–D7', role: 'Lower byte data pins', state: evenSramActive ? (isWrite ? 'Write in progress' : 'Driving data out') : 'High-Z' }
      ]
    },
    u5b: {
      title: 'U5B: 62256 Static RAM (Odd Bank - 32 KB × 8)',
      subtitle: 'Upper Byte RAM for Odd Addresses (00001H, 00003H, 00005H...)',
      desc: 'Stores bytes located at odd physical addresses. Selected when Y0#=0 and BHE#=0 (via OR gate). Data bus connected to D8–D15. Together with U5A, forms a 64 KB 16-bit word RAM array.',
      techSpecs: [
        { label: 'Capacity', val: '32,768 Bytes (32 KB × 8-bit)' },
        { label: 'Data Bus', val: 'D8–D15 (Upper 8 bits)' },
        { label: 'Address Inputs', val: 'A0–A14 connected to latched A1–A15' },
        { label: 'Bank Selection', val: 'CE# = Y0# OR BHE# (Active when both LOW)' }
      ],
      pins: [
        { pin: 'CE# (Chip Enable)', role: 'Gated by Y0# and BHE#', state: oddSramActive ? '0 (CHIP SELECTED)' : '1 (DESELECTED)' },
        { pin: 'OE# (Output Enable)', role: 'Connected to 8086 RD#', state: rd === 0 ? '0 (OUTPUT ENABLED)' : '1 (HIGH)' },
        { pin: 'WE# (Write Enable)', role: 'Connected to 8086 WR#', state: wr === 0 ? '0 (WRITE ENABLED)' : '1 (HIGH)' },
        { pin: 'D0–D7', role: 'Wired to Upper Data Bus D8–D15', state: oddSramActive ? (isWrite ? 'Write in progress' : 'Driving data out') : 'High-Z' }
      ]
    },
    u6a: {
      title: 'U6A: 27256 EPROM (Even Bank - 32 KB × 8)',
      subtitle: 'Lower Byte Non-Volatile Boot ROM (Addresses ending at FFFFEH)',
      desc: 'Contains lower bytes of the system boot firmware and BIOS routines. Selected when Y7#=0 and A0=0. Read-only device with OE# wired to 8086 RD# (no WE# pin).',
      techSpecs: [
        { label: 'Capacity', val: '32 KB × 8-bit UV-erasable EPROM' },
        { label: 'Data Bus', val: 'D0–D7 (Lower byte)' },
        { label: 'Location', val: 'Mapped at top of memory ending at FFFFFH' }
      ],
      pins: [
        { pin: 'CE# (Chip Enable)', role: 'Gated by Y7# and A0', state: evenEpromActive ? '0 (CHIP SELECTED)' : '1 (DESELECTED)' },
        { pin: 'OE# (Output Enable)', role: 'Connected to 8086 RD#', state: rd === 0 ? '0 (OUTPUT ENABLED)' : '1 (HIGH)' },
        { pin: 'D0–D7', role: 'Wired to Lower Data Bus D0–D7', state: evenEpromActive ? 'Driving ROM code' : 'High-Z' }
      ]
    },
    u6b: {
      title: 'U6B: 27256 EPROM (Odd Bank - 32 KB × 8)',
      subtitle: 'Upper Byte Non-Volatile Boot ROM (Addresses ending at FFFFFH)',
      desc: 'Contains upper bytes of the system boot firmware. Selected when Y7#=0 and BHE#=0. Upon hardware RESET, the 8086 executes from FFFF0H, fetching code words simultaneously from U6A and U6B.',
      techSpecs: [
        { label: 'Capacity', val: '32 KB × 8-bit UV-erasable EPROM' },
        { label: 'Data Bus', val: 'D8–D15 (Upper byte)' },
        { label: 'Reset Vector', val: '8086 starts at FFFF0H from this chip array' }
      ],
      pins: [
        { pin: 'CE# (Chip Enable)', role: 'Gated by Y7# and BHE#', state: oddEpromActive ? '0 (CHIP SELECTED)' : '1 (DESELECTED)' },
        { pin: 'OE# (Output Enable)', role: 'Connected to 8086 RD#', state: rd === 0 ? '0 (OUTPUT ENABLED)' : '1 (HIGH)' },
        { pin: 'D0–D7', role: 'Wired to Upper Data Bus D8–D15', state: oddEpromActive ? 'Driving ROM code' : 'High-Z' }
      ]
    }
  };

  const currentChipInfo = selectedChip ? chipData[selectedChip] : chipData.u1;

  return (
    <div className="bg-slate-900 text-slate-100 p-3 md:p-4 rounded-2xl border border-slate-800 shadow-xl space-y-4 font-sans select-none">
      {/* Top Header & Interactive Scenario Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-900/60 text-indigo-400 border border-indigo-700/50 rounded-xl shadow-inner">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm md:text-base text-white tracking-wide">
                8086 Complete Memory Interfacing Schematic Circuit 📐💾
              </h3>
              <span className="bg-indigo-950 text-indigo-300 border border-indigo-700/60 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">
                1 MB Address Space
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Minimum Mode 8086 • 3× 74LS373 Latches • 74LS138 Decoder • 2× 74LS245 Transceivers • Even/Odd SRAM &amp; EPROM Banks
            </p>
          </div>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.7, +(z - 0.1).toFixed(1)))}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/60 transition-all cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono font-bold text-indigo-300 px-1.5 min-w-[3rem] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.5, +(z + 0.1).toFixed(1)))}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/60 transition-all cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/60 transition-all cursor-pointer"
            title="Reset Zoom"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preset Scenarios Selector Strip */}
      <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-indigo-400" /> Select Memory Access Scenario / Test Case:
          </span>
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-slate-300 flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={useCustomAddress}
                onChange={(e) => setUseCustomAddress(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
              />
              <span className="font-semibold">Custom Address Mode</span>
            </label>
          </div>
        </div>

        {!useCustomAddress ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {[
              { id: 'aligned-word-ram-write', label: '16-bit Word SRAM Write', tag: '00200H (Both Banks)' },
              { id: 'even-byte-ram-read', label: 'Even Byte SRAM Read', tag: '00100H (D0–D7)' },
              { id: 'odd-byte-ram-read', label: 'Odd Byte SRAM Read', tag: '00101H (D8–D15)' },
              { id: 'boot-eprom-read', label: '8086 RESET Boot EPROM', tag: 'FFFF0H (Vector)' },
              { id: 'misaligned-word-read', label: 'Misaligned Word (2-Cycles)', tag: '00101H (Penalty)' }
            ].map((sc) => {
              const isSel = activeScenario === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => {
                    setActiveScenario(sc.id as MemoryCycleScenario);
                    setUseCustomAddress(false);
                  }}
                  className={`p-2 rounded-xl text-left transition-all border cursor-pointer flex flex-col justify-between ${
                    isSel 
                      ? 'bg-indigo-900/60 border-indigo-500 shadow-md shadow-indigo-950/50 text-white' 
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="font-bold text-xs leading-tight mb-1">{sc.label}</div>
                  <div className="text-[10px] font-mono text-indigo-300/90">{sc.tag}</div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold">20-bit Hex Address:</span>
              <input
                type="text"
                maxLength={5}
                value={customHexAddress}
                onChange={(e) => setCustomHexAddress(e.target.value.toUpperCase().replace(/[^0-9A-F]/g, ''))}
                className="bg-slate-950 text-amber-300 font-mono font-bold text-sm px-2.5 py-1 rounded border border-slate-700 w-24 focus:outline-none focus:border-indigo-500 text-center uppercase"
                placeholder="00100"
              />
              <span className="font-mono text-xs text-slate-500">H</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold">Transfer:</span>
              <button
                onClick={() => setCustomAccessType('byte')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer border ${
                  customAccessType === 'byte' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                8-Bit Byte
              </button>
              <button
                onClick={() => setCustomAccessType('word')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer border ${
                  customAccessType === 'word' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                16-Bit Word
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold">Operation:</span>
              <button
                onClick={() => setCustomOpType('read')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer border ${
                  customOpType === 'read' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                READ (RD#)
              </button>
              <button
                onClick={() => setCustomOpType('write')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer border ${
                  customOpType === 'write' ? 'bg-amber-600 text-white border-amber-500' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                WRITE (WR#)
              </button>
            </div>
          </div>
        )}

        {/* Active Scenario Banner */}
        <div className="flex items-start gap-2 bg-indigo-950/40 p-2.5 rounded-lg border border-indigo-800/40 text-xs">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-slate-200">
            <strong className="text-indigo-300">{scenarioTitle}: </strong>
            {scenarioDesc}
          </div>
        </div>
      </div>

      {/* T-State Stepper & Real-Time Logic Probes Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">8086 Bus Cycle:</span>
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            {[1, 2, 3, 4].map((stateNum) => {
              const isCurrent = tState === stateNum;
              return (
                <button
                  key={stateNum}
                  onClick={() => {
                    setTState(stateNum as 1 | 2 | 3 | 4);
                    setIsAutoStepping(false);
                  }}
                  className={`px-2.5 py-1 rounded-md font-mono font-bold text-xs transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  T{stateNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setIsAutoStepping(!isAutoStepping)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all ${
              isAutoStepping
                ? 'bg-amber-600/80 hover:bg-amber-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isAutoStepping ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAutoStepping ? 'Pause Cycle' : 'Auto Step'}</span>
          </button>
        </div>

        {/* Live Logic Probe Pills */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
          <span className={`px-2 py-0.5 rounded border ${ale === 1 ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-bold' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
            ALE={ale}
          </span>
          <span className={`px-2 py-0.5 rounded border ${bhe === 0 ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/60 font-bold' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
            BHE#={bhe}
          </span>
          <span className={`px-2 py-0.5 rounded border ${a0 === 0 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 font-bold' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
            A0={a0}
          </span>
          <span className={`px-2 py-0.5 rounded border ${rd === 0 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 font-bold' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
            RD#={rd}
          </span>
          <span className={`px-2 py-0.5 rounded border ${wr === 0 ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-bold' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
            WR#={wr}
          </span>
          <span className={`px-2 py-0.5 rounded border ${y0 === 0 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 font-bold' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
            Y0#(SRAM)={y0}
          </span>
          <span className={`px-2 py-0.5 rounded border ${y7 === 0 ? 'bg-purple-500/20 text-purple-300 border-purple-500/60 font-bold' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
            Y7#(ROM)={y7}
          </span>
        </div>
      </div>

      {/* SCHEMATIC SVG CANVAS CONTAINER */}
      <div className="relative w-full overflow-x-auto bg-slate-950/90 rounded-2xl border border-slate-800 p-2 scrollbar-thin">
        <div 
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left', minWidth: '1560px' }}
          className="transition-transform duration-200"
        >
          <svg
            viewBox="0 0 1620 740"
            className="w-full h-auto text-[11px] font-mono select-none"
            style={{ minHeight: '700px' }}
          >
            <defs>
              {/* Bus Pattern and Markers */}
              <marker id="arrow-indigo" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#818cf8" />
              </marker>
              <marker id="arrow-emerald" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#34d399" />
              </marker>
              <marker id="arrow-amber" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24" />
              </marker>
              <marker id="arrow-cyan" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#22d3ee" />
              </marker>
              <marker id="arrow-rose" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
              </marker>

              {/* IC Gradients */}
              <linearGradient id="icGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="icGradActive" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#312e81" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
            </defs>

            {/* Background Grid Lines */}
            <g stroke="#334155" strokeWidth="0.5" strokeDasharray="4 8" opacity="0.4">
              {Array.from({ length: 16 }).map((_, i) => (
                <line key={`vg-${i}`} x1={i * 100} y1="0" x2={i * 100} y2="740" />
              ))}
              {Array.from({ length: 8 }).map((_, i) => (
                <line key={`hg-${i}`} x1="0" y1={i * 100} x2="1620" y2={i * 100} />
              ))}
            </g>

            {/* ========================================================================= */}
            {/* 1. MAIN INTERCONNECT TRACES & BUSES                                      */}
            {/* ========================================================================= */}

            {/* AD0–AD7 Bus (8086 Pin to Latches U2A & Transceiver U4A) */}
            <g>
              <path
                d="M 280 150 L 370 150"
                stroke={ale === 1 ? '#fbbf24' : '#818cf8'}
                strokeWidth={ale === 1 ? '4' : '3'}
                fill="none"
              />
              <path
                d="M 320 150 L 320 110 L 640 110"
                stroke={lowerTransceiverActive ? '#34d399' : '#64748b'}
                strokeWidth="2.5"
                fill="none"
              />
              {/* Bus Label Badge */}
              <rect x="290" y="138" width="65" height="18" rx="4" fill="#0f172a" stroke="#818cf8" strokeWidth="1" />
              <text x="322" y="151" fill="#c7d2fe" fontSize="10" fontWeight="bold" textAnchor="middle">AD0–AD7</text>
            </g>

            {/* AD8–AD15 Bus (8086 to Latch U2B & Transceiver U4B) */}
            <g>
              <path
                d="M 280 290 L 370 290"
                stroke={ale === 1 ? '#fbbf24' : '#818cf8'}
                strokeWidth={ale === 1 ? '4' : '3'}
                fill="none"
              />
              <path
                d="M 330 290 L 330 290 L 640 290"
                stroke={upperTransceiverActive ? '#34d399' : '#64748b'}
                strokeWidth="2.5"
                fill="none"
              />
              <rect x="290" y="278" width="70" height="18" rx="4" fill="#0f172a" stroke="#818cf8" strokeWidth="1" />
              <text x="325" y="291" fill="#c7d2fe" fontSize="10" fontWeight="bold" textAnchor="middle">AD8–AD15</text>
            </g>

            {/* A16–A19 & BHE# Bus (8086 to Latch U2C) */}
            <g>
              <path
                d="M 280 470 L 370 470"
                stroke={ale === 1 ? '#fbbf24' : '#a78bfa'}
                strokeWidth="3"
                fill="none"
              />
              <rect x="285" y="458" width="80" height="18" rx="4" fill="#0f172a" stroke="#a78bfa" strokeWidth="1" />
              <text x="325" y="471" fill="#ddd6fe" fontSize="10" fontWeight="bold" textAnchor="middle">A16–A19,BHE#</text>
            </g>

            {/* ALE Line (Pin 25) to LE of all 3 Latches (U2A, U2B, U2C) */}
            <g>
              <path
                d="M 280 520 L 350 520 L 350 200 L 370 200"
                stroke={ale === 1 ? '#f59e0b' : '#475569'}
                strokeWidth={ale === 1 ? '3.5' : '1.5'}
                strokeDasharray={ale === 1 ? 'none' : '4 4'}
                fill="none"
              />
              {/* Branch to U2B LE */}
              <line x1="350" y1="340" x2="370" y2="340" stroke={ale === 1 ? '#f59e0b' : '#475569'} strokeWidth={ale === 1 ? '3.5' : '1.5'} />
              {/* Branch to U2C LE */}
              <line x1="350" y1="520" x2="370" y2="520" stroke={ale === 1 ? '#f59e0b' : '#475569'} strokeWidth={ale === 1 ? '3.5' : '1.5'} />
              
              <rect x="290" y="508" width="45" height="16" rx="4" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
              <text x="312" y="520" fill="#fde68a" fontSize="9" fontWeight="bold" textAnchor="middle">ALE (P25)</text>
            </g>

            {/* Demultiplexed High Address lines A17–A19 from U2C to 74LS138 Decoder U3 */}
            <g>
              <path
                d="M 550 480 L 640 480"
                stroke="#38bdf8"
                strokeWidth="2.5"
                fill="none"
                markerEnd="url(#arrow-cyan)"
              />
              <rect x="560" y="468" width="70" height="18" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
              <text x="595" y="481" fill="#bae6fd" fontSize="10" fontWeight="bold" textAnchor="middle">A17–A19</text>
            </g>

            {/* M/IO# line from 8086 (Pin 28) to 74LS138 G1 Enable */}
            <g>
              <path
                d="M 280 560 L 620 560 L 620 530 L 640 530"
                stroke="#22c55e"
                strokeWidth="2"
                fill="none"
              />
              <rect x="360" y="548" width="75" height="18" rx="4" fill="#0f172a" stroke="#22c55e" strokeWidth="1" />
              <text x="397" y="561" fill="#bbf7d0" fontSize="10" fontWeight="bold" textAnchor="middle">M/IO# (P28)=1</text>
            </g>

            {/* Demultiplexed Address Bus A1–A15 from Latches to Memory Matrix */}
            <g>
              <path
                d="M 550 150 L 590 150 L 590 30 L 980 30 L 980 120"
                stroke="#38bdf8"
                strokeWidth="3"
                fill="none"
              />
              <line x1="550" y1="290" x2="590" y2="290" stroke="#38bdf8" strokeWidth="2" />
              {/* Feeds to Even SRAM, Odd SRAM, Even EPROM, Odd EPROM */}
              <line x1="980" y1="120" x2="1040" y2="120" stroke="#38bdf8" strokeWidth="2.5" markerEnd="url(#arrow-cyan)" />
              <line x1="980" y1="120" x2="980" y2="420" stroke="#38bdf8" strokeWidth="2.5" />
              <line x1="980" y1="420" x2="1040" y2="420" stroke="#38bdf8" strokeWidth="2.5" markerEnd="url(#arrow-cyan)" />
              <path d="M 980 30 L 1300 30 L 1300 120 L 1330 120" stroke="#38bdf8" strokeWidth="2.5" fill="none" markerEnd="url(#arrow-cyan)" />
              <path d="M 1300 120 L 1300 420 L 1330 420" stroke="#38bdf8" strokeWidth="2.5" fill="none" markerEnd="url(#arrow-cyan)" />

              <rect x="730" y="20" width="130" height="20" rx="5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="795" y="34" fill="#7dd3fc" fontSize="11" fontWeight="bold" textAnchor="middle">Demux Address Bus A1–A15</text>
            </g>

            {/* Demultiplexed A0 and Latched BHE# to Bank OR gates */}
            <g>
              {/* A0 from U2A */}
              <path
                d="M 550 180 L 600 180 L 600 680 L 920 680 L 920 180 L 960 180"
                stroke={a0 === 0 ? '#34d399' : '#64748b'}
                strokeWidth="2"
                fill="none"
              />
              <rect x="620" y="670" width="70" height="18" rx="4" fill="#0f172a" stroke="#34d399" strokeWidth="1" />
              <text x="655" y="683" fill="#6ee7b7" fontSize="10" fontWeight="bold" textAnchor="middle">A0 (Even)</text>

              {/* BHE# from U2C */}
              <path
                d="M 550 510 L 580 510 L 580 710 L 1260 710 L 1260 180 L 1280 180"
                stroke={bhe === 0 ? '#818cf8' : '#64748b'}
                strokeWidth="2"
                fill="none"
              />
              <rect x="720" y="700" width="85" height="18" rx="4" fill="#0f172a" stroke="#818cf8" strokeWidth="1" />
              <text x="762" y="713" fill="#c7d2fe" fontSize="10" fontWeight="bold" textAnchor="middle">BHE# (Odd Bank)</text>
            </g>

            {/* Chip Selects Y0# (SRAM) and Y7# (EPROM) from 74LS138 */}
            <g>
              {/* Y0# (Pin 15) to SRAM OR Gates */}
              <path
                d="M 820 490 L 890 490 L 890 160 L 960 160"
                stroke={y0 === 0 ? '#22d3ee' : '#475569'}
                strokeWidth={y0 === 0 ? '3' : '1.5'}
                fill="none"
              />
              {/* Branch to Odd SRAM OR gate */}
              <path
                d="M 890 160 L 1240 160 L 1280 160"
                stroke={y0 === 0 ? '#22d3ee' : '#475569'}
                strokeWidth={y0 === 0 ? '3' : '1.5'}
                fill="none"
              />
              <rect x="830" y="478" width="60" height="18" rx="4" fill="#0f172a" stroke="#22d3ee" strokeWidth="1" />
              <text x="860" y="491" fill="#a5f3fc" fontSize="10" fontWeight="bold" textAnchor="middle">Y0#(SRAM)</text>

              {/* Y7# (Pin 7) to EPROM OR Gates */}
              <path
                d="M 820 620 L 900 620 L 900 460 L 960 460"
                stroke={y7 === 0 ? '#c084fc' : '#475569'}
                strokeWidth={y7 === 0 ? '3' : '1.5'}
                fill="none"
              />
              {/* Branch to Odd EPROM */}
              <path
                d="M 900 460 L 1240 460 L 1280 460"
                stroke={y7 === 0 ? '#c084fc' : '#475569'}
                strokeWidth={y7 === 0 ? '3' : '1.5'}
                fill="none"
              />
              <rect x="830" y="608" width="65" height="18" rx="4" fill="#0f172a" stroke="#c084fc" strokeWidth="1" />
              <text x="862" y="621" fill="#e9d5ff" fontSize="10" fontWeight="bold" textAnchor="middle">Y7#(EPROM)</text>
            </g>

            {/* Read Strobe RD# and Write Strobe WR# from 8086 */}
            <g>
              {/* RD# to OE# of SRAM & EPROM */}
              <path
                d="M 280 600 L 940 600 L 940 220 L 1040 220"
                stroke={rd === 0 ? '#10b981' : '#475569'}
                strokeWidth={rd === 0 ? '3' : '1.5'}
                fill="none"
              />
              <line x1="940" y1="220" x2="1330" y2="220" stroke={rd === 0 ? '#10b981' : '#475569'} strokeWidth={rd === 0 ? '3' : '1.5'} />
              <line x1="940" y1="520" x2="1040" y2="520" stroke={rd === 0 ? '#10b981' : '#475569'} strokeWidth={rd === 0 ? '3' : '1.5'} />
              <line x1="940" y1="520" x2="1330" y2="520" stroke={rd === 0 ? '#10b981' : '#475569'} strokeWidth={rd === 0 ? '3' : '1.5'} />
              <rect x="450" y="588" width="60" height="18" rx="4" fill="#0f172a" stroke="#10b981" strokeWidth="1" />
              <text x="480" y="601" fill="#a7f3d0" fontSize="10" fontWeight="bold" textAnchor="middle">RD# (OE#)</text>

              {/* WR# to WE# of SRAM */}
              <path
                d="M 280 640 L 930 640 L 930 250 L 1040 250"
                stroke={wr === 0 ? '#f59e0b' : '#475569'}
                strokeWidth={wr === 0 ? '3' : '1.5'}
                fill="none"
              />
              <line x1="930" y1="250" x2="1330" y2="250" stroke={wr === 0 ? '#f59e0b' : '#475569'} strokeWidth={wr === 0 ? '3' : '1.5'} />
              <rect x="520" y="628" width="60" height="18" rx="4" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
              <text x="550" y="641" fill="#fde68a" fontSize="10" fontWeight="bold" textAnchor="middle">WR# (WE#)</text>
            </g>

            {/* Data Buses D0–D7 (Lower) and D8–D15 (Upper) from Transceivers to Memory Arrays */}
            <g>
              {/* D0–D7 Lower Data Bus */}
              <path
                d="M 820 150 L 1040 150"
                stroke={lowerTransceiverActive ? '#34d399' : '#64748b'}
                strokeWidth={lowerTransceiverActive ? '3.5' : '2'}
                fill="none"
                markerEnd="url(#arrow-emerald)"
              />
              {/* Branch down to Even EPROM D0–D7 */}
              <path
                d="M 860 150 L 860 450 L 1040 450"
                stroke={lowerTransceiverActive ? '#34d399' : '#64748b'}
                strokeWidth={lowerTransceiverActive ? '3.5' : '2'}
                fill="none"
                markerEnd="url(#arrow-emerald)"
              />
              <rect x="880" y="138" width="65" height="18" rx="4" fill="#0f172a" stroke="#34d399" strokeWidth="1" />
              <text x="912" y="151" fill="#a7f3d0" fontSize="10" fontWeight="bold" textAnchor="middle">D0–D7 Bus</text>

              {/* D8–D15 Upper Data Bus */}
              <path
                d="M 820 290 L 1200 290 L 1200 150 L 1330 150"
                stroke={upperTransceiverActive ? '#818cf8' : '#64748b'}
                strokeWidth={upperTransceiverActive ? '3.5' : '2'}
                fill="none"
                markerEnd="url(#arrow-indigo)"
              />
              {/* Branch to Odd EPROM D8–D15 */}
              <path
                d="M 1200 290 L 1200 450 L 1330 450"
                stroke={upperTransceiverActive ? '#818cf8' : '#64748b'}
                strokeWidth={upperTransceiverActive ? '3.5' : '2'}
                fill="none"
                markerEnd="url(#arrow-indigo)"
              />
              <rect x="1220" y="138" width="75" height="18" rx="4" fill="#0f172a" stroke="#818cf8" strokeWidth="1" />
              <text x="1257" y="151" fill="#c7d2fe" fontSize="10" fontWeight="bold" textAnchor="middle">D8–D15 Bus</text>
            </g>

            {/* ========================================================================= */}
            {/* 2. CHIP BLOCKS & SYMBOLS                                                 */}
            {/* ========================================================================= */}

            {/* ----------------- U1: Intel 8086 MPU ----------------- */}
            <g
              onClick={() => setSelectedChip('u1')}
              className="cursor-pointer group"
            >
              <rect
                x="50"
                y="80"
                width="230"
                height="600"
                rx="14"
                fill={selectedChip === 'u1' ? 'url(#icGradActive)' : 'url(#icGrad)'}
                stroke={selectedChip === 'u1' ? '#818cf8' : '#475569'}
                strokeWidth={selectedChip === 'u1' ? '2.5' : '1.5'}
                className="transition-all duration-150 group-hover:stroke-indigo-400"
              />
              {/* Chip Notch and Title */}
              <path d="M 150 80 A 15 15 0 0 0 180 80" fill="none" stroke="#64748b" strokeWidth="2" />
              <text x="165" y="115" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">INTEL 8086</text>
              <text x="165" y="130" fill="#94a3b8" fontSize="10" textAnchor="middle">16-Bit Microprocessor</text>
              <text x="165" y="143" fill="#38bdf8" fontSize="9" fontWeight="bold" textAnchor="middle">(Minimum Mode)</text>

              {/* Left Pin Labels (Power & Ground Reference) */}
              <text x="62" y="180" fill="#94a3b8" fontSize="10">VCC (+5V)</text>
              <text x="62" y="210" fill="#94a3b8" fontSize="10">GND (0V)</text>
              <text x="62" y="240" fill="#94a3b8" fontSize="10">CLK (5MHz)</text>
              <text x="62" y="270" fill="#94a3b8" fontSize="10">RESET (P21)</text>
              <text x="62" y="300" fill="#94a3b8" fontSize="10">READY (P22)</text>
              <text x="62" y="330" fill="#38bdf8" fontSize="10" fontWeight="bold">MN/MX# (+5V)</text>
              <text x="62" y="360" fill="#64748b" fontSize="10">INTR (P18)</text>
              <text x="62" y="390" fill="#64748b" fontSize="10">NMI (P17)</text>
              <text x="62" y="420" fill="#64748b" fontSize="10">TEST# (P23)</text>
              <text x="62" y="450" fill="#64748b" fontSize="10">HOLD (P31)</text>

              {/* Right Pin Labels (Buses & Strobes) */}
              <text x="268" y="155" fill="#818cf8" fontSize="11" fontWeight="bold" textAnchor="end">AD0–AD7 (P16–9)</text>
              <text x="268" y="295" fill="#818cf8" fontSize="11" fontWeight="bold" textAnchor="end">AD8–AD15 (P39–2)</text>
              <text x="268" y="475" fill="#c084fc" fontSize="11" fontWeight="bold" textAnchor="end">A16–A19 (P35–38)</text>
              <text x="268" y="525" fill="#f59e0b" fontSize="11" fontWeight="bold" textAnchor="end">ALE (P25)</text>
              <text x="268" y="565" fill="#22c55e" fontSize="11" fontWeight="bold" textAnchor="end">M/IO# (P28)</text>
              <text x="268" y="605" fill="#10b981" fontSize="11" fontWeight="bold" textAnchor="end">RD# (P32)</text>
              <text x="268" y="645" fill="#f59e0b" fontSize="11" fontWeight="bold" textAnchor="end">WR# (P29)</text>
              <text x="268" y="668" fill="#94a3b8" fontSize="10" textAnchor="end">DEN#(26) DT/R#(27)</text>
            </g>

            {/* ----------------- U2A: 74LS373 Latch 1 (AD0–AD7) ----------------- */}
            <g
              onClick={() => setSelectedChip('u2a')}
              className="cursor-pointer group"
            >
              <rect
                x="370"
                y="90"
                width="180"
                height="120"
                rx="10"
                fill={selectedChip === 'u2a' ? 'url(#icGradActive)' : 'url(#icGrad)'}
                stroke={selectedChip === 'u2a' ? '#818cf8' : '#475569'}
                strokeWidth="2"
                className="transition-all duration-150 group-hover:stroke-indigo-400"
              />
              <text x="460" y="115" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">U2A: 74LS373</text>
              <text x="460" y="130" fill="#94a3b8" fontSize="9" textAnchor="middle">Octal Address Latch</text>
              <text x="380" y="155" fill="#818cf8" fontSize="10">D0–D7</text>
              <text x="540" y="155" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="end">A0–A7</text>
              <text x="380" y="195" fill="#f59e0b" fontSize="9">LE (P11)</text>
              <text x="540" y="195" fill="#64748b" fontSize="9" textAnchor="end">OE#=GND</text>
            </g>

            {/* ----------------- U2B: 74LS373 Latch 2 (AD8–AD15) ----------------- */}
            <g
              onClick={() => setSelectedChip('u2b')}
              className="cursor-pointer group"
            >
              <rect
                x="370"
                y="230"
                width="180"
                height="120"
                rx="10"
                fill={selectedChip === 'u2b' ? 'url(#icGradActive)' : 'url(#icGrad)'}
                stroke={selectedChip === 'u2b' ? '#818cf8' : '#475569'}
                strokeWidth="2"
                className="transition-all duration-150 group-hover:stroke-indigo-400"
              />
              <text x="460" y="255" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">U2B: 74LS373</text>
              <text x="460" y="270" fill="#94a3b8" fontSize="9" textAnchor="middle">Octal Address Latch</text>
              <text x="380" y="295" fill="#818cf8" fontSize="10">D8–D15</text>
              <text x="540" y="295" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="end">A8–A15</text>
              <text x="380" y="335" fill="#f59e0b" fontSize="9">LE (P11)</text>
              <text x="540" y="335" fill="#64748b" fontSize="9" textAnchor="end">OE#=GND</text>
            </g>

            {/* ----------------- U2C: 74LS373 Latch 3 (A16–A19 & BHE#) ----------------- */}
            <g
              onClick={() => setSelectedChip('u2c')}
              className="cursor-pointer group"
            >
              <rect
                x="370"
                y="410"
                width="180"
                height="130"
                rx="10"
                fill={selectedChip === 'u2c' ? 'url(#icGradActive)' : 'url(#icGrad)'}
                stroke={selectedChip === 'u2c' ? '#818cf8' : '#475569'}
                strokeWidth="2"
                className="transition-all duration-150 group-hover:stroke-indigo-400"
              />
              <text x="460" y="435" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">U2C: 74LS373</text>
              <text x="460" y="450" fill="#94a3b8" fontSize="9" textAnchor="middle">Upper Address &amp; BHE#</text>
              <text x="380" y="475" fill="#c084fc" fontSize="10">A16–A19</text>
              <text x="540" y="475" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="end">A16–A19</text>
              <text x="380" y="505" fill="#818cf8" fontSize="10">BHE#/S7</text>
              <text x="540" y="505" fill="#818cf8" fontSize="10" fontWeight="bold" textAnchor="end">BHE#</text>
              <text x="380" y="530" fill="#f59e0b" fontSize="9">LE (P11)</text>
            </g>

            {/* ----------------- U3: 74LS138 Address Decoder ----------------- */}
            <g
              onClick={() => setSelectedChip('u3')}
              className="cursor-pointer group"
            >
              <rect
                x="640"
                y="430"
                width="180"
                height="220"
                rx="10"
                fill={selectedChip === 'u3' ? 'url(#icGradActive)' : 'url(#icGrad)'}
                stroke={selectedChip === 'u3' ? '#38bdf8' : '#475569'}
                strokeWidth="2"
                className="transition-all duration-150 group-hover:stroke-cyan-400"
              />
              <text x="730" y="455" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">U3: 74LS138</text>
              <text x="730" y="470" fill="#94a3b8" fontSize="9" textAnchor="middle">3-to-8 Address Decoder</text>

              {/* Decoder Inputs */}
              <text x="650" y="495" fill="#38bdf8" fontSize="10">A (A17)</text>
              <text x="650" y="515" fill="#38bdf8" fontSize="10">B (A18)</text>
              <text x="650" y="535" fill="#38bdf8" fontSize="10">C (A19)</text>
              <text x="650" y="565" fill="#22c55e" fontSize="10" fontWeight="bold">G1 (M/IO#=1)</text>
              <text x="650" y="585" fill="#64748b" fontSize="9">G2A# (GND)</text>
              <text x="650" y="605" fill="#64748b" fontSize="9">G2B# (GND)</text>

              {/* Active-Low Outputs */}
              <text x="810" y="495" fill={y0 === 0 ? '#22d3ee' : '#64748b'} fontSize="11" fontWeight="bold" textAnchor="end">Y0# (SRAM)</text>
              <text x="810" y="525" fill="#475569" fontSize="9" textAnchor="end">Y1#–Y6#</text>
              <text x="810" y="625" fill={y7 === 0 ? '#c084fc' : '#64748b'} fontSize="11" fontWeight="bold" textAnchor="end">Y7# (EPROM)</text>
            </g>

            {/* ----------------- U4A: 74LS245 Transceiver (D0–D7) ----------------- */}
            <g
              onClick={() => setSelectedChip('u4a')}
              className="cursor-pointer group"
            >
              <rect
                x="640"
                y="90"
                width="180"
                height="110"
                rx="10"
                fill={selectedChip === 'u4a' ? 'url(#icGradActive)' : 'url(#icGrad)'}
                stroke={lowerTransceiverActive ? '#34d399' : '#475569'}
                strokeWidth="2"
                className="transition-all duration-150 group-hover:stroke-emerald-400"
              />
              <text x="730" y="115" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">U4A: 74LS245</text>
              <text x="730" y="130" fill="#94a3b8" fontSize="9" textAnchor="middle">Octal Transceiver (Lower)</text>
              <text x="650" y="155" fill="#818cf8" fontSize="10">AD0–AD7</text>
              <text x="810" y="155" fill="#34d399" fontSize="10" fontWeight="bold" textAnchor="end">D0–D7</text>
              <text x="650" y="185" fill="#94a3b8" fontSize="9">DIR=DT/R#</text>
              <text x="810" y="185" fill="#94a3b8" fontSize="9" textAnchor="end">OE#=DEN#</text>
            </g>

            {/* ----------------- U4B: 74LS245 Transceiver (D8–D15) ----------------- */}
            <g
              onClick={() => setSelectedChip('u4b')}
              className="cursor-pointer group"
            >
              <rect
                x="640"
                y="230"
                width="180"
                height="110"
                rx="10"
                fill={selectedChip === 'u4b' ? 'url(#icGradActive)' : 'url(#icGrad)'}
                stroke={upperTransceiverActive ? '#818cf8' : '#475569'}
                strokeWidth="2"
                className="transition-all duration-150 group-hover:stroke-indigo-400"
              />
              <text x="730" y="255" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">U4B: 74LS245</text>
              <text x="730" y="270" fill="#94a3b8" fontSize="9" textAnchor="middle">Octal Transceiver (Upper)</text>
              <text x="650" y="295" fill="#818cf8" fontSize="10">AD8–AD15</text>
              <text x="810" y="295" fill="#818cf8" fontSize="10" fontWeight="bold" textAnchor="end">D8–D15</text>
              <text x="650" y="325" fill="#94a3b8" fontSize="9">DIR=DT/R#</text>
              <text x="810" y="325" fill="#94a3b8" fontSize="9" textAnchor="end">OE#=DEN#</text>
            </g>

            {/* ----------------- BANK OR GATES ----------------- */}
            {/* Even SRAM OR Gate (Y0# OR A0) */}
            <g transform="translate(960, 150)">
              <rect x="0" y="0" width="45" height="40" rx="6" fill="#1e293b" stroke="#34d399" strokeWidth="1.5" />
              <text x="22" y="24" fill="#a7f3d0" fontSize="10" fontWeight="bold" textAnchor="middle">OR</text>
              <line x1="45" y1="20" x2="80" y2="20" stroke={evenSramActive ? '#34d399' : '#475569'} strokeWidth="2.5" markerEnd="url(#arrow-emerald)" />
              {/* Bubble for active low */}
              <circle cx="48" cy="20" r="3" fill="#0f172a" stroke="#34d399" strokeWidth="1" />
            </g>

            {/* Odd SRAM OR Gate (Y0# OR BHE#) */}
            <g transform="translate(1275, 150)">
              <rect x="0" y="0" width="45" height="40" rx="6" fill="#1e293b" stroke="#818cf8" strokeWidth="1.5" />
              <text x="22" y="24" fill="#c7d2fe" fontSize="10" fontWeight="bold" textAnchor="middle">OR</text>
              <line x1="45" y1="20" x2="55" y2="20" stroke={oddSramActive ? '#818cf8' : '#475569'} strokeWidth="2.5" markerEnd="url(#arrow-indigo)" />
              <circle cx="48" cy="20" r="3" fill="#0f172a" stroke="#818cf8" strokeWidth="1" />
            </g>

            {/* Even EPROM OR Gate (Y7# OR A0) */}
            <g transform="translate(960, 450)">
              <rect x="0" y="0" width="45" height="40" rx="6" fill="#1e293b" stroke="#c084fc" strokeWidth="1.5" />
              <text x="22" y="24" fill="#e9d5ff" fontSize="10" fontWeight="bold" textAnchor="middle">OR</text>
              <line x1="45" y1="20" x2="80" y2="20" stroke={evenEpromActive ? '#c084fc' : '#475569'} strokeWidth="2.5" markerEnd="url(#arrow-indigo)" />
              <circle cx="48" cy="20" r="3" fill="#0f172a" stroke="#c084fc" strokeWidth="1" />
            </g>

            {/* Odd EPROM OR Gate (Y7# OR BHE#) */}
            <g transform="translate(1275, 450)">
              <rect x="0" y="0" width="45" height="40" rx="6" fill="#1e293b" stroke="#c084fc" strokeWidth="1.5" />
              <text x="22" y="24" fill="#e9d5ff" fontSize="10" fontWeight="bold" textAnchor="middle">OR</text>
              <line x1="45" y1="20" x2="55" y2="20" stroke={oddEpromActive ? '#c084fc' : '#475569'} strokeWidth="2.5" markerEnd="url(#arrow-indigo)" />
              <circle cx="48" cy="20" r="3" fill="#0f172a" stroke="#c084fc" strokeWidth="1" />
            </g>

            {/* ----------------- U5A: Even SRAM (62256, 32KB) ----------------- */}
            <g
              onClick={() => setSelectedChip('u5a')}
              className="cursor-pointer group"
            >
              <rect
                x="1040"
                y="80"
                width="220"
                height="210"
                rx="12"
                fill={evenSramActive ? '#064e3b' : (selectedChip === 'u5a' ? 'url(#icGradActive)' : 'url(#icGrad)')}
                stroke={evenSramActive ? '#34d399' : '#475569'}
                strokeWidth={evenSramActive ? '3' : '1.5'}
                className="transition-all duration-150 group-hover:stroke-emerald-400"
              />
              <text x="1150" y="105" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">U5A: SRAM 62256</text>
              <text x="1150" y="120" fill="#a7f3d0" fontSize="10" fontWeight="bold" textAnchor="middle">EVEN BANK (32 KB × 8)</text>
              <text x="1150" y="135" fill="#94a3b8" fontSize="9" textAnchor="middle">Range: 00000H–0FFFFH</text>

              <text x="1050" y="155" fill="#34d399" fontSize="10" fontWeight="bold">D0–D7 (Data)</text>
              <text x="1050" y="175" fill="#38bdf8" fontSize="10">A0–A14 (from A1–A15)</text>
              <text x="1050" y="195" fill={evenSramActive ? '#6ee7b7' : '#94a3b8'} fontSize="10" fontWeight="bold">
                CE# ({evenSramActive ? 'ACTIVE' : 'High'})
              </text>
              <text x="1050" y="225" fill="#10b981" fontSize="10">OE# (RD#)</text>
              <text x="1050" y="255" fill="#f59e0b" fontSize="10">WE# (WR#)</text>

              <rect x="1050" y="265" width="200" height="18" rx="4" fill="#0f172a" stroke="#34d399" strokeWidth="1" />
              <text x="1150" y="278" fill={evenSramActive ? '#6ee7b7' : '#64748b'} fontSize="9" fontWeight="bold" textAnchor="middle">
                {evenSramActive ? '● BANK SELECTED (A0=0)' : '○ Bank Idle'}
              </text>
            </g>

            {/* ----------------- U5B: Odd SRAM (62256, 32KB) ----------------- */}
            <g
              onClick={() => setSelectedChip('u5b')}
              className="cursor-pointer group"
            >
              <rect
                x="1330"
                y="80"
                width="220"
                height="210"
                rx="12"
                fill={oddSramActive ? '#1e1b4b' : (selectedChip === 'u5b' ? 'url(#icGradActive)' : 'url(#icGrad)')}
                stroke={oddSramActive ? '#818cf8' : '#475569'}
                strokeWidth={oddSramActive ? '3' : '1.5'}
                className="transition-all duration-150 group-hover:stroke-indigo-400"
              />
              <text x="1440" y="105" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">U5B: SRAM 62256</text>
              <text x="1440" y="120" fill="#c7d2fe" fontSize="10" fontWeight="bold" textAnchor="middle">ODD BANK (32 KB × 8)</text>
              <text x="1440" y="135" fill="#94a3b8" fontSize="9" textAnchor="middle">Range: 00001H–0FFFFH</text>

              <text x="1340" y="155" fill="#818cf8" fontSize="10" fontWeight="bold">D8–D15 (Data)</text>
              <text x="1340" y="175" fill="#38bdf8" fontSize="10">A0–A14 (from A1–A15)</text>
              <text x="1340" y="195" fill={oddSramActive ? '#a5b4fc' : '#94a3b8'} fontSize="10" fontWeight="bold">
                CE# ({oddSramActive ? 'ACTIVE' : 'High'})
              </text>
              <text x="1340" y="225" fill="#10b981" fontSize="10">OE# (RD#)</text>
              <text x="1340" y="255" fill="#f59e0b" fontSize="10">WE# (WR#)</text>

              <rect x="1340" y="265" width="200" height="18" rx="4" fill="#0f172a" stroke="#818cf8" strokeWidth="1" />
              <text x="1440" y="278" fill={oddSramActive ? '#a5b4fc' : '#64748b'} fontSize="9" fontWeight="bold" textAnchor="middle">
                {oddSramActive ? '● BANK SELECTED (BHE#=0)' : '○ Bank Idle'}
              </text>
            </g>

            {/* ----------------- U6A: Even EPROM (27256, 32KB) ----------------- */}
            <g
              onClick={() => setSelectedChip('u6a')}
              className="cursor-pointer group"
            >
              <rect
                x="1040"
                y="380"
                width="220"
                height="210"
                rx="12"
                fill={evenEpromActive ? '#581c87' : (selectedChip === 'u6a' ? 'url(#icGradActive)' : 'url(#icGrad)')}
                stroke={evenEpromActive ? '#c084fc' : '#475569'}
                strokeWidth={evenEpromActive ? '3' : '1.5'}
                className="transition-all duration-150 group-hover:stroke-purple-400"
              />
              <text x="1150" y="405" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">U6A: EPROM 27256</text>
              <text x="1150" y="420" fill="#e9d5ff" fontSize="10" fontWeight="bold" textAnchor="middle">EVEN BOOT ROM (32 KB)</text>
              <text x="1150" y="435" fill="#94a3b8" fontSize="9" textAnchor="middle">Top Space (FFFF0H Start)</text>

              <text x="1050" y="455" fill="#34d399" fontSize="10" fontWeight="bold">D0–D7 (Data)</text>
              <text x="1050" y="475" fill="#38bdf8" fontSize="10">A0–A14 (Address)</text>
              <text x="1050" y="495" fill={evenEpromActive ? '#d8b4fe' : '#94a3b8'} fontSize="10" fontWeight="bold">
                CE# ({evenEpromActive ? 'ACTIVE' : 'High'})
              </text>
              <text x="1050" y="525" fill="#10b981" fontSize="10">OE# (RD#)</text>
              <text x="1050" y="555" fill="#64748b" fontSize="9">NO WE# (Read-Only)</text>

              <rect x="1050" y="565" width="200" height="18" rx="4" fill="#0f172a" stroke="#c084fc" strokeWidth="1" />
              <text x="1150" y="578" fill={evenEpromActive ? '#d8b4fe' : '#64748b'} fontSize="9" fontWeight="bold" textAnchor="middle">
                {evenEpromActive ? '● ROM SELECTED (A0=0)' : '○ ROM Idle'}
              </text>
            </g>

            {/* ----------------- U6B: Odd EPROM (27256, 32KB) ----------------- */}
            <g
              onClick={() => setSelectedChip('u6b')}
              className="cursor-pointer group"
            >
              <rect
                x="1330"
                y="380"
                width="220"
                height="210"
                rx="12"
                fill={oddEpromActive ? '#581c87' : (selectedChip === 'u6b' ? 'url(#icGradActive)' : 'url(#icGrad)')}
                stroke={oddEpromActive ? '#c084fc' : '#475569'}
                strokeWidth={oddEpromActive ? '3' : '1.5'}
                className="transition-all duration-150 group-hover:stroke-purple-400"
              />
              <text x="1440" y="405" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">U6B: EPROM 27256</text>
              <text x="1440" y="420" fill="#e9d5ff" fontSize="10" fontWeight="bold" textAnchor="middle">ODD BOOT ROM (32 KB)</text>
              <text x="1440" y="435" fill="#94a3b8" fontSize="9" textAnchor="middle">Top Space (FFFF0H Start)</text>

              <text x="1340" y="455" fill="#818cf8" fontSize="10" fontWeight="bold">D8–D15 (Data)</text>
              <text x="1340" y="475" fill="#38bdf8" fontSize="10">A0–A14 (Address)</text>
              <text x="1340" y="495" fill={oddEpromActive ? '#d8b4fe' : '#94a3b8'} fontSize="10" fontWeight="bold">
                CE# ({oddEpromActive ? 'ACTIVE' : 'High'})
              </text>
              <text x="1340" y="525" fill="#10b981" fontSize="10">OE# (RD#)</text>
              <text x="1340" y="555" fill="#64748b" fontSize="9">NO WE# (Read-Only)</text>

              <rect x="1340" y="565" width="200" height="18" rx="4" fill="#0f172a" stroke="#c084fc" strokeWidth="1" />
              <text x="1440" y="578" fill={oddEpromActive ? '#d8b4fe' : '#64748b'} fontSize="9" fontWeight="bold" textAnchor="middle">
                {oddEpromActive ? '● ROM SELECTED (BHE#=0)' : '○ ROM Idle'}
              </text>
            </g>

          </svg>
        </div>
      </div>

      {/* SELECTED COMPONENT / IC TECHNICAL INSPECTOR PANEL */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-900/60 rounded-lg text-indigo-400 border border-indigo-700/50">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">{currentChipInfo.title}</h4>
              <p className="text-xs text-indigo-300">{currentChipInfo.subtitle}</p>
            </div>
          </div>

          {/* Chip Quick Selector Buttons */}
          <div className="flex flex-wrap gap-1">
            {Object.keys(chipData).map((cKey) => {
              const isSel = (selectedChip || 'u1') === cKey;
              return (
                <button
                  key={cKey}
                  onClick={() => setSelectedChip(cKey)}
                  className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    isSel
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {cKey.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {currentChipInfo.desc}
        </p>

        {/* Technical Specifications Grid */}
        {currentChipInfo.techSpecs && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {currentChipInfo.techSpecs.map((spec, sIdx) => (
              <div key={sIdx} className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 font-semibold">{spec.label}</div>
                <div className="text-xs font-mono font-bold text-slate-100">{spec.val}</div>
              </div>
            ))}
          </div>
        )}

        {/* Dynamic Real-Time Pin States Table */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Real-Time Pin Functions &amp; Logic States for Current Cycle:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {currentChipInfo.pins.map((p, pIdx) => (
              <div key={pIdx} className="bg-slate-900 p-2 rounded-lg border border-slate-800/80 flex flex-col justify-between gap-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono font-bold text-indigo-300 text-[11px]">{p.pin}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 font-mono text-amber-300 border border-slate-800 font-bold">
                    {p.state}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">{p.role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
