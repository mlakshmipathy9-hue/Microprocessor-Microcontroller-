import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Sparkles
} from 'lucide-react';

interface ExampleState {
  id: string;
  title: string;
  instruction: string;
  description: string;
  inputs: { [key: string]: string };
  outputs: { [key: string]: string };
}

interface AddressingModeData {
  id: string;
  name: string;
  description: string;
  rules: string[];
  examples: ExampleState[];
}

const addressingModesData: { [key: string]: AddressingModeData } = {
  immediate: {
    id: 'immediate',
    name: 'Immediate Addressing Mode',
    description: 'The operand is an 8-bit or 16-bit constant value embedded directly inside the instruction stream.',
    rules: [
      'Perfect for initializing registers with constants.',
      'Operands reside inside the Code Segment (CS) alongside the instruction opcode.',
      'Executes quickly as no extra data segment memory accesses are needed.'
    ],
    examples: [
      {
        id: 'imm-ex1',
        title: 'Example 1: 16-Bit Immediate Move',
        instruction: 'MOV DX, 1234H',
        description: 'Moves the 16-bit constant 1234H into the 16-bit DX register.',
        inputs: { DX: 'ABCD' },
        outputs: { DX: '1234' }
      },
      {
        id: 'imm-ex2',
        title: 'Example 2: 8-Bit Immediate Move',
        instruction: 'MOV CH, 23H',
        description: 'Moves the 8-bit constant 23H into the high byte register CH.',
        inputs: { CH: '4D' },
        outputs: { CH: '23' }
      }
    ]
  },
  register: {
    id: 'register',
    name: 'Register Addressing Mode',
    description: 'The operand resides entirely inside an internal general-purpose 16-bit or 8-bit CPU register.',
    rules: [
      'Extremely fast execution because registers are internal to the processor.',
      'No memory bus cycles (reads/writes) are triggered.',
      'Both registers must be of the same size (e.g., cannot move AH to BX).'
    ],
    examples: [
      {
        id: 'reg-ex1',
        title: 'Example 1: 16-Bit Register Move',
        instruction: 'MOV CX, SI',
        description: 'Copies the 16-bit value of the Source Index register (SI) into the Count register (CX).',
        inputs: { CX: '1234', SI: '5678' },
        outputs: { CX: '5678', SI: '5678' }
      },
      {
        id: 'reg-ex2',
        title: 'Example 2: 8-Bit Register Move',
        instruction: 'MOV DL, AH',
        description: 'Copies the 8-bit value of the Accumulator High register (AH) into the Data Low register (DL).',
        inputs: { DL: '89', AH: 'BC' },
        outputs: { DL: 'BC', AH: 'BC' }
      }
    ]
  },
  direct: {
    id: 'direct',
    name: 'Direct Memory Addressing',
    description: 'The 16-bit effective memory offset address is specified directly inside brackets in the instruction.',
    rules: [
      'EA = Displacement constant specified in the instruction.',
      'Default Segment is the Data Segment (DS).',
      'Can target absolute locations or symbolic memory labels.'
    ],
    examples: [
      {
        id: 'dir-ex1',
        title: 'Example 1: 16-Bit Direct Move',
        instruction: 'MOV BX, DS:5634H',
        description: 'Copies a 16-bit word from memory offset 5634H (DS:5634H for low byte, DS:5635H for high byte) into BX.',
        inputs: { BX: 'ABCD', 'DS:5634H': '45', 'DS:5635H': '86', DS: '3000' },
        outputs: { BX: '8645', 'DS:5634H': '45', 'DS:5635H': '86' }
      },
      {
        id: 'dir-ex2',
        title: 'Example 2: 8-Bit Direct Move',
        instruction: 'MOV CL, DS:5634H',
        description: 'Copies a single 8-bit byte from memory offset 5634H into CL.',
        inputs: { CL: 'F2', 'DS:5634H': '45', DS: '3000' },
        outputs: { CL: '45', 'DS:5634H': '45' }
      },
      {
        id: 'dir-ex3',
        title: 'Example 3: Symbolic Direct Move',
        instruction: 'MOV BH, LOC',
        description: 'Moves the byte defined at memory label LOC (LOC DB 78H) inside the data segment into BH.',
        inputs: { BH: 'C5', LOC: '78', DS: '3000' },
        outputs: { BH: '78', LOC: '78' }
      }
    ]
  },
  register_indirect: {
    id: 'register_indirect',
    name: 'Register Indirect Addressing',
    description: 'The memory offset resides dynamically inside an index or base pointer register.',
    rules: [
      'Only SI, DI, and BX can be used inside brackets [ ] from memory addressing point of view.',
      'From a user point of view, BP is also possible (which defaults to the Stack Segment SS).',
      'Enables dynamic looping and sequential access to variables.'
    ],
    examples: [
      {
        id: 'ind-ex1',
        title: 'Example 1: SI Indirect Pointer',
        instruction: 'MOV CL, [SI]',
        description: 'Reads an 8-bit byte from the memory address pointed to by SI register.',
        inputs: { CL: '20', SI: '3456', 'DS:3456H': '78', DS: '2000' },
        outputs: { CL: '78', SI: '3456' }
      },
      {
        id: 'ind-ex2',
        title: 'Example 2: BX Indirect Pointer',
        instruction: 'MOV DX, [BX]',
        description: 'Reads a 16-bit word from the memory address pointed to by BX register.',
        inputs: { DX: 'F232', BX: 'A2B2', 'DS:A2B2H': '67', 'DS:A2B3H': '35', DS: '3000' },
        outputs: { DX: '3567', BX: 'A2B2' }
      },
      {
        id: 'ind-ex3',
        title: 'Example 3: DI Indirect Pointer',
        instruction: 'MOV AH, [DI]',
        description: 'Reads an 8-bit byte from the memory address pointed to by DI register.',
        inputs: { AH: '30', DI: '3400', 'DS:3400H': '86', DS: '2000' },
        outputs: { AH: '86', DI: '3400' }
      }
    ]
  },
  based_displacement: {
    id: 'based_displacement',
    name: 'Based Addressing With Displacement',
    description: 'The logical address is computed by summing a base register (BX or BP) and a constant displacement.',
    rules: [
      'Base registers can ONLY be BX or BP.',
      'If BX is used, the default segment is DS (Data Segment).',
      'If BP is used, the default segment is SS (Stack Segment).'
    ],
    examples: [
      {
        id: 'bas-ex1',
        title: 'Example 1: BX Base with 16-Bit Offset',
        instruction: 'MOV DH, 2345H[BX]',
        description: 'EA = BX + 2345H. Reads the byte at computed offset.',
        inputs: { DH: '45', BX: '4000', 'DS:6345H': '67', DS: '1000' },
        outputs: { DH: '67', BX: '4000' }
      },
      {
        id: 'bas-ex2',
        title: 'Example 2: BP Stack Pointer Base with 8-Bit Offset',
        instruction: 'MOV AX, 45H[BP]',
        description: 'EA = BP + 45H. Uses Stack Segment (SS) because BP base is used.',
        inputs: { AX: '1000', BP: '3000', 'SS:3045H': 'AB', 'SS:3046H': 'CD', SS: '5000' },
        outputs: { AX: 'CDAB', BP: '3000' }
      }
    ]
  },
  indexed_displacement: {
    id: 'indexed_displacement',
    name: 'Indexed Addressing With Displacement',
    description: 'The logical address is computed by summing an index register (SI or DI) and a constant displacement.',
    rules: [
      'Index registers can ONLY be SI or DI.',
      'The default segment register is DS.',
      'Provides 4 flexible ways of indexing array elements in data memory.'
    ],
    examples: [
      {
        id: 'idx-ex1',
        title: 'Example 1: SI Index with 16-Bit Offset',
        instruction: 'MOV CL, 2345H[SI]',
        description: 'EA = SI + 2345H. Reads a byte from the computed offset.',
        inputs: { CL: '60', SI: '6000', 'DS:8345H': '85', DS: '1000' },
        outputs: { CL: '85', SI: '6000' }
      },
      {
        id: 'idx-ex2',
        title: 'Example 2: DI Index with 8-Bit Offset',
        instruction: 'MOV DX, 37H[DI]',
        description: 'EA = DI + 37H. Reads a 16-bit word from computed offset DS:5037H.',
        inputs: { DX: '7000', DI: '5000', 'DS:5037H': 'A2', 'DS:5038H': 'B2', DS: '2000' },
        outputs: { DX: 'B2A2', DI: '5000' }
      }
    ]
  },
  based_indexed: {
    id: 'based_indexed',
    name: 'Based Indexed Addressing',
    description: 'The memory address combines a base register (BX/BP) with an index register (SI/DI).',
    rules: [
      'Must combine one Base register (BX or BP) and one Index register (SI or DI).',
      'For example, [BX][BP] is strictly INVALID because it uses two base registers.',
      'Uses SS segment if BP is selected, otherwise defaults to DS.'
    ],
    examples: [
      {
        id: 'bi-ex1',
        title: 'Example 1: BX and SI Base-Indexed',
        instruction: 'MOV CL, [SI][BX]',
        description: 'EA = BX + SI. Accesses data segment relative memory.',
        inputs: { CL: '40', SI: '2000', BX: '0300', 'DS:2300H': '67', DS: '1000' },
        outputs: { CL: '67', SI: '2000', BX: '0300' }
      },
      {
        id: 'bi-ex2',
        title: 'Example 2: BP and DI Stack Base-Indexed',
        instruction: 'MOV CX, [BP][DI]',
        description: 'EA = BP + DI. Accesses stack segment relative memory (SS used).',
        inputs: { CX: '6000', BP: '3000', DI: '0020', 'SS:3020H': '85', 'SS:3021H': '63', SS: '4000' },
        outputs: { CX: '6385', BP: '3000', DI: '0020' }
      }
    ]
  },
  based_indexed_displacement: {
    id: 'based_indexed_displacement',
    name: 'Based Indexed with Displacement',
    description: 'Summates base register, index register, and a constant displacement offset.',
    rules: [
      'Combines BX/BP + SI/DI + constant displacement.',
      'Highly flexible mode perfect for nested array matrices and struct records.',
      'Utilizes the SS segment base when BP is present, otherwise defaults to DS.'
    ],
    examples: [
      {
        id: 'bid-ex1',
        title: 'Example 1: BX + DI + 8-Bit Displacement',
        instruction: 'MOV DL, 37H[BX+DI]',
        description: 'EA = BX + DI + 37H. DS segment used.',
        inputs: { DL: '40', BX: '2000', DI: '0050', 'DS:2087H': '12', DS: '1000' },
        outputs: { DL: '12', BX: '2000', DI: '0050' }
      },
      {
        id: 'bid-ex2',
        title: 'Example 2: BP + SI + 16-Bit Displacement',
        instruction: 'MOV BX, 1234H[SI+BP]',
        description: 'EA = BP + SI + 1234H. SS segment used.',
        inputs: { BX: '3000', SI: '4000', BP: '0020', 'SS:5254H': '65', 'SS:5255H': '36', SS: '2000' },
        outputs: { BX: '3665', SI: '4000', BP: '0020' }
      }
    ]
  },
  fixed_port: {
    id: 'fixed_port',
    name: 'Fixed Port Addressing',
    description: 'I/O instruction directly embeds an 8-bit port address (range 00H to FFH).',
    rules: [
      'Only AL (8-bit) or AX (16-bit) registers can be used to send/receive I/O data.',
      'Port address is directly encoded inside the machine opcode bytes.',
      'Restricted to the first 256 physical port channels.'
    ],
    examples: [
      {
        id: 'fix-ex1',
        title: 'Example 1: 8-Bit Port Input (IN AL, 83H)',
        instruction: 'IN AL, 83H',
        description: 'Reads an 8-bit value from physical I/O port 83H into AL.',
        inputs: { AL: '34', 'Port 83H': '78' },
        outputs: { AL: '78' }
      },
      {
        id: 'fix-ex2',
        title: 'Example 2: 16-Bit Port Input (IN AX, 83H)',
        instruction: 'IN AX, 83H',
        description: 'Reads 16-bit word from port 83H (into AL) and port 84H (into AH).',
        inputs: { AX: '5634', 'Port 83H': '78', 'Port 84H': 'F2' },
        outputs: { AX: 'F278' }
      },
      {
        id: 'fix-ex3',
        title: 'Example 3: 8-Bit Port Output (OUT 83H, AL)',
        instruction: 'OUT 83H, AL',
        description: 'Writes the 8-bit byte from AL into physical output port 83H.',
        inputs: { AL: '50', 'Port 83H': '65' },
        outputs: { 'Port 83H': '50' }
      },
      {
        id: 'fix-ex4',
        title: 'Example 4: 16-Bit Port Output (OUT 83H, AX)',
        instruction: 'OUT 83H, AX',
        description: 'Writes 16-bit AX (AL to port 83H, AH to port 84H).',
        inputs: { AX: '6050', 'Port 83H': '65', 'Port 84H': '40' },
        outputs: { 'Port 83H': '50', 'Port 84H': '60' }
      }
    ]
  },
  variable_port: {
    id: 'variable_port',
    name: 'Variable Port Addressing',
    description: 'The I/O port address is stored dynamically inside the DX register (allows full 64KB port range).',
    rules: [
      'Port address is loaded into DX first, with a range of 0000H to FFFFH.',
      'Data transfer is strictly limited to registers AL or AX.',
      'Extremely powerful for dynamically selecting peripheral targets at runtime.'
    ],
    examples: [
      {
        id: 'var-ex1',
        title: 'Example 1: Dynamic Byte Input (IN AL, DX)',
        instruction: 'IN AL, DX',
        description: 'Reads a byte from the port address inside DX (1234H) into AL.',
        inputs: { AL: '30', DX: '1234', 'Port 1234H': '60' },
        outputs: { AL: '60', DX: '1234' }
      },
      {
        id: 'var-ex2',
        title: 'Example 2: Dynamic Word Input (IN AX, DX)',
        instruction: 'IN AX, DX',
        description: 'Reads 16-bit word from port DX (4000H) and DX+1 (4001H) into AX.',
        inputs: { AX: '3040', DX: '4000', 'Port 4000H': '60', 'Port 4001H': '70' },
        outputs: { AX: '7060', DX: '4000' }
      },
      {
        id: 'var-ex3',
        title: 'Example 3: Dynamic Byte Output (OUT DX, AL)',
        instruction: 'OUT DX, AL',
        description: 'Writes the byte in AL to the port address stored in DX (5000H).',
        inputs: { AL: '65', DX: '5000', 'Port 5000H': '80' },
        outputs: { 'Port 5000H': '65', DX: '5000' }
      },
      {
        id: 'var-ex4',
        title: 'Example 4: Dynamic Word Output (OUT DX, AX)',
        instruction: 'OUT DX, AX',
        description: 'Writes the word in AX to port addresses DX (5000H) and DX+1 (5001H).',
        inputs: { AX: '4567', DX: '5000', 'Port 5000H': '25', 'Port 5001H': '36' },
        outputs: { 'Port 5000H': '67', 'Port 5001H': '45', DX: '5000' }
      }
    ]
  },
  string_mode: {
    id: 'string_mode',
    name: 'String Addressing Mode',
    description: 'Hardware string commands use SI for source, DI for destination, and auto-increment/decrement them.',
    rules: [
      'Source is always pointed to by DS:SI; Destination is pointed to by ES:DI.',
      'Offsets are automatically incremented or decremented based on the Direction Flag (DF).',
      'CLD clears DF to 0 (auto-increment), while STD sets DF to 1 (auto-decrement).'
    ],
    examples: [
      {
        id: 'str-ex1',
        title: 'Example 1: Move String Byte (MOV SB)',
        instruction: 'MOV SB',
        description: 'Copies byte from DS:SI to ES:DI, then increments both SI and DI (since DF = 0).',
        inputs: { 'DS:SI (DS=2000H, SI=0500H)': '38', 'ES:DI (ES=4000H, DI=0300H)': 'AB', SI: '0500', DI: '0300', DF: '0' },
        outputs: { 'ES:DI (ES=4000H, DI=0300H)': '38', SI: '0501', DI: '0301' }
      }
    ]
  },
  relative_mode: {
    id: 'relative_mode',
    name: 'Relative Addressing Mode',
    description: 'The target destination is computed relative to the current Instruction Pointer (IP) / Program Counter (PC).',
    rules: [
      'Used exclusively in branch and conditional jump instructions.',
      'Adds a signed 8-bit or 16-bit offset displacement directly to IP.',
      'Enables relocatable segment branching loops.'
    ],
    examples: [
      {
        id: 'rel-ex1',
        title: 'Example 1: Jump relative (JNC START)',
        instruction: 'JNC START',
        description: 'If Carry Flag (CY) is 0, execution branches by adding START offset to IP. Otherwise, continues sequentially.',
        inputs: { IP: '1000', CY: '0', START_Offset: '0020' },
        outputs: { IP: '1020', CY: '0' }
      }
    ]
  },
  implied_mode: {
    id: 'implied_mode',
    name: 'Implied Addressing Mode',
    description: 'The operand is implicitly defined by the instruction mnemonic itself, with zero external parameters.',
    rules: [
      'Extremely compact instructions consisting of only 1 byte.',
      'Directly alters CPU state or internal flags.',
      'No register parameters or memory references are parsed.'
    ],
    examples: [
      {
        id: 'imp-ex1',
        title: 'Example 1: Clear Carry Flag (CLC)',
        instruction: 'CLC',
        description: 'Clears the internal CPU Carry Flag (CY) directly to zero.',
        inputs: { CY: '1' },
        outputs: { CY: '0' }
      }
    ]
  }
};

