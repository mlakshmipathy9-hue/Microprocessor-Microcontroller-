import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Cpu, 
  Settings, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight, 
  Sparkles, 
  Info, 
  Terminal, 
  ArrowLeftRight, 
  Layers, 
  Database,
  ChevronRight,
  HelpCircle,
  Sliders,
  ChevronLeft,
  BookOpen,
  Binary,
  ArrowRightLeft,
  Code2,
  ArrowDown,
  ArrowUp,
  Zap,
  Flag,
  Radio,
  Repeat,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  GitBranch
} from 'lucide-react';
import {
  SimulatorInstruction,
  mockInstructions,
  eceSlides,
  getSlideIndexForOpcode,
  getInstructionFormat,
  getOperandAnalysis,
  getInstNameInfo,
  getDisplayOpcode,
  getGeneralFormat,
  getGeneralExplanation,
  ADDRESSING_MODES,
  getAddressingModeAnalysis,
  isAddressingApplicable,
  getApplicableAddressingModes,
  EceSlide,
  InstructionFormatInfo
} from '../data/instructionDecoderData';
import BranchingInstructionsTable from './BranchingInstructionsTable';

interface InstructionDecoderSimulatorProps {
  initialTab?: 'lab' | 'groups' | 'branching' | 'comparison' | 'remember';
  initialSubTab?: 'instructions' | 'explanation' | 'addressing' | 'registers' | 'explorers';
  hideGroupsTab?: boolean;
  hideLabTab?: boolean;
  hideBranchingTab?: boolean;
  hideComparisonTab?: boolean;
  hideRememberTab?: boolean;
  hideGuideBanner?: boolean;
}

