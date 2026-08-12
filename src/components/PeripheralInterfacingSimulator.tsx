import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCw, RotateCcw, Lightbulb, Zap, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function PeripheralInterfacingSimulator() {
  const [activeTab, setActiveTab] = useState<'display' | 'stepper'>('display');

  // 7-Segment Display state
  const [displayType, setDisplayType] = useState<'cathode' | 'anode'>('cathode');
  const [digitHex, setDigitHex] = useState<string>('0');

  // Stepper Motor State
  const [driveMode, setDriveMode] = useState<'wave' | 'full' | 'half'>('full');
  const [direction, setDirection] = useState<'cw' | 'ccw'>('cw');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [motorAngle, setMotorAngle] = useState<number>(0);

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
        setMotorAngle((prev) => (direction === 'cw' ? prev + 18 : prev - 18));
      }, 400);
    }
    return () => clearInterval(timer);
  }, [isRunning, direction, currentSequence]);

  return (
    <div className="bg-slate-900 text-slate-100 p-4 md:p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4 text-xs font-sans">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600/20 rounded-xl border border-indigo-500/30 text-indigo-400">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">8086 Peripheral Interfacing Simulator</h3>
            <p className="text-[11px] text-slate-400">Seven-Segment Displays, Switches &amp; Stepper Motor Driver</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 gap-1">
          <button
            onClick={() => setActiveTab('display')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'display' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            7-Segment Display
          </button>
          <button
            onClick={() => setActiveTab('stepper')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'stepper' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Stepper Motor Control
          </button>
        </div>
      </div>

      {/* TAB 1: 7-Segment Display */}
      {activeTab === 'display' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Display Controls */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-bold uppercase tracking-wider">
                  Display Hardware Configuration
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDisplayType('cathode')}
                    className={`flex-1 py-1.5 rounded-lg border font-semibold cursor-pointer ${displayType === 'cathode' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    Common Cathode (Active HIGH)
                  </button>
                  <button
                    onClick={() => setDisplayType('anode')}
                    className={`flex-1 py-1.5 rounded-lg border font-semibold cursor-pointer ${displayType === 'anode' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    Common Anode (Active LOW)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-bold uppercase tracking-wider">
                  Select Digit to Display (0–F Hex)
                </label>
                <select
                  value={digitHex}
                  onChange={(e) => setDigitHex(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-emerald-400 font-mono text-xs px-3 py-2 rounded-lg w-full focus:outline-none focus:border-indigo-500 font-bold cursor-pointer"
                >
                  {['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'].map((ch) => (
                    <option key={ch} value={ch} className="bg-slate-900 text-slate-100">
                      Hex Digit {ch} — 8255 Data Code: 0x{(segmentCodesCathode[ch] || 0).toString(16).toUpperCase().padStart(2, '0')}H
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono text-xs flex justify-between items-center">
                <span>8255 Output Data Code:</span>
                <strong className="text-emerald-400 font-bold">0x{activeCode.toString(16).toUpperCase().padStart(2, '0')}H</strong>
              </div>
            </div>

            {/* Visual 7-Segment Renderer */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Live LED Segment Matrix</span>
              <div className="relative w-28 h-40 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-center">
                <div className="text-6xl font-mono font-extrabold text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.8)] tracking-widest">
                  {digitHex}
                </div>
              </div>
              <p className="text-[11px] text-slate-400 text-center font-sans">
                Segments a–g mapped to 8255 Port pins D0–D6.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Stepper Motor Control */}
      {activeTab === 'stepper' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Control Panel */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-bold uppercase tracking-wider">Drive Mode</label>
                <div className="grid grid-cols-3 gap-1.5 font-semibold">
                  <button
                    onClick={() => setDriveMode('wave')}
                    className={`py-1 rounded border ${driveMode === 'wave' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    Wave Drive (1-Phase)
                  </button>
                  <button
                    onClick={() => setDriveMode('full')}
                    className={`py-1 rounded border ${driveMode === 'full' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    Full Step (2-Phase)
                  </button>
                  <button
                    onClick={() => setDriveMode('half')}
                    className={`py-1 rounded border ${driveMode === 'half' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    Half Step (Half Angle)
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer ${isRunning ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isRunning ? 'Stop Motor' : 'Run Sequence'}
                </button>
                <button
                  onClick={() => setDirection(direction === 'cw' ? 'ccw' : 'cw')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer border border-slate-700"
                >
                  {direction === 'cw' ? <RotateCw className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
                  {direction.toUpperCase()}
                </button>
              </div>

              {/* ULN2003 Buffer Status */}
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">ULN2003 Driver Coils Output</span>
                <div className="grid grid-cols-4 gap-1.5 font-mono text-center text-[10px]">
                  {['Coil A', 'Coil B', 'Coil C', 'Coil D'].map((name, idx) => {
                    const active = ((coilStateByte >> idx) & 1) === 1;
                    return (
                      <div
                        key={name}
                        className={`py-1.5 rounded font-bold border ${active ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md' : 'bg-slate-950 border-slate-800 text-slate-600'}`}
                      >
                        {name}: {active ? 'ON' : 'OFF'}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Visual Motor Rotor */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center space-y-3">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Physical Motor Shaft Rotation</span>
              <div
                className="w-28 h-28 rounded-full border-4 border-indigo-500 bg-slate-900 relative flex items-center justify-center shadow-inner transition-transform duration-300"
                style={{ transform: `rotate(${motorAngle}deg)` }}
              >
                <div className="w-1.5 h-10 bg-emerald-400 rounded-full absolute top-2 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <div className="w-5 h-5 rounded-full bg-indigo-400 border-2 border-slate-900" />
              </div>
              <div className="text-[11px] font-mono text-slate-300">
                Angle: <strong className="text-white">{motorAngle}°</strong> | Output Byte: <strong className="text-emerald-400">0x0{coilStateByte.toString(16).toUpperCase()}H</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
