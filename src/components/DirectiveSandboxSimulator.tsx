import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Code2, 
  Database, 
  Layers, 
  Copy, 
  Check, 
  Info, 
  Sparkles, 
  Binary, 
  CheckCircle2, 
  FileCode, 
  Terminal, 
  Cpu, 
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Shield,
  LayoutGrid,
  PhoneCall,
  ArrowUpRight,
  Play,
  RotateCcw,
  Calculator,
  Zap,
  FastForward,
  Plus,
  Minus
} from 'lucide-react';

const hexFormat = (num: number) => (num & 0xFFFF).toString(16).toUpperCase().padStart(4, '0') + 'H';
const byteHexFormat = (num: number) => (num & 0xFF).toString(16).toUpperCase().padStart(2, '0') + 'H';

interface DirectiveInfo {
  id: string;
  name: string;
  fullForm: string;
  category: 'Segment Control' | 'Data Definition' | 'Procedure & Scope' | 'General Symbol';
  bytesAllocated: string;
  desc: string;
  example: string;
  styleAffiliation: 'Standard Style' | 'Simplified Style' | 'Both Styles';
}

const directivesCatalog: Record<string, DirectiveInfo> = {
  'SEGMENT': {
    id: 'SEGMENT',
    name: 'SEGMENT & ENDS',
    fullForm: 'Segment Boundaries Declaration',
    category: 'Segment Control',
    bytesAllocated: '0 Bytes (Compiler Directive)',
    desc: 'Defines the starting and ending boundaries of a logical segment block (Code, Data, Stack) in Standard Segment programming style.',
    example: 'DATA_SEG SEGMENT\n  NUM1 DB 25H\nDATA_SEG ENDS',
    styleAffiliation: 'Standard Style'
  },
  'ASSUME': {
    id: 'ASSUME',
    name: 'ASSUME',
    fullForm: 'Segment Register Association Directive',
    category: 'Segment Control',
    bytesAllocated: '0 Bytes (Compiler Directive)',
    desc: 'Informs the assembler which segment register (CS, DS, SS, ES) corresponds to which logical segment at compile time for label offset validation.',
    example: 'ASSUME CS:CODE_SEG, DS:DATA_SEG',
    styleAffiliation: 'Standard Style'
  },
  'MODEL': {
    id: 'MODEL',
    name: '.MODEL',
    fullForm: 'Memory Model Directive',
    category: 'Segment Control',
    bytesAllocated: '0 Bytes (Compiler Directive)',
    desc: 'Pre-configures standard segment sizing parameters (e.g. SMALL, TINY, MEDIUM) in Simplified programming style, eliminating explicit SEGMENT/ENDS blocks.',
    example: '.MODEL SMALL  ; Code in 64KB, Data in 64KB',
    styleAffiliation: 'Simplified Style'
  },
  'STACK': {
    id: 'STACK',
    name: '.STACK',
    fullForm: 'Stack Segment Allocation',
    category: 'Segment Control',
    bytesAllocated: 'User-specified size (e.g. 256 Bytes)',
    desc: 'Allocates a dedicated Stack Segment with a designated size in Simplified programming style.',
    example: '.STACK 100H  ; Reserves 256 bytes for stack',
    styleAffiliation: 'Simplified Style'
  },
  'DATA': {
    id: 'DATA',
    name: '.DATA',
    fullForm: 'Data Segment Identifier',
    category: 'Segment Control',
    bytesAllocated: '0 Bytes (Compiler Directive)',
    desc: 'Marks the beginning of the data segment in Simplified programming style.',
    example: '.DATA\nVAL1 DB 10H\nVAL2 DW 1234H',
    styleAffiliation: 'Simplified Style'
  },
  'CODE': {
    id: 'CODE',
    name: '.CODE',
    fullForm: 'Code Segment Identifier',
    category: 'Segment Control',
    bytesAllocated: '0 Bytes (Compiler Directive)',
    desc: 'Marks the beginning of the executable instruction segment in Simplified programming style.',
    example: '.CODE\nMAIN PROC\n  MOV AX, @DATA\n  MOV DS, AX\nMAIN ENDP',
    styleAffiliation: 'Simplified Style'
  },
  '@DATA': {
    id: '@DATA',
    name: '@DATA',
    fullForm: 'Data Segment Address Symbol',
    category: 'Segment Control',
    bytesAllocated: '0 Bytes (Compile Constant)',
    desc: 'A predefined symbolic constant representing the physical base segment address of the .DATA block used to initialize DS register.',
    example: 'MOV AX, @DATA\nMOV DS, AX',
    styleAffiliation: 'Simplified Style'
  },
  'DB': {
    id: 'DB',
    name: 'DB (Define Byte)',
    fullForm: '8-Bit Byte Storage Allocation',
    category: 'Data Definition',
    bytesAllocated: '1 Byte per element',
    desc: 'Allocates memory storage space in RAM for 8-bit byte variables or character strings.',
    example: 'COUNT DB 0FFH\nMSG DB \'HELLO\', 0',
    styleAffiliation: 'Both Styles'
  },
  'DW': {
    id: 'DW',
    name: 'DW (Define Word)',
    fullForm: '16-Bit Word Storage Allocation',
    category: 'Data Definition',
    bytesAllocated: '2 Bytes per element',
    desc: 'Allocates memory storage space in RAM for 16-bit word variables. Stored in physical memory using Little-Endian byte order.',
    example: 'VAL_WORD DW 1234H\nARRAY_W DW 5 DUP(0)',
    styleAffiliation: 'Both Styles'
  },
  'DD': {
    id: 'DD',
    name: 'DD (Define Doubleword)',
    fullForm: '32-Bit Doubleword Storage Allocation',
    category: 'Data Definition',
    bytesAllocated: '4 Bytes per element',
    desc: 'Allocates memory storage space for 32-bit values or FAR pointer addresses (Segment:Offset pairs).',
    example: 'FAR_PTR DD 10002000H',
    styleAffiliation: 'Both Styles'
  },
  'DUP': {
    id: 'DUP',
    name: 'DUP (Duplicate Operator)',
    fullForm: 'Array Allocation Duplicator',
    category: 'Data Definition',
    bytesAllocated: 'Count * Element Size',
    desc: 'Duplicates a pattern or value multiple times to initialize array memory blocks.',
    example: 'BUFFER DB 100 DUP(0)  ; 100 zeroed bytes',
    styleAffiliation: 'Both Styles'
  },
  'EQU': {
    id: 'EQU',
    name: 'EQU (Equate Constant)',
    fullForm: 'Equate Symbolic Constant',
    category: 'General Symbol',
    bytesAllocated: '0 Bytes (Replaced at Compile-Time)',
    desc: 'Assigns a symbolic text alias or constant value. The assembler replaces occurrences during translation; no runtime RAM consumed.',
    example: 'MAX_SIZE EQU 50\nMOV CX, MAX_SIZE',
    styleAffiliation: 'Both Styles'
  },
  'ORG': {
    id: 'ORG',
    name: 'ORG (Origin)',
    fullForm: 'Origin Offset Directive',
    category: 'General Symbol',
    bytesAllocated: '0 Bytes (Compiler Directive)',
    desc: 'Sets the starting instruction or data location counter offset in memory. Crucial for DOS .COM executables (ORG 100H).',
    example: 'ORG 100H  ; Sets CS offset to 100H',
    styleAffiliation: 'Both Styles'
  },
  'END': {
    id: 'END',
    name: 'END',
    fullForm: 'End of Assembly Source Module',
    category: 'General Symbol',
    bytesAllocated: '0 Bytes (Compiler Directive)',
    desc: 'Terminates the assembly process for the current file. Specifies the program entry point label to the linker.',
    example: 'END START',
    styleAffiliation: 'Both Styles'
  },
  'PROC': {
    id: 'PROC',
    name: 'PROC & ENDP',
    fullForm: 'Procedure Declaration Block',
    category: 'Procedure & Scope',
    bytesAllocated: '0 Bytes (Compiler Directive)',
    desc: 'Encloses subroutines/functions. Can be specified as NEAR (same code segment) or FAR (different code segment).',
    example: 'MY_SUB PROC NEAR\n  ; subroutine logic\n  RET\nMY_SUB ENDP',
    styleAffiliation: 'Both Styles'
  },
  'PTR': {
    id: 'PTR',
    name: 'PTR (Pointer Type Override)',
    fullForm: 'Pointer Type Clarification Operator',
    category: 'Procedure & Scope',
    bytesAllocated: '0 Bytes (Compile Operator)',
    desc: 'Overrides or clarifies the memory operand size (BYTE PTR or WORD PTR) when operand size is ambiguous.',
    example: 'MOV BYTE PTR [BX], 05H\nINC WORD PTR [SI]',
    styleAffiliation: 'Both Styles'
  },
  'OFFSET': {
    id: 'OFFSET',
    name: 'OFFSET',
    fullForm: 'Offset Address Operator',
    category: 'Procedure & Scope',
    bytesAllocated: '0 Bytes (Compile Operator)',
    desc: 'Extracts the 16-bit logical offset address of a variable or label rather than its content value.',
    example: 'MOV BX, OFFSET MY_VAR\n; Same as LEA BX, MY_VAR',
    styleAffiliation: 'Both Styles'
  }
};

interface ProgrammingStyleInfo {
  id: 'standard' | 'simplified' | 'com';
  title: string;
  badge: string;
  subtitle: string;
  desc: string;
  formatName: string;
  code: string;
  keyDirectives: string[];
  features: string[];
}

const programmingStylesData: Record<string, ProgrammingStyleInfo> = {
  'standard': {
    id: 'standard',
    title: '1. Standard Segment-Ends Style',
    badge: 'EXE Format (Explicit)',
    subtitle: 'Classic SEGMENT / ENDS / ASSUME Frame Structure',
    desc: 'The traditional 8086 program format where every memory section (Data, Code, Stack) is explicitly wrapped in SEGMENT and ENDS directives. Gives complete low-level control over segment naming and alignment.',
    formatName: 'Standard .EXE Program Format',
    code: `; Standard Segment-Ends Style
DATA_SEG SEGMENT
  NUM1 DB 15H
  NUM2 DB 25H
  RESULT DB ?
DATA_SEG ENDS

CODE_SEG SEGMENT
  ASSUME CS:CODE_SEG, DS:DATA_SEG
START:
  ; Manual DS Initialization
  MOV AX, DATA_SEG
  MOV DS, AX

  ; Addition Logic
  MOV AL, NUM1
  ADD AL, NUM2
  MOV RESULT, AL

  ; DOS Exit Interrupt
  MOV AH, 4CH
  INT 21H
CODE_SEG ENDS
END START`,
    keyDirectives: ['SEGMENT', 'ENDS', 'ASSUME', 'END', 'DB'],
    features: [
      'Explicit SEGMENT and ENDS blocks for each memory section',
      'Requires ASSUME directive to bind registers to segment names',
      'Data segment address MUST be loaded manually into DS via MOV AX, DATA_SEG',
      'Generates a multi-segment relocatable .EXE executable file'
    ]
  },
  'simplified': {
    id: 'simplified',
    title: '2. Simplified Dot-Model Style',
    badge: 'EXE Format (Modern)',
    subtitle: 'Concise .MODEL / .DATA / .CODE Shortcut Structure',
    desc: 'The modern, streamlined programming style using dot-directives. Eliminates verbose SEGMENT/ENDS syntax and ASSUME statements while maintaining clean module separation.',
    formatName: 'Simplified Dot-Model .EXE Format',
    code: `; Simplified Dot-Model Style
.MODEL SMALL
.STACK 100H

.DATA
  NUM1 DB 15H
  NUM2 DB 25H
  RESULT DB ?

.CODE
MAIN PROC
  ; Predefined @DATA symbol
  MOV AX, @DATA
  MOV DS, AX

  ; Addition Logic
  MOV AL, NUM1
  ADD AL, NUM2
  MOV RESULT, AL

  ; DOS Exit
  MOV AH, 4CH
  INT 21H
MAIN ENDP
END MAIN`,
    keyDirectives: ['.MODEL', '.STACK', '.DATA', '.CODE', '@DATA', 'PROC', 'ENDP'],
    features: [
      'Uses .MODEL SMALL to automatically configure code and data segment limits',
      'Replaces ASSUME with implicit automated segment declarations',
      'Loads DS using the predefined @DATA symbol',
      'Cleaner, more readable syntax used in modern assembly courses'
    ]
  },
  'com': {
    id: 'com',
    title: '3. Tiny .COM Single Segment Style',
    badge: 'COM Format (Single Segment)',
    subtitle: 'Unified 64KB Memory Space (.MODEL TINY + ORG 100H)',
    desc: 'A ultra-compact program style where Code, Data, and Stack all reside inside a single 64KB physical segment. DOS automatically initializes CS = DS = SS = ES upon startup.',
    formatName: 'Tiny .COM Executable Format',
    code: `; Tiny .COM Single Segment Style
.MODEL TINY
.CODE
ORG 100H  ; Entry point offset for .COM

START:
  JMP REAL_CODE

  ; Embedded Data inside Code Segment
  NUM1 DB 15H
  NUM2 DB 25H
  RESULT DB ?

REAL_CODE:
  ; NO DS Initialization Needed!
  ; DOS automatically sets CS = DS = SS = ES

  MOV AL, NUM1
  ADD AL, NUM2
  MOV RESULT, AL

  ; DOS Exit
  MOV AH, 4CH
  INT 21H

END START`,
    keyDirectives: ['.MODEL TINY', '.CODE', 'ORG 100H', 'JMP', 'END'],
    features: [
      'Combines Code, Data, and Stack into ONE unified 64KB segment',
      'Requires ORG 100H to reserve 256-byte Program Segment Prefix (PSP)',
      'NO manual DS loading required (CS = DS = SS = ES automatically)',
      'Produces lightweight .COM files (maximum size 64KB)'
    ]
  }
};

