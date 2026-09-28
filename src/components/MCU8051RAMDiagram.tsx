import React, { useState } from 'react';
import { Layers, Database, Sparkles, CheckCircle2, ArrowRight, HelpCircle, BookOpen, Cpu, Split } from 'lucide-react';
import MCU8051ROMDiagram from './MCU8051ROMDiagram';

interface MCU8051RAMDiagramProps {
  onSelectZone?: (zone: 'working' | 'bit' | 'general') => void;
  initialDomain?: 'ram' | 'rom' | 'comparison';
}

export default function MCU8051RAMDiagram({ onSelectZone, initialDomain = 'ram' }: MCU8051RAMDiagramProps) {
  const [memoryDomain, setMemoryDomain] = useState<'ram' | 'rom' | 'comparison'>(initialDomain);
  const [selectedSection, setSelectedSection] = useState<'working' | 'bit' | 'general'>('working');
  const [selectedBank, setSelectedBank] = useState<0 | 1 | 2 | 3>(0);
  const [selectedBitRow, setSelectedBitRow] = useState<number>(0); // 0 to 15 (20H to 2FH)
  const [selectedRegister, setSelectedRegister] = useState<{ bank: number; reg: string; addr: string } | null>({
    bank: 0,
    reg: 'R0',
    addr: '00H',
  });

  // Bit address rows from 2F down to 20
  const bitRows = [
    { byteHex: '2F', startBit: '7F', endBit: '78', bitIndex: 15 },
    { byteHex: '2E', startBit: '77', endBit: '70', bitIndex: 14 },
    { byteHex: '2D', startBit: '6F', endBit: '68', bitIndex: 13 },
    { byteHex: '2C', startBit: '67', endBit: '60', bitIndex: 12 },
    { byteHex: '2B', startBit: '5F', endBit: '58', bitIndex: 11 },
    { byteHex: '2A', startBit: '57', endBit: '50', bitIndex: 10 },
    { byteHex: '29', startBit: '4F', endBit: '48', bitIndex: 9 },
    { byteHex: '28', startBit: '47', endBit: '40', bitIndex: 8 },
    { byteHex: '27', startBit: '3F', endBit: '38', bitIndex: 7 },
    { byteHex: '26', startBit: '37', endBit: '30', bitIndex: 6 },
    { byteHex: '25', startBit: '2F', endBit: '28', bitIndex: 5 },
    { byteHex: '24', startBit: '27', endBit: '20', bitIndex: 4 },
    { byteHex: '23', startBit: '1F', endBit: '18', bitIndex: 3 },
    { byteHex: '22', startBit: '17', endBit: '10', bitIndex: 2 },
    { byteHex: '21', startBit: '0F', endBit: '08', bitIndex: 1 },
    { byteHex: '20', startBit: '07', endBit: '00', bitIndex: 0 },
  ];

  // Bank definitions (from 3 down to 0)
  const bank3Regs = [
    { name: 'R7', hex: '1F' },
    { name: 'R6', hex: '1E' },
    { name: 'R5', hex: '1D' },
    { name: 'R4', hex: '1C' },
    { name: 'R3', hex: '1B' },
    { name: 'R2', hex: '1A' },
    { name: 'R1', hex: '19' },
    { name: 'R0', hex: '18' },
  ];

  const bank2Regs = [
    { name: 'R7', hex: '17' },
    { name: 'R6', hex: '16' },
    { name: 'R5', hex: '15' },
    { name: 'R4', hex: '14' },
    { name: 'R3', hex: '13' },
    { name: 'R2', hex: '12' },
    { name: 'R1', hex: '11' },
    { name: 'R0', hex: '10' },
  ];

  const bank1Regs = [
    { name: 'R7', hex: '0F' },
    { name: 'R6', hex: '0E' },
    { name: 'R5', hex: '0D' },
    { name: 'R4', hex: '0C' },
    { name: 'R3', hex: '0B' },
    { name: 'R2', hex: '0A' },
    { name: 'R1', hex: '09' },
    { name: 'R0', hex: '08' },
  ];

  const bank0Regs = [
    { name: 'R7', hex: '07' },
    { name: 'R6', hex: '06' },
    { name: 'R5', hex: '05' },
    { name: 'R4', hex: '04' },
    { name: 'R3', hex: '03' },
    { name: 'R2', hex: '02' },
    { name: 'R1', hex: '01' },
    { name: 'R0', hex: '00' },
  ];

  return (
    <div className="w-full flex flex-col gap-5 font-sans">
      {/* Primary Domain Switcher: RAM Map vs ROM Memory vs Harvard Comparison */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl">
            <Database className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-display">
              8051 Memory Architecture Suite
            </h3>
            <p className="text-[11px] text-slate-500">
              Harvard Architecture: 128B Internal RAM + 4KB Flash/ROM (Expandable to 64KB each)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-mono font-bold">
          <button
            onClick={() => setMemoryDomain('ram')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              memoryDomain === 'ram'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Internal RAM (128B)
          </button>
          <button
            onClick={() => setMemoryDomain('rom')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              memoryDomain === 'rom'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Program ROM (4KB / 64KB)
          </button>
          <button
            onClick={() => setMemoryDomain('comparison')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              memoryDomain === 'comparison'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            RAM vs ROM Comparison
          </button>
        </div>
      </div>

      {/* When ROM or Comparison is selected, show the full interactive ROM & Harvard diagram */}
      {memoryDomain === 'rom' && (
        <MCU8051ROMDiagram defaultTab="map" />
      )}

      {memoryDomain === 'comparison' && (
        <MCU8051ROMDiagram defaultTab="harvard" />
      )}

      {/* When RAM is selected, show the authentic 128-byte RAM map and inspector */}
      {memoryDomain === 'ram' && (
        <div className="flex flex-col gap-5">
          {/* Header Filter */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 font-mono font-bold text-xs flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-600" />
                Internal RAM Organization (00H to 7FH)
              </span>
              <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
                32B Working Registers + 16B Bit Addressable + 80B Scratchpad
              </span>
            </div>

            {/* Section Selector Quick Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setSelectedSection('working')}
                className={`px-3 py-1 font-mono font-bold rounded-lg transition-all cursor-pointer ${
                  selectedSection === 'working'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Working Registers (32B)
              </button>
              <button
                onClick={() => setSelectedSection('bit')}
                className={`px-3 py-1 font-mono font-bold rounded-lg transition-all cursor-pointer ${
                  selectedSection === 'bit'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Bit Addressable (16B)
              </button>
              <button
                onClick={() => setSelectedSection('general')}
                className={`px-3 py-1 font-mono font-bold rounded-lg transition-all cursor-pointer ${
                  selectedSection === 'general'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                General Purpose (80B)
              </button>
            </div>
          </div>

      {/* Main Container: Left Notebook Canvas replicating Slide 13, Right Deep Technical Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Authentic Slide 13 of 50 Notebook Recreation */}
        <div className="lg:col-span-7 bg-[#f6f2e9] p-4 sm:p-6 rounded-2xl border-2 border-[#d8cdb8] shadow-sm relative overflow-hidden">
          {/* Notebook spiral ring simulation on the left edge */}
          <div className="absolute top-0 bottom-0 left-0 w-8 bg-[#e8deca] border-r border-[#d4c6af] flex flex-col justify-around py-4 z-10 select-none">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="flex items-center">
                <div className="w-5 h-2.5 -ml-1 rounded-r-full bg-slate-400 border border-slate-600 shadow-inner"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800 -ml-1 opacity-70"></div>
              </div>
            ))}
          </div>

          {/* Slide 13 of 50 watermark top-right */}
          <div className="flex justify-end pr-2 mb-2 font-mono text-sm font-bold text-slate-700">
            13 of 50
          </div>

          {/* Notebook Content Grid - The 3 Columns */}
          <div className="pl-6 sm:pl-8 pr-1 py-1">
            <div className="grid grid-cols-12 gap-2 sm:gap-4 items-end">
              {/* Column 1: Working Registers (32 Bytes) */}
              <div className="col-span-5 flex flex-col items-center">
                {/* Header */}
                <div className="font-comic-sans text-center font-bold text-slate-800 text-base sm:text-lg mb-1 tracking-tight">
                  32 Bytes
                </div>

                {/* Bank Container */}
                <div className="w-full max-w-[170px] relative border-y-2 border-dashed border-slate-800/80">
                  {/* Bank 3 (Yellow) */}
                  <div className="relative border-b-2 border-dashed border-slate-800/80 flex items-center">
                    {/* Bank 3 vertical label */}
                    <div className="absolute -left-6 sm:-left-7 top-1/2 -translate-y-1/2 -rotate-90 origin-center text-blue-700 font-bold text-[11px] sm:text-xs font-mono tracking-wider whitespace-nowrap select-none">
                      Bank 3
                    </div>
                    <div className="w-full flex flex-col">
                      {bank3Regs.map((r, i) => {
                        const isSel = selectedRegister?.addr === `${r.hex}H`;
                        return (
                          <div
                            key={r.hex}
                            onClick={() => {
                              setSelectedSection('working');
                              setSelectedBank(3);
                              setSelectedRegister({ bank: 3, reg: r.name, addr: `${r.hex}H` });
                            }}
                            className={`flex items-center h-[18px] border-b border-black text-[11px] font-mono cursor-pointer transition-all ${
                              i === 0 ? 'border-t border-black' : ''
                            } ${
                              isSel
                                ? 'bg-yellow-300 ring-2 ring-blue-600 z-10 font-bold'
                                : 'bg-[#ffff77] hover:bg-yellow-200'
                            }`}
                          >
                            <span className="w-6 sm:w-7 text-[10px] sm:text-[11px] font-mono text-slate-800 text-right pr-1 select-none">
                              {r.hex}
                            </span>
                            <div className="flex-1 text-center font-bold text-slate-900 border-l border-black">
                              {r.name}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bank 2 (Lavender/Blue) */}
                  <div className="relative border-b-2 border-dashed border-slate-800/80 flex items-center">
                    {/* Bank 2 vertical label */}
                    <div className="absolute -left-6 sm:-left-7 top-1/2 -translate-y-1/2 -rotate-90 origin-center text-blue-700 font-bold text-[11px] sm:text-xs font-mono tracking-wider whitespace-nowrap select-none">
                      Bank 2
                    </div>
                    <div className="w-full flex flex-col">
                      {bank2Regs.map((r) => {
                        const isSel = selectedRegister?.addr === `${r.hex}H`;
                        return (
                          <div
                            key={r.hex}
                            onClick={() => {
                              setSelectedSection('working');
                              setSelectedBank(2);
                              setSelectedRegister({ bank: 2, reg: r.name, addr: `${r.hex}H` });
                            }}
                            className={`flex items-center h-[18px] border-b border-black text-[11px] font-mono cursor-pointer transition-all ${
                              isSel
                                ? 'bg-indigo-300 ring-2 ring-blue-600 z-10 font-bold'
                                : 'bg-[#c5caff] hover:bg-indigo-200'
                            }`}
                          >
                            <span className="w-6 sm:w-7 text-[10px] sm:text-[11px] font-mono text-slate-800 text-right pr-1 select-none">
                              {r.hex}
                            </span>
                            <div className="flex-1 text-center font-bold text-slate-900 border-l border-black">
                              {r.name}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bank 1 (Cream / Warm Light Yellow) */}
                  <div className="relative border-b-2 border-dashed border-slate-800/80 flex items-center">
                    {/* Bank 1 vertical label */}
                    <div className="absolute -left-6 sm:-left-7 top-1/2 -translate-y-1/2 -rotate-90 origin-center text-blue-700 font-bold text-[11px] sm:text-xs font-mono tracking-wider whitespace-nowrap select-none">
                      Bank 1
                    </div>
                    <div className="w-full flex flex-col">
                      {bank1Regs.map((r) => {
                        const isSel = selectedRegister?.addr === `${r.hex}H`;
                        return (
                          <div
                            key={r.hex}
                            onClick={() => {
                              setSelectedSection('working');
                              setSelectedBank(1);
                              setSelectedRegister({ bank: 1, reg: r.name, addr: `${r.hex}H` });
                            }}
                            className={`flex items-center h-[18px] border-b border-black text-[11px] font-mono cursor-pointer transition-all ${
                              isSel
                                ? 'bg-amber-200 ring-2 ring-blue-600 z-10 font-bold'
                                : 'bg-[#fffee0] hover:bg-amber-100'
                            }`}
                          >
                            <span className="w-6 sm:w-7 text-[10px] sm:text-[11px] font-mono text-slate-800 text-right pr-1 select-none">
                              {r.hex}
                            </span>
                            <div className="flex-1 text-center font-bold text-slate-900 border-l border-black">
                              {r.name}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bank 0 (Pink) */}
                  <div className="relative flex items-center">
                    {/* Bank 0 vertical label */}
                    <div className="absolute -left-6 sm:-left-7 top-1/2 -translate-y-1/2 -rotate-90 origin-center text-blue-700 font-bold text-[11px] sm:text-xs font-mono tracking-wider whitespace-nowrap select-none">
                      Bank 0
                    </div>
                    <div className="w-full flex flex-col">
                      {bank0Regs.map((r) => {
                        const isSel = selectedRegister?.addr === `${r.hex}H`;
                        return (
                          <div
                            key={r.hex}
                            onClick={() => {
                              setSelectedSection('working');
                              setSelectedBank(0);
                              setSelectedRegister({ bank: 0, reg: r.name, addr: `${r.hex}H` });
                            }}
                            className={`flex items-center h-[18px] border-b border-black text-[11px] font-mono cursor-pointer transition-all ${
                              isSel
                                ? 'bg-pink-300 ring-2 ring-blue-600 z-10 font-bold'
                                : 'bg-[#ffd4f6] hover:bg-pink-200'
                            }`}
                          >
                            <span className="w-6 sm:w-7 text-[10px] sm:text-[11px] font-mono text-slate-800 text-right pr-1 select-none">
                              {r.hex}
                            </span>
                            <div className="flex-1 text-center font-bold text-slate-900 border-l border-black">
                              {r.name}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom Label */}
                <div className="font-bold text-slate-900 text-xs sm:text-sm mt-2 text-center tracking-tight">
                  Working Registers
                </div>
              </div>

              {/* Column 2: Bit Addressable (16 Bytes) */}
              <div className="col-span-4 flex flex-col items-center">
                {/* Header */}
                <div className="font-comic-sans text-center font-bold text-slate-800 text-base sm:text-lg mb-1 tracking-tight">
                  16 Bytes
                </div>

                {/* 16 Bytes Bit Table (2F down to 20) */}
                <div className="w-full max-w-[140px] flex flex-col">
                  {bitRows.map((row, idx) => {
                    const isSel = selectedSection === 'bit' && selectedBitRow === idx;
                    return (
                      <div
                        key={row.byteHex}
                        onClick={() => {
                          setSelectedSection('bit');
                          setSelectedBitRow(idx);
                        }}
                        className={`flex items-center h-[18px] border-b border-black text-[10px] sm:text-[11px] font-mono cursor-pointer transition-all ${
                          idx === 0 ? 'border-t border-black' : ''
                        } ${
                          isSel
                            ? 'bg-amber-400 ring-2 ring-amber-600 z-10 font-black'
                            : 'bg-[#e59b20] hover:bg-amber-500'
                        }`}
                      >
                        {/* Hex Byte Address (20 to 2F) to the left */}
                        <span className="w-5 sm:w-6 text-[10px] sm:text-[11px] font-mono text-slate-800 text-right pr-1 select-none">
                          {row.byteHex}
                        </span>

                        {/* Bit Address Range: 7F | 78 */}
                        <div className="flex-1 flex items-center justify-around font-bold text-slate-950 border-l border-black px-1">
                          <span className="text-center">{row.startBit}</span>
                          <span className="w-px h-3 bg-black/40"></span>
                          <span className="text-center">{row.endBit}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Label */}
                <div className="font-bold text-slate-900 text-xs sm:text-sm mt-2 text-center tracking-tight whitespace-nowrap">
                  Bit Addressable
                </div>
              </div>

              {/* Column 3: General Purpose (80 Bytes) */}
              <div className="col-span-3 flex flex-col items-center">
                {/* Header */}
                <div className="font-comic-sans text-center font-bold text-slate-800 text-base sm:text-lg mb-1 tracking-tight">
                  80 Bytes
                </div>

                {/* Big Green Block with Cutout / Zigzag Break */}
                <div
                  onClick={() => setSelectedSection('general')}
                  className={`w-full max-w-[100px] flex flex-col cursor-pointer transition-all group ${
                    selectedSection === 'general' ? 'ring-2 ring-emerald-600 rounded-xs' : ''
                  }`}
                >
                  {/* Top Block (up to 7F) */}
                  <div className="relative">
                    <span className="absolute -left-5 top-0 text-[11px] font-mono text-slate-800 select-none font-bold">
                      7F
                    </span>
                    <div className="h-[140px] bg-[#9bb868] border-2 border-black border-b-0 relative group-hover:bg-[#8eac59] transition-colors">
                      {/* Diagonal slice at bottom */}
                      <svg
                        className="absolute -bottom-[2px] left-0 w-full h-8 text-black fill-[#9bb868]"
                        viewBox="0 0 100 30"
                        preserveAspectRatio="none"
                      >
                        <polygon points="0,0 100,20 100,30 0,10" fill="#f6f2e9" stroke="#000" strokeWidth="2" />
                      </svg>
                    </div>
                  </div>

                  {/* Cutout Gap / Diagonal Break Indicator */}
                  <div className="h-6"></div>

                  {/* Bottom Block (down to 30) */}
                  <div className="relative">
                    <span className="absolute -left-5 bottom-0 text-[11px] font-mono text-slate-800 select-none font-bold">
                      30
                    </span>
                    <div className="h-[140px] bg-[#9bb868] border-2 border-black border-t-0 relative group-hover:bg-[#8eac59] transition-colors">
                      {/* Diagonal slice at top */}
                      <svg
                        className="absolute -top-[2px] left-0 w-full h-8 text-black fill-[#9bb868]"
                        viewBox="0 0 100 30"
                        preserveAspectRatio="none"
                      >
                        <polygon points="0,20 100,0 100,10 0,30" fill="#f6f2e9" stroke="#000" strokeWidth="2" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Bottom Label */}
                <div className="font-bold text-slate-900 text-xs sm:text-sm mt-2 text-center tracking-tight whitespace-nowrap">
                  General Purpose
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Academic Breakdown & Deep Technical Inspector */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Card 1: Slide 13 Exact Lecture Blueprint */}
          <div className="bg-white p-5 rounded-2xl border-2 border-amber-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Lecture Slide
                </span>
                <span className="text-sm font-mono font-extrabold text-amber-700">
                  Slide 13 of 50
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-black text-slate-800 tracking-wide block">
                  Total RAM
                </span>
                <span className="text-lg font-mono font-black text-amber-600">
                  128 Bytes
                </span>
              </div>
            </div>

            <h3 className="text-base font-display font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-600" />
              8051 Internal RAM Memory Layout (00H–7FH)
            </h3>

            {/* Arithmetic Formula Pill */}
            <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200 text-xs font-mono text-slate-800 space-y-1">
              <div className="font-bold text-amber-900">
                128 Bytes Total Memory Partition:
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-amber-200/60">
                <span>Working Registers:</span>
                <span className="font-bold text-blue-700">32 Bytes (00H–1FH)</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span>Bit Addressable RAM:</span>
                <span className="font-bold text-amber-700">16 Bytes (20H–2FH)</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span>General Purpose (Scratchpad):</span>
                <span className="font-bold text-emerald-700">80 Bytes (30H–7FH)</span>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-amber-300 font-extrabold text-slate-900">
                <span>Total On-Chip RAM:</span>
                <span>32 + 16 + 80 = 128 Bytes</span>
              </div>
            </div>
          </div>

          {/* Dynamic Inspector Based on Selected Section */}
          {selectedSection === 'working' && (
            <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Working Registers (32 Bytes • 00H–1FH)
                </span>
                <span className="text-[10px] font-mono bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200 font-bold">
                  Bank {selectedBank} Selected
                </span>
              </div>

              {/* Bank selector pills */}
              <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-xs">
                {([0, 1, 2, 3] as const).map((b) => (
                  <button
                    key={b}
                    onClick={() => {
                      setSelectedBank(b);
                      setSelectedRegister({
                        bank: b,
                        reg: 'R0',
                        addr: b === 0 ? '00H' : b === 1 ? '08H' : b === 2 ? '10H' : '18H',
                      });
                    }}
                    className={`py-1.5 rounded-lg border font-bold cursor-pointer transition-all ${
                      selectedBank === b
                        ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-blue-50'
                    }`}
                  >
                    Bank {b}
                  </button>
                ))}
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-semibold">Active Register Address:</span>
                  <span className="font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {selectedRegister?.reg} @ {selectedRegister?.addr}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-semibold">PSW Bank Select Bits:</span>
                  <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                    RS1 = {selectedBank >= 2 ? '1' : '0'}, RS0 = {selectedBank % 2 === 1 ? '1' : '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-semibold">Address Range:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {selectedBank === 0 ? '00H to 07H' : selectedBank === 1 ? '08H to 0FH' : selectedBank === 2 ? '10H to 17H' : '18H to 1FH'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                  Key Examination Rules:
                </span>
                <p>
                  • <strong>Default Bank:</strong> Upon hardware reset, <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-blue-700">RS1=0</code> and <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-blue-700">RS0=0</code> in PSW, activating <strong>Bank 0</strong> by default.
                </p>
                <p>
                  • <strong>Bank Switching:</strong> Software changes active registers via <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-blue-700">SETB PSW.3</code> or <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-blue-700">MOV PSW, #08H</code>.
                </p>
                <p>
                  • <strong>Stack Pointer Hazard:</strong> The Stack Pointer (SP) initializes to <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-blue-700">07H</code> at reset, meaning the very first PUSH writes to <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-blue-700">08H</code> (Bank 1 R0)!
                </p>
              </div>
            </div>
          )}

          {selectedSection === 'bit' && (
            <div className="bg-white p-5 rounded-2xl border border-amber-300 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Bit Addressable RAM (16 Bytes • 20H–2FH)
                </span>
                <span className="text-[10px] font-mono bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 font-bold">
                  Row {bitRows[selectedBitRow].byteHex}H Selected
                </span>
              </div>

              {/* Bit Breakdown for the selected byte */}
              <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200 space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-sans font-semibold">Byte Address:</span>
                  <span className="font-bold text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-200">
                    {bitRows[selectedBitRow].byteHex}H (1 Byte = 8 Bits)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-sans font-semibold">Bit Range:</span>
                  <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-amber-200">
                    Bit {bitRows[selectedBitRow].endBit}H to Bit {bitRows[selectedBitRow].startBit}H
                  </span>
                </div>

                {/* 8 individual bits visualizer */}
                <div className="pt-2 border-t border-amber-200/70">
                  <span className="text-[10px] font-sans text-slate-500 font-semibold block mb-1">
                    Individual 8 Bit Addresses in this byte:
                  </span>
                  <div className="grid grid-cols-8 gap-1 text-center font-mono">
                    {[7, 6, 5, 4, 3, 2, 1, 0].map((bitIdx) => {
                      const bitAddrInt = parseInt(bitRows[selectedBitRow].endBit, 16) + bitIdx;
                      const bitAddrHex = bitAddrInt.toString(16).toUpperCase().padStart(2, '0');
                      return (
                        <div
                          key={bitIdx}
                          className="bg-white p-1 rounded border border-amber-300 text-[10px] flex flex-col items-center"
                        >
                          <span className="text-[8px] text-slate-400">b{bitIdx}</span>
                          <span className="font-bold text-amber-800">{bitAddrHex}H</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                  Boolean Bit Instructions:
                </span>
                <p>
                  • Set bit: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-amber-800">SETB {bitRows[selectedBitRow].startBit}H</code>
                </p>
                <p>
                  • Clear bit: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-amber-800">CLR {bitRows[selectedBitRow].endBit}H</code>
                </p>
                <p>
                  • Conditional jump: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-amber-800">JB {bitRows[selectedBitRow].startBit}H, TARGET</code>
                </p>
              </div>
            </div>
          )}

          {selectedSection === 'general' && (
            <div className="bg-white p-5 rounded-2xl border border-emerald-300 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  General Purpose Scratchpad RAM (80 Bytes)
                </span>
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                  30H to 7FH
                </span>
              </div>

              <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-semibold">Capacity:</span>
                  <span className="font-mono font-bold text-emerald-800">80 Bytes (Scratchpad)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-semibold">Address Bounds:</span>
                  <span className="font-mono font-bold text-slate-800">30H (Bottom) to 7FH (Top)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-semibold">Recommended Stack Pointer:</span>
                  <span className="font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                    MOV SP, #2FH (or #30H)
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                  Stack Pointer Engineering Best Practice:
                </span>
                <p>
                  Because the default reset Stack Pointer value is <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-indigo-700">07H</code>, subroutines (CALL / RET) and interrupt pushes will overwrite Working Register Banks 1, 2, 3 and the Bit Addressable memory.
                </p>
                <p className="bg-amber-50 p-2 rounded-lg border border-amber-200 text-amber-900 font-semibold">
                  Standard industry initialization code always reallocates the stack into General Purpose RAM:
                  <code className="block mt-1 font-mono text-indigo-700 font-bold">MOV SP, #2FH ; First push lands cleanly at 30H</code>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )}
</div>
  );
}
