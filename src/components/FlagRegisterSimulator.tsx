import { useState } from 'react';
import { motion } from 'motion/react';
import { HelpCircle, RefreshCw, Cpu, CheckCircle, Layers, Bookmark, Hash, ArrowRight, Zap, AlertTriangle, Binary, Info } from 'lucide-react';

interface Flag {
  bit: number;
  abbr: string;
  fullName: string;
  type: 'status' | 'control' | 'unused';
  desc: string;
  setDesc: string;
  clearDesc: string;
}

const flagsData: Flag[] = [
  { bit: 15, abbr: '-', fullName: 'Unused Bit 15', type: 'unused', desc: 'Reserved bit, always undefined.', setDesc: '', clearDesc: '' },
  { bit: 14, abbr: '-', fullName: 'Unused Bit 14', type: 'unused', desc: 'Reserved bit, always undefined.', setDesc: '', clearDesc: '' },
  { bit: 13, abbr: '-', fullName: 'Unused Bit 13', type: 'unused', desc: 'Reserved bit, always undefined.', setDesc: '', clearDesc: '' },
  { bit: 12, abbr: '-', fullName: 'Unused Bit 12', type: 'unused', desc: 'Reserved bit, always undefined.', setDesc: '', clearDesc: '' },
  { bit: 11, abbr: 'OF', fullName: 'Overflow Flag', type: 'status', desc: 'Indicates signed arithmetic overflow.', setDesc: 'Set (1) if signed result exceeds the capacity of destination register (positive overflow or negative overflow).', clearDesc: 'Cleared (0) if signed result is within valid boundaries.' },
  { bit: 10, abbr: 'DF', fullName: 'Direction Flag', type: 'control', desc: 'Controls string instructions increment/decrement direction.', setDesc: 'Set (1) makes string operations process from right-to-left (auto-decrements SI/DI).', clearDesc: 'Cleared (0) makes string operations process from left-to-right (auto-increments SI/DI).' },
  { bit: 9, abbr: 'IF', fullName: 'Interrupt Enable Flag', type: 'control', desc: 'Enables or disables maskable hardware interrupts (INTR pin).', setDesc: 'Set (1) enables interrupts (STI instruction).', clearDesc: 'Cleared (0) disables maskable interrupts (CLI instruction).' },
  { bit: 8, abbr: 'TF', fullName: 'Trap Flag', type: 'control', desc: 'Enables single-step debugging mode.', setDesc: 'Set (1) puts CPU into single-step mode. Generates Interrupt Type 1 after each instruction execution.', clearDesc: 'Cleared (0) disables single-step mode.' },
  { bit: 7, abbr: 'SF', fullName: 'Sign Flag', type: 'status', desc: 'Indicates the mathematical sign of the result.', setDesc: 'Set (1) if MSB (Most Significant Bit) of result is 1, indicating a negative number.', clearDesc: 'Cleared (0) if MSB is 0, indicating a positive number or zero.' },
  { bit: 6, abbr: 'ZF', fullName: 'Zero Flag', type: 'status', desc: 'Indicates whether the mathematical result is zero.', setDesc: 'Set (1) if the ALU result of the operation is exactly zero.', clearDesc: 'Cleared (0) if the result is non-zero.' },
  { bit: 5, abbr: '-', fullName: 'Unused Bit 5', type: 'unused', desc: 'Reserved bit, always undefined.', setDesc: '', clearDesc: '' },
  { bit: 4, abbr: 'AF', fullName: 'Auxiliary Carry Flag', type: 'status', desc: 'Indicates half-carry from bit 3 to bit 4. Used for BCD arithmetic.', setDesc: 'Set (1) if there is a carry out from lower nibble (bit 3) or borrow in subtraction.', clearDesc: 'Cleared (0) if no carry/borrow from bit 3.' },
  { bit: 3, abbr: '-', fullName: 'Unused Bit 3', type: 'unused', desc: 'Reserved bit, always undefined.', setDesc: '', clearDesc: '' },
  { bit: 2, abbr: 'PF', fullName: 'Parity Flag', type: 'status', desc: 'Indicates parity of the lowest 8 bits of the result.', setDesc: 'Set (1) if the lower 8 bits of the result contain an EVEN number of 1s.', clearDesc: 'Cleared (0) if the lower 8 bits contain an ODD number of 1s.' },
  { bit: 1, abbr: '-', fullName: 'Unused Bit 1', type: 'unused', desc: 'Reserved bit, always undefined.', setDesc: '', clearDesc: '' },
  { bit: 0, abbr: 'CF', fullName: 'Carry Flag', type: 'status', desc: 'Indicates carry out of the MSB in unsigned arithmetic.', setDesc: 'Set (1) if an addition results in a carry, or a subtraction results in a borrow from MSB.', clearDesc: 'Cleared (0) if no carry or borrow occurred.' }
];

interface RegisterInfo {
  name: string;
  type: 'general' | 'segment' | 'pointer' | 'flag';
  typeName: string;
  size: string;
  highLowSplit?: string;
  defaultSegment?: string;
  role: string;
  details: string;
  exampleUse: string;
}

