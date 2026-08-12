export interface LabExperiment {
  id: string;
  number: number | string;
  title: string;
  aim: string;
  directivesUsed: string[];
  instructionsUsed?: string[];
  algorithm: string[];
  standardCode: string;
  simplifiedCode: string;
  bestPracticeTip: string;
}

export interface LabManualPage {
  number: string;
  title: string;
  aim: string;
  objectives: string[];
  outcomes: string[];
  components: Array<{ name: string; spec: string; purpose: string }>;
  procedureSteps: string[];
  theoryText: string;
  theoryDiagramType: 'carry-ripple' | 'register-pair' | 'pointer-scan' | 'bubble-swap' | 'block-copy';
  algorithmSteps: string[];
  flowchartSteps: Array<{ type: 'start' | 'process' | 'decision' | 'io' | 'stop'; label: string }>;
  expectedOutput: {
    desc: string;
    inputs: Array<{ name: string; val: string }>;
    outputs: Array<{ name: string; val: string }>;
    registers: string;
    terminalDump: string;
  };
  manualCalculations: {
    title: string;
    steps: Array<{ step: string; detail: string }>;
  };
  resultText: string;
  precautions: string[];
  studentTask: {
    title: string;
    desc: string;
    hint: string;
  };
  applications: Array<{ title: string; desc: string; icon: string }>;
  instructionsUsed?: string[];
}

