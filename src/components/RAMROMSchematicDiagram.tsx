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

export type RAMROMCycleScenario = 
  | 'ram-word-write'
  | 'ram-word-read'
  | 'ram-even-byte'
  | 'ram-odd-byte'
  | 'rom-boot-fetch'
  | 'rom-even-byte'
  | 'rom-odd-byte'
  | 'unmapped-access';

export interface RAMROMSchematicDiagramProps {
  initialScenario?: RAMROMCycleScenario;
}

export default function RAMROMSchematicDiagram({
  initialScenario = 'ram-word-write'
}: RAMROMSchematicDiagramProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedChip, setSelectedChip] = useState<string | null>('ram1');
  const [activeScenario, setActiveScenario] = useState<RAMROMCycleScenario>(initialScenario);
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
    scenarioDesc = `Testing memory access at physical address ${addressHex}H across the 32 KB RAM and 32 KB ROM address space.`;
  } else {
    switch (activeScenario) {
      case 'ram-word-write':
        addressHex = '00200';
        isWord = true;
        isWrite = true;
        scenarioTitle = '1. 16-Bit Aligned Word RAM Write (00200H)';
        scenarioDesc = 'Writes a 16-bit word into RAM_1 (Even Bank) and RAM_2 (Odd Bank) simultaneously across D0–D15 in a single bus cycle (CS_RAM#=0, CE_RAM1#=0, CE_RAM2#=0, WR#=0).';
        break;
      case 'ram-word-read':
        addressHex = '00100';
        isWord = true;
        isWrite = false;
        scenarioTitle = '2. 16-Bit Aligned Word RAM Read (00100H)';
        scenarioDesc = 'Reads a 16-bit word from RAM_1 and RAM_2 simultaneously across D0–D15 in a single bus cycle (CS_RAM#=0, CE_RAM1#=0, CE_RAM2#=0, RD#=0).';
        break;
      case 'ram-even-byte':
        addressHex = '00102';
        isWord = false;
        isWrite = false;
        scenarioTitle = '3. Even Byte RAM Read (00102H)';
        scenarioDesc = 'Reads 1 byte from RAM_1 (Even Bank, D0–D7). RAM_2 (Odd Bank) is disabled (A0=0, BHE#=1, CE_RAM1#=0, CE_RAM2#=1, RD#=0).';
        break;
      case 'ram-odd-byte':
        addressHex = '00103';
        isWord = false;
        isWrite = false;
        scenarioTitle = '4. Odd Byte RAM Read (00103H)';
        scenarioDesc = 'Reads 1 byte from RAM_2 (Odd Bank, D8–D15). RAM_1 (Even Bank) is disabled (A0=1, BHE#=0, CE_RAM1#=1, CE_RAM2#=0, RD#=0).';
        break;
      case 'rom-boot-fetch':
        addressHex = 'FFFF0';
        isWord = true;
        isWrite = false;
        scenarioTitle = '5. 8086 Power-On Reset Boot Fetch (FFFF0H - Reset Vector)';
        scenarioDesc = 'The 8086 fetches its first boot instruction from ROM at FFFF0H. CS_ROM#=0, enabling ROM_1 & ROM_2 across D0–D15 (A0=0, BHE#=0, CE_ROM1#=0, CE_ROM2#=0, RD#=0).';
        break;
      case 'rom-even-byte':
        addressHex = 'F8000';
        isWord = false;
        isWrite = false;
        scenarioTitle = '6. Even Byte ROM Read (F8000H - Base of ROM)';
        scenarioDesc = 'Reads 1 byte of firmware from ROM_1 (Even Bank, D0–D7). ROM_2 is disabled (A0=0, BHE#=1, CE_ROM1#=0, CE_ROM2#=1, RD#=0).';
        break;
      case 'rom-odd-byte':
        addressHex = 'F8001';
        isWord = false;
        isWrite = false;
        scenarioTitle = '7. Odd Byte ROM Read (F8001H)';
        scenarioDesc = 'Reads 1 byte of firmware from ROM_2 (Odd Bank, D8–D15). ROM_1 is disabled (A0=1, BHE#=0, CE_ROM1#=1, CE_ROM2#=0, RD#=0).';
        break;
      case 'unmapped-access':
        addressHex = '80000';
        isWord = true;
        isWrite = false;
        scenarioTitle = '8. Unmapped Address Access (80000H)';
        scenarioDesc = 'Address 80000H falls outside both 32 KB RAM (00000H–07FFFH) and 32 KB ROM (F8000H–FFFFFH). Both CS_RAM#=1 and CS_ROM#=1 remain inactive HIGH. Transceivers float in High-Z.';
        break;
    }
  }

  // Address computations
  const addrVal = parseInt(addressHex, 16);
  const clampedAddr = isNaN(addrVal) ? 0 : addrVal;
  
  // Range checks
  const isRAM = clampedAddr >= 0x00000 && clampedAddr <= 0x07FFF;
  const isROM = clampedAddr >= 0xF8000 && clampedAddr <= 0xFFFFF;
  const isEven = (clampedAddr % 2) === 0;

  // Signal values
  const a0 = isEven ? 0 : 1;
  const bhe = (isWord || !isEven) ? 0 : 1;

  // High address lines A19..A15
  const a19 = (clampedAddr >> 19) & 1;
  const a18 = (clampedAddr >> 18) & 1;
  const a17 = (clampedAddr >> 17) & 1;
  const a16 = (clampedAddr >> 16) & 1;
  const a15 = (clampedAddr >> 15) & 1;

  // Decoded Chip Selects
  const csRamBar = isRAM ? 0 : 1; // Active LOW
  const csRomBar = isROM ? 0 : 1; // Active LOW

  // Gated Chip Enables via OR gates
  const ceRam1Bar = (csRamBar === 0 && a0 === 0) ? 0 : 1;
  const ceRam2Bar = (csRamBar === 0 && bhe === 0) ? 0 : 1;
  const ceRom1Bar = (csRomBar === 0 && a0 === 0) ? 0 : 1;
  const ceRom2Bar = (csRomBar === 0 && bhe === 0) ? 0 : 1;

  // Control Signals based on T-State and Op
  const ale = tState === 1 ? 1 : 0;
  const m_io = 1; // Always memory cycle
  const rd = (!isWrite && (tState === 2 || tState === 3)) ? 0 : 1;
  const wr = (isWrite && isRAM && (tState === 2 || tState === 3)) ? 0 : 1;
  const den = (tState === 2 || tState === 3) ? 0 : 1;
  const dtr = isWrite ? 1 : 0;

  // Memory Chips Active States
  const ram1Active = ceRam1Bar === 0;
  const ram2Active = ceRam2Bar === 0;
  const rom1Active = ceRom1Bar === 0;
  const rom2Active = ceRom2Bar === 0;

  // Transceiver Active States
  const lowerTransceiverActive = (den === 0) && (a0 === 0 || isWord) && (isRAM || isROM);
  const upperTransceiverActive = (den === 0) && (bhe === 0 || isWord) && (isRAM || isROM);

  // Address offset for 16 KB chips (A1–A14)
  const chipAddrOffset = (addrVal >> 1) & 0x3FFF;
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
      desc: 'The central master processor orchestrating dual-memory bus transactions. Generates multiplexed address/data signals (AD0–AD15) during T1, bus strobes (ALE, RD#, WR#, M/IO#), and data direction control for the 32 KB RAM and 32 KB ROM memory arrays.',
      techSpecs: [
        { label: 'Operating Mode', val: 'Minimum Mode (Pin 33 tied to +5V VCC)' },
        { label: 'Address Range', val: '20-Bit Physical Space (00000H–FFFFFH)' },
        { label: 'RAM Interfaced', val: '32 KB (00000H–07FFFH) via 2× 16 KB SRAM' },
        { label: 'ROM Interfaced', val: '32 KB (F8000H–FFFFFH) via 2× 16 KB EPROM' }
      ],
      pins: [
        { pin: 'AD0–AD15 (Pins 16–2, 39)', role: 'Time-multiplexed Address/Data Bus', state: tState === 1 ? `Addr: ${addressHex}H` : (isWrite ? 'Data Out (CPU->RAM)' : 'Data In (Mem->CPU)') },
        { pin: 'A16–A19 (Pins 35–38)', role: 'Upper Address Lines (to Decoders)', state: `A19..A15: ${a19}${a18}${a17}${a16}${a15}b` },
        { pin: 'BHE#/S7 (Pin 34)', role: 'Bus High Enable (Active LOW for Odd Banks)', state: bhe === 0 ? '0 (LOW - Odd Bank ENABLED)' : '1 (HIGH - Odd Bank Inactive)' },
        { pin: 'ALE (Pin 25)', role: 'Address Latch Enable for 3× 74LS373', state: ale === 1 ? '1 (PULSE HIGH in T1)' : '0 (LOW in T2–T4)' },
        { pin: 'M/IO# (Pin 28)', role: 'Memory / IO Cycle Selector', state: '1 (HIGH - Memory Cycle)' },
        { pin: 'RD# (Pin 32)', role: 'Active-LOW Memory Read strobe', state: rd === 0 ? '0 (ACTIVE READ)' : '1 (IDLE)' },
        { pin: 'WR# (Pin 29)', role: 'Active-LOW Memory Write strobe', state: wr === 0 ? '0 (ACTIVE WRITE)' : '1 (IDLE)' },
        { pin: 'DEN# (Pin 26)', role: 'Data Enable for 74LS245 Transceivers', state: den === 0 ? '0 (ACTIVE LOW)' : '1 (Tristate)' },
        { pin: 'DT/R# (Pin 27)', role: 'Data Transmit (1=Write) / Receive (0=Read)', state: dtr === 1 ? '1 (TRANSMIT)' : '0 (RECEIVE)' }
      ]
    },
    u2: {
      title: 'U2A, U2B, U2C: 3× 74LS373 Octal Latches',
      subtitle: 'Demultiplexes AD0–AD15 & A16–A19/BHE# into Static Address Bus',
      desc: 'Latches the address lines during T1 on the falling edge of ALE. U2A outputs pure A0–A7, U2B outputs A8–A15, and U2C outputs A16–A19 and BHE#. Holds stable addresses throughout T2, T3, and T4.',
      techSpecs: [
        { label: 'Latch Type', val: '8-bit transparent D-type latch (3 ICs)' },
        { label: 'Control Pin', val: 'Pin 11 (LE) driven by 8086 ALE; Pin 1 (OE#) grounded' },
        { label: 'Memory Feeds', val: 'Latched A1–A14 wired to RAM & ROM address inputs A0–A13' }
      ],
      pins: [
        { pin: 'LE (Pin 11)', role: 'Latch Enable driven by 8086 ALE', state: ale === 1 ? '1 (TRANSPARENT)' : '0 (LATCHED)' },
        { pin: 'A0 (From U2A)', role: 'Even Bank enable line to OR Gates 1 & 3', state: a0 === 0 ? '0 (Even Address)' : '1 (Odd Address)' },
        { pin: 'A1–A14 (U2A & U2B)', role: '14 Address Lines to RAM & ROM A0–A13', state: `${chipAddrHex}H (Offset within 16KB)` },
        { pin: 'A15–A19 (U2B & U2C)', role: '5 High Address Lines to Decoders', state: `${a19}${a18}${a17}${a16}${a15}b` },
        { pin: 'BHE# (From U2C)', role: 'Odd Bank enable line to OR Gates 2 & 4', state: bhe === 0 ? '0 (LOW)' : '1 (HIGH)' }
      ]
    },
    u3_dec: {
      title: 'Dual Memory Address Decoders (74LS138 / 74LS30 NAND)',
      subtitle: 'Generates Independent CS_RAM# and CS_ROM# Chip Selects',
      desc: 'Decodes high-order address bits A15–A19 and M/IO#. When A19..A15 = 00000b, CS_RAM# asserts LOW (00000H–07FFFH). When A19..A15 = 11111b, CS_ROM# asserts LOW (F8000H–FFFFFH). Both are inactive HIGH for any unmapped address.',
      techSpecs: [
        { label: 'RAM Equation', val: 'CS_RAM# = NOT( NOT A19 • NOT A18 • NOT A17 • NOT A16 • NOT A15 • M/IO# )' },
        { label: 'ROM Equation', val: 'CS_ROM# = NOT( A19 • A18 • A17 • A16 • A15 • M/IO# )' },
        { label: 'RAM Address Range', val: '00000H to 07FFFH (32,768 Bytes)' },
        { label: 'ROM Address Range', val: 'F8000H to FFFFFH (32,768 Bytes)' }
      ],
      pins: [
        { pin: 'A15–A19 Inputs', role: 'Upper address bits from Latches', state: `${a19}${a18}${a17}${a16}${a15}b` },
        { pin: 'M/IO# Input', role: 'Memory cycle enable (active HIGH)', state: '1 (HIGH)' },
        { pin: 'CS_RAM# Output', role: 'Active-LOW Master Chip Select for 32 KB RAM', state: csRamBar === 0 ? '0 (LOW - RAM SELECTED)' : '1 (HIGH - Inactive)' },
        { pin: 'CS_ROM# Output', role: 'Active-LOW Master Chip Select for 32 KB ROM', state: csRomBar === 0 ? '0 (LOW - ROM SELECTED)' : '1 (HIGH - Inactive)' }
      ]
    },
    u_or: {
      title: 'Bank Qualification OR Gates (74LS32 Quad 2-Input OR)',
      subtitle: 'Generates 4 Independent Chip Enables (CE_RAM1#, CE_RAM2#, CE_ROM1#, CE_ROM2#)',
      desc: 'Combines master chip selects (CS_RAM# / CS_ROM#) with bank qualifiers (A0 / BHE#). Only asserts LOW when the target memory block is selected AND the corresponding byte/word bank is active.',
      techSpecs: [
        { label: 'CE_RAM1# (Even RAM)', val: 'CS_RAM# OR A0 (RAM 1 on D0–D7)' },
        { label: 'CE_RAM2# (Odd RAM)', val: 'CS_RAM# OR BHE# (RAM 2 on D8–D15)' },
        { label: 'CE_ROM1# (Even ROM)', val: 'CS_ROM# OR A0 (ROM 1 on D0–D7)' },
        { label: 'CE_ROM2# (Odd ROM)', val: 'CS_ROM# OR BHE# (ROM 2 on D8–D15)' }
      ],
      pins: [
        { pin: 'CE_RAM1# (Pin 3)', role: 'Even Bank RAM_1 Chip Enable', state: ceRam1Bar === 0 ? '0 (LOW - ACTIVE)' : '1 (HIGH - Inactive)' },
        { pin: 'CE_RAM2# (Pin 6)', role: 'Odd Bank RAM_2 Chip Enable', state: ceRam2Bar === 0 ? '0 (LOW - ACTIVE)' : '1 (HIGH - Inactive)' },
        { pin: 'CE_ROM1# (Pin 8)', role: 'Even Bank ROM_1 Chip Enable', state: ceRom1Bar === 0 ? '0 (LOW - ACTIVE)' : '1 (HIGH - Inactive)' },
        { pin: 'CE_ROM2# (Pin 11)', role: 'Odd Bank ROM_2 Chip Enable', state: ceRom2Bar === 0 ? '0 (LOW - ACTIVE)' : '1 (HIGH - Inactive)' }
      ]
    },
    u4: {
      title: 'U4A & U4B: 2× 74LS245 Octal Bus Transceivers',
      subtitle: 'Bidirectional Data Bus Buffers for Lower (D0–D7) & Upper (D8–D15) Buses',
      desc: 'Buffers data between CPU multiplexed pins and memory chips. Controlled by DT/R# (direction) and DEN# (enable).',
      techSpecs: [
        { label: 'DIR (Pin 1)', val: 'Driven by DT/R# (1 = Transmit/Write, 0 = Receive/Read)' },
        { label: 'OE# (Pin 19)', val: 'Driven by 8086 DEN# (Active LOW in T2–T4)' }
      ],
      pins: [
        { pin: 'DIR (Pin 1)', role: 'Driven by 8086 DT/R#', state: dtr === 1 ? '1 (TRANSMIT / WRITE)' : '0 (RECEIVE / READ)' },
        { pin: 'OE# (Pin 19)', role: 'Driven by 8086 DEN#', state: den === 0 ? '0 (BUFFERS ACTIVE)' : '1 (TRISTATE)' },
        { pin: 'U4A (Lower Transceiver)', role: 'Buffers Even Data Byte (D0–D7)', state: lowerTransceiverActive ? 'Active Bus Driving' : 'High-Z' },
        { pin: 'U4B (Upper Transceiver)', role: 'Buffers Odd Data Byte (D8–D15)', state: upperTransceiverActive ? 'Active Bus Driving' : 'High-Z' }
      ]
    },
    ram1: {
      title: 'RAM 1: 16 KB Even Bank SRAM (e.g. 62128 / 62256)',
      subtitle: 'Lower Byte RAM Array (D0–D7) • Addresses 00000H, 00002H, ... 07FFEH',
      desc: 'Stores even-addressed RAM bytes (IVT vectors, OS variables, stack variables). Enabled when CE_RAM1# = 0 (CS_RAM#=0 and A0=0). Accepts read (OE#) and write (WE#) pulses.',
      techSpecs: [
        { label: 'Capacity', val: '16 KB (16,384 Bytes) x 8 bits' },
        { label: 'Data Bus', val: 'D0–D7 (Connected to Transceiver U4A)' },
        { label: 'Address Inputs', val: 'A0–A13 wired to 8086 Latched A1–A14' },
        { label: 'Write Pin', val: 'WE# connected to 8086 WR# (Pin 29)' }
      ],
      pins: [
        { pin: 'CE# (Chip Enable)', role: 'Driven by OR Gate 1 (CE_RAM1#)', state: ceRam1Bar === 0 ? '0 (CHIP SELECTED)' : '1 (CHIP DESELECTED)' },
        { pin: 'OE# (Output Enable)', role: 'Driven by 8086 RD#', state: rd === 0 ? '0 (READ OUT ACTIVE)' : '1 (High-Z)' },
        { pin: 'WE# (Write Enable)', role: 'Driven by 8086 WR#', state: wr === 0 ? '0 (WRITE IN ACTIVE)' : '1 (Idle)' },
        { pin: 'A0–A13 Inputs', role: 'Internal word offset from A1–A14', state: `${chipAddrHex}H (Offset: ${chipAddrOffset})` }
      ]
    },
    ram2: {
      title: 'RAM 2: 16 KB Odd Bank SRAM (e.g. 62128 / 62256)',
      subtitle: 'Upper Byte RAM Array (D8–D15) • Addresses 00001H, 00003H, ... 07FFFH',
      desc: 'Stores odd-addressed RAM bytes. Enabled when CE_RAM2# = 0 (CS_RAM#=0 and BHE#=0). Active together with RAM 1 for aligned 16-bit word operations.',
      techSpecs: [
        { label: 'Capacity', val: '16 KB (16,384 Bytes) x 8 bits' },
        { label: 'Data Bus', val: 'D8–D15 (Connected to Transceiver U4B)' },
        { label: 'Address Inputs', val: 'A0–A13 wired to 8086 Latched A1–A14' },
        { label: 'Write Pin', val: 'WE# connected to 8086 WR# (Pin 29)' }
      ],
      pins: [
        { pin: 'CE# (Chip Enable)', role: 'Driven by OR Gate 2 (CE_RAM2#)', state: ceRam2Bar === 0 ? '0 (CHIP SELECTED)' : '1 (CHIP DESELECTED)' },
        { pin: 'OE# (Output Enable)', role: 'Driven by 8086 RD#', state: rd === 0 ? '0 (READ OUT ACTIVE)' : '1 (High-Z)' },
        { pin: 'WE# (Write Enable)', role: 'Driven by 8086 WR#', state: wr === 0 ? '0 (WRITE IN ACTIVE)' : '1 (Idle)' },
        { pin: 'A0–A13 Inputs', role: 'Internal word offset from A1–A14', state: `${chipAddrHex}H (Offset: ${chipAddrOffset})` }
      ]
    },
    rom1: {
      title: 'ROM 1: 16 KB Even Bank EPROM (e.g. 27128 / 27256)',
      subtitle: 'Lower Byte ROM Array (D0–D7) • Addresses F8000H, F8002H, ... FFFFEH',
      desc: 'Stores even-addressed boot firmware and BIOS code. Enabled when CE_ROM1# = 0 (CS_ROM#=0 and A0=0). Read-only: Has NO write enable (WE#) pin.',
      techSpecs: [
        { label: 'Capacity', val: '16 KB (16,384 Bytes) x 8 bits' },
        { label: 'Data Bus', val: 'D0–D7 (Connected to Transceiver U4A)' },
        { label: 'Address Inputs', val: 'A0–A13 wired to 8086 Latched A1–A14' },
        { label: 'Write Pin', val: 'None (Read-Only Semiconductor Memory)' }
      ],
      pins: [
        { pin: 'CE# (Chip Enable)', role: 'Driven by OR Gate 3 (CE_ROM1#)', state: ceRom1Bar === 0 ? '0 (CHIP SELECTED)' : '1 (CHIP DESELECTED)' },
        { pin: 'OE# (Output Enable)', role: 'Driven by 8086 RD#', state: rd === 0 ? '0 (READ OUT ACTIVE)' : '1 (High-Z)' },
        { pin: 'WE# (Write Enable)', role: 'N/A (Permanent ROM)', state: 'No WE# pin on ROM IC' },
        { pin: 'A0–A13 Inputs', role: 'Internal word offset from A1–A14', state: `${chipAddrHex}H (Offset: ${chipAddrOffset})` }
      ]
    },
    rom2: {
      title: 'ROM 2: 16 KB Odd Bank EPROM (e.g. 27128 / 27256)',
      subtitle: 'Upper Byte ROM Array (D8–D15) • Addresses F8001H, F8003H, ... FFFFFH',
      desc: 'Stores odd-addressed boot firmware including the Power-On Reset vector instruction at FFFF0H. Enabled when CE_ROM2# = 0 (CS_ROM#=0 and BHE#=0).',
      techSpecs: [
        { label: 'Capacity', val: '16 KB (16,384 Bytes) x 8 bits' },
        { label: 'Data Bus', val: 'D8–D15 (Connected to Transceiver U4B)' },
        { label: 'Address Inputs', val: 'A0–A13 wired to 8086 Latched A1–A14' },
        { label: 'Reset Vector', val: 'Holds Boot Vector at FFFF0H' }
      ],
      pins: [
        { pin: 'CE# (Chip Enable)', role: 'Driven by OR Gate 4 (CE_ROM2#)', state: ceRom2Bar === 0 ? '0 (CHIP SELECTED)' : '1 (CHIP DESELECTED)' },
        { pin: 'OE# (Output Enable)', role: 'Driven by 8086 RD#', state: rd === 0 ? '0 (READ OUT ACTIVE)' : '1 (High-Z)' },
        { pin: 'WE# (Write Enable)', role: 'N/A (Permanent ROM)', state: 'No WE# pin on ROM IC' },
        { pin: 'A0–A13 Inputs', role: 'Internal word offset from A1–A14', state: `${chipAddrHex}H (Offset: ${chipAddrOffset})` }
      ]
    }
  };

  const selectedData = selectedChip ? chipData[selectedChip] : chipData.ram1;

  return (
    <div className="bg-white text-slate-800 p-3 md:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs font-sans">
      {/* Top Controls Toolbar */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
        {/* Scenario Presets Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-indigo-600" />
            Preset Scenario:
          </span>
          <select
            value={useCustomAddress ? 'custom' : activeScenario}
            onChange={(e) => {
              if (e.target.value === 'custom') {
                setUseCustomAddress(true);
              } else {
                setUseCustomAddress(false);
                setActiveScenario(e.target.value as RAMROMCycleScenario);
              }
            }}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 font-medium text-xs focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <optgroup label="RAM Scenarios (00000H - 07FFFH)">
              <option value="ram-word-write">1. Aligned 16-Bit Word RAM Write (00200H)</option>
              <option value="ram-word-read">2. Aligned 16-Bit Word RAM Read (00100H)</option>
              <option value="ram-even-byte">3. Even Byte RAM Read (00102H - D0-D7)</option>
              <option value="ram-odd-byte">4. Odd Byte RAM Read (00103H - D8-D15)</option>
            </optgroup>
            <optgroup label="ROM Scenarios (F8000H - FFFFFH)">
              <option value="rom-boot-fetch">5. Power-On Reset Boot Fetch (FFFF0H - Reset Vector)</option>
              <option value="rom-even-byte">6. Even Byte ROM Read (F8000H - D0-D7)</option>
              <option value="rom-odd-byte">7. Odd Byte ROM Read (F8001H - D8-D15)</option>
            </optgroup>
            <optgroup label="Unmapped Memory Space">
              <option value="unmapped-access">8. Unmapped Space (80000H - Tristate High-Z)</option>
            </optgroup>
          </select>
        </div>

        {/* Clock State Stepper Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-600 font-bold uppercase mr-1">T-State:</span>
            {[1, 2, 3, 4].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setIsAutoStepping(false);
                  setTState(t as 1 | 2 | 3 | 4);
                }}
                className={`w-5 h-5 rounded flex items-center justify-center font-mono font-bold text-[11px] transition-all cursor-pointer ${
                  tState === t
                    ? 'bg-amber-500 text-slate-950 shadow-xs scale-105'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                T{t}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAutoStepping(!isAutoStepping)}
            className={`p-1.5 rounded-lg border flex items-center gap-1 font-bold text-[11px] cursor-pointer transition-all ${
              isAutoStepping 
                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100' 
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {isAutoStepping ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAutoStepping ? 'Pause' : 'Play'}</span>
          </button>

          <button
            onClick={() => {
              setTState(1);
            }}
            title="Reset Clock to T1"
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
            className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-slate-700 w-9 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
            className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer ml-0.5 border-l border-slate-200"
            title="Reset Zoom"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Live Scenario Explanation Banner */}
      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-start gap-2">
          <span className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${isRAM ? 'bg-emerald-100 text-emerald-800' : isROM ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
            <Zap className="w-4 h-4" />
          </span>
          <div>
            <h4 className="font-bold text-xs text-slate-900">{scenarioTitle}</h4>
            <p className="text-[11px] text-slate-600">{scenarioDesc}</p>
          </div>
        </div>

        {/* Live Active Signal Tags */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
          <span className={`px-2 py-0.5 rounded border font-bold ${csRamBar === 0 ? 'bg-emerald-100 text-emerald-900 border-emerald-400' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
            CS_RAM#={csRamBar}
          </span>
          <span className={`px-2 py-0.5 rounded border font-bold ${csRomBar === 0 ? 'bg-amber-100 text-amber-900 border-amber-400' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
            CS_ROM#={csRomBar}
          </span>
          <span className={`px-2 py-0.5 rounded border font-bold ${ceRam1Bar === 0 ? 'bg-emerald-100 text-emerald-900 border-emerald-400' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
            CE_RAM1#={ceRam1Bar}
          </span>
          <span className={`px-2 py-0.5 rounded border font-bold ${ceRam2Bar === 0 ? 'bg-emerald-100 text-emerald-900 border-emerald-400' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
            CE_RAM2#={ceRam2Bar}
          </span>
          <span className={`px-2 py-0.5 rounded border font-bold ${ceRom1Bar === 0 ? 'bg-amber-100 text-amber-900 border-amber-400' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
            CE_ROM1#={ceRom1Bar}
          </span>
          <span className={`px-2 py-0.5 rounded border font-bold ${ceRom2Bar === 0 ? 'bg-amber-100 text-amber-900 border-amber-400' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
            CE_ROM2#={ceRom2Bar}
          </span>
        </div>
      </div>

      {/* Main Dual-Memory Schematic SVG Canvas */}
      <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 overflow-x-auto relative">
        <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left', minWidth: '1150px' }} className="transition-transform duration-150">
          <svg viewBox="0 0 1380 730" className="w-full h-auto select-none font-mono text-[11px]">
            <defs>
              <pattern id="grid-dots-dual" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#cbd5e1" opacity="0.6" />
              </pattern>
              <linearGradient id="cpuGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f8fafc" />
              </linearGradient>
              <linearGradient id="latchGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#eff6ff" />
              </linearGradient>
              <linearGradient id="decGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#faf5ff" />
              </linearGradient>
              <linearGradient id="ramGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f0fdf4" />
              </linearGradient>
              <linearGradient id="romGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#fffbeb" />
              </linearGradient>
              <linearGradient id="transGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f5f3ff" />
              </linearGradient>
            </defs>

            {/* Background Grid */}
            <rect width="1380" height="730" fill="url(#grid-dots-dual)" />
            <rect x="8" y="8" width="1364" height="714" rx="12" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />

            {/* ============================================================== */}
            {/* TOP LATCHED ADDRESS BUS (A1–A14) */}
            {/* ============================================================== */}
            {/* Main Top Rail A1–A14 from Latches to Memory Chips */}
            <path d="M 480 32 L 1080 32" fill="none" stroke="#0f172a" strokeWidth="2.5" />
            <text x="500" y="24" fill="#0f172a" fontSize="10.5" fontWeight="bold" fontFamily="sans-serif">
              A1–A14 Latched Address Bus (14 lines) → Connected to RAM 1, RAM 2, ROM 1 &amp; ROM 2 (A0–A13 inputs)
            </text>

            {/* Drops into all 4 Memory Chips */}
            <path d="M 1040 32 L 1040 70 L 1060 70" fill="none" stroke="#0f172a" strokeWidth="1.8" />
            <path d="M 1050 32 L 1050 225 L 1060 225" fill="none" stroke="#0f172a" strokeWidth="1.8" />
            <path d="M 1060 32 L 1060 380 L 1060 380" fill="none" stroke="#0f172a" strokeWidth="1.8" />
            <path d="M 1070 32 L 1070 535 L 1060 535" fill="none" stroke="#0f172a" strokeWidth="1.8" />

            {/* ============================================================== */}
            {/* 1. 8086 MICROPROCESSOR (U1) */}
            {/* ============================================================== */}
            <g 
              onClick={() => setSelectedChip('u1')}
              className="cursor-pointer group"
            >
              <rect 
                x="30" y="45" width="220" height="635" rx="10" 
                fill={selectedChip === 'u1' ? '#f0fdf4' : '#ffffff'} 
                stroke={selectedChip === 'u1' ? '#16a34a' : '#94a3b8'} 
                strokeWidth={selectedChip === 'u1' ? 2.5 : 1.5}
                filter="drop-shadow(0 2px 5px rgba(0,0,0,0.05))"
              />
              <rect x="30" y="45" width="220" height="38" rx="10" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
              <text x="140" y="65" textAnchor="middle" fill="#0f172a" fontWeight="bold" fontSize="12" fontFamily="sans-serif">
                Intel 8086 MPU (U1)
              </text>
              <text x="140" y="78" textAnchor="middle" fill="#15803d" fontSize="9" fontWeight="bold">
                MIN MODE (MN/MX# = +5V)
              </text>

              {/* Pin Labels & Output Nodes */}
              {/* AD0–AD7 */}
              <text x="42" y="118" fill="#475569" fontSize="9.5">AD0–AD7 (Pins 16–9)</text>
              <circle cx="250" cy="115" r="3.5" fill="#3b82f6" />

              {/* AD8–AD15 */}
              <text x="42" y="193" fill="#475569" fontSize="9.5">AD8–AD15 (Pins 39, 2–8)</text>
              <circle cx="250" cy="190" r="3.5" fill="#3b82f6" />

              {/* A16–A19 & BHE# */}
              <text x="42" y="260" fill="#475569" fontSize="9">A16–A19 (35–38)</text>
              <text x="42" y="274" fill="#475569" fontSize="9">BHE#/S7 (Pin 34)</text>
              <circle cx="250" cy="265" r="3.5" fill="#7e22ce" />

              {/* ALE */}
              <text x="42" y="334" fill="#9a3412" fontSize="9.5" fontWeight="bold">ALE (Pin 25)</text>
              <circle cx="250" cy="330" r="3.5" fill={ale === 1 ? '#ea580c' : '#94a3b8'} />

              {/* M/IO# */}
              <text x="42" y="384" fill="#15803d" fontSize="9.5" fontWeight="bold">M/IO# (Pin 28) = 1</text>
              <circle cx="250" cy="380" r="3.5" fill="#15803d" />

              {/* RD# */}
              <text x="42" y="444" fill="#0369a1" fontSize="9.5" fontWeight="bold">RD# (Pin 32)</text>
              <circle cx="250" cy="440" r="3.5" fill={rd === 0 ? '#0284c7' : '#94a3b8'} />

              {/* WR# */}
              <text x="42" y="504" fill="#b45309" fontSize="9.5" fontWeight="bold">WR# (Pin 29)</text>
              <circle cx="250" cy="500" r="3.5" fill={wr === 0 ? '#d97706' : '#94a3b8'} />

              {/* DEN# & DT/R# */}
              <text x="42" y="564" fill="#64748b" fontSize="9.5">DEN# (Pin 26)</text>
              <circle cx="250" cy="560" r="3.5" fill={den === 0 ? '#6366f1' : '#94a3b8'} />

              <text x="42" y="614" fill="#64748b" fontSize="9.5">DT/R# (Pin 27)</text>
              <circle cx="250" cy="610" r="3.5" fill="#64748b" />

              {/* Status Box inside CPU */}
              <rect x="42" y="635" width="196" height="28" rx="5" fill="#f1f5f9" stroke="#cbd5e1" />
              <text x="140" y="653" fill="#4338ca" fontSize="9.5" fontWeight="bold" textAnchor="middle">
                CYCLE T{tState} • {tState === 1 ? 'ADDRESS PHASE' : 'DATA PHASE'}
              </text>
            </g>

            {/* ============================================================== */}
            {/* 2. 3× 74LS373 OCTAL ADDRESS LATCHES (U2A, U2B, U2C) */}
            {/* ============================================================== */}
            <g 
              onClick={() => setSelectedChip('u2')}
              className="cursor-pointer group"
            >
              {/* U2A: AD0–AD7 -> A0–A7 */}
              <rect 
                x="320" y="80" width="160" height="70" rx="6" 
                fill={selectedChip === 'u2' ? '#eef2ff' : '#ffffff'} 
                stroke={selectedChip === 'u2' ? '#3b82f6' : '#94a3b8'} 
                strokeWidth="1.5"
              />
              <text x="400" y="98" textAnchor="middle" fill="#1e40af" fontWeight="bold" fontSize="10.5">U2A: 74LS373 (Low)</text>
              <text x="328" y="118" fill="#475569" fontSize="8.5">AD0–AD7</text>
              <text x="430" y="118" fill="#1e40af" fontSize="8.5" fontWeight="bold">A0–A7</text>
              <text x="400" y="138" textAnchor="middle" fill="#d97706" fontSize="8">LE=ALE, OE#=GND</text>

              {/* U2B: AD8–AD15 -> A8–A15 */}
              <rect 
                x="320" y="155" width="160" height="70" rx="6" 
                fill={selectedChip === 'u2' ? '#eef2ff' : '#ffffff'} 
                stroke={selectedChip === 'u2' ? '#3b82f6' : '#94a3b8'} 
                strokeWidth="1.5"
              />
              <text x="400" y="173" textAnchor="middle" fill="#1e40af" fontWeight="bold" fontSize="10.5">U2B: 74LS373 (Mid)</text>
              <text x="328" y="193" fill="#475569" fontSize="8.5">AD8–AD15</text>
              <text x="430" y="193" fill="#1e40af" fontSize="8.5" fontWeight="bold">A8–A15</text>
              <text x="400" y="213" textAnchor="middle" fill="#d97706" fontSize="8">LE=ALE, OE#=GND</text>

              {/* U2C: A16–A19, BHE# */}
              <rect 
                x="320" y="230" width="160" height="70" rx="6" 
                fill={selectedChip === 'u2' ? '#eef2ff' : '#ffffff'} 
                stroke={selectedChip === 'u2' ? '#7e22ce' : '#94a3b8'} 
                strokeWidth="1.5"
              />
              <text x="400" y="248" textAnchor="middle" fill="#7e22ce" fontWeight="bold" fontSize="10.5">U2C: 74LS373 (High)</text>
              <text x="328" y="268" fill="#475569" fontSize="8.5">A16–19, BHE</text>
              <text x="415" y="268" fill="#7e22ce" fontSize="8.5" fontWeight="bold">A16–19, BHE#</text>
              <text x="400" y="288" textAnchor="middle" fill="#d97706" fontSize="8">LE=ALE, OE#=GND</text>
            </g>

            {/* Multiplexed Bus Lines from 8086 to Latches */}
            <path d="M 250 115 L 320 115" stroke="#3b82f6" strokeWidth="2" />
            <path d="M 250 190 L 320 190" stroke="#3b82f6" strokeWidth="2" />
            <path d="M 250 265 L 320 265" stroke="#7e22ce" strokeWidth="2" />

            {/* ALE Bus Line distributing to all 3 Latches */}
            <path d="M 250 330 L 305 330 L 305 130 L 320 130" fill="none" stroke={ale === 1 ? '#ea580c' : '#cbd5e1'} strokeWidth="2" strokeDasharray={ale === 1 ? 'none' : '3 3'} />
            <path d="M 305 205 L 320 205" fill="none" stroke={ale === 1 ? '#ea580c' : '#cbd5e1'} strokeWidth="2" />
            <path d="M 305 280 L 320 280" fill="none" stroke={ale === 1 ? '#ea580c' : '#cbd5e1'} strokeWidth="2" />
            <text x="260" y="324" fill="#b45309" fontSize="8.5" fontWeight="bold">ALE</text>

            {/* Latched Address Outputs to Top Rail: A1–A7 and A8–A14 */}
            <path d="M 480 115 L 500 115 L 500 32" fill="none" stroke="#0f172a" strokeWidth="2" />
            <path d="M 480 190 L 515 190 L 515 32" fill="none" stroke="#0f172a" strokeWidth="2" />

            {/* ============================================================== */}
            {/* BANK SELECT SIGNALS: A0 & BHE# */}
            {/* ============================================================== */}
            {/* A0 path (Even Bank Line) from U2A -> feeds OR 1 & OR 3 */}
            <path d="M 480 100 L 760 100" fill="none" stroke="#2563eb" strokeWidth="2" />
            <path d="M 760 100 L 760 410 L 790 410" fill="none" stroke="#2563eb" strokeWidth="2" />
            <path d="M 760 100 L 790 100" fill="none" stroke="#2563eb" strokeWidth="2" />
            <circle cx="760" cy="100" r="3" fill="#2563eb" />
            <text x="530" y="94" fill="#2563eb" fontSize="9" fontWeight="bold">A0 (Even Bank Enable: A0 = 0)</text>

            {/* BHE# path (Odd Bank Line) from U2C -> feeds OR 2 & OR 4 */}
            <path d="M 480 270 L 775 270" fill="none" stroke="#7e22ce" strokeWidth="2" />
            <path d="M 775 270 L 775 560 L 790 560" fill="none" stroke="#7e22ce" strokeWidth="2" />
            <path d="M 775 270 L 790 270" fill="none" stroke="#7e22ce" strokeWidth="2" />
            <circle cx="775" cy="270" r="3" fill="#7e22ce" />
            <text x="530" y="264" fill="#7e22ce" fontSize="9" fontWeight="bold">BHE# (Odd Bank Enable: BHE# = 0)</text>

            {/* ============================================================== */}
            {/* 3. DUAL MEMORY DECODERS (74LS138 / 74LS30 NAND) */}
            {/* ============================================================== */}
            <g 
              onClick={() => setSelectedChip('u3_dec')}
              className="cursor-pointer group"
            >
              <rect 
                x="540" y="325" width="200" height="185" rx="8" 
                fill={selectedChip === 'u3_dec' ? '#fdf4ff' : '#ffffff'} 
                stroke={selectedChip === 'u3_dec' ? '#7e22ce' : '#c084fc'} 
                strokeWidth="1.5"
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.04))"
              />
              <rect x="540" y="325" width="200" height="24" rx="8" fill="#7e22ce" />
              <text x="640" y="341" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">DUAL MEMORY DECODER</text>
              <text x="640" y="360" fill="#6b21a8" fontSize="8" textAnchor="middle">74LS138 / 74LS30 NAND (A15–A19)</text>

              {/* Sub-block 1: RAM Decoder */}
              <rect x="548" y="370" width="184" height="58" rx="4" fill={csRamBar === 0 ? '#ecfdf5' : '#f8fafc'} stroke={csRamBar === 0 ? '#059669' : '#e2e8f0'} />
              <text x="556" y="386" fill="#065f46" fontSize="8.5" fontWeight="bold">RAM Decoder: A19..A15 = 00000b</text>
              <text x="556" y="400" fill="#475569" fontSize="7.5">Address Space: 00000H–07FFFH (32 KB)</text>
              <text x="556" y="416" fill={csRamBar === 0 ? '#047857' : '#94a3b8'} fontSize="9.5" fontWeight="bold">
                CS_RAM# = {csRamBar}
              </text>
              <circle cx="740" cy="412" r="3.5" fill={csRamBar === 0 ? '#059669' : '#94a3b8'} />

              {/* Sub-block 2: ROM Decoder */}
              <rect x="548" y="438" width="184" height="62" rx="4" fill={csRomBar === 0 ? '#fffbeb' : '#f8fafc'} stroke={csRomBar === 0 ? '#d97706' : '#e2e8f0'} />
              <text x="556" y="454" fill="#92400e" fontSize="8.5" fontWeight="bold">ROM Decoder: A19..A15 = 11111b</text>
              <text x="556" y="468" fill="#475569" fontSize="7.5">Address Space: F8000H–FFFFFH (32 KB)</text>
              <text x="556" y="484" fill={csRomBar === 0 ? '#b45309' : '#94a3b8'} fontSize="9.5" fontWeight="bold">
                CS_ROM# = {csRomBar}
              </text>
              <circle cx="740" cy="480" r="3.5" fill={csRomBar === 0 ? '#d97706' : '#94a3b8'} />
            </g>

            {/* A15–A19 feed into Decoder */}
            <path d="M 480 205 L 525 205 L 525 350 L 540 350" fill="none" stroke="#7e22ce" strokeWidth="2" />
            <path d="M 480 250 L 530 250 L 530 365 L 540 365" fill="none" stroke="#7e22ce" strokeWidth="2" />
            <text x="495" y="300" fill="#7e22ce" fontSize="8.5" fontWeight="bold">A15–A19</text>

            {/* M/IO# feed into Decoder */}
            <path d="M 250 380 L 540 380" fill="none" stroke="#15803d" strokeWidth="2" />

            {/* CS_RAM# routes to OR 1 & OR 2 */}
            <path d="M 740 412 L 750 412 L 750 115 L 790 115" fill="none" stroke={csRamBar === 0 ? '#059669' : '#cbd5e1'} strokeWidth="2" />
            <path d="M 750 250 L 790 250" fill="none" stroke={csRamBar === 0 ? '#059669' : '#cbd5e1'} strokeWidth="2" />
            <circle cx="750" cy="250" r="3" fill={csRamBar === 0 ? '#059669' : '#cbd5e1'} />

            {/* CS_ROM# routes to OR 3 & OR 4 */}
            <path d="M 740 480 L 755 480 L 755 425 L 790 425" fill="none" stroke={csRomBar === 0 ? '#d97706' : '#cbd5e1'} strokeWidth="2" />
            <path d="M 755 480 L 755 575 L 790 575" fill="none" stroke={csRomBar === 0 ? '#d97706' : '#cbd5e1'} strokeWidth="2" />
            <circle cx="755" cy="480" r="3" fill={csRomBar === 0 ? '#d97706' : '#cbd5e1'} />

            {/* ============================================================== */}
            {/* 4. BANK QUALIFICATION OR GATES (74LS32) */}
            {/* ============================================================== */}
            <g 
              onClick={() => setSelectedChip('u_or')}
              className="cursor-pointer group"
            >
              {/* OR 1: CE_RAM1# (CS_RAM# + A0) */}
              <rect x="790" y="85" width="85" height="42" rx="5" fill="#ffffff" stroke={ceRam1Bar === 0 ? '#059669' : '#94a3b8'} strokeWidth={ceRam1Bar === 0 ? '2' : '1.5'} />
              <text x="832" y="99" textAnchor="middle" fill="#047857" fontSize="8" fontWeight="bold">OR 1 (74LS32)</text>
              <text x="832" y="111" textAnchor="middle" fill="#475569" fontSize="7">CS_RAM + A0</text>
              <text x="832" y="122" textAnchor="middle" fill={ceRam1Bar === 0 ? '#047857' : '#94a3b8'} fontSize="8" fontWeight="bold">CE_RAM1#={ceRam1Bar}</text>

              {/* OR 2: CE_RAM2# (CS_RAM# + BHE#) */}
              <rect x="790" y="235" width="85" height="42" rx="5" fill="#ffffff" stroke={ceRam2Bar === 0 ? '#059669' : '#94a3b8'} strokeWidth={ceRam2Bar === 0 ? '2' : '1.5'} />
              <text x="832" y="249" textAnchor="middle" fill="#047857" fontSize="8" fontWeight="bold">OR 2 (74LS32)</text>
              <text x="832" y="261" textAnchor="middle" fill="#475569" fontSize="7">CS_RAM + BHE#</text>
              <text x="832" y="272" textAnchor="middle" fill={ceRam2Bar === 0 ? '#047857' : '#94a3b8'} fontSize="8" fontWeight="bold">CE_RAM2#={ceRam2Bar}</text>

              {/* OR 3: CE_ROM1# (CS_ROM# + A0) */}
              <rect x="790" y="395" width="85" height="42" rx="5" fill="#ffffff" stroke={ceRom1Bar === 0 ? '#d97706' : '#94a3b8'} strokeWidth={ceRom1Bar === 0 ? '2' : '1.5'} />
              <text x="832" y="409" textAnchor="middle" fill="#b45309" fontSize="8" fontWeight="bold">OR 3 (74LS32)</text>
              <text x="832" y="421" textAnchor="middle" fill="#475569" fontSize="7">CS_ROM + A0</text>
              <text x="832" y="432" textAnchor="middle" fill={ceRom1Bar === 0 ? '#b45309' : '#94a3b8'} fontSize="8" fontWeight="bold">CE_ROM1#={ceRom1Bar}</text>

              {/* OR 4: CE_ROM2# (CS_ROM# + BHE#) */}
              <rect x="790" y="545" width="85" height="42" rx="5" fill="#ffffff" stroke={ceRom2Bar === 0 ? '#d97706' : '#94a3b8'} strokeWidth={ceRom2Bar === 0 ? '2' : '1.5'} />
              <text x="832" y="559" textAnchor="middle" fill="#b45309" fontSize="8" fontWeight="bold">OR 4 (74LS32)</text>
              <text x="832" y="571" textAnchor="middle" fill="#475569" fontSize="7">CS_ROM + BHE#</text>
              <text x="832" y="582" textAnchor="middle" fill={ceRom2Bar === 0 ? '#b45309' : '#94a3b8'} fontSize="8" fontWeight="bold">CE_ROM2#={ceRom2Bar}</text>
            </g>

            {/* Direct connection lines from OR Gate outputs to Memory CE# inputs */}
            <path d="M 875 106 L 1000 106" stroke={ceRam1Bar === 0 ? '#059669' : '#cbd5e1'} strokeWidth={ceRam1Bar === 0 ? '2.5' : '1.5'} />
            <path d="M 875 256 L 1000 256" stroke={ceRam2Bar === 0 ? '#059669' : '#cbd5e1'} strokeWidth={ceRam2Bar === 0 ? '2.5' : '1.5'} />
            <path d="M 875 416 L 1000 416" stroke={ceRom1Bar === 0 ? '#d97706' : '#cbd5e1'} strokeWidth={ceRom1Bar === 0 ? '2.5' : '1.5'} />
            <path d="M 875 566 L 1000 566" stroke={ceRom2Bar === 0 ? '#d97706' : '#cbd5e1'} strokeWidth={ceRom2Bar === 0 ? '2.5' : '1.5'} />

            {/* ============================================================== */}
            {/* CONTROL LINES: RD# & WR# BUSES */}
            {/* ============================================================== */}
            {/* RD# Bus line -> OE# pins on ALL 4 memory chips */}
            <path d="M 250 440 L 930 440" fill="none" stroke={rd === 0 ? '#0284c7' : '#cbd5e1'} strokeWidth={rd === 0 ? '2.5' : '1.5'} />
            {/* Vertical distribution for RD# */}
            <path d="M 930 126 L 930 586" fill="none" stroke={rd === 0 ? '#0284c7' : '#cbd5e1'} strokeWidth={rd === 0 ? '2' : '1.5'} />
            <path d="M 930 126 L 1000 126" stroke={rd === 0 ? '#0284c7' : '#cbd5e1'} strokeWidth={rd === 0 ? '2' : '1.5'} />
            <path d="M 930 276 L 1000 276" stroke={rd === 0 ? '#0284c7' : '#cbd5e1'} strokeWidth={rd === 0 ? '2' : '1.5'} />
            <path d="M 930 436 L 1000 436" stroke={rd === 0 ? '#0284c7' : '#cbd5e1'} strokeWidth={rd === 0 ? '2' : '1.5'} />
            <path d="M 930 586 L 1000 586" stroke={rd === 0 ? '#0284c7' : '#cbd5e1'} strokeWidth={rd === 0 ? '2' : '1.5'} />
            <text x="890" y="434" fill="#0284c7" fontSize="8.5" fontWeight="bold">RD#</text>

            {/* WR# Bus line -> WE# pins on RAM 1 & RAM 2 ONLY (ROM has no write pin) */}
            <path d="M 250 500 L 950 500" fill="none" stroke={wr === 0 ? '#d97706' : '#cbd5e1'} strokeWidth={wr === 0 ? '2.5' : '1.5'} />
            {/* Vertical distribution for WR# (Only goes up to RAM 1 & RAM 2) */}
            <path d="M 950 148 L 950 500" fill="none" stroke={wr === 0 ? '#d97706' : '#cbd5e1'} strokeWidth={wr === 0 ? '2' : '1.5'} />
            <path d="M 950 148 L 1000 148" stroke={wr === 0 ? '#d97706' : '#cbd5e1'} strokeWidth={wr === 0 ? '2' : '1.5'} />
            <path d="M 950 298 L 1000 298" stroke={wr === 0 ? '#d97706' : '#cbd5e1'} strokeWidth={wr === 0 ? '2' : '1.5'} />
            <text x="890" y="494" fill="#d97706" fontSize="8.5" fontWeight="bold">WR#</text>

            {/* ============================================================== */}
            {/* 5. 2× 74LS245 DATA TRANSCEIVERS & DATA BUSES */}
            {/* ============================================================== */}
            <g 
              onClick={() => setSelectedChip('u4')}
              className="cursor-pointer group"
            >
              {/* U4A: Lower Data Byte (AD0–AD7 -> D0–D7) */}
              <rect 
                x="540" y="540" width="200" height="60" rx="6" 
                fill={selectedChip === 'u4' ? '#eef2ff' : '#ffffff'} 
                stroke={selectedChip === 'u4' ? '#4f46e5' : '#a5b4fc'} 
                strokeWidth="1.5"
              />
              <text x="640" y="556" fill="#312e81" fontSize="9.5" fontWeight="bold" textAnchor="middle">74LS245 (U4A - Lower)</text>
              <text x="548" y="572" fill="#475569" fontSize="8">AD0–AD7</text>
              <text x="732" y="572" fill="#2563eb" fontSize="8.5" fontWeight="bold" textAnchor="end">D0–D7</text>
              <text x="640" y="590" fill="#475569" fontSize="7.5" textAnchor="middle">
                DIR: DT/R# ({dtr}), OE#: DEN# ({den})
              </text>
              <circle cx="725" cy="552" r="3.5" fill={lowerTransceiverActive ? '#059669' : '#cbd5e1'} />

              {/* U4B: Upper Data Byte (AD8–AD15 -> D8–D15) */}
              <rect 
                x="540" y="615" width="200" height="60" rx="6" 
                fill={selectedChip === 'u4' ? '#eef2ff' : '#ffffff'} 
                stroke={selectedChip === 'u4' ? '#4f46e5' : '#a5b4fc'} 
                strokeWidth="1.5"
              />
              <text x="640" y="631" fill="#312e81" fontSize="9.5" fontWeight="bold" textAnchor="middle">74LS245 (U4B - Upper)</text>
              <text x="548" y="647" fill="#475569" fontSize="8">AD8–AD15</text>
              <text x="732" y="647" fill="#d97706" fontSize="8.5" fontWeight="bold" textAnchor="end">D8–D15</text>
              <text x="640" y="665" fill="#475569" fontSize="7.5" textAnchor="middle">
                DIR: DT/R# ({dtr}), OE#: DEN# ({den})
              </text>
              <circle cx="725" cy="627" r="3.5" fill={upperTransceiverActive ? '#059669' : '#cbd5e1'} />
            </g>

            {/* DEN# & DT/R# control feeds from CPU to Transceivers */}
            <path d="M 250 560 L 540 560" fill="none" stroke={den === 0 ? '#6366f1' : '#cbd5e1'} strokeWidth="1.8" />
            <path d="M 250 610 L 540 610" fill="none" stroke="#64748b" strokeWidth="1.8" />

            {/* AD0–AD7 and AD8–AD15 buses drop from CPU to Transceivers */}
            <path d="M 285 115 L 285 570 L 540 570" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 2" />
            <path d="M 270 190 L 270 645 L 540 645" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 2" />

            {/* Data Bus Distribution Rails to Memory Chips */}
            {/* Lower Data Byte (D0–D7) -> RAM 1 (Even) & ROM 1 (Even) */}
            <path d="M 740 570 L 965 570 L 965 88 L 1000 88" fill="none" stroke="#2563eb" strokeWidth={lowerTransceiverActive ? '2.5' : '1.5'} />
            <path d="M 965 400 L 1000 400" fill="none" stroke="#2563eb" strokeWidth={lowerTransceiverActive ? '2.5' : '1.5'} />
            <circle cx="965" cy="400" r="3" fill="#2563eb" />
            <text x="748" y="564" fill="#2563eb" fontSize="8.5" fontWeight="bold">D0–D7 Bus</text>

            {/* Upper Data Byte (D8–D15) -> RAM 2 (Odd) & ROM 2 (Odd) */}
            <path d="M 740 645 L 980 645 L 980 238 L 1000 238" fill="none" stroke="#d97706" strokeWidth={upperTransceiverActive ? '2.5' : '1.5'} />
            <path d="M 980 550 L 1000 550" fill="none" stroke="#d97706" strokeWidth={upperTransceiverActive ? '2.5' : '1.5'} />
            <circle cx="980" cy="550" r="3" fill="#d97706" />
            <text x="748" y="639" fill="#d97706" fontSize="8.5" fontWeight="bold">D8–D15 Bus</text>

            {/* ============================================================== */}
            {/* 6. FOUR MEMORY CHIPS (2× 16 KB SRAM + 2× 16 KB EPROM) */}
            {/* ============================================================== */}

            {/* CHIP 1: RAM 1 (16 KB Even Bank SRAM - 00000H–07FFEH) */}
            <g 
              onClick={() => setSelectedChip('ram1')}
              className="cursor-pointer group"
            >
              <rect 
                x="1000" y="45" width="345" height="135" rx="8" 
                fill={selectedChip === 'ram1' ? '#ecfdf5' : '#ffffff'} 
                stroke={selectedChip === 'ram1' ? '#047857' : ram1Active ? '#059669' : '#94a3b8'} 
                strokeWidth={ram1Active || selectedChip === 'ram1' ? '2.5' : '1.5'}
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.04))"
              />
              <rect x="1000" y="45" width="345" height="22" rx="8" fill="#047857" />
              <text x="1172" y="59" fill="#ffffff" fontSize="9.5" fontWeight="bold" textAnchor="middle">
                RAM 1: 16 KB SRAM (Even Bank D0–D7) • 00000H–07FFEH
              </text>
              <circle cx="1328" cy="56" r="4.5" fill={ram1Active ? '#34d399' : '#94a3b8'} />

              {/* Pins */}
              <text x="1010" y="76" fill="#0f172a" fontSize="8.5" fontWeight="bold">A0–A13 (14 pins) ← A1–A14 latched</text>
              <text x="1010" y="92" fill="#2563eb" fontSize="8.5" fontWeight="bold">D0–D7 (Lower Byte Data Bus)</text>
              <text x="1010" y="110" fill={ceRam1Bar === 0 ? '#047857' : '#94a3b8'} fontSize="9" fontWeight="bold">
                CE# (Pin) ← CE_RAM1# ({ceRam1Bar})
              </text>
              <text x="1010" y="130" fill={rd === 0 ? '#0284c7' : '#94a3b8'} fontSize="9" fontWeight="bold">
                OE# (Pin) ← 8086 RD# ({rd})
              </text>
              <text x="1010" y="152" fill={wr === 0 ? '#d97706' : '#94a3b8'} fontSize="9" fontWeight="bold">
                WE# (Pin) ← 8086 WR# ({wr})
              </text>
              <text x="1010" y="170" fill="#64748b" fontSize="8">Offset Address: {chipAddrHex}H</text>
            </g>

            {/* CHIP 2: RAM 2 (16 KB Odd Bank SRAM - 00001H–07FFFH) */}
            <g 
              onClick={() => setSelectedChip('ram2')}
              className="cursor-pointer group"
            >
              <rect 
                x="1000" y="195" width="345" height="135" rx="8" 
                fill={selectedChip === 'ram2' ? '#ecfdf5' : '#ffffff'} 
                stroke={selectedChip === 'ram2' ? '#047857' : ram2Active ? '#059669' : '#94a3b8'} 
                strokeWidth={ram2Active || selectedChip === 'ram2' ? '2.5' : '1.5'}
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.04))"
              />
              <rect x="1000" y="195" width="345" height="22" rx="8" fill="#047857" />
              <text x="1172" y="209" fill="#ffffff" fontSize="9.5" fontWeight="bold" textAnchor="middle">
                RAM 2: 16 KB SRAM (Odd Bank D8–D15) • 00001H–07FFFH
              </text>
              <circle cx="1328" cy="206" r="4.5" fill={ram2Active ? '#34d399' : '#94a3b8'} />

              {/* Pins */}
              <text x="1010" y="228" fill="#0f172a" fontSize="8.5" fontWeight="bold">A0–A13 (14 pins) ← A1–A14 latched</text>
              <text x="1010" y="244" fill="#d97706" fontSize="8.5" fontWeight="bold">D8–D15 (Upper Byte Data Bus)</text>
              <text x="1010" y="260" fill={ceRam2Bar === 0 ? '#047857' : '#94a3b8'} fontSize="9" fontWeight="bold">
                CE# (Pin) ← CE_RAM2# ({ceRam2Bar})
              </text>
              <text x="1010" y="280" fill={rd === 0 ? '#0284c7' : '#94a3b8'} fontSize="9" fontWeight="bold">
                OE# (Pin) ← 8086 RD# ({rd})
              </text>
              <text x="1010" y="302" fill={wr === 0 ? '#d97706' : '#94a3b8'} fontSize="9" fontWeight="bold">
                WE# (Pin) ← 8086 WR# ({wr})
              </text>
              <text x="1010" y="320" fill="#64748b" fontSize="8">Offset Address: {chipAddrHex}H</text>
            </g>

            {/* CHIP 3: ROM 1 (16 KB Even Bank EPROM - F8000H–FFFEH) */}
            <g 
              onClick={() => setSelectedChip('rom1')}
              className="cursor-pointer group"
            >
              <rect 
                x="1000" y="355" width="345" height="135" rx="8" 
                fill={selectedChip === 'rom1' ? '#fffbeb' : '#ffffff'} 
                stroke={selectedChip === 'rom1' ? '#b45309' : rom1Active ? '#d97706' : '#94a3b8'} 
                strokeWidth={rom1Active || selectedChip === 'rom1' ? '2.5' : '1.5'}
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.04))"
              />
              <rect x="1000" y="355" width="345" height="22" rx="8" fill="#b45309" />
              <text x="1172" y="369" fill="#ffffff" fontSize="9.5" fontWeight="bold" textAnchor="middle">
                ROM 1: 16 KB EPROM (Even Bank D0–D7) • F8000H–FFFEH
              </text>
              <circle cx="1328" cy="366" r="4.5" fill={rom1Active ? '#fbbf24' : '#94a3b8'} />

              {/* Pins */}
              <text x="1010" y="386" fill="#0f172a" fontSize="8.5" fontWeight="bold">A0–A13 (14 pins) ← A1–A14 latched</text>
              <text x="1010" y="404" fill="#2563eb" fontSize="8.5" fontWeight="bold">D0–D7 (Lower Byte Data Bus)</text>
              <text x="1010" y="420" fill={ceRom1Bar === 0 ? '#b45309' : '#94a3b8'} fontSize="9" fontWeight="bold">
                CE# (Pin) ← CE_ROM1# ({ceRom1Bar})
              </text>
              <text x="1010" y="440" fill={rd === 0 ? '#0284c7' : '#94a3b8'} fontSize="9" fontWeight="bold">
                OE# (Pin) ← 8086 RD# ({rd})
              </text>
              <text x="1010" y="460" fill="#94a3b8" fontSize="8.5" fontStyle="italic">
                NO WE# PIN (Read-Only Hardware Protection)
              </text>
              <text x="1010" y="480" fill="#64748b" fontSize="8">Offset Address: {chipAddrHex}H</text>
            </g>

            {/* CHIP 4: ROM 2 (16 KB Odd Bank EPROM - F8001H–FFFFFH) */}
            <g 
              onClick={() => setSelectedChip('rom2')}
              className="cursor-pointer group"
            >
              <rect 
                x="1000" y="505" width="345" height="135" rx="8" 
                fill={selectedChip === 'rom2' ? '#fffbeb' : '#ffffff'} 
                stroke={selectedChip === 'rom2' ? '#b45309' : rom2Active ? '#d97706' : '#94a3b8'} 
                strokeWidth={rom2Active || selectedChip === 'rom2' ? '2.5' : '1.5'}
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.04))"
              />
              <rect x="1000" y="505" width="345" height="22" rx="8" fill="#b45309" />
              <text x="1172" y="519" fill="#ffffff" fontSize="9.5" fontWeight="bold" textAnchor="middle">
                ROM 2: 16 KB EPROM (Odd Bank D8–D15) • F8001H–FFFFFH
              </text>
              <circle cx="1328" cy="516" r="4.5" fill={rom2Active ? '#fbbf24' : '#94a3b8'} />

              {/* Pins */}
              <text x="1010" y="536" fill="#0f172a" fontSize="8.5" fontWeight="bold">A0–A13 (14 pins) ← A1–A14 latched</text>
              <text x="1010" y="554" fill="#d97706" fontSize="8.5" fontWeight="bold">D8–D15 (Upper Byte Data Bus)</text>
              <text x="1010" y="570" fill={ceRom2Bar === 0 ? '#b45309' : '#94a3b8'} fontSize="9" fontWeight="bold">
                CE# (Pin) ← CE_ROM2# ({ceRom2Bar})
              </text>
              <text x="1010" y="590" fill={rd === 0 ? '#0284c7' : '#94a3b8'} fontSize="9" fontWeight="bold">
                OE# (Pin) ← 8086 RD# ({rd})
              </text>
              <text x="1010" y="610" fill="#94a3b8" fontSize="8.5" fontStyle="italic">
                NO WE# PIN (Read-Only Hardware Protection)
              </text>
              <text x="1010" y="630" fill="#64748b" fontSize="8">Offset Address: {chipAddrHex}H • Reset Vector: FFFF0H</text>
            </g>

            {/* Bottom Address Map Banner */}
            <g transform="translate(30, 685)">
              <rect x="0" y="0" width="1315" height="32" rx="6" fill="#f8fafc" stroke="#cbd5e1" />
              
              <rect x="8" y="5" width="410" height="22" rx="4" fill="#ecfdf5" stroke="#059669" />
              <text x="213" y="19" fill="#065f46" fontSize="9" fontWeight="bold" textAnchor="middle">
                32 KB RAM Space: 00000H – 07FFFH (RAM 1 Even Bank + RAM 2 Odd Bank)
              </text>

              <rect x="428" y="5" width="455" height="22" rx="4" fill="#f1f5f9" stroke="#94a3b8" />
              <text x="655" y="19" fill="#475569" fontSize="9" textAnchor="middle">
                Unmapped Address Space (08000H – F7FFFH) • All CS# &amp; CE# Inactive (HIGH)
              </text>

              <rect x="893" y="5" width="414" height="22" rx="4" fill="#fffbeb" stroke="#d97706" />
              <text x="1100" y="19" fill="#92400e" fontSize="9" fontWeight="bold" textAnchor="middle">
                32 KB ROM Space: F8000H – FFFFFH (ROM 1 Even Bank + ROM 2 Odd Bank)
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* Selected Component Inspector Panel */}
      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
              <CircuitBoard className="w-4 h-4" />
            </span>
            <div>
              <h4 className="font-bold text-xs text-slate-900">{selectedData.title}</h4>
              <p className="text-[11px] text-slate-500">{selectedData.subtitle}</p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-300 text-amber-700 font-bold">
            Live Pin Telemetry
          </span>
        </div>

        <p className="text-slate-600 text-[11px] leading-relaxed">
          {selectedData.desc}
        </p>

        {/* Tech Specs & Live Pin States */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
          {/* Tech Specs */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5 font-mono text-[10.5px]">
            <span className="text-[9.5px] font-bold text-indigo-800 uppercase tracking-wider block font-sans">
              Hardware Specifications
            </span>
            {selectedData.techSpecs.map((spec, i) => (
              <div key={i} className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">{spec.label}:</span>
                <span className="font-bold text-slate-800 text-right">{spec.val}</span>
              </div>
            ))}
          </div>

          {/* Live Pin Telemetry */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5 font-mono text-[10.5px]">
            <span className="text-[9.5px] font-bold text-emerald-800 uppercase tracking-wider block font-sans">
              Active Bus Pin States (Cycle T{tState})
            </span>
            {selectedData.pins.map((pin, i) => (
              <div key={i} className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">{pin.pin}:</span>
                <span className="font-bold text-emerald-700 text-right">{pin.state}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
