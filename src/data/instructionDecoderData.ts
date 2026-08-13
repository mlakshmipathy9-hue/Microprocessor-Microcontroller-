export interface SimulatorInstruction {
  opcode: string;
  category: 'Data Copy / Transfer' | 'Arithmetic' | 'BCD & ASCII' | 'Logical' | 'Branch' | 'Loop' | 'Machine Control' | 'Flag Manipulation' | 'Shift & Rotate' | 'String & Port';
  desc: string;
  setupDesc: string;
  initialRegs: Record<string, number>;
  initialFlags: Record<string, number>;
  execute: (regs: Record<string, number>, flags: Record<string, number>) => {
    newRegs: Record<string, number>;
    newFlags: Record<string, number>;
    mathExplanation: string;
  };
}

export const mockInstructions: SimulatorInstruction[] = [
  // ================= CATEGORY: DATA COPY / TRANSFER =================
  {
    opcode: 'MOV CX, 037AH',
    category: 'Data Copy / Transfer',
    desc: 'Copies the 16-bit immediate value 037AH directly into register CX.',
    setupDesc: 'Initializes CX = 0000H to show immediate data loading. Does not affect any flags.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const newRegs = { ...regs, CX: 0x037A, IP: regs.IP + 3 };
      return {
        newRegs,
        newFlags: { ...flags },
        mathExplanation: 'The 16-bit immediate value 037AH is placed in CX. The instruction is 3 bytes long, so IP is incremented by 3. Status flags are unaffected by MOV.'
      };
    }
  },
  {
    opcode: 'XCHG AX, BX',
    category: 'Data Copy / Transfer',
    desc: 'Exchanges the 16-bit contents of AX and BX registers.',
    setupDesc: 'Initializes AX = 1234H, BX = ABCDH to demonstrate swapping values.',
    initialRegs: { AX: 0x1234, BX: 0xABCD, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const newRegs = { ...regs, AX: regs.BX, BX: regs.AX, IP: regs.IP + 1 };
      return {
        newRegs,
        newFlags: { ...flags },
        mathExplanation: 'The contents of AX and BX are swapped. AX becomes ABCDH, and BX becomes 1234H. No flags are affected.'
      };
    }
  },
  {
    opcode: 'XLAT',
    category: 'Data Copy / Transfer',
    desc: 'Translates a byte in AL using a lookup table pointed to by DS:BX.',
    setupDesc: 'Initializes DS:BX to Gray Code Table. AL holds offset 3. Executes translation.',
    initialRegs: { AX: 0x0003, BX: 0x0200, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x1000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      // In Gray code scenario, index 3 is 0x02
      const translated = 0x02; 
      const newAX = (regs.AX & 0xFF00) | translated;
      return {
        newRegs: { ...regs, AX: newAX, IP: regs.IP + 1 },
        newFlags: { ...flags },
        mathExplanation: 'XLAT loads AL from DS:[BX + AL]. BX points to Gray Code table. Index AL=3 corresponds to 02H. AL is updated to 02H. Flags are unaffected.'
      };
    }
  },
  {
    opcode: 'LEA BX, PRICES',
    category: 'Data Copy / Transfer',
    desc: 'Loads the 16-bit offset/effective address of memory variable PRICES into BX.',
    setupDesc: 'Initializes PRICES offset = 20A0H. BX is cleared to 0000H.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const newRegs = { ...regs, BX: 0x20A0, IP: regs.IP + 4 };
      return {
        newRegs,
        newFlags: { ...flags },
        mathExplanation: 'LEA calculates the offset of PRICES (20A0H) and loads it into BX. Flags are unaffected.'
      };
    }
  },
  {
    opcode: 'LDS SI, SPTR',
    category: 'Data Copy / Transfer',
    desc: 'Loads a 32-bit far pointer from memory: 16-bit offset into SI, 16-bit segment into DS.',
    setupDesc: 'Initializes memory double-word SPTR with [4326H:2340H].',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x0000, DI: 0x2000, CS: 0x1000, DS: 0x0000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const newRegs = { ...regs, SI: 0x2340, DS: 0x4326, IP: regs.IP + 4 };
      return {
        newRegs,
        newFlags: { ...flags },
        mathExplanation: 'LDS loads SI with offset 2340H, and DS with segment 4326H from SPTR memory. Flags are unaffected.'
      };
    }
  },
  {
    opcode: 'LES DI, EPTR',
    category: 'Data Copy / Transfer',
    desc: 'Loads a 32-bit far pointer from memory: 16-bit offset into DI, 16-bit segment into ES.',
    setupDesc: 'Initializes memory double-word EPTR with [5200H:1050H].',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x0000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x0000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const newRegs = { ...regs, DI: 0x1050, ES: 0x5200, IP: regs.IP + 4 };
      return {
        newRegs,
        newFlags: { ...flags },
        mathExplanation: 'LES loads destination register DI with offset 1050H, and Extra Segment register ES with segment 5200H from EPTR memory address. Flags are unaffected.'
      };
    }
  },
  {
    opcode: 'PUSH AX',
    category: 'Data Copy / Transfer',
    desc: 'Decrements SP by 2, and pushes the contents of register AX onto the Stack.',
    setupDesc: 'Initializes AX = 1234H, SP = FFFEH.',
    initialRegs: { AX: 0x1234, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const newRegs = { ...regs, SP: regs.SP - 2, IP: regs.IP + 1 };
      return {
        newRegs,
        newFlags: { ...flags },
        mathExplanation: 'SP is decremented from FFFEH to FFFCH. AX value 1234H is written to stack SS:FFFCH. Flags are unaffected.'
      };
    }
  },
  {
    opcode: 'POP DX',
    category: 'Data Copy / Transfer',
    desc: 'Pops a 16-bit word from stack into DX register, then increments SP by 2.',
    setupDesc: 'Initializes SP = FFFCH. Stack memory holds 5678H.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFC, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const newRegs = { ...regs, DX: 0x5678, SP: regs.SP + 2, IP: regs.IP + 1 };
      return {
        newRegs,
        newFlags: { ...flags },
        mathExplanation: 'POP reads 16-bit word (5678H) from stack at SS:FFFCH into DX, then increments SP to FFFEH. Flags are unaffected.'
      };
    }
  },

  // ================= CATEGORY: ARITHMETIC =================
  {
    opcode: 'ADD AL, BL',
    category: 'Arithmetic',
    desc: 'Adds 8-bit register BL to register AL using Register Addressing Mode, updating AL and setting status flags.',
    setupDesc: 'Initializes AL = FFH and BL = 01H to demonstrate 8-bit register-to-register addition with carry overflow (wrapping).',
    initialRegs: { AX: 0x00FF, BX: 0x0001, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const al = regs.AX & 0xFF;
      const bl = regs.BX & 0xFF;
      const sum = al + bl;
      const result = sum & 0xFF;
      const newAX = (regs.AX & 0xFF00) | result;
      const newRegs = { ...regs, AX: newAX, IP: regs.IP + 2 };
      const newFlags = {
        ZF: result === 0 ? 1 : 0,
        CF: sum > 0xFF ? 1 : 0,
        SF: (result & 0x80) ? 1 : 0,
        OF: ((al ^ sum) & (bl ^ sum) & 0x80) !== 0 ? 1 : 0,
        AF: ((al & 0x0F) + (bl & 0x0F)) > 0x0F ? 1 : 0,
        PF: 1
      };
      newFlags.PF = (result & 0xFF).toString(2).split('1').length % 2 === 1 ? 1 : 0;
      return {
        newRegs,
        newFlags,
        mathExplanation: `AL (${al.toString(16).toUpperCase().padStart(2, '0')}H = ${al}) + BL (${bl.toString(16).toUpperCase().padStart(2, '0')}H = ${bl}) = ${(sum).toString(16).toUpperCase()}H. Result ${result.toString(16).toUpperCase().padStart(2, '0')}H stored in AL.`
      };
    }
  },
  {
    opcode: 'ADD AX, 1234H',
    category: 'Arithmetic',
    desc: 'Adds immediate 16-bit word 1234H to register AX, updating AX and status flags.',
    setupDesc: 'Initializes AX = 1000H. Adds 1234H to yield 2234H.',
    initialRegs: { AX: 0x1000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const sum = regs.AX + 0x1234;
      const result = sum & 0xFFFF;
      const newRegs = { ...regs, AX: result, IP: regs.IP + 3 };
      const newFlags = {
        ZF: result === 0 ? 1 : 0,
        CF: sum > 0xFFFF ? 1 : 0,
        SF: (result & 0x8000) ? 1 : 0,
        OF: 0,
        AF: ((regs.AX & 0x0F) + 0x04) > 0x0F ? 1 : 0,
        PF: (result & 0xFF).toString(2).split('1').length % 2 === 1 ? 1 : 0
      };
      return {
        newRegs,
        newFlags,
        mathExplanation: 'AX (1000H) + 1234H = 2234H. Result is loaded into AX. Instruction length is 3 bytes (IP + 3).'
      };
    }
  },
  {
    opcode: 'ADC AX, BX',
    category: 'Arithmetic',
    desc: 'Adds BX and Carry Flag (CF) to AX register, updating AX and setting status flags.',
    setupDesc: 'Initializes AX = 00FFH, BX = 0001H, and CF = 1 to show multi-word precision carry propagation.',
    initialRegs: { AX: 0x00FF, BX: 0x0001, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 1, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const sum = regs.AX + regs.BX + 1;
      const result = sum & 0xFFFF;
      const newRegs = { ...regs, AX: result, IP: regs.IP + 2 };
      const newFlags = {
        ZF: result === 0 ? 1 : 0,
        CF: sum > 0xFFFF ? 1 : 0,
        SF: (result & 0x8000) ? 1 : 0,
        OF: 0,
        AF: 1, 
        PF: 1
      };
      newFlags.PF = (result & 0xFF).toString(2).split('1').length % 2 === 1 ? 1 : 0;
      return {
        newRegs,
        newFlags,
        mathExplanation: 'ADC adds AX + BX + Carry. AX (00FFH) + BX (0001H) + CF (1) = 0101H (257 decimal). Zero flag ZF = 0, Carry CF = 0 because result fits inside 16-bit word.'
      };
    }
  },
  {
    opcode: 'SUB AX, BX',
    category: 'Arithmetic',
    desc: 'Subtracts BX register value from AX, updating AX and setting status flags.',
    setupDesc: 'Initializes AX = 1000H, BX = 0200H.',
    initialRegs: { AX: 0x1000, BX: 0x0200, CX: 0x0005, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const result = (regs.AX - regs.BX) & 0xFFFF;
      const newRegs = { ...regs, AX: result, IP: regs.IP + 2 };
      const newFlags = {
        ZF: result === 0 ? 1 : 0,
        CF: regs.AX < regs.BX ? 1 : 0,
        SF: (result & 0x8000) ? 1 : 0,
        OF: 0,
        AF: 0,
        PF: 1
      };
      newFlags.PF = (result & 0xFF).toString(2).split('1').length % 2 === 1 ? 1 : 0;
      return {
        newRegs,
        newFlags,
        mathExplanation: '1000H - 0200H = 0E00H (3584 decimal). Result is non-zero (ZF=0). No borrow required (CF=0). SF=0.'
      };
    }
  },
  {
    opcode: 'SUB AL, 05H',
    category: 'Arithmetic',
    desc: 'Subtracts immediate byte 05H from AL register, updating AL and status flags.',
    setupDesc: 'Initializes AL = 10H (16 decimal). Result will be 0BH (11 decimal).',
    initialRegs: { AX: 0x0010, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const al = regs.AX & 0xFF;
      const result = (al - 0x05 + 0x100) & 0xFF;
      const newAX = (regs.AX & 0xFF00) | result;
      const newRegs = { ...regs, AX: newAX, IP: regs.IP + 2 };
      const newFlags = {
        ZF: result === 0 ? 1 : 0,
        CF: al < 0x05 ? 1 : 0,
        SF: (result & 0x80) ? 1 : 0,
        OF: 0,
        AF: (al & 0x0F) < 0x05 ? 1 : 0,
        PF: (result.toString(2).split('1').length - 1) % 2 === 0 ? 1 : 0
      };
      return {
        newRegs,
        newFlags,
        mathExplanation: 'AL (10H = 16) - 05H = 0BH (11 decimal). Result stored in AL. No borrow required (CF = 0).'
      };
    }
  },
  {
    opcode: 'SBB AX, BX',
    category: 'Arithmetic',
    desc: 'Subtracts BX and Carry (CF/Borrow) from AX, updating AX.',
    setupDesc: 'Initializes AX = 0010H, BX = 0005H, CF = 1.',
    initialRegs: { AX: 0x0010, BX: 0x0005, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 1, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const result = (regs.AX - regs.BX - 1) & 0xFFFF;
      const newRegs = { ...regs, AX: result, IP: regs.IP + 2 };
      const newFlags = {
        ZF: result === 0 ? 1 : 0,
        CF: regs.AX < (regs.BX + 1) ? 1 : 0,
        SF: (result & 0x8000) ? 1 : 0,
        OF: 0,
        AF: 0,
        PF: 1
      };
      newFlags.PF = (result & 0xFF).toString(2).split('1').length % 2 === 1 ? 1 : 0;
      return {
        newRegs,
        newFlags,
        mathExplanation: 'SBB computes AX - BX - CF. AX (0010H) - BX (0005H) - CF (1) = 000AH (10 decimal). Borrow CF is updated to 0, ZF = 0.'
      };
    }
  },
  {
    opcode: 'INC CX',
    category: 'Arithmetic',
    desc: 'Increments the CX register by 1. Affects status flags except Carry (CF).',
    setupDesc: 'Initializes CX = FFFFH to demonstrate register wrap-around. Carry flag CF is unaffected.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0xFFFF, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const result = (regs.CX + 1) & 0xFFFF;
      const newRegs = { ...regs, CX: result, IP: regs.IP + 1 };
      const newFlags = {
        ...flags,
        ZF: result === 0 ? 1 : 0,
        SF: (result & 0x8000) ? 1 : 0,
        OF: regs.CX === 0x7FFF ? 1 : 0,
        AF: (regs.CX & 0x0F) === 0x0F ? 1 : 0
      };
      return {
        newRegs,
        newFlags,
        mathExplanation: 'CX (FFFFH) is incremented by 1, wrapping around to 0000H. ZF is set to 1. Crucially, the Carry Flag (CF) is NOT affected by INC.'
      };
    }
  },
  {
    opcode: 'DEC CX',
    category: 'Arithmetic',
    desc: 'Decrements the CX register by 1. Affects status flags except Carry (CF).',
    setupDesc: 'Initializes CX = 0001H to demonstrate decrementing down to 0000H (setting ZF = 1). Carry flag CF is unaffected.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0001, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const result = (regs.CX - 1 + 0x10000) & 0xFFFF;
      const newRegs = { ...regs, CX: result, IP: regs.IP + 1 };
      const newFlags = {
        ...flags,
        ZF: result === 0 ? 1 : 0,
        SF: (result & 0x8000) ? 1 : 0,
        OF: regs.CX === 0x8000 ? 1 : 0,
        AF: (regs.CX & 0x0F) === 0x00 ? 1 : 0
      };
      return {
        newRegs,
        newFlags,
        mathExplanation: 'CX (0001H) is decremented by 1, resulting in 0000H. Zero flag (ZF) is set to 1. Crucially, the Carry Flag (CF) is NOT affected by DEC.'
      };
    }
  },
  {
    opcode: 'NEG AX',
    category: 'Arithmetic',
    desc: 'Performs 2\'s complement negation of 16-bit register AX: AX = 0 - AX.',
    setupDesc: 'Initializes AX = 0005H (+5 decimal) to demonstrate conversion to FFFBH (-5 in 2\'s complement).',
    initialRegs: { AX: 0x0005, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const val = regs.AX;
      const result = (-val + 0x10000) & 0xFFFF;
      const newRegs = { ...regs, AX: result, IP: regs.IP + 2 };
      const newFlags = {
        ...flags,
        ZF: result === 0 ? 1 : 0,
        CF: val !== 0 ? 1 : 0,
        SF: (result & 0x8000) ? 1 : 0,
        OF: val === 0x8000 ? 1 : 0
      };
      return {
        newRegs,
        newFlags,
        mathExplanation: 'NEG AX computes 2\'s complement of 0005H (+5), yielding FFFBH (-5 decimal). Carry Flag (CF) is set to 1 since operand is non-zero. Sign flag SF = 1.'
      };
    }
  },
  {
    opcode: 'CMP AX, BX',
    category: 'Arithmetic',
    desc: 'Compares AX and BX by performing AX - BX, but does NOT save the subtraction result.',
    setupDesc: 'Initializes AX = 0500H and BX = 0500H to simulate an exact match comparison.',
    initialRegs: { AX: 0x0500, BX: 0x0500, CX: 0x0005, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const result = (regs.AX - regs.BX) & 0xFFFF;
      const newFlags = {
        ZF: result === 0 ? 1 : 0,
        CF: regs.AX < regs.BX ? 1 : 0,
        SF: (result & 0x8000) ? 1 : 0,
        OF: 0,
        AF: 0,
        PF: 1
      };
      return {
        newRegs: { ...regs, IP: regs.IP + 2 },
        newFlags,
        mathExplanation: 'CMP subtracts internally: AX (0500H) - BX (0500H) = 0000H. ZF becomes 1 (exact match). The registers themselves remain completely unchanged.'
      };
    }
  },
  {
    opcode: 'MUL BH',
    category: 'Arithmetic',
    desc: 'Performs 8-bit unsigned multiplication: AX = AL * BH.',
    setupDesc: 'Initializes AL = 05H and BH = 10H (16 in decimal) to perform 8-bit unsigned multiplication.',
    initialRegs: { AX: 0x0005, BX: 0x1000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const al = regs.AX & 0xFF;
      const bh = (regs.BX & 0xFF00) >> 8;
      const product = al * bh;
      const newRegs = { ...regs, AX: product, IP: regs.IP + 2 };
      const ah = (product & 0xFF00) >> 8;
      const cf_of = ah !== 0 ? 1 : 0;
      const newFlags = {
        ...flags,
        CF: cf_of,
        OF: cf_of,
        ZF: product === 0 ? 1 : 0
      };
      return {
        newRegs,
        newFlags,
        mathExplanation: 'AL (05H = 5) * BH (10H = 16) = 0050H (80 decimal) loaded into AX. Upper byte AH is 00H, so CF and OF are cleared.'
      };
    }
  },
  {
    opcode: 'MUL CX',
    category: 'Arithmetic',
    desc: 'Performs 16-bit unsigned multiplication: DX:AX = AX * CX.',
    setupDesc: 'Initializes AX = 1000H and CX = 0020H to perform 16-bit word multiplication.',
    initialRegs: { AX: 0x1000, BX: 0x0000, CX: 0x0020, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const product = regs.AX * regs.CX;
      const lowWord = product & 0xFFFF;
      const highWord = (Math.floor(product / 0x10000)) & 0xFFFF;
      const newRegs = { ...regs, AX: lowWord, DX: highWord, IP: regs.IP + 2 };
      const cf_of = highWord !== 0 ? 1 : 0;
      return {
        newRegs,
        newFlags: { ...flags, CF: cf_of, OF: cf_of, ZF: product === 0 ? 1 : 0 },
        mathExplanation: 'MUL CX computes AX (1000H) × CX (0020H) = 00020000H (131072 decimal). Result placed in register pair DX:AX (DX = 0002H, AX = 0000H). Since DX ≠ 0, CF and OF are set to 1.'
      };
    }
  },
  {
    opcode: 'IMUL BL',
    category: 'Arithmetic',
    desc: 'Performs 8-bit signed (2\'s complement) multiplication: AX = AL * BL.',
    setupDesc: 'Initializes AL = FFH (-1 in 2\'s complement) and BL = 05H (+5 decimal) to demonstrate signed multiplication.',
    initialRegs: { AX: 0x00FF, BX: 0x0005, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const alSigned = (regs.AX & 0xFF) > 127 ? (regs.AX & 0xFF) - 256 : (regs.AX & 0xFF);
      const blSigned = (regs.BX & 0xFF) > 127 ? (regs.BX & 0xFF) - 256 : (regs.BX & 0xFF);
      const prodSigned = alSigned * blSigned;
      const prod16 = prodSigned & 0xFFFF;
      const newRegs = { ...regs, AX: prod16, IP: regs.IP + 2 };
      const ah = (prod16 & 0xFF00) >> 8;
      const signExtAh = (prod16 & 0x80) ? 0xFF : 0x00;
      const cf_of = ah !== signExtAh ? 1 : 0;
      return {
        newRegs,
        newFlags: { ...flags, CF: cf_of, OF: cf_of, SF: (prod16 & 0x8000) ? 1 : 0, ZF: prod16 === 0 ? 1 : 0 },
        mathExplanation: 'IMUL BL multiplies signed AL (FFH = -1) by signed BL (05H = +5) = FFFBH (-5 decimal) in AX. Sign is preserved algebraically (-1 × +5 = -5).'
      };
    }
  },
  {
    opcode: 'IMUL CX',
    category: 'Arithmetic',
    desc: 'Performs 16-bit signed (2\'s complement) multiplication: DX:AX = AX * CX.',
    setupDesc: 'Initializes AX = FFFFH (-1 in 2\'s complement) and CX = 0005H (+5 decimal).',
    initialRegs: { AX: 0xFFFF, BX: 0x0000, CX: 0x0005, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const axSigned = regs.AX > 32767 ? regs.AX - 65536 : regs.AX;
      const cxSigned = regs.CX > 32767 ? regs.CX - 65536 : regs.CX;
      const prodSigned = axSigned * cxSigned;
      const prod32 = (prodSigned < 0 ? prodSigned + 0x100000000 : prodSigned);
      const lowWord = prod32 & 0xFFFF;
      const highWord = (Math.floor(prod32 / 0x10000)) & 0xFFFF;
      const newRegs = { ...regs, AX: lowWord, DX: highWord, IP: regs.IP + 2 };
      const signExt = (lowWord & 0x8000) ? 0xFFFF : 0x0000;
      const cf_of = highWord !== signExt ? 1 : 0;
      return {
        newRegs,
        newFlags: { ...flags, CF: cf_of, OF: cf_of, SF: (highWord & 0x8000) ? 1 : 0, ZF: prodSigned === 0 ? 1 : 0 },
        mathExplanation: 'IMUL CX multiplies signed AX (FFFFH = -1) by CX (0005H = +5) = -5 decimal (DX = FFFFH, AX = FFFBH). DX is sign extension of AX, so CF and OF are 0.'
      };
    }
  },
  {
    opcode: 'DIV BL',
    category: 'Arithmetic',
    desc: 'Performs 8-bit unsigned division: AX divided by BL. Quotient in AL, Remainder in AH.',
    setupDesc: 'Initializes AX = 0019H (25 in decimal) and BL = 05H to perform 8-bit unsigned division.',
    initialRegs: { AX: 0x0019, BX: 0x0005, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const ax = regs.AX;
      const bl = regs.BX & 0xFF;
      const quotient = Math.floor(ax / bl) & 0xFF;
      const remainder = (ax % bl) & 0xFF;
      const newAX = (remainder << 8) | quotient;
      const newRegs = { ...regs, AX: newAX, IP: regs.IP + 2 };
      return {
        newRegs,
        newFlags: { ...flags },
        mathExplanation: 'DIV BL divides AX (25) by BL (5). Quotient = 5 in AL, Remainder = 0 in AH. AX becomes 0005H. Status flags are technically undefined after execution.'
      };
    }
  },
  {
    opcode: 'DIV CX',
    category: 'Arithmetic',
    desc: 'Performs 16-bit unsigned division: 32-bit DX:AX divided by CX. Quotient in AX, Remainder in DX.',
    setupDesc: 'Initializes DX:AX = 00010000H (65536 decimal) and CX = 0010H (16 decimal).',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0010, DX: 0x0001, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const dividend = (regs.DX * 0x10000) + regs.AX;
      const divisor = regs.CX;
      const quotient = Math.floor(dividend / divisor) & 0xFFFF;
      const remainder = (dividend % divisor) & 0xFFFF;
      const newRegs = { ...regs, AX: quotient, DX: remainder, IP: regs.IP + 2 };
      return {
        newRegs,
        newFlags: { ...flags },
        mathExplanation: 'DIV CX divides 32-bit dividend DX:AX (65536) by 16-bit divisor CX (16). Quotient = 4096 (1000H in AX), Remainder = 0 (0000H in DX).'
      };
    }
  },
  {
    opcode: 'IDIV BL',
    category: 'Arithmetic',
    desc: 'Performs 8-bit signed (2\'s complement) division: AX divided by BL. Quotient in AL, Remainder in AH.',
    setupDesc: 'Initializes AX = FFFBH (-5 decimal) and BL = 02H (+2 decimal) to demonstrate signed division.',
    initialRegs: { AX: 0xFFFB, BX: 0x0002, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const axSigned = regs.AX > 32767 ? regs.AX - 65536 : regs.AX;
      const blSigned = (regs.BX & 0xFF) > 127 ? (regs.BX & 0xFF) - 256 : (regs.BX & 0xFF);
      const qSigned = Math.trunc(axSigned / blSigned);
      const rSigned = axSigned % blSigned;
      const qByte = qSigned & 0xFF;
      const rByte = rSigned & 0xFF;
      const newAX = (rByte << 8) | qByte;
      const newRegs = { ...regs, AX: newAX, IP: regs.IP + 2 };
      return {
        newRegs,
        newFlags: { ...flags },
        mathExplanation: 'IDIV BL divides signed AX (FFFBH = -5) by BL (02H = +2). Quotient = -2 (FEH in AL), Remainder = -1 (FFH in AH). Result AX = FFFEH.'
      };
    }
  },
  {
    opcode: 'IDIV CX',
    category: 'Arithmetic',
    desc: 'Performs 16-bit signed division: 32-bit signed dividend in DX:AX divided by CX. Quotient in AX, Remainder in DX.',
    setupDesc: 'Initializes DX:AX = FFFFFFE8H (-24 decimal) and CX = 0005H (+5 decimal).',
    initialRegs: { AX: 0xFFE8, BX: 0x0000, CX: 0x0005, DX: 0xFFFF, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const div32 = (regs.DX << 16) | regs.AX;
      const dividendSigned = div32 > 0x7FFFFFFF ? div32 - 0x100000000 : div32;
      const divisorSigned = regs.CX > 32767 ? regs.CX - 65536 : regs.CX;
      const qSigned = Math.trunc(dividendSigned / divisorSigned);
      const rSigned = dividendSigned % divisorSigned;
      const qWord = (qSigned + 0x10000) & 0xFFFF;
      const rWord = (rSigned + 0x10000) & 0xFFFF;
      const newRegs = { ...regs, AX: qWord, DX: rWord, IP: regs.IP + 2 };
      return {
        newRegs,
        newFlags: { ...flags },
        mathExplanation: 'IDIV CX divides signed 32-bit DX:AX (-24) by CX (+5). Quotient = -4 (FFFCH in AX), Remainder = -4 (FFFCH in DX).'
      };
    }
  },
  {
    opcode: 'CBW',
    category: 'Arithmetic',
    desc: 'Convert Byte to Word: Sign-extends AL into AX (copies MSB/sign bit of AL into AH).',
    setupDesc: 'Initializes AL = 80H (-128 decimal, MSB = 1). CBW fills AH with FFH so AX becomes FF80H.',
    initialRegs: { AX: 0x0080, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const al = regs.AX & 0xFF;
      const ah = (al & 0x80) ? 0xFF : 0x00;
      const newAX = (ah << 8) | al;
      const newRegs = { ...regs, AX: newAX, IP: regs.IP + 1 };
      return {
        newRegs,
        newFlags: { ...flags },
        mathExplanation: 'CBW checks sign bit of AL (80H -> bit 7 = 1). Extends sign bit into AH (FFH). AX becomes FF80H (-128 in 16-bit word). Flags are unaffected.'
      };
    }
  },
  {
    opcode: 'CWD',
    category: 'Arithmetic',
    desc: 'Convert Word to Doubleword: Sign-extends AX into DX:AX (copies MSB/sign bit of AX into DX).',
    setupDesc: 'Initializes AX = FFF0H (-16 decimal, MSB = 1). CWD fills DX with FFFFH before 16-bit IDIV.',
    initialRegs: { AX: 0xFFF0, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const signBit = (regs.AX & 0x8000) ? 0xFFFF : 0x0000;
      const newRegs = { ...regs, DX: signBit, IP: regs.IP + 1 };
      return {
        newRegs,
        newFlags: { ...flags },
        mathExplanation: 'CWD checks sign bit of AX (FFF0H -> bit 15 = 1). Sign-extends AX into DX = FFFFH. Prepares DX:AX = FFFFFFF0H (-16 in 32-bit doubleword) for IDIV. Flags are unaffected.'
      };
    }
  },

  // ================= CATEGORY: BCD & ASCII ADJUST =================
  {
    opcode: 'DAA',
    category: 'BCD & ASCII',
    desc: 'Decimal Adjust after Addition. Adjusts AL to be a valid packed BCD number.',
    setupDesc: 'Initializes AL = 8EH (from adding packed BCDs 59 and 35: 59H + 35H = 8EH). AF and CF are 0.',
    initialRegs: { AX: 0x008E, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const result = 0x94;
      const newAX = (regs.AX & 0xFF00) | result;
      const newFlags = {
        ...flags,
        CF: 0,
        ZF: 0,
        SF: 0,
        AF: 1
      };
      return {
        newRegs: { ...regs, AX: newAX, IP: regs.IP + 1 },
        newFlags,
        mathExplanation: 'DAA inspects AL (8EH). The lower nibble (EH) is > 9, so DAA adds 06H: 8EH + 06H = 94H. The final packed BCD sum is 94H. AF is set to 1.'
      };
    }
  },
  {
    opcode: 'DAS',
    category: 'BCD & ASCII',
    desc: 'Decimal Adjust after Subtraction. Adjusts AL to be a valid packed BCD number.',
    setupDesc: 'Initializes AL = D7H (subtracting packed BCDs: 49 BCD - 72 BCD yields D7H). CF is 0.',
    initialRegs: { AX: 0x00D7, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const result = 0x77;
      const newAX = (regs.AX & 0xFF00) | result;
      const newFlags = {
        ...flags,
        CF: 1,
        ZF: 0,
        SF: 0,
        AF: 0
      };
      return {
        newRegs: { ...regs, AX: newAX, IP: regs.IP + 1 },
        newFlags,
        mathExplanation: 'DAS inspects AL (D7H). Upper nibble (DH) is > 9, so DAS subtracts 60H: D7H - 60H = 77H, setting Carry Flag (CF = 1) for BCD borrow. Result is 77H.'
      };
    }
  },
  {
    opcode: 'AAA',
    category: 'BCD & ASCII',
    desc: 'ASCII Adjust after Addition. Adjusts AL after adding ASCII digits (\'5\' + \'9\' = 6EH) into unpacked decimal digits in AH:AL.',
    setupDesc: 'Initializes AX = 006EH (from ADD AL, 39H where AL was 35H \'5\' + 39H \'9\' = 6EH). Lower nibble EH > 9.',
    initialRegs: { AX: 0x006E, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      // AL = 6EH. Lower nibble = 0x0E > 9.
      // AAA adds 6 to AL (6EH + 06H = 74H -> lower nibble 04H), increments AH by 1 (AH=01H), clears upper nibble of AL. AX becomes 0104H.
      const newAX = 0x0104;
      return {
        newRegs: { ...regs, AX: newAX, IP: regs.IP + 1 },
        newFlags: { ...flags, AF: 1, CF: 1 },
        mathExplanation: 'AAA inspects AL (6EH). Lower nibble (0EH) > 9. AAA adds 6 to AL, increments AH by 1 (00H → 01H), and clears upper nibble of AL to 0. AX becomes 0104H (decimal 14), with AF=1 and CF=1.'
      };
    }
  },
  {
    opcode: 'AAS',
    category: 'BCD & ASCII',
    desc: 'ASCII Adjust after Subtraction. Adjusts AL after subtracting ASCII digits (\'3\' - \'8\' = FBH) into unpacked decimal digit with borrow in AH.',
    setupDesc: 'Initializes AX = 00FBH (from SUB AL, 38H where AL was 33H \'3\' - 38H \'8\' = FBH). Lower nibble BH > 9.',
    initialRegs: { AX: 0x00FB, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      // AL = FBH. Lower nibble = 0x0B > 9.
      // AAS subtracts 6 from AL (FBH - 06H = F5H -> lower nibble 05H), decrements AH by 1 (AH becomes FFH), clears upper nibble of AL. AX becomes FF05H.
      const newAX = 0xFF05;
      return {
        newRegs: { ...regs, AX: newAX, IP: regs.IP + 1 },
        newFlags: { ...flags, AF: 1, CF: 1 },
        mathExplanation: 'AAS inspects AL (FBH). Lower nibble (0BH) > 9. AAS subtracts 6 from AL, decrements AH by 1 (00H → FFH borrow), and masks upper nibble of AL to 0. AX becomes FF05H (-1 in AH, digit 5 in AL), with AF=1 and CF=1.'
      };
    }
  },
  {
    opcode: 'AAM',
    category: 'BCD & ASCII',
    desc: 'ASCII Adjust after Multiplication. Converts a product in AL into two unpacked BCD digits in AH and AL.',
    setupDesc: 'Initializes AL = 2DH (45 decimal, which is 5 * 9). AAM will convert it to unpacked BCD.',
    initialRegs: { AX: 0x002D, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const al = regs.AX & 0xFF;
      const ah = Math.floor(al / 10);
      const newAl = al % 10;
      const newAX = (ah << 8) | newAl;
      const newFlags = {
        ...flags,
        ZF: newAl === 0 ? 1 : 0,
        SF: (ah & 0x80) ? 1 : 0
      };
      return {
        newRegs: { ...regs, AX: newAX, IP: regs.IP + 2 },
        newFlags,
        mathExplanation: 'AAM divides AL (45) by 10. Quotient (4) in AH, Remainder (5) in AL. AX becomes 0405H, representing unpacked BCD for 45.'
      };
    }
  },
  {
    opcode: 'AAD',
    category: 'BCD & ASCII',
    desc: 'ASCII Adjust before Division. Converts unpacked BCD in AH and AL to a single binary value in AL.',
    setupDesc: 'Initializes AH = 02H and AL = 05H (unpacked BCD representing 25).',
    initialRegs: { AX: 0x0205, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const ah = (regs.AX & 0xFF00) >> 8;
      const al = regs.AX & 0xFF;
      const binary = (ah * 10) + al;
      const newAX = binary & 0xFF; 
      const newFlags = {
        ...flags,
        ZF: newAX === 0 ? 1 : 0,
        SF: (newAX & 0x80) ? 1 : 0
      };
      return {
        newRegs: { ...regs, AX: newAX, IP: regs.IP + 2 },
        newFlags,
        mathExplanation: 'AAD multiplies AH (2) by 10 and adds AL (5), clearing AH to 00H. The AL register gets 25 (19H), preparing for division.'
      };
    }
  },

  // ================= CATEGORY: LOGICAL =================
  {
    opcode: 'XOR AX, AX',
    category: 'Logical',
    desc: 'Performs bitwise XOR of AX with itself, clearing AX to 0.',
    setupDesc: 'Initializes AX = FFFFH. Logical instructions always clear Carry (CF) and Overflow (OF).',
    initialRegs: { AX: 0xFFFF, BX: 0x0020, CX: 0x0005, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const newRegs = { ...regs, AX: 0, IP: regs.IP + 2 };
      const newFlags = {
        ZF: 1,
        CF: 0,
        SF: 0,
        OF: 0,
        AF: 0,
        PF: 1
      };
      return {
        newRegs,
        newFlags,
        mathExplanation: 'XORing AX with itself clears it to 0000H. Logical operations force CF=0 and OF=0. ZF is set to 1.'
      };
    }
  },
  {
    opcode: 'AND AL, 0FH',
    category: 'Logical',
    desc: 'Logical bitwise AND of AL with immediate constant 0FH to isolate the lower nibble.',
    setupDesc: 'Initializes AL = A5H. Logical operations clear CF and OF.',
    initialRegs: { AX: 0x00A5, BX: 0x0010, CX: 0x0005, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 1, SF: 0, OF: 1, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const al = regs.AX & 0xFF;
      const result = al & 0x0F;
      const newAX = (regs.AX & 0xFF00) | result;
      const newRegs = { ...regs, AX: newAX, IP: regs.IP + 2 };
      const newFlags = {
        ZF: result === 0 ? 1 : 0,
        CF: 0,
        SF: (result & 0x80) ? 1 : 0,
        OF: 0,
        AF: 0,
        PF: (result.toString(2).split('1').length - 1) % 2 === 0 ? 1 : 0
      };
      return {
        newRegs,
        newFlags,
        mathExplanation: 'A5H (10100101B) AND 0FH (00001111B) = 05H. Isolates the lower nibble. CF and OF are forced to 0.'
      };
    }
  },
  {
    opcode: 'OR AH, CL',
    category: 'Logical',
    desc: 'Performs logical bitwise OR between registers AH and CL, saving the result in AH.',
    setupDesc: 'Initializes AH = 50H and CL = 0FH.',
    initialRegs: { AX: 0x5000, BX: 0x0000, CX: 0x000F, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const ah = (regs.AX & 0xFF00) >> 8;
      const cl = regs.CX & 0xFF;
      const result = ah | cl;
      const newAX = (regs.AX & 0x00FF) | (result << 8);
      const newRegs = { ...regs, AX: newAX, IP: regs.IP + 2 };
      return {
        newRegs,
        newFlags: { ...flags, ZF: result === 0 ? 1 : 0, CF: 0, OF: 0, SF: (result & 0x80) ? 1 : 0 },
        mathExplanation: 'ORs AH (50H) with CL (0FH) yielding 5FH in AH. CF and OF are cleared. ZF = 0.'
      };
    }
  },
  {
    opcode: 'NOT BX',
    category: 'Logical',
    desc: 'Performs bit-by-bit complement (NOT) of register BX.',
    setupDesc: 'Initializes BX = 0000H. Crucially, the NOT instruction does NOT modify any flags!',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const result = (~regs.BX) & 0xFFFF;
      const newRegs = { ...regs, BX: result, IP: regs.IP + 2 };
      return {
        newRegs,
        newFlags: { ...flags },
        mathExplanation: 'NOT complements all bits of BX from 0000H to FFFFH. Note that in 8086, NOT does not affect any status flags.'
      };
    }
  },

  // ================= CATEGORY: LOGICAL =================
  {
    opcode: 'NEG BL',
    category: 'Logical',
    desc: 'Performs 2\'s complement negation of register BL.',
    setupDesc: 'Initializes BL = 02H. NEG updates all condition code flags (CF is set to 1 if source is non-zero).',
    initialRegs: { AX: 0x0000, BX: 0x0002, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const bl = regs.BX & 0xFF;
      const result = (-bl) & 0xFF;
      const newBX = (regs.BX & 0xFF00) | result;
      const newRegs = { ...regs, BX: newBX, IP: regs.IP + 2 };
      return {
        newRegs,
        newFlags: { ...flags, ZF: result === 0 ? 1 : 0, CF: bl !== 0 ? 1 : 0, SF: (result & 0x80) ? 1 : 0, OF: bl === 0x80 ? 1 : 0 },
        mathExplanation: 'NEG BL computes 2\'s complement of 02H, yielding FEH (-2 in decimal). CF is set to 1 because input is non-zero. SF=1.'
      };
    }
  },

  // ================= CATEGORY: SHIFT & ROTATE =================
  {
    opcode: 'SHL CX, 1',
    category: 'Shift & Rotate',
    desc: 'Shifts CX left by 1 bit position. Equivalent to multiplying CX by 2.',
    setupDesc: 'Initializes CX = 4000H to show a left shift where the sign bit changes.',
    initialRegs: { AX: 0x0012, BX: 0x0010, CX: 0x4000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const beforeVal = regs.CX;
      const result = (regs.CX << 1) & 0xFFFF;
      const carryOut = (beforeVal & 0x8000) ? 1 : 0;
      const beforeSign = (beforeVal & 0x8000) ? 1 : 0;
      const afterSign = (result & 0x8000) ? 1 : 0;
      return {
        newRegs: { ...regs, CX: result, IP: regs.IP + 2 },
        newFlags: { ...flags, ZF: result === 0 ? 1 : 0, CF: carryOut, SF: afterSign, OF: beforeSign !== afterSign ? 1 : 0, AF: 0, PF: 1 },
        mathExplanation: 'Shifts CX (4000H) left by 1, yielding 8000H. Sign bit changes, so Overflow OF=1. CF is 0.'
      };
    }
  },
  {
    opcode: 'SHR AX, 1',
    category: 'Shift & Rotate',
    desc: 'Shifts AX right by 1 bit position. Zeros fill MSB; LSB enters Carry Flag (CF).',
    setupDesc: 'Initializes AX = 0003H (0000 0000 0000 0011B) to demonstrate LSB shift into CF.',
    initialRegs: { AX: 0x0003, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const carryOut = regs.AX & 1;
      const result = (regs.AX >> 1) & 0xFFFF;
      return {
        newRegs: { ...regs, AX: result, IP: regs.IP + 2 },
        newFlags: { ...flags, ZF: result === 0 ? 1 : 0, CF: carryOut, SF: 0, OF: (regs.AX & 0x8000) ? 1 : 0 },
        mathExplanation: 'Shifts AX (0003H) right by 1, yielding 0001H. LSB (1) enters CF.'
      };
    }
  },
  {
    opcode: 'SAR AX, 1',
    category: 'Shift & Rotate',
    desc: 'Arithmetic Shift Right by 1: Preserves sign bit (MSB is replicated) while shifting right.',
    setupDesc: 'Initializes AX = 8004H (negative value) to show sign preservation.',
    initialRegs: { AX: 0x8004, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const carryOut = regs.AX & 1;
      const signBit = regs.AX & 0x8000;
      const result = ((regs.AX >> 1) | signBit) & 0xFFFF;
      return {
        newRegs: { ...regs, AX: result, IP: regs.IP + 2 },
        newFlags: { ...flags, ZF: result === 0 ? 1 : 0, CF: carryOut, SF: 1, OF: 0 },
        mathExplanation: 'SAR AX (8004H) by 1 yields C002H. Sign bit (1) is replicated; LSB (0) enters CF.'
      };
    }
  },
  {
    opcode: 'SAL AX, 1',
    category: 'Shift & Rotate',
    desc: 'Shift Arithmetic Left by 1: Identical operation to SHL (multiplies operand by 2).',
    setupDesc: 'Initializes AX = 0005H. Shifts left by 1.',
    initialRegs: { AX: 0x0005, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const result = (regs.AX << 1) & 0xFFFF;
      return {
        newRegs: { ...regs, AX: result, IP: regs.IP + 2 },
        newFlags: { ...flags, ZF: result === 0 ? 1 : 0, CF: 0, SF: 0, OF: 0 },
        mathExplanation: 'SAL AX (0005H) by 1 yields 000AH (10 decimal). CF=0.'
      };
    }
  },
  {
    opcode: 'ROL AL, 1',
    category: 'Shift & Rotate',
    desc: 'Rotate Left by 1: MSB rotates around into LSB position and is also copied into CF.',
    setupDesc: 'Initializes AL = 80H (10000000B). MSB bit (1) will rotate to LSB.',
    initialRegs: { AX: 0x0080, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const al = regs.AX & 0xFF;
      const msb = (al & 0x80) >> 7;
      const newAL = ((al << 1) | msb) & 0xFF;
      const newAX = (regs.AX & 0xFF00) | newAL;
      return {
        newRegs: { ...regs, AX: newAX, IP: regs.IP + 2 },
        newFlags: { ...flags, CF: msb },
        mathExplanation: 'ROL AL (80H) left by 1 yields 01H. The MSB (1) rotates into LSB position and sets CF=1.'
      };
    }
  },
  {
    opcode: 'ROR AL, 1',
    category: 'Shift & Rotate',
    desc: 'Rotate Right by 1: LSB rotates around into MSB position and is also copied into CF.',
    setupDesc: 'Initializes AL = 01H (00000001B). LSB bit (1) will rotate to MSB.',
    initialRegs: { AX: 0x0001, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const al = regs.AX & 0xFF;
      const lsb = al & 1;
      const newAL = ((al >> 1) | (lsb << 7)) & 0xFF;
      const newAX = (regs.AX & 0xFF00) | newAL;
      return {
        newRegs: { ...regs, AX: newAX, IP: regs.IP + 2 },
        newFlags: { ...flags, CF: lsb },
        mathExplanation: 'ROR AL (01H) right by 1 yields 80H. The LSB (1) rotates into MSB position and sets CF=1.'
      };
    }
  },
  {
    opcode: 'RCL AL, 1',
    category: 'Shift & Rotate',
    desc: 'Rotate Left through Carry by 1: CF rotates into LSB; MSB rotates into CF.',
    setupDesc: 'Initializes AL = 80H and CF = 1.',
    initialRegs: { AX: 0x0080, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 1, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const al = regs.AX & 0xFF;
      const msb = (al & 0x80) >> 7;
      const newAL = ((al << 1) | flags.CF) & 0xFF;
      const newAX = (regs.AX & 0xFF00) | newAL;
      return {
        newRegs: { ...regs, AX: newAX, IP: regs.IP + 2 },
        newFlags: { ...flags, CF: msb },
        mathExplanation: 'RCL AL (80H with CF=1) yields 01H and sets CF = 1 (former MSB).'
      };
    }
  },
  {
    opcode: 'RCR AL, 1',
    category: 'Shift & Rotate',
    desc: 'Rotate Right through Carry by 1: CF rotates into MSB; LSB rotates into CF.',
    setupDesc: 'Initializes AL = 01H and CF = 1.',
    initialRegs: { AX: 0x0001, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 1, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const al = regs.AX & 0xFF;
      const lsb = al & 1;
      const newAL = ((al >> 1) | (flags.CF << 7)) & 0xFF;
      const newAX = (regs.AX & 0xFF00) | newAL;
      return {
        newRegs: { ...regs, AX: newAX, IP: regs.IP + 2 },
        newFlags: { ...flags, CF: lsb },
        mathExplanation: 'RCR AL (01H with CF=1) yields 80H and sets CF = 1 (former LSB).'
      };
    }
  },

  // ================= CATEGORY: BRANCH =================
  {
    opcode: 'JMP 0150H',
    category: 'Branch',
    desc: 'Unconditional Jump: Loads Instruction Pointer (IP) directly with target address 0150H.',
    setupDesc: 'Initializes IP = 0100H. Unconditional branching bypasses sequential execution.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      return {
        newRegs: { ...regs, IP: 0x0150 },
        newFlags: { ...flags },
        mathExplanation: 'JMP 0150H sets IP directly to target address 0150H. Flags are unaffected.'
      };
    }
  },
  {
    opcode: 'JA 0150H',
    category: 'Branch',
    desc: 'Jump if Above (CF=0 and ZF=0): Jumps to 0150H if unsigned destination > source.',
    setupDesc: 'Initializes CF = 0, ZF = 0. Condition satisfied.',
    initialRegs: { AX: 0x0005, BX: 0x0002, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const takeJump = flags.CF === 0 && flags.ZF === 0;
      return {
        newRegs: { ...regs, IP: takeJump ? 0x0150 : regs.IP + 2 },
        newFlags: { ...flags },
        mathExplanation: `JA condition (CF=0, ZF=0) is true. Branch taken to 0150H.`
      };
    }
  },
  {
    opcode: 'JAE 0150H',
    category: 'Branch',
    desc: 'Jump if Above or Equal (CF=0): Jumps to 0150H if unsigned destination ≥ source.',
    setupDesc: 'Initializes CF = 0. Condition satisfied.',
    initialRegs: { AX: 0x0005, BX: 0x0005, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 1, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const takeJump = flags.CF === 0;
      return {
        newRegs: { ...regs, IP: takeJump ? 0x0150 : regs.IP + 2 },
        newFlags: { ...flags },
        mathExplanation: `JAE condition (CF=0) is true. Branch taken to 0150H.`
      };
    }
  },
  {
    opcode: 'JB 0150H',
    category: 'Branch',
    desc: 'Jump if Below (CF=1): Jumps to 0150H if unsigned destination < source.',
    setupDesc: 'Initializes CF = 1.',
    initialRegs: { AX: 0x0002, BX: 0x0005, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 1, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const takeJump = flags.CF === 1;
      return {
        newRegs: { ...regs, IP: takeJump ? 0x0150 : regs.IP + 2 },
        newFlags: { ...flags },
        mathExplanation: `JB condition (CF=1) is true. Branch taken to 0150H.`
      };
    }
  },
  {
    opcode: 'JBE 0150H',
    category: 'Branch',
    desc: 'Jump if Below or Equal (CF=1 or ZF=1): Jumps to 0150H if unsigned destination ≤ source.',
    setupDesc: 'Initializes ZF = 1.',
    initialRegs: { AX: 0x0005, BX: 0x0005, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 1, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const takeJump = flags.CF === 1 || flags.ZF === 1;
      return {
        newRegs: { ...regs, IP: takeJump ? 0x0150 : regs.IP + 2 },
        newFlags: { ...flags },
        mathExplanation: `JBE condition (ZF=1) is true. Branch taken to 0150H.`
      };
    }
  },
  {
    opcode: 'JE 0150H',
    category: 'Branch',
    desc: 'Jump if Equal / Zero (ZF=1): Jumps to target 0150H if operands were equal.',
    setupDesc: 'Initializes ZF = 1.',
    initialRegs: { AX: 0x0005, BX: 0x0005, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 1, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const takeJump = flags.ZF === 1;
      return {
        newRegs: { ...regs, IP: takeJump ? 0x0150 : regs.IP + 2 },
        newFlags: { ...flags },
        mathExplanation: `JE condition (ZF=1) is true. Branch taken to 0150H.`
      };
    }
  },
  {
    opcode: 'JNE 0150H',
    category: 'Branch',
    desc: 'Jump if Not Equal / Not Zero (ZF=0): Jumps to target 0150H if operands differed.',
    setupDesc: 'Initializes ZF = 0.',
    initialRegs: { AX: 0x0005, BX: 0x0002, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const takeJump = flags.ZF === 0;
      return {
        newRegs: { ...regs, IP: takeJump ? 0x0150 : regs.IP + 2 },
        newFlags: { ...flags },
        mathExplanation: `JNE condition (ZF=0) is true. Branch taken to 0150H.`
      };
    }
  },
  {
    opcode: 'JG 0150H',
    category: 'Branch',
    desc: 'Jump if Greater (ZF=0 and SF=OF): Jumps if signed destination > source.',
    setupDesc: 'Initializes ZF = 0, SF = 0, OF = 0.',
    initialRegs: { AX: 0x000A, BX: 0x0002, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const takeJump = flags.ZF === 0 && flags.SF === flags.OF;
      return {
        newRegs: { ...regs, IP: takeJump ? 0x0150 : regs.IP + 2 },
        newFlags: { ...flags },
        mathExplanation: `JG condition (ZF=0 and SF=OF) is true. Branch taken to 0150H.`
      };
    }
  },
  {
    opcode: 'JGE 0150H',
    category: 'Branch',
    desc: 'Jump if Greater or Equal (SF=OF): Jumps if signed destination ≥ source.',
    setupDesc: 'Initializes SF = 0, OF = 0.',
    initialRegs: { AX: 0x0005, BX: 0x0005, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 1, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const takeJump = flags.SF === flags.OF;
      return {
        newRegs: { ...regs, IP: takeJump ? 0x0150 : regs.IP + 2 },
        newFlags: { ...flags },
        mathExplanation: `JGE condition (SF=OF) is true. Branch taken to 0150H.`
      };
    }
  },
  {
    opcode: 'JL 0150H',
    category: 'Branch',
    desc: 'Jump if Less (SF ≠ OF): Jumps if signed destination < source.',
    setupDesc: 'Initializes SF = 1, OF = 0.',
    initialRegs: { AX: 0xFFFE, BX: 0x0005, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 1, SF: 1, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const takeJump = flags.SF !== flags.OF;
      return {
        newRegs: { ...regs, IP: takeJump ? 0x0150 : regs.IP + 2 },
        newFlags: { ...flags },
        mathExplanation: `JL condition (SF ≠ OF) is true. Branch taken to 0150H.`
      };
    }
  },
  {
    opcode: 'JLE 0150H',
    category: 'Branch',
    desc: 'Jump if Less or Equal (ZF=1 or SF ≠ OF): Jumps if signed destination ≤ source.',
    setupDesc: 'Initializes ZF = 1.',
    initialRegs: { AX: 0x0005, BX: 0x0005, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 1, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const takeJump = flags.ZF === 1 || flags.SF !== flags.OF;
      return {
        newRegs: { ...regs, IP: takeJump ? 0x0150 : regs.IP + 2 },
        newFlags: { ...flags },
        mathExplanation: `JLE condition (ZF=1) is true. Branch taken to 0150H.`
      };
    }
  },
  {
    opcode: 'JC 0150H',
    category: 'Branch',
    desc: 'Jump if Carry (CF=1): Jumps to 0150H if Carry Flag is set.',
    setupDesc: 'Initializes CF = 1.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 1, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const takeJump = flags.CF === 1;
      return {
        newRegs: { ...regs, IP: takeJump ? 0x0150 : regs.IP + 2 },
        newFlags: { ...flags },
        mathExplanation: `JC condition (CF=1) is true. Branch taken to 0150H.`
      };
    }
  },
  {
    opcode: 'JO 0150H',
    category: 'Branch',
    desc: 'Jump if Overflow (OF=1): Jumps to 0150H if Overflow Flag is set.',
    setupDesc: 'Initializes OF = 1.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 1, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const takeJump = flags.OF === 1;
      return {
        newRegs: { ...regs, IP: takeJump ? 0x0150 : regs.IP + 2 },
        newFlags: { ...flags },
        mathExplanation: `JO condition (OF=1) is true. Branch taken to 0150H.`
      };
    }
  },
  {
    opcode: 'JS 0150H',
    category: 'Branch',
    desc: 'Jump if Sign (SF=1): Jumps to 0150H if result was negative (SF=1).',
    setupDesc: 'Initializes SF = 1.',
    initialRegs: { AX: 0x8000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 1, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const takeJump = flags.SF === 1;
      return {
        newRegs: { ...regs, IP: takeJump ? 0x0150 : regs.IP + 2 },
        newFlags: { ...flags },
        mathExplanation: `JS condition (SF=1) is true. Branch taken to 0150H.`
      };
    }
  },
  {
    opcode: 'JNP 0150H',
    category: 'Branch',
    desc: 'Jump if No Parity / Parity Odd (PF=0): Jumps to 0150H if Parity Flag is 0.',
    setupDesc: 'Initializes PF = 0.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const takeJump = flags.PF === 0;
      return {
        newRegs: { ...regs, IP: takeJump ? 0x0150 : regs.IP + 2 },
        newFlags: { ...flags },
        mathExplanation: `JNP condition (PF=0) is true. Branch taken to 0150H.`
      };
    }
  },
  {
    opcode: 'JP 0150H',
    category: 'Branch',
    desc: 'Jump if Parity Even (PF=1): Jumps to 0150H if Parity Flag is 1.',
    setupDesc: 'Initializes PF = 1.',
    initialRegs: { AX: 0x0003, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 1 },
    execute: (regs, flags) => {
      const takeJump = flags.PF === 1;
      return {
        newRegs: { ...regs, IP: takeJump ? 0x0150 : regs.IP + 2 },
        newFlags: { ...flags },
        mathExplanation: `JP condition (PF=1) is true. Branch taken to 0150H.`
      };
    }
  },

  // ================= CATEGORY: LOOP =================
  {
    opcode: 'LOOP 0100H',
    category: 'Loop',
    desc: 'Loop according to CX: Decrements CX by 1; if CX ≠ 0, jumps to target address 0100H.',
    setupDesc: 'Initializes CX = 0005H and IP = 010CH.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0005, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x010C },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const newCX = (regs.CX - 1) & 0xFFFF;
      const targetIP = newCX !== 0 ? 0x0100 : regs.IP + 2;
      return {
        newRegs: { ...regs, CX: newCX, IP: targetIP },
        newFlags: { ...flags },
        mathExplanation: `LOOP decrements CX (${regs.CX.toString(16).toUpperCase().padStart(4, '0')}H → ${newCX.toString(16).toUpperCase().padStart(4, '0')}H). Since CX ≠ 0, jumps to 0100H.`
      };
    }
  },
  {
    opcode: 'LOOPE 0100H',
    category: 'Loop',
    desc: 'Loop while Equal / Zero: Decrements CX by 1; if CX ≠ 0 AND ZF = 1, jumps to target address 0100H.',
    setupDesc: 'Initializes CX = 0003H, ZF = 1, IP = 010CH.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0003, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x010C },
    initialFlags: { ZF: 1, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const newCX = (regs.CX - 1) & 0xFFFF;
      const takeJump = newCX !== 0 && flags.ZF === 1;
      const targetIP = takeJump ? 0x0100 : regs.IP + 2;
      return {
        newRegs: { ...regs, CX: newCX, IP: targetIP },
        newFlags: { ...flags },
        mathExplanation: `LOOPE/LOOPZ decrements CX to ${newCX.toString(16).toUpperCase().padStart(4, '0')}H. Since CX ≠ 0 and ZF = 1, jump taken to 0100H.`
      };
    }
  },
  {
    opcode: 'LOOPNE 0100H',
    category: 'Loop',
    desc: 'Loop while Not Equal / Not Zero: Decrements CX by 1; if CX ≠ 0 AND ZF = 0, jumps to target address 0100H.',
    setupDesc: 'Initializes CX = 0004H, ZF = 0, IP = 010CH.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0004, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x010C },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const newCX = (regs.CX - 1) & 0xFFFF;
      const takeJump = newCX !== 0 && flags.ZF === 0;
      const targetIP = takeJump ? 0x0100 : regs.IP + 2;
      return {
        newRegs: { ...regs, CX: newCX, IP: targetIP },
        newFlags: { ...flags },
        mathExplanation: `LOOPNE/LOOPNZ decrements CX to ${newCX.toString(16).toUpperCase().padStart(4, '0')}H. Since CX ≠ 0 and ZF = 0, jump taken to 0100H.`
      };
    }
  },
  {
    opcode: 'JCXZ 0150H',
    category: 'Loop',
    desc: 'Jump if CX is Zero: Jumps to target address 0150H if register CX = 0000H without modifying CX.',
    setupDesc: 'Initializes CX = 0000H. Condition CX = 0 satisfied.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const takeJump = regs.CX === 0;
      const targetIP = takeJump ? 0x0150 : regs.IP + 2;
      return {
        newRegs: { ...regs, IP: targetIP },
        newFlags: { ...flags },
        mathExplanation: `JCXZ checks CX (0000H). Since CX = 0, jump taken to 0150H without altering registers.`
      };
    }
  },
  {
    opcode: 'CALL 0200H',
    category: 'Branch',
    desc: 'Call Procedure: Pushes current IP onto stack and transfers control to target address 0200H.',
    setupDesc: 'Initializes SP = FFFE3H, IP = 0100H. Pushes return address (0103H) onto stack.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      return {
        newRegs: { ...regs, SP: regs.SP - 2, IP: 0x0200 },
        newFlags: { ...flags },
        mathExplanation: 'CALL 0200H pushes return IP (0103H) onto stack (SP: FFFEH → FFFCH) and sets IP = 0200H.'
      };
    }
  },
  {
    opcode: 'RET',
    category: 'Branch',
    desc: 'Return from Procedure: Pops return address from stack into IP to resume caller flow.',
    setupDesc: 'Initializes SP = FFFCH (pointing to top of stack containing return address 0103H).',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFC, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0208 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      return {
        newRegs: { ...regs, SP: regs.SP + 2, IP: 0x0103 },
        newFlags: { ...flags },
        mathExplanation: 'RET pops return IP (0103H) from stack (SP: FFFCH → FFFEH) and jumps to 0103H.'
      };
    }
  },

  // ================= CATEGORY: MACHINE CONTROL =================
  {
    opcode: 'LOCK XCHG [SI], AL',
    category: 'Machine Control',
    desc: 'Asserts the bus LOCK prefix before performing an exchange with shared memory.',
    setupDesc: 'Initializes AL = 01H (semaphore token). SI holds resource offset.',
    initialRegs: { AX: 0x0001, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const newAX = (regs.AX & 0xFF00) | 0x00; 
      return {
        newRegs: { ...regs, AX: newAX, IP: regs.IP + 3 },
        newFlags: { ...flags },
        mathExplanation: 'LOCK prefix asserts bus LOCK signal, ensuring atomic execution of XCHG. AL becomes 00H, successfully acquiring semaphore.'
      };
    }
  },
  {
    opcode: 'HLT',
    category: 'Machine Control',
    desc: 'Halt Processor: Enters halt state until an external interrupt or system reset occurs.',
    setupDesc: 'Initializes processor state. Execution halts instruction fetching.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      return {
        newRegs: { ...regs, IP: regs.IP + 1 },
        newFlags: { ...flags },
        mathExplanation: 'HLT halts the CPU. Execution stops until hardware interrupt or reset is received.'
      };
    }
  },
  {
    opcode: 'NOP',
    category: 'Machine Control',
    desc: 'No Operation: Performs no state change except advancing Instruction Pointer (IP) by 1.',
    setupDesc: 'Initializes IP = 0100H.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      return {
        newRegs: { ...regs, IP: regs.IP + 1 },
        newFlags: { ...flags },
        mathExplanation: 'NOP performs no action. IP is incremented by 1 byte.'
      };
    }
  },
  {
    opcode: 'ESC 6, AL',
    category: 'Machine Control',
    desc: 'Escape to Coprocessor: Passes opcode and operand to external math coprocessor (8087).',
    setupDesc: 'Initializes AL = 10H (coprocessor opcode/data).',
    initialRegs: { AX: 0x0010, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      return {
        newRegs: { ...regs, IP: regs.IP + 2 },
        newFlags: { ...flags },
        mathExplanation: 'ESC 6, AL places opcode onto bus for external numeric processor.'
      };
    }
  },
  {
    opcode: 'WAIT',
    category: 'Machine Control',
    desc: 'Wait for Coprocessor: Suspends CPU until TEST pin is asserted by external coprocessor.',
    setupDesc: 'CPU polls TEST pin state.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      return {
        newRegs: { ...regs, IP: regs.IP + 1 },
        newFlags: { ...flags },
        mathExplanation: 'WAIT polls TEST hardware pin until coprocessor signals completion.'
      };
    }
  },

  // ================= CATEGORY: FLAG =================
  {
    opcode: 'STC',
    category: 'Flag Manipulation',
    desc: 'Sets the Carry Flag (CF) to 1.',
    setupDesc: 'Initializes CF = 0.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      return {
        newRegs: { ...regs, IP: regs.IP + 1 },
        newFlags: { ...flags, CF: 1 },
        mathExplanation: 'STC forces the Carry Flag (CF) to 1 directly, without affecting any other state.'
      };
    }
  },
  {
    opcode: 'CLC',
    category: 'Flag Manipulation',
    desc: 'Clears the Carry Flag (CF) to 0.',
    setupDesc: 'Initializes CF = 1.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 1, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      return {
        newRegs: { ...regs, IP: regs.IP + 1 },
        newFlags: { ...flags, CF: 0 },
        mathExplanation: 'CLC clears the Carry Flag (CF = 0) directly.'
      };
    }
  },
  {
    opcode: 'CMC',
    category: 'Flag Manipulation',
    desc: 'Complement Carry Flag: Toggles Carry Flag (CF = 1 - CF).',
    setupDesc: 'Initializes CF = 0. Execution toggles CF to 1.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      return {
        newRegs: { ...regs, IP: regs.IP + 1 },
        newFlags: { ...flags, CF: flags.CF === 1 ? 0 : 1 },
        mathExplanation: 'CMC complements Carry Flag (CF: 0 → 1).'
      };
    }
  },
  {
    opcode: 'STI',
    category: 'Flag Manipulation',
    desc: 'Set Interrupt Flag: Sets IF = 1 to enable maskable hardware interrupts.',
    setupDesc: 'Initializes IF = 0. Execution enables external interrupts.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      return {
        newRegs: { ...regs, IP: regs.IP + 1 },
        newFlags: { ...flags },
        mathExplanation: 'STI sets Interrupt Enable Flag (IF = 1), enabling maskable interrupts.'
      };
    }
  },
  {
    opcode: 'CLI',
    category: 'Flag Manipulation',
    desc: 'Clear Interrupt Flag: Clears IF = 0 to disable maskable hardware interrupts.',
    setupDesc: 'Initializes IF = 1. Execution disables external interrupts.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      return {
        newRegs: { ...regs, IP: regs.IP + 1 },
        newFlags: { ...flags },
        mathExplanation: 'CLI clears Interrupt Enable Flag (IF = 0), disabling maskable interrupts.'
      };
    }
  },
  {
    opcode: 'LAHF',
    category: 'Flag Manipulation',
    desc: 'Loads the AH register with the low byte of the Flag register (SF, ZF, AF, PF, CF).',
    setupDesc: 'Initializes AH = 00H, and sets ZF = 1, CF = 1 to show bits transfer.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 1, CF: 1, SF: 0, OF: 0, AF: 1, PF: 0 },
    execute: (regs, flags) => {
      const flagByte = 0x53; // SF:ZF:0:AF:0:PF:1:CF
      const newAX = (regs.AX & 0x00FF) | (flagByte << 8);
      return {
        newRegs: { ...regs, AX: newAX, IP: regs.IP + 1 },
        newFlags: { ...flags },
        mathExplanation: 'LAHF copies flags (SF, ZF, AF, PF, CF) into bit positions of AH register, creating byte 53H.'
      };
    }
  },
  {
    opcode: 'SAHF',
    category: 'Flag Manipulation',
    desc: 'Stores bits 7, 6, 4, 2, 0 of register AH into flags SF, ZF, AF, PF, CF.',
    setupDesc: 'Initializes AH = 0D5H (11010101B). Copies bits directly into flags.',
    initialRegs: { AX: 0xD500, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      return {
        newRegs: { ...regs, IP: regs.IP + 1 },
        newFlags: { ...flags, SF: 1, ZF: 1, AF: 1, PF: 1, CF: 1 },
        mathExplanation: 'SAHF copies bit settings from AH (D5H) directly into status flags: SF=1, ZF=1, AF=1, PF=1, CF=1.'
      };
    }
  },
  {
    opcode: 'CLD',
    category: 'Flag Manipulation',
    desc: 'Clear Direction Flag: Clears DF = 0 so string instructions auto-increment pointers.',
    setupDesc: 'Initializes DF = 1. Execution clears DF = 0 (Auto-increment mode).',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x1000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0, DF: 1 },
    execute: (regs, flags) => {
      return {
        newRegs: { ...regs, IP: regs.IP + 1 },
        newFlags: { ...flags, DF: 0 },
        mathExplanation: `[CLD EXECUTION]: Cleared Direction Flag (DF = 0). Subsequent string operations will automatically increment SI and DI pointers forward.`
      };
    }
  },
  {
    opcode: 'STD',
    category: 'Flag Manipulation',
    desc: 'Set Direction Flag: Sets DF = 1 so string instructions auto-decrement pointers.',
    setupDesc: 'Initializes DF = 0. Execution sets DF = 1 (Auto-decrement mode).',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x1000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0, DF: 0 },
    execute: (regs, flags) => {
      return {
        newRegs: { ...regs, IP: regs.IP + 1 },
        newFlags: { ...flags, DF: 1 },
        mathExplanation: `[STD EXECUTION]: Set Direction Flag (DF = 1). Subsequent string operations will automatically decrement SI and DI pointers backward.`
      };
    }
  },

  // ================= CATEGORY: DATA COPY / TRANSFER (I/O) =================
  {
    opcode: 'IN AL, 0C8H',
    category: 'String & Port',
    desc: 'Reads an 8-bit byte from physical fixed I/O port 0C8H into AL.',
    setupDesc: 'Initializes AL = 00H. Fixed port 0C8H holds byte 39H.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const newAX = (regs.AX & 0xFF00) | 0x39;
      return {
        newRegs: { ...regs, AX: newAX, IP: regs.IP + 2 },
        newFlags: { ...flags },
        mathExplanation: 'IN AL, 0C8H copies the peripheral hardware data byte (39H) from port 0C8H into AL.'
      };
    }
  },
  {
    opcode: 'OUT DX, AL',
    category: 'String & Port',
    desc: 'Outputs the byte in AL to the variable port address contained in DX.',
    setupDesc: 'Initializes DX = 0FFF8H (port address) and AL = A5H (data to output).',
    initialRegs: { AX: 0x00A5, BX: 0x0000, CX: 0x0000, DX: 0xFFF8, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      return {
        newRegs: { ...regs, IP: regs.IP + 2 },
        newFlags: { ...flags },
        mathExplanation: 'OUT copies AL byte (A5H) directly to port address DX (0FFF8H). No flags are modified.'
      };
    }
  },

  // ================= CATEGORY: STRING & PORT =================
  {
    opcode: 'MOVSB',
    category: 'String & Port',
    desc: 'Move String Byte: Copies byte from DS:SI to ES:DI, then auto-adjusts SI and DI.',
    setupDesc: 'Initializes DS:SI = 1000:1000H (Source byte = 5AH) and ES:DI = 4000:2000H. Direction Flag DF = 0.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0001, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x1000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0, DF: 0 },
    execute: (regs, flags) => {
      const step = flags.DF === 1 ? -1 : 1;
      const newSI = (regs.SI + step) & 0xFFFF;
      const newDI = (regs.DI + step) & 0xFFFF;
      return {
        newRegs: { ...regs, SI: newSI, DI: newDI, IP: regs.IP + 1 },
        newFlags: { ...flags },
        mathExplanation: `[MOVSB EXECUTION]: Moved 1 byte from source DS:${regs.SI.toString(16).toUpperCase().padStart(4, '0')}H to destination ES:${regs.DI.toString(16).toUpperCase().padStart(4, '0')}H. Since DF = ${flags.DF}, SI and DI were ${flags.DF === 1 ? 'decremented' : 'incremented'} by 1 (SI → ${newSI.toString(16).toUpperCase().padStart(4, '0')}H, DI → ${newDI.toString(16).toUpperCase().padStart(4, '0')}H). Status flags are unaffected.`
      };
    }
  },
  {
    opcode: 'MOVSW',
    category: 'String & Port',
    desc: 'Move String Word: Copies 16-bit word from DS:SI to ES:DI, then auto-adjusts SI and DI by 2.',
    setupDesc: 'Initializes DS:SI = 1000:1000H (Word = 1234H) and ES:DI = 4000:2000H. DF = 0.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0001, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x1000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0, DF: 0 },
    execute: (regs, flags) => {
      const step = flags.DF === 1 ? -2 : 2;
      const newSI = (regs.SI + step) & 0xFFFF;
      const newDI = (regs.DI + step) & 0xFFFF;
      return {
        newRegs: { ...regs, SI: newSI, DI: newDI, IP: regs.IP + 1 },
        newFlags: { ...flags },
        mathExplanation: `[MOVSW EXECUTION]: Transferred 16-bit word (2 bytes) from DS:${regs.SI.toString(16).toUpperCase().padStart(4, '0')}H to ES:${regs.DI.toString(16).toUpperCase().padStart(4, '0')}H. Since DF = ${flags.DF}, SI and DI were ${flags.DF === 1 ? 'decremented' : 'incremented'} by 2 (SI → ${newSI.toString(16).toUpperCase().padStart(4, '0')}H, DI → ${newDI.toString(16).toUpperCase().padStart(4, '0')}H). Status flags are unaffected.`
      };
    }
  },
  {
    opcode: 'CMPSB',
    category: 'String & Port',
    desc: 'Compare String Byte: Subtracts byte at ES:DI from byte at DS:SI and updates flags (ZF, CF, SF).',
    setupDesc: 'Initializes DS:SI = 45H and ES:DI = 45H (Matching bytes). Adjusts SI and DI by 1.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0001, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x1000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0, DF: 0 },
    execute: (regs, flags) => {
      const step = flags.DF === 1 ? -1 : 1;
      const newSI = (regs.SI + step) & 0xFFFF;
      const newDI = (regs.DI + step) & 0xFFFF;
      return {
        newRegs: { ...regs, SI: newSI, DI: newDI, IP: regs.IP + 1 },
        newFlags: { ...flags, ZF: 1, CF: 0, SF: 0 },
        mathExplanation: `[CMPSB EXECUTION]: Compared DS:${regs.SI.toString(16).toUpperCase().padStart(4, '0')}H (45H) with ES:${regs.DI.toString(16).toUpperCase().padStart(4, '0')}H (45H). Result = 0 (Match!). ZF set to 1, CF = 0. SI and DI ${flags.DF === 1 ? 'decremented' : 'incremented'} to ${newSI.toString(16).toUpperCase().padStart(4, '0')}H and ${newDI.toString(16).toUpperCase().padStart(4, '0')}H.`
      };
    }
  },
  {
    opcode: 'SCASB',
    category: 'String & Port',
    desc: 'Scan String Byte: Compares AL with byte at ES:DI, sets flags, and updates DI.',
    setupDesc: 'Initializes AL = 20H (\' \') and ES:DI = 20H. Searches for target character.',
    initialRegs: { AX: 0x0020, BX: 0x0000, CX: 0x000A, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x1000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0, DF: 0 },
    execute: (regs, flags) => {
      const step = flags.DF === 1 ? -1 : 1;
      const newDI = (regs.DI + step) & 0xFFFF;
      return {
        newRegs: { ...regs, DI: newDI, IP: regs.IP + 1 },
        newFlags: { ...flags, ZF: 1, CF: 0 },
        mathExplanation: `[SCASB EXECUTION]: Scanned memory ES:${regs.DI.toString(16).toUpperCase().padStart(4, '0')}H (20H) against AL (${(regs.AX & 0xFF).toString(16).toUpperCase().padStart(2, '0')}H). Match found! Zero Flag ZF = 1. DI updated to ${newDI.toString(16).toUpperCase().padStart(4, '0')}H.`
      };
    }
  },
  {
    opcode: 'LODSB',
    category: 'String & Port',
    desc: 'Load String Byte: Loads byte from DS:SI into AL, then auto-adjusts SI.',
    setupDesc: 'Initializes DS:SI = 1000:1000H containing character \'A\' (41H). AL is cleared.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0001, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x1000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0, DF: 0 },
    execute: (regs, flags) => {
      const step = flags.DF === 1 ? -1 : 1;
      const newSI = (regs.SI + step) & 0xFFFF;
      return {
        newRegs: { ...regs, AX: (regs.AX & 0xFF00) | 0x41, SI: newSI, IP: regs.IP + 1 },
        newFlags: { ...flags },
        mathExplanation: `[LODSB EXECUTION]: Loaded byte 41H (\'A\') from DS:${regs.SI.toString(16).toUpperCase().padStart(4, '0')}H into AL. SI ${flags.DF === 1 ? 'decremented' : 'incremented'} to ${newSI.toString(16).toUpperCase().padStart(4, '0')}H. Flags unaffected.`
      };
    }
  },
  {
    opcode: 'STOSB',
    category: 'String & Port',
    desc: 'Store String Byte: Stores byte from AL into ES:DI memory, then auto-adjusts DI.',
    setupDesc: 'Initializes AL = 24H (\'$\') to fill buffer starting at ES:DI = 4000:2000H.',
    initialRegs: { AX: 0x0024, BX: 0x0000, CX: 0x0005, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x1000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0, DF: 0 },
    execute: (regs, flags) => {
      const step = flags.DF === 1 ? -1 : 1;
      const newDI = (regs.DI + step) & 0xFFFF;
      return {
        newRegs: { ...regs, DI: newDI, IP: regs.IP + 1 },
        newFlags: { ...flags },
        mathExplanation: `[STOSB EXECUTION]: Stored AL byte 24H (\'$\') into ES:${regs.DI.toString(16).toUpperCase().padStart(4, '0')}H. DI ${flags.DF === 1 ? 'decremented' : 'incremented'} to ${newDI.toString(16).toUpperCase().padStart(4, '0')}H. Flags unaffected.`
      };
    }
  },
  {
    opcode: 'REP MOVSB',
    category: 'String & Port',
    desc: 'Repeat Move String Byte: Repeats MOVSB until CX reaches 0.',
    setupDesc: 'Initializes CX = 0005H (5 bytes to copy) from DS:SI to ES:DI.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0005, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x1000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0, DF: 0 },
    execute: (regs, flags) => {
      return {
        newRegs: { ...regs, CX: 0x0000, SI: 0x1005, DI: 0x2005, IP: regs.IP + 2 },
        newFlags: { ...flags },
        mathExplanation: `[REP MOVSB EXECUTION]: Executed 5 consecutive byte copies from DS:1000H to ES:2000H. CX decremented from 0005H to 0000H. SI → 1005H, DI → 2005H.`
      };
    }
  }
];

