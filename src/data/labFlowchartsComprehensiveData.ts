export interface FlowchartBranch {
  label: string; // e.g. "YES" or "NO"
  conditionText: string; // e.g. "CX = 0 (Loop Complete)" or "SF = 1 (MSB is 1)"
  action: string; // e.g. "Proceed to Subtraction Phase" or "Loop back to ADD_LOOP"
  asmBranchInstruction?: string; // e.g. "JNZ ADD_LOOP" or "JS NEGATIVE_BLOCK"
  targetLabel?: string; // Target step label or subroutine
  targetNodeId?: string; // Target step ID if specified directly
  isLoopBack?: boolean; // True if this branch loops backwards
  color: 'emerald' | 'rose' | 'amber' | 'blue' | 'purple';
}

export interface BranchTargetResolution {
  targetStepNum: number;
  targetTitle: string;
  stepText: string;
  isLoopBack: boolean;
}

export function resolveBranchTarget(
  branch: FlowchartBranch | undefined,
  nodes: FlowchartNode[],
  currentIndex: number
): BranchTargetResolution | null {
  if (!branch) return null;

  // 1. Match by targetNodeId if available
  if (branch.targetNodeId) {
    const idx = nodes.findIndex(n => n.id === branch.targetNodeId);
    if (idx !== -1) {
      return {
        targetStepNum: idx + 1,
        targetTitle: nodes[idx].label,
        stepText: `Step ${idx + 1}: ${nodes[idx].label}`,
        isLoopBack: !!branch.isLoopBack || idx <= currentIndex
      };
    }
  }

  // 2. Match by targetLabel
  if (branch.targetLabel) {
    const targetQuery = branch.targetLabel.toLowerCase().trim();
    const foundIdx = nodes.findIndex((n, i) => {
      if (i === currentIndex) return false;
      const l = n.label.toLowerCase();
      const s = (n.subLabel || '').toLowerCase();
      const a = (n.asmCode || '').toLowerCase();
      return l.includes(targetQuery) || targetQuery.includes(l) || s.includes(targetQuery) || a.includes(targetQuery);
    });

    if (foundIdx !== -1) {
      return {
        targetStepNum: foundIdx + 1,
        targetTitle: nodes[foundIdx].label,
        stepText: `Step ${foundIdx + 1}: ${nodes[foundIdx].label}`,
        isLoopBack: !!branch.isLoopBack || foundIdx <= currentIndex
      };
    }
  }

  // 3. If loop back and no exact match found, search backwards for closest previous process node
  if (branch.isLoopBack) {
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (nodes[i].type === 'process') {
        return {
          targetStepNum: i + 1,
          targetTitle: nodes[i].label,
          stepText: `Step ${i + 1}: ${nodes[i].label}`,
          isLoopBack: true
        };
      }
    }
  }

  // 4. Default fallthrough to next step
  if (currentIndex + 1 < nodes.length) {
    return {
      targetStepNum: currentIndex + 2,
      targetTitle: nodes[currentIndex + 1].label,
      stepText: `Step ${currentIndex + 2}: ${nodes[currentIndex + 1].label}`,
      isLoopBack: false
    };
  }

  return {
    targetStepNum: currentIndex + 1,
    targetTitle: 'End of Program',
    stepText: `Step ${currentIndex + 1}`,
    isLoopBack: false
  };
}

export interface FlowchartNode {
  id: string;
  type: 'start' | 'process' | 'decision' | 'io' | 'stop';
  label: string;
  subLabel?: string;
  asmCode?: string;
  // If type === 'decision', provide rich YES and NO branches:
  decisionQuery?: string;
  hardwareFlagTested?: string;
  yesBranch?: FlowchartBranch;
  noBranch?: FlowchartBranch;
}

export interface LabExperimentFlowchart {
  expId: string;
  title: string;
  overview: string;
  nodes: FlowchartNode[];
}

