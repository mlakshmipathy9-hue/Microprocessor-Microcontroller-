import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  Zap,
  Sliders,
  Code2,
  Play,
  RotateCcw,
  Activity,
  HardDrive,
  Terminal,
  CheckCircle2,
  ArrowRight,
  Search,
  Box,
  FileText,
  MemoryStick,
  ToggleLeft,
  ToggleRight,
  Sparkles
} from 'lucide-react';

interface MCU8051SimulatorProps {
  initialTab?: 'architecture' | 'sfr' | 'pins' | 'instructions' | 'alp';
}

export default function MCU8051Simulator({ initialTab = 'architecture' }: MCU8051SimulatorProps) {
  const [activeTab, setActiveTab] = useState<'architecture' | 'sfr' | 'pins' | 'instructions' | 'alp'>(initialTab);

  // Architecture state
  const [selectedArchBlock, setSelectedArchBlock] = useState<string>('cpu');

  // SFR state
  const [sfrSearch, setSfrSearch] = useState<string>('');
  const [selectedSfr, setSelectedSfr] = useState<string>('ACC');
  const [pswBits, setPswBits] = useState<{ [key: string]: boolean }>({
    CY: false,
    AC: false,
    F0: false,
    RS1: false,
    RS0: false,
    OV: false,
    P: false,
  });

  // Pins state
  const [selectedPort, setSelectedPort] = useState<'P0' | 'P1' | 'P2' | 'P3'>('P0');
  const [portValues, setPortValues] = useState<{ [key: string]: number }>({
    P0: 0xff,
    P1: 0x55,
    P2: 0x00,
    P3: 0xff,
  });

  // Instructions state
  const [selectedInstrCategory, setSelectedInstrCategory] = useState<'data' | 'arith' | 'logic' | 'bit' | 'branch'>('data');
  const [instrSearch, setInstrSearch] = useState<string>('');
  const [selectedAddressingMode, setSelectedAddressingMode] = useState<string>('all');

  // ALP Sandbox state
  const [code, setCode] = useState<string>(
    `; 8051 Assembly Program - LED Blink & Counter\n` +
    `ORG 0000H\n` +
    `MOV A, #00H     ; Clear Accumulator\n` +
    `MOV R0, #05H    ; Set Loop Counter = 5\n` +
    `LOOP:\n` +
    `  INC A         ; Increment Accumulator\n` +
    `  MOV P1, A     ; Output to Port 1 LEDs\n` +
    `  CPL A         ; Complement AL\n` +
    `  DJNZ R0, LOOP ; Decrement R0 and jump if not zero\n` +
    `END`
  );
  const [pc, setPc] = useState<number>(0x0000);
  const [regA, setRegA] = useState<number>(0x00);
  const [regB, setRegB] = useState<number>(0x00);
  const [registers, setRegisters] = useState<number[]>([0, 5, 0, 0, 0, 0, 0, 0]);
  const [p1State, setP1State] = useState<number>(0x00);
  const [sp, setSp] = useState<number>(0x07);
  const [dptr, setDptr] = useState<number>(0x0000);
  const [executionLog, setExecutionLog] = useState<string[]>([
    'System Reset. Ready to execute 8051 Assembly Program.'
  ]);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  // Architecture block data
  const archBlocks: { [key: string]: { title: string; desc: string; details: string[]; icon: any } } = {
    cpu: {
      title: '8-Bit CPU & ALU Engine',
      desc: 'Central Processing Unit responsible for fetching, decoding, and executing 8051 instructions.',
      details: [
        '8-Bit Arithmetic Logic Unit (ALU): Performs 8-bit addition, subtraction, multiplication, division, and bitwise logic operations.',
        'Accumulator (A / ACC): 8-bit primary register for ALU operations, implicit operand for data transfers.',
        'B Register: 8-bit register used primarily for hardware MUL AB and DIV AB operations.',
        'Program Counter (PC): 16-bit register pointing to the next instruction byte in ROM memory.'
      ],
      icon: Cpu
    },
    ram: {
      title: 'Internal RAM (128 Bytes Data Memory)',
      desc: 'Fast, on-chip data memory located at addresses 00H to 7FH.',
      details: [
        'Register Banks 0–3 (00H–1FH): 32 bytes allocated into 4 switchable banks containing R0–R7 registers.',
        'Bit Addressable RAM (20H–2FH): 16 bytes containing 128 individually addressable bits (bit addresses 00H–7FH).',
        'General Purpose Scratchpad RAM (30H–7FH): 80 bytes for general variables and user stack operations.',
        'Upper 128 Bytes (80H–FFH): Dedicated to Special Function Registers (SFRs).'
      ],
      icon: HardDrive
    },
    rom: {
      title: '4 KB On-Chip Program ROM / Flash',
      desc: 'Non-volatile program memory for storing 8051 machine instructions.',
      details: [
        'Address Space: 0000H to 0FFFH internal program storage (expandable up to 64 KB using EA# pin).',
        'Reset Vector (0000H): CPU starts execution at address 0000H upon hardware RESET.',
        'Interrupt Vectors (0003H–002BH): Dedicated jump locations for INT0, T0, INT1, T1, and Serial Port interrupts.'
      ],
      icon: FileText
    },
    ports: {
      title: 'Four 8-Bit Parallel I/O Ports (P0, P1, P2, P3)',
      desc: 'Provides 32 bidirectional I/O lines for interfacing external sensors, switches, and displays.',
      details: [
        'Port 0 (80H): Open-drain bidirectional port; serves as multiplexed Address/Data bus (AD0–AD7) in external memory mode.',
        'Port 1 (90H): Pure 8-bit bidirectional I/O port with internal pull-up resistors.',
        'Port 2 (A0H): Bidirectional I/O port; outputs high-order address byte (A8–A15) for external memory access.',
        'Port 3 (B0H): Multi-functional port providing RXD, TXD, INT0#, INT1#, T0, T1, WR#, and RD# alternate functions.'
      ],
      icon: Layers
    },
    timers: {
      title: 'Dual 16-Bit Timers / Counters (Timer 0 & Timer 1)',
      desc: 'Independent 16-bit timer/counter hardware units for delay generation and pulse counting.',
      details: [
        'Timer 0 (TL0/TH0): Configurable via TMOD register; supports Mode 0 (13-bit), Mode 1 (16-bit), Mode 2 (8-bit auto-reload), Mode 3 (split).',
        'Timer 1 (TL1/TH1): Provides baud rate generation for 8051 serial UART communication in Mode 2.',
        'TCON Register: Controls timer start/stop flags (TR0, TR1) and timer overflow interrupt flags (TF0, TF1).'
      ],
      icon: Zap
    },
    serial: {
      title: 'Full-Duplex Serial UART Port',
      desc: 'Asynchronous serial communication interface using RXD (P3.0) and TXD (P3.1) lines.',
      details: [
        'SBUF Register (99H): Physical double-buffered register for receiving and transmitting serial bytes.',
        'SCON Register (98H): Configures 8-bit / 9-bit serial modes and holds RI (Receive Interrupt) / TI (Transmit Interrupt) flags.'
      ],
      icon: Activity
    },
    interrupts: {
      title: '5-Vector Interrupt Controller',
      desc: 'Manages hardware and software interrupt requests with 2 priority levels.',
      details: [
        'Interrupt Sources: INT0# (External 0), Timer 0 (TF0), INT1# (External 1), Timer 1 (TF1), Serial Port (RI/TI).',
        'IE Register (A8H): Interrupt Enable register containing global enable bit (EA) and individual interrupt mask bits.',
        'IP Register (B8H): Interrupt Priority register setting High or Low priority for each interrupt source.'
      ],
      icon: Sliders
    }
  };

  // SFR List
  const sfrList = [
    { name: 'ACC', addr: 'E0H', bitAddr: true, desc: 'Accumulator register for arithmetic, logical, and data movement operations.' },
    { name: 'B', addr: 'F0H', bitAddr: true, desc: 'B register for multiplication (MUL AB) and division (DIV AB).' },
    { name: 'PSW', addr: 'D0H', bitAddr: true, desc: 'Program Status Word containing CY, AC, F0, RS1, RS0, OV, and P flags.' },
    { name: 'SP', addr: '81H', bitAddr: false, desc: 'Stack Pointer holding top of internal RAM stack (defaults to 07H on reset).' },
    { name: 'DPTR (DPH/DPL)', addr: '82H/83H', bitAddr: false, desc: '16-bit Data Pointer register for external memory data transfer (MOVX / MOVC).' },
    { name: 'P0', addr: '80H', bitAddr: true, desc: 'Port 0 latch register / Multiplexed Address/Data bus AD0–AD7.' },
    { name: 'P1', addr: '90H', bitAddr: true, desc: 'Port 1 latch register / General purpose bidirectional I/O.' },
    { name: 'P2', addr: 'A0H', bitAddr: true, desc: 'Port 2 latch register / High-order address bus A8–A15.' },
    { name: 'P3', addr: 'B0H', bitAddr: true, desc: 'Port 3 latch register / Alternate functions (RXD, TXD, INT0, INT1, T0, T1, WR, RD).' },
    { name: 'TMOD', addr: '89H', bitAddr: false, desc: 'Timer Mode Control register configuring Timer 0 & 1 operating modes.' },
    { name: 'TCON', addr: '88H', bitAddr: true, desc: 'Timer Control register managing Timer run flags (TR0/TR1) and overflow flags (TF0/TF1).' },
    { name: 'SCON', addr: '98H', bitAddr: true, desc: 'Serial Control register holding serial mode selection, RI, and TI interrupt flags.' },
    { name: 'SBUF', addr: '99H', bitAddr: false, desc: 'Serial Data Buffer register holding transmit and receive bytes.' },
    { name: 'IE', addr: 'A8H', bitAddr: true, desc: 'Interrupt Enable register with EA (Global Enable) and individual source masks.' },
    { name: 'IP', addr: 'B8H', bitAddr: true, desc: 'Interrupt Priority register configuring High/Low priority for interrupt vectors.' },
    { name: 'PCON', addr: '87H', bitAddr: false, desc: 'Power Control register managing SMOD (baud rate double bit) and power-down modes.' }
  ];

  // Instruction categories
  const instructionsData = {
    data: [
      { op: 'MOV dest, src', mode: 'Immediate, Direct, Register, Register-Indirect', desc: 'Moves data byte from source to destination location.', example: 'MOV A, #55H / MOV R0, A / MOV 30H, R1' },
      { op: 'MOVX dest, src', mode: 'Register-Indirect (@DPTR, @Ri)', desc: 'Transfers byte between Accumulator and External Data RAM (XDATA).', example: 'MOVX A, @DPTR / MOVX @DPTR, A' },
      { op: 'MOVC A, @A+DPTR', mode: 'Indexed Addressing', desc: 'Moves byte from Program ROM code memory to Accumulator.', example: 'MOVC A, @A+DPTR / MOVC A, @A+PC' },
      { op: 'PUSH direct', mode: 'Direct Addressing', desc: 'Increments Stack Pointer (SP) and stores direct byte onto internal RAM stack.', example: 'PUSH 0E0H (Push ACC) / PUSH 0D0H (Push PSW)' },
      { op: 'POP direct', mode: 'Direct Addressing', desc: 'Pops byte from internal RAM stack into direct memory address and decrements SP.', example: 'POP 0E0H (Pop ACC)' },
      { op: 'XCHG A, byte', mode: 'Register, Direct, Register-Indirect', desc: 'Exchanges byte contents between Accumulator and operand.', example: 'XCHG A, R2 / XCHG A, @R0' }
    ],
    arith: [
      { op: 'ADD A, byte', mode: 'Immediate, Register, Direct, Register-Indirect', desc: 'Adds operand byte to Accumulator; updates CY, AC, OV, P flags.', example: 'ADD A, #25H / ADD A, R3' },
      { op: 'ADDC A, byte', mode: 'Immediate, Register, Direct, Register-Indirect', desc: 'Adds operand byte and Carry Flag (CY) to Accumulator.', example: 'ADDC A, #00H' },
      { op: 'SUBB A, byte', mode: 'Immediate, Register, Direct, Register-Indirect', desc: 'Subtracts operand byte and Borrow (CY) from Accumulator.', example: 'SUBB A, #10H' },
      { op: 'INC operand', mode: 'Register, Direct, Register-Indirect, DPTR', desc: 'Increments register or memory byte by 1.', example: 'INC A / INC R0 / INC DPTR' },
      { op: 'DEC operand', mode: 'Register, Direct, Register-Indirect', desc: 'Decrements register or memory byte by 1.', example: 'DEC A / DEC 30H' },
      { op: 'MUL AB', mode: 'Implied Register', desc: 'Multiplies 8-bit unsigned A by 8-bit unsigned B; product in B:A (16-bit result).', example: 'MUL AB' },
      { op: 'DIV AB', mode: 'Implied Register', desc: 'Divides unsigned A by B; Quotient in A, Remainder in B.', example: 'DIV AB' },
      { op: 'DA A', mode: 'Implied Register', desc: 'Decimal Adjust Accumulator for BCD addition after ADD/ADDC.', example: 'DA A' }
    ],
    logic: [
      { op: 'ANL dest, src', mode: 'Immediate, Direct, Register, Register-Indirect', desc: 'Bitwise Logical AND between Accumulator/Direct and source byte.', example: 'ANL A, #0FH / ANL P1, A' },
      { op: 'ORL dest, src', mode: 'Immediate, Direct, Register, Register-Indirect', desc: 'Bitwise Logical OR operation.', example: 'ORL A, #80H' },
      { op: 'XRL dest, src', mode: 'Immediate, Direct, Register, Register-Indirect', desc: 'Bitwise Logical Exclusive-OR (XOR) operation.', example: 'XRL A, #FFH (Inverts A)' },
      { op: 'CLR A', mode: 'Implied Register', desc: 'Clears all bits in Accumulator to 00H.', example: 'CLR A' },
      { op: 'CPL A', mode: 'Implied Register', desc: 'Complements (inverts) all bits in Accumulator (1s complement).', example: 'CPL A' },
      { op: 'RL A / RLC A', mode: 'Implied Register', desc: 'Rotates Accumulator bits Left (with or without Carry Flag).', example: 'RL A / RLC A' },
      { op: 'RR A / RRC A', mode: 'Implied Register', desc: 'Rotates Accumulator bits Right (with or without Carry Flag).', example: 'RR A / RRC A' },
      { op: 'SWAP A', mode: 'Implied Register', desc: 'Swaps higher 4 bits (nibble) with lower 4 bits in Accumulator.', example: 'SWAP A' }
    ],
    bit: [
      { op: 'CLR bit', mode: 'Bit-Addressable Direct', desc: 'Clears specified addressable bit to 0 (e.g. C, P1.0, ACC.7).', example: 'CLR C / CLR P1.0 / CLR 20H.3' },
      { op: 'SETB bit', mode: 'Bit-Addressable Direct', desc: 'Sets specified addressable bit to 1.', example: 'SETB C / SETB P1.2' },
      { op: 'CPL bit', mode: 'Bit-Addressable Direct', desc: 'Complements (inverts) specified addressable bit.', example: 'CPL P1.0' },
      { op: 'ANL C, bit', mode: 'Bit-Addressable Direct', desc: 'Logical AND between Carry Flag and specified bit.', example: 'ANL C, P1.0 / ANL C, /bit' },
      { op: 'ORL C, bit', mode: 'Bit-Addressable Direct', desc: 'Logical OR between Carry Flag and specified bit.', example: 'ORL C, P1.1' },
      { op: 'MOV C, bit / MOV bit, C', mode: 'Bit-Addressable Direct', desc: 'Transfers boolean bit between Carry Flag and bit addressable location.', example: 'MOV C, P3.2 / MOV P1.0, C' }
    ],
    branch: [
      { op: 'LJMP addr16', mode: 'Long Jump (16-bit Direct)', desc: 'Unconditional jump to any address in 64 KB code space.', example: 'LJMP 2000H' },
      { op: 'AJMP addr11', mode: 'Absolute Jump (11-bit Page)', desc: 'Unconditional jump within current 2 KB page.', example: 'AJMP 0100H' },
      { op: 'SJMP rel', mode: 'Short Jump (8-bit Relative)', desc: 'Unconditional relative jump within -128 to +127 bytes range.', example: 'SJMP LOOP' },
      { op: 'JZ rel / JNZ rel', mode: 'Relative Branching', desc: 'Jumps if Accumulator is Zero (JZ) or Not Zero (JNZ).', example: 'JZ ZERO_LABEL' },
      { op: 'CJNE dest, src, rel', mode: 'Immediate/Register Compare', desc: 'Compares destination and source; jumps if Not Equal; updates CY if dest < src.', example: 'CJNE R0, #0A, LOOP' },
      { op: 'DJNZ reg, rel', mode: 'Register Decrement Branch', desc: 'Decrements register by 1; jumps if result is Not Zero (ideal for loops).', example: 'DJNZ R2, AGAIN' },
      { op: 'LCALL addr16 / ACALL addr11', mode: 'Subroutine Call', desc: 'Pushes return address onto stack and calls subroutine.', example: 'LCALL DELAY_10MS' },
      { op: 'RET / RETI', mode: 'Subroutine / Interrupt Return', desc: 'Pops return PC from stack to resume execution (RETI restores interrupt priority).', example: 'RET / RETI' }
    ]
  };

  // Run single ALP step
  const handleStepCode = () => {
    setIsExecuting(true);
    let nextA = regA;
    let nextR = [...registers];
    let nextP1 = p1State;
    let nextPc = pc + 2;

    if (nextR[0] > 0) {
      nextA = (nextA + 1) & 0xff;
      nextP1 = nextA;
      nextA = (~nextA) & 0xff;
      nextR[0] = nextR[0] - 1;
      setExecutionLog(prev => [
        `[PC=0x${nextPc.toString(16).padStart(4, '0').toUpperCase()}] INC A -> A=0x${nextA.toString(16).padStart(2, '0').toUpperCase()}, Output P1=0x${nextP1.toString(16).padStart(2, '0').toUpperCase()}, Decremented R0=${nextR[0]}`,
        ...prev
      ]);
    } else {
      setExecutionLog(prev => ['Program Finished (R0 reached 0). Press Reset to restart.', ...prev]);
    }

    setRegA(nextA);
    setRegisters(nextR);
    setP1State(nextP1);
    setPc(nextPc);
    setIsExecuting(false);
  };

  const handleResetCode = () => {
    setPc(0x0000);
    setRegA(0x00);
    setRegB(0x00);
    setRegisters([0, 5, 0, 0, 0, 0, 0, 0]);
    setP1State(0x00);
    setSp(0x07);
    setDptr(0x0000);
    setExecutionLog(['System Reset. Registers restored to default reset states.']);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 bg-white text-slate-900 rounded-2xl shadow-sm border border-slate-200 space-y-6">
      {/* Upper Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl">
            <Cpu className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 font-display">
              8051 Microcontroller Interactive Suite
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              UNIT IV • Architecture, SFRs, I/O Ports, Instruction Set & Assembly
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'architecture'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            1. Architecture
          </button>
          <button
            onClick={() => setActiveTab('sfr')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'sfr'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            2. SFR & Memory
          </button>
          <button
            onClick={() => setActiveTab('pins')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'pins'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            3. Ports & Pins
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'instructions'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            4. Instructions
          </button>
          <button
            onClick={() => setActiveTab('alp')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'alp'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            5. ALP Simulator
          </button>
        </div>
      </div>

      {/* TAB 1: ARCHITECTURE BLOCK DIAGRAM */}
      {activeTab === 'architecture' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
                <Box className="w-4 h-4 text-indigo-600" />
                8051 Microcontroller Internal Block Diagram
              </h3>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 font-mono">
                Click any component to inspect
              </span>
            </div>

            {/* Interactive Block Diagram Cards */}
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(archBlocks).map(key => {
                const block = archBlocks[key];
                const IconComponent = block.icon;
                const isSelected = selectedArchBlock === key;

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedArchBlock(key)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300 hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <IconComponent className={`w-4 h-4 ${isSelected ? 'text-indigo-100' : 'text-indigo-600'}`} />
                      <span className="font-bold text-xs">{block.title.split('(')[0]}</span>
                    </div>
                    <p className={`text-[11px] line-clamp-2 ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                      {block.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Block Inspection Detail Card */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 text-indigo-600 border-b border-slate-100 pb-3">
              <Sparkles className="w-4 h-4" />
              <h4 className="font-bold text-sm text-slate-900 font-display">
                {archBlocks[selectedArchBlock]?.title}
              </h4>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              {archBlocks[selectedArchBlock]?.desc}
            </p>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-400 block">
                Architectural Breakdown:
              </span>
              {archBlocks[selectedArchBlock]?.details.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SFR & MEMORY MAP */}
      {activeTab === 'sfr' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-indigo-600" />
                Special Function Registers (SFRs) Map (80H – FFH)
              </h3>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter SFRs..."
                  value={sfrSearch}
                  onChange={(e) => setSfrSearch(e.target.value)}
                  className="pl-8 pr-3 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 w-40"
                />
              </div>
            </div>

            {/* SFR Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[380px] overflow-y-auto pr-1">
              {sfrList
                .filter(s => s.name.toLowerCase().includes(sfrSearch.toLowerCase()) || s.addr.toLowerCase().includes(sfrSearch.toLowerCase()))
                .map((sfr) => {
                  const isSel = selectedSfr === sfr.name;
                  return (
                    <button
                      key={sfr.name}
                      onClick={() => setSelectedSfr(sfr.name)}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        isSel
                          ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs font-bold'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300 hover:bg-slate-100/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold">{sfr.name}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isSel ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-600'}`}>
                          {sfr.addr}
                        </span>
                      </div>
                      <span className={`text-[9px] block mt-1 font-mono ${isSel ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {sfr.bitAddr ? 'Bit-Addressable' : 'Byte-Only'}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Program Status Word (PSW) Bit Interactive Inspector */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-mono uppercase text-indigo-600 font-bold tracking-wider">
                Interactive Bit-Level Inspector
              </span>
              <h4 className="text-sm font-bold text-slate-900 font-display mt-0.5">
                Program Status Word (PSW Register @ D0H)
              </h4>
            </div>

            <p className="text-xs text-slate-600">
              Click individual PSW flag bits below to simulate 8086/8051 ALU status updates and register bank selection:
            </p>

            {/* PSW Bit Buttons */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs">
              {['CY', 'AC', 'F0', 'RS1', 'RS0', 'OV', 'P'].map((bit) => {
                const isActive = pswBits[bit];
                return (
                  <button
                    key={bit}
                    onClick={() => setPswBits(prev => ({ ...prev, [bit]: !prev[bit] }))}
                    className={`py-2 rounded-lg border font-bold cursor-pointer transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/60'
                    }`}
                  >
                    <span className="block text-[10px] text-slate-400">{bit}</span>
                    <span>{isActive ? '1' : '0'}</span>
                  </button>
                );
              })}
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-700 font-mono">
                <span>Selected Register Bank:</span>
                <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  Bank {((pswBits.RS1 ? 2 : 0) + (pswBits.RS0 ? 1 : 0))} (RAM Addresses {
                    ((pswBits.RS1 ? 2 : 0) + (pswBits.RS0 ? 1 : 0)) === 0 ? '00H–07H' :
                    ((pswBits.RS1 ? 2 : 0) + (pswBits.RS0 ? 1 : 0)) === 1 ? '08H–0FH' :
                    ((pswBits.RS1 ? 2 : 0) + (pswBits.RS0 ? 1 : 0)) === 2 ? '10H–17H' : '18H–1FH'
                  })
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-700 font-mono">
                <span>Carry Flag (CY):</span>
                <span className={`font-bold ${pswBits.CY ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {pswBits.CY ? 'Set (1) - Arithmetic Carry/Borrow' : 'Cleared (0)'}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-700 font-mono">
                <span>Parity Flag (P):</span>
                <span className={`font-bold ${pswBits.P ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {pswBits.P ? 'Odd Parity in Accumulator' : 'Even Parity'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
              <strong>Selected SFR Description:</strong>
              <p className="font-mono text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                {sfrList.find(s => s.name === selectedSfr)?.desc}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PORTS & PINS */}
      {activeTab === 'pins' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                8051 40-Pin DIP Package & Parallel I/O Ports
              </h3>
              <div className="flex items-center gap-1">
                {(['P0', 'P1', 'P2', 'P3'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setSelectedPort(p)}
                    className={`px-2.5 py-1 text-xs font-bold font-mono rounded-lg border cursor-pointer ${
                      selectedPort === p
                        ? 'bg-indigo-600 text-white border-indigo-700'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Port Circuit & Pin Simulator */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="font-bold text-slate-800">
                  {selectedPort} Output Latch State (0x{portValues[selectedPort].toString(16).toUpperCase().padStart(2, '0')}):
                </span>
                <span className="text-indigo-600 font-semibold">
                  {selectedPort === 'P0' ? 'Open-Drain AD0–AD7' : 'Internal FET + Pull-Up'}
                </span>
              </div>

              {/* Bit LED Controls */}
              <div className="grid grid-cols-8 gap-1.5 text-center font-mono">
                {[7, 6, 5, 4, 3, 2, 1, 0].map(bit => {
                  const bitVal = (portValues[selectedPort] >> bit) & 1;
                  return (
                    <button
                      key={bit}
                      onClick={() => {
                        const newPortVal = portValues[selectedPort] ^ (1 << bit);
                        setPortValues(prev => ({ ...prev, [selectedPort]: newPortVal }));
                      }}
                      className={`p-2 rounded-lg border flex flex-col items-center justify-center cursor-pointer transition-all ${
                        bitVal === 1
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-2xs font-bold'
                          : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}
                    >
                      <span className="text-[9px] text-slate-500 font-semibold">{selectedPort}.{bit}</span>
                      <span className="text-sm mt-0.5">{bitVal}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800 block">Port 0 (Pins 32–39):</span>
                <p className="text-slate-500 text-[11px]">
                  Dual function: True open-drain bidirectional port for I/O; multiplexed address/data bus (AD0–AD7) during external memory operations.
                </p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800 block">Port 3 Alternate Functions:</span>
                <p className="text-slate-500 text-[11px]">
                  P3.0 (RXD), P3.1 (TXD), P3.2 (INT0#), P3.3 (INT1#), P3.4 (T0), P3.5 (T1), P3.6 (WR#), P3.7 (RD#).
                </p>
              </div>
            </div>
          </div>

          {/* Pin Summary Inspector */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono border-b border-slate-100 pb-2">
              Critical Control Signal Pins
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-mono font-bold text-indigo-700 block">EA# / VPP (Pin 31 - External Access):</span>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Held LOW (0V) to force execution from external ROM (0000H–FFFFH); tied HIGH (+5V) to execute from internal 4KB ROM first.
                </p>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-mono font-bold text-indigo-700 block">ALE / PROG# (Pin 30 - Address Latch Enable):</span>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Pulses HIGH at 1/6th clock frequency to demultiplex Port 0 address (A0–A7) into external latch ICs (like 74LS373).
                </p>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-mono font-bold text-indigo-700 block">PSEN# (Pin 29 - Program Store Enable):</span>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Active LOW output signal enabling external EPROM code reads during instruction fetches.
                </p>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-mono font-bold text-indigo-700 block">RESET (Pin 9):</span>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Active HIGH input requiring at least 2 machine cycles to initialize PC to 0000H and reset SFRs.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INSTRUCTION SET & ADDRESSING MODES */}
      {activeTab === 'instructions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'data', label: 'Data Transfer' },
                { id: 'arith', label: 'Arithmetic' },
                { id: 'logic', label: 'Logical' },
                { id: 'bit', label: 'Bit / Boolean' },
                { id: 'branch', label: 'Program Branch' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedInstrCategory(cat.id as any)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border cursor-pointer ${
                    selectedInstrCategory === cat.id
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                placeholder="Search instructions..."
                value={instrSearch}
                onChange={(e) => setInstrSearch(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 w-44"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
            {instructionsData[selectedInstrCategory]
              .filter(i => i.op.toLowerCase().includes(instrSearch.toLowerCase()) || i.desc.toLowerCase().includes(instrSearch.toLowerCase()))
              .map((item, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 hover:border-indigo-300 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-indigo-700">{item.op}</span>
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                      {item.mode}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{item.desc}</p>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 font-mono text-[11px] text-slate-800">
                    <span className="text-slate-400 mr-2">Example:</span>
                    {item.example}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 5: ALP SIMULATOR SANDBOX */}
      {activeTab === 'alp' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 font-mono flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-600" />
                8051 Assembly Editor
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleStepCode}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Play className="w-3.5 h-3.5" />
                  Step Execute
                </button>
                <button
                  onClick={handleResetCode}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-lg hover:bg-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={12}
              className="w-full p-3 font-mono text-xs bg-slate-900 text-indigo-300 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 leading-relaxed shadow-inner"
            />

            {/* Execution Console Log */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 space-y-1 max-h-32 overflow-y-auto">
              <div className="text-slate-500 text-[10px] uppercase font-bold border-b border-slate-800 pb-1">
                Execution Trace Output Log
              </div>
              {executionLog.map((log, idx) => (
                <div key={idx} className="leading-tight">{log}</div>
              ))}
            </div>
          </div>

          {/* Virtual Register & LED Board */}
          <div className="lg:col-span-5 bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono border-b border-slate-200 pb-2">
              Virtual 8051 Hardware Board
            </h4>

            {/* Registers File */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2 text-xs font-mono">
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div className="flex justify-between bg-slate-50 p-2 rounded border">
                  <span>ACC (A):</span>
                  <span className="font-bold text-indigo-600">0x{regA.toString(16).padStart(2, '0').toUpperCase()}</span>
                </div>
                <div className="flex justify-between bg-slate-50 p-2 rounded border">
                  <span>B Reg:</span>
                  <span className="font-bold text-indigo-600">0x{regB.toString(16).padStart(2, '0').toUpperCase()}</span>
                </div>
                <div className="flex justify-between bg-slate-50 p-2 rounded border">
                  <span>PC:</span>
                  <span className="font-bold text-indigo-600">0x{pc.toString(16).padStart(4, '0').toUpperCase()}</span>
                </div>
                <div className="flex justify-between bg-slate-50 p-2 rounded border">
                  <span>SP:</span>
                  <span className="font-bold text-indigo-600">0x{sp.toString(16).padStart(2, '0').toUpperCase()}</span>
                </div>
              </div>

              {/* R0-R7 Bank 0 */}
              <div className="pt-2">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">
                  Register Bank 0 (R0 – R7):
                </span>
                <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
                  {registers.map((val, idx) => (
                    <div key={idx} className="bg-slate-100 p-1.5 rounded border border-slate-200">
                      <span className="text-slate-400 block">R{idx}</span>
                      <span className="font-bold text-slate-800">0x{val.toString(16).padStart(2, '0').toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Port 1 Virtual LED Output */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 font-mono text-xs">
              <span className="font-bold text-slate-800 block">
                Port 1 Virtual LED Bar Output (P1 = 0x{p1State.toString(16).padStart(2, '0').toUpperCase()}):
              </span>

              <div className="grid grid-cols-8 gap-1 text-center">
                {[7, 6, 5, 4, 3, 2, 1, 0].map(bit => {
                  const isOn = ((p1State >> bit) & 1) === 1;
                  return (
                    <div key={bit} className="flex flex-col items-center gap-1">
                      <div className={`w-4 h-4 rounded-full border transition-all ${isOn ? 'bg-emerald-500 border-emerald-600 shadow-md scale-110' : 'bg-slate-200 border-slate-300'}`} />
                      <span className="text-[9px] text-slate-400">P1.{bit}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