export interface ByteBreakdown {
  label: string;
  bits: string;
  hex: string;
  desc: string;
}

export interface InstructionFormatInfo {
  syntax: string;
  addressing: string;
  format: string;
  machineCode: string;
  bytesBreakdown: ByteBreakdown[];
}

export function getInstructionFormat(opcode: string): InstructionFormatInfo {
  const op = opcode.trim();
  
  if (op === 'MOV CX, 037AH') {
    return {
      syntax: 'MOV CX, imm16',
      addressing: 'Immediate Addressing',
      format: '1011 w reg [Immediate Low] [Immediate High]',
      machineCode: 'B9 7A 03',
      bytesBreakdown: [
        { label: 'Opcode + Reg', bits: '10111001', hex: 'B9H', desc: 'MOV to 16-bit CX (w=1, reg=001)' },
        { label: 'Imm Low', bits: '01111010', hex: '7AH', desc: 'Low byte of immediate 037AH' },
        { label: 'Imm High', bits: '00000011', hex: '03H', desc: 'High byte of immediate 037AH' }
      ]
    };
  }
  if (op === 'XCHG AX, BX') {
    return {
      syntax: 'XCHG AX, BX',
      addressing: 'Register Addressing',
      format: '10010 reg',
      machineCode: '93',
      bytesBreakdown: [
        { label: 'Opcode + Reg', bits: '10010011', hex: '93H', desc: 'Exchange AX with BX (reg=011)' }
      ]
    };
  }
  if (op === 'XLAT') {
    return {
      syntax: 'XLAT',
      addressing: 'Implied / Register Indirect Addressing (via DS:BX)',
      format: '11010111',
      machineCode: 'D7',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11010111', hex: 'D7H', desc: 'Translate byte in AL using table DS:[BX]' }
      ]
    };
  }
  if (op === 'LEA BX, PRICES') {
    return {
      syntax: 'LEA BX, memory',
      addressing: 'Direct Memory Addressing',
      format: '10001101 [mod reg r/m] [Disp Low] [Disp High]',
      machineCode: '8D 1E A0 20',
      bytesBreakdown: [
        { label: 'Opcode', bits: '10001101', hex: '8DH', desc: 'LEA instruction' },
        { label: 'ModR/M', bits: '00011110', hex: '1EH', desc: 'mod=00, reg=011 (BX), r/m=110 (direct addr)' },
        { label: 'Disp Low', bits: '10100000', hex: 'A0H', desc: 'Low byte of offset PRICES (20A0H)' },
        { label: 'Disp High', bits: '00100000', hex: '20H', desc: 'High byte of offset PRICES (20A0H)' }
      ]
    };
  }
  if (op === 'LDS SI, SPTR') {
    return {
      syntax: 'LDS SI, memory',
      addressing: 'Direct Memory Addressing',
      format: '11000101 [mod reg r/m] [Disp Low] [Disp High]',
      machineCode: 'C5 36 26 43',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11000101', hex: 'C5H', desc: 'LDS instruction' },
        { label: 'ModR/M', bits: '00110110', hex: '36H', desc: 'mod=00, reg=110 (SI), r/m=110 (direct addr)' },
        { label: 'Disp Low', bits: '00100110', hex: '26H', desc: 'Low byte of address SPTR' },
        { label: 'Disp High', bits: '01000011', hex: '43H', desc: 'High byte of address SPTR' }
      ]
    };
  }
  if (op === 'LES DI, EPTR') {
    return {
      syntax: 'LES DI, memory',
      addressing: 'Direct Memory Addressing',
      format: '11000100 [mod reg r/m] [Disp Low] [Disp High]',
      machineCode: 'C4 3E 50 10',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11000100', hex: 'C4H', desc: 'LES instruction' },
        { label: 'ModR/M', bits: '00111110', hex: '3EH', desc: 'mod=00, reg=111 (DI), r/m=110 (direct addr)' },
        { label: 'Disp Low', bits: '01010000', hex: '50H', desc: 'Low byte of address EPTR (1050H)' },
        { label: 'Disp High', bits: '00010000', hex: '10H', desc: 'High byte of address EPTR (1050H)' }
      ]
    };
  }
  if (op === 'PUSH AX') {
    return {
      syntax: 'PUSH AX',
      addressing: 'Register Addressing / Stack Indirect (via SS:SP)',
      format: '01010 reg',
      machineCode: '50',
      bytesBreakdown: [
        { label: 'Opcode + Reg', bits: '01010000', hex: '50H', desc: 'PUSH AX (reg=000)' }
      ]
    };
  }
  if (op === 'POP DX') {
    return {
      syntax: 'POP DX',
      addressing: 'Register Addressing / Stack Indirect (via SS:SP)',
      format: '01011 reg',
      machineCode: '5A',
      bytesBreakdown: [
        { label: 'Opcode + Reg', bits: '01011010', hex: '5AH', desc: 'POP DX (reg=010)' }
      ]
    };
  }
  if (op.startsWith('ADD AL,')) {
    return {
      syntax: 'ADD AL, operand8',
      addressing: 'Register / Immediate Addressing Mode',
      format: '000000 d w [mod reg r/m]',
      machineCode: '00 C3',
      bytesBreakdown: [
        { label: 'Opcode', bits: '00000000', hex: '00H', desc: 'ADD reg8 (w=0: byte operation)' },
        { label: 'ModR/M', bits: '11000011', hex: 'C3H', desc: 'mod=11 (Register mode), reg=000 (AL destination)' }
      ]
    };
  }
  if (op.startsWith('ADD AX,')) {
    return {
      syntax: 'ADD AX, imm16',
      addressing: 'Immediate Addressing',
      format: '00000101 [Immediate Low] [Immediate High]',
      machineCode: '05 34 12',
      bytesBreakdown: [
        { label: 'Opcode', bits: '00000101', hex: '05H', desc: 'ADD AX shortcut (w=1)' },
        { label: 'Imm Low', bits: '00110100', hex: '34H', desc: 'Low byte of immediate' },
        { label: 'Imm High', bits: '00010010', hex: '12H', desc: 'High byte of immediate' }
      ]
    };
  }
  if (op.startsWith('ADC AX,')) {
    return {
      syntax: 'ADC AX, operand16',
      addressing: 'Register / Immediate Addressing',
      format: '0001000 w [mod reg r/m]',
      machineCode: '11 D8',
      bytesBreakdown: [
        { label: 'Opcode', bits: '00010001', hex: '11H', desc: 'ADC reg16, reg16 (w=1)' },
        { label: 'ModR/M', bits: '11011000', hex: 'D8H', desc: 'mod=11, reg=011 (BX/source), r/m=000 (AX)' }
      ]
    };
  }
  if (op.startsWith('SUB AX,')) {
    return {
      syntax: 'SUB AX, operand16',
      addressing: 'Register / Immediate Addressing',
      format: '0010100 w [mod reg r/m]',
      machineCode: '29 D8',
      bytesBreakdown: [
        { label: 'Opcode', bits: '00101001', hex: '29H', desc: 'SUB reg16, reg16 (w=1)' },
        { label: 'ModR/M', bits: '11011000', hex: 'D8H', desc: 'mod=11, reg=011 (BX/source), r/m=000 (AX)' }
      ]
    };
  }
  if (op.startsWith('SUB AL,')) {
    return {
      syntax: 'SUB AL, imm8',
      addressing: 'Immediate Addressing',
      format: '00101100 [Immediate]',
      machineCode: '2C 05',
      bytesBreakdown: [
        { label: 'Opcode', bits: '00101100', hex: '2CH', desc: 'SUB AL shortcut (w=0)' },
        { label: 'Immediate', bits: '00000101', hex: '05H', desc: 'Byte operand' }
      ]
    };
  }
  if (op.startsWith('SBB AX,')) {
    return {
      syntax: 'SBB AX, BX',
      addressing: 'Register Addressing',
      format: '0001100 w [mod reg r/m]',
      machineCode: '19 D8',
      bytesBreakdown: [
        { label: 'Opcode', bits: '00011001', hex: '19H', desc: 'SBB reg16, reg16 (w=1)' },
        { label: 'ModR/M', bits: '11011000', hex: 'D8H', desc: 'mod=11, reg=011 (BX), r/m=000 (AX)' }
      ]
    };
  }
  if (op === 'MUL BH') {
    return {
      syntax: 'MUL BH',
      addressing: 'Register Addressing (implied AL/AX product)',
      format: '1111011 w [mod 100 r/m]',
      machineCode: 'F6 E7',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11110110', hex: 'F6H', desc: 'MUL 8-bit register (w=0)' },
        { label: 'ModR/M', bits: '11100111', hex: 'E7H', desc: 'mod=11, ext=100 (MUL), r/m=111 (BH)' }
      ]
    };
  }
  if (op === 'MUL CX') {
    return {
      syntax: 'MUL CX',
      addressing: 'Register Addressing (DX:AX product)',
      format: '1111011 w [mod 100 r/m]',
      machineCode: 'F7 E1',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11110111', hex: 'F7H', desc: 'MUL 16-bit register (w=1)' },
        { label: 'ModR/M', bits: '11100001', hex: 'E1H', desc: 'mod=11, ext=100 (MUL), r/m=001 (CX)' }
      ]
    };
  }
  if (op === 'IMUL BL') {
    return {
      syntax: 'IMUL BL',
      addressing: 'Register Addressing (implied AL/AX signed product)',
      format: '1111011 w [mod 101 r/m]',
      machineCode: 'F6 ED',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11110110', hex: 'F6H', desc: 'IMUL 8-bit register (w=0)' },
        { label: 'ModR/M', bits: '11101101', hex: 'EDH', desc: 'mod=11, ext=101 (IMUL), r/m=101 (BL)' }
      ]
    };
  }
  if (op === 'IMUL CX') {
    return {
      syntax: 'IMUL CX',
      addressing: 'Register Addressing (signed DX:AX product)',
      format: '1111011 w [mod 101 r/m]',
      machineCode: 'F7 E9',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11110111', hex: 'F7H', desc: 'IMUL 16-bit register (w=1)' },
        { label: 'ModR/M', bits: '11101001', hex: 'E9H', desc: 'mod=11, ext=101 (IMUL), r/m=001 (CX)' }
      ]
    };
  }
  if (op === 'DIV BL') {
    return {
      syntax: 'DIV BL',
      addressing: 'Register Addressing (implied AL/AH quotient/remainder)',
      format: '1111011 w [mod 110 r/m]',
      machineCode: 'F6 F3',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11110110', hex: 'F6H', desc: 'DIV 8-bit register (w=0)' },
        { label: 'ModR/M', bits: '11110011', hex: 'F3H', desc: 'mod=11, ext=110 (DIV), r/m=011 (BL)' }
      ]
    };
  }
  if (op === 'DIV CX') {
    return {
      syntax: 'DIV CX',
      addressing: 'Register Addressing (32-bit DX:AX dividend)',
      format: '1111011 w [mod 110 r/m]',
      machineCode: 'F7 F1',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11110111', hex: 'F7H', desc: 'DIV 16-bit register (w=1)' },
        { label: 'ModR/M', bits: '11110001', hex: 'F1H', desc: 'mod=11, ext=110 (DIV), r/m=001 (CX)' }
      ]
    };
  }
  if (op === 'IDIV BL') {
    return {
      syntax: 'IDIV BL',
      addressing: 'Register Addressing (implied AL/AH signed quotient/remainder)',
      format: '1111011 w [mod 111 r/m]',
      machineCode: 'F6 FB',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11110110', hex: 'F6H', desc: 'IDIV 8-bit register (w=0)' },
        { label: 'ModR/M', bits: '11111011', hex: 'FBH', desc: 'mod=11, ext=111 (IDIV), r/m=011 (BL)' }
      ]
    };
  }
  if (op === 'IDIV CX') {
    return {
      syntax: 'IDIV CX',
      addressing: 'Register Addressing (signed 32-bit DX:AX dividend)',
      format: '1111011 w [mod 111 r/m]',
      machineCode: 'F7 F9',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11110111', hex: 'F7H', desc: 'IDIV 16-bit register (w=1)' },
        { label: 'ModR/M', bits: '11111001', hex: 'F9H', desc: 'mod=11, ext=111 (IDIV), r/m=001 (CX)' }
      ]
    };
  }
  if (op === 'INC CX') {
    return {
      syntax: 'INC CX',
      addressing: 'Register Addressing',
      format: '01000 reg',
      machineCode: '41',
      bytesBreakdown: [
        { label: 'Opcode + Reg', bits: '01000001', hex: '41H', desc: 'INC CX (reg=001)' }
      ]
    };
  }
  if (op === 'DEC CX') {
    return {
      syntax: 'DEC CX',
      addressing: 'Register Addressing',
      format: '01001 reg',
      machineCode: '49',
      bytesBreakdown: [
        { label: 'Opcode + Reg', bits: '01001001', hex: '49H', desc: 'DEC CX (reg=001)' }
      ]
    };
  }
  if (op === 'NEG AX') {
    return {
      syntax: 'NEG AX',
      addressing: 'Register Addressing',
      format: '1111011 w [mod 011 r/m]',
      machineCode: 'F7 D8',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11110111', hex: 'F7H', desc: 'NEG 16-bit register (w=1)' },
        { label: 'ModR/M', bits: '11011000', hex: 'D8H', desc: 'mod=11, ext=011 (NEG), r/m=000 (AX)' }
      ]
    };
  }
  if (op === 'CMP AX, BX') {
    return {
      syntax: 'CMP AX, BX',
      addressing: 'Register Addressing',
      format: '0011100 w [mod reg r/m]',
      machineCode: '39 D8',
      bytesBreakdown: [
        { label: 'Opcode', bits: '00111001', hex: '39H', desc: 'CMP reg16, reg16 (w=1)' },
        { label: 'ModR/M', bits: '11011000', hex: 'D8H', desc: 'mod=11, reg=011 (BX), r/m=000 (AX)' }
      ]
    };
  }
  if (op === 'CBW') {
    return {
      syntax: 'CBW',
      addressing: 'Implied Addressing',
      format: '10011000',
      machineCode: '98',
      bytesBreakdown: [
        { label: 'Opcode', bits: '10011000', hex: '98H', desc: 'Convert Byte to Word (AL sign-extended to AX)' }
      ]
    };
  }
  if (op === 'CWD') {
    return {
      syntax: 'CWD',
      addressing: 'Implied Addressing',
      format: '10011001',
      machineCode: '99',
      bytesBreakdown: [
        { label: 'Opcode', bits: '10011001', hex: '99H', desc: 'Convert Word to Doubleword (AX sign-extended to DX:AX)' }
      ]
    };
  }
  if (op === 'DAA') {
    return {
      syntax: 'DAA',
      addressing: 'Implied Addressing',
      format: '00100111',
      machineCode: '27',
      bytesBreakdown: [
        { label: 'Opcode', bits: '00100111', hex: '27H', desc: 'Decimal Adjust after Addition' }
      ]
    };
  }
  if (op === 'DAS') {
    return {
      syntax: 'DAS',
      addressing: 'Implied Addressing',
      format: '00101111',
      machineCode: '2F',
      bytesBreakdown: [
        { label: 'Opcode', bits: '00101111', hex: '2FH', desc: 'Decimal Adjust after Subtraction' }
      ]
    };
  }
  if (op === 'AAA') {
    return {
      syntax: 'AAA',
      addressing: 'Implied Addressing',
      format: '00110111',
      machineCode: '37',
      bytesBreakdown: [
        { label: 'Opcode', bits: '00110111', hex: '37H', desc: 'ASCII Adjust after Addition' }
      ]
    };
  }
  if (op === 'AAS') {
    return {
      syntax: 'AAS',
      addressing: 'Implied Addressing',
      format: '00111111',
      machineCode: '3F',
      bytesBreakdown: [
        { label: 'Opcode', bits: '00111111', hex: '3FH', desc: 'ASCII Adjust after Subtraction' }
      ]
    };
  }
  if (op === 'AAM') {
    return {
      syntax: 'AAM',
      addressing: 'Implied / Immediate',
      format: '11010100 00001010',
      machineCode: 'D4 0A',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11010100', hex: 'D4H', desc: 'ASCII Adjust after Multiplication' },
        { label: 'Base Divisor', bits: '00001010', hex: '0AH', desc: 'Divisor value 10' }
      ]
    };
  }
  if (op === 'AAD') {
    return {
      syntax: 'AAD',
      addressing: 'Implied / Immediate',
      format: '11010101 00001010',
      machineCode: 'D5 0A',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11010101', hex: 'D5H', desc: 'ASCII Adjust before Division' },
        { label: 'Base Multiplier', bits: '00001010', hex: '0AH', desc: 'Multiplier value 10' }
      ]
    };
  }
  if (op === 'XOR AX, AX') {
    return {
      syntax: 'XOR AX, AX',
      addressing: 'Register Addressing',
      format: '0011000 w [mod reg r/m]',
      machineCode: '31 C0',
      bytesBreakdown: [
        { label: 'Opcode', bits: '00110001', hex: '31H', desc: 'XOR reg16, reg16 (w=1)' },
        { label: 'ModR/M', bits: '11000000', hex: 'C0H', desc: 'mod=11, reg=000 (AX), r/m=000 (AX)' }
      ]
    };
  }
  if (op === 'AND AL, 0FH') {
    return {
      syntax: 'AND AL, imm8',
      addressing: 'Immediate Addressing',
      format: '0010010 w [Immediate]',
      machineCode: '24 0F',
      bytesBreakdown: [
        { label: 'Opcode', bits: '00100100', hex: '24H', desc: 'AND AL shortcut (w=0)' },
        { label: 'Immediate', bits: '00001111', hex: '0FH', desc: 'Immediate value 0FH' }
      ]
    };
  }
  if (op === 'OR AH, CL') {
    return {
      syntax: 'OR AH, CL',
      addressing: 'Register Addressing',
      format: '0000100 w [mod reg r/m]',
      machineCode: '0A E1',
      bytesBreakdown: [
        { label: 'Opcode', bits: '00001010', hex: '0AH', desc: 'OR reg8 with reg/mem8 (w=0)' },
        { label: 'ModR/M', bits: '11100001', hex: 'E1H', desc: 'mod=11, reg=100 (AH), r/m=001 (CL)' }
      ]
    };
  }
  if (op === 'NOT BX') {
    return {
      syntax: 'NOT BX',
      addressing: 'Register Addressing',
      format: '1111011 w [mod 010 r/m]',
      machineCode: 'F7 D3',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11110111', hex: 'F7H', desc: 'NOT 16-bit register (w=1)' },
        { label: 'ModR/M', bits: '11010011', hex: 'D3H', desc: 'mod=11, ext=010 (NOT), r/m=011 (BX)' }
      ]
    };
  }
  if (op === 'NEG BL') {
    return {
      syntax: 'NEG BL',
      addressing: 'Register Addressing',
      format: '1111011 w [mod 011 r/m]',
      machineCode: 'F6 DB',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11110110', hex: 'F6H', desc: 'NEG 8-bit register (w=0)' },
        { label: 'ModR/M', bits: '11011011', hex: 'DBH', desc: 'mod=11, ext=011 (NEG), r/m=011 (BL)' }
      ]
    };
  }
  if (op === 'SHL CX, 1') {
    return {
      syntax: 'SHL CX, 1',
      addressing: 'Register Addressing',
      format: '1101000 w [mod 100 r/m]',
      machineCode: 'D1 D1',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11010001', hex: 'D1H', desc: 'Shift Left 16-bit by 1 (w=1)' },
        { label: 'ModR/M', bits: '11100001', hex: 'E1H', desc: 'mod=11, ext=100, r/m=001 (CX)' }
      ]
    };
  }
  if (op === 'STC') {
    return {
      syntax: 'STC',
      addressing: 'Implied Addressing',
      format: '11111001',
      machineCode: 'F9',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11111001', hex: 'F9H', desc: 'Set Carry Flag (CF = 1)' }
      ]
    };
  }
  if (op === 'LAHF') {
    return {
      syntax: 'LAHF',
      addressing: 'Implied Addressing',
      format: '10011111',
      machineCode: '9F',
      bytesBreakdown: [
        { label: 'Opcode', bits: '10011111', hex: '9FH', desc: 'Load AH with low byte of Flags' }
      ]
    };
  }
  if (op === 'IN AL, 0C8H') {
    return {
      syntax: 'IN AL, port8',
      addressing: 'Fixed Port I/O Addressing',
      format: '1110010 w [Port]',
      machineCode: 'E4 C8',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11100100', hex: 'E4H', desc: 'IN byte data (w=0)' },
        { label: 'Port', bits: '11001000', hex: 'C8H', desc: 'Fixed physical port address 0C8H' }
      ]
    };
  }
  if (op === 'OUT DX, AL') {
    return {
      syntax: 'OUT DX, AL',
      addressing: 'Variable Port I/O Addressing',
      format: '1110111 w',
      machineCode: 'EE',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11101110', hex: 'EEH', desc: 'OUT byte in AL to variable port DX' }
      ]
    };
  }
  if (op === 'LOCK XCHG [SI], AL') {
    return {
      syntax: 'LOCK XCHG [SI], AL',
      addressing: 'Register Indirect Addressing (via SI)',
      format: 'F0H [Opcode] [mod reg r/m]',
      machineCode: 'F0 86 04',
      bytesBreakdown: [
        { label: 'LOCK Prefix', bits: '11110000', hex: 'F0H', desc: 'Assert lock signal to lock system memory bus' },
        { label: 'Opcode', bits: '10000110', hex: '86H', desc: 'XCHG reg8 with reg/mem8 (w=0)' },
        { label: 'ModR/M', bits: '00000100', hex: '04H', desc: 'mod=00, reg=000 (AL), r/m=100 ([SI])' }
      ]
    };
  }
  if (op === 'MOVSB') {
    return {
      syntax: 'MOVSB',
      addressing: 'String Addressing (DS:SI to ES:DI)',
      format: '10100100',
      machineCode: 'A4',
      bytesBreakdown: [
        { label: 'Opcode', bits: '10100100', hex: 'A4H', desc: 'Move byte from DS:SI to ES:DI' }
      ]
    };
  }
  if (op === 'MOVSW') {
    return {
      syntax: 'MOVSW',
      addressing: 'String Addressing (DS:SI to ES:DI)',
      format: '10100101',
      machineCode: 'A5',
      bytesBreakdown: [
        { label: 'Opcode', bits: '10100101', hex: 'A5H', desc: 'Move 16-bit word from DS:SI to ES:DI' }
      ]
    };
  }
  if (op === 'CMPSB') {
    return {
      syntax: 'CMPSB',
      addressing: 'String Addressing (DS:SI vs ES:DI)',
      format: '10100110',
      machineCode: 'A6',
      bytesBreakdown: [
        { label: 'Opcode', bits: '10100110', hex: 'A6H', desc: 'Compare byte at DS:SI with byte at ES:DI' }
      ]
    };
  }
  if (op === 'SCASB') {
    return {
      syntax: 'SCASB',
      addressing: 'String Addressing (AL vs ES:DI)',
      format: '10101110',
      machineCode: 'AE',
      bytesBreakdown: [
        { label: 'Opcode', bits: '10101110', hex: 'AEH', desc: 'Scan byte in AL against memory ES:DI' }
      ]
    };
  }
  if (op === 'LODSB') {
    return {
      syntax: 'LODSB',
      addressing: 'String Addressing (DS:SI to AL)',
      format: '10101100',
      machineCode: 'AC',
      bytesBreakdown: [
        { label: 'Opcode', bits: '10101100', hex: 'ACH', desc: 'Load byte from DS:SI into AL' }
      ]
    };
  }
  if (op === 'STOSB') {
    return {
      syntax: 'STOSB',
      addressing: 'String Addressing (AL to ES:DI)',
      format: '10101010',
      machineCode: 'AA',
      bytesBreakdown: [
        { label: 'Opcode', bits: '10101010', hex: 'AAH', desc: 'Store byte from AL into ES:DI' }
      ]
    };
  }
  if (op === 'REP MOVSB') {
    return {
      syntax: 'REP MOVSB',
      addressing: 'String Repeat Addressing (CX times)',
      format: '11110011 10100100',
      machineCode: 'F3 A4',
      bytesBreakdown: [
        { label: 'REP Prefix', bits: '11110011', hex: 'F3H', desc: 'Repeat prefix (while CX != 0)' },
        { label: 'Opcode', bits: '10100100', hex: 'A4H', desc: 'Move byte from DS:SI to ES:DI' }
      ]
    };
  }
  if (op.startsWith('LOOP ')) {
    return {
      syntax: 'LOOP rel8',
      addressing: 'Relative Addressing (via IP + signed 8-bit displacement)',
      format: '11100010 [Displacement]',
      machineCode: 'E2 FE',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11100010', hex: 'E2H', desc: 'Loop according to CX counter' },
        { label: 'Disp', bits: '11111110', hex: 'FEH', desc: 'Signed 8-bit relative offset (-2 bytes)' }
      ]
    };
  }
  if (op.startsWith('LOOPE ')) {
    return {
      syntax: 'LOOPE rel8',
      addressing: 'Relative Addressing (via IP + signed 8-bit displacement)',
      format: '11100001 [Displacement]',
      machineCode: 'E1 FE',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11100001', hex: 'E1H', desc: 'Loop while Equal / Zero (ZF=1)' },
        { label: 'Disp', bits: '11111110', hex: 'FEH', desc: 'Signed 8-bit relative offset (-2 bytes)' }
      ]
    };
  }
  if (op.startsWith('LOOPNE ')) {
    return {
      syntax: 'LOOPNE rel8',
      addressing: 'Relative Addressing (via IP + signed 8-bit displacement)',
      format: '11100000 [Displacement]',
      machineCode: 'E0 FE',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11100000', hex: 'E0H', desc: 'Loop while Not Equal / Not Zero (ZF=0)' },
        { label: 'Disp', bits: '11111110', hex: 'FEH', desc: 'Signed 8-bit relative offset (-2 bytes)' }
      ]
    };
  }
  if (op.startsWith('JCXZ ')) {
    return {
      syntax: 'JCXZ rel8',
      addressing: 'Relative Addressing (via IP + signed 8-bit displacement)',
      format: '11100011 [Displacement]',
      machineCode: 'E3 4E',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11100011', hex: 'E3H', desc: 'Jump if CX register is zero' },
        { label: 'Disp', bits: '01001110', hex: '4EH', desc: 'Signed 8-bit relative offset (+78 bytes)' }
      ]
    };
  }
  if (op === 'CLD') {
    return {
      syntax: 'CLD',
      addressing: 'Implied Addressing',
      format: '11111100',
      machineCode: 'FC',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11111100', hex: 'FCH', desc: 'Clear Direction Flag (DF = 0)' }
      ]
    };
  }
  if (op === 'STD') {
    return {
      syntax: 'STD',
      addressing: 'Implied Addressing',
      format: '11111101',
      machineCode: 'FD',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11111101', hex: 'FDH', desc: 'Set Direction Flag (DF = 1)' }
      ]
    };
  }
  
  return {
    syntax: op,
    addressing: 'Standard Register Addressing',
    format: 'Variable Instruction Encoding format',
    machineCode: 'XX',
    bytesBreakdown: [
      { label: 'Opcode', bits: 'XXXXXXXX', hex: 'XXH', desc: 'Instruction opcode byte' }
    ]
  };
}

