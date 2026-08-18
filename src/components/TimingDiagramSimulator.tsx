import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Clock, 
  AlertCircle, 
  Cpu, 
  Layers, 
  Zap, 
  HelpCircle,
  Database,
  ArrowRightLeft,
  Binary
} from 'lucide-react';

type CycleType = 'mem_read' | 'mem_write' | 'io_read' | 'io_write';
type OperatingMode = 'MIN' | 'MAX';

interface CycleMeta {
  id: CycleType;
  label: string;
  category: 'Memory' | 'I/O';
  direction: 'Read' | 'Write';
  assemblyExample: string;
  assemblyDesc: string;
  mIoState: 'high' | 'low'; // HIGH for Memory, LOW for I/O
  mIoLabel: string;
  rdState: 'active' | 'inactive'; // active = LOW during T2-T3
  wrState: 'active' | 'inactive'; // active = LOW during T2-T3
  dtrState: 'low' | 'high'; // LOW (0) for Read, HIGH (1) for Write
  s2s1s0: string; // Status lines S2, S1, S0
  max8288Cmd: string; // MRDC#, MWTC#, IORC#, IOWC#
  busAddressSample: string;
  busDataSample: string;
  description: string;
  minActiveSignal: string;
}

const CYCLE_DATA: Record<CycleType, CycleMeta> = {
  mem_read: {
    id: 'mem_read',
    label: 'Memory Read',
    category: 'Memory',
    direction: 'Read',
    assemblyExample: 'MOV AX, [2000H]',
    assemblyDesc: 'Fetches 16-bit word operand from RAM/ROM physical address into register AX.',
    mIoState: 'high',
    mIoLabel: 'HIGH (+5V)',
    rdState: 'active',
    wrState: 'inactive',
    dtrState: 'low',
    s2s1s0: '1 0 1',
    max8288Cmd: 'MRDC#',
    busAddressSample: '0x20000 (Physical RAM)',
    busDataSample: '0x4F8A (Read Data)',
    description: 'Reads data from system RAM/ROM into internal 8086 registers or instruction prefetch queue.',
    minActiveSignal: 'RD# (Memory Read)'
  },
  mem_write: {
    id: 'mem_write',
    label: 'Memory Write',
    category: 'Memory',
    direction: 'Write',
    assemblyExample: 'MOV [2000H], AX',
    assemblyDesc: 'Stores 16-bit word from register AX into RAM at physical address DS:2000H.',
    mIoState: 'high',
    mIoLabel: 'HIGH (+5V)',
    rdState: 'inactive',
    wrState: 'active',
    dtrState: 'high',
    s2s1s0: '1 1 0',
    max8288Cmd: 'MWTC# / AMWC#',
    busAddressSample: '0x20000 (Physical RAM)',
    busDataSample: '0x1234 (Write Data)',
    description: 'Writes data from 8086 CPU registers into external system RAM memory.',
    minActiveSignal: 'WR# (Memory Write)'
  },
  io_read: {
    id: 'io_read',
    label: 'I/O Read (IN)',
    category: 'I/O',
    direction: 'Read',
    assemblyExample: 'IN AL, 64H',
    assemblyDesc: 'Reads 8-bit status or data byte from peripheral I/O port address 64H into register AL.',
    mIoState: 'low',
    mIoLabel: 'LOW (0V)',
    rdState: 'active',
    wrState: 'inactive',
    dtrState: 'low',
    s2s1s0: '0 0 1',
    max8288Cmd: 'IORC#',
    busAddressSample: '0x00064 (Port 64H)',
    busDataSample: '0x00FF (Port Input Data)',
    description: 'Reads input data from an external peripheral interface port (e.g. keyboard, timer) using the IN instruction.',
    minActiveSignal: 'RD# (I/O Read)'
  },
  io_write: {
    id: 'io_write',
    label: 'I/O Write (OUT)',
    category: 'I/O',
    direction: 'Write',
    assemblyExample: 'OUT 64H, AL',
    assemblyDesc: 'Outputs 8-bit command byte from register AL to peripheral I/O port address 64H.',
    mIoState: 'low',
    mIoLabel: 'LOW (0V)',
    rdState: 'inactive',
    wrState: 'active',
    dtrState: 'high',
    s2s1s0: '0 1 0',
    max8288Cmd: 'IOWC# / AIOWC#',
    busAddressSample: '0x00064 (Port 64H)',
    busDataSample: '0x00AE (Port Command Data)',
    description: 'Outputs command or data byte to an external peripheral interface port (e.g. display, motor controller) using the OUT instruction.',
    minActiveSignal: 'WR# (I/O Write)'
  }
};