export const LAB_FLOWCHARTS: Record<string, LabExperimentFlowchart> = {
  exp1: {
    expId: 'exp1',
    title: '32-Bit Multi-precision Addition & Subtraction',
    overview: 'Sequential byte-by-byte arithmetic using carry/borrow ripple loops with 16-bit register pointers.',
    nodes: [
      {
        id: 'start',
        type: 'start',
        label: 'START',
        subLabel: 'Initialize Program & Load Data Segment (DS = @DATA)'
      },
      {
        id: 'init_add',
        type: 'process',
        label: 'Initialize Addition Pointers & Clear Carry',
        subLabel: 'SI=&NUM1, DI=&NUM2, BX=&RESULT_ADD, CX=4 (Bytes Count)',
        asmCode: 'MOV SI, OFFSET NUM1\nMOV DI, OFFSET NUM2\nMOV BX, OFFSET RESULT_ADD\nMOV CX, 4\nCLC'
      },
      {
        id: 'add_byte',
        type: 'process',
        label: 'Byte Addition with Carry Propagation',
        subLabel: 'AL = [SI]; AL = AL + [DI] + CF; Store [BX] = AL',
        asmCode: 'ADD_LOOP:\nMOV AL, [SI]\nADC AL, [DI]\nMOV [BX], AL\nINC SI\nINC DI\nINC BX'
      },
      {
        id: 'dec_add_loop',
        type: 'decision',
        label: 'Is Addition Loop CX = 0?',
        decisionQuery: 'DEC CX → Is CX == 0 (Zero Flag ZF = 1)?',
        hardwareFlagTested: 'CX Counter / Zero Flag (ZF)',
        yesBranch: {
          label: 'YES (CX = 0)',
          conditionText: 'All 4 bytes added successfully (ZF = 1)',
          action: 'Exit addition loop. Propagate final Carry (CF) into memory FINAL_CARRY using ADC AL, 0.',
          asmBranchInstruction: 'JNZ ADD_LOOP (Fall-through when CX=0)',
          targetLabel: 'Save Final Carry',
          isLoopBack: false,
          color: 'emerald'
        },
        noBranch: {
          label: 'NO (CX ≠ 0)',
          conditionText: 'More bytes remaining in 32-bit word (ZF = 0)',
          action: 'Loop back to ADD_LOOP to fetch and add next byte with carry.',
          asmBranchInstruction: 'DEC CX\nJNZ ADD_LOOP (Jump if Not Zero)',
          targetLabel: 'Byte Addition with Carry',
          isLoopBack: true,
          color: 'amber'
        }
      },
      {
        id: 'save_carry',
        type: 'io',
        label: 'Save Final Addition Carry Flag',
        subLabel: 'MOV AL, 0; ADC AL, 0; MOV FINAL_CARRY, AL',
        asmCode: 'MOV AL, 0\nADC AL, 0\nMOV FINAL_CARRY, AL'
      },
      {
        id: 'init_sub',
        type: 'process',
        label: 'Initialize Subtraction Pointers & Clear Borrow',
        subLabel: 'Reset SI=&NUM1, DI=&NUM2, BX=&RESULT_SUB, CX=4; CLC',
        asmCode: 'MOV SI, OFFSET NUM1\nMOV DI, OFFSET NUM2\nMOV BX, OFFSET RESULT_SUB\nMOV CX, 4\nCLC'
      },
      {
        id: 'sub_byte',
        type: 'process',
        label: 'Byte Subtraction with Borrow Propagation',
        subLabel: 'AL = [SI]; AL = AL - [DI] - CF; Store [BX] = AL',
        asmCode: 'SUB_LOOP:\nMOV AL, [SI]\nSBB AL, [DI]\nMOV [BX], AL\nINC SI\nINC DI\nINC BX'
      },
      {
        id: 'dec_sub_loop',
        type: 'decision',
        label: 'Is Subtraction Loop CX = 0?',
        decisionQuery: 'DEC CX → Is CX == 0 (Zero Flag ZF = 1)?',
        hardwareFlagTested: 'CX Counter / Zero Flag (ZF)',
        yesBranch: {
          label: 'YES (CX = 0)',
          conditionText: 'All 4 bytes subtracted (ZF = 1)',
          action: 'Exit subtraction loop. Propagate final Borrow (CF) into memory FINAL_BORROW.',
          asmBranchInstruction: 'JNZ SUB_LOOP (Fall-through)',
          targetLabel: 'Save Final Borrow',
          isLoopBack: false,
          color: 'emerald'
        },
        noBranch: {
          label: 'NO (CX ≠ 0)',
          conditionText: 'More bytes remaining in 32-bit word',
          action: 'Loop back to SUB_LOOP to subtract next byte with borrow.',
          asmBranchInstruction: 'LOOP SUB_LOOP',
          targetLabel: 'Byte Subtraction with Borrow',
          isLoopBack: true,
          color: 'amber'
        }
      },
      {
        id: 'save_borrow',
        type: 'io',
        label: 'Save Final Subtraction Borrow Flag',
        subLabel: 'MOV AL, 0; ADC AL, 0; MOV FINAL_BORROW, AL',
        asmCode: 'MOV AL, 0\nADC AL, 0\nMOV FINAL_BORROW, AL'
      },
      {
        id: 'stop',
        type: 'stop',
        label: 'STOP',
        subLabel: 'Terminate via DOS INT 21H Service 4CH'
      }
    ]
  },

  exp2: {
    expId: 'exp2',
    title: 'Signed and Unsigned Multiplication & Division',
    overview: '16-bit word multiplication and division with sign-extension and doubleword register pair handling.',
    nodes: [
      { id: 'start', type: 'start', label: 'START', subLabel: 'Initialize Program (DS = @DATA)' },
      {
        id: 'u_mul',
        type: 'process',
        label: 'Unsigned 16-bit Multiplication',
        subLabel: 'AX = VAL1; MUL VAL2 → Product in DX:AX',
        asmCode: 'MOV AX, VAL1\nMUL VAL2\nMOV U_PROD_L, AX\nMOV U_PROD_H, DX'
      },
      {
        id: 's_mul',
        type: 'process',
        label: 'Signed 16-bit Multiplication',
        subLabel: 'AX = S_VAL1; IMUL S_VAL2 → 2\'s Complement Product in DX:AX',
        asmCode: 'MOV AX, S_VAL1\nIMUL S_VAL2\nMOV S_PROD_L, AX\nMOV S_PROD_H, DX'
      },
      {
        id: 'check_div_zero',
        type: 'decision',
        label: 'Is Divisor VAL2 == 0?',
        decisionQuery: 'CMP VAL2, 0 → Is Divisor Zero?',
        hardwareFlagTested: 'Zero Flag (ZF)',
        yesBranch: {
          label: 'YES (Divisor = 0)',
          conditionText: 'Zero divisor detected',
          action: 'Abort division to prevent Type 0 Divide Error Interrupt exception.',
          asmBranchInstruction: 'JZ DIV_BY_ZERO_HANDLER',
          targetLabel: 'Error Exit',
          isLoopBack: false,
          color: 'rose'
        },
        noBranch: {
          label: 'NO (Divisor ≠ 0)',
          conditionText: 'Divisor is safe and non-zero',
          action: 'Proceed to clear DX (XOR DX, DX) and execute 16-bit unsigned division DIV VAL2.',
          asmBranchInstruction: 'JNZ SAFE_DIV',
          targetLabel: 'Perform Division',
          isLoopBack: false,
          color: 'emerald'
        }
      },
      {
        id: 'u_div',
        type: 'process',
        label: 'Unsigned 16-bit Division',
        subLabel: 'Clear DX=0; AX=VAL1; DIV VAL2 → Quotient in AX, Remainder in DX',
        asmCode: 'XOR DX, DX\nMOV AX, VAL1\nDIV VAL2\nMOV U_QUOT, AX\nMOV U_REM, DX'
      },
      {
        id: 's_div',
        type: 'process',
        label: 'Signed 16-bit Division with Sign Extension (CWD)',
        subLabel: 'AX = S_VAL1; CWD (Extends sign bit of AX into DX); IDIV S_VAL2',
        asmCode: 'MOV AX, S_VAL1\nCWD\nIDIV S_VAL2\nMOV S_QUOT, AX\nMOV S_REM, DX'
      },
      {
        id: 'save_div',
        type: 'io',
        label: 'Store Quotients and Remainders to RAM',
        subLabel: 'Save U_QUOT, U_REM, S_QUOT, S_REM variables',
        asmCode: 'MOV S_QUOT, AX\nMOV S_REM, DX'
      },
      { id: 'stop', type: 'stop', label: 'STOP', subLabel: 'Terminate execution via INT 21H 4CH' }
    ]
  },

  exp_math: {
    expId: 'exp_math',
    title: 'Square, Cube & Factorial of a Number',
    overview: 'Accumulator arithmetic computing power functions and iterative factorial multiplication.',
    nodes: [
      { id: 'start', type: 'start', label: 'START', subLabel: 'Load Data Segment & Read Input N' },
      {
        id: 'calc_sq_cube',
        type: 'process',
        label: 'Compute Square & Cube',
        subLabel: 'Square: AX=N, BX=N, MUL BX → SQUARE; Cube: MUL BX again → CUBE',
        asmCode: 'MOV AX, N\nMOV BX, N\nMUL BX\nMOV SQUARE, AX\nMUL BX\nMOV CUBE, AX'
      },
      {
        id: 'init_fact',
        type: 'process',
        label: 'Initialize Factorial Loop Accumulator',
        subLabel: 'Set Accumulator AX = 1, Loop Counter CX = N',
        asmCode: 'MOV AX, 1\nMOV CX, N'
      },
      {
        id: 'check_n_zero',
        type: 'decision',
        label: 'Is Initial CX == 0 or CX == 1?',
        decisionQuery: 'CMP CX, 1 → Is N ≤ 1 (Base Case)?',
        hardwareFlagTested: 'Zero Flag (ZF) / Sign Flag (SF)',
        yesBranch: {
          label: 'YES (N ≤ 1)',
          conditionText: '0! = 1 and 1! = 1',
          action: 'Skip factorial multiplication loop; AX is already initialized to 1.',
          asmBranchInstruction: 'JBE FACT_DONE',
          targetLabel: 'Save Factorial Result',
          isLoopBack: false,
          color: 'emerald'
        },
        noBranch: {
          label: 'NO (N > 1)',
          conditionText: 'Iterative multiplication required',
          action: 'Enter multiplication loop: AX = AX * CX, followed by loop counter decrement.',
          asmBranchInstruction: 'JA FACT_LOOP',
          targetLabel: 'Multiply AX by CX',
          isLoopBack: false,
          color: 'blue'
        }
      },
      {
        id: 'fact_step',
        type: 'process',
        label: 'Multiply Accumulator by Counter',
        subLabel: 'MUL CX (AX = AX * CX)',
        asmCode: 'FACT_LOOP:\nMUL CX'
      },
      {
        id: 'dec_fact_loop',
        type: 'decision',
        label: 'Is Decremented CX == 1?',
        decisionQuery: 'DEC CX → Is CX == 1 (Terminal factor reached)?',
        hardwareFlagTested: 'Zero Flag (ZF) / CX Counter',
        yesBranch: {
          label: 'YES (CX = 1)',
          conditionText: 'All factor terms multiplied (1 to N)',
          action: 'Factorial computation complete; save AX result to FACT memory variable.',
          asmBranchInstruction: 'LOOP FACT_LOOP (Done when CX=1)',
          targetLabel: 'Save Factorial',
          isLoopBack: false,
          color: 'emerald'
        },
        noBranch: {
          label: 'NO (CX > 1)',
          conditionText: 'More multiplication factors remain',
          action: 'Loop back to FACT_LOOP to multiply current AX by new CX value.',
          asmBranchInstruction: 'DEC CX\nJNZ FACT_LOOP',
          targetLabel: 'Multiply AX by CX',
          isLoopBack: true,
          color: 'amber'
        }
      },
      {
        id: 'save_fact',
        type: 'io',
        label: 'Store Factorial Result in Memory',
        subLabel: 'MOV FACT, AX',
        asmCode: 'MOV FACT, AX'
      },
      { id: 'stop', type: 'stop', label: 'STOP', subLabel: 'Exit cleanly via INT 21H 4CH' }
    ]
  },

  exp_bit1: {
    expId: 'exp_bit1',
    title: 'Positive or Negative Data Check',
    overview: 'Sign evaluation using bitwise masking and conditional jump based on the Sign Flag (SF).',
    nodes: [
      { id: 'start', type: 'start', label: 'START', subLabel: 'Initialize Program & Load Data Byte' },
      {
        id: 'load_and_test',
        type: 'process',
        label: 'Load Byte & Isolate Sign Bit (Bit 7)',
        subLabel: 'AL = DATA_VAL; TEST AL, 80H (Updates SF and ZF without modifying AL)',
        asmCode: 'MOV AL, DATA_VAL\nTEST AL, 80H'
      },
      {
        id: 'check_sign_bit',
        type: 'decision',
        label: 'Is Sign Bit (Bit 7) == 1?',
        decisionQuery: 'TEST AL, 80H → Is Sign Flag SF == 1 (Negative)?',
        hardwareFlagTested: 'Sign Flag (SF)',
        yesBranch: {
          label: 'YES (SF = 1, Bit 7 = 1)',
          conditionText: 'MSB is set; Number is Negative (< 0)',
          action: 'Jump to NEGATIVE_HANDLER and set result flag BL = 01H (Negative indicator).',
          asmBranchInstruction: 'JS IS_NEGATIVE (Jump on Sign)',
          targetLabel: 'Negative Branch (BL = 01H)',
          isLoopBack: false,
          color: 'rose'
        },
        noBranch: {
          label: 'NO (SF = 0, Bit 7 = 0)',
          conditionText: 'MSB is 0; Number is Positive (≥ 0)',
          action: 'Execute positive path: Set result flag BL = 00H (Positive indicator).',
          asmBranchInstruction: 'JNS IS_POSITIVE (or fall-through)',
          targetLabel: 'Positive Branch (BL = 00H)',
          isLoopBack: false,
          color: 'emerald'
        }
      },
      {
        id: 'set_pos',
        type: 'process',
        label: 'Handle Positive Result: Set BL = 00H',
        subLabel: 'MOV BL, 00H; JMP SAVE_RESULT',
        asmCode: 'MOV BL, 00H\nJMP STORE_RES'
      },
      {
        id: 'set_neg',
        type: 'process',
        label: 'Handle Negative Result: Set BL = 01H',
        subLabel: 'IS_NEGATIVE:\nMOV BL, 01H',
        asmCode: 'IS_NEGATIVE:\nMOV BL, 01H'
      },
      {
        id: 'save_result',
        type: 'io',
        label: 'Store Result Flag in Memory',
        subLabel: 'STORE_RES:\nMOV RESULT, BL (00H = Positive, 01H = Negative)',
        asmCode: 'STORE_RES:\nMOV RESULT, BL'
      },
      { id: 'stop', type: 'stop', label: 'STOP', subLabel: 'Terminate via INT 21H' }
    ]
  },

  exp_bit2: {
    expId: 'exp_bit2',
    title: 'Odd or Even Data Check',
    overview: 'Parity determination by masking the Least Significant Bit (LSB) and branching on Zero Flag (ZF).',
    nodes: [
      { id: 'start', type: 'start', label: 'START', subLabel: 'Initialize Program & Load Data Byte' },
      {
        id: 'load_and_test_lsb',
        type: 'process',
        label: 'Load Byte & Mask LSB (Bit 0)',
        subLabel: 'AL = DATA_VAL; TEST AL, 01H (Updates ZF without altering AL register)',
        asmCode: 'MOV AL, DATA_VAL\nTEST AL, 01H'
      },
      {
        id: 'check_lsb_zero',
        type: 'decision',
        label: 'Is LSB (Bit 0) == 0 (ZF = 1)?',
        decisionQuery: 'TEST AL, 01H → Is Zero Flag ZF == 1 (Even)?',
        hardwareFlagTested: 'Zero Flag (ZF)',
        yesBranch: {
          label: 'YES (ZF = 1, Bit 0 = 0)',
          conditionText: 'LSB is 0; Number is Even',
          action: 'Jump to EVEN_HANDLER and set result flag BL = 00H (Even indicator).',
          asmBranchInstruction: 'JZ IS_EVEN (Jump if Zero)',
          targetLabel: 'Even Branch (BL = 00H)',
          isLoopBack: false,
          color: 'emerald'
        },
        noBranch: {
          label: 'NO (ZF = 0, Bit 0 = 1)',
          conditionText: 'LSB is 1; Number is Odd',
          action: 'Execute odd path: Set result flag BL = 01H (Odd indicator).',
          asmBranchInstruction: 'JNZ IS_ODD (or fall-through)',
          targetLabel: 'Odd Branch (BL = 01H)',
          isLoopBack: false,
          color: 'purple'
        }
      },
      {
        id: 'set_odd',
        type: 'process',
        label: 'Handle Odd Result: Set BL = 01H',
        subLabel: 'MOV BL, 01H; JMP STORE_RES',
        asmCode: 'MOV BL, 01H\nJMP STORE_RES'
      },
      {
        id: 'set_even',
        type: 'process',
        label: 'Handle Even Result: Set BL = 00H',
        subLabel: 'IS_EVEN:\nMOV BL, 00H',
        asmCode: 'IS_EVEN:\nMOV BL, 00H'
      },
      {
        id: 'save_res',
        type: 'io',
        label: 'Store Result Flag in Memory',
        subLabel: 'STORE_RES:\nMOV RESULT, BL (00H = Even, 01H = Odd)',
        asmCode: 'STORE_RES:\nMOV RESULT, BL'
      },
      { id: 'stop', type: 'stop', label: 'STOP', subLabel: 'Terminate via INT 21H' }
    ]
  },

  exp_bit3: {
    expId: 'exp_bit3',
    title: 'Count Logical Ones and Zeros in a Byte',
    overview: 'Bit-shifting algorithm inspecting Carry Flag (CF) on each right shift across 8 iterations.',
    nodes: [
      { id: 'start', type: 'start', label: 'START', subLabel: 'Load Byte & Init Counters' },
      {
        id: 'init_counters',
        type: 'process',
        label: 'Initialize Shift Loop and Counters',
        subLabel: 'AL = DATA_VAL; BL = 0 (Ones Counter); BH = 0 (Zeros Counter); CX = 8',
        asmCode: 'MOV AL, DATA_VAL\nMOV BL, 0\nMOV BH, 0\nMOV CX, 8'
      },
      {
        id: 'shift_step',
        type: 'process',
        label: 'Shift AL Right by 1 Bit into Carry Flag',
        subLabel: 'SHR AL, 1 (Moves LSB into Carry Flag CF)',
        asmCode: 'COUNT_LOOP:\nSHR AL, 1'
      },
      {
        id: 'check_carry_bit',
        type: 'decision',
        label: 'Is Carry Flag CF == 1?',
        decisionQuery: 'JC → Did shifted bit enter CF as 1 (Logical 1)?',
        hardwareFlagTested: 'Carry Flag (CF)',
        yesBranch: {
          label: 'YES (CF = 1)',
          conditionText: 'Shifted bit was 1',
          action: 'Jump to ONES_HANDLER and execute INC BL (Increment Ones Counter).',
          asmBranchInstruction: 'JC INC_ONES (Jump if Carry)',
          targetLabel: 'Increment BL (Ones)',
          isLoopBack: false,
          color: 'emerald'
        },
        noBranch: {
          label: 'NO (CF = 0)',
          conditionText: 'Shifted bit was 0',
          action: 'Execute zeros path: INC BH (Increment Zeros Counter), then jump to loop check.',
          asmBranchInstruction: 'JNC INC_ZEROS (or fall-through)',
          targetLabel: 'Increment BH (Zeros)',
          isLoopBack: false,
          color: 'blue'
        }
      },
      {
        id: 'inc_zeros',
        type: 'process',
        label: 'Increment Zeros Counter: INC BH',
        subLabel: 'INC BH; JMP NEXT_BIT',
        asmCode: 'INC BH\nJMP NEXT_BIT'
      },
      {
        id: 'inc_ones',
        type: 'process',
        label: 'Increment Ones Counter: INC BL',
        subLabel: 'INC_ONES:\nINC BL',
        asmCode: 'INC_ONES:\nINC BL'
      },
      {
        id: 'dec_cx_loop',
        type: 'decision',
        label: 'Is Bit Loop CX == 0?',
        decisionQuery: 'LOOP COUNT_LOOP → Is CX == 0 (All 8 bits inspected)?',
        hardwareFlagTested: 'CX Counter / Zero Flag (ZF)',
        yesBranch: {
          label: 'YES (CX = 0)',
          conditionText: 'All 8 bits tested',
          action: 'Exit shift loop and store BL (Ones) and BH (Zeros) into RAM.',
          asmBranchInstruction: 'LOOP COUNT_LOOP (Fall-through)',
          targetLabel: 'Store Counts',
          isLoopBack: false,
          color: 'emerald'
        },
        noBranch: {
          label: 'NO (CX > 0)',
          conditionText: 'More bits remaining to shift',
          action: 'Loop back to COUNT_LOOP to shift next bit into CF.',
          asmBranchInstruction: 'LOOP COUNT_LOOP',
          targetLabel: 'Shift AL Right by 1',
          isLoopBack: true,
          color: 'amber'
        }
      },
      {
        id: 'save_counts',
        type: 'io',
        label: 'Store Ones & Zeros Counts in RAM',
        subLabel: 'MOV ONES, BL; MOV ZEROS, BH',
        asmCode: 'MOV ONES, BL\nMOV ZEROS, BH'
      },
      { id: 'stop', type: 'stop', label: 'STOP', subLabel: 'Terminate execution via INT 21H' }
    ]
  },

  exp_arr1: {
    expId: 'exp_arr1',
    title: 'Addition & Subtraction of N Numbers',
    overview: 'Vector summation and difference using index register pointer SI and loop iteration counter CX.',
    nodes: [
      { id: 'start', type: 'start', label: 'START', subLabel: 'Initialize Program & Load Data Segment' },
      {
        id: 'init_sum',
        type: 'process',
        label: 'Initialize Array Pointer & Counter for Addition',
        subLabel: 'SI = OFFSET ARRAY, CX = LEN (5), AL = 0 (Accumulator)',
        asmCode: 'LEA SI, ARRAY\nMOV CX, LEN\nMOV AL, 0'
      },
      {
        id: 'add_elem',
        type: 'process',
        label: 'Add Array Element to Accumulator',
        subLabel: 'ADD AL, [SI]; INC SI',
        asmCode: 'SUM_LOOP:\nADD AL, [SI]\nINC SI'
      },
      {
        id: 'check_sum_loop',
        type: 'decision',
        label: 'Is Sum Loop CX == 0?',
        decisionQuery: 'DEC CX → Is CX == 0 (All N elements added)?',
        hardwareFlagTested: 'CX Counter / Zero Flag (ZF)',
        yesBranch: {
          label: 'YES (CX = 0)',
          conditionText: 'Summation completed across all elements',
          action: 'Exit addition loop. Store AL into memory variable SUM. Re-initialize for Subtraction.',
          asmBranchInstruction: 'LOOP SUM_LOOP (Fall-through)',
          targetLabel: 'Store SUM & Init Sub',
          isLoopBack: false,
          color: 'emerald'
        },
        noBranch: {
          label: 'NO (CX > 0)',
          conditionText: 'More array elements remaining',
          action: 'Loop back to SUM_LOOP to add next array element.',
          asmBranchInstruction: 'DEC CX\nJNZ SUM_LOOP',
          targetLabel: 'Add Array Element',
          isLoopBack: true,
          color: 'amber'
        }
      },
      {
        id: 'init_diff',
        type: 'process',
        label: 'Store SUM & Initialize Subtraction',
        subLabel: 'MOV SUM, AL; SI = OFFSET ARRAY; AL = [SI]; INC SI; CX = LEN - 1',
        asmCode: 'MOV SUM, AL\nLEA SI, ARRAY\nMOV AL, [SI]\nINC SI\nMOV CX, LEN - 1'
      },
      {
        id: 'sub_elem',
        type: 'process',
        label: 'Subtract Element from Accumulator',
        subLabel: 'SUB AL, [SI]; INC SI',
        asmCode: 'DIFF_LOOP:\nSUB AL, [SI]\nINC SI'
      },
      {
        id: 'check_diff_loop',
        type: 'decision',
        label: 'Is Subtraction Loop CX == 0?',
        decisionQuery: 'DEC CX → Is CX == 0 (All N elements subtracted)?',
        hardwareFlagTested: 'CX Counter / Zero Flag (ZF)',
        yesBranch: {
          label: 'YES (CX = 0)',
          conditionText: 'Subtraction completed',
          action: 'Exit subtraction loop. Store AL into memory variable DIFF.',
          asmBranchInstruction: 'LOOP DIFF_LOOP (Fall-through)',
          targetLabel: 'Store DIFF',
          isLoopBack: false,
          color: 'emerald'
        },
        noBranch: {
          label: 'NO (CX > 0)',
          conditionText: 'More elements remaining to subtract',
          action: 'Loop back to DIFF_LOOP.',
          asmBranchInstruction: 'LOOP DIFF_LOOP',
          targetLabel: 'Subtract Element',
          isLoopBack: true,
          color: 'amber'
        }
      },
      {
        id: 'save_diff',
        type: 'io',
        label: 'Store Subtraction Result in Memory',
        subLabel: 'MOV DIFF, AL',
        asmCode: 'MOV DIFF, AL'
      },
      { id: 'stop', type: 'stop', label: 'STOP', subLabel: 'Terminate via INT 21H 4CH' }
    ]
  },

  exp3: {
    expId: 'exp3',
    title: 'Find Largest & Smallest Number in an Array',
    overview: 'Linear array scan tracking dynamic extrema with comparison conditional branches.',
    nodes: [
      { id: 'start', type: 'start', label: 'START', subLabel: 'Initialize Program & Load Data Segment' },
      {
        id: 'init_extrema',
        type: 'process',
        label: 'Initialize Pointers & Initial Min/Max Candidates',
        subLabel: 'SI = OFFSET ARRAY; AL = [SI] (Max Candidate); AH = [SI] (Min Candidate); CX = N - 1',
        asmCode: 'LEA SI, ARRAY\nMOV AL, [SI]\nMOV AH, [SI]\nMOV CX, COUNT - 1'
      },
      {
        id: 'advance_si',
        type: 'process',
        label: 'Advance Pointer to Next Element',
        subLabel: 'INC SI (Point to next candidate element [SI])',
        asmCode: 'SCAN_LOOP:\nINC SI'
      },
      {
        id: 'check_max',
        type: 'decision',
        label: 'Is Current Element [SI] > AL (Max)?',
        decisionQuery: 'CMP [SI], AL → Is [SI] strictly greater than current Max AL?',
        hardwareFlagTested: 'Carry Flag (CF) & Zero Flag (ZF)',
        yesBranch: {
          label: 'YES ([SI] > AL)',
          conditionText: 'New maximum discovered in array',
          action: 'Update Max candidate register: AL = [SI].',
          asmBranchInstruction: 'JA UPDATE_MAX (Jump if Above)',
          targetLabel: 'Update AL = [SI]',
          isLoopBack: false,
          color: 'emerald'
        },
        noBranch: {
          label: 'NO ([SI] ≤ AL)',
          conditionText: 'Current element is not greater than existing Max',
          action: 'Retain current AL; bypass Max update and proceed directly to Min comparison.',
          asmBranchInstruction: 'JBE CHECK_MIN (Jump if Below or Equal)',
          targetLabel: 'Check Minimum',
          isLoopBack: false,
          color: 'blue'
        }
      },
      {
        id: 'update_max',
        type: 'process',
        label: 'Update Maximum Value: AL = [SI]',
        subLabel: 'UPDATE_MAX:\nMOV AL, [SI]',
        asmCode: 'UPDATE_MAX:\nMOV AL, [SI]'
      },
      {
        id: 'check_min',
        type: 'decision',
        label: 'Is Current Element [SI] < AH (Min)?',
        decisionQuery: 'CMP [SI], AH → Is [SI] strictly smaller than current Min AH?',
        hardwareFlagTested: 'Carry Flag (CF)',
        yesBranch: {
          label: 'YES ([SI] < AH)',
          conditionText: 'New minimum discovered in array',
          action: 'Update Min candidate register: AH = [SI].',
          asmBranchInstruction: 'JB UPDATE_MIN (Jump if Below)',
          targetLabel: 'Update AH = [SI]',
          isLoopBack: false,
          color: 'emerald'
        },
        noBranch: {
          label: 'NO ([SI] ≥ AH)',
          conditionText: 'Current element is not smaller than existing Min',
          action: 'Retain current AH; proceed directly to loop counter evaluation.',
          asmBranchInstruction: 'JAE NEXT_ELEM (Jump if Above or Equal)',
          targetLabel: 'Loop Counter Check',
          isLoopBack: false,
          color: 'blue'
        }
      },
      {
        id: 'update_min',
        type: 'process',
        label: 'Update Minimum Value: AH = [SI]',
        subLabel: 'UPDATE_MIN:\nMOV AH, [SI]',
        asmCode: 'UPDATE_MIN:\nMOV AH, [SI]'
      },
      {
        id: 'check_scan_loop',
        type: 'decision',
        label: 'Is Scan Counter CX == 0?',
        decisionQuery: 'DEC CX → Is CX == 0 (All N array elements inspected)?',
        hardwareFlagTested: 'CX Counter / Zero Flag (ZF)',
        yesBranch: {
          label: 'YES (CX = 0)',
          conditionText: 'All elements processed',
          action: 'Exit scan loop; save AL (MAX_VAL) and AH (MIN_VAL) into memory.',
          asmBranchInstruction: 'LOOP SCAN_LOOP (Fall-through)',
          targetLabel: 'Store Max and Min',
          isLoopBack: false,
          color: 'emerald'
        },
        noBranch: {
          label: 'NO (CX > 0)',
          conditionText: 'More elements remaining in array',
          action: 'Loop back to SCAN_LOOP to advance SI and evaluate next element.',
          asmBranchInstruction: 'LOOP SCAN_LOOP',
          targetLabel: 'Advance Pointer SI',
          isLoopBack: true,
          color: 'amber'
        }
      },
      {
        id: 'save_extrema',
        type: 'io',
        label: 'Store Extrema in RAM Variables',
        subLabel: 'MOV MAX_VAL, AL; MOV MIN_VAL, AH',
        asmCode: 'MOV MAX_VAL, AL\nMOV MIN_VAL, AH'
      },
      { id: 'stop', type: 'stop', label: 'STOP', subLabel: 'Terminate via INT 21H' }
    ]
  },

  exp4: {
    expId: 'exp4',
    title: 'Sort Array in Ascending / Descending Order (Bubble Sort)',
    overview: 'Nested bubble-sort loops swapping adjacent memory bytes based on condition comparisons.',
    nodes: [
      { id: 'start', type: 'start', label: 'START', subLabel: 'Initialize Program & Load Data Segment' },
      {
        id: 'init_outer',
        type: 'process',
        label: 'Initialize Outer Pass Counter',
        subLabel: 'DX = COUNT - 1 (Outer passes required)',
        asmCode: 'MOV DX, COUNT - 1'
      },
      {
        id: 'init_inner',
        type: 'process',
        label: 'Start New Pass: Reset Pointer and Inner Counter',
        subLabel: 'OUTER_LOOP:\nLEA SI, ARRAY; CX = DX (Inner comparisons count)',
        asmCode: 'OUTER_LOOP:\nLEA SI, ARRAY\nMOV CX, DX'
      },
      {
        id: 'load_pair',
        type: 'process',
        label: 'Load Adjacent Pair & Compare',
        subLabel: 'AL = [SI]; CMP AL, [SI + 1]',
        asmCode: 'INNER_LOOP:\nMOV AL, [SI]\nCMP AL, [SI + 1]'
      },
      {
        id: 'check_order',
        type: 'decision',
        label: 'Is AL ≤ [SI + 1] (Already In Ascending Order)?',
        decisionQuery: 'CMP AL, [SI+1] → Is AL ≤ [SI+1] (JBE condition)?',
        hardwareFlagTested: 'Carry Flag (CF) & Zero Flag (ZF)',
        yesBranch: {
          label: 'YES (AL ≤ [SI + 1])',
          conditionText: 'Pair is already ordered',
          action: 'Skip swap operation; jump directly to pointer increment (INC SI).',
          asmBranchInstruction: 'JBE SKIP_SWAP (Jump if Below or Equal)',
          targetLabel: 'Skip Swap (INC SI)',
          isLoopBack: false,
          color: 'emerald'
        },
        noBranch: {
          label: 'NO (AL > [SI + 1])',
          conditionText: 'Pair is inverted / out of order',
          action: 'Swap adjacent memory bytes via AH register: [SI] = [SI+1] and [SI+1] = AL.',
          asmBranchInstruction: 'JA DO_SWAP (or fall-through)',
          targetLabel: 'Execute Memory Swap',
          isLoopBack: false,
          color: 'rose'
        }
      },
      {
        id: 'do_swap',
        type: 'process',
        label: 'Swap Inverted Memory Elements',
        subLabel: 'MOV AH, [SI+1]; MOV [SI+1], AL; MOV [SI], AH',
        asmCode: 'MOV AH, [SI + 1]\nMOV [SI + 1], AL\nMOV [SI], AH'
      },
      {
        id: 'inc_si',
        type: 'process',
        label: 'Advance Pointer: INC SI',
        subLabel: 'SKIP_SWAP:\nINC SI',
        asmCode: 'SKIP_SWAP:\nINC SI'
      },
      {
        id: 'check_inner_loop',
        type: 'decision',
        label: 'Is Inner Pass Counter CX == 0?',
        decisionQuery: 'DEC CX → Is CX == 0 (Inner sweep finished)?',
        hardwareFlagTested: 'CX Counter / Zero Flag (ZF)',
        yesBranch: {
          label: 'YES (CX = 0)',
          conditionText: 'Inner pass completed',
          action: 'Proceed to outer counter evaluation.',
          asmBranchInstruction: 'LOOP INNER_LOOP (Fall-through)',
          targetLabel: 'Outer Counter Check',
          isLoopBack: false,
          color: 'emerald'
        },
        noBranch: {
          label: 'NO (CX > 0)',
          conditionText: 'More adjacent pairs in current pass',
          action: 'Loop back to INNER_LOOP to compare next pair.',
          asmBranchInstruction: 'LOOP INNER_LOOP',
          targetLabel: 'Load Adjacent Pair',
          isLoopBack: true,
          color: 'amber'
        }
      },
      {
        id: 'check_outer_loop',
        type: 'decision',
        label: 'Is Outer Pass Counter DX == 0?',
        decisionQuery: 'DEC DX → Is DX == 0 (All N-1 passes completed)?',
        hardwareFlagTested: 'DX Counter / Zero Flag (ZF)',
        yesBranch: {
          label: 'YES (DX = 0)',
          conditionText: 'Array is completely sorted in memory',
          action: 'Exit sorting routine cleanly.',
          asmBranchInstruction: 'DEC DX\nJNZ OUTER_LOOP (Fall-through)',
          targetLabel: 'STOP',
          isLoopBack: false,
          color: 'emerald'
        },
        noBranch: {
          label: 'NO (DX > 0)',
          conditionText: 'Additional sorting passes required',
          action: 'Loop back to OUTER_LOOP to execute the next bubble pass.',
          asmBranchInstruction: 'DEC DX\nJNZ OUTER_LOOP',
          targetLabel: 'Start New Pass',
          isLoopBack: true,
          color: 'amber'
        }
      },
      { id: 'stop', type: 'stop', label: 'STOP', subLabel: 'Sorted array stored in memory; terminate via INT 21H' }
    ]
  },

  exp_str1: {
    expId: 'exp_str1',
    title: 'Find String Length',
    overview: 'High-speed string scanning using REPNE SCASB to detect terminator "$".',
    nodes: [
      { id: 'start', type: 'start', label: 'START', subLabel: 'Initialize Program (ES = DS)' },
      {
        id: 'init_scan',
        type: 'process',
        label: 'Initialize Registers for String Scan',
        subLabel: 'LEA DI, STRING; AL = "$" (Terminator); CX = 0FFFFH; CLD (Direction Flag = 0)',
        asmCode: 'MOV AX, DS\nMOV ES, AX\nLEA DI, STRING\nMOV AL, "$"\nMOV CX, 0FFFFH\nCLD'
      },
      {
        id: 'scan_str',
        type: 'process',
        label: 'Execute Hardware String Scan',
        subLabel: 'REPNE SCASB (Compares AL with ES:[DI], auto-increments DI, decrements CX while not equal)',
        asmCode: 'REPNE SCASB'
      },
      {
        id: 'check_scasb_match',
        type: 'decision',
        label: 'Is Terminator "$" Found (ZF == 1)?',
        decisionQuery: 'SCASB → Is AL == ES:[DI] (Zero Flag ZF = 1)?',
        hardwareFlagTested: 'Zero Flag (ZF)',
        yesBranch: {
          label: 'YES (ZF = 1, "$" Found)',
          conditionText: 'String terminator matched in memory',
          action: 'Stop scanning. Compute exact length via NOT CX, DEC CX.',
          asmBranchInstruction: 'REPNE SCASB (Hardware terminates when ZF=1)',
          targetLabel: 'Compute Length Formula',
          isLoopBack: false,
          color: 'emerald'
        },
        noBranch: {
          label: 'NO (ZF = 0, CX ≠ 0)',
          conditionText: 'Current character is not "$"',
          action: 'REPNE automatically advances DI and scans next byte.',
          asmBranchInstruction: 'REPNE (Internal repeat loop)',
          targetLabel: 'Scan Next Byte',
          isLoopBack: true,
          color: 'amber'
        }
      },
      {
        id: 'calc_len',
        type: 'process',
        label: 'Compute Length from Counter Difference',
        subLabel: 'NOT CX (2\'s complement inversion); DEC CX (Subtract terminator count)',
        asmCode: 'NOT CX\nDEC CX'
      },
      {
        id: 'save_len',
        type: 'io',
        label: 'Store String Length in RAM Variable',
        subLabel: 'MOV STR_LEN, CX',
        asmCode: 'MOV STR_LEN, CX'
      },
      { id: 'stop', type: 'stop', label: 'STOP', subLabel: 'Terminate via INT 21H 4CH' }
    ]
  },

  exp_str2: {
    expId: 'exp_str2',
    title: 'Display the Given String',
    overview: 'Standard output CLI string printing using DOS interrupt INT 21H Function 09H.',
    nodes: [
      { id: 'start', type: 'start', label: 'START', subLabel: 'Initialize Program & Load Data Segment' },
      {
        id: 'load_msg',
        type: 'process',
        label: 'Load String Offset Address into DX',
        subLabel: 'LEA DX, MESSAGE (String must terminate with "$")',
        asmCode: 'MOV AX, @DATA\nMOV DS, AX\nLEA DX, MESSAGE'
      },
      {
        id: 'set_service',
        type: 'process',
        label: 'Select DOS Print String Service Function',
        subLabel: 'MOV AH, 09H (Function 09H: Write string to standard output)',
        asmCode: 'MOV AH, 09H'
      },
      {
        id: 'trigger_int21',
        type: 'io',
        label: 'Trigger DOS Interrupt 21H',
        subLabel: 'INT 21H (Outputs characters from DS:DX until "$" is encountered)',
        asmCode: 'INT 21H'
      },
      { id: 'stop', type: 'stop', label: 'STOP', subLabel: 'Exit to DOS prompt via AH=4CH INT 21H' }
    ]
  },

  exp_str3: {
    expId: 'exp_str3',
    title: 'Compare Two Strings for Equality',
    overview: 'String comparison using REPE CMPSB and branching on Zero Flag (ZF).',
    nodes: [
      { id: 'start', type: 'start', label: 'START', subLabel: 'Initialize Program (DS = @DATA, ES = DS)' },
      {
        id: 'init_cmp_ptrs',
        type: 'process',
        label: 'Initialize Pointers & String Length',
        subLabel: 'SI = OFFSET STR1, DI = OFFSET STR2, CX = LEN, CLD',
        asmCode: 'LEA SI, STR1\nLEA DI, STR2\nMOV CX, LEN\nCLD'
      },
      {
        id: 'exec_cmpsb',
        type: 'process',
        label: 'Execute Character-by-Character Comparison',
        subLabel: 'REPE CMPSB (Compares DS:[SI] and ES:[DI], auto-increments SI and DI, repeats while equal)',
        asmCode: 'REPE CMPSB'
      },
      {
        id: 'check_str_equal',
        type: 'decision',
        label: 'Are Both Strings Identical (ZF == 1)?',
        decisionQuery: 'CMPSB → Is Zero Flag ZF == 1 (All characters matched)?',
        hardwareFlagTested: 'Zero Flag (ZF)',
        yesBranch: {
          label: 'YES (ZF = 1, Strings Match)',
          conditionText: 'All characters in both strings are identical',
          action: 'Jump to MATCH_HANDLER and set result flag AL = 00H (Equal Flag).',
          asmBranchInstruction: 'JZ STRINGS_EQUAL (Jump if Zero)',
          targetLabel: 'Equal Handler (AL = 00H)',
          isLoopBack: false,
          color: 'emerald'
        },
        noBranch: {
          label: 'NO (ZF = 0, Mismatch Found)',
          conditionText: 'Mismatch detected at character offset',
          action: 'Execute mismatch path: Set result flag AL = 01H (Not Equal Flag).',
          asmBranchInstruction: 'JNZ STRINGS_NOT_EQUAL (or fall-through)',
          targetLabel: 'Not Equal Handler (AL = 01H)',
          isLoopBack: false,
          color: 'rose'
        }
      },
      {
        id: 'set_mismatch',
        type: 'process',
        label: 'Handle Mismatch: Set AL = 01H',
        subLabel: 'MOV AL, 01H; JMP STORE_CMP_RES',
        asmCode: 'MOV AL, 01H\nJMP STORE_RES'
      },
      {
        id: 'set_match',
        type: 'process',
        label: 'Handle Match: Set AL = 00H',
        subLabel: 'STRINGS_EQUAL:\nMOV AL, 00H',
        asmCode: 'STRINGS_EQUAL:\nMOV AL, 00H'
      },
      {
        id: 'save_cmp_res',
        type: 'io',
        label: 'Store Result Flag in Memory',
        subLabel: 'STORE_RES:\nMOV COMPARE_RESULT, AL (00H = Equal, 01H = Unequal)',
        asmCode: 'STORE_RES:\nMOV COMPARE_RESULT, AL'
      },
      { id: 'stop', type: 'stop', label: 'STOP', subLabel: 'Terminate execution via INT 21H 4CH' }
    ]
  },

  exp_str4: {
    expId: 'exp_str4',
    title: 'String Reversal & Palindrome Check',
    overview: 'Two-phase algorithm: reverse copy loop followed by symmetry validation with CMPSB.',
    nodes: [
      { id: 'start', type: 'start', label: 'START', subLabel: 'Initialize Program (DS and ES)' },
      {
        id: 'init_rev_copy',
        type: 'process',
        label: 'Initialize Pointers for Reverse Copy',
        subLabel: 'SI = OFFSET STR1 + LEN - 1 (End of string), DI = OFFSET REV_STR, CX = LEN',
        asmCode: 'LEA SI, STR1\nADD SI, LEN - 1\nLEA DI, REV_STR\nMOV CX, LEN'
      },
      {
        id: 'rev_copy_step',
        type: 'process',
        label: 'Copy Character Backwards',
        subLabel: 'AL = [SI]; [DI] = AL; DEC SI; INC DI',
        asmCode: 'REV_LOOP:\nMOV AL, [SI]\nMOV [DI], AL\nDEC SI\nINC DI'
      },
      {
        id: 'check_rev_loop',
        type: 'decision',
        label: 'Is Reverse Copy Loop CX == 0?',
        decisionQuery: 'DEC CX → Is CX == 0 (Entire string copied in reverse)?',
        hardwareFlagTested: 'CX Counter / Zero Flag (ZF)',
        yesBranch: {
          label: 'YES (CX = 0)',
          conditionText: 'Reverse string constructed in memory',
          action: 'Exit copy loop. Append "$" terminator and prepare for palindrome comparison.',
          asmBranchInstruction: 'LOOP REV_LOOP (Fall-through)',
          targetLabel: 'Append Terminator & Setup Compare',
          isLoopBack: false,
          color: 'emerald'
        },
        noBranch: {
          label: 'NO (CX > 0)',
          conditionText: 'More characters remaining to reverse',
          action: 'Loop back to REV_LOOP.',
          asmBranchInstruction: 'LOOP REV_LOOP',
          targetLabel: 'Copy Character Backwards',
          isLoopBack: true,
          color: 'amber'
        }
      },
      {
        id: 'init_palindrome_cmp',
        type: 'process',
        label: 'Setup Palindrome Comparison',
        subLabel: 'SI = OFFSET STR1, DI = OFFSET REV_STR, CX = LEN, CLD; REPE CMPSB',
        asmCode: 'LEA SI, STR1\nLEA DI, REV_STR\nMOV CX, LEN\nCLD\nREPE CMPSB'
      },
      {
        id: 'check_palindrome',
        type: 'decision',
        label: 'Are Original & Reversed Strings Identical (ZF == 1)?',
        decisionQuery: 'CMPSB → Is Zero Flag ZF == 1 (Symmetric Palindrome)?',
        hardwareFlagTested: 'Zero Flag (ZF)',
        yesBranch: {
          label: 'YES (ZF = 1, Palindrome)',
          conditionText: 'Forward and reverse strings are identical',
          action: 'Set palindrome flag AL = 01H (Is Palindrome).',
          asmBranchInstruction: 'JZ IS_PALINDROME',
          targetLabel: 'Palindrome Flag (AL = 01H)',
          isLoopBack: false,
          color: 'emerald'
        },
        noBranch: {
          label: 'NO (ZF = 0, Not Palindrome)',
          conditionText: 'Characters differ; Asymmetric string',
          action: 'Set palindrome flag AL = 00H (Not Palindrome).',
          asmBranchInstruction: 'JNZ NOT_PALINDROME (or fall-through)',
          targetLabel: 'Not Palindrome Flag (AL = 00H)',
          isLoopBack: false,
          color: 'rose'
        }
      },
      {
        id: 'set_not_pal',
        type: 'process',
        label: 'Handle Non-Palindrome: Set AL = 00H',
        subLabel: 'MOV AL, 00H; JMP STORE_PAL_FLAG',
        asmCode: 'MOV AL, 00H\nJMP STORE_RES'
      },
      {
        id: 'set_is_pal',
        type: 'process',
        label: 'Handle Palindrome: Set AL = 01H',
        subLabel: 'IS_PALINDROME:\nMOV AL, 01H',
        asmCode: 'IS_PALINDROME:\nMOV AL, 01H'
      },
      {
        id: 'save_pal_flag',
        type: 'io',
        label: 'Store Palindrome Status in RAM Variable',
        subLabel: 'STORE_RES:\nMOV PALINDROME_FLAG, AL (01H = Yes, 00H = No)',
        asmCode: 'STORE_RES:\nMOV PALINDROME_FLAG, AL'
      },
      { id: 'stop', type: 'stop', label: 'STOP', subLabel: 'Terminate execution via INT 21H 4CH' }
    ]
  },

  exp_clock1: {
    expId: 'exp_clock1',
    title: 'Digital Clock using DOS Function AH=2CH',
    overview: 'Read RTC time via INT 21H AH=2CH, unpack into decimal digits, and stream ASCII characters via AH=02H.',
    nodes: [
      { id: 'start', type: 'start', label: 'START', subLabel: 'Initialize DS = @DATA, Stack Frame' },
      {
        id: 'display_banner',
        type: 'io',
        label: 'Display Clock Banner',
        subLabel: 'INT 21H AH=09H to display "Current System Time:" title banner',
        asmCode: 'LEA DX, TITLE_MSG\nMOV AH, 09H\nINT 21H'
      },
      {
        id: 'read_rtc_dos',
        type: 'process',
        label: 'Query DOS System Time Service',
        subLabel: 'INT 21H AH=2CH -> CH=Hours (0-23), CL=Minutes (0-59), DH=Seconds (0-59), DL=Hundredths',
        asmCode: 'MOV AH, 2CH\nINT 21H'
      },
      {
        id: 'convert_hours',
        type: 'process',
        label: 'Extract & Format Hours (CH)',
        subLabel: 'Divide CH by 10; add 30H to quotient (Tens) and remainder (Units)',
        asmCode: 'MOV AL, CH\nMOV AH, 0\nMOV BL, 10\nDIV BL\nADD AX, 3030H'
      },
      {
        id: 'print_hours',
        type: 'io',
        label: 'Print Hours Digits & Colon Delimiter',
        subLabel: 'INT 21H AH=02H prints Tens, Units, then \':\' (3AH)',
        asmCode: 'MOV DL, AL\nMOV AH, 02H\nINT 21H\n; Print Units & \':\''
      },
      {
        id: 'convert_minutes',
        type: 'process',
        label: 'Extract & Format Minutes (CL)',
        subLabel: 'Divide CL by 10; add 30H to quotient and remainder',
        asmCode: 'MOV AL, CL\nMOV AH, 0\nMOV BL, 10\nDIV BL\nADD AX, 3030H'
      },
      {
        id: 'print_minutes',
        type: 'io',
        label: 'Print Minutes Digits & Colon Delimiter',
        subLabel: 'INT 21H AH=02H prints Tens, Units, then \':\' (3AH)',
        asmCode: 'MOV DL, AL\nMOV AH, 02H\nINT 21H\n; Print Units & \':\''
      },
      {
        id: 'convert_seconds',
        type: 'process',
        label: 'Extract & Format Seconds (DH)',
        subLabel: 'Divide DH by 10; add 30H to quotient and remainder',
        asmCode: 'MOV AL, DH\nMOV AH, 0\nMOV BL, 10\nDIV BL\nADD AX, 3030H'
      },
      {
        id: 'print_seconds',
        type: 'io',
        label: 'Print Seconds Digits to Console',
        subLabel: 'INT 21H AH=02H prints Tens and Units',
        asmCode: 'MOV DL, AL\nMOV AH, 02H\nINT 21H\nMOV DL, AH\nINT 21H'
      },
      { id: 'stop', type: 'stop', label: 'STOP', subLabel: 'Terminate execution via INT 21H 4CH' }
    ]
  },

  exp_clock2: {
    expId: 'exp_clock2',
    title: 'Digital Clock with Cursor Positioning & Non-Blocking Polling',
    overview: 'Continuous live clock loop using BIOS INT 10H cursor coordinates, second caching, and keyboard exit.',
    nodes: [
      { id: 'start', type: 'start', label: 'START', subLabel: 'Initialize DS = @DATA, Clear PREV_SEC = 0FFH' },
      {
        id: 'set_cursor_center',
        type: 'process',
        label: 'Position Screen Cursor (BIOS INT 10H)',
        subLabel: 'AH=02H, BH=00H (Page 0), DH=12 (Row), DL=35 (Column)',
        asmCode: 'MOV AH, 02H\nMOV BH, 00H\nMOV DH, 12\nMOV DL, 35\nINT 10H'
      },
      {
        id: 'read_time_loop',
        type: 'process',
        label: 'Read System Time (DOS INT 21H AH=2CH)',
        subLabel: 'Returns current seconds in register DH',
        asmCode: 'MOV AH, 2CH\nINT 21H'
      },
      {
        id: 'check_second_changed',
        type: 'decision',
        label: 'Has Second Changed (DH != PREV_SEC)?',
        decisionQuery: 'Compare current seconds (DH) with PREV_SEC',
        hardwareFlagTested: 'Zero Flag (ZF)',
        yesBranch: {
          label: 'YES (Second Changed)',
          conditionText: 'DH != PREV_SEC (New second elapsed)',
          action: 'Update PREV_SEC = DH and format new TIME_STR buffer.',
          asmBranchInstruction: 'JNE UPDATE_DISPLAY',
          targetLabel: 'Format Time String in Buffer',
          isLoopBack: false,
          color: 'emerald'
        },
        noBranch: {
          label: 'NO (Same Second)',
          conditionText: 'DH == PREV_SEC (Within same second)',
          action: 'Skip redrawing to prevent screen flicker; poll keyboard.',
          asmBranchInstruction: 'JE POLL_KEYBOARD',
          targetLabel: 'Poll Keyboard Status (INT 21H AH=0BH)',
          isLoopBack: false,
          color: 'amber'
        }
      },
      {
        id: 'format_time_buffer',
        type: 'process',
        label: 'Format Time String in Buffer',
        subLabel: 'Store HH:MM:SS$ into memory buffer TIME_STR',
        asmCode: 'MOV PREV_SEC, DH\n; Convert CH, CL, DH to ASCII -> TIME_STR'
      },
      {
        id: 'reposition_and_print',
        type: 'io',
        label: 'Render String at Fixed Screen Coordinates',
        subLabel: 'INT 10H AH=02H (Cursor), then INT 21H AH=09H (Print TIME_STR)',
        asmCode: 'MOV AH, 02H\nMOV DH, 12\nMOV DL, 35\nINT 10H\nLEA DX, TIME_STR\nMOV AH, 09H\nINT 21H'
      },
      {
        id: 'poll_keyboard',
        type: 'decision',
        label: 'Has User Pressed Any Key (INT 21H AH=0BH)?',
        decisionQuery: 'INT 21H AH=0BH → Is AL != 00H (Keystroke Pending)?',
        hardwareFlagTested: 'Zero Flag (ZF) / AL Register',
        yesBranch: {
          label: 'YES (Key Pressed)',
          conditionText: 'AL == 0FFH (User pressed key to exit)',
          action: 'Consume character and terminate program cleanly.',
          asmBranchInstruction: 'JNZ EXIT_CLOCK',
          targetLabel: 'STOP (Exit via AH=4CH)',
          isLoopBack: false,
          color: 'rose'
        },
        noBranch: {
          label: 'NO (No Key Pressed)',
          conditionText: 'AL == 00H (Keyboard buffer empty)',
          action: 'Continue active real-time clock loop.',
          asmBranchInstruction: 'JZ CLOCK_LOOP',
          targetLabel: 'Read System Time (DOS INT 21H AH=2CH)',
          isLoopBack: true,
          color: 'blue'
        }
      },
      { id: 'stop', type: 'stop', label: 'STOP', subLabel: 'Terminate execution via INT 21H 4CH' }
    ]
  },

  exp_clock3: {
    expId: 'exp_clock3',
    title: 'Digital Clock from BIOS Timer Ticks (18.2 Hz)',
    overview: 'Read 32-bit hardware timer tick counter via BIOS INT 1AH AH=00H and calculate Hours, Minutes, Seconds.',
    nodes: [
      { id: 'start', type: 'start', label: 'START', subLabel: 'Initialize DS = @DATA' },
      {
        id: 'read_bios_ticks',
        type: 'process',
        label: 'Read 32-Bit BIOS Timer Ticks (INT 1AH)',
        subLabel: 'INT 1AH AH=00H -> CX:DX = 32-bit tick count from BDA 0040:006CH',
        asmCode: 'MOV AH, 00H\nINT 1AH\n; CX:DX = Timer Ticks'
      },
      {
        id: 'calc_hours',
        type: 'process',
        label: 'Calculate Hours: Ticks / 65543',
        subLabel: '32-bit division: DX:AX / 65543 -> AX = Hours, DX = Remaining Ticks',
        asmCode: 'MOV AX, DX\nMOV DX, CX\nMOV BX, 65543\nDIV BX\nMOV HOURS, AX\nMOV REM_TICKS, DX'
      },
      {
        id: 'calc_minutes',
        type: 'process',
        label: 'Calculate Minutes: Remaining Ticks / 1092',
        subLabel: 'REM_TICKS / 1092 -> AX = Minutes, DX = Sub-minute Ticks',
        asmCode: 'MOV AX, REM_TICKS\nMOV DX, 0\nMOV BX, 1092\nDIV BX\nMOV MINS, AX\nMOV SUB_TICKS, DX'
      },
      {
        id: 'calc_seconds',
        type: 'process',
        label: 'Calculate Seconds: (Sub-minute Ticks × 10) / 182',
        subLabel: 'Fixed-point scaling for 18.2065 Hz PIT frequency',
        asmCode: 'MOV AX, SUB_TICKS\nMOV BX, 10\nMUL BX\nMOV BX, 182\nDIV BX\nMOV SECS, AX'
      },
      {
        id: 'format_and_print_time',
        type: 'io',
        label: 'Format Time String & Display',
        subLabel: 'Convert HOURS, MINS, SECS to ASCII digits and print via INT 21H AH=09H',
        asmCode: 'CALL FORMAT_TIME\nLEA DX, TIME_OUTPUT\nMOV AH, 09H\nINT 21H'
      },
      { id: 'stop', type: 'stop', label: 'STOP', subLabel: 'Terminate execution via INT 21H 4CH' }
    ]
  },

  exp_stepper1: {
    expId: 'exp_stepper1',
    title: 'Interfacing Stepper Motor – Clockwise Rotation with Variable Step-Size',
    overview: 'Initialize 8255 PPI in Mode 0 (80H), send 2-phase full-step excitation codes (09H, 0AH, 06H, 05H) to Port A with software delays, and repeat for variable step count CX.',
    nodes: [
      { id: 'start', type: 'start', label: 'START', subLabel: 'Initialize Program (DS = DATA_SEG)' },
      {
        id: 'init_8255',
        type: 'process',
        label: 'Initialize 8255 PPI (Mode 0 Output)',
        subLabel: 'Write Control Word 80H to CWR (00C6H) to set Port A as Output',
        asmCode: 'MOV DX, 00C6H\nMOV AL, 80H\nOUT DX, AL'
      },
      {
        id: 'load_steps',
        type: 'process',
        label: 'Load Variable Step Count & Sequence Pointer',
        subLabel: 'CX = STEP_COUNT (e.g. 200 for 360°), SI = OFFSET CW_TABLE, BX = 4 (Phase Counter)',
        asmCode: 'MOV CX, STEP_COUNT\nCW_CYCLE:\nLEA SI, CW_TABLE\nMOV BX, 4'
      },
      {
        id: 'output_phase_cw',
        type: 'io',
        label: 'Output Phase Excitation Code to Port A',
        subLabel: 'AL = [SI]; OUT 00C0H, AL (Energizes motor stator coils via ULN2003)',
        asmCode: 'STEP_LOOP:\nMOV AL, [SI]\nMOV DX, 00C0H\nOUT DX, AL'
      },
      {
        id: 'delay_step',
        type: 'process',
        label: 'Execute Software Rotor Settling Delay',
        subLabel: 'Call DELAY_ROUTINE to keep stator coils energized during rotor step alignment',
        asmCode: 'CALL DELAY_ROUTINE'
      },
      {
        id: 'advance_cw',
        type: 'process',
        label: 'Advance Phase Pointer & Decrement Step Count',
        subLabel: 'INC SI (Next phase pattern); DEC CX (Remaining step count)',
        asmCode: 'INC SI\nDEC CX'
      },
      {
        id: 'check_steps_done',
        type: 'decision',
        label: 'Is Target Step Count Reached (CX == 0)?',
        decisionQuery: 'DEC CX → Has total requested variable step size completed?',
        hardwareFlagTested: 'Zero Flag (ZF)',
        yesBranch: {
          label: 'YES (CX = 0, Steps Complete)',
          conditionText: 'All variable steps executed; Rotor at desired angle',
          action: 'Exit loop and terminate cleanly to DOS.',
          asmBranchInstruction: 'JZ EXIT_PROGRAM',
          targetLabel: 'STOP (Exit Program)',
          isLoopBack: false,
          color: 'emerald'
        },
        noBranch: {
          label: 'NO (CX > 0, Steps Pending)',
          conditionText: 'More angular steps remaining to execute',
          action: 'Check if 4-step commutation cycle finished or continue.',
          asmBranchInstruction: 'JNZ CHECK_CYCLE',
          targetLabel: 'Check 4-Phase Cycle',
          isLoopBack: false,
          color: 'amber'
        }
      },
      {
        id: 'check_comm_cycle',
        type: 'decision',
        label: 'Is 4-Phase Commutation Finished (BX == 0)?',
        decisionQuery: 'DEC BX → Have all 4 phases (09H, 0AH, 06H, 05H) been stepped?',
        hardwareFlagTested: 'Zero Flag (ZF)',
        yesBranch: {
          label: 'YES (BX = 0, Cycle Done)',
          conditionText: 'Completed 4-phase electrical sequence',
          action: 'Reset SI to CW_TABLE start and reset BX = 4.',
          asmBranchInstruction: 'JMP CW_CYCLE',
          targetLabel: 'Reset CW Table Pointer',
          isLoopBack: true,
          color: 'blue'
        },
        noBranch: {
          label: 'NO (BX > 0, Within Cycle)',
          conditionText: 'Next phase code ready in sequence',
          action: 'Loop to output next phase excitation pattern.',
          asmBranchInstruction: 'JNZ STEP_LOOP',
          targetLabel: 'Output Phase Excitation Code',
          isLoopBack: true,
          color: 'purple'
        }
      },
      { id: 'stop', type: 'stop', label: 'STOP', subLabel: 'Terminate execution via INT 21H 4CH' }
    ]
  },

  exp_stepper2: {
    expId: 'exp_stepper2',
    title: 'Interfacing Stepper Motor – Anti-Clockwise Rotation with Variable Step-Size',
    overview: 'Configure 8255 PPI CWR with 80H, stream inverted 2-phase full-step excitation codes (05H, 06H, 0AH, 09H) to Port A with software delays, and track variable step size in CX.',
    nodes: [
      { id: 'start', type: 'start', label: 'START', subLabel: 'Initialize Program (DS = DATA_SEG)' },
      {
        id: 'init_8255',
        type: 'process',
        label: 'Initialize 8255 PPI (Mode 0 Output)',
        subLabel: 'Write Control Word 80H to CWR (00C6H) to set Port A as Output',
        asmCode: 'MOV DX, 00C6H\nMOV AL, 80H\nOUT DX, AL'
      },
      {
        id: 'load_steps',
        type: 'process',
        label: 'Load Variable Step Count & CCW Table Pointer',
        subLabel: 'CX = STEP_COUNT (e.g. 200 for 360° CCW), SI = OFFSET CCW_TABLE, BX = 4',
        asmCode: 'MOV CX, STEP_COUNT\nCCW_CYCLE:\nLEA SI, CCW_TABLE\nMOV BX, 4'
      },
      {
        id: 'output_phase_ccw',
        type: 'io',
        label: 'Output Reverse Phase Pattern to Port A',
        subLabel: 'AL = [SI]; OUT 00C0H, AL (Energizes coils in reverse order DA->CD->BC->AB)',
        asmCode: 'STEP_LOOP:\nMOV AL, [SI]\nMOV DX, 00C0H\nOUT DX, AL'
      },
      {
        id: 'delay_step',
        type: 'process',
        label: 'Execute Software Rotor Settling Delay',
        subLabel: 'Call DELAY_ROUTINE for counter-clockwise mechanical step settling',
        asmCode: 'CALL DELAY_ROUTINE'
      },
      {
        id: 'advance_ccw',
        type: 'process',
        label: 'Advance CCW Pointer & Decrement Step Count',
        subLabel: 'INC SI (Next reverse phase); DEC CX (Remaining step count)',
        asmCode: 'INC SI\nDEC CX'
      },
      {
        id: 'check_steps_done',
        type: 'decision',
        label: 'Is Target Step Count Reached (CX == 0)?',
        decisionQuery: 'DEC CX → Has total CCW variable step size completed?',
        hardwareFlagTested: 'Zero Flag (ZF)',
        yesBranch: {
          label: 'YES (CX = 0, Steps Complete)',
          conditionText: 'All CCW steps executed; Rotor at target displacement',
          action: 'Exit loop and terminate cleanly to DOS.',
          asmBranchInstruction: 'JZ EXIT_PROGRAM',
          targetLabel: 'STOP (Exit Program)',
          isLoopBack: false,
          color: 'emerald'
        },
        noBranch: {
          label: 'NO (CX > 0, Steps Pending)',
          conditionText: 'More anti-clockwise steps remaining',
          action: 'Check if 4-step reverse cycle finished or continue.',
          asmBranchInstruction: 'JNZ CHECK_CYCLE',
          targetLabel: 'Check 4-Phase Cycle',
          isLoopBack: false,
          color: 'amber'
        }
      },
      {
        id: 'check_comm_cycle',
        type: 'decision',
        label: 'Is 4-Phase Commutation Finished (BX == 0)?',
        decisionQuery: 'DEC BX → Have all 4 reverse phases (05H, 06H, 0AH, 09H) completed?',
        hardwareFlagTested: 'Zero Flag (ZF)',
        yesBranch: {
          label: 'YES (BX = 0, Cycle Done)',
          conditionText: 'Completed reverse 4-phase sequence',
          action: 'Reset SI to CCW_TABLE start and reset BX = 4.',
          asmBranchInstruction: 'JMP CCW_CYCLE',
          targetLabel: 'Reset CCW Table Pointer',
          isLoopBack: true,
          color: 'blue'
        },
        noBranch: {
          label: 'NO (BX > 0, Within Cycle)',
          conditionText: 'Next reverse phase pattern ready',
          action: 'Loop to output next reverse phase pattern.',
          asmBranchInstruction: 'JNZ STEP_LOOP',
          targetLabel: 'Output Reverse Phase Pattern',
          isLoopBack: true,
          color: 'purple'
        }
      },
      { id: 'stop', type: 'stop', label: 'STOP', subLabel: 'Terminate execution via INT 21H 4CH' }
    ]
  },

  exp_adc: {
    expId: 'exp_adc',
    title: 'Interfacing ADC (ADC 0808) with 8086',
    overview: 'Hardware handshaking flow: PPI initialization (98H), channel selection, ALE/SOC trigger pulse, EOC status polling loop, and OE digital latch readout.',
    nodes: [
      { id: 'start', type: 'start', label: 'START', subLabel: 'Initialize Segment Registers (DS = @DATA)' },
      {
        id: 'init_8255',
        type: 'process',
        label: 'Initialize 8255 PPI CWR with 98H',
        subLabel: 'Mode 0: Port A=Input, Port B=Output, Port C(Upper)=Input, Port C(Lower)=Output',
        asmCode: 'MOV DX, 00C6H\nMOV AL, 98H\nOUT DX, AL'
      },
      {
        id: 'select_channel',
        type: 'io',
        label: 'Select Analog Input Channel IN0',
        subLabel: 'Output Channel code 00H to Port B (ADD A=0, ADD B=0, ADD C=0)',
        asmCode: 'MOV DX, 00C2H\nMOV AL, 00H\nOUT DX, AL'
      },
      {
        id: 'trigger_soc',
        type: 'process',
        label: 'Generate Active-High ALE / SOC Pulse on PC0',
        subLabel: 'PC0 = 1 (ALE/SOC HIGH) -> Micro-delay -> PC0 = 0 (Starts SAR conversion)',
        asmCode: 'MOV DX, 00C4H\nMOV AL, 01H\nOUT DX, AL\nNOP\nMOV AL, 00H\nOUT DX, AL'
      },
      {
        id: 'read_port_c',
        type: 'io',
        label: 'Read Port C Status Byte into AL',
        subLabel: 'Sample status lines to test PC7 (End of Conversion Pin)',
        asmCode: 'IN AL, DX\nTEST AL, 80H'
      },
      {
        id: 'poll_eoc',
        type: 'decision',
        label: 'Is Conversion Complete (PC7 / EOC == 1)?',
        decisionQuery: 'TEST AL, 80H → Has ADC 0808 finished 8-bit SAR conversion?',
        hardwareFlagTested: 'Zero Flag (ZF) & Bit 7',
        yesBranch: {
          label: 'YES (EOC = 1, Bit 7 High)',
          conditionText: 'SAR approximation finished (~100 µs elapsed)',
          action: 'Conversion ready. Assert Output Enable to latch byte.',
          asmBranchInstruction: 'JNZ READ_ADC_DATA',
          targetLabel: 'Assert OE & Read Port A',
          isLoopBack: false,
          color: 'emerald'
        },
        noBranch: {
          label: 'NO (EOC = 0, Conversion Busy)',
          conditionText: 'SAR actively comparing internal DAC steps',
          action: 'Wait and poll Port C status line again.',
          asmBranchInstruction: 'JZ CHECK_EOC',
          targetLabel: 'Poll Port C EOC Pin',
          isLoopBack: true,
          color: 'amber'
        }
      },
      {
        id: 'read_digital_byte',
        type: 'io',
        label: 'Assert Output Enable (OE) & Read Port A',
        subLabel: 'Send PC2=1 (OE HIGH), read 8-bit digital value from Port A (00C0H), store in DIGITAL_VAL',
        asmCode: 'MOV AL, 04H\nOUT DX, AL\nMOV DX, 00C0H\nIN AL, DX\nMOV DIGITAL_VAL, AL'
      },
      {
        id: 'compute_voltage',
        type: 'process',
        label: 'De-assert OE & Compute Real Voltage',
        subLabel: 'Set PC2 = 0; Calculate Analog Voltage: Vin(mV) = (AL × 5000) / 255',
        asmCode: 'MOV DX, 00C4H\nMOV AL, 00H\nOUT DX, AL\nMOV BX, 5000\nMUL BX\nMOV BX, 255\nDIV BX'
      },
      { id: 'stop', type: 'stop', label: 'STOP', subLabel: 'Clean exit to DOS via INT 21H 4CH' }
    ]
  },

  exp_dac: {
    expId: 'exp_dac',
    title: 'Interfacing DAC (DAC 0800) & Waveform Generation',
    overview: 'Configure 8255 Port A as output to stream digital codes to DAC 0800 with op-amp I-to-V conversion, synthesizing Square, Triangular, and Step waveforms.',
    nodes: [
      { id: 'start', type: 'start', label: 'START', subLabel: 'Initialize Segment Registers (DS = @DATA)' },
      {
        id: 'init_8255',
        type: 'process',
        label: 'Initialize 8255 PPI CWR with 80H',
        subLabel: 'Mode 0: Port A configured as 8-bit Output port (00C0H)',
        asmCode: 'MOV DX, 00C6H\nMOV AL, 80H\nOUT DX, AL\nMOV DX, 00C0H'
      },
      {
        id: 'square_wave',
        type: 'io',
        label: 'Square Wave Synthesis Routine',
        subLabel: 'Output 00H (0V) -> DELAY_HALF -> Output FFH (+5V) -> DELAY_HALF',
        asmCode: 'MOV AL, 00H\nOUT DX, AL\nCALL DELAY_HALF\nMOV AL, 0FFH\nOUT DX, AL\nCALL DELAY_HALF'
      },
      {
        id: 'triangle_ramp_up',
        type: 'io',
        label: 'Triangular Wave Ramp-Up Sweep',
        subLabel: 'Sweep AL from 00H to FFH: Output AL -> INC AL -> Micro-delay -> Repeat',
        asmCode: 'TRI_UP:\nOUT DX, AL\nINC AL\nCALL DELAY_STEP\nJNZ TRI_UP'
      },
      {
        id: 'triangle_ramp_down',
        type: 'io',
        label: 'Triangular Wave Ramp-Down Sweep',
        subLabel: 'Sweep AL from FFH to 00H: Output AL -> DEC AL -> Micro-delay -> Repeat',
        asmCode: 'TRI_DOWN:\nOUT DX, AL\nDEC AL\nCALL DELAY_STEP\nJNZ TRI_DOWN'
      },
      {
        id: 'step_signal',
        type: 'io',
        label: 'Step Signal (Staircase) Generation',
        subLabel: 'Output AL -> Hold delay (~5 ms) -> ADD AL, 33H (6 discrete plateaus)',
        asmCode: 'STEP_LOOP:\nOUT DX, AL\nCALL DELAY_STEP_HOLD\nADD AL, 33H'
      },
      {
        id: 'check_step_overflow',
        type: 'decision',
        label: 'Has Staircase Reached Peak (Carry == 1)?',
        decisionQuery: 'ADD AL, 33H → Has AL overflowed past FFH (+5V Top Step)?',
        hardwareFlagTested: 'Carry Flag (CF)',
        yesBranch: {
          label: 'YES (CF = 1, Overflow)',
          conditionText: 'Top step reached; reset staircase',
          action: 'Reset AL = 00H and restart next staircase period.',
          asmBranchInstruction: 'JC RESET_STAIRCASE',
          targetLabel: 'Reset Staircase to 0V',
          isLoopBack: false,
          color: 'purple'
        },
        noBranch: {
          label: 'NO (CF = 0, Next Step)',
          conditionText: 'Next higher plateau level in progress',
          action: 'Output next step voltage level.',
          asmBranchInstruction: 'JNC STEP_LOOP',
          targetLabel: 'Hold Next Step Plateau',
          isLoopBack: true,
          color: 'emerald'
        }
      },
      { id: 'stop', type: 'stop', label: 'STOP', subLabel: 'Clean exit to DOS via INT 21H 4CH' }
    ]
  },

  exp5: {
    expId: 'exp5',
    title: 'Block Data Transfer (Memory Copy)',
    overview: 'High-speed automated DMA-style block memory duplication with REP MOVSB.',
    nodes: [
      { id: 'start', type: 'start', label: 'START', subLabel: 'Initialize Program (DS = @DATA, ES = DS)' },
      {
        id: 'init_block_ptrs',
        type: 'process',
        label: 'Initialize Source and Destination Segment Offsets',
        subLabel: 'SI = OFFSET SRC_BLOCK, DI = OFFSET DEST_BLOCK, CX = 10 (Bytes), CLD (DF = 0)',
        asmCode: 'LEA SI, SRC_BLOCK\nLEA DI, DEST_BLOCK\nMOV CX, 10\nCLD'
      },
      {
        id: 'exec_movsb',
        type: 'process',
        label: 'Execute Automated Block Transfer',
        subLabel: 'REP MOVSB (Copies DS:[SI] to ES:[DI], auto-increments SI and DI, decrements CX)',
        asmCode: 'REP MOVSB'
      },
      {
        id: 'check_transfer_complete',
        type: 'decision',
        label: 'Is Block Transfer Counter CX == 0?',
        decisionQuery: 'REP MOVSB → Has CX reached 0 (All 10 bytes transferred)?',
        hardwareFlagTested: 'CX Counter',
        yesBranch: {
          label: 'YES (CX = 0)',
          conditionText: 'All 10 bytes duplicated to DEST_BLOCK',
          action: 'Transfer complete. Verify destination memory content.',
          asmBranchInstruction: 'REP MOVSB (Hardware termination when CX=0)',
          targetLabel: 'Verify & Stop',
          isLoopBack: false,
          color: 'emerald'
        },
        noBranch: {
          label: 'NO (CX > 0)',
          conditionText: 'Bytes remaining in transfer block',
          action: 'REP automatically moves next byte from DS:[SI] to ES:[DI].',
          asmBranchInstruction: 'REP (Internal repeat cycle)',
          targetLabel: 'Transfer Next Byte',
          isLoopBack: true,
          color: 'amber'
        }
      },
      {
        id: 'verify_block',
        type: 'io',
        label: 'Destination Buffer Verification',
        subLabel: 'DEST_BLOCK now holds matching sequence [10H ... 99H]',
        asmCode: '; Block replication verified in RAM'
      },
      { id: 'stop', type: 'stop', label: 'STOP', subLabel: 'Terminate execution via INT 21H 4CH' }
    ]
  },

  exp_8051_arith: {
    expId: 'exp_8051_arith',
    title: '8051 Arithmetic Operations (ADD, ADDC, SUBB, DA A)',
    overview: 'Program execution flow: Origin setup, 8-bit binary addition with carry flag test, 16-bit ripple-carry addition (ADDC), 8-bit subtraction with borrow (SUBB with CLR C), and packed BCD decimal adjust (DA A).',
    nodes: [
      { id: 'start', type: 'start', label: 'START', subLabel: 'ORG 0000H -> LJMP START (Bypass Interrupt Vectors)' },
      {
        id: 'init_operands',
        type: 'process',
        label: 'Initialize Operands in RAM',
        subLabel: 'Load 8-bit operands into RAM 30H, 31H; 16-bit words at 32H..35H',
        asmCode: 'MOV 30H, #0F8H\nMOV 31H, #19H\nMOV 32H, #0E4H\nMOV 33H, #12H'
      },
      {
        id: 'add_8bit',
        type: 'process',
        label: '8-Bit Addition: A = [30H] + [31H]',
        subLabel: 'ADD A, 31H -> Compute Sum and update Carry Flag CY',
        asmCode: 'MOV A, 30H\nADD A, 31H\nMOV 40H, A'
      },
      {
        id: 'check_cy_8bit',
        type: 'decision',
        label: 'Is Carry Generated (CY == 1)?',
        decisionQuery: 'JNC SKIP1 -> Did 8-bit addition overflow > 255 (0FFH)?',
        hardwareFlagTested: 'Carry Flag (CY)',
        yesBranch: {
          label: 'YES (CY = 1)',
          conditionText: 'Sum exceeded 255 (Carry generated)',
          action: 'Store Carry Byte = 01H in RAM 41H.',
          asmBranchInstruction: 'MOV 41H, #01H',
          targetLabel: 'Record Carry',
          isLoopBack: false,
          color: 'emerald'
        },
        noBranch: {
          label: 'NO (CY = 0)',
          conditionText: 'No overflow generated',
          action: 'Skip carry store.',
          asmBranchInstruction: 'JNC SKIP1',
          targetLabel: '16-Bit Addition',
          isLoopBack: false,
          color: 'amber'
        }
      },
      {
        id: 'add_16bit',
        type: 'process',
        label: '16-Bit Addition with Ripple Carry',
        subLabel: 'CLR C -> ADD A, 34H (Low Byte) -> ADDC A, 35H (High Byte)',
        asmCode: 'CLR C\nMOV A, 32H\nADD A, 34H\nMOV 42H, A\nMOV A, 33H\nADDC A, 35H\nMOV 43H, A'
      },
      {
        id: 'subb_8bit',
        type: 'process',
        label: '8-Bit Subtraction: Minuend - Subtrahend',
        subLabel: 'CLR C -> MOV A, 36H -> SUBB A, 37H -> Store in 45H',
        asmCode: 'CLR C\nMOV A, 36H\nSUBB A, 37H\nMOV 45H, A'
      },
      {
        id: 'da_bcd',
        type: 'process',
        label: 'Packed BCD Addition & Decimal Adjust',
        subLabel: 'ADD A, 39H -> DA A (Adjusts lower/upper nibbles) -> Store in 47H',
        asmCode: 'MOV A, 38H\nADD A, 39H\nDA A\nMOV 47H, A'
      },
      { id: 'stop', type: 'stop', label: 'HALT', subLabel: 'Trap CPU in SJMP $ loop' }
    ]
  },

  exp_8051_muldiv: {
    expId: 'exp_8051_muldiv',
    title: '8051 Multiplication & Division (MUL AB & DIV AB)',
    overview: 'Program execution flow: Load multiplicand/multiplier in A and B, execute MUL AB (B:A product), check overflow flag OV, load dividend/divisor, execute DIV AB (Quotient in A, Remainder in B), and test divide-by-zero.',
    nodes: [
      { id: 'start', type: 'start', label: 'START', subLabel: 'ORG 0000H -> LJMP START' },
      {
        id: 'init_mul_operands',
        type: 'process',
        label: 'Load Operands for Multiplication',
        subLabel: 'Multiplicand (F5H = 245D) into A, Multiplier (18H = 24D) into B',
        asmCode: 'MOV A, #0F5H\nMOV B, #18H'
      },
      {
        id: 'exec_mul',
        type: 'process',
        label: 'Execute MUL AB (4 Machine Cycles)',
        subLabel: 'ALU computes A × B -> Low byte in A, High byte in B; sets OV if product > 255',
        asmCode: 'MUL AB\nMOV 40H, A\nMOV 41H, B'
      },
      {
        id: 'check_mul_ov',
        type: 'decision',
        label: 'Is Product > 255 (OV == 1)?',
        decisionQuery: 'JB OV, RECORD_OV -> Did product span 16 bits (Register B > 0)?',
        hardwareFlagTested: 'Overflow Flag (OV)',
        yesBranch: {
          label: 'YES (OV = 1, B ≠ 0)',
          conditionText: 'Product is 16-bit (exceeds 00FFH)',
          action: 'Record 16-bit overflow status.',
          asmBranchInstruction: 'MOV 42H, #01H',
          targetLabel: 'Proceed to Division',
          isLoopBack: false,
          color: 'emerald'
        },
        noBranch: {
          label: 'NO (OV = 0, B = 0)',
          conditionText: 'Product fits in single 8-bit register',
          action: 'Clear overflow status byte.',
          asmBranchInstruction: 'JNB OV, PROCEED_DIV',
          targetLabel: 'Proceed to Division',
          isLoopBack: false,
          color: 'amber'
        }
      },
      {
        id: 'exec_div',
        type: 'process',
        label: 'Execute DIV AB (4 Machine Cycles)',
        subLabel: 'Dividend (245D) in A, Divisor (10D) in B -> DIV AB',
        asmCode: 'MOV A, #0F5H\nMOV B, #0AH\nDIV AB\nMOV 43H, A\nMOV 44H, B'
      },
      {
        id: 'check_div_zero',
        type: 'decision',
        label: 'Is Divisor Valid (OV == 0)?',
        decisionQuery: 'JNB OV, DIV_OK -> Was divisor non-zero?',
        hardwareFlagTested: 'Overflow Flag (OV)',
        yesBranch: {
          label: 'YES (OV = 0, Normal Division)',
          conditionText: 'Integer division successful (Quotient in A, Remainder in B)',
          action: 'Store results into RAM [43H..44H].',
          asmBranchInstruction: 'JNB OV, STORE_DIV',
          targetLabel: 'Store Output & Halt',
          isLoopBack: false,
          color: 'emerald'
        },
        noBranch: {
          label: 'NO (OV = 1, Divide-by-Zero)',
          conditionText: 'Divisor register B was 00H',
          action: 'Trigger divide-by-zero error handler.',
          asmBranchInstruction: 'JB OV, ERROR_HANDLER',
          targetLabel: 'Error Trap',
          isLoopBack: false,
          color: 'rose'
        }
      },
      { id: 'stop', type: 'stop', label: 'HALT', subLabel: 'SJMP $ (Trap execution in loop)' }
    ]
  },

  exp_8051_logic: {
    expId: 'exp_8051_logic',
    title: '8051 Logical & Boolean Operations (ANL, ORL, XRL, SWAP)',
    overview: 'Program execution flow: Load test byte, perform bitwise AND masking with #0FH, bitwise OR bit-setting with #0F0H, bitwise XOR toggle with #0FFH, CPL 1\'s complement, nibble swap via SWAP A, and Boolean bit-level processing.',
    nodes: [
      { id: 'start', type: 'start', label: 'START', subLabel: 'ORG 0000H -> LJMP START' },
      {
        id: 'load_data',
        type: 'process',
        label: 'Load Test Pattern A5H (1010 0101B)',
        subLabel: 'Initialize RAM 30H with alternating bit test byte',
        asmCode: 'MOV 30H, #0A5H\nMOV A, 30H'
      },
      {
        id: 'exec_anl',
        type: 'process',
        label: 'Bitwise AND Masking (ANL A, #0FH)',
        subLabel: 'Clears bits D7-D4 to 0; preserves lower nibble (A = 05H)',
        asmCode: 'ANL A, #0FH\nMOV 40H, A'
      },
      {
        id: 'exec_orl',
        type: 'process',
        label: 'Bitwise OR Bit Setting (ORL A, #0F0H)',
        subLabel: 'Forces bits D7-D4 to 1; preserves lower nibble (A = F5H)',
        asmCode: 'MOV A, 30H\nORL A, #0F0H\nMOV 41H, A'
      },
      {
        id: 'exec_xrl',
        type: 'process',
        label: 'Bitwise XOR Inversion (XRL A, #0FFH)',
        subLabel: 'Toggles all 8 bits (A = 5AH)',
        asmCode: 'MOV A, 30H\nXRL A, #0FFH\nMOV 42H, A'
      },
      {
        id: 'exec_swap',
        type: 'process',
        label: 'Single-Cycle Nibble Swap (SWAP A)',
        subLabel: 'Exchanges high and low nibbles (A5H -> 5AH)',
        asmCode: 'MOV A, 30H\nSWAP A\nMOV 44H, A'
      },
      {
        id: 'exec_boolean',
        type: 'process',
        label: 'Boolean Bit-Level Engine (SETB & ORL C)',
        subLabel: 'Set RAM bit 20H.0 and combine with Carry single-bit accumulator',
        asmCode: 'SETB 20H.0\nCLR C\nORL C, 20H.0'
      },
      { id: 'stop', type: 'stop', label: 'HALT', subLabel: 'SJMP $ (Trap in endless loop)' }
    ]
  },

  exp_8051_regbanks: {
    expId: 'exp_8051_regbanks',
    title: '8051 Register Bank Selection (RS0 / RS1)',
    overview: 'Program execution flow: Populate default Bank 0 (00H-07H), select Bank 1 via RS0=1 (08H-0FH), select Bank 2 via RS1=1 (10H-17H), select Bank 3 via RS1=1,RS0=1 (18H-1FH), and perform direct memory verification of all 32 bytes.',
    nodes: [
      { id: 'start', type: 'start', label: 'START', subLabel: 'ORG 0000H -> LJMP START' },
      {
        id: 'bank0_load',
        type: 'process',
        label: 'Populate Bank 0 (PSW = 00H, RAM 00H..07H)',
        subLabel: 'Load R0=10H, R1=11H, ... R7=17H',
        asmCode: 'MOV PSW, #00H\nMOV R0, #10H\nMOV R1, #11H\n; ...\nMOV R7, #17H'
      },
      {
        id: 'bank1_load',
        type: 'process',
        label: 'Switch to Bank 1 (SETB PSW.3, RAM 08H..0FH)',
        subLabel: 'Load R0=20H, R1=21H, ... R7=27H',
        asmCode: 'SETB PSW.3\nMOV R0, #20H\nMOV R1, #21H\n; ...\nMOV R7, #27H'
      },
      {
        id: 'bank2_load',
        type: 'process',
        label: 'Switch to Bank 2 (CLR PSW.3; SETB PSW.4, RAM 10H..17H)',
        subLabel: 'Load R0=30H, R1=31H, ... R7=37H',
        asmCode: 'CLR PSW.3\nSETB PSW.4\nMOV R0, #30H\n; ...\nMOV R7, #37H'
      },
      {
        id: 'bank3_load',
        type: 'process',
        label: 'Switch to Bank 3 (SETB PSW.3, RAM 18H..1FH)',
        subLabel: 'Load R0=40H, R1=41H, ... R7=47H',
        asmCode: 'SETB PSW.3\nMOV R0, #40H\n; ...\nMOV R7, #47H'
      },
      {
        id: 'verify_direct',
        type: 'io',
        label: 'Direct Memory Verification Across All Banks',
        subLabel: 'Directly read RAM 00H, 08H, 10H, 18H into Accumulator A',
        asmCode: 'MOV A, 00H\nMOV 40H, A\nMOV A, 08H\nMOV 41H, A\nMOV A, 10H\nMOV 42H, A\nMOV A, 18H\nMOV 43H, A'
      },
      { id: 'stop', type: 'stop', label: 'HALT', subLabel: 'SJMP $ (Trap in endless loop)' }
    ]
  },

  exp_8051_timer0_m1: {
    expId: 'exp_8051_timer0_m1',
    title: '8051 Timer 0 in Mode 1 (25 ms Delay & Blink Port P0)',
    overview: 'Program execution flow: Configure TMOD = 01H (Timer 0 Mode 1 16-bit), initialize Port P0, call DELAY subroutine (preload TH0 = 9EH, TL0 = 58H, start TR0, poll TF0, stop TR0, clear TF0), complement Port P0 pins (CPL P0), and repeat indefinitely.',
    nodes: [
      { id: 'start', type: 'start', label: 'START', subLabel: 'ORG 0000H -> LJMP MAIN' },
      {
        id: 'init_tmod',
        type: 'process',
        label: 'Configure TMOD = 01H (Timer 0 Mode 1)',
        subLabel: '16-bit Timer Mode @ 12.0 MHz (1 µs per machine cycle)',
        asmCode: 'MOV TMOD, #01H'
      },
      {
        id: 'init_port',
        type: 'process',
        label: 'Initialize Port P0 (00H -> All LEDs OFF)',
        subLabel: 'Clear Port P0 data latch',
        asmCode: 'MOV P0, #00H'
      },
      {
        id: 'preload_timer',
        type: 'process',
        label: 'Preload Timer 0 Registers (9E58H)',
        subLabel: 'TH0 = 9EH, TL0 = 58H (65,536 - 25,000 = 40,536)',
        asmCode: 'MOV TL0, #58H\nMOV TH0, #9EH'
      },
      {
        id: 'start_timer',
        type: 'process',
        label: 'Start Timer 0 (SETB TR0)',
        subLabel: 'TL0:TH0 increments upwards from 9E58H',
        asmCode: 'SETB TR0'
      },
      {
        id: 'poll_tf0',
        type: 'decision',
        label: 'Has Timer 0 Overflowed (TF0 == 1)?',
        decisionQuery: 'JNB TF0, HERE -> Has 25,000 µs (25 ms) elapsed?',
        hardwareFlagTested: 'Timer 0 Overflow Flag (TF0 / TCON.5)',
        yesBranch: {
          label: 'YES (TF0 = 1, 25 ms Elapse Complete)',
          conditionText: 'Counter rolled over from FFFFH to 0000H',
          action: 'Proceed to stop timer and service pulse.',
          asmBranchInstruction: 'JNB TF0, POLL_LOOP',
          targetLabel: 'Stop Timer 0',
          isLoopBack: false,
          color: 'emerald'
        },
        noBranch: {
          label: 'NO (TF0 = 0, Counting in Progress)',
          conditionText: 'Timer still incrementing towards FFFFH',
          action: 'Continue polling TF0 flag in tight loop.',
          asmBranchInstruction: 'SJMP POLL_LOOP',
          targetLabel: 'Poll TF0 Again',
          isLoopBack: true,
          color: 'amber'
        }
      },
      {
        id: 'stop_timer',
        type: 'process',
        label: 'Stop Timer 0 & Clear TF0 Flag',
        subLabel: 'CLR TR0 (stop counter); CLR TF0 (reset hardware flag)',
        asmCode: 'CLR TR0\nCLR TF0'
      },
      {
        id: 'toggle_p0',
        type: 'io',
        label: 'Complement Port P0 Pins (CPL P0)',
        subLabel: 'Inverts all 8 LED states (00H <-> FFH) every 25 ms',
        asmCode: 'CPL P0\nSJMP MAIN_LOOP'
      }
    ]
  },

  exp_8051_timer1_m0: {
    expId: 'exp_8051_timer1_m0',
    title: '8051 Timer 1 in Mode 0 (50 µs Delay & Blink Port P2)',
    overview: 'Program execution flow: Configure TMOD = 00H (Timer 1 Mode 0 13-bit legacy counter), load TH1 = 0FEH and TL1 = 0EH (8,192 - 50 = 8,142), start TR1, poll TF1 for 50 µs rollover, clear TF1, complement Port P2 pins, and loop continuously to generate a 10 kHz square wave.',
    nodes: [
      { id: 'start', type: 'start', label: 'START', subLabel: 'ORG 0000H -> LJMP MAIN' },
      {
        id: 'init_tmod_m0',
        type: 'process',
        label: 'Configure TMOD = 00H (Timer 1 Mode 0)',
        subLabel: '13-bit Timer Mode @ 12.0 MHz (max count 8,192)',
        asmCode: 'MOV TMOD, #00H'
      },
      {
        id: 'preload_m0',
        type: 'process',
        label: 'Load 13-bit Preload (TH1 = 0FEH, TL1 = 0EH)',
        subLabel: 'Preload = 8,192 - 50 = 8,142 (1FCEH in 13-bit format)',
        asmCode: 'MOV TL1, #0EH\nMOV TH1, #0FEH'
      },
      {
        id: 'start_t1',
        type: 'process',
        label: 'Start Timer 1 (SETB TR1)',
        subLabel: 'TL1 (lower 5 bits) and TH1 (upper 8 bits) increment',
        asmCode: 'SETB TR1'
      },
      {
        id: 'poll_tf1',
        type: 'decision',
        label: 'Has Timer 1 Overflowed (TF1 == 1)?',
        decisionQuery: 'JNB TF1, WAIT_50US -> Has 50 µs elapsed?',
        hardwareFlagTested: 'Timer 1 Overflow Flag (TF1 / TCON.7)',
        yesBranch: {
          label: 'YES (TF1 = 1, 50 µs Completed)',
          conditionText: '13-bit counter reached 1FFFH -> 0000H',
          action: 'Stop timer and toggle Port P2.',
          asmBranchInstruction: 'JNB TF1, WAIT_50US',
          targetLabel: 'Stop Timer 1',
          isLoopBack: false,
          color: 'emerald'
        },
        noBranch: {
          label: 'NO (TF1 = 0, Counting in Progress)',
          conditionText: 'Counting towards 50 µs completion',
          action: 'Hold execution in polling loop.',
          asmBranchInstruction: 'SJMP WAIT_50US',
          targetLabel: 'Wait Loop',
          isLoopBack: true,
          color: 'amber'
        }
      },
      {
        id: 'clear_tf1',
        type: 'process',
        label: 'Stop Timer 1 & Clear TF1 Flag',
        subLabel: 'CLR TR1; CLR TF1',
        asmCode: 'CLR TR1\nCLR TF1'
      },
      {
        id: 'toggle_p2',
        type: 'io',
        label: 'Complement Port P2 Pins (CPL P2)',
        subLabel: 'Toggle Port P2 to output 10.0 kHz square wave',
        asmCode: 'CPL P2\nSJMP MAIN_LOOP'
      }
    ]
  },

  exp_8051_counter0_m2: {
    expId: 'exp_8051_counter0_m2',
    title: '8051 Counter/Timer 0 in Mode 2 (75 ms Delay & Blink Port P1)',
    overview: 'Program execution flow: Configure TMOD = 02H (8-bit Auto-Reload), preload TH0 = 06H and TL0 = 06H (250 µs base tick), start TR0, execute 300 software loop iterations (R2=2, R3=150) polling TF0 on each tick, complement Port P1 pins, and repeat.',
    nodes: [
      { id: 'start', type: 'start', label: 'START', subLabel: 'ORG 0000H -> LJMP MAIN' },
      {
        id: 'init_tmod_m2',
        type: 'process',
        label: 'Configure TMOD = 02H (Timer 0 Mode 2)',
        subLabel: '8-bit Auto-Reload Mode (TL0 reloaded from TH0 automatically)',
        asmCode: 'MOV TMOD, #02H'
      },
      {
        id: 'preload_th0',
        type: 'process',
        label: 'Preload TH0 = 06H & TL0 = 06H (250 µs Base)',
        subLabel: 'Count = 256 - 250 = 6 (06H); Start Timer 0 (SETB TR0)',
        asmCode: 'MOV TH0, #06H\nMOV TL0, #06H\nSETB TR0'
      },
      {
        id: 'init_multiplier',
        type: 'process',
        label: 'Load Software Multiplier (300 Loops)',
        subLabel: 'MOV R2, #2 (Outer Loop); MOV R3, #150 (Inner Loop) -> 2 × 150 = 300',
        asmCode: 'MOV R2, #2\nLOOP_OUTER: MOV R3, #150'
      },
      {
        id: 'poll_tf0_m2',
        type: 'decision',
        label: 'Has 250 µs Base Tick Elapsed (TF0 == 1)?',
        decisionQuery: 'JNB TF0, $ -> Has TL0 rolled over from FFH to 06H?',
        hardwareFlagTested: 'Timer 0 Overflow Flag (TF0)',
        yesBranch: {
          label: 'YES (TF0 = 1, 250 µs Elapsed)',
          conditionText: 'Hardware auto-reloaded TH0 into TL0',
          action: 'Clear TF0 flag and decrement loop counter.',
          asmBranchInstruction: 'JNB TF0, $',
          targetLabel: 'Clear TF0',
          isLoopBack: false,
          color: 'emerald'
        },
        noBranch: {
          label: 'NO (TF0 = 0, Counting)',
          conditionText: 'Timer incrementing from 06H to FFH',
          action: 'Wait for tick completion.',
          asmBranchInstruction: 'SJMP POLL_TICK',
          targetLabel: 'Poll Loop',
          isLoopBack: true,
          color: 'amber'
        }
      },
      {
        id: 'loop_check',
        type: 'decision',
        label: 'Have All 300 Ticks Completed (75 ms)?',
        decisionQuery: 'DJNZ R3, LOOP_INNER; DJNZ R2, LOOP_OUTER -> Done?',
        hardwareFlagTested: 'Software Loop Registers R2 & R3',
        yesBranch: {
          label: 'YES (300 × 250 µs = 75 ms Completed)',
          conditionText: 'Both inner and outer loop counters reached zero',
          action: 'Invert Port P1 and restart 75 ms cycle.',
          asmBranchInstruction: 'DJNZ R2, LOOP_OUTER',
          targetLabel: 'Toggle Port P1',
          isLoopBack: false,
          color: 'emerald'
        },
        noBranch: {
          label: 'NO (Remaining Ticks Pending)',
          conditionText: 'R3 or R2 still non-zero',
          action: 'Wait for next 250 µs auto-reload tick.',
          asmBranchInstruction: 'DJNZ R3, LOOP_INNER',
          targetLabel: 'Wait Next Tick',
          isLoopBack: true,
          color: 'amber'
        }
      },
      {
        id: 'toggle_p1',
        type: 'io',
        label: 'Complement Port P1 Pins (CPL P1)',
        subLabel: 'Toggles all 8 LEDs at 6.67 Hz (150 ms period)',
        asmCode: 'CPL P1\nSJMP MAIN_LOOP'
      }
    ]
  },

  exp_8051_counter1_m1: {
    expId: 'exp_8051_counter1_m1',
    title: '8051 Counter 1 in Mode 1 (80 µs / 80 Pulse Delay & Blink Port P3)',
    overview: 'Program execution flow: Configure TMOD = 50H (Counter 1 Mode 1 16-bit external pulse mode on pin T1/P3.5) or 10H (Timer mode), preload TH1 = 0FFH and TL1 = 0B0H (65,536 - 80 = 65,456), start Counter 1 (SETB TR1), wait for 80 transitions/µs until TF1 is set, stop Counter 1, clear TF1, complement Port P3 pins, and loop continuously.',
    nodes: [
      { id: 'start', type: 'start', label: 'START', subLabel: 'ORG 0000H -> LJMP MAIN' },
      {
        id: 'init_tmod_c1',
        type: 'process',
        label: 'Configure TMOD = 50H (Counter 1 Mode 1)',
        subLabel: '16-bit External Event Counter (Pin T1/P3.5) or Mode 1 Timer (10H)',
        asmCode: 'MOV TMOD, #50H ; (Or 10H for internal timing)'
      },
      {
        id: 'preload_c1',
        type: 'process',
        label: 'Preload TH1 = 0FFH & TL1 = 0B0H (80 Counts)',
        subLabel: 'Preload = 65,536 - 80 = 65,456 (FFB0H in 16-bit counter)',
        asmCode: 'MOV TL1, #0B0H\nMOV TH1, #0FFH'
      },
      {
        id: 'start_c1',
        type: 'process',
        label: 'Start Counter 1 (SETB TR1)',
        subLabel: 'Counter 1 samples pin T1 on 1-to-0 negative transitions',
        asmCode: 'SETB TR1'
      },
      {
        id: 'poll_tf1_c1',
        type: 'decision',
        label: 'Have 80 Pulses / 80 µs Elapsed (TF1 == 1)?',
        decisionQuery: 'JNB TF1, WAIT_80PULSES -> Has counter reached FFFFH -> 0000H?',
        hardwareFlagTested: 'Counter 1 Overflow Flag (TF1 / TCON.7)',
        yesBranch: {
          label: 'YES (TF1 = 1, 80 Events Accumulated)',
          conditionText: '16-bit counter rolled over from FFFFH',
          action: 'Stop Counter 1 and toggle Port P3.',
          asmBranchInstruction: 'JNB TF1, WAIT_80PULSES',
          targetLabel: 'Stop Counter 1',
          isLoopBack: false,
          color: 'emerald'
        },
        noBranch: {
          label: 'NO (TF1 = 0, Still Counting Pulses)',
          conditionText: 'Fewer than 80 pulses received',
          action: 'Continue sampling external clock pin T1.',
          asmBranchInstruction: 'SJMP WAIT_80PULSES',
          targetLabel: 'Sampling Loop',
          isLoopBack: true,
          color: 'amber'
        }
      },
      {
        id: 'stop_c1',
        type: 'process',
        label: 'Stop Counter 1 & Clear TF1 Flag',
        subLabel: 'CLR TR1; CLR TF1',
        asmCode: 'CLR TR1\nCLR TF1'
      },
      {
        id: 'toggle_p3',
        type: 'io',
        label: 'Complement Port P3 Pins (CPL P3)',
        subLabel: 'Inverts Port P3 to output 6.25 kHz waveform / event pulse train',
        asmCode: 'CPL P3\nSJMP MAIN_LOOP'
      }
    ]
  },

  exp_8051_uart_9600: {
    expId: 'exp_8051_uart_9600',
    title: '8051 UART Serial Transfer at 9600 Baud Rate',
    overview: 'Program execution flow: Configure TMOD = 20H for Timer 1 Mode 2 (8-bit auto-reload), preload TH1 = 0FDH (-3D) for 9600 baud at 11.0592 MHz, set SCON = 50H (Mode 1 8-bit UART, REN=1), start Timer 1 (SETB TR1), load character \'A\' (41H) into SBUF to begin serial shifting on TXD (P3.1), poll TI flag until stop bit finishes, clear TI, and repeat in infinite loop.',
    nodes: [
      { id: 'start', type: 'start', label: 'START', subLabel: 'ORG 0000H -> LJMP MAIN' },
      {
        id: 'init_tmod_u96',
        type: 'process',
        label: 'Configure TMOD = 20H (Timer 1 Mode 2)',
        subLabel: '8-Bit Auto-Reload Mode (Baud Rate Generator)',
        asmCode: 'MOV TMOD, #20H'
      },
      {
        id: 'preload_th1_u96',
        type: 'process',
        label: 'Load TH1 = 0FDH for 9600 Baud',
        subLabel: 'TH1 = 256 - 3 = 253 = 0FDH (Clock = 28,800 Hz / 9600 = 3)',
        asmCode: 'MOV TH1, #0FDH'
      },
      {
        id: 'init_scon_u96',
        type: 'process',
        label: 'Configure SCON = 50H (Mode 1 8-bit UART)',
        subLabel: '1 Start bit, 8 Data bits, 1 Stop bit, Receiver Enabled (REN=1)',
        asmCode: 'MOV SCON, #50H'
      },
      {
        id: 'start_tr1_u96',
        type: 'process',
        label: 'Start Timer 1 (SETB TR1)',
        subLabel: 'Supplies 9600 baud clock pulses to serial port',
        asmCode: 'SETB TR1'
      },
      {
        id: 'write_sbuf_u96',
        type: 'io',
        label: 'Load SBUF with Character \'A\' (41H)',
        subLabel: 'Initiates hardware transmission over Pin TXD (P3.1)',
        asmCode: 'AGAIN:\nMOV SBUF, #\'A\''
      },
      {
        id: 'poll_ti_u96',
        type: 'decision',
        label: 'Has Transmission Finished (TI == 1)?',
        decisionQuery: 'JNB TI, WAIT_TI -> Has stop bit been shifted out on TXD?',
        hardwareFlagTested: 'Transmit Interrupt Flag (TI / SCON.1)',
        yesBranch: {
          label: 'YES (TI = 1, Byte Transmitted)',
          conditionText: 'Entire 10-bit asynchronous frame sent successfully',
          action: 'Clear TI flag and repeat transmission loop.',
          asmBranchInstruction: 'JNB TI, WAIT_TI',
          targetLabel: 'Clear TI Flag',
          isLoopBack: false,
          color: 'emerald'
        },
        noBranch: {
          label: 'NO (TI = 0, Shifting Bits)',
          conditionText: 'UART currently shifting data/stop bits',
          action: 'Wait for TI assertion.',
          asmBranchInstruction: 'SJMP WAIT_TI',
          targetLabel: 'Poll TI Loop',
          isLoopBack: true,
          color: 'amber'
        }
      },
      {
        id: 'clear_ti_u96',
        type: 'process',
        label: 'Clear Transmit Flag (CLR TI)',
        subLabel: 'Prepares UART for next character; jumps back to AGAIN',
        asmCode: 'CLR TI\nSJMP AGAIN'
      }
    ]
  },

  exp_8051_uart_4800: {
    expId: 'exp_8051_uart_4800',
    title: '8051 UART Serial Transfer at 4800 Baud Rate',
    overview: 'Program execution flow: Configure TMOD = 20H for Timer 1 Mode 2 (8-bit auto-reload), preload TH1 = 0FAH (-6D) for 4800 baud at 11.0592 MHz, set SCON = 50H (Mode 1 8-bit UART, REN=1), start Timer 1 (SETB TR1), load character \'B\' (42H) into SBUF, poll TI flag, clear TI, and repeat continuously.',
    nodes: [
      { id: 'start', type: 'start', label: 'START', subLabel: 'ORG 0000H -> LJMP MAIN' },
      {
        id: 'init_tmod_u48',
        type: 'process',
        label: 'Configure TMOD = 20H (Timer 1 Mode 2)',
        subLabel: '8-Bit Auto-Reload Baud Generator',
        asmCode: 'MOV TMOD, #20H'
      },
      {
        id: 'preload_th1_u48',
        type: 'process',
        label: 'Load TH1 = 0FAH for 4800 Baud',
        subLabel: 'TH1 = 256 - 6 = 250 = 0FAH (Clock = 28,800 Hz / 4800 = 6)',
        asmCode: 'MOV TH1, #0FAH'
      },
      {
        id: 'init_scon_u48',
        type: 'process',
        label: 'Configure SCON = 50H (Mode 1 8-bit UART)',
        subLabel: '1 Start bit, 8 Data bits, 1 Stop bit, REN=1',
        asmCode: 'MOV SCON, #50H'
      },
      {
        id: 'start_tr1_u48',
        type: 'process',
        label: 'Start Timer 1 (SETB TR1)',
        subLabel: 'Supplies 4800 baud clock pulses',
        asmCode: 'SETB TR1'
      },
      {
        id: 'write_sbuf_u48',
        type: 'io',
        label: 'Load SBUF with Character \'B\' (42H)',
        subLabel: 'Initiates transmission (Bit duration = 208.33 µs)',
        asmCode: 'AGAIN:\nMOV SBUF, #\'B\''
      },
      {
        id: 'poll_ti_u48',
        type: 'decision',
        label: 'Has Transmission Finished (TI == 1)?',
        decisionQuery: 'JNB TI, WAIT_TI -> Has stop bit finished?',
        hardwareFlagTested: 'Transmit Interrupt Flag (TI / SCON.1)',
        yesBranch: {
          label: 'YES (TI = 1, 4800 Baud Byte Sent)',
          conditionText: 'Frame duration (2.083 ms) elapsed',
          action: 'Clear TI flag and loop back.',
          asmBranchInstruction: 'JNB TI, WAIT_TI',
          targetLabel: 'Clear TI Flag',
          isLoopBack: false,
          color: 'emerald'
        },
        noBranch: {
          label: 'NO (TI = 0, In Progress)',
          conditionText: 'Bits transmitting over TXD line',
          action: 'Wait for TI flag.',
          asmBranchInstruction: 'SJMP WAIT_TI',
          targetLabel: 'Poll Loop',
          isLoopBack: true,
          color: 'amber'
        }
      },
      {
        id: 'clear_ti_u48',
        type: 'process',
        label: 'Clear Transmit Flag (CLR TI)',
        subLabel: 'CLR TI; loop to AGAIN',
        asmCode: 'CLR TI\nSJMP AGAIN'
      }
    ]
  },

  exp_8051_uart_2400: {
    expId: 'exp_8051_uart_2400',
    title: '8051 UART Serial Transfer at 2400 Baud Rate',
    overview: 'Program execution flow: Configure TMOD = 20H for Timer 1 Mode 2 (8-bit auto-reload), preload TH1 = 0F4H (-12D) for 2400 baud at 11.0592 MHz, set SCON = 50H (Mode 1 8-bit UART, REN=1), start Timer 1 (SETB TR1), load character \'C\' (43H) into SBUF, poll TI flag, clear TI, and repeat indefinitely.',
    nodes: [
      { id: 'start', type: 'start', label: 'START', subLabel: 'ORG 0000H -> LJMP MAIN' },
      {
        id: 'init_tmod_u24',
        type: 'process',
        label: 'Configure TMOD = 20H (Timer 1 Mode 2)',
        subLabel: '8-Bit Auto-Reload Baud Rate Generator',
        asmCode: 'MOV TMOD, #20H'
      },
      {
        id: 'preload_th1_u24',
        type: 'process',
        label: 'Load TH1 = 0F4H for 2400 Baud',
        subLabel: 'TH1 = 256 - 12 = 244 = 0F4H (Clock = 28,800 Hz / 2400 = 12)',
        asmCode: 'MOV TH1, #0F4H'
      },
      {
        id: 'init_scon_u24',
        type: 'process',
        label: 'Configure SCON = 50H (Mode 1 8-bit UART)',
        subLabel: '1 Start bit, 8 Data bits, 1 Stop bit, REN=1',
        asmCode: 'MOV SCON, #50H'
      },
      {
        id: 'start_tr1_u24',
        type: 'process',
        label: 'Start Timer 1 (SETB TR1)',
        subLabel: 'Supplies 2400 baud clock pulses',
        asmCode: 'SETB TR1'
      },
      {
        id: 'write_sbuf_u24',
        type: 'io',
        label: 'Load SBUF with Character \'C\' (43H)',
        subLabel: 'Initiates transmission (Bit duration = 416.67 µs)',
        asmCode: 'AGAIN:\nMOV SBUF, #\'C\''
      },
      {
        id: 'poll_ti_u24',
        type: 'decision',
        label: 'Has Transmission Finished (TI == 1)?',
        decisionQuery: 'JNB TI, WAIT_TI -> Has stop bit finished?',
        hardwareFlagTested: 'Transmit Interrupt Flag (TI / SCON.1)',
        yesBranch: {
          label: 'YES (TI = 1, 2400 Baud Byte Sent)',
          conditionText: 'Frame duration (4.167 ms) elapsed',
          action: 'Clear TI flag and loop back.',
          asmBranchInstruction: 'JNB TI, WAIT_TI',
          targetLabel: 'Clear TI Flag',
          isLoopBack: false,
          color: 'emerald'
        },
        noBranch: {
          label: 'NO (TI = 0, In Progress)',
          conditionText: 'Bits transmitting over TXD line',
          action: 'Wait for TI flag.',
          asmBranchInstruction: 'SJMP WAIT_TI',
          targetLabel: 'Poll Loop',
          isLoopBack: true,
          color: 'amber'
        }
      },
      {
        id: 'clear_ti_u24',
        type: 'process',
        label: 'Clear Transmit Flag (CLR TI)',
        subLabel: 'CLR TI; loop to AGAIN',
        asmCode: 'CLR TI\nSJMP AGAIN'
      }
    ]
  },

  exp_8051_lcd_8bit: {
    expId: 'exp_8051_lcd_8bit',
    title: 'Interfacing 16×2 LCD with 8051 Microcontroller (8-Bit Mode)',
    overview: 'Program execution flow: Initialize 8051 ports (P1 as 8-bit Data Bus, P2.0=RS, P2.1=RW, P2.2=EN), send command sequence (38H, 0EH, 01H, 06H, 80H) via LCD_CMD routine with RS=0 and High-to-Low EN pulses, send ASCII character strings for Line 1 via LCD_DATA routine with RS=1, reposition cursor to Line 2 (C0H), write Line 2 characters, and halt.',
    nodes: [
      { id: 'start', type: 'start', label: 'START', subLabel: 'ORG 0000H -> LJMP MAIN' },
      {
        id: 'init_ports_8bit',
        type: 'process',
        label: 'Initialize 8051 Control & Data Ports',
        subLabel: 'CLR RS (P2.0=0), CLR RW (P2.1=0), CLR EN (P2.2=0)',
        asmCode: 'CLR P2.0 ; RS=0\nCLR P2.1 ; RW=0 (Write)\nCLR P2.2 ; EN=0'
      },
      {
        id: 'send_cmd_38h',
        type: 'io',
        label: 'Send Command 38H (Function Set: 8-Bit, 2-Line, 5×7)',
        subLabel: 'Load A with 38H, call LCD_CMD routine with EN falling-edge strobe',
        asmCode: 'MOV A, #38H\nACALL LCD_CMD'
      },
      {
        id: 'send_cmd_0eh',
        type: 'io',
        label: 'Send Command 0EH (Display ON, Cursor ON)',
        subLabel: 'Activates LCD display matrix and shows underline cursor',
        asmCode: 'MOV A, #0EH\nACALL LCD_CMD'
      },
      {
        id: 'send_cmd_01h',
        type: 'io',
        label: 'Send Command 01H (Clear Display Screen)',
        subLabel: 'Clears all 32 DDRAM character locations and homes cursor (needs 1.64 ms)',
        asmCode: 'MOV A, #01H\nACALL LCD_CMD'
      },
      {
        id: 'send_cmd_06h',
        type: 'io',
        label: 'Send Command 06H (Entry Mode: Auto-Increment)',
        subLabel: 'Configures DDRAM address counter to increment rightwards after each write',
        asmCode: 'MOV A, #06H\nACALL LCD_CMD'
      },
      {
        id: 'set_line1_addr',
        type: 'process',
        label: 'Set DDRAM Base Address for Line 1 (80H)',
        subLabel: 'Moves cursor to Row 1, Column 1 (Address 00H -> Command 80H)',
        asmCode: 'MOV A, #80H\nACALL LCD_CMD'
      },
      {
        id: 'display_line1_chars',
        type: 'io',
        label: 'Stream Line 1 Characters via LCD_DATA (RS=1)',
        subLabel: 'Write ASCII string "8051 INTERFACE" to DDRAM with EN falling-edge strobe',
        asmCode: 'MOV DPTR, #MSG1\nLINE1_LOOP:\nCLR A\nMOVC A, @A+DPTR\nJZ SET_LINE2\nACALL LCD_DATA\nINC DPTR\nSJMP LINE1_LOOP'
      },
      {
        id: 'set_line2_addr',
        type: 'process',
        label: 'Set DDRAM Base Address for Line 2 (C0H)',
        subLabel: 'Moves cursor to Row 2, Column 1 (Address 40H -> Command C0H)',
        asmCode: 'SET_LINE2:\nMOV A, #0C0H\nACALL LCD_CMD'
      },
      {
        id: 'display_line2_chars',
        type: 'io',
        label: 'Stream Line 2 Characters via LCD_DATA (RS=1)',
        subLabel: 'Write ASCII string "16x2 LCD 8-BIT" to Row 2 DDRAM locations',
        asmCode: 'MOV DPTR, #MSG2\nLINE2_LOOP:\nCLR A\nMOVC A, @A+DPTR\nJZ HALT\nACALL LCD_DATA\nINC DPTR\nSJMP LINE2_LOOP'
      },
      {
        id: 'stop',
        type: 'stop',
        label: 'HALT / ENDLESS LOOP',
        subLabel: 'SJMP $ (Preserves static display content on LCD screen)'
      }
    ]
  },

  exp_8051_lcd_4bit: {
    expId: 'exp_8051_lcd_4bit',
    title: 'Interfacing 16×2 LCD with 8051 Microcontroller (4-Bit Mode)',
    overview: 'Program execution flow: Initialize 8051 ports (P1.4-P1.7 as Data Bus, P1.0-P1.3 Free, P2.0=RS, P2.1=RW, P2.2=EN), perform 4-bit state machine reset sequence (33H -> 32H -> 28H), send control commands (0EH, 01H, 06H, 80H) split into high & low nibbles via SWAP A, stream character strings to Line 1 and Line 2 via dual-nibble transmissions, and halt.',
    nodes: [
      { id: 'start', type: 'start', label: 'START', subLabel: 'ORG 0000H -> LJMP MAIN' },
      {
        id: 'init_ports_4bit',
        type: 'process',
        label: 'Initialize Control & 4-Bit Bus (P1.4–P1.7)',
        subLabel: 'CLR RS (P2.0), CLR RW (P2.1), CLR EN (P2.2); P1.0-P1.3 remain free',
        asmCode: 'CLR P2.0 ; RS=0\nCLR P2.1 ; RW=0\nCLR P2.2 ; EN=0'
      },
      {
        id: 'reset_handshake_4bit',
        type: 'process',
        label: 'Execute 4-Bit Hardware Reset Handshake (33H, 32H)',
        subLabel: 'Force controller out of unknown state and lock bus width into 4-bit mode',
        asmCode: 'MOV A, #33H\nACALL LCD_CMD_4BIT\nMOV A, #32H\nACALL LCD_CMD_4BIT'
      },
      {
        id: 'send_cmd_28h',
        type: 'io',
        label: 'Send Command 28H (4-Bit Bus, 2 Lines, 5×7 Font)',
        subLabel: 'Configures HD44780 4-bit dual-nibble interface format',
        asmCode: 'MOV A, #28H\nACALL LCD_CMD_4BIT'
      },
      {
        id: 'send_cmd_0eh_4bit',
        type: 'io',
        label: 'Send Command 0EH (Display ON, Cursor ON)',
        subLabel: 'Sent as upper nibble (00H) + EN, lower nibble (E0H) + EN',
        asmCode: 'MOV A, #0EH\nACALL LCD_CMD_4BIT'
      },
      {
        id: 'send_cmd_01h_4bit',
        type: 'io',
        label: 'Send Command 01H (Clear Display)',
        subLabel: 'Clears DDRAM locations and returns address counter to 00H',
        asmCode: 'MOV A, #01H\nACALL LCD_CMD_4BIT'
      },
      {
        id: 'send_cmd_06h_4bit',
        type: 'io',
        label: 'Send Command 06H (Entry Mode: Auto-Increment)',
        subLabel: 'Cursor increments automatically to the right after every character',
        asmCode: 'MOV A, #06H\nACALL LCD_CMD_4BIT'
      },
      {
        id: 'set_line1_4bit',
        type: 'process',
        label: 'Set DDRAM Base Address for Line 1 (80H)',
        subLabel: 'Points cursor to Row 1 Column 1 via Command 80H (Dual Nibble)',
        asmCode: 'MOV A, #80H\nACALL LCD_CMD_4BIT'
      },
      {
        id: 'display_line1_4bit',
        type: 'io',
        label: 'Stream Line 1 via Dual-Nibble LCD_DATA_4BIT (RS=1)',
        subLabel: 'Transmit "4-BIT LCD MODE" (Upper nibble + EN -> SWAP A -> Lower nibble + EN)',
        asmCode: 'MOV DPTR, #MSG1\nL1_4BIT:\nCLR A\nMOVC A, @A+DPTR\nJZ SET_L2_4BIT\nACALL LCD_DATA_4BIT\nINC DPTR\nSJMP L1_4BIT'
      },
      {
        id: 'set_line2_4bit',
        type: 'process',
        label: 'Set DDRAM Base Address for Line 2 (C0H)',
        subLabel: 'Points cursor to Row 2 Column 1 via Command C0H (Dual Nibble)',
        asmCode: 'SET_L2_4BIT:\nMOV A, #0C0H\nACALL LCD_CMD_4BIT'
      },
      {
        id: 'display_line2_4bit',
        type: 'io',
        label: 'Stream Line 2 via Dual-Nibble LCD_DATA_4BIT (RS=1)',
        subLabel: 'Transmit "SAVING 4 I/O PINS" while leaving P1.0-P1.3 free for other hardware',
        asmCode: 'MOV DPTR, #MSG2\nL2_4BIT:\nCLR A\nMOVC A, @A+DPTR\nJZ HALT_4BIT\nACALL LCD_DATA_4BIT\nINC DPTR\nSJMP L2_4BIT'
      },
      {
        id: 'stop',
        type: 'stop',
        label: 'HALT / ENDLESS LOOP',
        subLabel: 'SJMP $ (Preserves static display content on LCD screen)'
      }
    ]
  }
};