export interface EceSlide {
  title: string;
  subtitle?: string;
  category?: string;
  professor?: string;
  institution?: string;
  points: string[];
  notes?: string[];
  codeExample?: string;
  diagramTitle?: string;
  diagramData?: {
    source: string;
    sourceVal: string;
    dest: string;
    destValBefore: string;
    destValAfter: string;
    arrowLabel: string;
    notes?: string;
  };
}

export const eceSlides: EceSlide[] = [
  {
    title: "Instruction Set of 8086",
    subtitle: "M LAKSHMIPATHY, ASST PROFESSOR",
    professor: "M LAKSHMIPATHY",
    institution: "KUPPAM ENGG COLLEGE",
    category: "Introduction",
    points: [
      "Welcome to ECE Microprocessors Course Lecture Series.",
      "Topic: 8086 Microprocessor Instruction Set.",
      "Department of Electronics & Communication Engineering (ECE).",
      "This slide companion is fully synchronized with the interactive emulator above! Select any instruction to see its slide and execution effects live."
    ]
  },
  {
    title: "Definition & Terminology",
    category: "Introduction",
    points: [
      "**Instruction**: A sequence of bits in a specific format to instruct the computer to perform a specific Operation.",
      "**Instruction Set**: The entire group of instructions that a microprocessor supports is called instruction set.",
      "A machine language instruction format has one or more fields associated with it:",
      "• **Opcode Field**: Indicates the operation to be performed by the CPU.",
      "• **Operand Field**: Contains the source data, target registers, or memory addresses."
    ],
    notes: [
      "The CPU executes the instruction using the information residing in the operand field.",
      "The length of the instruction may vary from one byte to six bytes.",
      "8086 supports more than 20,000 instructions."
    ]
  },
  {
    title: "8086 Instruction Formats & Categories",
    category: "Instruction Set Architecture",
    points: [
      "1. **Data Copy / Transfer**: `MOV Destination, Source`, `XCHG Destination, Source`, `XLAT`, `LEA Destination, Source`, `LDS/LES Destination, Source`, `PUSH Source`, `POP Destination`",
      "2. **Arithmetic**: `ADD Destination, Source`, `ADC Destination, Source`, `SUB Destination, Source`, `SBB Destination, Source`, `MUL Source`, `IMUL Source`, `DIV Source`, `IDIV Source`, `INC Destination`, `DEC Destination`, `CMP Destination, Source`, `AAA`, `AAS`, `AAM`, `AAD`, `DAA`, `DAS`, `CBW`, `CWD`",
      "3. **Logical**: `AND Destination, Source`, `OR Destination, Source`, `NOT Destination`, `NEG Destination`, `XOR Destination, Source`, `TEST Destination, Source`",
      "4. **Branch**: `JA Target`, `JAE Target`, `JB Target`, `JBE Target`, `JE Target`, `JNE Target`, `JG Target`, `JGE Target`, `JL Target`, `JLE Target`, `JC Target`, `JO Target`, `JS Target`, `JNP Target`, `JP Target`, `JMP Target`, `CALL Target`, `RET`",
      "5. **Loop**: `LOOP Target`, `LOOPE Target`, `LOOPNE Target`, `JCXZ Target`",
      "6. **Machine Control**: `HLT`, `LOCK`, `NOP`, `ESC External Opcode, Source`, `WAIT`",
      "7. **Flag Manipulation**: `STC`, `CLC`, `CMC`, `STD`, `CLD`, `STI`, `CLI`, `LAHF`, `SAHF`",
      "8. **Shift & Rotate**: `SHL Destination, Count`, `SAL Destination, Count`, `SHR Destination, Count`, `SAR Destination, Count`, `ROL Destination, Count`, `ROR Destination, Count`, `RCL Destination, Count`, `RCR Destination, Count`",
      "9. **String & Port**: `MOVS/MOVSB/MOVSW`, `LODS`, `STOS`, `CMPS`, `SCAS`, `REP`, `IN Accumulator, Port`, `OUT Port, Accumulator`"
    ],
    notes: [
      "1. General formats specify generalized operands (Destination, Source, Target, Count, External Opcode, Port).",
      "2. Operand values, addressing modes, and register/flag modifications are evaluated dynamically during emulation.",
      "3. Memory-to-Memory MOV or arithmetic operations are illegal in 8086 architecture."
    ]
  },
  {
    title: "1. MOV - Move / Copy Instruction",
    category: "Data Copy/Transfer",
    points: [
      "**Format**: `MOV Destination, Source`",
      "**Operation**: `Destination = Source`",
      "**Source**: Immediate Data, Register, or Memory location",
      "**Destination**: Register or Memory location"
    ],
    notes: [
      "1. Both the source and destination should be of the same type (bytes or words).",
      "2. Both the operands cannot be the memory (Memory-to-Memory MOV is illegal!).",
      "3. Does not affect any flag."
    ],
    diagramTitle: "MOV Operation Block Diagram",
    diagramData: {
      source: "Source (Immediate / Reg)",
      sourceVal: "037AH",
      dest: "Destination (CX Register)",
      destValBefore: "0000H",
      destValAfter: "037AH",
      arrowLabel: "MOV Copy Flow",
      notes: "CX is updated directly with 037AH. No flags are affected."
    }
  },
  {
    title: "MOV Instruction Examples",
    category: "Data Copy/Transfer",
    points: [
      "• `MOV CX, 037AH` - Put immediate number 037AH to CX.",
      "• `MOV BL, [437AH]` - Copy byte in DS at offset 437AH to BL.",
      "• `MOV AX, BX` - Copy content of register BX to AX.",
      "• `MOV DL, [BX]` - Copy byte from memory at [BX] to DL.",
      "• `MOV DS, BX` - Copy word from BX to DS segment register."
    ],
    notes: [
      "Both operands must be the same size (e.g. 16-bit to 16-bit, or 8-bit to 8-bit).",
      "Segment override prefixes (like CS, ES) can be used to redirect source segment offsets."
    ],
    codeExample: "MOV CX, 037AH ; Load CX with 16-bit immediate value\nMOV AL, [BX]   ; Load AL with byte from address pointed by BX"
  },
  {
    title: "2. XCHG - Exchange Instruction",
    category: "Data Copy/Transfer",
    points: [
      "**Format**: `XCHG Destination, Source`",
      "Exchanges the contents of a register with another register or memory location.",
      "**Source**: Register or Memory location",
      "**Destination**: Register or Memory location"
    ],
    notes: [
      "1. Both source and destination must be of the same type (bytes or words).",
      "2. Segment registers cannot be used in this instruction.",
      "3. Both the operands cannot be the memory.",
      "4. Does not affect any flag."
    ],
    diagramTitle: "XCHG Swapping Block Diagram",
    diagramData: {
      source: "AX Register",
      sourceVal: "1234H",
      dest: "BX Register",
      destValBefore: "ABCDH",
      destValAfter: "1234H",
      arrowLabel: "Swap Swapping Flow",
      notes: "AX ends with ABCDH, and BX ends with 1234H. Flags remain unaffected."
    }
  },
  {
    title: "3. XLAT - Translate Instruction",
    category: "Data Copy/Transfer",
    points: [
      "**Format**: `XLAT`",
      "This instruction is useful for translating characters from one code (e.g. ASCII) to another (e.g. EBCDIC).",
      "Implied addressing mode: takes no operands.",
      "Loads AL with the contents of memory at `DS:[BX + AL]` offset."
    ],
    notes: [
      "Formula: AL <- [(AL) + (BX) + (DS)]",
      "The starting address of the lookup table is preloaded into BX, and the element index is preloaded into AL.",
      "Does not affect any flag."
    ],
    codeExample: "MOV BX, 0300H ; BX points to Gray Code table\nMOV AL, 03H   ; AL holds the lookup index\nXLAT          ; AL is now loaded with translated Gray Code"
  },
  {
    title: "4. LEA - Load Effective Address",
    category: "Data Copy/Transfer",
    points: [
      "**Format**: `LEA Register, Source`",
      "This instruction determines the **offset (effective address)** of the source memory operand and copies it into the 16-bit register.",
      "**Source**: Memory Location or Variable",
      "**Destination**: 16-bit General Purpose Register"
    ],
    notes: [
      "Does not affect any flag.",
      "Crucial difference from MOV: `LEA BX, PRICES` loads the address/offset of PRICES. `MOV BX, [PRICES]` loads the value stored inside PRICES!"
    ],
    codeExample: "LEA BX, PRICES ; Load BX with offset address of PRICES\nLEA CX, [BX][DI] ; Load CX with effective offset of BX + DI"
  },
  {
    title: "5. LDS & LES - Load segment pointer",
    category: "Data Copy/Transfer",
    points: [
      "**Format**: `LDS Register, Memory_Address`",
      "Loads a 32-bit far pointer (segment:offset) from 4 sequential memory locations:",
      "• First 16-bit word loaded into target register.",
      "• Second 16-bit word loaded into segment register."
    ],
    notes: [
      "Does not affect any flag.",
      "Commonly used to initialize pointer registers SI/DI along with their segments DS/ES before string copy loops."
    ],
    codeExample: "LDS SI, SPTR ; SI = Offset, DS = Segment loaded from SPTR address"
  },
  {
    title: "6. PUSH & POP - Stack Instructions",
    category: "Data Copy/Transfer",
    points: [
      "**PUSH Format**: `PUSH Source`",
      "Decrements Stack Pointer (SP) by 2 and copies a 16-bit word onto stack memory pointed by SS:SP.",
      "**POP Format**: `POP Destination`",
      "Copies a 16-bit word from SS:SP stack memory to destination, then increments SP by 2."
    ],
    notes: [
      "1. Source/Destination can be general-purpose registers, segment registers, or memory.",
      "2. Stack grows downwards in memory (high address FFFFH to low address).",
      "3. Does not affect any status flags."
    ],
    codeExample: "PUSH AX ; Save AX onto stack\nPOP DX  ; Restore saved value into DX"
  },
  {
    title: "7. ADD & ADC - Addition Instructions",
    category: "Arithmetic",
    points: [
      "**ADD Format**: `ADD Destination, Source` -> `Dest = Dest + Source`",
      "**ADC Format**: `ADC Destination, Source` -> `Dest = Dest + Source + CarryFlag`",
      "Used for multi-word precision additions where carry from lower word must propagate."
    ],
    notes: [
      "1. Register cannot be segment register.",
      "2. Both operands cannot be memory.",
      "3. All conditional status flags (ZF, CF, SF, OF, AF, PF) are affected based on result."
    ],
    codeExample: "ADD AX, 0100H ; Add immediate value 0100H to AX\nADC DX, BX    ; Add BX to DX with previous Carry flag"
  },
  {
    title: "8. SUB & SBB - Subtraction Instructions",
    category: "Arithmetic",
    points: [
      "**SUB Format**: `SUB Destination, Source` -> `Dest = Dest - Source`",
      "**SBB Format**: `SBB Destination, Source` -> `Dest = Dest - Source - CarryFlag (Borrow)`",
      "Performs subtraction of source from destination, and propagates borrow flags."
    ],
    notes: [
      "1. Registers cannot be segment registers.",
      "2. Both operands cannot be memory.",
      "3. All conditional flags are updated."
    ],
    codeExample: "SUB AX, BX ; Subtract BX from AX\nSBB DX, CX ; Subtract CX from DX with Borrow flag"
  },
  {
    title: "9. MUL & IMUL - Unsigned & Signed Multiplication",
    category: "Arithmetic",
    points: [
      "**MUL (Unsigned)**: `MUL Source` multiplies unsigned operands (AL * Src -> AX or AX * Src -> DX:AX).",
      "**IMUL (Signed)**: `IMUL Source` multiplies 2's complement signed operands, preserving algebraic sign (+ * + = +, + * - = -).",
      "**Byte multiplication (8-bit)**: `AX = AL * Source` (16-bit double-width result).",
      "**Word multiplication (16-bit)**: `DX:AX = AX * Source` (32-bit double-width result in DX:AX register pair)."
    ],
    notes: [
      "1. Source operand can be any general register or memory location, but NOT an immediate constant.",
      "2. For MUL: CF and OF are set to 1 if upper half of product (AH or DX) is non-zero.",
      "3. For IMUL: CF and OF are set to 1 if upper half is NOT a sign extension of lower half."
    ],
    codeExample: "MUL BL   ; Unsigned AL * BL -> Product in AX\nIMUL BL  ; Signed 2's complement AL * BL -> Product in AX\nMUL CX   ; Unsigned AX * CX -> 32-bit product in DX:AX"
  },
  {
    title: "10. DIV & IDIV - Unsigned & Signed Division",
    category: "Arithmetic",
    points: [
      "**DIV (Unsigned)**: `DIV Source` divides unsigned dividend (AX or DX:AX) by divisor.",
      "**IDIV (Signed)**: `IDIV Source` divides 2's complement signed dividend by signed divisor.",
      "**Byte division (8-bit divisor)**: `AL = AX / Source` (Quotient), `AH = AX % Source` (Remainder).",
      "**Word division (16-bit divisor)**: `AX = DX:AX / Source` (Quotient), `DX = DX:AX % Source` (Remainder).",
      "**Sign Extension Requirement**: For IDIV, 16-bit dividend in AX must be sign-extended into DX using `CWD` prior to 16-bit division."
    ],
    notes: [
      "1. Source operand can be a register or memory location, but NOT immediate data.",
      "2. Divide Error Interrupt (Type 0) is generated if divisor is 0 or if quotient overflows destination register (AL > 255 or AX > 65535).",
      "3. All status flags are undefined after DIV/IDIV execution."
    ],
    codeExample: "DIV BL   ; Unsigned AX / BL -> Quotient AL, Remainder AH\nIDIV BL  ; Signed AX / BL -> Signed Quotient AL, Remainder AH\nCWD      ; Sign extend AX into DX prior to 16-bit IDIV\nIDIV CX  ; Signed DX:AX / CX -> Quotient AX, Remainder DX"
  },
  {
    title: "11. Flag Manipulation Instructions",
    category: "Flag",
    points: [
      "Directly modifies or queries the 8086 Status Flags.",
      "• `STC` - Set Carry Flag (CF = 1)",
      "• `CLC` - Clear Carry Flag (CF = 0)",
      "• `CMC` - Complement Carry Flag (CF = ~CF)",
      "• `STD` - Set Direction Flag (DF = 1, strings auto-decrement)",
      "• `CLD` - Clear Direction Flag (DF = 0, strings auto-increment)",
      "• `LAHF` - Copy Low Byte of Flag register directly into AH",
      "• `SAHF` - Copy AH register byte directly into low byte of Flags"
    ],
    notes: [
      "These instructions do not take any operands (implied addressing).",
      "Crucial for controlling string loop behavior (CLD/STD) and preparing carry additions (CLC/STC)."
    ],
    codeExample: "STC  ; Set Carry Flag before ADC\nCLD  ; Clear Direction Flag so string moves advance forward"
  },
  {
    title: "12. Input & Output (IN / OUT) Instructions",
    category: "I/O",
    points: [
      "Transfers data between the accumulator (AL/AX) and peripheral hardware I/O ports.",
      "**Fixed Port (8-bit port)**: `IN AL, 0C8H` / `OUT 3BH, AL`",
      "Allows accessing ports in range 00H to FFH directly.",
      "**Variable Port (16-bit port)**: `IN AL, DX` / `OUT DX, AX`",
      "Uses register DX to hold the port address (0000H to FFFFH)."
    ],
    notes: [
      "1. Transfers always go through accumulator registers AL (8-bit) or AX (16-bit).",
      "2. Does not modify any status flags.",
      "3. Crucial for hardware interface controllers, keyboard input, and LED drivers."
    ],
    codeExample: "MOV DX, 0FF78H ; Preload 16-bit port address into DX\nIN AL, DX      ; Input data byte from port into AL"
  },
  {
    title: "13. String Manipulation Instructions",
    category: "String",
    points: [
      "**MOVSB / MOVSW**: Move string byte/word from DS:SI to ES:DI.",
      "**CMPSB / CMPSW**: Compare string byte/word at DS:SI with ES:DI.",
      "**SCASB / SCASW**: Scan string byte/word in AL/AX against ES:DI.",
      "**LODSB / LODSW**: Load string byte/word from DS:SI into AL/AX.",
      "**STOSB / STOSW**: Store string byte/word from AL/AX into ES:DI."
    ],
    notes: [
      "1. Source index SI is always paired with Data Segment (DS).",
      "2. Destination index DI is strictly paired with Extra Segment (ES).",
      "3. SI and DI are automatically incremented (if DF = 0) or decremented (if DF = 1) after each step."
    ],
    codeExample: "LEA SI, SRC_BUF ; Load source offset into SI\nLEA DI, DST_BUF ; Load dest offset into DI\nMOVSB           ; Transfer 1 byte and auto-adjust SI & DI"
  },
  {
    title: "14. String Repeat Prefixes & Direction Control",
    category: "String",
    points: [
      "**REP**: Repeat string operation while CX != 0.",
      "**REPE / REPZ**: Repeat while Equal / Zero (CX != 0 and ZF = 1).",
      "**REPNE / REPNZ**: Repeat while Not Equal / Not Zero (CX != 0 and ZF = 0).",
      "**CLD**: Clear Direction Flag (DF = 0) for forward processing (SI++, DI++).",
      "**STD**: Set Direction Flag (DF = 1) for backward processing (SI--, DI--)."
    ],
    notes: [
      "1. CX is automatically decremented by 1 after each iteration.",
      "2. REP is used with MOVS and STOS for hardware-accelerated memory block copies.",
      "3. REPE/REPNE are used with CMPS and SCAS for string searching and comparisons."
    ],
    codeExample: "CLD             ; Auto-increment SI and DI\nMOV CX, 0005H   ; Set string length to 5 bytes\nREP MOVSB       ; Copy 5 bytes from DS:SI to ES:DI in hardware loop"
  }
];

