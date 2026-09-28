import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCw, 
  CheckCircle2,
  Info,
  Sliders,
  Lightbulb,
  Zap,
  Power,
  ChevronRight
} from 'lucide-react';

interface SwitchesLEDsSchematicDiagramProps {
  initialSwitches?: number[]; // Array of 8 boolean/number states (0 or 1)
  initialLedDrive?: 'common_cathode' | 'common_anode';
  onSwitchToggle?: (index: number) => void;
}

export default function SwitchesLEDsSchematicDiagram({
  initialSwitches = [1, 1, 0, 0, 1, 0, 1, 0],
  initialLedDrive = 'common_cathode',
  onSwitchToggle
}: SwitchesLEDsSchematicDiagramProps) {
  const [selectedChip, setSelectedChip] = useState<string | null>('u4');
  const [switches, setSwitches] = useState<number[]>(initialSwitches);
  const [ledDrive, setLedDrive] = useState<'common_cathode' | 'common_anode'>(initialLedDrive);
  const [simMode, setSimMode] = useState<'mirror' | 'invert' | 'counter' | 'chaser'>('mirror');
  const [counterVal, setCounterVal] = useState<number>(0);
  const [chaserIdx, setChaserIdx] = useState<number>(0);
  const [isAutoRunning, setIsAutoRunning] = useState<boolean>(false);
  const [busCycleActive, setBusCycleActive] = useState<boolean>(true);
  const [driverMode, setDriverMode] = useState<'buffered' | 'direct'>('buffered');

  // Sync internal switches if prop changes
  useEffect(() => {
    if (initialSwitches && initialSwitches.length === 8) {
      setSwitches(initialSwitches);
    }
  }, [initialSwitches]);

  // Auto animation loop for counter or chaser modes
  useEffect(() => {
    if (!isAutoRunning && simMode !== 'counter' && simMode !== 'chaser') return;

    const interval = setInterval(() => {
      if (simMode === 'counter') {
        setCounterVal((prev) => (prev + 1) & 0xFF);
      } else if (simMode === 'chaser') {
        setChaserIdx((prev) => (prev + 1) % 8);
      }
    }, simMode === 'counter' ? 600 : 350);

    return () => clearInterval(interval);
  }, [isAutoRunning, simMode]);

  // Toggle single switch
  const handleToggleSwitch = (index: number) => {
    const updated = [...switches];
    updated[index] = updated[index] === 1 ? 0 : 1;
    setSwitches(updated);
    if (onSwitchToggle) {
      onSwitchToggle(index);
    }
  };

  // Convert switches to raw Port A byte value (DIP switch: 1 = closed = 0V active low, 0 = open = 5V)
  // Let's adopt standard active-low convention: Switch closed to GND = 0V (Logic 0), Switch open = 5V (Logic 1)
  const portAByte = switches.reduce((acc, bit, idx) => acc | ((bit & 1) << idx), 0);

  // Calculate Port B LED bits based on mode
  let ledBits: number[] = [0, 0, 0, 0, 0, 0, 0, 0];
  let portBByte = 0;

  if (simMode === 'mirror') {
    portBByte = portAByte;
    ledBits = [...switches];
  } else if (simMode === 'invert') {
    portBByte = (~portAByte) & 0xFF;
    ledBits = switches.map(s => s === 1 ? 0 : 1);
  } else if (simMode === 'counter') {
    portBByte = counterVal;
    ledBits = [0, 1, 2, 3, 4, 5, 6, 7].map(i => (counterVal >> i) & 1);
  } else if (simMode === 'chaser') {
    portBByte = 1 << chaserIdx;
    ledBits = [0, 1, 2, 3, 4, 5, 6, 7].map(i => (i === chaserIdx ? 1 : 0));
  }

  // Electrical status of LED based on drive mode:
  // In Common Cathode: PB=HIGH (+5V) -> Forward Biased -> ON
  // In Common Anode:   PB=LOW (0V)   -> Forward Biased (Sinking) -> ON
  const isLedLit = (bitIndex: number) => {
    const bitVal = ledBits[bitIndex];
    if (ledDrive === 'common_cathode') {
      return bitVal === 1;
    } else {
      return bitVal === 0;
    }
  };

  // Component documentation data for interactive inspector
  const chipDocs: Record<string, { title: string; subtitle: string; desc: string; pins: { pin: string; func: string }[]; tips: string[] }> = {
    u1: {
      title: 'U1: Intel 8086 16-Bit Microprocessor',
      subtitle: 'Component: Master CPU • Package: 40-Pin DIP (Minimum Mode)',
      desc: 'Configured in Minimum Mode by strapping Pin 33 (MN/MX#) to +5V VCC. Generates address, data, and control strobes to configure the 8255 PPI and transfer parallel I/O bytes.',
      pins: [
        { pin: 'Pin 33 (MN/MX#)', func: 'Tied to +5V VCC to select Minimum Mode architecture.' },
        { pin: 'Pin 25 (ALE)', func: 'Address Latch Enable; outputs HIGH during T1 to strobe AD0–AD1 into 74LS373 latch.' },
        { pin: 'Pin 28 (M/IO#)', func: 'Outputs LOW (0V) during IN/OUT instructions to enable 74LS138 I/O decoder.' },
        { pin: 'Pin 32 (RD#)', func: 'Active-LOW Read Strobe; connected to 8255 RD# (Pin 5) for IN AL, 80H.' },
        { pin: 'Pin 29 (WR#)', func: 'Active-LOW Write Strobe; connected to 8255 WR# (Pin 36) for OUT 82H, AL.' },
        { pin: 'Pins AD0–AD7', func: 'Multiplexed lower address/data bus connected to 74LS373 latch inputs and 8255 data bus.' }
      ],
      tips: [
        'Minimum Mode simplifies hardware by generating RD# and WR# directly on CPU pins without requiring an 8288 Bus Controller.',
        'Address Demultiplexing is required because AD0–AD15 carry memory/IO addresses during clock state T1 and data during T2, T3, and T4.'
      ]
    },
    u2: {
      title: 'U2: 74LS373 Octal Transparent D-Latch',
      subtitle: 'Component: Octal Address Latch • Package: 20-Pin DIP',
      desc: 'Captures and holds stable address lines A0 and A1 from the multiplexed AD0–AD1 lines when 8086 ALE pulses HIGH during clock state T1.',
      pins: [
        { pin: 'Pin 11 (LE)', func: 'Latch Enable; driven by 8086 ALE (Pin 25).' },
        { pin: 'Pin 1 (OE#)', func: 'Output Enable; tied to GND (0V) for permanently enabled 3-state outputs.' },
        { pin: 'Pins 1D, 2D (Pins 3, 4)', func: 'Inputs connected to 8086 multiplexed bus lines AD0 and AD1.' },
        { pin: 'Pins 1Q, 2Q (Pins 2, 5)', func: 'Demultiplexed address outputs A0 and A1 connected to 8255 Pins 9 and 8.' }
      ],
      tips: [
        'Without the latch, address information on AD0–AD1 disappears as soon as the CPU switches to data phase during T2–T4.',
        'A0 and A1 select internal 8255 ports: 00=Port A, 01=Port B, 10=Port C, 11=Control Register.'
      ]
    },
    u3: {
      title: 'U3: 74LS138 3-to-8 Line Address Decoder',
      subtitle: 'Component: I/O Address Decoder • Package: 16-Pin DIP',
      desc: 'Decodes upper address lines (A2–A7) and 8086 M/IO# to generate active-LOW Chip Select (CS# = 0) for the 8255 PPI at base I/O address 80H.',
      pins: [
        { pin: 'Pin 6 (G1)', func: 'Active-HIGH Enable; tied to +5V VCC.' },
        { pin: 'Pin 4 (G2A#)', func: 'Active-LOW Enable; connected to 8086 M/IO# (Pin 28).' },
        { pin: 'Pin 5 (G2B#)', func: 'Active-LOW Enable; tied to upper address decode condition (e.g. A7=0).' },
        { pin: 'Pins 1, 2, 3 (A, B, C)', func: 'Select inputs connected to CPU address lines A2, A3, A4.' },
        { pin: 'Pin 15 (Y0#)', func: 'Asserted LOW when I/O address 80H–87H is accessed; connected to 8255 CS# (Pin 6).' }
      ],
      tips: [
        'Decoding M/IO# ensures the 8255 responds ONLY to I/O instructions (IN / OUT) and ignores memory read/write cycles.',
        'Base Address 80H map: 80H=Port A, 82H=Port B, 84H=Port C, 86H=Control Word Register.'
      ]
    },
    u4: {
      title: 'U4: Intel 8255A Programmable Peripheral Interface (PPI)',
      subtitle: 'Component: Parallel I/O Interface • Package: 40-Pin DIP',
      desc: 'Provides 24 programmable I/O pins organized into three 8-bit ports. Initialized with Control Word 90H (Mode 0: Port A = INPUT for switches, Port B = OUTPUT for LEDs).',
      pins: [
        { pin: 'Pins 34–27 (D0–D7)', func: 'Bidirectional 8-bit data bus connected to 8086 CPU data bus.' },
        { pin: 'Pins 4–1, 40–37 (PA0–PA7)', func: 'Port A (8-bit INPUT) connected to 8 SPST DIP switches with 10 kΩ pull-ups.' },
        { pin: 'Pins 18–25 (PB0–PB7)', func: 'Port B (8-bit OUTPUT) connected to 8 discrete LEDs through 330 Ω series resistors.' },
        { pin: 'Pin 6 (CS#)', func: 'Chip Select from 74LS138 Y0# (Address 80H).' },
        { pin: 'Pin 5 (RD#) / Pin 36 (WR#)', func: 'Read and Write strobes directly from 8086 CPU.' },
        { pin: 'Pins 9, 8 (A0, A1)', func: 'Port address selection lines from 74LS373 latch.' }
      ],
      tips: [
        'Control Word 90H = 10010000b (Bit 7=1 Mode Set, Bits 6-5=00 Mode 0, Bit 4=1 Port A In, Bit 3=0 Port C upper Out, Bit 2=0 Mode 0 Group B, Bit 1=0 Port B Out, Bit 0=0 Port C lower Out).',
        'Port B pins can sink up to 3.2 mA each in Common Anode mode, or source ~1.6 mA in Common Cathode mode.'
      ]
    },
    rn1: {
      title: 'RN1: 8 × 10 kΩ Pull-Up Resistor SIP Network',
      subtitle: 'Component: Resistor Bus Array • Configuration: 9-Pin SIP Package',
      desc: 'Ties each Port A input pin (PA0–PA7) to +5V VCC through an individual 10 kΩ resistor. Prevents high-impedance floating inputs when mechanical switches are in the OPEN position.',
      pins: [
        { pin: 'Pin 1 (Common Pin)', func: 'Connected directly to +5V VCC power rail.' },
        { pin: 'Pins 2–9 (Resistor Taps)', func: 'Connected to Port A pins PA0–PA7 and switch input terminals.' }
      ],
      tips: [
        'Why 10 kΩ? It provides a stiff Logic 1 (+5V) with minimal current draw when the switch is closed: I = 5V / 10 kΩ = 0.5 mA per switch (4 mA total for all 8 switches closed).',
        'If pull-ups were omitted, open inputs would float into the TTL undefined region (0.8V–2.0V), picking up electromagnetic noise and causing erratic readings.'
      ]
    },
    sw: {
      title: 'SW0–SW7: 8-Position SPST DIP Switch Array',
      subtitle: 'Component: Mechanical Toggle Switches • Type: Single Pole Single Throw (SPST)',
      desc: 'Provides 8 manual binary input bits. One side of each switch connects to a Port A pin and 10 kΩ pull-up; the other side connects to system Ground (GND).',
      pins: [
        { pin: 'Poles (1–8)', func: 'Connected to 8255 Port A inputs PA0–PA7.' },
        { pin: 'Throws (9–16)', func: 'Common return bus connected to System Ground (GND / 0V).' }
      ],
      tips: [
        'Switch OPEN: Pin is pulled up to +5V by the 10 kΩ resistor -> Logic 1 read by 8086.',
        'Switch CLOSED: Pin is shorted to GND (0V) -> Logic 0 read by 8086.',
        'Software can invert the reading via `NOT AL` to treat Closed = 1 and Open = 0.'
      ]
    },
    u5: {
      title: 'U5: 74LS244 Octal Non-Inverting Buffer / Line Driver',
      subtitle: 'Component: Octal Driver Stage • Package: 20-Pin DIP • Sinking: 24 mA, Sourcing: 15 mA',
      desc: 'Solves the 8255 driving deficiency! The 8255 NMOS outputs can only source ~0.4 mA (IOH), which cannot drive a 10 mA LED. The 74LS244 takes negligible input current from the 8255 (< 20 µA) and provides robust 15–24 mA drive per channel, lighting all 8 LEDs at full, crisp brightness.',
      pins: [
        { pin: 'Pins 1, 19 (1OE#, 2OE#)', func: 'Active-LOW Output Enables; tied to GND (0V) for continuously active driving.' },
        { pin: 'Inputs (1A1–1A4, 2A1–2A4)', func: 'Connected to 8255 Port B outputs PB0–PB7. Takes almost zero current from 8255.' },
        { pin: 'Outputs (1Y1–1Y4, 2Y1–2Y4)', func: 'Connected to RN2 330 Ω resistors. Sinks up to 24 mA / Sources up to 15 mA.' },
        { pin: 'Pin 20 (VCC) / Pin 10 (GND)', func: 'Connected to +5V system rail and 0V ground with a 0.1 µF bypass capacitor.' }
      ],
      tips: [
        'Why textbook diagrams omit this: Textbook diagrams simplify circuits to teach instruction sets and address decoding without cluttering students with driver stages.',
        'Why practical boards REQUIRE this: In real hardware (microprocessor lab trainers, industrial PLCs), connecting LEDs directly to an 8255 causes the output voltage to collapse, dims the LEDs, and can overheat the 8255 silicon.',
        'Alternative Drivers: 74LS240 (inverting), ULN2803 (Darlington array for high-current relays/coils), or 7406/7407 open-collector drivers.'
      ]
    },
    rn2: {
      title: 'RN2: 8 × 330 Ω Current-Limiting Resistor Array',
      subtitle: 'Component: Series Limiting Pack • Resistance: 330 Ω ±5%',
      desc: 'Placed in series between 8255 Port B output pins and discrete LEDs to restrict forward diode current to a safe value (~9.1 mA), protecting both the LEDs and 8255 output transistors.',
      pins: [
        { pin: 'Inputs (Pins 1–8)', func: 'Connected to 8255 Port B outputs PB0–PB7.' },
        { pin: 'Outputs (Pins 9–16)', func: 'Connected to LED anodes (Common Cathode) or cathodes (Common Anode).' }
      ],
      tips: [
        'Calculated via Ohm\'s Law: R = (VCC - VF) / IF = (5.0V - 2.0V) / 9.1 mA = 330 Ω.',
        'Power dissipated per resistor: P = I^2 × R = (0.0091)^2 × 330 ≈ 27.3 mW (well within 1/8W rating).'
      ]
    },
    leds: {
      title: 'LED0–LED7: 8-Channel Discrete Light Emitting Diodes',
      subtitle: 'Component: T-1 3/4 (5mm) Standard LEDs • Optical Output: Visible Red/Green',
      desc: 'Displays the 8-bit binary output word from 8255 Port B. In Common Cathode mode, LED cathodes are tied to GND and anodes driven HIGH (+5V). In Common Anode mode, anodes are tied to +5V and cathodes driven LOW (0V).',
      pins: [
        { pin: 'Anode (Long Lead, +)', func: 'Positive terminal connected to 330 Ω resistor in Common Cathode mode.' },
        { pin: 'Cathode (Flat Edge, -)', func: 'Negative terminal connected to GND in Common Cathode mode.' }
      ],
      tips: [
        'Typical forward voltage drop (VF): Red ≈ 1.8V–2.0V, Green ≈ 2.1V–2.3V, Blue/White ≈ 3.0V–3.3V.',
        'Standard 8086 lab training kits prefer Common Anode configuration because 8255 PPI output buffers sink more current (3.2 mA) than they can source (1.6 mA).'
      ]
    }
  };

  const activeDoc = chipDocs[selectedChip ?? 'u4'];

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 font-sans">
      {/* Schematic Header Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 font-display">
                Complete 8086 + 8255 PPI Switches &amp; LEDs Circuit Schematic
              </h3>
              <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Interactive EDA
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Accurate hardware schematic with demultiplexing, address decoding, pull-ups, and current-limiting resistors.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Selector */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-medium">
            <button
              onClick={() => { setSimMode('mirror'); setIsAutoRunning(false); }}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                simMode === 'mirror' ? 'bg-white text-indigo-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Direct Mirror
            </button>
            <button
              onClick={() => { setSimMode('invert'); setIsAutoRunning(false); }}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                simMode === 'invert' ? 'bg-white text-indigo-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Invert (NOT)
            </button>
          </div>

          {/* Driver Mode Toggle: Buffered 74LS244 vs Direct Drive */}
          <button
            onClick={() => setDriverMode(driverMode === 'buffered' ? 'direct' : 'buffered')}
            className={`px-2.5 py-1 rounded-lg border font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all shadow-2xs ${
              driverMode === 'buffered'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
            }`}
            title="Toggle between real-world 74LS244 driver stage and academic direct-drive simplification"
          >
            <span className="text-slate-500">Stage:</span>
            <span className="font-mono">
              {driverMode === 'buffered' ? '74LS244 Driver (Real-World)' : 'Direct 8255 (Textbook)'}
            </span>
          </button>
        </div>
      </div>

      {/* Main EDA Schematic Canvas (SVG) */}
      <div className="relative bg-slate-50/50 rounded-xl border border-slate-200 overflow-x-auto overflow-y-hidden shadow-inner p-2">
        <div className="min-w-[1100px] bg-white p-3 rounded-lg border border-slate-200">
          <svg viewBox="0 0 1180 560" className="w-full h-auto select-none font-mono text-[10px]">
            {/* Grid Pattern Background */}
            <defs>
              <pattern id="edaGridSwLed" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.8" fill="#cbd5e1" opacity="0.8" />
              </pattern>
              {/* LED Glow filter */}
              <filter id="ledGlowSw" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3.0" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <rect width="1180" height="560" fill="url(#edaGridSwLed)" />

            {/* ============================================================== */}
            {/* 1. POWER RAILS                                                 */}
            {/* ============================================================== */}
            {/* +5V VCC Top Bus */}
            <line x1="20" y1="20" x2="1160" y2="20" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="6,3" />
            <text x="25" y="15" fill="#dc2626" fontSize="9.5" fontWeight="bold">+5V VCC (System Power Supply Rail)</text>

            {/* GND Bottom Bus */}
            <line x1="20" y1="540" x2="1160" y2="540" stroke="#2563eb" strokeWidth="2.5" />
            <text x="25" y="534" fill="#1d4ed8" fontSize="9.5" fontWeight="bold">GND (0V Common Ground Reference)</text>

            {/* ============================================================== */}
            {/* 2. CHIP U1: 8086 CPU (Leftmost Controller)                     */}
            {/* ============================================================== */}
            <g 
              onClick={() => setSelectedChip('u1')}
              className="cursor-pointer transition-all group"
              transform="translate(25, 45)"
            >
              <title>U1: Intel 8086 16-Bit Microprocessor (CPU)</title>
              <rect
                x="0"
                y="0"
                width="145"
                height="475"
                rx="6"
                fill="#ffffff"
                stroke={selectedChip === 'u1' ? '#4f46e5' : '#94a3b8'}
                strokeWidth={selectedChip === 'u1' ? '2.5' : '1.5'}
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.05))"
              />
              <rect x="0" y="0" width="145" height="28" rx="6" fill="#1e293b" />
              <text x="72" y="18" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                U1: INTEL 8086 CPU
              </text>
              <text x="72" y="38" fill="#64748b" fontSize="8" textAnchor="middle">
                16-Bit Master (Min Mode)
              </text>

              {/* Pin Labels - Left (Power & Mode) */}
              <text x="10" y="60" fill="#dc2626" fontSize="8.5">40 VCC (+5V)</text>
              <line x1="0" y1="57" x2="10" y2="57" stroke="#ef4444" strokeWidth="1.5" />
              <text x="10" y="80" fill="#dc2626" fontSize="8.5">33 MN/MX# (+5V)</text>
              <line x1="0" y1="77" x2="10" y2="77" stroke="#ef4444" strokeWidth="1.5" />
              <text x="10" y="100" fill="#1d4ed8" fontSize="8.5">1 GND (0V)</text>
              <line x1="0" y1="97" x2="10" y2="97" stroke="#2563eb" strokeWidth="1.5" />
              <text x="10" y="120" fill="#1d4ed8" fontSize="8.5">20 GND (0V)</text>
              <line x1="0" y1="117" x2="10" y2="117" stroke="#2563eb" strokeWidth="1.5" />
              <text x="10" y="142" fill="#64748b" fontSize="8.5">19 CLK (8284)</text>
              <text x="10" y="165" fill="#64748b" fontSize="8.5">21 RESET</text>
              <text x="10" y="188" fill="#dc2626" fontSize="8.5">22 READY (+5V)</text>

              {/* Pin Labels - Right (Buses & Strobes aligned for straight routing) */}
              <text x="135" y="28" fill="#4f46e5" fontSize="8.5" textAnchor="end">ALE (Pin 25)</text>
              <line x1="135" y1="25" x2="145" y2="25" stroke="#4f46e5" strokeWidth="2" />

              <text x="135" y="78" fill="#0284c7" fontSize="8.5" textAnchor="end">AD0–AD7 Bus</text>
              <line x1="135" y1="75" x2="145" y2="75" stroke="#0284c7" strokeWidth="2.5" />

              <text x="135" y="193" fill="#d97706" fontSize="8.5" textAnchor="end">A2–A4 (Addrs)</text>
              <line x1="135" y1="190" x2="145" y2="190" stroke="#d97706" strokeWidth="2" />

              <text x="135" y="228" fill="#d97706" fontSize="8.5" textAnchor="end">A7 (Addr MSB)</text>
              <line x1="135" y1="225" x2="145" y2="225" stroke="#d97706" strokeWidth="2" />

              <text x="135" y="263" fill="#ea580c" fontSize="8.5" textAnchor="end">M/IO# (Pin 28)</text>
              <line x1="135" y1="260" x2="145" y2="260" stroke="#ea580c" strokeWidth="2" />

              <text x="135" y="328" fill="#059669" fontSize="8.5" textAnchor="end">RD# (Pin 32)</text>
              <line x1="135" y1="325" x2="145" y2="325" stroke="#059669" strokeWidth="2" />

              <text x="135" y="373" fill="#059669" fontSize="8.5" textAnchor="end">WR# (Pin 29)</text>
              <line x1="135" y1="370" x2="145" y2="370" stroke="#059669" strokeWidth="2" />

              {/* Footprint Indicator */}
              <text x="72" y="460" fill="#94a3b8" fontSize="7.5" textAnchor="middle">
                [CLICK TO INSPECT]
              </text>
            </g>

            {/* Tie VCC/GND lines from CPU to rails */}
            <line x1="25" y1="102" x2="10" y2="102" stroke="#ef4444" strokeWidth="1.5" />
            <line x1="10" y1="102" x2="10" y2="20" stroke="#ef4444" strokeWidth="1.5" />
            <line x1="25" y1="142" x2="15" y2="142" stroke="#2563eb" strokeWidth="1.5" />
            <line x1="15" y1="142" x2="15" y2="540" stroke="#2563eb" strokeWidth="1.5" />

            {/* ============================================================== */}
            {/* 3. CHIP U2: 74LS373 OCTAL ADDRESS LATCH                        */}
            {/* ============================================================== */}
            <g 
              onClick={() => setSelectedChip('u2')}
              className="cursor-pointer transition-all group"
              transform="translate(235, 50)"
            >
              <title>U2: 74LS373 Octal Transparent D-Latch</title>
              <rect
                x="0"
                y="0"
                width="115"
                height="135"
                rx="6"
                fill="#ffffff"
                stroke={selectedChip === 'u2' ? '#4f46e5' : '#94a3b8'}
                strokeWidth={selectedChip === 'u2' ? '2.5' : '1.5'}
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.05))"
              />
              <rect x="0" y="0" width="115" height="24" rx="6" fill="#475569" />
              <text x="57" y="16" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                U2: 74LS373
              </text>
              <text x="57" y="34" fill="#64748b" fontSize="7.5" textAnchor="middle">
                Octal D-Latch
              </text>

              {/* Pin Labels - Left */}
              <text x="8" y="23" fill="#4f46e5" fontSize="8">LE (Pin 11)</text>
              <line x1="0" y1="20" x2="8" y2="20" stroke="#4f46e5" strokeWidth="2" />

              <text x="8" y="63" fill="#0284c7" fontSize="8">1D (AD0)</text>
              <line x1="0" y1="60" x2="8" y2="60" stroke="#0284c7" strokeWidth="2" />

              <text x="8" y="88" fill="#0284c7" fontSize="8">2D (AD1)</text>
              <line x1="0" y1="85" x2="8" y2="85" stroke="#0284c7" strokeWidth="2" />

              <text x="8" y="118" fill="#1d4ed8" fontSize="7.5">OE# (GND)</text>
              <line x1="0" y1="115" x2="8" y2="115" stroke="#2563eb" strokeWidth="1.5" />

              {/* Pin Labels - Right (Latched Address Outputs) */}
              <text x="105" y="63" fill="#16a34a" fontSize="8" textAnchor="end">1Q (A0)</text>
              <line x1="105" y1="60" x2="115" y2="60" stroke="#16a34a" strokeWidth="2" />

              <text x="105" y="88" fill="#16a34a" fontSize="8" textAnchor="end">2Q (A1)</text>
              <line x1="105" y1="85" x2="115" y2="85" stroke="#16a34a" strokeWidth="2" />
            </g>

            {/* Tie 74LS373 OE# to GND */}
            <line x1="235" y1="165" x2="225" y2="165" stroke="#2563eb" strokeWidth="1.5" />
            <line x1="225" y1="165" x2="225" y2="540" stroke="#2563eb" strokeWidth="1.2" strokeDasharray="3,3" />

            {/* Wire: 8086 ALE (170, 70) -> 74LS373 LE (235, 70) [Straight Horizontal Line] */}
            <line x1="170" y1="70" x2="235" y2="70" stroke="#4f46e5" strokeWidth="2" />
            <text x="195" y="65" fill="#4f46e5" fontSize="7.5" fontWeight="bold">ALE</text>

            {/* Wire: Multiplexed AD0-AD7 Bus from 8086 (170, 120) with clean taps into 74LS373 */}
            <path d="M 170,120 L 205,120" fill="none" stroke="#0284c7" strokeWidth="2.5" />
            <circle cx="205" cy="120" r="2.5" fill="#0284c7" />
            {/* Taps to 74LS373 1D and 2D */}
            <path d="M 205,120 L 205,110 L 235,110" fill="none" stroke="#0284c7" strokeWidth="1.6" />
            <path d="M 205,120 L 205,135 L 235,135" fill="none" stroke="#0284c7" strokeWidth="1.6" />

            {/* Main D0-D7 System Data Bus highway routing cleanly ABOVE 74LS373 to 8255 */}
            {/* Crosses ALE at (205, 70) using a jumper arc for 100% clarity */}
            <path 
              d="M 205,120 L 205,76 A 6,6 0 0,0 205,64 L 205,36 L 412,36 L 412,85 L 425,85" 
              fill="none" 
              stroke="#0284c7" 
              strokeWidth="2.8" 
            />
            <text x="250" y="31" fill="#0284c7" fontSize="8" fontWeight="bold">
              D0–D7 System Data Bus (Demultiplexed Highway)
            </text>

            {/* ============================================================== */}
            {/* 4. CHIP U3: 74LS138 3-TO-8 ADDRESS DECODER                     */}
            {/* ============================================================== */}
            <g 
              onClick={() => setSelectedChip('u3')}
              className="cursor-pointer transition-all group"
              transform="translate(235, 215)"
            >
              <title>U3: 74LS138 3-to-8 Line Decoder</title>
              <rect
                x="0"
                y="0"
                width="115"
                height="155"
                rx="6"
                fill="#ffffff"
                stroke={selectedChip === 'u3' ? '#4f46e5' : '#94a3b8'}
                strokeWidth={selectedChip === 'u3' ? '2.5' : '1.5'}
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.05))"
              />
              <rect x="0" y="0" width="115" height="24" rx="6" fill="#475569" />
              <text x="57" y="16" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                U3: 74LS138
              </text>
              <text x="57" y="34" fill="#64748b" fontSize="7.5" textAnchor="middle">
                Address Decoder
              </text>

              {/* Pin Inputs - Left (Matched with 8086 pin rows for zero-cross straight paths) */}
              <text x="8" y="23" fill="#d97706" fontSize="8">A,B,C (A2–A4)</text>
              <line x1="0" y1="20" x2="8" y2="20" stroke="#d97706" strokeWidth="2" />

              <text x="8" y="58" fill="#d97706" fontSize="8">G2B# (A7=0)</text>
              <line x1="0" y1="55" x2="8" y2="55" stroke="#d97706" strokeWidth="2" />

              <text x="8" y="93" fill="#ea580c" fontSize="8">G2A# (M/IO#)</text>
              <line x1="0" y1="90" x2="8" y2="90" stroke="#ea580c" strokeWidth="2" />

              <text x="8" y="125" fill="#dc2626" fontSize="7.5">G1 (+5V VCC)</text>
              <line x1="0" y1="122" x2="8" y2="122" stroke="#ef4444" strokeWidth="1.5" />

              {/* Output Y0# = 80H */}
              <text x="105" y="48" fill="#7c3aed" fontSize="8.5" fontWeight="bold" textAnchor="end">
                Y0# (80H)
              </text>
              <line x1="105" y1="45" x2="115" y2="45" stroke="#7c3aed" strokeWidth="2.5" />
            </g>

            {/* Tie 74LS138 G1 to +5V */}
            <line x1="235" y1="337" x2="215" y2="337" stroke="#ef4444" strokeWidth="1.2" />
            <line x1="215" y1="337" x2="215" y2="20" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="3,3" />

            {/* Straight horizontal lines from 8086 into 74LS138 (Zero overlapping paths!) */}
            {/* 8086 A2–A4 (170, 235) -> 74LS138 A,B,C (235, 235) */}
            <line x1="170" y1="235" x2="235" y2="235" stroke="#d97706" strokeWidth="2" />
            <text x="180" y="230" fill="#d97706" fontSize="7.5">A2–A4</text>

            {/* 8086 A7 (170, 270) -> 74LS138 G2B# (235, 270) */}
            <line x1="170" y1="270" x2="235" y2="270" stroke="#d97706" strokeWidth="2" />
            <text x="185" y="265" fill="#d97706" fontSize="7.5">A7</text>

            {/* 8086 M/IO# (170, 305) -> 74LS138 G2A# (235, 305) */}
            <line x1="170" y1="305" x2="235" y2="305" stroke="#ea580c" strokeWidth="2" />
            <text x="180" y="300" fill="#ea580c" fontSize="7.5">M/IO#</text>

            {/* ============================================================== */}
            {/* 5. CHIP U4: INTEL 8255A PPI                                    */}
            {/* ============================================================== */}
            <g 
              onClick={() => setSelectedChip('u4')}
              className="cursor-pointer transition-all group"
              transform="translate(425, 45)"
            >
              <title>U4: Intel 8255A Programmable Peripheral Interface</title>
              <rect
                x="0"
                y="0"
                width="150"
                height="475"
                rx="6"
                fill="#ffffff"
                stroke={selectedChip === 'u4' ? '#4f46e5' : '#94a3b8'}
                strokeWidth={selectedChip === 'u4' ? '2.5' : '1.5'}
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.05))"
              />
              <rect x="0" y="0" width="150" height="34" rx="6" fill="#1e1b4b" />
              <text x="75" y="16" fill="#ffffff" fontSize="9.5" fontWeight="bold" textAnchor="middle">
                U4: INTEL 8255A PPI
              </text>
              <text x="75" y="27" fill="#c7d2fe" fontSize="7" textAnchor="middle">
                Mode 0 • Control Word: 90H
              </text>

              {/* Left Side Inputs (From 8086 / Latches) */}
              <text x="12" y="44" fill="#0284c7" fontSize="8" fontWeight="bold">D0–D7 (Data Bus)</text>
              <line x1="0" y1="40" x2="10" y2="40" stroke="#0284c7" strokeWidth="2.5" />

              <text x="12" y="88" fill="#7c3aed" fontSize="8" fontWeight="bold">CS# (Pin 6 = 80H)</text>
              <line x1="0" y1="85" x2="10" y2="85" stroke="#7c3aed" strokeWidth="2.5" />

              <text x="12" y="133" fill="#16a34a" fontSize="8" fontWeight="bold">A0 (Pin 9)</text>
              <line x1="0" y1="130" x2="10" y2="130" stroke="#16a34a" strokeWidth="2" />

              <text x="12" y="168" fill="#16a34a" fontSize="8" fontWeight="bold">A1 (Pin 8)</text>
              <line x1="0" y1="165" x2="10" y2="165" stroke="#16a34a" strokeWidth="2" />

              <text x="12" y="223" fill="#059669" fontSize="8" fontWeight="bold">RD# (Pin 5)</text>
              <line x1="0" y1="220" x2="10" y2="220" stroke="#059669" strokeWidth="2" />

              <text x="12" y="263" fill="#059669" fontSize="8" fontWeight="bold">WR# (Pin 36)</text>
              <line x1="0" y1="260" x2="10" y2="260" stroke="#059669" strokeWidth="2" />

              <text x="12" y="318" fill="#dc2626" fontSize="7.5">VCC (+5V, Pin 26)</text>
              <text x="12" y="338" fill="#1d4ed8" fontSize="7.5">GND (0V, Pin 7)</text>

              {/* Right Side Ports: PORT A (INPUT) at rows y=85, 109, 133, 157, 181, 205, 229, 253 */}
              <rect x="55" y="42" width="90" height="15" rx="3" fill="#fef3c7" stroke="#f59e0b" strokeWidth="0.8" />
              <text x="100" y="52.5" fill="#92400e" fontSize="7" fontWeight="bold" textAnchor="middle">
                PORT A: INPUT (80H)
              </text>

              {[0, 1, 2, 3, 4, 5, 6, 7].map((pin) => {
                const absY = 85 + pin * 24;
                const relY = absY - 45;
                return (
                  <g key={`pa-pin-${pin}`}>
                    <text x="138" y={relY + 3} fill="#b45309" fontSize="7.5" textAnchor="end">
                      PA{pin} (Pin {pin < 4 ? 4 - pin : 44 - pin})
                    </text>
                    <line 
                      x1="140" 
                      y1={relY} 
                      x2="150" 
                      y2={relY} 
                      stroke={switches[pin] === 1 ? '#ef4444' : '#0284c7'} 
                      strokeWidth="2" 
                    />
                  </g>
                );
              })}

              {/* Right Side Ports: PORT B (OUTPUT) at rows y=325, 349, 373, 397, 421, 445, 469, 493 */}
              <rect x="55" y="280" width="90" height="15" rx="3" fill="#dcfce7" stroke="#10b981" strokeWidth="0.8" />
              <text x="100" y="290.5" fill="#065f46" fontSize="7" fontWeight="bold" textAnchor="middle">
                PORT B: OUTPUT (82H)
              </text>

              {[0, 1, 2, 3, 4, 5, 6, 7].map((pin) => {
                const absY = 325 + pin * 24;
                const relY = absY - 45;
                const lit = isLedLit(pin);
                return (
                  <g key={`pb-pin-${pin}`}>
                    <text x="138" y={relY + 3} fill="#047857" fontSize="7.5" textAnchor="end">
                      PB{pin} (Pin {18 + pin})
                    </text>
                    <line 
                      x1="140" 
                      y1={relY} 
                      x2="150" 
                      y2={relY} 
                      stroke={lit ? '#10b981' : '#64748b'} 
                      strokeWidth="2" 
                    />
                  </g>
                );
              })}

              <text x="75" y="460" fill="#94a3b8" fontSize="7.5" textAnchor="middle">
                [CLICK TO INSPECT]
              </text>
            </g>

            {/* ============================================================== */}
            {/* INTER-CHIP BUS ROUTING (Channel 2: x=350 to 425)               */}
            {/* Dedicated columns: Y0#(x=370), RD#(x=378), A0(x=386),          */}
            {/* WR#(x=394), A1(x=402), D0-D7(x=412)                           */}
            {/* ============================================================== */}

            {/* Wire: 74LS138 Y0# (350, 260) -> 8255 CS# (425, 130) */}
            <path d="M 350,260 L 370,260 L 370,130 L 425,130" fill="none" stroke="#7c3aed" strokeWidth="2.2" />
            <text x="372" y="195" fill="#7c3aed" fontSize="7.5" fontWeight="bold">CS#</text>

            {/* Wire: 74LS373 1Q (A0) (350, 110) -> 8255 A0 (425, 175) */}
            <path d="M 350,110 L 386,110 L 386,175 L 425,175" fill="none" stroke="#16a34a" strokeWidth="1.8" />
            <text x="388" y="145" fill="#16a34a" fontSize="7.5" fontWeight="bold">A0</text>

            {/* Wire: 74LS373 2Q (A1) (350, 135) -> 8255 A1 (425, 210) */}
            <path d="M 350,135 L 402,135 L 402,210 L 425,210" fill="none" stroke="#16a34a" strokeWidth="1.8" />
            <text x="404" y="175" fill="#16a34a" fontSize="7.5" fontWeight="bold">A1</text>

            {/* Wire: 8086 RD# (170, 370) routing safely BELOW 74LS138 -> 8255 RD# (425, 265) */}
            <path d="M 170,370 L 190,370 L 190,390 L 378,390 L 378,265 L 425,265" fill="none" stroke="#059669" strokeWidth="1.8" />
            <text x="280" y="386" fill="#059669" fontSize="7.5" fontWeight="bold">RD# Strobe (Read)</text>

            {/* Wire: 8086 WR# (170, 415) routing safely BELOW 74LS138 -> 8255 WR# (425, 305) */}
            <path d="M 170,415 L 205,415 L 205,425 L 394,425 L 394,305 L 425,305" fill="none" stroke="#059669" strokeWidth="1.8" />
            <text x="280" y="421" fill="#059669" fontSize="7.5" fontWeight="bold">WR# Strobe (Write)</text>

            {/* ============================================================== */}
            {/* 6. SWITCHES & 10 kΩ PULL-UP RESISTOR ARRAY (PORT A INPUT)      */}
            {/* Textbook-accurate EDA Pull-Up Topology: Straight PA lines to   */}
            {/* switches; RN1 SIP-9 network at top dropping pull-up taps down  */}
            {/* ============================================================== */}

            {/* RN1 Resistor Pack Box (SIP-9 Pull-Up Array mounted at top) */}
            <g 
              onClick={() => setSelectedChip('rn1')}
              className="cursor-pointer transition-all"
              transform="translate(592, 28)"
            >
              <title>RN1: 8 × 10 kΩ Pull-Up Resistor Array (SIP-9 Package)</title>
              <rect
                x="0"
                y="0"
                width="128"
                height="38"
                rx="4"
                fill="#fffbeb"
                stroke={selectedChip === 'rn1' ? '#b45309' : '#f59e0b'}
                strokeWidth={selectedChip === 'rn1' ? '2.2' : '1.2'}
                filter="drop-shadow(0 2px 3px rgba(0,0,0,0.05))"
              />
              <rect x="0" y="0" width="128" height="12" rx="4" fill="#78350f" />
              <text x="64" y="9" fill="#fef3c7" fontSize="6.5" fontWeight="bold" textAnchor="middle">
                RN1: 8 × 10 kΩ SIP-9 PULL-UP ARRAY
              </text>

              {/* Pin 1 Common connected to +5V Rail */}
              <circle cx="8" cy="18" r="2.5" fill="#ef4444" />
              <line x1="8" y1="18" x2="8" y2="-8" stroke="#ef4444" strokeWidth="1.8" />
              <circle cx="8" cy="-8" r="2.5" fill="#ef4444" />
              <text x="12" y="17" fill="#dc2626" fontSize="5.5" fontWeight="bold">P1 (+5V)</text>

              {/* Internal +5V Bus within RN1 */}
              <line x1="8" y1="18" x2="120" y2="18" stroke="#ef4444" strokeWidth="1.2" />

              {/* 8 Resistors inside RN1 (each with body and 10k label) */}
              {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => {
                const localX = 12 + idx * 14;
                return (
                  <g key={`rn1-resistor-${idx}`}>
                    {/* Lead from internal +5V bus */}
                    <line x1={localX} y1="18" x2={localX} y2="21" stroke="#ef4444" strokeWidth="1" />
                    {/* Resistor symbol body */}
                    <rect 
                      x={localX - 4.5} 
                      y="21" 
                      width="9" 
                      height="11" 
                      rx="1" 
                      fill="#fef3c7" 
                      stroke="#d97706" 
                      strokeWidth="0.8" 
                    />
                    <text x={localX} y="29" fill="#78350f" fontSize="4.5" fontWeight="bold" textAnchor="middle">
                      10k
                    </text>
                    {/* Bottom terminal lead exiting RN1 */}
                    <line x1={localX} y1="32" x2={localX} y2="38" stroke="#b45309" strokeWidth="1.2" />
                  </g>
                );
              })}
            </g>

            {/* Straight Horizontal Port A Wires (8255 PAx -> Switch Terminal) */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => {
              const yPos = 85 + idx * 24;
              const isHigh = switches[idx] === 1; // 1 = OPEN = +5V (Red); 0 = CLOSED = 0V GND (Blue)
              const wireColor = isHigh ? '#ef4444' : '#0284c7';
              return (
                <g key={`pa-straight-wire-${idx}`}>
                  {/* From 8255 (x=575) straight to DIP switch input terminal (x=730) */}
                  <line x1="575" y1={yPos} x2="730" y2={yPos} stroke={wireColor} strokeWidth="1.8" />
                </g>
              );
            })}

            {/* RN1 Drop Lines: Branching T-Junctions from Pins 2-9 down to PA0-PA7 */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => {
              const dropX = 592 + 12 + idx * 14;
              const targetY = 85 + idx * 24;
              const isHigh = switches[idx] === 1;
              const dropColor = isHigh ? '#ef4444' : '#0284c7';

              // Build vertical drop path with EDA jumper arcs whenever crossing higher horizontal lines
              let pathD = `M ${dropX},66`;
              for (let crossIdx = 0; crossIdx < idx; crossIdx++) {
                const crossY = 85 + crossIdx * 24;
                pathD += ` L ${dropX},${crossY - 4} A 4,4 0 0,0 ${dropX},${crossY + 4}`;
              }
              pathD += ` L ${dropX},${targetY}`;

              return (
                <g key={`rn1-drop-${idx}`}>
                  {/* Vertical branch with jumper bridges */}
                  <path d={pathD} fill="none" stroke={dropColor} strokeWidth="1.3" />
                  {/* Solid T-junction connection dot on target PA wire */}
                  <circle cx={dropX} cy={targetY} r="2.5" fill={dropColor} />
                </g>
              );
            })}

            {/* SW0–SW7 SPST Switch Array Box */}
            <g 
              onClick={() => setSelectedChip('sw')}
              className="cursor-pointer transition-all"
              transform="translate(730, 45)"
            >
              <title>SW0–SW7: 8-Position SPST DIP Switch Block (Click switches to toggle)</title>
              <rect
                x="0"
                y="0"
                width="155"
                height="235"
                rx="6"
                fill="#ffffff"
                stroke={selectedChip === 'sw' ? '#4f46e5' : '#94a3b8'}
                strokeWidth={selectedChip === 'sw' ? '2.5' : '1.5'}
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.05))"
              />
              <rect x="0" y="0" width="155" height="26" rx="6" fill="#1e293b" />
              <text x="77" y="14" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">
                SW0–SW7 DIP SWITCH (SPST)
              </text>
              <text x="77" y="22" fill="#94a3b8" fontSize="5.5" textAnchor="middle">
                Click levers: OPEN = +5V (1) • CLOSED = GND (0)
              </text>

              {/* Sub-column headers */}
              <text x="14" y="34" fill="#64748b" fontSize="5.5" fontWeight="bold">Input</text>
              <text x="36" y="34" fill="#64748b" fontSize="5.5" fontWeight="bold">SPST</text>
              <text x="68" y="34" fill="#2563eb" fontSize="5.5" fontWeight="bold">GND</text>
              <text x="115" y="34" fill="#64748b" fontSize="5.5" fontWeight="bold" textAnchor="middle">Readout</text>

              {/* 8 Clickable SPST Switches: aligned exactly on track yPos */}
              {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => {
                const isClosed = switches[idx] === 0; // 0 = closed to GND
                const trackY = 85 + idx * 24;
                const relY = trackY - 45;
                const nodeColor = isClosed ? '#0284c7' : '#ef4444';
                return (
                  <g 
                    key={`sw-item-${idx}`}
                    onClick={(e) => { e.stopPropagation(); handleToggleSwitch(idx); }}
                    className="hover:opacity-85 transition-opacity cursor-pointer"
                  >
                    {/* Fixed contact 1 (Input from PA node) */}
                    <line x1="0" y1={relY} x2="16" y2={relY} stroke={nodeColor} strokeWidth="1.8" />
                    <text x="2" y={relY - 3} fill="#475569" fontSize="6" fontWeight="bold">SW{idx}</text>
                    <circle cx="16" cy={relY} r="2" fill="#475569" />
                    
                    {/* Switch blade / lever */}
                    {isClosed ? (
                      // Closed blade (connecting contact 1 to contact 2 at GND)
                      <line x1="16" y1={relY} x2="50" y2={relY} stroke="#059669" strokeWidth="2.4" />
                    ) : (
                      // Open blade (angled up 30 degrees, node floating high to +5V)
                      <line x1="16" y1={relY} x2="46" y2={relY - 9} stroke="#dc2626" strokeWidth="2.2" />
                    )}

                    {/* Fixed contact 2 (GND terminal) */}
                    <circle cx="50" cy={relY} r="2" fill="#64748b" />
                    
                    {/* Lead from contact 2 to common GND rail */}
                    <line x1="50" y1={relY} x2="68" y2={relY} stroke="#2563eb" strokeWidth="1.4" />

                    {/* State badge: Explicitly shows Bit Logic and Node Voltage */}
                    <rect 
                      x="82" 
                      y={relY - 7} 
                      width="67" 
                      height="14" 
                      rx="3" 
                      fill={isClosed ? '#ecfdf5' : '#fef2f2'} 
                      stroke={isClosed ? '#34d399' : '#f87171'}
                      strokeWidth="0.8"
                    />
                    <text 
                      x="115" 
                      y={relY + 3} 
                      fill={isClosed ? '#065f46' : '#991b1b'} 
                      fontSize="6" 
                      fontWeight="bold" 
                      textAnchor="middle"
                    >
                      {isClosed ? 'CLOSED (0V / 0)' : 'OPEN (+5V / 1)'}
                    </text>
                  </g>
                );
              })}

              {/* Common ground bus on right of switch terminals */}
              <line x1="68" y1="36" x2="68" y2="225" stroke="#2563eb" strokeWidth="1.6" />
              <line x1="68" y1="225" x2="68" y2="235" stroke="#2563eb" strokeWidth="1.6" />
            </g>

            {/* Ground symbol for switches */}
            <g transform="translate(798, 285)">
              <line x1="0" y1="-5" x2="0" y2="5" stroke="#2563eb" strokeWidth="1.5" />
              <line x1="-8" y1="5" x2="8" y2="5" stroke="#2563eb" strokeWidth="1.5" />
              <line x1="-5" y1="8" x2="5" y2="8" stroke="#2563eb" strokeWidth="1.5" />
              <line x1="-2" y1="11" x2="2" y2="11" stroke="#2563eb" strokeWidth="1.5" />
              <text x="0" y="21" fill="#2563eb" fontSize="6.5" fontWeight="bold" textAnchor="middle">GND (0V)</text>
            </g>

            {/* ============================================================== */}
            {/* 7. DRIVER STAGE: U5 74LS244 OCTAL BUFFER & RN2 330Ω RESISTORS  */}
            {/* ============================================================== */}
            {driverMode === 'buffered' ? (
              /* --- BUFFERED MODE (REAL-WORLD HARDWARE) --- */
              <g>
                {/* U5: 74LS244 Octal Non-Inverting Buffer / Line Driver */}
                <g 
                  onClick={() => setSelectedChip('u5')}
                  className="cursor-pointer transition-all"
                  transform="translate(600, 290)"
                >
                  <title>U5: 74LS244 Octal Non-Inverting Buffer / Line Driver (Click to Inspect)</title>
                  <rect
                    x="0"
                    y="0"
                    width="54"
                    height="225"
                    rx="5"
                    fill="#ecfdf5"
                    stroke={selectedChip === 'u5' ? '#059669' : '#10b981'}
                    strokeWidth={selectedChip === 'u5' ? '2.5' : '1.5'}
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.05))"
                  />
                  <rect x="0" y="0" width="54" height="24" rx="4" fill="#064e3b" />
                  <text x="27" y="11" fill="#ffffff" fontSize="6.5" fontWeight="bold" textAnchor="middle">
                    U5: 74LS244
                  </text>
                  <text x="27" y="20" fill="#6ee7b7" fontSize="5.2" textAnchor="middle">
                    OCTAL BUFFER
                  </text>

                  {/* 8 Buffer triangle symbols */}
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => {
                    const trackY = 325 + idx * 24;
                    const relY = trackY - 290;
                    const lit = isLedLit(idx);
                    return (
                      <g key={`u5-buf-${idx}`}>
                        {/* Input line */}
                        <line x1="0" y1={relY} x2="14" y2={relY} stroke={lit ? '#10b981' : '#64748b'} strokeWidth="1.4" />
                        {/* Buffer Triangle */}
                        <polygon 
                          points={`14,${relY - 6} 14,${relY + 6} 32,${relY}`} 
                          fill={lit ? '#a7f3d0' : '#f1f5f9'} 
                          stroke={lit ? '#059669' : '#64748b'} 
                          strokeWidth="1.2" 
                        />
                        {/* Output line */}
                        <line x1="32" y1={relY} x2="54" y2={relY} stroke={lit ? '#10b981' : '#64748b'} strokeWidth="1.5" />
                        <text x="43" y={relY - 3} fill="#065f46" fontSize="5.5" fontWeight="bold">24mA</text>
                      </g>
                    );
                  })}

                  {/* 1OE# / 2OE# tie to GND at bottom */}
                  <line x1="27" y1="225" x2="27" y2="235" stroke="#2563eb" strokeWidth="1.5" />
                  <text x="27" y="222" fill="#047857" fontSize="5.5" fontWeight="bold" textAnchor="middle">OE#=0V</text>
                </g>

                {/* Ground pin for 74LS244 OE# */}
                <g transform="translate(627, 530)">
                  <line x1="0" y1="-5" x2="0" y2="5" stroke="#2563eb" strokeWidth="1.5" />
                  <line x1="-5" y1="5" x2="5" y2="5" stroke="#2563eb" strokeWidth="1.5" />
                  <line x1="-3" y1="8" x2="3" y2="8" stroke="#2563eb" strokeWidth="1.5" />
                  <text x="0" y="16" fill="#2563eb" fontSize="5.5" textAnchor="middle">GND</text>
                </g>

                {/* RN2: 8 × 330 Ω Resistors shifted right to x=670 */}
                <g 
                  onClick={() => setSelectedChip('rn2')}
                  className="cursor-pointer transition-all"
                  transform="translate(670, 290)"
                >
                  <title>RN2: 8 × 330 Ω Current-Limiting Resistors</title>
                  <rect
                    x="0"
                    y="0"
                    width="46"
                    height="225"
                    rx="5"
                    fill="#f0fdf4"
                    stroke={selectedChip === 'rn2' ? '#16a34a' : '#22c55e'}
                    strokeWidth={selectedChip === 'rn2' ? '2.5' : '1.5'}
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.05))"
                  />
                  <rect x="0" y="0" width="46" height="24" rx="4" fill="#14532d" />
                  <text x="23" y="11" fill="#ffffff" fontSize="6.5" fontWeight="bold" textAnchor="middle">
                    RN2: 330Ω
                  </text>
                  <text x="23" y="20" fill="#86efac" fontSize="5.2" textAnchor="middle">
                    LIMITER
                  </text>

                  {/* 8 Series Resistors */}
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => {
                    const trackY = 325 + idx * 24;
                    const relY = trackY - 290;
                    const lit = isLedLit(idx);
                    return (
                      <g key={`rn2-res-${idx}`}>
                        <rect 
                          x="10" 
                          y={relY - 6} 
                          width="26" 
                          height="12" 
                          rx="2" 
                          fill="#dcfce7" 
                          stroke={lit ? '#10b981' : '#16a34a'} 
                          strokeWidth="1.2" 
                        />
                        <text x="23" y={relY + 3} fill="#14532d" fontSize="6" textAnchor="middle">330Ω</text>
                        {/* Leads */}
                        <line x1="0" y1={relY} x2="10" y2={relY} stroke={lit ? '#10b981' : '#64748b'} strokeWidth="1.5" />
                        <line x1="36" y1={relY} x2="46" y2={relY} stroke={lit ? '#10b981' : '#64748b'} strokeWidth="1.5" />
                      </g>
                    );
                  })}
                </g>

                {/* Horizontal Interconnect Wires for Buffered Mode */}
                {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => {
                  const yPos = 325 + idx * 24;
                  const lit = isLedLit(idx);
                  const color = lit ? '#10b981' : '#94a3b8';
                  return (
                    <g key={`pb-buffered-wire-${idx}`}>
                      {/* 8255 (x=575) to 74LS244 (x=600) */}
                      <line x1="575" y1={yPos} x2="600" y2={yPos} stroke={color} strokeWidth={lit ? '1.8' : '1.3'} />
                      {/* 74LS244 output (x=654) to RN2 input (x=670) */}
                      <line x1="654" y1={yPos} x2="670" y2={yPos} stroke={color} strokeWidth={lit ? '2.0' : '1.3'} />
                      {/* RN2 output (x=716) to LED block (x=730) */}
                      <line x1="716" y1={yPos} x2="730" y2={yPos} stroke={color} strokeWidth={lit ? '2.0' : '1.3'} />
                    </g>
                  );
                })}
              </g>
            ) : (
              /* --- DIRECT MODE (ACADEMIC TEXTBOOK SIMPLIFICATION) --- */
              <g>
                <g 
                  onClick={() => setSelectedChip('rn2')}
                  className="cursor-pointer transition-all"
                  transform="translate(615, 290)"
                >
                  <title>RN2: 8 × 330 Ω Current-Limiting Resistors (Direct Drive Mode)</title>
                  <rect
                    x="0"
                    y="0"
                    width="68"
                    height="225"
                    rx="5"
                    fill="#fef2f2"
                    stroke={selectedChip === 'rn2' ? '#ef4444' : '#f87171'}
                    strokeWidth={selectedChip === 'rn2' ? '2.5' : '1.5'}
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.05))"
                  />
                  <rect x="0" y="0" width="68" height="24" rx="4" fill="#991b1b" />
                  <text x="34" y="11" fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle">
                    RN2: 8×330Ω
                  </text>
                  <text x="34" y="20" fill="#fca5a5" fontSize="5.5" textAnchor="middle">
                    DIRECT DRIVE (0.4mA!)
                  </text>

                  {/* 8 Series Resistors directly on PB tracks */}
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => {
                    const trackY = 325 + idx * 24;
                    const relY = trackY - 290;
                    const lit = isLedLit(idx);
                    return (
                      <g key={`rn2-direct-res-${idx}`}>
                        <rect 
                          x="15" 
                          y={relY - 6} 
                          width="38" 
                          height="12" 
                          rx="2" 
                          fill="#fee2e2" 
                          stroke={lit ? '#dc2626' : '#991b1b'} 
                          strokeWidth="1.2" 
                        />
                        <text x="34" y={relY + 3} fill="#7f1d1d" fontSize="6.5" textAnchor="middle">330Ω</text>
                        {/* Left lead from PB */}
                        <line x1="0" y1={relY} x2="15" y2={relY} stroke={lit ? '#ef4444' : '#64748b'} strokeWidth="1.6" />
                        {/* Right lead to LED */}
                        <line x1="53" y1={relY} x2="68" y2={relY} stroke={lit ? '#ef4444' : '#64748b'} strokeWidth="1.6" />
                      </g>
                    );
                  })}
                </g>

                {/* Straight Horizontal Port B Wires (8255 PBx -> RN2 -> LEDs) */}
                {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => {
                  const yPos = 325 + idx * 24;
                  const lit = isLedLit(idx);
                  const color = lit ? '#ef4444' : '#94a3b8';
                  return (
                    <g key={`pb-direct-wire-${idx}`}>
                      {/* 8255 (x=575) to RN2 input (x=615) */}
                      <line x1="575" y1={yPos} x2="615" y2={yPos} stroke={color} strokeWidth={lit ? '2.0' : '1.4'} strokeDasharray={lit ? '4,2' : undefined} />
                      {/* RN2 output (x=683) to LED block (x=730) */}
                      <line x1="683" y1={yPos} x2="730" y2={yPos} stroke={color} strokeWidth={lit ? '2.0' : '1.4'} strokeDasharray={lit ? '4,2' : undefined} />
                    </g>
                  );
                })}
              </g>
            )}

            {/* ============================================================== */}
            {/* 8. DISCRETE LED0–LED7 OUTPUT ARRAY                             */}
            {/* ============================================================== */}
            <g 
              onClick={() => setSelectedChip('leds')}
              className="cursor-pointer transition-all"
              transform="translate(730, 290)"
            >
              <title>LED0–LED7: 8-Channel Discrete Light Emitting Diodes</title>
              <rect
                x="0"
                y="0"
                width="155"
                height="235"
                rx="6"
                fill="#ffffff"
                stroke={selectedChip === 'leds' ? '#4f46e5' : '#94a3b8'}
                strokeWidth={selectedChip === 'leds' ? '2.5' : '1.5'}
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.05))"
              />
              <rect x="0" y="0" width="155" height="24" rx="5" fill="#1e293b" />
              <text x="77" y="16" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">
                LED0–LED7 DISCRETE ARRAY
              </text>

              {/* 8 LEDs with Diode Symbol, Light Rays & Glowing Indicator */}
              {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => {
                const trackY = 325 + idx * 24;
                const relY = trackY - 290;
                const on = isLedLit(idx);
                return (
                  <g key={`schematic-led-${idx}`}>
                    {/* Lead from RN2 entering box */}
                    <line x1="0" y1={relY} x2="20" y2={relY} stroke={on ? '#10b981' : '#94a3b8'} strokeWidth="1.5" />
                    
                    <text x="6" y={relY - 5} fill="#475569" fontSize="6.5" fontWeight="bold">D{idx}</text>
                    
                    {/* Schematic Diode Triangle */}
                    <polygon 
                      points={`20,${relY - 6} 20,${relY + 6} 32,${relY}`} 
                      fill={on ? '#ef4444' : '#cbd5e1'} 
                      stroke={on ? '#b91c1c' : '#64748b'} 
                      strokeWidth="1.2" 
                    />
                    {/* Cathode Bar */}
                    <line x1="32" y1={relY - 7} x2="32" y2={relY + 7} stroke={on ? '#b91c1c' : '#64748b'} strokeWidth="1.5" />
                    
                    {/* Optical Emission Rays when ON */}
                    {on && (
                      <g stroke="#ef4444" strokeWidth="1" opacity="0.9">
                        <line x1="28" y1={relY - 6} x2="34" y2={relY - 12} />
                        <line x1="32" y1={relY - 4} x2="38" y2={relY - 10} />
                      </g>
                    )}

                    {/* Cathode to Return Lead */}
                    <line x1="32" y1={relY} x2="52" y2={relY} stroke="#2563eb" strokeWidth="1.2" />

                    {/* Glowing LED physical lamp icon */}
                    <circle 
                      cx="68" 
                      cy={relY} 
                      r="6.5" 
                      fill={on ? '#ef4444' : '#f1f5f9'} 
                      stroke={on ? '#b91c1c' : '#cbd5e1'} 
                      strokeWidth="1.5"
                      filter={on ? 'url(#ledGlowSw)' : undefined}
                    />
                    {on && (
                      <circle cx="66.5" cy={relY - 1.5} r="2" fill="#ffffff" opacity="0.8" />
                    )}

                    {/* Status Text Readout */}
                    <rect 
                      x="84" 
                      y={relY - 7} 
                      width="64" 
                      height="14" 
                      rx="3" 
                      fill={on ? '#ecfdf5' : '#f8fafc'} 
                      stroke={on ? '#34d399' : '#cbd5e1'} 
                      strokeWidth="0.8" 
                    />
                    <text 
                      x="116" 
                      y={relY + 3.5} 
                      fill={on ? '#065f46' : '#64748b'} 
                      fontSize="6.5" 
                      fontWeight="bold" 
                      textAnchor="middle"
                    >
                      {on ? 'ON (HIGH)' : 'OFF (LOW)'}
                    </text>
                  </g>
                );
              })}

              {/* Common Cathode bus tied to GND */}
              <line x1="52" y1="28" x2="52" y2="225" stroke="#2563eb" strokeWidth="1.5" />
              <line x1="52" y1="225" x2="52" y2="235" stroke="#2563eb" strokeWidth="1.5" />
            </g>

            {/* Cathode Return Ground Symbol */}
            <g transform="translate(782, 530)">
              <line x1="0" y1="-5" x2="0" y2="5" stroke="#2563eb" strokeWidth="1.5" />
              <line x1="-8" y1="5" x2="8" y2="5" stroke="#2563eb" strokeWidth="1.5" />
              <line x1="-5" y1="8" x2="5" y2="8" stroke="#2563eb" strokeWidth="1.5" />
              <line x1="-2" y1="11" x2="2" y2="11" stroke="#2563eb" strokeWidth="1.5" />
              <text x="0" y="21" fill="#2563eb" fontSize="6.5" fontWeight="bold" textAnchor="middle">
                {ledDrive === 'common_cathode' ? 'GND (CC)' : '+5V (CA)'}
              </text>
            </g>

            {/* ============================================================== */}
            {/* 9. ANNOTATIONS & BUS LEGEND BOX                                */}
            {/* ============================================================== */}
            <g transform="translate(895, 45)">
              <rect x="0" y="0" width="265" height="475" rx="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
              <text x="15" y="22" fill="#0f172a" fontSize="9" fontWeight="bold">CIRCUIT SCHEMATIC LEGEND</text>
              
              {/* Bus Color Guide */}
              <g transform="translate(15, 35)">
                <line x1="0" y1="8" x2="25" y2="8" stroke="#0284c7" strokeWidth="2.5" />
                <text x="32" y="11" fill="#334155" fontSize="7.5">Multiplexed Bus (AD0–AD7)</text>

                <line x1="0" y1="26" x2="25" y2="26" stroke="#16a34a" strokeWidth="2" />
                <text x="32" y="29" fill="#334155" fontSize="7.5">Latched Addresses (A0, A1)</text>

                <line x1="0" y1="44" x2="25" y2="44" stroke="#7c3aed" strokeWidth="2.2" />
                <text x="32" y="47" fill="#334155" fontSize="7.5">Decoded Chip Select (CS# = 80H)</text>

                <line x1="0" y1="62" x2="25" y2="62" stroke="#059669" strokeWidth="2" />
                <text x="32" y="65" fill="#334155" fontSize="7.5">Read / Write Strobes (RD#, WR#)</text>

                <line x1="0" y1="80" x2="25" y2="80" stroke="#ef4444" strokeWidth="2" strokeDasharray="4,2" />
                <text x="32" y="83" fill="#334155" fontSize="7.5">+5V VCC Power Rail</text>

                <line x1="0" y1="98" x2="25" y2="98" stroke="#2563eb" strokeWidth="2" />
                <text x="32" y="101" fill="#334155" fontSize="7.5">GND Ground Reference</text>
              </g>

              {/* Real-time Electrical State Panel */}
              <g transform="translate(12, 160)">
                <rect x="0" y="0" width="241" height="175" rx="5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
                <text x="12" y="18" fill="#1e293b" fontSize="8" fontWeight="bold">REAL-TIME BUS VALUES</text>
                
                <text x="12" y="38" fill="#64748b" fontSize="7">Port A (Switches Input):</text>
                <text x="12" y="52" fill="#d97706" fontSize="9" fontWeight="bold">
                  0x{portAByte.toString(16).toUpperCase().padStart(2, '0')}H ({portAByte.toString(2).padStart(8, '0')}b)
                </text>

                <text x="12" y="74" fill="#64748b" fontSize="7">Port B (LEDs Output):</text>
                <text x="12" y="88" fill="#059669" fontSize="9" fontWeight="bold">
                  0x{portBByte.toString(16).toUpperCase().padStart(2, '0')}H ({portBByte.toString(2).padStart(8, '0')}b)
                </text>

                <text x="12" y="110" fill="#64748b" fontSize="7">8255 Control Word (86H):</text>
                <text x="12" y="122" fill="#4f46e5" fontSize="8" fontWeight="bold">90H (Mode 0: PA=In, PB=Out)</text>

                <text x="12" y="140" fill="#64748b" fontSize="7">Active LEDs Lit: {ledBits.filter(b => b === 1).length} / 8</text>
                <text x="12" y="154" fill="#64748b" fontSize="7">Drive Polarity: {ledDrive === 'common_cathode' ? 'Active-HIGH (CC)' : 'Active-LOW (CA)'}</text>
                <text x="12" y="168" fill={driverMode === 'buffered' ? '#059669' : '#d97706'} fontSize="7" fontWeight="bold">
                  Stage: {driverMode === 'buffered' ? 'U5 74LS244 (24mA Sinking OK)' : 'Direct 8255 (0.4mA Overloaded!)'}
                </text>
              </g>

              {/* Interactive Help Hint */}
              <g transform="translate(12, 350)">
                <rect x="0" y="0" width="241" height="110" rx="5" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1" />
                <text x="10" y="18" fill="#1e40af" fontSize="7.5" fontWeight="bold">💡 HOW TO INTERACT:</text>
                <text x="10" y="34" fill="#1e3a8a" fontSize="6.8">• Toggle Stage button (74LS244 vs Direct)</text>
                <text x="10" y="46" fill="#1e3a8a" fontSize="6.8">  to inspect why a driver is required!</text>
                <text x="10" y="60" fill="#1e3a8a" fontSize="6.8">• Click switches SW0–SW7 in schematic</text>
                <text x="10" y="72" fill="#1e3a8a" fontSize="6.8">  to toggle binary inputs in real time.</text>
                <text x="10" y="84" fill="#1e3a8a" fontSize="6.8">• Click any IC (8086, 8255, 74LS244, etc.)</text>
                <text x="10" y="96" fill="#1e3a8a" fontSize="6.8">  for complete engineering pinout data.</text>
              </g>
            </g>
          </svg>
        </div>
      </div>

      {/* Interactive Chip Inspector Bottom Sheet */}
      {activeDoc && (
        <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
                  Hardware Inspector
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  {activeDoc.subtitle}
                </span>
              </div>
              <h4 className="text-base font-bold font-display text-white mt-1">
                {activeDoc.title}
              </h4>
            </div>

            {/* Quick Chip Selection Pills */}
            <div className="flex flex-wrap items-center gap-1 text-[11px] font-mono">
              {[
                { id: 'u1', label: '8086 CPU' },
                { id: 'u2', label: '74LS373' },
                { id: 'u3', label: '74LS138' },
                { id: 'u4', label: '8255A PPI' },
                { id: 'rn1', label: '10k Pull-Up' },
                { id: 'sw', label: 'Switches' },
                { id: 'u5', label: '74LS244 Driver' },
                { id: 'rn2', label: '330Ω Limiter' },
                { id: 'leds', label: 'LED Array' }
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedChip(c.id)}
                  className={`px-2 py-1 rounded transition-all cursor-pointer ${
                    selectedChip === c.id
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {activeDoc.desc}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
            {/* Pin Function Table */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wide block font-mono">
                Pin &amp; Terminal Interconnects
              </span>
              <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden divide-y divide-slate-800/60 text-xs">
                {activeDoc.pins.map((p, i) => (
                  <div key={i} className="p-2 flex items-start gap-2.5">
                    <span className="font-mono text-amber-400 font-bold shrink-0 min-w-[130px]">
                      {p.pin}
                    </span>
                    <span className="text-slate-300">
                      {p.func}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Engineering Design Tips */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide block font-mono">
                Laboratory &amp; Examination Notes
              </span>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300 leading-relaxed">
                {activeDoc.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
