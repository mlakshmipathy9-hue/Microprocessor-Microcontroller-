import React, { useState } from 'react';
import {
  Play,
  Cpu,
  CheckCircle2,
  Layers,
  Search,
  BookOpen,
  Zap,
  Code2,
  GitBranch,
  Filter,
  Sparkles,
  ArrowRight,
  Database
} from 'lucide-react';

export interface MCU8051Instruction {
  opcode: string;
  category: 'data' | 'arith' | 'logic' | 'bit' | 'branch';
  categoryLabel: string;
  bytes: number;
  cycles: number;
  mode: string;
  flagsAffected: string;
  syntax: string;
  description: string;
  example: string;
  hardwareAction: string;
  initialState: Record<string, string>;
  finalState: Record<string, string>;
}

export const mcu8051InstructionsList: MCU8051Instruction[] = [
  // 1. Data Transfer Instructions
  {
    opcode: 'MOV A, #data',
    category: 'data',
    categoryLabel: 'Data Transfer',
    bytes: 2,
    cycles: 1,
    mode: 'Immediate',
    flagsAffected: 'None',
    syntax: 'MOV A, #55H',
    description: 'Loads the immediate 8-bit constant value into Accumulator A.',
    example: 'MOV A, #55H ; A <- 55H',
    hardwareAction: 'Fetches immediate byte from code memory and latches directly into the Accumulator.',
    initialState: { A: '00H', '#data': '55H' },
    finalState: { A: '55H' }
  },
  {
    opcode: 'MOV A, Rn',
    category: 'data',
    categoryLabel: 'Data Transfer',
    bytes: 1,
    cycles: 1,
    mode: 'Register',
    flagsAffected: 'None',
    syntax: 'MOV A, R2',
    description: 'Copies the contents of working register Rn (R0–R7) from the active bank into Accumulator A.',
    example: 'MOV A, R2 ; A <- R2',
    hardwareAction: 'Reads working register in the current bank selected by PSW bits RS1:RS0 into Accumulator latch.',
    initialState: { A: '10H', R2: '4CH' },
    finalState: { A: '4CH', R2: '4CH' }
  },
  {
    opcode: 'MOV A, direct',
    category: 'data',
    categoryLabel: 'Data Transfer',
    bytes: 2,
    cycles: 1,
    mode: 'Direct',
    flagsAffected: 'None',
    syntax: 'MOV A, 30H',
    description: 'Reads the byte stored in internal RAM memory address 30H into Accumulator A.',
    example: 'MOV A, 30H ; A <- RAM[30H]',
    hardwareAction: 'Internal bus memory read at RAM address 30H transferred into Accumulator.',
    initialState: { A: '00H', 'RAM[30H]': '9AH' },
    finalState: { A: '9AH', 'RAM[30H]': '9AH' }
  },
  {
    opcode: 'MOV A, @Ri',
    category: 'data',
    categoryLabel: 'Data Transfer',
    bytes: 1,
    cycles: 1,
    mode: 'Register-Indirect',
    flagsAffected: 'None',
    syntax: 'MOV A, @R0',
    description: 'Copies the byte from internal RAM pointed to by register R0 into Accumulator A.',
    example: 'MOV A, @R0 ; A <- RAM[R0]',
    hardwareAction: 'R0 register outputs 8-bit address onto internal RAM bus; returned data loaded into A.',
    initialState: { R0: '35H', 'RAM[35H]': '0B4H', A: '00H' },
    finalState: { A: '0B4H', R0: '35H' }
  },
  {
    opcode: 'MOVX A, @DPTR',
    category: 'data',
    categoryLabel: 'Data Transfer',
    bytes: 1,
    cycles: 2,
    mode: 'Register-Indirect',
    flagsAffected: 'None',
    syntax: 'MOVX A, @DPTR',
    description: 'Reads an 8-bit byte from External Data RAM (XDATA) address pointed to by 16-bit DPTR into Accumulator A.',
    example: 'MOVX A, @DPTR ; A <- XDATA[DPTR]',
    hardwareAction: 'Generates external memory read strobe (RD = 0) with Port 0 (AD0–AD7) & Port 2 (A8–A15).',
    initialState: { DPTR: '2000H', 'XDATA[2000H]': '82H', A: '00H' },
    finalState: { A: '82H', DPTR: '2000H' }
  },
  {
    opcode: 'MOVC A, @A+DPTR',
    category: 'data',
    categoryLabel: 'Data Transfer',
    bytes: 1,
    cycles: 2,
    mode: 'Indexed',
    flagsAffected: 'None',
    syntax: 'MOVC A, @A+DPTR',
    description: 'Reads constant byte from Program ROM at address (DPTR + A) into Accumulator A.',
    example: 'MOVC A, @A+DPTR ; Table lookup in ROM',
    hardwareAction: 'Adds 16-bit DPTR and 8-bit A; fetches code byte via PSEN strobe into Accumulator.',
    initialState: { DPTR: '0300H', A: '04H', 'ROM[0304H]': '77H' },
    finalState: { A: '77H', DPTR: '0300H' }
  },
  {
    opcode: 'PUSH direct',
    category: 'data',
    categoryLabel: 'Data Transfer',
    bytes: 2,
    cycles: 2,
    mode: 'Direct',
    flagsAffected: 'None',
    syntax: 'PUSH 0E0H',
    description: 'Increments Stack Pointer (SP) by 1 and writes the direct byte (here Accumulator) onto stack RAM.',
    example: 'PUSH 0E0H ; Push ACC to stack',
    hardwareAction: 'SP <- SP + 1; writes direct byte to internal RAM at new SP location.',
    initialState: { SP: '07H', ACC: '35H', 'RAM[08H]': '00H' },
    finalState: { SP: '08H', 'RAM[08H]': '35H', ACC: '35H' }
  },
  {
    opcode: 'POP direct',
    category: 'data',
    categoryLabel: 'Data Transfer',
    bytes: 2,
    cycles: 2,
    mode: 'Direct',
    flagsAffected: 'None',
    syntax: 'POP 0E0H',
    description: 'Pops top of stack into direct address (Accumulator) and decrements Stack Pointer (SP) by 1.',
    example: 'POP 0E0H ; Pop stack into ACC',
    hardwareAction: 'Reads internal RAM at SP; writes into direct destination address; SP <- SP - 1.',
    initialState: { SP: '08H', 'RAM[08H]': '35H', ACC: '00H' },
    finalState: { ACC: '35H', SP: '07H' }
  },

  // 2. Arithmetic Instructions
  {
    opcode: 'ADD A, #data',
    category: 'arith',
    categoryLabel: 'Arithmetic',
    bytes: 2,
    cycles: 1,
    mode: 'Immediate',
    flagsAffected: 'CY, AC, OV, P',
    syntax: 'ADD A, #25H',
    description: 'Adds an immediate 8-bit constant value to Accumulator A and updates status flags.',
    example: 'ADD A, #25H ; A <- A + 25H',
    hardwareAction: 'ALU performs addition between Accumulator and immediate byte; status flags generated.',
    initialState: { A: '15H', '#data': '25H', CY: '0' },
    finalState: { A: '3AH', CY: '0', P: '1 (Odd)' }
  },
  {
    opcode: 'ADDC A, Rn',
    category: 'arith',
    categoryLabel: 'Arithmetic',
    bytes: 1,
    cycles: 1,
    mode: 'Register',
    flagsAffected: 'CY, AC, OV, P',
    syntax: 'ADDC A, R3',
    description: 'Adds register Rn and the Carry Flag (CY) to the Accumulator.',
    example: 'ADDC A, R3 ; A <- A + R3 + CY',
    hardwareAction: 'ALU sums Accumulator, operand, and Carry input; stores result in A.',
    initialState: { A: '40H', R3: '20H', CY: '1' },
    finalState: { A: '61H', CY: '0', P: '0' }
  },
  {
    opcode: 'SUBB A, direct',
    category: 'arith',
    categoryLabel: 'Arithmetic',
    bytes: 2,
    cycles: 1,
    mode: 'Direct',
    flagsAffected: 'CY, AC, OV, P',
    syntax: 'SUBB A, 30H',
    description: 'Subtracts direct byte and Borrow (CY flag) from the Accumulator.',
    example: 'SUBB A, 30H ; A <- A - RAM[30H] - CY',
    hardwareAction: 'ALU performs subtraction using 2s complement arithmetic; updates CY if borrow required.',
    initialState: { A: '50H', 'RAM[30H]': '10H', CY: '0' },
    finalState: { A: '40H', CY: '0', P: '0' }
  },
  {
    opcode: 'INC A',
    category: 'arith',
    categoryLabel: 'Arithmetic',
    bytes: 1,
    cycles: 1,
    mode: 'Register',
    flagsAffected: 'None (Preserves CY!)',
    syntax: 'INC A',
    description: 'Increments Accumulator A by 1 without altering the Carry Flag (CY).',
    example: 'INC A ; A <- A + 1',
    hardwareAction: 'ALU increments value in A. Preserves Carry flag so loops do not destroy arithmetic carries.',
    initialState: { A: '0FFH', CY: '0' },
    finalState: { A: '00H', CY: '0' }
  },
  {
    opcode: 'DEC Rn',
    category: 'arith',
    categoryLabel: 'Arithmetic',
    bytes: 1,
    cycles: 1,
    mode: 'Register',
    flagsAffected: 'None',
    syntax: 'DEC R0',
    description: 'Decrements working register Rn by 1 without altering the Carry Flag.',
    example: 'DEC R0 ; R0 <- R0 - 1',
    hardwareAction: 'Decrements working register in active bank.',
    initialState: { R0: '05H' },
    finalState: { R0: '04H' }
  },
  {
    opcode: 'MUL AB',
    category: 'arith',
    categoryLabel: 'Arithmetic',
    bytes: 1,
    cycles: 4,
    mode: 'Register',
    flagsAffected: 'CY=0, OV (if > 255)',
    syntax: 'MUL AB',
    description: 'Multiplies 8-bit unsigned Accumulator A by B; 16-bit result stored as High byte in B, Low byte in A.',
    example: 'MUL AB ; B:A <- A * B',
    hardwareAction: 'Dedicated hardware multiplier computes 8x8 unsigned product in 4 machine cycles.',
    initialState: { A: '10H (16)', B: '20H (32)' },
    finalState: { A: '00H', B: '02H (Product = 0200H = 512)', OV: '1' }
  },
  {
    opcode: 'DIV AB',
    category: 'arith',
    categoryLabel: 'Arithmetic',
    bytes: 1,
    cycles: 4,
    mode: 'Register',
    flagsAffected: 'CY=0, OV (if B=0)',
    syntax: 'DIV AB',
    description: 'Divides unsigned Accumulator A by B. Quotient stored in A; Remainder stored in B.',
    example: 'DIV AB ; A <- A/B, B <- Remainder',
    hardwareAction: 'Hardware divider performs unsigned integer division; sets OV flag if divide by zero (B=0).',
    initialState: { A: '19H (25)', B: '04H (4)' },
    finalState: { A: '06H (Quotient = 6)', B: '01H (Remainder = 1)', OV: '0' }
  },
  {
    opcode: 'DA A',
    category: 'arith',
    categoryLabel: 'Arithmetic',
    bytes: 1,
    cycles: 1,
    mode: 'Register',
    flagsAffected: 'CY',
    syntax: 'DA A',
    description: 'Decimal Adjust Accumulator converts binary sum into Packed BCD format after ADD/ADDC.',
    example: 'DA A ; Decimal adjust for BCD',
    hardwareAction: 'Adds 06H if lower nibble > 9 or AC=1; adds 60H if upper nibble > 9 or CY=1.',
    initialState: { A: '2BH', AC: '0', CY: '0' },
    finalState: { A: '31H (Packed BCD 31)', CY: '0' }
  },

  // 3. Logical Instructions
  {
    opcode: 'ANL A, #data',
    category: 'logic',
    categoryLabel: 'Logical',
    bytes: 2,
    cycles: 1,
    mode: 'Immediate',
    flagsAffected: 'P',
    syntax: 'ANL A, #0FH',
    description: 'Bitwise Logical AND between Accumulator and immediate mask. Clears bits where mask is 0.',
    example: 'ANL A, #0FH ; Mask lower nibble',
    hardwareAction: 'ALU performs bit-by-bit AND logic; updates Parity flag P in PSW.',
    initialState: { A: '7AH (0111 1010b)', '#data': '0FH' },
    finalState: { A: '0AH (0000 1010b)', P: '0' }
  },
  {
    opcode: 'ORL A, Rn',
    category: 'logic',
    categoryLabel: 'Logical',
    bytes: 1,
    cycles: 1,
    mode: 'Register',
    flagsAffected: 'P',
    syntax: 'ORL A, R1',
    description: 'Bitwise Logical OR between Accumulator and register operand.',
    example: 'ORL A, R1 ; Set bits',
    hardwareAction: 'ALU computes bitwise OR operation; stores in A.',
    initialState: { A: '30H (0011 0000b)', R1: '05H (0000 0101b)' },
    finalState: { A: '35H (0011 0101b)', P: '1' }
  },
  {
    opcode: 'XRL A, #data',
    category: 'logic',
    categoryLabel: 'Logical',
    bytes: 2,
    cycles: 1,
    mode: 'Immediate',
    flagsAffected: 'P',
    syntax: 'XRL A, #0FFH',
    description: 'Bitwise Exclusive-OR (XOR) with FFH inverts every bit of Accumulator (1s complement).',
    example: 'XRL A, #0FFH ; Invert A',
    hardwareAction: 'Bitwise XOR logic applied across all 8 bits.',
    initialState: { A: '0AAH (1010 1010b)' },
    finalState: { A: '55H (0101 0101b)', P: '0' }
  },
  {
    opcode: 'CLR A',
    category: 'logic',
    categoryLabel: 'Logical',
    bytes: 1,
    cycles: 1,
    mode: 'Register',
    flagsAffected: 'P=0',
    syntax: 'CLR A',
    description: 'Clears all 8 bits of the Accumulator to 00H.',
    example: 'CLR A ; A <- 00H',
    hardwareAction: 'Directly resets all Accumulator latches to 0.',
    initialState: { A: '0C3H' },
    finalState: { A: '00H', P: '0' }
  },
  {
    opcode: 'CPL A',
    category: 'logic',
    categoryLabel: 'Logical',
    bytes: 1,
    cycles: 1,
    mode: 'Register',
    flagsAffected: 'P',
    syntax: 'CPL A',
    description: 'Complements (inverts) each bit in Accumulator (1 becomes 0, 0 becomes 1).',
    example: 'CPL A ; 1s complement of A',
    hardwareAction: 'Inverts each Accumulator latch.',
    initialState: { A: '0F0H' },
    finalState: { A: '0FH', P: '0' }
  },
  {
    opcode: 'RL A',
    category: 'logic',
    categoryLabel: 'Logical',
    bytes: 1,
    cycles: 1,
    mode: 'Register',
    flagsAffected: 'None',
    syntax: 'RL A',
    description: 'Rotates all bits in Accumulator Left by 1 position. Bit 7 wraps around into Bit 0.',
    example: 'RL A ; Rotate Left',
    hardwareAction: 'Bit 7 wraps directly into Bit 0; bits 0–6 shift left by 1 position.',
    initialState: { A: '81H (1000 0001b)' },
    finalState: { A: '03H (0000 0011b)' }
  },
  {
    opcode: 'RLC A',
    category: 'logic',
    categoryLabel: 'Logical',
    bytes: 1,
    cycles: 1,
    mode: 'Register',
    flagsAffected: 'CY',
    syntax: 'RLC A',
    description: 'Rotates Accumulator and Carry Flag Left as a 9-bit ring. Bit 7 goes to CY; old CY goes to Bit 0.',
    example: 'RLC A ; 9-bit Rotate Left through Carry',
    hardwareAction: 'Bit 7 is shifted into Carry Flag CY; previous CY rotates into Bit 0.',
    initialState: { A: '80H (1000 0000b)', CY: '0' },
    finalState: { A: '00H', CY: '1' }
  },
  {
    opcode: 'SWAP A',
    category: 'logic',
    categoryLabel: 'Logical',
    bytes: 1,
    cycles: 1,
    mode: 'Register',
    flagsAffected: 'None',
    syntax: 'SWAP A',
    description: 'Swaps higher 4 bits (nibble D7–D4) with lower 4 bits (nibble D3–D0) of Accumulator.',
    example: 'SWAP A ; Swap nibbles',
    hardwareAction: 'Upper nibble and lower nibble swap internal wiring paths.',
    initialState: { A: '3FH' },
    finalState: { A: '0F3H' }
  },

  // 4. Bit / Boolean Instructions
  {
    opcode: 'SETB bit',
    category: 'bit',
    categoryLabel: 'Boolean Processor',
    bytes: 2,
    cycles: 1,
    mode: 'Bit-Addressable',
    flagsAffected: 'CY (if bit is C)',
    syntax: 'SETB P1.0',
    description: 'Sets the specified bit-addressable location (in Bit-RAM 20H–2FH or SFRs) to logic 1 (+5V).',
    example: 'SETB P1.0 ; Turn ON LED at P1.0',
    hardwareAction: 'Direct bit latch addressed and driven to logic 1 without affecting adjacent pins.',
    initialState: { 'P1.0 Pin': '0 (LOW / 0V)' },
    finalState: { 'P1.0 Pin': '1 (HIGH / 5V)' }
  },
  {
    opcode: 'CLR bit',
    category: 'bit',
    categoryLabel: 'Boolean Processor',
    bytes: 2,
    cycles: 1,
    mode: 'Bit-Addressable',
    flagsAffected: 'CY (if bit is C)',
    syntax: 'CLR C',
    description: 'Clears the specified addressable bit to logic 0 (0V).',
    example: 'CLR C ; Clear Carry Flag',
    hardwareAction: 'Carry bit latch in PSW register reset to 0.',
    initialState: { 'CY Flag': '1' },
    finalState: { 'CY Flag': '0' }
  },
  {
    opcode: 'CPL bit',
    category: 'bit',
    categoryLabel: 'Boolean Processor',
    bytes: 2,
    cycles: 1,
    mode: 'Bit-Addressable',
    flagsAffected: 'CY (if bit is C)',
    syntax: 'CPL P1.2',
    description: 'Complements (toggles) the logical state of the specified bit.',
    example: 'CPL P1.2 ; Toggle Pin 1.2',
    hardwareAction: 'Inverts current state of target bit latch.',
    initialState: { 'P1.2 Pin': '1' },
    finalState: { 'P1.2 Pin': '0' }
  },
  {
    opcode: 'MOV C, bit',
    category: 'bit',
    categoryLabel: 'Boolean Processor',
    bytes: 2,
    cycles: 1,
    mode: 'Bit-Addressable',
    flagsAffected: 'CY',
    syntax: 'MOV C, P3.2',
    description: 'Copies the current digital logic level of pin P3.2 into the Carry Flag (CY acts as a 1-bit accumulator).',
    example: 'MOV C, P3.2 ; Sample external input',
    hardwareAction: 'Reads bit line P3.2 and stores logic state directly into PSW Carry bit latch.',
    initialState: { 'P3.2 (INT0 pin)': '0', CY: '1' },
    finalState: { CY: '0', 'P3.2': '0' }
  },
  {
    opcode: 'ANL C, bit',
    category: 'bit',
    categoryLabel: 'Boolean Processor',
    bytes: 2,
    cycles: 2,
    mode: 'Bit-Addressable',
    flagsAffected: 'CY',
    syntax: 'ANL C, 20H.1',
    description: 'Single-bit logical AND between Carry Flag and bit addressable RAM location 20H.1.',
    example: 'ANL C, 20H.1 ; Boolean AND',
    hardwareAction: 'Single-bit ALU engine performs boolean AND on Carry bit with target bit.',
    initialState: { CY: '1', 'Bit 20H.1': '0' },
    finalState: { CY: '0' }
  },

  // 5. Program Branching Instructions
  {
    opcode: 'SJMP rel',
    category: 'branch',
    categoryLabel: 'Program Branch',
    bytes: 2,
    cycles: 2,
    mode: 'Relative Branch',
    flagsAffected: 'None',
    syntax: 'SJMP LABEL',
    description: 'Short unconditional jump to an address within -128 to +127 bytes relative to the next instruction PC.',
    example: 'SJMP LOOP ; Relative jump',
    hardwareAction: 'PC <- PC + 2 + signed 8-bit relative offset embedded in instruction byte 2.',
    initialState: { PC: '0020H', 'Relative Offset': '+06H' },
    finalState: { PC: '0028H' }
  },
  {
    opcode: 'LJMP addr16',
    category: 'branch',
    categoryLabel: 'Program Branch',
    bytes: 3,
    cycles: 2,
    mode: '16-bit Direct',
    flagsAffected: 'None',
    syntax: 'LJMP 2000H',
    description: 'Long unconditional jump to any 16-bit address anywhere in the full 64 KB Code Memory space.',
    example: 'LJMP 2000H ; Long jump',
    hardwareAction: 'PC loaded with 16-bit destination address: PCH <- byte 2, PCL <- byte 3.',
    initialState: { PC: '0050H' },
    finalState: { PC: '2000H' }
  },
  {
    opcode: 'JZ rel / JNZ rel',
    category: 'branch',
    categoryLabel: 'Program Branch',
    bytes: 2,
    cycles: 2,
    mode: 'Relative Branch',
    flagsAffected: 'None',
    syntax: 'JZ ZERO_LABEL',
    description: 'Jumps to relative target if Accumulator A is zero (00H). Does NOT rely on a Zero Flag bit; directly inspects A.',
    example: 'JZ ZERO_LABEL ; Jump if A == 0',
    hardwareAction: 'Zero-detector logic checks Accumulator contents. If A == 0, adds relative offset to PC.',
    initialState: { A: '00H', PC: '0100H' },
    finalState: { PC: '0112H (Branched)' }
  },
  {
    opcode: 'CJNE dest, src, rel',
    category: 'branch',
    categoryLabel: 'Program Branch',
    bytes: 3,
    cycles: 2,
    mode: 'Immediate/Register Compare',
    flagsAffected: 'CY (sets if dest < src)',
    syntax: 'CJNE R0, #0AH, AGAIN',
    description: 'Compares destination and source operands. Jumps if NOT equal. Sets Carry Flag if Destination < Source.',
    example: 'CJNE R0, #0AH, AGAIN ; Compare & Jump',
    hardwareAction: 'ALU subtracts source from destination. If result != 0, branches; if destination < source, sets CY.',
    initialState: { R0: '05H', '#data': '0AH', CY: '0', PC: '0200H' },
    finalState: { PC: '0220H (Branched)', CY: '1 (5 < 10)' }
  },
  {
    opcode: 'DJNZ reg, rel',
    category: 'branch',
    categoryLabel: 'Program Branch',
    bytes: 2,
    cycles: 2,
    mode: 'Register Decrement',
    flagsAffected: 'None',
    syntax: 'DJNZ R2, LOOP',
    description: 'Decrements register/RAM byte by 1 and jumps if result is NOT zero. Foundation of 8051 delay loops!',
    example: 'DJNZ R2, LOOP ; Decrement & jump if != 0',
    hardwareAction: 'R2 <- R2 - 1. If R2 != 0, branches to relative address; if R2 == 0, falls through to next instruction.',
    initialState: { R2: '03H', PC: '0030H' },
    finalState: { R2: '02H', PC: '0020H (Looped)' }
  },
  {
    opcode: 'LCALL addr16',
    category: 'branch',
    categoryLabel: 'Program Branch',
    bytes: 3,
    cycles: 2,
    mode: '16-bit Direct Call',
    flagsAffected: 'None',
    syntax: 'LCALL DELAY',
    description: 'Calls subroutine anywhere in 64 KB ROM. Pushes return address PC onto stack (Low byte first, then High byte).',
    example: 'LCALL 0400H ; Long call',
    hardwareAction: 'Pushes return PC (PC+3) onto stack (SP <- SP + 2); loads PC with 16-bit target address.',
    initialState: { PC: '0100H', SP: '07H' },
    finalState: { PC: '0400H', SP: '09H', 'Stack Pushed': '0103H' }
  },
  {
    opcode: 'RET / RETI',
    category: 'branch',
    categoryLabel: 'Program Branch',
    bytes: 1,
    cycles: 2,
    mode: 'Stack Return',
    flagsAffected: 'None (RETI clears interrupt priority flip-flop)',
    syntax: 'RET',
    description: 'Returns from subroutine by popping the 16-bit return address from stack RAM into Program Counter (PC).',
    example: 'RET ; Return to caller',
    hardwareAction: 'Pops high byte and low byte from stack into PC (SP <- SP - 2); execution resumes.',
    initialState: { SP: '09H', 'Stack Top': '0103H' },
    finalState: { PC: '0103H', SP: '07H' }
  }
];