export interface OperandAnalysis {
  dstOperand: string;
  dstType: string;
  srcOperand: string;
  srcType: string;
  transferType: string;
  description: string;
}

export interface AddressingModeOption {
  key: string;
  name: string;
  shortName: string;
}

export const ADDRESSING_MODES: AddressingModeOption[] = [
  { key: 'default', name: 'Default (Native Instruction)', shortName: 'Native' },
  { key: 'register', name: 'Register Addressing Mode', shortName: 'Register' },
  { key: 'immediate', name: 'Immediate Addressing Mode', shortName: 'Immediate' },
  { key: 'direct_memory', name: 'Direct Memory Addressing Mode', shortName: 'Direct Mem' },
  { key: 'register_indirect', name: 'Register Indirect Addressing Mode', shortName: 'Reg Indirect' },
  { key: 'based', name: 'Based Addressing Mode', shortName: 'Based' },
  { key: 'indexed', name: 'Indexed Addressing Mode', shortName: 'Indexed' },
  { key: 'based_indexed', name: 'Based-Indexed Addressing Mode', shortName: 'Based-Indexed' },
  { key: 'implied', name: 'Implied / Implicit Addressing Mode', shortName: 'Implied' },
];

export function isAddressingApplicable(opcode?: string): boolean {
  if (!opcode) return true;
  const clean = opcode.trim().replace(/\s+/g, ' ');
  const mnemonic = clean.split(' ')[0].toUpperCase();

  const nonAddressingMnemonics = new Set([
    'XLAT', 'XLATB',
    'CBW', 'CWD',
    'DAA', 'DAS', 'AAA', 'AAS', 'AAM', 'AAD',
    'CLC', 'STC', 'CMC', 'CLD', 'STD', 'CLI', 'STI', 'LAHF', 'SAHF', 'PUSHF', 'POPF',
    'NOP', 'HLT', 'WAIT', 'LOCK', 'ESC',
    'MOVS', 'MOVSB', 'MOVSW', 'CMPS', 'CMPSB', 'CMPSW', 'SCAS', 'SCASB', 'SCASW',
    'LODS', 'LODSB', 'LODSW', 'STOS', 'STOSB', 'STOSW',
    'INTO', 'IRET'
  ]);

  return !nonAddressingMnemonics.has(mnemonic);
}

