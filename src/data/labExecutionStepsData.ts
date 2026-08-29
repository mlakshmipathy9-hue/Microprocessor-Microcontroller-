export interface ExecutionStep {
  stepNum: number;
  label?: string;
  instruction: string;
  machineCode?: string;
  modifiedRegs: string[];
  registers: {
    AX: string;
    BX: string;
    CX: string;
    DX: string;
    SI: string;
    DI: string;
    SP: string;
    BP: string;
    IP: string;
  };
  flags: {
    CF: '0' | '1';
    ZF: '0' | '1';
    SF: '0' | '1';
    OF: '0' | '1';
    PF: '0' | '1';
    AF: '0' | '1';
  };
  memoryAction: string;
  description: string;
}

export interface LabExecutionData {
  expId?: string;
  title: string;
  hardwareContext?: string;
  dosboxSteps?: Array<{
    step: number;
    command: string;
    purpose: string;
    outputSample: string;
  }>;
  steps: ExecutionStep[];
}

export const LAB_EXECUTION_DATA: Record<string, LabExecutionData> = {
  exp1: {
    expId: 'exp1',
    title: 'Exp 1A: Multi-precision Addition & Subtraction (32-bit / 64-bit)',
    dosboxSteps: [
      {
        step: 1,
        command: 'MOUNT C C:\\MASM611\nC:\nCD WORK',
        purpose: 'Mount the MASM 6.11 installation directory in DOSBox and switch to the workspace folder.',
        outputSample: 'Drive C is mounted as local directory C:\\MASM611\nC:\\WORK>'
      },
      {
        step: 2,
        command: 'EDIT EXP1A.ASM',
        purpose: 'Create or edit the Assembly Language Program source file using MS-DOS Editor.',
        outputSample: 'MS-DOS Editor opens with source code. Press ALT+F then S to save, ALT+F then X to exit.'
      },
      {
        step: 3,
        command: 'MASM EXP1A.ASM;',
        purpose: 'Invoke Microsoft Macro Assembler (MASM) to generate object module EXP1A.OBJ.',
        outputSample: 'Microsoft (R) Macro Assembler Version 6.11\n0 Warning Errors\n0 Severe Errors'
      },
      {
        step: 4,
        command: 'LINK EXP1A.OBJ;',
        purpose: 'Link the object code module to create the executable file EXP1A.EXE.',
        outputSample: 'Microsoft (R) Segmented-Executable Linker Version 5.31\nLINK : warning L4021: no stack segment (ignored)'
      },
      {
        step: 5,
        command: 'DEBUG EXP1A.EXE',
        purpose: 'Load the executable into the MS-DOS Debugger for interactive single-step execution and memory inspection.',
        outputSample: '-\n-r (Display all 8086 CPU registers)\n-t (Single step trace instruction by instruction)\n-d DS:0000 0020 (Dump data memory bytes)'
      }
    ],
    steps: [
      {
        stepNum: 1,
        label: 'START',
        instruction: 'MOV AX, @DATA',
        machineCode: 'B8 00 10',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '1000H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0003H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'Fetch immediate segment base 1000H into AX',
        description: 'Loads the segment address of the Data Segment (@DATA = 1000H) into accumulator AX.'
      },
      {
        stepNum: 2,
        instruction: 'MOV DS, AX',
        machineCode: '8E D8',
        modifiedRegs: ['IP'],
        registers: { AX: '1000H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0005H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'DS initialized to 1000H (Data Segment active)',
        description: 'Transfers segment address from AX to DS register. Memory variables in DATA_SEG can now be addressed.'
      },
      {
        stepNum: 3,
        instruction: 'LEA SI, NUM1',
        machineCode: '8D 36 00 00',
        modifiedRegs: ['SI', 'IP'],
        registers: { AX: '1000H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0009H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'SI = offset address of NUM1 (DS:0000H)',
        description: 'Loads the effective offset address of first operand NUM1 (FF FE FD FC) into Source Index SI.'
      },
      {
        stepNum: 4,
        instruction: 'LEA DI, NUM2',
        machineCode: '8D 3E 04 00',
        modifiedRegs: ['DI', 'IP'],
        registers: { AX: '1000H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0004H', SP: '0100H', BP: '0000H', IP: '000DH' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'DI = offset address of NUM2 (DS:0004H)',
        description: 'Loads the effective offset address of second operand NUM2 (01 02 03 04) into Destination Index DI.'
      },
      {
        stepNum: 5,
        instruction: 'LEA BX, RESULT_ADD',
        machineCode: '8D 1E 08 00',
        modifiedRegs: ['BX', 'IP'],
        registers: { AX: '1000H', BX: '0008H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0004H', SP: '0100H', BP: '0000H', IP: '0011H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'BX = offset of RESULT_ADD (DS:0008H)',
        description: 'Loads base register BX with the offset of the 4-byte destination addition buffer RESULT_ADD.'
      },
      {
        stepNum: 6,
        instruction: 'MOV CX, 0004H',
        machineCode: 'B9 04 00',
        modifiedRegs: ['CX', 'IP'],
        registers: { AX: '1000H', BX: '0008H', CX: '0004H', DX: '0000H', SI: '0000H', DI: '0004H', SP: '0100H', BP: '0000H', IP: '0014H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'Set loop counter CX = 4 (for 4 byte pairs)',
        description: 'Initializes CX to 4 (number of byte additions required for 32-bit multi-precision number).'
      },
      {
        stepNum: 7,
        instruction: 'CLC',
        machineCode: 'F8',
        modifiedRegs: ['IP'],
        registers: { AX: '1000H', BX: '0008H', CX: '0004H', DX: '0000H', SI: '0000H', DI: '0004H', SP: '0100H', BP: '0000H', IP: '0015H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'Clear Carry Flag (CF = 0)',
        description: 'Clears Carry Flag (CF=0) so the first addition byte starts clean with zero initial carry.'
      },
      {
        stepNum: 8,
        label: 'ADD_LOOP (Byte 0)',
        instruction: 'MOV AL, [SI]',
        machineCode: '8A 04',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '10FFH', BX: '0008H', CX: '0004H', DX: '0000H', SI: '0000H', DI: '0004H', SP: '0100H', BP: '0000H', IP: '0017H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'READ [DS:0000H] -> AL receives FFH',
        description: 'Reads the first byte (LSB = FFH) of NUM1 into accumulator AL.'
      },
      {
        stepNum: 9,
        instruction: 'ADC AL, [DI]',
        machineCode: '12 05',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '1000H', BX: '0008H', CX: '0004H', DX: '0000H', SI: '0000H', DI: '0004H', SP: '0100H', BP: '0000H', IP: '0019H' },
        flags: { CF: '1', ZF: '1', SF: '0', OF: '0', PF: '1', AF: '1' },
        memoryAction: 'ALU: FFH + 01H + 0 = 100H -> AL=00H, CF=1',
        description: 'Adds byte [DI]=01H and CF=0 to AL=FFH. Result is 100H; AL receives 00H and Carry Flag CF is set to 1.'
      },
      {
        stepNum: 10,
        instruction: 'MOV [BX], AL',
        machineCode: '88 07',
        modifiedRegs: ['IP'],
        registers: { AX: '1000H', BX: '0008H', CX: '0004H', DX: '0000H', SI: '0000H', DI: '0004H', SP: '0100H', BP: '0000H', IP: '001BH' },
        flags: { CF: '1', ZF: '1', SF: '0', OF: '0', PF: '1', AF: '1' },
        memoryAction: 'WRITE [DS:0008H] <- 00H (Byte 0 sum stored)',
        description: 'Stores sum byte 00H into RESULT_ADD at memory address [DS:0008H].'
      },
      {
        stepNum: 11,
        instruction: 'INC SI; INC DI; INC BX',
        machineCode: '46 47 43',
        modifiedRegs: ['SI', 'DI', 'BX', 'IP'],
        registers: { AX: '1000H', BX: '0009H', CX: '0004H', DX: '0000H', SI: '0001H', DI: '0005H', SP: '0100H', BP: '0000H', IP: '001EH' },
        flags: { CF: '1', ZF: '1', SF: '0', OF: '0', PF: '1', AF: '1' },
        memoryAction: 'Pointers increment to next byte addresses (Note: INC does NOT alter CF!)',
        description: 'Increments pointers to Byte 1. Crucially, INC does not modify CF, keeping CF=1 intact for the next ADC.'
      },
      {
        stepNum: 12,
        label: 'ADD_LOOP (Byte 1)',
        instruction: 'LOOP ADD_LOOP (AL=[SI]+[DI]+CF)',
        machineCode: 'E2 F2',
        modifiedRegs: ['AX', 'CX', 'SI', 'DI', 'BX', 'IP'],
        registers: { AX: '1001H', BX: '000AH', CX: '0002H', DX: '0000H', SI: '0002H', DI: '0006H', SP: '0100H', BP: '0000H', IP: '001EH' },
        flags: { CF: '1', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '1' },
        memoryAction: 'ALU: FEH + 02H + Carry(1) = 101H -> AL=01H, CF=1; WRITE [DS:0009H] <- 01H',
        description: 'Executes Byte 1 addition: FEH + 02H + 1 = 101H. Sum byte 01H stored at [DS:0009H], Carry Flag remains 1.'
      },
      {
        stepNum: 13,
        label: 'ADD_LOOP (Bytes 2 & 3)',
        instruction: 'LOOP ADD_LOOP (Remaining Bytes)',
        machineCode: 'E2 F2',
        modifiedRegs: ['AX', 'CX', 'SI', 'DI', 'BX', 'IP'],
        registers: { AX: '1001H', BX: '000CH', CX: '0000H', DX: '0000H', SI: '0004H', DI: '0008H', SP: '0100H', BP: '0000H', IP: '0020H' },
        flags: { CF: '1', ZF: '1', SF: '0', OF: '0', PF: '1', AF: '1' },
        memoryAction: 'Memory [DS:0008H..000BH] now contains: 00H 01H 01H 01H. Final Carry CF=1.',
        description: 'Completes addition for Byte 2 (FD+03+1=01H CF=1) and Byte 3 (FC+04+1=01H CF=1). CX reaches 0, loop terminates.'
      },
      {
        stepNum: 14,
        instruction: 'MOV AL, 0; ADC AL, 0; MOV FINAL_CARRY, AL',
        machineCode: 'B0 00 14 00 A2 0C 00',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '1001H', BX: '000CH', CX: '0000H', DX: '0000H', SI: '0004H', DI: '0008H', SP: '0100H', BP: '0000H', IP: '0027H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'WRITE [DS:000CH] <- 01H (Final carry preserved in memory)',
        description: 'Captures final Carry Flag into AL using ADC AL, 0 (0 + 0 + 1 = 1) and writes to FINAL_CARRY.'
      },
      {
        stepNum: 15,
        label: 'SUBTRACTION ROUTINE',
        instruction: 'SUB_LOOP: MOV AL, [SI]; SBB AL, [DI]; MOV [BX], AL; LOOP',
        machineCode: '8A 04 1A 05 88 07 E2',
        modifiedRegs: ['AX', 'CX', 'SI', 'DI', 'BX', 'IP'],
        registers: { AX: '10F8H', BX: '0011H', CX: '0000H', DX: '0000H', SI: '0004H', DI: '0008H', SP: '0100H', BP: '0000H', IP: '003DH' },
        flags: { CF: '0', ZF: '0', SF: '1', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'Memory [DS:000DH..0010H] stores SUB_RESULT: EEH FCH FAH F8H. Final Borrow=00H.',
        description: 'Executes byte-by-byte subtraction with borrow (SBB). Calculates FF-01=EEH, FE-02=FCH, FD-03=FAH, FC-04=F8H.'
      },
      {
        stepNum: 16,
        label: 'EXIT',
        instruction: 'MOV AX, 4C00H; INT 21H',
        machineCode: 'B8 00 4C CD 21',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '4C00H', BX: '0011H', CX: '0000H', DX: '0000H', SI: '0004H', DI: '0008H', SP: '0100H', BP: '0000H', IP: '0042H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'DOS Interrupt 21H Service 4CH terminates execution',
        description: 'Calls MS-DOS terminate process service (INT 21H, AH=4CH). Control returns safely to DOSBox prompt.'
      }
    ]
  },
  exp2: {
    expId: 'exp2',
    title: 'Exp 1B: Multiplication & Division of Signed/Unsigned Hexadecimal Numbers',
    dosboxSteps: [
      { step: 1, command: 'MOUNT C C:\\MASM611\nC:', purpose: 'Mount MASM environment in DOSBox.', outputSample: 'Drive C is mounted as local directory' },
      { step: 2, command: 'MASM EXP1B.ASM;', purpose: 'Assemble 16-bit MUL/DIV program.', outputSample: '0 Warning Errors\n0 Severe Errors' },
      { step: 3, command: 'LINK EXP1B.OBJ;', purpose: 'Link object file.', outputSample: 'LINK : warning L4021: no stack segment' },
      { step: 4, command: 'DEBUG EXP1B.EXE', purpose: 'Trace MUL, IMUL, DIV, IDIV execution.', outputSample: '-t (Step through MUL & DIV instructions)' }
    ],
    steps: [
      {
        stepNum: 1,
        instruction: 'MOV AX, @DATA; MOV DS, AX',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '1000H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0005H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'Initialize Data Segment DS = 1000H',
        description: 'Initializes Data Segment DS to enable accessing operands in memory.'
      },
      {
        stepNum: 2,
        label: 'UNSIGNED MUL',
        instruction: 'MOV AX, VAL1 (0A12H)',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '0A12H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0008H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'READ [DS:0000H] -> AX = 0A12H (2578 decimal)',
        description: 'Loads 16-bit multiplicand VAL1 (0A12H) into accumulator AX.'
      },
      {
        stepNum: 3,
        instruction: 'MUL VAL2 (0050H)',
        modifiedRegs: ['AX', 'DX', 'IP'],
        registers: { AX: '25A0H', BX: '0000H', CX: '0000H', DX: '0003H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '000CH' },
        flags: { CF: '1', ZF: '0', SF: '0', OF: '1', PF: '0', AF: '0' },
        memoryAction: 'ALU: 0A12H (2578) * 0050H (80) = 206,240 = 000325A0H in DX:AX',
        description: 'Performs unsigned 16-bit multiplication. DX holds high word (0003H) and AX holds low word (25A0H). OF/CF=1 since product > 16 bits.'
      },
      {
        stepNum: 4,
        instruction: 'MOV U_PROD_L, AX; MOV U_PROD_H, DX',
        modifiedRegs: ['IP'],
        registers: { AX: '25A0H', BX: '0000H', CX: '0000H', DX: '0003H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0012H' },
        flags: { CF: '1', ZF: '0', SF: '0', OF: '1', PF: '0', AF: '0' },
        memoryAction: 'WRITE [DS:0004H] <- 25A0H, [DS:0006H] <- 0003H',
        description: 'Stores 32-bit unsigned product DX:AX into memory variables U_PROD_L and U_PROD_H.'
      },
      {
        stepNum: 5,
        label: 'SIGNED MUL',
        instruction: 'MOV AX, S_VAL1 (-25 = FFE7H); IMUL S_VAL2 (+5 = 0005H)',
        modifiedRegs: ['AX', 'DX', 'IP'],
        registers: { AX: 'FF83H', BX: '0000H', CX: '0000H', DX: 'FFFFH', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '001AH' },
        flags: { CF: '0', ZF: '0', SF: '1', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'ALU: (-25) * (+5) = -125 = FFFFFF83H in DX:AX',
        description: 'Performs signed 2\'s complement multiplication. DX=FFFFH, AX=FF83H. Result is -125 decimal.'
      },
      {
        stepNum: 6,
        label: 'UNSIGNED DIV',
        instruction: 'MOV AX, VAL1 (0A12H); XOR DX, DX; DIV VAL2 (0050H)',
        modifiedRegs: ['AX', 'DX', 'IP'],
        registers: { AX: '0020H', BX: '0000H', CX: '0000H', DX: '0012H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0024H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'ALU: 00000A12H (2578) / 0050H (80) -> Quotient AX=0020H (32), Remainder DX=0012H (18)',
        description: 'Unsigned 16-bit division: DX is cleared first. Quotient 32 decimal (0020H) in AX; Remainder 18 decimal (0012H) in DX.'
      },
      {
        stepNum: 7,
        label: 'SIGNED DIV',
        instruction: 'MOV AX, S_VAL1 (-25 = FFE7H); CWD; IDIV S_VAL2 (+5 = 0005H)',
        modifiedRegs: ['AX', 'DX', 'IP'],
        registers: { AX: 'FFFBH', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '002EH' },
        flags: { CF: '0', ZF: '0', SF: '1', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'CWD sign-extends FFE7H to FFFF:FFE7H; IDIV computes -25 / 5 = -5 (FFFBH)',
        description: 'CWD converts word AX into doubleword DX:AX. IDIV produces signed quotient AX = -5 (FFFBH) and remainder DX = 0000H.'
      },
      {
        stepNum: 8,
        label: 'EXIT',
        instruction: 'MOV AX, 4C00H; INT 21H',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '4C00H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0033H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'DOS Interrupt 21H Service 4CH terminates execution',
        description: 'Terminates program cleanly and returns control to DOS environment.'
      }
    ]
  },
  exp_math: {
    expId: 'exp_math',
    title: 'Exp 1C: Square, Cube & Factorial of a Number',
    dosboxSteps: [
      { step: 1, command: 'MOUNT C C:\\MASM611\nC:', purpose: 'Mount MASM environment in DOSBox.', outputSample: 'Drive C is mounted' },
      { step: 2, command: 'MASM EXP1C.ASM;', purpose: 'Assemble Math program.', outputSample: '0 Errors' },
      { step: 3, command: 'LINK EXP1C.OBJ;', purpose: 'Link object module.', outputSample: 'EXP1C.EXE created' },
      { step: 4, command: 'DEBUG EXP1C.EXE', purpose: 'Trace square, cube, factorial calculation.', outputSample: '-r\n-g\n-d DS:0000 0010' }
    ],
    steps: [
      {
        stepNum: 1,
        instruction: 'MOV AX, @DATA; MOV DS, AX',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '1000H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0005H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'Data Segment initialized',
        description: 'Initializes DS register to point to data segment.'
      },
      {
        stepNum: 2,
        label: 'SQUARE (N=5)',
        instruction: 'MOV AL, NUM (05H); XOR AH, AH; MUL AL',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '0019H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '000BH' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'ALU: 5 * 5 = 25 (0019H); WRITE SQUARE [DS:0001H] <- 0019H',
        description: 'Computes Square: AL × AL = 5 × 5 = 25 (0019H) in AX. Stored into SQUARE memory variable.'
      },
      {
        stepNum: 3,
        label: 'CUBE',
        instruction: 'MOV BX, AX (0019H); MOV AL, NUM (05H); XOR AH, AH; MUL BX',
        modifiedRegs: ['AX', 'BX', 'DX', 'IP'],
        registers: { AX: '007DH', BX: '0019H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0014H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'ALU: 25 * 5 = 125 (007DH); WRITE CUBE [DS:0003H] <- 007DH',
        description: 'Computes Cube: Square (25) × N (5) = 125 (007DH) in AX. Stored into CUBE memory variable.'
      },
      {
        stepNum: 4,
        label: 'FACTORIAL INIT',
        instruction: 'MOV AX, 0001H; MOV CX, 0005H',
        modifiedRegs: ['AX', 'CX', 'IP'],
        registers: { AX: '0001H', BX: '0019H', CX: '0005H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '001AH' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'Set factorial product accumulator AX=1, loop count CX=5',
        description: 'Initializes factorial accumulator AX to 1 (multiplicative identity) and loop counter CX to N=5.'
      },
      {
        stepNum: 5,
        label: 'FACT LOOP (CX=5, 4, 3, 2, 1)',
        instruction: 'FACT_LOOP: MUL CX; LOOP FACT_LOOP',
        modifiedRegs: ['AX', 'CX', 'DX', 'IP'],
        registers: { AX: '0078H', BX: '0019H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0020H' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'Iterative Multiplication: 1 * 5 * 4 * 3 * 2 * 1 = 120 (0078H); WRITE FACT [DS:0005H] <- 0078H',
        description: 'Multiplies AX successively by 5, 4, 3, 2, 1. Final result AX = 120 decimal (0078H). Stored into FACT.'
      },
      {
        stepNum: 6,
        label: 'EXIT',
        instruction: 'MOV AX, 4C00H; INT 21H',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '4C00H', BX: '0019H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0025H' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'DOS Interrupt 21H Service 4CH terminates execution',
        description: 'Returns cleanly to MS-DOS environment.'
      }
    ]
  },
  exp_bit1: {
    expId: 'exp_bit1',
    title: 'Exp 2A: Positive or Negative Data Check',
    dosboxSteps: [
      { step: 1, command: 'MOUNT C C:\\MASM611\nC:', purpose: 'Mount MASM environment in DOSBox.', outputSample: 'Drive C mounted' },
      { step: 2, command: 'MASM EXP2A.ASM;', purpose: 'Assemble sign evaluation program.', outputSample: '0 Errors' },
      { step: 3, command: 'LINK EXP2A.OBJ;', purpose: 'Link object file.', outputSample: 'EXP2A.EXE created' },
      { step: 4, command: 'DEBUG EXP2A.EXE', purpose: 'Trace TEST and JS conditional branching.', outputSample: '-t (Observe Sign Flag SF=1)' }
    ],
    steps: [
      {
        stepNum: 1,
        instruction: 'MOV AX, @DATA; MOV DS, AX',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '1000H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0005H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'Data Segment initialized',
        description: 'Initializes Data Segment register DS.'
      },
      {
        stepNum: 2,
        instruction: 'MOV AL, DATA_VAL (0D3H)',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '10D3H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0007H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'READ [DS:0000H] -> AL = D3H (11010011B)',
        description: 'Loads test byte D3H into AL. In binary: 11010011B (Bit 7 / MSB is 1).'
      },
      {
        stepNum: 3,
        instruction: 'TEST AL, 80H',
        modifiedRegs: ['IP'],
        registers: { AX: '10D3H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0009H' },
        flags: { CF: '0', ZF: '0', SF: '1', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'ALU bitwise AND: 11010011B AND 10000000B = 10000000B (Non-zero, MSB=1 -> SF=1)',
        description: 'TEST performs bitwise AND with 80H (10000000B). Because Bit 7 is 1, Sign Flag SF becomes 1, ZF=0. AL remains unchanged.'
      },
      {
        stepNum: 4,
        instruction: 'JS IS_NEGATIVE',
        modifiedRegs: ['IP'],
        registers: { AX: '10D3H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0010H' },
        flags: { CF: '0', ZF: '0', SF: '1', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'Conditional Branch: SF=1 -> JUMP TAKEN to label IS_NEGATIVE',
        description: 'JS (Jump on Sign) inspects SF. Since SF=1, branch is taken to IS_NEGATIVE.'
      },
      {
        stepNum: 5,
        label: 'IS_NEGATIVE',
        instruction: 'MOV RESULT, 01H (Negative indicator)',
        modifiedRegs: ['IP'],
        registers: { AX: '10D3H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0015H' },
        flags: { CF: '0', ZF: '0', SF: '1', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'WRITE [DS:0001H] <- 01H (Result=01H indicates Negative number)',
        description: 'Writes 01H to RESULT in memory, confirming data is Negative.'
      },
      {
        stepNum: 6,
        label: 'EXIT',
        instruction: 'MOV AX, 4C00H; INT 21H',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '4C00H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '001AH' },
        flags: { CF: '0', ZF: '0', SF: '1', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'DOS Interrupt 21H Service 4CH terminates execution',
        description: 'Terminates program cleanly.'
      }
    ]
  },
  exp_bit2: {
    expId: 'exp_bit2',
    title: 'Exp 2B: Even or Odd Number Check',
    dosboxSteps: [
      { step: 1, command: 'MOUNT C C:\\MASM611\nC:', purpose: 'Mount MASM environment in DOSBox.', outputSample: 'Drive C mounted' },
      { step: 2, command: 'MASM EXP2B.ASM;', purpose: 'Assemble parity check program.', outputSample: '0 Errors' },
      { step: 3, command: 'LINK EXP2B.OBJ;', purpose: 'Link object file.', outputSample: 'EXP2B.EXE created' },
      { step: 4, command: 'DEBUG EXP2B.EXE', purpose: 'Trace TEST AL, 01H and JZ instruction.', outputSample: '-t (Observe Zero Flag ZF=0 for Odd)' }
    ],
    steps: [
      {
        stepNum: 1,
        instruction: 'MOV AX, @DATA; MOV DS, AX',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '1000H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0005H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'Data Segment initialized',
        description: 'Initializes Data Segment register DS.'
      },
      {
        stepNum: 2,
        instruction: 'MOV AL, NUM (2FH)',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '102FH', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0007H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'READ [DS:0000H] -> AL = 2FH (00101111B)',
        description: 'Loads 2FH (47 decimal) into AL. LSB (Bit 0) is 1.'
      },
      {
        stepNum: 3,
        instruction: 'TEST AL, 01H',
        modifiedRegs: ['IP'],
        registers: { AX: '102FH', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0009H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'ALU bitwise AND: 00101111B AND 00000001B = 00000001B -> ZF=0',
        description: 'Tests Bit 0. Since Bit 0 is 1, result is non-zero, so Zero Flag ZF=0 (indicating Odd number).'
      },
      {
        stepNum: 4,
        instruction: 'JZ IS_EVEN; MOV RESULT, 01H (Odd indicator)',
        modifiedRegs: ['IP'],
        registers: { AX: '102FH', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0010H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'Branch NOT taken (ZF=0). WRITE [DS:0001H] <- 01H (Odd number detected)',
        description: 'JZ is not taken. Writes 01H into RESULT to record that the number is Odd.'
      },
      {
        stepNum: 5,
        label: 'EXIT',
        instruction: 'MOV AX, 4C00H; INT 21H',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '4C00H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0015H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'DOS Interrupt 21H terminates process',
        description: 'Clean return to DOS.'
      }
    ]
  },
  exp_bit3: {
    expId: 'exp_bit3',
    title: 'Exp 2C: Count 1s and 0s in a Byte',
    dosboxSteps: [
      { step: 1, command: 'MOUNT C C:\\MASM611\nC:', purpose: 'Mount MASM environment in DOSBox.', outputSample: 'Drive C mounted' },
      { step: 2, command: 'MASM EXP2C.ASM;', purpose: 'Assemble bit count program.', outputSample: '0 Errors' },
      { step: 3, command: 'LINK EXP2C.OBJ;', purpose: 'Link object file.', outputSample: 'EXP2C.EXE created' },
      { step: 4, command: 'DEBUG EXP2C.EXE', purpose: 'Trace 8 iterations of SHR AL, 1 and JC.', outputSample: '-t (Observe BL and BH counters)' }
    ],
    steps: [
      {
        stepNum: 1,
        instruction: 'MOV AX, @DATA; MOV DS, AX; MOV AL, 0A5H; MOV CX, 8',
        modifiedRegs: ['AX', 'CX', 'IP'],
        registers: { AX: '10A5H', BX: '0000H', CX: '0008H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '000AH' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'AL = A5H (10100101B), Counter CX = 8 (for 8 bits)',
        description: 'Loads test byte A5H (10100101B in binary) and sets loop counter CX=8.'
      },
      {
        stepNum: 2,
        instruction: 'XOR BL, BL; XOR BH, BH',
        modifiedRegs: ['BX', 'IP'],
        registers: { AX: '10A5H', BX: '0000H', CX: '0008H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '000EH' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'BL = 0 (1s counter), BH = 0 (0s counter)',
        description: 'Clears BL (to count 1-bits) and BH (to count 0-bits).'
      },
      {
        stepNum: 3,
        label: 'BIT SHIFT LOOP (8 Cycles)',
        instruction: 'SHIFT_LOOP: SHR AL, 1; JC COUNT_1; INC BH; JMP NEXT_BIT',
        modifiedRegs: ['AX', 'BX', 'CX', 'IP'],
        registers: { AX: '1000H', BX: '0404H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0020H' },
        flags: { CF: '1', ZF: '1', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: '8 shifts completed: 10100101B contains 4 ones and 4 zeros. BL=04H, BH=04H.',
        description: 'Shifts each bit into Carry Flag CF. If CF=1 -> INC BL (1s). If CF=0 -> INC BH (0s). Final counts: 4 ones, 4 zeros.'
      },
      {
        stepNum: 4,
        instruction: 'MOV ONES_COUNT, BL; MOV ZEROS_COUNT, BH',
        modifiedRegs: ['IP'],
        registers: { AX: '1000H', BX: '0404H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0026H' },
        flags: { CF: '1', ZF: '1', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'WRITE [DS:0001H] <- 04H (ONES), WRITE [DS:0002H] <- 04H (ZEROS)',
        description: 'Saves bit counts into memory variables ONES_COUNT and ZEROS_COUNT.'
      },
      {
        stepNum: 5,
        label: 'EXIT',
        instruction: 'MOV AX, 4C00H; INT 21H',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '4C00H', BX: '0404H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '002BH' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'DOS Interrupt 21H Service 4CH terminates execution',
        description: 'Exits cleanly.'
      }
    ]
  },
  exp_arr1: {
    expId: 'exp_arr1',
    title: 'Exp 3A: Addition & Subtraction of N Numbers',
    dosboxSteps: [
      { step: 1, command: 'MOUNT C C:\\MASM611\nC:', purpose: 'Mount MASM environment in DOSBox.', outputSample: 'Drive C mounted' },
      { step: 2, command: 'MASM EXP3A.ASM;', purpose: 'Assemble array arithmetic program.', outputSample: '0 Errors' },
      { step: 3, command: 'LINK EXP3A.OBJ;', purpose: 'Link object file.', outputSample: 'EXP3A.EXE created' },
      { step: 4, command: 'DEBUG EXP3A.EXE', purpose: 'Trace array summation loop and pointer SI.', outputSample: '-t (Trace ADD AL, [SI] and INC SI)' }
    ],
    steps: [
      {
        stepNum: 1,
        instruction: 'MOV AX, @DATA; MOV DS, AX; LEA SI, ARRAY; MOV CX, 5',
        modifiedRegs: ['AX', 'SI', 'CX', 'IP'],
        registers: { AX: '1000H', BX: '0000H', CX: '0005H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '000AH' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'SI = offset of ARRAY (10H, 20H, 30H, 40H, 50H), CX = 5',
        description: 'Initializes Data Segment DS, loads array base offset into SI, and sets loop counter CX=5.'
      },
      {
        stepNum: 2,
        label: 'SUMMATION LOOP',
        instruction: 'XOR AL, AL; ADD_LOOP: ADD AL, [SI]; INC SI; LOOP ADD_LOOP',
        modifiedRegs: ['AX', 'SI', 'CX', 'IP'],
        registers: { AX: '10F0H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0005H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0015H' },
        flags: { CF: '0', ZF: '1', SF: '1', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'ALU: 10H + 20H + 30H + 40H + 50H = F0H (240 decimal); WRITE SUM [DS:0007H] <- F0H',
        description: 'Iterates through all 5 array elements, adding each byte to AL. Result is F0H (240 decimal).'
      },
      {
        stepNum: 3,
        label: 'SUBTRACTION LOOP',
        instruction: 'LEA SI, ARRAY; MOV CX, 4; MOV AL, [SI]; SUB_LOOP: INC SI; SUB AL, [SI]; LOOP',
        modifiedRegs: ['AX', 'SI', 'CX', 'IP'],
        registers: { AX: '1030H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0005H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0024H' },
        flags: { CF: '1', ZF: '0', SF: '0', OF: '0', PF: '1', AF: '1' },
        memoryAction: 'ALU: 10H - 20H - 30H - 40H - 50H = 30H (with borrow); WRITE DIFF [DS:0008H] <- 30H',
        description: 'Performs successive subtraction across the array elements and saves result into DIFF.'
      },
      {
        stepNum: 4,
        label: 'EXIT',
        instruction: 'MOV AX, 4C00H; INT 21H',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '4C00H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0005H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0029H' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'DOS Interrupt 21H terminates process',
        description: 'Clean exit to DOS.'
      }
    ]
  },
  exp3: {
    expId: 'exp3',
    title: 'Exp 3B: Largest & Smallest Number in an Array',
    dosboxSteps: [
      { step: 1, command: 'MOUNT C C:\\MASM611\nC:', purpose: 'Mount MASM environment in DOSBox.', outputSample: 'Drive C mounted' },
      { step: 2, command: 'MASM EXP3B.ASM;', purpose: 'Assemble Min/Max search program.', outputSample: '0 Errors' },
      { step: 3, command: 'LINK EXP3B.OBJ;', purpose: 'Link object file.', outputSample: 'EXP3B.EXE created' },
      { step: 4, command: 'DEBUG EXP3B.EXE', purpose: 'Trace CMP AL, [SI] and JA/JB conditional jumps.', outputSample: '-t (Trace AL=Max and AH=Min candidate)' }
    ],
    steps: [
      {
        stepNum: 1,
        instruction: 'MOV AX, @DATA; MOV DS, AX; LEA SI, ARRAY; MOV CX, 6',
        modifiedRegs: ['AX', 'SI', 'CX', 'IP'],
        registers: { AX: '1000H', BX: '0000H', CX: '0006H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '000AH' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'Array: 25H, 4AH, 12H, 8BH, 05H, 92H, 31H (7 elements, CX = N - 1 = 6)',
        description: 'Loads array pointer into SI and sets loop counter CX to N - 1 = 6.'
      },
      {
        stepNum: 2,
        instruction: 'MOV AL, [SI]; MOV AH, AL; INC SI',
        modifiedRegs: ['AX', 'SI', 'IP'],
        registers: { AX: '2525H', BX: '0000H', CX: '0006H', DX: '0000H', SI: '0001H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0010H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'AL = 25H (Initial Max), AH = 25H (Initial Min), SI advances to 2nd element',
        description: 'Initializes AL (Max) and AH (Min) with the first array element 25H.'
      },
      {
        stepNum: 3,
        label: 'MIN/MAX SCAN LOOP',
        instruction: 'SCAN_LOOP: CMP AL, [SI]; JAE CHK_MIN; MOV AL, [SI]; CHK_MIN: CMP AH, [SI]; JBE NEXT; MOV AH, [SI]; NEXT: INC SI; LOOP',
        modifiedRegs: ['AX', 'SI', 'CX', 'IP'],
        registers: { AX: '0592H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0007H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '002AH' },
        flags: { CF: '1', ZF: '0', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'Scan complete: Largest = 92H (stored in AL), Smallest = 05H (stored in AH)',
        description: 'Compares each element against current Max (AL) and Min (AH), updating candidates when new extrema are encountered.'
      },
      {
        stepNum: 4,
        instruction: 'MOV MAX_VAL, AL; MOV MIN_VAL, AH',
        modifiedRegs: ['IP'],
        registers: { AX: '0592H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0007H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0030H' },
        flags: { CF: '1', ZF: '0', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'WRITE MAX_VAL [DS:0007H] <- 92H, WRITE MIN_VAL [DS:0008H] <- 05H',
        description: 'Stores 92H in MAX_VAL and 05H in MIN_VAL.'
      },
      {
        stepNum: 5,
        label: 'EXIT',
        instruction: 'MOV AX, 4C00H; INT 21H',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '4C00H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0007H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0035H' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'DOS Interrupt 21H terminates process',
        description: 'Clean exit to DOS.'
      }
    ]
  },
  exp4: {
    expId: 'exp4',
    title: 'Exp 3C: Ascending & Descending Sort (Bubble Sort)',
    dosboxSteps: [
      { step: 1, command: 'MOUNT C C:\\MASM611\nC:', purpose: 'Mount MASM environment in DOSBox.', outputSample: 'Drive C mounted' },
      { step: 2, command: 'MASM EXP3C.ASM;', purpose: 'Assemble Bubble Sort program.', outputSample: '0 Errors' },
      { step: 3, command: 'LINK EXP3C.OBJ;', purpose: 'Link object file.', outputSample: 'EXP3C.EXE created' },
      { step: 4, command: 'DEBUG EXP3C.EXE', purpose: 'Trace adjacent element swapping in nested loops.', outputSample: '-d DS:0000 0010 (Inspect sorted memory array)' }
    ],
    steps: [
      {
        stepNum: 1,
        instruction: 'MOV AX, @DATA; MOV DS, AX',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '1000H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0005H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'Array input: 88H, 11H, 55H, 22H, 44H (5 elements)',
        description: 'Initializes Data Segment.'
      },
      {
        stepNum: 2,
        label: 'OUTER LOOP (N-1 = 4 Passes)',
        instruction: 'MOV CX, 0004H (Outer pass counter)',
        modifiedRegs: ['CX', 'IP'],
        registers: { AX: '1000H', BX: '0000H', CX: '0004H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0008H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'Outer loop pass counter initialized to 4',
        description: 'Bubble sort requires N - 1 = 4 outer passes to guarantee complete ordering.'
      },
      {
        stepNum: 3,
        label: 'PASS 1 (Adjacent Swapping)',
        instruction: 'MOV AL, [SI]; CMP AL, [SI+1]; JBE NO_SWAP; XCHG / SWAP',
        modifiedRegs: ['AX', 'DX', 'SI', 'IP'],
        registers: { AX: '1088H', BX: '0000H', CX: '0004H', DX: '0004H', SI: '0004H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '001CH' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'Pass 1 complete: 88H bubbles to end -> [11H, 55H, 22H, 44H, 88H]',
        description: 'Compares adjacent pairs. Swaps out-of-order elements so largest value 88H bubbles to the last position.'
      },
      {
        stepNum: 4,
        label: 'PASSES 2, 3 & 4',
        instruction: 'NESTED LOOP COMPLETION: All passes executed',
        modifiedRegs: ['AX', 'CX', 'DX', 'SI', 'IP'],
        registers: { AX: '1044H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '002AH' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'Sorted Array in RAM: 11H, 22H, 44H, 55H, 88H',
        description: 'Remaining passes complete all comparisons. Array is now in strictly ascending order: 11H, 22H, 44H, 55H, 88H.'
      },
      {
        stepNum: 5,
        label: 'EXIT',
        instruction: 'MOV AX, 4C00H; INT 21H',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '4C00H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '002FH' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'DOS Interrupt 21H terminates process',
        description: 'Clean exit to DOS.'
      }
    ]
  },
  exp_str1: {
    expId: 'exp_str1',
    title: 'Exp 4A: String Length Calculation',
    dosboxSteps: [
      { step: 1, command: 'MOUNT C C:\\MASM611\nC:', purpose: 'Mount MASM environment in DOSBox.', outputSample: 'Drive C mounted' },
      { step: 2, command: 'MASM EXP4A.ASM;', purpose: 'Assemble String Length program.', outputSample: '0 Errors' },
      { step: 3, command: 'LINK EXP4A.OBJ;', purpose: 'Link object file.', outputSample: 'EXP4A.EXE created' },
      { step: 4, command: 'DEBUG EXP4A.EXE', purpose: 'Trace SCASB or byte scan loop checking for terminal character $.', outputSample: '-r (Observe counter CX)' }
    ],
    steps: [
      {
        stepNum: 1,
        instruction: 'MOV AX, @DATA; MOV DS, AX; LEA SI, STRING',
        modifiedRegs: ['AX', 'SI', 'IP'],
        registers: { AX: '1000H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0008H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'String in memory: \'KUPPAM$\' (Terminated by $ = 24H)',
        description: 'Initializes DS and points SI to string \'KUPPAM$\'.'
      },
      {
        stepNum: 2,
        instruction: 'MOV CX, 0000H (Initialize length counter)',
        modifiedRegs: ['CX', 'IP'],
        registers: { AX: '1000H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '000BH' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'Length accumulator CX = 0',
        description: 'Sets character counter CX to 0.'
      },
      {
        stepNum: 3,
        label: 'SCAN LOOP',
        instruction: 'SCAN_LOOP: CMP BYTE PTR [SI], \'$\'; JE DONE; INC SI; INC CX; JMP SCAN_LOOP',
        modifiedRegs: ['CX', 'SI', 'IP'],
        registers: { AX: '1000H', BX: '0000H', CX: '0006H', DX: '0000H', SI: '0006H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '001CH' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'Scanned 6 characters: \'K\', \'U\', \'P\', \'P\', \'A\', \'M\'. Encountered \'$\' at offset 6 -> Zero Flag ZF=1',
        description: 'Scans until \'$\' delimiter is found. Counter CX increments for each character, reaching 6 (0006H).'
      },
      {
        stepNum: 4,
        instruction: 'MOV LENGTH, CX',
        modifiedRegs: ['IP'],
        registers: { AX: '1000H', BX: '0000H', CX: '0006H', DX: '0000H', SI: '0006H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0020H' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'WRITE LENGTH [DS:0008H] <- 0006H',
        description: 'Stores calculated string length 6 into memory variable LENGTH.'
      },
      {
        stepNum: 5,
        label: 'EXIT',
        instruction: 'MOV AX, 4C00H; INT 21H',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '4C00H', BX: '0000H', CX: '0006H', DX: '0000H', SI: '0006H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0025H' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'DOS Interrupt 21H terminates process',
        description: 'Clean exit to DOS.'
      }
    ]
  },
  exp_str2: {
    expId: 'exp_str2',
    title: 'Exp 4B: String Display on Monitor',
    dosboxSteps: [
      { step: 1, command: 'MOUNT C C:\\MASM611\nC:', purpose: 'Mount MASM environment in DOSBox.', outputSample: 'Drive C mounted' },
      { step: 2, command: 'MASM EXP4B.ASM;', purpose: 'Assemble String Display program.', outputSample: '0 Errors' },
      { step: 3, command: 'LINK EXP4B.OBJ;', purpose: 'Link object file.', outputSample: 'EXP4B.EXE created' },
      { step: 4, command: 'EXP4B.EXE', purpose: 'Run the program to see string output on DOS console.', outputSample: 'HELLO FROM 8086' }
    ],
    steps: [
      {
        stepNum: 1,
        instruction: 'MOV AX, @DATA; MOV DS, AX',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '1000H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0005H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'String in memory: \'HELLO FROM 8086$\'',
        description: 'Initializes Data Segment.'
      },
      {
        stepNum: 2,
        instruction: 'LEA DX, MSG (Offset address)',
        modifiedRegs: ['DX', 'IP'],
        registers: { AX: '1000H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0009H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'DX points to start of $-terminated string at DS:0000H',
        description: 'Loads string pointer into DX register as required by DOS INT 21H Service 09H.'
      },
      {
        stepNum: 3,
        instruction: 'MOV AH, 09H; INT 21H',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '0924H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '000DH' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'Console Video Output: "HELLO FROM 8086" rendered on screen buffer',
        description: 'DOS Function 09H prints characters until \'$\' (ASCII 24H) is reached.'
      },
      {
        stepNum: 4,
        label: 'EXIT',
        instruction: 'MOV AX, 4C00H; INT 21H',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '4C00H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0012H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'DOS Interrupt 21H terminates process',
        description: 'Clean exit to DOS.'
      }
    ]
  },
  exp_str3: {
    expId: 'exp_str3',
    title: 'Exp 4C: String Comparison (Equal / Not Equal)',
    dosboxSteps: [
      { step: 1, command: 'MOUNT C C:\\MASM611\nC:', purpose: 'Mount MASM environment in DOSBox.', outputSample: 'Drive C mounted' },
      { step: 2, command: 'MASM EXP4C.ASM;', purpose: 'Assemble String Comparison program.', outputSample: '0 Errors' },
      { step: 3, command: 'LINK EXP4C.OBJ;', purpose: 'Link object file.', outputSample: 'EXP4C.EXE created' },
      { step: 4, command: 'DEBUG EXP4C.EXE', purpose: 'Trace REPE CMPSB instruction and Zero Flag ZF.', outputSample: '-t (Trace CMPSB comparing ES:DI with DS:SI)' }
    ],
    steps: [
      {
        stepNum: 1,
        instruction: 'MOV AX, @DATA; MOV DS, AX; MOV ES, AX',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '1000H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0007H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'DS = 1000H, ES = 1000H (Both segments initialized for CMPSB)',
        description: 'CMPSB compares DS:SI with ES:DI. Both DS and ES are initialized.'
      },
      {
        stepNum: 2,
        instruction: 'LEA SI, STR1; LEA DI, STR2; MOV CX, 5; CLD',
        modifiedRegs: ['SI', 'DI', 'CX', 'IP'],
        registers: { AX: '1000H', BX: '0000H', CX: '0005H', DX: '0000H', SI: '0000H', DI: '0006H', SP: '0100H', BP: '0000H', IP: '0012H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'STR1 = \'HELLO\', STR2 = \'HELLO\', CX = 5, DF = 0 (Autoincrement)',
        description: 'Points SI to STR1, DI to STR2, sets character count CX=5, and clears Direction Flag (CLD).'
      },
      {
        stepNum: 3,
        label: 'REPE CMPSB',
        instruction: 'REPE CMPSB (Repeat while Equal)',
        modifiedRegs: ['CX', 'SI', 'DI', 'IP'],
        registers: { AX: '1000H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0005H', DI: '000BH', SP: '0100H', BP: '0000H', IP: '0014H' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'All 5 characters matched: \'H\'==\'H\', \'E\'==\'E\', \'L\'==\'L\', \'L\'==\'L\', \'O\'==\'O\'. ZF=1 (EQUAL)',
        description: 'Compares byte pairs across ES:DI and DS:SI. Since all 5 characters match, CX reaches 0 with Zero Flag ZF=1.'
      },
      {
        stepNum: 4,
        instruction: 'JZ EQUAL; MOV RESULT, 00H (Equal indicator)',
        modifiedRegs: ['IP'],
        registers: { AX: '1000H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0005H', DI: '000BH', SP: '0100H', BP: '0000H', IP: '001AH' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'WRITE RESULT [DS:000CH] <- 00H (Strings Equal)',
        description: 'JZ is taken because ZF=1. Writes 00H to RESULT confirming strings are identical.'
      },
      {
        stepNum: 5,
        label: 'EXIT',
        instruction: 'MOV AX, 4C00H; INT 21H',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '4C00H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0005H', DI: '000BH', SP: '0100H', BP: '0000H', IP: '001FH' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'DOS Interrupt 21H terminates process',
        description: 'Clean exit to DOS.'
      }
    ]
  },
  exp_str4: {
    expId: 'exp_str4',
    title: 'Exp 4D: String Reversal & Palindrome Check',
    dosboxSteps: [
      { step: 1, command: 'MOUNT C C:\\MASM611\nC:', purpose: 'Mount MASM environment in DOSBox.', outputSample: 'Drive C mounted' },
      { step: 2, command: 'MASM EXP4D.ASM;', purpose: 'Assemble Palindrome check program.', outputSample: '0 Errors' },
      { step: 3, command: 'LINK EXP4D.OBJ;', purpose: 'Link object file.', outputSample: 'EXP4D.EXE created' },
      { step: 4, command: 'DEBUG EXP4D.EXE', purpose: 'Trace string reverse copy loop and CMPSB palindrome check.', outputSample: '-d DS:0000 0020 (Inspect REV_STR and RESULT)' }
    ],
    steps: [
      {
        stepNum: 1,
        instruction: 'MOV AX, @DATA; MOV DS, AX; MOV ES, AX',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '1000H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0007H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'STR1 = \'MADAM\' (Length = 5)',
        description: 'Initializes Data and Extra segment registers.'
      },
      {
        stepNum: 2,
        label: 'REVERSE STRING LOOP',
        instruction: 'LEA SI, STR1+4; LEA DI, REV_STR; MOV CX, 5; REV_LOOP: MOV AL, [SI]; MOV [DI], AL; DEC SI; INC DI; LOOP',
        modifiedRegs: ['AX', 'SI', 'DI', 'CX', 'IP'],
        registers: { AX: '104DH', BX: '0000H', CX: '0000H', DX: '0000H', SI: 'FFFFH', DI: '000BH', SP: '0100H', BP: '0000H', IP: '001CH' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'Reversed string in buffer: REV_STR = \'MADAM\'',
        description: 'Copies STR1 backwards from end to start into REV_STR.'
      },
      {
        stepNum: 3,
        label: 'PALINDROME CHECK',
        instruction: 'LEA SI, STR1; LEA DI, REV_STR; MOV CX, 5; CLD; REPE CMPSB',
        modifiedRegs: ['SI', 'DI', 'CX', 'IP'],
        registers: { AX: '104DH', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0005H', DI: '000BH', SP: '0100H', BP: '0000H', IP: '0026H' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'REPE CMPSB matched all 5 characters: ZF=1 (PALINDROME)',
        description: 'Compares STR1 and REV_STR. All characters match, confirming that \'MADAM\' is a palindrome.'
      },
      {
        stepNum: 4,
        instruction: 'JZ IS_PALIN; MOV RESULT, 00H (Palindrome indicator)',
        modifiedRegs: ['IP'],
        registers: { AX: '104DH', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0005H', DI: '000BH', SP: '0100H', BP: '0000H', IP: '002CH' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'WRITE RESULT [DS:000CH] <- 00H (Is Palindrome)',
        description: 'Stores 00H into RESULT to record that the string is a Palindrome.'
      },
      {
        stepNum: 5,
        label: 'EXIT',
        instruction: 'MOV AX, 4C00H; INT 21H',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '4C00H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0005H', DI: '000BH', SP: '0100H', BP: '0000H', IP: '0031H' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'DOS Interrupt 21H terminates process',
        description: 'Clean exit to DOS.'
      }
    ]
  },
  exp_clock1: {
    expId: 'exp_clock1',
    title: 'Exp 5A: Digital Clock Design using INT 21H Interrupt',
    dosboxSteps: [
      { step: 1, command: 'MOUNT C C:\\MASM611\nC:\nCD WORK', purpose: 'Mount MASM workspace folder in DOSBox environment.', outputSample: 'Drive C is mounted as local directory C:\\MASM611\nC:\\WORK>' },
      { step: 2, command: 'EDIT EXP5A.ASM', purpose: 'Open source file in MS-DOS Editor with real-time clock INT 21H routines.', outputSample: 'EXP5A.ASM opened with code for AH=2CH Get Time and AH=09H Display.' },
      { step: 3, command: 'MASM EXP5A.ASM;', purpose: 'Assemble EXP5A.ASM using Microsoft Macro Assembler v6.11.', outputSample: 'Microsoft (R) Macro Assembler Version 6.11\n0 Warning Errors\n0 Severe Errors' },
      { step: 4, command: 'LINK EXP5A.OBJ;', purpose: 'Link object file to generate executable EXP5A.EXE.', outputSample: 'Microsoft (R) Segmented-Executable Linker Version 5.31\nLINK : warning L4021: no stack segment' },
      { step: 5, command: 'EXP5A.EXE', purpose: 'Execute real-time digital clock in DOSBox.', outputSample: '=== 8086 DIGITAL CLOCK (INT 21H) ===\nPRESS ANY KEY TO EXIT...\nCURRENT TIME: 10:45:28' }
    ],
    steps: [
      {
        stepNum: 1,
        label: 'INIT_DS',
        instruction: 'MOV AX, DATA_SEG; MOV DS, AX',
        machineCode: 'B8 00 10 8E D8',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '1000H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0005H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'DS initialized to 1000H (Data Segment active)',
        description: 'Loads Data Segment base address into DS register to access string and state variables.'
      },
      {
        stepNum: 2,
        label: 'SHOW_HEADER',
        instruction: 'LEA DX, MSG_EXIT; MOV AH, 09H; INT 21H',
        machineCode: '8D 16 20 00 B4 09 CD 21',
        modifiedRegs: ['AX', 'DX', 'IP'],
        registers: { AX: '0924H', BX: '0000H', CX: '0000H', DX: '0020H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '000DH' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'Console outputs "=== 8086 DIGITAL CLOCK (INT 21H) ==="',
        description: 'Prints program header and instructions to press any key to exit.'
      },
      {
        stepNum: 3,
        label: 'POLL_KEY',
        instruction: 'MOV AH, 0BH; INT 21H; CMP AL, 00H; JNE EXIT_CLOCK',
        machineCode: 'B4 0B CD 21 3C 00 75 42',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '0B00H', BX: '0000H', CX: '0000H', DX: '0020H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0015H' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'Keyboard buffer checked (AL=00H: No key pressed)',
        description: 'Non-blocking keyboard poll. Since AL=00H (no key waiting), execution continues to read clock.'
      },
      {
        stepNum: 4,
        label: 'GET_TIME',
        instruction: 'MOV AH, 2CH; INT 21H',
        machineCode: 'B4 2C CD 21',
        modifiedRegs: ['AX', 'CX', 'DX', 'IP'],
        registers: { AX: '2C00H', BX: '0000H', CX: '0A2DH', DX: '1C00H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0019H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'DOS RTC registers read: CH=0AH (10 Hrs), CL=2DH (45 Mins), DH=1CH (28 Secs)',
        description: 'Queries MS-DOS Real-Time Clock interrupt. Returns dynamic hours, minutes, and seconds in CX and DX.'
      },
      {
        stepNum: 5,
        label: 'CHECK_TICK',
        instruction: 'CMP DH, PREV_SEC; JE CLOCK_LOOP; MOV PREV_SEC, DH',
        machineCode: '3A 16 48 00 74 EC 88 16 48 00',
        modifiedRegs: ['IP'],
        registers: { AX: '2C00H', BX: '0000H', CX: '0A2DH', DX: '1C00H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0023H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'PREV_SEC updated from 0FFH to 1CH (28 seconds)',
        description: 'Detects new second tick (DH=1CH ≠ PREV_SEC). Updates cache and proceeds to format ASCII string.'
      },
      {
        stepNum: 6,
        label: 'CONVERT_HOURS',
        instruction: 'MOV AL, CH; MOV AH, 00H; AAM; ADD AX, 3030H; MOV TIME_STR[14], AH; MOV TIME_STR[15], AL',
        machineCode: '8A C5 B4 00 D4 0A 05 30 30 88 26 0E 00 88 06 0F 00',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '3130H', BX: '0000H', CX: '0A2DH', DX: '1C00H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0034H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'TIME_STR[14..15] = 31H, 30H ("10")',
        description: 'AAM splits 10 into 1 and 0; ADD AX, 3030H yields ASCII "1" (31H) and "0" (30H) for hours.'
      },
      {
        stepNum: 7,
        label: 'CONVERT_MIN_SEC',
        instruction: 'CALL BIN_TO_ASCII (CL=45 -> "45"); CALL BIN_TO_ASCII (DH=28 -> "28")',
        machineCode: 'E8 20 00 88 26 11 00 E8 1A 00 88 26 14 00',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '3238H', BX: '0000H', CX: '0A2DH', DX: '1C00H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0046H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'TIME_STR[17..21] = "45:28"',
        description: 'Converts binary minutes (45) and seconds (28) to ASCII, populating the full "CURRENT TIME: 10:45:28$" string.'
      },
      {
        stepNum: 8,
        label: 'REDRAW_LINE',
        instruction: 'MOV DL, 0DH; MOV AH, 02H; INT 21H; LEA DX, TIME_STR; MOV AH, 09H; INT 21H',
        machineCode: 'B2 0D B4 02 CD 21 8D 16 00 00 B4 09 CD 21',
        modifiedRegs: ['AX', 'DX', 'IP'],
        registers: { AX: '0924H', BX: '0000H', CX: '0A2DH', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0054H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'Carriage Return (0DH) resets cursor to line start; String displays: CURRENT TIME: 10:45:28',
        description: 'Overwrites current console line in place with updated real-time clock string.'
      },
      {
        stepNum: 9,
        label: 'EXIT_HANDLER',
        instruction: 'MOV AH, 08H; INT 21H; MOV AX, 4C00H; INT 21H',
        machineCode: 'B4 08 CD 21 B8 00 4C CD 21',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '4C00H', BX: '0000H', CX: '0A2DH', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '005DH' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'Process terminated cleanly; control returned to DOS prompt',
        description: 'Flushes keystroke from keyboard buffer and cleanly exits to DOS.'
      }
    ]
  },
  exp_clock2: {
    expId: 'exp_clock2',
    title: 'Exp 5B: Digital Clock Design using DOS Interrupt Functions',
    dosboxSteps: [
      { step: 1, command: 'MOUNT C C:\\MASM611\nC:\nCD WORK', purpose: 'Mount MASM environment in DOSBox.', outputSample: 'Drive C mounted' },
      { step: 2, command: 'EDIT EXP5B.ASM', purpose: 'Write 12-hour AM/PM clock and calendar assembly source code.', outputSample: 'EXP5B.ASM editor loaded' },
      { step: 3, command: 'MASM EXP5B.ASM;', purpose: 'Assemble program with DOS Date and BIOS Video services.', outputSample: '0 Severe Errors' },
      { step: 4, command: 'LINK EXP5B.OBJ;', purpose: 'Generate EXP5B.EXE executable.', outputSample: 'EXP5B.EXE created' },
      { step: 5, command: 'EXP5B.EXE', purpose: 'Run full-screen blue theme digital clock & calendar.', outputSample: 'DATE: 28/08/2026  |  TIME: 02:30:15 PM' }
    ],
    steps: [
      {
        stepNum: 1,
        label: 'CLEAR_SCREEN',
        instruction: 'MOV AX, DATA_SEG; MOV DS, AX; MOV AH, 06H; MOV AL, 00H; MOV BH, 1FH; MOV CX, 0000H; MOV DX, 184FH; INT 10H',
        machineCode: 'B8 00 10 8E D8 B4 06 B0 00 B7 1F B9 00 00 BA 4F 18 CD 10',
        modifiedRegs: ['AX', 'BX', 'CX', 'DX', 'IP'],
        registers: { AX: '0600H', BX: '1F00H', CX: '0000H', DX: '184FH', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0012H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: '80x25 screen window cleared with attribute 1FH (White text on Blue background)',
        description: 'Calls BIOS Video Interrupt 10H / Function 06H to clear screen and set custom color palette.'
      },
      {
        stepNum: 2,
        label: 'GET_DATE',
        instruction: 'MOV AH, 2AH; INT 21H',
        machineCode: 'B4 2A CD 21',
        modifiedRegs: ['AX', 'CX', 'DX', 'IP'],
        registers: { AX: '2A05H', BX: '1F00H', CX: '07EAH', DX: '081CH', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0016H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'DOS Date read: CX=2026 (07EAH), DH=08 (August), DL=28 (28th day), AL=05 (Friday)',
        description: 'Invokes MS-DOS INT 21H / Function 2AH to read real-time calendar hardware date.'
      },
      {
        stepNum: 3,
        label: 'FORMAT_DATE_STR',
        instruction: 'Format Day (28), Month (08), Century (20), Year (26) into DATE_STR',
        machineCode: '8A C2 E8 40 00 88 26 06 00 8A C6 E8 38 00',
        modifiedRegs: ['AX', 'BX', 'IP'],
        registers: { AX: '3236H', BX: '1A00H', CX: '07EAH', DX: '081CH', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0032H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'DATE_STR = "DATE: 28/08/2026  |  "',
        description: 'Unpacks calendar date registers and formats the DD/MM/YYYY string buffer.'
      },
      {
        stepNum: 4,
        label: 'GET_TIME_12HR',
        instruction: 'MOV AH, 2CH; INT 21H; CMP AL, 12; JB IS_AM; SUB AL, 12; MOV TIME_STR[15], \'P\'',
        machineCode: 'B4 2C CD 21 8A C5 3C 0C 72 07 2C 0C C6 06 25 00 50',
        modifiedRegs: ['AX', 'CX', 'DX', 'IP'],
        registers: { AX: '2C02H', BX: '1A00H', CX: '0E1EH', DX: '0F00H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '004CH' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'CH=14 (14:00) -> Converted to 2 PM (AL=02H, Suffix="PM")',
        description: 'Performs 24-hour to 12-hour mathematical conversion with AM/PM indicator.'
      },
      {
        stepNum: 5,
        label: 'POSITION_AND_PRINT',
        instruction: 'MOV AH, 02H; MOV BH, 00H; MOV DH, 0AH; MOV DL, 12H; INT 10H; LEA DX, DATE_STR; MOV AH, 09H; INT 21H',
        machineCode: 'B4 02 B7 00 B6 0A B2 12 CD 10 8D 16 00 00 B4 09 CD 21',
        modifiedRegs: ['AX', 'DX', 'IP'],
        registers: { AX: '0924H', BX: '0000H', CX: '0E1EH', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0062H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'Cursor positioned at (Row 10, Col 18); Console displays: DATE: 28/08/2026 | TIME: 02:30:15 PM',
        description: 'Centers formatted date and 12-hour clock on screen using BIOS INT 10H.'
      },
      {
        stepNum: 6,
        label: 'QUIT_HANDLER',
        instruction: 'MOV AH, 08H; INT 21H; MOV AX, 4C00H; INT 21H',
        machineCode: 'B4 08 CD 21 B8 00 4C CD 21',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '4C00H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '006BH' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'DOS process terminated cleanly',
        description: 'Terminates application upon user pressing enter/key.'
      }
    ]
  },
  exp_clock3: {
    expId: 'exp_clock3',
    title: 'Exp 5C: Digital Clock Design by Reading System Time',
    dosboxSteps: [
      { step: 1, command: 'MOUNT C C:\\MASM611\nC:\nCD WORK', purpose: 'Mount MASM environment in DOSBox.', outputSample: 'Drive C mounted' },
      { step: 2, command: 'EDIT EXP5C.ASM', purpose: 'Write continuous ticking clock with animated blinking colons.', outputSample: 'EXP5C.ASM source open' },
      { step: 3, command: 'MASM EXP5C.ASM;', purpose: 'Assemble EXP5C.ASM.', outputSample: '0 Severe Errors' },
      { step: 4, command: 'LINK EXP5C.OBJ;', purpose: 'Create executable EXP5C.EXE.', outputSample: 'EXP5C.EXE created' },
      { step: 5, command: 'EXP5C.EXE', purpose: 'Execute live continuous digital clock with hundredths readout.', outputSample: '|   SYSTEM TIME:   12:30:45.82   |' }
    ],
    steps: [
      {
        stepNum: 1,
        label: 'SETUP_DISPLAY',
        instruction: 'MOV AX, DATA_SEG; MOV DS, AX; Clear Screen (INT 10H / AH=06H); Print Header Banner',
        machineCode: 'B8 00 10 8E D8 B4 06 B0 00 B7 07 B9 00 00 BA 4F 18 CD 10',
        modifiedRegs: ['AX', 'BX', 'CX', 'DX', 'IP'],
        registers: { AX: '0600H', BX: '0700H', CX: '0000H', DX: '184FH', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0015H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'Screen initialized; Header banner & status footer printed',
        description: 'Prepares the display console frame and displays application banner.'
      },
      {
        stepNum: 2,
        label: 'READ_TIMER_TICK',
        instruction: 'MOV AH, 2CH; INT 21H',
        machineCode: 'B4 2C CD 21',
        modifiedRegs: ['AX', 'CX', 'DX', 'IP'],
        registers: { AX: '2C00H', BX: '0700H', CX: '0C1EH', DX: '2D52H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0019H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'RTC Time read: CH=12 (12 Hrs), CL=30 (30 Mins), DH=45 (45 Secs), DL=82 (82/100 Secs)',
        description: 'Samples high-precision timer registers from DOS real-time clock.'
      },
      {
        stepNum: 3,
        label: 'ANIMATE_BLINK',
        instruction: 'XOR BLINK_ON, 01H; MOV BL, \':\'; CMP BLINK_ON, 01H; JE SET_COL; MOV BL, \' \'',
        machineCode: '80 36 90 00 01 B3 3A 80 3E 90 00 01 74 02 B3 20',
        modifiedRegs: ['BX', 'IP'],
        registers: { AX: '2C00H', BX: '003AH', CX: '0C1EH', DX: '2D52H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '002BH' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'BLINK_ON toggled to 01H -> Colon separator \':\' activated for tick animation',
        description: 'Toggles blinking separator state on each new second transition.'
      },
      {
        stepNum: 4,
        label: 'UNPACK_ALL_DIGITS',
        instruction: 'Unpack CH (12), CL (30), DH (45), and DL (82) into DIGIT_BOX string',
        machineCode: '8A C5 E8 20 00 8A C1 E8 1A 00 8A C6 E8 14 00 8A C2 E8 0E 00',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '3832H', BX: '003AH', CX: '0C1EH', DX: '2D52H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '004EH' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'DIGIT_BOX = "|   SYSTEM TIME:   12:30:45.82   |"',
        description: 'Converts all 4 time components into ASCII decimal digits inside the decorative box.'
      },
      {
        stepNum: 5,
        label: 'UPDATE_CLOCK_BOX',
        instruction: 'MOV AH, 02H; MOV BH, 00H; MOV DH, 08H; MOV DL, 0CH; INT 10H; LEA DX, DIGIT_BOX; MOV AH, 09H; INT 21H',
        machineCode: 'B4 02 B7 00 B6 08 B2 0C CD 10 8D 16 30 00 B4 09 CD 21',
        modifiedRegs: ['AX', 'DX', 'IP'],
        registers: { AX: '0924H', BX: '0000H', CX: '0C1EH', DX: '0030H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0060H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'Box refreshed at Row 8, Col 12 without moving cursor down',
        description: 'Updates the digit box in place on console screen, producing a clean flicker-free digital clock.'
      },
      {
        stepNum: 6,
        label: 'TERMINATE',
        instruction: 'MOV AH, 08H; INT 21H; MOV AX, 4C00H; INT 21H',
        machineCode: 'B4 08 CD 21 B8 00 4C CD 21',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '4C00H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0069H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'Process terminated cleanly',
        description: 'Clean exit to DOS.'
      }
    ]
  },
  exp_stepper1: {
    expId: 'exp_stepper1',
    title: 'Exp 6A: Stepper Motor CW Rotation with Variable Step-Size',
    dosboxSteps: [
      { step: 1, command: 'MOUNT C C:\\MASM611\nC:', purpose: 'Mount MASM environment in DOSBox.', outputSample: 'Drive C mounted' },
      { step: 2, command: 'MASM STEP1.ASM;', purpose: 'Assemble Stepper Motor Clockwise ALP.', outputSample: '0 Errors' },
      { step: 3, command: 'LINK STEP1.OBJ;', purpose: 'Link object module.', outputSample: 'STEP1.EXE created' },
      { step: 4, command: 'DEBUG STEP1.EXE', purpose: 'Trace 8255 Port A excitation sequence and software delays.', outputSample: '-t (Trace stepping sequence)' }
    ],
    steps: [
      {
        stepNum: 1,
        label: 'INIT_8255',
        instruction: 'MOV DX, 00C6H; MOV AL, 80H; OUT DX, AL',
        modifiedRegs: ['AL', 'DX', 'IP'],
        registers: { AX: '0080H', BX: '0000H', CX: '0000H', DX: '00C6H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0007H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: '8255 CWR (00C6H) = 80H (Mode 0: Port A, B, C Output)',
        description: 'Initializes 8255 PPI: Configures Port A (00C0H) as an 8-bit output port connected to ULN2003 stepper driver.'
      },
      {
        stepNum: 2,
        label: 'LOAD_PARAMS',
        instruction: 'MOV CX, 00C8H; LEA SI, CW_SEQ; MOV DX, 00C0H',
        modifiedRegs: ['CX', 'SI', 'DX', 'IP'],
        registers: { AX: '0080H', BX: '0000H', CX: '00C8H', DX: '00C0H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0010H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'Target Steps CX = 200 (00C8H = 360° CW), CW_SEQ = [09H, 0AH, 06H, 05H]',
        description: 'Loads target step counter (200 steps = 1 full revolution) and sets SI to the 2-phase full-step excitation table.'
      },
      {
        stepNum: 3,
        label: 'STEP_1_CW',
        instruction: 'MOV AL, [SI]; OUT DX, AL; CALL DELAY',
        modifiedRegs: ['AL', 'IP'],
        registers: { AX: '0009H', BX: '0000H', CX: '00C7H', DX: '00C0H', SI: '0001H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0019H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'Port A (00C0H) = 09H (Phases A & D Active). Rotor advances +1.8° CW.',
        description: 'Sends excitation code 09H to Port A. Software delay settles rotor at +1.8°.'
      },
      {
        stepNum: 4,
        label: 'STEP_2_CW',
        instruction: 'MOV AL, [SI]; OUT DX, AL; CALL DELAY',
        modifiedRegs: ['AL', 'IP'],
        registers: { AX: '000AH', BX: '0000H', CX: '00C6H', DX: '00C0H', SI: '0002H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0022H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'Port A (00C0H) = 0AH (Phases A & B Active). Rotor advances to +3.6° CW.',
        description: 'Sends excitation code 0AH to Port A. Rotor advances smoothly in the clockwise direction.'
      },
      {
        stepNum: 5,
        label: 'COMPLETE_CW',
        instruction: 'LOOP STEP_LOOP; MOV AX, 4C00H; INT 21H',
        modifiedRegs: ['AX', 'CX', 'IP'],
        registers: { AX: '4C00H', BX: '0000H', CX: '0000H', DX: '00C0H', SI: '0004H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0035H' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: '200 steps completed (Total Angular Displacement: +360.0° CW)',
        description: 'Loop completes when CX reaches 0. Returns cleanly to DOS.'
      }
    ]
  },
  exp_stepper2: {
    expId: 'exp_stepper2',
    title: 'Exp 6B: Stepper Motor Anti-Clockwise Rotation',
    dosboxSteps: [
      { step: 1, command: 'MOUNT C C:\\MASM611\nC:', purpose: 'Mount MASM environment in DOSBox.', outputSample: 'Drive C mounted' },
      { step: 2, command: 'MASM STEP2.ASM;', purpose: 'Assemble Stepper Motor Anti-Clockwise ALP.', outputSample: '0 Errors' },
      { step: 3, command: 'LINK STEP2.OBJ;', purpose: 'Link object module.', outputSample: 'STEP2.EXE created' },
      { step: 4, command: 'DEBUG STEP2.EXE', purpose: 'Trace reversed excitation sequence [05H, 06H, 0AH, 09H].', outputSample: '-t (Trace reverse stepping)' }
    ],
    steps: [
      {
        stepNum: 1,
        label: 'INIT_8255',
        instruction: 'MOV DX, 00C6H; MOV AL, 80H; OUT DX, AL',
        modifiedRegs: ['AL', 'DX', 'IP'],
        registers: { AX: '0080H', BX: '0000H', CX: '0000H', DX: '00C6H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0007H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: '8255 CWR = 80H (Port A Mode 0 Output)',
        description: 'Initializes 8255 PPI for motor drive.'
      },
      {
        stepNum: 2,
        label: 'LOAD_CCW_TABLE',
        instruction: 'MOV CX, 00C8H; LEA SI, CCW_SEQ; MOV DX, 00C0H',
        modifiedRegs: ['CX', 'SI', 'DX', 'IP'],
        registers: { AX: '0080H', BX: '0000H', CX: '00C8H', DX: '00C0H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0010H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'Target Steps CX = 200 (360° CCW), CCW_SEQ = [05H, 06H, 0AH, 09H]',
        description: 'Loads anti-clockwise commutation table into memory.'
      },
      {
        stepNum: 3,
        label: 'STEP_1_CCW',
        instruction: 'MOV AL, [SI]; OUT DX, AL; CALL DELAY',
        modifiedRegs: ['AL', 'IP'],
        registers: { AX: '0005H', BX: '0000H', CX: '00C7H', DX: '00C0H', SI: '0001H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0019H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'Port A = 05H (Phases C & D Active). Rotor moves -1.8° CCW.',
        description: 'Sends reverse excitation code 05H to rotate shaft anti-clockwise.'
      },
      {
        stepNum: 4,
        label: 'COMPLETE_CCW',
        instruction: 'LOOP CCW_LOOP; MOV AX, 4C00H; INT 21H',
        modifiedRegs: ['AX', 'CX', 'IP'],
        registers: { AX: '4C00H', BX: '0000H', CX: '0000H', DX: '00C0H', SI: '0004H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0035H' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: '200 reverse steps completed (Displacement: -360.0° CCW)',
        description: 'Completed anti-clockwise rotation. Clean exit to DOS.'
      }
    ]
  },
  exp_adc: {
    expId: 'exp_adc',
    title: 'Exp 7A: Interfacing ADC (ADC 0808) with 8086',
    dosboxSteps: [
      { step: 1, command: 'MOUNT C C:\\MASM611\nC:', purpose: 'Mount MASM environment in DOSBox.', outputSample: 'Drive C mounted' },
      { step: 2, command: 'MASM ADC8086.ASM;', purpose: 'Assemble ADC interfacing ALP.', outputSample: '0 Errors' },
      { step: 3, command: 'LINK ADC8086.OBJ;', purpose: 'Link object file.', outputSample: 'ADC8086.EXE created' },
      { step: 4, command: 'DEBUG ADC8086.EXE', purpose: 'Trace 8255 handshaking, EOC polling, and digital reading.', outputSample: '-d DS:0000 0010 (Inspect DIGITAL_VAL & VOLTAGE_MV)' }
    ],
    steps: [
      {
        stepNum: 1,
        label: 'INIT_8255_PPI',
        instruction: 'MOV DX, 00C6H; MOV AL, 98H; OUT DX, AL',
        modifiedRegs: ['AL', 'DX', 'IP'],
        registers: { AX: '0098H', BX: '0000H', CX: '0000H', DX: '00C6H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0007H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: '8255 CWR = 98H (Port A=IN, Port B=OUT, PC_Upper=IN, PC_Lower=OUT)',
        description: 'Configures 8255 PPI in Mode 0 for ADC handshake: Port A reads 8-bit digital data, Port B selects channel, Port C controls ALE/SOC/EOC/OE.'
      },
      {
        stepNum: 2,
        label: 'SELECT_CHANNEL',
        instruction: 'MOV DX, 00C2H; MOV AL, 00H; OUT DX, AL',
        modifiedRegs: ['AL', 'DX', 'IP'],
        registers: { AX: '0000H', BX: '0000H', CX: '0000H', DX: '00C2H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '000EH' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'Port B (00C2H) = 00H (Channel IN0 Selected: ADD A=0, B=0, C=0)',
        description: 'Selects ADC analog channel IN0 (connected to Vin = 2.50V).'
      },
      {
        stepNum: 3,
        label: 'PULSE_ALE_SOC',
        instruction: 'MOV DX, 00C4H; MOV AL, 01H; OUT DX, AL; NOP; MOV AL, 00H; OUT DX, AL',
        modifiedRegs: ['AL', 'DX', 'IP'],
        registers: { AX: '0000H', BX: '0000H', CX: '0000H', DX: '00C4H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '001AH' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'Port C Bit 0 pulsed HIGH then LOW. SAR starts conversion cycle.',
        description: 'Generates active-high Address Latch Enable and Start of Conversion pulse on PC0. SAR conversion initiated.'
      },
      {
        stepNum: 4,
        label: 'POLL_EOC',
        instruction: 'CHECK_EOC: IN AL, DX; TEST AL, 80H; JZ CHECK_EOC',
        modifiedRegs: ['AL', 'IP'],
        registers: { AX: '0080H', BX: '0000H', CX: '0000H', DX: '00C4H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0024H' },
        flags: { CF: '0', ZF: '0', SF: '1', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'Port C Status = 80H (PC7 / EOC = 1, Conversion Complete!)',
        description: 'Polls EOC on PC7. Bit 7 transitions HIGH indicating SAR conversion finished (~100 µs).'
      },
      {
        stepNum: 5,
        label: 'READ_PORT_A',
        instruction: 'MOV AL, 04H; OUT DX, AL; MOV DX, 00C0H; IN AL, DX; MOV [DIGITAL_VAL], AL',
        modifiedRegs: ['AL', 'DX', 'IP'],
        registers: { AX: '0080H', BX: '0000H', CX: '0000H', DX: '00C0H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0032H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'OE asserted (PC2=1) -> Read Port A: AL = 80H (128d) -> Saved to DIGITAL_VAL',
        description: 'Asserts Output Enable (OE) on PC2, reads 8-bit digital output byte 80H from Port A, and saves it into memory.'
      },
      {
        stepNum: 6,
        label: 'COMPUTE_VOLTAGE',
        instruction: 'MOV AH, 00H; MOV BX, 5000; MUL BX; MOV BX, 255; DIV BX; MOV [VOLTAGE_MV], AX',
        modifiedRegs: ['AX', 'BX', 'DX', 'IP'],
        registers: { AX: '09CDH', BX: '00FFH', CX: '0000H', DX: '00C0H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0046H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'VOLTAGE_MV = 2509 mV (09CDH ≈ 2.51 V reconstructed)',
        description: 'Calculates physical voltage in millivolts: AX = (80H × 5000) / 255 = 2509 mV.'
      },
      {
        stepNum: 7,
        label: 'EXIT',
        instruction: 'MOV AX, 4C00H; INT 21H',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '4C00H', BX: '00FFH', CX: '0000H', DX: '00C0H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '004BH' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'Process terminated cleanly',
        description: 'Clean exit to DOS.'
      }
    ]
  },
  exp_dac: {
    expId: 'exp_dac',
    title: 'Exp 7B: Interfacing DAC (DAC 0800) & Waveform Synthesis',
    dosboxSteps: [
      { step: 1, command: 'MOUNT C C:\\MASM611\nC:', purpose: 'Mount MASM environment in DOSBox.', outputSample: 'Drive C mounted' },
      { step: 2, command: 'MASM DAC8086.ASM;', purpose: 'Assemble DAC Waveform Synthesis program.', outputSample: '0 Errors' },
      { step: 3, command: 'LINK DAC8086.OBJ;', purpose: 'Link object file.', outputSample: 'DAC8086.EXE created' },
      { step: 4, command: 'DEBUG DAC8086.EXE', purpose: 'Trace DAC Port A output patterns and delays on oscilloscope.', outputSample: '-g (Run waveform generator)' }
    ],
    steps: [
      {
        stepNum: 1,
        label: 'INIT_8255_PORT_A',
        instruction: 'MOV DX, 00C6H; MOV AL, 80H; OUT DX, AL; MOV DX, 00C0H',
        modifiedRegs: ['AL', 'DX', 'IP'],
        registers: { AX: '0080H', BX: '0000H', CX: '0000H', DX: '00C0H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0009H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: '8255 CWR = 80H (Port A Mode 0 Output @ 00C0H)',
        description: 'Initializes 8255 PPI: Configures Port A as 8-bit output connected to DAC0800 digital inputs D0-D7.'
      },
      {
        stepNum: 2,
        label: 'SQUARE_WAVE_LOW',
        instruction: 'MOV AL, 00H; OUT DX, AL; CALL DELAY_HALF',
        modifiedRegs: ['AL', 'IP'],
        registers: { AX: '0000H', BX: '0000H', CX: '0000H', DX: '00C0H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0015H' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'Port A (00C0H) = 00H -> DAC output Vo = 0.00 V (Low State for T/2)',
        description: 'Sends 00H to DAC0800. Op-amp outputs 0.00V. Software delay holds low half-cycle.'
      },
      {
        stepNum: 3,
        label: 'SQUARE_WAVE_HIGH',
        instruction: 'MOV AL, 0FFH; OUT DX, AL; CALL DELAY_HALF',
        modifiedRegs: ['AL', 'IP'],
        registers: { AX: '00FFH', BX: '0000H', CX: '0000H', DX: '00C0H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0020H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'Port A (00C0H) = FFH -> DAC output Vo = +5.00 V (High State for T/2)',
        description: 'Sends FFH to DAC0800. Op-amp outputs +5.00V. Symmetric square wave formed (5.0 Vp-p).'
      },
      {
        stepNum: 4,
        label: 'TRIANGULAR_WAVE_RAMP',
        instruction: 'RAMP_UP: OUT DX, AL; INC AL; JNZ RAMP_UP; RAMP_DOWN: OUT DX, AL; DEC AL; JNZ RAMP_DOWN',
        modifiedRegs: ['AL', 'IP'],
        registers: { AX: '0000H', BX: '0000H', CX: '0000H', DX: '00C0H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0032H' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'Port A sweeps: 00H -> FFH (0V to +5V) and FFH -> 00H (+5V to 0V)',
        description: 'Generates linear symmetric ramp-up and ramp-down slope to synthesize a clean triangular wave.'
      },
      {
        stepNum: 5,
        label: 'STEP_SIGNAL_STAIRCASE',
        instruction: 'STEP_LOOP: OUT DX, AL; CALL DELAY_STEP; ADD AL, 33H; JNC STEP_LOOP',
        modifiedRegs: ['AL', 'IP'],
        registers: { AX: '00FFH', BX: '0000H', CX: '0000H', DX: '00C0H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0045H' },
        flags: { CF: '1', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '1' },
        memoryAction: 'Port A plateaus: 00H(0V) -> 33H(1V) -> 66H(2V) -> 99H(3V) -> CCH(4V) -> FFH(5V)',
        description: 'Generates 6-level discrete staircase waveform with calibrated ~5 ms plateau hold intervals.'
      }
    ]
  },
  exp5: {
    expId: 'exp5',
    title: 'Exp 8: Block Data Transfer (Memory Copy)',
    dosboxSteps: [
      { step: 1, command: 'MOUNT C C:\\MASM611\nC:', purpose: 'Mount MASM environment in DOSBox.', outputSample: 'Drive C mounted' },
      { step: 2, command: 'MASM EXP5.ASM;', purpose: 'Assemble Block Transfer program.', outputSample: '0 Errors' },
      { step: 3, command: 'LINK EXP5.OBJ;', purpose: 'Link object file.', outputSample: 'EXP5.EXE created' },
      { step: 4, command: 'DEBUG EXP5.EXE', purpose: 'Trace REP MOVSB hardware memory block copy.', outputSample: '-d DS:0000 0020 (Verify Destination block bytes)' }
    ],
    steps: [
      {
        stepNum: 1,
        instruction: 'MOV AX, @DATA; MOV DS, AX; MOV ES, AX',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '1000H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '0000H', DI: '0000H', SP: '0100H', BP: '0000H', IP: '0007H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'SRC_BLOCK: 10H, 20H, 30H, 40H, 50H, 60H, 70H, 80H, 90H, 99H (10 bytes)',
        description: 'Initializes Source Segment DS and Destination Segment ES.'
      },
      {
        stepNum: 2,
        instruction: 'LEA SI, SRC_BLOCK; LEA DI, DEST_BLOCK; MOV CX, 10; CLD',
        modifiedRegs: ['SI', 'DI', 'CX', 'IP'],
        registers: { AX: '1000H', BX: '0000H', CX: '000AH', DX: '0000H', SI: '0000H', DI: '000AH', SP: '0100H', BP: '0000H', IP: '0012H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'SI = 0000H (Source), DI = 000AH (Destination), CX = 10 (000AH), DF = 0 (Increment)',
        description: 'Loads source and destination pointers, sets block transfer count CX=10, and clears Direction Flag (CLD).'
      },
      {
        stepNum: 3,
        label: 'REP MOVSB (Hardware Fast Block Copy)',
        instruction: 'REP MOVSB (Copy 10 Bytes from DS:SI to ES:DI)',
        modifiedRegs: ['SI', 'DI', 'CX', 'IP'],
        registers: { AX: '1000H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '000AH', DI: '0014H', SP: '0100H', BP: '0000H', IP: '0014H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'DEST_BLOCK [DS:000AH..0013H] successfully populated with: 10H, 20H, 30H, 40H, 50H, 60H, 70H, 80H, 90H, 99H',
        description: 'Hardware transfers 10 bytes directly from DS:SI to ES:DI in a single high-speed burst. CX decrements to 0.'
      },
      {
        stepNum: 4,
        label: 'EXIT',
        instruction: 'MOV AX, 4C00H; INT 21H',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: '4C00H', BX: '0000H', CX: '0000H', DX: '0000H', SI: '000AH', DI: '0014H', SP: '0100H', BP: '0000H', IP: '0019H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'DOS Interrupt 21H terminates process',
        description: 'Clean exit to DOS.'
      }
    ]
  },

  exp_8051_arith: {
    title: '8051 Arithmetic Operations Execution Trace',
    hardwareContext: 'Intel 8051 Microcontroller @ 12.0 MHz | On-chip 128B RAM | 8-Bit ALU',
    steps: [
      {
        stepNum: 1,
        label: 'INITIALIZATION',
        instruction: 'MOV 30H, #0F8H; MOV 31H, #19H (Load 8-bit operands)',
        modifiedRegs: ['IP'],
        registers: { AX: 'A=00H', BX: 'B=00H', CX: 'R0=00H', DX: 'R1=00H', SI: 'PSW=00H', DI: '30H=F8H', SP: '07H', BP: '31H=19H', IP: '0030H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'RAM[30H] = F8H (248D), RAM[31H] = 19H (25D)',
        description: 'Initializes input test operands in internal RAM.'
      },
      {
        stepNum: 2,
        label: '8-BIT ADDITION',
        instruction: 'MOV A, 30H; ADD A, 31H; MOV 40H, A',
        modifiedRegs: ['AX', 'SI', 'IP'],
        registers: { AX: 'A=11H', BX: 'B=00H', CX: 'R0=00H', DX: 'R1=00H', SI: 'PSW=80H (CY=1)', DI: '40H=11H', SP: '07H', BP: '41H=01H', IP: '0038H' },
        flags: { CF: '1', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '1' },
        memoryAction: 'RAM[40H] = 11H (Lower Sum Byte), RAM[41H] = 01H (Carry Flag Byte)',
        description: 'F8H + 19H = 111H. Accumulator A holds 11H; Carry Flag CY is asserted (CY=1).'
      },
      {
        stepNum: 3,
        label: '16-BIT RIPPLE ADDITION',
        instruction: 'CLR C; ADD A, 34H (Low Byte); ADDC A, 35H (High Byte)',
        modifiedRegs: ['AX', 'SI', 'IP'],
        registers: { AX: 'A=47H', BX: 'B=00H', CX: 'R0=00H', DX: 'R1=00H', SI: 'PSW=00H', DI: '42H=40H', SP: '07H', BP: '43H=47H', IP: '0048H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'RAM[42H] = 40H (Sum Low), RAM[43H] = 47H (Sum High) -> Total = 4740H',
        description: 'Adds 12E4H + 345CH. Lower byte addition yields 40H with carry 1; ADDC adds 12H + 34H + 1 = 47H.'
      },
      {
        stepNum: 4,
        label: '8-BIT SUBTRACTION',
        instruction: 'CLR C; MOV A, 36H; SUBB A, 37H; MOV 45H, A',
        modifiedRegs: ['AX', 'SI', 'IP'],
        registers: { AX: 'A=4EH', BX: 'B=00H', CX: 'R0=00H', DX: 'R1=00H', SI: 'PSW=00H', DI: '45H=4EH', SP: '07H', BP: '46H=00H', IP: '0054H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'RAM[45H] = 4EH (78D), RAM[46H] = 00H (No Borrow)',
        description: 'Subtracts 95H (149D) - 47H (71D) = 4EH (78D). CY remains 0.'
      },
      {
        stepNum: 5,
        label: 'BCD DECIMAL ADJUST',
        instruction: 'MOV A, 38H; ADD A, 39H; DA A; MOV 47H, A',
        modifiedRegs: ['AX', 'SI', 'IP'],
        registers: { AX: 'A=87H', BX: 'B=00H', CX: 'R0=00H', DX: 'R1=00H', SI: 'PSW=00H', DI: '47H=87H', SP: '07H', BP: '47H=87H', IP: '0060H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'RAM[47H] = 87H (Valid Packed BCD: 38 + 49 = 87)',
        description: '38H + 49H yields binary 81H with AC=1. DA A adds 06H, adjusting result to valid BCD 87H.'
      }
    ]
  },

  exp_8051_muldiv: {
    title: '8051 Hardware MUL AB & DIV AB Execution Trace',
    hardwareContext: 'Intel 8051 Microcontroller @ 12.0 MHz | Hardware Math Unit (4 Machine Cycles / 48 Clocks)',
    steps: [
      {
        stepNum: 1,
        label: 'OPERAND SETUP',
        instruction: 'MOV 30H, #0F5H; MOV 31H, #18H; MOV 32H, #0F5H; MOV 33H, #0AH',
        modifiedRegs: ['IP'],
        registers: { AX: 'A=00H', BX: 'B=00H', CX: 'R0=00H', DX: 'R1=00H', SI: 'PSW=00H', DI: '30H=F5H', SP: '07H', BP: '31H=18H', IP: '0030H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'RAM[30H..33H] loaded with test multiplicand, multiplier, dividend, divisor',
        description: 'Loads multiplicand = 245 (F5H), multiplier = 24 (18H), divisor = 10 (0AH).'
      },
      {
        stepNum: 2,
        label: 'HARDWARE MULTIPLICATION (MUL AB)',
        instruction: 'MOV A, 30H; MOV B, 31H; MUL AB (4 Machine Cycles)',
        modifiedRegs: ['AX', 'BX', 'SI', 'IP'],
        registers: { AX: 'A=F8H', BX: 'B=16H', CX: 'R0=00H', DX: 'R1=00H', SI: 'PSW=04H (OV=1)', DI: '40H=F8H', SP: '07H', BP: '41H=16H', IP: '003CH' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '1', PF: '0', AF: '0' },
        memoryAction: 'RAM[40H] = F8H (Product Low Byte), RAM[41H] = 16H (Product High Byte) -> Product = 16F8H (5880D)',
        description: 'Hardware 8-bit multiplier computes 245 × 24 = 5880 = 16F8H. Low byte in A, high byte in B. OV=1 because B ≠ 0.'
      },
      {
        stepNum: 3,
        label: 'HARDWARE DIVISION (DIV AB)',
        instruction: 'MOV A, 32H; MOV B, 33H; DIV AB (4 Machine Cycles)',
        modifiedRegs: ['AX', 'BX', 'SI', 'IP'],
        registers: { AX: 'A=18H', BX: 'B=05H', CX: 'R0=00H', DX: 'R1=00H', SI: 'PSW=00H (OV=0)', DI: '43H=18H', SP: '07H', BP: '44H=05H', IP: '0046H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'RAM[43H] = 18H (Quotient = 24D), RAM[44H] = 05H (Remainder = 5D)',
        description: 'Divides 245 by 10. Quotient 24 (18H) stored in A, remainder 5 (05H) in B. OV=0 (no divide-by-zero).'
      },
      {
        stepNum: 4,
        label: 'DIVIDE BY ZERO EXCEPTION TEST',
        instruction: 'MOV A, #64H; MOV B, #00H; DIV AB',
        modifiedRegs: ['AX', 'BX', 'SI', 'IP'],
        registers: { AX: 'A=??', BX: 'B=??', CX: 'R0=00H', DX: 'R1=00H', SI: 'PSW=04H (OV=1)', DI: '45H=04H', SP: '07H', BP: 'OV=1', IP: '0050H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '1', PF: '0', AF: '0' },
        memoryAction: 'RAM[45H] = 04H (PSW shows OV=1 assertion)',
        description: 'Attempting to divide by B=00H triggers hardware Overflow flag (OV=1) indicating illegal zero division.'
      }
    ]
  },

  exp_8051_logic: {
    title: '8051 Logical Operations & Bit Manipulation Execution Trace',
    hardwareContext: 'Intel 8051 Microcontroller @ 12.0 MHz | Boolean Processor | Bit-Addressable RAM (20H-2FH)',
    steps: [
      {
        stepNum: 1,
        label: 'OPERAND INITIALIZATION',
        instruction: 'MOV 30H, #0A5H; MOV A, 30H',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: 'A=A5H', BX: 'B=00H', CX: 'R0=00H', DX: 'R1=00H', SI: 'PSW=00H', DI: '30H=A5H', SP: '07H', BP: '0000H', IP: '0030H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'RAM[30H] = A5H (1010 0101B), Accumulator A = A5H',
        description: 'Loads test bit pattern into internal RAM and Accumulator A.'
      },
      {
        stepNum: 2,
        label: 'BITWISE AND (ANL MASK)',
        instruction: 'ANL A, #0FH; MOV 40H, A',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: 'A=05H', BX: 'B=00H', CX: 'R0=00H', DX: 'R1=00H', SI: 'PSW=00H', DI: '40H=05H', SP: '07H', BP: '0000H', IP: '0036H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'RAM[40H] = 05H (0000 0101B)',
        description: 'Masks upper 4 bits to 0. 1010 0101B AND 0000 1111B = 0000 0101B (05H).'
      },
      {
        stepNum: 3,
        label: 'BITWISE OR (ORL BIT SET)',
        instruction: 'MOV A, 30H; ORL A, #0F0H; MOV 41H, A',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: 'A=F5H', BX: 'B=00H', CX: 'R0=00H', DX: 'R1=00H', SI: 'PSW=00H', DI: '41H=F5H', SP: '07H', BP: '0000H', IP: '0040H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'RAM[41H] = F5H (1111 0101B)',
        description: 'Sets upper 4 bits HIGH. 1010 0101B OR 1111 0000B = 1111 0101B (F5H).'
      },
      {
        stepNum: 4,
        label: 'BITWISE XOR & 1S COMPLEMENT',
        instruction: 'MOV A, 30H; XRL A, #0FFH; MOV 42H, A; CPL A',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: 'A=5AH', BX: 'B=00H', CX: 'R0=00H', DX: 'R1=00H', SI: 'PSW=00H', DI: '42H=5AH', SP: '07H', BP: '43H=5AH', IP: '004CH' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'RAM[42H] = 5AH (0101 1010B), RAM[43H] = 5AH',
        description: 'Inverts all 8 bits via XOR with FFH and via CPL A. 1010 0101B inverted -> 0101 1010B (5AH).'
      },
      {
        stepNum: 5,
        label: 'NIBBLE SWAP (SWAP A)',
        instruction: 'MOV A, 30H; SWAP A; MOV 44H, A',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: 'A=5AH', BX: 'B=00H', CX: 'R0=00H', DX: 'R1=00H', SI: 'PSW=00H', DI: '44H=5AH', SP: '07H', BP: '0000H', IP: '0054H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'RAM[44H] = 5AH (Upper nibble A exchanged with lower nibble 5)',
        description: 'Single-cycle nibble exchange converts A5H to 5AH without affecting condition flags.'
      }
    ]
  },

  exp_8051_regbanks: {
    title: '8051 Register Bank Selection Execution Trace',
    hardwareContext: 'Intel 8051 Microcontroller @ 12.0 MHz | 4 Register Banks (32 Bytes: 00H-1FH) | PSW.3/PSW.4 Bank Select',
    steps: [
      {
        stepNum: 1,
        label: 'BANK 0 PROGRAMMING (PSW = 00H)',
        instruction: 'MOV PSW, #00H; MOV R0, #10H; MOV R1, #11H; ... MOV R7, #17H',
        modifiedRegs: ['CX', 'DX', 'SI', 'IP'],
        registers: { AX: 'A=00H', BX: 'B=00H', CX: 'R0=10H', DX: 'R1=11H', SI: 'PSW=00H (Bank 0)', DI: '00H=10H', SP: '07H', BP: '07H=17H', IP: '0038H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'RAM [00H..07H] populated with [10H, 11H, 12H, 13H, 14H, 15H, 16H, 17H]',
        description: 'RS1=0, RS0=0 selects Bank 0. R0..R7 map to physical addresses 00H..07H.'
      },
      {
        stepNum: 2,
        label: 'BANK 1 SELECTION (PSW = 08H)',
        instruction: 'SETB PSW.3 (RS0=1); MOV R0, #20H; MOV R1, #21H; ... MOV R7, #27H',
        modifiedRegs: ['CX', 'DX', 'SI', 'IP'],
        registers: { AX: 'A=00H', BX: 'B=00H', CX: 'R0=20H', DX: 'R1=21H', SI: 'PSW=08H (Bank 1)', DI: '08H=20H', SP: '07H', BP: '0FH=27H', IP: '0048H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'RAM [08H..0FH] populated with [20H, 21H, 22H, 23H, 24H, 25H, 26H, 27H]',
        description: 'RS1=0, RS0=1 switches to Bank 1. R0..R7 dynamically map to physical addresses 08H..0FH.'
      },
      {
        stepNum: 3,
        label: 'BANK 2 SELECTION (PSW = 10H)',
        instruction: 'CLR PSW.3; SETB PSW.4 (RS1=1, RS0=0); MOV R0, #30H; ... MOV R7, #37H',
        modifiedRegs: ['CX', 'DX', 'SI', 'IP'],
        registers: { AX: 'A=00H', BX: 'B=00H', CX: 'R0=30H', DX: 'R1=31H', SI: 'PSW=10H (Bank 2)', DI: '10H=30H', SP: '07H', BP: '17H=37H', IP: '0058H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'RAM [10H..17H] populated with [30H, 31H, 32H, 33H, 34H, 35H, 36H, 37H]',
        description: 'RS1=1, RS0=0 switches to Bank 2. R0..R7 dynamically map to physical addresses 10H..17H.'
      },
      {
        stepNum: 4,
        label: 'BANK 3 SELECTION (PSW = 18H)',
        instruction: 'SETB PSW.3 (RS1=1, RS0=1); MOV R0, #40H; ... MOV R7, #47H',
        modifiedRegs: ['CX', 'DX', 'SI', 'IP'],
        registers: { AX: 'A=00H', BX: 'B=00H', CX: 'R0=40H', DX: 'R1=41H', SI: 'PSW=18H (Bank 3)', DI: '18H=40H', SP: '07H', BP: '1FH=47H', IP: '0068H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'RAM [18H..1FH] populated with [40H, 41H, 42H, 43H, 44H, 45H, 46H, 47H]',
        description: 'RS1=1, RS0=1 switches to Bank 3. R0..R7 dynamically map to physical addresses 18H..1FH.'
      },
      {
        stepNum: 5,
        label: 'DIRECT MEMORY VERIFICATION',
        instruction: 'MOV A, 00H; MOV A, 08H; MOV A, 10H; MOV A, 18H',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: 'A=40H', BX: 'B=00H', CX: 'R0=40H', DX: 'R1=41H', SI: 'PSW=18H', DI: '40H=10H', SP: '07H', BP: '43H=40H', IP: '0074H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'Direct read confirms: RAM 00H=10H (Bank 0), RAM 08H=20H (Bank 1), RAM 10H=30H (Bank 2), RAM 18H=40H (Bank 3)',
        description: 'Direct addressing reads out values from all 4 banks, confirming 100% register isolation.'
      }
    ]
  },

  exp_8051_timer0_m1: {
    title: '8051 Timer 0 in Mode 1 (25 ms Delay & Port P0 Blink) Execution Trace',
    hardwareContext: 'Intel 8051 Microcontroller @ 12.0 MHz | TMOD (01H) | TH0/TL0 16-Bit Up-Counter | Port P0 Latches',
    steps: [
      {
        stepNum: 1,
        label: 'TIMER 0 MODE 1 INITIALIZATION',
        instruction: 'MOV TMOD, #01H; MOV P0, #00H',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: 'TMOD=01H', BX: 'TCON=00H', CX: 'TH0=00H', DX: 'TL0=00H', SI: 'P0=00H', DI: 'TR0=0', SP: '07H', BP: 'TF0=0', IP: '0030H' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'SFR 89H (TMOD) = 01H (Mode 1 16-bit Timer 0), SFR 80H (P0) = 00H (All LEDs OFF)',
        description: 'Configures Timer 0 as a 16-bit up-counter and sets initial state on Port P0 pins.'
      },
      {
        stepNum: 2,
        label: '16-BIT PRELOAD LOADING (40,536 = 9E58H)',
        instruction: 'MOV TL0, #58H; MOV TH0, #9EH',
        modifiedRegs: ['CX', 'DX', 'IP'],
        registers: { AX: 'TMOD=01H', BX: 'TCON=00H', CX: 'TH0=9EH', DX: 'TL0=58H', SI: 'P0=00H', DI: 'TR0=0', SP: '07H', BP: 'TF0=0', IP: '0038H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'SFR 8AH (TL0) = 58H, SFR 8CH (TH0) = 9EH (Initial 16-bit count = 9E58H)',
        description: 'Loads 65,536 - 25,000 = 40,536 into TH0:TL0, setting up exactly 25,000 µs until overflow.'
      },
      {
        stepNum: 3,
        label: 'START TIMER 0 & POLLED COUNTING',
        instruction: 'SETB TR0; HERE: JNB TF0, HERE',
        modifiedRegs: ['BX', 'CX', 'DX', 'IP'],
        registers: { AX: 'TMOD=01H', BX: 'TCON=10H (TR0=1)', CX: 'TH0=FFFFH', DX: 'TL0=FFFFH', SI: 'P0=00H', DI: 'TR0=1', SP: '07H', BP: 'TF0=0', IP: '003EH' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'Counter increments from 9E58H to FFFFH over 25,000 machine cycles (25,000.0 µs)',
        description: 'Starting Timer 0 causes TH0:TL0 to increment every 1 µs without CPU intervention.'
      },
      {
        stepNum: 4,
        label: 'OVERFLOW FLAG TF0 ASSERTION & STOP',
        instruction: 'TF0 asserted (TCON.5 = 1); CLR TR0; CLR TF0',
        modifiedRegs: ['BX', 'IP'],
        registers: { AX: 'TMOD=01H', BX: 'TCON=00H', CX: 'TH0=00H', DX: 'TL0=00H', SI: 'P0=00H', DI: 'TR0=0', SP: '07H', BP: 'TF0=0', IP: '0046H' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'TCON.5 (TF0) transitions 1 -> 0, TR0 cleared; 25.0 ms delay interval completed',
        description: 'Rollover from FFFFH to 0000H sets TF0=1. CPU exits polling loop, stops timer and clears TF0.'
      },
      {
        stepNum: 5,
        label: 'PORT P0 COMPLEMENT & REPEAT',
        instruction: 'CPL P0; SJMP MAIN_LOOP',
        modifiedRegs: ['SI', 'IP'],
        registers: { AX: 'TMOD=01H', BX: 'TCON=00H', CX: 'TH0=00H', DX: 'TL0=00H', SI: 'P0=FFH', DI: 'TR0=0', SP: '07H', BP: 'TF0=0', IP: '0032H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'SFR 80H (Port P0) = FFH (All 8 pins toggled HIGH); repeat next 25 ms interval',
        description: 'Toggles all 8 LEDs on Port P0, generating a 20.0 Hz blinking rate (50 ms cycle period).'
      }
    ]
  },

  exp_8051_timer1_m0: {
    title: '8051 Timer 1 in Mode 0 (50 µs Delay & Blink Port P2) Execution Trace',
    hardwareContext: 'Intel 8051 Microcontroller @ 12.0 MHz | TMOD (00H) | TH1 (8-Bit) + TL1 (5-Bit) 13-Bit Counter | Port P2',
    steps: [
      {
        stepNum: 1,
        label: '13-BIT MODE 0 TMOD CONFIGURATION',
        instruction: 'MOV TMOD, #00H; MOV P2, #00H',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: 'TMOD=00H', BX: 'TCON=00H', CX: 'TH1=00H', DX: 'TL1=00H', SI: 'P2=00H', DI: 'TR1=0', SP: '07H', BP: 'TF1=0', IP: '0030H' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'SFR 89H (TMOD) = 00H (Timer 1 Mode 0: 13-bit legacy counter), Port P2 = 00H',
        description: 'Configures Timer 1 for 13-bit counting (8 bits in TH1, lower 5 bits in TL1; max 8,192).'
      },
      {
        stepNum: 2,
        label: '13-BIT PRELOAD (8,192 - 50 = 8,142 = 1FCEH)',
        instruction: 'MOV TL1, #0EH; MOV TH1, #0FEH',
        modifiedRegs: ['CX', 'DX', 'IP'],
        registers: { AX: 'TMOD=00H', BX: 'TCON=00H', CX: 'TH1=FEH', DX: 'TL1=0EH', SI: 'P2=00H', DI: 'TR1=0', SP: '07H', BP: 'TF1=0', IP: '0038H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'SFR 8DH (TH1) = FEH (upper 8 bits), SFR 8BH (TL1) = 0EH (lower 5 bits: 14D)',
        description: 'Loads 13-bit count 8,142. Exactly 50 machine cycles (50.0 µs) required to reach overflow.'
      },
      {
        stepNum: 3,
        label: 'START TIMER 1 & POLL TF1 FLAG',
        instruction: 'SETB TR1; WAIT_50US: JNB TF1, WAIT_50US',
        modifiedRegs: ['BX', 'CX', 'DX', 'IP'],
        registers: { AX: 'TMOD=00H', BX: 'TCON=40H (TR1=1)', CX: 'TH1=1FFFH', DX: 'TL1=1FH', SI: 'P2=00H', DI: 'TR1=1', SP: '07H', BP: 'TF1=0', IP: '003EH' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'Counter increments from 1FCEH through 50 ticks to 1FFFH (50.0 µs elapsed)',
        description: 'Timer 1 increments at 1.0 µs rate until 13-bit capacity is reached.'
      },
      {
        stepNum: 4,
        label: 'OVERFLOW DETECTION & CLEAR TF1',
        instruction: 'TF1 asserted (TCON.7 = 1); CLR TR1; CLR TF1',
        modifiedRegs: ['BX', 'IP'],
        registers: { AX: 'TMOD=00H', BX: 'TCON=00H', CX: 'TH1=00H', DX: 'TL1=00H', SI: 'P2=00H', DI: 'TR1=0', SP: '07H', BP: 'TF1=0', IP: '0046H' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'TCON.7 (TF1) reset to 0, TR1 cleared; 50 µs delay completed',
        description: 'Rollover sets TF1. The CPU detects completion, stops Timer 1, and clears TF1.'
      },
      {
        stepNum: 5,
        label: 'TOGGLE PORT P2 PINS (10 kHz SQUARE WAVE)',
        instruction: 'CPL P2; SJMP MAIN_LOOP',
        modifiedRegs: ['SI', 'IP'],
        registers: { AX: 'TMOD=00H', BX: 'TCON=00H', CX: 'TH1=00H', DX: 'TL1=00H', SI: 'P2=FFH', DI: 'TR1=0', SP: '07H', BP: 'TF1=0', IP: '0032H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'SFR A0H (Port P2) inverted (00H <-> FFH); Full cycle period = 100 µs (10.0 kHz)',
        description: 'Toggles all Port P2 pins, outputting a continuous 10.0 kHz square wave.'
      }
    ]
  },

  exp_8051_counter0_m2: {
    title: '8051 Counter/Timer 0 in Mode 2 (75 ms Delay & Blink Port P1) Execution Trace',
    hardwareContext: 'Intel 8051 Microcontroller @ 12.0 MHz | TMOD (02H) | 8-Bit Auto-Reload (TH0 -> TL0) | Port P1',
    steps: [
      {
        stepNum: 1,
        label: 'AUTO-RELOAD MODE 2 CONFIGURATION',
        instruction: 'MOV TMOD, #02H; MOV P1, #00H',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: 'TMOD=02H', BX: 'TCON=00H', CX: 'TH0=00H', DX: 'TL0=00H', SI: 'P1=00H', DI: 'R2=00H', SP: '07H', BP: 'R3=00H', IP: '0030H' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'SFR 89H (TMOD) = 02H (Timer 0 Mode 2: 8-bit Auto-Reload), Port P1 = 00H',
        description: 'Configures Timer 0 for automatic hardware reload of TL0 from TH0 on each overflow.'
      },
      {
        stepNum: 2,
        label: 'PRELOAD 250 µS BASE TICK (TH0 = 06H)',
        instruction: 'MOV TH0, #06H; MOV TL0, #06H; SETB TR0',
        modifiedRegs: ['BX', 'CX', 'DX', 'IP'],
        registers: { AX: 'TMOD=02H', BX: 'TCON=10H (TR0=1)', CX: 'TH0=06H', DX: 'TL0=06H', SI: 'P1=00H', DI: 'R2=00H', SP: '07H', BP: 'R3=00H', IP: '0038H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'SFR 8CH (TH0) = 06H (permanent reload), SFR 8AH (TL0) = 06H (256 - 250 = 6)',
        description: 'Sets up a 250 µs base tick. Every overflow takes exactly 250 machine cycles.'
      },
      {
        stepNum: 3,
        label: 'INITIALIZE 300-ITERATION MULTIPLIER (R2 × R3)',
        instruction: 'MOV R2, #2; LOOP_OUTER: MOV R3, #150',
        modifiedRegs: ['DI', 'BP', 'IP'],
        registers: { AX: 'TMOD=02H', BX: 'TCON=10H', CX: 'TH0=06H', DX: 'TL0=06H', SI: 'P1=00H', DI: 'R2=02H', SP: '07H', BP: 'R3=96H (150D)', IP: '0040H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'R2 = 2, R3 = 150 (2 × 150 = 300 ticks × 250 µs = 75,000 µs = 75.0 ms)',
        description: 'Initializes software loop registers to accumulate 300 auto-reload intervals.'
      },
      {
        stepNum: 4,
        label: 'AUTO-RELOAD HARDWARE OPERATION & LOOP TICK',
        instruction: 'JNB TF0, $; CLR TF0; DJNZ R3, ... DJNZ R2, ...',
        modifiedRegs: ['DX', 'DI', 'BP', 'IP'],
        registers: { AX: 'TMOD=02H', BX: 'TCON=10H', CX: 'TH0=06H', DX: 'TL0=06H (Auto-reloaded)', SI: 'P1=00H', DI: 'R2=00H', SP: '07H', BP: 'R3=00H', IP: '0054H' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'TL0 overflows from FFH to 06H 300 times; exactly 75,000 µs elapsed',
        description: 'Hardware automatically copies TH0 (06H) to TL0 on every rollover without CPU delay.'
      },
      {
        stepNum: 5,
        label: 'TOGGLE PORT P1 PINS (6.67 Hz BLINK)',
        instruction: 'CPL P1; SJMP MAIN_LOOP',
        modifiedRegs: ['SI', 'IP'],
        registers: { AX: 'TMOD=02H', BX: 'TCON=10H', CX: 'TH0=06H', DX: 'TL0=06H', SI: 'P1=FFH', DI: 'R2=00H', SP: '07H', BP: 'R3=00H', IP: '0032H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'SFR 90H (Port P1) = FFH (All 8 LEDs toggled); Period = 150 ms (6.67 Hz)',
        description: 'Inverts Port P1 after 75 ms, producing a clean 6.67 Hz visual LED blink rate.'
      }
    ]
  },

  exp_8051_counter1_m1: {
    title: '8051 Counter 1 in Mode 1 (80 µs / 80 Pulse Delay & Blink Port P3) Execution Trace',
    hardwareContext: 'Intel 8051 Microcontroller @ 12.0 MHz | TMOD (50H: Counter / 10H: Timer) | TH1/TL1 16-Bit Counter | Port P3',
    steps: [
      {
        stepNum: 1,
        label: 'COUNTER 1 MODE 1 TMOD SETUP',
        instruction: 'MOV TMOD, #50H (or #10H); MOV P3, #00H',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: 'TMOD=50H', BX: 'TCON=00H', CX: 'TH1=00H', DX: 'TL1=00H', SI: 'P3=00H', DI: 'TR1=0', SP: '07H', BP: 'TF1=0', IP: '0030H' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'SFR 89H (TMOD) = 50H (Counter 1 Mode 1: 16-bit external counter on Pin T1/P3.5)',
        description: 'Sets C/T1=1 to count external 1-to-0 negative edge transitions on pin T1 (P3.5).'
      },
      {
        stepNum: 2,
        label: '16-BIT PRELOAD (65,536 - 80 = 65,456 = FFB0H)',
        instruction: 'MOV TL1, #0B0H; MOV TH1, #0FFH',
        modifiedRegs: ['CX', 'DX', 'IP'],
        registers: { AX: 'TMOD=50H', BX: 'TCON=00H', CX: 'TH1=FFH', DX: 'TL1=B0H', SI: 'P3=00H', DI: 'TR1=0', SP: '07H', BP: 'TF1=0', IP: '0038H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'SFR 8DH (TH1) = 0FFH, SFR 8BH (TL1) = 0B0H (Initial 16-bit count = FFB0H)',
        description: 'Preloads Counter 1 so that exactly 80 pulses / 80 µs will cause overflow.'
      },
      {
        stepNum: 3,
        label: 'START COUNTER 1 & SAMPLE TRANSITIONS',
        instruction: 'SETB TR1; WAIT_80PULSES: JNB TF1, WAIT_80PULSES',
        modifiedRegs: ['BX', 'CX', 'DX', 'IP'],
        registers: { AX: 'TMOD=50H', BX: 'TCON=40H (TR1=1)', CX: 'TH1=FFFFH', DX: 'TL1=FFFFH', SI: 'P3=00H', DI: 'TR1=1', SP: '07H', BP: 'TF1=0', IP: '003EH' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'Counter 1 increments on 80 consecutive negative edge pulses on Pin T1 (P3.5)',
        description: 'Hardware counts 80 external events from FFB0H up to FFFFH.'
      },
      {
        stepNum: 4,
        label: 'OVERFLOW FLAG TF1 & COUNTER STOP',
        instruction: 'TF1 asserted (TCON.7 = 1); CLR TR1; CLR TF1',
        modifiedRegs: ['BX', 'IP'],
        registers: { AX: 'TMOD=50H', BX: 'TCON=00H', CX: 'TH1=00H', DX: 'TL1=00H', SI: 'P3=00H', DI: 'TR1=0', SP: '07H', BP: 'TF1=0', IP: '0046H' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'TCON.7 (TF1) reset; exactly 80 pulses / 80 µs recorded',
        description: 'Rollover sets TF1. CPU stops Counter 1 and acknowledges completion.'
      },
      {
        stepNum: 5,
        label: 'TOGGLE PORT P3 (6.25 kHz PULSE TRAIN)',
        instruction: 'CPL P3; SJMP MAIN_LOOP',
        modifiedRegs: ['SI', 'IP'],
        registers: { AX: 'TMOD=50H', BX: 'TCON=00H', CX: 'TH1=00H', DX: 'TL1=00H', SI: 'P3=FFH', DI: 'TR1=0', SP: '07H', BP: 'TF1=0', IP: '0032H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '1', AF: '0' },
        memoryAction: 'SFR B0H (Port P3) inverted (00H <-> FFH); Frequency = 1 / (2 × 80 µs) = 6.25 kHz',
        description: 'Toggles Port P3 pins, generating a 6.25 kHz square wave output.'
      }
    ]
  },

  exp_8051_uart_9600: {
    title: '8051 UART Serial Character Transfer at 9600 Baud Execution Trace',
    hardwareContext: 'Intel 8051 @ 11.0592 MHz | Timer 1 Mode 2 (TH1 = 0FDH) | SCON = 50H | SBUF TX | Pin TXD (P3.1)',
    steps: [
      {
        stepNum: 1,
        label: 'TIMER 1 MODE 2 AUTO-RELOAD SETUP',
        instruction: 'MOV TMOD, #20H',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: 'TMOD=20H', BX: 'TCON=00H', CX: 'TH1=00H', DX: 'SCON=00H', SI: 'SBUF=00H', DI: 'TI=0', SP: '07H', BP: 'PCON=00H', IP: '0030H' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'SFR 89H (TMOD) = 20H (Timer 1 Mode 2: 8-bit Auto-Reload for UART Baud Rate Generator)',
        description: 'Initializes Timer 1 as an auto-reload clock source for the serial port.'
      },
      {
        stepNum: 2,
        label: 'LOAD 9600 BAUD RELOAD CONSTANT (TH1 = 0FDH)',
        instruction: 'MOV TH1, #0FDH',
        modifiedRegs: ['CX', 'IP'],
        registers: { AX: 'TMOD=20H', BX: 'TCON=00H', CX: 'TH1=FDH (-3D)', DX: 'SCON=00H', SI: 'SBUF=00H', DI: 'TI=0', SP: '07H', BP: 'PCON=00H', IP: '0033H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'SFR 8DH (TH1) = 0FDH (256 - 3 = 253D). Division N = 28,800 / 9600 = 3',
        description: 'Loads reload register with -3. Produces exact 9600 baud rate with 11.0592 MHz crystal.'
      },
      {
        stepNum: 3,
        label: 'CONFIGURE SCON FOR 8-BIT UART & ENABLE TIMER 1',
        instruction: 'MOV SCON, #50H; SETB TR1',
        modifiedRegs: ['BX', 'DX', 'IP'],
        registers: { AX: 'TMOD=20H', BX: 'TCON=40H (TR1=1)', CX: 'TH1=FDH', DX: 'SCON=50H (Mode 1, REN=1)', SI: 'SBUF=00H', DI: 'TI=0', SP: '07H', BP: 'PCON=00H', IP: '0038H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'SFR 98H (SCON) = 50H (8-bit UART, 1 Start, 8 Data, 1 Stop). TR1 = 1 (Baud clock running)',
        description: 'Arms UART Mode 1 and starts Timer 1 to drive bit shifting clock.'
      },
      {
        stepNum: 4,
        label: "LOAD CHARACTER 'A' INTO SBUF TO INITIATE TRANSMISSION",
        instruction: "MOV SBUF, #'A'",
        modifiedRegs: ['SI', 'IP'],
        registers: { AX: 'TMOD=20H', BX: 'TCON=40H', CX: 'TH1=FDH', DX: 'SCON=50H', SI: "SBUF=41H ('A')", DI: 'TI=0 (TX Busy)', SP: '07H', BP: 'PCON=00H', IP: '003BH' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'SFR 99H (SBUF) = 41H. Hardware serial shift register begins serializing 10-bit frame on TXD (P3.1)',
        description: 'Writing to SBUF starts serial output: 0 (Start) -> 1 0 0 0 0 0 1 0 (Data) -> 1 (Stop).'
      },
      {
        stepNum: 5,
        label: 'POLL TI FLAG & CLEAR FOR NEXT FRAME',
        instruction: 'WAIT_TI: JNB TI, WAIT_TI; CLR TI; SJMP AGAIN',
        modifiedRegs: ['DI', 'IP'],
        registers: { AX: 'TMOD=20H', BX: 'TCON=40H', CX: 'TH1=FDH', DX: 'SCON=50H', SI: 'SBUF=41H', DI: 'TI=0 (Cleared)', SP: '07H', BP: 'PCON=00H', IP: '003BH' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'TI asserted HIGH after 1.042 ms (10-bit frame finished). Software clears TI (SCON.1 = 0)',
        description: 'Waits for stop bit completion, clears TI in software, and loops to send next character.'
      }
    ]
  },

  exp_8051_uart_4800: {
    title: '8051 UART Serial Character Transfer at 4800 Baud Execution Trace',
    hardwareContext: 'Intel 8051 @ 11.0592 MHz | Timer 1 Mode 2 (TH1 = 0FAH) | SCON = 50H | SBUF TX | Pin TXD (P3.1)',
    steps: [
      {
        stepNum: 1,
        label: 'TIMER 1 MODE 2 & 4800 BAUD RELOAD SETUP',
        instruction: 'MOV TMOD, #20H; MOV TH1, #0FAH',
        modifiedRegs: ['AX', 'CX', 'IP'],
        registers: { AX: 'TMOD=20H', BX: 'TCON=00H', CX: 'TH1=FAH (-6D)', DX: 'SCON=00H', SI: 'SBUF=00H', DI: 'TI=0', SP: '07H', BP: 'PCON=00H', IP: '0033H' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'SFR 89H (TMOD) = 20H, SFR 8DH (TH1) = 0FAH (256 - 6 = 250D for 4800 baud)',
        description: 'Configures Timer 1 with reload count -6, giving a 4800 baud bit clock.'
      },
      {
        stepNum: 2,
        label: 'START TIMER 1 & ARM 8-BIT UART',
        instruction: 'MOV SCON, #50H; SETB TR1',
        modifiedRegs: ['BX', 'DX', 'IP'],
        registers: { AX: 'TMOD=20H', BX: 'TCON=40H (TR1=1)', CX: 'TH1=FAH', DX: 'SCON=50H', SI: 'SBUF=00H', DI: 'TI=0', SP: '07H', BP: 'PCON=00H', IP: '0038H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'SCON = 50H, TR1 = 1 (Baud rate clock active at 4800 Hz)',
        description: 'Enables UART Mode 1 reception/transmission and starts baud clock.'
      },
      {
        stepNum: 3,
        label: "LOAD CHARACTER 'B' INTO SBUF",
        instruction: "MOV SBUF, #'B'",
        modifiedRegs: ['SI', 'IP'],
        registers: { AX: 'TMOD=20H', BX: 'TCON=40H', CX: 'TH1=FAH', DX: 'SCON=50H', SI: "SBUF=42H ('B')", DI: 'TI=0', SP: '07H', BP: 'PCON=00H', IP: '003BH' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: "SBUF = 42H. Serial bitstream: 0 -> 0 1 0 0 0 0 1 0 -> 1 (Bit time = 208.33 µs)",
        description: 'Shifts character \'B\' out pin TXD (P3.1) over 2.083 ms frame duration.'
      },
      {
        stepNum: 4,
        label: 'DETECT TI FLAG & RESTART LOOP',
        instruction: 'JNB TI, $; CLR TI; SJMP AGAIN',
        modifiedRegs: ['DI', 'IP'],
        registers: { AX: 'TMOD=20H', BX: 'TCON=40H', CX: 'TH1=FAH', DX: 'SCON=50H', SI: 'SBUF=42H', DI: 'TI=0', SP: '07H', BP: 'PCON=00H', IP: '003BH' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'TI = 1 on stop bit, cleared by CLR TI; continuous 4800 baud stream maintained',
        description: 'Transmission cycle complete. Ready for next serial character.'
      }
    ]
  },

  exp_8051_uart_2400: {
    title: '8051 UART Serial Character Transfer at 2400 Baud Execution Trace',
    hardwareContext: 'Intel 8051 @ 11.0592 MHz | Timer 1 Mode 2 (TH1 = 0F4H) | SCON = 50H | SBUF TX | Pin TXD (P3.1)',
    steps: [
      {
        stepNum: 1,
        label: 'TIMER 1 MODE 2 & 2400 BAUD RELOAD SETUP',
        instruction: 'MOV TMOD, #20H; MOV TH1, #0F4H',
        modifiedRegs: ['AX', 'CX', 'IP'],
        registers: { AX: 'TMOD=20H', BX: 'TCON=00H', CX: 'TH1=F4H (-12D)', DX: 'SCON=00H', SI: 'SBUF=00H', DI: 'TI=0', SP: '07H', BP: 'PCON=00H', IP: '0033H' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'SFR 89H (TMOD) = 20H, SFR 8DH (TH1) = 0F4H (256 - 12 = 244D for 2400 baud)',
        description: 'Configures Timer 1 with reload constant -12 for robust 2400 baud communications.'
      },
      {
        stepNum: 2,
        label: 'START TIMER 1 & ARM 8-BIT UART',
        instruction: 'MOV SCON, #50H; SETB TR1',
        modifiedRegs: ['BX', 'DX', 'IP'],
        registers: { AX: 'TMOD=20H', BX: 'TCON=40H (TR1=1)', CX: 'TH1=F4H', DX: 'SCON=50H', SI: 'SBUF=00H', DI: 'TI=0', SP: '07H', BP: 'PCON=00H', IP: '0038H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'SCON = 50H, TR1 = 1 (Baud clock active at 2400 Hz)',
        description: 'Enables UART Mode 1 and starts Timer 1 baud clock.'
      },
      {
        stepNum: 3,
        label: "LOAD CHARACTER 'C' INTO SBUF",
        instruction: "MOV SBUF, #'C'",
        modifiedRegs: ['SI', 'IP'],
        registers: { AX: 'TMOD=20H', BX: 'TCON=40H', CX: 'TH1=F4H', DX: 'SCON=50H', SI: "SBUF=43H ('C')", DI: 'TI=0', SP: '07H', BP: 'PCON=00H', IP: '003BH' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: "SBUF = 43H. Serial bitstream: 0 -> 1 1 0 0 0 0 1 0 -> 1 (Bit time = 416.67 µs)",
        description: 'Shifts character \'C\' out pin TXD (P3.1) over 4.167 ms frame duration.'
      },
      {
        stepNum: 4,
        label: 'DETECT TI FLAG & RESTART LOOP',
        instruction: 'JNB TI, $; CLR TI; SJMP AGAIN',
        modifiedRegs: ['DI', 'IP'],
        registers: { AX: 'TMOD=20H', BX: 'TCON=40H', CX: 'TH1=F4H', DX: 'SCON=50H', SI: 'SBUF=43H', DI: 'TI=0', SP: '07H', BP: 'PCON=00H', IP: '003BH' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'TI = 1 on stop bit, cleared by CLR TI; continuous 2400 baud stream maintained',
        description: 'Transmission cycle complete at 2400 baud.'
      }
    ]
  },

  exp_8051_lcd_8bit: {
    title: 'Interfacing 16×2 LCD with 8051 in 8-Bit Mode Execution Trace',
    hardwareContext: 'Intel 8051 @ 11.0592 MHz | Port P1 (D0-D7 Bus) | RS=P2.0 | RW=P2.1 | EN=P2.2 | HD44780 Controller',
    steps: [
      {
        stepNum: 1,
        label: 'HARDWARE INITIALIZATION & POWER-UP DELAY',
        instruction: 'CLR RS; CLR RW; CLR EN; ACALL DELAY_20MS',
        modifiedRegs: ['AX', 'IP'],
        registers: { AX: 'P1=00H', BX: 'P2.0(RS)=0', CX: 'P2.1(RW)=0', DX: 'P2.2(EN)=0', SI: 'DPTR=0000H', DI: 'ACC=00H', SP: '09H', BP: '20ms Elapsed', IP: '0035H' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'Port P1 = 00H, P2.0(RS)=0, P2.1(RW)=0, P2.2(EN)=0; 20 ms delay completes POR cycle',
        description: 'Initializes microcontroller port pins and allows LCD internal power-on reset to settle.'
      },
      {
        stepNum: 2,
        label: 'FUNCTION SET COMMAND (38H: 8-BIT, 2 LINES, 5x7 FONT)',
        instruction: 'MOV P1, #38H; CLR RS; CLR RW; SETB EN; CLR EN',
        modifiedRegs: ['AX', 'DX', 'IP'],
        registers: { AX: 'P1=38H', BX: 'RS=0', CX: 'RW=0', DX: 'EN=0 (Latched)', SI: 'DPTR=0000H', DI: 'ACC=38H', SP: '09H', BP: 'Cmd 38H Done', IP: '0042H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'Port P1 = 38H. Enable strobe falling edge latches Function Set command into Instruction Register',
        description: 'Configures HD44780 for 8-bit bus mode, 2-line display, and 5×7 dot matrix character format.'
      },
      {
        stepNum: 3,
        label: 'DISPLAY ON (0EH) & CLEAR SCREEN (01H) COMMANDS',
        instruction: 'MOV P1, #0EH; ACALL EN_PULSE; MOV P1, #01H; ACALL EN_PULSE; ACALL DELAY_2MS',
        modifiedRegs: ['AX', 'DX', 'IP'],
        registers: { AX: 'P1=01H', BX: 'RS=0', CX: 'RW=0', DX: 'EN=0', SI: 'DPTR=0000H', DI: 'ACC=01H', SP: '09H', BP: 'DDRAM Cleared', IP: '0056H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'DDRAM filled with 20H (ASCII Space), Cursor returned to Home Address (80H)',
        description: 'Turns on display and underline cursor, clears screen, and resets DDRAM address counter.'
      },
      {
        stepNum: 4,
        label: 'SET LINE 1 DDRAM (80H) & WRITE "8051 INTERFACE"',
        instruction: 'MOV P1, #80H; ACALL CMD; MOV DPTR, #MSG1; ACALL WRITE_STR (SETB RS)',
        modifiedRegs: ['AX', 'BX', 'SI', 'DI', 'IP'],
        registers: { AX: "P1=45H ('E')", BX: 'RS=1 (Data)', CX: 'RW=0', DX: 'EN=0', SI: 'DPTR=MSG1+14', DI: "ACC=45H ('E')", SP: '09H', BP: 'Line 1 Written', IP: '0078H' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'DDRAM Address 80H..8DH written with "8051 INTERFACE" (RS=1, EN strobes)',
        description: 'Positions cursor at Row 1 Col 1 and sends 14 ASCII character bytes to LCD Data Register.'
      },
      {
        stepNum: 5,
        label: 'SET LINE 2 DDRAM (C0H) & WRITE "16x2 LCD 8-BIT"',
        instruction: 'MOV P1, #0C0H; ACALL CMD; MOV DPTR, #MSG2; ACALL WRITE_STR (SETB RS)',
        modifiedRegs: ['AX', 'BX', 'SI', 'DI', 'IP'],
        registers: { AX: "P1=54H ('T')", BX: 'RS=1 (Data)', CX: 'RW=0', DX: 'EN=0', SI: 'DPTR=MSG2+13', DI: "ACC=54H ('T')", SP: '09H', BP: 'Line 2 Written', IP: '009EH' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'DDRAM Address C0H..CCH written with "16x2 LCD 8-BIT". Screen fully populated.',
        description: 'Positions cursor at Row 2 Col 1 and renders second text string cleanly on LCD screen.'
      }
    ]
  },

  exp_8051_lcd_4bit: {
    title: 'Interfacing 16×2 LCD with 8051 in 4-Bit Mode Execution Trace',
    hardwareContext: 'Intel 8051 @ 11.0592 MHz | P1.4-P1.7 (D4-D7 Bus) | P1.0-P1.3 (Freed) | RS=P2.0, RW=P2.1, EN=P2.2',
    steps: [
      {
        stepNum: 1,
        label: '4-BIT SPECIAL RESET HANDSHAKE (TRIPLE 30H -> 20H)',
        instruction: 'Send 30H (3x with delays) -> Send 20H (Switch to 4-bit bus mode)',
        modifiedRegs: ['AX', 'DX', 'IP'],
        registers: { AX: 'P1=20H (High Nibble)', BX: 'RS=0', CX: 'RW=0', DX: 'EN=0', SI: 'DPTR=0000H', DI: 'ACC=20H', SP: '09H', BP: '4-Bit Mode Active', IP: '0040H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'HD44780 internal state machine resynchronized and locked into 4-bit interface mode',
        description: 'Executes mandatory power-up handshake to safely convert controller from 8-bit to 4-bit bus mode.'
      },
      {
        stepNum: 2,
        label: 'SEND 4-BIT FUNCTION SET (28H IN TWO NIBBLES)',
        instruction: 'MOV P1, #20H; EN_STROBE; MOV P1, #80H; EN_STROBE',
        modifiedRegs: ['AX', 'DX', 'IP'],
        registers: { AX: 'P1=80H (Low Nibble)', BX: 'RS=0', CX: 'RW=0', DX: 'EN=0', SI: 'DPTR=0000H', DI: 'ACC=28H', SP: '09H', BP: '28H Latched', IP: '0052H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'High Nibble 20H latched on P1.4-P1.7, Low Nibble 80H latched on P1.4-P1.7 -> Function Set 28H complete',
        description: 'Transmits 28H (4-bit, 2 lines, 5×7 font) across two consecutive 4-bit Enable pulses.'
      },
      {
        stepNum: 3,
        label: 'SEND DISPLAY ON (0EH) & CLEAR (01H) IN DUAL NIBBLES',
        instruction: 'ACALL CMD_4BIT(0EH); ACALL CMD_4BIT(01H); ACALL DELAY_2MS',
        modifiedRegs: ['AX', 'DX', 'IP'],
        registers: { AX: 'P1=10H', BX: 'RS=0', CX: 'RW=0', DX: 'EN=0', SI: 'DPTR=0000H', DI: 'ACC=01H', SP: '09H', BP: 'Screen Cleared', IP: '0068H' },
        flags: { CF: '0', ZF: '0', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: '0EH and 01H sent in dual nibbles; DDRAM cleared and cursor placed at Home 80H',
        description: 'Activates LCD display/cursor and clears DDRAM contents using 4-bit dual-nibble routines.'
      },
      {
        stepNum: 4,
        label: 'WRITE LINE 1: "4-BIT LCD MODE" (DUAL NIBBLES PER CHAR)',
        instruction: 'CMD_4BIT(80H); Loop: SWAP/ANL/OUT -> EN pulse (x2 per ASCII char)',
        modifiedRegs: ['AX', 'BX', 'SI', 'DI', 'IP'],
        registers: { AX: 'P1=50H', BX: 'RS=1', CX: 'RW=0', DX: 'EN=0', SI: 'DPTR=MSG1+14', DI: "ACC=45H ('E')", SP: '09H', BP: 'Line 1 Displayed', IP: '008CH' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'P1.4-P1.7 strobes high and low nibbles for each character; P1.0-P1.3 remain undisturbed',
        description: 'Renders Line 1 text while keeping 4 microcontroller I/O pins completely free for other peripherals.'
      },
      {
        stepNum: 5,
        label: 'WRITE LINE 2: "SAVING 4 I/O PINS" & ENTER HALT LOOP',
        instruction: 'CMD_4BIT(0C0H); Write "SAVING 4 I/O PINS"; SJMP $',
        modifiedRegs: ['AX', 'BX', 'SI', 'DI', 'IP'],
        registers: { AX: 'P1=30H', BX: 'RS=1', CX: 'RW=0', DX: 'EN=0', SI: 'DPTR=MSG2+17', DI: "ACC=53H ('S')", SP: '09H', BP: 'Line 2 Complete', IP: '00B0H' },
        flags: { CF: '0', ZF: '1', SF: '0', OF: '0', PF: '0', AF: '0' },
        memoryAction: 'Complete message visible on 16×2 LCD screen. CPU halts in low-power idle loop.',
        description: 'Renders Line 2 text using 4-bit multiplexing and enters termination loop.'
      }
    ]
  }
};