const registerCategories: { key: 'general' | 'segment' | 'pointer' | 'flag'; title: string; count: string; color: string; desc: string }[] = [
  { key: 'general', title: '1. General Data Registers', count: '4 Registers (AX, BX, CX, DX)', color: 'bg-indigo-50 border-indigo-200 text-indigo-900', desc: '16-bit EU registers for arithmetic, logic & data. Can be split into two 8-bit high/low registers (AH/AL, BH/BL, CH/CL, DH/DL).' },
  { key: 'segment', title: '2. Segment Registers', count: '4 Registers (CS, DS, SS, ES)', color: 'bg-emerald-50 border-emerald-200 text-emerald-900', desc: '16-bit BIU registers holding segment base addresses in 1 MB memory space. Form physical addresses with offset pointers.' },
  { key: 'pointer', title: '3. Pointer & Index Registers', count: '5 Registers (IP, SP, BP, SI, DI)', color: 'bg-amber-50 border-amber-200 text-amber-900', desc: '16-bit registers holding memory offset addresses for instructions, stack operations, and string source/destination indexing.' },
  { key: 'flag', title: '4. Special / Flag Register', count: '1 Register (16-bit FLAGS)', color: 'bg-purple-50 border-purple-200 text-purple-900', desc: 'Contains 9 active condition flags (6 Status flags updated by ALU and 3 Control flags set by software).' }
];

const registerDetailsList: RegisterInfo[] = [
  // General Purpose Registers
  {
    name: 'AX',
    type: 'general',
    typeName: 'General Data Register (Accumulator)',
    size: '16-bit (Split into AH & AL)',
    highLowSplit: 'AH (Bits 15-8) | AL (Bits 7-0)',
    role: 'Primary Accumulator for arithmetic, logic, I/O operations, and multiplication/division results.',
    details: 'Preferred register for arithmetic (ADD, SUB, MUL, DIV) and word/byte I/O port data transfers (IN, OUT).',
    exampleUse: 'MOV AX, 1234H ; AH = 12H, AL = 34H'
  },
  {
    name: 'BX',
    type: 'general',
    typeName: 'General Data Register (Base Register)',
    size: '16-bit (Split into BH & BL)',
    highLowSplit: 'BH (Bits 15-8) | BL (Bits 7-0)',
    role: 'Base Pointer Register for memory indirect addressing and lookup tables.',
    details: 'Serves as an offset address pointer in indirect memory addressing modes (e.g. [BX] or [BX + SI]). Default segment is Data Segment (DS).',
    exampleUse: 'MOV AL, [BX] ; Reads byte from DS:BX'
  },
  {
    name: 'CX',
    type: 'general',
    typeName: 'General Data Register (Count Register)',
    size: '16-bit (Split into CH & CL)',
    highLowSplit: 'CH (Bits 15-8) | CL (Bits 7-0)',
    role: 'Default Loop and Shift/Rotate Counter.',
    details: 'Used automatically as loop counter by LOOP instructions and bit shift count holder by CL in multi-bit shifts (e.g. SHL AX, CL).',
    exampleUse: 'MOV CX, 0005H \nL1: LOOP L1 ; Decrements CX automatically'
  },
  {
    name: 'DX',
    type: 'general',
    typeName: 'General Data Register (Data Register)',
    size: '16-bit (Split into DH & DL)',
    highLowSplit: 'DH (Bits 15-8) | DL (Bits 7-0)',
    role: 'Data & I/O Port Address Register.',
    details: 'Holds upper 16 bits of 32-bit product/dividend in 16-bit MUL/DIV. Also holds port addresses above 255 (FFH) for variable I/O instructions.',
    exampleUse: 'MOV DX, 03F8H \nIN AL, DX ; Reads from 16-bit I/O port address'
  },

  // Segment Registers
  {
    name: 'CS',
    type: 'segment',
    typeName: 'Code Segment Register',
    size: '16-bit',
    role: 'Holds base address of 64 KB Code Segment containing executable program instructions.',
    details: 'Automatically paired with Instruction Pointer (IP) to form 20-bit physical code address: Physical Address = CS × 16 + IP.',
    exampleUse: 'CS = 1000H, IP = 0020H -> Physical Address = 10020H'
  },
  {
    name: 'DS',
    type: 'segment',
    typeName: 'Data Segment Register',
    size: '16-bit',
    role: 'Holds base address of 64 KB Data Segment storing global variables and program data.',
    details: 'Default segment register for memory data accesses using BX, SI, DI, or direct displacement.',
    exampleUse: 'DS = 2000H, BX = 0100H -> Physical Address = 20100H'
  },
  {
    name: 'SS',
    type: 'segment',
    typeName: 'Stack Segment Register',
    size: '16-bit',
    role: 'Holds base address of 64 KB Stack Segment storing stack frames, local variables, and return addresses.',
    details: 'Paired with Stack Pointer (SP) or Base Pointer (BP) for push, pop, call, and stack offset operations.',
    exampleUse: 'SS = 3000H, SP = 0100H -> Physical Address = 30100H'
  },
  {
    name: 'ES',
    type: 'segment',
    typeName: 'Extra Segment Register',
    size: '16-bit',
    role: 'Holds base address of 64 KB Extra Data Segment for string destination operations and extra storage.',
    details: 'Used automatically as destination segment by string instructions (MOVS, STOS) paired strictly with DI register.',
    exampleUse: 'ES = 4000H, DI = 0050H -> Destination Physical Address = 40050H'
  },

  // Pointer & Index Registers
  {
    name: 'IP',
    type: 'pointer',
    typeName: 'Instruction Pointer',
    size: '16-bit',
    defaultSegment: 'CS (Code Segment)',
    role: 'Contains offset address of next instruction byte to be fetched from Code Segment.',
    details: 'Cannot be written directly by MOV; updated automatically by CPU instruction execution, jumps (JMP, JZ), and calls (CALL).',
    exampleUse: 'JMP 0100H ; Updates IP to 0100H'
  },
  {
    name: 'SP',
    type: 'pointer',
    typeName: 'Stack Pointer',
    size: '16-bit',
    defaultSegment: 'SS (Stack Segment)',
    role: 'Points to current top offset of active stack in Stack Segment.',
    details: 'Auto-decremented by 2 during PUSH and CALL; auto-incremented by 2 during POP and RET.',
    exampleUse: 'PUSH AX ; SP = SP - 2'
  },
  {
    name: 'BP',
    type: 'pointer',
    typeName: 'Base Pointer',
    size: '16-bit',
    defaultSegment: 'SS (Stack Segment)',
    role: 'Points to base offset of stack frame for accessing subroutine parameters and local variables.',
    details: 'Used by high-level languages to pass arguments on stack without modifying top Stack Pointer (SP).',
    exampleUse: 'MOV AX, [BP+4] ; Reads function parameter from stack'
  },
  {
    name: 'SI',
    type: 'pointer',
    typeName: 'Source Index',
    size: '16-bit',
    defaultSegment: 'DS (Data Segment)',
    role: 'Source offset pointer for array indexing and string operations.',
    details: 'Auto-incremented or decremented by string instructions (LODSB, MOVSB) depending on Direction Flag (DF).',
    exampleUse: 'MOV AL, [SI] ; Reads byte from DS:SI'
  },
  {
    name: 'DI',
    type: 'pointer',
    typeName: 'Destination Index',
    size: '16-bit',
    defaultSegment: 'ES (Extra Segment)',
    role: 'Destination offset pointer for array indexing and string operations.',
    details: 'Always defaults strictly to Extra Segment (ES) during string primitive executions (STOSB, MOVSB).',
    exampleUse: 'STOSB ; Writes AL to ES:DI'
  },

  // Flag Register
  {
    name: 'FLAGS',
    type: 'flag',
    typeName: '16-Bit Flag Register (PSW)',
    size: '16-bit (9 Active Flags)',
    role: 'Holds CPU status flags (CF, PF, AF, ZF, SF, OF) and control flags (TF, IF, DF).',
    details: '6 Status Flags reflect mathematical ALU results; 3 Control Flags configure CPU execution modes (Interrupts, Single-step, String direction).',
    exampleUse: 'LAHF / SAHF ; Load / Store AH from low byte of flags'
  }
];

