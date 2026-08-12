import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layers, 
  ArrowRight, 
  ArrowDown, 
  ArrowUpDown, 
  Cpu, 
  HelpCircle, 
  Layers3, 
  Shuffle, 
  BookOpen, 
  Info,
  Binary,
  Settings
} from 'lucide-react';

interface RegisterDef {
  name: string;
  fullName: string;
  unit: 'BIU' | 'EU';
  type: 'segment' | 'general' | 'pointer' | 'index' | 'special';
  desc: string;
}

const registers: RegisterDef[] = [
  // BIU
  { name: 'CS', fullName: 'Code Segment Register (16-bit)', unit: 'BIU', type: 'segment', desc: 'Points to the starting address of the Code Segment containing program instructions.' },
  { name: 'DS', fullName: 'Data Segment Register (16-bit)', unit: 'BIU', type: 'segment', desc: 'Points to the segment storing program variables and static data.' },
  { name: 'SS', fullName: 'Stack Segment Register (16-bit)', unit: 'BIU', type: 'segment', desc: 'Points to the Stack Segment, used for dynamic subroutine storage and temporary values.' },
  { name: 'ES', fullName: 'Extra Segment Register (16-bit)', unit: 'BIU', type: 'segment', desc: 'An additional data segment register, frequently used in string memory operations.' },
  { name: 'IP', fullName: 'Instruction Pointer (16-bit)', unit: 'BIU', type: 'special', desc: 'Stores the offset address of the next instruction to be fetched and executed by the BIU.' },
  
  // EU
  { name: 'AX', fullName: 'Accumulator Register (16-bit)', unit: 'EU', type: 'general', desc: 'Primary general purpose register. Used for input/output, arithmetic operations, and fast multiplication/division.' },
  { name: 'BX', fullName: 'Base Register (16-bit)', unit: 'EU', type: 'general', desc: 'General register. Frequently holds memory offset pointers for indexed addressing modes.' },
  { name: 'CX', fullName: 'Count Register (16-bit)', unit: 'EU', type: 'general', desc: 'General register. Acts as an automatic counter for loops (LOOP instruction) and bit-shifts.' },
  { name: 'DX', fullName: 'Data Register (16-bit)', unit: 'EU', type: 'general', desc: 'General register. Holds I/O port addresses, or high 16-bits of product/dividend during multiplication/division.' },
  { name: 'SP', fullName: 'Stack Pointer (16-bit)', unit: 'EU', type: 'pointer', desc: 'Holds the offset address of the current top-of-stack. Auto-decrements during PUSH, increments during POP.' },
  { name: 'BP', fullName: 'Base Pointer (16-bit)', unit: 'EU', type: 'pointer', desc: 'Holds memory offset pointers. Typically used to access parameters passed on the stack during function calls.' },
  { name: 'SI', fullName: 'Source Index (16-bit)', unit: 'EU', type: 'index', desc: 'Holds source memory pointers. Heavily utilized in fast string data copy and manipulation operations.' },
  { name: 'DI', fullName: 'Destination Index (16-bit)', unit: 'EU', type: 'index', desc: 'Holds destination memory pointers. Frequently paired with SI for string operations.' }
];

interface BlockDetail {
  title: string;
  unit: 'BIU' | 'EU' | 'SYSTEM';
  subtitle: string;
  desc: string;
  details: string[];
}

