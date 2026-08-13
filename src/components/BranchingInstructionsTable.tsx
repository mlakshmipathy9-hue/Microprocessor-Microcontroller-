import React, { useState } from 'react';
import { GitBranch, Search, Filter, HelpCircle, Zap, Code, ShieldAlert, CheckCircle2 } from 'lucide-react';

export interface BranchInstructionItem {
  mnemonic: string;
  aliases?: string;
  category: 'Unconditional' | 'Unsigned Conditional' | 'Signed Conditional' | 'Single Flag' | 'Loop Control';
  flagFormula: string;
  description: string;
  example: string;
  notes?: string;
}

export const BRANCHING_INSTRUCTIONS_DATA: BranchInstructionItem[] = [
  // 1. Unconditional & Subroutines
  {
    mnemonic: 'JMP target',
    aliases: 'Jump Unconditional',
    category: 'Unconditional',
    flagFormula: 'None (Unconditional)',
    description: 'Transfers control unconditionally to target address (Short/Near/Far relative offset or direct/indirect address).',
    example: 'JMP 0150H',
    notes: 'Does not affect any status flags.'
  },
  {
    mnemonic: 'CALL near_proc',
    aliases: 'Intra-Segment NEAR Call',
    category: 'Unconditional',
    flagFormula: 'None',
    description: 'Intra-segment subroutine call within current 64KB Code Segment (CS). CPU decrements SP by 2 and pushes 16-bit Return IP onto stack RAM; CS remains unchanged.',
    example: 'CALL DELAY_10MS',
    notes: 'SP ← SP - 2, SS:[SP] ← IP, IP ← target offset. Pairs with 2-byte RET / RETN (C3H).'
  },
  {
    mnemonic: 'CALL far_proc',
    aliases: 'Inter-Segment FAR Call',
    category: 'Unconditional',
    flagFormula: 'None',
    description: 'Inter-segment subroutine call to a different Code Segment. CPU decrements SP by 4, pushes 16-bit CS then 16-bit Return IP onto stack RAM, and reloads CS with target base.',
    example: 'CALL FAR PTR SYSTEM_OS',
    notes: 'SP ← SP - 4, SS:[SP+2] ← CS, SS:[SP] ← IP, CS:IP ← target CS:IP. Pairs with 4-byte RETF (CBH).'
  },
  {
    mnemonic: 'RET / RETF [pop_bytes]',
    aliases: 'Return from Subroutine (NEAR / FAR)',
    category: 'Unconditional',
    flagFormula: 'None',
    description: 'Pops return offset off stack into IP (and CS for Far return RETF) to resume caller execution. Optional pop_bytes operand adds constant to SP to pop parameters.',
    example: 'RET 04H / RETF',
    notes: 'NEAR RET pops 2 bytes into IP (SP ← SP + 2). FAR RETF pops 4 bytes into IP and CS (SP ← SP + 4).'
  },
  {
    mnemonic: 'INT type / IRET',
    aliases: 'Software Interrupt & Return',
    category: 'Unconditional',
    flagFormula: 'Pushes Flags, CS, IP / Pops Flags',
    description: 'INT pushes Flags, CS, IP and jumps to IVT handler. IRET pops IP, CS, and Flags to restore CPU state.',
    example: 'INT 21H / IRET',
    notes: 'Clears IF and TF during interrupt handling.'
  },

  // 2. Unsigned Conditional Jumps
  {
    mnemonic: 'JA / JNBE',
    aliases: 'Jump if Above / Not Below or Equal',
    category: 'Unsigned Conditional',
    flagFormula: 'CF = 0 AND ZF = 0',
    description: 'Jumps if unsigned first operand is strictly greater than second operand (>).',
    example: 'CMP AL, 50H \nJA HIGH_VAL',
    notes: 'Used after CMP for unsigned magnitude check.'
  },
  {
    mnemonic: 'JAE / JNB / JNC',
    aliases: 'Jump if Above or Equal / Not Below / No Carry',
    category: 'Unsigned Conditional',
    flagFormula: 'CF = 0',
    description: 'Jumps if unsigned first operand is greater than or equal to second operand (≥), or if no carry.',
    example: 'CMP BL, 10H \nJAE VALID_RANGE',
    notes: 'JNC tests Carry Flag (CF=0) directly.'
  },
  {
    mnemonic: 'JB / JNAE / JC',
    aliases: 'Jump if Below / Not Above or Equal / Carry',
    category: 'Unsigned Conditional',
    flagFormula: 'CF = 1',
    description: 'Jumps if unsigned first operand is strictly less than second operand (<), or if carry set.',
    example: 'CMP CX, 1000H \nJB BELOW_THRES',
    notes: 'JC tests Carry Flag (CF=1) directly.'
  },
  {
    mnemonic: 'JBE / JNA',
    aliases: 'Jump if Below or Equal / Not Above',
    category: 'Unsigned Conditional',
    flagFormula: 'CF = 1 OR ZF = 1',
    description: 'Jumps if unsigned first operand is less than or equal to second operand (≤).',
    example: 'CMP DX, 0FFH \nJBE IN_BYTE_LIMIT',
    notes: 'Triggers on either borrow (CF=1) or match (ZF=1).'
  },

  // 3. Signed Conditional Jumps
  {
    mnemonic: 'JG / JNLE',
    aliases: 'Jump if Greater / Not Less or Equal',
    category: 'Signed Conditional',
    flagFormula: 'ZF = 0 AND SF = OF',
    description: 'Jumps if signed 2\'s complement first operand is strictly greater than second operand (>).',
    example: 'CMP AL, -5 \nJG POS_OR_NEAR_ZERO',
    notes: 'Evaluates signed overflow (OF) and sign (SF).'
  },
  {
    mnemonic: 'JGE / JNL',
    aliases: 'Jump if Greater or Equal / Not Less',
    category: 'Signed Conditional',
    flagFormula: 'SF = OF',
    description: 'Jumps if signed first operand is greater than or equal to second operand (≥).',
    example: 'CMP BX, -100 \nJGE PASS_LIMIT',
    notes: 'Valid for 2\'s complement signed comparisons.'
  },
  {
    mnemonic: 'JL / JNGE',
    aliases: 'Jump if Less / Not Greater or Equal',
    category: 'Signed Conditional',
    flagFormula: 'SF ≠ OF',
    description: 'Jumps if signed first operand is strictly less than second operand (<).',
    example: 'CMP CX, -1 \nJL NEGATIVE_VAL',
    notes: 'SF ≠ OF indicates signed arithmetic underflow/comparison.'
  },
  {
    mnemonic: 'JLE / JNG',
    aliases: 'Jump if Less or Equal / Not Greater',
    category: 'Signed Conditional',
    flagFormula: 'ZF = 1 OR SF ≠ OF',
    description: 'Jumps if signed first operand is less than or equal to second operand (≤).',
    example: 'CMP SI, 0 \nJLE NON_POSITIVE',
    notes: 'Triggers if zero flag is set or signed less than.'
  },

  // 4. Single Flag Conditionals
  {
    mnemonic: 'JE / JZ',
    aliases: 'Jump if Equal / Jump if Zero',
    category: 'Single Flag',
    flagFormula: 'ZF = 1',
    description: 'Jumps if operands are equal or arithmetic/logical operation result is zero.',
    example: 'CMP AX, BX \nJE MATCH_FOUND',
    notes: 'Most commonly used jump in 8086 programs.'
  },
  {
    mnemonic: 'JNE / JNZ',
    aliases: 'Jump if Not Equal / Jump if Not Zero',
    category: 'Single Flag',
    flagFormula: 'ZF = 0',
    description: 'Jumps if operands are not equal or arithmetic/logical operation result is non-zero.',
    example: 'DEC CX \nJNZ REPEAT_LOOP',
    notes: 'Ideal for non-zero iteration loops and string mismatches.'
  },
  {
    mnemonic: 'JS',
    aliases: 'Jump if Sign (Negative)',
    category: 'Single Flag',
    flagFormula: 'SF = 1',
    description: 'Jumps if result Most Significant Bit (MSB) is 1 (indicating negative signed result).',
    example: 'SUB AL, BL \nJS RESULT_NEG',
    notes: 'Inspects Sign Flag (SF) set by ALU.'
  },
  {
    mnemonic: 'JNS',
    aliases: 'Jump if No Sign (Positive/Zero)',
    category: 'Single Flag',
    flagFormula: 'SF = 0',
    description: 'Jumps if result MSB is 0 (indicating positive or zero result).',
    example: 'ADD AL, 05H \nJNS RESULT_POS',
    notes: 'Triggers when Sign Flag (SF) is cleared.'
  },
  {
    mnemonic: 'JO',
    aliases: 'Jump if Overflow',
    category: 'Single Flag',
    flagFormula: 'OF = 1',
    description: 'Jumps if signed 2\'s complement overflow occurred in previous arithmetic operation.',
    example: 'ADD AL, 70H \nJO OVERFLOW_ERR',
    notes: 'Tests Overflow Flag (OF).'
  },
  {
    mnemonic: 'JNO',
    aliases: 'Jump if No Overflow',
    category: 'Single Flag',
    flagFormula: 'OF = 0',
    description: 'Jumps if no signed 2\'s complement overflow occurred in previous operation.',
    example: 'ADD AL, 10H \nJNO SAFE_EXEC',
    notes: 'Ensures operation stayed within 8-bit / 16-bit signed range.'
  },
  {
    mnemonic: 'JP / JPE',
    aliases: 'Jump if Parity / Parity Even',
    category: 'Single Flag',
    flagFormula: 'PF = 1',
    description: 'Jumps if lower byte of result contains an EVEN number of 1 bits.',
    example: 'TEST AL, 0FFH \nJP EVEN_PARITY',
    notes: 'Used in serial communications parity checking.'
  },
  {
    mnemonic: 'JNP / JPO',
    aliases: 'Jump if No Parity / Parity Odd',
    category: 'Single Flag',
    flagFormula: 'PF = 0',
    description: 'Jumps if lower byte of result contains an ODD number of 1 bits.',
    example: 'TEST AL, 0FFH \nJNP ODD_PARITY',
    notes: 'Triggers when Parity Flag (PF) is cleared.'
  },

  // 5. Loop Control & Register Jumps
  {
    mnemonic: 'LOOP target',
    aliases: 'Loop Control (Count in CX)',
    category: 'Loop Control',
    flagFormula: 'Decrements CX; Jump if CX ≠ 0',
    description: 'Automatically decrements CX by 1. Jumps to short target if CX ≠ 0. Does NOT affect flags!',
    example: 'MOV CX, 0005H \nL1: NOP \nLOOP L1',
    notes: 'CX is decrements BEFORE checking CX ≠ 0.'
  },
  {
    mnemonic: 'LOOPE / LOOPZ',
    aliases: 'Loop while Equal / Zero',
    category: 'Loop Control',
    flagFormula: 'Decrements CX; Jump if CX ≠ 0 AND ZF = 1',
    description: 'Decrements CX by 1. Jumps if CX ≠ 0 and Zero Flag ZF = 1 (e.g. while matched in string scan).',
    example: 'MOV CX, 10 \nLOOPE SCAN_ARRAY',
    notes: 'Exits loop early if ZF becomes 0.'
  },
  {
    mnemonic: 'LOOPNE / LOOPNZ',
    aliases: 'Loop while Not Equal / Not Zero',
    category: 'Loop Control',
    flagFormula: 'Decrements CX; Jump if CX ≠ 0 AND ZF = 0',
    description: 'Decrements CX by 1. Jumps if CX ≠ 0 and Zero Flag ZF = 0 (e.g. while searching for match).',
    example: 'MOV CX, 50 \nLOOPNE SEARCH_CHAR',
    notes: 'Exits loop early if ZF becomes 1.'
  },
  {
    mnemonic: 'JCXZ target',
    aliases: 'Jump if CX Register is Zero',
    category: 'Loop Control',
    flagFormula: 'CX = 0',
    description: 'Jumps to target if CX register is 0. Used to bypass 0-iteration loops safely.',
    example: 'JCXZ SKIP_LOOP_BODY',
    notes: 'Does NOT decrement CX or alter any CPU flags.'
  }
];

