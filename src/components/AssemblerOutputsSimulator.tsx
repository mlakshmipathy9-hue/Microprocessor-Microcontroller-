import React, { useState } from 'react';
import { 
  FileCode2, 
  Binary, 
  FileText, 
  Search, 
  HelpCircle, 
  Layers, 
  Info, 
  ArrowRight, 
  Eye, 
  CheckCircle2, 
  FileSpreadsheet,
  Cpu
} from 'lucide-react';

const objFileDiagram = '/src/assets/images/obj_file_diagram_1783932108262.jpg';
const lstFileDiagram = '/src/assets/images/lst_file_diagram_1783932120073.jpg';
const exeFileDiagram = '/src/assets/images/exe_file_diagram_1783932134035.jpg';

interface LstLine {
  lineNum: number;
  offset: string;
  hexCode: string;
  sourceCode: string;
  comment: string;
  explanation: string;
  type: 'directive' | 'instruction' | 'data' | 'header';
}

const MOCK_LST_LINES: LstLine[] = [
  {
    lineNum: 1,
    offset: '',
    hexCode: '',
    sourceCode: '          .MODEL SMALL',
    comment: 'Set memory model size',
    explanation: 'Directive guiding MASM on segment architecture. No CPU machine code is generated.',
    type: 'directive'
  },
  {
    lineNum: 2,
    offset: '',
    hexCode: '',
    sourceCode: '          .STACK 100H',
    comment: 'Define stack segment size',
    explanation: 'Directs assembler to reserve 256 bytes (100H) for the CPU execution stack.',
    type: 'directive'
  },
  {
    lineNum: 3,
    offset: '0000',
    hexCode: '',
    sourceCode: '          .DATA',
    comment: 'Begin data segment',
    explanation: 'Indicates the start of the Data segment (usually _DATA at offset 0000H).',
    type: 'directive'
  },
  {
    lineNum: 4,
    offset: '0000',
    hexCode: '0064 [ ?? ]',
    sourceCode: 'BUFF      DB 100 DUP(?)',
    comment: 'Allocate 100 uninitialized bytes',
    explanation: 'DB (Define Byte) allocates 100 bytes (0064H) of memory filled with uninitialized values (?).',
    type: 'data'
  },
  {
    lineNum: 5,
    offset: '0064',
    hexCode: '48 65 6C 6C 6F 24',
    sourceCode: 'MSG       DB \'Hello$\'',
    comment: 'Allocate string terminated with $',
    explanation: 'Allocates ASCII bytes for \'H\', \'e\', \'l\', \'l\', \'o\' and terminates with DOS string marker \'$\' (24H).',
    type: 'data'
  },
  {
    lineNum: 6,
    offset: '0000',
    hexCode: '',
    sourceCode: '          .CODE',
    comment: 'Begin code segment',
    explanation: 'Indicates the start of the Code segment (usually _TEXT). Location counter resets to 0000.',
    type: 'directive'
  },
  {
    lineNum: 7,
    offset: '0000',
    hexCode: '',
    sourceCode: 'START:    ',
    comment: 'Execution entry point label',
    explanation: 'A label definition representing the program start. Registered in Symbol Table at offset 0000H.',
    type: 'directive'
  },
  {
    lineNum: 8,
    offset: '0000',
    hexCode: 'B8 ---- R',
    sourceCode: '          MOV AX, @DATA',
    comment: 'Load base address of DATA segment',
    explanation: 'B8 is the opcode for MOV AX. The \'---- R\' denotes a Relocatable segment address which the Linker/Loader will patch later!',
    type: 'instruction'
  },
  {
    lineNum: 9,
    offset: '0003',
    hexCode: '8E D8',
    sourceCode: '          MOV DS, AX',
    comment: 'Copy segment base into DS register',
    explanation: '8E D8 translates to MOV DS, AX. Copy AX to Segment Register DS to initialize the data segment pointer.',
    type: 'instruction'
  },
  {
    lineNum: 10,
    offset: '0005',
    hexCode: 'BA 0064 R',
    sourceCode: '          LEA DX, MSG',
    comment: 'Load effective address of string MSG',
    explanation: 'BA is the opcode for MOV DX. 0064 is the offset of MSG. \'R\' notes it is relocatable since the final segment address isn\'t absolute.',
    type: 'instruction'
  },
  {
    lineNum: 11,
    offset: '0008',
    hexCode: 'B4 09',
    sourceCode: '          MOV AH, 09H',
    comment: 'DOS function: print $ terminated string',
    explanation: 'B4 09 translates to MOV AH, 09H. Load high byte of AX with function code for printing a string.',
    type: 'instruction'
  },
  {
    lineNum: 12,
    offset: '000A',
    hexCode: 'CD 21',
    sourceCode: '          INT 21H',
    comment: 'Invoke DOS interrupt services',
    explanation: 'CD 21 triggers DOS API Interrupt 21H. It prints the string pointed to by DS:DX (which is MSG) to the console screen.',
    type: 'instruction'
  },
  {
    lineNum: 13,
    offset: '000C',
    hexCode: 'B8 4C00',
    sourceCode: '          MOV AX, 4C00H',
    comment: 'DOS function: exit with code 00H',
    explanation: 'B8 4C00 translates to MOV AX, 4C00H. Sets system terminate call AH=4CH with exit return code AL=00H.',
    type: 'instruction'
  },
  {
    lineNum: 14,
    offset: '000F',
    hexCode: 'CD 21',
    sourceCode: '          INT 21H',
    comment: 'Exit back to operating system',
    explanation: 'CD 21 triggers DOS Interrupt 21H, immediately terminating execution and returning control safely back to command prompt.',
    type: 'instruction'
  }
];

