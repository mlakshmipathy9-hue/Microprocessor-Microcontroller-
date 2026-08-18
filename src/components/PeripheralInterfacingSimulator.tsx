import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCw, 
  RotateCcw, 
  Lightbulb, 
  Zap, 
  ShieldAlert, 
  CheckCircle2, 
  Cpu, 
  Layers, 
  Code, 
  Activity,
  ArrowRight,
  Sparkles,
  Grid,
  Radio,
  Sliders,
  Timer
} from 'lucide-react';

interface PeripheralInterfacingSimulatorProps {
  initialTab?: 'circuit' | 'stepper' | 'stepper-code' | 'display' | 'keypad' | 'traffic' | 'alp';
  mode?: 'circuit' | 'stepper' | 'stepper-code' | 'display' | 'keypad' | 'traffic' | 'alp';
  showTabs?: boolean;
  allowedTabs?: ('circuit' | 'stepper' | 'stepper-code' | 'display' | 'keypad' | 'traffic' | 'alp')[];
}

export default function PeripheralInterfacingSimulator({ 
  initialTab = 'circuit',
  mode,
  showTabs = false,
  allowedTabs
}: PeripheralInterfacingSimulatorProps) {
  const [activeTab, setActiveTab] = useState<'circuit' | 'stepper' | 'stepper-code' | 'display' | 'keypad' | 'traffic' | 'alp'>(mode || initialTab);

  useEffect(() => {
    if (mode) setActiveTab(mode);
    else if (initialTab) setActiveTab(initialTab);
  }, [mode, initialTab]);

  // 7-Segment Display state
  const [displayType, setDisplayType] = useState<'cathode' | 'anode'>('cathode');
  const [digitHex, setDigitHex] = useState<string>('0');

  // Stepper Motor State
  const [driveMode, setDriveMode] = useState<'wave' | 'full' | 'half'>('full');
  const [direction, setDirection] = useState<'cw' | 'ccw'>('cw');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [motorAngle, setMotorAngle] = useState<number>(0);
  const [stepDelayMs, setStepDelayMs] = useState<number>(450);

  // Keypad State
  const [pressedKey, setPressedKey] = useState<string | null>('7');
  const [activeScanRow, setActiveScanRow] = useState<number>(0);

  // Traffic Light Controller State
  const [trafficRunning, setTrafficRunning] = useState<boolean>(false);
  const [trafficStateIndex, setTrafficStateIndex] = useState<number>(0);

  // Selected ALP Program Tab
  const [selectedAlp, setSelectedAlp] = useState<'stepper' | 'seven-seg' | 'keypad' | 'traffic'>('stepper');

  // 7-Segment Hex mapping for Common Cathode (a,b,c,d,e,f,g,dp)
  const segmentCodesCathode: Record<string, number> = {
    '0': 0x3F, '1': 0x06, '2': 0x5B, '3': 0x4F,
    '4': 0x66, '5': 0x6D, '6': 0x7D, '7': 0x07,
    '8': 0x7F, '9': 0x6F, 'A': 0x77, 'B': 0x7C,
    'C': 0x39, 'D': 0x5E, 'E': 0x79, 'F': 0x71
  };

  const rawCode = segmentCodesCathode[digitHex] || 0x3F;
  const activeCode = displayType === 'cathode' ? rawCode : (~rawCode & 0xFF);

  // Stepper Sequences (Coils A, B, C, D)
  const sequences = {
    wave: [0x01, 0x02, 0x04, 0x08], // 11H, 22H, 44H, 88H nibble equivalent
    full: [0x03, 0x06, 0x0C, 0x09], // 33H, 66H, CCH, 99H nibble equivalent
    half: [0x01, 0x03, 0x02, 0x06, 0x04, 0x0C, 0x08, 0x09]
  };

  const currentSequence = sequences[driveMode];
  const coilStateByte = currentSequence[currentStepIndex % currentSequence.length];

  // Animation Loop for Stepper Motor
  useEffect(() => {
    let timer: any = null;
    if (isRunning) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          const nextIdx = direction === 'cw' ? (prev + 1) : (prev - 1 + currentSequence.length);
          return nextIdx % currentSequence.length;
        });
        setMotorAngle((prev) => (direction === 'cw' ? (prev + 18) % 360 : (prev - 18 + 360) % 360));
      }, stepDelayMs);
    }
    return () => clearInterval(timer);
  }, [isRunning, direction, currentSequence, stepDelayMs]);

  // Traffic Light States: 
  const trafficStates = [
    { name: 'North-South GREEN / East-West RED', ns: 'green', ew: 'red', portA: '0x21H', duration: 3000 },
    { name: 'North-South YELLOW / East-West RED', ns: 'yellow', ew: 'red', portA: '0x11H', duration: 1200 },
    { name: 'North-South RED / East-West GREEN', ns: 'red', ew: 'green', portA: '0x0CH', duration: 3000 },
    { name: 'North-South RED / East-West YELLOW', ns: 'red', ew: 'yellow', portA: '0x0AH', duration: 1200 }
  ];

  useEffect(() => {
    let timer: any = null;
    if (trafficRunning) {
      const currentDuration = trafficStates[trafficStateIndex].duration;
      timer = setTimeout(() => {
        setTrafficStateIndex((prev) => (prev + 1) % trafficStates.length);
      }, currentDuration);
    }
    return () => clearTimeout(timer);
  }, [trafficRunning, trafficStateIndex]);

  // Keypad Matrix definition
  const keypadMatrix = [
    ['1', '2', '3', 'A'],
    ['4', '5', '6', 'B'],
    ['7', '8', '9', 'C'],
    ['*', '0', '#', 'D']
  ];

  const handleKeyPress = (key: string, rowIdx: number) => {
    setPressedKey(key);
    setActiveScanRow(rowIdx);
  };

  // Header content descriptors tailored to each peripheral
  const headers = {
    circuit: {
      icon: <Activity className="w-5 h-5" />,
      title: '8086 Interfacing Circuit Architecture & Bus Decoding',
      subtitle: '8086 CPU ↔ 74LS373 Latches ↔ 74LS138 Address Decoder (CS# = 80H) ↔ 8255 PPI ↔ ULN2003 Driver'
    },
    stepper: {
      icon: <RotateCw className="w-5 h-5" />,
      title: '8086 Stepper Motor Interfacing & Driver (ULN2003A)',
      subtitle: 'Excitation Wave / Full / Half Step Modes • Dynamic Rotor & Stator Simulation • Coil Sinking Signals'
    },
    'stepper-code': {
      icon: <Code className="w-5 h-5" />,
      title: '8086 Stepper Motor Assembly Language Program (ALP)',
      subtitle: 'Full-Step 2-Phase ON (03H, 06H, 0CH, 09H) • 8255 PPI Port A Interfacing & Delay Loop'
    },
    display: {
      icon: <Lightbulb className="w-5 h-5" />,
      title: '8086 Seven-Segment LED Display Interfacing',
      subtitle: 'Common Cathode (Active HIGH) & Common Anode (Active LOW) • 8255 Port A Segment Codes • Live LED Matrix'
    },
    keypad: {
      icon: <Grid className="w-5 h-5" />,
      title: '8086 4x4 Matrix Keypad Interfacing & Debouncing',
      subtitle: 'Active-LOW Row Scanning (Port A) • Column Sense (Port B) • Contact Bouncing Verification'
    },
    traffic: {
      icon: <Timer className="w-5 h-5" />,
      title: '8086 4-Way Traffic Light Controller Interfacing',
      subtitle: 'North-South & East-West Phase Sequencing • 8255 Port A Bit Assignments • State Machine Delays'
    },
    alp: {
      icon: <Code className="w-5 h-5" />,
      title: '8086 Assembly Language Programs (ALP) for Peripherals',
      subtitle: '8255 PPI Initialization (80H) • Stepper Driver Loops • Lookup Table Indexing'
    }
  };

  const currentHeader = headers[activeTab] || headers.circuit;

  return (
    <div className="bg-white text-slate-800 p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs font-sans">
      {/* Dedicated Header for Current Peripheral without redundant tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-200 text-indigo-600 shadow-2xs">
            {currentHeader.icon}
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">{currentHeader.title}</h3>
            <p className="text-[11px] text-slate-500">
              {currentHeader.subtitle}
            </p>
          </div>
        </div>

        {/* Tab Switcher for Multi-tab modes (e.g. Slide 1 combined Circuit & Stepper Motor) */}
        {((allowedTabs && allowedTabs.length > 1) || showTabs) && (
          <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 shadow-inner">
            {(allowedTabs || ['circuit', 'stepper', 'display', 'keypad', 'traffic', 'alp']).map((tabKey) => {
              const tabMeta: Record<string, { label: string; icon: React.ReactNode }> = {
                circuit: { label: 'Circuit Blocks & Architecture', icon: <Activity className="w-3.5 h-3.5" /> },
                stepper: { label: 'Stepper Motor Simulator', icon: <RotateCw className="w-3.5 h-3.5" /> },
                'stepper-code': { label: 'Stepper Motor ALP (Code)', icon: <Code className="w-3.5 h-3.5" /> },
                display: { label: '7-Segment Display', icon: <Lightbulb className="w-3.5 h-3.5" /> },
                keypad: { label: '4x4 Matrix Keypad', icon: <Grid className="w-3.5 h-3.5" /> },
                traffic: { label: 'Traffic Light Controller', icon: <Timer className="w-3.5 h-3.5" /> },
                alp: { label: 'Assembly Program (ALP)', icon: <Code className="w-3.5 h-3.5" /> },
              };
              const isSelected = activeTab === tabKey;
              return (
                <button
                  key={tabKey}
                  onClick={() => setActiveTab(tabKey as any)}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 text-[11px] transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  {tabMeta[tabKey]?.icon}
                  <span>{tabMeta[tabKey]?.label || tabKey}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* TAB 1: INTERFACING CIRCUIT SCHEMATIC (Full Light Background Diagram) */}
      {activeTab === 'circuit' && (
        <div className="space-y-4">
          {/* Top Info Banner */}
          <div className="bg-indigo-50/70 border border-indigo-150 p-3 rounded-xl flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-600 text-white rounded-lg font-mono text-[10px] font-bold">SCHEMATIC</span>
              <span className="font-semibold text-indigo-950 text-xs">
                8086 CPU ↔ 74LS138 Decoder ↔ 8255 PPI ↔ ULN2003 Driver ↔ Stepper Motor &amp; Peripherals
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`px-3 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all shadow-xs ${
                  isRunning ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isRunning ? 'Pause Circuit Signals' : 'Animate Circuit Signals'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Hardware Block Diagram Canvas (Clean Light SVG) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 overflow-x-auto shadow-inner">
            <div className="min-w-[760px] flex items-stretch justify-between gap-3 text-[11px]">
              
              {/* BLOCK 1: 8086 Microprocessor */}
              <div className="w-44 bg-white border-2 border-indigo-200 rounded-xl p-3 shadow-xs flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="font-extrabold text-indigo-700 font-mono text-xs">8086 CPU</span>
                  <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-bold">5 MHz</span>
                </div>
                <div className="space-y-1 font-mono text-[10px]">
                  <div className="flex justify-between items-center py-0.5 px-1 bg-slate-50 rounded">
                    <span className="text-slate-600">AD0–AD15</span>
                    <span className="text-indigo-600 font-bold">Mux Bus</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 px-1 bg-slate-50 rounded">
                    <span className="text-slate-600">A16–A19</span>
                    <span className="text-indigo-600 font-bold">Addr Hi</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 px-1 bg-slate-50 rounded">
                    <span className="text-slate-600">ALE</span>
                    <span className="text-emerald-600 font-bold">Latch En</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 px-1 bg-slate-50 rounded">
                    <span className="text-slate-600">M/IO#, RD#, WR#</span>
                    <span className="text-amber-600 font-bold">Control</span>
                  </div>
                </div>
                <div className="pt-1 text-[9px] text-slate-400 border-t border-slate-100 text-center font-mono">
                  Minimum Mode (+5V)
                </div>
              </div>

              {/* ARROW 1: Bus Demux */}
              <div className="flex flex-col items-center justify-center space-y-1 px-1">
                <span className="text-[9px] font-mono text-indigo-600 font-bold">ALE / Demux</span>
                <div className="w-8 h-0.5 bg-indigo-300 relative">
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-500 absolute -right-2 -top-1.5" />
                </div>
                <span className="text-[9px] font-mono text-slate-400">74LS373</span>
              </div>

              {/* BLOCK 2: 74LS138 Address Decoder */}
              <div className="w-40 bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="font-bold text-slate-800 font-mono text-xs">74LS138</span>
                  <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold">Decoder</span>
                </div>
                <div className="space-y-1 font-mono text-[10px]">
                  <div className="text-slate-600">Inputs: <strong className="text-slate-800">A2, A3, A4</strong></div>
                  <div className="text-slate-600">Enables: <strong className="text-slate-800">G1, G2A#, G2B#</strong></div>
                  <div className="py-1 px-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold flex justify-between">
                    <span>Y0# (CS#)</span>
                    <span>0 (Active)</span>
                  </div>
                </div>
                <div className="text-[9px] text-slate-500 border-t border-slate-100 pt-1 text-center">
                  Base Port: 80H
                </div>
              </div>

              {/* ARROW 2: Chip Select & Bus */}
              <div className="flex flex-col items-center justify-center space-y-1 px-1">
                <span className="text-[9px] font-mono text-emerald-600 font-bold">CS#, A0, A1</span>
                <div className="w-8 h-0.5 bg-emerald-400 relative">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600 absolute -right-2 -top-1.5" />
                </div>
                <span className="text-[9px] font-mono text-slate-400">D0–D7</span>
              </div>

              {/* BLOCK 3: Intel 8255 PPI */}
              <div className="w-48 bg-white border-2 border-indigo-300 rounded-xl p-3 shadow-xs flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between border-b border-indigo-100 pb-1.5">
                  <span className="font-extrabold text-indigo-800 font-mono text-xs">Intel 8255 PPI</span>
                  <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[9px] font-bold">24 I/O</span>
                </div>
                <div className="space-y-1.5 font-mono text-[10px]">
                  {/* Port A status */}
                  <div className="p-1.5 bg-indigo-50/60 rounded border border-indigo-100 flex items-center justify-between">
                    <span className="text-indigo-900 font-bold">Port A (PA0–PA3)</span>
                    <span className="text-emerald-700 font-bold">0x0{coilStateByte.toString(16).toUpperCase()}H</span>
                  </div>
                  {/* Port B status */}
                  <div className="p-1 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-slate-600">
                    <span>Port B (PB0–PB7)</span>
                    <span>7-Segment / Traffic</span>
                  </div>
                  {/* Port C status */}
                  <div className="p-1 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-slate-600">
                    <span>Port C (PC0–PC7)</span>
                    <span>Keypad Matrix</span>
                  </div>
                </div>
                <div className="text-[9px] text-indigo-600 font-bold text-center border-t border-slate-100 pt-1 font-mono">
                  Control Word: 80H (Mode 0 Out)
                </div>
              </div>

              {/* ARROW 3: Driver Lines */}
              <div className="flex flex-col items-center justify-center space-y-1 px-1">
                <span className="text-[9px] font-mono text-indigo-600 font-bold">PA0–PA3</span>
                <div className="w-8 h-0.5 bg-indigo-400 relative">
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-600 absolute -right-2 -top-1.5" />
                </div>
                <span className="text-[9px] font-mono text-slate-400">Logic Levels</span>
              </div>

              {/* BLOCK 4: ULN2003A Driver */}
              <div className="w-44 bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="font-bold text-slate-800 font-mono text-xs">ULN2003A</span>
                  <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-[9px] font-bold">Darlington</span>
                </div>
                <div className="space-y-1 font-mono text-[9px]">
                  {['1B (PA0) → 1C (A)', '2B (PA1) → 2C (B)', '3B (PA2) → 3C (C)', '4B (PA3) → 4C (D)'].map((coil, idx) => {
                    const isCoilActive = ((coilStateByte >> idx) & 1) === 1;
                    return (
                      <div 
                        key={idx} 
                        className={`p-1 rounded flex justify-between items-center transition-all ${
                          isCoilActive ? 'bg-emerald-100 text-emerald-900 font-bold' : 'bg-slate-50 text-slate-400'
                        }`}
                      >
                        <span>{coil}</span>
                        <span>{isCoilActive ? 'ON' : 'OFF'}</span>
                      </div>
                    );
                  })}
                  <div className="text-slate-500 text-[8.5px] pt-1">COM (Pin 9) → +12V DC</div>
                </div>
                <div className="text-[9px] text-amber-800 border-t border-slate-100 pt-1 text-center font-bold">
                  500mA Sink per Channel
                </div>
              </div>

              {/* ARROW 4: High Current Motor Coils */}
              <div className="flex flex-col items-center justify-center space-y-1 px-1">
                <span className="text-[9px] font-mono text-amber-600 font-bold">+12V Coils</span>
                <div className="w-8 h-0.5 bg-amber-400 relative">
                  <ArrowRight className="w-3.5 h-3.5 text-amber-600 absolute -right-2 -top-1.5" />
                </div>
                <span className="text-[9px] font-mono text-slate-400">4-Phase</span>
              </div>

              {/* BLOCK 5: 4-Phase Stepper Motor Rotor */}
              <div className="w-48 bg-white border-2 border-emerald-300 rounded-xl p-3 shadow-xs flex flex-col justify-between items-center text-center space-y-2">
                <div className="w-full flex items-center justify-between border-b border-emerald-100 pb-1.5">
                  <span className="font-extrabold text-emerald-800 font-mono text-xs">Stepper Motor</span>
                  <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[9px] font-bold">1.8°/Step</span>
                </div>
                
                {/* Physical Rotor Visual */}
                <div 
                  className="w-20 h-20 rounded-full border-4 border-indigo-400 bg-slate-50 relative flex items-center justify-center shadow-inner transition-transform duration-300"
                  style={{ transform: `rotate(${motorAngle}deg)` }}
                >
                  <div className="w-1 h-8 bg-emerald-600 rounded-full absolute top-1.5 shadow-xs" />
                  <div className="w-4 h-4 rounded-full bg-indigo-600 border-2 border-white" />
                </div>

                <div className="text-[10px] font-mono text-slate-700">
                  Shaft Angle: <strong className="text-slate-900 font-bold">{motorAngle}°</strong>
                </div>
                <div className="text-[9px] text-slate-500 font-sans">
                  Phase Sequence: A → B → C → D
                </div>
              </div>

            </div>
          </div>

          {/* Detailed Functional Breakdown of Each Circuit Block */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="font-bold text-xs text-indigo-950 uppercase tracking-wider">
                Functional Breakdown of Interfacing Circuit Blocks
              </span>
              <span className="text-[10px] text-slate-500 font-mono">5 Master Hardware Stages</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* BLOCK 1 */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
                  <span className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-indigo-600" />
                    Block 1: 8086 Microprocessor (Controller / Master Unit)
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-indigo-100 text-indigo-700 rounded-md">CPU Core</span>
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  <strong>Function:</strong> Acts as the brain of the system. It executes the Assembly Language Program (ALP), generates digital timing pulses, and determines the rotation direction (CW/CCW), speed (via software delay loops), and total step count.
                </p>
                <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-1 text-[10px]">
                  <span className="font-bold text-slate-700 block uppercase tracking-wider text-[9px]">Key Connections:</span>
                  <ul className="list-disc list-inside text-slate-600 space-y-0.5 font-mono">
                    <li><strong className="text-indigo-700">AD0–AD15:</strong> Multiplexed Address/Data bus lines.</li>
                    <li><strong className="text-emerald-700">ALE:</strong> Pulses HIGH in T1 to latch address into 74LS373.</li>
                    <li><strong className="text-amber-700">M/IO#, RD#, WR#:</strong> Control bus signals for I/O write cycles.</li>
                  </ul>
                </div>
              </div>

              {/* BLOCK 2 */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
                  <span className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" />
                    Block 2: Address Demultiplexer &amp; Decoder Stage
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-blue-100 text-blue-700 rounded-md">Demux &amp; Decode</span>
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  <strong>Purpose:</strong> Ensures I/O addresses issued by the 8086 correctly select the 8255 PPI chip without bus contention.
                </p>
                <div className="space-y-1.5 text-[10px]">
                  <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-0.5">
                    <span className="font-bold text-blue-900">74LS373 Octal Transparent D-Latch:</span>
                    <p className="text-slate-600">Latches lower 16 address bits (A0–A15) when ALE is HIGH and holds them steady during T2–T4 so AD0–AD7 acts as bidirectional data bus (D0–D7).</p>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-0.5">
                    <span className="font-bold text-emerald-900">74LS138 (3-to-8 Line Decoder):</span>
                    <p className="text-slate-600">Decodes upper address bits (A2–A7) along with M/IO# to output active-low CS# (Chip Select) to pin 6 of 8255 at base address 80H.</p>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg border border-slate-200 text-[10px] font-mono text-slate-700 flex justify-between flex-wrap gap-1">
                    <span>Port A = 80H</span>
                    <span>Port B = 82H</span>
                    <span>Port C = 84H</span>
                    <span>Control Reg = 86H</span>
                  </div>
                </div>
              </div>

              {/* BLOCK 3 */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
                  <span className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-purple-600" />
                    Block 3: Intel 8255 Programmable Peripheral Interface (PPI)
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-purple-100 text-purple-700 rounded-md">24 I/O Lines</span>
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  <strong>Function:</strong> Provides programmable parallel I/O ports to interface the CPU with the motor driver.
                </p>
                <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-1 text-[10px]">
                  <span className="font-bold text-slate-700 block uppercase tracking-wider text-[9px]">Configuration &amp; Operation:</span>
                  <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                    <li>Initialized in <strong>Mode 0 (Basic I/O)</strong> with Port A configured as an Output port by sending control byte <code className="bg-slate-100 px-1 rounded text-purple-700 font-mono">80H</code> (10000000b) to address 86H.</li>
                    <li>Pins <strong>PA0–PA3</strong> output 4-bit excitation nibbles (<strong>03H, 06H, 0CH, 09H</strong>) to energize motor phases in sequence.</li>
                  </ul>
                </div>
              </div>

              {/* BLOCK 4 */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
                  <span className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-600" />
                    Block 4: ULN2003A Darlington Transistor Driver IC
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-amber-100 text-amber-800 rounded-md">High-Current Driver</span>
                </div>
                <div className="space-y-1.5 text-[10px]">
                  <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-0.5">
                    <span className="font-bold text-amber-900">Why it is Required:</span>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                      <li><strong>Current Amplification:</strong> 8255 pins provide only ~1.6–2.5 mA (0V/5V logic), while motor coils require 200–500 mA at +12V DC.</li>
                      <li><strong>Inductive Back-EMF Suppression:</strong> Motor coils generate dangerous reverse voltage spikes (V = -L di/dt) when de-energized.</li>
                    </ul>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-0.5 font-mono text-[9px] text-slate-700">
                    <div>Inputs (1B–4B): Connected to 8255 PA0–PA3</div>
                    <div>Outputs (1C–4C): Connected to Motor Coils Phase A, B, C, D</div>
                    <div>Pin 8 (GND): System Ground | Pin 9 (COM): +12V DC (Clamp Diodes)</div>
                  </div>
                </div>
              </div>

              {/* BLOCK 5 */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 md:col-span-2">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
                  <span className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                    <RotateCw className="w-4 h-4 text-emerald-600" />
                    Block 5: 4-Phase Stepper Motor (Actuator)
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 rounded-md">Actuator Load</span>
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  <strong>Function:</strong> Electromechanical actuator that converts electrical input pulses into discrete mechanical angular displacements (steps).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-0.5">
                    <span className="font-bold text-slate-800">Construction &amp; Operation:</span>
                    <p className="text-slate-600">4 stator phase windings (Phase A, B, C, D) with common terminal tied to +12V DC. When ULN2003 output goes LOW, current flows from +12V through that winding, pulling rotor teeth into alignment.</p>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-0.5">
                    <span className="font-bold text-slate-800">Step Angle (β) &amp; Resolution:</span>
                    <p className="text-slate-600 font-mono">β = 360° / (Phases × Teeth) → 1.8° (200 steps/rev) or 7.5° (48 steps/rev). Rotation speed is governed by time delay between step pulses.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STEPPER MOTOR SIMULATOR */}
      {activeTab === 'stepper' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Left Column: Control Panel */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-bold uppercase tracking-wider">
                  Excitation Drive Mode
                </label>
                <div className="grid grid-cols-3 gap-1.5 font-semibold">
                  <button
                    onClick={() => setDriveMode('wave')}
                    className={`py-1.5 rounded-lg border cursor-pointer transition-all ${
                      driveMode === 'wave' 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs font-bold' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Wave (1-Phase)
                  </button>
                  <button
                    onClick={() => setDriveMode('full')}
                    className={`py-1.5 rounded-lg border cursor-pointer transition-all ${
                      driveMode === 'full' 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs font-bold' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Full Step (2-Phase)
                  </button>
                  <button
                    onClick={() => setDriveMode('half')}
                    className={`py-1.5 rounded-lg border cursor-pointer transition-all ${
                      driveMode === 'half' 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs font-bold' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Half Step (Half Angle)
                  </button>
                </div>
              </div>

              {/* Speed / Delay Slider */}
              <div>
                <div className="flex justify-between text-[10px] text-slate-600 mb-1 font-bold">
                  <span>STEP PULSE DELAY (SPEED)</span>
                  <span className="font-mono text-indigo-700">{stepDelayMs} ms / step</span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="900"
                  step="50"
                  value={stepDelayMs}
                  onChange={(e) => setStepDelayMs(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all ${
                    isRunning ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isRunning ? 'Stop Motor' : 'Run Sequence'}
                </button>
                <button
                  onClick={() => setDirection(direction === 'cw' ? 'ccw' : 'cw')}
                  className="bg-white hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer border border-slate-200 shadow-2xs"
                >
                  {direction === 'cw' ? <RotateCw className="w-4 h-4 text-indigo-600" /> : <RotateCcw className="w-4 h-4 text-indigo-600" />}
                  <span>{direction === 'cw' ? 'Clockwise (CW)' : 'Anti-Clockwise (CCW)'}</span>
                </button>
              </div>

              {/* ULN2003 Driver Coils Output */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">
                  ULN2003 Driver Output Lines (PA0–PA3)
                </span>
                <div className="grid grid-cols-4 gap-1.5 font-mono text-center text-[10px]">
                  {['Coil A (PA0)', 'Coil B (PA1)', 'Coil C (PA2)', 'Coil D (PA3)'].map((name, idx) => {
                    const active = ((coilStateByte >> idx) & 1) === 1;
                    return (
                      <div
                        key={name}
                        className={`py-2 rounded-lg font-bold border transition-all ${
                          active 
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                      >
                        <div>{name}</div>
                        <div className="text-[9px] mt-0.5">{active ? 'HIGH (+12V)' : 'LOW (0V)'}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Physical Rotor View */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center space-y-3">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                Physical Stepper Motor Rotor &amp; Stator Poles
              </span>
              
              <div className="relative w-44 h-44 flex items-center justify-center">
                {/* 4 Stator Coils Placed at Top, Right, Bottom, Left */}
                <div className={`absolute top-0 px-2 py-1 rounded text-[9px] font-mono font-bold border ${((coilStateByte >> 0) & 1) === 1 ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs' : 'bg-white text-slate-500 border-slate-200'}`}>
                  Coil A (0°)
                </div>
                <div className={`absolute right-0 px-2 py-1 rounded text-[9px] font-mono font-bold border ${((coilStateByte >> 1) & 1) === 1 ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs' : 'bg-white text-slate-500 border-slate-200'}`}>
                  Coil B (90°)
                </div>
                <div className={`absolute bottom-0 px-2 py-1 rounded text-[9px] font-mono font-bold border ${((coilStateByte >> 2) & 1) === 1 ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs' : 'bg-white text-slate-500 border-slate-200'}`}>
                  Coil C (180°)
                </div>
                <div className={`absolute left-0 px-2 py-1 rounded text-[9px] font-mono font-bold border ${((coilStateByte >> 3) & 1) === 1 ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs' : 'bg-white text-slate-500 border-slate-200'}`}>
                  Coil D (270°)
                </div>

                {/* Rotating Rotor */}
                <div
                  className="w-28 h-28 rounded-full border-4 border-indigo-500 bg-white relative flex items-center justify-center shadow-inner transition-transform duration-300"
                  style={{ transform: `rotate(${motorAngle}deg)` }}
                >
                  <div className="w-2 h-11 bg-emerald-500 rounded-full absolute top-2 shadow-xs" />
                  <div className="w-6 h-6 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center text-white text-[8px] font-bold font-mono">
                    N
                  </div>
                  <div className="w-2 h-11 bg-slate-300 rounded-full absolute bottom-2" />
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 w-full font-mono text-[11px] flex justify-between shadow-2xs">
                <span>Rotor Angle: <strong className="text-slate-900">{motorAngle}°</strong></span>
                <span>Active 8255 Output: <strong className="text-emerald-700 font-bold">0x0{coilStateByte.toString(16).toUpperCase()}H</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: STEPPER MOTOR CODE (ALP) */}
      {activeTab === 'stepper-code' && (
        <div className="space-y-3">
          {/* Quick Hardware & Port Summary Header */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
            <div className="bg-indigo-50 border border-indigo-200/80 p-2.5 rounded-xl">
              <span className="text-indigo-900 font-bold block mb-0.5">8255 Port A Address</span>
              <span className="font-mono text-indigo-700 font-bold text-xs">80H (Output)</span>
              <p className="text-[9px] text-slate-500 mt-0.5">PA0–PA3 → ULN2003</p>
            </div>
            <div className="bg-purple-50 border border-purple-200/80 p-2.5 rounded-xl">
              <span className="text-purple-900 font-bold block mb-0.5">Control Word Reg</span>
              <span className="font-mono text-purple-700 font-bold text-xs">86H (CW = 80H)</span>
              <p className="text-[9px] text-slate-500 mt-0.5">Mode 0, Ports Output</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200/80 p-2.5 rounded-xl">
              <span className="text-emerald-900 font-bold block mb-0.5">Full-Step CW Sequence</span>
              <span className="font-mono text-emerald-700 font-bold text-xs">03H, 06H, 0CH, 09H</span>
              <p className="text-[9px] text-slate-500 mt-0.5">AB → BC → CD → DA</p>
            </div>
            <div className="bg-amber-50 border border-amber-200/80 p-2.5 rounded-xl">
              <span className="text-amber-900 font-bold block mb-0.5">Full-Step CCW Sequence</span>
              <span className="font-mono text-amber-700 font-bold text-xs">09H, 0CH, 06H, 03H</span>
              <p className="text-[9px] text-slate-500 mt-0.5">DA → CD → BC → AB</p>
            </div>
          </div>

          {/* Stepper Motor Assembly Language Code View */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-[11px] space-y-2">
            <div className="flex flex-wrap justify-between items-center border-b border-slate-200 pb-2 gap-1">
              <span className="font-bold text-indigo-900 uppercase flex items-center gap-1.5">
                <Code className="w-4 h-4 text-indigo-600" />
                8086 Stepper Motor Assembly Program (ALP) — 2-Phase ON Full-Step
              </span>
              <span className="text-slate-500 text-[10px] font-sans">8255 Mode 0 | Port A = 80H | Delay Loop ~50ms</span>
            </div>

            <pre className="text-slate-800 leading-relaxed overflow-x-auto whitespace-pre bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-2xs">
{`; =========================================================================
; 8086 ASSEMBLY LANGUAGE PROGRAM (ALP): STEPPER MOTOR CONTROL VIA 8255 PPI
; Hardware Port Map:
;   - Port A = 80H (Connected to ULN2003A Inputs 1B-4B for Coils A, B, C, D)
;   - Port B = 82H, Port C = 84H
;   - Control Word Register = 86H (Configured for Mode 0 Output: 80H)
; Excitation Sequence: 2-Phase ON Full-Step (High Holding Torque)
;   - Clockwise (CW)  : 03H -> 06H -> 0CH -> 09H
;   - Counter-CW (CCW): 09H -> 0CH -> 06H -> 03H
; =========================================================================

.MODEL SMALL                  ; Specify small memory model (single CS and DS)
.STACK 64                     ; Reserve 64 bytes of stack space for CALL/RET
.DATA                         ; Begin data segment definition
  ; 4-Phase Full-Step (2-Phase ON) Excitation Lookup Table (4-bit PA0-PA3)
  STEP_CW  DB 03H, 06H, 0CH, 09H ; Clockwise: Coils AB (03H) -> BC (06H) -> CD (0CH) -> DA (09H)
  STEP_CCW DB 09H, 0CH, 06H, 03H ; Counter-Clockwise excitation sequence (reversed)

.CODE                         ; Begin code segment definition
MAIN PROC                     ; Program entry point
  MOV AX, @DATA               ; Load address of data segment into AX register
  MOV DS, AX                  ; Initialize Data Segment (DS) register with segment base

  ; --- STEP 1: INITIALIZE 8255 PPI IN MODE 0 ---
  MOV AL, 80H                 ; Load Control Word 80H (10000000b: Mode 0, Port A/B/C = Output)
  OUT 86H, AL                 ; Send Control Word to 8255 Control Register at I/O Port 86H

  ; --- STEP 2: CONTINUOUS STEPPING LOOP ---
ROTATE_LOOP:
  MOV SI, 0                   ; Reset Source Index (SI) pointer to start of step array
  MOV CX, 4                   ; Load step counter with 4 (4 excitation states per electrical cycle)

STEP_CYCLE:
  MOV AL, STEP_CW[SI]         ; Fetch current phase excitation byte from memory into AL
  OUT 80H, AL                 ; Write excitation byte to Port A (80H) -> ULN2003 In1-In4
  CALL DELAY                  ; Call software delay loop to allow rotor mechanical step settling
  INC SI                      ; Advance SI to point to next step code in lookup table
  LOOP STEP_CYCLE             ; Decrement CX; repeat STEP_CYCLE until all 4 steps complete

  JMP ROTATE_LOOP             ; Loop indefinitely for continuous smooth clockwise rotation

; -------------------------------------------------------------------------
; Software Nested Delay Subroutine (Generates ~50ms pulse interval)
; -------------------------------------------------------------------------
DELAY PROC                    ; Begin delay procedure
  PUSH CX                     ; Save outer loop counter (CX) onto stack
  MOV CX, 0FFFFH              ; Load CX with maximum 16-bit count (65535 loop iterations)
D1:                           ; Inner loop label
  LOOP D1                     ; Decrement CX and loop back until CX = 0 (~2 clock cycles/loop)
  POP CX                      ; Restore original outer loop counter from stack
  RET                         ; Return control to calling instruction in main procedure
DELAY ENDP                    ; End delay procedure

MAIN ENDP                     ; End main procedure
END MAIN                      ; End of program assembly with entry point`}
            </pre>
          </div>

          {/* Algorithm & Register Role Explanation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[10px]">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-indigo-900 block border-b border-slate-100 pb-1">
                1. 8255 Initialization Logic
              </span>
              <p className="text-slate-600 leading-relaxed">
                Writing <code className="font-mono font-bold text-indigo-700 bg-slate-100 px-1 rounded">80H</code> (10000000b) to port <code className="font-mono text-slate-800">86H</code> configures 8255 in Mode 0 (Basic I/O) with Port A as an Output port driving ULN2003 inputs.
              </p>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-indigo-900 block border-b border-slate-100 pb-1">
                2. Table Indexing &amp; Stepping Loop
              </span>
              <p className="text-slate-600 leading-relaxed">
                <code className="font-mono font-bold text-emerald-700 bg-slate-100 px-1 rounded">MOV AL, STEP_CW[SI]</code> uses register-relative addressing. The array yields <code className="font-mono font-bold">03H → 06H → 0CH → 09H</code> to energize 2 adjacent stator coils per step.
              </p>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-indigo-900 block border-b border-slate-100 pb-1">
                3. Delay &amp; Mechanical Settling
              </span>
              <p className="text-slate-600 leading-relaxed">
                The <code className="font-mono font-bold text-amber-700 bg-slate-100 px-1 rounded">DELAY</code> subroutine provides ~50 ms time between pulses. Without sufficient delay, the rotor inertia cannot keep up with the stator magnetic field, causing missed steps or stalling.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 7-SEGMENT DISPLAY */}
      {activeTab === 'display' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Display Controls */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-bold uppercase tracking-wider">
                  Display Hardware Configuration
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDisplayType('cathode')}
                    className={`flex-1 py-1.5 rounded-lg border font-semibold cursor-pointer transition-all ${
                      displayType === 'cathode' 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs font-bold' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Common Cathode (Active HIGH)
                  </button>
                  <button
                    onClick={() => setDisplayType('anode')}
                    className={`flex-1 py-1.5 rounded-lg border font-semibold cursor-pointer transition-all ${
                      displayType === 'anode' 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs font-bold' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Common Anode (Active LOW)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-bold uppercase tracking-wider">
                  Select Digit to Display (0–F Hex)
                </label>
                <select
                  value={digitHex}
                  onChange={(e) => setDigitHex(e.target.value)}
                  className="bg-white border border-slate-300 text-indigo-950 font-mono text-xs px-3 py-2 rounded-lg w-full focus:outline-hidden focus:border-indigo-500 font-bold cursor-pointer shadow-2xs"
                >
                  {['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'].map((ch) => (
                    <option key={ch} value={ch} className="bg-white text-slate-800">
                      Hex Digit {ch} — 8255 Data Code: 0x{(segmentCodesCathode[ch] || 0).toString(16).toUpperCase().padStart(2, '0')}H
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-xs flex justify-between items-center shadow-2xs">
                <span className="text-slate-600">8255 Output Data Code:</span>
                <strong className="text-emerald-700 font-bold">0x{activeCode.toString(16).toUpperCase().padStart(2, '0')}H</strong>
              </div>

              {/* Segment bit breakdown */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1 font-mono text-[10px] shadow-2xs">
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Port A Pin Breakdown (D7=dp ... D0=a):</span>
                <div className="grid grid-cols-8 gap-1 text-center font-bold">
                  {['dp', 'g', 'f', 'e', 'd', 'c', 'b', 'a'].map((seg, idx) => {
                    const bit = (activeCode >> (7 - idx)) & 1;
                    return (
                      <div 
                        key={seg} 
                        className={`py-1 rounded border transition-all ${
                          bit ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}
                      >
                        <div>{seg}</div>
                        <div className="text-[8px]">{bit}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Visual 7-Segment Renderer on Crisp Light Background */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center space-y-3">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                Live 7-Segment LED Display Matrix
              </span>
              <div className="relative w-32 h-44 bg-white border-2 border-indigo-200 rounded-2xl p-4 flex items-center justify-center shadow-xs">
                <div className="text-7xl font-mono font-extrabold text-indigo-700 tracking-widest drop-shadow-xs">
                  {digitHex}
                </div>
              </div>
              <p className="text-[11px] text-slate-600 text-center font-sans">
                Segments a–g mapped to 8255 Port A pins PA0–PA6 through 330Ω current-limiting resistors.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: 4x4 MATRIX KEYPAD INTERFACING */}
      {activeTab === 'keypad' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Keypad Buttons */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-bold uppercase tracking-wider">
                  Interactive 4x4 Matrix Keypad (Click any Key)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {keypadMatrix.map((row, rIdx) => 
                    row.map((k) => {
                      const isSelected = pressedKey === k;
                      return (
                        <button
                          key={k}
                          onClick={() => handleKeyPress(k, rIdx)}
                          className={`py-3 rounded-xl font-mono text-base font-bold cursor-pointer transition-all border shadow-xs ${
                            isSelected 
                              ? 'bg-indigo-600 text-white border-indigo-700 scale-105 shadow-md shadow-indigo-600/20' 
                              : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
                          }`}
                        >
                          {k}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] flex justify-between items-center shadow-2xs font-mono">
                <span className="text-slate-600">Pressed Key:</span>
                <strong className="text-indigo-700 font-extrabold text-sm">{pressedKey}</strong>
              </div>
            </div>

            {/* Row Scan & Column Sense Logic */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
              <span className="font-bold text-indigo-950 text-xs uppercase tracking-wider block">
                Row Scanning &amp; Column Detection Logic
              </span>

              <div className="space-y-2 font-mono text-[10px]">
                <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-1">
                  <div className="text-slate-500 font-bold uppercase">Port A (Rows OUT - Active LOW scan):</div>
                  <div className="grid grid-cols-4 gap-1 text-center font-bold">
                    {['R0 (PA0)', 'R1 (PA1)', 'R2 (PA2)', 'R3 (PA3)'].map((r, idx) => (
                      <div 
                        key={r} 
                        className={`py-1 rounded border ${activeScanRow === idx ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
                      >
                        {r}: {activeScanRow === idx ? '0 (LOW)' : '1 (HIGH)'}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-1">
                  <div className="text-slate-500 font-bold uppercase">Port B (Columns IN - Pull-up to +5V):</div>
                  <div className="grid grid-cols-4 gap-1 text-center font-bold">
                    {['C0 (PB0)', 'C1 (PB1)', 'C2 (PB2)', 'C3 (PB3)'].map((c) => (
                      <div key={c} className="py-1 rounded bg-slate-50 border border-slate-200 text-slate-700">
                        {c}: 0 (Key Pressed)
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                The 8086 grounds one row at a time via Port A and reads Port B. If any bit in Port B is 0, the key at the intersection of that row and column is detected!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: TRAFFIC LIGHT CONTROLLER INTERFACING */}
      {activeTab === 'traffic' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Traffic Intersection Visual */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-between space-y-3">
              <div className="w-full flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-bold text-indigo-950 text-xs uppercase tracking-wider">
                  4-Way Traffic Intersection State
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded font-bold">
                  8255 Port A: {trafficStates[trafficStateIndex].portA}
                </span>
              </div>

              {/* Roadway graphic with live LEDs */}
              <div className="w-full max-w-[280px] aspect-square bg-slate-200 border-2 border-slate-300 rounded-2xl relative flex items-center justify-center p-3 shadow-inner">
                {/* Road layout lines */}
                <div className="absolute w-20 h-full bg-slate-100 border-x border-slate-300" />
                <div className="absolute h-20 w-full bg-slate-100 border-y border-slate-300" />

                {/* North-South Traffic Lights (Top & Bottom) */}
                <div className="absolute top-2 flex flex-col items-center bg-slate-800 p-1.5 rounded-lg border border-slate-700 space-y-1 shadow-md z-10">
                  <div className={`w-3 h-3 rounded-full border border-white/40 ${trafficStates[trafficStateIndex].ns === 'red' ? 'bg-rose-500 shadow-md shadow-rose-500/80' : 'bg-rose-950/40'}`} />
                  <div className={`w-3 h-3 rounded-full border border-white/40 ${trafficStates[trafficStateIndex].ns === 'yellow' ? 'bg-amber-400 shadow-md shadow-amber-400/80' : 'bg-amber-950/40'}`} />
                  <div className={`w-3 h-3 rounded-full border border-white/40 ${trafficStates[trafficStateIndex].ns === 'green' ? 'bg-emerald-500 shadow-md shadow-emerald-500/80' : 'bg-emerald-950/40'}`} />
                  <span className="text-[7px] text-slate-300 font-mono font-bold">N/S</span>
                </div>

                <div className="absolute bottom-2 flex flex-col items-center bg-slate-800 p-1.5 rounded-lg border border-slate-700 space-y-1 shadow-md z-10">
                  <div className={`w-3 h-3 rounded-full border border-white/40 ${trafficStates[trafficStateIndex].ns === 'red' ? 'bg-rose-500 shadow-md shadow-rose-500/80' : 'bg-rose-950/40'}`} />
                  <div className={`w-3 h-3 rounded-full border border-white/40 ${trafficStates[trafficStateIndex].ns === 'yellow' ? 'bg-amber-400 shadow-md shadow-amber-400/80' : 'bg-amber-950/40'}`} />
                  <div className={`w-3 h-3 rounded-full border border-white/40 ${trafficStates[trafficStateIndex].ns === 'green' ? 'bg-emerald-500 shadow-md shadow-emerald-500/80' : 'bg-emerald-950/40'}`} />
                  <span className="text-[7px] text-slate-300 font-mono font-bold">N/S</span>
                </div>

                {/* East-West Traffic Lights (Left & Right) */}
                <div className="absolute left-2 flex items-center bg-slate-800 p-1.5 rounded-lg border border-slate-700 space-x-1 shadow-md z-10">
                  <div className={`w-3 h-3 rounded-full border border-white/40 ${trafficStates[trafficStateIndex].ew === 'red' ? 'bg-rose-500 shadow-md shadow-rose-500/80' : 'bg-rose-950/40'}`} />
                  <div className={`w-3 h-3 rounded-full border border-white/40 ${trafficStates[trafficStateIndex].ew === 'yellow' ? 'bg-amber-400 shadow-md shadow-amber-400/80' : 'bg-amber-950/40'}`} />
                  <div className={`w-3 h-3 rounded-full border border-white/40 ${trafficStates[trafficStateIndex].ew === 'green' ? 'bg-emerald-500 shadow-md shadow-emerald-500/80' : 'bg-emerald-950/40'}`} />
                  <span className="text-[7px] text-slate-300 font-mono font-bold">E/W</span>
                </div>

                <div className="absolute right-2 flex items-center bg-slate-800 p-1.5 rounded-lg border border-slate-700 space-x-1 shadow-md z-10">
                  <div className={`w-3 h-3 rounded-full border border-white/40 ${trafficStates[trafficStateIndex].ew === 'red' ? 'bg-rose-500 shadow-md shadow-rose-500/80' : 'bg-rose-950/40'}`} />
                  <div className={`w-3 h-3 rounded-full border border-white/40 ${trafficStates[trafficStateIndex].ew === 'yellow' ? 'bg-amber-400 shadow-md shadow-amber-400/80' : 'bg-amber-950/40'}`} />
                  <div className={`w-3 h-3 rounded-full border border-white/40 ${trafficStates[trafficStateIndex].ew === 'green' ? 'bg-emerald-500 shadow-md shadow-emerald-500/80' : 'bg-emerald-950/40'}`} />
                  <span className="text-[7px] text-slate-300 font-mono font-bold">E/W</span>
                </div>
              </div>

              <button
                onClick={() => setTrafficRunning(!trafficRunning)}
                className={`w-full py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all ${
                  trafficRunning ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {trafficRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {trafficRunning ? 'Pause Traffic Sequencer' : 'Run Auto Traffic Sequencer'}
              </button>
            </div>

            {/* State Table & Signal Mapping */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between">
              <span className="font-bold text-indigo-950 text-xs uppercase tracking-wider block">
                8255 Port A Pin Assignments (Active HIGH)
              </span>

              <div className="space-y-1.5 font-mono text-[10px]">
                {trafficStates.map((st, idx) => {
                  const isCurrent = trafficStateIndex === idx;
                  return (
                    <div 
                      key={idx}
                      onClick={() => setTrafficStateIndex(idx)}
                      className={`p-2 rounded-lg border cursor-pointer transition-all ${
                        isCurrent 
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-bold shadow-xs' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>Phase {idx + 1}: {st.name}</span>
                        <span className="text-indigo-600 font-bold">{st.portA}</span>
                      </div>
                      <div className="text-[9px] text-slate-500 font-sans mt-0.5">
                        Hold Duration: {st.duration / 1000}s software delay
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-600">
                Port A bits: <strong className="text-slate-800">PA0=NS Red, PA1=NS Yellow, PA2=NS Green, PA3=EW Red, PA4=EW Yellow, PA5=EW Green</strong>.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: 8086 ASSEMBLY LANGUAGE PROGRAM (ALP) */}
      {activeTab === 'alp' && (
        <div className="space-y-3">
          {/* Sub-selector for different ALP routines */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            {[
              { id: 'stepper', label: '1. Stepper Motor ALP (Full-Step CW/CCW)' },
              { id: 'seven-seg', label: '2. 7-Segment Display ALP (XLAT)' },
              { id: 'keypad', label: '3. 4x4 Matrix Keypad Scan ALP' },
              { id: 'traffic', label: '4. Traffic Light Controller ALP' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedAlp(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedAlp === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Stepper Motor ALP */}
          {selectedAlp === 'stepper' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-[11px] space-y-2">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-bold text-indigo-900 uppercase">
                  Stepper Motor Interfacing ALP (Line-by-Line Commented)
                </span>
                <span className="text-slate-500 text-[10px] font-sans">Mode 0, Port A = 80H, Control Reg = 86H</span>
              </div>

              <pre className="text-slate-800 leading-relaxed overflow-x-auto whitespace-pre">
{`; =========================================================================
; 8086 ALP: Stepper Motor Continuous Rotation via Intel 8255 PPI
; Hardware Map: Port A = 80H (Drive), Port B = 82H, Control Word Reg = 86H
; Driver: ULN2003A Darlington Sink Inputs connected to PA0-PA3
; =========================================================================

.MODEL SMALL                  ; Specify small memory model (single CS and DS)
.STACK 64                     ; Reserve 64 bytes of stack space for CALL/RET
.DATA                         ; Begin data segment definition
  ; 4-Phase Full-Step (2-Phase ON) Excitation Lookup Table (4-bit PA0-PA3)
  STEP_CW  DB 03H, 06H, 0CH, 09H ; Clockwise: Coils AB (03H) -> BC (06H) -> CD (0CH) -> DA (09H)
  STEP_CCW DB 09H, 0CH, 06H, 03H ; Counter-Clockwise excitation sequence (reversed)

.CODE                         ; Begin code segment definition
MAIN PROC                     ; Program entry point
  MOV AX, @DATA               ; Load address of data segment into AX register
  MOV DS, AX                  ; Initialize Data Segment (DS) register with segment base

  ; --- STEP 1: INITIALIZE 8255 PPI IN MODE 0 ---
  MOV AL, 80H                 ; Load Control Word 80H (10000000b: Mode 0, Port A/B/C = Output)
  OUT 86H, AL                 ; Send Control Word to 8255 Control Register at I/O Port 86H

  ; --- STEP 2: CONTINUOUS STEPPING LOOP ---
ROTATE_LOOP:
  MOV SI, 0                   ; Reset Source Index (SI) pointer to start of step array
  MOV CX, 4                   ; Load step counter with 4 (4 excitation states per electrical cycle)

STEP_CYCLE:
  MOV AL, STEP_CW[SI]         ; Fetch current phase excitation byte from memory into AL
  OUT 80H, AL                 ; Write excitation byte to Port A (80H) -> ULN2003 In1-In4
  CALL DELAY                  ; Call software delay loop to allow rotor mechanical step settling
  INC SI                      ; Advance SI to point to next step code in lookup table
  LOOP STEP_CYCLE             ; Decrement CX; repeat STEP_CYCLE until all 4 steps complete

  JMP ROTATE_LOOP             ; Loop indefinitely for continuous smooth clockwise rotation

; -------------------------------------------------------------------------
; Software Nested Delay Subroutine (Generates ~50ms pulse interval)
; -------------------------------------------------------------------------
DELAY PROC                    ; Begin delay procedure
  PUSH CX                     ; Save outer loop counter (CX) onto stack
  MOV CX, 0FFFFH              ; Load CX with maximum 16-bit count (65535 loop iterations)
D1:                           ; Inner loop label
  LOOP D1                     ; Decrement CX and loop back until CX = 0 (~2 clock cycles/loop)
  POP CX                      ; Restore original outer loop counter from stack
  RET                         ; Return control to calling instruction in main procedure
DELAY ENDP                    ; End delay procedure

MAIN ENDP                     ; End main procedure
END MAIN                      ; End of program assembly with entry point`}
              </pre>
            </div>
          )}

          {/* 7-Segment Display ALP */}
          {selectedAlp === 'seven-seg' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-[11px] space-y-2">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-bold text-indigo-900 uppercase">
                  7-Segment LED Display ALP with Table Lookup (Line-by-Line Commented)
                </span>
                <span className="text-slate-500 text-[10px] font-sans">Common Cathode Configuration (Active HIGH)</span>
              </div>

              <pre className="text-slate-800 leading-relaxed overflow-x-auto whitespace-pre">
{`; =========================================================================
; 8086 ALP: Display Hex Digit on 7-Segment Display via 8255 Port A using XLAT
; Segment Wiring: PA0=a, PA1=b, PA2=c, PA3=d, PA4=e, PA5=f, PA6=g, PA7=dp
; =========================================================================

.MODEL SMALL                  ; Define small memory model
.STACK 64                     ; Allocate 64 bytes for stack storage
.DATA                         ; Begin data segment
  ; Common Cathode 7-Segment Lookup Table for Hex Digits 0 to F
  TABLE DB 3FH, 06H, 5BH, 4FH ; 0: 3FH, 1: 06H, 2: 5BH, 3: 4FH
        DB 66H, 6DH, 7DH, 07H ; 4: 66H, 5: 6DH, 6: 7DH, 7: 07H
        DB 7FH, 6FH, 77H, 7CH ; 8: 7FH, 9: 6FH, A: 77H, B: 7CH
        DB 39H, 5EH, 79H, 71H ; C: 39H, D: 5EH, E: 79H, F: 71H
  DIGIT DB 08H                ; Hex digit to be displayed (e.g., Digit 8)

.CODE                         ; Begin code segment
MAIN PROC                     ; Program entry point
  MOV AX, @DATA               ; Load address of data segment into AX
  MOV DS, AX                  ; Initialize DS register with data segment base

  ; Step 1: Initialize 8255 in Mode 0 (Port A as Output)
  MOV AL, 80H                 ; Control byte 80H (Mode 0, all ports output)
  OUT 86H, AL                 ; Write to 8255 control register at port 86H

  ; Step 2: Convert Hex Digit into 7-Segment Pattern using XLAT
  MOV BX, OFFSET TABLE        ; Load base address of 7-segment lookup table into BX register
  MOV AL, DIGIT               ; Load raw hexadecimal digit (00H - 0FH) into AL register
  XLAT                        ; Translate: AL = [BX + AL] -> fetches segment bit pattern

  ; Step 3: Output Pattern to 7-Segment Display
  OUT 80H, AL                 ; Send 7-segment byte code to 8255 Port A (port 80H)

  MOV AH, 4CH                 ; DOS terminate process function call
  INT 21H                     ; Return to operating system

MAIN ENDP                     ; End main procedure
END MAIN                      ; End program assembly`}
              </pre>
            </div>
          )}

          {/* 4x4 Keypad Scan ALP */}
          {selectedAlp === 'keypad' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-[11px] space-y-2">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-bold text-indigo-900 uppercase">
                  4x4 Matrix Keypad Scanning Subroutine (Line-by-Line Commented)
                </span>
                <span className="text-slate-500 text-[10px] font-sans">Port A = Rows (OUT), Port B = Cols (IN)</span>
              </div>

              <pre className="text-slate-800 leading-relaxed overflow-x-auto whitespace-pre">
{`; =========================================================================
; 8086 ALP: 4x4 Matrix Keypad Scanning with Hardware Debounce via 8255
; Port A (80H) = Rows OUT (Active-LOW Grounding), Port B (82H) = Columns IN
; Control Word = 82H (Port A Output, Port B Input)
; =========================================================================

.MODEL SMALL                  ; Define small memory model
.STACK 64                     ; Allocate stack memory
.DATA                         ; Begin data segment
  KEY_CODE DB ?               ; Variable to store detected key code

.CODE                         ; Begin code segment
MAIN PROC
  MOV AX, @DATA               ; Load data segment address into AX
  MOV DS, AX                  ; Initialize DS register

  ; Step 1: Configure 8255 (Port A = Output, Port B = Input)
  MOV AL, 82H                 ; Control byte 82H: Mode 0, Port A=OUT, Port B=IN
  OUT 86H, AL                 ; Write to 8255 control register (86H)

WAIT_KEY_PRESS:
  ; Step 2: Ground all rows to detect ANY key closure
  MOV AL, 00H                 ; Send LOW (0V) on all 4 row lines PA0-PA3
  OUT 80H, AL                 ; Output to Port A
  IN AL, 82H                  ; Read column lines PB0-PB3 from Port B
  AND AL, 0FH                 ; Mask upper 4 unused bits
  CMP AL, 0FH                 ; Compare with 0FH (1111b: all columns pulled HIGH)
  JZ WAIT_KEY_PRESS           ; If zero flag set (all HIGH), no key pressed; keep waiting

  ; Step 3: Software Debounce Delay (20ms)
  CALL DEBOUNCE_DELAY         ; Wait 20ms to allow mechanical switch contact bounce to settle

  ; Step 4: Row-by-Row Sequential Scan
  ; --- Scan Row 0 (PA0 = 0, PA1-PA3 = 1 -> 0FEH) ---
  MOV AL, 0FEH                ; Ground only Row 0
  OUT 80H, AL                 ; Output to Port A
  IN AL, 82H                  ; Read Port B column pins
  AND AL, 0FH                 ; Mask upper nibble
  CMP AL, 0FH                 ; Check if key is pressed in Row 0
  JNZ ROW0_DETECTED           ; If not 0FH, key is in Row 0! Jump to decode

  ; --- Scan Row 1 (PA1 = 0, PA0,PA2,PA3 = 1 -> 0FDH) ---
  MOV AL, 0FDH                ; Ground only Row 1
  OUT 80H, AL                 ; Output to Port A
  IN AL, 82H                  ; Read Port B
  AND AL, 0FH                 ; Mask upper nibble
  CMP AL, 0FH                 ; Check if key is in Row 1
  JNZ ROW1_DETECTED           ; If not 0FH, key is in Row 1! Jump to decode

ROW0_DETECTED:
  ; Identify column and store key
  MOV KEY_CODE, AL            ; Save column bitmask
  HLT                         ; Halt execution after detection

DEBOUNCE_DELAY PROC
  PUSH CX                     ; Save CX
  MOV CX, 07FFFH              ; Load loop count for ~20ms delay
D_LOOP:
  LOOP D_LOOP                 ; Decrement CX until 0
  POP CX                      ; Restore CX
  RET                         ; Return to caller
DEBOUNCE_DELAY ENDP

MAIN ENDP
END MAIN`}
              </pre>
            </div>
          )}

          {/* Traffic Light Controller ALP */}
          {selectedAlp === 'traffic' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-[11px] space-y-2">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-bold text-indigo-900 uppercase">
                  Traffic Light Controller 4-Phase Sequencer ALP (Line-by-Line Commented)
                </span>
                <span className="text-slate-500 text-[10px] font-sans">8255 Port A: PA0–PA5 driving LED indicators</span>
              </div>

              <pre className="text-slate-800 leading-relaxed overflow-x-auto whitespace-pre">
{`; =========================================================================
; 8086 ALP: 4-Way Traffic Light Controller Sequencer via 8255 Port A
; Pin Mapping: PA0=NS Red, PA1=NS Yellow, PA2=NS Green, PA3=EW Red, PA4=EW Yellow, PA5=EW Green
; =========================================================================

.MODEL SMALL                  ; Define small memory model
.STACK 64                     ; Allocate stack memory
.DATA                         ; Begin data segment
  ; 4 Traffic Phases: 
  ; Phase 1 (21H): NS Green (PA2=1) & EW Red (PA3=1) -> 00100001b = 21H
  ; Phase 2 (11H): NS Yellow (PA1=1) & EW Red (PA3=1) -> 00010001b = 11H
  ; Phase 3 (0CH): NS Red (PA0=1) & EW Green (PA5=1) -> 00001100b = 0CH
  ; Phase 4 (0AH): NS Red (PA0=1) & EW Yellow (PA4=1) -> 00001010b = 0AH
  PHASE_CODES DB 21H, 11H, 0CH, 0AH

.CODE                         ; Begin code segment
MAIN PROC
  MOV AX, @DATA               ; Load base address of data segment
  MOV DS, AX                  ; Initialize DS register

  ; Step 1: Configure 8255 in Mode 0 (Port A = Output)
  MOV AL, 80H                 ; Control byte 80H (Mode 0, all ports output)
  OUT 86H, AL                 ; Write to 8255 control port (86H)

TRAFFIC_CYCLE:
  MOV SI, 0                   ; Reset table pointer to Phase 1

PHASE_LOOP:
  MOV AL, PHASE_CODES[SI]     ; Load active traffic phase output code into AL
  OUT 80H, AL                 ; Send control signals to Port A (80H) driving LED drivers
  CALL EXTENDED_DELAY         ; Call extended timing delay (e.g. green/yellow duration)
  INC SI                      ; Advance to next traffic phase code
  CMP SI, 4                   ; Check if all 4 phases have executed
  JNZ PHASE_LOOP              ; If not 4, continue with next phase in cycle

  JMP TRAFFIC_CYCLE           ; Repeat traffic sequence continuously

EXTENDED_DELAY PROC
  PUSH CX                     ; Save CX
  MOV CX, 0FFFFH              ; Outer delay counter
L1:
  PUSH CX                     ; Save outer loop counter
  MOV CX, 0080H               ; Inner delay counter
L2:
  LOOP L2                     ; Inner loop
  POP CX                      ; Restore outer loop counter
  LOOP L1                     ; Decrement outer counter
  POP CX                      ; Restore original CX
  RET                         ; Return to sequencer loop
EXTENDED_DELAY ENDP

MAIN ENDP
END MAIN`}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
