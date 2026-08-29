import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Sliders, 
  Play, 
  Pause, 
  Zap, 
  CheckCircle2, 
  RefreshCw, 
  Cpu, 
  BarChart3, 
  Gauge, 
  Info, 
  HelpCircle, 
  Layers, 
  Clock, 
  Percent, 
  AlertTriangle, 
  Compass 
} from 'lucide-react';

interface AnalogInterfacingSimulatorProps {
  initialTab?: 'adc' | 'characteristics' | 'dac';
  allowedTabs?: ('adc' | 'characteristics' | 'dac')[];
}

export default function AnalogInterfacingSimulator({
  initialTab = 'adc',
  allowedTabs
}: AnalogInterfacingSimulatorProps) {
  const [activeTab, setActiveTab] = useState<'adc' | 'characteristics' | 'dac'>(initialTab);

  // Sync with initialTab prop if it changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // ==========================================
  // TAB 1: ADC 0808 State
  // ==========================================
  const [selectedChannel, setSelectedChannel] = useState<number>(0);
  const [analogVin, setAnalogVin] = useState<number>(2.50); // 0V to 5V
  const [eocStatus, setEocStatus] = useState<boolean>(true); // End of Conversion HIGH
  const [adcConverting, setAdcConverting] = useState<boolean>(false);

  // ADC digital value calculation: 8-bit output = (Vin / 5.0) * 255
  const adcDigitalVal = Math.min(255, Math.max(0, Math.round((analogVin / 5.0) * 255)));
  const adcHex = adcDigitalVal.toString(16).toUpperCase().padStart(2, '0') + 'H';

  const handleStartAdcConversion = () => {
    setAdcConverting(true);
    setEocStatus(false);
    setTimeout(() => {
      setAdcConverting(false);
      setEocStatus(true);
    }, 600);
  };

  // ==========================================
  // TAB 2: ADC Characteristics Explorer State
  // ==========================================
  const [adcBits, setAdcBits] = useState<number>(8);
  const [refVoltage, setRefVoltage] = useState<number>(5.0);
  const [clockFreqKhz, setClockFreqKhz] = useState<number>(640); // 640 kHz standard for ADC0808
  const [adcArch, setAdcArch] = useState<'sar' | 'flash' | 'dual-slope' | 'sigma-delta'>('sar');
  const [charVin, setCharVin] = useState<number>(2.5); // Voltage for interactive transfer tester
  const [activeCharCard, setActiveCharCard] = useState<string>('resolution');
  const [errorSimulation, setErrorSimulation] = useState<'ideal' | 'dnl' | 'inl' | 'offset' | 'gain'>('ideal');

  // Computed ADC Metrics
  const totalLevels = Math.pow(2, adcBits);
  const lsbStepVolts = refVoltage / totalLevels;
  const lsbStepMv = lsbStepVolts * 1000;
  const quantErrorMaxMv = lsbStepMv / 2;
  const theoreticalSnrDb = 6.02 * adcBits + 1.76;
  const dynamicRangeDb = 6.02 * adcBits;
  const percentageResolution = (1 / totalLevels) * 100;

  // Conversion time based on architecture & clock
  let clockCyclesNeeded = 64; // ADC0808 SAR typical (8 bits x 8 internal sequencer states)
  if (adcArch === 'sar') {
    clockCyclesNeeded = adcBits === 8 ? 64 : adcBits * 6;
  } else if (adcArch === 'flash') {
    clockCyclesNeeded = 1; // 1 clock cycle (parallel comparators)
  } else if (adcArch === 'dual-slope') {
    clockCyclesNeeded = Math.pow(2, adcBits + 1); // e.g. 512 for 8-bit
  } else if (adcArch === 'sigma-delta') {
    clockCyclesNeeded = 256; // oversampling ratio (OSR)
  }

  const convTimeUs = (clockCyclesNeeded / (clockFreqKhz * 1000)) * 1000000;
  const maxSamplingRateSps = (clockFreqKhz * 1000) / clockCyclesNeeded;
  const nyquistBandwidthKhz = (maxSamplingRateSps / 2) / 1000;

  // Instantaneous conversion for characteristic test voltage
  let effectiveVin = charVin;
  if (errorSimulation === 'offset') {
    effectiveVin = Math.max(0, Math.min(refVoltage, charVin - (lsbStepVolts * 1.5)));
  } else if (errorSimulation === 'gain') {
    effectiveVin = Math.min(refVoltage, charVin * 0.9);
  }

  const charDigitalCode = Math.min(totalLevels - 1, Math.max(0, Math.floor(effectiveVin / lsbStepVolts)));
  const charQuantizedVoltage = charDigitalCode * lsbStepVolts;
  const charExactQuantErrorMv = (charVin - (charQuantizedVoltage + lsbStepVolts / 2)) * 1000;

  // ==========================================
  // TAB 3: DAC State
  // ==========================================
  const [waveType, setWaveType] = useState<'square' | 'sawtooth' | 'triangle' | 'sine'>('sine');
  const [timeStep, setTimeStep] = useState<number>(0);

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

  const allTabs = [
    { id: 'adc', label: 'ADC 0808 Hardware Lab' },
    { id: 'characteristics', label: 'Characteristics of ADC 📊' },
    { id: 'dac', label: 'DAC 0800 Waveform Generator' }
  ] as const;

  const visibleTabs = allowedTabs 
    ? allTabs.filter(t => allowedTabs.includes(t.id))
    : allTabs;

  return (
    <div className="bg-white text-slate-800 p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs font-sans">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-200 text-indigo-600">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">8086 Analog Interfacing (ADC &amp; DAC)</h3>
            <p className="text-[11px] text-slate-500">ADC 0808 Conversion, Static &amp; Dynamic Characteristics, and DAC 0800 Scope</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 flex-wrap">
          {visibleTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer text-xs ${
                activeTab === t.id 
                  ? 'bg-white text-indigo-700 shadow-xs font-bold border border-slate-200/80' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: ADC 0808 HARDWARE LAB                                   */}
      {/* ============================================================== */}
      {activeTab === 'adc' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Analog Inputs */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-bold uppercase tracking-wider">
                  8-Channel Multiplexer Channel Select (ADD A, B, C)
                </label>
                <div className="grid grid-cols-4 gap-1 font-mono">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((ch) => (
                    <button
                      key={ch}
                      onClick={() => setSelectedChannel(ch)}
                      className={`py-1.5 rounded font-bold cursor-pointer transition-all ${
                        selectedChannel === ch 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs font-bold' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      IN{ch}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-slate-600 font-bold uppercase tracking-wider">Analog Voltage Input V_IN ({analogVin.toFixed(2)} V)</span>
                  <span className="text-slate-500 font-mono">Vref = 5.00 V</span>
                </div>
                <input
                  type="range"
                  min="0.00"
                  max="5.00"
                  step="0.05"
                  value={analogVin}
                  onChange={(e) => setAnalogVin(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <button
                onClick={handleStartAdcConversion}
                disabled={adcConverting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${adcConverting ? 'animate-spin' : ''}`} />
                {adcConverting ? 'Converting (SOC Pulse Active)...' : 'Pulse START / SOC (Start Conversion)'}
              </button>
            </div>

            {/* ADC Digital Output & Pin Monitor */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-bold text-indigo-950 text-xs uppercase tracking-wider">ADC Pins &amp; Digital Output</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                  eocStatus 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                    : 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                }`}>
                  EOC Pin: {eocStatus ? 'HIGH (Ready)' : 'LOW (Converting)'}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1 font-mono shadow-2xs">
                <div className="text-[10px] text-slate-500 flex justify-between">
                  <span>Calculated 8-Bit Binary Output:</span>
                  <strong className="text-emerald-700 text-xs font-bold">{adcHex} ({adcDigitalVal} Decimal)</strong>
                </div>
                <div className="grid grid-cols-8 gap-1 text-center font-bold text-[10px]">
                  {Array.from({ length: 8 }, (_, i) => {
                    const bit = (adcDigitalVal >> (7 - i)) & 1;
                    return (
                      <div
                        key={i}
                        className={`py-1.5 rounded border transition-all ${
                          bit 
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' 
                            : 'bg-slate-100 border-slate-200 text-slate-400'
                        }`}
                      >
                        D{7 - i}: {bit}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-600 shadow-2xs">
                Resolution: 5.0 V / 256 = <strong className="text-slate-900">19.53 mV per LSB</strong> step.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: CHARACTERISTICS OF ADC (COMPREHENSIVE SPECIFICATIONS)     */}
      {/* ============================================================== */}
      {activeTab === 'characteristics' && (
        <div className="space-y-4">
          {/* Top Interactive Configuration Bar */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                  ADC Parameter Simulator &amp; Specification Engine
                </span>
              </div>
              <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200 font-semibold">
                {adcBits}-Bit {adcArch.toUpperCase()} @ {refVoltage.toFixed(2)}V Ref
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 1. Resolution / Bits */}
              <div>
                <label className="text-[10px] text-slate-600 block mb-1 font-bold uppercase tracking-wider">
                  Resolution (n Bits)
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[8, 10, 12, 16].map((b) => (
                    <button
                      key={b}
                      onClick={() => setAdcBits(b)}
                      className={`py-1 rounded font-bold text-xs cursor-pointer transition-all ${
                        adcBits === b 
                          ? 'bg-indigo-600 text-white shadow-2xs' 
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {b}-bit
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Reference Voltage */}
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <label className="text-slate-600 font-bold uppercase tracking-wider">V_REF ({refVoltage.toFixed(2)}V)</label>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {[2.56, 3.30, 5.00].map((v) => (
                    <button
                      key={v}
                      onClick={() => setRefVoltage(v)}
                      className={`py-1 rounded font-bold text-[11px] cursor-pointer transition-all ${
                        refVoltage === v 
                          ? 'bg-indigo-600 text-white shadow-2xs' 
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {v.toFixed(2)}V
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Clock Frequency */}
              <div>
                <label className="text-[10px] text-slate-600 block mb-1 font-bold uppercase tracking-wider">
                  ADC Clock (f_clk)
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { label: '640 kHz', val: 640 },
                    { label: '1.0 MHz', val: 1000 },
                    { label: '2.0 MHz', val: 2000 }
                  ].map((c) => (
                    <button
                      key={c.val}
                      onClick={() => setClockFreqKhz(c.val)}
                      className={`py-1 rounded font-bold text-[10px] cursor-pointer transition-all ${
                        clockFreqKhz === c.val 
                          ? 'bg-indigo-600 text-white shadow-2xs' 
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Architecture */}
              <div>
                <label className="text-[10px] text-slate-600 block mb-1 font-bold uppercase tracking-wider">
                  Architecture Model
                </label>
                <div className="grid grid-cols-2 gap-1 font-semibold text-[10px]">
                  <button
                    onClick={() => setAdcArch('sar')}
                    className={`py-1 rounded cursor-pointer transition-all ${
                      adcArch === 'sar' 
                        ? 'bg-indigo-600 text-white font-bold shadow-2xs' 
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    SAR (ADC0808)
                  </button>
                  <button
                    onClick={() => setAdcArch('flash')}
                    className={`py-1 rounded cursor-pointer transition-all ${
                      adcArch === 'flash' 
                        ? 'bg-indigo-600 text-white font-bold shadow-2xs' 
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Flash (Parallel)
                  </button>
                </div>
              </div>
            </div>

            {/* Calculated Key Performance Metrics (6 Cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs text-left">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">1 LSB Step Size</span>
                <span className="text-sm font-bold text-indigo-700 block font-mono">
                  {lsbStepMv >= 1 ? `${lsbStepMv.toFixed(2)} mV` : `${(lsbStepMv * 1000).toFixed(1)} µV`}
                </span>
                <span className="text-[8.5px] text-slate-400">Vref / 2^{adcBits}</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs text-left">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Quantization Error</span>
                <span className="text-sm font-bold text-emerald-700 block font-mono">
                  ±{quantErrorMaxMv >= 1 ? `${quantErrorMaxMv.toFixed(2)} mV` : `${(quantErrorMaxMv * 1000).toFixed(1)} µV`}
                </span>
                <span className="text-[8.5px] text-slate-400">± ½ LSB step</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs text-left">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Conversion Time (Tc)</span>
                <span className="text-sm font-bold text-amber-700 block font-mono">
                  {convTimeUs >= 1 ? `${convTimeUs.toFixed(1)} µs` : `${(convTimeUs * 1000).toFixed(0)} ns`}
                </span>
                <span className="text-[8.5px] text-slate-400">{clockCyclesNeeded} clock cycles</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs text-left">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Max Sampling Rate</span>
                <span className="text-sm font-bold text-purple-700 block font-mono">
                  {maxSamplingRateSps >= 1000000 
                    ? `${(maxSamplingRateSps / 1000000).toFixed(1)} MSPS` 
                    : `${(maxSamplingRateSps / 1000).toFixed(1)} kSPS`}
                </span>
                <span className="text-[8.5px] text-slate-400">fs = 1 / Tc</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs text-left">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Theoretical SNR</span>
                <span className="text-sm font-bold text-cyan-700 block font-mono">
                  {theoreticalSnrDb.toFixed(2)} dB
                </span>
                <span className="text-[8.5px] text-slate-400">6.02n + 1.76 dB</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs text-left">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Nyquist Bandwidth</span>
                <span className="text-sm font-bold text-rose-700 block font-mono">
                  {nyquistBandwidthKhz >= 1000 
                    ? `${(nyquistBandwidthKhz / 1000).toFixed(2)} MHz` 
                    : `${nyquistBandwidthKhz.toFixed(1)} kHz`}
                </span>
                <span className="text-[8.5px] text-slate-400">f_max = fs / 2</span>
              </div>
            </div>
          </div>

          {/* Interactive Transfer Function & Non-Linearity Visualizer */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                  Interactive Quantization Transfer Function &amp; Error Response
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="text-slate-500 font-semibold">Simulate Error:</span>
                {[
                  { id: 'ideal', label: 'Ideal' },
                  { id: 'dnl', label: 'DNL (+0.8 LSB)' },
                  { id: 'inl', label: 'INL (Curved)' },
                  { id: 'offset', label: 'Offset (+1.5 LSB)' },
                  { id: 'gain', label: 'Gain Error (10%)' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setErrorSimulation(m.id as any)}
                    className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                      errorSimulation === m.id 
                        ? 'bg-indigo-600 text-white font-bold' 
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
              {/* Transfer Curve SVG */}
              <div className="md:col-span-2 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex justify-between items-center mb-1 text-[10px] text-slate-500">
                  <span className="font-bold">Digital Output Code (Quantization Staircase)</span>
                  <span className="font-mono">Resolution: {totalLevels} Levels ({percentageResolution.toFixed(3)}%)</span>
                </div>

                <svg viewBox="0 0 360 160" className="w-full h-36 bg-slate-950 rounded-lg p-2 overflow-visible">
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="340" y2="20" stroke="#334155" strokeDasharray="2 2" strokeWidth="0.5" />
                  <line x1="40" y1="50" x2="340" y2="50" stroke="#334155" strokeDasharray="2 2" strokeWidth="0.5" />
                  <line x1="40" y1="80" x2="340" y2="80" stroke="#334155" strokeDasharray="2 2" strokeWidth="0.5" />
                  <line x1="40" y1="110" x2="340" y2="110" stroke="#334155" strokeDasharray="2 2" strokeWidth="0.5" />
                  <line x1="40" y1="140" x2="340" y2="140" stroke="#475569" strokeWidth="1" />
                  <line x1="40" y1="20" x2="40" y2="140" stroke="#475569" strokeWidth="1" />

                  {/* Axis Labels */}
                  <text x="35" y="25" fill="#94a3b8" fontSize="7.5" textAnchor="end">FS (111..)</text>
                  <text x="35" y="83" fill="#94a3b8" fontSize="7.5" textAnchor="end">½ FS</text>
                  <text x="35" y="142" fill="#94a3b8" fontSize="7.5" textAnchor="end">000..</text>

                  <text x="40" y="152" fill="#94a3b8" fontSize="7.5" textAnchor="middle">0V</text>
                  <text x="190" y="152" fill="#94a3b8" fontSize="7.5" textAnchor="middle">Vref / 2</text>
                  <text x="340" y="152" fill="#94a3b8" fontSize="7.5" textAnchor="middle">{refVoltage.toFixed(1)}V (Vref)</text>

                  {/* Ideal Linear Reference Line */}
                  <line x1="40" y1="140" x2="340" y2="20" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.6" />

                  {/* Quantization Staircase (8-step representative visual) */}
                  {(() => {
                    const steps = 8;
                    const stepW = 300 / steps;
                    const stepH = 120 / steps;
                    const pathParts: string[] = [];

                    for (let s = 0; s < steps; s++) {
                      let startX = 40 + s * stepW;
                      let startY = 140 - s * stepH;
                      let endX = startX + stepW;

                      if (errorSimulation === 'dnl' && s === 4) {
                        endX += stepW * 0.7; // stretched step
                      } else if (errorSimulation === 'offset') {
                        startX += 20;
                        endX += 20;
                      } else if (errorSimulation === 'inl') {
                        startY += Math.sin((s / steps) * Math.PI) * 12; // bow curve
                      }

                      if (s === 0) {
                        pathParts.push(`M ${startX} ${startY}`);
                      } else {
                        pathParts.push(`L ${startX} ${startY}`);
                      }
                      pathParts.push(`L ${endX} ${startY}`);
                    }

                    return (
                      <path 
                        d={pathParts.join(' ')} 
                        fill="none" 
                        stroke={errorSimulation === 'ideal' ? '#10b981' : '#f59e0b'} 
                        strokeWidth="2" 
                      />
                    );
                  })()}

                  {/* Active V_IN Marker */}
                  {(() => {
                    const markerX = 40 + (charVin / refVoltage) * 300;
                    const markerCodeFraction = charDigitalCode / (totalLevels - 1);
                    const markerY = 140 - markerCodeFraction * 120;

                    return (
                      <g>
                        <line x1={markerX} y1="20" x2={markerX} y2="140" stroke="#ec4899" strokeWidth="1.5" strokeDasharray="3 2" />
                        <circle cx={markerX} cy={markerY} r="4" fill="#ec4899" stroke="#ffffff" strokeWidth="1.5" />
                        <text x={markerX} y="15" fill="#f472b6" fontSize="8" fontWeight="bold" textAnchor="middle">
                          Vin = {charVin.toFixed(2)}V
                        </text>
                      </g>
                    );
                  })()}
                </svg>
              </div>

              {/* Live Test Point Output */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2.5 text-left shadow-2xs">
                <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                  <span className="font-bold text-[11px] text-slate-800">Test Point Input (Vin)</span>
                  <span className="font-mono font-bold text-indigo-700 text-xs">{charVin.toFixed(3)} V</span>
                </div>

                <input
                  type="range"
                  min="0.00"
                  max={refVoltage}
                  step="0.01"
                  value={charVin}
                  onChange={(e) => setCharVin(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />

                <div className="space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between bg-slate-50 p-1.5 rounded border border-slate-100">
                    <span className="text-slate-600">Digital Output:</span>
                    <strong className="text-emerald-700">{charDigitalCode} / {totalLevels - 1}</strong>
                  </div>
                  <div className="flex justify-between bg-slate-50 p-1.5 rounded border border-slate-100">
                    <span className="text-slate-600">Binary Output:</span>
                    <strong className="text-indigo-700">
                      {charDigitalCode.toString(2).padStart(adcBits, '0')}B
                    </strong>
                  </div>
                  <div className="flex justify-between bg-slate-50 p-1.5 rounded border border-slate-100">
                    <span className="text-slate-600">Quantized Vout:</span>
                    <strong className="text-slate-900">{charQuantizedVoltage.toFixed(3)} V</strong>
                  </div>
                  <div className="flex justify-between bg-slate-50 p-1.5 rounded border border-slate-100">
                    <span className="text-slate-600">Quant. Error eq:</span>
                    <strong className={Math.abs(charExactQuantErrorMv) <= quantErrorMaxMv ? 'text-emerald-600' : 'text-amber-600'}>
                      {charExactQuantErrorMv >= 0 ? `+${charExactQuantErrorMv.toFixed(1)}` : charExactQuantErrorMv.toFixed(1)} mV
                    </strong>
                  </div>
                </div>

                {errorSimulation !== 'ideal' && (
                  <div className="p-2 rounded bg-amber-50 border border-amber-200 text-[10px] text-amber-800 font-sans flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600 mt-0.5" />
                    <span>
                      {errorSimulation === 'dnl' && 'DNL Error: Non-uniform step widths. If DNL < -1 LSB, missing codes occur.'}
                      {errorSimulation === 'inl' && 'INL Error: Curvature away from straight transfer line; degrades total accuracy.'}
                      {errorSimulation === 'offset' && 'Offset Error: Zero-input shift. All code thresholds shifted by +1.5 LSB.'}
                      {errorSimulation === 'gain' && 'Gain Error: Slope deviation. Output falls short of full-scale by 10%.'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Core Characteristics Cards Grid */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-600" />
              Complete Engineering Breakdown of ADC Characteristics
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* 1. Resolution */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">1</span>
                    Resolution (Step Size / 1 LSB)
                  </span>
                  <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-bold">
                    V_LSB = V_ref / 2^n
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  The smallest change in analog input voltage that causes a 1-bit change in the digital output word. For an <strong>n-bit</strong> ADC with reference voltage <strong>Vref</strong>, resolution is defined as:
                </p>
                <div className="bg-white p-2 rounded-lg border border-slate-200 font-mono text-[10px] text-slate-800 space-y-0.5">
                  <div>• <strong>8-bit ADC0808 (5V):</strong> 5V / 256 = <strong className="text-indigo-700">19.53 mV (0.390% FS)</strong></div>
                  <div>• <strong>10-bit ADC (5V):</strong> 5V / 1024 = <strong className="text-indigo-700">4.88 mV (0.098% FS)</strong></div>
                  <div>• <strong>12-bit ADC (5V):</strong> 5V / 4096 = <strong className="text-indigo-700">1.22 mV (0.024% FS)</strong></div>
                  <div>• <strong>16-bit ADC (5V):</strong> 5V / 65536 = <strong className="text-indigo-700">76.29 µV (0.0015% FS)</strong></div>
                </div>
              </div>

              {/* 2. Quantization Error */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">2</span>
                    Quantization Error &amp; Noise (eq)
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                    eq_max = ± ½ LSB
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Inherent, unavoidable rounding uncertainty created by partitioning a continuous analog voltage into discrete digital steps. 
                  The error is strictly bounded between <strong>-½ LSB and +½ LSB</strong> (±9.76 mV for 8-bit 5V).
                </p>
                <div className="bg-white p-2 rounded-lg border border-slate-200 font-mono text-[10px] text-slate-800 space-y-0.5">
                  <div>• <strong>Peak Uncertainty:</strong> ± ½ · (Vref / 2^n)</div>
                  <div>• <strong>RMS Quantization Noise Voltage:</strong> V_q(rms) = V_LSB / √12</div>
                  <div>• <strong>Theoretical Peak SNR:</strong> SNR = 6.02·n + 1.76 dB (49.92 dB for 8-bit)</div>
                </div>
              </div>

              {/* 3. Conversion Time */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">3</span>
                    Conversion Time (Tc) &amp; Clock Speed
                  </span>
                  <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold">
                    Tc = N_cycles / f_clk
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Total elapsed time from when the 8086 processor asserts the <strong>START / SOC pulse</strong> until the ADC drives its <strong>EOC (End of Conversion)</strong> pin HIGH.
                </p>
                <div className="bg-white p-2 rounded-lg border border-slate-200 font-mono text-[10px] text-slate-800 space-y-0.5">
                  <div>• <strong>ADC 0808 (SAR):</strong> Requires 64–72 clock cycles = <strong>~100 µs @ 640 kHz</strong></div>
                  <div>• <strong>Flash ADC:</strong> Requires only <strong>1 clock cycle (&lt; 20–50 ns)</strong></div>
                  <div>• <strong>Dual-Slope ADC:</strong> Requires 2^(n+1) cycles = <strong>~20–100 ms (Slow)</strong></div>
                </div>
              </div>

              {/* 4. Sampling Rate & Nyquist */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">4</span>
                    Sampling Rate &amp; Nyquist Criterion
                  </span>
                  <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-bold">
                    fs ≥ 2 · f_max
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Maximum conversions completed per second (SPS). By the <strong>Nyquist-Shannon sampling theorem</strong>, the sampling frequency fs must be at least twice the maximum input frequency to avoid aliasing.
                </p>
                <div className="bg-white p-2 rounded-lg border border-slate-200 font-mono text-[10px] text-slate-800 space-y-0.5">
                  <div>• <strong>ADC 0808 Throughput:</strong> fs ≈ 10 kSPS → Max input bandwidth = <strong>5 kHz</strong></div>
                  <div>• <strong>Anti-Aliasing Filter (AAF):</strong> Low-pass filter placed before ADC input</div>
                  <div>• <strong>Sample &amp; Hold (S/H):</strong> Holds analog voltage steady during conversion</div>
                </div>
              </div>

              {/* 5. DNL & INL */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">5</span>
                    Linearity Errors (DNL &amp; INL)
                  </span>
                  <span className="text-[10px] font-mono text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-bold">
                    |DNL| &lt; 1 LSB (No Missing Codes)
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Static accuracy deviations from the ideal linear quantization staircase transfer function:
                </p>
                <div className="bg-white p-2 rounded-lg border border-slate-200 font-mono text-[10px] text-slate-800 space-y-0.5">
                  <div>• <strong>DNL (Differential Non-Linearity):</strong> Difference between actual step width and ideal 1 LSB. If DNL &lt; -1 LSB, a <strong>Missing Code</strong> occurs!</div>
                  <div>• <strong>INL (Integral Non-Linearity):</strong> Maximum deviation of actual curve from best-fit straight line. ADC0808 spec: ±½ LSB.</div>
                </div>
              </div>

              {/* 6. Monotonicity & Dynamic Specs */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">6</span>
                    Monotonicity &amp; Dynamic Specs (ENOB/THD)
                  </span>
                  <span className="text-[10px] font-mono text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 font-bold">
                    ENOB = (SINAD - 1.76) / 6.02
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  An ADC is <strong>monotonic</strong> if the digital output code strictly increases or remains constant (never decreases) as the analog input increases. Guaranteed when |DNL| ≤ 1 LSB.
                </p>
                <div className="bg-white p-2 rounded-lg border border-slate-200 font-mono text-[10px] text-slate-800 space-y-0.5">
                  <div>• <strong>THD:</strong> Total Harmonic Distortion (harmonics / fundamental)</div>
                  <div>• <strong>SINAD:</strong> Signal-to-Noise-and-Distortion ratio in dB</div>
                  <div>• <strong>Aperture Jitter:</strong> Uncertainty in exact sampling instant (limits max input slew rate)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Industrial ADC Comparison Table */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-left">
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-indigo-600" />
              Standard Industrial ADC IC Architecture &amp; Characteristic Comparison
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] border-collapse bg-white rounded-lg border border-slate-200 overflow-hidden font-sans">
                <thead>
                  <tr className="bg-indigo-50/80 text-indigo-950 border-b border-slate-200 text-left font-bold">
                    <th className="p-2 border-r border-slate-200">IC Part</th>
                    <th className="p-2 border-r border-slate-200">Architecture</th>
                    <th className="p-2 border-r border-slate-200">Bits (Resolution)</th>
                    <th className="p-2 border-r border-slate-200">Channels</th>
                    <th className="p-2 border-r border-slate-200">Conversion Time (Tc)</th>
                    <th className="p-2 border-r border-slate-200">Sampling Rate</th>
                    <th className="p-2">8086 / Microprocessor Interface</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[10px]">
                  <tr className="hover:bg-slate-50/80 font-bold bg-indigo-50/30">
                    <td className="p-2 border-r border-slate-200 text-indigo-800">ADC 0808 / 0809</td>
                    <td className="p-2 border-r border-slate-200 font-normal">SAR (Successive Approx.)</td>
                    <td className="p-2 border-r border-slate-200 text-emerald-700">8-Bit (19.5 mV)</td>
                    <td className="p-2 border-r border-slate-200">8 Channels</td>
                    <td className="p-2 border-r border-slate-200 text-amber-700">100 µs @ 640 kHz</td>
                    <td className="p-2 border-r border-slate-200">10 kSPS</td>
                    <td className="p-2 font-normal">Parallel Tri-state bus via 8255 PPI (Port A/C)</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80">
                    <td className="p-2 border-r border-slate-200 font-bold">MCP3008</td>
                    <td className="p-2 border-r border-slate-200">SAR (Charge Redistribution)</td>
                    <td className="p-2 border-r border-slate-200 text-emerald-700">10-Bit (4.88 mV)</td>
                    <td className="p-2 border-r border-slate-200">8 Channels</td>
                    <td className="p-2 border-r border-slate-200 text-amber-700">5 µs</td>
                    <td className="p-2 border-r border-slate-200">200 kSPS</td>
                    <td className="p-2">Serial 4-Wire SPI Interface</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80">
                    <td className="p-2 border-r border-slate-200 font-bold">ADS1115</td>
                    <td className="p-2 border-r border-slate-200">Sigma-Delta (ΣΔ with PGA)</td>
                    <td className="p-2 border-r border-slate-200 text-emerald-700">16-Bit (7.8 µV)</td>
                    <td className="p-2 border-r border-slate-200">4 Diff / Single</td>
                    <td className="p-2 border-r border-slate-200 text-amber-700">1.16 ms</td>
                    <td className="p-2 border-r border-slate-200">860 SPS</td>
                    <td className="p-2">Serial 2-Wire I2C Interface</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80">
                    <td className="p-2 border-r border-slate-200 font-bold">TLC5510 / AD9280</td>
                    <td className="p-2 border-r border-slate-200">Flash / Pipelined</td>
                    <td className="p-2 border-r border-slate-200 text-emerald-700">8-Bit (19.5 mV)</td>
                    <td className="p-2 border-r border-slate-200">1 Channel</td>
                    <td className="p-2 border-r border-slate-200 text-amber-700">31.25 ns</td>
                    <td className="p-2 border-r border-slate-200 font-bold text-purple-700">32 MSPS</td>
                    <td className="p-2">High-Speed Parallel Video/DSP Bus</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80">
                    <td className="p-2 border-r border-slate-200 font-bold">ICL7106 / 7107</td>
                    <td className="p-2 border-r border-slate-200">Dual-Slope Integrating</td>
                    <td className="p-2 border-r border-slate-200 text-emerald-700">3½ Digit BCD</td>
                    <td className="p-2 border-r border-slate-200">1 Diff</td>
                    <td className="p-2 border-r border-slate-200 text-amber-700">333 ms</td>
                    <td className="p-2 border-r border-slate-200">3 SPS</td>
                    <td className="p-2">Direct 7-Segment LCD/LED Display Drive (DMMs)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: DAC 0800 WAVEFORM GENERATOR                             */}
      {/* ============================================================== */}
      {activeTab === 'dac' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Wave Selector */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-bold uppercase tracking-wider">
                  Select Generated Waveform Type
                </label>
                <div className="grid grid-cols-2 gap-2 font-semibold">
                  <button
                    onClick={() => setWaveType('sine')}
                    className={`py-1.5 rounded border cursor-pointer transition-all ${
                      waveType === 'sine' 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs font-bold' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Sine Wave
                  </button>
                  <button
                    onClick={() => setWaveType('square')}
                    className={`py-1.5 rounded border cursor-pointer transition-all ${
                      waveType === 'square' 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs font-bold' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Square Wave
                  </button>
                  <button
                    onClick={() => setWaveType('sawtooth')}
                    className={`py-1.5 rounded border cursor-pointer transition-all ${
                      waveType === 'sawtooth' 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs font-bold' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Sawtooth Wave
                  </button>
                  <button
                    onClick={() => setWaveType('triangle')}
                    className={`py-1.5 rounded border cursor-pointer transition-all ${
                      waveType === 'triangle' 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs font-bold' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Triangular Wave
                  </button>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] space-y-1 shadow-2xs text-left">
                <div className="flex justify-between text-slate-600">
                  <span>Op-Amp Stage:</span>
                  <strong className="text-emerald-700 font-bold">LM741 Transimpedance</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Output Peak Voltage:</span>
                  <strong className="text-slate-900 font-mono font-bold">0.00 V to 5.00 V</strong>
                </div>
              </div>
            </div>

            {/* Live Scope Display */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col items-center justify-between space-y-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Analog Oscilloscope Output</span>
              <div className="w-full bg-white rounded-xl border border-slate-200 p-2 overflow-hidden flex items-center justify-center shadow-xs">
                <svg width={scopeWidth} height={scopeHeight} className="overflow-visible">
                  {/* Grid Lines */}
                  <line x1="0" y1="50" x2={scopeWidth} y2="50" stroke="#cbd5e1" strokeDasharray="3 3" />
                  <line x1="150" y1="0" x2="150" y2={scopeHeight} stroke="#cbd5e1" strokeDasharray="3 3" />
                  {/* Waveform Line */}
                  <path d={svgPath} fill="none" stroke="#4f46e5" strokeWidth="2.5" />
                </svg>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">
                Continuous digital data written to 8255 Port A at timed delay intervals.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