// Helper to compute 8-bit addition & flags bit-by-bit
function computeAlu8Bit(valA: number, valB: number) {
  const bitsA: number[] = [];
  const bitsB: number[] = [];
  for (let i = 0; i < 8; i++) {
    bitsA.push((valA >> i) & 1);
    bitsB.push((valB >> i) & 1);
  }

  const cIn: number[] = [0];
  const cOut: number[] = [];
  const sum: number[] = [];

  for (let i = 0; i < 8; i++) {
    const s = bitsA[i] ^ bitsB[i] ^ cIn[i];
    const co = (bitsA[i] & bitsB[i]) | (cIn[i] & (bitsA[i] ^ bitsB[i]));
    sum.push(s);
    cOut.push(co);
    cIn.push(co);
  }

  const af = cOut[3]; // Carry from bit 3 to bit 4
  const cf = cOut[7]; // Carry out of MSB (bit 7)
  const of = cIn[7] ^ cOut[7]; // Carry into MSB XOR Carry out of MSB
  const sf = sum[7]; // MSB of sum
  const res8 = (valA + valB) & 0xff;
  const zf = res8 === 0 ? 1 : 0;

  const onesCount = sum.filter(b => b === 1).length;
  const pf = onesCount % 2 === 0 ? 1 : 0; // Even parity

  return {
    bitsA,
    bitsB,
    cIn,
    cOut,
    sum,
    res8,
    onesCount,
    flags: { AF: af, CF: cf, OF: of, SF: sf, ZF: zf, PF: pf }
  };
}