export default function BranchingInstructionsTable({
  compactMode = false
}: {
  compactMode?: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = [
    { id: 'ALL', label: 'All Branching Opcodes' },
    { id: 'Unconditional', label: 'Unconditional & Subroutines' },
    { id: 'Unsigned Conditional', label: 'Unsigned Conditionals (> ≥ < ≤)' },
    { id: 'Signed Conditional', label: 'Signed Conditionals (> ≥ < ≤)' },
    { id: 'Single Flag', label: 'Single Flag (ZF, SF, OF, PF)' },
    { id: 'Loop Control', label: 'Loop & CX Control' }
  ];

  const filteredData = BRANCHING_INSTRUCTIONS_DATA.filter(item => {
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCat;
    const matchesQuery =
      item.mnemonic.toLowerCase().includes(q) ||
      (item.aliases && item.aliases.toLowerCase().includes(q)) ||
      item.flagFormula.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.example.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 space-y-4 shadow-xs font-sans text-slate-900">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-rose-600 text-white rounded-xl shadow-xs">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-mono font-extrabold text-sm md:text-base text-slate-900 uppercase tracking-wider flex items-center gap-2">
              8086 Branching Instructions Master Summary Table
            </h3>
            <p className="text-xs text-slate-500">
              Complete reference of Unconditional, Conditional, Flag-Based, and Loop Control Branching Opcodes.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-lg">
            {filteredData.length} / {BRANCHING_INSTRUCTIONS_DATA.length} Instructions
          </span>
        </div>
      </div>

      {/* Grouping Methodology & Classification Clarification Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5 font-sans">
        <div className="flex items-center gap-2 text-xs font-bold font-mono text-slate-900 uppercase tracking-wide">
          <HelpCircle className="w-4 h-4 text-rose-600" />
          <span>How standard 8086 branching instructions are grouped:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 text-[11px]">
          <div className="bg-white border border-slate-200 p-2.5 rounded-lg space-y-1">
            <span className="font-mono font-bold text-slate-800 block text-[11.5px] border-b border-slate-100 pb-1">
              1. Unconditional
            </span>
            <p className="text-slate-600 leading-snug">
              <strong>Flag Check:</strong> None.<br />
              <strong>Logic:</strong> Always jumps or pushes/pops procedure addresses (<code className="font-mono font-bold text-slate-800">CS:IP</code>) directly without testing status flags.
            </p>
          </div>
          <div className="bg-sky-50/60 border border-sky-200 p-2.5 rounded-lg space-y-1">
            <span className="font-mono font-bold text-sky-900 block text-[11.5px] border-b border-sky-100 pb-1">
              2. Unsigned Jumps
            </span>
            <p className="text-sky-800 leading-snug">
              <strong>Flag Check:</strong> <code className="font-mono font-bold text-sky-900">CF</code> &amp; <code className="font-mono font-bold text-sky-900">ZF</code>.<br />
              <strong>Logic:</strong> Used for unsigned numbers (0 to 65535). Tests <code className="font-mono font-bold text-sky-900">CF=1</code> (borrow / below) and <code className="font-mono font-bold text-sky-900">ZF</code> (equal).
            </p>
          </div>
          <div className="bg-purple-50/60 border border-purple-200 p-2.5 rounded-lg space-y-1">
            <span className="font-mono font-bold text-purple-900 block text-[11.5px] border-b border-purple-100 pb-1">
              3. Signed Jumps
            </span>
            <p className="text-purple-800 leading-snug">
              <strong>Flag Check:</strong> <code className="font-mono font-bold text-purple-900">SF, OF, ZF</code>.<br />
              <strong>Logic:</strong> Used for 2's complement numbers (-32768 to +32767). Evaluates sign (<code className="font-mono font-bold text-purple-900">SF ≠ OF</code> for less-than).
            </p>
          </div>
          <div className="bg-amber-50/60 border border-amber-200 p-2.5 rounded-lg space-y-1">
            <span className="font-mono font-bold text-amber-900 block text-[11.5px] border-b border-amber-100 pb-1">
              4. Single Flag
            </span>
            <p className="text-amber-800 leading-snug">
              <strong>Flag Check:</strong> 1 specific flag.<br />
              <strong>Logic:</strong> Directly checks if <code className="font-mono font-bold text-amber-900">ZF, SF, OF</code>, or <code className="font-mono font-bold text-amber-900">PF</code> is set (1) or cleared (0) after ALU execution.
            </p>
          </div>
          <div className="bg-emerald-50/60 border border-emerald-200 p-2.5 rounded-lg space-y-1">
            <span className="font-mono font-bold text-emerald-900 block text-[11.5px] border-b border-emerald-100 pb-1">
              5. Loop &amp; CX
            </span>
            <p className="text-emerald-800 leading-snug">
              <strong>Flag Check:</strong> <code className="font-mono font-bold text-emerald-900">CX</code> count.<br />
              <strong>Logic:</strong> Hardware-accelerated loops that decrement <code className="font-mono font-bold text-emerald-900">CX</code> register automatically without altering flags.
            </p>
          </div>
        </div>
      </div>

      {/* Controls: Search & Category Filters */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter by mnemonic (e.g., JA, JZ, LOOP, CF=0, signed)..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-rose-500 focus:outline-hidden transition-all font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200">
          {categories.map(cat => {
            const isSel = selectedCategory === cat.id;
            const count = cat.id === 'ALL'
              ? BRANCHING_INSTRUCTIONS_DATA.length
              : BRANCHING_INSTRUCTIONS_DATA.filter(i => i.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border ${
                  isSel
                    ? 'bg-rose-900 text-white border-rose-950 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {cat.label} <span className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full ${isSel ? 'bg-rose-800 text-white' : 'bg-slate-200 text-slate-700'}`}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Reference Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs max-h-[520px] overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-100 text-slate-900 font-mono text-[11px] font-extrabold uppercase sticky top-0 z-10 border-b border-slate-200 shadow-2xs">
            <tr>
              <th className="p-3 border-r border-slate-200 bg-slate-100 min-w-[130px]">Mnemonic & Aliases</th>
              <th className="p-3 border-r border-slate-200 bg-slate-100 min-w-[130px]">Branch Category</th>
              <th className="p-3 border-r border-slate-200 bg-slate-100 min-w-[150px]">Flag Formula / Condition</th>
              <th className="p-3 border-r border-slate-200 bg-slate-100 min-w-[240px]">Operational Logic & Description</th>
              <th className="p-3 bg-slate-100 min-w-[170px]">Assembly Code Example</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150 font-sans text-slate-800">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500 font-mono text-xs">
                  No branching instructions match "{searchQuery}". Try searching for another mnemonic or flag.
                </td>
              </tr>
            ) : (
              filteredData.map((item, idx) => {
                const isUnconditional = item.category === 'Unconditional';
                const isUnsigned = item.category === 'Unsigned Conditional';
                const isSigned = item.category === 'Signed Conditional';
                const isSingleFlag = item.category === 'Single Flag';
                const isLoop = item.category === 'Loop Control';

                let catBadge = 'bg-slate-100 text-slate-700 border-slate-200';
                if (isUnconditional) catBadge = 'bg-slate-100 text-slate-800 border-slate-300 font-bold';
                else if (isUnsigned) catBadge = 'bg-sky-50 text-sky-800 border-sky-200 font-bold';
                else if (isSigned) catBadge = 'bg-purple-50 text-purple-800 border-purple-200 font-bold';
                else if (isSingleFlag) catBadge = 'bg-amber-50 text-amber-800 border-amber-200 font-bold';
                else if (isLoop) catBadge = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold';

                return (
                  <tr key={idx} className="hover:bg-rose-50/30 transition-colors group">
                    {/* Mnemonic */}
                    <td className="p-3 border-r border-slate-200 font-mono font-black text-rose-950 bg-slate-50/40 group-hover:bg-rose-50/50">
                      <div className="text-xs font-bold text-slate-900">{item.mnemonic}</div>
                      {item.aliases && (
                        <span className="text-[10px] text-slate-500 font-normal block mt-0.5">
                          {item.aliases}
                        </span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="p-3 border-r border-slate-200">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10.5px] border ${catBadge}`}>
                        {item.category}
                      </span>
                    </td>

                    {/* Flag Formula */}
                    <td className="p-3 border-r border-slate-200 font-mono font-bold text-xs text-indigo-900">
                      <code className="bg-indigo-50 border border-indigo-200 px-2 py-1 rounded text-[11px] block text-center font-black">
                        {item.flagFormula}
                      </code>
                    </td>

                    {/* Description */}
                    <td className="p-3 border-r border-slate-200 leading-relaxed text-xs">
                      <p className="text-slate-800 font-medium">{item.description}</p>
                      {item.notes && (
                        <p className="text-[10.5px] text-slate-500 italic mt-1 flex items-center gap-1">
                          <span>💡</span> {item.notes}
                        </p>
                      )}
                    </td>

                    {/* Example */}
                    <td className="p-3 font-mono text-[11px]">
                      <div className="bg-slate-900 text-slate-100 p-2 rounded-lg border border-slate-800 shadow-2xs whitespace-pre-line leading-snug">
                        {item.example}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Insight Box */}
      <div className="bg-gradient-to-r from-rose-50 via-slate-50 to-indigo-50 p-3 rounded-xl border border-rose-200 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2 font-sans">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-rose-600 shrink-0" />
          <span>
            <strong className="text-rose-950 font-mono">Architectural Rule:</strong> 8086 conditional jumps evaluate status flags set by previous instructions (like <code className="bg-white px-1 rounded border font-mono text-indigo-800 font-bold">CMP</code>, <code className="bg-white px-1 rounded border font-mono text-indigo-800 font-bold">SUB</code>, or <code className="bg-white px-1 rounded border font-mono text-indigo-800 font-bold">TEST</code>) without modifying any flags themselves.
          </span>
        </div>
        <span className="text-[10px] font-mono text-rose-800 bg-white border border-rose-200 px-2 py-0.5 rounded font-extrabold">
          8086 EU Branching
        </span>
      </div>
    </div>
  );
}