export function getApplicableAddressingModes(opcode?: string): AddressingModeOption[] {
  if (!opcode) return ADDRESSING_MODES;

  const clean = opcode.replace(/^LOCK\s+/, '').replace(/^REP\s+/, '').trim();
  const mnemonic = clean.split(/\s+/)[0].toUpperCase();

  if (!isAddressingApplicable(opcode)) {
    return [ADDRESSING_MODES[0]]; // 'default'
  }

  // LEA, LDS, LES: Require memory operands (no register-only, no immediate, no implied)
  if (['LEA', 'LDS', 'LES'].includes(mnemonic)) {
    return ADDRESSING_MODES.filter(m =>
      ['default', 'direct_memory', 'register_indirect', 'based', 'indexed', 'based_indexed'].includes(m.key)
    );
  }

  // IN, OUT: Port addressing only (fixed imm port or variable reg DX port)
  if (mnemonic === 'IN' || mnemonic === 'OUT') {
    return ADDRESSING_MODES.filter(m =>
      ['default', 'immediate', 'register'].includes(m.key)
    );
  }

  // XCHG: Register or Memory (No Immediate, No Implied)
  if (mnemonic === 'XCHG') {
    return ADDRESSING_MODES.filter(m =>
      ['default', 'register', 'direct_memory', 'register_indirect', 'based', 'indexed', 'based_indexed'].includes(m.key)
    );
  }

  // INC, DEC, NOT, NEG, MUL, IMUL, DIV, IDIV: Single register/memory operand (No Immediate, No Implied)
  if (['INC', 'DEC', 'NOT', 'NEG', 'MUL', 'IMUL', 'DIV', 'IDIV'].includes(mnemonic)) {
    return ADDRESSING_MODES.filter(m =>
      ['default', 'register', 'direct_memory', 'register_indirect', 'based', 'indexed', 'based_indexed'].includes(m.key)
    );
  }

  // General 2-operand ALU & Data Transfer (MOV, ADD, ADC, SUB, SBB, CMP, AND, OR, XOR, TEST, PUSH, POP, SHL, SHR, SAR, SAL, ROL, ROR, RCL, RCR)
  // Supports: Register, Immediate, Direct Memory, Register Indirect, Based, Indexed, Based-Indexed
  // Does NOT support Implied!
  if (['MOV', 'ADD', 'ADC', 'SUB', 'SBB', 'CMP', 'AND', 'OR', 'XOR', 'TEST', 'PUSH', 'POP', 'SHL', 'SHR', 'SAR', 'SAL', 'ROL', 'ROR', 'RCL', 'RCR'].includes(mnemonic)) {
    return ADDRESSING_MODES.filter(m => m.key !== 'implied');
  }

  // Jumps, Calls, and Relative Loops (JMP, CALL, JA, JAE, JB, JBE, JE, JNE, JG, JGE, JL, JLE, JC, JO, JS, JNP, JP, LOOP, LOOPE, LOOPNE, JCXZ)
  // Relative branching uses Immediate/Relative Displacement or Direct Memory Offset addressing
  if (['JMP', 'CALL', 'JA', 'JAE', 'JB', 'JBE', 'JE', 'JNE', 'JG', 'JGE', 'JL', 'JLE', 'JC', 'JO', 'JS', 'JNP', 'JP', 'LOOP', 'LOOPE', 'LOOPNE', 'JCXZ'].includes(mnemonic)) {
    return ADDRESSING_MODES.filter(m =>
      ['default', 'immediate', 'direct_memory'].includes(m.key)
    );
  }

  // Fallback: filter out 'implied' for standard instructions
  return ADDRESSING_MODES.filter(m => m.key !== 'implied');
}

