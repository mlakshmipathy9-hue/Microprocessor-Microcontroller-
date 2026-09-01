export interface ProgramInstructionTheory {
  mnemonic: string;
  syntax: string;
  role: string;
  flagsAffected: string;
  detail: string;
}

export interface ProgramStageTheory {
  stageNumber: number;
  stageName: string;
  summary: string;
  hardwareAction: string;
  codeSnippet: string;
}

export interface FlagBehaviorTheory {
  flag: string;
  fullName: string;
  roleInProgram: string;
  triggerCondition: string;
}

export interface ProgramTheoryData {
  overview: string;
  memoryAndSegmentation: string;
  logicStages: ProgramStageTheory[];
  instructionsTheory: ProgramInstructionTheory[];
  flagsTheory: FlagBehaviorTheory[];
  dataFlowSummary: string;
  bestPractices: string[];
}

export const labProgramTheoryData: Record<string, ProgramTheoryData> = {
  exp1: {
    overview:
      'The multi-precision arithmetic program performs 32-bit (multi-byte) addition and subtraction on the 8086 16-bit processor by decomposing 4-byte operands into sequential byte-sized operations while rippling carry and borrow bits across consecutive stages using ADC (Add with Carry) and SBB (Subtract with Borrow).',
    memoryAndSegmentation:
      'Operands NUM1 and NUM2 are allocated as 4-byte sequences in the Data Segment (.DATA). In accordance with the 8086 Little-Endian architecture, the Least Significant Byte (LSB) resides at the lowest offset (DS:0000H), while the Most Significant Byte (MSB) is placed at DS:0003H. DS is initialized via AX = @DATA to provide a base address for segment offset resolution.',
    logicStages: [
      {
        stageNumber: 1,
        stageName: 'Data Segment & Pointer Setup',
        summary: 'Initialize DS, base pointers (SI, DI, BX), and loop counter CX.',
        hardwareAction:
          'Loads the 16-bit base address of DATA_SEG into DS. Sets SI to point to NUM1, DI to NUM2, BX to RESULT_ADD, and loads loop counter CX = 4.',
        codeSnippet: 'MOV AX, @DATA\nMOV DS, AX\nLEA SI, NUM1\nLEA DI, NUM2\nLEA BX, RESULT_ADD\nMOV CX, 4'
      },
      {
        stageNumber: 2,
        stageName: 'Carry Flag Initialization',
        summary: 'Clear the Carry Flag (CF) to guarantee an initial carry-in of zero.',
        hardwareAction:
          'Executes CLC to reset the Carry Flag (CF = 0) in the Flag Register before entering the loop, preventing spurious carry-ins on the lowest byte addition.',
        codeSnippet: 'CLC'
      },
      {
        stageNumber: 3,
        stageName: 'Iterative Multi-Byte Addition with Carry Propagation',
        summary: 'Add corresponding bytes with carry (ADC) and write sum to memory.',
        hardwareAction:
          'AL receives [SI]. ADC AL, [DI] computes AL = AL + [DI] + CF. The result is stored at [BX]. SI, DI, and BX are incremented. Decrements CX; if CX > 0, branches back.',
        codeSnippet: 'ADD_LOOP:\n  MOV AL, [SI]\n  ADC AL, [DI]\n  MOV [BX], AL\n  INC SI\n  INC DI\n  INC BX\n  LOOP ADD_LOOP'
      },
      {
        stageNumber: 4,
        stageName: 'Capture Final Carry & Multi-Byte Subtraction',
        summary: 'Capture MSB carry into memory, reset pointers, and run SBB loop.',
        hardwareAction:
          'Captures the final CF using MOV AL, 0 followed by ADC AL, 0. Resets pointers to source offsets, clears CF, and uses SBB AL, [DI] to subtract bytes with borrow propagation.',
        codeSnippet: 'MOV AL, 0\nADC AL, 0\nMOV CARRY, AL\n; --- Subtraction ---\nCLC\nSUB_LOOP:\n  MOV AL, [SI]\n  SBB AL, [DI]\n  MOV [BX], AL\n  LOOP SUB_LOOP'
      },
      {
        stageNumber: 5,
        stageName: 'DOS Program Termination',
        summary: 'Return control to DOS/Host via INT 21H Service 4CH.',
        hardwareAction:
          'Loads AH = 4CH and invokes software interrupt INT 21H to cleanly release CPU execution context back to the operating system.',
        codeSnippet: 'MOV AH, 4CH\nINT 21H'
      }
    ],
    instructionsTheory: [
      {
        mnemonic: 'ADC',
        syntax: 'ADC destination, source',
        role: 'Adds destination, source, and current Carry Flag (CF), placing sum in destination.',
        flagsAffected: 'CF, OF, SF, ZF, AF, PF',
        detail:
          'Crucial for multi-precision addition: ripples the carry generated from lower byte additions into the subsequent higher byte position.'
      },
      {
        mnemonic: 'SBB',
        syntax: 'SBB destination, source',
        role: 'Subtracts (source + CF) from destination, storing difference in destination.',
        flagsAffected: 'CF, OF, SF, ZF, AF, PF',
        detail:
          'Performs subtraction with borrow propagation. In 8086, the Carry Flag serves dual duty as the Borrow Flag during subtraction.'
      },
      {
        mnemonic: 'CLC',
        syntax: 'CLC',
        role: 'Clears the Carry Flag (CF = 0).',
        flagsAffected: 'CF (cleared to 0)',
        detail:
          'Ensures the first iteration of ADC or SBB does not incorporate an accidental carry or borrow left by previous instructions.'
      },
      {
        mnemonic: 'LOOP',
        syntax: 'LOOP label',
        role: 'Decrements CX by 1. If CX != 0, jumps to target label; else falls through.',
        flagsAffected: 'None (preserves arithmetic flags including CF)',
        detail:
          'Hardware-optimized loop control. Crucially does not alter the Carry Flag (CF), ensuring carry ripples safely across loop iterations.'
      }
    ],
    flagsTheory: [
      {
        flag: 'CF',
        fullName: 'Carry Flag (Bit 0)',
        roleInProgram: 'Holds carry-out from MSB of each byte addition / borrow during subtraction.',
        triggerCondition: 'Set to 1 when byte sum exceeds 255 (0FFH) or subtraction requires a borrow.'
      },
      {
        flag: 'ZF',
        fullName: 'Zero Flag (Bit 6)',
        roleInProgram: 'Monitors whether individual byte result or final difference is 00H.',
        triggerCondition: 'Set to 1 when ALU operation yields a zero result.'
      },
      {
        flag: 'SF',
        fullName: 'Sign Flag (Bit 7)',
        roleInProgram: 'Reflects the sign (bit 7) of the resulting byte in AL.',
        triggerCondition: 'Set to 1 if bit 7 of the result is 1 (negative in 2s complement).'
      }
    ],
    dataFlowSummary:
      'NUM1 (4 bytes: FF FE FD FC) + NUM2 (4 bytes: 01 02 03 04) -> ADD_RESULT (00 01 01 01) with Final Carry = 01H. Operands traverse from SI/DI via AL into RESULT buffers at BX.',
    bestPractices: [
      'Always execute CLC prior to entering an ADC or SBB loop.',
      'Use the LOOP instruction or DEC CX + JNZ carefully; note that DEC updates ZF/SF but leaves CF untouched.',
      'Maintain byte alignment and respect Little-Endian ordering when storing multi-byte values in RAM.'
    ]
  },

  exp2: {
    overview:
      'This program demonstrates signed and unsigned 16-bit multiplication (MUL / IMUL) and division (DIV / IDIV) on the 8086 processor, leveraging the DX:AX register pair for 32-bit product storage and doubleword dividend expansion with CWD (Convert Word to Doubleword).',
    memoryAndSegmentation:
      'Words (16-bit operands) are allocated in the Data Segment with DW directives. Unsigned operands are treated as magnitude values (0 to 65,535), whereas signed operands are interpreted in 2s complement representation (-32,768 to +32,767).',
    logicStages: [
      {
        stageNumber: 1,
        stageName: 'Unsigned 16-bit Multiplication',
        summary: 'Multiply AX by VAL2; place 32-bit product in DX:AX.',
        hardwareAction:
          'Loads VAL1 into AX. Executes MUL VAL2, which computes AX * VAL2. The 32-bit product is split: High Word in DX, Low Word in AX.',
        codeSnippet: 'MOV AX, VAL1\nMUL VAL2\nMOV U_PROD_L, AX\nMOV U_PROD_H, DX'
      },
      {
        stageNumber: 2,
        stageName: 'Signed 16-bit Multiplication',
        summary: 'Multiply signed AX by S_VAL2 using 2s complement arithmetic.',
        hardwareAction:
          'Loads signed value S_VAL1 into AX. Executes IMUL S_VAL2. Hardware handles sign bits, placing the signed 32-bit product across DX:AX.',
        codeSnippet: 'MOV AX, S_VAL1\nIMUL S_VAL2\nMOV S_PROD_L, AX\nMOV S_PROD_H, DX'
      },
      {
        stageNumber: 3,
        stageName: 'Unsigned 16-bit Division',
        summary: 'Zero-extend dividend in DX:AX and divide by divisor.',
        hardwareAction:
          'Loads dividend into AX. Clears DX (XOR DX, DX) to form 32-bit 0000:VAL1. DIV VAL2 yields Quotient in AX and Remainder in DX.',
        codeSnippet: 'MOV AX, VAL1\nXOR DX, DX\nDIV VAL2\nMOV U_QUOT, AX\nMOV U_REM, DX'
      },
      {
        stageNumber: 4,
        stageName: 'Signed 16-bit Division with CWD',
        summary: 'Sign-extend AX into DX using CWD, then execute IDIV.',
        hardwareAction:
          'Loads signed S_VAL1 into AX. Executes CWD to duplicate the sign bit (bit 15) of AX into every bit of DX. IDIV S_VAL2 produces signed Quotient (AX) and Remainder (DX).',
        codeSnippet: 'MOV AX, S_VAL1\nCWD\nIDIV S_VAL2\nMOV S_QUOT, AX\nMOV S_REM, DX'
      }
    ],
    instructionsTheory: [
      {
        mnemonic: 'MUL',
        syntax: 'MUL source16',
        role: 'Unsigned multiplication: DX:AX = AX * source16.',
        flagsAffected: 'CF, OF (SF, ZF, AF, PF undefined)',
        detail:
          'If the upper word (DX) contains non-zero product data, CF and OF are set to 1, signaling a doubleword result.'
      },
      {
        mnemonic: 'IMUL',
        syntax: 'IMUL source16',
        role: 'Signed multiplication: DX:AX = AX * source16 using 2s complement.',
        flagsAffected: 'CF, OF',
        detail:
          'CF and OF are set to 1 if the upper word (DX) is not purely a sign-extension of the lower word (AX).'
      },
      {
        mnemonic: 'CWD',
        syntax: 'CWD',
        role: 'Convert Word to Doubleword: sign-extends AX into DX:AX.',
        flagsAffected: 'None',
        detail:
          'If AX is positive (bit 15 = 0), DX becomes 0000H. If AX is negative (bit 15 = 1), DX becomes FFFFH. Mandatory prior to IDIV.'
      },
      {
        mnemonic: 'IDIV',
        syntax: 'IDIV source16',
        role: 'Signed division: AX = (DX:AX) / source16, DX = (DX:AX) % source16.',
        flagsAffected: 'All condition flags undefined',
        detail:
          'The remainder always takes the sign of the dividend. Generates a Type 0 Interrupt (Divide by Zero / Overflow) if quotient exceeds signed 16-bit limits.'
      }
    ],
    flagsTheory: [
      {
        flag: 'CF & OF',
        fullName: 'Carry & Overflow Flags',
        roleInProgram: 'Indicate whether upper product register DX contains significant data.',
        triggerCondition: 'Set to 1 when high-order word (DX) is required to represent the full product.'
      }
    ],
    dataFlowSummary:
      'VAL1 (0A12H) * VAL2 (0050H) -> DX:AX = 0032:89A0H. Signed dividend S_VAL1 (-25 = FFE7H) sign-extended via CWD to FFFF:FFE7H / 5 = Quotient FFFBH (-5) in AX, Remainder 0 in DX.',
    bestPractices: [
      'Always clear DX with XOR DX, DX before unsigned DIV to prevent Type 0 divide overflow errors.',
      'Always invoke CWD immediately before signed IDIV to ensure correct sign expansion across DX:AX.'
    ]
  },

  exp_math: {
    overview:
      'This program evaluates algebraic mathematical powers (Square N², Cube N³) and Factorial (N!) on the 8086 microprocessor using accumulator-driven multiplication loops and CX register iteration.',
    memoryAndSegmentation:
      'Input number N is defined as a 16-bit word (DW). Output variables SQUARE, CUBE, and FACT are reserved in the Data Segment. Calculations utilize the AX accumulator register for cumulative product compounding.',
    logicStages: [
      {
        stageNumber: 1,
        stageName: 'Square Computation (N²)',
        summary: 'Multiply input N by itself using MUL.',
        hardwareAction: 'Loads AX = N and BX = N. Executes MUL BX (AX = AX * BX = N²). Stores AX into SQUARE.',
        codeSnippet: 'MOV AX, NUM\nMOV BX, NUM\nMUL BX\nMOV SQUARE, AX'
      },
      {
        stageNumber: 2,
        stageName: 'Cube Computation (N³)',
        summary: 'Multiply computed square by base number N.',
        hardwareAction: 'Multiplies AX (containing N²) by BX (containing N). AX = N³; stores AX into CUBE.',
        codeSnippet: 'MOV BX, NUM\nMUL BX\nMOV CUBE, AX'
      },
      {
        stageNumber: 3,
        stageName: 'Factorial Loop (N!)',
        summary: 'Initialize accumulator to 1 and multiply down from N to 1.',
        hardwareAction:
          'Sets accumulator AX = 1 and loop counter CX = N. Factorial loop performs MUL CX (AX = AX * CX) and repeats with LOOP FACT_LOOP until CX decrements to 0.',
        codeSnippet: 'MOV AX, 1\nMOV CX, NUM\nFACT_LOOP:\n  MUL CX\n  LOOP FACT_LOOP\nMOV FACT, AX'
      }
    ],
    instructionsTheory: [
      {
        mnemonic: 'MUL',
        syntax: 'MUL reg16',
        role: 'Multiplies accumulator AX by specified 16-bit register.',
        flagsAffected: 'CF, OF',
        detail:
          'In factorial calculation, repeatedly updates AX with cumulative product while CX counts down.'
      },
      {
        mnemonic: 'LOOP',
        syntax: 'LOOP target',
        role: 'Auto-decrements CX by 1 and jumps if CX != 0.',
        flagsAffected: 'None',
        detail: 'Controls exact iteration count for factorial recursion without modifying arithmetic flags.'
      }
    ],
    flagsTheory: [
      {
        flag: 'OF',
        fullName: 'Overflow Flag (Bit 11)',
        roleInProgram: 'Monitors whether factorial product exceeds the 16-bit limit of AX (limit is 8! = 40,320).',
        triggerCondition: 'Set to 1 when multiplication result requires DX to represent the high word.'
      }
    ],
    dataFlowSummary:
      'For N = 5: Square = 5 * 5 = 25 (0019H). Cube = 25 * 5 = 125 (007DH). Factorial = 1 * 5 * 4 * 3 * 2 * 1 = 120 (0078H).',
    bestPractices: [
      'Initialize factorial accumulator to 01H, never 00H, as multiplication by zero annihilates the product.',
      'Check for 16-bit overflow when computing factorials for N > 8.'
    ]
  },

  exp_bit1: {
    overview:
      'This program evaluates the polarity (positive vs. negative) of an 8-bit signed byte by testing its Most Significant Bit (MSB, Bit 7) using the non-destructive TEST instruction and conditional branching on the Sign Flag (JS / JNS).',
    memoryAndSegmentation:
      'The input byte is stored in the Data Segment. Signed bytes use 2s complement notation where Bit 7 is the sign bit (0 = Positive / Zero, 1 = Negative).',
    logicStages: [
      {
        stageNumber: 1,
        stageName: 'Load Byte Operand',
        summary: 'Read signed byte into register AL.',
        hardwareAction: 'Reads byte from memory address [DATA_VAL] into 8-bit accumulator register AL.',
        codeSnippet: 'MOV AL, DATA_VAL'
      },
      {
        stageNumber: 2,
        stageName: 'Bit Masking via TEST',
        summary: 'Perform non-destructive bitwise AND with 80H (10000000B).',
        hardwareAction:
          'Executes TEST AL, 80H. Performs bitwise AND between AL and 80H to isolate Bit 7. Updates Sign Flag (SF) and Zero Flag (ZF) without modifying AL.',
        codeSnippet: 'TEST AL, 80H'
      },
      {
        stageNumber: 3,
        stageName: 'Conditional Branching on Sign Flag',
        summary: 'Branch to Negative handler if SF = 1; else set Positive flag.',
        hardwareAction:
          'Evaluates SF. If SF = 1, JS jumps to IS_NEG. Sets BL = 01H (Negative). If SF = 0, falls through to set BL = 00H (Positive).',
        codeSnippet: 'JS IS_NEG\nMOV BL, 00H\nJMP STORE_RES\nIS_NEG:\nMOV BL, 01H'
      },
      {
        stageNumber: 4,
        stageName: 'Store Result Flag',
        summary: 'Write result code (00H or 01H) into RESULT memory variable.',
        hardwareAction: 'Writes BL into DS:RESULT and invokes DOS interrupt 21H service 4CH to exit.',
        codeSnippet: 'STORE_RES:\nMOV RESULT, BL\nMOV AH, 4CH\nINT 21H'
      }
    ],
    instructionsTheory: [
      {
        mnemonic: 'TEST',
        syntax: 'TEST dest, source',
        role: 'Performs bitwise AND of operands and updates status flags without altering destination.',
        flagsAffected: 'SF, ZF, PF (CF=0, OF=0)',
        detail:
          'Preferred over AND instruction because it preserves the original register contents while evaluating bit states.'
      },
      {
        mnemonic: 'JS',
        syntax: 'JS target',
        role: 'Jump if Sign (SF = 1), branching when result is negative.',
        flagsAffected: 'None',
        detail: 'Directly reads the Sign Flag in the Flag Register to make the branching decision.'
      }
    ],
    flagsTheory: [
      {
        flag: 'SF',
        fullName: 'Sign Flag (Bit 7)',
        roleInProgram: 'Indicates whether the MSB (Bit 7) of the tested byte is 1.',
        triggerCondition: 'Set to 1 when Bit 7 of the tested data is 1 (negative signed value).'
      },
      {
        flag: 'ZF',
        fullName: 'Zero Flag (Bit 6)',
        roleInProgram: 'Set to 1 if Bit 7 was 0 (since AL AND 80H evaluates to 00H).',
        triggerCondition: 'Set to 1 when bitwise AND yields zero.'
      }
    ],
    dataFlowSummary:
      'Input D3H (11010011B): TEST with 80H yields 80H (non-zero, Bit 7 = 1) -> SF = 1 -> JS branches to IS_NEG -> RESULT = 01H (Negative).',
    bestPractices: [
      'Use TEST instead of AND when register value must remain intact for subsequent processing.',
      'Remember that in 8-bit registers MSB is Bit 7 (mask 80H), while in 16-bit registers MSB is Bit 15 (mask 8000H).'
    ]
  },

  exp_bit2: {
    overview:
      'This program determines whether an integer is Even or Odd by isolating its Least Significant Bit (LSB, Bit 0) using the TEST instruction and checking the Zero Flag (ZF).',
    memoryAndSegmentation:
      'In binary representation, an integer is divisible by 2 (Even) if its LSB (Bit 0) is 0, and Odd if its LSB is 1. The byte is stored in the Data Segment.',
    logicStages: [
      {
        stageNumber: 1,
        stageName: 'Load Target Byte',
        summary: 'Read test number into register AL.',
        hardwareAction: 'Loads byte from memory DATA_VAL into AL.',
        codeSnippet: 'MOV AL, DATA_VAL'
      },
      {
        stageNumber: 2,
        stageName: 'LSB Masking via TEST',
        summary: 'Perform bitwise TEST with 01H (00000001B).',
        hardwareAction:
          'Executes TEST AL, 01H. If Bit 0 is 0, (AL AND 01H) = 00H, which sets ZF = 1 (Even). If Bit 0 is 1, (AL AND 01H) = 01H, which sets ZF = 0 (Odd).',
        codeSnippet: 'TEST AL, 01H'
      },
      {
        stageNumber: 3,
        stageName: 'Branching on Zero Flag (JZ)',
        summary: 'Branch to Even handler if ZF = 1; else set Odd flag.',
        hardwareAction:
          'JZ branches to IS_EVEN if ZF = 1 (Bit 0 was 0). BL is loaded with 00H (Even) or 01H (Odd).',
        codeSnippet: 'JZ IS_EVEN\nMOV BL, 01H ; Odd\nJMP STORE_RES\nIS_EVEN:\nMOV BL, 00H ; Even'
      }
    ],
    instructionsTheory: [
      {
        mnemonic: 'TEST',
        syntax: 'TEST AL, 01H',
        role: 'Isolates Bit 0 without modifying AL register contents.',
        flagsAffected: 'ZF, SF, PF (CF=0, OF=0)',
        detail: 'Directly tests parity of integer magnitude by probing Bit 0.'
      },
      {
        mnemonic: 'JZ',
        syntax: 'JZ target',
        role: 'Jump if Zero Flag (ZF = 1), branching when LSB is zero.',
        flagsAffected: 'None',
        detail: 'Branches when tested bit was 0 (indicating an even number).'
      }
    ],
    flagsTheory: [
      {
        flag: 'ZF',
        fullName: 'Zero Flag (Bit 6)',
        roleInProgram: 'Determines even/odd status: ZF = 1 indicates Even, ZF = 0 indicates Odd.',
        triggerCondition: 'Set to 1 when AL AND 01H = 00000000B.'
      }
    ],
    dataFlowSummary:
      'Input 2FH (00101111B): TEST with 01H yields 01H (non-zero) -> ZF = 0 -> JZ not taken -> BL = 01H (Odd) -> RESULT = 01H.',
    bestPractices: [
      'Do not confuse LSB parity with the hardware Parity Flag (PF), which counts the total number of 1-bits across the byte.',
      'Shifting right (SHR AL, 1) and checking the Carry Flag (CF) is an alternative valid method.'
    ]
  },

  exp_bit3: {
    overview:
      'This program counts the exact number of logical 1s (ones) and logical 0s (zeros) in an 8-bit byte by iteratively shifting bits into the Carry Flag (CF) using SHR (Shift Right) over an 8-iteration loop.',
    memoryAndSegmentation:
      'The byte operand is placed in AL. Registers BL (Ones counter) and BH (Zeros counter) reside in the CPU general-purpose register file for ultra-fast loop increments. CX is initialized to 8.',
    logicStages: [
      {
        stageNumber: 1,
        stageName: 'Register Initialization',
        summary: 'Initialize counter registers and loop limit.',
        hardwareAction: 'Loads AL with byte, clears BL = 0 (Ones), BH = 0 (Zeros), and loads CX = 8.',
        codeSnippet: 'MOV AL, DATA_VAL\nMOV CX, 8\nMOV BL, 0\nMOV BH, 0'
      },
      {
        stageNumber: 2,
        stageName: 'Shift Bit into Carry Flag',
        summary: 'Execute SHR AL, 1 to push LSB into CF.',
        hardwareAction:
          'Executes SHR AL, 1. Shifts all bits of AL one position to the right. The discarded LSB enters the Carry Flag (CF), and a 0 enters MSB (Bit 7).',
        codeSnippet: 'COUNT_LOOP:\n  SHR AL, 1'
      },
      {
        stageNumber: 3,
        stageName: 'Evaluate Carry Flag & Increment Counters',
        summary: 'If CF = 1, increment BL (ones); else increment BH (zeros).',
        hardwareAction:
          'JC branches to INC_ONES if CF = 1, executing INC BL. Otherwise falls through to INC BH and jumps over.',
        codeSnippet: '  JC INC_ONES\n  INC BH\n  JMP NEXT_BIT\nINC_ONES:\n  INC BL\nNEXT_BIT:\n  LOOP COUNT_LOOP'
      },
      {
        stageNumber: 4,
        stageName: 'Store Final Bit Totals',
        summary: 'Save BL into ONES and BH into ZEROS memory locations.',
        hardwareAction: 'Writes BL to memory [ONES] and BH to memory [ZEROS].',
        codeSnippet: 'MOV ONES, BL\nMOV ZEROS, BH'
      }
    ],
    instructionsTheory: [
      {
        mnemonic: 'SHR',
        syntax: 'SHR destination, 1',
        role: 'Logical Shift Right: shifts bits right by 1, shifts 0 into MSB, moves ejected LSB into CF.',
        flagsAffected: 'CF, ZF, SF, PF, OF',
        detail:
          'Transfers individual bit information into the hardware Carry Flag for easy conditional branching.'
      },
      {
        mnemonic: 'JC',
        syntax: 'JC target',
        role: 'Jump if Carry (CF = 1), branching when shifted bit was a 1.',
        flagsAffected: 'None',
        detail: 'Decides whether to increment the Ones counter (BL) or Zeros counter (BH).'
      }
    ],
    flagsTheory: [
      {
        flag: 'CF',
        fullName: 'Carry Flag (Bit 0)',
        roleInProgram: 'Holds the shifted bit value on every iteration of SHR AL, 1.',
        triggerCondition: 'Set to 1 if the bit shifted out of LSB was 1; cleared to 0 if LSB was 0.'
      }
    ],
    dataFlowSummary:
      'Input A5H (10100101B): 8 shifts move bits [1, 0, 1, 0, 0, 1, 0, 1] into CF. Total Ones = 4 (BL), Total Zeros = 4 (BH).',
    bestPractices: [
      'Use ROR or ROL instead of SHR if you need to preserve the original contents of AL across the counting loop.',
      'Ensure the loop counter CX is exactly set to the bit width of the operand (8 for byte, 16 for word).'
    ]
  },

  exp_arr1: {
    overview:
      'This program performs vector accumulation (addition) and successive subtraction across an array of N contiguous data bytes stored in memory using indexed addressing (SI register) and loop counter CX.',
    memoryAndSegmentation:
      'The array is allocated in the Data Segment as consecutive bytes: `ARRAY DB 10H, 20H, 30H, 40H, 50H`. Source Index SI holds the memory offset of the current element.',
    logicStages: [
      {
        stageNumber: 1,
        stageName: 'Pointer & Counter Initialization',
        summary: 'Load SI with array offset, set CX = N, and clear accumulator AL.',
        hardwareAction: 'Loads SI with offset of ARRAY, CX with length (5), and zeroes AL (XOR AL, AL).',
        codeSnippet: 'LEA SI, ARRAY\nMOV CX, LEN\nMOV AL, 0'
      },
      {
        stageNumber: 2,
        stageName: 'Array Summation Loop',
        summary: 'Iteratively add byte elements pointed by SI to AL.',
        hardwareAction:
          'AL = AL + [SI]. Increments SI (INC SI) to advance to next byte. Decrements CX; repeats if CX > 0.',
        codeSnippet: 'SUM_LOOP:\n  ADD AL, [SI]\n  INC SI\n  LOOP SUM_LOOP\nMOV SUM, AL'
      },
      {
        stageNumber: 3,
        stageName: 'Array Subtraction Initialization',
        summary: 'Reset SI, load AL with first element, and prepare subtraction loop.',
        hardwareAction:
          'Reloads SI with offset of ARRAY + 1, CX with (LEN - 1), and loads AL with the initial element [ARRAY].',
        codeSnippet: 'LEA SI, ARRAY\nMOV AL, [SI]\nINC SI\nMOV CX, LEN - 1'
      },
      {
        stageNumber: 4,
        stageName: 'Array Subtraction Loop',
        summary: 'Subtract subsequent array elements from AL accumulator.',
        hardwareAction: 'AL = AL - [SI]. Increments SI and repeats via LOOP. Saves final AL into DIFF.',
        codeSnippet: 'SUB_LOOP:\n  SUB AL, [SI]\n  INC SI\n  LOOP SUB_LOOP\nMOV DIFF, AL'
      }
    ],
    instructionsTheory: [
      {
        mnemonic: 'ADD',
        syntax: 'ADD AL, [SI]',
        role: 'Adds the memory byte at address DS:SI to accumulator AL.',
        flagsAffected: 'CF, OF, SF, ZF, AF, PF',
        detail: 'Performs unsigned and signed addition of array elements.'
      },
      {
        mnemonic: 'INC',
        syntax: 'INC SI',
        role: 'Increments pointer register SI by 1 to point to next array element.',
        flagsAffected: 'OF, SF, ZF, AF, PF (Leaves CF unaffected)',
        detail: 'Safely advances memory pointer without disturbing the Carry Flag.'
      }
    ],
    flagsTheory: [
      {
        flag: 'CF',
        fullName: 'Carry Flag (Bit 0)',
        roleInProgram: 'Monitors if array sum exceeds 255 (0FFH) in 8-bit accumulator mode.',
        triggerCondition: 'Set to 1 if accumulation causes an 8-bit unsigned overflow.'
      }
    ],
    dataFlowSummary:
      'Array: [10H, 20H, 30H, 40H, 50H]. Sum = 10H + 20H + 30H + 40H + 50H = 0F0H. Subtraction = 10H - 20H - 30H - 40H - 50H = 0E0H.',
    bestPractices: [
      'Use 16-bit registers (AX) if the sum of 8-bit elements is expected to exceed 255 (0FFH).',
      'Prefer `LEA SI, ARRAY` over `MOV SI, OFFSET ARRAY` for cleaner relocatable address resolution.'
    ]
  },

  exp3: {
    overview:
      'This program scans an unsigned array of N data bytes to determine the maximum (largest) and minimum (smallest) elements simultaneously in a single pass using register comparators (CMP) and conditional jumps (JAE / JBE).',
    memoryAndSegmentation:
      'The array is defined in the Data Segment. The first element is initialized as the baseline candidate for both Maximum (stored in AL) and Minimum (stored in AH). Pointer SI traverses remaining elements.',
    logicStages: [
      {
        stageNumber: 1,
        stageName: 'Initialize Extrema Candidates',
        summary: 'Load first element into AL (Max) and AH (Min); set CX = N - 1.',
        hardwareAction:
          'Loads SI with array base. Reads first byte: AL = [SI] (Max), AH = [SI] (Min). Advances SI to second element and sets loop counter CX = N - 1.',
        codeSnippet: 'LEA SI, ARRAY\nMOV AL, [SI]\nMOV AH, [SI]\nINC SI\nMOV CX, LEN - 1'
      },
      {
        stageNumber: 2,
        stageName: 'Compare for Maximum',
        summary: 'Compare current element [SI] with AL candidate.',
        hardwareAction:
          'Executes CMP [SI], AL. If [SI] <= AL (JBE / JNA), candidate is still largest. If [SI] > AL, updates AL = [SI].',
        codeSnippet: 'SCAN_LOOP:\n  CMP [SI], AL\n  JBE CHECK_MIN\n  MOV AL, [SI]\nCHECK_MIN:'
      },
      {
        stageNumber: 3,
        stageName: 'Compare for Minimum',
        summary: 'Compare current element [SI] with AH candidate.',
        hardwareAction:
          'Executes CMP [SI], AH. If [SI] >= AH (JAE / JNB), candidate is still smallest. If [SI] < AH, updates AH = [SI].',
        codeSnippet: '  CMP [SI], AH\n  JAE NEXT_ELEM\n  MOV AH, [SI]\nNEXT_ELEM:\n  INC SI\n  LOOP SCAN_LOOP'
      },
      {
        stageNumber: 4,
        stageName: 'Store Extrema Values',
        summary: 'Save AL into MAX_VAL and AH into MIN_VAL in memory.',
        hardwareAction: 'Writes AL to [MAX_VAL] and AH to [MIN_VAL].',
        codeSnippet: 'MOV MAX_VAL, AL\nMOV MIN_VAL, AH'
      }
    ],
    instructionsTheory: [
      {
        mnemonic: 'CMP',
        syntax: 'CMP dest, source',
        role: 'Performs internal subtraction (dest - source) to update flags without altering destination.',
        flagsAffected: 'CF, ZF, SF, OF, AF, PF',
        detail:
          'For unsigned numbers: CF = 0 & ZF = 0 means dest > source (JA/JNBE); CF = 1 means dest < source (JB/JNAE).'
      },
      {
        mnemonic: 'JAE / JBE',
        syntax: 'JAE target / JBE target',
        role: 'Jump if Above or Equal / Jump if Below or Equal (unsigned comparisons).',
        flagsAffected: 'None',
        detail: 'Evaluates Carry Flag (CF) and Zero Flag (ZF) to make unsigned magnitude decisions.'
      }
    ],
    flagsTheory: [
      {
        flag: 'CF',
        fullName: 'Carry Flag (Bit 0)',
        roleInProgram: 'Serves as the primary indicator for unsigned magnitude comparisons.',
        triggerCondition: 'Set to 1 when CMP destination is strictly less than source operand.'
      }
    ],
    dataFlowSummary:
      'Array: [25H, 4AH, 12H, 8BH, 05H, 92H, 31H]. Single-pass scan updates AL to 92H (Maximum) and AH to 05H (Minimum).',
    bestPractices: [
      'Use unsigned conditional jumps (JA, JAE, JB, JBE) for unsigned arrays; use signed jumps (JG, JGE, JL, JLE) for 2s complement signed data.',
      'Initialize candidate registers with the first array element, never hardcoded zeroes, to correctly handle all-negative arrays.'
    ]
  },

  exp4: {
    overview:
      'This program implements the classical Bubble Sort algorithm on an array of N bytes in 8086 assembly, utilizing nested loop counters (DX outer pass counter, CX inner comparison counter) and adjacent memory value exchanges.',
    memoryAndSegmentation:
      'The array resides in the Data Segment. Two nested loops iterate over the array: the outer loop runs (N - 1) times, while the inner loop compares adjacent elements `[SI]` and `[SI + 1]`.',
    logicStages: [
      {
        stageNumber: 1,
        stageName: 'Outer Loop Pass Initialization',
        summary: 'Set outer pass counter DX = N - 1.',
        hardwareAction: 'Loads DX with array length minus 1 (DX = N - 1), representing total passes required.',
        codeSnippet: 'MOV DX, LEN - 1'
      },
      {
        stageNumber: 2,
        stageName: 'Inner Loop Pointer & Counter Setup',
        summary: 'Reset SI to array start and set inner counter CX = DX.',
        hardwareAction:
          'Resets SI to point to ARRAY. Sets inner loop counter CX equal to current outer pass value DX (reducing comparisons on each pass).',
        codeSnippet: 'OUTER_LOOP:\n  LEA SI, ARRAY\n  MOV CX, DX'
      },
      {
        stageNumber: 3,
        stageName: 'Adjacent Element Comparison & Swap',
        summary: 'Compare [SI] with [SI + 1]; swap if [SI] > [SI + 1].',
        hardwareAction:
          'Loads AL = [SI]. Compares CMP AL, [SI + 1]. If AL <= [SI + 1] (JBE), skips swap. Else loads AH = [SI + 1], writes AL into [SI + 1], and writes AH into [SI].',
        codeSnippet: 'INNER_LOOP:\n  MOV AL, [SI]\n  CMP AL, [SI + 1]\n  JBE NO_SWAP\n  MOV AH, [SI + 1]\n  MOV [SI + 1], AL\n  MOV [SI], AH\nNO_SWAP:\n  INC SI\n  LOOP INNER_LOOP'
      },
      {
        stageNumber: 4,
        stageName: 'Outer Loop Iteration & Completion',
        summary: 'Decrement DX; repeat outer pass until DX = 0.',
        hardwareAction: 'Decrements DX (DEC DX). JNZ repeats OUTER_LOOP until all passes are completed.',
        codeSnippet: '  DEC DX\n  JNZ OUTER_LOOP'
      }
    ],
    instructionsTheory: [
      {
        mnemonic: 'CMP',
        syntax: 'CMP AL, [SI + 1]',
        role: 'Compares current element with the immediately adjacent neighbor.',
        flagsAffected: 'CF, ZF, SF, OF, AF, PF',
        detail: 'Determines if elements are out of sorted order.'
      },
      {
        mnemonic: 'JBE',
        syntax: 'JBE label',
        role: 'Jump if Below or Equal (CF = 1 or ZF = 1) for ascending order sort.',
        flagsAffected: 'None',
        detail: 'Bypasses the swap block when the pair is already in correct ascending sequence.'
      }
    ],
    flagsTheory: [
      {
        flag: 'CF & ZF',
        fullName: 'Carry & Zero Flags',
        roleInProgram: 'Control the swap decision in the inner comparison loop.',
        triggerCondition: 'Evaluated by JBE: if AL <= [SI+1], jump occurs; if AL > [SI+1], execution falls through to swap.'
      }
    ],
    dataFlowSummary:
      'Initial: [88H, 11H, 55H, 22H, 44H]. Pass 1 bubbles 88H to end -> [11H, 55H, 22H, 44H, 88H]. Final sorted array: [11H, 22H, 44H, 55H, 88H].',
    bestPractices: [
      'To switch from Ascending to Descending sort order, change `JBE NO_SWAP` to `JAE NO_SWAP`.',
      'Optimize the inner loop bound to CX = DX so that already bubbled elements at the end of the array are not redundantly re-compared.'
    ]
  },

  exp_str1: {
    overview:
      'This program calculates the length of a character string ending with the "$" terminator using the 8086 dedicated hardware string scanning instruction SCASB (Scan String Byte) coupled with the REPNE (Repeat while Not Equal) prefix.',
    memoryAndSegmentation:
      'The string is defined in the Data Segment. String instructions strictly reference memory through ES:DI. Therefore, the Extra Segment register ES must be initialized to match DS (ES = DS). Direction Flag (DF) must be cleared (CLD) for forward scanning.',
    logicStages: [
      {
        stageNumber: 1,
        stageName: 'Segment & Register Setup',
        summary: 'Point ES to DS, load DI with string offset, and set search key AL = "$".',
        hardwareAction:
          'Initializes DS and ES to @DATA. Loads DI with offset of STR_VAL. Loads AL with "$" (24H). Sets CX = FFFFH (maximum count) and clears Direction Flag (CLD).',
        codeSnippet: 'MOV AX, @DATA\nMOV DS, AX\nMOV ES, AX\nLEA DI, STR_VAL\nMOV AL, "$"\nMOV CX, 0FFFFH\nCLD'
      },
      {
        stageNumber: 2,
        stageName: 'Hardware String Scan (REPNE SCASB)',
        summary: 'Scan string bytes until terminator "$" is found or CX = 0.',
        hardwareAction:
          'Executes REPNE SCASB. In hardware: compares AL with byte at ES:[DI], increments DI (since DF = 0), and decrements CX. Repeats while ZF = 0 (AL != ES:[DI]) and CX != 0.',
        codeSnippet: 'REPNE SCASB'
      },
      {
        stageNumber: 3,
        stageName: 'Length Derivation from Down-Counter',
        summary: 'Compute exact character length: Length = (0FFFFH - CX) - 1.',
        hardwareAction:
          'Since CX started at FFFFH and decremented for every character including "$", NOT CX (which computes FFFFH - CX) followed by DEC CX yields the exact character count.',
        codeSnippet: 'NOT CX\nDEC CX\nMOV STR_LEN, CX'
      }
    ],
    instructionsTheory: [
      {
        mnemonic: 'SCASB',
        syntax: 'SCASB',
        role: 'Compares AL with byte at ES:DI, then auto-increments/decrements DI based on DF.',
        flagsAffected: 'AF, CF, OF, PF, SF, ZF',
        detail:
          'Hardware-accelerated byte comparison designed specifically for string searching without explicit loop coding.'
      },
      {
        mnemonic: 'REPNE',
        syntax: 'REPNE SCASB',
        role: 'Repeats string instruction while Zero Flag ZF = 0 and CX != 0.',
        flagsAffected: 'Same as underlying string instruction',
        detail: 'Terminates immediately when a character match occurs (ZF becomes 1).'
      },
      {
        mnemonic: 'CLD',
        syntax: 'CLD',
        role: 'Clears the Direction Flag (DF = 0).',
        flagsAffected: 'DF (cleared to 0)',
        detail: 'Mandatory before string operations to guarantee autoincrement from lower to higher memory addresses.'
      }
    ],
    flagsTheory: [
      {
        flag: 'ZF',
        fullName: 'Zero Flag (Bit 6)',
        roleInProgram: 'Terminates REPNE repetition when the matching terminator character is found.',
        triggerCondition: 'Set to 1 when AL equals ES:[DI] (terminator "$" detected).'
      },
      {
        flag: 'DF',
        fullName: 'Direction Flag (Bit 10)',
        roleInProgram: 'Governs index auto-increment (DF = 0) or auto-decrement (DF = 1).',
        triggerCondition: 'Explicitly cleared to 0 via CLD instruction.'
      }
    ],
    dataFlowSummary:
      'String "KUPPAM$": SCASB matches "$" after 7 iterations. CX decrements from FFFFH to FFF8H. NOT CX = 0007H. DEC CX = 0006H -> STR_LEN = 6.',
    bestPractices: [
      'Always initialize ES register (MOV ES, AX) when using SCASB, as it strictly addresses ES:DI.',
      'Always execute CLD before string instructions to prevent backwards memory scanning.'
    ]
  },

  exp_str2: {
    overview:
      'This program displays a character string on the standard console display screen by invoking DOS Software Interrupt INT 21H Service Function 09H (Print String).',
    memoryAndSegmentation:
      'The string is defined in the Data Segment and MUST be terminated with the dollar sign character ("$"). The base offset address of the string is passed to DOS in register DX (pointing to DS:DX).',
    logicStages: [
      {
        stageNumber: 1,
        stageName: 'Data Segment Initialization',
        summary: 'Initialize DS register with @DATA.',
        hardwareAction: 'Loads AX = @DATA and MOV DS, AX so that DS:DX resolves to physical RAM.',
        codeSnippet: 'MOV AX, @DATA\nMOV DS, AX'
      },
      {
        stageNumber: 2,
        stageName: 'Load String Pointer into DX',
        summary: 'Load effective address of string into DX register.',
        hardwareAction: 'Executes LEA DX, MESSAGE to place the 16-bit offset of the string into DX.',
        codeSnippet: 'LEA DX, MESSAGE'
      },
      {
        stageNumber: 3,
        stageName: 'Select DOS Print Service & Trigger Interrupt',
        summary: 'Load AH = 09H and execute INT 21H.',
        hardwareAction:
          'Loads AH = 09H. INT 21H transfers CPU control to the DOS interrupt handler, which reads bytes at DS:DX and renders each ASCII character to the display until it encounters "$".',
        codeSnippet: 'MOV AH, 09H\nINT 21H'
      },
      {
        stageNumber: 4,
        stageName: 'Program Termination',
        summary: 'Invoke DOS Service 4CH to cleanly terminate.',
        hardwareAction: 'Loads AH = 4CH and executes INT 21H to return control to the DOS command prompt.',
        codeSnippet: 'MOV AH, 4CH\nINT 21H'
      }
    ],
    instructionsTheory: [
      {
        mnemonic: 'INT 21H',
        syntax: 'INT 21H',
        role: 'Invokes DOS Operating System API service requested in register AH.',
        flagsAffected: 'Depends on specific service invoked',
        detail:
          'Service AH = 09H outputs string at DS:DX up to "$". Service AH = 4CH exits program to DOS.'
      },
      {
        mnemonic: 'LEA',
        syntax: 'LEA DX, label',
        role: 'Load Effective Address: computes 16-bit memory offset and stores into destination register.',
        flagsAffected: 'None',
        detail: 'Loads the exact offset of the string in the Data Segment for the DOS printer service.'
      }
    ],
    flagsTheory: [
      {
        flag: 'IF',
        fullName: 'Interrupt Flag (Bit 9)',
        roleInProgram: 'Controls CPU responsiveness to maskable hardware interrupts during DOS service execution.',
        triggerCondition: 'Remains enabled (IF = 1) for normal OS I/O operations.'
      }
    ],
    dataFlowSummary:
      'MESSAGE DB "HELLO FROM 8086 MICRO-COURSE$" -> LEA DX, MESSAGE -> AH = 09H -> INT 21H outputs ASCII characters to terminal until "$" is encountered.',
    bestPractices: [
      'Always terminate strings printed via Service 09H with "$" (ASCII 24H); otherwise DOS will continue printing arbitrary RAM bytes.',
      'To include line breaks, embed ASCII 0DH (Carriage Return) and 0AH (Line Feed) inside the string definition.'
    ]
  },

  exp_str3: {
    overview:
      'This program compares two character strings for exact character-by-character equality using the 8086 block string comparison instruction CMPSB (Compare String Byte) and the REPE (Repeat while Equal) prefix.',
    memoryAndSegmentation:
      'String 1 is referenced via DS:SI (Source Index in Data Segment), while String 2 is referenced via ES:DI (Destination Index in Extra Segment). ES must be initialized to match DS.',
    logicStages: [
      {
        stageNumber: 1,
        stageName: 'Dual Segment & Pointer Initialization',
        summary: 'Set DS and ES to @DATA; load SI = STR1, DI = STR2, CX = Length.',
        hardwareAction:
          'Loads DS and ES with segment base. SI is loaded with offset of STR1, DI with offset of STR2, CX with character length (5), and Direction Flag is cleared (CLD).',
        codeSnippet: 'MOV AX, @DATA\nMOV DS, AX\nMOV ES, AX\nLEA SI, STR1\nLEA DI, STR2\nMOV CX, LEN\nCLD'
      },
      {
        stageNumber: 2,
        stageName: 'Execute REPE CMPSB',
        summary: 'Compare bytes at DS:SI and ES:DI while equal.',
        hardwareAction:
          'In hardware: compares byte at DS:[SI] with byte at ES:[DI] (internal subtraction), auto-increments SI and DI, and decrements CX. Repeats while ZF = 1 (bytes match) and CX != 0.',
        codeSnippet: 'REPE CMPSB'
      },
      {
        stageNumber: 3,
        stageName: 'Zero Flag Evaluation',
        summary: 'If ZF = 1 at termination, strings are equal; else unequal.',
        hardwareAction:
          'JZ branches to EQUAL if ZF = 1 (all bytes matched). Stores 00H (Equal) or 01H (Unequal) into RESULT variable.',
        codeSnippet: 'JZ STR_EQ\nMOV RESULT, 1 ; Unequal\nJMP DONE\nSTR_EQ:\nMOV RESULT, 0 ; Equal'
      }
    ],
    instructionsTheory: [
      {
        mnemonic: 'CMPSB',
        syntax: 'CMPSB',
        role: 'Compares byte at DS:SI with byte at ES:DI, setting flags and updating SI/DI.',
        flagsAffected: 'AF, CF, OF, PF, SF, ZF',
        detail:
          'Hardware-accelerated byte-pair comparison. Subtracts [ES:DI] from [DS:SI] without modifying memory contents.'
      },
      {
        mnemonic: 'REPE',
        syntax: 'REPE CMPSB',
        role: 'Repeats string comparison while Zero Flag ZF = 1 and CX != 0.',
        flagsAffected: 'Reflects the result of the last comparison performed',
        detail: 'Exits immediately upon detecting the first mismatching character (ZF becomes 0).'
      }
    ],
    flagsTheory: [
      {
        flag: 'ZF',
        fullName: 'Zero Flag (Bit 6)',
        roleInProgram: 'Signals character match status during and upon conclusion of REPE CMPSB.',
        triggerCondition: 'ZF = 1 if all compared bytes were identical; ZF = 0 if a character mismatch occurred.'
      }
    ],
    dataFlowSummary:
      'STR1: "HELLO", STR2: "HELLO". REPE CMPSB compares 5 byte pairs. All match -> ZF remains 1 -> JZ branches to STR_EQ -> RESULT = 00H (Equal).',
    bestPractices: [
      'Ensure string lengths match before executing CMPSB, or incorporate length checking to prevent false prefix matches.',
      'Remember that CMPSB strictly checks DS:SI against ES:DI; omitting ES initialization causes invalid memory reads.'
    ]
  },

  exp_str4: {
    overview:
      'This program reverses a character string into a temporary destination buffer using decrementing source pointers and incrementing destination pointers, and subsequently validates whether the original string is a Palindrome using REPE CMPSB.',
    memoryAndSegmentation:
      'Source string STR1 and destination buffer REV_STR are allocated in the Data Segment. The reversal phase reads STR1 from end to start (SI decrementing) and writes REV_STR from start to end (DI incrementing).',
    logicStages: [
      {
        stageNumber: 1,
        stageName: 'Pointer Positioning for String Reversal',
        summary: 'Point SI to the last character of STR1 and DI to REV_STR buffer.',
        hardwareAction:
          'SI is loaded with offset of STR1 + LEN - 1 (pointing to last byte). DI is loaded with base offset of REV_STR. Loop counter CX is set to string length (5).',
        codeSnippet: 'LEA SI, STR1\nADD SI, LEN\nDEC SI\nLEA DI, REV_STR\nMOV CX, LEN'
      },
      {
        stageNumber: 2,
        stageName: 'Reverse Copy Loop',
        summary: 'Copy bytes backwards from STR1 into REV_STR.',
        hardwareAction:
          'AL = [SI]. [DI] = AL. Decrements SI (SI--) and increments DI (DI++). Repeats via LOOP until CX = 0.',
        codeSnippet: 'REV_LOOP:\n  MOV AL, [SI]\n  MOV [DI], AL\n  DEC SI\n  INC DI\n  LOOP REV_LOOP'
      },
      {
        stageNumber: 3,
        stageName: 'Palindrome Verification via REPE CMPSB',
        summary: 'Compare original STR1 and reversed REV_STR byte-by-byte.',
        hardwareAction:
          'Resets SI = offset STR1, DI = offset REV_STR, CX = LEN, clears DF (CLD), and executes REPE CMPSB.',
        codeSnippet: 'LEA SI, STR1\nLEA DI, REV_STR\nMOV CX, LEN\nCLD\nREPE CMPSB'
      },
      {
        stageNumber: 4,
        stageName: 'Store Palindrome Result Flag',
        summary: 'Evaluate ZF: if ZF = 1, string is a Palindrome (RESULT = 00H); else 01H.',
        hardwareAction: 'JZ branches to IS_PALIN. RESULT is updated with 00H (Palindrome) or 01H (Not Palindrome).',
        codeSnippet: 'JZ IS_PALIN\nMOV RESULT, 1\nJMP FINISH\nIS_PALIN:\nMOV RESULT, 0'
      }
    ],
    instructionsTheory: [
      {
        mnemonic: 'REPE CMPSB',
        syntax: 'REPE CMPSB',
        role: 'Compares original string at DS:SI with reversed string at ES:DI.',
        flagsAffected: 'AF, CF, OF, PF, SF, ZF',
        detail: 'Verifies string symmetry in hardware across the entire string length.'
      },
      {
        mnemonic: 'LOOP',
        syntax: 'LOOP target',
        role: 'Controls manual byte copy iterations during string reversal.',
        flagsAffected: 'None',
        detail: 'Repeats until all N characters are copied backwards.'
      }
    ],
    flagsTheory: [
      {
        flag: 'ZF',
        fullName: 'Zero Flag (Bit 6)',
        roleInProgram: 'Determines whether original string and reversed string are identical.',
        triggerCondition: 'Set to 1 if every corresponding byte matched (Palindrome).'
      }
    ],
    dataFlowSummary:
      'STR1 = "MADAM". Reversal produces REV_STR = "MADAM". REPE CMPSB compares "MADAM" with "MADAM" -> ZF = 1 -> RESULT = 00H (Palindrome).',
    bestPractices: [
      'Ensure the reversed buffer REV_STR is allocated with adequate capacity (`DUP (?)`) in the Data Segment.',
      'Always reset both SI and DI pointers to the base offsets of the two strings before executing REPE CMPSB.'
    ]
  },

  exp_clock1: {
    overview:
      'This assembly program retrieves the system wall-clock time from the DOS Real-Time Clock service (INT 21H Function 2CH), unpacks each binary component (Hours, Minutes, Seconds) into tens and units decimal digits, converts them to ASCII characters by adding 30H, and prints a formatted HH:MM:SS string to the console using INT 21H Function 02H.',
    memoryAndSegmentation:
      'The data segment declares text prompt strings, delimiter variables (\':\'), and temporary storage buffers. DS is initialized with @DATA. The stack segment maintains frame preservation during subroutines (PUSH/POP of registers).',
    logicStages: [
      {
        stageNumber: 1,
        stageName: 'Data Segment Initialization & Title Header',
        summary: 'Initialize DS and display experiment header banner.',
        hardwareAction:
          'Loads DS with @DATA. Loads DX with offset of TITLE_MSG and invokes INT 21H AH=09H to display introductory text.',
        codeSnippet: 'MOV AX, @DATA\nMOV DS, AX\nLEA DX, TITLE_MSG\nMOV AH, 09H\nINT 21H'
      },
      {
        stageNumber: 2,
        stageName: 'Query DOS System Time (INT 21H AH=2CH)',
        summary: 'Retrieve system time into CX and DX registers.',
        hardwareAction:
          'Executes INT 21H with AH = 2CH. DOS reads RTC and populates CH = Hours, CL = Minutes, DH = Seconds, DL = Hundredths.',
        codeSnippet: 'MOV AH, 2CH\nINT 21H'
      },
      {
        stageNumber: 3,
        stageName: 'Extract & Display Hours (CH)',
        summary: 'Save registers, unpack CH into tens and units, add 30H and print.',
        hardwareAction:
          'Pushes CX and DX to stack. Copies CH to AL, divides by 10 to get tens (AL) and units (AH). Adds 30H to AL and AH. Transmits characters to video display via INT 21H AH=02H.',
        codeSnippet: 'PUSH CX\nPUSH DX\nMOV AL, CH\nCALL DISPLAY_TWO_DIGITS\nMOV DL, \':\'\nMOV AH, 02H\nINT 21H'
      },
      {
        stageNumber: 4,
        stageName: 'Extract & Display Minutes (CL)',
        summary: 'Restore CX, unpack CL into tens and units, add 30H and print.',
        hardwareAction:
          'Retrieves CL, converts to ASCII digits via division by 10, displays tens and units, followed by the second \':\' delimiter.',
        codeSnippet: 'POP DX\nPOP CX\nPUSH DX\nMOV AL, CL\nCALL DISPLAY_TWO_DIGITS\nMOV DL, \':\'\nMOV AH, 02H\nINT 21H'
      },
      {
        stageNumber: 5,
        stageName: 'Extract & Display Seconds (DH)',
        summary: 'Retrieve DH from stack, convert to ASCII, and terminate.',
        hardwareAction:
          'Pops DX, copies DH to AL, calls DISPLAY_TWO_DIGITS to print seconds, prints newline, and terminates with AH=4CH.',
        codeSnippet: 'POP DX\nMOV AL, DH\nCALL DISPLAY_TWO_DIGITS\nMOV AH, 4CH\nINT 21H'
      }
    ],
    instructionsTheory: [
      {
        mnemonic: 'INT 21H (AH=2CH)',
        syntax: 'MOV AH, 2CH\nINT 21H',
        role: 'Reads system time: CH=Hours, CL=Minutes, DH=Seconds, DL=Hundredths of second.',
        flagsAffected: 'None',
        detail:
          'Hardware-independent DOS system service querying the BIOS/RTC timer.'
      },
      {
        mnemonic: 'INT 21H (AH=02H)',
        syntax: 'MOV DL, char\nMOV AH, 02H\nINT 21H',
        role: 'Outputs a single ASCII character from DL to standard output.',
        flagsAffected: 'None',
        detail: 'Used to write individual decimal digits and colon delimiters sequentially.'
      },
      {
        mnemonic: 'AAM / DIV',
        syntax: 'AAM (or MOV AH,0; MOV BL,10; DIV BL)',
        role: 'Converts binary value in AL to unpacked BCD (AH = Tens, AL = Units).',
        flagsAffected: 'SF, ZF, PF',
        detail: 'Essential for splitting raw byte time into two printable ASCII decimal digits.'
      }
    ],
    flagsTheory: [
      {
        flag: 'ZF',
        fullName: 'Zero Flag (Bit 6)',
        roleInProgram: 'Asserted if remainder or digit arithmetic yields zero.',
        triggerCondition: 'Evaluated during division / AAM digit separation.'
      }
    ],
    dataFlowSummary:
      'DOS Time -> CX:DX (e.g., 0E23:1C32H) -> Hours 0EH (14) -> "14", Minutes 23H (35) -> "35", Seconds 1CH (28) -> "28" -> Console Output: "14:35:28".',
    bestPractices: [
      'Preserve CX and DX across INT 21H character output calls because DOS functions may modify working registers.',
      'Always add 30H (ASCII offset for \'0\') to numeric digits prior to console display.'
    ]
  },

  exp_clock2: {
    overview:
      'This program creates an interactive digital clock dashboard by coordinating BIOS cursor positioning (INT 10H AH=02H) with DOS time reading (INT 21H AH=2CH) and string rendering (INT 21H AH=09H). It implements time-change caching to eliminate screen flicker and polls for keystrokes (INT 21H AH=0BH) to allow graceful user exit.',
    memoryAndSegmentation:
      'Stores string templates (TIME_STR DB "00:00:00$", PREV_SEC DB 0FFH) in Data Segment (.DATA). DS is initialized to @DATA. Stack segment supports BIOS/DOS interrupt state preservation.',
    logicStages: [
      {
        stageNumber: 1,
        stageName: 'Screen Preparation & Title',
        summary: 'Clear screen or position header banner at desired coordinates.',
        hardwareAction:
          'Invokes BIOS INT 10H with AH = 06H (scroll/clear window) and sets cursor position to Row 10, Column 30.',
        codeSnippet: 'MOV AH, 02H\nMOV BH, 00H\nMOV DH, 10\nMOV DL, 30\nINT 10H'
      },
      {
        stageNumber: 2,
        stageName: 'Time Reading & Delta Verification',
        summary: 'Read system time via INT 21H AH=2CH and check if second has changed.',
        hardwareAction:
          'Reads DH (Seconds). Compares DH with PREV_SEC variable. If DH == PREV_SEC, branches to keyboard poll without redrawing.',
        codeSnippet: 'MOV AH, 2CH\nINT 21H\nCMP DH, PREV_SEC\nJE POLL_KEY\nMOV PREV_SEC, DH'
      },
      {
        stageNumber: 3,
        stageName: 'Buffer Formatting (HH:MM:SS)',
        summary: 'Convert CH, CL, DH to ASCII and write directly into TIME_STR buffer.',
        hardwareAction:
          'Converts CH to ASCII digits -> TIME_STR[0..1], sets TIME_STR[2]=\':\', CL -> TIME_STR[3..4], sets TIME_STR[5]=\':\', DH -> TIME_STR[6..7], sets TIME_STR[8]=\'$\'.',
        codeSnippet: '; Format hours, minutes, seconds into TIME_STR buffer\nMOV [TIME_STR+0], AH\nMOV [TIME_STR+1], AL\n...'
      },
      {
        stageNumber: 4,
        stageName: 'Cursor Relocation & String Output',
        summary: 'Reposition cursor to clock row/column and print TIME_STR.',
        hardwareAction:
          'Calls INT 10H AH=02H (DH=12, DL=35), then loads DX = OFFSET TIME_STR and executes INT 21H AH=09H.',
        codeSnippet: 'MOV AH, 02H\nMOV DH, 12\nMOV DL, 35\nINT 10H\nLEA DX, TIME_STR\nMOV AH, 09H\nINT 21H'
      },
      {
        stageNumber: 5,
        stageName: 'Non-Blocking Keystroke Check & Loop',
        summary: 'Test keyboard status via INT 21H AH=0BH; loop if no key pressed.',
        hardwareAction:
          'Calls INT 21H AH=0BH. If AL == 00H (no key), jumps back to clock update loop. If AL == 0FFH (key pressed), flushes key and exits via AH=4CH.',
        codeSnippet: 'POLL_KEY:\nMOV AH, 0BH\nINT 21H\nCMP AL, 0\nJE CLOCK_LOOP\nMOV AH, 4CH\nINT 21H'
      }
    ],
    instructionsTheory: [
      {
        mnemonic: 'INT 10H (AH=02H)',
        syntax: 'MOV AH, 02H\nMOV BH, page\nMOV DH, row\nMOV DL, col\nINT 10H',
        role: 'Sets hardware video text cursor position at specified row and column.',
        flagsAffected: 'None',
        detail:
          'Allows in-place text updates on the display without clearing the screen.'
      },
      {
        mnemonic: 'INT 21H (AH=09H)',
        syntax: 'LEA DX, string\nMOV AH, 09H\nINT 21H',
        role: 'Outputs a \'$\'-terminated string from memory addressed by DS:DX to screen.',
        flagsAffected: 'None',
        detail: 'Fast string output service suitable for rendering full time strings.'
      },
      {
        mnemonic: 'INT 21H (AH=0BH)',
        syntax: 'MOV AH, 0BH\nINT 21H',
        role: 'Checks console input status without blocking (AL=00H: no key, AL=FFH: key ready).',
        flagsAffected: 'None',
        detail: 'Enables asynchronous user termination of active clock polling loops.'
      }
    ],
    flagsTheory: [
      {
        flag: 'ZF',
        fullName: 'Zero Flag (Bit 6)',
        roleInProgram: 'Tests whether current second matches cached second (CMP DH, PREV_SEC) and whether key status is 0.',
        triggerCondition: 'Set to 1 when second has not changed, skipping redundant redraws.'
      }
    ],
    dataFlowSummary:
      'Loop -> INT 21H 2CH -> Delta Check (DH != PREV_SEC) -> Format "HH:MM:SS$" in RAM -> INT 10H AH=02H (Cursor) -> INT 21H AH=09H (Print) -> INT 21H AH=0BH (Key Check) -> Repeat.',
    bestPractices: [
      'Always cache the previous second value to avoid redundant display writes that cause visual flicker.',
      'Ensure the string buffer ends with the \'$\' sentinel character when using INT 21H Function 09H.'
    ]
  },

  exp_clock3: {
    overview:
      'This program demonstrates hardware-level time synchronization by reading the 32-bit real-time clock tick count from the BIOS Data Area using INT 1AH Function 00H. Driven by the 8253/8254 PIT generating IRQ0 ticks at ~18.2065 Hz, the program scales 32-bit tick counts into standard hours, minutes, and seconds using fixed-point arithmetic.',
    memoryAndSegmentation:
      'Data segment holds 32-bit tick variables, divisor constants (65543 for hours, 1092 for minutes, 18 for seconds), and formatted ASCII output arrays. Stack segment manages register context.',
    logicStages: [
      {
        stageNumber: 1,
        stageName: 'Segment Setup & Banner',
        summary: 'Initialize DS and print BIOS tick experiment description.',
        hardwareAction:
          'Initializes DS = @DATA, loads DX with offset of TICK_BANNER, and prints via INT 21H AH=09H.',
        codeSnippet: 'MOV AX, @DATA\nMOV DS, AX\nLEA DX, TICK_BANNER\nMOV AH, 09H\nINT 21H'
      },
      {
        stageNumber: 2,
        stageName: 'Read 32-Bit BIOS Timer Ticks (INT 1AH AH=00H)',
        summary: 'Query BIOS timer data area tick counter into CX:DX.',
        hardwareAction:
          'Executes INT 1AH with AH = 00H. BIOS reads 4-byte tick counter at 0040:006CH into CX (High Word) and DX (Low Word); AL indicates 24-hour rollover.',
        codeSnippet: 'MOV AH, 00H\nINT 1AH\n; CX:DX now holds 32-bit timer count'
      },
      {
        stageNumber: 3,
        stageName: 'Compute Hours from 32-Bit Tick Count',
        summary: 'Divide CX:DX by 65543 (ticks per hour) to obtain Hours quotient.',
        hardwareAction:
          'Performs 32-bit by 16-bit division (DX:AX / 65543). Quotient yields Hours; remainder represents remaining fractional-hour ticks.',
        codeSnippet: 'MOV AX, DX\nMOV DX, CX\nMOV BX, 65543\nDIV BX\nMOV HOURS, AX\nMOV REM_TICKS, DX'
      },
      {
        stageNumber: 4,
        stageName: 'Compute Minutes & Seconds',
        summary: 'Divide remaining ticks by 1092 for Minutes, and remainder by 18 for Seconds.',
        hardwareAction:
          'Divides remainder ticks by 1092 to obtain Minutes. Multiplies second-remainder by 10 and divides by 182 to obtain accurate Seconds.',
        codeSnippet: 'MOV AX, REM_TICKS\nMOV DX, 0\nMOV BX, 1092\nDIV BX\nMOV MINS, AX\n; Remaining ticks scaled to seconds\nMOV AX, DX\nMOV BX, 18\nDIV BX\nMOV SECS, AX'
      },
      {
        stageNumber: 5,
        stageName: 'Format & Print Derived Time',
        summary: 'Convert computed values to ASCII and display on screen.',
        hardwareAction:
          'Converts HOURS, MINS, SECS to ASCII digit pairs and displays formatted string via INT 21H AH=09H before returning control via AH=4CH.',
        codeSnippet: 'CALL FORMAT_AND_DISPLAY\nMOV AH, 4CH\nINT 21H'
      }
    ],
    instructionsTheory: [
      {
        mnemonic: 'INT 1AH (AH=00H)',
        syntax: 'MOV AH, 00H\nINT 1AH',
        role: 'Reads current BIOS clock tick counter into CX:DX (CX=High word, DX=Low word, AL=Rollover flag).',
        flagsAffected: 'None',
        detail:
          'Direct software interface to the 18.2 Hz BIOS timer interrupt service.'
      },
      {
        mnemonic: 'DIV (32-bit / 16-bit)',
        syntax: 'DIV reg16',
        role: 'Divides 32-bit numerator in DX:AX by 16-bit operand; AX = Quotient, DX = Remainder.',
        flagsAffected: 'CF, OF, SF, ZF, AF, PF (undefined)',
        detail:
          'Primary arithmetic engine used to scale 32-bit hardware ticks into human-readable hours and minutes.'
      },
      {
        mnemonic: 'MUL',
        syntax: 'MUL reg16',
        role: 'Multiplies AX by 16-bit register, placing 32-bit product into DX:AX.',
        flagsAffected: 'CF, OF',
        detail: 'Used for scaling fractional tick remainders by 10 for second precision.'
      }
    ],
    flagsTheory: [
      {
        flag: 'OF',
        fullName: 'Overflow Flag (Bit 11)',
        roleInProgram: 'Guarded during 32-bit division to prevent divide-by-zero or quotient overflow exceptions.',
        triggerCondition: 'Asserted if quotient exceeds 16-bit capacity (AX).'
      }
    ],
    dataFlowSummary:
      '8253/8254 PIT (18.2 Hz) -> BIOS INT 08H -> BDA (0040:006CH) -> INT 1AH AH=00H -> CX:DX Ticks -> Div / 65543 -> Hours -> Div / 1092 -> Minutes -> Div / 18 -> Seconds -> Display.',
    bestPractices: [
      'Account for the non-integer 18.2065 Hz tick frequency by scaling fractional remainders (multiply by 10 before dividing by 182) to avoid clock drift.',
      'Check AL return code after INT 1AH to detect 24-hour midnight boundary rollovers.'
    ]
  },

  exp_stepper1: {
    overview:
      'This program interfaces a 4-phase unipolar stepper motor to the 8086 microprocessor using an Intel 8255 Programmable Peripheral Interface (PPI) and ULN2003 driver, driving the motor in the clockwise (CW) direction with variable step-size and rotational angle control.',
    memoryAndSegmentation:
      'The Data Segment defines the 4-byte 2-phase full-step excitation lookup table CW_TABLE (09H, 0AH, 06H, 05H), the 16-bit variable step size STEP_COUNT, and the speed regulation constant DELAY_VAL. Port A (00C0H) and CWR (00C6H) addresses are assigned via EQU directives. The Code Segment houses the commutation sequence loop and software delay subroutine.',
    logicStages: [
      {
        stageNumber: 1,
        stageName: '8255 PPI Initialization',
        summary: 'Configure 8255 PPI in Mode 0 with Port A as an 8-bit output port.',
        hardwareAction:
          'Loads DX with CWR address (00C6H) and AL with control word 80H (10000000B = Mode 0, Port A/B/C as outputs). Executes OUT DX, AL to program the 8255 internal control logic.',
        codeSnippet: 'MOV DX, 00C6H\nMOV AL, 80H\nOUT DX, AL'
      },
      {
        stageNumber: 2,
        stageName: 'Variable Step Count & Pointer Initialization',
        summary: 'Load target step count into CX and initialize CW_TABLE index pointer.',
        hardwareAction:
          'Loads loop counter CX with target variable step count (e.g., 200 for 360° rotation), points SI to CW_TABLE (DS:[SI]), and sets commutation counter BX = 4.',
        codeSnippet: 'MOV CX, STEP_COUNT\nCW_CYCLE:\n  LEA SI, CW_TABLE\n  MOV BX, 4'
      },
      {
        stageNumber: 3,
        stageName: 'Output Phase Excitation Code',
        summary: 'Send 4-bit phase excitation pattern to Port A to energize stator coils.',
        hardwareAction:
          'Reads excitation byte from [SI] into AL, loads DX with Port A address (00C0H), and executes OUT DX, AL. The ULN2003 driver turns ON the corresponding pair of 12V stator windings.',
        codeSnippet: 'STEP_LOOP:\n  MOV AL, [SI]\n  MOV DX, 00C0H\n  OUT DX, AL'
      },
      {
        stageNumber: 4,
        stageName: 'Software Rotor Settling Delay',
        summary: 'Execute calibrated software loop to allow rotor mechanical step completion.',
        hardwareAction:
          'Invokes DELAY_ROUTINE which executes a nested loop with DELAY_VAL iterations, keeping current coils energized to stabilize the rotor at the new step position.',
        codeSnippet: 'CALL DELAY_ROUTINE'
      },
      {
        stageNumber: 5,
        stageName: 'Step Decrement & Commutation Cycle',
        summary: 'Advance phase pointer, decrement CX, and repeat 4-step sequence until CX = 0.',
        hardwareAction:
          'Increments SI to next table entry, decrements total step count CX. If CX = 0, jumps to program exit. Decrements cycle counter BX; if BX ≠ 0 loops to next step, otherwise resets SI to CW_TABLE start.',
        codeSnippet: 'INC SI\nDEC CX\nJZ EXIT_PROGRAM\nDEC BX\nJNZ STEP_LOOP\nJMP CW_CYCLE'
      },
      {
        stageNumber: 6,
        stageName: 'DOS Exit',
        summary: 'Cleanly terminate program and return control to DOS.',
        hardwareAction: 'Loads AH = 4CH and executes INT 21H.',
        codeSnippet: 'EXIT_PROGRAM:\n  MOV AH, 4CH\n  INT 21H'
      }
    ],
    instructionsTheory: [
      {
        mnemonic: 'OUT DX, AL',
        syntax: 'OUT DX, AL',
        role: 'Outputs 8-bit data in AL to the I/O port address specified in 16-bit register DX.',
        flagsAffected: 'None',
        detail: 'Essential for variable-port peripheral I/O addressing (addresses > 0FFH or dynamic port selection).'
      },
      {
        mnemonic: 'LEA',
        syntax: 'LEA reg16, memory',
        role: 'Loads effective 16-bit offset address of memory variable into destination register.',
        flagsAffected: 'None',
        detail: 'Used to initialize SI pointer to the beginning of CW_TABLE.'
      },
      {
        mnemonic: 'LOOP',
        syntax: 'LOOP label',
        role: 'Decrements CX by 1; if CX ≠ 0, performs short jump to label.',
        flagsAffected: 'None',
        detail: 'Used inside the software delay subroutine to create calibrated millisecond delays.'
      },
      {
        mnemonic: 'CALL / RET',
        syntax: 'CALL proc_name / RET',
        role: 'Pushes return IP address onto stack, jumps to subroutine, and pops IP upon return.',
        flagsAffected: 'None',
        detail: 'Modularizes the motor speed regulation delay subroutine.'
      }
    ],
    flagsTheory: [
      {
        flag: 'ZF',
        fullName: 'Zero Flag (Bit 6)',
        roleInProgram: 'Monitored by JZ EXIT_PROGRAM when decrementing remaining step counter CX.',
        triggerCondition: 'Asserted (ZF = 1) when CX reaches 0, signaling exact completion of the requested angular displacement.'
      }
    ],
    dataFlowSummary:
      'Target Steps CX -> 8255 CWR (80H) -> CW_TABLE [09H, 0AH, 06H, 05H] -> Port A (00C0H) -> ULN2003 Darlington Array -> Motor Stator Windings -> Shaft Clockwise Rotation (+1.8°/step).',
    bestPractices: [
      'Always initialize 8255 CWR prior to issuing OUT instructions to Port A.',
      'Ensure software delay between successive steps is sufficiently long (10-30 ms) to avoid rotor inertia slip and missed steps.',
      'Use high-torque 2-phase excitation (09H, 0AH, 06H, 05H) for stable open-loop positioning.'
    ]
  },

  exp_stepper2: {
    overview:
      'This program interfaces a 4-phase unipolar stepper motor to the 8086 microprocessor using an Intel 8255 PPI and ULN2003 driver, driving the motor in the anti-clockwise (CCW / counter-clockwise) direction with user-selectable variable step-sizes.',
    memoryAndSegmentation:
      'The Data Segment defines the inverted 4-byte 2-phase full-step excitation sequence table CCW_TABLE (05H, 06H, 0AH, 09H), the variable step size STEP_COUNT, and delay constant DELAY_VAL. Port A (00C0H) and CWR (00C6H) addresses are assigned via EQU directives.',
    logicStages: [
      {
        stageNumber: 1,
        stageName: '8255 PPI Initialization',
        summary: 'Configure 8255 PPI in Mode 0 with Port A as an 8-bit output port.',
        hardwareAction:
          'Loads DX with CWR address (00C6H) and AL with control word 80H. Executes OUT DX, AL to configure 8255 Port A as Mode 0 output.',
        codeSnippet: 'MOV DX, 00C6H\nMOV AL, 80H\nOUT DX, AL'
      },
      {
        stageNumber: 2,
        stageName: 'Variable Step Count & CCW Pointer Setup',
        summary: 'Load target step count into CX and point SI to CCW_TABLE.',
        hardwareAction:
          'Loads loop counter CX with target variable step count (e.g., 200 for 360° CCW), points SI to CCW_TABLE (05H, 06H, 0AH, 09H), and sets BX = 4.',
        codeSnippet: 'MOV CX, STEP_COUNT\nCCW_CYCLE:\n  LEA SI, CCW_TABLE\n  MOV BX, 4'
      },
      {
        stageNumber: 3,
        stageName: 'Output Inverted Phase Pattern',
        summary: 'Send reverse excitation code to Port A to pull rotor anti-clockwise.',
        hardwareAction:
          'Reads reverse excitation byte from [SI] into AL, loads DX with Port A address (00C0H), and executes OUT DX, AL. Energizes stator coils in reverse sequence (DA -> CD -> BC -> AB).',
        codeSnippet: 'STEP_LOOP:\n  MOV AL, [SI]\n  MOV DX, 00C0H\n  OUT DX, AL'
      },
      {
        stageNumber: 4,
        stageName: 'Rotor Settling Delay',
        summary: 'Execute software delay subroutine to allow counter-clockwise step settling.',
        hardwareAction:
          'Calls DELAY_ROUTINE to keep reverse stator field active while the rotor mechanically settles into new angular position.',
        codeSnippet: 'CALL DELAY_ROUTINE'
      },
      {
        stageNumber: 5,
        stageName: 'Reverse Commutation Cycle Loop',
        summary: 'Advance SI pointer, decrement CX, and repeat until all requested steps are completed.',
        hardwareAction:
          'Increments SI, decrements CX. If CX = 0 jumps to exit. Decrements BX; if BX ≠ 0 loops to output next phase, else resets SI to CCW_TABLE start.',
        codeSnippet: 'INC SI\nDEC CX\nJZ EXIT_PROGRAM\nDEC BX\nJNZ STEP_LOOP\nJMP CCW_CYCLE'
      },
      {
        stageNumber: 6,
        stageName: 'DOS Exit',
        summary: 'Cleanly terminate program and return control to DOS.',
        hardwareAction: 'Loads AH = 4CH and executes INT 21H.',
        codeSnippet: 'EXIT_PROGRAM:\n  MOV AH, 4CH\n  INT 21H'
      }
    ],
    instructionsTheory: [
      {
        mnemonic: 'OUT DX, AL',
        syntax: 'OUT DX, AL',
        role: 'Outputs 8-bit reverse phase pattern to 8255 Port A specified by DX.',
        flagsAffected: 'None',
        detail: 'Sends 05H, 06H, 0AH, 09H sequentially to the motor driver.'
      },
      {
        mnemonic: 'DEC',
        syntax: 'DEC reg16',
        role: 'Subtracts 1 from register, updating zero flag ZF.',
        flagsAffected: 'OF, SF, ZF, AF, PF',
        detail: 'Used to decrement both remaining step counter CX and 4-step cycle counter BX.'
      },
      {
        mnemonic: 'JNZ / JZ',
        syntax: 'JNZ label / JZ label',
        role: 'Conditional branch based on Zero Flag state.',
        flagsAffected: 'None',
        detail: 'JZ branches to exit when all steps complete; JNZ maintains the 4-phase commutation cycle.'
      },
      {
        mnemonic: 'PUSH / POP',
        syntax: 'PUSH CX / POP CX',
        role: 'Saves and restores CX on the stack inside the delay subroutine.',
        flagsAffected: 'None',
        detail: 'Prevents the software delay loop from corrupting the outer step counter CX.'
      }
    ],
    flagsTheory: [
      {
        flag: 'ZF',
        fullName: 'Zero Flag (Bit 6)',
        roleInProgram: 'Monitored by JZ EXIT_PROGRAM when decrementing remaining step counter CX.',
        triggerCondition: 'Asserted (ZF = 1) when CX reaches 0, signaling exact completion of the requested anti-clockwise displacement.'
      }
    ],
    dataFlowSummary:
      'Target Steps CX -> 8255 CWR (80H) -> CCW_TABLE [05H, 06H, 0AH, 09H] -> Port A (00C0H) -> ULN2003 Driver -> Motor Stator Windings -> Shaft Anti-Clockwise Rotation (-1.8°/step).',
    bestPractices: [
      'Inverting the lookup table from [09H, 0AH, 06H, 05H] to [05H, 06H, 0AH, 09H] reliably reverses rotor rotation without altering hardware wiring.',
      'Always save and restore register state (PUSH CX / POP CX) when using delay routines.',
      'Ensure flyback clamp diodes are properly biased on the ULN2003 to absorb reverse inductive surges.'
    ]
  },

  exp_adc: {
    overview:
      'This program interfaces an 8-bit Successive Approximation Analog-to-Digital Converter (ADC 0808) with the 8086 microprocessor via the 8255 Programmable Peripheral Interface. It configures 8255 PPI in Mode 0 (98H), selects analog channel IN0 on Port B, issues an active-high Start of Conversion (SOC) pulse on PC0, polls End of Conversion (EOC) on PC7 until completion, asserts Output Enable (OE) on PC2, and reads the 8-bit digital result from Port A to compute the physical analog voltage in millivolts.',
    memoryAndSegmentation:
      'The data segment stores variables DIGITAL_VAL (1 byte) and VOLTAGE_MV (2 bytes). 8255 PPI I/O ports are addressed at base address 00C0H using 16-bit DX register addressing.',
    logicStages: [
      {
        stageNumber: 1,
        stageName: '8255 PPI Mixed Mode 0 Configuration',
        summary: 'Send control word 98H to 8255 CWR (00C6H).',
        hardwareAction:
          'Configures Port A as Input (D0-D7), Port B as Output (ADD A-C), Port C Upper as Input (PC7 / EOC), and Port C Lower as Output (PC0/SOC, PC2/OE).',
        codeSnippet: 'MOV DX, 00C6H\nMOV AL, 98H\nOUT DX, AL'
      },
      {
        stageNumber: 2,
        stageName: 'Channel Selection & Conversion Start',
        summary: 'Select analog channel IN0 on Port B and pulse ALE/SOC on PC0.',
        hardwareAction:
          'Writes 00H to Port B (00C2H). Pulses PC0 (00C4H) HIGH then LOW with a NOP delay to trigger the SAR conversion cycle.',
        codeSnippet: 'MOV DX, 00C2H\nMOV AL, 00H\nOUT DX, AL\nMOV DX, 00C4H\nMOV AL, 01H\nOUT DX, AL\nNOP\nMOV AL, 00H\nOUT DX, AL'
      },
      {
        stageNumber: 3,
        stageName: 'EOC Status Polling Loop',
        summary: 'Poll Port C Bit 7 until EOC transitions to HIGH (1).',
        hardwareAction:
          'Continuously reads Port C (00C4H) and tests Bit 7 with TEST AL, 80H. Loops while ZF = 1 until SAR completes (~100 µs).',
        codeSnippet: 'CHECK_EOC:\nIN AL, DX\nTEST AL, 80H\nJZ CHECK_EOC'
      },
      {
        stageNumber: 4,
        stageName: 'Assert OE & Latch Digital Data',
        summary: 'Assert OE on PC2, read Port A (00C0H), and store into DIGITAL_VAL.',
        hardwareAction:
          'Sets PC2 = 1 to enable ADC output buffers. Reads 8-bit digital byte from Port A into AL, then resets PC2 = 0.',
        codeSnippet: 'MOV AL, 04H\nOUT DX, AL\nMOV DX, 00C0H\nIN AL, DX\nMOV [DIGITAL_VAL], AL\nMOV DX, 00C4H\nMOV AL, 00H\nOUT DX, AL'
      },
      {
        stageNumber: 5,
        stageName: 'Voltage Scaling & DOS Return',
        summary: 'Scale digital code to millivolts (AX = AL * 5000 / 255) and exit.',
        hardwareAction:
          'Multiplies digital code by 5000 mV and divides by 255, saving the reconstructed millivolts into VOLTAGE_MV.',
        codeSnippet: 'MOV AH, 00H\nMOV BX, 5000\nMUL BX\nMOV BX, 255\nDIV BX\nMOV [VOLTAGE_MV], AX\nMOV AX, 4C00H\nINT 21H'
      }
    ],
    instructionsTheory: [
      {
        mnemonic: 'OUT',
        syntax: 'OUT DX, AL',
        role: 'Outputs byte from AL to the I/O port address specified in DX.',
        flagsAffected: 'None',
        detail: 'Sends control words, channel addresses, and handshaking pulses to the 8255 PPI.'
      },
      {
        mnemonic: 'IN',
        syntax: 'IN AL, DX',
        role: 'Reads byte from the I/O port address in DX into AL.',
        flagsAffected: 'None',
        detail: 'Used to poll Port C EOC status and read converted 8-bit data from Port A.'
      },
      {
        mnemonic: 'TEST',
        syntax: 'TEST AL, 80H',
        role: 'Performs non-destructive bitwise AND between AL and 80H to evaluate Bit 7.',
        flagsAffected: 'ZF, SF, PF updated; CF=0, OF=0',
        detail: 'Checks if ADC End of Conversion (PC7) is set to 1 without destroying AL content.'
      }
    ],
    flagsTheory: [
      {
        flag: 'ZF',
        fullName: 'Zero Flag (Bit 6)',
        roleInProgram: 'Determines whether EOC polling loop continues or exits.',
        triggerCondition: 'ZF = 1 while Bit 7 of Port C is 0 (conversion in progress); ZF = 0 when Bit 7 transitions to 1 (conversion complete).'
      }
    ],
    dataFlowSummary:
      'Analog Input (0 to +5.0V) -> ADC0808 SAR Quantization -> 8-bit Data Bus -> 8255 Port A -> AL Register -> DIGITAL_VAL -> Mathematical Scaling -> VOLTAGE_MV in RAM.',
    bestPractices: [
      'Always poll EOC instead of using fixed software delays to ensure robust synchronization across varying clock frequencies.',
      'Ensure a clean, low-noise +5.00V analog reference voltage Vref(+) to maintain conversion accuracy within ±1/2 LSB.',
      'De-assert Output Enable (OE) after reading to prevent bus contention on Port A.'
    ]
  },

  exp_dac: {
    overview:
      'This program interfaces an 8-bit Digital-to-Analog Converter (DAC 0800) with the 8086 microprocessor via 8255 PPI Port A to synthesize Square, Triangular, and Step (Staircase) waveforms. An operational amplifier (OP-07/LM741) in an inverting I-to-V configuration converts the R-2R ladder current outputs into continuous 0.0V to +5.0V voltage signals.',
    memoryAndSegmentation:
      'Data segment holds waveform labels and frequency calibration constants. 8255 PPI Port A (00C0H) and CWR (00C6H) are accessed via DX I/O register addressing.',
    logicStages: [
      {
        stageNumber: 1,
        stageName: '8255 PPI Port A Output Initialization',
        summary: 'Write control word 80H to CWR (00C6H).',
        hardwareAction:
          'Configures 8255 PPI in Mode 0 with Port A as an 8-bit output port connected to DAC0800 digital inputs D0-D7.',
        codeSnippet: 'MOV DX, 00C6H\nMOV AL, 80H\nOUT DX, AL\nMOV DX, 00C0H'
      },
      {
        stageNumber: 2,
        stageName: 'Square Wave Synthesis Loop',
        summary: 'Alternate between 00H (0V) and FFH (+5V) with symmetric delays.',
        hardwareAction:
          'Outputs 00H to Port A, executes DELAY_HALF, outputs FFH to Port A, executes DELAY_HALF, and repeats.',
        codeSnippet: 'SQ_LOOP:\nMOV AL, 00H\nOUT DX, AL\nCALL DELAY_HALF\nMOV AL, 0FFH\nOUT DX, AL\nCALL DELAY_HALF\nJMP SQ_LOOP'
      },
      {
        stageNumber: 3,
        stageName: 'Triangular Wave Synthesis Loop',
        summary: 'Linear ramp-up (00H to FFH) followed by linear ramp-down (FFH to 00H).',
        hardwareAction:
          'Incrementally sweeps AL from 00H to FFH using INC AL, then decrements from FFH to 00H using DEC AL with micro-delays.',
        codeSnippet: 'TRI_UP:\nOUT DX, AL\nINC AL\nCALL DELAY_MICRO\nJNZ TRI_UP\nTRI_DN:\nOUT DX, AL\nDEC AL\nCALL DELAY_MICRO\nJNZ TRI_DN\nJMP TRI_UP'
      },
      {
        stageNumber: 4,
        stageName: 'Step Signal (Staircase) Synthesis Loop',
        summary: 'Generate 6 discrete voltage levels (0V, 1V, 2V, 3V, 4V, 5V) with plateau hold times.',
        hardwareAction:
          'Outputs current step code AL, executes ~5 ms hold delay, adds step size 33H (ADD AL, 33H), and repeats until overflow.',
        codeSnippet: 'STAIR_LOOP:\nOUT DX, AL\nCALL DELAY_HOLD\nADD AL, 33H\nJNC STAIR_LOOP\nJMP STAIR_LOOP'
      }
    ],
    instructionsTheory: [
      {
        mnemonic: 'OUT',
        syntax: 'OUT DX, AL',
        role: 'Outputs the digital sample byte in AL to 8255 Port A at I/O address DX.',
        flagsAffected: 'None',
        detail: 'Directly drives DAC0800 inputs to generate instantaneous output current step.'
      },
      {
        mnemonic: 'INC',
        syntax: 'INC AL',
        role: 'Increments AL by 1 to advance triangular ramp up to the next quantization level.',
        flagsAffected: 'OF, SF, ZF, AF, PF',
        detail: 'Used in triangular wave generator for linear upward voltage progression.'
      },
      {
        mnemonic: 'ADD',
        syntax: 'ADD AL, 33H',
        role: 'Increases AL by 33H (51 decimal ≈ 1.00V step) for staircase plateau generation.',
        flagsAffected: 'CF, OF, SF, ZF, AF, PF',
        detail: 'Carry Flag (CF = 1) detects when the top +5.0V step is exceeded to reset waveform.'
      }
    ],
    flagsTheory: [
      {
        flag: 'CF',
        fullName: 'Carry Flag (Bit 0)',
        roleInProgram: 'Detects top plateau overflow in staircase waveform generation.',
        triggerCondition: 'Set to 1 when ADD AL, 33H exceeds 255 (0FFH), signaling completion of one full staircase cycle.'
      },
      {
        flag: 'ZF',
        fullName: 'Zero Flag (Bit 6)',
        roleInProgram: 'Controls triangular ramp-up and ramp-down peak boundary detection.',
        triggerCondition: 'Set to 1 when INC AL wraps to 00H or DEC AL reaches 00H.'
      }
    ],
    dataFlowSummary:
      '8086 Digital Pattern Stream (AL) -> 8255 Port A (00C0H) -> DAC 0800 R-2R Current Matrix -> OP-07 I-to-V Operational Amplifier -> Continuous Analog Waveform Output (0 to +5.0V).',
    bestPractices: [
      'Maintain strictly symmetrical delay loops in square and triangular generators to avoid waveform skew and DC offset.',
      'Use high-precision metal film resistors (0.1% tolerance) for Rf and Rref in the I-to-V converter stage.',
      'Connect an oscilloscope Channel 1 with 10X probe to verify amplitude (5.0 Vp-p) and frequency linearity.'
    ]
  },

  exp5: {
    overview:
      'This program performs high-speed block data transfer (memory copy) of a 10-byte block from a source memory buffer to a destination memory buffer using the hardware-accelerated block transfer instruction REP MOVSB.',
    memoryAndSegmentation:
      'Source buffer SRC_BLOCK and destination buffer DEST_BLOCK reside in the Data Segment. Source is addressed via DS:SI; destination is addressed via ES:DI. Direction Flag (DF = 0 via CLD) ensures forward linear memory traversal.',
    logicStages: [
      {
        stageNumber: 1,
        stageName: 'Segment & Pointer Configuration',
        summary: 'Set DS and ES, point SI to SRC_BLOCK, DI to DEST_BLOCK, and CX = 10.',
        hardwareAction:
          'Loads DS = @DATA and ES = @DATA. SI is loaded with offset of SRC_BLOCK, DI with offset of DEST_BLOCK, CX = 10, and Direction Flag is cleared (CLD).',
        codeSnippet: 'MOV AX, @DATA\nMOV DS, AX\nMOV ES, AX\nLEA SI, SRC_BLOCK\nLEA DI, DEST_BLOCK\nMOV CX, 10\nCLD'
      },
      {
        stageNumber: 2,
        stageName: 'Execute Block Transfer (REP MOVSB)',
        summary: 'Transfer 10 consecutive bytes from DS:SI to ES:DI in hardware.',
        hardwareAction:
          'In hardware: copies byte from DS:[SI] to ES:[DI], increments SI (SI++), increments DI (DI++), and decrements CX (CX--). Repeats at hardware bus speed until CX = 0.',
        codeSnippet: 'REP MOVSB'
      },
      {
        stageNumber: 3,
        stageName: 'DOS Exit',
        summary: 'Return to operating system via INT 21H Service 4CH.',
        hardwareAction: 'Loads AH = 4CH and invokes INT 21H.',
        codeSnippet: 'MOV AH, 4CH\nINT 21H'
      }
    ],
    instructionsTheory: [
      {
        mnemonic: 'MOVSB',
        syntax: 'MOVSB',
        role: 'Moves byte from memory address DS:SI to ES:DI, then autoincrements or autodecrements SI and DI.',
        flagsAffected: 'None',
        detail:
          'Direct memory-to-memory transfer without requiring an intermediate CPU register.'
      },
      {
        mnemonic: 'REP',
        syntax: 'REP MOVSB',
        role: 'Repeats MOVSB instruction unconditionally until CX decrements to 0.',
        flagsAffected: 'None',
        detail:
          'Achieves maximum bus transfer throughput for bulk data replication.'
      },
      {
        mnemonic: 'CLD',
        syntax: 'CLD',
        role: 'Clears the Direction Flag (DF = 0) for forward pointer advancement.',
        flagsAffected: 'DF (cleared to 0)',
        detail: 'Ensures SI and DI increment towards higher memory addresses during block copy.'
      }
    ],
    flagsTheory: [
      {
        flag: 'DF',
        fullName: 'Direction Flag (Bit 10)',
        roleInProgram: 'Controls direction of address pointer advancement (0 = auto-increment, 1 = auto-decrement).',
        triggerCondition: 'Cleared to 0 via CLD instruction for forward non-overlapping block transfer.'
      }
    ],
    dataFlowSummary:
      'SRC_BLOCK [10H, 20H, 30H, 40H, 50H, 60H, 70H, 80H, 90H, 99H] copied directly to DEST_BLOCK [10H..99H] in 10 consecutive hardware bus cycles.',
    bestPractices: [
      'For non-overlapping blocks, forward copy (CLD + REP MOVSB) is optimal.',
      'For overlapping memory blocks where destination lies inside source, use backward copy (STD + REP MOVSB starting from the highest offset) to prevent overwriting uncopied source data.'
    ]
  },

  exp_8051_arith: {
    overview:
      'This 8051 Assembly Language Program performs essential single-byte and multi-byte arithmetic operations: 8-bit binary addition with carry, 16-bit addition with ripple carry (ADDC), 8-bit subtraction with borrow (SUBB), and packed BCD addition with Decimal Adjust (DA A).',
    memoryAndSegmentation:
      'Operands reside in 8051 Internal Data RAM locations 30H-39H. Results and status flags (sum, difference, carry/borrow status) are saved to scratchpad RAM locations 40H-48H. The Program Counter (PC) begins at Reset Vector 0000H and branches to 0030H past interrupt vectors.',
    logicStages: [
      {
        stageNumber: 1,
        stageName: 'Program Origin & Reset Vector',
        summary: 'Direct CPU to execute above the 8051 interrupt vector table.',
        hardwareAction: 'PC loads 0000H, executes LJMP START to branch past 0003H-0023H vector space.',
        codeSnippet: 'ORG 0000H\n  LJMP START\nORG 0030H\nSTART:'
      },
      {
        stageNumber: 2,
        stageName: '8-Bit Binary Addition with Carry',
        summary: 'Adds two 8-bit integers from RAM 30H and 31H, storing 8-bit sum and carry out.',
        hardwareAction: 'ALU performs A + 31H; writes sum to RAM 40H; branches on CY to store carry.',
        codeSnippet: 'MOV A, 30H\nADD A, 31H\nMOV 40H, A\nJNC SKIP1\nMOV 41H, #01H\nSKIP1:'
      },
      {
        stageNumber: 3,
        stageName: '16-Bit Ripple-Carry Multi-Byte Addition',
        summary: 'Adds two 16-bit numbers (Word1 at 33H:32H, Word2 at 35H:34H) propagating carry.',
        hardwareAction: 'CLR C ensures initial CY=0; adds lower bytes with ADD, then upper bytes with ADDC.',
        codeSnippet: 'CLR C\nMOV A, 32H\nADD A, 34H\nMOV 42H, A\nMOV A, 33H\nADDC A, 35H\nMOV 43H, A'
      },
      {
        stageNumber: 4,
        stageName: '8-Bit Subtraction with Borrow',
        summary: 'Subtracts subtrahend from minuend using SUBB with pre-cleared CY.',
        hardwareAction: 'CLR C clears borrow flag; ALU computes A - 37H - 0; stores difference in 45H.',
        codeSnippet: 'CLR C\nMOV A, 36H\nSUBB A, 37H\nMOV 45H, A\nJNC SKIP2\nMOV 46H, #01H\nSKIP2:'
      },
      {
        stageNumber: 5,
        stageName: 'Packed BCD Addition & Decimal Adjust',
        summary: 'Adds two 2-digit BCD numbers and executes DA A for decimal correction.',
        hardwareAction: 'Binary ADD sets AC=1; DA A adds 06H/60H to produce valid packed BCD in 47H.',
        codeSnippet: 'MOV A, 38H\nADD A, 39H\nDA A\nMOV 47H, A'
      },
      {
        stageNumber: 6,
        stageName: 'Infinite Halt Loop',
        summary: 'Traps CPU in endless self-loop to preserve RAM and SFR state.',
        hardwareAction: 'Executes SJMP $ indefinitely.',
        codeSnippet: 'HALT: SJMP HALT\nEND'
      }
    ],
    instructionsTheory: [
      {
        mnemonic: 'ADD A, src',
        syntax: 'ADD A, direct / #data / @Ri / Rn',
        role: 'Adds source byte to Accumulator A (A ← A + src).',
        flagsAffected: 'CY, AC, OV, P',
        detail: 'Updates Carry Flag (CY) if unsigned sum > 255 (0FFH).'
      },
      {
        mnemonic: 'ADDC A, src',
        syntax: 'ADDC A, src',
        role: 'Adds source byte and Carry flag to Accumulator A (A ← A + src + CY).',
        flagsAffected: 'CY, AC, OV, P',
        detail: 'Enables multi-precision addition by chaining carry bits across higher-order bytes.'
      },
      {
        mnemonic: 'SUBB A, src',
        syntax: 'SUBB A, src',
        role: 'Subtracts source byte and Carry (Borrow) from Accumulator A (A ← A - src - CY).',
        flagsAffected: 'CY, AC, OV, P',
        detail: 'Mandates `CLR C` prior to single-precision subtraction to eliminate false borrow.'
      },
      {
        mnemonic: 'DA A',
        syntax: 'DA A',
        role: 'Decimal Adjust Accumulator for packed BCD addition.',
        flagsAffected: 'CY',
        detail: 'Adds 06H if lower nibble > 9 or AC=1; adds 60H if upper nibble > 9 or CY=1.'
      }
    ],
    flagsTheory: [
      {
        flag: 'CY',
        fullName: 'Carry / Borrow Flag (PSW.7)',
        roleInProgram: 'Monitored by JNC for 8-bit/16-bit carry propagation and acts as borrow during SUBB.',
        triggerCondition: 'Set to 1 when addition overflows 8 bits (>255) or when subtraction requires a borrow (minuend < subtrahend).'
      },
      {
        flag: 'AC',
        fullName: 'Auxiliary Carry Flag (PSW.6)',
        roleInProgram: 'Directs `DA A` to add 06H to lower nibble.',
        triggerCondition: 'Set to 1 when addition produces a carry from bit 3 into bit 4.'
      },
      {
        flag: 'OV',
        fullName: 'Overflow Flag (PSW.2)',
        roleInProgram: 'Indicates signed 2\'s complement arithmetic overflow (-128 to +127 range violation).',
        triggerCondition: 'Set if carry into sign bit (bit 7) differs from carry out of sign bit.'
      }
    ],
    dataFlowSummary:
      'Operands in RAM [30H..39H] -> Accumulator A -> ALU (ADD, ADDC, SUBB, DA A) -> PSW Flags Updated -> Results Written to RAM [40H..48H].',
    bestPractices: [
      'Always execute `CLR C` immediately prior to `SUBB A, src`.',
      'Use `DA A` exclusively after `ADD` or `ADDC` instructions; `DA A` does NOT work following subtraction.',
      'Maintain standard Little-Endian or Big-Endian memory conventions when processing multi-byte words.'
    ]
  },

  exp_8051_muldiv: {
    overview:
      'This 8051 Assembly Language Program performs unsigned 8-bit multiplication using `MUL AB` and integer division using `DIV AB`, evaluating product register splitting across B:A, quotient/remainder placement, and Overflow Flag (OV) exception reporting.',
    memoryAndSegmentation:
      'Multiplication and division exclusively use Accumulator A and Register B. Operands are fetched from RAM 30H-33H, and products, quotients, and remainders are stored in RAM 40H-45H.',
    logicStages: [
      {
        stageNumber: 1,
        stageName: 'Setup & Operand Initialization',
        summary: 'Initialize multiplicand, multiplier, dividend, and divisor in internal RAM.',
        hardwareAction: 'Writes test values F5H (245D), 18H (24D), 0AH (10D) to RAM locations 30H-33H.',
        codeSnippet: 'MOV 30H, #0F5H\nMOV 31H, #18H\nMOV 32H, #0F5H\nMOV 33H, #0AH'
      },
      {
        stageNumber: 2,
        stageName: 'Hardware Multiplication (MUL AB)',
        summary: 'Load A and B with operands and execute single-instruction 4-cycle multiplication.',
        hardwareAction: 'ALU multiplies A × B; places low byte in A (F8H) and high byte in B (16H). Sets OV=1 because B ≠ 0.',
        codeSnippet: 'MOV A, 30H\nMOV B, 31H\nMUL AB\nMOV 40H, A\nMOV 41H, B\nJNB OV, NO_OV\nMOV 42H, #01H\nNO_OV:'
      },
      {
        stageNumber: 3,
        stageName: 'Hardware Division (DIV AB)',
        summary: 'Load A (dividend) and B (divisor) and execute single-instruction 4-cycle division.',
        hardwareAction: 'ALU divides A by B; quotient in A (18H = 24D), remainder in B (05H = 5D). OV is cleared to 0.',
        codeSnippet: 'MOV A, 32H\nMOV B, 33H\nDIV AB\nMOV 43H, A\nMOV 44H, B'
      },
      {
        stageNumber: 4,
        stageName: 'Division by Zero Verification',
        summary: 'Demonstrates hardware exception flag OV when dividing by zero.',
        hardwareAction: 'Loads B = 00H, calls DIV AB; hardware asserts OV = 1 (PSW.2 = 1).',
        codeSnippet: 'MOV A, #64H\nMOV B, #00H\nDIV AB\nMOV 45H, PSW'
      },
      {
        stageNumber: 5,
        stageName: 'Program Termination',
        summary: 'Trap CPU in self-loop.',
        hardwareAction: 'Executes SJMP $.',
        codeSnippet: 'SJMP $\nEND'
      }
    ],
    instructionsTheory: [
      {
        mnemonic: 'MUL AB',
        syntax: 'MUL AB',
        role: 'Multiplies unsigned 8-bit values in A and B (Product = B:A).',
        flagsAffected: 'OV, CY (CY always cleared to 0)',
        detail: 'Low 8 bits of product remain in A; upper 8 bits placed in B. OV=1 if product > 255 (B ≠ 0).'
      },
      {
        mnemonic: 'DIV AB',
        syntax: 'DIV AB',
        role: 'Divides unsigned 8-bit dividend in A by unsigned 8-bit divisor in B.',
        flagsAffected: 'OV, CY (CY always cleared to 0)',
        detail: 'Quotient placed in A; remainder placed in B. OV=1 if divisor B was 00H.'
      },
      {
        mnemonic: 'JB / JNB',
        syntax: 'JB bit, label / JNB bit, label',
        role: 'Direct bit test conditional branch.',
        flagsAffected: 'None',
        detail: 'Used with OV (`JB OV, ERROR`) to catch overflow or division-by-zero exceptions.'
      }
    ],
    flagsTheory: [
      {
        flag: 'OV',
        fullName: 'Overflow Flag (PSW.2)',
        roleInProgram: 'Signals 16-bit product size in MUL AB (B > 0) and division-by-zero error in DIV AB (B = 0).',
        triggerCondition: 'Set to 1 when MUL result > 255 or when DIV divisor B = 00H.'
      },
      {
        flag: 'CY',
        fullName: 'Carry Flag (PSW.7)',
        roleInProgram: 'Cleared unconditionally by both MUL AB and DIV AB.',
        triggerCondition: 'Always 0 after MUL and DIV.'
      }
    ],
    dataFlowSummary:
      'Multiplicand/Multiplier in A & B -> MUL AB -> Product Low in A, Product High in B -> RAM [40H..41H]. Dividend/Divisor in A & B -> DIV AB -> Quotient in A, Remainder in B -> RAM [43H..44H].',
    bestPractices: [
      'Remember that both MUL AB and DIV AB take 4 machine cycles (48 clock cycles) to execute.',
      'Always test `OV` flag after DIV AB before using the quotient if divisor values are dynamic.',
      'Never rely on the previous Carry Flag value after executing MUL AB or DIV AB.'
    ]
  },

  exp_8051_logic: {
    overview:
      'This 8051 Assembly Language Program demonstrates byte-level logical manipulation (ANL, ORL, XRL, CPL), nibble swapping (SWAP), rotation (RL, RR), and bit-addressable Boolean logic using the 8051 Boolean Processor.',
    memoryAndSegmentation:
      'Operands are loaded into Accumulator A and tested against internal bit-addressable RAM (20H-2FH) and scratchpad RAM (30H-47H).',
    logicStages: [
      {
        stageNumber: 1,
        stageName: 'Test Operand Initialization',
        summary: 'Load sample bit pattern A5H (1010 0101B) into Accumulator A.',
        hardwareAction: 'Moves literal #0A5H into RAM 30H and Accumulator A.',
        codeSnippet: 'MOV 30H, #0A5H\nMOV A, 30H'
      },
      {
        stageNumber: 2,
        stageName: 'Bitwise Logical AND (Masking)',
        summary: 'Mask upper nibble to 0000B using immediate mask #0FH.',
        hardwareAction: 'ALU performs A5H AND 0FH = 05H; stores result in RAM 40H.',
        codeSnippet: 'ANL A, #0FH\nMOV 40H, A'
      },
      {
        stageNumber: 3,
        stageName: 'Bitwise Logical OR (Bit Setting)',
        summary: 'Force upper nibble to 1111B using immediate mask #0F0H.',
        hardwareAction: 'ALU performs A5H OR F0H = F5H; stores in RAM 41H.',
        codeSnippet: 'MOV A, 30H\nORL A, #0F0H\nMOV 41H, A'
      },
      {
        stageNumber: 4,
        stageName: 'Bitwise Logical XOR & 1\'s Complement',
        summary: 'Toggle all bits using #0FFH and evaluate CPL A instruction.',
        hardwareAction: 'XRL A, #0FFH and CPL A both produce inverted byte 5AH in RAM 42H and 43H.',
        codeSnippet: 'MOV A, 30H\nXRL A, #0FFH\nMOV 42H, A\nMOV A, 30H\nCPL A\nMOV 43H, A'
      },
      {
        stageNumber: 5,
        stageName: 'Nibble Swapping & Rotation',
        summary: 'Execute SWAP A to exchange D7-D4 with D3-D0; execute RL and RR.',
        hardwareAction: 'SWAP exchanges nibbles (A5H -> 5AH); RL shifts left (4BH); RR shifts right (D2H).',
        codeSnippet: 'MOV A, 30H\nSWAP A\nMOV 44H, A\nMOV A, 30H\nRL A\nMOV 45H, A\nMOV A, 30H\nRR A\nMOV 46H, A'
      },
      {
        stageNumber: 6,
        stageName: 'Boolean Bit-Addressable Logic',
        summary: 'Manipulate individual RAM bit 20H.0 and combine with Carry flag.',
        hardwareAction: 'SETB 20H.0 sets bit to 1; ORL C, 20H.0 sets CY = 1.',
        codeSnippet: 'SETB 20H.0\nCLR C\nORL C, 20H.0\nMOV 47H, PSW'
      }
    ],
    instructionsTheory: [
      {
        mnemonic: 'ANL A, src',
        syntax: 'ANL A, #data / direct / Rn / @Ri',
        role: 'Bitwise AND destination with source.',
        flagsAffected: 'P (Parity)',
        detail: 'Used for clearing specific bits to 0 (bit masking).'
      },
      {
        mnemonic: 'ORL A, src',
        syntax: 'ORL A, #data / direct / Rn / @Ri',
        role: 'Bitwise OR destination with source.',
        flagsAffected: 'P (Parity)',
        detail: 'Used for forcing specific bits to 1 (bit setting).'
      },
      {
        mnemonic: 'XRL A, src',
        syntax: 'XRL A, #data / direct / Rn / @Ri',
        role: 'Bitwise XOR destination with source.',
        flagsAffected: 'P (Parity)',
        detail: 'Used for inverting specific bits or checking bit equality.'
      },
      {
        mnemonic: 'SWAP A',
        syntax: 'SWAP A',
        role: 'Exchanges bits D7-D4 with bits D3-D0 in Accumulator A.',
        flagsAffected: 'None',
        detail: 'Operates in 1 machine cycle without modifying condition flags.'
      }
    ],
    flagsTheory: [
      {
        flag: 'P',
        fullName: 'Parity Flag (PSW.0)',
        roleInProgram: 'Automatically computed by hardware to reflect the parity of Accumulator A.',
        triggerCondition: 'Set to 1 if Accumulator A contains an odd number of 1-bits; 0 if even.'
      },
      {
        flag: 'CY',
        fullName: 'Carry / Boolean Accumulator (PSW.7)',
        roleInProgram: 'Acts as the single-bit accumulator for bit-addressable Boolean logic instructions.',
        triggerCondition: 'Updated by `SETB C`, `CLR C`, `CPL C`, `ANL C, bit`, `ORL C, bit`.'
      }
    ],
    dataFlowSummary:
      'Test Byte A5H in A -> ANL/ORL/XRL/CPL/SWAP -> Results written to RAM [40H..46H]. Bit 20H.0 -> Boolean Engine -> Carry Flag CY in PSW.',
    bestPractices: [
      'Use `SWAP A` for packed BCD unpacking and fast nibble extraction.',
      'Remember that logical instructions (ANL, ORL, XRL) do NOT modify CY, AC, or OV flags.',
      'Bit addresses 00H-7FH map to RAM bytes 20H-2FH, NOT RAM bytes 00H-07H.'
    ]
  },

  exp_8051_regbanks: {
    overview:
      'This 8051 Assembly Language Program demonstrates register bank selection across all 4 banks (Bank 0: 00H-07H, Bank 1: 08H-0FH, Bank 2: 10H-17H, Bank 3: 18H-1FH) by modifying PSW bits RS0 (PSW.3) and RS1 (PSW.4), and validates independent data retention and direct vs indirect RAM addressing.',
    memoryAndSegmentation:
      'The lower 32 bytes of 8051 Internal RAM (00H-1FH) are mapped into 4 banks of 8 registers (R0-R7) each. The active bank is decoded from PSW.4 (RS1) and PSW.3 (RS0).',
    logicStages: [
      {
        stageNumber: 1,
        stageName: 'Bank 0 Programming (Default Reset State)',
        summary: 'Select Bank 0 (RS1=0, RS0=0) and load test values into R0..R7.',
        hardwareAction: 'Writes 10H..17H to registers R0..R7 (physical RAM locations 00H..07H).',
        codeSnippet: 'MOV PSW, #00H\nMOV R0, #10H\nMOV R1, #11H\n; ...\nMOV R7, #17H'
      },
      {
        stageNumber: 2,
        stageName: 'Bank 1 Selection & Programming',
        summary: 'Switch to Bank 1 (RS1=0, RS0=1) using `SETB PSW.3` and populate R0..R7.',
        hardwareAction: 'CPU routes R0..R7 writes to physical RAM locations 08H..0FH with values 20H..27H.',
        codeSnippet: 'SETB PSW.3\nMOV R0, #20H\nMOV R1, #21H\n; ...\nMOV R7, #27H'
      },
      {
        stageNumber: 3,
        stageName: 'Bank 2 Selection & Programming',
        summary: 'Switch to Bank 2 (RS1=1, RS0=0) using `CLR PSW.3; SETB PSW.4`.',
        hardwareAction: 'CPU routes R0..R7 writes to physical RAM locations 10H..17H with values 30H..37H.',
        codeSnippet: 'CLR PSW.3\nSETB PSW.4\nMOV R0, #30H\n; ...\nMOV R7, #37H'
      },
      {
        stageNumber: 4,
        stageName: 'Bank 3 Selection & Programming',
        summary: 'Switch to Bank 3 (RS1=1, RS0=1) using `SETB PSW.3`.',
        hardwareAction: 'CPU routes R0..R7 writes to physical RAM locations 18H..1FH with values 40H..47H.',
        codeSnippet: 'SETB PSW.3\nMOV R0, #40H\n; ...\nMOV R7, #47H'
      },
      {
        stageNumber: 5,
        stageName: 'Cross-Bank Direct RAM Memory Validation',
        summary: 'Directly read RAM addresses 00H, 08H, 10H, 18H while active in Bank 3.',
        hardwareAction: 'Validates that each bank retained its own isolated 8-byte register context without corruption.',
        codeSnippet: 'MOV A, 00H\nMOV 40H, A\nMOV A, 08H\nMOV 41H, A\nMOV A, 10H\nMOV 42H, A\nMOV A, 18H\nMOV 43H, A'
      }
    ],
    instructionsTheory: [
      {
        mnemonic: 'SETB bit / CLR bit',
        syntax: 'SETB PSW.3 / CLR PSW.3',
        role: 'Atomically sets or clears individual bits in bit-addressable SFR PSW.',
        flagsAffected: 'Targeted PSW bit (RS0/RS1)',
        detail: 'Enables dynamic switching between register banks in 1 machine cycle.'
      },
      {
        mnemonic: 'MOV Rn, #data',
        syntax: 'MOV R0..R7, #data',
        role: 'Loads working register Rn of the active register bank with immediate data.',
        flagsAffected: 'None',
        detail: 'Resolves physical RAM address dynamically based on current RS1 and RS0 state.'
      },
      {
        mnemonic: 'MOV direct, #data',
        syntax: 'MOV 00H..1FH, #data',
        role: 'Writes directly to absolute physical RAM address, bypassing active bank selection.',
        flagsAffected: 'None',
        detail: 'Allows direct access to any bank\'s registers regardless of active PSW configuration.'
      }
    ],
    flagsTheory: [
      {
        flag: 'RS0',
        fullName: 'Register Bank Select Bit 0 (PSW.3)',
        roleInProgram: 'Lower bit of register bank selector.',
        triggerCondition: 'Set to 1 for Bank 1 (08H-0FH) and Bank 3 (18H-1FH); 0 for Bank 0 and Bank 2.'
      },
      {
        flag: 'RS1',
        fullName: 'Register Bank Select Bit 1 (PSW.4)',
        roleInProgram: 'Upper bit of register bank selector.',
        triggerCondition: 'Set to 1 for Bank 2 (10H-17H) and Bank 3 (18H-1FH); 0 for Bank 0 and Bank 1.'
      }
    ],
    dataFlowSummary:
      'PSW[RS1:RS0] -> Hardware Bank Decoder -> Maps R0-R7 to RAM 00H-07H (Bank 0), 08H-0FH (Bank 1), 10H-17H (Bank 2), 18H-1FH (Bank 3).',
    bestPractices: [
      'In RTOS and interrupt design, assign Bank 1 or Bank 2 to time-critical ISRs for instant zero-overhead context switching.',
      'Reinitialize Stack Pointer (`MOV SP, #30H`) if using Bank 1 to prevent stack pushes from overwriting registers R0-R7 at 08H-0FH.',
      'When switching banks inside subroutines, push PSW to stack (`PUSH PSW`) and pop (`POP PSW`) upon return.'
    ]
  },

  exp_8051_timer0_m1: {
    overview:
      'This 8051 Assembly Language Program demonstrates hardware timer delay generation using Timer 0 in Mode 1 (16-bit Timer Mode) to produce a precise 25 msec delay and continuously toggle all 8 pins of Port P0 (P0.0 through P0.7).',
    memoryAndSegmentation:
      'Timer 0 utilizes Special Function Registers TL0 (8AH) and TH0 (8CH) combined into a 16-bit up-counter. TMOD (89H) is programmed with 01H to select Mode 1. TCON (88H) controls timer execution via TR0 (TCON.4) and signals 16-bit overflow via TF0 (TCON.5). Port P0 (80H) interfaces with external LEDs.',
    logicStages: [
      {
        stageNumber: 1,
        stageName: 'TMOD SFR Configuration',
        summary: 'Configure Timer 0 in Mode 1 (16-bit Timer Mode).',
        hardwareAction: 'Writes 01H to TMOD (Address 89H) setting GATE=0, C/T=0 (Internal Timer), M1=0, M0=1.',
        codeSnippet: 'MOV TMOD, #01H'
      },
      {
        stageNumber: 2,
        stageName: 'Port P0 Initialization & Toggling',
        summary: 'Invert all 8 pins of Port P0 to toggle output state.',
        hardwareAction: 'Executes `CPL P0` to toggle pins P0.0-P0.7 between logic 0 (0V / LEDs ON) and logic 1 (5V / LEDs OFF).',
        codeSnippet: 'AGAIN:\n  CPL P0\n  ACALL DELAY_25MS\n  SJMP AGAIN'
      },
      {
        stageNumber: 3,
        stageName: 'Preload Timer 0 Registers',
        summary: 'Load calculated 16-bit initial count 9E58H into TH0 and TL0.',
        hardwareAction: 'Loads TH0 = 9EH (158D) and TL0 = 58H (88D) representing 40,536D (65,536 - 25,000 counts).',
        codeSnippet: 'DELAY_25MS:\n  MOV TH0, #09EH\n  MOV TL0, #58H'
      },
      {
        stageNumber: 4,
        stageName: 'Start Timer & Poll Overflow Flag TF0',
        summary: 'Start Timer 0 and wait until 25,000 µs elapse and TF0 becomes 1.',
        hardwareAction: 'Sets TR0 = 1 (TCON.4). The internal prescaler increments TL0:TH0 on every machine cycle until it overflows from FFFFH to 0000H, setting TF0 = 1.',
        codeSnippet: '  SETB TR0\nWAIT_TF0:\n  JNB TF0, WAIT_TF0'
      },
      {
        stageNumber: 5,
        stageName: 'Stop Timer, Clear Flag & Subroutine Return',
        summary: 'Stop Timer 0, clear TF0 flag in software, and return from delay.',
        hardwareAction: 'Clears TR0 = 0, clears TF0 = 0, and executes RET.',
        codeSnippet: '  CLR TR0\n  CLR TF0\n  RET'
      }
    ],
    instructionsTheory: [
      {
        mnemonic: 'SETB TR0 / CLR TR0',
        syntax: 'SETB TR0 / CLR TR0',
        role: 'Starts (1) or stops (0) Timer 0 counting.',
        flagsAffected: 'TR0 (TCON.4)',
        detail: 'Hardware gating bit allowing software start/stop control.'
      },
      {
        mnemonic: 'JNB bit, rel',
        syntax: 'JNB TF0, label',
        role: 'Jumps to label if targeted bit is 0 (polling loop).',
        flagsAffected: 'None',
        detail: 'Blocks CPU until Timer 0 reaches 16-bit terminal count (TF0 = 1).'
      },
      {
        mnemonic: 'CPL P0',
        syntax: 'CPL P0',
        role: 'Complements all 8 bits of Port 0 SFR.',
        flagsAffected: 'None',
        detail: 'Generates symmetric square wave output across all pins.'
      }
    ],
    flagsTheory: [
      {
        flag: 'TF0',
        fullName: 'Timer 0 Overflow Flag (TCON.5)',
        roleInProgram: 'Signals when Timer 0 count rolls over from FFFFH to 0000H (25 ms elapsed).',
        triggerCondition: 'Set to 1 by hardware upon 16-bit overflow; must be cleared by software in polling mode.'
      },
      {
        flag: 'TR0',
        fullName: 'Timer 0 Run Control Bit (TCON.4)',
        roleInProgram: 'Enables Timer 0 clock gating.',
        triggerCondition: 'Set by software (`SETB TR0`) to start counting; cleared (`CLR TR0`) to pause.'
      }
    ],
    dataFlowSummary:
      'TMOD (01H) -> TH0:TL0 (9E58H) -> TR0=1 -> Clock Increments 25,000 µs -> Rollover to 0000H -> TF0=1 -> CPL P0 -> 20 Hz Square Wave.',
    bestPractices: [
      'Always clear TF0 (`CLR TF0`) before returning from delay subroutine.',
      'Stop the timer (`CLR TR0`) before rewriting TH0/TL0 to prevent asynchronous counting skew.',
      'Connect 10 kΩ pull-up resistors to Port P0 when driving active-low LED loads.'
    ]
  },

  exp_8051_timer1_m0: {
    overview:
      'This 8051 Assembly Language Program creates a 50 µsec hardware delay using Timer 1 in Mode 0 (13-bit Timer Mode) and toggles all pins of Port P2 (P2.0 through P2.7) to synthesize a high-frequency 10 kHz square wave.',
    memoryAndSegmentation:
      'Timer 1 in Mode 0 uses an 8-bit register TH1 (8DH) and the lower 5 bits of TL1 (8BH) as a 13-bit up-counter (capacity = 8,192 counts). TMOD (89H) is programmed with 00H. TCON (88H) controls execution via TR1 (TCON.6) and TF1 (TCON.7). Port P2 (A0H) drives logic outputs.',
    logicStages: [
      {
        stageNumber: 1,
        stageName: 'TMOD Mode 0 Setup',
        summary: 'Configure Timer 1 in Mode 0 (13-bit Timer Mode).',
        hardwareAction: 'Writes 00H to TMOD (89H) configuring Timer 1 as 13-bit internal timer.',
        codeSnippet: 'MOV TMOD, #00H'
      },
      {
        stageNumber: 2,
        stageName: 'Toggle Port P2 Output',
        summary: 'Invert all 8 pins of Port P2.',
        hardwareAction: 'Executes `CPL P2` to toggle output voltage levels.',
        codeSnippet: 'AGAIN:\n  CPL P2\n  ACALL DELAY_50US\n  SJMP AGAIN'
      },
      {
        stageNumber: 3,
        stageName: 'Preload 13-bit Count in TH1 and TL1',
        summary: 'Load TH1 = 0FEH and TL1 = 0EH (1FCEH = 8,142D).',
        hardwareAction: 'Loads upper 8 bits into TH1 (FEH) and lower 5 bits into TL1 (0EH) for 50 counts (50 µs delay).',
        codeSnippet: 'DELAY_50US:\n  MOV TH1, #0FEH\n  MOV TL1, #0EH'
      },
      {
        stageNumber: 4,
        stageName: 'Start Timer 1 & Poll TF1',
        summary: 'Start Timer 1 (`SETB TR1`) and wait for 13-bit rollover (`JNB TF1, $`).',
        hardwareAction: 'Timer 1 counts from 1FCEH to 1FFFH (50 machine cycles) and asserts TF1 = 1.',
        codeSnippet: '  SETB TR1\nWAIT_TF1:\n  JNB TF1, WAIT_TF1'
      },
      {
        stageNumber: 5,
        stageName: 'Stop Timer 1 & Reset TF1',
        summary: 'Clear TR1 and TF1 and return.',
        hardwareAction: 'Clears TR1 = 0 and TF1 = 0.',
        codeSnippet: '  CLR TR1\n  CLR TF1\n  RET'
      }
    ],
    instructionsTheory: [
      {
        mnemonic: 'SETB TR1 / CLR TR1',
        syntax: 'SETB TR1 / CLR TR1',
        role: 'Controls Timer 1 run state.',
        flagsAffected: 'TR1 (TCON.6)',
        detail: 'Starts and stops Timer 1 counting.'
      },
      {
        mnemonic: 'JNB TF1, rel',
        syntax: 'JNB TF1, label',
        role: 'Polls Timer 1 overflow status.',
        flagsAffected: 'None',
        detail: 'Detects completion of 13-bit counting interval.'
      }
    ],
    flagsTheory: [
      {
        flag: 'TF1',
        fullName: 'Timer 1 Overflow Flag (TCON.7)',
        roleInProgram: 'Indicates 13-bit counter rollover (50 µs reached).',
        triggerCondition: 'Set by hardware when 13-bit count rolls from 1FFFH to 0000H.'
      },
      {
        flag: 'TR1',
        fullName: 'Timer 1 Run Control Bit (TCON.6)',
        roleInProgram: 'Enables Timer 1 clock gating.',
        triggerCondition: 'Software-controlled start/stop bit.'
      }
    ],
    dataFlowSummary:
      'TMOD (00H) -> TH1:TL1 (1FCEH) -> TR1=1 -> 50 Machine Cycles (50 µs) -> TF1=1 -> CPL P2 -> 10 kHz Waveform.',
    bestPractices: [
      'In Mode 0, ensure bits D7-D5 of TL1 are set to 0 as they are ignored by 13-bit logic.',
      'Remember that Mode 0 max delay at 12 MHz is 8.192 ms.',
      'Use Mode 0 when maintaining compatibility with legacy 8048 microcontrollers.'
    ]
  },

  exp_8051_counter0_m2: {
    overview:
      'This 8051 Assembly Language Program generates a jitter-free 75 msec delay using Timer 0 in Mode 2 (8-bit Auto-Reload Mode) and toggles Port P1 pins to drive an LED bargraph at 6.67 Hz.',
    memoryAndSegmentation:
      'Mode 2 uses TL0 (8AH) as the counting register and TH0 (8CH) as the auto-reload reference. TMOD (89H) is programmed with 02H. Registers R2 and R3 in RAM Bank 0 are utilized as nested software loop multipliers (2 × 150 = 300 base ticks). Port P1 (90H) outputs square wave pulses.',
    logicStages: [
      {
        stageNumber: 1,
        stageName: 'TMOD Mode 2 Auto-Reload Setup',
        summary: 'Configure Timer 0 in Mode 2 (8-bit Auto-Reload Mode).',
        hardwareAction: 'Writes 02H to TMOD (Address 89H) setting GATE=0, C/T=0, M1=1, M0=0.',
        codeSnippet: 'MOV TMOD, #02H'
      },
      {
        stageNumber: 2,
        stageName: 'Auto-Reload Value Preload',
        summary: 'Preload TH0 = 06H (256 - 250 = 6) for 250 µs hardware base tick.',
        hardwareAction: 'Loads TH0 = 06H and TL0 = 06H.',
        codeSnippet: 'MOV TH0, #06H\nMOV TL0, #06H'
      },
      {
        stageNumber: 3,
        stageName: 'Toggle Port P1',
        summary: 'Invert Port P1 pins to blink LEDs.',
        hardwareAction: 'Executes `CPL P1` to alternate LED states.',
        codeSnippet: 'AGAIN:\n  CPL P1\n  ACALL DELAY_75MS\n  SJMP AGAIN'
      },
      {
        stageNumber: 4,
        stageName: 'Start Timer & Execute Nested 300-Tick Delay Loop',
        summary: 'Start Timer 0 and execute 2 × 150 = 300 iterations of 250 µs ticks.',
        hardwareAction: 'Polls TF0 on every 250 µs tick. Hardware automatically reloads TL0 = TH0 (06H) on overflow. Decrements R3 and R2.',
        codeSnippet: 'DELAY_75MS:\n  SETB TR0\n  MOV R2, #02H\nOUTER_LOOP:\n  MOV R3, #150\nINNER_LOOP:\n  JNB TF0, $\n  CLR TF0\n  DJNZ R3, INNER_LOOP\n  DJNZ R2, OUTER_LOOP'
      },
      {
        stageNumber: 5,
        stageName: 'Stop Timer 0 & Return',
        summary: 'Stop Timer 0 and return from subroutine.',
        hardwareAction: 'Clears TR0 = 0 and executes RET.',
        codeSnippet: '  CLR TR0\n  RET'
      }
    ],
    instructionsTheory: [
      {
        mnemonic: 'DJNZ Rn, rel',
        syntax: 'DJNZ R2/R3, label',
        role: 'Decrements register by 1 and jumps if non-zero.',
        flagsAffected: 'None',
        detail: 'Forms the nested loop multiplier for extending the 250 µs base tick to 75 ms.'
      },
      {
        mnemonic: 'CLR TF0',
        syntax: 'CLR TF0',
        role: 'Clears overflow flag while hardware auto-reloads TL0 from TH0.',
        flagsAffected: 'TF0 (TCON.5)',
        detail: 'Enables next 250 µs tick without requiring software reload of TL0.'
      }
    ],
    flagsTheory: [
      {
        flag: 'TF0',
        fullName: 'Timer 0 Overflow Flag (TCON.5)',
        roleInProgram: 'Asserted every 250 µs upon TL0 reaching FFH -> 00H.',
        triggerCondition: 'Set by hardware every 250 counts; triggers auto-reload of TH0 into TL0.'
      }
    ],
    dataFlowSummary:
      'TMOD (02H) -> TH0=06H -> Auto-Reload Tick (250 µs) -> Nested Loop (2 × 150 = 300 Ticks) -> 75.0 ms Total Delay -> CPL P1 (6.67 Hz).',
    bestPractices: [
      'Never modify TH0 inside the delay loop as it serves as the master reload template.',
      'Mode 2 is the preferred mode for UART serial baud rate generators because of its jitter-free auto-reload capability.',
      'Use nested register loops (R2, R3) to generate long multi-millisecond intervals from microsecond auto-reload ticks.'
    ]
  },

  exp_8051_counter1_m1: {
    overview:
      'This 8051 Assembly Language Program configures Counter 1 in Mode 1 (16-bit Counter Mode) to count 80 clock pulses / external events on Pin T1 (P3.5) generating an 80 µsec delay, and blinks all pins of Port P3 to output a 6.25 kHz square wave.',
    memoryAndSegmentation:
      'Counter 1 in Mode 1 uses 16-bit cascade TL1 (8BH) and TH1 (8DH). TMOD (89H) is programmed with 50H (or 10H). External events are received via Pin T1 (P3.5 / Pin 15). Port P3 (B0H) outputs the generated pulse train.',
    logicStages: [
      {
        stageNumber: 1,
        stageName: 'TMOD Mode 1 Counter Setup',
        summary: 'Configure Counter 1 in Mode 1 (16-bit Counter Mode).',
        hardwareAction: 'Writes 50H to TMOD (Address 89H) setting GATE=0, C/T=1 (External Counter), M1=0, M0=1.',
        codeSnippet: 'MOV TMOD, #50H'
      },
      {
        stageNumber: 2,
        stageName: 'Toggle Port P3 Pins',
        summary: 'Invert Port P3 pins to generate square wave output.',
        hardwareAction: 'Executes `CPL P3` to toggle pins P3.0 through P3.7.',
        codeSnippet: 'AGAIN:\n  CPL P3\n  ACALL DELAY_80US\n  SJMP AGAIN'
      },
      {
        stageNumber: 3,
        stageName: 'Preload 16-bit Count in TH1 and TL1',
        summary: 'Load TH1 = 0FFH and TL1 = 0B0H (65,456D for 80 counts).',
        hardwareAction: 'Loads FFB0H into TH1:TL1 (65,536 - 80 = 65,456).',
        codeSnippet: 'DELAY_80US:\n  MOV TH1, #0FFH\n  MOV TL1, #0B0H'
      },
      {
        stageNumber: 4,
        stageName: 'Start Counter 1 & Poll TF1',
        summary: 'Start Counter 1 (`SETB TR1`) and wait for 80 pulses (`JNB TF1, $`).',
        hardwareAction: 'Counter 1 counts 80 pulses on Pin T1 / internal cycles until FFFFH -> 0000H overflow sets TF1 = 1.',
        codeSnippet: '  SETB TR1\nWAIT_TF1:\n  JNB TF1, WAIT_TF1'
      },
      {
        stageNumber: 5,
        stageName: 'Stop Counter 1 & Return',
        summary: 'Clear TR1 and TF1 and return.',
        hardwareAction: 'Clears TR1 = 0 and TF1 = 0.',
        codeSnippet: '  CLR TR1\n  CLR TF1\n  RET'
      }
    ],
    instructionsTheory: [
      {
        mnemonic: 'SETB TR1 / CLR TR1',
        syntax: 'SETB TR1 / CLR TR1',
        role: 'Controls Counter 1 run gate.',
        flagsAffected: 'TR1 (TCON.6)',
        detail: 'Enables external pulse counting on pin T1.'
      },
      {
        mnemonic: 'JNB TF1, rel',
        syntax: 'JNB TF1, label',
        role: 'Polls Counter 1 overflow flag.',
        flagsAffected: 'None',
        detail: 'Waits for 80 event pulses to complete.'
      }
    ],
    flagsTheory: [
      {
        flag: 'TF1',
        fullName: 'Timer/Counter 1 Overflow Flag (TCON.7)',
        roleInProgram: 'Signals when 80 pulses have been registered by Counter 1.',
        triggerCondition: 'Set by hardware upon 16-bit rollover from FFFFH to 0000H.'
      }
    ],
    dataFlowSummary:
      'TMOD (50H) -> Preload FFB0H -> Pin T1 Pulses (80 Events / 80 µs) -> Rollover -> TF1=1 -> CPL P3 -> 6.25 kHz Square Wave.',
    bestPractices: [
      'In external Counter mode (C/T=1), configure Pin P3.5 as input by writing 1 (`SETB P3.5`).',
      'Maximum external pulse frequency is f_osc / 24 (500 kHz at 12 MHz) due to 2-cycle sampling rules.',
      'Always clear TR1 before rewriting TH1/TL1 registers.'
    ]
  },

  exp_8051_uart_9600: {
    overview:
      'This 8051 Assembly Language Program configures the on-chip Universal Asynchronous Receiver-Transmitter (UART) in Mode 1 (8-bit UART, variable baud rate) to transmit character \'A\' serially at 9600 baud using Timer 1 in Mode 2 (8-bit auto-reload) with an 11.0592 MHz crystal oscillator.',
    memoryAndSegmentation:
      'UART registers include Serial Buffer SBUF (99H) and Serial Control SCON (98H). Baud rate timing uses Timer 1 auto-reload register TH1 (8DH) and TMOD (89H). Serial output bitstream is driven out on Pin TXD (P3.1 / Pin 11).',
    logicStages: [
      {
        stageNumber: 1,
        stageName: 'Configure Timer 1 Mode 2 Auto-Reload',
        summary: 'Set TMOD = 20H for Timer 1 Mode 2 (8-bit auto-reload baud rate generator).',
        hardwareAction: 'Writes 20H to TMOD (89H) setting GATE=0, C/T=0 (Internal Timer), M1=1, M0=0.',
        codeSnippet: 'MOV TMOD, #20H'
      },
      {
        stageNumber: 2,
        stageName: 'Load Baud Reload Value for 9600 Baud',
        summary: 'Load TH1 = 0FDH (-3D in 2\'s complement) for 9600 baud with 11.0592 MHz crystal.',
        hardwareAction: 'Loads 0FDH into TH1 (8DH) which hardware automatically copies into TL1 (8BH).',
        codeSnippet: 'MOV TH1, #0FDH'
      },
      {
        stageNumber: 3,
        stageName: 'Configure SCON for 8-bit UART Mode 1',
        summary: 'Set SCON = 50H (Mode 1: 1 Start bit, 8 Data bits, 1 Stop bit, Receiver Enabled REN=1).',
        hardwareAction: 'Writes 50H to SCON (98H) setting SM0=0, SM1=1, REN=1.',
        codeSnippet: 'MOV SCON, #50H'
      },
      {
        stageNumber: 4,
        stageName: 'Start Timer 1 Baud Rate Generator',
        summary: 'Set TR1 = 1 to begin Timer 1 clock ticks at 28,800 Hz.',
        hardwareAction: 'Asserts TR1 (TCON.6 = 1) enabling Timer 1 to feed the UART baud prescaler.',
        codeSnippet: 'SETB TR1'
      },
      {
        stageNumber: 5,
        stageName: 'Load Character into SBUF & Transmit',
        summary: 'Move character \'A\' (41H) into SBUF to begin serial shifting out of TXD (P3.1).',
        hardwareAction: 'Writing to SBUF initiates UART transmission of 10-bit asynchronous frame.',
        codeSnippet: 'AGAIN:\n  MOV SBUF, #\'A\'\nWAIT_TI:\n  JNB TI, WAIT_TI\n  CLR TI\n  SJMP AGAIN'
      }
    ],
    instructionsTheory: [
      {
        mnemonic: 'MOV SBUF, #data',
        syntax: 'MOV SBUF, #\'A\'',
        role: 'Transfers 8-bit data into the UART transmit buffer register.',
        flagsAffected: 'None',
        detail: 'Hardware automatically attaches Start (0) and Stop (1) framing bits and begins serial transmission.'
      },
      {
        mnemonic: 'JNB TI, rel',
        syntax: 'JNB TI, label',
        role: 'Polls the Transmit Interrupt flag in SCON.',
        flagsAffected: 'None',
        detail: 'Waits until all 10 bits of the frame have been shifted out over TXD (P3.1).'
      },
      {
        mnemonic: 'CLR TI',
        syntax: 'CLR TI',
        role: 'Clears the Transmit Interrupt flag in software.',
        flagsAffected: 'TI (SCON.1)',
        detail: 'Prepares the UART interface for the next character transmission.'
      }
    ],
    flagsTheory: [
      {
        flag: 'TI',
        fullName: 'Transmit Interrupt Flag (SCON.1)',
        roleInProgram: 'Signals completion of character transmission frame.',
        triggerCondition: 'Set by hardware at the beginning of the stop bit; must be cleared by software.'
      }
    ],
    dataFlowSummary:
      'Crystal (11.0592 MHz) -> ÷12 ÷32 (28.8 kHz) -> Timer 1 TH1=0FDH (÷3) -> 9600 Baud Clock -> SBUF (\'A\' / 41H) -> TXD Pin P3.1 -> PC Terminal.',
    bestPractices: [
      'Always use an 11.0592 MHz crystal for zero-error UART baud rates (9600, 4800, 2400).',
      'Always clear TI in software (`CLR TI`) before sending the next character to prevent premature loop bypass.',
      'Ensure Timer 1 is running (`SETB TR1`) before writing data into SBUF.'
    ]
  },

  exp_8051_uart_4800: {
    overview:
      'This 8051 Assembly Language Program configures UART Mode 1 to transfer character \'B\' serially at 4800 baud using Timer 1 in Mode 2 auto-reload (TH1 = 0FAH) and an 11.0592 MHz crystal oscillator.',
    memoryAndSegmentation:
      'Timer 1 Mode 2 auto-reload register TH1 (8DH) is loaded with 0FAH (-6D). SCON (98H) is programmed with 50H for Mode 1. SBUF (99H) holds character \'B\' (42H). Serial transmission occurs over Pin TXD (P3.1).',
    logicStages: [
      {
        stageNumber: 1,
        stageName: 'Configure Timer 1 Mode 2 Auto-Reload',
        summary: 'Set TMOD = 20H for Timer 1 Mode 2.',
        hardwareAction: 'Configures Timer 1 as an 8-bit auto-reload timer (GATE=0, C/T=0, M1=1, M0=0).',
        codeSnippet: 'MOV TMOD, #20H'
      },
      {
        stageNumber: 2,
        stageName: 'Load 4800 Baud Rate Reload Value',
        summary: 'Load TH1 = 0FAH (256 - 6 = 250D = -6D) for 4800 baud at 11.0592 MHz.',
        hardwareAction: 'Sets reload value in TH1 (8DH). Divider factor N = 28,800 / 4800 = 6.',
        codeSnippet: 'MOV TH1, #0FAH'
      },
      {
        stageNumber: 3,
        stageName: 'Initialize Serial Port Control (SCON)',
        summary: 'Set SCON = 50H (Mode 1 8-bit UART, REN=1).',
        hardwareAction: 'Configures 1 start bit, 8 data bits, 1 stop bit with variable baud rate.',
        codeSnippet: 'MOV SCON, #50H'
      },
      {
        stageNumber: 4,
        stageName: 'Start Baud Rate Clock & Transmit',
        summary: 'Start Timer 1 (`SETB TR1`) and send character \'B\' continuously.',
        hardwareAction: 'Transmits character \'B\' (42H / 01000010B) at 4800 bps (bit period = 208.33 µs).',
        codeSnippet: 'SETB TR1\nAGAIN:\n  MOV SBUF, #\'B\'\n  JNB TI, $\n  CLR TI\n  SJMP AGAIN'
      }
    ],
    instructionsTheory: [
      {
        mnemonic: 'MOV TH1, #0FAH',
        syntax: 'MOV TH1, #0FAH',
        role: 'Sets the 4800 baud reload count in Timer 1.',
        flagsAffected: 'None',
        detail: 'Timer 1 overflows every 6 machine cycles to produce 4800 baud.'
      },
      {
        mnemonic: 'JNB TI, $',
        syntax: 'JNB TI, $',
        role: 'Polls TI flag in-place until hardware finishes shifting out the stop bit.',
        flagsAffected: 'None',
        detail: 'Ensures no character overwrite occurs in the SBUF register.'
      }
    ],
    flagsTheory: [
      {
        flag: 'TI',
        fullName: 'Transmit Interrupt Flag (SCON.1)',
        roleInProgram: 'Handshakes transmission of each 4800 baud character.',
        triggerCondition: 'Hardware asserts TI at bit period 10 (stop bit); software clears TI.'
      }
    ],
    dataFlowSummary:
      'Crystal (11.0592 MHz) -> ÷12 ÷32 -> Timer 1 TH1=0FAH (÷6) -> 4800 Baud Clock -> SBUF (\'B\' / 42H) -> TXD Pin P3.1 -> PC Terminal.',
    bestPractices: [
      '4800 baud allows longer serial cable runs than 9600 baud due to relaxed rise/fall time requirements.',
      'SMOD bit in PCON can be set to double 4800 baud to 9600 baud if needed.',
      'Always verify baud rate settings in the PC terminal match 4800-8-N-1.'
    ]
  },

  exp_8051_uart_2400: {
    overview:
      'This 8051 Assembly Language Program configures UART Mode 1 to transfer character \'C\' serially at 2400 baud using Timer 1 in Mode 2 auto-reload (TH1 = 0F4H) and an 11.0592 MHz crystal oscillator.',
    memoryAndSegmentation:
      'Timer 1 Mode 2 auto-reload register TH1 (8DH) is loaded with 0F4H (-12D). SCON (98H) is programmed with 50H. SBUF (99H) holds character \'C\' (43H). Serial bitstream is sent via Pin TXD (P3.1).',
    logicStages: [
      {
        stageNumber: 1,
        stageName: 'Configure Timer 1 Mode 2 Auto-Reload',
        summary: 'Set TMOD = 20H for Timer 1 Mode 2.',
        hardwareAction: 'Writes 20H to TMOD (89H) configuring 8-bit auto-reload timer.',
        codeSnippet: 'MOV TMOD, #20H'
      },
      {
        stageNumber: 2,
        stageName: 'Load 2400 Baud Rate Reload Value',
        summary: 'Load TH1 = 0F4H (256 - 12 = 244D = -12D) for 2400 baud.',
        hardwareAction: 'Sets reload value in TH1 (8DH). Divider factor N = 28,800 / 2400 = 12.',
        codeSnippet: 'MOV TH1, #0F4H'
      },
      {
        stageNumber: 3,
        stageName: 'Initialize Serial Port Control (SCON)',
        summary: 'Set SCON = 50H (Mode 1 8-bit UART, REN=1).',
        hardwareAction: 'Enables 10-bit asynchronous UART frame generation.',
        codeSnippet: 'MOV SCON, #50H'
      },
      {
        stageNumber: 4,
        stageName: 'Start Baud Rate Clock & Transmit',
        summary: 'Start Timer 1 (`SETB TR1`) and send character \'C\' continuously.',
        hardwareAction: 'Transmits character \'C\' (43H / 01000011B) at 2400 bps (bit period = 416.67 µs).',
        codeSnippet: 'SETB TR1\nAGAIN:\n  MOV SBUF, #\'C\'\n  JNB TI, $\n  CLR TI\n  SJMP AGAIN'
      }
    ],
    instructionsTheory: [
      {
        mnemonic: 'MOV TH1, #0F4H',
        syntax: 'MOV TH1, #0F4H',
        role: 'Sets the 2400 baud reload count in Timer 1.',
        flagsAffected: 'None',
        detail: 'Timer 1 overflows every 12 machine cycles to generate 2400 baud.'
      },
      {
        mnemonic: 'JNB TI, $',
        syntax: 'JNB TI, $',
        role: 'Polls TI flag until the entire 10-bit character frame has been transmitted.',
        flagsAffected: 'None',
        detail: 'Prevents character corruption by enforcing serial frame completion.'
      }
    ],
    flagsTheory: [
      {
        flag: 'TI',
        fullName: 'Transmit Interrupt Flag (SCON.1)',
        roleInProgram: 'Signals completion of 2400 baud frame.',
        triggerCondition: 'Set by hardware upon transmission of the stop bit; cleared by software.'
      }
    ],
    dataFlowSummary:
      'Crystal (11.0592 MHz) -> ÷12 ÷32 -> Timer 1 TH1=0F4H (÷12) -> 2400 Baud Clock -> SBUF (\'C\' / 43H) -> TXD Pin P3.1 -> PC Terminal.',
    bestPractices: [
      '2400 baud provides excellent noise immunity for long-range industrial and RS-485 networks.',
      'Each character frame requires 4.167 ms to transmit at 2400 baud.',
      'Always clear TI with `CLR TI` immediately after `JNB TI, $`.'
    ]
  },

  exp_8051_lcd_8bit: {
    overview:
      'This 8051 Assembly Language Program demonstrates 8-bit parallel interfacing with an HD44780-compatible 16×2 alphanumeric LCD display module. Data is driven through Port 1 (P1.0-P1.7) and control signals through Port 2 (P2.0=RS, P2.1=RW, P2.2=EN).',
    memoryAndSegmentation:
      'Port 1 (90H) serves as 8-bit bidirectional data bus (D0-D7). Port 2 bit lines control LCD: P2.0 (RS - Register Select), P2.1 (RW - Read/Write, grounded/0 for write), P2.2 (EN - Enable latching strobe). Message strings are stored in code memory (ROM) and retrieved using `MOVC A, @A+DPTR`.',
    logicStages: [
      {
        stageNumber: 1,
        stageName: 'Initialize Control & Data Lines',
        summary: 'Set RS=0 (Command Mode), RW=0 (Write), EN=0 (Disabled).',
        hardwareAction: 'Clears P2.0, P2.1, P2.2 to place the LCD controller into command input state.',
        codeSnippet: 'CLR P2.0\nCLR P2.1\nCLR P2.2'
      },
      {
        stageNumber: 2,
        stageName: 'Send LCD Initialization Command Sequence',
        summary: 'Send 38H (8-bit, 2 lines, 5×7 font), 0EH (Display ON, Cursor ON), 01H (Clear Screen), 06H (Entry Mode: Auto-Increment).',
        hardwareAction: 'Transmits each command byte on Port 1 and strobes EN high for >=450ns then low to latch into the LCD command register.',
        codeSnippet: 'MOV A, #38H\nACALL LCD_CMD\nMOV A, #0EH\nACALL LCD_CMD\nMOV A, #01H\nACALL LCD_CMD\nMOV A, #06H\nACALL LCD_CMD'
      },
      {
        stageNumber: 3,
        stageName: 'Set Cursor to Line 1 (Address 80H) & Write Characters',
        summary: 'Load Line 1 base DDRAM address 80H, stream ASCII string "8051 INTERFACE" with RS=1.',
        hardwareAction: 'Sets RS=1 (Data Mode), puts ASCII character bytes on P1, and strobes EN to write to DDRAM.',
        codeSnippet: 'MOV A, #80H\nACALL LCD_CMD\nMOV DPTR, #MSG1\nACALL DISP_STRING'
      },
      {
        stageNumber: 4,
        stageName: 'Set Cursor to Line 2 (Address C0H) & Write Characters',
        summary: 'Load Line 2 base DDRAM address C0H, stream ASCII string "16x2 LCD 8-BIT".',
        hardwareAction: 'Positions LCD internal address counter to row 2 column 1 and writes character bytes.',
        codeSnippet: 'MOV A, #0C0H\nACALL LCD_CMD\nMOV DPTR, #MSG2\nACALL DISP_STRING\nSJMP $'
      }
    ],
    instructionsTheory: [
      {
        mnemonic: 'MOVC A, @A+DPTR',
        syntax: 'MOVC A, @A+DPTR',
        role: 'Reads an ASCII character byte from Program ROM lookup table at base DPTR + offset A.',
        flagsAffected: 'None',
        detail: 'Enables streaming null-terminated string constants directly to the LCD data register.'
      },
      {
        mnemonic: 'SETB P2.2 / CLR P2.2',
        syntax: 'SETB EN / CLR EN',
        role: 'Generates the high-to-low falling edge Enable strobe to latch data/commands into HD44780.',
        flagsAffected: 'None',
        detail: 'The HD44780 latches the data present on D0–D7 on the falling edge of the Enable (EN) signal.'
      }
    ],
    flagsTheory: [
      {
        flag: 'BF',
        fullName: 'Busy Flag (LCD Status Pin D7)',
        roleInProgram: 'Indicates whether the LCD internal microcontroller is busy executing the previous command.',
        triggerCondition: 'Polled with RS=0, RW=1; when BF=0 the LCD is ready for next transaction, or bypassed with software delay.'
      }
    ],
    dataFlowSummary:
      'Code ROM String (DPTR) -> MOVC A -> Port 1 (D0-D7) -> HD44780 DDRAM Matrix -> 16×2 5×7 Dot-Matrix Display.',
    bestPractices: [
      'Ensure a minimum 1.64 ms delay after the 01H (Clear Display) command before sending subsequent bytes.',
      'Always maintain EN pulse width high for at least 450 ns to satisfy HD44780 timing parameters.',
      'Pull RW low (GND) if only write operations are required in simple designs.'
    ]
  },

  exp_8051_lcd_4bit: {
    overview:
      'This 8051 Assembly Language Program interfaces a 16×2 LCD in 4-bit mode using only 4 data lines (P1.4-P1.7 to D4-D7), conserving 4 microcontroller pins (P1.0-P1.3) for other peripherals. Commands and data are transmitted as two successive 4-bit nibbles.',
    memoryAndSegmentation:
      'Upper nibble of Port 1 (P1.4-P1.7) connects to LCD data lines D4-D7. Lower nibble of Port 1 (P1.0-P1.3) is left uncommitted for external I/O. Control signals: P2.0 (RS), P2.1 (RW), P2.2 (EN).',
    logicStages: [
      {
        stageNumber: 1,
        stageName: '4-Bit State Machine Synchronization Reset',
        summary: 'Send 33H and 32H to force the HD44780 controller out of an unknown state and lock it into 4-bit mode.',
        hardwareAction: 'Transmits 30H three times followed by 20H to establish 4-bit nibble synchronization.',
        codeSnippet: 'MOV A, #33H\nACALL LCD_CMD_4BIT\nMOV A, #32H\nACALL LCD_CMD_4BIT'
      },
      {
        stageNumber: 2,
        stageName: 'Configure 4-Bit Function Set (28H)',
        summary: 'Send command 28H (4-bit bus, 2 display lines, 5×7 dot font).',
        hardwareAction: 'Transmits high nibble 20H + EN strobe, then low nibble 80H + EN strobe.',
        codeSnippet: 'MOV A, #28H\nACALL LCD_CMD_4BIT'
      },
      {
        stageNumber: 3,
        stageName: 'Initialize Display & Cursor Parameters',
        summary: 'Send 0EH (Display ON), 01H (Clear Display), and 06H (Entry Mode).',
        hardwareAction: 'Transmits each command in two 4-bit chunks with EN pulses.',
        codeSnippet: 'MOV A, #0EH\nACALL LCD_CMD_4BIT\nMOV A, #01H\nACALL LCD_CMD_4BIT\nMOV A, #06H\nACALL LCD_CMD_4BIT'
      },
      {
        stageNumber: 4,
        stageName: 'Stream Dual-Nibble ASCII Characters',
        summary: 'Send characters for Line 1 (80H) and Line 2 (C0H) via `LCD_DATA_4BIT` routine (RS=1).',
        hardwareAction: 'Extracts high nibble -> outputs on P1.4-P1.7 -> pulses EN -> SWAP A -> extracts low nibble -> pulses EN.',
        codeSnippet: 'MOV A, #80H\nACALL LCD_CMD_4BIT\nMOV DPTR, #MSG1\nACALL DISP_4BIT\nMOV A, #0C0H\nACALL LCD_CMD_4BIT\nMOV DPTR, #MSG2\nACALL DISP_4BIT\nSJMP $'
      }
    ],
    instructionsTheory: [
      {
        mnemonic: 'SWAP A',
        syntax: 'SWAP A',
        role: 'Exchanges the upper 4 bits (nibble) of Accumulator A with the lower 4 bits (bits 0-3 with 4-7).',
        flagsAffected: 'None',
        detail: 'Essential in 4-bit LCD drivers to quickly position the lower nibble into bits 4–7 for Port 1.4–1.7 transmission.'
      },
      {
        mnemonic: 'ANL P1, #0F0H / ORL P1',
        syntax: 'ANL / ORL',
        role: 'Masks and merges 4-bit LCD data onto P1.4–P1.7 without altering the state of pins P1.0–P1.3.',
        flagsAffected: 'None',
        detail: 'Guarantees that other hardware connected to P1.0-P1.3 is not disturbed during LCD transactions.'
      }
    ],
    flagsTheory: [
      {
        flag: 'Dual Nibble Synchronization',
        fullName: '4-Bit Nibble Sequence State',
        roleInProgram: 'Ensures the LCD controller receives the High Nibble first followed immediately by Low Nibble.',
        triggerCondition: 'If a nibble is dropped, the LCD controller state becomes desynchronized until power-on or software reset.'
      }
    ],
    dataFlowSummary:
      '8-bit Byte -> High Nibble (P1.4-P1.7) + EN -> SWAP A -> Low Nibble (P1.4-P1.7) + EN -> HD44780 16×2 Display.',
    bestPractices: [
      'Pins D0–D3 of the LCD module should be left floating or tied to GND in 4-bit mode.',
      'Always execute the 33H -> 32H reset sequence on microcontroller power-up to handle warm resets safely.',
      'Remember that 4-bit mode takes roughly twice the transmission time as 8-bit mode, but saves 4 precious microcontroller I/O lines.'
    ]
  }
};