export const labExperiments: LabExperiment[] = [
  {
    id: 'exp1',
    number: '1A',
    title: 'Multi-precision Addition & Subtraction',
    aim: 'Write an ALP to Perform Addition and Subtraction of Multi precision numbers.',
    directivesUsed: ['DB', 'EQU', 'DUP', 'SEGMENT', 'ENDS'],
    algorithm: [
      'Initialize segment registers and clear carry flag (CLC).',
      'Set SI=NUM1, DI=NUM2, BX=RESULT_ADD and CX=Length.',
      'Add byte-by-byte with carry (ADC AL, [DI]). Store sum at [BX]. Increment pointers.',
      'Save final carry flag into FINAL_CARRY using ADC AL, 0.',
      'Repeat with SBB for Subtraction and save final borrow flag.'
    ],
    standardCode: `DATA_SEG SEGMENT
    NUM1 DB 0FFH,0FEH,0FDH,0FCH
    NUM2 DB 01H,02H,03H,04H
    LENGTH EQU 4
    RESULT_ADD DB 4 DUP (?)
    RESULT_SUB DB 4 DUP (?)
    FINAL_CARRY DB ?
    FINAL_BORROW DB ?
DATA_SEG ENDS
CODE_SEG SEGMENT
    ASSUME CS:CODE_SEG, DS:DATA_SEG
START:
    MOV AX, DATA_SEG
    MOV DS, AX
    LEA SI, NUM1
    LEA DI, NUM2
    LEA BX, RESULT_ADD
    MOV CX, LENGTH
    CLC
ADD_LOOP:
    MOV AL, [SI]
    ADC AL, [DI]
    MOV [BX], AL
    INC SI
    INC DI
    INC BX
    LOOP ADD_LOOP
    MOV AL, 0
    ADC AL, 0
    MOV FINAL_CARRY, AL
    LEA SI, NUM1
    LEA DI, NUM2
    LEA BX, RESULT_SUB
    MOV CX, LENGTH
    CLC
SUB_LOOP:
    MOV AL, [SI]
    SBB AL, [DI]
    MOV [BX], AL
    INC SI
    INC DI
    INC BX
    LOOP SUB_LOOP
    MOV AL, 0
    ADC AL, 0
    MOV FINAL_BORROW, AL
    MOV AH, 4CH
    INT 21H
CODE_SEG ENDS
END START`,
    simplifiedCode: `.MODEL SMALL
.DATA
    NUM1 DB 0FFH,0FEH,0FDH,0FCH
    NUM2 DB 01H,02H,03H,04H
    LENGTH EQU 4
    RESULT_ADD DB 4 DUP (?)
    RESULT_SUB DB 4 DUP (?)
    FINAL_CARRY DB ?
    FINAL_BORROW DB ?
.CODE
MAIN PROC
    MOV AX, @DATA
    MOV DS, AX
    LEA SI, NUM1
    LEA DI, NUM2
    LEA BX, RESULT_ADD
    MOV CX, LENGTH
    CLC
ADD_L:
    MOV AL, [SI]
    ADC AL, [DI]
    MOV [BX], AL
    INC SI
    INC DI
    INC BX
    LOOP ADD_L
    MOV AL, 0
    ADC AL, 0
    MOV FINAL_CARRY, AL
    LEA SI, NUM1
    LEA DI, NUM2
    LEA BX, RESULT_SUB
    MOV CX, LENGTH
    CLC
SUB_L:
    MOV AL, [SI]
    SBB AL, [DI]
    MOV [BX], AL
    INC SI
    INC DI
    INC BX
    LOOP SUB_L
    MOV AL, 0
    ADC AL, 0
    MOV FINAL_BORROW, AL
    MOV AX, 4C00H
    INT 21H
MAIN ENDP
END MAIN`,
    bestPracticeTip: 'Use ADC and SBB to automatically include the carry or borrow from preceding byte operations.'
  },
  {
    id: 'exp2',
    number: '1B',
    title: 'Multiplication & Division of Signed/Unsigned Hexadecimal Numbers',
    aim: 'Write an ALP to Perform Multiplication and division of signed and unsigned Hexadecimal numbers.',
    directivesUsed: ['DW', 'SEGMENT', 'ENDS', 'ASSUME'],
    algorithm: [
      'For multiplication: load AX with multiplier, call MUL/IMUL. Save product (DX:AX).',
      'For division: setup dividend (DX:AX), call DIV/IDIV with 16-bit divisor.',
      'Store quotient in AX and remainder in DX.'
    ],
    standardCode: `DATA_SEG SEGMENT
    VAL1 DW 0A12H
    VAL2 DW 0050H
    S_VAL1 DW -25
    S_VAL2 DW 5
    U_PROD_L DW ?
    U_PROD_H DW ?
    S_PROD_L DW ?
    S_PROD_H DW ?
    U_QUOT DW ?
    U_REM DW ?
    S_QUOT DW ?
    S_REM DW ?
DATA_SEG ENDS
CODE_SEG SEGMENT
    ASSUME CS:CODE_SEG, DS:DATA_SEG
START:
    MOV AX, DATA_SEG
    MOV DS, AX
    ; Unsigned multiplication
    MOV AX, VAL1
    MUL VAL2
    MOV U_PROD_L, AX
    MOV U_PROD_H, DX
    ; Signed multiplication
    MOV AX, S_VAL1
    IMUL S_VAL2
    MOV S_PROD_L, AX
    MOV S_PROD_H, DX
    ; Unsigned division
    MOV AX, VAL1
    XOR DX, DX
    DIV VAL2
    MOV U_QUOT, AX
    MOV U_REM, DX
    ; Signed division
    MOV AX, S_VAL1
    CWD ; Convert Word to Doubleword
    IDIV S_VAL2
    MOV S_QUOT, AX
    MOV S_REM, DX
    MOV AH, 4CH
    INT 21H
CODE_SEG ENDS
END START`,
    simplifiedCode: `.MODEL SMALL
.DATA
    VAL1 DW 0A12H
    VAL2 DW 0050H
    S_VAL1 DW -25
    S_VAL2 DW 5
    U_PROD_L DW ?
    U_PROD_H DW ?
    S_PROD_L DW ?
    S_PROD_H DW ?
    U_QUOT DW ?
    U_REM DW ?
    S_QUOT DW ?
    S_REM DW ?
.CODE
MAIN PROC
    MOV AX, @DATA
    MOV DS, AX
    MOV AX, VAL1
    MUL VAL2
    MOV U_PROD_L, AX
    MOV U_PROD_H, DX
    MOV AX, S_VAL1
    IMUL S_VAL2
    MOV S_PROD_L, AX
    MOV S_PROD_H, DX
    MOV AX, VAL1
    XOR DX, DX
    DIV VAL2
    MOV U_QUOT, AX
    MOV U_REM, DX
    MOV AX, S_VAL1
    CWD
    IDIV S_VAL2
    MOV S_QUOT, AX
    MOV S_REM, DX
    MOV AX, 4C00H
    INT 21H
MAIN ENDP
END MAIN`,
    bestPracticeTip: 'Always use CWD (Convert Word to Doubleword) to sign-extend AX into DX before executing IDIV.'
  },
  {
    id: 'exp_math',
    number: '1C',
    title: 'Square, Cube & Factorial of a Number',
    aim: 'Write an ALP to find square, cube and factorial of a given number.',
    directivesUsed: ['DB', 'DW', 'SEGMENT', 'ENDS', 'ASSUME'],
    algorithm: [
      'Square: Load value into AL, multiply with AL, store in memory.',
      'Cube: Multiply Square result in AX by the original value.',
      'Factorial: Initialize AX=1, CX=value. Loop multiplying AX by CX and decrementing CX.'
    ],
    standardCode: `DATA_SEG SEGMENT
    NUM DB 5
    SQUARE DW ?
    CUBE DW ?
    CUBE_H DW ?
    FACT DW ?
DATA_SEG ENDS
CODE_SEG SEGMENT
    ASSUME CS:CODE_SEG, DS:DATA_SEG
START:
    MOV AX, DATA_SEG
    MOV DS, AX
    ; Square calculation
    MOV AL, NUM
    XOR AH, AH
    MUL AL
    MOV SQUARE, AX
    ; Cube calculation
    MOV BX, AX
    MOV AL, NUM
    XOR AH, AH
    MUL BX
    MOV CUBE, AX
    MOV CUBE_H, DX
    ; Factorial calculation
    MOV CL, NUM
    XOR CH, CH
    MOV AX, 1
FACT_LOOP:
    MUL CX
    LOOP FACT_LOOP
    MOV FACT, AX
    MOV AH, 4CH
    INT 21H
CODE_SEG ENDS
END START`,
    simplifiedCode: `.MODEL SMALL
.DATA
    NUM DB 5
    SQUARE DW ?
    CUBE DW ?
    CUBE_H DW ?
    FACT DW ?
.CODE
MAIN PROC
    MOV AX, @DATA
    MOV DS, AX
    MOV AL, NUM
    XOR AH, AH
    MUL AL
    MOV SQUARE, AX
    MOV BX, AX
    MOV AL, NUM
    XOR AH, AH
    MUL BX
    MOV CUBE, AX
    MOV CUBE_H, DX
    MOV CL, NUM
    XOR CH, CH
    MOV AX, 1
FL:
    MUL CX
    LOOP FL
    MOV FACT, AX
    MOV AX, 4C00H
    INT 21H
MAIN ENDP
END MAIN`,
    bestPracticeTip: 'Ensure CX is not zero before executing the loop to prevent infinite iterations.'
  },
  {
    id: 'exp_bit1',
    number: '2A',
    title: 'Positive or Negative Data Check',
    aim: 'Write an ALP to find the given data is positive or negative.',
    directivesUsed: ['DB', 'SEGMENT', 'ENDS', 'ASSUME'],
    algorithm: [
      'Load data byte into AL.',
      'Test MSB (sign bit) using "TEST AL, 80H" or "ROL AL, 1".',
      'Jump on Sign (JS) indicates negative data; Jump on No Sign (JNS) indicates positive.'
    ],
    standardCode: `DATA_SEG SEGMENT
    DATA_VAL DB -45
    RESULT DB ? ; 0 = Positive, 1 = Negative
DATA_SEG ENDS
CODE_SEG SEGMENT
    ASSUME CS:CODE_SEG, DS:DATA_SEG
START:
    MOV AX, DATA_SEG
    MOV DS, AX
    MOV AL, DATA_VAL
    TEST AL, 80H
    JS IS_NEG
    MOV RESULT, 0
    JMP FINISH
IS_NEG:
    MOV RESULT, 1
FINISH:
    MOV AH, 4CH
    INT 21H
CODE_SEG ENDS
END START`,
    simplifiedCode: `.MODEL SMALL
.DATA
    DATA_VAL DB -45
    RESULT DB ?
.CODE
MAIN PROC
    MOV AX, @DATA
    MOV DS, AX
    MOV AL, DATA_VAL
    TEST AL, 80H
    JS IS_N
    MOV RESULT, 0
    JMP DONE
IS_N:
    MOV RESULT, 1
DONE:
    MOV AX, 4C00H
    INT 21H
MAIN ENDP
END MAIN`,
    bestPracticeTip: 'TEST is non-destructive AND because it only updates flags and leaves the accumulator unchanged.'
  },
  {
    id: 'exp_bit2',
    number: '2B',
    title: 'Odd or Even Data Check',
    aim: 'Write an ALP to find the given data is odd or even.',
    directivesUsed: ['DB', 'SEGMENT', 'ENDS', 'ASSUME'],
    algorithm: [
      'Load data into AL.',
      'Use TEST AL, 01H or SHR AL, 1 to test the LSB.',
      'If LSB is 1, the data is Odd. If LSB is 0, the data is Even.'
    ],
    standardCode: `DATA_SEG SEGMENT
    DATA_VAL DB 47
    RESULT DB ? ; 0 = Even, 1 = Odd
DATA_SEG ENDS
CODE_SEG SEGMENT
    ASSUME CS:CODE_SEG, DS:DATA_SEG
START:
    MOV AX, DATA_SEG
    MOV DS, AX
    MOV AL, DATA_VAL
    TEST AL, 01H
    JZ IS_EVEN
    MOV RESULT, 1
    JMP FINISH
IS_EVEN:
    MOV RESULT, 0
FINISH:
    MOV AH, 4CH
    INT 21H
CODE_SEG ENDS
END START`,
    simplifiedCode: `.MODEL SMALL
.DATA
    DATA_VAL DB 47
    RESULT DB ?
.CODE
MAIN PROC
    MOV AX, @DATA
    MOV DS, AX
    MOV AL, DATA_VAL
    TEST AL, 01H
    JZ IS_E
    MOV RESULT, 1
    JMP DONE
IS_E:
    MOV RESULT, 0
DONE:
    MOV AX, 4C00H
    INT 21H
MAIN ENDP
END MAIN`,
    bestPracticeTip: 'JZ jumps if zero flag is set, which occurs if the last bit is zero (meaning Even).'
  },
  {
    id: 'exp_bit3',
    number: '2C',
    title: 'Count Logical Ones and Zeros',
    aim: 'Write an ALP to find Logical ones and zeros in a given data.',
    directivesUsed: ['DB', 'SEGMENT', 'ENDS', 'ASSUME'],
    algorithm: [
      'Initialize register BL = 0 (One count), BH = 0 (Zero count), and loop counter CX = 8.',
      'Shift AL right into Carry flag (SHR AL, 1).',
      'If Carry is 1, increment BL. Else, increment BH.',
      'Repeat 8 times using LOOP.'
    ],
    standardCode: `DATA_SEG SEGMENT
    DATA_VAL DB 0A5H ; 10100101B (Ones=4, Zeros=4)
    ONES_COUNT DB ?
    ZEROS_COUNT DB ?
DATA_SEG ENDS
CODE_SEG SEGMENT
    ASSUME CS:CODE_SEG, DS:DATA_SEG
START:
    MOV AX, DATA_SEG
    MOV DS, AX
    MOV AL, DATA_VAL
    MOV CX, 8
    XOR BL, BL ; count for ones
    XOR BH, BH ; count for zeros
SHIFT_LOOP:
    SHR AL, 1
    JC ADD_ONE
    INC BH
    JMP NEXT_ITER
ADD_ONE:
    INC BL
NEXT_ITER:
    LOOP SHIFT_LOOP
    MOV ONES_COUNT, BL
    MOV ZEROS_COUNT, BH
    MOV AH, 4CH
    INT 21H
CODE_SEG ENDS
END START`,
    simplifiedCode: `.MODEL SMALL
.DATA
    DATA_VAL DB 0A5H
    ONES_COUNT DB ?
    ZEROS_COUNT DB ?
.CODE
MAIN PROC
    MOV AX, @DATA
    MOV DS, AX
    MOV AL, DATA_VAL
    MOV CX, 8
    XOR BL, BL
    XOR BH, BH
SL:
    SHR AL, 1
    JC AO
    INC BH
    JMP NI
AO:
    INC BL
NI:
    LOOP SL
    MOV ONES_COUNT, BL
    MOV ZEROS_COUNT, BH
    MOV AX, 4C00H
    INT 21H
MAIN ENDP
END MAIN`,
    bestPracticeTip: 'Initializing registers with XOR is faster and smaller in code footprint than using MOV.'
  },
  {
    id: 'exp_arr1',
    number: '3A',
    title: 'Addition & Subtraction of N Numbers',
    aim: 'Write an ALP to find Addition/subtraction of N no ̳s.',
    directivesUsed: ['DB', 'DW', 'SEGMENT', 'ENDS', 'ASSUME'],
    algorithm: [
      'Set CX to array size N.',
      'Initialize AL = 0 for sum or load AL with first number for subtraction.',
      'Loop: Add/Subtract successive elements to/from AL, increment pointer SI.',
      'Store result in memory.'
    ],
    standardCode: `DATA_SEG SEGMENT
    ARRAY DB 10H, 20H, 30H, 40H, 50H
    LEN DW 5
    SUM DB ?
    DIFF DB ?
DATA_SEG ENDS
CODE_SEG SEGMENT
    ASSUME CS:CODE_SEG, DS:DATA_SEG
START:
    MOV AX, DATA_SEG
    MOV DS, AX
    ; Addition of N numbers
    LEA SI, ARRAY
    MOV CX, LEN
    XOR AL, AL
ADD_N_LOOP:
    ADD AL, [SI]
    INC SI
    LOOP ADD_N_LOOP
    MOV SUM, AL
    ; Subtraction of N numbers
    LEA SI, ARRAY
    MOV CX, LEN
    DEC CX
    MOV AL, [SI]
SUB_N_LOOP:
    INC SI
    SUB AL, [SI]
    LOOP SUB_N_LOOP
    MOV DIFF, AL
    MOV AH, 4CH
    INT 21H
CODE_SEG ENDS
END START`,
    simplifiedCode: `.MODEL SMALL
.DATA
    ARRAY DB 10H, 20H, 30H, 40H, 50H
    LEN DW 5
    SUM DB ?
    DIFF DB ?
.CODE
MAIN PROC
    MOV AX, @DATA
    MOV DS, AX
    LEA SI, ARRAY
    MOV CX, LEN
    XOR AL, AL
ANL:
    ADD AL, [SI]
    INC SI
    LOOP ANL
    MOV SUM, AL
    LEA SI, ARRAY
    MOV CX, LEN
    DEC CX
    MOV AL, [SI]
SNL:
    INC SI
    SUB AL, [SI]
    LOOP SNL
    MOV DIFF, AL
    MOV AX, 4C00H
    INT 21H
MAIN ENDP
END MAIN`,
    bestPracticeTip: 'Ensure values do not exceed 8-bit limits to avoid overflow during sum accumulation.'
  },
  {
    id: 'exp3',
    number: '3B',
    title: 'Find Largest & Smallest Number in an Array',
    aim: 'Write an ALP for finding largest/smallest no.',
    directivesUsed: ['DB', 'DW', 'SEGMENT', 'ENDS', 'ASSUME'],
    algorithm: [
      'Initialize CX = N - 1. Load AL with first element of array.',
      'To find largest: compare AL with [SI]. If [SI] is larger, copy [SI] to AL.',
      'To find smallest: compare AH with [SI]. If [SI] is smaller, copy [SI] to AH.',
      'Store results in memory.'
    ],
    standardCode: `DATA_SEG SEGMENT
    ARRAY DB 25H, 4AH, 12H, 8BH, 05H, 92H, 31H
    SIZE_ARR DW 7
    MAX_VAL DB ?
    MIN_VAL DB ?
DATA_SEG ENDS
CODE_SEG SEGMENT
    ASSUME CS:CODE_SEG, DS:DATA_SEG
START:
    MOV AX, DATA_SEG
    MOV DS, AX
    LEA SI, ARRAY
    MOV CX, SIZE_ARR
    DEC CX
    MOV AL, [SI] ; AL stores Max
    MOV AH, [SI] ; AH stores Min
COMP_LOOP:
    INC SI
    ; Max check
    CMP AL, [SI]
    JAE SKIP_MAX
    MOV AL, [SI]
SKIP_MAX:
    ; Min check
    CMP AH, [SI]
    JBE SKIP_MIN
    MOV AH, [SI]
SKIP_MIN:
    LOOP COMP_LOOP
    MOV MAX_VAL, AL
    MOV MIN_VAL, AH
    MOV AH, 4CH
    INT 21H
CODE_SEG ENDS
END START`,
    simplifiedCode: `.MODEL SMALL
.DATA
    ARRAY DB 25H, 4AH, 12H, 8BH, 05H, 92H, 31H
    SIZE_ARR DW 7
    MAX_VAL DB ?
    MIN_VAL DB ?
.CODE
MAIN PROC
    MOV AX, @DATA
    MOV DS, AX
    LEA SI, ARRAY
    MOV CX, SIZE_ARR
    DEC CX
    MOV AL, [SI]
    MOV AH, [SI]
CLP:
    INC SI
    CMP AL, [SI]
    JAE SMX
    MOV AL, [SI]
SMX:
    CMP AH, [SI]
    JBE SMN
    MOV AH, [SI]
SMN:
    LOOP CLP
    MOV MAX_VAL, AL
    MOV MIN_VAL, AH
    MOV AX, 4C00H
    INT 21H
MAIN ENDP
END MAIN`,
    bestPracticeTip: 'Compare signed versus unsigned: Use JAE/JBE for unsigned arrays, and JGE/JLE for signed arrays.'
  },
  {
    id: 'exp4',
    number: '3C',
    title: 'Sort Array in Ascending/Descending Order',
    aim: 'Write an ALP to sort given array in Ascending/descending order.',
    directivesUsed: ['DB', 'DW', 'SEGMENT', 'ENDS', 'ASSUME'],
    algorithm: [
      'Use outer loop (N-1) and inner loop.',
      'Compare adjacent memory bytes [SI] and [SI+1].',
      'For ascending: swap if [SI] > [SI+1]. For descending: swap if [SI] < [SI+1].',
      'Loop through elements and decrement counters.'
    ],
    standardCode: `DATA_SEG SEGMENT
    LIST DB 88H, 11H, 55H, 22H, 44H
    LEN DW 5
DATA_SEG ENDS
CODE_SEG SEGMENT
    ASSUME CS:CODE_SEG, DS:DATA_SEG
START:
    MOV AX, DATA_SEG
    MOV DS, AX
    ; Ascending Sort
    MOV DX, LEN
    DEC DX
OUTER_A:
    MOV CX, DX
    LEA SI, LIST
INNER_A:
    MOV AL, [SI]
    CMP AL, [SI+1]
    JBE SKIP_A
    XCHG AL, [SI+1]
    MOV [SI], AL
SKIP_A:
    INC SI
    LOOP INNER_A
    DEC DX
    JNZ OUTER_A
    MOV AH, 4CH
    INT 21H
CODE_SEG ENDS
END START`,
    simplifiedCode: `.MODEL SMALL
.DATA
    LIST DB 88H, 11H, 55H, 22H, 44H
    LEN DW 5
.CODE
MAIN PROC
    MOV AX, @DATA
    MOV DS, AX
    MOV DX, LEN
    DEC DX
OUT_S:
    MOV CX, DX
    LEA SI, LIST
IN_S:
    MOV AL, [SI]
    CMP AL, [SI+1]
    JBE SK_S
    XCHG AL, [SI+1]
    MOV [SI], AL
SK_S:
    INC SI
    LOOP IN_S
    DEC DX
    JNZ OUT_S
    MOV AX, 4C00H
    INT 21H
MAIN ENDP
END MAIN`,
    bestPracticeTip: 'XCHG allows direct register-memory value swapping, saving instructions and temporary registers.'
  },
  {
    id: 'exp_str1',
    number: '4A',
    title: 'Find String Length',
    aim: 'Write an ALP to find String length.',
    directivesUsed: ['DB', 'DW', 'SEGMENT', 'ENDS', 'ASSUME'],
    algorithm: [
      'Load ES:DI with address of the string.',
      'Initialize AL = "$" or 00H (terminator symbol), CX = FFFFH.',
      'Execute REPNE SCASB to search for terminator.',
      'Calculated length = FFFFH - CX - 1.'
    ],
    standardCode: `DATA_SEG SEGMENT
    STR_VAL DB 'KUPPAM$', 0
    STR_LEN DW ?
DATA_SEG ENDS
CODE_SEG SEGMENT
    ASSUME CS:CODE_SEG, DS:DATA_SEG, ES:DATA_SEG
START:
    MOV AX, DATA_SEG
    MOV DS, AX
    MOV ES, AX
    LEA DI, STR_VAL
    MOV AL, '$'
    MOV CX, 0FFFFH
    CLD
    REPNE SCASB
    NOT CX
    DEC CX
    MOV STR_LEN, CX
    MOV AH, 4CH
    INT 21H
CODE_SEG ENDS
END START`,
    simplifiedCode: `.MODEL SMALL
.DATA
    STR_VAL DB 'KUPPAM$', 0
    STR_LEN DW ?
.CODE
MAIN PROC
    MOV AX, @DATA
    MOV DS, AX
    MOV ES, AX
    LEA DI, STR_VAL
    MOV AL, '$'
    MOV CX, 0FFFFH
    CLD
    REPNE SCASB
    NOT CX
    DEC CX
    MOV STR_LEN, CX
    MOV AX, 4C00H
    INT 21H
MAIN ENDP
END MAIN`,
    bestPracticeTip: 'REPNE SCASB decreases CX on every comparison. By applying NOT CX, you obtain the length.'
  },
  {
    id: 'exp_str2',
    number: '4B',
    title: 'Display the Given String',
    aim: 'Write an ALP for Displaying the given String.',
    directivesUsed: ['DB', 'SEGMENT', 'ENDS', 'ASSUME'],
    algorithm: [
      'Store your message in the data segment ending with "$".',
      'Load DS and then load DX with the offset of the string (LEA DX, STR).',
      'Set AH = 09H (Print String DOS service) and call INT 21H.'
    ],
    standardCode: `DATA_SEG SEGMENT
    MSG DB 'HELLO FROM 8086 MICRO-COURSE$', 13, 10, '$'
DATA_SEG SEGMENT ENDS
CODE_SEG SEGMENT
    ASSUME CS:CODE_SEG, DS:DATA_SEG
START:
    MOV AX, DATA_SEG
    MOV DS, AX
    LEA DX, MSG
    MOV AH, 09H
    INT 21H
    MOV AH, 4CH
    INT 21H
CODE_SEG ENDS
END START`,
    simplifiedCode: `.MODEL SMALL
.DATA
    MSG DB 'HELLO FROM 8086 MICRO-COURSE$', 13, 10, '$'
.CODE
MAIN PROC
    MOV AX, @DATA
    MOV DS, AX
    LEA DX, MSG
    MOV AH, 09H
    INT 21H
    MOV AX, 4C00H
    INT 21H
MAIN ENDP
END MAIN`,
    bestPracticeTip: 'DOS function 09H strictly prints characters until a "$" sign is parsed in memory.'
  },
  {
    id: 'exp_str3',
    number: '4C',
    title: 'Compare Two Strings',
    aim: 'Write an ALP for Comparing two Strings.',
    directivesUsed: ['DB', 'DW', 'SEGMENT', 'ENDS', 'ASSUME'],
    algorithm: [
      'Load SI = String 1 and DI = String 2. Set CX = length of comparison.',
      'Clear Direction Flag (CLD).',
      'Execute REPE CMPSB to compare characters.',
      'Check ZF: if ZF=1, strings are equal. Else, strings are unequal.'
    ],
    standardCode: `DATA_SEG SEGMENT
    STR1 DB 'HELLO'
    STR2 DB 'HELLO'
    LEN DW 5
    RESULT DB ? ; 0 = Equal, 1 = Unequal
DATA_SEG ENDS
CODE_SEG SEGMENT
    ASSUME CS:CODE_SEG, DS:DATA_SEG, ES:DATA_SEG
START:
    MOV AX, DATA_SEG
    MOV DS, AX
    MOV ES, AX
    LEA SI, STR1
    LEA DI, STR2
    MOV CX, LEN
    CLD
    REPE CMPSB
    JZ EQUAL
    MOV RESULT, 1
    JMP FINISH
EQUAL:
    MOV RESULT, 0
FINISH:
    MOV AH, 4CH
    INT 21H
CODE_SEG ENDS
END START`,
    simplifiedCode: `.MODEL SMALL
.DATA
    STR1 DB 'HELLO'
    STR2 DB 'HELLO'
    LEN DW 5
    RESULT DB ?
.CODE
MAIN PROC
    MOV AX, @DATA
    MOV DS, AX
    MOV ES, AX
    LEA SI, STR1
    LEA DI, STR2
    MOV CX, LEN
    CLD
    REPE CMPSB
    JZ EQ
    MOV RESULT, 1
    JMP DONE
EQ:
    MOV RESULT, 0
DONE:
    MOV AX, 4C00H
    INT 21H
MAIN ENDP
END MAIN`,
    bestPracticeTip: 'Ensure Extra Segment (ES) is initialized properly as CMPSB references ES:DI.'
  },
  {
    id: 'exp_str4',
    number: '4D',
    title: 'String Reversal & Palindrome Check',
    aim: 'Write an ALP to reverse String and Checking for palindrome.',
    directivesUsed: ['DB', 'DW', 'DUP', 'SEGMENT', 'ENDS'],
    algorithm: [
      'Copy the string backwards from the end to a separate memory buffer.',
      'Compare the original string and the reversed buffer byte-by-byte using REPE CMPSB.',
      'If equal, the string is a palindrome.'
    ],
    standardCode: `DATA_SEG SEGMENT
    STR1 DB 'MADAM'
    LEN DW 5
    REV_STR DB 5 DUP (?)
    RESULT DB ? ; 0 = Palindrome, 1 = Not Palindrome
DATA_SEG ENDS
CODE_SEG SEGMENT
    ASSUME CS:CODE_SEG, DS:DATA_SEG, ES:DATA_SEG
START:
    MOV AX, DATA_SEG
    MOV DS, AX
    MOV ES, AX
    ; Reverse the string
    LEA SI, STR1
    ADD SI, LEN
    DEC SI ; point to end
    LEA DI, REV_STR
    MOV CX, LEN
REV_LOOP:
    MOV AL, [SI]
    MOV [DI], AL
    DEC SI
    INC DI
    LOOP REV_LOOP
    ; Compare original and reversed
    LEA SI, STR1
    LEA DI, REV_STR
    MOV CX, LEN
    CLD
    REPE CMPSB
    JZ IS_PALIN
    MOV RESULT, 1
    JMP FINISH
IS_PALIN:
    MOV RESULT, 0
FINISH:
    MOV AH, 4CH
    INT 21H
CODE_SEG ENDS
END START`,
    simplifiedCode: `.MODEL SMALL
.DATA
    STR1 DB 'MADAM'
    LEN DW 5
    REV_STR DB 5 DUP (?)
    RESULT DB ?
.CODE
MAIN PROC
    MOV AX, @DATA
    MOV DS, AX
    MOV ES, AX
    LEA SI, STR1
    ADD SI, LEN
    DEC SI
    LEA DI, REV_STR
    MOV CX, LEN
RLP:
    MOV AL, [SI]
    MOV [DI], AL
    DEC SI
    INC DI
    LOOP RLP
    LEA SI, STR1
    LEA DI, REV_STR
    MOV CX, LEN
    CLD
    REPE CMPSB
    JZ ISP
    MOV RESULT, 1
    JMP DONE
ISP:
    MOV RESULT, 0
DONE:
    MOV AX, 4C00H
    INT 21H
MAIN ENDP
END MAIN`,
    bestPracticeTip: 'Always decrement source and increment destination pointers in your manual copy loop to achieve reversal.'
  },
  {
    id: 'exp5',
    number: '5',
    title: 'Block Data Transfer (Memory Copy)',
    aim: 'Write an assembly program to copy a block of 10 data bytes from a source memory segment offset to a destination segment offset.',
    directivesUsed: ['DB', 'DUP', 'SEGMENT', 'ENDS', 'ASSUME'],
    algorithm: [
      'Initialize DS with source and ES with destination segment.',
      'Load SI = Source block, DI = Destination block, and CX = block size (10).',
      'Execute CLD (auto-increment) and REP MOVSB (copy bytes loop).'
    ],
    standardCode: `DATA_SEG SEGMENT
    SRC_BLOCK DB 10H, 20H, 30H, 40H, 50H, 60H, 70H, 80H, 90H, 99H
    DEST_BLOCK DB 10 DUP(0)
DATA_SEG ENDS
CODE_SEG SEGMENT
    ASSUME CS:CODE_SEG, DS:DATA_SEG, ES:DATA_SEG
START:
    MOV AX, DATA_SEG
    MOV DS, AX
    MOV ES, AX
    LEA SI, SRC_BLOCK
    LEA DI, DEST_BLOCK
    MOV CX, 10
    CLD
    REP MOVSB
    MOV AH, 4CH
    INT 21H
CODE_SEG ENDS
END START`,
    simplifiedCode: `.MODEL SMALL
.DATA
    SRC_BLOCK DB 10H, 20H, 30H, 40H, 50H, 60H, 70H, 80H, 90H, 99H
    DEST_BLOCK DB 10 DUP(0)
.CODE
MAIN PROC
    MOV AX, @DATA
    MOV DS, AX
    MOV ES, AX
    LEA SI, SRC_BLOCK
    LEA DI, DEST_BLOCK
    MOV CX, 10
    CLD
    REP MOVSB
    MOV AX, 4C00H
    INT 21H
MAIN ENDP
END MAIN`,
    bestPracticeTip: 'REP MOVSB is extremely efficient because the hardware handles index increments and loop counting in a single instruction.'
  }
];

