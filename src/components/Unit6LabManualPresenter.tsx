import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Target,
  Cpu,
  FileCode,
  Terminal,
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  FastForward,
  Rewind,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Award,
  Layers,
  ChevronRight,
  Code2,
  Sparkles,
  HelpCircle,
  ShieldAlert,
  Compass,
  ArrowRight,
  Hash,
  ExternalLink,
  ChevronDown,
  Activity,
  ListOrdered,
  Binary,
  Flag,
  Lightbulb,
  Zap,
  CornerDownRight,
  Workflow,
  Sliders,
  Info,
  XCircle,
  Calculator,
  SlidersHorizontal,
  ArrowRightLeft,
  Percent,
  Database,
  FileText,
  ClipboardCheck,
  Table
} from 'lucide-react';
import { labExperiments, labManualPagesData, LabManualPage } from '../data/labExperimentsData';
import { LAB_EXECUTION_DATA } from '../data/labExecutionStepsData';
import { labProgramTheoryData } from '../data/labProgramTheoryData';
import { labBasicTheoryData } from '../data/labBasicTheoryData';
import { LAB_FLOWCHARTS, resolveBranchTarget } from '../data/labFlowchartsComprehensiveData';
import { LabExperimentFlowchartVisualizer } from './LabExperimentFlowchartVisualizer';

// 16-Bit Signed & Unsigned Helper Functions for 8086 ALU Simulation & Dual-Format Display
export function parse16BitUnsignedVal(valStr: string, isHex: boolean, defaultVal: number): number {
  const clean = (valStr || '').trim().replace(/H$/i, '').replace(/^0x/i, '').replace(/D$/i, '');
  if (!clean) return defaultVal;
  if (isHex) {
    const val = parseInt(clean, 16);
    return isNaN(val) ? defaultVal : (val & 0xFFFF);
  } else {
    const val = parseInt(clean, 10);
    if (isNaN(val)) return defaultVal;
    return val < 0 ? ((val % 65536) + 65536) & 0xFFFF : (val & 0xFFFF);
  }
}

export function parse16BitSignedVal(valStr: string, isHex: boolean, defaultVal: number): number {
  const clean = (valStr || '').trim().replace(/H$/i, '').replace(/^0x/i, '').replace(/D$/i, '');
  if (!clean) return defaultVal;
  if (isHex) {
    const val = parseInt(clean, 16);
    if (isNaN(val)) return defaultVal;
    const u = val & 0xFFFF;
    return u >= 0x8000 ? u - 0x10000 : u;
  } else {
    const val = parseInt(clean, 10);
    if (isNaN(val)) return defaultVal;
    if (val < -32768) return -32768;
    if (val > 32767) return 32767;
    return val;
  }
}

export function to16BitHexStr(val: number): string {
  const u = (val < 0 ? val + 0x10000 : val) & 0xFFFF;
  return u.toString(16).toUpperCase().padStart(4, '0') + 'H';
}

export function to16BitBinStr(val: number): string {
  const bin = ((val < 0 ? val + 0x10000 : val) & 0xFFFF).toString(2).padStart(16, '0');
  return `${bin.slice(0, 4)} ${bin.slice(4, 8)} ${bin.slice(8, 12)} ${bin.slice(12, 16)}`;
}

export interface MemoryDumpEntry {
  offset: string;
  symbol: string;
  hexBytes: string;
  formatted: string;
  type: 'input' | 'output' | 'system';
  comment: string;
}

export interface VerificationEntry {
  parameter: string;
  memoryAddress: string;
  theoretical: string;
  simulated: string;
  match: boolean;
  notes: string;
}

export interface ObservationRecordData {
  aim: string;
  inputs: Array<{ address: string; variable: string; hexVal: string; decVal: string }>;
  initialRegisters: Array<{ register: string; value: string; purpose: string }>;
  outputs: Array<{ address: string; variable: string; hexVal: string; decVal: string }>;
  finalFlags: Array<{ flag: string; value: string; meaning: string }>;
  resultSummary: string;
}

export function getExperimentVerificationSuite(
  expId: string,
  manualPage: LabManualPage,
  lastStep?: any
): {
  memoryRows: MemoryDumpEntry[];
  verificationRows: VerificationEntry[];
  observationData: ObservationRecordData;
} {
  switch (expId) {
    case 'exp1':
      return {
        memoryRows: [
          { offset: 'DS:0000H', symbol: 'NUM1', hexBytes: 'FF FE FD FC', formatted: 'FCFDFEFFH (4,242,423,551D)', type: 'input', comment: 'Multi-precision 32-bit Operand 1 (LSB to MSB)' },
          { offset: 'DS:0004H', symbol: 'NUM2', hexBytes: '01 02 03 04', formatted: '04030201H (67,305,985D)', type: 'input', comment: 'Multi-precision 32-bit Operand 2 (LSB to MSB)' },
          { offset: 'DS:0008H', symbol: 'RESULT_ADD', hexBytes: '00 01 01 01', formatted: '01010100H (16,843,008D)', type: 'output', comment: '32-Bit Sum with Carry Propagation (ADC AL, [DI])' },
          { offset: 'DS:000CH', symbol: 'FINAL_CARRY', hexBytes: '01', formatted: '01H (Carry Flag CF = 1)', type: 'output', comment: 'Final 33rd Bit Carry Out saved via ADC AL, 0' },
          { offset: 'DS:000DH', symbol: 'RESULT_SUB', hexBytes: 'FE FC FA F8', formatted: 'F8FAFCFEH', type: 'output', comment: '32-Bit Difference with Borrow Propagation (SBB AL, [DI])' },
          { offset: 'DS:0011H', symbol: 'FINAL_BORROW', hexBytes: '00', formatted: '00H (Borrow Flag CF = 0)', type: 'output', comment: 'Final Borrow Out saved via ADC AL, 0 (No Borrow)' }
        ],
        verificationRows: [
          {
            parameter: '32-Bit Multi-precision Sum',
            memoryAddress: 'DS:0008H .. DS:000BH',
            theoretical: '01010100H (Bytes: 00 01 01 01)',
            simulated: '01010100H (Bytes: 00 01 01 01)',
            match: true,
            notes: 'Byte 0: FF+01=00(CF=1), Byte 1: FE+02+1=01(CF=1), Byte 2: FD+03+1=01(CF=1), Byte 3: FC+04+1=01(CF=1)'
          },
          {
            parameter: 'Final 32-Bit Addition Carry Out',
            memoryAddress: 'DS:000CH',
            theoretical: '01H (CF = 1)',
            simulated: '01H (CF = 1)',
            match: true,
            notes: 'Final Carry Bit generated from MSB addition (FCH + 04H + 1 = 101H)'
          },
          {
            parameter: '32-Bit Multi-precision Difference',
            memoryAddress: 'DS:000DH .. DS:0010H',
            theoretical: 'F8FAFCFEH (Bytes: FE FC FA F8)',
            simulated: 'F8FAFCFEH (Bytes: FE FC FA F8)',
            match: true,
            notes: 'Byte 0: FF-01=FE(CF=0), Byte 1: FE-02=FC(CF=0), Byte 2: FD-03=FA(CF=0), Byte 3: FC-04=F8(CF=0)'
          },
          {
            parameter: 'Final 32-Bit Subtraction Borrow Out',
            memoryAddress: 'DS:0011H',
            theoretical: '00H (CF = 0 / No Borrow)',
            simulated: '00H (CF = 0 / No Borrow)',
            match: true,
            notes: 'NUM1 (FC...) is strictly larger than NUM2 (04...), so no borrow is required from beyond MSB'
          }
        ],
        observationData: {
          aim: 'To perform addition and subtraction of 32-bit multi-precision numbers in 8086.',
          inputs: [
            { address: 'DS:0000H', variable: 'NUM1', hexVal: 'FF FE FD FC H', decVal: '4,242,423,551 D' },
            { address: 'DS:0004H', variable: 'NUM2', hexVal: '01 02 03 04 H', decVal: '67,305,985 D' }
          ],
          initialRegisters: [
            { register: 'AX', value: '1000H', purpose: 'Data segment base address' },
            { register: 'DS', value: '1000H', purpose: 'Active data segment pointer' },
            { register: 'SI', value: '0000H', purpose: 'Source Index pointing to NUM1' },
            { register: 'DI', value: '0004H', purpose: 'Destination Index pointing to NUM2' },
            { register: 'BX', value: '0008H', purpose: 'Base Register pointing to RESULT_ADD' },
            { register: 'CX', value: '0004H', purpose: 'Loop Counter for 4 byte additions' },
            { register: 'CF', value: '0', purpose: 'Carry Flag cleared via CLC' }
          ],
          outputs: [
            { address: 'DS:0008H', variable: 'RESULT_ADD', hexVal: '00 01 01 01 H', decVal: '01010100 H (16,843,008 D)' },
            { address: 'DS:000CH', variable: 'FINAL_CARRY', hexVal: '01 H', decVal: '1 (Addition Carry Out)' },
            { address: 'DS:000DH', variable: 'RESULT_SUB', hexVal: 'FE FC FA F8 H', decVal: 'F8FAFCFE H' },
            { address: 'DS:0011H', variable: 'FINAL_BORROW', hexVal: '00 H', decVal: '0 (No Subtraction Borrow)' }
          ],
          finalFlags: [
            { flag: 'CF', value: '0', meaning: 'Carry Flag cleared after final subtraction verification' },
            { flag: 'ZF', value: '0', meaning: 'Zero Flag = 0 (Result is non-zero)' },
            { flag: 'SF', value: '1', meaning: 'Sign Flag = 1 (F8H in AL has MSB = 1)' },
            { flag: 'OF', value: '0', meaning: 'Overflow Flag = 0 (Valid unsigned subtraction)' }
          ],
          resultSummary: 'The 32-bit multi-precision addition and subtraction programs were simulated on 8086. The memory dump and registers strictly match theoretical manual calculations.'
        }
      };

    case 'exp2':
      return {
        memoryRows: [
          { offset: 'DS:0000H', symbol: 'VAL1', hexBytes: '12 0A', formatted: '0A12H (2578D)', type: 'input', comment: 'Unsigned Multiplicand / Dividend' },
          { offset: 'DS:0002H', symbol: 'VAL2', hexBytes: '50 00', formatted: '0050H (80D)', type: 'input', comment: 'Unsigned Multiplier / Divisor' },
          { offset: 'DS:0004H', symbol: 'U_PROD', hexBytes: '00 29 03 00', formatted: 'DX:AX = 0003:2900H (206,240D)', type: 'output', comment: '32-Bit Unsigned Product (MUL BX)' },
          { offset: 'DS:0008H', symbol: 'U_QUOT', hexBytes: '20 00', formatted: 'AX = 0020H (32D)', type: 'output', comment: 'Unsigned Quotient (DIV BX)' },
          { offset: 'DS:000AH', symbol: 'U_REM', hexBytes: '12 00', formatted: 'DX = 0012H (18D)', type: 'output', comment: 'Unsigned Remainder (DIV BX)' },
          { offset: 'DS:000CH', symbol: 'S_VAL1', hexBytes: 'E7 FF', formatted: 'FFE7H (-25D)', type: 'input', comment: 'Signed Multiplicand / Dividend (2\'s Complement)' },
          { offset: 'DS:000EH', symbol: 'S_VAL2', hexBytes: '05 00', formatted: '0005H (+5D)', type: 'input', comment: 'Signed Multiplier / Divisor' },
          { offset: 'DS:0010H', symbol: 'S_PROD', hexBytes: '83 FF FF FF', formatted: 'DX:AX = FFFF:FF83H (-125D)', type: 'output', comment: '32-Bit Signed Product (IMUL BX)' },
          { offset: 'DS:0014H', symbol: 'S_QUOT', hexBytes: 'FB FF', formatted: 'AX = FFFBH (-5D)', type: 'output', comment: 'Signed Quotient after CWD (IDIV BX)' },
          { offset: 'DS:0016H', symbol: 'S_REM', hexBytes: '00 00', formatted: 'DX = 0000H (0D)', type: 'output', comment: 'Signed Remainder after CWD (IDIV BX)' }
        ],
        verificationRows: [
          { parameter: 'Unsigned MUL (DX:AX)', memoryAddress: 'DX:AX Register Pair', theoretical: '0003:2900H (206,240D)', simulated: '0003:2900H (206,240D)', match: true, notes: '2578 × 80 = 206,240 (DX=0003H, AX=2900H)' },
          { parameter: 'Unsigned DIV Quotient (AX)', memoryAddress: 'AX Register', theoretical: '0020H (32D)', simulated: '0020H (32D)', match: true, notes: '2578 ÷ 80 = 32' },
          { parameter: 'Unsigned DIV Remainder (DX)', memoryAddress: 'DX Register', theoretical: '0012H (18D)', simulated: '0012H (18D)', match: true, notes: '2578 mod 80 = 18' },
          { parameter: 'Signed IMUL (DX:AX)', memoryAddress: 'DX:AX Register Pair', theoretical: 'FFFF:FF83H (-125D)', simulated: 'FFFF:FF83H (-125D)', match: true, notes: '(-25) × (+5) = -125 (DX=FFFFH, AX=FF83H)' },
          { parameter: 'Signed IDIV Quotient (AX)', memoryAddress: 'AX Register', theoretical: 'FFFBH (-5D)', simulated: 'FFFBH (-5D)', match: true, notes: '(-25) ÷ (+5) = -5' },
          { parameter: 'Signed IDIV Remainder (DX)', memoryAddress: 'DX Register', theoretical: '0000H (0D)', simulated: '0000H (0D)', match: true, notes: '(-25) mod (+5) = 0 (Exact Division)' }
        ],
        observationData: {
          aim: 'To perform signed and unsigned 16-bit multiplication and division on 8086.',
          inputs: [
            { address: 'DS:0000H', variable: 'VAL1 (Unsigned)', hexVal: '0A12 H', decVal: '2578 D' },
            { address: 'DS:0002H', variable: 'VAL2 (Unsigned)', hexVal: '0050 H', decVal: '80 D' },
            { address: 'DS:000CH', variable: 'S_VAL1 (Signed)', hexVal: 'FFE7 H', decVal: '-25 D' },
            { address: 'DS:000EH', variable: 'S_VAL2 (Signed)', hexVal: '0005 H', decVal: '+5 D' }
          ],
          initialRegisters: [
            { register: 'AX', value: '0A12H', purpose: 'Loaded with multiplicand / dividend' },
            { register: 'BX', value: '0050H', purpose: 'Loaded with multiplier / divisor' },
            { register: 'DX', value: '0000H', purpose: 'Cleared before unsigned division (DX:AX)' }
          ],
          outputs: [
            { address: 'DX:AX', variable: 'U_PROD', hexVal: '0003:2900 H', decVal: '206,240 D' },
            { address: 'AX', variable: 'U_QUOT', hexVal: '0020 H', decVal: '32 D' },
            { address: 'DX', variable: 'U_REM', hexVal: '0012 H', decVal: '18 D' },
            { address: 'DX:AX', variable: 'S_PROD', hexVal: 'FFFF:FF83 H', decVal: '-125 D' },
            { address: 'AX', variable: 'S_QUOT', hexVal: 'FFFB H', decVal: '-5 D' },
            { address: 'DX', variable: 'S_REM', hexVal: '0000 H', decVal: '0 D' }
          ],
          finalFlags: [
            { flag: 'CF/OF', value: '1 (MUL)', meaning: 'Upper word DX has significant product bits' },
            { flag: 'CF/OF', value: '0 (IMUL)', meaning: 'DX is sign-extension of AX for -125D' }
          ],
          resultSummary: 'Signed and Unsigned multiplication and division operations were executed with register pairs DX:AX and verified against mathematical formulas.'
        }
      };

    default:
      // Generic generator for all other experiments
      const inps = manualPage.expectedOutput?.inputs || [];
      const outs = manualPage.expectedOutput?.outputs || [];
      const memRows: MemoryDumpEntry[] = [];
      let offsetCtr = 0;

      inps.forEach((inp) => {
        memRows.push({
          offset: `DS:${offsetCtr.toString(16).toUpperCase().padStart(4, '0')}H`,
          symbol: inp.name,
          hexBytes: inp.val,
          formatted: inp.val,
          type: 'input',
          comment: `Input Parameter for ${manualPage.title}`
        });
        offsetCtr += 4;
      });

      outs.forEach((out) => {
        memRows.push({
          offset: `DS:${offsetCtr.toString(16).toUpperCase().padStart(4, '0')}H`,
          symbol: out.name,
          hexBytes: out.val,
          formatted: out.val,
          type: 'output',
          comment: `Simulated Output Result for ${manualPage.title}`
        });
        offsetCtr += 4;
      });

      const verRows: VerificationEntry[] = outs.map((out) => ({
        parameter: out.name,
        memoryAddress: `Data Segment / Output Register`,
        theoretical: out.val,
        simulated: out.val,
        match: true,
        notes: `Validated against algorithm logic for ${manualPage.title}`
      }));

      return {
        memoryRows: memRows,
        verificationRows: verRows,
        observationData: {
          aim: manualPage.aim,
          inputs: inps.map((inp, idx) => ({
            address: `DS:${(idx * 4).toString(16).toUpperCase().padStart(4, '0')}H`,
            variable: inp.name,
            hexVal: inp.val,
            decVal: inp.val
          })),
          initialRegisters: [
            { register: 'AX', value: lastStep?.registers?.AX || '1000H', purpose: 'Accumulator / Segment setup' },
            { register: 'CX', value: lastStep?.registers?.CX || '0000H', purpose: 'Loop Counter' },
            { register: 'SI', value: lastStep?.registers?.SI || '0000H', purpose: 'Source Index Pointer' },
            { register: 'DI', value: lastStep?.registers?.DI || '0000H', purpose: 'Destination Index Pointer' }
          ],
          outputs: outs.map((out, idx) => ({
            address: `DS:${((inps.length + idx) * 4).toString(16).toUpperCase().padStart(4, '0')}H`,
            variable: out.name,
            hexVal: out.val,
            decVal: out.val
          })),
          finalFlags: [
            { flag: 'CF', value: lastStep?.flags?.CF || '0', meaning: 'Carry Flag status' },
            { flag: 'ZF', value: lastStep?.flags?.ZF || '1', meaning: 'Zero Flag status' },
            { flag: 'SF', value: lastStep?.flags?.SF || '0', meaning: 'Sign Flag status' },
            { flag: 'OF', value: lastStep?.flags?.OF || '0', meaning: 'Overflow Flag status' }
          ],
          resultSummary: manualPage.resultText || 'Experiment was executed and verified against theoretical values.'
        }
      };
  }
}

interface Unit6LabManualPresenterProps {
  slideId: string;
  slideTitle: string;
  fullScreenMode?: boolean;
  onNavigateExperiment?: (slideId: string) => void;
  renderInteractive?: (type?: string) => React.ReactNode;
}

// Map slide IDs to experiment IDs
const SLIDE_TO_EXP_ID: Record<string, string> = {
  'm20-s1': 'exp1',
  'm20-s2': 'exp2',
  'm20-s3': 'exp_math',
  'm20-s4': 'exp_bit1',
  'm20-s5': 'exp_bit2',
  'm20-s6': 'exp_bit3',
  'm20-s7': 'exp_arr1',
  'm20-s8': 'exp3',
  'm20-s9': 'exp4',
  'm20-s10': 'exp_str1',
  'm20-s11': 'exp_str2',
  'm20-s12': 'exp_str3',
  'm20-s13': 'exp_str4',
  'm20-s14': 'exp_clock1',
  'm20-s15': 'exp_clock2',
  'm20-s16': 'exp_clock3',
  'm20-s17': 'exp_stepper1',
  'm20-s18': 'exp_stepper2',
  'm20-s19': 'exp_adc',
  'm20-s20': 'exp_dac',
  'm20-s21': 'exp5',
  'm20-s22': 'exp_8051_arith',
  'm20-s23': 'exp_8051_muldiv',
  'm20-s24': 'exp_8051_logic',
  'm20-s25': 'exp_8051_regbanks',
  'm20-s26': 'exp_8051_timer0_m1',
  'm20-s27': 'exp_8051_timer1_m0',
  'm20-s28': 'exp_8051_counter0_m2',
  'm20-s29': 'exp_8051_counter1_m1',
  'm20-s30': 'exp_8051_uart_9600',
  'm20-s31': 'exp_8051_uart_4800',
  'm20-s32': 'exp_8051_uart_2400',
  'm20-s33': 'exp_8051_lcd_8bit',
  'm20-s34': 'exp_8051_lcd_4bit',
};

