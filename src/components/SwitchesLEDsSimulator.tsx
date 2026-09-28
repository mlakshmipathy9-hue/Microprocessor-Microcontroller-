import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Zap,
  CheckCircle2,
  Cpu,
  Layers,
  Code,
  ArrowRight,
  Sparkles,
  Sliders,
  Copy,
  Check,
  RefreshCw,
  Activity,
  SlidersHorizontal,
  Info,
  Lightbulb,
  Radio,
  Clock,
  ShieldCheck,
  Calculator,
  Flame,
  ArrowDown
} from 'lucide-react';
import SwitchesLEDsSchematicDiagram from './SwitchesLEDsSchematicDiagram';

interface SwitchesLEDsSimulatorProps {
  initialTab?: 'circuit' | 'lab' | 'debounce' | 'resistor' | 'alp' | 'summary';
}

export default function SwitchesLEDsSimulator({ initialTab = 'circuit' }: SwitchesLEDsSimulatorProps) {
  const [activeTab, setActiveTab] = useState<'circuit' | 'lab' | 'debounce' | 'resistor' | 'alp' | 'summary'>(initialTab);

  // --- LAB SIMULATOR STATE ---
  // 8 DIP switches (true = CLOSED / Logic 0 if active-low, false = OPEN / Logic 1)
  const [switchStates, setSwitchStates] = useState<boolean[]>([
    false, false, false, false, false, false, false, false
  ]);
  const [switchLogic, setSwitchLogic] = useState<'active_low' | 'active_high'>('active_low'); // standard 8086 lab uses pull-up with switch to GND (active-low)
  const [ledDriveType, setLedDriveType] = useState<'common_cathode' | 'common_anode'>('common_cathode');
  const [ledColor, setLedColor] = useState<'red' | 'green' | 'amber' | 'blue'>('red');
  
  // Execution modes
  const [labMode, setLabMode] = useState<'mirror' | 'invert' | 'counter' | 'chaser' | 'switch_ctrl'>('mirror');
  const [counterValue, setCounterValue] = useState<number>(0);
  const [chaserIndex, setChaserIndex] = useState<number>(0);
  const [isAutoRunning, setIsAutoRunning] = useState<boolean>(true);
  const [simSpeedMs, setSimSpeedMs] = useState<number>(400);

  // CPU Step Pipeline State
  const [cpuStage, setCpuStage] = useState<'fetch' | 'read_in' | 'alu_op' | 'write_out'>('write_out');
  const [stepCounter, setStepCounter] = useState<number>(0);

  // Selected chip in schematic
  const [selectedChip, setSelectedChip] = useState<string | null>('8255');
  const [circuitSubView, setCircuitSubView] = useState<'eda' | 'block'>('eda');

  // Copy feedback for ALP code
  const [copiedAlpKey, setCopiedAlpKey] = useState<string | null>(null);

  // Interactive Resistor Calculator State
  const [calcVcc, setCalcVcc] = useState<number>(5.0);
  const [calcVf, setCalcVf] = useState<number>(2.0); // 2.0V for Red LED
  const [calcIfMa, setCalcIfMa] = useState<number>(10.0); // 10mA

  // Contact Bounce simulation toggle
  const [isSwitchBouncing, setIsSwitchBouncing] = useState<boolean>(true);
  const [bounceSampleCount, setBounceSampleCount] = useState<number>(0);

  // Calculate binary and hex values of switches
  // If active_low: switch CLOSED (true) connects to GND -> Logic 0; OPEN (false) pulled HIGH -> Logic 1
  // If active_high: switch CLOSED (true) connects to VCC -> Logic 1; OPEN (false) pulled LOW -> Logic 0
  const getSwitchBit = (isClosed: boolean): number => {
    if (switchLogic === 'active_low') {
      return isClosed ? 0 : 1;
    } else {
      return isClosed ? 1 : 0;
    }
  };

  const switchByteVal = switchStates.reduce((acc, isClosed, idx) => {
    return acc | (getSwitchBit(isClosed) << idx);
  }, 0);

  // Calculate LED output byte depending on lab mode
  let rawLedByteVal = 0;
  if (labMode === 'mirror') {
    rawLedByteVal = switchByteVal;
  } else if (labMode === 'invert') {
    rawLedByteVal = (~switchByteVal) & 0xFF;
  } else if (labMode === 'counter') {
    rawLedByteVal = counterValue & 0xFF;
  } else if (labMode === 'chaser') {
    rawLedByteVal = 1 << chaserIndex;
  } else if (labMode === 'switch_ctrl') {
    // SW0 = 1 (Up) / 0 (Down); SW1 = Pause / Run
    rawLedByteVal = counterValue & 0xFF;
  }

  // Common Cathode: logic 1 turns LED ON
  // Common Anode: logic 0 turns LED ON (sinking)
  const isLedOn = (bitIdx: number): boolean => {
    const bitVal = (rawLedByteVal >> bitIdx) & 1;
    if (ledDriveType === 'common_cathode') {
      return bitVal === 1;
    } else {
      return bitVal === 0;
    }
  };

  // Timer loop for counter and chaser modes
  useEffect(() => {
    if (!isAutoRunning) return;
    if (labMode !== 'counter' && labMode !== 'chaser' && labMode !== 'switch_ctrl') return;

    const interval = setInterval(() => {
      if (labMode === 'counter') {
        setCounterValue((prev) => (prev + 1) & 0xFF);
      } else if (labMode === 'chaser') {
        setChaserIndex((prev) => (prev + 1) % 8);
      } else if (labMode === 'switch_ctrl') {
        const sw0 = getSwitchBit(switchStates[0]); // 1 = UP, 0 = DOWN
        const sw1 = getSwitchBit(switchStates[1]); // 1 = RUN, 0 = PAUSE
        if (sw1 === 1) {
          setCounterValue((prev) => {
            if (sw0 === 1) return (prev + 1) & 0xFF;
            return (prev - 1 + 256) & 0xFF;
          });
        }
      }

      setStepCounter((c) => c + 1);
    }, simSpeedMs);

    return () => clearInterval(interval);
  }, [isAutoRunning, labMode, simSpeedMs, switchStates, switchLogic]);

  // Toggle single switch
  const toggleSwitch = (index: number) => {
    setSwitchStates((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
    setBounceSampleCount((c) => c + 1);
  };

  const setAllSwitches = (closed: boolean) => {
    setSwitchStates([closed, closed, closed, closed, closed, closed, closed, closed]);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAlpKey(key);
    setTimeout(() => setCopiedAlpKey(null), 2000);
  };

  // Calculator results
  const calcResistorOhms = Math.max(10, ((calcVcc - calcVf) / (calcIfMa / 1000)));
  const calcPowerMw = Math.pow(calcIfMa / 1000, 2) * calcResistorOhms * 1000;
  // standard resistor closest pick
  const standardResistors = [150, 180, 220, 270, 330, 390, 470, 560, 680, 1000];
  const closestResistor = standardResistors.reduce((prev, curr) => 
    Math.abs(curr - calcResistorOhms) < Math.abs(prev - calcResistorOhms) ? curr : prev
  );

  // LED Color mapping
  const ledGlowColors = {
    red: {
      on: 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.9)] border-red-300 text-white',
      off: 'bg-red-950/40 border-red-900/60 text-red-700/50',
      label: 'Red (Vf ≈ 1.8V - 2.0V)',
      hex: '#EF4444'
    },
    green: {
      on: 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.9)] border-emerald-300 text-white',
      off: 'bg-emerald-950/40 border-emerald-900/60 text-emerald-700/50',
      label: 'Green (Vf ≈ 2.1V - 2.4V)',
      hex: '#10B981'
    },
    amber: {
      on: 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.9)] border-amber-300 text-white',
      off: 'bg-amber-950/40 border-amber-900/60 text-amber-700/50',
      label: 'Amber / Yellow (Vf ≈ 2.0V - 2.2V)',
      hex: '#F59E0B'
    },
    blue: {
      on: 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.9)] border-blue-300 text-white',
      off: 'bg-blue-950/40 border-blue-900/60 text-blue-700/50',
      label: 'Blue (Vf ≈ 3.0V - 3.4V)',
      hex: '#3B82F6'
    }
  };

  return (
    <div id="switches-leds-container" className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                Switches &amp; Discrete LEDs Interfacing with 8086 via 8255 PPI
              </h2>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              id="tab-circuit"
              onClick={() => setActiveTab('circuit')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'circuit'
                  ? 'bg-white text-indigo-700 font-bold shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              Circuit Schematic &amp; Bus
            </button>
            <button
              id="tab-lab"
              onClick={() => setActiveTab('lab')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'lab'
                  ? 'bg-white text-indigo-700 font-bold shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Live Lab Simulator
            </button>
            <button
              id="tab-debounce"
              onClick={() => setActiveTab('debounce')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'debounce'
                  ? 'bg-white text-indigo-700 font-bold shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-rose-500" />
              Switch Debouncing
            </button>
            <button
              id="tab-resistor"
              onClick={() => setActiveTab('resistor')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'resistor'
                  ? 'bg-white text-indigo-700 font-bold shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-600" />
              Resistor &amp; Power Design
            </button>
            <button
              id="tab-alp"
              onClick={() => setActiveTab('alp')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'alp'
                  ? 'bg-white text-indigo-700 font-bold shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-blue-600" />
              8086 ALP Programs
            </button>
            <button
              id="tab-summary"
              onClick={() => setActiveTab('summary')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'summary'
                  ? 'bg-white text-indigo-700 font-bold shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Summary &amp; Rules
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: LIVE LAB SIMULATOR                                 */}
      {/* ======================================================== */}
      {activeTab === 'lab' && (
        <div className="space-y-6">
          {/* Schematic Quick Jump Banner */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-3.5 rounded-xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-indigo-950">Hardware Interfacing Circuit Schematic</div>
                <div className="text-[11px] text-indigo-700">Explore complete pin-level wiring between 8086 CPU, 74LS373, 74LS138, 8255A PPI, switches &amp; LEDs</div>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('circuit')}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>View Circuit Schematic</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Main Controls & Mode Selection */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 tracking-wider">
                  Operational Experiments
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display">
                  Select 8086 Interfacing Experiment Mode:
                </h3>
              </div>

              {/* Experiment Mode Pills */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'mirror', label: '1. Switch Mirroring (IN -> OUT)' },
                  { id: 'invert', label: '2. Inverted Logic (NOT AL)' },
                  { id: 'counter', label: '3. 8-Bit Binary Up Counter' },
                  { id: 'chaser', label: '4. Ring Counter / Chaser (ROL)' },
                  { id: 'switch_ctrl', label: '5. Switch-Gated Counter' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setLabMode(m.id as any);
                      if (m.id === 'counter') setCounterValue(0);
                      if (m.id === 'chaser') setChaserIndex(0);
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      labMode === m.id
                        ? 'bg-indigo-600 border-indigo-700 text-white shadow-xs font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Experiment Description Banner */}
            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  {labMode === 'mirror' && 'Reads 8 DIP switches from Port A (80H) via IN AL, 80H and immediately outputs to Port B (82H) via OUT 82H, AL.'}
                  {labMode === 'invert' && 'Reads switch states, performs ALU bitwise inversion (NOT AL), and drives LEDs at Port B (82H).'}
                  {labMode === 'counter' && '8086 increments an 8-bit register from 00H to FFH and displays the binary count pattern on the 8 LEDs.'}
                  {labMode === 'chaser' && 'Rotates a single HIGH bit through Port B pins using ROL AL, 1 creating a classic running LED chaser effect.'}
                  {labMode === 'switch_ctrl' && 'Interactive logic: SW0 = Count Direction (1=Up, 0=Down), SW1 = Enable/Pause, SW2-SW7 = Data.'}
                </span>
              </div>

              {(labMode === 'counter' || labMode === 'chaser' || labMode === 'switch_ctrl') && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsAutoRunning(!isAutoRunning)}
                    className="px-2.5 py-1 bg-white border border-indigo-200 text-indigo-700 rounded-lg font-bold text-xs flex items-center gap-1 hover:bg-indigo-100/60 transition-all cursor-pointer"
                  >
                    {isAutoRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    {isAutoRunning ? 'Pause' : 'Resume'}
                  </button>

                  <select
                    value={simSpeedMs}
                    onChange={(e) => setSimSpeedMs(Number(e.target.value))}
                    className="bg-white border border-indigo-200 text-indigo-800 text-xs rounded-lg px-2 py-1 font-mono focus:outline-none"
                  >
                    <option value={800}>Slow (800ms)</option>
                    <option value={400}>Medium (400ms)</option>
                    <option value={150}>Fast (150ms)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Hardware Configuration Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 border-t border-slate-100 font-mono">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-sans font-semibold">Switch Pull Configuration:</span>
                <button
                  onClick={() => setSwitchLogic('active_low')}
                  className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    switchLogic === 'active_low'
                      ? 'bg-slate-800 text-white font-bold border-slate-900'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Pull-Up (Active LOW)
                </button>
                <button
                  onClick={() => setSwitchLogic('active_high')}
                  className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    switchLogic === 'active_high'
                      ? 'bg-slate-800 text-white font-bold border-slate-900'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Pull-Down (Active HIGH)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-sans font-semibold">LED Wiring Topology:</span>
                <button
                  onClick={() => setLedDriveType('common_cathode')}
                  className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    ledDriveType === 'common_cathode'
                      ? 'bg-indigo-700 text-white font-bold border-indigo-800'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Common Cathode (Sourcing: 1=ON)
                </button>
                <button
                  onClick={() => setLedDriveType('common_anode')}
                  className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    ledDriveType === 'common_anode'
                      ? 'bg-indigo-700 text-white font-bold border-indigo-800'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Common Anode (Sinking: 0=ON)
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-sans font-semibold">LED Color:</span>
                {(['red', 'green', 'amber', 'blue'] as const).map((color) => (
                  <button
                    key={color}
                    onClick={() => setLedColor(color)}
                    className={`w-5 h-5 rounded-full border-2 transition-all cursor-pointer ${
                      ledColor === color ? 'border-slate-800 scale-110 shadow-xs' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: ledGlowColors[color].hex }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Hardware Board (Two Interactive Racks: DIP Switches -> 8255 -> Discrete LEDs) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Rack: 8-Position DIP Switch Input Unit (Port A - 80H) */}
            <div className="lg:col-span-6 bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block">
                      INPUT PORT A (Address: 80H)
                    </span>
                    <h4 className="text-sm font-bold font-display text-white">
                      8-Position DIP Switch Array
                    </h4>
                  </div>
                </div>

                {/* Switch Quick Setters */}
                <div className="flex items-center gap-1.5 text-[10px] font-mono">
                  <button
                    onClick={() => setAllSwitches(true)}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 cursor-pointer transition-all"
                  >
                    All Closed
                  </button>
                  <button
                    onClick={() => setAllSwitches(false)}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 cursor-pointer transition-all"
                  >
                    All Open
                  </button>
                </div>
              </div>

              {/* 8 Interactive DIP Switch Toggles */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 px-1">
                  <span>SW7 (MSB)</span>
                  <span>SW6</span>
                  <span>SW5</span>
                  <span>SW4</span>
                  <span>SW3</span>
                  <span>SW2</span>
                  <span>SW1</span>
                  <span>SW0 (LSB)</span>
                </div>

                <div className="grid grid-cols-8 gap-2">
                  {switchStates.slice().reverse().map((isClosed, revIdx) => {
                    const idx = 7 - revIdx;
                    const bitVal = getSwitchBit(isClosed);
                    return (
                      <div key={idx} className="flex flex-col items-center gap-2">
                        {/* Interactive DIP Rocker Body */}
                        <button
                          id={`dip-switch-${idx}`}
                          onClick={() => toggleSwitch(idx)}
                          className={`w-full h-16 rounded-lg border-2 flex flex-col justify-between p-1 transition-all cursor-pointer select-none ${
                            isClosed
                              ? 'bg-amber-600/90 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                              : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                          }`}
                        >
                          {/* Slider handle */}
                          <div className={`text-[9px] font-mono font-extrabold text-center rounded py-0.5 transition-all ${
                            isClosed ? 'bg-white text-amber-950 shadow' : 'text-slate-500'
                          }`}>
                            ON
                          </div>

                          <div className={`text-[9px] font-mono font-extrabold text-center rounded py-0.5 transition-all ${
                            !isClosed ? 'bg-slate-700 text-slate-200 shadow' : 'text-amber-900/60'
                          }`}>
                            OFF
                          </div>
                        </button>

                        {/* Logical Bit Readout */}
                        <div className="text-center font-mono">
                          <span className={`text-xs font-bold block ${
                            bitVal === 1 ? 'text-emerald-400' : 'text-slate-400'
                          }`}>
                            {bitVal}
                          </span>
                          <span className="text-[9px] text-slate-500 block">
                            {isClosed ? 'CLOSED' : 'OPEN'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Real-time Bus Values & Pull-Up Network Legend */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase block font-sans">
                    Port A Hex Value:
                  </span>
                  <div className="text-lg font-bold text-amber-400">
                    0x{switchByteVal.toString(16).toUpperCase().padStart(2, '0')}H
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Bin: {switchByteVal.toString(2).padStart(8, '0')}b
                  </div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1 text-[11px] text-slate-300">
                  <span className="text-[10px] text-slate-400 uppercase block font-sans">
                    Pull-Up Resistor Status:
                  </span>
                  <div>• Resistor: 8 × 10 kΩ SIP Array</div>
                  <div>• Logic Level: {switchLogic === 'active_low' ? 'Low (0V) on Closure' : 'High (+5V) on Closure'}</div>
                </div>
              </div>
            </div>

            {/* Right Rack: 8-Channel Discrete LED Output Unit (Port B - 82H) */}
            <div className="lg:col-span-6 bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                      OUTPUT PORT B (Address: 82H)
                    </span>
                    <h4 className="text-sm font-bold font-display text-white">
                      8-Channel Discrete LED Bar
                    </h4>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  Resistors: 8 × 330 Ω (Current Limiting)
                </div>
              </div>

              {/* 8 Discrete Physical LEDs with Real Glow */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 px-1">
                  <span>LED7 (MSB)</span>
                  <span>LED6</span>
                  <span>LED5</span>
                  <span>LED4</span>
                  <span>LED3</span>
                  <span>LED2</span>
                  <span>LED1</span>
                  <span>LED0 (LSB)</span>
                </div>

                <div className="grid grid-cols-8 gap-2">
                  {[7, 6, 5, 4, 3, 2, 1, 0].map((bitIdx) => {
                    const on = isLedOn(bitIdx);
                    const styleConfig = ledGlowColors[ledColor];
                    return (
                      <div key={bitIdx} className="flex flex-col items-center gap-2">
                        {/* Glowing LED Lens */}
                        <div
                          id={`led-indicator-${bitIdx}`}
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-150 ${
                            on ? styleConfig.on : styleConfig.off
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded-full transition-all ${
                            on ? 'bg-white opacity-80 scale-125' : 'bg-transparent'
                          }`} />
                        </div>

                        {/* Status Label */}
                        <div className="text-center font-mono">
                          <span className={`text-xs font-bold block ${
                            on ? 'text-white' : 'text-slate-500'
                          }`}>
                            {on ? 'ON' : 'OFF'}
                          </span>
                          <span className="text-[9px] text-slate-500 block">
                            PB{bitIdx}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Output Byte Value & Electrical Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase block font-sans">
                    Port B Output Byte:
                  </span>
                  <div className="text-lg font-bold text-emerald-400">
                    0x{rawLedByteVal.toString(16).toUpperCase().padStart(2, '0')}H
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Bin: {rawLedByteVal.toString(2).padStart(8, '0')}b
                  </div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1 text-[11px] text-slate-300">
                  <span className="text-[10px] text-slate-400 uppercase block font-sans">
                    Circuit Operating Conditions:
                  </span>
                  <div>• Vcc = +5.0 V DC, VF ≈ 2.0 V</div>
                  <div>• Forward Current IF ≈ 9.1 mA / LED</div>
                  <div>• Drive Mode: {ledDriveType === 'common_cathode' ? 'Current Sourcing' : 'Current Sinking'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 8086 Instruction & Register Execution Trace */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-display">
                  8086 Real-Time CPU Register File &amp; Bus Cycles
                </h4>
              </div>
              <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded border border-indigo-200">
                8255 Control Word = 90H (Mode 0: PA=In, PB=Out, PC=Out)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase text-slate-500 font-sans block">AL Register (Data):</span>
                <span className="text-sm font-bold text-slate-900">
                  0x{rawLedByteVal.toString(16).toUpperCase().padStart(2, '0')}H ({rawLedByteVal})
                </span>
                <span className="text-[10px] text-slate-500 block">Accumulator Lower Byte</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase text-slate-500 font-sans block">DX Register (I/O Port):</span>
                <span className="text-sm font-bold text-indigo-700">
                  0082H (Port B) / 0080H
                </span>
                <span className="text-[10px] text-slate-500 block">16-bit I/O Address Pointer</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase text-slate-500 font-sans block">Control Port (86H):</span>
                <span className="text-sm font-bold text-emerald-700">90H (10010000b)</span>
                <span className="text-[10px] text-slate-500 block">Mode 0 Basic I/O Config</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase text-slate-500 font-sans block">Bus Transfer Activity:</span>
                <span className="text-xs font-bold text-amber-700">
                  {labMode === 'mirror' ? 'IN AL, 80H -> OUT 82H, AL' : labMode === 'invert' ? 'IN -> NOT AL -> OUT' : 'INC AL -> OUT 82H, AL'}
                </span>
                <span className="text-[10px] text-slate-500 block">Bus Cycle: I/O Read / Write</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: CIRCUIT SCHEMATIC & BUS INTERFACE                 */}
      {/* ======================================================== */}
      {activeTab === 'circuit' && (
        <div className="space-y-6">
          {/* Sub-view switcher bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Display View:</span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  onClick={() => setCircuitSubView('eda')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-semibold cursor-pointer ${
                    circuitSubView === 'eda'
                      ? 'bg-white text-indigo-700 font-bold shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Complete EDA Circuit Schematic
                </button>
                <button
                  onClick={() => setCircuitSubView('block')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-semibold cursor-pointer ${
                    circuitSubView === 'block'
                      ? 'bg-white text-indigo-700 font-bold shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  Bus Flow &amp; IC Inspector
                </button>
              </div>
            </div>
            <span className="text-[11px] text-slate-500 font-mono hidden md:inline">
              8086 CPU ⇄ 74LS373 ⇄ 74LS138 ⇄ 8255A PPI ⇄ Switches &amp; LEDs
            </span>
          </div>

          {circuitSubView === 'eda' ? (
            <SwitchesLEDsSchematicDiagram
              initialSwitches={switchStates.map(s => s ? 0 : 1)}
              initialLedDrive={ledDriveType}
            />
          ) : (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 tracking-wider">
                    Hardware Architecture
                  </span>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Complete 8086-8255 Switches &amp; LEDs Interfacing Circuit Diagram
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  Click any IC block below to inspect hardware pins and wiring!
                </span>
              </div>

              {/* Interactive Schematic Stage (SVG / CSS Blueprint) */}
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-white space-y-6 overflow-x-auto">
                {/* Block Diagram Flow: 8086 -> 74LS373 & 74LS138 -> 8255 PPI -> Switches & LEDs */}
                <div className="min-w-[760px] grid grid-cols-12 gap-3 items-center relative">
                  
                  {/* Block 1: 8086 Microprocessor */}
                  <div
                    onClick={() => setSelectedChip('8086')}
                    className={`col-span-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedChip === '8086'
                        ? 'bg-blue-950/80 border-blue-400 ring-2 ring-blue-500/30'
                        : 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div className="text-[10px] font-mono text-blue-400 font-bold uppercase">Master CPU</div>
                    <div className="text-sm font-bold font-display mt-0.5">Intel 8086</div>
                    <div className="text-[10px] text-slate-400 mt-2 space-y-0.5 font-mono">
                      <div>• AD0–AD7: Multiplexed Bus</div>
                      <div>• A8–A15: Upper Address</div>
                      <div>• ALE: Address Latch Enable</div>
                      <div>• M/IO, RD, WR: Control Bus</div>
                    </div>
                  </div>

                  {/* Arrow 1 */}
                  <div className="col-span-1 flex flex-col items-center justify-center text-slate-500">
                    <span className="text-[9px] font-mono text-slate-400">ALE / AD</span>
                    <ArrowRight className="w-5 h-5 text-indigo-400" />
                  </div>

                  {/* Block 2: Demux & Decoder */}
                  <div className="col-span-3 space-y-2">
                    <div
                      onClick={() => setSelectedChip('74LS373')}
                      className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedChip === '74LS373'
                          ? 'bg-purple-950/80 border-purple-400 ring-2 ring-purple-500/30'
                          : 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <div className="text-[10px] font-mono text-purple-400 font-bold">74LS373 Octal Latch</div>
                      <div className="text-[10px] text-slate-300">Latches A0–A1 on ALE falling edge</div>
                    </div>

                    <div
                      onClick={() => setSelectedChip('74LS138')}
                      className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedChip === '74LS138'
                          ? 'bg-amber-950/80 border-amber-400 ring-2 ring-amber-500/30'
                          : 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <div className="text-[10px] font-mono text-amber-400 font-bold">74LS138 Decoder</div>
                      <div className="text-[10px] text-slate-300">Decodes A2–A7 &amp; M/IO to assert CS = 80H</div>
                    </div>
                  </div>

                  {/* Arrow 2 */}
                  <div className="col-span-1 flex flex-col items-center justify-center text-slate-500">
                    <span className="text-[9px] font-mono text-slate-400">CS, A0, A1</span>
                    <ArrowRight className="w-5 h-5 text-indigo-400" />
                  </div>

                  {/* Block 3: 8255 PPI */}
                  <div
                    onClick={() => setSelectedChip('8255')}
                    className={`col-span-4 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedChip === '8255'
                        ? 'bg-indigo-950/80 border-indigo-400 ring-2 ring-indigo-500/30'
                        : 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div className="text-[10px] font-mono text-indigo-400 font-bold uppercase">Programmable I/O</div>
                    <div className="text-sm font-bold font-display mt-0.5">Intel 8255 PPI</div>
                    <div className="text-[10px] text-slate-300 mt-2 space-y-1 font-mono">
                      <div className="text-amber-400 font-bold">• Port A (80H): 8-bit INPUT (Switches)</div>
                      <div className="text-emerald-400 font-bold">• Port B (82H): 8-bit OUTPUT (LEDs)</div>
                      <div>• Control Port (86H): CW = 90H</div>
                      <div>• Mode 0 (Basic Parallel I/O)</div>
                    </div>
                  </div>
                </div>

                {/* Peripheral Connection Layer */}
                <div className="min-w-[760px] grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                  {/* Switches Branch */}
                  <div
                    onClick={() => setSelectedChip('switches')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedChip === 'switches'
                        ? 'bg-amber-950/40 border-amber-400'
                        : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono mb-2">
                      <span className="text-amber-400 font-bold">Port A (PA0–PA7) → 8 DIP Switches</span>
                      <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-400">INPUT</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Connected to 8 SPST toggle switches. Each pin has a <strong>10 kΩ pull-up resistor</strong> to +5V Vcc. When switch is OPEN, pin is pulled HIGH (1); when switch is CLOSED to ground, pin drops to LOW (0).
                    </p>
                  </div>

                  {/* LEDs Branch */}
                  <div
                    onClick={() => setSelectedChip('leds')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedChip === 'leds'
                        ? 'bg-emerald-950/40 border-emerald-400'
                        : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono mb-2">
                      <span className="text-emerald-400 font-bold">Port B (PB0–PB7) → 74LS244 Driver → 8 LEDs</span>
                      <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-400">OUTPUT</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Connected through a <strong>74LS244 Octal Buffer / Line Driver</strong> and an <strong>8 × 330 Ω resistor network</strong>. The buffer is essential because the 8255 NMOS outputs can only source ~0.4 mA, whereas standard LEDs require ~10 mA. The 74LS244 supplies up to 24 mA sinking / 15 mA sourcing without overloading the 8255.
                    </p>
                  </div>
                </div>
              </div>

              {/* Chip Detail Inspector */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-indigo-700 block">
                  Hardware Block Deep-Dive: {selectedChip?.toUpperCase()}
                </span>

                {selectedChip === '8086' && (
                  <div className="space-y-1.5 leading-relaxed text-slate-700">
                    <p><strong>Role in System:</strong> Acts as the bus master. Generates bus cycles to configure the 8255, read the DIP switch binary states into register AL via <code>IN AL, 80H</code>, process logic in the ALU, and output results to the LEDs via <code>OUT 82H, AL</code>.</p>
                    <p><strong>Control Lines:</strong> <code>M/IO = 0</code> indicates I/O port cycle. <code>RD = 0</code> triggers I/O read; <code>WR = 0</code> triggers I/O write. <code>ALE</code> pulses HIGH in T1 to latch address lines.</p>
                  </div>
                )}

                {selectedChip === '74LS373' && (
                  <div className="space-y-1.5 leading-relaxed text-slate-700">
                    <p><strong>Demultiplexing Function:</strong> 8086 multiplexes address and data lines on AD0–AD15. The 74LS373 captures lines AD0 and AD1 on the falling edge of ALE (Address Latch Enable), feeding them continuously into 8255 port select pins A0 and A1 throughout T2–T4 clock states.</p>
                    <p><strong>Port Mapping:</strong> A1 A0 = 00b (Port A: 80H), 01b (Port B: 82H), 10b (Port C: 84H), 11b (Control Register: 86H).</p>
                  </div>
                )}

                {selectedChip === '74LS138' && (
                  <div className="space-y-1.5 leading-relaxed text-slate-700">
                    <p><strong>Address Decoding Stage:</strong> The 3-to-8 line decoder decodes upper address lines (A2–A7) together with <code>M/IO = 0</code>. When the CPU executes an I/O instruction in the address range 80H–87H, output Y0 asserts active-LOW, driving the 8255 <code>CS</code> (Pin 6) LOW.</p>
                  </div>
                )}

                {selectedChip === '8255' && (
                  <div className="space-y-1.5 leading-relaxed text-slate-700">
                    <p><strong>Control Word Formulation (90H):</strong></p>
                    <ul className="list-disc pl-5 space-y-0.5 font-mono text-[11px]">
                      <li>D7 = 1 (Mode Set active)</li>
                      <li>D6:D5 = 00 (Group A in Mode 0 - Basic I/O)</li>
                      <li>D4 = 1 (Port A = INPUT for DIP Switches)</li>
                      <li>D3 = 0 (Port C Upper = OUTPUT)</li>
                      <li>D2 = 0 (Group B in Mode 0)</li>
                      <li>D1 = 0 (Port B = OUTPUT for Discrete LEDs)</li>
                      <li>D0 = 0 (Port C Lower = OUTPUT)</li>
                      <li>Result: 1001 0000b = <strong>90H</strong></li>
                    </ul>
                  </div>
                )}

                {selectedChip === 'switches' && (
                  <div className="space-y-1.5 leading-relaxed text-slate-700">
                    <p><strong>Why 10 kΩ Pull-Up Resistors are Essential:</strong> When a mechanical switch is open, the input pin would float in a high-impedance (tri-state) floating condition, causing erratic logic transitions from ambient electromagnetic noise. The 10 kΩ resistor pulls the line securely to +5V (Logic 1). When the switch closes to ground, current flows through the resistor (5V / 10k = 0.5 mA) and the pin drops cleanly to 0V (Logic 0).</p>
                  </div>
                )}

                {selectedChip === 'leds' && (
                  <div className="space-y-2 leading-relaxed text-slate-700">
                    <p><strong>Why a Driver (74LS244) is Required vs. Why Textbooks Omit It:</strong></p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono bg-white p-2.5 rounded-lg border border-slate-200">
                      <div className="text-amber-800 bg-amber-50 p-2 rounded">
                        <strong className="block text-amber-900 font-sans">1. 8255 Drive Capability:</strong>
                        • IOH (Sourcing): -0.4 mA (Collapses under 10mA LED!)<br/>
                        • IOL (Sinking): 1.7 mA to 3.2 mA max<br/>
                        • Result: Overloads chip if driven directly.
                      </div>
                      <div className="text-emerald-800 bg-emerald-50 p-2 rounded">
                        <strong className="block text-emerald-900 font-sans">2. 74LS244 Driver Solution:</strong>
                        • Input current: &lt; 20 µA (Negligible load on 8255)<br/>
                        • Sinking capability: 24 mA per channel<br/>
                        • Sourcing capability: 15 mA per channel
                      </div>
                    </div>
                    <p className="text-[11px]">
                      <strong>Academic Simplification:</strong> Classroom textbooks omit the buffer to keep schematic diagrams uncluttered while teaching I/O addresses and instructions. All real-world 8086 hardware trainer kits and industrial controllers include the 74LS244 or ULN2803 driver.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: SWITCH DEBOUNCING & ELECTRICAL PHENOMENA          */}
      {/* ======================================================== */}
      {activeTab === 'debounce' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-mono font-bold uppercase text-rose-600 tracking-wider">
                Electrical Engineering Insights
              </span>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Mechanical Switch Contact Bounce &amp; Debouncing Techniques
              </h3>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              When a mechanical switch or push-button is pressed or released, the physical spring contacts do not make instantaneous clean electrical connection. Instead, they literally bounce against each other for <strong>5 ms to 20 ms</strong> before settling. To a fast microprocessor running at millions of cycles per second, each bounce appears as an independent keypress!
            </p>

            {/* Bounce vs Clean Waveform Visualizer */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 text-white space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-amber-400 font-bold">Oscilloscope Transient Waveforms:</span>
                <button
                  onClick={() => setIsSwitchBouncing(!isSwitchBouncing)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 font-mono text-[11px] cursor-pointer transition-all"
                >
                  {isSwitchBouncing ? 'View Clean Settled State' : 'Trigger New Bounce Transient'}
                </button>
              </div>

              {/* Waveform 1: Raw Bouncing Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="text-rose-400 font-bold">1. Raw Signal from Switch Contact (Spurious Bounces):</span>
                  <span className="text-rose-400 font-bold">CPU registers 6 to 12 false triggers!</span>
                </div>
                <div className="h-16 bg-slate-950 rounded-xl border border-rose-900/60 p-2 relative flex items-center overflow-hidden">
                  {/* Visual SVG waveform */}
                  <svg className="w-full h-full" viewBox="0 0 500 50" preserveAspectRatio="none">
                    {/* +5V level */}
                    <line x1="0" y1="10" x2="100" y2="10" stroke="#EF4444" strokeWidth="2" />
                    {/* Bounces between 100 and 260 */}
                    <path
                      d="M 100 10 L 110 40 L 125 10 L 140 40 L 150 15 L 165 40 L 175 10 L 190 40 L 205 12 L 220 40 L 235 15 L 250 40 L 260 40 L 500 40"
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="2"
                    />
                  </svg>
                  <span className="absolute right-3 bottom-1.5 text-[9px] font-mono text-rose-400">
                    Bouncing Period: ~15 ms
                  </span>
                </div>
              </div>

              {/* Waveform 2: Debounced Signal */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="text-emerald-400 font-bold">2. Debounced Signal (After Hardware Filter / 20ms Software Delay):</span>
                  <span className="text-emerald-400 font-bold">Exactly 1 clean transition</span>
                </div>
                <div className="h-16 bg-slate-950 rounded-xl border border-emerald-900/60 p-2 relative flex items-center overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 500 50" preserveAspectRatio="none">
                    <line x1="0" y1="10" x2="180" y2="10" stroke="#10B981" strokeWidth="2" />
                    <line x1="180" y1="10" x2="180" y2="40" stroke="#10B981" strokeWidth="2" />
                    <line x1="180" y1="40" x2="500" y2="40" stroke="#10B981" strokeWidth="2" />
                  </svg>
                  <span className="absolute right-3 bottom-1.5 text-[9px] font-mono text-emerald-400">
                    Clean Logic Low (0V)
                  </span>
                </div>
              </div>
            </div>

            {/* Debouncing Solutions Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Method A: Hardware Debouncing */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-indigo-900 font-display text-sm block">
                  A. Hardware Debouncing Approaches
                </span>
                <ul className="space-y-2 text-slate-700 leading-relaxed">
                  <li>
                    <strong>1. RC Filter with Schmitt Trigger (74LS14):</strong> A resistor-capacitor low-pass filter (R ≈ 10 kΩ, C ≈ 0.1 µF, time constant τ = RC ≈ 1 ms) smooths out voltage spikes, and the Schmitt trigger inverts with hysteresis to prevent oscillation.
                  </li>
                  <li>
                    <strong>2. SR Latch (NAND/NOR Gates):</strong> Uses an SPDT (Single Pole Double Throw) switch. When the contact hits the throw, the flip-flop latches immediately on the first contact and ignores subsequent bounces on that side.
                  </li>
                </ul>
              </div>

              {/* Method B: Software Debouncing */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-indigo-900 font-display text-sm block">
                  B. Software Debouncing (Industry Standard)
                </span>
                <p className="text-slate-700 leading-relaxed">
                  Software debouncing eliminates the extra hardware components and cost. The 8086 uses a simple 20 ms delay loop after detecting any state change:
                </p>
                <pre className="bg-slate-900 text-emerald-300 p-2.5 rounded-lg font-mono text-[11px] overflow-x-auto leading-normal">
{`; --- 8086 Software Debounce Routine ---
CHK_KEY:
  IN AL, 80H       ; Read switch state
  CMP AL, 0FFH     ; Check if switch pressed
  JZ CHK_KEY       ; If not pressed, keep waiting
  CALL DELAY_20MS  ; Wait 20 ms for bounce to settle!
  IN AL, 80H       ; Re-read port to verify stable state
  CMP AL, 0FFH     ; Still pressed?
  JZ CHK_KEY       ; If false alarm, return
  ; Key press confirmed! Proceed to action.`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: CURRENT-LIMITING RESISTOR & POWER DESIGN          */}
      {/* ======================================================== */}
      {activeTab === 'resistor' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-600 tracking-wider">
                Laboratory Component Sizing
              </span>
              <h3 className="text-base font-bold text-slate-900 font-display">
                LED Current-Limiting Resistor &amp; Power Dissipation Calculator
              </h3>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              Use Ohm's Law to calculate the exact current-limiting series resistor required between the 8255 PPI output pins and discrete LEDs:
            </p>

            {/* Formula Card */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 font-mono text-xs text-emerald-950 flex flex-col sm:flex-row items-center justify-around gap-4 text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Governing Equation:</span>
                <span className="text-base font-bold">R = (Vcc - VF) / IF</span>
              </div>
              <div className="border-l border-emerald-200 pl-4">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Power Dissipation:</span>
                <span className="text-base font-bold">P = IF² × R</span>
              </div>
            </div>

            {/* Interactive Calculator Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Supply Voltage (Vcc):</span>
                  <span className="font-mono text-indigo-700">{calcVcc.toFixed(1)} V</span>
                </div>
                <input
                  type="range"
                  min="3.3"
                  max="5.0"
                  step="0.1"
                  value={calcVcc}
                  onChange={(e) => setCalcVcc(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block">Standard TTL/8086 system Vcc = 5.0V</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>LED Forward Drop (VF):</span>
                  <span className="font-mono text-indigo-700">{calcVf.toFixed(1)} V</span>
                </div>
                <input
                  type="range"
                  min="1.8"
                  max="3.4"
                  step="0.1"
                  value={calcVf}
                  onChange={(e) => setCalcVf(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block">Red=1.8V, Green=2.2V, Blue=3.2V</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Desired Forward Current (IF):</span>
                  <span className="font-mono text-indigo-700">{calcIfMa.toFixed(1)} mA</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="20"
                  step="1"
                  value={calcIfMa}
                  onChange={(e) => setCalcIfMa(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block">8255 port pin rated ~1.6mA - 10mA max</span>
              </div>
            </div>

            {/* Calculated Output Results */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-200 text-indigo-950 space-y-1">
                <span className="text-[10px] uppercase font-bold text-indigo-700 font-sans block">Exact Calculated Resistance:</span>
                <div className="text-xl font-bold font-mono text-indigo-900">{calcResistorOhms.toFixed(1)} Ω</div>
                <span className="text-[10px] text-slate-500 block">Theoretical Ohm value</span>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-700 font-sans block">Standard Commercial Value (E24):</span>
                <div className="text-xl font-bold font-mono text-emerald-900">{closestResistor} Ω</div>
                <span className="text-[10px] text-slate-500 block">Standard lab stock resistor</span>
              </div>

              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-700 font-sans block">Resistor Power Rating:</span>
                <div className="text-xl font-bold font-mono text-amber-900">{calcPowerMw.toFixed(1)} mW</div>
                <span className="text-[10px] text-slate-500 block">Standard 1/4 Watt (250 mW) is safe</span>
              </div>
            </div>

            {/* Current Sinking vs Current Sourcing on 8255 PPI */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-800 space-y-2">
              <div className="font-bold text-slate-900 font-display text-sm flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-600" />
                Critical Hardware Note: Current Sinking vs. Current Sourcing in 8255
              </div>
              <p className="leading-relaxed text-slate-700">
                In classic Intel NMOS/CMOS 8255 PPI chips:
              </p>
              <ul className="list-disc pl-5 space-y-1 leading-relaxed text-slate-700">
                <li>
                  <strong>Sourcing Capability (IOH):</strong> An 8255 output pin driving HIGH (+5V) can only source approximately <strong>1.6 mA</strong> of current before its voltage droops significantly below TTL HIGH threshold.
                </li>
                <li>
                  <strong>Sinking Capability (IOL):</strong> An 8255 output pin driving LOW (0V) can sink up to <strong>2.5 mA to 3.2 mA</strong> without violating logic levels.
                </li>
                <li>
                  <strong>Design Recommendation:</strong> Connect LEDs in <strong>Common Anode</strong> (anodes to +5V through 330Ω, cathodes to 8255 pins) so the 8255 <em>sinks</em> current (driving logic 0 turns the LED ON). If Common Cathode is strictly needed with higher brightness (10–20 mA), insert an octal non-inverting buffer IC such as the <strong>74LS244</strong> or <strong>74LS245</strong> between the 8255 Port B and the LEDs!
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: 8086 ALP PROGRAMS (COMMENTED)                     */}
      {/* ======================================================== */}
      {activeTab === 'alp' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-mono font-bold uppercase text-blue-600 tracking-wider">
                Microprocessor Software Implementation
              </span>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Complete 8086 Assembly Language Programs (ALP) for Switches &amp; LEDs
              </h3>
            </div>

            {/* Program 1: Basic Read Switch and Echo to LED */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 font-mono">
                  Program 1: Read DIP Switches (Port A) &amp; Display on Discrete LEDs (Port B)
                </span>
                <button
                  onClick={() => copyToClipboard(
`; --- 8086 ALP: Read Switches (Port A) and Echo to LEDs (Port B) ---
; 8255 Base Address: 80H (Port A = 80H, Port B = 82H, Control Reg = 86H)
.MODEL SMALL
.STACK 64
.DATA
.CODE
MAIN PROC
    MOV AX, @DATA        ; Initialize Data Segment
    MOV DS, AX

    ; Step 1: Configure 8255 PPI in Mode 0
    ; Control Word 90H = 1001 0000b (Port A=Input, Port B=Output, Port C=Output)
    MOV DX, 86H          ; DX points to 8255 Control Port (86H)
    MOV AL, 90H          ; Load Control Word into AL
    OUT DX, AL           ; Send control word to 8255

READ_LOOP:
    ; Step 2: Read 8-bit switch status from Port A
    MOV DX, 80H          ; DX points to Port A (80H)
    IN AL, DX            ; Read binary byte from switches into AL

    ; Step 3: Output the byte directly to LEDs at Port B
    MOV DX, 82H          ; DX points to Port B (82H)
    OUT DX, AL           ; Drive LEDs with switch data

    ; Step 4: Repeat continuously in real-time
    JMP READ_LOOP        ; Polling loop

MAIN ENDP
END MAIN`, 'prog1')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-mono flex items-center gap-1 cursor-pointer transition-all"
                >
                  {copiedAlpKey === 'prog1' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedAlpKey === 'prog1' ? 'Copied!' : 'Copy ALP'}
                </button>
              </div>

              <pre className="bg-slate-900 text-emerald-300 p-4 rounded-xl font-mono text-xs overflow-x-auto leading-normal border border-slate-800">
{`; --- 8086 ALP: Read Switches (Port A) and Echo to LEDs (Port B) ---
; 8255 Base Address: 80H (Port A = 80H, Port B = 82H, Control Reg = 86H)
.MODEL SMALL
.STACK 64
.DATA
.CODE
MAIN PROC
    MOV AX, @DATA        ; Initialize Data Segment
    MOV DS, AX

    ; Step 1: Configure 8255 PPI in Mode 0
    ; Control Word 90H = 1001 0000b (Port A=Input, Port B=Output, Port C=Output)
    MOV DX, 86H          ; DX points to 8255 Control Port (86H)
    MOV AL, 90H          ; Load Control Word into AL
    OUT DX, AL           ; Send control word to 8255

READ_LOOP:
    ; Step 2: Read 8-bit switch status from Port A
    MOV DX, 80H          ; DX points to Port A (80H)
    IN AL, DX            ; Read binary byte from switches into AL

    ; Step 3: Output the byte directly to LEDs at Port B
    MOV DX, 82H          ; DX points to Port B (82H)
    OUT DX, AL           ; Drive LEDs with switch data

    ; Step 4: Repeat continuously in real-time
    JMP READ_LOOP        ; Polling loop

MAIN ENDP
END MAIN`}
              </pre>
            </div>

            {/* Program 2: 8-Bit Binary Up Counter on LEDs */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 font-mono">
                  Program 2: 8-Bit Binary Up Counter on LEDs (00H to FFH with Delay)
                </span>
                <button
                  onClick={() => copyToClipboard(
`; --- 8086 ALP: 8-Bit Binary Up Counter on 8255 Port B LEDs ---
.MODEL SMALL
.STACK 64
.DATA
.CODE
MAIN PROC
    ; Initialize 8255 in Mode 0 (All ports output: CW = 80H)
    MOV DX, 86H
    MOV AL, 80H          ; Port A, B, C = Output
    OUT DX, AL

    MOV BL, 00H          ; BL acts as our 8-bit binary counter

COUNT_LOOP:
    MOV DX, 82H          ; Port B address
    MOV AL, BL           ; Transfer count to AL
    OUT DX, AL           ; Display count on 8 LEDs

    CALL DELAY           ; Call software delay to make count visible
    INC BL               ; Increment count (wraps automatically FFH -> 00H)
    JMP COUNT_LOOP       ; Infinite counting loop

; --- Delay Subroutine (~250 ms) ---
DELAY PROC
    PUSH CX
    PUSH BX
    MOV BX, 02H
D1: MOV CX, 0FFFFH
D2: LOOP D2
    DEC BX
    JNZ D1
    POP BX
    POP CX
    RET
DELAY ENDP
MAIN ENDP
END MAIN`, 'prog2')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-mono flex items-center gap-1 cursor-pointer transition-all"
                >
                  {copiedAlpKey === 'prog2' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedAlpKey === 'prog2' ? 'Copied!' : 'Copy ALP'}
                </button>
              </div>

              <pre className="bg-slate-900 text-emerald-300 p-4 rounded-xl font-mono text-xs overflow-x-auto leading-normal border border-slate-800">
{`; --- 8086 ALP: 8-Bit Binary Up Counter on 8255 Port B LEDs ---
.MODEL SMALL
.STACK 64
.DATA
.CODE
MAIN PROC
    ; Initialize 8255 in Mode 0 (All ports output: CW = 80H)
    MOV DX, 86H
    MOV AL, 80H          ; Port A, B, C = Output
    OUT DX, AL

    MOV BL, 00H          ; BL acts as our 8-bit binary counter

COUNT_LOOP:
    MOV DX, 82H          ; Port B address
    MOV AL, BL           ; Transfer count to AL
    OUT DX, AL           ; Display count on 8 LEDs

    CALL DELAY           ; Call software delay to make count visible
    INC BL               ; Increment count (wraps automatically FFH -> 00H)
    JMP COUNT_LOOP       ; Infinite counting loop

; --- Delay Subroutine (~250 ms) ---
DELAY PROC
    PUSH CX
    PUSH BX
    MOV BX, 02H
D1: MOV CX, 0FFFFH
D2: LOOP D2
    DEC BX
    JNZ D1
    POP BX
    POP CX
    RET
DELAY ENDP
MAIN ENDP
END MAIN`}
              </pre>
            </div>

            {/* Program 3: Running LED Chaser using ROL */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 font-mono">
                  Program 3: Running LED Chaser (Ring Counter using ROL Instruction)
                </span>
                <button
                  onClick={() => copyToClipboard(
`; --- 8086 ALP: Running LED Chaser using ROL instruction ---
.MODEL SMALL
.STACK 64
.DATA
.CODE
MAIN PROC
    MOV DX, 86H
    MOV AL, 80H          ; CW 80H (Port B = Output)
    OUT DX, AL

    MOV AL, 01H          ; Start with LED0 ON (0000 0001b)
CHASE_LOOP:
    MOV DX, 82H          ; Port B
    OUT DX, AL           ; Output pattern to LEDs
    CALL DELAY           ; Wait ~100 ms

    ROL AL, 1            ; Rotate left by 1 bit (01H -> 02H -> 04H -> ... -> 80H -> 01H)
    JMP CHASE_LOOP       ; Continuous chaser

DELAY PROC
    PUSH CX
    MOV CX, 0FFFFH
D:  LOOP D
    POP CX
    RET
DELAY ENDP
MAIN ENDP
END MAIN`, 'prog3')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-mono flex items-center gap-1 cursor-pointer transition-all"
                >
                  {copiedAlpKey === 'prog3' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedAlpKey === 'prog3' ? 'Copied!' : 'Copy ALP'}
                </button>
              </div>

              <pre className="bg-slate-900 text-emerald-300 p-4 rounded-xl font-mono text-xs overflow-x-auto leading-normal border border-slate-800">
{`; --- 8086 ALP: Running LED Chaser using ROL instruction ---
.MODEL SMALL
.STACK 64
.DATA
.CODE
MAIN PROC
    MOV DX, 86H
    MOV AL, 80H          ; CW 80H (Port B = Output)
    OUT DX, AL

    MOV AL, 01H          ; Start with LED0 ON (0000 0001b)
CHASE_LOOP:
    MOV DX, 82H          ; Port B
    OUT DX, AL           ; Output pattern to LEDs
    CALL DELAY           ; Wait ~100 ms

    ROL AL, 1            ; Rotate left by 1 bit (01H -> 02H -> 04H -> ... -> 80H -> 01H)
    JMP CHASE_LOOP       ; Continuous chaser

DELAY PROC
    PUSH CX
    MOV CX, 0FFFFH
D:  LOOP D
    POP CX
    RET
DELAY ENDP
MAIN ENDP
END MAIN`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: SUMMARY TABLE & GOLDEN RULES                      */}
      {/* ======================================================== */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-mono font-bold uppercase text-amber-600 tracking-wider">
                Exam &amp; Viva Reference Guide
              </span>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Switches &amp; LEDs Interfacing Summary Matrix &amp; Key Design Takeaways
              </h3>
            </div>

            {/* Comparison Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase bg-slate-50">
                    <th className="py-2.5 px-3">Peripheral</th>
                    <th className="py-2.5 px-3">8255 Port Direction</th>
                    <th className="py-2.5 px-3">Required Passive Components</th>
                    <th className="py-2.5 px-3">Key Design Constraint</th>
                    <th className="py-2.5 px-3">8086 Assembly Mnemonic</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-amber-700">DIP Switches / Push-Buttons</td>
                    <td className="py-2.5 px-3">Port A (INPUT, Mode 0)</td>
                    <td className="py-2.5 px-3">8 × 10 kΩ Pull-up Resistors</td>
                    <td className="py-2.5 px-3">Contact bounce (5–20 ms); floating lines cause spurious logic</td>
                    <td className="py-2.5 px-3 text-indigo-700 font-bold">IN AL, 80H</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-emerald-700">Discrete LEDs (Active High)</td>
                    <td className="py-2.5 px-3">Port B (OUTPUT, Mode 0)</td>
                    <td className="py-2.5 px-3">8 × 330 Ω Current Limiters</td>
                    <td className="py-2.5 px-3">8255 source current is limited (~1.6 mA); buffer needed for &gt;5 mA</td>
                    <td className="py-2.5 px-3 text-indigo-700 font-bold">OUT 82H, AL</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-blue-700">Discrete LEDs (Active Low)</td>
                    <td className="py-2.5 px-3">Port B (OUTPUT, Mode 0)</td>
                    <td className="py-2.5 px-3">8 × 330 Ω + Common Anode to +5V</td>
                    <td className="py-2.5 px-3">Sinking drive (2.5–3.2 mA); preferred over sourcing for NMOS 8255</td>
                    <td className="py-2.5 px-3 text-indigo-700 font-bold">OUT 82H, AL (0 = ON)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Golden Rules Box */}
            <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 text-xs text-slate-800 space-y-2">
              <div className="font-bold text-amber-950 font-display text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Three Golden Rules for 8086 Peripheral Interfacing
              </div>
              <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed text-slate-700">
                <li>
                  <strong>Never leave input pins floating:</strong> CMOS and TTL inputs will drift into an undetermined linear state without pull-up or pull-down resistors, causing high power consumption and noise sensitivity.
                </li>
                <li>
                  <strong>Always calculate LED current:</strong> Without series resistors, forward diode current rises exponentially with voltage, immediately destroying the LED semiconductor junction and exceeding 8255 pin ratings.
                </li>
                <li>
                  <strong>Always initialize the 8255 Control Register first:</strong> Before reading or writing any port data, you must write the Control Word (e.g. <code>90H</code> or <code>80H</code>) to port address <code>86H</code>.
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
