import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Binary, 
  CheckCircle2, 
  Terminal, 
  Cpu, 
  ArrowRight, 
  BookOpen, 
  Sparkles, 
  Code2,
  HelpCircle,
  Zap,
  Layers
} from 'lucide-react';

export const InstructionBuilderSimulator: React.FC = () => {
  // Builder selections
  const [operation, setOperation] = useState<'MOV' | 'ADD' | 'SUB' | 'INC' | 'CMP'>('MOV');
  const [destReg, setDestReg] = useState<'AX' | 'BX' | 'CX' | 'DX'>('AX');
  const [sourceType, setSourceType] = useState<'AX' | 'BX' | 'CX' | 'DX' | 'Immediate'>('BX');
  const [immValue, setImmValue] = useState<string>('1234H');

  // Active view tab
  const [activeTab, setActiveTab] = useState<'builder' | 'format' | 'comparison' | 'remember'>('builder');

  // Construct Instruction string
  const instructionStr = operation === 'INC' 
    ? `${operation} ${destReg}`
    : `${operation} ${destReg}, ${sourceType === 'Immediate' ? immValue : sourceType}`;

  // Machine Code & Metadata Generation
  const getOpcodeHex = (op: string) => {
    switch(op) {
      case 'MOV': return '8BH';
      case 'ADD': return '03H';
      case 'SUB': return '2BH';
      case 'INC': return '40H';
      case 'CMP': return '3BH';
      default: return '8BH';
    }
  };

  const getOpcodeBinary = (op: string) => {
    switch(op) {
      case 'MOV': return '100010';
      case 'ADD': return '000000';
      case 'SUB': return '001010';
      case 'INC': return '010000';
      case 'CMP': return '001110';
      default: return '100010';
    }
  };

  const addressingMode = sourceType === 'Immediate' 
    ? 'Immediate Addressing' 
    : 'Register Direct Addressing';

  const bytesLength = operation === 'INC' 
    ? 1 
    : (sourceType === 'Immediate' ? 3 : 2);

  return (
    <div id="instruction-builder-simulator" className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 text-slate-800 flex flex-col justify-between shadow-xs max-w-7xl mx-auto w-full space-y-6">
      
      {/* Simulator Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-150 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl">
              <Code2 className="w-5 h-5" />
            </span>
            <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight font-sans">
              8086 Instruction Builder & Format Analyzer
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Build custom assembly instructions, decode machine opcode fields, and visualize the 8086 decode pipeline
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 self-start md:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'builder' 
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200 font-extrabold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Interactive Builder
          </button>
          <button
            onClick={() => setActiveTab('format')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'format' 
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200 font-extrabold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            Format Breakdown
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'comparison' 
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200 font-extrabold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            Quick Comparison
          </button>
          <button
            onClick={() => setActiveTab('remember')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'remember' 
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200 font-extrabold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Remember 🧠
          </button>
        </div>
      </div>

      {/* TAB 1: INTERACTIVE BUILDER */}
      {activeTab === 'builder' && (
        <div className="space-y-6">
          
          {/* Top Grid: Selector Panel & Live Instruction Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            
            {/* Left Column: Build Controls (7 cols) */}
            <div className="lg:col-span-7 bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-indigo-600" />
                  Configure Instruction Operands
                </span>
                <span className="text-[10px] font-mono text-indigo-700 font-bold bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                  8086 Assembly
                </span>
              </div>

              {/* 1. Operation Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase font-mono tracking-wider block">
                  1. Operation (Opcode)
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(['MOV', 'ADD', 'SUB', 'INC', 'CMP'] as const).map(op => (
                    <button
                      key={op}
                      onClick={() => setOperation(op)}
                      className={`py-2 text-xs font-bold font-mono rounded-xl border transition-all cursor-pointer ${
                        operation === op 
                          ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs scale-[1.02]' 
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {op}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Destination Register */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase font-mono tracking-wider block">
                  2. Destination Operand
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['AX', 'BX', 'CX', 'DX'] as const).map(reg => (
                    <button
                      key={reg}
                      onClick={() => setDestReg(reg)}
                      className={`py-2 text-xs font-bold font-mono rounded-xl border transition-all cursor-pointer ${
                        destReg === reg 
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs scale-[1.02]' 
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {reg}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Source Operand */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase font-mono tracking-wider block">
                  3. Source Operand {operation === 'INC' && <span className="text-amber-600 lowercase font-normal">(not used for INC)</span>}
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(['AX', 'BX', 'CX', 'DX', 'Immediate'] as const).map(src => (
                    <button
                      key={src}
                      disabled={operation === 'INC'}
                      onClick={() => setSourceType(src)}
                      className={`py-2 text-xs font-bold font-mono rounded-xl border transition-all cursor-pointer ${
                        operation === 'INC'
                          ? 'bg-slate-100 text-slate-400 border-slate-200 opacity-50 cursor-not-allowed'
                          : sourceType === src 
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs scale-[1.02]' 
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {src}
                    </button>
                  ))}
                </div>

                {/* Immediate Value Input */}
                {sourceType === 'Immediate' && operation !== 'INC' && (
                  <div className="pt-2 flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-600 font-bold">Immediate Hex Value:</span>
                    <input
                      type="text"
                      value={immValue}
                      onChange={(e) => setImmValue(e.target.value.toUpperCase())}
                      placeholder="e.g. 1234H"
                      className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-indigo-900 w-32 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: Live Generated Instruction Card (5 cols) */}
            <div className="lg:col-span-5 bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between shadow-lg relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold tracking-wider">
                    Generated Assembly Instruction
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 border border-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                    {bytesLength} Byte(s)
                  </span>
                </div>

                {/* Main Instruction Display */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-center space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-400 font-bold">Your Instruction:</span>
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-300 tracking-wide py-1">
                    {instructionStr}
                  </div>
                </div>

                {/* Metadata Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                    <span className="text-[9.5px] text-slate-400 block font-sans">Opcode:</span>
                    <span className="font-bold text-indigo-300">{operation} ({getOpcodeHex(operation)})</span>
                  </div>
                  <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                    <span className="text-[9.5px] text-slate-400 block font-sans">Destination:</span>
                    <span className="font-bold text-emerald-400">{destReg}</span>
                  </div>
                  <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                    <span className="text-[9.5px] text-slate-400 block font-sans">Source:</span>
                    <span className="font-bold text-amber-400">
                      {operation === 'INC' ? 'None (Unary)' : sourceType === 'Immediate' ? immValue : sourceType}
                    </span>
                  </div>
                  <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                    <span className="text-[9.5px] text-slate-400 block font-sans">Addressing Mode:</span>
                    <span className="font-bold text-sky-300">{addressingMode}</span>
                  </div>
                </div>

                {/* Visual Format Box Diagram */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                    Instruction Component Format:
                  </span>
                  <div className="flex text-center text-xs font-mono font-bold rounded-lg overflow-hidden border border-slate-700">
                    <div className="flex-1 bg-indigo-900/90 text-indigo-200 py-2 border-r border-slate-800">
                      <span className="text-[9px] block text-indigo-400 font-sans">Opcode</span>
                      {operation}
                    </div>
                    <div className="flex-1 bg-emerald-900/90 text-emerald-200 py-2 border-r border-slate-800">
                      <span className="text-[9px] block text-emerald-400 font-sans">Dest</span>
                      {destReg}
                    </div>
                    {operation !== 'INC' && (
                      <div className="flex-1 bg-amber-900/90 text-amber-200 py-2">
                        <span className="text-[9px] block text-amber-400 font-sans">Source</span>
                        {sourceType === 'Immediate' ? immValue : sourceType}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* TAB 2: FORMAT BREAKDOWN */}
      {activeTab === 'format' && (
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-extrabold font-mono uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              General 8086 Machine Instruction Format (1 to 6 Bytes)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              An 8086 instruction may contain different fields depending on the instruction. <strong>Not every instruction contains every field.</strong> The instruction length ranges from 1 byte (e.g. NOP) up to 6 bytes.
            </p>

            {/* Visual Format Box Diagram requested in Prompt */}
            <div className="bg-slate-900 text-slate-100 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3 font-mono">
              <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider text-center">
                Visual 8086 Instruction Byte Structure Diagram
              </div>

              {/* Box Diagram */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1 text-center text-xs font-bold font-mono">
                <div className="p-3 bg-indigo-900/80 border border-indigo-700 rounded-lg">
                  <span className="text-[9px] text-indigo-300 block font-sans">Byte 1 (Opt)</span>
                  Prefix
                </div>
                <div className="p-3 bg-emerald-900/80 border border-emerald-700 rounded-lg">
                  <span className="text-[9px] text-emerald-300 block font-sans">Byte 1-2</span>
                  Opcode
                </div>
                <div className="p-3 bg-sky-900/80 border border-sky-700 rounded-lg">
                  <span className="text-[9px] text-sky-300 block font-sans">Byte 2 Bit 7-6</span>
                  Mod
                </div>
                <div className="p-3 bg-purple-900/80 border border-purple-700 rounded-lg">
                  <span className="text-[9px] text-purple-300 block font-sans">Byte 2 Bit 5-3</span>
                  Reg
                </div>
                <div className="p-3 bg-amber-900/80 border border-amber-700 rounded-lg">
                  <span className="text-[9px] text-amber-300 block font-sans">Byte 2 Bit 2-0</span>
                  R/M
                </div>
                <div className="p-3 bg-teal-900/80 border border-teal-700 rounded-lg">
                  <span className="text-[9px] text-teal-300 block font-sans">Byte 3-4 (Opt)</span>
                  Displacement
                </div>
                <div className="p-3 bg-rose-900/80 border border-rose-700 rounded-lg">
                  <span className="text-[9px] text-rose-300 block font-sans">Byte 5-6 (Opt)</span>
                  Immediate Data
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-400 pt-1 font-sans">
                ▲ Optional fields (Prefix, Displacement, Immediate Data) are omitted when not required by the instruction.
              </div>
            </div>

            {/* Field Breakdown List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {[
                { title: 'Prefix – Optional', desc: 'Used for repeat prefixes (e.g., REP/REPE) or segment override prefixes (e.g., ES:, CS:).' },
                { title: 'Opcode – Required', desc: 'Specifies the operation code (e.g., MOV, ADD, SUB) along with D (direction) and W (word/byte width) status bits.' },
                { title: 'MOD – Addressing Mode', desc: '2-bit field specifying register mode (11) or displacement length (00=0 byte, 01=1 byte, 10=2 bytes).' },
                { title: 'REG – Register Field', desc: '3-bit field specifying a 16-bit or 8-bit CPU register operand (e.g., AX=000, CX=001, DX=010, BX=011).' },
                { title: 'R/M – Register/Memory', desc: '3-bit field specifying the target register or base/index displacement combination (e.g., [BX+SI]).' },
                { title: 'Displacement – Optional', desc: '8-bit or 16-bit memory address offset stored in Little-Endian format (Low byte first).' },
                { title: 'Immediate Data – Optional', desc: '8-bit or 16-bit constant data value embedded directly inside the instruction byte stream.' }
              ].map((f, i) => (
                <div key={i} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 shadow-xs">
                  <span className="font-extrabold text-xs text-indigo-900 font-mono block">{f.title}</span>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-sans">{f.desc}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: QUICK COMPARISON TABLE */}
      {activeTab === 'comparison' && (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-extrabold font-mono uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              10. Quick Comparison Table
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs bg-white">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-100 font-mono text-[11px] font-bold uppercase text-indigo-950 border-b border-slate-200">
                  <tr>
                    <th className="p-3 border-r border-slate-200 w-1/3">Term</th>
                    <th className="p-3">Meaning & Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 font-medium text-slate-700">
                  {[
                    { term: 'Opcode', mean: 'What operation to perform (e.g. MOV, ADD, SUB, INC, CMP).' },
                    { term: 'Operand', mean: 'Data or location involved in the instruction operation.' },
                    { term: 'Destination', mean: 'Where the calculated result is saved after execution.' },
                    { term: 'Source', mean: 'Where the input data or operand value comes from.' },
                    { term: 'Addressing Mode', mean: 'How the operand is accessed (Register, Immediate, Direct, Indirect).' },
                    { term: 'Machine Code', mean: 'Binary or hexadecimal sequence directly executed by the 8086 CPU.' }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-indigo-50/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-indigo-900 bg-slate-50/50 border-r border-slate-200">
                        {row.term}
                      </td>
                      <td className="p-3 leading-relaxed">
                        {row.mean}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* TAB 4: REMEMBER SUMMARY */}
      {activeTab === 'remember' && (
        <div className="space-y-5">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xl">🧠</span>
              <h3 className="text-sm font-extrabold font-mono uppercase tracking-wider text-amber-950">
                11. Remember - Essential Key Formulas & Execution Flow
              </h3>
            </div>

            {/* 3 Pillar Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-amber-200 text-center shadow-xs">
                <span className="text-[10px] font-mono text-amber-700 font-bold block uppercase">Core Concept 1</span>
                <span className="text-xs font-black font-mono text-indigo-900 mt-1 block">OPCODE = WHAT TO DO</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-amber-200 text-center shadow-xs">
                <span className="text-[10px] font-mono text-amber-700 font-bold block uppercase">Core Concept 2</span>
                <span className="text-xs font-black font-mono text-emerald-900 mt-1 block">OPERAND = ON WHAT TO DO</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-amber-200 text-center shadow-xs">
                <span className="text-[10px] font-mono text-amber-700 font-bold block uppercase">Core Concept 3</span>
                <span className="text-xs font-black font-mono text-amber-900 mt-1 block">ADDRESSING MODE = HOW TO FIND OPERAND</span>
              </div>
            </div>

            {/* Execution Flow Diagram */}
            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs text-center border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                Microprocessor Execution Flow
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold pt-1">
                <span className="px-3 py-1 bg-indigo-900/90 text-indigo-200 rounded-lg border border-indigo-700">
                  Assembly Language
                </span>
                <span className="text-amber-400">↓</span>
                <span className="px-3 py-1 bg-emerald-900/90 text-emerald-200 rounded-lg border border-emerald-700">
                  Opcode + Operand(s)
                </span>
                <span className="text-amber-400">↓</span>
                <span className="px-3 py-1 bg-sky-900/90 text-sky-200 rounded-lg border border-sky-700">
                  Machine Code
                </span>
                <span className="text-amber-400">↓</span>
                <span className="px-3 py-1 bg-amber-900/90 text-amber-200 rounded-lg border border-amber-700">
                  8086 Executes
                </span>
              </div>
            </div>

            {/* Key Facts List */}
            <div className="bg-white p-4 rounded-xl border border-amber-200 space-y-2 text-xs text-slate-700 leading-relaxed font-sans">
              <span className="font-bold text-amber-900 font-mono uppercase text-[11px] block">
                Key Facts Checklist:
              </span>
              <ul className="list-disc pl-5 space-y-1 font-medium">
                <li>8086 instructions are variable length (ranging from 1 to 6 bytes).</li>
                <li>An instruction may contain opcode, operands, addressing information, displacement, and immediate data.</li>
                <li>Not every instruction contains all fields.</li>
                <li>The 8086 uses Little-Endian storage for multi-byte values (Low byte at lower address, High byte at higher address).</li>
              </ul>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
