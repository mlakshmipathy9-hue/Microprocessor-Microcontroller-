import sys

with open("./src/data/courseData.ts", "r") as f:
    content = f.read()

# Let's define the new module m10 string
m10_str = """  {
    id: 'm10',
    title: 'Module 10: 8086 Instruction Set',
    slides: [
      {
        id: 'm10-s1',
        title: '1. Introduction 📖',
        moduleTitle: 'Module 10: 8086 Instruction Set',
        moduleId: 'm10',
        points: [
          'Understand the 8086 instruction set and instruction structure.',
          'Instruction: A command given to the microprocessor to perform a specific task or operation (e.g., addition, data movement, logic analysis).',
          'Instruction Set: The complete list of instructions that a microprocessor is designed to recognize and execute. The 8086 supports more than 20,000 instruction variations!',
          'Execution Flow: The 8086 decodes instruction bytes in its Execution Unit (EU) after the Bus Interface Unit (BIU) fetches them from memory into the prefetch queue.'
        ]
      },
      {
        id: 'm10-s2',
        title: '2. Instruction Format 🧩',
        moduleTitle: 'Module 10: 8086 Instruction Set',
        moduleId: 'm10',
        points: [
          'Learn opcode, operands, instruction length, and machine code.',
          'Length Variability: 8086 instructions are variable-length, ranging from 1 byte (e.g., NOP, CLC) up to 6 bytes (e.g., complex memory addressing with displacements).',
          'Opcode (Operation Code): Specifies the type of operation to perform (e.g., 100010 for MOV). It is usually 6 bits, followed by D and W bits.',
          'D (Direction) & W (Word/Byte) Bits: D = 1 means data flows to register (REG field); D = 0 means data flows to memory/reg (R/M field). W = 1 indicates a 16-bit word operation; W = 0 indicates an 8-bit byte operation.',
          'MOD-REG-R/M Byte: Determines the addressing modes, registers, or memory displacements used as operands.'
        ]
      },
      {
        id: 'm10-s3',
        title: '3. Data Transfer Instructions 🔄',
        moduleTitle: 'Module 10: 8086 Instruction Set',
        moduleId: 'm10',
        points: [
          'MOV: Moves (actually copies) byte or word from source to destination (e.g., MOV AX, BX). Note: Memory-to-Memory moves are illegal!',
          'PUSH & POP: Manipulates the stack segment. PUSH decrements SP by 2 and writes a 16-bit word. POP reads a 16-bit word and increments SP by 2.',
          'XCHG: Exchanges/swaps contents of two registers or register and memory (e.g., XCHG AX, BX). Segment registers are illegal here.',
          'LEA (Load Effective Address): Calculates the 16-bit logical offset of a memory variable and loads it into a target register (e.g., LEA BX, [SI+4]).',
          'Use the Interactive Simulator on the right to load and test Data Transfer instructions like MOV, PUSH, POP, and LEA.'
        ],
        interactiveType: 'instruction-decoder'
      },
      {
        id: 'm10-s4',
        title: '4. Arithmetic Instructions ➕',
        moduleTitle: 'Module 10: 8086 Instruction Set',
        moduleId: 'm10',
        points: [
          'ADD & ADC: Adds source and destination. ADC (Add with Carry) also includes the current value of the Carry Flag, which is crucial for 32-bit or higher multi-word math.',
          'SUB & SBB: Subtracts source from destination. SBB (Subtract with Borrow) also subtracts the Carry/Borrow flag.',
          'INC & DEC: Increments or decrements a register/memory by 1 (e.g., INC CX). Note: INC/DEC do NOT affect the Carry Flag (CF)!',
          'MUL & DIV: Performs unsigned multiplication and division. AX (and DX) are used implicitly. Division by zero triggers an instant Type 0 CPU Exception.',
          'CMP: Subtracts source from destination but does NOT save the result; it only updates status flags (ZF, CF, SF) to compare values.'
        ],
        interactiveType: 'instruction-decoder'
      },
      {
        id: 'm10-s5',
        title: '5. Logical Instructions ⚙️',
        moduleTitle: 'Module 10: 8086 Instruction Set',
        moduleId: 'm10',
        points: [
          'AND & OR: Performs bitwise AND / OR operations. Useful for masking out bits (AND clears bits, OR sets bits). Affects CF, OF, ZF, PF, and SF.',
          'XOR: Performs bitwise Exclusive-OR (e.g., XOR AX, AX). A classic, fast way to clear a register to 0000H with smaller machine code size than MOV AX, 0.',
          'NOT: Inverts all bits of an operand (one\'s complement). Note: NOT does NOT affect any status flags!',
          'TEST: Performs a logical AND on operands but does NOT store the result; only updates flags (ZF, SF, PF). Perfect for checking if a specific bit is set (e.g., TEST AL, 01H).'
        ],
        interactiveType: 'instruction-decoder'
      },
      {
        id: 'm10-s6',
        title: '6. Shift & Rotate Instructions 🔁',
        moduleTitle: 'Module 10: 8086 Instruction Set',
        moduleId: 'm10',
        points: [
          'SHL / SHR: Logical shift left and right. Moves bits left/right, inserting 0 into empty positions. The last bit shifted out enters the Carry Flag (CF).',
          'SAR: Arithmetic shift right. Shifts bits right while preserving the sign bit (most significant bit). Critical for signed division by powers of 2.',
          'ROL / ROR: Rotate left and right. Bits shifted out of one end wrap around and enter the other end, and are also copied into the Carry Flag (CF).',
          'RCL / RCR: Rotate through Carry left and right. Bits are rotated through the Carry Flag, making the Carry Flag act as a 17th bit of the register.'
        ],
        interactiveType: 'instruction-decoder'
      },
      {
        id: 'm10-s7',
        title: '7. Branch & Control Transfer Instructions 🔀',
        moduleTitle: 'Module 10: 8086 Instruction Set',
        moduleId: 'm10',
        points: [
          'Unconditional Branch: JMP directs the Instruction Pointer (IP) immediately to a new memory offset address.',
          'Conditional Jumps: Jumps are executed only if a specific status flag condition is met (e.g., JZ/JE jumps if ZF=1; JC/JB jumps if CF=1). They use an 8-bit relative displacement (-128 to +127 bytes).',
          'LOOP: Automatically decrements CX by 1. If CX is not 0, it jumps to the specified target label. Avoids manually writing DEC CX followed by JNZ.',
          'CALL & RET: Used for subroutines (procedures). CALL pushes the current IP (and CS for far calls) onto the stack and jumps; RET pops the saved IP back, returning to the caller.'
        ],
        interactiveType: 'instruction-decoder'
      },
      {
        id: 'm10-s8',
        title: '8. String Instructions 📦',
        moduleTitle: 'Module 10: 8086 Instruction Set',
        moduleId: 'm10',
        points: [
          'MOVS / MOVSB / MOVSW: Copies a byte or word from source string [DS:SI] to destination string [ES:DI]. SI and DI are automatically adjusted.',
          'Direction Flag (DF): Cleared with CLD (auto-increment SI/DI by 1 or 2) or set with STD (auto-decrement SI/DI). Must always be initialized before string operations!',
          'LODS & STOS: LODS loads AL/AX with string elements at [SI]; STOS stores AL/AX to string memory at [DI].',
          'CMPS & SCAS: CMPS compares strings byte/word by byte/word; SCAS scans a string looking for a match with AL/AX.',
          'REP / REPE / REPNE Prefix: Repeats the string instruction CX times, automatically decrementing CX and updating SI/DI on each iteration.'
        ],
        interactiveType: 'instruction-decoder'
      },
      {
        id: 'm10-s9',
        title: '9. Processor Control Instructions 🎛️',
        moduleTitle: 'Module 10: 8086 Instruction Set',
        moduleId: 'm10',
        points: [
          'Flag Clear & Set: CLI/STI clears/sets the Interrupt Enable Flag (IF) to disable/enable maskable interrupts. CLC/STC clears/sets Carry Flag (CF). CLD/STD clears/sets Direction Flag (DF).',
          'HLT: Halts CPU execution. The CPU enters an idle state until a hardware interrupt or reset occurs.',
          'NOP (No Operation): Takes 1 byte of space and 3 clock cycles of time, performing no operation. Frequently used for creating software time delays or patching machine code.',
          'ESC (Escape): Provides an instruction prefix allowing external co-processors (like the 8087 Numeric Data Processor) to read data/instructions from the 8086 bus.',
          'LOCK Prefix: Asserts the hardware LOCK pin to prevent other bus masters from taking control of the system bus during multi-processor shared resource operations.'
        ],
        interactiveType: 'instruction-decoder'
      },
      {
        id: 'm10-quiz',
        title: 'Module 10 Recap Quiz',
        moduleTitle: 'Module 10: 8086 Instruction Set',
        moduleId: 'm10',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'Which of the following instructions is physically illegal in the 8086 microprocessor architecture?',
            options: ['MOV AX, [BX]', 'MOV [BX], [DI]', 'MOV DS, AX', 'MOV AL, [SI + 02H]'],
            correctAnswer: 1,
            explanation: 'The 8086 does not support memory-to-memory data transfers directly. "MOV [BX], [DI]" is illegal because both operands cannot refer to memory locations in a single instruction. You must first load the source value into a register, then store it.'
          },
          {
            question: 'What happens to the Carry Flag (CF) when the "INC CX" instruction is executed in an 8086 processor?',
            options: ['CF is set to 1 if CX overflows from FFFFH to 0000H', 'CF is unaffected because INC and DEC instructions do not alter the Carry Flag', 'CF is always cleared to 0', 'CF is set to the value of the auxiliary carry flag'],
            correctAnswer: 1,
            explanation: 'In the 8086 instruction set, the INC (Increment) and DEC (Decrement) instructions do NOT affect the Carry Flag (CF). They do affect other status flags like ZF, SF, OF, PF, and AF, but the Carry Flag is explicitly preserved.'
          },
          {
            question: 'Which of the following shift instructions preserves the sign bit (most significant bit) of the operand, allowing for signed division?',
            options: ['SHL (Shift Left)', 'SHR (Shift Right)', 'SAR (Shift Arithmetic Right)', 'ROL (Rotate Left)'],
            correctAnswer: 2,
            explanation: 'SAR (Shift Arithmetic Right) shifts bits to the right, but instead of inserting a 0 at the MSB (like SHR does), it duplicates the current sign bit (MSB). This preserves the arithmetic sign of signed numbers.'
          },
          {
            question: 'What are the default segment registers used by the source index (SI) and destination index (DI) in string instructions (like MOVSB)?',
            options: ['SI uses DS; DI uses ES', 'SI uses DS; DI uses SS', 'SI uses CS; DI uses ES', 'SI uses ES; DI uses DS'],
            correctAnswer: 0,
            explanation: 'In 8086 string operations, the source operand is always pointed to by SI and is located in the Data Segment (DS) by default. The destination operand is always pointed to by DI and is strictly located in the Extra Segment (ES).'
          },
          {
            question: 'Which instruction clears the Direction Flag (DF) to ensure that SI and DI increment automatically during string operations?',
            options: ['STD', 'CLD', 'CLI', 'CLC'],
            correctAnswer: 1,
            explanation: 'CLD (Clear Direction Flag) sets DF = 0, which directs the 8086 string execution logic to automatically increment SI and DI after each step. STD sets DF = 1, which causes them to decrement.'
          },
          {
            question: 'What occurs when the CPU attempts to execute a "DIV CX" instruction but the divisor in CX is 0000H?',
            options: ['The instruction is ignored and the program continues', 'The division result is set to FFFFH and Carry is set', 'The CPU instantly triggers a Type 0 (Divide by Zero) hardware interrupt exception', 'The CPU halts execution permanently'],
            correctAnswer: 2,
            explanation: 'When a division by zero is attempted on the 8086, the processor automatically suspends normal execution and executes a Type 0 (Divide by Zero) interrupt exception handler to safely deal with the mathematical error.'
          }
        ]
      }
    ]
  },"""

