import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileCode, 
  Terminal, 
  Settings, 
  Play, 
  Cpu, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  FolderOpen,
  RefreshCw,
  Layers,
  HelpCircle
} from 'lucide-react';

interface PipelineStep {
  id: number;
  title: string;
  tool: string;
  input: string;
  output: string;
  icon: any;
  color: string;
  bgCol: string;
  borderCol: string;
  desc: string;
  details: string[];
}

const pipelineSteps: PipelineStep[] = [
  {
    id: 1,
    title: '1. Specify & Design',
    tool: 'Brain / Flowchart Editor',
    input: 'Problem Statement',
    output: 'Algorithm & Flowchart',
    icon: HelpCircle,
    color: 'text-sky-600 bg-sky-100',
    bgCol: 'bg-sky-50/50',
    borderCol: 'border-sky-200',
    desc: 'Define what the program will accomplish and outline the logic before writing single lines of code.',
    details: [
      'Understand register and size limits (8-bit vs 16-bit operations).',
      'Choose memory models (Tiny, Small, Medium, Large).',
      'Draw flowchart branches representing conditional jumps (JZ, JNZ, JC).'
    ]
  },
  {
    id: 2,
    title: '2. Assembly Coding',
    tool: 'Text Editor (Notepad / Edit)',
    input: 'Algorithm',
    output: 'program.asm (Source Code)',
    icon: FileCode,
    color: 'text-indigo-600 bg-indigo-100',
    bgCol: 'bg-indigo-50/50',
    borderCol: 'border-indigo-200',
    desc: 'Write the 8086 assembly language statements using standard instructions and directives.',
    details: [
      'File format is always plain ASCII text, saved with a .ASM extension.',
      'Includes segment definitions (CS, DS, SS) and ASSUME directives.',
      'Mnemonics (MOV, ADD, LOOP) are written alongside comments starting with a semicolon (;).'
    ]
  },
  {
    id: 3,
    title: '3. Assembling Code',
    tool: 'MASM.EXE or TASM.EXE',
    input: 'program.asm',
    output: 'program.obj + program.lst',
    icon: Settings,
    color: 'text-amber-600 bg-amber-100',
    bgCol: 'bg-amber-50/50',
    borderCol: 'border-amber-200',
    desc: 'The Assembler scans the .ASM source file twice (Two-Pass). It translates mnemonics to physical binary opcodes, builds the Symbol Table, and checks for syntax errors.',
    details: [
      'Pass 1 (Symbol Table): Scans code to register offsets of user-defined labels and variables like START, LOOP, or NUM1.',
      'Pass 2 (Opcode Generation): Translates assembly instructions to physical binary machine code, resolving relative offsets.',
      'Outputs .OBJ (Object code) binary and .LST (Listing) file showing side-by-side assembly, offsets, and hex bytes.'
    ]
  },
  {
    id: 4,
    title: '4. Linking Object Files',
    tool: 'LINK.EXE or TLINK.EXE',
    input: 'program.obj + library.lib',
    output: 'program.exe (Executable)',
    icon: Layers,
    color: 'text-purple-600 bg-purple-100',
    bgCol: 'bg-purple-50/50',
    borderCol: 'border-purple-200',
    desc: 'The Linker binds compiled object modules (.OBJ) together, pulls library routines (.LIB), and creates a relocatable .EXE file. The Loader then places it in physical RAM.',
    details: [
      'Linker builds the Relocation Table in the EXE header to keep segment-dependent references flexible.',
      'Loader (OS component) loads the executable into physical memory and patches relocatable base addresses dynamically.',
      'Combines multiple separate assembly modules and resolves external labels or pre-written library subroutines.'
    ]
  },
  {
    id: 5,
    title: '5. Debug & Execute',
    tool: 'DEBUG.EXE or emu8086',
    input: 'program.exe',
    output: 'CPU execution / output',
    icon: Cpu,
    color: 'text-emerald-600 bg-emerald-100',
    bgCol: 'bg-emerald-50/50',
    borderCol: 'border-emerald-200',
    desc: 'Execute the relocatable machine code on the physical 8086 MPU or inspect it interactively using emulation and debug utilities.',
    details: [
      'DEBUG Utility: Run R to display/edit CPU registers (AX, IP, flags) and D to dump physical memory values.',
      'Step-by-Step Tracing: Use T (Trace) to execute instruction-by-instruction, and G (Go) to run to a breakpoint.',
      'Interactive Assembly: Use A (Assemble) to insert direct inline assembly, and U (Unassembly) to disassemble hex to mnemonics.'
    ]
  }
];