export default function FlagRegisterSimulator() {
  const [viewMode, setViewMode] = useState<'types' | 'flags' | 'disambiguator'>('disambiguator');
  const [selectedCategory, setSelectedCategory] = useState<'general' | 'segment' | 'pointer' | 'flag'>('general');
  const [selectedRegName, setSelectedRegName] = useState<string>('AX');

  // Flags simulator states
  const [selectedBit, setSelectedBit] = useState<number>(0);
  const [flagsState, setFlagsState] = useState<Record<string, number>>({
    CF: 0, PF: 0, AF: 0, ZF: 0, SF: 0, TF: 0, IF: 1, DF: 0, OF: 0
  });
  const [testScenario, setTestScenario] = useState<string>('custom');

  // Disambiguator ALU state
  const [aluValA, setAluValA] = useState<number>(0x08);
  const [aluValB, setAluValB] = useState<number>(0x08);
  const [activePreset, setActivePreset] = useState<string>('af-demo');

  const selectedFlag = flagsData.find(f => f.bit === selectedBit);
  const selectedReg = registerDetailsList.find(r => r.name === selectedRegName) || registerDetailsList[0];

  const aluResult = computeAlu8Bit(aluValA, aluValB);

  const toggleFlag = (abbr: string) => {
    if (abbr === '-') return;
    setFlagsState(prev => ({
      ...prev,
      [abbr]: prev[abbr] === 1 ? 0 : 1
    }));
    setTestScenario('custom');
  };

  const applyScenario = (scenario: string) => {
    setTestScenario(scenario);
    switch (scenario) {
      case 'zero-result':
        setFlagsState({ CF: 0, PF: 1, AF: 0, ZF: 1, SF: 0, TF: 0, IF: 1, DF: 0, OF: 0 });
        break;
      case 'unsigned-carry':
        setFlagsState({ CF: 1, PF: 1, AF: 1, ZF: 1, SF: 0, TF: 0, IF: 1, DF: 0, OF: 0 });
        break;
      case 'signed-overflow':
        setFlagsState({ CF: 0, PF: 1, AF: 1, ZF: 0, SF: 1, TF: 0, IF: 1, DF: 0, OF: 1 });
        break;
      case 'negative-result':
        setFlagsState({ CF: 1, PF: 0, AF: 1, ZF: 0, SF: 1, TF: 0, IF: 1, DF: 0, OF: 0 });
        break;
      case 'clear-all':
        setFlagsState({ CF: 0, PF: 0, AF: 0, ZF: 0, SF: 0, TF: 0, IF: 0, DF: 0, OF: 0 });
        break;
      default:
        break;
    }
  };

  const applyAluPreset = (preset: string) => {
    setActivePreset(preset);
    switch (preset) {
      case 'af-demo':
        // 8 + 8 = 16 (0x08 + 0x08 -> AF=1, CF=0)
        setAluValA(0x08);
        setAluValB(0x08);
        break;
      case 'of-demo':
        // 127 + 1 = 128 (0x7F + 0x01 -> OF=1, SF=1, CF=0)
        setAluValA(0x7f);
        setAluValB(0x01);
        break;
      case 'cf-demo':
        // 200 + 100 = 300 (0xC8 + 0x64 -> CF=1, OF=0)
        setAluValA(0xc8);
        setAluValB(0x64);
        break;
      case 'sf-demo':
        // 254 + 1 = 255 (0xFE + 0x01 = 0xFF -> SF=1, PF=1)
        setAluValA(0xfe);
        setAluValB(0x01);
        break;
      case 'pf-demo':
        // 1 + 2 = 3 (0x01 + 0x02 = 0x03 -> 2 ones -> PF=1)
        setAluValA(0x01);
        setAluValB(0x02);
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
      {/* Header with View Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/70 gap-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="text-sm font-bold text-slate-800 font-display">
            8086 Register Organization & Flag Disambiguator
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center p-1 bg-slate-200/70 rounded-xl gap-1 shrink-0">
          <button
            onClick={() => setViewMode('types')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'types'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. Register Types (14 Registers)</span>
          </button>

          <button
            onClick={() => setViewMode('flags')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'flags'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>2. Flag Register Bitmask (16-Bit)</span>
          </button>

          <button
            onClick={() => setViewMode('disambiguator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'disambiguator'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>3. AF, OF, SF, PF Clarified</span>
          </button>
        </div>
      </div>

      <div className="flex-1 p-5 overflow-y-auto">
        {viewMode === 'disambiguator' ? (
          /* ================= VIEW 3: FLAG DISAMBIGUATOR & BITWISE ALU ANALYZER ================= */
          <div className="space-y-6">
            {/* Top Concept Disambiguation Banner */}
            <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white p-4.5 rounded-2xl shadow-md border border-indigo-800/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    <Zap className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-display font-black text-sm text-white">
                      Flag Disambiguation Guide: AF vs OF vs SF vs PF vs CF
                    </h3>
                    <p className="text-[11.5px] text-indigo-200/90">
                      Master the distinct physical conditions that trigger each status flag in the 8086 ALU.
                    </p>
                  </div>
                </div>

                <span className="hidden md:inline-flex text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 px-2.5 py-1 rounded-full border border-indigo-400/30">
                  Interactive ALU Simulator
                </span>
              </div>

              {/* Quick Preset Selector Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-indigo-800/40">
                <span className="text-[11px] font-mono text-indigo-300 font-semibold mr-1">
                  Test Confusing Scenarios:
                </span>

                <button
                  onClick={() => applyAluPreset('af-demo')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                    activePreset === 'af-demo'
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-xs'
                      : 'bg-indigo-950/60 text-indigo-200 border-indigo-700/60 hover:bg-indigo-800/50'
                  }`}
                >
                  1. Auxiliary Carry (AF=1, CF=0)
                </button>

                <button
                  onClick={() => applyAluPreset('of-demo')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                    activePreset === 'of-demo'
                      ? 'bg-purple-400 text-slate-950 border-purple-300 shadow-xs'
                      : 'bg-indigo-950/60 text-indigo-200 border-indigo-700/60 hover:bg-indigo-800/50'
                  }`}
                >
                  2. Signed Overflow (OF=1, SF=1, CF=0)
                </button>

                <button
                  onClick={() => applyAluPreset('cf-demo')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                    activePreset === 'cf-demo'
                      ? 'bg-blue-400 text-slate-950 border-blue-300 shadow-xs'
                      : 'bg-indigo-950/60 text-indigo-200 border-indigo-700/60 hover:bg-indigo-800/50'
                  }`}
                >
                  3. Unsigned Carry (CF=1, OF=0)
                </button>

                <button
                  onClick={() => applyAluPreset('pf-demo')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                    activePreset === 'pf-demo'
                      ? 'bg-emerald-400 text-slate-950 border-emerald-300 shadow-xs'
                      : 'bg-indigo-950/60 text-indigo-200 border-indigo-700/60 hover:bg-indigo-800/50'
                  }`}
                >
                  4. Even Parity (PF=1)
                </button>
              </div>
            </div>

            {/* Interactive 8-Bit Binary ALU Addition Visualizer */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
                <div>
                  <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
                    <Binary className="w-4 h-4 text-indigo-400" />
                    8-Bit Bitwise ALU Column Addition & Carry Pathway
                  </h4>
                  <p className="text-xs text-slate-400">
                    Observe how bitwise carries propagate to set AF, CF, OF, SF, ZF, and PF.
                  </p>
                </div>

                {/* Input Controls */}
                <div className="flex items-center gap-3 font-mono text-xs">
                  <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
                    <span className="text-slate-400">A =</span>
                    <input
                      type="number"
                      min={0}
                      max={255}
                      value={aluValA}
                      onChange={(e) => {
                        setAluValA(Math.min(255, Math.max(0, parseInt(e.target.value) || 0)));
                        setActivePreset('custom');
                      }}
                      className="w-12 bg-slate-950 text-amber-300 text-center font-bold rounded border border-slate-700 px-1 py-0.5 focus:outline-hidden"
                    />
                    <span className="text-slate-500 text-[10px]">({aluValA.toString(16).toUpperCase().padStart(2, '0')}H)</span>
                  </div>

                  <span className="text-slate-400 font-bold">+</span>

                  <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
                    <span className="text-slate-400">B =</span>
                    <input
                      type="number"
                      min={0}
                      max={255}
                      value={aluValB}
                      onChange={(e) => {
                        setAluValB(Math.min(255, Math.max(0, parseInt(e.target.value) || 0)));
                        setActivePreset('custom');
                      }}
                      className="w-12 bg-slate-950 text-amber-300 text-center font-bold rounded border border-slate-700 px-1 py-0.5 focus:outline-hidden"
                    />
                    <span className="text-slate-500 text-[10px]">({aluValB.toString(16).toUpperCase().padStart(2, '0')}H)</span>
                  </div>
                </div>
              </div>

              {/* Bitwise Addition Matrix */}
              <div className="overflow-x-auto pb-2">
                <div className="min-w-[560px] space-y-2 font-mono text-xs select-none">
                  {/* Bit Index Header */}
                  <div className="grid grid-cols-10 gap-1 text-center text-[10.5px] font-bold text-slate-400">
                    <span className="col-span-1 text-left text-slate-500">Row</span>
                    <span className="col-span-1 text-blue-400">CF Out</span>
                    <span className="text-rose-400">Bit 7 (MSB)</span>
                    <span>Bit 6</span>
                    <span>Bit 5</span>
                    <span className="text-amber-400">Bit 4</span>
                    <span className="text-amber-400">Bit 3 (AF)</span>
                    <span>Bit 2</span>
                    <span>Bit 1</span>
                    <span>Bit 0 (LSB)</span>
                  </div>

                  {/* Carries Generated Row */}
                  <div className="grid grid-cols-10 gap-1 text-center items-center bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                    <span className="col-span-1 text-left font-bold text-slate-400 text-[11px]">Carries</span>
                    <span className={`py-1 rounded font-black border text-xs ${
                      aluResult.cOut[7] === 1 ? 'bg-blue-600 text-white border-blue-400 animate-pulse' : 'bg-slate-900 text-slate-600 border-slate-800'
                    }`}>
                      {aluResult.cOut[7]}
                    </span>
                    {[7, 6, 5, 4, 3, 2, 1, 0].map((bitIdx) => {
                      const carryVal = aluResult.cIn[bitIdx];
                      const isAfCarry = bitIdx === 4 && aluResult.cOut[3] === 1;
                      return (
                        <span
                          key={`c-${bitIdx}`}
                          className={`py-1 rounded font-bold border text-xs ${
                            isAfCarry
                              ? 'bg-amber-500 text-slate-950 border-amber-300 font-black animate-bounce'
                              : carryVal === 1
                                ? 'bg-indigo-900/80 text-indigo-200 border-indigo-700'
                                : 'text-slate-600 border-transparent'
                          }`}
                        >
                          {carryVal}
                        </span>
                      );
                    })}
                  </div>

                  {/* Value A Row */}
                  <div className="grid grid-cols-10 gap-1 text-center items-center">
                    <span className="col-span-2 text-left font-bold text-amber-300 text-[11px]">Val A ({aluValA})</span>
                    {[7, 6, 5, 4, 3, 2, 1, 0].map((bitIdx) => (
                      <span key={`a-${bitIdx}`} className="py-1 bg-slate-800/80 rounded border border-slate-700 font-bold text-amber-200">
                        {aluResult.bitsA[bitIdx]}
                      </span>
                    ))}
                  </div>

                  {/* Value B Row */}
                  <div className="grid grid-cols-10 gap-1 text-center items-center pb-1 border-b border-slate-800">
                    <span className="col-span-2 text-left font-bold text-amber-300 text-[11px]">+ Val B ({aluValB})</span>
                    {[7, 6, 5, 4, 3, 2, 1, 0].map((bitIdx) => (
                      <span key={`b-${bitIdx}`} className="py-1 bg-slate-800/80 rounded border border-slate-700 font-bold text-amber-200">
                        {aluResult.bitsB[bitIdx]}
                      </span>
                    ))}
                  </div>

                  {/* Result Sum Row */}
                  <div className="grid grid-cols-10 gap-1 text-center items-center bg-indigo-950/80 p-2 rounded-xl border border-indigo-800/80">
                    <span className="col-span-2 text-left font-bold text-emerald-300 text-[11px]">
                      = Result ({aluResult.res8} / {aluResult.res8.toString(16).toUpperCase().padStart(2, '0')}H)
                    </span>
                    {[7, 6, 5, 4, 3, 2, 1, 0].map((bitIdx) => {
                      const bitVal = aluResult.sum[bitIdx];
                      const isMsb = bitIdx === 7;
                      return (
                        <span
                          key={`s-${bitIdx}`}
                          className={`py-1 rounded font-black border text-xs ${
                            isMsb
                              ? bitVal === 1
                                ? 'bg-rose-600 text-white border-rose-400'
                                : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : bitVal === 1
                                ? 'bg-emerald-600/30 text-emerald-200 border-emerald-600/50'
                                : 'bg-slate-900 text-slate-500 border-slate-800'
                          }`}
                        >
                          {bitVal}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Dynamic Calculated Flags Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-2">
                {/* AF */}
                <div className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                  aluResult.flags.AF === 1
                    ? 'bg-amber-500/20 border-amber-400/60 text-amber-200'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs">AF (Aux Carry)</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                      aluResult.flags.AF === 1 ? 'bg-amber-400 text-slate-950' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {aluResult.flags.AF}
                    </span>
                  </div>
                  <p className="text-[10px] mt-1.5 leading-tight">
                    {aluResult.flags.AF === 1 ? 'Carry out of Bit 3 to Bit 4 (Lower Nibble Overflow for BCD)' : 'No carry out of Bit 3'}
                  </p>
                </div>

                {/* OF */}
                <div className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                  aluResult.flags.OF === 1
                    ? 'bg-purple-500/25 border-purple-400/60 text-purple-200'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs">OF (Overflow)</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                      aluResult.flags.OF === 1 ? 'bg-purple-400 text-slate-950' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {aluResult.flags.OF}
                    </span>
                  </div>
                  <p className="text-[10px] mt-1.5 leading-tight">
                    {aluResult.flags.OF === 1 ? 'Signed result exceeded -128..+127 range (Carry-In ≠ Carry-Out)' : 'Signed result within capacity'}
                  </p>
                </div>

                {/* SF */}
                <div className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                  aluResult.flags.SF === 1
                    ? 'bg-rose-500/25 border-rose-400/60 text-rose-200'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs">SF (Sign Flag)</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                      aluResult.flags.SF === 1 ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {aluResult.flags.SF}
                    </span>
                  </div>
                  <p className="text-[10px] mt-1.5 leading-tight">
                    {aluResult.flags.SF === 1 ? 'MSB = 1 (Negative signed interpretation)' : 'MSB = 0 (Positive/Zero)'}
                  </p>
                </div>

                {/* PF */}
                <div className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                  aluResult.flags.PF === 1
                    ? 'bg-emerald-500/25 border-emerald-400/60 text-emerald-200'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs">PF (Parity)</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                      aluResult.flags.PF === 1 ? 'bg-emerald-400 text-slate-950' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {aluResult.flags.PF}
                    </span>
                  </div>
                  <p className="text-[10px] mt-1.5 leading-tight">
                    {aluResult.flags.PF === 1 ? `EVEN parity (${aluResult.onesCount} ones in low byte)` : `ODD parity (${aluResult.onesCount} ones in low byte)`}
                  </p>
                </div>

                {/* CF */}
                <div className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                  aluResult.flags.CF === 1
                    ? 'bg-blue-500/25 border-blue-400/60 text-blue-200'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs">CF (Carry Flag)</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                      aluResult.flags.CF === 1 ? 'bg-blue-400 text-slate-950' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {aluResult.flags.CF}
                    </span>
                  </div>
                  <p className="text-[10px] mt-1.5 leading-tight">
                    {aluResult.flags.CF === 1 ? 'Unsigned overflow out of Bit 7 (MSB)' : 'No unsigned carry out of MSB'}
                  </p>
                </div>

                {/* ZF */}
                <div className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                  aluResult.flags.ZF === 1
                    ? 'bg-indigo-500/25 border-indigo-400/60 text-indigo-200'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs">ZF (Zero Flag)</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                      aluResult.flags.ZF === 1 ? 'bg-indigo-400 text-slate-950' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {aluResult.flags.ZF}
                    </span>
                  </div>
                  <p className="text-[10px] mt-1.5 leading-tight">
                    {aluResult.flags.ZF === 1 ? 'ALU Result = 0' : 'ALU Result ≠ 0'}
                  </p>
                </div>
              </div>
            </div>

            {/* 4 Detailed Comparison Cards (Side-by-Side Disambiguation) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: AF vs CF */}
              <div className="bg-white p-4.5 rounded-2xl border border-amber-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-lg font-mono font-black text-xs">
                    AF vs CF
                  </span>
                  <h4 className="font-display font-bold text-sm text-slate-900">
                    Auxiliary Carry vs. Carry Flag
                  </h4>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-100">
                    <span className="font-bold text-amber-900 font-display block mb-1">
                      🔸 Auxiliary Carry (AF) — Half-Carry / BCD
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      Measures carry out from <strong>Bit 3 to Bit 4</strong> (from the lower 4-bit nibble into the upper 4-bit nibble). Used strictly for Binary Coded Decimal (BCD) adjustments (e.g. <code>DAA</code> and <code>DAS</code> instructions).
                    </p>
                  </div>

                  <div className="p-2.5 bg-blue-50/80 rounded-xl border border-blue-100">
                    <span className="font-bold text-blue-900 font-display block mb-1">
                      🔹 Carry Flag (CF) — Full Unsigned Carry
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      Measures carry out from the <strong>Most Significant Bit (Bit 7 or Bit 15)</strong>. Indicates unsigned arithmetic overflow out of the destination register size.
                    </p>
                  </div>

                  <div className="p-2 bg-slate-900 text-amber-300 rounded-lg text-[11px] font-mono">
                    💡 <strong>Rule of Thumb:</strong> AF is inside the byte (between nibbles bit 3→4); CF is outside the byte (at the MSB edge bit 7/15).
                  </div>
                </div>
              </div>

              {/* Card 2: OF vs CF */}
              <div className="bg-white p-4.5 rounded-2xl border border-purple-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-lg font-mono font-black text-xs">
                    OF vs CF
                  </span>
                  <h4 className="font-display font-bold text-sm text-slate-900">
                    Overflow Flag vs. Carry Flag
                  </h4>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-purple-50/80 rounded-xl border border-purple-100">
                    <span className="font-bold text-purple-900 font-display block mb-1">
                      🔸 Overflow Flag (OF) — Signed Math Overflow
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      Set when signed 2's complement calculation exceeds signed limits (e.g., +127 + 1 = -128 in 8-bit). Formula: <code>Carry-In to MSB XOR Carry-Out of MSB</code>.
                    </p>
                  </div>

                  <div className="p-2.5 bg-blue-50/80 rounded-xl border border-blue-100">
                    <span className="font-bold text-blue-900 font-display block mb-1">
                      🔹 Carry Flag (CF) — Unsigned Math Overflow
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      Set when unsigned magnitude calculation exceeds register limits (e.g., 255 + 1 = 256 in 8-bit).
                    </p>
                  </div>

                  <div className="p-2 bg-slate-900 text-purple-300 rounded-lg text-[11px] font-mono">
                    💡 <strong>Rule of Thumb:</strong> Use <strong>CF</strong> for unsigned numbers (0 to 255); use <strong>OF</strong> for signed numbers (-128 to +127).
                  </div>
                </div>
              </div>

              {/* Card 3: SF vs OF */}
              <div className="bg-white p-4.5 rounded-2xl border border-rose-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <span className="px-2 py-1 bg-rose-100 text-rose-800 rounded-lg font-mono font-black text-xs">
                    SF vs OF
                  </span>
                  <h4 className="font-display font-bold text-sm text-slate-900">
                    Sign Flag vs. Overflow Flag
                  </h4>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-rose-50/80 rounded-xl border border-rose-100">
                    <span className="font-bold text-rose-900 font-display block mb-1">
                      🔸 Sign Flag (SF) — Result Sign Copy
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      Directly copies the value of the MSB bit (Bit 7 or Bit 15). If MSB = 1, SF = 1 (negative); if MSB = 0, SF = 0 (positive).
                    </p>
                  </div>

                  <div className="p-2.5 bg-purple-50/80 rounded-xl border border-purple-100">
                    <span className="font-bold text-purple-900 font-display block mb-1">
                      🔹 Overflow Flag (OF) — Math Validity Flag
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      Tells whether the calculation result is mathematically valid in signed 2's complement, or if sign bit was corrupted by arithmetic overflow.
                    </p>
                  </div>

                  <div className="p-2 bg-slate-900 text-rose-300 rounded-lg text-[11px] font-mono">
                    💡 <strong>Rule of Thumb:</strong> SF tells you if result <em>looks</em> negative (MSB=1); OF tells you if the signed math was <em>corrupted</em>.
                  </div>
                </div>
              </div>

              {/* Card 4: PF */}
              <div className="bg-white p-4.5 rounded-2xl border border-emerald-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-mono font-black text-xs">
                    PF Scope
                  </span>
                  <h4 className="font-display font-bold text-sm text-slate-900">
                    Parity Flag (PF) — Lower 8-Bit Rule
                  </h4>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-emerald-50/80 rounded-xl border border-emerald-100">
                    <span className="font-bold text-emerald-900 font-display block mb-1">
                      🔸 Lower 8-Bit Parity Inspection
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      Even in 16-bit operations, the Parity Flag inspects <strong>ONLY the lower 8 bits (low byte)</strong> of the result.
                    </p>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 font-display block mb-1">
                      🔹 EVEN Parity Logic
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      PF = 1 if the lower 8 bits contain an <strong>EVEN count of 1 bits</strong> (0, 2, 4, 6, 8 ones). PF = 0 if ODD count.
                    </p>
                  </div>

                  <div className="p-2 bg-slate-900 text-emerald-300 rounded-lg text-[11px] font-mono">
                    💡 <strong>Rule of Thumb:</strong> PF checks AL byte parity only! PF = 1 means EVEN number of ones.
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : viewMode === 'types' ? (
          /* ================= VIEW 1: REGISTER TYPES BREAKDOWN ================= */
          <div className="space-y-5">
            {/* Category Selector Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {registerCategories.map((cat) => {
                const isSelected = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => {
                      setSelectedCategory(cat.key);
                      const firstInCat = registerDetailsList.find(r => r.type === cat.key);
                      if (firstInCat) setSelectedRegName(firstInCat.name);
                    }}
                    className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? `${cat.color} ring-2 ring-indigo-500/30 shadow-xs`
                        : 'bg-slate-50/80 border-slate-200/70 text-slate-700 hover:bg-slate-100/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-display font-bold text-xs uppercase tracking-wider">{cat.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">{cat.desc}</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold mt-2 pt-2 border-t border-slate-200/50 block text-indigo-600">
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Register Selector Pills inside Category */}
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/70 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono mr-2">
                Select Register:
              </span>
              {registerDetailsList
                .filter(r => r.type === selectedCategory)
                .map(r => {
                  const isRegSelected = selectedRegName === r.name;
                  return (
                    <button
                      key={r.name}
                      onClick={() => setSelectedRegName(r.name)}
                      className={`px-3.5 py-1.5 rounded-lg font-mono font-bold text-xs transition-all cursor-pointer border ${
                        isRegSelected
                          ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs scale-102'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {r.name}
                    </button>
                  );
                })}

              {selectedCategory === 'flag' && (
                <button
                  onClick={() => setViewMode('disambiguator')}
                  className="ml-auto text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-150 cursor-pointer"
                >
                  Open Flag Disambiguator <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Selected Register Detail View Card */}
            <motion.div
              key={selectedReg.name}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-2xl font-black text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                      {selectedReg.name}
                    </span>
                    <h3 className="font-display font-bold text-lg text-slate-900">
                      {selectedReg.typeName}
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-slate-500 mt-1 block">
                    Register Size: <strong className="text-slate-800">{selectedReg.size}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                    Category: {selectedReg.type.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* General Register High / Low Byte Split Visualizer */}
              {selectedReg.highLowSplit && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    16-Bit Register Partition Structure
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-center font-mono">
                    <div className="bg-indigo-100/70 border border-indigo-200 p-2.5 rounded-lg">
                      <span className="text-xs font-bold text-indigo-900 block">{selectedReg.name.charAt(0)}H (High Byte)</span>
                      <span className="text-[10px] text-indigo-600 block mt-0.5">Bits 15 - 8 (8 Bits)</span>
                    </div>
                    <div className="bg-emerald-100/70 border border-emerald-200 p-2.5 rounded-lg">
                      <span className="text-xs font-bold text-emerald-900 block">{selectedReg.name.charAt(0)}L (Low Byte)</span>
                      <span className="text-[10px] text-emerald-600 block mt-0.5">Bits 7 - 0 (8 Bits)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Role and Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                  <span className="font-bold text-slate-700 font-display block">Primary Role & Function</span>
                  <p className="text-slate-600 leading-relaxed">{selectedReg.role}</p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                  <span className="font-bold text-slate-700 font-display block">Hardware & Architectural Behavior</span>
                  <p className="text-slate-600 leading-relaxed">{selectedReg.details}</p>
                </div>
              </div>

              {/* Code Example Snippet */}
              <div className="bg-slate-900 text-indigo-300 p-3.5 rounded-xl font-mono text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                  <Hash className="w-3 h-3 text-indigo-400" />
                  Typical Assembly Instruction Usage:
                </span>
                <pre className="text-amber-300 font-semibold whitespace-pre-wrap">{selectedReg.exampleUse}</pre>
              </div>
            </motion.div>
          </div>
        ) : (
          /* ================= VIEW 2: FLAG REGISTER 16-BIT BITMASK ================= */
          <div className="space-y-5">
            <div className="bg-slate-50 text-slate-800 rounded-xl p-4 border border-slate-200/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-mono tracking-wider text-slate-500">16-Bit Flag Register Layout</span>
                <button
                  onClick={() => applyScenario('clear-all')}
                  className="text-xs flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-all font-medium cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset Flags
                </button>
              </div>

              <div className="grid gap-1 md:gap-1.5 text-center" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
                {flagsData.map(f => {
                  const isActive = f.abbr !== '-';
                  const value = isActive ? flagsState[f.abbr] : 0;
                  const isSelected = f.bit === selectedBit;

                  return (
                    <div key={f.bit} className="flex flex-col items-center">
                      <span className="text-xs font-mono text-slate-400 block mb-1">{f.bit}</span>
                      <button
                        onClick={() => {
                          setSelectedBit(f.bit);
                          if (isActive) toggleFlag(f.abbr);
                        }}
                        className={`w-full aspect-square flex items-center justify-center font-mono rounded-md border text-sm font-bold transition-all cursor-pointer ${
                          isActive
                            ? value === 1
                              ? isSelected
                                ? 'bg-indigo-600 text-white border-indigo-400 shadow-xs scale-105'
                                : 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-500 shadow-2xs'
                              : isSelected
                                ? 'bg-white text-slate-800 border-indigo-600 scale-105 shadow-xs'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-800 shadow-2xs'
                            : 'bg-slate-100 text-slate-300 border-slate-200/50 cursor-not-allowed opacity-40'
                        }`}
                      >
                        {isActive ? value : 'U'}
                      </button>
                      <span className={`text-xs font-mono mt-1 font-semibold ${
                        isActive
                          ? value === 1 ? 'text-indigo-600' : 'text-slate-400'
                          : 'text-slate-300'
                      }`}>
                        {f.abbr}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Flag Detail Card */}
            <div className="w-full bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
              {selectedFlag ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display font-bold text-lg text-slate-800">
                        {selectedFlag.fullName}
                      </h4>
                      <span className={`text-xs uppercase font-mono px-2 py-0.5 rounded-full font-bold inline-block ${
                        selectedFlag.type === 'status' ? 'bg-blue-100 text-blue-800' :
                        selectedFlag.type === 'control' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-200 text-slate-600'
                      }`}>
                        {selectedFlag.type} flag
                      </span>
                    </div>
                    <span className="font-mono text-2xl font-bold text-slate-300">
                      Bit {selectedFlag.bit}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3 space-y-3">
                    <p className="text-slate-600 text-xs">
                      {selectedFlag.desc}
                    </p>

                    {selectedFlag.type !== 'unused' && (
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                          <span className="font-mono font-bold text-indigo-600 block mb-0.5">Bit = 1</span>
                          <p className="text-slate-500 text-xs leading-relaxed">{selectedFlag.setDesc}</p>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                          <span className="font-mono font-bold text-slate-400 block mb-0.5">Bit = 0</span>
                          <p className="text-slate-500 text-xs leading-relaxed">{selectedFlag.clearDesc}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400">
                  <HelpCircle className="w-8 h-8 mx-auto mb-1 opacity-50" />
                  <p className="text-xs">Select any bit in the register above to study its detailed function.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
