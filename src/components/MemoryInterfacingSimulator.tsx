import React, { useState } from 'react';
import { Database, Cpu, Layers, ArrowRight, CheckCircle2, ShieldAlert, CpuIcon, Binary } from 'lucide-react';

export default function MemoryInterfacingSimulator() {
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'types' | 'bank' | 'decoder' | 'map'>('hierarchy');
  const [selectedHierarchyLevel, setSelectedHierarchyLevel] = useState<number>(0);
  const [selectedMemoryType, setSelectedMemoryType] = useState<string>('sram');

  // Bank Selection State
  const [addressHex, setAddressHex] = useState<string>('00100');
  const [transferType, setTransferType] = useState<'byte' | 'word'>('word');

  // 74LS138 Decoder State
  const [a19, setA19] = useState<number>(0);
  const [a18, setA18] = useState<number>(0);
  const [a17, setA17] = useState<number>(1);
  const [g1, setG1] = useState<number>(1); // Enable HIGH
  const [g2a, setG2a] = useState<number>(0); // Enable LOW
  const [g2b, setG2b] = useState<number>(0); // Enable LOW

  // Memory Hierarchy Data
  const hierarchyLevels = [
    {
      level: 0,
      name: 'CPU Internal Registers',
      type: '8086 Internal (AX, BX, CX, DX, SI, DI, SP, CS, IP)',
      speed: '< 1 - 2 ns (0 Wait States)',
      capacity: 'Few Bytes (14 x 16-bit registers)',
      cost: 'Very High per bit (Silicon area on MPU die)',
      volatility: 'Volatile',
      tech: 'D-Flip-Flops integrated on CPU core',
      useCase: 'Active operand storage, pointers, accumulator & arithmetic results'
    },
    {
      level: 1,
      name: 'Cache Memory (L1 / L2)',
      type: 'Static RAM (SRAM)',
      speed: '2 - 10 ns',
      capacity: 'Few KB to MBs',
      cost: 'High per bit',
      volatility: 'Volatile',
      tech: '6-Transistor (6T) CMOS Flip-Flops',
      useCase: 'Buffers frequently fetched instructions and data loops'
    },
    {
      level: 2,
      name: 'Main Primary Memory',
      type: 'SRAM & DRAM (Dynamic RAM)',
      speed: '10 - 60 ns',
      capacity: 'Up to 1 MB (8086 physical limits)',
      cost: 'Medium per bit',
      volatility: 'Volatile',
      tech: '1-Transistor 1-Capacitor (1T1C) cells requiring refresh cycles',
      useCase: 'Active code segment, data segment, stack segment, and IVT'
    },
    {
      level: 3,
      name: 'Firmware & Boot ROM',
      type: 'EPROM / EEPROM / Flash ROM',
      speed: '50 - 150 ns',
      capacity: '64 KB - 512 KB',
      cost: 'Medium per bit',
      volatility: 'Non-Volatile',
      tech: 'Floating-Gate Transistors / Quartz Window / UV or Electrical Erase',
      useCase: 'Holds 8086 BIOS, POST diagnostics, jump boot vector at FFFF0H'
    },
    {
      level: 4,
      name: 'Secondary / Aux Storage',
      type: 'Hard Disk / SSD / Optical / Tape',
      speed: '10 us - 10 ms (Slowest)',
      capacity: 'Gigabytes to Terabytes',
      cost: 'Very Low per bit',
      volatility: 'Non-Volatile',
      tech: 'Magnetic Media, NAND Flash sectors',
      useCase: 'Permanent file storage, operating system images & user applications'
    }
  ];

  const memoryTypesData: Record<string, {
    title: string;
    category: string;
    cellTech: string;
    volatility: string;
    speed: string;
    refresh: string;
    eraseMethod: string;
    description: string;
    microRole: string;
  }> = {
    sram: {
      title: 'Static RAM (SRAM)',
      category: 'Random Access Memory (Volatile)',
      cellTech: '6-Transistor (6T) bistable latch / flip-flop per bit cell',
      volatility: 'Volatile (Data lost when power is OFF)',
      speed: 'Ultra Fast (~5 - 15 ns access time)',
      refresh: 'No refresh required as long as Vcc is supplied',
      eraseMethod: 'Instant overwrite / Power off',
      description: 'Extremely fast memory that uses transistor flip-flops to store bits without leakage. Highly stable but requires larger die space and consumes more power per bit.',
      microRole: 'Used for 8086 high-speed system RAM, stack memory, and CPU cache buffers.'
    },
    dram: {
      title: 'Dynamic RAM (DRAM)',
      category: 'Random Access Memory (Volatile)',
      cellTech: '1-Transistor + 1-Capacitor (1T1C) per bit cell',
      volatility: 'Volatile (Data lost when power is OFF)',
      speed: 'Fast (~30 - 60 ns access time)',
      refresh: 'Mandatory Refresh Cycles every 2ms–64ms (Capacitor charge leaks!)',
      eraseMethod: 'Instant overwrite / Power off',
      description: 'Provides ultra-high storage density and low cost per bit. Because bit capacitors leak charge over time, a DRAM Controller must continuously read and rewrite every row.',
      microRole: 'Used for bulk 8086 system RAM where maximum memory capacity is required.'
    },
    maskrom: {
      title: 'Mask ROM',
      category: 'Read-Only Memory (Non-Volatile)',
      cellTech: 'Transistor arrays hardwired during semiconductor fabrication',
      volatility: 'Non-Volatile (Permanent data retention)',
      speed: 'Moderate (~100 - 200 ns)',
      refresh: 'None',
      eraseMethod: 'Cannot be erased or reprogrammed',
      description: 'Data is permanently encoded into the chip mask during factory manufacturing. Zero flexibility, but lowest cost for mass-produced consumer electronics.',
      microRole: 'Factory-embedded system firmware or fixed mathematical lookup tables.'
    },
    prom: {
      title: 'Programmable ROM (PROM)',
      category: 'Read-Only Memory (Non-Volatile)',
      cellTech: 'Array of microscopic fusible links (Nichrome / Polysilicon)',
      volatility: 'Non-Volatile',
      speed: 'Moderate (~50 - 100 ns)',
      refresh: 'None',
      eraseMethod: 'OTP (One-Time Programmable) — Fuses blown permanently',
      description: 'Shipped blank from the factory. Programmed once by the user using a PROM Programmer device that applies high-voltage pulses to intentionally blow specific internal fuses.',
      microRole: 'Early custom 8086 prototype firmware before erasable chips were affordable.'
    },
    eprom: {
      title: 'Erasable PROM (EPROM e.g. 2764)',
      category: 'Read-Only Memory (Non-Volatile)',
      cellTech: 'Floating-Gate MOSFET transistors storing trapped electrons',
      volatility: 'Non-Volatile',
      speed: 'Moderate (~100 - 200 ns)',
      refresh: 'None',
      eraseMethod: 'Expose quartz window to intense Ultraviolet (UV) light for 15–20 mins',
      description: 'Contains a transparent quartz window above the silicon chip. High UV radiation energizes trapped electrons in floating gates, resetting all memory bytes back to 0xFF.',
      microRole: 'Standard boot ROM for 8086 trainer kits and development boards.'
    },
    eeprom: {
      title: 'Electrically Erasable PROM (EEPROM)',
      category: 'Read-Only Memory (Non-Volatile)',
      cellTech: 'Fowler-Nordheim Tunneling Floating-Gate MOS transistors',
      volatility: 'Non-Volatile',
      speed: 'Fast Read (~100 ns), Slow Write (~5 - 10 ms)',
      refresh: 'None',
      eraseMethod: 'In-circuit electrical pulses on a byte-by-byte basis',
      description: 'Allows individual bytes to be erased and rewritten electrically while remaining plugged into the circuit board, without requiring UV light or physical removal.',
      microRole: 'Stores configurable 8086 system settings, calibration tables, and boot parameters.'
    },
    flash: {
      title: 'Flash Memory',
      category: 'Non-Volatile Solid-State Storage',
      cellTech: 'High-density Floating-Gate NOR or NAND memory cell arrays',
      volatility: 'Non-Volatile',
      speed: 'Very Fast Read (~20 - 70 ns), Block Write',
      refresh: 'None',
      eraseMethod: 'Electrical sector / block erase operations',
      description: 'Evolves EEPROM technology by enabling block-level (sector) erasing, achieving massive integration density and fast read throughput.',
      microRole: 'Modern MPU BIOS firmware, solid-state system disks, and embedded program flash.'
    }
  };

  // Compute Bank signals
  const addressVal = parseInt(addressHex || '0', 16);
  const isEvenAddress = (addressVal % 2) === 0;

  // A0 signal = LSB of address
  const a0 = isEvenAddress ? 0 : 1;
  // BHE# signal: active low (0) when accessing odd bank (word access OR odd byte access)
  const bhe = (transferType === 'word' || !isEvenAddress) ? 0 : 1;

  const evenBankActive = a0 === 0;
  const oddBankActive = bhe === 0;

  let transferDescription = '';
  let busCycles = 1;
  if (transferType === 'byte') {
    if (isEvenAddress) {
      transferDescription = '1 Byte read/written from EVEN Bank via D0–D7 (Single Bus Cycle)';
      busCycles = 1;
    } else {
      transferDescription = '1 Byte read/written from ODD Bank via D8–D15 (Single Bus Cycle)';
      busCycles = 1;
    }
  } else {
    if (isEvenAddress) {
      transferDescription = 'Aligned 16-bit Word access: Both Even & Odd Banks accessed simultaneously in 1 Bus Cycle!';
      busCycles = 1;
    } else {
      transferDescription = 'Misaligned 16-bit Word access: Requires 2 Bus Cycles! (Cycle 1: Odd byte at addr; Cycle 2: Even byte at addr+1)';
      busCycles = 2;
    }
  }

  // 74LS138 Decoder Output Logic
  const decoderEnabled = (g1 === 1) && (g2a === 0) && (g2b === 0);
  const decoderSelectIndex = (a19 << 2) | (a18 << 1) | a17;
  const outputs = Array.from({ length: 8 }, (_, idx) => (decoderEnabled && idx === decoderSelectIndex) ? 0 : 1);

  return (
    <div className="bg-slate-900 text-slate-100 p-4 md:p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4 text-xs font-sans">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600/20 rounded-xl border border-indigo-500/30 text-indigo-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Semiconductor Memory Interfacing & Architecture</h3>
            <p className="text-[11px] text-slate-400">Memory Hierarchy, RAM vs ROM Technologies, Bank Selection & Address Decoding</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 gap-1">
          <button
            onClick={() => setActiveTab('hierarchy')}
            className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'hierarchy' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Memory Hierarchy
          </button>
          <button
            onClick={() => setActiveTab('types')}
            className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'types' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            RAM & ROM Types
          </button>
          <button
            onClick={() => setActiveTab('bank')}
            className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'bank' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Even/Odd Banks
          </button>
          <button
            onClick={() => setActiveTab('decoder')}
            className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'decoder' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            74LS138 Decoder
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'map' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            1 MB Memory Map
          </button>
        </div>
      </div>

      {/* TAB: Memory Hierarchy */}
      {activeTab === 'hierarchy' && (
        <div className="space-y-4">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center mb-3">
              <span className="text-indigo-300 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> System Storage & Memory Hierarchy Pyramid
              </span>
              <span className="text-[10px] text-slate-400">Click any pyramid level to view technical parameters</span>
            </div>

            {/* Pyramid Visual */}
            <div className="space-y-1.5 max-w-2xl mx-auto">
              {hierarchyLevels.map((lvl) => {
                const isSelected = selectedHierarchyLevel === lvl.level;
                // pyramid width styling
                const widths = ['w-1/3', 'w-1/2', 'w-2/3', 'w-5/6', 'w-full'];
                const colors = [
                  'from-purple-600 to-indigo-600 border-purple-400',
                  'from-indigo-600 to-blue-600 border-indigo-400',
                  'from-blue-600 to-teal-600 border-blue-400',
                  'from-teal-600 to-emerald-600 border-teal-400',
                  'from-slate-700 to-slate-800 border-slate-600'
                ];

                return (
                  <button
                    key={lvl.level}
                    onClick={() => setSelectedHierarchyLevel(lvl.level)}
                    className={`${widths[lvl.level]} mx-auto block transition-all duration-200 cursor-pointer text-center p-2 rounded-xl bg-gradient-to-r ${colors[lvl.level]} border shadow-md hover:brightness-125 ${
                      isSelected ? 'ring-2 ring-amber-400 scale-[1.02]' : 'opacity-90'
                    }`}
                  >
                    <div className="flex items-center justify-between px-3 text-white font-bold">
                      <span className="text-[10px] bg-slate-950/60 px-2 py-0.5 rounded-md text-amber-300 font-mono">
                        Level {lvl.level}
                      </span>
                      <span className="text-xs truncate px-2">{lvl.name}</span>
                      <span className="text-[10px] font-mono opacity-90">{lvl.type}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="flex justify-between text-[10px] text-slate-400 mt-2 px-4 font-mono">
              <span className="text-purple-400 font-bold">▲ Fastest Speed / Smallest Capacity / Highest Cost</span>
              <span className="text-slate-400 font-bold">▼ Slowest Speed / Largest Capacity / Lowest Cost</span>
            </div>
          </div>

          {/* Detailed Level Panel */}
          {(() => {
            const levelInfo = hierarchyLevels[selectedHierarchyLevel];
            return (
              <div className="bg-slate-950/80 p-4 rounded-xl border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-sm text-indigo-300 flex items-center gap-2">
                    <span className="p-1 bg-indigo-600 text-white rounded font-mono text-xs">L{levelInfo.level}</span>
                    {levelInfo.name} — <span className="text-slate-300">{levelInfo.type}</span>
                  </h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                    levelInfo.volatility === 'Volatile' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {levelInfo.volatility} Memory
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 font-mono text-[11px]">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px] block font-sans">Typical Access Latency</span>
                    <strong className="text-emerald-400 text-xs">{levelInfo.speed}</strong>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px] block font-sans">Storage Capacity</span>
                    <strong className="text-indigo-300 text-xs">{levelInfo.capacity}</strong>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px] block font-sans">Cost Per Bit</span>
                    <strong className="text-amber-400 text-xs">{levelInfo.cost}</strong>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px] block font-sans">Cell Technology</span>
                    <strong className="text-blue-300 text-xs truncate block">{levelInfo.tech}</strong>
                  </div>
                </div>

                <div className="bg-indigo-950/30 border border-indigo-800/40 p-3 rounded-lg text-slate-200">
                  <span className="text-indigo-300 font-bold block mb-0.5">8086 System Integration & Role:</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{levelInfo.useCase}</p>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB: RAM & ROM Types */}
      {activeTab === 'types' && (
        <div className="space-y-4">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <div className="text-indigo-300 font-bold text-[11px] uppercase tracking-wider">
              Select Memory Technology to Compare Technical Specifications
            </div>

            {/* Type Selector Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5 font-mono">
              {[
                { id: 'sram', label: 'SRAM' },
                { id: 'dram', label: 'DRAM' },
                { id: 'maskrom', label: 'Mask ROM' },
                { id: 'prom', label: 'PROM' },
                { id: 'eprom', label: 'EPROM' },
                { id: 'eeprom', label: 'EEPROM' },
                { id: 'flash', label: 'Flash' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedMemoryType(item.id)}
                  className={`py-2 px-2 rounded-lg text-[11px] font-bold cursor-pointer transition-all border ${
                    selectedMemoryType === item.id
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-md scale-[1.02]'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Memory Spec Card */}
          {(() => {
            const spec = memoryTypesData[selectedMemoryType] || memoryTypesData.sram;
            return (
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                  <div>
                    <h4 className="font-bold text-sm text-indigo-300">{spec.title}</h4>
                    <span className="text-[11px] text-slate-400 font-mono">{spec.category}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold ${
                    spec.volatility.startsWith('Volatile')
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {spec.volatility}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-bold block text-[10px]">BIT CELL TECHNOLOGY</span>
                    <p className="text-slate-200 font-mono">{spec.cellTech}</p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-bold block text-[10px]">ACCESS SPEED / LATENCY</span>
                    <p className="text-emerald-400 font-mono font-bold">{spec.speed}</p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-bold block text-[10px]">DYNAMIC REFRESH REQUIREMENT</span>
                    <p className="text-indigo-300 font-mono">{spec.refresh}</p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-bold block text-[10px]">ERASING & REPROGRAMMING METHOD</span>
                    <p className="text-amber-300 font-mono">{spec.eraseMethod}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <strong className="text-indigo-300 block mb-0.5">Technology Overview:</strong>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{spec.description}</p>
                  </div>
                  <div className="bg-emerald-950/30 border border-emerald-800/40 p-3 rounded-lg text-emerald-200">
                    <strong className="text-emerald-300 block mb-0.5">Role in Microprocessor / 8086 Interfacing:</strong>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{spec.microRole}</p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 1: Even/Odd Memory Banks */}
      {activeTab === 'bank' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            {/* Input Controls */}
            <div className="space-y-3">
              <label className="block text-indigo-300 font-bold text-[11px] uppercase tracking-wider">
                1. Target Physical Address (Hex 00000H–FFFFFH)
              </label>
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-400 text-sm">0x</span>
                <input
                  type="text"
                  maxLength={5}
                  value={addressHex}
                  onChange={(e) => setAddressHex(e.target.value.toUpperCase().replace(/[^0-9A-F]/g, ''))}
                  className="bg-slate-900 border border-slate-700 text-indigo-300 font-mono text-sm px-3 py-1.5 rounded-lg w-32 focus:outline-hidden focus:border-indigo-500 font-bold"
                />
                <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold ${isEvenAddress ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                  {isEvenAddress ? 'EVEN Address' : 'ODD Address'}
                </span>
              </div>

              <label className="block text-indigo-300 font-bold text-[11px] uppercase tracking-wider pt-1">
                2. Data Transfer Size
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setTransferType('byte')}
                  className={`flex-1 py-1.5 px-3 rounded-lg border font-semibold cursor-pointer transition-all ${
                    transferType === 'byte' ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  8-Bit Byte Transfer
                </button>
                <button
                  onClick={() => setTransferType('word')}
                  className={`flex-1 py-1.5 px-3 rounded-lg border font-semibold cursor-pointer transition-all ${
                    transferType === 'word' ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  16-Bit Word Transfer
                </button>
              </div>
            </div>

            {/* Signal Outputs */}
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Bus Control Line States</div>
              <div className="grid grid-cols-2 gap-2 font-mono">
                <div className={`p-2 rounded border ${a0 === 0 ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                  <div className="text-[10px] text-slate-400">A0 Line (Address bit 0)</div>
                  <div className="text-base font-extrabold">{a0} ({a0 === 0 ? 'LOW - Enable Even' : 'HIGH'})</div>
                </div>
                <div className={`p-2 rounded border ${bhe === 0 ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                  <div className="text-[10px] text-slate-400">BHE# Line (Bus High Enable)</div>
                  <div className="text-base font-extrabold">{bhe} ({bhe === 0 ? 'LOW - Enable Odd' : 'HIGH'})</div>
                </div>
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
                <span>Bus Cycles Needed:</span>
                <span className={`font-bold font-mono px-2 py-0.5 rounded ${busCycles === 1 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                  {busCycles} {busCycles === 1 ? 'Cycle' : 'Cycles (Misaligned Penalty!)'}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Memory Banks Diagram */}
          <div className="grid grid-cols-2 gap-4">
            {/* Even Bank */}
            <div className={`p-3.5 rounded-xl border transition-all ${evenBankActive ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-950/50' : 'bg-slate-950/50 border-slate-800 opacity-60'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" /> Even Bank (512 KB)
                </span>
                <span className="font-mono text-[10px] bg-emerald-900/40 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700/50">D0–D7 Data Bus</span>
              </div>
              <p className="text-[11px] text-slate-300 mb-2">Activated when <strong className="text-white">A0 = 0</strong>. Holds even memory addresses (00000H, 00002H, 00004H...).</p>
              <div className={`p-2 rounded text-center font-bold font-mono text-[11px] ${evenBankActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                {evenBankActive ? '● BANK ACTIVE (D0-D7)' : '○ BANK INACTIVE'}
              </div>
            </div>

            {/* Odd Bank */}
            <div className={`p-3.5 rounded-xl border transition-all ${oddBankActive ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-950/50' : 'bg-slate-950/50 border-slate-800 opacity-60'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-indigo-400 text-xs flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" /> Odd Bank (512 KB)
                </span>
                <span className="font-mono text-[10px] bg-indigo-900/40 text-indigo-300 px-2 py-0.5 rounded border border-indigo-700/50">D8–D15 Data Bus</span>
              </div>
              <p className="text-[11px] text-slate-300 mb-2">Activated when <strong className="text-white">BHE# = 0</strong>. Holds odd memory addresses (00001H, 00003H, 00005H...).</p>
              <div className={`p-2 rounded text-center font-bold font-mono text-[11px] ${oddBankActive ? 'bg-indigo-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                {oddBankActive ? '● BANK ACTIVE (D8-D15)' : '○ BANK INACTIVE'}
              </div>
            </div>
          </div>

          <div className="p-3 bg-indigo-950/30 border border-indigo-800/40 rounded-xl text-indigo-200 text-[11.5px] flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Operational Summary: </strong>
              {transferDescription}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 74LS138 Address Decoder */}
      {activeTab === 'decoder' && (
        <div className="space-y-3">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-300 text-xs uppercase tracking-wider">IC 74LS138 3-to-8 Line Address Decoder Inputs</span>
              <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded font-bold ${decoderEnabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                Decoder {decoderEnabled ? 'ENABLED (G1=1, G2A#=0, G2B#=0)' : 'DISABLED'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Select Line A19 */}
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Address Bit A19 (Select C)</span>
                <button
                  onClick={() => setA19(a19 === 1 ? 0 : 1)}
                  className={`mt-1 w-full py-1 rounded font-mono font-bold cursor-pointer transition-all ${a19 === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  Bit C = {a19}
                </button>
              </div>

              {/* Select Line A18 */}
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Address Bit A18 (Select B)</span>
                <button
                  onClick={() => setA18(a18 === 1 ? 0 : 1)}
                  className={`mt-1 w-full py-1 rounded font-mono font-bold cursor-pointer transition-all ${a18 === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  Bit B = {a18}
                </button>
              </div>

              {/* Select Line A17 */}
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Address Bit A17 (Select A)</span>
                <button
                  onClick={() => setA17(a17 === 1 ? 0 : 1)}
                  className={`mt-1 w-full py-1 rounded font-mono font-bold cursor-pointer transition-all ${a17 === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  Bit A = {a17}
                </button>
              </div>
            </div>
          </div>

          {/* 74LS138 Output Pin States */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Active-LOW Chip Select Outputs (Y0# to Y7#)</div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {outputs.map((val, idx) => {
                const isActive = val === 0;
                return (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg border text-center font-mono transition-all ${
                      isActive ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-md scale-105' : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="text-[9px] opacity-80">Y{idx}#</div>
                    <div className="text-sm font-bold">{val}</div>
                    <div className="text-[8px] truncate">{isActive ? 'SELECTED' : 'High'}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RAM & ROM 1MB Map */}
      {activeTab === 'map' && (
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
          <div className="text-indigo-300 font-bold text-[11px] uppercase tracking-wider">
            8086 1 MB Physical Memory Map Architecture
          </div>

          <div className="space-y-2 font-mono text-[11px]">
            {/* Top ROM */}
            <div className="bg-amber-950/40 border border-amber-500/60 p-2.5 rounded-lg flex items-center justify-between text-amber-200">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <strong className="text-amber-300">System EPROM / ROM (Boot Firmware)</strong>
                  <p className="text-[10px] text-amber-400/80 font-sans">8086 starts execution at FFFF0H upon hardware RESET!</p>
                </div>
              </div>
              <span className="bg-amber-900/60 text-amber-300 px-2 py-1 rounded text-[10px]">FFFF0H – FFFFFH</span>
            </div>

            {/* General User RAM */}
            <div className="bg-indigo-950/40 border border-indigo-500/40 p-2.5 rounded-lg flex items-center justify-between text-indigo-200">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <strong className="text-indigo-300">SRAM / DRAM Main Memory Space</strong>
                  <p className="text-[10px] text-indigo-400/80 font-sans">Code Segment, Data Segment, Stack Segment &amp; Extra Segment storage.</p>
                </div>
              </div>
              <span className="bg-indigo-900/60 text-indigo-300 px-2 py-1 rounded text-[10px]">00400H – FFFEFH</span>
            </div>

            {/* IVT Table at Bottom */}
            <div className="bg-emerald-950/40 border border-emerald-500/60 p-2.5 rounded-lg flex items-center justify-between text-emerald-200">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <strong className="text-emerald-300">Interrupt Vector Table (IVT - 1 KB)</strong>
                  <p className="text-[10px] text-emerald-400/80 font-sans">Holds 256 interrupt pointer vectors (4 bytes each for CS:IP ISR locations).</p>
                </div>
              </div>
              <span className="bg-emerald-900/60 text-emerald-300 px-2 py-1 rounded text-[10px]">00000H – 003FFH</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
