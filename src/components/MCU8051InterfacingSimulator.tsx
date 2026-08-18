import React, { useState } from 'react';
import {
  Clock,
  Radio,
  Zap,
  Monitor,
  Grid,
  Activity,
  Sliders,
  Cpu,
  RotateCcw,
  Table
} from 'lucide-react';

interface MCU8051InterfacingSimulatorProps {
  initialTab?: 'timers' | 'interrupts-lcd' | 'adc-dac' | 'stepper' | 'comparison';
}

export default function MCU8051InterfacingSimulator({ initialTab = 'timers' }: MCU8051InterfacingSimulatorProps) {
  const [activeTab, setActiveTab] = useState<'timers' | 'interrupts-lcd' | 'adc-dac' | 'stepper' | 'comparison'>(initialTab);

  // --- TAB 1: TIMERS & SERIAL ---
  const [timerMode, setTimerMode] = useState<'mode0' | 'mode1' | 'mode2'>('mode1');
  const [timerVal, setTimerVal] = useState<number>(0);
  const [baudRate, setBaudRate] = useState<number>(9600);
  const [sbufTx, setSbufTx] = useState<string>('A');
  const [serialLog, setSerialLog] = useState<string[]>([
    'UART Initialized: 9600 Baud (Timer 1 Mode 2 Auto-Reload, TH1 = 0xFD at 11.0592 MHz).'
  ]);

  // Handle timer step
  const handleTimerStep = () => {
    setTimerVal(prev => {
      const next = prev + 1000;
      if (next >= 65536) {
        return 0;
      }
      return next;
    });
  };

  const handleTransmitChar = () => {
    const charCode = sbufTx.charCodeAt(0) || 65;
    const hex = charCode.toString(16).toUpperCase().padStart(2, '0');
    setSerialLog(prev => [
      `[TX] Transmitted '${sbufTx}' (SBUF=0x${hex}, ASCII=${charCode}). TI flag set HIGH.`,
      ...prev
    ]);
  };

  // --- TAB 2: INTERRUPTS & LCD / KEYPAD ---
  const [lcdLine1, setLcdLine1] = useState<string>('MICROCONTROLLER');
  const [lcdLine2, setLcdLine2] = useState<string>('8051 INTERFACE');
  const [lcdRs, setLcdRs] = useState<boolean>(true); // true = Data, false = Command
  const [pressedKey, setPressedKey] = useState<string | null>('5');

  // --- TAB 3: ADC / DAC & SENSOR ---
  const [sensorTempC, setSensorTempC] = useState<number>(25);
  const adcDigitalOutput = Math.round((sensorTempC * 10 * 255) / 5000); // 10mV/C, Vref=5V
  const [dacValue, setDacValue] = useState<number>(128);
  const dacAnalogVoltage = ((dacValue / 255) * 5).toFixed(2);

  // --- TAB 4: STEPPER MOTOR & WAVEFORM ---
  const [stepperMode, setStepperMode] = useState<'wave' | 'full' | 'half'>('full');
  const [stepperAngle, setStepperAngle] = useState<number>(0);
  const [waveType, setWaveType] = useState<'square' | 'sawtooth' | 'triangular' | 'sine'>('square');

  const handleRotateStepper = () => {
    setStepperAngle(prev => (prev + 45) % 360);
  };

  // --- TAB 5: PROCESSOR COMPARISON MATRIX ---
  const comparisonData = [
    {
      feature: 'Core Architecture',
      mpu8086: '16-Bit CISC Microprocessor (von Neumann / Pipelined)',
      mcu8051: '8-Bit CISC Microcontroller (Harvard Architecture)',
      pic: '8/16/32-Bit RISC Microcontroller (Harvard / PIC16/PIC18/PIC24)',
      arm: '32/64-Bit Advanced RISC (ARM Cortex-M / Cortex-A)'
    },
    {
      feature: 'Internal On-Chip Memory',
      mpu8086: 'None (Requires external RAM, ROM, Timers, & I/O chips)',
      mcu8051: '128B RAM, 4KB ROM (Expandable up to 64KB)',
      pic: '256B–8KB SRAM, 4KB–128KB Flash ROM',
      arm: '32KB–1MB SRAM, 128KB–2MB Flash ROM'
    },
    {
      feature: 'Bus Structure',
      mpu8086: 'Multiplexed 20-bit Address / 16-bit Data Bus',
      mcu8051: 'Separate 16-bit Program ROM and 16-bit Data RAM Buses',
      pic: 'Separate Instruction and Data Buses (Harvard RISC)',
      arm: 'AMBA High-Performance Bus (AHB) / AXI Bus Architecture'
    },
    {
      feature: 'Instruction Pipeline',
      mpu8086: '2-Stage Parallel Overlap (6-Byte Prefetch Queue in BIU)',
      mcu8051: '1-Stage Single Fetch & Execute Cycle',
      pic: '2-Stage Single-Cycle Pipeline (Fetch & Execute overlap)',
      arm: '3-Stage to 8-Stage Pipeline (Fetch, Decode, Execute...)'
    },
    {
      feature: 'Operating Speed / Clock',
      mpu8086: '5 MHz – 10 MHz (12 Clock Cycles / Machine Cycle)',
      mcu8051: '12 MHz – 24 MHz (12 Clock Cycles / Machine Cycle)',
      pic: '20 MHz – 64 MHz (4 Clock Cycles / Instruction)',
      arm: '48 MHz – 1 GHz+ (1 Instruction per Clock Cycle - Single-Cycle)'
    },
    {
      feature: 'Primary Application Domain',
      mpu8086: 'General Purpose Personal Computers, Workstations',
      mcu8051: 'Embedded Control Systems, Smart Home Appliances, Automotive',
      pic: 'Low-Power Industrial Controllers, Automotive ECU',
      arm: 'Smartphones, IoT Edge Devices, Robotics, High-End Automotive'
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 bg-white text-slate-900 rounded-2xl shadow-sm border border-slate-200 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl">
            <Cpu className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 font-display">
              8051 Microcontroller Interfacing & Processor Suite
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              UNIT V • Timers, Serial, Interrupts, LCD/Keypad, ADC/DAC, Stepper & Processor Comparison
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
          <button
            onClick={() => setActiveTab('timers')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'timers'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            1. Timers & Serial
          </button>
          <button
            onClick={() => setActiveTab('interrupts-lcd')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'interrupts-lcd'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            2. Interrupts & LCD
          </button>
          <button
            onClick={() => setActiveTab('adc-dac')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'adc-dac'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            3. ADC / DAC & Sensor
          </button>
          <button
            onClick={() => setActiveTab('stepper')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'stepper'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            4. Stepper & Waves
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'comparison'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            5. MPU/MCU/PIC/ARM
          </button>
        </div>
      </div>

      {/* TAB 1: 8051 TIMERS & SERIAL PORT PROGRAMMING */}
      {activeTab === 'timers' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                8051 Timer 0 & Timer 1 Hardware Configurator
              </h3>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 font-mono">
                TMOD Register @ 89H
              </span>
            </div>

            {/* Timer Mode Selection */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'mode0', label: 'Mode 0 (13-Bit)', desc: '8-bit THx + 5-bit TLx prescaler' },
                { id: 'mode1', label: 'Mode 1 (16-Bit)', desc: 'Full 16-bit count (0000H–FFFFH)' },
                { id: 'mode2', label: 'Mode 2 (8-Bit Auto)', desc: 'THx reloads TLx automatically' },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setTimerMode(m.id as any)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    timerMode === m.id
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs font-bold'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <span className="block text-xs">{m.label}</span>
                  <span className={`text-[10px] block mt-1 ${timerMode === m.id ? 'text-indigo-100' : 'text-slate-500'}`}>
                    {m.desc}
                  </span>
                </button>
              ))}
            </div>

            {/* Live 16-Bit Timer Counter Gauge */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="font-bold text-slate-800">
                  Timer 0 Count Value (TH0:TL0 = 0x{timerVal.toString(16).toUpperCase().padStart(4, '0')}):
                </span>
                <span className="text-indigo-600 font-semibold">
                  {timerVal >= 65535 ? 'OVERFLOW (TF0 = 1)' : 'Counting...'}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                <div
                  className="bg-indigo-600 h-full transition-all duration-300"
                  style={{ width: `${(timerVal / 65535) * 100}%` }}
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleTimerStep}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all cursor-pointer shadow-2xs"
                >
                  Pulse Clock (+1000 Cycles)
                </button>
                <button
                  onClick={() => setTimerVal(0)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-lg hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Reset Count
                </button>
              </div>
            </div>
          </div>

          {/* Serial UART Configurator */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
            <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
                <Radio className="w-4 h-4 text-indigo-600" />
                Serial Port UART (SCON @ 98H)
              </h4>
              <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                SBUF @ 99H
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Select Standard Baud Rate:</label>
                <select
                  value={baudRate}
                  onChange={(e) => setBaudRate(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 font-bold focus:outline-none focus:border-indigo-500"
                >
                  <option value={9600}>9600 Baud (TH1 = 0xFD at 11.0592 MHz)</option>
                  <option value={4800}>4800 Baud (TH1 = 0xFA at 11.0592 MHz)</option>
                  <option value={2400}>2400 Baud (TH1 = 0xF4 at 11.0592 MHz)</option>
                  <option value={1200}>1200 Baud (TH1 = 0xE8 at 11.0592 MHz)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Transmit SBUF Byte:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={1}
                    value={sbufTx}
                    onChange={(e) => setSbufTx(e.target.value)}
                    className="w-16 p-2 text-center bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-indigo-700 uppercase"
                  />
                  <button
                    onClick={handleTransmitChar}
                    className="flex-1 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all cursor-pointer shadow-2xs"
                  >
                    Transmit via TXD (P3.1)
                  </button>
                </div>
              </div>

              {/* Serial Output Log */}
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 space-y-1 max-h-32 overflow-y-auto">
                <div className="text-slate-500 text-[10px] uppercase font-bold border-b border-slate-800 pb-1">
                  UART Console Output
                </div>
                {serialLog.map((log, idx) => (
                  <div key={idx} className="leading-tight">{log}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERRUPTS & LCD / KEYPAD INTERFACING */}
      {activeTab === 'interrupts-lcd' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LCD 16x2 Display Interface */}
          <div className="lg:col-span-7 bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
                <Monitor className="w-4 h-4 text-indigo-600" />
                HD44780 16x2 LCD Interface Module
              </h3>
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300 font-bold">
                RS={lcdRs ? '1 (Data)' : '0 (Cmd)'} | EN=1
              </span>
            </div>

            {/* Virtual LCD Screen */}
            <div className="bg-emerald-900 p-4 rounded-xl border-4 border-slate-800 shadow-inner font-mono text-emerald-300 tracking-widest space-y-1">
              <div className="bg-emerald-950/80 p-2 rounded text-center text-sm font-bold border border-emerald-800/60 shadow-inner">
                {lcdLine1.padEnd(16, ' ')}
              </div>
              <div className="bg-emerald-950/80 p-2 rounded text-center text-sm font-bold border border-emerald-800/60 shadow-inner">
                {lcdLine2.padEnd(16, ' ')}
              </div>
            </div>

            {/* LCD Controls */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">LCD Line 1 Text:</label>
                <input
                  type="text"
                  maxLength={16}
                  value={lcdLine1}
                  onChange={(e) => setLcdLine1(e.target.value.toUpperCase())}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono text-slate-800 font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-semibold mb-1">LCD Line 2 Text:</label>
                <input
                  type="text"
                  maxLength={16}
                  value={lcdLine2}
                  onChange={(e) => setLcdLine2(e.target.value.toUpperCase())}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono text-slate-800 font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Matrix Keypad 4x4 */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
            <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
                <Grid className="w-4 h-4 text-indigo-600" />
                4x4 Matrix Keypad Scanning
              </h4>
              <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                Pressed Key: {pressedKey || 'None'}
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Row scanning outputs LOW to Port 1 rows (P1.0–P1.3) and reads column inputs on P1.4–P1.7:
            </p>

            {/* 4x4 Keypad Grid */}
            <div className="grid grid-cols-4 gap-2 font-mono">
              {['1', '2', '3', 'A', '4', '5', '6', 'B', '7', '8', '9', 'C', '*', '0', '#', 'D'].map(key => (
                <button
                  key={key}
                  onClick={() => setPressedKey(key)}
                  className={`py-2.5 rounded-xl border text-sm font-bold cursor-pointer transition-all ${
                    pressedKey === key
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-md scale-105'
                      : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200/60'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ADC / DAC & SENSOR INTERFACING */}
      {activeTab === 'adc-dac' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Temperature Sensor LM35 & ADC 0804 Interfacing */}
          <div className="lg:col-span-7 bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                LM35 Temperature Sensor & ADC 0804 Interfacing
              </h3>
              <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                Resolution: 8-Bit (19.5 mV/step)
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Simulated Temperature Sensor Input (°C):</span>
                <span className="font-mono text-indigo-700 text-sm font-bold">{sensorTempC}°C ({sensorTempC * 10} mV)</span>
              </div>

              <input
                type="range"
                min={0}
                max={100}
                value={sensorTempC}
                onChange={(e) => setSensorTempC(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center text-slate-700">
                  <span>ADC0804 Digital Output (Port 0):</span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    0x{adcDigitalOutput.toString(16).toUpperCase().padStart(2, '0')} ({adcDigitalOutput} Decimal)
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span>Binary Output Lines (DB0–DB7):</span>
                  <span className="font-bold text-slate-800">
                    {adcDigitalOutput.toString(2).padStart(8, '0')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* DAC 0808 Interfacing */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
            <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                DAC 0808 Digital-to-Analog Converter
              </h4>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Digital Input Byte (0–255):</span>
                <span className="font-mono text-indigo-700 text-sm font-bold">{dacValue} (0x{dacValue.toString(16).toUpperCase().padStart(2, '0')})</span>
              </div>

              <input
                type="range"
                min={0}
                max={255}
                value={dacValue}
                onChange={(e) => setDacValue(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center text-slate-700">
                  <span>Calculated Analog Voltage Output:</span>
                  <span className="font-bold text-indigo-700 text-sm">{dacAnalogVoltage} V</span>
                </div>
                <div className="text-[11px] text-slate-500 leading-tight">
                  Formula: Vout = (Vref × Digital_Input) / 256 where Vref = 5.0 V.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STEPPER MOTOR & WAVEFORM GENERATION */}
      {activeTab === 'stepper' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Stepper Motor Driver */}
          <div className="lg:col-span-7 bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-600" />
                8051 Stepper Motor Interfacing & Drive Modes
              </h3>
              <div className="flex items-center gap-1">
                {(['wave', 'full', 'half'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setStepperMode(m)}
                    className={`px-2.5 py-1 text-xs font-bold font-mono rounded-lg border cursor-pointer capitalize ${
                      stepperMode === m
                        ? 'bg-indigo-600 text-white border-indigo-700'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {m} Drive
                  </button>
                ))}
              </div>
            </div>

            {/* Rotor Graphic & Step Trigger */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col items-center justify-center space-y-3">
              <div className="relative w-28 h-28 rounded-full border-4 border-indigo-500 bg-slate-900 flex items-center justify-center shadow-md">
                <div
                  className="w-1 h-12 bg-emerald-400 rounded-full origin-bottom transition-transform duration-300"
                  style={{ transform: `rotate(${stepperAngle}deg)` }}
                />
                <div className="w-4 h-4 bg-white rounded-full border-2 border-slate-800 absolute" />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleRotateStepper}
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Step Rotate (+45°)
                </button>
                <span className="font-mono text-xs text-slate-600 font-bold">
                  Rotor Angle: {stepperAngle}°
                </span>
              </div>
            </div>
          </div>

          {/* DAC Waveform Generator */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono border-b border-slate-100 pb-2">
              DAC Waveform Generator Mode
            </h4>

            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              {[
                { id: 'square', label: 'Square Wave' },
                { id: 'sawtooth', label: 'Sawtooth Wave' },
                { id: 'triangular', label: 'Triangular Wave' },
                { id: 'sine', label: 'Sine Wave' },
              ].map(w => (
                <button
                  key={w.id}
                  onClick={() => setWaveType(w.id as any)}
                  className={`p-2.5 rounded-xl border text-center font-bold cursor-pointer transition-all ${
                    waveType === w.id
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/60'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1 font-mono">
              <span className="font-bold text-indigo-700 block uppercase">Selected Waveform Loop:</span>
              <p className="text-slate-600 text-[11px]">
                {waveType === 'square' && 'Toggles Port 0 between 00H and FFH with hardware delay loops.'}
                {waveType === 'sawtooth' && 'Increments Port 0 from 00H to FFH in a continuous loop.'}
                {waveType === 'triangular' && 'Ramps Port 0 up from 00H to FFH, then decrements back to 00H.'}
                {waveType === 'sine' && 'Looks up precomputed sine table values from ROM using MOVC A, @A+DPTR.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PROCESSOR COMPARISON MATRIX (MPU vs MCU vs PIC vs ARM) */}
      {activeTab === 'comparison' && (
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
              <Table className="w-4 h-4 text-indigo-600" />
              Comparison: Microprocessor (8086), Microcontroller (8051), PIC & ARM Processors
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Comprehensive architectural feature breakdown across CISC MPU, 8051 MCU, PIC RISC, and ARM Cortex processors.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-2xs">
            <table className="w-full text-left text-xs font-sans border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-800 font-mono text-[11px] uppercase tracking-wider">
                  <th className="p-3.5 font-bold border-r border-slate-200">Architectural Feature</th>
                  <th className="p-3.5 font-bold border-r border-slate-200 text-indigo-700">Microprocessor (8086)</th>
                  <th className="p-3.5 font-bold border-r border-slate-200 text-emerald-700">Microcontroller (8051)</th>
                  <th className="p-3.5 font-bold border-r border-slate-200 text-amber-700">PIC Microcontroller</th>
                  <th className="p-3.5 font-bold text-purple-700">ARM Processor (Cortex)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {comparisonData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900 bg-slate-50/40 border-r border-slate-200 font-mono text-[11px]">
                      {row.feature}
                    </td>
                    <td className="p-3.5 text-slate-700 border-r border-slate-200 leading-relaxed">
                      {row.mpu8086}
                    </td>
                    <td className="p-3.5 text-slate-700 border-r border-slate-200 leading-relaxed bg-emerald-50/20 font-medium">
                      {row.mcu8051}
                    </td>
                    <td className="p-3.5 text-slate-700 border-r border-slate-200 leading-relaxed">
                      {row.pic}
                    </td>
                    <td className="p-3.5 text-slate-700 leading-relaxed bg-purple-50/20 font-medium">
                      {row.arm}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
