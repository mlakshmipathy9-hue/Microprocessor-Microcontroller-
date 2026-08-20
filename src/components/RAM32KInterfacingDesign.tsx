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
  CircuitBoard
} from 'lucide-react';
import MemorySchematicDiagram from './MemorySchematicDiagram';

const Overline = ({ children }: { children: React.ReactNode }) => (
  <span className="overline decoration-current inline-block font-bold" style={{ textDecoration: 'overline' }}>
    {children}
  </span>
);

export default function RAM32KInterfacingDesign() {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [testAddressHex, setTestAddressHex] = useState<string>('00100');
  const [accessMode, setAccessMode] = useState<'byte' | 'word'>('word');
  const [opMode, setOpMode] = useState<'read' | 'write'>('write');

  // Compute test address values
  const addrVal = parseInt(testAddressHex || '0', 16);
  const clampedAddr = isNaN(addrVal) ? 0 : addrVal;
  const isWithin32K = clampedAddr >= 0x00000 && clampedAddr <= 0x07FFF;
  const isEven = (clampedAddr % 2) === 0;

  // Signal calculations for 32 KB RAM interfacing with absolute decoding
  const a0 = isEven ? 0 : 1;
  const bhe = (accessMode === 'word' || !isEven) ? 0 : 1;
  
  // Decoding address lines A15..A19
  const a19 = (clampedAddr >> 19) & 1;
  const a18 = (clampedAddr >> 18) & 1;
  const a17 = (clampedAddr >> 17) & 1;
  const a16 = (clampedAddr >> 16) & 1;
  const a15 = (clampedAddr >> 15) & 1;

  // Absolute Decoding logic: All A15..A19 must be 0 for range 00000H - 07FFFH
  const isCsAsserted = isWithin32K; // CS# = 0 (Active LOW)
  const csBar = isCsAsserted ? 0 : 1;

  // Chip Enable for Even Bank (RAM_1) = CS# OR A0
  const ce1Bar = (csBar === 0 && a0 === 0) ? 0 : 1; // Active LOW when 0
  // Chip Enable for Odd Bank (RAM_2) = CS# OR BHE#
  const ce2Bar = (csBar === 0 && bhe === 0) ? 0 : 1; // Active LOW when 0

  const rdBar = opMode === 'read' ? 0 : 1;
  const wrBar = opMode === 'write' ? 0 : 1;

  return (
    <div className="bg-white text-slate-800 p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs font-sans">
      {/* Question / Design Problem Statement Banner */}
      <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-100/70 text-slate-800 p-4 rounded-xl border border-indigo-200 shadow-2xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="px-2.5 py-0.5 bg-indigo-100 border border-indigo-300 text-indigo-800 rounded-full font-bold uppercase tracking-wider text-[10px]">
            Design Problem 1 • University & Lab Examination Standard
          </span>
          <span className="text-[11px] font-mono text-indigo-900 font-bold">
            Target MPU: Intel 8086 • Address Range: 00000H – 07FFFH
          </span>
        </div>
        <h2 className="text-sm md:text-base font-bold text-indigo-950 leading-snug">
          Q. 1: Interface 32 KB of RAM memory to the 8086 microprocessor system using absolute decoding with the suitable address.
        </h2>
        <p className="text-[11px] text-slate-700 leading-relaxed">
          Systematic step-by-step hardware design breakdown: Memory bank division, address line budgeting, binary decoding table, absolute NAND gate decoding logic, and complete 8086 bus interfacing schematic.
        </p>
      </div>

      {/* 6-Step Process Interactive Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
        {[
          { step: 1, title: 'Step 1: Bank Division', desc: 'Capacity & ICs' },
          { step: 2, title: 'Step 2: Address Lines', desc: 'A0–A14 & Decoders' },
          { step: 3, title: 'Step 3: Decoding Table', desc: '20-Bit Binary Map' },
          { step: 4, title: 'Step 4: Chip Select Logic', desc: 'Absolute NAND/OR' },
          { step: 5, title: 'Step 5: Architecture', desc: 'Block Diagram' },
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

      {/* STEP 1: TOTAL RAM MEMORY & BANK DIVISION */}
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
                  <h4 className="font-bold text-slate-900 text-xs">Step 1: Memory Capacity & IC Calculation</h4>
                  <p className="text-[10px] text-slate-500">16-Bit Data Bus Splitting & IC Requirements</p>
                </div>
              </div>

              <div className="space-y-2 font-mono text-[11px] bg-white p-3 rounded-lg border border-slate-200">
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-600">Total RAM Memory required</span>
                  <span className="font-bold text-indigo-700">= 32 KB</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-600">8086 Data Bus Width</span>
                  <span className="font-bold text-slate-800">= 16 Bits (D0–D15)</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-600">Half RAM Capacity per Bank</span>
                  <span className="font-bold text-slate-800">= 32 KB / 2 = 16 KB</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-600">Selected RAM IC Size</span>
                  <span className="font-bold text-slate-800">= 16 KB (16K x 8 SRAM)</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold pt-1">
                  <span>Number of RAM ICs required</span>
                  <span>= 2 ICs of 16 KB</span>
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed text-[11px]">
                Because the 8086 microprocessor has a 16-bit external data bus, any memory space must be partitioned into two 8-bit banks to allow simultaneous 16-bit word transfers as well as independent 8-bit byte reads/writes.
              </p>
            </div>

            {/* Bank Partition Table */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5 shadow-2xs">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                  <Layers className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Even Bank & Odd Bank Distribution</h4>
                  <p className="text-[10px] text-slate-500">Hardware Allocation of 2 x 16 KB SRAM ICs</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-[11px] border border-slate-200 rounded-lg overflow-hidden bg-white">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="p-2 text-left border-b border-slate-200">Parameter</th>
                      <th className="p-2 text-left border-b border-slate-200 bg-indigo-50/50 text-indigo-900">Even Bank (RAM_1)</th>
                      <th className="p-2 text-left border-b border-slate-200 bg-amber-50/50 text-amber-900">Odd Bank (RAM_2)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2 font-medium text-slate-600">Chip Label</td>
                      <td className="p-2 font-bold text-indigo-700 font-mono">RAM_1</td>
                      <td className="p-2 font-bold text-amber-700 font-mono">RAM_2</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium text-slate-600">Capacity</td>
                      <td className="p-2 font-mono">16 KB (16,384 Bytes)</td>
                      <td className="p-2 font-mono">16 KB (16,384 Bytes)</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium text-slate-600">Data Bus Pins</td>
                      <td className="p-2 font-bold text-indigo-700 font-mono">D0 – D7 (Lower Byte)</td>
                      <td className="p-2 font-bold text-amber-700 font-mono">D8 – D15 (Upper Byte)</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium text-slate-600">Bank Selection Pin</td>
                      <td className="p-2 font-bold font-mono text-slate-800">A0 = 0 (Low)</td>
                      <td className="p-2 font-bold font-mono text-slate-800"><Overline>BHE</Overline> = 0 (Low)</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium text-slate-600">Memory Range</td>
                      <td className="p-2 font-mono text-slate-600">00000H, 00002H, ... 07FFEH</td>
                      <td className="p-2 font-mono text-slate-600">00001H, 00003H, ... 07FFFH</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-2 bg-indigo-50 rounded-lg border border-indigo-100 text-[11px] text-indigo-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Even Bank</strong> holds all even-addressed bytes; <strong>Odd Bank</strong> holds all odd-addressed bytes. When accessing an aligned 16-bit word at an even address, both banks are activated together in <strong>1 single bus cycle</strong>!
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: CALCULATION OF ADDRESS LINES */}
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
                <span className="text-[10px] font-bold text-slate-500 uppercase">1. Individual RAM IC</span>
                <p className="text-slate-800 font-bold text-sm">16 KB = 2^14 Bytes</p>
                <div className="text-slate-600 text-[10px] space-y-0.5 pt-1 border-t border-slate-100">
                  <div>• Address lines on chip = <strong>14 lines</strong></div>
                  <div>• Memory pins: <strong>A0 to A13</strong></div>
                  <div>• Wired to 8086: <strong className="text-indigo-600">A1 to A14</strong></div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase">2. Total 32 KB Range</span>
                <p className="text-slate-800 font-bold text-sm">32 KB = 2^15 Bytes</p>
                <div className="text-slate-600 text-[10px] space-y-0.5 pt-1 border-t border-slate-100">
                  <div>• Total address lines = <strong>15 lines</strong></div>
                  <div>• Range spans: <strong className="text-indigo-600">A0 to A14</strong></div>
                  <div>• A0 &amp; <Overline>BHE</Overline> select Even/Odd bank</div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase">3. Chip Select Decoding</span>
                <p className="text-slate-800 font-bold text-sm">20 - 15 = 5 High Lines</p>
                <div className="text-slate-600 text-[10px] space-y-0.5 pt-1 border-t border-slate-100">
                  <div>• Unused high lines = <strong>5 lines</strong></div>
                  <div>• Address lines: <strong className="text-purple-600">A15, A16, A17, A18, A19</strong></div>
                  <div>• Decoded for absolute <Overline>CS</Overline> signal</div>
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
                  <span><strong>A19–A15 (5 Lines)</strong>: Absolute Decoder (All 0)</span>
                </div>
                <div className="flex items-center gap-1.5 text-indigo-900 font-medium">
                  <span className="w-3 h-3 bg-indigo-200 border border-indigo-400 rounded-xs inline-block"></span>
                  <span><strong>A14–A1 (14 Lines)</strong>: RAM Chips (A0–A13 pins)</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-900 font-medium">
                  <span className="w-3 h-3 bg-emerald-200 border border-emerald-400 rounded-xs inline-block"></span>
                  <span><strong>A0 (1 Line) + <Overline>BHE</Overline></strong>: Bank Enable Logic</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: ADDRESS DECODING TABLE */}
      {activeStep === 3 && (
        <div className="space-y-3">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                  <FileSpreadsheet className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Step 3: Binary Address Decoding Table</h4>
                  <p className="text-[10px] text-slate-500">Full 20-bit binary address mapping for 32 KB RAM (00000H – 07FFFH)</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-600">Test Address:</span>
                <input
                  type="text"
                  maxLength={5}
                  value={testAddressHex}
                  onChange={(e) => setTestAddressHex(e.target.value.toUpperCase())}
                  placeholder="00100"
                  className="w-20 px-2 py-1 bg-white border border-slate-300 rounded font-mono text-center font-bold text-xs focus:ring-1 focus:ring-indigo-500"
                />
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${isWithin32K ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                  {isWithin32K ? 'VALID 32KB RAM' : 'OUT OF RANGE'}
                </span>
              </div>
            </div>

            {/* Binary Address Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-[10px] font-mono border border-slate-200 bg-white rounded-lg text-center">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold">
                    <th className="p-1.5 border-b border-r border-slate-200 text-left font-sans">Memory Point</th>
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
                  {/* Start Address */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-1.5 text-left font-sans font-bold text-slate-800 border-r border-slate-200">
                      Starting Address (Min)
                    </td>
                    <td className="p-1.5 font-bold text-indigo-600 border-r border-slate-200">00000H</td>
                    <td className="p-1 bg-purple-50/30 font-bold">0</td>
                    <td className="p-1 bg-purple-50/30 font-bold">0</td>
                    <td className="p-1 bg-purple-50/30 font-bold">0</td>
                    <td className="p-1 bg-purple-50/30 font-bold">0</td>
                    <td className="p-1 bg-purple-50/30 font-bold border-r border-slate-200">0</td>
                    {Array.from({ length: 14 }).map((_, i) => (
                      <td key={i} className={`p-1 bg-indigo-50/20 ${i === 13 ? 'border-r border-slate-200' : ''}`}>0</td>
                    ))}
                    <td className="p-1 bg-emerald-50/30 font-bold">0</td>
                    <td className="p-1 bg-emerald-50/30 font-bold">0</td>
                  </tr>

                  {/* End Address */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-1.5 text-left font-sans font-bold text-slate-800 border-r border-slate-200">
                      Ending Address (Max)
                    </td>
                    <td className="p-1.5 font-bold text-indigo-600 border-r border-slate-200">07FFFH</td>
                    <td className="p-1 bg-purple-50/30 font-bold">0</td>
                    <td className="p-1 bg-purple-50/30 font-bold">0</td>
                    <td className="p-1 bg-purple-50/30 font-bold">0</td>
                    <td className="p-1 bg-purple-50/30 font-bold">0</td>
                    <td className="p-1 bg-purple-50/30 font-bold border-r border-slate-200">0</td>
                    {Array.from({ length: 14 }).map((_, i) => (
                      <td key={i} className={`p-1 bg-indigo-50/20 font-bold ${i === 13 ? 'border-r border-slate-200' : ''}`}>1</td>
                    ))}
                    <td className="p-1 bg-emerald-50/30 font-bold">1</td>
                    <td className="p-1 bg-emerald-50/30 font-bold">0</td>
                  </tr>

                  {/* Live User Test Address */}
                  <tr className="bg-amber-50/60 font-bold">
                    <td className="p-1.5 text-left font-sans text-amber-900 border-r border-slate-200">
                      Current Test Address
                    </td>
                    <td className="p-1.5 text-amber-900 border-r border-slate-200">{testAddressHex.padStart(5, '0')}H</td>
                    <td className={`p-1 ${a19 === 0 ? 'text-purple-700' : 'text-red-600'}`}>{a19}</td>
                    <td className={`p-1 ${a18 === 0 ? 'text-purple-700' : 'text-red-600'}`}>{a18}</td>
                    <td className={`p-1 ${a17 === 0 ? 'text-purple-700' : 'text-red-600'}`}>{a17}</td>
                    <td className={`p-1 ${a16 === 0 ? 'text-purple-700' : 'text-red-600'}`}>{a16}</td>
                    <td className={`p-1 border-r border-slate-200 ${a15 === 0 ? 'text-purple-700' : 'text-red-600'}`}>{a15}</td>
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

            {/* Test Status Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-sans">
              <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${isCsAsserted ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <div>
                  <div className="font-bold">Main Chip Select (<Overline>CS</Overline>)</div>
                  <div><Overline>CS</Overline> = {csBar} ({isCsAsserted ? 'ACTIVE LOW 0.0V' : 'INACTIVE HIGH 5.0V'})</div>
                </div>
              </div>

              <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${ce1Bar === 0 ? 'bg-indigo-50 border-indigo-200 text-indigo-900' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                <Database className="w-4 h-4 shrink-0" />
                <div>
                  <div className="font-bold">Even Bank RAM_1 (<Overline>CE1</Overline>)</div>
                  <div><Overline>CE1</Overline> = {ce1Bar} ({ce1Bar === 0 ? 'ENABLED (D0–D7)' : 'DISABLED'})</div>
                </div>
              </div>

              <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${ce2Bar === 0 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                <Database className="w-4 h-4 shrink-0" />
                <div>
                  <div className="font-bold">Odd Bank RAM_2 (<Overline>CE2</Overline>)</div>
                  <div><Overline>CE2</Overline> = {ce2Bar} ({ce2Bar === 0 ? 'ENABLED (D8–D15)' : 'DISABLED'})</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: GENERATION OF CHIP SELECT LOGIC */}
      {activeStep === 4 && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Logic Equation & Gate Breakdown */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5 shadow-2xs">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                  <Zap className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Step 4: Generation of Chip Select Logic</h4>
                  <p className="text-[10px] text-slate-500">Absolute Decoding Boolean Equations (Zero Foldback)</p>
                </div>
              </div>

              <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200 font-mono text-[11px]">
                <div className="text-slate-700">
                  <span className="text-[10px] font-bold text-purple-700 uppercase block font-sans">1. Main Chip Select Logic (<Overline>CS</Overline>)</span>
                  <div className="p-1.5 bg-slate-50 rounded border border-slate-100 font-bold text-slate-900 mt-1">
                    <Overline>CS</Overline> = NOT (NOT(A19) • NOT(A18) • NOT(A17) • NOT(A16) • NOT(A15) • M/<Overline>IO</Overline>)
                  </div>
                  <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                    Implemented using 5 inverters (74LS04) + 6-input NAND gate (74LS30) with M/<Overline>IO</Overline> connected to enable memory cycles only.
                  </p>
                </div>

                <div className="text-slate-700 pt-1 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase block font-sans">2. Even Bank Enable (<Overline>CE1</Overline> for RAM_1)</span>
                  <div className="p-1.5 bg-slate-50 rounded border border-slate-100 font-bold text-indigo-900 mt-1">
                    <Overline>CE1</Overline> = <Overline>CS</Overline> OR A0
                  </div>
                  <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                    Asserts LOW (0V) only when <Overline>CS</Overline> is 0 AND address is EVEN (A0 = 0).
                  </p>
                </div>

                <div className="text-slate-700 pt-1 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-amber-700 uppercase block font-sans">3. Odd Bank Enable (<Overline>CE2</Overline> for RAM_2)</span>
                  <div className="p-1.5 bg-slate-50 rounded border border-slate-100 font-bold text-amber-900 mt-1">
                    <Overline>CE2</Overline> = <Overline>CS</Overline> OR <Overline>BHE</Overline>
                  </div>
                  <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                    Asserts LOW (0V) only when <Overline>CS</Overline> is 0 AND odd byte / 16-bit word is accessed (<Overline>BHE</Overline> = 0).
                  </p>
                </div>
              </div>

              <div className="p-2 bg-purple-50 rounded-lg border border-purple-100 text-[11px] text-purple-900">
                <strong>Why Absolute Decoding?</strong> In absolute decoding, every single high address line (A15–A19) is decoded. This guarantees that 32 KB RAM occupies <em>strictly</em> 00000H–07FFFH without ghost/mirror addresses.
              </div>
            </div>

            {/* Interactive Logic Gates Diagram */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5 shadow-2xs">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <span className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
                  <Sliders className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Logic Gates Schematic Diagram</h4>
                  <p className="text-[10px] text-slate-500">74LS04 (NOT) • 74LS30 (NAND) • 74LS32 (OR)</p>
                </div>
              </div>

              {/* SVG Logic Diagram */}
              <div className="bg-white p-2 rounded-lg border border-slate-200 flex flex-col items-center justify-center">
                <svg viewBox="0 0 420 220" className="w-full h-auto max-h-[220px]">
                  {/* Background Grid */}
                  <defs>
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#f1f5f9" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="420" height="220" fill="url(#grid)" />

                  {/* Input Lines A19..A15 */}
                  <g className="font-mono text-[10px] font-bold" fill="#334155">
                    <text x="15" y="30">A19 (0)</text>
                    <text x="15" y="55">A18 (0)</text>
                    <text x="15" y="80">A17 (0)</text>
                    <text x="15" y="105">A16 (0)</text>
                    <text x="15" y="130">A15 (0)</text>
                    <text x="15" y="155">M/<tspan textDecoration="overline">IO</tspan> (1)</text>
                  </g>

                  {/* Inverter Triangles */}
                  {[25, 50, 75, 100, 125].map((y, idx) => (
                    <g key={idx}>
                      <line x1="60" y1={y} x2="80" y2={y} stroke="#64748b" strokeWidth="1.5" />
                      <polygon points={`80,${y-6} 95,${y} 80,${y+6}`} fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
                      <circle cx="98" cy={y} r="2.5" fill="white" stroke="#475569" strokeWidth="1.5" />
                      <line x1="101" y1={y} x2="140" y2={y} stroke="#64748b" strokeWidth="1.5" />
                    </g>
                  ))}
                  {/* Direct M/IO line */}
                  <line x1="75" y1="150" x2="140" y2="150" stroke="#64748b" strokeWidth="1.5" />

                  {/* 6-Input NAND Gate */}
                  <rect x="140" y="15" width="45" height="145" rx="5" fill="#f8fafc" stroke="#4338ca" strokeWidth="2" />
                  <path d="M 185 15 C 215 15, 215 160, 185 160 Z" fill="#f8fafc" stroke="#4338ca" strokeWidth="2" />
                  <circle cx="212" cy="87" r="3" fill="white" stroke="#4338ca" strokeWidth="2" />
                  <text x="155" y="92" className="font-sans font-bold text-[10px]" fill="#4338ca">NAND</text>

                  {/* Main CS Wire */}
                  <line x1="215" y1="87" x2="270" y2="87" stroke="#4338ca" strokeWidth="2" />
                  <text x="225" y="80" className="font-mono text-[9px] font-bold" fill="#4338ca"><tspan textDecoration="overline">CS</tspan></text>

                  {/* Branch to OR Gate 1 (Even Bank) */}
                  <line x1="260" y1="87" x2="260" y2="55" stroke="#4338ca" strokeWidth="2" />
                  <line x1="260" y1="55" x2="295" y2="55" stroke="#4338ca" strokeWidth="2" />

                  {/* Branch to OR Gate 2 (Odd Bank) */}
                  <line x1="260" y1="87" x2="260" y2="135" stroke="#4338ca" strokeWidth="2" />
                  <line x1="260" y1="135" x2="295" y2="135" stroke="#4338ca" strokeWidth="2" />

                  {/* A0 and BHE Inputs */}
                  <text x="245" y="35" className="font-mono text-[10px] font-bold" fill="#047857">A0</text>
                  <line x1="265" y1="35" x2="295" y2="35" stroke="#047857" strokeWidth="1.5" />

                  <text x="240" y="165" className="font-mono text-[10px] font-bold" fill="#b45309"><tspan textDecoration="overline">BHE</tspan></text>
                  <line x1="270" y1="160" x2="295" y2="160" stroke="#b45309" strokeWidth="1.5" />

                  {/* OR Gate 1 (Top) */}
                  <g transform="translate(295, 30)">
                    <path d="M 0 0 C 8 7, 8 23, 0 30 C 15 30, 25 22, 35 15 C 25 8, 15 0, 0 0 Z" fill="#eff6ff" stroke="#2563eb" strokeWidth="2" />
                    <text x="6" y="18" className="font-sans font-bold text-[8px]" fill="#1e40af">OR</text>
                    <line x1="35" y1="15" x2="65" y2="15" stroke="#2563eb" strokeWidth="2" />
                    <text x="70" y="18" className="font-mono text-[10px] font-bold" fill="#1e40af"><tspan textDecoration="overline">CE1</tspan> (RAM_1)</text>
                  </g>

                  {/* OR Gate 2 (Bottom) */}
                  <g transform="translate(295, 130)">
                    <path d="M 0 0 C 8 7, 8 23, 0 30 C 15 30, 25 22, 35 15 C 25 8, 15 0, 0 0 Z" fill="#fef3c7" stroke="#d97706" strokeWidth="2" />
                    <text x="6" y="18" className="font-sans font-bold text-[8px]" fill="#b45309">OR</text>
                    <line x1="35" y1="15" x2="65" y2="15" stroke="#d97706" strokeWidth="2" />
                    <text x="70" y="18" className="font-mono text-[10px] font-bold" fill="#b45309"><tspan textDecoration="overline">CE2</tspan> (RAM_2)</text>
                  </g>
                </svg>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                <div className="bg-indigo-50 p-1.5 rounded border border-indigo-100 text-indigo-900">
                  • 74LS04 Hex Inverters<br />
                  • 74LS30 8-Input NAND
                </div>
                <div className="bg-emerald-50 p-1.5 rounded border border-emerald-100 text-emerald-900">
                  • 74LS32 Quad 2-Input OR<br />
                  • Active-LOW Output Drives
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: COMPLETE CIRCUIT INTERFACING SCHEMATIC */}
      {activeStep === 5 && (
        <div className="space-y-3">
          {/* Interactive Simulation Controls Bar */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-700">Access Mode:</span>
              <div className="flex bg-white rounded-lg p-0.5 border border-slate-200 gap-1 font-bold text-[10px]">
                <button
                  onClick={() => setAccessMode('word')}
                  className={`px-2 py-1 rounded transition-all cursor-pointer ${accessMode === 'word' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  16-Bit Word
                </button>
                <button
                  onClick={() => setAccessMode('byte')}
                  className={`px-2 py-1 rounded transition-all cursor-pointer ${accessMode === 'byte' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  8-Bit Byte
                </button>
              </div>

              <span className="text-[11px] font-bold text-slate-700 ml-2">Operation:</span>
              <div className="flex bg-white rounded-lg p-0.5 border border-slate-200 gap-1 font-bold text-[10px]">
                <button
                  onClick={() => setOpMode('write')}
                  className={`px-2 py-1 rounded transition-all cursor-pointer ${opMode === 'write' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  <Overline>MEMW</Overline> (Write)
                </button>
                <button
                  onClick={() => setOpMode('read')}
                  className={`px-2 py-1 rounded transition-all cursor-pointer ${opMode === 'read' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  <Overline>MEMR</Overline> (Read)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-700">Target Address:</span>
              <input
                type="text"
                maxLength={5}
                value={testAddressHex}
                onChange={(e) => setTestAddressHex(e.target.value.toUpperCase())}
                className="w-20 px-2 py-1 bg-white border border-slate-300 rounded font-mono text-center font-bold text-xs focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Full Schematic Architecture Visual Block Diagram */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                  <Activity className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">8086 ↔ 32 KB RAM Complete Interfacing Architecture</h4>
                  <p className="text-[10px] text-slate-500">8086 CPU • 74LS373 Latches • Absolute Decoder • 74LS245 Transceivers • RAM_1 &amp; RAM_2</p>
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-[10px]">
                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">ALE=Pulse</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">M/<Overline>IO</Overline>=1</span>
                <span className={`px-2 py-0.5 rounded font-bold ${isCsAsserted ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                  <Overline>CS</Overline>={csBar}
                </span>
              </div>
            </div>

            {/* Visual Interfacing Architecture Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
              {/* 1. 8086 CPU Block (Col 3) */}
              <div className="lg:col-span-3 bg-slate-50 text-slate-800 p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2 font-mono text-[10px]">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                    8086 MPU (Min Mode)
                  </span>
                  <span className="text-[9px] text-emerald-800 bg-emerald-100 px-1 rounded border border-emerald-300 font-bold">
                    MN/<Overline>MX</Overline> = +5V
                  </span>
                </div>

                <div className="space-y-1 text-[9px] text-slate-700">
                  <div className="flex justify-between bg-white p-1 rounded border border-slate-200">
                    <span>AD0–AD15 (Mux Bus)</span>
                    <span className="text-indigo-700 font-bold">Pins 9–16, 39–2</span>
                  </div>
                  <div className="flex justify-between bg-white p-1 rounded border border-slate-200">
                    <span>A16–A19 &amp; <Overline>BHE</Overline></span>
                    <span className="text-purple-700 font-bold">Pins 35–38, 34</span>
                  </div>
                  <div className="flex justify-between bg-white p-1 rounded border border-slate-200">
                    <span>ALE Strobe</span>
                    <span className="text-amber-700 font-bold">Pin 25 (LE)</span>
                  </div>
                  <div className="flex justify-between bg-white p-1 rounded border border-slate-200">
                    <span>M/<Overline>IO</Overline></span>
                    <span className="text-emerald-700 font-bold">Pin 28 = 1 (Mem)</span>
                  </div>
                  <div className="flex justify-between bg-white p-1 rounded border border-slate-200">
                    <span><Overline>RD</Overline> / <Overline>WR</Overline></span>
                    <span className="text-blue-700 font-bold">Pins 32 / 29</span>
                  </div>
                  <div className="flex justify-between bg-white p-1 rounded border border-slate-200">
                    <span><Overline>DEN</Overline> &amp; DT/<Overline>R</Overline></span>
                    <span className="text-orange-700 font-bold">Pins 26 / 27</span>
                  </div>
                </div>
              </div>

              {/* 2. Demultiplexing & Decoding Stage (Col 4) */}
              <div className="lg:col-span-4 space-y-2">
                {/* 74LS373 Latches */}
                <div className="bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-200 space-y-1 text-[10px]">
                  <div className="flex justify-between items-center font-bold text-indigo-950">
                    <span>3× 74LS373 Octal Latches</span>
                    <span className="text-[9px] bg-indigo-200/80 px-1 rounded text-indigo-900 font-mono">ALE Strobe</span>
                  </div>
                  <p className="text-slate-600 text-[10px] leading-relaxed">
                    Latches <strong className="text-slate-800 font-mono">AD0–AD15</strong> &amp; <strong className="text-slate-800 font-mono">A16–A19 / <Overline>BHE</Overline></strong> on the falling edge of ALE during <strong className="text-indigo-800">T1</strong> → maintains stable <strong className="text-slate-900 font-mono">A0–A19</strong> &amp; <strong className="text-slate-900 font-mono"><Overline>BHE</Overline></strong> throughout <strong className="text-indigo-800">T2–T4</strong> cycles while CPU bus pins switch to carrying Data (D0–D15).
                  </p>
                </div>

                {/* Absolute Decoder */}
                <div className="bg-purple-50/60 p-2.5 rounded-xl border border-purple-200 space-y-1 text-[10px]">
                  <div className="flex justify-between items-center font-bold text-purple-950">
                    <span>Absolute Decoder (NAND + OR)</span>
                    <span className={`text-[9px] px-1 rounded font-mono font-bold ${isCsAsserted ? 'bg-emerald-200 text-emerald-900' : 'bg-red-200 text-red-900'}`}>
                      <Overline>CS</Overline> = {csBar}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[10px]">
                    Decodes A15–A19 (all 0) → generates <strong className="text-purple-800 font-mono"><Overline>CS</Overline></strong>, and ORs with A0 / <Overline>BHE</Overline> for <strong className="text-indigo-700 font-mono"><Overline>CE1</Overline></strong> and <strong className="text-amber-700 font-mono"><Overline>CE2</Overline></strong>.
                  </p>
                </div>

                {/* 74LS245 Transceivers */}
                <div className="bg-slate-100 p-2 rounded-lg border border-slate-200 text-[9px] text-slate-600">
                  <span className="font-bold text-slate-800">2x 74LS245 Transceivers: </span>
                  DIR = DT/<Overline>R</Overline> ({opMode === 'write' ? '1 Transmit' : '0 Receive'}), <Overline>OE</Overline> = <Overline>DEN</Overline> (0 Active).
                </div>
              </div>

              {/* 3. 2x 16 KB RAM Memory ICs (Col 5) */}
              <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* RAM_1: Even Bank */}
                <div className={`p-3 rounded-xl border transition-all space-y-2 ${ce1Bar === 0 ? 'bg-indigo-50/80 border-indigo-300 shadow-xs' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                  <div className="flex items-center justify-between border-b border-indigo-200/60 pb-1">
                    <span className="font-bold text-indigo-950 text-xs">RAM_1 (Even Bank)</span>
                    <span className="font-mono text-[9px] bg-indigo-200 text-indigo-900 px-1 rounded font-bold">16 KB</span>
                  </div>
                  <div className="space-y-1 font-mono text-[9px] text-slate-700">
                    <div>• Data Pins: <strong className="text-indigo-700">D0 – D7</strong></div>
                    <div>• Address: <strong className="text-slate-800">A1 – A14</strong> → A0–A13</div>
                    <div>• Chip Enable: <strong className={ce1Bar === 0 ? 'text-emerald-700' : 'text-slate-400'}><Overline>CE1</Overline> = {ce1Bar}</strong></div>
                    <div>• Read Strobe: <strong className={rdBar === 0 ? 'text-emerald-700' : 'text-slate-400'}><Overline>OE</Overline> = {rdBar}</strong></div>
                    <div>• Write Strobe: <strong className={wrBar === 0 ? 'text-amber-700' : 'text-slate-400'}><Overline>WE</Overline> = {wrBar}</strong></div>
                  </div>
                  <div className="text-[9px] text-indigo-900 bg-indigo-100/70 p-1 rounded font-sans font-semibold text-center">
                    {ce1Bar === 0 ? 'ACTIVE (Reading/Writing D0–D7)' : 'STANDBY'}
                  </div>
                </div>

                {/* RAM_2: Odd Bank */}
                <div className={`p-3 rounded-xl border transition-all space-y-2 ${ce2Bar === 0 ? 'bg-amber-50/80 border-amber-300 shadow-xs' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                  <div className="flex items-center justify-between border-b border-amber-200/60 pb-1">
                    <span className="font-bold text-amber-950 text-xs">RAM_2 (Odd Bank)</span>
                    <span className="font-mono text-[9px] bg-amber-200 text-amber-900 px-1 rounded font-bold">16 KB</span>
                  </div>
                  <div className="space-y-1 font-mono text-[9px] text-slate-700">
                    <div>• Data Pins: <strong className="text-amber-700">D8 – D15</strong></div>
                    <div>• Address: <strong className="text-slate-800">A1 – A14</strong> → A0–A13</div>
                    <div>• Chip Enable: <strong className={ce2Bar === 0 ? 'text-emerald-700' : 'text-slate-400'}><Overline>CE2</Overline> = {ce2Bar}</strong></div>
                    <div>• Read Strobe: <strong className={rdBar === 0 ? 'text-emerald-700' : 'text-slate-400'}><Overline>OE</Overline> = {rdBar}</strong></div>
                    <div>• Write Strobe: <strong className={wrBar === 0 ? 'text-amber-700' : 'text-slate-400'}><Overline>WE</Overline> = {wrBar}</strong></div>
                  </div>
                  <div className="text-[9px] text-amber-900 bg-amber-100/70 p-1 rounded font-sans font-semibold text-center">
                    {ce2Bar === 0 ? 'ACTIVE (Reading/Writing D8–D15)' : 'STANDBY'}
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Conclusion Box */}
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-700 space-y-1">
              <div className="font-bold text-slate-900">Key Interfacing Engineering Rules Verified:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px]">
                <div>1. <strong>A0 Shift Rule:</strong> Memory chip address lines A0–A13 connect to 8086 system lines A1–A14.</div>
                <div>2. <strong>Bank Isolation:</strong> A0 gates Even Bank (D0–D7) while <Overline>BHE</Overline> gates Odd Bank (D8–D15).</div>
                <div>3. <strong>Absolute Decoding:</strong> A15–A19 all equal 0 restricts RAM strictly to 00000H–07FFFH.</div>
                <div>4. <strong>Single Cycle Word Transfer:</strong> Aligned 16-bit word at even address enables both RAM_1 and RAM_2 simultaneously!</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 6: COMPLETE SCHEMATIC CIRCUIT (INTERACTIVE VECTOR DIAGRAM & IC INSPECTOR) */}
      {activeStep === 6 && (
        <div className="space-y-3">
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                <CircuitBoard className="w-4 h-4" />
              </span>
              <div>
                <h4 className="font-bold text-xs text-indigo-950">Step 6: Complete 8086 32 KB RAM Interfacing Circuit Schematic</h4>
                <p className="text-[10px] text-slate-600">
                  Direct continuation of Steps 1–5: Minimum Mode 8086 MPU, 3× 74LS373 Latches, Absolute NAND Decoder (00000H–07FFFH), Bank OR Gates, 2× 74LS245 Transceivers, and 2× 16 KB RAM ICs (Even &amp; Odd Banks).
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-lg border border-indigo-300">
              Live T-State &amp; Bus Trace Simulator
            </span>
          </div>

          <MemorySchematicDiagram />
        </div>
      )}
    </div>
  );
}