const mockSourceCode = `; 8086 addition program
DATA SEGMENT
  NUM1 DW 0F120H
  NUM2 DW 00E50H
  SUM  DW ?
DATA ENDS

CODE SEGMENT
  ASSUME CS:CODE, DS:DATA
START:
  MOV AX, DATA
  MOV DS, AX
  
  MOV AX, NUM1
  ADD AX, NUM2
  MOV SUM, AX
  
  MOV AH, 4CH
  INT 21H
CODE ENDS
END START`;

const mockListFile = `0000                  DATA SEGMENT
0000 F120               NUM1 DW 0F120H
0002 0E50               NUM2 DW 00E50H
0004 ????               SUM  DW ?
0006                  DATA ENDS
0000                  CODE SEGMENT
                      ASSUME CS:CODE, DS:DATA
0000                  START:
0000 B8 ---- R          MOV AX, DATA
0003 8E D8              MOV DS, AX
0005 A1 0000 R          MOV AX, NUM1
0008 03 06 0002 R       ADD AX, NUM2
000C A3 0004 R          MOV SUM, AX
000F B4 4C              MOV AH, 4CH
0011 CD 21              INT 21H
0013                  CODE ENDS
                      END START`;

const mockObjectBytes = 'B8 30 00 8E D8 A1 00 00 03 06 02 00 A3 04 00 B4 4C CD 21';