export default function InstructionDecoderSimulator({
  initialTab = 'lab',
  initialSubTab = 'instructions',
  hideGroupsTab = false,
  hideLabTab = false,
  hideBranchingTab = false,
  hideComparisonTab = false,
  hideRememberTab = false,
  hideGuideBanner = false
}: InstructionDecoderSimulatorProps = {}) {
  const [activeMainTab, setActiveMainTab] = useState<'lab' | 'groups' | 'branching' | 'comparison' | 'remember'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveMainTab(initialTab);
    }
  }, [initialTab]);

  const [mobileSubTab, setMobileSubTab] = useState<'instructions' | 'explanation' | 'addressing' | 'registers' | 'explorers'>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setMobileSubTab(initialSubTab);
    }
  }, [initialSubTab]);
  const [showInstDetailsMobile, setShowInstDetailsMobile] = useState<boolean>(true);
  const [showOperandDetailsMobile, setShowOperandDetailsMobile] = useState<boolean>(true);
  const [categoryTab, setCategoryTab] = useState<'Data Copy / Transfer' | 'Arithmetic' | 'BCD & ASCII' | 'Logical' | 'Branch' | 'Loop' | 'Machine Control' | 'Flag Manipulation' | 'Shift & Rotate' | 'String & Port'>('Data Copy / Transfer');
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [selectedAddressingMode, setSelectedAddressingMode] = useState<string>('default');
  const [opDetailsSubTab, setOpDetailsSubTab] = useState<'details' | 'operands'>('operands');
  
  // Simulated hardware state
  const [regs, setRegs] = useState<Record<string, number>>(mockInstructions[0].initialRegs);
  const [flags, setFlags] = useState<Record<string, number>>(mockInstructions[0].initialFlags);
  const [beforeRegs, setBeforeRegs] = useState<Record<string, number>>(mockInstructions[0].initialRegs);
  const [beforeFlags, setBeforeFlags] = useState<Record<string, number>>(mockInstructions[0].initialFlags);
  
  // Execution Status
  const [executionState, setExecutionState] = useState<'idle' | 'executing' | 'done'>('idle');
  const [lastExplanation, setLastExplanation] = useState<string>('');
  const [labHelpTab, setLabHelpTab] = useState<'slide' | 'format' | 'transfer' | 'xlat'>('slide');
  const [slideIndex, setSlideIndex] = useState<number>(3); // Initialized directly to MOV Slide
  const [transferDemo, setTransferDemo] = useState<'mov' | 'push' | 'pop' | 'lea'>('mov');

  // Register editing
  const [editingReg, setEditingReg] = useState<string | null>(null);
  const [tempRegVal, setTempRegVal] = useState<string>('');

  // Interactive XLAT translation scenario
  const [xlatScenario, setXlatScenario] = useState<'gray' | 'sevensegment' | 'ascii_num' | 'ascii_case' | 'custom'>('gray');
  const [xlatAlVal, setXlatAlVal] = useState<number>(3);

  const [xlatTable, setXlatTable] = useState<number[]>([
    0x00, 0x01, 0x03, 0x02, 0x06, 0x07, 0x05, 0x04, 0x0C, 0x0D, 0x0F, 0x0E, 0x0A, 0x0B, 0x09, 0x08
  ]);

  // Interactive Stack Frames State
  const [stackFrames, setStackFrames] = useState<Array<{ addr: number; value: number; label: string }>>([
    { addr: 0xFFFC, value: 0x1234, label: 'AX (Pushed)' }
  ]);

  // Interactive BCD & ASCII Converter State
  const [bcdVal, setBcdVal] = useState<number>(59);
  const [bcdOpcode, setBcdOpcode] = useState<'DAA' | 'DAS' | 'AAA' | 'AAS' | 'AAM' | 'AAD'>('DAA');

  // Interactive ALU Explorer State (Synchronized with AL/AX register)
  const [aluValA, setAluValA] = useState<number>(0x00FF);
  const [aluValB, setAluValB] = useState<number>(0x0001);
  const [aluOp, setAluOp] = useState<'ADD' | 'SUB' | 'AND' | 'OR' | 'XOR' | 'NOT' | 'NEG' | 'SHL' | 'SAL' | 'SHR' | 'SAR' | 'ROL' | 'ROR' | 'RCL' | 'RCR'>('SHL');
  const [shiftStep, setShiftStep] = useState<number>(0);
  const [shiftAnimRunning, setShiftAnimRunning] = useState<boolean>(false);
  const [initialCF, setInitialCF] = useState<number>(0);

  useEffect(() => {
    let interval: any = null;
    if (shiftAnimRunning) {
      interval = setInterval(() => {
        setShiftStep(prev => {
          const maxStep = Math.min(Math.max(aluValB & 0xFF, 1), 8);
          if (prev >= maxStep) {
            setShiftAnimRunning(false);
            return maxStep;
          }
          return prev + 1;
        });
      }, 800);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [shiftAnimRunning, aluValB]);

  // Interactive Flag & Control Explorer State
  const [interactiveFlags, setInteractiveFlags] = useState<Record<string, number>>({
    CF: 0, ZF: 1, SF: 0, OF: 0, AF: 0, PF: 1, IF: 1, DF: 0, TF: 0
  });

  // Interactive I/O Port Explorer State
  const [ioPort, setIoPort] = useState<number>(0x00C8);
  const [ioDataByte, setIoDataByte] = useState<number>(0x39);
  const [ioPortMode, setIoPortMode] = useState<'fixed' | 'variable'>('fixed');
  const [ioDir, setIoDir] = useState<'IN' | 'OUT'>('IN');

  // Interactive String Ops Explorer State
  const [stringDf, setStringDf] = useState<number>(0);
  const [stringCx, setStringCx] = useState<number>(5);
  const [stringOp, setStringOp] = useState<'MOVSB' | 'MOVSW' | 'CMPSB' | 'SCASB' | 'STOSB'>('MOVSB');
  const [stringActiveOp, setStringActiveOp] = useState<'MOVSB' | 'LODSB' | 'STOSB' | 'CMPSB' | 'SCASB' | 'IN' | 'OUT'>('MOVSB');
  const [stringStepIndex, setStringStepIndex] = useState<number>(0);
  const [stringAlReg, setStringAlReg] = useState<number>(0x41); // 'A'

  // Interactive Data Transfer Bus Explorer State
  const [transferBusMode, setTransferBusMode] = useState<'mov' | 'push' | 'pop' | 'lea' | 'xchg'>('mov');

  // Interactive Branch & Control Flow Explorer State
  const [branchValA, setBranchValA] = useState<number>(5);
  const [branchValB, setBranchValB] = useState<number>(5);
  const [branchJumpCond, setBranchJumpCond] = useState<'JZ' | 'JNZ' | 'JC' | 'JNC' | 'JA' | 'JB' | 'JG' | 'JL' | 'JMP' | 'LOOP'>('JZ');
  const [branchCx, setBranchCx] = useState<number>(3);

  const bcdGuideMap = {
    DAA: {
      title: 'DAA (Decimal Adjust AL after Addition)',
      subtitle: 'Packed BCD Addition Adjustment',
      example: '59H + 35H = 94 Decimal',
      step1Title: 'Step 1: Standard Binary Addition',
      step1Code: (
        <>
          <code>MOV AL, 59H</code> (Packed BCD 59)<br/>
          <code>ADD AL, 35H</code> (Packed BCD 35)<br/>
          <strong className="text-rose-400">AL = 8EH</strong> (Binary sum: 0101 1001 + 0011 0101)
        </>
      ),
      step1Note: '⚠️ EH is 14 decimal (> 9), which is INVALID in BCD!',
      step2Title: 'Step 2: Execute DAA Instruction',
      step2Code: (
        <>
          <code>DAA</code> inspects lower nibble (<code>EH &gt; 9</code>).<br/>
          Hardware adds correction factor <code>06H</code>:<br/>
          <strong className="text-indigo-300">8EH + 06H = 94H</strong>
        </>
      ),
      step2Note: '✨ Auxiliary Carry AF is set to 1.',
      step3Title: 'Step 3: Final BCD Decimal Output',
      step3Code: (
        <>
          <strong className="text-emerald-400 text-xs">AL = 94H</strong><br/>
          High nibble <code>9</code>, Low nibble <code>4</code>.<br/>
          Represents decimal sum <strong>94</strong> (59 + 35 = 94).
        </>
      ),
      step3Note: '✅ Packed BCD addition result is 94H!'
    },
    DAS: {
      title: 'DAS (Decimal Adjust AL after Subtraction)',
      subtitle: 'Packed BCD Subtraction Adjustment',
      example: '85H - 48H = 37 Decimal',
      step1Title: 'Step 1: Standard Binary Subtraction',
      step1Code: (
        <>
          <code>MOV AL, 85H</code> (Packed BCD 85)<br/>
          <code>SUB AL, 48H</code> (Packed BCD 48)<br/>
          <strong className="text-rose-400">AL = 3DH</strong> (1000 0101 - 0100 1000)
        </>
      ),
      step1Note: '⚠️ DH is 13 decimal (> 9), which is INVALID in BCD!',
      step2Title: 'Step 2: Execute DAS Instruction',
      step2Code: (
        <>
          <code>DAS</code> detects lower nibble <code>DH &gt; 9</code> or AF=1.<br/>
          Hardware subtracts correction factor <code>06H</code>:<br/>
          <strong className="text-indigo-300">3DH - 06H = 37H</strong>
        </>
      ),
      step2Note: '✨ Auxiliary Carry AF is set to 1.',
      step3Title: 'Step 3: Final BCD Decimal Output',
      step3Code: (
        <>
          <strong className="text-emerald-400 text-xs">AL = 37H</strong><br/>
          High nibble <code>3</code>, Low nibble <code>7</code>.<br/>
          Represents decimal difference <strong>37</strong> (85 - 48 = 37).
        </>
      ),
      step3Note: '✅ Packed BCD subtraction result is 37H!'
    },
    AAA: {
      title: 'AAA (ASCII Adjust AL after Addition)',
      subtitle: 'Unpacked / ASCII BCD Addition Adjustment',
      example: " '5' + '9' = 14 Decimal (AH=01H, AL=04H)",
      step1Title: 'Step 1: Binary Addition of ASCII Digits',
      step1Code: (
        <>
          <code>MOV AX, 0035H</code> (ASCII '5' in AL)<br/>
          <code>ADD AL, 39H</code> (ASCII '9')<br/>
          <strong className="text-rose-400">AL = 6EH</strong> (35H + 39H = 6EH)
        </>
      ),
      step1Note: '⚠️ Lower nibble EH is 14 (> 9), needing digit carry adjustment!',
      step2Title: 'Step 2: Execute AAA Instruction',
      step2Code: (
        <>
          <code>AAA</code> adds <code>06H</code> to AL (6EH + 06H = 74H → AL=04H),<br/>
          increments <code>AH = 01H</code>, and clears AL upper nibble:<br/>
          <code>AND AL, 0FH</code> → <strong className="text-indigo-300">AX = 0104H</strong>
        </>
      ),
      step2Note: '✨ Sets AF = 1 and CF = 1 (Carry to next digit).',
      step3Title: 'Step 3: Final Unpacked BCD Output',
      step3Code: (
        <>
          <strong className="text-emerald-400 text-xs">AH = 01H, AL = 04H</strong><br/>
          Unpacked decimal sum = <strong>14</strong>.<br/>
          (Add 30H to AL/AH for ASCII '1' and '4').
        </>
      ),
      step3Note: '✅ Unpacked ASCII addition result is 14!'
    },
    AAS: {
      title: 'AAS (ASCII Adjust AL after Subtraction)',
      subtitle: 'Unpacked / ASCII BCD Subtraction Adjustment',
      example: " '13' - '9' = 4 Decimal (AH=00H, AL=04H)",
      step1Title: 'Step 1: Binary Subtraction of Digits',
      step1Code: (
        <>
          <code>MOV AX, 0103H</code> (Unpacked 13: AH=01, AL=03)<br/>
          <code>SUB AL, 09H</code> (Subtract 9)<br/>
          <strong className="text-rose-400">AL = FAH</strong> (-6 in 2's complement)
        </>
      ),
      step1Note: '⚠️ Borrow occurred from upper digit (AF=1 or AL > 9)!',
      step2Title: 'Step 2: Execute AAS Instruction',
      step2Code: (
        <>
          <code>AAS</code> subtracts <code>06H</code> from AL (FAH - 06H = F4H → AL=04H),<br/>
          decrements <code>AH (01H → 00H)</code>, and masks AL:<br/>
          <code>AND AL, 0FH</code> → <strong className="text-indigo-300">AX = 0004H</strong>
        </>
      ),
      step2Note: '✨ Sets AF = 1 and CF = 1.',
      step3Title: 'Step 3: Final Unpacked BCD Output',
      step3Code: (
        <>
          <strong className="text-emerald-400 text-xs">AH = 00H, AL = 04H</strong><br/>
          Unpacked decimal difference = <strong>4</strong>.<br/>
          (13 - 9 = 4).
        </>
      ),
      step3Note: '✅ Unpacked ASCII subtraction result is 04!'
    },
    AAM: {
      title: 'AAM (ASCII Adjust AL after Multiplication)',
      subtitle: 'Unpacked BCD Multiplication Adjustment',
      example: '7 × 9 = 63 Decimal (AH=06H, AL=03H)',
      step1Title: 'Step 1: Unsigned Binary Multiplication',
      step1Code: (
        <>
          <code>MOV AL, 07H</code>, <code>MOV BL, 09H</code><br/>
          <code>MUL BL</code> → <strong className="text-rose-400">AX = 003FH</strong><br/>
          (3FH in binary hex = 63 decimal)
        </>
      ),
      step1Note: '⚠️ Result 3FH is single binary byte, not unpacked BCD digits!',
      step2Title: 'Step 2: Execute AAM Instruction',
      step2Code: (
        <>
          <code>AAM</code> divides AL by 10 (0Ah):<br/>
          Quotient <code>3FH ÷ 0AH = 6</code> → stored in <strong>AH</strong><br/>
          Remainder <code>3FH % 0AH = 3</code> → stored in <strong>AL</strong>
        </>
      ),
      step2Note: '✨ Converts binary product into 2 unpacked BCD digits.',
      step3Title: 'Step 3: Final Unpacked BCD Product',
      step3Code: (
        <>
          <strong className="text-emerald-400 text-xs">AX = 0603H (AH=06H, AL=03H)</strong><br/>
          AH holds Tens digit (6), AL holds Ones digit (3).<br/>
          Represents product <strong>63</strong> (7 × 9 = 63).
        </>
      ),
      step3Note: '✅ Unpacked BCD multiplication result is 63!'
    },
    AAD: {
      title: 'AAD (ASCII Adjust AX before Division)',
      subtitle: 'Unpacked BCD Division Preparation',
      example: '63 ÷ 7 = 9 Decimal (AX=0603H → AAD → AL=3FH → DIV)',
      step1Title: 'Step 1: Unpacked BCD Numerator in AX',
      step1Code: (
        <>
          <code>MOV AX, 0603H</code> (Unpacked BCD 63: AH=06, AL=03)<br/>
          <code>MOV BL, 07H</code> (Divisor = 7)<br/>
          <strong className="text-rose-400">Direct DIV BL would fail</strong> because 0603H hex = 1539 dec!
        </>
      ),
      step1Note: '⚠️ Unpacked BCD must be converted to binary BEFORE division!',
      step2Title: 'Step 2: Execute AAD BEFORE Division',
      step2Code: (
        <>
          <code>AAD</code> performs: <code>AL = (AH × 10) + AL</code><br/>
          <code>AL = (6 × 10) + 3 = 63 = 3FH</code><br/>
          Sets <code>AH = 00H</code> → <strong className="text-indigo-300">AX = 003FH</strong>
        </>
      ),
      step2Note: '✨ Prepares binary dividend 63 (3FH) in AL.',
      step3Title: 'Step 3: Execute DIV BL Instruction',
      step3Code: (
        <>
          <code>DIV BL</code> (3FH ÷ 07H = 63 ÷ 7):<br/>
          Quotient <strong className="text-emerald-400 text-xs">AL = 09H</strong><br/>
          Remainder <strong className="text-emerald-400 text-xs">AH = 00H</strong>
        </>
      ),
      step3Note: '✅ Flawless BCD division quotient = 9!'
    }
  };



  const activeInstruction = mockInstructions[selectedIdx];
  const currentCategory = categoryTab;
  const applicableAddressingModes = getApplicableAddressingModes(activeInstruction?.opcode);

  useEffect(() => {
    if (!isAddressingApplicable(activeInstruction?.opcode) && mobileSubTab === 'addressing') {
      setMobileSubTab('explanation');
    }
    if (!applicableAddressingModes.some(m => m.key === selectedAddressingMode)) {
      setSelectedAddressingMode('default');
    }
  }, [activeInstruction?.opcode, mobileSubTab, selectedAddressingMode, applicableAddressingModes]);

  // Computed ALU values for the interactive ALU panel
  const computeAluRes = () => {
    const a = aluValA & 0xFF;
    const b = aluValB & 0xFF;
    let res = 0;
    let cf = 0;
    let af = 0;
    let of = 0;
    let zf = 0;
    let sf = 0;

    if (aluOp === 'ADD') {
      res = (a + b) & 0xFF;
      cf = (a + b) > 0xFF ? 1 : 0;
      af = ((a & 0x0F) + (b & 0x0F)) > 0x0F ? 1 : 0;
      const sa = (a >> 7) & 1;
      const sb = (b >> 7) & 1;
      const sr = (res >> 7) & 1;
      of = (sa === sb && sa !== sr) ? 1 : 0;
    } else if (aluOp === 'SUB') {
      res = (a - b + 0x100) & 0xFF;
      cf = a < b ? 1 : 0;
      af = (a & 0x0F) < (b & 0x0F) ? 1 : 0;
      const sa = (a >> 7) & 1;
      const sb = (b >> 7) & 1;
      const sr = (res >> 7) & 1;
      of = (sa !== sb && sa !== sr) ? 1 : 0;
    } else if (aluOp === 'AND') {
      res = a & b;
    } else if (aluOp === 'OR') {
      res = a | b;
    } else if (aluOp === 'XOR') {
      res = a ^ b;
    } else if (aluOp === 'NOT' || activeInstruction?.opcode.startsWith('NOT')) {
      res = (~a) & 0xFF;
      return { res, cf: flags.CF, zf: flags.ZF, sf: flags.SF, of: flags.OF, af: flags.AF, pf: flags.PF };
    } else if (aluOp === 'NEG' || activeInstruction?.opcode.startsWith('NEG')) {
      res = (0 - a + 0x100) & 0xFF;
      cf = a !== 0 ? 1 : 0;
      af = (a & 0x0F) !== 0 ? 1 : 0;
      sf = (res & 0x80) ? 1 : 0;
      zf = res === 0 ? 1 : 0;
      of = a === 0x80 ? 1 : 0;
      let ones = 0;
      for (let i = 0; i < 8; i++) { if ((res >> i) & 1) ones++; }
      const pfVal = ones % 2 === 0 ? 1 : 0;
      return { res, cf, zf, sf, of, af, pf: pfVal };
    } else if (aluOp === 'SHL' || aluOp === 'SAL') {
      const count = Math.min(Math.max(b & 0xFF, 1), 8);
      let temp = a;
      let lastCF = 0;
      for (let i = 0; i < count; i++) {
        lastCF = (temp >> 7) & 1;
        temp = (temp << 1) & 0xFF;
      }
      res = temp;
      cf = lastCF;
      of = (((a >> 7) & 1) !== ((res >> 7) & 1)) ? 1 : 0;
    } else if (aluOp === 'SHR') {
      const count = Math.min(Math.max(b & 0xFF, 1), 8);
      let temp = a;
      let lastCF = 0;
      for (let i = 0; i < count; i++) {
        lastCF = temp & 1;
        temp = (temp >> 1) & 0x7F;
      }
      res = temp;
      cf = lastCF;
      of = ((a >> 7) & 1) ? 1 : 0;
    } else if (aluOp === 'SAR') {
      const count = Math.min(Math.max(b & 0xFF, 1), 8);
      let temp = a;
      let lastCF = 0;
      for (let i = 0; i < count; i++) {
        lastCF = temp & 1;
        const signBit = (temp >> 7) & 1;
        temp = ((temp >> 1) & 0x7F) | (signBit << 7);
      }
      res = temp;
      cf = lastCF;
      of = 0;
    } else if (aluOp === 'ROL') {
      const count = Math.min(Math.max(b & 0xFF, 1), 8);
      let temp = a;
      let lastCF = 0;
      for (let i = 0; i < count; i++) {
        lastCF = (temp >> 7) & 1;
        temp = ((temp << 1) & 0xFF) | lastCF;
      }
      res = temp;
      cf = lastCF;
      of = (((temp >> 7) & 1) !== lastCF) ? 1 : 0;
    } else if (aluOp === 'ROR') {
      const count = Math.min(Math.max(b & 0xFF, 1), 8);
      let temp = a;
      let lastCF = 0;
      for (let i = 0; i < count; i++) {
        lastCF = temp & 1;
        temp = ((temp >> 1) & 0x7F) | (lastCF << 7);
      }
      res = temp;
      cf = lastCF;
      of = (((temp >> 7) & 1) !== ((temp >> 6) & 1)) ? 1 : 0;
    } else if (aluOp === 'RCL') {
      const count = Math.min(Math.max(b & 0xFF, 1), 8);
      let temp = a;
      let curCF = interactiveFlags.CF || initialCF || 0;
      for (let i = 0; i < count; i++) {
        const msb = (temp >> 7) & 1;
        temp = ((temp << 1) & 0xFF) | curCF;
        curCF = msb;
      }
      res = temp;
      cf = curCF;
    } else if (aluOp === 'RCR') {
      const count = Math.min(Math.max(b & 0xFF, 1), 8);
      let temp = a;
      let curCF = interactiveFlags.CF || initialCF || 0;
      for (let i = 0; i < count; i++) {
        const lsb = temp & 1;
        temp = ((temp >> 1) & 0x7F) | (curCF << 7);
        curCF = lsb;
      }
      res = temp;
      cf = curCF;
    }

    zf = res === 0 ? 1 : 0;
    sf = (res & 0x80) ? 1 : 0;
    let ones = 0;
    for (let i = 0; i < 8; i++) {
      if ((res >> i) & 1) ones++;
    }
    const pf = ones % 2 === 0 ? 1 : 0;

    return { res, cf, zf, sf, of, af, pf };
  };

  // Dedicated Interactive Bit-Shift Visualizer Component
  const renderVisualBitShiftSimulator = (isDarkTheme: boolean = false) => {
    const currentOp = aluOp;
    const valA = aluValA & 0xFF;
    const count = activeInstruction.category === 'Shift & Rotate'
      ? Math.min(Math.max(aluValB & 0x07 || 1, 1), 8)
      : Math.min(Math.max(aluValB & 0xFF, 1), 8);

    const startCF = interactiveFlags.CF || initialCF || 0;

    const stepDataList: Array<{
      stepNum: number;
      bits: number[];
      cf: number;
      outBit: number;
      injectedBit: number;
      expl: string;
      valHex: string;
      valDec: number;
    }> = [];

    const toBits = (n: number) => {
      const arr = [];
      for (let i = 7; i >= 0; i--) arr.push((n >> i) & 1);
      return arr;
    };

    let curVal = valA;
    let curCF = startCF;

    stepDataList.push({
      stepNum: 0,
      bits: toBits(curVal),
      cf: curCF,
      outBit: 0,
      injectedBit: 0,
      expl: `Step 0: Initial state of AL = ${byteHexFormat(curVal)} (${toBits(curVal).join('')}B), Carry Flag CF = ${curCF}.`,
      valHex: byteHexFormat(curVal),
      valDec: curVal
    });

    for (let s = 1; s <= count; s++) {
      const prevBits = toBits(curVal);
      const prevCF = curCF;
      let nextVal = curVal;
      let nextCF = curCF;
      let outBit = 0;
      let injectedBit = 0;
      let expl = '';

      const op = currentOp.toUpperCase();
      if (op === 'SHL' || op === 'SAL') {
        outBit = prevBits[0];
        injectedBit = 0;
        nextCF = outBit;
        nextVal = ((curVal << 1) & 0xFF) | injectedBit;
        expl = `Step ${s}: Bit 7 (${outBit}) shifted left OUT into Carry Flag (CF=${nextCF}). All bits shifted left by 1 position. Bit 0 (LSB) filled with 0.`;
      } else if (op === 'SHR') {
        outBit = prevBits[7];
        injectedBit = 0;
        nextCF = outBit;
        nextVal = ((curVal >> 1) & 0x7F) | (injectedBit << 7);
        expl = `Step ${s}: Bit 0 (${outBit}) shifted right OUT into Carry Flag (CF=${nextCF}). All bits shifted right by 1 position. Bit 7 (MSB) filled with 0.`;
      } else if (op === 'SAR') {
        outBit = prevBits[7];
        injectedBit = prevBits[0];
        nextCF = outBit;
        nextVal = ((curVal >> 1) & 0x7F) | (injectedBit << 7);
        expl = `Step ${s}: Bit 0 (${outBit}) shifted right OUT into Carry Flag (CF=${nextCF}). Bit 7 (Sign Bit = ${injectedBit}) is PRESERVED and duplicated to maintain 2's complement sign.`;
      } else if (op === 'ROL') {
        outBit = prevBits[0];
        injectedBit = prevBits[0];
        nextCF = outBit;
        nextVal = ((curVal << 1) & 0xFF) | injectedBit;
        expl = `Step ${s}: [8-Bit Circular Rotate] Bit 7 (${outBit}) wrapped directly around into Bit 0 (LSB), AND was copied into Carry Flag (CF=${nextCF}). No bits lost!`;
      } else if (op === 'ROR') {
        outBit = prevBits[7];
        injectedBit = prevBits[7];
        nextCF = outBit;
        nextVal = ((curVal >> 1) & 0x7F) | (injectedBit << 7);
        expl = `Step ${s}: [8-Bit Circular Rotate] Bit 0 (${outBit}) wrapped directly around into Bit 7 (MSB), AND was copied into Carry Flag (CF=${nextCF}). No bits lost!`;
      } else if (op === 'RCL') {
        outBit = prevBits[0];
        injectedBit = prevCF;
        nextCF = outBit;
        nextVal = ((curVal << 1) & 0xFF) | injectedBit;
        expl = `Step ${s}: [9-Bit Ring Rotate] Bit 7 (${outBit}) shifted left into Carry Flag (CF=${nextCF}). Previous Carry Flag (${prevCF}) rotated into Bit 0 (LSB) as a 9th bit in the loop.`;
      } else if (op === 'RCR') {
        outBit = prevBits[7];
        injectedBit = prevCF;
        nextCF = outBit;
        nextVal = ((curVal >> 1) & 0x7F) | (injectedBit << 7);
        expl = `Step ${s}: [9-Bit Ring Rotate] Bit 0 (${outBit}) shifted right into Carry Flag (CF=${nextCF}). Previous Carry Flag (${prevCF}) rotated into Bit 7 (MSB) as a 9th bit in the loop.`;
      }

      curVal = nextVal;
      curCF = nextCF;

      stepDataList.push({
        stepNum: s,
        bits: toBits(curVal),
        cf: curCF,
        outBit,
        injectedBit,
        expl,
        valHex: byteHexFormat(curVal),
        valDec: curVal
      });
    }

    const boundedStep = Math.min(shiftStep, count);
    const activeStep = stepDataList[boundedStep] || stepDataList[0];
    const isLeftShift = ['SHL', 'SAL', 'ROL', 'RCL'].includes(currentOp.toUpperCase());

    const isShiftOp = ['SHL', 'SAL', 'SHR', 'SAR'].includes(currentOp.toUpperCase());
    const isSimpleRotate = ['ROL', 'ROR'].includes(currentOp.toUpperCase());
    const isCarryRotate = ['RCL', 'RCR'].includes(currentOp.toUpperCase());

    const opFullNames: Record<string, string> = {
      SHL: 'Shift Logical Left',
      SAL: 'Shift Arithmetic Left',
      SHR: 'Shift Logical Right',
      SAR: 'Shift Arithmetic Right',
      ROL: 'Rotate Left',
      ROR: 'Rotate Right',
      RCL: 'Rotate Through Carry Left',
      RCR: 'Rotate Through Carry Right',
    };
    const fullOpName = opFullNames[currentOp.toUpperCase()] || currentOp.toUpperCase();

    return (
      <div className={`${isDarkTheme ? 'bg-slate-900 text-white border-indigo-700/60' : 'bg-gradient-to-br from-indigo-50/60 via-white to-blue-50/60 text-slate-900 border-indigo-200/80 shadow-xs'} p-3 sm:p-5 rounded-xl border space-y-4 font-mono text-xs w-full`}>
        {/* Header & Grouped Opcode Selector */}
        <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b ${isDarkTheme ? 'border-indigo-800/60' : 'border-indigo-200'} pb-3.5`}>
          <div className="flex items-center gap-2.5">
            <Binary className={`w-5 h-5 shrink-0 ${isDarkTheme ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <div>
              <h4 className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${isDarkTheme ? 'text-indigo-300' : 'text-indigo-950'}`}>
                8086 {currentOp.toUpperCase()} ({fullOpName}) Simulator
              </h4>
              <span className={`text-[10.5px] font-sans ${isDarkTheme ? 'text-slate-400' : 'text-slate-600'}`}>
                Step-by-step interactive comparison: observe how bits shift, fill, or circulate through the Carry Flag.
              </span>
            </div>
          </div>

          {/* Grouped Opcode Buttons */}
          <div className="flex flex-wrap items-center gap-2 font-sans text-[10.5px]">
            {/* Shifts Group */}
            <div className={`flex items-center gap-1 p-1 rounded-lg border ${isDarkTheme ? 'bg-indigo-950/80 border-indigo-800' : 'bg-indigo-50/80 border-indigo-200'}`}>
              <span className={`px-1.5 font-bold uppercase text-[9px] ${isDarkTheme ? 'text-indigo-300' : 'text-indigo-900'}`}>Shifts:</span>
              {['SHL', 'SHR', 'SAR'].map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setAluOp(m as any);
                    setShiftStep(0);
                    setShiftAnimRunning(false);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold transition-all cursor-pointer ${
                    aluOp.toUpperCase() === m
                      ? isDarkTheme ? 'bg-emerald-500 text-slate-950 shadow-xs scale-105' : 'bg-emerald-600 text-white shadow-xs scale-105'
                      : isDarkTheme ? 'bg-indigo-900/60 text-indigo-200 hover:bg-indigo-800' : 'bg-white text-indigo-900 hover:bg-indigo-100 border border-indigo-200/60'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Rotates Group */}
            <div className={`flex items-center gap-1 p-1 rounded-lg border ${isDarkTheme ? 'bg-purple-950/80 border-purple-800' : 'bg-purple-50/80 border-purple-200'}`}>
              <span className={`px-1.5 font-bold uppercase text-[9px] ${isDarkTheme ? 'text-purple-300' : 'text-purple-900'}`}>Rotates:</span>
              {['ROL', 'ROR', 'RCL', 'RCR'].map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setAluOp(m as any);
                    setShiftStep(0);
                    setShiftAnimRunning(false);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold transition-all cursor-pointer ${
                    aluOp.toUpperCase() === m
                      ? isDarkTheme ? 'bg-purple-500 text-slate-950 shadow-xs scale-105' : 'bg-purple-600 text-white shadow-xs scale-105'
                      : isDarkTheme ? 'bg-purple-900/60 text-purple-200 hover:bg-purple-800' : 'bg-white text-purple-900 hover:bg-purple-100 border border-purple-200/60'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Concept Explanation Banner: SHIFT vs. ROTATE */}
        <div className={`p-3 rounded-xl border text-[11px] font-sans space-y-1.5 transition-all ${
          isShiftOp
            ? isDarkTheme ? 'bg-sky-950/70 border-sky-800 text-sky-200' : 'bg-sky-50/90 border-sky-200 text-sky-950'
            : isSimpleRotate
            ? isDarkTheme ? 'bg-purple-950/70 border-purple-800 text-purple-200' : 'bg-purple-50/90 border-purple-200 text-purple-950'
            : isDarkTheme ? 'bg-amber-950/70 border-amber-800 text-amber-200' : 'bg-amber-50/90 border-amber-200 text-amber-950'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-extrabold uppercase tracking-wide text-xs flex items-center gap-1.5">
              {isShiftOp && <span className="px-2 py-0.5 rounded bg-sky-600 text-white text-[10px] font-mono">⚡ LINEAR SHIFT MODE</span>}
              {isSimpleRotate && <span className="px-2 py-0.5 rounded bg-purple-600 text-white text-[10px] font-mono">🔄 8-BIT CIRCULAR ROTATE</span>}
              {isCarryRotate && <span className="px-2 py-0.5 rounded bg-amber-600 text-white text-[10px] font-mono">🔂 9-BIT CARRY RING ROTATE</span>}
              <strong className="font-sans">Key Concept: How Bit Movement Works for {aluOp.toUpperCase()}</strong>
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/80 border border-current text-slate-800">
              {isShiftOp ? 'Linear Stream (Bits Discarded)' : isSimpleRotate ? 'Closed Loop (8 Bits Preserved)' : '9-Bit Loop (Includes CF)'}
            </span>
          </div>

          <p className="text-[11px] leading-relaxed">
            {isShiftOp && (
              <>
                <strong>Linear Shift:</strong> Bits move in one direction. Bits pushed out of the register end go directly into the <strong>Carry Flag (CF)</strong> and are discarded. Vacant positions created on the other end are filled with <strong>{aluOp.toUpperCase() === 'SAR' ? 'the Sign Bit (MSB)' : 'Zeroes (0)'}</strong>.
              </>
            )}
            {isSimpleRotate && (
              <>
                <strong>8-Bit Circular Rotate:</strong> No bits are lost! Bits exiting one end <strong>wrap around directly</strong> to enter the opposite end. Simultaneously, a copy of the wrapped bit is saved into the <strong>Carry Flag (CF)</strong> for status tracking.
              </>
            )}
            {isCarryRotate && (
              <>
                <strong>9-Bit Rotate Through Carry:</strong> The <strong>Carry Flag (CF)</strong> participates directly as an actual <strong>9th bit in the circular loop</strong>! The bit leaving the register enters CF, and the previous value of CF enters the opposite end of the register.
              </>
            )}
          </p>
        </div>

        {/* Operands & Shift Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          {/* Operand AL */}
          <div className={`${isDarkTheme ? 'bg-indigo-950/60 border-indigo-800' : 'bg-white border-indigo-200 shadow-2xs'} p-2.5 rounded-lg border space-y-1`}>
            <div className="flex justify-between items-center text-[11px] font-bold">
              <span className={isDarkTheme ? 'text-indigo-200' : 'text-indigo-950'}>Operand AL:</span>
              <span className={`${isDarkTheme ? 'text-emerald-400' : 'text-emerald-700'} font-extrabold`}>{byteHexFormat(aluValA)} ({aluValA & 0xFF})</span>
            </div>
            <input
              type="range"
              min={0}
              max={255}
              value={aluValA & 0xFF}
              onChange={(e) => {
                const val = Number(e.target.value);
                setAluValA(val);
                setShiftStep(0);
                setShiftAnimRunning(false);
              }}
              className={`w-full accent-emerald-500 cursor-pointer h-1.5 ${isDarkTheme ? 'bg-indigo-900' : 'bg-indigo-100'} rounded-lg`}
            />
            <div className={`text-[10px] flex justify-between font-mono ${isDarkTheme ? 'text-indigo-300' : 'text-indigo-800'}`}>
              <span>Bits: {(aluValA & 0xFF).toString(2).padStart(8, '0')}</span>
              <span>Signed: {((aluValA & 0xFF) > 127 ? (aluValA & 0xFF) - 256 : (aluValA & 0xFF))}</span>
            </div>
          </div>

          {/* Shift Count */}
          <div className={`${isDarkTheme ? 'bg-indigo-950/60 border-indigo-800' : 'bg-white border-indigo-200 shadow-2xs'} p-2.5 rounded-lg border space-y-1`}>
            <div className="flex justify-between items-center text-[11px] font-bold">
              <span className={isDarkTheme ? 'text-indigo-200' : 'text-indigo-950'}>Shift Count (N):</span>
              <span className={`${isDarkTheme ? 'text-sky-300' : 'text-sky-700'} font-extrabold`}>{count} Bit{count > 1 ? 's' : ''}</span>
            </div>
            <input
              type="range"
              min={1}
              max={8}
              value={count}
              onChange={(e) => {
                const val = Number(e.target.value);
                setAluValB(val);
                setShiftStep(0);
                setShiftAnimRunning(false);
              }}
              className={`w-full accent-sky-500 cursor-pointer h-1.5 ${isDarkTheme ? 'bg-indigo-900' : 'bg-indigo-100'} rounded-lg`}
            />
            <div className={`text-[10px] flex justify-between ${isDarkTheme ? 'text-indigo-300' : 'text-indigo-800'}`}>
              <span>Range: 1 to 8 bits</span>
              <span>Op: {aluOp}</span>
            </div>
          </div>

          {/* Initial CF & Stepper Toolbar */}
          <div className={`${isDarkTheme ? 'bg-indigo-950/60 border-indigo-800' : 'bg-white border-indigo-200 shadow-2xs'} p-2.5 rounded-lg border flex flex-col justify-between space-y-1.5`}>
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className={isDarkTheme ? 'text-indigo-200' : 'text-indigo-950'}>Initial CF:</span>
              <button
                onClick={() => {
                  const nextCF = startCF ? 0 : 1;
                  setInitialCF(nextCF);
                  setInteractiveFlags(prev => ({ ...prev, CF: nextCF }));
                  setShiftStep(0);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-extrabold cursor-pointer border ${
                  startCF
                    ? isDarkTheme ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-amber-500 text-white border-amber-600'
                    : isDarkTheme ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                CF = {startCF}
              </button>
            </div>

            {/* Stepper Buttons */}
            <div className="flex items-center justify-between gap-1 pt-1">
              <button
                onClick={() => {
                  setShiftStep(0);
                  setShiftAnimRunning(false);
                }}
                className={`px-2 py-1 rounded text-[10px] font-bold border cursor-pointer ${
                  isDarkTheme ? 'bg-indigo-900 hover:bg-indigo-800 text-indigo-200 border-indigo-700' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-200'
                }`}
                title="Reset to Step 0"
              >
                ⏮ 0
              </button>
              <button
                onClick={() => {
                  setShiftStep(prev => Math.max(0, prev - 1));
                  setShiftAnimRunning(false);
                }}
                disabled={boundedStep <= 0}
                className={`px-2 py-1 rounded text-[10px] font-bold border cursor-pointer disabled:opacity-40 ${
                  isDarkTheme ? 'bg-indigo-900 hover:bg-indigo-800 text-indigo-200 border-indigo-700' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-200'
                }`}
              >
                ◀ Prev
              </button>
              <button
                onClick={() => {
                  setShiftStep(prev => Math.min(count, prev + 1));
                  setShiftAnimRunning(false);
                }}
                disabled={boundedStep >= count}
                className={`px-2 py-1 rounded text-[10px] font-extrabold shadow-2xs cursor-pointer disabled:opacity-40 ${
                  isDarkTheme ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                ▶ Step {boundedStep < count ? boundedStep + 1 : count}
              </button>
              <button
                onClick={() => setShiftAnimRunning(prev => !prev)}
                className={`px-2 py-1 rounded text-[10px] font-bold border cursor-pointer ${
                  shiftAnimRunning
                    ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                    : isDarkTheme ? 'bg-indigo-800 text-indigo-100 hover:bg-indigo-700 border-indigo-600' : 'bg-indigo-100 text-indigo-900 hover:bg-indigo-200 border-indigo-300'
                }`}
              >
                {shiftAnimRunning ? '⏸ Pause' : '⏯ Animate'}
              </button>
            </div>
          </div>
        </div>

        {/* Direction & Pipeline Banner */}
        <div className={`${isDarkTheme ? 'bg-indigo-950/90 border-indigo-800/80 text-indigo-200' : 'bg-indigo-50/90 border-indigo-200 text-indigo-950'} p-2.5 rounded-lg border flex flex-wrap items-center justify-between gap-1.5 text-[11px] font-sans`}>
          <span className={`font-bold flex items-center gap-1.5 ${isDarkTheme ? 'text-amber-300' : 'text-amber-800'}`}>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Shift Direction:
          </span>
          <span className={`font-mono font-extrabold px-2.5 py-0.5 rounded border text-[10px] sm:text-[11px] ${isDarkTheme ? 'text-white bg-indigo-900 border-indigo-700' : 'text-indigo-950 bg-white border-indigo-200'}`}>
            {isLeftShift ? 'LEFT SHIFT / ROTATE (← MSB ← ... ← LSB ←)' : 'RIGHT SHIFT / ROTATE (→ MSB → ... → LSB →)'}
          </span>
          <span className={`${isDarkTheme ? 'text-emerald-400' : 'text-emerald-700'} font-bold font-mono`}>
            Step {boundedStep} / {count}
          </span>
        </div>

        {/* Mobile scroll hint */}
        <div className="text-[10px] text-slate-500 sm:hidden flex items-center justify-end gap-1 font-sans font-medium px-1">
          <span>← Swipe horizontally to view full bit flow →</span>
        </div>

        {/* THE VISUAL BIT-FLOW WIRE GRID */}
        <div className={`${isDarkTheme ? 'bg-slate-950 border-indigo-800/90' : 'bg-white border-indigo-200 shadow-2xs'} p-3 sm:p-5 rounded-xl border space-y-3.5 overflow-x-auto max-w-full w-full`}>
          {/* Circular Loop Graphic Indicator for Rotates */}
          {!isShiftOp && (
            <div className={`flex items-center justify-center gap-2 p-2 rounded-lg text-[11px] font-sans font-bold border ${
              isSimpleRotate
                ? isDarkTheme ? 'bg-purple-950/80 text-purple-300 border-purple-800' : 'bg-purple-50 text-purple-950 border-purple-200'
                : isDarkTheme ? 'bg-amber-950/80 text-amber-300 border-amber-800' : 'bg-amber-50 text-amber-950 border-amber-200'
            }`}>
              <span className="text-base">
                {isSimpleRotate ? '🔄' : '🔂'}
              </span>
              <span>
                {isSimpleRotate
                  ? `8-Bit Closed Loop Active (${aluOp.toUpperCase()}): Bits wrap around directly from ${isLeftShift ? 'b7 (MSB) ➔ b0 (LSB)' : 'b0 (LSB) ➔ b7 (MSB)'}`
                  : `9-Bit Closed Ring Active (${aluOp.toUpperCase()}): Bits pass THROUGH Carry Flag (${isLeftShift ? 'b7 ➔ CF ➔ b0' : 'b0 ➔ CF ➔ b7'})`}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between sm:justify-center gap-1.5 sm:gap-3 w-full max-w-full py-1.5 sm:py-2.5 font-mono min-w-[500px] sm:min-w-0">
            {isLeftShift ? (
              <div className={`flex flex-col items-center gap-1 ${isDarkTheme ? 'bg-amber-950/80 border-amber-500/80' : 'bg-amber-50 border-amber-300'} p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 text-center shrink-0 shadow-xs min-w-[62px] sm:min-w-[84px] md:min-w-[96px]`}>
                <span className={`text-[8px] sm:text-[10px] font-extrabold uppercase ${isDarkTheme ? 'text-amber-300' : 'text-amber-900'} tracking-tight leading-tight`}>
                  {isShiftOp ? 'CARRY (CF)' : isSimpleRotate ? 'CF COPY' : 'INTO CF'}
                </span>
                <div className="w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-md sm:rounded-lg bg-amber-500 text-slate-950 font-black text-sm sm:text-xl flex items-center justify-center shadow-md animate-pulse">
                  {activeStep.cf}
                </div>
                <span className={`text-[8px] sm:text-[10px] ${isDarkTheme ? 'text-amber-300' : 'text-amber-800'} font-bold whitespace-nowrap`}>
                  {isShiftOp ? 'OUT ←' : isSimpleRotate ? 'b7 ➔ CF' : 'b7 ➔ CF'}
                </span>
              </div>
            ) : (
              <div className={`flex flex-col items-center gap-1 ${isDarkTheme ? 'bg-sky-950/80 border-sky-500/80' : 'bg-sky-50 border-sky-300'} p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 text-center shrink-0 shadow-xs min-w-[62px] sm:min-w-[84px] md:min-w-[96px]`}>
                <span className={`text-[8px] sm:text-[10px] font-extrabold uppercase ${isDarkTheme ? 'text-sky-300' : 'text-sky-900'} tracking-tight leading-tight`}>
                  {isShiftOp ? (aluOp === 'SAR' ? 'SIGN' : 'ZERO FILL') : isSimpleRotate ? 'WRAPPED BIT' : 'PREV CF'}
                </span>
                <div className="w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-md sm:rounded-lg bg-sky-500 text-white font-black text-sm sm:text-xl flex items-center justify-center shadow-md">
                  {activeStep.injectedBit}
                </div>
                <span className={`text-[8px] sm:text-[10px] ${isDarkTheme ? 'text-sky-300' : 'text-sky-800'} font-bold whitespace-nowrap`}>
                  {isShiftOp ? 'IN →' : isSimpleRotate ? 'b0 ➔ b7' : 'CF ➔ b7'}
                </span>
              </div>
            )}

            <div className={`${isDarkTheme ? 'text-indigo-400' : 'text-indigo-600'} text-xs sm:text-lg font-black px-0.5 shrink-0 animate-bounce`}>
              {isLeftShift ? '⇇' : '⇉'}
            </div>

            <div className={`grid grid-cols-8 gap-1 sm:gap-2 md:gap-3 ${isDarkTheme ? 'bg-indigo-950/80 border-indigo-800' : 'bg-indigo-50/70 border-indigo-200'} p-1.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border flex-1 min-w-0`}>
              {activeStep.bits.map((bitVal, idx) => {
                const bitIndex = 7 - idx;
                const isMsb = bitIndex === 7;
                const isLsb = bitIndex === 0;

                let highlightBg = bitVal === 1
                  ? (isDarkTheme ? 'bg-emerald-500 text-slate-950' : 'bg-emerald-600 text-white')
                  : (isDarkTheme ? 'bg-slate-900 text-slate-300' : 'bg-white text-slate-700 border border-indigo-150');

                if (boundedStep > 0) {
                  if (isLeftShift && isLsb) highlightBg = 'bg-sky-500 text-white ring-1 sm:ring-2 ring-sky-300 font-extrabold';
                  if (!isLeftShift && isMsb) highlightBg = 'bg-sky-500 text-white ring-1 sm:ring-2 ring-sky-300 font-extrabold';
                }

                return (
                  <div key={idx} className="flex flex-col items-center gap-0.5 sm:gap-1.5 min-w-0 flex-1">
                    <span className={`text-[8px] sm:text-[10px] font-extrabold font-mono truncate max-w-full ${isMsb ? 'text-amber-600' : isLsb ? 'text-sky-600' : isDarkTheme ? 'text-indigo-300' : 'text-indigo-900'}`}>
                      b{bitIndex} {isMsb ? '(MSB)' : isLsb ? '(LSB)' : ''}
                    </span>

                    <div className={`w-7 h-7 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded sm:rounded-lg font-black text-xs sm:text-base md:text-lg flex items-center justify-center transition-all duration-300 shadow-xs ${highlightBg}`}>
                      {bitVal}
                    </div>

                    <span className={`text-[9px] sm:text-[11px] ${isDarkTheme ? 'text-indigo-400' : 'text-indigo-600'} font-black`}>
                      {isLeftShift ? '←' : '→'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className={`${isDarkTheme ? 'text-indigo-400' : 'text-indigo-600'} text-xs sm:text-lg font-black px-0.5 shrink-0 animate-bounce`}>
              {isLeftShift ? '⇇' : '⇉'}
            </div>

            {isLeftShift ? (
              <div className={`flex flex-col items-center gap-1 ${isDarkTheme ? 'bg-sky-950/80 border-sky-500/80' : 'bg-sky-50 border-sky-300'} p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 text-center shrink-0 shadow-xs min-w-[62px] sm:min-w-[84px] md:min-w-[96px]`}>
                <span className={`text-[8px] sm:text-[10px] font-extrabold uppercase ${isDarkTheme ? 'text-sky-300' : 'text-sky-900'} tracking-tight leading-tight`}>
                  {isShiftOp ? 'ZERO FILL' : isSimpleRotate ? 'WRAPPED BIT' : 'PREV CF'}
                </span>
                <div className="w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-md sm:rounded-lg bg-sky-500 text-white font-black text-sm sm:text-xl flex items-center justify-center shadow-md">
                  {activeStep.injectedBit}
                </div>
                <span className={`text-[8px] sm:text-[10px] ${isDarkTheme ? 'text-sky-300' : 'text-sky-800'} font-bold whitespace-nowrap`}>
                  {isShiftOp ? '← IN' : isSimpleRotate ? 'b7 ➔ b0' : 'CF ➔ b0'}
                </span>
              </div>
            ) : (
              <div className={`flex flex-col items-center gap-1 ${isDarkTheme ? 'bg-amber-950/80 border-amber-500/80' : 'bg-amber-50 border-amber-300'} p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 text-center shrink-0 shadow-xs min-w-[62px] sm:min-w-[84px] md:min-w-[96px]`}>
                <span className={`text-[8px] sm:text-[10px] font-extrabold uppercase ${isDarkTheme ? 'text-amber-300' : 'text-amber-900'} tracking-tight leading-tight`}>
                  {isShiftOp ? 'CARRY (CF)' : isSimpleRotate ? 'CF COPY' : 'INTO CF'}
                </span>
                <div className="w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-md sm:rounded-lg bg-amber-500 text-slate-950 font-black text-sm sm:text-xl flex items-center justify-center shadow-md animate-pulse">
                  {activeStep.cf}
                </div>
                <span className={`text-[8px] sm:text-[10px] ${isDarkTheme ? 'text-amber-300' : 'text-amber-800'} font-bold whitespace-nowrap`}>
                  {isShiftOp ? '← OUT' : isSimpleRotate ? 'b0 ➔ CF' : 'b0 ➔ CF'}
                </span>
              </div>
            )}
          </div>

          <div className={`${isDarkTheme ? 'bg-indigo-950/90 border-indigo-700/80' : 'bg-indigo-50/80 border-indigo-200'} p-3 rounded-lg border space-y-1.5 font-sans`}>
            <div className={`flex flex-wrap items-center justify-between gap-2 border-b ${isDarkTheme ? 'border-indigo-800' : 'border-indigo-200'} pb-1.5 text-[11px] font-mono`}>
              <span className={`${isDarkTheme ? 'text-amber-300' : 'text-amber-800'} font-extrabold flex items-center gap-1`}>
                💡 Step {boundedStep} Pipeline Explanation:
              </span>
              <div className="flex gap-2">
                <span className={isDarkTheme ? 'text-indigo-200' : 'text-indigo-950'}>Value: <strong className={isDarkTheme ? 'text-emerald-400' : 'text-emerald-700'}>{activeStep.valHex}</strong> ({activeStep.valDec})</span>
                <span className={isDarkTheme ? 'text-indigo-200' : 'text-indigo-950'}>CF: <strong className={isDarkTheme ? 'text-amber-400' : 'text-amber-700'}>{activeStep.cf}</strong></span>
              </div>
            </div>
            <p className={`text-[11px] ${isDarkTheme ? 'text-indigo-100' : 'text-slate-700'} font-medium leading-relaxed`}>
              {activeStep.expl}
            </p>
          </div>
        </div>

        {/* Live Status Flags Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
          <span className={`${isDarkTheme ? 'text-indigo-300' : 'text-indigo-950'} font-bold`}>Computed Flags at Step {boundedStep}:</span>
          <div className="flex gap-1.5 font-mono">
            {[
              { flag: 'CF', val: activeStep.cf },
              { flag: 'ZF', val: activeStep.valDec === 0 ? 1 : 0 },
              { flag: 'SF', val: (activeStep.valDec & 0x80) ? 1 : 0 },
              { flag: 'OF', val: (aluOp === 'SHL' || aluOp === 'SAL') ? (((valA >> 7) & 1) !== ((activeStep.valDec >> 7) & 1) ? 1 : 0) : 0 },
              { flag: 'PF', val: activeStep.bits.filter(b => b === 1).length % 2 === 0 ? 1 : 0 }
            ].map(f => (
              <span key={f.flag} className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                f.val
                  ? isDarkTheme ? 'bg-emerald-500 text-slate-950' : 'bg-emerald-600 text-white'
                  : isDarkTheme ? 'bg-indigo-950 text-indigo-400 border border-indigo-800' : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
              }`}>
                {f.flag}={f.val}
              </span>
            ))}
          </div>
        </div>

        {/* Educational Student Guide: Shift vs Rotate Quick Matrix */}
        <div className={`p-4 rounded-xl border text-[11px] font-sans space-y-2.5 ${
          isDarkTheme ? 'bg-slate-950 border-indigo-800/80 text-slate-300' : 'bg-white border-indigo-200 text-slate-700 shadow-2xs'
        }`}>
          <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
            <h5 className="font-extrabold text-xs uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
              🎓 Student Cheat Sheet: Why SHIFT and ROTATE are Different
            </h5>
            <span className="text-[10px] font-mono bg-indigo-50 text-indigo-900 px-2 py-0.5 rounded font-bold border border-indigo-200">
              8086 Assembly Essentials
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
            <div className="p-2.5 rounded-lg border border-sky-200 bg-sky-50/50 space-y-1">
              <strong className="text-sky-900 font-bold block flex items-center gap-1">
                ⚡ 1. SHIFTS (SHL / SHR / SAR)
              </strong>
              <p className="text-slate-600 leading-snug text-[10.5px]">
                <strong>Linear Stream:</strong> Shifted-out bits fall off into CF and are <em>lost</em>. Vacant bits are filled with <code>0</code> or the sign bit (SAR). Used for fast binary multiplication and division.
              </p>
            </div>

            <div className="p-2.5 rounded-lg border border-purple-200 bg-purple-50/50 space-y-1">
              <strong className="text-purple-900 font-bold block flex items-center gap-1">
                🔄 2. SIMPLE ROTATES (ROL / ROR)
              </strong>
              <p className="text-slate-600 leading-snug text-[10.5px]">
                <strong>8-Bit Closed Loop:</strong> No bit data is ever destroyed! Bits exit one end and <em>wrap around directly</em> to enter the other end, while copying into CF.
              </p>
            </div>

            <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/50 space-y-1">
              <strong className="text-amber-900 font-bold block flex items-center gap-1">
                🔂 3. CARRY ROTATES (RCL / RCR)
              </strong>
              <p className="text-slate-600 leading-snug text-[10.5px]">
                <strong>9-Bit Closed Ring:</strong> The Carry Flag (CF) becomes an actual 9th bit in the loop! Essential for performing multi-byte (16-bit / 32-bit) rotations across multiple instructions.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const filteredInstructions = (() => {
    const raw = mockInstructions
      .map((inst, index) => ({ inst, index }))
      .filter(item => item.inst.category === categoryTab);
    const seenFormats = new Set<string>();
    return raw.filter(({ inst }) => {
      const fmt = getGeneralFormat(inst.opcode);
      if (seenFormats.has(fmt)) return false;
      seenFormats.add(fmt);
      return true;
    });
  })();

  const handleSelectInstruction = (idx: number) => {
    const selectedInst = mockInstructions[idx];
    const op = selectedInst.opcode;
    setSelectedIdx(idx);
    setSelectedAddressingMode('default');
    setRegs(selectedInst.initialRegs);
    setFlags(selectedInst.initialFlags);
    setInteractiveFlags(prev => ({ ...prev, ...selectedInst.initialFlags }));
    setBeforeRegs(selectedInst.initialRegs);
    setBeforeFlags(selectedInst.initialFlags);
    setExecutionState('idle');
    setLastExplanation('');

    if (['DAA', 'DAS', 'AAA', 'AAS', 'AAM', 'AAD'].includes(op)) {
      setBcdOpcode(op as any);
    }
    
    const targetSlide = getSlideIndexForOpcode(op);
    setSlideIndex(targetSlide);
    setLabHelpTab('slide'); // Jump to corresponding presentation slide

    // Synchronize XLAT index if XLAT instruction selected
    if (op === 'XLAT') {
      setXlatAlVal(selectedInst.initialRegs.AX & 0xFF);
    }

    // Synchronize ALU Explorer operands with the selected instruction's AL register & operand
    const initAx = selectedInst.initialRegs.AX ?? 0;
    const initBx = selectedInst.initialRegs.BX ?? 0;
    const alVal = initAx & 0xFF;
    setAluValA(alVal);

    if (op.includes('01H')) setAluValB(0x01);
    else if (op.includes('05H')) setAluValB(0x05);
    else if (op.includes('0FH')) setAluValB(0x0F);
    else if (op.includes('30H')) setAluValB(0x30);
    else if (op.includes('BX')) setAluValB(initBx & 0xFF);
    else setAluValB(initBx & 0xFF);

    if (op.startsWith('ADD') || op.startsWith('ADC')) setAluOp('ADD');
    else if (op.startsWith('SUB') || op.startsWith('SBB') || op.startsWith('DEC')) setAluOp('SUB');
    else if (op.startsWith('AND')) setAluOp('AND');
    else if (op.startsWith('OR')) setAluOp('OR');
    else if (op.startsWith('XOR')) setAluOp('XOR');
    else if (op.startsWith('NOT')) setAluOp('NOT');
    else if (op.startsWith('NEG')) setAluOp('NEG');
    else if (op.startsWith('SHL') || op.startsWith('ROL')) setAluOp('SHL');
    else if (op.startsWith('SHR') || op.startsWith('ROR')) setAluOp('SHR');
  };

  const handleExecute = () => {
    const captureRegs = { ...regs };
    const captureFlags = { ...flags };
    setBeforeRegs(captureRegs);
    setBeforeFlags(captureFlags);

    setExecutionState('executing');

    setTimeout(() => {
      let result;
      if (activeInstruction.opcode === 'XLAT') {
        const alVal = captureRegs.AX & 0xFF;
        const lookupVal = xlatTable[Math.min(15, alVal)] ?? 0;
        const newAX = (captureRegs.AX & 0xFF00) | lookupVal;
        
        const scenarioNames = {
          gray: 'Binary-to-Gray Code Conversion',
          sevensegment: 'Hex-to-Seven-Segment LED Conversion',
          ascii_num: 'Decimal-to-ASCII Character Conversion',
          ascii_case: 'Lowercase ASCII Alphabet Case Mapping',
          custom: 'Custom Table Mapping'
        };
        
        const scenarioMeanings = {
          gray: `the Gray Code pattern binary equivalent ${byteHexFormat(lookupVal)}`,
          sevensegment: `the Seven-Segment LED display control code ${byteHexFormat(lookupVal)} (which physically lights up the corresponding LED segments)`,
          ascii_num: `the ASCII code ${byteHexFormat(lookupVal)} for character '${String.fromCharCode(lookupVal)}'`,
          ascii_case: `the ASCII code ${byteHexFormat(lookupVal)} for lowercase character '${String.fromCharCode(lookupVal)}'`,
          custom: `the mapped lookup byte ${byteHexFormat(lookupVal)}`
        };

        const explanation = `[XLAT EXECUTION SYSTEM]:\n` +
          `1. CPU reads base register BX = ${hexFormat(captureRegs.BX)} as the start offset of the lookup table in the Data Segment.\n` +
          `2. CPU reads AL = ${byteHexFormat(alVal)} (decimal ${alVal}) as the lookup index.\n` +
          `3. Effective Address calculation: DS:[BX + AL] = DS:[${hexFormat(captureRegs.BX + alVal)}].\n` +
          `4. CPU fetches the translated byte ${byteHexFormat(lookupVal)} from that memory location.\n` +
          `5. AL is updated from ${byteHexFormat(alVal)} to ${byteHexFormat(lookupVal)} (representing ${scenarioMeanings[xlatScenario]}).\n\n` +
          `Status flags are unaffected by the XLAT instruction.`;

        result = {
          newRegs: { ...captureRegs, AX: newAX, IP: captureRegs.IP + 1 },
          newFlags: { ...captureFlags },
          mathExplanation: explanation
        };
      } else {
        result = activeInstruction.execute(captureRegs, captureFlags);
        if (activeInstruction.opcode.startsWith('PUSH')) {
          const pushVal = captureRegs.AX;
          const targetAddr = (captureRegs.SP - 2) & 0xFFFF;
          setStackFrames(prev => [
            { addr: targetAddr, value: pushVal, label: `${activeInstruction.opcode.split(' ')[1] || 'AX'} (${hexFormat(pushVal)})` },
            ...prev.filter(f => f.addr !== targetAddr)
          ]);
        } else if (activeInstruction.opcode.startsWith('POP')) {
          const popAddr = captureRegs.SP;
          setStackFrames(prev => prev.filter(f => f.addr !== popAddr));
        }
      }
      setRegs(result.newRegs);
      setFlags(result.newFlags);
      setInteractiveFlags(prev => ({ ...prev, ...result.newFlags }));
      setLastExplanation(result.mathExplanation);
      setExecutionState('done');

      // Synchronize ALU Explorer operands with updated execution results
      if (result.newRegs.AX !== undefined) {
        setAluValA(result.newRegs.AX & 0xFF);
      }
      if (result.newRegs.BX !== undefined) {
        setAluValB(result.newRegs.BX & 0xFF);
      }
    }, 200);
  };

  const handlePushReg = (regName: string, regVal: number) => {
    const currentSp = regs.SP;
    const newSp = (currentSp - 2) & 0xFFFF;
    setRegs(prev => ({ ...prev, SP: newSp }));
    setStackFrames(prev => [
      { addr: newSp, value: regVal, label: `${regName} (${hexFormat(regVal)})` },
      ...prev.filter(f => f.addr !== newSp)
    ]);
    setExecutionState('done');
    setLastExplanation(
      `[STACK PUSH OPERATION]: Executed PUSH ${regName}.\n` +
      `1. Stack Pointer decremented by 2: SP ← ${hexFormat(currentSp)} - 2 = ${hexFormat(newSp)}.\n` +
      `2. 16-bit word ${hexFormat(regVal)} written to Stack Segment memory at SS:${hexFormat(newSp)}.\n` +
      `   - Low Byte (${byteHexFormat(regVal & 0xFF)}) stored at SS:${hexFormat(newSp)}\n` +
      `   - High Byte (${byteHexFormat((regVal >> 8) & 0xFF)}) stored at SS:${hexFormat((newSp + 1) & 0xFFFF)}`
    );
  };

  const handlePopReg = (regName: string) => {
    const currentSp = regs.SP;
    if (currentSp >= 0xFFFE) {
      setExecutionState('done');
      setLastExplanation('[STACK UNDERFLOW WARNING]: Stack Pointer SP is at Base of Stack (FFFEH). Cannot pop from an empty stack!');
      return;
    }
    const topFrame = stackFrames.find(f => f.addr === currentSp);
    const popVal = topFrame ? topFrame.value : 0x5678;
    const newSp = (currentSp + 2) & 0xFFFF;

    setRegs(prev => ({ ...prev, [regName]: popVal, SP: newSp }));
    setStackFrames(prev => prev.filter(f => f.addr !== currentSp));
    setExecutionState('done');
    setLastExplanation(
      `[STACK POP OPERATION]: Executed POP ${regName}.\n` +
      `1. 16-bit word ${hexFormat(popVal)} read from Stack Segment memory at SS:${hexFormat(currentSp)} into ${regName}.\n` +
      `2. Stack Pointer incremented by 2: SP ← ${hexFormat(currentSp)} + 2 = ${hexFormat(newSp)}.`
    );
  };

  const handleResetStack = () => {
    setRegs(prev => ({ ...prev, SP: 0xFFFE }));
    setStackFrames([]);
    setExecutionState('idle');
    setLastExplanation('Stack reset to initial empty state (SP = FFFEH).');
  };

  const handleReset = () => {
    const initAx = activeInstruction.initialRegs.AX ?? 0;
    const initBx = activeInstruction.initialRegs.BX ?? 0;
    const op = activeInstruction.opcode;
    setRegs(activeInstruction.initialRegs);
    setFlags(activeInstruction.initialFlags);
    setInteractiveFlags(prev => ({ ...prev, ...activeInstruction.initialFlags }));
    setBeforeRegs(activeInstruction.initialRegs);
    setBeforeFlags(activeInstruction.initialFlags);
    setExecutionState('idle');
    setLastExplanation('');
    setAluValA(initAx & 0xFF);
    if (op.includes('01H')) setAluValB(0x01);
    else if (op.includes('05H')) setAluValB(0x05);
    else if (op.includes('0FH')) setAluValB(0x0F);
    else if (op.includes('30H')) setAluValB(0x30);
    else setAluValB(initBx & 0xFF);
  };

  const hexFormat = (val: number): string => {
    return val.toString(16).toUpperCase().padStart(4, '0') + 'H';
  };

  const byteHexFormat = (val: number): string => {
    return val.toString(16).toUpperCase().padStart(2, '0') + 'H';
  };

  // Safe manual adjustments for students to experiment
  const adjustRegister = (reg: string, delta: number) => {
    if (executionState !== 'idle' && executionState !== 'done') return;
    setRegs(prev => {
      const newVal = (prev[reg] + delta + 0x10000) & 0xFFFF;
      setBeforeRegs(b => ({ ...b, [reg]: newVal }));
      if (reg === 'AX') {
        if (activeInstruction.opcode === 'XLAT') setXlatAlVal(newVal & 0xFF);
        setAluValA(newVal & 0xFF);
      } else if (reg === 'BX') {
        setAluValB(newVal & 0xFF);
      }
      return { ...prev, [reg]: newVal };
    });
  };

  // Direct manual value setting
  const startEditing = (reg: string) => {
    if (executionState !== 'idle' && executionState !== 'done') return;
    setEditingReg(reg);
    setTempRegVal((regs[reg] ?? 0).toString(16).toUpperCase());
  };

  const saveEditing = (reg: string) => {
    setEditingReg(null);
    let cleanVal = tempRegVal.trim().toUpperCase();
    if (cleanVal.endsWith('H')) {
      cleanVal = cleanVal.slice(0, -1);
    }
    let parsed = parseInt(cleanVal, 16);
    if (isNaN(parsed)) {
      parsed = parseInt(cleanVal, 10);
    }
    if (!isNaN(parsed)) {
      const newVal = parsed & 0xFFFF;
      setRegs(prev => ({ ...prev, [reg]: newVal }));
      setBeforeRegs(prev => ({ ...prev, [reg]: newVal }));
      if (reg === 'AX') {
        if (activeInstruction.opcode === 'XLAT') setXlatAlVal(newVal & 0xFF);
        setAluValA(newVal & 0xFF);
      } else if (reg === 'BX') {
        setAluValB(newVal & 0xFF);
      }
    }
  };

  const toggleFlag = (flag: string) => {
    if (executionState !== 'idle' && executionState !== 'done') return;
    setFlags(prev => {
      const newVal = prev[flag] === 1 ? 0 : 1;
      setBeforeFlags(b => ({ ...b, [flag]: newVal }));
      setInteractiveFlags(iflag => ({ ...iflag, [flag]: newVal }));
      return { ...prev, [flag]: newVal };
    });
  };

  const handleXlatScenarioChange = (scenario: 'gray' | 'sevensegment' | 'ascii_num' | 'ascii_case' | 'custom') => {
    setXlatScenario(scenario);
    if (scenario === 'gray') {
      setXlatTable([0x00, 0x01, 0x03, 0x02, 0x06, 0x07, 0x05, 0x04, 0x0C, 0x0D, 0x0F, 0x0E, 0x0A, 0x0B, 0x09, 0x08]);
    } else if (scenario === 'sevensegment') {
      setXlatTable([0x3F, 0x06, 0x5B, 0x4F, 0x66, 0x6D, 0x7D, 0x07, 0x7F, 0x6F, 0x77, 0x7C, 0x39, 0x5E, 0x79, 0x71]);
    } else if (scenario === 'ascii_num') {
      setXlatTable([0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x41, 0x42, 0x43, 0x44, 0x45, 0x46]);
    } else if (scenario === 'ascii_case') {
      setXlatTable([0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6A, 0x6B, 0x6C, 0x6D, 0x6E, 0x6F, 0x70]);
    } else {
      setXlatTable([0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0x00]);
    }
  };

  const updateXlatAlVal = (val: number) => {
    const cleanVal = Math.min(15, Math.max(0, val));
    setXlatAlVal(cleanVal);
    if (activeInstruction?.opcode === 'XLAT') {
      setRegs(prev => {
        const currentAx = prev.AX ?? 0;
        const newAx = (currentAx & 0xFF00) | cleanVal;
        setBeforeRegs(b => ({ ...b, AX: newAx }));
        return { ...prev, AX: newAx };
      });
    }
  };

  const renderSegmentedBits = (label: string, bits: string) => {
    if (bits.length !== 8) {
      return (
        <div className="flex gap-0.5">
          {bits.split('').map((b, bi) => (
            <span key={bi} className="w-5 h-5 rounded bg-slate-100 text-slate-800 border border-slate-300 flex items-center justify-center font-mono text-[9px] font-bold shadow-xs">
              {b}
            </span>
          ))}
        </div>
      );
    }

    if (label === 'Opcode') {
      const base = bits.substring(0, 6);
      const d = bits.substring(6, 7);
      const w = bits.substring(7, 8);
      return (
        <div className="flex items-center gap-1 font-mono">
          <div className="flex flex-col items-center">
            <div className="flex gap-0.5">
              {base.split('').map((b, bi) => (
                <span key={bi} className="w-4.5 h-4.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center justify-center text-[9px] font-bold shadow-xs" title="Opcode base bits">
                  {b}
                </span>
              ))}
            </div>
            <span className="text-[7.5px] text-indigo-700 font-bold uppercase mt-1 tracking-wider">Opcode</span>
          </div>

          <div className="w-[1px] h-6 bg-slate-300 self-center mx-0.5" />

          <div className="flex flex-col items-center">
            <span className="w-4.5 h-4.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center text-[9px] font-bold shadow-xs" title="D bit: Direction (0 = Source is Reg, 1 = Dest is Reg)">
              {d}
            </span>
            <span className="text-[7.5px] text-emerald-700 font-bold uppercase mt-1 tracking-wider">D</span>
          </div>

          <div className="w-[1px] h-6 bg-slate-300 self-center mx-0.5" />

          <div className="flex flex-col items-center">
            <span className="w-4.5 h-4.5 rounded bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center text-[9px] font-bold shadow-xs" title="W bit: Size (0 = 8-bit, 1 = 16-bit)">
              {w}
            </span>
            <span className="text-[7.5px] text-amber-700 font-bold uppercase mt-1 tracking-wider">W</span>
          </div>
        </div>
      );
    }

    if (label === 'ModR/M') {
      const mod = bits.substring(0, 2);
      const reg = bits.substring(2, 5);
      const rm = bits.substring(5, 8);
      return (
        <div className="flex items-center gap-1 font-mono">
          <div className="flex flex-col items-center">
            <div className="flex gap-0.5">
              {mod.split('').map((b, bi) => (
                <span key={bi} className="w-4.5 h-4.5 rounded bg-sky-100 text-sky-800 border border-sky-200 flex items-center justify-center text-[9px] font-bold shadow-xs" title="MOD: Addressing Mode">
                  {b}
                </span>
              ))}
            </div>
            <span className="text-[7.5px] text-sky-700 font-bold uppercase mt-1 tracking-wider">MOD</span>
          </div>

          <div className="w-[1px] h-6 bg-slate-300 self-center mx-0.5" />

          <div className="flex flex-col items-center">
            <div className="flex gap-0.5">
              {reg.split('').map((b, bi) => (
                <span key={bi} className="w-4.5 h-4.5 rounded bg-pink-100 text-pink-800 border border-pink-200 flex items-center justify-center text-[9px] font-bold shadow-xs" title="REG: Register Index">
                  {b}
                </span>
              ))}
            </div>
            <span className="text-[7.5px] text-pink-700 font-bold uppercase mt-1 tracking-wider">REG</span>
          </div>

          <div className="w-[1px] h-6 bg-slate-300 self-center mx-0.5" />

          <div className="flex flex-col items-center">
            <div className="flex gap-0.5">
              {rm.split('').map((b, bi) => (
                <span key={bi} className="w-4.5 h-4.5 rounded bg-violet-100 text-violet-800 border border-violet-200 flex items-center justify-center text-[9px] font-bold shadow-xs" title="R/M: Register or Memory operand">
                  {b}
                </span>
              ))}
            </div>
            <span className="text-[7.5px] text-violet-700 font-bold uppercase mt-1 tracking-wider">R/M</span>
          </div>
        </div>
      );
    }

    const col = label.includes('LOCK') 
      ? 'bg-rose-100 text-rose-800 border-rose-200' 
      : label.includes('Immediate') || label.includes('Port') 
      ? 'bg-amber-100 text-amber-800 border-amber-200' 
      : 'bg-indigo-100 text-indigo-800 border-indigo-200';

    return (
      <div className="flex flex-col items-center font-mono">
        <div className="flex gap-0.5">
          {bits.split('').map((b, bi) => (
            <span key={bi} className={`w-4.5 h-4.5 rounded ${col} border flex items-center justify-center text-[9px] font-bold shadow-xs`} title={label}>
              {b}
            </span>
          ))}
        </div>
        <span className="text-[7.5px] text-slate-500 font-bold uppercase mt-1 tracking-wider">
          {label.length > 6 ? label.substring(0, 5) + '.' : label}
        </span>
      </div>
    );
  };

  const getActiveStateLabel = () => {
    switch (executionState) {
      case 'executing':
        return { text: 'EU: EXECUTING INSTRUCTION...', color: 'text-amber-800', border: 'border-amber-300 bg-amber-50/80' };
      case 'done':
        return { text: 'EU: EXECUTION COMPLETED & REGISTER WRITEBACK OK', color: 'text-emerald-800 border-emerald-300 bg-emerald-50/80', border: 'border-emerald-300 bg-emerald-50/80' };
      default:
        return { text: 'SYSTEM STANDBY / EMULATION IDLE', color: 'text-indigo-800/90', border: 'border-sky-200/80 bg-sky-100/50' };
    }
  };

  const stateDetails = getActiveStateLabel();
  const rawDisplayOpcode = getDisplayOpcode(activeInstruction.opcode, aluValB);
  const defaultFormatInfo = getInstructionFormat(rawDisplayOpcode);
  const defaultOperandAnalysis = getOperandAnalysis(rawDisplayOpcode);

  const modeAnalysis = getAddressingModeAnalysis(
    activeInstruction.opcode,
    selectedAddressingMode,
    defaultOperandAnalysis
  );

  const displayOpcode = modeAnalysis.displayOpcode;
  const operandAnalysis = modeAnalysis.operandAnalysis;
  const formatInfo = (selectedAddressingMode !== 'default' && modeAnalysis.formatAddressingName)
    ? {
        ...defaultFormatInfo,
        addressing: modeAnalysis.formatAddressingName,
        syntax: modeAnalysis.displayOpcode
      }
    : defaultFormatInfo;

  const instNameInfo = getInstNameInfo(displayOpcode);

  return (
    <div id="instruction-decoder-simulator" className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 text-slate-800 flex flex-col justify-between shadow-xs max-w-7xl mx-auto w-full space-y-6">
      <div className="space-y-6 relative z-10">
        
        {/* Simulator Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-end gap-4 border-b border-slate-150 pb-3">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 self-start md:self-auto overflow-x-auto max-w-full">
            {!hideLabTab && (
              <button
                onClick={() => setActiveMainTab('lab')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeMainTab === 'lab' 
                    ? 'bg-white text-indigo-700 shadow-xs border border-slate-200 font-extrabold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Interactive Laboratory
              </button>
            )}
            {!hideGroupsTab && (
              <button
                onClick={() => setActiveMainTab('groups')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeMainTab === 'groups' 
                    ? 'bg-white text-indigo-700 shadow-xs border border-slate-200 font-extrabold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                Instruction Groups
              </button>
            )}
            {!hideBranchingTab && (
              <button
                onClick={() => setActiveMainTab('branching')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeMainTab === 'branching' 
                    ? 'bg-white text-rose-700 shadow-xs border border-slate-200 font-extrabold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5 text-rose-600" />
                Branching Table
              </button>
            )}
            {!hideComparisonTab && (
              <button
                onClick={() => setActiveMainTab('comparison')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeMainTab === 'comparison' 
                    ? 'bg-white text-indigo-700 shadow-xs border border-slate-200 font-extrabold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                Quick Comparison
              </button>
            )}
            {!hideRememberTab && (
              <button
                onClick={() => setActiveMainTab('remember')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeMainTab === 'remember' 
                    ? 'bg-white text-indigo-700 shadow-xs border border-slate-200 font-extrabold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Remember 🧠
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: INTERACTIVE LABORATORY */}
        {activeMainTab === 'lab' && (
          <div className="space-y-6">
            {/* Global Hardware Status Monitor */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className={`md:col-span-3 px-4 py-3 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                executionState === 'executing' 
                  ? 'bg-amber-50/80 border-amber-200 text-amber-900' 
                  : executionState === 'done' 
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
                  : 'bg-slate-50/80 border-slate-200 text-slate-800'
              }`}>
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    executionState === 'executing' 
                      ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse' 
                      : executionState === 'done' 
                      ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
                      : 'bg-slate-400'
                  }`} />
                  <span className="text-xs font-mono font-bold tracking-wider">
                    {stateDetails.text}
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-white px-2.5 py-1 rounded-md text-slate-600 border border-slate-200 shadow-xs">CS:IP = 1000:0100H</span>
              </div>

              <div className="px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
                <span className="text-xs text-slate-500 font-sans font-bold uppercase tracking-wider">Instruction Format:</span>
                <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60">{formatInfo.machineCode}</span>
              </div>
            </div>

            {/* Quick How-To Guide Banner */}
            {!hideGuideBanner && (
              <div className="bg-gradient-to-r from-indigo-50/80 via-sky-50/50 to-indigo-50/80 border border-indigo-200/80 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-indigo-950 font-sans shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 bg-indigo-600 text-white rounded-lg shrink-0 font-bold text-[10px] uppercase tracking-wider font-mono">
                    Lab Guide
                  </span>
                  <p className="text-[11.5px] leading-relaxed">
                    <strong className="font-extrabold text-indigo-900">3-Step Execution Workflow:</strong> Select an instruction category below, pick an instruction from the library, and click <strong>Step Pipeline</strong> or <strong>Run Full Instruction</strong> to observe machine code decoding and register/flag updates in real time.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-indigo-200/80 shrink-0">
                  <span>Category: <strong className="text-indigo-900 uppercase font-black">{categoryTab}</strong> <span className="text-[9px] text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-150 ml-1">9 Core 8086 Groups (10 Lab Tabs)</span></span>
                </div>
              </div>
            )}

            {/* Categories Tab Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 overflow-x-auto max-w-full scrollbar-thin scrollbar-thumb-slate-300/80">
              {(['Data Copy / Transfer', 'Arithmetic', 'BCD & ASCII', 'Logical', 'Branch', 'Loop', 'Machine Control', 'Flag Manipulation', 'Shift & Rotate', 'String & Port'] as const).map(tab => {
                const isSel = categoryTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => {
                      setCategoryTab(tab);
                      if (tab === 'Arithmetic') setAluOp('ADD');
                      else if (tab === 'Logical') setAluOp('AND');
                      else if (tab === 'Shift & Rotate') setAluOp('SHL');
                      const firstMatch = mockInstructions.findIndex(inst => inst.category === tab);
                      if (firstMatch !== -1) {
                        handleSelectInstruction(firstMatch);
                      }
                    }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
                      isSel
                        ? 'bg-white text-indigo-700 shadow-xs border border-slate-200 font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Responsive Viewport Layout Switcher Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-full scrollbar-none py-0.5">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase px-2 shrink-0 flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3 text-indigo-600" />
                  View Layout:
                </span>
                
                <button
                  onClick={() => setMobileSubTab('instructions')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    mobileSubTab === 'instructions'
                      ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80 font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-indigo-600" />
                  <span>1. Instructions</span>
                </button>

                <button
                  onClick={() => setMobileSubTab('explanation')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    mobileSubTab === 'explanation'
                      ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80 font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  <span>2. Explanation</span>
                </button>

                {isAddressingApplicable(activeInstruction?.opcode) && (
                  <button
                    onClick={() => setMobileSubTab('addressing')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      mobileSubTab === 'addressing'
                        ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80 font-extrabold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                    <span>3. Addressing</span>
                  </button>
                )}

                <button
                  onClick={() => setMobileSubTab('registers')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    mobileSubTab === 'registers'
                      ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80 font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isAddressingApplicable(activeInstruction?.opcode) ? '4. Registers & Flags' : '3. Registers & Flags'}</span>
                </button>

                <button
                  onClick={() => setMobileSubTab('explorers')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    mobileSubTab === 'explorers'
                      ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80 font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5 text-purple-600" />
                  <span>{isAddressingApplicable(activeInstruction?.opcode) ? '5. Format & Execution' : '4. Format & Execution'}</span>
                </button>
              </div>

              <div className="hidden md:flex items-center gap-1.5 text-[10px] font-mono text-slate-500 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200/60">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Responsive View Active</span>
              </div>
            </div>

        {/* 3-Column Bento Laboratory Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* COLUMN 1: Code Selection & Operation Core */}
          {(mobileSubTab === 'instructions' || mobileSubTab === 'explanation' || (mobileSubTab === 'addressing' && isAddressingApplicable(activeInstruction?.opcode))) && (
            <div className={`flex flex-col justify-between bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs order-2 lg:order-2 ${
              mobileSubTab === 'instructions' || mobileSubTab === 'explanation' || (mobileSubTab === 'addressing' && isAddressingApplicable(activeInstruction?.opcode)) ? 'lg:col-span-12 max-w-4xl mx-auto w-full' : 'lg:col-span-4'
            }`}>
              
              {mobileSubTab === 'instructions' && (
                <div className="space-y-3">
                  {/* Responsive Compact Instruction Stream List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1.5 max-h-64 sm:max-h-80 lg:max-h-none overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300">
                    {filteredInstructions.map(({ inst, index }) => {
                      const isSelected = selectedIdx === index;
                      const genFormat = getGeneralFormat(inst.opcode);
                      const nameInfo = getInstNameInfo(inst.opcode);
                      return (
                        <button
                          key={index}
                          onClick={() => handleSelectInstruction(index)}
                          disabled={executionState !== 'idle' && executionState !== 'done'}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs cursor-pointer transition-all flex justify-between items-center ${
                            isSelected
                              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 border-indigo-500 text-white font-extrabold shadow-md relative overflow-hidden'
                              : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-sky-50/50 hover:text-indigo-950 hover:border-sky-200/60'
                          }`}
                        >
                          {isSelected && (
                            <span className="absolute left-0 top-0 bottom-0 w-1 bg-white" />
                          )}
                          <div className="space-y-0.5 min-w-0 pr-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-mono text-xs tracking-wide font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                {genFormat}
                              </span>
                              <span className={`text-[10px] font-sans font-semibold px-1.5 py-0.2 rounded ${
                                isSelected ? 'bg-indigo-500/50 text-indigo-100 border border-indigo-400/30' : 'bg-indigo-50 text-indigo-700 border border-indigo-150'
                              }`}>
                                {nameInfo.full}
                              </span>
                            </div>
                            <p className={`text-[9.5px] font-sans font-medium line-clamp-1 ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                              {inst.desc}
                            </p>
                          </div>
                          {isSelected ? (
                            <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] shrink-0 ml-2" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}



              {/* Instruction Details & Operand Breakdown Content */}
              {mobileSubTab === 'explanation' && (() => {
                const genExp = getGeneralExplanation(activeInstruction.opcode, activeInstruction.desc);
                const aluRes = computeAluRes();
                return (
                  <div className="bg-gradient-to-br from-indigo-50/80 via-white to-sky-50/50 border border-indigo-200 p-4 rounded-xl space-y-3.5 shadow-2xs">
                    <div 
                      onClick={() => setShowInstDetailsMobile(prev => !prev)}
                      className="flex items-center justify-between border-b border-indigo-200/80 pb-2.5 cursor-pointer select-none"
                    >
                      <span className="text-xs sm:text-sm font-bold text-indigo-950 uppercase font-mono tracking-wider flex items-center gap-1.5">
                        <Sliders className="w-4 h-4 text-indigo-600" />
                        Instruction Logic & Explanation:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-extrabold bg-indigo-600 text-white px-2.5 py-1 rounded-full shadow-2xs">
                          {instNameInfo.name}
                        </span>
                        <button className="sm:hidden text-indigo-700 p-0.5">
                          {showInstDetailsMobile ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Instruction Details Body */}
                    {showInstDetailsMobile && (
                      <div className="space-y-3.5">
                        {/* Format & Syntax Overview */}
                        <div className="space-y-2.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-mono font-extrabold text-white bg-indigo-600 border border-indigo-700 px-3 py-1 rounded-lg shadow-2xs">
                              {genExp.generalSyntax}
                            </span>
                            <span className="text-sm font-bold text-indigo-900 font-sans">
                              ({instNameInfo.full})
                            </span>
                          </div>

                          {/* What Instruction Will Do */}
                          <div className="bg-white p-3 rounded-lg border border-indigo-150 shadow-2xs space-y-1.5">
                            <span className="text-xs font-bold text-indigo-900/80 uppercase font-mono block">
                              What {instNameInfo.name} Will Do:
                            </span>
                            <p className="text-sm text-slate-800 font-sans font-normal leading-relaxed">
                              {genExp.whatItDoes}
                            </p>
                          </div>
                        </div>

                        {/* Flags Affected */}
                        <div className="bg-white p-3 rounded-lg border border-indigo-150 shadow-2xs space-y-1.5">
                          <span className="text-xs font-bold text-indigo-900/80 uppercase font-mono block">
                            Flags Affected:
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-mono font-bold px-3 py-1 rounded-md border ${
                              genExp.flagsBadgeColor === 'emerald'
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                : genExp.flagsBadgeColor === 'indigo'
                                ? 'bg-indigo-50 text-indigo-900 border-indigo-300'
                                : 'bg-amber-50 text-amber-950 border-amber-300'
                            }`}>
                              {genExp.flagsAffected}
                            </span>
                          </div>
                        </div>

                        {/* General Instruction Assembly & Architecture Rules */}
                        <div className="bg-white p-3 rounded-lg border border-indigo-200/80 text-slate-700 font-sans space-y-2 shadow-2xs">
                          <span className="font-bold font-mono text-indigo-900 block text-xs sm:text-sm">
                            ⚠️ Key Assembly & Architectural Rules for {instNameInfo.name}:
                          </span>
                          <ul className="list-disc list-inside space-y-1 text-slate-700 text-xs sm:text-sm leading-relaxed">
                            {genExp.rules.map((rule, idx) => (
                              <li key={idx}>{rule}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Interactive Bitwise & Shift Visualizer */}
                        {(activeInstruction.category === 'Logical' || activeInstruction.category === 'Shift & Rotate' || activeInstruction.category === 'Arithmetic') && (() => {
                          const isNotInst = activeInstruction.opcode.startsWith('NOT') || aluOp === 'NOT';
                          const isNegInst = activeInstruction.opcode.startsWith('NEG') || aluOp === 'NEG';
                          const isUnaryInst = isNotInst || isNegInst;
                          if (activeInstruction.category === 'Shift & Rotate') {
                            return renderVisualBitShiftSimulator(false);
                          }
                          return (
                          <div className="bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/70 text-slate-900 p-4 sm:p-5 rounded-xl border border-indigo-200/80 shadow-xs space-y-4 font-mono text-xs w-full">
                            <div className="flex items-center justify-between border-b border-indigo-200/80 pb-2.5">
                              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-indigo-950 flex items-center gap-2">
                                <Binary className="w-4 h-4 text-emerald-600 shrink-0" />
                                Interactive Bitwise Operations Simulator
                              </span>
                              <span className="text-[10px] sm:text-[11px] bg-indigo-100 text-indigo-900 px-2.5 py-0.5 rounded border border-indigo-200 font-extrabold uppercase">
                                {isNotInst ? 'Unary NOT Operation' : isNegInst ? 'Unary NEG Operation' : activeInstruction.category}
                              </span>
                            </div>

                            <p className="text-[11px] sm:text-xs font-sans text-slate-600 leading-snug">
                              {isNotInst 
                                ? 'Adjust the single operand below to see live 1\'s complement (bitwise invert) bit manipulations:'
                                : isNegInst
                                ? 'Adjust the single operand below to see live 2\'s complement negation (0 - operand) bit manipulations:'
                                : 'Adjust operands below to see live bitwise manipulations, bit shifts/rotations, and resulting status flags:'}
                            </p>

                            {/* Sliders for Destination (and Source if binary op) */}
                            <div className={isUnaryInst ? "grid grid-cols-1 gap-3.5 pt-1" : "grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1"}>
                              {/* Destination (AL) */}
                              <div className="bg-white p-3 rounded-xl border border-indigo-200/80 shadow-2xs space-y-1.5">
                                <div className="flex justify-between items-center text-[11px] sm:text-xs font-bold">
                                  <span className="text-indigo-950">{isUnaryInst ? 'Single Operand (AL Destination):' : 'Destination (AL):'}</span>
                                  <span className="text-emerald-700 font-extrabold">{byteHexFormat(aluValA)} ({aluValA & 0xFF})</span>
                                </div>
                                <input
                                  type="range"
                                  min={0}
                                  max={255}
                                  value={aluValA & 0xFF}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setAluValA(val);
                                    setRegs(prev => ({ ...prev, AX: (prev.AX & 0xFF00) | (val & 0xFF) }));
                                    setBeforeRegs(prev => ({ ...prev, AX: (prev.AX & 0xFF00) | (val & 0xFF) }));
                                  }}
                                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-indigo-100 rounded-lg"
                                />
                                <div className="text-[10px] sm:text-[11px] text-indigo-800 flex justify-between font-mono">
                                  <span>Bits: {(aluValA & 0xFF).toString(2).padStart(8, '0')}</span>
                                  {isNotInst && <span className="text-amber-800 font-bold">1's Complement Mode (Unary)</span>}
                                  {isNegInst && <span className="text-purple-800 font-bold">2's Complement Mode (Unary Negate)</span>}
                                </div>
                              </div>

                              {/* Source / Immediate (Hidden for Unary Ops) */}
                              {!isUnaryInst && (
                                <div className="bg-white p-3 rounded-xl border border-indigo-200/80 shadow-2xs space-y-1.5">
                                  <div className="flex justify-between items-center text-[11px] sm:text-xs font-bold">
                                    <span className="text-indigo-950">
                                      Source (BL / Imm):
                                    </span>
                                    <span className="text-sky-700 font-extrabold">
                                      {byteHexFormat(aluValB)} ({aluValB & 0xFF})
                                    </span>
                                  </div>
                                  <input
                                    type="range"
                                    min={0}
                                    max={255}
                                    value={aluValB & 0xFF}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      setAluValB(val);
                                      setRegs(prev => ({ ...prev, BX: (prev.BX & 0xFF00) | (val & 0xFF) }));
                                      setBeforeRegs(prev => ({ ...prev, BX: (prev.BX & 0xFF00) | (val & 0xFF) }));
                                    }}
                                    className="w-full accent-sky-500 cursor-pointer h-1.5 bg-indigo-100 rounded-lg"
                                  />
                                  <div className="text-[10px] sm:text-[11px] text-indigo-800 flex justify-between font-mono">
                                    <span>Bits: {(aluValB & 0xFF).toString(2).padStart(8, '0')}</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Live Bit-by-Bit Operation Breakdown */}
                            <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-indigo-200/80 space-y-2 text-center shadow-2xs w-full overflow-x-auto">
                              <div className="flex justify-between items-center text-[11px] sm:text-xs gap-2 min-w-[300px]">
                                <span className="text-indigo-950 font-bold shrink-0">{isUnaryInst ? 'Input Operand Bits (AL):' : 'Destination Bits (AL):'}</span>
                                <div className="flex gap-1 sm:gap-2 font-mono">
                                  {(aluValA & 0xFF).toString(2).padStart(8, '0').split('').map((bit, idx) => (
                                    <span key={idx} className={`w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center rounded-md sm:rounded-lg text-xs sm:text-sm font-bold ${bit === '1' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                      {bit}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {!isUnaryInst && (
                                <div className="flex justify-between items-center text-[11px] sm:text-xs gap-2 min-w-[300px]">
                                  <span className="text-indigo-950 font-bold shrink-0">Source Bits (BL / Imm):</span>
                                  <div className="flex gap-1 sm:gap-2 font-mono">
                                    {(aluValB & 0xFF).toString(2).padStart(8, '0').split('').map((bit, idx) => (
                                      <span key={idx} className={`w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center rounded-md sm:rounded-lg text-xs sm:text-sm font-bold ${bit === '1' ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                        {bit}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="w-full h-[1px] bg-indigo-200 my-1.5" />

                              <div className="flex justify-between items-center text-[11px] sm:text-xs font-bold gap-2 min-w-[300px]">
                                <span className="text-amber-800 shrink-0">
                                  Bitwise Result ({isNotInst ? 'NOT AL' : isNegInst ? 'NEG AL (2\'s Comp)' : activeInstruction.opcode.split(' ')[0]}):
                                </span>
                                <div className="flex gap-1 sm:gap-2 font-mono">
                                  {aluRes.res.toString(2).padStart(8, '0').split('').map((bit, idx) => (
                                    <span key={idx} className={`w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center rounded-md sm:rounded-lg text-xs sm:text-sm font-extrabold ${bit === '1' ? 'bg-amber-500 text-white shadow-2xs' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                                      {bit}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Live Output Flags */}
                            {isNotInst ? (
                              <div className="bg-amber-50 border border-amber-200/80 p-2.5 rounded-lg text-[11px] text-amber-950 font-sans font-bold flex flex-wrap items-center justify-between gap-2">
                                <span>Status Flags: None (Flags remain unchanged for NOT instruction in 8086)</span>
                                <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-amber-300 text-amber-900 font-extrabold">Flags Unaffected</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-2 pt-1 text-[11px]">
                                <span className="text-indigo-950 font-bold">Computed Status Flags {isNegInst && '(NEG updates flags)'}:</span>
                                <div className="flex gap-1.5 font-mono">
                                  {[
                                    { flag: 'CF', val: aluRes.cf },
                                    { flag: 'ZF', val: aluRes.zf },
                                    { flag: 'SF', val: aluRes.sf },
                                    { flag: 'OF', val: aluRes.of },
                                    { flag: 'PF', val: aluRes.pf }
                                  ].map(f => (
                                    <span key={f.flag} className={`px-2 py-0.5 rounded text-[10px] font-bold ${f.val ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                                      {f.flag}={f.val}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          );
                        })()}

                        {/* BCD & ASCII Instructions Guide */}
                        {(activeInstruction.category === 'BCD & ASCII' || categoryTab === 'BCD & ASCII') && (
                          <div className="bg-gradient-to-br from-purple-50/90 via-slate-50 to-indigo-50/90 text-slate-900 p-4.5 rounded-xl border border-purple-200/80 shadow-xs space-y-4 font-mono">
                            <div className="flex items-center justify-between border-b border-purple-200/80 pb-2.5">
                              <span className="text-sm font-bold uppercase tracking-wider text-purple-950 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-600" />
                                8086 BCD & ASCII Instructions Comprehensive Guide
                              </span>
                              <span className="text-xs bg-purple-100 text-purple-900 px-2.5 py-1 rounded border border-purple-300 font-extrabold uppercase">
                                BCD & ASCII
                              </span>
                            </div>

                            <p className="text-xs sm:text-sm font-sans text-slate-700 leading-relaxed">
                              Since the 8086 ALU operates in binary, BCD adjust instructions automatically correct binary sums, differences, products, and quotients into valid decimal (BCD) digits.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                              {/* Packed BCD Box */}
                              <div className="bg-white p-3.5 rounded-lg border border-purple-200 shadow-2xs space-y-3">
                                <div className="flex justify-between items-center border-b border-purple-100 pb-2">
                                  <span className="text-purple-950 font-bold uppercase text-xs sm:text-sm">Packed BCD Instructions</span>
                                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded border border-purple-200 font-bold">1 Byte / AL</span>
                                </div>
                                
                                <div className="space-y-2.5 font-sans">
                                  <div className="bg-purple-50/70 p-2.5 rounded-lg border border-purple-200 space-y-1">
                                    <div className="flex justify-between font-mono font-bold text-purple-950 text-xs sm:text-sm">
                                      <span>DAA</span>
                                      <span className="text-emerald-700 font-bold text-xs">Decimal Adjust Addition</span>
                                    </div>
                                    <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">Corrects binary sum in AL to valid 2-digit packed BCD. Adds 06H if AL low nibble &gt; 9 or AF=1; adds 60H if high nibble &gt; 9 or CF=1.</p>
                                  </div>

                                  <div className="bg-purple-50/70 p-2.5 rounded-lg border border-purple-200 space-y-1">
                                    <div className="flex justify-between font-mono font-bold text-purple-950 text-xs sm:text-sm">
                                      <span>DAS</span>
                                      <span className="text-amber-800 font-bold text-xs">Decimal Adjust Subtraction</span>
                                    </div>
                                    <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">Corrects binary difference in AL to valid packed BCD. Subtracts 06H if low nibble &gt; 9 or AF=1; subtracts 60H if high nibble &gt; 9 or CF=1.</p>
                                  </div>
                                </div>
                              </div>

                              {/* Unpacked BCD Box */}
                              <div className="bg-white p-3.5 rounded-lg border border-indigo-200 shadow-2xs space-y-3">
                                <div className="flex justify-between items-center border-b border-indigo-100 pb-2">
                                  <span className="text-indigo-950 font-bold uppercase text-xs sm:text-sm">Unpacked BCD Instructions</span>
                                  <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded border border-indigo-200 font-bold">AX / 2 Bytes</span>
                                </div>

                                <div className="space-y-2.5 font-sans">
                                  <div className="bg-indigo-50/70 p-2.5 rounded-lg border border-indigo-200 space-y-1">
                                    <div className="flex justify-between font-mono font-bold text-indigo-950 text-xs sm:text-sm">
                                      <span>AAA</span>
                                      <span className="text-sky-800 font-bold text-xs">ASCII Adjust Addition</span>
                                    </div>
                                    <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">Used after ADD/ADC on unpacked BCD. Adds 6 to AL, increments AH by 1 if AL low nibble &gt; 9 or AF=1, clears high nibble of AL.</p>
                                  </div>

                                  <div className="bg-indigo-50/70 p-2.5 rounded-lg border border-indigo-200 space-y-1">
                                    <div className="flex justify-between font-mono font-bold text-indigo-950 text-xs sm:text-sm">
                                      <span>AAS</span>
                                      <span className="text-indigo-800 font-bold text-xs">ASCII Adjust Subtraction</span>
                                    </div>
                                    <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">Used after SUB/SBB on unpacked BCD. Subtracts 6 from AL, decrements AH by 1 if borrow needed, clears high nibble of AL.</p>
                                  </div>

                                  <div className="bg-indigo-50/70 p-2.5 rounded-lg border border-indigo-200 space-y-1">
                                    <div className="flex justify-between font-mono font-bold text-indigo-950 text-xs sm:text-sm">
                                      <span>AAM</span>
                                      <span className="text-emerald-800 font-bold text-xs">ASCII Adjust Multiplication</span>
                                    </div>
                                    <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">Used AFTER byte MUL. Converts binary product in AL to unpacked BCD in AX (AH = AL ÷ 10, AL = AL mod 10).</p>
                                  </div>

                                  <div className="bg-indigo-50/70 p-2.5 rounded-lg border border-indigo-200 space-y-1">
                                    <div className="flex justify-between font-mono font-bold text-indigo-950 text-xs sm:text-sm">
                                      <span>AAD</span>
                                      <span className="text-amber-800 font-bold text-xs">ASCII Adjust Division</span>
                                    </div>
                                    <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">Used BEFORE byte DIV. Converts 2 unpacked BCD digits in AX to 1 binary byte in AL (AL = (AH × 10) + AL, AH = 00H).</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Machine Control Instructions Guide */}
                        {(activeInstruction.category === 'Machine Control' || categoryTab === 'Machine Control') && (
                          <div className="bg-gradient-to-br from-amber-50/90 via-slate-50 to-orange-50/90 text-slate-900 p-5 rounded-xl border border-amber-200/80 shadow-xs space-y-4.5 font-mono">
                            <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
                              <span className="text-base font-bold uppercase tracking-wider text-amber-950 flex items-center gap-2.5">
                                <Cpu className="w-5 h-5 text-amber-600" />
                                8086 Machine & Processor Control Instructions Guide
                              </span>
                              <span className="text-xs bg-amber-100 text-amber-900 px-3 py-1 rounded border border-amber-300 font-extrabold uppercase tracking-wide">
                                Machine Control
                              </span>
                            </div>

                            <p className="text-sm sm:text-base font-sans text-slate-800 leading-relaxed">
                              Machine Control instructions govern CPU operational states, manage bus line synchronization for multiprocessor environments, and coordinate execution flow with external hardware coprocessors (such as the 8087 Math Coprocessor).
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 font-sans">
                              {/* HLT */}
                              <div className="bg-white p-3.5 rounded-lg border border-amber-200 shadow-2xs space-y-2">
                                <div className="flex justify-between items-center border-b border-amber-100 pb-2 font-mono">
                                  <span className="font-extrabold text-amber-950 text-sm sm:text-base">HLT</span>
                                  <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded border border-amber-200 font-bold uppercase">Halt Processor</span>
                                </div>
                                <p className="text-slate-800 text-xs sm:text-sm leading-relaxed">
                                  Stops instruction fetching and execution. Enters a low-power internal halt state until an enabled hardware interrupt (INTR / NMI) or system RESET occurs.
                                </p>
                              </div>

                              {/* LOCK */}
                              <div className="bg-white p-3.5 rounded-lg border border-amber-200 shadow-2xs space-y-2">
                                <div className="flex justify-between items-center border-b border-amber-100 pb-2 font-mono">
                                  <span className="font-extrabold text-amber-950 text-sm sm:text-base">LOCK 🔒</span>
                                  <span className="text-xs bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded border border-rose-200 font-bold uppercase">Bus Lock Signal</span>
                                </div>
                                <p className="text-slate-800 text-xs sm:text-sm leading-relaxed">
                                  Locks the system bus during the next instruction so another processor cannot use the bus at the same time.
                                </p>
                                <div className="bg-amber-50/80 p-2 rounded border border-amber-200/80 font-mono text-xs sm:text-sm text-amber-950">
                                  <span className="font-bold text-amber-900">Example:</span> <code className="font-bold text-amber-900">LOCK XCHG [SI], AL</code>
                                </div>
                                <p className="text-xs sm:text-sm font-semibold text-rose-900 flex items-center gap-1.5 pt-0.5 font-sans">
                                  <span>👉</span> <strong>LOCK = “Use the bus exclusively for this operation.”</strong>
                                </p>
                              </div>

                              {/* NOP */}
                              <div className="bg-white p-3.5 rounded-lg border border-amber-200 shadow-2xs space-y-2">
                                <div className="flex justify-between items-center border-b border-amber-100 pb-2 font-mono">
                                  <span className="font-extrabold text-amber-950 text-sm sm:text-base">NOP</span>
                                  <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded border border-emerald-200 font-bold uppercase">No Operation</span>
                                </div>
                                <p className="text-slate-800 text-xs sm:text-sm leading-relaxed">
                                  Performs no operation other than advancing the Instruction Pointer (<code className="font-mono text-xs sm:text-sm font-semibold">IP</code>) by 1 byte and consuming 3 CPU clock cycles (<code className="font-mono text-xs sm:text-sm font-semibold">90H</code> opcode). Used for timing delay padding or code patching.
                                </p>
                              </div>

                              {/* ESC */}
                              <div className="bg-white p-3.5 rounded-lg border border-amber-200 shadow-2xs space-y-2">
                                <div className="flex justify-between items-center border-b border-amber-100 pb-2 font-mono">
                                  <span className="font-extrabold text-amber-950 text-sm sm:text-base">ESC</span>
                                  <span className="text-xs bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded border border-sky-200 font-bold uppercase">Coprocessor Escape</span>
                                </div>
                                <p className="text-slate-800 text-xs sm:text-sm leading-relaxed">
                                  ESC is not usually written as ESC in the source program. It is the 8086 instruction encoding used to communicate with the 8087.
                                </p>
                                <p className="text-xs sm:text-sm font-semibold text-sky-900 flex items-center gap-1.5 pt-0.5 font-sans">
                                  <span>👉</span> <strong>8086 + 8087 → ESC is used internally to pass coprocessor operations.</strong>
                                </p>
                              </div>

                              {/* WAIT */}
                              <div className="bg-white p-3.5 rounded-lg border border-amber-200 shadow-2xs space-y-2 md:col-span-2">
                                <div className="flex justify-between items-center border-b border-amber-100 pb-2 font-mono">
                                  <span className="font-extrabold text-amber-950 text-sm sm:text-base">WAIT / FWAIT</span>
                                  <span className="text-xs bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded border border-indigo-200 font-bold uppercase">Hardware Pin Sync</span>
                                </div>
                                <p className="text-slate-800 text-xs sm:text-sm leading-relaxed">
                                  Causes the 8086 CPU to enter an idle wait loop checking the hardware <code className="font-mono text-xs sm:text-sm font-bold text-indigo-700">TEST#</code> input pin. Once the external coprocessor finishes its floating-point calculation and drives <code className="font-mono text-xs sm:text-sm font-bold text-indigo-700">TEST#</code> LOW, the CPU resumes normal code execution.
                                </p>
                              </div>
                            </div>

                            {/* Hardware & Signal Interaction Banner */}
                            <div className="bg-amber-100/70 p-3.5 rounded-lg border border-amber-300 text-amber-950 text-xs sm:text-sm font-sans space-y-1.5">
                              <span className="font-mono font-bold uppercase text-xs sm:text-sm block text-amber-900">
                                💡 Multiprocessor & Hardware Signal Integration:
                              </span>
                              <p className="leading-relaxed">
                                Unlike standard data manipulation instructions, Machine Control instructions interact directly with 8086 hardware pins (such as <strong className="font-mono">LOCK#</strong>, <strong className="font-mono">TEST#</strong>, and interrupt control flags). They are critical for building reliable multi-master bus systems and floating-point numeric pipelines.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* String & Port Instructions Guide */}
                        {(activeInstruction.category === 'String & Port' || categoryTab === 'String & Port') && (
                          <div className="bg-gradient-to-br from-teal-50/90 via-slate-50 to-cyan-50/90 text-slate-900 p-5 rounded-xl border border-teal-200/80 shadow-xs space-y-4.5 font-mono">
                            <div className="flex items-center justify-between border-b border-teal-200/80 pb-3">
                              <span className="text-base font-bold uppercase tracking-wider text-teal-950 flex items-center gap-2.5">
                                <Binary className="w-5 h-5 text-teal-600" />
                                8086 String Manipulation & Port I/O Instructions Guide
                              </span>
                              <span className="text-xs bg-teal-100 text-teal-900 px-3 py-1 rounded border border-teal-300 font-extrabold uppercase tracking-wide">
                                String & Port
                              </span>
                            </div>

                            <p className="text-sm sm:text-base font-sans text-slate-800 leading-relaxed">
                              String instructions process contiguous memory blocks using index pointers (<code className="font-mono text-xs sm:text-sm font-bold text-teal-900">DS:SI</code> source, <code className="font-mono text-xs sm:text-sm font-bold text-teal-900">ES:DI</code> destination) with automatic index updating. Port instructions perform hardware I/O communication between external peripheral chips and the <code className="font-mono text-xs sm:text-sm font-bold text-teal-900">AL/AX</code> accumulator.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 font-sans">
                              {/* String Operations Box */}
                              <div className="bg-white p-3.5 rounded-lg border border-teal-200 shadow-2xs space-y-2.5 md:col-span-2">
                                <div className="flex justify-between items-center border-b border-teal-100 pb-2 font-mono">
                                  <span className="font-extrabold text-teal-950 text-sm sm:text-base">String Manipulation Instructions</span>
                                  <span className="text-xs bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded border border-teal-200 font-bold uppercase">DS:SI → ES:DI Pointer Pairs</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs sm:text-sm">
                                  <div className="bg-teal-50/60 p-3 rounded-lg border border-teal-150 space-y-1">
                                    <div className="flex justify-between font-mono font-bold text-teal-950 text-xs sm:text-sm">
                                      <span>MOVSB / MOVSW</span>
                                      <span className="text-teal-700 text-xs">Move String</span>
                                    </div>
                                    <p className="text-slate-800 leading-relaxed text-xs sm:text-sm">
                                      Copies byte/word from <code className="font-mono font-bold">DS:SI</code> to <code className="font-mono font-bold">ES:DI</code>. Auto-adjusts <code className="font-mono">SI</code> and <code className="font-mono">DI</code> by 1 (byte) or 2 (word) based on Direction Flag (<code className="font-mono">DF</code>).
                                    </p>
                                  </div>

                                  <div className="bg-teal-50/60 p-3 rounded-lg border border-teal-150 space-y-1">
                                    <div className="flex justify-between font-mono font-bold text-teal-950 text-xs sm:text-sm">
                                      <span>CMPSB / CMPSW</span>
                                      <span className="text-amber-800 text-xs">Compare String</span>
                                    </div>
                                    <p className="text-slate-800 leading-relaxed text-xs sm:text-sm">
                                      Subtracts destination byte/word at <code className="font-mono font-bold">ES:DI</code> from source at <code className="font-mono font-bold">DS:SI</code> without altering memory, updating <code className="font-mono">ZF</code>, <code className="font-mono">CF</code>, and <code className="font-mono">SF</code> flags.
                                    </p>
                                  </div>

                                  <div className="bg-teal-50/60 p-3 rounded-lg border border-teal-150 space-y-1">
                                    <div className="flex justify-between font-mono font-bold text-teal-950 text-xs sm:text-sm">
                                      <span>SCASB / SCASW</span>
                                      <span className="text-indigo-800 text-xs">Scan String</span>
                                    </div>
                                    <p className="text-slate-800 leading-relaxed text-xs sm:text-sm">
                                      Compares <code className="font-mono font-bold">AL/AX</code> with memory byte/word at <code className="font-mono font-bold">ES:DI</code> to search for matching target characters/values, updating status flags.
                                    </p>
                                  </div>

                                  <div className="bg-teal-50/60 p-3 rounded-lg border border-teal-150 space-y-1">
                                    <div className="flex justify-between font-mono font-bold text-teal-950 text-xs sm:text-sm">
                                      <span>LODSB / STOSB</span>
                                      <span className="text-emerald-800 text-xs">Load / Store String</span>
                                    </div>
                                    <p className="text-slate-800 leading-relaxed text-xs sm:text-sm">
                                      <code className="font-mono font-bold">LODSB</code> loads byte from <code className="font-mono font-bold">DS:SI</code> into <code className="font-mono font-bold">AL</code>. <code className="font-mono font-bold">STOSB</code> stores byte from <code className="font-mono font-bold">AL</code> into <code className="font-mono font-bold">ES:DI</code> memory.
                                    </p>
                                  </div>

                                  <div className="bg-teal-50/60 p-3 rounded-lg border border-teal-150 space-y-1 md:col-span-2">
                                    <div className="flex justify-between font-mono font-bold text-teal-950 text-xs sm:text-sm">
                                      <span>REP / REPE / REPNE Prefixes</span>
                                      <span className="text-rose-800 text-xs">Repeat Loop Prefix</span>
                                    </div>
                                    <p className="text-slate-800 leading-relaxed text-xs sm:text-sm">
                                      Repeats string execution hardware loop <code className="font-mono font-bold">CX</code> times (e.g. <code className="font-mono font-bold">REP MOVSB</code>). <code className="font-mono font-bold">REPE</code> repeats while <code className="font-mono">ZF=1</code>; <code className="font-mono font-bold">REPNE</code> repeats while <code className="font-mono">ZF=0</code>.
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Port I/O Operations Box */}
                              <div className="bg-white p-3.5 rounded-lg border border-cyan-200 shadow-2xs space-y-2.5 md:col-span-2">
                                <div className="flex justify-between items-center border-b border-cyan-100 pb-2 font-mono">
                                  <span className="font-extrabold text-cyan-950 text-sm sm:text-base">Port Input / Output (I/O) Instructions</span>
                                  <span className="text-xs bg-cyan-100 text-cyan-800 px-2.5 py-0.5 rounded border border-cyan-200 font-bold uppercase">AL/AX Accumulator Hardware Ports</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs sm:text-sm">
                                  <div className="bg-cyan-50/60 p-3 rounded-lg border border-cyan-150 space-y-1">
                                    <div className="flex justify-between font-mono font-bold text-cyan-950 text-xs sm:text-sm">
                                      <span>IN AL, Port8 / IN AX, DX</span>
                                      <span className="text-cyan-800 text-xs">Input From Hardware Port</span>
                                    </div>
                                    <p className="text-slate-800 leading-relaxed text-xs sm:text-sm">
                                      Transfers data from physical peripheral I/O port into <code className="font-mono font-bold">AL</code> (8-bit) or <code className="font-mono font-bold">AX</code> (16-bit). Uses direct 8-bit port address (<code className="font-mono">00H-FFH</code>) or 16-bit indirect address in <code className="font-mono font-bold">DX</code> (<code className="font-mono">0000H-FFFFH</code>).
                                    </p>
                                  </div>

                                  <div className="bg-cyan-50/60 p-3 rounded-lg border border-cyan-150 space-y-1">
                                    <div className="flex justify-between font-mono font-bold text-cyan-950 text-xs sm:text-sm">
                                      <span>OUT Port8, AL / OUT DX, AX</span>
                                      <span className="text-indigo-800 text-xs">Output To Hardware Port</span>
                                    </div>
                                    <p className="text-slate-800 leading-relaxed text-xs sm:text-sm">
                                      Outputs data byte from <code className="font-mono font-bold">AL</code> or word from <code className="font-mono font-bold">AX</code> to physical hardware port address.
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Comparative Matrix: Key Differences Between String & Port Instructions */}
                              <div className="bg-white p-3.5 rounded-lg border border-teal-200 shadow-2xs space-y-3 md:col-span-2">
                                <div className="flex justify-between items-center border-b border-teal-100 pb-2 font-mono">
                                  <span className="font-extrabold text-teal-950 text-sm sm:text-base flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-teal-600" />
                                    Comparative Breakdown: Differences Between String & Port Instructions
                                  </span>
                                  <span className="text-xs bg-teal-100 text-teal-900 px-2.5 py-0.5 rounded border border-teal-200 font-bold uppercase">
                                    Comparison Matrix
                                  </span>
                                </div>

                                {/* Table 1: String Instructions Comparison */}
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left border-collapse font-mono text-xs">
                                    <thead>
                                      <tr className="bg-teal-50/80 text-teal-950 border-b border-teal-200">
                                        <th className="p-2 font-bold">Instruction</th>
                                        <th className="p-2 font-bold">Source</th>
                                        <th className="p-2 font-bold">Destination</th>
                                        <th className="p-2 font-bold">Updates Flags?</th>
                                        <th className="p-2 font-bold">Primary Function & Memory Effect</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 text-slate-800 font-sans">
                                      <tr className="hover:bg-slate-50/80">
                                        <td className="p-2 font-mono font-bold text-teal-900">MOVSB / MOVSW</td>
                                        <td className="p-2 font-mono text-xs">DS:SI</td>
                                        <td className="p-2 font-mono text-xs">ES:DI</td>
                                        <td className="p-2 text-rose-700 font-bold font-mono">No</td>
                                        <td className="p-2">Copies block from source RAM to destination RAM without modifying registers or flags.</td>
                                      </tr>
                                      <tr className="hover:bg-slate-50/80">
                                        <td className="p-2 font-mono font-bold text-teal-900">LODSB / LODSW</td>
                                        <td className="p-2 font-mono text-xs">DS:SI</td>
                                        <td className="p-2 font-mono text-xs">AL / AX</td>
                                        <td className="p-2 text-rose-700 font-bold font-mono">No</td>
                                        <td className="p-2">Loads element from memory into Accumulator <code className="font-mono">AL/AX</code> for CPU processing.</td>
                                      </tr>
                                      <tr className="hover:bg-slate-50/80">
                                        <td className="p-2 font-mono font-bold text-teal-900">STOSB / STOSW</td>
                                        <td className="p-2 font-mono text-xs">AL / AX</td>
                                        <td className="p-2 font-mono text-xs">ES:DI</td>
                                        <td className="p-2 text-rose-700 font-bold font-mono">No</td>
                                        <td className="p-2">Stores byte/word from <code className="font-mono">AL/AX</code> into RAM. Used to initialize/fill memory arrays.</td>
                                      </tr>
                                      <tr className="hover:bg-slate-50/80">
                                        <td className="p-2 font-mono font-bold text-teal-900">CMPSB / CMPSW</td>
                                        <td className="p-2 font-mono text-xs">DS:SI</td>
                                        <td className="p-2 font-mono text-xs">ES:DI</td>
                                        <td className="p-2 text-emerald-700 font-bold font-mono">Yes (ZF, CF, SF)</td>
                                        <td className="p-2">Compares 2 string buffers (<code className="font-mono">DS:SI - ES:DI</code>). Memory is <strong>unmodified</strong>; updates flags.</td>
                                      </tr>
                                      <tr className="hover:bg-slate-50/80">
                                        <td className="p-2 font-mono font-bold text-teal-900">SCASB / SCASW</td>
                                        <td className="p-2 font-mono text-xs">AL / AX</td>
                                        <td className="p-2 font-mono text-xs">ES:DI</td>
                                        <td className="p-2 text-emerald-700 font-bold font-mono">Yes (ZF, CF, SF)</td>
                                        <td className="p-2">Scans string buffer for matching char in <code className="font-mono">AL/AX</code>. Memory is <strong>unmodified</strong>; updates flags.</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>

                                {/* Table 2: String vs Port I/O Differences */}
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 text-xs font-sans">
                                  <span className="font-mono font-bold uppercase text-slate-900 text-xs block border-b border-slate-200 pb-1">
                                    ⚔️ String Operations vs Port I/O Instructions Key Differences:
                                  </span>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <div className="bg-white p-2.5 rounded border border-slate-200 space-y-1">
                                      <span className="font-mono font-bold text-teal-900 block">1. Target Address Space</span>
                                      <p className="text-slate-700 leading-relaxed">
                                        <strong>String Ops:</strong> Operate on 1 MB Memory Address Space using segment:offset pairs (<code className="font-mono">DS:SI</code>, <code className="font-mono">ES:DI</code>).<br />
                                        <strong>Port I/O:</strong> Operate on separate 64 KB Peripheral I/O Address Space (<code className="font-mono">0000H - FFFFH</code>).
                                      </p>
                                    </div>
                                    <div className="bg-white p-2.5 rounded border border-slate-200 space-y-1">
                                      <span className="font-mono font-bold text-teal-900 block">2. Hardware Bus Signals</span>
                                      <p className="text-slate-700 leading-relaxed">
                                        <strong>String Ops:</strong> Drive <code className="font-mono text-teal-800">M/IO# = 1</code> (Memory Cycle) with <code className="font-mono">MEMR# / MEMW#</code>.<br />
                                        <strong>Port I/O:</strong> Drive <code className="font-mono text-rose-800">M/IO# = 0</code> (I/O Cycle) with <code className="font-mono">IOR# / IOW#</code> strobes.
                                      </p>
                                    </div>
                                    <div className="bg-white p-2.5 rounded border border-slate-200 space-y-1">
                                      <span className="font-mono font-bold text-teal-900 block">3. Pointer & Index Behavior</span>
                                      <p className="text-slate-700 leading-relaxed">
                                        <strong>String Ops:</strong> Automatically increment or decrement <code className="font-mono">SI</code> & <code className="font-mono">DI</code> registers based on Direction Flag (<code className="font-mono">DF</code>).<br />
                                        <strong>Port I/O:</strong> Port address in <code className="font-mono">DX</code> or immediate byte does <strong>NOT</strong> auto-increment.
                                      </p>
                                    </div>
                                    <div className="bg-white p-2.5 rounded border border-slate-200 space-y-1">
                                      <span className="font-mono font-bold text-teal-900 block">4. Repeat Prefixes (`REP`)</span>
                                      <p className="text-slate-700 leading-relaxed">
                                        <strong>String Ops:</strong> Native hardware loop repeat prefixes (<code className="font-mono">REP, REPE, REPNE</code>) using <code className="font-mono">CX</code>.<br />
                                        <strong>Port I/O:</strong> 8086 basic <code className="font-mono">IN / OUT</code> instructions do not support hardware repeat prefixes.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* String & Port Rules Banner */}
                            <div className="bg-teal-100/70 p-3.5 rounded-lg border border-teal-300 text-teal-950 text-xs sm:text-sm font-sans space-y-1.5">
                              <span className="font-mono font-bold uppercase text-xs sm:text-sm block text-teal-900">
                                💡 Key String & Port Hardware Constraints:
                              </span>
                              <p className="leading-relaxed text-xs sm:text-sm">
                                1. Source strings must use <strong className="font-mono">DS:SI</strong> (segment override allowed); Destination strings <strong>MUST ALWAYS</strong> use <strong className="font-mono">ES:DI</strong> (no segment override permitted).<br />
                                2. <strong className="font-mono">DF = 0</strong> auto-increments pointers (<code className="font-mono">+1/+2</code>); <strong className="font-mono">DF = 1</strong> auto-decrements pointers (<code className="font-mono">-1/-2</code>).<br />
                                3. All 8086 port I/O transactions must pass strictly through accumulator registers (<strong className="font-mono">AL</strong> or <strong className="font-mono">AX</strong>).
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Dynamic Branch Instruction Explanation & Interactive Evaluator */}
                        {(activeInstruction.category === 'Branch' || categoryTab === 'Branch') && (() => {
                          const cleanOp = activeInstruction.opcode.replace(/^LOCK\s+/, '').replace(/^REP\s+/, '');
                          const branchMnemonic = cleanOp.split(' ')[0].toUpperCase();

                          const curCF = interactiveFlags.CF ?? flags.CF ?? 0;
                          const curZF = interactiveFlags.ZF ?? flags.ZF ?? 1;
                          const curSF = interactiveFlags.SF ?? flags.SF ?? 0;
                          const curOF = interactiveFlags.OF ?? flags.OF ?? 0;
                          const curPF = interactiveFlags.PF ?? flags.PF ?? 1;

                          type BranchMeta = {
                            mnemonic: string;
                            fullName: string;
                            categoryType: string;
                            categoryBadgeColor: string;
                            conditionFormula: string;
                            testedFlags: Array<'CF' | 'ZF' | 'SF' | 'OF' | 'PF'>;
                            isConditionMet: boolean;
                            trueExplanation: string;
                            falseExplanation: string;
                            targetAddr: string;
                            targetOffset: string;
                            typicalPredecessor: string;
                            assemblySnippet: string;
                            keyRule: string;
                          };

                          const branchDataMap: Record<string, Omit<BranchMeta, 'mnemonic' | 'isConditionMet'>> = {
                            JA: {
                              fullName: 'Jump if Above (CF = 0 AND ZF = 0)',
                              categoryType: 'Unsigned Comparison Branch (Destination > Source)',
                              categoryBadgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
                              conditionFormula: 'CF = 0 ∧ ZF = 0',
                              testedFlags: ['CF', 'ZF'],
                              trueExplanation: 'Both CF = 0 (no borrow generated) and ZF = 0 (operands not equal). The unsigned destination operand is strictly greater than the source.',
                              falseExplanation: 'Condition failed: either a borrow was generated (CF = 1) or the operands were identical (ZF = 1). Unsigned destination is not strictly greater than source.',
                              targetAddr: '0150H',
                              targetOffset: '+004EH',
                              typicalPredecessor: 'CMP AX, BX  ; Compare unsigned AX with BX',
                              assemblySnippet: 'CMP AX, BX      ; Compare unsigned operands\nJA  0150H        ; Jump to 0150H if AX > BX\nMOV CX, 0000H    ; Fall-through execution (AX <= BX)',
                              keyRule: 'Used exclusively for unsigned arithmetic comparisons (0 to 255 for 8-bit, 0 to 65535 for 16-bit). Never use JA for signed integers.'
                            },
                            JAE: {
                              fullName: 'Jump if Above or Equal (CF = 0)',
                              categoryType: 'Unsigned Comparison Branch (Destination ≥ Source)',
                              categoryBadgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
                              conditionFormula: 'CF = 0',
                              testedFlags: ['CF'],
                              trueExplanation: 'Carry flag is clear (CF = 0). No borrow was generated during subtraction/comparison, so unsigned destination ≥ source.',
                              falseExplanation: 'Carry flag is set (CF = 1). A borrow was generated, so unsigned destination < source.',
                              targetAddr: '0150H',
                              targetOffset: '+004EH',
                              typicalPredecessor: 'CMP AX, BX  ; Compare unsigned AX with BX',
                              assemblySnippet: 'CMP AX, BX      ; Compare unsigned operands\nJAE 0150H        ; Jump to 0150H if AX >= BX\nMOV CX, 0000H    ; Fall-through execution (AX < BX)',
                              keyRule: 'Equivalent to JNB (Jump if Not Below) and JNC (Jump if No Carry). Operates on unsigned operands.'
                            },
                            JB: {
                              fullName: 'Jump if Below (CF = 1)',
                              categoryType: 'Unsigned Comparison Branch (Destination < Source)',
                              categoryBadgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
                              conditionFormula: 'CF = 1',
                              testedFlags: ['CF'],
                              trueExplanation: 'Carry flag is set (CF = 1). A borrow was required, meaning unsigned destination is strictly less than the source operand.',
                              falseExplanation: 'Carry flag is clear (CF = 0). No borrow occurred, so unsigned destination ≥ source.',
                              targetAddr: '0150H',
                              targetOffset: '+004EH',
                              typicalPredecessor: 'CMP AX, BX  ; Compare unsigned AX with BX',
                              assemblySnippet: 'CMP AX, BX      ; Compare unsigned operands\nJB  0150H        ; Jump to 0150H if AX < BX\nMOV CX, 0000H    ; Fall-through execution (AX >= BX)',
                              keyRule: 'Equivalent to JNAE (Jump if Not Above or Equal) and JC (Jump if Carry). Detects unsigned underflow.'
                            },
                            JBE: {
                              fullName: 'Jump if Below or Equal (CF = 1 OR ZF = 1)',
                              categoryType: 'Unsigned Comparison Branch (Destination ≤ Source)',
                              categoryBadgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
                              conditionFormula: 'CF = 1 ∨ ZF = 1',
                              testedFlags: ['CF', 'ZF'],
                              trueExplanation: 'Either CF = 1 (borrow generated) or ZF = 1 (operands equal). Unsigned destination is less than or equal to source.',
                              falseExplanation: 'Both CF = 0 and ZF = 0. Unsigned destination is strictly greater than source.',
                              targetAddr: '0150H',
                              targetOffset: '+004EH',
                              typicalPredecessor: 'CMP AX, BX  ; Compare unsigned AX with BX',
                              assemblySnippet: 'CMP AX, BX      ; Compare unsigned operands\nJBE 0150H        ; Jump to 0150H if AX <= BX\nMOV CX, 0000H    ; Fall-through execution (AX > BX)',
                              keyRule: 'Equivalent to JNA (Jump if Not Above). Relative displacement range is -128 to +127 bytes.'
                            },
                            JE: {
                              fullName: 'Jump if Equal / Jump if Zero (ZF = 1)',
                              categoryType: 'Equality / Zero Flag Test (Destination == Source)',
                              categoryBadgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                              conditionFormula: 'ZF = 1',
                              testedFlags: ['ZF'],
                              trueExplanation: 'Zero Flag is set (ZF = 1). The previous CMP result was 0 (operands are equal) or previous ALU operation produced zero.',
                              falseExplanation: 'Zero Flag is clear (ZF = 0). Operands differ or previous ALU operation produced a non-zero result.',
                              targetAddr: '0150H',
                              targetOffset: '+004EH',
                              typicalPredecessor: 'CMP AX, BX  ; Compare operands (AX - BX)',
                              assemblySnippet: 'CMP AX, BX      ; Compare AX and BX\nJE  0150H        ; Jump to 0150H if AX == BX\nMOV CX, 0000H    ; Fall-through execution (AX != BX)',
                              keyRule: 'Works identically for both signed and unsigned comparisons. JZ and JE share the identical opcode (74H).'
                            },
                            JNE: {
                              fullName: 'Jump if Not Equal / Jump if Not Zero (ZF = 0)',
                              categoryType: 'Equality / Zero Flag Test (Destination ≠ Source)',
                              categoryBadgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                              conditionFormula: 'ZF = 0',
                              testedFlags: ['ZF'],
                              trueExplanation: 'Zero Flag is clear (ZF = 0). The operands are not equal (CMP difference non-zero) or ALU result was non-zero.',
                              falseExplanation: 'Zero Flag is set (ZF = 1). Operands are identical (difference is zero).',
                              targetAddr: '0150H',
                              targetOffset: '+004EH',
                              typicalPredecessor: 'CMP AX, BX  ; Compare operands (AX - BX)',
                              assemblySnippet: 'CMP AX, BX      ; Compare AX and BX\nJNE 0150H        ; Jump to 0150H if AX != BX\nMOV CX, 0000H    ; Fall-through execution (AX == BX)',
                              keyRule: 'Standard decision jump in 8086 loops and conditionals. JNZ and JNE share opcode 75H.'
                            },
                            JG: {
                              fullName: 'Jump if Greater (ZF = 0 AND SF = OF)',
                              categoryType: 'Signed 2’s Complement Branch (Destination > Source)',
                              categoryBadgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
                              conditionFormula: 'ZF = 0 ∧ (SF = OF)',
                              testedFlags: ['ZF', 'SF', 'OF'],
                              trueExplanation: 'Result is non-zero (ZF = 0) and Sign Flag matches Overflow Flag (SF = OF). In signed 2’s complement arithmetic, destination > source.',
                              falseExplanation: 'Condition failed: either operands are equal (ZF = 1) or sign flag disagrees with overflow flag (SF ≠ OF, meaning destination < source).',
                              targetAddr: '0150H',
                              targetOffset: '+004EH',
                              typicalPredecessor: 'CMP AX, BX  ; Signed 2\'s complement comparison',
                              assemblySnippet: 'CMP AX, BX      ; Compare signed numbers\nJG  0150H        ; Jump to 0150H if signed AX > BX\nMOV CX, 0000H    ; Fall-through execution (signed AX <= BX)',
                              keyRule: 'Used exclusively for signed integers (-128..+127 for byte, -32768..+32767 for word). Equivalent to JNLE.'
                            },
                            JGE: {
                              fullName: 'Jump if Greater or Equal (SF = OF)',
                              categoryType: 'Signed 2’s Complement Branch (Destination ≥ Source)',
                              categoryBadgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
                              conditionFormula: 'SF = OF',
                              testedFlags: ['SF', 'OF'],
                              trueExplanation: 'Sign Flag equals Overflow Flag (SF = OF). Signed destination is greater than or equal to source.',
                              falseExplanation: 'Sign Flag differs from Overflow Flag (SF ≠ OF). Signed destination is strictly less than source.',
                              targetAddr: '0150H',
                              targetOffset: '+004EH',
                              typicalPredecessor: 'CMP AX, BX  ; Signed 2\'s complement comparison',
                              assemblySnippet: 'CMP AX, BX      ; Compare signed numbers\nJGE 0150H        ; Jump to 0150H if signed AX >= BX\nMOV CX, 0000H    ; Fall-through execution (signed AX < BX)',
                              keyRule: 'Equivalent to JNL (Jump if Not Less). Accurately accounts for 2’s complement arithmetic overflow.'
                            },
                            JL: {
                              fullName: 'Jump if Less (SF ≠ OF)',
                              categoryType: 'Signed 2’s Complement Branch (Destination < Source)',
                              categoryBadgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
                              conditionFormula: 'SF ≠ OF',
                              testedFlags: ['SF', 'OF'],
                              trueExplanation: 'Sign Flag differs from Overflow Flag (SF ≠ OF). In signed 2’s complement representation, destination is strictly less than source.',
                              falseExplanation: 'Sign Flag equals Overflow Flag (SF = OF). Signed destination is greater than or equal to source.',
                              targetAddr: '0150H',
                              targetOffset: '+004EH',
                              typicalPredecessor: 'CMP AX, BX  ; Signed 2\'s complement comparison',
                              assemblySnippet: 'CMP AX, BX      ; Compare signed numbers\nJL  0150H        ; Jump to 0150H if signed AX < BX\nMOV CX, 0000H    ; Fall-through execution (signed AX >= BX)',
                              keyRule: 'Equivalent to JNGE (Jump if Not Greater or Equal). Evaluates signed magnitude.'
                            },
                            JLE: {
                              fullName: 'Jump if Less or Equal (ZF = 1 OR SF ≠ OF)',
                              categoryType: 'Signed 2’s Complement Branch (Destination ≤ Source)',
                              categoryBadgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
                              conditionFormula: 'ZF = 1 ∨ (SF ≠ OF)',
                              testedFlags: ['ZF', 'SF', 'OF'],
                              trueExplanation: 'Either operands are equal (ZF = 1) or sign differs from overflow (SF ≠ OF). Signed destination ≤ source.',
                              falseExplanation: 'Operands are unequal (ZF = 0) and SF = OF. Signed destination is strictly greater than source.',
                              targetAddr: '0150H',
                              targetOffset: '+004EH',
                              typicalPredecessor: 'CMP AX, BX  ; Signed 2\'s complement comparison',
                              assemblySnippet: 'CMP AX, BX      ; Compare signed numbers\nJLE 0150H        ; Jump to 0150H if signed AX <= BX\nMOV CX, 0000H    ; Fall-through execution (signed AX > BX)',
                              keyRule: 'Equivalent to JNG (Jump if Not Greater). Short jump range is -128 to +127 bytes.'
                            },
                            JC: {
                              fullName: 'Jump if Carry (CF = 1)',
                              categoryType: 'Status Flag Test Branch (Carry Bit)',
                              categoryBadgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
                              conditionFormula: 'CF = 1',
                              testedFlags: ['CF'],
                              trueExplanation: 'Carry Flag is set (CF = 1). Indicates an arithmetic carry/borrow or an error returned by BIOS/DOS interrupts.',
                              falseExplanation: 'Carry Flag is clear (CF = 0). No carry or borrow occurred.',
                              targetAddr: '0150H',
                              targetOffset: '+004EH',
                              typicalPredecessor: 'ADD AX, BX  ; Multi-precision arithmetic or INT 21H',
                              assemblySnippet: 'ADD AX, BX      ; Add with potential carry\nJC  0150H        ; Branch if carry generated (CF = 1)\nNOP              ; Normal sequential path',
                              keyRule: 'Frequently used in multi-byte addition/subtraction loops and OS system call status checks.'
                            },
                            JO: {
                              fullName: 'Jump if Overflow (OF = 1)',
                              categoryType: 'Status Flag Test Branch (Signed Overflow)',
                              categoryBadgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
                              conditionFormula: 'OF = 1',
                              testedFlags: ['OF'],
                              trueExplanation: 'Overflow Flag is set (OF = 1). A signed arithmetic operation produced a result exceeding the capacity of the destination register.',
                              falseExplanation: 'Overflow Flag is clear (OF = 0). The signed arithmetic operation did not overflow.',
                              targetAddr: '0150H',
                              targetOffset: '+004EH',
                              typicalPredecessor: 'ADD AX, BX  ; Signed addition',
                              assemblySnippet: 'ADD AX, BX      ; Signed arithmetic operation\nJO  0150H        ; Jump to error handler on overflow\nNOP              ; Continue if valid range',
                              keyRule: 'Crucial for numerical error detection and preventing signed truncation defects.'
                            },
                            JS: {
                              fullName: 'Jump if Sign / Negative (SF = 1)',
                              categoryType: 'Status Flag Test Branch (Sign Bit)',
                              categoryBadgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
                              conditionFormula: 'SF = 1',
                              testedFlags: ['SF'],
                              trueExplanation: 'Sign Flag is set (SF = 1). The most significant bit (MSB) of the result is 1, indicating a negative value.',
                              falseExplanation: 'Sign Flag is clear (SF = 0). The result MSB is 0 (positive or zero).',
                              targetAddr: '0150H',
                              targetOffset: '+004EH',
                              typicalPredecessor: 'SUB AL, BL  ; Or TEST AL, 80H',
                              assemblySnippet: 'SUB AL, BL      ; Subtraction\nJS  0150H        ; Jump to 0150H if result is negative\nNOP              ; Fall-through if positive or zero',
                              keyRule: 'Opposite is JNS (Jump if Not Sign / Positive, SF = 0).'
                            },
                            JP: {
                              fullName: 'Jump if Parity Even (PF = 1)',
                              categoryType: 'Status Flag Test Branch (Parity Bit)',
                              categoryBadgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
                              conditionFormula: 'PF = 1',
                              testedFlags: ['PF'],
                              trueExplanation: 'Parity Flag is set (PF = 1). The lowest 8 bits of the result contain an even count of 1-bits.',
                              falseExplanation: 'Parity Flag is clear (PF = 0). The result has an odd count of 1-bits.',
                              targetAddr: '0150H',
                              targetOffset: '+004EH',
                              typicalPredecessor: 'IN AL, DX   ; Or AND AL, 0FFH',
                              assemblySnippet: 'IN  AL, DX      ; Read serial byte\nJP  0150H        ; Jump to 0150H if parity is even\nNOP              ; Fall-through if parity is odd',
                              keyRule: 'Also known as JPE (Jump if Parity Even). Common in communications and data validation.'
                            },
                            JNP: {
                              fullName: 'Jump if No Parity / Parity Odd (PF = 0)',
                              categoryType: 'Status Flag Test Branch (Parity Bit)',
                              categoryBadgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
                              conditionFormula: 'PF = 0',
                              testedFlags: ['PF'],
                              trueExplanation: 'Parity Flag is clear (PF = 0). The lowest 8 bits of the result contain an odd count of 1-bits.',
                              falseExplanation: 'Parity Flag is set (PF = 1). The result has an even count of 1-bits.',
                              targetAddr: '0150H',
                              targetOffset: '+004EH',
                              typicalPredecessor: 'IN AL, DX   ; Read communication port',
                              assemblySnippet: 'IN  AL, DX      ; Read input port\nJNP 0150H        ; Jump to error routine if parity odd\nNOP              ; Continue if parity even',
                              keyRule: 'Also known as JPO (Jump if Parity Odd). Opposite of JP / JPE.'
                            },
                            JMP: {
                              fullName: 'Unconditional Jump (Direct IP Update)',
                              categoryType: 'Unconditional Control Transfer',
                              categoryBadgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
                              conditionFormula: 'Unconditional (No flags inspected)',
                              testedFlags: [],
                              trueExplanation: 'Unconditionally transfers execution control to the target address on every execution cycle without inspecting any status flags.',
                              falseExplanation: '',
                              targetAddr: '0150H',
                              targetOffset: '+004EH',
                              typicalPredecessor: 'Any instruction sequence',
                              assemblySnippet: 'MOV AX, 1234H   ; Execute preparatory logic\nJMP 0150H        ; Jump directly to 0150H\nMOV BX, 5678H    ; (Skipped by unconditional jump)',
                              keyRule: 'Supports Short (-128..+127), Near (±32KB in current segment), and Far (inter-segment CS:IP) address modes.'
                            },
                            CALL: {
                              fullName: 'Call Subroutine / Procedure',
                              categoryType: 'Subroutine Linkage & Stack Operation',
                              categoryBadgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
                              conditionFormula: 'SP ← SP - 2, [SS:SP] ← Return IP, IP ← Subroutine',
                              testedFlags: [],
                              trueExplanation: 'Pushes the return address (0103H) onto the stack (at SS:SP) and transfers execution control to the subroutine entry point at 0200H.',
                              falseExplanation: '',
                              targetAddr: '0200H',
                              targetOffset: 'Target Procedure',
                              typicalPredecessor: 'Parameter setup in registers or stack frame',
                              assemblySnippet: 'MOV AX, 0005H   ; Pass input parameter\nCALL 0200H       ; Push return address (0103H) and jump to 0200H\nMOV DX, AX       ; Execution resumes here when procedure executes RET',
                              keyRule: 'Every CALL instruction must be paired with a RET instruction inside the procedure to pop the return address.'
                            },
                            RET: {
                              fullName: 'Return from Subroutine / Procedure',
                              categoryType: 'Subroutine Linkage & Stack Operation',
                              categoryBadgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
                              conditionFormula: 'IP ← [SS:SP], SP ← SP + 2',
                              testedFlags: [],
                              trueExplanation: 'Pops the 16-bit saved return address from the top of the stack ([SS:SP]) into the Instruction Pointer (IP), resuming caller execution.',
                              falseExplanation: '',
                              targetAddr: 'Caller IP (0103H)',
                              targetOffset: 'Stack Top [SS:SP]',
                              typicalPredecessor: 'End of subroutine after computing return value',
                              assemblySnippet: 'MY_PROC PROC\n  ADD AX, BX     ; Compute result\n  RET            ; Pop saved return address from stack into IP\nMY_PROC ENDP',
                              keyRule: 'RET n optionally adds immediate n bytes to SP after popping IP to cleanly discard passed function parameters.'
                            }
                          };

                          const rawMeta = branchDataMap[branchMnemonic] || {
                            fullName: `${branchMnemonic} Branch Instruction`,
                            categoryType: 'Control Flow Transfer',
                            categoryBadgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
                            conditionFormula: 'Condition evaluation based on 8086 flags',
                            testedFlags: ['ZF'],
                            trueExplanation: 'Condition evaluated to true based on processor status flags.',
                            falseExplanation: 'Condition evaluated to false based on processor status flags.',
                            targetAddr: '0150H',
                            targetOffset: '+004EH',
                            typicalPredecessor: 'CMP AX, BX',
                            assemblySnippet: `${branchMnemonic} 0150H\nNOP`,
                            keyRule: 'Short jumps use an 8-bit signed relative displacement (-128 to +127 bytes).'
                          };

                          // Evaluate dynamic condition satisfaction
                          let isConditionMet = false;
                          if (branchMnemonic === 'JMP' || branchMnemonic === 'CALL' || branchMnemonic === 'RET') {
                            isConditionMet = true;
                          } else if (branchMnemonic === 'JA') {
                            isConditionMet = curCF === 0 && curZF === 0;
                          } else if (branchMnemonic === 'JAE') {
                            isConditionMet = curCF === 0;
                          } else if (branchMnemonic === 'JB') {
                            isConditionMet = curCF === 1;
                          } else if (branchMnemonic === 'JBE') {
                            isConditionMet = curCF === 1 || curZF === 1;
                          } else if (branchMnemonic === 'JE' || branchMnemonic === 'JZ') {
                            isConditionMet = curZF === 1;
                          } else if (branchMnemonic === 'JNE' || branchMnemonic === 'JNZ') {
                            isConditionMet = curZF === 0;
                          } else if (branchMnemonic === 'JG') {
                            isConditionMet = curZF === 0 && curSF === curOF;
                          } else if (branchMnemonic === 'JGE') {
                            isConditionMet = curSF === curOF;
                          } else if (branchMnemonic === 'JL') {
                            isConditionMet = curSF !== curOF;
                          } else if (branchMnemonic === 'JLE') {
                            isConditionMet = curZF === 1 || curSF !== curOF;
                          } else if (branchMnemonic === 'JC') {
                            isConditionMet = curCF === 1;
                          } else if (branchMnemonic === 'JO') {
                            isConditionMet = curOF === 1;
                          } else if (branchMnemonic === 'JS') {
                            isConditionMet = curSF === 1;
                          } else if (branchMnemonic === 'JP') {
                            isConditionMet = curPF === 1;
                          } else if (branchMnemonic === 'JNP') {
                            isConditionMet = curPF === 0;
                          }

                          const meta: BranchMeta = {
                            ...rawMeta,
                            mnemonic: branchMnemonic,
                            isConditionMet
                          };

                          const isStackOp = branchMnemonic === 'CALL' || branchMnemonic === 'RET';
                          const isUnconditional = branchMnemonic === 'JMP';

                          return (
                            <div className="bg-gradient-to-br from-indigo-50/90 via-slate-50 to-blue-50/90 text-slate-900 p-4 sm:p-5 rounded-xl border border-indigo-200/80 shadow-xs space-y-4 font-mono">
                              {/* Header with Dynamic Instruction Badge & Classification */}
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-200/80 pb-3">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                                  <span className="text-sm sm:text-base font-bold text-indigo-950">
                                    {meta.fullName}
                                  </span>
                                </div>
                                <span className={`text-xs px-2.5 py-1 rounded-full border font-extrabold uppercase ${meta.categoryBadgeColor}`}>
                                  {meta.categoryType}
                                </span>
                              </div>

                              {/* Interactive Live Condition Evaluator Card */}
                              <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-indigo-200 shadow-2xs space-y-3.5">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                      Silicon Branch Evaluation:
                                    </span>
                                    <code className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                      {cleanOp}
                                    </code>
                                  </div>
                                  <span className="text-xs font-mono text-slate-500">
                                    Formula: <strong className="text-slate-800">{meta.conditionFormula}</strong>
                                  </span>
                                </div>

                                {/* Interactive Flag Toggles (for conditional jumps) */}
                                {meta.testedFlags.length > 0 && (
                                  <div className="space-y-2 bg-indigo-50/50 p-3 rounded-lg border border-indigo-150">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                                        <span>🎛️</span> Click Flag Pills to Test Dynamic Branch Outcomes:
                                      </span>
                                      <span className="text-[11px] text-indigo-600 font-medium">
                                        (Live Flag Simulator)
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-0.5">
                                      {(['CF', 'ZF', 'SF', 'OF', 'PF'] as const).map(flagKey => {
                                        const isTested = meta.testedFlags.includes(flagKey);
                                        const val = flagKey === 'CF' ? curCF : flagKey === 'ZF' ? curZF : flagKey === 'SF' ? curSF : flagKey === 'OF' ? curOF : curPF;
                                        return (
                                          <button
                                            key={flagKey}
                                            onClick={() => {
                                              const newVal = val === 1 ? 0 : 1;
                                              setInteractiveFlags(prev => ({ ...prev, [flagKey]: newVal }));
                                              setFlags(prev => ({ ...prev, [flagKey]: newVal }));
                                            }}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                                              isTested
                                                ? val === 1
                                                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                                                  : 'bg-slate-200 text-slate-800 border-slate-300 hover:bg-slate-300'
                                                : val === 1
                                                  ? 'bg-indigo-100 text-indigo-900 border-indigo-200 opacity-70'
                                                  : 'bg-slate-100 text-slate-500 border-slate-200 opacity-70'
                                            }`}
                                          >
                                            <span className="font-extrabold">{flagKey}:</span>
                                            <span className={`px-1.5 py-0.2 rounded font-mono ${val === 1 ? 'bg-white/20 text-white' : 'bg-slate-300 text-slate-900'}`}>
                                              {val}
                                            </span>
                                            {isTested && <span className="text-[10px] bg-white/30 px-1 rounded uppercase">Tested</span>}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Dynamic Outcome Banner */}
                                <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                                  isStackOp
                                    ? 'bg-blue-50/90 border-blue-200 text-blue-950'
                                    : isUnconditional
                                    ? 'bg-indigo-50/90 border-indigo-200 text-indigo-950'
                                    : meta.isConditionMet
                                    ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-2xs'
                                    : 'bg-rose-50/90 border-rose-300 text-rose-950 shadow-2xs'
                                }`}>
                                  <div className="space-y-1 font-sans">
                                    <div className="flex items-center gap-2">
                                      <span className="text-base sm:text-lg">
                                        {isStackOp ? '🔄' : isUnconditional ? '🚀' : meta.isConditionMet ? '✅' : '❌'}
                                      </span>
                                      <span className="font-extrabold text-sm sm:text-base font-mono">
                                        {isStackOp
                                          ? branchMnemonic === 'CALL' ? 'SUBROUTINE CALL INVOCATION' : 'SUBROUTINE RETURN EXECUTION'
                                          : isUnconditional
                                          ? 'UNCONDITIONAL BRANCH TAKEN'
                                          : meta.isConditionMet
                                          ? 'CONDITION SATISFIED → BRANCH TAKEN!'
                                          : 'CONDITION NOT MET → FALL-THROUGH!'}
                                      </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                                      {meta.isConditionMet ? meta.trueExplanation : meta.falseExplanation}
                                    </p>
                                  </div>

                                  <div className="shrink-0 bg-white p-2.5 rounded-lg border border-slate-200/80 space-y-1 text-center font-mono min-w-[140px]">
                                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Next Target IP</span>
                                    <span className={`text-sm font-extrabold ${meta.isConditionMet ? 'text-emerald-700' : 'text-slate-700'}`}>
                                      {meta.isConditionMet ? meta.targetAddr : '0102H (IP + 2)'}
                                    </span>
                                    <span className="text-[9px] text-slate-500 block">
                                      {meta.isConditionMet ? 'Jumps to Target' : 'Sequential Next'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Two Column Grid: Assembly Context & Displacement Calculation */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 font-sans">
                                {/* Assembly Usage Snippet */}
                                <div className="bg-white p-3.5 rounded-xl border border-indigo-200 shadow-2xs space-y-2">
                                  <div className="flex justify-between items-center border-b border-indigo-100 pb-2 font-mono">
                                    <span className="font-bold text-xs sm:text-sm text-indigo-950">
                                      Typical Assembly Pattern:
                                    </span>
                                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-bold">
                                      8086 MASM / TASM
                                    </span>
                                  </div>
                                  <pre className="bg-slate-50 text-indigo-950 p-3 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed border border-slate-200">
                                    {meta.assemblySnippet}
                                  </pre>
                                  <p className="text-xs text-slate-600 font-sans leading-relaxed">
                                    <strong className="text-indigo-900">Preceding Context:</strong> {meta.typicalPredecessor} sets flags, and <strong className="text-indigo-900">{branchMnemonic}</strong> evaluates them.
                                  </p>
                                </div>

                                {/* Target Offset & Displacement Math */}
                                <div className="bg-white p-3.5 rounded-xl border border-indigo-200 shadow-2xs space-y-2">
                                  <div className="flex justify-between items-center border-b border-indigo-100 pb-2 font-mono">
                                    <span className="font-bold text-xs sm:text-sm text-indigo-950">
                                      Target & Hardware Mechanics:
                                    </span>
                                    <span className="text-[10px] bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded border border-indigo-200 font-bold">
                                      Displacement Math
                                    </span>
                                  </div>
                                  <div className="space-y-1.5 text-xs text-slate-700 font-sans">
                                    <div className="bg-indigo-50/70 p-2.5 rounded border border-indigo-150 font-mono text-[11px] space-y-1 text-indigo-950">
                                      <div className="flex justify-between">
                                        <span>Current IP (Base):</span>
                                        <span className="font-bold">0100H</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Instruction Length:</span>
                                        <span className="font-bold">2 Bytes</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Sequential Next IP:</span>
                                        <span className="font-bold text-slate-600">0102H</span>
                                      </div>
                                      <div className="flex justify-between border-t border-indigo-200/80 pt-1 text-emerald-800 font-bold">
                                        <span>Branch Target IP:</span>
                                        <span>{meta.targetAddr} ({meta.targetOffset})</span>
                                      </div>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                                      💡 <strong className="text-indigo-950">Architecture Note:</strong> {meta.keyRule}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Branch Family Quick Reference Bar */}
                              <div className="bg-indigo-100/70 p-3.5 rounded-xl border border-indigo-300 text-indigo-950 text-xs font-sans space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-mono font-bold uppercase text-xs text-indigo-900 flex items-center gap-1.5">
                                    <span>📚</span> 8086 Branch Instruction Reference Groups:
                                  </span>
                                  <span className="text-[11px] font-mono text-indigo-700">
                                    Selected: <strong className="underline">{branchMnemonic}</strong>
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 font-mono text-[11px]">
                                  <div className={`p-2 rounded border bg-white ${['JA', 'JAE', 'JB', 'JBE'].includes(branchMnemonic) ? 'border-amber-400 ring-2 ring-amber-300' : 'border-slate-200'}`}>
                                    <span className="font-bold text-amber-900 block border-b border-slate-100 pb-0.5">Unsigned Magnitudes:</span>
                                    <span className="text-slate-600">JA, JAE, JB, JBE (CF, ZF)</span>
                                  </div>
                                  <div className={`p-2 rounded border bg-white ${['JG', 'JGE', 'JL', 'JLE'].includes(branchMnemonic) ? 'border-purple-400 ring-2 ring-purple-300' : 'border-slate-200'}`}>
                                    <span className="font-bold text-purple-900 block border-b border-slate-100 pb-0.5">Signed 2's Complement:</span>
                                    <span className="text-slate-600">JG, JGE, JL, JLE (SF, OF, ZF)</span>
                                  </div>
                                  <div className={`p-2 rounded border bg-white ${['JE', 'JNE', 'JC', 'JO', 'JS', 'JP', 'JNP'].includes(branchMnemonic) ? 'border-emerald-400 ring-2 ring-emerald-300' : 'border-slate-200'}`}>
                                    <span className="font-bold text-emerald-900 block border-b border-slate-100 pb-0.5">Flag Tests:</span>
                                    <span className="text-slate-600">JE/JZ, JNE/JNZ, JC, JO, JS, JP</span>
                                  </div>
                                  <div className={`p-2 rounded border bg-white ${['JMP', 'CALL', 'RET'].includes(branchMnemonic) ? 'border-blue-400 ring-2 ring-blue-300' : 'border-slate-200'}`}>
                                    <span className="font-bold text-blue-900 block border-b border-slate-100 pb-0.5">Unconditional & Stack:</span>
                                    <span className="text-slate-600">JMP, CALL, RET</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Addressing Breakdown Content */}
              {mobileSubTab === 'addressing' && isAddressingApplicable(activeInstruction?.opcode) && (
                <div className="bg-gradient-to-br from-indigo-50/90 via-white to-sky-50/70 border border-indigo-150 p-4 rounded-xl space-y-3.5 shadow-xs">
                  <div 
                    onClick={() => setShowOperandDetailsMobile(prev => !prev)}
                    className="flex items-center justify-between border-b border-indigo-100/80 pb-2.5 cursor-pointer select-none"
                  >
                    <span className="text-xs sm:text-sm font-bold text-indigo-950 uppercase font-mono tracking-wider flex items-center gap-1.5">
                      <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                      Addressing Mode & Operand Breakdown:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold bg-indigo-100 text-indigo-900 px-2.5 py-0.5 rounded-full border border-indigo-200/80">
                        {operandAnalysis.transferType}
                      </span>
                      <button className="sm:hidden text-indigo-700 p-0.5">
                        {showOperandDetailsMobile ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {showOperandDetailsMobile && (
                    <div className="space-y-3.5">
                      {/* Addressing Mode Selector Options */}
                      <div className="bg-white p-3 rounded-lg border border-indigo-200/80 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <label htmlFor="addressing-mode-select" className="text-xs font-bold text-indigo-950 uppercase font-mono flex items-center gap-1">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                            Select Addressing Mode:
                          </label>
                          {selectedAddressingMode !== 'default' && (
                            <button
                              onClick={() => setSelectedAddressingMode('default')}
                              className="text-xs font-mono text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
                            >
                              Reset Native
                            </button>
                          )}
                        </div>

                        {/* Quick Selector Pills */}
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {applicableAddressingModes.map(mode => {
                            const isSelected = selectedAddressingMode === mode.key;
                            return (
                              <button
                                key={mode.key}
                                onClick={() => setSelectedAddressingMode(mode.key)}
                                className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-all cursor-pointer border ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-indigo-50 hover:text-indigo-700'
                                }`}
                              >
                                {mode.shortName}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Assembly Syntax Format Guide Card */}
                      <div className="bg-gradient-to-r from-indigo-50/90 via-sky-50 to-indigo-50/90 text-slate-800 p-3.5 rounded-xl shadow-2xs space-y-2.5 border border-indigo-200">
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                            <Code2 className="w-4 h-4 text-indigo-600" />
                            Instruction Assembly Syntax
                          </span>
                          <span className="text-xs font-mono font-extrabold bg-indigo-600 text-white px-2.5 py-0.5 rounded-md shadow-2xs">
                            Format: {getGeneralFormat(activeInstruction.opcode)}
                          </span>
                        </div>

                        <div className="bg-white p-3 rounded-lg border border-indigo-200 font-mono text-xs sm:text-sm space-y-2.5 shadow-2xs">
                          <div className="flex items-center gap-2 flex-wrap text-slate-800 bg-indigo-50/80 px-3 py-1.5 rounded-md border border-indigo-200/80">
                            <span className="text-emerald-700 font-extrabold text-sm sm:text-base">{displayOpcode.split(' ')[0]}</span>
                            <span className="text-amber-700 font-extrabold text-sm sm:text-base">{operandAnalysis.dstOperand}</span>
                            {operandAnalysis.srcOperand && <span className="text-slate-400 font-extrabold text-sm sm:text-base">,</span>}
                            {operandAnalysis.srcOperand && <span className="text-sky-700 font-extrabold text-sm sm:text-base">{operandAnalysis.srcOperand}</span>}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1 border-t border-slate-200 text-slate-700">
                            <div className="bg-slate-50 p-2 rounded border border-slate-200/80">
                              <span className="text-emerald-700 font-bold block">1. Mnemonic (Opcode):</span>
                              <span className="text-slate-900 font-bold">{displayOpcode.split(' ')[0]}</span>
                              <span className="text-slate-600 block text-xs font-sans">Operation to perform</span>
                            </div>
                            <div className="bg-slate-50 p-2 rounded border border-slate-200/80">
                              <span className="text-amber-700 font-bold block">
                                {['JMP', 'CALL', 'JA', 'JAE', 'JB', 'JBE', 'JE', 'JNE', 'JG', 'JGE', 'JL', 'JLE', 'JC', 'JO', 'JS', 'JNP', 'JP', 'LOOP', 'LOOPE', 'LOOPNE', 'JCXZ'].includes(displayOpcode.split(' ')[0]) ? '2. Target Operand:' : '2. Destination (1st):'}
                              </span>
                              <span className="text-slate-900 font-bold">{operandAnalysis.dstOperand}</span>
                              <span className="text-slate-600 block text-xs font-sans">
                                {['JMP', 'CALL', 'JA', 'JAE', 'JB', 'JBE', 'JE', 'JNE', 'JG', 'JGE', 'JL', 'JLE', 'JC', 'JO', 'JS', 'JNP', 'JP', 'LOOP', 'LOOPE', 'LOOPNE', 'JCXZ'].includes(displayOpcode.split(' ')[0]) ? 'Branch target offset/address' : 'Receives result / target'}
                              </span>
                            </div>
                            <div className="bg-slate-50 p-2 rounded border border-slate-200/80">
                              <span className="text-sky-700 font-bold block">
                                {['JMP', 'CALL', 'JA', 'JAE', 'JB', 'JBE', 'JE', 'JNE', 'JG', 'JGE', 'JL', 'JLE', 'JC', 'JO', 'JS', 'JNP', 'JP', 'LOOP', 'LOOPE', 'LOOPNE', 'JCXZ'].includes(displayOpcode.split(' ')[0]) ? '3. Implicit Flags:' : '3. Source (2nd):'}
                              </span>
                              <span className="text-slate-900 font-bold">{operandAnalysis.srcOperand || 'Implicit / None'}</span>
                              <span className="text-slate-600 block text-xs font-sans">
                                {['JMP', 'CALL', 'JA', 'JAE', 'JB', 'JBE', 'JE', 'JNE', 'JG', 'JGE', 'JL', 'JLE', 'JC', 'JO', 'JS', 'JNP', 'JP', 'LOOP', 'LOOPE', 'LOOPNE', 'JCXZ'].includes(displayOpcode.split(' ')[0]) ? 'Processor status evaluation' : 'Read-only input operand'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 font-mono">
                        {/* Destination / Target Operand Box */}
                        <div className="bg-white p-3 rounded-lg border border-indigo-100 shadow-2xs space-y-1">
                          <span className="text-xs font-extrabold text-indigo-700 uppercase tracking-wider block">
                            {['JMP', 'CALL', 'JA', 'JAE', 'JB', 'JBE', 'JE', 'JNE', 'JG', 'JGE', 'JL', 'JLE', 'JC', 'JO', 'JS', 'JNP', 'JP', 'LOOP', 'LOOPE', 'LOOPNE', 'JCXZ'].includes(displayOpcode.split(' ')[0]) ? '🎯 Target Operand' : '🎯 Destination (1st Operand)'}
                          </span>
                          <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">{operandAnalysis.dstOperand}</p>
                          <p className="text-xs text-slate-600 font-sans font-medium leading-snug">{operandAnalysis.dstType}</p>
                        </div>

                        {/* Source / Implicit Context Box */}
                        <div className="bg-white p-3 rounded-lg border border-sky-100 shadow-2xs space-y-1">
                          <span className="text-xs font-extrabold text-sky-700 uppercase tracking-wider block">
                            {['JMP', 'CALL', 'JA', 'JAE', 'JB', 'JBE', 'JE', 'JNE', 'JG', 'JGE', 'JL', 'JLE', 'JC', 'JO', 'JS', 'JNP', 'JP', 'LOOP', 'LOOPE', 'LOOPNE', 'JCXZ'].includes(displayOpcode.split(' ')[0]) ? '📥 Implicit / Flags' : '📥 Source (2nd Operand)'}
                          </span>
                          <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">{operandAnalysis.srcOperand || 'Implicit / CS:IP'}</p>
                          <p className="text-xs text-slate-600 font-sans font-medium leading-snug">{operandAnalysis.srcType}</p>
                        </div>
                      </div>

                      <div className="text-xs sm:text-sm text-slate-700 bg-white/90 p-3 rounded-lg border border-indigo-100 font-sans leading-relaxed whitespace-pre-line">
                        <strong className="font-mono text-indigo-900 font-bold block mb-1">Architecture & Operand Rules: </strong>
                        {operandAnalysis.description}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Hardware Console Buttons - Hidden under tabs 1 (instructions) and 2 (explanation) */}
              {mobileSubTab !== 'instructions' && mobileSubTab !== 'explanation' && (
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <button
                    onClick={handleExecute}
                    disabled={executionState !== 'idle' && executionState !== 'done'}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-45 disabled:cursor-not-allowed text-white text-xs font-bold font-sans rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer border border-indigo-500/30"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Run Instruction
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-full py-3 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold font-sans rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer border border-slate-200 shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    Reset CPU
                  </button>
                </div>
              )}

            </div>
          )}

          {/* COLUMN 2 & 3: Visual CPU Registers Grid & Interactive Classroom Tabs */}
          {(mobileSubTab === 'registers' || mobileSubTab === 'explorers') && (
            <div className="flex flex-col gap-6 justify-between order-1 lg:order-1 lg:col-span-12 w-full">
              
              {/* GROUP A: The Silicon Register File & Flags */}
              {mobileSubTab === 'registers' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
                  
                  {/* Register File Title Banner */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Database className="w-4.5 h-4.5 text-emerald-600 animate-pulse" />
                      <span className="text-xs font-extrabold uppercase text-slate-800 tracking-wider font-mono">
                        8086 CPU Execution Unit (EU) Registers
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Standby Read-Write State</span>
                  </div>

              {/* Glowing Register Matrices - Twin Cell Split Register Files */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {['AX', 'BX', 'CX', 'DX', 'SP', 'BP', 'SI', 'DI'].map(reg => {
                  const val = regs[reg] ?? 0;
                  const prevVal = beforeRegs[reg] ?? 0;
                  const isModified = val !== prevVal && executionState === 'done';
                  const isCurrentEditing = editingReg === reg;

                  // High and Low sub-register calculations (only applicable to AX, BX, CX, DX)
                  const hasSubRegs = ['AX', 'BX', 'CX', 'DX'].includes(reg);
                  const highByteVal = (val >> 8) & 0xFF;
                  const lowByteVal = val & 0xFF;

                  return (
                    <div 
                      key={reg} 
                      className={`relative group bg-slate-50 border rounded-2xl p-3.5 transition-all duration-300 ${
                        isModified 
                          ? 'border-emerald-300 shadow-sm bg-emerald-50/40' 
                          : 'border-slate-150 hover:border-indigo-200/60'
                      }`}
                    >
                      {/* Register Name */}
                      <span className="text-xs font-mono text-indigo-700 font-extrabold block">{reg}</span>

                      {/* OLED Display Area */}
                      <div className="mt-2 flex items-center justify-between">
                        {isCurrentEditing ? (
                          <input
                            type="text"
                            value={tempRegVal}
                            autoFocus
                            onChange={(e) => setTempRegVal(e.target.value)}
                            onBlur={() => saveEditing(reg)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEditing(reg);
                              if (e.key === 'Escape') setEditingReg(null);
                            }}
                            className="w-full bg-white text-emerald-800 font-mono text-sm px-2 py-1 rounded-lg border border-indigo-500 focus:outline-none"
                          />
                        ) : (
                          <div 
                            onClick={() => startEditing(reg)}
                            className="font-mono text-base font-bold text-emerald-700 tracking-wider cursor-pointer hover:bg-slate-200/50 px-1.5 py-0.5 rounded-lg transition-all flex items-baseline gap-1.5"
                            title="Click to edit raw Hex value"
                          >
                            <span>{hexFormat(val)}</span>
                            {isModified && (
                              <span className="text-[10px] text-slate-400 line-through font-normal">{hexFormat(prevVal)}</span>
                            )}
                          </div>
                        )}

                        {/* Adjust Buttons */}
                        <div className="flex flex-col gap-0.5 opacity-40 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => adjustRegister(reg, 1)}
                            disabled={executionState !== 'idle' && executionState !== 'done'}
                            className="text-[10px] text-slate-500 hover:text-indigo-600 disabled:opacity-20 cursor-pointer font-bold leading-none p-0.5 hover:bg-slate-200 rounded"
                          >
                            ▲
                          </button>
                          <button 
                            onClick={() => adjustRegister(reg, -1)}
                            disabled={executionState !== 'idle' && executionState !== 'done'}
                            className="text-[10px] text-slate-500 hover:text-indigo-600 disabled:opacity-20 cursor-pointer font-bold leading-none p-0.5 hover:bg-slate-200 rounded"
                          >
                            ▼
                          </button>
                        </div>
                      </div>

                      {/* Twin Cell Split Sub-Registers visual indicator */}
                      {hasSubRegs && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200 flex justify-between font-mono text-[9px] text-slate-500">
                          <div>
                            <span className="text-indigo-600 font-semibold">{reg[0]}H:</span>{' '}
                            <span className="text-emerald-700 font-bold">{byteHexFormat(highByteVal)}</span>
                          </div>
                          <div className="w-[1px] bg-slate-200" />
                          <div>
                            <span className="text-indigo-600 font-semibold">{reg[0]}L:</span>{' '}
                            <span className="text-emerald-700 font-bold">{byteHexFormat(lowByteVal)}</span>
                          </div>
                        </div>
                      )}

                      {/* Small Indicator Tag */}
                      {isModified && (
                        <span className="absolute -top-1.5 right-2 bg-emerald-600 text-white text-[8px] font-bold px-1.5 rounded-full uppercase leading-none py-1 tracking-wider shadow-sm">
                          Delta
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ALU Segment Register Pins (Visual Bus Interface Unit - BIU representation) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-250/50">
                {['CS', 'DS', 'SS', 'ES'].map(seg => (
                  <div key={seg} className="flex items-center justify-between font-mono px-3 py-1.5 bg-white rounded-xl border border-slate-200/60 shadow-xs">
                    <span className="text-[10px] text-slate-500 font-bold">{seg} Segment</span>
                    <span className="text-xs text-slate-800 font-bold">{hexFormat(regs[seg] ?? 0)}</span>
                  </div>
                ))}
              </div>

              {/* Status Flag Breadboard Pins - Styled as Physical Switches */}
              <div className="border-t border-slate-100 pt-4">
                <span className="text-xs font-mono text-slate-500 uppercase font-bold block mb-3 tracking-wider">
                  Intel 8086 ALU Status Flags:
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3.5">
                  {['ZF', 'CF', 'SF', 'OF', 'AF', 'PF'].map(flag => {
                    const isSet = flags[flag] === 1;
                    const prevFlag = beforeFlags[flag] ?? 0;
                    const isMod = flags[flag] !== prevFlag && executionState === 'done';

                    return (
                      <div 
                        key={flag}
                        onClick={() => toggleFlag(flag)}
                        className={`cursor-pointer group flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                          isSet 
                            ? 'bg-indigo-50 border-indigo-200 shadow-xs text-indigo-950' 
                            : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-200'
                        }`}
                        title="Click to toggle flag status"
                      >
                        <span className="text-xs font-mono font-extrabold group-hover:text-indigo-700">{flag}</span>
                        
                        {/* LED Light */}
                        <div className="mt-2 relative flex items-center justify-center">
                          <span className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            isSet 
                              ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' 
                              : 'bg-slate-200'
                          }`} />
                          {isMod && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          )}
                        </div>

                        <span className="text-[10px] font-mono mt-1.5 font-bold">{flags[flag]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Hardware Console Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-slate-100">
                <button
                  onClick={handleExecute}
                  disabled={executionState !== 'idle' && executionState !== 'done'}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-45 disabled:cursor-not-allowed text-white text-xs font-bold font-sans rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer border border-indigo-500/30"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Run Instruction
                </button>
                <button
                  onClick={handleReset}
                  className="w-full py-3 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold font-sans rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer border border-slate-200 shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  Reset CPU
                </button>
              </div>

              </div>
            )}

            {/* GROUP B: Format, Bus & Interactive Category Explorers */}
            {mobileSubTab === 'explorers' && (
              <>
                {/* Interactive Stack & PUSH/POP Memory Laboratory - Renders when PUSH or POP is selected */}
            {(activeInstruction.opcode.includes('PUSH') || activeInstruction.opcode.includes('POP')) && (
              <div className="bg-white border-2 border-indigo-200/80 rounded-2xl p-5 space-y-5 shadow-lg relative overflow-hidden">
                {/* Background circuit board glow */}
                <div className="absolute -right-20 -bottom-20 w-48 h-48 bg-indigo-100 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-600 animate-pulse" />
                    <span className="text-sm font-extrabold uppercase text-slate-800 tracking-wider font-mono">
                      8086 Stack Segment (SS:SP) & PUSH/POP Memory Laboratory
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full font-bold">
                      SS: {hexFormat(regs.SS)}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-extrabold">
                      SP: {hexFormat(regs.SP)}
                    </span>
                  </div>
                </div>

                {/* Subtitle description */}
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  The 8086 stack is a LIFO (Last-In, First-Out) memory structure inside the Stack Segment (<code className="font-mono font-bold text-slate-800">SS</code>). The Stack Pointer (<code className="font-mono font-bold text-indigo-700">SP</code>) tracks the Top of Stack offset. <strong>Important:</strong> The 8086 stack grows <em>downward</em> from higher memory addresses to lower addresses!
                </p>

                {/* 2-Column Laboratory Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                  
                  {/* Left Column: Stack Controls & Micro-step Rules (7 cols) */}
                  <div className="md:col-span-7 space-y-4 bg-slate-50 border border-slate-150 p-4 rounded-xl flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold font-mono text-indigo-950 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                        <Terminal className="w-4 h-4 text-indigo-600" />
                        8086 Stack Micro-Execution Rules:
                      </span>

                      <div className="space-y-2 text-xs font-mono">
                        {/* PUSH Card */}
                        <div className="p-3 bg-white border border-indigo-100 rounded-lg shadow-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-indigo-700 text-xs">PUSH Operand (e.g. PUSH AX)</span>
                            <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold">Decrements SP by 2</span>
                          </div>
                          <ol className="text-[11px] text-slate-600 space-y-0.5 list-decimal pl-4 pt-1 font-sans">
                            <li><strong className="font-mono text-indigo-900">SP ← SP - 2</strong> (Allocates 2 bytes downward in SS)</li>
                            <li><strong className="font-mono text-indigo-900">SS:[SP] ← 16-bit Word</strong> (Writes Low Byte to SS:[SP], High Byte to SS:[SP+1])</li>
                          </ol>
                        </div>

                        {/* POP Card */}
                        <div className="p-3 bg-white border border-emerald-100 rounded-lg shadow-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-emerald-800 text-xs">POP Operand (e.g. POP DX)</span>
                            <span className="text-[9px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Increments SP by 2</span>
                          </div>
                          <ol className="text-[11px] text-slate-600 space-y-0.5 list-decimal pl-4 pt-1 font-sans">
                            <li><strong className="font-mono text-emerald-950">Dest ← SS:[SP]</strong> (Reads 16-bit word from current Top of Stack)</li>
                            <li><strong className="font-mono text-emerald-950">SP ← SP + 2</strong> (Frees 2 bytes, moving SP upward)</li>
                          </ol>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Push/Pop Buttons */}
                    <div className="pt-2 border-t border-slate-200 space-y-2">
                      <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider block">
                        Interactive Stack Control Operations:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button
                          onClick={() => handlePushReg('AX', regs.AX)}
                          className="px-2.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold font-mono transition-all shadow-xs active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                          PUSH AX ({hexFormat(regs.AX)})
                        </button>
                        <button
                          onClick={() => handlePushReg('BX', regs.BX)}
                          className="px-2.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold font-mono transition-all shadow-xs active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                          PUSH BX ({hexFormat(regs.BX)})
                        </button>
                        <button
                          onClick={() => handlePopReg('DX')}
                          className="px-2.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold font-mono transition-all shadow-xs active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                          POP DX
                        </button>
                        <button
                          onClick={handleResetStack}
                          className="px-2.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold font-mono transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                          Reset SP
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Physical Stack Memory Diagram (5 cols) */}
                  <div className="md:col-span-5 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-xs relative overflow-hidden">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-3">
                      <span className="text-[10px] font-bold font-mono uppercase text-indigo-700 tracking-wider">
                        Stack Segment Memory (SS:{hexFormat(regs.SS)})
                      </span>
                      <span className="text-[9px] font-mono text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        LIFO Stack
                      </span>
                    </div>

                    {/* Stack Memory Cells (High Address FFFE to Low Address FFF4) */}
                    <div className="space-y-1.5 font-mono text-xs my-2">
                      {[0xFFFE, 0xFFFC, 0xFFFA, 0xFFF8, 0xFFF6].map((addr) => {
                        const isTop = regs.SP === addr;
                        const frame = stackFrames.find(f => f.addr === addr);
                        const isBelowSp = addr < regs.SP;
                        const isBOS = addr === 0xFFFE;

                        return (
                          <div 
                            key={addr}
                            className={`p-2 rounded-lg border transition-all flex items-center justify-between ${
                              isTop 
                                ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs scale-[1.02]' 
                                : frame 
                                ? 'bg-white border-slate-300 text-slate-800 shadow-xs' 
                                : 'bg-slate-100/70 border-slate-200 text-slate-400'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold ${isTop ? 'text-indigo-100' : 'text-indigo-700'}`}>
                                {hexFormat(addr)}H:
                              </span>
                              {frame ? (
                                <span className={`font-extrabold ${isTop ? 'text-emerald-200' : 'text-emerald-700'}`}>
                                  {hexFormat(frame.value)}
                                </span>
                              ) : isBOS ? (
                                <span className={`text-[10px] italic ${isTop ? 'text-indigo-200' : 'text-slate-500'}`}>
                                  [Base of Stack]
                                </span>
                              ) : (
                                <span className={`text-[10px] italic ${isTop ? 'text-indigo-200' : 'text-slate-400'}`}>
                                  {isBelowSp ? '[ Unallocated ]' : '[ Free Memory ]'}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              {frame && (
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${isTop ? 'bg-indigo-700 text-indigo-100' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'}`}>
                                  {frame.label}
                                </span>
                              )}
                              {isTop && (
                                <span className="text-[9px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-extrabold animate-pulse">
                                  👈 TOS (SP)
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-slate-200 text-[9.5px] font-mono text-slate-500 flex justify-between items-center">
                      <span>↓ Growth: High → Low Addr</span>
                      <span className="text-indigo-700 font-bold">SS:[SP] = Top Of Stack</span>
                    </div>

                  </div>

                </div>

                {/* Code Example */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-slate-800 font-mono text-xs">
                  <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-200">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                      8086 Assembly Stack Sequence Example
                    </span>
                    <button
                      onClick={() => handleExecute()}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Run {displayOpcode}
                    </button>
                  </div>
                  <pre className="text-[11px] leading-relaxed text-slate-800 bg-white p-2.5 rounded-lg overflow-x-auto border border-slate-200 font-mono">
{`; --- 8086 Stack Memory PUSH & POP Sequence ---
MOV AX, 1234H  ; Initialize AX with 1234H
PUSH AX        ; SP ← SP - 2 (FFFC), writes 1234H to SS:FFFCH
POP DX         ; Reads 1234H into DX, SP ← SP + 2 (FFFE)`}
                  </pre>
                </div>

              </div>
            )}

            {/* Interactive XLAT Conversion Laboratory - Renders when XLAT is selected */}
            {activeInstruction.opcode === 'XLAT' && (
              <div className="bg-white border-2 border-indigo-200/80 rounded-2xl p-5 space-y-5 shadow-lg relative overflow-hidden">
                {/* Background circuit board glow */}
                <div className="absolute -right-20 -bottom-20 w-48 h-48 bg-indigo-100 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5 text-indigo-600 animate-pulse" />
                    <span className="text-sm font-extrabold uppercase text-slate-800 tracking-wider font-mono">
                      XLAT Translate & Conversion Laboratory
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full font-bold">
                    DS:[BX + AL] Translation Engine
                  </span>
                </div>

                {/* Subtitle description */}
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  The <code className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 font-mono text-[11px] rounded-md font-bold">XLAT</code> instruction uses the contents of the <code className="font-mono font-bold text-slate-700">BX</code> register as the start address of a lookup table in memory, and <code className="font-mono font-bold text-slate-700">AL</code> as the unsigned offset index into this table. It retrieves the table's entry and overwrites <code className="font-mono font-bold text-slate-700">AL</code> with it.
                </p>

                {/* Conversion Mode Selection Tabs */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider block">
                    Choose Conversion Table (Simulation Scenario):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'ascii_num', label: 'Decimal to ASCII', desc: '0-15 → ASCII Character' },
                      { id: 'sevensegment', label: 'Hex to 7-Segment', desc: '0-F → LED Display Byte' },
                      { id: 'gray', label: 'Binary to Gray Code', desc: 'Binary → Gray Code Pattern' },
                      { id: 'ascii_case', label: 'Lowercase Mapping', desc: '0-15 → lowercase ascii' }
                    ].map(sc => {
                      const isSel = xlatScenario === sc.id;
                      return (
                        <button
                          key={sc.id}
                          onClick={() => handleXlatScenarioChange(sc.id as any)}
                          className={`px-3 py-2 text-left rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSel
                              ? 'bg-indigo-50 border-indigo-300 shadow-xs'
                              : 'bg-slate-50/50 border-slate-150 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <span className={`text-[11px] font-bold ${isSel ? 'text-indigo-800' : 'text-slate-700'}`}>{sc.label}</span>
                          <span className="text-[8.5px] text-slate-400 font-mono mt-0.5">{sc.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Main Visual Workspace: Table + Interactive Hardware Element */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                  
                  {/* Left: Memory Table Visualizer (8 Cols) */}
                  <div className="md:col-span-8 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-bold font-mono text-indigo-950 uppercase tracking-wider">
                        Memory Lookup Table (DS:BX = {hexFormat(regs.BX)})
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Total Size: 16 Bytes (00H - 0FH)
                      </span>
                    </div>

                    {/* Table Matrix (16 Cells) */}
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                      {Array.from({ length: 16 }).map((_, i) => {
                        const cellVal = xlatTable[i] ?? 0;
                        const isActive = (regs.AX & 0xFF) === i;

                        // Display visualizer based on scenario
                        let displayChar = '';
                        if (xlatScenario === 'ascii_num') {
                          displayChar = String.fromCharCode(cellVal);
                        } else if (xlatScenario === 'ascii_case') {
                          displayChar = String.fromCharCode(cellVal);
                        }

                        return (
                          <div
                            key={i}
                            onClick={() => updateXlatAlVal(i)}
                            className={`p-2 rounded-lg border text-center font-mono cursor-pointer transition-all flex flex-col justify-between select-none relative ${
                              isActive
                                ? 'bg-indigo-600 border-indigo-700 text-white shadow-md scale-105 z-10 font-bold'
                                : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/10 text-slate-800'
                            }`}
                            title={`Click to set AL to index ${byteHexFormat(i)}`}
                          >
                            <span className={`text-[8px] font-extrabold ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                              +{byteHexFormat(i)}
                            </span>
                            <span className="text-xs font-bold block my-1">
                              {byteHexFormat(cellVal)}
                            </span>
                            <span className={`text-[8.5px] truncate font-bold leading-none ${isActive ? 'text-emerald-300' : 'text-indigo-600'}`}>
                              {xlatScenario === 'sevensegment' ? (
                                `led`
                              ) : displayChar ? (
                                `'${displayChar}'`
                              ) : (
                                `val`
                              )}
                            </span>
                            {isActive && (
                              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[5px] border-b-white" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Address calculation helper */}
                    <div className="mt-4 p-2.5 bg-white border border-slate-150 rounded-lg flex flex-col sm:flex-row justify-between items-center text-xs font-mono text-slate-600 gap-2">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-400">Memory Cell: </span>
                        <span className="text-slate-800 font-extrabold bg-slate-100 px-1.5 py-0.5 rounded">
                          DS:[{hexFormat(regs.BX)} + {byteHexFormat(regs.AX & 0xFF)}] = DS:[{hexFormat(regs.BX + (regs.AX & 0xFF))}]
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-indigo-700 font-bold">
                        <span>Stored Content: </span>
                        <span className="bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-extrabold">
                          {byteHexFormat(xlatTable[regs.AX & 0xFF] ?? 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Tactile Physical Simulator Outlet (4 Cols) */}
                  <div className="md:col-span-4 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl p-4 flex flex-col justify-between items-center shadow-xs relative overflow-hidden">
                    {/* Retro Grid background */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:10px_10px] opacity-40" />
                    
                    <div className="w-full text-center relative z-10 shrink-0 mb-2">
                      <span className="text-[9px] font-bold font-mono uppercase text-indigo-700 tracking-widest block">
                        Hardware Display Unit
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium font-sans">
                        Real-time Output
                      </span>
                    </div>

                    {/* Dynamic Graphic Board depending on scenario */}
                    <div className="w-full flex-grow flex items-center justify-center py-2 relative z-10 min-h-[110px]">
                      {xlatScenario === 'sevensegment' ? (
                        /* Beautiful Seven-Segment LED Graphic */
                        <SevenSegmentDisplay hexValue={xlatTable[regs.AX & 0xFF] ?? 0} />
                      ) : xlatScenario === 'ascii_num' || xlatScenario === 'ascii_case' ? (
                        /* Clean Light ASCII Character Display Box */
                        <div className="flex flex-col items-center justify-center bg-emerald-50/80 border border-emerald-300 w-24 h-24 rounded-xl shadow-xs">
                          <span className="text-[9px] font-mono font-bold text-emerald-800 uppercase tracking-widest leading-none mb-2">
                            DISPLAY CHAR
                          </span>
                          <span className="text-3xl font-mono font-extrabold text-emerald-700">
                            {String.fromCharCode(xlatTable[regs.AX & 0xFF] ?? 32)}
                          </span>
                          <span className="text-[9px] font-mono font-bold text-emerald-800 mt-2">
                            ASCII: {byteHexFormat(xlatTable[regs.AX & 0xFF] ?? 0)}
                          </span>
                        </div>
                      ) : (
                        /* Binary pattern visualizer for Gray Code */
                        <div className="flex flex-col items-center gap-1 w-full px-2">
                          <div className="text-center">
                            <p className="text-[9px] text-slate-500 font-mono">Index AL Binary:</p>
                            <div className="flex gap-0.5 justify-center mt-1">
                              {(regs.AX & 0xFF).toString(2).padStart(4, '0').split('').map((bit, idx) => (
                                <span key={idx} className="w-5 h-5 rounded bg-slate-200 border border-slate-300 flex items-center justify-center font-mono text-[10px] font-bold text-indigo-800">
                                  {bit}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="my-1.5 text-indigo-600 text-xs font-bold">▼ XLAT ▼</div>

                          <div className="text-center">
                            <p className="text-[9px] text-emerald-700 font-mono font-bold">Gray Code Output Binary:</p>
                            <div className="flex gap-0.5 justify-center mt-1">
                              {(xlatTable[regs.AX & 0xFF] ?? 0).toString(2).padStart(4, '0').split('').map((bit, idx) => (
                                <span key={idx} className="w-5 h-5 rounded bg-emerald-100 border border-emerald-300 flex items-center justify-center font-mono text-[10px] font-bold text-emerald-800 animate-pulse">
                                  {bit}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Index adjustment helper */}
                    <div className="w-full relative z-10 mt-2">
                      <div className="flex justify-between items-center text-[10px] font-mono text-indigo-700 mb-1">
                        <span>Select Input Index (AL):</span>
                        <span className="font-bold text-white bg-indigo-600 px-1.5 py-0.5 rounded">
                          {regs.AX & 0xFF} ({byteHexFormat(regs.AX & 0xFF)})
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="15"
                        value={regs.AX & 0xFF}
                        onChange={(e) => updateXlatAlVal(parseInt(e.target.value))}
                        className="w-full accent-indigo-600 bg-slate-200 h-1.5 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-[8px] font-mono text-indigo-600 mt-1">
                        <span>Min (00H)</span>
                        <span>Max (0FH)</span>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Assembly Code How-It-Is-Used Demonstration Box */}
                <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-200 text-slate-800 font-mono text-xs">
                  <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-200">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                      8086 Assembly Program Code ({xlatScenario === 'ascii_num' ? 'Decimal to ASCII Conversion' : xlatScenario === 'sevensegment' ? 'Hex to 7-Segment LED Conversion' : xlatScenario === 'gray' ? 'Binary to Gray Code Conversion' : 'Lowercase ASCII Mapping'})
                    </span>
                    <button
                      onClick={() => handleExecute()}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Execute XLAT Step
                    </button>
                  </div>

                  <pre className="text-[11px] leading-relaxed text-slate-800 bg-white p-3 rounded-lg overflow-x-auto border border-slate-200 font-mono">
{xlatScenario === 'ascii_num' ? `; --- Decimal to ASCII Conversion using XLAT ---
.DATA
  LOOKUP_TBL DB 30H, 31H, 32H, 33H, 34H, 35H, 36H, 37H, 38H, 39H ; ASCII '0'..'9'
  INPUT_DEC  DB ${byteHexFormat(regs.AX & 0xFF)}                       ; Raw decimal digit (${regs.AX & 0xFF})

.CODE
  MOV AX, @DATA
  MOV DS, AX
  LEA BX, LOOKUP_TBL ; Load base address offset into BX (${hexFormat(regs.BX)})
  MOV AL, INPUT_DEC  ; Load unsigned lookup index into AL (${byteHexFormat(regs.AX & 0xFF)})
  XLAT               ; Executed: AL = DS:[BX + AL] -> AL becomes ${byteHexFormat(xlatTable[regs.AX & 0xFF] ?? 0)} ('${String.fromCharCode(xlatTable[regs.AX & 0xFF] ?? 32)}')`
: xlatScenario === 'sevensegment' ? `; --- Hex to 7-Segment LED Display Conversion using XLAT ---
.DATA
  LED_TABLE  DB 3FH, 06H, 5BH, 4FH, 66H, 6DH, 7DH, 07H, 7FH, 6FH ; LED Control Bytes
  INPUT_HEX  DB ${byteHexFormat(regs.AX & 0xFF)}                       ; Hex Digit (${regs.AX & 0xFF})

.CODE
  MOV AX, @DATA
  MOV DS, AX
  LEA BX, LED_TABLE  ; Load base address offset into BX (${hexFormat(regs.BX)})
  MOV AL, INPUT_HEX  ; Load unsigned lookup index into AL (${byteHexFormat(regs.AX & 0xFF)})
  XLAT               ; Executed: AL = DS:[BX + AL] -> AL becomes ${byteHexFormat(xlatTable[regs.AX & 0xFF] ?? 0)} (Display Code)`
: xlatScenario === 'gray' ? `; --- Binary to Gray Code Conversion using XLAT ---
.DATA
  GRAY_TABLE DB 00H, 01H, 03H, 02H, 06H, 07H, 05H, 04H ; Gray Code Lookup
  INPUT_BIN  DB ${byteHexFormat(regs.AX & 0xFF)}                       ; Binary index (${regs.AX & 0xFF})

.CODE
  MOV AX, @DATA
  MOV DS, AX
  LEA BX, GRAY_TABLE ; Load base address offset into BX (${hexFormat(regs.BX)})
  MOV AL, INPUT_BIN  ; Load index into AL (${byteHexFormat(regs.AX & 0xFF)})
  XLAT               ; Executed: AL = DS:[BX + AL] -> AL becomes ${byteHexFormat(xlatTable[regs.AX & 0xFF] ?? 0)}`
: `; --- Lowercase ASCII Mapping using XLAT ---
.DATA
  CHAR_TABLE DB 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'
  INPUT_IDX  DB ${byteHexFormat(regs.AX & 0xFF)}                       ; Index (${regs.AX & 0xFF})

.CODE
  MOV AX, @DATA
  MOV DS, AX
  LEA BX, CHAR_TABLE ; Load base offset into BX (${hexFormat(regs.BX)})
  MOV AL, INPUT_IDX  ; Load index into AL (${byteHexFormat(regs.AX & 0xFF)})
  XLAT               ; Executed: AL = DS:[BX + AL] -> AL becomes ${byteHexFormat(xlatTable[regs.AX & 0xFF] ?? 0)} ('${String.fromCharCode(xlatTable[regs.AX & 0xFF] ?? 32)}')`}
                  </pre>
                  <p className="text-[10px] text-slate-400 mt-2 italic font-sans">
                    💡 Tip: Try changing the index slider above or clicking any cell in the lookup table to update the assembly code parameters in real time!
                  </p>
                </div>

              </div>
            )}

            {/* DYNAMIC CATEGORY-DRIVEN INTERACTIVE EXPLORER MODULE */}

            {/* 1. BCD & ASCII ADJUST EXPLORER */}
            {(categoryTab === 'BCD & ASCII' || categoryTab === 'Arithmetic' || mockInstructions[selectedIdx]?.opcode.startsWith('DA') || mockInstructions[selectedIdx]?.opcode.startsWith('AA')) && (
              <div className="bg-gradient-to-br from-purple-50 via-white to-slate-50 border border-purple-200 rounded-2xl p-5 space-y-5 shadow-xs">
                <div className="flex flex-wrap justify-between items-center gap-3 border-b border-purple-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-600 text-white rounded-xl shadow-xs">
                      <Binary className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black font-mono uppercase tracking-wider text-purple-950">
                        Packed BCD vs. Unpacked BCD Interactive Explorer
                      </h3>
                      <p className="text-[11px] text-slate-500 font-sans">
                        Visualize how decimal numbers (0–99) are stored in silicon memory and processed by 8086 adjust instructions.
                      </p>
                    </div>
                  </div>

                  {/* Preset Quick Selectors */}
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <span className="text-[10px] text-slate-400 uppercase font-bold mr-1">Presets:</span>
                    {[
                      { label: '59 (Classic DAA)', val: 59 },
                      { label: '35 (Op 2)', val: 35 },
                      { label: '94 (Sum)', val: 94 },
                      { label: '8 (Single Digit)', val: 8 },
                      { label: '15 (Boundary)', val: 15 }
                    ].map(p => (
                      <button
                        key={p.val}
                        onClick={() => setBcdVal(p.val)}
                        className={`px-2.5 py-1 text-[11px] rounded-lg font-bold transition-all cursor-pointer ${
                          bcdVal === p.val
                            ? 'bg-purple-700 text-white shadow-xs'
                            : 'bg-white text-purple-900 border border-purple-200 hover:bg-purple-100'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interactive Controls & Live Value Display */}
                <div className="bg-white p-4 rounded-xl border border-purple-100 space-y-3 shadow-xs">
                  <div className="flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-slate-700 uppercase">Input Decimal Number (0–99):</span>
                      <input
                        type="number"
                        min={0}
                        max={99}
                        value={bcdVal}
                        onChange={(e) => setBcdVal(Math.max(0, Math.min(99, Number(e.target.value) || 0)))}
                        className="w-20 px-3 py-1.5 font-mono font-bold text-center text-sm border-2 border-purple-300 rounded-xl focus:outline-none focus:border-purple-600 bg-purple-50/50 text-purple-950"
                      />
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div className="bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 text-purple-900 font-bold">
                        Tens Digit: <span className="text-purple-700 text-sm">{Math.floor((bcdVal % 100) / 10)}</span> ({Math.floor((bcdVal % 100) / 10).toString(2).padStart(4, '0')})
                      </div>
                      <div className="bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200 text-indigo-900 font-bold">
                        Ones Digit: <span className="text-indigo-700 text-sm">{bcdVal % 10}</span> ({(bcdVal % 10).toString(2).padStart(4, '0')})
                      </div>
                    </div>
                  </div>

                  {/* Slider Control */}
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-[10px] font-mono text-slate-400">0</span>
                    <input
                      type="range"
                      min={0}
                      max={99}
                      value={bcdVal}
                      onChange={(e) => setBcdVal(Number(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                    <span className="text-[10px] font-mono text-slate-400">99</span>
                  </div>
                </div>

                {/* Quick Mental Shortcut / Golden Rule Banner */}
                <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-indigo-900 text-white p-3.5 rounded-xl border border-purple-800 text-xs font-mono shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block mb-1 flex items-center gap-1.5">
                    <span className="text-amber-400">💡</span> GOLDEN RULE: How Upper 4 Bits (High Nibble) distinguish Packed vs. Unpacked BCD
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-center pt-1">
                    <div className="bg-purple-50/10 p-2.5 rounded-lg border border-purple-400/40">
                      <span className="text-[10px] text-purple-300 block font-bold uppercase">1. PACKED BCD</span>
                      <span className="text-white font-black text-xs">High Nibble = Tens Digit</span>
                      <span className="text-[10px] text-purple-200 block mt-0.5">e.g. 59 → <code className="text-amber-300 font-bold">0101 1001</code> (59H in 1 Byte)</span>
                    </div>
                    <div className="bg-indigo-50/10 p-2.5 rounded-lg border border-indigo-400/40">
                      <span className="text-[10px] text-indigo-300 block font-bold uppercase">2. UNPACKED BCD</span>
                      <span className="text-white font-black text-xs">High Nibble = 0000 (0H)</span>
                      <span className="text-[10px] text-indigo-200 block mt-0.5">e.g. 59 → <code className="text-amber-300 font-bold">00H 09H</code> / <code className="text-amber-300 font-bold">05H 09H</code> (2 Bytes)</span>
                    </div>
                  </div>
                </div>

                {/* Format Comparison Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* 1. Packed BCD Card */}
                  <div className="bg-white p-4 rounded-xl border-2 border-purple-200 space-y-3 shadow-xs flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black font-mono text-purple-900 uppercase">1. Packed BCD</span>
                        <span className="text-[9px] font-mono font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md">1 Byte</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Stores <strong>2 decimal digits</strong> in 1 byte. High nibble = tens digit, Low nibble = ones digit.
                      </p>

                      <div className="bg-purple-50/80 p-2.5 rounded-lg border border-purple-200 text-center font-mono space-y-1">
                        <div className="text-[10px] text-purple-600 font-bold flex justify-around border-b border-purple-200 pb-1">
                          <span>Tens ({Math.floor((bcdVal % 100) / 10)})</span>
                          <span>Ones ({bcdVal % 10})</span>
                        </div>
                        <div className="text-xs font-extrabold text-purple-950 flex justify-around pt-1">
                          <span className="bg-white px-2 py-0.5 rounded border border-purple-300">{Math.floor((bcdVal % 100) / 10).toString(2).padStart(4, '0')}</span>
                          <span className="bg-white px-2 py-0.5 rounded border border-purple-300">{(bcdVal % 10).toString(2).padStart(4, '0')}</span>
                        </div>
                        <div className="text-sm font-black text-purple-700 pt-1">
                          Hex Byte: <span className="bg-purple-200 text-purple-950 px-2 py-0.5 rounded border border-purple-300">{Math.floor((bcdVal % 100) / 10)}{bcdVal % 10}H</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-purple-800 font-mono bg-purple-50 p-2 rounded-lg border border-purple-200">
                      💡 <strong>8086 Opcodes:</strong> Uses <code>DAA</code> & <code>DAS</code> to adjust AL after math.
                    </div>
                  </div>

                  {/* 2. Unpacked BCD Card */}
                  <div className="bg-white p-4 rounded-xl border-2 border-indigo-200 space-y-3 shadow-xs flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black font-mono text-indigo-900 uppercase">2. Unpacked BCD</span>
                        <span className="text-[9px] font-mono font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md">2 Bytes</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Stores <strong>1 decimal digit</strong> per byte. High nibble is strictly <code>0000</code> (<code>0H</code>).
                      </p>

                      <div className="bg-indigo-50/80 p-2.5 rounded-lg border border-indigo-200 text-center font-mono space-y-1">
                        <div className="text-[10px] text-indigo-600 font-bold flex justify-around border-b border-indigo-200 pb-1">
                          <span>Byte 1 (Tens)</span>
                          <span>Byte 2 (Ones)</span>
                        </div>
                        <div className="text-[11px] font-extrabold text-indigo-950 flex justify-around pt-1">
                          <span className="bg-white px-1.5 py-0.5 rounded border border-indigo-300">0000 {Math.floor((bcdVal % 100) / 10).toString(2).padStart(4, '0')}</span>
                          <span className="bg-white px-1.5 py-0.5 rounded border border-indigo-300">0000 {(bcdVal % 10).toString(2).padStart(4, '0')}</span>
                        </div>
                        <div className="text-xs font-black text-indigo-700 pt-1">
                          AH: 0{Math.floor((bcdVal % 100) / 10)}H | AL: 0{bcdVal % 10}H
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-indigo-800 font-mono bg-indigo-50 p-2 rounded-lg border border-indigo-200">
                      💡 <strong>8086 Opcodes:</strong> Uses <code>AAA</code>, <code>AAS</code>, <code>AAM</code>, <code>AAD</code>.
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* 2A. DEDICATED BRANCH & LOOP EXPLORER */}
            {(currentCategory === 'Branch' || currentCategory === 'Loop') && (() => {
              const a = branchValA & 0xFFFF;
              const b = branchValB & 0xFFFF;
              const diff = (a - b + 0x10000) & 0xFFFF;
              const zf = a === b ? 1 : 0;
              const cf = a < b ? 1 : 0;
              const sf = (diff & 0x8000) !== 0 ? 1 : 0;
              const sa = (a >> 15) & 1;
              const sb = (b >> 15) & 1;
              const sr = (diff >> 15) & 1;
              const of = (sa !== sb && sa !== sr) ? 1 : 0;

              const branchSyntaxMap: Record<string, {
                syntax: string;
                alternateSyntax?: string;
                opcode: string;
                format: string;
                action: string;
                condition: string;
              }> = {
                JZ: {
                  syntax: 'JZ target_label',
                  alternateSyntax: 'JE target_label',
                  opcode: '74h cb',
                  format: 'JZ rel8 (Short Relative Jump)',
                  action: 'IP ← IP + sign_extended(rel8) if ZF = 1',
                  condition: 'Zero Flag ZF = 1 (Jump if Equal / Jump if Zero)',
                },
                JNZ: {
                  syntax: 'JNZ target_label',
                  alternateSyntax: 'JNE target_label',
                  opcode: '75h cb',
                  format: 'JNZ rel8 (Short Relative Jump)',
                  action: 'IP ← IP + sign_extended(rel8) if ZF = 0',
                  condition: 'Zero Flag ZF = 0 (Jump if Not Equal / Jump if Not Zero)',
                },
                JC: {
                  syntax: 'JC target_label',
                  alternateSyntax: 'JB target_label / JNAE target_label',
                  opcode: '72h cb',
                  format: 'JC rel8 (Short Relative Jump)',
                  action: 'IP ← IP + sign_extended(rel8) if CF = 1',
                  condition: 'Carry Flag CF = 1 (Jump if Carry / Jump if Below - Unsigned)',
                },
                JNC: {
                  syntax: 'JNC target_label',
                  alternateSyntax: 'JAE target_label / JNB target_label',
                  opcode: '73h cb',
                  format: 'JNC rel8 (Short Relative Jump)',
                  action: 'IP ← IP + sign_extended(rel8) if CF = 0',
                  condition: 'Carry Flag CF = 0 (Jump if No Carry / Jump if Above or Equal)',
                },
                JA: {
                  syntax: 'JA target_label',
                  alternateSyntax: 'JNBE target_label',
                  opcode: '77h cb',
                  format: 'JA rel8 (Short Relative Jump)',
                  action: 'IP ← IP + sign_extended(rel8) if CF = 0 and ZF = 0',
                  condition: 'CF = 0 & ZF = 0 (Jump if Above - Unsigned)',
                },
                JG: {
                  syntax: 'JG target_label',
                  alternateSyntax: 'JNLE target_label',
                  opcode: '7Fh cb',
                  format: 'JG rel8 (Short Relative Jump)',
                  action: 'IP ← IP + sign_extended(rel8) if ZF = 0 and SF = OF',
                  condition: 'ZF = 0 & SF = OF (Jump if Greater - Signed)',
                },
                JL: {
                  syntax: 'JL target_label',
                  alternateSyntax: 'JNGE target_label',
                  opcode: '7Ch cb',
                  format: 'JL rel8 (Short Relative Jump)',
                  action: 'IP ← IP + sign_extended(rel8) if SF ≠ OF',
                  condition: 'SF ≠ OF (Jump if Less - Signed)',
                },
                JMP: {
                  syntax: 'JMP target_label',
                  alternateSyntax: 'JMP short label / JMP near ptr label',
                  opcode: 'EBh cb / E9h cw',
                  format: 'JMP rel8 / rel16 (Unconditional Jump)',
                  action: 'IP ← IP + sign_extended(displacement)',
                  condition: 'Unconditional (Always Jumps regardless of flags)',
                },
                LOOP: {
                  syntax: 'LOOP target_label',
                  alternateSyntax: 'LOOP label',
                  opcode: 'E2h cb',
                  format: 'LOOP rel8 (Hardware Count-Controlled Loop)',
                  action: 'CX ← CX - 1; if CX ≠ 0 then IP ← IP + sign_extended(rel8)',
                  condition: 'Register CX ≠ 0 (Decrements CX first, jumps if CX > 0)',
                },
              };

              const curBranchInfo = branchSyntaxMap[branchJumpCond] || branchSyntaxMap['JZ'];

              let isTaken = false;
              let reason = '';

              switch (branchJumpCond) {
                case 'JZ':
                  isTaken = zf === 1;
                  reason = zf === 1
                    ? `AX (0x${a.toString(16).toUpperCase()}) equals BX (0x${b.toString(16).toUpperCase()}) → Zero Flag ZF = 1. Jump condition is satisfied!`
                    : `AX (0x${a.toString(16).toUpperCase()}) ≠ BX (0x${b.toString(16).toUpperCase()}) → Zero Flag ZF = 0. JZ requires ZF = 1. Jump NOT taken.`;
                  break;
                case 'JNZ':
                  isTaken = zf === 0;
                  reason = zf === 0
                    ? `AX (0x${a.toString(16).toUpperCase()}) ≠ BX (0x${b.toString(16).toUpperCase()}) → Zero Flag ZF = 0. Jump condition is satisfied!`
                    : `AX (0x${a.toString(16).toUpperCase()}) = BX (0x${b.toString(16).toUpperCase()}) → Zero Flag ZF = 1. JNZ requires ZF = 0. Jump NOT taken.`;
                  break;
                case 'JC':
                case 'JB':
                  isTaken = cf === 1;
                  reason = cf === 1
                    ? `AX (0x${a.toString(16).toUpperCase()}) < BX (0x${b.toString(16).toUpperCase()}) (Unsigned) → Carry Flag CF = 1. Jump condition is satisfied!`
                    : `AX (0x${a.toString(16).toUpperCase()}) ≥ BX (0x${b.toString(16).toUpperCase()}) (Unsigned) → Carry Flag CF = 0. Jump NOT taken.`;
                  break;
                case 'JNC':
                  isTaken = cf === 0;
                  reason = cf === 0
                    ? `AX (0x${a.toString(16).toUpperCase()}) ≥ BX (0x${b.toString(16).toUpperCase()}) → Carry Flag CF = 0. Jump condition is satisfied!`
                    : `AX (0x${a.toString(16).toUpperCase()}) < BX (0x${b.toString(16).toUpperCase()}) → Carry Flag CF = 1. JNC requires CF = 0. Jump NOT taken.`;
                  break;
                case 'JA':
                  isTaken = cf === 0 && zf === 0;
                  reason = (cf === 0 && zf === 0)
                    ? `AX (0x${a.toString(16).toUpperCase()}) > BX (0x${b.toString(16).toUpperCase()}) (Unsigned Above) → CF = 0 & ZF = 0. Jump condition is satisfied!`
                    : `AX (0x${a.toString(16).toUpperCase()}) is not strictly above BX → CF=${cf}, ZF=${zf}. Jump NOT taken.`;
                  break;
                case 'JG':
                  isTaken = zf === 0 && sf === of;
                  reason = (zf === 0 && sf === of)
                    ? `Signed AX (${a}) > Signed BX (${b}) → ZF = 0 & SF = OF. Jump condition is satisfied!`
                    : `Signed AX (${a}) ≤ Signed BX (${b}). Jump NOT taken.`;
                  break;
                case 'JL':
                  isTaken = sf !== of;
                  reason = (sf !== of)
                    ? `Signed AX (${a}) < Signed BX (${b}) → SF (${sf}) ≠ OF (${of}). Jump condition is satisfied!`
                    : `Signed AX (${a}) ≥ Signed BX (${b}) → SF (${sf}) = OF (${of}). Jump NOT taken.`;
                  break;
                case 'JMP':
                  isTaken = true;
                  reason = 'Unconditional jump directly reloads IP with the target label offset without inspecting status flags.';
                  break;
                case 'LOOP':
                  isTaken = branchCx > 0;
                  reason = branchCx > 0
                    ? `Hardware loop counter CX = ${branchCx} (> 0). LOOP condition is satisfied! (Will decrement CX and jump)`
                    : `Hardware loop counter CX = 0. Loop condition fails! Execution falls through.`;
                  break;
              }

              return (
                <div className="bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/50 border border-indigo-200 rounded-2xl p-5 space-y-5 shadow-xs">
                  <div className="flex flex-wrap justify-between items-center gap-3 border-b border-indigo-200 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
                        <GitBranch className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black font-mono uppercase tracking-wider text-indigo-950">
                          8086 Interactive Branching & Program Flow Simulator
                        </h3>
                        <p className="text-[11px] text-slate-500 font-sans">
                          Test register comparison, status flags generation, conditional jump evaluation, and hardware loop execution.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Presets:</span>
                      <button
                        onClick={() => { setBranchValA(5); setBranchValB(5); setBranchJumpCond('JZ'); }}
                        className="px-2.5 py-1 text-xs rounded-lg font-bold bg-white text-indigo-900 border border-indigo-200 hover:bg-indigo-100 cursor-pointer transition-all shadow-2xs font-mono"
                      >
                        AX = BX (Equal)
                      </button>
                      <button
                        onClick={() => { setBranchValA(9); setBranchValB(3); setBranchJumpCond('JA'); }}
                        className="px-2.5 py-1 text-xs rounded-lg font-bold bg-white text-indigo-900 border border-indigo-200 hover:bg-indigo-100 cursor-pointer transition-all shadow-2xs font-mono"
                      >
                        AX &gt; BX (Above)
                      </button>
                      <button
                        onClick={() => { setBranchValA(2); setBranchValB(8); setBranchJumpCond('JB'); }}
                        className="px-2.5 py-1 text-xs rounded-lg font-bold bg-white text-indigo-900 border border-indigo-200 hover:bg-indigo-100 cursor-pointer transition-all shadow-2xs font-mono"
                      >
                        AX &lt; BX (Below)
                      </button>
                    </div>
                  </div>

                  {/* Step 1: Register Inputs & CMP Execution */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
                    {/* Register AX */}
                    <div className="bg-white p-3.5 rounded-xl border border-indigo-200 space-y-2 shadow-2xs">
                      <div className="flex justify-between items-center text-xs font-bold text-indigo-950">
                        <span>Register AX (Value 1)</span>
                        <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[10px]">0x{a.toString(16).toUpperCase().padStart(4, '0')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={branchValA}
                          onChange={(e) => setBranchValA(Number(e.target.value))}
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Register BX */}
                    <div className="bg-white p-3.5 rounded-xl border border-indigo-200 space-y-2 shadow-2xs">
                      <div className="flex justify-between items-center text-xs font-bold text-indigo-950">
                        <span>Register BX (Value 2)</span>
                        <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[10px]">0x{b.toString(16).toUpperCase().padStart(4, '0')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={branchValB}
                          onChange={(e) => setBranchValB(Number(e.target.value))}
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Evaluated Flags Banner */}
                    <div className="bg-white p-3.5 rounded-xl border border-indigo-200 space-y-1.5 shadow-2xs flex flex-col justify-between">
                      <div className="text-xs font-bold text-indigo-950 flex justify-between items-center">
                        <span>CMP AX, BX Flags:</span>
                        <span className="text-[10px] text-slate-400">AX - BX</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 text-center text-xs font-bold font-mono">
                        <div className={`p-1 rounded border ${zf ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                          <span className="text-[9px] block text-slate-400">ZF</span>{zf}
                        </div>
                        <div className={`p-1 rounded border ${cf ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                          <span className="text-[9px] block text-slate-400">CF</span>{cf}
                        </div>
                        <div className={`p-1 rounded border ${sf ? 'bg-rose-100 text-rose-900 border-rose-300' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                          <span className="text-[9px] block text-slate-400">SF</span>{sf}
                        </div>
                        <div className={`p-1 rounded border ${of ? 'bg-purple-100 text-purple-900 border-purple-300' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                          <span className="text-[9px] block text-slate-400">OF</span>{of}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Jump Instruction Selector */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider font-mono block">
                      Select Branch / Jump Instruction to Test:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono">
                      {[
                        { inst: 'JZ', label: 'JZ / JE (Zero)', req: 'ZF = 1' },
                        { inst: 'JNZ', label: 'JNZ / JNE (Not Zero)', req: 'ZF = 0' },
                        { inst: 'JC', label: 'JC / JB (Carry)', req: 'CF = 1' },
                        { inst: 'JNC', label: 'JNC / JAE (No Carry)', req: 'CF = 0' },
                        { inst: 'JA', label: 'JA (Above)', req: 'CF=0 & ZF=0' },
                        { inst: 'JG', label: 'JG (Greater)', req: 'Signed >' },
                        { inst: 'JL', label: 'JL (Less)', req: 'Signed <' },
                        { inst: 'JMP', label: 'JMP (Always)', req: 'Unconditional' },
                        { inst: 'LOOP', label: 'LOOP (CX)', req: 'CX ≠ 0' },
                      ].map((j) => (
                        <button
                          key={j.inst}
                          onClick={() => setBranchJumpCond(j.inst as any)}
                          className={`p-2 rounded-xl border text-xs text-left transition-all cursor-pointer flex flex-col justify-between ${
                            branchJumpCond === j.inst
                              ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm font-bold scale-[1.02]'
                              : 'bg-white text-slate-800 border-slate-200 hover:bg-indigo-50 font-semibold'
                          }`}
                        >
                          <span className="font-bold">{j.label}</span>
                          <span className={`text-[10px] ${branchJumpCond === j.inst ? 'text-indigo-200' : 'text-slate-400'}`}>{j.req}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Instruction Syntax & Format Banner */}
                  <div className="bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/70 text-slate-800 p-3.5 sm:p-4 rounded-xl border border-indigo-200/80 font-mono text-xs space-y-2.5 shadow-2xs">
                    <div className="flex justify-between items-center border-b border-indigo-150 pb-1.5 flex-wrap gap-2">
                      <span className="text-[11px] font-extrabold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                        Simulated 8086 Instruction Syntax & Format:
                      </span>
                      <span className="text-[10px] bg-white text-indigo-900 px-2 py-0.5 rounded border border-indigo-200 font-bold shadow-2xs">
                        {curBranchInfo.format}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {/* Selected Branch Instruction Syntax */}
                      <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-indigo-150 space-y-1 shadow-2xs">
                        <span className="text-[10px] text-slate-500 block font-bold uppercase">1. Branch / Loop Instruction Syntax:</span>
                        <div className="text-sm font-black text-indigo-950">
                          <code>{curBranchInfo.syntax}</code>
                          {curBranchInfo.alternateSyntax && (
                            <span className="text-xs text-slate-500 font-normal block pt-0.5">
                              Alt: <code className="text-indigo-800">{curBranchInfo.alternateSyntax}</code>
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-600 font-sans pt-1">
                          <strong>Opcode:</strong> <code className="text-indigo-700 font-mono">{curBranchInfo.opcode}</code> | <strong>Action:</strong> <code className="text-amber-800 font-mono">{curBranchInfo.action}</code>
                        </div>
                      </div>

                      {/* Preceding Compare Instruction Syntax */}
                      <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-indigo-150 space-y-1 shadow-2xs">
                        <span className="text-[10px] text-slate-500 block font-bold uppercase">2. Preceding Comparison Instruction:</span>
                        <div className="text-sm font-black text-emerald-800">
                          <code>CMP AX, BX</code>
                        </div>
                        <div className="text-[10px] text-slate-600 font-sans pt-1">
                          <strong>Syntax:</strong> <code className="text-emerald-700 font-mono">CMP destination, source</code> | <strong>Opcode:</strong> <code className="text-indigo-700 font-mono">38H / 39H / 3BH</code><br />
                          Computes <code className="text-emerald-800 font-mono">AX - BX</code> to update status flags (ZF, CF, SF, OF) without altering operands.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* If LOOP is selected, show Hardware CX Stepper */}
                  {branchJumpCond === 'LOOP' && (
                    <div className="bg-purple-50 p-3.5 rounded-xl border border-purple-200 flex flex-wrap justify-between items-center gap-3 font-mono">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-purple-950 block">Hardware Loop Counter (Register CX):</span>
                        <span className="text-xs text-purple-800 font-sans">
                          Current CX = <strong className="font-mono text-sm text-purple-950">{branchCx}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setBranchCx(prev => Math.max(0, prev - 1))}
                          className="px-3 py-1.5 bg-purple-600 text-white rounded-lg font-bold text-xs hover:bg-purple-700 transition-all cursor-pointer shadow-2xs"
                        >
                          Step LOOP (CX ← CX - 1)
                        </button>
                        <button
                          onClick={() => setBranchCx(3)}
                          className="px-3 py-1.5 bg-white text-purple-900 border border-purple-300 rounded-lg font-bold text-xs hover:bg-purple-100 transition-all cursor-pointer"
                        >
                          Reset CX = 3
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Big Dynamic Result Banner */}
                  <div className={`p-4 rounded-xl border font-mono space-y-2 shadow-xs transition-all ${
                    isTaken
                      ? 'bg-emerald-500/10 border-emerald-400 text-emerald-950'
                      : 'bg-rose-500/10 border-rose-400 text-rose-950'
                  }`}>
                    <div className="flex justify-between items-center border-b border-current/20 pb-2">
                      <span className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                        {isTaken ? '✅ JUMP TAKEN (BRANCH EXECUTED)' : '❌ JUMP NOT TAKEN (FALLTHROUGH)'}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded border border-current">
                        {isTaken ? 'IP ← 0150H (TARGET_LABEL)' : 'IP ← 0102H (Next Instruction)'}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-sans font-medium leading-relaxed">
                      {reason}
                    </p>
                  </div>

                  {/* Step 4: Disassembly Flow Highlights */}
                  <div className="bg-slate-50/90 text-slate-800 p-4 rounded-xl font-mono text-xs space-y-2 border border-slate-200 shadow-2xs">
                    <span className="text-slate-700 text-[10px] uppercase tracking-wider font-bold block border-b border-slate-200 pb-1">
                      8086 Assembly Program Execution Visualizer:
                    </span>
                    <div className="space-y-1">
                      <div className="p-1.5 rounded bg-white text-slate-700 border border-slate-200 flex justify-between">
                        <span>0100H: CMP AX, BX</span>
                        <span className="text-slate-500">; AX={a}, BX={b}</span>
                      </div>
                      <div className={`p-1.5 rounded flex justify-between font-bold ${
                        isTaken ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' : 'bg-rose-50 text-rose-900 border border-rose-300'
                      }`}>
                        <span>0102H: {branchJumpCond} TARGET_LABEL</span>
                        <span>{isTaken ? '➜ TAKEN → Jump to 0150H' : '➜ NOT TAKEN → Fall through'}</span>
                      </div>
                      <div className={`p-1.5 rounded flex justify-between ${
                        !isTaken ? 'bg-amber-50 text-amber-900 font-bold border border-amber-300' : 'text-slate-400 line-through opacity-60'
                      }`}>
                        <span>0104H: MOV CX, 0001H</span>
                        <span>{!isTaken ? '➜ Executed next' : '; Skipped due to jump'}</span>
                      </div>
                      <div className="text-slate-400 px-1.5 py-0.5">...</div>
                      <div className={`p-1.5 rounded flex justify-between ${
                        isTaken ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-300' : 'text-slate-500'
                      }`}>
                        <span>0150H: TARGET_LABEL: NOP</span>
                        <span>{isTaken ? '➜ Branch Target Reached' : '; Not jumped to'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 2B. CONTROL & FLAG EXPLORER */}
            {(currentCategory === 'Control' || currentCategory === 'Flag' || currentCategory === 'Machine Control' || currentCategory === 'Flag Manipulation') && (
              <div className="bg-gradient-to-br from-amber-50/70 via-white to-orange-50/40 border border-amber-200 rounded-2xl p-5 space-y-5 shadow-xs">
                <div className="flex flex-wrap justify-between items-center gap-3 border-b border-amber-200/80 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-600 text-white rounded-xl shadow-xs">
                      <Flag className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black font-mono uppercase tracking-wider text-amber-950">
                        8086 Flag Register & Control Flow Interactive Explorer
                      </h3>
                      <p className="text-[11px] text-slate-500 font-sans">
                        Simulate the 16-bit status flags register, flag manipulation instructions (STC, CLC, STD, CLD), and program execution control.
                      </p>
                    </div>
                  </div>

                  {/* Flag Presets */}
                  <div className="flex items-center gap-1.5 font-mono text-xs flex-wrap">
                    <span className="text-[10px] text-slate-400 uppercase font-bold mr-1">Quick Actions:</span>
                    {[
                      { label: 'STC (CF=1)', act: () => setInteractiveFlags(prev => ({ ...prev, CF: 1 })) },
                      { label: 'CLC (CF=0)', act: () => setInteractiveFlags(prev => ({ ...prev, CF: 0 })) },
                      { label: 'STD (DF=1)', act: () => setInteractiveFlags(prev => ({ ...prev, DF: 1 })) },
                      { label: 'CLD (DF=0)', act: () => setInteractiveFlags(prev => ({ ...prev, DF: 0 })) },
                      { label: 'Set Zero (ZF=1)', act: () => setInteractiveFlags(prev => ({ ...prev, ZF: 1 })) },
                      { label: 'Reset Flags', act: () => setInteractiveFlags({ CF: 0, ZF: 1, SF: 0, OF: 0, AF: 0, PF: 1, IF: 1, DF: 0, TF: 0 }) }
                    ].map((p, i) => (
                      <button
                        key={i}
                        onClick={p.act}
                        className="px-2 py-1 text-[10px] rounded-lg font-bold bg-white text-amber-900 border border-amber-300 hover:bg-amber-100 transition-all cursor-pointer shadow-2xs"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 16-Bit Flag Register Bit Grid */}
                <div className="bg-white p-4 rounded-xl border border-amber-200 space-y-3 shadow-xs">
                  <div className="flex justify-between items-center text-xs font-mono font-bold text-amber-950 border-b border-amber-100 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-600" />
                      16-BIT FLAG REGISTER STATE:
                    </span>
                    <span className="text-[11px] text-slate-500 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Hex: 0x{((interactiveFlags.OF<<11)|(interactiveFlags.DF<<10)|(interactiveFlags.IF<<9)|(interactiveFlags.TF<<8)|(interactiveFlags.SF<<7)|(interactiveFlags.ZF<<6)|(interactiveFlags.AF<<4)|(interactiveFlags.PF<<2)|1|interactiveFlags.CF).toString(16).toUpperCase().padStart(4, '0')}
                    </span>
                  </div>

                  <div className="grid grid-cols-8 sm:grid-cols-16 gap-1 text-center font-mono text-xs">
                    {[
                      { bit: 15, name: '-', active: false },
                      { bit: 14, name: '-', active: false },
                      { bit: 13, name: '-', active: false },
                      { bit: 12, name: '-', active: false },
                      { bit: 11, name: 'OF', active: true, key: 'OF', desc: 'Overflow Flag' },
                      { bit: 10, name: 'DF', active: true, key: 'DF', desc: 'Direction Flag (0=Inc, 1=Dec)' },
                      { bit: 9,  name: 'IF', active: true, key: 'IF', desc: 'Interrupt Enable Flag' },
                      { bit: 8,  name: 'TF', active: true, key: 'TF', desc: 'Trap Flag (Single Step)' },
                      { bit: 7,  name: 'SF', active: true, key: 'SF', desc: 'Sign Flag (Negative bit 7)' },
                      { bit: 6,  name: 'ZF', active: true, key: 'ZF', desc: 'Zero Flag (1 if result is 0)' },
                      { bit: 5,  name: '-', active: false },
                      { bit: 4,  name: 'AF', active: true, key: 'AF', desc: 'Auxiliary Carry Flag (Nibble carry)' },
                      { bit: 3,  name: '-', active: false },
                      { bit: 2,  name: 'PF', active: true, key: 'PF', desc: 'Parity Flag (Even 1s in low byte)' },
                      { bit: 1,  name: '1',  active: false, valOverride: 1 },
                      { bit: 0,  name: 'CF', active: true, key: 'CF', desc: 'Carry Flag (Unsigned math carry)' }
                    ].map((bInfo, idx) => {
                      const bitVal = bInfo.valOverride !== undefined
                        ? bInfo.valOverride
                        : bInfo.key
                        ? interactiveFlags[bInfo.key]
                        : 0;

                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            if (bInfo.key) {
                              toggleFlag(bInfo.key);
                              setInteractiveFlags(prev => ({
                                ...prev,
                                [bInfo.key]: prev[bInfo.key] ? 0 : 1
                              }));
                            }
                          }}
                          className={`p-1.5 rounded-lg border flex flex-col justify-between transition-all select-none ${
                            bInfo.active
                              ? bitVal
                                ? 'bg-amber-600 text-white border-amber-700 shadow-xs cursor-pointer scale-102 font-bold'
                                : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100 cursor-pointer font-semibold'
                              : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                          }`}
                          title={bInfo.desc || `Bit ${bInfo.bit} Reserved`}
                        >
                          <span className="text-[8px] font-mono opacity-80 block">{bInfo.bit}</span>
                          <span className="text-[10px] font-extrabold block my-0.5">{bInfo.name}</span>
                          <span className={`text-[10px] font-mono font-black rounded px-1 ${bitVal ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'text-slate-500'}`}>
                            {bitVal}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Control Flow Branching & Subroutine Visualizer */}
                <div className="bg-slate-50 text-slate-900 p-4 rounded-xl space-y-3 font-mono text-xs border border-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-amber-700 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-600" />
                      Control Flow Branching & Jump Condition Matrix
                    </span>
                    <span className="text-[10px] text-slate-500">Current Flags: CF={interactiveFlags.CF}, ZF={interactiveFlags.ZF}, SF={interactiveFlags.SF}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
                      <div className="flex justify-between items-center text-amber-800 font-bold text-[11px]">
                        <span>Conditional Jumps (JZ / JNZ)</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${interactiveFlags.ZF ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'}`}>
                          {interactiveFlags.ZF ? 'JZ TAKEN' : 'JNZ TAKEN'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 leading-normal">
                        <code>JZ target</code> branches if <strong>ZF = 1</strong>. Currently ZF = {interactiveFlags.ZF}.
                      </p>
                      <div className="bg-emerald-50 border border-emerald-200 p-2 rounded text-[10px] text-emerald-800 font-bold">
                        {interactiveFlags.ZF ? '✅ Jump Taken: IP ← IP + Offset' : '❌ Jump Not Taken: Fallthrough to next instruction'}
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
                      <div className="flex justify-between items-center text-amber-800 font-bold text-[11px]">
                        <span>Procedure Call (CALL / RET)</span>
                        <span className="bg-indigo-100 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded text-[10px] font-extrabold">
                          Stack Frame
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 leading-normal">
                        <code>CALL proc</code> pushes return offset onto stack (<code>SS:SP</code>) and jumps to target offset.
                      </p>
                      <div className="bg-indigo-50 border border-indigo-200 p-2 rounded text-[10px] text-indigo-800 font-bold">
                        <code>RET</code> pops offset back into IP to resume caller execution seamlessly.
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
                      <div className="flex justify-between items-center text-amber-800 font-bold text-[11px]">
                        <span>Hardware Loops (LOOP)</span>
                        <span className="bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded text-[10px] font-extrabold">
                          CX Counter
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 leading-normal">
                        <code>LOOP label</code> automatically decrements <code>CX ← CX - 1</code> and branches if <code>CX ≠ 0</code>.
                      </p>
                      <div className="bg-purple-50 border border-purple-200 p-2 rounded text-[10px] text-purple-800 font-bold">
                        Zero Flags unaffected; depends purely on register CX value.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. ARITHMETIC / LOGICAL / SHIFT & ROTATE EXPLORER */}
            {(currentCategory === 'Arithmetic' || currentCategory === 'Logical' || currentCategory === 'Shift & Rotate') && (() => {
              const aluRes = computeAluRes();
              const availableOps = currentCategory === 'Arithmetic'
                ? (['ADD', 'SUB', 'NEG'] as const)
                : currentCategory === 'Logical'
                ? (['AND', 'OR', 'XOR', 'NOT'] as const)
                : (['SHL', 'SHR'] as const);
              const isNotOp = aluOp === 'NOT';
              const isNegOp = aluOp === 'NEG';
              const isUnaryOp = isNotOp || isNegOp;

              if (currentCategory === 'Shift & Rotate') {
                return (
                  <div className="space-y-5">
                    {renderVisualBitShiftSimulator(false)}

                    {/* SHL vs SAL vs SHR vs SAR Architectural Difference Matrix */}
                    <div className="bg-white p-4 rounded-xl border border-indigo-200 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                        <h4 className="text-xs font-bold font-mono text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                          <Binary className="w-4 h-4 text-indigo-600" />
                          Shift Instructions Architectural Comparison (SHL, SAL, SHR, SAR)
                        </h4>
                        <span className="text-[10px] font-sans font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                          8086 Silicon Comparison
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-[11px] font-sans">
                          <thead>
                            <tr className="bg-indigo-100 text-indigo-950 font-mono text-[10.5px] border-b border-indigo-200/80">
                              <th className="p-2 rounded-tl-lg">Mnemonic</th>
                              <th className="p-2">Full Name</th>
                              <th className="p-2">Shift Direction</th>
                              <th className="p-2">Vacancy Bit Fill</th>
                              <th className="p-2">Mathematical Use</th>
                              <th className="p-2 rounded-tr-lg">Carry Flag (CF)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 text-slate-700">
                            <tr className="hover:bg-slate-50">
                              <td className="p-2 font-mono font-extrabold text-indigo-900">SHL</td>
                              <td className="p-2 font-medium">Shift Logical Left</td>
                              <td className="p-2 font-mono text-slate-900">Left (←)</td>
                              <td className="p-2 font-mono text-emerald-700 font-bold">Fills LSB with 0</td>
                              <td className="p-2">Unsigned Multiply by 2<sup>N</sup></td>
                              <td className="p-2 font-mono text-indigo-800">CF ← MSB shifted out</td>
                            </tr>
                            <tr className="hover:bg-slate-50 bg-slate-50/50">
                              <td className="p-2 font-mono font-extrabold text-indigo-900">SAL</td>
                              <td className="p-2 font-medium">Shift Arithmetic Left</td>
                              <td className="p-2 font-mono text-slate-900">Left (←)</td>
                              <td className="p-2 font-mono text-emerald-700 font-bold">Fills LSB with 0 (Identical to SHL)</td>
                              <td className="p-2">Signed Multiply by 2<sup>N</sup></td>
                              <td className="p-2 font-mono text-indigo-800">CF ← MSB shifted out</td>
                            </tr>
                            <tr className="hover:bg-slate-50">
                              <td className="p-2 font-mono font-extrabold text-sky-900">SHR</td>
                              <td className="p-2 font-medium">Shift Logical Right</td>
                              <td className="p-2 font-mono text-slate-900">Right (→)</td>
                              <td className="p-2 font-mono text-sky-700 font-bold">Fills MSB with 0</td>
                              <td className="p-2">Unsigned Divide by 2<sup>N</sup></td>
                              <td className="p-2 font-mono text-indigo-800">CF ← LSB shifted out</td>
                            </tr>
                            <tr className="hover:bg-slate-50 bg-amber-50/30">
                              <td className="p-2 font-mono font-extrabold text-amber-900">SAR</td>
                              <td className="p-2 font-medium">Shift Arithmetic Right</td>
                              <td className="p-2 font-mono text-slate-900">Right (→)</td>
                              <td className="p-2 font-mono text-amber-700 font-bold">Preserves Sign Bit (MSB stays same)</td>
                              <td className="p-2">Signed Divide by 2<sup>N</sup></td>
                              <td className="p-2 font-mono text-indigo-800">CF ← LSB shifted out</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="bg-indigo-50/80 p-2.5 rounded-lg border border-indigo-150 text-[11px] text-indigo-950 font-sans space-y-1">
                        <p className="font-bold flex items-center gap-1 text-indigo-900">
                          <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          Key Hardware Insight:
                        </p>
                        <p className="text-slate-700 text-[10.5px]">
                          In 8086 microarchitecture, <strong>SHL</strong> and <strong>SAL</strong> generate the exact same machine code opcode byte (0xD0/0xD2/0xD3 /4). However, <strong>SHR</strong> (Logical Right) fills vacancy bits with <code>0</code>, whereas <strong>SAR</strong> (Arithmetic Right) duplicates the sign bit (MSB) to correctly preserve negative numbers during two's complement division.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div className="bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/40 border border-indigo-200 rounded-2xl p-5 space-y-5 shadow-xs">
                  <div className="flex flex-wrap justify-between items-center gap-3 border-b border-indigo-200/80 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black font-mono uppercase tracking-wider text-indigo-950">
                          {currentCategory === 'Arithmetic' && '8086 ALU Arithmetic Execution Interactive Explorer'}
                          {currentCategory === 'Logical' && '8086 ALU Bitwise & Boolean Logic Interactive Explorer'}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-sans">
                          {currentCategory === 'Arithmetic' && "Simulate binary addition/subtraction, two's complement math, and live status flags computation."}
                          {currentCategory === 'Logical' && 'Simulate bitwise logic operations (AND, OR, XOR, NOT) and live status flags computation.'}
                        </p>
                      </div>
                    </div>

                    {/* Operation Selector Buttons */}
                    <div className="flex items-center gap-1.5 font-mono text-xs bg-indigo-100/70 p-1 rounded-xl border border-indigo-200">
                      <span className="text-[10px] font-bold text-indigo-900 uppercase px-1.5 font-sans">Operation:</span>
                      {availableOps.map(op => (
                        <button
                          key={op}
                          onClick={() => setAluOp(op as any)}
                          className={`px-2.5 py-1 rounded-lg font-extrabold text-[11px] transition-all cursor-pointer ${
                            aluOp === op
                              ? 'bg-indigo-600 text-white shadow-2xs'
                              : 'bg-white text-indigo-900 border border-indigo-200 hover:bg-indigo-50'
                          }`}
                        >
                          {op}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Input Sliders */}
                  <div className="bg-white p-4 rounded-xl border border-indigo-100 space-y-3 shadow-xs font-mono text-xs">
                    <div className="flex items-center justify-between gap-2 text-[10.5px] font-sans text-indigo-900 bg-indigo-50/80 p-2 rounded-lg border border-indigo-150">
                      <span className="font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Live Bi-Directional Sync:
                      </span>
                      <span>
                        {isNotOp 
                          ? <span>NOT is a <strong>unary instruction</strong> operating solely on <strong>AL Register</strong> ({byteHexFormat(aluValA)}). Moving the slider inverts all 8 bits (1's complement).</span>
                          : isNegOp
                          ? <span>NEG is a <strong>unary instruction</strong> operating solely on <strong>AL Register</strong> ({byteHexFormat(aluValA)}). Moving the slider computes 2's complement negation (0 - AL) and updates status flags.</span>
                          : <span>Destination is locked to <strong className="font-mono text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-indigo-200">AL Register</strong> ({byteHexFormat(aluValA)}). Moving either slider updates CPU Registers & ALU Execution in real time.</span>}
                      </span>
                    </div>

                    <div className={isUnaryOp ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
                      {/* Destination (AL) */}
                      <div className="space-y-1.5 bg-indigo-50/50 p-3 rounded-xl border border-indigo-150">
                        <div className="flex justify-between items-center text-indigo-950 font-bold">
                          <span className="flex items-center gap-1.5">
                            {isUnaryOp ? 'Single Operand (AL Register):' : 'Destination (AL Register):'}
                            <span className="text-[9px] font-mono text-indigo-700 bg-indigo-100/80 px-1.5 py-0.5 rounded border border-indigo-200 uppercase font-extrabold">
                              AX Low Byte
                            </span>
                          </span>
                          <span className="text-indigo-700 font-extrabold bg-white px-2 py-0.5 rounded border border-indigo-200">
                            {byteHexFormat(aluValA)} ({aluValA & 0xFF})
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={255}
                          value={aluValA & 0xFF}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setAluValA(val);
                            setRegs(prev => ({ ...prev, AX: (prev.AX & 0xFF00) | (val & 0xFF) }));
                            setBeforeRegs(prev => ({ ...prev, AX: (prev.AX & 0xFF00) | (val & 0xFF) }));
                          }}
                          className="w-full accent-indigo-600 cursor-pointer"
                        />
                        <div className="text-[10px] text-slate-500 font-bold flex justify-between">
                          <span>Binary: {(aluValA & 0xFF).toString(2).padStart(8, '0')}</span>
                          <span>Signed: {((aluValA & 0xFF) > 127 ? (aluValA & 0xFF) - 256 : (aluValA & 0xFF))}</span>
                        </div>
                      </div>

                      {/* Source (Hidden for Unary Ops) */}
                      {!isUnaryOp && (
                        <div className="space-y-1.5 bg-sky-50/50 p-3 rounded-xl border border-sky-150">
                          <div className="flex justify-between items-center text-sky-950 font-bold">
                            <span className="flex items-center gap-1.5">
                              Source (BL / Imm):
                              <span className="text-[9px] font-mono text-sky-700 bg-sky-100/80 px-1.5 py-0.5 rounded border border-sky-200 uppercase font-extrabold">
                                {activeInstruction.opcode.includes('BL') ? `BL Register (${byteHexFormat(aluValB)})` : `Immediate ${byteHexFormat(aluValB)}`}
                              </span>
                            </span>
                            <span className="text-sky-700 font-extrabold bg-white px-2 py-0.5 rounded border border-sky-200">
                              {byteHexFormat(aluValB)} ({aluValB & 0xFF})
                            </span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={255}
                            value={aluValB & 0xFF}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setAluValB(val);
                              setRegs(prev => ({ ...prev, BX: (prev.BX & 0xFF00) | (val & 0xFF) }));
                              setBeforeRegs(prev => ({ ...prev, BX: (prev.BX & 0xFF00) | (val & 0xFF) }));
                            }}
                            className="w-full accent-sky-600 cursor-pointer"
                          />
                          <div className="text-[10px] text-slate-500 font-bold flex justify-between">
                            <span>Binary: {(aluValB & 0xFF).toString(2).padStart(8, '0')}</span>
                            <span>Signed: {((aluValB & 0xFF) > 127 ? (aluValB & 0xFF) - 256 : (aluValB & 0xFF))}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Live Bitwise Pipeline Display */}
                  <div className="bg-slate-50 text-slate-900 p-4 rounded-xl space-y-3 font-mono text-xs border border-slate-200">
                    <span className="text-indigo-800 font-bold uppercase tracking-wider text-[11px] block border-b border-slate-200 pb-2">
                      ⚡ Hardware Silicon ALU Bit Pipeline Execution
                    </span>

                    <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1 text-center font-mono">
                      <div className="flex justify-between items-center text-slate-600 text-[11px]">
                        <span>Destination (AL):</span>
                        <span className="text-indigo-700 font-extrabold">{(aluValA & 0xFF).toString(2).padStart(8, '0')}</span>
                        <span className="text-slate-800 font-bold">{byteHexFormat(aluValA)}</span>
                      </div>

                      {!isUnaryOp ? (
                        <div className="flex justify-between items-center text-slate-600 text-[11px]">
                          <span>Source & Op ({aluOp}):</span>
                          <span className="text-amber-700 font-extrabold">{aluOp === 'ADD' ? '+' : aluOp === 'SUB' ? '-' : aluOp === 'AND' ? '&' : aluOp === 'OR' ? '|' : aluOp === 'XOR' ? '^' : aluOp === 'SHL' ? '<< 1' : '>> 1'}</span>
                          <span className="text-slate-800 font-bold">{(aluValB & 0xFF).toString(2).padStart(8, '0')}</span>
                        </div>
                      ) : isNotOp ? (
                        <div className="flex justify-between items-center text-slate-600 text-[11px]">
                          <span>Operation:</span>
                          <span className="text-amber-700 font-extrabold">NOT (Bitwise Invert / 1's Complement)</span>
                          <span className="text-slate-800 font-bold">Unary (No 2nd Operand)</span>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center text-slate-600 text-[11px]">
                          <span>Operation:</span>
                          <span className="text-purple-700 font-extrabold">NEG (Two's Complement Negation: 0 - AL)</span>
                          <span className="text-slate-800 font-bold">Unary (No 2nd Operand)</span>
                        </div>
                      )}

                      <div className="w-full h-[1px] bg-slate-200 my-1" />
                      <div className="flex justify-between items-center text-emerald-800 font-bold text-xs pt-0.5">
                        <span>ALU Result:</span>
                        <span className="text-emerald-900 text-sm font-black bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                          {aluRes.res.toString(2).padStart(8, '0')}
                        </span>
                        <span className="text-amber-800 font-black">{byteHexFormat(aluRes.res)} ({aluRes.res})</span>
                      </div>
                    </div>

                    {/* Compact Evaluated Flags Bar */}
                    {isNotOp ? (
                      <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-[11px] text-amber-950 font-sans font-bold flex flex-wrap items-center justify-between gap-2">
                        <span>Note: In 8086 CPU architecture, the <strong>NOT instruction does NOT modify any flags</strong> (CF, ZF, SF, OF, AF, PF all remain unchanged).</span>
                        <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-amber-300 text-amber-900 font-extrabold">Flags Unaffected</span>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-200 text-[11px] font-mono">
                        <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                          Evaluated Output Flags {isNegOp && '(NEG updates status flags)'}:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { flag: 'CF', val: aluRes.cf },
                            { flag: 'ZF', val: aluRes.zf },
                            { flag: 'SF', val: aluRes.sf },
                            { flag: 'OF', val: aluRes.of },
                            { flag: 'AF', val: aluRes.af },
                            { flag: 'PF', val: aluRes.pf }
                          ].map((item) => (
                            <span
                              key={item.flag}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                                item.val
                                  ? 'bg-indigo-600 text-white font-black shadow-2xs'
                                  : 'bg-slate-200 text-slate-500 font-bold opacity-75'
                              }`}
                            >
                              {item.flag}={item.val}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dedicated Architectural Comparison Card: NOT vs NEG (Format & Execution Breakdown) */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 font-sans">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-indigo-600 text-white rounded-lg">
                          <Layers className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="text-xs font-extrabold font-mono text-slate-900 uppercase tracking-wider">
                            Format & Execution Comparison: NOT vs NEG Instructions
                          </h4>
                          <p className="text-[10.5px] text-slate-500">
                            Key microarchitectural differences between bitwise inversion and arithmetic negation in 8086 CPU EU.
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-extrabold bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded border border-indigo-200">
                        8086 Unary Operations
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {/* NOT Card */}
                      <div className="bg-white border border-amber-200 rounded-xl p-3 space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-amber-100 pb-1.5">
                          <span className="font-mono font-black text-amber-900 text-xs">NOT Instruction (Bitwise Invert)</span>
                          <span className="text-[9px] font-mono font-bold bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">1's Complement</span>
                        </div>
                        <ul className="text-[11px] text-slate-700 space-y-1.5 font-sans">
                          <li><strong className="text-slate-900 font-mono">Format:</strong> Unary format <code className="bg-slate-100 px-1 rounded text-indigo-700 font-mono font-bold">NOT destination</code> (e.g., <code className="font-mono text-slate-800">NOT AL</code>, <code className="font-mono text-slate-800">NOT [BX]</code>). Immediate values are illegal.</li>
                          <li><strong className="text-slate-900 font-mono">Mathematical Logic:</strong> Computes 1's complement (<code className="font-mono text-amber-800 font-bold">Dest ← ~Dest</code>). Inverts every bit (0→1, 1→0) without binary borrows/carries.</li>
                          <li><strong className="text-slate-900 font-mono">Flags Execution:</strong> <span className="text-amber-900 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Flags Unaffected</span>. All status flags (CF, ZF, SF, OF, AF, PF) retain their pre-execution values.</li>
                        </ul>
                      </div>

                      {/* NEG Card */}
                      <div className="bg-white border border-purple-200 rounded-xl p-3 space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-purple-100 pb-1.5">
                          <span className="font-mono font-black text-purple-900 text-xs">NEG Instruction (Arithmetic Negate)</span>
                          <span className="text-[9px] font-mono font-bold bg-purple-50 text-purple-800 px-1.5 py-0.5 rounded border border-purple-200">2's Complement</span>
                        </div>
                        <ul className="text-[11px] text-slate-700 space-y-1.5 font-sans">
                          <li><strong className="text-slate-900 font-mono">Format:</strong> Unary format <code className="bg-slate-100 px-1 rounded text-indigo-700 font-mono font-bold">NEG destination</code> (e.g., <code className="font-mono text-slate-800">NEG AL</code>, <code className="font-mono text-slate-800">NEG [BX]</code>). Immediate values are illegal.</li>
                          <li><strong className="text-slate-900 font-mono">Mathematical Logic:</strong> Computes 2's complement negation (<code className="font-mono text-purple-800 font-bold">Dest ← 0 - Dest</code> or <code className="font-mono text-purple-800 font-bold">~Dest + 1</code>). Reverses algebraic sign.</li>
                          <li><strong className="text-slate-900 font-mono">Flags Execution:</strong> <span className="text-purple-900 font-bold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">Updates All Status Flags</span>. CF=1 for any non-zero operand (0 if operand=0); OF=1 if negating boundary 80H/8000H.</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-indigo-50/80 p-2.5 rounded-lg border border-indigo-150 text-[11px] text-indigo-950 font-sans flex items-center justify-between gap-2 flex-wrap">
                      <span><strong>2's Complement Identity:</strong> <code className="font-mono font-bold text-indigo-900">NEG x = (NOT x) + 1</code></span>
                      <span className="text-[10px] font-mono text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200 font-extrabold">2's Complement = 1's Complement + 1</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 4. DATA TRANSFER EXPLORER */}
            {currentCategory === 'Data Transfer' && (
              <div className="bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 border border-emerald-200 rounded-2xl p-5 space-y-5 shadow-xs">
                <div className="flex flex-wrap justify-between items-center gap-3 border-b border-emerald-200/80 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
                      <ArrowRightLeft className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black font-mono uppercase tracking-wider text-emerald-950">
                        8086 Data Bus & Register / Memory Bus Transfer Explorer
                      </h3>
                      <p className="text-[11px] text-slate-500 font-sans">
                        Visualize data transfers between general registers, stack memory (SS:SP), and memory offsets via the internal data bus.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bus Transfer Visualizer Graphic */}
                <div className="bg-white p-4 rounded-xl border border-emerald-200 space-y-3 shadow-xs font-mono text-xs">
                  <div className="flex justify-between items-center border-b border-emerald-100 pb-2">
                    <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-emerald-600" />
                      Assembly Instruction:
                    </span>
                    <span className="bg-emerald-50 text-emerald-800 font-mono font-extrabold px-3 py-1 rounded-lg border border-emerald-200 text-xs">
                      {transferBusMode === 'mov' && 'MOV AX, BX  ; AX ← BX'}
                      {transferBusMode === 'push' && 'PUSH AX     ; SP ← SP - 2, SS:[SP] ← AX'}
                      {transferBusMode === 'pop' && 'POP DX      ; DX ← SS:[SP], SP ← SP + 2'}
                      {transferBusMode === 'lea' && 'LEA BX, [SI + 0100H] ; Load Effective Address into BX'}
                      {transferBusMode === 'xchg' && 'XCHG AX, BX ; Atomic swap contents of AX and BX'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center py-2 text-center">
                    {/* Source Unit */}
                    <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 space-y-1">
                      <span className="text-[10px] text-emerald-700 uppercase font-bold block">SOURCE ELEMENT</span>
                      <span className="text-sm font-black text-emerald-950 block">
                        {transferBusMode === 'mov' && 'Register BX (5678H)'}
                        {transferBusMode === 'push' && 'Register AX (1234H)'}
                        {transferBusMode === 'pop' && 'Stack RAM SS:FFFCH (1234H)'}
                        {transferBusMode === 'lea' && 'Address Computation SI+0100H'}
                        {transferBusMode === 'xchg' && 'Register AX (1234H)'}
                      </span>
                    </div>

                    {/* Bus Line */}
                    <div className="bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 text-[10px] space-y-1 font-mono shadow-xs">
                      <span className="text-amber-700 font-bold block uppercase">16-BIT SYSTEM DATA BUS</span>
                      <div className="flex justify-center items-center gap-1 text-emerald-700 font-extrabold animate-pulse">
                        <span>◀━━━</span>
                        <span>[ DATA: 1234H ]</span>
                        <span>━━━▶</span>
                      </div>
                    </div>

                    {/* Destination Unit */}
                    <div className="bg-teal-50/80 p-3 rounded-xl border border-teal-200 space-y-1">
                      <span className="text-[10px] text-teal-700 uppercase font-bold block">DESTINATION ELEMENT</span>
                      <span className="text-sm font-black text-teal-950 block">
                        {transferBusMode === 'mov' && 'Register AX'}
                        {transferBusMode === 'push' && 'Stack RAM SS:FFFCH'}
                        {transferBusMode === 'pop' && 'Register DX'}
                        {transferBusMode === 'lea' && 'Register BX (Address Offset)'}
                        {transferBusMode === 'xchg' && 'Register BX'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 text-emerald-950 p-3.5 rounded-xl text-xs font-mono border border-emerald-200 flex justify-between items-center">
                  <span className="text-emerald-800 font-bold">💡 Architectural Note:</span>
                  <span className="text-emerald-900 text-[11px]">
                    Data Transfer instructions in the 8086 <strong>never affect status flags</strong> (except SAHF/POPF which directly write the flag register).
                  </span>
                </div>
              </div>
            )}

            {/* 5. STRING OPERATIONS & PORT I/O EXPLORER */}
            {(currentCategory === 'String & Port' || currentCategory === 'String' || currentCategory === 'I/O') && (() => {
              const sourceBuffer = ['H', 'E', 'L', 'L', 'O', '!', '8', '6'];

              const isIoOp = stringActiveOp === 'IN' || stringActiveOp === 'OUT';

              const stringSyntaxMap: Record<string, {
                syntax: string;
                alternateSyntax?: string;
                opcode: string;
                format: string;
                operands: string;
                action: string;
                flagsAffected: string;
              }> = {
                MOVSB: {
                  syntax: 'MOVSB',
                  alternateSyntax: 'REP MOVSB / MOVSW / REP MOVSW',
                  opcode: 'A4h (MOVSB) / A5h (MOVSW)',
                  format: 'MOVSB (Move String Byte)',
                  operands: 'Implicit: Source DS:SI, Destination ES:DI',
                  action: 'ES:[DI] ← DS:[SI]; SI ← SI ± 1/2; DI ← DI ± 1/2',
                  flagsAffected: 'None (Flags unaffected)',
                },
                LODSB: {
                  syntax: 'LODSB',
                  alternateSyntax: 'LODSW',
                  opcode: 'ACh (LODSB) / ADh (LODSW)',
                  format: 'LODSB (Load String Byte into AL)',
                  operands: 'Implicit: Source DS:SI, Destination AL (or AX)',
                  action: 'AL ← DS:[SI]; SI ← SI ± 1/2',
                  flagsAffected: 'None (Flags unaffected)',
                },
                STOSB: {
                  syntax: 'STOSB',
                  alternateSyntax: 'REP STOSB / STOSW / REP STOSW',
                  opcode: 'AAh (STOSB) / ABh (STOSW)',
                  format: 'STOSB (Store AL into String Byte)',
                  operands: 'Implicit: Source AL (or AX), Destination ES:DI',
                  action: 'ES:[DI] ← AL; DI ← DI ± 1/2',
                  flagsAffected: 'None (Flags unaffected)',
                },
                CMPSB: {
                  syntax: 'CMPSB',
                  alternateSyntax: 'REPE CMPSB / REPNE CMPSB / CMPSW',
                  opcode: 'A6h (CMPSB) / A7h (CMPSW)',
                  format: 'CMPSB (Compare String Bytes)',
                  operands: 'Implicit: Operand1 DS:SI, Operand2 ES:DI',
                  action: 'Temp ← DS:[SI] - ES:[DI]; SI ← SI ± 1/2; DI ← DI ± 1/2',
                  flagsAffected: 'ZF, CF, SF, OF, AF, PF (Updates flags based on difference)',
                },
                SCASB: {
                  syntax: 'SCASB',
                  alternateSyntax: 'REPE SCASB / REPNE SCASB / SCASW',
                  opcode: 'AEh (SCASB) / AFh (SCASW)',
                  format: 'SCASB (Scan String Byte for AL)',
                  operands: 'Implicit: Target AL, String ES:DI',
                  action: 'Temp ← AL - ES:[DI]; DI ← DI ± 1/2',
                  flagsAffected: 'ZF, CF, SF, OF, AF, PF (Updates flags based on match)',
                },
                IN: {
                  syntax: 'IN AL, port8',
                  alternateSyntax: 'IN AX, DX / IN AL, DX / IN AX, port8',
                  opcode: 'E4h ib (Direct Port) / ECh (Indirect DX Port)',
                  format: 'IN accumulator, port',
                  operands: 'Destination: AL (or AX); Source: Immediate Port (00H-FFH) or Register DX (0000H-FFFFH)',
                  action: 'AL ← Port[port8] or AL ← Port[DX]',
                  flagsAffected: 'None (Flags unaffected)',
                },
                OUT: {
                  syntax: 'OUT port8, AL',
                  alternateSyntax: 'OUT DX, AX / OUT DX, AL / OUT port8, AX',
                  opcode: 'E6h ib (Direct Port) / EEh (Indirect DX Port)',
                  format: 'OUT port, accumulator',
                  operands: 'Destination: Immediate Port (00H-FFH) or Register DX; Source: AL (or AX)',
                  action: 'Port[port8] ← AL or Port[DX] ← AL',
                  flagsAffected: 'None (Flags unaffected)',
                },
              };

              const curStringInfo = stringSyntaxMap[stringActiveOp] || stringSyntaxMap['MOVSB'];
              
              // Calculate pointer values based on stringStepIndex and stringDf
              const step = stringStepIndex;
              const siAddr = stringDf === 0 ? 0x0100 + step : 0x0100 - step;
              const diAddr = stringDf === 0 ? 0x0200 + step : 0x0200 - step;
              const remainingCx = Math.max(0, stringCx - step);

              const curSourceByte = sourceBuffer[step % sourceBuffer.length] || '0';
              const curSourceHex = curSourceByte.charCodeAt(0).toString(16).toUpperCase();

              return (
                <div className="bg-gradient-to-br from-teal-50/80 via-white to-cyan-50/50 border border-teal-200 rounded-2xl p-5 space-y-5 shadow-xs">
                  <div className="flex flex-wrap justify-between items-center gap-3 border-b border-teal-200 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-teal-600 text-white rounded-xl shadow-xs">
                        <Repeat className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black font-mono uppercase tracking-wider text-teal-950">
                          8086 Interactive String Manipulation & Port I/O Simulator
                        </h3>
                        <p className="text-[11px] text-slate-500 font-sans">
                          Simulate string block operations with DS:SI & ES:DI auto-indexing pointers alongside hardware peripheral I/O port bus transfers.
                        </p>
                      </div>
                    </div>

                    {!isIoOp && (
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Direction Flag (DF):</span>
                        <button
                          onClick={() => setStringDf(stringDf === 0 ? 1 : 0)}
                          className={`px-3 py-1 rounded-lg font-extrabold transition-all cursor-pointer ${
                            stringDf === 0
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-rose-600 text-white shadow-2xs'
                          }`}
                        >
                          {stringDf === 0 ? 'CLD (DF=0 Auto-Inc +1)' : 'STD (DF=1 Auto-Dec -1)'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Operation Selector Tabs */}
                  <div className="space-y-2 font-mono">
                    <span className="text-xs font-bold text-teal-950 uppercase tracking-wider block">
                      Select String or Port Instruction to Simulate:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                      {[
                        { op: 'MOVSB', name: 'MOVSB', desc: 'DS:SI ➔ ES:DI' },
                        { op: 'LODSB', name: 'LODSB', desc: 'DS:SI ➔ AL' },
                        { op: 'STOSB', name: 'STOSB', desc: 'AL ➔ ES:DI' },
                        { op: 'CMPSB', name: 'CMPSB', desc: 'DS:SI vs ES:DI' },
                        { op: 'SCASB', name: 'SCASB', desc: 'AL vs ES:DI' },
                        { op: 'IN', name: 'IN AL, Port', desc: 'Port ➔ AL' },
                        { op: 'OUT', name: 'OUT Port, AL', desc: 'AL ➔ Port' },
                      ].map((o) => (
                        <button
                          key={o.op}
                          onClick={() => {
                            setStringActiveOp(o.op as any);
                            setStringStepIndex(0);
                          }}
                          className={`p-2 rounded-xl border text-xs text-left transition-all cursor-pointer flex flex-col justify-between ${
                            stringActiveOp === o.op
                              ? 'bg-teal-600 text-white border-teal-700 font-bold shadow-sm scale-[1.02]'
                              : 'bg-white text-slate-800 border-slate-200 hover:bg-teal-50 font-semibold'
                          }`}
                        >
                          <span className="font-bold">{o.name}</span>
                          <span className={`text-[9.5px] ${stringActiveOp === o.op ? 'text-teal-200' : 'text-slate-400'}`}>{o.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic String & Port Instruction Syntax & Format Banner */}
                  <div className="bg-gradient-to-br from-teal-50/80 via-white to-cyan-50/70 text-slate-800 p-3.5 sm:p-4 rounded-xl border border-teal-200/80 font-mono text-xs space-y-2.5 shadow-2xs">
                    <div className="flex justify-between items-center border-b border-teal-150 pb-1.5 flex-wrap gap-2">
                      <span className="text-[11px] font-extrabold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 text-teal-600" />
                        Simulated 8086 Instruction Syntax & Format:
                      </span>
                      <span className="text-[10px] bg-white text-teal-900 px-2 py-0.5 rounded border border-teal-200 font-bold shadow-2xs">
                        {curStringInfo.format}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {/* Assembly Syntax & Opcodes */}
                      <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-teal-150 space-y-1 shadow-2xs">
                        <span className="text-[10px] text-slate-500 block font-bold uppercase">Assembly Syntax & Variants:</span>
                        <div className="text-sm font-black text-teal-950">
                          <code>{curStringInfo.syntax}</code>
                          {curStringInfo.alternateSyntax && (
                            <span className="text-xs text-slate-500 font-normal block pt-0.5">
                              Variants / Prefixes: <code className="text-teal-800">{curStringInfo.alternateSyntax}</code>
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-600 font-sans pt-1">
                          <strong>Opcode Encoding:</strong> <code className="text-teal-700 font-mono">{curStringInfo.opcode}</code>
                        </div>
                      </div>

                      {/* Operands & Action */}
                      <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-teal-150 space-y-1 shadow-2xs">
                        <span className="text-[10px] text-slate-500 block font-bold uppercase">Operands & CPU Execution:</span>
                        <div className="text-xs text-slate-700 font-sans leading-snug">
                          <strong>Operands:</strong> {curStringInfo.operands}<br />
                          <strong>Action:</strong> <code className="text-emerald-700 font-mono">{curStringInfo.action}</code><br />
                          <strong>Flags:</strong> {curStringInfo.flagsAffected}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Interactive Work Area */}
                  {!isIoOp ? (
                    /* STRING BLOCK OPERATIONS INTERFACE */
                    <div className="space-y-4 font-mono">
                      {/* String Controls & Parameters Bar */}
                      <div className="bg-white p-4 rounded-xl border border-teal-150 space-y-3 shadow-xs">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          {/* CX Stepper */}
                          <div className="space-y-1.5 bg-teal-50/60 p-3 rounded-xl border border-teal-200">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-teal-950">Repeat Count (CX):</span>
                              <span className="bg-teal-600 text-white px-2 py-0.5 rounded font-black text-xs">
                                CX = {stringCx}
                              </span>
                            </div>
                            <input
                              type="range"
                              min={1}
                              max={8}
                              value={stringCx}
                              onChange={(e) => {
                                setStringCx(Number(e.target.value));
                                setStringStepIndex(0);
                              }}
                              className="w-full accent-teal-600 cursor-pointer"
                            />
                          </div>

                          {/* Accumulator AL Register (for LODSB, STOSB, SCASB) */}
                          <div className="space-y-1.5 bg-cyan-50/60 p-3 rounded-xl border border-cyan-200">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-cyan-950">Accumulator AL:</span>
                              <span className="bg-white px-2 py-0.5 rounded border border-cyan-300 font-extrabold text-cyan-900">
                                AL = '{String.fromCharCode(stringAlReg)}' (0x{stringAlReg.toString(16).toUpperCase()})
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                maxLength={1}
                                value={String.fromCharCode(stringAlReg)}
                                onChange={(e) => setStringAlReg(e.target.value ? e.target.value.charCodeAt(0) : 0x41)}
                                className="w-16 p-1 text-center bg-white border border-cyan-300 rounded font-bold text-cyan-950 uppercase"
                              />
                              <span className="text-[10px] text-slate-500">ASCII Char</span>
                            </div>
                          </div>

                          {/* Step / Run Controls */}
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between">
                            <span className="font-bold text-slate-900 text-xs">Interactive Stepper:</span>
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                onClick={() => setStringStepIndex(prev => Math.min(stringCx, prev + 1))}
                                disabled={stringStepIndex >= stringCx}
                                className="flex-1 py-1.5 bg-teal-600 text-white rounded-lg font-bold text-xs hover:bg-teal-700 disabled:opacity-50 transition-all cursor-pointer shadow-2xs"
                              >
                                Step REP (+1)
                              </button>
                              <button
                                onClick={() => setStringStepIndex(0)}
                                className="px-3 py-1.5 bg-white text-slate-700 border border-slate-300 rounded-lg font-bold text-xs hover:bg-slate-100 transition-all cursor-pointer"
                              >
                                Reset
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Live String Memory Buffers Graphic */}
                      <div className="bg-gradient-to-br from-slate-50 via-white to-teal-50/40 text-slate-800 p-4 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                          <span className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                            Memory String Buffer Visualizer (DS:SI ➔ ES:DI)
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold">
                            Current Step: {stringStepIndex} / {stringCx} (Remaining CX = {remainingCx})
                          </span>
                        </div>

                        {/* Source RAM Buffer (DS:SI) */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[11px] font-bold">
                            <span className="text-sky-900">Source Memory Buffer [DS:0100H]:</span>
                            <span className="text-sky-700 font-mono">SI = 0x{siAddr.toString(16).toUpperCase().padStart(4, '0')}H</span>
                          </div>
                          <div className="grid grid-cols-8 gap-2 text-center text-xs font-bold">
                            {sourceBuffer.slice(0, 8).map((ch, idx) => {
                              const cellAddr = stringDf === 0 ? 0x0100 + idx : 0x0100 - idx;
                              const isCurrent = idx === stringStepIndex;
                              const isProcessed = idx < stringStepIndex;
                              return (
                                <div
                                  key={`src-${idx}`}
                                  className={`p-2 rounded-lg border flex flex-col justify-between transition-all ${
                                    isCurrent
                                      ? 'bg-sky-100 border-sky-500 text-sky-950 scale-105 shadow-sm ring-2 ring-sky-400'
                                      : isProcessed
                                      ? 'bg-teal-50 border-teal-300 text-teal-900'
                                      : 'bg-white border-slate-200 text-slate-600'
                                  }`}
                                >
                                  <span className="text-[9px] text-slate-400">0x{cellAddr.toString(16).toUpperCase()}</span>
                                  <span className="text-sm font-black py-0.5">{ch}</span>
                                  {isCurrent && <span className="text-[9px] bg-sky-500 text-white font-black rounded">SI 📌</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Destination RAM Buffer (ES:DI) */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[11px] font-bold">
                            <span className="text-emerald-900">Destination Memory Buffer [ES:0200H]:</span>
                            <span className="text-emerald-700 font-mono">DI = 0x{diAddr.toString(16).toUpperCase().padStart(4, '0')}H</span>
                          </div>
                          <div className="grid grid-cols-8 gap-2 text-center text-xs font-bold">
                            {sourceBuffer.slice(0, 8).map((ch, idx) => {
                              const cellAddr = stringDf === 0 ? 0x0200 + idx : 0x0200 - idx;
                              const isCurrent = idx === stringStepIndex;
                              const isProcessed = idx < stringStepIndex;
                              const displayVal = (stringActiveOp === 'MOVSB' || stringActiveOp === 'STOSB')
                                ? (isProcessed ? (stringActiveOp === 'STOSB' ? String.fromCharCode(stringAlReg) : sourceBuffer[idx]) : '_')
                                : '_';

                              return (
                                <div
                                  key={`dst-${idx}`}
                                  className={`p-2 rounded-lg border flex flex-col justify-between transition-all ${
                                    isCurrent
                                      ? 'bg-emerald-100 border-emerald-500 text-emerald-950 scale-105 shadow-sm ring-2 ring-emerald-400'
                                      : isProcessed
                                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                      : 'bg-white border-slate-200 text-slate-600'
                                  }`}
                                >
                                  <span className="text-[9px] text-slate-400">0x{cellAddr.toString(16).toUpperCase()}</span>
                                  <span className="text-sm font-black py-0.5">{displayVal}</span>
                                  {isCurrent && <span className="text-[9px] bg-emerald-600 text-white font-black rounded">DI 📌</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Step Execution Result Line */}
                      <div className="bg-teal-500/10 border border-teal-300 p-3.5 rounded-xl text-teal-950 text-xs font-mono space-y-1">
                        <span className="font-bold text-teal-900 block uppercase">
                          ⚡ Step {stringStepIndex} Action Summary:
                        </span>
                        <p className="font-sans leading-relaxed text-xs sm:text-sm">
                          {stringActiveOp === 'MOVSB' && `Copied byte '${curSourceByte}' (0x${curSourceHex}) from DS:[0x${(0x0100 + stringStepIndex).toString(16).toUpperCase()}] to ES:[0x${(0x0200 + stringStepIndex).toString(16).toUpperCase()}]. ${stringDf === 0 ? 'SI & DI auto-incremented (+1)' : 'SI & DI auto-decremented (-1)'}.`}
                          {stringActiveOp === 'LODSB' && `Loaded byte '${curSourceByte}' (0x${curSourceHex}) from DS:[0x${(0x0100 + stringStepIndex).toString(16).toUpperCase()}] into Accumulator AL.`}
                          {stringActiveOp === 'STOSB' && `Stored byte '${String.fromCharCode(stringAlReg)}' (0x${stringAlReg.toString(16).toUpperCase()}) from AL into ES:[0x${(0x0200 + stringStepIndex).toString(16).toUpperCase()}].`}
                          {stringActiveOp === 'CMPSB' && `Compared DS:[0x${(0x0100 + stringStepIndex).toString(16).toUpperCase()}] ('${curSourceByte}') with ES:[0x${(0x0200 + stringStepIndex).toString(16).toUpperCase()}] ('_'). Updated Zero Flag (ZF).`}
                          {stringActiveOp === 'SCASB' && `Scanned ES:[0x${(0x0200 + stringStepIndex).toString(16).toUpperCase()}] for AL ('${String.fromCharCode(stringAlReg)}'). Updated Zero Flag (ZF).`}
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* HARDWARE I/O PORT INTERFACE */
                    <div className="space-y-4 font-mono">
                      {/* Port Address & Data Controls */}
                      <div className="bg-white p-4 rounded-xl border border-rose-150 space-y-3 shadow-xs">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-2 bg-rose-50/60 p-3 rounded-xl border border-rose-200">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-rose-950">Peripheral I/O Port Address:</span>
                              <span className="bg-rose-600 text-white px-2.5 py-0.5 rounded font-black text-xs">
                                Port 0x{ioPort.toString(16).toUpperCase().padStart(2, '0')}H ({ioPort})
                              </span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={255}
                              value={ioPort & 0xFF}
                              onChange={(e) => setIoPort(Number(e.target.value))}
                              className="w-full accent-rose-600 cursor-pointer"
                            />
                          </div>

                          <div className="space-y-2 bg-amber-50/60 p-3 rounded-xl border border-amber-200">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-amber-950">Transferred Data Byte:</span>
                              <span className="bg-white px-2 py-0.5 rounded border border-amber-300 font-extrabold text-amber-900">
                                0x{ioDataByte.toString(16).toUpperCase().padStart(2, '0')}H ('{String.fromCharCode(ioDataByte)}')
                              </span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={255}
                              value={ioDataByte & 0xFF}
                              onChange={(e) => setIoDataByte(Number(e.target.value))}
                              className="w-full accent-amber-600 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Hardware Bus Line Analyzer */}
                      <div className="bg-gradient-to-br from-rose-50/60 via-white to-amber-50/60 text-slate-800 p-4 rounded-xl border border-rose-200/80 shadow-2xs space-y-3">
                        <span className="text-xs font-bold text-rose-900 uppercase tracking-wider block border-b border-rose-200 pb-2">
                          ⚡ 8086 Hardware Peripheral Bus Strobe Analyzer:
                        </span>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs font-bold">
                          <div className="bg-white p-2.5 rounded-lg border border-rose-200 shadow-2xs">
                            <span className="text-[9px] text-slate-500 block uppercase">M/IO# Pin Signal</span>
                            <span className="text-rose-700 font-black text-sm">0 (LOW = I/O)</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-lg border border-rose-200 shadow-2xs">
                            <span className="text-[9px] text-slate-500 block uppercase">Control Strobe</span>
                            <span className="text-amber-800 font-black text-sm">{stringActiveOp === 'IN' ? 'RD# Active Low' : 'WR# Active Low'}</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-lg border border-rose-200 shadow-2xs">
                            <span className="text-[9px] text-slate-500 block uppercase">Address Bus (A0–A7)</span>
                            <span className="text-emerald-800 font-black text-sm">0x{ioPort.toString(16).toUpperCase().padStart(2, '0')}H</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-lg border border-rose-200 shadow-2xs">
                            <span className="text-[9px] text-slate-500 block uppercase">Data Bus (D0–D7)</span>
                            <span className="text-sky-800 font-black text-sm">0x{ioDataByte.toString(16).toUpperCase().padStart(2, '0')}H</span>
                          </div>
                        </div>
                      </div>

                      {/* I/O Result Summary */}
                      <div className="bg-rose-500/10 border border-rose-300 p-3.5 rounded-xl text-rose-950 text-xs font-mono space-y-1">
                        <span className="font-bold text-rose-900 block uppercase">
                          ⚡ Peripheral Hardware Bus Action:
                        </span>
                        <p className="font-sans leading-relaxed text-xs sm:text-sm">
                          {stringActiveOp === 'IN'
                            ? `Executed IN AL, 0x${ioPort.toString(16).toUpperCase()}H: Read byte 0x${ioDataByte.toString(16).toUpperCase()}H from hardware peripheral chip at Port 0x${ioPort.toString(16).toUpperCase()}H directly into Accumulator register AL.`
                            : `Executed OUT 0x${ioPort.toString(16).toUpperCase()}H, AL: Transferred byte 0x${ioDataByte.toString(16).toUpperCase()}H from Accumulator register AL out to peripheral hardware chip at Port 0x${ioPort.toString(16).toUpperCase()}H.`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Live Logs Terminal & Math Explanation Section */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
              <span className="text-xs font-mono font-bold text-slate-700 block uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-600 animate-pulse" />
                Silicon execution analyzer logs:
              </span>
              <div className="min-h-[80px] bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700 font-mono text-xs leading-relaxed relative shadow-inner">
                <AnimatePresence mode="wait">
                  {executionState === 'done' ? (
                    <motion.div
                      key="explain-done"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-2"
                    >
                      <p className="text-emerald-700 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        [CPU CORE]: Instruction retirement successful
                      </p>
                      <p className="text-slate-600 pl-4 leading-relaxed text-justify">{lastExplanation}</p>
                    </motion.div>
                  ) : executionState !== 'idle' ? (
                    <motion.div 
                      key="explain-executing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-1.5"
                    >
                      <p className="text-indigo-700 animate-pulse uppercase tracking-wider text-[10px] font-bold">[CPU CORE]: Executing instruction...</p>
                      <p className="text-slate-500 pl-4">Updating register files and processor flags state</p>
                    </motion.div>
                  ) : (
                    <div className="text-slate-400 italic text-center py-2.5 flex flex-col items-center justify-center gap-1.5">
                      <Info className="w-5 h-5 text-indigo-600/50" />
                      <span className="text-xs text-slate-500">Select an instruction, adjust registers if needed, then click "Run Instruction" to execute.</span>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </>
        )}

      </div>
    )}

  </div>

  {/* Mobile Sticky Floating Quick Execution Console */}
  <div className="lg:hidden sticky bottom-3 z-40 bg-white/95 backdrop-blur-md text-slate-800 p-3 rounded-2xl border border-slate-200 shadow-xl flex items-center justify-between gap-3 font-mono mt-4">
    <div className="flex items-center gap-2.5 overflow-hidden">
      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
      <div className="truncate">
        <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Active Inst</span>
        <span className="text-xs font-bold text-indigo-700 truncate block">{displayOpcode}</span>
      </div>
    </div>

    <div className="flex items-center gap-2 shrink-0">
      <button
        onClick={handleExecute}
        disabled={executionState !== 'idle' && executionState !== 'done'}
        className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-45 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer font-sans"
      >
        <Play className="w-3.5 h-3.5 fill-current" />
        <span>Run</span>
      </button>
      <button
        onClick={handleReset}
        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center shadow-xs active:scale-95 cursor-pointer"
        title="Reset CPU Registers"
      >
        <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
      </button>
    </div>
  </div>

</div>
)}

      {/* TAB 2: INSTRUCTION GROUPS */}
      {activeMainTab === 'groups' && (
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-extrabold font-mono uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              8086 Instruction Set Groups Breakdown
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              The 8086 instruction set supports over 20,000 instruction variations categorized into 6 core functional groups:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {[
                {
                  title: '1. Data Copy / Transfer Instructions',
                  opcodes: 'MOV, XCHG, XLAT, LEA, LDS/LES, PUSH, POP',
                  desc: 'Copies or transfers data between registers, memory segments, and stack. Does not modify status flags.',
                  example: 'MOV CX, 037AH | LEA BX, PRICES | PUSH AX',
                  color: 'border-indigo-200 bg-white text-indigo-950'
                },
                {
                  title: '2. Arithmetic Instructions',
                  opcodes: 'ADD, ADC, SUB, SBB, MUL, IMUL, DIV, IDIV, INC, DEC, CMP, AAA, AAS, AAM, AAD, DAA, DAS, CBW, CWD',
                  desc: 'Executes binary, signed/unsigned arithmetic, and packed/unpacked BCD & ASCII adjustment ops. Updates status flags (CF, ZF, SF, OF, AF, PF).',
                  example: 'ADD AL, BL | SUB AX, BX | DAA | CBW',
                  color: 'border-emerald-200 bg-white text-emerald-950'
                },
                {
                  title: '3. Logical Instructions',
                  opcodes: 'AND, OR, NOT, NEG, XOR, TEST',
                  desc: 'Performs boolean bitwise operations, masking, and 2\'s complement negation. Forces CF & OF to 0.',
                  example: 'AND AL, 0FH | XOR AX, AX | NEG BL',
                  color: 'border-sky-200 bg-white text-sky-950'
                },
                {
                  title: '4. Shift & Rotate Instructions',
                  opcodes: 'SHL, SAL, SHR, SAR, ROL, ROR, RCL, RCR',
                  desc: 'Performs bitwise shifts and rotates across registers/memory. Bit bits enter Carry Flag (CF).',
                  example: 'SHL CX, 1 | SHR AX, CL | ROL AL, 1',
                  color: 'border-cyan-200 bg-white text-cyan-950'
                },
                {
                  title: '5. Branch Instructions',
                  opcodes: 'JA, JAE, JB, JBE, JE, JNE, JG, JGE, JL, JLE, JC, JO, JS, JNP, JP, JMP, CALL, RET',
                  desc: 'Alters execution sequence based on condition flags or unconditional branch/subroutine calls.',
                  example: 'JMP 0150H | CALL 0200H | RET',
                  color: 'border-rose-200 bg-white text-rose-950'
                },
                {
                  title: '6. Loop Instructions',
                  opcodes: 'LOOP, LOOPE, LOOPNE, JCXZ',
                  desc: 'Performs iterative loop control based on CX register count and status flags.',
                  example: 'LOOP 0100H | JCXZ DONE',
                  color: 'border-purple-200 bg-white text-purple-950'
                },
                {
                  title: '7. Machine Control Instructions',
                  opcodes: 'HLT, LOCK, NOP, ESC, WAIT',
                  desc: 'Controls CPU execution state, bus synchronization prefix, or co-processor interface.',
                  example: 'LOCK XCHG [SI], AL | HLT',
                  color: 'border-orange-200 bg-white text-orange-950'
                },
                {
                  title: '8. Flag Manipulation Instructions',
                  opcodes: 'STC, CLC, CMC, STD, CLD, STI, CLI, LAHF, SAHF',
                  desc: 'Directly sets, clears, or complements Carry (CF), Direction (DF), or Interrupt (IF) flags, or transfers flags to/from AH.',
                  example: 'STC | CLC | LAHF | SAHF | CLD',
                  color: 'border-amber-200 bg-white text-amber-950'
                },
                {
                  title: '9. String & Port (I/O & Misc) Instructions',
                  opcodes: 'MOVS/MOVSB/MOVSW, LODS, STOS, CMPS, SCAS, REP, IN, OUT',
                  desc: 'Performs block memory operations using DS:SI, ES:DI, and CX, as well as peripheral hardware port transfers via AL/AX and DX.',
                  example: 'REP MOVSB | IN AL, 0C8H | OUT DX, AL',
                  color: 'border-teal-200 bg-white text-teal-950'
                }
              ].map((grp, idx) => (
                <div key={idx} className={`p-4 border rounded-2xl space-y-2.5 shadow-xs flex flex-col justify-between ${grp.color}`}>
                  <div className="space-y-1.5">
                    <span className="font-extrabold text-xs font-mono uppercase block text-slate-900">{grp.title}</span>
                    <div className="text-[10px] font-mono font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-1 rounded-md">
                      {grp.opcodes}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-sans">{grp.desc}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 font-mono text-[11px] text-slate-500">
                    <strong className="text-slate-800">Example: </strong>
                    <code className="text-indigo-600 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">{grp.example}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BRANCHING INSTRUCTIONS MASTER SUMMARY TABLE */}
      {activeMainTab === 'branching' && (
        <div className="space-y-4">
          <BranchingInstructionsTable />
        </div>
      )}

      {/* TAB 3: QUICK COMPARISON MATRIX */}
      {activeMainTab === 'comparison' && (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-extrabold font-mono uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Quick Comparison Matrix: 8086 Instruction Groups
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs bg-white">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-100 font-mono text-[11px] font-bold uppercase text-indigo-950 border-b border-slate-200">
                  <tr>
                    <th className="p-3 border-r border-slate-200">Instruction Group</th>
                    <th className="p-3 border-r border-slate-200">Key Opcodes</th>
                    <th className="p-3 border-r border-slate-200">Primary Function</th>
                    <th className="p-3 border-r border-slate-200">Operand & Address Rules</th>
                    <th className="p-3 border-r border-slate-200">Flag Effect</th>
                    <th className="p-3">Sample Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 font-medium text-slate-700">
                  {[
                    {
                      grp: 'Data Transfer',
                      op: 'MOV, PUSH, POP, LEA, XCHG',
                      func: 'Copies / moves data between registers, memory, & stack',
                      rules: 'No memory-to-memory; Segment reg requires gen reg',
                      flags: 'None (except POPF)',
                      ex: 'MOV AX, [BX]'
                    },
                    {
                      grp: 'Arithmetic',
                      op: 'ADD, ADC, SUB, SBB, INC, DEC, MUL, IMUL, DIV, IDIV, CMP',
                      func: 'Binary, 2\'s complement, signed & unsigned math (MUL/IMUL, DIV/IDIV) & comparison',
                      rules: 'Updates destination; MUL/IMUL/DIV/IDIV use AL/AX/DX implicitly',
                      flags: 'CF, ZF, SF, OF, AF, PF',
                      ex: 'ADD AX, 1000H | IMUL BL'
                    },
                    {
                      grp: 'Logical',
                      op: 'AND, OR, XOR, NOT, TEST',
                      func: 'Boolean logic operations, bit masking, & testing',
                      rules: 'Logical ops force CF = 0 and OF = 0; NOT leaves flags unchanged',
                      flags: 'Clears CF/OF, updates ZF/SF/PF',
                      ex: 'AND AL, 0FH | XOR AX, AX'
                    },
                    {
                      grp: 'Bitwise / Shifts',
                      op: 'NEG, SHL, SHR, SAR, ROL, ROR',
                      func: 'Bit shifts, bit rotations, and 2\'s complement negation',
                      rules: 'Shifts use immediate 1 or CL register for count > 1',
                      flags: 'CF receives last shifted bit; OF updated for single shift',
                      ex: 'SHL CX, 1 | NEG BL'
                    },
                    {
                      grp: 'BCD / ASCII',
                      op: 'DAA, DAS, AAA, AAS, AAM, AAD',
                      func: 'Decimal & ASCII result adjustment',
                      rules: 'Operates primarily on AL register after math',
                      flags: 'AF, CF, ZF updated as required',
                      ex: 'DAA'
                    },
                    {
                      grp: 'String',
                      op: 'MOVSB, CMPSB, LODSB, STOSB, REP',
                      func: 'Block memory transfer, comparison, and scanning',
                      rules: 'Source = DS:SI, Destination = ES:DI, Count = CX',
                      flags: 'REP uses CX; DF controls direction',
                      ex: 'REP MOVSB'
                    },
                    {
                      grp: 'Control',
                      op: 'JMP, JZ, JNZ, LOOP, CALL, RET, LOCK',
                      func: 'Program control, branching, loops, procedures, & synchronization',
                      rules: 'Target is label, offset, or register address',
                      flags: 'Reads flags (ZF, CF, SF) for jumps',
                      ex: 'JMP 0150H | LOOP 0100H'
                    },
                    {
                      grp: 'Flag',
                      op: 'STC, CLC, CMC, LAHF, SAHF, STD, CLD',
                      func: 'Direct flag manipulation & flag-register transfer',
                      rules: 'Implied operands; operates directly on flags / AH',
                      flags: 'Modifies targeted flags (CF, DF, SF, ZF, etc.)',
                      ex: 'STC | LAHF | SAHF'
                    },
                    {
                      grp: 'I/O',
                      op: 'IN, OUT',
                      func: 'Transfers data between accumulator (AL/AX) and I/O ports',
                      rules: 'Fixed port (8-bit) or DX register (16-bit port)',
                      flags: 'Does not affect flags',
                      ex: 'IN AL, 0C8H | OUT DX, AL'
                    }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-indigo-50/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-indigo-900 bg-slate-50/50 border-r border-slate-200">
                        {row.grp}
                      </td>
                      <td className="p-3 font-mono text-[11px] font-bold text-slate-800 border-r border-slate-200">
                        {row.op}
                      </td>
                      <td className="p-3 leading-relaxed border-r border-slate-200">
                        {row.func}
                      </td>
                      <td className="p-3 text-[11px] border-r border-slate-200">
                        {row.rules}
                      </td>
                      <td className="p-3 text-[11px] font-mono text-emerald-800 font-bold border-r border-slate-200">
                        {row.flags}
                      </td>
                      <td className="p-3 font-mono text-indigo-700 font-bold">
                        {row.ex}
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
      {activeMainTab === 'remember' && (
        <div className="space-y-5">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xl">🧠</span>
              <h3 className="text-sm font-extrabold font-mono uppercase tracking-wider text-amber-950">
                Remember - Essential 8086 Instruction Rules & Takeaways
              </h3>
            </div>

            {/* 3 Pillar Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-amber-200 text-center shadow-xs">
                <span className="text-[10px] font-mono text-amber-700 font-bold block uppercase">Core Rule 1</span>
                <span className="text-xs font-black font-mono text-rose-900 mt-1 block">NO MEMORY-TO-MEMORY</span>
                <span className="text-[10px] text-slate-500 font-sans block mt-1">Both operands cannot be memory locations</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-amber-200 text-center shadow-xs">
                <span className="text-[10px] font-mono text-amber-700 font-bold block uppercase">Core Rule 2</span>
                <span className="text-xs font-black font-mono text-indigo-900 mt-1 block">STRING OPERANDS = DS:SI → ES:DI</span>
                <span className="text-[10px] text-slate-500 font-sans block mt-1">Source = DS:SI, Destination = ES:DI, Count = CX</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-amber-200 text-center shadow-xs">
                <span className="text-[10px] font-mono text-amber-700 font-bold block uppercase">Core Rule 3</span>
                <span className="text-xs font-black font-mono text-amber-900 mt-1 block">DIRECTION FLAG = POINTER AUTO-UPDATE</span>
                <span className="text-[10px] text-slate-500 font-sans block mt-1">CLD (DF=0, + increment) | STD (DF=1, - decrement)</span>
              </div>
            </div>

            {/* Execution Pipeline Flow Diagram */}
            <div className="bg-white p-4 rounded-xl font-mono text-xs text-center border border-amber-200 space-y-2 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-amber-800 block tracking-wider">
                Microprocessor Hardware Execution Flow
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold pt-1">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-900 rounded-lg border border-indigo-200">
                  Assembly Opcode
                </span>
                <span className="text-amber-600">→</span>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-200">
                  Fetch Byte(s)
                </span>
                <span className="text-amber-600">→</span>
                <span className="px-3 py-1 bg-sky-50 text-sky-900 rounded-lg border border-sky-200">
                  Calculate Effective Address
                </span>
                <span className="text-amber-600">→</span>
                <span className="px-3 py-1 bg-amber-50 text-amber-900 rounded-lg border border-amber-200">
                  ALU Operation & Flags Update
                </span>
              </div>
            </div>

            {/* Key Facts Checklist */}
            <div className="bg-white p-4 rounded-xl border border-amber-200 space-y-2 text-xs text-slate-700 leading-relaxed font-sans">
              <span className="font-bold text-amber-900 font-mono uppercase text-[11px] block">
                Key Exam & Lab Facts Checklist:
              </span>
              <ul className="list-disc pl-5 space-y-1 font-medium">
                <li>8086 instructions range from 1 byte (e.g. NOP, CLD) up to 6 bytes.</li>
                <li>Immediate data cannot be moved directly into segment registers (e.g., <code>MOV DS, 1000H</code> is illegal; use <code>MOV AX, 1000H</code> then <code>MOV DS, AX</code>).</li>
                <li>Segment registers CS and IP cannot be used as destination operands in standard MOV instructions.</li>
                <li>String instructions (MOVSB/MOVSW) automatically adjust SI and DI by 1 for byte operations or 2 for word operations.</li>
                <li>Multi-byte values are stored in memory using Little-Endian order (Low byte at lower memory address).</li>
              </ul>
            </div>

          </div>
        </div>
      )}

      </div>

      {/* Footer System Details */}
      <div className="text-[10px] text-slate-400 font-mono text-right pt-4 border-t border-sky-150 shrink-0 mt-6 flex justify-between items-center">
        <span>* Emulated instructions strictly match standard Intel 8086 physical states.</span>
        <span>Interactive Instruction Laboratory v2.5 (ECE Micro)</span>
      </div>
    </div>
  );
}

// Helper component for active-high seven segment LED display
function SevenSegmentDisplay({ hexValue }: { hexValue: number }) {
  const isLit = (mask: number) => (hexValue & mask) !== 0;

  // Real LED red glow vs dark dim red
  const activeColor = "fill-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.95)]";
  const inactiveColor = "fill-rose-950/15";

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-neutral-950 border-2 border-neutral-800 rounded-xl shadow-inner w-28 h-36">
      <svg
        viewBox="0 0 100 130"
        className="w-16 h-24 select-none"
        style={{ transform: "skewX(-6deg)" }}
      >
        {/* Segment a */}
        <polygon
          points="20,10 70,10 65,18 25,18"
          className={`transition-all duration-250 ${isLit(0x01) ? activeColor : inactiveColor}`}
        />
        {/* Segment f */}
        <polygon
          points="13,14 21,21 21,57 13,63"
          className={`transition-all duration-250 ${isLit(0x20) ? activeColor : inactiveColor}`}
        />
        {/* Segment b */}
        <polygon
          points="79,14 79,63 71,57 71,21"
          className={`transition-all duration-250 ${isLit(0x02) ? activeColor : inactiveColor}`}
        />
        {/* Segment g */}
        <polygon
          points="20,60 70,60 75,65 70,70 20,70 15,65"
          className={`transition-all duration-250 ${isLit(0x40) ? activeColor : inactiveColor}`}
        />
        {/* Segment e */}
        <polygon
          points="13,67 21,73 21,109 13,116"
          className={`transition-all duration-250 ${isLit(0x10) ? activeColor : inactiveColor}`}
        />
        {/* Segment c */}
        <polygon
          points="79,67 79,116 71,109 71,73"
          className={`transition-all duration-250 ${isLit(0x04) ? activeColor : inactiveColor}`}
        />
        {/* Segment d */}
        <polygon
          points="25,112 65,112 70,120 20,120"
          className={`transition-all duration-250 ${isLit(0x08) ? activeColor : inactiveColor}`}
        />
        {/* DP (Decimal point) */}
        <circle
          cx="87"
          cy="116"
          r="4.5"
          className={`transition-all duration-250 ${isLit(0x80) ? activeColor : inactiveColor}`}
        />
      </svg>
    </div>
  );
}