const blockDetails: Record<string, BlockDetail> = {
  CS: {
    title: 'CS (Code Segment Register)',
    unit: 'BIU',
    subtitle: '16-bit Segment Pointer',
    desc: 'Points to the starting base address of the 64KB Code Segment where program instructions are stored.',
    details: [
      'Paired with Instruction Pointer (IP) to generate the 20-bit physical address.',
      'Automatically updated during far JMP, far CALL, and hardware/software interrupts.',
      'Acts as the foundation for the 8086 prefetching mechanism.'
    ]
  },
  DS: {
    title: 'DS (Data Segment Register)',
    unit: 'BIU',
    subtitle: '16-bit Segment Pointer',
    desc: 'Points to the default 64KB Data Segment storing program variables, static data structures, and memory operands.',
    details: [
      'Used as the default segment register for standard data movement instructions.',
      'Offset addresses are typically supplied by general or index registers like BX, DI, or SI.',
      'Can be overridden using a segment prefix (e.g., MOV AX, ES:[BX]).'
    ]
  },
  SS: {
    title: 'SS (Stack Segment Register)',
    unit: 'BIU',
    subtitle: '16-bit Segment Pointer',
    desc: 'Points to the 64KB Stack Segment allocated for subroutine return addresses, processor flags, and parameter passing.',
    details: [
      'Automatically referenced by stack instructions (PUSH, POP, CALL, RET).',
      'Paired with Stack Pointer (SP) or Base Pointer (BP) to compute the actual address.',
      'Critical for managing multi-level interrupt execution and context nesting.'
    ]
  },
  ES: {
    title: 'ES (Extra Segment Register)',
    unit: 'BIU',
    subtitle: '16-bit Segment Pointer',
    desc: 'Points to an auxiliary 64KB Extra Segment used extensively for temporary storage and high-speed string movements.',
    details: [
      'Strictly paired with Destination Index (DI) register for string-manipulation instructions (MOVS, CMPS, STOS).',
      'Allows memory transfers across different segments without swapping the DS register value.'
    ]
  },
  IP: {
    title: 'IP (Instruction Pointer)',
    unit: 'BIU',
    subtitle: '16-bit Offset Pointer',
    desc: 'Contains the offset address of the next instruction byte to be fetched from the current Code Segment (CS).',
    details: [
      'Automatically incremented as the Bus Interface Unit (BIU) fetches instruction bytes.',
      'Directly altered by jump, control transfer, loop, and call instructions.',
      'Cannot be directly read or written to by standard computational commands.'
    ]
  },
  AX: {
    title: 'AX (Accumulator Register)',
    unit: 'EU',
    subtitle: '16-bit General Purpose',
    desc: 'The primary general-purpose accumulator. Can be accessed as a 16-bit register (AX) or split into AH (High Byte) and AL (Low Byte).',
    details: [
      'AL is the default accumulator for 8-bit operations; AX for 16-bit operations.',
      'Heavily optimized for logical, arithmetic, direct input/output (IN/OUT), and fast multiply/divide instructions.'
    ]
  },
  BX: {
    title: 'BX (Base Register)',
    unit: 'EU',
    subtitle: '16-bit General Purpose & Base Pointer',
    desc: 'Can be accessed as 16-bit (BX) or as separate bytes BH and BL. Often holds base offset pointers for memory addressing.',
    details: [
      'The only general-purpose data register that can be used as an index pointer inside brackets for memory access (e.g., [BX + SI]).',
      'Serves as a reliable translation lookup base in XLAT instructions.'
    ]
  },
  CX: {
    title: 'CX (Count Register)',
    unit: 'EU',
    subtitle: '16-bit General Purpose & Loop Counter',
    desc: 'Can be split into CH and CL. Serves as the primary software loop and shift counter.',
    details: [
      'LOOP instructions automatically decrement CX and branch if CX is non-zero.',
      'CL is specifically used to hold count parameters for multiple-bit shifts or rotations (e.g., SHR AX, CL).'
    ]
  },
  DX: {
    title: 'DX (Data Register)',
    unit: 'EU',
    subtitle: '16-bit General Purpose',
    desc: 'Can be split into DH and DL. Frequently used to hold auxiliary calculation variables and port addresses.',
    details: [
      'Holds the high 16-bits of products during 32-bit multiplication (paired with AX).',
      'Required to hold 16-bit port addresses for indirect I/O commands (e.g., IN AL, DX).'
    ]
  },
  SP: {
    title: 'SP (Stack Pointer)',
    unit: 'EU',
    subtitle: '16-bit Stack Offset Pointer',
    desc: 'Maintains the offset address of the active top-of-stack inside the Stack Segment (SS).',
    details: [
      'Decrements by 2 during PUSH operations as the stack grows downwards.',
      'Increments by 2 during POP operations as elements are retrieved.'
    ]
  },
  BP: {
    title: 'BP (Base Pointer)',
    unit: 'EU',
    subtitle: '16-bit Stack Frame Pointer',
    desc: 'Used to reference variables and parameters residing on the stack segment without disturbing the Stack Pointer.',
    details: [
      'By default, any memory addressing calculation using BP resolves against the Stack Segment (SS) (e.g., [BP + 4]).',
      'Indispensable for implementing compiler stack frames for recursive high-level function calls.'
    ]
  },
  SI: {
    title: 'SI (Source Index)',
    unit: 'EU',
    subtitle: '16-bit Index Register',
    desc: 'Maintains source offset pointers for indexed addressing modes and block string operations.',
    details: [
      'Points to the source string memory block during block instructions (e.g., MOVSB).',
      'Resolves against the Data Segment (DS) register by default.',
      'Auto-updates (increments or decrements) in string operations.'
    ]
  },
  DI: {
    title: 'DI (Destination Index)',
    unit: 'EU',
    subtitle: '16-bit Index Register',
    desc: 'Maintains destination offset pointers for indexed addressing modes and block string operations.',
    details: [
      'Points strictly to the destination memory block in Extra Segment (ES) during block operations.',
      'Bypasses segment overrides to ensure safe destination writing during block loops.'
    ]
  },
  ADDER: {
    title: 'Σ (20-Bit Address Generation Adder)',
    unit: 'BIU',
    subtitle: 'Physical Memory Address Calculator',
    desc: 'The dedicated math hardware block in the Bus Interface Unit that maps 16-bit segment values and 16-bit offset pointers to the 1MB physical memory layout.',
    details: [
      'Calculates physical address: (Segment Register × 16) + Offset Address.',
      'Formula: Segment << 4 + Offset (e.g., CS = 2000H, IP = 0100H ⇒ Physical = 20100H).',
      'Performs calculation in hardware instantly without locking the main execution unit, minimizing memory latencies.'
    ]
  },
  BUS_INTERFACE: {
    title: 'Memory Address & Data Bus Interface',
    unit: 'BIU',
    subtitle: 'System Bus Bridge',
    desc: 'The physical hardware driver that translates internal processor operations into signals flowing over external system address and data lines.',
    details: [
      'Drives the multiplexed 20-bit address bus lines (A16/S3 - A19/S6) and 16-bit data bus lines (AD0 - AD15).',
      'Coordinates memory read/write cycles and peripheral I/O port command channels.',
      'Automatically handles instruction prefetch requests to keep the execution queue populated.'
    ]
  },
  QUEUE: {
    title: '6-Byte Instruction Stream Queue',
    unit: 'BIU',
    subtitle: 'FIFO Pipelining Buffer',
    desc: 'A 6-byte First-In-First-Out (FIFO) buffer that pre-fetches instruction code bytes from memory when the external system bus is idle.',
    details: [
      'Implements "Pipelining" — fetching consecutive instruction bytes while the EU executes the current instruction.',
      'Saves up to 100% of instruction fetch times during linear program execution flow.',
      'Instantly flushed (cleared) if a branch, jump, call, or interrupt forces execution to a non-consecutive address.'
    ]
  },
  ALU: {
    title: 'Arithmetic Logic Unit (ALU)',
    unit: 'EU',
    subtitle: '16-bit High-Speed Computational Core',
    desc: 'The execution core of the 8086 processor. Conducts all logic computations and arithmetic calculations on operands.',
    details: [
      'Directly executes addition, subtraction, division, multiplication, AND, OR, XOR, and bit rotations.',
      'Supports both 8-bit and 16-bit register or memory operands.',
      'Feeds results back to target registers and status flags concurrently.'
    ]
  },
  FLAGS: {
    title: 'Flags Register & Operand Buffers',
    unit: 'EU',
    subtitle: 'Processor Status & Operand Registers',
    desc: 'Maintains status indicators (ZF, CF, SF, OF, PF, AF) and control parameters (DF, IF, TF) reflecting active ALU results, paired with temporary operand registers.',
    details: [
      'Status flags are dynamically checked by conditional jump instructions (e.g., JZ, JC).',
      'Operand registers temporarily hold inputs during ALU computation loops, preserving values while instructions complete.'
    ]
  },
  CONTROL_SYSTEM: {
    title: 'Internal Control System & Decoder',
    unit: 'EU',
    subtitle: 'CPU Command Center',
    desc: 'The master coordination system of the Execution Unit. Pops opcode bytes from the Instruction Queue and translates them into control lines.',
    details: [
      'Decodes instruction bytes pulled from Stage 1 of the queue.',
      'Drives the internal A-Bus routing and controls register read/write lines.',
      'Coordinates clock timings to match instruction execution speeds.'
    ]
  },
  ABUS: {
    title: 'Execution Unit A-Bus',
    unit: 'EU',
    subtitle: 'Internal Data highway',
    desc: 'The 16-bit internal data bus of the Execution Unit. Transports operands between registers, the ALU, and temporary buffers.',
    details: [
      'Provides high-speed parallel routing across general registers and pointer registers.',
      'Connects general and index registers directly to ALU inputs and outputs.'
    ]
  }
};