export default function DevPipelineSimulator() {
  const [selectedStep, setSelectedStep] = useState<number>(1);
  const [compiling, setCompiling] = useState<'idle' | 'assembling' | 'linking' | 'ready'>('idle');
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'flow' | 'compiler-demo'>('flow');

  const startCompilation = () => {
    setConsoleLogs([]);
    setCompiling('assembling');
    
    // Step 1: Assembly
    setTimeout(() => {
      setConsoleLogs(prev => [
        ...prev,
        'C:\\8086\\MASM program.asm;',
        'Microsoft (R) Macro Assembler Version 5.10',
        'Copyright (C) Microsoft Corp 1981-1988. All rights reserved.',
        '',
        'Assembling: program.asm',
        '  Symbol Table generated.',
        '  No Severe Errors (0 Errors, 0 Warnings)',
        '  Creating output file: program.obj',
        '  Creating listing file: program.lst'
      ]);
      setCompiling('linking');
    }, 1500);

    // Step 2: Linking
    setTimeout(() => {
      setConsoleLogs(prev => [
        ...prev,
        '',
        'C:\\8086\\LINK program.obj;',
        'Microsoft (R) Overlay Linker Version 3.60',
        'Copyright (C) Microsoft Corp 1983-1987. All rights reserved.',
        '',
        'Linking: program.obj',
        '  Segment starting addresses resolved.',
        '  Output file program.exe has been created.',
        '  Compilation and Linking complete! [Status: SUCCESS]'
      ]);
      setCompiling('ready');
    }, 3000);
  };

  const resetDemo = () => {
    setCompiling('idle');
    setConsoleLogs([]);
  };

  const currentStep = pipelineSteps.find(s => s.id === selectedStep)!;

  return (
    <div id="dev-pipeline-simulator" className="bg-white border border-slate-200 rounded-3xl p-6 min-h-[480px] text-slate-800 flex flex-col justify-between shadow-xs">
      <div className="space-y-4">
        {/* Simulator Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
          <div>
            <h2 className="text-lg font-bold font-display text-indigo-600 flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              8086 Software Development Pipeline
            </h2>
            <p className="text-slate-500 text-xs">Explore how assembly text is compiled, linked, and executed on the MPU</p>
          </div>
          
          <div className="flex gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200 max-w-fit self-start sm:self-center">
            <button
              onClick={() => setActiveTab('flow')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                activeTab === 'flow' 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Pipeline steps
            </button>
            <button
              onClick={() => setActiveTab('compiler-demo')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                activeTab === 'compiler-demo' 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Interactive Assembler
            </button>
          </div>
        </div>

        {/* Tab 1: Pipeline Flow Explorer */}
        {activeTab === 'flow' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left Hand: Interactive pipeline line */}
            <div className="lg:col-span-5 flex flex-col gap-2.5 justify-center pr-2">
              {pipelineSteps.map((step) => {
                const Icon = step.icon;
                const isSelected = selectedStep === step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => setSelectedStep(step.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center gap-3.5 cursor-pointer ${
                      isSelected 
                        ? `${step.bgCol} ${step.borderCol} border-l-4 border-l-indigo-600 scale-[1.02] shadow-sm` 
                        : 'bg-slate-50 border-slate-200/60 hover:bg-slate-100/80 text-slate-600'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${step.color} ${isSelected ? 'shadow-inner' : ''}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold leading-tight ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>{step.title}</p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">{step.tool}</p>
                    </div>
                    {isSelected && (
                      <ArrowRight className="w-4 h-4 text-indigo-600 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Hand: Detailed Step Review card */}
            <div className="lg:col-span-7 bg-slate-50/50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-mono font-bold uppercase text-indigo-600">Step Details</span>
                  <span className="text-[9px] font-mono bg-white text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                    Tool: {currentStep.tool}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900">{currentStep.title}</h3>
                <p className="text-slate-600 text-xs leading-relaxed">{currentStep.desc}</p>

                {/* File mapping indicator */}
                <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-xl border border-slate-200/80 text-[10px] font-mono">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Input Format:</span>
                    <span className="text-sky-700 font-bold truncate flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      {currentStep.input}
                    </span>
                  </div>
                  <div className="border-l border-slate-100 pl-3">
                    <span className="text-slate-400 block mb-0.5">Output Format:</span>
                    <span className="text-emerald-700 font-bold truncate flex items-center gap-1">
                      <FolderOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      {currentStep.output}
                    </span>
                  </div>
                </div>

                {/* Key guidelines check */}
                <div className="space-y-2 pt-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Core Functions:</p>
                  <div className="space-y-1.5">
                    {currentStep.details.map((detail, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 leading-normal">
                        <CheckCircle className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {currentStep.id === 3 && (
                  <div className="mt-3 bg-white border border-slate-200 rounded-xl p-3.5 space-y-2">
                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider font-mono">Detailed File Contents:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10.5px]">
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                        <span className="font-bold text-slate-800 block mb-1 font-mono text-[11px]">program.obj (Object File)</span>
                        <ul className="list-disc pl-3.5 text-slate-600 space-y-1 leading-relaxed">
                          <li>Binary machine code opcodes & data values</li>
                          <li>Relocation Dictionary records</li>
                          <li>External and public symbols</li>
                          <li>Segment structure and size definitions</li>
                        </ul>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                        <span className="font-bold text-slate-800 block mb-1 font-mono text-[11px]">program.lst (Listing File)</span>
                        <ul className="list-disc pl-3.5 text-slate-600 space-y-1 leading-relaxed">
                          <li>Plain ASCII diagnostic text</li>
                          <li>Source code side-by-side with Hex codes</li>
                          <li>Calculated instruction memory offsets</li>
                          <li>Detailed Symbol and Label Table</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-indigo-50 border border-indigo-100 p-2.5 rounded-xl text-[10px] text-indigo-700 flex items-center gap-2">
                <span className="bg-indigo-100 text-indigo-700 p-1 rounded font-bold uppercase shrink-0">Note</span>
                <span>Each step transforms abstract code closer to actual physical micro-voltage pulses inside CPU registers.</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Assembler & Linker simulator */}
        {activeTab === 'compiler-demo' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Source editor pane */}
            <div className="md:col-span-5 bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between max-h-[350px]">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
                  <span className="text-[10px] font-mono text-indigo-600 flex items-center gap-1">
                    <FileCode className="w-3.5 h-3.5" />
                    program.asm
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">Plain ASCII text</span>
                </div>
                <pre className="text-[10px] font-mono text-slate-700 overflow-y-auto max-h-[220px] scrollbar-thin leading-relaxed">
                  {mockSourceCode}
                </pre>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                {compiling === 'idle' ? (
                  <button
                    onClick={startCompilation}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-md transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Assemble & Link Code
                  </button>
                ) : (
                  <button
                    onClick={resetDemo}
                    className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold py-1.5 px-3 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reset Compiler
                  </button>
                )}
              </div>
            </div>

            {/* Compiler Console and build outputs */}
            <div className="md:col-span-7 flex flex-col gap-4">
              {/* Output Monitor console */}
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3.5 font-mono min-h-[170px] max-h-[200px] overflow-y-auto flex flex-col justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 border-b border-slate-200/80 pb-1.5 mb-2 flex items-center justify-between">
                    <span>DOSBox / MASM build terminal</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  </div>
                  
                  {compiling === 'idle' && (
                    <div className="text-slate-400 text-xs italic flex flex-col items-center justify-center py-6">
                      <Terminal className="w-8 h-8 text-slate-300 mb-2 animate-bounce" />
                      <span>Ready to compile program.asm</span>
                    </div>
                  )}

                  {compiling === 'assembling' && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-indigo-600 text-xs">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                        <span>Assembling: translating mnemonics to machine code...</span>
                      </div>
                      <div className="text-[10px] text-slate-500">Loading compiler MASM.EXE...</div>
                    </div>
                  )}

                  {compiling === 'linking' && (
                    <div className="space-y-1.5">
                      <div className="text-xs text-emerald-600 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Assembly Success! program.obj generated.</span>
                      </div>
                      <div className="flex items-center gap-2 text-purple-600 text-xs pt-1">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-600" />
                        <span>Linking: resolving segment offsets and headers...</span>
                      </div>
                    </div>
                  )}

                  {compiling === 'ready' && (
                    <div className="space-y-1 font-mono text-[10px] text-slate-700">
                      {consoleLogs.map((log, idx) => (
                        <div key={idx} className={log.includes('SUCCESS') ? 'font-bold text-emerald-700 bg-emerald-50 p-1.5 rounded mt-1 border border-emerald-200' : ''}>
                          {log}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Outputs Panel */}
              <AnimatePresence>
                {compiling === 'ready' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-2 gap-3"
                  >
                    {/* List file card */}
                    <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1 mb-1.5">
                          <span className="text-[9px] font-mono text-amber-700 flex items-center gap-1 font-bold">
                            <FileText className="w-3 h-3 text-amber-600" />
                            program.lst (Listing)
                          </span>
                        </div>
                        <p className="text-[8px] text-slate-500 mb-2 leading-tight">Shows allocated offsets, translated hex, and labels side-by-side.</p>
                        <pre className="text-[8px] font-mono text-amber-800/90 leading-tight bg-amber-50/50 border border-amber-100/80 p-1.5 rounded overflow-y-auto max-h-[80px] scrollbar-thin">
                          {mockListFile}
                        </pre>
                      </div>
                    </div>

                    {/* Object binary file card */}
                    <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1 mb-1.5">
                          <span className="text-[9px] font-mono text-purple-700 flex items-center gap-1 font-bold">
                            <Layers className="w-3 h-3 text-purple-600" />
                            program.obj (Object Code)
                          </span>
                        </div>
                        <p className="text-[8px] text-slate-500 mb-2 leading-tight">Raw relocatable byte values directly readable by the linking loader.</p>
                        <pre className="text-[8px] font-mono text-purple-800/90 break-all leading-normal bg-purple-50/50 border border-purple-100/80 p-1.5 rounded h-[80px] overflow-y-auto scrollbar-thin">
                          {mockObjectBytes}
                        </pre>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      <div className="text-[10px] text-slate-400 font-mono text-right pt-4 border-t border-slate-100 shrink-0 mt-4">
        Interactive 8086 Software Compiler Simulator
      </div>
    </div>
  );
}
