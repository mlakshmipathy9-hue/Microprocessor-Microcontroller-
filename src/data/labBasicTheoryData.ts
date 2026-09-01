export interface BasicExperimentTheory {
  principleTitle: string;
  corePrinciple: string;
  keyConcepts: Array<{
    title: string;
    description: string;
    badge?: string;
  }>;
  mathematicalFormulation?: {
    formula: string;
    explanation: string;
    steps?: string[];
  };
  architecturalMechanisms: Array<{
    feature: string;
    role: string;
  }>;
  workedExample: {
    inputLabel: string;
    inputValue: string;
    calculationSteps: Array<{
      stepNumber: number;
      operation: string;
      intermediateResult: string;
      flagImpact: string;
    }>;
    finalOutput: string;
  };
  industrialRelevance: string;
}

export const labBasicTheoryData: Record<string, BasicExperimentTheory> = {
  exp1: {
    principleTitle: 'Multi-Precision Arithmetic & Ripple Carry/Borrow Principle',
    corePrinciple:
      'The 8086 microprocessor is natively a 16-bit processor with 16-bit ALU registers (AX, BX, CX, DX). When arithmetic operations involve operands larger than 16 bits (such as 32-bit, 64-bit, or arbitrary multi-byte numbers), the computation must be decomposed into sequential byte-by-byte (or word-by-word) operations. The carry or borrow generated from each lower-order stage must be propagated into the immediate next higher-order stage using Add-with-Carry (ADC) or Subtract-with-Borrow (SBB).',
    keyConcepts: [
      {
        title: 'Little-Endian Byte Ordering in Memory',
        description:
          'In the 8086 memory architecture, multi-byte integers are stored in Little-Endian format: the Least Significant Byte (LSB) is stored at the lowest physical memory address (e.g., Offset 0000H), while the Most Significant Byte (MSB) is placed at the highest address (e.g., Offset 0003H). Pointers (SI, DI, BX) start at the lowest address and increment upward.',
        badge: 'Memory Architecture'
      },
      {
        title: 'Carry Ripple Mechanism (ADC)',
        description:
          'Standard ADD only computes (Dest + Src). In contrast, ADC computes (Dest + Src + CF). Prior to the first addition, the Carry Flag is explicitly cleared using CLC (CF = 0) so no false carry is injected into the lowest byte. Subsequent iterations automatically carry over the arithmetic overflow from the preceding byte addition.',
        badge: 'ALU Logic'
      },
      {
        title: 'Borrow Propagation Mechanism (SBB)',
        description:
          'In 8086 subtraction, SBB computes (Dest - Src - CF). The Carry Flag (CF) doubles as the Borrow Flag during subtraction. Clearing CF (CLC) before starting the first byte subtraction ensures that only valid borrows between adjacent bytes are propagated.',
        badge: 'ALU Logic'
      }
    ],
    mathematicalFormulation: {
      formula: 'Result[i] = (A[i] + B[i] + Carry_in[i]) mod 256,   Carry_out[i] = ⌊(A[i] + B[i] + Carry_in[i]) / 256⌋',
      explanation:
        'Each 32-bit operand is partitioned into four 8-bit slices (A0, A1, A2, A3 and B0, B1, B2, B3). For index i = 0 to 3, the sum at byte i incorporates Carry_in from byte i-1. The final carry from byte 3 indicates an overall 32-bit arithmetic overflow.',
      steps: [
        'Stage 0 (LSB): Sum0 = A0 + B0 + 0   →   Carry0 generated',
        'Stage 1:       Sum1 = A1 + B1 + Carry0   →   Carry1 generated',
        'Stage 2:       Sum2 = A2 + B2 + Carry1   →   Carry2 generated',
        'Stage 3 (MSB): Sum3 = A3 + B3 + Carry2   →   Final 32-bit Carry out'
      ]
    },
    architecturalMechanisms: [
      { feature: 'AL Register', role: '8-bit primary accumulator used to load operand bytes, execute ADC/SBB, and transfer sums to memory.' },
      { feature: 'SI & DI Registers', role: 'Source Index (SI = &NUM1) and Destination Index (DI = &NUM2) serving as auto-incrementing data pointers.' },
      { feature: 'BX Register', role: 'Base pointer addressing the destination array buffer (RESULT_ADD / RESULT_SUB).' },
      { feature: 'CX Register', role: 'Loop counter initialized to 4; decremented automatically by the LOOP instruction.' },
      { feature: 'Carry Flag (CF)', role: 'Single-bit hardware status register that retains the carry/borrow between successive loop iterations.' }
    ],
    workedExample: {
      inputLabel: 'Operands (Memory Bytes in Little-Endian Order)',
      inputValue: 'NUM1 = FF FE FD FC (FCFDFEFFH), NUM2 = 01 02 03 04 (04030201H)',
      calculationSteps: [
        { stepNumber: 1, operation: 'Byte 0 (LSB): FFH + 01H + CF(0)', intermediateResult: 'Sum = 00H', flagImpact: 'CF = 1 (Carry generated)' },
        { stepNumber: 2, operation: 'Byte 1: FEH + 02H + CF(1)', intermediateResult: 'Sum = 01H', flagImpact: 'CF = 1 (Carry generated)' },
        { stepNumber: 3, operation: 'Byte 2: FDH + 03H + CF(1)', intermediateResult: 'Sum = 01H', flagImpact: 'CF = 1 (Carry generated)' },
        { stepNumber: 4, operation: 'Byte 3 (MSB): FCH + 04H + CF(1)', intermediateResult: 'Sum = 01H', flagImpact: 'CF = 1 (Final Carry = 1)' }
      ],
      finalOutput: '32-Bit Sum = 01010100H stored in memory as bytes [00, 01, 01, 01], Final Carry = 01H.'
    },
    industrialRelevance:
      'Multi-precision arithmetic forms the fundamental computational backbone of 2048-bit RSA/ECC public-key cryptography, IEEE 754 floating-point emulation libraries on microcontrollers, and arbitrary-precision financial software.'
  },

  exp2: {
    principleTitle: 'Signed & Unsigned Binary Multiplication and Division Arithmetic',
    corePrinciple:
      'Multiplication of two 16-bit binary numbers can yield a product up to 32 bits in width, which requires the concatenated register pair DX:AX in 8086. Similarly, 16-bit division requires a 32-bit dividend in DX:AX to produce a 16-bit quotient in AX and a 16-bit remainder in DX. Unsigned operations treat bit patterns as pure magnitudes (0 to 65535), whereas signed operations (IMUL / IDIV) interpret the MSB as a sign bit under Two\'s Complement representation (-32768 to +32767).',
    keyConcepts: [
      {
        title: 'Concatenated Doubleword Register Pair DX:AX',
        description:
          'For 16-bit MUL/IMUL, the 8086 implicitly stores the lower 16 bits of the 32-bit product in AX and the upper 16 bits in DX. For 16-bit DIV/IDIV, the processor expects the 32-bit numerator pre-loaded across DX:AX.',
        badge: 'Register Pair'
      },
      {
        title: 'Sign Extension via CWD (Convert Word to Doubleword)',
        description:
          'Before executing signed division (IDIV) on a 16-bit signed number in AX, the sign bit (bit 15 of AX) must be copied into all 16 bits of DX using CWD. If AX is negative, DX becomes FFFFH; if positive, DX becomes 0000H. Forgetting CWD causes catastrophic Type 0 Divide-by-Zero / Overflow exceptions.',
        badge: 'Signed Math'
      },
      {
        title: 'Unsigned Division DX Clearance (XOR DX, DX)',
        description:
          'For unsigned division (DIV), the upper dividend register DX must be explicitly cleared to 0000H. Any leftover residue in DX would inadvertently scale the dividend by 65536×DX + AX, resulting in a false quotient or division overflow.',
        badge: 'Zero Extension'
      }
    ],
    mathematicalFormulation: {
      formula: 'Multiplication: Product(32-bit) = Multiplicand(16-bit) × Multiplier(16-bit)  →  DX:AX\nDivision: Dividend(32-bit DX:AX) = (Divisor(16-bit) × Quotient in AX) + Remainder in DX',
      explanation:
        'Signed multiplication applies two\'s complement arithmetic: a negative multiplicand multiplied by a positive multiplier generates a negative product with leading sign bits propagated across DX:AX.',
      steps: [
        'Unsigned 16-bit MUL: DX:AX = AX × Source_Operand (Range: 0 to 4,294,836,225)',
        'Signed 16-bit IMUL:   DX:AX = AX × Source_Operand (Range: -1,073,741,824 to +1,073,709,056)',
        'Unsigned 16-bit DIV:  AX = (DX:AX) / Source_Operand, DX = (DX:AX) % Source_Operand',
        'Signed 16-bit IDIV:   AX = (DX:AX) / Source_Operand, DX = (DX:AX) % Source_Operand'
      ]
    },
    architecturalMechanisms: [
      { feature: 'AX Register', role: 'Primary accumulator holding 16-bit multiplicand, quotient, or lower dividend/product.' },
      { feature: 'DX Register', role: 'Upper register holding the high-order 16 bits of product or dividend remainder.' },
      { feature: 'CWD Instruction', role: 'Hardware sign-extender replicating bit 15 of AX across all bits of DX in 5 clock cycles.' },
      { feature: 'Overflow Flag (OF) & CF', role: 'Set to 1 if the upper half of the product (DX) contains significant non-sign digits.' }
    ],
    workedExample: {
      inputLabel: 'Unsigned & Signed Operands',
      inputValue: 'Unsigned: VAL1 = 0A12H (2578), VAL2 = 0050H (80) | Signed: S_VAL1 = -25 (FFE7H), S_VAL2 = +5 (0005H)',
      calculationSteps: [
        { stepNumber: 1, operation: 'Unsigned MUL: 2578 × 80 = 206,240 (000325A0H)', intermediateResult: 'DX = 0003H, AX = 25A0H', flagImpact: 'CF=1, OF=1 (DX has significant bits)' },
        { stepNumber: 2, operation: 'Signed IMUL: (-25) × 5 = -125 (FFFFFF83H)', intermediateResult: 'DX = FFFFH, AX = FF83H', flagImpact: 'CF=0, OF=0 (DX is pure sign extension)' },
        { stepNumber: 3, operation: 'Signed IDIV: CWD sign-extends -25 (AX=FFE7H) into DX:AX (FFFF:FFE7H)', intermediateResult: 'DX:AX = FFFFFFF7H', flagImpact: 'Sign preserved' },
        { stepNumber: 4, operation: 'Signed IDIV: (-25) / (+5) = Quotient -5 (FFFBH), Remainder 0', intermediateResult: 'AX = FFFBH (-5), DX = 0000H', flagImpact: 'Flags undefined after IDIV' }
      ],
      finalOutput: 'Unsigned Product = 000325A0H, Signed Quotient = -5 (FFFBH), Remainder = 0000H.'
    },
    industrialRelevance:
      'DSP audio equalization filters, graphics matrix coordinate transformations, and embedded PID motor controllers rely on high-precision signed fixed-point multiplication and division routines.'
  },

  exp_math: {
    principleTitle: 'Mathematical Series Generation: Square, Cube & Iterative Factorial',
    corePrinciple:
      'Arithmetic exponentiation and factorial computations are foundational algorithms in computational discrete mathematics. In 8086 assembly, squaring (N²) is computed via self-multiplication (MUL), cubing (N³) is achieved by multiplying the square result once more by the base (N² × N), and factorial (N!) is computed iteratively via a decrementing loop accumulator: N! = N × (N-1) × (N-2) × ... × 1.',
    keyConcepts: [
      {
        title: 'Accumulative Factorial Loop (N!)',
        description:
          'The factorial routine loads AX = 1 (identity multiplier). The loop counter CX is loaded with N. In each iteration, AX is multiplied by CX (MUL CX), and CX is decremented by the LOOP instruction until CX reaches 1.',
        badge: 'Loop Accumulator'
      },
      {
        title: '16-Bit Register Overflow Limits',
        description:
          'Because the 16-bit register AX has a maximum unsigned capacity of 65,535 (FFFFH), 8086 16-bit factorial computation is strictly bounded to N ≤ 8 (8! = 40,320). For N = 9 (9! = 362,880), the product overflows AX into DX.',
        badge: 'Arithmetic Boundary'
      }
    ],
    mathematicalFormulation: {
      formula: 'Square(N) = N × N\nCube(N) = N² × N\nFactorial(N) = ∏_{k=1}^{N} k = N × (N-1) × ... × 1, where 0! = 1',
      explanation: 'All calculations are computed iteratively using the hardware 16-bit ALU multiplier in register AX.',
      steps: [
        'Load base N into AL; compute Square via MUL AL → AX = N²',
        'Preserve N² in memory; compute Cube via MUL N → AX = N³',
        'Initialize Factorial Accumulator AX = 1, Loop Counter CX = N',
        'Loop: Multiply AX by CX, decrement CX; terminate when CX == 1'
      ]
    },
    architecturalMechanisms: [
      { feature: 'AL & AX Registers', role: 'Holds multiplicand and receives product of square and iterative factorial.' },
      { feature: 'CX Register', role: 'Stores loop iteration count, counting down from N to 1.' },
      { feature: 'LOOP Instruction', role: 'Decrements CX and executes conditional short branch if CX ≠ 0 in a single opcode.' }
    ],
    workedExample: {
      inputLabel: 'Input Number (N)',
      inputValue: 'N = 05H (5 Decimal)',
      calculationSteps: [
        { stepNumber: 1, operation: 'Square: AL = 05H; MUL AL  →  05H × 05H', intermediateResult: 'AX = 0019H (25 Dec)', flagImpact: 'CF=0, OF=0' },
        { stepNumber: 2, operation: 'Cube: AX = 0019H; MUL N  →  25 × 5', intermediateResult: 'AX = 007DH (125 Dec)', flagImpact: 'CF=0, OF=0' },
        { stepNumber: 3, operation: 'Factorial Step 1: AX = 1 × 5 = 5 (CX=4)', intermediateResult: 'AX = 0005H', flagImpact: 'Accumulator = 5' },
        { stepNumber: 4, operation: 'Factorial Step 2: AX = 5 × 4 = 20 (CX=3)', intermediateResult: 'AX = 0014H', flagImpact: 'Accumulator = 20' },
        { stepNumber: 5, operation: 'Factorial Step 3: AX = 20 × 3 = 60 (CX=2)', intermediateResult: 'AX = 003CH', flagImpact: 'Accumulator = 60' },
        { stepNumber: 6, operation: 'Factorial Step 4: AX = 60 × 2 = 120 (CX=1)', intermediateResult: 'AX = 0078H', flagImpact: 'Final Factorial = 120' }
      ],
      finalOutput: 'Square = 0019H (25), Cube = 007DH (125), Factorial = 0078H (120).'
    },
    industrialRelevance:
      'Polynomial Taylor-series expansions for trigonometric functions (sin, cos, exp) in embedded numeric coprocessors and scientific trajectory calculations.'
  },

  exp_bit1: {
    principleTitle: 'Two\'s Complement Sign Detection & Sign Flag (SF) Mechanics',
    corePrinciple:
      'In signed binary computer arithmetic, numbers are represented using Two\'s Complement format. In an 8-bit byte, Bit 7 (the MSB) is the dedicated Sign Bit: MSB = 0 indicates a positive number or zero (range 0 to +127), whereas MSB = 1 indicates a negative number (range -1 to -128). Testing the sign in 8086 can be performed by reading the Sign Flag (SF) after a TEST/OR instruction or by checking bit 7 with a bitmask.',
    keyConcepts: [
      {
        title: 'Sign Flag (SF) Status Bit in 8086',
        description:
          'Whenever an ALU operation (such as TEST, OR, ADD, SUB, CMP) is executed, the 8086 hardware directly copies the Most Significant Bit of the result into the Sign Flag (SF) in the FLAGS register. If bit 7 is 1, SF = 1; if bit 7 is 0, SF = 0.',
        badge: 'Condition Code'
      },
      {
        title: 'Non-Destructive Testing via TEST / OR AL, AL',
        description:
          'Executing `OR AL, AL` or `TEST AL, 80H` evaluates the status flags without modifying the operand data value, enabling conditional branch instructions like JS (Jump if Sign / Negative) and JNS (Jump if No Sign / Positive).',
        badge: 'Flag Trigger'
      }
    ],
    mathematicalFormulation: {
      formula: 'Sign(X) = (X AND 10000000B) >> 7  →  If 1, Negative (-); If 0, Positive (+)',
      explanation: 'Any 8-bit hex number from 80H to FFH represents a negative value in two\'s complement notation.',
      steps: [
        'Hex Range 00H to 7FH (00000000B to 01111111B) → MSB = 0 → Positive',
        'Hex Range 80H to FFH (10000000B to 11111111B) → MSB = 1 → Negative'
      ]
    },
    architecturalMechanisms: [
      { feature: 'Bit 7 of AL', role: 'The hardware sign bit examined by the processor.' },
      { feature: 'Sign Flag (SF)', role: 'Flag bit set to 1 if MSB of result is 1, indicating negative.' },
      { feature: 'JS / JNS Instructions', role: 'Conditional jump instructions that branch based on the state of the Sign Flag.' }
    ],
    workedExample: {
      inputLabel: 'Input Byte',
      inputValue: 'DATA_VAL = D3H (Binary: 1101 0011B)',
      calculationSteps: [
        { stepNumber: 1, operation: 'Load AL with D3H: AL = 11010011B', intermediateResult: 'Bit 7 = 1', flagImpact: 'MSB is set' },
        { stepNumber: 2, operation: 'Execute OR AL, AL (or TEST AL, 80H)', intermediateResult: 'Result = 11010011B', flagImpact: 'SF = 1, ZF = 0, PF = 0' },
        { stepNumber: 3, operation: 'Evaluate JS (Jump if Sign set)', intermediateResult: 'Branch taken to NEGATIVE label', flagImpact: 'Result variable set to 01H (Negative)' }
      ],
      finalOutput: 'Number is Negative (Two\'s complement decimal value = -45). Result code = 01H.'
    },
    industrialRelevance:
      'Sensor data acquisition systems where negative readings indicate reverse directional velocity, sub-zero temperature gradients, or signed error differentials.'
  },

  exp_bit2: {
    principleTitle: 'Parity Detection & Least Significant Bit (LSB) Odd/Even Validation',
    corePrinciple:
      'A binary integer is mathematically Even if it is evenly divisible by 2, which in binary representation means its Least Significant Bit (Bit 0) is 0. Conversely, an integer is Odd if Bit 0 is 1. In 8086 assembly, odd/even determination is performed by isolating Bit 0 using the bitwise AND instruction (`AND AL, 01H`) or `TEST AL, 01H`, followed by evaluating the Zero Flag (ZF).',
    keyConcepts: [
      {
        title: 'LSB Bit 0 Masking Principle',
        description:
          'Performing `TEST AL, 01H` performs a bitwise logical AND between AL and 00000001B. If Bit 0 was 0 (Even), the result is 00H, forcing the Zero Flag ZF = 1. If Bit 0 was 1 (Odd), the result is 01H, forcing ZF = 0.',
        badge: 'Bitwise Mask'
      },
      {
        title: 'Hardware Parity Flag (PF) vs Number Parity',
        description:
          'In 8086 architecture, the Parity Flag (PF) tests whether the total count of 1s in the lower 8 bits is even (PF=1) or odd (PF=0). This differs from numeric odd/even value testing, which strictly checks Bit 0.',
        badge: 'Flag Differentiation'
      }
    ],
    mathematicalFormulation: {
      formula: 'Is_Odd(N) = N mod 2 = N AND 00000001B  →  If 1, ODD; If 0, EVEN',
      explanation: 'Every binary power of 2 from 2¹ to 2¹⁵ produces an even sum; only 2⁰ (bit 0) contributes an odd weight.',
      steps: [
        'Bitwise AND with 01H: If (N & 01H) == 0 → ZF = 1 → JZ EVEN_LABEL',
        'If (N & 01H) != 0 → ZF = 0 → Number is ODD'
      ]
    },
    architecturalMechanisms: [
      { feature: 'Bit 0 of AL', role: 'The parity bit determining divisibility by 2.' },
      { feature: 'TEST Instruction', role: 'Executes bitwise AND without destroying the value stored in AL.' },
      { feature: 'Zero Flag (ZF)', role: 'Set to 1 if result is zero (Even), 0 if result is non-zero (Odd).' },
      { feature: 'JZ / JNZ Instructions', role: 'Branches conditionally based on the state of the Zero Flag.' }
    ],
    workedExample: {
      inputLabel: 'Test Number',
      inputValue: 'DATA_VAL = 2FH (47 Decimal, Binary: 0010 1111B)',
      calculationSteps: [
        { stepNumber: 1, operation: 'Load AL = 2FH (0010 1111B)', intermediateResult: 'Bit 0 is 1', flagImpact: 'Initial state' },
        { stepNumber: 2, operation: 'Execute TEST AL, 01H: (0010 1111B AND 0000 0001B)', intermediateResult: 'Bitwise result = 0000 0001B', flagImpact: 'ZF = 0 (Non-zero result)' },
        { stepNumber: 3, operation: 'Evaluate JZ (Jump if Zero): Condition is False', intermediateResult: 'Executes ODD path', flagImpact: 'RESULT variable = 01H (Odd)' }
      ],
      finalOutput: 'Number is ODD (47 decimal). Output Flag RESULT = 01H.'
    },
    industrialRelevance:
      'Serial UART communication framing parity checks (Odd/Even parity bits), interleaving algorithms in memory bank arbitration, and fast divisibility filtering in cryptography.'
  },

  exp_bit3: {
    principleTitle: 'Bit-Level Shift & Rotation Analysis: Counting 1s and 0s in Binary Vectors',
    corePrinciple:
      'Determining the exact bit-level composition of a byte or word requires inspecting each individual bit position sequentially. In 8086 assembly, this is accomplished by rotating or shifting the register through the Carry Flag (using ROR, ROL, SHR, or SHL) in an 8-iteration loop. After each shift, the Carry Flag (CF) captures the exiting bit, allowing conditional incrementing of 1-counters and 0-counters.',
    keyConcepts: [
      {
        title: 'Rotate Right through Carry (RCR / ROR)',
        description:
          'Rotating a register right by 1 bit (`ROR AL, 1`) shifts Bit 0 into both the Carry Flag (CF) and Bit 7. Inspecting CF with `JC` (Jump if Carry) immediately reveals whether the bit was a 1 or a 0.',
        badge: 'Bit Rotation'
      },
      {
        title: 'Complete 8-Bit Scan Loop',
        description:
          'Initializing loop counter CX = 8 ensures that all 8 bit positions (bits 0 through 7) are rotated and evaluated exactly once, preserving the original byte after 8 rotations.',
        badge: 'Scan Loop'
      }
    ],
    mathematicalFormulation: {
      formula: 'Count_Ones = ∑_{i=0}^{7} Bit_i,    Count_Zeros = 8 - Count_Ones',
      explanation: 'In an 8-bit byte, the sum of logical 1s and logical 0s is mathematically invariant and equal to 8.',
      steps: [
        'Initialize ONES_COUNT = 0, ZEROS_COUNT = 0, CX = 8',
        'Loop: ROR AL, 1  →  CF receives shifted bit',
        'If CF == 1: Increment ONES_COUNT; Else: Increment ZEROS_COUNT',
        'LOOP until CX == 0'
      ]
    },
    architecturalMechanisms: [
      { feature: 'ROR AL, 1', role: 'Hardware circular right rotation placing the current LSB into the Carry Flag.' },
      { feature: 'Carry Flag (CF)', role: 'Single-bit window reflecting the status of the rotated bit.' },
      { feature: 'BL & BH Registers', role: 'Dual hardware accumulators tracking count of 1s (BL) and 0s (BH).' },
      { feature: 'JC / JNC Instructions', role: 'Conditional branches navigating between the 1-increment and 0-increment blocks.' }
    ],
    workedExample: {
      inputLabel: 'Binary Data Byte',
      inputValue: 'DATA_VAL = A5H (Binary: 1010 0101B)',
      calculationSteps: [
        { stepNumber: 1, operation: 'Rotate Bit 0: Value 1 shifts into CF', intermediateResult: 'ONES = 1, ZEROS = 0', flagImpact: 'CF = 1' },
        { stepNumber: 2, operation: 'Rotate Bit 1: Value 0 shifts into CF', intermediateResult: 'ONES = 1, ZEROS = 1', flagImpact: 'CF = 0' },
        { stepNumber: 3, operation: 'Rotate Bit 2: Value 1 shifts into CF', intermediateResult: 'ONES = 2, ZEROS = 1', flagImpact: 'CF = 1' },
        { stepNumber: 4, operation: 'Rotate Bit 3: Value 0 shifts into CF', intermediateResult: 'ONES = 2, ZEROS = 2', flagImpact: 'CF = 0' },
        { stepNumber: 5, operation: 'Rotate Bit 4: Value 0 shifts into CF', intermediateResult: 'ONES = 2, ZEROS = 3', flagImpact: 'CF = 0' },
        { stepNumber: 6, operation: 'Rotate Bit 5: Value 1 shifts into CF', intermediateResult: 'ONES = 3, ZEROS = 3', flagImpact: 'CF = 1' },
        { stepNumber: 7, operation: 'Rotate Bit 6: Value 0 shifts into CF', intermediateResult: 'ONES = 3, ZEROS = 4', flagImpact: 'CF = 0' },
        { stepNumber: 8, operation: 'Rotate Bit 7: Value 1 shifts into CF', intermediateResult: 'ONES = 4, ZEROS = 4', flagImpact: 'CF = 1' }
      ],
      finalOutput: 'Total Ones (BL) = 04H (4), Total Zeros (BH) = 04H (4).'
    },
    industrialRelevance:
      'Hamming distance calculations in error-correcting codes (ECC memory), bitmask population counts (POPCNT) in database index search engines, and network subnet mask parsing.'
  },

  exp_arr1: {
    principleTitle: 'Array Traversal & Indexed Addressing: Cumulative Sum & Difference',
    corePrinciple:
      'An array is a contiguous collection of homogeneous data elements located at sequential memory addresses. In 8086 assembly, array elements are accessed using Indirect or Base-Index Addressing Modes via index registers (SI or DI). Array reduction operations (such as computing cumulative sum or progressive difference) use an accumulator register (AX/AL) updated iteratively inside a loop controlled by CX.',
    keyConcepts: [
      {
        title: 'Base-Indexed Addressing Mode `[SI]`',
        description:
          'Loading SI with the offset of the first array element (`LEA SI, ARRAY`) allows reading successive elements with `MOV AL, [SI]` followed by `INC SI` (or `ADD SI, 2` for word arrays).',
        badge: 'Addressing Mode'
      },
      {
        title: 'Accumulative Array Reduction',
        description:
          'Sum reduction starts with AX = 0 and performs `ADD AL, [SI]`. Difference reduction initializes AX with the first array element `ARRAY[0]` and iteratively subtracts subsequent elements (`SUB AL, [SI]`).',
        badge: 'Reduction Math'
      }
    ],
    mathematicalFormulation: {
      formula: 'Sum = ∑_{i=0}^{N-1} Array[i],    Difference = Array[0] - ∑_{i=1}^{N-1} Array[i]',
      explanation: 'The loop executes N times for summation and N-1 times for sequential difference computation.',
      steps: [
        'Initialize Sum = 0, Point SI to Array[0], CX = N',
        'Sum Loop: Add [SI] to Sum, increment SI, decrement CX until 0',
        'Difference Loop: Load Diff = Array[0], Point SI to Array[1], CX = N-1',
        'Subtract [SI] from Diff, increment SI, decrement CX until 0'
      ]
    },
    architecturalMechanisms: [
      { feature: 'SI / DI Registers', role: 'Index pointers holding memory offset addresses of sequential array elements.' },
      { feature: 'AL / AX Accumulator', role: 'Holds cumulative running sum and running difference.' },
      { feature: 'CX Register', role: 'Hardware loop iteration counter decremented on each pass.' }
    ],
    workedExample: {
      inputLabel: 'Array Elements',
      inputValue: 'ARRAY = [10H, 20H, 30H, 40H, 50H] (5 Elements)',
      calculationSteps: [
        { stepNumber: 1, operation: 'Sum Init: AL = 00H; Add 10H', intermediateResult: 'Sum = 10H', flagImpact: 'CF=0' },
        { stepNumber: 2, operation: 'Sum Step 2: Add 20H', intermediateResult: 'Sum = 30H', flagImpact: 'CF=0' },
        { stepNumber: 3, operation: 'Sum Step 3: Add 30H', intermediateResult: 'Sum = 60H', flagImpact: 'CF=0' },
        { stepNumber: 4, operation: 'Sum Step 4: Add 40H', intermediateResult: 'Sum = A0H', flagImpact: 'CF=0' },
        { stepNumber: 5, operation: 'Sum Step 5: Add 50H', intermediateResult: 'Sum = F0H (240 Dec)', flagImpact: 'Final Sum' },
        { stepNumber: 6, operation: 'Difference: 10H - 20H - 30H - 40H - 50H', intermediateResult: 'Diff = E0H (-32 Dec)', flagImpact: 'Final Diff' }
      ],
      finalOutput: 'Array Sum = 0F0H (240 Decimal), Array Difference = 0E0H (-32 Decimal / 2\'s complement).'
    },
    industrialRelevance:
      'Digital signal processing FIR filter convolution, digital sensor moving averages, statistical mean variance analysis, and graphics polygon vertex coordinate transformations.'
  },

  exp3: {
    principleTitle: 'Extremum Search: Linear Scan Maximum & Minimum Element Identification',
    corePrinciple:
      'Finding the maximum and minimum values in an unordered dataset is a fundamental search algorithm. In 8086 assembly, the linear scan algorithm initializes the candidate extremum with the first array element `ARRAY[0]`. The algorithm then iterates through the remaining elements, executing comparison instructions (`CMP AL, [SI]`). Conditional jumps (`JNC` / `JC` for unsigned or `JGE` / `JLE` for signed) selectively update the candidate registers when a new extremum is found.',
    keyConcepts: [
      {
        title: 'Non-Destructive CMP Instruction',
        description:
          'The `CMP Dest, Src` instruction internally performs `(Dest - Src)` and updates the flags (CF, ZF, SF, OF) without altering the value in Dest. If `AL < [SI]`, an unsigned borrow occurs and CF = 1.',
        badge: 'Comparison Logic'
      },
      {
        title: 'Conditional Branching on Carry Flag (JC / JNC)',
        description:
          'For unsigned numbers: If `CMP AL, [SI]` results in CF = 1 (`AL < [SI]`), the element in memory is larger; `JC` branches to replace `AL` with `[SI]`. If CF = 0, the existing maximum is retained.',
        badge: 'Branch Logic'
      }
    ],
    mathematicalFormulation: {
      formula: 'Max = max(A[0], A[1], ..., A[N-1]),    Min = min(A[0], A[1], ..., A[N-1])',
      explanation: 'Linear scan requires exactly (N - 1) comparison comparisons to guarantee finding the global maximum and minimum.',
      steps: [
        'Set MAX = ARRAY[0], MIN = ARRAY[0], Point SI to ARRAY[1], CX = N - 1',
        'Compare current element with MAX: If [SI] > MAX, update MAX = [SI]',
        'Compare current element with MIN: If [SI] < MIN, update MIN = [SI]',
        'Increment SI, decrement CX; continue until CX == 0'
      ]
    },
    architecturalMechanisms: [
      { feature: 'AL Register', role: 'Holds running maximum candidate during comparison.' },
      { feature: 'AH / BL Register', role: 'Holds running minimum candidate during comparison.' },
      { feature: 'CMP AL, [SI]', role: 'Performs arithmetic comparison to update condition flags.' },
      { feature: 'Carry Flag (CF)', role: 'Determines relative magnitude of unsigned byte operands.' }
    ],
    workedExample: {
      inputLabel: 'Array Vector',
      inputValue: 'ARRAY = [25H, 4AH, 12H, 8BH, 05H, 92H, 31H] (Length = 7)',
      calculationSteps: [
        { stepNumber: 1, operation: 'Initialize: MAX = 25H, MIN = 25H', intermediateResult: 'Scan index = 1 (4AH)', flagImpact: 'Baseline' },
        { stepNumber: 2, operation: 'Compare 4AH: 4AH > 25H → MAX = 4AH', intermediateResult: 'MAX = 4AH, MIN = 25H', flagImpact: 'MAX updated' },
        { stepNumber: 3, operation: 'Compare 12H: 12H < 25H → MIN = 12H', intermediateResult: 'MAX = 4AH, MIN = 12H', flagImpact: 'MIN updated' },
        { stepNumber: 4, operation: 'Compare 8BH: 8BH > 4AH → MAX = 8BH', intermediateResult: 'MAX = 8BH, MIN = 12H', flagImpact: 'MAX updated' },
        { stepNumber: 5, operation: 'Compare 05H: 05H < 12H → MIN = 05H', intermediateResult: 'MAX = 8BH, MIN = 05H', flagImpact: 'MIN updated' },
        { stepNumber: 6, operation: 'Compare 92H: 92H > 8BH → MAX = 92H', intermediateResult: 'MAX = 92H, MIN = 05H', flagImpact: 'MAX updated' },
        { stepNumber: 7, operation: 'Compare 31H: 05H < 31H < 92H (No change)', intermediateResult: 'MAX = 92H, MIN = 05H', flagImpact: 'Unchanged' }
      ],
      finalOutput: 'Global Maximum (MAX_VAL) = 92H (146 Dec), Global Minimum (MIN_VAL) = 05H (5 Dec).'
    },
    industrialRelevance:
      'Peak detector circuits in digital oscilloscopes, automatic gain control (AGC) in SDR receivers, and threshold alarms in industrial SCADA telemetry nodes.'
  },

  exp4: {
    principleTitle: 'Sorting Algorithms: Two-Pass Bubble Sort with Register Swapping',
    corePrinciple:
      'Bubble Sort is an elemental comparison-based sorting algorithm. In 8086 assembly, it operates via nested loops: the outer loop runs (N - 1) passes, and the inner loop scans adjacent memory pairs `(ARRAY[SI], ARRAY[SI+1])`. If the left element is greater than the right element (`CMP AL, [SI+1]`), the elements are swapped in memory. After each outer pass, the largest remaining unsorted element "bubbles" up to its correct final position.',
    keyConcepts: [
      {
        title: 'Nested Loop Structure (DX outer, CX inner)',
        description:
          '8086 registers manage the nested loop: DX acts as the outer pass counter (N-1 down to 1), while CX manages the inner adjacent element comparison loop.',
        badge: 'Nested Control'
      },
      {
        title: 'Memory-to-Memory Exchange via Registers',
        description:
          'Because the 8086 architecture does not permit direct memory-to-memory data transfers (`MOV [SI], [SI+1]` is invalid), swaps are mediated using registers: `MOV AL, [SI]`, `MOV DL, [SI+1]`, `MOV [SI], DL`, `MOV [SI+1], AL`.',
        badge: 'Swap Protocol'
      }
    ],
    mathematicalFormulation: {
      formula: 'Total Comparisons = [N × (N - 1)] / 2,   Time Complexity = O(N²)',
      explanation: 'For an array of 5 elements, Bubble Sort performs (4 + 3 + 2 + 1) = 10 comparison steps to guarantee full ascending order.',
      steps: [
        'Outer Pass 1: Compare pairs (0,1), (1,2), (2,3), (3,4) → Largest element at end',
        'Outer Pass 2: Compare pairs (0,1), (1,2), (2,3) → Second largest in place',
        'Outer Pass 3: Compare pairs (0,1), (1,2) → Third largest in place',
        'Outer Pass 4: Compare pair (0,1) → Entire array is sorted'
      ]
    },
    architecturalMechanisms: [
      { feature: 'SI Register', role: 'Points to current adjacent element pair [SI] and [SI+1].' },
      { feature: 'AL & DL Registers', role: 'Hold adjacent byte values to perform comparisons and intermediate swapping.' },
      { feature: 'JNC / JC Instructions', role: 'Branch over the swap routine if adjacent elements are already in order.' }
    ],
    workedExample: {
      inputLabel: 'Unsorted Array',
      inputValue: 'ARRAY = [88H, 11H, 55H, 22H, 44H] (5 Elements)',
      calculationSteps: [
        { stepNumber: 1, operation: 'Pass 1 (Pair 88H, 11H): 88H > 11H → SWAP', intermediateResult: '[11H, 88H, 55H, 22H, 44H]', flagImpact: 'Swap 1' },
        { stepNumber: 2, operation: 'Pass 1 (Pair 88H, 55H): 88H > 55H → SWAP', intermediateResult: '[11H, 55H, 88H, 22H, 44H]', flagImpact: 'Swap 2' },
        { stepNumber: 3, operation: 'Pass 1 (Pair 88H, 22H): 88H > 22H → SWAP', intermediateResult: '[11H, 55H, 22H, 88H, 44H]', flagImpact: 'Swap 3' },
        { stepNumber: 4, operation: 'Pass 1 (Pair 88H, 44H): 88H > 44H → SWAP', intermediateResult: '[11H, 55H, 22H, 44H, 88H]', flagImpact: '88H in final position' },
        { stepNumber: 5, operation: 'Passes 2 & 3: Settle remaining intermediate pairs', intermediateResult: '[11H, 22H, 44H, 55H, 88H]', flagImpact: 'Fully sorted' }
      ],
      finalOutput: 'Ascending Sorted Array = [11H, 22H, 44H, 55H, 88H].'
    },
    industrialRelevance:
      'Embedded microcontroller look-up table ordering, priority task queue scheduling in RTOS, and sensor calibration rank-order filtering.'
  },

  exp_str1: {
    principleTitle: 'String Manipulation Primitives: Scanning & Length Determination (SCASB)',
    corePrinciple:
      'In assembly language, character strings are arrays of ASCII bytes terminated by a sentinel character (such as \'$\' for DOS INT 21H or 00H for C-style null-terminated strings). The 8086 provides dedicated hardware string instructions, notably `SCASB` (Scan String Byte), which compares AL with the memory byte at `ES:[DI]` and automatically updates DI based on the Direction Flag (DF).',
    keyConcepts: [
      {
        title: 'Repeat While Not Equal Prefix (REPNE / REPNZ)',
        description:
          'When `REPNE SCASB` is executed, the processor decrements CX and compares `AL` with `ES:[DI]` repeatedly as long as `CX ≠ 0` and `ZF = 0` (character not found). It stops immediately when a match is found.',
        badge: 'String Primitive'
      },
      {
        title: 'Length Calculation Arithmetic',
        description:
          'By initializing CX with FFFFH (-1) before `REPNE SCASB`, the string length is derived mathematically by inverting the remaining CX count: `Length = FFFFH - Final_CX - 1` (or using `NOT CX` followed by `DEC CX`).',
        badge: 'Pointer Math'
      },
      {
        title: 'Direction Flag (CLD / STD)',
        description:
          'Executing `CLD` clears the Direction Flag (DF = 0), configuring all string operations to auto-increment pointers (SI++, DI++) from lower to higher memory addresses.',
        badge: 'Control Flag'
      }
    ],
    mathematicalFormulation: {
      formula: 'Length = Initial_CX - Final_CX - 1 = Offset(\'$\') - Offset(Start String)',
      explanation: 'Dedicated 8086 microcode string instructions execute scanning loops in hardware significantly faster than software-based CMP loops.',
      steps: [
        'Load AL = \'$\' (24H sentinel), Load ES = DS, DI = Offset of String',
        'Load CX = 0FFFFH (Maximum scan range), Clear Direction Flag (CLD)',
        'Execute REPNE SCASB (Hardware scans until \'$\' is found)',
        'Compute Length = NOT CX - 1; store length in memory'
      ]
    },
    architecturalMechanisms: [
      { feature: 'ES:DI Register Pair', role: 'Dedicated Extra Segment base and Destination Index for string scan targets.' },
      { feature: 'AL Register', role: 'Holds target sentinel character being searched (\'$\' = 24H).' },
      { feature: 'Direction Flag (DF)', role: 'Controls auto-increment (DF=0, CLD) or auto-decrement (DF=1, STD).' },
      { feature: 'REPNE Prefix', role: 'Hardware repeat prefix that iterates while Zero Flag is 0 and CX is non-zero.' }
    ],
    workedExample: {
      inputLabel: 'Target String',
      inputValue: 'STR_VAL = "KUPPAM$" (ASCII Bytes: 4BH, 55H, 50H, 50H, 41H, 4DH, 24H)',
      calculationSteps: [
        { stepNumber: 1, operation: 'Initialize: AL = 24H (\'$\'), CX = FFFFH, DI = Offset(STR_VAL), CLD', intermediateResult: 'DI points to \'K\'', flagImpact: 'DF = 0' },
        { stepNumber: 2, operation: 'REPNE SCASB scan: Scans 6 characters (\'K\',\'U\',\'P\',\'P\',\'A\',\'M\')', intermediateResult: 'CX decremented 6 times', flagImpact: 'ZF = 0' },
        { stepNumber: 3, operation: '7th Byte Scan: Match found on \'$\' (24H == 24H)', intermediateResult: 'ZF = 1 (Loop terminates)', flagImpact: 'Final CX = FFF9H' },
        { stepNumber: 4, operation: 'Calculate: NOT CX = NOT(FFF9H) = 0006H; DEC CX = 0006H', intermediateResult: 'Length = 6 characters', flagImpact: 'Length verified' }
      ],
      finalOutput: 'String Length = 0006H (6 characters excluding \'$\').'
    },
    industrialRelevance:
      'High-throughput network packet header parsing, database text indexers, compiler lexical tokenizers, and POSIX `strlen()` library implementations.'
  },

  exp_str2: {
    principleTitle: 'Operating System Interfacing: DOS INT 21H String Output Services',
    corePrinciple:
      'Assembly programs interact with underlying operating system facilities (keyboard, screen, disk) via Software Interrupts. In MS-DOS / PC-DOS, Interrupt 21H provides standardized kernel services. Function 09H (`AH = 09H`) is the dedicated string display service: it prints a sequence of ASCII characters starting at the address specified by `DS:DX` to the console until it encounters a terminating \'$\' (ASCII 24H) delimiter.',
    keyConcepts: [
      {
        title: 'DOS Service Function 09H (Print String)',
        description:
          'To display a string: load `AH = 09H`, load `DX` with the string offset address (`LEA DX, MESSAGE`), and execute `INT 21H`. DOS streams characters to standard video output.',
        badge: 'DOS API'
      },
      {
        title: 'Program Termination Function 4CH',
        description:
          'When execution finishes, the program must return control to the DOS shell. Loading `AH = 4CH` (with exit return code `AL = 00H`) followed by `INT 21H` cleanly releases memory and prevents CPU lockups.',
        badge: 'OS Exit'
      }
    ],
    mathematicalFormulation: {
      formula: 'INT 21H (AH = 09H) → Emit ASCII byte stream from DS:[DX] until \'$\' (24H) is reached',
      explanation: 'Software interrupts push FLAGS, CS, and IP onto the stack and transfer CPU control to the vector table address at 0000:0084H.',
      steps: [
        'Load DS with @DATA segment address',
        'Load DX with offset of string: LEA DX, MSG',
        'Load AH = 09H (DOS Display String service)',
        'Execute INT 21H (Trigger interrupt service routine)',
        'Load AH = 4CH; INT 21H (Terminate program)'
      ]
    },
    architecturalMechanisms: [
      { feature: 'AH Register', role: 'Contains the specific DOS service function number (09H for display, 4CH for exit).' },
      { feature: 'DX Register', role: 'Holds the memory offset address of the target string buffer.' },
      { feature: 'INT 21H Vector', role: 'Software interrupt vector transferring execution to the DOS kernel dispatcher.' }
    ],
    workedExample: {
      inputLabel: 'String Buffer in Data Segment',
      inputValue: 'MSG DB "HELLO FROM 8086 MICRO-COURSE$"',
      calculationSteps: [
        { stepNumber: 1, operation: 'Initialize Data Segment: MOV AX, @DATA; MOV DS, AX', intermediateResult: 'DS points to program variables', flagImpact: 'Segment valid' },
        { stepNumber: 2, operation: 'Load string pointer: LEA DX, MSG', intermediateResult: 'DX = 0000H (Offset of MSG)', flagImpact: 'Pointer set' },
        { stepNumber: 3, operation: 'Invoke DOS display service: MOV AH, 09H; INT 21H', intermediateResult: 'Stream sent to terminal screen', flagImpact: 'Terminal Output' },
        { stepNumber: 4, operation: 'Exit to DOS: MOV AH, 4CH; INT 21H', intermediateResult: 'Process terminated with code 00H', flagImpact: 'Clean return' }
      ],
      finalOutput: 'Console Output: "HELLO FROM 8086 MICRO-COURSE" displayed on terminal.'
    },
    industrialRelevance:
      'Embedded BIOS console diagnostics, firmware boot message logs, and operating system system-call dispatch mechanics (POSIX sys_write).'
  },

  exp_str3: {
    principleTitle: 'String Comparison & Equivalence Verification (CMPSB)',
    corePrinciple:
      'Comparing two character strings involves verifying whether every corresponding byte pair `(STR1[i], STR2[i])` is identical across the entire string length. The 8086 hardware provides the `CMPSB` (Compare String Byte) instruction: it compares the byte at `DS:[SI]` with the byte at `ES:[DI]` by computing `[SI] - [DI]`, updates the status flags (ZF, CF, SF), and automatically increments both SI and DI.',
    keyConcepts: [
      {
        title: 'Repeat While Equal Prefix (REPE / REPZ)',
        description:
          '`REPE CMPSB` executes repeated comparisons as long as `CX ≠ 0` and `ZF = 1` (characters remain identical). If any character mismatch occurs, ZF is cleared to 0, and the repeat loop terminates immediately.',
        badge: 'Hardware Comparator'
      },
      {
        title: 'Zero Flag (ZF) Result Evaluation',
        description:
          'After `REPE CMPSB` completes, checking `JZ` (Jump if Zero) reveals the outcome: if ZF = 1, all characters matched (Strings Equal); if ZF = 0, a mismatch occurred (Strings Not Equal).',
        badge: 'Equivalence Test'
      }
    ],
    mathematicalFormulation: {
      formula: 'STR1 == STR2 ⟺ For all i ∈ [0, N-1]: STR1[i] == STR2[i] → ZF = 1 upon loop exit',
      explanation: 'Early exit optimization: `REPE CMPSB` aborts at the first non-matching byte, providing O(1) best-case and O(N) worst-case comparison time.',
      steps: [
        'Set SI = Offset(STR1), DI = Offset(STR2), CX = Length of Strings',
        'Set ES = DS, Clear Direction Flag (CLD)',
        'Execute REPE CMPSB',
        'If ZF == 1: Set RESULT = 00H (Equal); Else: Set RESULT = 01H (Not Equal)'
      ]
    },
    architecturalMechanisms: [
      { feature: 'DS:SI & ES:DI', role: 'Source pointer (STR1) and destination pointer (STR2) auto-incremented in lockstep.' },
      { feature: 'Zero Flag (ZF)', role: 'Asserted (ZF=1) if character pair matches; cleared (ZF=0) on first discrepancy.' },
      { feature: 'REPE Prefix', role: 'Hardware loop primitive continuing execution while ZF=1 and CX>0.' }
    ],
    workedExample: {
      inputLabel: 'Comparison Test Strings',
      inputValue: 'STR1 = "HELLO", STR2 = "HELLO" (Length = 5)',
      calculationSteps: [
        { stepNumber: 1, operation: 'Initialize: SI = Offset(STR1), DI = Offset(STR2), CX = 5, CLD', intermediateResult: 'Pointers initialized', flagImpact: 'DF = 0' },
        { stepNumber: 2, operation: 'Byte 0: \'H\' vs \'H\' (48H - 48H = 0)', intermediateResult: 'Match, CX = 4', flagImpact: 'ZF = 1' },
        { stepNumber: 3, operation: 'Byte 1: \'E\' vs \'E\' (45H - 45H = 0)', intermediateResult: 'Match, CX = 3', flagImpact: 'ZF = 1' },
        { stepNumber: 4, operation: 'Byte 2: \'L\' vs \'L\' (4CH - 4CH = 0)', intermediateResult: 'Match, CX = 2', flagImpact: 'ZF = 1' },
        { stepNumber: 5, operation: 'Byte 3: \'L\' vs \'L\' (4CH - 4CH = 0)', intermediateResult: 'Match, CX = 1', flagImpact: 'ZF = 1' },
        { stepNumber: 6, operation: 'Byte 4: \'O\' vs \'O\' (4FH - 4FH = 0)', intermediateResult: 'Match, CX = 0 (Loop end)', flagImpact: 'ZF = 1' }
      ],
      finalOutput: 'Strings are Identical (ZF = 1). Status code RESULT = 00H (Equal).'
    },
    industrialRelevance:
      'Password authentication hash verification, command-line interpreter (CLI) syntax parsers, and compiler symbol table lookup routines.'
  },

  exp_str4: {
    principleTitle: 'String Symmetry & Palindrome Validation: Bidirectional Scanning',
    corePrinciple:
      'A string is defined as a Palindrome if it reads identically forwards and backwards (e.g., "MADAM", "RADAR"). In 8086 assembly, palindrome verification is conducted by either: (1) Reversing the source string into a secondary memory buffer using backward pointer traversal (`SI` decrementing while `DI` increments) followed by `REPE CMPSB`, or (2) Dual-pointer convergence scanning where left pointer increments while right pointer decrements until they meet in the middle.',
    keyConcepts: [
      {
        title: 'Backward Character Copy Loop',
        description:
          'To reverse a string: point SI to the last character (`Offset + Length - 1`) and DI to the start of `REV_STR`. Copy each byte with `MOV AL, [SI]`, `MOV [DI], AL`, then `DEC SI` and `INC DI` across a loop of length N.',
        badge: 'Reversal Algorithm'
      },
      {
        title: 'Symmetry Comparison Phase',
        description:
          'Once the reversed string is synthesized, pointers SI and DI are re-initialized to the beginning of the original and reversed strings, and `REPE CMPSB` validates symmetry.',
        badge: 'Symmetry Check'
      }
    ],
    mathematicalFormulation: {
      formula: 'IsPalindrome(S) ⟺ For all i ∈ [0, ⌊N / 2⌋]: S[i] == S[N - 1 - i]',
      explanation: 'Symmetry requires exact character match between the mirror reflections about the string\'s center axis.',
      steps: [
        'Compute or load String Length N',
        'Reversal Stage: Point SI to S[N-1], DI to REV_STR[0]; copy backward N times',
        'Comparison Stage: Set SI to S[0], DI to REV_STR[0], CX = N; run REPE CMPSB',
        'If ZF == 1: String is Palindrome (00H); Else: Not Palindrome (01H)'
      ]
    },
    architecturalMechanisms: [
      { feature: 'SI Register', role: 'Initially walks backward (DEC SI) during reversal, then forwards during comparison.' },
      { feature: 'DI Register', role: 'Points to destination reverse buffer (REV_STR).' },
      { feature: 'Zero Flag (ZF)', role: 'Asserted if the reversed string matches the original character-by-character.' }
    ],
    workedExample: {
      inputLabel: 'Candidate Palindrome String',
      inputValue: 'STR1 = "MADAM" (Length = 5)',
      calculationSteps: [
        { stepNumber: 1, operation: 'Point SI to STR1[4] (\'M\'), DI to REV_STR[0]', intermediateResult: 'Copy \'M\' to REV_STR[0]', flagImpact: 'SI=3, DI=1' },
        { stepNumber: 2, operation: 'Copy STR1[3] (\'A\') to REV_STR[1]', intermediateResult: 'Copy \'A\' to REV_STR[1]', flagImpact: 'SI=2, DI=2' },
        { stepNumber: 3, operation: 'Copy STR1[2] (\'D\') to REV_STR[2]', intermediateResult: 'Copy \'D\' to REV_STR[2]', flagImpact: 'SI=1, DI=3' },
        { stepNumber: 4, operation: 'Copy STR1[1] (\'A\') to REV_STR[3]', intermediateResult: 'Copy \'A\' to REV_STR[3]', flagImpact: 'SI=0, DI=4' },
        { stepNumber: 5, operation: 'Copy STR1[0] (\'M\') to REV_STR[4]', intermediateResult: 'REV_STR = "MADAM"', flagImpact: 'Reversal complete' },
        { stepNumber: 6, operation: 'Execute REPE CMPSB ("MADAM" vs "MADAM")', intermediateResult: 'All 5 characters match', flagImpact: 'ZF = 1 (Palindrome)' }
      ],
      finalOutput: '"MADAM" is a Palindrome. Result status flag = 00H (Palindrome confirmed).'
    },
    industrialRelevance:
      'Genomic DNA sequence palindrome restriction enzyme recognition site analysis in bioinformatics, symmetric cryptographic hash validation, and reversible token verification.'
  },

  exp_clock1: {
    principleTitle: 'DOS Real-Time Clock Services & Software Interrupt INT 21H Architecture',
    corePrinciple:
      'The DOS operating system provides standardized real-mode hardware abstraction through software interrupt INT 21H. To query system wall-clock time, Function AH = 2CH queries the internal Real-Time Clock (RTC) and returns the current time in binary format across CPU registers: CH = Hours (00-23), CL = Minutes (00-59), DH = Seconds (00-59), and DL = Hundredths of a second (00-99). To render this time on the standard video terminal, binary byte values must be unpacked into individual tens and units digits and converted into printable ASCII characters by adding 30H (\'0\').',
    keyConcepts: [
      {
        title: 'DOS Function AH = 2CH (Get System Time)',
        description:
          'When INT 21H is triggered with AH = 2CH, DOS reads the BIOS clock data and loads the current 24-hour time into the CX (CH=Hours, CL=Minutes) and DX (DH=Seconds, DL=Hundredths) register pairs.',
        badge: 'DOS RTC Service'
      },
      {
        title: 'Binary to ASCII Decomposition (AAM / DIV Algorithm)',
        description:
          'A binary byte value between 00 and 59 is divided by 10 (or processed using AAM) to separate the tens quotient and units remainder. Adding 30H to both nibbles yields valid ASCII digits ready for character streaming.',
        badge: 'ASCII Conversion'
      },
      {
        title: 'Character Output Service (INT 21H / AH = 02H)',
        description:
          'Individual characters (such as numeric digits and \':\' delimiters) are written to standard output by placing the ASCII code in DL and executing INT 21H with AH = 02H.',
        badge: 'Standard Console I/O'
      }
    ],
    mathematicalFormulation: {
      formula: 'Digit_Tens = ⌊Val / 10⌋ + 30H (ASCII),   Digit_Units = (Val mod 10) + 30H (ASCII)',
      explanation: 'Unpacking an 8-bit binary integer into decimal digits for ASCII display requires modulus and division by 10.',
      steps: [
        'Load AH = 2CH, execute INT 21H to retrieve system time in CH, CL, DH, DL',
        'Extract Hours (CH): Tens = CH / 10 + 30H; Units = CH mod 10 + 30H; Display via AH=02H',
        'Display ASCII colon delimiter \':\' (3AH)',
        'Extract Minutes (CL): Tens = CL / 10 + 30H; Units = CL mod 10 + 30H; Display via AH=02H',
        'Display ASCII colon delimiter \':\' (3AH)',
        'Extract Seconds (DH): Tens = DH / 10 + 30H; Units = DH mod 10 + 30H; Display via AH=02H'
      ]
    },
    architecturalMechanisms: [
      { feature: 'AH Register', role: 'DOS interrupt multiplexer: 2CH (Get Time), 02H (Display Char), 4CH (Exit).' },
      { feature: 'CH / CL Registers', role: 'Return registers for current 24-hour Hours (00-23) and Minutes (00-59).' },
      { feature: 'DH / DL Registers', role: 'Return registers for Seconds (00-59) and Hundredths (00-99); DL is also used as output character buffer for AH=02H.' },
      { feature: 'Software INT 21H', role: 'DOS Application Programming Interface (API) vector located at memory address 0000:0084H.' }
    ],
    workedExample: {
      inputLabel: 'System RTC Hardware Time Readout',
      inputValue: 'CH = 14 (0EH), CL = 35 (23H), DH = 28 (1CH), DL = 50 (32H)',
      calculationSteps: [
        { stepNumber: 1, operation: 'Call INT 21H / AH = 2CH', intermediateResult: 'CX = 0E23H, DX = 1C32H', flagImpact: 'Time captured' },
        { stepNumber: 2, operation: 'Process Hours (CH=14): 14 / 10 = 1, 14 mod 10 = 4', intermediateResult: 'ASCII \'1\' (31H), \'4\' (34H)', flagImpact: 'Output "14"' },
        { stepNumber: 3, operation: 'Process Colon Delimiter', intermediateResult: 'ASCII \':\' (3AH)', flagImpact: 'Output ":"' },
        { stepNumber: 4, operation: 'Process Minutes (CL=35): 35 / 10 = 3, 35 mod 10 = 5', intermediateResult: 'ASCII \'3\' (33H), \'5\' (35H)', flagImpact: 'Output "35"' },
        { stepNumber: 5, operation: 'Process Colon Delimiter', intermediateResult: 'ASCII \':\' (3AH)', flagImpact: 'Output ":"' },
        { stepNumber: 6, operation: 'Process Seconds (DH=28): 28 / 10 = 2, 28 mod 10 = 8', intermediateResult: 'ASCII \'2\' (32H), \'8\' (38H)', flagImpact: 'Output "28"' }
      ],
      finalOutput: 'Console display prints: "14:35:28" (Formatted 24-hour system clock).'
    },
    industrialRelevance:
      'Embedded RTOS task scheduling timestamps, transaction journaling in point-of-sale terminals, and precision process control audit trail generation.'
  },

  exp_clock2: {
    principleTitle: 'Interactive Digital Clock with Screen Cursor Control & BIOS/DOS Coordination',
    corePrinciple:
      'A continuous real-time digital clock requires seamless synchronization between BIOS video hardware management and DOS system time services. BIOS Interrupt INT 10H / Function AH = 02H controls hardware cursor positioning on the active video page (specifying row 0-24 and column 0-79). By continuously updating the time at a fixed screen coordinate and testing for user keystroke events via non-blocking console input services (INT 21H / AH = 0BH or INT 16H), an interactive full-screen dashboard clock is achieved without screen jitter.',
    keyConcepts: [
      {
        title: 'BIOS INT 10H / AH = 02H (Set Cursor Position)',
        description:
          'Positions the hardware text cursor at row DH (0-24) and column DL (0-79) on video page BH = 0. This enables in-place over-writing of previous time characters without requiring full screen re-clearing.',
        badge: 'BIOS Video Service'
      },
      {
        title: 'Zero-Flicker Time Delta Detection Loop',
        description:
          'Rather than updating the screen thousands of times every millisecond, the software caches the previous second (PREV_SEC) and only redraws the video buffer when the newly read second differs (DH != PREV_SEC).',
        badge: 'Flicker Elimination'
      },
      {
        title: 'Non-Blocking Keyboard Polling (INT 21H / AH = 0BH)',
        description:
          'Checks standard input status without stalling the CPU loop. If AL = 00H (no key pressed), the clock loop continues ticking; if AL = FFH (key available), the program consumes the key and exits cleanly.',
        badge: 'Asynchronous Polling'
      }
    ],
    mathematicalFormulation: {
      formula: 'Linear VRAM Offset = (Row × 80 + Col) × 2,   ΔT = T_current - T_previous ≥ 1.0 sec',
      explanation: 'Video text buffer address resolution combined with single-second discrete sampling ensures minimal CPU overhead.',
      steps: [
        'Position cursor at center of display (Row 12, Column 35) via INT 10H / AH=02H',
        'Read system time using INT 21H / AH=2CH',
        'Compare current second (DH) with PREV_SEC; if equal, skip redrawing',
        'Format HH:MM:SS into memory string buffer TIME_STR',
        'Display string via INT 21H / AH=09H (LEA DX, TIME_STR)',
        'Check keyboard buffer status via INT 21H / AH=0BH; if key pressed, terminate via AH=4CH'
      ]
    },
    architecturalMechanisms: [
      { feature: 'DH & DL (INT 10H)', role: 'Specifies target Screen Row (0..24) and Target Screen Column (0..79).' },
      { feature: 'BH Register', role: 'Specifies the active video display page (typically Page 00H).' },
      { feature: 'DX Register (INT 21H AH=09H)', role: 'Holds offset pointer to \'$\'-terminated ASCII string buffer (TIME_STR).' },
      { feature: 'DOS AH=0BH / 08H', role: 'Non-blocking keyboard status query and character flush service.' }
    ],
    workedExample: {
      inputLabel: 'Clock Loop Parameters & System RTC',
      inputValue: 'Screen Coordinates: Row 12 (0CH), Column 35 (23H), RTC Time = 18:45:09',
      calculationSteps: [
        { stepNumber: 1, operation: 'Set cursor: AH=02H, BH=00H, DH=0CH, DL=23H, INT 10H', intermediateResult: 'Hardware cursor moved to (12, 35)', flagImpact: 'Screen ready' },
        { stepNumber: 2, operation: 'Read Time: INT 21H / AH=2CH', intermediateResult: 'CH=18 (12H), CL=45 (2DH), DH=09 (09H)', flagImpact: 'Time updated' },
        { stepNumber: 3, operation: 'Convert & Format to TIME_STR buffer', intermediateResult: 'TIME_STR = "18:45:09$"', flagImpact: 'Memory populated' },
        { stepNumber: 4, operation: 'Output string: LEA DX, TIME_STR; INT 21H / AH=09H', intermediateResult: 'Text rendered at (12,35)', flagImpact: 'Display refreshed' },
        { stepNumber: 5, operation: 'Poll keyboard: INT 21H / AH=0BH', intermediateResult: 'AL = 00H (No key pressed)', flagImpact: 'Continue loop' }
      ],
      finalOutput: 'Stable real-time digital clock rendered in place at screen center until user keypress.'
    },
    industrialRelevance:
      'Human-Machine Interface (HMI) real-time status banners, embedded industrial automation control heads, and BIOS configuration utility dashboards.'
  },

  exp_clock3: {
    principleTitle: 'Real-Time Clock Synchronization via BIOS Timer Data Area & 18.2 Hz PIT Hardware Ticks',
    corePrinciple:
      'At the lowest hardware layer of the IBM PC architecture, the 8253/8254 Programmable Interval Timer (PIT) Channel 0 receives a 1.193182 MHz oscillator input and divides it by 65536 to pulse Hardware Interrupt IRQ0 (INT 08H) approximately 18.2065 times per second. The BIOS INT 08H interrupt handler increments a 32-bit tick counter maintained in the BIOS Data Area (BDA) at memory location 0040:006CH. By invoking BIOS Interrupt INT 1AH / Function AH = 00H, an application can read this 32-bit tick count in register pair CX:DX and mathematically derive high-precision real-time hours, minutes, and seconds.',
    keyConcepts: [
      {
        title: '8253/8254 PIT Hardware Timer (18.2065 Hz)',
        description:
          'The PIT oscillator generates timer ticks at 18.20648 Hz. This yields 1092.38 ticks per minute, 65543 ticks per hour, and exactly 1,573,040 ticks in a full 24-hour cycle.',
        badge: 'PIT Hardware Timer'
      },
      {
        title: 'BIOS INT 1AH / AH = 00H (Read Real-Time Clock Ticks)',
        description:
          'Reads the 32-bit tick counter from BDA address 0040:006CH into CX (High Word) and DX (Low Word), while returning AL = 00H (no midnight rollover) or AL = 01H (midnight rollover occurred).',
        badge: 'BIOS RTC Service'
      },
      {
        title: '32-Bit Arithmetic Scaling & Time Conversion',
        description:
          'Ticks are converted to seconds via integer division by 18.2 (or multiplied by 10 and divided by 182). Dividing total seconds by 3600 yields hours; dividing the remainder by 60 gives minutes and seconds.',
        badge: 'Fixed-Point Scaling'
      }
    ],
    mathematicalFormulation: {
      formula: 'Total Sec = ⌊(Ticks × 10) / 182⌋,   Hours = ⌊Ticks / 65543⌋,   Min = ⌊(Ticks mod 65543) / 1092⌋',
      explanation: 'Mathematical derivation of standard time units from 18.2065 Hz hardware timer tick counts.',
      steps: [
        'Execute INT 1AH / AH=00H to read 32-bit tick count into CX:DX',
        'Calculate Hours = Ticks / 65543 (00010007H ticks/hour)',
        'Calculate Remaining Ticks = Ticks mod 65543',
        'Calculate Minutes = Remaining Ticks / 1092 (0444H ticks/minute)',
        'Calculate Seconds = (Remaining Ticks mod 1092) * 10 / 182',
        'Convert Hours, Minutes, Seconds to ASCII and print to screen'
      ]
    },
    architecturalMechanisms: [
      { feature: '8253/8254 PIT (Channel 0)', role: 'Hardware timer generating 18.2 Hz interrupts to CPU INTR pin via 8259A PIC IRQ0.' },
      { feature: 'BIOS Data Area (0040:006CH)', role: 'Four-byte memory area storing the active 32-bit tick counter updated by INT 08H.' },
      { feature: 'CX:DX Register Pair', role: 'Returns 32-bit timer count (CX = High 16 bits, DX = Low 16 bits) from INT 1AH.' },
      { feature: 'AL Register (INT 1AH)', role: 'Midnight rollover flag: 00H = Same day, Non-zero = Midnight 24-hour rollover passed.' }
    ],
    workedExample: {
      inputLabel: 'BIOS Hardware Timer Tick Counter',
      inputValue: 'CX:DX = 000E5C90H (941,200 Decimal Ticks since Midnight)',
      calculationSteps: [
        { stepNumber: 1, operation: 'Read BDA via INT 1AH AH=00H', intermediateResult: 'CX = 000EH, DX = 5C90H (941,200 Ticks)', flagImpact: 'AL = 00H' },
        { stepNumber: 2, operation: 'Hours = 941,200 / 65,543', intermediateResult: 'Hours = 14 (Quotient), Remainder = 23,598 ticks', flagImpact: 'Hours = 14' },
        { stepNumber: 3, operation: 'Minutes = 23,598 / 1,092', intermediateResult: 'Minutes = 21 (Quotient), Remainder = 666 ticks', flagImpact: 'Minutes = 21' },
        { stepNumber: 4, operation: 'Seconds = (666 * 10) / 182', intermediateResult: 'Seconds = 36 (Quotient)', flagImpact: 'Seconds = 36' },
        { stepNumber: 5, operation: 'Assemble ASCII string', intermediateResult: '"14:21:36"', flagImpact: 'Conversion complete' }
      ],
      finalOutput: 'Derived Time from BIOS Ticks: "14:21:36" (Accurate to within 55 milliseconds).'
    },
    industrialRelevance:
      'Low-level hardware benchmarking, microsecond timeout handlers in network device drivers, high-resolution game loop physics engines, and RTOS tick timers.'
  },

  exp_stepper1: {
    principleTitle: 'Interfacing Stepper Motor with 8086 – Clockwise Rotation & Variable Step-Size',
    corePrinciple:
      'A stepper motor is an open-loop brushless electromechanical actuator that converts digital electrical pulses into precise, discrete angular shaft movements. Interfacing a 4-phase unipolar stepper motor to an 8086 microprocessor requires an Intel 8255 Programmable Peripheral Interface (PPI) configured in Mode 0 (Basic I/O) and a ULN2003 Darlington transistor array driver. In 2-phase full-step excitation mode, two adjacent stator windings are energized simultaneously (09H -> 0AH -> 06H -> 05H), generating high holding torque and rotating the rotor clockwise. With a standard step angle of 1.8°, one complete 360° revolution corresponds to 200 discrete steps. The 8086 microprocessor achieves variable step-size control by executing a user-defined step count N in register CX, while rotation speed is regulated by software delay loops.',
    keyConcepts: [
      {
        title: '8255 PPI Mode 0 Configuration (CWR = 80H)',
        description:
          'Writing control word 80H (10000000B) to the 8255 Control Word Register (Address 00C6H) sets Mode 0 with Port A, Port B, and Port C configured as simple output ports, allowing direct byte writes to Port A (Address 00C0H).',
        badge: '8255 Mode 0'
      },
      {
        title: '2-Phase Full-Step Clockwise Excitation Sequence',
        description:
          'Energizing two coils concurrently produces maximum magnetic flux: Step 1 (Phases A & D = 09H), Step 2 (Phases A & B = 0AH), Step 3 (Phases B & C = 06H), Step 4 (Phases C & D = 05H). Progressing forward rotates the shaft clockwise.',
        badge: 'High Torque CW'
      },
      {
        title: 'Variable Step-Size & Angular Displacement Formulation',
        description:
          'Total mechanical displacement is directly proportional to step count: θ = N x 1.8°. For 90° rotation, N = 50 steps; for 180°, N = 100 steps; for 360°, N = 200 steps. Software loop counters govern exact step execution.',
        badge: 'N = θ / 1.8°'
      },
      {
        title: 'ULN2003 Driver & Inductive Freewheeling Protection',
        description:
          'The ULN2003 contains 7 high-voltage, high-current NPN Darlington pairs capable of sinking up to 500 mA per channel, with integrated clamp diodes that suppress inductive back-EMF voltage spikes when stator coils de-energize.',
        badge: 'ULN2003 Driver'
      }
    ],
    mathematicalFormulation: {
      formula:
        'Step Angle θs = 360° / (Phases × Rotor Teeth) = 360° / (4 × 50) = 1.8°,   Steps N = θ_target / 1.8°,   Speed (RPM) = (f_step × 60) / 200',
      explanation:
        'The step angle θs is a fixed physical property of the motor. The total angular displacement θ is purely a function of pulse count N, allowing accurate open-loop position control without positional feedback encoders.',
      steps: [
        'Calculate step count: N = Target Angle / 1.8° (e.g., 200 steps for 360°)',
        'Write 80H to 8255 CWR at 00C6H to initialize Port A for output',
        'Load CX with N (step count), BX with 4, and point SI to CW_TABLE',
        'Output step pattern [SI] to Port A (00C0H) via OUT DX, AL',
        'Call software delay subroutine for mechanical rotor settling (10-30 ms)',
        'Increment SI, decrement CX, and loop through 4-step sequence until CX = 0'
      ]
    },
    architecturalMechanisms: [
      { feature: '8255 PPI Port A (00C0H)', role: 'Sends 4-bit phase excitation codes (PA0-PA3) to motor driver.' },
      { feature: '8255 PPI CWR (00C6H)', role: 'Programs I/O mode and port directions (80H = All Mode 0 Output).' },
      { feature: 'ULN2003 Darlington Array', role: 'Sinks high stator coil current (12V / 300mA) from 8255 TTL logic outputs.' },
      { feature: 'CX Register', role: 'Maintains remaining variable step count for exact angular displacement.' },
      { feature: 'Software Delay Loop', role: 'Controls inter-step pulse period (f_step) and motor RPM.' }
    ],
    workedExample: {
      inputLabel: 'Clockwise Stepper Rotation Request',
      inputValue: 'Target Angle = 360.0° CW (1.8° Step Angle Motor, 2-Phase Full-Step)',
      calculationSteps: [
        { stepNumber: 1, operation: 'Calculate Steps N = 360° / 1.8°', intermediateResult: 'N = 200 Steps (CX = 00C8H)', flagImpact: 'CX = 200' },
        { stepNumber: 2, operation: 'Commutation Cycles C = 200 / 4', intermediateResult: 'C = 50 complete 4-step cycles', flagImpact: 'Cycles = 50' },
        { stepNumber: 3, operation: 'Phase 1: Output 09H (Phases A & D ON)', intermediateResult: 'Port A = 09H, Rotor moves +1.8°', flagImpact: 'CX = 199' },
        { stepNumber: 4, operation: 'Phase 2: Output 0AH (Phases A & B ON)', intermediateResult: 'Port A = 0AH, Rotor moves +1.8° (+3.6°)', flagImpact: 'CX = 198' },
        { stepNumber: 5, operation: 'Phase 3: Output 06H (Phases B & C ON)', intermediateResult: 'Port A = 06H, Rotor moves +1.8° (+5.4°)', flagImpact: 'CX = 197' },
        { stepNumber: 6, operation: 'Phase 4: Output 05H (Phases C & D ON)', intermediateResult: 'Port A = 05H, Rotor moves +1.8° (+7.2°)', flagImpact: 'CX = 196' },
        { stepNumber: 7, operation: 'Complete remaining 49 cycles', intermediateResult: 'Total 200 steps executed', flagImpact: 'CX = 0000H (ZF = 1)' }
      ],
      finalOutput: 'Shaft Displacement: +360.0° Clockwise (+200 Steps Completed at ~15 RPM).'
    },
    industrialRelevance:
      'Computer Numerical Control (CNC) milling machine axes, 3D printer Cartesian gantry drives, automated laboratory pipetting arms, optical telescope positioning, and automotive headlight levelling actuators.'
  },

  exp_stepper2: {
    principleTitle: 'Interfacing Stepper Motor with 8086 – Anti-Clockwise Rotation & Variable Step-Size',
    corePrinciple:
      'Reversing the rotational direction of a 4-phase stepper motor from Clockwise to Anti-Clockwise (CCW / counter-clockwise) is achieved by inverting the sequence of stator coil excitation codes. In 2-phase full-step mode, the commutation sequence is reversed to [05H -> 06H -> 0AH -> 09H]. This reversal shifts the stator electromagnetic vector in a counter-clockwise direction, creating magnetic attraction that pulls the rotor backward by 1.8° per pulse. By loading a variable step count N into 8086 register CX, the microprocessor precisely controls total anti-clockwise angular displacement (θ = -N x 1.8°). Software delay subroutines prevent rotor overshoot and step loss.',
    keyConcepts: [
      {
        title: 'Reverse Commutation Sequence (05H -> 06H -> 0AH -> 09H)',
        description:
          'Applying excitation patterns in inverted chronological order (DA -> CD -> BC -> AB) inverts the stator magnetic field progression, causing counter-clockwise rotor torque.',
        badge: 'High Torque CCW'
      },
      {
        title: 'Bidirectional Flux Inversion & Mechanical Alignment',
        description:
          'Each phase transition shifts the stator magnetic equilibrium by 1.8° in the anti-clockwise direction, pulling the rotor pole teeth into alignment with minimal torque ripple.',
        badge: 'Flux Inversion'
      },
      {
        title: 'Variable Step-Size & Degree Conversion',
        description:
          'Any desired anti-clockwise angle (e.g. 45°, 90°, 180°, 360°) is mapped to integer step counts: N = Target Degrees / 1.8°. CX decrements on each step until reaching zero.',
        badge: 'N = θ / 1.8°'
      },
      {
        title: 'Dynamic Braking & Settling Delay Regulation',
        description:
          'Maintaining coil excitation during the software delay interval provides active electromagnetic holding torque, stabilizing the rotor before issuing the subsequent step.',
        badge: 'Holding Torque'
      }
    ],
    mathematicalFormulation: {
      formula:
        'θ_CCW = -(N × θs) = -(N × 1.8°),   Total Steps N = |θ_target| / 1.8°,   Commutation Cycles C = N / 4',
      explanation:
        'Reversing the lookup table indices inverts the sign of the angular velocity vector (ω < 0), causing precise anti-clockwise angular displacement.',
      steps: [
        'Calculate step count: N = Target Degrees / 1.8° (e.g., 200 steps for 360° CCW)',
        'Initialize 8255 PPI CWR at 00C6H with 80H (Port A Mode 0 Output)',
        'Load CX with N, BX with 4, and point SI to CCW_TABLE [05H, 06H, 0AH, 09H]',
        'Send current CCW byte [SI] to Port A (00C0H) via OUT DX, AL',
        'Execute software delay loop for mechanical rotor settling (10-30 ms)',
        'Increment SI, decrement CX, and repeat 4-step sequence until CX = 0'
      ]
    },
    architecturalMechanisms: [
      { feature: '8255 PPI Port A (00C0H)', role: 'Transmits reversed phase sequence nibbles to ULN2003 inputs.' },
      { feature: '8255 PPI CWR (00C6H)', role: 'Configures 8255 I/O ports in Mode 0 Output.' },
      { feature: 'ULN2003 Transistor Driver', role: 'Provides ground-sinking drive for 12V unipolar stator coils.' },
      { feature: 'CX Register', role: 'Down-counter tracking remaining variable steps in the CCW direction.' },
      { feature: 'Software Delay Subroutine', role: 'Maintains consistent stepping frequency and prevents rotor slip.' }
    ],
    workedExample: {
      inputLabel: 'Anti-Clockwise Stepper Rotation Request',
      inputValue: 'Target Angle = 180.0° CCW (1.8° Step Angle Motor, 2-Phase Full-Step Reversed)',
      calculationSteps: [
        { stepNumber: 1, operation: 'Calculate Steps N = 180° / 1.8°', intermediateResult: 'N = 100 Steps (CX = 0064H)', flagImpact: 'CX = 100' },
        { stepNumber: 2, operation: 'Commutation Cycles C = 100 / 4', intermediateResult: 'C = 25 complete 4-step CCW cycles', flagImpact: 'Cycles = 25' },
        { stepNumber: 3, operation: 'Phase 1: Output 05H (Phases C & D ON)', intermediateResult: 'Port A = 05H, Rotor moves -1.8°', flagImpact: 'CX = 99' },
        { stepNumber: 4, operation: 'Phase 2: Output 06H (Phases B & C ON)', intermediateResult: 'Port A = 06H, Rotor moves -1.8° (-3.6°)', flagImpact: 'CX = 98' },
        { stepNumber: 5, operation: 'Phase 3: Output 0AH (Phases A & B ON)', intermediateResult: 'Port A = 0AH, Rotor moves -1.8° (-5.4°)', flagImpact: 'CX = 97' },
        { stepNumber: 6, operation: 'Phase 4: Output 09H (Phases A & D ON)', intermediateResult: 'Port A = 09H, Rotor moves -1.8° (-7.2°)', flagImpact: 'CX = 96' },
        { stepNumber: 7, operation: 'Complete remaining 24 cycles', intermediateResult: 'Total 100 steps executed', flagImpact: 'CX = 0000H (ZF = 1)' }
      ],
      finalOutput: 'Shaft Displacement: -180.0° Anti-Clockwise (100 Steps Completed at ~15 RPM).'
    },
    industrialRelevance:
      'Bidirectional satellite dish azimuth trackers, camera gimbal tilt mechanisms, reversible medical peristaltic infusion pumps, motorized optical zoom lenses, and industrial robotic pick-and-place grippers.'
  },

  exp_adc: {
    principleTitle: 'Successive Approximation ADC Architecture & 8255 Handshake Interfacing',
    corePrinciple:
      'Analog-to-Digital Converters (ADCs) transform continuous physical voltages into discrete digital representations. The ADC 0808/0809 employs an 8-bit Successive Approximation Register (SAR) and an on-chip 8-channel analog multiplexer. Interfacing the ADC with an 8086 microprocessor via the 8255 PPI utilizes a synchronized handshaking sequence: (1) Select analog channel on Port B, (2) Pulse ALE and SOC (Start of Conversion) on PC0, (3) Poll EOC (End of Conversion) on PC7 until HIGH, and (4) Assert OE (Output Enable) on PC2 to read the 8-bit digital output byte from Port A.',
    keyConcepts: [
      {
        title: 'Successive Approximation Register (SAR) Algorithm',
        description:
          'SAR performs a binary search by setting the MSB (Bit 7) to 1, comparing the internal DAC voltage with Vin, keeping or clearing the bit based on comparator output, and proceeding iteratively down to LSB (Bit 0) over 8 conversion cycles (~100 µs).',
        badge: 'Binary Search SAR'
      },
      {
        title: '8255 PPI Mixed Mode 0 Configuration (98H)',
        description:
          'Control word 98H (1001 1000b) configures 8255 Group A in Mode 0 with Port A as Input (digital data D0-D7), Port B as Output (channel address ADD A, B, C), Port C Upper as Input (EOC polling on PC7), and Port C Lower as Output (SOC on PC0, OE on PC2).',
        badge: 'Control Word 98H'
      },
      {
        title: 'Quantization & Analog Voltage Reconstruction',
        description:
          'For an 8-bit ADC with Vref = +5.00V, resolution is 19.61 mV per LSB (5.0V / 255). The acquired digital code D is mapped back to physical millivolts using the integer formula: Vin (mV) = (D × 5000) / 255.',
        badge: 'Resolution 19.6 mV'
      }
    ],
    mathematicalFormulation: {
      formula:
        'D_out = Round((Vin / Vref) × 255),   Vin (mV) = (D_out × 5000 mV) / 255,   Resolution (1 LSB) = Vref / (2ⁿ - 1) = 5.0V / 255 = 19.61 mV',
      explanation:
        'The SAR comparison algorithm guarantees that the digital output has a maximum quantization uncertainty of ±0.5 LSB (±9.8 mV).',
      steps: [
        'Initialize 8255 PPI CWR with 98H (Port A=IN, Port B=OUT, PC_Upper=IN, PC_Lower=OUT)',
        'Output channel index (00H for IN0) to Port B (00C2H)',
        'Send active-high ALE/SOC pulse on PC0 (01H -> NOP -> 00H) to trigger SAR conversion',
        'Poll Port C (00C4H) Bit 7 (TEST AL, 80H) in a loop until EOC transitions HIGH (1)',
        'Assert Output Enable on PC2 (04H) to enable ADC 3-state output buffers',
        'Read 8-bit digital conversion byte from Port A (00C0H) into AL and de-assert OE (00H)',
        'Scale digital byte to engineering units: Voltage (mV) = (AL × 5000) / 255'
      ]
    },
    architecturalMechanisms: [
      { feature: '8255 Port A (00C0H)', role: 'Receives 8-bit digital output word (D0-D7) from ADC 0808.' },
      { feature: '8255 Port B (00C2H)', role: 'Drives channel address selection lines (ADD A, ADD B, ADD C).' },
      { feature: '8255 Port C Bit 0 (PC0)', role: 'Drives active-high Address Latch Enable (ALE) and Start of Conversion (SOC).' },
      { feature: '8255 Port C Bit 7 (PC7)', role: 'Polls hardware End of Conversion (EOC) status pin from ADC.' },
      { feature: '8255 Port C Bit 2 (PC2)', role: 'Asserts active-high Output Enable (OE) to activate ADC data drivers.' },
      { feature: 'SAR & 8-Bit DAC Ladder', role: 'Performs 8-step internal binary comparison against analog input voltage.' }
    ],
    workedExample: {
      inputLabel: 'Analog Input Signal on Channel IN0',
      inputValue: 'Vin = 2.50 V DC, Vref(+) = +5.00 V, Vref(-) = 0.00 V, Clock = 640 kHz',
      calculationSteps: [
        { stepNumber: 1, operation: 'Calculate Ideal Digital Code D = (2.50 / 5.00) × 255', intermediateResult: 'D = 127.5 ≈ 128 (80H in Hex)', flagImpact: 'Code = 80H' },
        { stepNumber: 2, operation: 'Initialize 8255: Send 98H to CWR (00C6H)', intermediateResult: '8255 configured for ADC handshake', flagImpact: 'CWR = 98H' },
        { stepNumber: 3, operation: 'Trigger SOC: Pulse PC0 = 1, then PC0 = 0', intermediateResult: 'SAR resets, conversion begins (~100 µs)', flagImpact: 'EOC = 0 (Busy)' },
        { stepNumber: 4, operation: 'Poll EOC on PC7 until Bit 7 = 1', intermediateResult: '14 iterations polled; EOC goes HIGH', flagImpact: 'ZF = 0 (Ready)' },
        { stepNumber: 5, operation: 'Assert OE: Send 04H to PC2; Read Port A', intermediateResult: 'AL = 80H read into CPU register', flagImpact: 'AL = 80H' },
        { stepNumber: 6, operation: 'Compute Voltage: (128 × 5000) / 255', intermediateResult: 'Voltage_mV = 640000 / 255 = 2509.8 mV (2.51 V)', flagImpact: 'AX = 09CDH' }
      ],
      finalOutput: 'Digital Reading: 80H (128d) | Reconstructed Voltage: 2509.8 mV (~2.51 V, 0.39% Quantization error).'
    },
    industrialRelevance:
      'Industrial SCADA analog sensor gateways (temperature, pressure, 4-20 mA current loops), automotive engine ECU telemetry (TPS, MAP sensors), medical patient monitoring (ECG, SpO2), and digital multimeter/oscilloscope front ends.'
  },

  exp_dac: {
    principleTitle: 'R-2R Ladder DAC Interfacing, Op-Amp Current-to-Voltage Conversion & Waveform Synthesis',
    corePrinciple:
      'Digital-to-Analog Converters (DACs) synthesize continuous analog electrical voltages from discrete digital binary values. The DAC 0800 is an 8-bit monolithic current-output converter based on an inverted R-2R ladder network that produces complementary output currents (Iout, Iout_bar) directly proportional to the digital input word. An external operational amplifier (OP-07/LM741) in an inverting I-to-V configuration converts this current to voltage: Vo = -Iout × Rf. By streaming calculated digital values through 8255 PPI Port A in calibrated software loops, the 8086 synthesizes precision Square, Triangular, and Step (Staircase) waveforms.',
    keyConcepts: [
      {
        title: 'Inverted R-2R Ladder & Current Steering',
        description:
          'The R-2R resistor network maintains constant ladder node currents. High-speed transistor pairs steer individual bit currents either to Iout or Iout_bar based on data bits D7-D0, achieving settling times under 100 ns without glitch spikes.',
        badge: 'R-2R Ladder'
      },
      {
        title: 'Op-Amp Current-to-Voltage (I-to-V) Converter',
        description:
          'With reference current Iref = 2 mA (Vref = 5V, Rref = 2.5 kΩ) and op-amp feedback resistor Rf = 2.5 kΩ, the output voltage is: Vo = (Vref × Rf / Rref) × (D / 256) = 5.0 × (D / 256) Volts.',
        badge: 'I-to-V Op-Amp'
      },
      {
        title: 'Waveform Synthesis Algorithms & Frequency Control',
        description:
          'Square wave toggles between 00H (0V) and FFH (+5V) with symmetric delays. Triangular wave linearly sweeps 00H→FFH (ramp up) and FFH→00H (ramp down). Step signal creates discrete voltage plateaus (00H, 33H, 66H, 99H, CCH, FFH) with hold intervals.',
        badge: 'Signal Synthesis'
      }
    ],
    mathematicalFormulation: {
      formula:
        'V_out(D) = Vref × (D / 256),   f_square = 1 / (2 × T_half),   f_tri = 1 / (512 × T_step),   V_step = 5.0V × (ΔD / 256)',
      explanation:
        'Waveform frequency is determined by the total 8086 CPU instruction execution cycles within each sample loop plus the programmable software delay count CX.',
      steps: [
        'Initialize 8255 PPI CWR with 80H (Port A Mode 0 Output at 00C0H)',
        'SQUARE WAVE: Write 00H to Port A, call DELAY_HALF, write FFH to Port A, call DELAY_HALF, loop continuously',
        'TRIANGULAR WAVE: In UP_RAMP, output AL (00H→FFH) with INC AL and micro-delay; in DOWN_RAMP, output AL (FFH→00H) with DEC AL and micro-delay; loop',
        'STEP SIGNAL: Output AL, call plateau hold delay (~5 ms), add step size 33H (ADD AL, 33H), repeat until overflow, wrap around to 00H',
        'Connect op-amp output terminal to oscilloscope Channel 1 and measure amplitude and time period'
      ]
    },
    architecturalMechanisms: [
      { feature: '8255 Port A (00C0H)', role: 'Transmits 8-bit digital sample word to DAC0800 digital inputs D0-D7.' },
      { feature: '8255 CWR (00C6H)', role: 'Configures 8255 PPI ports in Mode 0 Output (80H).' },
      { feature: 'DAC 0800 Converter IC', role: 'Transforms 8-bit binary word into proportional analog current Iout.' },
      { feature: 'LM741 / OP-07 Op-Amp', role: 'Inverting I-to-V converter generating 0.0V to +5.0V voltage waveform output.' },
      { feature: 'Software Delay Subroutines', role: 'Controls waveform frequency, slope rate, and staircase plateau hold times.' }
    ],
    workedExample: {
      inputLabel: 'Waveform Synthesis Parameter Set',
      inputValue: 'Vref = +5.00 V, Rf = 2.5 kΩ, Rref = 2.5 kΩ, 8-Bit DAC (256 Steps), Step Size = 33H (51d)',
      calculationSteps: [
        { stepNumber: 1, operation: 'Resolution: 1 LSB Voltage = 5.00 V / 256', intermediateResult: 'LSB = 19.531 mV', flagImpact: '1 LSB = 19.53 mV' },
        { stepNumber: 2, operation: 'Square Wave: Low = 00H (0.0V), High = FFH (4.98V ≈ 5.0V)', intermediateResult: 'Vp-p = 5.00 V, 50% Duty Cycle', flagImpact: 'Square = 5.0 Vp-p' },
        { stepNumber: 3, operation: 'Triangular Wave: 512 total steps (256 up + 256 down)', intermediateResult: 'T = 512 × 12 µs = 6.14 ms -> Freq ≈ 163 Hz', flagImpact: 'Freq = 163 Hz' },
        { stepNumber: 4, operation: 'Step 0 (00H): Vo = 5.0 × (0/256) = 0.00 V', intermediateResult: 'Staircase Level 0 = 0.00 V', flagImpact: 'Vo = 0.00 V' },
        { stepNumber: 5, operation: 'Step 1 (33H = 51d): Vo = 5.0 × (51/256) = 0.996 V ≈ 1.00 V', intermediateResult: 'Staircase Level 1 = 1.00 V', flagImpact: 'Vo = 1.00 V' },
        { stepNumber: 6, operation: 'Step 2 (66H = 102d): Vo = 5.0 × (102/256) = 1.992 V ≈ 2.00 V', intermediateResult: 'Staircase Level 2 = 2.00 V', flagImpact: 'Vo = 2.00 V' },
        { stepNumber: 7, operation: 'Steps 3..5: 3.00 V (99H), 4.00 V (CCH), 4.98 V ≈ 5.00 V (FFH)', intermediateResult: '6-level symmetric staircase generated', flagImpact: 'Staircase Done' }
      ],
      finalOutput: 'Square Wave (5.0 Vp-p, 287 Hz), Triangular Wave (5.0 Vp-p, 163 Hz), 6-Level Staircase Step Signal (0V to 5V in 1V increments).'
    },
    industrialRelevance:
      'Audio synthesizers & digital music equipment, programmable function generators, variable-frequency motor drive (VFD) reference speed setpoints, CRT deflection horizontal sweep generators, and automated test equipment (ATE) stimulus sources.'
  },

  exp5: {
    principleTitle: 'High-Speed Memory Block Data Transfer (REP MOVSB)',
    corePrinciple:
      'Block data transfer is the process of copying a contiguous block of N bytes or words from a source memory buffer to a destination memory buffer. In 8086 architecture, the dedicated string instruction `MOVSB` (Move String Byte) copies the byte at `DS:[SI]` to `ES:[DI]` and automatically updates both SI and DI. Combined with the `REP` prefix, the entire transfer of N bytes executes at high hardware speed directly in microcode without software branching overhead.',
    keyConcepts: [
      {
        title: 'Hardware REP MOVSB Execution Cycle',
        description:
          'When `REP MOVSB` executes with `CX = N` and `DF = 0 (CLD)`, the 8086 microcode performs: `[ES:DI] ← [DS:SI]`, `SI ← SI + 1`, `DI ← DI + 1`, `CX ← CX - 1`, repeating automatically until `CX = 0`.',
        badge: 'DMA-like Speed'
      },
      {
        title: 'Overlapping vs Non-Overlapping Memory Blocks',
        description:
          'For non-overlapping blocks (or when Destination < Source), forward transfer with `CLD (DF = 0)` is used. If Destination > Source and the blocks overlap, forward copying would overwrite source bytes before they are read; in that scenario, reverse transfer with `STD (DF = 1)` starting from the end of the block is required.',
        badge: 'Overlap Safety'
      },
      {
        title: 'Segment Alignment (ES = DS)',
        description:
          'Because `MOVSB` implicitly reads from `DS:SI` and writes to `ES:DI`, programs operating within a single data segment must initialize `ES` to point to the same segment as `DS` (`MOV AX, DS; MOV ES, AX`).',
        badge: 'Segment Alignment'
      }
    ],
    mathematicalFormulation: {
      formula: 'For all i ∈ [0, N-1]: DEST[i] ← SRC[i],   Transfer Throughput = 17 clock cycles/byte with REP MOVSB',
      explanation: 'REP MOVSB achieves maximal 8086 memory bus transfer speed by avoiding repeated instruction fetch and decode cycles.',
      steps: [
        'Initialize DS = @DATA, ES = DS',
        'Load SI = Offset(SRC_BLOCK), DI = Offset(DEST_BLOCK)',
        'Load CX = Block Length (e.g., 10 bytes)',
        'Clear Direction Flag: CLD (DF = 0 for auto-increment)',
        'Execute REP MOVSB (Hardware copies all 10 bytes in microcode)',
        'Verify DEST_BLOCK in memory dump'
      ]
    },
    architecturalMechanisms: [
      { feature: 'DS:SI Pointer Pair', role: 'Source memory segment base and index pointer.' },
      { feature: 'ES:DI Pointer Pair', role: 'Destination memory segment base and index pointer.' },
      { feature: 'CX Register', role: 'Transfer byte counter decremented on every memory bus write cycle.' },
      { feature: 'Direction Flag (DF)', role: 'Determines pointer increment (CLD, DF=0) or pointer decrement (STD, DF=1).' }
    ],
    workedExample: {
      inputLabel: 'Source Memory Block (10 Bytes)',
      inputValue: 'SRC_BLOCK = [10H, 20H, 30H, 40H, 50H, 60H, 70H, 80H, 90H, 99H]',
      calculationSteps: [
        { stepNumber: 1, operation: 'Initialize: SI = Offset(SRC), DI = Offset(DEST), CX = 10, CLD', intermediateResult: 'Pointers aligned at byte 0', flagImpact: 'DF = 0' },
        { stepNumber: 2, operation: 'Byte 0 Transfer: Copy 10H from DS:[SI] to ES:[DI]', intermediateResult: 'DEST[0] = 10H, SI++, DI++', flagImpact: 'CX = 9' },
        { stepNumber: 3, operation: 'Bytes 1 to 8: Stream copy 20H through 90H', intermediateResult: 'DEST[1..8] populated', flagImpact: 'CX = 1' },
        { stepNumber: 4, operation: 'Byte 9 Transfer: Copy 99H into DEST[9]', intermediateResult: 'DEST[9] = 99H, SI=10, DI=10', flagImpact: 'CX = 0 (Terminated)' }
      ],
      finalOutput: 'DEST_BLOCK = [10H, 20H, 30H, 40H, 50H, 60H, 70H, 80H, 90H, 99H] (All 10 bytes faithfully duplicated).'
    },
    industrialRelevance:
      'Direct Memory Access (DMA) buffer replication, operating system kernel `memcpy()` implementation, video frame-buffer double buffering, and network socket packet payload staging.'
  },

  exp_8051_arith: {
    principleTitle: '8051 ALU Architecture, Carry/Borrow Propagation & BCD Adjustment',
    corePrinciple:
      'The 8051 microcontroller is an 8-bit Harvard architecture microcontroller with an 8-bit Arithmetic Logic Unit (ALU). Arithmetic operations (ADD, ADDC, SUBB, DA) inherently utilize Accumulator A (E0H) as both the destination and main source register. When computing multi-byte (16-bit) sums, the carry bit from the lower byte addition is automatically propagated into the upper byte addition using ADDC. Subtraction is performed via SUBB (A ← A - src - CY), where the Carry Flag acts as a Borrow flag and must be explicitly cleared (CLR C) prior to execution. Decimal Adjust (DA A) inspects lower and upper nibbles along with Auxiliary Carry (AC) and Carry (CY) to convert raw binary addition results into valid packed BCD format.',
    keyConcepts: [
      {
        title: 'Accumulator & PSW Flag Interaction',
        description:
          'The Program Status Word (PSW) records ALU outcomes: CY (PSW.7, Carry/Borrow), AC (PSW.6, Auxiliary Carry for BCD nibbles), OV (PSW.2, 2\'s complement signed overflow), and P (PSW.0, parity of Accumulator A: 1 if odd number of 1s).',
        badge: 'PSW Flags'
      },
      {
        title: 'Multi-Byte Ripple Addition (ADDC)',
        description:
          'To add multi-byte words (e.g. 16-bit 12E4H + 345CH), the least significant bytes are added first with ADD (E4H + 5CH = 40H, CY=1), and the most significant bytes are subsequently added with ADDC (12H + 34H + 1 = 47H), producing the 16-bit sum 4740H.',
        badge: 'Multi-Byte Arithmetic'
      },
      {
        title: 'Borrow Subtraction (SUBB & Mandatory CLR C)',
        description:
          'Because the 8051 lacks a plain SUB instruction, SUBB (Subtract with Borrow) always evaluates `A - src - CY`. To perform standard 8-bit subtraction, `CLR C` MUST precede `SUBB A, src` to ensure no stale carry is subtracted.',
        badge: 'Subtraction Rule'
      },
      {
        title: 'Decimal Adjust Algorithm (DA A)',
        description:
          'If the lower nibble (D3-D0) > 9 or AC = 1, DA A adds 06H to A. If the upper nibble (D7-D4) > 9 or CY = 1, DA A adds 60H to A and sets CY = 1. This converts hexadecimal sums back into valid 2-digit packed BCD.',
        badge: 'BCD Correction'
      }
    ],
    mathematicalFormulation: {
      formula: 'ADD: A ← A + src,   ADDC: A ← A + src + CY,   SUBB: A ← A - src - CY,   DA A: A_BCD = A + (06H if AC=1) + (60H if CY=1)',
      explanation: 'ALU performs two\'s complement binary arithmetic and updates PSW status flags in a single 12-clock machine cycle.',
      steps: [
        '8-Bit Addition: Load A = F8H, ADD A, #19H -> A = 11H, CY = 1 (Sum = 11H, Carry = 01H)',
        '16-Bit Low: Load A = E4H, ADD A, #5CH -> A = 40H, CY = 1 (Lower Sum = 40H)',
        '16-Bit High: Load A = 12H, ADDC A, #34H -> A = 47H, CY = 0 (Higher Sum = 47H, Total = 4740H)',
        '8-Bit Subtraction: CLR C -> Load A = 95H, SUBB A, #47H -> A = 4EH, CY = 0 (Difference = 4EH = 78D)',
        'Packed BCD: Load A = 38H, ADD A, #49H -> A = 81H (AC=1) -> DA A -> A = 87H (Valid BCD 87)'
      ]
    },
    architecturalMechanisms: [
      { feature: 'Accumulator A (SFR E0H)', role: 'Primary 8-bit ALU register and destination accumulator.' },
      { feature: 'Program Status Word (SFR D0H)', role: 'Encodes ALU condition flags: CY (D0.7), AC (D0.6), OV (D0.2), P (D0.0).' },
      { feature: 'Auxiliary Carry Flag (AC)', role: 'Detects carry out of bit 3 into bit 4 to trigger lower-nibble BCD correction in DA A.' },
      { feature: 'Direct & Immediate Addressing', role: 'Provides flexible operand fetching from internal RAM (30H-7FH) or immediate literals (#data).' }
    ],
    workedExample: {
      inputLabel: 'Arithmetic Test Operands',
      inputValue: '8-Bit: F8H + 19H | 16-Bit: 12E4H + 345CH | Subtraction: 95H - 47H | BCD: 38H + 49H',
      calculationSteps: [
        { stepNumber: 1, operation: '8-Bit ADD: F8H (248) + 19H (25) = 111H', intermediateResult: 'A = 11H, CY = 1', flagImpact: 'CY = 1, AC = 1, P = 0' },
        { stepNumber: 2, operation: '16-Bit Low ADD: E4H + 5CH = 140H', intermediateResult: 'Low Sum = 40H, CY = 1', flagImpact: 'CY = 1' },
        { stepNumber: 3, operation: '16-Bit High ADDC: 12H + 34H + 1(CY) = 47H', intermediateResult: 'High Sum = 47H, Total = 4740H', flagImpact: 'CY = 0' },
        { stepNumber: 4, operation: '8-Bit SUBB: 95H (149) - 47H (71) - 0', intermediateResult: 'A = 4EH (78D)', flagImpact: 'CY = 0 (No Borrow)' },
        { stepNumber: 5, operation: 'BCD Addition: 38H + 49H = 81H', intermediateResult: 'Raw Sum = 81H, AC = 1', flagImpact: 'AC = 1' },
        { stepNumber: 6, operation: 'Decimal Adjust: DA A (adds 06H due to AC=1)', intermediateResult: 'A = 87H (Valid BCD)', flagImpact: 'AC = 0, CY = 0' }
      ],
      finalOutput: '8-Bit Sum = 11H (CY=1), 16-Bit Sum = 4740H, Difference = 4EH, BCD Sum = 87H.'
    },
    industrialRelevance:
      'Industrial weighing scales, thermocouple temperature linearization, smart electricity meters, battery management capacity calculation, and automotive odometer decimal display controllers.'
  },

  exp_8051_muldiv: {
    principleTitle: '8051 Hardware Multiplier & Divider Execution Units (MUL AB & DIV AB)',
    corePrinciple:
      'The Intel 8051 features dedicated on-chip hardware multiplication and division units that operate directly on Accumulator A (E0H) and Register B (F0H) in 4 machine cycles (48 oscillator clock periods). In `MUL AB`, unsigned 8-bit integers in A and B are multiplied to yield a 16-bit product; the lower byte is placed in A and the upper byte in B (Product = B:A). If the product exceeds 255 (B > 0), the Overflow Flag (OV) is set to 1; otherwise OV is cleared to 0. In `DIV AB`, unsigned 8-bit dividend in A is divided by unsigned 8-bit divisor in B, returning the integer quotient in A and remainder in B. If divisor B = 0, the OV flag is set to 1 (Division-by-Zero exception); otherwise OV = 0. Both instructions unconditionally clear the Carry Flag (CY = 0).',
    keyConcepts: [
      {
        title: 'Dedicated Register Architecture (A and B SFRs)',
        description:
          'Unlike x86 which allows general registers for multiplication, 8051 `MUL AB` and `DIV AB` exclusively and implicitly operate on SFR Accumulator A (E0H) and Register B (F0H).',
        badge: 'SFR Binding'
      },
      {
        title: '16-Bit Product Splitting (B:A Pair)',
        description:
          'When multiplying two 8-bit operands (max 255 × 255 = 65,025 = FE01H), the 16-bit product spans two 8-bit registers: Low Byte in A and High Byte in B.',
        badge: 'Product Splitting'
      },
      {
        title: 'Overflow Flag (OV) Evaluation',
        description:
          'In MUL AB, OV=1 indicates product > 00FFH (16-bit result). In DIV AB, OV=1 indicates division by zero (B = 00H). This enables simple hardware exception branching (`JB OV, ERROR_HANDLER`).',
        badge: 'Exception Handling'
      },
      {
        title: '4-Cycle Hardware Efficiency',
        description:
          '8051 hardware multiplication computes in only 4 machine cycles (4.0 µs @ 12 MHz), replacing hundreds of cycles of software shift-and-add algorithms.',
        badge: 'Hardware Acceleration'
      }
    ],
    mathematicalFormulation: {
      formula: 'MUL AB: B:A ← A × B,  OV = 1 ⟺ B ≠ 00H ;   DIV AB: A ← ⌊A / B⌋,  B ← A mod B,  OV = 1 ⟺ B = 0',
      explanation: 'High-speed hardware ALU multiplication and non-restoring integer division executing in exactly 48 oscillator clock cycles.',
      steps: [
        'MUL Test: A = 0F5H (245D), B = 18H (24D)',
        'Product = 245 × 24 = 5880D = 16F8H -> A = F8H (Low), B = 16H (High), OV = 1, CY = 0',
        'DIV Test: A = 0F5H (245D), B = 0AH (10D)',
        'Division = 245 / 10 -> Quotient A = 18H (24D), Remainder B = 05H (5D), OV = 0, CY = 0',
        'DIV by Zero Test: A = 64H (100D), B = 00H -> DIV AB -> OV = 1 (Divide-by-zero detected)'
      ]
    },
    architecturalMechanisms: [
      { feature: 'Accumulator A (SFR E0H)', role: 'Holds multiplicand / dividend before execution; receives low product byte / quotient.' },
      { feature: 'Register B (SFR F0H)', role: 'Holds multiplier / divisor before execution; receives high product byte / remainder.' },
      { feature: 'Overflow Flag OV (PSW.2)', role: 'Flags product magnitude > 255 in MUL, and flags zero-divisor error in DIV.' },
      { feature: 'Machine Cycle Timer', role: 'Takes exactly 4 machine cycles (48 oscillator clocks) for execution.' }
    ],
    workedExample: {
      inputLabel: 'MUL & DIV Operands',
      inputValue: 'Multiplication: 245 (F5H) × 24 (18H) | Division: 245 (F5H) ÷ 10 (0AH)',
      calculationSteps: [
        { stepNumber: 1, operation: 'Multiplication: 245 × 24 = 5880D', intermediateResult: 'Hex Product = 16F8H', flagImpact: 'CY = 0' },
        { stepNumber: 2, operation: 'Register Allocation: Low Byte to A, High Byte to B', intermediateResult: 'A = F8H, B = 16H', flagImpact: 'OV = 1 (B ≠ 0)' },
        { stepNumber: 3, operation: 'Division: 245 ÷ 10', intermediateResult: 'Quotient = 24 (18H), Remainder = 5 (05H)', flagImpact: 'CY = 0' },
        { stepNumber: 4, operation: 'Register Allocation: Quotient to A, Remainder to B', intermediateResult: 'A = 18H, B = 05H', flagImpact: 'OV = 0 (Divisor ≠ 0)' }
      ],
      finalOutput: 'Product = 16F8H (A=F8H, B=16H, OV=1), Quotient = 18H (A=18H), Remainder = 05H (B=05H, OV=0).'
    },
    industrialRelevance:
      'Digital PID motor speed controllers, audio gain volume scaling, sensor analog-to-physical unit conversions, PWM duty-cycle computation, and power supply inverter reference sine calculations.'
  },

  exp_8051_logic: {
    principleTitle: '8051 Logical Bitwise Operations & Hardware Boolean Processor',
    corePrinciple:
      'The 8051 architecture provides a rich suite of byte-level logical instructions (ANL, ORL, XRL, CPL, SWAP, RL, RR, RLC, RRC) and a standalone single-bit Boolean Processor. Byte-level logic executes on Accumulator A with immediate masks, direct addresses, or registers to perform selective bit clearing (masking with ANL), bit setting (ORL), bit inversion (XRL), and 1\'s complement (CPL). The dedicated `SWAP A` instruction swaps the upper and lower 4-bit nibbles in 1 machine cycle without modifying flags. The Boolean Processor operates directly on 128 bit-addressable RAM locations (20H-2FH) and bit-addressable SFRs (P0-P3, PSW, TCON, SCON, IE, IP) using the Carry Flag (CY) as a single-bit accumulator.',
    keyConcepts: [
      {
        title: 'Bit Masking & Isolation (ANL)',
        description:
          'Executing `ANL A, #0FH` clears the upper 4 bits (D7-D4) to 0 while preserving the lower 4 bits (D3-D0), isolating single nibbles for numeric decoding.',
        badge: 'Masking'
      },
      {
        title: 'Bit Forcing / Setting (ORL)',
        description:
          'Executing `ORL A, #0F0H` forces the upper 4 bits HIGH without altering the lower nibble, essential for configuring active-high hardware control lines.',
        badge: 'Bit Setting'
      },
      {
        title: 'Toggling & Parity (XRL & CPL)',
        description:
          '`XRL A, #0FFH` toggles all 8 bits (bitwise NOT). `CPL A` provides direct 1\'s complement. `XRL` with identical operand (`XRL A, direct`) provides instant zero testing.',
        badge: 'Bit Toggling'
      },
      {
        title: 'Single-Cycle Nibble Swap (SWAP A)',
        description:
          '`SWAP A` exchanges bits D7-D4 with D3-D0 in a single machine cycle (1 µs @ 12 MHz) without affecting any flags—ideal for BCD-to-ASCII and hexadecimal formatting.',
        badge: 'Nibble Swap'
      },
      {
        title: 'Hardware Boolean Processor',
        description:
          'Allows individual bit-level logic (`SETB bit`, `CLR bit`, `CPL bit`, `ANL C, bit`, `ORL C, bit`, `MOV C, bit`, `MOV bit, C`) across 128 RAM bits and SFR flags.',
        badge: 'Boolean Engine'
      }
    ],
    mathematicalFormulation: {
      formula: 'ANL: A ← A ∧ M,   ORL: A ← A ∨ M,   XRL: A ← A ⊕ M,   CPL: A ← ¬A,   SWAP: A[7..4] ↔ A[3..0]',
      explanation: 'Byte-level and bit-level Boolean algebra evaluated natively in hardware without branches.',
      steps: [
        'Load Test Byte: A = 0A5H (1010 0101B)',
        'AND Mask: ANL A, #0FH -> 1010 0101B AND 0000 1111B = 0000 0101B (05H)',
        'OR Mask: ORL A, #0F0H -> 1010 0101B OR 1111 0000B = 1111 0101B (F5H)',
        'XOR Invert: XRL A, #0FFH -> 1010 0101B XOR 1111 1111B = 0101 1010B (5AH)',
        '1\'s Complement: CPL A -> NOT(1010 0101B) = 0101 1010B (5AH)',
        'Nibble Swap: SWAP A -> [1010][0101] -> [0101][1010] = 5AH',
        'Rotate Left: RL A -> 0100 1011B (4BH)',
        'Rotate Right: RR A -> 1101 0010B (D2H)'
      ]
    },
    architecturalMechanisms: [
      { feature: 'Accumulator A (SFR E0H)', role: 'Primary register operand for all byte-level logical and rotate instructions.' },
      { feature: 'Bit-Addressable RAM (20H-2FH)', role: '16 bytes of internal RAM offering 128 individually addressable bit locations (00H-7FH).' },
      { feature: 'Boolean Carry Flag CY (PSW.7)', role: 'Acts as the single-bit accumulator for bitwise Boolean algebra.' },
      { feature: 'Parity Flag P (PSW.0)', role: 'Automatically updated to reflect odd parity (P=1) of Accumulator A.' }
    ],
    workedExample: {
      inputLabel: 'Logical Test Operand',
      inputValue: 'Input A = A5H (1010 0101B), Masks: 0FH, F0H, FFH',
      calculationSteps: [
        { stepNumber: 1, operation: 'ANL A, #0FH (Mask High Nibble)', intermediateResult: 'A = 05H (0000 0101B)', flagImpact: 'Flags Unchanged' },
        { stepNumber: 2, operation: 'ORL A, #0F0H (Set High Nibble)', intermediateResult: 'A = F5H (1111 0101B)', flagImpact: 'Flags Unchanged' },
        { stepNumber: 3, operation: 'XRL A, #0FFH (Invert All Bits)', intermediateResult: 'A = 5AH (0101 1010B)', flagImpact: 'Flags Unchanged' },
        { stepNumber: 4, operation: 'CPL A (Bitwise NOT)', intermediateResult: 'A = 5AH (0101 1010B)', flagImpact: 'Flags Unchanged' },
        { stepNumber: 5, operation: 'SWAP A (Nibble Exchange)', intermediateResult: 'A = 5AH (0101 1010B)', flagImpact: 'Flags Unchanged' }
      ],
      finalOutput: 'ANL = 05H, ORL = F5H, XRL = 5AH, CPL = 5AH, SWAP = 5AH.'
    },
    industrialRelevance:
      'Keypad matrix debouncing and scanning, programmable logic controller (PLC) ladder logic emulation, cryptographic hashing algorithms, serial communication UART framing masks, and I/O pin toggle drivers.'
  },

  exp_8051_regbanks: {
    principleTitle: '8051 Register Bank Architecture & Zero-Overhead Context Switching',
    corePrinciple:
      'The Intel 8051 internal RAM consists of 128 bytes (00H to 7FH). The lowest 32 bytes (00H to 1FH) are partitioned into 4 distinct Register Banks (Bank 0, Bank 1, Bank 2, Bank 3), each comprising 8 general-purpose working registers (R0 through R7). The active register bank is dynamically selected at runtime by modifying bits RS1 (PSW.4) and RS0 (PSW.3) in the Program Status Word. When an instruction references `R0..R7` (or `@R0..@R1`), the hardware CPU routes access to the memory locations corresponding to the active bank. This architectural design enables zero-overhead context switching during Interrupt Service Routines (ISRs)—an ISR simply selects an alternate register bank (e.g. Bank 1) upon entry, completely preserving the main program\'s register contents in Bank 0 without requiring time-consuming stack PUSH and POP operations.',
    keyConcepts: [
      {
        title: 'Register Bank RAM Mapping',
        description:
          'Bank 0: 00H-07H (RS1=0, RS0=0, Reset Default); Bank 1: 08H-0FH (RS1=0, RS0=1); Bank 2: 10H-17H (RS1=1, RS0=0); Bank 3: 18H-1FH (RS1=1, RS0=1).',
        badge: 'RAM Partition'
      },
      {
        title: 'PSW Bit Manipulation (RS0 & RS1)',
        description:
          'The bank select bits can be modified atomically using single-bit instructions `SETB PSW.3` (RS0) and `SETB PSW.4` (RS1), or via byte write `MOV PSW, #imm`.',
        badge: 'PSW Control'
      },
      {
        title: 'Direct vs Register Addressing Dual-Access',
        description:
          'A memory location can be accessed either symbolically as `R0` (relative to active bank) or directly by address (e.g. `00H`). Even when Bank 3 is active, the main program\'s Bank 0 `R0` can still be read directly using `MOV A, 00H`.',
        badge: 'Memory Mapping'
      },
      {
        title: 'Zero-Overhead ISR Context Switching',
        description:
          'Switching register banks avoids pushing 8 registers to the stack (saving 16 machine cycles on entry and 16 on exit), maximizing real-time response speed.',
        badge: 'Real-Time RTOS'
      },
      {
        title: 'Stack Pointer (SP) Placement Consideration',
        description:
          'Upon reset, SP defaults to 07H. The first PUSH writes to RAM address 08H (Bank 1 R0). If Bank 1 is used for registers, SP must be reinitialized above 1FH (e.g. `MOV SP, #30H`).',
        badge: 'Stack Safety'
      }
    ],
    mathematicalFormulation: {
      formula: 'Effective RAM Address of Ri = (RS1 × 2 + RS0) × 8 + i,   where i ∈ [0, 7],  RS1, RS0 ∈ {0, 1}',
      explanation: 'Hardware address decoder shifts the 2-bit bank selector left by 3 bits and adds register index i.',
      steps: [
        'Select Bank 0: MOV PSW, #00H -> Write R0=10H ... R7=17H (Mapped to RAM 00H-07H)',
        'Switch to Bank 1: SETB PSW.3 -> Write R0=20H ... R7=27H (Mapped to RAM 08H-0FH)',
        'Switch to Bank 2: CLR PSW.3; SETB PSW.4 -> Write R0=30H ... R7=37H (Mapped to RAM 10H-17H)',
        'Switch to Bank 3: SETB PSW.3 -> Write R0=40H ... R7=47H (Mapped to RAM 18H-1FH)',
        'Verify Isolation: Read RAM 00H (holds 10H), RAM 08H (holds 20H), RAM 10H (holds 30H), RAM 18H (holds 40H)'
      ]
    },
    architecturalMechanisms: [
      { feature: 'Working Registers R0-R7', role: '8 general-purpose 8-bit registers per bank supporting high-speed single-byte opcodes.' },
      { feature: 'Indirect Pointers @R0 & @R1', role: 'Registers R0 and R1 act as 8-bit memory pointers within the active bank.' },
      { feature: 'PSW Bits RS0 (D0.3) & RS1 (D0.4)', role: 'Bank selector bits decoded by CPU memory arbitration logic.' },
      { feature: 'Stack Pointer SP (SFR 81H)', role: 'Points to top of stack; must be separated from active register banks.' }
    ],
    workedExample: {
      inputLabel: 'Register Bank Mapping Test',
      inputValue: 'Bank 0: 10H-17H | Bank 1: 20H-27H | Bank 2: 30H-37H | Bank 3: 40H-47H',
      calculationSteps: [
        { stepNumber: 1, operation: 'Select Bank 0 (PSW = 00H): Load R0=10H, R1=11H, ... R7=17H', intermediateResult: 'RAM [00H..07H] = [10H..17H]', flagImpact: 'RS1=0, RS0=0' },
        { stepNumber: 2, operation: 'Select Bank 1 (PSW = 08H): Load R0=20H, R1=21H, ... R7=27H', intermediateResult: 'RAM [08H..0FH] = [20H..27H]', flagImpact: 'RS1=0, RS0=1' },
        { stepNumber: 3, operation: 'Select Bank 2 (PSW = 10H): Load R0=30H, R1=31H, ... R7=37H', intermediateResult: 'RAM [10H..17H] = [30H..37H]', flagImpact: 'RS1=1, RS0=0' },
        { stepNumber: 4, operation: 'Select Bank 3 (PSW = 18H): Load R0=40H, R1=41H, ... R7=47H', intermediateResult: 'RAM [18H..1FH] = [40H..47H]', flagImpact: 'RS1=1, RS0=1' },
        { stepNumber: 5, operation: 'Direct RAM Read in Bank 3: Read 00H, 08H, 10H, 18H', intermediateResult: 'A reads 10H, 20H, 30H, 40H successfully', flagImpact: 'Isolation Confirmed' }
      ],
      finalOutput: 'RAM 00H-1FH populated with 4 independent 8-byte banks; direct memory reading validates isolation.'
    },
    industrialRelevance:
      'Embedded RTOS multitasking preemptive kernels, low-latency interrupt service routines for medical instrumentation, automotive engine CAN-bus packet reception, and brushless DC motor PWM commutators.'
  },

  exp_8051_timer0_m1: {
    principleTitle: '8051 Timer 0 in Mode 1 (16-Bit Up-Counter) – 25 ms Delay & Port P0 Blink',
    corePrinciple:
      'Mode 1 configures 8051 Timer 0 as a full 16-bit up-counter (TMOD = 01H). The counter register comprises two cascaded 8-bit SFRs: TL0 (Timer 0 Low byte, SFR 8AH) and TH0 (Timer 0 High byte, SFR 8CH), yielding a count capacity of 2^16 = 65,536 counts (0000H to FFFFH). With an internal 12.0 MHz crystal oscillator, one machine cycle equals 12 / 12 MHz = 1.0 µs. A target delay of 25 ms (25,000 µs) requires 25,000 machine cycles. The initial preload count N is determined by N = 65,536 - 25,000 = 40,536 = 9E58H (TH0 = 9EH, TL0 = 58H). Starting Timer 0 via `SETB TR0` causes it to increment every 1 µs from 9E58H up to FFFFH; the next pulse rolls over to 0000H and hardware sets the Timer 0 Overflow Flag (TF0 = 1 in TCON.5). The CPU detects rollover via `JNB TF0, $`, stops the timer (`CLR TR0`), clears the flag (`CLR TF0`), and inverts Port 0 (`CPL P0` or `MOV P0, A`) to toggle all 8 LEDs every 25 ms.',
    keyConcepts: [
      {
        title: 'TMOD Register Configuration (01H)',
        description:
          'TMOD.3 (GATE0=0: software TR0 control), TMOD.2 (C/T0=0: internal timer @ Fosc/12), TMOD.1..0 (M1=0, M0=1: Mode 1 16-bit timer).',
        badge: 'TMOD Setup'
      },
      {
        title: '16-Bit Preload Calculation (9E58H)',
        description:
          'Counts = 25,000. Preload = 65,536 - 25,000 = 40,536 = 9E58H. Preloading TH0 = 9EH and TL0 = 58H guarantees exactly 25,000 µs = 25 ms per overflow.',
        badge: 'Hex Preload'
      },
      {
        title: 'Hardware Overflow Handshaking (TF0)',
        description:
          'When TL0/TH0 increments from FFFFH to 0000H, the CPU hardware sets TCON.5 (TF0). The software delay loop polls `JNB TF0, HERE` until the bit goes HIGH.',
        badge: 'TF0 Polling'
      },
      {
        title: 'Port P0 Active Toggling & Pull-Up Requirement',
        description:
          'Port P0 is an open-drain bidirectional port. When connected to LED indicators with external pull-up resistors (10 kΩ), toggling P0 (`CPL P0`) alternates all 8 LEDs ON and OFF.',
        badge: 'Port P0 I/O'
      }
    ],
    mathematicalFormulation: {
      formula: 'Machine Cycle T_cyc = 12 / f_osc = 1.0 µs,   N_counts = 25 ms / 1.0 µs = 25,000,   Preload = 65,536 - 25,000 = 40,536 = 9E58H (TH0=9EH, TL0=58H)',
      explanation: 'Timer registers count upwards from 9E58H to FFFFH over exactly 25,000 clock pulses (25.000 ms).',
      steps: [
        'Crystal Frequency: fosc = 12.0 MHz -> Machine Cycle = 12 / 12 MHz = 1.0 µs',
        'Required Counts: Delay / Tcyc = 25 ms / 1.0 µs = 25,000 counts',
        '16-Bit Max Value: 2^16 = 65,536 (FFFFH + 1)',
        'Preload Initial Value: 65,536 - 25,000 = 40,536 = 9E58H',
        'High Byte: TH0 = 9EH (40,536 / 256 = 158 = 9EH)',
        'Low Byte: TL0 = 58H (40,536 mod 256 = 88 = 58H)'
      ]
    },
    architecturalMechanisms: [
      { feature: 'Timer Mode Register TMOD (89H)', role: 'Sets GATE=0, C/T=0, Mode 1 (16-bit) -> 01H.' },
      { feature: 'Timer Control Register TCON (88H)', role: 'Provides TR0 (bit 4, Timer 0 Run) and TF0 (bit 5, Timer 0 Overflow Flag).' },
      { feature: 'TH0 & TL0 Registers (8CH & 8AH)', role: '16-bit counter register pair holding 9EH and 58H.' },
      { feature: 'Port P0 Latches (80H)', role: '8-bit open-drain I/O port toggled between 00H and FFH.' }
    ],
    workedExample: {
      inputLabel: 'Timer 0 Mode 1 Timing Specification',
      inputValue: 'Oscillator = 12.0 MHz | Target Delay = 25.0 ms | Target Port = Port P0 (8 LEDs)',
      calculationSteps: [
        { stepNumber: 1, operation: 'Calculate Machine Cycle Period', intermediateResult: 'Tcyc = 12 / 12.0 MHz = 1.0 µs', flagImpact: 'Standard 8051 Timing' },
        { stepNumber: 2, operation: 'Compute Required Clock Counts', intermediateResult: 'Counts = 25,000 µs / 1.0 µs = 25,000', flagImpact: 'Count = 25,000D' },
        { stepNumber: 3, operation: 'Calculate Hex Preload Value', intermediateResult: '65,536 - 25,000 = 40,536 = 9E58H', flagImpact: 'TH0=9EH, TL0=58H' },
        { stepNumber: 4, operation: 'Timer Incrementation & Rollover', intermediateResult: 'TL0:TH0 counts 9E58H -> FFFFH -> 0000H', flagImpact: 'TF0 = 1' },
        { stepNumber: 5, operation: 'Port P0 Inversion & Repeat', intermediateResult: 'P0 toggles: 00H -> FFH (25 ms ON / 25 ms OFF)', flagImpact: 'Freq = 20 Hz (50 ms period)' }
      ],
      finalOutput: 'Stable 25.0 ms delay generated per half-cycle; Port P0 blinks at 20.0 Hz with 50% duty cycle.'
    },
    industrialRelevance:
      'Industrial visual warning beacon flashers, relay coil energization timing, optical tachometer sampling windows, debounced switch polling cadence, and precision periodic sensor sampling in SCADA systems.'
  },

  exp_8051_timer1_m0: {
    principleTitle: '8051 Timer 1 in Mode 0 (13-Bit Legacy Counter) – 50 µs Delay & Port P2 Blink',
    corePrinciple:
      'Mode 0 configures 8051 Timer 1 as a 13-bit legacy counter (compatible with the precursor 8048 microcontroller). The 13-bit counter consists of all 8 bits of TH1 (SFR 8DH) as the upper byte and the 5 lowest bits (D0-D4) of TL1 (SFR 8BH) as the lower 5 bits (bits D5-D7 of TL1 are unused/ignored), giving a total count range of 2^13 = 8,192 counts (0000H to 1FFFH). At 12.0 MHz, 1 machine cycle is 1.0 µs. A target delay of 50 µs requires 50 machine cycles. The 13-bit preload count is 8,192 - 50 = 8,142 = 1FCEH in 13-bit format. Decomposing 8,142: the upper 8 bits (8,142 >> 5 = 254 = 0FEH) are loaded into TH1, and the lower 5 bits (8,142 & 1FH = 14 = 0EH) are loaded into TL1 (TH1 = 0FEH, TL1 = 0EH). Starting Timer 1 (`SETB TR1`) counts 50 machine cycles until overflow sets TF1 (TCON.7). Polling TF1, stopping TR1, clearing TF1, and toggling Port P2 (`CPL P2`) produces a high-frequency 10.0 kHz square wave.',
    keyConcepts: [
      {
        title: '13-Bit Structure & Mode 0 TMOD Setup',
        description:
          'TMOD = 00H sets Timer 1 in Mode 0 (M1=0, M0=0) and Timer 0 in Mode 0. The counter uses 8 bits of TH1 and 5 bits of TL1 (max 8,192).',
        badge: '13-Bit Counter'
      },
      {
        title: '13-Bit Split Register Mapping (TH1=FEH, TL1=0EH)',
        description:
          'Preload = 8,192 - 50 = 8,142. TH1 = 8,142 / 32 = 254 = 0FEH; TL1 = 8,142 mod 32 = 14 = 0EH.',
        badge: 'Split Preload'
      },
      {
        title: 'High-Frequency 10 kHz Ultrasonic Pulse Generation',
        description:
          'Toggling Port P2 every 50 µs produces a 100 µs full cycle period (1 / 100 µs = 10,000 Hz = 10 kHz square wave).',
        badge: '10 kHz Waveform'
      },
      {
        title: 'Hardware Backward Compatibility with MCS-48',
        description:
          'Mode 0 exists primarily for backward compatibility with 8048 codebases while offering low-overhead microsecond time intervals.',
        badge: '8048 Compatibility'
      }
    ],
    mathematicalFormulation: {
      formula: 'Preload (13-bit) = 8,192 - 50 = 8,142,   TH1 = ⌊8,142 / 32⌋ = 254 = 0FEH,   TL1 = 8,142 mod 32 = 14 = 0EH',
      explanation: '13-bit counter increments through 50 states (1FCEH -> 1FFFH -> 0000H) over 50.0 µs.',
      steps: [
        'Machine Cycle Period: 12 / 12 MHz = 1.0 µs',
        'Required Ticks: 50 µs / 1.0 µs = 50 counts',
        '13-Bit Max Count: 2^13 = 8,192',
        'Preload: 8,192 - 50 = 8,142D',
        'TH1 (Upper 8 bits): 8,142 >> 5 = 254 = 0FEH',
        'TL1 (Lower 5 bits): 8,142 & 0x1F = 14 = 0EH'
      ]
    },
    architecturalMechanisms: [
      { feature: 'Timer Mode Register TMOD (89H)', role: 'Configured as 00H (Timer 1 Mode 0, Timer 0 Mode 0).' },
      { feature: 'Timer Control Register TCON (88H)', role: 'TR1 (bit 6) starts Timer 1; TF1 (bit 7) indicates 13-bit rollover.' },
      { feature: 'TH1 (8DH) & TL1 (8BH)', role: 'Split 13-bit counter holding FEH and 0EH.' },
      { feature: 'Port P2 (A0H)', role: 'High-speed quasi-bidirectional I/O port toggled at 10 kHz.' }
    ],
    workedExample: {
      inputLabel: 'Timer 1 Mode 0 Timing Specification',
      inputValue: 'Oscillator = 12.0 MHz | Delay = 50.0 µs | Output = Port P2 (8 Pins)',
      calculationSteps: [
        { stepNumber: 1, operation: 'Calculate Target Count', intermediateResult: 'Count = 50 µs / 1.0 µs = 50 cycles', flagImpact: 'Tcyc = 1 µs' },
        { stepNumber: 2, operation: '13-Bit Preload Arithmetic', intermediateResult: '8,192 - 50 = 8,142D (1FCEH in 13-bit)', flagImpact: 'Preload = 8142' },
        { stepNumber: 3, operation: 'Split into TH1 and TL1', intermediateResult: 'TH1 = 254 (0FEH), TL1 = 14 (0EH)', flagImpact: 'TH1=FEH, TL1=0EH' },
        { stepNumber: 4, operation: 'Run Timer & Detect TF1', intermediateResult: '50 counts elapse -> TF1 asserted HIGH', flagImpact: 'TF1 = 1' },
        { stepNumber: 5, operation: 'Toggle Port P2', intermediateResult: 'Port P2 alternates every 50 µs (10.0 kHz square wave)', flagImpact: 'Square Wave Active' }
      ],
      finalOutput: 'Exact 50 µs half-cycle delay verified; Port P2 produces a 10.0 kHz continuous pulse waveform.'
    },
    industrialRelevance:
      'Ultrasonic distance sensor transmitter burst modulation (40 kHz / 10 kHz pulses), infrared remote control carrier synthesis (NEC / RC-5 protocols), buzzer tone generation, and high-frequency PWM switching.'
  },

  exp_8051_counter0_m2: {
    principleTitle: '8051 Counter/Timer 0 in Mode 2 (8-Bit Auto-Reload) – 75 ms Delay & Port P1 Blink',
    corePrinciple:
      'Mode 2 configures Timer/Counter 0 as an 8-bit Auto-Reload register (TMOD = 02H for internal timer, 06H for external counter on pin T0/P3.4). In this mode, TL0 (SFR 8AH) acts as the active 8-bit counting register (00H to FFH = 256 counts max), while TH0 (SFR 8CH) holds a permanent reload constant. When TL0 increments from FFH to 00H (overflow), hardware simultaneously asserts the overflow flag (TF0 = 1) and automatically reloads the 8-bit contents of TH0 into TL0 without software intervention. To achieve a 75 ms (75,000 µs) delay using 8-bit registers (which max out at 256 µs per reload), a base tick of 250 µs is configured by setting TH0 = 256 - 250 = 6 (06H). A software multiplier loop using general-purpose registers R2 and R3 executes 300 iterations (R2 = 2, R3 = 150 -> 2 × 150 = 300 × 250 µs = 75,000 µs = 75 ms). Once the 300 loops complete, Port P1 is complemented (`CPL P1`) to toggle all 8 LEDs at a rate of 6.67 Hz.',
    keyConcepts: [
      {
        title: '8-Bit Auto-Reload Architecture (TH0 -> TL0)',
        description:
          'Upon TL0 overflow (FFH -> 00H), TH0 is copied to TL0 by hardware in 0 machine cycles, completely eliminating software reload jitter.',
        badge: 'Auto-Reload'
      },
      {
        title: 'TMOD Register Configuration (02H / 06H)',
        description:
          'TMOD = 02H sets Timer 0 in Mode 2 (M1=1, M0=0, C/T=0). If external pulse counting on P3.4 is desired, TMOD = 06H (C/T=1).',
        badge: 'TMOD Mode 2'
      },
      {
        title: 'Nested Software Multiplier Loop (300 × 250 µs)',
        description:
          'Because 8-bit counter max delay is 256 µs, a 250 µs base tick (TH0=06H) is multiplied by 300 iterations (R2=2, R3=150) to generate exactly 75 ms.',
        badge: 'Nested Multiplier'
      },
      {
        title: 'Port P1 Quasi-Bidirectional I/O Interfacing',
        description:
          'Port P1 contains internal pull-up resistors. Toggling P1 (`CPL P1`) directly drives 8 active-low LEDs without external pull-ups.',
        badge: 'Port P1 Drive'
      }
    ],
    mathematicalFormulation: {
      formula: 'T_base = (256 - TH0) × 1.0 µs = (256 - 6) × 1.0 µs = 250 µs,   T_total = 300 × 250 µs = 75,000 µs = 75 ms',
      explanation: 'Auto-reload hardware ensures jitter-free 250 µs periodic ticks, scaled by 300 software loop iterations.',
      steps: [
        'Target Base Delay: 250 µs (chosen to evenly divide 75,000 µs: 75,000 / 250 = 300)',
        '8-Bit Preload in TH0: 256 - 250 = 6 = 06H',
        'Active Counter: TL0 initialized with 06H',
        'Outer Loop Multiplier: R2 = 2',
        'Inner Loop Multiplier: R3 = 150 (96H)',
        'Total Iterations: R2 × R3 = 2 × 150 = 300 iterations',
        'Total Delay: 300 × 250 µs = 75,000 µs = 75.0 ms'
      ]
    },
    architecturalMechanisms: [
      { feature: 'Timer Mode Register TMOD (89H)', role: 'Configured as 02H (Timer 0 Mode 2: 8-bit Auto-Reload).' },
      { feature: 'TH0 Reload Register (8CH)', role: 'Holds the permanent reload value 06H.' },
      { feature: 'TL0 Active Counter (8AH)', role: 'Increments from 06H to FFH and auto-reloads 06H on rollover.' },
      { feature: 'Registers R2 & R3 (Bank 0)', role: 'Software loop counters maintaining the 300-count multiplier.' },
      { feature: 'Port P1 (90H)', role: '8-bit I/O port toggled every 75 ms.' }
    ],
    workedExample: {
      inputLabel: 'Counter/Timer 0 Mode 2 Delay Parameters',
      inputValue: 'Base Tick = 250 µs (TH0 = 06H) | Multiplier = 300 (R2=2, R3=150) | Output = Port P1',
      calculationSteps: [
        { stepNumber: 1, operation: 'Compute Base Auto-Reload Delay', intermediateResult: '(256 - 6) × 1.0 µs = 250 µs per TF0 pulse', flagImpact: 'TH0 = 06H' },
        { stepNumber: 2, operation: 'Configure Software Loop Counters', intermediateResult: 'R2 = 2, R3 = 150 -> 2 × 150 = 300 ticks', flagImpact: 'Loop Count = 300' },
        { stepNumber: 3, operation: 'Execute Auto-Reload Counting', intermediateResult: 'TL0 counts 06H -> FFH, asserts TF0, auto-reloads 06H', flagImpact: 'Jitter = 0 ns' },
        { stepNumber: 4, operation: 'Accumulate 300 Reload Ticks', intermediateResult: '300 × 250 µs = 75,000 µs = 75.0 ms', flagImpact: 'Time = 75 ms' },
        { stepNumber: 5, operation: 'Toggle Port P1 Pins', intermediateResult: 'Port P1 inverts (00H <-> FFH); Period = 150 ms (6.67 Hz)', flagImpact: 'LEDs Blink' }
      ],
      finalOutput: 'Exact 75.0 ms delay achieved; Port P1 blinks at 6.67 Hz with zero cumulative timing drift.'
    },
    industrialRelevance:
      'UART serial baud rate generators (Timer 1 Mode 2 for 9600 baud), periodic RTOS system tick timers (1 ms / 250 µs), factory conveyor product counting (Counter Mode), and industrial heartbeat watchdog indicators.'
  },

  exp_8051_counter1_m1: {
    principleTitle: '8051 Counter 1 in Mode 1 (16-Bit Event Counter) – 80 µs Delay & Port P3 Blink',
    corePrinciple:
      'Mode 1 configures 8051 Counter 1 as a 16-bit event counter / timer (TMOD = 50H for external pulse counting on pin T1/P3.5, or TMOD = 10H for internal machine cycles). When C/T1 = 1 (TMOD.6 = 1), Counter 1 increments on every 1-to-0 negative edge transition detected on external input pin T1 (P3.5). The 16-bit register pair TH1:TL1 provides a capacity of 65,536 counts. For an 80 µs interval (or counting exactly 80 external clock events at 1 MHz / 12 MHz), the required count is 80. The 16-bit preload value is N = 65,536 - 80 = 65,456 = FFB0H (TH1 = 0FFH, TL1 = 0B0H). Starting Counter 1 (`SETB TR1`) allows it to count 80 incoming pulses until the counter rolls over from FFFFH to 0000H, asserting the overflow flag TF1 (TCON.7). Polling TF1, stopping Counter 1 (`CLR TR1`), clearing TF1 (`CLR TF1`), and complementing Port P3 (`CPL P3`) toggles the pins to produce a 6.25 kHz output pulse train.',
    keyConcepts: [
      {
        title: 'External Counter Mode 1 (TMOD = 50H)',
        description:
          'TMOD.6 (C/T1=1: count external pulses on pin T1/P3.5), TMOD.5..4 (M1=0, M0=1: 16-bit Mode 1). TMOD = 50H.',
        badge: 'C/T1 Counter'
      },
      {
        title: '16-Bit Preload Calculation (FFB0H)',
        description:
          '80 pulses required. Preload = 65,536 - 80 = 65,456 = FFB0H. Loaded into TH1 = 0FFH and TL1 = 0B0H.',
        badge: '16-Bit Count'
      },
      {
        title: 'Negative-Edge External Pulse Detection (Pin T1 / P3.5)',
        description:
          'The 8051 samples external pin T1 once every machine cycle; a 1-to-0 negative transition increments the 16-bit counter.',
        badge: 'Event Trigger'
      },
      {
        title: 'Port P3 Multifunction Pin Toggling',
        description:
          'Port P3 provides dual functions (RxD/TxD, INT0/INT1, T0/T1, WR/RD). Complementing P3 (`CPL P3`) verifies both general I/O and pulse generation.',
        badge: 'Port P3 Dual-Role'
      }
    ],
    mathematicalFormulation: {
      formula: 'Preload = 65,536 - 80 = 65,456 = FFB0H (TH1=0FFH, TL1=0B0H),   f_out = 1 / (2 × 80 µs) = 6,250 Hz = 6.25 kHz',
      explanation: 'Counter 1 accumulates 80 pulses from FFB0H to FFFFH and overflows on the 80th event.',
      steps: [
        'Pulse / Delay Target: 80 µs (80 machine cycles / 80 external pulses)',
        '16-Bit Counter Modulo: 2^16 = 65,536',
        'Preload: 65,536 - 80 = 65,456 = FFB0H',
        'High Register: TH1 = 0FFH',
        'Low Register: TL1 = 0B0H',
        'Full Wave Period: 2 × 80 µs = 160 µs -> Frequency = 1 / 160 µs = 6.25 kHz'
      ]
    },
    architecturalMechanisms: [
      { feature: 'Timer Mode Register TMOD (89H)', role: 'Set to 50H for Counter 1 Mode 1 (or 10H for internal timer).' },
      { feature: 'External Pin T1 (P3.5)', role: 'Clock input pin sampled on negative edges (1-to-0).' },
      { feature: 'TH1 & TL1 (8DH & 8BH)', role: '16-bit counter register pair holding FFH and B0H.' },
      { feature: 'Port P3 (B0H)', role: 'Multifunctional I/O port toggled at 6.25 kHz.' }
    ],
    workedExample: {
      inputLabel: 'Counter 1 Mode 1 Specification',
      inputValue: 'Event Count = 80 Pulses / 80 µs | Preload = FFB0H | Output = Port P3 Pins',
      calculationSteps: [
        { stepNumber: 1, operation: 'Calculate Target Count', intermediateResult: 'Count = 80 pulses', flagImpact: 'N = 80D' },
        { stepNumber: 2, operation: 'Compute 16-Bit Preload Value', intermediateResult: '65,536 - 80 = 65,456 = FFB0H', flagImpact: 'TH1=FFH, TL1=B0H' },
        { stepNumber: 3, operation: 'Start Counter & Sample Pulses', intermediateResult: 'Counter 1 increments on 80 consecutive transitions', flagImpact: 'TR1 = 1' },
        { stepNumber: 4, operation: 'Detect Rollover at FFFFH -> 0000H', intermediateResult: 'TF1 flag asserted HIGH in TCON.7', flagImpact: 'TF1 = 1' },
        { stepNumber: 5, operation: 'Complement Port P3', intermediateResult: 'Port P3 toggles; Output Frequency = 6.25 kHz', flagImpact: 'Square Wave Active' }
      ],
      finalOutput: 'Precise 80 µs / 80 pulse duration measured; Port P3 blinks/toggles cleanly at 6.25 kHz.'
    },
    industrialRelevance:
      'Optical encoder rotary position tracking, turbine flow meter liquid volume measurement, frequency counter front-ends, high-speed pulse width measurement, and stepper motor position feedback loop decoders.'
  },
  exp_8051_uart_9600: {
    principleTitle: '8051 Universal Asynchronous Receiver-Transmitter (UART) Serial Protocol & 9600 Baud Generation',
    corePrinciple:
      'The 8051 microcontroller features a full-duplex asynchronous serial transceiver (UART). In Mode 1 (8-bit UART with variable baud rate), serial data is transmitted framed by 1 active-LOW Start bit, 8 Data bits (LSB first), and 1 active-HIGH Stop bit. Baud rate generation is synthesized using Timer 1 in Mode 2 (8-bit auto-reload). Writing a byte into SFR register SBUF (99H) initiates transmission over Pin TXD (P3.1). The hardware automatically asserts the Transmit Interrupt flag (TI in SCON.1) upon completion of the frame, which must then be cleared by software.',
    keyConcepts: [
      {
        title: 'Asynchronous 10-Bit Frame Format (Mode 1)',
        description:
          'Mode 1 generates a 10-bit asynchronous frame: 1 Start bit (LOW), 8 Data bits (D0–D7, LSB first), and 1 Stop bit (HIGH). SCON is initialized with 50H (SM0=0, SM1=1, REN=1).',
        badge: '10-Bit UART Frame'
      },
      {
        title: 'Timer 1 Mode 2 Auto-Reload Baud Rate Generator',
        description:
          'Timer 1 in Mode 2 (TMOD = 20H) continuously reloads TL1 from TH1 upon overflow without CPU intervention, eliminating clock jitter and ensuring exact baud timing.',
        badge: '8-Bit Auto-Reload'
      },
      {
        title: '11.0592 MHz Crystal for Zero-Error Baud Rates',
        description:
          'An 11.0592 MHz crystal provides an internal UART machine clock of 921.6 kHz / 32 = 28,800 Hz, which divides cleanly into standard baud rates (9600, 4800, 2400) with 0.00% frequency error.',
        badge: 'Zero-Error Crystal'
      },
      {
        title: 'Double-Buffered Serial SFR Registers (SBUF & SCON)',
        description:
          'SBUF (99H) acts as physical transmit and receive data buffer. SCON (98H) manages frame modes and interrupt handshaking flags (TI/RI).',
        badge: 'SBUF / SCON Control'
      }
    ],
    mathematicalFormulation: {
      formula: 'Baud Rate = [2^SMOD / 32] × [f_osc / (12 × (256 - TH1))],   TH1 = 256 - (28,800 / Baud Rate) = 256 - 3 = 253 = 0FDH (-3)',
      explanation: 'Timer 1 overflows every 3 machine cycles to produce 9600 baud (bit duration = 104.17 µs).',
      steps: [
        'Crystal Oscillator Frequency: f_osc = 11.0592 MHz',
        '8051 Machine Cycle Clock: 11.0592 MHz / 12 = 921.6 kHz',
        'UART Prescaler Frequency (SMOD=0): 921.6 kHz / 32 = 28,800 Hz',
        'Required Divider Factor: N = 28,800 / 9600 = 3 overflows',
        'Auto-Reload Value: TH1 = 256 - 3 = 253 = 0FDH (-3D in 2\'s complement)',
        'Bit Duration: T_bit = 1 / 9600 = 104.167 µs | 10-Bit Frame Time: 1.04167 ms'
      ]
    },
    architecturalMechanisms: [
      { feature: 'Timer Mode SFR TMOD (89H)', role: 'Loaded with 20H to select Timer 1 Mode 2 (8-bit auto-reload).' },
      { feature: 'Timer 1 Reload SFR TH1 (8DH)', role: 'Holds auto-reload byte 0FDH (-3) for 9600 baud rate.' },
      { feature: 'Serial Control SFR SCON (98H)', role: 'Loaded with 50H for Mode 1 8-bit UART and receiver enable.' },
      { feature: 'Serial Buffer SFR SBUF (99H)', role: 'Holds character \'A\' (41H); writing triggers serial shift out on TXD.' },
      { feature: 'Pin TXD (P3.1 / Pin 11)', role: 'Physical serial transmit pin driven by shift register.' }
    ],
    workedExample: {
      inputLabel: 'UART 9600 Baud Rate Transmission Setup',
      inputValue: "Character = 'A' (41H / 01000001B) | Crystal = 11.0592 MHz | Baud Rate = 9600 bps",
      calculationSteps: [
        { stepNumber: 1, operation: 'Calculate UART Base Clock', intermediateResult: '11.0592 MHz / 384 = 28,800 Hz', flagImpact: 'Prescaler Clock' },
        { stepNumber: 2, operation: 'Compute Timer 1 Reload (TH1)', intermediateResult: '256 - (28,800 / 9600) = 256 - 3 = 253 = 0FDH', flagImpact: 'TH1 = 0FDH' },
        { stepNumber: 3, operation: 'Initialize SCON & Start Timer 1', intermediateResult: 'SCON = 50H, SETB TR1', flagImpact: 'TR1 = 1' },
        { stepNumber: 4, operation: 'Transmit Character byte', intermediateResult: "MOV SBUF, #'A' -> Hardware shifts 10-bit frame out TXD", flagImpact: 'SBUF = 41H' },
        { stepNumber: 5, operation: 'Poll TI Flag & Clear', intermediateResult: 'Hardware asserts TI=1 at stop bit; CLR TI clears flag', flagImpact: 'TI: 0 -> 1 -> 0' }
      ],
      finalOutput: "Character 'A' transmitted over serial port at 9600 baud with exact bit duration 104.167 µs and frame duration 1.042 ms."
    },
    industrialRelevance:
      'Standard serial telemetry for IoT gateways, GPS NMEA receivers, HC-05 Bluetooth modules, RS-232/RS-485 industrial fieldbuses, and microcontroller debugging consoles.'
  },
  exp_8051_uart_4800: {
    principleTitle: '8051 UART 4800 Baud Rate Transmission & Long-Distance Serial Signaling',
    corePrinciple:
      'Operating the 8051 UART at 4800 baud doubles the bit duration (208.33 µs) compared to 9600 baud, significantly improving signal integrity over longer copper cable runs. Timer 1 in Mode 2 (8-bit auto-reload) is loaded with TH1 = 0FAH (250D = -6D), providing an exact division of the 28,800 Hz UART clock by 6. Serial frame transmission is monitored by polling the TI flag in SCON.',
    keyConcepts: [
      {
        title: 'Baud Rate Division by 6 (TH1 = 0FAH)',
        description:
          'At 4800 baud, the required timer division count is N = 28,800 / 4800 = 6. Auto-reload TH1 = 256 - 6 = 250D = 0FAH (-6 in 2\'s complement).',
        badge: 'TH1 = 0FAH'
      },
      {
        title: 'Extended Bit Time (208.33 µs)',
        description:
          'Each bit period is 1 / 4800 = 208.333 µs, and a 10-bit frame requires 2.0833 ms to transmit. This relaxes slew rate and line capacitance constraints on RS-485 buses.',
        badge: '208.33 µs Bit Period'
      },
      {
        title: 'Handshake Polling via TI Flag',
        description:
          'Software polls `JNB TI, $` to wait until the hardware finishes shifting out the stop bit, then clears TI (`CLR TI`) prior to the next transfer.',
        badge: 'TI Flag Synchronization'
      }
    ],
    mathematicalFormulation: {
      formula: 'Baud Rate = 28,800 / (256 - TH1) = 4,800 Baud,   TH1 = 256 - (28,800 / 4,800) = 256 - 6 = 250 = 0FAH (-6)',
      explanation: 'Timer 1 overflows every 6 machine cycles to synthesize 4800 baud.',
      steps: [
        'Crystal Oscillator Frequency: 11.0592 MHz',
        'UART Base Frequency: 11.0592 MHz / 384 = 28,800 Hz',
        'Division Factor: N = 28,800 / 4800 = 6 counts',
        'Auto-Reload Value: TH1 = 256 - 6 = 250 = 0FAH',
        'Bit Period: 1 / 4800 = 208.333 µs | Character Frame Period: 2.0833 ms'
      ]
    },
    architecturalMechanisms: [
      { feature: 'Timer Mode SFR TMOD (89H)', role: 'Configured with 20H for Timer 1 Mode 2 auto-reload.' },
      { feature: 'Timer 1 Reload SFR TH1 (8DH)', role: 'Holds auto-reload count 0FAH (-6) for 4800 baud.' },
      { feature: 'Serial Control SFR SCON (98H)', role: 'Configured with 50H for 8-bit UART Mode 1 and REN=1.' },
      { feature: 'Pin TXD (P3.1)', role: 'Drives serial bitstream at 4800 baud (208.33 µs per bit).' }
    ],
    workedExample: {
      inputLabel: 'UART 4800 Baud Rate Transmission Setup',
      inputValue: "Character = 'B' (42H / 01000010B) | Crystal = 11.0592 MHz | Baud Rate = 4800 bps",
      calculationSteps: [
        { stepNumber: 1, operation: 'Compute Timer 1 Division', intermediateResult: '28,800 Hz / 4800 Baud = 6 overflows', flagImpact: 'N = 6' },
        { stepNumber: 2, operation: 'Set Reload Register TH1', intermediateResult: 'TH1 = 256 - 6 = 250 = 0FAH', flagImpact: 'TH1 = 0FAH' },
        { stepNumber: 3, operation: 'Load SBUF & Start TX', intermediateResult: "MOV SBUF, #'B' -> 10 bits shifted out pin TXD (P3.1)", flagImpact: 'SBUF = 42H' },
        { stepNumber: 4, operation: 'Wait for TI Flag', intermediateResult: 'Stop bit detected -> TI asserted HIGH (1)', flagImpact: 'TI = 1' }
      ],
      finalOutput: "Character 'B' transmitted serially at 4800 baud (208.33 µs/bit, 2.083 ms/frame)."
    },
    industrialRelevance:
      'Long-distance RS-485 Modbus telemetry networks, legacy point-of-sale thermal printers, electronic weighing scale interfaces, and maritime AIS transponders.'
  },
  exp_8051_uart_2400: {
    principleTitle: '8051 UART 2400 Baud Rate Transmission & Low-Speed Robust Industrial Communications',
    corePrinciple:
      'At 2400 baud, Timer 1 Mode 2 auto-reload register TH1 is set to 256 - (28,800 / 2400) = 256 - 12 = 244 = 0F4H (-12 in 2\'s complement). The bit period is 416.67 µs, providing exceptional noise immunity in harsh industrial, subsea, and high-interference environments.',
    keyConcepts: [
      {
        title: 'Baud Rate Division by 12 (TH1 = 0F4H)',
        description:
          'Timer 1 overflows every 12 machine cycles. Auto-reload TH1 = 256 - 12 = 244D = 0F4H (-12 in 2\'s complement).',
        badge: 'TH1 = 0F4H'
      },
      {
        title: '416.67 µs Bit Period & High Noise Immunity',
        description:
          'Long bit durations provide robust margins against transmission line capacitance, inductive spikes, and acoustic attenuation.',
        badge: '416.67 µs Bit Period'
      },
      {
        title: 'Deterministic Mode 2 Auto-Reload',
        description:
          'Hardware automatically reloads TL1 from TH1 upon rollover, maintaining zero accumulated timing jitter over days of continuous operation.',
        badge: 'Jitter-Free Clock'
      }
    ],
    mathematicalFormulation: {
      formula: 'Baud Rate = 28,800 / (256 - TH1) = 2,400 Baud,   TH1 = 256 - (28,800 / 2,400) = 256 - 12 = 244 = 0F4H (-12)',
      explanation: 'Timer 1 overflows every 12 machine cycles to generate a 2400 baud bit clock.',
      steps: [
        'Crystal Oscillator Frequency: 11.0592 MHz',
        'UART Prescaler Clock: 11.0592 MHz / 384 = 28,800 Hz',
        'Division Factor: N = 28,800 / 2400 = 12 overflows',
        'Auto-Reload Value: TH1 = 256 - 12 = 244 = 0F4H',
        'Bit Duration: 1 / 2400 = 416.667 µs | 10-Bit Frame Time: 4.1667 ms'
      ]
    },
    architecturalMechanisms: [
      { feature: 'Timer Mode SFR TMOD (89H)', role: 'Configured with 20H for Timer 1 Mode 2 auto-reload.' },
      { feature: 'Timer 1 Reload SFR TH1 (8DH)', role: 'Holds auto-reload byte 0F4H (-12) for 2400 baud.' },
      { feature: 'Serial Control SFR SCON (98H)', role: 'Configured with 50H for 8-bit UART Mode 1 and REN=1.' },
      { feature: 'Pin TXD (P3.1)', role: 'Drives serial bitstream at 2400 baud (416.67 µs per bit).' }
    ],
    workedExample: {
      inputLabel: 'UART 2400 Baud Rate Transmission Setup',
      inputValue: "Character = 'C' (43H / 01000011B) | Crystal = 11.0592 MHz | Baud Rate = 2400 bps",
      calculationSteps: [
        { stepNumber: 1, operation: 'Compute Timer 1 Division', intermediateResult: '28,800 Hz / 2400 Baud = 12 overflows', flagImpact: 'N = 12' },
        { stepNumber: 2, operation: 'Set Reload Register TH1', intermediateResult: 'TH1 = 256 - 12 = 244 = 0F4H', flagImpact: 'TH1 = 0F4H' },
        { stepNumber: 3, operation: 'Load SBUF & Transmit', intermediateResult: "MOV SBUF, #'C' -> Frame shifted out TXD at 2400 baud", flagImpact: 'SBUF = 43H' },
        { stepNumber: 4, operation: 'Poll & Reset TI', intermediateResult: 'JNB TI, $ -> CLR TI', flagImpact: 'TI = 0' }
      ],
      finalOutput: "Character 'C' transmitted serially at 2400 baud (416.67 µs/bit, 4.167 ms/frame)."
    },
    industrialRelevance:
      'Subsea acoustic modems, power substation SCADA RTUs, long-range emergency radio links, and legacy aviation navigation instrument telemetry.'
  },
  exp_8051_lcd_8bit: {
    principleTitle: 'Interfacing 16×2 Alphanumeric LCD with 8051 (8-Bit Parallel Interface Mode)',
    corePrinciple:
      'A 16×2 alphanumeric LCD module utilizes the industry-standard Hitachi HD44780 (or compatible ST7066) dot-matrix liquid crystal controller. The display is arranged as 2 rows of 16 character cells, where each character cell is rendered as a 5×7 pixel matrix with a bottom underline cursor row (5×8 total). In 8-bit interface mode, all 8 data lines (D0–D7) are connected directly to an 8051 parallel port (such as Port P1), allowing full 8-bit bytes (commands or ASCII character codes) to be transferred in a single Enable strobe cycle. Three control lines govern LCD operation: Register Select RS (P2.0), Read/Write RW (P2.1), and Enable EN (P2.2). Setting RS=0 directs the transmitted byte into the Instruction Register (IR) for configuration commands (such as 38H, 0EH, 01H, 06H, 80H, C0H), whereas setting RS=1 directs the byte into the Data Register (DR) and stores it into Display Data RAM (DDRAM) to render the corresponding ASCII character on screen. Setting RW=0 selects Write operation. Data is latched into the HD44780 on the falling edge (HIGH-to-LOW transition) of the Enable (EN) pulse, which must remain HIGH for a minimum pulse width of 450 ns.',
    keyConcepts: [
      {
        title: 'HD44780 Register Architecture (IR vs. DR)',
        description:
          'RS=0 selects the Instruction Register (IR) for LCD configuration commands; RS=1 selects the Data Register (DR) to write ASCII text to DDRAM or custom glyphs to CGRAM.',
        badge: 'RS Pin Control'
      },
      {
        title: 'High-to-Low Enable Strobe Latching',
        description:
          'Data or command bytes present on Port P1 (D0–D7) are latched into the LCD controller on the negative edge of the Enable strobe (EN = 1 -> delay -> EN = 0, t_pw >= 450 ns).',
        badge: 'EN Falling Edge'
      },
      {
        title: 'DDRAM Memory Mapping (Line 1: 80H, Line 2: C0H)',
        description:
          'Display Data RAM addresses: Row 1 spans 80H to 8FH (00H + 80H command offset); Row 2 spans C0H to CFH (40H + 80H command offset).',
        badge: 'DDRAM Addresses'
      },
      {
        title: '8-Bit Mode Initialization Sequence (38H, 0EH, 01H, 06H)',
        description:
          '38H (2 lines, 5×7 font, 8-bit bus), 0EH (Display ON, cursor ON), 01H (Clear screen with 2 ms delay), and 06H (Auto-increment cursor).',
        badge: '8-Bit Function Set'
      }
    ],
    mathematicalFormulation: {
      formula: 'DDRAM Address Command = 80H + Offset_Row_Col,   t_EN_pulse ≥ 450 ns,   t_clear ≥ 1.53 ms',
      explanation: 'Setting DDRAM cursor requires MSB (Bit 7) HIGH. Clear screen and Return Home require extended execution delays (~1.53 to 2.0 ms).',
      steps: [
        'Line 1 Base Address: 00H -> Command Byte = 80H + 00H = 80H',
        'Line 2 Base Address: 40H -> Command Byte = 80H + 40H = 0C0H',
        'Line 1 Column 5 Address: 80H + 04H = 84H',
        'Enable Strobe Pulse Width: 3 NOPs at 11.0592 MHz = 3.255 µs (> 450 ns minimum)',
        'Character Write Cycle Time: ~43 µs (addressed via 50 µs software delay)'
      ]
    },
    architecturalMechanisms: [
      { feature: 'Port P1 (90H)', role: 'Connected to LCD 8-bit bidirectional data bus (D0–D7 Pins 7 to 14).' },
      { feature: 'Pin P2.0 (RS)', role: 'Register Select line (0 = Instruction Register, 1 = Data Register).' },
      { feature: 'Pin P2.1 (RW)', role: 'Read/Write line (0 = Write to LCD, 1 = Read from LCD).' },
      { feature: 'Pin P2.2 (EN)', role: 'Enable strobe line (High-to-Low pulse latches data bus contents).' },
      { feature: 'VEE Pin 3 Trimpot', role: '10 kΩ potentiometer adjusting liquid crystal contrast voltage.' }
    ],
    workedExample: {
      inputLabel: '8-Bit LCD String Transmission Setup',
      inputValue: "String 1 = '8051 INTERFACE' | String 2 = '16x2 LCD 8-BIT' | Bus = Port P1 (8-Bit)",
      calculationSteps: [
        { stepNumber: 1, operation: 'Power-On Stabilization Delay', intermediateResult: '20 ms delay allows HD44780 internal POR to stabilize', flagImpact: 'POR Settled' },
        { stepNumber: 2, operation: 'Send Command 38H', intermediateResult: 'RS=0, RW=0, P1=38H, EN pulse -> 8-bit, 2 lines, 5x7 font configured', flagImpact: 'Function Set' },
        { stepNumber: 3, operation: 'Send Command 0EH & 01H', intermediateResult: 'Display ON, cursor ON, DDRAM cleared, cursor at Home (80H)', flagImpact: 'Display Active' },
        { stepNumber: 4, operation: 'Send Command 06H', intermediateResult: 'Entry mode: cursor auto-increments to the right after every write', flagImpact: 'Auto-Increment' },
        { stepNumber: 5, operation: 'Write Line 1 & Line 2 Strings', intermediateResult: 'RS=1, RW=0, loop through ASCII bytes with EN strobes', flagImpact: 'Text Rendered' }
      ],
      finalOutput: 'Both strings displayed on 16×2 LCD screen with active cursor.'
    },
    industrialRelevance:
      'Digital multimeters, laboratory power supplies, medical patient monitors, industrial PLC operator consoles, automotive speedometers, and CNC machinery status readouts.'
  },
  exp_8051_lcd_4bit: {
    principleTitle: 'Interfacing 16×2 Alphanumeric LCD with 8051 (4-Bit Multiplexed Mode & Pin Saving)',
    corePrinciple:
      'In pin-constrained embedded designs, dedicating 11 I/O pins (8 Data + 3 Control) to an LCD display is prohibitively expensive. The HD44780 controller natively supports a 4-Bit Interface Mode, requiring only 4 data pins (D4–D7 connected to P1.4–P1.7) and 3 control pins (RS, RW, EN on P2.0–P2.2), saving 4 microcontroller I/O pins (P1.0–P1.3) for sensors, relays, or keypad matrixes. In 4-bit mode, pins D0–D3 are left unconnected or grounded. Every 8-bit command or ASCII data character is split into two sequential 4-bit nibbles: first, the Higher Nibble (bits D7–D4) is placed on P1.4–P1.7 and latched with an Enable strobe; second, the Lower Nibble (bits D3–D0) is moved to the upper 4 bits via the 8051 `SWAP A` instruction, masked with `ANL A, #0F0H`, output on P1.4–P1.7, and latched with a second Enable strobe. A mandatory hardware-resynchronization handshake sequence (sending 30H three times, followed by 20H) forces the HD44780 internal state machine into 4-bit bus mode upon power-up.',
    keyConcepts: [
      {
        title: '4-Bit Pin Conservation (7 Pins vs. 11 Pins)',
        description:
          'Uses only 4 data lines (D4–D7) plus 3 control lines (RS, RW, EN), freeing 4 full microcontroller I/O pins for other system peripherals.',
        badge: 'Pin Budgeting'
      },
      {
        title: 'Dual-Nibble Transmission (`SWAP A` & `ANL A, #0F0H`)',
        description:
          'Each 8-bit byte is transmitted as two sequential 4-bit nibbles (High Nibble first, Low Nibble second), each triggered by an independent EN falling edge.',
        badge: 'Nibble Multiplexing'
      },
      {
        title: 'Mandatory 4-Bit Initialization Handshake (33H, 32H)',
        description:
          'A special sequence of single nibbles (30H, 30H, 30H, 20H) resets the internal state machine and reliably switches the HD44780 from 8-bit to 4-bit mode.',
        badge: 'State Machine Reset'
      },
      {
        title: '4-Bit Function Set Command (28H)',
        description:
          'Command 28H sets 4-bit interface data length (DL=0), 2 display lines (N=1), and 5×7 character font (F=0).',
        badge: '28H Function Set'
      }
    ],
    mathematicalFormulation: {
      formula: 'Nibble 1 (High) = Byte ∧ 0F0H,   Nibble 2 (Low) = SWAP(Byte) ∧ 0F0H,   t_byte_transfer = 2 × t_nibble ≈ 80 µs',
      explanation: 'Every byte transfer requires two 4-bit nibble cycles. Human perception threshold (>30 ms) renders the 80 µs transmission indistinguishable from 8-bit mode.',
      steps: [
        'Sample Byte: ASCII \'A\' = 41H = 0100 0001B',
        'High Nibble Calculation: 41H & 0F0H = 40H (Output on P1.4-P1.7, Strobe EN)',
        'Low Nibble Calculation: SWAP(41H) = 14H -> 14H & 0F0H = 10H (Output on P1.4-P1.7, Strobe EN)',
        'Total EN Strobes per Byte: 2 Pulses',
        'Frame Write Time (32 characters): 32 × 80 µs = 2.56 ms (100% flicker-free)'
      ]
    },
    architecturalMechanisms: [
      { feature: 'Port Pins P1.4–P1.7', role: 'Drives LCD 4-bit high data nibble bus (Pins D4 to D7 of LCD Module).' },
      { feature: 'Port Pins P1.0–P1.3', role: 'Freed for user peripherals (e.g. 4x4 keypad row pins, relay drivers, ADC SPI).' },
      { feature: 'SWAP A Instruction', role: 'Hardware nibble-exchange instruction in 8051 executing in 1 machine cycle.' },
      { feature: 'Control Pins P2.0 (RS), P2.1 (RW), P2.2 (EN)', role: 'Coordinates register select, write direction, and double-pulse latching.' }
    ],
    workedExample: {
      inputLabel: '4-Bit LCD Character Transmission',
      inputValue: "Character = 'M' (ASCII 4DH = 0100 1101B) | Bus = P1.4-P1.7 | Mode = 4-Bit",
      calculationSteps: [
        { stepNumber: 1, operation: 'Extract Higher Nibble', intermediateResult: '4DH AND 0F0H = 40H (0100 0000B)', flagImpact: 'High Nibble = 40H' },
        { stepNumber: 2, operation: 'Send High Nibble on P1.4-P1.7', intermediateResult: 'P1 = 40H, RS=1, RW=0, SETB EN -> CLR EN', flagImpact: 'EN Pulse 1' },
        { stepNumber: 3, operation: 'Swap & Extract Lower Nibble', intermediateResult: 'SWAP 4DH -> D4H; D4H AND 0F0H = 0D0H (1101 0000B)', flagImpact: 'Low Nibble = 0D0H' },
        { stepNumber: 4, operation: 'Send Low Nibble on P1.4-P1.7', intermediateResult: 'P1 = 0D0H, RS=1, RW=0, SETB EN -> CLR EN', flagImpact: 'EN Pulse 2' },
        { stepNumber: 5, operation: 'HD44780 Internal Reassembly', intermediateResult: 'Controller recombines 4H and DH -> 4DH and displays \'M\'', flagImpact: "Character 'M' Rendered" }
      ],
      finalOutput: "Character 'M' is reconstituted inside HD44780 and displayed at active DDRAM position."
    },
    industrialRelevance:
      'Smart home thermostats, handheld barcode scanners, IoT environmental monitors, battery-powered water meters, access control RFID keypads, and compact AT89C2051 microcontroller projects.'
  }
};