export default function ArchitectureExplorer() {
  const [activeUnit, setActiveUnit] = useState<'all' | 'BIU' | 'EU'>('all');
  const [selectedBlockId, setSelectedBlockId] = useState<string>('AX');
  
  // Register splitting playground state
  const [regValue, setRegValue] = useState<string>('ABCD');
  const [lhTarget, setLhTarget] = useState<'AX' | 'BX' | 'CX' | 'DX'>('AX');

  const [flagsState, setFlagsState] = useState({
    CF: false, // Carry Flag
    PF: true,  // Parity Flag
    AF: false, // Auxiliary Carry Flag
    ZF: true,  // Zero Flag
    SF: false, // Sign Flag
    TF: false, // Trap Flag
    IF: true,  // Interrupt Enable Flag
    DF: false, // Direction Flag
    OF: false, // Overflow Flag
  });

  const [alInput, setAlInput] = useState<string>('7F');
  const [blInput, setBlInput] = useState<string>('01');
  const [aluOp, setAluOp] = useState<'ADD' | 'SUB' | 'AND' | 'OR' | 'XOR'>('ADD');
  const [aluResultStr, setAluResultStr] = useState<string>('80h');
  const [aluExplanation, setAluExplanation] = useState<string>(
    'Adding 7Fh (127) and 01h (1) results in 80h (128). In 8-bit signed representation, 80h is -128 (Overflow occurred because adding two positive numbers yielded a negative result!). Zero Flag (ZF) is 0 because the result is non-zero. Sign Flag (SF) is 1 because the MSB (bit 7) is 1.'
  );

  const computeParity = (val: number) => {
    let count = 0;
    let temp = val & 0xFF;
    while (temp > 0) {
      if (temp & 1) count++;
      temp >>= 1;
    }
    return count % 2 === 0;
  };

  const handleAluSimulate = (opOverride?: 'ADD' | 'SUB' | 'AND' | 'OR' | 'XOR', alValOverride?: string, blValOverride?: string) => {
    const op = opOverride || aluOp;
    const alStr = alValOverride !== undefined ? alValOverride : alInput;
    const blStr = blValOverride !== undefined ? blValOverride : blInput;

    const al = parseInt(alStr, 16) || 0;
    const bl = parseInt(blStr, 16) || 0;

    let res = 0;
    let cf = false;
    let pf = false;
    let af = false;
    let zf = false;
    let sf = false;
    let of = false;
    let explanation = '';

    const formatHex8 = (n: number) => {
      return (n & 0xFF).toString(16).toUpperCase().padStart(2, '0') + 'h';
    };

    if (op === 'ADD') {
      res = al + bl;
      const res8 = res & 0xFF;
      cf = res > 0xFF;
      af = ((al & 0x0F) + (bl & 0x0F)) > 0x0F;
      const alSign = (al & 0x80) !== 0;
      const blSign = (bl & 0x80) !== 0;
      const resSign = (res8 & 0x80) !== 0;
      of = (alSign === blSign) && (alSign !== resSign);
      zf = res8 === 0;
      sf = resSign;
      pf = computeParity(res8);

      explanation = `ADD: ${formatHex8(al)} + ${formatHex8(bl)} = ${formatHex8(res8)}. `;
      if (cf) explanation += 'Carry Flag (CF) is set to 1 because there is an unsigned carry-out. ';
      else explanation += 'CF is 0 (no unsigned carry). ';
      
      if (of) explanation += 'Overflow Flag (OF) is set to 1 because signed overflow occurred (adding positive numbers yielded a negative). ';
      else explanation += 'OF is 0. ';

      if (zf) explanation += 'Zero Flag (ZF) is 1. ';
      else explanation += 'ZF is 0. ';

      if (sf) explanation += 'Sign Flag (SF) is 1 (negative MSB). ';
      else explanation += 'SF is 0 (positive MSB). ';

      if (pf) explanation += 'Parity Flag (PF) is 1 (even parity). ';
      else explanation += 'PF is 0 (odd parity). ';

      if (af) explanation += 'Auxiliary Flag (AF) is 1 (half-carry).';

    } else if (op === 'SUB') {
      res = al - bl;
      const res8 = res & 0xFF;
      cf = al < bl;
      af = (al & 0x0F) < (bl & 0x0F);
      const alSign = (al & 0x80) !== 0;
      const blSign = (bl & 0x80) !== 0;
      const resSign = (res8 & 0x80) !== 0;
      of = (alSign !== blSign) && (resSign === blSign);
      zf = res8 === 0;
      sf = resSign;
      pf = computeParity(res8);

      explanation = `SUB: ${formatHex8(al)} - ${formatHex8(bl)} = ${formatHex8(res8)}. `;
      if (cf) explanation += 'Carry/Borrow Flag (CF) is 1 because AL < BL (borrow). ';
      else explanation += 'CF is 0 (no borrow). ';

      if (of) explanation += 'Overflow Flag (OF) is 1 (signed overflow). ';
      else explanation += 'OF is 0. ';

      if (zf) explanation += 'Zero Flag (ZF) is 1 (result is 0). ';
      else explanation += 'ZF is 0. ';

      if (sf) explanation += 'Sign Flag (SF) is 1 (negative). ';
      else explanation += 'SF is 0. ';

      if (pf) explanation += 'Parity Flag (PF) is 1 (even parity). ';
      else explanation += 'PF is 0. ';

      if (af) explanation += 'Auxiliary Flag (AF) is 1 (half-borrow).';

    } else {
      if (op === 'AND') res = al & bl;
      else if (op === 'OR') res = al | bl;
      else res = al ^ bl;

      const res8 = res & 0xFF;
      cf = false;
      of = false;
      af = false;
      zf = res8 === 0;
      sf = (res8 & 0x80) !== 0;
      pf = computeParity(res8);

      explanation = `${op}: ${formatHex8(al)} ${op === 'AND' ? '&' : op === 'OR' ? '|' : '^'} ${formatHex8(bl)} = ${formatHex8(res8)}. `;
      explanation += 'Logical operations clear Carry (CF) and Overflow (OF) to 0. ';
      if (zf) explanation += 'ZF is 1. ';
      if (sf) explanation += 'SF is 1. ';
      explanation += pf ? 'PF is 1 (even).' : 'PF is 0 (odd).';
    }

    setAluResultStr(formatHex8(res & 0xFF));
    setAluExplanation(explanation);
    setFlagsState(prev => ({
      ...prev,
      CF: cf,
      PF: pf,
      AF: af,
      ZF: zf,
      SF: sf,
      OF: of,
    }));
  };

  const selectedBlock = blockDetails[selectedBlockId] || blockDetails['AX'];

  const highByte = regValue.slice(0, 2) || '00';
  const lowByte = regValue.slice(2, 4) || '00';

  const selectBlockAndSync = (id: string) => {
    setSelectedBlockId(id);
    if (['AX', 'BX', 'CX', 'DX'].includes(id)) {
      setLhTarget(id as 'AX' | 'BX' | 'CX' | 'DX');
    }
  };

  const randomizeHex = () => {
    const chars = '0123456789ABCDEF';
    let val = '';
    for (let i = 0; i < 4; i++) {
      val += chars[Math.floor(Math.random() * 16)];
    }
    setRegValue(val);
  };

  const handleHexChange = (e: string) => {
    const hexOnly = e.toUpperCase().replace(/[^0-9A-F]/g, '');
    setRegValue(hexOnly);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
      {/* Unit Tab Switcher */}
      <div className="flex border-b border-slate-100 bg-slate-50/50 p-1.5">
        <button
          onClick={() => setActiveUnit('all')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeUnit === 'all' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:bg-slate-100/80'
          }`}
        >
          <Layers className="w-4 h-4" />
          Full Block Diagram
        </button>
        <button
          onClick={() => setActiveUnit('BIU')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeUnit === 'BIU' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:bg-slate-100/80'
          }`}
        >
          <Layers3 className="w-4 h-4" />
          Bus Interface Unit (BIU)
        </button>
        <button
          onClick={() => setActiveUnit('EU')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeUnit === 'EU' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:bg-slate-100/80'
          }`}
        >
          <Shuffle className="w-4 h-4" />
          Execution Unit (EU)
        </button>
      </div>

      <div className="flex-1 p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-y-auto">
        {/* Left: Beautiful High-Fidelity Interactive 8086 Internal Block Diagram */}
        <div className="lg:col-span-7 bg-slate-50/40 rounded-2xl border border-slate-100 p-5 flex flex-col justify-between min-h-[580px] bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase">8086 Internal Block Diagram (BIU &amp; EU)</span>
              <span className="text-[9px] text-indigo-600 font-mono flex items-center gap-1">
                <Info className="w-3 h-3" /> Click any block or register to inspect
              </span>
            </div>

            {/* Visual Schematic Diagram */}
            <div className="flex flex-col gap-4 relative">
              
              {/* BUS INTERFACE UNIT (BIU) CONTAINER */}
              <div className={`border-2 border-dashed rounded-2xl p-4 transition-all duration-300 relative ${
                activeUnit === 'all' || activeUnit === 'BIU'
                  ? 'border-indigo-300 bg-indigo-50/20 scale-100 opacity-100 shadow-xs'
                  : 'border-slate-100 bg-white scale-98 opacity-30 shadow-none'
              }`}>
                {/* BIU Unit Label Badge */}
                <span className="absolute -top-2.5 left-4 bg-indigo-600 text-white font-mono text-[9px] px-2 py-0.5 rounded uppercase font-bold tracking-wider leading-none">
                  BIU (Bus Interface Unit)
                </span>

                {/* External Address/Data Buses at the Top of BIU */}
                <div className="flex justify-around items-center mb-3 px-4">
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-mono font-bold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
                      Address/Status: A16/S3 - A19/S6
                    </span>
                    <ArrowDown className="w-4 h-4 text-indigo-400 mt-1 animate-pulse" />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-mono font-bold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
                      Address/Data: AD0 - AD15
                    </span>
                    <ArrowUpDown className="w-4 h-4 text-indigo-400 mt-1 animate-pulse" />
                  </div>
                </div>

                {/* Main BIU Functional Row */}
                <div className="grid grid-cols-12 gap-3 items-stretch">
                  
                  {/* Left segment of BIU Row: Segment Register & IP Stack */}
                  <div className="col-span-4 flex flex-col justify-between items-stretch">
                    <span className="text-[9px] font-mono text-slate-400 font-bold uppercase block text-center mb-1 leading-none">
                      Segment Stack
                    </span>
                    
                    <div className="flex items-stretch relative h-full">
                      {/* Vertical line representation of BIU B-Bus */}
                      <div className="w-1.5 bg-indigo-200 rounded-sm absolute left-0 top-1 bottom-1 flex items-center justify-center pointer-events-none" title="B-Bus">
                        <span className="text-[7px] font-mono font-bold text-indigo-600 rotate-270 leading-none tracking-widest whitespace-nowrap">B-BUS</span>
                      </div>

                      <div className="flex-1 flex flex-col gap-1 pl-3.5">
                        {['ES', 'CS', 'SS', 'DS', 'IP'].map(regName => {
                          const isSelected = selectedBlockId === regName;
                          return (
                            <button
                              key={regName}
                              onClick={() => selectBlockAndSync(regName)}
                              className={`py-1 text-center font-mono rounded text-xs font-bold transition-all cursor-pointer border ${
                                isSelected
                                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                                  : 'bg-white hover:bg-indigo-100 text-indigo-950 border-indigo-150'
                              }`}
                            >
                              {regName}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Center segment of BIU Row: Bus Interface & Address Adder Σ */}
                  <div className="col-span-5 flex flex-col justify-between items-center py-1 relative">
                    
                    {/* Memory Bus Interface Box */}
                    <button
                      onClick={() => selectBlockAndSync('BUS_INTERFACE')}
                      className={`w-full py-1.5 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedBlockId === 'BUS_INTERFACE'
                          ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                          : 'bg-white hover:bg-indigo-50 text-indigo-950 border-indigo-200 shadow-2xs'
                      }`}
                    >
                      <div className="font-bold text-[9px] uppercase font-mono tracking-wider text-slate-400 leading-none mb-0.5">Bus Interface</div>
                      <div className="text-[10px] font-bold">Memory Address &amp; Data Interface</div>
                    </button>

                    {/* Connection line from Interface block to Adder */}
                    <div className="w-0.5 h-3 bg-indigo-200"></div>

                    {/* 20-Bit Address Generation Adder (Σ) */}
                    <div className="w-full">
                      <svg
                        viewBox="0 0 140 50"
                        onClick={() => selectBlockAndSync('ADDER')}
                        className="w-full h-auto drop-shadow-2xs select-none cursor-pointer"
                      >
                        <polygon
                          points="20,44 120,44 100,10 40,10"
                          fill="currentColor"
                          className={`transition-colors duration-200 ${
                            selectedBlockId === 'ADDER'
                              ? 'text-indigo-600 stroke-indigo-700 fill-indigo-600'
                              : 'text-indigo-50/90 stroke-indigo-400 hover:fill-indigo-100/90'
                          } stroke-1.5`}
                        />
                        <text
                          x="70"
                          y="24"
                          textAnchor="middle"
                          className={`font-bold text-xs font-sans ${selectedBlockId === 'ADDER' ? 'fill-white' : 'fill-indigo-950'}`}
                        >
                          Σ
                        </text>
                        <text
                          x="70"
                          y="36"
                          textAnchor="middle"
                          className={`font-mono text-[8px] font-bold ${selectedBlockId === 'ADDER' ? 'fill-indigo-200' : 'fill-indigo-600/80'}`}
                        >
                          20-Bit Adder
                        </text>
                      </svg>
                    </div>

                    {/* Feedback/Bus wires overlay paths */}
                    <div className="absolute left-[20%] top-1/2 bottom-[10%] w-0.5 border-l border-dashed border-indigo-400 pointer-events-none"></div>
                  </div>

                  {/* Right segment of BIU Row: Pipelining 6-Byte Instruction Queue */}
                  <div className="col-span-3 flex flex-col justify-start items-center">
                    <span className="text-[9px] font-mono text-slate-400 font-bold uppercase block text-center mb-1 leading-none">
                      Instruction Queue
                    </span>
                    
                    <button
                      onClick={() => selectBlockAndSync('QUEUE')}
                      className={`w-full max-w-[68px] border rounded-xl overflow-hidden shadow-2xs transition-all cursor-pointer ${
                        selectedBlockId === 'QUEUE'
                          ? 'border-indigo-600 ring-2 ring-indigo-500/10'
                          : 'border-indigo-150 bg-white hover:border-indigo-300'
                      }`}
                    >
                      <div className="bg-indigo-100/60 text-indigo-950 text-[8px] font-mono font-bold text-center py-1 border-b border-indigo-100 uppercase tracking-wide leading-none">
                        FIFO Queue
                      </div>
                      <div className="flex flex-col divide-y divide-indigo-100 text-xs font-mono font-bold text-indigo-900 bg-white">
                        {[6, 5, 4, 3, 2, 1].map(num => (
                          <div
                            key={num}
                            className={`py-0.5 text-center transition-all ${
                              selectedBlockId === 'QUEUE' ? 'bg-indigo-50/50' : 'hover:bg-indigo-50/30'
                            }`}
                          >
                            Byte {num}
                          </div>
                        ))}
                      </div>
                    </button>
                    
                    <div className="text-[8px] font-mono text-indigo-500 font-bold uppercase mt-1">C-BUS ──▶</div>
                  </div>

                </div>

                {/* Horizontal data bus visual line (C-Bus) */}
                <div className="absolute right-[22%] top-[25%] left-[55%] h-0.5 border-t border-dashed border-indigo-400 pointer-events-none" title="C-Bus">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                </div>

              </div>

              {/* PIPELINE / DIVISION BOUNDARY */}
              <div className="flex items-center gap-3 px-2 py-0.5">
                <div className="flex-1 h-px border-t border-dashed border-slate-200"></div>
                <span className="font-mono text-[9px] text-slate-400 uppercase font-bold tracking-widest leading-none bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                  BIU / EU Pipeline Split
                </span>
                <div className="flex-1 h-px border-t border-dashed border-slate-200"></div>
              </div>

              {/* EXECUTION UNIT (EU) CONTAINER */}
              <div className={`border-2 border-dashed rounded-2xl p-4 transition-all duration-300 relative ${
                activeUnit === 'all' || activeUnit === 'EU'
                  ? 'border-emerald-300 bg-emerald-50/20 scale-100 opacity-100 shadow-xs'
                  : 'border-slate-100 bg-white scale-98 opacity-30 shadow-none'
              }`}>
                {/* EU Unit Label Badge */}
                <span className="absolute -top-2.5 left-4 bg-emerald-600 text-white font-mono text-[9px] px-2 py-0.5 rounded uppercase font-bold tracking-wider leading-none">
                  EU (Execution Unit)
                </span>

                {/* EU A-Bus routing backbone bar */}
                <button
                  onClick={() => selectBlockAndSync('ABUS')}
                  className={`w-full py-1.5 mb-3 rounded-lg border font-mono text-center text-[10px] font-bold tracking-wider transition-all cursor-pointer uppercase ${
                    selectedBlockId === 'ABUS'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                      : 'bg-emerald-100/50 text-emerald-950 border-emerald-200'
                  }`}
                >
                  ◀ ── Execution Unit A-Bus (Internal 16-Bit Data Path) ── ▶
                </button>

                {/* Main EU Row */}
                <div className="grid grid-cols-12 gap-3 items-stretch">
                  
                  {/* Left segment of EU Row: General, Pointer & Index Register Stack */}
                  <div className="col-span-5 flex flex-col justify-between items-stretch">
                    <span className="text-[9px] font-mono text-slate-400 font-bold uppercase block text-center mb-1 leading-none">
                      Execution Registers
                    </span>
                    
                    <div className="grid grid-cols-2 gap-1.5">
                      {/* AH/AL general registers split box */}
                      <div className="flex flex-col gap-1 border border-emerald-100 bg-white p-1 rounded-lg">
                        <span className="text-[7px] font-mono text-slate-400 text-center uppercase tracking-wide block mb-0.5">AH / AL Split</span>
                        {['AX', 'BX', 'CX', 'DX'].map(regName => {
                          const isSelected = selectedBlockId === regName;
                          return (
                            <button
                              key={regName}
                              onClick={() => selectBlockAndSync(regName)}
                              className={`py-1 px-1 border font-mono rounded text-center transition-all cursor-pointer text-xs ${
                                isSelected
                                  ? 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-xs'
                                  : 'bg-slate-50 hover:bg-emerald-50 text-emerald-900 border-emerald-100'
                              }`}
                            >
                              <div className="flex justify-between items-center px-1 text-[10px]">
                                <span className="opacity-50 text-[8px]">{regName[0]}H</span>
                                <span className="font-bold">{regName}</span>
                                <span className="opacity-50 text-[8px]">{regName[0]}L</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Stack offset / index registers box */}
                      <div className="flex flex-col gap-1 border border-emerald-100 bg-white p-1 rounded-lg">
                        <span className="text-[7px] font-mono text-slate-400 text-center uppercase tracking-wide block mb-0.5">Pointer &amp; Index</span>
                        {['SP', 'BP', 'SI', 'DI'].map(regName => {
                          const isSelected = selectedBlockId === regName;
                          return (
                            <button
                              key={regName}
                              onClick={() => selectBlockAndSync(regName)}
                              className={`py-1 px-2 border font-mono rounded text-center text-xs font-bold transition-all cursor-pointer flex-1 flex items-center justify-center ${
                                isSelected
                                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                                  : 'bg-slate-50 hover:bg-emerald-50 text-emerald-950 border-emerald-100'
                              }`}
                            >
                              {regName}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Center segment of EU Row: Control System and Decoder */}
                  <div className="col-span-3 flex flex-col justify-start items-center">
                    <span className="text-[9px] font-mono text-slate-400 font-bold uppercase block text-center mb-1 leading-none">
                      Decoder
                    </span>
                    
                    <button
                      onClick={() => selectBlockAndSync('CONTROL_SYSTEM')}
                      className={`w-full py-4 px-2 rounded-xl border text-center transition-all cursor-pointer h-full flex flex-col justify-center items-center ${
                        selectedBlockId === 'CONTROL_SYSTEM'
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                          : 'bg-white hover:bg-emerald-50 text-emerald-950 border-emerald-200'
                      }`}
                    >
                      <Cpu className="w-5 h-5 text-emerald-500 mb-1.5" />
                      <div className="font-bold text-[9px] uppercase font-mono tracking-wider text-slate-400 leading-none mb-1">Control</div>
                      <div className="text-[9.5px] font-bold leading-tight">Decoder System</div>
                    </button>
                  </div>

                  {/* Right segment of EU Row: ALU & Flags */}
                  <div className="col-span-4 flex flex-col justify-between items-center relative gap-2">
                    <span className="text-[9px] font-mono text-slate-400 font-bold uppercase block text-center mb-1 leading-none">
                      ALU Core
                    </span>
                    
                    {/* High-Fidelity ALU V-shaped SVG Block */}
                    <div className="w-full flex-1 flex items-center justify-center">
                      <svg
                        viewBox="0 0 160 100"
                        onClick={() => selectBlockAndSync('ALU')}
                        className="w-full h-auto drop-shadow-sm select-none cursor-pointer"
                      >
                        <polygon
                          points="10,10 65,10 80,35 95,10 150,10 120,90 40,90"
                          fill="currentColor"
                          className={`transition-colors duration-200 ${
                            selectedBlockId === 'ALU'
                              ? 'text-emerald-600 stroke-emerald-700 fill-emerald-600'
                              : 'text-emerald-50/90 stroke-emerald-400 hover:fill-emerald-100/90'
                          } stroke-1.5`}
                        />
                        <text
                          x="80"
                          y="56"
                          textAnchor="middle"
                          className={`font-bold text-[11px] font-sans ${selectedBlockId === 'ALU' ? 'fill-white' : 'fill-emerald-950'}`}
                        >
                          Arithmetic Logic
                        </text>
                        <text
                          x="80"
                          y="70"
                          textAnchor="middle"
                          className={`font-mono text-[9px] font-bold ${selectedBlockId === 'ALU' ? 'fill-emerald-200' : 'fill-emerald-700/80'}`}
                        >
                          Unit (16-Bit ALU)
                        </text>
                      </svg>
                    </div>

                    {/* Operands & Flags block at the bottom of EU */}
                    <button
                      onClick={() => selectBlockAndSync('FLAGS')}
                      className={`w-full py-1 px-2 rounded-lg border font-mono text-center text-[10px] font-bold transition-all cursor-pointer ${
                        selectedBlockId === 'FLAGS'
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                          : 'bg-white hover:bg-emerald-50 text-emerald-950 border-emerald-200 shadow-2xs'
                      }`}
                    >
                      Flags Register &amp; Operands
                    </button>
                  </div>

                </div>

                {/* Small indicator showing queue feed to Decoder */}
                <div className="absolute right-[24%] -top-[14%] w-0.5 h-6 border-l-2 border-dashed border-indigo-400 pointer-events-none"></div>

              </div>

            </div>
          </div>

          {/* Syllabus key point card */}
          <div className="bg-indigo-50/40 text-slate-800 p-3.5 rounded-xl border border-indigo-100 flex items-start gap-3 mt-4">
            <div className="text-xs space-y-1">
              <span className="text-indigo-600 font-bold font-mono text-[10px] uppercase block">Academic Highlight: BIU vs EU Architecture</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                The hand-drawn standard architecture splits the 8086 into the <strong>Bus Interface Unit (BIU)</strong> and the <strong>Execution Unit (EU)</strong>. This separate functional routing enables parallel operation (fetching instructions while processing math), making the 8086 the first commercial microprocessor to offer modern pipelined execution!
              </p>
            </div>
          </div>
        </div>

        {/* Right Pane: Dynamic Block Descriptions & Register Splitting Sandbox */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          
          {/* Selected Component Information Panel */}
          <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-3.5 shadow-2xs">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-display font-bold text-slate-800 text-base leading-tight">
                  {selectedBlock.title}
                </h4>
                <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold inline-block mt-1 ${
                  selectedBlock.unit === 'BIU' 
                    ? 'bg-indigo-100 text-indigo-850' 
                    : selectedBlock.unit === 'EU'
                    ? 'bg-emerald-100 text-emerald-850'
                    : 'bg-slate-100 text-slate-800'
                }`}>
                  {selectedBlock.unit} Unit Element
                </span>
              </div>
              <span className="font-mono text-xl font-bold text-slate-300">
                {selectedBlockId}
              </span>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2.5">
              <p className="text-slate-600 text-xs leading-relaxed">
                {selectedBlock.desc}
              </p>
              
              {selectedBlock.details && selectedBlock.details.length > 0 && (
                <div className="space-y-1 pt-2.5 border-t border-dashed border-slate-100">
                  <span className="text-[9px] font-mono uppercase text-slate-400 font-bold block">Internal Facts &amp; Mechanics:</span>
                  <ul className="list-disc pl-4 space-y-1.5">
                    {selectedBlock.details.map((detail, index) => (
                      <li key={index} className="text-[11px] text-slate-500 leading-normal">
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* General segment register explanation */}
              {['CS', 'DS', 'SS', 'ES'].includes(selectedBlockId) && (
                <div className="bg-indigo-50/70 border border-indigo-150 p-3 rounded-xl mt-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-xs">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <span>What are Segment Registers?</span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    Segment registers are four 16-bit registers (<strong>CS, DS, SS, ES</strong>) in the Bus Interface Unit (BIU) that hold the base address of a 64KB memory segment. Since the 8086 has a 20-bit address bus (allowing it to address 1MB of memory) but its internal registers are only 16 bits, it uses <strong>Memory Segmentation</strong>.
                  </p>
                  <div className="bg-white/80 p-2 rounded-lg border border-indigo-100 text-[10px] font-mono text-indigo-950 flex flex-col gap-0.5 leading-normal">
                    <span className="font-semibold text-slate-500 uppercase tracking-wide text-[8px]">Physical Address Formula:</span>
                    <span className="font-bold">Physical Address = (Segment Register × 10H) + Offset</span>
                    <span className="text-slate-500 text-[9px]">(Shift the segment address 4 bits to the left and add the offset pointer)</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Sandbox/Simulator Panel */}
          {selectedBlockId === 'FLAGS' || selectedBlockId === 'ALU' ? (
            /* 8086 Flags Register & ALU Interactive Decoder */
            <div className="bg-slate-50/50 border border-slate-150 rounded-xl p-4 space-y-3.5 shadow-2xs animate-in fade-in duration-150">
              <div>
                <h4 className="font-display font-semibold text-xs text-slate-800 flex justify-between items-center">
                  <span>8086 Flags Register &amp; ALU Interactive Decoder</span>
                  <span className="text-[9px] font-mono text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">PSW Register</span>
                </h4>
                <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                  The Program Status Word (PSW) stores processor state, updated instantly by ALU math operations and control lines.
                </p>
              </div>

              {/* 1. Interactive 16-Bit Register Layout */}
              <div className="border border-rose-100 rounded-xl p-3 bg-white/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-950 flex items-center gap-1">
                    <Binary className="w-3.5 h-3.5 text-rose-600" />
                    1. 16-Bit Flags Register Grid (PSW)
                  </span>
                </div>

                {/* The 16-bit Graphic Grid */}
                <div className="grid grid-cols-8 gap-1 mt-1.5">
                  {[
                    { bit: 15, name: '-', active: false },
                    { bit: 14, name: '-', active: false },
                    { bit: 13, name: '-', active: false },
                    { bit: 12, name: '-', active: false },
                    { bit: 11, name: 'OF', active: true, key: 'OF', desc: 'Overflow Flag', type: 'status' },
                    { bit: 10, name: 'DF', active: true, key: 'DF', desc: 'Direction Flag', type: 'control' },
                    { bit: 9, name: 'IF', active: true, key: 'IF', desc: 'Interrupt Enable Flag', type: 'control' },
                    { bit: 8, name: 'TF', active: true, key: 'TF', desc: 'Trap Flag', type: 'control' },
                    { bit: 7, name: 'SF', active: true, key: 'SF', desc: 'Sign Flag', type: 'status' },
                    { bit: 6, name: 'ZF', active: true, key: 'ZF', desc: 'Zero Flag', type: 'status' },
                    { bit: 5, name: '-', active: false },
                    { bit: 4, name: 'AF', active: true, key: 'AF', desc: 'Auxiliary Carry Flag', type: 'status' },
                    { bit: 3, name: '-', active: false },
                    { bit: 2, name: 'PF', active: true, key: 'PF', desc: 'Parity Flag', type: 'status' },
                    { bit: 1, name: '-', active: false },
                    { bit: 0, name: 'CF', active: true, key: 'CF', desc: 'Carry Flag', type: 'status' },
                  ].map((bitItem) => {
                    const val = bitItem.active ? (flagsState[bitItem.key as keyof typeof flagsState] ? 1 : 0) : 0;
                    const isSet = val === 1;

                    return (
                      <div
                        key={bitItem.bit}
                        className={`flex flex-col items-center justify-between border rounded p-1 transition-all text-center ${
                          bitItem.active
                            ? isSet
                              ? 'bg-rose-600 border-rose-700 text-white shadow-xs'
                              : 'bg-rose-50/50 border-rose-200 text-rose-900'
                            : 'bg-slate-50 border-slate-100 text-slate-300 opacity-50'
                        }`}
                        title={bitItem.active ? `${bitItem.name}: ${bitItem.desc}` : 'Reserved Bit'}
                      >
                        <span className="text-[7.5px] opacity-60 block font-mono font-bold leading-none mb-1">
                          {bitItem.bit}
                        </span>
                        <span className="text-[9.5px] font-bold block font-mono leading-none">
                          {bitItem.name}
                        </span>
                        <span className={`text-[8.5px] font-mono font-bold block mt-1 leading-none ${
                          bitItem.active ? (isSet ? 'text-amber-200' : 'text-rose-500') : 'text-slate-300'
                        }`}>
                          {bitItem.active ? val : '0'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Explainer box for flag types */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <div className="bg-slate-50 border border-slate-150 rounded-lg p-2 text-[10px]">
                    <span className="font-bold text-slate-800 block mb-0.5">Status Flags (CF, PF, AF, ZF, SF, OF)</span>
                    <p className="text-slate-500 text-[9px] leading-tight">
                      Modified dynamically by ALU operations to report mathematical outcomes.
                    </p>
                  </div>
                  <div className="bg-emerald-50/30 border border-emerald-100 rounded-lg p-2 text-[10px]">
                    <span className="font-bold text-emerald-800 block mb-0.5">Control Flags (DF, IF, TF)</span>
                    <p className="text-slate-500 text-[9px] leading-tight">
                      Set programmatically to steer internal CPU operations.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Control Flag Toggles / Mnemonics */}
              <div className="border border-emerald-150 rounded-xl p-3 bg-white/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                    <Settings className="w-3.5 h-3.5 text-emerald-600" />
                    2. Control Instruction Simulator (CLI, STI, CLD, STD)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* STI / CLI Interrupt Enable Flag */}
                  <div className="bg-slate-50/50 border border-slate-150 rounded-xl p-2 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-700 block">Interrupt Enable (IF):</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setFlagsState(prev => ({ ...prev, IF: true }))}
                        className={`flex-1 py-1 rounded text-[9.5px] font-mono font-bold border transition-all cursor-pointer ${
                          flagsState.IF
                            ? 'bg-emerald-600 border-emerald-700 text-white font-extrabold shadow-2xs'
                            : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                        title="STI - Set Interrupt Flag (Enable Interrupts)"
                      >
                        STI (IF=1)
                      </button>
                      <button
                        onClick={() => setFlagsState(prev => ({ ...prev, IF: false }))}
                        className={`flex-1 py-1 rounded text-[9.5px] font-mono font-bold border transition-all cursor-pointer ${
                          !flagsState.IF
                            ? 'bg-slate-800 border-slate-900 text-white font-extrabold shadow-2xs'
                            : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                        title="CLI - Clear Interrupt Flag (Disable Interrupts)"
                      >
                        CLI (IF=0)
                      </button>
                    </div>
                  </div>

                  {/* STD / CLD Direction Flag */}
                  <div className="bg-slate-50/50 border border-slate-150 rounded-xl p-2 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-700 block">Direction Flag (DF):</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setFlagsState(prev => ({ ...prev, DF: true }))}
                        className={`flex-1 py-1 rounded text-[9.5px] font-mono font-bold border transition-all cursor-pointer ${
                          flagsState.DF
                            ? 'bg-indigo-600 border-indigo-700 text-white font-extrabold shadow-2xs'
                            : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                        title="STD - Set Direction Flag (Decrementing address pointers)"
                      >
                        STD (DF=1)
                      </button>
                      <button
                        onClick={() => setFlagsState(prev => ({ ...prev, DF: false }))}
                        className={`flex-1 py-1 rounded text-[9.5px] font-mono font-bold border transition-all cursor-pointer ${
                          !flagsState.DF
                            ? 'bg-slate-800 border-slate-900 text-white font-extrabold shadow-2xs'
                            : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                        title="CLD - Clear Direction Flag (Incrementing address pointers)"
                      >
                        CLD (DF=0)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. ALU Operation Simulator & status flags */}
              <div className="border border-rose-150 rounded-xl p-3 bg-white/80 space-y-2">
                <span className="text-xs font-bold text-rose-950 block">
                  3. Interactive ALU &amp; Status Flags Sandbox
                </span>

                {/* Educational presets */}
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => {
                      setAlInput('7F');
                      setBlInput('01');
                      setAluOp('ADD');
                      handleAluSimulate('ADD', '7F', '01');
                    }}
                    className="py-1 px-1 border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-[9px] rounded transition-all cursor-pointer text-center leading-tight shadow-3xs"
                  >
                    ⚠️ Overflow (7F+01)
                  </button>
                  <button
                    onClick={() => {
                      setAlInput('FF');
                      setBlInput('01');
                      setAluOp('ADD');
                      handleAluSimulate('ADD', 'FF', '01');
                    }}
                    className="py-1 px-1 border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-950 font-bold text-[9px] rounded transition-all cursor-pointer text-center leading-tight shadow-3xs"
                  >
                    🔄 Rollover/Carry (FF+01)
                  </button>
                  <button
                    onClick={() => {
                      setAlInput('12');
                      setBlInput('12');
                      setAluOp('SUB');
                      handleAluSimulate('SUB', '12', '12');
                    }}
                    className="py-1 px-1 border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-950 font-bold text-[9px] rounded transition-all cursor-pointer text-center leading-tight shadow-3xs"
                  >
                    0️⃣ Sub to Zero (12-12)
                  </button>
                  <button
                    onClick={() => {
                      setAlInput('0B');
                      setBlInput('25');
                      setAluOp('SUB');
                      handleAluSimulate('SUB', '0B', '25');
                    }}
                    className="py-1 px-1 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-950 font-bold text-[9px] rounded transition-all cursor-pointer text-center leading-tight shadow-3xs"
                  >
                    📉 Underflow (0B-25)
                  </button>
                </div>

                {/* Dynamic Inputs form */}
                <div className="flex items-center justify-between gap-1.5 bg-slate-50 p-2 border border-slate-200 rounded-xl mt-1.5">
                  <div className="flex items-center gap-1 font-mono text-[11px]">
                    <span className="text-slate-500 font-sans text-[10px]">AL:</span>
                    <input
                      type="text"
                      value={alInput}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 2).toUpperCase();
                        setAlInput(val);
                      }}
                      className="w-8 px-1 py-0.5 border border-slate-250 bg-white rounded font-mono font-bold text-center text-[11px] text-rose-700 uppercase"
                      placeholder="7F"
                    />
                    <span className="text-slate-450">h</span>
                  </div>

                  <select
                    value={aluOp}
                    onChange={(e) => setAluOp(e.target.value as any)}
                    className="px-1 py-0.5 border border-slate-250 bg-white text-[10px] font-mono font-bold rounded focus:outline-none"
                  >
                    <option value="ADD">ADD</option>
                    <option value="SUB">SUB</option>
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                    <option value="XOR">XOR</option>
                  </select>

                  <div className="flex items-center gap-1 font-mono text-[11px]">
                    <span className="text-slate-500 font-sans text-[10px]">BL:</span>
                    <input
                      type="text"
                      value={blInput}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 2).toUpperCase();
                        setBlInput(val);
                      }}
                      className="w-8 px-1 py-0.5 border border-slate-250 bg-white rounded font-mono font-bold text-center text-[11px] text-rose-700 uppercase"
                      placeholder="01"
                    />
                    <span className="text-slate-450">h</span>
                  </div>

                  <button
                    onClick={() => handleAluSimulate()}
                    className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-[9.5px] cursor-pointer transition-all shadow-3xs flex items-center shrink-0"
                  >
                    ⚡ Execute
                  </button>
                </div>

                {/* Simulation Result Container */}
                <div className="bg-slate-900 border border-slate-950 rounded-xl p-3 text-slate-100 font-mono text-[11px] shadow-2xs mt-2 space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <div>
                      <span className="text-[7.5px] uppercase font-bold text-slate-500 block">ALU OUT</span>
                      <span className="text-base font-black text-amber-400 tracking-wide">
                        {aluResultStr}
                      </span>
                    </div>
                    <div>
                      <span className="text-[7.5px] uppercase font-bold text-slate-500 block mb-0.5">Status flags</span>
                      <div className="flex gap-0.5">
                        {['CF', 'PF', 'AF', 'ZF', 'SF', 'OF'].map((flg) => {
                          const isActive = flagsState[flg as keyof typeof flagsState];
                          return (
                            <span
                              key={flg}
                              className={`px-1 py-0.2 rounded text-[8px] font-bold ${
                                isActive ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 text-slate-500'
                              }`}
                            >
                              {flg}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="text-[9.5px] leading-relaxed text-slate-300">
                    <span className="text-[7.5px] uppercase font-bold text-slate-500 block mb-0.5">Flag Interpretation:</span>
                    {aluExplanation}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* General Register splitting simulator box */
            <div className="bg-slate-50/50 border border-slate-150 rounded-xl p-4 space-y-3 shadow-2xs animate-in fade-in duration-150">
              <div>
                <h4 className="font-display font-semibold text-xs text-slate-800 flex justify-between items-center">
                  <span>16-Bit Register Splitting Simulator</span>
                  <span className="text-[9px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">AH &amp; AL split</span>
                </h4>
                <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                  The 8086 general purpose registers (AX, BX, CX, DX) are accessed either as a single 16-bit word or as two independent 8-bit bytes (High &amp; Low).
                </p>
              </div>

              <div className="space-y-3">
                {/* Select register target */}
                <div className="flex gap-1 bg-slate-200/50 p-1 rounded-lg">
                  {(['AX', 'BX', 'CX', 'DX'] as const).map(reg => (
                    <button
                      key={reg}
                      onClick={() => setLhTarget(reg)}
                      className={`flex-1 text-[10px] font-bold font-mono py-1 rounded transition-all cursor-pointer ${
                        lhTarget === reg ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-800'
                      }`}
                    >
                      {reg}
                    </button>
                  ))}
                </div>

                {/* Hexadecimal value input */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                    <span className="px-2.5 py-1 text-xs font-mono font-bold text-slate-400 border-r border-slate-100">{lhTarget}</span>
                    <input
                      type="text"
                      maxLength={4}
                      value={regValue}
                      onChange={(e) => handleHexChange(e.target.value)}
                      className="w-full bg-transparent px-2 py-1 font-mono text-xs text-slate-800 focus:outline-none"
                      placeholder="ABCD"
                    />
                    <span className="px-2.5 text-[10px] font-mono text-slate-400">H</span>
                  </div>
                  <button
                    onClick={randomizeHex}
                    title="Randomize Hex Value"
                    className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-500 bg-white cursor-pointer"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Graphical splitting block */}
                <div className="bg-white p-3 rounded-lg border border-slate-150 font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>16-Bit Word ({lhTarget}):</span>
                    <strong className="text-slate-800 text-sm bg-slate-100 px-2 py-0.5 rounded">{regValue.padStart(4, '0')} H</strong>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-dashed border-slate-100">
                    <div className="bg-indigo-50/50 p-2 rounded border border-indigo-100 text-center">
                      <span className="text-[9px] text-slate-400 block mb-0.5 font-bold">High Byte ({lhTarget[0]}H)</span>
                      <strong className="text-indigo-800 text-base">{highByte.padStart(2, '0')} H</strong>
                    </div>
                    <div className="bg-amber-50/50 p-2 rounded border border-amber-100 text-center">
                      <span className="text-[9px] text-slate-400 block mb-0.5 font-bold">Low Byte ({lhTarget[0]}L)</span>
                      <strong className="text-amber-800 text-base">{lowByte.padStart(2, '0')} H</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