interface ObjRecord {
  type: string;
  name: string;
  hexBytes: string;
  description: string;
  importance: string;
  colorClass: string;
}

const MOCK_OBJ_RECORDS: ObjRecord[] = [
  {
    type: 'THEADR (80H)',
    name: 'Translator Header Record',
    hexBytes: '80 00 0B 0A 4D 59 50 52 4F 47 52 41 4D 12',
    description: 'Specifies the name of the original source file (e.g., \'MYPROGRAM\') used to compile this module.',
    importance: 'Allows debuggers (like DEBUG.EXE) and Linkers to print diagnostics, source lines, and resolve file-level references.',
    colorClass: 'border-l-4 border-indigo-500 bg-indigo-50/50'
  },
  {
    type: 'LNAMES (96H)',
    name: 'List of Names Record',
    hexBytes: '96 00 1E 00 00 05 5F 54 45 58 54 05 5F 44 41 54 41 06 44 47 52 4F 55 50 05 53 54 41 43 4B C8',
    description: 'A indexed dictionary containing all of the segment, class, and group names defined in the source code (e.g. \'_TEXT\', \'_DATA\', \'DGROUP\', \'STACK\').',
    importance: 'The Linker references this list by index number (1, 2, 3...) when mapping segments, saving space in the object file.',
    colorClass: 'border-l-4 border-blue-500 bg-blue-50/50'
  },
  {
    type: 'SEGDEF (98H)',
    name: 'Segment Definition Record',
    hexBytes: '98 00 07 28 00 00 01 02 42 F1',
    description: 'Describes the characteristics of a segment: its name index, its alignment attributes (word, paragraph, page aligned), size in bytes, and combination rules.',
    importance: 'Tells the Linker exactly how much memory to reserve for each segment and how to merge them with segments of the same name from other object files.',
    colorClass: 'border-l-4 border-amber-500 bg-amber-50/50'
  },
  {
    type: 'PUBDEF (90H)',
    name: 'Public Names Definition',
    hexBytes: '90 00 09 00 00 02 53 54 41 52 54 00 00 24',
    description: 'Lists all symbols exported from this object file (like public variables or global function entry points) along with their offsets.',
    importance: 'Essential for multi-file projects. The Linker scans this record to hook up external jumps/calls from other compiled files to this file.',
    colorClass: 'border-l-4 border-purple-500 bg-purple-50/50'
  },
  {
    type: 'LEDATA (A0H)',
    name: 'Logical Enumerated Data',
    hexBytes: 'A0 00 15 02 00 00 B8 00 00 8E D8 BA 64 00 B4 09 CD 21 B8 00 4C CD 21 8A',
    description: 'Contains the actual compiled binary machine code and static data constants. Represents the true program body.',
    importance: 'This is the raw payload! The Linker copies these exact bytes into the output executable (.EXE) at the computed segment locations.',
    colorClass: 'border-l-4 border-emerald-500 bg-emerald-50/50'
  },
  {
    type: 'FIXUPP (9CH)',
    name: 'Fixup and Relocation Record',
    hexBytes: '9C 00 0C D4 06 54 01 01 C4 0A 54 02 02 D7',
    description: 'Specifies which bytes in the preceding LEDATA record contain segment relative address references that MUST be patched by the Linker/Loader.',
    importance: 'The absolute core of assembly. Since MASM doesn\'t know what memory address DS or MSG will land on, FIXUPP marks these spots so the Linker can write their final addresses.',
    colorClass: 'border-l-4 border-rose-500 bg-rose-50/50'
  },
  {
    type: 'MODEND (8AH)',
    name: 'Module End Record',
    hexBytes: '8A 00 05 80 00 00 01 C3',
    description: 'Indicates the end of this object module, and optionally identifies the start address/entry label (e.g., START) where CPU execution should begin.',
    importance: 'Signals the Linker that reading this file is finished, and sets the Initial IP (Instruction Pointer) and CS register values in the final EXE header.',
    colorClass: 'border-l-4 border-slate-500 bg-slate-50/50'
  }
];