export function getAddressingModeAnalysis(
  opcode: string,
  modeKey: string,
  defaultOpAnalysis: OperandAnalysis
): { displayOpcode: string; operandAnalysis: OperandAnalysis; formatAddressingName: string } {
  if (!modeKey || modeKey === 'default') {
    return {
      displayOpcode: opcode,
      operandAnalysis: defaultOpAnalysis,
      formatAddressingName: ''
    };
  }

  const clean = (opcode || '').replace(/^LOCK\s+/, '').replace(/^REP\s+/, '').trim();
  const parts = clean.split(/\s+/);
  const mnemonic = parts[0] ? parts[0].toUpperCase() : 'MOV';

  const isJumpOrBranch = ['JMP', 'CALL', 'JA', 'JAE', 'JB', 'JBE', 'JE', 'JNE', 'JG', 'JGE', 'JL', 'JLE', 'JC', 'JO', 'JS', 'JNP', 'JP', 'LOOP', 'LOOPE', 'LOOPNE', 'JCXZ'].includes(mnemonic);
  const isSingleOperandUnary = ['INC', 'DEC', 'NOT', 'NEG'].includes(mnemonic);
  const isSingleOperandMulDiv = ['MUL', 'IMUL', 'DIV', 'IDIV'].includes(mnemonic);

  let dst = 'AX';
  let dstType = '16-bit General Register';
  let src = 'BX';
  let srcType = '16-bit General Register';
  let transferType = 'Register-to-Register Transfer';
  let sampleOp = `${mnemonic} AX, BX`;
  let desc = '';
  let formatAddressingName = '';

  switch (modeKey) {
    case 'register':
      formatAddressingName = 'Register Addressing';
      if (isJumpOrBranch) {
        sampleOp = `${mnemonic} AX`;
        dst = 'AX';
        dstType = '16-bit Register Target Pointer';
        src = '';
        srcType = 'Implicit Code Segment & Instruction Pointer (CS:IP)';
        transferType = 'Register Indirect Branching';
        desc = `Transfers execution control directly to the target address stored in register AX.`;
      } else if (isSingleOperandUnary) {
        sampleOp = `${mnemonic} AX`;
        dst = 'AX';
        dstType = '16-bit General Register';
        src = '';
        srcType = 'Implied Operational Unit';
        transferType = 'Register Unary Operation';
        desc = `Executes ${mnemonic} directly on 16-bit register AX.`;
      } else if (isSingleOperandMulDiv) {
        sampleOp = `${mnemonic} BL`;
        dst = 'AL / AX (Implicit Accumulator)';
        dstType = 'Implicit Accumulator Register';
        src = 'BL';
        srcType = '8-bit General Register Divisor/Multiplicand';
        transferType = 'Register Accumulator Operation';
        desc = `Executes ${mnemonic} using register BL against implicit accumulator (AL/AX).`;
      } else if (mnemonic === 'PUSH') {
        sampleOp = 'PUSH AX';
        dst = 'SS:SP (Stack Top)';
        dstType = 'Stack Pointer Memory Location';
        src = 'AX';
        srcType = '16-bit Register Source';
        transferType = 'Register-to-Stack Allocation';
        desc = `Pushes 16-bit word from register AX onto top of stack (SS:SP).`;
      } else if (mnemonic === 'POP') {
        sampleOp = 'POP DX';
        dst = 'DX';
        dstType = '16-bit Register Destination';
        src = 'SS:SP (Stack Top)';
        srcType = 'Stack Pointer Memory Location';
        transferType = 'Stack-to-Register Deallocation';
        desc = `Pops 16-bit word from top of stack (SS:SP) into register DX.`;
      } else {
        sampleOp = `${mnemonic} AX, BX`;
        dst = 'AX';
        dstType = '16-bit General Register';
        src = 'BX';
        srcType = '16-bit General Register';
        transferType = 'Register-to-Register';
        desc = `Both source (${src}) and destination (${dst}) operands are internal 8086 registers.\n• Advantages: Single machine cycle execution, zero memory bus access.\n• Machine Code: Encoded via ModR/M byte with mod = 11.`;
      }
      break;

    case 'immediate':
      formatAddressingName = 'Immediate Addressing';
      if (isJumpOrBranch) {
        sampleOp = `${mnemonic} 1234H`;
        dst = '1234H';
        dstType = '16-bit Immediate Target Offset Address';
        src = '';
        srcType = 'Implicit Code Segment & Instruction Pointer (CS:IP)';
        transferType = 'Immediate Control Flow Branching';
        desc = `Target offset address (1234H) is specified directly as an immediate constant stored within the instruction stream bytes following the opcode.`;
      } else if (mnemonic === 'PUSH') {
        sampleOp = 'PUSH 1234H';
        dst = 'SS:SP (Stack Top)';
        dstType = 'Stack Pointer Memory Location';
        src = '1234H';
        srcType = '16-bit Immediate Constant Data';
        transferType = 'Immediate-to-Stack Allocation';
        desc = `Pushes immediate 16-bit constant 1234H directly onto top of stack (SS:SP).`;
      } else {
        sampleOp = `${mnemonic} AX, 1234H`;
        dst = 'AX';
        dstType = '16-bit Accumulator Register';
        src = '1234H';
        srcType = '16-bit Immediate Constant Data';
        transferType = 'Immediate-to-Register';
        desc = `Source operand (${src}) is a fixed constant literal stored directly inside the code segment following the opcode byte.\n• Operand fetch: BIU reads constant directly from instruction stream into EU.\n• Restriction: Destination operand CANNOT be an immediate value.`;
      }
      break;

    case 'direct_memory':
      formatAddressingName = 'Direct Memory Addressing';
      if (isJumpOrBranch) {
        sampleOp = `${mnemonic} [2000H]`;
        dst = '[2000H]';
        dstType = 'Direct Memory Target Address Pointer (DS:2000H)';
        src = '';
        srcType = 'Implicit Code Segment & Instruction Pointer (CS:IP)';
        transferType = 'Direct Memory Indirect Branching';
        desc = `Fetches target branch address directly from memory location DS:2000H and updates CS:IP.`;
      } else if (isSingleOperandUnary) {
        sampleOp = `${mnemonic} [2000H]`;
        dst = '[2000H]';
        dstType = 'Direct Memory Location (DS:2000H)';
        src = '';
        srcType = 'Implied Operational Unit';
        transferType = 'Direct Memory Unary Operation';
        desc = `Executes ${mnemonic} on memory location DS:2000H.`;
      } else if (isSingleOperandMulDiv) {
        sampleOp = `${mnemonic} [2000H]`;
        dst = 'AL / AX (Implicit Accumulator)';
        dstType = 'Implicit Accumulator Register';
        src = '[2000H]';
        srcType = 'Direct Memory Location (DS:2000H)';
        transferType = 'Memory Accumulator Operation';
        desc = `Executes ${mnemonic} using memory operand at DS:2000H against implicit accumulator (AL/AX).`;
      } else if (mnemonic === 'PUSH') {
        sampleOp = 'PUSH [2000H]';
        dst = 'SS:SP (Stack Top)';
        dstType = 'Stack Pointer Memory Location';
        src = '[2000H]';
        srcType = 'Direct Memory Location (DS:2000H)';
        transferType = 'Memory-to-Stack Allocation';
        desc = `Pushes word from direct memory location DS:2000H onto stack.`;
      } else if (mnemonic === 'POP') {
        sampleOp = 'POP [2000H]';
        dst = '[2000H]';
        dstType = 'Direct Memory Location (DS:2000H)';
        src = 'SS:SP (Stack Top)';
        srcType = 'Stack Pointer Memory Location';
        transferType = 'Stack-to-Memory Deallocation';
        desc = `Pops 16-bit word from top of stack into direct memory location DS:2000H.`;
      } else {
        sampleOp = `${mnemonic} AX, [2000H]`;
        dst = 'AX';
        dstType = '16-bit Accumulator Register';
        src = '[2000H]';
        srcType = 'Direct Memory Offset (DS:2000H)';
        transferType = 'Direct Memory Read/Write';
        desc = `The 16-bit offset displacement (2000H) is directly encoded within the instruction stream bytes.\n• Physical Address = Data Segment (DS) × 16 + Direct Offset (2000H).\n• Example: Reads 2 consecutive memory bytes starting at address DS:2000H.`;
      }
      break;

    case 'register_indirect':
      formatAddressingName = 'Register Indirect Addressing';
      if (isJumpOrBranch) {
        sampleOp = `${mnemonic} [BX]`;
        dst = '[BX]';
        dstType = 'Register Indirect Target Memory Pointer (DS:BX)';
        src = '';
        srcType = 'Implicit CS:IP';
        transferType = 'Register Indirect Branching';
        desc = `Fetches target branch address from memory location pointed to by register BX.`;
      } else if (isSingleOperandUnary) {
        sampleOp = `${mnemonic} [BX]`;
        dst = '[BX]';
        dstType = 'Register Indirect Pointer (DS:BX)';
        src = '';
        srcType = 'Implied Operational Unit';
        transferType = 'Register Indirect Unary Operation';
        desc = `Executes ${mnemonic} on memory location pointed to by BX.`;
      } else if (isSingleOperandMulDiv) {
        sampleOp = `${mnemonic} [BX]`;
        dst = 'AL / AX (Implicit Accumulator)';
        dstType = 'Implicit Accumulator Register';
        src = '[BX]';
        srcType = 'Register Indirect Pointer (DS:BX)';
        transferType = 'Register Indirect Operation';
        desc = `Executes ${mnemonic} using memory operand at DS:BX against implicit accumulator.`;
      } else if (mnemonic === 'PUSH') {
        sampleOp = 'PUSH [BX]';
        dst = 'SS:SP (Stack Top)';
        dstType = 'Stack Pointer Memory Location';
        src = '[BX]';
        srcType = 'Register Indirect Memory Pointer (DS:BX)';
        transferType = 'Indirect Memory-to-Stack Allocation';
        desc = `Pushes word from memory at DS:BX onto top of stack.`;
      } else if (mnemonic === 'POP') {
        sampleOp = 'POP [BX]';
        dst = '[BX]';
        dstType = 'Register Indirect Memory Pointer (DS:BX)';
        src = 'SS:SP (Stack Top)';
        srcType = 'Stack Pointer Memory Location';
        transferType = 'Stack-to-Indirect Memory Deallocation';
        desc = `Pops word from top of stack into memory at DS:BX.`;
      } else {
        sampleOp = `${mnemonic} AX, [BX]`;
        dst = 'AX';
        dstType = '16-bit General Register';
        src = '[BX]';
        srcType = 'Register Indirect Pointer (DS:BX)';
        transferType = 'Register Indirect Memory Access';
        desc = `Memory offset address is dynamically stored inside pointer register BX (or BP, SI, DI).\n• Effective Address (EA) = (BX).\n• Physical Address = DS × 16 + (BX).\n• Ideal for traversing pointers, arrays, and buffer structures in memory.`;
      }
      break;

    case 'based':
      formatAddressingName = 'Based Addressing';
      if (isSingleOperandUnary) {
        sampleOp = `${mnemonic} [BX + 0008H]`;
        dst = '[BX + 0008H]';
        dstType = 'Based Memory Pointer';
        src = '';
        srcType = 'Implied Operational Unit';
        transferType = 'Based Memory Access';
        desc = `Executes ${mnemonic} on based memory location [BX + 0008H].`;
      } else {
        sampleOp = `${mnemonic} AX, [BX + 0008H]`;
        dst = 'AX';
        dstType = '16-bit General Register';
        src = '[BX + 0008H]';
        srcType = 'Based Memory Pointer with Displacement';
        transferType = 'Based Memory Access';
        desc = `Effective address is computed by adding a base register (BX or BP) to an 8-bit or 16-bit constant displacement.\n• EA = (BX) + 0008H.\n• Default Segment: DS for BX base, SS for BP base.\n• Frequently used to access record or structure fields.`;
      }
      break;

    case 'indexed':
      formatAddressingName = 'Indexed Addressing';
      if (isSingleOperandUnary) {
        sampleOp = `${mnemonic} [SI + 0004H]`;
        dst = '[SI + 0004H]';
        dstType = 'Indexed Memory Pointer';
        src = '';
        srcType = 'Implied Operational Unit';
        transferType = 'Indexed Memory Access';
        desc = `Executes ${mnemonic} on indexed memory location [SI + 0004H].`;
      } else {
        sampleOp = `${mnemonic} AX, [SI + 0004H]`;
        dst = 'AX';
        dstType = '16-bit General Register';
        src = '[SI + 0004H]';
        srcType = 'Indexed Memory Pointer with Displacement';
        transferType = 'Indexed Memory Access';
        desc = `Effective address is computed by adding an index register (SI or DI) to a constant displacement.\n• EA = (SI) + 0004H.\n• Default Segment: DS:SI or DS:DI.\n• Used for indexing elements in arrays or string buffers.`;
      }
      break;

    case 'based_indexed':
      formatAddressingName = 'Based-Indexed Addressing';
      if (isSingleOperandUnary) {
        sampleOp = `${mnemonic} [BX + SI + 0002H]`;
        dst = '[BX + SI + 0002H]';
        dstType = 'Based-Indexed Memory Pointer';
        src = '';
        srcType = 'Implied Operational Unit';
        transferType = 'Based-Indexed Memory Access';
        desc = `Executes ${mnemonic} on based-indexed memory location [BX + SI + 0002H].`;
      } else {
        sampleOp = `${mnemonic} AX, [BX + SI + 0002H]`;
        dst = 'AX';
        dstType = '16-bit General Register';
        src = '[BX + SI + 0002H]';
        srcType = 'Based-Indexed Pointer with Displacement';
        transferType = 'Based-Indexed Memory Access';
        desc = `Effective address combines a base register, index register, and displacement.\n• EA = (BX) + (SI) + 0002H.\n• Physical Address = DS × 16 + EA.\n• Perfect for accessing 2D arrays, matrices, and complex multi-dimensional data structures.`;
      }
      break;

    case 'implied':
      sampleOp = mnemonic;
      dst = 'Implicit Destination (Flags / AL)';
      dstType = 'Internal CPU Register or Status Flag';
      src = 'Implicit Hardware Signal';
      srcType = 'Architectural Hardwired Input';
      transferType = 'Implied Hardware Operation';
      formatAddressingName = 'Implied / Implicit Addressing';
      desc = `Operands are implicitly fixed by the hardware instruction opcode specification.\n• No explicit ModR/M or displacement bytes required.\n• Examples: CLC (CF=0), STC (CF=1), LAHF (AH=Flags), XLAT (AL=DS:[BX+AL]).`;
      break;

    default:
      return {
        displayOpcode: opcode,
        operandAnalysis: defaultOpAnalysis,
        formatAddressingName: ''
      };
  }

  return {
    displayOpcode: sampleOp,
    operandAnalysis: {
      dstOperand: dst,
      dstType,
      srcOperand: src,
      srcType,
      transferType: `${formatAddressingName} (${transferType})`,
      description: desc
    },
    formatAddressingName
  };
}

export function getGeneralFormat(opcode: string): string {
  const op = (opcode || '').trim();

  // Category 1: Data Copy / Transfer
  if (op.startsWith('MOV CX,') || op.startsWith('MOV ')) return 'MOV Destination, Source';
  if (op.startsWith('XCHG ')) return 'XCHG Destination, Source';
  if (op === 'XLAT') return 'XLAT';
  if (op.startsWith('LEA ')) return 'LEA Destination, Source';
  if (op.startsWith('LDS ') || op.startsWith('LES ') || op.startsWith('LDS/LES ')) return 'LDS/LES Destination, Source';
  if (op.startsWith('PUSH ')) return 'PUSH Source';
  if (op.startsWith('POP ')) return 'POP Destination';

  // Category 2: Arithmetic
  if (op.startsWith('ADD ')) return 'ADD Destination, Source';
  if (op.startsWith('ADC ')) return 'ADC Destination, Source';
  if (op.startsWith('SUB ')) return 'SUB Destination, Source';
  if (op.startsWith('SBB ')) return 'SBB Destination, Source';
  if (op.startsWith('MUL ')) return 'MUL Source';
  if (op.startsWith('IMUL ')) return 'IMUL Source';
  if (op.startsWith('DIV ')) return 'DIV Source';
  if (op.startsWith('IDIV ')) return 'IDIV Source';
  if (op.startsWith('INC ')) return 'INC Destination';
  if (op.startsWith('DEC ')) return 'DEC Destination';
  if (op.startsWith('CMP ')) return 'CMP Destination, Source';
  if (op === 'AAA') return 'AAA';
  if (op === 'AAS') return 'AAS';
  if (op === 'AAM') return 'AAM';
  if (op === 'AAD') return 'AAD';
  if (op === 'DAA') return 'DAA';
  if (op === 'DAS') return 'DAS';
  if (op === 'CBW') return 'CBW';
  if (op === 'CWD') return 'CWD';

  // Category 3: Logical
  if (op.startsWith('AND ')) return 'AND Destination, Source';
  if (op.startsWith('OR ')) return 'OR Destination, Source';
  if (op.startsWith('NOT ')) return 'NOT Destination';
  if (op.startsWith('NEG ')) return 'NEG Destination';
  if (op.startsWith('XOR ')) return 'XOR Destination, Source';
  if (op.startsWith('TEST ')) return 'TEST Destination, Source';

  // Category 4: Branch
  if (op.startsWith('JA ')) return 'JA Target';
  if (op.startsWith('JAE ')) return 'JAE Target';
  if (op.startsWith('JB ')) return 'JB Target';
  if (op.startsWith('JBE ')) return 'JBE Target';
  if (op.startsWith('JE ')) return 'JE Target';
  if (op.startsWith('JNE ')) return 'JNE Target';
  if (op.startsWith('JG ')) return 'JG Target';
  if (op.startsWith('JGE ')) return 'JGE Target';
  if (op.startsWith('JL ')) return 'JL Target';
  if (op.startsWith('JLE ')) return 'JLE Target';
  if (op.startsWith('JC ')) return 'JC Target';
  if (op.startsWith('JO ')) return 'JO Target';
  if (op.startsWith('JS ')) return 'JS Target';
  if (op.startsWith('JNP ')) return 'JNP Target';
  if (op.startsWith('JP ')) return 'JP Target';
  if (op.startsWith('JMP ')) return 'JMP Target';
  if (op.startsWith('CALL ')) return 'CALL Target';
  if (op === 'RET') return 'RET';

  // Category 5: Loop
  if (op.startsWith('LOOPE ')) return 'LOOPE Target';
  if (op.startsWith('LOOPNE ')) return 'LOOPNE Target';
  if (op.startsWith('JCXZ ')) return 'JCXZ Target';
  if (op.startsWith('LOOP ')) return 'LOOP Target';

  // Category 6: Machine Control
  if (op === 'HLT') return 'HLT';
  if (op.startsWith('LOCK')) return 'LOCK';
  if (op === 'NOP') return 'NOP';
  if (op.startsWith('ESC ')) return 'ESC External Opcode, Source';
  if (op === 'WAIT') return 'WAIT';

  // Category 7: Flag Manipulation
  if (op === 'STC') return 'STC';
  if (op === 'CLC') return 'CLC';
  if (op === 'CMC') return 'CMC';
  if (op === 'STD') return 'STD';
  if (op === 'CLD') return 'CLD';
  if (op === 'STI') return 'STI';
  if (op === 'CLI') return 'CLI';
  if (op === 'LAHF') return 'LAHF';
  if (op === 'SAHF') return 'SAHF';

  // Category 8: Shift & Rotate
  if (op.startsWith('SHL ')) return 'SHL Destination, Count';
  if (op.startsWith('SAL ')) return 'SAL Destination, Count';
  if (op.startsWith('SHR ')) return 'SHR Destination, Count';
  if (op.startsWith('SAR ')) return 'SAR Destination, Count';
  if (op.startsWith('ROL ')) return 'ROL Destination, Count';
  if (op.startsWith('ROR ')) return 'ROR Destination, Count';
  if (op.startsWith('RCL ')) return 'RCL Destination, Count';
  if (op.startsWith('RCR ')) return 'RCR Destination, Count';

  // Category 9: String & Port I/O
  if (op === 'MOVS' || op === 'MOVSB' || op === 'MOVSW') return 'MOVS/MOVSB/MOVSW';
  if (op === 'LODS' || op === 'LODSB' || op === 'LODSW') return 'LODS';
  if (op === 'STOS' || op === 'STOSB' || op === 'STOSW') return 'STOS';
  if (op === 'CMPS' || op === 'CMPSB' || op === 'CMPSW') return 'CMPS';
  if (op === 'SCAS' || op === 'SCASB' || op === 'SCASW') return 'SCAS';
  if (op.startsWith('REP')) return 'REP';
  if (op.startsWith('IN ')) return 'IN Accumulator, Port';
  if (op.startsWith('OUT ')) return 'OUT Port, Accumulator';

  return op;
}

export function byteHexFormat(val: number): string {
  return (val & 0xFF).toString(16).toUpperCase().padStart(2, '0') + 'H';
}

export function hexFormat(val: number): string {
  return (val & 0xFFFF).toString(16).toUpperCase().padStart(4, '0') + 'H';
}

export function getDisplayOpcode(opcode: string, _aluValB?: number): string {
  if (!opcode) return '';
  return opcode;
}

