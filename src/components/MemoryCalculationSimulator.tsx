import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  ArrowRight, 
  HelpCircle, 
  Sparkles, 
  Layers, 
  Shield, 
  Shuffle, 
  Database, 
  Cpu, 
  BookOpen, 
  CheckCircle2 
} from 'lucide-react';

interface Preset {
  label: string;
  segmentReg: string;
  segmentVal: string;
  offsetReg: string;
  offsetVal: string;
  desc: string;
}

const presets: Preset[] = [
  {
    label: 'Instruction Fetch (CS:IP)',
    segmentReg: 'CS',
    segmentVal: '1000',
    offsetReg: 'IP',
    offsetVal: '2000',
    desc: 'The next instruction byte is fetched from memory at CS:IP.'
  },
  {
    label: 'Stack Operation (SS:SP)',
    segmentReg: 'SS',
    segmentVal: '2000',
    offsetReg: 'SP',
    offsetVal: 'FFFE',
    desc: 'Pushing/popping values writes/reads from stack at SS:SP.'
  },
  {
    label: 'Data Read (DS:BX)',
    segmentReg: 'DS',
    segmentVal: '3A50',
    offsetReg: 'BX',
    offsetVal: '0100',
    desc: 'Reading a standard data variable with BX serving as base offset.'
  }
];

interface SegmentInfo {
  id: string;
  name: string;
  register: string;
  defaultOffset: string;
  color: string;
  bgLight: string;
  borderCol: string;
  purpose: string;
  needExplanation: string;
  typicalAddressHex: string;
}

const segmentsData: SegmentInfo[] = [
  {
    id: 'cs',
    name: 'Code Segment (CS)',
    register: 'CS',
    defaultOffset: 'IP (Instruction Pointer)',
    color: 'text-indigo-700 bg-indigo-700',
    bgLight: 'bg-indigo-50 border-indigo-200 text-indigo-950',
    borderCol: 'border-indigo-500',
    purpose: 'Stores the executable instructions (machine code) of the running program. The CPU automatically fetches the next instruction byte from the address CS:IP.',
    needExplanation: 'Isolates program executable code from data modifications to prevent accidental program corruption (security).',
    typicalAddressHex: '1000H'
  },
  {
    id: 'ds',
    name: 'Data Segment (DS)',
    register: 'DS',
    defaultOffset: 'BX, SI, DI, or direct displacement',
    color: 'text-emerald-700 bg-emerald-700',
    bgLight: 'bg-emerald-50 border-emerald-200 text-emerald-950',
    borderCol: 'border-emerald-500',
    purpose: 'Stores global variables, constants, and static data used by the program. Default segment for most data reference instructions.',
    needExplanation: 'Allows the program to access memory variable storage cleanly, separated from instructions and temporary scratchpads.',
    typicalAddressHex: '3000H'
  },
  {
    id: 'ss',
    name: 'Stack Segment (SS)',
    register: 'SS',
    defaultOffset: 'SP (Stack Pointer), BP (Base Pointer)',
    color: 'text-rose-700 bg-rose-700',
    bgLight: 'bg-rose-50 border-rose-200 text-rose-950',
    borderCol: 'border-rose-500',
    purpose: 'Reserved memory area used for temporary storage, local variables, subroutine return addresses (during CALL/RET), and parameter passing.',
    needExplanation: 'Prevents growing dynamic stack data from overwriting program code or static data, avoiding stack overflow disasters.',
    typicalAddressHex: '5000H'
  },
  {
    id: 'es',
    name: 'Extra Segment (ES)',
    register: 'ES',
    defaultOffset: 'DI (Destination Index for String Operations)',
    color: 'text-amber-700 bg-amber-700',
    bgLight: 'bg-amber-50 border-amber-200 text-amber-950',
    borderCol: 'border-amber-500',
    purpose: 'An extra data segment typically used for string destination storage, multi-segment data operations, or sharing data tables.',
    needExplanation: 'Enables high-speed block movement instructions (like MOVSB/MOVSW) to copy data across distant logical areas of memory.',
    typicalAddressHex: '7000H'
  }
];

interface MapRegion {
  id: string;
  name: string;
  start: string;
  end: string;
  size: string;
  colorClass: string;
  textColClass: string;
  description: string;
  academicDetail: string;
  details: string[];
  assemblyExample?: string;
}

const mapRegions: MapRegion[] = [
  {
    id: 'bios-rom',
    name: 'Motherboard ROM BIOS (System ROM)',
    start: 'F0000H',
    end: 'FFFFFH',
    size: '64 KB',
    colorClass: 'bg-red-50 border-red-500 hover:bg-red-100/50',
    textColClass: 'text-red-700',
    description: 'Contains POST (Power-On Self-Test) routines, system initialization, BIOS services, and the critical Reset Bootstrap Vector at FFFF0H.',
    academicDetail: 'When the 8086 is powered on or reset, the CS register is loaded with FFFFH and IP with 0000H, yielding the physical starting address FFFF0H. This location points to the instruction in the ROM BIOS that begins program execution.',
    details: [
      'Boot Vector located at FFFF0H (CS=FFFFH, IP=0000H)',
      'Stores basic device drivers (keyboard, screen, disk systems)',
      'Highly persistent, non-volatile read-only silicon'
    ],
    assemblyExample: 'JMP FAR PTR BOOT_INITIALIZE ; Located at FFFF0H'
  },
  {
    id: 'bios-shadow',
    name: 'BIOS ROM Expansion & Shadow Memory',
    start: 'C0000H',
    end: 'EFFFFH',
    size: '192 KB',
    colorClass: 'bg-orange-50 border-orange-500 hover:bg-orange-100/50',
    textColClass: 'text-orange-700',
    description: 'Reserved for controller-specific BIOS extensions (like hard disk controllers and network cards) or shadow system routines.',
    academicDetail: 'Peripheral adapters can mount their own ROM code into this region. During boot-up, the system BIOS scans this address range looking for signature bytes (55H AAH) to execute initialization routines on those cards.',
    details: [
      'Hard Disk controllers typically mapped to C8000H',
      'Video card BIOS often at C0000H to C7FFFH',
      'Option ROM scan range'
    ],
    assemblyExample: 'CMP WORD PTR [SI], 0AA55H\nJZ INITIALIZE_CARD_ROM'
  },
  {
    id: 'vram',
    name: 'Video Display Buffer RAM (VRAM)',
    start: 'A0000H',
    end: 'BFFFFH',
    size: '128 KB',
    colorClass: 'bg-purple-50 border-purple-500 hover:bg-purple-100/50',
    textColClass: 'text-purple-700',
    description: 'Mapped memory region reserved for video display controller screen buffers (CGA, EGA, VGA text and graphics modes).',
    academicDetail: 'Writing directly to this address range updates pixels on the display screen immediately. B8000H is the standard base for 80x25 color text display mode, while A0000H is used for high-resolution graphics.',
    details: [
      'B8000H: Color Text Screen Buffer (each char is 2 bytes: ASCII + Attribute)',
      'B0000H: Monochrome Text Display Buffer',
      'A0000H: VGA Graphics mode frame buffers'
    ],
    assemblyExample: 'MOV AX, 0B800H\nMOV DS, AX\nMOV WORD PTR [0000H], 0A41H ; Writes \'A\' (41H) with attribute 0AH'
  },
  {
    id: 'tpa',
    name: 'Transient Program Area (TPA - User RAM)',
    start: '00500H',
    end: '9FFFFH',
    size: '~638 KB',
    colorClass: 'bg-emerald-50 border-emerald-500 hover:bg-emerald-100/50',
    textColClass: 'text-emerald-700',
    description: 'The largest contiguous block of conventional memory. This is where the operating system (e.g. DOS), user applications, segment registers (CS, DS, SS, ES), and variables reside.',
    academicDetail: 'This region contains standard user programs. Program instructions (CS), variables (DS), and stack frames (SS) are all loaded dynamically within these boundaries.',
    details: [
      'Main application workspace',
      'Dynamically allocated by DOS or memory managers',
      'Accessible for direct user read/write operations'
    ],
    assemblyExample: 'MOV AX, 0050H\nMOV DS, AX'
  },
  {
    id: 'bda',
    name: 'BIOS Data Area (BDA)',
    start: '00400H',
    end: '004FFH',
    size: '256 Bytes',
    colorClass: 'bg-blue-50 border-blue-500 hover:bg-blue-100/50',
    textColClass: 'text-blue-700',
    description: 'Contains active hardware status flags and runtime variables populated by BIOS routines (such as keyboard buffers, COM/LPT port bases, and system timers).',
    academicDetail: 'BIOS services read/write this area frequently to monitor key configurations. For instance, the system clock count (updated 18.2 times/sec by INT 08H) is saved here at address 0046CH.',
    details: [
      '00410H: Equipment List Flag Word',
      '0041EH: 16-word keyboard buffer queue',
      '0046CH: 32-bit System Timer Tick Counter'
    ],
    assemblyExample: 'MOV AX, 0040H\nMOV DS, AX\nMOV AL, [0017H] ; Read keyboard shift-state flags'
  },
  {
    id: 'ivt',
    name: 'Interrupt Vector Table (IVT)',
    start: '00000H',
    end: '003FFH',
    size: '1 KB (1024 Bytes)',
    colorClass: 'bg-indigo-50 border-indigo-500 hover:bg-indigo-100/50',
    textColClass: 'text-indigo-700',
    description: 'Holds the 32-bit addresses (Segment:Offset far pointers) for all 256 hardware and software interrupts supported by the 8086.',
    academicDetail: 'Each of the 256 interrupts requires 4 bytes of memory to store its target Interrupt Service Routine (ISR) address: 2 bytes for Segment (CS) and 2 bytes for Offset (IP). Total size = 256 * 4 = 1024 bytes (1 KB).',
    details: [
      'Vector 0 (00000H): Divide-by-Zero exception',
      'Vector 9 (00024H): Keyboard Interrupt IRQ1',
      'Vector 21H (00084H): DOS System API services entry point'
    ],
    assemblyExample: 'MOV AX, 0000H\nMOV ES, AX\nLES DI, [0084H] ; ES:DI now holds ISR pointer for INT 21H'
  }
];

interface MemoryCalculationSimulatorProps {
  key?: string;
  defaultTab?: 'calculator' | 'segmented-structure' | 'physical-map';
  onlyDifferenceTable?: boolean;
  onlyMemoryBanking?: boolean;
}