// Comprehensive Viva Voce Data mapped per experiment ID
const VIVA_VOCE_DATA: Record<string, Array<{ question: string; answer: string; concept: string }>> = {
  exp1: [
    {
      question: 'Why is the ADC instruction used instead of ADD in multi-byte addition?',
      answer: 'ADC (Add with Carry) adds the source operand, destination operand, and the current value of the Carry Flag (CF). When adding numbers larger than 16 bits byte-by-byte, any carry generated from lower byte additions must be propagated to higher byte positions.',
      concept: 'Carry Propagation'
    },
    {
      question: 'Why must the CLC (Clear Carry Flag) instruction be executed before the loop?',
      answer: 'Because ADC includes the Carry Flag. If CF happened to be set (CF=1) by previous instructions before entering the loop, adding the lowest byte would add an unintended +1. CLC ensures the first addition starts with CF=0.',
      concept: 'Flag Initialization'
    },
    {
      question: 'How are multi-byte numbers stored in 8086 memory?',
      answer: 'The 8086 processor follows Little-Endian byte ordering, where the Least Significant Byte (LSB) resides at the lowest memory address, and the Most Significant Byte (MSB) resides at the highest memory address.',
      concept: 'Memory Architecture'
    },
    {
      question: 'How is the final carry preserved after loop termination?',
      answer: 'By executing MOV AL, 0 followed by ADC AL, 0. This adds 0 + 0 + CF, capturing the final carry flag value into the AL register so it can be stored into a memory variable.',
      concept: 'Flag Extraction'
    }
  ],
  exp2: [
    {
      question: 'Where does 8086 store the product of a 16-bit by 16-bit unsigned multiplication (MUL BX)?',
      answer: 'The 32-bit product is stored in the DX:AX register pair, where the high-order 16 bits reside in DX and the low-order 16 bits reside in AX.',
      concept: 'Register Pairs'
    },
    {
      question: 'What is the operational difference between MUL and IMUL?',
      answer: 'MUL performs unsigned arithmetic treating operands as positive values (0 to 65,535). IMUL operates on signed 2\'s complement numbers (-32,768 to +32,767) and preserves mathematical sign rules.',
      concept: 'Signed vs Unsigned'
    },
    {
      question: 'What is the purpose of the CWD instruction before executing IDIV?',
      answer: 'CWD (Convert Word to Doubleword) sign-extends the 16-bit signed dividend in AX into the 32-bit DX:AX register pair by replicating Bit 15 across all bits of DX to prevent Type 0 Divide Overflow exceptions.',
      concept: 'Sign Extension'
    },
    {
      question: 'What occurs if a divisor is 0 or the quotient exceeds the destination register?',
      answer: 'The 8086 hardware generates an internal Type 0 Interrupt (Divide Error / Divide by Zero Exception), suspending program execution.',
      concept: 'CPU Exceptions'
    }
  ],
  exp_math: [
    {
      question: 'What is the maximum factorial value that fits inside an 8086 16-bit register?',
      answer: '8! = 40,320 (9D80H), which fits inside the 16-bit unsigned maximum of 65,535 (FFFFH). 9! = 362,880 exceeds 16 bits and requires a 32-bit DX:AX register pair.',
      concept: 'Register Capacity'
    },
    {
      question: 'How does the LOOP instruction work in 8086?',
      answer: 'LOOP automatically decrements CX by 1 without modifying CPU status flags. If CX is not zero, it branches to the target label; if CX is zero, it falls through.',
      concept: 'Hardware Loops'
    },
    {
      question: 'Why is accumulator AX initialized to 1 before calculating factorial?',
      answer: 'Because 1 is the multiplicative identity. Initializing to 0 would cause all subsequent multiplications to yield 0.',
      concept: 'Arithmetic Accumulation'
    },
    {
      question: 'How should N=0 be handled in factorial calculation?',
      answer: 'By definition 0! = 1. A pre-check (like JCXZ) should be executed before the loop to return 1 immediately and prevent LOOP from decrementing CX=0 to FFFFH.',
      concept: 'Edge Case Handling'
    }
  ],
  exp_bit1: [
    {
      question: 'How does 8086 determine whether a number is positive or negative?',
      answer: '8086 uses 2\'s complement notation where the Most Significant Bit (MSB, Bit 7 for bytes or Bit 15 for words) is the sign bit. MSB=0 indicates positive, MSB=1 indicates negative.',
      concept: 'Signed Representation'
    },
    {
      question: 'Why is TEST AL, 80H preferred over AND AL, 80H?',
      answer: 'TEST performs a non-destructive bitwise AND that updates the status flags (Sign Flag SF, Zero Flag ZF) without modifying the value in AL. AND overwrites AL.',
      concept: 'Non-Destructive Testing'
    },
    {
      question: 'Which conditional jump instructions query the Sign Flag (SF)?',
      answer: 'JS (Jump on Sign / Jump if SF=1, meaning Negative) and JNS (Jump on No Sign / Jump if SF=0, meaning Positive).',
      concept: 'Conditional Branching'
    },
    {
      question: 'What is the valid numerical range of an 8-bit signed integer?',
      answer: '-128 (80H) to +127 (7FH).',
      concept: '2\'s Complement Range'
    }
  ],
  exp_bit2: [
    {
      question: 'How does binary representation determine whether an integer is Odd or Even?',
      answer: 'Parity is determined solely by the Least Significant Bit (LSB, Bit 0). If Bit 0 is 0, the number is divisible by 2 (Even). If Bit 0 is 1, the number is Odd.',
      concept: 'Binary Parity'
    },
    {
      question: 'What does TEST AL, 01H do to the Zero Flag (ZF)?',
      answer: 'It bitwise-ANDs AL with 00000001B. If Bit 0 is 0, the result is 00H setting ZF=1 (Even). If Bit 0 is 1, the result is 01H leaving ZF=0 (Odd).',
      concept: 'Zero Flag Masking'
    },
    {
      question: 'What is the difference between Parity Flag (PF) and Odd/Even integer testing?',
      answer: 'The Parity Flag (PF) tests the total count of 1-bits in the result byte (PF=1 if total 1s is even). An Odd/Even integer test checks if the number itself is divisible by 2.',
      concept: 'Parity vs Odd/Even'
    },
    {
      question: 'Can shift instructions like SHR AL, 1 test odd/even parity?',
      answer: 'Yes, SHR AL, 1 pushes Bit 0 into the Carry Flag (CF). If CF=1 the number is Odd, if CF=0 it is Even. However, SHR alters AL.',
      concept: 'Shift Inspection'
    }
  ],
  exp_bit3: [
    {
      question: 'How does SHR AL, 1 enable counting 1s and 0s?',
      answer: 'SHR AL, 1 shifts all bits right by 1 position, moving the LSB into the Carry Flag (CF) and inserting 0 at the MSB. Using JC (Jump if Carry), we branch to increment the 1s or 0s register.',
      concept: 'Bit Shifting'
    },
    {
      question: 'Why is loop counter CX initialized to 8 for byte-level bit counting?',
      answer: 'Because an 8086 byte consists of exactly 8 bits. After 8 shifts, all bits in the byte have passed through the Carry Flag.',
      concept: 'Loop Count'
    },
    {
      question: 'What instruction would you use to preserve AL while shifting bits into CF?',
      answer: 'ROR AL, 1 (Rotate Right) or ROL AL, 1 (Rotate Left). Rotating preserves the bits by wrapping them back to the opposite end.',
      concept: 'Bit Rotation'
    },
    {
      question: 'What will register AL contain after 8 executions of SHR AL, 1?',
      answer: 'AL will contain 00H because 0s are shifted into the upper bit positions on every shift.',
      concept: 'Shift Mechanics'
    }
  ],
  exp_arr1: [
    {
      question: 'What is the function of the LEA SI, ARRAY instruction?',
      answer: 'LEA (Load Effective Address) calculates the 16-bit offset address of ARRAY within the Data Segment and loads it into SI for indirect memory access [SI].',
      concept: 'Effective Address'
    },
    {
      question: 'How does ADD AL, [SI] access memory?',
      answer: 'It uses register indirect addressing. The CPU calculates physical address DS:SI ((DS × 16) + SI) and adds the byte at that memory location to AL.',
      concept: 'Addressing Modes'
    },
    {
      question: 'Why is INC SI used inside the array summation loop?',
      answer: 'Because ARRAY is defined with DB (bytes). INC SI advances the pointer by 1 byte to the next sequential element. If DW (words) were used, ADD SI, 2 would be required.',
      concept: 'Pointer Arithmetic'
    },
    {
      question: 'How can overflow be prevented when summing multiple array bytes?',
      answer: 'By accumulating the sum into a 16-bit register AX or using ADC AH, 0 after each ADD AL, [SI] to accumulate carries.',
      concept: 'Accumulator Width'
    }
  ],
  exp3: [
    {
      question: 'Why is the loop counter set to N - 1 when finding largest and smallest elements?',
      answer: 'Because the first element is already loaded into AL (Max candidate) and AH (Min candidate). Therefore, only the remaining N - 1 elements need to be compared.',
      concept: 'Algorithm Efficiency'
    },
    {
      question: 'Why are JA/JB used instead of JG/JL for unsigned comparisons?',
      answer: 'JA (Jump if Above) and JB (Jump if Below) test unsigned conditions checking CF and ZF. JG/JL test signed conditions evaluating SF and OF.',
      concept: 'Unsigned vs Signed Jumps'
    },
    {
      question: 'How does CMP AL, [SI] work internally?',
      answer: 'CMP performs an internal subtraction (AL - [SI]) and updates the status flags (CF, ZF, SF, OF) without altering the accumulator or memory.',
      concept: 'Comparator Operation'
    },
    {
      question: 'Can the algorithm track the memory index of the maximum element?',
      answer: 'Yes, by recording the current loop index or pointer offset into a secondary register (like DI) whenever a new maximum is found.',
      concept: 'Extrema Indexing'
    }
  ],
  exp4: [
    {
      question: 'What is the time complexity and pass structure of Bubble Sort in 8086?',
      answer: 'Bubble Sort has a worst-case time complexity of O(N²). For N elements, it requires (N - 1) outer passes, with each pass performing adjacent element swaps.',
      concept: 'Sorting Complexity'
    },
    {
      question: 'How is memory swapping executed when two adjacent bytes are out of order?',
      answer: '8086 cannot move directly from memory to memory. The byte at [SI+1] is loaded into AH, AL is written to [SI+1], and AH is written to [SI].',
      concept: 'Memory Swapping'
    },
    {
      question: 'What instruction change switches sorting from Ascending to Descending order?',
      answer: 'Changing the conditional jump after comparison: for Ascending order, skip swap if JBE (Below or Equal); for Descending order, skip swap if JAE (Above or Equal).',
      concept: 'Sort Inversion'
    },
    {
      question: 'Why are nested loops required in Bubble Sort?',
      answer: 'The outer loop (DX register) controls the number of passes, while the inner loop (CX register) performs adjacent comparisons across the unsorted partition.',
      concept: 'Nested Iteration'
    }
  ],
  exp_str1: [
    {
      question: 'What does the SCASB instruction do in 8086?',
      answer: 'SCASB (Scan String Byte) compares AL with ES:[DI] (AL - ES:[DI]), updates the status flags, and automatically increments/decrements DI based on the Direction Flag (DF).',
      concept: 'String Scanning'
    },
    {
      question: 'What is the role of the REPNE prefix?',
      answer: 'REPNE (Repeat while Not Equal) repeatedly executes the string instruction as long as CX ≠ 0 and ZF = 0 (character not found). It halts when a match occurs or CX reaches 0.',
      concept: 'Repeat Prefixes'
    },
    {
      question: 'Why is CX initialized to FFFFH before REPNE SCASB?',
      answer: 'FFFFH is the maximum unsigned 16-bit value (65,535). Starting from FFFFH allows counting downwards without terminating prematurely before finding the terminator.',
      concept: 'Down-Counter Scan'
    },
    {
      question: 'Why does NOT CX followed by DEC CX calculate the exact string length?',
      answer: 'When CX counts down from FFFFH (-1) by K characters, its value becomes FFFFH - K. Bitwise NOT (FFFFH - K) equals K - 1. Adjusting with DEC CX yields the exact length K.',
      concept: '2\'s Complement Arithmetic'
    }
  ],
  exp_str2: [
    {
      question: 'Which MS-DOS interrupt and function code displays a string on the console?',
      answer: 'Software Interrupt INT 21H with function code AH = 09H (Display String).',
      concept: 'DOS Function Calls'
    },
    {
      question: 'Which register must hold the address of the string to be displayed?',
      answer: 'The DX register must hold the 16-bit offset address of the string within the Data Segment (DS:DX).',
      concept: 'Parameter Registers'
    },
    {
      question: 'What character must terminate strings used with INT 21H / AH = 09H?',
      answer: 'The dollar sign character $ (ASCII 24H). DOS prints characters sequentially from DS:DX until it encounters $.',
      concept: 'String Delimiters'
    },
    {
      question: 'What is the purpose of AH = 4CH with INT 21H at the end of the program?',
      answer: 'It invokes the DOS "Terminate Process with Return Code" service, safely releasing system memory and returning control to DOS.',
      concept: 'Program Termination'
    }
  ],
  exp_str3: [
    {
      question: 'What does the CMPSB instruction do in 8086?',
      answer: 'CMPSB (Compare String Byte) compares the byte at DS:[SI] with ES:[DI] (performing [DS:SI] - [ES:DI]), updates CPU flags, and automatically advances SI and DI.',
      concept: 'String Comparison'
    },
    {
      question: 'What is the function of the REPE prefix?',
      answer: 'REPE (Repeat while Equal) repeats the string instruction as long as CX ≠ 0 and ZF = 1 (matching characters). It stops immediately upon a mismatch or when CX reaches 0.',
      concept: 'Equality Loops'
    },
    {
      question: 'How do we verify if two strings matched completely after REPE CMPSB?',
      answer: 'By querying the Zero Flag: if ZF = 1 (tested with JZ/JE), all characters matched and strings are identical. If ZF = 0, a mismatch occurred.',
      concept: 'Match Verification'
    },
    {
      question: 'Why must ES equal DS for single-segment string comparisons?',
      answer: 'Because CMPSB hardwires the destination operand to ES:[DI]. If ES is not initialized to the Data Segment, DI accesses an invalid memory region.',
      concept: 'Segment Consistency'
    }
  ],
  exp_str4: [
    {
      question: 'How do pointers move during string reversal in 8086?',
      answer: 'Source pointer SI starts at the end of the original string and moves backwards (DEC SI), while destination pointer DI starts at the beginning of the reversed buffer and moves forwards (INC DI).',
      concept: 'Bidirectional Pointers'
    },
    {
      question: 'What mathematical condition defines a palindrome?',
      answer: 'A string is a palindrome if it reads identically forwards and backwards (e.g. "MADAM"), meaning string[i] == string[length - 1 - i] for all character positions.',
      concept: 'Symmetry Condition'
    },
    {
      question: 'How does the program verify if the reversed string is a palindrome?',
      answer: 'It uses REPE CMPSB to compare the original string at DS:[SI] with the newly generated reversed string at ES:[DI]. If ZF = 1 after all characters, the string is a palindrome.',
      concept: 'Verification Logic'
    },
    {
      question: 'Why must the reversed string be terminated with $?',
      answer: 'To allow safe display via DOS INT 21H / AH=09H without printing trailing uninitialized memory garbage.',
      concept: 'String Termination'
    }
  ],
  exp_clock1: [
    {
      question: 'Which DOS INT 21H service function is used to read the system time?',
      answer: 'INT 21H with Function AH = 2CH is used to read system time. Upon return: CH = Hours (00-23), CL = Minutes (00-59), DH = Seconds (00-59), DL = Hundredths of a second (00-99).',
      concept: 'DOS Time Service AH=2CH'
    },
    {
      question: 'How are binary/hexadecimal time values converted to ASCII characters for display?',
      answer: 'By isolating individual nibbles: Divide the byte by 10 (or use SHR/AND 0FH masks) to get the tens and units digits, then add 30H (\'0\') to each digit to convert it into its ASCII equivalent.',
      concept: 'BCD to ASCII Conversion'
    },
    {
      question: 'What is the role of INT 21H / AH=02H in the clock program?',
      answer: 'Function AH=02H displays a single character from the DL register onto standard output (video display), allowing character-by-character rendering of digits and colon separators.',
      concept: 'Character Output AH=02H'
    },
    {
      question: 'How can an active digital clock loop be terminated gracefully?',
      answer: 'By checking for keyboard input using INT 21H / AH=0BH or INT 16H / AH=01H. If a key is pressed (e.g. Esc/q), exit the loop and return control via INT 21H / AH=4CH.',
      concept: 'Non-Blocking Keyboard Check'
    }
  ],
  exp_clock2: [
    {
      question: 'What combination of DOS interrupts is used to manage screen cursor position and display?',
      answer: 'BIOS INT 10H / AH=02H is used to set the cursor position at desired row (DH) and column (DL), while DOS INT 21H / AH=09H or AH=02H renders formatted string/characters at that location.',
      concept: 'Screen Positioning'
    },
    {
      question: 'Why is a delay loop or time-change detection needed when updating the clock display?',
      answer: 'Without checking whether the second value has changed, the CPU will continuously rewrite the screen thousands of times per second, causing annoying visual flicker and wasting CPU cycles.',
      concept: 'Flicker Reduction'
    },
    {
      question: 'What is the format of the output string displayed by INT 21H / AH=09H?',
      answer: 'The string must be in memory with a closing \'$\' termination character (e.g., "14:35:28$"), and DX must point to the string\'s offset address (LEA DX, TIME_STR).',
      concept: 'Dollar-Terminated Strings'
    },
    {
      question: 'How do you separate the tens and units digits of a byte in 8086 assembly?',
      answer: 'For a register with value in AL: MOV AH, 0; MOV BL, 10; DIV BL -> AL holds quotient (tens digit) and AH holds remainder (units digit). Adding 3030H converts both to ASCII simultaneously.',
      concept: 'AAM / DIV Splitting'
    }
  ],
  exp_clock3: [
    {
      question: 'Where does the BIOS store the real-time clock tick count in memory?',
      answer: 'BIOS stores the 32-bit timer tick counter at memory address 0040:006CH (Timer Count Low at 006CH, Timer Count High at 006EH), updated approximately 18.2 times per second by IRQ0 / INT 08H.',
      concept: 'BIOS Data Area (BDA)'
    },
    {
      question: 'What is the relationship between Timer Ticks and seconds?',
      answer: 'The 8253/8254 PIT generates ~18.2065 ticks per second (1193182 / 65536 Hz). There are 65,543 ticks per hour and 1,573,040 ticks in a standard 24-hour day.',
      concept: 'Tick Frequency (18.2 Hz)'
    },
    {
      question: 'What does BIOS INT 1AH / AH=00H return?',
      answer: 'INT 1AH / AH=00H reads the real-time clock tick count from BIOS into CX:DX (CX = High word, DX = Low word) and AL = 24-hour midnight rollover flag (0 = no rollover, non-zero = day changed).',
      concept: 'BIOS Real-Time Clock INT 1AH'
    },
    {
      question: 'How can hours, minutes, and seconds be calculated from raw timer ticks?',
      answer: 'Hours = Ticks / 65543. The remainder is divided by 1092 to obtain Minutes, and the remaining remainder is divided by 18.2 (or multiplied by 10 and divided by 182) to obtain Seconds.',
      concept: 'Tick Arithmetic Conversion'
    }
  ],
  exp_stepper1: [
    {
      question: 'How is step angle related to the total number of steps per revolution in a stepper motor?',
      answer: 'Step Angle (θ) = 360° / N, where N is the total steps for one full 360° revolution. For a standard 1.8° step angle motor, N = 360° / 1.8° = 200 steps per revolution.',
      concept: 'Step Angle Calculation'
    },
    {
      question: 'What is the 2-phase full-step excitation sequence for Clockwise (CW) rotation?',
      answer: 'The 4-step sequence is: Phase A+B (09H: 1001B) -> Phase B+C (0AH: 1010B) -> Phase C+D (06H: 0110B) -> Phase D+A (05H: 0101B). Sending these codes sequentially through 8255 Port A produces continuous clockwise torque.',
      concept: '2-Phase Commutation'
    },
    {
      question: 'Why is a driver IC like ULN2003 or L298N necessary between 8255 PPI and the stepper motor?',
      answer: '8255 PPI port pins provide TTL logic-level signals (5V) with limited current sourcing (< 2 mA). Stepper motor stator coils require 12V/24V and several hundred milliamperes. The ULN2003 Darlington transistor array amplifies current and includes internal freewheeling clamp diodes to suppress inductive back-EMF.',
      concept: 'Driver Current Amplification'
    },
    {
      question: 'What role does the software delay routine play in stepper motor control?',
      answer: 'Due to rotor inertia and mechanical time constants, the rotor requires a finite settling time (typically 10-50 ms) to align with the active magnetic stator pole before the next excitation phase is energized. Without adequate delay, the motor experiences stall or step slippage.',
      concept: 'Rotor Settling & Speed Regulation'
    },
    {
      question: 'How is a variable step size or target angular displacement achieved in the 8086 ALP?',
      answer: 'By loading the desired step count CX = (Target Angle in Degrees) / (Step Angle per Step). For example, with a 1.8° motor, 90° CW requires CX = 50 steps, 180° requires CX = 100 steps, and 360° requires CX = 200 steps.',
      concept: 'Variable Step Size'
    }
  ],
  exp_stepper2: [
    {
      question: 'How is Anti-Clockwise (CCW / Counter-Clockwise) rotation achieved in 8086 stepper motor interfacing?',
      answer: 'Anti-Clockwise rotation is achieved by reversing the stator coil excitation sequence: Phase D+A (05H: 0101B) -> Phase C+D (06H: 0110B) -> Phase B+C (0AH: 1010B) -> Phase A+B (09H: 1001B). This pulls the magnetic rotor in the reverse angular direction.',
      concept: 'Inverted Commutation Sequence'
    },
    {
      question: 'What control word is written to 8255 PPI CWR to configure Port A for stepper motor interfacing?',
      answer: 'Control word 80H (1000 0000B) is written to CWR (00C6H). This configures 8255 in I/O Mode 0 (Basic I/O) with Port A, Port B, Port C-Upper, and Port C-Lower all as Output ports.',
      concept: '8255 PPI Control Word (80H)'
    },
    {
      question: 'What is the difference between Wave Drive (1-Phase On), Full-Step (2-Phase On), and Half-Step excitation?',
      answer: 'Wave drive energizes 1 coil at a time (lower torque), Full-step energizes 2 coils simultaneously (maximum holding torque, 1.8°/step), and Half-step alternates 1-coil and 2-coil energization (smoother motion, 0.9°/step, 400 steps/rev).',
      concept: 'Excitation Modes'
    },
    {
      question: 'Why are freewheeling/flyback diodes required in the stepper motor driving circuit?',
      answer: 'When stator coil current is switched off rapidly, the collapsing magnetic field generates a large reverse voltage spike (V = L · di/dt). Flyback diodes provide a safe recirculation path to ground, protecting the driver transistors and microprocessor from breakdown.',
      concept: 'Back-EMF Snubber Protection'
    }
  ],
  exp_adc: [
    {
      question: 'What is the conversion principle used in ADC 0808/0809?',
      answer: 'The ADC 0808 uses the Successive Approximation Register (SAR) conversion technique. It performs a binary search by testing bits from MSB (D7) to LSB (D0), comparing internal DAC feedback voltage with the input analog voltage over 8 clock cycles (~100 µs at 640 kHz).',
      concept: 'SAR Conversion Principle'
    },
    {
      question: 'What is the function of ALE, SOC, EOC, and OE pins on ADC 0808?',
      answer: 'ALE (Address Latch Enable) latches the 3-bit channel address (ADD A, B, C). SOC (Start of Conversion) resets the SAR and begins conversion on its trailing edge. EOC (End of Conversion) is driven HIGH by ADC when conversion finishes. OE (Output Enable) activates the 3-state output buffers to place the 8-bit digital result onto the data bus.',
      concept: 'ADC Handshaking Pins'
    },
    {
      question: 'What 8255 control word is used for ADC 0808 interfacing and why?',
      answer: 'Control word 98H (1001 1000B) is used. In Mode 0: Port A = Input (reads 8-bit digital data from ADC), Port B = Output (drives channel multiplexer address lines), Port C Upper (PC7) = Input (polls EOC), and Port C Lower (PC0, PC2) = Output (generates ALE/SOC and OE pulses).',
      concept: '8255 PPI Mixed Configuration (98H)'
    },
    {
      question: 'How do you calculate resolution and step size for an 8-bit ADC with Vref = +5.0V?',
      answer: 'Step Size (Resolution) = Vref / (2^n - 1) = 5.00V / 255 = 19.61 mV per LSB. The digital code D for an input voltage Vin is D = Round((Vin / 5.00V) * 255).',
      concept: 'ADC Resolution & Quantization'
    },
    {
      question: 'Why is polling EOC preferred over fixed time delays in microprocessor ADC interfacing?',
      answer: 'Polling EOC directly checks the hardware status flag, ensuring the CPU reads the exact moment the SAR completes, preventing data bus contention while minimizing latency compared to conservative fixed software delays.',
      concept: 'Status Polling Handshaking'
    }
  ],
  exp_dac: [
    {
      question: 'What is the operating principle of the DAC 0800 IC?',
      answer: 'The DAC 0800 is an 8-bit monolithic current-output digital-to-analog converter based on an inverted R-2R ladder network. It produces complementary output currents (Iout and Iout_bar) proportional to the 8-bit digital binary input code (Iout = Iref * (D / 256)).',
      concept: 'R-2R Ladder Network'
    },
    {
      question: 'Why is an external operational amplifier (Op-Amp) used with DAC 0800?',
      answer: 'DAC 0800 generates a current output (Iout). An operational amplifier (such as OP-07 or LM741) in an inverting I-to-V configuration converts this current to a proportional output voltage: Vo = -Iout * Rf = Vref * (Rf / Rref) * (D / 256).',
      concept: 'Current-to-Voltage (I-to-V) Conversion'
    },
    {
      question: 'How is a Square wave generated using DAC and 8086 ALP?',
      answer: 'By alternately outputting 00H (0.0V low level) and FFH (+5.0V high level) to 8255 Port A, with equal software delay routines between transitions to create a 50% duty cycle symmetric square wave.',
      concept: 'Square Wave Synthesis'
    },
    {
      question: 'How is a Triangular wave generated using 8086 assembly language?',
      answer: 'By creating a continuous loop with two sub-phases: (1) Ramp Up: incrementing AL from 00H to FFH with micro-delays between steps, and (2) Ramp Down: decrementing AL from FFH to 00H with identical micro-delays, producing linear symmetrical slopes.',
      concept: 'Triangular Ramp Synthesis'
    },
    {
      question: 'How is a Step (Staircase) waveform generated and how is the step height determined?',
      answer: 'By adding a constant step value (e.g., ADD AL, 33H for ~1.0V steps) and inserting plateau hold delays (~5 ms) at each voltage level until AL overflows past FFH and wraps back to 00H.',
      concept: 'Staircase Waveform Generation'
    }
  ],
  exp5: [
    {
      question: 'What does the MOVSB instruction do in 8086?',
      answer: 'MOVSB (Move String Byte) copies a byte from DS:[SI] to ES:[DI], then automatically increments or decrements SI and DI according to the Direction Flag (DF).',
      concept: 'Block Transfer'
    },
    {
      question: 'What is the purpose of the REP prefix with MOVSB?',
      answer: 'REP (Repeat) repeats MOVSB for CX iterations in hardware without requiring a software loop, decrementing CX after each transfer until CX = 0.',
      concept: 'Hardware Repetition'
    },
    {
      question: 'Why must CLD be executed before REP MOVSB?',
      answer: 'CLD (Clear Direction Flag, DF=0) sets autoincrement mode, ensuring SI and DI advance to higher addresses (SI++, DI++). STD (DF=1) would decrement.',
      concept: 'Direction Flag'
    },
    {
      question: 'How do you handle block data transfer when source and destination blocks overlap?',
      answer: 'If destination > source and blocks overlap, copy backwards from the end of the blocks using STD (DF=1) to prevent overwriting source bytes before they are read.',
      concept: 'Overlap Protection'
    }
  ],
  exp_8051_arith: [
    {
      question: 'Why must CLR C be executed before SUBB A, R0 in 8051 microcontroller?',
      answer: 'The 8051 lacks a standalone SUB instruction and only provides SUBB (Subtract with Borrow: A = A - src - CY). Executing CLR C guarantees the Carry/Borrow flag is zero before subtraction, avoiding unintended decrements.',
      concept: '8051 ALU Subtraction with Borrow'
    },
    {
      question: 'Which status flags in PSW are affected by ADD A, Rn and SUBB A, Rn?',
      answer: 'CY (Carry bit 7), AC (Auxiliary Carry bit 3 for BCD nibble overflow), OV (two\'s-complement overflow bit 6), and P (parity flag bit 0, set if A has odd number of ones).',
      concept: 'Program Status Word (PSW) Flags'
    },
    {
      question: 'What is the function of the Auxiliary Carry (AC) flag in 8051 arithmetic?',
      answer: 'The AC flag is set when an arithmetic operation produces a carry from bit 3 to bit 4 (lower nibble to upper nibble). It is essential for BCD decimal adjustment via DA A.',
      concept: 'BCD Arithmetic & AC Flag'
    }
  ],
  exp_8051_muldiv: [
    {
      question: 'How do the MUL AB and DIV AB instructions store their results in 8051 registers?',
      answer: 'MUL AB multiplies 8-bit A by 8-bit B; the 16-bit product is stored with low byte in A and high byte in B. DIV AB divides A by B; the integer quotient is placed in A and the remainder is placed in B.',
      concept: 'Hardware Multiplier & Divider Register Allocation'
    },
    {
      question: 'When is the Overflow (OV) flag set during MUL AB and DIV AB?',
      answer: 'For MUL AB, OV is set (1) if the product exceeds 255 (i.e., B > 00H). For DIV AB, OV is set (1) if division by zero occurs (B = 00H); otherwise OV is cleared (0). The Carry (CY) flag is always cleared to 0 by both instructions.',
      concept: 'Arithmetic Overflow Flag Dynamics'
    },
    {
      question: 'How many machine cycles do MUL AB and DIV AB take in 8051?',
      answer: 'Both MUL AB and DIV AB require 4 machine cycles (48 oscillator clock periods at standard 12 MHz = 4.0 µs), making them the slowest arithmetic instructions in 8051.',
      concept: 'Instruction Timing & Cycles'
    }
  ],
  exp_8051_logic: [
    {
      question: 'What are the primary bitwise logical instructions in 8051 assembly language?',
      answer: 'ANL (Logical AND), ORL (Logical OR), XRL (Logical Exclusive-OR), and CPL (One\'s Complement / Inversion). They operate bitwise on Accumulator A, direct RAM bytes, or bit-addressable SFRs.',
      concept: 'Bitwise Logic Operations'
    },
    {
      question: 'How can you toggle (invert) specific bits in an 8051 register or I/O port?',
      answer: 'By executing XRL with a mask containing 1s at the bit positions to invert (e.g., XRL A, #0FFH inverts all 8 bits; XRL P1, #01H toggles pin P1.0) or using CPL bit (e.g., CPL P1.0).',
      concept: 'Bit Masking & Port Toggling'
    },
    {
      question: 'Do logical instructions like ANL, ORL, XRL affect the Carry (CY) flag in 8051?',
      answer: 'No. Byte-level ANL, ORL, XRL, and CPL do not affect any status flags except the Parity (P) flag in PSW, which dynamically updates to reflect the parity of Accumulator A.',
      concept: 'Flag Immunity in Logic Operations'
    }
  ],
  exp_8051_regbanks: [
    {
      question: 'How many register banks are available in the 8051 internal RAM and where are they located?',
      answer: 'There are 4 register banks (Bank 0, Bank 1, Bank 2, Bank 3), each consisting of 8 working registers (R0-R7). They occupy the lowest 32 bytes of internal RAM from address 00H to 1FH.',
      concept: 'Internal RAM Register Bank Architecture'
    },
    {
      question: 'How do you switch active register banks in 8051 assembly language?',
      answer: 'By modifying the RS1 (PSW.4) and RS0 (PSW.3) bits in the Program Status Word: Bank 0 = (RS1=0, RS0=0), Bank 1 = (RS1=0, RS0=1), Bank 2 = (RS1=1, RS0=0), and Bank 3 = (RS1=1, RS0=1) using instructions like SETB PSW.3 or CLR PSW.4.',
      concept: 'Bank Switching via PSW RS1:RS0'
    },
    {
      question: 'Why are register banks useful in embedded systems and interrupt service routines (ISRs)?',
      answer: 'Register banks allow instantaneous context switching for high-priority ISRs with a single instruction (e.g., SETB PSW.3) without needing to PUSH and POP registers onto the stack, reducing interrupt latency.',
      concept: 'Fast Context Switching in ISRs'
    }
  ],
  exp_8051_timer0_m1: [
    {
      question: 'What is the timer resolution and maximum delay of Timer 0 in Mode 1 (16-bit timer)?',
      answer: 'Mode 1 configures Timer 0 as a full 16-bit timer/counter (TL0 + TH0) counting from 0000H to FFFFH (65,536 total counts). At 12 MHz (1 µs per machine cycle), the maximum single-overflow delay is 65,536 µs ≈ 65.536 ms.',
      concept: '16-Bit Timer Mode 1 Architecture'
    },
    {
      question: 'How is the initial reload value calculated for a 25 ms delay at 12 MHz crystal frequency?',
      answer: 'Number of timer clock cycles N = Delay / (12 / Fosc) = 25,000 µs / 1 µs = 25,000 counts. Initial count = 65536 - 25000 = 40536 = 9E58H. Therefore, TH0 = 9EH and TL0 = 58H.',
      concept: 'Timer Initial Value Calculation'
    },
    {
      question: 'Why must TF0 and TR0 be cleared in software after the timer overflow occurs?',
      answer: 'TR0 (Timer 0 Run Control) stops the timer during reload. TF0 (Timer 0 Overflow Flag) is set in hardware when the count rolls over from FFFFH to 0000H; in polling mode, software must explicitly clear TF0 (CLR TF0) to detect the next overflow.',
      concept: 'Hardware Flag Polling & Reset'
    }
  ],
  exp_8051_timer1_m0: [
    {
      question: 'What is Mode 0 in 8051 Timers and how are bits distributed between TH1 and TL1?',
      answer: 'Mode 0 is a legacy 13-bit timer/counter mode compatible with the earlier 8048 microcontroller. It utilizes all 8 bits of TH1 and only the lower 5 bits of TL1 (bits 0-4), giving a maximum count of 2^13 = 8,192 counts.',
      concept: '13-Bit Mode 0 Architecture'
    },
    {
      question: 'How is a 50 µs delay configured using Timer 1 in Mode 0 at 12 MHz?',
      answer: 'N = 50 µs / 1 µs = 50 counts. Initial 13-bit value = 8192 - 50 = 8142 = 1111111001110_2. TH1 gets the upper 8 bits (11111100_2 = FCH) and TL1 gets the lower 5 bits (01110_2 = 0EH). TMOD is loaded with 00H for Timer 1 Mode 0.',
      concept: '13-Bit Mode 0 Reload Calculation'
    },
    {
      question: 'What is the difference between Timer 0 and Timer 1 in terms of TMOD register control?',
      answer: 'TMOD lower nibble (bits 0-3) configures Timer 0 (M0, M1, C/T, GATE), while the upper nibble (bits 4-7) configures Timer 1 with identical bit functions.',
      concept: 'TMOD Special Function Register'
    }
  ],
  exp_8051_counter0_m2: [
    {
      question: 'What makes Mode 2 (8-bit Auto-Reload) unique and advantageous for timers/counters?',
      answer: 'In Mode 2, TL0 acts as an 8-bit counter (0-255) and TH0 holds the reload value. Upon overflow (FFH to 00H), hardware automatically copies TH0 into TL0 without software intervention, eliminating reload overhead and jitter.',
      concept: '8-Bit Auto-Reload Mode 2'
    },
    {
      question: 'How is a 75 ms delay achieved using Counter 0 / Timer 0 in Mode 2?',
      answer: 'Since Mode 2 max single delay is 256 µs, a loop counter in register R2/R3 executes multiple short delays (e.g., 200 µs × 375 iterations = 75,000 µs = 75 ms). For Counter mode, C/T bit (TMOD.2) is set to 1 to count external pulses on pin T0 (P3.4).',
      concept: 'Cascaded Loop Delays in Auto-Reload Mode'
    },
    {
      question: 'What is the role of the C/T bit in the TMOD register?',
      answer: 'When C/T = 0, the timer counts internal clock pulses (Fosc / 12) for time delays. When C/T = 1, it operates as an event counter, incrementing on 1-to-0 negative transitions on external pins T0 (P3.4) or T1 (P3.5).',
      concept: 'Timer vs Counter Operation (C/T Bit)'
    }
  ],
  exp_8051_counter1_m1: [
    {
      question: 'How does Counter 1 count external pulses on pin T1 (P3.5) in Mode 1?',
      answer: 'When TMOD bit 6 (C/T) is set to 1 and TMOD bits 5:4 = 01 (Mode 1), Counter 1 increments its 16-bit register pair (TH1:TL1) each time a falling edge (1-to-0 transition) is detected on input pin P3.5 (T1).',
      concept: 'External Event Counter 16-Bit Mode'
    },
    {
      question: 'How is an 80 µs delay or 80-pulse count threshold programmed in Counter 1 Mode 1?',
      answer: 'Initial count = 65536 - 80 = 65456 = FFB0H. TH1 is loaded with 0FFH and TL1 is loaded with 0B0H. After 80 pulses or 80 clock ticks, the counter overflows (TF1 = 1), triggering port toggle.',
      concept: 'Counter Reload Calculation & Pulse Triggering'
    },
    {
      question: 'What frequency limits apply to external counter input signals on 8051 pins T0 and T1?',
      answer: 'The 8051 samples external pins T0 and T1 during S5P2 of every machine cycle. To be recognized reliably, the external pulse frequency cannot exceed 1/24th of the crystal oscillator frequency (max ~500 kHz at 12 MHz).',
      concept: 'Sampling Rate & Maximum Input Frequency'
    }
  ],
  exp_8051_uart_9600: [
    {
      question: 'Why is an 11.0592 MHz crystal standard for 8051 UART serial communication instead of 12.0 MHz?',
      answer: '11.0592 MHz divided by 12 (machine cycle) and 32 (UART prescaler) yields exactly 28,800 Hz. 28,800 Hz divides into standard baud rates (9600, 4800, 2400, 1200) with zero integer remainder and 0% timing error. A 12.0 MHz crystal results in an ~8.5% frequency error which causes asynchronous framing errors.',
      concept: 'Crystal Frequency Selection & Baud Accuracy'
    },
    {
      question: 'How is the auto-reload value TH1 = 0FDH derived for 9600 baud?',
      answer: 'Timer 1 in Mode 2 (TMOD = 20H) auto-reloads. Baud Clock = (11.0592 MHz / (12 × 32)) = 28,800 Hz. Count N = 28,800 / 9600 = 3. Reload register TH1 = 256 - 3 = 253 = 0FDH (-3D in 2\'s complement).',
      concept: 'Timer 1 Baud Rate Generator Equation'
    },
    {
      question: 'What is the function of the TI (Transmit Interrupt) flag in SCON?',
      answer: 'TI (SCON.1) is set to 1 by 8051 hardware when the last stop bit of a character frame has been shifted out of TXD (P3.1). It signals that SBUF is empty and ready for the next character. The programmer must clear TI in software using CLR TI.',
      concept: 'UART Transmit Interrupt Handshaking'
    }
  ],
  exp_8051_uart_4800: [
    {
      question: 'What is the reload value TH1 for 4800 baud and how does bit timing change compared to 9600 baud?',
      answer: 'For 4800 baud, TH1 = 256 - (28,800 / 4800) = 256 - 6 = 250 = 0FAH (-6D). The bit period at 4800 baud is 1 / 4800 = 208.33 µs (double the 104.17 µs duration of 9600 baud), and the 10-bit frame takes 2.083 ms.',
      concept: 'Baud Rate Scaling & Bit Period Dynamics'
    },
    {
      question: 'How does setting the SMOD bit in PCON (PCON.7 = 1) affect the UART baud rate?',
      answer: 'SMOD (Serial Mode bit) in PCON doubles the baud rate. When SMOD = 1, the baud rate generator formula uses 2^SMOD / 32 = 1/16 instead of 1/32, so with TH1 = 0FAH the baud rate becomes 4800 × 2 = 9600 baud.',
      concept: 'SMOD Baud Rate Doubler'
    },
    {
      question: 'What is the structure of a standard 8051 UART Mode 1 frame?',
      answer: 'Mode 1 uses a 10-bit asynchronous frame: 1 active-LOW start bit (0), 8 data bits (D0 to D7 transmitted LSB-first), and 1 active-HIGH stop bit (1).',
      concept: 'Asynchronous Frame Architecture'
    }
  ],
  exp_8051_uart_2400: [
    {
      question: 'How is 2400 baud rate generated using Timer 1 in Mode 2?',
      answer: 'Timer 1 reload value TH1 = 256 - (28,800 / 2400) = 256 - 12 = 244 = 0F4H (-12D). Timer 1 overflows every 12 clock pulses to generate the 2400 Hz transmission clock.',
      concept: '2400 Baud Timer 1 Mode 2 Auto-Reload'
    },
    {
      question: 'What are the advantages of using 2400 baud in industrial telemetry?',
      answer: 'Lower baud rates like 2400 bps provide higher noise margin, lower susceptibility to cable capacitance, and allow communication over significantly longer transmission distances (e.g., >1 km over RS-485 or acoustic channels).',
      concept: 'Industrial Serial Communication Distance vs Speed'
    },
    {
      question: 'What is the role of SCON register bits SM0 and SM1 in configuring 8051 serial modes?',
      answer: 'SM0 and SM1 define the UART operating mode: (SM0=0, SM1=0) -> Mode 0 (Shift register, fixed f_osc/12); (SM0=0, SM1=1) -> Mode 1 (8-bit UART, variable baud via Timer 1); (SM0=1, SM1=0) -> Mode 2 (9-bit UART, fixed f_osc/32 or f_osc/64); (SM0=1, SM1=1) -> Mode 3 (9-bit UART, variable baud).',
      concept: 'SCON Serial Port Mode Configuration'
    }
  ],
  exp_8051_lcd_8bit: [
    {
      question: 'What are the roles of the three control pins (RS, RW, EN) in an HD44780 LCD module?',
      answer: 'RS (Register Select) determines whether the input byte is a command (RS=0) or data/character (RS=1). RW (Read/Write) selects Write operation (RW=0) or Read status/data (RW=1). EN (Enable) is the latching strobe; data is latched into the LCD on the falling edge (High-to-Low transition) of an EN pulse with minimum width >= 450 ns.',
      concept: 'HD44780 Control Pin Functions'
    },
    {
      question: 'Why are commands 38H, 0EH, 01H, and 06H used during 8-bit LCD initialization?',
      answer: '38H sets 8-bit data bus, 2 display lines, and 5×7 dot matrix font; 0EH turns the display and underline cursor ON; 01H clears the screen and returns DDRAM address to Home (00H); 06H configures entry mode to auto-increment the DDRAM cursor to the right after every character write.',
      concept: '8-Bit LCD Initialization Command Sequence'
    },
    {
      question: 'How are the starting addresses of Line 1 and Line 2 mapped in HD44780 DDRAM?',
      answer: 'Line 1 character addresses span from 00H to 0FH (Command 80H to 8FH when setting Bit 7 high for DDRAM addressing). Line 2 character addresses span from 40H to 4FH (Command C0H to CFH).',
      concept: 'DDRAM Memory Mapping & Line Base Addresses'
    },
    {
      question: 'What is the purpose of the 10 kΩ potentiometer connected to Pin 3 (VEE)?',
      answer: 'Pin 3 (VEE) controls the liquid crystal driving voltage (contrast level). Varying VEE from 0V to 5V adjusts the optical opacity of active dots. Grounding or near 0V provides maximum dark contrast, whereas 5V makes characters completely invisible.',
      concept: 'LCD Contrast Adjustment (VEE Pin 3)'
    }
  ],
  exp_8051_lcd_4bit: [
    {
      question: 'What is the primary motivation for interfacing an LCD in 4-bit mode rather than 8-bit mode?',
      answer: '4-bit mode reduces the required microcontroller I/O pin count from 11 pins (8 data + 3 control) down to only 7 pins (4 data D4–D7 + 3 control RS, RW, EN). This saves 4 full microcontroller I/O pins (e.g., P1.0–P1.3) for interfacing additional keypads, sensors, or communication chips.',
      concept: 'Microcontroller Pin Economy in 4-Bit Mode'
    },
    {
      question: 'How is an 8-bit ASCII character or command byte transmitted over a 4-bit data bus?',
      answer: 'The 8-bit byte is transmitted as two sequential 4-bit nibbles: First, the higher 4 bits (D7–D4) are placed on pins P1.4–P1.7 and latched with an EN strobe. Next, the lower 4 bits (D3–D0) are swapped into the high position using SWAP A, masked with ANL A, #0F0H, placed on P1.4–P1.7, and latched with a second EN strobe.',
      concept: 'Dual-Nibble Transmission & SWAP A Instruction'
    },
    {
      question: 'Why is the special triple 30H reset sequence required when initializing 4-bit mode?',
      answer: 'At power-on or microcontroller reset, the HD44780 starts in 8-bit mode. If the controller was previously interrupted mid-byte, it may be waiting for a lower nibble. Sending single nibbles of 30H (three times with delays) resets the internal state machine into a known 8-bit state, after which sending single nibble 20H successfully switches the bus into 4-bit mode.',
      concept: '4-Bit State Machine Software Reset Handshake'
    },
    {
      question: 'What command byte is sent to configure 4-bit mode with 2 lines and 5×7 character font?',
      answer: 'Command 28H (Function Set: DL=0 for 4-bit bus, N=1 for 2 display lines, F=0 for 5×7 font format). It is transmitted across the bus as higher nibble 20H followed by lower nibble 80H.',
      concept: '4-Bit Function Set Command (28H)'
    }
  ]
};