interface ExeHeaderField {
  offset: string;
  name: string;
  value: string;
  hexBytes: string;
  description: string;
  importance: string;
  category: 'magic' | 'layout' | 'execution' | 'reloc';
}

const MOCK_EXE_HEADER_FIELDS: ExeHeaderField[] = [
  {
    offset: '00h - 01h',
    name: 'MZ Magic Signature',
    value: '4D 5A ("MZ")',
    hexBytes: '4D 5A',
    description: 'Identifies the file format as an MS-DOS executable, named after engineer Mark Zbikowski.',
    importance: 'Mandatory start signature. Operating System loader throws an execution crash if these starting bytes are missing.',
    category: 'magic'
  },
  {
    offset: '02h - 03h',
    name: 'Bytes on Last Page',
    value: '0080h (128 Bytes)',
    hexBytes: '80 00',
    description: 'Refers to the byte count inside the final 512-byte block sector.',
    importance: 'Helps computing exact file size to prevent loading stray trailing compiler bytes into memory.',
    category: 'layout'
  },
  {
    offset: '04h - 05h',
    name: 'Pages in File',
    value: '0002h (2 Pages)',
    hexBytes: '02 00',
    description: 'The overall size of the file represented in chunks of 512-byte pages.',
    importance: 'Tells the loader to allocate exactly 1024 bytes (2 pages) of storage workspace for reading the program.',
    category: 'layout'
  },
  {
    offset: '06h - 07h',
    name: 'Relocation Table Count',
    value: '0001h (1 Entry)',
    hexBytes: '01 00',
    description: 'Count of pointers inside the internal segment relocation directory.',
    importance: 'Indicates to DOS how many locations in the code segment require physical segment address adjustments during loading.',
    category: 'reloc'
  },
  {
    offset: '08h - 09h',
    name: 'Header Size',
    value: '0020h Paragraphs (512 Bytes)',
    hexBytes: '20 00',
    description: 'The length of the MZ header block expressed in 16-byte paragraph units.',
    importance: 'Indicates the offset where header bookkeeping ends and executable machine instruction blocks start.',
    category: 'layout'
  },
  {
    offset: '0Ch - 0Dh',
    name: 'Initial SS Register Value',
    value: '0020h Segment Offset',
    hexBytes: '20 00',
    description: 'The starting relative segment index loaded directly into stack segment register SS.',
    importance: 'Aligns the CPU stack segment at run-time offset relative to start of program payload.',
    category: 'execution'
  },
  {
    offset: '0Eh - 0Fh',
    name: 'Initial SP Register Value',
    value: '0100h Stack Pointer Offset',
    hexBytes: '00 01',
    description: 'Specifies the initial stack pointer offset, defining stack size capacity (from .STACK 100H).',
    importance: 'Sets up the physical stack workspace limit. Ensures stack push operations do not overwrite compiled code segments.',
    category: 'execution'
  },
  {
    offset: '14h - 15h',
    name: 'Initial IP (Instruction Pointer)',
    value: '0000h Instruction Pointer Offset',
    hexBytes: '00 00',
    description: 'Defines the code entry relative point from the code segment start.',
    importance: 'Loads IP register directly. Combined with CS, points exactly to label START address 0000h.',
    category: 'execution'
  },
  {
    offset: '16h - 17h',
    name: 'Initial CS Register Value',
    value: '0000h Relative Segment Offset',
    hexBytes: '00 00',
    description: 'The relative code segment base address inside the load image.',
    importance: 'Sets CS register upon start to align CPU branch execution with compiled assembly logic.',
    category: 'execution'
  },
  {
    offset: '18h - 19h',
    name: 'Relocation Table Offset',
    value: '001Eh (30 Bytes)',
    hexBytes: '1E 00',
    description: 'Points to the starting file position where relocation lookup records are physically saved.',
    importance: 'Allows the loader to locate relocation table indices and patch variable segment pointers right away.',
    category: 'reloc'
  }
];