# First, rename "Module 10" references to "Module 11"
content = content.replace("Module 10: Assembler Directives", "Module 11: Assembler Directives")
content = content.replace("Module 10 Recap Quiz", "Module 11 Recap Quiz")

# Second, rename "Module 11" references to "Module 12"
content = content.replace("Module 11: Writing Simple Programs", "Module 12: Writing Simple Programs")
content = content.replace("Module 12: Writing Simple Programs", "Module 13: Writing Simple Programs") # wait, let's keep modules strictly sequential!
# Wait, let's see what was the original name of Module 11 in the file:
# line 1012: title: 'Module 11: Writing Simple Programs'
# let's replace "Module 11" with "Module 12"
content = content.replace("Module 11: Writing Simple Programs", "Module 12: Writing Simple Programs")
content = content.replace("Module 11 Recap Quiz", "Module 12 Recap Quiz")

# Let's verify that the target insertion spot works
target_m11_start = """  {
    id: 'm11',
    title: 'Module 11: Assembler Directives',"""

if target_m11_start in content:
    new_content = content.replace(target_m11_start, m10_str + "\n" + target_m11_start)
    with open("./src/data/courseData.ts", "w") as f:
        f.write(new_content)
    print("Success: Inserted module and renamed other modules successfully.")
else:
    # Let's try searching without spaces/formatting
    # We will fallback to a safer pattern replacement if needed
    print("Error: Could not find exact target start")
