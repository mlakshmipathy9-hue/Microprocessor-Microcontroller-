import React, { useState } from 'react';
import { Cpu, Split, Zap, Layers, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface MCU8051PinoutDiagramProps {
  initialPort?: 'P0' | 'P1' | 'P2' | 'P3' | 'ALL';
  highlightSlide25?: boolean;
}

interface PinDef {
  pin: number;
  label: string;
  sublabel?: string;
  side: 'left' | 'right';
  port?: 'P0' | 'P1' | 'P2' | 'P3';
  type: 'port' | 'power' | 'clock' | 'control';
  desc: string;
  notes?: string;
}

export default function MCU8051PinoutDiagram({
  initialPort = 'P1',
  highlightSlide25 = true,
}: MCU8051PinoutDiagramProps) {
  const [selectedPort, setSelectedPort] = useState<'P0' | 'P1' | 'P2' | 'P3' | 'ALL'>(initialPort);
  const [selectedPin, setSelectedPin] = useState<number>(1); // Default to Pin 1 (P1.0)
  const [activeTab, setActiveTab] = useState<'slide25' | 'allPorts'>('slide25');

  // Left Pins 1-20
  const leftPins: PinDef[] = [
    { pin: 1, label: 'P1.0', sublabel: 'Port 1 Bit 0', side: 'left', port: 'P1', type: 'port', desc: 'Port 1 bit 0. Pure quasi-bidirectional I/O with internal pull-up resistor. Has no multiple functionality.' },
    { pin: 2, label: 'P1.1', sublabel: 'Port 1 Bit 1', side: 'left', port: 'P1', type: 'port', desc: 'Port 1 bit 1. Quasi-bidirectional I/O line with internal pull-up. (Note: On 8052, T2 external count input).' },
    { pin: 3, label: 'P1.2', sublabel: 'Port 1 Bit 2', side: 'left', port: 'P1', type: 'port', desc: 'Port 1 bit 2. Quasi-bidirectional I/O line with internal pull-up. (Note: On 8052, T2EX timer 2 capture/reload trigger).' },
    { pin: 4, label: 'P1.3', sublabel: 'Port 1 Bit 3', side: 'left', port: 'P1', type: 'port', desc: 'Port 1 bit 3. Quasi-bidirectional I/O line with internal pull-up.' },
    { pin: 5, label: 'P1.4', sublabel: 'Port 1 Bit 4', side: 'left', port: 'P1', type: 'port', desc: 'Port 1 bit 4. Quasi-bidirectional I/O line with internal pull-up.' },
    { pin: 6, label: 'P1.5', sublabel: 'Port 1 Bit 5', side: 'left', port: 'P1', type: 'port', desc: 'Port 1 bit 5. Quasi-bidirectional I/O line with internal pull-up.' },
    { pin: 7, label: 'P1.6', sublabel: 'Port 1 Bit 6', side: 'left', port: 'P1', type: 'port', desc: 'Port 1 bit 6. Quasi-bidirectional I/O line with internal pull-up.' },
    { pin: 8, label: 'P1.7', sublabel: 'Port 1 Bit 7', side: 'left', port: 'P1', type: 'port', desc: 'Port 1 bit 7. Quasi-bidirectional I/O line with internal pull-up.' },
    { pin: 9, label: 'RST', sublabel: 'Reset Input', side: 'left', type: 'control', desc: 'Active HIGH reset input. Holding HIGH for 2 machine cycles (24 oscillator clocks) while oscillator runs resets the 8051, initializing PC to 0000H and restoring default SFR values.' },
    { pin: 10, label: 'P3.0', sublabel: 'Port 3 Bit 0 (RXD)', side: 'left', port: 'P3', type: 'port', desc: 'Port 3 bit 0 / RXD: Serial asynchronous receiver data input pin (used by on-chip UART).' },
    { pin: 11, label: 'P3.1', sublabel: 'Port 3 Bit 1 (TXD)', side: 'left', port: 'P3', type: 'port', desc: 'Port 3 bit 1 / TXD: Serial asynchronous transmitter data output pin (used by on-chip UART).' },
    { pin: 12, label: 'P3.2', sublabel: 'Port 3 Bit 2 (I̅N̅T̅0̅)', side: 'left', port: 'P3', type: 'port', desc: 'Port 3 bit 2 / I̅N̅T̅0̅: External hardware interrupt 0 input (active low level or negative-edge triggered based on IT0 bit in TCON).' },
    { pin: 13, label: 'P3.3', sublabel: 'Port 3 Bit 3 (I̅N̅T̅1̅)', side: 'left', port: 'P3', type: 'port', desc: 'Port 3 bit 3 / I̅N̅T̅1̅: External hardware interrupt 1 input (active low level or negative-edge triggered based on IT1 bit in TCON).' },
    { pin: 14, label: 'P3.4', sublabel: 'Port 3 Bit 4 (T0)', side: 'left', port: 'P3', type: 'port', desc: 'Port 3 bit 4 / T0: External clock input for Timer/Counter 0.' },
    { pin: 15, label: 'P3.5', sublabel: 'Port 3 Bit 5 (T1)', side: 'left', port: 'P3', type: 'port', desc: 'Port 3 bit 5 / T1: External clock input for Timer/Counter 1.' },
    { pin: 16, label: 'P3.6', sublabel: 'Port 3 Bit 6 (W̅R̅)', side: 'left', port: 'P3', type: 'port', desc: 'Port 3 bit 6 / W̅R̅: External data RAM write strobe (active LOW). Pulses low during MOVX @DPTR, A instructions.' },
    { pin: 17, label: 'P3.7', sublabel: 'Port 3 Bit 7 (R̅D̅)', side: 'left', port: 'P3', type: 'port', desc: 'Port 3 bit 7 / R̅D̅: External data RAM read strobe (active LOW). Pulses low during MOVX A, @DPTR instructions.' },
    { pin: 18, label: 'XTAL2', sublabel: 'Crystal Input 2', side: 'left', type: 'clock', desc: 'Output of the on-chip inverting oscillator amplifier. Connected to external crystal or left unconnected if external clock is fed into XTAL1.' },
    { pin: 19, label: 'XTAL1', sublabel: 'Crystal Input 1', side: 'left', type: 'clock', desc: 'Input to the inverting oscillator amplifier and internal clock generator circuits.' },
    { pin: 20, label: 'Vss', sublabel: 'Ground (0V)', side: 'left', type: 'power', desc: 'Ground return reference potential (0V).' },
  ];

  // Right Pins 40 down to 21
  const rightPins: PinDef[] = [
    { pin: 40, label: 'Vcc', sublabel: '+5V Power', side: 'right', type: 'power', desc: '+5V DC primary power supply pin.' },
    { pin: 39, label: 'P0.0', sublabel: 'Port 0 Bit 0 (AD0)', side: 'right', port: 'P0', type: 'port', desc: 'Port 0 bit 0 / AD0: Low-order multiplexed address bit 0 and data bit 0. True open-drain I/O.' },
    { pin: 38, label: 'P0.1', sublabel: 'Port 0 Bit 1 (AD1)', side: 'right', port: 'P0', type: 'port', desc: 'Port 0 bit 1 / AD1: Multiplexed address/data bit 1.' },
    { pin: 37, label: 'P0.2', sublabel: 'Port 0 Bit 2 (AD2)', side: 'right', port: 'P0', type: 'port', desc: 'Port 0 bit 2 / AD2: Multiplexed address/data bit 2.' },
    { pin: 36, label: 'P0.3', sublabel: 'Port 0 Bit 3 (AD3)', side: 'right', port: 'P0', type: 'port', desc: 'Port 0 bit 3 / AD3: Multiplexed address/data bit 3.' },
    { pin: 35, label: 'P0.4', sublabel: 'Port 0 Bit 4 (AD4)', side: 'right', port: 'P0', type: 'port', desc: 'Port 0 bit 4 / AD4: Multiplexed address/data bit 4.' },
    { pin: 34, label: 'P0.5', sublabel: 'Port 0 Bit 5 (AD5)', side: 'right', port: 'P0', type: 'port', desc: 'Port 0 bit 5 / AD5: Multiplexed address/data bit 5.' },
    { pin: 33, label: 'P0.6', sublabel: 'Port 0 Bit 6 (AD6)', side: 'right', port: 'P0', type: 'port', desc: 'Port 0 bit 6 / AD6: Multiplexed address/data bit 6.' },
    { pin: 32, label: 'P0.7', sublabel: 'Port 0 Bit 7 (AD7)', side: 'right', port: 'P0', type: 'port', desc: 'Port 0 bit 7 / AD7: Multiplexed address/data bit 7.' },
    { pin: 31, label: 'E̅A̅/Vpp', sublabel: 'External Access / Prog Volt', side: 'right', type: 'control', desc: 'External Access enable: Tied HIGH (+5V) for internal 4KB ROM execution (0000H–0FFFH) and external ROM above 0FFFH. Tied LOW (0V) to force all code execution from external memory (0000H–FFFFH).' },
    { pin: 30, label: 'ALE/P̅R̅O̅G̅', sublabel: 'Address Latch Enable', side: 'right', type: 'control', desc: 'Address Latch Enable output pulses at 1/6 oscillator frequency to demultiplex Port 0 low-order address (A0–A7) into an external transparent latch (74LS373). Also serves as program pulse input during EPROM programming.' },
    { pin: 29, label: 'P̅S̅E̅N̅', sublabel: 'Program Store Enable', side: 'right', type: 'control', desc: 'Program Store Enable is the read strobe for external program memory (EPROM). Pulses active LOW twice per machine cycle during external code fetches.' },
    { pin: 28, label: 'P2.7', sublabel: 'Port 2 Bit 7 (A15)', side: 'right', port: 'P2', type: 'port', desc: 'Port 2 bit 7 / A15: High-order address bit 15 when accessing external 16-bit address space.' },
    { pin: 27, label: 'P2.6', sublabel: 'Port 2 Bit 6 (A14)', side: 'right', port: 'P2', type: 'port', desc: 'Port 2 bit 6 / A14: High-order address bit 14 during external memory expansion.' },
    { pin: 26, label: 'P2.5', sublabel: 'Port 2 Bit 5 (A13)', side: 'right', port: 'P2', type: 'port', desc: 'Port 2 bit 5 / A13: High-order address bit 13 during external memory expansion.' },
    { pin: 25, label: 'P2.4', sublabel: 'Port 2 Bit 4 (A12)', side: 'right', port: 'P2', type: 'port', desc: 'Port 2 bit 4 / A12: High-order address bit 12 during external memory expansion.' },
    { pin: 24, label: 'P2.3', sublabel: 'Port 2 Bit 3 (A11)', side: 'right', port: 'P2', type: 'port', desc: 'Port 2 bit 3 / A11: High-order address bit 11 during external memory expansion.' },
    { pin: 23, label: 'P2.2', sublabel: 'Port 2 Bit 2 (A10)', side: 'right', port: 'P2', type: 'port', desc: 'Port 2 bit 2 / A10: High-order address bit 10 during external memory expansion.' },
    { pin: 22, label: 'P2.1', sublabel: 'Port 2 Bit 1 (A9)', side: 'right', port: 'P2', type: 'port', desc: 'Port 2 bit 1 / A9: High-order address bit 9 during external memory expansion.' },
    { pin: 21, label: 'P2.0', sublabel: 'Port 2 Bit 0 (A8)', side: 'right', port: 'P2', type: 'port', desc: 'Port 2 bit 0 / A8: High-order address bit 8 during external memory expansion.' },
  ];

  const allPins = [...leftPins, ...rightPins];
  const activePinDef = allPins.find(p => p.pin === selectedPin) || leftPins[0];

  const isPinHighlighted = (pin: PinDef) => {
    if (selectedPort === 'ALL') return true;
    if (selectedPort === 'P1') return pin.port === 'P1';
    if (selectedPort === 'P0') return pin.port === 'P0';
    if (selectedPort === 'P2') return pin.port === 'P2';
    if (selectedPort === 'P3') return pin.port === 'P3';
    return true;
  };

  return (
    <div className="w-full flex flex-col gap-5 font-sans">
      {/* Top Filter and Slide 25 Notice Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 font-mono font-bold text-xs flex items-center gap-1.5">
            <Layers className="w-4 h-4" />
            Slide 25 of 50 • I/O Ports 2/4
          </span>
          <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
            40-Pin DIP Package &amp; Port 1 Architecture
          </span>
        </div>

        {/* Port selector pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <span className="text-[10px] font-mono text-slate-500 font-bold px-1.5 uppercase">
            Select Port:
          </span>
          {(['P1', 'P0', 'P2', 'P3', 'ALL'] as const).map(portKey => (
            <button
              key={portKey}
              onClick={() => {
                setSelectedPort(portKey);
                if (portKey === 'P1') setSelectedPin(1);
                else if (portKey === 'P0') setSelectedPin(39);
                else if (portKey === 'P2') setSelectedPin(21);
                else if (portKey === 'P3') setSelectedPin(10);
              }}
              className={`px-2.5 py-1 font-mono font-bold rounded-lg transition-all cursor-pointer ${
                selectedPort === portKey
                  ? portKey === 'P1'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {portKey === 'ALL' ? 'All 40 Pins' : `Port ${portKey.replace('P', '')}`}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Presentation: Left (Exact 40-pin DIP Chip), Right (Slide 25 Content & Technical Details) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Interactive 40-Pin Dual In-Line Package (DIP) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center">
          <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 mb-3 font-mono text-xs">
            <span className="text-slate-500 font-semibold flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-600" />
              Standard 8051 40-Pin DIP Package
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
              Click any pin to inspect
            </span>
          </div>

          {/* Realistic DIP-40 IC Diagram */}
          <div className="relative w-full max-w-[560px] py-4 select-none">
            {/* Chip Body */}
            <div className="mx-auto w-[220px] bg-slate-900 text-white border-2 border-slate-700 rounded-lg shadow-md relative py-6 px-3 flex flex-col items-center justify-between min-h-[580px]">
              {/* Notch at top */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-4 bg-slate-100 border-2 border-slate-700 rounded-b-full z-10"></div>

              {/* Pin 1 dot marker */}
              <div className="absolute top-3 left-3 w-2.5 h-2.5 rounded-full bg-slate-600 border border-slate-500"></div>

              {/* Center chip label */}
              <div className="my-auto text-center transform -rotate-90">
                <span className="font-mono text-lg font-black tracking-widest text-slate-300 block">
                  INTEL 8051
                </span>
                <span className="font-mono text-[10px] text-slate-400 tracking-wider block">
                  40-PIN CERAMIC / PLASTIC DIP
                </span>
              </div>

              <div className="absolute bottom-3 text-center w-full">
                <span className="text-[9px] font-mono text-slate-500">PHILIPPINES</span>
              </div>
            </div>

            {/* Left Pins (1 to 20) */}
            <div className="absolute top-6 left-0 w-[170px] space-y-[4.5px]">
              {leftPins.map(pin => {
                const highlighted = isPinHighlighted(pin);
                const isSelected = selectedPin === pin.pin;
                const isPort1 = pin.port === 'P1';

                return (
                  <div
                    key={pin.pin}
                    onClick={() => setSelectedPin(pin.pin)}
                    className={`flex items-center justify-end gap-1.5 cursor-pointer group transition-all ${
                      highlighted ? 'opacity-100' : 'opacity-35 hover:opacity-75'
                    }`}
                  >
                    {/* Left text annotation */}
                    <div className="text-right leading-tight">
                      <div
                        className={`text-[11px] font-mono font-bold transition-colors ${
                          isSelected
                            ? 'text-indigo-600'
                            : isPort1
                            ? 'text-blue-700 font-extrabold'
                            : 'text-slate-700 group-hover:text-indigo-600'
                        }`}
                      >
                        {pin.sublabel || pin.label}
                      </div>
                    </div>

                    {/* Pin number badge */}
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-700 scale-105 shadow-xs'
                          : isPort1 && selectedPort === 'P1'
                          ? 'bg-blue-100 text-blue-800 border-blue-300 font-black'
                          : 'bg-slate-100 text-slate-600 border-slate-200 group-hover:bg-indigo-50'
                      }`}
                    >
                      {pin.pin}
                    </span>

                    {/* Metal leg connecting to chip body */}
                    <div
                      className={`w-5 h-2 rounded-l-xs border-y border-l transition-all ${
                        isSelected
                          ? 'bg-indigo-500 border-indigo-600'
                          : isPort1 && selectedPort === 'P1'
                          ? 'bg-blue-400 border-blue-500'
                          : 'bg-slate-300 border-slate-400 group-hover:bg-indigo-300'
                      }`}
                    ></div>
                  </div>
                );
              })}
            </div>

            {/* Right Pins (40 down to 21) */}
            <div className="absolute top-6 right-0 w-[170px] space-y-[4.5px]">
              {rightPins.map(pin => {
                const highlighted = isPinHighlighted(pin);
                const isSelected = selectedPin === pin.pin;

                return (
                  <div
                    key={pin.pin}
                    onClick={() => setSelectedPin(pin.pin)}
                    className={`flex items-center justify-start gap-1.5 cursor-pointer group transition-all ${
                      highlighted ? 'opacity-100' : 'opacity-35 hover:opacity-75'
                    }`}
                  >
                    {/* Metal leg connecting to chip body */}
                    <div
                      className={`w-5 h-2 rounded-r-xs border-y border-r transition-all ${
                        isSelected
                          ? 'bg-indigo-500 border-indigo-600'
                          : 'bg-slate-300 border-slate-400 group-hover:bg-indigo-300'
                      }`}
                    ></div>

                    {/* Pin number badge */}
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-700 scale-105 shadow-xs'
                          : 'bg-slate-100 text-slate-600 border-slate-200 group-hover:bg-indigo-50'
                      }`}
                    >
                      {pin.pin}
                    </span>

                    {/* Right text annotation */}
                    <div className="text-left leading-tight">
                      <div
                        className={`text-[11px] font-mono font-bold transition-colors ${
                          isSelected
                            ? 'text-indigo-600'
                            : 'text-slate-700 group-hover:text-indigo-600'
                        }`}
                      >
                        {pin.sublabel || pin.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Slide 25 of 50 Exact Content & Academic Breakdown */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Card: Exact Slide 25/50 Replica Presentation Box */}
          <div className="bg-white p-5 rounded-2xl border-2 border-blue-200 shadow-sm relative overflow-hidden space-y-4">
            {/* Slide Header Tag */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Lecture Slide
                </span>
                <span className="text-sm font-mono font-extrabold text-blue-700">
                  25 of 50
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-black text-slate-800 tracking-wide block">
                  I/O Ports
                </span>
                <span className="text-lg font-mono font-black text-blue-600">
                  2/4
                </span>
              </div>
            </div>

            {/* Slide Title */}
            <div>
              <h3 className="text-xl font-display font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span className="w-2.5 h-6 bg-blue-600 rounded-sm inline-block"></span>
                PORT 1:
              </h3>
            </div>

            {/* Slide 25 Bullet Points (Exact verbatim wording) */}
            <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200/80 space-y-3">
              <div className="flex items-start gap-2.5">
                <span className="text-blue-700 font-bold text-base leading-none mt-0.5 font-mono">➤</span>
                <p className="text-sm font-bold text-slate-900 leading-snug">
                  It has no multiple functionality
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="text-blue-700 font-bold text-base leading-none mt-0.5 font-mono">➤</span>
                <p className="text-sm font-bold text-slate-900 leading-snug">
                  It is used only for i/o operations
                </p>
              </div>
            </div>

            {/* Technical Commentary & Comparison */}
            <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider block">
                Port 1 Internal Architecture Notes:
              </span>
              <ul className="space-y-1.5 text-slate-600 leading-relaxed list-disc list-inside">
                <li>
                  <strong className="text-slate-800">Dedicated Pins:</strong> Pins 1 through 8 (P1.0 to P1.7) are solely allocated for parallel 8-bit digital I/O in the standard 8051.
                </li>
                <li>
                  <strong className="text-slate-800">Built-in Pull-Ups:</strong> Port 1 has internal FET pull-up resistors (unlike Port 0 which is open-drain). No external resistors are needed for general inputs/outputs.
                </li>
                <li>
                  <strong className="text-slate-800">Writing 1 for Input:</strong> To read external pins on Port 1, software must first write <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-indigo-600">1</code> to the port latch (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-indigo-600">MOV P1, #0FFH</code>), turning off the pull-down FET so external signals can pull the line low or high.
                </li>
                <li>
                  <strong className="text-slate-800">8052 Exception:</strong> On the 8052 microcontroller, P1.0 and P1.1 serve secondary roles as Timer 2 external count input (T2) and Timer 2 capture/reload trigger (T2EX).
                </li>
              </ul>
            </div>
          </div>

            {/* Selected Pin Deep Inspector */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Pin {activePinDef.pin} Inspector: {activePinDef.label}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                    activePinDef.port === 'P1'
                      ? 'bg-blue-100 text-blue-700 border-blue-200'
                      : activePinDef.type === 'power'
                      ? 'bg-amber-100 text-amber-700 border-amber-200'
                      : activePinDef.type === 'clock'
                      ? 'bg-purple-100 text-purple-700 border-purple-200'
                      : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {activePinDef.sublabel || activePinDef.type}
                </span>
              </div>

              <p className="text-slate-700 font-sans text-xs leading-relaxed">
                {activePinDef.desc}
              </p>
            </div>
        </div>
      </div>
    </div>
  );
}