export default function AddressingModesSimulator() {
  const [activeUnit, setActiveUnit] = useState<'all' | 'memory' | 'io' | 'special'>('all');
  const [selectedModeId, setSelectedModeId] = useState<string>('immediate');
  const [activeExampleIdx, setActiveExampleIdx] = useState<number>(0);
  const [simState, setSimState] = useState<'before' | 'after' | 'running'>('before');
  const [userInputs, setUserInputs] = useState<{ [key: string]: string }>({});

  const modeData = addressingModesData[selectedModeId] || addressingModesData.immediate;
  const currentExample = modeData.examples[activeExampleIdx] || modeData.examples[0];

  // Initialize editable inputs when example changes
  useEffect(() => {
    setUserInputs({ ...currentExample.inputs });
    setSimState('before');
  }, [selectedModeId, activeExampleIdx]);

  const handleInputChange = (key: string, val: string) => {
    const sanitized = val.toUpperCase().replace(/[^0-9A-F]/g, '').slice(0, 4);
    setUserInputs(prev => ({ ...prev, [key]: sanitized }));
    setSimState('before');
  };

  const executeSimulation = () => {
    setSimState('running');
    setTimeout(() => {
      setSimState('after');
    }, 850);
  };

  const getAfterValue = (key: string) => {
    if (simState === 'before') {
      return userInputs[key] || '';
    }
    // Calculate outputs dynamically if the user edited the input
    if (currentExample.outputs[key] !== undefined) {
      return currentExample.outputs[key];
    }
    return userInputs[key] || '';
  };

  // Memory effective address calculation helpers
  const computeMemoryEA = () => {
    const bx = parseInt(userInputs.BX || '0', 16);
    const bp = parseInt(userInputs.BP || '0', 16);
    const si = parseInt(userInputs.SI || '0', 16);
    const di = parseInt(userInputs.DI || '0', 16);
    const ds = parseInt(userInputs.DS || '0', 16);
    const ss = parseInt(userInputs.SS || '0', 16);

    let ea = 0;
    let seg = ds;
    let segName = 'DS';

    if (selectedModeId === 'direct') {
      ea = 0x5634; // standard from slides
    } else if (selectedModeId === 'register_indirect') {
      if (currentExample.id === 'ind-ex1') ea = si;
      if (currentExample.id === 'ind-ex2') ea = bx;
      if (currentExample.id === 'ind-ex3') ea = di;
    } else if (selectedModeId === 'based_displacement') {
      if (currentExample.id === 'bas-ex1') {
        ea = bx + 0x2345;
      } else {
        ea = bp + 0x0045;
        seg = ss;
        segName = 'SS';
      }
    } else if (selectedModeId === 'indexed_displacement') {
      if (currentExample.id === 'idx-ex1') {
        ea = si + 0x2345;
      } else {
        ea = di + 0x0037;
      }
    } else if (selectedModeId === 'based_indexed') {
      if (currentExample.id === 'bi-ex1') {
        ea = bx + si;
      } else {
        ea = bp + di;
        seg = ss;
        segName = 'SS';
      }
    } else if (selectedModeId === 'based_indexed_displacement') {
      if (currentExample.id === 'bid-ex1') {
        ea = bx + di + 0x0037;
      } else {
        ea = bp + si + 0x1234;
        seg = ss;
        segName = 'SS';
      }
    }

    ea = ea & 0xFFFF;
    const physical = ((seg * 16) + ea) & 0xFFFFF;

    return {
      eaHex: ea.toString(16).toUpperCase().padStart(4, '0') + 'H',
      segHex: seg.toString(16).toUpperCase().padStart(4, '0') + 'H',
      segName,
      shiftedSegHex: (seg * 16).toString(16).toUpperCase().padStart(5, '0') + 'H',
      physicalHex: physical.toString(16).toUpperCase().padStart(5, '0') + 'H'
    };
  };

  const isMemoryMode = ['direct', 'register_indirect', 'based_displacement', 'indexed_displacement', 'based_indexed', 'based_indexed_displacement'].includes(selectedModeId);

  return (
    <div id="addressing-modes-simulator" className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 text-slate-800 shadow-xs flex flex-col justify-between">
      <div>
        {/* Top Header Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-4 gap-2">
          <div>
            <h2 className="text-lg md:text-xl font-bold font-display text-indigo-600 flex items-center gap-2">
              <Calculator className="w-5 md:w-6 h-5 md:h-6 text-indigo-600" />
              Interactive Addressing Modes Studio
            </h2>
          </div>
          <div className="flex items-center gap-1.5 bg-indigo-50/60 px-3.5 py-1.5 rounded-xl border border-indigo-100/80 shrink-0 self-start sm:self-auto shadow-2xs">
            <GraduationCap className="h-4.5 w-4.5 text-indigo-600" />
            <span className="text-[13px] font-sans font-bold text-indigo-900">Assoc. Prof. Dr. M Lakshmipathy</span>
          </div>
        </div>
  
        {/* Mobile Navigation Hub (visible on mobile/tablet only) */}
        <div className="block lg:hidden mb-5 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-4">
          <div>
            <span className="text-[10px] font-bold font-mono text-indigo-700 uppercase tracking-widest block">Addressing Mode Category</span>
            <p className="text-[10px] text-slate-500 mt-0.5">Select a category and specific mode to simulate:</p>
          </div>

          {/* Horizontal scrolling Categories */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-indigo-200">
            {[
              { id: 'all', label: '1. Reg & Imm' },
              { id: 'memory', label: '2. Memory' },
              { id: 'io', label: '3. I/O Ports' },
              { id: 'special', label: '4. Special' }
            ].map(cat => {
              const isSel = activeUnit === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveUnit(cat.id as any);
                    // Automatically select first mode in that category
                    let firstModeId = 'immediate';
                    if (cat.id === 'memory') firstModeId = 'direct';
                    if (cat.id === 'io') firstModeId = 'fixed_port';
                    if (cat.id === 'special') firstModeId = 'string_mode';
                    setSelectedModeId(firstModeId);
                    setActiveExampleIdx(0);
                  }}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all shrink-0 cursor-pointer ${
                    isSel
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Sub-mode selections based on category */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest block">Specific Mode</span>
            <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-indigo-200">
              {/* Category 1 Modes */}
              {activeUnit === 'all' && [
                { id: 'immediate', label: 'Immediate Addressing' },
                { id: 'register', label: 'Register Addressing' }
              ].map(mode => {
                const isSel = selectedModeId === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setSelectedModeId(mode.id);
                      setActiveExampleIdx(0);
                    }}
                    className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-all shrink-0 cursor-pointer ${
                      isSel
                        ? 'bg-indigo-700 border-indigo-600 text-white font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-indigo-50/20'
                    }`}
                  >
                    {mode.label}
                  </button>
                );
              })}

              {/* Category 2 Modes */}
              {activeUnit === 'memory' && [
                { id: 'direct', label: 'Direct Memory' },
                { id: 'register_indirect', label: 'Register Indirect' },
                { id: 'based_displacement', label: 'Based + Disp' },
                { id: 'indexed_displacement', label: 'Indexed + Disp' },
                { id: 'based_indexed', label: 'Based Indexed' },
                { id: 'based_indexed_displacement', label: 'Based Indexed + Disp' }
              ].map(mode => {
                const isSel = selectedModeId === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setSelectedModeId(mode.id);
                      setActiveExampleIdx(0);
                    }}
                    className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-all shrink-0 cursor-pointer ${
                      isSel
                        ? 'bg-amber-600 border-amber-500 text-white font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-amber-50/20'
                    }`}
                  >
                    {mode.label}
                  </button>
                );
              })}

              {/* Category 3 Modes */}
              {activeUnit === 'io' && [
                { id: 'fixed_port', label: 'Fixed / Direct Port' },
                { id: 'variable_port', label: 'Variable / Indirect Port' }
              ].map(mode => {
                const isSel = selectedModeId === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setSelectedModeId(mode.id);
                      setActiveExampleIdx(0);
                    }}
                    className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-all shrink-0 cursor-pointer ${
                      isSel
                        ? 'bg-purple-600 border-purple-500 text-white font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-purple-50/20'
                    }`}
                  >
                    {mode.label}
                  </button>
                );
              })}

              {/* Category 4 Modes */}
              {activeUnit === 'special' && [
                { id: 'string_mode', label: 'String Mode' },
                { id: 'relative_mode', label: 'Relative Mode (Jumps)' },
                { id: 'implied_mode', label: 'Implied Mode' }
              ].map(mode => {
                const isSel = selectedModeId === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setSelectedModeId(mode.id);
                      setActiveExampleIdx(0);
                    }}
                    className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-all shrink-0 cursor-pointer ${
                      isSel
                        ? 'bg-emerald-600 border-emerald-500 text-white font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-emerald-50/20'
                    }`}
                  >
                    {mode.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Collapsible Mobile Concept Maps */}
          {(activeUnit === 'memory' || activeUnit === 'io') && (
            <div className="pt-2 border-t border-slate-200/60">
              <details className="group bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-300">
                <summary className="flex items-center justify-between p-3 cursor-pointer text-xs font-bold text-slate-700 bg-slate-50/50 hover:bg-slate-100/50 select-none">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    {activeUnit === 'memory' ? 'View Memory Address Map (Slide 5)' : 'View I/O Address Map (Slide 12)'}
                  </span>
                  <span className="transition-transform duration-300 group-open:rotate-180 text-slate-400">
                    ▼
                  </span>
                </summary>
                <div className="p-3 bg-white space-y-3.5 border-t border-slate-150">
                  {activeUnit === 'memory' ? (
                    <div className="space-y-1.5 text-[11px]">
                      <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg text-center font-bold text-indigo-700">
                        Memory Addressing Modes
                      </div>
                      <div className="pl-2 border-l border-slate-200 space-y-1.5 pt-1">
                        <button
                          onClick={() => setSelectedModeId('direct')}
                          className={`w-full text-left p-1.5 px-2.5 rounded-lg border font-mono transition-all text-[10.5px] cursor-pointer ${
                            selectedModeId === 'direct'
                              ? 'bg-amber-50 border-amber-300 text-amber-700 font-bold'
                              : 'bg-white border-slate-200 text-slate-500'
                          }`}
                        >
                          ├─ Direct Addressing
                        </button>
                        <div className="p-1.5 bg-slate-50 text-slate-500 font-mono text-[9.5px] rounded-md">
                          └─ Indirect Modes:
                        </div>
                        <div className="pl-3 space-y-1">
                          {[
                            { id: 'register_indirect', label: 'Register Indirect' },
                            { id: 'based_displacement', label: 'Based + Disp' },
                            { id: 'indexed_displacement', label: 'Indexed + Disp' },
                            { id: 'based_indexed', label: 'Based Indexed' },
                            { id: 'based_indexed_displacement', label: 'Based Indexed + Disp' }
                          ].map(mode => (
                            <button
                              key={mode.id}
                              onClick={() => setSelectedModeId(mode.id)}
                              className={`w-full text-left py-1 px-2 rounded-lg border font-mono transition-all text-[10px] cursor-pointer ${
                                selectedModeId === mode.id
                                  ? 'bg-amber-50 border-amber-300 text-amber-700 font-bold'
                                  : 'bg-white border-slate-100 text-slate-500'
                              }`}
                            >
                              • {mode.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5 text-[11px]">
                      <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg text-center font-bold text-indigo-700">
                        I/O Port Addressing
                      </div>
                      <div className="grid grid-cols-1 gap-1.5 pt-1">
                        <button
                          onClick={() => setSelectedModeId('fixed_port')}
                          className={`text-left p-2 rounded-xl border font-mono transition-all text-[10.5px] cursor-pointer ${
                            selectedModeId === 'fixed_port'
                              ? 'bg-purple-50 border-purple-300 text-purple-700 font-bold'
                              : 'bg-white border-slate-200 text-slate-500'
                          }`}
                        >
                          <span className="font-bold text-purple-700">Fixed / Direct:</span>
                          <p className="text-[9px] text-slate-500 font-sans mt-0.5">Address inside instruction code (00H-FFH)</p>
                        </button>
                        <button
                          onClick={() => setSelectedModeId('variable_port')}
                          className={`text-left p-2 rounded-xl border font-mono transition-all text-[10.5px] cursor-pointer ${
                            selectedModeId === 'variable_port'
                              ? 'bg-purple-50 border-purple-300 text-purple-700 font-bold'
                              : 'bg-white border-slate-200 text-slate-500'
                          }`}
                        >
                          <span className="font-bold text-purple-700">Variable / Indirect:</span>
                          <p className="text-[9px] text-slate-500 font-sans mt-0.5">Address loaded dynamically in DX register</p>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </details>
            </div>
          )}
        </div>
 
        {/* Main Workspace Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Navigation Hub (Column A - Hidden on Mobile) */}
          <div className="hidden lg:block lg:col-span-4 space-y-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
              <div>
                <span className="text-[10px] font-bold font-mono text-indigo-600 uppercase tracking-widest block">Addressing Mode Types</span>
                <p className="text-[10px] text-slate-500 mt-0.5">Select a category and specific mode to simulate:</p>
              </div>
              
              <div className="space-y-4">
                {/* Category 1: Register & Immediate */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 border-b border-indigo-100/50 pb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    <span className="text-[10.5px] font-bold text-indigo-700 font-sans">1. Register & Immediate</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {[
                      { id: 'immediate', label: 'Immediate Addressing' },
                      { id: 'register', label: 'Register Addressing' }
                    ].map(mode => {
                      const isSel = selectedModeId === mode.id;
                      return (
                        <button
                          key={mode.id}
                          onClick={() => {
                            setSelectedModeId(mode.id);
                            setActiveUnit('all');
                            setActiveExampleIdx(0);
                          }}
                          className={`w-full text-left p-2 px-2.5 rounded-xl border transition-all text-xs font-mono cursor-pointer ${
                            isSel
                              ? 'bg-indigo-600 border-indigo-500 text-white shadow-xs font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/30'
                          }`}
                        >
                          {mode.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Category 2: Memory Addressing */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 border-b border-amber-100 pb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span className="text-[10.5px] font-bold text-amber-700 font-sans">2. Memory Addressing</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {[
                      { id: 'direct', label: 'Direct Memory' },
                      { id: 'register_indirect', label: 'Register Indirect' },
                      { id: 'based_displacement', label: 'Based + Disp' },
                      { id: 'indexed_displacement', label: 'Indexed + Disp' },
                      { id: 'based_indexed', label: 'Based Indexed' },
                      { id: 'based_indexed_displacement', label: 'Based Indexed + Disp' }
                    ].map(mode => {
                      const isSel = selectedModeId === mode.id;
                      return (
                        <button
                          key={mode.id}
                          onClick={() => {
                            setSelectedModeId(mode.id);
                            setActiveUnit('memory');
                            setActiveExampleIdx(0);
                          }}
                          className={`w-full text-left p-2 px-2.5 rounded-xl border transition-all text-xs font-mono cursor-pointer ${
                            isSel
                              ? 'bg-amber-600 border-amber-500 text-white shadow-xs font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:text-amber-700 hover:border-amber-200 hover:bg-amber-50/30'
                          }`}
                        >
                          {mode.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Category 3: I/O Port Addressing */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 border-b border-purple-100 pb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                    <span className="text-[10.5px] font-bold text-purple-700 font-sans">3. I/O Port Addressing</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {[
                      { id: 'fixed_port', label: 'Fixed / Direct Port' },
                      { id: 'variable_port', label: 'Variable / Indirect Port' }
                    ].map(mode => {
                      const isSel = selectedModeId === mode.id;
                      return (
                        <button
                          key={mode.id}
                          onClick={() => {
                            setSelectedModeId(mode.id);
                            setActiveUnit('io');
                            setActiveExampleIdx(0);
                          }}
                          className={`w-full text-left p-2 px-2.5 rounded-xl border transition-all text-xs font-mono cursor-pointer ${
                            isSel
                              ? 'bg-purple-600 border-purple-500 text-white shadow-xs font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:text-purple-700 hover:border-purple-200 hover:bg-purple-50/30'
                          }`}
                        >
                          {mode.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Category 4: Special Addressing */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 border-b border-emerald-100 pb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[10.5px] font-bold text-emerald-700 font-sans">4. Special Addressing</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {[
                      { id: 'string_mode', label: 'String Mode' },
                      { id: 'relative_mode', label: 'Relative Mode (Jumps)' },
                      { id: 'implied_mode', label: 'Implied Mode' }
                    ].map(mode => {
                      const isSel = selectedModeId === mode.id;
                      return (
                        <button
                          key={mode.id}
                          onClick={() => {
                            setSelectedModeId(mode.id);
                            setActiveUnit('special');
                            setActiveExampleIdx(0);
                          }}
                          className={`w-full text-left p-2 px-2.5 rounded-xl border transition-all text-xs font-mono cursor-pointer ${
                            isSel
                              ? 'bg-emerald-600 border-emerald-500 text-white shadow-xs font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50/30'
                          }`}
                        >
                          {mode.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

            {/* Interactive Concept Map for Memory Addressing */}
            {activeUnit === 'memory' && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
                <span className="text-[10px] font-bold font-mono text-amber-700 uppercase tracking-widest block flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Memory Address Map (Slide 5)
                </span>
                <div className="space-y-1.5 text-[11px]">
                  <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg text-center font-bold text-indigo-700">
                    Memory Addressing Modes
                  </div>
                  <div className="pl-4 border-l border-slate-200 space-y-1.5 pt-1">
                    <button
                      onClick={() => setSelectedModeId('direct')}
                      className={`w-full text-left p-1.5 px-2.5 rounded-lg border font-mono transition-all text-[10.5px] cursor-pointer ${
                        selectedModeId === 'direct'
                          ? 'bg-amber-50 border-amber-300 text-amber-700 font-bold'
                          : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      ├─ Direct Addressing
                    </button>
                    <div className="p-1.5 bg-white text-slate-400 font-mono text-[9.5px]">
                      └─ Indirect Modes:
                    </div>
                    <div className="pl-3 space-y-1">
                      {[
                        { id: 'register_indirect', label: 'Register Indirect' },
                        { id: 'based_displacement', label: 'Based + Disp' },
                        { id: 'indexed_displacement', label: 'Indexed + Disp' },
                        { id: 'based_indexed', label: 'Based Indexed' },
                        { id: 'based_indexed_displacement', label: 'Based Indexed + Disp' }
                      ].map(mode => (
                        <button
                          key={mode.id}
                          onClick={() => setSelectedModeId(mode.id)}
                          className={`w-full text-left py-1 px-2 rounded-lg border font-mono transition-all text-[10px] cursor-pointer ${
                            selectedModeId === mode.id
                              ? 'bg-amber-50 border-amber-300 text-amber-700 font-bold'
                              : 'bg-white border-slate-100 text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          • {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Interactive Concept Map for I/O Port Addressing */}
            {activeUnit === 'io' && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
                <span className="text-[10px] font-bold font-mono text-purple-700 uppercase tracking-widest block flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  I/O Address Map (Slide 12)
                </span>
                <div className="space-y-1.5 text-[11px]">
                  <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg text-center font-bold text-indigo-700">
                    I/O Port Addressing
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 pt-1.5">
                    <button
                      onClick={() => setSelectedModeId('fixed_port')}
                      className={`text-left p-2 rounded-xl border font-mono transition-all text-[10.5px] cursor-pointer ${
                        selectedModeId === 'fixed_port'
                          ? 'bg-purple-50 border-purple-300 text-purple-700 font-bold'
                          : 'bg-white border-slate-200 text-slate-500 hover:text-slate-750'
                      }`}
                    >
                      <span className="font-bold text-purple-700">Fixed / Direct:</span>
                      <p className="text-[9px] text-slate-450 font-sans mt-0.5">Address inside instruction code (00H-FFH)</p>
                    </button>
                    <button
                      onClick={() => setSelectedModeId('variable_port')}
                      className={`text-left p-2 rounded-xl border font-mono transition-all text-[10.5px] cursor-pointer ${
                        selectedModeId === 'variable_port'
                          ? 'bg-purple-50 border-purple-300 text-purple-700 font-bold'
                          : 'bg-white border-slate-200 text-slate-500 hover:text-slate-750'
                      }`}
                    >
                      <span className="font-bold text-purple-700">Variable / Indirect:</span>
                      <p className="text-[9px] text-slate-450 font-sans mt-0.5">Address loaded dynamically in DX register</p>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Workspace Panel (Column B) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Slide Details Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3.5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-55 bg-opacity-80 border border-indigo-100 text-indigo-700 font-mono font-bold text-[10px] px-2.5 py-0.5 rounded">
                    MPU-8086
                  </span>
                  <h3 className="font-bold text-base text-slate-900">{modeData.name}</h3>
                </div>
                {/* Example selection buttons */}
                {modeData.examples.length > 1 && (
                  <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shrink-0">
                    {modeData.examples.map((ex, idx) => (
                      <button
                        key={ex.id}
                        onClick={() => { setActiveExampleIdx(idx); setSimState('before'); }}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                          activeExampleIdx === idx
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Ex {idx + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>
 
              <p className="text-xs text-slate-600 leading-relaxed text-justify">{modeData.description}</p>
 
              {/* Courseware Rules and slide constraints */}
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl space-y-2.5">
                <span className="text-[13px] font-bold text-indigo-800 uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-indigo-600" />
                  Technical Rulebook & Constraints:
                </span>
                <ul className="space-y-1.5 text-[13px] text-slate-700 pl-5 list-disc leading-relaxed text-justify">
                  {modeData.rules.map((rule, rIdx) => (
                    <li key={rIdx}>{rule}</li>
                  ))}
                </ul>
              </div>
            </div>
 
            {/* Before vs After Interactive Simulation Sandbox */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 space-y-5 relative shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-mono font-bold text-slate-500">Sandbox Execution Terminal</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg text-xs font-mono font-bold text-indigo-700 shadow-xs">
                  {currentExample.instruction}
                </div>
              </div>
 
              {/* Dynamic instruction explanation */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{currentExample.description}</span>
              </div>
 
              {/* Dual Before / After comparison layout (just like the slides!) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
                {/* Before register state */}
                <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                    <span className="text-[10px] font-mono font-bold text-amber-700 uppercase tracking-widest">
                      Before State (Modify Inputs)
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 font-semibold bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      EDITABLE HEX
                    </span>
                  </div>
 
                  <div className="space-y-2.5">
                    {Object.keys(currentExample.inputs).map(key => {
                      const isSeg = ['DS', 'SS', 'ES'].includes(key);
                      return (
                        <div key={key} className="flex items-center justify-between bg-white border border-slate-200 p-2 rounded-xl">
                          <span className="font-mono text-xs font-bold text-slate-600 flex items-center gap-1.5">
                            {isSeg ? <Database className="w-3.5 h-3.5 text-sky-600" /> : <Cpu className="w-3.5 h-3.5 text-indigo-600" />}
                            {key}
                          </span>
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={userInputs[key] || ''}
                              onChange={(e) => handleInputChange(key, e.target.value)}
                              className="bg-slate-50 text-amber-800 text-xs font-mono font-bold text-right px-2 py-1 rounded-lg border border-slate-200 w-20 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                            <span className="text-[10px] font-mono text-slate-400 font-bold">H</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
 
                {/* After register state */}
                <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                    <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-widest">
                      After State
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 font-semibold bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      RESULT STATE
                    </span>
                  </div>
 
                  {simState === 'running' ? (
                    <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center space-y-2 z-10 rounded-2xl">
                      <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                      <span className="text-[10px] font-mono font-bold text-indigo-600 tracking-wider">EXECUTING MPU CYCLE...</span>
                    </div>
                  ) : null}
 
                  <div className="space-y-2.5">
                    {Object.keys(currentExample.inputs).map(key => {
                      const beforeVal = userInputs[key] || '';
                      const afterVal = getAfterValue(key);
                      const hasChanged = beforeVal !== afterVal;
 
                      return (
                        <div 
                          key={key} 
                          className={`flex items-center justify-between p-2 rounded-xl transition-all duration-300 ${
                            hasChanged && simState === 'after'
                              ? 'bg-emerald-50 border border-emerald-300/60'
                              : 'bg-white border border-slate-200'
                          }`}
                        >
                          <span className="font-mono text-xs font-bold text-slate-600 flex items-center gap-1.5">
                            {['DS', 'SS', 'ES'].includes(key) ? <Database className="w-3.5 h-3.5 text-sky-600" /> : <Cpu className="w-3.5 h-3.5 text-indigo-600" />}
                            {key}
                          </span>
                          <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
                            {hasChanged && simState === 'after' && (
                              <span className="text-slate-400 line-through text-[10.5px] mr-1">{beforeVal}H</span>
                            )}
                            <span className={hasChanged && simState === 'after' ? 'text-emerald-600 text-sm font-extrabold' : 'text-slate-600'}>
                              {afterVal}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 font-bold">H</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
 
              {/* Run Simulation Trigger */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-4">
                <p className="text-[10.5px] text-slate-500 text-justify max-w-md">
                  Edit values in the <strong className="text-amber-700">Before</strong> box to try custom inputs, then press the simulator button to run the assembly cycle.
                </p>
                <div className="flex gap-2.5 w-full sm:w-auto">
                  {simState === 'after' && (
                    <button
                      onClick={() => {
                        setUserInputs({ ...currentExample.inputs });
                        setSimState('before');
                      }}
                      className="flex-1 sm:flex-initial py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-xl border border-slate-200 transition-all text-xs cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Reset
                    </button>
                  )}
                  <button
                    onClick={executeSimulation}
                    disabled={simState === 'running'}
                    className="flex-1 sm:flex-initial py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold rounded-xl transition-all text-xs cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Play className="h-4 w-4 fill-white" />
                    Simulate Instruction
                  </button>
                </div>
              </div>
            </div>

            {/* 20-Bit Physical Address Segment Math Pipeline */}
            {isMemoryMode && (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 space-y-4 shadow-xs font-mono text-slate-800">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs">
                  <span className="text-indigo-600 font-bold uppercase tracking-wider flex items-center gap-1.5 font-sans">
                    <Layers className="w-4 h-4 text-indigo-600 animate-pulse" />
                    20-Bit Physical Address Map Pipeline
                  </span>
                  <span className="text-slate-400 font-bold bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-sans">
                    REAL PROCESSOR MAPPING
                  </span>
                </div>

                <div className="space-y-3.5">
                  {/* Step 1: EA */}
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-1 uppercase tracking-wide font-sans font-bold">Step 1: Compute Logical Offset (Effective Address)</span>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-xs">
                      <div className="flex justify-between items-center text-[10.5px]">
                        <span className="text-slate-500">Memory Formula:</span>
                        <span className="text-indigo-600 font-bold font-sans">
                          {selectedModeId === 'direct' && 'EA = Displacement'}
                          {selectedModeId === 'register_indirect' && 'EA = Pointer Register'}
                          {selectedModeId === 'based_displacement' && 'EA = Base Register (BX/BP) + Displacement'}
                          {selectedModeId === 'indexed_displacement' && 'EA = Index Register (SI/DI) + Displacement'}
                          {selectedModeId === 'based_indexed' && 'EA = Base (BX/BP) + Index (SI/DI)'}
                          {selectedModeId === 'based_indexed_displacement' && 'EA = Base (BX/BP) + Index (SI/DI) + Displacement'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-slate-500">Offset EA calculation:</span>
                        <span className="text-slate-800 font-bold">{computeMemoryEA().eaHex}</span>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Segment Shift */}
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-1 uppercase tracking-wide font-sans font-bold">Step 2: Translate Segment to 20-Bit Address</span>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-sans">Base Segment Register ({computeMemoryEA().segName}):</span>
                        <span className="text-slate-700 font-bold">{computeMemoryEA().segHex}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10.5px]">
                        <span className="text-slate-500 font-sans">Shifted Base ({computeMemoryEA().segName} &times; 10H):</span>
                        <span className="text-sky-700 font-bold">{computeMemoryEA().shiftedSegHex}</span>
                      </div>
                      <div className="border-t border-slate-100 pt-2 flex justify-between items-center text-xs">
                        <span className="text-slate-700 flex items-center gap-1.5 font-sans font-bold">
                          <Database className="w-4 h-4 text-emerald-600" />
                          Final 20-Bit Physical Address:
                        </span>
                        <span className="text-emerald-600 font-extrabold text-sm">{computeMemoryEA().physicalHex}</span>
                      </div>
                    </div>
                  </div>

                  {/* Visual memory mapping pipeline representation */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-1 pt-1.5 text-[10px] sm:text-[8.5px] font-bold text-slate-500 font-sans">
                    <div className="flex-1 min-h-[28px] sm:h-5 bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center rounded-lg shadow-xs font-mono px-2 py-1 sm:py-0 text-center">
                      <span className="sm:hidden mr-1 text-[8px] text-sky-500 uppercase font-sans">Shifted Seg: </span>
                      {computeMemoryEA().shiftedSegHex}
                    </div>
                    <div className="text-indigo-600 text-xs font-bold text-center self-center sm:self-auto">+</div>
                    <div className="flex-1 min-h-[28px] sm:h-5 bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center rounded-lg shadow-xs font-mono px-2 py-1 sm:py-0 text-center">
                      <span className="sm:hidden mr-1 text-[8px] text-indigo-500 uppercase font-sans">Offset EA: </span>
                      {computeMemoryEA().eaHex}
                    </div>
                    <div className="text-indigo-600 text-xs font-bold text-center self-center sm:self-auto">=</div>
                    <div className="flex-[1.5] min-h-[32px] sm:h-5 bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center rounded-lg shadow-xs text-xs sm:text-[10px] font-extrabold font-mono px-2 py-1 sm:py-0 text-center">
                      <span className="sm:hidden mr-1 text-[8px] text-emerald-500 uppercase font-sans font-bold">Physical: </span>
                      {computeMemoryEA().physicalHex}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      <div className="text-[10px] text-slate-400 font-mono text-right pt-4 border-t border-slate-100 shrink-0 mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span>Kuppam Engineering College — ECE Microprocessors Courseware</span>
        <span>Interactive 20-Bit MPU-8086 Address Calculator</span>
      </div>
    </div>
  );
}
