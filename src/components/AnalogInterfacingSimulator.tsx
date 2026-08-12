import React, { useState, useEffect } from 'react';
import { Activity, Sliders, Play, Pause, Zap, CheckCircle2, RefreshCw } from 'lucide-react';

export default function AnalogInterfacingSimulator() {
  const [activeTab, setActiveTab] = useState<'adc' | 'dac'>('adc');

  // ADC State
  const [selectedChannel, setSelectedChannel] = useState<number>(0);
  const [analogVin, setAnalogVin] = useState<number>(2.50); // 0V to 5V
  const [eocStatus, setEocStatus] = useState<boolean>(true); // End of Conversion HIGH
  const [adcConverting, setAdcConverting] = useState<boolean>(false);

  // ADC digital value calculation: 8-bit output = (Vin / 5.0) * 255
  const adcDigitalVal = Math.min(255, Math.max(0, Math.round((analogVin / 5.0) * 255)));
  const adcHex = adcDigitalVal.toString(16).toUpperCase().padStart(2, '0') + 'H';

  // DAC State
  const [waveType, setWaveType] = useState<'square' | 'sawtooth' | 'triangle' | 'sine'>('sine');
  const [waveFrequency, setWaveFrequency] = useState<number>(100); // Hz
  const [timeStep, setTimeStep] = useState<number>(0);

  const handleStartAdcConversion = () => {
    setAdcConverting(true);
    setEocStatus(false);
    setTimeout(() => {
      setAdcConverting(false);
      setEocStatus(true);
    }, 600);
  };

  // DAC Waveform scope generator loop
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStep((t) => (t + 1) % 100);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  // Generate Canvas Scope Path
  const scopeWidth = 300;
  const scopeHeight = 100;
  const points: [number, number][] = [];

  for (let x = 0; x < scopeWidth; x += 3) {
    const t = (x + timeStep * 3) / 30;
    let yVal = 0.5; // normalized 0 to 1

    if (waveType === 'sine') {
      yVal = 0.5 + 0.4 * Math.sin(t);
    } else if (waveType === 'square') {
      yVal = Math.sin(t) >= 0 ? 0.9 : 0.1;
    } else if (waveType === 'sawtooth') {
      yVal = (t % (2 * Math.PI)) / (2 * Math.PI);
    } else if (waveType === 'triangle') {
      const phase = (t % (2 * Math.PI)) / (2 * Math.PI);
      yVal = phase < 0.5 ? phase * 2 : (1 - phase) * 2;
    }

    const yPixel = scopeHeight - (yVal * (scopeHeight - 16) + 8);
    points.push([x, yPixel]);
  }

  const svgPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');

  return (
    <div className="bg-slate-900 text-slate-100 p-4 md:p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4 text-xs font-sans">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600/20 rounded-xl border border-indigo-500/30 text-indigo-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">8086 Analog Interfacing (ADC &amp; DAC)</h3>
            <p className="text-[11px] text-slate-400">ADC 0808 Conversion &amp; DAC 0800 Waveform Generation Scope</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 gap-1">
          <button
            onClick={() => setActiveTab('adc')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'adc' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            ADC 0808 (Analog to Digital)
          </button>
          <button
            onClick={() => setActiveTab('dac')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'dac' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            DAC 0800 Waveform Generator
          </button>
        </div>
      </div>

      {/* TAB 1: ADC 0808 */}
      {activeTab === 'adc' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Analog Inputs */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-bold uppercase tracking-wider">
                  8-Channel Multiplexer Channel Select (ADD A, B, C)
                </label>
                <div className="grid grid-cols-4 gap-1 font-mono">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((ch) => (
                    <button
                      key={ch}
                      onClick={() => setSelectedChannel(ch)}
                      className={`py-1 rounded font-bold cursor-pointer ${selectedChannel === ch ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                    >
                      IN{ch}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Analog Voltage Input V_IN ({analogVin.toFixed(2)} V)</span>
                  <span className="text-slate-400 font-mono">Vref = 5.00 V</span>
                </div>
                <input
                  type="range"
                  min="0.00"
                  max="5.00"
                  step="0.05"
                  value={analogVin}
                  onChange={(e) => setAnalogVin(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <button
                onClick={handleStartAdcConversion}
                disabled={adcConverting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${adcConverting ? 'animate-spin' : ''}`} />
                {adcConverting ? 'Converting (SOC Pulse Active)...' : 'Pulse START / SOC (Start Conversion)'}
              </button>
            </div>

            {/* ADC Digital Output & Pin Monitor */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="font-bold text-indigo-300 text-xs uppercase tracking-wider">ADC Pins &amp; Digital Output</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${eocStatus ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400 animate-pulse'}`}>
                  EOC Pin: {eocStatus ? 'HIGH (Ready)' : 'LOW (Converting)'}
                </span>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1 font-mono">
                <div className="text-[10px] text-slate-400 flex justify-between">
                  <span>Calculated 8-Bit Binary Output:</span>
                  <strong className="text-emerald-400 text-xs">{adcHex} ({adcDigitalVal} Decimal)</strong>
                </div>
                <div className="grid grid-cols-8 gap-1 text-center font-bold text-[10px]">
                  {Array.from({ length: 8 }, (_, i) => {
                    const bit = (adcDigitalVal >> (7 - i)) & 1;
                    return (
                      <div
                        key={i}
                        className={`py-1.5 rounded border ${bit ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-600'}`}
                      >
                        D{7 - i}: {bit}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-2 bg-slate-900 rounded border border-slate-800 text-[10.5px] text-slate-300">
                Resolution: 5.0 V / 256 = <strong>19.53 mV per LSB</strong> step.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DAC 0800 Waveform Generator */}
      {activeTab === 'dac' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Wave Selector */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-bold uppercase tracking-wider">
                  Select Generated Waveform Type
                </label>
                <div className="grid grid-cols-2 gap-2 font-semibold">
                  <button
                    onClick={() => setWaveType('sine')}
                    className={`py-1.5 rounded border cursor-pointer ${waveType === 'sine' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    Sine Wave
                  </button>
                  <button
                    onClick={() => setWaveType('square')}
                    className={`py-1.5 rounded border cursor-pointer ${waveType === 'square' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    Square Wave
                  </button>
                  <button
                    onClick={() => setWaveType('sawtooth')}
                    className={`py-1.5 rounded border cursor-pointer ${waveType === 'sawtooth' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    Sawtooth Wave
                  </button>
                  <button
                    onClick={() => setWaveType('triangle')}
                    className={`py-1.5 rounded border cursor-pointer ${waveType === 'triangle' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    Triangular Wave
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-[11px] space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Op-Amp Stage:</span>
                  <strong className="text-emerald-400 font-bold">LM741 Transimpedance</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Output Peak Voltage:</span>
                  <strong className="text-white font-mono">0.00 V to 5.00 V</strong>
                </div>
              </div>
            </div>

            {/* Live Scope Display */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col items-center justify-between space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Analog Oscilloscope Output</span>
              <div className="w-full bg-slate-900 rounded-xl border border-slate-800 p-2 overflow-hidden flex items-center justify-center">
                <svg width={scopeWidth} height={scopeHeight} className="overflow-visible">
                  {/* Grid Lines */}
                  <line x1="0" y1="50" x2={scopeWidth} y2="50" stroke="#334155" strokeDasharray="3 3" />
                  <line x1="150" y1="0" x2="150" y2={scopeHeight} stroke="#334155" strokeDasharray="3 3" />
                  {/* Waveform Line */}
                  <path d={svgPath} fill="none" stroke="#34d399" strokeWidth="2.5" />
                </svg>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Continuous digital data written to 8255 Port A at timed delay intervals.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