const MOCK_EXE_HEX_DUMP = [
  { addr: '0000h', bytes: '4D 5A 80 00 02 00 01 00 20 00 00 00 FF FF 20 00', type: 'header', desc: 'MZ Magic (4D 5A), 128 bytes on last page, 2 pages, 1 reloc entry.' },
  { addr: '0010h', bytes: '00 01 00 00 00 00 00 00 00 00 00 00 1E 00 00 00', type: 'header', desc: 'Initial SP=0100H, IP=0000H, CS=0000H, Relocation pointer offset=001EH.' },
  { addr: '0020h', bytes: '08 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00', type: 'reloc', desc: 'Relocation Table: Pointer to byte index 0008H (relocatable code offset).' },
  { addr: '0030h', bytes: '00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00', type: 'padding', desc: 'Alignment padding ensuring code starts exactly at 512-byte boundary.' },
  { addr: '0200h', bytes: 'B8 30 00 8E D8 BA 64 00 B4 09 CD 21 B8 00 4C CD 21', type: 'code', desc: 'Executable Code: MOV AX, 0030H; MOV DS, AX; LEA DX, [0064H]; INT 21H...' },
  { addr: '0210h', bytes: '48 65 6C 6C 6F 24 00 00 00 00 00 00 00 00 00 00', type: 'data', desc: 'Data segment segment containing ASCII text bytes: "Hello$" (48 65 6C 6C 6F 24)' }
];