interface DirectiveSandboxSimulatorProps {
  initialLabId?: string;
  hideExp1a?: boolean;
}

export default function DirectiveSandboxSimulator({ initialLabId, hideExp1a }: DirectiveSandboxSimulatorProps = {}) {
  const [activeTab, setActiveTab] = useState<'directives' | 'styles' | 'models' | 'nearfar' | 'sandbox' | 'multiprecision'>('directives');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDirectiveId, setSelectedDirectiveId] = useState<string>('DB');
  const [selectedStyleId, setSelectedStyleId] = useState<'standard' | 'simplified' | 'com'>('standard');
  const [selectedModelId, setSelectedModelId] = useState<'tiny' | 'small' | 'medium' | 'compact' | 'large' | 'huge'>('small');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Multi-Precision Addition & Subtraction (Exp 1A) State
  const [mpBitWidth, setMpBitWidth] = useState<32 | 64>(32);
  const [mpOp, setMpOp] = useState<'ADD' | 'SUB'>('ADD');
  const [mpOpAHex, setMpOpAHex] = useState<string>('12345678');
  const [mpOpBHex, setMpOpBHex] = useState<string>('9ABCDEF0');
  const [mpStepIdx, setMpStepIdx] = useState<number>(0);
  const [mpAutoPlay, setMpAutoPlay] = useState<boolean>(false);

  const handleSetMpBitWidth = (bits: 32 | 64) => {
    setMpBitWidth(bits);
    setMpStepIdx(0);
    setMpAutoPlay(false);
    if (bits === 32) {
      setMpOpAHex('12345678');
      setMpOpBHex('9ABCDEF0');
    } else {
      setMpOpAHex('123456789ABCDEF0');
      setMpOpBHex('FEDCBA9876543210');
    }
  };

  useEffect(() => {
    if (hideExp1a && activeTab === 'multiprecision') {
      setActiveTab('directives');
    }
  }, [hideExp1a, activeTab]);

  useEffect(() => {
    if (initialLabId) {
      if ((initialLabId === 'multiprecision' || initialLabId === 'exp1a' || initialLabId === 'm20-s1') && !hideExp1a) {
        setActiveTab('multiprecision');
      } else if (initialLabId === 'stacklab' || initialLabId === 'stack') {
        setActiveTab('nearfar');
        setNearFarSubMode('stacklab');
      } else if (initialLabId === 'nearfar' || initialLabId === 'procs') {
        setActiveTab('nearfar');
        setNearFarSubMode('procs');
      } else if (['directives', 'styles', 'models', 'sandbox', 'nearfar', 'multiprecision'].includes(initialLabId)) {
        if (initialLabId === 'multiprecision' && hideExp1a) {
          setActiveTab('directives');
        } else {
          setActiveTab(initialLabId as any);
        }
      }
    }
  }, [initialLabId, hideExp1a]);

  interface MpStepInfo {
    stepNum: number;
    codeLine: string;
    explanation: string;
    axVal: number;
    cf: number;
    zf: number;
    sf: number;
    activeWordIdx: number;
    storedResultWords: (number | null)[];
    codeBlockIdx: number;
  }

  const getMpSteps = (): MpStepInfo[] => {
    const is32 = mpBitWidth === 32;
    const isAdd = mpOp === 'ADD';
    const numWords = is32 ? 2 : 4;
    
    // Parse hex input into 16-bit words (Little-Endian: Word 0 = LSB, Word N-1 = MSB)
    const cleanA = mpOpAHex.replace(/[^0-9A-Fa-f]/g, '').padStart(numWords * 4, '0').slice(-(numWords * 4));
    const cleanB = mpOpBHex.replace(/[^0-9A-Fa-f]/g, '').padStart(numWords * 4, '0').slice(-(numWords * 4));

    const wordsA: number[] = [];
    const wordsB: number[] = [];
    for (let i = numWords - 1; i >= 0; i--) {
      const chunkA = cleanA.substr(i * 4, 4);
      const chunkB = cleanB.substr(i * 4, 4);
      wordsA.push(parseInt(chunkA, 16) || 0);
      wordsB.push(parseInt(chunkB, 16) || 0);
    }

    const steps: MpStepInfo[] = [];
    const currentResults: (number | null)[] = Array(numWords).fill(null);

    // Initial Step 0
    steps.push({
      stepNum: 0,
      codeLine: `; --- ${mpBitWidth}-Bit Multi-Precision ${isAdd ? 'Addition (ADC)' : 'Subtraction (SBB)'} Initialization ---`,
      explanation: `Program initialized in RAM. Operands A (${cleanA.toUpperCase()}H) and B (${cleanB.toUpperCase()}H) loaded into Data Segment memory in Little-Endian word order.`,
      axVal: 0,
      cf: 0,
      zf: 0,
      sf: 0,
      activeWordIdx: -1,
      storedResultWords: [...currentResults],
      codeBlockIdx: 0
    });

    let currentCF = 0;
    let currentAX = 0;
    let lineIdx = 1;

    for (let w = 0; w < numWords; w++) {
      const offsetStr = w === 0 ? '' : ` + ${w * 2}`;
      const wordA = wordsA[w];
      const wordB = wordsB[w];

      // 1. Load Word w of Operand A into AX
      currentAX = wordA;
      steps.push({
        stepNum: steps.length,
        codeLine: `MOV AX, WORD PTR [NUM1${offsetStr}]`,
        explanation: `Loads Word ${w} (Bits ${w * 16}..${(w + 1) * 16 - 1}) of Operand A (${hexFormat(wordA)}) into register AX.`,
        axVal: currentAX,
        cf: currentCF,
        zf: 0,
        sf: 0,
        activeWordIdx: w,
        storedResultWords: [...currentResults],
        codeBlockIdx: lineIdx++
      });

      // 2. Add/Subtract Word w of Operand B
      let rawResult = 0;
      let opInst = '';
      if (w === 0) {
        opInst = isAdd ? 'ADD' : 'SUB';
        if (isAdd) {
          rawResult = wordA + wordB;
        } else {
          rawResult = wordA - wordB;
        }
      } else {
        opInst = isAdd ? 'ADC' : 'SBB';
        if (isAdd) {
          rawResult = wordA + wordB + currentCF;
        } else {
          rawResult = wordA - wordB - currentCF;
        }
      }

      // Compute Flags
      let nextCF = 0;
      if (isAdd) {
        nextCF = rawResult > 0xFFFF ? 1 : 0;
      } else {
        nextCF = rawResult < 0 ? 1 : 0;
      }

      currentAX = (rawResult & 0xFFFF);
      if (currentAX < 0) currentAX += 0x10000;
      const prevCF = currentCF;
      currentCF = nextCF;

      const zf = currentAX === 0 ? 1 : 0;
      const sf = (currentAX & 0x8000) ? 1 : 0;

      const detailMsg = isAdd
        ? (w === 0
            ? `Executes 16-bit ADD (${hexFormat(wordA)} + ${hexFormat(wordB)} = ${(wordA + wordB).toString(16).toUpperCase()}H). ${nextCF ? 'CARRY OVER DETECTED! Sets Carry Flag CF = 1.' : 'No carry overflow. CF = 0.'}`
            : `Executes 16-bit ADC (Add with Carry: ${hexFormat(wordA)} + ${hexFormat(wordB)} + Carry(${prevCF}) = ${(rawResult & 0xFFFF).toString(16).toUpperCase()}H). ${nextCF ? 'Propagates Carry out! Sets CF = 1.' : 'Carry resolved. CF = 0.'}`)
        : (w === 0
            ? `Executes 16-bit SUB (${hexFormat(wordA)} - ${hexFormat(wordB)}). ${nextCF ? 'BORROW REQUIRED! Sets Carry Flag (Borrow) CF = 1.' : 'No borrow needed. CF = 0.'}`
            : `Executes 16-bit SBB (Subtract with Borrow: ${hexFormat(wordA)} - ${hexFormat(wordB)} - Borrow(${prevCF})). ${nextCF ? 'Propagates Borrow! Sets CF = 1.' : 'Borrow resolved. CF = 0.'}`);

      steps.push({
        stepNum: steps.length,
        codeLine: `${opInst} AX, WORD PTR [NUM2${offsetStr}]`,
        explanation: detailMsg,
        axVal: currentAX,
        cf: currentCF,
        zf,
        sf,
        activeWordIdx: w,
        storedResultWords: [...currentResults],
        codeBlockIdx: lineIdx++
      });

      // 3. Store Result Word w into RAM
      currentResults[w] = currentAX;
      steps.push({
        stepNum: steps.length,
        codeLine: `MOV WORD PTR [RESULT${offsetStr}], AX`,
        explanation: `Stores Word ${w} result (${hexFormat(currentAX)}) into RAM offset RESULT${offsetStr}.`,
        axVal: currentAX,
        cf: currentCF,
        zf,
        sf,
        activeWordIdx: w,
        storedResultWords: [...currentResults],
        codeBlockIdx: lineIdx++
      });
    }

    // Final Summary Step
    let fullHexResult = '';
    for (let i = numWords - 1; i >= 0; i--) {
      fullHexResult += (currentResults[i] ?? 0).toString(16).toUpperCase().padStart(4, '0');
    }

    steps.push({
      stepNum: steps.length,
      codeLine: `; --- ${mpBitWidth}-Bit ${isAdd ? 'Addition' : 'Subtraction'} Execution Complete ---`,
      explanation: `🎉 Complete ${mpBitWidth}-bit ${isAdd ? 'multi-precision sum' : 'multi-precision difference'} = ${fullHexResult}H stored in RAM. ${currentCF ? '⚠️ Final 33rd/65th bit carry out occurred!' : '✅ Calculation finished cleanly with 0 final carry.'}`,
      axVal: currentAX,
      cf: currentCF,
      zf: currentAX === 0 ? 1 : 0,
      sf: (currentAX & 0x8000) ? 1 : 0,
      activeWordIdx: -1,
      storedResultWords: [...currentResults],
      codeBlockIdx: lineIdx
    });

    return steps;
  };

  useEffect(() => {
    let timer: any = null;
    if (mpAutoPlay) {
      const steps = getMpSteps();
      timer = setInterval(() => {
        setMpStepIdx(prev => {
          if (prev < steps.length - 1) {
            return prev + 1;
          } else {
            setMpAutoPlay(false);
            return prev;
          }
        });
      }, 1400);
    }
    return () => clearInterval(timer);
  }, [mpAutoPlay, mpBitWidth, mpOp, mpOpAHex, mpOpBHex]);

  // NEAR / FAR Calls & Stack Operations Simulator State
  const [nearFarSubMode, setNearFarSubMode] = useState<'procs' | 'stacklab'>('procs');
  const [nearFarType, setNearFarType] = useState<'near' | 'far'>('near');
  const [callStep, setCallStep] = useState<'idle' | 'pushed' | 'returned'>('idle');

  // Interactive Stack Register Lab State (PUSH & POP)
  const [labPushReg, setLabPushReg] = useState<string>('AX');
  const [labPushCustomVal, setLabPushCustomVal] = useState<string>('1234');
  const [labPopReg, setLabPopReg] = useState<string>('DX');
  const [labStackLog, setLabStackLog] = useState<string>('Ready to test 8086 PUSH and POP stack operations.');

  interface LabStackSlot {
    addr: number;
    val: number;
    pushedFrom: string;
  }

  const [labRegs, setLabRegs] = useState<Record<string, number>>({
    AX: 0x1234,
    BX: 0x5678,
    CX: 0x9ABC,
    DX: 0x0000,
    SI: 0x0010,
    DI: 0x0020,
    BP: 0x0000,
    SP: 0x00FC
  });

  const [labStackSlots, setLabStackSlots] = useState<LabStackSlot[]>([
    { addr: 0x00FE, val: 0x1234, pushedFrom: 'AX (1234H)' },
    { addr: 0x00FC, val: 0x5678, pushedFrom: 'BX (5678H)' }
  ]);

  const handleLabPush = (regKey: string) => {
    let pushValue = 0x1234;
    let label = '';
    if (regKey === 'CUSTOM') {
      pushValue = parseInt(labPushCustomVal, 16) || 0x1234;
      label = `Custom (${byteHexFormat((pushValue >> 8) & 0xFF)}${byteHexFormat(pushValue & 0xFF)})`;
    } else {
      pushValue = labRegs[regKey] ?? 0x1234;
      label = `${regKey} (${hexFormat(pushValue)})`;
    }

    const currentSP = labRegs.SP ?? 0x00FC;
    const newSP = currentSP - 2;

    const newSlot: LabStackSlot = {
      addr: newSP,
      val: pushValue,
      pushedFrom: label
    };

    setLabStackSlots(prev => [...prev, newSlot]);
    setLabRegs(prev => ({ ...prev, SP: newSP }));

    const highByte = (pushValue >> 8) & 0xFF;
    const lowByte = pushValue & 0xFF;

    setLabStackLog(
      `⚡ [PUSH OPERATION EXECUTED]:\n` +
      `1. Micro-step 1: Decrement Stack Pointer SP by 2 (SP ← ${hexFormat(currentSP)} - 2 = ${hexFormat(newSP)}).\n` +
      `2. Micro-step 2: Store 16-bit word ${hexFormat(pushValue)} into Stack RAM at SS:${hexFormat(newSP)}.\n` +
      `3. Little-Endian Byte Storage: High byte (${byteHexFormat(highByte)}) stored at SS:${hexFormat(newSP + 1)}, Low byte (${byteHexFormat(lowByte)}) stored at SS:${hexFormat(newSP)}.\n` +
      `4. Top of Stack (TOS) updated to SS:${hexFormat(newSP)}. Base of Stack remains at SS:0100H.`
    );
  };

  const handleLabPop = (targetReg: string) => {
    const currentSP = labRegs.SP ?? 0x00FC;

    if (labStackSlots.length === 0 || currentSP >= 0x0100) {
      setLabStackLog(
        `⚠️ [STACK UNDERFLOW WARNING]:\n` +
        `Stack Pointer (SP = ${hexFormat(currentSP)}) is at or above the Base of Stack (SS:0100H).\n` +
        `Cannot POP from an empty stack!`
      );
      return;
    }

    const poppedSlot = labStackSlots[labStackSlots.length - 1];
    const newSlots = labStackSlots.slice(0, -1);
    const newSP = currentSP + 2;

    setLabStackSlots(newSlots);
    setLabRegs(prev => ({
      ...prev,
      [targetReg]: poppedSlot.val,
      SP: newSP
    }));

    setLabStackLog(
      `✅ [POP OPERATION EXECUTED]:\n` +
      `1. Micro-step 1: Read 16-bit word ${hexFormat(poppedSlot.val)} from Top of Stack SS:${hexFormat(poppedSlot.addr)} into register ${targetReg}.\n` +
      `2. Micro-step 2: Increment Stack Pointer SP by 2 (SP ← ${hexFormat(currentSP)} + 2 = ${hexFormat(newSP)}).\n` +
      `3. Top of Stack (TOS) restored UP toward Base of Stack (SS:0100H).\n` +
      `4. Register ${targetReg} updated to ${hexFormat(poppedSlot.val)}.`
    );
  };

  const handleResetLabStack = () => {
    setLabStackSlots([]);
    setLabRegs(prev => ({ ...prev, SP: 0x0100 }));
    setLabStackLog(`Stack reset to Base of Stack (SS:0100H). Stack Pointer SP = 0100H.`);
  };

  const handleLoadSampleLabStack = () => {
    setLabStackSlots([
      { addr: 0x00FE, val: 0x1234, pushedFrom: 'AX (1234H)' },
      { addr: 0x00FC, val: 0x5678, pushedFrom: 'BX (5678H)' },
      { addr: 0x00FA, val: 0x9ABC, pushedFrom: 'CX (9ABCH)' }
    ]);
    setLabRegs(prev => ({ ...prev, SP: 0x00FA }));
    setLabStackLog(`Sample stack frame loaded. 3 words pushed. Top of Stack TOS = SS:00FAH (SP = 00FAH), Base of Stack = SS:0100H.`);
  };

  // Memory Sandbox state
  const [var1Val, setVar1Val] = useState<string>('7A');
  const [var2Val, setVar2Val] = useState<string>('1F04');
  const [dupCount, setDupCount] = useState<number>(3);

  const selectedDirective = directivesCatalog[selectedDirectiveId] || directivesCatalog['DB'];
  const selectedStyle = programmingStylesData[selectedStyleId];

  const handleCopyCode = (text: string) => {
    if (navigator && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const categories = ['All', 'Segment Control', 'Data Definition', 'Procedure & Scope', 'General Symbol'];

  const filteredDirectives = Object.values(directivesCatalog).filter(d => {
    if (selectedCategory === 'All') return true;
    return d.category === selectedCategory;
  });

  return (
    <div id="directive-sandbox-simulator" className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 text-slate-800 flex flex-col justify-between shadow-xs min-h-[750px] max-w-7xl mx-auto w-full">
      {/* Top Main Navigation Tabs */}
      {activeTab !== 'multiprecision' && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 mb-6">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Binary className="w-5 h-5 text-indigo-600" />
              8086 Assembler Directives & Programming Styles
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Interactive compile-time directive reference, program structure comparison, and RAM memory layout analyzer
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
            <button
              id="btn-tab-directives"
              onClick={() => setActiveTab('directives')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'directives'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Assembler Directives
            </button>
            <button
              id="btn-tab-styles"
              onClick={() => setActiveTab('styles')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'styles'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-4 h-4 text-indigo-600" />
              Programming Styles
            </button>
            <button
              id="btn-tab-models"
              onClick={() => setActiveTab('models')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'models'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4 text-indigo-600" />
              Memory Models (.MODEL)
            </button>
            <button
              id="btn-tab-nearfar"
              onClick={() => setActiveTab('nearfar')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'nearfar'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PhoneCall className="w-4 h-4 text-indigo-600" />
              NEAR & FAR Calls
            </button>
            {!hideExp1a && (
              <button
                id="btn-tab-multiprecision"
                onClick={() => setActiveTab('multiprecision')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'multiprecision'
                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calculator className="w-4 h-4 text-indigo-600" />
                Exp 1A: Multi-Precision
              </button>
            )}
            <button
              id="btn-tab-sandbox"
              onClick={() => setActiveTab('sandbox')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'sandbox'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Database className="w-4 h-4 text-indigo-600" />
              Memory Layout Sandbox
            </button>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 min-h-[580px]">
        {/* TAB 1: ASSEMBLER DIRECTIVES CATALOG */}
        {activeTab === 'directives' && (
          <motion.div
            key="directives-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Filter:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid Layout: Left List of Directives, Right Detail Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Directive Cards List */}
              <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
                {filteredDirectives.map((dir) => {
                  const isSelected = dir.id === selectedDirectiveId;
                  return (
                    <button
                      key={dir.id}
                      onClick={() => setSelectedDirectiveId(dir.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-300 shadow-sm'
                          : 'bg-slate-50/50 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <span className={`text-[9px] font-mono font-bold uppercase block mb-1 ${
                          isSelected ? 'text-indigo-600' : 'text-slate-400'
                        }`}>
                          {dir.category}
                        </span>
                        <h4 className="text-xs font-extrabold font-mono text-slate-900 tracking-tight">
                          {dir.name}
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono mt-2 block truncate">
                        {dir.fullForm}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right Directive Inspector Box */}
              <div className="lg:col-span-6 bg-slate-900 text-slate-100 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-extrabold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-md">
                        {selectedDirective.category}
                      </span>
                      <span className="text-[10px] font-mono font-extrabold uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                        {selectedDirective.styleAffiliation}
                      </span>
                    </div>
                    <h3 className="text-lg font-mono font-black text-white tracking-tight">
                      {selectedDirective.name}
                    </h3>
                    <p className="text-xs font-mono text-indigo-300 mt-0.5">
                      {selectedDirective.fullForm}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] font-mono uppercase text-slate-400 block font-bold">Compile Size</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {selectedDirective.bytesAllocated}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block tracking-wider">
                    Purpose & Compile-Time Behavior
                  </span>
                  <p className="text-xs leading-relaxed text-slate-300 font-sans">
                    {selectedDirective.desc}
                  </p>
                </div>

                {/* Assembly Example Block */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
                      8086 Assembly Syntax Example
                    </span>
                    <button
                      onClick={() => handleCopyCode(selectedDirective.example)}
                      className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedCode ? 'Copied!' : 'Copy Code'}
                    </button>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 font-mono text-xs text-emerald-300 overflow-x-auto shadow-inner">
                    <pre>{selectedDirective.example}</pre>
                  </div>
                </div>

                {/* Important distinction note */}
                <div className="bg-indigo-950/40 border border-indigo-800/50 rounded-2xl p-3 flex items-start gap-2 text-indigo-200 text-xs">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="leading-snug text-[11px]">
                    <strong>Note:</strong> Assembler directives are processed by the assembler software (MASM/TASM) at compile-time and do NOT generate executable machine opcodes in the CPU.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: TYPES OF ASSEMBLY PROGRAMMING STYLES */}
        {activeTab === 'styles' && (
          <motion.div
            key="styles-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            {/* Style Selector Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['standard', 'simplified', 'com'] as const).map((styleKey) => {
                const style = programmingStylesData[styleKey];
                const isSelected = styleKey === selectedStyleId;
                return (
                  <button
                    key={styleKey}
                    onClick={() => setSelectedStyleId(styleKey)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-400'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <span className={`text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-md inline-block mb-2 ${
                        isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {style.badge}
                      </span>
                      <h3 className="text-sm font-extrabold tracking-tight font-sans">
                        {style.title}
                      </h3>
                    </div>
                    <p className={`text-xs mt-2 font-mono leading-snug ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                      {style.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Selected Style Deep-Dive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Code Editor View */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-5 text-slate-100 shadow-xl space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-mono font-bold text-indigo-300">{selectedStyle.formatName}</span>
                  </div>
                  <button
                    onClick={() => handleCopyCode(selectedStyle.code)}
                    className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCode ? 'Copied Code' : 'Copy Program'}
                  </button>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-emerald-300 overflow-x-auto shadow-inner max-h-[420px]">
                  <pre className="whitespace-pre">{selectedStyle.code}</pre>
                </div>
              </div>

              {/* Right Architectural Characteristics */}
              <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-5">
                <div>
                  <span className="text-[10px] font-mono font-extrabold uppercase text-indigo-600 tracking-wider block">
                    Style Characteristics
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight mt-0.5">
                    {selectedStyle.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {selectedStyle.desc}
                  </p>
                </div>

                {/* Key Directives Used */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">
                    Key Directives Required
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStyle.keyDirectives.map((kd) => (
                      <span key={kd} className="text-xs font-mono font-bold bg-white border border-slate-200 text-indigo-700 px-2.5 py-1 rounded-lg shadow-2xs">
                        {kd}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">
                    Key Features & Mechanics
                  </span>
                  <ul className="space-y-2">
                    {selectedStyle.features.map((ft, fi) => (
                      <li key={fi} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{ft}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Comparison Matrix Table */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3">
              <h4 className="text-xs font-extrabold font-mono text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-indigo-600" />
                Feature Comparison Matrix across 8086 Program Styles
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] uppercase text-slate-400 font-bold bg-white">
                      <th className="p-2.5">Feature</th>
                      <th className="p-2.5 text-indigo-700">1. Standard Segment Style</th>
                      <th className="p-2.5 text-emerald-700">2. Simplified Dot-Model Style</th>
                      <th className="p-2.5 text-amber-700">3. Tiny .COM Style</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 text-slate-700">
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900">Segment Boundaries</td>
                      <td className="p-2.5">Explicit <code className="text-indigo-600">SEGMENT / ENDS</code></td>
                      <td className="p-2.5"><code className="text-emerald-600">.DATA</code> and <code className="text-emerald-600">.CODE</code> shortcuts</td>
                      <td className="p-2.5"><code className="text-amber-600">.MODEL TINY</code> single segment</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900">DS Loading Method</td>
                      <td className="p-2.5"><code className="text-indigo-600">MOV AX, DATA_SEG</code></td>
                      <td className="p-2.5"><code className="text-emerald-600">MOV AX, @DATA</code></td>
                      <td className="p-2.5"><strong className="text-emerald-600">Automatic by OS</strong> (CS=DS=SS=ES)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900">Executable Format</td>
                      <td className="p-2.5">Multi-segment .EXE file</td>
                      <td className="p-2.5">Multi-segment .EXE file</td>
                      <td className="p-2.5">Lightweight single-segment .COM file</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900">Max Memory Reach</td>
                      <td className="p-2.5">Up to 1 MB physical RAM</td>
                      <td className="p-2.5">Up to 1 MB physical RAM</td>
                      <td className="p-2.5">Maximum 64 KB total program size</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: 8086 MEMORY MODELS COMPARATOR */}
        {activeTab === 'models' && (
          <motion.div
            key="models-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            {/* Header description */}
            <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-indigo-950 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  8086 Memory Models (.MODEL Directive)
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  The <code className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 font-mono text-[11px] rounded font-bold">.MODEL &lt;size&gt;</code> directive specifies the memory layout, segment count, pointer types (NEAR vs FAR), and segment limits.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold bg-indigo-600 text-white px-3 py-1 rounded-full uppercase tracking-wider shrink-0">
                MASM / TASM Standard
              </span>
            </div>

            {/* Model Selector Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {[
                { id: 'tiny', name: '.MODEL TINY', codeLimit: '64KB Shared', dataLimit: 'Shared' },
                { id: 'small', name: '.MODEL SMALL', codeLimit: '1 Code (64KB)', dataLimit: '1 Data (64KB)' },
                { id: 'medium', name: '.MODEL MEDIUM', codeLimit: 'Multi Code', dataLimit: '1 Data (64KB)' },
                { id: 'compact', name: '.MODEL COMPACT', codeLimit: '1 Code (64KB)', dataLimit: 'Multi Data' },
                { id: 'large', name: '.MODEL LARGE', codeLimit: 'Multi Code', dataLimit: 'Multi Data' },
                { id: 'huge', name: '.MODEL HUGE', codeLimit: 'Multi Code', dataLimit: 'Multi (>64K Array)' }
              ].map(m => {
                const isSel = selectedModelId === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModelId(m.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSel
                        ? 'bg-indigo-600 border-indigo-700 text-white shadow-md scale-[1.02] z-10'
                        : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-indigo-300'
                    }`}
                  >
                    <div>
                      <span className={`text-xs font-mono font-extrabold block ${isSel ? 'text-white' : 'text-slate-900'}`}>
                        {m.name}
                      </span>
                      <span className={`text-[9px] font-mono mt-1 block ${isSel ? 'text-indigo-200' : 'text-slate-500'}`}>
                        Code: {m.codeLimit}
                      </span>
                    </div>
                    <span className={`text-[9px] font-mono mt-1 block font-semibold ${isSel ? 'text-emerald-300' : 'text-indigo-600'}`}>
                      Data: {m.dataLimit}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Detailed Selected Model Overview & Visual Segment Diagram */}
            {(() => {
              const modelDataMap: Record<string, {
                name: string; badge: string; codeSegs: string; dataSegs: string;
                codeCalls: string; dataPtrs: string; maxArraySize: string; fileType: string;
                desc: string; bestFor: string; boilerplate: string;
              }> = {
                tiny: {
                  name: '.MODEL TINY', badge: 'Single Segment (64KB Total)', codeSegs: '1 Segment (Shared)', dataSegs: '1 Segment (Shared)',
                  codeCalls: 'NEAR (16-bit offset)', dataPtrs: 'NEAR (16-bit offset)', maxArraySize: '64 KB total program', fileType: '.COM executable',
                  desc: 'Code, Data, and Stack all reside inside a SINGLE 64KB physical segment. CS, DS, SS, and ES registers all hold identical segment addresses upon load.',
                  bestFor: 'Lightweight DOS tools, TSR background utilities, ROM firmwares.',
                  boilerplate: `; --- .MODEL TINY Boilerplate ---
.MODEL TINY
.CODE
ORG 100H     ; .COM Entry Point PSP Offset

START:
  MOV AH, 09H
  MOV DX, OFFSET MSG
  INT 21H
  MOV AH, 4CH
  INT 21H

  MSG DB 'Hello from TINY Model!', '$'
END START`
                },
                small: {
                  name: '.MODEL SMALL', badge: 'Dual Segment (128KB Max)', codeSegs: '1 Code Segment (≤64KB)', dataSegs: '1 Data Segment (≤64KB)',
                  codeCalls: 'NEAR (16-bit offset)', dataPtrs: 'NEAR (16-bit offset)', maxArraySize: '64 KB', fileType: '.EXE executable',
                  desc: 'One dedicated Code segment (64KB max) and one dedicated Data + Stack segment (64KB max). Uses fast 16-bit NEAR calls and pointers.',
                  bestFor: 'Standard 8086 programs, classroom lab assignments, desktop CLI tools.',
                  boilerplate: `; --- .MODEL SMALL Boilerplate ---
.MODEL SMALL
.STACK 100H

.DATA
  MSG DB 'Hello from SMALL Model!', '$'

.CODE
MAIN PROC
  MOV AX, @DATA
  MOV DS, AX

  MOV AH, 09H
  LEA DX, MSG
  INT 21H

  MOV AH, 4CH
  INT 21H
MAIN ENDP
END MAIN`
                },
                medium: {
                  name: '.MODEL MEDIUM', badge: 'Multi-Code / Single Data', codeSegs: 'Multiple Segments (>64KB)', dataSegs: '1 Data Segment (≤64KB)',
                  codeCalls: 'FAR (32-bit CS:IP)', dataPtrs: 'NEAR (16-bit offset)', maxArraySize: '64 KB', fileType: '.EXE executable',
                  desc: 'Code can span multiple 64KB segments (>64KB using FAR subroutines), but Data is restricted to a single 64KB data segment.',
                  bestFor: 'Large applications with extensive algorithms or procedures, but small global variable footprint.',
                  boilerplate: `; --- .MODEL MEDIUM Boilerplate ---
.MODEL MEDIUM
.STACK 100H

.DATA
  RESULT DW ?

.CODE
MAIN PROC
  MOV AX, @DATA
  MOV DS, AX
  CALL FAR PTR BIG_SUBROUTINE
  MOV AH, 4CH
  INT 21H
MAIN ENDP
END MAIN`
                },
                compact: {
                  name: '.MODEL COMPACT', badge: 'Single Code / Multi-Data', codeSegs: '1 Code Segment (≤64KB)', dataSegs: 'Multiple Segments (>64KB)',
                  codeCalls: 'NEAR (16-bit offset)', dataPtrs: 'FAR (32-bit DS:Offset)', maxArraySize: '64 KB per array', fileType: '.EXE executable',
                  desc: 'Code is restricted to a single 64KB segment (using NEAR calls), but Data can span multiple data segments (>64KB total using FAR pointers).',
                  bestFor: 'Small processing routines manipulating large external datasets or multiple data arrays.',
                  boilerplate: `; --- .MODEL COMPACT Boilerplate ---
.MODEL COMPACT
.STACK 100H

.DATA
  ARRAY1 DB 1000 DUP(0)

.DATA?
  LARGE_BUFFER DB 30000 DUP(?)

.CODE
MAIN PROC
  MOV AX, @DATA
  MOV DS, AX
  ; Data references use 32-bit FAR pointers
  MOV AH, 4CH
  INT 21H
MAIN ENDP
END MAIN`
                },
                large: {
                  name: '.MODEL LARGE', badge: 'Multi-Code / Multi-Data', codeSegs: 'Multiple Segments (>64KB)', dataSegs: 'Multiple Segments (>64KB)',
                  codeCalls: 'FAR (32-bit CS:IP)', dataPtrs: 'FAR (32-bit DS:Offset)', maxArraySize: '64 KB per array', fileType: '.EXE executable',
                  desc: 'Both Code and Data span multiple 64KB physical segments. Uses 32-bit FAR pointers for all code subroutines and memory data structures.',
                  bestFor: 'Complex enterprise software with large codebases and extensive datasets.',
                  boilerplate: `; --- .MODEL LARGE Boilerplate ---
.MODEL LARGE
.STACK 200H

.DATA
  VAR_A DW 1234H

.CODE
MAIN PROC
  MOV AX, @DATA
  MOV DS, AX
  ; Uses FAR code calls and FAR data pointers
  MOV AH, 4CH
  INT 21H
MAIN ENDP
END MAIN`
                },
                huge: {
                  name: '.MODEL HUGE', badge: 'Multi-Code / Multi-Data / Unlimited Arrays', codeSegs: 'Multiple Segments (>64KB)', dataSegs: 'Multiple Segments (>64KB)',
                  codeCalls: 'FAR (32-bit CS:IP)', dataPtrs: 'FAR with Segment Arithmetic', maxArraySize: 'Unlimited (>64 KB arrays allowed!)', fileType: '.EXE executable',
                  desc: 'Identical to LARGE model, with the added capability that single data structures or arrays CAN exceed 64KB by performing automatic segment pointer arithmetic.',
                  bestFor: 'Scientific calculations, graphics frame buffers, or matrix operations where single data structures exceed 64KB.',
                  boilerplate: `; --- .MODEL HUGE Boilerplate ---
.MODEL HUGE
.STACK 400H

.DATA
  HUGE_ARRAY DB 100000 DUP(0) ; Exceeds 64KB segment limit!

.CODE
MAIN PROC
  MOV AX, @DATA
  MOV DS, AX
  ; Handles segment overflow arithmetic automatically
  MOV AH, 4CH
  INT 21H
MAIN ENDP
END MAIN`
                }
              };

              const currentModel = modelDataMap[selectedModelId] || modelDataMap['small'];

              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                  
                  {/* Left: Spec Card & Characteristics (7 Cols) */}
                  <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-200 pb-3 mb-3">
                        <div>
                          <h4 className="text-base font-extrabold text-slate-900 font-mono">
                            {currentModel.name}
                          </h4>
                          <span className="text-[10px] font-mono text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            {currentModel.badge}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-extrabold text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-lg">
                          Format: {currentModel.fileType}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed mb-4">
                        {currentModel.desc}
                      </p>

                      {/* Specs Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
                        <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                          <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block">Code Allocation</span>
                          <span className="text-xs font-extrabold text-indigo-900 block mt-0.5">{currentModel.codeSegs}</span>
                        </div>
                        <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                          <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block">Data Allocation</span>
                          <span className="text-xs font-extrabold text-emerald-900 block mt-0.5">{currentModel.dataSegs}</span>
                        </div>
                        <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                          <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block">Subroutine Calls</span>
                          <span className="text-xs font-extrabold text-slate-800 block mt-0.5">{currentModel.codeCalls}</span>
                        </div>
                        <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                          <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block">Data Pointers</span>
                          <span className="text-xs font-extrabold text-slate-800 block mt-0.5">{currentModel.dataPtrs}</span>
                        </div>
                        <div className="p-2.5 bg-white border border-slate-200 rounded-xl sm:col-span-2">
                          <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block">Max Single Array Size</span>
                          <span className="text-xs font-extrabold text-indigo-700 block mt-0.5">{currentModel.maxArraySize}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-white border border-indigo-150 rounded-xl text-xs text-slate-700">
                        <strong className="text-indigo-900 font-bold block mb-0.5 font-mono text-[11px]">Recommended Application Domain:</strong>
                        {currentModel.bestFor}
                      </div>
                    </div>
                  </div>

                  {/* Right: Assembly Boilerplate Code Preview (5 Cols) */}
                  <div className="lg:col-span-5 bg-slate-900 text-slate-100 rounded-2xl p-4 border border-slate-800 font-mono text-xs flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Code2 className="w-3.5 h-3.5" />
                          Boilerplate Code Structure
                        </span>
                        <button
                          onClick={() => handleCopyCode(currentModel.boilerplate)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] flex items-center gap-1 transition-all cursor-pointer"
                        >
                          {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          {copiedCode ? 'Copied' : 'Copy'}
                        </button>
                      </div>

                      <pre className="text-[11px] leading-relaxed text-indigo-300 bg-slate-950 p-3 rounded-xl overflow-x-auto border border-slate-800">
                        {currentModel.boilerplate}
                      </pre>
                    </div>

                    <p className="text-[9.5px] text-slate-500 italic mt-3">
                      Note: The <code className="text-indigo-400">.MODEL</code> directive must always precede segment blocks (.DATA, .CODE, .STACK) in simplified assembly syntax.
                    </p>
                  </div>

                </div>
              );
            })()}

            {/* Side-by-Side Comparison Matrix */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
              <h4 className="text-xs font-extrabold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-indigo-600" />
                Side-by-Side 8086 Memory Models Comparison Matrix
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                      <th className="p-2.5 font-bold">Memory Model</th>
                      <th className="p-2.5 font-bold">Code Segments</th>
                      <th className="p-2.5 font-bold">Data Segments</th>
                      <th className="p-2.5 font-bold">Code Calls</th>
                      <th className="p-2.5 font-bold">Data Pointers</th>
                      <th className="p-2.5 font-bold">Single Array Limit</th>
                      <th className="p-2.5 font-bold">Target File</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr className="hover:bg-indigo-50/30">
                      <td className="p-2.5 font-extrabold text-indigo-900">.MODEL TINY</td>
                      <td className="p-2.5">1 (Shared 64K)</td>
                      <td className="p-2.5">1 (Shared 64K)</td>
                      <td className="p-2.5 text-emerald-700 font-bold">NEAR</td>
                      <td className="p-2.5 text-emerald-700 font-bold">NEAR</td>
                      <td className="p-2.5">64 KB total</td>
                      <td className="p-2.5 font-bold text-slate-900">.COM</td>
                    </tr>
                    <tr className="hover:bg-indigo-50/30 bg-slate-50/40">
                      <td className="p-2.5 font-extrabold text-indigo-900">.MODEL SMALL</td>
                      <td className="p-2.5">1 (≤64 KB)</td>
                      <td className="p-2.5">1 (≤64 KB)</td>
                      <td className="p-2.5 text-emerald-700 font-bold">NEAR</td>
                      <td className="p-2.5 text-emerald-700 font-bold">NEAR</td>
                      <td className="p-2.5">64 KB</td>
                      <td className="p-2.5 font-bold text-slate-900">.EXE</td>
                    </tr>
                    <tr className="hover:bg-indigo-50/30">
                      <td className="p-2.5 font-extrabold text-indigo-900">.MODEL MEDIUM</td>
                      <td className="p-2.5 text-indigo-700 font-bold">Multiple (&gt;64K)</td>
                      <td className="p-2.5">1 (≤64 KB)</td>
                      <td className="p-2.5 text-purple-700 font-bold">FAR</td>
                      <td className="p-2.5 text-emerald-700 font-bold">NEAR</td>
                      <td className="p-2.5">64 KB</td>
                      <td className="p-2.5 font-bold text-slate-900">.EXE</td>
                    </tr>
                    <tr className="hover:bg-indigo-50/30 bg-slate-50/40">
                      <td className="p-2.5 font-extrabold text-indigo-900">.MODEL COMPACT</td>
                      <td className="p-2.5">1 (≤64 KB)</td>
                      <td className="p-2.5 text-indigo-700 font-bold">Multiple (&gt;64K)</td>
                      <td className="p-2.5 text-emerald-700 font-bold">NEAR</td>
                      <td className="p-2.5 text-purple-700 font-bold">FAR</td>
                      <td className="p-2.5">64 KB</td>
                      <td className="p-2.5 font-bold text-slate-900">.EXE</td>
                    </tr>
                    <tr className="hover:bg-indigo-50/30">
                      <td className="p-2.5 font-extrabold text-indigo-900">.MODEL LARGE</td>
                      <td className="p-2.5 text-indigo-700 font-bold">Multiple (&gt;64K)</td>
                      <td className="p-2.5 text-indigo-700 font-bold">Multiple (&gt;64K)</td>
                      <td className="p-2.5 text-purple-700 font-bold">FAR</td>
                      <td className="p-2.5 text-purple-700 font-bold">FAR</td>
                      <td className="p-2.5">64 KB</td>
                      <td className="p-2.5 font-bold text-slate-900">.EXE</td>
                    </tr>
                    <tr className="hover:bg-indigo-50/30 bg-slate-50/40">
                      <td className="p-2.5 font-extrabold text-indigo-900">.MODEL HUGE</td>
                      <td className="p-2.5 text-indigo-700 font-bold">Multiple (&gt;64K)</td>
                      <td className="p-2.5 text-indigo-700 font-bold">Multiple (&gt;64K)</td>
                      <td className="p-2.5 text-purple-700 font-bold">FAR</td>
                      <td className="p-2.5 text-purple-700 font-bold">FAR + Arithmetic</td>
                      <td className="p-2.5 text-emerald-600 font-bold">&gt;64 KB Allowed</td>
                      <td className="p-2.5 font-bold text-slate-900">.EXE</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 4: STACK OPERATIONS & PROCEDURE CALLS SIMULATOR */}
        {activeTab === 'nearfar' && (
          <motion.div
            key="nearfar-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            {/* Header Banner & Sub-Mode Switcher */}
            <div className="bg-gradient-to-r from-indigo-50 via-sky-50 to-slate-50 border border-indigo-200/80 rounded-2xl p-4 sm:p-5 text-slate-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xs">
              <div>
                <h3 className="text-base font-extrabold text-indigo-950 font-mono uppercase tracking-wider flex items-center gap-2">
                  <PhoneCall className="w-5 h-5 text-indigo-600" />
                  8086 Stack Architecture & Subroutine Calls
                </h3>
                <p className="text-xs text-indigo-950 mt-1 max-w-3xl leading-relaxed">
                  Interactive simulator for 8086 LIFO (Last-In First-Out) stack memory. Choose between <strong className="text-emerald-700 font-bold">Procedure Call Stack Frames (CALL & RET)</strong> or the <strong className="text-indigo-700 font-bold">Interactive PUSH & POP Register Laboratory</strong>.
                </p>
              </div>

              {/* Sub-Mode Tabs */}
              <div className="flex bg-white/90 p-1 rounded-xl border border-indigo-200/80 shadow-2xs shrink-0 font-mono text-xs font-bold">
                <button
                  onClick={() => setNearFarSubMode('procs')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    nearFarSubMode === 'procs'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>1. Procedure Calls (CALL/RET)</span>
                </button>
                <button
                  onClick={() => setNearFarSubMode('stacklab')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    nearFarSubMode === 'stacklab'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>2. PUSH & POP Register Lab</span>
                </button>
              </div>
            </div>

            {/* SUB-MODE 1: PROCEDURE CALLS (NEAR / FAR CALL & RET) */}
            {nearFarSubMode === 'procs' && (
              <div className="space-y-6">
                {/* Mode Selector Header Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-700 uppercase">Select Subroutine Call Type:</span>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => { setNearFarType('near'); setCallStep('idle'); }}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer border ${
                        nearFarType === 'near'
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      PROC NEAR (Intra-Segment: Pushes 2-Byte IP)
                    </button>
                    <button
                      onClick={() => { setNearFarType('far'); setCallStep('idle'); }}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer border ${
                        nearFarType === 'far'
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      PROC FAR (Inter-Segment: Pushes 4-Byte CS + IP)
                    </button>
                  </div>
                </div>

                {/* Grid: CPU Registers & Micro-Step Controls (Left) vs Visual Stack RAM (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                  
                  {/* Left Column: CPU Registers & Execution Controls (6 Cols) */}
                  <div className="lg:col-span-6 bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-200 mb-3">
                        <span className="text-xs font-mono font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Cpu className="w-4 h-4 text-indigo-600" />
                          CPU Registers & Execution Trigger
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                          nearFarType === 'near'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {nearFarType === 'near' ? 'NEAR CALL (16-bit Offset)' : 'FAR CALL (32-bit CS:IP)'}
                        </span>
                      </div>

                      {/* Registers Display Grid */}
                      <div className="grid grid-cols-3 gap-3 my-3">
                        {/* CS Register */}
                        <div className={`p-3 rounded-xl border transition-all text-center ${
                          callStep === 'pushed' && nearFarType === 'far'
                            ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md ring-2 ring-amber-400'
                            : 'bg-white border-slate-200 text-slate-800'
                        }`}>
                          <span className="text-[9px] font-mono uppercase font-bold text-slate-400 block">CS (Code Segment)</span>
                          <span className="text-sm font-mono font-black mt-0.5 block">
                            {callStep === 'pushed'
                              ? (nearFarType === 'near' ? '1000H' : '2000H')
                              : '1000H'}
                          </span>
                          <span className="text-[8px] font-mono text-slate-500 mt-1 block">
                            {nearFarType === 'near' ? 'Unchanged (Same Seg)' : callStep === 'pushed' ? 'New Segment!' : 'Caller Base'}
                          </span>
                        </div>

                        {/* IP Register */}
                        <div className={`p-3 rounded-xl border transition-all text-center ${
                          callStep === 'pushed'
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-400'
                            : 'bg-white border-slate-200 text-slate-800'
                        }`}>
                          <span className="text-[9px] font-mono uppercase font-bold text-slate-400 block">IP (Instruction Ptr)</span>
                          <span className="text-sm font-mono font-black mt-0.5 block">
                            {callStep === 'pushed'
                              ? (nearFarType === 'near' ? '0500H' : '0050H')
                              : '0100H'}
                          </span>
                          <span className="text-[8px] font-mono text-slate-500 mt-1 block">
                            {callStep === 'pushed' ? 'Inside Subroutine' : 'CALL Instruction'}
                          </span>
                        </div>

                        {/* SP Register */}
                        <div className={`p-3 rounded-xl border transition-all text-center ${
                          callStep === 'pushed'
                            ? 'bg-rose-50 border-rose-300 text-rose-950 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-800'
                        }`}>
                          <span className="text-[9px] font-mono uppercase font-bold text-slate-400 block">SP (Stack Pointer)</span>
                          <span className="text-sm font-mono font-black mt-0.5 block">
                            {callStep === 'pushed'
                              ? (nearFarType === 'near' ? 'FFFCH' : 'FFF8H')
                              : 'FFFEH'}
                          </span>
                          <span className="text-[8px] font-mono text-rose-700 font-bold mt-1 block">
                            {callStep === 'pushed'
                              ? (nearFarType === 'near' ? '-2 Bytes (Pushed IP)' : '-4 Bytes (CS + IP)')
                              : 'Initial Top of Stack'}
                          </span>
                        </div>
                      </div>

                      {/* Execution Action Stepper Buttons */}
                      <div className="flex flex-wrap items-center gap-2 mt-4">
                        <button
                          onClick={() => setCallStep('pushed')}
                          disabled={callStep === 'pushed'}
                          className={`flex-1 py-2.5 px-3 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            callStep === 'pushed'
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                          }`}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          1. Execute CALL Instruction
                        </button>

                        <button
                          onClick={() => setCallStep('returned')}
                          disabled={callStep !== 'pushed'}
                          className={`flex-1 py-2.5 px-3 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            callStep !== 'pushed'
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                          }`}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          2. Execute RET Instruction
                        </button>

                        <button
                          onClick={() => setCallStep('idle')}
                          className="py-2.5 px-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-mono text-xs font-bold cursor-pointer transition-all"
                        >
                          Reset
                        </button>
                      </div>

                      {/* Live Hardware Operation Step Console */}
                      <div className="mt-4 p-3 bg-slate-900 text-emerald-300 border border-slate-800 rounded-xl font-mono text-xs space-y-1 shadow-xs">
                        <div className="flex justify-between items-center text-slate-400 border-b border-slate-800 pb-1 mb-1 text-[10px]">
                          <span className="font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                            Hardware Step Monitor
                          </span>
                          <span>SS:SP = SS:{callStep === 'pushed' ? (nearFarType === 'near' ? 'FFFCH' : 'FFF8H') : 'FFFEH'}</span>
                        </div>
                        {callStep === 'idle' && (
                          <p className="text-slate-300 leading-relaxed text-[11px]">
                            💡 Ready to Call. Click <strong className="text-indigo-400">1. Execute CALL Instruction</strong> to observe return address pushed onto stack RAM.
                          </p>
                        )}
                        {callStep === 'pushed' && (
                          <div className="leading-relaxed text-[11px] space-y-1">
                            {nearFarType === 'near' ? (
                              <>
                                <p>⚡ <strong>NEAR CALL Execution Micro-Steps:</strong></p>
                                <p>1. Decrements SP by 2 (SP ← FFFEH - 2 = FFFCH).</p>
                                <p>2. Stores 16-bit Return Offset IP (0102H) at SS:[FFFCH].</p>
                                <p>3. High byte (01H) stored at SS:FFFDH, Low byte (02H) at SS:FFFCH.</p>
                                <p>4. Jumps to subroutine at CS:IP = 1000H:0500H.</p>
                              </>
                            ) : (
                              <>
                                <p>⚡ <strong>FAR CALL Execution Micro-Steps:</strong></p>
                                <p>1. Decrements SP by 2 (SP ← FFFEH - 2 = FFFCH), pushes Code Segment CS (1000H) to SS:[FFFCH].</p>
                                <p>2. Decrements SP by 2 (SP ← FFFCH - 2 = FFF8H), pushes Return Offset IP (0105H) to SS:[FFF8H].</p>
                                <p>3. Total 4 bytes pushed. CS loaded with 2000H, IP loaded with 0050H.</p>
                              </>
                            )}
                          </div>
                        )}
                        {callStep === 'returned' && (
                          <div className="leading-relaxed text-[11px] space-y-1 text-emerald-300">
                            <p>✅ <strong>{nearFarType === 'near' ? 'RETN (Near Return)' : 'RETF (Far Return)'} Execution Micro-Steps:</strong></p>
                            {nearFarType === 'near' ? (
                              <>
                                <p>1. Pops 16-bit Return Offset (0102H) from SS:[FFFCH] into IP.</p>
                                <p>2. Increments SP by 2 (SP ← FFFCH + 2 = FFFEH).</p>
                                <p>3. Execution resumes at CS:IP = 1000H:0102H.</p>
                              </>
                            ) : (
                              <>
                                <p>1. Pops 16-bit Return Offset (0105H) from SS:[FFF8H] into IP, increments SP by 2 (FFFCH).</p>
                                <p>2. Pops 16-bit Code Segment (1000H) from SS:[FFFCH] into CS, increments SP by 2 (FFFEH).</p>
                                <p>3. Both CS and IP fully restored! Execution resumes at CS:IP = 1000H:0105H.</p>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-[10px] font-mono text-slate-500 border-t border-slate-200 pt-2 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Stack operates in LIFO (Last-In First-Out) Little-Endian format in 8086 RAM.</span>
                    </div>
                  </div>

                  {/* Right Column: Visual Physical Stack RAM Frame (6 Cols) */}
                  <div className="lg:col-span-6 bg-white text-slate-900 rounded-2xl p-4 sm:p-5 border border-indigo-200 font-mono text-xs flex flex-col justify-between shadow-2xs">
                    <div>
                      <div className="flex justify-between items-center pb-2 mb-3 border-b border-slate-200">
                        <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                          <Database className="w-4 h-4 text-emerald-600" />
                          Physical Stack RAM Frame (SS:SP)
                        </span>
                        <span className="text-[10px] text-indigo-900 bg-indigo-50 font-bold px-2 py-0.5 rounded border border-indigo-200">
                          Grows Downwards (High → Low Offset)
                        </span>
                      </div>

                      {/* Stack RAM Memory Cells Visualization in Strict High to Low Order */}
                      <div className="space-y-2 my-3">
                        
                        {/* Base Top Boundary (SS:FFFEH) */}
                        <div className="flex items-center gap-2 bg-emerald-50/80 p-2 rounded-xl border border-emerald-300">
                          <span className="text-[10px] text-emerald-900 font-bold w-24 text-right">SS:FFFEH</span>
                          <div className="flex-1 bg-white p-2 rounded text-center text-emerald-950 font-bold border border-emerald-200 text-[11px]">
                            [ Base Top Boundary (Initial SP) ]
                          </div>
                          <span className="text-[9px] text-emerald-800 font-bold w-20">Base Top</span>
                        </div>

                        {nearFarType === 'near' ? (
                          <>
                            {/* SS:FFFDH: High Byte of IP */}
                            <div className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                              callStep === 'pushed'
                                ? 'bg-indigo-50 border-indigo-300 text-indigo-950 shadow-2xs'
                                : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}>
                              <span className="text-[10px] font-bold w-24 text-right">SS:FFFDH</span>
                              <div className="flex-1 bg-white p-2 rounded text-center font-bold border border-indigo-200 text-indigo-950">
                                {callStep === 'pushed' ? '01H (IP High Byte)' : '00H (Unallocated)'}
                              </div>
                              <span className="text-[9px] text-indigo-800 font-bold w-20">Saved IP</span>
                            </div>

                            {/* SS:FFFCH: Low Byte of IP (TOS) */}
                            <div className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                              callStep === 'pushed'
                                ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-950 shadow-sm ring-2 ring-emerald-300'
                                : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}>
                              <span className="text-[10px] font-bold w-24 text-right">SS:FFFCH</span>
                              <div className="flex-1 bg-white p-2 rounded text-center font-extrabold border border-emerald-300 text-emerald-950 flex justify-between px-3 items-center">
                                <span>{callStep === 'pushed' ? '02H (IP Low Byte)' : '00H (Unallocated)'}</span>
                                {callStep === 'pushed' && (
                                  <span className="text-[9px] bg-emerald-600 text-white px-2 py-0.5 rounded font-mono font-bold">
                                    👈 TOS (SP)
                                  </span>
                                )}
                              </div>
                              <span className="text-[9px] text-emerald-800 font-bold w-20">Saved IP</span>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* SS:FFFDH: High Byte of CS */}
                            <div className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                              callStep === 'pushed'
                                ? 'bg-amber-50 border-amber-300 text-amber-950 shadow-2xs'
                                : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}>
                              <span className="text-[10px] font-bold w-24 text-right">SS:FFFDH</span>
                              <div className="flex-1 bg-white p-2 rounded text-center font-bold border border-amber-200 text-amber-950">
                                {callStep === 'pushed' ? '10H (CS High Byte)' : '00H'}
                              </div>
                              <span className="text-[9px] text-amber-800 font-bold w-20">Saved CS</span>
                            </div>

                            {/* SS:FFFCH: Low Byte of CS */}
                            <div className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                              callStep === 'pushed'
                                ? 'bg-amber-50 border-amber-300 text-amber-950 shadow-2xs'
                                : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}>
                              <span className="text-[10px] font-bold w-24 text-right">SS:FFFCH</span>
                              <div className="flex-1 bg-white p-2 rounded text-center font-bold border border-amber-200 text-amber-950">
                                {callStep === 'pushed' ? '00H (CS Low Byte)' : '00H'}
                              </div>
                              <span className="text-[9px] text-amber-800 font-bold w-20">Saved CS</span>
                            </div>

                            {/* SS:FFF9H: High Byte of IP */}
                            <div className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                              callStep === 'pushed'
                                ? 'bg-indigo-50 border-indigo-300 text-indigo-950 shadow-2xs'
                                : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}>
                              <span className="text-[10px] font-bold w-24 text-right">SS:FFF9H</span>
                              <div className="flex-1 bg-white p-2 rounded text-center font-bold border border-indigo-200 text-indigo-950">
                                {callStep === 'pushed' ? '01H (IP High Byte)' : '00H'}
                              </div>
                              <span className="text-[9px] text-indigo-800 font-bold w-20">Saved IP</span>
                            </div>

                            {/* SS:FFF8H: Low Byte of IP (TOS) */}
                            <div className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                              callStep === 'pushed'
                                ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-950 shadow-sm ring-2 ring-emerald-300'
                                : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}>
                              <span className="text-[10px] font-bold w-24 text-right">SS:FFF8H</span>
                              <div className="flex-1 bg-white p-2 rounded text-center font-extrabold border border-emerald-300 text-emerald-950 flex justify-between px-3 items-center">
                                <span>{callStep === 'pushed' ? '05H (IP Low Byte)' : '00H'}</span>
                                {callStep === 'pushed' && (
                                  <span className="text-[9px] bg-emerald-600 text-white px-2 py-0.5 rounded font-mono font-bold">
                                    👈 TOS (SP)
                                  </span>
                                )}
                              </div>
                              <span className="text-[9px] text-emerald-800 font-bold w-20">Saved IP</span>
                            </div>
                          </>
                        )}

                      </div>
                    </div>

                    <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200 text-[10.5px] leading-relaxed text-slate-800">
                      <strong className="text-emerald-700 font-bold block mb-0.5">Stack Frame Push Summary:</strong>
                      {nearFarType === 'near' ? (
                        <span>NEAR Call pushes 2 bytes onto stack: <code className="text-indigo-900 font-bold">IP</code> (16-bit Return Offset). SP = SP - 2.</span>
                      ) : (
                        <span>FAR Call pushes 4 bytes onto stack: <code className="text-amber-800 font-bold">CS</code> (16-bit Code Segment) first, then <code className="text-indigo-900 font-bold">IP</code> (16-bit Offset). SP = SP - 4.</span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Assembly Source Code Directives Comparison Panel */}
                <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 border border-slate-800 font-mono text-xs shadow-2xs">
                  <div className="flex justify-between items-center pb-2 mb-3 border-b border-slate-800">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                      <Code2 className="w-4 h-4" />
                      MASM / TASM Procedure Directive Source Code Comparison
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {nearFarType === 'near' ? 'PROC NEAR Syntax (2-Byte RETN)' : 'PROC FAR Syntax (4-Byte RETF)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px]">
                    {/* NEAR Call Code */}
                    <div className={`p-3 rounded-xl border transition-all ${
                      nearFarType === 'near' ? 'bg-slate-950 border-emerald-500/80 ring-1 ring-emerald-500/50' : 'bg-slate-950/60 border-slate-800 opacity-60'
                    }`}>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-1.5">
                        1. NEAR Procedure Syntax (.MODEL SMALL Default)
                      </span>
                      <pre className="text-emerald-300 leading-relaxed overflow-x-auto">
{`.CODE
  CALL NEAR PTR SUB_ROUTINE ; Calls subroutine in SAME segment
  ...

SUB_ROUTINE PROC NEAR       ; Directive: Intra-segment procedure
  MOV AX, 1234H
  RET                       ; Assembles to RETN (Pops 2-byte IP)
SUB_ROUTINE ENDP`}
                      </pre>
                    </div>

                    {/* FAR Call Code */}
                    <div className={`p-3 rounded-xl border transition-all ${
                      nearFarType === 'far' ? 'bg-slate-950 border-amber-500/80 ring-1 ring-amber-500/50' : 'bg-slate-950/60 border-slate-800 opacity-60'
                    }`}>
                      <span className="text-[10px] font-bold text-amber-400 uppercase block mb-1.5">
                        2. FAR Procedure Syntax (.MODEL MEDIUM / LARGE)
                      </span>
                      <pre className="text-amber-300 leading-relaxed overflow-x-auto">
{`.CODE
  CALL FAR PTR EXT_SUBROUTINE ; Calls subroutine in DIFFERENT segment
  ...

EXT_SUBROUTINE PROC FAR     ; Directive: Inter-segment procedure
  MOV AX, 5678H
  RET                       ; Assembles to RETF (Pops 4-byte CS:IP)
EXT_SUBROUTINE ENDP`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Side-by-Side Comprehensive Comparison Matrix */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                  <h4 className="text-xs font-extrabold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-indigo-600" />
                    NEAR vs FAR Code Calls Feature Comparison Matrix
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                          <th className="p-2.5 font-bold">Feature / Property</th>
                          <th className="p-2.5 font-bold text-emerald-800">NEAR Call (Intra-Segment)</th>
                          <th className="p-2.5 font-bold text-amber-800">FAR Call (Inter-Segment)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-[11px] text-slate-800">
                        <tr>
                          <td className="p-2.5 font-bold text-slate-900">Target Location</td>
                          <td className="p-2.5 text-emerald-800 font-semibold">Same Code Segment (Within 64KB)</td>
                          <td className="p-2.5 text-amber-800 font-semibold">Different Code Segment (&gt;64KB)</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-slate-900">Stack Bytes Pushed</td>
                          <td className="p-2.5 font-bold">2 Bytes (IP Offset)</td>
                          <td className="p-2.5 font-bold">4 Bytes (CS Segment + IP Offset)</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-slate-900">Code Segment (CS)</td>
                          <td className="p-2.5">Unchanged</td>
                          <td className="p-2.5">Loaded with new segment address</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-slate-900">Return Instruction</td>
                          <td className="p-2.5 font-bold text-emerald-800">RETN (Pops 2 bytes)</td>
                          <td className="p-2.5 font-bold text-amber-800">RETF (Pops 4 bytes)</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-slate-900">Default in Memory Models</td>
                          <td className="p-2.5">TINY, SMALL, COMPACT</td>
                          <td className="p-2.5">MEDIUM, LARGE, HUGE</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-MODE 2: INTERACTIVE PUSH & POP REGISTER LABORATORY */}
            {nearFarSubMode === 'stacklab' && (
              <div className="bg-gradient-to-br from-indigo-50/90 via-sky-50/70 to-slate-50 border-2 border-indigo-200 rounded-2xl p-5 space-y-5 shadow-sm relative overflow-hidden text-slate-900 font-sans">
                
                {/* Header Control Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-indigo-200/80 pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-100 border border-indigo-300 rounded-xl text-indigo-700">
                      <Layers className="w-5 h-5 text-indigo-700" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold uppercase tracking-wider font-mono text-indigo-950 flex items-center gap-2">
                        Interactive 8086 PUSH & POP Stack Laboratory
                      </h3>
                      <p className="text-[11px] text-indigo-900 mt-0.5">
                        Test general <strong className="text-emerald-700">PUSH</strong> and <strong className="text-amber-700">POP</strong> hardware operations with 16-bit registers and observe live Stack Pointer (SP) updates in SS segment memory.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-900 px-2.5 py-1 rounded-lg border border-indigo-300">
                      SS:SP = SS:{hexFormat(labRegs.SP ?? 0x0100)}
                    </span>
                    <button
                      onClick={handleLoadSampleLabStack}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-indigo-900 text-[10px] font-mono font-bold rounded-lg border border-indigo-200 transition-all cursor-pointer shadow-2xs"
                    >
                      Pre-fill Sample Stack
                    </button>
                    <button
                      onClick={handleResetLabStack}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-rose-700 text-[10px] font-mono font-bold rounded-lg border border-rose-200 transition-all cursor-pointer shadow-2xs"
                    >
                      Reset Stack
                    </button>
                  </div>
                </div>

                {/* Grid: PUSH/POP Consoles (Left) vs Visual Stack Memory Column (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  
                  {/* Left Column: Interactive Controls & Hardware Log (7 Cols) */}
                  <div className="lg:col-span-7 space-y-4">
                    
                    {/* Control Panel Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      
                      {/* PUSH Operation Box */}
                      <div className="bg-white border border-indigo-200 rounded-xl p-3.5 space-y-3 shadow-2xs">
                        <div className="flex justify-between items-center border-b border-indigo-100 pb-2">
                          <span className="text-xs font-mono font-bold text-indigo-900 uppercase flex items-center gap-1.5">
                            <ArrowDown className="w-4 h-4 text-emerald-600" />
                            PUSH Operation
                          </span>
                          <span className="text-[9px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                            SP = SP - 2
                          </span>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-slate-600 block font-semibold">Select Source Operand:</label>
                          <div className="flex gap-2">
                            <select
                              value={labPushReg}
                              onChange={(e) => setLabPushReg(e.target.value)}
                              className="bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs rounded-lg px-2.5 py-1.5 flex-1 focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer"
                            >
                              {['AX', 'BX', 'CX', 'DX', 'SI', 'DI', 'BP', 'CUSTOM'].map(r => (
                                <option key={r} value={r}>
                                  {r === 'CUSTOM' ? 'Custom Hex Value' : `${r} (${hexFormat(labRegs[r] ?? 0)})`}
                                </option>
                              ))}
                            </select>
                          </div>

                          {labPushReg === 'CUSTOM' && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-mono text-slate-600 font-semibold">Hex Value:</span>
                              <input
                                type="text"
                                maxLength={4}
                                value={labPushCustomVal}
                                onChange={(e) => setLabPushCustomVal(e.target.value)}
                                className="bg-slate-50 border border-indigo-300 text-emerald-700 font-mono text-xs rounded-lg px-2 py-1 w-24 text-center focus:outline-none font-bold"
                              />
                            </div>
                          )}

                          <button
                            onClick={() => handleLabPush(labPushReg)}
                            className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-mono font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <ArrowDown className="w-4 h-4" />
                            Execute PUSH {labPushReg === 'CUSTOM' ? labPushCustomVal + 'H' : labPushReg}
                          </button>
                        </div>

                        <p className="text-[9.5px] text-slate-600 font-mono leading-relaxed pt-1 border-t border-slate-100">
                          ⚡ Decrements SP by 2, then stores 16-bit word at SS:[SP]. Top of Stack moves DOWN.
                        </p>
                      </div>

                      {/* POP Operation Box */}
                      <div className="bg-white border border-amber-200 rounded-xl p-3.5 space-y-3 shadow-2xs">
                        <div className="flex justify-between items-center border-b border-amber-100 pb-2">
                          <span className="text-xs font-mono font-bold text-amber-900 uppercase flex items-center gap-1.5">
                            <ArrowUp className="w-4 h-4 text-amber-600" />
                            POP Operation
                          </span>
                          <span className="text-[9px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold">
                            SP = SP + 2
                          </span>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-slate-600 block font-semibold">Select Destination Register:</label>
                          <select
                            value={labPopReg}
                            onChange={(e) => setLabPopReg(e.target.value)}
                            className="bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs rounded-lg px-2.5 py-1.5 w-full focus:outline-none focus:border-amber-500 font-semibold cursor-pointer"
                          >
                            {['AX', 'BX', 'CX', 'DX', 'SI', 'DI', 'BP'].map(r => (
                              <option key={r} value={r}>
                                {r} (Current: {hexFormat(labRegs[r] ?? 0)})
                              </option>
                            ))}
                          </select>

                          <button
                            onClick={() => handleLabPop(labPopReg)}
                            disabled={labStackSlots.length === 0 || (labRegs.SP ?? 0x0100) >= 0x0100}
                            className="w-full mt-2 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-mono font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <ArrowUp className="w-4 h-4" />
                            Execute POP {labPopReg}
                          </button>
                        </div>

                        <p className="text-[9.5px] text-slate-600 font-mono leading-relaxed pt-1 border-t border-slate-100">
                          ✅ Reads 16-bit word from SS:[SP] into destination, then increments SP by 2. Top of Stack moves UP.
                        </p>
                      </div>

                    </div>

                    {/* Live Hardware Operation Step Console */}
                    <div className="bg-slate-900 text-emerald-300 border border-slate-800 rounded-xl p-3 font-mono text-[11px] space-y-1.5 shadow-xs">
                      <div className="flex justify-between items-center text-slate-300 border-b border-slate-800 pb-1.5">
                        <span className="text-[10px] font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                          Stack Hardware Step Monitor
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold">SS:SP = SS:{hexFormat(labRegs.SP ?? 0x0100)}</span>
                      </div>
                      <pre className="text-emerald-300 leading-relaxed whitespace-pre-wrap font-mono text-[10.5px]">
                        {labStackLog}
                      </pre>
                    </div>

                  </div>

                  {/* Right Column: Physical Visual Stack RAM Architecture (5 Cols) */}
                  <div className="lg:col-span-5 bg-white border border-indigo-200 rounded-xl p-4 font-mono text-xs space-y-3 shadow-2xs">
                    
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                        <Database className="w-4 h-4 text-emerald-600" />
                        Stack RAM Frame (SS Segment)
                      </span>
                      <span className="text-[9.5px] text-amber-900 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                        Grows Downward
                      </span>
                    </div>

                    {/* Stack Memory Slots Container */}
                    <div className="space-y-2 relative pt-1 pb-1">
                      
                      {/* BASE OF STACK CARD (Highest Memory Location SS:0100H) */}
                      <div className="bg-emerald-50 border-2 border-emerald-400 rounded-xl p-2.5 flex items-center justify-between shadow-2xs relative">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                          <div>
                            <span className="text-[10px] font-bold text-emerald-800 uppercase block leading-none">
                              BASE OF STACK (BOS)
                            </span>
                            <span className="text-xs font-bold text-emerald-950 font-mono mt-0.5 block">
                              SS:0100H (Initial Stack Boundary)
                            </span>
                          </div>
                        </div>
                        <span className="text-[9px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                          Max Address
                        </span>
                      </div>

                      {/* Arrow indicating downward growth */}
                      <div className="flex justify-center items-center py-1">
                        <div className="flex items-center gap-1 text-[9px] text-indigo-800 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                          <ArrowDown className="w-3 h-3 text-emerald-600 animate-bounce" />
                          <span>PUSH moves SP DOWN to Lower Addresses</span>
                        </div>
                      </div>

                      {/* Allocated Stack Memory Slots (Rendered top-to-bottom from 00FE down to SP) */}
                      {labStackSlots.length === 0 ? (
                        <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center text-slate-500 italic text-[11px]">
                          Stack is currently empty at Base of Stack (SP = 0100H). Execute PUSH above to allocate stack frames.
                        </div>
                      ) : (
                        [...labStackSlots].reverse().map((slot, index) => {
                          const isTop = index === 0; // Reversed list means top item is TOS!
                          const highByte = (slot.val >> 8) & 0xFF;
                          const lowByte = slot.val & 0xFF;

                          return (
                            <motion.div
                              key={slot.addr}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`p-2.5 rounded-xl border transition-all relative ${
                                isTop
                                  ? 'bg-indigo-50 border-2 border-indigo-500 shadow-2xs text-indigo-950'
                                  : 'bg-slate-50 border-slate-250 text-slate-800'
                              }`}
                            >
                              {/* Top of Stack TOS Badge if this is SP */}
                              {isTop && (
                                <div className="absolute -top-3 right-3 bg-indigo-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1 font-mono">
                                  <ArrowDown className="w-3 h-3 fill-current" />
                                  TOP OF STACK (TOS = SS:{hexFormat(slot.addr)})
                                </div>
                              )}

                              <div className="flex justify-between items-center text-xs border-b border-indigo-200/60 pb-1.5 mb-1.5">
                                <span className="font-bold text-indigo-900">
                                  SS:{hexFormat(slot.addr)}
                                </span>
                                <span className="font-extrabold text-emerald-700 text-sm">
                                  {hexFormat(slot.val)}
                                </span>
                              </div>

                              {/* Little-Endian Byte Memory Representation */}
                              <div className="grid grid-cols-2 gap-2 text-[9.5px]">
                                <div className="bg-white p-1.5 rounded border border-indigo-150 text-center">
                                  <span className="text-slate-500 block font-medium">High Byte (SP+1)</span>
                                  <span className="font-bold text-indigo-900">{byteHexFormat(highByte)}</span>
                                </div>
                                <div className="bg-white p-1.5 rounded border border-indigo-150 text-center">
                                  <span className="text-slate-500 block font-medium">Low Byte (SP)</span>
                                  <span className="font-bold text-emerald-700">{byteHexFormat(lowByte)}</span>
                                </div>
                              </div>

                              <div className="mt-1.5 text-[9px] text-slate-600 flex justify-between items-center font-mono">
                                <span>Pushed From: <strong className="text-indigo-900">{slot.pushedFrom}</strong></span>
                                <span className="text-slate-500">16-bit Word</span>
                              </div>
                            </motion.div>
                          );
                        })
                      )}

                      {/* Unallocated Free Stack Memory Space Indicator */}
                      <div className="p-2 bg-slate-100/80 border border-slate-200 rounded-xl text-center text-slate-500 text-[10px]">
                        <span>[ Unallocated Free Stack Memory below SP ]</span>
                      </div>

                    </div>

                    {/* Memory Architecture Quick Summary */}
                    <div className="p-2.5 bg-indigo-50/70 rounded-xl border border-indigo-150 text-[10px] text-slate-700 space-y-1">
                      <div className="font-bold text-indigo-900 flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Key Stack Rules in 8086:</span>
                      </div>
                      <ul className="list-disc list-inside text-slate-700 space-y-0.5 text-[9.5px]">
                        <li><strong className="text-emerald-700">PUSH AX:</strong> SP ← SP - 2, writes 16-bit AX word.</li>
                        <li><strong className="text-amber-700">POP DX:</strong> Reads 16-bit word into DX, SP ← SP + 2.</li>
                        <li><strong className="text-indigo-900">Alignment:</strong> 8086 stack always operates in 16-bit Words.</li>
                      </ul>
                    </div>

                  </div>

                </div>

              </div>
            )}

          </motion.div>
        )}

        {/* TAB 5: DATA SEGMENT RAM ALLOCATION SANDBOX */}
        {activeTab === 'sandbox' && (
          <motion.div
            key="sandbox-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight font-sans uppercase flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-600" />
                  Interactive Data Segment Memory Allocation Sandbox
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Simulate how variable declaration directives (DB, DW, DUP) allocate RAM byte offsets in Little-Endian format
                </p>
              </div>

              {/* Interactive Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">
                    MY_BYTE (DB Directive - 1 Byte):
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400">0x</span>
                    <input
                      type="text"
                      maxLength={2}
                      value={var1Val}
                      onChange={(e) => setVar1Val(e.target.value.toUpperCase())}
                      className="font-mono text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-indigo-700 w-20 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">
                    MY_WORD (DW Directive - 2 Bytes):
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400">0x</span>
                    <input
                      type="text"
                      maxLength={4}
                      value={var2Val}
                      onChange={(e) => setVar2Val(e.target.value.toUpperCase())}
                      className="font-mono text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-indigo-700 w-24 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">
                    MY_ARRAY (DB {dupCount} DUP(0) - Bytes):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={dupCount}
                      onChange={(e) => setDupCount(parseInt(e.target.value))}
                      className="accent-indigo-600 cursor-pointer"
                    />
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                      {dupCount} Bytes
                    </span>
                  </div>
                </div>
              </div>

              {/* Physical RAM Offsets Mapping Visualization */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">
                  Computed Data Segment RAM Offsets (DS:0000H onwards):
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 font-mono text-xs">
                  {/* Byte 0: MY_BYTE */}
                  <div className="bg-indigo-50 border border-indigo-300 rounded-2xl p-3 text-center shadow-xs">
                    <span className="text-[8px] font-bold text-indigo-500 block uppercase">Offset 0000H</span>
                    <span className="text-sm font-black text-indigo-900 block my-0.5">
                      {(var1Val || '00').padStart(2, '0')}H
                    </span>
                    <span className="text-[8px] font-bold text-indigo-600 block uppercase truncate">MY_BYTE (DB)</span>
                  </div>

                  {/* Byte 1 & 2: MY_WORD (Little-Endian) */}
                  {(() => {
                    const paddedHex = (var2Val || '0000').padStart(4, '0');
                    const lowByte = paddedHex.slice(2, 4);
                    const highByte = paddedHex.slice(0, 2);
                    return (
                      <>
                        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3 text-center shadow-xs">
                          <span className="text-[8px] font-bold text-emerald-600 block uppercase">Offset 0001H</span>
                          <span className="text-sm font-black text-emerald-900 block my-0.5">
                            {lowByte}H
                          </span>
                          <span className="text-[8px] font-bold text-emerald-700 block uppercase truncate">MY_WORD (Low Byte)</span>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3 text-center shadow-xs">
                          <span className="text-[8px] font-bold text-emerald-600 block uppercase">Offset 0002H</span>
                          <span className="text-sm font-black text-emerald-900 block my-0.5">
                            {highByte}H
                          </span>
                          <span className="text-[8px] font-bold text-emerald-700 block uppercase truncate">MY_WORD (High Byte)</span>
                        </div>
                      </>
                    );
                  })()}

                  {/* Array DUP Bytes */}
                  {Array.from({ length: dupCount }).map((_, idx) => {
                    const offsetHex = (3 + idx).toString(16).toUpperCase().padStart(4, '0') + 'H';
                    return (
                      <div key={idx} className="bg-amber-50 border border-amber-300 rounded-2xl p-3 text-center shadow-xs">
                        <span className="text-[8px] font-bold text-amber-600 block uppercase">Offset {offsetHex}</span>
                        <span className="text-sm font-black text-amber-900 block my-0.5">
                          00H
                        </span>
                        <span className="text-[8px] font-bold text-amber-700 block uppercase truncate">ARR[{idx}] (DUP)</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Memory Explanation */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 leading-relaxed font-sans flex items-start gap-3">
                <Cpu className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 font-bold block mb-0.5">Little-Endian Memory Storage Principle:</strong>
                  Notice that when declaring <code className="text-indigo-600 font-mono font-bold">MY_WORD DW {(var2Val || '0000').padStart(4, '0')}H</code>, the 8086 processor stores the lower byte (<code className="text-emerald-700 font-mono font-bold">{(var2Val || '0000').padStart(4, '0').slice(2, 4)}H</code>) at the lower memory offset (0001H), and the higher byte (<code className="text-emerald-700 font-mono font-bold">{(var2Val || '0000').padStart(4, '0').slice(0, 2)}H</code>) at the next offset (0002H).
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 6: MULTI-PRECISION ADDITION & SUBTRACTION SIMULATOR (EXP 1A) */}
        {activeTab === 'multiprecision' && (() => {
          const steps = getMpSteps();
          const currStep = steps[Math.min(mpStepIdx, steps.length - 1)] || steps[0];

          // Compute MASM Assembly Source Code for current setup
          const numWords = mpBitWidth === 32 ? 2 : 4;
          const cleanA = mpOpAHex.replace(/[^0-9A-Fa-f]/g, '').padStart(numWords * 4, '0').slice(-(numWords * 4));
          const cleanB = mpOpBHex.replace(/[^0-9A-Fa-f]/g, '').padStart(numWords * 4, '0').slice(-(numWords * 4));

          const masmCode = `; =========================================================
; 8086 ALP: Exp 1A - ${mpBitWidth}-Bit Multi-Precision ${mpOp === 'ADD' ? 'Addition' : 'Subtraction'}
; Memory Storage: Little-Endian Word Sequence in Data Segment
; =========================================================
.MODEL SMALL
.STACK 100H

.DATA
  ; ${mpBitWidth}-bit Operands declared in Little-Endian Word Sequence
  NUM1 DW ${Array.from({ length: numWords }).map((_, i) => `${cleanA.substr((numWords - 1 - i) * 4, 4)}H`).join(', ')}
  NUM2 DW ${Array.from({ length: numWords }).map((_, i) => `${cleanB.substr((numWords - 1 - i) * 4, 4)}H`).join(', ')}
  RESULT DW ${numWords} DUP(0)
  CARRY DB 0

.CODE
MAIN PROC
  MOV AX, @DATA
  MOV DS, AX

  ; --- Word 0 (Bits 0..15) ---
  MOV AX, WORD PTR [NUM1]
  ${mpOp === 'ADD' ? 'ADD' : 'SUB'} AX, WORD PTR [NUM2]
  MOV WORD PTR [RESULT], AX

${Array.from({ length: numWords - 1 }).map((_, i) => {
  const w = i + 1;
  return `  ; --- Word ${w} (Bits ${w * 16}..${(w + 1) * 16 - 1}) ---
  MOV AX, WORD PTR [NUM1 + ${w * 2}]
  ${mpOp === 'ADD' ? 'ADC' : 'SBB'} AX, WORD PTR [NUM2 + ${w * 2}]
  MOV WORD PTR [RESULT + ${w * 2}], AX`;
}).join('\n\n')}

  ; --- Store Final Carry/Borrow Out Status ---
  ADC CARRY, 0  ; Add carry bit into memory byte

  ; --- DOS Program Exit ---
  MOV AH, 4CH
  INT 21H
MAIN ENDP
END MAIN`;

          return (
            <motion.div
              key="multiprecision-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Header Badge */}
              <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-slate-50 border border-purple-200 text-slate-900 p-4 sm:p-6 rounded-2xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-purple-100 text-purple-800 border border-purple-300 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase">
                      UNIT 4 • EXP 1A LAB
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase">
                      32-BIT / 64-BIT HARDWARE SIMULATOR
                    </span>
                  </div>
                  <h3 className="text-base sm:text-xl font-extrabold text-slate-950 tracking-tight flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-purple-600" />
                    Multi-Precision Arithmetic Execution Engine
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                    16-bit CPUs like the Intel 8086 cannot process 32-bit or 64-bit numbers in a single clock cycle. Multi-precision operations partition numbers into 16-bit words, executing <code className="text-indigo-800 font-bold bg-indigo-100 px-1 py-0.5 rounded">ADD</code> for Word 0, and chaining <code className="text-indigo-800 font-bold bg-indigo-100 px-1 py-0.5 rounded">ADC (Add with Carry)</code> / <code className="text-rose-800 font-bold bg-rose-100 px-1 py-0.5 rounded">SBB (Subtract with Borrow)</code> across higher words to propagate carry flags seamlessly.
                  </p>
                </div>

                {/* Bit Width & Operation Switches */}
                <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl border border-purple-200 shadow-2xs shrink-0">
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      onClick={() => handleSetMpBitWidth(32)}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        mpBitWidth === 32 ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      32-Bit (2 Words)
                    </button>
                    <button
                      onClick={() => handleSetMpBitWidth(64)}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        mpBitWidth === 64 ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      64-Bit (4 Words)
                    </button>
                  </div>

                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      onClick={() => { setMpOp('ADD'); setMpStepIdx(0); setMpAutoPlay(false); }}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                        mpOp === 'ADD' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      ADD / ADC
                    </button>
                    <button
                      onClick={() => { setMpOp('SUB'); setMpStepIdx(0); setMpAutoPlay(false); }}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                        mpOp === 'SUB' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Minus className="w-3.5 h-3.5" />
                      SUB / SBB
                    </button>
                  </div>
                </div>
              </div>
              {/* Theory & Concept Division */}
              <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 sm:p-5 text-slate-900 space-y-3 shadow-2xs">
                <div className="flex items-center gap-2 border-b border-amber-200/70 pb-2.5">
                  <div className="p-1.5 bg-amber-200 text-amber-900 rounded-lg">
                    <BookOpen className="w-4 h-4 text-amber-800" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-amber-950 uppercase tracking-wider">
                      Theory &amp; Concept: 8086 Multi-Precision Arithmetic Logic
                    </h4>
                    <p className="text-[11px] text-amber-800 font-medium">
                      Hardware Register Constraints, Little-Endian RAM Storage, and Carry/Borrow Propagation Chaining
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Concept 1: Register Limitations */}
                  <div className="bg-white/80 p-3 rounded-xl border border-amber-200/80 space-y-1">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                      <Cpu className="w-3.5 h-3.5 text-amber-700" />
                      1. 16-Bit Register Limitation
                    </div>
                    <p className="text-slate-700 leading-relaxed text-[11px]">
                      The 8086 CPU features 16-bit registers (AX, BX, CX, DX). 32-bit and 64-bit numbers exceed single-register capacity and must be partitioned into 16-bit word sequences.
                    </p>
                  </div>

                  {/* Concept 2: Little-Endian RAM Organization */}
                  <div className="bg-white/80 p-3 rounded-xl border border-amber-200/80 space-y-1">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                      <Database className="w-3.5 h-3.5 text-amber-700" />
                      2. Little-Endian RAM Layout
                    </div>
                    <p className="text-slate-700 leading-relaxed text-[11px]">
                      Multi-byte values are arranged in Data Segment RAM with the Least Significant Word (LSW, Word 0) at lowest address <code className="font-mono text-amber-900 font-bold bg-amber-100 px-1 rounded">DS:0000H</code>.
                    </p>
                  </div>

                  {/* Concept 3: Carry & Borrow Chaining */}
                  <div className="bg-white/80 p-3 rounded-xl border border-amber-200/80 space-y-1">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                      <Zap className="w-3.5 h-3.5 text-amber-700" />
                      3. ADC &amp; SBB Flag Propagation
                    </div>
                    <p className="text-slate-700 leading-relaxed text-[11px]">
                      Word 0 uses <code className="font-bold text-emerald-800 bg-emerald-100 px-1 rounded">ADD</code> / <code className="font-bold text-rose-800 bg-rose-100 px-1 rounded">SUB</code>. Words 1..N use <code className="font-bold text-indigo-900 bg-indigo-100 px-1 rounded">ADC</code> (Add with Carry: <code className="font-mono text-[10px]">AX+[NUM2]+CF</code>) or <code className="font-bold text-rose-900 bg-rose-100 px-1 rounded">SBB</code> (Subtract with Borrow).
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white text-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-600" />
                    Configure Operands &amp; Preset Hardware Scenarios
                  </span>

                  {/* Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
                    <span className="text-slate-500 text-[10px] uppercase font-bold mr-1">Presets:</span>
                    <button
                      onClick={() => {
                        setMpBitWidth(32);
                        setMpOp('ADD');
                        setMpOpAHex('FFFFFFFF');
                        setMpOpBHex('00000001');
                        setMpStepIdx(0);
                        setMpAutoPlay(false);
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                    >
                      32-Bit Overflow Carry (FFFFFFFF + 1)
                    </button>
                    <button
                      onClick={() => {
                        setMpBitWidth(32);
                        setMpOp('ADD');
                        setMpOpAHex('12345678');
                        setMpOpBHex('9ABCDEF0');
                        setMpStepIdx(0);
                        setMpAutoPlay(false);
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                    >
                      32-Bit Standard Math
                    </button>
                    <button
                      onClick={() => {
                        setMpBitWidth(64);
                        setMpOp('ADD');
                        setMpOpAHex('123456789ABCDEF0');
                        setMpOpBHex('FEDCBA9876543210');
                        setMpStepIdx(0);
                        setMpAutoPlay(false);
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                    >
                      64-Bit Chained Words
                    </button>
                    <button
                      onClick={() => {
                        setMpBitWidth(32);
                        setMpOp('SUB');
                        setMpOpAHex('00001000');
                        setMpOpBHex('00002000');
                        setMpStepIdx(0);
                        setMpAutoPlay(false);
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                    >
                      32-Bit Subtraction Borrow
                    </button>
                  </div>
                </div>

                {/* Hex Inputs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
                  <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-200">
                    <label className="text-[11px] text-purple-900 font-bold uppercase tracking-wider block mb-1.5 flex justify-between">
                      <span>Operand A (NUM1) - {mpBitWidth}-Bit Hex</span>
                      <span className="text-slate-500 font-normal">Little-Endian Word Sequence</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold">0x</span>
                      <input
                        type="text"
                        value={mpOpAHex}
                        maxLength={mpBitWidth / 4}
                        onChange={(e) => {
                          setMpOpAHex(e.target.value.toUpperCase());
                          setMpStepIdx(0);
                          setMpAutoPlay(false);
                        }}
                        className="bg-white text-emerald-800 font-extrabold text-sm border border-slate-300 rounded-lg px-3 py-1.5 w-full focus:outline-none focus:border-purple-500 tracking-wider shadow-2xs"
                      />
                      <span className="text-slate-600 font-bold text-xs">H</span>
                    </div>
                  </div>

                  <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-200">
                    <label className="text-[11px] text-purple-900 font-bold uppercase tracking-wider block mb-1.5 flex justify-between">
                      <span>Operand B (NUM2) - {mpBitWidth}-Bit Hex</span>
                      <span className="text-slate-500 font-normal">Little-Endian Word Sequence</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold">0x</span>
                      <input
                        type="text"
                        value={mpOpBHex}
                        maxLength={mpBitWidth / 4}
                        onChange={(e) => {
                          setMpOpBHex(e.target.value.toUpperCase());
                          setMpStepIdx(0);
                          setMpAutoPlay(false);
                        }}
                        className="bg-white text-emerald-800 font-extrabold text-sm border border-slate-300 rounded-lg px-3 py-1.5 w-full focus:outline-none focus:border-purple-500 tracking-wider shadow-2xs"
                      />
                      <span className="text-slate-600 font-bold text-xs">H</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step Execution Control Toolbar */}
              <div className="bg-slate-100 border border-slate-200 p-3 sm:p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-600 text-white font-mono font-black px-2.5 py-1 rounded-lg text-xs">
                    Step {mpStepIdx} / {steps.length - 1}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {mpStepIdx === 0 ? 'Ready to begin execution' : currStep.codeLine}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setMpStepIdx(0); setMpAutoPlay(false); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>

                  <button
                    onClick={() => { setMpStepIdx(prev => Math.max(0, prev - 1)); setMpAutoPlay(false); }}
                    disabled={mpStepIdx === 0}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-40 text-slate-700 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs"
                  >
                    ← Step Back
                  </button>

                  <button
                    onClick={() => { setMpStepIdx(prev => Math.min(steps.length - 1, prev + 1)); setMpAutoPlay(false); }}
                    disabled={mpStepIdx === steps.length - 1}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs flex items-center gap-1"
                  >
                    Step Forward →
                  </button>

                  <button
                    onClick={() => setMpAutoPlay(!mpAutoPlay)}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs ${
                      mpAutoPlay ? 'bg-amber-500 hover:bg-amber-600 text-slate-950' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {mpAutoPlay ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
                        Pause Stepper
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Auto Play
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 3-Column Execution Dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Column 1: Assembly Code View (4 cols) */}
                <div className="lg:col-span-4 bg-white text-slate-800 p-4 rounded-2xl border border-slate-200 space-y-3 font-mono text-xs flex flex-col justify-between shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                      <span className="text-purple-800 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                        <FileCode className="w-4 h-4 text-purple-600" />
                        8086 Assembly Program Stepper
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">MASM / TASM</span>
                    </div>

                    <div className="space-y-1">
                      {steps.map((st, sIdx) => {
                        const isCurrent = sIdx === mpStepIdx;
                        return (
                          <div
                            key={sIdx}
                            onClick={() => { setMpStepIdx(sIdx); setMpAutoPlay(false); }}
                            className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-between text-[11px] ${
                              isCurrent
                                ? 'bg-purple-100 text-purple-950 font-extrabold border-l-4 border-purple-600 pl-2 shadow-xs'
                                : sIdx < mpStepIdx
                                ? 'text-slate-700 hover:bg-slate-100'
                                : 'text-slate-400 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="text-[9px] text-slate-400 w-4 font-normal">{st.stepNum}</span>
                              <code className="truncate">{st.codeLine}</code>
                            </div>
                            {isCurrent && (
                              <span className="bg-purple-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0">
                                ACTIVE
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-500 flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Click any instruction line above to jump directly to that step.</span>
                  </div>
                </div>

                {/* Column 2: Execution & Hardware Micro-Engine (4 cols) */}
                <div className="lg:col-span-4 bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-indigo-600" />
                        Microprocessor Registers &amp; Flags
                      </span>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                        16-Bit Execution Unit
                      </span>
                    </div>

                    {/* AX Register Monitor */}
                    <div className="bg-purple-50/80 text-slate-900 p-3.5 rounded-xl border border-purple-200 space-y-1 font-mono">
                      <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider block">
                        Accumulator Register (AX)
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-black text-purple-900">
                          {hexFormat(currStep.axVal)}
                        </span>
                        <div className="text-[10px] text-slate-600 font-sans font-medium text-right">
                          AH = {byteHexFormat((currStep.axVal >> 8) & 0xFF)} | AL = {byteHexFormat(currStep.axVal & 0xFF)}
                        </div>
                      </div>
                    </div>

                    {/* Flags Register Monitor */}
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        8086 Status Flags Register
                      </span>
                      <div className="grid grid-cols-3 gap-2 font-mono text-center">
                        <div className={`p-2 rounded-lg border transition-all ${
                          currStep.cf ? 'bg-amber-100 border-amber-400 text-amber-900 font-extrabold shadow-xs' : 'bg-white border-slate-200 text-slate-400'
                        }`}>
                          <span className="text-[9px] block uppercase font-bold text-slate-500">Carry (CF)</span>
                          <span className="text-sm">{currStep.cf}</span>
                        </div>
                        <div className={`p-2 rounded-lg border transition-all ${
                          currStep.zf ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-extrabold shadow-xs' : 'bg-white border-slate-200 text-slate-400'
                        }`}>
                          <span className="text-[9px] block uppercase font-bold text-slate-500">Zero (ZF)</span>
                          <span className="text-sm">{currStep.zf}</span>
                        </div>
                        <div className={`p-2 rounded-lg border transition-all ${
                          currStep.sf ? 'bg-indigo-100 border-indigo-400 text-indigo-900 font-extrabold shadow-xs' : 'bg-white border-slate-200 text-slate-400'
                        }`}>
                          <span className="text-[9px] block uppercase font-bold text-slate-500">Sign (SF)</span>
                          <span className="text-sm">{currStep.sf}</span>
                        </div>
                      </div>
                    </div>

                    {/* Step Hardware Commentary */}
                    <div className="bg-purple-50 border border-purple-200 p-3.5 rounded-xl text-xs text-purple-950 space-y-1.5 leading-relaxed">
                      <div className="flex items-center gap-1.5 font-bold text-purple-900">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span>Step Execution Explanation</span>
                      </div>
                      <p>{currStep.explanation}</p>
                    </div>
                  </div>
                </div>

                {/* Column 3: Data Segment RAM Memory Grid (4 cols) */}
                <div className="lg:col-span-4 bg-white text-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4 font-mono shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-purple-600" />
                      Data Segment RAM (Little-Endian)
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">DS:0000H</span>
                  </div>

                  {/* Words RAM Grid */}
                  <div className="space-y-3 text-xs">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                      RESULT Array Memory Offsets:
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      {Array.from({ length: numWords }).map((_, wIdx) => {
                        const val = currStep.storedResultWords[wIdx];
                        const isActive = currStep.activeWordIdx === wIdx;
                        const offsetHex = (wIdx * 2).toString(16).toUpperCase().padStart(4, '0') + 'H';

                        return (
                          <div
                            key={wIdx}
                            className={`p-3 rounded-xl border text-center transition-all ${
                              isActive
                                ? 'bg-purple-100 border-2 border-purple-500 text-purple-950 ring-2 ring-purple-200 shadow-xs'
                                : val !== null
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}
                          >
                            <span className="text-[9px] font-bold text-slate-500 block uppercase">
                              Word {wIdx} (DS:{offsetHex})
                            </span>
                            <span className="text-base font-black my-1 block">
                              {val !== null ? hexFormat(val) : '????H'}
                            </span>
                            <span className="text-[8px] block font-sans text-slate-500 font-medium">
                              Bits {wIdx * 16}..{(wIdx + 1) * 16 - 1}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-purple-50/70 p-3 rounded-xl border border-purple-200 text-[11px] text-slate-800 space-y-1">
                      <div className="text-purple-950 font-bold flex justify-between">
                        <span>Current Computed Full Result:</span>
                        <span className="text-emerald-700 font-mono font-extrabold">
                          {(() => {
                            let resHex = '';
                            for (let i = numWords - 1; i >= 0; i--) {
                              const wVal = currStep.storedResultWords[i];
                              resHex += wVal !== null ? (wVal & 0xFFFF).toString(16).toUpperCase().padStart(4, '0') : '????';
                            }
                            return resHex + 'H';
                          })()}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 leading-normal font-sans">
                        Word 0 is stored at lowest offset (DS:0000H), followed by higher words up to Word {numWords - 1} (DS:000{numWords * 2 - 2}H).
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Complete Assembly Language Program Source Code Box */}
              <div className="bg-white text-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3 font-mono text-xs shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-800 font-bold text-xs uppercase tracking-wider">
                      Complete MASM 8086 Assembly Source Code (Exp 1A)
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopyCode(masmCode)}
                    className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
                    {copiedCode ? 'Copied Code!' : 'Copy Code'}
                  </button>
                </div>

                <pre className="bg-slate-50 p-4 rounded-xl text-slate-800 overflow-x-auto leading-relaxed border border-slate-200 text-[11px] font-bold">
                  {masmCode}
                </pre>
              </div>
            </motion.div>
          );
        })()}
      </div>
    </div>
  );
}