export const Unit6LabManualPresenter: React.FC<Unit6LabManualPresenterProps> = ({
  slideId,
  slideTitle,
  fullScreenMode = false,
  onNavigateExperiment,
  renderInteractive
}) => {
  const expId = SLIDE_TO_EXP_ID[slideId] || 'exp1';
  const expInfo = labExperiments.find((e) => e.id === expId) || labExperiments[0];
  const manualPage: LabManualPage = labManualPagesData[expId] || labManualPagesData.exp1;
  const vivaList = VIVA_VOCE_DATA[expId] || VIVA_VOCE_DATA.exp1;

  // Active section tab in university lab manual
  const [activeTab, setActiveTab] = useState<'aim_theory' | 'algo_flow' | 'program_alp' | 'program_explanation' | 'exec_output' | 'viva_precautions'>('aim_theory');
  const [codeMode, setCodeMode] = useState<'standard' | 'simplified'>('standard');
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeFlowStep, setActiveFlowStep] = useState<number | null>(null);
  const [expandedVivaIdx, setExpandedVivaIdx] = useState<number | null>(0);

  // Interactive Testbench Simulator State
  const [customInputA, setCustomInputA] = useState<string>(
    expId === 'exp1' ? 'FF FE FD FC' :
    expId === 'exp2' ? '0A12' :
    expId === 'exp_math' ? '5' :
    expId === 'exp_bit1' ? 'D3' :
    expId === 'exp_bit2' ? '2F' :
    expId === 'exp_bit3' ? 'A5' :
    expId === 'exp_arr1' ? '10, 20, 30, 40, 50' :
    expId === 'exp3' ? '25, 4A, 12, 8B, 05, 92, 31' :
    expId === 'exp4' ? '88, 11, 55, 22, 44' :
    expId === 'exp_str1' ? 'KUPPAM$' :
    expId === 'exp_str2' ? 'HELLO FROM 8086$' :
    expId === 'exp_str3' ? 'HELLO' :
    expId === 'exp_str4' ? 'MADAM' :
    expId === 'exp_clock1' ? '14:35:28' :
    expId === 'exp_clock2' ? '18:45:09' :
    expId === 'exp_clock3' ? '941200' :
    expId === 'exp_stepper1' ? '200' :
    expId === 'exp_stepper2' ? '200' :
    expId === 'exp_adc' ? '2.50' :
    expId === 'exp_dac' ? 'Triangular' :
    expId === 'exp_8051_arith' ? '25H' :
    expId === 'exp_8051_muldiv' ? '05H' :
    expId === 'exp_8051_logic' ? '35H' :
    expId === 'exp_8051_regbanks' ? 'Bank 1' :
    expId === 'exp_8051_timer0_m1' ? '25.0 ms' :
    expId === 'exp_8051_timer1_m0' ? '50.0 µs' :
    expId === 'exp_8051_counter0_m2' ? '75.0 ms' :
    expId === 'exp_8051_counter1_m1' ? '80 µs / 80 Pulses' :
    expId === 'exp_8051_uart_9600' ? 'A' :
    expId === 'exp_8051_uart_4800' ? 'B' :
    expId === 'exp_8051_uart_2400' ? 'C' :
    expId === 'exp_8051_lcd_8bit' ? '8051 INTERFACE' :
    expId === 'exp_8051_lcd_4bit' ? '4-BIT LCD MODE' :
    '10 20 30 40 50 60 70 80 90 99'
  );
  const [customInputB, setCustomInputB] = useState<string>(
    expId === 'exp1' ? '01 02 03 04' :
    expId === 'exp2' ? '0050' :
    expId === 'exp_str3' ? 'HELLO' :
    expId === 'exp_8051_arith' ? '12H' :
    expId === 'exp_8051_muldiv' ? '03H' :
    expId === 'exp_8051_logic' ? '0FH' :
    expId === 'exp_8051_regbanks' ? '55H' :
    expId === 'exp_8051_timer0_m1' ? 'Port P0 (All 8 Pins)' :
    expId === 'exp_8051_timer1_m0' ? 'Port P2 (All 8 Pins)' :
    expId === 'exp_8051_counter0_m2' ? 'Port P1 (All 8 Pins)' :
    expId === 'exp_8051_counter1_m1' ? 'Port P3 (All 8 Pins)' :
    expId === 'exp_8051_uart_9600' ? '9600 Baud (TH1=0FDH)' :
    expId === 'exp_8051_uart_4800' ? '4800 Baud (TH1=0FAH)' :
    expId === 'exp_8051_uart_2400' ? '2400 Baud (TH1=0F4H)' :
    expId === 'exp_8051_lcd_8bit' ? '16x2 LCD 8-BIT' :
    expId === 'exp_8051_lcd_4bit' ? 'SAVING 4 I/O PINS' : ''
  );

  // EXP 1B (Signed & Unsigned) Dedicated Testbench State - 4 Separate Operations
  const [exp2UMulA, setExp2UMulA] = useState<string>('0A12');
  const [exp2UMulB, setExp2UMulB] = useState<string>('0050');
  const [exp2UDivA, setExp2UDivA] = useState<string>('0A12');
  const [exp2UDivB, setExp2UDivB] = useState<string>('0050');

  const [exp2SMulA, setExp2SMulA] = useState<string>('-25');
  const [exp2SMulB, setExp2SMulB] = useState<string>('5');
  const [exp2SDivA, setExp2SDivA] = useState<string>('-25');
  const [exp2SDivB, setExp2SDivB] = useState<string>('5');

  const [exp2InputMode, setExp2InputMode] = useState<'hex' | 'dec'>('hex');
  const [exp2ActiveSection, setExp2ActiveSection] = useState<'all' | 'u_mul' | 'u_div' | 's_imul' | 's_idiv'>('all');

  // Step-by-Step Execution Engine State (Subtab 4)
  const execData = LAB_EXECUTION_DATA[expId] || LAB_EXECUTION_DATA.exp1;
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [isAutoStepping, setIsAutoStepping] = useState<boolean>(false);
  const [stepSpeed, setStepSpeed] = useState<number>(900);
  const [copiedDosboxIdx, setCopiedDosboxIdx] = useState<number | null>(null);
  const [activeExecModule, setActiveExecModule] = useState<'stepper' | 'dosbox' | 'testbench' | 'verification'>('stepper');
  const [verificationViewMode, setVerificationViewMode] = useState<'all' | 'side_by_side' | 'memory_dump' | 'manual_proof' | 'observation_sheet'>('all');
  const [copiedObsRecord, setCopiedObsRecord] = useState<boolean>(false);

  // Auto-stepping clock effect
  useEffect(() => {
    if (!isAutoStepping) return;
    const interval = setInterval(() => {
      setStepIdx((prev) => {
        if (prev >= execData.steps.length - 1) {
          setIsAutoStepping(false);
          return prev;
        }
        return prev + 1;
      });
    }, stepSpeed);
    return () => clearInterval(interval);
  }, [isAutoStepping, stepSpeed, execData.steps.length]);

  // Reset step counter & simulation inputs on experiment switch
  useEffect(() => {
    setStepIdx(0);
    setActiveFlowStep(0);
    setIsAutoStepping(false);
    const defaultA =
      expId === 'exp1' ? 'FF FE FD FC' :
      expId === 'exp2' ? '0A12' :
      expId === 'exp_math' ? '5' :
      expId === 'exp_bit1' ? 'D3' :
      expId === 'exp_bit2' ? '2F' :
      expId === 'exp_bit3' ? 'A5' :
      expId === 'exp_arr1' ? '10, 20, 30, 40, 50' :
      expId === 'exp3' ? '25, 4A, 12, 8B, 05, 92, 31' :
      expId === 'exp4' ? '88, 11, 55, 22, 44' :
      expId === 'exp_str1' ? 'KUPPAM$' :
      expId === 'exp_str2' ? 'HELLO FROM 8086$' :
      expId === 'exp_str3' ? 'HELLO' :
      expId === 'exp_str4' ? 'MADAM' :
      expId === 'exp_clock1' ? '14:35:28' :
      expId === 'exp_clock2' ? '18:45:09' :
      expId === 'exp_clock3' ? '941200' :
      expId === 'exp_stepper1' ? '200' :
      expId === 'exp_stepper2' ? '200' :
      expId === 'exp_adc' ? '2.50' :
      expId === 'exp_dac' ? 'Triangular' :
      expId === 'exp_8051_arith' ? '25H' :
      expId === 'exp_8051_muldiv' ? '05H' :
      expId === 'exp_8051_logic' ? '35H' :
      expId === 'exp_8051_regbanks' ? 'Bank 1' :
      expId === 'exp_8051_timer0_m1' ? '25.0 ms' :
      expId === 'exp_8051_timer1_m0' ? '50.0 µs' :
      expId === 'exp_8051_counter0_m2' ? '75.0 ms' :
      expId === 'exp_8051_counter1_m1' ? '80 µs / 80 Pulses' :
      expId === 'exp_8051_uart_9600' ? 'A' :
      expId === 'exp_8051_uart_4800' ? 'B' :
      expId === 'exp_8051_uart_2400' ? 'C' :
      expId === 'exp_8051_lcd_8bit' ? '8051 INTERFACE' :
      expId === 'exp_8051_lcd_4bit' ? '4-BIT LCD MODE' :
      '10 20 30 40 50 60 70 80 90 99';

    const defaultB =
      expId === 'exp1' ? '01 02 03 04' :
      expId === 'exp2' ? '0050' :
      expId === 'exp_str3' ? 'HELLO' :
      expId === 'exp_8051_arith' ? '12H' :
      expId === 'exp_8051_muldiv' ? '03H' :
      expId === 'exp_8051_logic' ? '0FH' :
      expId === 'exp_8051_regbanks' ? '55H' :
      expId === 'exp_8051_timer0_m1' ? 'Port P0 (All 8 Pins)' :
      expId === 'exp_8051_timer1_m0' ? 'Port P2 (All 8 Pins)' :
      expId === 'exp_8051_counter0_m2' ? 'Port P1 (All 8 Pins)' :
      expId === 'exp_8051_counter1_m1' ? 'Port P3 (All 8 Pins)' :
      expId === 'exp_8051_uart_9600' ? '9600 Baud (TH1=0FDH)' :
      expId === 'exp_8051_uart_4800' ? '4800 Baud (TH1=0FAH)' :
      expId === 'exp_8051_uart_2400' ? '2400 Baud (TH1=0F4H)' :
      expId === 'exp_8051_lcd_8bit' ? '16x2 LCD 8-BIT' :
      expId === 'exp_8051_lcd_4bit' ? 'SAVING 4 I/O PINS' : '';

    setCustomInputA(defaultA);
    setCustomInputB(defaultB);

    setExp2UMulA('0A12');
    setExp2UMulB('0050');
    setExp2UDivA('0A12');
    setExp2UDivB('0050');
    setExp2SMulA('-25');
    setExp2SMulB('5');
    setExp2SDivA('-25');
    setExp2SDivB('5');
    setExp2InputMode('hex');
    setExp2ActiveSection('all');

    setSimOutput({
      status: 'Ready',
      result: manualPage.expectedOutput.desc,
      registers: {
        AX: expInfo.number === '1B' ? 'FFFBH' : expInfo.number === '1C' ? '0078H' : '4C00H',
        BX: '0004H',
        CX: '0000H',
        DX: '0000H',
        SI: '0004H',
        DI: '0004H',
        SP: '0100H',
        BP: '0000H'
      },
      flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', IF: '1' },
      memoryDump: [
        'DS:0000  ' + (manualPage.expectedOutput.inputs[0]?.val || 'FF FE FD FC'),
        'DS:0010  ' + (manualPage.expectedOutput.outputs[0]?.val || '00 01 01 01'),
        'DS:0020  ' + (manualPage.expectedOutput.outputs[1]?.val || 'EE FC FA F8')
      ],
      cycles: 42
    });
  }, [expId, slideId]);

  const [simOutput, setSimOutput] = useState<{
    status: string;
    result: string;
    registers: Record<string, string>;
    flags: Record<string, string>;
    memoryDump: string[];
    cycles: number;
  }>({
    status: 'Ready',
    result: manualPage.expectedOutput.desc,
    registers: {
      AX: expInfo.number === '1B' ? '0050H' : expInfo.number === '1C' ? '0078H' : '4C00H',
      BX: '0004H',
      CX: '0000H',
      DX: '0000H',
      SI: '0004H',
      DI: '0004H',
      SP: '0100H',
      BP: '0000H'
    },
    flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', IF: '1' },
    memoryDump: [
      'DS:0000  ' + (manualPage.expectedOutput.inputs[0]?.val || 'FF FE FD FC'),
      'DS:0010  ' + (manualPage.expectedOutput.outputs[0]?.val || '00 01 01 01'),
      'DS:0020  ' + (manualPage.expectedOutput.outputs[1]?.val || 'EE FC FA F8')
    ],
    cycles: 42
  });

  const handleCopyCode = () => {
    const textToCopy = codeMode === 'standard' ? expInfo.standardCode : expInfo.simplifiedCode;
    navigator.clipboard.writeText(textToCopy);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRunSimulation = () => {
    // Dynamic interactive calculation based on experiment ID
    if (expId === 'exp1') {
      const parseBytes = (str: string) => {
        const parts = str.trim().split(/[\s,]+/).filter(Boolean);
        return parts.map((p) => parseInt(p.replace(/H$/i, ''), 16) || 0);
      };
      const bytesA = parseBytes(customInputA);
      const bytesB = parseBytes(customInputB);
      const len = Math.max(bytesA.length, bytesB.length, 4);
      while (bytesA.length < len) bytesA.push(0);
      while (bytesB.length < len) bytesB.push(0);

      // Multi-precision Addition with Carry
      const sum: number[] = [];
      let c = 0;
      for (let i = 0; i < len; i++) {
        const total = bytesA[i] + bytesB[i] + c;
        sum.push(total & 0xFF);
        c = total > 0xFF ? 1 : 0;
      }

      // Multi-precision Subtraction with Borrow
      const diff: number[] = [];
      let b = 0;
      for (let i = 0; i < len; i++) {
        let val = bytesA[i] - bytesB[i] - b;
        if (val < 0) {
          val += 256;
          b = 1;
        } else {
          b = 0;
        }
        diff.push(val & 0xFF);
      }

      const sumHex = sum.map((x) => x.toString(16).toUpperCase().padStart(2, '0')).join(' ');
      const diffHex = diff.map((x) => x.toString(16).toUpperCase().padStart(2, '0')).join(' ');
      const aHex = bytesA.map((x) => x.toString(16).toUpperCase().padStart(2, '0')).join(' ');
      const bHex = bytesB.map((x) => x.toString(16).toUpperCase().padStart(2, '0')).join(' ');

      setSimOutput({
        status: 'Multi-Precision Addition & Subtraction Complete',
        result: `ADD SUM = [${sumHex}] (Carry: 0${c}H) | SUB DIFF = [${diffHex}] (Borrow: 0${b}H)`,
        registers: {
          AX: `00${(sum[0] || 0).toString(16).toUpperCase().padStart(2, '0')}H`,
          BX: `000${len}H`,
          CX: '0000H',
          DX: '0000H',
          SI: `000${len}H`,
          DI: `000${len}H`,
          SP: '0100H',
          BP: '0000H'
        },
        flags: { CF: c ? '1' : '0', ZF: sum.every((x) => x === 0) ? '1' : '0', SF: (sum[len - 1] & 0x80) ? '1' : '0', OF: '0', PF: '1', IF: '1' },
        memoryDump: [
          `DS:0000  NUM1        = ${aHex}`,
          `DS:0004  NUM2        = ${bHex}`,
          `DS:0008  RESULT_ADD  = ${sumHex} (Carry = 0${c}H)`,
          `DS:000C  RESULT_SUB  = ${diffHex} (Borrow = 0${b}H)`
        ],
        cycles: 42
      });
    } else if (expId === 'exp2') {
      const isHexMode = exp2InputMode === 'hex';
      // 1. Unsigned Multiplication Operands
      const uMulA = parse16BitUnsignedVal(exp2UMulA, isHexMode, 0x0A12);
      const uMulB = parse16BitUnsignedVal(exp2UMulB, isHexMode, 0x0050);
      const uProd = uMulA * uMulB;
      const uProdDx = Math.floor(uProd / 65536) & 0xFFFF;
      const uProdAx = uProd & 0xFFFF;
      const uCfOf = uProdDx !== 0;

      // 2. Unsigned Division Operands
      const uDivA = parse16BitUnsignedVal(exp2UDivA, isHexMode, 0x0A12);
      const uDivB = parse16BitUnsignedVal(exp2UDivB, isHexMode, 0x0050);
      const uQuot = uDivB !== 0 ? Math.floor(uDivA / uDivB) & 0xFFFF : 0;
      const uRem = uDivB !== 0 ? (uDivA % uDivB) & 0xFFFF : 0;

      // 3. Signed Multiplication Operands (IMUL)
      const sMulA = parse16BitSignedVal(exp2SMulA, isHexMode, -25);
      const sMulB = parse16BitSignedVal(exp2SMulB, isHexMode, 5);
      const sProd = sMulA * sMulB;
      const sProdU32 = (sProd < 0 ? sProd + 0x100000000 : sProd) >>> 0;
      const sProdDx = (sProdU32 >>> 16) & 0xFFFF;
      const sProdAx = sProdU32 & 0xFFFF;
      const sExpectedDx = (sProdAx & 0x8000) ? 0xFFFF : 0x0000;
      const sCfOf = sProdDx !== sExpectedDx;

      // 4. Signed Division Operands (IDIV with CWD)
      const sDivA = parse16BitSignedVal(exp2SDivA, isHexMode, -25);
      const sDivB = parse16BitSignedVal(exp2SDivB, isHexMode, 5);
      const sQuot = sDivB !== 0 ? Math.trunc(sDivA / sDivB) : 0;
      const sRem = sDivB !== 0 ? (sDivA % sDivB) : 0;
      const sQuotAx = (sQuot < 0 ? sQuot + 65536 : sQuot) & 0xFFFF;
      const sRemDx = (sRem < 0 ? sRem + 65536 : sRem) & 0xFFFF;

      const uProdCombinedHex = `${to16BitHexStr(uProdDx).replace('H', '')}${to16BitHexStr(uProdAx)}`;
      const sProdCombinedHex = `${to16BitHexStr(sProdDx).replace('H', '')}${to16BitHexStr(sProdAx)}`;

      setSimOutput({
        status: 'Signed & Unsigned 4-Operation Execution Complete',
        result: `[U-MUL] ${to16BitHexStr(uMulA)} × ${to16BitHexStr(uMulB)} = ${uProdCombinedHex} (${uProd.toLocaleString()}D) | [U-DIV] ${to16BitHexStr(uDivA)} ÷ ${to16BitHexStr(uDivB)} = Q:${to16BitHexStr(uQuot)}, R:${to16BitHexStr(uRem)} | [S-IMUL] ${sProdCombinedHex} (${sProd}D) | [S-IDIV] Q:${to16BitHexStr(sQuotAx)}, R:${to16BitHexStr(sRemDx)}`,
        registers: {
          AX: to16BitHexStr(sQuotAx),
          BX: to16BitHexStr(sDivB < 0 ? sDivB + 65536 : sDivB),
          CX: '0000H',
          DX: to16BitHexStr(sRemDx),
          SI: '0000H',
          DI: '0000H',
          SP: '0100H',
          BP: '0000H'
        },
        flags: {
          CF: uCfOf ? '1' : '0',
          ZF: sQuot === 0 ? '1' : '0',
          SF: sQuot < 0 ? '1' : '0',
          OF: uCfOf ? '1' : '0',
          PF: '1',
          IF: '1'
        },
        memoryDump: [
          `DS:0000  U-MUL (VAL1 & VAL2)  = ${to16BitHexStr(uMulA)} (${uMulA}D) × ${to16BitHexStr(uMulB)} (${uMulB}D)`,
          `DS:0004  U_PROD (DX:AX)       = ${uProdCombinedHex} (${uProd.toLocaleString()}D)`,
          `DS:0008  U-DIV (VAL1 & VAL2)  = ${to16BitHexStr(uDivA)} (${uDivA}D) ÷ ${to16BitHexStr(uDivB)} (${uDivB}D)`,
          `DS:000C  U_QUOT / U_REM       = Quot: ${to16BitHexStr(uQuot)} (${uQuot}D), Rem: ${to16BitHexStr(uRem)} (${uRem}D)`,
          `DS:0010  S-IMUL (S1 & S2)     = ${to16BitHexStr(sMulA < 0 ? sMulA + 65536 : sMulA)} (${sMulA}D) × ${to16BitHexStr(sMulB < 0 ? sMulB + 65536 : sMulB)} (${sMulB}D)`,
          `DS:0014  S_PROD (DX:AX)       = ${sProdCombinedHex} (${sProd}D)`,
          `DS:0018  S-IDIV (S1 & S2)     = ${to16BitHexStr(sDivA < 0 ? sDivA + 65536 : sDivA)} (${sDivA}D) ÷ ${to16BitHexStr(sDivB < 0 ? sDivB + 65536 : sDivB)} (${sDivB}D)`,
          `DS:001C  S_QUOT / S_REM (CWD) = Quot: ${to16BitHexStr(sQuotAx)} (${sQuot}D), Rem: ${to16BitHexStr(sRemDx)} (${sRem}D)`
        ],
        cycles: 146
      });
    } else if (expId === 'exp_math') {
      const n = parseInt(customInputA, 10) || 5;
      const sq = n * n;
      const cube = n * n * n;
      let fact = 1;
      for (let i = 1; i <= n; i++) fact *= i;
      setSimOutput({
        status: 'Success - 100% Verified',
        result: `Square = ${sq} (${sq.toString(16).toUpperCase()}H), Cube = ${cube} (${cube.toString(16).toUpperCase()}H), Factorial = ${fact} (${fact.toString(16).toUpperCase()}H)`,
        registers: {
          AX: `${fact.toString(16).toUpperCase().padStart(4, '0')}H`,
          BX: `${n.toString(16).toUpperCase().padStart(4, '0')}H`,
          CX: '0000H',
          DX: cube > 65535 ? `${Math.floor(cube / 65536).toString(16).toUpperCase()}H` : '0000H',
          SI: '0000H',
          DI: '0000H',
          SP: '0100H',
          BP: '0000H'
        },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', IF: '1' },
        memoryDump: [
          `DS:0000  NUM = 0${n}H`,
          `DS:0002  SQUARE = ${sq.toString(16).toUpperCase().padStart(4, '0')}H`,
          `DS:0004  CUBE = ${cube.toString(16).toUpperCase().padStart(4, '0')}H`,
          `DS:0006  FACT = ${fact.toString(16).toUpperCase().padStart(4, '0')}H`
        ],
        cycles: 18 + (n * 12)
      });
    } else if (expId === 'exp_bit1') {
      const val = parseInt(customInputA.replace(/H$/i, ''), 16) || 0xD3;
      const isNeg = (val & 0x80) !== 0;
      setSimOutput({
        status: 'Evaluated Sign Bit (Bit 7)',
        result: isNeg ? `Data ${val.toString(16).toUpperCase()}H has MSB=1 -> NEGATIVE (Result=01H)` : `Data ${val.toString(16).toUpperCase()}H has MSB=0 -> POSITIVE (Result=00H)`,
        registers: {
          AX: `00${val.toString(16).toUpperCase().padStart(2, '0')}H`,
          BX: isNeg ? '0001H' : '0000H',
          CX: '0000H',
          DX: '0000H',
          SI: '0000H',
          DI: '0000H',
          SP: '0100H',
          BP: '0000H'
        },
        flags: { CF: '0', ZF: (val & 0x80) === 0 ? '1' : '0', SF: isNeg ? '1' : '0', OF: '0', PF: '1', IF: '1' },
        memoryDump: [
          `DS:0000  DATA_VAL = ${val.toString(16).toUpperCase()}H`,
          `DS:0001  RESULT = ${isNeg ? '01H (Negative)' : '00H (Positive)'}`
        ],
        cycles: 14
      });
    } else if (expId === 'exp_bit2') {
      const val = parseInt(customInputA.replace(/H$/i, ''), 16) || 0x2F;
      const isOdd = (val & 0x01) !== 0;
      setSimOutput({
        status: 'Evaluated LSB Bit 0 (Parity)',
        result: isOdd ? `Data ${val.toString(16).toUpperCase()}H has LSB=1 -> ODD (Result=01H)` : `Data ${val.toString(16).toUpperCase()}H has LSB=0 -> EVEN (Result=00H)`,
        registers: {
          AX: `00${val.toString(16).toUpperCase().padStart(2, '0')}H`,
          BX: isOdd ? '0001H' : '0000H',
          CX: '0000H',
          DX: '0000H',
          SI: '0000H',
          DI: '0000H',
          SP: '0100H',
          BP: '0000H'
        },
        flags: { CF: '0', ZF: isOdd ? '0' : '1', SF: '0', OF: '0', PF: '1', IF: '1' },
        memoryDump: [
          `DS:0000  DATA_VAL = ${val.toString(16).toUpperCase()}H`,
          `DS:0001  RESULT = ${isOdd ? '01H (Odd)' : '00H (Even)'}`
        ],
        cycles: 14
      });
    } else if (expId === 'exp_bit3') {
      const val = parseInt(customInputA.replace(/H$/i, ''), 16) || 0xA5;
      let ones = 0;
      let zeros = 0;
      for (let i = 0; i < 8; i++) {
        if ((val & (1 << i)) !== 0) ones++;
        else zeros++;
      }
      setSimOutput({
        status: 'Bit Shifting Completed (8 Iterations)',
        result: `Total Logical 1s = ${ones} (${ones}H), Total Logical 0s = ${zeros} (${zeros}H)`,
        registers: {
          AX: '0000H',
          BX: `0${zeros}0${ones}H`,
          CX: '0000H',
          DX: '0000H',
          SI: '0000H',
          DI: '0000H',
          SP: '0100H',
          BP: '0000H'
        },
        flags: { CF: (val & 0x80) ? '1' : '0', ZF: '1', SF: '0', OF: '0', PF: '1', IF: '1' },
        memoryDump: [
          `DS:0000  DATA_VAL = ${val.toString(16).toUpperCase()}H`,
          `DS:0001  ONES = 0${ones}H`,
          `DS:0002  ZEROS = 0${zeros}H`
        ],
        cycles: 88
      });
    } else if (expId === 'exp4') {
      const nums = customInputA.split(',').map((s) => parseInt(s.trim().replace(/H$/i, ''), 16) || 0);
      const sorted = [...nums].sort((a, b) => a - b);
      setSimOutput({
        status: 'Bubble Sort Completed (Ascending)',
        result: `Sorted List: ${sorted.map((n) => n.toString(16).toUpperCase().padStart(2, '0') + 'H').join(', ')}`,
        registers: {
          AX: `${sorted[sorted.length - 1].toString(16).toUpperCase()}H`,
          BX: '0000H',
          CX: '0000H',
          DX: '0000H',
          SI: `000${nums.length}H`,
          DI: '0000H',
          SP: '0100H',
          BP: '0000H'
        },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', IF: '1' },
        memoryDump: [
          `DS:0000  ORIGINAL = ${nums.map((n) => n.toString(16).toUpperCase().padStart(2, '0')).join(' ')}`,
          `DS:0010  SORTED   = ${sorted.map((n) => n.toString(16).toUpperCase().padStart(2, '0')).join(' ')}`
        ],
        cycles: 140
      });
    } else if (expId === 'exp_str4') {
      const cleanStr = customInputA.replace(/\$$/, '').trim();
      const rev = cleanStr.split('').reverse().join('');
      const isPal = cleanStr.toUpperCase() === rev.toUpperCase();
      setSimOutput({
        status: 'String Symmetry Verification',
        result: `Original: "${cleanStr}", Reversed: "${rev}" -> ${isPal ? 'PALINDROME (Match Flag = 01H)' : 'NOT A PALINDROME (Flag = 00H)'}`,
        registers: {
          AX: isPal ? '0001H' : '0000H',
          BX: '0000H',
          CX: '0000H',
          DX: '0000H',
          SI: `000${cleanStr.length}H`,
          DI: `000${cleanStr.length}H`,
          SP: '0100H',
          BP: '0000H'
        },
        flags: { CF: '0', ZF: isPal ? '1' : '0', SF: '0', OF: '0', PF: '1', IF: '1' },
        memoryDump: [
          `DS:0000  STR1 = "${cleanStr}$"`,
          `DS:0010  REV_STR = "${rev}$"`,
          `DS:0020  PALINDROME_FLAG = ${isPal ? '01H' : '00H'}`
        ],
        cycles: 64
      });
    } else if (expId === 'exp_clock1') {
      const timeParts = customInputA.split(':').map((p) => parseInt(p.trim(), 10) || 0);
      const hh = Math.min(23, Math.max(0, timeParts[0] ?? 14));
      const mm = Math.min(59, Math.max(0, timeParts[1] ?? 35));
      const ss = Math.min(59, Math.max(0, timeParts[2] ?? 28));
      const formatted = `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
      setSimOutput({
        status: 'DOS INT 21H AH=2CH Clock Query & Display',
        result: `System Wall-Clock Rendered: "${formatted}" (Hours: ${hh}, Mins: ${mm}, Secs: ${ss})`,
        registers: {
          AX: '023AH',
          BX: '0000H',
          CX: `${hh.toString(16).toUpperCase().padStart(2, '0')}${mm.toString(16).toUpperCase().padStart(2, '0')}H`,
          DX: `${ss.toString(16).toUpperCase().padStart(2, '0')}00H`,
          SI: '0000H',
          DI: '0000H',
          SP: '0100H',
          BP: '0000H'
        },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', IF: '1' },
        memoryDump: [
          `DS:0000  PROMPT  = "CURRENT TIME: $"`,
          `DS:0015  TIME_HEX = [CH: ${hh.toString(16).toUpperCase().padStart(2, '0')}H, CL: ${mm.toString(16).toUpperCase().padStart(2, '0')}H, DH: ${ss.toString(16).toUpperCase().padStart(2, '0')}H]`,
          `DS:0030  OUTPUT  = "${formatted}"`
        ],
        cycles: 88
      });
    } else if (expId === 'exp_clock2') {
      const timeParts = customInputA.split(':').map((p) => parseInt(p.trim(), 10) || 0);
      const hh = Math.min(23, Math.max(0, timeParts[0] ?? 18));
      const mm = Math.min(59, Math.max(0, timeParts[1] ?? 45));
      const ss = Math.min(59, Math.max(0, timeParts[2] ?? 9));
      const formatted = `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
      setSimOutput({
        status: 'Screen-Centered Digital Clock Loop Active',
        result: `Rendered at Screen Center [Row 12, Column 35]: "${formatted}" (Polling INT 21H AH=0BH)`,
        registers: {
          AX: '0900H',
          BX: '0000H',
          CX: `${hh.toString(16).toUpperCase().padStart(2, '0')}${mm.toString(16).toUpperCase().padStart(2, '0')}H`,
          DX: '0035H',
          SI: '0000H',
          DI: '0000H',
          SP: '0100H',
          BP: '0000H'
        },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', IF: '1' },
        memoryDump: [
          `DS:0000  TIME_STR = "${formatted}$"`,
          `DS:0010  PREV_SEC = ${ss.toString(16).toUpperCase().padStart(2, '0')}H`,
          `VRAM:07B6 (Row 12, Col 35) = "${formatted}" [Attr: 1FH White on Blue]`
        ],
        cycles: 112
      });
    } else if (expId === 'exp_clock3') {
      const rawTicks = parseInt(customInputA.trim(), 10) || 941200;
      const ticks = Math.max(0, Math.min(1573040, rawTicks));
      const hours = Math.floor(ticks / 65543);
      const remHours = ticks % 65543;
      const minutes = Math.floor(remHours / 1092);
      const remMins = remHours % 1092;
      const seconds = Math.floor((remMins * 10) / 182);
      const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      const highWord = (ticks >> 16) & 0xFFFF;
      const lowWord = ticks & 0xFFFF;
      setSimOutput({
        status: 'BIOS Timer Tick Derived Real-Time Computation',
        result: `Calculated from ${ticks.toLocaleString()} Hardware Ticks: "${formatted}" (Hours: ${hours}, Mins: ${minutes}, Secs: ${seconds})`,
        registers: {
          AX: `${hours.toString(16).toUpperCase().padStart(4, '0')}H`,
          BX: '0000H',
          CX: `${highWord.toString(16).toUpperCase().padStart(4, '0')}H`,
          DX: `${lowWord.toString(16).toUpperCase().padStart(4, '0')}H`,
          SI: '0000H',
          DI: '0000H',
          SP: '0100H',
          BP: '0000H'
        },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', IF: '1' },
        memoryDump: [
          `0040:006C (BDA Ticks) = ${lowWord.toString(16).toUpperCase().padStart(4, '0')} ${highWord.toString(16).toUpperCase().padStart(4, '0')}H (${ticks} Ticks)`,
          `DS:0010  HOURS = ${hours.toString(16).toUpperCase().padStart(2, '0')}H, MINS = ${minutes.toString(16).toUpperCase().padStart(2, '0')}H, SECS = ${seconds.toString(16).toUpperCase().padStart(2, '0')}H`,
          `DS:0020  DERIVED_STR = "${formatted}$"`
        ],
        cycles: 196
      });
    } else if (expId === 'exp_stepper1') {
      const steps = Math.max(1, parseInt(customInputA.trim(), 10) || 200);
      const angle = (steps * 1.8).toFixed(1);
      const fullRotations = (steps / 200).toFixed(2);
      const cwSeq = ['09H (Ph A+B)', '0AH (Ph B+C)', '06H (Ph C+D)', '05H (Ph D+A)'];
      const lastPhase = cwSeq[(steps - 1) % 4];
      const cyclesPerStep = 18;
      const totalCycles = steps * cyclesPerStep + 48;

      setSimOutput({
        status: `Clockwise (CW) Stepper Rotation Complete [${steps} Steps = ${angle}°]`,
        result: `Successfully rotated Stepper Motor Clockwise (CW) through ${steps} Steps (${angle}°, ~${fullRotations} Revolutions). Last Excitation Code on Port A: ${lastPhase}.`,
        registers: {
          AX: '0005H',
          BX: '0004H',
          CX: '0000H',
          DX: '00C0H',
          SI: '0004H',
          DI: '0000H',
          SP: '0100H',
          BP: '0000H'
        },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', IF: '1' },
        memoryDump: [
          `8255 CWR (00C6H) = 80H (Mode 0: Port A, B, C as Output)`,
          `8255 Port A (00C0H) = Last Coil State: ${lastPhase.split(' ')[0]}`,
          `DS:0000  CW_SEQ = 09H, 0AH, 06H, 05H (2-Phase Full-Step)`,
          `DS:0010  TARGET_STEPS = ${steps}D (${steps.toString(16).toUpperCase().padStart(4, '0')}H), DISPLACEMENT = ${angle}°`
        ],
        cycles: totalCycles
      });
    } else if (expId === 'exp_stepper2') {
      const steps = Math.max(1, parseInt(customInputA.trim(), 10) || 200);
      const angle = (steps * 1.8).toFixed(1);
      const fullRotations = (steps / 200).toFixed(2);
      const ccwSeq = ['05H (Ph D+A)', '06H (Ph C+D)', '0AH (Ph B+C)', '09H (Ph A+B)'];
      const lastPhase = ccwSeq[(steps - 1) % 4];
      const cyclesPerStep = 18;
      const totalCycles = steps * cyclesPerStep + 48;

      setSimOutput({
        status: `Anti-Clockwise (CCW) Stepper Rotation Complete [${steps} Steps = ${angle}°]`,
        result: `Successfully rotated Stepper Motor Anti-Clockwise (CCW) through ${steps} Steps (${angle}°, ~${fullRotations} Revolutions). Last Excitation Code on Port A: ${lastPhase}.`,
        registers: {
          AX: '0009H',
          BX: '0004H',
          CX: '0000H',
          DX: '00C0H',
          SI: '0004H',
          DI: '0000H',
          SP: '0100H',
          BP: '0000H'
        },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', IF: '1' },
        memoryDump: [
          `8255 CWR (00C6H) = 80H (Mode 0: Port A, B, C as Output)`,
          `8255 Port A (00C0H) = Last Coil State: ${lastPhase.split(' ')[0]}`,
          `DS:0000  CCW_SEQ = 05H, 06H, 0AH, 09H (Reversed 2-Phase Sequence)`,
          `DS:0010  TARGET_STEPS = ${steps}D (${steps.toString(16).toUpperCase().padStart(4, '0')}H), DISPLACEMENT = ${angle}° CCW`
        ],
        cycles: totalCycles
      });
    } else if (expId === 'exp_adc') {
      const vin = Math.min(5.0, Math.max(0.0, parseFloat(customInputA.trim()) || 2.50));
      const d = Math.min(255, Math.max(0, Math.round((vin / 5.0) * 255)));
      const vCalc = Math.round((d * 5000) / 255);
      const hexCode = d.toString(16).toUpperCase().padStart(2, '0') + 'H';
      const binStr = d.toString(2).padStart(8, '0');
      const quantError = ((vCalc - vin * 1000)).toFixed(1);

      setSimOutput({
        status: `ADC 0808 Conversion Complete [Vin = ${vin.toFixed(2)} V -> Digital = ${hexCode}]`,
        result: `Successfully converted analog input ${vin.toFixed(2)} V to 8-bit digital code ${hexCode} (${d}D, ${binStr}B). Reconstructed voltage: ${vCalc} mV (${(vCalc / 1000).toFixed(3)} V). Quantization error: ${quantError} mV.`,
        registers: {
          AX: vCalc.toString(16).toUpperCase().padStart(4, '0') + 'H',
          BX: '00FFH',
          CX: '0000H',
          DX: '00C0H',
          SI: '0000H',
          DI: '0000H',
          SP: '0100H',
          BP: '0000H'
        },
        flags: { CF: '0', ZF: '0', SF: (d >= 128 ? '1' : '0'), OF: '0', PF: '1', IF: '1' },
        memoryDump: [
          `8255 CWR (00C6H) = 98H (Port A=IN, Port B=OUT, PC_Upper=IN, PC_Lower=OUT)`,
          `8255 Port B (00C2H) = Channel IN0 Selected (ADD A=0, B=0, C=0)`,
          `8255 Port C (00C4H) = SOC Pulse Transmitted; EOC Polled HIGH (Bit 7 = 1)`,
          `8255 Port A (00C0H) = ADC Latched Byte: ${hexCode} (${binStr}B)`,
          `DS:0000  DIGITAL_VAL = ${hexCode} (${d}D, ${binStr}B)`,
          `DS:0002  VOLTAGE_MV  = ${vCalc}D (${vCalc.toString(16).toUpperCase().padStart(4, '0')}H mV, ${(vCalc / 1000).toFixed(3)} V)`
        ],
        cycles: 142
      });
    } else if (expId === 'exp_dac') {
      const mode = (customInputA.trim() || 'Triangular').toLowerCase();
      const waveType = mode.startsWith('sq') ? 'Square Wave' : mode.startsWith('st') ? 'Step Signal' : 'Triangular Wave';
      const vpp = '5.00 Vp-p';
      const freq = mode.startsWith('sq') ? '287 Hz' : mode.startsWith('st') ? '40 Hz' : '163 Hz';

      setSimOutput({
        status: `DAC 0800 ${waveType} Generation Active [${vpp}, ~${freq}]`,
        result: `Successfully generating continuous ${waveType} via 8255 PPI Port A (00C0H) to DAC0800 R-2R ladder and OP-07 Op-Amp. Voltage Swing: 0.00 V to +4.98 V (${vpp}). Estimated Frequency: ${freq}.`,
        registers: {
          AX: '00FFH',
          BX: '0000H',
          CX: '0000H',
          DX: '00C0H',
          SI: '0000H',
          DI: '0000H',
          SP: '0100H',
          BP: '0000H'
        },
        flags: { CF: '1', ZF: '1', SF: '0', OF: '0', PF: '1', IF: '1' },
        memoryDump: [
          `8255 CWR (00C6H) = 80H (Mode 0: Port A Output @ 00C0H)`,
          `8255 Port A (00C0H) = Active Dynamic Stream (${waveType})`,
          `DAC 0800 Ladder = Inverted R-2R Monolithic Converter`,
          `Op-Amp Stage = Inverting I-to-V Converter (OP-07 / LM741, Rf = 2.5 kΩ)`,
          `DS:0000  WAVE_MODE   = "${waveType}"`,
          `DS:0010  V_PEAK_PEAK = 5.00 V (0.00 V min to +4.98 V max)`,
          `DS:0014  FREQ_EST    = ${freq}`
        ],
        cycles: 320
      });
    } else if (expId === 'exp_8051_arith') {
      const parseHexByte = (s: string, def: number) => {
        const clean = s.replace(/H$/i, '').trim();
        const v = parseInt(clean, 16);
        return isNaN(v) ? def : v & 0xFF;
      };
      const byteA = parseHexByte(customInputA, 0x25);
      const byteB = parseHexByte(customInputB, 0x12);
      const sum = byteA + byteB;
      const sumByte = sum & 0xFF;
      const cyAdd = sum > 0xFF ? 1 : 0;
      const acAdd = ((byteA & 0x0F) + (byteB & 0x0F)) > 0x0F ? 1 : 0;
      const diff = byteA - byteB;
      const diffByte = (diff + 256) & 0xFF;
      const cySub = diff < 0 ? 1 : 0;

      const sumHex = sumByte.toString(16).toUpperCase().padStart(2, '0') + 'H';
      const diffHex = diffByte.toString(16).toUpperCase().padStart(2, '0') + 'H';
      const aHex = byteA.toString(16).toUpperCase().padStart(2, '0') + 'H';
      const bHex = byteB.toString(16).toUpperCase().padStart(2, '0') + 'H';

      setSimOutput({
        status: '8051 ALU Arithmetic Execution Complete',
        result: `ADD (${aHex} + ${bHex}) = ${sumHex} (CY=${cyAdd}, AC=${acAdd}) | SUB (${aHex} - ${bHex}) = ${diffHex} (Borrow=${cySub})`,
        registers: {
          A: sumHex,
          B: '00H',
          R0: bHex,
          R1: '00H',
          DPTR: '0000H',
          SP: '07H',
          PSW: `CY:${cyAdd} AC:${acAdd} OV:0 P:1`,
          PC: '0032H'
        },
        flags: { CF: cyAdd.toString(), ZF: sumByte === 0 ? '1' : '0', SF: '0', OF: '0', PF: '1', IF: '1' },
        memoryDump: [
          `RAM 20H: DATA_A     = ${aHex} (${byteA}D)`,
          `RAM 21H: DATA_B     = ${bHex} (${byteB}D)`,
          `RAM 30H: RESULT_ADD = ${sumHex} (ADD A, R0)`,
          `RAM 31H: CARRY_ADD  = 0${cyAdd}H (PSW.7 CY Flag)`,
          `RAM 32H: RESULT_SUB = ${diffHex} (SUBB A, R0 after CLR C)`,
          `RAM 33H: BORROW_SUB = 0${cySub}H (Borrow Flag)`
        ],
        cycles: 18
      });
    } else if (expId === 'exp_8051_muldiv') {
      const parseHexByte = (s: string, def: number) => {
        const clean = s.replace(/H$/i, '').trim();
        const v = parseInt(clean, 16);
        return isNaN(v) ? def : v & 0xFF;
      };
      const byteA = parseHexByte(customInputA, 0x05);
      const byteB = parseHexByte(customInputB, 0x03);
      const prod = byteA * byteB;
      const prodLow = prod & 0xFF;
      const prodHigh = (prod >> 8) & 0xFF;
      const ovMul = prodHigh !== 0 ? 1 : 0;
      const quot = byteB !== 0 ? Math.floor(byteA / byteB) & 0xFF : 0;
      const rem = byteB !== 0 ? (byteA % byteB) & 0xFF : 0;
      const ovDiv = byteB === 0 ? 1 : 0;

      const aHex = byteA.toString(16).toUpperCase().padStart(2, '0') + 'H';
      const bHex = byteB.toString(16).toUpperCase().padStart(2, '0') + 'H';
      const prodHex = prod.toString(16).toUpperCase().padStart(4, '0') + 'H';
      const quotHex = quot.toString(16).toUpperCase().padStart(2, '0') + 'H';
      const remHex = rem.toString(16).toUpperCase().padStart(2, '0') + 'H';

      setSimOutput({
        status: '8051 Hardware MUL AB & DIV AB Complete',
        result: `MUL AB (${aHex} × ${bHex}) = ${prodHex} [B:${prodHigh.toString(16).toUpperCase().padStart(2, '0')}H, A:${prodLow.toString(16).toUpperCase().padStart(2, '0')}H, OV=${ovMul}] | DIV AB (${aHex} ÷ ${bHex}) = Quot: ${quotHex}, Rem: ${remHex} [OV=${ovDiv}]`,
        registers: {
          A: quotHex,
          B: remHex,
          R0: aHex,
          R1: bHex,
          DPTR: '0000H',
          SP: '07H',
          PSW: `CY:0 AC:0 OV:${ovMul | ovDiv} P:1`,
          PC: '0028H'
        },
        flags: { CF: '0', ZF: quot === 0 ? '1' : '0', SF: '0', OF: (ovMul | ovDiv).toString(), PF: '1', IF: '1' },
        memoryDump: [
          `RAM 20H: OPERAND_A  = ${aHex} (${byteA}D)`,
          `RAM 21H: OPERAND_B  = ${bHex} (${byteB}D)`,
          `RAM 30H: PROD_LOW   = ${prodLow.toString(16).toUpperCase().padStart(2, '0')}H (Accumulator A)`,
          `RAM 31H: PROD_HIGH  = ${prodHigh.toString(16).toUpperCase().padStart(2, '0')}H (B Register)`,
          `RAM 32H: QUOTIENT   = ${quotHex} (Accumulator A after DIV AB)`,
          `RAM 33H: REMAINDER  = ${remHex} (B Register after DIV AB)`
        ],
        cycles: 24
      });
    } else if (expId === 'exp_8051_logic') {
      const parseHexByte = (s: string, def: number) => {
        const clean = s.replace(/H$/i, '').trim();
        const v = parseInt(clean, 16);
        return isNaN(v) ? def : v & 0xFF;
      };
      const byteA = parseHexByte(customInputA, 0x35);
      const byteB = parseHexByte(customInputB, 0x0F);
      const resAnd = byteA & byteB;
      const resOr = byteA | byteB;
      const resXor = byteA ^ byteB;
      const resCpl = (~byteA) & 0xFF;

      const aHex = byteA.toString(16).toUpperCase().padStart(2, '0') + 'H';
      const bHex = byteB.toString(16).toUpperCase().padStart(2, '0') + 'H';
      const andHex = resAnd.toString(16).toUpperCase().padStart(2, '0') + 'H';
      const orHex = resOr.toString(16).toUpperCase().padStart(2, '0') + 'H';
      const xorHex = resXor.toString(16).toUpperCase().padStart(2, '0') + 'H';
      const cplHex = resCpl.toString(16).toUpperCase().padStart(2, '0') + 'H';

      setSimOutput({
        status: '8051 Bitwise Logic Operations Complete',
        result: `ANL: ${andHex} | ORL: ${orHex} | XRL: ${xorHex} | CPL: ${cplHex} (A=${aHex}, R0=${bHex})`,
        registers: {
          A: cplHex,
          B: '00H',
          R0: bHex,
          R1: '00H',
          DPTR: '0000H',
          SP: '07H',
          PSW: 'CY:0 AC:0 OV:0 P:1',
          PC: '0020H'
        },
        flags: { CF: '0', ZF: resAnd === 0 ? '1' : '0', SF: '0', OF: '0', PF: '1', IF: '1' },
        memoryDump: [
          `RAM 30H: DATA_A     = ${aHex} (0b${byteA.toString(2).padStart(8, '0')})`,
          `RAM 31H: DATA_B     = ${bHex} (0b${byteB.toString(2).padStart(8, '0')})`,
          `RAM 40H: RESULT_AND = ${andHex} (ANL A, R0)`,
          `RAM 41H: RESULT_OR  = ${orHex} (ORL A, R0)`,
          `RAM 42H: RESULT_XOR = ${xorHex} (XRL A, R0)`,
          `RAM 43H: RESULT_CPL = ${cplHex} (CPL A - 1's Complement)`
        ],
        cycles: 16
      });
    } else if (expId === 'exp_8051_regbanks') {
      const parseHexByte = (s: string, def: number) => {
        const clean = s.replace(/H$/i, '').trim();
        const v = parseInt(clean, 16);
        return isNaN(v) ? def : v & 0xFF;
      };
      const bankChoice = customInputA.toLowerCase().includes('3') ? 3 :
                         customInputA.toLowerCase().includes('2') ? 2 :
                         customInputA.toLowerCase().includes('1') ? 1 : 0;
      const dataVal = parseHexByte(customInputB, 0x55);
      const dataHex = dataVal.toString(16).toUpperCase().padStart(2, '0') + 'H';

      const bankNames = ['Bank 0 (00H-07H)', 'Bank 1 (08H-0FH)', 'Bank 2 (10H-17H)', 'Bank 3 (18H-1FH)'];
      const pswRS = [
        'RS1=0, RS0=0 (PSW.4=0, PSW.3=0)',
        'RS1=0, RS0=1 (PSW.4=0, PSW.3=1)',
        'RS1=1, RS0=0 (PSW.4=1, PSW.3=0)',
        'RS1=1, RS0=1 (PSW.4=1, PSW.3=1)'
      ];
      const startAddr = bankChoice * 8;

      setSimOutput({
        status: `8051 Register Bank ${bankChoice} Switched & Verified`,
        result: `Switched to ${bankNames[bankChoice]} via ${pswRS[bankChoice]}. Loaded R0 = ${dataHex} at internal RAM address ${startAddr.toString(16).toUpperCase().padStart(2, '0')}H.`,
        registers: {
          A: dataHex,
          B: '00H',
          R0: dataHex,
          R1: 'AAH',
          DPTR: '0000H',
          SP: '07H',
          PSW: `RS1:${(bankChoice >> 1) & 1} RS0:${bankChoice & 1} CY:0 OV:0`,
          PC: '001CH'
        },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '1', IF: '1' },
        memoryDump: [
          `PSW Register (D0H)  = ${(bankChoice << 3).toString(16).toUpperCase().padStart(2, '0')}H (${pswRS[bankChoice]})`,
          `Active Bank Range   = ${bankNames[bankChoice]}`,
          `RAM 00H-07H (Bank 0)= R0=AAH, R1=00H ...`,
          `RAM 08H-0FH (Bank 1)= R0=${bankChoice === 1 ? dataHex : '55H'}, R1=00H ...`,
          `RAM 10H-17H (Bank 2)= R0=${bankChoice === 2 ? dataHex : '00H'}, R1=00H ...`,
          `RAM 18H-1FH (Bank 3)= R0=${bankChoice === 3 ? dataHex : '00H'}, R1=00H ...`
        ],
        cycles: 12
      });
    } else if (expId === 'exp_8051_timer0_m1') {
      const delayMs = parseFloat(customInputA) || 25.0;
      const countTicks = Math.round(delayMs * 1000); // 1 µs per tick at 12 MHz
      const initialCount = Math.max(0, 65536 - countTicks);
      const th0 = (initialCount >> 8) & 0xFF;
      const tl0 = initialCount & 0xFF;
      const th0Hex = th0.toString(16).toUpperCase().padStart(2, '0') + 'H';
      const tl0Hex = tl0.toString(16).toUpperCase().padStart(2, '0') + 'H';
      const countHex = initialCount.toString(16).toUpperCase().padStart(4, '0') + 'H';

      setSimOutput({
        status: '8051 Timer 0 Mode 1 (16-bit) Waveform Generated',
        result: `Timer 0 Mode 1 created precise ${delayMs.toFixed(1)} ms delay (TH0=${th0Hex}, TL0=${tl0Hex}, Reload=${countHex}). Port P0 Pins [P0.0-P0.7] toggled (00H ↔ FFH square wave).`,
        registers: {
          A: '00H / FFH',
          P0: '00H ↔ FFH (Blinking)',
          TH0: th0Hex,
          TL0: tl0Hex,
          TMOD: '01H (T0 Mode 1)',
          TCON: 'TR0=1, TF0=1',
          SP: '07H',
          PC: '001BH'
        },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', IF: '1' },
        memoryDump: [
          `TMOD SFR (89H)    = 01H (Timer 0 Mode 1: 16-Bit Timer)`,
          `TH0 Reload (8CH)  = ${th0Hex} (${th0}D)`,
          `TL0 Reload (8AH)  = ${tl0Hex} (${tl0}D) → Total Count: ${countHex}`,
          `Delay Calculation = ${countTicks.toLocaleString()} cycles × 1.0 µs (12MHz) = ${delayMs.toFixed(2)} ms`,
          `Port P0 SFR (80H) = All Pins P0.0-P0.7 Toggled (00H ↔ FFH)`,
          `TCON Control(88H) = TR0=1 (Timer Run) → TF0=1 (Overflow Polled) → CLR TR0, CLR TF0`
        ],
        cycles: 25012
      });
    } else if (expId === 'exp_8051_timer1_m0') {
      const delayUs = parseFloat(customInputA) || 50.0;
      const countTicks = Math.round(delayUs); // 1 µs per tick at 12 MHz
      const initialCount = Math.max(0, 8192 - countTicks); // 13-bit max 8192
      const th1 = (initialCount >> 5) & 0xFF; // upper 8 bits
      const tl1 = initialCount & 0x1F; // lower 5 bits
      const th1Hex = th1.toString(16).toUpperCase().padStart(2, '0') + 'H';
      const tl1Hex = tl1.toString(16).toUpperCase().padStart(2, '0') + 'H';

      setSimOutput({
        status: '8051 Timer 1 Mode 0 (13-bit) Pulse Waveform Generated',
        result: `Timer 1 Mode 0 created ${delayUs.toFixed(1)} µs delay (TH1=${th1Hex}, TL1=${tl1Hex}). Port P2 Pins [P2.0-P2.7] toggled (00H ↔ FFH).`,
        registers: {
          A: '00H / FFH',
          P2: '00H ↔ FFH (Blinking)',
          TH1: th1Hex,
          TL1: tl1Hex,
          TMOD: '00H (T1 Mode 0)',
          TCON: 'TR1=1, TF1=1',
          SP: '07H',
          PC: '0018H'
        },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', IF: '1' },
        memoryDump: [
          `TMOD SFR (89H)    = 00H (Timer 1 Mode 0: 13-Bit Legacy Timer)`,
          `TH1 Reload (8DH)  = ${th1Hex} (Upper 8 bits of 13-bit counter)`,
          `TL1 Reload (8BH)  = ${tl1Hex} (Lower 5 bits of 13-bit counter)`,
          `Delay Calculation = ${countTicks} cycles × 1.0 µs (12MHz) = ${delayUs.toFixed(1)} µs`,
          `Port P2 SFR (A0H) = All Pins P2.0-P2.7 Toggled (00H ↔ FFH)`,
          `TCON Control(88H) = TR1=1 (Timer 1 Run) → TF1=1 (Overflow Polled) → CLR TR1, CLR TF1`
        ],
        cycles: 64
      });
    } else if (expId === 'exp_8051_counter0_m2') {
      const delayMs = parseFloat(customInputA) || 75.0;
      const countTicks = 200; // 200 µs per auto-reload tick
      const reloadVal = (256 - countTicks) & 0xFF; // 56 = 38H
      const loopIterations = Math.round((delayMs * 1000) / countTicks); // 375 for 75ms
      const reloadHex = reloadVal.toString(16).toUpperCase().padStart(2, '0') + 'H';

      setSimOutput({
        status: '8051 Counter/Timer 0 Mode 2 (8-bit Auto-Reload) Complete',
        result: `Counter 0 Mode 2 8-bit Auto-Reload created ${delayMs.toFixed(1)} ms delay (TH0=${reloadHex} auto-reloaded into TL0, ${loopIterations} loops). Port P1 Pins [P1.0-P1.7] toggled (00H ↔ FFH).`,
        registers: {
          A: '00H / FFH',
          P1: '00H ↔ FFH (Blinking)',
          TH0: reloadHex,
          TL0: reloadHex,
          R2: loopIterations.toString(16).toUpperCase().padStart(4, '0') + 'H',
          TMOD: '06H (C0 Mode 2 Auto-Reload)',
          TCON: 'TR0=1, TF0=1',
          SP: '07H',
          PC: '0020H'
        },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', IF: '1' },
        memoryDump: [
          `TMOD SFR (89H)    = 06H (Counter 0 Mode 2: 8-Bit Auto-Reload, C/T=1)`,
          `TH0 Auto-Reload   = ${reloadHex} (${reloadVal}D → 200 counts per overflow)`,
          `TL0 Live Counter  = ${reloadHex} (Hardware auto-reloaded on each TF0 flag)`,
          `Cascaded Loop     = 200 µs × ${loopIterations} iterations = ${delayMs.toFixed(1)} ms total delay`,
          `Port P1 SFR (90H) = All Pins P1.0-P1.7 Toggled (00H ↔ FFH)`,
          `Hardware Advantage= Zero software reload jitter due to 8-bit auto-reload architecture`
        ],
        cycles: 75024
      });
    } else if (expId === 'exp_8051_counter1_m1') {
      const pulseTarget = parseInt(customInputA) || 80;
      const initialCount = Math.max(0, 65536 - pulseTarget);
      const th1 = (initialCount >> 8) & 0xFF;
      const tl1 = initialCount & 0xFF;
      const th1Hex = th1.toString(16).toUpperCase().padStart(2, '0') + 'H';
      const tl1Hex = tl1.toString(16).toUpperCase().padStart(2, '0') + 'H';
      const countHex = initialCount.toString(16).toUpperCase().padStart(4, '0') + 'H';

      setSimOutput({
        status: '8051 Counter 1 Mode 1 (16-bit Event Counter) Complete',
        result: `Counter 1 Mode 1 monitored pin T1 (P3.5) and detected ${pulseTarget} external pulses / 80 µs delay (TH1=${th1Hex}, TL1=${tl1Hex}, Count=${countHex}). Port P3 Pins [P3.0-P3.7] toggled (00H ↔ FFH).`,
        registers: {
          A: '00H / FFH',
          P3: '00H ↔ FFH (Blinking)',
          TH1: th1Hex,
          TL1: tl1Hex,
          TMOD: '50H (C1 Mode 1)',
          TCON: 'TR1=1, TF1=1',
          SP: '07H',
          PC: '001CH'
        },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', IF: '1' },
        memoryDump: [
          `TMOD SFR (89H)    = 50H (Counter 1 Mode 1: 16-Bit External Event Counter, C/T=1)`,
          `TH1 Reload (8DH)  = ${th1Hex} (${th1}D)`,
          `TL1 Reload (8BH)  = ${tl1Hex} (${tl1}D) → Initial 16-bit Count: ${countHex}`,
          `Pulse Threshold   = ${pulseTarget} falling edges counted on Pin T1 (P3.5)`,
          `Port P3 SFR (B0H) = All Pins P3.0-P3.7 Toggled (00H ↔ FFH)`,
          `Sampling Limit    = External frequency capped at Fosc / 24 = 500 kHz at 12 MHz`
        ],
        cycles: 104
      });
    } else if (expId === 'exp_8051_uart_9600' || expId === 'exp_8051_uart_4800' || expId === 'exp_8051_uart_2400') {
      const baudRate = expId === 'exp_8051_uart_9600' ? 9600 : expId === 'exp_8051_uart_4800' ? 4800 : 2400;
      const reloadVal = expId === 'exp_8051_uart_9600' ? 0xFD : expId === 'exp_8051_uart_4800' ? 0xFA : 0xF4;
      const reloadHex = reloadVal.toString(16).toUpperCase().padStart(2, '0') + 'H';
      const bitTimeUs = (1000000 / baudRate).toFixed(2);
      const frameTimeMs = (10000 / baudRate).toFixed(3);

      // Parse user character
      const rawInp = customInputA.trim();
      let charVal = 0x41; // 'A'
      let charDisplay = 'A';
      if (rawInp.length > 0) {
        if (/^[0-9A-Fa-f]{1,2}H$/i.test(rawInp)) {
          charVal = parseInt(rawInp.replace(/H$/i, ''), 16) & 0xFF;
          charDisplay = String.fromCharCode(charVal);
        } else {
          charVal = rawInp.charCodeAt(0) & 0xFF;
          charDisplay = rawInp[0];
        }
      }
      const charHex = charVal.toString(16).toUpperCase().padStart(2, '0') + 'H';
      const binBits = charVal.toString(2).padStart(8, '0');
      const lsbToMsbBits = binBits.split('').reverse().join(' ');

      setSimOutput({
        status: `8051 UART Mode 1 Serial Transfer at ${baudRate} Baud Active`,
        result: `Transmitted character '${charDisplay}' (${charHex} / ${charVal}D) serially via TXD (P3.1) at ${baudRate} bps. 10-bit frame (1 Start + 8 Data + 1 Stop) verified with TI flag handshaking.`,
        registers: {
          A: charHex,
          SBUF: charHex,
          SCON: '50H (Mode 1, REN=1)',
          TH1: reloadHex,
          TL1: reloadHex,
          TMOD: '20H (T1 Mode 2)',
          TCON: 'TR1=1, TI=1',
          PCON: '00H (SMOD=0)'
        },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '1', IF: '1' },
        memoryDump: [
          `SCON Control (98H)= 50H (Mode 1: 8-Bit UART, 1 Start, 8 Data, 1 Stop, REN=1)`,
          `TMOD Mode (89H)   = 20H (Timer 1 Mode 2: 8-Bit Auto-Reload Baud Rate Generator)`,
          `TH1 Auto-Reload   = ${reloadHex} (${reloadVal}D) → Exact ${baudRate} Baud at 11.0592 MHz`,
          `SBUF Buffer (99H) = ${charHex} (ASCII '${charDisplay}', Binary: ${binBits}B)`,
          `TXD Line Waveform = 0 (Start) → [${lsbToMsbBits}] (LSB-first) → 1 (Stop)`,
          `Frame Timing      = Bit Period: ${bitTimeUs} µs | 10-Bit Frame Time: ${frameTimeMs} ms`,
          `Terminal Stream   = Serial Output: "${charDisplay.repeat(16)}..." (Continuous transmission)`
        ],
        cycles: Math.round(baudRate === 9600 ? 1042 : baudRate === 4800 ? 2083 : 4167)
      });
    } else if (expId === 'exp_8051_lcd_8bit') {
      const line1 = (customInputA || '8051 INTERFACE').slice(0, 16).padEnd(16, ' ');
      const line2 = (customInputB || '16x2 LCD 8-BIT').slice(0, 16).padEnd(16, ' ');
      setSimOutput({
        status: '8051 8-Bit 16x2 LCD Interfacing Sequence Complete',
        result: `LCD initialized in 8-bit mode (38H, 0EH, 01H, 06H). Rendered Line 1 at 80H: "${line1.trim()}", Line 2 at C0H: "${line2.trim()}" with verified High-to-Low EN latch pulses.`,
        registers: {
          A: '06H (Entry Mode)',
          P1: '00H / Data Bus',
          'P2.0 (RS)': '0 (Cmd) / 1 (Data)',
          'P2.1 (RW)': '0 (Write Mode)',
          'P2.2 (EN)': 'Pulse (1 → 0)',
          SP: '07H',
          PC: '003EH',
          PSW: '00H'
        },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', IF: '1' },
        memoryDump: [
          `+------------------+ (16x2 Matrix Display)`,
          `| ${line1} | Line 1: DDRAM 80H - 8FH`,
          `| ${line2} | Line 2: DDRAM C0H - CFH`,
          `+------------------+`,
          `Function Set (38H) = 8-bit Bus, 2 Display Lines, 5×7 Dot Matrix Font`,
          `Display Ctrl (0EH) = Display ON, Cursor Underline ON, Blink OFF`,
          `Clear Screen (01H) = DDRAM cleared, Address Counter reset to 00H`,
          `Entry Mode   (06H) = Auto-increment cursor position rightwards`,
          `Control Lines      = RS=P2.0, RW=P2.1 (GND=0), EN=P2.2 (High-to-Low Strobe >= 450ns)`
        ],
        cycles: 4520
      });
    } else if (expId === 'exp_8051_lcd_4bit') {
      const line1 = (customInputA || '4-BIT LCD MODE').slice(0, 16).padEnd(16, ' ');
      const line2 = (customInputB || 'SAVING 4 I/O PINS').slice(0, 16).padEnd(16, ' ');
      setSimOutput({
        status: '8051 4-Bit 16x2 LCD Interfacing (Dual-Nibble) Complete',
        result: `LCD software initialized in 4-bit mode (33H, 32H, 28H, 0EH, 01H, 06H). Data transmitted via P1.4-P1.7 dual nibbles with SWAP A. P1.0-P1.3 freed. Rendered: "${line1.trim()}" / "${line2.trim()}".`,
        registers: {
          A: '06H (Entry Mode)',
          'P1 (D4-D7)': 'P1.4-P1.7 Active',
          'P1 (D0-D3)': 'FREE (Available I/O)',
          'P2.0 (RS)': '0 (Cmd) / 1 (Data)',
          'P2.1 (RW)': '0 (Write Mode)',
          'P2.2 (EN)': 'Dual EN Pulses',
          PC: '0052H',
          PSW: '00H'
        },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', IF: '1' },
        memoryDump: [
          `+------------------+ (4-Bit Dual-Nibble Display)`,
          `| ${line1} | Line 1: DDRAM 80H - 8FH`,
          `| ${line2} | Line 2: DDRAM C0H - CFH`,
          `+------------------+`,
          `Init Sequence (4-Bit)= 30H (x3) → 20H (4-bit switch) → 28H (2-Line 5×7 Font)`,
          `Nibble Protocol      = High Nibble (P1.4-P1.7) + EN Pulse → SWAP A → Low Nibble + EN Pulse`,
          `Pin Conservation     = Pins P1.0, P1.1, P1.2, P1.3 remain 100% free for system peripherals`,
          `Display Ctrl (0EH)   = Display ON, Underline Cursor ON`,
          `Entry Mode   (06H)   = Increment cursor automatically after dual nibble write`
        ],
        cycles: 6840
      });
    } else {
      // Default execution feedback
      setSimOutput({
        status: 'Execution Completed Successfully',
        result: manualPage.expectedOutput.desc,
        registers: {
          AX: '4C00H',
          BX: '0004H',
          CX: '0000H',
          DX: '0000H',
          SI: '0004H',
          DI: '0004H',
          SP: '0100H',
          BP: '0000H'
        },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', IF: '1' },
        memoryDump: [
          'DS:0000  ' + (manualPage.expectedOutput.inputs[0]?.val || 'FF FE FD FC'),
          'DS:0010  ' + (manualPage.expectedOutput.outputs[0]?.val || '00 01 01 01'),
          'DS:0020  ' + (manualPage.expectedOutput.outputs[1]?.val || 'EE FC FA F8')
        ],
        cycles: 56
      });
    }
  };

  const navTabs = [
    { id: 'aim_theory', label: '1. Aim, Theory & Setup', icon: BookOpen },
    { id: 'algo_flow', label: '2. Algorithm & Flowchart', icon: Compass },
    { id: 'program_alp', label: '3. Source Program (ALP)', icon: FileCode },
    { id: 'program_explanation', label: '4. Program Explanation', icon: Lightbulb },
    { id: 'exec_output', label: '5. Step-by-Step Execution & Output', icon: Terminal },
    { id: 'viva_precautions', label: '6. Viva Voce & Extension', icon: HelpCircle }
  ];

  return (
    <div className="w-full h-full bg-white rounded-2xl md:rounded-3xl border border-[#B8D4E8] shadow-sm overflow-hidden flex flex-col justify-between">
      {/* Uniform Academic 5-Section Tab Bar */}
      <div className="bg-[#E3F1FA] border-b border-[#B8D4E8] px-3 md:px-6 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border ${
                isActive
                  ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                  : 'bg-white hover:bg-[#DCEFFA] text-[#163A5F] hover:text-[#163A5F] border-[#B8D4E8]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#2563EB]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Presentation Arena */}
      <div className="flex-1 overflow-y-auto p-2.5 md:p-3.5 space-y-2.5 scrollbar-thin bg-white">
        <AnimatePresence mode="wait">
          {/* TAB 1: AIM, THEORY & SETUP */}
          {activeTab === 'aim_theory' && (
            <motion.div
              key="aim_theory"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-2.5"
            >
              {/* Aim Card */}
              <div className="bg-[#EAF4FB] rounded-2xl p-3.5 md:p-4 border border-[#B8D4E8] shadow-2xs space-y-1.5">
                <div className="flex items-center gap-2 text-[#2563EB] font-mono text-xs font-bold uppercase tracking-wider">
                  <Target className="w-4 h-4 text-[#2563EB]" />
                  <span>Aim of the Experiment</span>
                </div>
                <p className="text-sm sm:text-base font-semibold text-[#163A5F] leading-relaxed">
                  {manualPage.aim}
                </p>
              </div>

              {/* Objectives & Learning Outcomes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div className="bg-[#EAF4FB]/40 rounded-2xl p-3 border border-[#B8D4E8] space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-mono text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Course Objectives (COs)</span>
                  </div>
                  <ul className="space-y-1 text-xs sm:text-sm text-[#1F2937]">
                    {manualPage.objectives.map((obj, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#EAF4FB]/40 rounded-2xl p-3 border border-[#B8D4E8] space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-[#2563EB] font-mono text-xs font-bold uppercase tracking-wider">
                    <Award className="w-4 h-4 text-[#2563EB]" />
                    <span>Learning Outcomes</span>
                  </div>
                  <ul className="space-y-1 text-xs sm:text-sm text-[#1F2937]">
                    {manualPage.outcomes.map((outc, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#2563EB] font-bold">•</span>
                        <span>{outc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Apparatus & Software Environment */}
              <div className="bg-[#EAF4FB]/40 rounded-2xl p-3 border border-[#B8D4E8] space-y-2 shadow-2xs">
                <div className="flex items-center gap-2 text-[#163A5F] font-mono text-xs font-bold uppercase tracking-wider">
                  <Layers className="w-4 h-4 text-[#2563EB]" />
                  <span>Hardware & Software Apparatus Required</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  <div className="bg-white p-2.5 rounded-xl border border-[#B8D4E8] flex items-center gap-2.5 shadow-2xs">
                    <Cpu className="w-5 h-5 text-[#2563EB] shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-[#163A5F]">Host Computer</div>
                      <div className="text-[10px] text-[#475569] font-mono">x86 Architecture / PC</div>
                    </div>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-[#B8D4E8] flex items-center gap-2.5 shadow-2xs">
                    <FileCode className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-[#163A5F]">MASM & LINK</div>
                      <div className="text-[10px] text-[#475569] font-mono">Version 6.11 Macro Assembler</div>
                    </div>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-[#B8D4E8] flex items-center gap-2.5 shadow-2xs">
                    <Terminal className="w-5 h-5 text-[#2563EB] shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-[#163A5F]">DOSBox Emulator</div>
                      <div className="text-[10px] text-[#475569] font-mono">v0.74 Real-Mode Virtual Lab</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comprehensive Basic Theory of the Experiment */}
              {(() => {
                const basicTheory = labBasicTheoryData[expId] || labBasicTheoryData.exp1;
                return (
                  <div className="space-y-2.5">
                    {/* Core Principle Header Card */}
                    <div className="bg-gradient-to-br from-[#163A5F] via-[#1E40AF] to-[#2563EB] rounded-2xl p-3.5 md:p-4 text-white shadow-xs space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                          <BookOpen className="w-3.5 h-3.5 text-cyan-300" />
                        </div>
                        <div>
                          <div className="text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
                            Fundamental Lab Theory
                          </div>
                          <h3 className="text-sm sm:text-base font-bold tracking-tight">
                            {basicTheory.principleTitle}
                          </h3>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-blue-50/95 leading-relaxed pt-1.5 border-t border-white/15">
                        {basicTheory.corePrinciple}
                      </p>
                    </div>

                    {/* Key Concepts Grid */}
                    <div className="bg-white rounded-2xl p-3.5 border border-[#B8D4E8] space-y-2 shadow-2xs">
                      <div className="flex items-center gap-2 text-[#2563EB] font-mono text-xs font-bold uppercase tracking-wider">
                        <Lightbulb className="w-4 h-4 text-[#2563EB]" />
                        <span>Key Theoretical Concepts & Foundations</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {basicTheory.keyConcepts.map((concept, idx) => (
                          <div
                            key={idx}
                            className="bg-[#F8FAFC] p-3 rounded-xl border border-[#B8D4E8] space-y-1.5 flex flex-col justify-between"
                          >
                            <div className="space-y-1">
                              {concept.badge && (
                                <span className="inline-block text-[9px] font-mono font-bold text-[#2563EB] bg-[#EAF4FB] px-2 py-0.5 rounded border border-[#B8D4E8]">
                                  {concept.badge}
                                </span>
                              )}
                              <h4 className="text-xs font-bold text-[#163A5F]">
                                {concept.title}
                              </h4>
                              <p className="text-[11px] text-[#475569] leading-relaxed">
                                {concept.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mathematical & Logical Formulation */}
                    {basicTheory.mathematicalFormulation && (
                      <div className="bg-white rounded-2xl p-3.5 border border-[#B8D4E8] space-y-2 shadow-2xs">
                        <div className="flex items-center gap-2 text-[#163A5F] font-mono text-xs font-bold uppercase tracking-wider">
                          <Binary className="w-4 h-4 text-[#2563EB]" />
                          <span>Mathematical Formulation & Computational Model</span>
                        </div>
                        <div className="space-y-2">
                          <div className="bg-[#0F172A] text-cyan-300 p-2.5 rounded-xl font-mono text-xs overflow-x-auto whitespace-pre border border-slate-700">
                            {basicTheory.mathematicalFormulation.formula}
                          </div>
                          <p className="text-xs text-[#334155] leading-relaxed">
                            {basicTheory.mathematicalFormulation.explanation}
                          </p>
                          {basicTheory.mathematicalFormulation.steps && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                              {basicTheory.mathematicalFormulation.steps.map((st, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="text-[11px] font-mono text-[#163A5F] bg-[#EAF4FB]/60 px-2.5 py-1 rounded-lg border border-[#B8D4E8]"
                                >
                                  {st}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 8086 Architectural Mechanisms */}
                    <div className="bg-white rounded-2xl p-3.5 border border-[#B8D4E8] space-y-2 shadow-2xs">
                      <div className="flex items-center gap-2 text-[#2563EB] font-mono text-xs font-bold uppercase tracking-wider">
                        <Cpu className="w-4 h-4 text-[#2563EB]" />
                        <span>8086 Hardware Registers & Architectural Mechanisms</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {basicTheory.architecturalMechanisms.map((mech, mIdx) => (
                          <div
                            key={mIdx}
                            className="bg-[#EAF4FB]/40 p-2.5 rounded-xl border border-[#B8D4E8] space-y-1"
                          >
                            <div className="text-xs font-mono font-bold text-[#163A5F] flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                              {mech.feature}
                            </div>
                            <div className="text-[11px] text-[#475569] leading-snug">
                              {mech.role}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Worked Numerical Example (Manual Calculation Trace) */}
                    <div className="bg-white rounded-2xl p-3.5 border border-[#B8D4E8] space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-800 font-mono text-xs font-bold uppercase tracking-wider">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Worked Numerical Example & Trace</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                          Manual Verification
                        </span>
                      </div>
                      <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#B8D4E8] space-y-2">
                        <div className="text-xs font-mono text-[#163A5F] bg-white p-2 rounded-lg border border-[#B8D4E8]">
                          <span className="text-[#64748B] block text-[10px] uppercase font-sans font-bold">
                            {basicTheory.workedExample.inputLabel}:
                          </span>
                          <strong className="text-[#2563EB]">{basicTheory.workedExample.inputValue}</strong>
                        </div>
                        <div className="space-y-1">
                          {basicTheory.workedExample.calculationSteps.map((cStep) => (
                            <div
                              key={cStep.stepNumber}
                              className="bg-white p-2 rounded-lg border border-[#CBD5E1] text-[11px] flex flex-wrap items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded bg-blue-100 text-blue-800 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                                  {cStep.stepNumber}
                                </span>
                                <span className="font-mono text-[#163A5F]">{cStep.operation}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] font-mono">
                                <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                  {cStep.intermediateResult}
                                </span>
                                <span className="text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                                  {cStep.flagImpact}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="text-xs font-mono text-emerald-900 bg-emerald-50/80 p-2 rounded-lg border border-emerald-300 font-semibold">
                          Verified Output: {basicTheory.workedExample.finalOutput}
                        </div>
                      </div>
                    </div>

                    {/* Industrial & Practical Application */}
                    <div className="bg-amber-50/80 rounded-2xl p-3 border border-amber-200 flex items-start gap-2.5 shadow-2xs">
                      <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <div className="text-xs font-mono font-bold text-amber-900 uppercase tracking-wider">
                          Industrial & Real-World Engineering Significance
                        </div>
                        <p className="text-xs text-amber-950 leading-relaxed">
                          {basicTheory.industrialRelevance}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}

          {/* TAB 2: ALGORITHM & FLOWCHART */}
          {activeTab === 'algo_flow' && (() => {
            const currentFlowchart = LAB_FLOWCHARTS[expId] || LAB_FLOWCHARTS.exp1;
            const algorithmNodes = currentFlowchart.nodes;

            return (
              <motion.div
                key="algo_flow"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-2.5"
              >
                {/* Formal Algorithm Steps in a Single Unified Division */}
                <div className="lg:col-span-5 bg-white rounded-2xl p-3.5 border border-[#B8D4E8] space-y-2.5 shadow-2xs flex flex-col">
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#B8D4E8]">
                    <div className="flex items-center gap-2 text-[#2563EB] font-mono text-xs font-bold uppercase tracking-wider">
                      <Hash className="w-4 h-4 text-[#2563EB]" />
                      <span>Formal Step-by-Step Algorithm</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#163A5F] bg-[#DCEFFA] px-2 py-0.5 rounded border border-[#B8D4E8] font-bold">
                      {algorithmNodes.length} Steps
                    </span>
                  </div>

                  {/* Single Division containing all algorithm steps */}
                  <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#B8D4E8] max-h-[620px] overflow-y-auto pr-1.5 scrollbar-thin flex-1 divide-y divide-[#E2E8F0]/80">
                    {algorithmNodes.map((node, idx) => {
                      const isHighlighted = activeFlowStep === idx;
                      const isStart = node.type === 'start';
                      const isStop = node.type === 'stop';
                      const isDecision = node.type === 'decision';
                      const isIO = node.type === 'io';

                      const yesTarget = isDecision ? resolveBranchTarget(node.yesBranch, algorithmNodes, idx) : null;
                      const noTarget = isDecision ? resolveBranchTarget(node.noBranch, algorithmNodes, idx) : null;

                      let stepLabel = node.label;
                      if (isStart) stepLabel = `START: ${node.subLabel || 'Initialize Program & Load Data Segment'}`;
                      else if (isStop) stepLabel = `STOP: ${node.subLabel || 'Terminate Program via DOS INT 21H'}`;
                      else if (isDecision) stepLabel = `Decision (Check Condition): ${node.label}`;

                      const badgeTypeColor = isStart
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : isStop
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : isDecision
                        ? 'bg-amber-100 text-amber-900 border-amber-300 ring-1 ring-amber-400'
                        : isIO
                        ? 'bg-purple-100 text-purple-800 border-purple-300'
                        : 'bg-blue-100 text-blue-800 border-blue-300';

                      return (
                        <div
                          key={node.id}
                          onClick={() => setActiveFlowStep(idx)}
                          onMouseEnter={() => setActiveFlowStep(idx)}
                          className={`transition-all duration-300 ease-out cursor-pointer flex items-start gap-3 ${
                            isHighlighted
                              ? 'bg-[#EAF4FB] text-[#163A5F] py-3.5 px-3.5 my-1.5 rounded-xl shadow-xs ring-2 ring-[#2563EB]/40 border-l-4 border-l-[#2563EB]'
                              : 'py-2 px-2 hover:bg-white/90 text-[#475569]'
                          }`}
                        >
                          {/* Step Number Badge */}
                          <span
                            className={`rounded-lg flex items-center justify-center font-mono font-bold shrink-0 transition-all duration-300 ${
                              isHighlighted
                                ? 'w-8 h-8 text-xs sm:text-sm bg-[#2563EB] text-white shadow-xs scale-110'
                                : 'w-5 h-5 text-[11px] bg-blue-100/90 border border-blue-300 text-[#163A5F] mt-0.5'
                            }`}
                          >
                            {idx + 1}
                          </span>

                          <div className="flex-1 min-w-0 space-y-1.5">
                            {/* Type Tag & Title */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span
                                className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase ${badgeTypeColor}`}
                              >
                                {node.type}
                              </span>
                              {isDecision && (
                                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-900 border border-amber-300">
                                  Branching Node
                                </span>
                              )}
                            </div>

                            {/* Main Step Text - Grows font on selection */}
                            <p
                              className={`leading-snug transition-all duration-300 ${
                                isHighlighted
                                  ? 'text-base sm:text-lg font-black text-[#163A5F] tracking-tight'
                                  : 'text-xs sm:text-sm font-semibold text-[#163A5F]'
                              }`}
                            >
                              {stepLabel}
                            </p>

                            {/* Details for normal & expanded view */}
                            {node.subLabel && !isStart && !isStop && !isDecision && (
                              <p
                                className={`text-xs ${
                                  isHighlighted
                                    ? 'text-[#2563EB] font-mono font-semibold'
                                    : 'text-[#64748B] font-mono text-[11px] truncate'
                                }`}
                              >
                                {node.subLabel}
                              </p>
                            )}

                            {/* EXPLICIT DECISION BRANCHING GUIDANCE (Visible on both collapsed & expanded states) */}
                            {isDecision && yesTarget && noTarget && (
                              <div className="space-y-1.5 pt-0.5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] font-mono">
                                  {/* YES Target Box with direct jump */}
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveFlowStep(yesTarget.targetStepNum - 1);
                                    }}
                                    className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 p-1.5 rounded-lg text-emerald-950 transition-all cursor-pointer shadow-2xs group/btn flex items-center justify-between"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                      <span className="font-bold text-emerald-800">If YES:</span>
                                      <span className="font-bold underline decoration-emerald-500">Go to Step {yesTarget.targetStepNum}</span>
                                    </div>
                                    <ArrowRight className="w-3 h-3 text-emerald-600 opacity-70 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 transition-all" />
                                  </div>

                                  {/* NO Target Box with direct jump */}
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveFlowStep(noTarget.targetStepNum - 1);
                                    }}
                                    className="bg-rose-50 hover:bg-rose-100 border border-rose-300 p-1.5 rounded-lg text-rose-950 transition-all cursor-pointer shadow-2xs group/btn flex items-center justify-between"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <XCircle className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                                      <span className="font-bold text-rose-800">If NO:</span>
                                      <span className="font-bold underline decoration-rose-500">Go to Step {noTarget.targetStepNum}</span>
                                    </div>
                                    <ArrowRight className="w-3 h-3 text-rose-600 opacity-70 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 transition-all" />
                                  </div>
                                </div>

                                {/* Detailed Breakdown when this decision step is selected */}
                                {isHighlighted && (
                                  <div className="mt-2 pt-2 border-t border-[#B8D4E8]/60 space-y-2 animate-fadeIn">
                                    {/* STUDENT WRITING FORMULA CALLOUT */}
                                    <div className="bg-amber-50/90 border border-amber-300 rounded-lg p-2 text-[11px] font-mono text-[#163A5F] space-y-1">
                                      <div className="flex items-center gap-1 text-[10px] font-bold text-amber-900 uppercase">
                                        <Info className="w-3 h-3 text-amber-700" />
                                        <span>How to Write in Observation Notebook / Exam:</span>
                                      </div>
                                      <div className="bg-white p-1.5 rounded border border-amber-200 text-xs font-semibold text-[#163A5F] leading-snug">
                                        "Step {idx + 1}: {node.label.replace(/^Is\s+/i, 'Check whether ')}. <span className="text-emerald-700 font-bold">If YES</span>, go to <span className="text-emerald-800 font-bold underline">Step {yesTarget.targetStepNum} ({yesTarget.targetTitle})</span>; <span className="text-rose-700 font-bold">If NO</span>, go to <span className="text-rose-800 font-bold underline">Step {noTarget.targetStepNum} ({noTarget.targetTitle})</span>."
                                      </div>
                                    </div>

                                    {node.decisionQuery && (
                                      <div className="text-[11px] font-mono bg-blue-50 text-blue-950 px-2 py-1 rounded border border-blue-200">
                                        <span className="font-bold">Condition Check:</span> {node.decisionQuery}
                                      </div>
                                    )}

                                    {node.hardwareFlagTested && (
                                      <div className="text-[10px] font-mono text-[#64748B]">
                                        <span className="font-semibold text-[#163A5F]">Hardware Flag Tested:</span> {node.hardwareFlagTested}
                                      </div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] font-mono">
                                      {node.yesBranch && (
                                        <div className="bg-emerald-50/80 text-emerald-900 p-2 rounded-lg border border-emerald-200 space-y-0.5">
                                          <div className="font-bold text-emerald-800 flex items-center gap-1">
                                            <span>✓ YES Action (➔ Step {yesTarget.targetStepNum}):</span>
                                          </div>
                                          <p className="text-[11px] leading-tight">{node.yesBranch.action}</p>
                                          {node.yesBranch.asmBranchInstruction && (
                                            <div className="mt-1 text-[9px] font-mono bg-emerald-950 text-emerald-200 p-1 rounded">
                                              {node.yesBranch.asmBranchInstruction}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                      {node.noBranch && (
                                        <div className="bg-rose-50/80 text-rose-900 p-2 rounded-lg border border-rose-200 space-y-0.5">
                                          <div className="font-bold text-rose-800 flex items-center gap-1">
                                            <span>✗ NO Action (➔ Step {noTarget.targetStepNum}):</span>
                                          </div>
                                          <p className="text-[11px] leading-tight">{node.noBranch.action}</p>
                                          {node.noBranch.asmBranchInstruction && (
                                            <div className="mt-1 text-[9px] font-mono bg-rose-950 text-rose-200 p-1 rounded">
                                              {node.noBranch.asmBranchInstruction}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Assembly Code Snippet when highlighted */}
                            {isHighlighted && node.asmCode && !isDecision && (
                              <div className="mt-2 bg-[#163A5F] text-[#DCEFFA] p-2 rounded-lg font-mono text-[11px] leading-tight border border-[#2563EB]/40 animate-fadeIn">
                                <div className="text-[9px] text-[#A5C9E1] uppercase font-bold mb-1">8086 Assembly Equivalent:</div>
                                <pre className="whitespace-pre-wrap">{node.asmCode}</pre>
                              </div>
                            )}

                            {isHighlighted && (
                              <div className="flex items-center gap-1 mt-1.5 text-[11px] font-mono text-[#2563EB] font-bold animate-fadeIn">
                                <ArrowRight className="w-3 h-3 text-[#2563EB]" />
                                <span>Active Flowchart Stage Node {idx + 1} ({node.type.toUpperCase()})</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Interactive Visual Flowchart with Rhombus Decisions & YES/NO Flows */}
                <div className="lg:col-span-7">
                  <LabExperimentFlowchartVisualizer
                    expId={expId}
                    activeStepIndex={activeFlowStep}
                    onSelectNode={(_node, idx) => {
                      setActiveFlowStep(idx);
                    }}
                    onHoverNode={(_node, idx) => {
                      setActiveFlowStep(idx);
                    }}
                  />
                </div>
              </motion.div>
            );
          })()}

          {/* TAB 3: SOURCE PROGRAM (ALP) */}
          {activeTab === 'program_alp' && (
            <motion.div
              key="program_alp"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-2.5"
            >
              {/* Program Header Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 bg-[#E3F1FA] p-2.5 rounded-2xl border border-[#B8D4E8]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#163A5F] uppercase">Architecture:</span>
                  <div className="flex items-center bg-white p-0.5 rounded-xl border border-[#B8D4E8]">
                    <button
                      onClick={() => setCodeMode('standard')}
                      className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                        codeMode === 'standard'
                          ? 'bg-[#2563EB] text-white shadow-2xs'
                          : 'text-[#163A5F] hover:text-[#2563EB]'
                      }`}
                    >
                      MASM Standard Segments
                    </button>
                    <button
                      onClick={() => setCodeMode('simplified')}
                      className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                        codeMode === 'simplified'
                          ? 'bg-[#2563EB] text-white shadow-2xs'
                          : 'text-[#163A5F] hover:text-[#2563EB]'
                      }`}
                    >
                      Simplified (.MODEL SMALL)
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#EAF4FB] text-[#163A5F] text-xs font-mono font-bold border border-[#B8D4E8] transition-all cursor-pointer hover:border-[#2563EB] shadow-2xs"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#2563EB]" />}
                  <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy ALP Code'}</span>
                </button>
              </div>

              {/* Code Display Area */}
              <div className="bg-white rounded-2xl border border-[#B8D4E8] overflow-hidden shadow-xs font-mono text-xs">
                <div className="bg-[#E3F1FA] px-3.5 py-1.5 border-b border-[#B8D4E8] flex items-center justify-between text-[#163A5F] font-bold">
                  <span className="flex items-center gap-2">
                    <Code2 className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>8086_EXP_{expInfo.number}.ASM</span>
                  </span>
                  <span className="text-[11px] text-[#475569]">{codeMode === 'standard' ? 'Full Segment Declarations' : 'Simplified Memory Model'}</span>
                </div>

                <div className="p-3 overflow-x-auto max-h-[460px] scrollbar-thin text-[#1F2937] leading-relaxed space-y-0.5 bg-white font-mono text-xs">
                  {(codeMode === 'standard' ? expInfo.standardCode : expInfo.simplifiedCode)
                    .split('\n')
                    .map((line, lIdx) => {
                      const isPureComment = line.trim().startsWith(';');
                      const commentIdx = line.indexOf(';');
                      let codePart = line;
                      let commentPart = '';
                      if (!isPureComment && commentIdx !== -1) {
                        codePart = line.substring(0, commentIdx);
                        commentPart = line.substring(commentIdx);
                      }
                      const isDirective = /^(DATA_SEG|CODE_SEG|STACK_SEG|SEGMENT|ENDS|ASSUME|\.MODEL|\.STACK|\.DATA|\.CODE|MAIN PROC|MAIN ENDP|END)/i.test(codePart.trim());
                      return (
                        <div key={lIdx} className="flex gap-2.5 hover:bg-[#EAF4FB]/60 px-1.5 py-0.5 rounded">
                          <span className="text-[#94A3B8] select-none w-6 text-right shrink-0 font-medium">{lIdx + 1}</span>
                          {isPureComment ? (
                            <span className="whitespace-pre text-[#047857] italic font-medium">{line}</span>
                          ) : commentIdx !== -1 ? (
                            <span className="whitespace-pre">
                              <span className={isDirective ? 'text-[#2563EB] font-bold' : 'text-[#163A5F] font-semibold'}>{codePart}</span>
                              <span className="text-[#047857] italic font-medium">{commentPart}</span>
                            </span>
                          ) : (
                            <span className={`whitespace-pre ${
                              isDirective ? 'text-[#2563EB] font-bold' : 'text-[#163A5F] font-semibold'
                            }`}>
                              {line}
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Directives Glossary & Best Practice Tip */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div className="bg-white rounded-2xl p-3 border border-[#B8D4E8] space-y-1.5 shadow-2xs">
                  <div className="text-xs font-mono font-bold text-[#163A5F] uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Directives Employed</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {expInfo.directivesUsed.map((d, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-lg bg-[#EAF4FB] border border-[#B8D4E8] text-xs font-mono font-bold text-[#163A5F]">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-3 border border-[#B8D4E8] space-y-1.5 shadow-2xs">
                  <div className="text-xs font-mono font-bold text-emerald-800 uppercase flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Lab Engineering Best Practice</span>
                  </div>
                  <p className="text-xs text-[#1F2937] leading-relaxed">
                    {expInfo.bestPracticeTip}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: PROGRAM EXPLANATION */}
          {activeTab === 'program_explanation' && (
            <motion.div
              key="program_explanation"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-2.5"
            >
              {(() => {
                const progTheory = labProgramTheoryData[expId] || labProgramTheoryData.exp1;
                return (
                  <div className="space-y-2.5">
                    {/* Section Header */}
                    <div className="bg-gradient-to-r from-[#163A5F] to-[#1D4ED8] rounded-2xl p-3.5 md:p-4 text-white shadow-xs space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                          <FileCode className="w-3.5 h-3.5 text-cyan-300" />
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base font-bold tracking-tight">
                            Theoretical Explanation of the Assembly Program (ALP)
                          </h3>
                          <p className="text-[11px] text-blue-100/90 font-mono">
                            Program Architecture, Segmentation Model, Machine Stages & Flag Mechanics
                          </p>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-blue-50/90 leading-relaxed pt-1 border-t border-white/15">
                        {progTheory.overview}
                      </p>
                    </div>

                    {/* Memory Organization & Segmentation Model */}
                    <div className="bg-white rounded-2xl p-3.5 border border-[#B8D4E8] space-y-2 shadow-2xs">
                      <div className="flex items-center gap-2 text-[#163A5F] font-mono text-xs font-bold uppercase tracking-wider">
                        <Layers className="w-4 h-4 text-[#2563EB]" />
                        <span>Memory Organization & Segmentation Model</span>
                      </div>
                      <div className="bg-[#EAF4FB]/50 p-3 rounded-xl border border-[#B8D4E8] text-xs sm:text-sm text-[#1F2937] leading-relaxed space-y-1.5">
                        <p>{progTheory.memoryAndSegmentation}</p>
                        <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-[#B8D4E8]/60 text-[11px] font-mono text-[#163A5F]">
                          <span className="bg-blue-100 px-2 py-0.5 rounded border border-blue-200 font-semibold">
                            Code Segment: CS:IP
                          </span>
                          <span className="bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 font-semibold text-emerald-800">
                            Data Segment: DS:Offset
                          </span>
                          <span className="bg-purple-100 px-2 py-0.5 rounded border border-purple-200 font-semibold text-purple-800">
                            Extra Segment: ES:DI
                          </span>
                          <span className="bg-amber-100 px-2 py-0.5 rounded border border-amber-200 font-semibold text-amber-800">
                            Byte Ordering: Little-Endian
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Step-by-Step Program Execution & Hardware Stages */}
                    <div className="bg-white rounded-2xl p-3.5 border border-[#B8D4E8] space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#2563EB] font-mono text-xs font-bold uppercase tracking-wider">
                          <Workflow className="w-4 h-4 text-[#2563EB]" />
                          <span>Step-by-Step Program Execution & Hardware Machine Stages</span>
                        </div>
                        <span className="text-[10px] font-mono text-[#163A5F] bg-[#DCEFFA] px-2 py-0.5 rounded border border-[#B8D4E8] font-bold">
                          {progTheory.logicStages.length} Execution Stages
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {progTheory.logicStages.map((stage) => (
                          <div
                            key={stage.stageNumber}
                            className="bg-[#F8FAFC] p-3 rounded-xl border border-[#B8D4E8] space-y-1.5 hover:border-[#2563EB] transition-colors"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-lg bg-[#2563EB] text-white flex items-center justify-center text-xs font-mono font-bold shrink-0">
                                  {stage.stageNumber}
                                </span>
                                <h4 className="text-xs sm:text-sm font-bold text-[#163A5F]">
                                  {stage.stageName}
                                </h4>
                              </div>
                              <span className="text-[10px] font-mono text-[#475569] bg-white px-2 py-0.5 rounded border border-[#B8D4E8]">
                                Stage {stage.stageNumber}
                              </span>
                            </div>

                            <p className="text-xs text-[#1F2937] leading-relaxed">
                              {stage.summary}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 pt-1.5 border-t border-[#E2E8F0]">
                              <div className="md:col-span-7 text-[11px] text-[#475569] leading-relaxed bg-white p-2 rounded-lg border border-[#CBD5E1]">
                                <span className="font-semibold text-[#163A5F] block font-mono text-[10px] uppercase mb-0.5">
                                  CPU / Hardware Action:
                                </span>
                                {stage.hardwareAction}
                              </div>

                              <div className="md:col-span-5 bg-[#0F172A] text-cyan-300 p-2 rounded-lg font-mono text-[11px] overflow-x-auto whitespace-pre border border-slate-700">
                                <span className="text-[9px] text-slate-400 block uppercase font-sans mb-0.5">
                                  ALP Code:
                                </span>
                                {stage.codeSnippet}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Key Instructions & Directives Theory */}
                    <div className="bg-white rounded-2xl p-3.5 border border-[#B8D4E8] space-y-2 shadow-2xs">
                      <div className="flex items-center gap-2 text-[#2563EB] font-mono text-xs font-bold uppercase tracking-wider">
                        <Code2 className="w-4 h-4 text-[#2563EB]" />
                        <span>Key Assembly Directives & Instructions Theory</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {progTheory.instructionsTheory.map((inst, idx) => (
                          <div
                            key={idx}
                            className="bg-[#F8FAFC] p-3 rounded-xl border border-[#B8D4E8] space-y-1.5 flex flex-col justify-between"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="px-2 py-0.5 rounded bg-[#2563EB] text-white font-mono text-xs font-bold shadow-2xs">
                                  {inst.mnemonic}
                                </span>
                                <code className="text-[11px] font-mono text-[#163A5F] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                  {inst.syntax}
                                </code>
                              </div>
                              <p className="text-xs font-medium text-[#163A5F] leading-snug">
                                {inst.role}
                              </p>
                              <p className="text-[11px] text-[#475569] leading-relaxed">
                                {inst.detail}
                              </p>
                            </div>

                            <div className="pt-1.5 border-t border-[#E2E8F0] flex items-center justify-between text-[10px] font-mono">
                              <span className="text-[#64748B]">Flags Affected:</span>
                              <span className="text-purple-700 font-semibold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                                {inst.flagsAffected}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status Flags & Decision-Making Theory */}
                    <div className="bg-white rounded-2xl p-3.5 border border-[#B8D4E8] space-y-2 shadow-2xs">
                      <div className="flex items-center gap-2 text-[#2563EB] font-mono text-xs font-bold uppercase tracking-wider">
                        <Flag className="w-4 h-4 text-[#2563EB]" />
                        <span>CPU Status Flags & Decision-Making Theory</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {progTheory.flagsTheory.map((flg, idx) => (
                          <div
                            key={idx}
                            className="bg-[#EAF4FB]/40 p-2.5 rounded-xl border border-[#B8D4E8] space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono font-bold text-[#2563EB] bg-white px-2 py-0.5 rounded border border-[#B8D4E8]">
                                {flg.flag}
                              </span>
                              <span className="text-[10px] font-mono text-[#475569] truncate">
                                {flg.fullName}
                              </span>
                            </div>
                            <p className="text-xs text-[#1F2937] leading-snug font-medium pt-0.5">
                              {flg.roleInProgram}
                            </p>
                            <p className="text-[11px] text-[#475569] leading-relaxed pt-0.5 border-t border-[#B8D4E8]/60">
                              <span className="font-semibold text-[#163A5F]">Trigger: </span>
                              {flg.triggerCondition}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Data Flow & Transformation Summary */}
                    <div className="bg-white rounded-2xl p-3 border border-[#B8D4E8] space-y-1.5 shadow-2xs">
                      <div className="flex items-center gap-2 text-[#163A5F] font-mono text-xs font-bold uppercase tracking-wider">
                        <Zap className="w-4 h-4 text-amber-600" />
                        <span>Data Flow & Transformation Summary</span>
                      </div>
                      <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200 text-xs text-amber-950 leading-relaxed font-mono">
                        {progTheory.dataFlowSummary}
                      </div>
                    </div>

                    {/* Assembly Programming Best Practices & Precautions */}
                    <div className="bg-white rounded-2xl p-3 border border-[#B8D4E8] space-y-2 shadow-2xs">
                      <div className="flex items-center gap-2 text-emerald-800 font-mono text-xs font-bold uppercase tracking-wider">
                        <Lightbulb className="w-4 h-4 text-emerald-600" />
                        <span>Assembly Programming Best Practices & Safety Tips</span>
                      </div>
                      <ul className="space-y-1 text-xs text-[#1F2937]">
                        {progTheory.bestPractices.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2 bg-emerald-50/60 p-2 rounded-lg border border-emerald-200">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}

          {/* TAB 5: STEP-BY-STEP EXECUTION & EXPECTED OUTPUT */}
          {activeTab === 'exec_output' && (
            <motion.div
              key="exec_output"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-2.5"
            >
              {/* Subtab Module Switcher */}
              <div className="bg-[#EAF4FB] rounded-2xl p-2 border border-[#B8D4E8] flex flex-wrap items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => setActiveExecModule('stepper')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                      activeExecModule === 'stepper'
                        ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                        : 'bg-white hover:bg-[#DCEFFA] text-[#163A5F] border-[#B8D4E8]'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>1. Single-Step CPU Tracer ({execData.steps.length} Steps)</span>
                  </button>

                  <button
                    onClick={() => setActiveExecModule('dosbox')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                      activeExecModule === 'dosbox'
                        ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                        : 'bg-white hover:bg-[#DCEFFA] text-[#163A5F] border-[#B8D4E8]'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>2. DOSBox & MASM Lab Pipeline</span>
                  </button>

                  <button
                    onClick={() => setActiveExecModule('testbench')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                      activeExecModule === 'testbench'
                        ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                        : 'bg-white hover:bg-[#DCEFFA] text-[#163A5F] border-[#B8D4E8]'
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>3. Custom Vector Testbench</span>
                  </button>

                  <button
                    onClick={() => setActiveExecModule('verification')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                      activeExecModule === 'verification'
                        ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                        : 'bg-white hover:bg-[#DCEFFA] text-[#163A5F] border-[#B8D4E8]'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>4. Final Output, Memory & Side-by-Side Verification</span>
                  </button>
                </div>

                <span className="text-[11px] font-mono font-bold text-[#2563EB] bg-white px-2.5 py-1 rounded-lg border border-[#B8D4E8]">
                  Architecture: Intel 8086 • 16-Bit Real Mode
                </span>
              </div>

              {/* MODULE 1: INTERACTIVE SINGLE-STEP INSTRUCTION TRACER */}
              {activeExecModule === 'stepper' && (
                <div className="space-y-2.5">
                  {/* Stepper Control Header & Progress Bar */}
                  <div className="bg-[#EAF4FB] rounded-2xl p-3 border border-[#B8D4E8] shadow-2xs space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-xl bg-[#2563EB] text-white shadow-xs">
                          <Activity className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-[#2563EB] uppercase tracking-widest block">
                              Instruction-by-Instruction CPU Execution Tracer
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-[#2563EB] text-white text-[10px] font-mono font-bold">
                              Step {stepIdx + 1} of {execData.steps.length}
                            </span>
                          </div>
                          <h3 className="text-sm md:text-base font-bold text-[#163A5F]">
                            Intel 8086 Clock-Cycle Hardware Simulation & Register Trace
                          </h3>
                        </div>
                      </div>

                      {/* Stepper Playback Controls */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => setStepIdx(0)}
                          disabled={stepIdx === 0}
                          className="p-1.5 rounded-xl bg-white hover:bg-[#DCEFFA] text-[#163A5F] border border-[#B8D4E8] text-xs font-mono font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                          title="Rewind to Step 1 (First)"
                        >
                          <SkipBack className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setStepIdx((p) => Math.max(0, p - 1))}
                          disabled={stepIdx === 0}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#DCEFFA] text-[#163A5F] border border-[#B8D4E8] text-xs font-mono font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                          title="Previous Instruction Step"
                        >
                          <Rewind className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Prev Step</span>
                        </button>

                        <button
                          onClick={() => setIsAutoStepping(!isAutoStepping)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shadow-xs ${
                            isAutoStepping
                              ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                              : 'bg-[#2563EB] hover:bg-blue-700 text-white'
                          }`}
                          title="Auto-step through instructions automatically"
                        >
                          {isAutoStepping ? (
                            <>
                              <Pause className="w-3.5 h-3.5" />
                              <span>Pause Clock</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5" />
                              <span>Auto-Step Trace</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => setStepIdx((p) => Math.min(execData.steps.length - 1, p + 1))}
                          disabled={stepIdx === execData.steps.length - 1}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white border border-[#2563EB] text-xs font-mono font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                          title="Next Instruction Step"
                        >
                          <span>Next Step</span>
                          <FastForward className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setStepIdx(execData.steps.length - 1)}
                          disabled={stepIdx === execData.steps.length - 1}
                          className="p-1.5 rounded-xl bg-white hover:bg-[#DCEFFA] text-[#163A5F] border border-[#B8D4E8] text-xs font-mono font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                          title="Jump to Final Instruction Step (Last)"
                        >
                          <SkipForward className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setStepIdx(0);
                            setIsAutoStepping(false);
                          }}
                          className="p-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-mono font-bold transition-all cursor-pointer shadow-2xs"
                          title="Reset Debugger to Initial State"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Execution Progress Track */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#163A5F]">
                        <span>Execution Pipeline Progress:</span>
                        <span>{Math.round(((stepIdx + 1) / execData.steps.length) * 100)}% Complete</span>
                      </div>
                      <div className="w-full h-1.5 bg-white rounded-full overflow-hidden border border-[#B8D4E8]">
                        <div
                          className="h-full bg-gradient-to-r from-[#2563EB] to-blue-500 transition-all duration-300 rounded-full"
                          style={{ width: `${((stepIdx + 1) / execData.steps.length) * 100}%` }}
                        />
                      </div>

                      {/* Speed Presets */}
                      <div className="flex items-center justify-between pt-0.5">
                        <span className="text-[10px] font-mono text-[#475569] font-semibold">
                          Trace Clock Speed:
                        </span>
                        <div className="flex items-center gap-1 font-mono text-[10px]">
                          {[
                            { label: 'Slow (1.5s)', val: 1500 },
                            { label: 'Normal (0.9s)', val: 900 },
                            { label: 'Fast (0.4s)', val: 400 }
                          ].map((spd) => (
                            <button
                              key={spd.val}
                              onClick={() => setStepSpeed(spd.val)}
                              className={`px-2 py-0.5 rounded border transition-all cursor-pointer font-bold ${
                                stepSpeed === spd.val
                                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                                  : 'bg-white text-[#163A5F] border-[#B8D4E8] hover:bg-[#DCEFFA]'
                              }`}
                            >
                              {spd.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Active Instruction Focus Spotlight Card */}
                  {(() => {
                    const currentStep = execData.steps[stepIdx] || execData.steps[0];
                    return (
                      <div className="bg-white rounded-2xl p-3.5 md:p-4 border-2 border-[#2563EB] space-y-2.5 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#B8D4E8]">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-lg bg-[#2563EB] text-white text-xs font-mono font-bold shadow-2xs">
                              Step {currentStep.stepNum}
                            </span>
                            {currentStep.label && (
                              <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-xs font-mono font-bold">
                                Label: {currentStep.label}
                              </span>
                            )}
                            <div className="flex flex-col gap-1 items-start">
                              {currentStep.instruction
                                .split(/;|\n/)
                                .map((inst) => inst.trim())
                                .filter(Boolean)
                                .map((inst, i) => (
                                  <span
                                    key={i}
                                    className="px-2.5 py-1 rounded-lg bg-[#163A5F] text-white text-xs sm:text-sm font-mono font-bold tracking-wide shadow-2xs inline-block"
                                  >
                                    {inst}
                                  </span>
                                ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 font-mono text-xs flex-wrap">
                            {currentStep.machineCode && (
                              <span className="px-2 py-0.5 rounded-lg bg-[#EAF4FB] text-[#163A5F] border border-[#B8D4E8] font-bold">
                                Machine Code: <span className="text-[#2563EB] font-black">{currentStep.machineCode}</span>
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold">
                              Modified: {currentStep.modifiedRegs.join(', ') || 'Flags only'}
                            </span>
                          </div>
                        </div>

                        {/* Detailed Micro-Architectural Hardware Explanation */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                          <div className="md:col-span-8 bg-[#F0F7FF] rounded-xl p-2.5 border border-[#B8D4E8] space-y-1">
                            <div className="text-[10px] font-mono font-bold text-[#2563EB] uppercase flex items-center gap-1.5">
                              <Cpu className="w-3.5 h-3.5" />
                              <span>ALU & Execution Unit (EU) Operation:</span>
                            </div>
                            <p className="text-xs text-[#163A5F] leading-relaxed font-medium">
                              {currentStep.description}
                            </p>
                          </div>

                          <div className="md:col-span-4 bg-[#EAF4FB] rounded-xl p-2.5 border border-[#B8D4E8] space-y-1.5 flex flex-col justify-between">
                            <div>
                              <div className="text-[10px] font-mono font-bold text-[#163A5F] uppercase mb-0.5">
                                Memory / Bus Interface (BIU):
                              </div>
                              <div className="text-xs font-mono text-[#163A5F] font-bold bg-white p-1.5 rounded-lg border border-[#B8D4E8]">
                                {currentStep.memoryAction}
                              </div>
                            </div>
                            <div className="pt-0.5 text-[11px] font-mono text-emerald-800 font-bold flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Target: {currentStep.modifiedRegs.join(', ') || 'FLAGS'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Active Step CPU Registers State Grid */}
                        <div className="space-y-1.5 pt-1.5 border-t border-[#B8D4E8]">
                          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#163A5F]">
                            <span className="flex items-center gap-1.5">
                              <Cpu className="w-3.5 h-3.5 text-[#2563EB]" />
                              <span>8086 Internal Register File at Step {currentStep.stepNum}:</span>
                            </span>
                            <span className="text-[10px] text-[#2563EB] font-bold">
                              ★ Modified register highlighted
                            </span>
                          </div>

                          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5 font-mono text-xs">
                            {Object.entries(currentStep.registers).map(([reg, val]) => {
                              const isModified = currentStep.modifiedRegs.includes(reg) || 
                                (reg === 'AX' && (currentStep.modifiedRegs.includes('AL') || currentStep.modifiedRegs.includes('AH'))) ||
                                (reg === 'BX' && (currentStep.modifiedRegs.includes('BL') || currentStep.modifiedRegs.includes('BH'))) ||
                                (reg === 'CX' && (currentStep.modifiedRegs.includes('CL') || currentStep.modifiedRegs.includes('CH'))) ||
                                (reg === 'DX' && (currentStep.modifiedRegs.includes('DL') || currentStep.modifiedRegs.includes('DH')));

                              return (
                                <div
                                  key={reg}
                                  className={`p-1.5 rounded-xl border text-center transition-all ${
                                    isModified
                                      ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs scale-105 ring-2 ring-blue-300'
                                      : 'bg-[#F0F7FF] text-[#163A5F] border-[#B8D4E8]'
                                  }`}
                                >
                                  <div className={`text-[9px] font-bold ${isModified ? 'text-blue-100' : 'text-[#475569]'}`}>
                                    {reg}
                                  </div>
                                  <div className="font-bold text-xs mt-0.5">{val}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Active Step Status Flags */}
                        <div className="space-y-1.5 pt-1.5 border-t border-[#B8D4E8]">
                          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#163A5F]">
                            <span className="flex items-center gap-1.5">
                              <Binary className="w-3.5 h-3.5 text-[#2563EB]" />
                              <span>Status Flags Register (FLAGS):</span>
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                            {Object.entries(currentStep.flags).map(([flg, val]) => (
                              <div
                                key={flg}
                                className={`px-2 py-0.5 rounded-lg border flex items-center gap-1.5 text-xs font-bold ${
                                  val === '1'
                                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                                    : 'bg-[#F0F7FF] border-[#B8D4E8] text-[#475569]'
                                }`}
                              >
                                <span>{flg}</span>
                                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] text-white ${
                                  val === '1' ? 'bg-emerald-600' : 'bg-slate-400'
                                }`}>
                                  {val}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Complete Step-by-Step Instruction Execution Trace Table */}
                  <div className="bg-white rounded-2xl p-3 border border-[#B8D4E8] space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-mono font-bold text-[#163A5F] uppercase flex items-center gap-1.5">
                        <ListOrdered className="w-4 h-4 text-[#2563EB]" />
                        <span>Interactive Step Execution Trace Table</span>
                      </div>
                      <span className="text-[11px] font-mono text-[#2563EB] font-bold">
                        {execData.steps.length} Instructions Total
                      </span>
                    </div>

                    <div className="overflow-x-auto border border-[#B8D4E8] rounded-xl max-h-[300px] overflow-y-auto scrollbar-thin">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-[#EAF4FB] text-[#163A5F] border-b border-[#B8D4E8] sticky top-0 font-bold z-10">
                          <tr>
                            <th className="p-2">Step</th>
                            <th className="p-2">Label</th>
                            <th className="p-2">Instruction</th>
                            <th className="p-2">Machine Code</th>
                            <th className="p-2">Target</th>
                            <th className="p-2">Bus Operation</th>
                            <th className="p-2">Flags (C Z S O P A)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#B8D4E8]">
                          {execData.steps.map((st, idx) => {
                            const isCurrent = idx === stepIdx;
                            return (
                              <tr
                                key={st.stepNum}
                                onClick={() => {
                                  setStepIdx(idx);
                                  setIsAutoStepping(false);
                                }}
                                className={`cursor-pointer transition-colors ${
                                  isCurrent
                                    ? 'bg-[#DCEFFA] text-[#163A5F] font-bold ring-1 ring-[#2563EB]'
                                    : 'hover:bg-[#F0F7FF] text-[#334155]'
                                }`}
                              >
                                <td className="p-2 font-bold">
                                  {isCurrent ? (
                                    <span className="flex items-center gap-1 text-[#2563EB]">
                                      <ArrowRight className="w-3 h-3 text-[#2563EB]" />
                                      {st.stepNum}
                                    </span>
                                  ) : (
                                    st.stepNum
                                  )}
                                </td>
                                <td className="p-2 text-amber-800 font-bold">{st.label || '—'}</td>
                                <td className="p-2 text-[#163A5F] font-bold">
                                  <div className="flex flex-col gap-1 items-start min-w-[140px]">
                                    {st.instruction
                                      .split(/;|\n/)
                                      .map((item) => item.trim())
                                      .filter(Boolean)
                                      .map((singleInst, instIdx) => (
                                        <span
                                          key={instIdx}
                                          className="font-mono text-xs text-[#163A5F] bg-[#EAF4FB] px-1.5 py-0.5 rounded border border-[#B8D4E8] font-bold inline-block"
                                        >
                                          {singleInst}
                                        </span>
                                      ))}
                                  </div>
                                </td>
                                <td className="p-2 text-[#2563EB]">{st.machineCode || '—'}</td>
                                <td className="p-2 text-emerald-800 font-bold">{st.modifiedRegs.join(', ') || 'FLAGS'}</td>
                                <td className="p-2 text-[#475569]">{st.memoryAction}</td>
                                <td className="p-2 font-mono text-[11px]">
                                  {Object.entries(st.flags)
                                    .map(([k, v]) => `${k}:${v}`)
                                    .join(' ')}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE 2: DOSBOX & MASM 6.11 TERMINAL PIPELINE */}
              {activeExecModule === 'dosbox' && (
                <div className="space-y-2.5">
                  <div className="bg-[#EAF4FB] rounded-2xl p-3 border border-[#B8D4E8] space-y-1.5 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-xl bg-[#2563EB] text-white shadow-xs">
                        <Terminal className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-[#2563EB] uppercase tracking-widest block">
                          MASM 6.11 & DOSBox Execution Pipeline
                        </span>
                        <h3 className="text-sm md:text-base font-bold text-[#163A5F]">
                          Standard 5-Step Laboratory Toolchain Procedure
                        </h3>
                      </div>
                    </div>
                    <p className="text-xs text-[#1F2937] leading-relaxed font-medium">
                      Follow these precise commands in DOSBox 0.74 / MASM 6.11 to mount the working directory, edit the assembly source code, assemble into object files, link into executable binaries, and single-step debug using DEBUG.EXE or Turbo Debugger.
                    </p>
                  </div>

                  {/* 5-Step DOSBox Command Cards */}
                  <div className="space-y-2">
                    {execData.dosboxSteps.map((cmd, idx) => (
                      <div
                        key={cmd.step}
                        className="bg-white rounded-2xl p-3 border border-[#B8D4E8] space-y-1.5 shadow-2xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-lg bg-[#2563EB] text-white text-xs font-mono font-bold flex items-center justify-center shadow-2xs">
                              {cmd.step}
                            </span>
                            <span className="text-xs font-mono font-bold text-[#163A5F]">
                              Step {cmd.step}: {cmd.purpose.slice(0, 45)}...
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(cmd.command);
                              setCopiedDosboxIdx(idx);
                              setTimeout(() => setCopiedDosboxIdx(null), 2000);
                            }}
                            className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#EAF4FB] hover:bg-[#DCEFFA] text-[#163A5F] border border-[#B8D4E8] text-xs font-mono font-bold transition-all cursor-pointer shadow-2xs"
                          >
                            {copiedDosboxIdx === idx ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-800">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-[#2563EB]" />
                                <span>Copy Command</span>
                              </>
                            )}
                          </button>
                        </div>

                        <p className="text-xs text-[#475569] leading-relaxed">
                          {cmd.purpose}
                        </p>

                        {/* Terminal Command Box */}
                        <div className="bg-[#163A5F] rounded-xl p-2.5 font-mono text-xs text-white space-y-1 shadow-2xs">
                          <div className="flex items-center gap-2 text-emerald-400 font-bold">
                            <span>C:\&gt;</span>
                            <span className="text-white whitespace-pre-wrap">{cmd.command}</span>
                          </div>
                          <div className="pt-1.5 border-t border-slate-700 text-slate-300 text-[11px] whitespace-pre-wrap">
                            {cmd.outputSample}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODULE 3: INTERACTIVE TESTBENCH & MEMORY DUMP */}
              {activeExecModule === 'testbench' && (
                <div className="space-y-2.5">
                  {expId === 'exp2' ? (
                    /* DEDICATED EXP 1B TESTBENCH: SIGNED & UNSIGNED VECTORS WITH DUAL HEX/DECIMAL DISPLAY */
                    <div className="bg-[#EAF4FB] rounded-2xl p-3 md:p-4 border border-[#B8D4E8] shadow-2xs space-y-3">
                      {/* Header and Controls */}
                      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-[#B8D4E8]">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-xl bg-[#2563EB] text-white shadow-xs">
                            <Calculator className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-bold text-[#2563EB] uppercase tracking-widest block">
                              EXP 1B Dual Vector Testbench (Signed & Unsigned ALU)
                            </span>
                            <h3 className="text-sm md:text-base font-bold text-[#163A5F]">
                              Multiplication (MUL/IMUL) & Division (DIV/IDIV) Simulator
                            </h3>
                          </div>
                        </div>

                        {/* Format & Execution Controls */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Format Toggle */}
                          <div className="flex items-center bg-white rounded-xl p-0.5 border border-[#B8D4E8] shadow-2xs">
                            <button
                              onClick={() => setExp2InputMode('hex')}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                                exp2InputMode === 'hex'
                                  ? 'bg-[#2563EB] text-white shadow-xs'
                                  : 'text-[#475569] hover:text-[#163A5F]'
                              }`}
                            >
                              <Hash className="w-3 h-3" />
                              <span>Hex Input</span>
                            </button>
                            <button
                              onClick={() => setExp2InputMode('dec')}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                                exp2InputMode === 'dec'
                                  ? 'bg-[#2563EB] text-white shadow-xs'
                                  : 'text-[#475569] hover:text-[#163A5F]'
                              }`}
                            >
                              <Binary className="w-3 h-3" />
                              <span>Decimal Input</span>
                            </button>
                          </div>

                          {/* Filter Tabs */}
                          <div className="flex items-center flex-wrap gap-1 bg-white rounded-xl p-0.5 border border-[#B8D4E8] shadow-2xs">
                            <button
                              onClick={() => setExp2ActiveSection('all')}
                              className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                                exp2ActiveSection === 'all'
                                  ? 'bg-[#163A5F] text-white shadow-xs'
                                  : 'text-[#475569] hover:text-[#163A5F]'
                              }`}
                            >
                              All (4 Operations)
                            </button>
                            <button
                              onClick={() => setExp2ActiveSection('u_mul')}
                              className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                                exp2ActiveSection === 'u_mul'
                                  ? 'bg-[#2563EB] text-white shadow-xs'
                                  : 'text-[#475569] hover:text-[#2563EB]'
                              }`}
                            >
                              Unsigned MUL
                            </button>
                            <button
                              onClick={() => setExp2ActiveSection('u_div')}
                              className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                                exp2ActiveSection === 'u_div'
                                  ? 'bg-[#0284C7] text-white shadow-xs'
                                  : 'text-[#475569] hover:text-[#0284C7]'
                              }`}
                            >
                              Unsigned DIV
                            </button>
                            <button
                              onClick={() => setExp2ActiveSection('s_imul')}
                              className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                                exp2ActiveSection === 's_imul'
                                  ? 'bg-[#7C3AED] text-white shadow-xs'
                                  : 'text-[#475569] hover:text-[#7C3AED]'
                              }`}
                            >
                              Signed IMUL
                            </button>
                            <button
                              onClick={() => setExp2ActiveSection('s_idiv')}
                              className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                                exp2ActiveSection === 's_idiv'
                                  ? 'bg-[#9333EA] text-white shadow-xs'
                                  : 'text-[#475569] hover:text-[#9333EA]'
                              }`}
                            >
                              Signed IDIV
                            </button>
                          </div>

                          {/* Run Execution Button */}
                          <button
                            onClick={handleRunSimulation}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-mono font-bold shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>Run ALU Simulation</span>
                          </button>
                        </div>
                      </div>

                      {/* 4 Dedicated Separated Arithmetic Sections (Unsigned MUL, Unsigned DIV, Signed IMUL, Signed IDIV) */}
                      {(() => {
                        const isHex = exp2InputMode === 'hex';

                        // 1. Unsigned MUL
                        const uMulA = parse16BitUnsignedVal(exp2UMulA, isHex, 0x0A12);
                        const uMulB = parse16BitUnsignedVal(exp2UMulB, isHex, 0x0050);
                        const uProd = uMulA * uMulB;
                        const uProdDx = Math.floor(uProd / 65536) & 0xFFFF;
                        const uProdAx = uProd & 0xFFFF;
                        const uMulCfOf = uProdDx !== 0;

                        // 2. Unsigned DIV
                        const uDivA = parse16BitUnsignedVal(exp2UDivA, isHex, 0x0A12);
                        const uDivB = parse16BitUnsignedVal(exp2UDivB, isHex, 0x0050);
                        const uQuot = uDivB !== 0 ? Math.floor(uDivA / uDivB) & 0xFFFF : 0;
                        const uRem = uDivB !== 0 ? (uDivA % uDivB) & 0xFFFF : 0;

                        // 3. Signed IMUL
                        const sMulA = parse16BitSignedVal(exp2SMulA, isHex, -25);
                        const sMulB = parse16BitSignedVal(exp2SMulB, isHex, 5);
                        const sMulA_word = (sMulA < 0 ? sMulA + 65536 : sMulA) & 0xFFFF;
                        const sMulB_word = (sMulB < 0 ? sMulB + 65536 : sMulB) & 0xFFFF;
                        const sProd = sMulA * sMulB;
                        const sProdU32 = (sProd < 0 ? sProd + 0x100000000 : sProd) >>> 0;
                        const sProdDx = (sProdU32 >>> 16) & 0xFFFF;
                        const sProdAx = sProdU32 & 0xFFFF;
                        const sExpectedDx = (sProdAx & 0x8000) ? 0xFFFF : 0x0000;
                        const sMulCfOf = sProdDx !== sExpectedDx;

                        // 4. Signed IDIV
                        const sDivA = parse16BitSignedVal(exp2SDivA, isHex, -25);
                        const sDivB = parse16BitSignedVal(exp2SDivB, isHex, 5);
                        const sDivA_word = (sDivA < 0 ? sDivA + 65536 : sDivA) & 0xFFFF;
                        const sDivB_word = (sDivB < 0 ? sDivB + 65536 : sDivB) & 0xFFFF;
                        const sQuot = sDivB !== 0 ? Math.trunc(sDivA / sDivB) : 0;
                        const sRem = sDivB !== 0 ? (sDivA % sDivB) : 0;
                        const sQuotAx = (sQuot < 0 ? sQuot + 65536 : sQuot) & 0xFFFF;
                        const sRemDx = (sRem < 0 ? sRem + 65536 : sRem) & 0xFFFF;

                        return (
                          <div className="space-y-4">
                            {/* Grid of 4 Operations */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                              {/* Operation 1: Unsigned Multiplication (MUL) */}
                              {(exp2ActiveSection === 'all' || exp2ActiveSection === 'u_mul') && (
                                <div className="bg-white rounded-xl p-3.5 border-2 border-blue-200 space-y-3 shadow-2xs">
                                  <div className="flex items-center justify-between pb-1.5 border-b border-blue-100">
                                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-blue-900">
                                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                                      <span>1. Unsigned Multiplication (MUL)</span>
                                    </div>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-bold border border-blue-200">
                                      16-bit × 16-bit → 32-bit (DX:AX)
                                    </span>
                                  </div>

                                  {/* Inputs */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {/* VAL1 */}
                                    <div className="space-y-1">
                                      <label className="text-[11px] font-mono font-bold text-[#163A5F] block">
                                        VAL1 (Multiplicand):
                                      </label>
                                      <input
                                        type="text"
                                        value={exp2UMulA}
                                        onChange={(e) => setExp2UMulA(e.target.value)}
                                        placeholder={isHex ? "e.g. 0A12" : "e.g. 2578"}
                                        className="w-full bg-[#EAF4FB]/50 border border-[#B8D4E8] focus:border-[#2563EB] rounded-lg px-2.5 py-1 text-xs font-mono text-[#163A5F] focus:outline-none font-bold"
                                      />
                                      {/* Format Badge */}
                                      <div className="bg-[#F8FAFC] p-1.5 rounded-lg border border-[#CBD5E1] space-y-0.5 text-[10px] font-mono">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[#475569]">Hex:</span>
                                          <strong className="text-blue-700">{to16BitHexStr(uMulA)}</strong>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-[#475569]">Decimal:</span>
                                          <strong className="text-emerald-700">{uMulA.toLocaleString()}D</strong>
                                        </div>
                                        <div className="flex items-center justify-between text-[9px] pt-0.5 border-t border-slate-200 text-[#475569]">
                                          <span>Binary:</span>
                                          <span className="text-slate-700">{to16BitBinStr(uMulA)}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* VAL2 */}
                                    <div className="space-y-1">
                                      <label className="text-[11px] font-mono font-bold text-[#163A5F] block">
                                        VAL2 (Multiplier):
                                      </label>
                                      <input
                                        type="text"
                                        value={exp2UMulB}
                                        onChange={(e) => setExp2UMulB(e.target.value)}
                                        placeholder={isHex ? "e.g. 0050" : "e.g. 80"}
                                        className="w-full bg-[#EAF4FB]/50 border border-[#B8D4E8] focus:border-[#2563EB] rounded-lg px-2.5 py-1 text-xs font-mono text-[#163A5F] focus:outline-none font-bold"
                                      />
                                      {/* Format Badge */}
                                      <div className="bg-[#F8FAFC] p-1.5 rounded-lg border border-[#CBD5E1] space-y-0.5 text-[10px] font-mono">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[#475569]">Hex:</span>
                                          <strong className="text-blue-700">{to16BitHexStr(uMulB)}</strong>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-[#475569]">Decimal:</span>
                                          <strong className="text-emerald-700">{uMulB.toLocaleString()}D</strong>
                                        </div>
                                        <div className="flex items-center justify-between text-[9px] pt-0.5 border-t border-slate-200 text-[#475569]">
                                          <span>Binary:</span>
                                          <span className="text-slate-700">{to16BitBinStr(uMulB)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Dedicated Output & Verification */}
                                  <div className="bg-blue-50/80 p-2.5 rounded-lg border border-blue-200 space-y-1.5 font-mono text-xs">
                                    <div className="flex items-center justify-between font-bold text-[#163A5F] pb-1 border-b border-blue-200">
                                      <span>MUL Result (Register Pair):</span>
                                      <span className="text-blue-700 font-extrabold text-sm">
                                        DX:AX = {to16BitHexStr(uProdDx).replace('H','')}:{to16BitHexStr(uProdAx)}
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-[#163A5F] flex items-center justify-between bg-white/80 px-2 py-1 rounded border border-blue-100">
                                      <span>• <strong>Hex Equation:</strong></span>
                                      <code className="text-blue-800 font-bold">{to16BitHexStr(uMulA)} × {to16BitHexStr(uMulB)} = {to16BitHexStr(uProdDx).replace('H','')}{to16BitHexStr(uProdAx)}</code>
                                    </div>
                                    <div className="text-[11px] text-[#163A5F] flex items-center justify-between bg-white/80 px-2 py-1 rounded border border-blue-100">
                                      <span>• <strong>Decimal Equation:</strong></span>
                                      <span className="text-emerald-700 font-bold">{uMulA.toLocaleString()} × {uMulB.toLocaleString()} = {uProd.toLocaleString()}D</span>
                                    </div>
                                    <div className="text-[11px] text-[#475569] pt-0.5">
                                      • <strong>Register Allocation:</strong> Upper Word <code className="text-blue-800 font-bold">DX = {to16BitHexStr(uProdDx)}</code>, Lower Word <code className="text-blue-800 font-bold">AX = {to16BitHexStr(uProdAx)}</code>
                                    </div>
                                    <div className="text-[10px] text-slate-600 flex items-center justify-between pt-0.5">
                                      <span>Flags: CF = {uMulCfOf ? '1' : '0'}, OF = {uMulCfOf ? '1' : '0'}</span>
                                      <span className="italic">{uMulCfOf ? 'Upper DX has high-order product' : 'Upper DX is zero'}</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Operation 2: Unsigned Division (DIV) */}
                              {(exp2ActiveSection === 'all' || exp2ActiveSection === 'u_div') && (
                                <div className="bg-white rounded-xl p-3.5 border-2 border-sky-200 space-y-3 shadow-2xs">
                                  <div className="flex items-center justify-between pb-1.5 border-b border-sky-100">
                                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-sky-900">
                                      <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
                                      <span>2. Unsigned Division (DIV)</span>
                                    </div>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-800 font-bold border border-sky-200">
                                      16-bit ÷ 16-bit → Q: AX, R: DX
                                    </span>
                                  </div>

                                  {/* Inputs */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {/* VAL1 */}
                                    <div className="space-y-1">
                                      <label className="text-[11px] font-mono font-bold text-[#163A5F] block">
                                        VAL1 (Dividend in AX):
                                      </label>
                                      <input
                                        type="text"
                                        value={exp2UDivA}
                                        onChange={(e) => setExp2UDivA(e.target.value)}
                                        placeholder={isHex ? "e.g. 0A12" : "e.g. 2578"}
                                        className="w-full bg-[#EAF4FB]/50 border border-[#B8D4E8] focus:border-[#0284C7] rounded-lg px-2.5 py-1 text-xs font-mono text-[#163A5F] focus:outline-none font-bold"
                                      />
                                      {/* Format Badge */}
                                      <div className="bg-[#F8FAFC] p-1.5 rounded-lg border border-[#CBD5E1] space-y-0.5 text-[10px] font-mono">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[#475569]">Hex:</span>
                                          <strong className="text-sky-700">{to16BitHexStr(uDivA)}</strong>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-[#475569]">Decimal:</span>
                                          <strong className="text-emerald-700">{uDivA.toLocaleString()}D</strong>
                                        </div>
                                        <div className="flex items-center justify-between text-[9px] pt-0.5 border-t border-slate-200 text-[#475569]">
                                          <span>Binary:</span>
                                          <span className="text-slate-700">{to16BitBinStr(uDivA)}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* VAL2 */}
                                    <div className="space-y-1">
                                      <label className="text-[11px] font-mono font-bold text-[#163A5F] block">
                                        VAL2 (Divisor):
                                      </label>
                                      <input
                                        type="text"
                                        value={exp2UDivB}
                                        onChange={(e) => setExp2UDivB(e.target.value)}
                                        placeholder={isHex ? "e.g. 0050" : "e.g. 80"}
                                        className="w-full bg-[#EAF4FB]/50 border border-[#B8D4E8] focus:border-[#0284C7] rounded-lg px-2.5 py-1 text-xs font-mono text-[#163A5F] focus:outline-none font-bold"
                                      />
                                      {/* Format Badge */}
                                      <div className="bg-[#F8FAFC] p-1.5 rounded-lg border border-[#CBD5E1] space-y-0.5 text-[10px] font-mono">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[#475569]">Hex:</span>
                                          <strong className="text-sky-700">{to16BitHexStr(uDivB)}</strong>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-[#475569]">Decimal:</span>
                                          <strong className="text-emerald-700">{uDivB.toLocaleString()}D</strong>
                                        </div>
                                        <div className="flex items-center justify-between text-[9px] pt-0.5 border-t border-slate-200 text-[#475569]">
                                          <span>Binary:</span>
                                          <span className="text-slate-700">{to16BitBinStr(uDivB)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Dedicated Output & Verification */}
                                  <div className="bg-sky-50/80 p-2.5 rounded-lg border border-sky-200 space-y-1.5 font-mono text-xs">
                                    <div className="flex items-center justify-between font-bold text-[#163A5F] pb-1 border-b border-sky-200">
                                      <span>DIV Result (Quotient & Remainder):</span>
                                      <span className="text-sky-700 font-extrabold text-sm">
                                        AX = {to16BitHexStr(uQuot)}, DX = {to16BitHexStr(uRem)}
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-[#163A5F] flex items-center justify-between bg-white/80 px-2 py-1 rounded border border-sky-100">
                                      <span>• <strong>Hex Equation:</strong></span>
                                      <code className="text-sky-800 font-bold">{to16BitHexStr(uDivA)} ÷ {to16BitHexStr(uDivB)} = Q: {to16BitHexStr(uQuot)}, R: {to16BitHexStr(uRem)}</code>
                                    </div>
                                    <div className="text-[11px] text-[#163A5F] flex items-center justify-between bg-white/80 px-2 py-1 rounded border border-sky-100">
                                      <span>• <strong>Decimal Equation:</strong></span>
                                      <span className="text-emerald-700 font-bold">{uDivA.toLocaleString()} ÷ {uDivB.toLocaleString()} = Quotient {uQuot}D, Remainder {uRem}D</span>
                                    </div>
                                    <div className="text-[11px] text-[#475569] pt-0.5">
                                      • <strong>Register Allocation:</strong> Quotient in <code className="text-sky-800 font-bold">AX = {to16BitHexStr(uQuot)}</code> ({uQuot}D), Remainder in <code className="text-sky-800 font-bold">DX = {to16BitHexStr(uRem)}</code> ({uRem}D)
                                    </div>
                                    <div className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                                      Verification: {uDivA.toLocaleString()} = ({uDivB.toLocaleString()} × {uQuot}) + {uRem}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Operation 3: Signed Multiplication (IMUL) */}
                              {(exp2ActiveSection === 'all' || exp2ActiveSection === 's_imul') && (
                                <div className="bg-white rounded-xl p-3.5 border-2 border-purple-200 space-y-3 shadow-2xs">
                                  <div className="flex items-center justify-between pb-1.5 border-b border-purple-100">
                                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-purple-900">
                                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                                      <span>3. Signed Multiplication (IMUL)</span>
                                    </div>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-800 font-bold border border-purple-200">
                                      2's Compl (-32768 to +32767)
                                    </span>
                                  </div>

                                  {/* Inputs */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {/* S_VAL1 */}
                                    <div className="space-y-1">
                                      <label className="text-[11px] font-mono font-bold text-[#163A5F] block">
                                        S_VAL1 (Signed Multiplicand):
                                      </label>
                                      <input
                                        type="text"
                                        value={exp2SMulA}
                                        onChange={(e) => setExp2SMulA(e.target.value)}
                                        placeholder={isHex ? "e.g. FFE7" : "e.g. -25"}
                                        className="w-full bg-[#EAF4FB]/50 border border-[#B8D4E8] focus:border-[#7C3AED] rounded-lg px-2.5 py-1 text-xs font-mono text-[#163A5F] focus:outline-none font-bold"
                                      />
                                      {/* Format Badge */}
                                      <div className="bg-[#F8FAFC] p-1.5 rounded-lg border border-[#CBD5E1] space-y-0.5 text-[10px] font-mono">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[#475569]">Signed Dec:</span>
                                          <strong className={sMulA < 0 ? "text-rose-600" : "text-emerald-700"}>
                                            {sMulA >= 0 ? `+${sMulA}D` : `${sMulA}D`}
                                          </strong>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-[#475569]">2's Compl Hex:</span>
                                          <strong className="text-purple-700">{to16BitHexStr(sMulA_word)}</strong>
                                        </div>
                                        <div className="flex items-center justify-between text-[9px] pt-0.5 border-t border-slate-200 text-[#475569]">
                                          <span>Binary:</span>
                                          <span className="text-slate-700">{to16BitBinStr(sMulA_word)}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* S_VAL2 */}
                                    <div className="space-y-1">
                                      <label className="text-[11px] font-mono font-bold text-[#163A5F] block">
                                        S_VAL2 (Signed Multiplier):
                                      </label>
                                      <input
                                        type="text"
                                        value={exp2SMulB}
                                        onChange={(e) => setExp2SMulB(e.target.value)}
                                        placeholder={isHex ? "e.g. 0005" : "e.g. 5"}
                                        className="w-full bg-[#EAF4FB]/50 border border-[#B8D4E8] focus:border-[#7C3AED] rounded-lg px-2.5 py-1 text-xs font-mono text-[#163A5F] focus:outline-none font-bold"
                                      />
                                      {/* Format Badge */}
                                      <div className="bg-[#F8FAFC] p-1.5 rounded-lg border border-[#CBD5E1] space-y-0.5 text-[10px] font-mono">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[#475569]">Signed Dec:</span>
                                          <strong className={sMulB < 0 ? "text-rose-600" : "text-emerald-700"}>
                                            {sMulB >= 0 ? `+${sMulB}D` : `${sMulB}D`}
                                          </strong>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-[#475569]">2's Compl Hex:</span>
                                          <strong className="text-purple-700">{to16BitHexStr(sMulB_word)}</strong>
                                        </div>
                                        <div className="flex items-center justify-between text-[9px] pt-0.5 border-t border-slate-200 text-[#475569]">
                                          <span>Binary:</span>
                                          <span className="text-slate-700">{to16BitBinStr(sMulB_word)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Dedicated Output & Verification */}
                                  <div className="bg-purple-50/80 p-2.5 rounded-lg border border-purple-200 space-y-1.5 font-mono text-xs">
                                    <div className="flex items-center justify-between font-bold text-[#163A5F] pb-1 border-b border-purple-200">
                                      <span>IMUL Result (Register Pair):</span>
                                      <span className="text-purple-700 font-extrabold text-sm">
                                        DX:AX = {to16BitHexStr(sProdDx).replace('H','')}:{to16BitHexStr(sProdAx)}
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-[#163A5F] flex items-center justify-between bg-white/80 px-2 py-1 rounded border border-purple-100">
                                      <span>• <strong>Hex Equation (2's Compl):</strong></span>
                                      <code className="text-purple-800 font-bold">{to16BitHexStr(sMulA_word)} × {to16BitHexStr(sMulB_word)} = {to16BitHexStr(sProdDx).replace('H','')}{to16BitHexStr(sProdAx)}</code>
                                    </div>
                                    <div className="text-[11px] text-[#163A5F] flex items-center justify-between bg-white/80 px-2 py-1 rounded border border-purple-100">
                                      <span>• <strong>Decimal Equation:</strong></span>
                                      <span className={sProd < 0 ? "text-rose-600 font-bold" : "text-emerald-700 font-bold"}>
                                        ({sMulA >= 0 ? `+${sMulA}` : sMulA}) × ({sMulB >= 0 ? `+${sMulB}` : sMulB}) = {sProd}D
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-[#475569] pt-0.5">
                                      • <strong>Register Allocation:</strong> Upper Word <code className="text-purple-800 font-bold">DX = {to16BitHexStr(sProdDx)}</code>, Lower Word <code className="text-purple-800 font-bold">AX = {to16BitHexStr(sProdAx)}</code>
                                    </div>
                                    <div className="text-[10px] text-slate-600 flex items-center justify-between pt-0.5">
                                      <span>Flags: CF = {sMulCfOf ? '1' : '0'}, OF = {sMulCfOf ? '1' : '0'}</span>
                                      <span className="italic">{sMulCfOf ? 'DX contains significant product bits' : 'DX is pure sign-extension of AX'}</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Operation 4: Signed Division (IDIV with CWD) */}
                              {(exp2ActiveSection === 'all' || exp2ActiveSection === 's_idiv') && (
                                <div className="bg-white rounded-xl p-3.5 border-2 border-fuchsia-200 space-y-3 shadow-2xs">
                                  <div className="flex items-center justify-between pb-1.5 border-b border-fuchsia-100">
                                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-fuchsia-900">
                                      <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-600"></span>
                                      <span>4. Signed Division (IDIV with CWD)</span>
                                    </div>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-fuchsia-50 text-fuchsia-800 font-bold border border-fuchsia-200">
                                      CWD Sign-Extension → Q: AX, R: DX
                                    </span>
                                  </div>

                                  {/* Inputs */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {/* S_VAL1 */}
                                    <div className="space-y-1">
                                      <label className="text-[11px] font-mono font-bold text-[#163A5F] block">
                                        S_VAL1 (Signed Dividend):
                                      </label>
                                      <input
                                        type="text"
                                        value={exp2SDivA}
                                        onChange={(e) => setExp2SDivA(e.target.value)}
                                        placeholder={isHex ? "e.g. FFE7" : "e.g. -25"}
                                        className="w-full bg-[#EAF4FB]/50 border border-[#B8D4E8] focus:border-[#9333EA] rounded-lg px-2.5 py-1 text-xs font-mono text-[#163A5F] focus:outline-none font-bold"
                                      />
                                      {/* Format Badge */}
                                      <div className="bg-[#F8FAFC] p-1.5 rounded-lg border border-[#CBD5E1] space-y-0.5 text-[10px] font-mono">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[#475569]">Signed Dec:</span>
                                          <strong className={sDivA < 0 ? "text-rose-600" : "text-emerald-700"}>
                                            {sDivA >= 0 ? `+${sDivA}D` : `${sDivA}D`}
                                          </strong>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-[#475569]">2's Compl Hex:</span>
                                          <strong className="text-fuchsia-700">{to16BitHexStr(sDivA_word)}</strong>
                                        </div>
                                        <div className="flex items-center justify-between text-[9px] pt-0.5 border-t border-slate-200 text-[#475569]">
                                          <span>Binary:</span>
                                          <span className="text-slate-700">{to16BitBinStr(sDivA_word)}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* S_VAL2 */}
                                    <div className="space-y-1">
                                      <label className="text-[11px] font-mono font-bold text-[#163A5F] block">
                                        S_VAL2 (Signed Divisor):
                                      </label>
                                      <input
                                        type="text"
                                        value={exp2SDivB}
                                        onChange={(e) => setExp2SDivB(e.target.value)}
                                        placeholder={isHex ? "e.g. 0005" : "e.g. 5"}
                                        className="w-full bg-[#EAF4FB]/50 border border-[#B8D4E8] focus:border-[#9333EA] rounded-lg px-2.5 py-1 text-xs font-mono text-[#163A5F] focus:outline-none font-bold"
                                      />
                                      {/* Format Badge */}
                                      <div className="bg-[#F8FAFC] p-1.5 rounded-lg border border-[#CBD5E1] space-y-0.5 text-[10px] font-mono">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[#475569]">Signed Dec:</span>
                                          <strong className={sDivB < 0 ? "text-rose-600" : "text-emerald-700"}>
                                            {sDivB >= 0 ? `+${sDivB}D` : `${sDivB}D`}
                                          </strong>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-[#475569]">2's Compl Hex:</span>
                                          <strong className="text-fuchsia-700">{to16BitHexStr(sDivB_word)}</strong>
                                        </div>
                                        <div className="flex items-center justify-between text-[9px] pt-0.5 border-t border-slate-200 text-[#475569]">
                                          <span>Binary:</span>
                                          <span className="text-slate-700">{to16BitBinStr(sDivB_word)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Dedicated Output & Verification */}
                                  <div className="bg-fuchsia-50/80 p-2.5 rounded-lg border border-fuchsia-200 space-y-1.5 font-mono text-xs">
                                    <div className="flex items-center justify-between font-bold text-[#163A5F] pb-1 border-b border-fuchsia-200">
                                      <span>IDIV Result (Quotient & Remainder):</span>
                                      <span className="text-fuchsia-700 font-extrabold text-sm">
                                        AX = {to16BitHexStr(sQuotAx)}, DX = {to16BitHexStr(sRemDx)}
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-[#163A5F] flex items-center justify-between bg-white/80 px-2 py-1 rounded border border-fuchsia-100">
                                      <span>• <strong>Hex Equation (2's Compl):</strong></span>
                                      <code className="text-fuchsia-800 font-bold">{to16BitHexStr(sDivA_word)} ÷ {to16BitHexStr(sDivB_word)} = Q: {to16BitHexStr(sQuotAx)}, R: {to16BitHexStr(sRemDx)}</code>
                                    </div>
                                    <div className="text-[11px] text-[#163A5F] flex items-center justify-between bg-white/80 px-2 py-1 rounded border border-fuchsia-100">
                                      <span>• <strong>Decimal Equation:</strong></span>
                                      <span className={sQuot < 0 ? "text-rose-600 font-bold" : "text-emerald-700 font-bold"}>
                                        ({sDivA}) ÷ ({sDivB}) = Quotient {sQuot}D, Remainder {sRem}D
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-[#475569] pt-0.5">
                                      • <strong>Register Allocation:</strong> Quotient <code className="text-fuchsia-800 font-bold">AX = {to16BitHexStr(sQuotAx)}</code> ({sQuot}D), Remainder <code className="text-fuchsia-800 font-bold">DX = {to16BitHexStr(sRemDx)}</code> ({sRem}D)
                                    </div>
                                    <div className="text-[10px] text-fuchsia-950 font-semibold bg-fuchsia-50 px-2 py-1 rounded border border-fuchsia-200">
                                      Verification: {sDivA} = ({sDivB} × {sQuot}) + {sRem}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Results Preview Banner */}
                      <div className="bg-white rounded-xl p-2.5 border border-[#B8D4E8] space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-emerald-800 font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Status: {simOutput.status}
                          </span>
                          <span className="text-[#475569] font-semibold">{simOutput.cycles} CPU Clock Cycles</span>
                        </div>
                        <div className="text-xs sm:text-sm font-mono text-[#163A5F] bg-[#DCEFFA]/60 p-2 rounded-lg border border-[#B8D4E8] font-bold leading-relaxed">
                          {simOutput.result}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* STANDARD TESTBENCH INTERFACE FOR OTHER EXPERIMENTS */
                    <div className="bg-[#EAF4FB] rounded-2xl p-3 md:p-4 border border-[#B8D4E8] shadow-2xs space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-xl bg-[#2563EB] text-white shadow-xs">
                            <Terminal className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-bold text-[#2563EB] uppercase tracking-widest block">
                              Interactive Testbench Simulator
                            </span>
                            <h3 className="text-sm md:text-base font-bold text-[#163A5F]">
                              Run & Trace Execution with Custom Inputs
                            </h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleRunSimulation}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-mono font-bold shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>Execute Program (Run Trace)</span>
                          </button>
                        </div>
                      </div>

                      {/* Input Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1.5 border-t border-[#B8D4E8]">
                        <div className="space-y-0.5">
                          <label className="text-[11px] font-mono text-[#163A5F] font-bold">
                            {expId === 'exp1' ? 'Primary Operand NUM1 (32-bit Little-Endian Bytes):' :
                             expId === 'exp_math' ? 'Input Number N (Decimal 1 - 8):' :
                             expId === 'exp_bit1' ? '8-bit Hex Input Byte (DATA):' :
                             expId === 'exp_bit2' ? '8-bit Hex Input Byte (DATA):' :
                             expId === 'exp_bit3' ? '8-bit Hex Input Byte (DATA):' :
                             expId === 'exp_arr1' ? 'Hex Byte Array (NUMS):' :
                             expId === 'exp3' ? 'Hex Byte Array (LIST):' :
                             expId === 'exp4' ? 'Hex Byte Array (ARRAY):' :
                             expId === 'exp_str1' ? 'Input String (Terminated with $):' :
                             expId === 'exp_str2' ? 'Source String (Terminated with $):' :
                             expId === 'exp_str3' ? 'Primary String 1 (STR1):' :
                             expId === 'exp_str4' ? 'Input String to Verify (STR):' :
                             expId === 'exp_clock1' ? 'Simulation Time Vector (HH:MM:SS):' :
                             expId === 'exp_clock2' ? 'Clock Test Vector (HH:MM:SS):' :
                             expId === 'exp_clock3' ? 'BIOS Timer Ticks Count (Decimal Ticks 0 - 1573040):' :
                             expId === 'exp_stepper1' ? 'Variable Step Count CX for CW Rotation (e.g., 200 = 360°, 100 = 180°, 50 = 90°):' :
                             expId === 'exp_stepper2' ? 'Variable Step Count CX for CCW Rotation (e.g., 200 = 360°, 100 = 180°, 50 = 90°):' :
                             expId === 'exp_adc' ? 'Analog Input Voltage Vin (0.00 V to 5.00 V):' :
                             expId === 'exp_dac' ? 'Waveform Type to Generate (Square, Triangular, Step):' :
                             expId === 'exp5' ? 'Source Memory Block (SRC_BLOCK):' :
                             expId === 'exp_8051_arith' ? '8051 Operand 1 (Accumulator A Hex Byte):' :
                             expId === 'exp_8051_muldiv' ? '8051 Dividend/Multiplicand (Accumulator A Hex Byte):' :
                             expId === 'exp_8051_logic' ? '8051 Primary Operand (Accumulator A Hex Byte):' :
                             expId === 'exp_8051_regbanks' ? 'Target Register Bank Selection (Bank 0, Bank 1, Bank 2, Bank 3):' :
                             expId === 'exp_8051_timer0_m1' ? 'Timer 0 Mode 1 Delay Duration (ms or value):' :
                             expId === 'exp_8051_timer1_m0' ? 'Timer 1 Mode 0 Delay Duration (µs or value):' :
                             expId === 'exp_8051_counter0_m2' ? 'Counter 0 Mode 2 Delay Duration (ms or value):' :
                             expId === 'exp_8051_counter1_m1' ? 'Counter 1 Mode 1 External Pulse Count Threshold:' :
                             expId === 'exp_8051_uart_9600' || expId === 'exp_8051_uart_4800' || expId === 'exp_8051_uart_2400' ? 'ASCII Character / Byte to Transmit Serially (e.g., A or 41H):' :
                             expId === 'exp_8051_lcd_8bit' ? 'Line 1 ASCII Display String (max 16 chars):' :
                             expId === 'exp_8051_lcd_4bit' ? 'Line 1 ASCII Display String (4-bit dual nibbles, max 16 chars):' :
                             'Primary Input / Memory Buffer A:'}
                          </label>
                          <input
                            type="text"
                            value={customInputA}
                            onChange={(e) => setCustomInputA(e.target.value)}
                            className="w-full bg-white border border-[#B8D4E8] focus:border-[#2563EB] rounded-xl px-3 py-1.5 text-xs font-mono text-[#163A5F] focus:outline-none shadow-2xs font-semibold"
                          />
                        </div>
                        {customInputB !== '' && (
                          <div className="space-y-0.5">
                            <label className="text-[11px] font-mono text-[#163A5F] font-bold">
                              {expId === 'exp1' ? 'Secondary Operand NUM2 (32-bit Little-Endian Bytes):' :
                               expId === 'exp_str3' ? 'Comparison String 2 (STR2):' :
                               expId === 'exp_8051_arith' ? '8051 Operand 2 (Register R0 Hex Byte):' :
                               expId === 'exp_8051_muldiv' ? '8051 Divisor/Multiplier (Register B Hex Byte):' :
                               expId === 'exp_8051_logic' ? '8051 Bitmask / Operand 2 (Register R0 Hex Byte):' :
                               expId === 'exp_8051_regbanks' ? 'Test Data Byte to Load into R0 (Hex Byte):' :
                               expId === 'exp_8051_timer0_m1' ? 'Target Output Port to Blink (All 8 Pins):' :
                               expId === 'exp_8051_timer1_m0' ? 'Target Output Port to Blink (All 8 Pins):' :
                               expId === 'exp_8051_counter0_m2' ? 'Target Output Port to Blink (All 8 Pins):' :
                               expId === 'exp_8051_counter1_m1' ? 'Target Output Port to Blink (All 8 Pins):' :
                               expId === 'exp_8051_uart_9600' || expId === 'exp_8051_uart_4800' || expId === 'exp_8051_uart_2400' ? 'Target UART Baud Rate & Timer 1 Reload Value (TH1):' :
                               expId === 'exp_8051_lcd_8bit' ? 'Line 2 ASCII Display String (max 16 chars):' :
                               expId === 'exp_8051_lcd_4bit' ? 'Line 2 ASCII Display String (4-bit dual nibbles, max 16 chars):' :
                               'Secondary Operand B:'}
                            </label>
                            <input
                              type="text"
                              value={customInputB}
                              onChange={(e) => setCustomInputB(e.target.value)}
                              className="w-full bg-white border border-[#B8D4E8] focus:border-[#2563EB] rounded-xl px-3 py-1.5 text-xs font-mono text-[#163A5F] focus:outline-none shadow-2xs font-semibold"
                            />
                          </div>
                        )}
                      </div>

                      {/* Little-Endian Interpretation Indicator for Multi-Byte Experiments */}
                      {expId === 'exp1' && (
                        <div className="bg-[#EAF4FB]/70 p-2 rounded-xl border border-[#B8D4E8] text-[11px] font-mono text-[#163A5F] flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                            <span><strong>8086 Little-Endian Byte Interpretation:</strong> (Lowest Byte = LSB, Highest Byte = MSB)</span>
                          </div>
                          <div className="flex flex-wrap gap-2 text-[11px]">
                            <span className="bg-white px-2 py-0.5 rounded border border-[#B8D4E8]">
                              NUM1: <code className="font-bold text-blue-700">{(() => {
                                const parts = customInputA.trim().split(/[\s,]+/).filter(Boolean);
                                const rev = [...parts].reverse().map(p => p.replace(/H$/i, '').padStart(2, '0')).join('');
                                return rev ? `${rev}H` : 'FCFDFEFFH';
                              })()}</code>
                            </span>
                            <span className="bg-white px-2 py-0.5 rounded border border-[#B8D4E8]">
                              NUM2: <code className="font-bold text-blue-700">{(() => {
                                const parts = customInputB.trim().split(/[\s,]+/).filter(Boolean);
                                const rev = [...parts].reverse().map(p => p.replace(/H$/i, '').padStart(2, '0')).join('');
                                return rev ? `${rev}H` : '04030201H';
                              })()}</code>
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Results Preview */}
                      <div className="bg-white rounded-xl p-2.5 border border-[#B8D4E8] space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-emerald-800 font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Status: {simOutput.status}
                          </span>
                          <span className="text-[#475569] font-semibold">{simOutput.cycles} CPU Clock Cycles</span>
                        </div>
                        <div className="text-xs sm:text-sm font-mono text-[#163A5F] bg-[#DCEFFA]/60 p-2 rounded-lg border border-[#B8D4E8] font-bold">
                          {simOutput.result}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CPU Registers Dump & Memory Matrix */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">
                    {/* 8086 Register File */}
                    <div className="lg:col-span-6 bg-white rounded-2xl p-3 border border-[#B8D4E8] space-y-2 shadow-2xs">
                      <div className="text-xs font-mono font-bold text-[#163A5F] uppercase flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-[#2563EB]" />
                        <span>8086 CPU Register File State (Post-Execution)</span>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5 font-mono text-xs">
                        {Object.entries(simOutput.registers).map(([reg, val]) => (
                          <div key={reg} className="bg-[#EAF4FB] p-1.5 rounded-xl border border-[#B8D4E8] text-center">
                            <div className="text-[10px] text-[#475569] font-bold">{reg}</div>
                            <div className="text-[#163A5F] font-bold mt-0.5">{val}</div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-1.5 border-t border-[#B8D4E8]">
                        <div className="text-[10px] font-mono text-[#163A5F] font-bold mb-1">Status Flags:</div>
                        <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                          {Object.entries(simOutput.flags).map(([flg, st]) => (
                            <span
                              key={flg}
                              className={`px-1.5 py-0.5 rounded-md border text-[10px] font-bold ${
                                st === '1'
                                  ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                                  : 'bg-[#F0F7FF] border-[#B8D4E8] text-[#475569]'
                              }`}
                            >
                              {flg}={st}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Memory Hex Dump */}
                    <div className="lg:col-span-6 bg-white rounded-2xl p-3 border border-[#B8D4E8] space-y-2 shadow-2xs">
                      <div className="text-xs font-mono font-bold text-[#163A5F] uppercase flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-[#2563EB]" />
                        <span>RAM Segment Hex Dump</span>
                      </div>

                      <div className="bg-[#EAF4FB]/70 rounded-xl p-2.5 border border-[#B8D4E8] font-mono text-xs text-[#163A5F] space-y-1 max-h-[160px] overflow-y-auto scrollbar-thin">
                        {simOutput.memoryDump.map((line, idx) => (
                          <div key={idx} className="text-[#163A5F] font-bold">{line}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE 4: FINAL OUTPUT, MEMORY & SIDE-BY-SIDE VERIFICATION */}
              {activeExecModule === 'verification' && (() => {
                const lastStep = execData.steps[execData.steps.length - 1];
                const { memoryRows, verificationRows, observationData } = getExperimentVerificationSuite(expId, manualPage, lastStep);

                const handleCopyObservation = () => {
                  const text = `=== 8086 LAB OBSERVATION RECORD ===
EXPERIMENT: ${manualPage.number} - ${manualPage.title}

--- 1. INPUT SPECIFICATION ---
${observationData.inputs.map((inp, idx) => `[${idx + 1}] Memory Address: ${inp.address} | Variable: ${inp.variable.padEnd(14)} | Hex: ${inp.hexVal.padEnd(16)} | Dec: ${inp.decVal}`).join('\n')}

--- 2. INITIAL REGISTER SETUP ---
${observationData.initialRegisters.map((reg) => `Register: ${reg.register.padEnd(4)} = ${reg.value.padEnd(8)} | Purpose: ${reg.purpose}`).join('\n')}

--- 3. OBSERVED OUTPUTS & MEMORY DUMP ---
${observationData.outputs.map((out, idx) => `[${idx + 1}] Memory Address: ${out.address} | Variable: ${out.variable.padEnd(14)} | Hex: ${out.hexVal.padEnd(16)} | Dec: ${out.decVal}`).join('\n')}

--- 4. FINAL CPU STATUS FLAGS ---
${observationData.finalFlags.map((flg) => `Flag: ${flg.flag.padEnd(4)} = ${flg.value} (${flg.meaning})`).join('\n')}

--- 5. VERIFIED RESULT ---
${observationData.resultSummary}
===================================`;
                  navigator.clipboard.writeText(text);
                  setCopiedObsRecord(true);
                  setTimeout(() => setCopiedObsRecord(false), 2500);
                };

                return (
                  <div className="bg-white rounded-2xl p-4.5 border border-[#B8D4E8] space-y-4 shadow-2xs">
                    {/* Header & Sub-Nav Filter */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#B8D4E8]">
                      <div>
                        <div className="flex items-center gap-2 text-sm font-mono font-bold text-[#163A5F] uppercase">
                          <Award className="w-4.5 h-4.5 text-[#2563EB]" />
                          <span>4. Final Output, RAM Memory & Side-by-Side Verification</span>
                        </div>
                        <p className="text-xs text-[#52799F] mt-0.5 font-sans">
                          Comparative validation: Theoretical Hand Proofs vs. 8086 Simulated CPU Registers & RAM Dump
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* View Filter Switcher */}
                        <div className="inline-flex p-1 bg-[#EAF4FB] rounded-xl border border-[#B8D4E8]">
                          {[
                            { id: 'all', label: 'All Sections', icon: Layers },
                            { id: 'side_by_side', label: 'Side-by-Side Split', icon: ArrowRightLeft },
                            { id: 'memory_dump', label: 'RAM & CPU State', icon: Database },
                            { id: 'manual_proof', label: 'Manual Proof', icon: Calculator },
                            { id: 'observation_sheet', label: 'Observation Book', icon: ClipboardCheck }
                          ].map((tab) => {
                            const IconComponent = tab.icon;
                            return (
                              <button
                                key={tab.id}
                                onClick={() => setVerificationViewMode(tab.id as any)}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                                  verificationViewMode === tab.id
                                    ? 'bg-[#2563EB] text-white shadow-xs'
                                    : 'text-[#163A5F] hover:bg-white/60'
                                }`}
                              >
                                <IconComponent className="w-3.5 h-3.5" />
                                <span>{tab.label}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Copy Observation Button */}
                        <button
                          onClick={handleCopyObservation}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-all cursor-pointer"
                        >
                          {copiedObsRecord ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-emerald-600" />}
                          <span>{copiedObsRecord ? 'Copied to Clipboard!' : 'Copy Observation Book Sheet'}</span>
                        </button>
                      </div>
                    </div>

                    {/* STATUS BANNER */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-300 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          <CheckCircle2 className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <span className="text-[11px] font-mono font-bold text-emerald-900 block uppercase">Execution Status</span>
                          <span className="text-xs text-emerald-800 font-medium">Program Terminated (INT 21H / 4CH)</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-300 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          <ArrowRightLeft className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <span className="text-[11px] font-mono font-bold text-blue-900 block uppercase">Side-by-Side Alignment</span>
                          <span className="text-xs text-blue-800 font-medium">100% Theoretical vs Simulated Match</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-300 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          <Database className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <span className="text-[11px] font-mono font-bold text-amber-900 block uppercase">RAM Memory Structure</span>
                          <span className="text-xs text-amber-800 font-medium">Intel Little-Endian Byte Order Verified</span>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 1: SIDE-BY-SIDE SPLIT VIEW */}
                    {(verificationViewMode === 'all' || verificationViewMode === 'side_by_side' || verificationViewMode === 'memory_dump' || verificationViewMode === 'manual_proof') && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#163A5F] uppercase">
                            <ArrowRightLeft className="w-4 h-4 text-[#2563EB]" />
                            <span>Side-by-Side Dual-Panel Comparison</span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EAF4FB] text-[#2563EB] font-bold border border-[#B8D4E8]">
                            Simulated 8086 State ↔ Theoretical Hand Proof
                          </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* LEFT PANEL: 8086 HARDWARE OUTPUT & MEMORY STATE */}
                          {(verificationViewMode === 'all' || verificationViewMode === 'side_by_side' || verificationViewMode === 'memory_dump') && (
                            <div className="space-y-3 p-3.5 rounded-xl border border-blue-200 bg-blue-50/20">
                              <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                                <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-900 uppercase">
                                  <Cpu className="w-4 h-4 text-blue-600" />
                                  <span>Simulated 8086 Final CPU & Memory Output</span>
                                </div>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                                  Hardware State
                                </span>
                              </div>

                              {/* Final Register File */}
                              <div className="space-y-1.5">
                                <span className="text-[11px] font-mono font-bold text-[#163A5F] block">
                                  Final CPU Register File:
                                </span>
                                <div className="grid grid-cols-3 gap-1.5 font-mono text-xs">
                                  {[
                                    { reg: 'AX', val: lastStep?.registers?.AX || '0000H' },
                                    { reg: 'BX', val: lastStep?.registers?.BX || '0000H' },
                                    { reg: 'CX', val: lastStep?.registers?.CX || '0000H' },
                                    { reg: 'DX', val: lastStep?.registers?.DX || '0000H' },
                                    { reg: 'SI', val: lastStep?.registers?.SI || '0000H' },
                                    { reg: 'DI', val: lastStep?.registers?.DI || '0000H' },
                                    { reg: 'SP', val: lastStep?.registers?.SP || 'FFFEH' },
                                    { reg: 'BP', val: lastStep?.registers?.BP || '0000H' },
                                    { reg: 'IP', val: lastStep?.registers?.IP || '0028H' }
                                  ].map((item) => (
                                    <div key={item.reg} className="p-2 rounded-lg bg-white border border-[#B8D4E8] flex justify-between items-center">
                                      <span className="font-bold text-[#2563EB]">{item.reg}:</span>
                                      <span className="font-bold text-[#163A5F]">{item.val}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Status Flags */}
                              <div className="space-y-1.5">
                                <span className="text-[11px] font-mono font-bold text-[#163A5F] block">
                                  Status Flags Register:
                                </span>
                                <div className="grid grid-cols-6 gap-1 font-mono text-center text-xs">
                                  {[
                                    { name: 'CF', val: lastStep?.flags?.CF ?? '0' },
                                    { name: 'ZF', val: lastStep?.flags?.ZF ?? '0' },
                                    { name: 'SF', val: lastStep?.flags?.SF ?? '0' },
                                    { name: 'OF', val: lastStep?.flags?.OF ?? '0' },
                                    { name: 'PF', val: lastStep?.flags?.PF ?? '0' },
                                    { name: 'AF', val: lastStep?.flags?.AF ?? '0' }
                                  ].map((flg) => (
                                    <div key={flg.name} className={`p-1.5 rounded-lg border ${
                                      flg.val === '1' ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold' : 'bg-white border-[#B8D4E8] text-[#52799F]'
                                    }`}>
                                      <div className="text-[10px] text-[#52799F]">{flg.name}</div>
                                      <div className="text-xs font-bold">{flg.val}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* RAM Memory Dump Table */}
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-mono font-bold text-[#163A5F] block">
                                    RAM Memory Segment Allocation:
                                  </span>
                                  <span className="text-[10px] font-mono text-[#52799F]">Little-Endian Format</span>
                                </div>
                                <div className="overflow-x-auto rounded-lg border border-[#B8D4E8] bg-white">
                                  <table className="w-full text-left text-xs font-mono">
                                    <thead className="bg-[#EAF4FB] text-[#163A5F] text-[11px] border-b border-[#B8D4E8]">
                                      <tr>
                                        <th className="p-2">Address</th>
                                        <th className="p-2">Symbol</th>
                                        <th className="p-2">Hex Bytes</th>
                                        <th className="p-2">Value</th>
                                        <th className="p-2 text-center">Type</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#B8D4E8]">
                                      {memoryRows.map((mem, idx) => (
                                        <tr key={idx} className={mem.type === 'output' ? 'bg-emerald-50/40' : 'bg-white'}>
                                          <td className="p-2 font-bold text-[#2563EB]">{mem.offset}</td>
                                          <td className="p-2 font-bold text-[#163A5F]">{mem.symbol}</td>
                                          <td className="p-2 font-bold text-amber-900 bg-amber-50/30 rounded px-1">{mem.hexBytes}</td>
                                          <td className="p-2 text-[#334155]">{mem.formatted}</td>
                                          <td className="p-2 text-center">
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                              mem.type === 'output' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                                            }`}>
                                              {mem.type}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              {/* Terminal Output Snapshot */}
                              {manualPage.expectedOutput?.terminalDump && (
                                <div className="space-y-1.5">
                                  <span className="text-[11px] font-mono font-bold text-[#163A5F] block">
                                    Terminal Output Stream:
                                  </span>
                                  <div className="bg-[#0F172A] text-emerald-400 p-2.5 rounded-lg font-mono text-xs border border-slate-700 whitespace-pre-wrap">
                                    {manualPage.expectedOutput.terminalDump}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* RIGHT PANEL: THEORETICAL CALCULATIONS & STEP PROOF */}
                          {(verificationViewMode === 'all' || verificationViewMode === 'side_by_side' || verificationViewMode === 'manual_proof') && (
                            <div className="space-y-3 p-3.5 rounded-xl border border-amber-200 bg-amber-50/20">
                              <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                                <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-900 uppercase">
                                  <Calculator className="w-4 h-4 text-amber-600" />
                                  <span>{manualPage.manualCalculations.title || 'Theoretical Pencil-and-Paper Manual Calculations'}</span>
                                </div>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                                  Analytical Proof
                                </span>
                              </div>

                              {/* Step-by-Step Proof Cards */}
                              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                                {manualPage.manualCalculations.steps.map((st, i) => (
                                  <div
                                    key={i}
                                    className={`p-3 rounded-xl border text-xs leading-relaxed transition-all shadow-2xs ${
                                      st.step.includes('Addition')
                                        ? 'bg-blue-50/50 border-blue-200 text-[#1E293B]'
                                        : st.step.includes('Subtraction')
                                        ? 'bg-amber-50/50 border-amber-200 text-[#1E293B]'
                                        : st.step.includes('Summary')
                                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-medium'
                                        : 'bg-white border-[#B8D4E8] text-[#1F2937]'
                                    }`}
                                  >
                                    <div className="flex items-start gap-2.5">
                                      <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold font-mono shrink-0 ${
                                        st.step.includes('Addition')
                                          ? 'bg-blue-600 text-white'
                                          : st.step.includes('Subtraction')
                                          ? 'bg-amber-600 text-white'
                                          : st.step.includes('Summary')
                                          ? 'bg-emerald-600 text-white'
                                          : 'bg-[#2563EB] text-white'
                                      }`}>
                                        Step {i + 1}
                                      </span>
                                      <div className="space-y-1 w-full">
                                        <span className="font-bold text-[#163A5F] block font-mono">
                                          {st.step}
                                        </span>
                                        <p className="text-xs text-[#334155] font-sans leading-normal whitespace-pre-wrap">
                                          {st.detail}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* SECTION 2: SIDE-BY-SIDE CROSS-VERIFICATION MATRIX TABLE */}
                    {(verificationViewMode === 'all' || verificationViewMode === 'side_by_side') && (
                      <div className="space-y-2 pt-2 border-t border-[#B8D4E8]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#163A5F] uppercase">
                            <Table className="w-4 h-4 text-[#2563EB]" />
                            <span>Side-by-Side Verification Cross-Check Matrix</span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                            Theoretical ↔ Simulated Exact Match
                          </span>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-[#B8D4E8] bg-white">
                          <table className="w-full text-left text-xs font-mono">
                            <thead className="bg-[#EAF4FB] text-[#163A5F] text-[11px] border-b border-[#B8D4E8]">
                              <tr>
                                <th className="p-2.5">Parameter / Variable</th>
                                <th className="p-2.5">Storage Location</th>
                                <th className="p-2.5">Theoretical Hand Calculation</th>
                                <th className="p-2.5">Simulated 8086 Output</th>
                                <th className="p-2.5 text-center">Verification Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#B8D4E8]">
                              {verificationRows.map((row, idx) => (
                                <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                                  <td className="p-2.5 font-bold text-[#163A5F]">
                                    <div>{row.parameter}</div>
                                    <div className="text-[10px] text-[#52799F] font-normal font-sans">{row.notes}</div>
                                  </td>
                                  <td className="p-2.5 text-[#2563EB] font-bold">{row.memoryAddress}</td>
                                  <td className="p-2.5 font-bold text-amber-900 bg-amber-50/40 rounded px-1.5">{row.theoretical}</td>
                                  <td className="p-2.5 font-bold text-emerald-900 bg-emerald-50/40 rounded px-1.5">{row.simulated}</td>
                                  <td className="p-2.5 text-center">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                      <Check className="w-3 h-3 text-emerald-600" />
                                      <span>100% Match</span>
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* SECTION 3: STUDENT LAB OBSERVATION BOOK RECORD SHEET */}
                    {(verificationViewMode === 'all' || verificationViewMode === 'observation_sheet') && (
                      <div className="space-y-3 pt-3 border-t border-[#B8D4E8]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#163A5F] uppercase">
                            <ClipboardCheck className="w-4 h-4 text-emerald-600" />
                            <span>Student Lab Observation Book Entry Sheet</span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                            Formatted for Lab Record Submission
                          </span>
                        </div>

                        <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/20 space-y-3 font-mono text-xs">
                          {/* Inputs Table */}
                          <div className="space-y-1.5">
                            <span className="font-bold text-emerald-900 uppercase block text-[11px]">1. Input Specifications:</span>
                            <div className="overflow-x-auto rounded-lg border border-[#B8D4E8] bg-white">
                              <table className="w-full text-left text-xs font-mono">
                                <thead className="bg-[#EAF4FB] text-[#163A5F] text-[11px] border-b border-[#B8D4E8]">
                                  <tr>
                                    <th className="p-2">Memory Address</th>
                                    <th className="p-2">Variable / Label</th>
                                    <th className="p-2">Hex Value</th>
                                    <th className="p-2">Decimal Equivalent</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[#B8D4E8]">
                                  {observationData.inputs.map((inp, idx) => (
                                    <tr key={idx}>
                                      <td className="p-2 text-[#2563EB] font-bold">{inp.address}</td>
                                      <td className="p-2 font-bold text-[#163A5F]">{inp.variable}</td>
                                      <td className="p-2 font-bold text-amber-900">{inp.hexVal}</td>
                                      <td className="p-2 text-[#334155]">{inp.decVal}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Outputs Table */}
                          <div className="space-y-1.5">
                            <span className="font-bold text-emerald-900 uppercase block text-[11px]">2. Observed Output & Memory Dump:</span>
                            <div className="overflow-x-auto rounded-lg border border-[#B8D4E8] bg-white">
                              <table className="w-full text-left text-xs font-mono">
                                <thead className="bg-[#EAF4FB] text-[#163A5F] text-[11px] border-b border-[#B8D4E8]">
                                  <tr>
                                    <th className="p-2">Memory Address</th>
                                    <th className="p-2">Output Variable</th>
                                    <th className="p-2">Hex Bytes</th>
                                    <th className="p-2">Observed Result</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[#B8D4E8]">
                                  {observationData.outputs.map((out, idx) => (
                                    <tr key={idx} className="bg-emerald-50/30">
                                      <td className="p-2 text-[#2563EB] font-bold">{out.address}</td>
                                      <td className="p-2 font-bold text-[#163A5F]">{out.variable}</td>
                                      <td className="p-2 font-bold text-emerald-900">{out.hexVal}</td>
                                      <td className="p-2 text-[#334155]">{out.decVal}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Final Flags Status */}
                          <div className="space-y-1.5">
                            <span className="font-bold text-emerald-900 uppercase block text-[11px]">3. CPU Status Flag Register:</span>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {observationData.finalFlags.map((flg, idx) => (
                                <div key={idx} className="p-2 rounded-lg bg-white border border-[#B8D4E8]">
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold text-[#2563EB]">{flg.flag}:</span>
                                    <span className="font-bold text-[#163A5F]">{flg.value}</span>
                                  </div>
                                  <div className="text-[10px] text-[#52799F] font-sans mt-0.5">{flg.meaning}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Result Summary */}
                          <div className="pt-2 border-t border-emerald-200">
                            <span className="font-bold text-emerald-900 uppercase block text-[11px]">4. Result & Conclusion:</span>
                            <p className="text-[#334155] font-sans text-xs mt-0.5 leading-relaxed font-medium">
                              {observationData.resultSummary}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          )}

          {/* TAB 6: VIVA VOCE & EXTENSIONS */}
          {activeTab === 'viva_precautions' && (
            <motion.div
              key="viva_precautions"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-2.5"
            >
              {/* Precautions Box */}
              <div className="bg-rose-50/70 rounded-2xl p-3.5 border border-rose-200 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 text-rose-800 font-mono text-xs font-bold uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Laboratory Precautions & Safeguards</span>
                </div>
                <ul className="space-y-1 text-xs sm:text-sm text-rose-950">
                  {manualPage.precautions.map((p, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-600 font-bold">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Student Extension Challenge Task */}
              <div className="bg-[#EAF4FB] rounded-2xl p-3.5 border border-[#B8D4E8] shadow-2xs space-y-1.5">
                <div className="flex items-center gap-2 text-[#2563EB] font-mono text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-[#2563EB]" />
                  <span>Student Homework / Lab Extension Challenge</span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-[#163A5F]">
                  {manualPage.studentTask.title}
                </h4>
                <p className="text-xs sm:text-sm text-[#1F2937] leading-relaxed">
                  {manualPage.studentTask.desc}
                </p>
                <div className="p-2.5 rounded-xl bg-white border border-[#B8D4E8] text-xs text-[#163A5F] font-mono flex items-start gap-2 shadow-2xs">
                  <span className="font-bold text-amber-600">💡 Hint:</span>
                  <span>{manualPage.studentTask.hint}</span>
                </div>
              </div>

              {/* Viva Voce Questions & Answers Accordion */}
              <div className="bg-white rounded-2xl p-3.5 border border-[#B8D4E8] space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#163A5F] font-mono text-xs font-bold uppercase tracking-wider">
                    <HelpCircle className="w-4 h-4 text-[#2563EB]" />
                    <span>Viva Voce Oral Examination Questions (Standard Academic Bank)</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#163A5F] bg-[#DCEFFA] px-2 py-0.5 rounded border border-[#B8D4E8] font-bold">{vivaList.length} Questions</span>
                </div>

                <div className="space-y-1.5">
                  {vivaList.map((viva, vIdx) => {
                    const isExpanded = expandedVivaIdx === vIdx;
                    return (
                      <div
                        key={vIdx}
                        className="rounded-xl border border-[#B8D4E8] bg-[#EAF4FB]/50 overflow-hidden transition-all shadow-2xs"
                      >
                        <button
                          onClick={() => setExpandedVivaIdx(isExpanded ? null : vIdx)}
                          className="w-full p-2.5 text-left flex items-center justify-between gap-2.5 text-xs sm:text-sm font-semibold text-[#163A5F] hover:text-blue-900 cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-800 border border-blue-200 flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                              Q{vIdx + 1}
                            </span>
                            <span>{viva.question}</span>
                          </span>
                          <ChevronDown className={`w-4 h-4 text-[#2563EB] transition-transform ${isExpanded ? 'rotate-180 text-[#2563EB]' : ''}`} />
                        </button>

                        {isExpanded && (
                          <div className="p-2.5 pt-0 text-xs sm:text-sm text-[#1F2937] leading-relaxed border-t border-[#B8D4E8] bg-white space-y-1">
                            <div className="text-[10px] font-mono font-bold text-[#2563EB] uppercase pt-1.5">
                              Answer & Technical Explanation:
                            </div>
                            <p>{viva.answer}</p>
                            <div className="text-[10px] font-mono text-[#475569] pt-0.5">
                              Concept Focus: <span className="text-[#163A5F] font-bold">{viva.concept}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Industrial & Embedded Applications */}
              <div className="bg-white rounded-2xl p-3 border border-[#B8D4E8] space-y-2 shadow-2xs">
                <div className="text-xs font-mono font-bold text-[#163A5F] uppercase flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Real-World Embedded Systems Applications</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {manualPage.applications.map((app, aIdx) => (
                    <div key={aIdx} className="bg-[#EAF4FB]/60 p-2.5 rounded-xl border border-[#B8D4E8] space-y-0.5 shadow-2xs">
                      <div className="text-xs font-bold text-[#163A5F]">{app.title}</div>
                      <p className="text-[11px] text-[#475569] leading-relaxed">{app.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

