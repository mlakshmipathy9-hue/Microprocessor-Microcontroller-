import React, { useState, useEffect } from 'react';
import { Database, Cpu, Layers, ArrowRight, CheckCircle2, ShieldAlert, CpuIcon, Binary, HelpCircle, Lightbulb, Compass, BookOpen } from 'lucide-react';
import MemorySchematicDiagram from './MemorySchematicDiagram';
import RAM32KInterfacingDesign from './RAM32KInterfacingDesign';
import RAMROMInterfacingDesign from './RAMROMInterfacingDesign';

export type MemoryInterfacingTab = 'hierarchy' | 'types' | 'bank' | 'decoder' | 'map' | 'schematic' | 'ram32k-design' | 'ram-rom-design';

interface MemoryInterfacingSimulatorProps {
  initialTab?: MemoryInterfacingTab;
  allowedTabs?: MemoryInterfacingTab[];
}

export default function MemoryInterfacingSimulator({
  initialTab = 'hierarchy',
  allowedTabs,
}: MemoryInterfacingSimulatorProps) {
  const [activeTab, setActiveTab] = useState<MemoryInterfacingTab>(initialTab);
  const [selectedHierarchyLevel, setSelectedHierarchyLevel] = useState<number>(0);
  const [selectedMemoryType, setSelectedMemoryType] = useState<string>('sram');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

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

  const tabMeta: Record<MemoryInterfacingTab, { label: string; title: string; subtitle: string }> = {
    hierarchy: {
      label: 'Memory Hierarchy',
      title: 'Memory Hierarchy & System Storage Pyramid',
      subtitle: 'Registers (0 Wait State) → Cache SRAM → Main DRAM → Boot ROM → Secondary Storage'
    },
    types: {
      label: 'RAM & ROM Types',
      title: 'Semiconductor Memory Technologies & Cell Architectures',
      subtitle: 'SRAM (6T Flip-Flops) • DRAM (1T1C + Refresh) • EPROM (UV Erase) • EEPROM • Flash'
    },
    bank: {
      label: 'Even/Odd Banks',
      title: '8086 16-Bit Memory Bank Interfacing (BHE# & A0)',
      subtitle: 'Even Bank (D0–D7 / A0=0) • Odd Bank (D8–D15 / BHE#=0) • Aligned vs. Misaligned Transfers'
    },
    decoder: {
      label: '74LS138 Decoder',
      title: '74LS138 3-to-8 Address Decoder & Chip Select Generator',
      subtitle: 'Decodes High-Order Address Lines (A17–A19) • Active-Low Chip Select (CS0#–CS7#)'
    },
    map: {
      label: '1 MB Memory Map',
      title: '8086 1 MB Physical Memory Map Design',
      subtitle: 'IVT at 00000H–003FFH • RAM at Lower Space • Reset Boot ROM at FFFF0H–FFFFFH'
    },
    schematic: {
      label: 'Schematic Circuit 📐',
      title: '8086 Complete Memory Interfacing Circuit Schematic',
      subtitle: 'Minimum Mode 8086 • 3× 74LS373 Latches • 74LS138 Decoder • 2× 74LS245 Buffers • Even/Odd Banks'
    },
    'ram32k-design': {
      label: '32 KB RAM Design (Q1) 💡',
      title: '32 KB RAM Interfacing with 8086 (Absolute Decoding)',
      subtitle: 'Q.1: 32 KB RAM Design • Even/Odd Banks • Address Line Budget • Binary Decoding Table • Full Schematic'
    },
    'ram-rom-design': {
      label: 'RAM + ROM Interfacing (Q2) ⚡',
      title: '32 KB RAM + 32 KB ROM Dual Memory Interfacing with 8086',
      subtitle: 'Q.2: Dual Memory Interfacing • 4 Chips (2× RAM + 2× ROM) • Dual Decoders • Full Live Simulation'
    }
  };

  const displayedTabs = allowedTabs && allowedTabs.length > 0
    ? allowedTabs
    : (['schematic', 'ram32k-design', 'bank', 'decoder', 'map', 'types', 'hierarchy'] as MemoryInterfacingTab[]);

  const currentMeta = tabMeta[activeTab] || tabMeta.hierarchy;

  return (
    <div className="bg-white text-slate-800 p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs font-sans">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-200 text-indigo-600">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">{currentMeta.title}</h3>
            <p className="text-[11px] text-slate-500">{currentMeta.subtitle}</p>
          </div>
        </div>

        {/* Tab Switcher (Only shown if more than 1 tab is allowed) */}
        {displayedTabs.length > 1 && (
          <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
            {displayedTabs.map((tabKey) => {
              const isSelected = activeTab === tabKey;
              return (
                <button
                  key={tabKey}
                  onClick={() => setActiveTab(tabKey)}
                  className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white text-indigo-700 shadow-xs font-bold border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tabMeta[tabKey].label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* TAB: Memory Hierarchy */}
      {activeTab === 'hierarchy' && (
        <div className="space-y-4">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-3">
              <span className="text-indigo-950 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" /> System Storage & Memory Hierarchy Pyramid
              </span>
              <span className="text-[10px] text-slate-500">Click any pyramid level to view technical parameters</span>
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
                  'from-slate-600 to-slate-700 border-slate-500'
                ];

                return (
                  <button
                    key={lvl.level}
                    onClick={() => setSelectedHierarchyLevel(lvl.level)}
                    className={`${widths[lvl.level]} mx-auto block transition-all duration-200 cursor-pointer text-center p-2 rounded-xl bg-gradient-to-r ${colors[lvl.level]} border shadow-xs hover:brightness-110 ${
                      isSelected ? 'ring-2 ring-indigo-500 scale-[1.02]' : 'opacity-95'
                    }`}
                  >
                    <div className="flex items-center justify-between px-3 text-white font-bold">
                      <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded-md text-amber-200 font-mono">
                        Level {lvl.level}
                      </span>
                      <span className="text-xs truncate px-2">{lvl.name}</span>
                      <span className="text-[10px] font-mono opacity-90">{lvl.type}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="flex justify-between text-[10px] text-slate-500 mt-2.5 px-4 font-mono">
              <span className="text-purple-700 font-bold">▲ Fastest Speed / Smallest Capacity / Highest Cost</span>
              <span className="text-slate-600 font-bold">▼ Slowest Speed / Largest Capacity / Lowest Cost</span>
            </div>
          </div>

          {/* Detailed Level Panel */}
          {(() => {
            const levelInfo = hierarchyLevels[selectedHierarchyLevel];
            return (
              <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-sm text-indigo-950 flex items-center gap-2">
                    <span className="p-1 bg-indigo-600 text-white rounded font-mono text-xs">L{levelInfo.level}</span>
                    {levelInfo.name} — <span className="text-slate-600 font-normal">{levelInfo.type}</span>
                  </h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                    levelInfo.volatility === 'Volatile' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}>
                    {levelInfo.volatility} Memory
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 font-mono text-[11px]">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 text-[10px] block font-sans">Typical Access Latency</span>
                    <strong className="text-emerald-700 text-xs font-bold">{levelInfo.speed}</strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 text-[10px] block font-sans">Storage Capacity</span>
                    <strong className="text-indigo-700 text-xs font-bold">{levelInfo.capacity}</strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 text-[10px] block font-sans">Cost Per Bit</span>
                    <strong className="text-amber-800 text-xs font-bold">{levelInfo.cost}</strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 text-[10px] block font-sans">Cell Technology</span>
                    <strong className="text-blue-700 text-xs truncate block font-bold">{levelInfo.tech}</strong>
                  </div>
                </div>

                <div className="bg-indigo-50/70 border border-indigo-200 p-3 rounded-lg text-slate-700">
                  <span className="text-indigo-950 font-bold block mb-0.5">8086 System Integration & Role:</span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{levelInfo.useCase}</p>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB: RAM & ROM Types */}
      {activeTab === 'types' && (
        <div className="space-y-4">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <div className="text-indigo-950 font-bold text-[11px] uppercase tracking-wider">
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
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-100'
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
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{spec.title}</h4>
                    <span className="text-[11px] text-slate-500 font-mono">{spec.category}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold ${
                    spec.volatility.startsWith('Volatile')
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}>
                    {spec.volatility}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                    <span className="text-slate-500 font-bold block text-[10px]">BIT CELL TECHNOLOGY</span>
                    <p className="text-slate-800 font-mono">{spec.cellTech}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                    <span className="text-slate-500 font-bold block text-[10px]">ACCESS SPEED / LATENCY</span>
                    <p className="text-emerald-700 font-mono font-bold">{spec.speed}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                    <span className="text-slate-500 font-bold block text-[10px]">DYNAMIC REFRESH REQUIREMENT</span>
                    <p className="text-indigo-700 font-mono font-semibold">{spec.refresh}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                    <span className="text-slate-500 font-bold block text-[10px]">ERASING & REPROGRAMMING METHOD</span>
                    <p className="text-amber-800 font-mono font-semibold">{spec.eraseMethod}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <strong className="text-indigo-950 block mb-0.5">Technology Overview:</strong>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{spec.description}</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-emerald-950">
                    <strong className="text-emerald-900 block mb-0.5">Role in Microprocessor / 8086 Interfacing:</strong>
                    <p className="text-slate-700 text-[11px] leading-relaxed">{spec.microRole}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            {/* Input Controls */}
            <div className="space-y-3">
              <label className="block text-indigo-950 font-bold text-[11px] uppercase tracking-wider">
                1. Target Physical Address (Hex 00000H–FFFFFH)
              </label>
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-500 text-sm">0x</span>
                <input
                  type="text"
                  maxLength={5}
                  value={addressHex}
                  onChange={(e) => setAddressHex(e.target.value.toUpperCase().replace(/[^0-9A-F]/g, ''))}
                  className="bg-white border border-slate-300 text-indigo-950 font-mono text-sm px-3 py-1.5 rounded-lg w-32 focus:outline-hidden focus:border-indigo-500 font-bold shadow-2xs"
                />
                <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold ${isEvenAddress ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                  {isEvenAddress ? 'EVEN Address' : 'ODD Address'}
                </span>
              </div>

              <label className="block text-indigo-950 font-bold text-[11px] uppercase tracking-wider pt-1">
                2. Data Transfer Size
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setTransferType('byte')}
                  className={`flex-1 py-1.5 px-3 rounded-lg border font-semibold cursor-pointer transition-all ${
                    transferType === 'byte' ? 'bg-indigo-50 border-indigo-400 text-indigo-900 font-bold shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  8-Bit Byte Transfer
                </button>
                <button
                  onClick={() => setTransferType('word')}
                  className={`flex-1 py-1.5 px-3 rounded-lg border font-semibold cursor-pointer transition-all ${
                    transferType === 'word' ? 'bg-indigo-50 border-indigo-400 text-indigo-900 font-bold shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  16-Bit Word Transfer
                </button>
              </div>
            </div>

            {/* Signal Outputs */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2 shadow-2xs">
              <div className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">Bus Control Line States</div>
              <div className="grid grid-cols-2 gap-2 font-mono">
                <div className={`p-2 rounded border ${a0 === 0 ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                  <div className="text-[10px] text-slate-500 font-sans">A0 Line (Address bit 0)</div>
                  <div className="text-base font-extrabold">{a0} ({a0 === 0 ? 'LOW - Enable Even' : 'HIGH'})</div>
                </div>
                <div className={`p-2 rounded border ${bhe === 0 ? 'bg-indigo-50 border-indigo-300 text-indigo-900' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                  <div className="text-[10px] text-slate-500 font-sans">BHE# Line (Bus High Enable)</div>
                  <div className="text-base font-extrabold">{bhe} ({bhe === 0 ? 'LOW - Enable Odd' : 'HIGH'})</div>
                </div>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-700 flex items-center justify-between">
                <span>Bus Cycles Needed:</span>
                <span className={`font-bold font-mono px-2 py-0.5 rounded ${busCycles === 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800 border border-rose-200'}`}>
                  {busCycles} {busCycles === 1 ? 'Cycle' : 'Cycles (Misaligned Penalty!)'}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Memory Banks Diagram */}
          <div className="grid grid-cols-2 gap-4">
            {/* Even Bank */}
            <div className={`p-3.5 rounded-xl border transition-all ${evenBankActive ? 'bg-emerald-50/80 border-emerald-300 shadow-xs' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-600" /> Even Bank (512 KB)
                </span>
                <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-bold">D0–D7 Data Bus</span>
              </div>
              <p className="text-[11px] text-slate-600 mb-2">Activated when <strong className="text-slate-900">A0 = 0</strong>. Holds even memory addresses (00000H, 00002H, 00004H...).</p>
              <div className={`p-2 rounded text-center font-bold font-mono text-[11px] ${evenBankActive ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-slate-200 text-slate-500'}`}>
                {evenBankActive ? '● BANK ACTIVE (D0-D7)' : '○ BANK INACTIVE'}
              </div>
            </div>

            {/* Odd Bank */}
            <div className={`p-3.5 rounded-xl border transition-all ${oddBankActive ? 'bg-indigo-50/80 border-indigo-300 shadow-xs' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-indigo-600" /> Odd Bank (512 KB)
                </span>
                <span className="font-mono text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded border border-indigo-200 font-bold">D8–D15 Data Bus</span>
              </div>
              <p className="text-[11px] text-slate-600 mb-2">Activated when <strong className="text-slate-900">BHE# = 0</strong>. Holds odd memory addresses (00001H, 00003H, 00005H...).</p>
              <div className={`p-2 rounded text-center font-bold font-mono text-[11px] ${oddBankActive ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-200 text-slate-500'}`}>
                {oddBankActive ? '● BANK ACTIVE (D8-D15)' : '○ BANK INACTIVE'}
              </div>
            </div>
          </div>

          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-slate-800 text-[11.5px] flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">Operational Summary: </strong>
              {transferDescription}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 74LS138 Address Decoder */}
      {activeTab === 'decoder' && (
        <div className="space-y-3">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-950 text-xs uppercase tracking-wider">IC 74LS138 3-to-8 Line Address Decoder Inputs</span>
              <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded font-bold ${decoderEnabled ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                Decoder {decoderEnabled ? 'ENABLED (G1=1, G2A#=0, G2B#=0)' : 'DISABLED'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Select Line A19 */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-slate-500 text-[10px] block">Address Bit A19 (Select C)</span>
                <button
                  onClick={() => setA19(a19 === 1 ? 0 : 1)}
                  className={`mt-1 w-full py-1 rounded font-mono font-bold cursor-pointer transition-all ${a19 === 1 ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Bit C = {a19}
                </button>
              </div>

              {/* Select Line A18 */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-slate-500 text-[10px] block">Address Bit A18 (Select B)</span>
                <button
                  onClick={() => setA18(a18 === 1 ? 0 : 1)}
                  className={`mt-1 w-full py-1 rounded font-mono font-bold cursor-pointer transition-all ${a18 === 1 ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Bit B = {a18}
                </button>
              </div>

              {/* Select Line A17 */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-slate-500 text-[10px] block">Address Bit A17 (Select A)</span>
                <button
                  onClick={() => setA17(a17 === 1 ? 0 : 1)}
                  className={`mt-1 w-full py-1 rounded font-mono font-bold cursor-pointer transition-all ${a17 === 1 ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Bit A = {a17}
                </button>
              </div>
            </div>
          </div>

          {/* 74LS138 Output Pin States */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
            <div className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">Active-LOW Chip Select Outputs (Y0# to Y7#)</div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {outputs.map((val, idx) => {
                const isActive = val === 0;
                return (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg border text-center font-mono transition-all ${
                      isActive ? 'bg-emerald-600 text-white border-emerald-600 font-extrabold shadow-xs scale-105' : 'bg-slate-50 border-slate-200 text-slate-600'
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

      {/* TAB 3: RAM & ROM 1MB Map & Address Decoding */}
      {activeTab === 'map' && (
        <div className="space-y-4">
          {/* Top Banner: Concept Link */}
          <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white p-4 rounded-xl shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="bg-indigo-700/60 text-indigo-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                  Architecture &amp; Decoding Foundation
                </span>
                <h3 className="text-sm font-bold mt-1 text-white">
                  8086 1 MB Physical Memory Organization &amp; Address Decoding Logic
                </h3>
                <p className="text-xs text-indigo-200 mt-0.5">
                  How the 8086 partitions 1 MB (2^20 bytes = 1,048,576 bytes) and uses high-order address lines A15–A19 to select memory chips.
                </p>
              </div>
            </div>
          </div>

          {/* 1 MB Memory Map Architecture Breakdown */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-indigo-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                1 MB Physical Address Space Allocation
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded font-bold">
                Total Range: 00000H – FFFFFH
              </span>
            </div>

            <div className="space-y-2.5 font-mono text-[11px]">
              {/* Top ROM */}
              <div className="bg-amber-50/80 border-2 border-amber-300 p-3 rounded-lg flex items-center justify-between text-amber-950 hover:bg-amber-50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-200/70 rounded-md">
                    <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
                  </div>
                  <div>
                    <strong className="text-amber-950 text-xs">Top Space: System EPROM / ROM (Reset Boot Firmware)</strong>
                    <p className="text-[10.5px] text-amber-900 font-sans mt-0.5">
                      <strong>Why placed here?</strong> When 8086 is reset, <code>CS = FFFFH</code> and <code>IP = 0000H</code> &rarr; execution starts at <strong>FFFF0H</strong>!
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="bg-amber-200 text-amber-950 border border-amber-300 font-bold px-2.5 py-1 rounded text-[11px] block">
                    FFFF0H – FFFFFH
                  </span>
                  <span className="text-[9px] text-amber-800 font-sans">Boot Vector Space</span>
                </div>
              </div>

              {/* General User RAM */}
              <div className="bg-indigo-50/80 border-2 border-indigo-300 p-3 rounded-lg flex items-center justify-between text-indigo-950 hover:bg-indigo-50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-200/70 rounded-md">
                    <Database className="w-5 h-5 text-indigo-700 shrink-0" />
                  </div>
                  <div>
                    <strong className="text-indigo-950 text-xs">Middle/Lower Space: SRAM / DRAM User &amp; System Memory</strong>
                    <p className="text-[10.5px] text-indigo-900 font-sans mt-0.5">
                      Allocated for Code Segment (CS), Data Segment (DS), Stack Segment (SS), Extra Segment (ES), and OS buffers.
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="bg-indigo-200 text-indigo-950 border border-indigo-300 font-bold px-2.5 py-1 rounded text-[11px] block">
                    00400H – FFFEFH
                  </span>
                  <span className="text-[9px] text-indigo-800 font-sans">Read/Write RAM Area</span>
                </div>
              </div>

              {/* IVT Table at Bottom */}
              <div className="bg-emerald-50/80 border-2 border-emerald-300 p-3 rounded-lg flex items-center justify-between text-emerald-950 hover:bg-emerald-50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-200/70 rounded-md">
                    <Cpu className="w-5 h-5 text-emerald-700 shrink-0" />
                  </div>
                  <div>
                    <strong className="text-emerald-950 text-xs">Bottom 1 KB: Interrupt Vector Table (IVT)</strong>
                    <p className="text-[10.5px] text-emerald-900 font-sans mt-0.5">
                      Holds 256 Interrupt Pointers (Type 0 to 255), 4 bytes each (IP:CS) pointing to Interrupt Service Routines (ISRs).
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="bg-emerald-200 text-emerald-950 border border-emerald-300 font-bold px-2.5 py-1 rounded text-[11px] block">
                    00000H – 003FFH
                  </span>
                  <span className="text-[9px] text-emerald-800 font-sans">Dedicated 1 KB IVT</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Bridge & Clarifications: Connecting Slide 4 (Theory) to Slide 5 (Circuit Design Problem) */}
          <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 p-4 rounded-xl border border-indigo-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-indigo-600 text-white rounded-lg shadow-xs">
                <Lightbulb className="w-5 h-5" />
              </span>
              <div>
                <h4 className="font-bold text-xs text-indigo-950">
                  Key Conceptual Link &amp; Architecture Clarifications
                </h4>
                <p className="text-[11px] text-slate-600">
                  How the 1 MB memory organization rules directly govern the 32 KB RAM Interfacing Problem:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* Clarification 1: 32 KB RAM Placement in the Map */}
              <div className="bg-white p-3.5 rounded-xl border border-indigo-200 shadow-xs space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-indigo-900 font-bold mb-1">
                    <Database className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>1. Where does the 32 KB RAM sit?</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    The 32 KB RAM chip (<code>00000H – 07FFFH</code>) sits at the <strong>very bottom</strong> of the 1 MB space and spans two areas:
                  </p>
                  <ul className="mt-2 space-y-1.5 text-[10.5px] text-slate-700">
                    <li className="flex items-start gap-1 bg-emerald-50 p-1.5 rounded border border-emerald-200">
                      <span className="font-bold text-emerald-800 shrink-0">• 00000H–003FFH (1 KB):</span>
                      <span>Interrupt Vector Table (IVT) holding 256 vector pointers.</span>
                    </li>
                    <li className="flex items-start gap-1 bg-indigo-50 p-1.5 rounded border border-indigo-200">
                      <span className="font-bold text-indigo-800 shrink-0">• 00400H–07FFFH (31 KB):</span>
                      <span>User &amp; OS RAM holding <strong>CS, DS, SS, ES</strong> segments (Code, Variables, Stack).</span>
                    </li>
                  </ul>
                </div>
                <div className="text-[10px] text-indigo-700 bg-indigo-50/70 px-2 py-1 rounded font-medium">
                  &bull; Stack (SS) &amp; Data (DS) MUST be in RAM to allow writes!
                </div>
              </div>

              {/* Clarification 2: Accessing 00100H (IVT vs User Access) */}
              <div className="bg-white p-3.5 rounded-xl border border-purple-200 shadow-xs space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-purple-900 font-bold mb-1">
                    <Cpu className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>2. Accessing Address 00100H?</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    <code>00100H</code> (decimal 256) falls strictly inside the <strong>1 KB IVT</strong> (256 / 4 = Type 64 / INT 40H):
                  </p>
                  <ul className="mt-2 space-y-1.5 text-[10.5px] text-slate-700">
                    <li className="flex items-start gap-1 bg-purple-50 p-1.5 rounded border border-purple-200">
                      <span className="font-bold text-purple-800 shrink-0">&bull; Hardware Bus:</span>
                      <span>Treats it as a standard memory read/write cycle (A15–A19 = 0 &rarr; CS# = 0, Even bank enabled).</span>
                    </li>
                    <li className="flex items-start gap-1 bg-amber-50 p-1.5 rounded border border-amber-200">
                      <span className="font-bold text-amber-800 shrink-0">&bull; 8086 CPU:</span>
                      <span>On <code>INT 64</code>, fetches IP &amp; CS. On user <code>MOV</code>, updates the ISR pointer vector.</span>
                    </li>
                  </ul>
                </div>
                <div className="text-[10px] text-purple-700 bg-purple-50/70 px-2 py-1 rounded font-medium">
                  &bull; Safe User Program RAM starts above IVT at <code>00400H</code>.
                </div>
              </div>

              {/* Clarification 3: Maximum RAM & ROM limits */}
              <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-xs space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold mb-1">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>3. Max RAM &amp; ROM Limits?</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    With 20 address lines (A0–A19), total memory is capped at <strong>1 MB (1,024 KB)</strong>:
                  </p>
                  <ul className="mt-2 space-y-1.5 text-[10.5px] text-slate-700">
                    <li className="flex items-start gap-1 bg-slate-50 p-1.5 rounded border border-slate-200">
                      <span className="font-bold text-slate-800 shrink-0">&bull; Golden Rule 1:</span>
                      <span><strong>RAM starts at 00000H</strong> (to host the 1 KB IVT, Stack, and Data variables).</span>
                    </li>
                    <li className="flex items-start gap-1 bg-slate-50 p-1.5 rounded border border-slate-200">
                      <span className="font-bold text-slate-800 shrink-0">&bull; Golden Rule 2:</span>
                      <span><strong>ROM ends at FFFFFH</strong> (to hold the Reset Vector at <code>FFFF0H</code>).</span>
                    </li>
                  </ul>
                </div>
                <div className="text-[10px] text-amber-800 bg-amber-50/70 px-2 py-1 rounded font-medium">
                  &bull; RAM Size + ROM Size &le; 1 MB (e.g. 960 KB RAM + 64 KB ROM).
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Complete Schematic Circuit */}
      {activeTab === 'schematic' && (
        <MemorySchematicDiagram />
      )}

      {/* TAB: 32 KB RAM Interfacing Design (Absolute Decoding) */}
      {activeTab === 'ram32k-design' && (
        <RAM32KInterfacingDesign />
      )}

      {/* TAB: RAM + ROM Interfacing Design (Q2) */}
      {activeTab === 'ram-rom-design' && (
        <RAMROMInterfacingDesign />
      )}
    </div>
  );
}
