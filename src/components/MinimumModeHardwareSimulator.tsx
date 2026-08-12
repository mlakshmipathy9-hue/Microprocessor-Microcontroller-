import { useState } from 'react';
import { Cpu, Zap, BookOpen, Layers, Info, CpuIcon, Sparkles } from 'lucide-react';

interface ComponentInfo {
  id: string;
  name: string;
  chipModel: string;
  role: string;
  connections: string[];
  examTip: string;
}

export default function MinimumModeHardwareSimulator() {
  const [operatingEnv, setOperatingEnv] = useState<'minimum' | 'maximum'>('minimum');
  const [activeTab, setActiveTab] = useState<'flow' | 'details'>('flow');
  const [selectedChip, setSelectedChip] = useState<string>('cpu');
  const [currentTState, setCurrentTState] = useState<'idle' | 't1' | 't2' | 't3' | 't4'>('idle');
  const [busDirection, setBusDirection] = useState<'read' | 'write'>('read');
  const [accessTarget, setAccessTarget] = useState<'memory' | 'io'>('memory');

  const formatActiveLowString = (str: string) => {
    if (str.includes('WR =') || str.includes('MWTC') || str.includes('IOWC')) {
      return (
        <span className="inline-flex items-center gap-0.5">
          <span className="overline">{str.split(' ')[0]}</span>
          <span> = LOW (Active Write)</span>
        </span>
      );
    }
    if (str.includes('RD =') || str.includes('MRDC') || str.includes('IORC')) {
      return (
        <span className="inline-flex items-center gap-0.5">
          <span className="overline">{str.split(' ')[0]}</span>
          <span> = LOW (Active Read)</span>
        </span>
      );
    }
    return str;
  };

  const chipsMin: Record<string, ComponentInfo> = {
    clock: {
      id: 'clock',
      name: 'Clock Generator',
      chipModel: 'Intel 8284A',
      role: 'Generates the master CLK signal, provides a synchronized RESET pulse on boot, and coordinates READY state synchronization for slow memory devices.',
      connections: [
        'CLK pin connected to 8086 CLK (pin 19) to drive CPU cycles.',
        'RESET pin connected to 8086 RESET (pin 21) to trigger initial system boot.',
        'READY pin connected to 8086 READY (pin 22) to synchronize slow memories.'
      ],
      examTip: 'Always mention that the 8284A crystal frequency is divided by 3 internally to output the 8086 system CLK (e.g., 15 MHz crystal outputs a 5 MHz CLK).'
    },
    cpu: {
      id: 'cpu',
      name: '8086 Microprocessor (Minimum Mode)',
      chipModel: 'Intel 8086',
      role: 'The heart of the system. Operating in Minimum Mode when MN/MX (pin 33) is wired directly to +5V (Vcc). Generates its own control signals directly without needing a separate bus controller.',
      connections: [
        'MN/MX pin (pin 33) connected to +5V.',
        'ALE pin (Address Latch Enable) connected to latch STB input.',
        'DEN & DT/R connected to transceiver OE & DIR inputs.',
        'M/IO, RD, and WR signals connected directly to memory/IO control bus.'
      ],
      examTip: 'A common exam question asks why MN/MX is connected to +5V. State clearly: "To enable Minimum Mode, where the 8086 generates all control signals (ALE, RD, WR, M/IO) directly on pins 24 to 31."'
    },
    latch: {
      id: 'latch',
      name: 'Address Latches (x3)',
      chipModel: 'Intel 8282 / 74LS373',
      role: 'Demultiplexes the combined Address/Data bus (AD0-AD15) and Address/Status bus (A16-A19/Status). Captures and locks the pure 20-bit physical memory address at the start of every bus cycle.',
      connections: [
        'Inputs connected to CPU AD0-AD15, A16-A19, and BHE lines.',
        'STB (Strobe) pin connected to CPU ALE (pin 25) output.',
        'OE (Output Enable) pin grounded (0V) to keep outputs permanently enabled.',
        'Outputs form the pure, non-multiplexed 20-bit Address Bus (A0-A19) and BHE.'
      ],
      examTip: 'Explain that the 8086 multiplexes addresses and data to keep the chip pin count down to 40. The 8282 latches are crucial to filter out data, leaving a clean, constant Address Bus for memory.'
    },
    transceiver: {
      id: 'transceiver',
      name: 'Data Transceivers (x2)',
      chipModel: 'Intel 8286 / 74LS245',
      role: 'Bidirectional buffers that control the flow of data between the CPU and the system Data Bus. Prevents electrical noise, boosts drive current, and avoids bus collisions.',
      connections: [
        'Local side pins connected to CPU multiplexed AD0-AD15 lines.',
        'System side pins form the dedicated 16-bit system Data Bus (D0-D15).',
        'OE (Output Enable) pin connected to CPU DEN pin (pin 26).',
        'DIR (Direction) pin connected to CPU DT/R pin (pin 27).'
      ],
      examTip: 'Remember: DEN enables the transceivers (active Low), while DT/R controls direction (High = Transmit/Write from CPU, Low = Receive/Read into CPU).'
    },
    memory: {
      id: 'memory',
      name: 'Memory & I/O Peripherals',
      chipModel: 'RAM / ROM / IO Devices',
      role: 'Stores code, data variables, and interfaces with input/output chips. Intercepts demultiplexed address buses and responds to active low read/write commands.',
      connections: [
        'Address inputs connected to demultiplexed Address Bus (A0-A19).',
        'Data pins connected to system Data Bus (D0-D15).',
        'Control inputs respond to RD, WR, and M/IO signals directly.'
      ],
      examTip: 'Explain that standard memory space is 1 MB (accessed via A0-A19), while I/O space is 64 KB (accessed via A0-A15 when M/IO is Low).'
    }
  };

  const chipsMax: Record<string, ComponentInfo> = {
    clock: {
      id: 'clock',
      name: 'Clock Generator',
      chipModel: 'Intel 8284A',
      role: 'Generates system CLK, RESET, and READY signals synchronized across the CPU, 8288 Bus Controller, and co-processors.',
      connections: [
        'CLK pin connected to 8086 CLK (pin 19) & 8288 CLK (pin 2).',
        'RESET & READY lines routed in parallel to CPU & bus controllers.'
      ],
      examTip: 'In Maximum Mode systems, 8284A synchronizes clock edges for both 8086 CPU and 8288 Bus Controller simultaneously.'
    },
    cpu: {
      id: 'cpu',
      name: '8086 Microprocessor (Maximum Mode)',
      chipModel: 'Intel 8086',
      role: 'Operating in Maximum Mode with MN/MX (pin 33) tied directly to Ground (0V/GND). Offloads bus control generation to the 8288 Bus Controller by issuing 3-bit status signals (S0, S1, S2).',
      connections: [
        'MN/MX pin (pin 33) connected to Ground (GND / 0V).',
        'Status pins S0, S1, S2 (pins 26-28) connected to 8288 S0, S1, S2 inputs.',
        'RQ/GT0 and RQ/GT1 (pins 30, 31) connected to 8087 co-processor.',
        'QS0 and QS1 (pins 24, 25) output queue status to 8087 co-processor.'
      ],
      examTip: 'When MN/MX is grounded, pins 24-31 change functions from Min Mode controls (ALE, WR, RD) to Max Mode status/arbitration lines (S0-S2, RQ/GT0-1, QS0-1, LOCK).'
    },
    busController: {
      id: 'busController',
      name: 'Bus Controller',
      chipModel: 'Intel 8288',
      role: 'Monitors 8086 status pins S0, S1, S2 and decodes processor state to generate all system command & bus control lines (MRDC, MWTC, AMWC, IORC, IOWC, AIOWC, ALE, DEN, DT/R, INTA).',
      connections: [
        'Inputs: S0, S1, S2 connected to CPU pins 26, 27, 28.',
        'Memory Commands: MRDC (Mem Read), MWTC (Mem Write), AMWC (Advanced Mem Write).',
        'I/O Commands: IORC (I/O Read), IOWC (I/O Write), AIOWC (Advanced I/O Write).',
        'Control outputs: ALE connected to latches; DEN & DT/R connected to transceivers.'
      ],
      examTip: 'Key Maximum Mode concept: The 8288 Bus Controller is MANDATORY in Maximum Mode because the 8086 CPU no longer outputs ALE, WR, RD, or M/IO directly.'
    },
    coprocessor: {
      id: 'coprocessor',
      name: 'Math Co-Processor / I/O Processor',
      chipModel: 'Intel 8087 / 8089',
      role: 'Operates in parallel with the 8086 CPU. Tracks instruction execution using QS0/QS1 queue status, executes floating-point math, and requests bus control using Request/Grant (RQ/GT) handshakes.',
      connections: [
        'RQ/GT0 line connected to 8086 RQ/GT0 pin for bi-directional bus request/grant.',
        'QS0 & QS1 inputs connected to 8086 QS0 & QS1 queue status lines.',
        'BUSY line signals CPU to pause execution (WAIT instruction) during long math ops.'
      ],
      examTip: 'Explain that Maximum Mode allows true dual-processor operation where the 8087 inspects opcodes directly off the bus while 8086 fetches instructions.'
    },
    latch: {
      id: 'latch',
      name: 'Address Latches (x3)',
      chipModel: 'Intel 8282 / 74LS373',
      role: 'Captures and locks 20-bit physical address A0-A19. In Maximum Mode, strobe (STB) is driven by the ALE output of the 8288 Bus Controller.',
      connections: [
        'Inputs connected to CPU AD0-AD15 and A16-A19 lines.',
        'STB input driven by 8288 Bus Controller ALE output.',
        'Outputs form non-multiplexed physical Address Bus A0-A19.'
      ],
      examTip: 'Notice that in Max Mode, ALE originates from the 8288 Bus Controller, NOT from the 8086 CPU directly.'
    },
    transceiver: {
      id: 'transceiver',
      name: 'Data Transceivers (x2)',
      chipModel: 'Intel 8286 / 74LS245',
      role: 'Buffers system Data Bus D0-D15. Output enable (OE) and direction (DIR) are controlled by DEN and DT/R lines generated by the 8288 Bus Controller.',
      connections: [
        'Local side connected to CPU AD0-AD15 lines.',
        'System side forms dedicated 16-bit Data Bus D0-D15.',
        'OE driven by 8288 DEN; DIR driven by 8288 DT/R.'
      ],
      examTip: 'In Max Mode, transceivers receive DEN and DT/R from 8288 to maintain bus isolation across multiple bus masters.'
    },
    memory: {
      id: 'memory',
      name: 'Memory & I/O System',
      chipModel: 'RAM / ROM / Peripheral ICs',
      role: 'Responds to decoded memory commands (MRDC/MWTC) or I/O commands (IORC/IOWC) issued by the 8288 Bus Controller.',
      connections: [
        'Address inputs connected to demultiplexed Address Bus A0-A19.',
        'Control inputs driven by 8288 MRDC, MWTC, IORC, IOWC command lines.'
      ],
      examTip: 'Instead of single RD/WR lines, Max Mode provides dedicated separate commands for memory (MRDC/MWTC) vs I/O (IORC/IOWC).'
    }
  };

  const chips = operatingEnv === 'minimum' ? chipsMin : chipsMax;
  const selectedChipInfo = chips[selectedChip] || chips['cpu'];

  // Signal state helper based on state & env
  const getSignalState = () => {
    if (operatingEnv === 'minimum') {
      switch (currentTState) {
        case 't1':
          return {
            ale: 'HIGH (Strobe Active from CPU)',
            den: 'HIGH (Disabled)',
            dtr: busDirection === 'write' ? 'HIGH (Transmit)' : 'HIGH (Turnaround)',
            busContent: accessTarget === 'memory' ? 'ADDRESS (A0 - A19)' : 'I/O PORT ADDR (A0 - A15)',
            rd_wr: `M/IO = ${accessTarget === 'memory' ? '1 (Memory)' : '0 (I/O Port)'}`,
            statusDecode: accessTarget === 'memory' ? 'CPU driving Memory Address' : 'CPU driving I/O Port Address',
            latchStatus: 'OPEN - LATCHING ADDRESS'
          };
        case 't2':
          return {
            ale: 'LOW (Locked)',
            den: 'LOW (Enabled from CPU)',
            dtr: busDirection === 'write' ? 'HIGH (Transmit)' : 'LOW (Receive)',
            busContent: busDirection === 'write' ? 'DATA (D0 - D15)' : `Hi-Z (Wait for ${accessTarget === 'memory' ? 'Memory' : 'I/O Device'})`,
            rd_wr: `M/IO = ${accessTarget === 'memory' ? '1' : '0'}, ${busDirection === 'write' ? 'WR = LOW' : 'RD = LOW'}`,
            statusDecode: accessTarget === 'memory' 
              ? `CPU driving Memory ${busDirection === 'write' ? 'Write' : 'Read'}`
              : `CPU driving I/O Peripheral ${busDirection === 'write' ? 'OUT' : 'IN'}`,
            latchStatus: 'LOCKED - HOLDING ADDRESS'
          };
        case 't3':
          return {
            ale: 'LOW (Locked)',
            den: 'LOW (Enabled)',
            dtr: busDirection === 'write' ? 'HIGH (Transmit)' : 'LOW (Receive)',
            busContent: busDirection === 'write' ? 'DATA (D0 - D15) Written' : 'DATA (D0 - D15) Read',
            rd_wr: `M/IO = ${accessTarget === 'memory' ? '1' : '0'}, ${busDirection === 'write' ? 'WR = LOW' : 'RD = LOW'}`,
            statusDecode: `${accessTarget === 'memory' ? 'Memory' : 'I/O Device'} Data Transfer Active`,
            latchStatus: 'LOCKED - HOLDING ADDRESS'
          };
        case 't4':
          return {
            ale: 'LOW (Inactive)',
            den: 'HIGH (Disabled)',
            dtr: 'HIGH (Default)',
            busContent: 'Float (Hi-Z)',
            rd_wr: 'HIGH (Inactive)',
            statusDecode: 'Cycle Complete',
            latchStatus: 'LOCKED - STANDBY'
          };
        default:
          return {
            ale: 'LOW',
            den: 'HIGH (Inactive)',
            dtr: 'HIGH',
            busContent: 'Undefined/Idle',
            rd_wr: 'HIGH',
            statusDecode: 'Idle',
            latchStatus: 'STANDBY'
          };
      }
    } else {
      // Maximum Mode
      const s0_s2 = accessTarget === 'memory'
        ? (busDirection === 'write' ? 'S2,S1,S0 = 1,1,0 (Mem Write)' : 'S2,S1,S0 = 1,0,1 (Mem Read)')
        : (busDirection === 'write' ? 'S2,S1,S0 = 0,1,0 (I/O Write)' : 'S2,S1,S0 = 0,0,1 (I/O Read)');
      const activeCmd = accessTarget === 'memory'
        ? (busDirection === 'write' ? 'MWTC = LOW' : 'MRDC = LOW')
        : (busDirection === 'write' ? 'IOWC = LOW' : 'IORC = LOW');

      switch (currentTState) {
        case 't1':
          return {
            ale: 'HIGH (Strobe Active from 8288)',
            den: 'HIGH (Disabled)',
            dtr: busDirection === 'write' ? 'HIGH (Transmit)' : 'HIGH (Turnaround)',
            busContent: accessTarget === 'memory' ? 'ADDRESS (A0 - A19)' : 'I/O PORT ADDR (A0 - A15)',
            rd_wr: s0_s2,
            statusDecode: `8288 Decodes S0-S2 -> ${accessTarget === 'memory' ? 'Memory' : 'I/O'} Cycle`,
            latchStatus: 'OPEN - LATCHING ADDRESS'
          };
        case 't2':
          return {
            ale: 'LOW (Locked)',
            den: 'LOW (Enabled from 8288)',
            dtr: busDirection === 'write' ? 'HIGH (Transmit)' : 'LOW (Receive)',
            busContent: busDirection === 'write' ? 'DATA (D0 - D15)' : `Hi-Z (Wait for ${accessTarget === 'memory' ? 'Memory' : 'I/O Chip'})`,
            rd_wr: `${activeCmd} (8288 Cmd Active)`,
            statusDecode: `8288 Asserts ${activeCmd.split(' ')[0]} Command`,
            latchStatus: 'LOCKED - HOLDING ADDRESS'
          };
        case 't3':
          return {
            ale: 'LOW (Locked)',
            den: 'LOW (Enabled)',
            dtr: busDirection === 'write' ? 'HIGH (Transmit)' : 'LOW (Receive)',
            busContent: busDirection === 'write' ? 'DATA (D0 - D15) Written' : 'DATA (D0 - D15) Read',
            rd_wr: `${activeCmd} (8288 Cmd Active)`,
            statusDecode: 'Data Transfer Active over D0-D15',
            latchStatus: 'LOCKED - HOLDING ADDRESS'
          };
        case 't4':
          return {
            ale: 'LOW (Inactive)',
            den: 'HIGH (Disabled)',
            dtr: 'HIGH (Default)',
            busContent: 'Float (Hi-Z)',
            rd_wr: 'S2,S1,S0 = 1,1,1 (Passive Status)',
            statusDecode: '8288 deasserts commands',
            latchStatus: 'LOCKED - STANDBY'
          };
        default:
          return {
            ale: 'LOW',
            den: 'HIGH (Inactive)',
            dtr: 'HIGH',
            busContent: 'Undefined/Idle',
            rd_wr: 'S2,S1,S0 = 1,1,1 (Passive)',
            statusDecode: 'Idle',
            latchStatus: 'STANDBY'
          };
      }
    }
  };

  const signals = getSignalState();

  const handleModeChange = (mode: 'minimum' | 'maximum') => {
    setOperatingEnv(mode);
    setSelectedChip('cpu');
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
      {/* Operating Mode Selector Banner */}
      <div className="bg-slate-900 text-white p-3 md:p-4 flex flex-col md:flex-row items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/20 border border-indigo-400/30 rounded-lg">
            <CpuIcon className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm md:text-base font-display font-bold text-white flex items-center gap-2">
              8086 System Environment Demonstrator
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-semibold">
                {operatingEnv === 'minimum' ? 'Single Processor' : 'Multi-Processor'}
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              {operatingEnv === 'minimum'
                ? 'Minimum Mode: MN/MX = +5V. CPU generates ALE, DEN, DT/R, M/IO, RD, WR directly.'
                : 'Maximum Mode: MN/MX = GND. CPU sends S0, S1, S2 status to 8288 Bus Controller.'}
            </p>
          </div>
        </div>

        {/* Toggle Mode Buttons */}
        <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700/80 shrink-0">
          <button
            onClick={() => handleModeChange('minimum')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              operatingEnv === 'minimum'
                ? 'bg-indigo-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Minimum Mode (+5V)
          </button>
          <button
            onClick={() => handleModeChange('maximum')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              operatingEnv === 'maximum'
                ? 'bg-indigo-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Maximum Mode (GND)
          </button>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-6 py-3 border-b border-slate-100 bg-slate-50/50 gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-semibold text-slate-800 font-display">
            {operatingEnv === 'minimum' ? 'Minimum Mode Hardware Circuit Flow' : 'Maximum Mode 8288 Bus Controller Architecture'}
          </span>
        </div>

        <div className="flex rounded-lg bg-slate-200/60 p-1 self-start sm:self-center">
          <button
            onClick={() => setActiveTab('flow')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'flow' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Interactive Schematic Flow
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'details' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Chip Connections Breakdown
          </button>
        </div>
      </div>

      <div className="flex-1 p-5 overflow-y-auto space-y-6">
        {activeTab === 'flow' ? (
          /* HARDWARE FLOW INTERACTIVE MAP */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Col: Interactive Circuit Block Visualizer */}
            <div className="lg:col-span-8 space-y-5">
              <div className="bg-slate-50 rounded-2xl border border-slate-150 p-5 space-y-5 relative">
                {/* Simulator States bar */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-200/60 pb-4 gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider block">Bus Cycle Stepper</span>
                    <span className="text-xs text-slate-700">Step through a <strong>{busDirection.toUpperCase()}</strong> cycle in <strong>{operatingEnv === 'minimum' ? 'Minimum Mode' : 'Maximum Mode'}</strong>:</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={accessTarget}
                      onChange={(e) => setAccessTarget(e.target.value as 'memory' | 'io')}
                      className="text-[11px] bg-white border border-slate-200 rounded px-2 py-1 font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="memory">Memory Access (M/IO = 1)</option>
                      <option value="io">I/O Device Access (M/IO = 0)</option>
                    </select>

                    <select
                      value={busDirection}
                      onChange={(e) => setBusDirection(e.target.value as 'read' | 'write')}
                      className="text-[11px] bg-white border border-slate-200 rounded px-2 py-1 font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="read">Read Operation ({accessTarget === 'io' ? 'IN' : 'READ'})</option>
                      <option value="write">Write Operation ({accessTarget === 'io' ? 'OUT' : 'WRITE'})</option>
                    </select>

                    <div className="flex items-center gap-1 bg-slate-200/50 p-1 rounded-lg">
                      {['idle', 't1', 't2', 't3', 't4'].map((state) => (
                        <button
                          key={state}
                          onClick={() => setCurrentTState(state as any)}
                          className={`px-2 py-1 text-[10px] font-mono font-bold rounded uppercase transition-all cursor-pointer ${
                            currentTState === state
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-300/40'
                          }`}
                        >
                          {state}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* VISUAL SCHEMATIC MAP */}
                <div className="relative min-h-[380px] border border-slate-200 rounded-xl bg-white p-5 overflow-x-auto">
                  {operatingEnv === 'minimum' ? (
                    /* MINIMUM MODE SCHEMATIC */
                    <div className="grid grid-cols-12 gap-y-10 gap-x-3 relative min-w-[600px] py-2">
                      {/* 1. 8284A Clock */}
                      <div 
                        onClick={() => setSelectedChip('clock')}
                        className={`col-span-3 border-2 p-3 rounded-xl cursor-pointer transition-all flex flex-col justify-between min-h-[100px] ${
                          selectedChip === 'clock' 
                            ? 'border-amber-500 bg-amber-50/40 shadow-xs' 
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold font-mono text-amber-600">8284A IC</span>
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs">Clock Generator</h4>
                          <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                            CLK: {currentTState !== 'idle' ? '5 MHz (Active)' : 'Standby'}
                          </p>
                        </div>
                      </div>

                      {/* Spacer Wire */}
                      <div className="col-span-1 flex flex-col justify-center items-center">
                        <div className="w-full h-0.5 bg-amber-200 relative">
                          <div className={`absolute w-1.5 h-1.5 rounded-full bg-amber-500 left-0 top-1/2 -translate-y-1/2 ${currentTState !== 'idle' ? 'animate-ping' : ''}`}></div>
                        </div>
                        <span className="text-[8px] font-mono text-slate-400 mt-0.5">CLK</span>
                      </div>

                      {/* 2. 8086 CPU (Min Mode) */}
                      <div 
                        onClick={() => setSelectedChip('cpu')}
                        className={`col-span-4 border-2 p-3.5 rounded-xl cursor-pointer transition-all flex flex-col justify-between min-h-[130px] relative ${
                          selectedChip === 'cpu' 
                            ? 'border-indigo-600 bg-indigo-50/40 shadow-xs' 
                            : 'border-slate-300 bg-slate-100/50 hover:bg-slate-50'
                        }`}
                      >
                        <div className="absolute top-2 right-2 bg-emerald-600 text-[8px] text-white font-mono px-1 py-0.5 rounded font-bold">
                          MN/MX = +5V (MIN)
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Cpu className="w-4 h-4 text-indigo-600" />
                          <span className="text-[10px] font-bold font-mono text-indigo-700">8086 CPU</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">Main Microprocessor</h4>
                          <span className="text-[8px] text-slate-400 block mt-0.5">Direct Controls: ALE, DEN, DT/R, M/IO, RD, WR</span>
                        </div>
                      </div>

                      {/* 3. Address Latches */}
                      <div className="col-span-4 flex flex-col justify-center">
                        <div 
                          onClick={() => setSelectedChip('latch')}
                          className={`border-2 p-3 rounded-xl cursor-pointer transition-all flex flex-col justify-between min-h-[100px] ${
                            selectedChip === 'latch' 
                              ? 'border-emerald-600 bg-emerald-50/40 shadow-xs' 
                              : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold font-mono text-emerald-600">8282 / 74LS373</span>
                            <span className={`text-[8px] font-mono font-bold px-1 py-0.2 rounded ${currentTState === 't1' ? 'bg-emerald-500 text-white animate-pulse' : 'bg-slate-200 text-slate-600'}`}>
                              STB = ALE
                            </span>
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-xs">Address Latches</h4>
                            <span className="text-[8px] text-slate-400 block">Latching State: {signals.latchStatus}</span>
                          </div>
                        </div>
                      </div>

                      {/* Spacer offset */}
                      <div className="col-span-4"></div>

                      {/* 4. Data Transceivers */}
                      <div 
                        onClick={() => setSelectedChip('transceiver')}
                        className={`col-span-4 border-2 p-3 rounded-xl cursor-pointer transition-all flex flex-col justify-between min-h-[100px] ${
                          selectedChip === 'transceiver' 
                            ? 'border-blue-600 bg-blue-50/40 shadow-xs' 
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold font-mono text-blue-600">8286 Transceiver</span>
                          <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded ${['t2', 't3'].includes(currentTState) ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                            OE = DEN
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs">Data Transceivers</h4>
                          <p className="text-[8px] text-slate-400 font-mono mt-0.5">
                            DIR (DT/R) = {signals.dtr}
                          </p>
                        </div>
                      </div>

                      {/* 5. Memory & IO */}
                      <div 
                        onClick={() => setSelectedChip('memory')}
                        className={`col-span-4 border-2 p-3 rounded-xl cursor-pointer transition-all flex flex-col justify-between min-h-[100px] ${
                          selectedChip === 'memory' 
                            ? 'border-purple-600 bg-purple-50/40 shadow-xs' 
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold font-mono text-purple-600 font-semibold">
                            {accessTarget === 'memory' ? '1 MB Memory Space' : '64 KB I/O Port Space'}
                          </span>
                          <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs">
                            {accessTarget === 'memory' ? 'RAM / ROM Memory Modules' : 'I/O Peripherals (8255 / 8253 / 8259)'}
                          </h4>
                          <p className="text-[8px] text-slate-500 block mt-0.5 font-mono">
                            M/IO Pin = {accessTarget === 'memory' ? '1 (HIGH)' : '0 (LOW)'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* MAXIMUM MODE SCHEMATIC */
                    <div className="grid grid-cols-12 gap-y-8 gap-x-3 relative min-w-[600px] py-2">
                      {/* Top Row: 8086 CPU (Max), 8288 Bus Controller, 8087 Math Coprocessor */}
                      <div 
                        onClick={() => setSelectedChip('cpu')}
                        className={`col-span-4 border-2 p-3.5 rounded-xl cursor-pointer transition-all flex flex-col justify-between min-h-[125px] relative ${
                          selectedChip === 'cpu' 
                            ? 'border-indigo-600 bg-indigo-50/40 shadow-xs' 
                            : 'border-slate-300 bg-slate-100/50 hover:bg-slate-50'
                        }`}
                      >
                        <div className="absolute top-2 right-2 bg-rose-600 text-[8px] text-white font-mono px-1 py-0.5 rounded font-bold">
                          MN/MX = GND (MAX)
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Cpu className="w-4 h-4 text-indigo-600" />
                          <span className="text-[10px] font-bold font-mono text-indigo-700">8086 CPU</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">CPU (Maximum Mode)</h4>
                          <span className="text-[8px] text-slate-500 block mt-0.5">Outputs: S0, S1, S2 Status Lines</span>
                        </div>
                      </div>

                      {/* 8288 Bus Controller */}
                      <div 
                        onClick={() => setSelectedChip('busController')}
                        className={`col-span-4 border-2 p-3.5 rounded-xl cursor-pointer transition-all flex flex-col justify-between min-h-[125px] relative ${
                          selectedChip === 'busController' 
                            ? 'border-purple-600 bg-purple-50/40 shadow-xs' 
                            : 'border-slate-300 bg-purple-50/20 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold font-mono text-purple-700">8288 IC</span>
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">8288 Bus Controller</h4>
                          <span className="text-[8px] text-slate-500 block mt-0.5">Decodes S0-S2 → MRDC, MWTC, IORC, IOWC, ALE, DEN</span>
                        </div>
                      </div>

                      {/* 8087 Math Coprocessor */}
                      <div 
                        onClick={() => setSelectedChip('coprocessor')}
                        className={`col-span-4 border-2 p-3.5 rounded-xl cursor-pointer transition-all flex flex-col justify-between min-h-[125px] relative ${
                          selectedChip === 'coprocessor' 
                            ? 'border-amber-600 bg-amber-50/40 shadow-xs' 
                            : 'border-slate-200 bg-amber-50/10 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold font-mono text-amber-700">8087 Coprocessor</span>
                          <Zap className="w-3.5 h-3.5 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">Math Co-Processor</h4>
                          <span className="text-[8px] text-slate-500 block mt-0.5">RQ/GT0 Handshake &amp; QS0/QS1 Queue Monitor</span>
                        </div>
                      </div>

                      {/* Bottom Row: 8282 Latches, 8286 Transceivers, Memory System */}
                      <div 
                        onClick={() => setSelectedChip('latch')}
                        className={`col-span-4 border-2 p-3 rounded-xl cursor-pointer transition-all flex flex-col justify-between min-h-[100px] ${
                          selectedChip === 'latch' 
                            ? 'border-emerald-600 bg-emerald-50/40 shadow-xs' 
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold font-mono text-emerald-600">8282 Latches</span>
                          <span className="text-[8px] font-mono font-bold bg-purple-100 text-purple-800 px-1 py-0.2 rounded">
                            STB = 8288 ALE
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs">Address Bus (A0-A19)</h4>
                          <span className="text-[8px] text-slate-400 block">Demultiplexed by 8288 ALE</span>
                        </div>
                      </div>

                      <div 
                        onClick={() => setSelectedChip('transceiver')}
                        className={`col-span-4 border-2 p-3 rounded-xl cursor-pointer transition-all flex flex-col justify-between min-h-[100px] ${
                          selectedChip === 'transceiver' 
                            ? 'border-blue-600 bg-blue-50/40 shadow-xs' 
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold font-mono text-blue-600">8286 Transceivers</span>
                          <span className="text-[8px] font-mono font-bold bg-purple-100 text-purple-800 px-1 py-0.2 rounded">
                            OE = 8288 DEN
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs">Data Bus (D0-D15)</h4>
                          <span className="text-[8px] text-slate-400 block">Gated by 8288 DEN &amp; DT/R</span>
                        </div>
                      </div>

                      <div 
                        onClick={() => setSelectedChip('memory')}
                        className={`col-span-4 border-2 p-3 rounded-xl cursor-pointer transition-all flex flex-col justify-between min-h-[100px] ${
                          selectedChip === 'memory' 
                            ? 'border-purple-600 bg-purple-50/40 shadow-xs' 
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold font-mono text-purple-600 font-semibold">Max System Bus</span>
                          <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs">Memory &amp; I/O Space</h4>
                          <span className="text-[8px] text-slate-400 block">Driven by 8288 MRDC / MWTC / IORC / IOWC</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Active Bus Content Overlay */}
                  {currentTState !== 'idle' && (
                    <div className="mt-3 text-center">
                      <span className="inline-block bg-indigo-50 border border-indigo-150 rounded px-2.5 py-1 text-[10px] font-mono font-bold text-indigo-700 shadow-2xs">
                        ACTIVE SYSTEM BUS CONTENT ({currentTState.toUpperCase()}): <span className="text-pink-600 font-extrabold">{signals.busContent}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Step Analysis and Signal values */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-3">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                  Active Signal Analysis ({operatingEnv === 'minimum' ? 'Minimum Mode' : 'Maximum Mode'} - {currentTState.toUpperCase()})
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 font-mono text-[9px] block">ALE Origin &amp; State</span>
                    <strong className="text-slate-800 font-mono text-[11px]">{signals.ale}</strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 font-mono text-[9px] block">
                      <span className="overline">DEN</span> Transceiver Enable
                    </span>
                    <strong className="text-slate-800 font-mono text-[11px]">{signals.den}</strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 font-mono text-[9px] block">DT/<span className="overline">R</span> Bus Direction</span>
                    <strong className="text-slate-800 font-mono text-[11px]">{signals.dtr}</strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200 col-span-2 sm:col-span-2">
                    <span className="text-slate-400 font-mono text-[9px] block">Active Control / Command Status</span>
                    <strong className="text-indigo-600 font-mono text-[11px] inline-flex items-center">
                      {formatActiveLowString(signals.rd_wr)}
                    </strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 font-mono text-[9px] block">System State Decode</span>
                    <strong className="text-emerald-700 text-[11px]">{signals.statusDecode}</strong>
                  </div>
                </div>

                {/* Plain-English behavioral description */}
                <div className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-150 mt-1">
                  {operatingEnv === 'minimum' ? (
                    <>
                      {currentTState === 'idle' && (
                        <span><strong>Minimum Mode Overview:</strong> Click T1–T4 above. The 8086 CPU directly controls latches (ALE), transceivers (DEN, DT/R), and memory commands (RD, WR, M/IO).</span>
                      )}
                      {currentTState === 't1' && (
                        <span><strong>T1 State (Address Phase):</strong> The 8086 drives physical memory address onto AD0–AD15 and pulses its own <strong>ALE high</strong> to lock address A0–A19 in the 8282 latches.</span>
                      )}
                      {currentTState === 't2' && (
                        <span><strong>T2 State (Control Phase):</strong> The CPU drops ALE low, asserts <strong>RD</strong> or <strong>WR</strong> low, and activates transceivers via <strong>DEN low</strong>.</span>
                      )}
                      {currentTState === 't3' && (
                        <span><strong>T3 State (Data Phase):</strong> Data transfers over D0–D15 through 8286 transceivers. Latches continue holding constant address A0–A19.</span>
                      )}
                      {currentTState === 't4' && (
                        <span><strong>T4 State (Completion Phase):</strong> RD/WR and DEN go high, releasing the data bus to high-impedance (Hi-Z).</span>
                      )}
                    </>
                  ) : (
                    <>
                      {currentTState === 'idle' && (
                        <span><strong>Maximum Mode Overview:</strong> Click T1–T4 above. The 8086 outputs status bits S0, S1, S2 to the <strong>8288 Bus Controller</strong>, which generates all memory and I/O command signals.</span>
                      )}
                      {currentTState === 't1' && (
                        <span><strong>T1 State (Status Decode):</strong> The 8086 drives status lines S0, S1, S2 to the 8288 Bus Controller. The 8288 decodes the status and issues <strong>ALE high</strong> to latch the physical address.</span>
                      )}
                      {currentTState === 't2' && (
                        <span><strong>T2 State (Command Generation):</strong> The 8288 asserts <strong>MRDC</strong> (Memory Read) or <strong>MWTC</strong> (Memory Write) low, and enables 8286 transceivers via <strong>DEN low</strong>.</span>
                      )}
                      {currentTState === 't3' && (
                        <span><strong>T3 State (Multi-Processor Data Phase):</strong> Data flows across D0–D15. The 8087 Math Co-Processor monitors queue status bits <strong>QS0, QS1</strong> in parallel.</span>
                      )}
                      {currentTState === 't4' && (
                        <span><strong>T4 State (Completion):</strong> The 8288 deasserts command lines (MRDC/MWTC) and DEN, returning status lines to passive state (1,1,1).</span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Col: Device Inspector Panel */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 h-full flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-slate-150">
                    <Info className="w-4 h-4 text-indigo-600" />
                    <span className="text-[11px] font-bold font-display uppercase text-slate-800 tracking-wider">Device Pin Inspector</span>
                  </div>

                  <div>
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">Selected Chip</span>
                    <h3 className="font-display font-extrabold text-slate-900 text-sm md:text-base leading-snug">
                      {selectedChipInfo.name}
                    </h3>
                    <span className="inline-block bg-indigo-50 text-indigo-700 text-[10px] font-mono px-2 py-0.5 rounded font-bold border border-indigo-150 mt-1">
                      {selectedChipInfo.chipModel}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 leading-relaxed pt-2">
                    <p>{selectedChipInfo.role}</p>
                  </div>

                  {/* Core Pin Connection Map */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold block">Key Circuit Connections</span>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {selectedChipInfo.connections.map((c, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0"></span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* INTERACTIVE PIN MULTIPLEXING DEMONSTRATOR */}
                  <div className="border border-slate-150 rounded-xl p-3 bg-slate-50 space-y-2.5 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono text-indigo-600 font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-500 animate-pulse" /> Pin Demultiplexing
                      </span>
                      <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-bold border border-indigo-150">
                        AD0 - AD15 Lines
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-normal">
                      <strong>Multiplexing Rule:</strong> Transmits <strong>Address</strong> during <strong>T1 state</strong>, transitioning to <strong>Data</strong> during <strong>T2–T4 states</strong>.
                    </p>

                    {/* Miniature Interactive T-State Cycle Stepper */}
                    <div className="grid grid-cols-5 gap-1 p-0.5 bg-slate-200/60 rounded-md">
                      {(['idle', 't1', 't2', 't3', 't4'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => setCurrentTState(st)}
                          className={`py-1 text-[9px] font-mono font-bold rounded uppercase transition-all text-center cursor-pointer ${
                            currentTState === st
                              ? 'bg-indigo-600 text-white shadow-3xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>

                    {/* Displaying raw visual pins AD0-AD15 */}
                    <div className="bg-white border border-slate-200 rounded-lg p-2.5">
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 text-center">
                        {Array.from({ length: 16 }, (_, i) => i).map((pinNum) => {
                          const isAddress = currentTState === 't1';
                          const isData = ['t2', 't3', 't4'].includes(currentTState);
                          return (
                            <div
                              key={pinNum}
                              className={`flex flex-col items-center justify-between p-1.5 rounded-lg border transition-all duration-200 ${
                                isAddress
                                  ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-2xs'
                                  : isData
                                  ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-2xs'
                                  : 'bg-slate-50 border-slate-200 text-slate-500'
                              }`}
                            >
                              <span className="text-[10px] font-mono font-bold tracking-tight">
                                AD{pinNum}
                              </span>
                              <span
                                className={`mt-1 text-[9px] font-mono font-extrabold px-1 py-0.5 rounded w-full ${
                                  isAddress
                                    ? 'bg-amber-200/80 text-amber-900'
                                    : isData
                                    ? 'bg-blue-200/80 text-blue-900'
                                    : 'bg-slate-200/80 text-slate-600'
                                }`}
                              >
                                {isAddress ? 'ADDR' : isData ? 'DATA' : 'Hi-Z'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exam Tip block */}
                <div className="bg-indigo-50/60 p-3 rounded-lg border border-indigo-100 mt-4 space-y-1">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-700 font-mono uppercase">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>University Exam Corner</span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                    {selectedChipInfo.examTip}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* CHIP BY CHIP PIN-LEVEL BREAKDOWN */
          <div className="space-y-5">
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-slate-800 text-sm">
                  {operatingEnv === 'minimum' ? 'Minimum Mode Chip Inventory' : 'Maximum Mode Chip Inventory'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Explore physical connections and role of support chips in {operatingEnv === 'minimum' ? 'Minimum Mode' : 'Maximum Mode'}.</p>
              </div>

              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800">
                {operatingEnv === 'minimum' ? '5 Core Chips' : '6 Core Chips (Includes 8288 & 8087)'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(chips).map((chip) => (
                <div key={chip.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-800 text-xs md:text-sm font-display">{chip.name}</strong>
                      <span className="text-[9px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-150">
                        {chip.chipModel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {chip.role}
                    </p>

                    <div className="border-t border-slate-100 pt-2 space-y-1">
                      <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">Wiring detail:</span>
                      <div className="text-[11px] text-slate-600 space-y-1">
                        {chip.connections.slice(0, 2).map((conn, idx) => (
                          <div key={idx} className="flex items-start gap-1">
                            <span className="text-indigo-600 font-bold font-mono">•</span>
                            <span>{conn}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50/40 p-2.5 rounded border border-indigo-100/60 text-[10px] text-slate-700 leading-relaxed">
                    <span className="font-bold text-indigo-700 font-mono block uppercase text-[9px] mb-0.5">Exam Quick Tip</span>
                    {chip.examTip}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
