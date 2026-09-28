import React, { useState } from 'react';
import { 
  Calculator, 
  ArrowRight, 
  Info,
  Database,
  Cpu,
  RefreshCw,
  Layers,
  GraduationCap,
  Play,
  CheckCircle2,
  Sliders,
  Sparkles,
  Search,
  BookOpen
} from 'lucide-react';

interface AddressingExample {
  id: string;
  title: string;
  instruction: string;
  description: string;
  inputs: { [key: string]: string };
  outputs: { [key: string]: string };
  hardwareAction: string;
  machineCode: string;
}

interface AddressingMode8051 {
  id: string;
  name: string;
  shortName: string;
  category: 'core' | 'memory' | 'program';
  syntaxPattern: string;
  description: string;
  rules: string[];
  examples: AddressingExample[];
}

const addressingModes8051Data: Record<string, AddressingMode8051> = {
  immediate: {
    id: 'immediate',
    name: 'Immediate Addressing Mode',
    shortName: 'Immediate (#data)',
    category: 'core',
    syntaxPattern: 'MOV reg / direct, #data',
    description: 'The operand is an 8-bit or 16-bit constant numerical value embedded directly inside the opcode byte stream, identified by the prefix "#".',
    rules: [
      'The source operand is a constant number preceded by "#" (e.g. #25H, #100, #0F8H).',
      'If the numerical constant starts with a hex letter (A–F), it must be preceded by a zero (e.g. #0F5H, not #F5H).',
      'Loads immediate 8-bit constants into registers (A, B, R0–R7) or direct RAM, and 16-bit constants into the DPTR register.'
    ],
    examples: [
      {
        id: 'imm-1',
        title: 'Example 1: 8-Bit Immediate Load into Accumulator',
        instruction: 'MOV A, #55H',
        description: 'Loads the immediate 8-bit hexadecimal constant 55H (0101 0101b) directly into Accumulator A.',
        inputs: { A: '00H', '#data': '55H' },
        outputs: { A: '55H' },
        hardwareAction: 'PC fetches 2 bytes (74H 55H). Instruction decoder writes 55H into the Accumulator latch.',
        machineCode: '74 55'
      },
      {
        id: 'imm-2',
        title: 'Example 2: 16-Bit Immediate Load into Data Pointer',
        instruction: 'MOV DPTR, #1234H',
        description: 'Loads the 16-bit constant address 1234H into the 16-bit DPTR (DPH = 12H, DPL = 34H).',
        inputs: { DPTR: '0000H', DPH: '00H', DPL: '00H', '#data16': '1234H' },
        outputs: { DPTR: '1234H', DPH: '12H', DPL: '34H' },
        hardwareAction: 'PC fetches 3 bytes (90H 12H 34H). High byte 12H is written to SFR DPH (83H); low byte 34H to DPL (82H).',
        machineCode: '90 12 34'
      },
      {
        id: 'imm-3',
        title: 'Example 3: Immediate Load into Register R4',
        instruction: 'MOV R4, #0A2H',
        description: 'Loads 8-bit constant A2H into working register R4 of the currently selected register bank.',
        inputs: { R4: '00H', '#data': '0A2H' },
        outputs: { R4: 'A2H' },
        hardwareAction: 'Opcode 7CH (Bank-dependent) embeds register index. Opcode fetch transfers byte 0A2H into active Bank R4.',
        machineCode: '7C A2'
      }
    ]
  },
  register: {
    id: 'register',
    name: 'Register Addressing Mode',
    shortName: 'Register (Rn, A, B)',
    category: 'core',
    syntaxPattern: 'MOV destReg, srcReg',
    description: 'The operand resides entirely inside one of the 8 working registers (R0 to R7) of the active bank, the Accumulator (A), B register, or Carry flag (C).',
    rules: [
      'Operands are internal registers: R0 to R7 of the active bank selected by PSW bits RS1:RS0.',
      'Executes in 1 single machine cycle (12 oscillator periods) because registers are on-chip.',
      'Moving directly between working registers (e.g. MOV R0, R1) is physically ILLEGAL in 8051. Must move via Accumulator.'
    ],
    examples: [
      {
        id: 'reg-1',
        title: 'Example 1: Register to Accumulator Transfer',
        instruction: 'MOV A, R5',
        description: 'Copies the 8-bit contents of working register R5 (from active bank) into Accumulator A.',
        inputs: { A: '10H', R5: '88H', 'Active Bank': 'Bank 0 (05H)' },
        outputs: { A: '88H', R5: '88H' },
        hardwareAction: '1-byte instruction (0EDH). Reads internal RAM address 05H (for Bank 0) and latches into A.',
        machineCode: 'ED'
      },
      {
        id: 'reg-2',
        title: 'Example 2: Accumulator to Register Transfer',
        instruction: 'MOV R2, A',
        description: 'Copies the current 8-bit value of Accumulator A into working register R2.',
        inputs: { A: '4CH', R2: '00H', 'Active Bank': 'Bank 1 (0AH)' },
        outputs: { A: '4CH', R2: '4CH' },
        hardwareAction: '1-byte instruction (0FAH). Writes contents of Accumulator into active Bank R2 (address 0AH).',
        machineCode: 'FA'
      },
      {
        id: 'reg-3',
        title: 'Example 3: Register Addition into Accumulator',
        instruction: 'ADD A, R0',
        description: 'Adds the contents of register R0 to Accumulator A, updating CY, AC, OV, and P flags in PSW.',
        inputs: { A: '35H', R0: '23H', CY: '0' },
        outputs: { A: '58H', CY: '0', P: '0 (Even)' },
        hardwareAction: 'ALU performs binary addition: 35H + 23H = 58H. Result stored in A; Parity bit in PSW updated.',
        machineCode: '28'
      }
    ]
  },
  direct: {
    id: 'direct',
    name: 'Direct Addressing Mode',
    shortName: 'Direct (RAM / SFR)',
    category: 'memory',
    syntaxPattern: 'MOV A, directAddr / MOV directAddr, A',
    description: 'The operand is specified by its exact 8-bit on-chip address (00H to 7FH for 128-byte RAM; 80H to FFH for Special Function Registers).',
    rules: [
      'Addresses 00H–7FH access the 128-byte internal scratchpad RAM (Register banks, Bit-RAM, Scratchpad).',
      'Addresses 80H–FFH access hardware SFRs (P0, P1, P2, P3, TCON, TMOD, SCON, IE, IP, PSW, ACC, B).',
      'Can transfer data directly between two RAM addresses without passing through Accumulator (e.g. MOV 40H, 30H).'
    ],
    examples: [
      {
        id: 'dir-1',
        title: 'Example 1: Read from Internal Scratchpad RAM',
        instruction: 'MOV A, 30H',
        description: 'Reads the byte stored in internal RAM memory address 30H into Accumulator A.',
        inputs: { A: '00H', 'RAM[30H]': '9AH' },
        outputs: { A: '9AH', 'RAM[30H]': '9AH' },
        hardwareAction: '2-byte instruction (E5H 30H). 8051 reads internal memory bus at address 30H and drives Accumulator.',
        machineCode: 'E5 30'
      },
      {
        id: 'dir-2',
        title: 'Example 2: Write Accumulator to SFR Port 1',
        instruction: 'MOV 90H, A',
        description: 'Writes the contents of Accumulator A to SFR address 90H (which is the physical Port 1 latch register).',
        inputs: { A: '55H', 'SFR P1 (90H)': 'FFH' },
        outputs: { 'SFR P1 (90H)': '55H', 'P1 Pins': '01010101b' },
        hardwareAction: '2-byte instruction (F5H 90H). Writes Accumulator value to SFR Port 1 latch, immediately updating P1 pin voltages.',
        machineCode: 'F5 90'
      },
      {
        id: 'dir-3',
        title: 'Example 3: Direct Memory to Memory Transfer',
        instruction: 'MOV 50H, 30H',
        description: 'Directly copies the byte from RAM address 30H into RAM address 50H without altering the Accumulator!',
        inputs: { 'RAM[30H]': '7FH', 'RAM[50H]': '00H', A: '12H (Unchanged)' },
        outputs: { 'RAM[30H]': '7FH', 'RAM[50H]': '7FH', A: '12H' },
        hardwareAction: '3-byte instruction (85H 30H 50H). First operand byte is source (30H), second is destination (50H).',
        machineCode: '85 30 50'
      }
    ]
  },
  indirect: {
    id: 'indirect',
    name: 'Register-Indirect Addressing Mode',
    shortName: 'Indirect (@R0, @R1, @DPTR)',
    category: 'memory',
    syntaxPattern: 'MOV A, @R0 / MOVX A, @DPTR',
    description: 'The memory address is not hardcoded; instead, a register (R0, R1, or DPTR) holds the pointer to the target operand, denoted with "@".',
    rules: [
      'Internal RAM pointer: ONLY registers R0 or R1 of the active bank can act as pointers (@R0 or @R1) for 8-bit internal RAM.',
      'External RAM pointer (MOVX): Either 8-bit @R0/@R1 (for 256 bytes XDATA) or 16-bit @DPTR (for full 64 KB external RAM).',
      'Crucial for loops, string traversal, lookup tables, and dynamic buffer management.'
    ],
    examples: [
      {
        id: 'ind-1',
        title: 'Example 1: Internal RAM Pointer Read via @R0',
        instruction: 'MOV A, @R0',
        description: 'Reads the byte from the internal RAM location pointed to by R0 into Accumulator A.',
        inputs: { R0: '35H', 'RAM[35H]': '0B4H', A: '00H' },
        outputs: { A: '0B4H', R0: '35H' },
        hardwareAction: 'CPU places contents of R0 (35H) onto internal address bus to fetch data into A.',
        machineCode: 'E6'
      },
      {
        id: 'ind-2',
        title: 'Example 2: Clear Internal RAM Block Using Pointer',
        instruction: 'MOV @R1, #00H',
        description: 'Writes immediate zero into the internal RAM address pointed to by register R1.',
        inputs: { R1: '40H', 'RAM[40H]': 'FFH' },
        outputs: { 'RAM[40H]': '00H', R1: '40H' },
        hardwareAction: 'CPU outputs address 40H from R1 and writes immediate byte 00H into that RAM cell.',
        machineCode: '77 00'
      },
      {
        id: 'ind-3',
        title: 'Example 3: External RAM Read via 16-bit DPTR',
        instruction: 'MOVX A, @DPTR',
        description: 'Reads an 8-bit byte from the 16-bit External Data RAM (XDATA) address pointed to by DPTR into Accumulator A.',
        inputs: { DPTR: '2000H', 'XDATA[2000H]': '99H', A: '00H' },
        outputs: { A: '99H', DPTR: '2000H' },
        hardwareAction: 'Generates external memory bus cycle: outputs DPTR on Port 0 & 2, asserts RD strobe (P3.7 LOW) to latch byte into A.',
        machineCode: 'E0'
      }
    ]
  },
  indexed: {
    id: 'indexed',
    name: 'Indexed Addressing Mode',
    shortName: 'Indexed (ROM Tables)',
    category: 'program',
    syntaxPattern: 'MOVC A, @A+DPTR / MOVC A, @A+PC',
    description: 'Accesses read-only constants in Program ROM by calculating the target address as the sum of a 16-bit base register (DPTR or PC) and an 8-bit index offset in A.',
    rules: [
      'Base register: 16-bit DPTR (Data Pointer) or 16-bit PC (Program Counter).',
      'Index register: 8-bit unsigned offset held in Accumulator A (range 0 to 255).',
      'Target Address = Base + A. Uses instruction mnemonic MOVC (Move Code) to read from on-chip/external ROM.'
    ],
    examples: [
      {
        id: 'idx-1',
        title: 'Example 1: Look-Up Table Read with DPTR Base',
        instruction: 'MOVC A, @A+DPTR',
        description: 'Calculates ROM Address = DPTR + A, fetches the constant byte from Program Memory, and replaces A with the fetched value.',
        inputs: { DPTR: '0200H', A: '03H (Offset 3)', 'ROM[0203H]': '77H' },
        outputs: { A: '77H', DPTR: '0200H' },
        hardwareAction: 'Hardware adder sums 0200H + 03H = 0203H. Program memory fetch reads byte 77H into A via PSEN strobe.',
        machineCode: '93'
      },
      {
        id: 'idx-2',
        title: 'Example 2: Look-Up Table Read with PC Base',
        instruction: 'MOVC A, @A+PC',
        description: 'Fetches code byte from ROM using current Program Counter as base. Useful for tables embedded immediately following code.',
        inputs: { PC: '0150H', A: '05H', 'ROM[0155H]': '3FH' },
        outputs: { A: '3FH', PC: '0151H' },
        hardwareAction: 'ROM address calculated as (PC + A). Byte fetched into Accumulator without needing to alter DPTR.',
        machineCode: '83'
      }
    ]
  }
};