export function getOperandAnalysis(opcode: string): OperandAnalysis {
  const op = opcode.trim();

  if (op.startsWith('MOV CX,')) {
    const srcVal = op.split(',')[1]?.trim() || '037AH';
    return {
      dstOperand: 'CX',
      dstType: '16-bit General Register',
      srcOperand: srcVal,
      srcType: '16-bit Immediate Constant Data',
      transferType: 'Immediate-to-Register Transfer',
      description: `Loads raw 16-bit constant ${srcVal} directly into CX register.`
    };
  }
  if (op.startsWith('XCHG AX,')) {
    const srcVal = op.split(',')[1]?.trim() || 'BX';
    return {
      dstOperand: 'AX',
      dstType: '16-bit Accumulator Register',
      srcOperand: srcVal,
      srcType: srcVal.endsWith('H') ? '16-bit Immediate Constant Data' : '16-bit Base Register',
      transferType: 'Atomic Register Swap',
      description: `Exchanges the 16-bit value stored in AX with ${srcVal}.`
    };
  }
  if (op === 'XLAT') {
    return {
      dstOperand: 'AL',
      dstType: '8-bit Low Accumulator Register',
      srcOperand: 'DS:[BX + AL]',
      srcType: 'Indirect Table Lookup Memory Address',
      transferType: 'Table Lookup Translation',
      description: 'Uses BX as base table address and AL as offset index; writes byte entry back into AL.'
    };
  }
  if (op.startsWith('PUSH')) {
    return {
      dstOperand: 'SS:SP (Stack Top)',
      dstType: 'Stack Segment Memory Pointer',
      srcOperand: op.split(' ')[1] || 'AX',
      srcType: '16-bit Register',
      transferType: 'Register to Stack Allocation',
      description: 'Decrements SP by 2 and writes 16-bit word from register into stack memory.'
    };
  }
  if (op.startsWith('POP')) {
    return {
      dstOperand: op.split(' ')[1] || 'DX',
      dstType: '16-bit Register',
      srcOperand: 'SS:SP (Stack Top)',
      srcType: 'Stack Segment Memory Pointer',
      transferType: 'Stack Memory Deallocation',
      description: 'Reads 16-bit word from top of stack into register and increments SP by 2.'
    };
  }
  if (op.startsWith('LEA')) {
    return {
      dstOperand: 'BX',
      dstType: '16-bit General Register',
      srcOperand: '[SI + 0004H]',
      srcType: 'Effective Memory Address Offset Calculation',
      transferType: 'Address Calculation (No Memory Read)',
      description: 'Calculates offset address (SI + 0004H) and stores the offset value directly in BX.'
    };
  }
  if (op.startsWith('LDS') || op.startsWith('LES')) {
    const isLds = op.startsWith('LDS');
    return {
      dstOperand: `${isLds ? 'DS' : 'ES'} & ${op.split(' ')[1]}`,
      dstType: 'Segment Register & Index Register Pair',
      srcOperand: '[2000H]',
      srcType: '32-bit Far Pointer in Data Segment Memory',
      transferType: 'Far Pointer Memory Load',
      description: `Loads 16-bit offset into ${op.split(' ')[1]} and 16-bit segment selector into ${isLds ? 'DS' : 'ES'}.`
    };
  }
  if (op.startsWith('MOVSB')) {
    return {
      dstOperand: 'ES:DI',
      dstType: 'Extra Segment Memory Pointer (DI)',
      srcOperand: 'DS:SI',
      srcType: 'Data Segment Memory Pointer (SI)',
      transferType: 'String Memory Byte Copy',
      description: 'Transfers 1 byte from DS:SI memory to ES:DI memory, auto-adjusting SI and DI.'
    };
  }
  if (op.startsWith('MOVSW')) {
    return {
      dstOperand: 'ES:DI',
      dstType: 'Extra Segment Memory Pointer (DI)',
      srcOperand: 'DS:SI',
      srcType: 'Data Segment Memory Pointer (SI)',
      transferType: 'String Memory Word Copy (16-bit)',
      description: 'Transfers 2 bytes (word) from DS:SI to ES:DI, auto-adjusting SI and DI by 2.'
    };
  }
  if (op.startsWith('CMPSB')) {
    return {
      dstOperand: 'DS:SI',
      dstType: 'Data Segment Source String Pointer',
      srcOperand: 'ES:DI',
      srcType: 'Extra Segment Dest String Pointer',
      transferType: 'String Memory Byte Comparison',
      description: 'Compares byte at DS:SI with byte at ES:DI without modifying operands, updating flags.'
    };
  }
  if (op.startsWith('SCASB')) {
    return {
      dstOperand: 'ES:DI',
      dstType: 'Extra Segment Destination Memory Pointer',
      srcOperand: 'AL',
      srcType: '8-bit Low Accumulator Register',
      transferType: 'Accumulator vs String Memory Scan',
      description: 'Compares byte in AL against memory byte at ES:DI and updates status flags.'
    };
  }
  if (op.startsWith('LODSB')) {
    return {
      dstOperand: 'AL',
      dstType: '8-bit Low Accumulator Register',
      srcOperand: 'DS:SI',
      srcType: 'Data Segment Source Memory Pointer',
      transferType: 'String Memory Load to Accumulator',
      description: 'Loads byte from memory at DS:SI into AL and auto-adjusts SI.'
    };
  }
  if (op.startsWith('STOSB')) {
    return {
      dstOperand: 'ES:DI',
      dstType: 'Extra Segment Destination Memory Pointer',
      srcOperand: 'AL',
      srcType: '8-bit Low Accumulator Register',
      transferType: 'Accumulator Store to String Memory',
      description: 'Stores byte from AL into memory at ES:DI and auto-adjusts DI.'
    };
  }
  if (op.startsWith('REP MOVSB')) {
    return {
      dstOperand: 'ES:DI',
      dstType: 'Extra Segment Memory Pointer (DI)',
      srcOperand: 'DS:SI',
      srcType: 'Data Segment Memory Pointer (SI)',
      transferType: 'Hardware Repeated String Copy (CX times)',
      description: 'Repeats MOVSB instruction in hardware loop while CX != 0, auto-decrementing CX.'
    };
  }
  if (op === 'CLD' || op === 'STD') {
    return {
      dstOperand: 'DF Flag',
      dstType: 'Processor Status Direction Flag',
      srcOperand: op === 'CLD' ? '0 (Clear)' : '1 (Set)',
      srcType: 'Immediate Flag Status Bit',
      transferType: 'Processor Control Flag Modification',
      description: op === 'CLD' ? 'Clears DF (0) for forward string pointer auto-increment.' : 'Sets DF (1) for backward string pointer auto-decrement.'
    };
  }
  if (op === 'DAA' || op === 'DAS' || op === 'AAA' || op === 'AAS') {
    return {
      dstOperand: op.startsWith('AA') ? 'AX (AH:AL)' : 'AL',
      dstType: op.startsWith('AA') ? '16-bit Unpacked BCD Accumulator Pair' : '8-bit Packed BCD Accumulator',
      srcOperand: 'Implicit AL & AF/CF Flags',
      srcType: 'Internal Status Flags & Lower Nibble',
      transferType: 'Decimal / BCD Arithmetic Adjust',
      description: 'Adjusts the result in AL/AX after binary arithmetic to form valid BCD/ASCII digits.'
    };
  }
  if (op === 'AAM' || op === 'AAD') {
    return {
      dstOperand: 'AX (AH & AL)',
      dstType: '16-bit Unpacked BCD Register Pair',
      srcOperand: op === 'AAM' ? 'AL & Immediate 10 (0AH)' : 'AX & Immediate 10 (0AH)',
      srcType: 'Accumulator & Base 10 Constant',
      transferType: 'Unpacked BCD Multiply / Divide Adjust',
      description: op === 'AAM' ? 'Converts binary product in AL into AH=Quotient (tens) and AL=Remainder (units).' : 'Combines AH and AL unpacked BCD digits into binary in AL prior to division.'
    };
  }
  if (op.startsWith('IN AL')) {
    return {
      dstOperand: 'AL',
      dstType: '8-bit Low Accumulator Register',
      srcOperand: 'DX',
      srcType: '16-bit I/O Port Address Register',
      transferType: 'I/O Bus Input Read',
      description: 'Reads an 8-bit byte from peripheral I/O port address in DX into AL.'
    };
  }
  if (op.startsWith('OUT DX')) {
    return {
      dstOperand: 'DX',
      dstType: '16-bit I/O Port Address Register',
      srcOperand: 'AL',
      srcType: '8-bit Low Accumulator Register',
      transferType: 'I/O Bus Output Write',
      description: 'Sends an 8-bit byte from AL out to the peripheral I/O port address in DX.'
    };
  }

  // Check for general placeholder opcodes like "ADD Destination, Source" or general ADD/ADC/SUB/SBB/AND/OR/XOR
  if (op.includes('Destination') || op.includes('Source')) {
    return {
      dstOperand: 'Destination (Register or Memory)',
      dstType: 'Register or Memory Location',
      srcOperand: 'Source (Immediate, Register, or Memory)',
      srcType: 'Immediate Constant, Register, or Memory',
      transferType: '8086 Architecture Rules',
      description: '1. Operand Size Rule: Both Source and Destination must be of the same size (8-bit or 16-bit).\n2. Allowed Source Types: Immediate value, Register, or Memory location.\n3. Allowed Destination Types: Register or Memory location (Direct memory-to-memory operations not allowed; destination cannot be an immediate value).\n4. Flags Affected: CF, AF, SF, ZF, PF, OF.'
    };
  }

  // Fallback parser for general binary arithmetic / logical instructions
  const parts = op.split(' ');
  const mnemonic = parts[0];
  const operands = parts.slice(1).join(' ').split(',').map(s => s.trim());
  const dst = operands[0] || 'AL/AX';
  const src = operands[1] || 'Implied';

  let dstType = 'Register / Memory Operand';
  if (dst.startsWith('AX') || dst.startsWith('BX') || dst.startsWith('CX') || dst.startsWith('DX')) dstType = '16-bit General Register';
  else if (dst.startsWith('AL') || dst.startsWith('BL') || dst.startsWith('CL') || dst.startsWith('DL') || dst.startsWith('AH') || dst.startsWith('BH') || dst.startsWith('CH') || dst.startsWith('DH')) dstType = '8-bit Byte Register';
  else if (dst.startsWith('[')) dstType = 'Memory Offset Address';

  let srcType = 'Register / Constant / Memory Operand';
  if (src.endsWith('H') || !isNaN(Number(src))) srcType = 'Immediate Constant Value';
  else if (src.startsWith('AX') || src.startsWith('BX') || src.startsWith('CX') || src.startsWith('DX')) srcType = '16-bit General Register';
  else if (src.startsWith('AL') || src.startsWith('BL') || src.startsWith('CL') || src.startsWith('DL')) srcType = '8-bit Byte Register';
  else if (src.startsWith('[')) srcType = 'Memory Offset Address';

  // Single operand unary instructions (INC, DEC, NOT, NEG)
  if (['INC', 'DEC', 'NOT', 'NEG'].includes(mnemonic)) {
    return {
      dstOperand: dst,
      dstType,
      srcOperand: 'Implied (1 / Bitwise)',
      srcType: 'Internal Operation',
      transferType: `${mnemonic} Operation`,
      description: `Performs ${mnemonic} on ${dst}.`
    };
  }

  // Single operand multiplication / division (MUL, IMUL, DIV, IDIV)
  if (['MUL', 'IMUL', 'DIV', 'IDIV'].includes(mnemonic)) {
    return {
      dstOperand: 'AX / DX:AX (Implicit Accumulator)',
      dstType: 'Implicit Accumulator Register',
      srcOperand: dst,
      srcType: dstType,
      transferType: `${mnemonic} Operation`,
      description: `Performs ${mnemonic} using ${dst} as source operand against implicit accumulator.`
    };
  }

  // Loop instructions
  if (['LOOP', 'LOOPE', 'LOOPNE', 'JCXZ'].includes(mnemonic)) {
    return {
      dstOperand: dst || 'Target Offset',
      dstType: 'Relative Target Offset Address',
      srcOperand: 'CX Register & ZF Flag',
      srcType: '16-bit Counter Register & Zero Flag',
      transferType: 'Conditional Loop Branching',
      description: `Decrements CX counter and branches to target offset ${dst} if loop conditions are satisfied.`
    };
  }

  // Branch & Jump instructions
  if (['JMP', 'CALL', 'JA', 'JAE', 'JB', 'JBE', 'JE', 'JNE', 'JG', 'JGE', 'JL', 'JLE', 'JC', 'JO', 'JS', 'JNP', 'JP'].includes(mnemonic)) {
    return {
      dstOperand: dst || 'Target Offset',
      dstType: 'Target Code Segment Offset Address',
      srcOperand: 'FLAGS Register (CF, ZF, SF, OF)',
      srcType: 'Processor Status Flags',
      transferType: 'Control Flow Branching',
      description: `Transfers execution to target offset ${dst} based on processor status flags.`
    };
  }

  // Flag manipulation instructions
  if (['STC', 'CLC', 'CMC', 'STI', 'CLI', 'LAHF', 'SAHF', 'CLD', 'STD'].includes(mnemonic)) {
    return {
      dstOperand: 'FLAGS Register',
      dstType: 'Processor Status & Control Flags',
      srcOperand: 'Implied Flag Bit',
      srcType: 'Immediate Flag Control Bit',
      transferType: 'Flag State Update',
      description: `Executes ${mnemonic} to update processor status/control flags.`
    };
  }

  // Control / Machine instructions
  if (['HLT', 'NOP', 'RET', 'CBW', 'CWD', 'WAIT', 'LOCK', 'ESC'].includes(mnemonic)) {
    return {
      dstOperand: 'Processor State',
      dstType: 'Internal Control Register',
      srcOperand: 'Implied',
      srcType: 'Control Signal',
      transferType: 'Machine State Control',
      description: `Executes processor control operation ${mnemonic}.`
    };
  }

  // Comprehensive 8086 architecture rules for binary arithmetic/logic
  const isArithmeticOrLogic = ['ADD', 'ADC', 'SUB', 'SBB', 'CMP', 'AND', 'OR', 'XOR'].includes(mnemonic);
  const archRulesDesc = isArithmeticOrLogic
    ? `Performs ${mnemonic} operation on ${dst} using ${src}.\n\n8086 Architecture Rules:\n1. Operand Size Rule: Source and Destination must be of the same size (8-bit or 16-bit).\n2. Allowed Source Types: Immediate value, Register, or Memory location.\n3. Allowed Destination Types: Register or Memory location (Memory-to-memory operations are not allowed; destination cannot be immediate).\n4. Flags Affected: CF, AF, SF, ZF, PF, OF.`
    : `Performs ${mnemonic} using ${dst} as destination and ${src} as source.`;

  return {
    dstOperand: dst,
    dstType,
    srcOperand: src,
    srcType,
    transferType: isArithmeticOrLogic ? '8086 ALU & Operand Architecture Rules' : `${mnemonic} Operation`,
    description: archRulesDesc
  };
}

export function getInstNameInfo(opcode: string): { name: string; full: string } {
  const clean = opcode.replace(/^LOCK\s+/, '').replace(/^REP\s+/, '');
  const mnemonic = clean.split(' ')[0].toUpperCase();
  
  const map: Record<string, { name: string; full: string }> = {
    'ADD': { name: 'ADD', full: 'Addition' },
    'ADC': { name: 'ADC', full: 'Add with Carry' },
    'SUB': { name: 'SUB', full: 'Subtraction' },
    'SBB': { name: 'SBB', full: 'Subtract with Borrow' },
    'INC': { name: 'INC', full: 'Increment by 1' },
    'DEC': { name: 'DEC', full: 'Decrement by 1' },
    'MUL': { name: 'MUL', full: 'Unsigned Multiplication' },
    'IMUL': { name: 'IMUL', full: 'Signed Multiplication (2\'s Complement)' },
    'DIV': { name: 'DIV', full: 'Unsigned Division' },
    'IDIV': { name: 'IDIV', full: 'Signed Division (2\'s Complement)' },
    'CMP': { name: 'CMP', full: 'Compare Operands' },
    'MOV': { name: 'MOV', full: 'Move / Copy Data' },
    'XCHG': { name: 'XCHG', full: 'Exchange Operands' },
    'PUSH': { name: 'PUSH', full: 'Push onto Stack' },
    'POP': { name: 'POP', full: 'Pop from Stack' },
    'LEA': { name: 'LEA', full: 'Load Effective Address' },
    'LDS': { name: 'LDS', full: 'Load Pointer using DS' },
    'LES': { name: 'LES', full: 'Load Pointer using ES' },
    'XLAT': { name: 'XLAT', full: 'Translate Byte in AL' },
    'DAA': { name: 'DAA', full: 'Decimal Adjust AL after Addition' },
    'DAS': { name: 'DAS', full: 'Decimal Adjust AL after Subtraction' },
    'AAA': { name: 'AAA', full: 'ASCII Adjust AL after Addition' },
    'AAS': { name: 'AAS', full: 'ASCII Adjust AL after Subtraction' },
    'AAM': { name: 'AAM', full: 'ASCII Adjust AX after Multiply' },
    'AAD': { name: 'AAD', full: 'ASCII Adjust AX before Division' },
    'AND': { name: 'AND', full: 'Bitwise Logical AND' },
    'OR': { name: 'OR', full: 'Bitwise Logical OR' },
    'XOR': { name: 'XOR', full: 'Bitwise Logical XOR' },
    'NOT': { name: 'NOT', full: 'Bitwise Invert / One\'s Complement' },
    'NEG': { name: 'NEG', full: 'Two\'s Complement Negation' },
    'TEST': { name: 'TEST', full: 'Logical Compare (TEST)' },
    'SHL': { name: 'SHL', full: 'Shift Logical Left' },
    'SAL': { name: 'SAL', full: 'Shift Arithmetic Left' },
    'SHR': { name: 'SHR', full: 'Shift Logical Right' },
    'SAR': { name: 'SAR', full: 'Shift Arithmetic Right' },
    'ROL': { name: 'ROL', full: 'Rotate Left' },
    'ROR': { name: 'ROR', full: 'Rotate Right' },
    'RCL': { name: 'RCL', full: 'Rotate Left through Carry' },
    'RCR': { name: 'RCR', full: 'Rotate Right through Carry' },
    'STC': { name: 'STC', full: 'Set Carry Flag' },
    'CLC': { name: 'CLC', full: 'Clear Carry Flag' },
    'CMC': { name: 'CMC', full: 'Complement Carry Flag' },
    'STD': { name: 'STD', full: 'Set Direction Flag' },
    'CLD': { name: 'CLD', full: 'Clear Direction Flag' },
    'STI': { name: 'STI', full: 'Set Interrupt Enable Flag' },
    'CLI': { name: 'CLI', full: 'Clear Interrupt Enable Flag' },
    'LAHF': { name: 'LAHF', full: 'Load AH from Flags' },
    'SAHF': { name: 'SAHF', full: 'Store AH into Flags' },
    'HLT': { name: 'HLT', full: 'Halt Processor' },
    'NOP': { name: 'NOP', full: 'No Operation' },
    'ESC': { name: 'ESC', full: 'Escape to Coprocessor' },
    'WAIT': { name: 'WAIT', full: 'Wait for Coprocessor' },
    'JA': { name: 'JA', full: 'Jump if Above (CF=0 & ZF=0)' },
    'JAE': { name: 'JAE', full: 'Jump if Above or Equal (CF=0)' },
    'JB': { name: 'JB', full: 'Jump if Below (CF=1)' },
    'JBE': { name: 'JBE', full: 'Jump if Below or Equal (CF=1 or ZF=1)' },
    'JE': { name: 'JE', full: 'Jump if Equal / Zero (ZF=1)' },
    'JNE': { name: 'JNE', full: 'Jump if Not Equal / Not Zero (ZF=0)' },
    'JG': { name: 'JG', full: 'Jump if Greater (ZF=0 & SF=OF)' },
    'JGE': { name: 'JGE', full: 'Jump if Greater or Equal (SF=OF)' },
    'JL': { name: 'JL', full: 'Jump if Less (SF ≠ OF)' },
    'JLE': { name: 'JLE', full: 'Jump if Less or Equal (ZF=1 or SF ≠ OF)' },
    'JC': { name: 'JC', full: 'Jump if Carry (CF=1)' },
    'JO': { name: 'JO', full: 'Jump if Overflow (OF=1)' },
    'JS': { name: 'JS', full: 'Jump if Sign (SF=1)' },
    'JNP': { name: 'JNP', full: 'Jump if No Parity (PF=0)' },
    'JP': { name: 'JP', full: 'Jump if Parity Even (PF=1)' },
    'IN': { name: 'IN', full: 'Input Byte/Word from Port' },
    'OUT': { name: 'OUT', full: 'Output Byte/Word to Port' },
    'JMP': { name: 'JMP', full: 'Unconditional Jump' },
    'LOOP': { name: 'LOOP', full: 'Loop According to CX Counter' },
    'LOOPE': { name: 'LOOPE', full: 'Loop while Equal / Zero (ZF=1)' },
    'LOOPNE': { name: 'LOOPNE', full: 'Loop while Not Equal / Not Zero (ZF=0)' },
    'JCXZ': { name: 'JCXZ', full: 'Jump if CX Register is Zero' },
    'CALL': { name: 'CALL', full: 'Call Subroutine / Procedure' },
    'RET': { name: 'RET', full: 'Return from Subroutine' },
    'CBW': { name: 'CBW', full: 'Convert Byte to Word (Sign Extend AL)' },
    'CWD': { name: 'CWD', full: 'Convert Word to Doubleword (Sign Extend AX)' },
    'MOVSB': { name: 'MOVSB', full: 'Move String Byte' },
    'MOVSW': { name: 'MOVSW', full: 'Move String Word' },
    'CMPSB': { name: 'CMPSB', full: 'Compare String Bytes' },
    'SCASB': { name: 'SCASB', full: 'Scan String Byte' },
    'LODSB': { name: 'LODSB', full: 'Load String Byte' },
    'STOSB': { name: 'STOSB', full: 'Store String Byte' },
  };

  if (opcode.startsWith('REP')) {
    const nextWord = clean.split(' ')[1]?.toUpperCase() || mnemonic;
    return { name: 'REP ' + nextWord, full: `Repeat ${map[nextWord]?.full || nextWord}` };
  }
  if (opcode.startsWith('LOCK')) {
    const nextWord = clean.split(' ')[1]?.toUpperCase() || mnemonic;
    return { name: 'LOCK ' + nextWord, full: `Bus Lock ${map[nextWord]?.full || nextWord}` };
  }

  return map[mnemonic] || { name: mnemonic, full: `${mnemonic} Operation` };
}

export function getSlideIndexForOpcode(opcode: string): number {
  const op = opcode.trim();
  if (op.startsWith('MOV CX')) return 3; 
  if (op.startsWith('XCHG')) return 5;   
  if (op.startsWith('XLAT')) return 6;   
  if (op.startsWith('LEA')) return 7;    
  if (op.startsWith('LDS') || op.startsWith('LES')) return 8;    
  if (op.startsWith('PUSH')) return 9;   
  if (op.startsWith('POP')) return 9;    
  if (op.startsWith('ADD') || op.startsWith('ADC') || op.startsWith('INC')) return 10; 
  if (op.startsWith('SUB') || op.startsWith('SBB') || op.startsWith('DEC') || op.startsWith('NEG') || op.startsWith('CMP')) return 11; 
  if (op.startsWith('MUL') || op.startsWith('IMUL')) return 12;   
  if (op.startsWith('DIV') || op.startsWith('IDIV') || op.startsWith('CBW') || op.startsWith('CWD')) return 13;   
  if (op.startsWith('STC') || op.startsWith('CLC') || op.startsWith('CMC') || op.startsWith('STD') || op.startsWith('CLD') || op.startsWith('STI') || op.startsWith('CLI') || op.startsWith('LAHF') || op.startsWith('SAHF')) return 14;   
  if (op.startsWith('IN AL') || op.startsWith('OUT DX')) return 15; 
  if (op.startsWith('LOCK') || op.startsWith('HLT') || op.startsWith('NOP') || op.startsWith('ESC') || op.startsWith('WAIT')) return 14;  
  if (op.startsWith('MOVS') || op.startsWith('CMPS') || op.startsWith('SCAS') || op.startsWith('LODS') || op.startsWith('STOS')) return 16;
  if (op.startsWith('REP')) return 17;
  return 0; 
}

export interface GeneralExplanationInfo {
  generalSyntax: string;
  whatItDoes: string;
  flagsAffected: string;
  flagsBadgeColor: string;
  rules: string[];
}