export default function MCU8051InstructionDecoderSimulator() {
  const [activeMainTab, setActiveMainTab] = useState<'groups' | 'lab' | 'comparison' | 'remember'>('groups');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'data' | 'arith' | 'logic' | 'bit' | 'branch'>('all');
  const [selectedInstructionIdx, setSelectedInstructionIdx] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [simStep, setSimStep] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const filteredInstructions = mcu8051InstructionsList.filter((inst) => {
    if (selectedCategory !== 'all' && inst.category !== selectedCategory) return false;
    if (searchQuery.trim() === '') return true;
    return (
      inst.opcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.syntax.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.mode.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const activeInstruction = filteredInstructions[selectedInstructionIdx] || filteredInstructions[0] || mcu8051InstructionsList[0];

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
    }, 550);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Main Tab Switcher (Matching 8086 InstructionDecoder style) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold font-mono text-indigo-600 uppercase tracking-widest block">
                Instruction Set Architecture
              </span>
              <h2 className="text-base font-bold text-slate-900 font-display">
                8051 Instruction Set Groups &amp; Decoder Laboratory
              </h2>
            </div>
          </div>

          {/* Main Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveMainTab('groups')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMainTab === 'groups'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              Instruction Groups
            </button>
            <button
              onClick={() => setActiveMainTab('lab')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMainTab === 'lab'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              Execution Lab
            </button>
            <button
              onClick={() => setActiveMainTab('comparison')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMainTab === 'comparison'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              Quick Comparison
            </button>
            <button
              onClick={() => setActiveMainTab('remember')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMainTab === 'remember'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Remember 🧠
            </button>
          </div>
        </div>

        {/* Category Filter and Search Toolbar */}
        {(activeMainTab === 'groups' || activeMainTab === 'lab') && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'All 5 Groups' },
                { id: 'data', label: '1. Data Transfer' },
                { id: 'arith', label: '2. Arithmetic' },
                { id: 'logic', label: '3. Logical' },
                { id: 'bit', label: '4. Boolean Bit' },
                { id: 'branch', label: '5. Program Branch' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id as any);
                    setSelectedInstructionIdx(0);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-xs font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search instructions..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedInstructionIdx(0);
                }}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 w-48"
              />
            </div>
          </div>
        )}
      </div>

      {/* TAB 1: INSTRUCTION GROUPS BREAKDOWN */}
      {activeMainTab === 'groups' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Interactive Instruction Selector */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 tracking-wider">
                Select Instruction ({filteredInstructions.length} Opcodes)
              </span>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Category: {selectedCategory.toUpperCase()}
              </span>
            </div>

            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredInstructions.map((inst, idx) => {
                const isSel = selectedInstructionIdx === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedInstructionIdx(idx);
                      setSimStep(0);
                    }}
                    className={`w-full p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isSel
                        ? 'bg-indigo-600 border-indigo-700 text-white shadow-xs font-bold ring-2 ring-indigo-200'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-indigo-50/40 hover:border-indigo-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold">{inst.opcode}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${isSel ? 'bg-indigo-700 text-indigo-100' : 'bg-white text-slate-600 border border-slate-200'}`}>
                        {inst.mode}
                      </span>
                    </div>
                    <p className={`text-[11px] mt-1 line-clamp-1 ${isSel ? 'text-indigo-100' : 'text-slate-500'}`}>
                      {inst.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Architectural Inspector & Flag Matrix */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 tracking-wider">
                    Instruction Details: {activeInstruction.categoryLabel}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                    {activeInstruction.syntax}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <span className="px-2 py-1 bg-slate-100 rounded border border-slate-200 font-bold text-slate-800">
                    {activeInstruction.bytes} Byte{activeInstruction.bytes > 1 ? 's' : ''}
                  </span>
                  <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded border border-indigo-200 font-bold">
                    {activeInstruction.cycles} Cycle{activeInstruction.cycles > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                {activeInstruction.description}
              </p>

              {/* Status Flags Impact */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">
                  Status &amp; Control Flags Affected (PSW):
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    {activeInstruction.flagsAffected}
                  </span>
                  <span className="text-xs text-slate-500">
                    {activeInstruction.flagsAffected === 'None'
                      ? 'No status flags in the Program Status Word are altered.'
                      : 'PSW condition code flags dynamically updated upon execution.'}
                  </span>
                </div>
              </div>

              {/* Assembly Example Box */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">
                  Assembly Usage &amp; Syntax:
                </span>
                <pre className="bg-slate-900 text-emerald-300 p-3.5 rounded-xl font-mono text-xs border border-slate-800 leading-normal">
                  {activeInstruction.example}
                </pre>
              </div>

              {/* Hardware Execution Engine Trace */}
              <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-200 text-xs text-slate-800 space-y-1 font-mono">
                <span className="text-[10px] uppercase font-bold text-indigo-700 font-sans block">
                  Internal Bus &amp; ALU Mechanics:
                </span>
                <p className="leading-relaxed">
                  {activeInstruction.hardwareAction}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE HARDWARE EXECUTION LABORATORY */}
      {activeMainTab === 'lab' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 tracking-wider">
                  Hardware Step-Trace Laboratory
                </span>
                <h3 className="text-base font-bold text-slate-900 font-mono">
                  {activeInstruction.syntax}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunSimulation}
                  disabled={isSimulating}
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5" />
                  {isSimulating ? 'Executing...' : 'Run Hardware Trace'}
                </button>
              </div>
            </div>

            {/* Instruction Decoder Pipeline Stage */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 font-mono text-xs">
              <div className={`p-3 rounded-xl border text-center transition-all ${
                simStep >= 0 ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <div className="text-[9px] uppercase font-sans text-slate-500">Stage 1</div>
                <div>Opcode Fetch</div>
              </div>
              <div className={`p-3 rounded-xl border text-center transition-all ${
                simStep >= 1 ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <div className="text-[9px] uppercase font-sans text-slate-500">Stage 2</div>
                <div>Operand Decode</div>
              </div>
              <div className={`p-3 rounded-xl border text-center transition-all ${
                simStep >= 2 ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <div className="text-[9px] uppercase font-sans text-slate-500">Stage 3</div>
                <div>ALU / Bus Exec</div>
              </div>
              <div className={`p-3 rounded-xl border text-center transition-all ${
                simStep >= 2 ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <div className="text-[9px] uppercase font-sans text-slate-500">Stage 4</div>
                <div>Writeback Done</div>
              </div>
            </div>

            {/* Registers and State Transition Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="text-[10px] uppercase font-bold text-slate-500 font-sans flex items-center justify-between">
                  <span>Pre-Execution Register File</span>
                  <span className="text-amber-600">Initial Values</span>
                </div>
                <div className="space-y-1.5">
                  {Object.entries(activeInstruction.initialState).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-slate-600">{key}:</span>
                      <span className="font-bold text-slate-900">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`p-4 rounded-2xl border space-y-2 transition-all ${
                simStep >= 2 ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-100' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="text-[10px] uppercase font-bold text-slate-500 font-sans flex items-center justify-between">
                  <span>Post-Execution Results</span>
                  <span className={simStep >= 2 ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                    {simStep >= 2 ? '✓ Executed Successfully' : 'Awaiting Execution'}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {Object.entries(activeInstruction.finalState).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-slate-600">{key}:</span>
                      <span className="font-bold text-emerald-700">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-200 font-mono text-xs text-indigo-950">
              <span className="font-bold text-indigo-700 block text-[10px] uppercase font-sans mb-1">
                Instruction Trace Detail:
              </span>
              {activeInstruction.hardwareAction}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: QUICK COMPARISON (Like 8086 Quick Comparison) */}
      {activeMainTab === 'comparison' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 tracking-wider">
              Architectural Concept Breakdown
            </span>
            <h3 className="text-base font-bold text-slate-900 font-display">
              8051 Instruction Elements Quick Comparison
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="font-bold text-indigo-700 font-mono block">Opcode (Operation Code)</span>
              <p className="text-slate-600">The specific binary command specifying <em>what operation</em> to perform (e.g. MOV, ADD, SUBB, ANL, CJNE).</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="font-bold text-indigo-700 font-mono block">Operand</span>
              <p className="text-slate-600">The data value or memory location operated upon (registers, immediate constants, RAM addresses, SFRs).</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="font-bold text-indigo-700 font-mono block">Addressing Mode</span>
              <p className="text-slate-600">The addressing method used by the CPU to find where the operand data is stored (Immediate, Register, Direct, Indirect, Indexed).</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="font-bold text-indigo-700 font-mono block">Machine Cycle Duration</span>
              <p className="text-slate-600">Most 8051 instructions take 1 or 2 machine cycles (12 or 24 oscillator clocks). MUL AB and DIV AB require 4 cycles.</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="font-bold text-indigo-700 font-mono block">Boolean 1-Bit Processor</span>
              <p className="text-slate-600">Single-bit logic commands operate directly on bits without disturbing whole bytes, with Carry (CY) as 1-bit accumulator.</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="font-bold text-indigo-700 font-mono block">Harvard Separation (MOVX / MOVC)</span>
              <p className="text-slate-600">MOV accesses internal RAM; MOVX accesses external data RAM; MOVC accesses program code ROM tables.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REMEMBER 🧠 (Like 8086 Remember Tab) */}
      {activeMainTab === 'remember' && (
        <div className="bg-amber-50/70 p-6 rounded-2xl border border-amber-200 text-slate-800 space-y-4">
          <div className="flex items-center gap-2 font-bold text-amber-950 font-display text-base border-b border-amber-200/80 pb-3">
            <Zap className="w-5 h-5 text-amber-600" />
            Core Architectural Insights: Remember 🧠
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-white/80 p-4 rounded-xl border border-amber-200 space-y-1.5">
              <span className="font-bold text-amber-900 block font-mono">1. Register-to-Register Moves are Illegal</span>
              <p className="text-slate-700">
                In 8051 assembly, <code>MOV R0, R1</code> is invalid machine syntax. Data transfers between working registers must always pass through the Accumulator: <code>MOV A, R1</code> followed by <code>MOV R0, A</code>.
              </p>
            </div>

            <div className="bg-white/80 p-4 rounded-xl border border-amber-200 space-y-1.5">
              <span className="font-bold text-amber-900 block font-mono">2. INC / DEC Preserve Carry Flag</span>
              <p className="text-slate-700">
                Unlike ADD/SUB, <code>INC</code> and <code>DEC</code> instructions do NOT alter the Carry Flag (CY). This critical feature allows programmers to use loop counters without corrupting multi-byte arithmetic carry chains.
              </p>
            </div>

            <div className="bg-white/80 p-4 rounded-xl border border-amber-200 space-y-1.5">
              <span className="font-bold text-amber-900 block font-mono">3. Immediate (#) vs Direct Addressing</span>
              <p className="text-slate-700">
                <code>MOV A, #30H</code> loads constant 30H into Accumulator. <code>MOV A, 30H</code> reads RAM memory cell 30H into Accumulator. Omitting <code>#</code> is the most common bug in 8051 programming!
              </p>
            </div>

            <div className="bg-white/80 p-4 rounded-xl border border-amber-200 space-y-1.5">
              <span className="font-bold text-amber-900 block font-mono">4. Only R0 &amp; R1 Act as Internal Pointers</span>
              <p className="text-slate-700">
                For internal scratchpad RAM indirect addressing, only <code>@R0</code> and <code>@R1</code> are valid. Registers R2–R7 cannot be used with <code>@</code> for RAM indirect pointers.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