export default function MCU8051AddressingModesSimulator() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'core' | 'memory' | 'program'>('all');
  const [selectedModeId, setSelectedModeId] = useState<string>('immediate');
  const [selectedExampleIdx, setSelectedExampleIdx] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [simStep, setSimStep] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const activeMode = addressingModes8051Data[selectedModeId] || addressingModes8051Data.immediate;
  const activeExample = activeMode.examples[selectedExampleIdx] || activeMode.examples[0];

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimStep(0);
    const interval = setInterval(() => {
      setSimStep((prev) => {
        if (prev >= 2) {
          clearInterval(interval);
          setIsSimulating(false);
          return 2;
        }
        return prev + 1;
      });
    }, 600);
  };

  const filteredModes = Object.values(addressingModes8051Data).filter((m) => {
    if (activeCategory !== 'all' && m.category !== activeCategory) return false;
    if (searchQuery.trim() === '') return true;
    return (
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.syntaxPattern.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Category Selection Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold font-mono text-indigo-700 uppercase tracking-widest block">
              8051 Addressing Mode Category
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              Select an addressing category or search by instruction syntax:
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search addressing mode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 w-52"
            />
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'All 5 Addressing Modes' },
            { id: 'core', label: '1. Register & Immediate' },
            { id: 'memory', label: '2. Direct & Indirect RAM' },
            { id: 'program', label: '3. Indexed ROM' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-xs font-bold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Modes Pill Selector */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {filteredModes.map((mode) => {
            const isSel = selectedModeId === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => {
                  setSelectedModeId(mode.id);
                  setSelectedExampleIdx(0);
                  setSimStep(0);
                }}
                className={`px-3 py-1.5 text-xs font-mono rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                  isSel
                    ? 'bg-indigo-700 border-indigo-700 text-white font-bold shadow-xs ring-2 ring-indigo-200'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-indigo-50/40 hover:border-indigo-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                {mode.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Stage: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Mode Architecture & Calculation Laboratory */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 tracking-wider">
                  Selected Addressing Mechanism
                </span>
                <h3 className="text-base font-bold text-slate-900 font-display mt-0.5">
                  {activeMode.name}
                </h3>
              </div>
              <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-800 px-2.5 py-1 rounded-lg border border-indigo-200">
                {activeMode.syntaxPattern}
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              {activeMode.description}
            </p>

            {/* Architectural Rules */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">
                Key Architectural Rules &amp; Constraints:
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {activeMode.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Example Selection Tabs */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">
                Worked Interactive Examples:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {activeMode.examples.map((ex, idx) => (
                  <button
                    key={ex.id}
                    onClick={() => {
                      setSelectedExampleIdx(idx);
                      setSimStep(0);
                    }}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedExampleIdx === idx
                        ? 'bg-indigo-600 border-indigo-700 text-white shadow-xs font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-[10px] opacity-80">Example {idx + 1}</div>
                    <div className="font-mono text-xs mt-0.5 truncate">{ex.instruction}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Calculation & Hardware Simulation Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 tracking-wider">
                  Hardware Execution Engine
                </span>
                <h4 className="text-sm font-bold text-slate-900 font-mono">
                  {activeExample.instruction}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200">
                  Hex Code: {activeExample.machineCode}
                </span>
                <button
                  onClick={handleRunSimulation}
                  disabled={isSimulating}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Play className="w-3 h-3" />
                  {isSimulating ? 'Executing...' : 'Step Trace'}
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              {activeExample.description}
            </p>

            {/* Register / Bus States Visualizer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              {/* Before State */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="text-[10px] uppercase font-bold text-slate-500 font-sans flex items-center justify-between">
                  <span>Pre-Execution State</span>
                  <span className="text-amber-600">Initial Inputs</span>
                </div>
                <div className="space-y-1">
                  {Object.entries(activeExample.inputs).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-200">
                      <span className="text-slate-600">{key}:</span>
                      <span className="font-bold text-slate-900">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* After State */}
              <div className={`p-3 rounded-xl border space-y-2 transition-all ${
                simStep >= 2
                  ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-100'
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="text-[10px] uppercase font-bold text-slate-500 font-sans flex items-center justify-between">
                  <span>Post-Execution State</span>
                  <span className={simStep >= 2 ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                    {simStep >= 2 ? '✓ Completed' : 'Pending Step'}
                  </span>
                </div>
                <div className="space-y-1">
                  {Object.entries(activeExample.outputs).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-200">
                      <span className="text-slate-600">{key}:</span>
                      <span className="font-bold text-emerald-700">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hardware Trace Message */}
            <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-200 text-xs font-mono text-indigo-950 space-y-1">
              <span className="text-[10px] uppercase font-bold text-indigo-700 font-sans block">
                Internal Bus Operation Trace:
              </span>
              <p className="leading-relaxed">
                {activeExample.hardwareAction}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Summary Table & Memory Map Integration */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h4 className="text-sm font-bold text-slate-900 font-display">
                8051 Addressing Modes Comparison Table
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase bg-slate-50">
                    <th className="py-2 px-2.5">Mode</th>
                    <th className="py-2 px-2.5">Syntax</th>
                    <th className="py-2 px-2.5">Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.values(addressingModes8051Data).map((m) => {
                    const isCurrent = m.id === selectedModeId;
                    return (
                      <tr
                        key={m.id}
                        onClick={() => {
                          setSelectedModeId(m.id);
                          setSelectedExampleIdx(0);
                        }}
                        className={`cursor-pointer transition-colors ${
                          isCurrent ? 'bg-indigo-50/80 font-bold text-indigo-900' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <td className="py-2 px-2.5 font-sans flex items-center gap-1.5">
                          {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>}
                          {m.shortName}
                        </td>
                        <td className="py-2 px-2.5 text-[11px]">{m.syntaxPattern}</td>
                        <td className="py-2 px-2.5 text-[11px] text-slate-500">
                          {m.category === 'core' ? 'Reg/Const' : m.category === 'memory' ? 'RAM/SFR' : 'Code ROM'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Golden Rules Memory Card */}
          <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 text-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-900 font-sans text-sm">
              <Sparkles className="w-4 h-4 text-amber-600" />
              8051 Addressing Mode Golden Rules
            </div>
            <ul className="space-y-1.5 list-disc pl-4 leading-relaxed text-slate-700">
              <li>
                <strong>Immediate (#):</strong> The <code>#</code> character denotes numeric data. <code>MOV A, 30H</code> (reads RAM 30H) is completely different from <code>MOV A, #30H</code> (loads constant 30H into A)!
              </li>
              <li>
                <strong>Pointer Registers:</strong> For internal RAM indirect addressing, only <code>@R0</code> and <code>@R1</code> are valid. Registers R2–R7 cannot act as indirect pointers.
              </li>
              <li>
                <strong>External RAM:</strong> Use <code>MOVX</code> for data RAM (off-chip/XDATA) and <code>MOVC</code> for program code ROM (constants).
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