export function getGeneralExplanation(opcode: string, fallbackDesc?: string): GeneralExplanationInfo {
  const clean = opcode.trim().replace(/\s+/g, ' ');
  const mnemonic = clean.split(' ')[0].toUpperCase();

  switch (mnemonic) {
    case 'MOV':
      return {
        generalSyntax: 'MOV Destination, Source',
        whatItDoes: 'Copies data from the Source operand into the Destination operand. The Source operand remains unchanged, while the previous value in the Destination operand is overwritten.',
        flagsAffected: 'None (Flags remain unchanged)',
        flagsBadgeColor: 'emerald',
        rules: [
          'Source and Destination operands must be of the same size (both 8-bit or both 16-bit).',
          'Memory-to-Memory transfers are NOT allowed (e.g. MOV [SI], [DI] is invalid).',
          'Immediate constants can only serve as a Source, NEVER as a Destination.',
          'Code Segment register (CS) CANNOT be used as a Destination operand.',
          'Immediate values cannot be loaded directly into Segment registers (e.g. MOV DS, 1000H is invalid; use MOV AX, 1000H then MOV DS, AX).'
        ]
      };
    case 'XCHG':
      return {
        generalSyntax: 'XCHG Destination, Source',
        whatItDoes: 'Exchanges (swaps) the contents of the Destination operand and Source operand. Both operands must be registers or one register and one memory location.',
        flagsAffected: 'None (Flags remain unchanged)',
        flagsBadgeColor: 'emerald',
        rules: [
          'Operands must be of identical size (8-bit or 16-bit).',
          'Cannot swap memory-to-memory directly.',
          'Segment registers (CS, DS, SS, ES) CANNOT be used with XCHG.',
          'Immediate values CANNOT be used with XCHG.'
        ]
      };
    case 'LEA':
      return {
        generalSyntax: 'LEA Register, Memory',
        whatItDoes: 'Calculates the 16-bit Effective Address (offset) of the memory operand and loads it directly into the destination 16-bit register, without accessing memory contents.',
        flagsAffected: 'None (Flags remain unchanged)',
        flagsBadgeColor: 'emerald',
        rules: [
          'Destination MUST be a 16-bit general-purpose or index/pointer register (AX, BX, CX, DX, SI, DI, BP, SP).',
          'Source MUST be a memory address reference (e.g. [BX + SI], PRICES, [BP + 4]).',
          'Only computes address offset, does NOT read data from memory.'
        ]
      };
    case 'LDS':
    case 'LES':
      return {
        generalSyntax: `${mnemonic} Register, Memory`,
        whatItDoes: `Reads a 32-bit far pointer from memory: loads the 16-bit offset into the destination register, and the 16-bit segment value into ${mnemonic === 'LDS' ? 'DS' : 'ES'}.`,
        flagsAffected: 'None (Flags remain unchanged)',
        flagsBadgeColor: 'emerald',
        rules: [
          'Destination MUST be a 16-bit register.',
          'Source MUST be a memory doubleword location containing [Offset, Segment].'
        ]
      };
    case 'XLAT':
    case 'XLATB':
      return {
        generalSyntax: 'XLAT / XLATB',
        whatItDoes: 'Translates a byte in AL by looking up a byte in a table located at DS:[BX + AL]. The translated byte replaces the value in AL.',
        flagsAffected: 'None (Flags remain unchanged)',
        flagsBadgeColor: 'emerald',
        rules: [
          'AL serves as the lookup index (0–255).',
          'BX MUST hold the base offset address of the lookup table in Data Segment (DS).',
          'Implicitly operates on AL and DS:BX without explicit operand listing.'
        ]
      };
    case 'PUSH':
      return {
        generalSyntax: 'PUSH Source',
        whatItDoes: 'Decrements the Stack Pointer (SP) by 2 bytes, then copies the 16-bit Source operand onto the top of the stack at memory location SS:SP.',
        flagsAffected: 'None (Flags remain unchanged)',
        flagsBadgeColor: 'emerald',
        rules: [
          'Operates ONLY on 16-bit word operands (16-bit register, segment register, or memory word).',
          'Immediate constants cannot be pushed directly in standard 8086.',
          'CS register CAN be pushed to save code segment context.'
        ]
      };
    case 'POP':
      return {
        generalSyntax: 'POP Destination',
        whatItDoes: 'Copies the 16-bit word from the top of the stack (SS:SP) into the Destination operand, then increments Stack Pointer (SP) by 2 bytes.',
        flagsAffected: clean.startsWith('POPF') ? 'ALL Flags (CF, ZF, SF, OF, PF, AF, IF, DF, TF)' : 'None (Flags remain unchanged)',
        flagsBadgeColor: clean.startsWith('POPF') ? 'amber' : 'emerald',
        rules: [
          'Destination MUST be a 16-bit register or memory word.',
          'CS register CANNOT be used as a POP destination.',
          'POPF pops stack word directly into the FLAGS register.'
        ]
      };
    case 'ADD':
    case 'ADC':
      return {
        generalSyntax: `${mnemonic} Destination, Source`,
        whatItDoes: mnemonic === 'ADC' 
          ? 'Adds Source operand and the Carry Flag (CF) to Destination operand (Destination = Destination + Source + CF).' 
          : 'Adds Source operand to Destination operand and stores the sum in Destination (Destination = Destination + Source).',
        flagsAffected: 'CF, ZF, SF, OF, PF, AF (All 6 status flags updated)',
        flagsBadgeColor: 'amber',
        rules: [
          'Operands must match in size (both 8-bit or both 16-bit).',
          'Destination cannot be an immediate value.',
          'Memory-to-memory addition is not supported.'
        ]
      };
    case 'SUB':
    case 'SBB':
      return {
        generalSyntax: `${mnemonic} Destination, Source`,
        whatItDoes: mnemonic === 'SBB' 
          ? 'Subtracts Source operand and Carry Flag (CF) from Destination operand (Destination = Destination - Source - CF).' 
          : 'Subtracts Source operand from Destination operand and stores difference in Destination (Destination = Destination - Source).',
        flagsAffected: 'CF, ZF, SF, OF, PF, AF (All 6 status flags updated)',
        flagsBadgeColor: 'amber',
        rules: [
          'Operands must match in size (both 8-bit or both 16-bit).',
          'Destination cannot be an immediate value.',
          'CF is set to 1 if a borrow was required.'
        ]
      };
    case 'CMP':
      return {
        generalSyntax: 'CMP Destination, Source',
        whatItDoes: 'Compares Destination with Source by executing an internal subtraction (Destination - Source). Updates all status flags based on result, but leaves Destination and Source operands unchanged.',
        flagsAffected: 'CF, ZF, SF, OF, PF, AF (All 6 status flags updated)',
        flagsBadgeColor: 'amber',
        rules: [
          'Neither operand is modified (read-only comparison).',
          'Used prior to conditional jump instructions (e.g. JE, JNE, JA, JB).',
          'ZF=1 if Destination equals Source; CF=1 if Destination < Source (unsigned).'
        ]
      };
    case 'INC':
    case 'DEC':
      return {
        generalSyntax: `${mnemonic} Destination`,
        whatItDoes: mnemonic === 'INC' 
          ? 'Increments the Destination operand by 1 (Destination = Destination + 1).' 
          : 'Decrements the Destination operand by 1 (Destination = Destination - 1).',
        flagsAffected: 'ZF, SF, OF, PF, AF (Carry Flag CF is UNCHANGED!)',
        flagsBadgeColor: 'amber',
        rules: [
          'CRITICAL: Carry Flag (CF) is preserved and NEVER modified by INC/DEC.',
          'Operates on 8-bit or 16-bit register or memory destination.',
          'Preferred in loops to preserve Carry Flag for multi-word additions.'
        ]
      };
    case 'NEG':
      return {
        generalSyntax: 'NEG Destination',
        whatItDoes: 'Negates the Destination operand by taking its 2’s complement (Destination = 0 - Destination). Changes positive to negative and vice versa.',
        flagsAffected: 'CF, ZF, SF, OF, PF, AF (CF=1 if operand ≠ 0, CF=0 if operand = 0)',
        flagsBadgeColor: 'amber',
        rules: [
          'Operates on 8-bit or 16-bit register or memory.',
          'Overflow Flag (OF) is set if negating 80H (-128) or 8000H (-32768).',
          'Difference vs NOT: NEG performs 2\'s complement negation (0 - x or ~x + 1) and updates all status flags (CF=1 for non-zero). In contrast, NOT performs 1\'s complement bitwise inversion (~x) and leaves all status flags unchanged.'
        ]
      };
    case 'MUL':
    case 'IMUL':
      return {
        generalSyntax: `${mnemonic} Source`,
        whatItDoes: mnemonic === 'IMUL' 
          ? 'Performs signed multiplication of Source operand with AL (if 8-bit, product in AX) or AX (if 16-bit, product in DX:AX).' 
          : 'Performs unsigned multiplication of Source operand with AL (if 8-bit, product in AX) or AX (if 16-bit, product in DX:AX).',
        flagsAffected: 'CF, OF (Set if upper half of product is non-zero); ZF, SF, PF, AF undefined',
        flagsBadgeColor: 'amber',
        rules: [
          'Source cannot be an immediate value in 8086.',
          '8-bit multiplication: AL × Source8 → AX.',
          '16-bit multiplication: AX × Source16 → DX:AX (DX holds high 16 bits, AX holds low 16 bits).'
        ]
      };
    case 'DIV':
    case 'IDIV':
      return {
        generalSyntax: `${mnemonic} Source`,
        whatItDoes: mnemonic === 'IDIV' 
          ? 'Performs signed division of AX (by 8-bit Source: quotient AL, remainder AH) or DX:AX (by 16-bit Source: quotient AX, remainder DX).' 
          : 'Performs unsigned division of AX (by 8-bit Source: quotient AL, remainder AH) or DX:AX (by 16-bit Source: quotient AX, remainder DX).',
        flagsAffected: 'CF, ZF, SF, OF, PF, AF (All status flags are undefined after division)',
        flagsBadgeColor: 'amber',
        rules: [
          'Division by Zero causes Type 0 Divide Error Interrupt.',
          'Quotient overflow (result too large for quotient register) causes Divide Error Interrupt.',
          'For signed division (IDIV), sign-extend AL to AX using CBW, or AX to DX:AX using CWD first.'
        ]
      };
    case 'AND':
    case 'OR':
    case 'XOR':
    case 'TEST':
      return {
        generalSyntax: `${mnemonic} Destination, Source`,
        whatItDoes: mnemonic === 'TEST' 
          ? 'Performs bitwise logical AND between Destination and Source to update flags without modifying operands.' 
          : `Performs bitwise logical ${mnemonic} operation between Destination and Source (Destination = Destination ${mnemonic} Source).`,
        flagsAffected: 'CF=0, OF=0 (Cleared); ZF, SF, PF updated according to result; AF undefined',
        flagsBadgeColor: 'amber',
        rules: [
          'Clears Carry Flag (CF=0) and Overflow Flag (OF=0) automatically.',
          'XOR reg, reg is a common 8086 pattern to clear a register to 0 in 2 bytes.',
          'TEST is commonly used to check if specific bits are set (e.g. TEST AL, 01H).'
        ]
      };
    case 'NOT':
      return {
        generalSyntax: 'NOT Destination',
        whatItDoes: 'Inverts all bits (1’s complement) of the Destination operand (0 becomes 1, 1 becomes 0).',
        flagsAffected: 'None (Flags remain unchanged)',
        flagsBadgeColor: 'emerald',
        rules: [
          'Operates on 8-bit or 16-bit register or memory location.',
          'Does NOT affect any status flags (unlike XOR or NEG).',
          'Difference vs NEG: NOT performs 1\'s complement bitwise inversion (~x) and leaves all status flags unchanged. In contrast, NEG performs 2\'s complement negation (0 - x or ~x + 1) and updates all status flags (CF=1 for non-zero).'
        ]
      };
    case 'DAA':
      return {
        generalSyntax: 'DAA',
        whatItDoes: 'Adjusts the 8-bit binary sum in the AL register resulting from an ADD or ADC instruction to yield two valid 4-bit packed BCD digits (0–9 each). If the lower nibble of AL > 9 or AF=1, adds 06H to AL and sets AF=1. If the upper nibble of AL > 9 or CF=1, adds 60H to AL and sets CF=1.',
        flagsAffected: 'CF, AF, ZF, SF, PF updated; OF undefined',
        flagsBadgeColor: 'amber',
        rules: [
          'Must be executed immediately after an ADD or ADC instruction performed on packed BCD operands.',
          'Operates exclusively on the AL accumulator register (implicit destination and source).',
          'Converts invalid hex sums (e.g. 59H + 35H = 8EH) into valid decimal BCD results (94H).'
        ]
      };
    case 'DAS':
      return {
        generalSyntax: 'DAS',
        whatItDoes: 'Adjusts the 8-bit binary difference in the AL register resulting from a SUB or SBB instruction to yield two valid 4-bit packed BCD digits. If the lower nibble of AL > 9 or AF=1, subtracts 06H from AL and sets AF=1. If the upper nibble of AL > 9 or CF=1, subtracts 60H from AL and sets CF=1.',
        flagsAffected: 'CF, AF, ZF, SF, PF updated; OF undefined',
        flagsBadgeColor: 'amber',
        rules: [
          'Must be executed immediately after a SUB or SBB instruction performed on packed BCD operands.',
          'Operates exclusively on the AL accumulator register.',
          'Corrects binary borrow and nibble overflow during packed BCD subtraction.'
        ]
      };
    case 'AAA':
      return {
        generalSyntax: 'AAA',
        whatItDoes: 'Adjusts the 8-bit sum in AL resulting from adding two unpacked BCD / ASCII digits. If the lower 4 bits of AL > 9 or AF=1, adds 06H to AL, increments AH by 1, sets AF=1 and CF=1, and clears the upper 4 bits of AL (AND AL, 0FH).',
        flagsAffected: 'AF, CF updated (set to 1 if carry occurs); OF, SF, ZF, PF undefined',
        flagsBadgeColor: 'amber',
        rules: [
          'Used after adding two unpacked BCD digits (00H–09H) or ASCII digits (30H–39H) in AL.',
          'Propagates decimal carry from AL into AH.',
          'Leaves AL with a single unpacked BCD digit (0–9) in the lower nibble.'
        ]
      };
    case 'AAS':
      return {
        generalSyntax: 'AAS',
        whatItDoes: 'Adjusts the 8-bit difference in AL resulting from subtracting two unpacked BCD / ASCII digits. If the lower 4 bits of AL > 9 or AF=1, subtracts 06H from AL, decrements AH by 1, sets AF=1 and CF=1, and clears the upper 4 bits of AL (AND AL, 0FH).',
        flagsAffected: 'AF, CF updated (set to 1 if borrow occurs); OF, SF, ZF, PF undefined',
        flagsBadgeColor: 'amber',
        rules: [
          'Used after subtracting two unpacked BCD or ASCII digits in AL.',
          'Propagates decimal borrow from AL into AH.',
          'Clears the upper nibble of AL so AL contains a valid unpacked BCD digit (0–9).'
        ]
      };
    case 'AAM':
      return {
        generalSyntax: 'AAM',
        whatItDoes: 'Converts a binary product (0–81) in AL—resulting from multiplying two single-digit unpacked BCD numbers with MUL—into two unpacked BCD digits in AX. Divides AL by 10 (0AH): stores the tens digit in AH and units digit in AL.',
        flagsAffected: 'SF, ZF, PF updated based on AL; CF, OF, AF undefined',
        flagsBadgeColor: 'amber',
        rules: [
          'Must be executed immediately after multiplying two unpacked BCD digits using byte MUL.',
          'AH contains the tens digit quotient, AL contains the units digit remainder.',
          'Default base operand is 10 (0AH), converting pure binary into decimal unpacked BCD digits.'
        ]
      };
    case 'AAD':
      return {
        generalSyntax: 'AAD',
        whatItDoes: 'Prepares two unpacked BCD digits in AX (AH = tens digit, AL = units digit) for binary division by converting them into a single binary byte in AL. Multiplies AH by 10 (0AH), adds the product to AL, and clears AH to 00H.',
        flagsAffected: 'SF, ZF, PF updated based on AL; CF, OF, AF undefined',
        flagsBadgeColor: 'amber',
        rules: [
          'Must be executed BEFORE performing a byte DIV instruction on unpacked BCD numbers.',
          'Converts 2-digit unpacked BCD in AX into pure binary in AL before division.',
          'Clears AH to 00H so division can proceed smoothly.'
        ]
      };
    case 'SHL':
    case 'SAL':
    case 'SHR':
    case 'SAR':
    case 'ROL':
    case 'ROR':
    case 'RCL':
    case 'RCR':
      return {
        generalSyntax: `${mnemonic} Destination, Count`,
        whatItDoes: `Shifts or rotates bits of Destination by Count position(s). Count can be 1 or register CL.`,
        flagsAffected: 'CF updated with last bit shifted out; OF, ZF, SF, PF updated',
        flagsBadgeColor: 'amber',
        rules: [
          'In 8086, Count operand can only be literal 1 or register CL.',
          'SHL/SAL shifts left (multiplies by 2); SHR shifts right unsigned (divides by 2); SAR preserves sign bit.'
        ]
      };
    case 'IN':
      return {
        generalSyntax: 'IN Accumulator, Port',
        whatItDoes: 'Inputs a byte (into AL) or word (into AX) from the specified I/O port address.',
        flagsAffected: 'None (Flags remain unchanged)',
        flagsBadgeColor: 'emerald',
        rules: [
          'Target register MUST be AL (for 8-bit port read) or AX (for 16-bit port read).',
          'Direct port address (00H-FFH) or DX register (0000H-FFFFH) for variable port addressing.'
        ]
      };
    case 'OUT':
      return {
        generalSyntax: 'OUT Port, Accumulator',
        whatItDoes: 'Outputs a byte (from AL) or word (from AX) to the specified I/O port address.',
        flagsAffected: 'None (Flags remain unchanged)',
        flagsBadgeColor: 'emerald',
        rules: [
          'Source register MUST be AL (8-bit) or AX (16-bit).',
          'Direct port address (00H-FFH) or DX register (0000H-FFFFH).'
        ]
      };
    case 'CLC':
    case 'STC':
    case 'CMC':
      return {
        generalSyntax: mnemonic,
        whatItDoes: mnemonic === 'CLC' ? 'Clears the Carry Flag (CF = 0).' : mnemonic === 'STC' ? 'Sets the Carry Flag (CF = 1).' : 'Complements (inverts) the Carry Flag (CF = NOT CF).',
        flagsAffected: 'CF (Carry Flag explicitly modified)',
        flagsBadgeColor: 'indigo',
        rules: [
          'Used to initialize carry before multi-word additions/subtractions or string operations.'
        ]
      };
    case 'CLD':
    case 'STD':
      return {
        generalSyntax: mnemonic,
        whatItDoes: mnemonic === 'CLD' ? 'Clears Direction Flag (DF = 0) for auto-incrementing SI/DI in string operations.' : 'Sets Direction Flag (DF = 1) for auto-decrementing SI/DI in string operations.',
        flagsAffected: 'DF (Direction Flag explicitly modified)',
        flagsBadgeColor: 'indigo',
        rules: [
          'CLD causes SI/DI to increment (+1 or +2) after string byte/word processing.',
          'STD causes SI/DI to decrement (-1 or -2) after string byte/word processing.'
        ]
      };
    case 'CLI':
    case 'STI':
      return {
        generalSyntax: mnemonic,
        whatItDoes: mnemonic === 'CLI' ? 'Clears Interrupt Flag (IF = 0) to disable maskable hardware interrupts (INTR).' : 'Sets Interrupt Flag (IF = 1) to enable maskable hardware interrupts (INTR).',
        flagsAffected: 'IF (Interrupt Flag explicitly modified)',
        flagsBadgeColor: 'indigo',
        rules: [
          'CLI is used to create critical time-sensitive code sections uninterrupted by hardware devices.'
        ]
      };
    case 'LOOP':
    case 'LOOPE':
    case 'LOOPNE':
    case 'JCXZ':
      return {
        generalSyntax: `${mnemonic} Target`,
        whatItDoes: mnemonic === 'LOOP' 
          ? 'Decrements CX counter register by 1. If CX ≠ 0, branches to the target relative offset address.'
          : mnemonic === 'LOOPE'
          ? 'Decrements CX counter register by 1. If CX ≠ 0 and Zero Flag (ZF = 1), branches to the target relative offset address.'
          : mnemonic === 'LOOPNE'
          ? 'Decrements CX counter register by 1. If CX ≠ 0 and Zero Flag (ZF = 0), branches to the target relative offset address.'
          : 'Jumps to target relative offset address if CX counter register is equal to 0 (does NOT decrement CX).',
        flagsAffected: 'None (Flags remain unchanged; ZF is tested, not modified)',
        flagsBadgeColor: 'emerald',
        rules: [
          'Target address must be within -128 to +127 bytes (8-bit signed relative displacement).',
          'Implicitly uses CX register as loop counter.',
          'LOOPE/LOOPNE test both CX ≠ 0 AND the Zero Flag (ZF).'
        ]
      };
    case 'JMP':
    case 'CALL':
    case 'RET':
    case 'JA':
    case 'JAE':
    case 'JB':
    case 'JBE':
    case 'JE':
    case 'JNE':
    case 'JG':
    case 'JGE':
    case 'JL':
    case 'JLE':
    case 'JC':
    case 'JO':
    case 'JS':
    case 'JNP':
    case 'JP':
      return {
        generalSyntax: mnemonic === 'RET' ? 'RET' : `${mnemonic} Target`,
        whatItDoes: mnemonic === 'JMP'
          ? 'Unconditionally transfers execution control to the target instruction address.'
          : mnemonic === 'CALL'
          ? 'Pushes current Instruction Pointer (IP) onto stack and transfers control to subroutine target address.'
          : mnemonic === 'RET'
          ? 'Pops saved return address from stack into Instruction Pointer (IP) to return from subroutine.'
          : `Conditionally branches to target address if specified processor flags satisfy the condition for ${mnemonic}.`,
        flagsAffected: 'None (Flags remain unchanged during branching)',
        flagsBadgeColor: 'emerald',
        rules: [
          'Conditional jumps evaluate status flags set by previous instructions (e.g. CMP).',
          'Short jumps use an 8-bit signed relative displacement (-128 to +127 bytes).'
        ]
      };
    case 'CBW':
    case 'CWD':
      return {
        generalSyntax: mnemonic,
        whatItDoes: mnemonic === 'CBW'
          ? 'Extends the sign bit of AL into AH (AL → AX).'
          : 'Extends the sign bit of AX into DX (AX → DX:AX).',
        flagsAffected: 'None (Flags remain unchanged)',
        flagsBadgeColor: 'emerald',
        rules: [
          'Used prior to signed division (IDIV) to prepare dividend.',
          'Operates implicitly on AL/AX without explicit operands.'
        ]
      };
    case 'LAHF':
    case 'SAHF':
      return {
        generalSyntax: mnemonic,
        whatItDoes: mnemonic === 'LAHF'
          ? 'Copies lower byte of FLAGS register (SF, ZF, AF, PF, CF) into AH.'
          : 'Stores bits from AH into lower byte of FLAGS register (SF, ZF, AF, PF, CF).',
        flagsAffected: mnemonic === 'SAHF' ? 'SF, ZF, AF, PF, CF (Lower flags updated)' : 'None (Flags remain unchanged)',
        flagsBadgeColor: mnemonic === 'SAHF' ? 'amber' : 'emerald',
        rules: [
          'Provides 8080/8085 flag compatibility.',
          'LAHF copies status flags to AH; SAHF restores status flags from AH.'
        ]
      };
    case 'HLT':
    case 'NOP':
    case 'WAIT':
    case 'ESC':
    case 'LOCK':
      return {
        generalSyntax: mnemonic === 'ESC' ? 'ESC Opcode, Source' : mnemonic === 'LOCK' ? 'LOCK Instruction' : mnemonic,
        whatItDoes: mnemonic === 'HLT'
          ? 'Halts the CPU until an external interrupt or reset occurs.'
          : mnemonic === 'NOP'
          ? 'No operation; consumes 3 clock cycles and advances IP without changing state.'
          : mnemonic === 'WAIT'
          ? 'Causes CPU to enter wait state until TEST pin is asserted low.'
          : mnemonic === 'LOCK'
          ? 'Locks the system bus during the next instruction so another processor cannot use the bus at the same time.'
          : 'ESC is not usually written as ESC in the source program. It is the 8086 instruction encoding used to communicate with the 8087.',
        flagsAffected: 'None (Flags remain unchanged)',
        flagsBadgeColor: 'emerald',
        rules: [
          'LOCK prefix can only be used with specific bus-accessing instructions.'
        ]
      };
    case 'MOVSB':
    case 'MOVSW':
    case 'CMPSB':
    case 'SCASB':
    case 'LODSB':
    case 'STOSB':
    case 'REP':
      return {
        generalSyntax: mnemonic.startsWith('REP') ? 'REP StringInstruction' : mnemonic,
        whatItDoes: mnemonic.startsWith('REP')
          ? 'Repeats the string instruction following it CX times, decrementing CX each iteration until CX = 0.'
          : `Executes string operation on memory pointers DS:SI and/or ES:DI, then automatically updates SI/DI according to Direction Flag (DF).`,
        flagsAffected: (mnemonic === 'CMPSB' || mnemonic === 'SCASB') ? 'CF, ZF, SF, OF, PF, AF updated' : 'None (Flags remain unchanged)',
        flagsBadgeColor: (mnemonic === 'CMPSB' || mnemonic === 'SCASB') ? 'amber' : 'emerald',
        rules: [
          'Source string pointer is DS:SI; Destination string pointer is ES:DI.',
          'SI and DI auto-increment if DF = 0, or auto-decrement if DF = 1.',
          'CX register holds repeat loop count when prefixed by REP.'
        ]
      };
    default:
      return {
        generalSyntax: `${clean.split(' ')[0]} Operands...`,
        whatItDoes: fallbackDesc || 'Executes the specified 8086 processor instruction.',
        flagsAffected: 'Dependent on instruction operation',
        flagsBadgeColor: 'slate',
        rules: [
          'Operands must adhere to 8086 register/memory size matching rules.',
          'Immediate constants cannot be used as destination operands.'
        ]
      };
  }
}