export default function MemoryCalculationSimulator({ defaultTab = 'segmented-structure', onlyDifferenceTable = false, onlyMemoryBanking = false }: MemoryCalculationSimulatorProps) {
  const [activeTab, setActiveTab] = useState<'calculator' | 'segmented-structure' | 'physical-map'>(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);
  const [segReg, setSegReg] = useState('CS');
  const [offsetReg, setOffsetReg] = useState('IP');
  const [segValHex, setSegValHex] = useState('1000');
  const [offsetValHex, setOffsetValHex] = useState('2000');
  const [error, setError] = useState<string | null>(null);

  const [physicalAddress, setPhysicalAddress] = useState('12000');
  const [shiftedSeg, setShiftedSeg] = useState('10000');

  const [selectedSegmentId, setSelectedSegmentId] = useState<string>('cs');
  const [selectedIvtType, setSelectedIvtType] = useState<number>(33); // Default 21H (33 in decimal)
  
  // 1MB Physical Memory Map states
  const [selectedMapBlock, setSelectedMapBlock] = useState<string>('ivt');
  const [bankOp, setBankOp] = useState<'read-byte-even' | 'read-byte-odd' | 'read-word-even' | 'read-word-odd' | 'read-ivt-vector'>('read-word-even');

  if (onlyDifferenceTable) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-150">
          <Layers className="w-5 h-5 text-indigo-600 shrink-0" />
          <h3 className="text-[16px] font-bold text-slate-900 font-display">
            Difference Between Overlapping &amp; Non-Overlapping Segmentation
          </h3>
        </div>

        <div className="border border-indigo-150 rounded-xl overflow-hidden text-[13px] bg-white shadow-2xs">
          <div className="grid grid-cols-3 bg-indigo-950 text-white font-bold p-3 text-[13px]">
            <div>Feature / Property</div>
            <div className="text-indigo-200">Non-Overlapping Segmentation</div>
            <div className="text-purple-200">Overlapping Segmentation</div>
          </div>
          
          <div className="grid grid-cols-3 p-3 border-b border-slate-150 items-center">
            <span className="font-semibold text-slate-900">Memory Placement</span>
            <span className="text-slate-700">Each segment occupies a completely separate, distinct 64 KB physical block.</span>
            <span className="text-slate-700">Two or more segments share physical memory addresses partially or fully.</span>
          </div>

          <div className="grid grid-cols-3 p-3 border-b border-slate-150 items-center bg-slate-50/50">
            <span className="font-semibold text-slate-900">Base Addressing</span>
            <span className="text-slate-700">Segment starting bases are placed at least 64 KB apart (or non-intersecting).</span>
            <span className="text-slate-700">Segment bases can start at any 16-byte Paragraph boundary (ending in 0H).</span>
          </div>

          <div className="grid grid-cols-3 p-3 border-b border-slate-150 items-center">
            <span className="font-semibold text-slate-900">Primary Advantage</span>
            <span className="text-indigo-700 font-medium">Maximum security &amp; isolation; stack overflow cannot corrupt code/data.</span>
            <span className="text-purple-700 font-medium">Conserves physical RAM; allows segments to share common data buffers.</span>
          </div>

          <div className="grid grid-cols-3 p-3 border-b border-slate-150 items-center bg-slate-50/50">
            <span className="font-semibold text-slate-900">Memory Efficiency</span>
            <span className="text-slate-700">May waste unused memory gaps if code or data is much smaller than 64 KB.</span>
            <span className="text-slate-700">Eliminates wasted memory gaps for small footprint programs.</span>
          </div>

          <div className="grid grid-cols-3 p-3 items-center">
            <span className="font-semibold text-slate-900">Typical Applications</span>
            <span className="text-slate-700">Multi-user software and large modular programs requiring strict segment protection.</span>
            <span className="text-slate-700">RAM-constrained systems and routines sharing common memory buffers (e.g. CS &amp; DS sharing memory).</span>
          </div>
        </div>
      </div>
    );
  }

  if (onlyMemoryBanking) {
    const isEvenActive = bankOp === 'read-byte-even' || bankOp === 'read-word-even' || bankOp === 'read-word-odd' || bankOp === 'read-ivt-vector';
    const isOddActive = bankOp === 'read-byte-odd' || bankOp === 'read-word-even' || bankOp === 'read-word-odd' || bankOp === 'read-ivt-vector';
    
    let cycles = 1;
    let bheSignal = '1 (HIGH)';
    let a0Signal = '0 (LOW)';
    let dataBusStatus = 'D0 - D7 Lower Data Bus';
    let designVibe = 'border-indigo-500 bg-indigo-50/20';

    if (bankOp === 'read-byte-even') {
      cycles = 1;
      bheSignal = '1 (HIGH)';
      a0Signal = '0 (LOW)';
      dataBusStatus = 'D0 - D7 Lower Data Bus';
      designVibe = 'border-indigo-500 bg-indigo-50/20';
    } else if (bankOp === 'read-byte-odd') {
      cycles = 1;
      bheSignal = '0 (LOW)';
      a0Signal = '1 (HIGH)';
      dataBusStatus = 'D8 - D15 Upper Data Bus';
      designVibe = 'border-indigo-500 bg-indigo-50/20';
    } else if (bankOp === 'read-word-even') {
      cycles = 1;
      bheSignal = '0 (LOW)';
      a0Signal = '0 (LOW)';
      dataBusStatus = 'D0 - D15 Full 16-bit wide bus';
      designVibe = 'border-emerald-500 bg-emerald-50/20';
    } else if (bankOp === 'read-word-odd') {
      cycles = 2;
      bheSignal = 'Cycle 1: 0 (LOW) | Cycle 2: 1 (HIGH)';
      a0Signal = 'Cycle 1: 1 (HIGH) | Cycle 2: 0 (LOW)';
      dataBusStatus = 'Cycle 1: D8-D15 (Lower Byte) | Cycle 2: D0-D7 (Upper Byte)';
      designVibe = 'border-amber-500 bg-amber-50/20';
    } else if (bankOp === 'read-ivt-vector') {
      cycles = 2;
      bheSignal = 'Cycle 1: 0 (LOW) | Cycle 2: 0 (LOW)';
      a0Signal = 'Cycle 1: 0 (LOW) | Cycle 2: 0 (LOW)';
      dataBusStatus = 'Cycle 1: 16-bit IP Offset (00084H) | Cycle 2: 16-bit CS Segment (00086H)';
      designVibe = 'border-blue-500 bg-blue-50/20';
    }

    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-150 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-700 shrink-0" />
            <div>
              <h4 className="font-display font-bold text-[15px] text-slate-950">
                8086 Physical Memory Bank Simulator (Even vs. Odd Banks)
              </h4>
              <p className="text-[12px] text-slate-500">
                Simulate how the 16-bit CPU communicates with two separate 8-bit memory boards (Lower Bank &amp; Upper Bank).
              </p>
            </div>
          </div>
        </div>

        {/* TOP HIGHLIGHT CARD: WHY PHYSICAL MEMORY IS DIVIDED INTO EVEN & ODD BANKS */}
        <div className="bg-indigo-50/80 rounded-xl p-3.5 md:p-4 text-[12.5px] leading-relaxed text-slate-800 shadow-2xs border border-indigo-200/80">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <strong className="text-indigo-950 font-display font-bold text-[13.5px] tracking-tight">
              🎓 Why is Physical Memory Divided into Even &amp; Odd Banks?
            </strong>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mt-2 pt-2 border-t border-indigo-200/60 text-[12px]">
            <div className="bg-white p-2.5 rounded-lg border border-indigo-100 shadow-2xs">
              <strong className="text-indigo-900 block font-semibold mb-0.5">1. 16-Bit Data Bus vs. 8-Bit Memory</strong>
              <span className="text-slate-600 text-[11.5px] leading-tight block">
                The 8086 CPU has a 16-bit data bus (D0–D15), but physical memory cells store data byte-by-byte (8 bits).
              </span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-indigo-100 shadow-2xs">
              <strong className="text-emerald-800 block font-semibold mb-0.5">2. Flexible 8-Bit &amp; 16-Bit Access</strong>
              <span className="text-slate-600 text-[11.5px] leading-tight block">
                Dividing 1 MB RAM into Even (D0–D7) and Odd (D8–D15) banks allows reading a single 8-bit byte OR a full 16-bit word in 1 bus cycle.
              </span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-indigo-100 shadow-2xs">
              <strong className="text-amber-800 block font-semibold mb-0.5">3. Maximum Speed &amp; Efficiency</strong>
              <span className="text-slate-600 text-[11.5px] leading-tight block">
                Prevents bus contention for single-byte reads and provides peak bandwidth for aligned 16-bit word operations.
              </span>
            </div>
          </div>
        </div>

        {/* Operational Selector */}
        <div className="space-y-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Select Memory Bus Operation Type:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => setBankOp('read-byte-even')}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                bankOp === 'read-byte-even'
                  ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-300/40 text-indigo-950 font-bold'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <span className="font-bold text-[13px] flex items-center justify-between w-full">
                <span>1. Read Byte at Even Address</span>
                <span className="font-mono text-[10.5px] bg-slate-200/80 px-1.5 rounded">00040 H</span>
              </span>
              <span className="text-[11px] text-slate-500 mt-1 leading-normal">
                Accesses only the Lower Bank (D0 - D7).
              </span>
            </button>

            <button
              onClick={() => setBankOp('read-byte-odd')}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                bankOp === 'read-byte-odd'
                  ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-300/40 text-indigo-950 font-bold'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <span className="font-bold text-[13px] flex items-center justify-between w-full">
                <span>2. Read Byte at Odd Address</span>
                <span className="font-mono text-[10.5px] bg-slate-200/80 px-1.5 rounded">00041 H</span>
              </span>
              <span className="text-[11px] text-slate-500 mt-1 leading-normal">
                Accesses only the Upper Bank (D8 - D15).
              </span>
            </button>

            <button
              onClick={() => setBankOp('read-word-even')}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                bankOp === 'read-word-even'
                  ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-300/40 text-emerald-950 font-bold'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 font-semibold'
              }`}
            >
              <span className="font-bold text-[13px] flex items-center justify-between w-full">
                <span className="flex items-center gap-1.5 text-emerald-900">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>3. Read Aligned Word (Even)</span>
                </span>
                <span className="font-mono text-[10.5px] bg-emerald-100 text-emerald-800 px-1.5 rounded">00040 H</span>
              </span>
              <span className="text-[11px] text-slate-500 mt-1 leading-normal">
                Accesses BOTH banks simultaneously in 1 single cycle!
              </span>
            </button>

            <button
              onClick={() => setBankOp('read-word-odd')}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                bankOp === 'read-word-odd'
                  ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-300/40 text-amber-950 font-bold'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 font-semibold'
              }`}
            >
              <span className="font-bold text-[13px] flex items-center justify-between w-full">
                <span className="text-amber-900 font-bold">4. Read Misaligned Word (Odd)</span>
                <span className="font-mono text-[10.5px] bg-amber-100 text-amber-800 px-1.5 rounded">00041 H</span>
              </span>
              <span className="text-[11px] text-slate-500 mt-1 leading-normal">
                Requires 2 physical cycles! Splitting transfer.
              </span>
            </button>

            <button
              onClick={() => setBankOp('read-ivt-vector')}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between sm:col-span-2 ${
                bankOp === 'read-ivt-vector'
                  ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-300/40 text-blue-950 font-bold'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 font-semibold'
              }`}
            >
              <span className="font-bold text-[13px] flex items-center justify-between w-full">
                <span className="flex items-center gap-1.5 text-blue-900">
                  <Database className="w-3.5 h-3.5 text-blue-600" />
                  <span>5. Fetch IVT Vector Pointer</span>
                </span>
                <span className="font-mono text-[10.5px] bg-blue-100 text-blue-800 px-1.5 rounded">INT 21H @ 00084 H</span>
              </span>
              <span className="text-[11px] text-slate-500 mt-1 leading-normal">
                Fetches 4-byte CS:IP far pointer across 2 bus cycles!
              </span>
            </button>
          </div>
        </div>

        {/* Hardware Schematic Visualization */}
        <div className={`border rounded-xl p-4.5 ${designVibe} transition-all space-y-4`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-mono tracking-wider font-bold text-slate-500 block">
              Active Hardware Pins &amp; Physical Signals
            </span>
            <div className="flex gap-2">
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                cycles === 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800 animate-pulse'
              }`}>
                Bus Cycles: {cycles} {cycles === 1 ? 'Cycle' : 'Cycles Required'}
              </span>
            </div>
          </div>

          {/* Dual Bank Architecture layout */}
          <div className="grid grid-cols-2 gap-4">
            {/* ODD BANK (UPPER 512 KB) */}
            <div className={`border-2 rounded-xl p-4 text-center transition-all flex flex-col justify-between h-44 shadow-2xs ${
              isOddActive 
                ? 'border-indigo-600 bg-indigo-50/90 text-indigo-950 scale-[1.01] shadow-xs' 
                : 'border-slate-200 bg-slate-50 text-slate-400'
            }`}>
              <div>
                <span className={`text-[10px] font-mono font-bold block uppercase tracking-wider ${isOddActive ? 'text-indigo-700' : 'text-slate-400'}`}>
                  Upper Memory Bank (Odd Bank)
                </span>
                <strong className={`text-[15px] font-sans block mt-1 ${isOddActive ? 'text-indigo-950' : 'text-slate-500'}`}>512 KB Space</strong>
                <span className={`text-[11px] block mt-1 font-mono ${isOddActive ? 'text-slate-600' : 'text-slate-400'}`}>Addresses: 00001H, 00003H, ... FFFFFH</span>
              </div>
              <div className={`pt-2 border-t border-dashed ${isOddActive ? 'border-indigo-200' : 'border-slate-200'}`}>
                <span className={`text-[11px] block font-semibold ${isOddActive ? 'text-slate-700' : 'text-slate-400'}`}>Bus Hook: <strong className={`font-mono ${isOddActive ? 'text-indigo-700' : 'text-slate-500'}`}>D8 - D15</strong></span>
                <span className={`text-[10px] block mt-0.5 ${isOddActive ? 'text-slate-500' : 'text-slate-400'}`}>Enabled by <strong className={`font-mono ${isOddActive ? 'text-indigo-700' : 'text-slate-500'}`}>BHE# = 0</strong></span>
              </div>
            </div>

            {/* EVEN BANK (LOWER 512 KB) */}
            <div className={`border-2 rounded-xl p-4 text-center transition-all flex flex-col justify-between h-44 shadow-2xs ${
              isEvenActive 
                ? 'border-emerald-600 bg-emerald-50/90 text-emerald-950 scale-[1.01] shadow-xs' 
                : 'border-slate-200 bg-slate-50 text-slate-400'
            }`}>
              <div>
                <span className={`text-[10px] font-mono font-bold block uppercase tracking-wider ${isEvenActive ? 'text-emerald-700' : 'text-slate-400'}`}>
                  Lower Memory Bank (Even Bank)
                </span>
                <strong className={`text-[15px] font-sans block mt-1 ${isEvenActive ? 'text-emerald-950' : 'text-slate-500'}`}>512 KB Space</strong>
                <span className={`text-[11px] block mt-1 font-mono ${isEvenActive ? 'text-slate-600' : 'text-slate-400'}`}>Addresses: 00000H, 00002H, ... FFFFEH</span>
              </div>
              <div className={`pt-2 border-t border-dashed ${isEvenActive ? 'border-emerald-200' : 'border-slate-200'}`}>
                <span className={`text-[11px] block font-semibold ${isEvenActive ? 'text-slate-700' : 'text-slate-400'}`}>Bus Hook: <strong className={`font-mono ${isEvenActive ? 'text-emerald-700' : 'text-slate-500'}`}>D0 - D7</strong></span>
                <span className={`text-[10px] block mt-0.5 ${isEvenActive ? 'text-slate-500' : 'text-slate-400'}`}>Enabled by <strong className={`font-mono ${isEvenActive ? 'text-emerald-700' : 'text-slate-500'}`}>A0 = 0</strong></span>
              </div>
            </div>
          </div>

          {/* Physical Signal Bus Table */}
          <div className="bg-white rounded-lg border border-slate-200/60 overflow-hidden text-[12.5px]">
            <div className="grid grid-cols-4 bg-slate-50 font-bold p-2 border-b border-slate-150 text-slate-700 text-center text-[10.5px] uppercase tracking-wider">
              <div>BHE# (Bus High Enable)</div>
              <div>A0 Address Pin</div>
              <div>Data Bus Lines</div>
              <div>Memory Performance</div>
            </div>
            <div className="grid grid-cols-4 p-2 text-center font-mono text-[12px]">
              <div className="text-indigo-700 font-bold">{bheSignal}</div>
              <div className="text-indigo-700 font-bold">{a0Signal}</div>
              <div className="text-slate-700 font-semibold">{dataBusStatus}</div>
              <div className={`font-sans font-bold ${
                bankOp === 'read-word-even' 
                  ? 'text-emerald-600' 
                  : bankOp === 'read-word-odd'
                  ? 'text-amber-600 animate-pulse'
                  : bankOp === 'read-ivt-vector'
                  ? 'text-blue-600 font-bold'
                  : 'text-slate-600'
              }`}>
                {bankOp === 'read-word-even' && 'Peak Speed (1 Cycle)'}
                {bankOp === 'read-word-odd' && 'Split Cycle (Slowdown)'}
                {bankOp === 'read-byte-even' && 'Standard (1 Cycle)'}
                {bankOp === 'read-byte-odd' && 'Standard (1 Cycle)'}
                {bankOp === 'read-ivt-vector' && 'IVT Far Vector (2 Cycles)'}
              </div>
            </div>
          </div>

          {/* Operational Notes */}
          {(bankOp === 'read-word-odd' || bankOp === 'read-ivt-vector' || bankOp === 'read-word-even') && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-[12.5px] leading-relaxed text-slate-800 space-y-2">
              {bankOp === 'read-word-even' && (
                <p className="text-emerald-900 font-sans font-medium">
                  ⚡ <strong>Aligned Word Access Peak Efficiency:</strong> Reading from even address 00040H triggers A0=0 (Lower Bank on D0–D7) and BHE#=0 (Upper Bank on D8–D15) simultaneously, allowing the 8086 to fetch all 16 bits in a <strong>single memory bus cycle</strong>!
                </p>
              )}
              {bankOp === 'read-word-odd' && (
                <p className="text-amber-900 font-sans font-medium">
                  ⚠️ <strong>Misaligned Word Penalty:</strong> Address 00041H is ODD. The lower byte sits in 00041H (Odd Bank), and the upper byte sits in 00042H (Even Bank). The processor cannot activate both banks for two different address alignments at once, forcing the BIU to run <strong>two back-to-back hardware cycles</strong>. Always align variables on even addresses to maximize execution speed!
                </p>
              )}
              {bankOp === 'read-ivt-vector' && (
                <p className="text-blue-900 font-sans font-medium">
                  ⚡ <strong>IVT Vector Transfer (32-bit Far Pointer):</strong> Fetching the 4-byte interrupt vector for INT 21H from address 00084H requires reading CS:IP. The BIU performs <strong>Cycle 1</strong> to fetch the 16-bit Offset (IP = 00084H/00085H) from both banks concurrently, followed immediately by <strong>Cycle 2</strong> to fetch the 16-bit Segment (CS = 00086H/00087H).
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Validate hex input
    const hexRegex = /^[0-9A-Fa-f]{1,4}$/;
    if (!hexRegex.test(segValHex)) {
      setError('Segment address must be a valid 1 to 4 digit Hexadecimal number.');
      return;
    }
    if (!hexRegex.test(offsetValHex)) {
      setError('Offset address must be a valid 1 to 4 digit Hexadecimal number.');
      return;
    }
    setError(null);

    // Compute Physical Address
    const segInt = parseInt(segValHex, 16);
    const offsetInt = parseInt(offsetValHex, 16);
    
    const shifted = segInt << 4; // same as segInt * 16
    const physical = shifted + offsetInt;

    setShiftedSeg(shifted.toString(16).toUpperCase());
    setPhysicalAddress(physical.toString(16).toUpperCase().padStart(5, '0'));
  }, [segValHex, offsetValHex]);

  const selectPreset = (p: Preset) => {
    setSegReg(p.segmentReg);
    setOffsetReg(p.offsetReg);
    setSegValHex(p.segmentVal);
    setOffsetValHex(p.offsetVal);
  };

  const getBinaryString = (hex: string, length = 16) => {
    try {
      const parsed = parseInt(hex, 16);
      if (isNaN(parsed)) return '';
      return parsed.toString(2).padStart(length, '0');
    } catch {
      return '';
    }
  };

  const activeSegmentDetails = segmentsData.find(s => s.id === selectedSegmentId) || segmentsData[0];

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden text-slate-900">
      {/* Tab Switcher / Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80 gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-700" />
          <span className="text-[15px] font-bold text-slate-800 font-display">
            8086 Memory Segmentation &amp; Calculations
          </span>
        </div>

        {/* Tab Selection buttons */}
        <div className="flex flex-wrap items-center bg-slate-200 p-1 rounded-lg gap-1">
          <button
            onClick={() => setActiveTab('segmented-structure')}
            className={`px-3 py-1.5 text-[13px] font-bold rounded-md transition-all cursor-pointer ${
              activeTab === 'segmented-structure' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Definition and Need
          </button>
          <button
            onClick={() => setActiveTab('physical-map')}
            className={`px-3 py-1.5 text-[13px] font-bold rounded-md transition-all cursor-pointer ${
              activeTab === 'physical-map' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            1MB Physical Memory Map
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1.5 text-[13px] font-bold rounded-md transition-all cursor-pointer ${
              activeTab === 'calculator' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Address Calculator
          </button>
        </div>
      </div>

      <div className="flex-1 p-5 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'calculator' && (
            <motion.div
              key="calculator-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-5"
            >
              {/* Left Inputs Panel */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-display font-bold text-[14px] text-slate-950">1. Enter Hexadecimal Parameters</h4>
                    <p className="text-[13px] text-slate-600">8086 registers are 16-bit. Hex digits are from 0-9 and A-F.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Segment */}
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-slate-700 block">
                        Segment Register ({segReg})
                      </label>
                      <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-50 focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600 transition-all">
                        <span className="px-2.5 py-1.5 text-[13px] font-mono font-extrabold text-indigo-700 border-r border-slate-300 bg-indigo-50">{segReg}</span>
                        <input
                          type="text"
                          maxLength={4}
                          value={segValHex}
                          onChange={(e) => setSegValHex(e.target.value.toUpperCase())}
                          className="w-full bg-transparent px-2.5 py-1.5 text-[13px] font-mono text-slate-950 focus:outline-none font-bold"
                          placeholder="e.g. 1000"
                        />
                        <span className="px-2.5 text-[13px] font-mono text-slate-500 font-semibold">H</span>
                      </div>
                    </div>

                    {/* Offset */}
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-slate-700 block">
                        Offset Register ({offsetReg})
                      </label>
                      <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-50 focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600 transition-all">
                        <span className="px-2.5 py-1.5 text-[13px] font-mono font-extrabold text-amber-700 border-r border-slate-300 bg-amber-50">{offsetReg}</span>
                        <input
                          type="text"
                          maxLength={4}
                          value={offsetValHex}
                          onChange={(e) => setOffsetValHex(e.target.value.toUpperCase())}
                          className="w-full bg-transparent px-2.5 py-1.5 text-[13px] font-mono text-slate-950 focus:outline-none font-bold"
                          placeholder="e.g. 2000"
                        />
                        <span className="px-2.5 text-[13px] font-mono text-slate-500 font-semibold">H</span>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg text-rose-900 text-[13px] flex items-center gap-2">
                      <span className="font-bold">Error:</span>
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="border-t border-slate-200 pt-3">
                    <span className="text-[13px] font-bold text-slate-700 block mb-2">Preset Combinations (B.Tech Syllabus):</span>
                    <div className="space-y-2">
                      {presets.map(p => (
                        <button
                          key={p.label}
                          onClick={() => selectPreset(p)}
                          className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-[13px] cursor-pointer"
                        >
                          <div className="font-bold text-slate-900 flex justify-between">
                            <span>{p.label}</span>
                            <span className="font-mono text-indigo-700 font-extrabold">{p.segmentVal}:{p.offsetVal}</span>
                          </div>
                          <p className="text-[13px] text-slate-600 mt-0.5">{p.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50/80 p-4 rounded-xl border border-indigo-200/60 space-y-3">
                  <div>
                    <span className="text-[13px] font-mono font-bold text-indigo-800 uppercase tracking-wide block">How Memory is Segmented</span>
                    <p className="text-slate-800 text-[13px] leading-relaxed mt-1">
                      The 8086 has a <strong>20-bit address bus</strong> to access <strong>1 MB</strong> of memory. However, its internal registers are only <strong>16-bit</strong>. To bridge this gap, memory is organized into logical <strong>segments</strong>:
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-[13px]">
                    <div className="bg-white p-2.5 rounded-lg border border-indigo-200 font-mono">
                      <span className="text-indigo-800 font-bold block">1. 64KB Segments</span>
                      <span className="text-slate-700 text-[13px]">Max size addressable by any 16-bit offset pointer.</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-indigo-200 font-mono">
                      <span className="text-indigo-800 font-bold block">2. Four Active Segments</span>
                      <span className="text-slate-700 text-[13px]">Code (CS), Data (DS), Stack (SS), and Extra (ES).</span>
                    </div>
                  </div>

                  <div className="bg-white/90 p-3 rounded-lg border border-indigo-200/60 text-[13px] leading-relaxed text-slate-700 space-y-1.5">
                    <strong className="text-indigo-900 block font-bold text-[13px]">Purpose of Each Segment Register:</strong>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[12px] font-sans">
                      <div className="bg-indigo-50/70 p-2 rounded border border-indigo-200">
                        <span className="font-extrabold text-indigo-900">CS (Code Segment):</span>
                        <p className="text-slate-700 text-[11.5px] leading-tight">Holds executable program machine instructions. Paired with IP (CS:IP).</p>
                      </div>
                      <div className="bg-emerald-50/70 p-2 rounded border border-emerald-200">
                        <span className="font-extrabold text-emerald-900">DS (Data Segment):</span>
                        <p className="text-slate-700 text-[11.5px] leading-tight">Holds static variables, constants, &amp; global data. Paired with BX/SI/DI (DS:BX).</p>
                      </div>
                      <div className="bg-rose-50/70 p-2 rounded border border-rose-200">
                        <span className="font-extrabold text-rose-900">SS (Stack Segment):</span>
                        <p className="text-slate-700 text-[11.5px] leading-tight">Holds call frames, return addresses, &amp; local variables. Paired with SP/BP (SS:SP).</p>
                      </div>
                      <div className="bg-amber-50/70 p-2 rounded border border-amber-200">
                        <span className="font-extrabold text-amber-900">ES (Extra Segment):</span>
                        <p className="text-slate-700 text-[11.5px] leading-tight">Holds auxiliary data &amp; string destination buffer. Paired with DI (ES:DI).</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/90 p-3 rounded-lg border border-indigo-200/60 text-[13px] leading-relaxed text-slate-700 space-y-1.5">
                    <strong className="text-indigo-900 block font-bold text-[13px]">The Segmentation Mechanics:</strong>
                    <ul className="list-disc pl-4 space-y-1 text-[13px]">
                      <li><strong>Segment Base:</strong> The starting boundary address, stored in CS, DS, SS, or ES. Shifting it left by 4 bits (multiplying by 10H) aligns it to a 20-bit physical boundary.</li>
                      <li><strong>Offset (Effective Address):</strong> The relative distance (displacement) from the segment base.</li>
                      <li><strong>Dynamic Relocation:</strong> Programs can be placed anywhere in physical memory by changing only the segment base registers, while offsets remain unchanged!</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Right Math & Steps Panel */}
              <div className="lg:col-span-7 bg-slate-50/50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <h4 className="font-display font-bold text-[14px] text-slate-950 mb-3 flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-indigo-700" />
                    Physical Address Generation Steps
                  </h4>

                  <div className="space-y-4">
                    {/* Step 1 */}
                    <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[13px] font-bold text-indigo-700">Step 1: Shift Segment Left 4 Bits (Multiply by 10H)</span>
                        <span className="text-[13px] text-slate-500 font-mono">Segment * 10H</span>
                      </div>
                      <div className="flex items-center justify-between font-mono text-[13px] bg-slate-50 p-2.5 rounded border border-slate-200">
                        <div>
                          <span className="text-slate-600 font-sans mr-2">{segReg} value:</span>
                          <strong className="text-indigo-900 font-extrabold">{segValHex}H</strong>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                        <div>
                          <span className="text-slate-600 font-sans mr-2">Shifted Segment:</span>
                          <strong className="text-indigo-950 font-extrabold">{shiftedSeg}H</strong>
                        </div>
                      </div>
                      <div className="text-[13px] font-mono text-slate-700 mt-2">
                        Binary: {getBinaryString(segValHex)} <span className="text-indigo-700 font-extrabold">&lt;&lt; 4</span> = {getBinaryString(shiftedSeg, 20)}
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[13px] font-bold text-amber-700">Step 2: Add Offset Address to Shifted Segment</span>
                        <span className="text-[13px] text-slate-500 font-mono">Shifted Segment + Offset</span>
                      </div>

                      <div className="bg-slate-50 p-3 rounded border border-slate-200 font-mono text-right text-[13px] space-y-1">
                        <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
                          <span className="text-[13px] text-slate-600 font-sans text-left">Shifted Segment Address</span>
                          <span className="text-indigo-950 font-bold">{shiftedSeg} H</span>
                        </div>
                        <div className="flex justify-between pb-1">
                          <span className="text-[13px] text-slate-600 font-sans text-left">Offset Address ({offsetReg})</span>
                          <span className="text-amber-700 font-bold">+ {offsetValHex.padStart(5, '0')} H</span>
                        </div>
                        <div className="flex justify-between border-t-2 border-slate-400 pt-1.5 font-bold text-base">
                          <span className="text-[13px] text-indigo-800 font-sans text-left font-bold flex items-center gap-1">
                            Physical Address (20-Bit)
                          </span>
                          <span className="text-indigo-700 font-extrabold">{physicalAddress} H</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Graphical Address Space representation */}
                <div className="mt-4 pt-3 border-t border-slate-200">
                  <span className="text-[13px] uppercase font-mono tracking-wider text-slate-500 block mb-2 font-bold">Memory Segment Mapping Context</span>
                  <div className="h-8 bg-slate-200 rounded-full overflow-hidden relative flex items-center px-4 border border-slate-300">
                    <div className="absolute left-0 top-0 bottom-0 w-full bg-linear-to-r from-indigo-100 to-indigo-300 opacity-60"></div>
                    {/* Pointer */}
                    <div className="absolute h-full w-1 bg-indigo-700" style={{ left: '35%' }}></div>
                    <div className="absolute text-[13px] font-bold font-mono text-indigo-950" style={{ left: '38%' }}>
                      Segment Base: {segValHex}0H | Target: {physicalAddress}H
                    </div>
                    <div className="absolute left-2 font-mono text-[13px] text-slate-700 z-10 font-bold">00000H</div>
                    <div className="absolute right-2 font-mono text-[13px] text-slate-700 z-10 font-bold">FFFFFH (1 MB)</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'segmented-structure' && (
            <motion.div
              key="segmented-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Definition & Need Callout Box */}
              <div className="bg-gradient-to-r from-indigo-900/10 via-purple-900/10 to-blue-900/10 border-l-4 border-indigo-600 p-4.5 rounded-r-xl space-y-3 shadow-2xs">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-950 font-bold text-[14px]">
                    <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Definition of Memory Segmentation</span>
                  </div>
                  <p className="text-[13px] text-slate-800 leading-relaxed font-medium">
                    <strong>Memory Segmentation</strong> is a memory management technique in the 8086 microprocessor where the complete <strong>1 MB physical address space (00000H to FFFFFH)</strong> is logically divided into smaller blocks called <strong>Segments</strong> (up to 64 KB each). By combining a 16-bit Segment Base Register (CS, DS, SS, ES) with a 16-bit Offset Register (IP, SP, BX, etc.), the 16-bit 8086 processor can generate 20-bit physical addresses to seamlessly access 1 MB of physical RAM.
                  </p>
                </div>

                <div className="pt-2 border-t border-indigo-200/60 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-950 font-bold text-[13.5px]">
                    <Cpu className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Why is Memory Segmentation Needed?</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[12.5px] text-slate-800">
                    <div className="bg-white/80 backdrop-blur-xs p-2.5 rounded-lg border border-indigo-100 shadow-2xs space-y-1">
                      <strong className="text-indigo-900 block font-bold">1. Hardware Gap (16-bit vs 20-bit)</strong>
                      <p className="text-slate-700 leading-snug">
                        Internal registers (IP, SP, BX) are only 16-bit (max 64 KB reach), but physical memory bus is 20-bit (1 MB). Segmentation bridges this by pairing a segment base and an offset to address 1 MB.
                      </p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-xs p-2.5 rounded-lg border border-indigo-100 shadow-2xs space-y-1">
                      <strong className="text-indigo-900 block font-bold">2. Dynamic Code Relocation</strong>
                      <p className="text-slate-700 leading-snug">
                        Programs can be loaded into any free region in RAM without rewriting internal offset addresses. Updating the CS segment register instantly updates the physical execution base.
                      </p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-xs p-2.5 rounded-lg border border-indigo-100 shadow-2xs space-y-1">
                      <strong className="text-indigo-900 block font-bold">3. Logical Code & Data Separation</strong>
                      <p className="text-slate-700 leading-snug">
                        Separates instructions (CS), data (DS), stack (SS), and string targets (ES) into dedicated blocks, preventing data overwrites and improving structural program safety.
                      </p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-xs p-2.5 rounded-lg border border-indigo-100 shadow-2xs space-y-1">
                      <strong className="text-indigo-900 block font-bold">4. Shared Memory & Multi-Tasking</strong>
                      <p className="text-slate-700 leading-snug">
                        Allows multiple tasks or subroutines to share common data/extra segments while maintaining insulated, secure private code execution paths.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 1 MB Memory Bit & Location Math Division in Tab 1 */}
                <div className="pt-3 border-t border-indigo-200/60 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-950 font-bold text-[13.5px]">
                    <Calculator className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>1 MB Memory Bit &amp; Location Math</span>
                  </div>
                  <div className="bg-white/90 p-3.5 rounded-lg border border-indigo-200 text-[12.5px] text-slate-800 space-y-2 shadow-2xs">
                    <p className="leading-relaxed">
                      In the <strong>8086 Microprocessor</strong>, the physical address bus is <strong>20-bit</strong> wide, enabling direct access to <strong>1 MB</strong> of memory space:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11.5px] bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100">
                      <div className="space-y-1">
                        <span className="text-indigo-900 text-[10px] uppercase font-sans font-bold block">Standard Storage Math</span>
                        <div>• 1 Byte = 8 bits</div>
                        <div>• 1 KB = 1024 Bytes</div>
                        <div>• 1 MB = 1024 KB</div>
                        <div className="pt-1 border-t border-dashed border-indigo-200 text-indigo-950 font-extrabold">
                          1,048,576 Bytes
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-indigo-900 text-[10px] uppercase font-sans font-bold block">8086 Physical Limits</span>
                        <div>• 20-bit Bus = 2<sup>20</sup> locations</div>
                        <div>• 2<sup>20</sup> = 1,048,576 locations</div>
                        <div>• 1 Location = 1 Byte (8 bits)</div>
                        <div className="pt-1 border-t border-dashed border-indigo-200 text-indigo-950 font-extrabold">
                          8,388,608 bits
                        </div>
                      </div>
                    </div>

                    <div className="bg-indigo-950 text-indigo-100 rounded-lg p-2 text-center font-mono text-[11.5px] flex justify-around items-center">
                      <div>
                        <span className="text-indigo-300 text-[9.5px] block font-sans font-bold">MAX MEMORY (BYTES)</span>
                        <strong className="text-white text-[13px]">2<sup>20</sup> Bytes = 1 MB</strong>
                      </div>
                      <div className="text-indigo-400 font-light">|</div>
                      <div>
                        <span className="text-indigo-300 text-[9.5px] block font-sans font-bold">MAX MEMORY (BITS)</span>
                        <strong className="text-white text-[13px]">2<sup>23</sup> bits = 8.38 Mbits</strong>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Top Selector Banner */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900 font-display flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-700" />
                    Interactive Memory Segmentation Styles &amp; Types
                  </h3>
                  <p className="text-[13px] text-slate-600 mt-1">
                    Click the buttons to toggle between Overlap and Non-Overlap modes, or hover over registers &amp; segments to inspect them.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedSegmentId('non-overlap')}
                    className={`px-3.5 py-2 rounded-lg text-[13px] font-bold transition-all cursor-pointer ${
                      selectedSegmentId === 'non-overlap' || selectedSegmentId === 'cs' || selectedSegmentId === 'ds' || selectedSegmentId === 'ss' || selectedSegmentId === 'es'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Non-Overlap Segmentation
                  </button>
                  <button
                    onClick={() => setSelectedSegmentId('overlap')}
                    className={`px-3.5 py-2 rounded-lg text-[13px] font-bold transition-all cursor-pointer ${
                      selectedSegmentId === 'overlap'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Overlap Segmentation
                  </button>
                  <button
                    onClick={() => setSelectedSegmentId('io-space')}
                    className={`px-3.5 py-2 rounded-lg text-[13px] font-bold transition-all cursor-pointer ${
                      selectedSegmentId === 'io-space'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    I/O Address Space
                  </button>
                </div>
              </div>

              {/* Grid System containing MPU, Memory Map, and I/O Space / Details */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                
                {/* 1. 8086 MPU Chip (Col-Span-4) */}
                <div className="xl:col-span-4 bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
                    <Cpu className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h4 className="font-mono font-bold text-[14px] text-white tracking-wide">8086/8088 MPU</h4>
                      <span className="text-[11px] text-indigo-400 uppercase font-mono tracking-wider">Microprocessor Unit</span>
                    </div>
                  </div>

                  <div className="space-y-3 font-mono text-[13px]">
                    {/* IP Block */}
                    <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700/60 hover:border-indigo-400/60 transition-all">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-400 text-[13px]">Instruction Pointer</span>
                        <span className="text-white bg-slate-700 px-2 py-0.5 rounded text-[13px] font-bold">IP</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 font-sans">Holds 16-bit offset of next instruction.</p>
                    </div>

                    {/* Segment Registers */}
                    <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/40 space-y-2">
                      <span className="text-[11px] text-indigo-400 font-bold uppercase tracking-wider block">Segment Registers (16-Bit)</span>
                      
                      <div className="grid grid-cols-1 gap-1.5">
                        <button
                          onMouseEnter={() => setSelectedSegmentId('cs')}
                          className={`w-full p-2 rounded-md border text-left transition-all flex justify-between items-center cursor-pointer ${
                            selectedSegmentId === 'cs' ? 'bg-indigo-950/80 border-indigo-500 text-white' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          <span className="font-bold text-[13px]">Code Segment Register</span>
                          <span className="font-bold text-indigo-400 font-mono text-[13px]">CS</span>
                        </button>

                        <button
                          onMouseEnter={() => setSelectedSegmentId('ds')}
                          className={`w-full p-2 rounded-md border text-left transition-all flex justify-between items-center cursor-pointer ${
                            selectedSegmentId === 'ds' ? 'bg-emerald-950/80 border-emerald-500 text-white' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          <span className="font-bold text-[13px]">Data Segment Register</span>
                          <span className="font-bold text-emerald-400 font-mono text-[13px]">DS</span>
                        </button>

                        <button
                          onMouseEnter={() => setSelectedSegmentId('ss')}
                          className={`w-full p-2 rounded-md border text-left transition-all flex justify-between items-center cursor-pointer ${
                            selectedSegmentId === 'ss' ? 'bg-rose-950/80 border-rose-500 text-white' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          <span className="font-bold text-[13px]">Stack Segment Register</span>
                          <span className="font-bold text-rose-400 font-mono text-[13px]">SS</span>
                        </button>

                        <button
                          onMouseEnter={() => setSelectedSegmentId('es')}
                          className={`w-full p-2 rounded-md border text-left transition-all flex justify-between items-center cursor-pointer ${
                            selectedSegmentId === 'es' ? 'bg-amber-950/80 border-amber-500 text-white' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          <span className="font-bold text-[13px]">Extra Segment Register</span>
                          <span className="font-bold text-amber-400 font-mono text-[13px]">ES</span>
                        </button>
                      </div>
                    </div>

                    {/* General Purpose Registers */}
                    <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/40">
                      <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">General Purpose Registers (8/16-Bit)</span>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        <div className="bg-slate-800/80 p-1.5 rounded border border-slate-700 text-center">
                          <span className="text-slate-400 block text-[10px]">Accumulator</span>
                          <strong className="text-white text-[13px]">AX (AH | AL)</strong>
                        </div>
                        <div className="bg-slate-800/80 p-1.5 rounded border border-slate-700 text-center">
                          <span className="text-slate-400 block text-[10px]">Base Register</span>
                          <strong className="text-white text-[13px]">BX (BH | BL)</strong>
                        </div>
                        <div className="bg-slate-800/80 p-1.5 rounded border border-slate-700 text-center">
                          <span className="text-slate-400 block text-[10px]">Count Register</span>
                          <strong className="text-white text-[13px]">CX (CH | CL)</strong>
                        </div>
                        <div className="bg-slate-800/80 p-1.5 rounded border border-slate-700 text-center">
                          <span className="text-slate-400 block text-[10px]">Data Register</span>
                          <strong className="text-white text-[13px]">DX (DH | DL)</strong>
                        </div>
                      </div>
                    </div>

                    {/* Pointer & Index Registers */}
                    <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/40">
                      <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Pointer &amp; Index Registers (16-Bit)</span>
                      <div className="grid grid-cols-4 gap-1 text-center font-bold text-white text-[13px]">
                        <div className="bg-slate-800/80 p-2 rounded border border-slate-700">SP</div>
                        <div className="bg-slate-800/80 p-2 rounded border border-slate-700">BP</div>
                        <div className="bg-slate-800/80 p-2 rounded border border-slate-700">SI</div>
                        <div className="bg-slate-800/80 p-2 rounded border border-slate-700">DI</div>
                      </div>
                    </div>

                    {/* SR Box */}
                    <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700 text-center">
                      <span className="text-slate-400 text-[11px] font-sans mr-2">Status Register / Flags:</span>
                      <strong className="text-indigo-400 text-[13px]">SR</strong>
                    </div>
                  </div>
                </div>

                {/* 2. External Memory Address Space (Col-Span-5) */}
                <div className="xl:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-xs relative">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[13px] font-bold text-slate-800 font-display">
                      1 MB External Physical Memory Map
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 font-bold bg-slate-200 px-2 py-0.5 rounded">
                      {selectedSegmentId === 'overlap' ? 'Overlapping Layout' : 'Non-Overlapping Layout'}
                    </span>
                  </div>

                  {/* 1MB Stack container representing 00000H to FFFFFH */}
                  <div className="border-2 border-slate-300 rounded-xl bg-white p-5 h-[480px] flex flex-col justify-between relative overflow-hidden shadow-inner">
                    {/* Background indicator */}
                    <div className="absolute inset-0 bg-slate-50/20 pointer-events-none"></div>

                    {/* Address Boundary Label Top */}
                    <div className="flex justify-between items-center text-[11px] font-mono font-bold text-slate-400 border-b border-slate-100 pb-1 z-10">
                      <span>Bottom Address: 00000 H</span>
                      <span>(0 Bytes)</span>
                    </div>

                    {/* Render segments depending on overlap state */}
                    <div className="flex-1 relative my-4 flex flex-col justify-around">
                      {selectedSegmentId === 'overlap' ? (
                        /* Overlap Mode */
                        <div className="absolute inset-0 flex flex-col justify-start space-y-1">
                          {/* Segment 1: CS */}
                          <div
                            onMouseEnter={() => setSelectedSegmentId('cs')}
                            className="bg-indigo-50 border-2 border-indigo-500/80 hover:border-indigo-600 rounded-lg p-3 relative h-[100px] shadow-xs cursor-pointer transition-all"
                          >
                            <div className="flex justify-between text-[11px] font-mono text-indigo-900 font-bold">
                              <span>Code Segment (64 KB)</span>
                              <span>CS Base: 1000H</span>
                            </div>
                            <div className="text-[13px] font-semibold text-indigo-950 mt-1">CS:IP Mapping Range</div>
                            <div className="absolute bottom-1 right-2 text-[10px] font-mono text-indigo-600 font-bold">10000H - 1FFFFH</div>
                          </div>

                          {/* Segment 2: DS Overlapped */}
                          <div
                            onMouseEnter={() => setSelectedSegmentId('ds')}
                            className="bg-emerald-50/90 border-2 border-emerald-500 hover:border-emerald-600 rounded-lg p-3 relative h-[100px] -mt-10 shadow-xs cursor-pointer transition-all bg-repeating-linear-stripes"
                            style={{
                              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(16, 185, 129, 0.05) 5px, rgba(16, 185, 129, 0.05) 10px)'
                            }}
                          >
                            <div className="flex justify-between text-[11px] font-mono text-emerald-900 font-bold">
                              <span>Data Segment (64 KB)</span>
                              <span>DS Base: 1400H</span>
                            </div>
                            <div className="text-[13px] font-bold text-emerald-950 mt-1 flex items-center gap-1">
                              <Layers className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Overlaps CS by 48 KB!</span>
                            </div>
                            <div className="absolute bottom-1 right-2 text-[10px] font-mono text-emerald-600 font-bold">14000H - 23FFFH</div>
                          </div>

                          {/* Segment 3: SS Overlapped */}
                          <div
                            onMouseEnter={() => setSelectedSegmentId('ss')}
                            className="bg-rose-50/90 border-2 border-rose-500 hover:border-rose-600 rounded-lg p-3 relative h-[100px] -mt-10 shadow-xs cursor-pointer transition-all"
                            style={{
                              backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 5px, rgba(244, 63, 94, 0.05) 5px, rgba(244, 63, 94, 0.05) 10px)'
                            }}
                          >
                            <div className="flex justify-between text-[11px] font-mono text-rose-900 font-bold">
                              <span>Stack Segment (64 KB)</span>
                              <span>SS Base: 1800H</span>
                            </div>
                            <div className="text-[13px] font-bold text-rose-950 mt-1 flex items-center gap-1">
                              <Layers className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              <span>Overlaps DS by 48 KB!</span>
                            </div>
                            <div className="absolute bottom-1 right-2 text-[10px] font-mono text-rose-600 font-bold">18000H - 27FFFH</div>
                          </div>

                          {/* Segment 4: ES Overlapped */}
                          <div
                            onMouseEnter={() => setSelectedSegmentId('es')}
                            className="bg-amber-50/90 border-2 border-amber-500 hover:border-amber-600 rounded-lg p-3 relative h-[100px] -mt-10 shadow-xs cursor-pointer transition-all"
                            style={{
                              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(245, 158, 11, 0.05) 5px, rgba(245, 158, 11, 0.05) 10px)'
                            }}
                          >
                            <div className="flex justify-between text-[11px] font-mono text-amber-900 font-bold">
                              <span>Extra Segment (64 KB)</span>
                              <span>ES Base: 1C00H</span>
                            </div>
                            <div className="text-[13px] font-bold text-amber-950 mt-1 flex items-center gap-1">
                              <Layers className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>Overlaps SS by 48 KB!</span>
                            </div>
                            <div className="absolute bottom-1 right-2 text-[10px] font-mono text-amber-600 font-bold">1C000H - 2BFFFH</div>
                          </div>
                        </div>
                      ) : (
                        /* Non-Overlap Mode */
                        <div className="absolute inset-0 flex flex-col justify-between py-1">
                          {/* Segment 1: CS */}
                          <div
                            onMouseEnter={() => setSelectedSegmentId('cs')}
                            className={`border-2 rounded-lg p-2 relative cursor-pointer transition-all shadow-xs h-[72px] ${
                              selectedSegmentId === 'cs' ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-400/55' : 'bg-white border-slate-200 hover:border-indigo-400'
                            }`}
                          >
                            <div className="flex justify-between text-[11px] font-mono text-slate-500 font-bold">
                              <span className="text-indigo-800 font-bold">Code Segment (64 KB)</span>
                              <span>CS: 1000H</span>
                            </div>
                            <p className="text-[12px] text-slate-600 mt-0.5">Holds program instructions.</p>
                            <div className="absolute bottom-1 right-2.5 text-[10px] font-mono font-bold text-slate-500">10000H - 1FFFFH</div>
                          </div>

                          {/* Segment 2: DS */}
                          <div
                            onMouseEnter={() => setSelectedSegmentId('ds')}
                            className={`border-2 rounded-lg p-2 relative cursor-pointer transition-all shadow-xs h-[72px] ${
                              selectedSegmentId === 'ds' ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-400/55' : 'bg-white border-slate-200 hover:border-emerald-400'
                            }`}
                          >
                            <div className="flex justify-between text-[11px] font-mono text-slate-500 font-bold">
                              <span className="text-emerald-800 font-bold">Data Segment (64 KB)</span>
                              <span>DS: 3000H</span>
                            </div>
                            <p className="text-[12px] text-slate-600 mt-0.5">Holds static variable storage.</p>
                            <div className="absolute bottom-1 right-2.5 text-[10px] font-mono font-bold text-slate-500">30000H - 3FFFFH</div>
                          </div>

                          {/* Segment 3: SS */}
                          <div
                            onMouseEnter={() => setSelectedSegmentId('ss')}
                            className={`border-2 rounded-lg p-2 relative cursor-pointer transition-all shadow-xs h-[72px] ${
                              selectedSegmentId === 'ss' ? 'bg-rose-50 border-rose-600 ring-2 ring-rose-400/55' : 'bg-white border-slate-200 hover:border-rose-400'
                            }`}
                          >
                            <div className="flex justify-between text-[11px] font-mono text-slate-500 font-bold">
                              <span className="text-rose-800 font-bold">Stack Segment (64 KB)</span>
                              <span>SS: 5000H</span>
                            </div>
                            <p className="text-[12px] text-slate-600 mt-0.5">Holds return vectors &amp; variables.</p>
                            <div className="absolute bottom-1 right-2.5 text-[10px] font-mono font-bold text-slate-500">50000H - 5FFFFH</div>
                          </div>

                          {/* Segment 4: ES */}
                          <div
                            onMouseEnter={() => setSelectedSegmentId('es')}
                            className={`border-2 rounded-lg p-2 relative cursor-pointer transition-all shadow-xs h-[72px] ${
                              selectedSegmentId === 'es' ? 'bg-amber-50 border-amber-600 ring-2 ring-amber-400/55' : 'bg-white border-slate-200 hover:border-amber-400'
                            }`}
                          >
                            <div className="flex justify-between text-[11px] font-mono text-slate-500 font-bold">
                              <span className="text-amber-800 font-bold">Extra Segment (64 KB)</span>
                              <span>ES: 7000H</span>
                            </div>
                            <p className="text-[12px] text-slate-600 mt-0.5">Holds high-speed transfer targets.</p>
                            <div className="absolute bottom-1 right-2.5 text-[10px] font-mono font-bold text-slate-500">70000H - 7FFFFH</div>
                          </div>

                          {/* Reserved Base Memory: Interrupt Vector Table (IVT) */}
                          <div className="border border-slate-300 rounded-lg p-2 relative bg-slate-50 shadow-2xs h-[52px]">
                            <div className="flex justify-between text-[11px] font-mono text-slate-600 font-bold">
                              <span className="text-slate-700 font-bold flex items-center gap-1">
                                <Database className="w-3 h-3 text-slate-500" /> Interrupt Vector Table (IVT - 1 KB)
                              </span>
                              <span>00000H - 003FFH</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">Holds 256 ISR far pointers (4 bytes each)</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Address Boundary Label Bottom */}
                    <div className="flex justify-between items-center text-[11px] font-mono font-bold text-slate-400 border-t border-slate-100 pt-1 z-10">
                      <span>Top Address: FFFFF H</span>
                      <span>(1 MB Total Space)</span>
                    </div>
                  </div>
                </div>

                {/* 3. Right Panel: Input/Output Address Space & Details Console (Col-Span-3) */}
                <div className="xl:col-span-3 space-y-4">
                  
                  {/* Interactive Textbook Style - Input/Output Address Space Block */}
                  <div
                    onMouseEnter={() => setSelectedSegmentId('io-space')}
                    className={`border-2 rounded-2xl p-4 transition-all cursor-pointer bg-white shadow-xs ${
                      selectedSegmentId === 'io-space' ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-300' : 'border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-100">
                      <Database className="w-4 h-4 text-emerald-600" />
                      <span className="text-[13px] font-bold text-slate-800 font-display">Input / Output Address Space</span>
                    </div>
                    
                    <div className="border border-emerald-300 rounded-lg p-3 bg-emerald-50/50 text-center font-mono">
                      <div className="text-[11px] text-emerald-800 font-bold">0000 H</div>
                      <div className="h-12 border-x border-dashed border-emerald-400 my-1 bg-white/75 flex items-center justify-center font-bold text-[13px] text-emerald-950">
                        64 KB Port Address space
                      </div>
                      <div className="text-[11px] text-emerald-800 font-bold">FFFF H</div>
                    </div>
                    
                    <p className="text-[13px] text-slate-600 leading-normal mt-2.5">
                      The 8086 has a dedicated <strong>64KB I/O Space</strong> separate from main memory. It uses instructions like <code>IN</code> and <code>OUT</code> with 16-bit direct port addresses, bypassing memory segment logic.
                    </p>
                  </div>

                  {/* Context Sensitive Details Board */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3.5">
                    <span className="text-[11px] uppercase tracking-wider font-mono font-bold text-indigo-700 block">
                      Active Textbook Explanation
                    </span>

                    {/* Detailed Content based on selected segment */}
                    {selectedSegmentId === 'cs' && (
                      <div className="space-y-2">
                        <strong className="text-indigo-950 font-bold text-[13px] block">Code Segment (CS) explanation:</strong>
                        <p className="text-[13px] text-slate-700 leading-relaxed">
                          Stored instruction codes are fetched by the BIU combining <strong>CS</strong> (Segment Base) and <strong>IP</strong> (Offset). Overlapping allows shared micro-libraries to execute code directly from inside code sections.
                        </p>
                        <div className="bg-white border border-indigo-100 p-2.5 rounded-lg text-[13px] font-mono text-indigo-900 leading-normal">
                          CS × 10H + IP = Physical Fetch Vector
                        </div>
                      </div>
                    )}

                    {selectedSegmentId === 'ds' && (
                      <div className="space-y-2">
                        <strong className="text-emerald-950 font-bold text-[13px] block">Data Segment (DS) explanation:</strong>
                        <p className="text-[13px] text-slate-700 leading-relaxed">
                          Serves as the default storage segment for variables and arrays. By default, offset registers <strong>BX</strong>, <strong>SI</strong>, or <strong>DI</strong> are combined with DS.
                        </p>
                        <div className="bg-white border border-emerald-100 p-2.5 rounded-lg text-[13px] font-mono text-emerald-900 leading-normal">
                          DS × 10H + Offset = Variable Location
                        </div>
                      </div>
                    )}

                    {selectedSegmentId === 'ss' && (
                      <div className="space-y-2">
                        <strong className="text-rose-950 font-bold text-[13px] block">Stack Segment (SS) explanation:</strong>
                        <p className="text-[13px] text-slate-700 leading-relaxed">
                          Manages local variables, parameters, and stack-frame scopes. Linked primarily to <strong>SP</strong> (Stack Pointer) and <strong>BP</strong> (Base Pointer).
                        </p>
                        <div className="bg-white border border-rose-100 p-2.5 rounded-lg text-[13px] font-mono text-rose-900 leading-normal">
                          SS × 10H + SP = Stack Push/Pop Target
                        </div>
                      </div>
                    )}

                    {selectedSegmentId === 'es' && (
                      <div className="space-y-2">
                        <strong className="text-amber-950 font-bold text-[13px] block">Extra Segment (ES) explanation:</strong>
                        <p className="text-[13px] text-slate-700 leading-relaxed">
                          Used heavily during string operations as destination pointer buffer coupling with index register <strong>DI</strong>. This prevents read-write pointers from colliding inside the standard data segment.
                        </p>
                        <div className="bg-white border border-amber-100 p-2.5 rounded-lg text-[13px] font-mono text-amber-900 leading-normal">
                          ES × 10H + DI = String Destination Address
                        </div>
                      </div>
                    )}

                    {selectedSegmentId === 'overlap' && (
                      <div className="space-y-2">
                        <strong className="text-purple-950 font-bold text-[13px] block">Overlap Segmentation Details:</strong>
                        <p className="text-[13px] text-slate-700 leading-relaxed">
                          In the 8086, segments can overlap fully or partially. This happens because segment starting base addresses can be declared at any 16-byte interval (called a Paragraph boundary).
                        </p>
                        <div className="bg-white border border-purple-100 p-2.5 rounded-lg text-slate-600 text-xs leading-normal">
                          <strong className="text-purple-800 text-[13px] block mb-1">Why use Overlap?</strong>
                          <ul className="list-disc pl-4 space-y-1 text-[13px]">
                            <li>Conserves physical memory for small programs (no wasted gaps).</li>
                            <li>Enables shared data transfer vectors across segments.</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {selectedSegmentId === 'non-overlap' && (
                      <div className="space-y-2">
                        <strong className="text-slate-900 font-bold text-[13px] block">Non-Overlap Segmentation Details:</strong>
                        <p className="text-[13px] text-slate-700 leading-relaxed">
                          Each segment is placed in a distinct, isolated 64 KB memory block. No data or code references bleed into other active segments.
                        </p>
                        <div className="bg-white border border-slate-200 p-2.5 rounded-lg text-slate-600 text-xs leading-normal">
                          <strong className="text-slate-800 text-[13px] block mb-1">Why use Non-Overlap?</strong>
                          <ul className="list-disc pl-4 space-y-1 text-[13px]">
                            <li>Provides clean logical organization of Code, Data, and Stack.</li>
                            <li>Ensures program execution security and prevents stack-overflow corruption.</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {selectedSegmentId === 'io-space' && (
                      <div className="space-y-3">
                        <strong className="text-emerald-950 font-bold text-[14px] block border-b border-emerald-100 pb-1">
                          Memory vs. I/O Space: Clear Comparison
                        </strong>
                        <p className="text-[12.5px] text-slate-700 leading-relaxed">
                          The 8086 uses <strong>Isolated I/O</strong>. This means Main Memory and I/O (Input/Output) ports are in <strong>completely separate physical address spaces</strong>, controlled by different pins and instructions.
                        </p>

                        {/* Comparison Table */}
                        <div className="border border-slate-200 rounded-lg overflow-hidden text-[11.5px] bg-white">
                          <div className="grid grid-cols-3 bg-slate-100 font-bold p-1.5 border-b border-slate-200">
                            <div>Feature</div>
                            <div className="text-indigo-700">Main Memory</div>
                            <div className="text-emerald-700">I/O Space</div>
                          </div>
                          
                          <div className="grid grid-cols-3 p-1.5 border-b border-slate-150">
                            <span className="font-semibold text-slate-600">Total Size</span>
                            <span>1 MB (1,048,576 Bytes)</span>
                            <span>64 KB (65,536 Ports)</span>
                          </div>

                          <div className="grid grid-cols-3 p-1.5 border-b border-slate-150">
                            <span className="font-semibold text-slate-600">Address Bus</span>
                            <span>20-bit (00000H - FFFFFH)</span>
                            <span>16-bit (0000H - FFFFH)</span>
                          </div>

                          <div className="grid grid-cols-3 p-1.5 border-b border-slate-150">
                            <span className="font-semibold text-slate-600">M/IO Pin</span>
                            <span className="text-indigo-600 font-bold font-mono">HIGH (+5V)</span>
                            <span className="text-emerald-600 font-bold font-mono">LOW (0V)</span>
                          </div>

                          <div className="grid grid-cols-3 p-1.5 border-b border-slate-150">
                            <span className="font-semibold text-slate-600">Addressing</span>
                            <span>Segmented (Base + Offset)</span>
                            <span>Direct Port (No Segments)</span>
                          </div>

                          <div className="grid grid-cols-3 p-1.5">
                            <span className="font-semibold text-slate-600">Assembly code</span>
                            <code className="text-indigo-800">MOV AL, [BX]</code>
                            <code className="text-emerald-800">IN AL, DX</code>
                          </div>
                        </div>

                        <div className="bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200 text-[12px] leading-normal space-y-1">
                          <strong className="text-emerald-950 font-bold block">💡 The M/IO Pin Secret:</strong>
                          <p className="text-slate-800">
                            When the CPU executes <code>IN</code> or <code>OUT</code>, it sets the <strong>M/IO Pin to LOW (0)</strong>. This signal tells the system board to activate I/O chip-select lines instead of RAM chips, keeping both worlds safely separated!
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Fallback default */}
                    {!['cs', 'ds', 'ss', 'es', 'overlap', 'non-overlap', 'io-space'].includes(selectedSegmentId) && (
                      <div className="space-y-2">
                        <strong className="text-slate-900 font-bold text-[13px] block">Quick Exam Guide:</strong>
                        <p className="text-[13px] text-slate-700 leading-relaxed">
                          Hover or select any microprocessor register or segment block to view detailed syllabus explanations.
                        </p>
                        <div className="bg-white border border-slate-200 p-2.5 rounded-lg text-slate-600 text-xs leading-normal">
                          Learn the physical address formulation and segmentation styles dynamically.
                        </div>
                      </div>
                    )}

                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {activeTab === 'physical-map' && (
            <motion.div
              key="physical-map-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Top Banner */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900 font-display flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-700" />
                    8086 Physical Address Space &amp; Hardware Layout (1 MB)
                  </h3>
                  <p className="text-[13px] text-slate-600 mt-1">
                    Explore the allocation of the 20-bit address bus and simulate the hardware-level Even/Odd Memory Bank organization.
                  </p>
                </div>
                <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-right">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Addressable Range</span>
                  <strong className="text-[13px] font-mono text-indigo-700">00000 H — FFFFF H</strong>
                </div>
              </div>

              {/* Main Content Split Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* COLUMN 1: The 1MB Physical Memory Map Stack (Col-Span-5) */}
                <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-4.5 shadow-xs relative">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[12.5px] font-bold text-slate-800 font-display flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-700" />
                      Physical Map Stack (00000H - FFFFFH)
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold bg-slate-200 px-2 py-0.5 rounded uppercase tracking-wider">
                      Interactive
                    </span>
                  </div>

                  {/* 1MB Stack container representing 00000H to FFFFFH */}
                  <div className="border border-slate-300 rounded-xl bg-slate-100 p-3.5 flex flex-col justify-between relative shadow-inner space-y-2 min-h-[520px]">
                    
                    {/* Upper Memory Area Indicator Line */}
                    <div className="absolute left-0 right-0 top-[28%] border-t border-dashed border-red-300 pointer-events-none flex justify-center">
                      <span className="text-[9px] font-mono bg-red-100 text-red-700 px-1.5 py-0.5 rounded -mt-2.5 font-bold border border-red-200 shadow-2xs">
                        Upper Memory Boundary (A0000H)
                      </span>
                    </div>

                    {/* Address Boundary Label Top */}
                    <div className="flex justify-between items-center text-[10.5px] font-mono font-bold text-slate-500 border-b border-slate-200 pb-1.5 z-10">
                      <span>FFFFF H (Top of Memory)</span>
                      <span>1,048,575 Bytes</span>
                    </div>

                    {/* Proportional Render of mapRegions */}
                    <div className="flex-1 flex flex-col justify-between space-y-1.5 py-2">
                      {mapRegions.map((region) => {
                        const isSelected = selectedMapBlock === region.id;
                        return (
                          <div
                            key={region.id}
                            onClick={() => setSelectedMapBlock(region.id)}
                            className={`border-2 rounded-lg p-2.5 relative cursor-pointer transition-all flex flex-col justify-between ${region.colorClass} ${
                              isSelected 
                                ? 'ring-3 ring-indigo-500/30 border-indigo-600 scale-[1.01] shadow-md z-10' 
                                : 'border-slate-300 shadow-2xs hover:scale-[1.005]'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="font-bold text-[12.5px] text-slate-900 leading-tight">
                                {region.name}
                              </span>
                              <span className="text-[10px] font-mono font-bold bg-white/80 border border-slate-200 text-slate-600 px-1.5 py-0.25 rounded shrink-0">
                                {region.size}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-end mt-1 text-[10.5px] font-mono font-bold text-slate-500">
                              <span className="text-slate-400">Range:</span>
                              <span className="text-slate-600">{region.start} - {region.end}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Address Boundary Label Bottom */}
                    <div className="flex justify-between items-center text-[10.5px] font-mono font-bold text-slate-500 border-t border-slate-200 pt-1.5 z-10">
                      <span>00000 H (Base of Memory)</span>
                      <span>0 Bytes (IVT Vector 0)</span>
                    </div>
                  </div>

                  {/* 1 MB Memory Bit & Location Math Card */}
                  <div className="mt-3 bg-gradient-to-br from-indigo-50/80 to-purple-50/50 border border-indigo-150 rounded-xl p-3.5 space-y-2.5 shadow-2xs">
                    <div className="flex items-center gap-2 text-[12px] uppercase tracking-wider font-mono font-bold text-indigo-900 border-b border-indigo-100 pb-1.5">
                      <Calculator className="w-4 h-4 text-indigo-600" />
                      <span>1 MB Memory Bit &amp; Location Math</span>
                    </div>
                    <div className="text-[12px] text-slate-700 space-y-2">
                      <p className="leading-relaxed font-medium">
                        In the <strong>8086 Microprocessor</strong>, the physical address bus is <strong>20-bit</strong> wide.
                      </p>
                      
                      {/* Equations Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px] bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                        <div className="space-y-1">
                          <span className="text-slate-500 text-[9.5px] uppercase font-sans font-bold block">Standard Storage Math</span>
                          <div>• 1 Byte = 8 bits</div>
                          <div>• 1 KB = 1024 Bytes</div>
                          <div>• 1 MB = 1024 KB</div>
                          <div className="pt-1 border-t border-dashed border-slate-200 text-indigo-900 font-bold">
                            1,048,576 Bytes
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-slate-500 text-[9.5px] uppercase font-sans font-bold block">8086 Physical Limits</span>
                          <div>• 20-bit Bus = 2<sup>20</sup> locations</div>
                          <div>• 2<sup>20</sup> = 1,048,576 locations</div>
                          <div>• 1 Location = 1 Byte (8 bits)</div>
                          <div className="pt-1 border-t border-dashed border-slate-200 text-indigo-900 font-bold">
                            8,388,608 bits
                          </div>
                        </div>
                      </div>

                      {/* Exponential Summary */}
                      <div className="bg-indigo-950 text-indigo-100 rounded-lg p-2.5 text-center font-mono text-[11.5px] space-y-1 shadow-2xs">
                        <div className="flex justify-around items-center">
                          <div>
                            <span className="text-indigo-300 text-[9.5px] block font-sans font-bold">MAX MEMORY (BYTES)</span>
                            <strong className="text-white text-[13px]">2<sup>20</sup> Bytes</strong>
                          </div>
                          <div className="text-indigo-400 font-light">|</div>
                          <div>
                            <span className="text-indigo-300 text-[9.5px] block font-sans font-bold">MAX MEMORY (BITS)</span>
                            <strong className="text-white text-[13px]">2<sup>23</sup> bits</strong>
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-600 italic leading-snug">
                        * Since each memory location stores exactly 1 byte (8 bits), the maximum addressable space of 1,048,576 locations matches exactly 1 MB (1,048,576 Bytes = 8,388,608 bits).
                      </p>
                    </div>
                  </div>

                  {/* Summary Footer */}
                  <div className="mt-3 text-[11.5px] text-slate-500 leading-normal bg-white p-2.5 border border-slate-150 rounded-lg">
                    <p className="italic">
                      <strong>Microprocessor Fact:</strong> The 8086 uses 20 address lines (A0-A19) giving exactly 2<sup>20</sup> = 1,048,576 memory locations, ranging from 00000H to FFFFFH. Click any block above to load the study file.
                    </p>
                  </div>
                </div>

                {/* COLUMN 2: Inspector Panel & Hardware Simulator (Col-Span-7) */}
                <div className="lg:col-span-7 space-y-5">
                  
                  {/* CARD A: Region Inspector */}
                  {(() => {
                    const block = mapRegions.find(r => r.id === selectedMapBlock) || mapRegions[mapRegions.length - 1];
                    return (
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4.5 h-4.5 text-indigo-700" />
                            <h4 className="font-display font-bold text-[14px] text-slate-950">
                              Academic Segment File: <span className={block.textColClass}>{block.name}</span>
                            </h4>
                          </div>
                          <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {block.size} ({block.start} - {block.end})
                          </span>
                        </div>

                        <div className="space-y-3.5">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Functional Description</span>
                            <p className="text-[13px] text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                              {block.description}
                            </p>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Microprocessor &amp; Hardware Context</span>
                            <p className="text-[13px] text-slate-700 leading-relaxed font-sans">
                              {block.academicDetail}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Detailed Subsections</span>
                              <ul className="space-y-1.5">
                                {block.details.map((detail, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-[12.5px] text-slate-600">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                    <span>{detail}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {block.assemblyExample && (
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Sample Assembly / CPU Routine</span>
                                <div className="bg-slate-900 rounded-lg p-3 border border-slate-800 font-mono text-[11.5px] text-slate-300 leading-normal whitespace-pre-wrap shadow-inner relative">
                                  <span className="absolute right-2 top-1.5 text-[9px] font-sans text-slate-500 uppercase font-bold tracking-wider">8086 Assembly</span>
                                  {block.assemblyExample}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* CARD B: Even/Odd Memory Bank Hardware Simulator */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4.5 h-4.5 text-indigo-700" />
                        <div>
                          <h4 className="font-display font-bold text-[14px] text-slate-950">
                            8086 Physical Memory Bank Simulator (Even vs. Odd Banks)
                          </h4>
                          <p className="text-[12px] text-slate-500">
                            See how the 16-bit CPU communicates with two separate 8-bit memory boards.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Operational Selector */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                        Select Memory Bus Operation Type:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          onClick={() => setBankOp('read-byte-even')}
                          className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            bankOp === 'read-byte-even'
                              ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-300/40 text-indigo-950'
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <span className="font-bold text-[13px] flex items-center justify-between w-full">
                            <span>1. Read Byte at Even Address</span>
                            <span className="font-mono text-[10.5px] bg-slate-200/80 px-1.5 rounded">00040 H</span>
                          </span>
                          <span className="text-[11px] text-slate-500 mt-1 leading-normal">
                            Accesses only the Lower Bank (D0 - D7).
                          </span>
                        </button>

                        <button
                          onClick={() => setBankOp('read-byte-odd')}
                          className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            bankOp === 'read-byte-odd'
                              ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-300/40 text-indigo-950'
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <span className="font-bold text-[13px] flex items-center justify-between w-full">
                            <span>2. Read Byte at Odd Address</span>
                            <span className="font-mono text-[10.5px] bg-slate-200/80 px-1.5 rounded">00041 H</span>
                          </span>
                          <span className="text-[11px] text-slate-500 mt-1 leading-normal">
                            Accesses only the Upper Bank (D8 - D15).
                          </span>
                        </button>

                        <button
                          onClick={() => setBankOp('read-word-even')}
                          className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            bankOp === 'read-word-even'
                              ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-300/40 text-emerald-950 font-bold'
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 font-semibold'
                          }`}
                        >
                          <span className="font-bold text-[13px] flex items-center justify-between w-full">
                            <span className="flex items-center gap-1.5 text-emerald-900">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                              <span>3. Read Aligned Word (Even)</span>
                            </span>
                            <span className="font-mono text-[10.5px] bg-emerald-100 text-emerald-800 px-1.5 rounded">00040 H</span>
                          </span>
                          <span className="text-[11px] text-slate-500 mt-1 leading-normal">
                            Accesses BOTH banks simultaneously in 1 single cycle!
                          </span>
                        </button>

                        <button
                          onClick={() => setBankOp('read-word-odd')}
                          className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            bankOp === 'read-word-odd'
                              ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-300/40 text-amber-950 font-bold'
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 font-semibold'
                          }`}
                        >
                          <span className="font-bold text-[13px] flex items-center justify-between w-full">
                            <span className="text-amber-900 font-bold">4. Read Misaligned Word (Odd)</span>
                            <span className="font-mono text-[10.5px] bg-amber-100 text-amber-800 px-1.5 rounded">00041 H</span>
                          </span>
                          <span className="text-[11px] text-slate-500 mt-1 leading-normal">
                            Requires 2 physical cycles! Splitting transfer.
                          </span>
                        </button>

                        <button
                          onClick={() => setBankOp('read-ivt-vector')}
                          className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            bankOp === 'read-ivt-vector'
                              ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-300/40 text-blue-950 font-bold'
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 font-semibold'
                          }`}
                        >
                          <span className="font-bold text-[13px] flex items-center justify-between w-full">
                            <span className="flex items-center gap-1.5 text-blue-900">
                              <Database className="w-3.5 h-3.5 text-blue-600" />
                              <span>5. Fetch IVT Vector Pointer</span>
                            </span>
                            <span className="font-mono text-[10.5px] bg-blue-100 text-blue-800 px-1.5 rounded">INT 21H @ 00084 H</span>
                          </span>
                          <span className="text-[11px] text-slate-500 mt-1 leading-normal">
                            Fetches 4-byte CS:IP far pointer across 2 bus cycles!
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Hardware Schematic Visualization */}
                    {(() => {
                      const isEvenActive = bankOp === 'read-byte-even' || bankOp === 'read-word-even' || bankOp === 'read-word-odd' || bankOp === 'read-ivt-vector';
                      const isOddActive = bankOp === 'read-byte-odd' || bankOp === 'read-word-even' || bankOp === 'read-word-odd' || bankOp === 'read-ivt-vector';
                      
                      let cycles = 1;
                      let bheSignal = '1 (HIGH)';
                      let a0Signal = '0 (LOW)';
                      let dataBusStatus = 'D0 - D7 Active';
                      let designVibe = 'border-indigo-500 bg-indigo-50/50';

                      if (bankOp === 'read-byte-even') {
                        cycles = 1;
                        bheSignal = '1 (HIGH)';
                        a0Signal = '0 (LOW)';
                        dataBusStatus = 'D0 - D7 Lower Data Bus';
                        designVibe = 'border-indigo-500 bg-indigo-50/20';
                      } else if (bankOp === 'read-byte-odd') {
                        cycles = 1;
                        bheSignal = '0 (LOW)';
                        a0Signal = '1 (HIGH)';
                        dataBusStatus = 'D8 - D15 Upper Data Bus';
                        designVibe = 'border-indigo-500 bg-indigo-50/20';
                      } else if (bankOp === 'read-word-even') {
                        cycles = 1;
                        bheSignal = '0 (LOW)';
                        a0Signal = '0 (LOW)';
                        dataBusStatus = 'D0 - D15 Full 16-bit wide bus';
                        designVibe = 'border-emerald-500 bg-emerald-50/20';
                      } else if (bankOp === 'read-word-odd') {
                        cycles = 2;
                        bheSignal = 'Cycle 1: 0 (LOW) | Cycle 2: 1 (HIGH)';
                        a0Signal = 'Cycle 1: 1 (HIGH) | Cycle 2: 0 (LOW)';
                        dataBusStatus = 'Cycle 1: D8-D15 (Lower Byte) | Cycle 2: D0-D7 (Upper Byte)';
                        designVibe = 'border-amber-500 bg-amber-50/20';
                      } else if (bankOp === 'read-ivt-vector') {
                        cycles = 2;
                        bheSignal = 'Cycle 1: 0 (LOW) | Cycle 2: 0 (LOW)';
                        a0Signal = 'Cycle 1: 0 (LOW) | Cycle 2: 0 (LOW)';
                        dataBusStatus = 'Cycle 1: 16-bit IP Offset (00084H) | Cycle 2: 16-bit CS Segment (00086H)';
                        designVibe = 'border-blue-500 bg-blue-50/20';
                      }

                      return (
                        <div className={`border rounded-xl p-4.5 ${designVibe} transition-all space-y-4`}>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] uppercase font-mono tracking-wider font-bold text-slate-500 block">
                              Active Hardware Pins &amp; Physical Signals
                            </span>
                            <div className="flex gap-2">
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                cycles === 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800 animate-pulse'
                              }`}>
                                Bus Cycles: {cycles} {cycles === 1 ? 'Cycle' : 'Cycles Required'}
                              </span>
                            </div>
                          </div>

                          {/* Dual Bank Architecture layout */}
                          <div className="grid grid-cols-2 gap-4">
                            {/* ODD BANK (UPPER 512 KB) */}
                            <div className={`border-2 rounded-xl p-4 text-center transition-all flex flex-col justify-between h-44 shadow-2xs ${
                              isOddActive 
                                ? 'border-indigo-500 bg-indigo-950 text-white scale-[1.01] shadow-md' 
                                : 'border-slate-300 bg-slate-100 text-slate-400'
                            }`}>
                              <div>
                                <span className={`text-[10px] font-mono font-bold block uppercase tracking-wider ${isOddActive ? 'text-indigo-300' : 'text-slate-400'}`}>
                                  Upper Memory Bank (Odd Bank)
                                </span>
                                <strong className="text-[15px] font-sans block mt-1">512 KB Space</strong>
                                <span className="text-[11px] block mt-1 font-mono text-slate-400">Addresses: 00001H, 00003H, ... FFFFFH</span>
                              </div>
                              <div className="pt-2 border-t border-dashed border-slate-700/50">
                                <span className="text-[11px] block font-semibold text-slate-300">Bus Hook: <strong className="font-mono text-indigo-300">D8 - D15</strong></span>
                                <span className="text-[10px] block mt-0.5 text-slate-400">Enabled by <strong className="font-mono text-indigo-300">BHE# = 0</strong></span>
                              </div>
                            </div>

                            {/* EVEN BANK (LOWER 512 KB) */}
                            <div className={`border-2 rounded-xl p-4 text-center transition-all flex flex-col justify-between h-44 shadow-2xs ${
                              isEvenActive 
                                ? 'border-emerald-500 bg-emerald-950 text-white scale-[1.01] shadow-md' 
                                : 'border-slate-300 bg-slate-100 text-slate-400'
                            }`}>
                              <div>
                                <span className={`text-[10px] font-mono font-bold block uppercase tracking-wider ${isEvenActive ? 'text-emerald-300' : 'text-slate-400'}`}>
                                  Lower Memory Bank (Even Bank)
                                </span>
                                <strong className="text-[15px] font-sans block mt-1">512 KB Space</strong>
                                <span className="text-[11px] block mt-1 font-mono text-slate-400">Addresses: 00000H, 00002H, ... FFFFEH</span>
                              </div>
                              <div className="pt-2 border-t border-dashed border-slate-700/50">
                                <span className="text-[11px] block font-semibold text-slate-300">Bus Hook: <strong className="font-mono text-emerald-300">D0 - D7</strong></span>
                                <span className="text-[10px] block mt-0.5 text-slate-400">Enabled by <strong className="font-mono text-emerald-300">A0 = 0</strong></span>
                              </div>
                            </div>
                          </div>

                          {/* Physical Signal Bus Table */}
                          <div className="bg-white rounded-lg border border-slate-200/60 overflow-hidden text-[12.5px]">
                            <div className="grid grid-cols-4 bg-slate-50 font-bold p-2 border-b border-slate-150 text-slate-700 text-center text-[10.5px] uppercase tracking-wider">
                              <div>BHE# (Bus High Enable)</div>
                              <div>A0 Address Pin</div>
                              <div>Data Bus Lines</div>
                              <div>Memory Performance</div>
                            </div>
                            <div className="grid grid-cols-4 p-2 text-center font-mono text-[12px]">
                              <div className="text-indigo-700 font-bold">{bheSignal}</div>
                              <div className="text-indigo-700 font-bold">{a0Signal}</div>
                              <div className="text-slate-700 font-semibold">{dataBusStatus}</div>
                              <div className={`font-sans font-bold ${
                                bankOp === 'read-word-even' 
                                  ? 'text-emerald-600' 
                                  : bankOp === 'read-word-odd'
                                  ? 'text-amber-600 animate-pulse'
                                  : bankOp === 'read-ivt-vector'
                                  ? 'text-blue-600 font-bold'
                                  : 'text-slate-600'
                              }`}>
                                {bankOp === 'read-word-even' && 'Peak Speed (1 Cycle)'}
                                {bankOp === 'read-word-odd' && 'Split Cycle (Slowdown)'}
                                {bankOp === 'read-byte-even' && 'Standard (1 Cycle)'}
                                {bankOp === 'read-byte-odd' && 'Standard (1 Cycle)'}
                                {bankOp === 'read-ivt-vector' && 'IVT Far Vector (2 Cycles)'}
                              </div>
                            </div>
                          </div>

                          {/* Academic explanation block */}
                          <div className="bg-slate-900 rounded-lg p-3 text-[12.5px] leading-relaxed text-slate-300">
                            <strong className="text-white block text-[13px] mb-1 font-sans">🎓 Syllabus Guide: Why does the 8086 split physical memory into two banks?</strong>
                            <p className="font-sans">
                              The 8086 is a <strong>16-bit processor</strong> but must remain compatible with 8-bit peripherals and single-byte operations. Splitting RAM into Even and Odd physical banks allows the system board to read 8 bits from either bank independently, or fetch a full 16-bit word from both banks simultaneously (aligned word access). 
                            </p>
                            {bankOp === 'read-word-odd' && (
                              <p className="mt-2 text-amber-300 border-t border-slate-800 pt-2 font-sans font-medium">
                                ⚠️ <strong>Misaligned word penalty:</strong> Since address 00041H is ODD, the lower byte of the word sits in address 00041H (Odd Bank), but the upper byte sits in address 00042H (Even Bank). The processor cannot activate both banks at once for two different address alignments, forcing the BIU to run <strong>two back-to-back hardware cycles</strong>. Align variables on even addresses to keep code running fast!
                              </p>
                            )}
                            {bankOp === 'read-ivt-vector' && (
                              <p className="mt-2 text-blue-300 border-t border-slate-800 pt-2 font-sans font-medium">
                                ⚡ <strong>IVT Vector Transfer:</strong> Fetching the 4-byte interrupt vector for INT 21H from address 00084H requires reading a 32-bit far pointer (CS:IP). Since the 8086 data bus is 16-bit wide, the BIU performs <strong>Cycle 1</strong> to fetch the 16-bit Offset (IP = 00084H/00085H) from both Even and Odd banks simultaneously, followed immediately by <strong>Cycle 2</strong> to fetch the 16-bit Segment (CS = 00086H/00087H)!
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
