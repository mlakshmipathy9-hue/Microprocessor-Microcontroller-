import React, { useState } from 'react';
import { 
  Layers, 
  Cpu, 
  Database, 
  CheckCircle2, 
  ArrowRight, 
  Binary, 
  Sliders, 
  Zap, 
  Activity, 
  Info,
  Radio,
  FileSpreadsheet,
  CircuitBoard,
  HelpCircle,
  FolderLock
} from 'lucide-react';
import RAMROMSchematicDiagram from './RAMROMSchematicDiagram';

const Overline = ({ children }: { children: React.ReactNode }) => (
  <span className="overline decoration-current inline-block font-bold" style={{ textDecoration: 'overline' }}>
    {children}
  </span>
);

export default function RAMROMInterfacingDesign() {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [testAddressHex, setTestAddressHex] = useState<string>('FFFF0');
  const [accessMode, setAccessMode] = useState<'byte' | 'word'>('word');
  const [opMode, setOpMode] = useState<'read' | 'write'>('read');

  // Compute test address values
  const addrVal = parseInt(testAddressHex || '0', 16);
  const clampedAddr = isNaN(addrVal) ? 0 : addrVal;
  
  const isRAM = clampedAddr >= 0x00000 && clampedAddr <= 0x07FFF;
  const isROM = clampedAddr >= 0xF8000 && clampedAddr <= 0xFFFFF;
  const isEven = (clampedAddr % 2) === 0;

  // Signal calculations
  const a0 = isEven ? 0 : 1;
  const bhe = (accessMode === 'word' || !isEven) ? 0 : 1;
  
  // Decoding address lines A15..A19
  const a19 = (clampedAddr >> 19) & 1;
  const a18 = (clampedAddr >> 18) & 1;
  const a17 = (clampedAddr >> 17) & 1;
  const a16 = (clampedAddr >> 16) & 1;
  const a15 = (clampedAddr >> 15) & 1;

  // Chip Select logic
  const csRamBar = isRAM ? 0 : 1;
  const csRomBar = isROM ? 0 : 1;

  // Chip Enables via OR Gates
  const ceRam1Bar = (csRamBar === 0 && a0 === 0) ? 0 : 1;
  const ceRam2Bar = (csRamBar === 0 && bhe === 0) ? 0 : 1;
  const ceRom1Bar = (csRomBar === 0 && a0 === 0) ? 0 : 1;
  const ceRom2Bar = (csRomBar === 0 && bhe === 0) ? 0 : 1;

  const rdBar = opMode === 'read' ? 0 : 1;
  const wrBar = opMode === 'write' ? 0 : 1;

  return (
    <div className="bg-white text-slate-800 p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs font-sans">
      {/* Question / Design Problem Statement Banner */}
      <div className="bg-gradient-to-r from-indigo-50 via-emerald-50 to-amber-50 text-slate-800 p-4 rounded-xl border border-indigo-200 shadow-2xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="px-2.5 py-0.5 bg-indigo-100 border border-indigo-300 text-indigo-800 rounded-full font-bold uppercase tracking-wider text-[10px]">
            Design Problem 2 • Complete RAM + ROM System Interfacing
          </span>
          <span className="text-[11px] font-mono text-indigo-900 font-bold">
            Target MPU: Intel 8086 • RAM: 00000H–07FFFH • ROM: F8000H–FFFFFH
          </span>
        </div>
        <h2 className="text-sm md:text-base font-bold text-indigo-950 leading-snug">
          Q. 2: Interface 32 KB of RAM memory (00000H–07FFFH) and 32 KB of ROM/EPROM (F8000H–FFFFFH) to the 8086 microprocessor using 16 KB memory ICs.
        </h2>
        <p className="text-[11px] text-slate-700 leading-relaxed">
          Systematic step-by-step design procedure: Total memory budgeting, dual-bank splitting (2× RAM + 2× ROM chips), 20-bit address bus line allocation, dual address decoding truth tables, 4-way OR gating, and complete 8086 bus circuit schematic with live animated simulation.
        </p>
      </div>

      {/* 6-Step Process Interactive Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
        {[
          { step: 1, title: 'Step 1: Bank Division', desc: '2× RAM + 2× ROM ICs' },
          { step: 2, title: 'Step 2: Address Lines', desc: 'A1–A14, A0, BHE, A15–A19' },
          { step: 3, title: 'Step 3: Decoding Table', desc: 'Dual Binary Truth Map' },
          { step: 4, title: 'Step 4: Chip Select Logic', desc: 'Decoders & 4× OR Gates' },
          { step: 5, title: 'Step 5: Architecture', desc: 'System Block Diagram' },
          { step: 6, title: 'Step 6: Schematic Circuit', desc: 'Full 8086 Wiring 📐' },
        ].map((item) => {
          const isSelected = activeStep === item.step;
          return (
            <button
              key={item.step}
              onClick={() => setActiveStep(item.step as any)}
              className={`p-2 rounded-lg text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/70'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span>{item.title}</span>
                <span className={`text-[9px] px-1 rounded ${isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  #{item.step}
                </span>
              </div>
              <p className={`text-[10px] truncate ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                {item.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: MEMORY CAPACITY & BANK DIVISION */}
      {/* ========================================================================= */}
      {activeStep === 1 && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Mathematical Derivation Box */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5 shadow-2xs">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                  <Database className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Step 1: Memory Budgeting &amp; IC Count</h4>
                  <p className="text-[10px] text-slate-500">16-Bit Bus Organization for RAM and ROM</p>
                </div>
              </div>

              <div className="space-y-2 font-mono text-[11px] bg-white p-3 rounded-lg border border-slate-200">
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-600">Total System Memory to Interface</span>
                  <span className="font-bold text-indigo-700">= 64 KB (32 KB RAM + 32 KB ROM)</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-600">8086 Data Bus Width</span>
                  <span className="font-bold text-slate-800">= 16 Bits (D0–D15)</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-emerald-700 font-bold">RAM Bank Partition (32 KB / 2)</span>
                  <span className="font-bold text-emerald-800">= 2 ICs of 16 KB SRAM (62128)</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-amber-700 font-bold">ROM Bank Partition (32 KB / 2)</span>
                  <span className="font-bold text-amber-800">= 2 ICs of 16 KB EPROM (27128)</span>
                </div>
                <div className="flex justify-between text-indigo-900 font-bold pt-1">
                  <span>Total Memory ICs Required</span>
                  <span>= 4 Chips (2× RAM + 2× ROM)</span>
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed text-[11px]">
                Because the 8086 has a 16-bit external data bus, both RAM and ROM must be partitioned into <strong>Even Banks (D0–D7)</strong> and <strong>Odd Banks (D8–D15)</strong> to enable 16-bit word transfers and byte operations.
              </p>
            </div>

            {/* 4-Chip Allocation Table */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5 shadow-2xs">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                  <Layers className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">4-Chip System Allocation Matrix</h4>
                  <p className="text-[10px] text-slate-500">RAM 1, RAM 2, ROM 1, and ROM 2</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-[10.5px] border border-slate-200 rounded-lg overflow-hidden bg-white">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="p-1.5 text-left border-b border-slate-200">Chip Label</th>
                      <th className="p-1.5 text-left border-b border-slate-200">Memory Type</th>
                      <th className="p-1.5 text-left border-b border-slate-200">Data Bus</th>
                      <th className="p-1.5 text-left border-b border-slate-200">Bank Select</th>
                      <th className="p-1.5 text-left border-b border-slate-200">Address Range</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    <tr className="bg-emerald-50/40">
                      <td className="p-1.5 font-bold text-emerald-800 font-sans">RAM 1 (Even)</td>
                      <td className="p-1.5 text-slate-700">16 KB SRAM</td>
                      <td className="p-1.5 font-bold text-emerald-700">D0–D7</td>
                      <td className="p-1.5 text-slate-900">A0 = 0</td>
                      <td className="p-1.5 text-slate-600">00000H–07FFEH (Even)</td>
                    </tr>
                    <tr className="bg-emerald-50/40">
                      <td className="p-1.5 font-bold text-emerald-800 font-sans">RAM 2 (Odd)</td>
                      <td className="p-1.5 text-slate-700">16 KB SRAM</td>
                      <td className="p-1.5 font-bold text-emerald-700">D8–D15</td>
                      <td className="p-1.5 text-slate-900"><Overline>BHE</Overline> = 0</td>
                      <td className="p-1.5 text-slate-600">00001H–07FFFH (Odd)</td>
                    </tr>
                    <tr className="bg-amber-50/40">
                      <td className="p-1.5 font-bold text-amber-800 font-sans">ROM 1 (Even)</td>
                      <td className="p-1.5 text-slate-700">16 KB EPROM</td>
                      <td className="p-1.5 font-bold text-amber-700">D0–D7</td>
                      <td className="p-1.5 text-slate-900">A0 = 0</td>
                      <td className="p-1.5 text-slate-600">F8000H–FFFFEH (Even)</td>
                    </tr>
                    <tr className="bg-amber-50/40">
                      <td className="p-1.5 font-bold text-amber-800 font-sans">ROM 2 (Odd)</td>
                      <td className="p-1.5 text-slate-700">16 KB EPROM</td>
                      <td className="p-1.5 font-bold text-amber-700">D8–D15</td>
                      <td className="p-1.5 text-slate-900"><Overline>BHE</Overline> = 0</td>
                      <td className="p-1.5 text-slate-600">F8001H–FFFFFH (Odd)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-2 bg-indigo-50 rounded-lg border border-indigo-100 text-[10.5px] text-indigo-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Golden Placement Rule</strong>: RAM is at <code>00000H</code> for IVT (00000H–003FFH) and Stack. ROM is at <code>FFFFFH</code> for Power-On Reset (<code>FFFF0H</code>).
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: ADDRESS LINES CALCULATION */}
      {/* ========================================================================= */}
      {activeStep === 2 && (
        <div className="space-y-3">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                <Binary className="w-4 h-4" />
              </span>
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Step 2: Number of Address Lines Required</h4>
                <p className="text-[10px] text-slate-500">Address line budget breakdown from 20-bit 8086 system bus</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-[11px]">
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase">1. Individual 16 KB Chip</span>
                <p className="text-slate-800 font-bold text-sm">16 KB = 2^14 Bytes</p>
                <div className="text-slate-600 text-[10px] space-y-0.5 pt-1 border-t border-slate-100">
                  <div>• Address pins on chip = <strong>14 lines</strong></div>
                  <div>• Memory pins: <strong>A0 to A13</strong></div>
                  <div>• Wired to 8086: <strong className="text-indigo-600">A1 to A14</strong> (Shifted by 1)</div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase">2. Bank Enable Selection</span>
                <p className="text-slate-800 font-bold text-sm">A0 &amp; BHE# Strobes</p>
                <div className="text-slate-600 text-[10px] space-y-0.5 pt-1 border-t border-slate-100">
                  <div>• <strong className="text-emerald-600">A0 = 0</strong>: Selects Even Banks (RAM1 / ROM1)</div>
                  <div>• <strong className="text-amber-600"><Overline>BHE</Overline> = 0</strong>: Selects Odd Banks (RAM2 / ROM2)</div>
                  <div>• Both 0: Aligned 16-Bit Word Access</div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase">3. High Decoding Lines</span>
                <p className="text-slate-800 font-bold text-sm">20 - 15 = 5 High Lines</p>
                <div className="text-slate-600 text-[10px] space-y-0.5 pt-1 border-t border-slate-100">
                  <div>• Unused high lines = <strong>5 lines</strong></div>
                  <div>• Address lines: <strong className="text-purple-600">A15, A16, A17, A18, A19</strong></div>
                  <div>• Decoded for <Overline>CS_RAM</Overline> &amp; <Overline>CS_ROM</Overline></div>
                </div>
              </div>
            </div>

            {/* Visual Bus Routing Diagram */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                20-Bit 8086 Address Bus Pin Allocation Diagram
              </span>
              <div className="grid grid-cols-20 gap-0.5 text-center font-mono text-[9px]">
                {/* A19..A15 */}
                {['A19', 'A18', 'A17', 'A16', 'A15'].map((bit) => (
                  <div key={bit} className="col-span-1 bg-purple-100 border border-purple-300 text-purple-900 py-1.5 rounded-xs font-bold">
                    {bit}
                  </div>
                ))}
                {/* A14..A1 */}
                {['A14', 'A13', 'A12', 'A11', 'A10', 'A9', 'A8', 'A7', 'A6', 'A5', 'A4', 'A3', 'A2', 'A1'].map((bit) => (
                  <div key={bit} className="col-span-1 bg-indigo-100 border border-indigo-300 text-indigo-900 py-1.5 rounded-xs font-bold">
                    {bit}
                  </div>
                ))}
                {/* A0 */}
                <div className="col-span-1 bg-emerald-100 border border-emerald-300 text-emerald-900 py-1.5 rounded-xs font-bold">
                  A0
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[10px] pt-1">
                <div className="flex items-center gap-1.5 text-purple-900 font-medium">
                  <span className="w-3 h-3 bg-purple-200 border border-purple-400 rounded-xs inline-block"></span>
                  <span><strong>A19–A15 (5 Lines)</strong>: Decoders (00000b=RAM, 11111b=ROM)</span>
                </div>
                <div className="flex items-center gap-1.5 text-indigo-900 font-medium">
                  <span className="w-3 h-3 bg-indigo-200 border border-indigo-400 rounded-xs inline-block"></span>
                  <span><strong>A14–A1 (14 Lines)</strong>: Connected to Chip Address Pins A0–A13</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-900 font-medium">
                  <span className="w-3 h-3 bg-emerald-200 border border-emerald-400 rounded-xs inline-block"></span>
                  <span><strong>A0 (1 Line) + <Overline>BHE</Overline></strong>: Bank Select OR Gates</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: DUAL BINARY DECODING TABLE */}
      {/* ========================================================================= */}
      {activeStep === 3 && (
        <div className="space-y-3">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                  <FileSpreadsheet className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Step 3: Dual-Memory Binary Decoding Table</h4>
                  <p className="text-[10px] text-slate-500">20-bit address decoding for 32 KB RAM (00000H–07FFFH) &amp; 32 KB ROM (F8000H–FFFFFH)</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-600">Test Address:</span>
                <input
                  type="text"
                  maxLength={5}
                  value={testAddressHex}
                  onChange={(e) => setTestAddressHex(e.target.value.toUpperCase())}
                  placeholder="FFFF0"
                  className="w-20 px-2 py-1 bg-white border border-slate-300 rounded font-mono text-center font-bold text-xs focus:ring-1 focus:ring-indigo-500"
                />
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${isRAM ? 'bg-emerald-100 text-emerald-800' : isROM ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                  {isRAM ? 'VALID 32KB RAM' : isROM ? 'VALID 32KB ROM (BOOT)' : 'UNMAPPED / HIGH-Z'}
                </span>
              </div>
            </div>

            {/* Binary Truth Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-[10px] font-mono border border-slate-200 bg-white rounded-lg text-center">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold">
                    <th className="p-1.5 border-b border-r border-slate-200 text-left font-sans">Memory Device</th>
                    <th className="p-1.5 border-b border-r border-slate-200 font-sans">Hex Addr</th>
                    <th colSpan={5} className="p-1.5 border-b border-r border-slate-200 bg-purple-50 text-purple-900">
                      Decoder Lines (A19 – A15)
                    </th>
                    <th colSpan={14} className="p-1.5 border-b border-r border-slate-200 bg-indigo-50 text-indigo-900">
                      Chip Address Inputs (A14 – A1)
                    </th>
                    <th colSpan={2} className="p-1.5 border-b border-slate-200 bg-emerald-50 text-emerald-900">
                      Bank Pins
                    </th>
                  </tr>
                  <tr className="bg-slate-50 text-[9px] text-slate-600 border-b border-slate-200">
                    <th className="p-1 border-r border-slate-200"></th>
                    <th className="p-1 border-r border-slate-200"></th>
                    {['A19', 'A18', 'A17', 'A16', 'A15'].map(b => (
                      <th key={b} className="p-1 bg-purple-50/70 text-purple-950 font-bold">{b}</th>
                    ))}
                    {['A14', 'A13', 'A12', 'A11', 'A10', 'A9', 'A8', 'A7', 'A6', 'A5', 'A4', 'A3', 'A2', 'A1'].map(b => (
                      <th key={b} className="p-1 bg-indigo-50/70 text-indigo-950 font-bold">{b}</th>
                    ))}
                    <th className="p-1 bg-emerald-50/70 text-emerald-950 font-bold">A0</th>
                    <th className="p-1 bg-emerald-50/70 text-emerald-950 font-bold"><Overline>BHE</Overline></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[10px]">
                  {/* RAM Start */}
                  <tr className="bg-emerald-50/30">
                    <td className="p-1.5 text-left font-sans font-bold text-emerald-900 border-r border-slate-200">
                      RAM Start (Min)
                    </td>
                    <td className="p-1.5 font-bold text-emerald-700 border-r border-slate-200">00000H</td>
                    <td className="p-1 font-bold">0</td>
                    <td className="p-1 font-bold">0</td>
                    <td className="p-1 font-bold">0</td>
                    <td className="p-1 font-bold">0</td>
                    <td className="p-1 font-bold border-r border-slate-200">0</td>
                    {Array.from({ length: 14 }).map((_, i) => (
                      <td key={i} className={`p-1 ${i === 13 ? 'border-r border-slate-200' : ''}`}>0</td>
                    ))}
                    <td className="p-1 font-bold">0</td>
                    <td className="p-1 font-bold">0</td>
                  </tr>

                  {/* RAM End */}
                  <tr className="bg-emerald-50/30">
                    <td className="p-1.5 text-left font-sans font-bold text-emerald-900 border-r border-slate-200">
                      RAM End (Max)
                    </td>
                    <td className="p-1.5 font-bold text-emerald-700 border-r border-slate-200">07FFFH</td>
                    <td className="p-1 font-bold">0</td>
                    <td className="p-1 font-bold">0</td>
                    <td className="p-1 font-bold">0</td>
                    <td className="p-1 font-bold">0</td>
                    <td className="p-1 font-bold border-r border-slate-200">0</td>
                    {Array.from({ length: 14 }).map((_, i) => (
                      <td key={i} className={`p-1 font-bold ${i === 13 ? 'border-r border-slate-200' : ''}`}>1</td>
                    ))}
                    <td className="p-1 font-bold">1</td>
                    <td className="p-1 font-bold">0</td>
                  </tr>

                  {/* ROM Start */}
                  <tr className="bg-amber-50/30">
                    <td className="p-1.5 text-left font-sans font-bold text-amber-900 border-r border-slate-200">
                      ROM Start (Min)
                    </td>
                    <td className="p-1.5 font-bold text-amber-700 border-r border-slate-200">F8000H</td>
                    <td className="p-1 font-bold">1</td>
                    <td className="p-1 font-bold">1</td>
                    <td className="p-1 font-bold">1</td>
                    <td className="p-1 font-bold">1</td>
                    <td className="p-1 font-bold border-r border-slate-200">1</td>
                    {Array.from({ length: 14 }).map((_, i) => (
                      <td key={i} className={`p-1 ${i === 13 ? 'border-r border-slate-200' : ''}`}>0</td>
                    ))}
                    <td className="p-1 font-bold">0</td>
                    <td className="p-1 font-bold">0</td>
                  </tr>

                  {/* ROM Reset Vector */}
                  <tr className="bg-amber-100/60 font-bold">
                    <td className="p-1.5 text-left font-sans text-amber-950 border-r border-slate-200">
                      ROM Reset Vector (Boot)
                    </td>
                    <td className="p-1.5 text-amber-900 border-r border-slate-200">FFFF0H</td>
                    <td className="p-1 text-purple-900 font-bold">1</td>
                    <td className="p-1 text-purple-900 font-bold">1</td>
                    <td className="p-1 text-purple-900 font-bold">1</td>
                    <td className="p-1 text-purple-900 font-bold">1</td>
                    <td className="p-1 text-purple-900 font-bold border-r border-slate-200">1</td>
                    {Array.from({ length: 14 }).map((_, i) => {
                      const bitIndex = 14 - i;
                      const bitVal = (0xFFFF0 >> bitIndex) & 1;
                      return (
                        <td key={i} className={`p-1 text-indigo-900 ${i === 13 ? 'border-r border-slate-200' : ''}`}>
                          {bitVal}
                        </td>
                      );
                    })}
                    <td className="p-1 text-emerald-900">0</td>
                    <td className="p-1 text-emerald-900">0</td>
                  </tr>

                  {/* ROM End */}
                  <tr className="bg-amber-50/30">
                    <td className="p-1.5 text-left font-sans font-bold text-amber-900 border-r border-slate-200">
                      ROM End (Max)
                    </td>
                    <td className="p-1.5 font-bold text-amber-700 border-r border-slate-200">FFFFFH</td>
                    <td className="p-1 font-bold">1</td>
                    <td className="p-1 font-bold">1</td>
                    <td className="p-1 font-bold">1</td>
                    <td className="p-1 font-bold">1</td>
                    <td className="p-1 font-bold border-r border-slate-200">1</td>
                    {Array.from({ length: 14 }).map((_, i) => (
                      <td key={i} className={`p-1 font-bold ${i === 13 ? 'border-r border-slate-200' : ''}`}>1</td>
                    ))}
                    <td className="p-1 font-bold">1</td>
                    <td className="p-1 font-bold">0</td>
                  </tr>

                  {/* Live User Test Address */}
                  <tr className="bg-indigo-100/70 font-bold">
                    <td className="p-1.5 text-left font-sans text-indigo-950 border-r border-slate-200">
                      Live User Test Address
                    </td>
                    <td className="p-1.5 text-indigo-900 border-r border-slate-200">{testAddressHex.padStart(5, '0')}H</td>
                    <td className={`p-1 ${a19 === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>{a19}</td>
                    <td className={`p-1 ${a18 === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>{a18}</td>
                    <td className={`p-1 ${a17 === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>{a17}</td>
                    <td className={`p-1 ${a16 === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>{a16}</td>
                    <td className={`p-1 border-r border-slate-200 ${a15 === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>{a15}</td>
                    {Array.from({ length: 14 }).map((_, i) => {
                      const bitIndex = 14 - i;
                      const bitVal = (clampedAddr >> bitIndex) & 1;
                      return (
                        <td key={i} className={`p-1 text-indigo-800 ${i === 13 ? 'border-r border-slate-200' : ''}`}>
                          {bitVal}
                        </td>
                      );
                    })}
                    <td className="p-1 text-emerald-800">{a0}</td>
                    <td className="p-1 text-emerald-800">{bhe}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Test Status Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px] font-sans">
              <div className={`p-2 rounded-lg border ${csRamBar === 0 ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-100 text-slate-400'}`}>
                <div className="font-bold">CS_RAM#</div>
                <div className="font-mono">{csRamBar} ({csRamBar === 0 ? 'RAM SELECTED' : 'Inactive'})</div>
              </div>
              <div className={`p-2 rounded-lg border ${csRomBar === 0 ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-slate-100 text-slate-400'}`}>
                <div className="font-bold">CS_ROM#</div>
                <div className="font-mono">{csRomBar} ({csRomBar === 0 ? 'ROM SELECTED' : 'Inactive'})</div>
              </div>
              <div className={`p-2 rounded-lg border ${ceRam1Bar === 0 || ceRom1Bar === 0 ? 'bg-indigo-50 border-indigo-300 text-indigo-900' : 'bg-slate-100 text-slate-400'}`}>
                <div className="font-bold">Even Bank (D0–D7)</div>
                <div className="font-mono">A0={a0} ({a0 === 0 ? 'ENABLED' : 'Disabled'})</div>
              </div>
              <div className={`p-2 rounded-lg border ${ceRam2Bar === 0 || ceRom2Bar === 0 ? 'bg-indigo-50 border-indigo-300 text-indigo-900' : 'bg-slate-100 text-slate-400'}`}>
                <div className="font-bold">Odd Bank (D8–D15)</div>
                <div className="font-mono">BHE#={bhe} ({bhe === 0 ? 'ENABLED' : 'Disabled'})</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: DECODER & CHIP SELECT LOGIC */}
      {/* ========================================================================= */}
      {activeStep === 4 && (
        <div className="space-y-3">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                <CircuitBoard className="w-4 h-4" />
              </span>
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Step 4: Decoder &amp; Chip Select Logic Design</h4>
                <p className="text-[10px] text-slate-500">Hardware Boolean gating equations for Master CS# and 4× Bank CEs</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Master Chip Selects (NAND Decoders) */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-purple-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                  1. Master Chip Select Equations (74LS30 NAND / 74LS138)
                </span>
                
                <div className="p-2 bg-purple-50 rounded-lg border border-purple-200 font-mono text-[11px] text-purple-950 space-y-1.5">
                  <div className="font-bold text-emerald-800">
                    <Overline>CS_RAM</Overline> = <Overline>( <Overline>A19</Overline> • <Overline>A18</Overline> • <Overline>A17</Overline> • <Overline>A16</Overline> • <Overline>A15</Overline> • M/<Overline>IO</Overline> )</Overline>
                  </div>
                  <p className="text-[10px] text-slate-600 font-sans">
                    Asserts LOW (0) ONLY when A19..A15 = 00000b and M/IO# = 1 (Range: 00000H–07FFFH).
                  </p>

                  <div className="font-bold text-amber-800 pt-1 border-t border-purple-200/60">
                    <Overline>CS_ROM</Overline> = <Overline>( A19 • A18 • A17 • A16 • A15 • M/<Overline>IO</Overline> )</Overline>
                  </div>
                  <p className="text-[10px] text-slate-600 font-sans">
                    Asserts LOW (0) ONLY when A19..A15 = 11111b and M/IO# = 1 (Range: F8000H–FFFFFH).
                  </p>
                </div>
              </div>

              {/* 4 OR Gates (74LS32) for Bank Qualification */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  2. 4-Way Bank Enable Logic (74LS32 OR Gates)
                </span>

                <div className="grid grid-cols-2 gap-2 font-mono text-[10.5px]">
                  <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="font-bold text-emerald-900"><Overline>CE_RAM1</Overline> (Even RAM)</div>
                    <div className="text-emerald-700">= <Overline>CS_RAM</Overline> + A0</div>
                    <div className="text-[9px] text-slate-500 font-sans">D0–D7 Lower Byte</div>
                  </div>

                  <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="font-bold text-emerald-900"><Overline>CE_RAM2</Overline> (Odd RAM)</div>
                    <div className="text-emerald-700">= <Overline>CS_RAM</Overline> + <Overline>BHE</Overline></div>
                    <div className="text-[9px] text-slate-500 font-sans">D8–D15 Upper Byte</div>
                  </div>

                  <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="font-bold text-amber-900"><Overline>CE_ROM1</Overline> (Even ROM)</div>
                    <div className="text-amber-700">= <Overline>CS_ROM</Overline> + A0</div>
                    <div className="text-[9px] text-slate-500 font-sans">D0–D7 Lower Byte</div>
                  </div>

                  <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="font-bold text-amber-900"><Overline>CE_ROM2</Overline> (Odd ROM)</div>
                    <div className="text-amber-700">= <Overline>CS_ROM</Overline> + <Overline>BHE</Overline></div>
                    <div className="text-[9px] text-slate-500 font-sans">D8–D15 Upper Byte</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Read/Write Control Signal Connection Matrix */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-800">
                3. Bus Control Strobes Connection Matrix (RD# &amp; WR#)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-blue-50 rounded-lg border border-blue-200 space-y-1">
                  <div className="font-bold text-blue-900">8086 RD# (Pin 32) &rarr; Memory OE# Pins</div>
                  <p className="text-[10.5px] text-slate-600">
                    Connected to the Output Enable (<Overline>OE</Overline>) of <strong>ALL 4 Chips</strong> (RAM 1, RAM 2, ROM 1, ROM 2). Enables chip internal output buffers during read cycles.
                  </p>
                </div>

                <div className="p-2 bg-rose-50 rounded-lg border border-rose-200 space-y-1">
                  <div className="font-bold text-rose-900">8086 WR# (Pin 29) &rarr; RAM WE# Pins ONLY</div>
                  <p className="text-[10.5px] text-slate-600">
                    Connected to the Write Enable (<Overline>WE</Overline>) of <strong>RAM 1 &amp; RAM 2 ONLY</strong>. ROM chips have <strong>NO WE# pin</strong>, making writes physically impossible and protecting boot firmware!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 5: SYSTEM BLOCK DIAGRAM */}
      {/* ========================================================================= */}
      {activeStep === 5 && (
        <div className="space-y-3">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                <Layers className="w-4 h-4" />
              </span>
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Step 5: System Block Diagram &amp; Bus Hierarchy</h4>
                <p className="text-[10px] text-slate-500">Demultiplexing, decoding, buffering, and dual memory array interconnections</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 text-center font-sans text-xs">
              {/* Block 1 */}
              <div className="p-3 bg-indigo-50 text-indigo-950 rounded-xl border border-indigo-200 space-y-1.5 shadow-xs">
                <span className="text-[10px] font-bold text-indigo-600 uppercase">Stage 1</span>
                <h5 className="font-bold text-xs text-indigo-900">8086 MPU (Master)</h5>
                <p className="text-[10.5px] text-indigo-700 leading-relaxed">
                  Generates AD0–AD15, A16–A19, BHE#, ALE, M/IO#, RD#, WR#, DEN#, DT/R#.
                </p>
              </div>

              {/* Block 2 */}
              <div className="p-3 bg-blue-50 text-blue-950 rounded-xl border border-blue-200 space-y-1.5 shadow-xs">
                <span className="text-[10px] font-bold text-blue-600 uppercase">Stage 2</span>
                <h5 className="font-bold text-xs text-blue-900">3× 74LS373 Latches</h5>
                <p className="text-[10.5px] text-blue-700 leading-relaxed">
                  Latches on ALE falling edge to generate stable A0–A19 &amp; BHE# address lines.
                </p>
              </div>

              {/* Block 3 */}
              <div className="p-3 bg-purple-50 text-purple-950 rounded-xl border border-purple-200 space-y-1.5 shadow-xs">
                <span className="text-[10px] font-bold text-purple-600 uppercase">Stage 3</span>
                <h5 className="font-bold text-xs text-purple-900">Decoders &amp; OR Gates</h5>
                <p className="text-[10.5px] text-purple-700 leading-relaxed">
                  Decodes A15–A19 for CS_RAM# / CS_ROM# and gates with A0 / BHE# for 4× CEs.
                </p>
              </div>

              {/* Block 4 */}
              <div className="p-3 bg-emerald-50 text-emerald-950 rounded-xl border border-emerald-200 space-y-1.5 shadow-xs">
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Stage 4</span>
                <h5 className="font-bold text-xs text-emerald-900">4 Memory ICs + Buffers</h5>
                <p className="text-[10.5px] text-emerald-700 leading-relaxed">
                  2× 16 KB SRAM (00000H) + 2× 16 KB EPROM (F8000H) buffered by 2× 74LS245.
                </p>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-800">
                Key Differences Between RAM and ROM Interfacing:
              </span>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-700">
                <li className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-1.5">
                  <span className="font-bold text-indigo-700 shrink-0">• Write Line:</span>
                  <span>RAM chips connect to <code>WR#</code> via <code>WE#</code>. ROM chips have <strong>NO</strong> write connection.</span>
                </li>
                <li className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-1.5">
                  <span className="font-bold text-indigo-700 shrink-0">• Location:</span>
                  <span>RAM starts at <code>00000H</code> for IVT vectors. ROM ends at <code>FFFFFH</code> for boot code.</span>
                </li>
                <li className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-1.5">
                  <span className="font-bold text-indigo-700 shrink-0">• Transceiver DIR:</span>
                  <span>RAM reads and writes flip <code>DT/R#</code> (1 vs 0). ROM accesses strictly use receive (<code>DT/R# = 0</code>).</span>
                </li>
                <li className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-1.5">
                  <span className="font-bold text-indigo-700 shrink-0">• Speed &amp; Ready:</span>
                  <span>Slow EPROMs may pull the 8086 <code>READY</code> pin low to insert Wait States (Tw); fast SRAM runs at zero wait states.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 6: COMPLETE SCHEMATIC CIRCUIT & LIVE SIMULATOR */}
      {/* ========================================================================= */}
      {activeStep === 6 && (
        <div className="space-y-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-indigo-600 text-white rounded-lg">
                  <CircuitBoard className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Step 6: Complete 8086 RAM + ROM Circuit Schematic &amp; Live Simulator</h4>
                  <p className="text-[10px] text-slate-500">Interactive live schematic showing 8086 MPU, 3× Latches, Decoders, 4× OR Gates, 2× Transceivers, and 4 Memory ICs</p>
                </div>
              </div>
            </div>

            {/* Mount Live Schematic Simulator */}
            <RAMROMSchematicDiagram initialScenario="ram-word-write" />
          </div>
        </div>
      )}
    </div>
  );
}