export const labManualPagesData: Record<string, LabManualPage> = {
  exp1: {
    number: '1A',
    title: 'Multi-precision Addition & Subtraction',
    aim: 'To perform addition and subtraction of multi-precision numbers exceeding 16 bits in 8086 assembly.',
    objectives: ['Master multi-precision ALU operations.', 'Propagate carries and borrows correctly.'],
    outcomes: ['Understand carry/borrow propagation (ADC/SBB).', 'Process multi-byte variables.'],
    components: [{ name: 'MASM', spec: 'v6.11', purpose: 'Assembly compiler' }, { name: 'DOSBox', spec: 'v0.74', purpose: 'DOS emulation environment' }],
    procedureSteps: ['Open workspace.', 'Observe NUM1/NUM2.', 'Execute ADC/SBB.', 'Verify sums and carry.'],
    theoryText: 'Unsigned 32-bit operands span four contiguous bytes in physical memory, arranged in Little-Endian order. Loops add/subtract byte-by-byte with carry/borrow propagation.',
    theoryDiagramType: 'carry-ripple',
    algorithmSteps: [
      'Initialize segment Registers (DS = @DATA) to allow pointer addressing.',
      'Set index registers: SI points to NUM1, DI points to NUM2, BX points to RESULT_ADD.',
      'Set CX loop counter to array length (4).',
      'Execute CLC (Clear Carry Flag) to start first addition with CF = 0.',
      'Loop ADD: Load AL with byte [SI], perform addition with carry (ADC AL, [DI]), and store sum AL into [BX].',
      'Increment pointers: SI++, DI++, BX++.',
      'Check loop counter: Decrement CX. If CX > 0, jump back to ADD loop; else continue.',
      'Save final Carry status (CF) by performing ADC AL, 0 and saving AL in memory.',
      'Reset pointers for Subtraction, execute CLC, and perform SBB AL, [DI] loop.',
      'Save final Borrow status (CF) from subtraction into memory variable.'
    ],
    flowchartSteps: [
      { type: 'start', label: 'START' },
      { type: 'process', label: 'Initialize segment registers (DS = @DATA)' },
      { type: 'process', label: 'Set pointers: SI=&NUM1, DI=&NUM2, BX=&RESULT_ADD, CX=4' },
      { type: 'process', label: 'Clear Carry Flag (CF = 0) using CLC' },
      { type: 'process', label: 'AL = [SI]; AL = AL + [DI] + CF; [BX] = AL' },
      { type: 'process', label: 'Increment pointers: SI++, DI++, BX++' },
      { type: 'decision', label: 'Is Loop CX = 0?' },
      { type: 'process', label: 'Save final Carry (CF) into memory FINAL_CARRY' },
      { type: 'process', label: 'Reset pointers, clear CF, run Subtraction SBB Loop' },
      { type: 'process', label: 'Save final Borrow into memory FINAL_BORROW' },
      { type: 'stop', label: 'STOP (Exit via INT 21H Service 4CH)' }
    ],
    expectedOutput: {
      desc: 'NUM1 = FCDDFEFFH, NUM2 = 04030201H',
      inputs: [{ name: 'NUM1', val: 'FF FE FD FC' }, { name: 'NUM2', val: '01 02 03 04' }],
      outputs: [{ name: 'ADD_RESULT', val: '00 01 01 01' }, { name: 'SUB_RESULT', val: 'EE FC FA F8' }],
      registers: 'AX=4C00H BX=0004H CX=0000H',
      terminalDump: '-g\nAX=4C00 BX=0004 CX=0000 DS=1000'
    },
    manualCalculations: {
      title: '32-bit Addition & Subtraction Verification',
      steps: [{ step: 'Byte 0 Addition', detail: 'FFH + 01H = 00H with Carry=1.' }, { step: 'Byte 1 Addition', detail: 'FEH + 02H + Carry(1) = 01H with Carry=1.' }]
    },
    resultText: '32-bit addition and subtraction programs were successfully executed with carry/borrow propagation.',
    precautions: ['Always clear carry flag (CLC) before commencing multi-precision arithmetic.'],
    studentTask: {
      title: '64-Bit Implementation',
      desc: 'Modify the multi-byte code to perform 64-bit addition on an 8-byte input block.',
      hint: 'Double the loop length to 8 and adjust result buffers to 8 bytes.'
    },
    applications: [{ title: 'Financial Math', desc: 'Used for large-integer accounting values.', icon: 'cpu' }]
  },
  exp2: {
    number: '1B',
    title: 'Multiplication & Division of Signed/Unsigned Hexadecimal Numbers',
    aim: 'To perform signed and unsigned 16-bit multiplication and division operations on 8086.',
    objectives: ['Grasp signed vs unsigned ALU operations.', 'Utilize doubleword register pairs DX:AX.'],
    outcomes: ['Understand MUL vs IMUL.', 'Handle 32-bit results and quotients.'],
    components: [{ name: 'MASM', spec: 'v6.11', purpose: 'Assembly compiler' }, { name: 'DOSBox', spec: 'v0.74', purpose: 'DOS emulation environment' }],
    procedureSteps: ['Load variables.', 'Perform MUL & IMUL.', 'Trace quotient and remainder with DIV & IDIV.', 'Check DX and AX registers.'],
    theoryText: 'Unsigned arithmetic uses MUL and DIV. For 16-bit MUL, product is stored in DX:AX. For DIV, DX:AX is divided by operand, placing Quotient in AX and Remainder in DX (DX must be zeroed first). Signed arithmetic uses IMUL and IDIV with 2\'s complement representation. For signed division, 16-bit AX is sign-extended into DX using CWD (Convert Word to Doubleword) before executing IDIV to preserve sign integrity and prevent Divide Overflow / Type 0 interrupt errors.',
    theoryDiagramType: 'register-pair',
    algorithmSteps: [
      'Initialize Segment Registers (DS = @DATA).',
      'Unsigned Multiplication: Load VAL1 into AX, run MUL VAL2. Store 32-bit product DX:AX in memory (U_PROD_L and U_PROD_H).',
      'Signed Multiplication: Load S_VAL1 into AX, run IMUL S_VAL2. Store signed 32-bit product DX:AX in S_PROD.',
      'Unsigned Division: Load VAL1 into AX, clear DX (XOR DX, DX) to prevent overflow, run DIV VAL2. Store quotient (AX) and remainder (DX).',
      'Signed Division: Load S_VAL1 into AX, execute CWD (Convert Word to Doubleword) to sign-extend AX into DX:AX, run IDIV S_VAL2. Store quotient (AX) and remainder (DX).'
    ],
    flowchartSteps: [
      { type: 'start', label: 'START' },
      { type: 'process', label: 'Initialize Segment Registers (DS = AX)' },
      { type: 'process', label: 'Unsigned Mul: AX=VAL1, MUL VAL2 → Product in DX:AX' },
      { type: 'process', label: 'Save Unsigned Product to memory U_PROD' },
      { type: 'process', label: 'Signed Mul: AX=S_VAL1, IMUL S_VAL2 → Product in DX:AX' },
      { type: 'process', label: 'Save Signed Product to memory S_PROD' },
      { type: 'process', label: 'Unsigned Div: AX=VAL1, Clear DX, DIV VAL2' },
      { type: 'process', label: 'Save Unsigned Quotient (AX) & Remainder (DX)' },
      { type: 'process', label: 'Signed Div: AX=S_VAL1, CWD (Sign-extend to DX), IDIV S_VAL2' },
      { type: 'process', label: 'Save Signed Quotient (AX) & Remainder (DX)' },
      { type: 'stop', label: 'STOP (Exit via INT 21H Service 4CH)' }
    ],
    expectedOutput: {
      desc: 'Inputs: VAL1 = 0A12H, VAL2 = 0050H. S_VAL1 = -25, S_VAL2 = 5.',
      inputs: [{ name: 'VAL1', val: '0A12H' }, { name: 'VAL2', val: '0050H' }],
      outputs: [{ name: 'U_PROD', val: '003289A0H' }, { name: 'S_QUOT', val: '-5 (FFFBH)' }],
      registers: 'AX=FFFBH DX=0000H',
      terminalDump: 'AX=FFFBH DX=0000 SI=0000 DI=0000'
    },
    manualCalculations: {
      title: 'MUL/DIV Verification',
      steps: [{ step: 'Unsigned Multiplication', detail: '0A12H (2578) * 0050H (80) = 206240 = 003289A0H.' }]
    },
    resultText: 'Signed and unsigned 16-bit multiplication and division algorithms were successfully tested.',
    precautions: ['Always clear DX or use CWD before executing division to prevent Division Overflow.'],
    studentTask: {
      title: 'Signed Array Product',
      desc: 'Multiply an array of signed bytes and store the product in a doubleword array.',
      hint: 'Loop through array, sign-extend AL to AX using CBW, then use IMUL.'
    },
    applications: [{ title: 'DSP Filters', desc: 'Fixed-point signal scaling and multiplication loops.', icon: 'cpu' }]
  },
  exp_math: {
    number: '1C',
    title: 'Square, Cube & Factorial of a Number',
    aim: 'Write an ALP to find square, cube and factorial of a given number.',
    objectives: ['Implement recursive algorithms.', 'Learn accumulator looping techniques.'],
    outcomes: ['Develop mathematical computation formulas.', 'Understand cascading multiplication.'],
    components: [{ name: 'MASM', spec: 'v6.11', purpose: 'Compiler' }, { name: 'DOSBox', spec: 'v0.74', purpose: 'DOS emulation' }],
    procedureSteps: ['Input number N.', 'Multiply N by itself for square.', 'Multiply square by N for cube.', 'Execute loop to compute factorial.'],
    theoryText: 'Square (N²) is computed via MUL BX (AX × BX = N × N). Cube (N³) is obtained by multiplying Square by N (MUL BX = N² × N). Factorial (N! = N × (N-1) × ... × 1) uses iterative accumulator multiplication with CX counter (AX = 1, CX = N, loop executing MUL CX). 16-bit AX registers support factorials up to 8! (40,320 / 9D80H); higher values overflow into DX:AX.',
    theoryDiagramType: 'register-pair',
    algorithmSteps: [
      'Initialize Segment Registers.',
      'Load the input number N into registers AX and BX (AX = N, BX = N).',
      'Square Calculation: Run MUL BX. This multiplies AX by BX (N * N) and stores the result in AX. Save the square into the SQUARE memory variable.',
      'Cube Calculation: Multiply the computed Square in AX by N in BX (MUL BX). Save the resulting AX into CUBE memory.',
      'Factorial Initialization: Clear/Set AX to 01H (accumulator) and set CX to N (loop counter).',
      'Factorial Loop: Perform MUL CX (AX = AX * CX). Decrement CX automatically using the LOOP instruction, which repeats until CX = 0.',
      'Save Factorial Result: Store final AX accumulator into FACT memory variable, then exit cleanly.'
    ],
    flowchartSteps: [
      { type: 'start', label: 'START' },
      { type: 'process', label: 'Load Input Number N into AX & BX' },
      { type: 'process', label: 'AX = AX * BX (N * N), Save to SQUARE' },
      { type: 'process', label: 'AX = AX * BX (Square * N), Save to CUBE' },
      { type: 'process', label: 'Init Factorial Accumulator: AX = 1, Loop Counter: CX = N' },
      { type: 'process', label: 'AX = AX * CX' },
      { type: 'decision', label: 'Is Decr CX = 0?' },
      { type: 'process', label: 'Save final Factorial from AX to FACT' },
      { type: 'stop', label: 'STOP (Exit)' }
    ],
    expectedOutput: {
      desc: 'N = 5',
      inputs: [{ name: 'NUM', val: '05H' }],
      outputs: [{ name: 'SQUARE', val: '0019H (25)' }, { name: 'CUBE', val: '007DH (125)' }, { name: 'FACT', val: '0078H (120)' }],
      registers: 'AX=0078H CX=0000H',
      terminalDump: 'SQUARE=0019 CUBE=007D FACT=0078'
    },
    manualCalculations: {
      title: 'Factorial Manual Calculation',
      steps: [{ step: 'Square N=5', detail: '5 * 5 = 25 (19H).' }, { step: 'Factorial N=5', detail: '5 * 4 * 3 * 2 * 1 = 120 (78H).' }]
    },
    resultText: 'The square, cube, and factorial algorithms were verified successfully.',
    precautions: ['Take care of overflow; 16-bit registers can compute factorials only up to 8! (40320).'],
    studentTask: {
      title: 'Factorial Overflow Handler',
      desc: 'Modify the factorial routine to store products larger than 16-bits.',
      hint: 'Handle the upper 16-bit carry using DX in consecutive multiplications.'
    },
    applications: [{ title: 'Scientific Math', desc: 'Statistical combinatorics and physics formulas.', icon: 'cpu' }]
  },
  exp_bit1: {
    number: '2A',
    title: 'Positive or Negative Data Check',
    aim: 'Write an ALP to find the given data is positive or negative.',
    objectives: ['Master conditional branching.', 'Understand status flag registers.'],
    outcomes: ['Query the MSB sign bit.', 'Understand sign-based branching.'],
    components: [{ name: 'MASM', spec: 'v6.11', purpose: 'Compiler' }],
    procedureSteps: ['Load test byte.', 'TEST with 80H.', 'Jump if negative (JS).', 'Store flag in memory.'],
    theoryText: 'In signed notation, the MSB (bit 7 for bytes, bit 15 for words) represents the sign. A value of 1 represents negative, 0 positive.',
    theoryDiagramType: 'pointer-scan',
    algorithmSteps: [
      'Initialize Segment Registers (DS = @DATA).',
      'Load the 8-bit signed test data into register AL.',
      'Execute TEST AL, 80H to logically AND AL with 10000000B. This isolates Bit 7 (the sign bit) and updates the Sign Flag (SF) without changing AL.',
      'Check status flags: If Sign Flag is set (SF = 1, meaning MSB is 1), the number is Negative. If SF = 0, the number is Positive.',
      'Use JS (Jump on Sign) to branch. If JS is taken, jump to NEGATIVE_HANDLER and set BL = 01H. If JS is not taken, set BL = 00H (Positive).',
      'Store register BL (sign result flag) in memory variable RESULT, then exit.'
    ],
    flowchartSteps: [
      { type: 'start', label: 'START' },
      { type: 'process', label: 'Load data value into register AL' },
      { type: 'process', label: 'Run bitwise test: TEST AL, 80H (isolates sign bit 7)' },
      { type: 'decision', label: 'Is MSB (Bit 7) Set to 1?' },
      { type: 'process', label: 'Set BL = 00H (Positive Flag)' },
      { type: 'process', label: 'Set BL = 01H (Negative Flag)' },
      { type: 'process', label: 'Store BL value in variable RESULT' },
      { type: 'stop', label: 'STOP (Exit)' }
    ],
    expectedOutput: {
      desc: 'Input: -45 (0D3H)',
      inputs: [{ name: 'DATA_VAL', val: 'D3H' }],
      outputs: [{ name: 'RESULT', val: '01H (Negative)' }],
      registers: 'AX=00D3H FLAGS=SF',
      terminalDump: 'SF flag set. RESULT=01'
    },
    manualCalculations: {
      title: 'Sign Bit Inspection',
      steps: [{ step: 'Inspect MSB of D3H', detail: 'D3H = 11010011B. MSB is 1, so the number is negative.' }]
    },
    resultText: 'Successfully detected negative and positive byte values.',
    precautions: ['TEST does not change register values, unlike AND.'],
    studentTask: {
      title: 'Array Sign Counter',
      desc: 'Count positive and negative items in an array of 20 elements.',
      hint: 'Loop through array, execute TEST and maintain negative/positive counters in registers.'
    },
    applications: [{ title: 'Sensor Input', desc: 'Filter negative pressure or temperature bounds.', icon: 'thermometer' }]
  },
  exp_bit2: {
    number: '2B',
    title: 'Odd or Even Data Check',
    aim: 'Write an ALP to find the given data is odd or even.',
    objectives: ['Examine parity and LSB.', 'Create decision routines.'],
    outcomes: ['Isolate LSB.', 'Branch on even/odd outcomes.'],
    components: [{ name: 'MASM', spec: 'v6.11', purpose: 'Compiler' }],
    procedureSteps: ['Load number.', 'TEST with 01H.', 'JZ if even.', 'Store odd/even flag.'],
    theoryText: 'An integer is odd if its LSB is 1, and even if LSB is 0. Shifting or masking bit 0 determines parity.',
    theoryDiagramType: 'pointer-scan',
    algorithmSteps: [
      'Initialize Segment Registers (DS = @DATA).',
      'Load the 8-bit test byte into register AL.',
      'Execute TEST AL, 01H to perform a bitwise AND with 00000001B. This isolates Bit 0 (Least Significant Bit, LSB) and updates the Zero Flag (ZF).',
      'Analyze the Zero Flag (ZF): If LSB is 0, the result is 00H and ZF is set to 1 (Even). If LSB is 1, the result is 01H and ZF is set to 0 (Odd).',
      'Use JZ (Jump on Zero) to branch. If ZF = 1, jump to EVEN_HANDLER and load BL = 00H. If ZF = 0, load BL = 01H (Odd Flag).',
      'Store register BL into memory variable RESULT, then exit.'
    ],
    flowchartSteps: [
      { type: 'start', label: 'START' },
      { type: 'process', label: 'Load data value into register AL' },
      { type: 'process', label: 'Run bitwise test: TEST AL, 01H (isolates LSB bit 0)' },
      { type: 'decision', label: 'Is LSB (Bit 0) Equal to 1?' },
      { type: 'process', label: 'Set BL = 00H (Even Flag, since Bit 0 = 0)' },
      { type: 'process', label: 'Set BL = 01H (Odd Flag, since Bit 0 = 1)' },
      { type: 'process', label: 'Store BL value in variable RESULT' },
      { type: 'stop', label: 'STOP (Exit)' }
    ],
    expectedOutput: {
      desc: 'Input: 47 (2FH)',
      inputs: [{ name: 'DATA_VAL', val: '2FH' }],
      outputs: [{ name: 'RESULT', val: '01H (Odd)' }],
      registers: 'AX=002FH FLAGS=ZF=0',
      terminalDump: 'LSB is 1. RESULT=01'
    },
    manualCalculations: {
      title: 'LSB Inspection',
      steps: [{ step: 'Analyze 2FH', detail: '2FH = 00101111B. LSB is 1, which implies it is Odd.' }]
    },
    resultText: 'Successfully computed parity check for even/odd values.',
    precautions: ['Do not confuse with the hardware PF (Parity Flag) which checks total number of 1-bits.'],
    studentTask: {
      title: 'Parity Word Filter',
      desc: 'Check parity of 16-bit words inside an input sequence.',
      hint: 'Use TEST AX, 0001H to mask 16-bit numbers.'
    },
    applications: [{ title: 'Data Comm', desc: 'Validating parity errors in transmission packets.', icon: 'hard-drive' }]
  },
  exp_bit3: {
    number: '2C',
    title: 'Count Logical Ones and Zeros',
    aim: 'Write an ALP to find Logical ones and zeros in a given data.',
    objectives: ['Master bit-level registers.', 'Design a shift-counter loop.'],
    outcomes: ['Bit manipulation skills.', 'Grasp shift and loop combinations.'],
    components: [{ name: 'MASM', spec: 'v6.11', purpose: 'Compiler' }],
    procedureSteps: ['Load test byte.', 'Set loop count CX=8.', 'SHR AL, 1 and query Carry Flag.', 'Increment respective registers.'],
    theoryText: 'By shifting right 8 times, each bit enters the carry flag. We increment BL on carry and BH on no carry.',
    theoryDiagramType: 'pointer-scan',
    algorithmSteps: [
      'Initialize Segment Registers (DS = @DATA).',
      'Load the 8-bit test data into register AL.',
      'Initialize registers: Set loop counter CX = 8 (for 8 bits), clear BL = 0 (Ones counter), and clear BH = 0 (Zeros counter).',
      'Shift Operation: Perform logical Shift Right (SHR AL, 1). The Least Significant Bit (LSB) of AL is shifted out and enters the Carry Flag (CF).',
      'Conditional Check: Use JC (Jump if Carry). If CF = 1, jump to INC_ONES and execute INC BL. If CF = 0, execute INC BH (zeros) and bypass the ones counter.',
      'Decrement loop counter CX: Execute LOOP instruction. If CX is not 0, jump back to the Shift Operation; otherwise continue.',
      'Store counters: Move BL (Ones count) to memory location ONES, and BH (Zeros count) to memory location ZEROS, then exit.'
    ],
    flowchartSteps: [
      { type: 'start', label: 'START' },
      { type: 'process', label: 'Load AL with data byte; Clear counters: BL=0 (Ones), BH=0 (Zeros); Set CX=8' },
      { type: 'process', label: 'Shift AL right by 1 bit: SHR AL, 1 (moves LSB into Carry Flag CF)' },
      { type: 'decision', label: 'Is Carry Flag CF Set to 1?' },
      { type: 'process', label: 'Increment Zeros Counter: INC BH' },
      { type: 'process', label: 'Increment Ones Counter: INC BL' },
      { type: 'decision', label: 'Is Loop CX = 0?' },
      { type: 'process', label: 'Store BL (Ones) and BH (Zeros) into memory' },
      { type: 'stop', label: 'STOP (Exit)' }
    ],
    expectedOutput: {
      desc: 'Input: 0A5H (10100101B)',
      inputs: [{ name: 'DATA_VAL', val: 'A5H' }],
      outputs: [{ name: 'ONES', val: '04H' }, { name: 'ZEROS', val: '04H' }],
      registers: 'BL=0004H BH=0004H',
      terminalDump: 'BL=04 BH=04 CX=00'
    },
    manualCalculations: {
      title: 'Ones/Zeros Analysis',
      steps: [{ step: 'Count Bits of A5H', detail: 'A5H = 10100101B. Number of 1s = 4. Number of 0s = 4.' }]
    },
    resultText: 'The bit-counting program successfully extracted ones and zeros count.',
    precautions: ['The accumulator AL will be empty (00H) after 8 bitwise shifts.'],
    studentTask: {
      title: 'Doubleword Ones Count',
      desc: 'Perform ones/zeros counting on a 32-bit register doubleword.',
      hint: 'Adjust CX to 32 and use a 32-bit register or loop twice for DX and AX.'
    },
    applications: [{ title: 'Cryptography', desc: 'Calculating hash parity weight vectors.', icon: 'key' }]
  },
  exp_arr1: {
    number: '3A',
    title: 'Addition & Subtraction of N Numbers',
    aim: 'Write an ALP to find Addition/subtraction of N no ̳s.',
    objectives: ['Understand data array traversals.', 'Use index accumulators.'],
    outcomes: ['Implement vector summation.', 'Handle subtraction of series.'],
    components: [{ name: 'MASM', spec: 'v6.11', purpose: 'Compiler' }],
    procedureSteps: ['Point SI to array.', 'Loop CX=N times.', 'Accumulate AL += [SI].', 'Repeat with SUB for subtraction.'],
    theoryText: 'Traversing an array involves looping N times, loading successive offsets into SI, and performing ALU accumulation.',
    theoryDiagramType: 'pointer-scan',
    algorithmSteps: [
      'Initialize Segment Registers (DS = @DATA).',
      'Point SI to the starting address of the data array (LEA SI, ARRAY).',
      'Set loop counter CX to the array length N (e.g., 5). Clear the accumulator AL to 00H.',
      'Addition Loop: Add the current byte element pointed to by SI to the AL accumulator (ADD AL, [SI]).',
      'Increment the array pointer SI (INC SI) to transition to the next element.',
      'Check loop state: Decrement CX. If CX > 0, repeat the Addition Loop; otherwise store the final AL sum into memory variable SUM.',
      'Reinitialize: Reload the array pointer SI, reload loop counter CX, load AL with the first array element, then perform sequential array subtraction (SUB AL, [SI]) and store result in DIFF.'
    ],
    flowchartSteps: [
      { type: 'start', label: 'START' },
      { type: 'process', label: 'Point SI to array start; Set CX=N (5); Clear Accumulator AL=0' },
      { type: 'process', label: 'Add element to accumulator: ADD AL, [SI]' },
      { type: 'process', label: 'Increment array pointer: INC SI' },
      { type: 'decision', label: 'Is Loop CX = 0?' },
      { type: 'process', label: 'Store AL (Sum) in variable SUM; Reinit for Subtraction' },
      { type: 'stop', label: 'STOP (Exit)' }
    ],
    expectedOutput: {
      desc: 'Array: 10H, 20H, 30H, 40H, 50H (Length=5)',
      inputs: [{ name: 'ARRAY', val: '10H, 20H, 30H, 40H, 50H' }],
      outputs: [{ name: 'SUM', val: '0F0H' }, { name: 'DIFF', val: 'E0H' }],
      registers: 'AX=00F0H CX=0000H',
      terminalDump: 'SUM=F0 DIFF=E0'
    },
    manualCalculations: {
      title: 'Summation Verification',
      steps: [{ step: 'Addition Sum', detail: '10H + 20H + 30H + 40H + 50H = 0F0H.' }]
    },
    resultText: 'Addition and subtraction of N numbers computed successfully.',
    precautions: ['Always set index pointer SI to start of array before commencing loops.'],
    studentTask: {
      title: 'Average Calculator',
      desc: 'Determine the average value of N bytes inside the array.',
      hint: 'Obtain the sum, then use DIV command to divide by N (LEN).'
    },
    applications: [{ title: 'Sensor Averaging', desc: 'Smoothing fluctuating signal readings.', icon: 'thermometer' }]
  },
  exp3: {
    number: '3B',
    title: 'Find Largest & Smallest Number in an Array',
    aim: 'Write an ALP for finding largest/smallest no.',
    objectives: ['Master array pointers.', 'Use comparative conditional branches.'],
    outcomes: ['Extract extrema from arrays.', 'Understand index increments.'],
    components: [{ name: 'MASM', spec: 'v6.11', purpose: 'Compiler' }],
    procedureSteps: ['LEA SI, ARRAY.', 'Set candidate Max/Min = [SI].', 'Compare AL with current [SI+1].', 'Update extrema registers on conditions.'],
    theoryText: 'An array of N bytes is searched. AL stores Max, AH stores Min. LOOP instruction handles counter decrements.',
    theoryDiagramType: 'pointer-scan',
    algorithmSteps: [
      'Initialize Segment Registers (DS = @DATA).',
      'Point SI index register to start of array (LEA SI, ARRAY).',
      'Load the first element into AL (Max candidate) and AH (Min candidate) (AL = [SI], AH = [SI]).',
      'Initialize loop counter CX = N - 1 (elements left to examine).',
      'Scan Loop: Increment SI pointer (SI++) to target next element.',
      'Max Check: Compare current element [SI] with AL. If [SI] > AL (using JAE/JA), copy [SI] to AL (AL = [SI]).',
      'Min Check: Compare current element [SI] with AH. If [SI] < AH (using JBE/JB), copy [SI] to AH (AH = [SI]).',
      'Decrement counter and loop: Execute LOOP instruction. If CX > 0, repeat Scan Loop.',
      'Save Results: Store AL in MAX_VAL and AH in MIN_VAL memory offsets, then exit cleanly.'
    ],
    flowchartSteps: [
      { type: 'start', label: 'START' },
      { type: 'process', label: 'Point SI to array start; AL=[SI] (Max), AH=[SI] (Min); Set CX=N-1' },
      { type: 'process', label: 'Increment pointer SI++ to point to next element' },
      { type: 'decision', label: 'Is current [SI] > AL (Max)?' },
      { type: 'process', label: 'Update Max candidate: AL = [SI]' },
      { type: 'decision', label: 'Is current [SI] < AH (Min)?' },
      { type: 'process', label: 'Update Min candidate: AH = [SI]' },
      { type: 'decision', label: 'Is Loop CX = 0?' },
      { type: 'process', label: 'Save AL (Largest) and AH (Smallest) to memory' },
      { type: 'stop', label: 'STOP (Exit)' }
    ],
    expectedOutput: {
      desc: 'Array: 25H, 4AH, 12H, 8BH, 05H, 92H, 31H',
      inputs: [{ name: 'ARRAY', val: '25H, 4AH, 12H, 8BH, 05H, 92H, 31H' }],
      outputs: [{ name: 'MAX_VAL', val: '92H' }, { name: 'MIN_VAL', val: '05H' }],
      registers: 'AX=9205H CX=0000H',
      terminalDump: 'MAX=92 MIN=05'
    },
    manualCalculations: {
      title: 'Min/Max Verification',
      steps: [{ step: 'Manual Scan', detail: 'Elements scanned. Max = 92H. Min = 05H.' }]
    },
    resultText: 'The largest and smallest array elements were correctly identified.',
    precautions: ['For unsigned arrays, JAE and JBE are appropriate. Do not use JG/JL.'],
    studentTask: {
      title: 'Indexed Target Finder',
      desc: 'Find the index (0-based offset) of the maximum array item.',
      hint: 'Store the current CX index into another register whenever Max is updated.'
    },
    applications: [{ title: 'Peak Detection', desc: 'Signal peak analyses in instrumentation.', icon: 'cpu' }]
  },
  exp4: {
    number: '3C',
    title: 'Sort Array in Ascending/Descending Order',
    aim: 'Write an ALP to sort given array in Ascending/descending order.',
    objectives: ['Implement sorting algorithms.', 'Utilize memory value exchangers.'],
    outcomes: ['Develop bubble-sort logic.', 'Perform RAM swaps.'],
    components: [{ name: 'MASM', spec: 'v6.11', purpose: 'Compiler' }],
    procedureSteps: ['Set outer counter DX = N - 1.', 'Set inner counter CX = DX.', 'Compare adjacent elements.', 'XCHG if condition met.'],
    theoryText: 'Bubble sort sweeps the array repeatedly. In each pass, adjacent elements are swapped if out of order, bubbling the largest value to the end.',
    theoryDiagramType: 'bubble-swap',
    algorithmSteps: [
      'Initialize Segment Registers (DS = @DATA).',
      'Set Outer Pass Counter DX to N - 1 (representing maximum passes required).',
      'Pass Start: Point SI index register to the array start. Copy the pass limit to inner counter CX (CX = DX).',
      'Element Load: Read byte [SI] into register AL.',
      'Comparison: Compare AL with the adjacent element [SI + 1] (CMP AL, [SI + 1]).',
      'Swap Decision: If AL <= [SI + 1] (sorted order), skip swap. Otherwise, swap memory elements: load [SI + 1] into AH, write AL to [SI + 1], and write AH to [SI].',
      'Increment Pointer SI++ to target the next pair.',
      'Inner Loop control: Decrement CX. If CX > 0, repeat the comparison; else finish current pass.',
      'Outer Loop control: Decrement DX. If DX > 0, jump back to Pass Start to perform the next sweep; else the array is fully sorted.'
    ],
    flowchartSteps: [
      { type: 'start', label: 'START' },
      { type: 'process', label: 'Init Outer Counter: DX = N-1 (Passes count)' },
      { type: 'process', label: 'Point SI to start of array; Set Inner Counter: CX = DX' },
      { type: 'process', label: 'AL = [SI] (Load current element)' },
      { type: 'decision', label: 'Is AL <= [SI+1] (Ordered)?' },
      { type: 'process', label: 'Swap memory elements: [SI] and [SI+1] via AH register' },
      { type: 'process', label: 'Increment Pointer: SI++' },
      { type: 'decision', label: 'Is Inner Loop CX = 0?' },
      { type: 'decision', label: 'Is Outer Loop DX = 0?' },
      { type: 'stop', label: 'STOP (Array successfully sorted)' }
    ],
    expectedOutput: {
      desc: 'Array: 88H, 11H, 55H, 22H, 44H',
      inputs: [{ name: 'LIST', val: '88H, 11H, 55H, 22H, 44H' }],
      outputs: [{ name: 'SORTED', val: '11H, 22H, 44H, 55H, 88H' }],
      registers: 'AX=8811H CX=0000H',
      terminalDump: 'LIST is now 11 22 44 55 88'
    },
    manualCalculations: {
      title: 'Bubble Sort Tracing',
      steps: [{ step: 'Pass 1', detail: '88H compared to 11H. Swapped. 11H, 88H, 55H, 22H, 44H.' }]
    },
    resultText: 'The array was sorted in perfect ascending order.',
    precautions: ['Keep loops bounded to avoid reading beyond array size boundary.'],
    studentTask: {
      title: 'Descending Sorter',
      desc: 'Modify code to sort the array in descending order.',
      hint: 'Change the JBE instruction in the comparator to JAE.'
    },
    applications: [{ title: 'Task Scheduler', desc: 'Sort execution queues based on priority keys.', icon: 'cpu' }]
  },
  exp_str1: {
    number: '4A',
    title: 'Find String Length',
    aim: 'Write an ALP to find String length.',
    objectives: ['Understand string instructions.', 'Grasp SCASB string scans.'],
    outcomes: ['Utilize repeat counters (REPNE).', 'Detect string terminators.'],
    components: [{ name: 'MASM', spec: 'v6.11', purpose: 'Compiler' }],
    procedureSteps: ['LEA DI, STRING.', 'Set AL = terminator ($).', 'CX = FFFFH.', 'REPNE SCASB, calculate length.'],
    theoryText: 'SCASB compares AL with ES:[DI] and updates DI and CX. REPNE repeats until AL match occurs.',
    theoryDiagramType: 'pointer-scan',
    algorithmSteps: [
      'Initialize Segment Registers (ES must equal DS to allow string scans).',
      'Load DI index register with the starting offset of the target string (LEA DI, STRING).',
      'Load search register AL with the string terminator character code (AL = "$").',
      'Set loop counter CX to FFFFH (maximum unsigned 16-bit integer to handle downward count).',
      'Clear Direction Flag: Execute CLD (DF = 0) to guarantee DI increments automatically.',
      'Scan String: Run REPNE SCASB, which compares AL with ES:[DI], increments DI, and decrements CX until AL matches or CX is 0.',
      'Calculate length: Execute NOT CX followed by DEC CX to transform the down-counted CX value into the exact string length.',
      'Save Results: Store CX in STR_LEN memory, then exit cleanly.'
    ],
    flowchartSteps: [
      { type: 'start', label: 'START' },
      { type: 'process', label: 'Point ES to DS; Load DI with string address; Set AL="$" (Terminator)' },
      { type: 'process', label: 'Initialize search count: CX = FFFFH; Clear Direction Flag (DF=0)' },
      { type: 'process', label: 'Scan String: REPNE SCASB (compares AL with ES:[DI], DI++, CX--)' },
      { type: 'decision', label: 'Is Terminator "$" Found (ZF=1)?' },
      { type: 'process', label: 'Convert CX count: NOT CX, then DEC CX to find exact string length' },
      { type: 'process', label: 'Save final length CX into memory variable STR_LEN' },
      { type: 'stop', label: 'STOP (Exit)' }
    ],
    expectedOutput: {
      desc: 'String: "KUPPAM$"',
      inputs: [{ name: 'STR_VAL', val: 'KUPPAM$' }],
      outputs: [{ name: 'STR_LEN', val: '0006H' }],
      registers: 'CX=FFFAH DI=0007H',
      terminalDump: 'LENGTH = 6'
    },
    manualCalculations: {
      title: 'String Length Calculation',
      steps: [{ step: 'Scan String', detail: 'Characters: K-U-P-P-A-M. Total length = 6.' }]
    },
    resultText: 'String length was correctly computed as 6.',
    precautions: ['Clear direction flag (CLD) to increment DI during scan.'],
    studentTask: {
      title: 'Whitespace Excluder',
      desc: 'Calculate length of string excluding whitespace characters.',
      hint: 'Incorporate an inner comparator loop to skip space characters (20H).'
    },
    applications: [{ title: 'Parser Compiler', desc: 'Evaluating bounds of text tokens.', icon: 'cpu' }]
  },
  exp_str2: {
    number: '4B',
    title: 'Display the Given String',
    aim: 'Write an ALP for Displaying the given String.',
    objectives: ['Master DOS interrupt calls.', 'Display texts in terminal.'],
    outcomes: ['Understand INT 21H services.', 'Perform CLI displays.'],
    components: [{ name: 'MASM', spec: 'v6.11', purpose: 'Compiler' }],
    procedureSteps: ['Define string with "$".', 'Load segment.', 'LEA DX, STRING.', 'Set AH = 09H, INT 21H.'],
    theoryText: 'DOS interrupt 21H service 09H prints a character string to the standard output. Offset must be loaded in DX.',
    theoryDiagramType: 'block-copy',
    algorithmSteps: [
      'Initialize Data Segment: Load AX with @DATA and set DS = AX.',
      'Load DX register with the starting offset address of the message (LEA DX, MESSAGE).',
      'Select print function: Load register AH with service code 09H (Write string to standard output).',
      'Trigger BIOS/DOS: Execute software interrupt INT 21H. This parses memory starting at DS:DX, writing characters to terminal until the "$" terminator is encountered.',
      'Clean Return: Set AH = 4CH and trigger INT 21H to exit back to the DOS prompt cleanly.'
    ],
    flowchartSteps: [
      { type: 'start', label: 'START' },
      { type: 'process', label: 'Initialize Segment Register: DS = @DATA' },
      { type: 'process', label: 'Load string offset into DX: LEA DX, MESSAGE' },
      { type: 'process', label: 'Select DOS display string service: AH = 09H' },
      { type: 'process', label: 'Execute software interrupt: INT 21H (displays text in console)' },
      { type: 'stop', label: 'STOP (Exit cleanly)' }
    ],
    expectedOutput: {
      desc: 'String: "HELLO FROM 8086 MICRO-COURSE$"',
      inputs: [{ name: 'MSG', val: 'HELLO FROM 8086 MICRO-COURSE$' }],
      outputs: [{ name: 'Terminal print', val: 'HELLO FROM 8086 MICRO-COURSE' }],
      registers: 'AX=0900H DX=0000H',
      terminalDump: 'HELLO FROM 8086 MICRO-COURSE'
    },
    manualCalculations: {
      title: 'DOS Print Trace',
      steps: [{ step: 'Print Service', detail: 'AH=09H prints string until "$" terminator is parsed.' }]
    },
    resultText: 'The string was successfully output to the terminal display.',
    precautions: ['Ensure string ends with "$" to prevent DOS from displaying random memory clutter.'],
    studentTask: {
      title: 'Multi-line Logger',
      desc: 'Display three different lines of strings with line feeds.',
      hint: 'Include ASCII codes 13 (Carriage Return) and 10 (Line Feed) inside message string.'
    },
    applications: [{ title: 'Command Terminal', desc: 'Displaying debug information and menu logs.', icon: 'cpu' }]
  },
  exp_str3: {
    number: '4C',
    title: 'Compare Two Strings',
    aim: 'Write an ALP for Comparing two Strings.',
    objectives: ['Learn string comparators.', 'Master REPE index loops.'],
    outcomes: ['Understand CMPSB.', 'Determine string equality.'],
    components: [{ name: 'MASM', spec: 'v6.11', purpose: 'Compiler' }],
    procedureSteps: ['Load SI = str1, DI = str2.', 'CX = Length.', 'CLD, REPE CMPSB.', 'Query Zero Flag (JZ).'],
    theoryText: 'CMPSB compares DS:[SI] with ES:[DI], incrementing SI/DI. REPE repeats until comparison is unequal or CX is 0.',
    theoryDiagramType: 'block-copy',
    algorithmSteps: [
      'Initialize Segment Registers (ensure extra segment ES points to data segment DS: ES = DS).',
      'Point SI register to the start of STR1, and DI register to the start of STR2.',
      'Load loop counter CX with the character length of the strings to compare.',
      'Clear Direction Flag: Execute CLD (DF = 0) to ensure index pointers SI and DI increment automatically.',
      'Compare Strings: Execute REPE CMPSB. This instruction compares the byte at DS:SI with ES:DI, increments SI and DI, and decrements CX. It repeats while characters are equal and CX is not 0.',
      'Check status flags: If Zero Flag is set (ZF = 1), the strings match completely. Jump to MATCH_HANDLER and set AL = 00H.',
      'Mismatch Handler: If ZF = 0, set AL = 01H (signifying unequal strings).',
      'Save Results: Store AL into memory variable COMPARE_RESULT, then exit cleanly.'
    ],
    flowchartSteps: [
      { type: 'start', label: 'START' },
      { type: 'process', label: 'Point ES to DS; SI = Offset STR1, DI = Offset STR2, CX = String Length' },
      { type: 'process', label: 'Clear Direction Flag: CLD (auto-increments SI and DI)' },
      { type: 'process', label: 'Compare characters: REPE CMPSB (compares [SI] and [DI], SI++, DI++, CX--)' },
      { type: 'decision', label: 'Are Strings Identical (ZF=1)?' },
      { type: 'process', label: 'Set AL = 01H (Mismatch Flag)' },
      { type: 'process', label: 'Set AL = 00H (Match Flag)' },
      { type: 'process', label: 'Store AL value into memory COMPARE_RESULT' },
      { type: 'stop', label: 'STOP (Exit)' }
    ],
    expectedOutput: {
      desc: 'Str1: "HELLO", Str2: "HELLO"',
      inputs: [{ name: 'STR1', val: 'HELLO' }, { name: 'STR2', val: 'HELLO' }],
      outputs: [{ name: 'RESULT', val: '00H (Equal)' }],
      registers: 'CX=0000H SI=0005H DI=0005H FLAGS=ZF=1',
      terminalDump: 'Strings are equal'
    },
    manualCalculations: {
      title: 'String Compare Verification',
      steps: [{ step: 'Trace CMPSB', detail: 'H=H, E=E, L=L, L=L, O=O. ZF remains 1.' }]
    },
    resultText: 'The strings were correctly compared for equality.',
    precautions: ['Always set ES = DS segment for string comparison operations.'],
    studentTask: {
      title: 'Case-Insensitive Compare',
      desc: 'Compare two strings while ignoring uppercase/lowercase differences.',
      hint: 'Convert characters to uppercase by ANDing with 0DFH before comparison.'
    },
    applications: [{ title: 'Credential Validation', desc: 'Matching input passcode entries.', icon: 'key' }]
  },
  exp_str4: {
    number: '4D',
    title: 'String Reversal & Palindrome Check',
    aim: 'Write an ALP to reverse String and Checking for palindrome.',
    objectives: ['Perform string reversals.', 'Verify string symmetry.'],
    outcomes: ['Handle reverse offset loops.', 'Execute palindrome checks.'],
    components: [{ name: 'MASM', spec: 'v6.11', purpose: 'Compiler' }],
    procedureSteps: ['SI = str1 end, DI = rev_str.', 'Copy bytes backwards in LOOP.', 'Compare str1 and rev_str with CMPSB.'],
    theoryText: 'First, the string is copied from end to start. Then, CMPSB compares original and reversed sequences to verify symmetry.',
    theoryDiagramType: 'bubble-swap',
    algorithmSteps: [
      'Initialize Segment Registers (DS and ES).',
      'Point SI register to the end of STR1 (last character) and DI to the start of REV_STR memory.',
      'Load loop counter CX with the string length.',
      'Reversal Loop: Load character AL = [SI], store at destination [DI] = AL. Decrement SI (SI--) and increment DI (DI++).',
      'Check Loop count CX: Decrement CX via LOOP. If CX > 0, repeat Reversal Loop.',
      'Append Terminator: Store "$" character at end of REV_STR memory block.',
      'Re-initialize Pointers: Reset SI to start of STR1, reset DI to start of REV_STR, set CX to string length, and clear DF (CLD).',
      'Verify Palindrome: Run REPE CMPSB to compare original STR1 with reversed REV_STR byte-by-byte.',
      'Branch on Equality: If ZF = 1 (match), set AL = 01H (is Palindrome). If ZF = 0, set AL = 00H (not Palindrome). Save AL in PALINDROME_FLAG.'
    ],
    flowchartSteps: [
      { type: 'start', label: 'START' },
      { type: 'process', label: 'Point SI to last character of STR1; Point DI to REV_STR; Set CX=Length' },
      { type: 'process', label: 'Copy character backwards: AL = [SI], [DI] = AL, SI--, DI++' },
      { type: 'decision', label: 'Is Copy Loop CX = 0?' },
      { type: 'process', label: 'Reinit pointers: SI = &STR1, DI = &REV_STR, CX = Length; CLD' },
      { type: 'process', label: 'Compare strings: REPE CMPSB' },
      { type: 'decision', label: 'Are Strings Identical (ZF=1)?' },
      { type: 'process', label: 'Set AL = 00H (Not Palindrome)' },
      { type: 'process', label: 'Set AL = 01H (Is Palindrome)' },
      { type: 'process', label: 'Store AL value into memory PALINDROME_FLAG' },
      { type: 'stop', label: 'STOP (Exit)' }
    ],
    expectedOutput: {
      desc: 'String: "MADAM"',
      inputs: [{ name: 'STR1', val: 'MADAM' }],
      outputs: [{ name: 'RESULT', val: '00H (Palindrome)' }],
      registers: 'CX=0000H FLAGS=ZF=1',
      terminalDump: 'MADAM is a Palindrome'
    },
    manualCalculations: {
      title: 'Symmetry Analysis',
      steps: [{ step: 'Original String', detail: 'MADAM.' }, { step: 'Reversed String', detail: 'MADAM.' }]
    },
    resultText: 'String reversal and palindrome validation performed successfully.',
    precautions: ['Decrease source pointer (SI) on each iteration during string reversal copy.'],
    studentTask: {
      title: 'Symmetric Sentence Checker',
      desc: 'Validate sentence palindromes ignoring spaces.',
      hint: 'Filter out space characters (20H) before copying reversed string.'
    },
    applications: [{ title: 'Genome Sequence', desc: 'Detecting DNA sequence symmetry markers.', icon: 'cpu' }]
  },
  exp5: {
    number: '5',
    title: 'Block Data Transfer (Memory Copy)',
    aim: 'Write an assembly program to copy a block of 10 data bytes from a source memory segment offset to a destination segment offset.',
    objectives: ['Learn high-speed data transfers.', 'Understand REP MOVSB instructions.'],
    outcomes: ['Understand segment-to-segment copies.', 'Manipulate string pointers.'],
    components: [{ name: 'MASM', spec: 'v6.11', purpose: 'Compiler' }],
    procedureSteps: ['SI = SRC, DI = DEST, CX = 10.', 'CLD (Direction Flag = 0).', 'REP MOVSB.'],
    theoryText: 'REP MOVSB automates loop copies. While CX is not zero, it moves DS:SI to ES:DI, incrementing both pointers.',
    theoryDiagramType: 'block-copy',
    algorithmSteps: [
      'Initialize Segment Registers: Set ES equal to DS (ES = DS).',
      'Set index registers: SI points to starting offset of SRC block, DI points to DEST block.',
      'Set transfer loop counter CX to 10 (bytes count).',
      'Clear Direction Flag: Execute CLD (DF = 0) to ensure SI and DI increment automatically (from lower to higher address).',
      'Execute Copy: Run REP MOVSB. This copies the byte at DS:[SI] to ES:[DI], increments SI and DI, decrements CX, and repeats until CX = 0.',
      'Verify: Check destination memory block to ensure all bytes were successfully duplicated, then exit.'
    ],
    flowchartSteps: [
      { type: 'start', label: 'START' },
      { type: 'process', label: 'Point ES to DS; SI = Source block Offset, DI = Destination Offset' },
      { type: 'process', label: 'Set CX = 10 (transfer size); Clear Direction Flag: CLD (auto-increments)' },
      { type: 'process', label: 'REP MOVSB (copies byte from DS:[SI] to ES:[DI], increments SI and DI, decrements CX)' },
      { type: 'decision', label: 'Is Block Copy CX = 0?' },
      { type: 'process', label: 'Verify that DEST_BLOCK memory contains matching copied bytes' },
      { type: 'stop', label: 'STOP (Exit cleanly)' }
    ],
    expectedOutput: {
      desc: 'Source block: 10H to 99H (10 bytes)',
      inputs: [{ name: 'SRC_BLOCK', val: '10 20 30 40 50 60 70 80 90 99' }],
      outputs: [{ name: 'DEST_BLOCK', val: '10 20 30 40 50 60 70 80 90 99' }],
      registers: 'CX=0000H SI=000AH DI=0014H',
      terminalDump: '10 bytes copied from SI to DI'
    },
    manualCalculations: {
      title: 'Memory Block Copy Verification',
      steps: [{ step: 'Step-by-step trace', detail: 'Copy byte [SI] to [DI], increment pointers. Repeat 10 times.' }]
    },
    resultText: 'Block data copy operation was verified successfully.',
    precautions: ['Always set ES = DS when copying variables inside the same segment.'],
    studentTask: {
      title: 'Overlapping Block Sorter',
      desc: 'Perform overlapping memory block copy safely.',
      hint: 'If destination address overlaps source, copy backwards from end of segment (STD).'
    },
    applications: [{ title: 'DMA Transceiver', desc: 'High-speed RAM buffer replication.', icon: 'hard-drive' }]
  }
};
