import React, { useState, useEffect } from 'react';
import { Cpu, Sliders, CheckCircle2, Zap, ArrowRight, ToggleLeft, ToggleRight, Settings, Layers, Hash, Info, Eye, Sparkles, ArrowDown, ArrowUp, RefreshCw, Play, AlertCircle, Radio, RotateCcw, CornerDownRight, Check } from 'lucide-react';
import PPI8255ArchitectureDiagram from './PPI8255ArchitectureDiagram';
import PPI8255ModesOfOperation from './PPI8255ModesOfOperation';

export type PPI8255Tab = 'diagram' | 'pins' | 'architecture' | 'modes' | 'iomode' | 'bsr' | 'registers';

interface PPI8255SimulatorProps {
  initialTab?: PPI8255Tab;
  allowedTabs?: PPI8255Tab[];
  pinsVariant?: 'features-only' | 'inspector' | 'all';
}

export default function PPI8255Simulator({
  initialTab = 'pins',
  allowedTabs,
  pinsVariant = 'all',
}: PPI8255SimulatorProps) {
  const [activeTab, setActiveTab] = useState<PPI8255Tab>(initialTab);
  const [selectedPin, setSelectedPin] = useState<number | null>(null);
  const [activeGroupFilter, setActiveGroupFilter] = useState<'all' | 'Port A' | 'Port B' | 'Port C' | 'Control & Bus' | 'Power'>('all');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // I/O Mode Config state
  const [ioSubTab, setIoSubTab] = useState<'generator' | 'mode0' | 'mode1' | 'mode2' | 'table'>('generator');
  const [groupAMode, setGroupAMode] = useState<'mode0' | 'mode1' | 'mode2'>('mode0');
  const [portADir, setPortADir] = useState<'input' | 'output'>('output');
  const [portCUpperDir, setPortCUpperDir] = useState<'input' | 'output'>('output');

  const [groupBMode, setGroupBMode] = useState<'mode0' | 'mode1'>('mode0');
  const [portBDir, setPortBDir] = useState<'input' | 'output'>('output');
  const [portCLowerDir, setPortCLowerDir] = useState<'input' | 'output'>('output');

  // BSR Mode state
  const [bsrBit, setBsrBit] = useState<number>(0); // 0 to 7
  const [bsrSetReset, setBsrSetReset] = useState<number>(1); // 1 = Set, 0 = Reset

  // Interactive Port Data Values & Latches
  const [portAOutputLatch, setPortAOutputLatch] = useState<number>(0xAA);
  const [portBOutputLatch, setPortBOutputLatch] = useState<number>(0x55);
  const [portCOutputLatch, setPortCOutputLatch] = useState<number>(0xF0);

  const [portAExtInput, setPortAExtInput] = useState<number>(0x3C);
  const [portBExtInput, setPortBExtInput] = useState<number>(0x96);
  const [portCExtInput, setPortCExtInput] = useState<number>(0x0F);

  // Effective Port Pin Values based on direction:
  const effectivePortAPins = portADir === 'input' ? portAExtInput : portAOutputLatch;
  const effectivePortBPins = portBDir === 'input' ? portBExtInput : portBOutputLatch;
  const effectivePortCPins =
    ((portCUpperDir === 'input' ? portCExtInput : portCOutputLatch) & 0xF0) |
    ((portCLowerDir === 'input' ? portCExtInput : portCOutputLatch) & 0x0F);

  const [portAVal, setPortAVal] = useState<number>(effectivePortAPins);
  const [portBVal, setPortBVal] = useState<number>(effectivePortBPins);
  const [portCVal, setPortCVal] = useState<number>(effectivePortCPins);

  // Synchronize portAVal, portBVal, portCVal with effective pins
  useEffect(() => {
    setPortAVal(effectivePortAPins);
  }, [effectivePortAPins]);

  useEffect(() => {
    setPortBVal(effectivePortBPins);
  }, [effectivePortBPins]);

  useEffect(() => {
    setPortCVal(effectivePortCPins);
  }, [effectivePortCPins]);

  // Hardware Bus Control Signals state (Pins 5, 6, 8, 9, 36)
  const [sigCS, setSigCS] = useState<number>(0); // Chip Select (Pin 6): 0 = Enabled (Active LOW), 1 = Disabled
  const [sigA1, setSigA1] = useState<number>(0); // Address Pin 9: 0 or 1
  const [sigA0, setSigA0] = useState<number>(0); // Address Pin 8: 0 or 1
  const [sigRD, setSigRD] = useState<number>(1); // Read Strobe Pin 5: 0 = Active, 1 = Idle
  const [sigWR, setSigWR] = useState<number>(1); // Write Strobe Pin 36: 0 = Active, 1 = Idle
  const [cpuDataBus, setCpuDataBus] = useState<number>(0x55); // 8-bit CPU Data Bus (D7–D0)

  const [busCycleLog, setBusCycleLog] = useState<{
    type: 'read' | 'write' | 'warning' | 'reset' | 'idle';
    title: string;
    details: string;
  }>({
    type: 'idle',
    title: 'Bus Idle (C̅S̅=0, R̅D̅=1, W̅R̅=1)',
    details: 'Select a target port address (A1, A0) and execute a CPU Read (R̅D̅=0) or Write (W̅R̅=0) cycle.',
  });

  // Compute 8255 I/O Control Word Byte
  let d6d5 = 0;
  if (groupAMode === 'mode1') d6d5 = 1;
  if (groupAMode === 'mode2') d6d5 = 2; // 10 binary

  const d4 = portADir === 'input' ? 1 : 0;
  const d3 = portCUpperDir === 'input' ? 1 : 0;
  const d2 = groupBMode === 'mode1' ? 1 : 0;
  const d1 = portBDir === 'input' ? 1 : 0;
  const d0 = portCLowerDir === 'input' ? 1 : 0;

  const controlWordByte = (1 << 7) | (d6d5 << 5) | (d4 << 4) | (d3 << 3) | (d2 << 2) | (d1 << 1) | d0;
  const controlWordHex = controlWordByte.toString(16).toUpperCase().padStart(2, '0') + 'H';

  // Compute BSR Control Word Byte
  const bsrControlWordByte = (bsrBit << 1) | bsrSetReset;
  const bsrControlWordHex = bsrControlWordByte.toString(16).toUpperCase().padStart(2, '0') + 'H';

  // Decode & apply full control word byte
  const applyControlWordByte = (byte: number) => {
    const val = byte & 0xff;
    if ((val & 0x80) !== 0) {
      // D7 = 1: I/O Mode
      const d6d5Bits = (val >> 5) & 0x03;
      if (d6d5Bits === 0) setGroupAMode('mode0');
      else if (d6d5Bits === 1) setGroupAMode('mode1');
      else setGroupAMode('mode2');

      setPortADir((val & 0x10) ? 'input' : 'output');
      setPortCUpperDir((val & 0x08) ? 'input' : 'output');
      setGroupBMode((val & 0x04) ? 'mode1' : 'mode0');
      setPortBDir((val & 0x02) ? 'input' : 'output');
      setPortCLowerDir((val & 0x01) ? 'input' : 'output');
      setActiveTab('iomode');
    } else {
      // D7 = 0: BSR Mode
      const bit = (val >> 1) & 0x07;
      const sr = val & 0x01;
      setBsrBit(bit);
      setBsrSetReset(sr);
      setActiveTab('bsr');
    }
  };

  // Toggle individual bit in I/O Mode control word
  const handleToggleIoBit = (bitIndex: number) => {
    if (bitIndex === 7) {
      // D7 toggles to 0 -> switch to BSR Mode
      setActiveTab('bsr');
      return;
    }
    if (bitIndex === 6) {
      // Toggle D6 (Group A Mode bit 1)
      if (groupAMode === 'mode2') {
        setGroupAMode('mode0');
      } else {
        setGroupAMode('mode2');
      }
      return;
    }
    if (bitIndex === 5) {
      // Toggle D5 (Group A Mode bit 0)
      if (groupAMode === 'mode1') {
        setGroupAMode('mode0');
      } else if (groupAMode === 'mode0') {
        setGroupAMode('mode1');
      } else {
        // From mode 2 to mode 1
        setGroupAMode('mode1');
      }
      return;
    }
    if (bitIndex === 4) {
      setPortADir((prev) => (prev === 'input' ? 'output' : 'input'));
      return;
    }
    if (bitIndex === 3) {
      setPortCUpperDir((prev) => (prev === 'input' ? 'output' : 'input'));
      return;
    }
    if (bitIndex === 2) {
      setGroupBMode((prev) => (prev === 'mode1' ? 'mode0' : 'mode1'));
      return;
    }
    if (bitIndex === 1) {
      setPortBDir((prev) => (prev === 'input' ? 'output' : 'input'));
      return;
    }
    if (bitIndex === 0) {
      setPortCLowerDir((prev) => (prev === 'input' ? 'output' : 'input'));
      return;
    }
  };

  // Toggle individual bit in BSR Mode control word
  const handleToggleBsrBit = (bitIndex: number) => {
    if (bitIndex === 7) {
      // D7 toggles to 1 -> switch to I/O Mode
      setActiveTab('iomode');
      return;
    }
    if (bitIndex === 0) {
      setBsrSetReset((prev) => (prev === 1 ? 0 : 1));
      return;
    }
    if (bitIndex >= 1 && bitIndex <= 3) {
      const shift = bitIndex - 1;
      const mask = 1 << shift;
      setBsrBit((prev) => prev ^ mask);
      return;
    }
  };

  const handleApplyBSR = () => {
    let newPortC = portCOutputLatch;
    if (bsrSetReset === 1) {
      newPortC |= (1 << bsrBit);
    } else {
      newPortC &= ~(1 << bsrBit);
    }
    setPortCOutputLatch(newPortC);
    setPortCVal(newPortC);
    setBusCycleLog({
      type: 'write',
      title: `⚙️ BSR Executed: Port C Bit PC${bsrBit} → ${bsrSetReset === 1 ? 'SET (1)' : 'RESET (0)'}`,
      details: `BSR Control Word ${((bsrBit << 1) | bsrSetReset).toString(16).toUpperCase().padStart(2, '0')}H modified Port C bit PC${bsrBit}.`,
    });
  };

  // Microprocessor Bus Cycle Handlers
  const executeCpuRead = (overrideA1?: number, overrideA0?: number) => {
    const a1Val = overrideA1 !== undefined ? overrideA1 : sigA1;
    const a0Val = overrideA0 !== undefined ? overrideA0 : sigA0;
    if (overrideA1 !== undefined) setSigA1(overrideA1);
    if (overrideA0 !== undefined) setSigA0(overrideA0);
    setSigCS(0);
    setSigRD(0);
    setSigWR(1);

    if (sigCS === 1 && overrideA1 === undefined) {
      setBusCycleLog({
        type: 'warning',
        title: '⚠️ Read Ignored: Chip Disabled (C̅S̅ = 1)',
        details: 'When C̅S̅ is HIGH (+5V), internal 8255 bus buffers remain in high-impedance state (tri-state).',
      });
      return;
    }

    if (a1Val === 0 && a0Val === 0) {
      // Port A (80H)
      const dataRead = portADir === 'input' ? portAExtInput : portAOutputLatch;
      setCpuDataBus(dataRead);
      setBusCycleLog({
        type: 'read',
        title: `🔵 [IN AL, 80H / Port A]: C̅S̅=0, R̅D̅=0, W̅R̅=1, A1=0, A0=0 → Read 0x${dataRead.toString(16).toUpperCase().padStart(2, '0')} (${dataRead.toString(2).padStart(8, '0')}b)`,
        details: portADir === 'input'
          ? `Port A is configured as INPUT (D4=1). CPU placed 8255 external pin inputs (PA7–PA0) onto CPU Data Bus lines (D7–D0).`
          : `Port A is configured as OUTPUT (D4=0). CPU read the current latched output value from Port A output register onto Data Bus.`,
      });
    } else if (a1Val === 0 && a0Val === 1) {
      // Port B (81H)
      const dataRead = portBDir === 'input' ? portBExtInput : portBOutputLatch;
      setCpuDataBus(dataRead);
      setBusCycleLog({
        type: 'read',
        title: `🔵 [IN AL, 81H / Port B]: C̅S̅=0, R̅D̅=0, W̅R̅=1, A1=0, A0=1 → Read 0x${dataRead.toString(16).toUpperCase().padStart(2, '0')} (${dataRead.toString(2).padStart(8, '0')}b)`,
        details: portBDir === 'input'
          ? `Port B is configured as INPUT (D1=1). External peripheral signals on PB7–PB0 transferred to CPU Data Bus.`
          : `Port B is configured as OUTPUT (D1=0). Current latched value transferred to CPU Data Bus.`,
      });
    } else if (a1Val === 1 && a0Val === 0) {
      // Port C (82H)
      const dataRead = effectivePortCPins;
      setCpuDataBus(dataRead);
      const upDesc = portCUpperDir === 'input' ? 'PC7–PC4 from external pins' : 'PC7–PC4 from output latch';
      const lowDesc = portCLowerDir === 'input' ? 'PC3–PC0 from external pins' : 'PC3–PC0 from output latch';
      setBusCycleLog({
        type: 'read',
        title: `🔵 [IN AL, 82H / Port C]: C̅S̅=0, R̅D̅=0, W̅R̅=1, A1=1, A0=0 → Read 0x${dataRead.toString(16).toUpperCase().padStart(2, '0')} (${dataRead.toString(2).padStart(8, '0')}b)`,
        details: `Split Read: ${upDesc}, and ${lowDesc}. Transferred onto CPU Data Bus lines D7–D0.`,
      });
    } else {
      // Control Register (83H)
      setBusCycleLog({
        type: 'warning',
        title: `⚠️ Read Blocked: Control Register (A1=1, A0=1) is WRITE-ONLY`,
        details: `In Intel 8255 architecture, reading from Control Register Address (A1=1, A0=1 with R̅D̅=0) is illegal. The internal control word is not readable; bus enters High-Z / float.`,
      });
    }
  };

  const executeCpuWrite = (overrideA1?: number, overrideA0?: number, overrideData?: number) => {
    const a1Val = overrideA1 !== undefined ? overrideA1 : sigA1;
    const a0Val = overrideA0 !== undefined ? overrideA0 : sigA0;
    const dataToWrite = overrideData !== undefined ? overrideData : cpuDataBus;
    if (overrideA1 !== undefined) setSigA1(overrideA1);
    if (overrideA0 !== undefined) setSigA0(overrideA0);
    setSigCS(0);
    setSigWR(0);
    setSigRD(1);

    if (sigCS === 1 && overrideA1 === undefined) {
      setBusCycleLog({
        type: 'warning',
        title: '⚠️ Write Aborted: Chip Disabled (C̅S̅ = 1)',
        details: 'When C̅S̅ is HIGH (+5V), internal write strobes are blocked. Port registers remain unchanged.',
      });
      return;
    }

    if (a1Val === 0 && a0Val === 0) {
      // Port A (80H)
      if (portADir === 'output') {
        setPortAOutputLatch(dataToWrite);
        setBusCycleLog({
          type: 'write',
          title: `🟢 [OUT 80H, AL / Port A]: C̅S̅=0, W̅R̅=0, R̅D̅=1, A1=0, A0=0 → Latched 0x${dataToWrite.toString(16).toUpperCase().padStart(2, '0')} (${dataToWrite.toString(2).padStart(8, '0')}b)`,
          details: `Port A is OUTPUT (D4=0). Latched byte from CPU Data Bus into Port A register. Pins PA7–PA0 are actively driving this value.`,
        });
      } else {
        setBusCycleLog({
          type: 'warning',
          title: `⚠️ Write Ignored: Port A is configured as INPUT (D4=1)`,
          details: `Port A is in input mode. Pins are driven by external peripheral devices. CPU writes have no effect on input pins.`,
        });
      }
    } else if (a1Val === 0 && a0Val === 1) {
      // Port B (81H)
      if (portBDir === 'output') {
        setPortBOutputLatch(dataToWrite);
        setBusCycleLog({
          type: 'write',
          title: `🟢 [OUT 81H, AL / Port B]: C̅S̅=0, W̅R̅=0, R̅D̅=1, A1=0, A0=1 → Latched 0x${dataToWrite.toString(16).toUpperCase().padStart(2, '0')} (${dataToWrite.toString(2).padStart(8, '0')}b)`,
          details: `Port B is OUTPUT (D1=0). Latched byte from CPU Data Bus into Port B register. Pins PB7–PB0 are actively driving this value.`,
        });
      } else {
        setBusCycleLog({
          type: 'warning',
          title: `⚠️ Write Ignored: Port B is configured as INPUT (D1=1)`,
          details: `Port B is in input mode. CPU cannot write to external input lines.`,
        });
      }
    } else if (a1Val === 1 && a0Val === 0) {
      // Port C (82H)
      let newLatch = portCOutputLatch;
      let writeOccurred = false;
      let detailsText = '';

      if (portCUpperDir === 'output') {
        newLatch = (newLatch & 0x0F) | (dataToWrite & 0xF0);
        writeOccurred = true;
        detailsText += 'Upper nibble (PC7–PC4) latched from D7–D4. ';
      } else {
        detailsText += 'Upper nibble is INPUT (protected from CPU write). ';
      }

      if (portCLowerDir === 'output') {
        newLatch = (newLatch & 0xF0) | (dataToWrite & 0x0F);
        writeOccurred = true;
        detailsText += 'Lower nibble (PC3–PC0) latched from D3–D0.';
      } else {
        detailsText += 'Lower nibble is INPUT (protected from CPU write).';
      }

      if (writeOccurred) {
        setPortCOutputLatch(newLatch);
        setBusCycleLog({
          type: 'write',
          title: `🟢 [OUT 82H, AL / Port C]: C̅S̅=0, W̅R̅=0 → Latched 0x${dataToWrite.toString(16).toUpperCase().padStart(2, '0')}`,
          details: detailsText,
        });
      } else {
        setBusCycleLog({
          type: 'warning',
          title: `⚠️ Write Ignored: Entire Port C is configured as INPUT`,
          details: `Both Upper (D3=1) and Lower (D0=1) Port C are inputs. CPU write has no destination output latch.`,
        });
      }
    } else {
      // Control Register (83H)
      applyControlWordByte(dataToWrite);
      setBusCycleLog({
        type: 'write',
        title: `⚙️ [OUT 83H, AL / Control Register]: C̅S̅=0, W̅R̅=0 → Written 0x${dataToWrite.toString(16).toUpperCase().padStart(2, '0')}`,
        details: (dataToWrite & 0x80) !== 0
          ? `I/O Mode Set Control Word written (D7=1). Group A & B operating modes and port I/O directions updated!`
          : `BSR Control Word written (D7=0). Port C bit ${(dataToWrite >> 1) & 7} ${dataToWrite & 1 ? 'SET to 1' : 'RESET to 0'}.`,
      });
    }
  };

  const executeReset = () => {
    setSigCS(0);
    setSigRD(1);
    setSigWR(1);
    applyControlWordByte(0x9B); // Standard 8255 reset state: All ports Input, Mode 0
    setPortAOutputLatch(0x00);
    setPortBOutputLatch(0x00);
    setPortCOutputLatch(0x00);
    setBusCycleLog({
      type: 'reset',
      title: '🔄 [RESET PULSE] Intel 8255 Hardware Reset Asserted',
      details: 'Pin 35 pulsed HIGH. Control word initialized to 9BH (All ports Input, Mode 0). All output latches cleared to 00H.',
    });
  };

  // 40-Pin DIP Pinout Definition for Intel 8255 PPI
  const pinData: Record<number, { name: string; type: 'Port A' | 'Port B' | 'Port C' | 'Control & Bus' | 'Power'; desc: string; details: string }> = {
    1: { name: 'PA3', type: 'Port A', desc: 'Port A Bit 3 bidirectional I/O line.', details: 'Group A 8-bit port pin. Programmable as Input, Output, or bidirectional bus (Mode 2).' },
    2: { name: 'PA2', type: 'Port A', desc: 'Port A Bit 2 bidirectional I/O line.', details: 'Group A 8-bit port pin. Can drive standard TTL loads (sink 1.6mA - 2.5mA).' },
    3: { name: 'PA1', type: 'Port A', desc: 'Port A Bit 1 bidirectional I/O line.', details: 'Group A 8-bit port pin.' },
    4: { name: 'PA0', type: 'Port A', desc: 'Port A Bit 0 (LSB) bidirectional I/O line.', details: 'Group A port LSB. Mode 0 basic I/O, Mode 1 strobed, or Mode 2 bi-directional.' },
    5: { name: 'R̅D̅', type: 'Control & Bus', desc: 'Read Strobe (Active LOW input).', details: 'CPU asserts R̅D̅ LOW to read data from the selected 8255 port or control register onto D0–D7.' },
    6: { name: 'C̅S̅', type: 'Control & Bus', desc: 'Chip Select (Active LOW input).', details: 'A LOW on C̅S̅ enables 8255 communication with CPU. High disables bus buffers (high-impedance).' },
    7: { name: 'GND', type: 'Power', desc: 'System Ground reference (0V).', details: 'Connects to common DC ground rail (0V).' },
    8: { name: 'A1', type: 'Control & Bus', desc: 'Internal Port Address Line 1.', details: 'Used with A0 to select Port A (00), Port B (01), Port C (10), or Control Register (11).' },
    9: { name: 'A0', type: 'Control & Bus', desc: 'Internal Port Address Line 0.', details: 'Connects to latched address line A0 or A1 from CPU.' },
    10: { name: 'PC7', type: 'Port C', desc: 'Port C Upper Bit 7 / O̅B̅F̅_A / Handshake.', details: 'Group A handshake line or general-purpose 4-bit upper I/O line with individual BSR capability.' },
    11: { name: 'PC6', type: 'Port C', desc: 'Port C Upper Bit 6 / A̅C̅K̅_A / Handshake.', details: 'Group A handshake line in Mode 1/2 or general I/O.' },
    12: { name: 'PC5', type: 'Port C', desc: 'Port C Upper Bit 5 / IBF_A / Handshake.', details: 'Input Buffer Full signal for Port A in Mode 1/2.' },
    13: { name: 'PC4', type: 'Port C', desc: 'Port C Upper Bit 4 / S̅T̅B̅_A / Handshake.', details: 'Strobe input for Port A in Mode 1.' },
    14: { name: 'PC0', type: 'Port C', desc: 'Port C Lower Bit 0 / Handshake.', details: 'Group B 4-bit lower I/O line or interrupt request line.' },
    15: { name: 'PC1', type: 'Port C', desc: 'Port C Lower Bit 1 / Handshake.', details: 'Group B handshake line or general I/O line.' },
    16: { name: 'PC2', type: 'Port C', desc: 'Port C Lower Bit 2 / Handshake.', details: 'Group B handshake line or general I/O line.' },
    17: { name: 'PC3', type: 'Port C', desc: 'Port C Lower Bit 3 / INTR_A / Handshake.', details: 'Interrupt Request line for Group A or general I/O line.' },
    18: { name: 'PB0', type: 'Port B', desc: 'Port B Bit 0 (LSB) bidirectional I/O line.', details: 'Group B 8-bit port pin. Operates in Mode 0 (Basic I/O) or Mode 1 (Strobed I/O).' },
    19: { name: 'PB1', type: 'Port B', desc: 'Port B Bit 1 bidirectional I/O line.', details: 'Group B 8-bit port pin.' },
    20: { name: 'PB2', type: 'Port B', desc: 'Port B Bit 2 bidirectional I/O line.', details: 'Group B 8-bit port pin.' },
    21: { name: 'PB3', type: 'Port B', desc: 'Port B Bit 3 bidirectional I/O line.', details: 'Group B 8-bit port pin.' },
    22: { name: 'PB4', type: 'Port B', desc: 'Port B Bit 4 bidirectional I/O line.', details: 'Group B 8-bit port pin.' },
    23: { name: 'PB5', type: 'Port B', desc: 'Port B Bit 5 bidirectional I/O line.', details: 'Group B 8-bit port pin.' },
    24: { name: 'PB6', type: 'Port B', desc: 'Port B Bit 6 bidirectional I/O line.', details: 'Group B 8-bit port pin.' },
    25: { name: 'PB7', type: 'Port B', desc: 'Port B Bit 7 (MSB) bidirectional I/O line.', details: 'Group B 8-bit port MSB.' },
    26: { name: 'VCC', type: 'Power', desc: 'Primary Power Supply (+5V DC).', details: 'Standard +5V ±10% regulated DC power rail.' },
    27: { name: 'D7', type: 'Control & Bus', desc: 'Bidirectional Data Bus Bit 7 (MSB).', details: 'Connects to CPU data bus D7. Transfers data & control words.' },
    28: { name: 'D6', type: 'Control & Bus', desc: 'Bidirectional Data Bus Bit 6.', details: 'Connects to CPU data bus D6.' },
    29: { name: 'D5', type: 'Control & Bus', desc: 'Bidirectional Data Bus Bit 5.', details: 'Connects to CPU data bus D5.' },
    30: { name: 'D4', type: 'Control & Bus', desc: 'Bidirectional Data Bus Bit 4.', details: 'Connects to CPU data bus D4.' },
    31: { name: 'D3', type: 'Control & Bus', desc: 'Bidirectional Data Bus Bit 3.', details: 'Connects to CPU data bus D3.' },
    32: { name: 'D2', type: 'Control & Bus', desc: 'Bidirectional Data Bus Bit 2.', details: 'Connects to CPU data bus D2.' },
    33: { name: 'D1', type: 'Control & Bus', desc: 'Bidirectional Data Bus Bit 1.', details: 'Connects to CPU data bus D1.' },
    34: { name: 'D0', type: 'Control & Bus', desc: 'Bidirectional Data Bus Bit 0 (LSB).', details: 'Connects to CPU data bus D0.' },
    35: { name: 'RESET', type: 'Control & Bus', desc: 'Reset Input (Active HIGH).', details: 'A HIGH on RESET clears the internal control register and sets all 24 I/O ports (A, B, C) to Input Mode.' },
    36: { name: 'W̅R̅', type: 'Control & Bus', desc: 'Write Strobe (Active LOW input).', details: 'CPU asserts W̅R̅ LOW to write data or control words from CPU into 8255 ports/registers.' },
    37: { name: 'PA7', type: 'Port A', desc: 'Port A Bit 7 (MSB) bidirectional I/O line.', details: 'Group A 8-bit port MSB.' },
    38: { name: 'PA6', type: 'Port A', desc: 'Port A Bit 6 bidirectional I/O line.', details: 'Group A 8-bit port pin.' },
    39: { name: 'PA5', type: 'Port A', desc: 'Port A Bit 5 bidirectional I/O line.', details: 'Group A 8-bit port pin.' },
    40: { name: 'PA4', type: 'Port A', desc: 'Port A Bit 4 bidirectional I/O line.', details: 'Group A 8-bit port pin.' },
  };

  const getPinColor = (pinNum: number) => {
    const pin = pinData[pinNum];
    if (!pin) return 'bg-slate-100 text-slate-700 border-slate-300';
    if (selectedPin === pinNum) return 'bg-amber-400 text-amber-950 border-amber-600 font-extrabold ring-2 ring-amber-400';
    
    const matchesFilter = activeGroupFilter === 'all' || pin.type === activeGroupFilter;
    const filterClasses = matchesFilter
      ? 'opacity-100'
      : 'opacity-30 grayscale hover:opacity-100 hover:grayscale-0';

    switch (pin.type) {
      case 'Port A': return `bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 ${filterClasses} ${matchesFilter && activeGroupFilter !== 'all' ? 'ring-2 ring-emerald-400 font-bold' : ''}`;
      case 'Port B': return `bg-indigo-50 text-indigo-800 border-indigo-300 hover:bg-indigo-100 ${filterClasses} ${matchesFilter && activeGroupFilter !== 'all' ? 'ring-2 ring-indigo-400 font-bold' : ''}`;
      case 'Port C': return `bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 ${filterClasses} ${matchesFilter && activeGroupFilter !== 'all' ? 'ring-2 ring-amber-400 font-bold' : ''}`;
      case 'Control & Bus': return `bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100 ${filterClasses} ${matchesFilter && activeGroupFilter !== 'all' ? 'ring-2 ring-blue-400 font-bold' : ''}`;
      case 'Power': return `bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100 ${filterClasses} ${matchesFilter && activeGroupFilter !== 'all' ? 'ring-2 ring-rose-400 font-bold' : ''}`;
      default: return `bg-slate-50 text-slate-700 border-slate-300 ${filterClasses}`;
    }
  };

  const tabLabels: Record<PPI8255Tab, { label: string; title: string; subtitle: string }> = {
    diagram: {
      label: 'Architecture',
      title: 'Intel 8255 Internal Architecture Block Diagram',
      subtitle: '8-Bit Data Bus Buffer • Read/Write Control Logic • Group A & B Controllers • Ports A, B & C'
    },
    pins: {
      label: '40-Pin DIP IC Diagram',
      title: 'Intel 8255 PPI 40-Pin DIP Pinout & Architecture',
      subtitle: 'Complete 40-Pin Package Layout • Ports A, B, C (24 I/O Pins) • Bus Control & Power Rails'
    },
    architecture: {
      label: 'Functional Blocks',
      title: 'Intel 8255 PPI Internal Block Architecture',
      subtitle: 'Group A & Group B Control Units • 8-Bit Internal Data Bus Buffer • Read/Write Control Logic'
    },
    modes: {
      label: 'Modes of Operation ⚙️',
      title: 'Intel 8255 PPI Modes of Operation & Architecture',
      subtitle: 'BSR Mode (D7=0) • Mode 0 (Basic I/O) • Mode 1 (Strobed Handshake) • Mode 2 (Bi-directional Bus)'
    },
    iomode: {
      label: 'I/O Control Word (Mode 0/1/2)',
      title: '8255 Mode Set Control Word Generator (D7 = 1)',
      subtitle: 'Mode 0 (Basic I/O), Mode 1 (Strobed Handshake), Mode 2 (Bi-directional Bus)'
    },
    bsr: {
      label: 'BSR Mode (Bit Set/Reset)',
      title: 'Port C Bit Set / Reset (BSR) Mode Architecture (D7 = 0)',
      subtitle: 'Individual Bit Manipulation on PC0–PC7 without altering other port pins'
    },
    registers: {
      label: 'Port Registers Monitor',
      title: 'Live 8255 Port Register State & Logic Probe',
      subtitle: 'Real-time bit toggling and logic level monitoring for Port A, Port B, and Port C'
    }
  };

  const displayedTabs = allowedTabs && allowedTabs.length > 0
    ? allowedTabs
    : (['diagram', 'pins', 'architecture', 'iomode', 'bsr'] as PPI8255Tab[]);

  const currentTabInfo = tabLabels[activeTab] || tabLabels.pins;

  const tabSwitcherElement = displayedTabs.length > 1 ? (
    <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 shadow-inner">
      {displayedTabs.map((tabKey) => {
        const isSelected = activeTab === tabKey;
        return (
          <button
            key={tabKey}
            onClick={() => setActiveTab(tabKey)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer text-[11px] ${
              isSelected
                ? 'bg-white text-indigo-700 shadow-xs font-bold border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tabLabels[tabKey].label}
          </button>
        );
      })}
    </div>
  ) : null;

  return (
    <div className="bg-white text-slate-800 p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs font-sans">
      {/* Fallback header for other tabs */}
      {displayedTabs.length > 1 && activeTab !== 'diagram' && activeTab !== 'pins' && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-slate-100 rounded-xl border border-slate-200 text-slate-700">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {currentTabInfo.title || currentTabInfo.label}
              </h3>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {tabSwitcherElement}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: 40-PIN DIP PIN DIAGRAM                                             */}
      {/* ========================================================================= */}
      {activeTab === 'pins' && (
        <div className="space-y-4">
          {/* Header bar with title and buttons inside division */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-200 text-indigo-700 shadow-2xs">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  {pinsVariant === 'features-only' 
                    ? 'Intel 8255 PPI 40-Pin DIP Pin Diagram & Salient Features'
                    : pinsVariant === 'inspector'
                    ? 'Intel 8255 PPI 40-Pin DIP Pin Functions & Address Decoding'
                    : 'Intel 8255 PPI 40-Pin DIP Pin Diagram & Architecture'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {pinsVariant === 'features-only'
                    ? '40-Pin Dual In-Line Package (DIP) • Ports A, B, C (24 I/O Pins) • Architectural Specifications'
                    : pinsVariant === 'inspector'
                    ? 'Interactive Pin-by-Pin Inspector • Internal Address Decoding Table (A1, A0, R̅D̅, W̅R̅)'
                    : 'Complete 40-Pin Package Layout • Ports A, B, C (24 I/O Pins) • Bus Control & Architectural Features'}
                </p>
              </div>
            </div>

            {/* Buttons inside division */}
            <div className="flex flex-wrap items-center gap-2">
              {tabSwitcherElement}
              <div className="flex flex-wrap items-center gap-1 text-[10px]">
                <button
                  onClick={() => setActiveGroupFilter('all')}
                  className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    activeGroupFilter === 'all'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  All Pins
                </button>
                <button
                  onClick={() => setActiveGroupFilter(activeGroupFilter === 'Port A' ? 'all' : 'Port A')}
                  className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    activeGroupFilter === 'Port A'
                      ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-300'
                      : 'bg-emerald-50 text-emerald-900 border border-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  Port A (PA0–PA7)
                </button>
                <button
                  onClick={() => setActiveGroupFilter(activeGroupFilter === 'Port B' ? 'all' : 'Port B')}
                  className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    activeGroupFilter === 'Port B'
                      ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-300'
                      : 'bg-indigo-50 text-indigo-900 border border-indigo-300 hover:bg-indigo-100'
                  }`}
                >
                  Port B (PB0–PB7)
                </button>
                <button
                  onClick={() => setActiveGroupFilter(activeGroupFilter === 'Port C' ? 'all' : 'Port C')}
                  className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    activeGroupFilter === 'Port C'
                      ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-300'
                      : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
                  }`}
                >
                  Port C (PC0–PC7)
                </button>
                <button
                  onClick={() => setActiveGroupFilter(activeGroupFilter === 'Control & Bus' ? 'all' : 'Control & Bus')}
                  className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    activeGroupFilter === 'Control & Bus'
                      ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-300'
                      : 'bg-blue-50 text-blue-900 border border-blue-300 hover:bg-blue-100'
                  }`}
                >
                  Bus &amp; Control
                </button>
                <button
                  onClick={() => setActiveGroupFilter(activeGroupFilter === 'Power' ? 'all' : 'Power')}
                  className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    activeGroupFilter === 'Power'
                      ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-300'
                      : 'bg-rose-50 text-rose-900 border border-rose-300 hover:bg-rose-100'
                  }`}
                >
                  Power (VCC, GND)
                </button>
              </div>
            </div>
          </div>

          {/* Interactive 40-Pin DIP Package Visualizer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* DIP IC Canvas */}
            <div className="lg:col-span-7 bg-slate-100 p-5 rounded-2xl border-2 border-slate-300 shadow-sm flex flex-col items-center relative overflow-hidden">
              {/* Notch at Top of IC */}
              <div className="w-10 h-4 bg-slate-200 rounded-b-full border-b border-x border-slate-400 mb-3 shadow-inner flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 block" />
              </div>

              <div className="text-center mb-4">
                <span className="text-indigo-900 font-mono text-xs tracking-widest font-extrabold uppercase">
                  INTEL 8255A / 8255A-5 PPI
                </span>
                <p className="text-[10px] text-slate-500 font-mono">40-PIN DUAL IN-LINE PACKAGE (DIP)</p>
              </div>

              {/* Pins Container: Left (1-20) vs Right (40-21) */}
              <div className="w-full max-w-md grid grid-cols-2 gap-4">
                {/* Left Side: Pins 1 to 20 */}
                <div className="space-y-1">
                  {Array.from({ length: 20 }, (_, i) => {
                    const pinNum = i + 1;
                    const pin = pinData[pinNum];
                    return (
                      <button
                        key={pinNum}
                        onClick={() => setSelectedPin(pinNum)}
                        className={`w-full flex items-center justify-between px-2 py-1 rounded-md border text-[10.5px] font-mono cursor-pointer transition-all duration-150 ${getPinColor(
                          pinNum
                        )}`}
                      >
                        <span className="font-bold text-[9px] text-slate-500 opacity-80">{pinNum}</span>
                        <span className="font-bold">{pin.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Right Side: Pins 40 down to 21 */}
                <div className="space-y-1">
                  {Array.from({ length: 20 }, (_, i) => {
                    const pinNum = 40 - i;
                    const pin = pinData[pinNum];
                    return (
                      <button
                        key={pinNum}
                        onClick={() => setSelectedPin(pinNum)}
                        className={`w-full flex items-center justify-between px-2 py-1 rounded-md border text-[10.5px] font-mono cursor-pointer transition-all duration-150 ${getPinColor(
                          pinNum
                        )}`}
                      >
                        <span className="font-bold">{pin.name}</span>
                        <span className="font-bold text-[9px] text-slate-500 opacity-80">{pinNum}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="text-[10px] text-slate-600 font-mono mt-4 text-center font-medium">
                Click any pin to inspect its signal description, electrical characteristics, and microprocessor bus interfacing.
              </div>
            </div>

            {/* Right Column: Displayed according to pinsVariant */}
            <div className="lg:col-span-5 space-y-3">
              {/* Variant 1: Salient Features of Intel 8255 PPI (Only on features-only / Slide 1) */}
              {(pinsVariant === 'features-only' || pinsVariant === 'all') && (
                <div className="bg-gradient-to-br from-indigo-50/70 to-white p-4 rounded-xl border border-indigo-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                    <span className="font-bold text-xs text-indigo-950 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      Salient Features of Intel 8255 PPI
                    </span>
                    <span className="text-[9.5px] font-mono text-indigo-700 font-bold bg-indigo-100 px-2 py-0.5 rounded-full">
                      40-Pin DIP • +5V DC
                    </span>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                      <strong className="text-indigo-900 block font-bold text-[11px] mb-0.5">24 Programmable I/O Pins</strong>
                      <p className="text-slate-600 text-[10.5px] leading-relaxed">
                        Organized into three independent 8-bit ports: <strong>Port A (PA0–PA7)</strong>, <strong>Port B (PB0–PB7)</strong>, and <strong>Port C (PC0–PC7)</strong>.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                      <strong className="text-indigo-900 block font-bold text-[11px] mb-0.5">Two 4-bit Port C Sub-Ports</strong>
                      <p className="text-slate-600 text-[10.5px] leading-relaxed">
                        Port C is split into <strong>Port C Upper (PC7–PC4)</strong> and <strong>Port C Lower (PC3–PC0)</strong>. Each nibble can be configured independently for simple I/O or handshake signals.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                      <strong className="text-indigo-900 block font-bold text-[11px] mb-0.5">3 I/O Operating Modes</strong>
                      <p className="text-slate-600 text-[10.5px] leading-relaxed">
                        • <strong>Mode 0 (Basic I/O):</strong> Simple input/output without handshake strobes.<br />
                        • <strong>Mode 1 (Strobed I/O):</strong> Handshaking using Port C lines to synchronize data.<br />
                        • <strong>Mode 2 (Bi-directional Bus):</strong> 8-bit bidirectional data bus on Port A with 5 handshake lines.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                      <strong className="text-indigo-900 block font-bold text-[11px] mb-0.5">Bit Set / Reset (BSR) Mode</strong>
                      <p className="text-slate-600 text-[10.5px] leading-relaxed">
                        Activated when control word bit D7 = 0. Allows setting (1) or resetting (0) of any single bit of Port C without affecting other Port C bits.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                      <strong className="text-indigo-900 block font-bold text-[11px] mb-0.5">8085 / 8086 Microprocessor Bus Compatibility</strong>
                      <p className="text-slate-600 text-[10.5px] leading-relaxed">
                        Direct connection to 8-bit bidirectional data bus (D0–D7), address selection (A0, A1), Chip Select (<span style={{ textDecoration: 'overline' }}>CS</span>), Read (<span style={{ textDecoration: 'overline' }}>RD</span>), Write (<span style={{ textDecoration: 'overline' }}>WR</span>), and RESET.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                      <strong className="text-indigo-900 block font-bold text-[11px] mb-0.5">Darlington Drive Capability</strong>
                      <p className="text-slate-600 text-[10.5px] leading-relaxed">
                        Any pin on Port C can drive Darlington transistor pairs (sinking up to 1.5 mA at 1.5V) for interfacing directly with relays, solenoids, and displays.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Variant 2: Pin Inspector Card & Address Decoding Table (On inspector / Slide 2) */}
              {(pinsVariant === 'inspector' || pinsVariant === 'all') && (
                <>
                  {/* Selected Pin Detail Card */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-mono font-extrabold flex items-center justify-center text-xs">
                          {selectedPin ? selectedPin : 'i'}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">
                            {selectedPin ? `Pin ${selectedPin}: ${pinData[selectedPin].name}` : 'Pin Inspector'}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {selectedPin ? pinData[selectedPin].type : 'Click a pin on the left to inspect'}
                          </span>
                        </div>
                      </div>
                      {selectedPin && (
                        <span className="px-2 py-0.5 rounded text-[9.5px] font-bold uppercase font-mono bg-indigo-100 text-indigo-800">
                          {pinData[selectedPin].type}
                        </span>
                      )}
                    </div>

                    {selectedPin ? (
                      <div className="space-y-2 text-[11px]">
                        <div className="p-2 bg-white rounded-lg border border-slate-200">
                          <strong className="text-slate-800 block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                            Signal Description:
                          </strong>
                          <p className="text-slate-700 leading-relaxed font-sans">{pinData[selectedPin].desc}</p>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-slate-200">
                          <strong className="text-slate-800 block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                            Architectural Function:
                          </strong>
                          <p className="text-slate-600 leading-relaxed font-sans">{pinData[selectedPin].details}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-slate-500 text-[11px] bg-white rounded-lg border border-slate-200">
                        <Info className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                        Select any of the 40 pins on the DIP package diagram to see its bus timing role, electrical direction, and internal group assignment.
                      </div>
                    )}
                  </div>

                  {/* 8255 Internal Address Decoding Summary (A1, A0, CS, RD, WR) */}
                  <div className="bg-indigo-50 text-slate-900 p-3.5 rounded-xl border border-indigo-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between border-b border-indigo-200 pb-1.5">
                      <span className="font-bold text-[11px] text-indigo-950 flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                        8255 Internal Address Decoding Table
                      </span>
                      <span className="text-[9px] font-mono text-indigo-700 font-bold"><span style={{ textDecoration: 'overline' }}>CS</span> = 0 (Active)</span>
                    </div>
                    <div className="overflow-x-auto text-[10px] font-mono">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-indigo-200 text-indigo-900">
                            <th className="py-1 px-1">A1</th>
                            <th className="py-1 px-1">A0</th>
                            <th className="py-1 px-1"><span style={{ textDecoration: 'overline' }}>RD</span></th>
                            <th className="py-1 px-1"><span style={{ textDecoration: 'overline' }}>WR</span></th>
                            <th className="py-1 px-1 text-right">Selected Port / Operation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-indigo-100 text-slate-800">
                          <tr>
                            <td className="py-1 px-1 text-emerald-700 font-bold">0</td>
                            <td className="py-1 px-1 text-emerald-700 font-bold">0</td>
                            <td className="py-1 px-1">0</td>
                            <td className="py-1 px-1">1</td>
                            <td className="py-1 px-1 text-right text-emerald-800 font-sans font-medium">Read Port A → Data Bus</td>
                          </tr>
                          <tr>
                            <td className="py-1 px-1 text-emerald-700 font-bold">0</td>
                            <td className="py-1 px-1 text-emerald-700 font-bold">0</td>
                            <td className="py-1 px-1">1</td>
                            <td className="py-1 px-1">0</td>
                            <td className="py-1 px-1 text-right text-emerald-800 font-sans font-medium">Write Data Bus → Port A</td>
                          </tr>
                          <tr>
                            <td className="py-1 px-1 text-indigo-700 font-bold">0</td>
                            <td className="py-1 px-1 text-indigo-700 font-bold">1</td>
                            <td className="py-1 px-1">0/1</td>
                            <td className="py-1 px-1">1/0</td>
                            <td className="py-1 px-1 text-right text-indigo-800 font-sans font-medium">Read / Write Port B</td>
                          </tr>
                          <tr>
                            <td className="py-1 px-1 text-amber-700 font-bold">1</td>
                            <td className="py-1 px-1 text-amber-700 font-bold">0</td>
                            <td className="py-1 px-1">0/1</td>
                            <td className="py-1 px-1">1/0</td>
                            <td className="py-1 px-1 text-right text-amber-800 font-sans font-medium">Read / Write Port C</td>
                          </tr>
                          <tr className="bg-indigo-100/70">
                            <td className="py-1 px-1 text-purple-700 font-bold">1</td>
                            <td className="py-1 px-1 text-purple-700 font-bold">1</td>
                            <td className="py-1 px-1">1</td>
                            <td className="py-1 px-1">0</td>
                            <td className="py-1 px-1 text-right text-purple-900 font-sans font-bold">Write Control Register</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BLOCK ARCHITECTURE                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'architecture' && (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-inner space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-xs text-indigo-950 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Intel 8255 Internal Functional Architecture Block Diagram
              </span>
              <span className="text-[10px] font-mono text-slate-500">24 Programmable Pins • 2 Group Controllers</span>
            </div>

            {/* Architecture Blocks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
              {/* Left Column: CPU Bus Interface */}
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                    <strong className="text-blue-900 font-mono text-xs">Data Bus Buffer</strong>
                    <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-bold">8-Bit Bi-Dir</span>
                  </div>
                  <p className="text-slate-600 text-[10px]">
                    Tri-state 8-bit bidirectional buffer interfacing 8255 internal bus with system data bus (<strong>D0–D7</strong>). Transmits data, control words, and status information.
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                    <strong className="text-blue-900 font-mono text-xs">Read/Write Control Logic</strong>
                    <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-bold">Control</span>
                  </div>
                  <p className="text-slate-600 text-[10px]">
                    Decodes <strong><span style={{ textDecoration: 'overline' }}>RD</span></strong>, <strong><span style={{ textDecoration: 'overline' }}>WR</span></strong>, <strong><span style={{ textDecoration: 'overline' }}>CS</span></strong>, <strong>A0</strong>, <strong>A1</strong>, and <strong>RESET</strong> signals to direct internal data flow to the appropriate port registers.
                  </p>
                </div>
              </div>

              {/* Middle Column: Group A Controller & Ports */}
              <div className="space-y-3">
                <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-1">
                    <strong className="text-emerald-900 font-mono text-xs">Group A Control</strong>
                    <span className="text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">Mode 0,1,2</span>
                  </div>
                  <div className="space-y-1.5 text-[10px]">
                    <div className="bg-white p-2 rounded-lg border border-emerald-200">
                      <strong className="text-emerald-900 block font-mono">Port A (PA0–PA7):</strong>
                      <span className="text-slate-600">8-bit data output latch/buffer and 8-bit data input latch. Supports Modes 0, 1, and 2.</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-emerald-200">
                      <strong className="text-emerald-900 block font-mono">Port C Upper (PC4–PC7):</strong>
                      <span className="text-slate-600">4-bit I/O port or handshake control lines for Port A. Individual bit set/reset via BSR.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Group B Controller & Ports */}
              <div className="space-y-3">
                <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between border-b border-indigo-200 pb-1">
                    <strong className="text-indigo-900 font-mono text-xs">Group B Control</strong>
                    <span className="text-[9px] px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded font-bold">Mode 0,1</span>
                  </div>
                  <div className="space-y-1.5 text-[10px]">
                    <div className="bg-white p-2 rounded-lg border border-indigo-200">
                      <strong className="text-indigo-900 block font-mono">Port B (PB0–PB7):</strong>
                      <span className="text-slate-600">8-bit data I/O latch/buffer. Supports Mode 0 (Basic I/O) and Mode 1 (Strobed Handshake).</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-indigo-200">
                      <strong className="text-indigo-900 block font-mono">Port C Lower (PC0–PC3):</strong>
                      <span className="text-slate-600">4-bit I/O port or handshake control lines for Port B. Individual bit set/reset via BSR.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: I/O MODE CONFIGURATOR                                              */}
      {/* ========================================================================= */}
      {activeTab === 'iomode' && (
        <div className="space-y-4">
          {/* Sub-Navigation Bar for I/O Modes */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-1.5 px-1 text-[11px] font-bold text-slate-700">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Select Mode View:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {[
                { id: 'generator', label: 'I/O Control Word Byte & Simulator' },
                { id: 'mode0', label: 'Mode 0 (Basic I/O)' },
                { id: 'mode1', label: 'Mode 1 (Handshake)' },
                { id: 'mode2', label: 'Mode 2 (Bi-directional)' },
                { id: 'table', label: 'Comparison Matrix' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setIoSubTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    ioSubTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {ioSubTab === 'generator' && (
            <div className="space-y-4">
              {/* Control Word Byte Bit Breakdown - Positioned at Top */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                    Calculated I/O Control Word Byte Register
                  </span>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-200 inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                    Click bits to toggle
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-extrabold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200 shadow-xs">
                  {controlWordHex}
                </span>
                <span className="text-[11px] font-mono text-slate-500 font-semibold">
                  ({controlWordByte.toString(2).padStart(8, '0')}b)
                </span>
              </div>
            </div>

            {/* Interactive 8-Bit Register Bar */}
            <div className="grid grid-cols-8 gap-1.5 font-mono text-center">
              {/* D7 */}
              <button
                type="button"
                onClick={() => handleToggleIoBit(7)}
                title="D7: Mode Set Flag (1 = I/O Mode, 0 = BSR Mode). Click to toggle to BSR Mode (D7=0)."
                className="group p-2 rounded-lg border cursor-pointer transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 bg-indigo-600 text-white border-indigo-700 shadow-xs hover:ring-2 hover:ring-indigo-300"
              >
                <div className="font-bold text-[10px] text-indigo-200">D7</div>
                <div className="font-black text-sm my-0.5">1</div>
                <div className="text-[9px] font-sans font-semibold text-indigo-100 truncate">I/O Set</div>
                <div className="text-[8px] font-sans text-indigo-200 opacity-0 group-hover:opacity-100 transition-opacity">Flip</div>
              </button>

              {/* D6 */}
              <button
                type="button"
                onClick={() => handleToggleIoBit(6)}
                title={`D6: Group A Mode Select MSB. Current bit: ${((d6d5 >> 1) & 1)}. Click to toggle.`}
                className={`group p-2 rounded-lg border cursor-pointer transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 hover:ring-2 hover:ring-indigo-300 ${
                  ((d6d5 >> 1) & 1) === 1
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className={`font-bold text-[10px] ${((d6d5 >> 1) & 1) === 1 ? 'text-indigo-200' : 'text-slate-500'}`}>D6</div>
                <div className="font-black text-sm my-0.5">{((d6d5 >> 1) & 1)}</div>
                <div className="text-[9px] font-sans font-semibold truncate">Grp A Mode</div>
                <div className={`text-[8px] font-sans opacity-0 group-hover:opacity-100 transition-opacity ${((d6d5 >> 1) & 1) === 1 ? 'text-indigo-200' : 'text-slate-400'}`}>Flip</div>
              </button>

              {/* D5 */}
              <button
                type="button"
                onClick={() => handleToggleIoBit(5)}
                title={`D5: Group A Mode Select LSB. Current bit: ${(d6d5 & 1)}. Click to toggle.`}
                className={`group p-2 rounded-lg border cursor-pointer transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 hover:ring-2 hover:ring-indigo-300 ${
                  (d6d5 & 1) === 1
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className={`font-bold text-[10px] ${(d6d5 & 1) === 1 ? 'text-indigo-200' : 'text-slate-500'}`}>D5</div>
                <div className="font-black text-sm my-0.5">{(d6d5 & 1)}</div>
                <div className="text-[9px] font-sans font-semibold truncate">Grp A Mode</div>
                <div className={`text-[8px] font-sans opacity-0 group-hover:opacity-100 transition-opacity ${(d6d5 & 1) === 1 ? 'text-indigo-200' : 'text-slate-400'}`}>Flip</div>
              </button>

              {/* D4 */}
              <button
                type="button"
                onClick={() => handleToggleIoBit(4)}
                title={`D4: Port A Direction (${d4 === 1 ? 'Input 1' : 'Output 0'}). Click to toggle to ${d4 === 1 ? 'Output (0)' : 'Input (1)'}.`}
                className={`group p-2 rounded-lg border cursor-pointer transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 hover:ring-2 hover:ring-indigo-300 ${
                  d4 === 1
                    ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                    : 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                }`}
              >
                <div className="font-bold text-[10px] text-white/80">D4</div>
                <div className="font-black text-sm my-0.5">{d4}</div>
                <div className="text-[9px] font-sans font-semibold truncate">{d4 === 1 ? 'PA In' : 'PA Out'}</div>
                <div className="text-[8px] font-sans text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">Flip</div>
              </button>

              {/* D3 */}
              <button
                type="button"
                onClick={() => handleToggleIoBit(3)}
                title={`D3: Port C Upper Direction (${d3 === 1 ? 'Input 1' : 'Output 0'}). Click to toggle to ${d3 === 1 ? 'Output (0)' : 'Input (1)'}.`}
                className={`group p-2 rounded-lg border cursor-pointer transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 hover:ring-2 hover:ring-indigo-300 ${
                  d3 === 1
                    ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                    : 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                }`}
              >
                <div className="font-bold text-[10px] text-white/80">D3</div>
                <div className="font-black text-sm my-0.5">{d3}</div>
                <div className="text-[9px] font-sans font-semibold truncate">{d3 === 1 ? 'PC Up In' : 'PC Up Out'}</div>
                <div className="text-[8px] font-sans text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">Flip</div>
              </button>

              {/* D2 */}
              <button
                type="button"
                onClick={() => handleToggleIoBit(2)}
                title={`D2: Group B Mode (${d2 === 1 ? 'Mode 1 Strobe' : 'Mode 0 Basic'}). Click to toggle.`}
                className={`group p-2 rounded-lg border cursor-pointer transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 hover:ring-2 hover:ring-indigo-300 ${
                  d2 === 1
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className={`font-bold text-[10px] ${d2 === 1 ? 'text-indigo-200' : 'text-slate-500'}`}>D2</div>
                <div className="font-black text-sm my-0.5">{d2}</div>
                <div className="text-[9px] font-sans font-semibold truncate">{d2 === 1 ? 'Grp B M1' : 'Grp B M0'}</div>
                <div className={`text-[8px] font-sans opacity-0 group-hover:opacity-100 transition-opacity ${d2 === 1 ? 'text-indigo-200' : 'text-slate-400'}`}>Flip</div>
              </button>

              {/* D1 */}
              <button
                type="button"
                onClick={() => handleToggleIoBit(1)}
                title={`D1: Port B Direction (${d1 === 1 ? 'Input 1' : 'Output 0'}). Click to toggle to ${d1 === 1 ? 'Output (0)' : 'Input (1)'}.`}
                className={`group p-2 rounded-lg border cursor-pointer transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 hover:ring-2 hover:ring-indigo-300 ${
                  d1 === 1
                    ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                    : 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                }`}
              >
                <div className="font-bold text-[10px] text-white/80">D1</div>
                <div className="font-black text-sm my-0.5">{d1}</div>
                <div className="text-[9px] font-sans font-semibold truncate">{d1 === 1 ? 'PB In' : 'PB Out'}</div>
                <div className="text-[8px] font-sans text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">Flip</div>
              </button>

              {/* D0 */}
              <button
                type="button"
                onClick={() => handleToggleIoBit(0)}
                title={`D0: Port C Lower Direction (${d0 === 1 ? 'Input 1' : 'Output 0'}). Click to toggle to ${d0 === 1 ? 'Output (0)' : 'Input (1)'}.`}
                className={`group p-2 rounded-lg border cursor-pointer transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 hover:ring-2 hover:ring-indigo-300 ${
                  d0 === 1
                    ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                    : 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                }`}
              >
                <div className="font-bold text-[10px] text-white/80">D0</div>
                <div className="font-black text-sm my-0.5">{d0}</div>
                <div className="text-[9px] font-sans font-semibold truncate">{d0 === 1 ? 'PC Low In' : 'PC Low Out'}</div>
                <div className="text-[8px] font-sans text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">Flip</div>
              </button>
            </div>
          </div>

          {/* Group A and Group B Configurations - Positioned Below */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* GROUP A CONTROLS */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="font-bold text-xs text-indigo-900 uppercase">Group A Configuration</span>
                <span className="text-[10px] font-mono text-indigo-600 font-bold">Port A + Port C Upper</span>
              </div>

              {/* Mode selection for Group A */}
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Group A Operating Mode (D6, D5)</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setGroupAMode('mode0')}
                    className={`py-1 px-2 rounded-lg font-bold border cursor-pointer transition-all ${
                      groupAMode === 'mode0' ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Mode 0 (Basic)
                  </button>
                  <button
                    onClick={() => setGroupAMode('mode1')}
                    className={`py-1 px-2 rounded-lg font-bold border cursor-pointer transition-all ${
                      groupAMode === 'mode1' ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Mode 1 (Strobe)
                  </button>
                  <button
                    onClick={() => setGroupAMode('mode2')}
                    className={`py-1 px-2 rounded-lg font-bold border cursor-pointer transition-all ${
                      groupAMode === 'mode2' ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Mode 2 (Bi-dir)
                  </button>
                </div>
              </div>

              {/* Port A Direction (D4) */}
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Port A Direction (D4)</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPortADir('output')}
                    className={`flex-1 py-1 rounded font-bold border cursor-pointer transition-all ${
                      portADir === 'output' ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Output (0)
                  </button>
                  <button
                    onClick={() => setPortADir('input')}
                    className={`flex-1 py-1 rounded font-bold border cursor-pointer transition-all ${
                      portADir === 'input' ? 'bg-blue-600 border-blue-600 text-white shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Input (1)
                  </button>
                </div>
              </div>

              {/* Port C Upper Direction (D3) */}
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Port C Upper (PC4–PC7) Direction (D3)</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPortCUpperDir('output')}
                    className={`flex-1 py-1 rounded font-bold border cursor-pointer transition-all ${
                      portCUpperDir === 'output' ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Output (0)
                  </button>
                  <button
                    onClick={() => setPortCUpperDir('input')}
                    className={`flex-1 py-1 rounded font-bold border cursor-pointer transition-all ${
                      portCUpperDir === 'input' ? 'bg-blue-600 border-blue-600 text-white shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Input (1)
                  </button>
                </div>
              </div>
            </div>

            {/* GROUP B CONTROLS */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="font-bold text-xs text-indigo-900 uppercase">Group B Configuration</span>
                <span className="text-[10px] font-mono text-indigo-600 font-bold">Port B + Port C Lower</span>
              </div>

              {/* Mode selection for Group B */}
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Group B Operating Mode (D2)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setGroupBMode('mode0')}
                    className={`py-1 px-2 rounded-lg font-bold border cursor-pointer transition-all ${
                      groupBMode === 'mode0' ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Mode 0 (Basic I/O)
                  </button>
                  <button
                    onClick={() => setGroupBMode('mode1')}
                    className={`py-1 px-2 rounded-lg font-bold border cursor-pointer transition-all ${
                      groupBMode === 'mode1' ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Mode 1 (Strobe I/O)
                  </button>
                </div>
              </div>

              {/* Port B Direction (D1) */}
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Port B Direction (D1)</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPortBDir('output')}
                    className={`flex-1 py-1 rounded font-bold border cursor-pointer transition-all ${
                      portBDir === 'output' ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Output (0)
                  </button>
                  <button
                    onClick={() => setPortBDir('input')}
                    className={`flex-1 py-1 rounded font-bold border cursor-pointer transition-all ${
                      portBDir === 'input' ? 'bg-blue-600 border-blue-600 text-white shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Input (1)
                  </button>
                </div>
              </div>

              {/* Port C Lower Direction (D0) */}
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Port C Lower (PC0–PC3) Direction (D0)</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPortCLowerDir('output')}
                    className={`flex-1 py-1 rounded font-bold border cursor-pointer transition-all ${
                      portCLowerDir === 'output' ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Output (0)
                  </button>
                  <button
                    onClick={() => setPortCLowerDir('input')}
                    className={`flex-1 py-1 rounded font-bold border cursor-pointer transition-all ${
                      portCLowerDir === 'input' ? 'bg-blue-600 border-blue-600 text-white shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Input (1)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* INTERACTIVE PORT REGISTERS & BUS CONTROL SIGNALS (READ / WRITE)           */}
          {/* ========================================================================= */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                    8255 Port Registers & Bus Control Signals (Read / Write)
                  </h3>
                  <span className="text-[10px] bg-indigo-50 text-indigo-800 font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                    Live Hardware Bus Simulation
                  </span>
                </div>
              </div>

              {/* Reset Button */}
              <button
                type="button"
                onClick={executeReset}
                title="Assert Pin 35 RESET HIGH: Restores 8255 to default power-on state (9BH, all ports input)."
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg cursor-pointer transition-all shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                Reset 8255 (Pin 35)
              </button>
            </div>

            {/* Hardware Bus Control Console */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              {/* Address Decoding (A1, A0) - 4 cols */}
              <div className="lg:col-span-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    1. Target Address Select (A1, A0)
                  </span>
                  <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    A1={sigA1} • A0={sigA0}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 font-mono text-xs">
                  {[
                    { a1: 0, a0: 0, name: 'Port A', addr: '80H' },
                    { a1: 0, a0: 1, name: 'Port B', addr: '81H' },
                    { a1: 1, a0: 0, name: 'Port C', addr: '82H' },
                    { a1: 1, a0: 1, name: 'Control Reg', addr: '83H' },
                  ].map((item) => {
                    const isSelected = sigA1 === item.a1 && sigA0 === item.a0;
                    return (
                      <button
                        key={item.addr}
                        type="button"
                        onClick={() => {
                          setSigA1(item.a1);
                          setSigA0(item.a0);
                        }}
                        className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs ring-2 ring-indigo-200'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs">{item.name}</span>
                          <span className={`text-[10px] ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {item.addr}
                          </span>
                        </div>
                        <div className={`text-[9px] mt-0.5 ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                          A1={item.a1}, A0={item.a0}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bus Control Strobes (C̅S̅, R̅D̅, W̅R̅) - 4 cols */}
              <div className="lg:col-span-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    2. Bus Strobes (C̅S̅, R̅D̅, W̅R̅)
                  </span>
                  <button
                    type="button"
                    onClick={() => setSigCS((prev) => (prev === 0 ? 1 : 0))}
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border cursor-pointer transition-all ${
                      sigCS === 0
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-rose-100 text-rose-900 border-rose-300'
                    }`}
                  >
                    C̅S̅={sigCS} ({sigCS === 0 ? 'Chip Enabled' : 'Disabled / High-Z'})
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* R̅D̅ Button */}
                  <button
                    type="button"
                    onClick={() => executeCpuRead()}
                    title="Assert R̅D̅ LOW (Pin 5): CPU reads from addressed port/pins into CPU Data Bus (IN AL, [Port])."
                    className="p-2.5 rounded-lg border cursor-pointer transition-all flex flex-col items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white border-blue-700 shadow-xs hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <div className="flex items-center gap-1 font-bold text-xs">
                      <ArrowDown className="w-3.5 h-3.5" />
                      READ (R̅D̅ = 0)
                    </div>
                    <span className="text-[9px] text-blue-100">IN AL, [Port]</span>
                  </button>

                  {/* W̅R̅ Button */}
                  <button
                    type="button"
                    onClick={() => executeCpuWrite()}
                    title="Assert W̅R̅ LOW (Pin 36): CPU writes CPU Data Bus value into addressed port latch (OUT [Port], AL)."
                    className="p-2.5 rounded-lg border cursor-pointer transition-all flex flex-col items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-xs hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <div className="flex items-center gap-1 font-bold text-xs">
                      <ArrowUp className="w-3.5 h-3.5" />
                      WRITE (W̅R̅ = 0)
                    </div>
                    <span className="text-[9px] text-emerald-100">OUT [Port], AL</span>
                  </button>
                </div>

                <div className="text-[10px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-700">Active Signals: </span>
                  <span className="font-mono">
                    C̅S̅={sigCS} • R̅D̅={sigRD} • W̅R̅={sigWR}
                  </span>
                  {sigRD === 0 && <span className="text-blue-600 font-bold ml-1">● READING</span>}
                  {sigWR === 0 && <span className="text-emerald-600 font-bold ml-1">● WRITING</span>}
                  {sigRD === 1 && sigWR === 1 && <span className="text-slate-400 ml-1">● IDLE</span>}
                </div>
              </div>

              {/* CPU Data Bus Buffer (D7-D0) - 4 cols */}
              <div className="lg:col-span-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    3. CPU Data Bus (D7–D0)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      0x{cpuDataBus.toString(16).toUpperCase().padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      ({cpuDataBus.toString(2).padStart(8, '0')}b)
                    </span>
                  </div>
                </div>

                {/* 8-bit interactive bus toggles */}
                <div className="grid grid-cols-8 gap-1 font-mono text-center">
                  {Array.from({ length: 8 }, (_, i) => {
                    const bitIdx = 7 - i;
                    const bitVal = (cpuDataBus >> bitIdx) & 1;
                    return (
                      <button
                        key={bitIdx}
                        type="button"
                        onClick={() => setCpuDataBus((prev) => prev ^ (1 << bitIdx))}
                        title={`Data Bus D${bitIdx}: ${bitVal}. Click to toggle before writing.`}
                        className={`py-1 rounded border text-[10px] font-bold cursor-pointer transition-all ${
                          bitVal === 1
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-[8px] block text-slate-400">D{bitIdx}</span>
                        <span>{bitVal}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Quick Data Bus Presets */}
                <div className="flex flex-wrap items-center gap-1 pt-1 text-[10px]">
                  <span className="text-slate-500 font-semibold mr-1">Presets:</span>
                  {[
                    { label: '55H', val: 0x55 },
                    { label: 'AAH', val: 0xAA },
                    { label: 'FFH', val: 0xFF },
                    { label: '00H', val: 0x00 },
                    { label: '80H', val: 0x80 },
                    { label: '9BH', val: 0x9B },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setCpuDataBus(preset.val)}
                      className={`px-1.5 py-0.5 rounded font-mono font-bold cursor-pointer transition-all ${
                        cpuDataBus === preset.val
                          ? 'bg-indigo-700 text-white'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Bus Cycle Feedback Banner */}
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 transition-all ${
                busCycleLog.type === 'read'
                  ? 'bg-blue-50/80 border-blue-200 text-blue-900'
                  : busCycleLog.type === 'write'
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : busCycleLog.type === 'warning'
                  ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                  : busCycleLog.type === 'reset'
                  ? 'bg-purple-50/80 border-purple-200 text-purple-900'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              {busCycleLog.type === 'read' && <ArrowDown className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}
              {busCycleLog.type === 'write' && <ArrowUp className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
              {busCycleLog.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
              {busCycleLog.type === 'reset' && <RotateCcw className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />}
              {busCycleLog.type === 'idle' && <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />}
              <div className="space-y-0.5">
                <div className="font-bold text-xs font-mono">{busCycleLog.title}</div>
                <div className="text-[11px] opacity-90 leading-relaxed">{busCycleLog.details}</div>
              </div>
            </div>

            {/* Quick Assembly Instruction Shortcuts */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs bg-slate-50 p-2 rounded-lg border border-slate-200">
              <span className="text-[11px] font-bold text-slate-700 mr-1 uppercase tracking-wider">
                Quick 8086 Instructions:
              </span>
              <button
                type="button"
                onClick={() => executeCpuRead(0, 0)}
                className="px-2 py-1 bg-white hover:bg-blue-50 border border-blue-200 hover:border-blue-400 text-blue-700 rounded-md font-mono text-[11px] font-bold cursor-pointer transition-all shadow-2xs"
              >
                IN AL, 80H (Read PA)
              </button>
              <button
                type="button"
                onClick={() => executeCpuWrite(0, 0)}
                className="px-2 py-1 bg-white hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-400 text-emerald-700 rounded-md font-mono text-[11px] font-bold cursor-pointer transition-all shadow-2xs"
              >
                OUT 80H, AL (Write PA)
              </button>
              <button
                type="button"
                onClick={() => executeCpuRead(0, 1)}
                className="px-2 py-1 bg-white hover:bg-blue-50 border border-blue-200 hover:border-blue-400 text-blue-700 rounded-md font-mono text-[11px] font-bold cursor-pointer transition-all shadow-2xs"
              >
                IN AL, 81H (Read PB)
              </button>
              <button
                type="button"
                onClick={() => executeCpuWrite(0, 1)}
                className="px-2 py-1 bg-white hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-400 text-emerald-700 rounded-md font-mono text-[11px] font-bold cursor-pointer transition-all shadow-2xs"
              >
                OUT 81H, AL (Write PB)
              </button>
              <button
                type="button"
                onClick={() => executeCpuRead(1, 0)}
                className="px-2 py-1 bg-white hover:bg-blue-50 border border-blue-200 hover:border-blue-400 text-blue-700 rounded-md font-mono text-[11px] font-bold cursor-pointer transition-all shadow-2xs"
              >
                IN AL, 82H (Read PC)
              </button>
              <button
                type="button"
                onClick={() => executeCpuWrite(1, 0)}
                className="px-2 py-1 bg-white hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-400 text-emerald-700 rounded-md font-mono text-[11px] font-bold cursor-pointer transition-all shadow-2xs"
              >
                OUT 82H, AL (Write PC)
              </button>
              <button
                type="button"
                onClick={() => executeCpuWrite(1, 1)}
                className="px-2 py-1 bg-white hover:bg-indigo-50 border border-indigo-200 hover:border-indigo-400 text-indigo-700 rounded-md font-mono text-[11px] font-bold cursor-pointer transition-all shadow-2xs"
              >
                OUT 83H, AL (Write Control Word)
              </button>
            </div>

            {/* 3 Interactive Port Register Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Port A Card */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  sigA1 === 0 && sigA0 === 0
                    ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-200'
                    : 'bg-white border-slate-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <strong className="text-slate-900 text-xs font-bold">Port A (PA0–PA7)</strong>
                      {sigA1 === 0 && sigA0 === 0 && (
                        <span className="text-[9px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.2 rounded">
                          Selected (80H)
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Pins 1–4, 37–40 • Addr 80H</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                      portADir === 'input'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {portADir === 'input' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
                    {portADir === 'input' ? 'INPUT (D4=1)' : 'OUTPUT (D4=0)'}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {portADir === 'input' ? 'External Pins State:' : 'Latched Output State:'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      0x{effectivePortAPins.toString(16).toUpperCase().padStart(2, '0')}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      ({effectivePortAPins.toString(2).padStart(8, '0')}b)
                    </span>
                  </div>
                </div>

                {/* 8-bit pin bar */}
                <div className="grid grid-cols-8 gap-1 font-mono text-center mb-2.5">
                  {Array.from({ length: 8 }, (_, i) => {
                    const bitIdx = 7 - i;
                    const bitVal = (effectivePortAPins >> bitIdx) & 1;
                    return (
                      <button
                        key={bitIdx}
                        type="button"
                        onClick={() => {
                          if (portADir === 'input') {
                            setPortAExtInput((prev) => prev ^ (1 << bitIdx));
                          } else {
                            setPortAOutputLatch((prev) => prev ^ (1 << bitIdx));
                          }
                        }}
                        title={
                          portADir === 'input'
                            ? `PA${bitIdx} (External Input Pin): ${bitVal}. Click to toggle simulated external signal.`
                            : `PA${bitIdx} (Output Pin): ${bitVal}. Latched from 8255. Click to flip.`
                        }
                        className={`py-1.5 rounded text-[10px] font-bold border cursor-pointer transition-all ${
                          bitVal === 1
                            ? portADir === 'input'
                              ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                              : 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <span className="text-[8px] block opacity-75">PA{bitIdx}</span>
                        <span>{bitVal}</span>
                      </button>
                    );
                  })}
                </div>

                <p className="text-[10px] text-slate-500 leading-tight">
                  {portADir === 'input'
                    ? 'Pins represent external inputs (sensors/switches). Click pins to change signals, then execute READ (R̅D̅=0).'
                    : 'Pins driven by internal output latch. Load CPU Data Bus and execute WRITE (W̅R̅=0) to update.'}
                </p>
              </div>

              {/* Port B Card */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  sigA1 === 0 && sigA0 === 1
                    ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-200'
                    : 'bg-white border-slate-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <strong className="text-slate-900 text-xs font-bold">Port B (PB0–PB7)</strong>
                      {sigA1 === 0 && sigA0 === 1 && (
                        <span className="text-[9px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.2 rounded">
                          Selected (81H)
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Pins 18–25 • Addr 81H</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                      portBDir === 'input'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {portBDir === 'input' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
                    {portBDir === 'input' ? 'INPUT (D1=1)' : 'OUTPUT (D1=0)'}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {portBDir === 'input' ? 'External Pins State:' : 'Latched Output State:'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      0x{effectivePortBPins.toString(16).toUpperCase().padStart(2, '0')}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      ({effectivePortBPins.toString(2).padStart(8, '0')}b)
                    </span>
                  </div>
                </div>

                {/* 8-bit pin bar */}
                <div className="grid grid-cols-8 gap-1 font-mono text-center mb-2.5">
                  {Array.from({ length: 8 }, (_, i) => {
                    const bitIdx = 7 - i;
                    const bitVal = (effectivePortBPins >> bitIdx) & 1;
                    return (
                      <button
                        key={bitIdx}
                        type="button"
                        onClick={() => {
                          if (portBDir === 'input') {
                            setPortBExtInput((prev) => prev ^ (1 << bitIdx));
                          } else {
                            setPortBOutputLatch((prev) => prev ^ (1 << bitIdx));
                          }
                        }}
                        title={
                          portBDir === 'input'
                            ? `PB${bitIdx} (External Input Pin): ${bitVal}. Click to toggle simulated input.`
                            : `PB${bitIdx} (Output Pin): ${bitVal}. Latched from 8255. Click to flip.`
                        }
                        className={`py-1.5 rounded text-[10px] font-bold border cursor-pointer transition-all ${
                          bitVal === 1
                            ? portBDir === 'input'
                              ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                              : 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <span className="text-[8px] block opacity-75">PB{bitIdx}</span>
                        <span>{bitVal}</span>
                      </button>
                    );
                  })}
                </div>

                <p className="text-[10px] text-slate-500 leading-tight">
                  {portBDir === 'input'
                    ? 'Pins represent external inputs. Click pins to toggle, then execute READ (R̅D̅=0).'
                    : 'Pins driven by internal output latch. Load CPU Data Bus and execute WRITE (W̅R̅=0).'}
                </p>
              </div>

              {/* Port C Card (Split Upper / Lower) */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  sigA1 === 1 && sigA0 === 0
                    ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-200'
                    : 'bg-white border-slate-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <strong className="text-slate-900 text-xs font-bold">Port C (PC0–PC7)</strong>
                      {sigA1 === 1 && sigA0 === 0 && (
                        <span className="text-[9px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.2 rounded">
                          Selected (82H)
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Pins 14–17, 10–13 • Addr 82H</span>
                  </div>

                  {/* Split direction badges */}
                  <div className="flex gap-1">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                        portCUpperDir === 'input'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      PC7–4: {portCUpperDir === 'input' ? 'IN' : 'OUT'}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                        portCLowerDir === 'input'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      PC3–0: {portCLowerDir === 'input' ? 'IN' : 'OUT'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-slate-500 font-semibold">Port C Pin State:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      0x{effectivePortCPins.toString(16).toUpperCase().padStart(2, '0')}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      ({effectivePortCPins.toString(2).padStart(8, '0')}b)
                    </span>
                  </div>
                </div>

                {/* 8-bit pin bar with split between Upper (7-4) and Lower (3-0) */}
                <div className="grid grid-cols-8 gap-1 font-mono text-center mb-2.5">
                  {Array.from({ length: 8 }, (_, i) => {
                    const bitIdx = 7 - i;
                    const isUpper = bitIdx >= 4;
                    const isInput = isUpper ? portCUpperDir === 'input' : portCLowerDir === 'input';
                    const bitVal = (effectivePortCPins >> bitIdx) & 1;
                    return (
                      <button
                        key={bitIdx}
                        type="button"
                        onClick={() => {
                          if (isUpper) {
                            if (portCUpperDir === 'input') {
                              setPortCExtInput((prev) => prev ^ (1 << bitIdx));
                            } else {
                              setPortCOutputLatch((prev) => prev ^ (1 << bitIdx));
                            }
                          } else {
                            if (portCLowerDir === 'input') {
                              setPortCExtInput((prev) => prev ^ (1 << bitIdx));
                            } else {
                              setPortCOutputLatch((prev) => prev ^ (1 << bitIdx));
                            }
                          }
                        }}
                        title={`PC${bitIdx} (${isUpper ? 'Upper' : 'Lower'}, ${isInput ? 'INPUT' : 'OUTPUT'}): ${bitVal}. Click to toggle.`}
                        className={`py-1.5 rounded text-[10px] font-bold border cursor-pointer transition-all ${
                          bitVal === 1
                            ? isInput
                              ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                              : 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        } ${bitIdx === 4 ? 'border-r-2 border-r-slate-400' : ''}`}
                      >
                        <span className="text-[8px] block opacity-75">PC{bitIdx}</span>
                        <span>{bitVal}</span>
                      </button>
                    );
                  })}
                </div>

                <p className="text-[10px] text-slate-500 leading-tight">
                  Independent nibbles: PC7–PC4 (<strong className="text-slate-700">{portCUpperDir}</strong>), PC3–PC0 (<strong className="text-slate-700">{portCLowerDir}</strong>). Also directly settable via BSR Mode.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {ioSubTab === 'mode0' && (
        <PPI8255ModesOfOperation hideSubNav={true} selectedSubView="mode0" />
      )}

      {ioSubTab === 'mode1' && (
        <PPI8255ModesOfOperation hideSubNav={true} selectedSubView="mode1" />
      )}

      {ioSubTab === 'mode2' && (
        <PPI8255ModesOfOperation hideSubNav={true} selectedSubView="mode2" />
      )}

      {ioSubTab === 'table' && (
        <PPI8255ModesOfOperation hideSubNav={true} selectedSubView="table" />
      )}
    </div>
  )}

      {/* ========================================================================= */}
      {/* TAB 4: BSR MODE                                                           */}
      {/* ========================================================================= */}
      {activeTab === 'bsr' && (
        <div className="space-y-4">
          {/* BSR Control Word Byte Bit Breakdown - Positioned at Top */}
          <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                    Calculated BSR Control Word Byte Register
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-300 inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                    Click bits to toggle
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-extrabold text-amber-900 bg-amber-100 px-3 py-1 rounded-lg border border-amber-300 shadow-xs">
                  {bsrControlWordHex}
                </span>
                <span className="text-[11px] font-mono text-slate-500 font-semibold">
                  ({bsrControlWordByte.toString(2).padStart(8, '0')}b)
                </span>
              </div>
            </div>

            {/* Interactive 8-Bit BSR Register Bar */}
            <div className="grid grid-cols-8 gap-1.5 font-mono text-center">
              {/* D7 */}
              <button
                type="button"
                onClick={() => handleToggleBsrBit(7)}
                title="D7: Mode Set Flag (0 = BSR Mode, 1 = I/O Mode). Click to switch to I/O Mode (D7=1)."
                className="group p-2 rounded-lg border cursor-pointer transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 bg-amber-500 text-white border-amber-600 shadow-xs hover:ring-2 hover:ring-amber-300"
              >
                <div className="font-bold text-[10px] text-amber-100">D7</div>
                <div className="font-black text-sm my-0.5">0</div>
                <div className="text-[9px] font-sans font-semibold truncate">BSR Mode</div>
                <div className="text-[8px] font-sans text-amber-100 opacity-0 group-hover:opacity-100 transition-opacity">Flip</div>
              </button>

              {/* D6 */}
              <div
                title="D6: Don't care in BSR mode (X / 0)"
                className="p-2 rounded-lg border bg-slate-50 text-slate-400 border-slate-200 select-none"
              >
                <div className="font-bold text-slate-400 text-[10px]">D6</div>
                <div className="font-black text-sm my-0.5">0</div>
                <div className="text-[9px] font-sans font-medium truncate">X (Care)</div>
              </div>

              {/* D5 */}
              <div
                title="D5: Don't care in BSR mode (X / 0)"
                className="p-2 rounded-lg border bg-slate-50 text-slate-400 border-slate-200 select-none"
              >
                <div className="font-bold text-slate-400 text-[10px]">D5</div>
                <div className="font-black text-sm my-0.5">0</div>
                <div className="text-[9px] font-sans font-medium truncate">X (Care)</div>
              </div>

              {/* D4 */}
              <div
                title="D4: Don't care in BSR mode (X / 0)"
                className="p-2 rounded-lg border bg-slate-50 text-slate-400 border-slate-200 select-none"
              >
                <div className="font-bold text-slate-400 text-[10px]">D4</div>
                <div className="font-black text-sm my-0.5">0</div>
                <div className="text-[9px] font-sans font-medium truncate">X (Care)</div>
              </div>

              {/* D3 */}
              <button
                type="button"
                onClick={() => handleToggleBsrBit(3)}
                title={`D3: Bit select B2. Current bit: ${((bsrBit >> 2) & 1)}. Click to toggle.`}
                className={`group p-2 rounded-lg border cursor-pointer transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 hover:ring-2 hover:ring-indigo-300 ${
                  ((bsrBit >> 2) & 1) === 1
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className={`font-bold text-[10px] ${((bsrBit >> 2) & 1) === 1 ? 'text-indigo-200' : 'text-slate-500'}`}>D3</div>
                <div className="font-black text-sm my-0.5">{((bsrBit >> 2) & 1)}</div>
                <div className="text-[9px] font-sans font-semibold truncate">Bit Sel B2</div>
                <div className={`text-[8px] font-sans opacity-0 group-hover:opacity-100 transition-opacity ${((bsrBit >> 2) & 1) === 1 ? 'text-indigo-200' : 'text-slate-400'}`}>Flip</div>
              </button>

              {/* D2 */}
              <button
                type="button"
                onClick={() => handleToggleBsrBit(2)}
                title={`D2: Bit select B1. Current bit: ${((bsrBit >> 1) & 1)}. Click to toggle.`}
                className={`group p-2 rounded-lg border cursor-pointer transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 hover:ring-2 hover:ring-indigo-300 ${
                  ((bsrBit >> 1) & 1) === 1
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className={`font-bold text-[10px] ${((bsrBit >> 1) & 1) === 1 ? 'text-indigo-200' : 'text-slate-500'}`}>D2</div>
                <div className="font-black text-sm my-0.5">{((bsrBit >> 1) & 1)}</div>
                <div className="text-[9px] font-sans font-semibold truncate">Bit Sel B1</div>
                <div className={`text-[8px] font-sans opacity-0 group-hover:opacity-100 transition-opacity ${((bsrBit >> 1) & 1) === 1 ? 'text-indigo-200' : 'text-slate-400'}`}>Flip</div>
              </button>

              {/* D1 */}
              <button
                type="button"
                onClick={() => handleToggleBsrBit(1)}
                title={`D1: Bit select B0. Current bit: ${(bsrBit & 1)}. Click to toggle.`}
                className={`group p-2 rounded-lg border cursor-pointer transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 hover:ring-2 hover:ring-indigo-300 ${
                  (bsrBit & 1) === 1
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className={`font-bold text-[10px] ${(bsrBit & 1) === 1 ? 'text-indigo-200' : 'text-slate-500'}`}>D1</div>
                <div className="font-black text-sm my-0.5">{(bsrBit & 1)}</div>
                <div className="text-[9px] font-sans font-semibold truncate">Bit Sel B0</div>
                <div className={`text-[8px] font-sans opacity-0 group-hover:opacity-100 transition-opacity ${(bsrBit & 1) === 1 ? 'text-indigo-200' : 'text-slate-400'}`}>Flip</div>
              </button>

              {/* D0 */}
              <button
                type="button"
                onClick={() => handleToggleBsrBit(0)}
                title={`D0: S/R Action (${bsrSetReset === 1 ? 'SET 1' : 'RESET 0'}). Click to toggle.`}
                className={`group p-2 rounded-lg border cursor-pointer transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 hover:ring-2 hover:ring-indigo-300 ${
                  bsrSetReset === 1
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : 'bg-rose-600 text-white border-rose-700 shadow-xs'
                }`}
              >
                <div className="font-bold text-[10px] text-white/80">D0</div>
                <div className="font-black text-sm my-0.5">{bsrSetReset}</div>
                <div className="text-[9px] font-sans font-semibold truncate">{bsrSetReset === 1 ? 'SET (1)' : 'RESET (0)'}</div>
                <div className="text-[8px] font-sans text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">Flip</div>
              </button>
            </div>

            {/* Quick BSR Presets Bar */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 text-[10px]">
              <span className="font-bold text-slate-500 uppercase tracking-wider mr-1">Quick Presets:</span>
              {[
                { bit: 0, sr: 1, label: '01H: Set PC0' },
                { bit: 0, sr: 0, label: '00H: Reset PC0' },
                { bit: 3, sr: 1, label: '07H: Set PC3' },
                { bit: 3, sr: 0, label: '06H: Reset PC3' },
                { bit: 7, sr: 1, label: '0FH: Set PC7' },
                { bit: 7, sr: 0, label: '0EH: Reset PC7' },
              ].map((preset) => {
                const isSelected = bsrBit === preset.bit && bsrSetReset === preset.sr;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setBsrBit(preset.bit);
                      setBsrSetReset(preset.sr);
                    }}
                    className={`px-2 py-0.5 rounded-md font-mono font-bold cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* BSR Configurator Controls - Positioned Below */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="font-bold text-xs text-indigo-900 uppercase">Bit Set / Reset (BSR) Mode Configurator (D7 = 0)</span>
              <span className="text-[10px] font-mono text-slate-500">Affects Port C Only</span>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Target Port C Bit (PC0 to PC7)</label>
              <div className="grid grid-cols-8 gap-1">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((b) => (
                  <button
                    key={b}
                    onClick={() => setBsrBit(b)}
                    className={`py-1.5 rounded font-mono font-bold border cursor-pointer transition-all ${
                      bsrBit === b ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    PC{b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Operation Action (D0)</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setBsrSetReset(1)}
                  className={`flex-1 py-1.5 rounded font-bold border cursor-pointer transition-all ${
                    bsrSetReset === 1 ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  SET (Logic 1)
                </button>
                <button
                  onClick={() => setBsrSetReset(0)}
                  className={`flex-1 py-1.5 rounded font-bold border cursor-pointer transition-all ${
                    bsrSetReset === 0 ? 'bg-rose-600 border-rose-600 text-white shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  RESET (Logic 0)
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
            <div className="font-mono text-xs text-slate-700">
              Selected BSR Control Word: <strong className="text-indigo-700 font-bold">{bsrControlWordHex}</strong>
            </div>
            <button
              onClick={handleApplyBSR}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all shadow-xs"
            >
              Execute BSR Action on PC{bsrBit}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: PORT REGISTERS MONITOR                                             */}
      {/* ========================================================================= */}
      {activeTab === 'registers' && (
        <div className="space-y-3">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div>
                <div className="font-bold text-indigo-950 text-xs uppercase tracking-wider">
                  8255 Port Register Pin States & Control Signal Enforcement
                </div>
              </div>

              {/* Quick R̅D̅/W̅R̅ Status */}
              <div className="flex items-center gap-1.5 font-mono text-[10px]">
                <span className="px-2 py-0.5 bg-white rounded border border-slate-200 text-slate-600">
                  C̅S̅={sigCS}
                </span>
                <span className={`px-2 py-0.5 rounded border font-bold ${sigRD === 0 ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-white text-slate-600 border-slate-200'}`}>
                  R̅D̅={sigRD}
                </span>
                <span className={`px-2 py-0.5 rounded border font-bold ${sigWR === 0 ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-white text-slate-600 border-slate-200'}`}>
                  W̅R̅={sigWR}
                </span>
              </div>
            </div>

            {/* Port A */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2 shadow-2xs">
              <div className="flex justify-between items-center text-[10px]">
                <div className="flex items-center gap-2">
                  <strong className="text-slate-800 font-bold">Port A (PA0–PA7)</strong>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full border text-[9px] ${
                      portADir === 'input'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {portADir === 'input' ? 'INPUT MODE (D4=1)' : 'OUTPUT MODE (D4=0)'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    0x{effectivePortAPins.toString(16).toUpperCase().padStart(2, '0')}
                  </span>
                  <button
                    type="button"
                    onClick={() => executeCpuRead(0, 0)}
                    className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded font-bold border border-blue-200 text-[9px] cursor-pointer"
                  >
                    Read
                  </button>
                  <button
                    type="button"
                    onClick={() => executeCpuWrite(0, 0)}
                    className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded font-bold border border-emerald-200 text-[9px] cursor-pointer"
                  >
                    Write
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-8 gap-1 font-mono text-center">
                {Array.from({ length: 8 }, (_, i) => {
                  const bitIdx = 7 - i;
                  const bit = (effectivePortAPins >> bitIdx) & 1;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        if (portADir === 'input') {
                          setPortAExtInput((prev) => prev ^ (1 << bitIdx));
                        } else {
                          setPortAOutputLatch((prev) => prev ^ (1 << bitIdx));
                        }
                      }}
                      title={`PA${bitIdx}: ${bit} (${portADir === 'input' ? 'External Input' : 'Latched Output'}). Click to toggle.`}
                      className={`py-1.5 rounded font-bold text-[10px] cursor-pointer transition-all ${
                        bit
                          ? portADir === 'input'
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      PA{bitIdx}: {bit}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Port B */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2 shadow-2xs">
              <div className="flex justify-between items-center text-[10px]">
                <div className="flex items-center gap-2">
                  <strong className="text-slate-800 font-bold">Port B (PB0–PB7)</strong>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full border text-[9px] ${
                      portBDir === 'input'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {portBDir === 'input' ? 'INPUT MODE (D1=1)' : 'OUTPUT MODE (D1=0)'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    0x{effectivePortBPins.toString(16).toUpperCase().padStart(2, '0')}
                  </span>
                  <button
                    type="button"
                    onClick={() => executeCpuRead(0, 1)}
                    className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded font-bold border border-blue-200 text-[9px] cursor-pointer"
                  >
                    Read
                  </button>
                  <button
                    type="button"
                    onClick={() => executeCpuWrite(0, 1)}
                    className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded font-bold border border-emerald-200 text-[9px] cursor-pointer"
                  >
                    Write
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-8 gap-1 font-mono text-center">
                {Array.from({ length: 8 }, (_, i) => {
                  const bitIdx = 7 - i;
                  const bit = (effectivePortBPins >> bitIdx) & 1;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        if (portBDir === 'input') {
                          setPortBExtInput((prev) => prev ^ (1 << bitIdx));
                        } else {
                          setPortBOutputLatch((prev) => prev ^ (1 << bitIdx));
                        }
                      }}
                      title={`PB${bitIdx}: ${bit} (${portBDir === 'input' ? 'External Input' : 'Latched Output'}). Click to toggle.`}
                      className={`py-1.5 rounded font-bold text-[10px] cursor-pointer transition-all ${
                        bit
                          ? portBDir === 'input'
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      PB{bitIdx}: {bit}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Port C */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2 shadow-2xs">
              <div className="flex justify-between items-center text-[10px]">
                <div className="flex items-center gap-2">
                  <strong className="text-slate-800 font-bold">Port C (PC0–PC7)</strong>
                  <span className="font-bold px-1.5 py-0.5 rounded border text-[9px] bg-slate-100 text-slate-700">
                    PC7–4: {portCUpperDir.toUpperCase()} • PC3–0: {portCLowerDir.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    0x{effectivePortCPins.toString(16).toUpperCase().padStart(2, '0')}
                  </span>
                  <button
                    type="button"
                    onClick={() => executeCpuRead(1, 0)}
                    className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded font-bold border border-blue-200 text-[9px] cursor-pointer"
                  >
                    Read
                  </button>
                  <button
                    type="button"
                    onClick={() => executeCpuWrite(1, 0)}
                    className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded font-bold border border-emerald-200 text-[9px] cursor-pointer"
                  >
                    Write
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-8 gap-1 font-mono text-center">
                {Array.from({ length: 8 }, (_, i) => {
                  const bitIdx = 7 - i;
                  const isUpper = bitIdx >= 4;
                  const isInput = isUpper ? portCUpperDir === 'input' : portCLowerDir === 'input';
                  const bit = (effectivePortCPins >> bitIdx) & 1;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        if (isUpper) {
                          if (portCUpperDir === 'input') {
                            setPortCExtInput((prev) => prev ^ (1 << bitIdx));
                          } else {
                            setPortCOutputLatch((prev) => prev ^ (1 << bitIdx));
                          }
                        } else {
                          if (portCLowerDir === 'input') {
                            setPortCExtInput((prev) => prev ^ (1 << bitIdx));
                          } else {
                            setPortCOutputLatch((prev) => prev ^ (1 << bitIdx));
                          }
                        }
                      }}
                      title={`PC${bitIdx}: ${bit} (${isUpper ? 'Upper' : 'Lower'}, ${isInput ? 'Input' : 'Output'}). Click to toggle.`}
                      className={`py-1.5 rounded font-bold text-[10px] cursor-pointer transition-all ${
                        bit
                          ? isInput
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      } ${bitIdx === 4 ? 'border-r-2 border-r-slate-400' : ''}`}
                    >
                      PC{bitIdx}: {bit}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 0: FIGURE 1.3 ARCHITECTURE DIAGRAM                                   */}
      {/* ========================================================================= */}
      {activeTab === 'diagram' && (
        <PPI8255ArchitectureDiagram headerSlot={tabSwitcherElement} />
      )}

      {/* ========================================================================= */}
      {/* TAB: MODES OF OPERATION                                                   */}
      {/* ========================================================================= */}
      {activeTab === 'modes' && (
        <PPI8255ModesOfOperation hideSubNav={true} selectedSubView="overview" />
      )}
    </div>
  );
}