export default function TimingDiagramSimulator() {
  const [cycleType, setCycleType] = useState<CycleType>('mem_read');
  const [opMode, setOpMode] = useState<OperatingMode>('MIN');
  const [includeWaitState, setIncludeWaitState] = useState<boolean>(false);
  const [currentTIndex, setCurrentTIndex] = useState<number>(0); // Index in tStates array
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const tStateList = includeWaitState 
    ? ['T1', 'T2', 'T3', 'Tw', 'T4'] as const
    : ['T1', 'T2', 'T3', 'T4'] as const;

  const currentTState = tStateList[currentTIndex] || 'T1';

  // Auto playback interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTIndex(prev => (prev + 1) % tStateList.length);
      }, 2200);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, tStateList.length]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const resetCycle = () => {
    setIsPlaying(false);
    setCurrentTIndex(0);
  };

  const activeMeta = CYCLE_DATA[cycleType];

  // Returns signal behavior for a given signal name at a given T-state
  const getSignalVisualProps = (signalName: string, state: string, isCurrent: boolean) => {
    let type: 'high' | 'low' | 'pulse' | 'address' | 'data' | 'float' = 'low';
    let labelText = '';

    if (signalName === 'CLK') {
      type = 'pulse';
    } else if (signalName === 'ALE') {
      type = state === 'T1' ? 'high' : 'low';
      labelText = state === 'T1' ? '1 (Latch)' : '0';
    } else if (signalName === 'AD0-AD15') {
      if (state === 'T1') {
        type = 'address';
        labelText = activeMeta.category === 'Memory' ? '20-bit Address' : '16-bit Port Addr';
      } else if (state === 'T2') {
        if (activeMeta.direction === 'Read') {
          type = 'float';
          labelText = 'Float (Turnaround)';
        } else {
          type = 'data';
          labelText = 'Data Valid';
        }
      } else if (state === 'T3' || state === 'Tw') {
        type = 'data';
        labelText = activeMeta.direction === 'Read' ? 'Data Read' : 'Data Written';
      } else {
        type = 'float';
        labelText = 'Float';
      }
    } else if (signalName === 'M/IO#') {
      type = activeMeta.mIoState;
      labelText = activeMeta.mIoState === 'high' ? '1 (Mem)' : '0 (I/O)';
    } else if (signalName === 'RD#') {
      if (activeMeta.rdState === 'active' && (state === 'T2' || state === 'T3' || state === 'Tw')) {
        type = 'low';
        labelText = '0 (Active Read)';
      } else {
        type = 'high';
        labelText = '1 (Inactive)';
      }
    } else if (signalName === 'WR#') {
      if (activeMeta.wrState === 'active' && (state === 'T2' || state === 'T3' || state === 'Tw')) {
        type = 'low';
        labelText = '0 (Active Write)';
      } else {
        type = 'high';
        labelText = '1 (Inactive)';
      }
    } else if (signalName === 'DT/R#') {
      type = activeMeta.dtrState;
      labelText = activeMeta.dtrState === 'high' ? '1 (Transmit)' : '0 (Receive)';
    } else if (signalName === 'DEN#') {
      if (state === 'T2' || state === 'T3' || state === 'Tw') {
        type = 'low';
        labelText = '0 (Buffer Enable)';
      } else {
        type = 'high';
        labelText = '1 (Disable)';
      }
    } else if (signalName === '8288 Cmd') {
      if (state === 'T2' || state === 'T3' || state === 'Tw') {
        type = 'low';
        labelText = `0 (${activeMeta.max8288Cmd})`;
      } else {
        type = 'high';
        labelText = '1 (Inactive)';
      }
    } else if (signalName === 'S2,S1,S0') {
      type = 'data';
      labelText = activeMeta.s2s1s0;
    }

    return { type, labelText };
  };

  // Render SVG waveform tile
  const renderWaveTile = (signalName: string, state: string, isCurrent: boolean) => {
    const { type, labelText } = getSignalVisualProps(signalName, state, isCurrent);

    let strokeColor = isCurrent ? '#6366f1' : '#cbd5e1';
    let pathD = 'M 0 20 L 100 20';
    let isBus = false;

    if (type === 'high') {
      strokeColor = isCurrent ? '#10b981' : '#94a3b8';
      pathD = 'M 0 8 L 100 8';
    } else if (type === 'low') {
      strokeColor = isCurrent ? '#ef4444' : '#cbd5e1';
      pathD = 'M 0 32 L 100 32';
    } else if (type === 'pulse') {
      strokeColor = isCurrent ? '#3b82f6' : '#94a3b8';
      pathD = 'M 0 32 L 0 8 L 50 8 L 50 32 L 100 32';
    } else if (type === 'float') {
      strokeColor = isCurrent ? '#64748b' : '#cbd5e1';
      pathD = 'M 0 20 L 100 20';
    } else if (type === 'address' || type === 'data') {
      isBus = true;
      strokeColor = type === 'address'
        ? (isCurrent ? '#6366f1' : '#818cf8')
        : (isCurrent ? '#f59e0b' : '#fbbf24');
    }

    return (
      <div className={`relative h-10 w-full transition-all overflow-hidden ${
        isCurrent ? 'bg-indigo-500/10 rounded-xs' : 'hover:bg-slate-50'
      }`}>
        {isBus ? (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
            <polygon points="0,20 8,6 92,6 100,20 92,34 8,34" fill="none" />
            <path
              d="M 0 20 L 8 6 L 92 6 L 100 20 M 0 20 L 8 34 L 92 34 L 100 20"
              stroke={strokeColor}
              strokeWidth="2"
              fill="none"
            />
          </svg>
        ) : (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
            <path
              d={pathD}
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={type === 'float' ? '4 3' : undefined}
              fill="none"
            />
          </svg>
        )}

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none px-1">
          {type === 'address' && (
            <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded ${
              isCurrent ? 'text-indigo-950 bg-white/90 shadow-2xs border border-indigo-200' : 'text-indigo-400'
            }`}>
              {labelText}
            </span>
          )}
          {type === 'data' && (
            <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded ${
              isCurrent ? 'text-amber-950 bg-white/90 shadow-2xs border border-amber-200' : 'text-amber-600'
            }`}>
              {labelText}
            </span>
          )}
          {type === 'float' && (
            <span className={`font-mono text-[9px] font-semibold px-1 py-0.5 rounded ${
              isCurrent ? 'text-slate-700 bg-white/90 border border-slate-200' : 'text-slate-400'
            }`}>
              {labelText}
            </span>
          )}
          {type === 'high' && (
            <span className={`font-mono text-[9px] font-bold absolute top-1 right-1.5 ${
              isCurrent ? 'text-emerald-700 font-extrabold' : 'text-slate-400'
            }`}>
              {labelText}
            </span>
          )}
          {type === 'low' && (
            <span className={`font-mono text-[9px] font-bold absolute bottom-1 right-1.5 ${
              isCurrent ? 'text-rose-600 font-extrabold' : 'text-slate-400'
            }`}>
              {labelText}
            </span>
          )}
          {type === 'pulse' && (
            <span className={`font-mono text-[9px] font-semibold absolute top-1 right-1.5 ${
              isCurrent ? 'text-blue-600 font-bold' : 'text-slate-400'
            }`}>
              CLK
            </span>
          )}
        </div>
      </div>
    );
  };

  // State hardware explanations
  const getTStateDescription = (state: string) => {
    switch (state) {
      case 'T1':
        return {
          title: 'T1 State: Address Latch Phase',
          detail: `CPU places target ${activeMeta.category === 'Memory' ? '20-bit Memory Address' : '16-bit I/O Port Address'} on multiplexed AD0–AD15 lines. Pin M/IO# is driven ${activeMeta.mIoLabel}. CPU pulses ALE HIGH to trigger external 8282 latches to freeze the address before bus turnaround.`,
          mIoNote: `M/IO# = ${activeMeta.mIoState === 'high' ? '1 (Memory Access)' : '0 (I/O Access)'}`,
          aleNote: 'ALE = 1 (Active Latch Pulse)',
          rdWrNote: 'RD# & WR# = 1 (Inactive)'
        };
      case 'T2':
        return {
          title: 'T2 State: Bus Turnaround & Control Strobe Activation',
          detail: `ALE drops LOW. CPU sets DT/R# = ${activeMeta.dtrState === 'high' ? '1 (Transmit Data to bus)' : '0 (Receive Data from bus)'} and asserts DEN# = LOW to enable 8286 transceivers. ${
            activeMeta.direction === 'Read'
              ? 'CPU floats AD0–AD15 bus to let external RAM/I/O device drive data lines, and asserts RD# = LOW.'
              : 'CPU outputs valid data onto AD0–AD15 bus, and asserts WR# = LOW.'
          }`,
          mIoNote: `M/IO# remains ${activeMeta.mIoLabel}`,
          aleNote: 'ALE = 0 (Latched)',
          rdWrNote: `${activeMeta.minActiveSignal} drops LOW (Active)`
        };
      case 'T3':
        return {
          title: 'T3 State: Data Transfer Phase',
          detail: `${
            activeMeta.direction === 'Read'
              ? 'External RAM or I/O device places valid data onto AD0–AD15 bus. CPU reads data into internal registers at end of T3.'
              : 'CPU holds valid data on AD0–AD15 bus while RAM or I/O device captures it under active WR# pulse.'
          } CPU checks READY pin. If READY is LOW (slow memory/peripheral), CPU inserts Wait states (Tw) before T4.`,
          mIoNote: `M/IO# = ${activeMeta.mIoLabel}`,
          aleNote: 'ALE = 0',
          rdWrNote: `${activeMeta.minActiveSignal} remains LOW (Active)`
        };
      case 'Tw':
        return {
          title: 'Tw State: Wait State (Inserted for Slow Memory / Peripherals)',
          detail: `Slow RAM chip or slow I/O peripheral pulled READY pin LOW. CPU freezes all bus control signals (ALE=0, ${activeMeta.minActiveSignal}=LOW, DEN#=LOW) for an additional clock period to grant the device required setup time.`,
          mIoNote: `M/IO# = ${activeMeta.mIoLabel}`,
          aleNote: 'ALE = 0',
          rdWrNote: `${activeMeta.minActiveSignal} holds LOW (Wait)`
        };
      case 'T4':
        return {
          title: 'T4 State: Bus Cycle Completion',
          detail: `Active control strobe (${activeMeta.minActiveSignal}) returns HIGH, concluding the transfer. DEN# returns HIGH to disable transceivers and isolate the bus. AD0–AD15 lines float back to idle state ready for the next machine cycle.`,
          mIoNote: `M/IO# returns to idle`,
          aleNote: 'ALE = 0',
          rdWrNote: 'RD# & WR# = 1 (Inactive)'
        };
      default:
        return { title: '', detail: '', mIoNote: '', aleNote: '', rdWrNote: '' };
    }
  };

  const activeTDesc = getTStateDescription(currentTState);

  // Active signals list based on Operating Mode
  const activeSignalList = opMode === 'MIN' 
    ? ['CLK', 'ALE', 'AD0-AD15', 'M/IO#', 'RD#', 'WR#', 'DT/R#', 'DEN#']
    : ['CLK', 'ALE', 'AD0-AD15', 'S2,S1,S0', '8288 Cmd', 'DT/R#', 'DEN#'];

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden font-sans">
      {/* Header bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50/80 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 font-mono flex items-center gap-2">
              8086 Machine Cycle Timing Explorer
            </h2>
            <p className="text-xs text-slate-500 font-sans">
              Compare Memory Read/Write & I/O Read/Write (IN / OUT) waveforms across T-states ($T_1–T_4$).
            </p>
          </div>
        </div>

        {/* Operating Mode Selector */}
        <div className="flex items-center gap-2 self-start lg:self-auto">
          <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">Mode:</span>
          <div className="inline-flex rounded-lg bg-slate-200/80 p-0.5 text-xs font-mono font-bold">
            <button
              onClick={() => setOpMode('MIN')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                opMode === 'MIN'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Minimum Mode (Direct Signals)
            </button>
            <button
              onClick={() => setOpMode('MAX')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                opMode === 'MAX'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Maximum Mode (8288 Bus Controller)
            </button>
          </div>
        </div>
      </div>

      {/* Cycle Type Navigation Tabs */}
      <div className="px-5 py-2.5 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {(['mem_read', 'mem_write', 'io_read', 'io_write'] as CycleType[]).map((type) => {
            const meta = CYCLE_DATA[type];
            const isSelected = cycleType === type;
            return (
              <button
                key={type}
                onClick={() => {
                  setCycleType(type);
                  setCurrentTIndex(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? meta.category === 'Memory'
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                      : 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${meta.category === 'Memory' ? 'bg-indigo-300' : 'bg-emerald-300'}`} />
                {meta.label}
              </button>
            );
          })}
        </div>

        {/* Assembly Example Badge */}
        <div className="bg-white px-3 py-1 rounded-lg border border-slate-200 text-xs font-mono flex items-center gap-2 shadow-2xs">
          <span className="text-slate-400 font-semibold">Assembly:</span>
          <span className="font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
            {activeMeta.assemblyExample}
          </span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex-1 p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-y-auto">
        {/* Left Timing Diagram Waveforms */}
        <div className="lg:col-span-8 bg-slate-50/60 rounded-xl border border-slate-200 p-4 flex flex-col justify-between space-y-3">
          <div>
            {/* Control Bar: Play / Reset / Wait State Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                  Waveform Timing Diagrams ({activeMeta.label})
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Wait state toggle */}
                <button
                  onClick={() => {
                    setIncludeWaitState(!includeWaitState);
                    setCurrentTIndex(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer ${
                    includeWaitState
                      ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {includeWaitState ? '✓ Wait State (Tw) Enabled' : '+ Add Wait State (Tw)'}
                </button>

                <button
                  onClick={togglePlay}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {isPlaying ? 'Pause' : 'Play Cycle'}
                </button>

                <button
                  onClick={resetCycle}
                  className="bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all border border-slate-200 cursor-pointer shadow-2xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>
            </div>

            {/* Waveform Signals Grid */}
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[500px]">
                {/* Column Headers (T-States) */}
                <div className="grid grid-cols-12 gap-0 mb-2 border-b border-slate-200 pb-1">
                  <div className="col-span-3 text-right pr-4 font-mono text-[10px] font-bold uppercase text-slate-400">
                    Signal Line
                  </div>
                  <div className="col-span-9 grid grid-cols-4 font-mono text-[11px] text-center font-bold">
                    {tStateList.map((state, idx) => (
                      <button
                        key={state}
                        onClick={() => {
                          setIsPlaying(false);
                          setCurrentTIndex(idx);
                        }}
                        className={`py-1 rounded-lg transition-all cursor-pointer font-mono font-extrabold ${
                          currentTState === state
                            ? state === 'Tw'
                              ? 'bg-amber-500 text-white shadow-2xs ring-2 ring-amber-300'
                              : 'bg-indigo-600 text-white shadow-2xs ring-2 ring-indigo-300'
                            : 'text-slate-600 hover:bg-slate-200/60'
                        }`}
                      >
                        {state}
                        {state === 'Tw' && <span className="text-[9px] block font-normal">(Wait)</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Signals Rows */}
                <div className="space-y-1.5">
                  {activeSignalList.map((sig) => (
                    <div key={sig} className="grid grid-cols-12 gap-0 items-center">
                      {/* Signal Name Label */}
                      <div className="col-span-3 text-right pr-3 font-mono text-[11px] font-bold text-slate-700 truncate">
                        {sig === 'M/IO#' && <span className="text-purple-700">M/IO#</span>}
                        {sig === 'RD#' && <span className={activeMeta.rdState === 'active' ? 'text-indigo-700' : 'text-slate-500'}>RD#</span>}
                        {sig === 'WR#' && <span className={activeMeta.wrState === 'active' ? 'text-emerald-700' : 'text-slate-500'}>WR#</span>}
                        {sig === '8288 Cmd' && <span className="text-purple-700 font-bold">{activeMeta.max8288Cmd}</span>}
                        {sig !== 'M/IO#' && sig !== 'RD#' && sig !== 'WR#' && sig !== '8288 Cmd' && sig}
                      </div>

                      {/* Signal Wave Tiles Across T-States */}
                      <div className="col-span-9 grid grid-cols-4 gap-0">
                        {tStateList.map((state, idx) => (
                          <div
                            key={state}
                            onClick={() => {
                              setIsPlaying(false);
                              setCurrentTIndex(idx);
                            }}
                            className="cursor-pointer"
                          >
                            {renderWaveTile(sig, state, currentTState === state)}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-start gap-2 text-xs text-slate-600 font-sans">
            <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <p>
              <strong>Interactive Tip:</strong> Click any T-state column ($T_1, T_2, T_3, T_w, T_4$) above to inspect hardware signal voltages and bus line states at that exact instant.
            </p>
          </div>
        </div>

        {/* Right Hardware Inspector Panel */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-2xs h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="text-[11px] font-mono font-bold uppercase text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200">
                  Inspecting State: {currentTState}
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {activeMeta.label}
                </span>
              </div>

              {/* T-state Detail Description */}
              <div className="mt-3 space-y-2">
                <h3 className="font-bold text-slate-900 font-mono text-xs">
                  {activeTDesc.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  {activeTDesc.detail}
                </p>
              </div>

              {/* Real-time Hardware Line Voltages */}
              <div className="mt-4 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 font-mono text-[11px]">
                <span className="font-bold text-slate-800 uppercase block text-[10px] tracking-wider border-b border-slate-200 pb-1">
                  Active Hardware Pin States ({currentTState})
                </span>

                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <div className="bg-white p-1.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[9px]">M/IO# Pin:</span>
                    <span className="font-bold text-purple-700">{activeTDesc.mIoNote}</span>
                  </div>

                  <div className="bg-white p-1.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[9px]">ALE Pin:</span>
                    <span className="font-bold text-slate-800">{activeTDesc.aleNote}</span>
                  </div>

                  <div className="bg-white p-1.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[9px]">Control Line:</span>
                    <span className="font-bold text-indigo-700">{activeTDesc.rdWrNote}</span>
                  </div>

                  <div className="bg-white p-1.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[9px]">Transceiver DT/R#:</span>
                    <span className="font-bold text-slate-800">
                      {activeMeta.dtrState === 'high' ? '1 (Transmit)' : '0 (Receive)'}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-2 rounded border border-slate-200 text-slate-700 space-y-1 mt-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bus Address:</span>
                    <span className="font-bold text-indigo-900">{activeMeta.busAddressSample}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bus Data:</span>
                    <span className="font-bold text-amber-800">{activeMeta.busDataSample}</span>
                  </div>
                  {opMode === 'MAX' && (
                    <div className="flex justify-between pt-1 border-t border-slate-100 text-purple-900">
                      <span>8288 Status (/S2,S1,S0):</span>
                      <span className="font-bold">{activeMeta.s2s1s0}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Assembly Instruction Note */}
            <div className="bg-indigo-50/70 p-3 rounded-lg border border-indigo-200 text-xs text-indigo-950 space-y-1 font-sans mt-3">
              <span className="font-bold font-mono text-[11px] block text-indigo-900">
                Instruction Context:
              </span>
              <p className="text-[11px] leading-snug">
                {activeMeta.assemblyDesc}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Matrix: Memory Read/Write vs I/O Read/Write */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2">
        <h3 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
          <Binary className="w-3.5 h-3.5 text-indigo-600" />
          8086 Bus Cycle Comparison Summary Matrix
        </h3>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 text-[11px]">
                <th className="p-2 font-bold">Bus Cycle Type</th>
                <th className="p-2 font-bold">Category</th>
                <th className="p-2 font-bold">M/IO# (Pin 28)</th>
                <th className="p-2 font-bold">Active Min Signal</th>
                <th className="p-2 font-bold">8288 Status (/S2,/S1,/S0)</th>
                <th className="p-2 font-bold">Max Mode 8288 Cmd</th>
                <th className="p-2 font-bold">Example Instruction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {(['mem_read', 'mem_write', 'io_read', 'io_write'] as CycleType[]).map((type) => {
                const meta = CYCLE_DATA[type];
                const isCurrent = cycleType === type;
                return (
                  <tr
                    key={type}
                    onClick={() => {
                      setCycleType(type);
                      setCurrentTIndex(0);
                    }}
                    className={`cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-indigo-50/90 font-bold text-indigo-950 border-l-4 border-l-indigo-600'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <td className="p-2 font-extrabold">{meta.label}</td>
                    <td className="p-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        meta.category === 'Memory' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {meta.category}
                      </span>
                    </td>
                    <td className="p-2">
                      <span className={`px-1.5 py-0.5 rounded ${
                        meta.mIoState === 'high' ? 'text-purple-700 bg-purple-50 font-bold' : 'text-amber-700 bg-amber-50 font-bold'
                      }`}>
                        {meta.mIoLabel}
                      </span>
                    </td>
                    <td className="p-2 text-indigo-700 font-bold">{meta.minActiveSignal}</td>
                    <td className="p-2 font-bold text-purple-900">{meta.s2s1s0}</td>
                    <td className="p-2 font-bold text-purple-700">{meta.max8288Cmd}</td>
                    <td className="p-2 font-bold text-slate-900 bg-slate-50">{meta.assemblyExample}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
