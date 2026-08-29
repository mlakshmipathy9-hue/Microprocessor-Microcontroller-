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
  category?: string;
  bloomLevel?: string;
  labSessionTime?: string;
  objectives: string[];
  outcomes: string[];
  components: Array<{ name: string; spec: string; purpose: string }>;
  procedureSteps: string[];
  theoryText: string;
  theoryDiagramType: 'carry-ripple' | 'register-pair' | 'pointer-scan' | 'bubble-swap' | 'block-copy' | 'clock-interrupt' | 'timer-tick' | 'stepper-motor' | 'adc-interfacing' | 'dac-waveforms' | 'mcu-arith' | 'mcu-muldiv' | 'mcu-logic' | 'mcu-regbanks' | 'mcu-timer-m1' | 'mcu-timer-m0' | 'mcu-counter-m2' | 'mcu-counter-m1' | 'mcu-uart-tx' | 'mcu-lcd-8bit' | 'mcu-lcd-4bit';
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
  vivaQuestions?: Array<{ question: string; answer: string; concept: string }>;
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
    standardCode: `DATA_SEG SEGMENT                      ; Declare Data Segment to allocate variables
    NUM1 DB 0FFH,0FEH,0FDH,0FCH        ; First 32-bit operand in Little Endian order
    NUM2 DB 01H,02H,03H,04H            ; Second 32-bit operand in Little Endian order
    LENGTH EQU 4                       ; Constant EQU defining array length (4 bytes)
    RESULT_ADD DB 4 DUP (?)            ; Uninitialized 4-byte buffer for addition result
    RESULT_SUB DB 4 DUP (?)            ; Uninitialized 4-byte buffer for subtraction result
    FINAL_CARRY DB ?                   ; 1-byte variable to store final carry bit
    FINAL_BORROW DB ?                  ; 1-byte variable to store final borrow bit
DATA_SEG ENDS                          ; End of Data Segment definition
CODE_SEG SEGMENT                       ; Declare Code Segment containing instructions
    ASSUME CS:CODE_SEG, DS:DATA_SEG    ; Map segment registers CS and DS to segments
START:                                 ; Program execution start label
    MOV AX, DATA_SEG                   ; Load base address of Data Segment into AX
    MOV DS, AX                         ; Transfer address to DS register
    LEA SI, NUM1                       ; Load effective offset address of NUM1 into SI
    LEA DI, NUM2                       ; Load effective offset address of NUM2 into DI
    LEA BX, RESULT_ADD                 ; Load destination offset of RESULT_ADD into BX
    MOV CX, LENGTH                     ; Initialize loop counter CX with byte count (4)
    CLC                                ; Clear Carry Flag (CF = 0) prior to addition
ADD_LOOP:                              ; Beginning of byte-by-byte addition loop
    MOV AL, [SI]                       ; Fetch current byte of NUM1 into accumulator AL
    ADC AL, [DI]                       ; Add byte from NUM2 and previous Carry Flag to AL
    MOV [BX], AL                       ; Store computed byte sum into memory location [BX]
    INC SI                             ; Point SI to next higher-order byte in NUM1
    INC DI                             ; Point DI to next higher-order byte in NUM2
    INC BX                             ; Point BX to next destination byte in RESULT_ADD
    LOOP ADD_LOOP                      ; Decrement CX and jump to ADD_LOOP if CX != 0
    MOV AL, 0                          ; Clear AL to prepare for final carry capture
    ADC AL, 0                          ; Add 0 + 0 + CF to store final Carry bit into AL
    MOV FINAL_CARRY, AL                ; Save final carry status into memory variable
    LEA SI, NUM1                       ; Reload SI with starting offset of NUM1
    LEA DI, NUM2                       ; Reload DI with starting offset of NUM2
    LEA BX, RESULT_SUB                 ; Load destination offset of RESULT_SUB into BX
    MOV CX, LENGTH                     ; Re-initialize loop counter CX with 4
    CLC                                ; Clear Carry/Borrow Flag (CF = 0) before subtraction
SUB_LOOP:                              ; Beginning of byte-by-byte subtraction loop
    MOV AL, [SI]                       ; Fetch current byte of NUM1 into accumulator AL
    SBB AL, [DI]                       ; Subtract byte of NUM2 and borrow from AL
    MOV [BX], AL                       ; Store computed difference byte into memory [BX]
    INC SI                             ; Advance SI to next byte in NUM1
    INC DI                             ; Advance DI to next byte in NUM2
    INC BX                             ; Advance BX to next destination byte in RESULT_SUB
    LOOP SUB_LOOP                      ; Decrement CX and jump to SUB_LOOP if CX != 0
    MOV AL, 0                          ; Clear AL to prepare for final borrow capture
    ADC AL, 0                          ; Add 0 + 0 + CF to capture final Borrow into AL
    MOV FINAL_BORROW, AL               ; Save final borrow status into memory variable
    MOV AH, 4CH                        ; Load DOS service function 4CH (Terminate Program)
    INT 21H                            ; Call DOS interrupt 21H to return to operating system
CODE_SEG ENDS                          ; End of Code Segment definition
END START                              ; End of assembly source and entry point marker`,
    simplifiedCode: `.MODEL SMALL                          ; Specify small memory model (64KB code, 64KB data)
.DATA                                  ; Direct assembler to start Data Segment
    NUM1 DB 0FFH,0FEH,0FDH,0FCH        ; First 32-bit operand in Little Endian order
    NUM2 DB 01H,02H,03H,04H            ; Second 32-bit operand in Little Endian order
    LENGTH EQU 4                       ; Constant EQU specifying length (4 bytes)
    RESULT_ADD DB 4 DUP (?)            ; Uninitialized 4-byte buffer for addition result
    RESULT_SUB DB 4 DUP (?)            ; Uninitialized 4-byte buffer for subtraction result
    FINAL_CARRY DB ?                   ; Variable to store final carry bit
    FINAL_BORROW DB ?                  ; Variable to store final borrow bit
.CODE                                  ; Direct assembler to start Code Segment
MAIN PROC                              ; Declare start of procedure MAIN
    MOV AX, @DATA                      ; Load address of data segment into AX
    MOV DS, AX                         ; Initialize DS register with @DATA address
    LEA SI, NUM1                       ; Load effective offset address of NUM1 into SI
    LEA DI, NUM2                       ; Load effective offset address of NUM2 into DI
    LEA BX, RESULT_ADD                 ; Load destination offset of RESULT_ADD into BX
    MOV CX, LENGTH                     ; Set loop counter CX to number of bytes (4)
    CLC                                ; Clear Carry Flag (CF = 0) before addition
ADD_L:                                 ; Loop label for multi-byte addition
    MOV AL, [SI]                       ; Fetch current byte of NUM1 into AL
    ADC AL, [DI]                       ; Add byte from NUM2 with carry into AL
    MOV [BX], AL                       ; Store computed byte sum into memory [BX]
    INC SI                             ; Point SI to next byte of NUM1
    INC DI                             ; Point DI to next byte of NUM2
    INC BX                             ; Point BX to next byte of RESULT_ADD
    LOOP ADD_L                         ; Decrement CX; jump to ADD_L if CX != 0
    MOV AL, 0                          ; Clear AL to 0
    ADC AL, 0                          ; Capture final Carry Flag (AL = 0 + 0 + CF)
    MOV FINAL_CARRY, AL                ; Store final carry bit in memory variable
    LEA SI, NUM1                       ; Re-initialize SI with starting offset of NUM1
    LEA DI, NUM2                       ; Re-initialize DI with starting offset of NUM2
    LEA BX, RESULT_SUB                 ; Load destination offset of RESULT_SUB into BX
    MOV CX, LENGTH                     ; Reset loop counter CX to 4
    CLC                                ; Clear Carry/Borrow flag before subtraction
SUB_L:                                 ; Loop label for multi-byte subtraction
    MOV AL, [SI]                       ; Fetch current byte of NUM1 into AL
    SBB AL, [DI]                       ; Subtract byte from NUM2 with borrow from AL
    MOV [BX], AL                       ; Store computed difference byte into memory [BX]
    INC SI                             ; Advance SI to next byte of NUM1
    INC DI                             ; Advance DI to next byte of NUM2
    INC BX                             ; Advance BX to next byte of RESULT_SUB
    LOOP SUB_L                         ; Decrement CX; jump to SUB_L if CX != 0
    MOV AL, 0                          ; Clear AL to 0
    ADC AL, 0                          ; Capture final Borrow Flag (AL = 0 + 0 + CF)
    MOV FINAL_BORROW, AL               ; Store final borrow bit in memory variable
    MOV AX, 4C00H                      ; Load AH=4CH (exit) and AL=00H (return code 0)
    INT 21H                            ; Call DOS interrupt 21H to terminate program
MAIN ENDP                              ; End of procedure MAIN definition
END MAIN                               ; End of program module with MAIN entry point`,
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
    standardCode: `DATA_SEG SEGMENT                      ; Declare Data Segment to allocate 16-bit variables
    VAL1 DW 0A12H                      ; Unsigned 16-bit multiplicand/dividend (2578D)
    VAL2 DW 0050H                      ; Unsigned 16-bit multiplier/divisor (80D)
    S_VAL1 DW -25                      ; Signed 16-bit multiplicand/dividend (-25D = FFE7H)
    S_VAL2 DW 5                        ; Signed 16-bit multiplier/divisor (+5D = 0005H)
    U_PROD_L DW ?                      ; Lower 16-bit word of unsigned product
    U_PROD_H DW ?                      ; Upper 16-bit word of unsigned product
    S_PROD_L DW ?                      ; Lower 16-bit word of signed product
    S_PROD_H DW ?                      ; Upper 16-bit word of signed product
    U_QUOT DW ?                        ; 16-bit unsigned quotient result
    U_REM DW ?                         ; 16-bit unsigned remainder result
    S_QUOT DW ?                        ; 16-bit signed quotient result
    S_REM DW ?                         ; 16-bit signed remainder result
DATA_SEG ENDS                          ; End of Data Segment definition
CODE_SEG SEGMENT                       ; Declare Code Segment containing instructions
    ASSUME CS:CODE_SEG, DS:DATA_SEG    ; Map segment registers CS and DS to logical segments
START:                                 ; Program entry label
    MOV AX, DATA_SEG                   ; Load base address of Data Segment into AX
    MOV DS, AX                         ; Initialize DS register with DATA_SEG address
    ; --- Unsigned Multiplication (16-bit x 16-bit = 32-bit in DX:AX) ---
    MOV AX, VAL1                       ; Load 16-bit multiplicand VAL1 into AX
    MUL VAL2                           ; Unsigned multiply AX by VAL2 (Result -> DX:AX)
    MOV U_PROD_L, AX                   ; Store lower 16-bit product from AX into memory
    MOV U_PROD_H, DX                   ; Store upper 16-bit product from DX into memory
    ; --- Signed Multiplication (16-bit x 16-bit = 32-bit in DX:AX) ---
    MOV AX, S_VAL1                     ; Load 16-bit signed value S_VAL1 into AX
    IMUL S_VAL2                        ; Signed multiply AX by S_VAL2 (Result -> DX:AX)
    MOV S_PROD_L, AX                   ; Store lower 16-bit signed product from AX
    MOV S_PROD_H, DX                   ; Store upper 16-bit signed product from DX
    ; --- Unsigned Division (32-bit in DX:AX / 16-bit) ---
    MOV AX, VAL1                       ; Load lower word of dividend into AX
    XOR DX, DX                         ; Clear DX to 0000H to form 32-bit dividend DX:AX
    DIV VAL2                           ; Unsigned divide DX:AX by VAL2 (Quotient: AX, Remainder: DX)
    MOV U_QUOT, AX                     ; Store unsigned quotient from AX into memory
    MOV U_REM, DX                      ; Store unsigned remainder from DX into memory
    ; --- Signed Division (32-bit in DX:AX / 16-bit) ---
    MOV AX, S_VAL1                     ; Load 16-bit signed dividend into AX
    CWD                                ; Convert Word to Doubleword (Sign-extend AX into DX:AX)
    IDIV S_VAL2                        ; Signed divide DX:AX by S_VAL2 (Quotient: AX, Remainder: DX)
    MOV S_QUOT, AX                     ; Store signed quotient from AX into memory
    MOV S_REM, DX                      ; Store signed remainder from DX into memory
    MOV AH, 4CH                        ; Load DOS service function 4CH (Exit)
    INT 21H                            ; Call DOS interrupt 21H to terminate program
CODE_SEG ENDS                          ; End of Code Segment definition
END START                              ; End of assembly source and entry point marker`,
    simplifiedCode: `.MODEL SMALL                          ; Specify small memory model for code and data
.DATA                                  ; Direct assembler to start Data Segment
    VAL1 DW 0A12H                      ; Unsigned 16-bit input value 1
    VAL2 DW 0050H                      ; Unsigned 16-bit input value 2
    S_VAL1 DW -25                      ; Signed 16-bit input value 1 (-25D)
    S_VAL2 DW 5                        ; Signed 16-bit input value 2 (+5D)
    U_PROD_L DW ?                      ; Unsigned product low word
    U_PROD_H DW ?                      ; Unsigned product high word
    S_PROD_L DW ?                      ; Signed product low word
    S_PROD_H DW ?                      ; Signed product high word
    U_QUOT DW ?                        ; Unsigned division quotient
    U_REM DW ?                         ; Unsigned division remainder
    S_QUOT DW ?                        ; Signed division quotient
    S_REM DW ?                         ; Signed division remainder
.CODE                                  ; Direct assembler to start Code Segment
MAIN PROC                              ; Declare start of procedure MAIN
    MOV AX, @DATA                      ; Load address of data segment into AX
    MOV DS, AX                         ; Initialize DS register with @DATA address
    ; --- Unsigned Multiplication ---
    MOV AX, VAL1                       ; Load 16-bit operand VAL1 into AX
    MUL VAL2                           ; Unsigned multiply AX by VAL2 (Product -> DX:AX)
    MOV U_PROD_L, AX                   ; Save low word of unsigned product
    MOV U_PROD_H, DX                   ; Save high word of unsigned product
    ; --- Signed Multiplication ---
    MOV AX, S_VAL1                     ; Load 16-bit signed operand S_VAL1 into AX
    IMUL S_VAL2                        ; Signed multiply AX by S_VAL2 (Product -> DX:AX)
    MOV S_PROD_L, AX                   ; Save low word of signed product
    MOV S_PROD_H, DX                   ; Save high word of signed product
    ; --- Unsigned Division ---
    MOV AX, VAL1                       ; Load unsigned dividend into AX
    XOR DX, DX                         ; Zero-extend DX to create 32-bit dividend DX:AX
    DIV VAL2                           ; Unsigned divide DX:AX by VAL2 (AX=Quotient, DX=Remainder)
    MOV U_QUOT, AX                     ; Save unsigned quotient to memory
    MOV U_REM, DX                      ; Save unsigned remainder to memory
    ; --- Signed Division ---
    MOV AX, S_VAL1                     ; Load signed dividend into AX
    CWD                                ; Sign-extend AX into DX:AX (Convert Word to Doubleword)
    IDIV S_VAL2                        ; Signed divide DX:AX by S_VAL2 (AX=Quotient, DX=Remainder)
    MOV S_QUOT, AX                     ; Save signed quotient to memory
    MOV S_REM, DX                      ; Save signed remainder to memory
    MOV AX, 4C00H                      ; Load AH=4CH (exit) and AL=00H (return code 0)
    INT 21H                            ; Call DOS interrupt 21H to terminate program
MAIN ENDP                              ; End of procedure MAIN definition
END MAIN                               ; End of program module with MAIN entry point`,
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
    standardCode: `DATA_SEG SEGMENT                      ; Declare Data Segment to allocate variables
    NUM DB 5                           ; 8-bit input number N (5D = 05H)
    SQUARE DW ?                        ; 16-bit variable to store square result (N^2 = 25D = 0019H)
    CUBE DW ?                          ; Lower 16-bit word of cube result (N^3 = 125D = 007DH)
    CUBE_H DW ?                        ; Upper 16-bit word of cube result
    FACT DW ?                          ; 16-bit variable to store factorial (5! = 120D = 0078H)
DATA_SEG ENDS                          ; End of Data Segment definition
CODE_SEG SEGMENT                       ; Declare Code Segment containing instructions
    ASSUME CS:CODE_SEG, DS:DATA_SEG    ; Associate segment registers with logical segments
START:                                 ; Program entry point label
    MOV AX, DATA_SEG                   ; Load base address of Data Segment into AX
    MOV DS, AX                         ; Initialize DS register with DATA_SEG address
    ; --- Step 1: Calculate Square (N * N) ---
    MOV AL, NUM                        ; Load 8-bit input number NUM into AL
    XOR AH, AH                         ; Clear upper byte AH to make AX = 0005H
    MUL AL                             ; Unsigned multiply AL by AL (AX = AL * AL = 25D)
    MOV SQUARE, AX                     ; Store 16-bit square result into SQUARE memory
    ; --- Step 2: Calculate Cube (Square * N) ---
    MOV BX, AX                         ; Copy computed square from AX into register BX
    MOV AL, NUM                        ; Reload original input number NUM into AL
    XOR AH, AH                         ; Clear upper byte AH to make AX = 0005H
    MUL BX                             ; Multiply AX (5) by BX (25) (Result in DX:AX = 125D)
    MOV CUBE, AX                       ; Store lower 16-bit word of cube into CUBE
    MOV CUBE_H, DX                     ; Store upper 16-bit word of cube into CUBE_H
    ; --- Step 3: Calculate Factorial (N!) ---
    MOV CL, NUM                        ; Load loop counter with input number N (5)
    XOR CH, CH                         ; Clear upper byte CH to form 16-bit CX = 0005H
    MOV AX, 1                          ; Initialize factorial accumulator AX to 1
FACT_LOOP:                             ; Factorial iterative multiplication loop
    MUL CX                             ; Multiply accumulator AX by current counter CX
    LOOP FACT_LOOP                     ; Decrement CX; repeat multiplication until CX = 0
    MOV FACT, AX                       ; Store computed factorial result (120D) into FACT
    MOV AH, 4CH                        ; Load DOS service function 4CH (Exit)
    INT 21H                            ; Call DOS interrupt 21H to terminate program
CODE_SEG ENDS                          ; End of Code Segment definition
END START                              ; End of program with START entry point`,
    simplifiedCode: `.MODEL SMALL                          ; Specify small memory model for code and data
.DATA                                  ; Direct assembler to start Data Segment
    NUM DB 5                           ; 8-bit input operand N (5D)
    SQUARE DW ?                        ; 16-bit variable for square (25D = 19H)
    CUBE DW ?                          ; Low word of cube (125D = 7DH)
    CUBE_H DW ?                        ; High word of cube
    FACT DW ?                          ; 16-bit variable for factorial (120D = 78H)
.CODE                                  ; Direct assembler to start Code Segment
MAIN PROC                              ; Declare start of procedure MAIN
    MOV AX, @DATA                      ; Load address of data segment into AX
    MOV DS, AX                         ; Initialize DS register with @DATA address
    ; --- Calculate Square ---
    MOV AL, NUM                        ; Load number N into AL
    XOR AH, AH                         ; Clear AH (AX = N)
    MUL AL                             ; AX = AL * AL (N^2 = 25D)
    MOV SQUARE, AX                     ; Save square to memory
    ; --- Calculate Cube ---
    MOV BX, AX                         ; Copy square result into BX
    MOV AL, NUM                        ; Reload N into AL
    XOR AH, AH                         ; Clear AH (AX = N)
    MUL BX                             ; DX:AX = AX * BX (N * N^2 = 125D)
    MOV CUBE, AX                       ; Save low word of cube
    MOV CUBE_H, DX                     ; Save high word of cube
    ; --- Calculate Factorial ---
    MOV CL, NUM                        ; Set loop counter CL to N (5)
    XOR CH, CH                         ; Clear CH (CX = 5)
    MOV AX, 1                          ; Initialize factorial product in AX = 1
FL:                                    ; Factorial multiplication loop label
    MUL CX                             ; Multiply AX by CX (AX = AX * CX)
    LOOP FL                            ; Decrement CX and loop while CX > 0
    MOV FACT, AX                       ; Save final factorial result (120D) to FACT
    MOV AX, 4C00H                      ; Load AH=4CH (exit) and AL=00H (return code 0)
    INT 21H                            ; Call DOS interrupt 21H to terminate program
MAIN ENDP                              ; End of procedure MAIN definition
END MAIN                               ; End of program module with MAIN entry point`,
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
    standardCode: `DATA_SEG SEGMENT                      ; Declare Data Segment to allocate variables
    DATA_VAL DB -45                    ; 8-bit signed test data (-45D = 0D3H, MSB = 1)
    RESULT DB ?                        ; Output flag: 00H = Positive, 01H = Negative
DATA_SEG ENDS                          ; End of Data Segment definition
CODE_SEG SEGMENT                       ; Declare Code Segment containing instructions
    ASSUME CS:CODE_SEG, DS:DATA_SEG    ; Map segment registers CS and DS to logical segments
START:                                 ; Program entry label
    MOV AX, DATA_SEG                   ; Load base address of Data Segment into AX
    MOV DS, AX                         ; Initialize DS register with DATA_SEG address
    MOV AL, DATA_VAL                   ; Load 8-bit signed value DATA_VAL into AL
    TEST AL, 80H                       ; Perform bitwise AND with 10000000B to inspect MSB
    JS IS_NEG                          ; If Sign Flag SF = 1 (Negative), jump to IS_NEG
    MOV RESULT, 0                      ; Otherwise MSB = 0: store 00H (Positive) in RESULT
    JMP FINISH                         ; Jump over negative handler to program exit
IS_NEG:                                ; Negative number handler label
    MOV RESULT, 1                      ; MSB = 1: store 01H (Negative) in RESULT
FINISH:                                ; Program exit point label
    MOV AH, 4CH                        ; Load DOS service function 4CH (Exit)
    INT 21H                            ; Call DOS interrupt 21H to terminate program
CODE_SEG ENDS                          ; End of Code Segment definition
END START                              ; End of program with START entry point`,
    simplifiedCode: `.MODEL SMALL                          ; Specify small memory model for code and data
.DATA                                  ; Direct assembler to start Data Segment
    DATA_VAL DB -45                    ; 8-bit signed test value (-45D = 0D3H)
    RESULT DB ?                        ; Result flag: 0 = Positive, 1 = Negative
.CODE                                  ; Direct assembler to start Code Segment
MAIN PROC                              ; Declare start of procedure MAIN
    MOV AX, @DATA                      ; Load address of data segment into AX
    MOV DS, AX                         ; Initialize DS register with @DATA address
    MOV AL, DATA_VAL                   ; Load test data byte into register AL
    TEST AL, 80H                       ; Test sign bit (bit 7) non-destructively
    JS IS_N                            ; Jump to IS_N if Sign Flag SF = 1 (Negative)
    MOV RESULT, 0                      ; Set RESULT = 0 (Data is Positive)
    JMP DONE                           ; Jump to DONE to bypass negative handler
IS_N:                                  ; Negative case label
    MOV RESULT, 1                      ; Set RESULT = 1 (Data is Negative)
DONE:                                  ; Program exit point label
    MOV AX, 4C00H                      ; Load AH=4CH (exit) and AL=00H (return code 0)
    INT 21H                            ; Call DOS interrupt 21H to terminate program
MAIN ENDP                              ; End of procedure MAIN definition
END MAIN                               ; End of program module with MAIN entry point`,
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
    standardCode: `DATA_SEG SEGMENT                      ; Declare Data Segment to allocate variables
    DATA_VAL DB 47                     ; 8-bit test byte (47D = 2FH = 00101111B, LSB = 1)
    RESULT DB ?                        ; Output result flag: 00H = Even, 01H = Odd
DATA_SEG ENDS                          ; End of Data Segment definition
CODE_SEG SEGMENT                       ; Declare Code Segment containing instructions
    ASSUME CS:CODE_SEG, DS:DATA_SEG    ; Map segment registers CS and DS to logical segments
START:                                 ; Program entry label
    MOV AX, DATA_SEG                   ; Load base address of Data Segment into AX
    MOV DS, AX                         ; Initialize DS register with DATA_SEG address
    MOV AL, DATA_VAL                   ; Load 8-bit input value into register AL
    TEST AL, 01H                       ; Bitwise AND AL with 00000001B to isolate LSB
    JZ IS_EVEN                         ; If Zero Flag ZF = 1 (LSB is 0), jump to IS_EVEN
    MOV RESULT, 1                      ; LSB is 1 (Odd number): store 01H in RESULT
    JMP FINISH                         ; Jump over Even case to program exit
IS_EVEN:                               ; Even number handler label
    MOV RESULT, 0                      ; LSB is 0 (Even number): store 00H in RESULT
FINISH:                                ; Program termination label
    MOV AH, 4CH                        ; Load DOS service function 4CH (Exit)
    INT 21H                            ; Call DOS interrupt 21H to terminate program
CODE_SEG ENDS                          ; End of Code Segment definition
END START                              ; End of program with START entry point`,
    simplifiedCode: `.MODEL SMALL                          ; Specify small memory model for code and data
.DATA                                  ; Direct assembler to start Data Segment
    DATA_VAL DB 47                     ; 8-bit test number (47D = Odd)
    RESULT DB ?                        ; Result flag: 0 = Even, 1 = Odd
.CODE                                  ; Direct assembler to start Code Segment
MAIN PROC                              ; Declare start of procedure MAIN
    MOV AX, @DATA                      ; Load address of data segment into AX
    MOV DS, AX                         ; Initialize DS register with @DATA address
    MOV AL, DATA_VAL                   ; Load test data byte into register AL
    TEST AL, 01H                       ; Test Least Significant Bit (Bit 0)
    JZ IS_E                            ; If LSB == 0 (Zero Flag set), jump to IS_E
    MOV RESULT, 1                      ; Set RESULT = 1 (Data is Odd)
    JMP DONE                           ; Jump to DONE to bypass even handler
IS_E:                                  ; Even case label
    MOV RESULT, 0                      ; Set RESULT = 0 (Data is Even)
DONE:                                  ; Program exit point label
    MOV AX, 4C00H                      ; Load AH=4CH (exit) and AL=00H (return code 0)
    INT 21H                            ; Call DOS interrupt 21H to terminate program
MAIN ENDP                              ; End of procedure MAIN definition
END MAIN                               ; End of program module with MAIN entry point`,
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
    standardCode: `DATA_SEG SEGMENT                      ; Declare Data Segment to allocate variables
    DATA_VAL DB 0A5H                   ; 8-bit test pattern: 10100101B (Ones = 4, Zeros = 4)
    ONES_COUNT DB ?                    ; 1-byte variable to store total count of 1s
    ZEROS_COUNT DB ?                   ; 1-byte variable to store total count of 0s
DATA_SEG ENDS                          ; End of Data Segment definition
CODE_SEG SEGMENT                       ; Declare Code Segment containing instructions
    ASSUME CS:CODE_SEG, DS:DATA_SEG    ; Map segment registers CS and DS to logical segments
START:                                 ; Program entry label
    MOV AX, DATA_SEG                   ; Load base address of Data Segment into AX
    MOV DS, AX                         ; Initialize DS register with DATA_SEG address
    MOV AL, DATA_VAL                   ; Load 8-bit test pattern into accumulator AL
    MOV CX, 8                          ; Set loop counter CX to 8 (number of bits in a byte)
    XOR BL, BL                         ; Clear register BL to 0 (counter for 1s)
    XOR BH, BH                         ; Clear register BH to 0 (counter for 0s)
SHIFT_LOOP:                            ; Bit inspection loop label
    SHR AL, 1                          ; Shift AL right by 1 bit; LSB moves into Carry Flag (CF)
    JC ADD_ONE                         ; If Carry Flag CF = 1, jump to ADD_ONE handler
    INC BH                             ; Carry Flag CF = 0: increment zeros count register BH
    JMP NEXT_ITER                      ; Jump to loop decrement point
ADD_ONE:                               ; Logic-1 handler label
    INC BL                             ; Carry Flag CF = 1: increment ones count register BL
NEXT_ITER:                             ; Loop continuation label
    LOOP SHIFT_LOOP                    ; Decrement CX; repeat shift loop if CX != 0
    MOV ONES_COUNT, BL                 ; Save computed ones count from BL to memory
    MOV ZEROS_COUNT, BH                ; Save computed zeros count from BH to memory
    MOV AH, 4CH                        ; Load DOS service function 4CH (Exit)
    INT 21H                            ; Call DOS interrupt 21H to terminate program
CODE_SEG ENDS                          ; End of Code Segment definition
END START                              ; End of program with START entry point`,
    simplifiedCode: `.MODEL SMALL                          ; Specify small memory model for code and data
.DATA                                  ; Direct assembler to start Data Segment
    DATA_VAL DB 0A5H                   ; 8-bit test data (10100101B)
    ONES_COUNT DB ?                    ; Total count of 1s
    ZEROS_COUNT DB ?                   ; Total count of 0s
.CODE                                  ; Direct assembler to start Code Segment
MAIN PROC                              ; Declare start of procedure MAIN
    MOV AX, @DATA                      ; Load address of data segment into AX
    MOV DS, AX                         ; Initialize DS register with @DATA address
    MOV AL, DATA_VAL                   ; Load byte into AL
    MOV CX, 8                          ; Set loop counter CX = 8 bits
    XOR BL, BL                         ; Clear BL (Ones counter = 0)
    XOR BH, BH                         ; Clear BH (Zeros counter = 0)
SL:                                    ; Shift bit loop label
    SHR AL, 1                          ; Shift LSB into Carry Flag
    JC AO                              ; If CF == 1, jump to AO (Add One)
    INC BH                             ; If CF == 0, increment Zeros counter
    JMP NI                             ; Jump to next iteration
AO:                                    ; Logic 1 case label
    INC BL                             ; Increment Ones counter
NI:                                    ; Next iteration label
    LOOP SL                            ; Decrement CX; loop if CX != 0
    MOV ONES_COUNT, BL                 ; Save ones count to memory
    MOV ZEROS_COUNT, BH                ; Save zeros count to memory
    MOV AX, 4C00H                      ; Load AH=4CH (exit) and AL=00H (return code 0)
    INT 21H                            ; Call DOS interrupt 21H to terminate program
MAIN ENDP                              ; End of procedure MAIN definition
END MAIN                               ; End of program module with MAIN entry point`,
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
    standardCode: `DATA_SEG SEGMENT                      ; Declare Data Segment to allocate array data
    ARRAY DB 10H, 20H, 30H, 40H, 50H   ; 5-element 8-bit array of hexadecimal numbers
    LEN DW 5                           ; 16-bit word storing total number of array elements (N = 5)
    SUM DB ?                           ; 1-byte variable to store computed sum (F0H = 240D)
    DIFF DB ?                          ; 1-byte variable to store successive difference
DATA_SEG ENDS                          ; End of Data Segment definition
CODE_SEG SEGMENT                       ; Declare Code Segment containing instructions
    ASSUME CS:CODE_SEG, DS:DATA_SEG    ; Map segment registers CS and DS to logical segments
START:                                 ; Program entry label
    MOV AX, DATA_SEG                   ; Load base address of Data Segment into AX
    MOV DS, AX                         ; Initialize DS register with DATA_SEG address
    ; --- Part 1: Addition of N numbers ---
    LEA SI, ARRAY                      ; Point SI to first element of ARRAY
    MOV CX, LEN                        ; Load loop counter CX with array length (5)
    XOR AL, AL                         ; Clear sum accumulator AL to 0
ADD_N_LOOP:                            ; Addition loop label
    ADD AL, [SI]                       ; Add array element at offset [SI] to accumulator AL
    INC SI                             ; Advance SI to point to next array element
    LOOP ADD_N_LOOP                    ; Decrement CX; repeat addition if CX != 0
    MOV SUM, AL                        ; Store final accumulated sum from AL into SUM
    ; --- Part 2: Subtraction of N numbers (First - Remaining) ---
    LEA SI, ARRAY                      ; Reset SI to starting address of ARRAY
    MOV CX, LEN                        ; Load loop counter CX with array length (5)
    DEC CX                             ; Decrement CX (4 subtractions for 5 numbers)
    MOV AL, [SI]                       ; Load first array element into accumulator AL
SUB_N_LOOP:                            ; Subtraction loop label
    INC SI                             ; Advance SI to next array element
    SUB AL, [SI]                       ; Subtract array element at [SI] from accumulator AL
    LOOP SUB_N_LOOP                    ; Decrement CX; repeat subtraction if CX != 0
    MOV DIFF, AL                       ; Store computed final difference into DIFF
    MOV AH, 4CH                        ; Load DOS service function 4CH (Exit)
    INT 21H                            ; Call DOS interrupt 21H to terminate program
CODE_SEG ENDS                          ; End of Code Segment definition
END START                              ; End of program with START entry point`,
    simplifiedCode: `.MODEL SMALL                          ; Specify small memory model for code and data
.DATA                                  ; Direct assembler to start Data Segment
    ARRAY DB 10H, 20H, 30H, 40H, 50H   ; 5-element 8-bit array
    LEN DW 5                           ; Number of elements N = 5
    SUM DB ?                           ; Sum output variable
    DIFF DB ?                          ; Difference output variable
.CODE                                  ; Direct assembler to start Code Segment
MAIN PROC                              ; Declare start of procedure MAIN
    MOV AX, @DATA                      ; Load address of data segment into AX
    MOV DS, AX                         ; Initialize DS register with @DATA address
    ; --- Addition ---
    LEA SI, ARRAY                      ; Point SI to array start
    MOV CX, LEN                        ; Set loop counter CX to N (5)
    XOR AL, AL                         ; Clear accumulator AL = 0
ANL:                                   ; Array addition loop label
    ADD AL, [SI]                       ; Accumulate element into AL
    INC SI                             ; Point to next element
    LOOP ANL                           ; Loop until all N elements added
    MOV SUM, AL                        ; Save sum to memory
    ; --- Subtraction ---
    LEA SI, ARRAY                      ; Reset SI to array start
    MOV CX, LEN                        ; Load length into CX
    DEC CX                             ; CX = N - 1 subtractions
    MOV AL, [SI]                       ; Load first element into AL
SNL:                                   ; Array subtraction loop label
    INC SI                             ; Advance pointer
    SUB AL, [SI]                       ; Subtract element from AL
    LOOP SNL                           ; Loop until all elements subtracted
    MOV DIFF, AL                       ; Save difference to memory
    MOV AX, 4C00H                      ; Load AH=4CH (exit) and AL=00H (return code 0)
    INT 21H                            ; Call DOS interrupt 21H to terminate program
MAIN ENDP                              ; End of procedure MAIN definition
END MAIN                               ; End of program module with MAIN entry point`,
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
    standardCode: `DATA_SEG SEGMENT                      ; Declare Data Segment to allocate array data
    ARRAY DB 25H, 4AH, 12H, 8BH, 05H, 92H, 31H ; 7-element 8-bit unsigned data array
    SIZE_ARR DW 7                      ; 16-bit variable storing total number of elements (N = 7)
    MAX_VAL DB ?                       ; 1-byte variable to store largest value found (92H)
    MIN_VAL DB ?                       ; 1-byte variable to store smallest value found (05H)
DATA_SEG ENDS                          ; End of Data Segment definition
CODE_SEG SEGMENT                       ; Declare Code Segment containing instructions
    ASSUME CS:CODE_SEG, DS:DATA_SEG    ; Map segment registers CS and DS to logical segments
START:                                 ; Program entry label
    MOV AX, DATA_SEG                   ; Load base address of Data Segment into AX
    MOV DS, AX                         ; Initialize DS register with DATA_SEG address
    LEA SI, ARRAY                      ; Point SI to first element of ARRAY
    MOV CX, SIZE_ARR                   ; Load loop counter CX with array size (7)
    DEC CX                             ; Decrement CX (6 comparisons needed for 7 elements)
    MOV AL, [SI]                       ; Initialize candidate Max in AL with first element
    MOV AH, [SI]                       ; Initialize candidate Min in AH with first element
COMP_LOOP:                             ; Array comparison search loop
    INC SI                             ; Point SI to next array element
    ; --- Check for Maximum ---
    CMP AL, [SI]                       ; Compare current candidate Max (AL) with [SI]
    JAE SKIP_MAX                       ; If AL >= [SI], keep existing Max and jump to SKIP_MAX
    MOV AL, [SI]                       ; Otherwise [SI] is larger: update AL with new Max
SKIP_MAX:                              ; Max check continuation label
    ; --- Check for Minimum ---
    CMP AH, [SI]                       ; Compare current candidate Min (AH) with [SI]
    JBE SKIP_MIN                       ; If AH <= [SI], keep existing Min and jump to SKIP_MIN
    MOV AH, [SI]                       ; Otherwise [SI] is smaller: update AH with new Min
SKIP_MIN:                              ; Min check continuation label
    LOOP COMP_LOOP                     ; Decrement CX; repeat comparison if CX != 0
    MOV MAX_VAL, AL                    ; Store final largest value from AL into MAX_VAL
    MOV MIN_VAL, AH                    ; Store final smallest value from AH into MIN_VAL
    MOV AH, 4CH                        ; Load DOS service function 4CH (Exit)
    INT 21H                            ; Call DOS interrupt 21H to terminate program
CODE_SEG ENDS                          ; End of Code Segment definition
END START                              ; End of program with START entry point`,
    simplifiedCode: `.MODEL SMALL                          ; Specify small memory model for code and data
.DATA                                  ; Direct assembler to start Data Segment
    ARRAY DB 25H, 4AH, 12H, 8BH, 05H, 92H, 31H ; 7-element unsigned array
    SIZE_ARR DW 7                      ; Total number of elements N = 7
    MAX_VAL DB ?                       ; Largest value output
    MIN_VAL DB ?                       ; Smallest value output
.CODE                                  ; Direct assembler to start Code Segment
MAIN PROC                              ; Declare start of procedure MAIN
    MOV AX, @DATA                      ; Load address of data segment into AX
    MOV DS, AX                         ; Initialize DS register with @DATA address
    LEA SI, ARRAY                      ; Point SI to first element
    MOV CX, SIZE_ARR                   ; Load array size into CX
    DEC CX                             ; Set CX = N - 1 comparisons
    MOV AL, [SI]                       ; Initialize Max = first element
    MOV AH, [SI]                       ; Initialize Min = first element
CLP:                                   ; Comparison loop label
    INC SI                             ; Advance SI to next element
    CMP AL, [SI]                       ; Compare Max with [SI]
    JAE SMX                            ; If AL >= [SI], jump to SMX
    MOV AL, [SI]                       ; Update Max in AL
SMX:                                   ; Label after Max update
    CMP AH, [SI]                       ; Compare Min with [SI]
    JBE SMN                            ; If AH <= [SI], jump to SMN
    MOV AH, [SI]                       ; Update Min in AH
SMN:                                   ; Label after Min update
    LOOP CLP                           ; Decrement CX; loop until array traversed
    MOV MAX_VAL, AL                    ; Save Max result to memory
    MOV MIN_VAL, AH                    ; Save Min result to memory
    MOV AX, 4C00H                      ; Load AH=4CH (exit) and AL=00H (return code 0)
    INT 21H                            ; Call DOS interrupt 21H to terminate program
MAIN ENDP                              ; End of procedure MAIN definition
END MAIN                               ; End of program module with MAIN entry point`,
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
    standardCode: `DATA_SEG SEGMENT                      ; Declare Data Segment to allocate array data
    LIST DB 88H, 11H, 55H, 22H, 44H    ; 5-element unsorted array of data bytes
    LEN DW 5                           ; Total element count (N = 5)
DATA_SEG ENDS                          ; End of Data Segment definition
CODE_SEG SEGMENT                       ; Declare Code Segment containing instructions
    ASSUME CS:CODE_SEG, DS:DATA_SEG    ; Map segment registers CS and DS to logical segments
START:                                 ; Program entry label
    MOV AX, DATA_SEG                   ; Load base address of Data Segment into AX
    MOV DS, AX                         ; Initialize DS register with DATA_SEG address
    ; --- Bubble Sort in Ascending Order ---
    MOV DX, LEN                        ; Load outer pass counter DX with length (5)
    DEC DX                             ; Total outer passes required = N - 1 (4)
OUTER_A:                               ; Outer bubble sort loop
    MOV CX, DX                         ; Set inner comparison count CX = current DX pass count
    LEA SI, LIST                       ; Reset SI to start of LIST at beginning of each pass
INNER_A:                               ; Inner adjacent pair comparison loop
    MOV AL, [SI]                       ; Load element at offset [SI] into register AL
    CMP AL, [SI+1]                     ; Compare [SI] with adjacent right neighbor [SI+1]
    JBE SKIP_A                         ; If [SI] <= [SI+1], already in order; jump to SKIP_A
    XCHG AL, [SI+1]                    ; Swap: place larger value in [SI+1], smaller value into AL
    MOV [SI], AL                       ; Store smaller value back into [SI]
SKIP_A:                                ; In-order continuation label
    INC SI                             ; Point SI to next pair of adjacent elements
    LOOP INNER_A                       ; Decrement inner counter CX; repeat inner pass
    DEC DX                             ; Decrement outer pass counter DX
    JNZ OUTER_A                        ; If DX != 0, execute next bubble sort pass
    MOV AH, 4CH                        ; Load DOS service function 4CH (Exit)
    INT 21H                            ; Call DOS interrupt 21H to terminate program
CODE_SEG ENDS                          ; End of Code Segment definition
END START                              ; End of program with START entry point`,
    simplifiedCode: `.MODEL SMALL                          ; Specify small memory model for code and data
.DATA                                  ; Direct assembler to start Data Segment
    LIST DB 88H, 11H, 55H, 22H, 44H    ; 5-element unsorted byte array
    LEN DW 5                           ; Array length N = 5
.CODE                                  ; Direct assembler to start Code Segment
MAIN PROC                              ; Declare start of procedure MAIN
    MOV AX, @DATA                      ; Load address of data segment into AX
    MOV DS, AX                         ; Initialize DS register with @DATA address
    MOV DX, LEN                        ; Initialize outer pass counter DX = 5
    DEC DX                             ; Total passes = N - 1 (4)
OUT_S:                                 ; Outer sort pass loop
    MOV CX, DX                         ; Set inner comparison counter CX = DX
    LEA SI, LIST                       ; Reset SI pointer to array start
IN_S:                                  ; Inner adjacent swap loop
    MOV AL, [SI]                       ; Fetch current element [SI]
    CMP AL, [SI+1]                     ; Compare with next neighbor [SI+1]
    JBE SK_S                           ; If [SI] <= [SI+1], skip swap
    XCHG AL, [SI+1]                    ; Swap adjacent values in memory
    MOV [SI], AL                       ; Store updated value into [SI]
SK_S:                                  ; Skip swap label
    INC SI                             ; Advance pointer to next adjacent pair
    LOOP IN_S                          ; Decrement CX; continue inner comparisons
    DEC DX                             ; Decrement outer pass counter DX
    JNZ OUT_S                          ; Continue until all outer passes complete
    MOV AX, 4C00H                      ; Load AH=4CH (exit) and AL=00H (return code 0)
    INT 21H                            ; Call DOS interrupt 21H to terminate program
MAIN ENDP                              ; End of procedure MAIN definition
END MAIN                               ; End of program module with MAIN entry point`,
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
    standardCode: `DATA_SEG SEGMENT                      ; Declare Data Segment to allocate string data
    STR_VAL DB 'KUPPAM$', 0            ; Sample string terminated by '$' and null byte
    STR_LEN DW ?                       ; 16-bit variable to store measured string length
DATA_SEG ENDS                          ; End of Data Segment definition
CODE_SEG SEGMENT                       ; Declare Code Segment containing instructions
    ASSUME CS:CODE_SEG, DS:DATA_SEG, ES:DATA_SEG ; Map CS, DS, and ES to appropriate segments
START:                                 ; Program entry label
    MOV AX, DATA_SEG                   ; Load base address of Data Segment into AX
    MOV DS, AX                         ; Initialize DS register with DATA_SEG address
    MOV ES, AX                         ; Initialize ES register with DATA_SEG (required by SCASB)
    LEA DI, STR_VAL                    ; Load Destination Index DI with offset of string STR_VAL
    MOV AL, '$'                        ; Load AL with delimiter character '$' to scan for
    MOV CX, 0FFFFH                     ; Initialize CX to maximum unsigned word value (65535)
    CLD                                ; Clear Direction Flag DF = 0 for auto-incrementing DI
    REPNE SCASB                        ; Scan bytes at ES:DI while AL != [ES:DI], decrementing CX
    NOT CX                             ; Invert CX bits (equivalent to FFFFH - remaining CX)
    DEC CX                             ; Decrement by 1 to exclude '$' delimiter character
    MOV STR_LEN, CX                    ; Store calculated string length into STR_LEN (6)
    MOV AH, 4CH                        ; Load DOS service function 4CH (Exit)
    INT 21H                            ; Call DOS interrupt 21H to terminate program
CODE_SEG ENDS                          ; End of Code Segment definition
END START                              ; End of program with START entry point`,
    simplifiedCode: `.MODEL SMALL                          ; Specify small memory model for code and data
.DATA                                  ; Direct assembler to start Data Segment
    STR_VAL DB 'KUPPAM$', 0            ; Input string terminated with '$'
    STR_LEN DW ?                       ; Output variable for string length
.CODE                                  ; Direct assembler to start Code Segment
MAIN PROC                              ; Declare start of procedure MAIN
    MOV AX, @DATA                      ; Load address of data segment into AX
    MOV DS, AX                         ; Initialize DS register with @DATA address
    MOV ES, AX                         ; Initialize ES register with @DATA address
    LEA DI, STR_VAL                    ; Point DI to string
    MOV AL, '$'                        ; Scan target character '$'
    MOV CX, 0FFFFH                     ; Set max scan count in CX
    CLD                                ; Clear direction flag (forward scan)
    REPNE SCASB                        ; Repeat scan byte until '$' is matched
    NOT CX                             ; Calculate scanned character count
    DEC CX                             ; Adjust count to ignore delimiter
    MOV STR_LEN, CX                    ; Save length in memory (6)
    MOV AX, 4C00H                      ; Load AH=4CH (exit) and AL=00H (return code 0)
    INT 21H                            ; Call DOS interrupt 21H to terminate program
MAIN ENDP                              ; End of procedure MAIN definition
END MAIN                               ; End of program module with MAIN entry point`,
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
    standardCode: `DATA_SEG SEGMENT                      ; Declare Data Segment to allocate string constant
    MSG DB 'HELLO FROM 8086 MICRO-COURSE$', 13, 10, '$' ; '$'-terminated string with CRLF
DATA_SEG ENDS                          ; End of Data Segment definition
CODE_SEG SEGMENT                       ; Declare Code Segment containing instructions
    ASSUME CS:CODE_SEG, DS:DATA_SEG    ; Map segment registers CS and DS to logical segments
START:                                 ; Program entry label
    MOV AX, DATA_SEG                   ; Load base address of Data Segment into AX
    MOV DS, AX                         ; Initialize DS register with DATA_SEG address
    LEA DX, MSG                        ; Load effective address of string MSG into DX register
    MOV AH, 09H                        ; Load DOS function 09H (Display '$'-terminated String)
    INT 21H                            ; Call DOS interrupt 21H to print string to stdout
    MOV AH, 4CH                        ; Load DOS service function 4CH (Exit)
    INT 21H                            ; Call DOS interrupt 21H to terminate program
CODE_SEG ENDS                          ; End of Code Segment definition
END START                              ; End of program with START entry point`,
    simplifiedCode: `.MODEL SMALL                          ; Specify small memory model for code and data
.DATA                                  ; Direct assembler to start Data Segment
    MSG DB 'HELLO FROM 8086 MICRO-COURSE$', 13, 10, '$' ; Display string
.CODE                                  ; Direct assembler to start Code Segment
MAIN PROC                              ; Declare start of procedure MAIN
    MOV AX, @DATA                      ; Load address of data segment into AX
    MOV DS, AX                         ; Initialize DS register with @DATA address
    LEA DX, MSG                        ; Point DX to string message
    MOV AH, 09H                        ; Select DOS service 09H (Print String)
    INT 21H                            ; Invoke DOS interrupt 21H to output string
    MOV AX, 4C00H                      ; Load AH=4CH (exit) and AL=00H (return code 0)
    INT 21H                            ; Call DOS interrupt 21H to terminate program
MAIN ENDP                              ; End of procedure MAIN definition
END MAIN                               ; End of program module with MAIN entry point`,
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
    standardCode: `DATA_SEG SEGMENT                      ; Declare Data Segment to allocate string variables
    STR1 DB 'HELLO'                    ; First 5-character string
    STR2 DB 'HELLO'                    ; Second 5-character string to compare
    LEN DW 5                           ; Length of strings to compare (N = 5)
    RESULT DB ?                        ; Output result: 00H = Equal, 01H = Unequal
DATA_SEG ENDS                          ; End of Data Segment definition
CODE_SEG SEGMENT                       ; Declare Code Segment containing instructions
    ASSUME CS:CODE_SEG, DS:DATA_SEG, ES:DATA_SEG ; Map CS, DS, and ES to appropriate segments
START:                                 ; Program entry label
    MOV AX, DATA_SEG                   ; Load base address of Data Segment into AX
    MOV DS, AX                         ; Initialize DS register with DATA_SEG address
    MOV ES, AX                         ; Initialize ES register with DATA_SEG address
    LEA SI, STR1                       ; Load Source Index SI with offset of STR1 (DS:SI)
    LEA DI, STR2                       ; Load Destination Index DI with offset of STR2 (ES:DI)
    MOV CX, LEN                        ; Load loop comparison counter CX with string length (5)
    CLD                                ; Clear Direction Flag DF = 0 for forward indexing
    REPE CMPSB                         ; Compare bytes [DS:SI] and [ES:DI] while equal and CX != 0
    JZ EQUAL                           ; If Zero Flag ZF = 1 (all bytes identical), jump to EQUAL
    MOV RESULT, 1                      ; Otherwise mismatch found: store 01H (Unequal) in RESULT
    JMP FINISH                         ; Jump over equal case to program exit
EQUAL:                                 ; Identical strings handler label
    MOV RESULT, 0                      ; Strings match: store 00H (Equal) in RESULT
FINISH:                                ; Program exit point label
    MOV AH, 4CH                        ; Load DOS service function 4CH (Exit)
    INT 21H                            ; Call DOS interrupt 21H to terminate program
CODE_SEG ENDS                          ; End of Code Segment definition
END START                              ; End of program with START entry point`,
    simplifiedCode: `.MODEL SMALL                          ; Specify small memory model for code and data
.DATA                                  ; Direct assembler to start Data Segment
    STR1 DB 'HELLO'                    ; First source string
    STR2 DB 'HELLO'                    ; Second source string
    LEN DW 5                           ; Comparison length N = 5
    RESULT DB ?                        ; Match flag: 0 = Equal, 1 = Unequal
.CODE                                  ; Direct assembler to start Code Segment
MAIN PROC                              ; Declare start of procedure MAIN
    MOV AX, @DATA                      ; Load address of data segment into AX
    MOV DS, AX                         ; Initialize DS register with @DATA address
    MOV ES, AX                         ; Initialize ES register with @DATA address
    LEA SI, STR1                       ; Point SI to first string
    LEA DI, STR2                       ; Point DI to second string
    MOV CX, LEN                        ; Set comparison counter CX = 5
    CLD                                ; Clear direction flag (forward string comparison)
    REPE CMPSB                         ; Compare bytes while matching
    JZ EQ                              ; If ZF == 1, jump to EQ (Strings Equal)
    MOV RESULT, 1                      ; Set RESULT = 1 (Strings Differ)
    JMP DONE                           ; Jump to DONE to bypass equal case
EQ:                                    ; Strings match label
    MOV RESULT, 0                      ; Set RESULT = 0 (Strings Equal)
DONE:                                  ; Program exit point label
    MOV AX, 4C00H                      ; Load AH=4CH (exit) and AL=00H (return code 0)
    INT 21H                            ; Call DOS interrupt 21H to terminate program
MAIN ENDP                              ; End of procedure MAIN definition
END MAIN                               ; End of program module with MAIN entry point`,
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
    standardCode: `DATA_SEG SEGMENT                      ; Declare Data Segment to allocate string buffers
    STR1 DB 'MADAM'                    ; Original 5-character string
    LEN DW 5                           ; Length of the string (N = 5)
    REV_STR DB 5 DUP (?)               ; 5-byte uninitialized buffer to store reversed string
    RESULT DB ?                        ; Output result: 00H = Palindrome, 01H = Not Palindrome
DATA_SEG ENDS                          ; End of Data Segment definition
CODE_SEG SEGMENT                       ; Declare Code Segment containing instructions
    ASSUME CS:CODE_SEG, DS:DATA_SEG, ES:DATA_SEG ; Map CS, DS, and ES to appropriate segments
START:                                 ; Program entry label
    MOV AX, DATA_SEG                   ; Load base address of Data Segment into AX
    MOV DS, AX                         ; Initialize DS register with DATA_SEG address
    MOV ES, AX                         ; Initialize ES register with DATA_SEG address
    ; --- Step 1: Reverse the string into REV_STR ---
    LEA SI, STR1                       ; Point SI to base address of STR1
    ADD SI, LEN                        ; Advance SI to one position past end of STR1
    DEC SI                             ; Decrement SI to point exactly to last character of STR1
    LEA DI, REV_STR                    ; Point DI to beginning of reversed buffer REV_STR
    MOV CX, LEN                        ; Set loop counter CX to string length (5)
REV_LOOP:                              ; Byte-by-byte reverse copy loop
    MOV AL, [SI]                       ; Fetch character from end of source string into AL
    MOV [DI], AL                       ; Write character to beginning of destination buffer
    DEC SI                             ; Move source pointer backward towards start
    INC DI                             ; Move destination pointer forward
    LOOP REV_LOOP                      ; Decrement CX; repeat copy until all characters copied
    ; --- Step 2: Compare original and reversed strings ---
    LEA SI, STR1                       ; Reset SI to start of original string STR1
    LEA DI, REV_STR                    ; Reset DI to start of reversed buffer REV_STR
    MOV CX, LEN                        ; Set comparison counter CX to string length (5)
    CLD                                ; Clear Direction Flag DF = 0 for forward comparison
    REPE CMPSB                         ; Compare bytes at DS:SI and ES:DI while equal
    JZ IS_PALIN                        ; If Zero Flag ZF = 1 (identical), string is Palindrome
    MOV RESULT, 1                      ; ZF = 0: store 01H (Not Palindrome) into RESULT
    JMP FINISH                         ; Jump over palindrome case to program exit
IS_PALIN:                              ; Palindrome match handler label
    MOV RESULT, 0                      ; Store 00H (Palindrome) into RESULT
FINISH:                                ; Program exit point label
    MOV AH, 4CH                        ; Load DOS service function 4CH (Exit)
    INT 21H                            ; Call DOS interrupt 21H to terminate program
CODE_SEG ENDS                          ; End of Code Segment definition
END START                              ; End of program with START entry point`,
    simplifiedCode: `.MODEL SMALL                          ; Specify small memory model for code and data
.DATA                                  ; Direct assembler to start Data Segment
    STR1 DB 'MADAM'                    ; Original string
    LEN DW 5                           ; Length of string N = 5
    REV_STR DB 5 DUP (?)               ; Buffer for reversed string
    RESULT DB ?                        ; Palindrome flag: 0 = Palindrome, 1 = Not Palindrome
.CODE                                  ; Direct assembler to start Code Segment
MAIN PROC                              ; Declare start of procedure MAIN
    MOV AX, @DATA                      ; Load address of data segment into AX
    MOV DS, AX                         ; Initialize DS register with @DATA address
    MOV ES, AX                         ; Initialize ES register with @DATA address
    ; --- Reverse string ---
    LEA SI, STR1                       ; Point SI to source string
    ADD SI, LEN                        ; Offset to end of string
    DEC SI                             ; Point SI to last character
    LEA DI, REV_STR                    ; Point DI to reversed destination
    MOV CX, LEN                        ; Set loop counter CX = 5
RLP:                                   ; Reverse copy loop label
    MOV AL, [SI]                       ; Read character from back of source
    MOV [DI], AL                       ; Store character to front of destination
    DEC SI                             ; Move source pointer backward
    INC DI                             ; Move destination pointer forward
    LOOP RLP                           ; Repeat for all characters
    ; --- Compare strings ---
    LEA SI, STR1                       ; Point SI to original string
    LEA DI, REV_STR                    ; Point DI to reversed string
    MOV CX, LEN                        ; Comparison counter CX = 5
    CLD                                ; Forward string comparison
    REPE CMPSB                         ; Compare characters while equal
    JZ ISP                             ; If equal, jump to ISP (Is Palindrome)
    MOV RESULT, 1                      ; Set RESULT = 1 (Not Palindrome)
    JMP DONE                           ; Bypass palindrome label
ISP:                                   ; Palindrome label
    MOV RESULT, 0                      ; Set RESULT = 0 (Palindrome)
DONE:                                  ; Program exit point label
    MOV AX, 4C00H                      ; Load AH=4CH (exit) and AL=00H (return code 0)
    INT 21H                            ; Call DOS interrupt 21H to terminate program
MAIN ENDP                              ; End of procedure MAIN definition
END MAIN                               ; End of program module with MAIN entry point`,
    bestPracticeTip: 'Always decrement source and increment destination pointers in your manual copy loop to achieve reversal.'
  },
  {
    id: 'exp_clock1',
    number: '5A',
    title: 'Digital Clock Design using INT 21H Interrupt',
    aim: 'Write an ALP to design a Digital Clock using 8086 processor (INT 21H).',
    directivesUsed: ['DB', 'EQU', 'SEGMENT', 'ENDS', 'ASSUME', 'PROC', 'ENDP'],
    algorithm: [
      'Initialize Data Segment and display application header prompt using INT 21H / AH=09H.',
      'Enter polling loop and check for keystroke interrupt via INT 21H / AH=0BH; exit if key is pressed.',
      'Read dynamic system time registers using DOS Interrupt INT 21H / AH=2CH (CH=Hours, CL=Minutes, DH=Seconds, DL=1/100s).',
      'Compare DH with cached PREV_SEC; if equal, skip redraw to eliminate console flicker.',
      'Unpack binary hours, minutes, and seconds into two-digit ASCII characters using AAM (divide by 10) and ADD AX, 3030H.',
      'Store unpacked ASCII characters into TIME_STR buffer ("HH:MM:SS$").',
      'Send carriage return (0DH) via INT 21H / AH=02H, display TIME_STR via INT 21H / AH=09H, and repeat loop.'
    ],
    standardCode: `DATA_SEG SEGMENT                      ; Declare Data Segment for time buffers and strings
    TIME_STR DB 'CURRENT TIME: 00:00:00$', 0DH, 0AH, '$' ; Formatted ASCII string buffer
    MSG_EXIT DB '=== 8086 DIGITAL CLOCK (INT 21H) ===', 0DH, 0AH, 'PRESS ANY KEY TO EXIT...', 0DH, 0AH, '$'
    PREV_SEC DB 0FFH                   ; Cache variable storing previous second to prevent flicker
DATA_SEG ENDS                          ; End of Data Segment definition

CODE_SEG SEGMENT                       ; Declare Code Segment containing instructions
    ASSUME CS:CODE_SEG, DS:DATA_SEG    ; Associate logical segments with segment registers
START:                                 ; Program entry point label
    MOV AX, DATA_SEG                   ; Load base address of Data Segment into AX
    MOV DS, AX                         ; Initialize DS register with DATA_SEG base address

    ; Display initial header prompt on console
    LEA DX, MSG_EXIT                   ; Load effective address of exit prompt into DX
    MOV AH, 09H                        ; Select DOS Function 09H (Display String terminated with $)
    INT 21H                            ; Call DOS Interrupt 21H to print prompt on screen

CLOCK_LOOP:                            ; Main polling loop for real-time clock refresh
    ; Check for user keypress (Non-blocking console status check)
    MOV AH, 0BH                        ; Select DOS Function 0BH (Check Standard Input Status)
    INT 21H                            ; Call INT 21H: Returns AL = 0FFH if key available, 00H if none
    CMP AL, 00H                        ; Compare AL with 00H (no key pressed)
    JNE EXIT_CLOCK                     ; If key pressed (AL != 0), jump to exit routine

    ; Read Real-Time Hardware Clock via MS-DOS INT 21H
    MOV AH, 2CH                        ; Select DOS Function 2CH (Get System Time)
    INT 21H                            ; Call INT 21H: Returns CH=Hours, CL=Minutes, DH=Seconds, DL=Hundredths

    ; Filter out redundant updates (Only refresh screen when second changes)
    CMP DH, PREV_SEC                   ; Compare current second in DH with cached PREV_SEC
    JE CLOCK_LOOP                      ; If second hasn't changed, loop back and poll keyboard again
    MOV PREV_SEC, DH                   ; Update cached second variable with new second value in DH

    ; Convert Binary Hours (CH) to ASCII Digits and store in string
    MOV AL, CH                         ; Copy binary hours (00-23) into AL
    CALL BIN_TO_ASCII                  ; Convert AL into two ASCII digits (AH=Tens, AL=Units)
    MOV TIME_STR[14], AH               ; Store Hours Tens digit into buffer offset 14
    MOV TIME_STR[15], AL               ; Store Hours Units digit into buffer offset 15

    ; Convert Binary Minutes (CL) to ASCII Digits and store in string
    MOV AL, CL                         ; Copy binary minutes (00-59) into AL
    CALL BIN_TO_ASCII                  ; Convert AL into two ASCII digits
    MOV TIME_STR[17], AH               ; Store Minutes Tens digit into buffer offset 17
    MOV TIME_STR[18], AL               ; Store Minutes Units digit into buffer offset 18

    ; Convert Binary Seconds (DH) to ASCII Digits and store in string
    MOV AL, DH                         ; Copy binary seconds (00-59) into AL
    CALL BIN_TO_ASCII                  ; Convert AL into two ASCII digits
    MOV TIME_STR[20], AH               ; Store Seconds Tens digit into buffer offset 20
    MOV TIME_STR[21], AL               ; Store Seconds Units digit into buffer offset 21

    ; Send carriage return to reposition console cursor to beginning of current line
    MOV DL, 0DH                        ; ASCII Carriage Return (CR = 0DH)
    MOV AH, 02H                        ; DOS Function 02H (Display Single Character)
    INT 21H                            ; Output carriage return to overwrite previous time string

    ; Render updated time string on console
    LEA DX, TIME_STR                   ; Load offset of updated time string into DX
    MOV AH, 09H                        ; DOS Function 09H (Display String)
    INT 21H                            ; Output time string "CURRENT TIME: HH:MM:SS" on console
    JMP CLOCK_LOOP                     ; Repeat loop for next second update

EXIT_CLOCK:                            ; Program exit routine
    MOV AH, 08H                        ; DOS Function 08H (Console Input without Echo) to clear key buffer
    INT 21H                            ; Flush the pressed key from keyboard buffer
    MOV AH, 4CH                        ; Select DOS Function 4CH (Terminate Process)
    MOV AL, 00H                        ; Return code 00H (Normal successful execution)
    INT 21H                            ; Terminate program and return control to DOS

; -------------------------------------------------------------
; SUBROUTINE: BIN_TO_ASCII
; Input:  AL = Unsigned Binary Byte (0 - 99)
; Output: AH = ASCII Tens Digit ('0'-'9'), AL = ASCII Units Digit ('0'-'9')
; -------------------------------------------------------------
BIN_TO_ASCII PROC                      ; Procedure declaration
    MOV AH, 00H                        ; Clear high byte AH to prepare AX for division
    AAM                                ; ASCII Adjust for Multiplication: AH = AL / 10, AL = AL mod 10
    ADD AX, 3030H                      ; Convert unpacked BCD digits in AH & AL to ASCII by adding '0' (30H)
    RET                                ; Return from subroutine to caller
BIN_TO_ASCII ENDP                      ; End of procedure

CODE_SEG ENDS                          ; End of Code Segment
END START                              ; End of assembly module with START entry point`,
    simplifiedCode: `.MODEL SMALL                          ; Define small memory model (64KB code, 64KB data)
.STACK 100H                            ; Allocate 256 bytes of stack space
.DATA                                  ; Start Data Segment
    TIME_STR DB 'CURRENT TIME: 00:00:00$', 0DH, 0AH, '$' ; Formatted time string
    MSG_EXIT DB 'PRESS ANY KEY TO EXIT DIGITAL CLOCK...', 0DH, 0AH, '$'
    PREV_SEC DB 0FFH                   ; Cached previous second value
.CODE                                  ; Start Code Segment
MAIN PROC                              ; Declare start of procedure MAIN
    MOV AX, @DATA                      ; Load base address of Data Segment
    MOV DS, AX                         ; Initialize DS register

    LEA DX, MSG_EXIT                   ; Load address of exit message
    MOV AH, 09H                        ; Print String function
    INT 21H                            ; Display prompt

POLL_TIME:
    MOV AH, 0BH                        ; Check Keyboard Status
    INT 21H                            ; Returns AL=0FFH if key pressed, 00H if none
    CMP AL, 00H
    JNE QUIT

    MOV AH, 2CH                        ; Get System Time via DOS INT 21H
    INT 21H                            ; CH=Hours, CL=Minutes, DH=Seconds, DL=Hundredths

    CMP DH, PREV_SEC                   ; Compare current seconds with previous seconds
    JE POLL_TIME                       ; Skip redraw if within same second
    MOV PREV_SEC, DH                   ; Update cached second

    ; Convert Hours (CH)
    MOV AL, CH
    MOV AH, 00H
    AAM
    ADD AX, 3030H
    MOV TIME_STR[14], AH
    MOV TIME_STR[15], AL

    ; Convert Minutes (CL)
    MOV AL, CL
    MOV AH, 00H
    AAM
    ADD AX, 3030H
    MOV TIME_STR[17], AH
    MOV TIME_STR[18], AL

    ; Convert Seconds (DH)
    MOV AL, DH
    MOV AH, 00H
    AAM
    ADD AX, 3030H
    MOV TIME_STR[20], AH
    MOV TIME_STR[21], AL

    ; Move cursor to start of line using carriage return (CR)
    MOV DL, 0DH
    MOV AH, 02H
    INT 21H

    ; Display updated time string
    LEA DX, TIME_STR
    MOV AH, 09H
    INT 21H
    JMP POLL_TIME

QUIT:
    MOV AH, 08H                        ; Read key to flush buffer
    INT 21H
    MOV AX, 4C00H                      ; Terminate Program
    INT 21H
MAIN ENDP
END MAIN`,
    bestPracticeTip: 'Using AAM (ASCII Adjust for Multiplication) on a byte in AL automatically divides by 10, placing the tens digit in AH and units digit in AL in a single clock cycle.'
  },
  {
    id: 'exp_clock2',
    number: '5B',
    title: 'Digital Clock Design using DOS Interrupt Functions',
    aim: 'Write an ALP to design a Digital Clock using DOS Interrupt Functions.',
    directivesUsed: ['DB', 'DW', 'SEGMENT', 'ENDS', 'ASSUME', 'PROC', 'ENDP'],
    algorithm: [
      'Initialize Data Segment and clear screen console window using BIOS Video INT 10H / AH=06H.',
      'Position cursor at Row 2, Col 18 via INT 10H / AH=02H and display banner title via INT 21H / AH=09H.',
      'Read System Calendar Date via DOS INT 21H / AH=2AH (CX=Year, DH=Month, DL=Day) and format into DATE_STR ("DD/MM/YYYY").',
      'Enter continuous clock run loop and poll keyboard status via INT 21H / AH=0BH.',
      'Read dynamic System Time via DOS INT 21H / AH=2CH (CH=Hours, CL=Minutes, DH=Seconds).',
      'Convert 24-hour binary hours into 12-hour format: subtract 12 if Hours > 12, set AM/PM suffix indicator.',
      'Unpack hours, minutes, and seconds into ASCII digits and store into TIME_STR buffer.',
      'Set cursor to center screen (Row 10, Col 18) via INT 10H / AH=02H and display formatted Date & Time string.'
    ],
    standardCode: `DATA_SEG SEGMENT                      ; Declare Data Segment for clock & date variables
    DATE_STR DB 'DATE: 00/00/0000  |  ' ; Formatted Date string prefix
    TIME_STR DB 'TIME: 00:00:00 AM$'    ; Formatted 12-Hour Time string with AM/PM
    MSG_HDR  DB '=== 8086 DOS DIGITAL CLOCK & CALENDAR ===', 0DH, 0AH, '$'
    MSG_FOOT DB 'PRESS [ENTER] TO STOP CLOCK...', 0DH, 0AH, '$'
    PREV_SEC DB 0FFH                   ; Previous second tracker
DATA_SEG ENDS

CODE_SEG SEGMENT
    ASSUME CS:CODE_SEG, DS:DATA_SEG
START:
    MOV AX, DATA_SEG                   ; Load base address of Data Segment into AX
    MOV DS, AX                         ; Initialize DS register

    ; Clear Screen using BIOS Video Interrupt 10H (Function 06H)
    MOV AH, 06H                        ; BIOS Scroll / Clear Screen Function
    MOV AL, 00H                        ; AL = 0 clears the whole window
    MOV BH, 1FH                        ; Attribute: White text on Blue background (1FH)
    MOV CX, 0000H                      ; Upper left corner (Row 0, Col 0)
    MOV DX, 184FH                      ; Lower right corner (Row 24, Col 79)
    INT 10H                            ; Call BIOS Video Interrupt to clear screen

    ; Position cursor at Row 2, Col 18 for Title Header
    MOV AH, 02H                        ; BIOS Set Cursor Position Function
    MOV BH, 00H                        ; Video Page 0
    MOV DH, 02H                        ; Row 2
    MOV DL, 12H                        ; Column 18
    INT 10H                            ; Set cursor
    LEA DX, MSG_HDR                    ; Load Header message
    MOV AH, 09H                        ; DOS Print String
    INT 21H

    ; Read System Calendar Date using DOS INT 21H / Function 2AH
    MOV AH, 2AH                        ; DOS Function 2AH: Get System Date
    INT 21H                            ; Returns: CX=Year (e.g. 2026), DH=Month (1-12), DL=Day (1-31)

    ; Convert Day (DL) to ASCII
    MOV AL, DL                         ; Load Day into AL
    CALL BYTE_TO_ASCII                 ; Convert to ASCII in AX (AH=Tens, AL=Units)
    MOV DATE_STR[6], AH                ; Store Day Tens
    MOV DATE_STR[7], AL                ; Store Day Units

    ; Convert Month (DH) to ASCII
    MOV AL, DH                         ; Load Month into AL
    CALL BYTE_TO_ASCII                 ; Convert to ASCII in AX
    MOV DATE_STR[9], AH                ; Store Month Tens
    MOV DATE_STR[10], AL               ; Store Month Units

    ; Convert Year (CX = 2026) to 4-digit ASCII
    MOV AX, CX                         ; Load 16-bit Year into AX
    MOV BL, 100                        ; Divide year by 100 to separate century (20) and year (26)
    DIV BL                             ; AL = Century (20), AH = Year (26)
    MOV BH, AH                         ; Preserve 2-digit Year (26) in BH
    CALL BYTE_TO_ASCII                 ; Convert Century (20) to ASCII
    MOV DATE_STR[12], AH               ; Store Millennium digit '2'
    MOV DATE_STR[13], AL               ; Store Century digit '0'
    MOV AL, BH                         ; Restore Year (26) into AL
    CALL BYTE_TO_ASCII                 ; Convert Decade/Year (26) to ASCII
    MOV DATE_STR[14], AH               ; Store Decade digit '2'
    MOV DATE_STR[15], AL               ; Store Year digit '6'

CLOCK_RUN:
    ; Check for user keypress (DOS INT 21H / Function 0BH)
    MOV AH, 0BH                        ; Check Keyboard Status
    INT 21H
    CMP AL, 00H
    JNE QUIT_APP

    ; Read System Time using DOS INT 21H / Function 2CH
    MOV AH, 2CH                        ; DOS Function 2CH: Get System Time
    INT 21H                            ; Returns: CH=Hours (0-23), CL=Minutes (0-59), DH=Seconds (0-59)

    ; Prevent unnecessary screen flicker by updating only when second increments
    CMP DH, PREV_SEC
    JE CLOCK_RUN
    MOV PREV_SEC, DH

    ; Determine 12-Hour AM / PM Format
    MOV AL, CH                         ; AL = Hours in 24-hour format (00 - 23)
    MOV TIME_STR[15], 'A'              ; Default to 'A' for AM
    MOV TIME_STR[16], 'M'              ; Default to 'M'
    CMP AL, 12                         ; Compare hour with 12
    JB FORMAT_HR                       ; If hour < 12, it is AM, proceed to format
    MOV TIME_STR[15], 'P'              ; Else set 'P' for PM
    JE FORMAT_HR                       ; If hour == 12, keep 12 PM
    SUB AL, 12                         ; If hour > 12, subtract 12 (e.g. 14 - 12 = 2 PM)

FORMAT_HR:
    CMP AL, 00H                        ; Check if hour is midnight (00)
    JNE HR_CONV
    MOV AL, 12                         ; Convert 00 to 12 AM

HR_CONV:
    CALL BYTE_TO_ASCII                 ; Convert Hour in AL to ASCII
    MOV TIME_STR[6], AH                ; Store Hour Tens
    MOV TIME_STR[7], AL                ; Store Hour Units

    ; Convert Minutes (CL) to ASCII
    MOV AL, CL                         ; Load Minutes
    CALL BYTE_TO_ASCII
    MOV TIME_STR[9], AH                ; Store Minute Tens
    MOV TIME_STR[10], AL               ; Store Minute Units

    ; Convert Seconds (DH) to ASCII
    MOV AL, DH                         ; Load Seconds
    CALL BYTE_TO_ASCII
    MOV TIME_STR[12], AH               ; Store Second Tens
    MOV TIME_STR[13], AL               ; Store Second Units

    ; Set Cursor to Center Screen (Row 10, Col 18)
    MOV AH, 02H                        ; BIOS Set Cursor
    MOV BH, 00H                        ; Page 0
    MOV DH, 0AH                        ; Row 10
    MOV DL, 12H                        ; Column 18
    INT 10H

    ; Display Combined Date and 12-Hour Time String
    LEA DX, DATE_STR                   ; Print Date string buffer
    MOV AH, 09H                        ; DOS Print String
    INT 21H
    LEA DX, TIME_STR                   ; Print Time string buffer
    MOV AH, 09H
    INT 21H
    JMP CLOCK_RUN                      ; Loop continuously

QUIT_APP:
    MOV AH, 08H                        ; Clear keystroke
    INT 21H
    MOV AX, 4C00H                      ; Terminate to DOS
    INT 21H

BYTE_TO_ASCII PROC
    MOV AH, 00H
    AAM
    ADD AX, 3030H
    RET
BYTE_TO_ASCII ENDP

CODE_SEG ENDS
END START`,
    simplifiedCode: `.MODEL SMALL
.STACK 100H
.DATA
    DATE_STR DB 'DATE: 00/00/0000  |  '
    TIME_STR DB 'TIME: 00:00:00 AM$'
    PREV_SEC DB 0FFH
.CODE
MAIN PROC
    MOV AX, @DATA
    MOV DS, AX

    ; Read System Date (INT 21H / AH=2AH)
    MOV AH, 2AH
    INT 21H                            ; CX=Year, DH=Month, DL=Day

    ; Format Day, Month, Year into DATE_STR
    MOV AL, DL
    CALL NUM_TO_ASCII
    MOV DATE_STR[6], AH
    MOV DATE_STR[7], AL

    MOV AL, DH
    CALL NUM_TO_ASCII
    MOV DATE_STR[9], AH
    MOV DATE_STR[10], AL

    MOV AX, CX
    MOV BL, 100
    DIV BL
    MOV BH, AH
    CALL NUM_TO_ASCII
    MOV DATE_STR[12], AH
    MOV DATE_STR[13], AL
    MOV AL, BH
    CALL NUM_TO_ASCII
    MOV DATE_STR[14], AH
    MOV DATE_STR[15], AL

MAIN_LOOP:
    ; Keystroke poll
    MOV AH, 0BH
    INT 21H
    CMP AL, 00H
    JNE FINISH

    ; Read System Time (INT 21H / AH=2CH)
    MOV AH, 2CH
    INT 21H

    CMP DH, PREV_SEC
    JE MAIN_LOOP
    MOV PREV_SEC, DH

    ; 12-Hour AM/PM conversion
    MOV AL, CH
    MOV TIME_STR[15], 'A'
    CMP AL, 12
    JB SET_HR
    MOV TIME_STR[15], 'P'
    JE SET_HR
    SUB AL, 12
SET_HR:
    CMP AL, 0
    JNE CONV_HR
    MOV AL, 12
CONV_HR:
    CALL NUM_TO_ASCII
    MOV TIME_STR[6], AH
    MOV TIME_STR[7], AL

    MOV AL, CL
    CALL NUM_TO_ASCII
    MOV TIME_STR[9], AH
    MOV TIME_STR[10], AL

    MOV AL, DH
    CALL NUM_TO_ASCII
    MOV TIME_STR[12], AH
    MOV TIME_STR[13], AL

    ; Move cursor and print
    MOV DL, 0DH
    MOV AH, 02H
    INT 21H

    LEA DX, DATE_STR
    MOV AH, 09H
    INT 21H
    LEA DX, TIME_STR
    MOV AH, 09H
    INT 21H
    JMP MAIN_LOOP

FINISH:
    MOV AH, 08H
    INT 21H
    MOV AX, 4C00H
    INT 21H
MAIN ENDP

NUM_TO_ASCII PROC
    MOV AH, 00H
    AAM
    ADD AX, 3030H
    RET
NUM_TO_ASCII ENDP
END MAIN`,
    bestPracticeTip: 'Combining DOS INT 21H Function 2AH (System Date) and Function 2CH (System Time) provides complete real-time clock and calendar capability in a single program.'
  },
  {
    id: 'exp_clock3',
    number: '5C',
    title: 'Digital Clock Design by Reading System Time',
    aim: 'Write an ALP to design a Digital Clock by reading System Time.',
    directivesUsed: ['DB', 'EQU', 'SEGMENT', 'ENDS', 'ASSUME', 'PROC', 'ENDP'],
    algorithm: [
      'Initialize Data Segment and clear the console screen with light gray on black attribute using BIOS Video INT 10H / AH=06H.',
      'Display top application header banner and bottom status prompt using DOS INT 21H / AH=09H.',
      'Initialize PREV_SEC to 0FFH and BLINK_ON state to 01H.',
      'Enter active sampling loop and query keyboard buffer via DOS INT 21H / AH=0BH; break if key pressed.',
      'Read system real-time clock via DOS INT 21H / AH=2CH (CH=Hours, CL=Minutes, DH=Seconds, DL=Hundredths).',
      'Compare DH with PREV_SEC; if DH == PREV_SEC, branch back to sampling loop to save CPU cycles.',
      'Update PREV_SEC = DH and invert BLINK_ON flag (XOR BLINK_ON, 01H) to animate blinking colon separators (":" vs " ").',
      'Unpack Hours, Minutes, Seconds, and Hundredths of a second into ASCII BCD characters.',
      'Position cursor at Row 8, Col 12 and print the updated DIGIT_BOX string buffer on screen.'
    ],
    standardCode: `DATA_SEG SEGMENT                      ; Declare Data Segment for real-time clock buffers
    BANNER   DB '==================================================', 0DH, 0AH
             DB '   8086 REAL-TIME CONTINUOUS SYSTEM CLOCK DISPLAY  ', 0DH, 0AH
             DB '==================================================$', 0DH, 0AH
    DIGIT_BOX DB '      +--------------------------------+          ', 0DH, 0AH
              DB '      |   SYSTEM TIME:   00:00:00.00   |          ', 0DH, 0AH
              DB '      +--------------------------------+$'
    FOOTER    DB 0DH, 0AH, 'STATUS: RUNNING [PRESS ANY KEY TO EXIT DOSBOX]$'
    PREV_SEC  DB 0FFH                  ; Track previous second tick
    BLINK_ON  DB 01H                   ; Colon blink toggle state (1=Visible, 0=Space)
DATA_SEG ENDS

CODE_SEG SEGMENT
    ASSUME CS:CODE_SEG, DS:DATA_SEG
START:
    MOV AX, DATA_SEG                   ; Load base address of Data Segment
    MOV DS, AX                         ; Initialize DS register

    ; Clear Screen and initialize background (INT 10H / AH=06H)
    MOV AH, 06H                        ; Clear window function
    MOV AL, 00H                        ; Clear entire screen
    MOV BH, 07H                        ; Standard light gray on black attribute
    MOV CX, 0000H                      ; Upper Left (0,0)
    MOV DX, 184FH                      ; Lower Right (24,79)
    INT 10H                            ; Execute BIOS Video Interrupt

    ; Print Banner at Top (Row 4, Col 12)
    MOV AH, 02H                        ; Set cursor
    MOV BH, 00H                        ; Page 0
    MOV DH, 04H                        ; Row 4
    MOV DL, 0CH                        ; Col 12
    INT 10H
    LEA DX, BANNER                     ; Output header banner
    MOV AH, 09H                        ; DOS Print String
    INT 21H

    ; Print Footer Prompt (Row 14, Col 12)
    MOV AH, 02H
    MOV BH, 00H
    MOV DH, 0EH                        ; Row 14
    MOV DL, 0CH                        ; Col 12
    INT 10H
    LEA DX, FOOTER
    MOV AH, 09H
    INT 21H

CLOCK_ACTIVE_LOOP:
    ; Non-blocking keyboard check via DOS INT 21H / AH=0BH
    MOV AH, 0BH                        ; Check Keyboard Buffer Status
    INT 21H                            ; AL=00H (no key), AL=FFH (key waiting)
    CMP AL, 00H                        ; Check if key is available
    JNE SHUTDOWN_CLOCK                 ; If key pressed, break loop and terminate

    ; Read Dynamic System Time via DOS INT 21H / AH=2CH
    MOV AH, 2CH                        ; Get System Time
    INT 21H                            ; CH=Hours, CL=Minutes, DH=Seconds, DL=Hundredths of second

    ; Compare second register DH with cached PREV_SEC to avoid redundant redraws
    CMP DH, PREV_SEC
    JE CLOCK_ACTIVE_LOOP               ; If within the same second, wait for next tick
    MOV PREV_SEC, DH                   ; Update cached second variable

    ; Toggle blinking colon separator on every new second tick
    XOR BLINK_ON, 01H                  ; Invert toggle state (0 -> 1, 1 -> 0)
    CMP BLINK_ON, 01H
    JE SET_COLON
    MOV BL, ' '                        ; Blank space for colon when off
    JMP STORE_SEPARATORS
SET_COLON:
    MOV BL, ':'                        ; Colon symbol when on
STORE_SEPARATORS:
    MOV DIGIT_BOX[80], BL              ; Update colon between Hours & Minutes (offset 80)
    MOV DIGIT_BOX[83], BL              ; Update colon between Minutes & Seconds (offset 83)

    ; Convert Hours (CH) to 2-Digit ASCII
    MOV AL, CH                         ; Load binary hours (0-23)
    CALL BCD_CONVERT                   ; Convert to ASCII (AH=Tens, AL=Units)
    MOV DIGIT_BOX[78], AH              ; Store Hours Tens digit in box
    MOV DIGIT_BOX[79], AL              ; Store Hours Units digit in box

    ; Convert Minutes (CL) to 2-Digit ASCII
    MOV AL, CL                         ; Load binary minutes (0-59)
    CALL BCD_CONVERT
    MOV DIGIT_BOX[81], AH              ; Store Minutes Tens digit
    MOV DIGIT_BOX[82], AL              ; Store Minutes Units digit

    ; Convert Seconds (DH) to 2-Digit ASCII
    MOV AL, DH                         ; Load binary seconds (0-59)
    CALL BCD_CONVERT
    MOV DIGIT_BOX[84], AH              ; Store Seconds Tens digit
    MOV DIGIT_BOX[85], AL              ; Store Seconds Units digit

    ; Convert Hundredths of a Second (DL) to 2-Digit ASCII
    MOV AL, DL                         ; Load hundredths (0-99)
    CALL BCD_CONVERT
    MOV DIGIT_BOX[87], AH              ; Store Hundredths Tens digit
    MOV DIGIT_BOX[88], AL              ; Store Hundredths Units digit

    ; Set Cursor to Center Box (Row 8, Col 12)
    MOV AH, 02H                        ; Set cursor position
    MOV BH, 00H                        ; Video page 0
    MOV DH, 08H                        ; Row 8
    MOV DL, 0CH                        ; Col 12
    INT 10H

    ; Refresh Digit Box on console
    LEA DX, DIGIT_BOX                  ; Point DX to DIGIT_BOX string
    MOV AH, 09H                        ; DOS Print String
    INT 21H
    JMP CLOCK_ACTIVE_LOOP              ; Repeat clock cycle

SHUTDOWN_CLOCK:
    MOV AH, 08H                        ; Read key to clear buffer
    INT 21H
    MOV AX, 4C00H                      ; Terminate Program cleanly
    INT 21H

; -------------------------------------------------------------
; SUBROUTINE: BCD_CONVERT
; Unpacks binary byte in AL into two ASCII characters in AH:AL
; -------------------------------------------------------------
BCD_CONVERT PROC
    MOV AH, 00H
    AAM                                ; AL/10 -> AH=Tens, AL=Units
    ADD AX, 3030H                      ; Convert to ASCII
    RET
BCD_CONVERT ENDP

CODE_SEG ENDS
END START`,
    simplifiedCode: `.MODEL SMALL
.STACK 100H
.DATA
    HEADER   DB '=== 8086 REAL-TIME CLOCK ===', 0DH, 0AH, '$'
    TIME_BOX DB 'TIME: 00:00:00.00$', 0DH, 0AH, '$'
    PREV_SEC DB 0FFH
.CODE
MAIN PROC
    MOV AX, @DATA
    MOV DS, AX

    LEA DX, HEADER
    MOV AH, 09H
    INT 21H

CLOCK_POLL:
    ; Keystroke poll
    MOV AH, 0BH
    INT 21H
    CMP AL, 00H
    JNE END_CLOCK

    ; Read Time
    MOV AH, 2CH
    INT 21H

    CMP DH, PREV_SEC
    JE CLOCK_POLL
    MOV PREV_SEC, DH

    ; Convert Hours, Minutes, Seconds, Hundredths
    MOV AL, CH
    CALL SPLIT_BCD
    MOV TIME_BOX[6], AH
    MOV TIME_BOX[7], AL

    MOV AL, CL
    CALL SPLIT_BCD
    MOV TIME_BOX[9], AH
    MOV TIME_BOX[10], AL

    MOV AL, DH
    CALL SPLIT_BCD
    MOV TIME_BOX[12], AH
    MOV TIME_BOX[13], AL

    MOV AL, DL
    CALL SPLIT_BCD
    MOV TIME_BOX[15], AH
    MOV TIME_BOX[16], AL

    ; Reposition to start of line
    MOV DL, 0DH
    MOV AH, 02H
    INT 21H

    LEA DX, TIME_BOX
    MOV AH, 09H
    INT 21H
    JMP CLOCK_POLL

END_CLOCK:
    MOV AH, 08H
    INT 21H
    MOV AX, 4C00H
    INT 21H
MAIN ENDP

SPLIT_BCD PROC
    MOV AH, 00H
    AAM
    ADD AX, 3030H
    RET
SPLIT_BCD ENDP
END MAIN`,
    bestPracticeTip: 'Caching the previous second (PREV_SEC) ensures the program only redraws the console string when a real second transition occurs, eliminating flickering and saving massive CPU cycles.'
  },
  {
    id: 'exp_stepper1',
    number: '6A',
    title: 'Interfacing Stepper Motor with 8086 – Clockwise Rotation with Variable Step-Size',
    aim: 'Write an ALP to Interface a stepper motor and operate it in clockwise by choosing variable step-size.',
    directivesUsed: ['DB', 'DW', 'EQU', 'SEGMENT', 'ENDS', 'ASSUME', 'PROC', 'ENDP'],
    algorithm: [
      'Configure 8255 PPI Control Word Register (CWR) with 80H (Port A, B, and C as Mode 0 Output).',
      'Define 2-phase full-step excitation sequence table in memory for Clockwise (CW) rotation: 09H, 0AH, 06H, 05H (or 03H, 06H, 0CH, 09H).',
      'Load the user-specified step count (e.g., CX = 200 for 360° rotation with 1.8° step angle, CX = 100 for 180°, CX = 50 for 90°).',
      'Fetch the next phase excitation code from the CW lookup table into AL register.',
      'Output the excitation byte to 8255 Port A (Address 00C0H) via OUT DX, AL to energize the motor stator coils.',
      'Call software delay subroutine to allow the motor rotor sufficient settling time to complete the step.',
      'Increment index pointer to the next phase step code; wrap around after 4 steps.',
      'Decrement total step count CX; repeat loop until all requested steps are completed.'
    ],
    standardCode: `DATA_SEG SEGMENT                      ; Declare Data Segment for stepper motor excitation patterns
    PORT_A    EQU 00C0H                ; 8255 PPI Port A I/O port address
    CWR_PORT  EQU 00C6H                ; 8255 PPI Control Word Register address
    CW_TABLE  DB 09H, 0AH, 06H, 05H    ; Clockwise 2-phase full-step excitation sequence (AB, BC, CD, DA)
    STEP_COUNT DW 00C8H                ; Total variable steps (200 decimal = 360 degrees for 1.8-deg motor)
    DELAY_VAL DW 0FFFFH                ; Software delay count for motor speed / RPM control
DATA_SEG ENDS                          ; End of Data Segment definition

CODE_SEG SEGMENT                       ; Declare Code Segment containing instructions
    ASSUME CS:CODE_SEG, DS:DATA_SEG    ; Map CS and DS registers
START:                                 ; Program entry point
    MOV AX, DATA_SEG                   ; Load base address of Data Segment into AX
    MOV DS, AX                         ; Initialize DS register

    ; Step 1: Initialize 8255 PPI Control Word (Mode 0, All Output Ports)
    MOV DX, CWR_PORT                   ; Load 8255 Control Word Register address into DX
    MOV AL, 80H                        ; Control word 80H: Active Mode 0, Port A, B, C configured as Outputs
    OUT DX, AL                         ; Send control word to 8255 CWR

    ; Step 2: Load Variable Step Count and Initialize Pointers
    MOV CX, STEP_COUNT                 ; Load loop counter CX with target variable step count

CW_CYCLE:                              ; Main rotation cycle loop
    LEA SI, CW_TABLE                   ; Point SI to start of Clockwise excitation table
    MOV BX, 4                          ; 4 steps per full electrical commutation cycle

STEP_LOOP:
    MOV AL, [SI]                       ; Fetch current phase excitation code from table
    MOV DX, PORT_A                     ; Load Port A I/O address into DX
    OUT DX, AL                         ; Send step code to Port A (energizes motor coils via ULN2003)

    CALL DELAY_ROUTINE                 ; Call software delay subroutine for mechanical settling

    INC SI                             ; Point to next step code in sequence
    DEC CX                             ; Decrement remaining step counter
    JZ EXIT_PROGRAM                    ; If target step count reached (CX = 0), exit

    DEC BX                             ; Decrement 4-phase commutation cycle counter
    JNZ STEP_LOOP                      ; If cycle not finished, output next phase code
    JMP CW_CYCLE                       ; Repeat next 4-step sequence until CX = 0

EXIT_PROGRAM:
    MOV AH, 4CH                        ; Select DOS Function 4CH (Terminate Process)
    INT 21H                            ; Call DOS Interrupt 21H to return control

; Software Delay Subroutine for Stepper Speed Regulation
DELAY_ROUTINE PROC
    PUSH CX                            ; Preserve step counter CX on stack
    MOV CX, DELAY_VAL                  ; Load software delay constant into CX
D_LOOP:
    NOP                                ; 3 T-states delay padding
    NOP                                ; 3 T-states delay padding
    LOOP D_LOOP                        ; Decrement CX and loop until zero
    POP CX                             ; Restore step counter CX
    RET                                ; Return to caller
DELAY_ROUTINE ENDP

CODE_SEG ENDS                          ; End of Code Segment definition
END START                              ; End of program module`,
    simplifiedCode: `.MODEL SMALL                          ; Small memory model for code and data
.DATA                                  ; Start Data Segment
    PORT_A    EQU 00C0H                ; 8255 PPI Port A Address
    CWR_PORT  EQU 00C6H                ; 8255 PPI Control Word Register Address
    CW_TABLE  DB 09H, 0AH, 06H, 05H    ; 4-Step Clockwise Excitation Lookup Table
    STEPS     DW 200                   ; Variable step-size (200 steps = 360 deg)
    SPEED_DLY DW 0FFFFH                ; Speed regulation delay loop count
.CODE                                  ; Start Code Segment
MAIN PROC
    MOV AX, @DATA                      ; Initialize DS
    MOV DS, AX

    ; Initialize 8255 PPI: Control Word = 80H (Port A as Output)
    MOV DX, CWR_PORT
    MOV AL, 80H
    OUT DX, AL

    ; Rotate Stepper Clockwise for specified variable steps
    MOV CX, STEPS                      ; Load total variable step size
ROT_CW:
    LEA SI, CW_TABLE                   ; Reset table pointer
    MOV BX, 4                          ; 4 steps per sequence
NEXT_CW:
    MOV AL, [SI]                       ; Get step pattern
    MOV DX, PORT_A                     ; Output to Port A
    OUT DX, AL
    CALL DELAY                         ; Delay for motor movement
    INC SI                             ; Next step pattern
    DEC CX                             ; Decrement remaining step count
    JZ DONE_CW
    DEC BX
    JNZ NEXT_CW
    JMP ROT_CW

DONE_CW:
    MOV AX, 4C00H                      ; Terminate cleanly
    INT 21H
MAIN ENDP

DELAY PROC
    PUSH CX
    MOV CX, SPEED_DLY
DLY1:
    LOOP DLY1
    POP CX
    RET
DELAY ENDP
END MAIN`,
    bestPracticeTip: 'Always configure the 8255 Control Word Register (80H) prior to sending step patterns, and provide adequate software delay (10-50 ms) to prevent rotor slippage.'
  },
  {
    id: 'exp_stepper2',
    number: '6B',
    title: 'Interfacing Stepper Motor with 8086 – Anti-Clockwise Rotation with Variable Step-Size',
    aim: 'Write an ALP to Interface a stepper motor and operate it in Anti-clockwise by choosing variable step-size.',
    directivesUsed: ['DB', 'DW', 'EQU', 'SEGMENT', 'ENDS', 'ASSUME', 'PROC', 'ENDP'],
    algorithm: [
      'Configure 8255 PPI Control Word Register (CWR) with 80H (Port A, B, and C as Mode 0 Output).',
      'Define 2-phase full-step excitation sequence table in reverse order for Anti-Clockwise (CCW) rotation: 05H, 06H, 0AH, 09H (or 09H, 0CH, 06H, 03H).',
      'Load the user-specified step count (e.g., CX = 200 for 360° rotation with 1.8° step angle, CX = 100 for 180°, CX = 50 for 90°).',
      'Fetch the next phase excitation code from the CCW lookup table into AL register.',
      'Output the excitation byte to 8255 Port A (Address 00C0H) via OUT DX, AL to energize the motor stator coils in reverse sequence.',
      'Call software delay subroutine to allow the motor rotor sufficient settling time to complete the step.',
      'Increment index pointer to the next phase step code; wrap around after 4 steps.',
      'Decrement total step count CX; repeat loop until all requested steps are completed.'
    ],
    standardCode: `DATA_SEG SEGMENT                      ; Declare Data Segment for CCW excitation patterns
    PORT_A    EQU 00C0H                ; 8255 PPI Port A I/O port address
    CWR_PORT  EQU 00C6H                ; 8255 PPI Control Word Register address
    CCW_TABLE DB 05H, 06H, 0AH, 09H    ; Anti-Clockwise 2-phase excitation sequence (DA, CD, BC, AB)
    STEP_COUNT DW 00C8H                ; Total variable steps (200 decimal = 360 degrees CCW)
    DELAY_VAL DW 0FFFFH                ; Software delay count for motor speed / RPM control
DATA_SEG ENDS                          ; End of Data Segment definition

CODE_SEG SEGMENT                       ; Declare Code Segment containing instructions
    ASSUME CS:CODE_SEG, DS:DATA_SEG    ; Map CS and DS registers
START:                                 ; Program entry point
    MOV AX, DATA_SEG                   ; Load base address of Data Segment into AX
    MOV DS, AX                         ; Initialize DS register

    ; Step 1: Initialize 8255 PPI Control Word (Mode 0, All Output Ports)
    MOV DX, CWR_PORT                   ; Load 8255 Control Word Register address into DX
    MOV AL, 80H                        ; Control word 80H: Active Mode 0, Port A, B, C configured as Outputs
    OUT DX, AL                         ; Send control word to 8255 CWR

    ; Step 2: Load Variable Step Count and Initialize Pointers
    MOV CX, STEP_COUNT                 ; Load loop counter CX with target variable step count

CCW_CYCLE:                             ; Main anti-clockwise rotation cycle loop
    LEA SI, CCW_TABLE                  ; Point SI to start of Anti-Clockwise excitation table
    MOV BX, 4                          ; 4 steps per full electrical commutation cycle

STEP_LOOP:
    MOV AL, [SI]                       ; Fetch current CCW phase excitation code from table
    MOV DX, PORT_A                     ; Load Port A I/O address into DX
    OUT DX, AL                         ; Send step code to Port A (energizes motor coils via ULN2003)

    CALL DELAY_ROUTINE                 ; Call software delay subroutine for mechanical settling

    INC SI                             ; Point to next step code in CCW sequence
    DEC CX                             ; Decrement remaining step counter
    JZ EXIT_PROGRAM                    ; If target step count reached (CX = 0), exit

    DEC BX                             ; Decrement 4-phase commutation cycle counter
    JNZ STEP_LOOP                      ; If cycle not finished, output next phase code
    JMP CCW_CYCLE                      ; Repeat next 4-step sequence until CX = 0

EXIT_PROGRAM:
    MOV AH, 4CH                        ; Select DOS Function 4CH (Terminate Process)
    INT 21H                            ; Call DOS Interrupt 21H to return control

; Software Delay Subroutine for Stepper Speed Regulation
DELAY_ROUTINE PROC
    PUSH CX                            ; Preserve step counter CX on stack
    MOV CX, DELAY_VAL                  ; Load software delay constant into CX
D_LOOP:
    NOP                                ; 3 T-states delay padding
    NOP                                ; 3 T-states delay padding
    LOOP D_LOOP                        ; Decrement CX and loop until zero
    POP CX                             ; Restore step counter CX
    RET                                ; Return to caller
DELAY_ROUTINE ENDP

CODE_SEG ENDS                          ; End of Code Segment definition
END START                              ; End of program module`,
    simplifiedCode: `.MODEL SMALL                          ; Small memory model for code and data
.DATA                                  ; Start Data Segment
    PORT_A    EQU 00C0H                ; 8255 PPI Port A Address
    CWR_PORT  EQU 00C6H                ; 8255 PPI Control Word Register Address
    CCW_TABLE DB 05H, 06H, 0AH, 09H    ; 4-Step Anti-Clockwise Excitation Lookup Table
    STEPS     DW 200                   ; Variable step-size (200 steps = 360 deg CCW)
    SPEED_DLY DW 0FFFFH                ; Speed regulation delay loop count
.CODE                                  ; Start Code Segment
MAIN PROC
    MOV AX, @DATA                      ; Initialize DS
    MOV DS, AX

    ; Initialize 8255 PPI: Control Word = 80H (Port A as Output)
    MOV DX, CWR_PORT
    MOV AL, 80H
    OUT DX, AL

    ; Rotate Stepper Anti-Clockwise for specified variable steps
    MOV CX, STEPS                      ; Load total variable step size
ROT_CCW:
    LEA SI, CCW_TABLE                  ; Reset table pointer to CCW sequence
    MOV BX, 4                          ; 4 steps per sequence
NEXT_CCW:
    MOV AL, [SI]                       ; Get step pattern
    MOV DX, PORT_A                     ; Output to Port A
    OUT DX, AL
    CALL DELAY                         ; Delay for motor movement
    INC SI                             ; Next step pattern
    DEC CX                             ; Decrement remaining step count
    JZ DONE_CCW
    DEC BX
    JNZ NEXT_CCW
    JMP ROT_CCW

DONE_CCW:
    MOV AX, 4C00H                      ; Terminate cleanly
    INT 21H
MAIN ENDP

DELAY PROC
    PUSH CX
    MOV CX, SPEED_DLY
DLY1:
    LOOP DLY1
    POP CX
    RET
DELAY ENDP
END MAIN`,
    bestPracticeTip: 'Reversing the sequence of excitation codes (05H -> 06H -> 0AH -> 09H) reverses the stator magnetic flux vector, rotating the rotor smoothly in the counter-clockwise direction.'
  },
  {
    id: 'exp_adc',
    number: '7A',
    title: 'Interfacing ADC (ADC 0808/0809) with 8086 Microprocessor',
    aim: 'Write an ALP to 8086 processor to Interface ADC.',
    directivesUsed: ['DB', 'DW', 'EQU', 'SEGMENT', 'ENDS', 'ASSUME', 'PROC', 'ENDP'],
    algorithm: [
      'Initialize 8255 PPI: Write control word 98H to CWR (00C6H) to configure Port A as Input (reading digital output D0-D7 of ADC), Port B as Output (for channel address selection), and Port C as Mode 0 (PC0-PC3 Output for ALE & SOC pulses, PC4-PC7 Input for EOC status polling).',
      'Select ADC analog input channel (e.g. Channel 0: ADD A = 0, ADD B = 0, ADD C = 0) by writing channel select word to 8255 Port B / Port C.',
      'Generate active-high Address Latch Enable (ALE) and Start of Conversion (SOC) pulse on PC0 by outputting 01H followed by a small delay and resetting to 00H.',
      'Poll the End-of-Conversion (EOC) pin on PC7 by reading Port C (00C4H) in a loop until Bit 7 becomes HIGH (EOC = 1, indicating conversion completion).',
      'Assert Output Enable (OE) by sending a HIGH signal on PC2 (or Port B control line) to activate 3-state output latches of ADC 0808/0809.',
      'Read 8-bit digitized analog data from 8255 Port A (00C0H) into register AL (IN AL, DX).',
      'De-assert OE (set PC2 = 0) to release the 8255 Port A data bus.',
      'Store digital reading in memory variable DIGITAL_VAL and calculate equivalent analog voltage.'
    ],
    standardCode: `DATA_SEG SEGMENT                      ; Declare Data Segment for ADC buffers and port addresses
    PORT_A    EQU 00C0H                ; 8255 PPI Port A (Connected to ADC0808 D0-D7 Digital Outputs - Input)
    PORT_B    EQU 00C2H                ; 8255 PPI Port B (Channel Address Select A, B, C - Output)
    PORT_C    EQU 00C4H                ; 8255 PPI Port C (PC0: ALE/SOC, PC2: OE, PC7: EOC - Mixed I/O)
    CWR_PORT  EQU 00C6H                ; 8255 PPI Control Word Register Address
    DIGITAL_VAL DB ?                   ; Variable to hold acquired 8-bit digital output (00H - FFH)
    VOLTAGE_MV  DW ?                   ; Calculated analog voltage in millivolts (0 - 5000 mV)
DATA_SEG ENDS                          ; End of Data Segment definition

CODE_SEG SEGMENT                       ; Declare Code Segment containing instructions
    ASSUME CS:CODE_SEG, DS:DATA_SEG    ; Map CS and DS registers
START:                                 ; Program entry point
    MOV AX, DATA_SEG                   ; Load base address of Data Segment into AX
    MOV DS, AX                         ; Initialize DS register

    ; Step 1: Initialize 8255 PPI (Port A Input, Port B Output, Port C Lower Output, Port C Upper Input)
    ; Control Word: 98H (1001 1000b) -> Mode 0, Port A=IN, Port B=OUT, Port C(Upper)=IN, Port C(Lower)=OUT
    MOV DX, CWR_PORT                   ; Load CWR I/O port address
    MOV AL, 98H                        ; Configure 8255 for ADC interfacing
    OUT DX, AL                         ; Send control word to 8255 CWR

    ; Step 2: Select ADC Analog Channel 0 (ADD A = 0, ADD B = 0, ADD C = 0)
    MOV DX, PORT_B                     ; Load Port B address
    MOV AL, 00H                        ; Channel 0 select nibble (000b)
    OUT DX, AL                         ; Output channel code to latch on ADC multiplexer

    ; Step 3: Issue ALE & SOC (Start of Conversion) Active-High Pulse on PC0
    MOV DX, PORT_C                     ; Load Port C address
    MOV AL, 01H                        ; Set PC0 = 1 (ALE and SOC HIGH)
    OUT DX, AL                         ; Assert pulse
    NOP                                ; Pulse width hold delay (~1-2 µs)
    NOP
    MOV AL, 00H                        ; Reset PC0 = 0 (ALE and SOC LOW, initiates SAR conversion)
    OUT DX, AL                         ; Falling edge starts SAR approximation

    ; Step 4: Poll EOC (End of Conversion) on PC7 until EOC goes HIGH (1)
CHECK_EOC:
    MOV DX, PORT_C                     ; Load Port C address
    IN AL, DX                          ; Read Port C status pins
    TEST AL, 80H                       ; Test Bit 7 (PC7 / EOC pin)
    JZ CHECK_EOC                       ; If ZF = 1 (Bit 7 is 0, conversion in progress), keep polling

    ; Step 5: Assert OE (Output Enable) on PC2 to place digital byte on Port A
    MOV AL, 04H                        ; Set PC2 = 1 (OE = HIGH)
    OUT DX, AL                         ; Enable ADC 3-state output buffers
    NOP                                ; Data bus propagation settling delay

    ; Step 6: Read 8-bit Digital Value from 8255 Port A
    MOV DX, PORT_A                     ; Load Port A address
    IN AL, DX                          ; Read digital conversion byte from ADC0808 into AL
    MOV DIGITAL_VAL, AL                ; Store raw 8-bit digital sample into memory

    ; Step 7: De-assert OE (PC2 = 0) to release bus
    MOV DX, PORT_C                     ; Load Port C address
    MOV AL, 00H                        ; Set PC2 = 0 (OE = LOW)
    OUT DX, AL

    ; Step 8: Convert Digital Value to Voltage (mV) = (AL * 5000) / 255
    MOV AH, 00H                        ; Clear AH (AX = 8-bit digital value)
    MOV BX, 5000                       ; Vref in millivolts = 5000 mV (5.0V)
    MUL BX                             ; DX:AX = AL * 5000
    MOV BX, 255                        ; 8-bit Full scale divisor (2^8 - 1 = 255)
    DIV BX                             ; AX = (AL * 5000) / 255 (Analog Voltage in mV)
    MOV VOLTAGE_MV, AX                 ; Store computed millivolts in memory

    ; Step 9: Clean Termination to DOS
    MOV AH, 4CH                        ; DOS Function 4CH (Terminate Process)
    INT 21H                            ; Return control to DOS
CODE_SEG ENDS                          ; End of Code Segment definition
END START                              ; End of program module`,
    simplifiedCode: `.MODEL SMALL                          ; Small memory model for code and data
.DATA                                  ; Start Data Segment
    PORT_A    EQU 00C0H                ; 8255 Port A (Digital Inputs D0-D7)
    PORT_B    EQU 00C2H                ; 8255 Port B (Channel Select)
    PORT_C    EQU 00C4H                ; 8255 Port C (Control Lines: PC0=ALE/SOC, PC7=EOC, PC2=OE)
    CWR_PORT  EQU 00C6H                ; 8255 Control Word Register
    DIG_OUT   DB ?                     ; 8-bit digital reading
.CODE                                  ; Start Code Segment
MAIN PROC
    MOV AX, @DATA                      ; Initialize DS
    MOV DS, AX

    ; Initialize 8255: Port A=Input, Port B=Output, Port C(Upper)=Input, Port C(Lower)=Output
    MOV DX, CWR_PORT
    MOV AL, 98H                        ; Control Word 98H
    OUT DX, AL

    ; Select Channel 0 on Port B
    MOV DX, PORT_B
    MOV AL, 00H
    OUT DX, AL

    ; Generate ALE/SOC Active-High Pulse on PC0
    MOV DX, PORT_C
    MOV AL, 01H                        ; ALE/SOC = 1
    OUT DX, AL
    NOP
    MOV AL, 00H                        ; ALE/SOC = 0 (Starts conversion)
    OUT DX, AL

    ; Poll EOC (Bit 7 of Port C) until conversion is done (EOC = 1)
POLL_EOC:
    IN AL, DX
    TEST AL, 80H                       ; Check if PC7 is High
    JZ POLL_EOC                        ; If 0, conversion busy; loop

    ; Assert Output Enable (OE = PC2 High)
    MOV AL, 04H                        ; PC2 = 1 (OE HIGH)
    OUT DX, AL
    NOP

    ; Read 8-bit Digital Byte from Port A
    MOV DX, PORT_A
    IN AL, DX                          ; Read digitized byte into AL
    MOV DIG_OUT, AL                    ; Store in memory

    ; De-assert OE (PC2 = 0)
    MOV DX, PORT_C
    MOV AL, 00H
    OUT DX, AL

    ; Exit cleanly
    MOV AX, 4C00H
    INT 21H
MAIN ENDP
END MAIN`,
    bestPracticeTip: 'Ensure an external 500-640 kHz clock is supplied to ADC0808/0809 (Pin 10) and verify that the 8255 CWR is initialized with 98H before pulsing SOC and polling EOC.'
  },
  {
    id: 'exp_dac',
    number: '7B',
    title: 'Interfacing DAC (DAC 0800) with 8086 & Waveform Generation',
    aim: 'Write an ALP to 8086 processor to Interface DAC and generate Square Wave/Triangular Wave/Stepsignal.',
    directivesUsed: ['EQU', 'SEGMENT', 'ENDS', 'ASSUME', 'PROC', 'ENDP'],
    algorithm: [
      'Initialize 8255 PPI: Write control word 80H to CWR (00C6H) to configure Port A as Mode 0 Output (connected to DAC0800 digital inputs D0-D7).',
      'For Square Wave Generation: Output 00H (0V level) to Port A, call software delay DELAY_HALF, output FFH (+5V level) to Port A, call DELAY_HALF, and repeat in an infinite loop.',
      'For Triangular Wave Generation: Start AL with 00H. In the ramp-up phase, output AL to Port A, increment AL (INC AL), call step delay, and loop until AL reaches FFH. In the ramp-down phase, output AL to Port A, decrement AL (DEC AL), call step delay, and loop until AL reaches 00H. Repeat continuously.',
      'For Step Signal (Staircase) Generation: Start AL with 00H. Output current voltage step level AL to Port A, call step hold delay (e.g., 5 ms), add fixed increment (e.g. 33H or 20H) to AL, and loop until AL wraps around to 00H. Repeat continuously.'
    ],
    standardCode: `DATA_SEG SEGMENT                      ; Declare Data Segment for DAC interfacing constants
    PORT_A    EQU 00C0H                ; 8255 PPI Port A I/O address (Connected to DAC0800 inputs D0-D7)
    CWR_PORT  EQU 00C6H                ; 8255 PPI Control Word Register address
    STEP_SIZE EQU 33H                  ; Step size for Staircase / Step signal generation
DATA_SEG ENDS                          ; End of Data Segment definition

CODE_SEG SEGMENT                       ; Declare Code Segment containing instructions
    ASSUME CS:CODE_SEG, DS:DATA_SEG    ; Map CS and DS registers
START:                                 ; Program entry point
    MOV AX, DATA_SEG                   ; Load base address of Data Segment into AX
    MOV DS, AX                         ; Initialize DS register

    ; Step 1: Initialize 8255 PPI Control Word Register (Mode 0, Port A Output)
    MOV DX, CWR_PORT                   ; Load CWR I/O port address
    MOV AL, 80H                        ; Control word 80H: Mode 0, Port A=OUT, Port B=OUT, Port C=OUT
    OUT DX, AL                         ; Send control word to 8255 CWR

    MOV DX, PORT_A                     ; Set DX to Port A address for all subsequent DAC outputs

; =========================================================================
; ROUTINE 1: SQUARE WAVE GENERATION (00H for Low, FFH for High)
; =========================================================================
GEN_SQUARE:
    MOV AL, 00H                        ; Load 00H (0V analog output level)
    OUT DX, AL                         ; Send low level to DAC0800
    CALL DELAY_HALF                    ; Hold Low state for T/2 duration

    MOV AL, 0FFH                       ; Load FFH (+5V full-scale analog output level)
    OUT DX, AL                         ; Send high level to DAC0800
    CALL DELAY_HALF                    ; Hold High state for T/2 duration

    ; Check if key pressed to switch or continue square wave
    MOV AH, 01H                        ; Check keystroke without blocking
    INT 16H
    JZ GEN_SQUARE                      ; If no key pressed, repeat square wave cycle

; =========================================================================
; ROUTINE 2: TRIANGULAR WAVE GENERATION (Linear Ramp Up & Ramp Down)
; =========================================================================
GEN_TRIANGLE:
RAMP_UP:
    MOV AL, 00H                        ; Start from 0V baseline
TRI_UP_LOOP:
    OUT DX, AL                         ; Output current digital voltage level to DAC
    INC AL                             ; Increment voltage level by 1 step (19.5 mV)
    CALL DELAY_STEP                    ; Micro-delay for slope smoothing
    JNZ TRI_UP_LOOP                    ; Continue until AL wraps from FFH to 00H

RAMP_DOWN:
    MOV AL, 0FFH                       ; Start from peak +5V level
TRI_DOWN_LOOP:
    OUT DX, AL                         ; Output current digital voltage level to DAC
    DEC AL                             ; Decrement voltage level by 1 step
    CALL DELAY_STEP                    ; Micro-delay for slope smoothing
    JNZ TRI_DOWN_LOOP                  ; Continue until AL reaches 00H
    JMP GEN_TRIANGLE                   ; Repeat triangular wave cycle continuously

; =========================================================================
; ROUTINE 3: STEP SIGNAL (STAIRCASE WAVE) GENERATION
; =========================================================================
GEN_STEPSIGNAL:
    MOV AL, 00H                        ; Start from ground level 00H (0.0 V)
STEP_LOOP:
    OUT DX, AL                         ; Output current discrete step voltage to DAC
    CALL DELAY_STEP_HOLD               ; Hold step voltage flat for observable duration (~5 ms)
    ADD AL, STEP_SIZE                  ; Increment to next staircase plateau level
    JNC STEP_LOOP                      ; If no carry / overflow, generate next step
    JMP GEN_STEPSIGNAL                 ; Reset staircase to bottom level (00H) and repeat

; =========================================================================
; SOFTWARE DELAY SUBROUTINES FOR WAVEFORM TIMING & FREQUENCY CONTROL
; =========================================================================
DELAY_HALF PROC                        ; Delay subroutine for square wave half-period
    PUSH CX
    MOV CX, 0200H                      ; Adjust CX for desired square wave frequency (e.g., 1 kHz)
D_HALF:
    LOOP D_HALF
    POP CX
    RET
DELAY_HALF ENDP

DELAY_STEP PROC                        ; Micro-delay subroutine for triangular wave slope rate
    NOP
    NOP
    RET
DELAY_STEP ENDP

DELAY_STEP_HOLD PROC                   ; Subroutine for step signal plateau duration
    PUSH CX
    MOV CX, 0400H
D_STEP:
    LOOP D_STEP
    POP CX
    RET
DELAY_STEP_HOLD ENDP

CODE_SEG ENDS                          ; End of Code Segment definition
END START                              ; End of program module`,
    simplifiedCode: `.MODEL SMALL                          ; Small memory model
.DATA
    PORT_A   EQU 00C0H                 ; 8255 Port A (Connected to DAC0800 inputs)
    CWR_PORT EQU 00C6H                 ; 8255 Control Word Register
.CODE
MAIN PROC
    MOV AX, @DATA                      ; Initialize DS
    MOV DS, AX

    ; Initialize 8255: Port A as Mode 0 Output (80H)
    MOV DX, CWR_PORT
    MOV AL, 80H
    OUT DX, AL
    MOV DX, PORT_A

; 1. Generate Square Wave
SQUARE_LOOP:
    MOV AL, 00H                        ; 0V Level
    OUT DX, AL
    CALL DELAY
    MOV AL, 0FFH                       ; +5V Level
    OUT DX, AL
    CALL DELAY
    ; (Uncomment to loop continuously or proceed to Triangular / Step wave)
    ; JMP SQUARE_LOOP

; 2. Generate Triangular Wave
TRI_LOOP:
    MOV AL, 00H
UP_RAMP:
    OUT DX, AL
    INC AL
    JNZ UP_RAMP
    MOV AL, 0FFH
DOWN_RAMP:
    OUT DX, AL
    DEC AL
    JNZ DOWN_RAMP
    ; JMP TRI_LOOP

; 3. Generate Step Signal (Staircase)
STEP_LOOP:
    MOV AL, 00H
NEXT_STEP:
    OUT DX, AL
    CALL DELAY
    ADD AL, 33H                        ; 6-Step Staircase increment
    JNC NEXT_STEP
    ; JMP STEP_LOOP

    MOV AX, 4C00H
    INT 21H
MAIN ENDP

DELAY PROC
    PUSH CX
    MOV CX, 0200H
D1: LOOP D1
    POP CX
    RET
DELAY ENDP
END MAIN`,
    bestPracticeTip: 'Connect DAC 0800 current outputs (Iout & Iout_bar) to an OP-07/LM741 op-amp configured as an I-to-V converter with Rf = 5 kΩ to produce a clean 0V to +5V voltage output on the oscilloscope.'
  },
  {
    id: 'exp5',
    number: '8',
    title: 'Block Data Transfer (Memory Copy & Management)',
    aim: 'Write an ALP to copy a block of 10 data bytes from source to destination.',
    directivesUsed: ['DB', 'DUP', 'SEGMENT', 'ENDS', 'ASSUME'],
    algorithm: [
      'Initialize DS with source and ES with destination segment.',
      'Load SI = Source block, DI = Destination block, and CX = block size (10).',
      'Execute CLD (auto-increment) and REP MOVSB (copy bytes loop).'
    ],
    standardCode: `DATA_SEG SEGMENT                      ; Declare Data Segment to allocate source & destination buffers
    SRC_BLOCK DB 10H, 20H, 30H, 40H, 50H, 60H, 70H, 80H, 90H, 99H ; 10-byte source data block
    DEST_BLOCK DB 10 DUP(0)            ; 10-byte uninitialized destination buffer initialized to zeros
DATA_SEG ENDS                          ; End of Data Segment definition
CODE_SEG SEGMENT                       ; Declare Code Segment containing instructions
    ASSUME CS:CODE_SEG, DS:DATA_SEG, ES:DATA_SEG ; Map CS, DS, and ES to logical segments
START:                                 ; Program entry point label
    MOV AX, DATA_SEG                   ; Load base address of Data Segment into AX
    MOV DS, AX                         ; Initialize DS register with DATA_SEG address (source segment)
    MOV ES, AX                         ; Initialize ES register with DATA_SEG address (destination segment)
    LEA SI, SRC_BLOCK                  ; Load Source Index SI with starting offset of SRC_BLOCK (DS:SI)
    LEA DI, DEST_BLOCK                 ; Load Destination Index DI with starting offset of DEST_BLOCK (ES:DI)
    MOV CX, 10                         ; Set repeat counter CX to block length (10 bytes to transfer)
    CLD                                ; Clear Direction Flag DF = 0 for auto-incrementing SI & DI
    REP MOVSB                          ; Block transfer: copy byte [DS:SI] to [ES:DI], auto-increment SI/DI, repeat until CX=0
    MOV AH, 4CH                        ; Load DOS service function 4CH (Exit)
    INT 21H                            ; Call DOS interrupt 21H to terminate program
CODE_SEG ENDS                          ; End of Code Segment definition
END START                              ; End of program with START entry point`,
    simplifiedCode: `.MODEL SMALL                          ; Specify small memory model for code and data
.DATA                                  ; Direct assembler to start Data Segment
    SRC_BLOCK DB 10H, 20H, 30H, 40H, 50H, 60H, 70H, 80H, 90H, 99H ; 10-byte source array
    DEST_BLOCK DB 10 DUP(0)            ; 10-byte destination buffer
.CODE                                  ; Direct assembler to start Code Segment
MAIN PROC                              ; Declare start of procedure MAIN
    MOV AX, @DATA                      ; Load address of data segment into AX
    MOV DS, AX                         ; Initialize DS register with @DATA address
    MOV ES, AX                         ; Initialize ES register with @DATA address
    LEA SI, SRC_BLOCK                  ; Point SI to source data block
    LEA DI, DEST_BLOCK                 ; Point DI to destination buffer
    MOV CX, 10                         ; Transfer count CX = 10 bytes
    CLD                                ; Set forward direction (DF = 0)
    REP MOVSB                          ; Copy 10 consecutive bytes from SI to DI
    MOV AX, 4C00H                      ; Load AH=4CH (exit) and AL=00H (return code 0)
    INT 21H                            ; Call DOS interrupt 21H to terminate program
MAIN ENDP                              ; End of procedure MAIN definition
END MAIN                               ; End of program module with MAIN entry point`,
    bestPracticeTip: 'REP MOVSB is extremely efficient because the hardware handles index increments and loop counting in a single instruction.'
  },
  {
    id: 'exp_8051_arith',
    number: '9A',
    title: '8051 Arithmetic Instructions (Addition, Subtraction & BCD Arithmetic)',
    aim: 'Write an Assembly Language Program to 8051 Microcontroller to perform Arithmetic operations like 8-bit/16-bit addition with carry, subtraction with borrow, and BCD addition with Decimal Adjust (DA A).',
    directivesUsed: ['ORG', 'EQU', 'DB', 'END'],
    instructionsUsed: ['MOV', 'ADD', 'ADDC', 'CLR', 'SUBB', 'DA', 'INC', 'SJMP'],
    algorithm: [
      'Initialize internal RAM data pointers and clear Carry flag (CLR C).',
      'For 8-bit Addition: Load operand 1 into Accumulator (MOV A, 30H). Add operand 2 (ADD A, 31H). Store sum in 40H. If Carry generated, increment high-byte carry storage at 41H.',
      'For 16-bit Addition: Load lower byte of Word 1 into A (MOV A, 32H). Add lower byte of Word 2 (ADD A, 34H). Store lower sum in 42H. Load higher byte of Word 1 into A (MOV A, 33H). Add higher byte with previous carry (ADDC A, 35H). Store upper sum in 43H and record final carry in 44H.',
      'For 8-bit Subtraction: Clear Carry (CLR C). Load minuend into A (MOV A, 36H). Subtract subtrahend with borrow (SUBB A, 37H). Store difference in 45H and borrow flag in 46H.',
      'For BCD Addition: Load BCD operand 1 into A (MOV A, 38H). Add BCD operand 2 (ADD A, 39H). Execute Decimal Adjust Accumulator (DA A) to adjust lower/upper nibbles if > 9 or Auxiliary Carry (AC=1). Store packed BCD sum in 47H and BCD carry in 48H.',
      'Terminate program in an endless loop (SJMP $ / HERE: SJMP HERE).'
    ],
    standardCode: `ORG 0000H                              ; 8051 Reset Vector entry point
    LJMP START                         ; Jump over interrupt vectors to main program

ORG 0030H                              ; Start program code above interrupt vectors
START:
    ; =========================================================================
    ; 1. 8-BIT BINARY ADDITION (30H + 31H -> SUM in 40H, CARRY in 41H)
    ; =========================================================================
    MOV 30H, #0F8H                     ; Operand 1 = F8H (248D)
    MOV 31H, #19H                      ; Operand 2 = 19H (25D)
    MOV 41H, #00H                      ; Initialize Carry byte to 00H

    MOV A, 30H                         ; Load first operand F8H into Accumulator
    ADD A, 31H                         ; Add second operand: F8H + 19H = 11H with CY = 1
    MOV 40H, A                         ; Store 8-bit Sum (11H) into RAM location 40H
    JNC SKIP_CARRY1                    ; If no carry (CY = 0), jump over carry increment
    MOV 41H, #01H                      ; Store Carry Out (01H) into RAM location 41H
SKIP_CARRY1:

    ; =========================================================================
    ; 2. 16-BIT MULTI-BYTE ADDITION WITH CARRY (33H:32H + 35H:34H -> 43H:42H)
    ; =========================================================================
    MOV 32H, #0E4H                     ; Lower byte of Word 1 = E4H
    MOV 33H, #12H                      ; Higher byte of Word 1 = 12H (Word 1 = 12E4H)
    MOV 34H, #5CH                      ; Lower byte of Word 2 = 5CH
    MOV 35H, #34H                      ; Higher byte of Word 2 = 34H (Word 2 = 345CH)
    MOV 44H, #00H                      ; Clear 16-bit Carry byte

    CLR C                              ; Clear Carry Flag before first addition
    MOV A, 32H                         ; Load lower byte of Word 1 (E4H)
    ADD A, 34H                         ; Add lower byte of Word 2 (5CH): E4H + 5CH = 40H (CY = 1)
    MOV 42H, A                         ; Store lower sum byte (40H) into RAM 42H

    MOV A, 33H                         ; Load higher byte of Word 1 (12H)
    ADDC A, 35H                        ; Add higher byte with Carry: 12H + 34H + 1 = 47H
    MOV 43H, A                         ; Store higher sum byte (47H) into RAM 43H
    JNC SKIP_CARRY2
    MOV 44H, #01H                      ; Store final carry if 16-bit overflow occurs
SKIP_CARRY2:

    ; =========================================================================
    ; 3. 8-BIT SUBTRACTION WITH BORROW (36H - 37H -> DIFF in 45H, BORROW in 46H)
    ; =========================================================================
    MOV 36H, #95H                      ; Minuend = 95H (149D)
    MOV 37H, #47H                      ; Subtrahend = 47H (71D)
    MOV 46H, #00H                      ; Clear Borrow byte

    CLR C                              ; In 8051, CY acts as Borrow; MUST clear before SUBB
    MOV A, 36H                         ; Load Minuend (95H) into Accumulator
    SUBB A, 37H                        ; Compute 95H - 47H - 0 = 4EH (78D), CY = 0
    MOV 45H, A                         ; Store Difference (4EH) into RAM 45H
    JNC SKIP_BORROW
    MOV 46H, #01H                      ; Store Borrow Out if Minuend < Subtrahend
SKIP_BORROW:

    ; =========================================================================
    ; 4. PACKED BCD ADDITION WITH DECIMAL ADJUST (DA A) (38H + 39H -> 47H, 48H)
    ; =========================================================================
    MOV 38H, #38H                      ; BCD Operand 1 = 38 (38H)
    MOV 39H, #49H                      ; BCD Operand 2 = 49 (49H)
    MOV 48H, #00H                      ; Clear BCD Carry byte

    CLR C                              ; Clear Carry Flag
    MOV A, 38H                         ; Load first BCD operand (38H)
    ADD A, 39H                         ; Binary addition: 38H + 49H = 81H (AC = 1)
    DA A                               ; Decimal Adjust: adds 06H -> A = 87H (BCD 38 + 49 = 87)
    MOV 47H, A                         ; Store BCD Sum (87H) into RAM 47H
    JNC HALT_PROGRAM
    MOV 48H, #01H                      ; Record BCD overflow carry if result > 99

HALT_PROGRAM:
    SJMP HALT_PROGRAM                  ; Trap 8051 CPU in infinite halt loop
END                                    ; End of 8051 source code module`,
    simplifiedCode: `ORG 0000H
    ; 8-Bit Addition: F8H + 19H = 11H (CY = 1)
    MOV A, #0F8H
    ADD A, #19H
    MOV R0, A                          ; R0 = 11H (Sum)
    MOV R1, #00H
    JNC NEXT_SUB
    MOV R1, #01H                       ; R1 = 01H (Carry)

NEXT_SUB:
    ; 8-Bit Subtraction: 95H - 47H = 4EH
    CLR C                              ; Clear Borrow flag before SUBB
    MOV A, #95H
    SUBB A, #47H
    MOV R2, A                          ; R2 = 4EH (Difference)

    ; BCD Addition: 38H + 49H = 87H
    MOV A, #38H
    ADD A, #49H
    DA A                               ; Decimal Adjust Accumulator
    MOV R3, A                          ; R3 = 87H (Valid BCD Sum)

    SJMP $                             ; Halt
END`,
    bestPracticeTip: 'Always execute `CLR C` immediately before calling `SUBB A, src` because 8051 subtraction always subtracts the Carry Flag as a Borrow bit (A ← A - src - CY).'
  },
  {
    id: 'exp_8051_muldiv',
    number: '9B',
    title: '8051 Multiplication & Division Instructions (MUL AB & DIV AB)',
    aim: 'Write an Assembly Language Program to 8051 Microcontroller to perform unsigned 8-bit multiplication (MUL AB) and division (DIV AB), and inspect Overflow (OV) flag behavior.',
    directivesUsed: ['ORG', 'EQU', 'DB', 'END'],
    instructionsUsed: ['MOV', 'MUL', 'DIV', 'JB', 'JNB', 'SJMP'],
    algorithm: [
      'For Multiplication (MUL AB): Load 8-bit multiplicand into Accumulator A (MOV A, 30H). Load 8-bit multiplier into Register B (MOV B, 31H). Execute MUL AB. The 16-bit product is stored with low byte in A and high byte in B. Check Overflow Flag (OV). If product > 255 (B > 0), OV is set to 1; otherwise OV is 0. Clear Carry (CY = 0 always). Store product bytes in 40H (Low) and 41H (High).',
      'For Division (DIV AB): Load 8-bit dividend into Accumulator A (MOV A, 32H). Load 8-bit divisor into Register B (MOV B, 33H). Execute DIV AB. The integer quotient is placed in Accumulator A and remainder in Register B. Clear Carry (CY = 0). If divisor B was 00H, the Overflow flag (OV) is set to 1 (Division-by-Zero error) and results are undefined; otherwise OV is cleared to 0. Store quotient in 42H and remainder in 43H.',
      'Trap CPU in terminal loop (SJMP $).'
    ],
    standardCode: `ORG 0000H                              ; Reset vector
    LJMP START

ORG 0030H                              ; Code origin
START:
    ; =========================================================================
    ; 1. 8-BIT UNSIGNED MULTIPLICATION (MUL AB) (F5H * 18H -> 5880D = 16F8H)
    ; =========================================================================
    MOV 30H, #0F5H                     ; Multiplicand = F5H (245D)
    MOV 31H, #18H                      ; Multiplier = 18H (24D)
    MOV 42H, #00H                      ; Clear OV status indicator

    MOV A, 30H                         ; Load multiplicand into Accumulator A
    MOV B, 31H                         ; Load multiplier into Register B (SFR F0H)
    MUL AB                             ; Multiply: A * B -> Product in B:A (16F8H)
                                       ; A holds Low Byte (F8H), B holds High Byte (16H)
                                       ; OV = 1 (since Product > 00FFH and B != 0), CY = 0 always
    MOV 40H, A                         ; Store Product Low Byte (F8H) into RAM 40H
    MOV 41H, B                         ; Store Product High Byte (16H) into RAM 41H
    JNB OV, SKIP_OV_FLAG               ; Test Overflow Flag
    MOV 42H, #01H                      ; Store OV = 01H (Product exceeds 8-bit range)
SKIP_OV_FLAG:

    ; =========================================================================
    ; 2. 8-BIT UNSIGNED DIVISION (DIV AB) (F5H / 0AH -> QUOT=18H, REM=05H)
    ; =========================================================================
    MOV 32H, #0F5H                     ; Dividend = F5H (245D)
    MOV 33H, #0AH                      ; Divisor = 0AH (10D)
    MOV 45H, #00H                      ; Clear Div-by-Zero error flag

    MOV A, 32H                         ; Load dividend (245D) into Accumulator A
    MOV B, 33H                         ; Load divisor (10D) into Register B
    DIV AB                             ; Divide: A / B -> Quotient in A (18H = 24D), Remainder in B (05H = 5D)
                                       ; CY = 0 always; OV = 0 (Divisor != 0)
    MOV 43H, A                         ; Store Quotient (18H) into RAM 43H
    MOV 44H, B                         ; Store Remainder (05H) into RAM 44H
    JNB OV, SKIP_DIV_ERR               ; Check if divisor was 00H
    MOV 45H, #0FFH                     ; Mark Division-by-Zero Error condition
SKIP_DIV_ERR:

    ; =========================================================================
    ; 3. DIVISION BY ZERO CASE DEMONSTRATION (OV = 1 Flag Trigger)
    ; =========================================================================
    MOV A, #64H                        ; Dividend = 64H (100D)
    MOV B, #00H                        ; Divisor = 00H (Division by Zero Test)
    DIV AB                             ; OV flag is set to 1; A and B contents undefined
    MOV 46H, PSW                       ; Capture PSW to observe OV bit (PSW.2 = 1)

HALT:
    SJMP HALT                          ; Terminate in endless loop
END`,
    simplifiedCode: `ORG 0000H
    ; Multiplication: 0F5H * 18H = 16F8H
    MOV A, #0F5H                       ; Multiplicand (245D)
    MOV B, #18H                        ; Multiplier (24D)
    MUL AB                             ; A = F8H (Low), B = 16H (High), OV = 1
    MOV R0, A                          ; Product Low
    MOV R1, B                          ; Product High

    ; Division: 0F5H / 0AH = Quotient 18H (24D), Remainder 05H (5D)
    MOV A, #0F5H                       ; Dividend
    MOV B, #0AH                        ; Divisor
    DIV AB                             ; A = 18H (Quotient), B = 05H (Remainder)
    MOV R2, A                          ; Quotient
    MOV R3, B                          ; Remainder

    SJMP $                             ; Halt execution
END`,
    bestPracticeTip: '`MUL AB` and `DIV AB` always use both registers A and B implicitly. The Carry flag (CY) is always cleared to 0 by both instructions, while the Overflow flag (OV) indicates 16-bit product size in MUL and division-by-zero in DIV.'
  },
  {
    id: 'exp_8051_logic',
    number: '9C',
    title: '8051 Logical Instructions (AND, OR, XOR, NOT & Nibble Swapping)',
    aim: 'Write an Assembly Language Program to 8051 Microcontroller to perform Logical operations like AND (ANL), OR (ORL), XOR (XRL), 1\'s Complement (CPL), and Nibble Swapping (SWAP).',
    directivesUsed: ['ORG', 'EQU', 'DB', 'END'],
    instructionsUsed: ['MOV', 'ANL', 'ORL', 'XRL', 'CPL', 'SWAP', 'RL', 'RR', 'SJMP'],
    algorithm: [
      'Load test operand (e.g., A5H = 1010 0101B) into Accumulator A.',
      'Perform Bitwise AND (ANL): ANL A, #0FH masks the upper nibble and isolates lower nibble (A5H AND 0FH = 05H). Store result in RAM 40H.',
      'Perform Bitwise OR (ORL): ORL A, #0F0H sets all upper nibble bits HIGH while retaining lower nibble (05H OR F0H = F5H). Store in RAM 41H.',
      'Perform Bitwise XOR (XRL): XRL A, #0AAH toggles alternating bits (F5H XOR AAH = 5FH). Store in RAM 42H.',
      'Perform 1\'s Complement (CPL): CPL A inverts all 8 bits of A (5FH -> A0H). Store in RAM 43H.',
      'Perform Nibble Swap (SWAP): SWAP A exchanges upper 4 bits D7-D4 with lower 4 bits D3-D0 (A0H -> 0AH). Store in RAM 44H.',
      'Perform Bit-Level Logic: Set Carry (SETB C), perform Boolean logic with bit addressable memory (ANL C, bit / ORL C, bit), and store status.',
      'Halt CPU via SJMP $.'
    ],
    standardCode: `ORG 0000H                              ; 8051 Reset Vector
    LJMP START

ORG 0030H
START:
    ; =========================================================================
    ; 1. BITWISE LOGICAL AND (ANL) (Masking Operations)
    ; =========================================================================
    MOV 30H, #0A5H                     ; Source Byte = A5H (1010 0101B)
    MOV A, 30H                         ; Load A with A5H
    ANL A, #0FH                        ; Mask upper nibble: 1010 0101B AND 0000 1111B = 0000 0101B (05H)
    MOV 40H, A                         ; Store AND result (05H) in RAM 40H

    ; =========================================================================
    ; 2. BITWISE LOGICAL OR (ORL) (Bit Setting Operations)
    ; =========================================================================
    MOV A, 30H                         ; Reload original A5H
    ORL A, #0F0H                       ; Set upper nibble: 1010 0101B OR 1111 0000B = 1111 0101B (F5H)
    MOV 41H, A                         ; Store OR result (F5H) in RAM 41H

    ; =========================================================================
    ; 3. BITWISE LOGICAL XOR (XRL) (Bit Inversion / Parity / Toggling)
    ; =========================================================================
    MOV A, 30H                         ; Reload original A5H
    XRL A, #0FFH                       ; Toggle all bits: 1010 0101B XOR 1111 1111B = 0101 1010B (5AH)
    MOV 42H, A                         ; Store XOR result (5AH) in RAM 42H

    ; =========================================================================
    ; 4. 1'S COMPLEMENT (CPL A)
    ; =========================================================================
    MOV A, 30H                         ; Reload original A5H
    CPL A                              ; Bitwise NOT: Invert every bit -> 5AH
    MOV 43H, A                         ; Store Complement (5AH) in RAM 43H

    ; =========================================================================
    ; 5. NIBBLE SWAPPING (SWAP A) & ROTATION (RL A, RR A)
    ; =========================================================================
    MOV A, 30H                         ; Reload original A5H (1010 0101B)
    SWAP A                             ; Swap nibbles: D7-D4 <-> D3-D0 -> 5AH (0101 1010B)
    MOV 44H, A                         ; Store Swapped byte (5AH) in RAM 44H

    MOV A, 30H                         ; A = A5H (1010 0101B)
    RL A                               ; Rotate Left without Carry: 0100 1011B (4BH)
    MOV 45H, A                         ; Store RL result (4BH) in RAM 45H

    MOV A, 30H                         ; A = A5H (1010 0101B)
    RR A                               ; Rotate Right without Carry: 1101 0010B (D2H)
    MOV 46H, A                         ; Store RR result (D2H) in RAM 46H

    ; =========================================================================
    ; 6. BOOLEAN / BIT-LEVEL LOGICAL OPERATIONS (Bit 20H.0 and Carry)
    ; =========================================================================
    SETB 20H.0                         ; Set bit 0 of bit-addressable RAM byte 20H
    CLR C                              ; Clear Carry Flag
    ORL C, 20H.0                       ; Carry = 0 OR 1 = 1 (CY = 1)
    MOV 47H, PSW                       ; Capture PSW showing CY = 1 and Parity P

HALT:
    SJMP HALT                          ; Endless loop
END`,
    simplifiedCode: `ORG 0000H
    MOV A, #0A5H                       ; Test Data = 1010 0101B
    ANL A, #0FH                        ; A = 05H (Mask upper nibble)
    MOV R0, A

    MOV A, #0A5H
    ORL A, #0F0H                       ; A = F5H (Set upper nibble)
    MOV R1, A

    MOV A, #0A5H
    XRL A, #0FFH                       ; A = 5AH (Invert all bits)
    MOV R2, A

    MOV A, #0A5H
    SWAP A                             ; A = 5AH (Exchange 4-bit nibbles)
    MOV R3, A

    SJMP $
END`,
    bestPracticeTip: 'Use `SWAP A` for high-speed BCD-to-ASCII and nibble manipulation. Unlike shift instructions in x86, `SWAP A` executes in a single 8051 machine cycle without modifying flags.'
  },
  {
    id: 'exp_8051_regbanks',
    number: '9D',
    title: '8051 Register Banks Programming (Bank 0, 1, 2, 3 Selection & RAM Mapping)',
    aim: 'Write an Assembly Language Program to 8051 Microcontroller to select and manipulate all 4 Register Banks (Bank 0: 00H-07H, Bank 1: 08H-0FH, Bank 2: 10H-17H, Bank 3: 18H-1FH) using Program Status Word (PSW) bits RS0 (PSW.3) and RS1 (PSW.4), and verify direct vs indirect RAM access.',
    directivesUsed: ['ORG', 'EQU', 'DB', 'END'],
    instructionsUsed: ['MOV', 'SETB', 'CLR', 'PUSH', 'POP', 'SJMP'],
    algorithm: [
      'Understand 8051 Register Bank RAM Mapping: Bank 0 (00H-07H), Bank 1 (08H-0FH), Bank 2 (10H-17H), Bank 3 (18H-1FH).',
      'Select Bank 0 (Default upon Reset: RS1=0, RS0=0). Write distinctive values into R0-R7 (e.g., 10H, 11H, ... 17H). Verify by reading direct RAM addresses 00H through 07H.',
      'Switch to Bank 1 (Set RS0=1, RS1=0 via SETB RS0 or MOV PSW, #08H). Write distinctive values into R0-R7 (e.g., 20H, 21H, ... 27H). Verify these are mapped to RAM 08H through 0FH without altering Bank 0 data.',
      'Switch to Bank 2 (Set RS0=0, RS1=1 via CLR RS0; SETB RS1 or MOV PSW, #10H). Write values into R0-R7 (e.g., 30H, ... 37H) mapped to RAM 10H through 17H.',
      'Switch to Bank 3 (Set RS0=1, RS1=1 via SETB RS0 or MOV PSW, #18H). Write values into R0-R7 (e.g., 40H, ... 47H) mapped to RAM 18H through 1FH.',
      'Demonstrate Context Switching: Switch between banks to access different task register contexts without requiring slow stack save/restore cycles.',
      'Halt CPU in endless loop (SJMP $).'
    ],
    standardCode: `ORG 0000H                              ; Reset Vector
    LJMP START

ORG 0030H
START:
    ; =========================================================================
    ; 1. BANK 0 PROGRAMMING (Default: RS1=0, RS0=0 -> RAM 00H - 07H)
    ; =========================================================================
    MOV PSW, #00H                      ; Select Register Bank 0 (RS1=0, RS0=0)
    MOV R0, #10H                       ; Write 10H to Bank 0 R0 (RAM 00H)
    MOV R1, #11H                       ; Write 11H to Bank 0 R1 (RAM 01H)
    MOV R2, #12H                       ; Write 12H to Bank 0 R2 (RAM 02H)
    MOV R3, #13H                       ; Write 13H to Bank 0 R3 (RAM 03H)
    MOV R4, #14H                       ; Write 14H to Bank 0 R4 (RAM 04H)
    MOV R5, #15H                       ; Write 15H to Bank 0 R5 (RAM 05H)
    MOV R6, #16H                       ; Write 16H to Bank 0 R6 (RAM 06H)
    MOV R7, #17H                       ; Write 17H to Bank 0 R7 (RAM 07H)

    ; =========================================================================
    ; 2. BANK 1 PROGRAMMING (Switch to RS1=0, RS0=1 -> RAM 08H - 0FH)
    ; =========================================================================
    SETB PSW.3                         ; RS0 = 1 (Select Register Bank 1)
    MOV R0, #20H                       ; Write 20H to Bank 1 R0 (RAM 08H)
    MOV R1, #21H                       ; Write 21H to Bank 1 R1 (RAM 09H)
    MOV R2, #22H                       ; Write 22H to Bank 1 R2 (RAM 0AH)
    MOV R3, #23H                       ; Write 23H to Bank 1 R3 (RAM 0BH)
    MOV R4, #24H                       ; Write 24H to Bank 1 R4 (RAM 0CH)
    MOV R5, #25H                       ; Write 25H to Bank 1 R5 (RAM 0DH)
    MOV R6, #26H                       ; Write 26H to Bank 1 R6 (RAM 0EH)
    MOV R7, #27H                       ; Write 27H to Bank 1 R7 (RAM 0FH)

    ; =========================================================================
    ; 3. BANK 2 PROGRAMMING (Switch to RS1=1, RS0=0 -> RAM 10H - 17H)
    ; =========================================================================
    CLR PSW.3                          ; RS0 = 0
    SETB PSW.4                         ; RS1 = 1 (Select Register Bank 2)
    MOV R0, #30H                       ; Write 30H to Bank 2 R0 (RAM 10H)
    MOV R1, #31H                       ; Write 31H to Bank 2 R1 (RAM 11H)
    MOV R2, #32H                       ; Write 32H to Bank 2 R2 (RAM 12H)
    MOV R3, #33H                       ; Write 33H to Bank 2 R3 (RAM 13H)
    MOV R4, #34H                       ; Write 34H to Bank 2 R4 (RAM 14H)
    MOV R5, #35H                       ; Write 35H to Bank 2 R5 (RAM 15H)
    MOV R6, #36H                       ; Write 36H to Bank 2 R6 (RAM 16H)
    MOV R7, #37H                       ; Write 37H to Bank 2 R7 (RAM 17H)

    ; =========================================================================
    ; 4. BANK 3 PROGRAMMING (Switch to RS1=1, RS0=1 -> RAM 18H - 1FH)
    ; =========================================================================
    SETB PSW.3                         ; RS0 = 1 (Select Register Bank 3)
    MOV R0, #40H                       ; Write 40H to Bank 3 R0 (RAM 18H)
    MOV R1, #41H                       ; Write 41H to Bank 3 R1 (RAM 19H)
    MOV R2, #42H                       ; Write 42H to Bank 3 R2 (RAM 1AH)
    MOV R3, #43H                       ; Write 43H to Bank 3 R3 (RAM 1BH)
    MOV R4, #44H                       ; Write 44H to Bank 3 R4 (RAM 1CH)
    MOV R5, #45H                       ; Write 45H to Bank 3 R5 (RAM 1DH)
    MOV R6, #46H                       ; Write 46H to Bank 3 R6 (RAM 1EH)
    MOV R7, #47H                       ; Write 47H to Bank 3 R7 (RAM 1FH)

    ; =========================================================================
    ; 5. CROSS-BANK DATA VERIFICATION USING DIRECT RAM ADDRESSING
    ; =========================================================================
    ; Read Bank 0 R0 (RAM 00H) and Bank 3 R7 (RAM 1FH) while in Bank 3
    MOV A, 00H                         ; Direct address read of RAM 00H (Bank 0 R0 = 10H)
    MOV 40H, A                         ; Store into RAM 40H
    MOV A, 08H                         ; Direct address read of RAM 08H (Bank 1 R0 = 20H)
    MOV 41H, A                         ; Store into RAM 41H
    MOV A, 10H                         ; Direct address read of RAM 10H (Bank 2 R0 = 30H)
    MOV 42H, A                         ; Store into RAM 42H
    MOV A, 18H                         ; Direct address read of RAM 18H (Bank 3 R0 = 40H)
    MOV 43H, A                         ; Store into RAM 43H

HALT:
    SJMP HALT                          ; Trap CPU
END`,
    simplifiedCode: `ORG 0000H
    ; Bank 0 (RAM 00H-07H)
    MOV PSW, #00H                      ; Select Bank 0
    MOV R0, #10H
    MOV R1, #11H

    ; Bank 1 (RAM 08H-0FH)
    SETB PSW.3                         ; RS0 = 1 (Bank 1)
    MOV R0, #20H
    MOV R1, #21H

    ; Bank 2 (RAM 10H-17H)
    CLR PSW.3
    SETB PSW.4                         ; RS1 = 1, RS0 = 0 (Bank 2)
    MOV R0, #30H
    MOV R1, #31H

    ; Bank 3 (RAM 18H-1FH)
    SETB PSW.3                         ; RS1 = 1, RS0 = 1 (Bank 3)
    MOV R0, #40H
    MOV R1, #41H

    ; Direct RAM read
    MOV A, 00H                         ; Read Bank 0 R0 (10H)
    MOV A, 08H                         ; Read Bank 1 R0 (20H)
    SJMP $
END`,
    bestPracticeTip: 'Switching register banks using `SETB/CLR RS0/RS1` enables ultra-fast real-time Interrupt Service Routine (ISR) context switching in 8051, eliminating the need to push/pop all working registers to/from stack.'
  },
  {
    id: 'exp_8051_timer0_m1',
    number: '10A',
    title: '8051 Timer 0 in Mode 1 (16-bit Timer) – 25 ms Delay & Blink Port P0 Pins',
    aim: 'Write an Assembly Language Program to 8051 Microcontroller to create a delay of 25msec using Timer0 in mode 1 and blink all the Pins of P0.',
    directivesUsed: ['ORG', 'EQU', 'END'],
    instructionsUsed: ['MOV', 'SETB', 'CLR', 'JNB', 'CPL', 'ACALL', 'SJMP'],
    algorithm: [
      'Set Timer 0 in Mode 1 (16-bit Timer mode): TMOD = 01H (GATE=0, C/T=0, M1=0, M0=1).',
      'Calculate Initial Count for 25 ms delay: At 12 MHz oscillator frequency (1 machine cycle = 1 µs), 25 ms requires 25,000 counts. Initial 16-bit value = 65,536 - 25,000 = 40,536 = 9E58H (TH0 = 9EH, TL0 = 58H).',
      'Blink Port P0: Complement all pins of Port P0 using `CPL P0` (or toggle between 00H and FFH).',
      'Call DELAY_25MS subroutine: Load TH0 = 9EH and TL0 = 58H, start Timer 0 via `SETB TR0`.',
      'Poll Overflow Flag TF0: Wait in loop `JNB TF0, $` until 16-bit timer overflows from FFFFH to 0000H, setting TF0 = 1.',
      'Stop Timer 0 (`CLR TR0`), clear overflow flag (`CLR TF0`), and return with `RET`.',
      'Repeat continuously in an infinite loop (`SJMP AGAIN`).'
    ],
    standardCode: `ORG 0000H                              ; 8051 Reset Vector
    LJMP MAIN                          ; Jump to Main Program

ORG 0030H                              ; Main Program Code Origin
MAIN:
    MOV TMOD, #01H                     ; Configure Timer 0 in Mode 1 (16-bit Timer Mode)
    MOV P0, #00H                       ; Initialize Port 0: Set all pins LOW (All LEDs ON)

AGAIN:
    CPL P0                             ; Invert all pins of Port 0 (00H <-> FFH)
    ACALL DELAY_25MS                   ; Call 25 ms hardware timer delay subroutine
    SJMP AGAIN                         ; Loop infinitely to blink Port 0 every 25 ms

; =============================================================================
; DELAY SUBROUTINE: 25 MILLISECOND DELAY USING TIMER 0 MODE 1 (16-BIT)
; Crystal: 12.000 MHz -> 1 Machine Cycle = 12 / 12 MHz = 1 µs
; Required Delay = 25 ms = 25,000 µs = 25,000 clock pulses
; 16-bit Preload Count = 65,536 - 25,000 = 40,536 = 9E58H
; TH0 = 9EH, TL0 = 58H
; =============================================================================
DELAY_25MS:
    MOV TH0, #09EH                     ; Load Timer 0 High Byte (9EH = 158D)
    MOV TL0, #58H                      ; Load Timer 0 Low Byte (58H = 88D)
    SETB TR0                           ; Start Timer 0 (TCON.4 = 1)

WAIT_TF0:
    JNB TF0, WAIT_TF0                  ; Monitor Timer 0 Overflow Flag (TCON.5) until TF0 = 1

    CLR TR0                            ; Stop Timer 0
    CLR TF0                            ; Clear Timer 0 Overflow Flag for next cycle
    RET                                ; Return from delay subroutine

END                                    ; End of 8051 assembly source`,
    simplifiedCode: `ORG 0000H
    MOV TMOD, #01H                     ; Timer 0, Mode 1 (16-bit)
    MOV P0, #00H

LOOP:
    CPL P0                             ; Blink all 8 pins of Port 0
    MOV TH0, #09EH                     ; Preload 9E58H (40536) for 25 ms delay
    MOV TL0, #58H
    SETB TR0                           ; Start Timer 0
WAIT:
    JNB TF0, WAIT                      ; Poll TF0
    CLR TR0                            ; Stop Timer 0
    CLR TF0                            ; Reset TF0 flag
    SJMP LOOP                          ; Repeat
END`,
    bestPracticeTip: 'Always clear TF0 (`CLR TF0`) in software before the next timer cycle because hardware timer polling does not auto-clear TF0 when interrupts are not used.'
  },
  {
    id: 'exp_8051_timer1_m0',
    number: '10B',
    title: '8051 Timer 1 in Mode 0 (13-bit Timer) – 50 µs Delay & Blink Port P2 Pins',
    aim: 'Write an Assembly Language Program to 8051 Microcontroller to create a delay of 50 µsec using Timer1 in mode 0 and blink all the Pins of P2.',
    directivesUsed: ['ORG', 'EQU', 'END'],
    instructionsUsed: ['MOV', 'SETB', 'CLR', 'JNB', 'CPL', 'ACALL', 'SJMP'],
    algorithm: [
      'Set Timer 1 in Mode 0 (13-bit Timer mode): TMOD = 00H (GATE=0, C/T=0, M1=0, M0=0 for Timer 1).',
      'Calculate 13-bit Initial Count for 50 µs delay: At 12 MHz (1 cycle = 1 µs), 50 µs requires 50 counts. 13-bit initial value = 8,192 - 50 = 8,142 = 1FCEH (11111 1100 1110B). TH1 holds upper 8 bits (1111 1110B = 0FEH) and TL1 holds lower 5 bits (0000 1110B = 0EH). Load TH1 = 0FEH and TL1 = 0EH.',
      'Blink Port P2: Invert all pins of Port 2 (`CPL P2`) to toggle connected pins/LEDs.',
      'Call DELAY_50US subroutine: Load TH1 = 0FEH and TL1 = 0EH, start Timer 1 via `SETB TR1`.',
      'Poll Overflow Flag TF1: Monitor `JNB TF1, $` until 13-bit count rolls over (8191 -> 0), asserting TF1 = 1.',
      'Stop Timer 1 (`CLR TR1`), clear flag (`CLR TF1`), and return with `RET`.',
      'Repeat in an infinite loop (`SJMP AGAIN`) to generate a continuous 50 µs pulse wave.'
    ],
    standardCode: `ORG 0000H                              ; Reset Vector
    LJMP MAIN

ORG 0030H                              ; Code Origin
MAIN:
    MOV TMOD, #00H                     ; Configure Timer 1 in Mode 0 (13-bit Timer Mode)
    MOV P2, #00H                       ; Initialize Port 2 pins LOW

AGAIN:
    CPL P2                             ; Invert all 8 pins of Port 2 (Blink LEDs)
    ACALL DELAY_50US                   ; Call 50 µs Timer 1 delay subroutine
    SJMP AGAIN                         ; Repeat continuously

; =============================================================================
; DELAY SUBROUTINE: 50 MICROSECOND DELAY USING TIMER 1 MODE 0 (13-BIT)
; Oscillator: 12.000 MHz -> 1 Machine Cycle = 1 µs
; Mode 0: 13-bit Timer (Max Count = 2^13 = 8192 counts)
; Required Delay = 50 µs = 50 machine cycles
; Initial 13-bit Count = 8192 - 50 = 8142 = 1FCEH (11111 1100 1110B)
; Upper 8 bits -> TH1 = 1111 1110B = 0FEH
; Lower 5 bits (D0-D4) -> TL1 = 0000 1110B = 0EH (Bits D5-D7 ignored)
; =============================================================================
DELAY_50US:
    MOV TH1, #0FEH                     ; Load Timer 1 High Byte (Upper 8 bits: FEH)
    MOV TL1, #0EH                      ; Load Timer 1 Low Byte (Lower 5 bits: 0EH)
    SETB TR1                           ; Start Timer 1 (TCON.6 = 1)

WAIT_TF1:
    JNB TF1, WAIT_TF1                  ; Poll Timer 1 Overflow Flag (TCON.7) until TF1 = 1

    CLR TR1                            ; Stop Timer 1
    CLR TF1                            ; Clear Timer 1 Overflow Flag
    RET                                ; Return from subroutine

END                                    ; End of source module`,
    simplifiedCode: `ORG 0000H
    MOV TMOD, #00H                     ; Timer 1 Mode 0 (13-bit)
    MOV P2, #00H

BLINK_P2:
    CPL P2                             ; Toggle Port 2 pins
    MOV TH1, #0FEH                     ; Preload 13-bit count (8142): TH1=FEH
    MOV TL1, #0EH                      ; TL1=0EH (5 bits used)
    SETB TR1                           ; Start Timer 1
CHECK:
    JNB TF1, CHECK                     ; Wait for overflow TF1 = 1
    CLR TR1                            ; Stop Timer 1
    CLR TF1                            ; Clear flag
    SJMP BLINK_P2                      ; Repeat
END`,
    bestPracticeTip: 'In Mode 0 (13-bit), only bits D0-D4 of TLx are used as a 5-bit prescaler; bits D5-D7 of TLx are unused and must be set to 0 to prevent unintended offsets.'
  },
  {
    id: 'exp_8051_counter0_m2',
    number: '10C',
    title: '8051 Counter/Timer 0 in Mode 2 (8-bit Auto-Reload) – 75 ms Delay & Blink Port P1 Pins',
    aim: 'Write an Assembly Language Program to 8051 Microcontroller to create a delay of 75msec using counter0 in mode 2 and blink all the Pins of P1.',
    directivesUsed: ['ORG', 'EQU', 'END'],
    instructionsUsed: ['MOV', 'SETB', 'CLR', 'JNB', 'CPL', 'DJNZ', 'ACALL', 'SJMP'],
    algorithm: [
      'Configure Timer/Counter 0 in Mode 2 (8-bit Auto-Reload): Set TMOD = 02H (GATE=0, C/T=0 for timer mode, M1=1, M0=0).'
      + ' (For Counter mode counting external events on pin T0/P3.4, set C/T=1 -> TMOD = 06H).',
      'Calculate Auto-Reload Base Tick: Maximum 8-bit count is 256. For a 250 µs base tick (at 12 MHz), reload count = 256 - 250 = 6 = 06H. Load TH0 = 06H and TL0 = 06H. Upon overflow, hardware automatically copies TH0 into TL0 without software intervention.',
      'Calculate Total Iterations for 75 ms Delay: 75 ms = 75,000 µs. Total ticks = 75,000 µs / 250 µs = 300 iterations. Structure loop using R2 = 2 and R3 = 150 (2 × 150 = 300 ticks).',
      'Blink Port P1: Invert all pins of Port 1 (`CPL P1`) to alternate all LEDs between ON and OFF.',
      'Start Timer 0 (`SETB TR0`) and enter loop: poll TF0 (`JNB TF0, $`), clear TF0 (`CLR TF0`), and decrement counter registers (`DJNZ R3, ...`, `DJNZ R2, ...`).',
      'Stop Timer 0 (`CLR TR0`) and return with `RET`.',
      'Repeat infinitely (`SJMP AGAIN`) to blink Port P1 every 75 ms.'
    ],
    standardCode: `ORG 0000H                              ; Reset Vector
    LJMP MAIN

ORG 0030H                              ; Code Origin
MAIN:
    MOV TMOD, #02H                     ; Timer 0, Mode 2 (8-bit Auto-Reload Mode)
    MOV TH0, #06H                      ; Auto-Reload value for 250 µs base tick (256 - 250 = 6)
    MOV TL0, #06H                      ; Initial start value for TL0
    MOV P1, #00H                       ; Initialize Port 1 pins LOW

AGAIN:
    CPL P1                             ; Toggle all 8 pins of Port 1 (P1.0 - P1.7)
    ACALL DELAY_75MS                   ; Call 75 ms delay subroutine
    SJMP AGAIN                         ; Loop infinitely

; =============================================================================
; DELAY SUBROUTINE: 75 MILLISECOND DELAY USING TIMER 0 MODE 2 (AUTO-RELOAD)
; Oscillator: 12.000 MHz -> 1 Machine Cycle = 1 µs
; Mode 2: 8-bit Auto-Reload (Counts from TH0 = 06H to FFH -> 250 µs per tick)
; Total Delay = 75 ms = 75,000 µs
; Total Overflows Required = 75,000 µs / 250 µs = 300 ticks
; Nested Loop: R2 = 2, R3 = 150 (2 * 150 = 300 ticks * 250 µs = 75,000 µs = 75 ms)
; =============================================================================
DELAY_75MS:
    SETB TR0                           ; Start Timer 0 (TCON.4 = 1)
    MOV R2, #02H                       ; Outer loop counter = 2

OUTER_LOOP:
    MOV R3, #150                       ; Inner loop counter = 150 (96H)

INNER_LOOP:
    JNB TF0, $                         ; Wait for Timer 0 overflow (TF0 = 1, 250 µs elapsed)
    CLR TF0                            ; Clear TF0 (Hardware automatically reloads TH0 into TL0)
    DJNZ R3, INNER_LOOP                ; Decrement inner counter until R3 = 0 (150 * 250 µs = 37.5 ms)
    DJNZ R2, OUTER_LOOP                ; Decrement outer counter until R2 = 0 (2 * 37.5 ms = 75.0 ms)

    CLR TR0                            ; Stop Timer 0
    RET                                ; Return from subroutine

END                                    ; End of source code`,
    simplifiedCode: `ORG 0000H
    MOV TMOD, #02H                     ; Timer 0 Mode 2 (Auto-Reload)
    MOV TH0, #06H                      ; 250 µs reload value (256 - 250 = 6)
    MOV TL0, #06H
    MOV P1, #00H

LOOP_P1:
    CPL P1                             ; Toggle Port 1 pins
    SETB TR0                           ; Start Timer 0
    MOV R2, #2                         ; 2 * 150 = 300 ticks
O_LP:
    MOV R3, #150
I_LP:
    JNB TF0, $                         ; Poll TF0 (250 µs)
    CLR TF0                            ; Clear TF0 (TL0 auto-reloads from TH0)
    DJNZ R3, I_LP
    DJNZ R2, O_LP
    CLR TR0                            ; Stop Timer 0
    SJMP LOOP_P1                       ; Repeat 75 ms toggle
END`,
    bestPracticeTip: 'In Mode 2 Auto-Reload, TH0 is never modified during timer operation; hardware automatically restores TL0 = TH0 on every overflow (FFH -> 00H), eliminating software reload latency jitter.'
  },
  {
    id: 'exp_8051_counter1_m1',
    number: '10D',
    title: '8051 Counter 1 in Mode 1 (16-bit Counter) – 80 µs Delay & Blink Port P3 Pins',
    aim: 'Write an Assembly Language Program to 8051 Microcontroller to create a delay of 80 µsec using counter1 in mode 1 and blink all the Pins of P3.',
    directivesUsed: ['ORG', 'EQU', 'END'],
    instructionsUsed: ['MOV', 'SETB', 'CLR', 'JNB', 'CPL', 'ACALL', 'SJMP'],
    algorithm: [
      'Set Counter/Timer 1 in Mode 1: Set TMOD = 50H for external pulse counter on pin T1 (P3.5) with C/T=1, or TMOD = 10H for internal machine cycle timer with C/T=0 (GATE=0, M1=0, M0=1).',
      'Calculate 16-bit Preload Count for 80 µs (80 clock pulses): At 12 MHz (1 cycle = 1 µs), 80 µs requires 80 counts. 16-bit Initial Count = 65,536 - 80 = 65,456 = FFB0H (TH1 = 0FFH, TL1 = 0B0H).',
      'Blink Port P3: Invert all pins of Port 3 (`CPL P3`) to toggle all 8 pins of Port 3.',
      'Call DELAY_80US subroutine: Load TH1 = 0FFH and TL1 = 0B0H, start Counter 1 via `SETB TR1`.',
      'Poll Overflow Flag TF1: Wait in loop `JNB TF1, $` until 80 counts advance counter from FFB0H to FFFFH and overflow to 0000H, setting TF1 = 1.',
      'Stop Counter 1 (`CLR TR1`), clear overflow flag (`CLR TF1`), and return with `RET`.',
      'Repeat in an infinite loop (`SJMP AGAIN`) to generate continuous 80 µs toggling on Port P3.'
    ],
    standardCode: `ORG 0000H                              ; Reset Vector
    LJMP MAIN

ORG 0030H                              ; Code Origin
MAIN:
    MOV TMOD, #50H                     ; Counter 1, Mode 1 (16-bit Counter Mode on Pin T1/P3.5)
                                       ; (Or use TMOD = 10H for internal timer mode)
    MOV P3, #00H                       ; Initialize Port 3 pins LOW

AGAIN:
    CPL P3                             ; Invert all pins of Port 3 (Blink P3 outputs)
    ACALL DELAY_80US                   ; Call 80 µs delay subroutine
    SJMP AGAIN                         ; Repeat continuously

; =============================================================================
; DELAY SUBROUTINE: 80 MICROSECOND DELAY USING COUNTER 1 MODE 1 (16-BIT)
; Oscillator: 12.000 MHz -> 1 Machine Cycle = 1 µs (or 80 pulses on T1 pin)
; Required Count = 80 pulses / microseconds
; 16-bit Preload Count = 65,536 - 80 = 65,456 = FFB0H
; TH1 = 0FFH, TL1 = 0B0H
; =============================================================================
DELAY_80US:
    MOV TH1, #0FFH                     ; Load Counter 1 High Byte (FFH)
    MOV TL1, #0B0H                     ; Load Counter 1 Low Byte (B0H = 176D)
    SETB TR1                           ; Start Counter 1 (TCON.6 = 1)

WAIT_TF1:
    JNB TF1, WAIT_TF1                  ; Wait until 80 pulses cause overflow (TF1 = 1)

    CLR TR1                            ; Stop Counter 1
    CLR TF1                            ; Clear Counter 1 Overflow Flag
    RET                                ; Return from subroutine

END                                    ; End of source module`,
    simplifiedCode: `ORG 0000H
    MOV TMOD, #50H                     ; Counter 1 Mode 1 (16-bit Counter on T1)
    MOV P3, #00H

LOOP_P3:
    CPL P3                             ; Blink Port 3 pins
    MOV TH1, #0FFH                     ; Preload FFB0H (65456) for 80 pulses
    MOV TL1, #0B0H
    SETB TR1                           ; Start Counter 1
POLL:
    JNB TF1, POLL                      ; Wait for TF1 = 1
    CLR TR1                            ; Stop Counter 1
    CLR TF1                            ; Clear flag
    SJMP LOOP_P3                       ; Repeat
END`,
    bestPracticeTip: 'When configuring Timer 1 as an external Counter (C/T=1), the maximum external input pulse frequency cannot exceed 1/24 of the oscillator clock frequency (f_osc / 24 = 500 kHz at 12 MHz) due to internal 2-cycle sampling rules.'
  },
  {
    id: 'exp_8051_uart_9600',
    number: '11A',
    title: '8051 UART Serial Character Transfer at 9600 Baud Rate',
    aim: 'Write an 8051 Assembly Language Program to transfer a character serially with a baud rate of 9600 using UART.',
    directivesUsed: ['ORG', 'EQU', 'END'],
    instructionsUsed: ['MOV', 'SETB', 'CLR', 'JNB', 'SJMP', 'LJMP'],
    algorithm: [
      'Configure Timer 1 in Mode 2 (8-bit Auto-Reload): Set TMOD = 20H (GATE=0, C/T=0, M1=1, M0=0).',
      'Calculate Baud Rate Reload Value for 9600 Baud: With 11.0592 MHz crystal and SMOD=0, Timer 1 clock = 11.0592 MHz / (12 × 32) = 28,800 Hz. Reload count = 28,800 / 9600 = 3 -> TH1 = 256 - 3 = 253 = 0FDH.',
      'Configure Serial Control Register (SCON): Set SCON = 50H for Mode 1 (8-bit UART, 1 start bit, 8 data bits, 1 stop bit) and enable receiver (REN=1).',
      'Start Timer 1: SETB TR1 to activate the baud rate clock generator.',
      'Load Character into SBUF: Move ASCII character byte (e.g., MOV SBUF, #\'A\') into the Serial Buffer register to automatically start transmission.',
      'Poll Transmit Interrupt Flag (TI): Wait in a loop (JNB TI, $) until hardware sets TI = 1, indicating all 10 bits of the frame have been transmitted.',
      'Clear Transmit Flag: Clear TI via CLR TI to ready the serial port for subsequent transmissions.',
      'Repeat Loop: Jump back to AGAIN to transmit continuously.'
    ],
    standardCode: `ORG 0000H                              ; Reset vector
    LJMP MAIN

ORG 0030H                              ; Main program entry
MAIN:
    MOV TMOD, #20H                     ; Timer 1, Mode 2 (8-bit Auto-Reload Baud Rate Generator)
    MOV TH1, #0FDH                     ; Set Baud Rate to 9600 (256 - 3 = 253D = FDH at 11.0592 MHz)
    MOV SCON, #50H                     ; 8-bit UART Mode 1 (1 Start, 8 Data, 1 Stop bit), REN=1 (Receiver Enabled)
    SETB TR1                           ; Start Timer 1 to generate baud clock

AGAIN:
    MOV SBUF, #'A'                     ; Load ASCII character 'A' (41H) into Serial Buffer to start transmission

WAIT_TI:
    JNB TI, WAIT_TI                    ; Poll TI flag until character transmission is complete (TI = 1)

    CLR TI                             ; Clear TI flag for the next serial character frame
    SJMP AGAIN                         ; Repeat transmission continuously

END                                    ; End of source module`,
    simplifiedCode: `ORG 0000H
    MOV TMOD, #20H                     ; Timer 1 Mode 2 Auto-Reload
    MOV TH1, #0FDH                     ; 9600 Baud reload (FDH = -3)
    MOV SCON, #50H                     ; 8-bit UART Mode 1, REN=1
    SETB TR1                           ; Start Timer 1
TX_LOOP:
    MOV SBUF, #'A'                     ; Send ASCII 'A' (41H)
WAIT_TX:
    JNB TI, WAIT_TX                    ; Wait for TI = 1 (transmission finished)
    CLR TI                             ; Clear TI flag
    SJMP TX_LOOP                       ; Repeat continuously
END`,
    bestPracticeTip: 'Always clear TI with software instruction `CLR TI` after every serial transmission; the 8051 hardware asserts TI on completion but never clears it automatically.'
  },
  {
    id: 'exp_8051_uart_4800',
    number: '11B',
    title: '8051 UART Serial Character Transfer at 4800 Baud Rate',
    aim: 'Write an 8051 Assembly Language Program to transfer a character serially with a baud rate of 4800 using UART.',
    directivesUsed: ['ORG', 'EQU', 'END'],
    instructionsUsed: ['MOV', 'SETB', 'CLR', 'JNB', 'SJMP', 'LJMP'],
    algorithm: [
      'Configure Timer 1 in Mode 2 (8-bit Auto-Reload): Set TMOD = 20H.',
      'Calculate Baud Rate Reload Value for 4800 Baud: With 11.0592 MHz crystal and SMOD=0, Timer 1 clock = 28,800 Hz. Reload count = 28,800 / 4800 = 6 -> TH1 = 256 - 6 = 250 = 0FAH.',
      'Configure SCON: Set SCON = 50H for Mode 1 (8-bit UART, 1 start, 8 data, 1 stop bit, REN=1).',
      'Start Baud Rate Clock: SETB TR1.',
      'Transmit Character: Move ASCII character byte (e.g., MOV SBUF, #\'B\') into SBUF.',
      'Poll TI Flag: Wait in loop JNB TI, $ until TI becomes 1.',
      'Clear TI Flag: CLR TI.',
      'Repeat: Jump to AGAIN to transmit serially in an infinite loop.'
    ],
    standardCode: `ORG 0000H                              ; Reset vector
    LJMP MAIN

ORG 0030H                              ; Main program entry
MAIN:
    MOV TMOD, #20H                     ; Timer 1, Mode 2 (8-bit Auto-Reload Baud Rate Generator)
    MOV TH1, #0FAH                     ; Set Baud Rate to 4800 (256 - 6 = 250D = FAH at 11.0592 MHz)
    MOV SCON, #50H                     ; 8-bit UART Mode 1 (1 Start, 8 Data, 1 Stop bit), REN=1
    SETB TR1                           ; Start Timer 1 to run baud rate clock

AGAIN:
    MOV SBUF, #'B'                     ; Load ASCII character 'B' (42H) into SBUF to begin serial transmission

WAIT_TI:
    JNB TI, WAIT_TI                    ; Poll TI flag until complete 10-bit frame is transmitted (TI = 1)

    CLR TI                             ; Clear TI flag for subsequent transmissions
    SJMP AGAIN                         ; Repeat transmission continuously

END                                    ; End of source module`,
    simplifiedCode: `ORG 0000H
    MOV TMOD, #20H                     ; Timer 1 Mode 2 (8-bit Auto-Reload)
    MOV TH1, #0FAH                     ; 4800 Baud reload (FAH = -6)
    MOV SCON, #50H                     ; Mode 1 8-bit UART, REN=1
    SETB TR1                           ; Start Timer 1
TX_LOOP:
    MOV SBUF, #'B'                     ; Send ASCII 'B' (42H)
WAIT_TX:
    JNB TI, WAIT_TX                    ; Wait for TI = 1
    CLR TI                             ; Clear TI flag
    SJMP TX_LOOP                       ; Repeat continuously
END`,
    bestPracticeTip: 'At 4800 Baud, each bit period is 1 / 4800 = 208.33 µs, and each 10-bit asynchronous character frame takes 2.083 ms to transmit.'
  },
  {
    id: 'exp_8051_uart_2400',
    number: '11C',
    title: '8051 UART Serial Character Transfer at 2400 Baud Rate',
    aim: 'Write an 8051 Assembly Language Program to transfer a character serially with a baud rate of 2400 using UART.',
    directivesUsed: ['ORG', 'EQU', 'END'],
    instructionsUsed: ['MOV', 'SETB', 'CLR', 'JNB', 'SJMP', 'LJMP'],
    algorithm: [
      'Configure Timer 1 in Mode 2 (8-bit Auto-Reload): Set TMOD = 20H.',
      'Calculate Baud Rate Reload Value for 2400 Baud: With 11.0592 MHz crystal and SMOD=0, Timer 1 clock = 28,800 Hz. Reload count = 28,800 / 2400 = 12 -> TH1 = 256 - 12 = 244 = 0F4H.',
      'Configure SCON: Set SCON = 50H for Mode 1 (8-bit UART, 1 start, 8 data, 1 stop bit, REN=1).',
      'Start Baud Rate Generator: SETB TR1.',
      'Transmit Character: Move ASCII character byte (e.g., MOV SBUF, #\'C\') into SBUF.',
      'Poll TI Flag: Wait in loop JNB TI, $ until TI becomes 1.',
      'Clear TI Flag: CLR TI.',
      'Repeat: Jump to AGAIN to transmit serially in an infinite loop.'
    ],
    standardCode: `ORG 0000H                              ; Reset vector
    LJMP MAIN

ORG 0030H                              ; Main program entry
MAIN:
    MOV TMOD, #20H                     ; Timer 1, Mode 2 (8-bit Auto-Reload Baud Rate Generator)
    MOV TH1, #0F4H                     ; Set Baud Rate to 2400 (256 - 12 = 244D = F4H at 11.0592 MHz)
    MOV SCON, #50H                     ; 8-bit UART Mode 1 (1 Start, 8 Data, 1 Stop bit), REN=1
    SETB TR1                           ; Start Timer 1 baud clock

AGAIN:
    MOV SBUF, #'C'                     ; Load ASCII character 'C' (43H) into SBUF to transmit serially

WAIT_TI:
    JNB TI, WAIT_TI                    ; Poll TI flag until frame transmission is finished (TI = 1)

    CLR TI                             ; Clear TI flag for subsequent character
    SJMP AGAIN                         ; Repeat transmission continuously

END                                    ; End of source module`,
    simplifiedCode: `ORG 0000H
    MOV TMOD, #20H                     ; Timer 1 Mode 2 Auto-Reload
    MOV TH1, #0F4H                     ; 2400 Baud reload (F4H = -12)
    MOV SCON, #50H                     ; Mode 1 8-bit UART, REN=1
    SETB TR1                           ; Start Timer 1
TX_LOOP:
    MOV SBUF, #'C'                     ; Send ASCII 'C' (43H)
WAIT_TX:
    JNB TI, WAIT_TX                    ; Wait for TI = 1
    CLR TI                             ; Clear TI flag
    SJMP TX_LOOP                       ; Repeat continuously
END`,
    bestPracticeTip: 'Standard baud rates (2400, 4800, 9600) require an 11.0592 MHz crystal to produce zero percent frequency error; a 12.0 MHz crystal results in a ~8.5% timing error which causes frame corruption.'
  },
  {
    id: 'exp_8051_lcd_8bit',
    number: '12A',
    title: 'Interfacing 16×2 LCD with 8051 Microcontroller (8-Bit Mode)',
    aim: 'Develop and execute an 8051 Assembly Language Program to interface a 16×2 Alphanumeric LCD module to 8051 in 8-bit mode and display alphanumeric messages.',
    directivesUsed: ['ORG', 'EQU', 'DB', 'END'],
    instructionsUsed: ['MOV', 'SETB', 'CLR', 'ACALL', 'LCALL', 'RET', 'SJMP', 'LJMP', 'MOVC'],
    algorithm: [
      'Initialize LCD Control Pins: Define RS = P2.0 (Register Select), RW = P2.1 (Read/Write), EN = P2.2 (Enable), and Data Bus = Port P1 (D0-D7).',
      'Power-on Delay: Call 20 ms startup delay to let the HD44780 controller internal voltage stabilize.',
      'Send Initialization Commands in 8-bit mode: Call COMNW with 38H (2 lines, 5×7 matrix, 8-bit bus), 0EH (Display ON, cursor ON), 01H (Clear display screen), and 06H (Auto-increment cursor from left to right).',
      'Set DDRAM Cursor Position for Line 1: Send command 80H (Line 1, Column 1).',
      'Display Line 1 Text: Send ASCII character codes byte-by-byte (e.g., \'8\', \'0\', \'5\', \'1\', \' \', \'L\', \'C\', \'D\') using DATAW subroutine (RS=1, RW=0, EN pulse).',
      'Set DDRAM Cursor Position for Line 2: Send command C0H (Line 2, Column 1).',
      'Display Line 2 Text: Send ASCII characters byte-by-byte (e.g., \'8\', \'-\', \'B\', \'I\', \'T\', \' \', \'M\', \'O\', \'D\', \'E\') using DATAW subroutine.',
      'Halt CPU via SJMP $ or enter dynamic display refresh loop.'
    ],
    standardCode: `ORG 0000H                              ; Reset Vector
    LJMP MAIN

; =============================================================================
; 8051 TO 16x2 LCD HARDWARE PIN MAPPINGS (8-BIT INTERFACE)
; Port P1: D0 - D7 (Pins 7 to 14 of LCD Module)
; P2.0: RS (Register Select: 0 = Command Reg, 1 = Data Reg)
; P2.1: RW (Read / Write: 0 = Write, 1 = Read)
; P2.2: EN (Enable: High-to-Low Active Strobe Pulse >= 450ns)
; =============================================================================
RS  EQU P2.0
RW  EQU P2.1
EN  EQU P2.2
LCD EQU P1

ORG 0030H                              ; Main Code Origin
MAIN:
    MOV LCD, #00H                      ; Initialize Port P1 lines LOW
    CLR RS                             ; Default Command mode
    CLR RW                             ; Default Write mode
    CLR EN                             ; Default Enable LOW
    ACALL DELAY_20MS                   ; Power-on stabilization delay (>15ms)

    ; --- Step 1: LCD Initialization Command Sequence ---
    MOV A, #38H                        ; 8-bit mode, 2 display lines, 5x7 dot font
    ACALL LCD_CMD

    MOV A, #0EH                        ; Display ON, Cursor ON, Cursor Blink OFF
    ACALL LCD_CMD

    MOV A, #01H                        ; Clear display screen & reset cursor to Home
    ACALL LCD_CMD
    ACALL DELAY_2MS                    ; Clear command requires >1.53ms execution time

    MOV A, #06H                        ; Entry mode: Auto-increment cursor, No display shift
    ACALL LCD_CMD

    ; --- Step 2: Set Cursor to Line 1 Column 1 (DDRAM 80H) & Display String 1 ---
    MOV A, #80H                        ; Set DDRAM address to 00H (Row 1, Col 1)
    ACALL LCD_CMD

    MOV DPTR, #MSG_LINE1               ; Point DPTR to Line 1 string in ROM
    ACALL LCD_DISPLAY_STRING           ; Send characters until NULL terminator (00H)

    ; --- Step 3: Set Cursor to Line 2 Column 1 (DDRAM C0H) & Display String 2 ---
    MOV A, #0C0H                       ; Set DDRAM address to 40H (Row 2, Col 1)
    ACALL LCD_CMD

    MOV DPTR, #MSG_LINE2               ; Point DPTR to Line 2 string in ROM
    ACALL LCD_DISPLAY_STRING

HALT:
    SJMP HALT                          ; Halt execution

; =============================================================================
; LCD COMMAND WRITE SUBROUTINE (LCD_CMD)
; Inputs: Command byte in Accumulator A
; Operations: RS=0, RW=0, Put byte on Port P1, Strobe EN pin (High->Low)
; =============================================================================
LCD_CMD:
    MOV LCD, A                         ; Present command byte on Port P1 (D0-D7)
    CLR RS                             ; RS = 0 (Select LCD Instruction/Command Register)
    CLR RW                             ; RW = 0 (Write Operation)
    SETB EN                            ; EN = 1 (Latch pulse start)
    ACALL DELAY_SHORT                  ; High pulse width >= 450 ns
    CLR EN                             ; EN = 0 (Falling edge latches command byte)
    ACALL DELAY_2MS                    ; Allow LCD internal controller to execute command
    RET

; =============================================================================
; LCD DATA WRITE SUBROUTINE (LCD_DATA)
; Inputs: ASCII character byte in Accumulator A
; Operations: RS=1, RW=0, Put byte on Port P1, Strobe EN pin (High->Low)
; =============================================================================
LCD_DATA:
    MOV LCD, A                         ; Present ASCII byte on Port P1 (D0-D7)
    SETB RS                            ; RS = 1 (Select LCD Data Register / DDRAM)
    CLR RW                             ; RW = 0 (Write Operation)
    SETB EN                            ; EN = 1 (Latch pulse start)
    ACALL DELAY_SHORT                  ; High pulse width >= 450 ns
    CLR EN                             ; EN = 0 (Falling edge latches data byte)
    ACALL DELAY_50US                   ; Character write execution time (~43 µs)
    RET

; =============================================================================
; STRING DISPLAY SUBROUTINE (Reads ROM string until NULL 00H)
; =============================================================================
LCD_DISPLAY_STRING:
    CLR A
    MOVC A, @A+DPTR                    ; Fetch character from code ROM
    JZ STR_DONE                        ; If character is 00H (Null), finish
    ACALL LCD_DATA                     ; Write character to LCD
    INC DPTR                           ; Advance pointer
    SJMP LCD_DISPLAY_STRING
STR_DONE:
    RET

; =============================================================================
; SOFTWARE DELAY ROUTINES (AT 11.0592 MHz / 12 MHz)
; =============================================================================
DELAY_SHORT:
    NOP
    NOP
    NOP
    RET

DELAY_50US:
    MOV R7, #25                        ; ~50 µs delay
    DJNZ R7, $
    RET

DELAY_2MS:
    MOV R6, #4                         ; ~2.0 ms execution delay
D2M_1:
    MOV R7, #250
    DJNZ R7, $
    DJNZ R6, D2M_1
    RET

DELAY_20MS:
    MOV R5, #40                        ; ~20.0 ms power-on stabilization delay
D20M_1:
    MOV R6, #250
    DJNZ R6, $
    DJNZ R5, D20M_1
    RET

; =============================================================================
; STRING CONSTANTS IN CODE ROM
; =============================================================================
MSG_LINE1: DB '8051 INTERFACE', 00H
MSG_LINE2: DB '16x2 LCD 8-BIT', 00H

END`,
    simplifiedCode: `ORG 0000H
    ; Initialize 16x2 LCD in 8-Bit Mode
    MOV P1, #38H                       ; 2 lines, 5x7 matrix, 8-bit bus
    CLR P2.0                           ; RS = 0 (Command)
    CLR P2.1                           ; RW = 0 (Write)
    SETB P2.2                          ; EN = 1
    CLR P2.2                           ; EN = 0 (Latch)

    MOV P1, #0EH                       ; Display ON, Cursor ON
    SETB P2.2
    CLR P2.2

    MOV P1, #01H                       ; Clear Screen
    SETB P2.2
    CLR P2.2

    MOV P1, #80H                       ; Line 1, Column 1
    SETB P2.2
    CLR P2.2

    ; Write Character 'A'
    MOV P1, #'A'                       ; ASCII 41H
    SETB P2.0                          ; RS = 1 (Data)
    CLR P2.1                           ; RW = 0 (Write)
    SETB P2.2
    CLR P2.2

    SJMP $
END`,
    bestPracticeTip: 'Always provide at least a 15–20 ms delay upon power-up before issuing initialization commands to allow the HD44780 internal Power-On Reset (POR) circuit to settle.'
  },
  {
    id: 'exp_8051_lcd_4bit',
    number: '12B',
    title: 'Interfacing 16×2 LCD with 8051 Microcontroller in 4-Bit Mode',
    aim: 'Develop and execute an 8051 Assembly Language Program to interface a 16×2 LCD to 8051 in 4-bit mode (saving 4 microcontroller I/O lines) and display custom text.',
    directivesUsed: ['ORG', 'EQU', 'DB', 'END'],
    instructionsUsed: ['MOV', 'ANL', 'ORL', 'SWAP', 'SETB', 'CLR', 'ACALL', 'LCALL', 'RET', 'SJMP', 'LJMP', 'MOVC'],
    algorithm: [
      'Initialize Hardware Connections: Connect LCD pins D4-D7 to 8051 Port P1.4-P1.7. Connect RS to P2.0, RW to P2.1, and EN to P2.2. Leave D0-D3 unconnected or grounded.',
      'Power-on Delay: Wait 20 ms after VDD rises to 4.5V.',
      '4-Bit Initialization Protocol: Send 33H (via two 30H nibbles) and 32H (30H then 20H nibble) to force HD44780 from 8-bit reset state into 4-bit bus mode.',
      'Configure LCD in 4-bit Mode: Send 28H (4-bit interface, 2 lines, 5×7 font), 0EH (Display ON, cursor ON), 01H (Clear display), and 06H (Auto-increment cursor).',
      '4-Bit Command Transmission Method: Split 8-bit command into two 4-bit nibbles. Mask and send upper 4 bits (D7-D4) to P1.4-P1.7 with RS=0, RW=0, strobe EN. Then SWAP Accumulator, mask lower 4 bits (D3-D0), and strobe EN again.',
      '4-Bit Data Transmission Method: Send ASCII byte in two 4-bit nibbles with RS=1, RW=0, and an EN strobe for each nibble.',
      'Position Cursor and Write Strings: Send 80H for Line 1 ("4-BIT LCD MODE") and C0H for Line 2 ("SAVING 4 I/O PINS").',
      'Halt CPU in infinite loop.'
    ],
    standardCode: `ORG 0000H                              ; Reset Vector
    LJMP MAIN

; =============================================================================
; 8051 TO 16x2 LCD PIN CONNECTIONS (4-BIT INTERFACE)
; P1.4 - P1.7: Connected to LCD D4 - D7 (Data Lines)
; P2.0: RS (Register Select: 0 = Command, 1 = Data)
; P2.1: RW (Read / Write: 0 = Write, 1 = Read)
; P2.2: EN (Enable Pulse: Active High-to-Low Strobe)
; Note: LCD Pins D0 - D3 are left unconnected / grounded
; =============================================================================
RS  EQU P2.0
RW  EQU P2.1
EN  EQU P2.2

ORG 0030H                              ; Main Code Origin
MAIN:
    CLR RS                             ; Initialize control signals LOW
    CLR RW
    CLR EN
    MOV P1, #00H                       ; Clear Port 1
    ACALL DELAY_20MS                   ; Power-on stabilization delay (>15ms)

    ; --- 4-Bit Special Reset Handshake Sequence ---
    ; Step 1: Send 30H (upper nibble 3)
    MOV A, #30H
    ACALL LCD_SEND_NIBBLE
    ACALL DELAY_5MS

    ; Step 2: Send 30H (upper nibble 3)
    MOV A, #30H
    ACALL LCD_SEND_NIBBLE
    ACALL DELAY_1MS

    ; Step 3: Send 30H (upper nibble 3)
    MOV A, #30H
    ACALL LCD_SEND_NIBBLE
    ACALL DELAY_1MS

    ; Step 4: Send 20H (Switch HD44780 into 4-bit bus mode!)
    MOV A, #20H
    ACALL LCD_SEND_NIBBLE
    ACALL DELAY_1MS

    ; --- Regular 4-Bit Dual-Nibble Commands ---
    MOV A, #28H                        ; 4-bit mode, 2 display lines, 5x7 font
    ACALL LCD_CMD_4BIT

    MOV A, #0EH                        ; Display ON, Cursor ON
    ACALL LCD_CMD_4BIT

    MOV A, #01H                        ; Clear display screen
    ACALL LCD_CMD_4BIT
    ACALL DELAY_2MS

    MOV A, #06H                        ; Entry mode: Auto-increment cursor
    ACALL LCD_CMD_4BIT

    ; --- Write Line 1 Message ---
    MOV A, #80H                        ; Line 1, Column 1
    ACALL LCD_CMD_4BIT

    MOV DPTR, #MSG_4BIT_1              ; Line 1 text string
    ACALL LCD_DISPLAY_STRING_4BIT

    ; --- Write Line 2 Message ---
    MOV A, #0C0H                       ; Line 2, Column 1
    ACALL LCD_CMD_4BIT

    MOV DPTR, #MSG_4BIT_2              ; Line 2 text string
    ACALL LCD_DISPLAY_STRING_4BIT

HALT:
    SJMP HALT                          ; Halt execution

; =============================================================================
; 4-BIT COMMAND ROUTINE (Sends 8-bit command in two 4-bit nibbles)
; Inputs: Command byte in Accumulator A
; =============================================================================
LCD_CMD_4BIT:
    PUSH ACC                           ; Save copy of command
    CLR RS                             ; RS = 0 (Command register select)
    CLR RW                             ; RW = 0 (Write)

    ; Send Higher Nibble (D7 - D4)
    ANL A, #0F0H                       ; Mask lower nibble
    MOV P1, A                          ; Put upper nibble on P1.4 - P1.7
    SETB EN                            ; EN = 1
    ACALL DELAY_SHORT
    CLR EN                             ; EN = 0 (Latch upper nibble)

    ; Send Lower Nibble (D3 - D0)
    POP ACC                            ; Restore original byte
    SWAP A                             ; Swap lower nibble into upper 4 bits
    ANL A, #0F0H                       ; Mask lower nibble
    MOV P1, A                          ; Put lower nibble on P1.4 - P1.7
    SETB EN                            ; EN = 1
    ACALL DELAY_SHORT
    CLR EN                             ; EN = 0 (Latch lower nibble)

    ACALL DELAY_2MS                    ; Command execution delay
    RET

; =============================================================================
; 4-BIT DATA ROUTINE (Sends ASCII character in two 4-bit nibbles)
; Inputs: ASCII character in Accumulator A
; =============================================================================
LCD_DATA_4BIT:
    PUSH ACC                           ; Save copy of data byte
    SETB RS                            ; RS = 1 (Data register select)
    CLR RW                             ; RW = 0 (Write)

    ; Send Higher Nibble (D7 - D4)
    ANL A, #0F0H                       ; Mask lower nibble
    MOV P1, A                          ; Put upper nibble on P1.4 - P1.7
    SETB EN                            ; EN = 1
    ACALL DELAY_SHORT
    CLR EN                             ; EN = 0 (Latch upper nibble)

    ; Send Lower Nibble (D3 - D0)
    POP ACC                            ; Restore original byte
    SWAP A                             ; Swap lower nibble into upper 4 bits
    ANL A, #0F0H                       ; Mask lower nibble
    MOV P1, A                          ; Put lower nibble on P1.4 - P1.7
    SETB EN                            ; EN = 1
    ACALL DELAY_SHORT
    CLR EN                             ; EN = 0 (Latch lower nibble)

    ACALL DELAY_50US                   ; Character write delay
    RET

; =============================================================================
; SEND SINGLE NIBBLE SUBROUTINE (Used during 4-bit initialization)
; =============================================================================
LCD_SEND_NIBBLE:
    CLR RS                             ; RS = 0 (Command)
    CLR RW                             ; RW = 0 (Write)
    ANL A, #0F0H                       ; Mask lower 4 bits
    MOV P1, A                          ; Put nibble on P1.4 - P1.7
    SETB EN                            ; EN = 1
    ACALL DELAY_SHORT
    CLR EN                             ; EN = 0 (Latch)
    RET

; =============================================================================
; STRING DISPLAY SUBROUTINE FOR 4-BIT MODE
; =============================================================================
LCD_DISPLAY_STRING_4BIT:
    CLR A
    MOVC A, @A+DPTR                    ; Fetch byte from ROM
    JZ STR_4B_DONE                     ; If NULL, done
    ACALL LCD_DATA_4BIT                ; Send byte in two 4-bit nibbles
    INC DPTR
    SJMP LCD_DISPLAY_STRING_4BIT
STR_4B_DONE:
    RET

; =============================================================================
; TIMING DELAYS
; =============================================================================
DELAY_SHORT:
    NOP
    NOP
    RET

DELAY_50US:
    MOV R7, #25
    DJNZ R7, $
    RET

DELAY_1MS:
    MOV R6, #2
D1M_1:
    MOV R7, #250
    DJNZ R7, $
    DJNZ R6, D1M_1
    RET

DELAY_2MS:
    MOV R6, #4
D2M_1:
    MOV R7, #250
    DJNZ R7, $
    DJNZ R6, D2M_1
    RET

DELAY_5MS:
    MOV R6, #10
D5M_1:
    MOV R7, #250
    DJNZ R7, $
    DJNZ R6, D5M_1
    RET

DELAY_20MS:
    MOV R5, #40
D20M_1:
    MOV R6, #250
    DJNZ R6, $
    DJNZ R5, D20M_1
    RET

; =============================================================================
; MESSAGE STRINGS
; =============================================================================
MSG_4BIT_1: DB '4-BIT LCD MODE', 00H
MSG_4BIT_2: DB 'SAVING 4 I/O PINS', 00H

END`,
    simplifiedCode: `; Concise 4-Bit LCD Demo Program
ORG 0000H
    CLR P2.0                           ; RS = 0 (Command)
    CLR P2.1                           ; RW = 0 (Write)
    CLR P2.2                           ; EN = 0

    ; Step 1: Force into 4-bit mode (Send 33H, 32H)
    MOV P1, #30H                       ; Nibble 3
    SETB P2.2
    CLR P2.2
    MOV P1, #30H                       ; Nibble 3
    SETB P2.2
    CLR P2.2
    MOV P1, #30H                       ; Nibble 3
    SETB P2.2
    CLR P2.2
    MOV P1, #20H                       ; Nibble 2 (Sets 4-bit bus)
    SETB P2.2
    CLR P2.2

    ; Step 2: Configure 2-line 5x7 font (Cmd 28H)
    MOV P1, #20H                       ; High nibble 2
    SETB P2.2
    CLR P2.2
    MOV P1, #80H                       ; Low nibble 8
    SETB P2.2
    CLR P2.2

    ; Step 3: Display ON, Cursor ON (Cmd 0EH)
    MOV P1, #00H                       ; High nibble 0
    SETB P2.2
    CLR P2.2
    MOV P1, #0E0H                      ; Low nibble E
    SETB P2.2
    CLR P2.2

    ; Step 4: Clear Display (Cmd 01H)
    MOV P1, #00H
    SETB P2.2
    CLR P2.2
    MOV P1, #10H
    SETB P2.2
    CLR P2.2

    ; Step 5: Write Char 'B' (ASCII 42H: High nibble 4, Low nibble 2)
    SETB P2.0                          ; RS = 1 (Data)
    MOV P1, #40H                       ; High nibble 4
    SETB P2.2
    CLR P2.2
    MOV P1, #20H                       ; Low nibble 2
    SETB P2.2
    CLR P2.2

    SJMP $
END`,
    bestPracticeTip: 'In 4-bit mode, sending a single byte always requires two Enable strobe cycles: first for the high nibble (D7-D4), followed immediately by the low nibble (D3-D0).'
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
      desc: 'NUM1 = FCFDFEFFH, NUM2 = 04030201H',
      inputs: [{ name: 'NUM1', val: 'FF FE FD FC' }, { name: 'NUM2', val: '01 02 03 04' }],
      outputs: [{ name: 'ADD_RESULT', val: '00 01 01 01' }, { name: 'SUB_RESULT', val: 'EE FC FA F8' }],
      registers: 'AX=4C00H BX=0004H CX=0000H',
      terminalDump: '-g\nAX=4C00 BX=0004 CX=0000 DS=1000'
    },
    manualCalculations: {
      title: '32-bit Addition & Subtraction Manual Arithmetic Proof (Byte-by-Byte)',
      steps: [
        {
          step: 'Operand Little-Endian Layout',
          detail: 'NUM1 = FCFDFEFFH → Byte 0 (LSB) = FFH, Byte 1 = FEH, Byte 2 = FDH, Byte 3 (MSB) = FCH.  NUM2 = 04030201H → Byte 0 = 01H, Byte 1 = 02H, Byte 2 = 03H, Byte 3 = 04H. Initial Carry Flag CF = 0.'
        },
        {
          step: 'Addition Byte 0 (LSB: [SI=0] + [DI=0])',
          detail: 'AL = [NUM1+0] + [NUM2+0] + CF = FFH (255) + 01H (1) + 0 = 100H.  AL stores lower 8 bits = 00H; Carry generated to next byte (CF = 1). RESULT_ADD[0] = 00H.'
        },
        {
          step: 'Addition Byte 1 ([SI=1] + [DI=1])',
          detail: 'AL = [NUM1+1] + [NUM2+1] + CF = FEH (254) + 02H (2) + 1 (Carry from Byte 0) = 101H.  AL stores 01H; Carry generated (CF = 1). RESULT_ADD[1] = 01H.'
        },
        {
          step: 'Addition Byte 2 ([SI=2] + [DI=2])',
          detail: 'AL = [NUM1+2] + [NUM2+2] + CF = FDH (253) + 03H (3) + 1 (Carry from Byte 1) = 101H.  AL stores 01H; Carry generated (CF = 1). RESULT_ADD[2] = 01H.'
        },
        {
          step: 'Addition Byte 3 (MSB: [SI=3] + [DI=3])',
          detail: 'AL = [NUM1+3] + [NUM2+3] + CF = FCH (252) + 04H (4) + 1 (Carry from Byte 2) = 101H.  AL stores 01H; Final Carry out CF = 1. RESULT_ADD[3] = 01H.  FINAL_CARRY = 01H.  Full 32-bit Sum = 01010100H (Bytes: 00 01 01 01).'
        },
        {
          step: 'Subtraction Byte 0 (LSB: [SI=0] - [DI=0])',
          detail: 'AL = [NUM1+0] - [NUM2+0] - Borrow = FFH (255) - 01H (1) - 0 = FEH (254).  No borrow generated (Borrow CF = 0). RESULT_SUB[0] = FEH.'
        },
        {
          step: 'Subtraction Byte 1 ([SI=1] - [DI=1])',
          detail: 'AL = [NUM1+1] - [NUM2+1] - Borrow = FEH (254) - 02H (2) - 0 = FCH (252).  No borrow generated (Borrow CF = 0). RESULT_SUB[1] = FCH.'
        },
        {
          step: 'Subtraction Byte 2 ([SI=2] - [DI=2])',
          detail: 'AL = [NUM1+2] - [NUM2+2] - Borrow = FDH (253) - 03H (3) - 0 = FAH (250).  No borrow generated (Borrow CF = 0). RESULT_SUB[2] = FAH.'
        },
        {
          step: 'Subtraction Byte 3 (MSB: [SI=3] - [DI=3])',
          detail: 'AL = [NUM1+3] - [NUM2+3] - Borrow = FCH (252) - 04H (4) - 0 = F8H (248).  Final Borrow CF = 0. RESULT_SUB[3] = F8H.  FINAL_BORROW = 00H.  Full 32-bit Difference = F8FAFCFEH (Bytes: FE FC FA F8).'
        },
        {
          step: 'Combined Verification Summary Table',
          detail: 'Addition: FCFDFEFFH + 04030201H = 101010100H (32-bit Sum: 01010100H, Carry Out: 1)  |  Subtraction: FCFDFEFFH - 04030201H = F8FAFCFEH (Borrow Out: 0). Exact match with CPU registers & memory dumps.'
        }
      ]
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
      desc: 'Unsigned: VAL1 = 0A12H (2578D), VAL2 = 0050H (80D) | Signed: S_VAL1 = -25D (FFE7H), S_VAL2 = +5D (0005H)',
      inputs: [
        { name: 'VAL1 (Unsigned Multiplicand / Dividend)', val: '0A12H (Decimal: 2578)' },
        { name: 'VAL2 (Unsigned Multiplier / Divisor)', val: '0050H (Decimal: 80)' },
        { name: 'S_VAL1 (Signed Multiplicand / Dividend)', val: 'FFE7H (Decimal: -25)' },
        { name: 'S_VAL2 (Signed Multiplier / Divisor)', val: '0005H (Decimal: +5)' }
      ],
      outputs: [
        { name: 'U_PROD (Unsigned Product DX:AX)', val: '000325A0H (Decimal: 206,240)' },
        { name: 'U_QUOT / U_REM (Unsigned Div)', val: 'Quot AX = 0020H (32D), Rem DX = 0012H (18D)' },
        { name: 'S_PROD (Signed Product DX:AX)', val: 'FFFFFF83H (Decimal: -125)' },
        { name: 'S_QUOT / S_REM (Signed Div)', val: 'Quot AX = FFFBH (-5D), Rem DX = 0000H (0D)' }
      ],
      registers: 'AX=FFFBH DX=0000H (Post-execution after signed division)',
      terminalDump: 'U_PROD=0003:25A0 (206240) S_PROD=FFFF:FF83 (-125)\nU_DIV: Q=0020 (32) R=0012 (18) | S_DIV: Q=FFFB (-5) R=0000 (0)'
    },
    manualCalculations: {
      title: 'MUL/DIV Dual-Format (Hex & Decimal) Verification',
      steps: [
        { step: 'Unsigned Multiplication (MUL)', detail: '0A12H (2578D) * 0050H (80D) = 206,240D = 000325A0H (DX=0003H, AX=25A0H, CF=1, OF=1).' },
        { step: 'Unsigned Division (DIV)', detail: '0A12H (2578D) / 0050H (80D) = Quotient 0020H (32D), Remainder 0012H (18D). Verification: 2578 = (80 * 32) + 18.' },
        { step: 'Signed Multiplication (IMUL)', detail: 'FFE7H (-25D) * 0005H (+5D) = -125D = FFFFFF83H (DX=FFFFH, AX=FF83H, CF=0, OF=0).' },
        { step: 'Signed Division (IDIV)', detail: 'FFE7H (-25D) / 0005H (+5D) with CWD sign-extension = Quotient FFFBH (-5D), Remainder 0000H (0D). Verification: -25 = (5 * -5) + 0.' }
      ]
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
  exp_clock1: {
    number: '5A',
    title: 'Digital Clock Design using INT 21H Interrupt',
    aim: 'Write an ALP to design a Digital Clock using 8086 processor (INT 21H).',
    objectives: [
      'Master MS-DOS Software Interrupts (INT 21H) for hardware system clock interfacing.',
      'Understand binary to ASCII BCD unpacking algorithms using AAM and 3030H addition.',
      'Implement real-time polling loops with non-blocking keystroke detection (AH=0BH) and carriage return (0DH) screen overwriting.'
    ],
    outcomes: [
      'Successfully acquire dynamic real-time hardware clock values from MS-DOS kernel.',
      'Convert raw binary time registers (CH=Hours, CL=Minutes, DH=Seconds, DL=1/100s) into human-readable ASCII string formats.',
      'Control console screen buffer and implement continuous interactive execution loops without display flickering.'
    ],
    components: [
      { name: 'MASM', spec: 'v6.11 Assembler', purpose: 'Assembly language translation and segment linking' },
      { name: 'DOSBox', spec: 'v0.74 Hardware Emulator', purpose: 'Emulated IBM PC/AT hardware clock & interrupt dispatcher' }
    ],
    procedureSteps: [
      'Launch DOSBox and navigate to MASM 6.11 installation directory on Drive C:.',
      'Allocate memory variables: TIME_STR buffer for ASCII digits, MSG_EXIT prompt, and PREV_SEC tracking byte.',
      'Query MS-DOS INT 21H / AH=0BH to check if keyboard buffer has an unread key.',
      'Invoke INT 21H / AH=2CH to read real-time clock registers (CH, CL, DH, DL).',
      'Filter out duplicate ticks by comparing DH with PREV_SEC; update PREV_SEC if second has changed.',
      'Unpack binary values into two-digit ASCII characters and store into TIME_STR buffer.',
      'Issue carriage return (0DH) via INT 21H / AH=02H to position cursor at start of line, then display string via INT 21H / AH=09H.',
      'Loop continuously until any keystroke is detected, then terminate cleanly via INT 21H / AH=4CH.'
    ],
    theoryText: 'The 8086 microprocessor interfaces with the real-time PC hardware clock (RTC / Timer 8253/8254) via MS-DOS software interrupt INT 21H with Function Request AH=2CH (Get System Time). Upon execution, the DOS kernel returns binary values: CH = Hours (00-23 in binary), CL = Minutes (00-59 in binary), DH = Seconds (00-59 in binary), and DL = Hundredths of a second (00-99 in binary). Because ASCII video monitors display character codes rather than raw binary values, each binary byte must be converted into two ASCII decimal digits. The instruction AAM (ASCII Adjust for Multiplication) divides AL by 10, placing the quotient (tens digit) in AH and remainder (units digit) in AL. Adding 3030H converts both nibbles to standard ASCII digits. The resulting string is displayed on console using INT 21H Function 09H.',
    theoryDiagramType: 'clock-interrupt',
    algorithmSteps: [
      'Initialize Segment Registers: Load DS with DATA_SEG segment base address.',
      'Display Start Prompt: Point DX to MSG_EXIT and invoke INT 21H / AH=09H.',
      'Check Keyboard Status: Call INT 21H / AH=0BH. If AL ≠ 00H (key available), branch to exit routine.',
      'Acquire Real-Time Clock: Load AH=2CH and call INT 21H to retrieve system time into CH (Hours), CL (Minutes), and DH (Seconds).',
      'Flicker Prevention Filter: Compare DH against PREV_SEC. If DH == PREV_SEC, branch to step 3 (poll loop). Otherwise, update PREV_SEC = DH.',
      'Format Hours: Copy CH into AL, execute AAM, add 3030H, and store AH and AL into TIME_STR[14..15].',
      'Format Minutes: Copy CL into AL, execute AAM, add 3030H, and store AH and AL into TIME_STR[17..18].',
      'Format Seconds: Copy DH into AL, execute AAM, add 3030H, and store AH and AL into TIME_STR[20..21].',
      'Cursor Carriage Return: Load DL=0DH, AH=02H, and invoke INT 21H to move cursor to line beginning without line feed.',
      'Render Time String: Load DX = offset TIME_STR, AH=09H, and invoke INT 21H to print "CURRENT TIME: HH:MM:SS" on screen.',
      'Repeat: Jump back to Step 3 for continuous ticking.',
      'Exit Handler: Flush key buffer via AH=08H and terminate process via INT 21H / AH=4CH.'
    ],
    flowchartSteps: [
      { type: 'start', label: 'START' },
      { type: 'process', label: 'Initialize DS; Display Exit Prompt via INT 21H / AH=09H' },
      { type: 'process', label: 'Check Keyboard Status: INT 21H / AH=0BH' },
      { type: 'decision', label: 'Is Key Pressed (AL ≠ 0)?' },
      { type: 'process', label: 'Read System Clock: INT 21H / AH=2CH (CH=Hrs, CL=Mins, DH=Secs, DL=1/100s)' },
      { type: 'decision', label: 'Has Second Changed (DH ≠ PREV_SEC)?' },
      { type: 'process', label: 'Update PREV_SEC = DH' },
      { type: 'process', label: 'Unpack CH, CL, DH to ASCII via AAM + 3030H; Store in TIME_STR' },
      { type: 'process', label: 'Output Carriage Return (0DH) via AH=02H & String via AH=09H' },
      { type: 'process', label: 'Flush Key Buffer (AH=08H) & Terminate via AH=4CH' },
      { type: 'stop', label: 'STOP (Exit to DOS)' }
    ],
    expectedOutput: {
      desc: 'Real-time digital clock updating once every second on the same line in DOSBox.',
      inputs: [{ name: 'SYSTEM_CLOCK', val: 'DOS RTC Hardware Clock (CH=Hrs, CL=Mins, DH=Secs)' }],
      outputs: [{ name: 'TIME_STR', val: 'CURRENT TIME: 10:45:28' }],
      registers: 'AX=3030H CX=0A2DH DX=1C00H IP=0045H',
      terminalDump: '=== 8086 DIGITAL CLOCK (INT 21H) ===\nPRESS ANY KEY TO EXIT...\nCURRENT TIME: 10:45:28'
    },
    manualCalculations: {
      title: 'Time Unpack & BCD Arithmetic Verification',
      steps: [
        { step: 'Hours Conversion (CH = 0AH = 10)', detail: 'AAM on 0AH: AH = 10/10 = 1, AL = 10 mod 10 = 0. AX + 3030H = 3130H (ASCII "10").' },
        { step: 'Minutes Conversion (CL = 2DH = 45)', detail: 'AAM on 2DH (45 dec): AH = 45/10 = 4, AL = 45 mod 10 = 5. AX + 3030H = 3435H (ASCII "45").' },
        { step: 'Seconds Conversion (DH = 1CH = 28)', detail: 'AAM on 1CH (28 dec): AH = 28/10 = 2, AL = 28 mod 10 = 8. AX + 3030H = 3238H (ASCII "28").' },
        { step: 'Resulting ASCII String Buffer', detail: '"CURRENT TIME: 10:45:28$" formatted and displayed via INT 21H / AH=09H.' }
      ]
    },
    resultText: 'Digital clock ALP using MS-DOS INT 21H was successfully designed, simulated, and verified in real-time execution.',
    precautions: [
      'Always use non-blocking keyboard check (AH=0BH) in real-time loops so the CPU does not halt waiting for input.',
      'Filter duplicate second readings using a previous second variable (PREV_SEC) to avoid severe screen flickering.',
      'Terminate all strings displayed with DOS Function 09H with the dollar sign character ("$").'
    ],
    studentTask: {
      title: 'Digital Stopwatch with Lap Timer',
      desc: 'Modify the program to implement a start/stop digital stopwatch displaying hundredths of a second (DL register).',
      hint: 'Read DL from INT 21H AH=2CH, format as 2-digit ASCII, and append ".XX" to the display string.'
    },
    applications: [
      { title: 'Embedded System Clocks', desc: 'Real-time clock display in instrumentation, industrial timers, and digital dashboard consoles.', icon: 'clock' },
      { title: 'Task Schedulers & RTOS', desc: 'Periodic time quantum measurement and kernel process scheduling in operating systems.', icon: 'cpu' }
    ]
  },
  exp_clock2: {
    number: '5B',
    title: 'Digital Clock Design using DOS Interrupt Functions',
    aim: 'Write an ALP to design a Digital Clock using DOS Interrupt Functions.',
    objectives: [
      'Utilize full suite of MS-DOS Interrupt 21H functions for Time (2CH), Date (2AH), and String I/O (09H).',
      'Integrate BIOS Video Interrupt INT 10H (AH=02H Set Cursor, AH=06H Clear Screen) for UI positioning.',
      'Implement 12-hour AM/PM conversion logic and 4-digit calendar year formatting.'
    ],
    outcomes: [
      'Master coordination between DOS kernel API services and BIOS hardware firmware interrupts.',
      'Perform mathematical 12-hour clock transformations with accurate AM/PM flag resolution.',
      'Build aesthetically structured text-mode user interface consoles in assembly language.'
    ],
    components: [
      { name: 'MASM', spec: 'v6.11 Assembler', purpose: 'Assembles segmented 8086 code with procedures and macros' },
      { name: 'DOSBox', spec: 'v0.74 Environment', purpose: 'Emulates full BIOS video matrix (80x25 text mode) and DOS kernel' }
    ],
    procedureSteps: [
      'Launch DOSBox and assemble EXP5B.ASM.',
      'Clear screen with color attributes using BIOS INT 10H / AH=06H.',
      'Position cursor at Row 2, Col 18 via INT 10H / AH=02H and print title header.',
      'Retrieve system calendar date via DOS INT 21H / AH=2AH (CX=Year, DH=Month, DL=Day).',
      'Format Day, Month, and 4-digit Year into DATE_STR ("DATE: DD/MM/YYYY | ").',
      'Enter clock execution loop: poll keyboard buffer via INT 21H / AH=0BH.',
      'Read system time via INT 21H / AH=2CH (CH=Hrs, CL=Mins, DH=Secs).',
      'Convert 24-hour binary hour into 12-hour format (subtract 12 if > 12; set AM/PM suffix).',
      'Position cursor at Row 10, Col 18 and print DATE_STR and TIME_STR.',
      'Loop continuously until keystroke, then exit to DOS via INT 21H / AH=4CH.'
    ],
    theoryText: 'Digital clock design in x86 DOS environments combines DOS high-level file/OS services (INT 21H) with low-level BIOS firmware video services (INT 10H). DOS INT 21H Function 2AH queries the real-time calendar hardware, returning Year in CX (1980-2099), Month in DH (1-12), and Day in DL (1-31). Function 2CH returns Time in CH (Hours 0-23), CL (Minutes 0-59), and DH (Seconds 0-59). For professional presentation, BIOS INT 10H Function 02H positions the hardware cursor at specific text coordinates (DH=Row 0-24, DL=Col 0-79), while Function 06H clears rectangular text windows with custom background and foreground color attributes.',
    theoryDiagramType: 'clock-interrupt',
    algorithmSteps: [
      'Initialize Data Segment: Load DS with DATA_SEG.',
      'Clear Video Window: Load AH=06H, AL=00H, BH=1FH (White on Blue), CX=0000H, DX=184FH, invoke INT 10H.',
      'Print Title Header: Set cursor to Row 2, Col 18 via INT 10H / AH=02H, print MSG_HDR via INT 21H / AH=09H.',
      'Read Calendar Date: Call INT 21H / AH=2AH. Unpack Day (DL) and Month (DH) to ASCII. Divide Year (CX) by 100 to extract century and decade, then format into DATE_STR.',
      'Clock Loop: Check keyboard status via INT 21H / AH=0BH; jump to quit if key available.',
      'Read Time: Call INT 21H / AH=2CH. If DH == PREV_SEC, skip loop pass; else PREV_SEC = DH.',
      '12-Hour Conversion: If Hour (CH) == 0 -> Hour = 12, Suffix = "AM". If Hour == 12 -> Hour = 12, Suffix = "PM". If Hour > 12 -> Hour = Hour - 12, Suffix = "PM". Else Suffix = "AM".',
      'Format Time: Unpack Hour, Minutes (CL), and Seconds (DH) to ASCII digits and store into TIME_STR.',
      'Position & Print: Set cursor to Row 10, Col 18 via INT 10H / AH=02H; print DATE_STR followed by TIME_STR via INT 21H / AH=09H.',
      'Repeat: Loop back to keyboard check.',
      'Exit Cleanly: Flush key buffer (AH=08H) and terminate program via INT 21H / AH=4CH.'
    ],
    flowchartSteps: [
      { type: 'start', label: 'START' },
      { type: 'process', label: 'Initialize DS; Clear Screen with Attribute 1FH via BIOS INT 10H / AH=06H' },
      { type: 'process', label: 'Set Cursor at Row 2, Col 18 (INT 10H / AH=02H) & Print Title Header' },
      { type: 'process', label: 'Read System Date: INT 21H / AH=2AH; Format DD/MM/YYYY into DATE_STR' },
      { type: 'process', label: 'Poll Keyboard: INT 21H / AH=0BH' },
      { type: 'decision', label: 'Key Pressed (AL ≠ 0)?' },
      { type: 'process', label: 'Read Time: INT 21H / AH=2CH (CH, CL, DH)' },
      { type: 'decision', label: 'Is Second New (DH ≠ PREV_SEC)?' },
      { type: 'process', label: 'Convert 24-hr to 12-hr AM/PM; Unpack to ASCII in TIME_STR' },
      { type: 'process', label: 'Set Cursor at Row 10, Col 18 (INT 10H / AH=02H) & Display DATE_STR | TIME_STR' },
      { type: 'stop', label: 'STOP (Exit cleanly to DOS)' }
    ],
    expectedOutput: {
      desc: 'Centered digital clock and calendar in 12-hour format with AM/PM indicator in DOSBox.',
      inputs: [{ name: 'DATE_TIME_REGS', val: 'CX=2026, DH=08, DL=28, CH=14, CL=30, DH=15' }],
      outputs: [
        { name: 'DATE_STR', val: 'DATE: 28/08/2026' },
        { name: 'TIME_STR', val: 'TIME: 02:30:15 PM' }
      ],
      registers: 'AX=3030H BX=0000H CX=07EAH DX=081CH IP=0080H',
      terminalDump: '=== 8086 DOS DIGITAL CLOCK & CALENDAR ===\nDATE: 28/08/2026  |  TIME: 02:30:15 PM\nPRESS [ENTER] TO STOP CLOCK...'
    },
    manualCalculations: {
      title: '12-Hour AM/PM & Date Conversion Proof',
      steps: [
        { step: 'Date Unpacking', detail: 'Year=2026 (CX=07EAH) -> Century=20, Year=26. Month=08 (DH), Day=28 (DL). Format: "28/08/2026".' },
        { step: '12-Hour Logic (CH = 14 = 14:00)', detail: '14 > 12: Subtract 12 -> Hour = 2 (02), Period Indicator = "PM".' },
        { step: 'Minutes & Seconds Unpack', detail: 'CL = 30 -> ASCII "30", DH = 15 -> ASCII "15".' },
        { step: 'Consolidated Display', detail: '"DATE: 28/08/2026  |  TIME: 02:30:15 PM$" centered at screen coordinates (Row 10, Col 18).' }
      ]
    },
    resultText: 'Digital clock ALP using DOS and BIOS interrupt functions was successfully executed with accurate 12-hour AM/PM and calendar display.',
    precautions: [
      'Always preserve CX and DX registers across nested subroutine calls to prevent corrupting time and date registers.',
      'Ensure the video page number in BH is 00H when calling BIOS INT 10H cursor and scroll functions.',
      'Account for midnight (00:00 -> 12:00 AM) and noon (12:00 -> 12:00 PM) boundary conditions in 12-hour conversion arithmetic.'
    ],
    studentTask: {
      title: 'Dual Time Zone World Clock',
      desc: 'Extend the clock to display two simultaneous time zones (e.g. IST and UTC) by applying a signed offset (+5:30) with modulo arithmetic.',
      hint: 'Add 5 hours and 30 minutes to UTC; if minutes ≥ 60, add 1 to hours and modulo 60; if hours ≥ 24, modulo 24.'
    },
    applications: [
      { title: 'BIOS Setup Utilities', desc: 'Real-time clock, calendar, and system configuration management in motherboard BIOS firmware.', icon: 'monitor' },
      { title: 'Server Logging Engines', desc: 'High-precision timestamp tagging for file systems, database commits, and network packets.', icon: 'server' }
    ]
  },
  exp_clock3: {
    number: '5C',
    title: 'Digital Clock Design by Reading System Time',
    aim: 'Write an ALP to design a Digital Clock by reading System Time.',
    objectives: [
      'Implement high-efficiency differential time polling algorithms in 8086 assembly.',
      'Design animated UI elements (blinking colon separators) synchronized to hardware timer ticks.',
      'Eliminate display tearing and flickering through deterministic screen buffer coordinate updates.'
    ],
    outcomes: [
      'Construct a continuously ticking digital clock reading system time directly from DOS RTC interrupts.',
      'Understand tick synchronization and state toggle operations using bitwise XOR instructions.',
      'Master cursor management and non-destructive keyboard polling mechanisms.'
    ],
    components: [
      { name: 'MASM', spec: 'v6.11 Assembler', purpose: 'Compiles real-time event loop ALP code' },
      { name: 'DOSBox', spec: 'v0.74 Emulator', purpose: 'Provides 18.2 Hz PIT hardware timer interrupt emulation' }
    ],
    procedureSteps: [
      'Initialize Data Segment and configure screen in 80x25 text mode using INT 10H / AH=06H.',
      'Render decorative title banner and footer status prompt.',
      'Initialize PREV_SEC cache byte to 0FFH and BLINK_ON toggle state to 01H.',
      'Poll DOS INT 21H / AH=0BH to check for keyboard interrupt; exit if key pressed.',
      'Invoke INT 21H / AH=2CH to read current system time (CH, CL, DH, DL).',
      'Compare DH with PREV_SEC; if identical, return to keyboard polling without redrawing.',
      'If DH differs from PREV_SEC, update PREV_SEC = DH and invert BLINK_ON state via XOR BLINK_ON, 01H.',
      'Update colon separators (":" if BLINK_ON=1, " " if BLINK_ON=0).',
      'Unpack Hours, Minutes, Seconds, and Hundredths of a second into ASCII digits inside DIGIT_BOX.',
      'Set cursor to box position (Row 8, Col 12) via INT 10H / AH=02H and print updated string via INT 21H / AH=09H.',
      'Repeat continuously until user stops the clock.'
    ],
    theoryText: 'In computer architecture, real-time clock monitoring requires efficient synchronization between the hardware time base and software display routines. Reading the system time in an unconstrained loop without synchronization causes the CPU to re-render the screen thousands of times every millisecond, resulting in severe visual flicker and 100% CPU core utilization. By maintaining a cached previous second variable (PREV_SEC), the program samples the time registers via INT 21H Function 2CH, but only executes the computationally expensive ASCII unpack and screen write routines when a true 1 Hz second transition occurs. Additionally, toggling a 1-bit boolean state (XOR BLINK_ON, 01H) enables authentic blinking colon separators (":" vs " ") synchronized to every second tick.',
    theoryDiagramType: 'timer-tick',
    algorithmSteps: [
      'Initialize DS: Point DS to DATA_SEG base address.',
      'Screen Setup: Clear screen via BIOS INT 10H / AH=06H; print BANNER and FOOTER prompts via INT 21H / AH=09H.',
      'Init State: Set PREV_SEC = 0FFH and BLINK_ON = 01H.',
      'Key Poll: Check keyboard status via INT 21H / AH=0BH. If AL ≠ 0, jump to program shutdown.',
      'Read System Time: Call INT 21H / AH=2CH to fetch CH (Hours), CL (Minutes), DH (Seconds), DL (Hundredths).',
      'Tick Differential Check: Compare DH with PREV_SEC. If DH == PREV_SEC, branch immediately back to Key Poll.',
      'Tick Update: Update PREV_SEC = DH.',
      'Blink Colon Animation: Toggle BLINK_ON via XOR BLINK_ON, 01H. If BLINK_ON == 1, set colon character (":"); else set blank space (" "). Update separator offsets in DIGIT_BOX.',
      'Unpack Digits: Convert CH, CL, DH, and DL to ASCII characters using BCD_CONVERT (AAM + 3030H) and store into respective positions in DIGIT_BOX.',
      'Position & Redraw: Move cursor to Row 8, Col 12 via INT 10H / AH=02H and output DIGIT_BOX via INT 21H / AH=09H.',
      'Loop: Repeat from Step 4.',
      'Shutdown: Clear key from buffer via AH=08H and terminate process via INT 21H / AH=4CH.'
    ],
    flowchartSteps: [
      { type: 'start', label: 'START' },
      { type: 'process', label: 'Initialize DS; Clear Console Screen (INT 10H / AH=06H)' },
      { type: 'process', label: 'Display Header Banner & Footer Controls' },
      { type: 'process', label: 'Check Keyboard Buffer: INT 21H / AH=0BH' },
      { type: 'decision', label: 'Has User Pressed Key (AL ≠ 0)?' },
      { type: 'process', label: 'Read System Clock: INT 21H / AH=2CH (CH, CL, DH, DL)' },
      { type: 'decision', label: 'Is Current Second DH ≠ PREV_SEC?' },
      { type: 'process', label: 'Update PREV_SEC = DH; Toggle BLINK_ON (XOR 01H)' },
      { type: 'process', label: 'Unpack Hours, Mins, Secs, Hundredths into DIGIT_BOX' },
      { type: 'process', label: 'Set Cursor at Row 8, Col 12 (INT 10H / AH=02H) & Print DIGIT_BOX' },
      { type: 'stop', label: 'STOP (Clean Exit to DOS)' }
    ],
    expectedOutput: {
      desc: 'Active digital clock with animated blinking colons and hundredths-of-second readout in DOSBox.',
      inputs: [{ name: 'SYSTEM_RTC', val: 'DOS Kernel Timer (CH=Hrs, CL=Mins, DH=Secs, DL=Hundredths)' }],
      outputs: [{ name: 'DIGIT_BOX', val: '|   SYSTEM TIME:   12:30:45.82   |' }],
      registers: 'AX=3832H BX=003AH CX=0C1EH DX=2D52H IP=0072H',
      terminalDump: '==================================================\n   8086 REAL-TIME CONTINUOUS SYSTEM CLOCK DISPLAY  \n==================================================\n      +--------------------------------+\n      |   SYSTEM TIME:   12:30:45.82   |\n      +--------------------------------+\nSTATUS: RUNNING [PRESS ANY KEY TO EXIT DOSBOX]'
    },
    manualCalculations: {
      title: 'Differential Tick Synchronization & Hundredths Math',
      steps: [
        { step: 'Differential Polling Check', detail: 'Current DH = 2DH (45s), PREV_SEC = 2CH (44s). DH ≠ PREV_SEC -> Trigger 1 Hz refresh.' },
        { step: 'Blinking Separator Toggle', detail: 'BLINK_ON = 1 XOR 1 = 0 (Off/Space) -> Colons hidden during intermediate tick.' },
        { step: 'Hundredths Conversion (DL = 52H = 82)', detail: 'AAM on 82 dec: AH = 8, AL = 2. ASCII = "82".' },
        { step: 'Clock String Frame', detail: '"SYSTEM TIME:   12:30:45.82" placed within centered ASCII border box.' }
      ]
    },
    resultText: 'Real-time continuous digital clock with differential tick caching and animated blinking separators was successfully designed and executed.',
    precautions: [
      'Do not omit the PREV_SEC comparison check; without it, continuous unthrottled screen updates will create intense screen flicker.',
      'Ensure string offset indices in DIGIT_BOX accurately correspond to ASCII buffer byte offsets.',
      'Use INT 10H / AH=02H to overwrite the box in place rather than printing newlines to keep display stationary.'
    ],
    studentTask: {
      title: 'Countdown Kitchen Timer Alarm',
      desc: 'Create a countdown timer starting from a user-specified minute value (e.g. 05:00) that beeps the speaker (via 8254 PIT Port 61H) at 00:00.',
      hint: 'Read system time, decrement seconds counter each tick, and write 03H to Port 61H to enable timer channel 2 speaker tone at zero.'
    },
    applications: [
      { title: 'Digital Dashboards & Speedometers', desc: 'High-frequency telemetry sampling and stationary dashboard displays in automotive systems.', icon: 'gauge' },
      { title: 'Industrial Sequence Controllers', desc: 'Precision delay generators and recipe timers in automated chemical and manufacturing plants.', icon: 'activity' }
    ]
  },
  exp_stepper1: {
    number: '6A',
    title: 'Interfacing Stepper Motor with 8086 – Clockwise Rotation with Variable Step-Size',
    aim: 'Write an ALP to Interface a stepper motor and operate it in clockwise by choosing variable step-size.',
    category: 'Hardware Interfacing & Motion Control',
    bloomLevel: 'Apply & Analyze (L3/L4)',
    labSessionTime: '3 Hours',
    objectives: [
      'Interface a 4-phase unipolar stepper motor with 8086 microprocessor using 8255 Programmable Peripheral Interface (PPI).',
      'Configure 8255 PPI in Mode 0 (Basic I/O) with Port A configured as an 8-bit output port.',
      'Generate 2-phase full-step excitation sequence codes (09H, 0AH, 06H, 05H) to rotate the motor clockwise.',
      'Implement variable step size and variable angle rotation control using software counters.',
      'Design calibrated software delay subroutines to ensure stable rotor stepping without stalling or slip.'
    ],
    outcomes: [
      'Master I/O port addressing and control word programming using 8086 OUT instructions.',
      'Understand electromechanical commutation and magnetic torque generation in stepper motor windings.',
      'Calculate exact step counts and cycle iterations for desired angular displacements (N = Angle / 1.8°).'
    ],
    components: [
      { name: '8086 Microprocessor Kit', spec: '5 MHz / 8 MHz Minimum Mode Kit with Bus Expansion', purpose: 'Executes motion control program and drives I/O ports' },
      { name: 'Intel 8255 PPI IC', spec: 'Programmable Peripheral Interface (Port A = C0H, CWR = C6H)', purpose: 'Parallel I/O interfacing between CPU data bus and motor' },
      { name: 'ULN2003 / ULN2803 Driver', spec: '7-Channel High-Voltage High-Current Darlington Transistor Array', purpose: 'Amplifies TTL logic signals to drive 12V inductive motor coils' },
      { name: '4-Phase Stepper Motor', spec: '12V DC Unipolar Stepper Motor with 1.8° Step Angle (200 steps/rev)', purpose: 'Converts digital phase pulses into precise mechanical rotation' },
      { name: 'Dual Power Supply', spec: '+5V DC (Digital Logic) and +12V DC (Motor Stator Windings)', purpose: 'Provides isolated power to logic ICs and motor stator coils' }
    ],
    procedureSteps: [
      'Connect the 8086 system bus to the 8255 PPI trainer interface module.',
      'Connect Port A output lines (PA0, PA1, PA2, PA3) of 8255 to input pins (1B, 2B, 3B, 4B) of the ULN2003 driver.',
      'Connect the ULN2003 collector outputs (1C, 2C, 3C, 4C) to the four phase windings (Phase A, B, C, D) of the stepper motor, and connect the common lead to +12V DC.',
      'Initialize 8255 PPI Control Word Register (Address 00C6H) with control word 80H (Mode 0, Port A as output).',
      'Load the variable step size into CX register (e.g., 200 for 360° full revolution, 100 for 180°, 50 for 90°).',
      'Sequentially output 2-phase full-step excitation codes to Port A (00C0H): 09H -> 0AH -> 06H -> 05H.',
      'Call software delay subroutine between successive steps to provide rotor settling time.',
      'Repeat the 4-phase commutation cycle until the step counter CX reaches zero, then stop.'
    ],
    theoryText: 'A stepper motor is an electromechanical transducer that converts discrete electrical pulse sequences into precise mechanical shaft displacements. In a 4-phase unipolar stepper motor with a 1.8° step angle, one complete 360° revolution requires 200 steps (Steps = 360° / 1.8° = 200). The motor stator has four electromagnetic phase windings (A, B, C, D), while the rotor is a permanent magnet or toothed soft-iron core. In 2-phase full-step excitation (high torque mode), two stator coils are energized simultaneously. The clockwise 4-step excitation table is: Step 1 (Phases A & D ON) = 09H (1001b), Step 2 (Phases A & B ON) = 0AH (1010b), Step 3 (Phases B & C ON) = 06H (0110b), and Step 4 (Phases C & D ON) = 05H (0101b). The 8086 microprocessor sends these nibbles to Port A of the Intel 8255 PPI via OUT DX, AL instructions after programming CWR with 80H. A ULN2003 Darlington driver IC is essential to sink the 200-500 mA coil current.',
    theoryDiagramType: 'stepper-motor',
    algorithmSteps: [
      'Initialize Data Segment: Load DS with segment base address of DATA_SEG.',
      'Initialize 8255 PPI: Write control word 80H to Control Word Register (CWR at address 00C6H) to configure Port A as Mode 0 output.',
      'Set Variable Step Count: Load CX with desired step size N (e.g., 200 for 360° rotation, 100 for 180°, 50 for 90°).',
      'Initialize Lookup Pointer: Point SI to starting offset of CW_TABLE (09H, 0AH, 06H, 05H).',
      'Set Phase Counter: Load BX with 4 (number of steps per commutation cycle).',
      'Output Phase Pattern: Read byte from [SI] into AL, load DX with Port A address (00C0H), and execute OUT DX, AL.',
      'Execute Software Delay: Call software delay subroutine to allow rotor magnetic alignment and mechanical settling.',
      'Advance Pointer: Increment SI to point to next step code in CW sequence.',
      'Check Remaining Steps: Decrement remaining step counter CX. If CX = 0, jump to Exit.',
      'Commutation Cycle Check: Decrement BX. If BX ≠ 0, repeat Step 6; else reset SI to CW_TABLE start and repeat Step 5 until CX = 0.',
      'Terminate Program: Return control to DOS via INT 21H / AH=4CH.'
    ],
    flowchartSteps: [
      { type: 'start', label: 'START' },
      { type: 'process', label: 'Initialize DS; Write 80H to 8255 CWR (00C6H) [Mode 0 Output]' },
      { type: 'process', label: 'Load Variable Step Count CX = N (e.g., 200 Steps = 360°)' },
      { type: 'process', label: 'Point SI to CW_TABLE [09H, 0AH, 06H, 05H]; Set Phase Counter BX = 4' },
      { type: 'process', label: 'Fetch Step Code AL = [SI]; Send to Port A (00C0H) via OUT DX, AL' },
      { type: 'process', label: 'Call Software DELAY Subroutine (Speed / Settling Control)' },
      { type: 'process', label: 'Increment SI; Decrement Remaining Step Counter CX' },
      { type: 'decision', label: 'Is Target Step Count Reached (CX = 0)?' },
      { type: 'decision', label: 'Is 4-Phase Commutation Finished (BX = 0)?' },
      { type: 'stop', label: 'STOP (Exit cleanly to DOS via AH=4CH)' }
    ],
    expectedOutput: {
      desc: 'Stepper motor shaft rotates Clockwise (CW) by the exact requested step count / angular displacement.',
      inputs: [
        { name: 'TARGET_STEPS', val: '200 Steps (360.0° Rotation Angle)' },
        { name: 'STEP_ANGLE', val: '1.8° per Step' },
        { name: '8255_CWR_MODE', val: '80H (Port A Mode 0 Output)' }
      ],
      outputs: [
        { name: 'EXCITATION_SEQUENCE', val: '09H -> 0AH -> 06H -> 05H (Clockwise Full-Step)' },
        { name: 'TOTAL_DISPLACEMENT', val: '+360.0° Clockwise (+200 Steps Completed)' },
        { name: '8255_PORT_A_FINAL', val: '05H (Phase D & Phase A Energized)' }
      ],
      registers: 'AX=0500H BX=0000H CX=0000H DX=00C0H SP=0100H',
      terminalDump: '=== 8086 STEPPER MOTOR INTERFACING (CLOCKWISE) ===\n8255 PPI INITIALIZED: CWR = 80H (Port A Output)\nEXCITATION MODE: 2-Phase Full-Step (High Torque)\nTARGET STEPS: 200 | STEP ANGLE: 1.8 DEG | TOTAL ANGLE: 360.0 DEG CW\nSTEPPING: [09H -> 0AH -> 06H -> 05H] x 50 CYCLES\nROTATION COMPLETED SUCCESSFULLY: SHAFT AT +360.0 DEG.'
    },
    manualCalculations: {
      title: 'Stepper Motor Step Size, Commutation & Speed Calculations',
      steps: [
        { step: '1. Step Angle Formula', detail: 'Step Angle θs = 360° / (Number of Phases x Number of Rotor Teeth) = 360° / (4 x 50) = 1.8° per step.' },
        { step: '2. Step Count for Angular Displacement', detail: 'Steps N = Desired Angle / Step Angle = 360° / 1.8° = 200 steps (For 90°: 90 / 1.8 = 50 steps; For 180°: 180 / 1.8 = 100 steps).' },
        { step: '3. Commutation Sequence Cycles', detail: 'Number of 4-step cycles C = N / 4 = 200 / 4 = 50 complete electrical commutation cycles.' },
        { step: '4. Clockwise Phase Truth Table', detail: 'Phase A-B-C-D: Step 1 (1001b = 09H), Step 2 (1010b = 0AH), Step 3 (0110b = 06H), Step 4 (0101b = 05H).' },
        { step: '5. Software Delay Duration', detail: 'T_delay = CX_count x (NOP(3) + NOP(3) + LOOP(17)) / (5 MHz Clock) ≈ 0xFFFF x 23 / 5,000,000 ≈ 30.1 ms per step (Speed ≈ 10 RPM).' }
      ]
    },
    resultText: 'The 8086 stepper motor interfacing ALP for clockwise rotation with variable step-size was successfully verified on 8255 PPI hardware.',
    precautions: [
      'Never connect stepper motor windings directly to 8255 PPI output pins; always use a ULN2003/ULN2803 driver to prevent IC burnout.',
      'Ensure the software delay constant is neither too small (causes motor stalling) nor excessively large (causes sluggish rotation).',
      'Verify that the common pin (COM / Pin 9) of ULN2003 is connected to +12V DC to engage internal freewheeling clamp diodes.'
    ],
    studentTask: {
      title: 'Half-Step Clockwise Commutation Mode (0.9° Resolution)',
      desc: 'Modify the ALP to implement an 8-step half-stepping sequence (01H, 03H, 02H, 06H, 04H, 0CH, 08H, 09H) for 400 steps per revolution (0.9° step angle).',
      hint: 'Expand lookup table to 8 bytes, update commutation cycle counter BX to 8, and double step count CX to 400 for 360°.'
    },
    applications: [
      { title: 'CNC Machine Tool Positioners', desc: 'Precision lead screw drives and workpiece coordinate tables in computer numerical control (CNC) mills and lathes.', icon: 'crosshair' },
      { title: 'Robotic Arm Joint Actuators', desc: 'Repeatable open-loop joint angular positioning and gripper control in industrial assembly robots.', icon: 'cpu' },
      { title: '3D Printers & Plotters', desc: 'X/Y/Z Cartesian gantry axis linear positioning and filament extruder feeder mechanisms.', icon: 'printer' }
    ]
  },
  exp_stepper2: {
    number: '6B',
    title: 'Interfacing Stepper Motor with 8086 – Anti-Clockwise Rotation with Variable Step-Size',
    aim: 'Write an ALP to Interface a stepper motor and operate it in Anti-clockwise by choosing variable step-size.',
    category: 'Hardware Interfacing & Motion Control',
    bloomLevel: 'Apply & Analyze (L3/L4)',
    labSessionTime: '3 Hours',
    objectives: [
      'Interface a 4-phase unipolar stepper motor with 8086 microprocessor using 8255 Programmable Peripheral Interface (PPI).',
      'Configure 8255 PPI in Mode 0 with Port A configured as an 8-bit output port.',
      'Generate reversed 2-phase full-step excitation sequence codes (05H, 06H, 0AH, 09H) to drive motor anti-clockwise.',
      'Implement variable step size and variable angle rotation control using software counters.',
      'Design calibrated software delay loops to maintain stable motor stepping and avoid stalling / inertia loss.'
    ],
    outcomes: [
      'Master reverse commutation sequence generation for bidirectional motion actuators.',
      'Understand how reversing the stator electromagnetic field vector inverts rotor torque direction.',
      'Calculate exact step counts and cycle iterations for desired angular displacements (N = Angle / 1.8°).'
    ],
    components: [
      { name: '8086 Microprocessor Kit', spec: '5 MHz / 8 MHz Minimum Mode Kit with Bus Expansion', purpose: 'Executes motion control program and drives I/O ports' },
      { name: 'Intel 8255 PPI IC', spec: 'Programmable Peripheral Interface (Port A = C0H, CWR = C6H)', purpose: 'Parallel I/O interfacing between CPU data bus and motor' },
      { name: 'ULN2003 / ULN2803 Driver', spec: '7-Channel High-Voltage High-Current Darlington Transistor Array', purpose: 'Amplifies TTL logic signals to drive 12V inductive motor coils' },
      { name: '4-Phase Stepper Motor', spec: '12V DC Unipolar Stepper Motor with 1.8° Step Angle (200 steps/rev)', purpose: 'Converts digital phase pulses into precise mechanical rotation' },
      { name: 'Dual Power Supply', spec: '+5V DC (Digital Logic) and +12V DC (Motor Stator Windings)', purpose: 'Provides isolated power to logic ICs and motor stator coils' }
    ],
    procedureSteps: [
      'Connect the 8086 system bus to the 8255 PPI trainer interface module.',
      'Connect Port A output lines (PA0, PA1, PA2, PA3) of 8255 to input pins (1B, 2B, 3B, 4B) of the ULN2003 driver.',
      'Connect the ULN2003 collector outputs (1C, 2C, 3C, 4C) to the four phase windings (Phase A, B, C, D) of the stepper motor, and connect the common lead to +12V DC.',
      'Initialize 8255 PPI Control Word Register (Address 00C6H) with control word 80H (Mode 0, Port A as output).',
      'Load the variable step size into CX register (e.g., 200 for 360° full revolution, 100 for 180°, 50 for 90°).',
      'Sequentially output reversed 2-phase full-step excitation codes to Port A (00C0H): 05H -> 06H -> 0AH -> 09H.',
      'Call software delay subroutine between successive steps to provide rotor settling time.',
      'Repeat the 4-phase commutation cycle until the step counter CX reaches zero, then stop.'
    ],
    theoryText: 'Operating a 4-phase stepper motor in the anti-clockwise (CCW / counter-clockwise) direction requires reversing the sequential progression of stator magnetic flux poles. In 2-phase full-step mode, reversing the sequence from [09H -> 0AH -> 06H -> 05H] to [05H -> 06H -> 0AH -> 09H] shifts the electromagnetic vector counter-clockwise. When Phase D and Phase A (05H = 0101b) are energized, the rotor aligns with DA poles. Energizing CD (06H = 0110b) pulls the rotor counter-clockwise by 1.8°, followed by BC (0AH = 1010b) and AB (09H = 1001b). Variable step-size control is accomplished by loading the desired step count N into the 8086 CX register. The microprocessor outputs each byte to 8255 Port A (00C0H) via OUT DX, AL and decrements CX until all steps are executed.',
    theoryDiagramType: 'stepper-motor',
    algorithmSteps: [
      'Initialize Data Segment: Load DS with segment base address of DATA_SEG.',
      'Initialize 8255 PPI: Write control word 80H to Control Word Register (CWR at address 00C6H) to configure Port A as Mode 0 output.',
      'Set Variable Step Count: Load CX with desired step size N (e.g., 200 for 360° rotation, 100 for 180°, 50 for 90°).',
      'Initialize Lookup Pointer: Point SI to starting offset of CCW_TABLE (05H, 06H, 0AH, 09H).',
      'Set Phase Counter: Load BX with 4 (number of steps per commutation cycle).',
      'Output Phase Pattern: Read byte from [SI] into AL, load DX with Port A address (00C0H), and execute OUT DX, AL.',
      'Execute Software Delay: Call software delay subroutine to allow rotor magnetic alignment and mechanical settling.',
      'Advance Pointer: Increment SI to point to next step code in CCW sequence.',
      'Check Remaining Steps: Decrement remaining step counter CX. If CX = 0, jump to Exit.',
      'Commutation Cycle Check: Decrement BX. If BX ≠ 0, repeat Step 6; else reset SI to CCW_TABLE start and repeat Step 5 until CX = 0.',
      'Terminate Program: Return control to DOS via INT 21H / AH=4CH.'
    ],
    flowchartSteps: [
      { type: 'start', label: 'START' },
      { type: 'process', label: 'Initialize DS; Write 80H to 8255 CWR (00C6H) [Mode 0 Output]' },
      { type: 'process', label: 'Load Variable Step Count CX = N (e.g., 200 Steps = 360° CCW)' },
      { type: 'process', label: 'Point SI to CCW_TABLE [05H, 06H, 0AH, 09H]; Set Phase Counter BX = 4' },
      { type: 'process', label: 'Fetch Step Code AL = [SI]; Send to Port A (00C0H) via OUT DX, AL' },
      { type: 'process', label: 'Call Software DELAY Subroutine (Speed / Settling Control)' },
      { type: 'process', label: 'Increment SI; Decrement Remaining Step Counter CX' },
      { type: 'decision', label: 'Is Target Step Count Reached (CX = 0)?' },
      { type: 'decision', label: 'Is 4-Phase Commutation Finished (BX = 0)?' },
      { type: 'stop', label: 'STOP (Exit cleanly to DOS via AH=4CH)' }
    ],
    expectedOutput: {
      desc: 'Stepper motor shaft rotates Anti-Clockwise (CCW) by the exact requested step count / angular displacement.',
      inputs: [
        { name: 'TARGET_STEPS', val: '200 Steps (360.0° Rotation Angle CCW)' },
        { name: 'STEP_ANGLE', val: '1.8° per Step' },
        { name: '8255_CWR_MODE', val: '80H (Port A Mode 0 Output)' }
      ],
      outputs: [
        { name: 'EXCITATION_SEQUENCE', val: '05H -> 06H -> 0AH -> 09H (Anti-Clockwise Full-Step)' },
        { name: 'TOTAL_DISPLACEMENT', val: '-360.0° Anti-Clockwise (200 Steps Completed)' },
        { name: '8255_PORT_A_FINAL', val: '09H (Phase A & Phase B Energized)' }
      ],
      registers: 'AX=0900H BX=0000H CX=0000H DX=00C0H SP=0100H',
      terminalDump: '=== 8086 STEPPER MOTOR INTERFACING (ANTI-CLOCKWISE) ===\n8255 PPI INITIALIZED: CWR = 80H (Port A Output)\nEXCITATION MODE: 2-Phase Full-Step (High Torque Reversed)\nTARGET STEPS: 200 | STEP ANGLE: 1.8 DEG | TOTAL ANGLE: 360.0 DEG CCW\nSTEPPING: [05H -> 06H -> 0AH -> 09H] x 50 CYCLES\nROTATION COMPLETED SUCCESSFULLY: SHAFT AT -360.0 DEG.'
    },
    manualCalculations: {
      title: 'Stepper Motor Step Size, Commutation & Speed Calculations (CCW)',
      steps: [
        { step: '1. Step Angle Formula', detail: 'Step Angle θs = 360° / (Number of Phases x Number of Rotor Teeth) = 360° / (4 x 50) = 1.8° per step.' },
        { step: '2. Step Count for Angular Displacement', detail: 'Steps N = Desired Angle / Step Angle = 360° / 1.8° = 200 steps (For 90°: 90 / 1.8 = 50 steps; For 180°: 180 / 1.8 = 100 steps).' },
        { step: '3. Commutation Sequence Cycles', detail: 'Number of 4-step cycles C = N / 4 = 200 / 4 = 50 complete reverse electrical commutation cycles.' },
        { step: '4. Anti-Clockwise Phase Truth Table', detail: 'Phase A-B-C-D: Step 1 (0101b = 05H), Step 2 (0110b = 06H), Step 3 (1010b = 0AH), Step 4 (1001b = 09H).' },
        { step: '5. Software Delay Duration', detail: 'T_delay = CX_count x (NOP(3) + NOP(3) + LOOP(17)) / (5 MHz Clock) ≈ 0xFFFF x 23 / 5,000,000 ≈ 30.1 ms per step (Speed ≈ 10 RPM).' }
      ]
    },
    resultText: 'The 8086 stepper motor interfacing ALP for anti-clockwise rotation with variable step-size was successfully verified on 8255 PPI hardware.',
    precautions: [
      'Never connect stepper motor windings directly to 8255 PPI output pins; always use a ULN2003/ULN2803 driver to prevent IC burnout.',
      'Ensure the software delay constant is neither too small (causes motor stalling) nor excessively large (causes sluggish rotation).',
      'Verify that the common pin (COM / Pin 9) of ULN2003 is connected to +12V DC to engage internal freewheeling clamp diodes.'
    ],
    studentTask: {
      title: 'Bidirectional Stepper Motor Speed Switcher',
      desc: 'Write an ALP that rotates 100 steps CW at high speed (delay = 7FFFH), pauses for 1 second, and rotates 100 steps CCW at low speed (delay = FFFFH).',
      hint: 'Execute CW loop with 7FFFH delay, call 1-second outer delay loop, then execute CCW loop with FFFFH delay.'
    },
    applications: [
      { title: 'Antenna Azimuth Positioners', desc: 'Bidirectional motorized antenna positioning for satellite tracking and radar pointing.', icon: 'radar' },
      { title: 'Automated Telescope Mounts', desc: 'Precision micro-stepping celestial tracking mounts with dual-axis slewing and guidance.', icon: 'compass' },
      { title: 'Medical Infusion Pumps', desc: 'Variable-rate reversible peristaltic medication delivery actuators with volumetric precision.', icon: 'activity' }
    ]
  },
  exp_adc: {
    number: '7A',
    title: 'Interfacing ADC (ADC 0808/0809) with 8086 Microprocessor',
    aim: 'Write an ALP to 8086 processor to Interface ADC.',
    category: 'Hardware Interfacing & Analog Signal Acquisition',
    bloomLevel: 'Apply & Analyze (L3/L4)',
    labSessionTime: '3 Hours',
    objectives: [
      'Interface an 8-bit Analog-to-Digital Converter (ADC 0808/0809) with 8086 using 8255 Programmable Peripheral Interface (PPI).',
      'Configure 8255 PPI in Mode 0 (Control Word = 98H) with Port A as Input, Port B as Output, Port C Lower as Output, and Port C Upper as Input.',
      'Generate active-high Address Latch Enable (ALE) and Start of Conversion (SOC) pulses to initiate Successive Approximation Register (SAR) conversion.',
      'Implement an End-of-Conversion (EOC) status polling routine on PC7 to detect conversion completion in hardware.',
      'Assert Output Enable (OE) on PC2 to transfer the 8-bit digital output byte from ADC 0808 to 8255 Port A and store it in memory.',
      'Compute the real analog input voltage from digital samples using the conversion formula: Vin = (Digital Code / 255) x Vref.'
    ],
    outcomes: [
      'Understand the architecture and timing requirements of 8-channel successive approximation ADCs.',
      'Master mixed I/O port configuration and handshake control using 8255 PPI.',
      'Design polling loops to synchronize microprocessor execution with external hardware conversion times (~100 µs).',
      'Acquire real-world sensor telemetry and convert raw digital hex bytes into scaled engineering units (millivolts).'
    ],
    components: [
      { name: '8086 Microprocessor Kit / Trainer', spec: '5 MHz / 8 MHz Minimum Mode CPU', purpose: 'Executes ADC interfacing program and processes digitized data' },
      { name: '8255 PPI Interface Card', spec: 'Ports A, B, C @ 00C0H-00C6H', purpose: 'Provides 8-bit digital data input and handshake/multiplexer control lines' },
      { name: 'ADC 0808 / 0809 Converter IC', spec: '8-Bit SAR, 8-Channel Multiplexer, 100 µs Conversion', purpose: 'Converts analog input voltage (0 to +5V) into 8-bit digital code' },
      { name: 'Clock Generator IC (555 / 74LS14)', spec: '500 kHz - 640 kHz TTL Clock', purpose: 'Supplies required conversion clock to Pin 10 (CLK) of ADC0808' },
      { name: 'Precision Potentiometer / DC Source', spec: '0.00 V to 5.00 V Variable DC', purpose: 'Provides variable analog input test voltage to IN0 (Pin 26)' }
    ],
    procedureSteps: [
      'Connect ADC 0808 digital data outputs (D0-D7) to 8255 PPI Port A (PA0-PA7).',
      'Connect ADC channel address lines (ADD A, ADD B, ADD C) to 8255 Port B (PB0-PB2) or Port C.',
      'Connect 8255 PC0 to ADC ALE and START (SOC) pins tied together.',
      'Connect ADC EOC (End of Conversion, Pin 7) to 8255 PC7, and connect 8255 PC2 to ADC OE (Output Enable, Pin 9).',
      'Connect Vref(+) to +5.00 V and Vref(-) to GND (0.00 V). Connect a 500 kHz clock source to ADC CLK pin.',
      'Apply a known analog input voltage (e.g., 2.50 V) from the potentiometer to analog channel IN0.',
      'Initialize 8255 CWR with 98H (Port A=Input, Port B=Output, Port C Upper=Input, Port C Lower=Output).',
      'Select Channel 0 (00H), issue ALE/SOC pulse, poll PC7 until EOC = 1, assert OE (PC2=1), read Port A into AL, and de-assert OE.',
      'Inspect memory location DIGITAL_VAL and verify that the acquired hex byte matches (Vin / 5.0) x 255.'
    ],
    theoryText: 'The ADC 0808/0809 is an 8-bit monolithic CMOS analog-to-digital converter utilizing a Successive Approximation Register (SAR) conversion technique and an on-chip 8-channel analog multiplexer. The conversion process is initiated by an active-high pulse applied simultaneously to Address Latch Enable (ALE) and Start of Conversion (SOC). This latches the selected analog channel (IN0-IN7 determined by address lines A, B, C) and resets the internal SAR register. During conversion, the EOC line goes LOW. An internal comparator iteratively compares the analog input voltage against binary-weighted DAC voltages over 8 clock cycles (taking ~100 µs at 640 kHz). Upon completion, EOC transitions HIGH. The 8086 microprocessor detects this transition via a polling loop on 8255 PC7, asserts Output Enable (OE on PC2) to activate the 3-state output buffers, and reads the 8-bit digital byte via 8255 Port A.',
    theoryDiagramType: 'adc-interfacing',
    algorithmSteps: [
      'Initialize 8255 Control Word Register (00C6H) with 98H (Port A as Input, Port B as Output, Port C Upper as Input, Port C Lower as Output).',
      'Select analog input channel: Output 00H to 8255 Port B (00C2H) to choose Channel IN0 (ADD A=0, ADD B=0, ADD C=0).',
      'Generate ALE and SOC Pulse: Output 01H to Port C (00C4H) to set PC0 HIGH. Insert small delay (~2 µs), then output 00H to Port C to set PC0 LOW.',
      'Poll EOC Status: Read Port C (IN AL, DX). Test Bit 7 (TEST AL, 80H). If ZF = 1 (EOC is LOW, conversion in progress), loop back and poll again.',
      'Assert Output Enable: When EOC = HIGH, output 04H to Port C (sets PC2 = 1, enabling ADC 3-state output drivers).',
      'Read Digital Conversion Data: Read 8-bit digital output from 8255 Port A (Address 00C0H) into AL register (IN AL, DX).',
      'De-assert Output Enable: Output 00H to Port C (resets PC2 = 0) to release the data bus.',
      'Store & Process Data: Save AL into memory variable DIGITAL_VAL and calculate analog voltage: Voltage_mV = (AL x 5000) / 255.',
      'Terminate program cleanly via DOS Interrupt 21H Service 4CH.'
    ],
    flowchartSteps: [
      { type: 'start', label: 'START (Initialize Segment Registers DS = @DATA)' },
      { type: 'process', label: 'Initialize 8255 PPI: Write CWR = 98H (Port A=IN, Port B=OUT, PC_Upper=IN, PC_Lower=OUT)' },
      { type: 'io', label: 'Select Channel IN0: Output 00H to Port B (00C2H)' },
      { type: 'process', label: 'Assert ALE / SOC Pulse: Output PC0 = 1, Delay, Output PC0 = 0' },
      { type: 'io', label: 'Read Port C (00C4H) Status Byte into AL' },
      { type: 'decision', label: 'Is End-of-Conversion Complete (PC7 / EOC == 1)?' },
      { type: 'process', label: 'Assert Output Enable: Output PC2 = 1 (OE HIGH)' },
      { type: 'io', label: 'Read 8-Bit Digital Byte from Port A (00C0H) into AL' },
      { type: 'process', label: 'De-assert OE: Output PC2 = 0; Save AL into DIGITAL_VAL' },
      { type: 'process', label: 'Compute Analog Voltage: V_in = (AL x 5000) / 255 mV' },
      { type: 'stop', label: 'STOP (Exit to DOS via INT 21H 4CH)' }
    ],
    expectedOutput: {
      desc: 'ADC successfully converts variable analog input voltage (0.00V - 5.00V) into an 8-bit digital hex code (00H - FFH) stored in memory.',
      inputs: [
        { name: 'ANALOG_VIN', val: '2.50 V DC (Channel IN0)' },
        { name: 'V_REF', val: '+5.00 V DC Full Scale' },
        { name: '8255_CWR_MODE', val: '98H (Port A In, Port B Out, PC_Upper In, PC_Lower Out)' }
      ],
      outputs: [
        { name: 'DIGITAL_HEX_OUTPUT', val: '80H (128 Decimal Code)' },
        { name: 'CALCULATED_VOLTAGE', val: '2500 mV (2.50 Volts)' },
        { name: 'EOC_CYCLES_POLLED', val: '14 Polling Iterations (~100 µs)' }
      ],
      registers: 'AX=09C4H BX=00FFH CX=0000H DX=00C0H SP=0100H',
      terminalDump: '=== 8086 ADC 0808 INTERFACING EXPERIMENT ===\n8255 PPI INITIALIZED: CWR = 98H\nSELECTED CHANNEL: IN0 (Analog Input = 2.50V)\nALE / SOC PULSE ISSUED (PC0 = 1 -> 0)\nPOLLING EOC ON PC7: CONVERSION COMPLETE (EOC = 1)\nOE ASSERTED (PC2 = 1) -> READING PORT A\nACQUIRED DIGITAL BYTE: 80H (10000000b = 128d)\nCOMPUTED ANALOG VOLTAGE: 2500 mV (2.500 V)\nSUCCESSFUL ACQUISITION: ZERO QUANTIZATION ERROR.'
    },
    manualCalculations: {
      title: 'ADC Resolution, Conversion Time & Digital Transfer Proof',
      steps: [
        { step: '1. ADC Step Size / Resolution Formula', detail: 'Resolution (1 LSB) = Vref / (2^n - 1) = 5.00 V / 255 = 19.6078 mV per count (or 5.00 V / 256 = 19.53 mV).' },
        { step: '2. Digital Output Code Calculation', detail: 'Digital Output D = Round((Vin / Vref) x 255). For Vin = 2.50 V: D = Round((2.50 / 5.00) x 255) = 128 = 80H. For Vin = 3.75 V: D = Round((3.75 / 5.00) x 255) = 191 = BFH. For Vin = 5.00 V: D = 255 = FFH.' },
        { step: '3. Conversion Time Calculation', detail: 'T_conv = 8 x Clock Period + 8 Clock Cycles = 64 Clock Periods. At f_clk = 640 kHz: T_conv = 64 / 640,000 = 100 µs.' },
        { step: '4. 8255 Control Word Formulation', detail: 'D7=1 (I/O Mode), D6D5=00 (Group A Mode 0), D4=1 (Port A Input), D3=1 (Port C Upper Input for EOC PC7), D2=0 (Group B Mode 0), D1=0 (Port B Output), D0=0 (Port C Lower Output for SOC PC0 and OE PC2) -> Binary: 1001 1000b = 98H.' },
        { step: '5. Reverse Voltage Reconstruction', detail: 'Vin_reconstructed = (D x 5000) / 255 mV = (128 x 5000) / 255 = 640000 / 255 ≈ 2509.8 mV (Quantization error < 0.5 LSB).' }
      ]
    },
    resultText: 'The 8086 assembly language program for interfacing ADC 0808 via 8255 PPI was executed successfully. The analog voltage was accurately digitized, polled via EOC, and stored into memory.',
    precautions: [
      'Never exceed Vref (+5.0 V) on the analog input pins (IN0-IN7) of ADC 0808 to avoid permanent CMOS latch-up damage.',
      'Ensure a continuous external 500 kHz - 640 kHz clock signal is applied to Pin 10 of ADC 0808; otherwise the SAR internal shift register will freeze.',
      'Always de-assert Output Enable (OE = 0) after reading Port A to release the 8255 data bus and avoid bus contention.'
    ],
    studentTask: {
      title: 'Multi-Channel ADC Temperature & Light Data Logger',
      desc: 'Modify the ALP to read 4 consecutive analog channels (IN0: Temp Sensor LM35, IN1: Light LDR, IN2: Potentiometer 1, IN3: Potentiometer 2) sequentially into an array `ADC_BUFFER DB 4 DUP(?)`.',
      hint: 'Run an outer loop with CX = 4, increment Port B channel select code (00H, 01H, 02H, 03H), trigger SOC, wait for EOC, and store each result into [DI+SI].'
    },
    applications: [
      { title: 'Industrial SCADA Sensor Gateways', desc: 'Acquiring temperature, pressure, flow rate, and 4-20 mA current-loop industrial analog signals.', icon: 'activity' },
      { title: 'Automotive Engine ECU Telemetry', desc: 'Digitizing throttle position (TPS), manifold absolute pressure (MAP), and oxygen sensor analog voltages.', icon: 'gauge' },
      { title: 'Digital Multimeters & Oscilloscopes', desc: 'Front-end analog signal acquisition, sampling, and quantization in test and measurement instruments.', icon: 'cpu' }
    ]
  },
  exp_dac: {
    number: '7B',
    title: 'Interfacing DAC (DAC 0800) with 8086 & Waveform Generation',
    aim: 'Write an ALP to 8086 processor to Interface DAC and generate Square Wave/Triangular Wave/Stepsignal.',
    category: 'Hardware Interfacing & Waveform Synthesis',
    bloomLevel: 'Apply & Analyze (L3/L4)',
    labSessionTime: '3 Hours',
    objectives: [
      'Interface an 8-bit Digital-to-Analog Converter (DAC 0800) with 8086 microprocessor using 8255 PPI.',
      'Configure 8255 PPI in Mode 0 with Port A as an 8-bit output port (Control Word = 80H).',
      'Synthesize a precision Square Wave by toggling Port A between 00H (0V) and FFH (+5V) with symmetric software delay routines.',
      'Synthesize a linear Triangular Wave by generating incremental ramp-up (00H to FFH) and ramp-down (FFH to 00H) digital sequences.',
      'Synthesize a Step Signal (Staircase Wave) by outputting discrete incremental voltage plateaus with calibrated hold intervals.',
      'Observe and measure amplitude, time period, and frequency of generated waveforms on a Cathode-Ray Oscilloscope (CRO) / DSO.'
    ],
    outcomes: [
      'Understand R-2R ladder current-steering DAC architecture and operational amplifier current-to-voltage (I-to-V) conversion.',
      'Write assembly routines to synthesize arbitrary continuous analog waveforms via discrete digital sampling.',
      'Calculate waveform frequency based on 8086 CPU clock cycles and software loop instruction execution times.',
      'Calibrate analog offset and gain errors using operational amplifier feedback trim resistors.'
    ],
    components: [
      { name: '8086 Microprocessor Kit / Trainer', spec: '5 MHz / 8 MHz Minimum Mode CPU', purpose: 'Executes waveform synthesis ALPs and streams digital samples to 8255' },
      { name: '8255 PPI Interface Card', spec: 'Port A @ 00C0H, CWR @ 00C6H', purpose: 'Outputs 8-bit digital words to DAC0800 digital data inputs (D0-D7)' },
      { name: 'DAC 0800 Converter IC', spec: '8-Bit R-2R Ladder, 100 ns Settling Time', purpose: 'Converts 8-bit digital input codes into proportional complementary output currents (Iout, Iout_bar)' },
      { name: 'Operational Amplifier (LM741 / OP-07)', spec: 'Dual Supply ±12V DC, Rf = 5 kΩ', purpose: 'Converts DAC output current into analog output voltage: Vo = -Iout x Rf (0V to +5V)' },
      { name: 'Digital Storage Oscilloscope (DSO) / CRO', spec: '20 MHz Dual Channel DSO', purpose: 'Visualizes and measures synthesized square, triangular, and staircase waveforms' }
    ],
    procedureSteps: [
      'Connect 8255 PPI Port A output pins (PA0-PA7) to DAC 0800 digital input pins (D0-D7).',
      'Connect DAC 0800 current output pin (Iout, Pin 4) to the inverting input (-) of the LM741/OP-07 operational amplifier.',
      'Connect a 5 kΩ feedback resistor (Rf) between the op-amp output (Pin 6) and inverting input (Pin 2). Connect non-inverting input (+) to GND.',
      'Connect Vref(+) = +5.0 V (through 2.5 kΩ resistor for 2 mA Iref) and Vref(-) = GND.',
      'Connect the op-amp output terminal to Channel 1 of the oscilloscope (CRO/DSO).',
      'Assemble and run the Square Wave ALP: Observe a symmetric 0V to +5V square pulse on the CRO and measure frequency.',
      'Assemble and run the Triangular Wave ALP: Observe symmetric linear ramp-up and ramp-down triangular waveform on the CRO.',
      'Assemble and run the Step Signal ALP: Observe 6-step staircase discrete plateaus advancing from 0V to +5V.',
      'Measure peak-to-peak amplitude (Vp-p = 5.0 V) and calculate time period T for each synthesized wave.'
    ],
    theoryText: 'Digital-to-Analog Converters (DACs) translate binary digital codes into proportional continuous analog electrical quantities (current or voltage). The DAC 0800 is an 8-bit monolithic current-output DAC based on an inverted R-2R resistor ladder network. The output current Iout is given by Iout = Iref x (D/256), where D is the 8-bit digital input value (0 to 255) and Iref is the reference current (typically 2 mA with Vref = +5V and Rref = 2.5 kΩ). An external operational amplifier (OP-07 or LM741) in an inverting current-to-voltage (I-to-V) converter configuration converts this current to output voltage Vo = Iout x Rf = (Vref x Rf / Rref) x (D/256). By writing sequential digital values through 8255 PPI Port A, the 8086 synthesizes diverse analog waveforms: (1) Square wave by toggling between 00H and FFH, (2) Triangular wave by continuously incrementing (00H to FFH) and decrementing (FFH to 00H) in steps of 1, and (3) Step signal (staircase) by incrementing in discrete steps (e.g. 33H) with a flat plateau delay.',
    theoryDiagramType: 'dac-waveforms',
    algorithmSteps: [
      'Initialize 8255 PPI: Write control word 80H to Control Word Register (00C6H) to configure Port A in Mode 0 as an 8-bit Output port.',
      'SQUARE WAVE: Output 00H (0V) to 8255 Port A (00C0H). Call software delay loop DELAY_HALF. Output FFH (+5V) to Port A. Call DELAY_HALF. Repeat loop continuously.',
      'TRIANGULAR WAVE (RAMP UP): Initialize AL = 00H. In a loop, output AL to Port A, increment AL (INC AL), execute micro-delay, and loop until AL reaches FFH (ZF=0).',
      'TRIANGULAR WAVE (RAMP DOWN): Load AL = FFH. In a loop, output AL to Port A, decrement AL (DEC AL), execute micro-delay, and loop until AL reaches 00H (ZF=0). Repeat Ramp Up and Ramp Down continuously.',
      'STEP SIGNAL (STAIRCASE WAVE): Initialize AL = 00H. In a loop, output AL to Port A, call step hold delay (~5 ms), add step size 33H (ADD AL, 33H). If no carry (JNC), repeat next step; if carry occurs (overflow past FFH), wrap around to AL = 00H and repeat continuously.',
      'Monitor waveform characteristics (amplitude, duty cycle, frequency) on oscilloscope.'
    ],
    flowchartSteps: [
      { type: 'start', label: 'START (Initialize DS = @DATA, CWR = 80H Port A Output)' },
      { type: 'process', label: 'Select Waveform Mode: [1] Square Wave, [2] Triangular Wave, [3] Step Signal' },
      { type: 'io', label: 'SQUARE: Output AL = 00H (0V) -> DELAY -> Output AL = FFH (+5V) -> DELAY' },
      { type: 'decision', label: 'Is Square Wave Loop Active? (Repeat continuously until key pressed)' },
      { type: 'io', label: 'TRIANGLE RAMP UP: Output AL (00H to FFH), INC AL, Micro-Delay' },
      { type: 'io', label: 'TRIANGLE RAMP DOWN: Output AL (FFH to 00H), DEC AL, Micro-Delay' },
      { type: 'decision', label: 'Is Triangular Peak / Trough reached (AL == 00H / FFH)?' },
      { type: 'io', label: 'STEP SIGNAL: Output AL -> Hold Delay (~5 ms) -> ADD AL, 33H' },
      { type: 'decision', label: 'Has Step Staircase reached Top Level (Carry = 1)?' },
      { type: 'stop', label: 'STOP (Exit cleanly to DOS via AH=4CH)' }
    ],
    expectedOutput: {
      desc: 'DAC 0800 generates clean analog Square, Triangular, and Step (Staircase) waveforms displayed on the oscilloscope with 0.0V to +5.0V peak-to-peak amplitude.',
      inputs: [
        { name: '8255_CWR_MODE', val: '80H (Port A Mode 0 Output)' },
        { name: 'DAC_RESOLUTION', val: '8-Bit R-2R Ladder (256 Discrete Levels)' },
        { name: 'WAVE_SELECTION', val: 'Square Wave / Triangular Wave / Step Signal' }
      ],
      outputs: [
        { name: 'SQUARE_WAVE_OUTPUT', val: 'V_low = 0.0V (00H), V_high = +5.0V (FFH), 50% Duty Cycle' },
        { name: 'TRIANGULAR_OUTPUT', val: 'Linear Slope: 0.0V to 5.0V to 0.0V (Vp-p = 5.0V, Freq ≈ 1.2 kHz)' },
        { name: 'STEP_SIGNAL_OUTPUT', val: '6-Step Staircase: 0.0V -> 1.0V -> 2.0V -> 3.0V -> 4.0V -> 5.0V' }
      ],
      registers: 'AX=00FFH BX=0000H CX=0000H DX=00C0H SP=0100H',
      terminalDump: '=== 8086 DAC 0800 WAVEFORM SYNTHESIZER ===\n8255 PPI INITIALIZED: CWR = 80H (Port A Output @ 00C0H)\nDAC 0800 + OP-AMP I-to-V CONVERTER ACTIVE (Vref = 5.00V)\nGENERATING WAVEFORMS:\n[1] SQUARE WAVE: 00H (0V) <---> FFH (5.0V) | Symmetric 50% Duty\n[2] TRIANGULAR WAVE: Linear Ramp Up (00H..FFH) & Ramp Down (FFH..00H)\n[3] STEP SIGNAL: 6-Level Staircase (00H, 33H, 66H, 99H, CCH, FFH)\nOSCILLOSCOPE PROBE: MEASURED Vp-p = 5.00V PEAK-TO-PEAK.'
    },
    manualCalculations: {
      title: 'DAC Voltage Transfer, Step Voltage & Waveform Frequency Calculations',
      steps: [
        { step: '1. DAC Output Voltage Transfer Function', detail: 'Vo = (Vref x Rf / Rref) x (Digital Code / 256). With Vref = 5.0V, Rref = 2.5 kΩ, Rf = 2.5 kΩ: Vo = 5.0 x (D / 256) Volts.' },
        { step: '2. Minimum Step Voltage (Resolution)', detail: '1 LSB Voltage = 5.00 V / 256 = 19.531 mV. For D = 00H: Vo = 0.00 V. For D = 80H (128d): Vo = 2.50 V. For D = FFH (255d): Vo = 4.98 V.' },
        { step: '3. Square Wave Frequency Formula', detail: 'T = 2 x T_half = 2 x (T_instructions + T_delay). With CX = 512 in delay loop: T_delay ≈ 512 x 17 / (5 MHz) ≈ 1.74 ms. Freq = 1 / (2 x 1.74 ms) ≈ 287 Hz.' },
        { step: '4. Triangular Wave Period & Frequency', detail: 'T = (256 ramp-up steps + 256 ramp-down steps) x T_step. With T_step ≈ 12 µs: T = 512 x 12 µs = 6.14 ms -> Freq ≈ 163 Hz.' },
        { step: '5. Step Signal (Staircase) Level Calculations', detail: 'Step 0 (00H): 0.00V, Step 1 (33H = 51d): 1.00V, Step 2 (66H = 102d): 2.00V, Step 3 (99H = 153d): 3.00V, Step 4 (CCH = 204d): 4.00V, Step 5 (FFH = 255d): 5.00V.' }
      ]
    },
    resultText: 'The 8086 DAC 0800 interfacing ALP was executed successfully on 8255 PPI hardware. Square, Triangular, and Step waveforms were generated and verified on the oscilloscope.',
    precautions: [
      'Ensure the op-amp dual power supply (±12V) is balanced; an unbalanced supply will clip negative/positive waveform peaks.',
      'Keep software delay loops identical for High and Low states of the square wave to maintain an exact 50% duty cycle.',
      'Use an OP-07 precision op-amp or trim the offset null potentiometer of LM741 to eliminate DC ground offset error.'
    ],
    studentTask: {
      title: 'Sawtooth Wave & Arbitrary Sine Wave Generator',
      desc: '1. Write an ALP to generate a pure Sawtooth wave (rapid ramp-up from 00H to FFH, then instant drop to 00H). 2. Generate a 32-sample lookup table sine wave: V(t) = 2.5 + 2.5·sin(2πt).',
      hint: 'For sawtooth, execute linear INC AL loop and jump back to AL=00H. For sine wave, store 32 pre-computed values in `SINE_TABLE DB ...` and cycle through table with SI pointer.'
    },
    applications: [
      { title: 'Audio Synthesizers & Function Generators', desc: 'Synthesizing pure sine, triangle, square, and arbitrary analog acoustic signals.', icon: 'activity' },
      { title: 'Motor Speed Drive Reference Signal', desc: 'Generating variable analog 0-10V reference setpoints for variable frequency drives (VFDs).', icon: 'gauge' },
      { title: 'CRT Deflection & Radar Sweeps', desc: 'Generating linear ramp voltages for beam horizontal sweep deflection circuits in CRT displays.', icon: 'radar' }
    ]
  },
  exp5: {
    number: '8',
    title: 'Block Data Transfer (Memory Copy & Management)',
    aim: 'Write an ALP to copy a block of 10 data bytes from source to destination.',
    category: 'String & Memory Manipulation',
    bloomLevel: 'Apply (L3)',
    labSessionTime: '3 Hours',
    objectives: ['Learn high-speed data transfers.', 'Understand REP MOVSB instructions.'],
    outcomes: ['Understand segment-to-segment copies.', 'Manipulate string pointers.'],
    components: [{ name: 'MASM', spec: 'v6.11', purpose: 'Compiler' }, { name: 'DOSBox', spec: 'v0.74', purpose: 'DOS emulator' }],
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
  },
  exp_8051_arith: {
    number: '9A',
    title: '8051 Arithmetic Instructions – Addition, Subtraction & BCD Arithmetic',
    aim: 'Write an ALP to 8051 Microcontroller to perform Arithmetic operations like 8-bit/16-bit addition with carry, subtraction with borrow, and BCD addition with Decimal Adjust (DA A).',
    category: 'Microcontroller Programming & ALU Operations',
    bloomLevel: 'Apply & Evaluate (L3/L5)',
    labSessionTime: '3 Hours',
    objectives: [
      'Understand the 8051 ALU architecture, Accumulator (A), and Program Status Word (PSW).',
      'Master 8-bit addition (ADD A, src) and carry-propagation addition (ADDC A, src).',
      'Execute multi-byte 16-bit arithmetic by propagating the Carry bit (CY) across consecutive bytes.',
      'Implement subtraction with borrow (SUBB A, src) and understand mandatory pre-clearing of CY (CLR C).',
      'Execute packed BCD addition and analyze nibble correction using Decimal Adjust (DA A).'
    ],
    outcomes: [
      'Proficiency in writing multi-precision and BCD arithmetic routines for 8051 embedded systems.',
      'Ability to correctly predict PSW flag changes (CY, AC, OV, P) after ALU operations.',
      'Design robust sensor calibration and decimal display routines using 8051 arithmetic.'
    ],
    components: [
      { name: '8051 Microcontroller Trainer / Simulator', spec: 'AT89C51 / 8051 Core @ 11.0592 MHz / 12 MHz', purpose: 'Executes 8051 machine code instructions' },
      { name: 'Keil µVision IDE / 8051 Assembler', spec: 'v5.x C51 / A51 Toolchain', purpose: 'Assembles, links, and simulates 8051 ALP source files' },
      { name: 'Internal RAM Data Memory', spec: '128 Bytes Direct/Indirect RAM (00H - 7FH)', purpose: 'Stores operand data and arithmetic result words' }
    ],
    procedureSteps: [
      'Launch Keil µVision IDE, create a new 8051 project target, and select standard AT89C51 device.',
      'Create a new assembly source file `EXP9A_ARITH.A51` and add it to the project source group.',
      'Enter the ALP source code implementing 8-bit ADD, 16-bit ADDC, 8-bit SUBB, and BCD DA A routines.',
      'Translate and assemble the source file. Ensure `0 Errors, 0 Warnings`.',
      'Start the Keil debug session (`Ctrl + F5`) and open the Register Window and Memory Window (`D:0x30`).',
      'Execute step-by-step (`F11`) and observe Accumulator (A), PSW flags (CY, AC, OV, P), and internal RAM locations (40H to 48H).',
      'Verify that 8-bit sum (F8H + 19H = 11H, CY=1) and 16-bit sum (12E4H + 345CH = 4740H) match manual calculations.',
      'Verify that 95H - 47H = 4EH (CY=0) and BCD addition (38H + 49H = 87H) produces valid BCD.'
    ],
    theoryText: 'The Intel 8051 is an 8-bit Harvard architecture microcontroller with a dedicated 8-bit Arithmetic Logic Unit (ALU). All arithmetic operations inherently involve the Accumulator (A, SFR address E0H) as the destination and primary operand. The Program Status Word (PSW, SFR D0H) registers ALU operational status via flags: CY (Carry Flag, PSW.7), AC (Auxiliary Carry, PSW.6), OV (Overflow Flag, PSW.2), and P (Parity Flag, PSW.0). Addition of two 8-bit values is performed using `ADD A, src` (A ← A + src) or `ADDC A, src` (A ← A + src + CY) for multi-byte ripple addition. For subtraction, 8051 provides only `SUBB A, src` (A ← A - src - CY); thus, single-precision subtraction requires executing `CLR C` immediately prior to SUBB to eliminate unwanted previous borrows. Decimal Adjust (`DA A`) automatically inspects the lower nibble (D3-D0) and upper nibble (D7-D4); if lower nibble > 9 or AC=1, it adds 06H; if upper nibble > 9 or CY=1, it adds 60H, producing valid packed BCD results.',
    theoryDiagramType: 'mcu-arith',
    algorithmSteps: [
      'Load 8-bit operands into RAM 30H (F8H) and 31H (19H). Initialize Carry byte 41H = 00H.',
      'Move 30H into A; execute ADD A, 31H; store sum A into 40H; if CY=1, write 01H to 41H.',
      'Load 16-bit operands: Word1 = 12E4H (RAM 33H:32H), Word2 = 345CH (RAM 35H:34H). Clear CY (CLR C).',
      'Add lower bytes: MOV A, 32H -> ADD A, 34H -> Store lower sum in 42H.',
      'Add higher bytes with carry: MOV A, 33H -> ADDC A, 35H -> Store upper sum in 43H; if CY=1, write 01H to 44H.',
      'Execute 8-bit subtraction: Load minuend 95H (RAM 36H) into A; CLR C; SUBB A, 37H (47H); store difference in 45H.',
      'Execute BCD addition: Load BCD1 (38H) into A; ADD A, #49H; execute DA A to correct to 87H; store BCD sum in 47H.',
      'Trap CPU in terminal loop (SJMP $).'
    ],
    flowchartSteps: [
      { type: 'start', label: 'START (Reset Vector 0000H -> LJMP START)' },
      { type: 'process', label: '8-Bit ADD: A = [30H] (F8H) + [31H] (19H) -> Store Sum in 40H' },
      { type: 'decision', label: 'Is Carry CY == 1?' },
      { type: 'process', label: '16-Bit Low Byte: A = [32H] (E4H) + [34H] (5CH) -> Store Low Sum in 42H' },
      { type: 'process', label: '16-Bit High Byte: A = [33H] (12H) + [35H] (34H) + CY -> Store High Sum in 43H' },
      { type: 'process', label: '8-Bit SUBB: CLR C -> A = [36H] (95H) - [37H] (47H) -> Store Diff in 45H' },
      { type: 'process', label: 'BCD Addition: A = 38H + 49H (= 81H) -> DA A (Adjust to 87H) -> Store in 47H' },
      { type: 'stop', label: 'STOP (SJMP $ Infinite Loop)' }
    ],
    expectedOutput: {
      desc: '8-Bit Sum: F8H + 19H = 11H (CY=1), 16-Bit Sum: 12E4H + 345CH = 4740H, Sub: 95H - 47H = 4EH, BCD Sum: 38 + 49 = 87',
      inputs: [
        { name: '8-Bit Inputs (30H, 31H)', val: '30H = F8H, 31H = 19H' },
        { name: '16-Bit Inputs (33:32H, 35:34H)', val: 'Word1 = 12E4H, Word2 = 345CH' },
        { name: 'Subtraction Inputs (36H, 37H)', val: 'Minuend = 95H, Subtrahend = 47H' },
        { name: 'BCD Inputs (38H, 39H)', val: 'BCD1 = 38H, BCD2 = 49H' }
      ],
      outputs: [
        { name: 'RAM 40H..41H (8-Bit Sum & Carry)', val: 'Sum = 11H, Carry = 01H' },
        { name: 'RAM 42H..44H (16-Bit Sum & Carry)', val: 'Lower = 40H, Upper = 47H, Carry = 00H' },
        { name: 'RAM 45H..46H (Difference & Borrow)', val: 'Diff = 4EH (78D), Borrow = 00H' },
        { name: 'RAM 47H..48H (BCD Sum & Carry)', val: 'BCD Sum = 87H, BCD Carry = 00H' }
      ],
      registers: 'A=87H PSW=01H(P=1,CY=0,AC=0,OV=0) SP=07H',
      terminalDump: '8051 Internal RAM Dump [40H..48H]: 11 01 40 47 00 4E 00 87 00'
    },
    manualCalculations: {
      title: '8051 Arithmetic Calculation Verification',
      steps: [
        { step: '8-Bit Binary Sum', detail: 'F8H (1111 1000b) + 19H (0001 1001b) = 111H (0001 0001 0001b) -> Low byte = 11H, CY = 1' },
        { step: '16-Bit Multi-byte Sum', detail: 'Lower: E4H + 5CH = 140H (Sum=40H, CY=1). Upper: 12H + 34H + 1(CY) = 47H. Total = 4740H' },
        { step: '8-Bit Subtraction', detail: '95H (149D) - 47H (71D) - 0(CY) = 4EH (78D), Borrow CY = 0' },
        { step: 'Packed BCD Addition with DA A', detail: '38H + 49H = 81H. Since AC=1 (8+9=17 > 15), DA A adds 06H -> 81H + 06H = 87H (Valid BCD 87)' }
      ]
    },
    resultText: '8051 8-bit, 16-bit, subtraction, and Decimal Adjust BCD arithmetic operations were successfully executed and verified in internal RAM.',
    precautions: [
      'Always execute `CLR C` prior to `SUBB A, src` to avoid false borrow subtraction.',
      '`DA A` only works correctly after an `ADD` or `ADDC` instruction; it CANNOT be used after `SUBB` or `INC`.',
      'Ensure 16-bit multi-byte words are arranged consistently in memory (Little-Endian or Big-Endian).'
    ],
    studentTask: {
      title: '32-Bit Multi-Precision BCD Adder',
      desc: 'Extend the program to add two 4-byte (8-digit) packed BCD numbers from RAM 50H-53H and 54H-57H using an indexed loop.',
      hint: 'Use R0 and R1 as indirect RAM pointers with `@R0` and `@R1`, looping 4 times with `ADDC A, @R1` and `DA A`.'
    },
    applications: [
      { title: 'Digital Multimeter / Counter', desc: 'BCD counting and decimal seven-segment LED display decoding.', icon: 'calculator' },
      { title: 'Electronic Energy Meter', desc: 'Accumulation of active power kilowatt-hour units in non-volatile RAM.', icon: 'zap' }
    ]
  },
  exp_8051_muldiv: {
    number: '9B',
    title: '8051 Multiplication & Division Instructions – MUL AB & DIV AB',
    aim: 'Write an ALP to 8051 Microcontroller to perform unsigned 8-bit multiplication (MUL AB) and division (DIV AB), and evaluate the Overflow (OV) flag.',
    category: 'Microcontroller Arithmetic & Flag Evaluation',
    bloomLevel: 'Apply & Analyze (L3/L4)',
    labSessionTime: '3 Hours',
    objectives: [
      'Understand dedicated hardware multiplication (`MUL AB`) and division (`DIV AB`) in 8051.',
      'Analyze register allocation for Accumulator A and Register B during MUL and DIV operations.',
      'Evaluate Overflow Flag (OV) behavior for product magnitude > 255 and division-by-zero detection.',
      'Store quotient, remainder, low product byte, and high product byte in designated RAM locations.'
    ],
    outcomes: [
      'Master single-instruction 8-bit arithmetic multiplication and division on 8051 hardware.',
      'Detect arithmetic overflow and zero-divisor exceptions using conditional branch instructions (`JB OV, label`).',
      'Implement PID control loops and digital filter scaling routines in embedded firmware.'
    ],
    components: [
      { name: '8051 Microcontroller Trainer / Kit', spec: 'Intel 8051 / Atmel AT89S52 Microcontroller @ 12 MHz', purpose: 'Hardware CPU executing 4-cycle MUL/DIV instructions' },
      { name: 'Keil µVision IDE & Debugger', spec: 'C51 / A51 Macro Assembler', purpose: 'Compiles, single-steps, and monitors SFRs A, B, PSW' },
      { name: 'On-Chip SFR Memory', spec: 'Accumulator (E0H), Register B (F0H), PSW (D0H)', purpose: 'Special Function Registers utilized by MUL AB and DIV AB' }
    ],
    procedureSteps: [
      'Open Keil µVision and create an 8051 assembly project `EXP9B_MULDIV.A51`.',
      'Type the source code loading multiplicand (F5H = 245D) into A and multiplier (18H = 24D) into B.',
      'Issue `MUL AB` instruction and inspect contents of A (Low Byte = F8H) and B (High Byte = 16H), and observe OV = 1.',
      'Store product low and high bytes into RAM 40H and 41H.',
      'Load dividend (F5H = 245D) into A and divisor (0AH = 10D) into B.',
      'Issue `DIV AB` instruction and observe quotient in A (18H = 24D) and remainder in B (05H = 5D), with OV = 0.',
      'Store quotient and remainder into RAM 43H and 44H.',
      'Demonstrate division by zero by setting B = 00H and calling `DIV AB`; verify OV is set to 1.'
    ],
    theoryText: 'The 8051 provides dedicated hardware multiplier and divider execution units that operate exclusively on Accumulator A (E0H) and Register B (F0H) in 4 machine cycles (48 oscillator periods). In `MUL AB`, the 8-bit unsigned integer in A is multiplied by the 8-bit unsigned integer in B. The resulting 16-bit product is split such that the lower 8 bits remain in A and the upper 8 bits are placed in B (Product = B:A). If the product exceeds 255 (00FFH, i.e., B ≠ 00H), the Overflow flag (OV, PSW.2) is set to 1; otherwise OV = 0. The Carry flag (CY) is always cleared to 0 by MUL AB. In `DIV AB`, the 8-bit unsigned dividend in A is divided by the 8-bit unsigned divisor in B. The integer quotient is left in A, while the integer remainder is stored in B. If divisor B = 00H (division-by-zero error), the OV flag is set to 1 to alert firmware and results are undefined; if B ≠ 0, OV is cleared to 0. CY is always cleared to 0 by DIV AB.',
    theoryDiagramType: 'mcu-muldiv',
    algorithmSteps: [
      'Load multiplicand 0F5H into RAM 30H and multiplier 18H into RAM 31H.',
      'Move [30H] to Accumulator A; move [31H] to Register B.',
      'Execute `MUL AB`. Copy Low Product Byte A to RAM 40H; copy High Product Byte B to RAM 41H.',
      'Check Overflow flag OV (PSW.2); if OV=1, record 01H in RAM 42H.',
      'Load dividend 0F5H into RAM 32H and divisor 0AH into RAM 33H.',
      'Move [32H] to A; move [33H] to B.',
      'Execute `DIV AB`. Copy Quotient A to RAM 43H; copy Remainder B to RAM 44H.',
      'Check OV flag; if OV=1 (division by zero), store error code 0FFH in RAM 45H.',
      'Halt CPU in endless loop (SJMP $).'
    ],
    flowchartSteps: [
      { type: 'start', label: 'START (Initialize 8051 Project)' },
      { type: 'process', label: 'MUL Phase: A = 0F5H (245D), B = 18H (24D)' },
      { type: 'process', label: 'Execute MUL AB -> A = F8H (Low), B = 16H (High), OV = 1' },
      { type: 'process', label: 'Store Product: [40H] = F8H, [41H] = 16H' },
      { type: 'process', label: 'DIV Phase: A = 0F5H (245D), B = 0AH (10D)' },
      { type: 'process', label: 'Execute DIV AB -> A = 18H (Quotient 24), B = 05H (Remainder 5)' },
      { type: 'decision', label: 'Is Divisor B == 0 (OV == 1)?' },
      { type: 'process', label: 'Store Division Results: [43H] = 18H, [44H] = 05H' },
      { type: 'stop', label: 'STOP (SJMP $ Endless Halt)' }
    ],
    expectedOutput: {
      desc: 'Multiplication: 245 * 24 = 5880 (16F8H) -> A=F8H, B=16H, OV=1. Division: 245 / 10 = Quot 24 (18H), Rem 5 (05H), OV=0',
      inputs: [
        { name: 'Multiplication Operands (30H, 31H)', val: 'A = 0F5H (245D), B = 18H (24D)' },
        { name: 'Division Operands (32H, 33H)', val: 'A = 0F5H (245D), B = 0AH (10D)' }
      ],
      outputs: [
        { name: 'RAM 40H..41H (16-Bit Product B:A)', val: 'Low = F8H, High = 16H (Product = 16F8H = 5880D)' },
        { name: 'RAM 42H (MUL OV Flag)', val: 'OV = 01H (Product > 255)' },
        { name: 'RAM 43H..44H (Quotient & Remainder)', val: 'Quotient = 18H (24D), Remainder = 05H (5D)' },
        { name: 'RAM 45H (DIV Error Status)', val: 'DIV Error = 00H (Valid Divisor)' }
      ],
      registers: 'A=18H B=05H PSW=01H(P=1,OV=0,CY=0) SP=07H',
      terminalDump: '8051 Internal RAM Dump [40H..45H]: F8 16 01 18 05 00'
    },
    manualCalculations: {
      title: 'MUL AB & DIV AB Verification',
      steps: [
        { step: 'Multiplication Product', detail: '245 (0F5H) × 24 (18H) = 5880D = 16F8H. Low byte = F8H (in A), High byte = 16H (in B). Since B ≠ 0, OV = 1.' },
        { step: 'Division Quotient & Remainder', detail: '245 (0F5H) ÷ 10 (0AH) = 24 with remainder 5. Quotient = 24D = 18H (in A), Remainder = 5D = 05H (in B). OV = 0.' },
        { step: 'Division by Zero Exception', detail: '100 (64H) ÷ 0 (00H) -> Undefined quotient; OV flag is set to 1 to signal error condition.' }
      ]
    },
    resultText: '8051 hardware multiplication (MUL AB) and division (DIV AB) operations were executed and verified with exact product splitting, quotient/remainder calculation, and OV flag validation.',
    precautions: [
      'Both `MUL AB` and `DIV AB` require 4 machine cycles to execute, compared to 1 machine cycle for ADD/SUBB.',
      'Always test the OV flag after `DIV AB` if the divisor is dynamically computed to prevent division-by-zero crashes.',
      'Do not rely on the Carry flag after MUL or DIV, as both instructions unconditionally clear CY to 0.'
    ],
    studentTask: {
      title: 'Average Value Calculator for 8-Byte Array',
      desc: 'Compute the arithmetic mean of an 8-byte array stored at RAM 50H-57H using an accumulator loop and DIV AB.',
      hint: 'Accumulate sum in a 16-bit register pair (R2:R3), then divide by 8 using `DIV AB` or three successive `RRC A` rotates.'
    },
    applications: [
      { title: 'PWM Duty Cycle Calculator', desc: 'Converts ADC 8-bit sensor readings into timer reload reload values.', icon: 'activity' },
      { title: 'Speed & RPM Computation', desc: 'Calculates shaft RPM from optical encoder pulse counts.', icon: 'gauge' }
    ]
  },
  exp_8051_logic: {
    number: '9C',
    title: '8051 Logical Instructions – AND, OR, XOR, NOT & Nibble Swapping',
    aim: 'Write an ALP to 8051 Microcontroller to perform Logical operations like AND (ANL), OR (ORL), XOR (XRL), 1\'s Complement (CPL), and Nibble Swapping (SWAP).',
    category: 'Microcontroller Logic & Bit-Level Manipulation',
    bloomLevel: 'Apply & Analyze (L3/L4)',
    labSessionTime: '3 Hours',
    objectives: [
      'Master 8051 bitwise byte-level logical instructions: `ANL`, `ORL`, `XRL`, `CPL`, and `SWAP`.',
      'Understand selective bit masking, bit setting, bit toggling, and inversion operations.',
      'Execute bit-addressable memory Boolean logic using the Boolean Processor and Carry Flag.',
      'Perform nibble swap operations for BCD unpacking and ASCII conversion.'
    ],
    outcomes: [
      'Competence in bit masking and packing techniques for embedded peripheral control registers.',
      'Proficiency in bit-addressable Boolean logic on 8051 RAM addresses 20H-2FH and SFR bit spaces.',
      'Ability to implement cryptographic hashing and CRC checksum routines in 8051 firmware.'
    ],
    components: [
      { name: '8051 Microcontroller System', spec: '8051 / 89C51 Core with Boolean Processing Engine', purpose: 'Executes byte and bit logic instructions' },
      { name: 'Keil µVision Debugger', spec: 'v5.38 Logic Analyzer and Memory Inspector', purpose: 'Inspects bit-addressable RAM and SFR registers' },
      { name: 'Bit-Addressable RAM (20H-2FH)', spec: '16 Bytes containing 128 individually addressable bits (00H-7FH)', purpose: 'Demonstrates bit-level Boolean logic instructions' }
    ],
    procedureSteps: [
      'Create a new Keil project `EXP9C_LOGIC.A51` targeting standard 8051 device.',
      'Load test operand A5H (1010 0101B) into RAM 30H and Accumulator A.',
      'Execute `ANL A, #0FH` to mask upper 4 bits; verify A = 05H; save result in RAM 40H.',
      'Reload A = A5H; execute `ORL A, #0F0H` to force upper 4 bits HIGH; verify A = F5H; save in RAM 41H.',
      'Reload A = A5H; execute `XRL A, #0FFH` to toggle all bits; verify A = 5AH; save in RAM 42H.',
      'Reload A = A5H; execute `CPL A` (1\'s complement); verify A = 5AH; save in RAM 43H.',
      'Reload A = A5H; execute `SWAP A` to exchange nibbles; verify A = 5AH; save in RAM 44H.',
      'Demonstrate bit-addressable Boolean logic using `SETB 20H.0` and `ORL C, 20H.0`; verify CY = 1 in PSW.'
    ],
    theoryText: 'The 8051 features an extensive suite of bitwise logical instructions and a unique hardware Boolean Processor. Byte-level logical instructions operate on the Accumulator: `ANL A, src` performs bitwise AND (used for masking unwanted bits to 0), `ORL A, src` performs bitwise OR (used for setting selected bits to 1), `XRL A, src` performs bitwise XOR (used for toggling bits or testing equality), and `CPL A` computes the 1\'s complement by inverting every bit. The `SWAP A` instruction exchanges the low-order nibble (D3-D0) with the high-order nibble (D7-D4) in a single machine cycle without affecting any flags—ideal for packed BCD unpacking. Furthermore, the 8051 Boolean Processor allows individual bit manipulation on 128 software flags in RAM (20H-2FH, bit addresses 00H-7FH) and bit-addressable SFRs (P0-P3, PSW, TCON, SCON, IE, IP) using single-bit instructions like `SETB bit`, `CLR bit`, `CPL bit`, `ANL C, bit`, and `ORL C, bit`.',
    theoryDiagramType: 'mcu-logic',
    algorithmSteps: [
      'Load sample test byte 0A5H (1010 0101B) into RAM 30H.',
      'Perform Bitwise AND: MOV A, 30H -> ANL A, #0FH -> Store result 05H into RAM 40H.',
      'Perform Bitwise OR: MOV A, 30H -> ORL A, #0F0H -> Store result F5H into RAM 41H.',
      'Perform Bitwise XOR: MOV A, 30H -> XRL A, #0FFH -> Store result 5AH into RAM 42H.',
      'Perform 1\'s Complement: MOV A, 30H -> CPL A -> Store result 5AH into RAM 43H.',
      'Perform Nibble Swap: MOV A, 30H -> SWAP A -> Store result 5AH into RAM 44H.',
      'Perform Rotations: RL A (Rotate Left) -> RAM 45H; RR A (Rotate Right) -> RAM 46H.',
      'Perform Bit Boolean Logic: SETB 20H.0 -> CLR C -> ORL C, 20H.0 -> Store PSW in RAM 47H.',
      'Halt CPU in endless loop (SJMP $).'
    ],
    flowchartSteps: [
      { type: 'start', label: 'START (Initialize Logic Test Byte A5H)' },
      { type: 'process', label: 'ANL A, #0FH: Mask Upper Nibble -> A = 05H (RAM 40H)' },
      { type: 'process', label: 'ORL A, #0F0H: Set Upper Nibble -> A = F5H (RAM 41H)' },
      { type: 'process', label: 'XRL A, #0FFH: Toggle All Bits -> A = 5AH (RAM 42H)' },
      { type: 'process', label: 'CPL A: 1\'s Complement Invert -> A = 5AH (RAM 43H)' },
      { type: 'process', label: 'SWAP A: Exchange Nibbles D7-D4 <-> D3-D0 -> A = 5AH (RAM 44H)' },
      { type: 'process', label: 'Boolean Logic: SETB 20H.0 -> ORL C, 20H.0 -> CY = 1' },
      { type: 'stop', label: 'STOP (SJMP $ Endless Halt)' }
    ],
    expectedOutput: {
      desc: 'Test Byte = A5H. ANL with 0FH = 05H, ORL with F0H = F5H, XRL with FFH = 5AH, CPL = 5AH, SWAP = 5AH',
      inputs: [
        { name: 'Source Test Byte (RAM 30H)', val: '30H = A5H (1010 0101B)' },
        { name: 'Mask Operands', val: 'AND Mask = 0FH, OR Mask = F0H, XOR Mask = FFH' }
      ],
      outputs: [
        { name: 'RAM 40H (ANL Result)', val: '05H (0000 0101B - Upper nibble cleared)' },
        { name: 'RAM 41H (ORL Result)', val: 'F5H (1111 0101B - Upper nibble set)' },
        { name: 'RAM 42H (XRL Result)', val: '5AH (0101 1010B - All bits inverted)' },
        { name: 'RAM 43H (CPL Result)', val: '5AH (0101 1010B - 1\'s Complement)' },
        { name: 'RAM 44H (SWAP Result)', val: '5AH (0101 1010B - Nibbles exchanged)' },
        { name: 'RAM 45H..46H (RL & RR)', val: 'RL = 4BH (0100 1011B), RR = D2H (1101 0010B)' }
      ],
      registers: 'A=5AH PSW=81H(CY=1,P=1) SP=07H',
      terminalDump: '8051 Internal RAM Dump [40H..46H]: 05 F5 5A 5A 5A 4B D2'
    },
    manualCalculations: {
      title: 'Bitwise Logic Manual Verification',
      steps: [
        { step: 'ANL A, #0FH', detail: '1010 0101B (A5H) AND 0000 1111B (0FH) = 0000 0101B = 05H' },
        { step: 'ORL A, #0F0H', detail: '1010 0101B (A5H) OR 1111 0000B (F0H) = 1111 0101B = F5H' },
        { step: 'XRL A, #0FFH', detail: '1010 0101B (A5H) XOR 1111 1111B (FFH) = 0101 1010B = 5AH' },
        { step: 'SWAP A', detail: 'Upper nibble A (1010) and lower nibble 5 (0101) swap places -> 5A (0101 1010B) = 5AH' }
      ]
    },
    resultText: 'All 8051 bitwise logical (ANL, ORL, XRL), unary complement (CPL), nibble swap (SWAP), rotate (RL, RR), and Boolean bit operations were successfully executed and verified in RAM.',
    precautions: [
      'Logical instructions do NOT modify the Carry, Auxiliary Carry, or Overflow flags (except Parity flag P in PSW, which reflects parity of A).',
      '`SWAP A` operates solely on the Accumulator; it cannot be applied directly to registers (R0-R7) or direct RAM locations.',
      'Remember that bit address `00H` corresponds to bit 0 of RAM byte `20H`, NOT RAM byte `00H`.'
    ],
    studentTask: {
      title: 'Packed BCD to ASCII Unpacker',
      desc: 'Write a subroutine that unpacks a 2-digit BCD byte from RAM 30H (e.g., 59H) into two ASCII bytes at RAM 40H (\'5\' = 35H) and 41H (\'9\' = 39H).',
      hint: 'Use `ANL A, #0FH` combined with `ORL A, #30H` for lower digit, and `SWAP A` + `ANL A, #0FH` + `ORL A, #30H` for upper digit.'
    },
    applications: [
      { title: 'Serial Port Baud Rate Masking', desc: 'Configures SCON/PCON SFR mode bits without corrupting interrupt enables.', icon: 'cpu' },
      { title: 'Keypad Matrix Row/Column Scanning', desc: 'Masks and decodes 4x4 matrix key switch closures.', icon: 'grid' }
    ]
  },
  exp_8051_regbanks: {
    number: '9D',
    title: '8051 Register Banks Programming – Bank 0, 1, 2, 3 Selection & RAM Mapping',
    aim: 'Write an ALP to 8051 Microcontroller to select and manipulate all 4 Register Banks (Bank 0: 00H-07H, Bank 1: 08H-0FH, Bank 2: 10H-17H, Bank 3: 18H-1FH) using Program Status Word (PSW) bits RS0 (PSW.3) and RS1 (PSW.4), and verify direct vs indirect RAM access.',
    category: 'Microcontroller Architecture & Memory Organization',
    bloomLevel: 'Understand & Analyze (L2/L4)',
    labSessionTime: '3 Hours',
    objectives: [
      'Understand the physical memory architecture of 8051 Internal RAM (locations 00H through 1FH).',
      'Master Register Bank switching using Program Status Word bits RS1 (PSW.4) and RS0 (PSW.3).',
      'Demonstrate independent data retention across Bank 0, Bank 1, Bank 2, and Bank 3.',
      'Differentiate between register addressing (`MOV R0, #data`) and direct RAM addressing (`MOV 00H, #data`).',
      'Analyze context switching speed advantages for high-performance Interrupt Service Routines (ISRs).'
    ],
    outcomes: [
      'Ability to structure 8051 RAM space efficiently across main routines and interrupt handlers.',
      'Mastery over PSW bit manipulation and atomic register bank selection.',
      'Design of zero-overhead context switching embedded firmware.'
    ],
    components: [
      { name: '8051 Microcontroller Trainer / Core', spec: 'Intel 8051 / NXP 89V51RD2 with 32 Working Registers', purpose: 'Hardware executing register bank switching' },
      { name: 'Keil µVision Simulator', spec: 'Register Bank Visualizer and Memory Inspector', purpose: 'Simulates RAM 00H-1FH and SFR PSW' },
      { name: 'Internal Working Register Space', spec: '32 Bytes mapped to RAM 00H-1FH organized as 4 banks of R0-R7', purpose: 'Stores task register contexts' }
    ],
    procedureSteps: [
      'Launch Keil µVision IDE and create an 8051 assembly project `EXP9D_REGBANKS.A51`.',
      'Initialize Bank 0 (default upon reset: RS1=0, RS0=0) and load values 10H..17H into R0..R7.',
      'Switch to Bank 1 by executing `SETB PSW.3` (RS0 = 1); load values 20H..27H into R0..R7.',
      'Switch to Bank 2 by executing `CLR PSW.3; SETB PSW.4` (RS1 = 1, RS0 = 0); load values 30H..37H into R0..R7.',
      'Switch to Bank 3 by executing `SETB PSW.3` (RS1 = 1, RS0 = 1); load values 40H..47H into R0..R7.',
      'Verify in the Keil Memory Window (`D:0x00`) that RAM addresses 00H-07H hold 10H..17H, 08H-0FH hold 20H..27H, 10H-17H hold 30H..37H, and 18H-1FH hold 40H..47H.',
      'Demonstrate direct RAM addressing by reading `MOV A, 00H` and `MOV A, 08H` while operating in Bank 3.',
      'Observe that changing the active bank changes the physical RAM location accessed by symbolic register names `R0-R7`.'
    ],
    theoryText: 'The Intel 8051 internal RAM comprises 128 bytes (00H to 7FH). The lowest 32 bytes (00H to 1FH) are arranged into 4 distinct Register Banks (Bank 0, Bank 1, Bank 2, Bank 3), each containing 8 working registers named R0 through R7. At any given moment, the active register bank is selected by two bits in the Program Status Word (PSW, SFR address D0H): RS1 (PSW.4) and RS0 (PSW.3). The bank selection decoding table is:\n- Bank 0: RS1 = 0, RS0 = 0 (RAM addresses 00H - 07H) [Default upon Reset]\n- Bank 1: RS1 = 0, RS0 = 1 (RAM addresses 08H - 0FH)\n- Bank 2: RS1 = 1, RS0 = 0 (RAM addresses 10H - 17H)\n- Bank 3: RS1 = 1, RS0 = 1 (RAM addresses 18H - 1FH)\nWhen an instruction like `MOV R0, #55H` is executed, the CPU writes to physical RAM address 00H if Bank 0 is active, 08H if Bank 1 is active, 10H if Bank 2 is active, and 18H if Bank 3 is active. This architectural feature allows instantaneous, zero-overhead task context switching for time-critical Interrupt Service Routines (ISRs)—an ISR can simply execute `SETB RS0` to switch to Bank 1, perform its operations using R0-R7 without corrupting the main program\'s Bank 0 registers, and return without tedious PUSH and POP stack cycles.',
    theoryDiagramType: 'mcu-regbanks',
    algorithmSteps: [
      'Initialize Program: Set PSW = 00H to select Register Bank 0 (RS1=0, RS0=0).',
      'Populate Bank 0: Load R0=10H, R1=11H, R2=12H, R3=13H, R4=14H, R5=15H, R6=16H, R7=17H (RAM 00H-07H).',
      'Switch to Bank 1: Execute `SETB PSW.3` (RS1=0, RS0=1).',
      'Populate Bank 1: Load R0=20H, R1=21H, R2=22H, R3=23H, R4=24H, R5=25H, R6=26H, R7=27H (RAM 08H-0FH).',
      'Switch to Bank 2: Execute `CLR PSW.3; SETB PSW.4` (RS1=1, RS0=0).',
      'Populate Bank 2: Load R0=30H, R1=31H, R2=32H, R3=33H, R4=34H, R5=35H, R6=36H, R7=37H (RAM 10H-17H).',
      'Switch to Bank 3: Execute `SETB PSW.3` (RS1=1, RS0=1).',
      'Populate Bank 3: Load R0=40H, R1=41H, R2=42H, R3=43H, R4=44H, R5=45H, R6=46H, R7=47H (RAM 18H-1FH).',
      'Cross-Bank Verification: Execute direct RAM reads (MOV A, 00H; MOV A, 08H; MOV A, 10H; MOV A, 18H) and store into RAM 40H-43H.',
      'Halt CPU via SJMP $.'
    ],
    flowchartSteps: [
      { type: 'start', label: 'START (Select Bank 0: PSW = 00H)' },
      { type: 'process', label: 'Populate Bank 0 (RAM 00H-07H): R0=10H ... R7=17H' },
      { type: 'process', label: 'Switch to Bank 1 (SETB PSW.3): R0=20H ... R7=27H (RAM 08H-0FH)' },
      { type: 'process', label: 'Switch to Bank 2 (CLR PSW.3; SETB PSW.4): R0=30H ... R7=37H (RAM 10H-17H)' },
      { type: 'process', label: 'Switch to Bank 3 (SETB PSW.3): R0=40H ... R7=47H (RAM 18H-1FH)' },
      { type: 'process', label: 'Cross-Bank Direct Read: [40H]=RAM[00H], [41H]=RAM[08H], [42H]=RAM[10H], [43H]=RAM[18H]' },
      { type: 'stop', label: 'STOP (SJMP $ Endless Loop)' }
    ],
    expectedOutput: {
      desc: 'RAM 00H-07H (Bank 0): 10-17H; RAM 08H-0FH (Bank 1): 20-27H; RAM 10H-17H (Bank 2): 30-37H; RAM 18H-1FH (Bank 3): 40-47H',
      inputs: [
        { name: 'Register Bank Selection Bits (PSW)', val: 'Bank 0: RS1=0,RS0=0 | Bank 1: RS1=0,RS0=1 | Bank 2: RS1=1,RS0=0 | Bank 3: RS1=1,RS0=1' }
      ],
      outputs: [
        { name: 'RAM 00H..07H (Bank 0 Content)', val: '10 11 12 13 14 15 16 17' },
        { name: 'RAM 08H..0FH (Bank 1 Content)', val: '20 21 22 23 24 25 26 27' },
        { name: 'RAM 10H..17H (Bank 2 Content)', val: '30 31 32 33 34 35 36 37' },
        { name: 'RAM 18H..1FH (Bank 3 Content)', val: '40 41 42 43 44 45 46 47' },
        { name: 'RAM 40H..43H (Direct Read Check)', val: '40H=10H, 41H=20H, 42H=30H, 43H=40H' }
      ],
      registers: 'A=40H PSW=18H(RS1=1,RS0=1 -> Bank 3) SP=07H',
      terminalDump: '8051 RAM Map [00H..1FH]: 10 11 12 13 14 15 16 17 | 20 21 22 23 24 25 26 27 | 30 31 32 33 34 35 36 37 | 40 41 42 43 44 45 46 47'
    },
    manualCalculations: {
      title: '8051 Register Bank RAM Address Mapping Verification',
      steps: [
        { step: 'Bank 0 Mapping', detail: 'PSW=00H (RS1=0, RS0=0) -> Registers R0..R7 reside at physical RAM addresses 00H through 07H.' },
        { step: 'Bank 1 Mapping', detail: 'PSW=08H (RS1=0, RS0=1) -> Registers R0..R7 reside at physical RAM addresses 08H through 0FH.' },
        { step: 'Bank 2 Mapping', detail: 'PSW=10H (RS1=1, RS0=0) -> Registers R0..R7 reside at physical RAM addresses 10H through 17H.' },
        { step: 'Bank 3 Mapping', detail: 'PSW=18H (RS1=1, RS0=1) -> Registers R0..R7 reside at physical RAM addresses 18H through 1FH.' }
      ]
    },
    resultText: 'All 4 8051 register banks were programmed and verified independently; direct and register-indirect memory addressing behaviors were confirmed.',
    precautions: [
      'Stack Pointer (SP) initializes to 07H upon reset, meaning the first PUSH will store data at RAM address 08H (Bank 1 R0). If using Bank 1, reinitialize SP to a higher address (e.g., `MOV SP, #30H`).',
      'When modifying PSW bits individually (`SETB PSW.3`), ensure other status flags (CY, AC, OV) are preserved if their states are needed.',
      'Indirect addressing registers `@R0` and `@R1` always point relative to the currently active register bank.'
    ],
    studentTask: {
      title: 'Zero-Overhead ISR Context Switcher',
      desc: 'Write an external interrupt ISR (INT0 at 0003H) that switches to Register Bank 2, processes sensor pulse counts in R0-R3, and restores Bank 0 before returning with RETI.',
      hint: 'Save PSW using `PUSH PSW`, select Bank 2 (`MOV PSW, #10H`), perform operations, then execute `POP PSW` and `RETI`.'
    },
    applications: [
      { title: 'Real-Time Operating System (RTOS) Task Schedulers', desc: 'Allocates dedicated register banks to highest priority realtime threads.', icon: 'layers' },
      { title: 'High-Frequency Timer Interrupt Handlers', desc: 'Eliminates 16-cycle stack register pushing/popping overhead.', icon: 'clock' }
    ]
  },
  exp_8051_timer0_m1: {
    number: '10A',
    title: '8051 Timer 0 in Mode 1 (16-bit Timer) – 25 ms Delay & Blink Port P0 Pins',
    aim: 'Write an Assembly Language Program to 8051 Microcontroller to create a delay of 25msec using Timer0 in mode 1 and blink all the Pins of P0.',
    category: 'Microcontroller Timers & Port Interfacing',
    bloomLevel: 'Applying & Evaluating (Level 3-5)',
    labSessionTime: '2 Hours (Hardware & Simulation)',
    objectives: [
      'Master the configuration of 8051 TMOD SFR for Timer 0 in Mode 1 (16-bit Timer Mode).',
      'Calculate precise initial preload values for TH0 and TL0 at 12 MHz crystal frequency.',
      'Implement polling-based delay generation using TCON overflow flag TF0.',
      'Interface and toggle 8-bit digital output pins of Port P0 at exact 25 ms intervals.'
    ],
    outcomes: [
      'Ability to design hardware-accurate time delays without CPU cycle-burning software loops.',
      'Proficiency in configuring 8051 timer modes and bit-level SFR manipulation.'
    ],
    components: [
      { name: '8051 Microcontroller Trainer', spec: 'Intel 8051 / NXP 89V51RD2 with 12.0 MHz Crystal', purpose: 'Hardware executing 16-bit timer delay' },
      { name: 'Keil µVision Logic Analyzer', spec: 'Logic Waveform Analyzer & Peripherals Viewer', purpose: 'Measures 25 ms square wave frequency and pulse width' },
      { name: 'Port P0 LED Interface', spec: '8 Active-Low LEDs connected to Port P0 with 1kΩ Pull-up Resistors', purpose: 'Visual blinking display at 20 Hz (25 ms ON / 25 ms OFF)' }
    ],
    procedureSteps: [
      'Open Keil µVision IDE, create new project `EXP10A_TIMER0_M1.A51` and target 8051 microcontroller.',
      'Configure TMOD SFR: Set `TMOD = 01H` (Timer 0 in Mode 1: 16-bit Timer, GATE=0, C/T=0).',
      'Calculate Initial Count: With 12 MHz crystal, 1 machine cycle = 1 µs. For 25 ms (25,000 µs), required count N = 25,000. Preload = 65,536 - 25,000 = 40,536 = 9E58H. Load `TH0 = 9EH` and `TL0 = 58H`.',
      'Initialize Port P0 by writing `00H` (All LEDs turned ON).',
      'Call `DELAY_25MS` subroutine: Load TH0/TL0, set `TR0 = 1` (Start Timer 0), and poll `TF0` in a loop `JNB TF0, $`.',
      'When TF0 becomes 1 (25 ms elapsed), stop Timer 0 (`CLR TR0`), clear flag (`CLR TF0`), and return.',
      'Invert Port 0 pins using `CPL P0` and repeat continuously (`SJMP AGAIN`).',
      'Verify waveform in Keil Logic Analyzer: Observe P0.0 toggling every 25.000 ms (Frequency = 20 Hz, Period = 50 ms).'
    ],
    theoryText: 'The 8051 microcontroller contains two independent 16-bit timer/counter units (Timer 0 and Timer 1). Each timer consists of two 8-bit SFRs: Timer 0 uses TL0 (SFR 8AH) and TH0 (SFR 8CH). In Mode 1 (16-bit Timer Mode), the two 8-bit registers cascade to form a full 16-bit up-counter capable of counting from 0000H to FFFFH (0 to 65,535).\n\nTimer operation is governed by two key Special Function Registers:\n1. TMOD (Timer Mode SFR, Address 89H): Not bit-addressable. Lower nibble controls Timer 0: [GATE, C/T, M1, M0]. Setting TMOD = 01H sets GATE=0 (internal software run control), C/T=0 (Timer mode clocked by f_osc/12), M1=0, M0=1 (Mode 1: 16-bit Timer).\n2. TCON (Timer Control SFR, Address 88H): Bit-addressable. TR0 (TCON.4) starts (TR0=1) and stops (TR0=0) Timer 0. TF0 (TCON.5) is the Timer 0 Overflow Flag, set by hardware when the count rolls over from FFFFH to 0000H.\n\nTiming Calculation Derivation (at 12.0 MHz):\n- Machine Cycle Period: T_mc = 12 / f_osc = 12 / 12.000.000 Hz = 1.000 µs.\n- Number of Clock Pulses for 25 ms: N = 25,000 µs / 1.0 µs = 25,000 counts.\n- 16-bit Preload Value: Count = 65,536 - 25,000 = 40,536 = 9E58H.\n- High Byte: TH0 = 9EH (158D), Low Byte: TL0 = 58H (88D).\nWhen started, Timer 0 increments from 9E58H up to FFFFH (taking exactly 25,000 µs), rolls over to 0000H, and asserts TF0 = 1 to signal 25 ms completion.',
    theoryDiagramType: 'mcu-timer-m1',
    algorithmSteps: [
      'START: Set TMOD = 01H to configure Timer 0 in Mode 1 (16-bit Timer, Internal Clock).',
      'Initialize Port P0 = 00H (Active-Low LEDs ON).',
      'MAIN_LOOP: Invert Port P0 pins (CPL P0) to toggle output state.',
      'Preload Timer 0: Load TH0 = 9EH and TL0 = 58H (40,536D for 25 ms delay).',
      'Start Timer 0: Set TR0 = 1 (TCON.4).',
      'Wait for Overflow: Poll TF0 flag (TCON.5) until TF0 = 1.',
      'Stop Timer 0: Clear TR0 = 0.',
      'Clear Overflow Flag: Clear TF0 = 0 in software.',
      'Repeat: Jump to MAIN_LOOP (SJMP AGAIN).'
    ],
    flowchartSteps: [
      { type: 'start', label: 'START (Initialize TMOD = 01H: Timer 0 Mode 1)' },
      { type: 'process', label: 'Toggle Port P0 (CPL P0): Invert all LED pins' },
      { type: 'process', label: 'Preload Timer 0: TH0 = 9EH, TL0 = 58H (25 ms initial count)' },
      { type: 'process', label: 'Start Timer 0: SETB TR0' },
      { type: 'decision', label: 'Is TF0 == 1? (Has 25 ms elapsed?)' },
      { type: 'process', label: 'Stop Timer (CLR TR0) & Clear Flag (CLR TF0)' },
      { type: 'stop', label: 'Loop back to Toggle Port P0 (SJMP AGAIN)' }
    ],
    expectedOutput: {
      desc: 'Port P0 toggles between 00H (All LEDs ON) and FFH (All LEDs OFF) at an exact 25.0 ms interval (20 Hz square wave, Period = 50 ms).',
      inputs: [
        { name: 'Crystal Oscillator Frequency (Fosc)', val: '12.000 MHz (Machine Cycle = 1.000 µs)' },
        { name: 'Timer 0 Mode Configuration (TMOD)', val: '01H (Timer 0, Mode 1: 16-bit Timer)' },
        { name: 'Preload Count (TH0:TL0)', val: '9E58H (TH0 = 9EH, TL0 = 58H -> 40,536D)' }
      ],
      outputs: [
        { name: 'Port P0 Initial State', val: '00H (All Pins 0V / LEDs ON)' },
        { name: 'Port P0 State after 25 ms', val: 'FFH (All Pins 5V / LEDs OFF)' },
        { name: 'Port P0 State after 50 ms', val: '00H (All Pins 0V / LEDs ON)' },
        { name: 'Measured Square Wave Period', val: '50.000 ms (25 ms High + 25 ms Low)' },
        { name: 'Output Blink Frequency', val: '20.00 Hz (f = 1 / 50 ms)' }
      ],
      registers: 'TMOD=01H TH0=9EH TL0=58H TCON=00H(TR0=0,TF0=0) P0=00H/FFH',
      terminalDump: '8051 Timer 0 Mode 1 Logic Trace: [TMOD=01H] Preload=9E58H | TR0=1 -> Count=25,000 µs -> TF0=1 -> P0=CPL(P0) -> Period=50.0 ms (20 Hz)'
    },
    manualCalculations: {
      title: '8051 Timer 0 Mode 1 (16-bit) 25 ms Delay Mathematical Derivation',
      steps: [
        { step: '1. Machine Cycle Calculation', detail: 'T_mc = 12 / F_osc = 12 / 12,000,000 Hz = 1.000 µs per count.' },
        { step: '2. Count Requirement for 25 ms', detail: 'Counts N = Delay / T_mc = 25,000 µs / 1.000 µs = 25,000 counts.' },
        { step: '3. 16-bit Preload Value', detail: 'Preload = 2^16 - N = 65,536 - 25,000 = 40,536D = 9E58H.' },
        { step: '4. Register Splitting', detail: 'TH0 = 9EH (Upper 8 bits: 158D), TL0 = 58H (Lower 8 bits: 88D).' },
        { step: '5. Verification of Elapsed Time', detail: '(65,536 - 40,536) × 1.000 µs = 25,000 µs = 25.000 ms.' }
      ]
    },
    resultText: 'Timer 0 in Mode 1 generated a precise 25 msec delay; all pins of Port P0 toggled synchronously with a verified 20 Hz square wave frequency.',
    precautions: [
      'Port P0 is an open-drain bidirectional port on 8051. When interfacing external LEDs, 10 kΩ pull-up resistor networks (or active-low pull-down LEDs) must be connected.',
      'In polling mode (non-interrupt), TF0 must be manually cleared via `CLR TF0` after each overflow.',
      'Always stop the timer (`CLR TR0`) before reloading TH0 and TL0 to prevent asynchronous counting during register write.'
    ],
    studentTask: {
      title: 'Frequency-Adjustable Square Wave Generator',
      desc: 'Modify the Timer 0 Mode 1 program to generate a 1 kHz audio square wave (500 µs High, 500 µs Low) on Pin P0.7 with TH0:TL0 preload values calculated for 11.0592 MHz crystal.',
      hint: 'For 11.0592 MHz, T_mc = 1.085069 µs. Preload for 500 µs = 65,536 - (500 / 1.085069) = 65,536 - 461 = 65,075 = FE33H (TH0 = 0FEH, TL0 = 33H).'
    },
    applications: [
      { title: 'Precision LED Strobe / Beacon Timing', desc: 'Drives emergency warning lights and strobe blinkers at regulated industrial frequencies.', icon: 'activity' },
      { title: 'Embedded System Heartbeat Indicator', desc: 'Provides periodic visual confirmation that microcontroller OS threads are executing normally.', icon: 'cpu' }
    ]
  },
  exp_8051_timer1_m0: {
    number: '10B',
    title: '8051 Timer 1 in Mode 0 (13-bit Timer) – 50 µs Delay & Blink Port P2 Pins',
    aim: 'Write an Assembly Language Program to 8051 Microcontroller to create a delay of 50 µsec using Timer1 in mode 0 and blink all the Pins of P2.',
    category: 'Microcontroller Timers & Port Interfacing',
    bloomLevel: 'Applying & Analyzing (Level 3-4)',
    labSessionTime: '2 Hours (Hardware & Simulation)',
    objectives: [
      'Understand the legacy 13-bit Timer architecture (Mode 0) in 8051.',
      'Map 13-bit preload counts into TH1 (8 bits) and TL1 (lower 5 bits D0-D4).',
      'Generate high-frequency 50 µs timing delays using Timer 1 in Mode 0.',
      'Drive Port P2 pins to create a 10 kHz high-frequency square wave signal.'
    ],
    outcomes: [
      'Mastery over 8051 Mode 0 (13-bit) register packing and bit-masking mechanics.',
      'Ability to produce microsecond-level hardware delay intervals.'
    ],
    components: [
      { name: '8051 Microcontroller Core', spec: 'Standard 8051 with 12 MHz Clock System', purpose: 'Hardware executing 13-bit Timer 1' },
      { name: 'Digital Storage Oscilloscope (DSO)', spec: '100 MHz DSO / Logic Analyzer', purpose: 'Measures 50 µs pulse width and 10 kHz waveform' },
      { name: 'Port P2 Logic Output Pins', spec: 'Pins P2.0 through P2.7 (Internal Pull-Up SFR A0H)', purpose: 'Emits 50 µs complementary output pulses' }
    ],
    procedureSteps: [
      'Launch Keil µVision IDE and create assembly project `EXP10B_TIMER1_M0.A51`.',
      'Configure TMOD SFR: Set `TMOD = 00H` (Timer 1 in Mode 0: 13-bit Timer mode, GATE=0, C/T=0, M1=0, M0=0).',
      'Calculate 13-bit Preload Count: Max count = 2^13 = 8,192. At 12 MHz (1 cycle = 1 µs), 50 µs delay requires 50 counts. Preload = 8,192 - 50 = 8,142 = 1FCEH (11111 1100 1110B).',
      'Split 13-bit Preload: Upper 8 bits -> `TH1 = 1111 1110B = 0FEH`; Lower 5 bits -> `TL1 = 0000 1110B = 0EH`.',
      'Invert Port P2 pins via `CPL P2`.',
      'Call `DELAY_50US` subroutine: Load TH1 = 0FEH, TL1 = 0EH, start Timer 1 (`SETB TR1`), and poll `TF1` (`JNB TF1, $`).',
      'Upon overflow (TF1 = 1), stop Timer 1 (`CLR TR1`), clear flag (`CLR TF1`), and return with `RET`.',
      'Verify on DSO / Keil Logic Analyzer: Measure High time = 50.0 µs, Low time = 50.0 µs, Period = 100.0 µs, Frequency = 10.00 kHz.'
    ],
    theoryText: 'Mode 0 of the 8051 Timer/Counter is a legacy operating mode retained for software compatibility with the older Intel 8048 microcontroller family. In Mode 0, the timer operates as a 13-bit counter with a maximum counting capacity of 2^13 = 8,192 counts (0000H to 1FFFH).\n\nThe 13-bit timer register is physically constructed using:\n- All 8 bits of THx (TH1 bits D7 through D0, serving as the upper 8 bits).\n- The lower 5 bits of TLx (TL1 bits D4 through D0, serving as a 5-bit prescaler/modulo-32 counter).\n- Bits D7, D6, and D5 of TLx are completely unused in Mode 0 and should be written as zeros.\n\nTimer 1 Mode 0 Configuration in TMOD (Address 89H):\n- Upper nibble of TMOD controls Timer 1: [GATE=0, C/T=0, M1=0, M0=0] -> TMOD = 00H.\n- Controlled via TCON (Address 88H): TR1 (TCON.6) starts/stops Timer 1; TF1 (TCON.7) is set upon 13-bit overflow.\n\nTiming Calculation (at 12.0 MHz):\n- Machine Cycle: T_mc = 1 µs.\n- Delay: T = 50 µs -> Counts N = 50 / 1 = 50 counts.\n- 13-bit Initial Preload: Count = 8,192 - 50 = 8,142D = 1FCEH (13-bit binary: 1 1111 1100 1110B).\n- Upper 8 bits (TH1): 1111 1110B = 0FEH (254D).\n- Lower 5 bits (TL1): 0 1110B = 0EH (14D).\nWhen TR1 is set, Timer 1 counts from 1FCEH to 1FFFH in exactly 50 machine cycles (50 µs), rolls over to 0000H, and sets TF1 = 1.',
    theoryDiagramType: 'mcu-timer-m0',
    algorithmSteps: [
      'START: Configure Timer 1 in Mode 0 by setting TMOD = 00H.',
      'Initialize Port P2 = 00H.',
      'MAIN_LOOP: Invert Port P2 pins (CPL P2).',
      'Preload Timer 1: Load TH1 = 0FEH (upper 8 bits) and TL1 = 0EH (lower 5 bits) for 50 µs delay.',
      'Start Timer 1: SETB TR1 (TCON.6).',
      'Wait for 13-bit Overflow: Poll TF1 (TCON.7) until TF1 = 1.',
      'Stop Timer 1: CLR TR1.',
      'Clear Overflow Flag: CLR TF1.',
      'Repeat: Jump to MAIN_LOOP (SJMP AGAIN).'
    ],
    flowchartSteps: [
      { type: 'start', label: 'START (Initialize TMOD = 00H: Timer 1 Mode 0)' },
      { type: 'process', label: 'Toggle Port P2 (CPL P2): Invert Port 2 pins' },
      { type: 'process', label: 'Preload 13-bit Count: TH1 = 0FEH, TL1 = 0EH (50 µs)' },
      { type: 'process', label: 'Start Timer 1: SETB TR1' },
      { type: 'decision', label: 'Is TF1 == 1? (Has 50 µs elapsed?)' },
      { type: 'process', label: 'Stop Timer (CLR TR1) & Clear Flag (CLR TF1)' },
      { type: 'stop', label: 'Loop back to Toggle Port P2 (SJMP AGAIN)' }
    ],
    expectedOutput: {
      desc: 'All pins of Port P2 toggle synchronously every 50.0 µs, producing a high-frequency 10.00 kHz square wave (Period = 100.0 µs, 50% Duty Cycle).',
      inputs: [
        { name: 'Crystal Frequency (Fosc)', val: '12.000 MHz (Machine Cycle = 1.000 µs)' },
        { name: 'Timer 1 Mode (TMOD)', val: '00H (Timer 1, Mode 0: 13-bit Timer Mode)' },
        { name: '13-bit Preload (TH1:TL1)', val: '1FCEH -> TH1 = 0FEH, TL1 = 0EH (8,142D)' }
      ],
      outputs: [
        { name: 'Port P2 High Pulse Duration', val: '50.000 µs' },
        { name: 'Port P2 Low Pulse Duration', val: '50.000 µs' },
        { name: 'Output Signal Period', val: '100.000 µs (50 µs + 50 µs)' },
        { name: 'Output Signal Frequency', val: '10.000 kHz (f = 1 / 100 µs)' },
        { name: 'Duty Cycle', val: '50.0% (Symmetric Square Wave)' }
      ],
      registers: 'TMOD=00H TH1=0FEH TL1=0EH TCON=00H(TR1=0,TF1=0) P2=00H/FFH',
      terminalDump: '8051 Timer 1 Mode 0 Logic Trace: [TMOD=00H] Preload=1FCEH (TH1=FEH, TL1=0EH) -> Count=50 µs -> TF1=1 -> P2 Output Toggled -> 10.0 kHz Waveform'
    },
    manualCalculations: {
      title: '8051 Timer 1 Mode 0 (13-bit) 50 µs Delay Mathematical Derivation',
      steps: [
        { step: '1. Machine Cycle Period', detail: 'T_mc = 12 / 12,000,000 Hz = 1.000 µs per count.' },
        { step: '2. Required Clock Cycles', detail: 'Counts N = 50 µs / 1.000 µs = 50 counts.' },
        { step: '3. 13-bit Preload Calculation', detail: 'Preload = 2^13 - N = 8,192 - 50 = 8,142D = 1FCEH (11111 1100 1110B in 13-bit format).' },
        { step: '4. Register Bit Allocation', detail: 'TH1 = Upper 8 bits (1111 1110B = 0FEH), TL1 = Lower 5 bits (0000 1110B = 0EH).' },
        { step: '5. Verification of Time Delay', detail: '(8,192 - 8,142) × 1.000 µs = 50 × 1.000 µs = 50.000 µs.' }
      ]
    },
    resultText: 'Timer 1 in Mode 0 successfully produced a 50 µsec delay; Port P2 pins blinked at an exact 10 kHz switching frequency.',
    precautions: [
      'Ensure bits D7-D5 of TL1 are 0 when writing the preload value because Mode 0 ignores upper 3 bits during counting.',
      'Mode 0 has a maximum delay capacity of 8.192 ms at 12 MHz; for delays exceeding 8.192 ms, use Mode 1 (16-bit) or multi-cycle loops.',
      'Timer 1 and Timer 0 share the TMOD register; when writing TMOD, avoid corrupting the lower nibble if Timer 0 is concurrently active.'
    ],
    studentTask: {
      title: 'Ultrasonic 40 kHz Transducer Pulse Driver',
      desc: 'Calculate TH1 and TL1 for Timer 1 in Mode 0 at 12 MHz to generate a 40 kHz carrier square wave (12.5 µs High, 12.5 µs Low) on Pin P2.0.',
      hint: 'Counts for 12.5 µs = 12.5 / 1 = 12 or 13 counts. Preload = 8192 - 13 = 8179 = 1FF3H -> TH1 = 0FFH, TL1 = 13H.'
    },
    applications: [
      { title: 'High-Frequency Ultrasonic Transducer Driving', desc: 'Generates 40 kHz pulses for distance measuring sensors and sonar rangefinders.', icon: 'radio' },
      { title: 'Microsecond Baud Rate Timebase Generator', desc: 'Produces precise sample clocks for custom asynchronous serial protocols.', icon: 'zap' }
    ]
  },
  exp_8051_counter0_m2: {
    number: '10C',
    title: '8051 Counter 0 in Mode 2 (8-bit Auto-Reload) – 75 ms Delay Loop & Blink Port P1 Pins',
    aim: 'Write an Assembly Language Program to 8051 Microcontroller to create a delay of 75msec using counter0 in mode 2 and blink all the Pins of P1.',
    category: 'Microcontroller Timers & Auto-Reload Mechanics',
    bloomLevel: 'Analyzing & Evaluating (Level 4-5)',
    labSessionTime: '2 Hours (Hardware & Simulation)',
    objectives: [
      'Master 8051 Timer/Counter Mode 2 (8-bit Auto-Reload Mode) operation.',
      'Understand how hardware automatically reloads TH0 into TL0 without software delay jitter.',
      'Combine hardware auto-reload base ticks with software loop registers (R2, R3) for long 75 ms delays.',
      'Toggle all 8 pins of Port P1 to drive LED bargraph displays at 6.67 Hz (75 ms ON / 75 ms OFF).'
    ],
    outcomes: [
      'Competence in utilizing Mode 2 Auto-Reload for jitter-free periodic timing loops.',
      'Proficiency in nested register loop calculations for multi-millisecond delays.'
    ],
    components: [
      { name: '8051 Microcontroller Development Board', spec: 'AT89C51 / AT89S52 with 12.0 MHz Clock', purpose: 'Executes Mode 2 auto-reload timer loop' },
      { name: 'Keil µVision Simulator & Register Inspector', spec: 'Step Debugger & SFR Visualizer', purpose: 'Monitors automatic hardware reloading of TL0 from TH0' },
      { name: 'Port P1 LED Array', spec: '8 High-efficiency LEDs on Port P1 (Pins P1.0 - P1.7)', purpose: 'Blinks at 6.67 Hz (75 ms ON, 75 ms OFF, Period = 150 ms)' }
    ],
    procedureSteps: [
      'Open Keil µVision IDE and create assembly project `EXP10C_COUNTER0_M2.A51`.',
      'Configure TMOD SFR: Set `TMOD = 02H` (Timer 0 in Mode 2: 8-bit Auto-Reload, GATE=0, C/T=0, M1=1, M0=0).',
      'Calculate 8-bit Auto-Reload Base Tick: Maximum count = 256. For a 250 µs base tick (at 12 MHz), reload value = 256 - 250 = 6 = 06H. Preload `TH0 = 06H` and `TL0 = 06H`.',
      'Calculate Nested Loop Multiplier: Total delay = 75 ms = 75,000 µs. Total ticks = 75,000 µs / 250 µs = 300 ticks. Structure nested loops with `R2 = 2` and `R3 = 150` (2 × 150 = 300).',
      'Invert Port P1 pins using `CPL P1`.',
      'Call `DELAY_75MS` subroutine: Start Timer 0 (`SETB TR0`), loop 300 times polling `TF0`, clear `TF0` upon each overflow, and decrement R3 and R2.',
      'Stop Timer 0 (`CLR TR0`) and return with `RET`.',
      'Repeat in infinite loop (`SJMP AGAIN`) and observe 75 ms blinking on Port P1 LEDs.'
    ],
    theoryText: 'Mode 2 of the 8051 Timer/Counter is the 8-bit Auto-Reload Mode. It is widely regarded as the most reliable and jitter-free timing mode in the 8051 architecture because it completely eliminates software reload overhead.\n\nOperating Mechanism in Mode 2:\n- TL0 (SFR 8AH) acts as the active 8-bit up-counter (counting from preset value to FFH).\n- TH0 (SFR 8CH) holds the permanent reload value and is never modified during counting.\n- When TL0 reaches FFH and rolls over to 00H, two actions occur simultaneously:\n  1. Hardware sets the overflow flag TF0 = 1.\n  2. Hardware automatically copies the 8-bit value stored in TH0 into TL0.\nBecause the reload occurs in hardware during the exact clock cycle of rollover, there is zero software delay latency. The programmer only needs to clear TF0 and continue.\n\nConfiguring Mode 2 in TMOD (Address 89H):\n- Setting TMOD = 02H (0000 0010B) configures Timer 0 in Mode 2 (GATE=0, C/T=0, M1=1, M0=0).\n- (If configured as an external event Counter on pin T0/P3.4, set C/T=1 -> TMOD = 06H).\n\nDelay Calculation for 75 ms (at 12.0 MHz):\n- Machine Cycle: T_mc = 1 µs.\n- Auto-Reload Base Tick: Set to 250 µs -> Counts = 250. Reload value = 256 - 250 = 6 = 06H. TH0 = 06H.\n- Total Delay = 75 ms = 75,000 µs.\n- Number of Base Ticks: N_ticks = 75,000 µs / 250 µs = 300 overflows.\n- Nested Loop Implementation: R2 = 2, R3 = 150 (2 × 150 = 300 ticks × 250 µs = 75,000 µs = 75.0 ms).',
    theoryDiagramType: 'mcu-counter-m2',
    algorithmSteps: [
      'START: Set TMOD = 02H (Timer 0 in Mode 2: 8-bit Auto-Reload).',
      'Load Auto-Reload Value: TH0 = 06H (250 µs base tick) and TL0 = 06H.',
      'Initialize Port P1 = 00H.',
      'MAIN_LOOP: Invert Port P1 pins (CPL P1).',
      'Start Timer 0: SETB TR0.',
      'Initialize Loop Counters: R2 = 2 (Outer), R3 = 150 (Inner). Total iterations = 300.',
      'Wait for Hardware Tick: Poll TF0 until TF0 = 1 (250 µs elapsed, TL0 auto-reloaded from TH0).',
      'Clear Flag: CLR TF0.',
      'Decrement Inner Loop: DJNZ R3, Wait for Hardware Tick.',
      'Decrement Outer Loop: DJNZ R2, Reset R3=150 and continue.',
      'Stop Timer 0: CLR TR0.',
      'Repeat: Jump to MAIN_LOOP (SJMP AGAIN).'
    ],
    flowchartSteps: [
      { type: 'start', label: 'START (Set TMOD = 02H: Timer 0 Mode 2 Auto-Reload)' },
      { type: 'process', label: 'Load TH0 = 06H (250 µs reload count) & TL0 = 06H' },
      { type: 'process', label: 'Toggle Port P1 (CPL P1)' },
      { type: 'process', label: 'Start Timer 0 (SETB TR0) & Load R2=2, R3=150 (300 ticks)' },
      { type: 'decision', label: 'Is TF0 == 1? (250 µs elapsed?)' },
      { type: 'process', label: 'Clear TF0 (TL0 auto-reloaded by hardware) & DJNZ R3/R2' },
      { type: 'stop', label: 'Stop Timer 0 (CLR TR0) & Loop to Toggle P1 (SJMP AGAIN)' }
    ],
    expectedOutput: {
      desc: 'All pins of Port P1 toggle between 00H (All LEDs ON) and FFH (All LEDs OFF) every 75.0 ms (Period = 150.0 ms, Blink Frequency = 6.67 Hz).',
      inputs: [
        { name: 'Crystal Frequency (Fosc)', val: '12.000 MHz (Machine Cycle = 1.000 µs)' },
        { name: 'TMOD SFR Configuration', val: '02H (Timer 0, Mode 2: 8-bit Auto-Reload)' },
        { name: 'Auto-Reload Value (TH0)', val: '06H (256 - 250 = 6 -> 250 µs base tick)' },
        { name: 'Loop Iterations (R2 × R3)', val: '2 × 150 = 300 ticks (300 × 250 µs = 75.0 ms)' }
      ],
      outputs: [
        { name: 'Port P1 State after 0 ms', val: '00H (All Pins LOW / LEDs ON)' },
        { name: 'Port P1 State after 75 ms', val: 'FFH (All Pins HIGH / LEDs OFF)' },
        { name: 'Port P1 State after 150 ms', val: '00H (All Pins LOW / LEDs ON)' },
        { name: 'Output Signal Period', val: '150.000 ms (75 ms High + 75 ms Low)' },
        { name: 'Blink Switching Frequency', val: '6.667 Hz (f = 1 / 150 ms)' }
      ],
      registers: 'TMOD=02H TH0=06H TL0=06H R2=02H R3=96H TCON=00H P1=00H/FFH',
      terminalDump: '8051 Timer 0 Mode 2 Logic Trace: [TMOD=02H] Reload TH0=06H -> 300 Overflows (250 µs each) -> Total Delay = 75.000 ms -> Port P1 Toggled (6.67 Hz)'
    },
    manualCalculations: {
      title: '8051 Timer 0 Mode 2 (8-bit Auto-Reload) 75 ms Delay Mathematical Derivation',
      steps: [
        { step: '1. Machine Cycle Time', detail: 'T_mc = 12 / 12,000,000 Hz = 1.000 µs.' },
        { step: '2. Auto-Reload Base Period Calculation', detail: 'Base Delay T_base = 250 µs -> Counts = 250. Reload TH0 = 256 - 250 = 6 = 06H.' },
        { step: '3. Total Delay Requirement', detail: 'T_total = 75 ms = 75,000 µs.' },
        { step: '4. Loop Iterations Calculation', detail: 'Total Ticks = 75,000 µs / 250 µs = 300 ticks.' },
        { step: '5. Nested Loop Splitting', detail: 'Outer Loop R2 = 2, Inner Loop R3 = 150 (2 × 150 = 300 ticks × 250 µs = 75,000 µs = 75.0 ms).' }
      ]
    },
    resultText: 'Counter/Timer 0 in Mode 2 generated a jitter-free 75 msec delay using hardware auto-reloading; Port P1 LEDs blinked at 6.67 Hz.',
    precautions: [
      'In Mode 2, never write to TH0 during the delay loop because TH0 maintains the master reload reference value.',
      'Unlike Mode 1, software does not need to reload TL0 after overflow; TL0 is automatically repopulated from TH0.',
      'When using nested DJNZ loops, account for the 2-cycle execution time of DJNZ if microsecond calibration precision is required.'
    ],
    studentTask: {
      title: 'UART Baud Rate Generator (9600 Baud)',
      desc: 'Configure Timer 1 in Mode 2 Auto-Reload at 11.0592 MHz to generate standard 9600 Baud rate for the 8051 serial port (SCON).',
      hint: 'Formula: Baud Rate = (2^SMOD / 32) × (F_osc / (12 × (256 - TH1))). For 9600 Baud with SMOD=0: TH1 = 256 - (11.0592 MHz / (384 × 9600)) = 256 - 3 = 253 = 0FDH.'
    },
    applications: [
      { title: 'Serial Communication (UART) Baud Rate Generator', desc: 'Standard clock source for 8051 UART serial ports generating 9600, 19200, and 57600 baud.', icon: 'network' },
      { title: 'Periodic Sampling Clocks for ADC & Sensor Logs', desc: 'Supplies precise, jitter-free sampling trigger pulses to analog-to-digital converters.', icon: 'clock' }
    ]
  },
  exp_8051_counter1_m1: {
    number: '10D',
    title: '8051 Counter 1 in Mode 1 (16-bit Counter) – 80 µs Delay & Blink Port P3 Pins',
    aim: 'Write an Assembly Language Program to 8051 Microcontroller to create a delay of 80 µsec using counter1 in mode 1 and blink all the Pins of P3.',
    category: 'Microcontroller Timers & External Event Counting',
    bloomLevel: 'Applying & Analyzing (Level 3-4)',
    labSessionTime: '2 Hours (Hardware & Simulation)',
    objectives: [
      'Configure 8051 Timer 1 in Mode 1 (16-bit Mode) as an external event Counter / microsecond Timer.',
      'Calculate 16-bit preload count values for an 80 µs / 80 pulse duration.',
      'Monitor TF1 overflow flag to terminate precise event counts.',
      'Toggle Port P3 pins to generate a 6.25 kHz symmetric pulse train.'
    ],
    outcomes: [
      'Ability to configure 8051 timers in counter mode (C/T=1) and timer mode (C/T=0).',
      'Proficiency in generating microsecond-accurate waveforms on Port P3.'
    ],
    components: [
      { name: '8051 Microcontroller Trainer Board', spec: 'Intel 8051 with External Clock Input Pin T1 (P3.5)', purpose: 'Executes 16-bit Counter 1 operation' },
      { name: 'Function Generator / Clock Source', spec: 'TTL Pulse Generator connected to Pin T1 (P3.5)', purpose: 'Supplies external event pulses for counter verification' },
      { name: 'Port P3 Output Pins', spec: 'Pins P3.0 through P3.7 (SFR B0H)', purpose: 'Blinks output pins at 6.25 kHz (80 µs ON / 80 µs OFF)' }
    ],
    procedureSteps: [
      'Launch Keil µVision IDE and create assembly project `EXP10D_COUNTER1_M1.A51`.',
      'Configure TMOD SFR: Set `TMOD = 50H` for Counter 1 in Mode 1 (GATE=0, C/T=1 for external pulses on pin T1/P3.5, M1=0, M0=1) or `TMOD = 10H` for internal machine cycle timer mode.',
      'Calculate 16-bit Preload Count for 80 counts: Preload = 65,536 - 80 = 65,456 = FFB0H. Load `TH1 = 0FFH` and `TL1 = 0B0H`.',
      'Initialize Port P3 pins to 00H.',
      'Invert Port P3 pins using `CPL P3`.',
      'Call `DELAY_80US` subroutine: Load TH1 = 0FFH, TL1 = 0B0H, start Counter 1 (`SETB TR1`), and poll `TF1` (`JNB TF1, $`).',
      'Upon 80 counts/pulses, TF1 becomes 1. Stop Counter 1 (`CLR TR1`), clear flag (`CLR TF1`), and return.',
      'Repeat in infinite loop (`SJMP AGAIN`) to generate a continuous 6.25 kHz square wave on Port P3.'
    ],
    theoryText: 'The 8051 Timer/Counter hardware can operate in two distinct operational modes determined by the C/T (Counter/Timer) select bit in the TMOD register:\n1. Timer Mode (C/T = 0): The register is incremented every machine cycle (internal clock frequency f_osc / 12). At 12 MHz, the timer increments every 1.0 µs.\n2. Counter Mode (C/T = 1): The register is incremented by a 1-to-0 negative transition on the corresponding external input pin (Pin T0 / P3.4 for Timer 0, Pin T1 / P3.5 for Timer 1).\n\nCounter 1 in Mode 1 (16-bit Counter Mode):\n- TMOD Configuration: Upper nibble controls Timer 1: [GATE=0, C/T=1, M1=0, M0=1] -> TMOD = 50H (or TMOD = 10H for internal 80 µs timer mode).\n- Hardware Counter Registers: TL1 (SFR 8BH) and TH1 (SFR 8DH) cascade to form a 16-bit up-counter (0000H to FFFFH, capacity = 65,536 counts).\n- Sampling Rules: External input pin T1 is sampled once every machine cycle. A 1-to-0 transition is recognized when the pin is HIGH in one cycle and LOW in the next cycle. Consequently, it takes 2 machine cycles (2 µs at 12 MHz) to recognize a single pulse, restricting maximum external input frequency to f_osc / 24 = 500 kHz.\n\nCalculation for 80 µs / 80 External Pulses (at 12.0 MHz):\n- Desired Delay / Event Count: N = 80 counts.\n- 16-bit Initial Preload Value: Count = 65,536 - 80 = 65,456D = FFB0H.\n- High Byte: TH1 = 0FFH (255D).\n- Low Byte: TL1 = 0B0H (176D).\nWhen started with `SETB TR1`, Counter 1 increments from FFB0H to FFFFH in 80 counts (taking exactly 80 µs), rolls over to 0000H, and asserts TF1 = 1.',
    theoryDiagramType: 'mcu-counter-m1',
    algorithmSteps: [
      'START: Configure Counter 1 in Mode 1 (16-bit Mode) by setting TMOD = 50H (or 10H).',
      'Initialize Port P3 = 00H.',
      'MAIN_LOOP: Invert all pins of Port P3 (CPL P3).',
      'Preload Counter 1: Load TH1 = 0FFH and TL1 = 0B0H (65,456D for 80 counts).',
      'Start Counter 1: SETB TR1 (TCON.6).',
      'Wait for 80 Pulses / Overflows: Poll TF1 (TCON.7) until TF1 = 1.',
      'Stop Counter 1: CLR TR1.',
      'Clear Overflow Flag: CLR TF1.',
      'Repeat: Jump to MAIN_LOOP (SJMP AGAIN).'
    ],
    flowchartSteps: [
      { type: 'start', label: 'START (Initialize TMOD = 50H / 10H: Counter 1 Mode 1)' },
      { type: 'process', label: 'Toggle Port P3 (CPL P3): Invert Port 3 pins' },
      { type: 'process', label: 'Preload 16-bit Count: TH1 = 0FFH, TL1 = 0B0H (80 counts)' },
      { type: 'process', label: 'Start Counter 1: SETB TR1' },
      { type: 'decision', label: 'Is TF1 == 1? (Have 80 pulses elapsed?)' },
      { type: 'process', label: 'Stop Counter (CLR TR1) & Clear Flag (CLR TF1)' },
      { type: 'stop', label: 'Loop back to Toggle Port P3 (SJMP AGAIN)' }
    ],
    expectedOutput: {
      desc: 'All pins of Port P3 toggle synchronously every 80.0 µs, generating a continuous 6.250 kHz square wave pulse train (Period = 160.0 µs, 50% Duty Cycle).',
      inputs: [
        { name: 'Crystal Oscillator / Clock Source', val: '12.000 MHz (Machine Cycle = 1.000 µs)' },
        { name: 'Counter 1 Configuration (TMOD)', val: '50H (Counter 1 Mode 1: 16-bit Counter on Pin T1/P3.5)' },
        { name: '16-bit Preload (TH1:TL1)', val: 'FFB0H -> TH1 = 0FFH, TL1 = 0B0H (65,456D)' }
      ],
      outputs: [
        { name: 'Port P3 High Time Duration', val: '80.000 µs' },
        { name: 'Port P3 Low Time Duration', val: '80.000 µs' },
        { name: 'Output Signal Period', val: '160.000 µs (80 µs + 80 µs)' },
        { name: 'Output Signal Frequency', val: '6.250 kHz (f = 1 / 160 µs)' },
        { name: 'Pulse Count per Cycle', val: '80 pulses / machine cycles' }
      ],
      registers: 'TMOD=50H TH1=0FFH TL1=0B0H TCON=00H(TR1=0,TF1=0) P3=00H/FFH',
      terminalDump: '8051 Counter 1 Mode 1 Logic Trace: [TMOD=50H] Preload=FFB0H -> Counted 80 external pulses on Pin T1 -> TF1=1 -> P3 Inverted -> Frequency = 6.25 kHz'
    },
    manualCalculations: {
      title: '8051 Counter 1 Mode 1 (16-bit) 80 µs Delay Mathematical Derivation',
      steps: [
        { step: '1. Machine Cycle Time', detail: 'T_mc = 12 / 12,000,000 Hz = 1.000 µs per count.' },
        { step: '2. Required Pulses / Counts', detail: 'Counts N = 80 µs / 1.000 µs = 80 counts.' },
        { step: '3. 16-bit Preload Calculation', detail: 'Preload = 2^16 - N = 65,536 - 80 = 65,456D = FFB0H.' },
        { step: '4. Register Splitting', detail: 'TH1 = 0FFH (Upper 8 bits: 255D), TL1 = 0B0H (Lower 8 bits: 176D).' },
        { step: '5. Verification of Elapsed Time', detail: '(65,536 - 65,456) × 1.000 µs = 80 × 1.000 µs = 80.000 µs.' }
      ]
    },
    resultText: 'Counter 1 in Mode 1 counted 80 pulses to create an 80 µsec delay; Port P3 pins produced a clean 6.25 kHz square wave.',
    precautions: [
      'When using external Counter mode (C/T=1), the external signal must be applied to pin T1 (P3.5). Pin P3.5 must be configured as an input (write 1 to P3.5).',
      'The minimum pulse width for external pulses on pin T1 is 1 machine cycle (1 µs at 12 MHz) to ensure reliable sampling by the internal CPU state machine.',
      'Always clear TR1 (`CLR TR1`) before writing new values to TH1/TL1 to avoid counting corruption.'
    ],
    studentTask: {
      title: 'Optical Tachometer RPM Counter',
      desc: 'Write an assembly program using Counter 1 in Mode 1 to count motor shaft encoder pulses on pin T1 for an exact 1-second gate window (timed by Timer 0) to calculate RPM.',
      hint: 'Clear TL1/TH1, open 1-second gate by starting Counter 1 (`SETB TR1`), wait for Timer 0 1-sec delay, stop Counter 1 (`CLR TR1`), and read TH1:TL1 for total revolutions.'
    },
    applications: [
      { title: 'Optical Shaft Encoder & Tachometer Counter', desc: 'Counts rotation pulses from optical wheel encoders to measure motor velocity in RPM.', icon: 'gauge' },
      { title: 'High-Frequency Pulse Train Synthesizer', desc: 'Synthesizes accurate 6.25 kHz timing strobes for stepper motor microstepping drivers.', icon: 'activity' }
    ]
  },
  exp_8051_uart_9600: {
    number: '11A',
    title: '8051 UART Serial Character Transfer at 9600 Baud Rate',
    aim: 'Write an 8051 Assembly Language Program to transfer a character serially with a baud rate of 9600 using UART.',
    category: 'Serial Communication & Peripherals',
    bloomLevel: 'Applying & Analyzing (Level 3-4)',
    labSessionTime: '2 Hours (Hardware & Simulation)',
    objectives: [
      'Configure 8051 UART in Mode 1 (8-bit UART, variable baud rate).',
      'Configure Timer 1 in Mode 2 (8-bit Auto-Reload) as the baud rate generator.',
      'Calculate the auto-reload value TH1 for standard 9600 baud rate at 11.0592 MHz crystal frequency.',
      'Transmit ASCII characters serially via SBUF and poll the Transmit Interrupt flag (TI).'
    ],
    outcomes: [
      'Mastery of 8051 UART serial communication framing (1 start bit, 8 data bits, 1 stop bit).',
      'Ability to interface microcontrollers with PCs/terminals via RS-232 / USB-UART bridges at 9600 baud.'
    ],
    components: [
      { name: '8051 Microcontroller Board', spec: 'Intel 8051 with 11.0592 MHz Quartz Crystal', purpose: 'Executes UART transmitter program' },
      { name: 'MAX232 / USB-to-UART Bridge', spec: 'CP2102 / FT232RL or MAX232 Level Converter', purpose: 'Converts TTL serial levels to RS-232 / USB COM port' },
      { name: 'PC Serial Terminal', spec: 'PuTTY / Keil UART Serial Window at 9600 8-N-1', purpose: 'Receives and displays transmitted ASCII characters' }
    ],
    procedureSteps: [
      'Open Keil µVision IDE and create assembly project `EXP11A_UART_9600.A51`.',
      'Configure Timer 1 in Mode 2 Auto-Reload: Write `MOV TMOD, #20H` (GATE=0, C/T=0, M1=1, M0=0).',
      'Set Baud Rate to 9600 Baud: Write `MOV TH1, #0FDH` (-3D) for 11.0592 MHz crystal.',
      'Configure Serial Port Control Register: Write `MOV SCON, #50H` for 8-bit UART Mode 1 with receiver enabled (REN=1).',
      'Start Timer 1 baud clock generator: Execute `SETB TR1`.',
      'Load character byte into Serial Buffer: `MOV SBUF, #\'A\'` (41H) to start transmission.',
      'Poll Transmit Interrupt flag: Monitor `JNB TI, $` until TI becomes 1 (signaling frame transmission complete).',
      'Clear TI flag in software: Execute `CLR TI`.',
      'Loop back to transmit continuously (`SJMP AGAIN`) and observe output in the Serial Terminal window.'
    ],
    theoryText: 'The Intel 8051 contains a full-duplex asynchronous serial port (UART) capable of simultaneous transmission and reception.\n\n1. SCON (Serial Control Register - SFR 98H):\n- SM0=0, SM1=1: Mode 1 (8-bit UART with 1 start bit, 8 data bits, 1 stop bit; total frame = 10 bits).\n- SM2=0: Multiprocessor communication disabled.\n- REN=1: Receiver enabled (SCON = 50H).\n- TI (SCON.1): Transmit Interrupt Flag. Hardware sets TI=1 when the stop bit is transmitted. Must be cleared by software.\n- RI (SCON.0): Receive Interrupt Flag. Hardware sets RI=1 when a valid stop bit is received. Must be cleared by software.\n\n2. SBUF (Serial Buffer - SFR 99H):\nPhysically two separate registers: a write-only Transmit Buffer and a read-only Receive Buffer sharing the same SFR address (99H).\n\n3. Baud Rate Generation using Timer 1 in Mode 2:\nTimer 1 operates as an 8-bit auto-reload timer (TMOD = 20H). In Mode 1 UART with SMOD=0 (PCON.7 = 0):\n- Machine cycle frequency = 11.0592 MHz / 12 = 921.6 kHz.\n- Timer 1 clock to UART = 921.6 kHz / 32 = 28,800 Hz.\n- For 9600 Baud: Reload count = 28,800 / 9600 = 3 counts.\n- Auto-reload value: TH1 = 256 - 3 = 253 = 0FDH (-3 in 2\'s complement).\n\n4. Transmission Timing:\nAt 9600 baud, 1 bit duration = 1 / 9600 = 104.16 µs. A 10-bit character frame takes 10 × 104.16 µs = 1.0416 ms.',
    theoryDiagramType: 'mcu-uart-tx',
    algorithmSteps: [
      'START: Set TMOD = 20H to select Timer 1 Mode 2 (8-bit Auto-Reload).',
      'Load TH1 = 0FDH (-3) to configure 9600 baud rate at 11.0592 MHz.',
      'Set SCON = 50H to select UART Mode 1 (8-bit data, 1 stop bit, REN=1).',
      'Start Timer 1 by setting TR1 = 1 (SETB TR1).',
      'TX_LOOP: Load ASCII character byte into SBUF (e.g., MOV SBUF, #\'A\').',
      'Wait for transmission: Poll TI flag (JNB TI, $) until TI = 1.',
      'Clear Transmit Flag: CLR TI.',
      'Repeat: Jump to TX_LOOP (SJMP AGAIN).'
    ],
    flowchartSteps: [
      { type: 'start', label: 'START (Initialize UART & Timer 1)' },
      { type: 'process', label: 'TMOD = 20H (Timer 1 Mode 2 Auto-Reload)' },
      { type: 'process', label: 'TH1 = 0FDH (9600 Baud Rate Reload)' },
      { type: 'process', label: 'SCON = 50H (Mode 1 8-bit UART, REN=1)' },
      { type: 'process', label: 'SETB TR1 (Start Baud Rate Generator)' },
      { type: 'process', label: 'MOV SBUF, #\'A\' (Write byte to start TX)' },
      { type: 'decision', label: 'Is TI == 1? (Has stop bit finished?)' },
      { type: 'process', label: 'CLR TI (Clear Transmit Flag in software)' },
      { type: 'stop', label: 'Repeat Transmission (SJMP AGAIN)' }
    ],
    expectedOutput: {
      desc: 'Character "A" (ASCII 41H = 01000001B) is transmitted serially at 9600 baud (1 start bit, 8 data bits LSB-first, 1 stop bit) over Pin TXD (P3.1).',
      inputs: [
        { name: 'Quartz Crystal Frequency', val: '11.0592 MHz' },
        { name: 'Target Baud Rate', val: '9600 Baud (Bits / sec)' },
        { name: 'Character to Transmit', val: "'A' (ASCII 41H / 65D / 01000001B)" },
        { name: 'SCON Configuration', val: '50H (Mode 1 8-bit UART, 1 Start, 1 Stop, REN=1)' },
        { name: 'Timer 1 Reload (TH1)', val: '0FDH (253D = 256 - 3)' }
      ],
      outputs: [
        { name: 'Bit Duration (1 / Baud)', val: '104.167 µs' },
        { name: '10-Bit Frame Transmission Time', val: '1.042 ms (1 Start + 8 Data + 1 Stop)' },
        { name: 'TXD Line Serial Bitstream', val: '0 (Start) -> 1 0 0 0 0 0 1 0 (Data LSB to MSB) -> 1 (Stop)' },
        { name: 'Transmit Status Flag (TI)', val: 'Asserted HIGH (TI=1) upon stop bit transmission' },
        { name: 'Terminal Output Stream', val: 'A A A A A A A A A A ...' }
      ],
      registers: 'TMOD=20H TH1=0FDH TL1=0FDH SCON=50H SBUF=41H TCON=40H(TR1=1,TI=0) PCON=00H(SMOD=0)',
      terminalDump: '8051 UART Transmitter: 9600 Baud | SCON=50H | TH1=0FDH | Char="A" (41H) | Frame: 1.042 ms | Output: AAAAAAAA...'
    },
    manualCalculations: {
      title: '8051 UART 9600 Baud Rate & Timer 1 Reload Derivation',
      steps: [
        { step: '1. Oscillator & Machine Cycle Frequency', detail: 'F_osc = 11.0592 MHz. Machine Cycle Frequency = 11.0592 MHz / 12 = 921.6 kHz.' },
        { step: '2. UART Baud Clock Divider', detail: 'In 8051 UART, internal prescaler divides machine clock by 32: F_baud_clk = 921.6 kHz / 32 = 28,800 Hz.' },
        { step: '3. Required Timer 1 Overflows for 9600 Baud', detail: 'Divider N = 28,800 Hz / 9600 Baud = 3 overflows per baud pulse.' },
        { step: '4. 8-Bit Auto-Reload TH1 Value', detail: 'TH1 = 256 - N = 256 - 3 = 253D = 0FDH (-3 in 2\'s complement notation).' },
        { step: '5. Bit Period & Frame Duration Verification', detail: 'Bit time = 1 / 9600 = 104.167 µs. Frame time (10 bits) = 10 × 104.167 µs = 1.04167 ms.' }
      ]
    },
    resultText: 'Character "A" was successfully transferred serially at 9600 baud using 8051 UART Mode 1 with Timer 1 Mode 2 auto-reload (TH1 = 0FDH).',
    precautions: [
      'Always use an 11.0592 MHz quartz crystal for UART experiments; a 12.0 MHz crystal yields 28.8 kHz / 3 = 9600 vs (12M/384) = 31250 / 3 = 10416 baud (~8.5% error, causing framing errors).',
      'The TI flag must be cleared in software (`CLR TI`); hardware only sets TI and never clears it.',
      'Timer 1 must be configured in Mode 2 (TMOD = 20H); loading TMOD with 01H or 02H will corrupt baud generation.'
    ],
    studentTask: {
      title: 'Serial String Transmission ("HELLO WORLD")',
      desc: 'Write an assembly subroutine `SEND_STRING` to transmit a null-terminated string "HELLO WORLD" serially at 9600 baud using DPTR index addressing (`MOVC A, @A+DPTR`).',
      hint: 'Point DPTR to string table `DB "HELLO WORLD", 0`, read byte, check for zero, move to SBUF, poll TI, clear TI, increment DPTR, and repeat.'
    },
    applications: [
      { title: 'PC-Microcontroller Serial Telemetry & Debugging', desc: 'Transmits sensor readings and system diagnostic logs to PC terminal emulators.', icon: 'terminal' },
      { title: 'GPS & Bluetooth Module Interfacing', desc: 'Standard communication link for HC-05 Bluetooth and NMEA GPS receivers at 9600 baud.', icon: 'wifi' }
    ]
  },
  exp_8051_uart_4800: {
    number: '11B',
    title: '8051 UART Serial Character Transfer at 4800 Baud Rate',
    aim: 'Write an 8051 Assembly Language Program to transfer a character serially with a baud rate of 4800 using UART.',
    category: 'Serial Communication & Peripherals',
    bloomLevel: 'Applying & Analyzing (Level 3-4)',
    labSessionTime: '2 Hours (Hardware & Simulation)',
    objectives: [
      'Configure 8051 UART in Mode 1 (8-bit UART, variable baud rate).',
      'Calculate the Timer 1 Mode 2 auto-reload value TH1 for 4800 baud at 11.0592 MHz.',
      'Transmit character \'B\' (ASCII 42H) continuously using SBUF and TI polling.',
      'Understand baud rate scaling and bit timing at 4800 bps.'
    ],
    outcomes: [
      'Proficiency in calculating and reconfiguring UART baud rate reload registers.',
      'Understanding of asynchronous serial frame timing and bit-level transmission waveforms.'
    ],
    components: [
      { name: '8051 Microcontroller Board', spec: 'Intel 8051 with 11.0592 MHz Quartz Crystal', purpose: 'Executes UART transmitter program' },
      { name: 'MAX232 / USB-to-UART Bridge', spec: 'CP2102 / FT232RL or MAX232 Level Converter', purpose: 'Converts TTL serial levels to RS-232 / USB COM port' },
      { name: 'PC Serial Terminal', spec: 'PuTTY / Keil UART Serial Window at 4800 8-N-1', purpose: 'Receives and displays transmitted ASCII characters' }
    ],
    procedureSteps: [
      'Open Keil µVision IDE and create assembly project `EXP11B_UART_4800.A51`.',
      'Configure Timer 1 in Mode 2 Auto-Reload: Write `MOV TMOD, #20H`.',
      'Set Baud Rate to 4800 Baud: Write `MOV TH1, #0FAH` (-6D) for 11.0592 MHz crystal.',
      'Configure Serial Control Register: Write `MOV SCON, #50H` for 8-bit UART Mode 1.',
      'Start Timer 1 baud clock: Execute `SETB TR1`.',
      'Load character byte into SBUF: `MOV SBUF, #\'B\'` (42H).',
      'Poll Transmit Interrupt flag: `JNB TI, $` until TI becomes 1.',
      'Clear TI flag in software: `CLR TI`.',
      'Repeat in infinite loop (`SJMP AGAIN`) and verify received character "B" in the terminal.'
    ],
    theoryText: '8051 UART Mode 1 serial transmission at 4800 Baud:\n\n1. Mathematical Formulation for 4800 Baud:\n- Crystal frequency: f_osc = 11.0592 MHz.\n- Machine cycle: 11.0592 MHz / 12 = 921.6 kHz.\n- UART Timer 1 Clock = 921.6 kHz / 32 = 28,800 Hz.\n- Required Timer 1 division: N = 28,800 Hz / 4800 Baud = 6 counts.\n- Auto-reload byte TH1 = 256 - 6 = 250D = 0FAH (-6 in 2\'s complement).\n\n2. Asynchronous Frame Structure (Mode 1):\n- Total frame length = 10 bits:\n  • 1 Start bit (Active LOW, 0)\n  • 8 Data bits (Character byte: D0 to D7, LSB first)\n  • 1 Stop bit (Active HIGH, 1)\n- Bit period T_bit = 1 / 4800 = 208.333 µs.\n- Character transmission time T_char = 10 × 208.333 µs = 2.0833 ms.\n\n3. Hardware Transmission Flow:\nWriting a byte to SBUF initiates serial shifting. As the 8 data bits and stop bit are clocked out of pin TXD (P3.1), the stop bit trigger asserts the TI flag in SCON, signaling the CPU that SBUF is free for the next character.',
    theoryDiagramType: 'mcu-uart-tx',
    algorithmSteps: [
      'START: Set TMOD = 20H for Timer 1 Mode 2 (8-bit Auto-Reload).',
      'Load TH1 = 0FAH (-6) for 4800 baud rate at 11.0592 MHz.',
      'Set SCON = 50H for Mode 1 UART (8-bit data, REN=1).',
      'Start Timer 1: SETB TR1.',
      'TX_LOOP: Move character \'B\' (42H) into SBUF.',
      'Wait: Poll TI flag (JNB TI, $) until TI = 1.',
      'Clear Flag: CLR TI.',
      'Repeat: Jump to TX_LOOP (SJMP AGAIN).'
    ],
    flowchartSteps: [
      { type: 'start', label: 'START (Initialize UART & Timer 1)' },
      { type: 'process', label: 'TMOD = 20H (Timer 1 Mode 2 Auto-Reload)' },
      { type: 'process', label: 'TH1 = 0FAH (4800 Baud Rate Reload)' },
      { type: 'process', label: 'SCON = 50H (Mode 1 8-bit UART, REN=1)' },
      { type: 'process', label: 'SETB TR1 (Start Baud Rate Generator)' },
      { type: 'process', label: 'MOV SBUF, #\'B\' (Write byte to start TX)' },
      { type: 'decision', label: 'Is TI == 1? (Has stop bit finished?)' },
      { type: 'process', label: 'CLR TI (Clear Transmit Flag in software)' },
      { type: 'stop', label: 'Repeat Transmission (SJMP AGAIN)' }
    ],
    expectedOutput: {
      desc: 'Character "B" (ASCII 42H = 01000010B) is transmitted serially at 4800 baud (Bit duration = 208.33 µs, Frame time = 2.083 ms) over Pin TXD (P3.1).',
      inputs: [
        { name: 'Quartz Crystal Frequency', val: '11.0592 MHz' },
        { name: 'Target Baud Rate', val: '4800 Baud (Bits / sec)' },
        { name: 'Character to Transmit', val: "'B' (ASCII 42H / 66D / 01000010B)" },
        { name: 'SCON Configuration', val: '50H (Mode 1 8-bit UART, 1 Start, 1 Stop, REN=1)' },
        { name: 'Timer 1 Reload (TH1)', val: '0FAH (250D = 256 - 6)' }
      ],
      outputs: [
        { name: 'Bit Duration (1 / Baud)', val: '208.333 µs' },
        { name: '10-Bit Frame Transmission Time', val: '2.083 ms (1 Start + 8 Data + 1 Stop)' },
        { name: 'TXD Line Serial Bitstream', val: '0 (Start) -> 0 1 0 0 0 0 1 0 (Data LSB to MSB) -> 1 (Stop)' },
        { name: 'Transmit Status Flag (TI)', val: 'Asserted HIGH (TI=1) upon stop bit transmission' },
        { name: 'Terminal Output Stream', val: 'B B B B B B B B B B ...' }
      ],
      registers: 'TMOD=20H TH1=0FAH TL1=0FAH SCON=50H SBUF=42H TCON=40H(TR1=1,TI=0) PCON=00H(SMOD=0)',
      terminalDump: '8051 UART Transmitter: 4800 Baud | SCON=50H | TH1=0FAH | Char="B" (42H) | Frame: 2.083 ms | Output: BBBBBBBB...'
    },
    manualCalculations: {
      title: '8051 UART 4800 Baud Rate & Timer 1 Reload Derivation',
      steps: [
        { step: '1. Machine Cycle & Baud Clock', detail: 'F_mc = 11.0592 MHz / 12 = 921.6 kHz. F_baud_clk = 921.6 kHz / 32 = 28,800 Hz.' },
        { step: '2. Required Timer 1 Division Factor', detail: 'Divider N = 28,800 Hz / 4800 Baud = 6 overflows per baud bit.' },
        { step: '3. 8-Bit Auto-Reload TH1 Calculation', detail: 'TH1 = 256 - 6 = 250D = 0FAH (-6 in 2\'s complement notation).' },
        { step: '4. Frame Timing Verification', detail: 'Bit Time = 1 / 4800 = 208.333 µs. 10-bit Frame = 10 × 208.333 µs = 2.08333 ms.' }
      ]
    },
    resultText: 'Character "B" was successfully transferred serially at 4800 baud using 8051 UART Mode 1 with Timer 1 Mode 2 auto-reload (TH1 = 0FAH).',
    precautions: [
      'Verify that the terminal baud rate matches 4800 exactly; a mismatched baud rate causes garbage characters or framing errors.',
      'Ensure the SMOD bit in PCON is 0 (PCON = 00H); if SMOD=1, the baud rate doubles to 9600 baud.',
      'Do not omit `CLR TI`; otherwise, the `JNB TI, $` loop will immediately fall through without waiting for character transmission.'
    ],
    studentTask: {
      title: 'Baud Rate Doubling using SMOD (PCON.7)',
      desc: 'Set the SMOD bit in PCON (`ORL PCON, #80H`) and calculate the resulting baud rate when TH1 = 0FAH.',
      hint: 'When SMOD = 1, Baud Rate = (2^1 / 32) × (28,800 × 32 / (12 × 6)) = 2 × 4800 = 9600 baud.'
    },
    applications: [
      { title: 'Long-Distance Industrial RS-485 Modbus Networks', desc: 'Operates reliably over long cable runs (>500 meters) with high noise immunity at 4800 baud.', icon: 'radio' },
      { title: 'Legacy Thermal Printer & Barcode Scanner Interfacing', desc: 'Standard baud rate for point-of-sale receipt printers and POS peripheral links.', icon: 'printer' }
    ]
  },
  exp_8051_uart_2400: {
    number: '11C',
    title: '8051 UART Serial Character Transfer at 2400 Baud Rate',
    aim: 'Write an 8051 Assembly Language Program to transfer a character serially with a baud rate of 2400 using UART.',
    category: 'Serial Communication & Peripherals',
    bloomLevel: 'Applying & Analyzing (Level 3-4)',
    labSessionTime: '2 Hours (Hardware & Simulation)',
    objectives: [
      'Configure 8051 UART in Mode 1 (8-bit UART, variable baud rate).',
      'Calculate the Timer 1 Mode 2 auto-reload value TH1 for 2400 baud at 11.0592 MHz.',
      'Transmit character \'C\' (ASCII 43H) continuously using SBUF and TI polling.',
      'Understand low-baud long-distance serial timing and frame synchronization.'
    ],
    outcomes: [
      'Comprehensive understanding of baud rate division across 8051 timer registers.',
      'Practical knowledge of serial asynchronous protocols and Keil µVision simulation verification.'
    ],
    components: [
      { name: '8051 Microcontroller Board', spec: 'Intel 8051 with 11.0592 MHz Quartz Crystal', purpose: 'Executes UART transmitter program' },
      { name: 'MAX232 / USB-to-UART Bridge', spec: 'CP2102 / FT232RL or MAX232 Level Converter', purpose: 'Converts TTL serial levels to RS-232 / USB COM port' },
      { name: 'PC Serial Terminal', spec: 'PuTTY / Keil UART Serial Window at 2400 8-N-1', purpose: 'Receives and displays transmitted ASCII characters' }
    ],
    procedureSteps: [
      'Open Keil µVision IDE and create assembly project `EXP11C_UART_2400.A51`.',
      'Configure Timer 1 in Mode 2 Auto-Reload: Write `MOV TMOD, #20H`.',
      'Set Baud Rate to 2400 Baud: Write `MOV TH1, #0F4H` (-12D) for 11.0592 MHz crystal.',
      'Configure Serial Control Register: Write `MOV SCON, #50H` for 8-bit UART Mode 1.',
      'Start Timer 1 baud clock: Execute `SETB TR1`.',
      'Load character byte into SBUF: `MOV SBUF, #\'C\'` (43H).',
      'Poll Transmit Interrupt flag: `JNB TI, $` until TI becomes 1.',
      'Clear TI flag in software: `CLR TI`.',
      'Repeat in infinite loop (`SJMP AGAIN`) and verify received character "C" in the terminal.'
    ],
    theoryText: '8051 UART Mode 1 serial transmission at 2400 Baud:\n\n1. Mathematical Formulation for 2400 Baud:\n- Crystal frequency: f_osc = 11.0592 MHz.\n- Machine cycle: 11.0592 MHz / 12 = 921.6 kHz.\n- UART Timer 1 Clock = 921.6 kHz / 32 = 28,800 Hz.\n- Required Timer 1 division: N = 28,800 Hz / 2400 Baud = 12 counts.\n- Auto-reload byte TH1 = 256 - 12 = 244D = 0F4H (-12 in 2\'s complement).\n\n2. Asynchronous Frame Timing at 2400 Baud:\n- Bit period T_bit = 1 / 2400 = 416.667 µs.\n- Character transmission time T_char = 10 × 416.667 µs = 4.1667 ms.\n- Total throughput: 240 characters per second (cps).\n\n3. Summary Table of 8051 Baud Rates (with 11.0592 MHz, SMOD=0):\n- 9600 Baud: TH1 = -3 (0FDH) | Bit = 104.2 µs | Frame = 1.042 ms\n- 4800 Baud: TH1 = -6 (0FAH) | Bit = 208.3 µs | Frame = 2.083 ms\n- 2400 Baud: TH1 = -12 (0F4H) | Bit = 416.7 µs | Frame = 4.167 ms\n- 1200 Baud: TH1 = -24 (0E8H) | Bit = 833.3 µs | Frame = 8.333 ms',
    theoryDiagramType: 'mcu-uart-tx',
    algorithmSteps: [
      'START: Set TMOD = 20H for Timer 1 Mode 2 (8-bit Auto-Reload).',
      'Load TH1 = 0F4H (-12) for 2400 baud rate at 11.0592 MHz.',
      'Set SCON = 50H for Mode 1 UART (8-bit data, REN=1).',
      'Start Timer 1: SETB TR1.',
      'TX_LOOP: Move character \'C\' (43H) into SBUF.',
      'Wait: Poll TI flag (JNB TI, $) until TI = 1.',
      'Clear Flag: CLR TI.',
      'Repeat: Jump to TX_LOOP (SJMP AGAIN).'
    ],
    flowchartSteps: [
      { type: 'start', label: 'START (Initialize UART & Timer 1)' },
      { type: 'process', label: 'TMOD = 20H (Timer 1 Mode 2 Auto-Reload)' },
      { type: 'process', label: 'TH1 = 0F4H (2400 Baud Rate Reload)' },
      { type: 'process', label: 'SCON = 50H (Mode 1 8-bit UART, REN=1)' },
      { type: 'process', label: 'SETB TR1 (Start Baud Rate Generator)' },
      { type: 'process', label: 'MOV SBUF, #\'C\' (Write byte to start TX)' },
      { type: 'decision', label: 'Is TI == 1? (Has stop bit finished?)' },
      { type: 'process', label: 'CLR TI (Clear Transmit Flag in software)' },
      { type: 'stop', label: 'Repeat Transmission (SJMP AGAIN)' }
    ],
    expectedOutput: {
      desc: 'Character "C" (ASCII 43H = 01000011B) is transmitted serially at 2400 baud (Bit duration = 416.67 µs, Frame time = 4.167 ms) over Pin TXD (P3.1).',
      inputs: [
        { name: 'Quartz Crystal Frequency', val: '11.0592 MHz' },
        { name: 'Target Baud Rate', val: '2400 Baud (Bits / sec)' },
        { name: 'Character to Transmit', val: "'C' (ASCII 43H / 67D / 01000011B)" },
        { name: 'SCON Configuration', val: '50H (Mode 1 8-bit UART, 1 Start, 1 Stop, REN=1)' },
        { name: 'Timer 1 Reload (TH1)', val: '0F4H (244D = 256 - 12)' }
      ],
      outputs: [
        { name: 'Bit Duration (1 / Baud)', val: '416.667 µs' },
        { name: '10-Bit Frame Transmission Time', val: '4.167 ms (1 Start + 8 Data + 1 Stop)' },
        { name: 'TXD Line Serial Bitstream', val: '0 (Start) -> 1 1 0 0 0 0 1 0 (Data LSB to MSB) -> 1 (Stop)' },
        { name: 'Transmit Status Flag (TI)', val: 'Asserted HIGH (TI=1) upon stop bit transmission' },
        { name: 'Terminal Output Stream', val: 'C C C C C C C C C C ...' }
      ],
      registers: 'TMOD=20H TH1=0F4H TL1=0F4H SCON=50H SBUF=43H TCON=40H(TR1=1,TI=0) PCON=00H(SMOD=0)',
      terminalDump: '8051 UART Transmitter: 2400 Baud | SCON=50H | TH1=0F4H | Char="C" (43H) | Frame: 4.167 ms | Output: CCCCCCCC...'
    },
    manualCalculations: {
      title: '8051 UART 2400 Baud Rate & Timer 1 Reload Derivation',
      steps: [
        { step: '1. Machine Cycle & Baud Clock', detail: 'F_mc = 11.0592 MHz / 12 = 921.6 kHz. F_baud_clk = 921.6 kHz / 32 = 28,800 Hz.' },
        { step: '2. Required Timer 1 Division Factor', detail: 'Divider N = 28,800 Hz / 2400 Baud = 12 overflows per baud bit.' },
        { step: '3. 8-Bit Auto-Reload TH1 Calculation', detail: 'TH1 = 256 - 12 = 244D = 0F4H (-12 in 2\'s complement notation).' },
        { step: '4. Frame Timing Verification', detail: 'Bit Time = 1 / 2400 = 416.667 µs. 10-bit Frame = 10 × 416.667 µs = 4.16667 ms.' }
      ]
    },
    resultText: 'Character "C" was successfully transferred serially at 2400 baud using 8051 UART Mode 1 with Timer 1 Mode 2 auto-reload (TH1 = 0F4H).',
    precautions: [
      'Ensure Timer 1 is running (`TR1=1`); otherwise, no baud clock is supplied to the serial port and transmission will hang at `JNB TI, $`.',
      'Verify that the host terminal emulator is set to 2400-8-N-1 (2400 baud, 8 data bits, no parity, 1 stop bit).',
      'Keep serial cable lengths within RS-232 specifications or use differential transceivers for noisy environments.'
    ],
    studentTask: {
      title: 'Bidirectional UART Echo Program',
      desc: 'Write an assembly program that receives a character from the serial port (wait for `RI=1`, read SBUF, `CLR RI`), increments it by 1, and transmits it back via UART at 2400 baud.',
      hint: 'Poll `JNB RI, $`, `CLR RI`, `MOV A, SBUF`, `INC A`, `MOV SBUF, A`, `JNB TI, $`, `CLR TI`, `SJMP AGAIN`.'
    },
    applications: [
      { title: 'Subsea & Acoustic Acoustic Modem Telemetry', desc: 'Reliable low-baud acoustic and long-range subsea sensor data transmission.', icon: 'activity' },
      { title: 'Power Grid SCADA & Remote Terminal Units (RTUs)', desc: 'Standard legacy baud rate for remote utility metering and electrical substation monitoring.', icon: 'cpu' }
    ]
  },
  exp_8051_lcd_8bit: {
    number: '12A',
    title: 'Interfacing 16×2 LCD with 8051 Microcontroller (8-Bit Mode)',
    aim: 'Develop and execute an 8051 Assembly Language Program to interface a 16×2 Alphanumeric LCD module to 8051 in 8-bit mode and display alphanumeric messages.',
    category: 'Display Interfaces & Peripheral Control',
    bloomLevel: 'Applying & Creating (Level 3-6)',
    labSessionTime: '2 Hours (Hardware & Simulation)',
    objectives: [
      'Understand the architecture, pin configuration, and HD44780 command set of 16×2 Alphanumeric LCDs.',
      'Interface all 8 data lines (D0–D7) to 8051 Port P1 and control lines RS, RW, and EN to Port P2.',
      'Implement command write (RS=0) and data write (RS=1) subroutines with proper Enable pulse timing.',
      'Initialize LCD in 8-bit mode (38H, 0EH, 01H, 06H) and display custom strings on Line 1 (80H) and Line 2 (C0H).'
    ],
    outcomes: [
      'Mastery of character display hardware interfacing, timing diagrams, and register control.',
      'Ability to design embedded human-machine interfaces (HMI) using 8051 assembly language.'
    ],
    components: [
      { name: '8051 Microcontroller System', spec: 'Intel 8051 / AT89C51 with 11.0592 MHz / 12 MHz Crystal', purpose: 'Executes LCD driver and string display routines' },
      { name: '16×2 Alphanumeric LCD Module', spec: 'HD44780 / ST7066 Controller Compatible (16 chars × 2 rows)', purpose: 'Displays ASCII characters in 5×7 dot-matrix format' },
      { name: 'Contrast Trimpot', spec: '10 kΩ 3-Terminal Potentiometer connected to Pin 3 (VEE)', purpose: 'Adjusts liquid crystal display contrast level' },
      { name: 'Pull-up Resistor Network', spec: '10 kΩ 8-Resistor SIP Network on Port P0 (if P0 used for bus)', purpose: 'Provides active high pull-up on open-drain 8051 port pins' }
    ],
    procedureSteps: [
      'Connect LCD data lines D0–D7 to 8051 Port P1 (Pins P1.0 to P1.7).',
      'Connect LCD control lines: RS to Pin P2.0, RW to Pin P2.1, and EN to Pin P2.2.',
      'Connect LCD Power: VSS (Pin 1) to GND, VDD (Pin 2) to +5V, and VEE (Pin 3) to wiper of 10k potentiometer.',
      'Open Keil µVision IDE and create assembly project `EXP12A_LCD_8BIT.A51`.',
      'Implement power-on delay (>15 ms) to allow HD44780 internal Power-On-Reset (POR) to complete.',
      'Send Initialization Commands via `LCD_CMD` subroutine: 38H (8-bit, 2 lines, 5×7 font), 0EH (Display ON, cursor ON), 01H (Clear display), and 06H (Entry mode auto-increment).',
      'Set DDRAM address to 80H (Line 1, Column 1) and send Line 1 string "8051 INTERFACE" via `LCD_DATA` subroutine.',
      'Set DDRAM address to C0H (Line 2, Column 1) and send Line 2 string "16x2 LCD 8-BIT" via `LCD_DATA` subroutine.',
      'Execute code, adjust 10k contrast pot until characters are crisp and dark, and verify output on both lines.'
    ],
    theoryText: 'Interfacing 16×2 LCD Module with 8051 Microcontroller (8-Bit Mode):\n\n1. HD44780 Alphanumeric LCD Architecture:\n- 16 Characters × 2 Lines, 5×7 pixel matrix per character box with 1-line cursor space (5×8 total).\n- Display Data RAM (DDRAM): Stores ASCII codes of displayed characters. Line 1 address: 80H to 8FH (16 chars), Line 2 address: C0H to CFH (16 chars).\n- Character Generator ROM (CGROM): Stores predefined ASCII character font patterns.\n- Character Generator RAM (CGRAM): Allows user to define up to 8 custom symbols/glyphs.\n\n2. Pin Configuration & Control Signals:\n- Pin 1 (VSS): GND (0V).\n- Pin 2 (VDD): +5V DC supply.\n- Pin 3 (VEE): Contrast voltage (0 to +5V via 10k pot).\n- Pin 4 (RS): Register Select (0 = Command Register / IR, 1 = Data Register / DR).\n- Pin 5 (RW): Read/Write (0 = Write to LCD, 1 = Read from LCD).\n- Pin 6 (EN): Enable Strobe (Active High-to-Low pulse with width t_pw >= 450 ns to latch data).\n- Pins 7–14 (D0–D7): 8-Bit bidirectional data bus.\n- Pins 15–16 (BLA, BLK): Backlight LED Anode (+5V through 100Ω) and Cathode (GND).\n\n3. Standard Initialization Command Sequence (8-Bit Mode):\n- 38H: Function Set -> 8-bit interface, 2 display lines, 5×7 character font.\n- 0EH: Display ON/OFF -> Display ON, cursor ON, no blink (0CH for cursor OFF).\n- 01H: Clear Display Screen -> Clears DDRAM and returns cursor to Home address 00H (requires >1.53 ms delay).\n- 06H: Entry Mode Set -> Auto-increment DDRAM address (cursor moves right) after every character write without display shift.\n- 80H / C0H: Set DDRAM Address -> 80H points to Line 1 Col 1; C0H points to Line 2 Col 1.',
    theoryDiagramType: 'mcu-lcd-8bit',
    algorithmSteps: [
      'START: Set RS=0, RW=0, EN=0, and Port P1=00H.',
      'Delay 20 ms for LCD Power-On Reset stabilization.',
      'Send Command 38H: Function Set (8-bit, 2 lines, 5×7 font).',
      'Send Command 0EH: Display ON, Cursor ON.',
      'Send Command 01H: Clear screen (with 2 ms delay).',
      'Send Command 06H: Entry mode (Increment cursor, no shift).',
      'Send Command 80H: Set DDRAM cursor to Line 1 Column 1.',
      'Write Line 1 ASCII characters using DATA write subroutine (RS=1, RW=0, EN pulse).',
      'Send Command C0H: Set DDRAM cursor to Line 2 Column 1.',
      'Write Line 2 ASCII characters using DATA write subroutine.',
      'HALT: Enter infinite loop (SJMP $).'
    ],
    flowchartSteps: [
      { type: 'start', label: 'START (Power-on Reset Delay 20 ms)' },
      { type: 'process', label: 'Send Command 38H (8-Bit Mode, 2 Lines, 5x7 Font)' },
      { type: 'process', label: 'Send Command 0EH (Display ON, Cursor ON)' },
      { type: 'process', label: 'Send Command 01H (Clear Display & Home Cursor)' },
      { type: 'process', label: 'Send Command 06H (Auto-Increment Cursor)' },
      { type: 'process', label: 'Send Command 80H (Set DDRAM to Line 1 Col 1)' },
      { type: 'io', label: 'Write Line 1 String: "8051 INTERFACE" (RS=1, EN Pulse)' },
      { type: 'process', label: 'Send Command C0H (Set DDRAM to Line 2 Col 1)' },
      { type: 'io', label: 'Write Line 2 String: "16x2 LCD 8-BIT" (RS=1, EN Pulse)' },
      { type: 'stop', label: 'HALT / END (SJMP $)' }
    ],
    expectedOutput: {
      desc: 'The 16×2 LCD screen displays "8051 INTERFACE" on Line 1 and "16x2 LCD 8-BIT" on Line 2 with an active blinking/steady underline cursor at the end of the text.',
      inputs: [
        { name: 'LCD Interfacing Mode', val: '8-Bit Parallel Interface (D0–D7 on Port P1)' },
        { name: 'Control Pin Assignments', val: 'RS = P2.0, RW = P2.1, EN = P2.2' },
        { name: 'Initialization Commands', val: '38H (Function), 0EH (Display ON), 01H (Clear), 06H (Entry Mode)' },
        { name: 'Line 1 DDRAM Address', val: '80H (Line 1 Column 1 - 14 Characters)' },
        { name: 'Line 2 DDRAM Address', val: 'C0H (Line 2 Column 1 - 14 Characters)' }
      ],
      outputs: [
        { name: 'Line 1 Display Output', val: '"8051 INTERFACE "' },
        { name: 'Line 2 Display Output', val: '"16x2 LCD 8-BIT "' },
        { name: 'Control Bus States (Command)', val: 'RS=0, RW=0, EN Pulse: HIGH (1) -> LOW (0)' },
        { name: 'Control Bus States (Data)', val: 'RS=1, RW=0, EN Pulse: HIGH (1) -> LOW (0)' },
        { name: 'Enable Strobe Pulse Width', val: 't_pw >= 450 ns (3 NOPs = 3.25 µs at 11.0592 MHz)' }
      ],
      registers: 'P1=ASCII Data Port | P2.0(RS)=1 | P2.1(RW)=0 | P2.2(EN)=0 | DPTR=String Pointer | ACC=Character Code',
      terminalDump: '+----------------+\n|8051 INTERFACE  |\n|16x2 LCD 8-BIT_ |\n+----------------+\n[LCD 8-Bit Interfacing Verified: Commands 38H, 0EH, 01H, 06H, 80H, C0H Executed Successfully]'
    },
    manualCalculations: {
      title: '16×2 LCD 8-Bit Bus Timing & DDRAM Address Mapping',
      steps: [
        { step: '1. Enable Latch Timing Analysis', detail: 'HD44780 requires Enable pulse width t_pw >= 450 ns and data setup time t_DS >= 195 ns. At 11.0592 MHz (1 MC = 1.085 µs), 3 NOPs provide 3.255 µs HIGH duration, completely satisfying AC timing margins.' },
        { step: '2. DDRAM Address Generation', detail: 'Line 1 base = 80H (00H + 80H). Line 2 base = C0H (40H + 80H). Setting DDRAM address requires Bit 7 HIGH: Command Byte = 80H + DDRAM_OFFSET.' },
        { step: '3. Clear Screen Delay Verification', detail: 'Clear Screen (01H) and Return Home (02H) take up to 1.53 ms to complete inside HD44780; all other commands execute in ~37–43 µs. A 2 ms software delay guarantees zero command collision.' }
      ]
    },
    resultText: 'The 16×2 alphanumeric LCD was successfully interfaced to 8051 in 8-bit mode, and the strings "8051 INTERFACE" and "16x2 LCD 8-BIT" were rendered clearly on Line 1 and Line 2.',
    precautions: [
      'Do not forget the power-up delay (>15 ms); sending commands immediately on boot before internal Power-On-Reset settles will cause the LCD to remain blank or display solid black boxes.',
      'Ensure RW is pulled LOW (RW=0) for write operations; leaving RW floating or HIGH will cause write attempts to fail.',
      'Adjust the 10k potentiometer on Pin 3 (VEE) properly; if VEE is tied directly to +5V, the display characters will be completely invisible (zero contrast).'
    ],
    studentTask: {
      title: 'Scrolling Text Banner on 16×2 LCD',
      desc: 'Modify the 8-bit LCD program to continuously scroll the message "WELCOME TO KUPPAM ENGINEERING COLLEGE" from right to left across Line 1 using LCD shift command 18H with a 300 ms inter-frame delay.',
      hint: 'Send command 18H (Shift entire display to the left) inside a loop with a 300 ms software delay.'
    },
    applications: [
      { title: 'Digital Multimeters & Industrial Instrumentation', desc: 'Real-time numerical readout of voltage, current, frequency, and temperature measurements.', icon: 'activity' },
      { title: 'Point-of-Sale (POS) & Ticketing Vending Machines', desc: 'Displays transaction summaries, prompts, PIN entries, and pricing information to users.', icon: 'monitor' }
    ]
  },
  exp_8051_lcd_4bit: {
    number: '12B',
    title: 'Interfacing 16×2 LCD with 8051 Microcontroller in 4-Bit Mode',
    aim: 'Develop and execute an 8051 Assembly Language Program to interface a 16×2 LCD to 8051 in 4-bit mode (saving 4 microcontroller I/O lines) and display custom text.',
    category: 'Display Interfaces & Pin-Saving Architectures',
    bloomLevel: 'Applying & Analyzing (Level 3-5)',
    labSessionTime: '2 Hours (Hardware & Simulation)',
    objectives: [
      'Understand 4-bit data bus multiplexing on HD44780 LCD controllers to save 4 microcontroller I/O pins.',
      'Interface LCD data pins D4–D7 to Port P1.4–P1.7, leaving D0–D3 unconnected / grounded.',
      'Implement 4-bit dual-nibble transmission routines using `SWAP A` and `ANL A, #0F0H`.',
      'Execute the mandatory 4-bit initialization handshake (33H, 32H, 28H, 0EH, 01H, 06H) and display multi-line text.'
    ],
    outcomes: [
      'Mastery of nibble-swapping algorithms and pin-efficient embedded hardware interfacing.',
      'Proficiency in writing robust multi-nibble display drivers in 8051 assembly language.'
    ],
    components: [
      { name: '8051 Microcontroller System', spec: 'Intel 8051 with 11.0592 MHz Crystal', purpose: 'Executes 4-bit LCD driver and text display routines' },
      { name: '16×2 Alphanumeric LCD Module', spec: 'HD44780 Compatible, D4–D7 connected to P1.4–P1.7', purpose: 'Displays characters using 4-bit data bus' },
      { name: 'Contrast Adjustment Potentiometer', spec: '10 kΩ 3-Terminal Potentiometer on Pin 3 (VEE)', purpose: 'Controls LCD pixel contrast voltage' }
    ],
    procedureSteps: [
      'Connect LCD data lines D4, D5, D6, D7 to 8051 Port pins P1.4, P1.5, P1.6, P1.7 (Leave D0–D3 grounded or floating).',
      'Connect LCD control pins: RS to P2.0, RW to P2.1, and EN to P2.2.',
      'Open Keil µVision IDE and create assembly project `EXP12B_LCD_4BIT.A51`.',
      'Implement 20 ms power-up delay.',
      'Execute 4-bit initialization sequence: Send single nibble 30H (three times), then send single nibble 20H to switch controller to 4-bit mode.',
      'Send 4-bit dual-nibble commands: 28H (4-bit, 2 lines, 5×7 font), 0EH (Display ON, cursor ON), 01H (Clear display), and 06H (Auto-increment cursor).',
      'Position cursor at Line 1 (80H) and send string "4-BIT LCD MODE" in dual 4-bit nibbles.',
      'Position cursor at Line 2 (C0H) and send string "SAVING 4 I/O PINS" in dual 4-bit nibbles.',
      'Verify crisp display on both lines and examine pin savings on Port P1 (P1.0–P1.3 remain free for other sensors/switches).'
    ],
    theoryText: 'Interfacing 16×2 LCD with 8051 in 4-Bit Mode:\n\n1. Motivation for 4-Bit Interface Mode:\n- In 8-bit mode, 11 microcontroller pins are dedicated to the LCD (8 Data + 3 Control). In resource-constrained microcontrollers, this consumes nearly 35% of all available I/O pins.\n- In 4-bit mode, only 4 data lines (D4–D7) plus 3 control lines (RS, RW, EN) are used — saving 4 full I/O pins (e.g., P1.0–P1.3) for keyboard matrixes, sensors, or relays.\n\n2. 4-Bit Transmission Protocol:\n- Every 8-bit command or ASCII byte is transmitted as TWO sequential 4-bit nibbles:\n  * Nibble 1 (Upper 4 bits D7–D4): Sent directly on P1.4–P1.7, followed by an EN High-to-Low strobe.\n  * Nibble 2 (Lower 4 bits D3–D0): Swapped into upper position via `SWAP A`, masked via `ANL A, #0F0H`, output on P1.4–P1.7, followed by another EN strobe.\n\n3. Mandatory 4-Bit Initialization Handshake (Software Reset):\n- At power-on, the HD44780 starts in 8-bit mode by default.\n- Handshake sequence to force 4-bit mode without locking up the internal state machine:\n  1. Wait >15 ms after VDD reaches 4.5V.\n  2. Send Nibble 30H -> Wait >4.1 ms.\n  3. Send Nibble 30H -> Wait >100 µs.\n  4. Send Nibble 30H -> Wait >100 µs.\n  5. Send Nibble 20H -> Switches LCD into 4-bit bus mode!\n  6. From now on, all commands/data are sent in two nibbles: 28H (Function Set 4-bit, 2 lines, 5×7 font), 0EH (Display ON), 01H (Clear display), 06H (Entry mode).',
    theoryDiagramType: 'mcu-lcd-4bit',
    algorithmSteps: [
      'START: Initialize Port P1 and control pins RS=0, RW=0, EN=0.',
      'Power-on Delay: Call 20 ms delay.',
      '4-Bit Reset: Send single nibble 30H (3 times), then 20H to select 4-bit interface.',
      'Send Command 28H (4-bit mode, 2 lines, 5×7 font) via dual-nibble routine.',
      'Send Command 0EH (Display ON, cursor ON).',
      'Send Command 01H (Clear display with 2 ms delay).',
      'Send Command 06H (Entry mode auto-increment).',
      'Send Command 80H (Line 1 start) and write "4-BIT LCD MODE" in dual nibbles.',
      'Send Command C0H (Line 2 start) and write "SAVING 4 I/O PINS" in dual nibbles.',
      'HALT: Jump to self (SJMP $).'
    ],
    flowchartSteps: [
      { type: 'start', label: 'START (Power-on Delay 20 ms)' },
      { type: 'process', label: '4-Bit Reset Handshake: Send 30H (3x), then 20H' },
      { type: 'process', label: 'Send Command 28H (4-Bit Bus, 2 Lines, 5x7 Font)' },
      { type: 'process', label: 'Send Command 0EH (Display ON, Cursor ON)' },
      { type: 'process', label: 'Send Command 01H (Clear Screen & Return Home)' },
      { type: 'process', label: 'Send Command 06H (Auto-Increment Cursor)' },
      { type: 'process', label: 'Send Command 80H (Line 1 Col 1)' },
      { type: 'io', label: 'Write Line 1: "4-BIT LCD MODE" (Upper + Lower Nibble Strobe)' },
      { type: 'process', label: 'Send Command C0H (Line 2 Col 1)' },
      { type: 'io', label: 'Write Line 2: "SAVING 4 I/O PINS" (Upper + Lower Nibble Strobe)' },
      { type: 'stop', label: 'HALT / END (SJMP $)' }
    ],
    expectedOutput: {
      desc: 'The 16×2 LCD screen successfully initializes in 4-bit mode using only 7 total microcontroller lines (P1.4-P1.7, P2.0-P2.2) and displays "4-BIT LCD MODE" on Line 1 and "SAVING 4 I/O PINS" on Line 2.',
      inputs: [
        { name: 'LCD Interfacing Mode', val: '4-Bit Multiplexed Mode (Pins D4–D7 on P1.4–P1.7)' },
        { name: 'Unused LCD Pins', val: 'D0, D1, D2, D3 left unconnected / grounded' },
        { name: 'Saved Microcontroller Pins', val: 'Port P1.0, P1.1, P1.2, P1.3 freed for other I/O' },
        { name: 'Initialization Command', val: '28H (4-bit interface, 2 lines, 5×7 font matrix)' }
      ],
      outputs: [
        { name: 'Line 1 Display Output', val: '"4-BIT LCD MODE  "' },
        { name: 'Line 2 Display Output', val: '"SAVING 4 I/O PINS"' },
        { name: 'Nibble Strobe Count per Byte', val: '2 EN Pulses (High Nibble Strobe + Low Nibble Strobe)' },
        { name: 'Transmission Speed Difference', val: 'Approx 2x transmission time compared to 8-bit mode (negligible for human vision)' }
      ],
      registers: 'P1=Nibble Bus (D4-D7 on P1.4-P1.7) | P2.0(RS) | P2.1(RW) | P2.2(EN) | ACC=Dual Nibbles',
      terminalDump: '+----------------+\n|4-BIT LCD MODE  |\n|SAVING 4 I/O PINS|\n+----------------+\n[4-Bit LCD Interfacing Verified: Commands 33H, 32H, 28H, 0EH, 01H, 06H, 80H, C0H Executed Successfully]'
    },
    manualCalculations: {
      title: '4-Bit LCD Nibble Decomposition & Pin-Budget Savings',
      steps: [
        { step: '1. Microcontroller Pin Budget Comparison', detail: '8-Bit Mode requires 8 data + 3 control = 11 I/O pins (34.4% of 8051 pins). 4-Bit Mode requires 4 data + 3 control = 7 I/O pins (21.9% of 8051 pins), freeing 4 pins for other peripherals.' },
        { step: '2. Nibble Splitting Algorithm (e.g. ASCII \'A\' = 41H = 0100 0001B)', detail: 'High Nibble: 41H AND F0H = 40H (Output on P1.4-P1.7, EN pulse). Low Nibble: SWAP 41H -> 14H, 14H AND F0H = 10H (Output on P1.4-P1.7, EN pulse).' },
        { step: '3. Throughput & Timing Analysis', detail: 'Sending 1 byte in 4-bit mode takes ~80 µs (two 40 µs nibble cycles). Writing 32 characters takes 32 × 80 µs = 2.56 ms, creating an instantaneous flicker-free refresh for human users.' }
      ]
    },
    resultText: 'The 16×2 LCD was successfully interfaced to 8051 in 4-bit mode using only 7 total microcontroller pins, displaying "4-BIT LCD MODE" and "SAVING 4 I/O PINS" reliably.',
    precautions: [
      'Do not omit the triple 30H send sequence during initialization; if the controller was in an unknown state (e.g. half-way through a 4-bit nibble from previous reset), the 30H sequence is the only way to reliably resynchronize it.',
      'Ensure the `ANL A, #0F0H` mask is applied before outputting to Port 1 to avoid corrupting the lower 4 bits (P1.0–P1.3) if other peripherals are connected to them.',
      'Always strobe the EN pin (High-to-Low) for BOTH the higher nibble and the lower nibble.'
    ],
    studentTask: {
      title: 'Custom Character Generation in 4-Bit Mode (CGRAM)',
      desc: 'Generate and display a custom battery symbol or heart glyph on the 16×2 LCD in 4-bit mode by writing an 8-byte pixel pattern into CGRAM address 40H (Character Code 00H).',
      hint: 'Send command 40H (Set CGRAM Address 00H), write 8 bitmap bytes using `LCD_DATA_4BIT`, then send command 80H and write character 00H to display it.'
    },
    applications: [
      { title: 'Battery-Powered Handheld Gadgets & IoT Nodes', desc: 'Minimizes microcontroller pin count, allowing compact microcontroller packages (e.g. 20-pin AT89C2051).', icon: 'battery' },
      { title: 'Smart Home Thermostats & Environmental Loggers', desc: 'Allows simultaneous connection of temperature sensor (ADC), keypad (4x4), and LCD on a single 8051.', icon: 'thermometer' }
    ]
  }
};