export default function AssemblerOutputsSimulator() {
  const [activeTab, setActiveTab] = useState<'lst' | 'obj' | 'exe'>('lst');
  const [hoveredLine, setHoveredLine] = useState<LstLine | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<ObjRecord>(MOCK_OBJ_RECORDS[4]); // default to LEDATA
  const [selectedExeField, setSelectedExeField] = useState<ExeHeaderField>(MOCK_EXE_HEADER_FIELDS[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLstLines = MOCK_LST_LINES.filter(line => 
    line.sourceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    line.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
    line.hexCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="assembler-outputs-simulator" className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 text-slate-800 shadow-sm flex flex-col justify-between h-full min-h-[600px]">
      <div>
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 mb-4 gap-2">
          <div>
            <h2 className="text-lg md:text-xl font-bold font-display text-indigo-600 flex items-center gap-2">
              <FileCode2 className="w-5 h-5 text-indigo-600" />
              Inside Assembler Outputs: .OBJ, .LST vs .EXE
            </h2>
            <p className="text-slate-500 text-[13px] mt-0.5">Explore the human-readable Listing, machine-ready Object, and Executable files</p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto shrink-0">
            <button
              onClick={() => { setActiveTab('lst'); }}
              className={`px-3 py-1.5 text-[13px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === 'lst'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Human Log (.LST)
            </button>
            <button
              onClick={() => { setActiveTab('obj'); }}
              className={`px-3 py-1.5 text-[13px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === 'obj'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <Binary className="w-3.5 h-3.5" />
              Binary Payload (.OBJ)
            </button>
            <button
              onClick={() => { setActiveTab('exe'); }}
              className={`px-3 py-1.5 text-[13px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === 'exe'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Executable (.EXE)
            </button>
          </div>
        </div>

        {/* Tab 1: LISTING (.LST) FILE EXPLORER */}
        {activeTab === 'lst' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              {/* LST code listing */}
              <div className="lg:col-span-8 flex flex-col justify-between space-y-3">
                <div className="bg-slate-900 rounded-2xl p-4 shadow-inner border border-slate-950 flex flex-col min-h-[420px] max-h-[460px] overflow-hidden">
                  {/* LST Meta Header */}
                  <div className="border-b border-slate-800 pb-2 mb-3 text-[13px] text-slate-500 font-mono flex justify-between select-none">
                    <span>MASM v5.10 - 16-BIT ASSEMBLER LOG</span>
                    <span>MYPROGRAM.LST</span>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-850/80 px-3 py-1.5 rounded-lg border border-slate-800 mb-3 shrink-0">
                    <Search className="w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search source lines, comments, or opcodes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent border-none text-slate-200 text-[13px] focus:outline-none w-full font-mono"
                    />
                  </div>

                  {/* Column headers */}
                  <div className="grid grid-cols-12 gap-1 px-2 py-1 text-[13px] text-indigo-400 font-mono font-bold uppercase tracking-wider border-b border-slate-800/60 select-none shrink-0">
                    <span className="col-span-1 text-center">LINE</span>
                    <span className="col-span-2">OFFSET</span>
                    <span className="col-span-3">MACH BYTES</span>
                    <span className="col-span-6">ASSEMBLY SOURCE CODE</span>
                  </div>

                  {/* Listing content */}
                  <div className="flex-1 overflow-y-auto font-mono text-[13px] space-y-0.5 pt-2 pr-1 scrollbar-thin">
                    {filteredLstLines.map((line, idx) => {
                      const isHovered = hoveredLine?.lineNum === line.lineNum;
                      return (
                        <div
                          key={line.lineNum}
                          onMouseEnter={() => setHoveredLine(line)}
                          className={`grid grid-cols-12 gap-1 p-1 rounded-md transition-all items-center ${
                            isHovered 
                              ? 'bg-indigo-950/90 text-indigo-100 border border-indigo-900/60' 
                              : 'bg-transparent border border-transparent text-slate-300'
                          }`}
                        >
                          <span className="col-span-1 text-slate-500 text-center select-none text-[13px]">
                            {line.lineNum}
                          </span>
                          <span className="col-span-2 text-indigo-300 font-bold">
                            {line.offset || '   -'}
                          </span>
                          <span className="col-span-3 text-emerald-400 font-bold select-none">
                            {line.hexCode || '      -'}
                          </span>
                          <span className="col-span-6 flex flex-wrap items-center">
                            <span className={line.offset ? 'text-slate-100' : 'text-indigo-200'}>
                              {line.sourceCode.replace(/^\s+/, '')}
                            </span>
                            <span className="text-slate-500 text-[13px] ml-1">
                              ; {line.comment}
                            </span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Symbol Table sub-component of Listing */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <span className="text-[13px] font-bold font-mono text-slate-400 uppercase tracking-widest block mb-2 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    Listing Symbol Table Section
                  </span>
                  <p className="text-[13px] text-slate-500 mb-3">
                    At the end of every `.LST` file, MASM logs the final address assignments of segments and variables to aid linker alignment:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[13px] font-mono">
                    <div className="bg-white border border-slate-200 p-2.5 rounded-xl">
                      <span className="text-[13px] font-bold text-indigo-600 uppercase block mb-1">Segments:</span>
                      <div className="space-y-1 text-[13px]">
                        <div className="flex justify-between border-b border-slate-100 pb-0.5">
                          <span className="font-bold text-slate-700">_TEXT (Code)</span>
                          <span className="text-slate-500">0011H bytes (WORD)</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-0.5">
                          <span className="font-bold text-slate-700">_DATA (Data)</span>
                          <span className="text-slate-500">006AH bytes (WORD)</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200 p-2.5 rounded-xl">
                      <span className="text-[13px] font-bold text-indigo-600 uppercase block mb-1">Symbols / Labels:</span>
                      <div className="space-y-1 text-[13px]">
                        <div className="flex justify-between border-b border-slate-100 pb-0.5">
                          <span className="font-bold text-slate-700">BUFF</span>
                          <span className="text-slate-500">0000H (Byte array)</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-0.5">
                          <span className="font-bold text-slate-700">MSG</span>
                          <span className="text-slate-500">0064H (Byte)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold text-slate-700">START</span>
                          <span className="text-slate-500">0000H (Near entry)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Explanatory Sidebar for Hovered Log */}
              <div className="lg:col-span-4 flex flex-col justify-between">
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 h-full space-y-4">
                  <div className="flex items-center gap-2 text-indigo-800 font-bold font-display text-[13px] border-b border-indigo-200/50 pb-2">
                    <Eye className="w-4 h-4 text-indigo-600" />
                    Line Inspector
                  </div>

                  {hoveredLine ? (
                    <div className="space-y-3.5">
                      <div>
                        <span className="text-[13px] font-bold font-mono text-indigo-500 uppercase tracking-widest block">Selected Line</span>
                        <span className="text-[13px] font-mono font-bold text-slate-700">Line {hoveredLine.lineNum}: {hoveredLine.sourceCode.trim()}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white p-2 rounded-xl border border-indigo-100 text-center">
                          <span className="text-[13px] font-bold text-slate-400 block uppercase">Relative Offset</span>
                          <span className="text-[13px] font-mono font-bold text-indigo-700">{hoveredLine.offset ? `${hoveredLine.offset}H` : 'No instruction'}</span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-indigo-100 text-center">
                          <span className="text-[13px] font-bold text-slate-400 block uppercase">Instruction Hex</span>
                          <span className="text-[13px] font-mono font-bold text-emerald-600">{hoveredLine.hexCode || 'None'}</span>
                        </div>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-indigo-100 text-[13px]">
                        <span className="font-bold text-slate-700 block mb-1">What this means:</span>
                        <p className="text-slate-600 leading-relaxed font-sans">{hoveredLine.explanation}</p>
                      </div>

                      {hoveredLine.hexCode.includes('R') && (
                        <div className="bg-amber-50/80 border border-amber-200 p-3 rounded-xl text-[13px] space-y-1">
                          <span className="font-bold text-amber-800 font-sans block flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 shrink-0" />
                            What does 'R' represent?
                          </span>
                          <p className="text-amber-700 leading-normal font-sans">
                            The 'R' signifies a **Relocatable Address**. Because the data segment's RAM position will vary, MASM leaves blank offsets and marks it 'R' so the **Linker** knows to relocate it during linking.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-10 text-indigo-600/70 italic text-[13px] gap-2">
                      <Info className="w-7 h-7 text-indigo-400" />
                      Hover or move your mouse over any line in the code editor on the left to inspect its address offsets and compilation logs!
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Educational Visual Diagram */}
            <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-5 mt-4">
              <h3 className="text-sm md:text-base font-extrabold text-indigo-900 flex items-center gap-2 mb-2">
                <FileText className="w-4.5 h-4.5 text-indigo-600" />
                Anatomy of an Assembler Listing (.LST) File
              </h3>
              <p className="text-[13px] text-slate-600 mb-4">
                This diagram illustrates how the listing log breaks down physical instructions into three distinct regions: the physical offsets (left), translated machine code instruction bytes (center), and human-authored Assembly source code (right).
              </p>
              <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm max-w-4xl mx-auto bg-slate-100 p-1">
                <img 
                  src={lstFileDiagram} 
                  alt="Listing File (.LST) Anatomy Diagram" 
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: OBJECT (.OBJ) FILE STRUCTURAL MAP */}
        {activeTab === 'obj' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              {/* Record OMF List */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex-1">
                  <span className="text-[13px] font-bold font-mono text-slate-400 uppercase tracking-widest block mb-2">
                    Object Module Format (OMF) Record Blocks
                  </span>
                  <p className="text-[13px] text-slate-500 mb-3">
                    The `.OBJ` file is NOT plain text; it consists of structured binary record blocks containing compiled code and segment dictionaries for the Linker:
                  </p>

                  <div className="space-y-2">
                    {MOCK_OBJ_RECORDS.map((rec) => {
                      const isSelected = selectedRecord.type === rec.type;
                      return (
                        <button
                          key={rec.type}
                          onClick={() => setSelectedRecord(rec)}
                          className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100 scale-[1.01]'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-[13px] font-mono font-bold ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                              {rec.type}
                            </span>
                            {isSelected && <span className="text-[13px] bg-indigo-500/50 px-1.5 py-0.5 rounded text-white font-sans font-bold">Selected</span>}
                          </div>
                          <span className="font-bold text-[13px] mt-0.5">{rec.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Detailed Record Inspector */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 flex-1 flex flex-col justify-between">
                  
                  {/* Header info */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 font-mono text-[13px] font-bold rounded">
                        Intel Record Identifier: {selectedRecord.type.split(' ')[0]}
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className="text-[13px] text-slate-400 font-sans font-bold">Binary Payload Record</span>
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-indigo-950 font-display">
                      {selectedRecord.name}
                    </h3>
                  </div>

                  {/* Hex Visualization */}
                  <div className="space-y-1.5">
                    <span className="text-[13px] font-mono text-slate-400 font-bold block uppercase tracking-wider">
                      Actual Hex Bytes inside .OBJ file:
                    </span>
                    <div className="bg-slate-900 text-emerald-400 font-mono text-[13px] p-3 rounded-xl border border-slate-950 tracking-wider break-all leading-normal shadow-inner">
                      {selectedRecord.hexBytes}
                    </div>
                    <span className="text-[13px] text-slate-400 block text-right font-mono">
                      Total: {selectedRecord.hexBytes.split(' ').length} Record bytes
                    </span>
                  </div>

                  {/* Purpose and details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div className="space-y-1">
                      <span className="text-[13px] font-bold text-slate-400 uppercase tracking-widest block">
                        Record Description
                      </span>
                      <p className="text-[13px] text-slate-600 leading-relaxed font-sans">
                        {selectedRecord.description}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[13px] font-bold text-slate-400 uppercase tracking-widest block">
                        Linker Importance
                      </span>
                      <p className="text-[13px] text-slate-600 leading-relaxed font-sans">
                        {selectedRecord.importance}
                      </p>
                    </div>
                  </div>

                  {/* Visual flowchart help */}
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3.5 flex items-start gap-3 mt-2">
                    <Cpu className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div className="space-y-1 text-indigo-950">
                      <span className="text-[13px] font-mono font-bold uppercase text-indigo-700 block">
                        Linker Assembly Pipeline:
                      </span>
                      <p className="text-[13px] font-sans leading-normal">
                        Since the compiler is done, **LINK.EXE** accepts this `.OBJ` file, reads these record chunks, relocates references flagged by **FIXUPP**, and merges them with standard library references into a `.EXE` executable.
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Educational Visual Diagram */}
            <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-5 mt-4">
              <h3 className="text-sm md:text-base font-extrabold text-indigo-900 flex items-center gap-2 mb-2">
                <Binary className="w-4.5 h-4.5 text-indigo-600" />
                Intel OMF Object File (.OBJ) Block Format
              </h3>
              <p className="text-[13px] text-slate-600 mb-4">
                Object files are stored as serialized chunks of binary streams. This diagram maps the exact OMF record structure: starting with a THEADR block, declaring segment types (LNAMES, SEGDEF), containing the compiled binary code (LEDATA), resolving offsets (FIXUPP), and terminating with a MODEND marker.
              </p>
              <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm max-w-4xl mx-auto bg-slate-100 p-1">
                <img 
                  src={objFileDiagram} 
                  alt="Object File (.OBJ) Format Anatomy Diagram" 
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: EXECUTABLE (.EXE) FILE EXPLORER */}
        {activeTab === 'exe' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              {/* Left Column: MZ Header fields list */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex-1">
                  <span className="text-[13px] font-bold font-mono text-slate-400 uppercase tracking-widest block mb-2">
                    MZ Header Structural Breakdown (DOS Standard)
                  </span>
                  <p className="text-[13px] text-slate-500 mb-3">
                    A 16-bit MS-DOS `.EXE` file begins with a 512-byte header block containing size alignments and initial register pointers:
                  </p>

                  <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                    {MOCK_EXE_HEADER_FIELDS.map((field) => {
                      const isSelected = selectedExeField.name === field.name;
                      return (
                        <button
                          key={field.name}
                          onClick={() => setSelectedExeField(field)}
                          className={`w-full text-left p-2.5 rounded-xl border transition-all flex flex-col cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-[13px] font-mono font-bold ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                              Offset: {field.offset}
                            </span>
                            <span className={`text-[13px] px-1 rounded uppercase font-bold font-mono ${
                              isSelected 
                                ? 'bg-indigo-500/50 text-white' 
                                : field.category === 'magic' 
                                  ? 'bg-indigo-100 text-indigo-700' 
                                  : field.category === 'layout' 
                                    ? 'bg-amber-100 text-amber-700' 
                                    : field.category === 'execution' 
                                      ? 'bg-emerald-100 text-emerald-700' 
                                      : 'bg-purple-100 text-purple-700'
                            }`}>
                              {field.category}
                            </span>
                          </div>
                          <span className="font-bold text-[13px] mt-0.5">{field.name}</span>
                          <span className={`text-[13px] font-mono mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                            Value: {field.value}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Hex dump of EXE + Inspector */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 font-mono text-[13px] font-bold rounded">
                        Selected Header Offset: {selectedExeField.offset}
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className="text-[13px] text-slate-400 font-sans font-bold">16-bit MZ Binary Target</span>
                    </div>
                    <h3 className="text-base font-bold text-indigo-950 font-display">
                      {selectedExeField.name}
                    </h3>
                  </div>

                  {/* Purpose and details */}
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-[13px] space-y-2">
                    <div>
                      <span className="text-[13px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
                        Field Purpose
                      </span>
                      <p className="text-slate-700 font-sans leading-relaxed">
                        {selectedExeField.description}
                      </p>
                    </div>
                    <div className="border-t border-slate-200 pt-2">
                      <span className="text-[13px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
                        DOS Loader / CPU Integration
                      </span>
                      <p className="text-slate-700 font-sans leading-relaxed">
                        {selectedExeField.importance}
                      </p>
                    </div>
                  </div>

                  {/* Hex Visualization */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                        Physical Hex Dump of compiled .EXE file:
                      </span>
                      <span className="text-[13px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                        Absolute Bytes
                      </span>
                    </div>
                    
                    <div className="bg-slate-900 rounded-xl p-3 border border-slate-950 font-mono text-[13px] text-slate-400 space-y-1">
                      <div className="grid grid-cols-12 border-b border-slate-800 pb-1 text-[13px] text-slate-500 uppercase tracking-wider animate-none">
                        <span className="col-span-2">Offset</span>
                        <span className="col-span-10 text-center">Binary Bytes (Hexadecimal)</span>
                      </div>
                      {MOCK_EXE_HEX_DUMP.map((row) => {
                        const isHeaderHighlighted = selectedExeField.category === 'magic' || selectedExeField.category === 'layout';
                        const isRelocHighlighted = selectedExeField.category === 'reloc';
                        const isExecHighlighted = selectedExeField.category === 'execution';
                        
                        let highlightClass = '';
                        if (row.type === 'header' && isHeaderHighlighted) {
                          highlightClass = 'text-indigo-300 font-bold bg-indigo-950/40 border-l-2 border-indigo-500 pl-1';
                        } else if (row.type === 'reloc' && isRelocHighlighted) {
                          highlightClass = 'text-purple-300 font-bold bg-purple-950/40 border-l-2 border-purple-500 pl-1';
                        } else if (row.type === 'code' && isExecHighlighted) {
                          highlightClass = 'text-emerald-300 font-bold bg-emerald-950/40 border-l-2 border-emerald-500 pl-1';
                        }

                        return (
                          <div key={row.addr} className={`grid grid-cols-12 py-0.5 transition-all text-[13px] ${highlightClass || 'pl-1'}`} title={row.desc}>
                            <span className="col-span-2 text-indigo-400/90 font-bold">{row.addr}</span>
                            <span className="col-span-10 font-bold tracking-wide text-slate-200">
                              {row.bytes}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <span className="text-[13px] text-slate-400 block text-right font-mono">
                      Note: Yellow/green rows highlight how selected header attributes direct instruction execution in memory.
                    </span>
                  </div>

                </div>
              </div>
            </div>

            {/* Educational Visual Diagram */}
            <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-5 mt-4">
              <h3 className="text-sm md:text-base font-extrabold text-indigo-900 flex items-center gap-2 mb-2">
                <Cpu className="w-4.5 h-4.5 text-indigo-600" />
                MS-DOS Relocatable Executable (.EXE) Header Structure
              </h3>
              <p className="text-[13px] text-slate-600 mb-4">
                This schematic diagrams the file contents of a finished 16-bit executable. It includes the mandatory 'MZ' magic signifier, the relocation pointers used by the dynamic operating system loader, stack definition fields, and the binary payload containing instruction segments.
              </p>
              <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm max-w-4xl mx-auto bg-slate-100 p-1">
                <img 
                  src={exeFileDiagram} 
                  alt="Executable File (.EXE) Anatomy Diagram" 
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Banner Summary */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl mt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 select-none">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-[13px] font-sans font-bold text-slate-700">
              {activeTab === 'lst' 
                ? 'The human-readable log (.LST) maps physical code lines and variables to their byte offsets side-by-side.'
                : activeTab === 'obj'
                ? 'The machine-ready object (.OBJ) arranges bytes inside relocatable block chunks for the final Linker task.'
                : 'The fully executable file (.EXE) contains absolute start registers (MZ header) and executable code segments.'
              }
            </span>
          </div>
          <span className="text-[13px] text-slate-400 font-mono text-right">
            Courseware Supplementary — Section 11.4 Compiler Targets
          </span>
        </div>

      </div>
    </div>
  );
}
