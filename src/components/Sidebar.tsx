import { useState, useEffect } from 'react';
import { Module, Slide } from '../types';
import { Cpu, ChevronRight, CheckCircle2, GraduationCap, Layout, Search, X } from 'lucide-react';
import { labExperiments } from '../data/labExperimentsData';

interface SidebarProps {
  modules: Module[];
  currentModuleId: string;
  currentSlideId: string;
  completedSlides: string[];
  onSelectSlide: (moduleId: string, slideId: string, labId?: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  currentLabId?: string;
}

export default function Sidebar({
  modules,
  currentModuleId,
  currentSlideId,
  completedSlides,
  onSelectSlide,
  isOpen,
  setIsOpen,
  currentLabId
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeUnit, setActiveUnit] = useState<'unit1' | 'unit2' | 'unit3' | 'unit4' | 'unit5' | 'labs'>(() => {
    if (currentModuleId === 'm20') return 'labs';
    if (['m26', 'm27', 'm28', 'm29', 'm30'].some(id => currentModuleId === id)) return 'unit5';
    if (['m21', 'm22', 'm23', 'm24', 'm25'].some(id => currentModuleId === id)) return 'unit4';
    if (['m13', 'm14', 'm15', 'm16', 'm17', 'm18', 'm19'].some(id => currentModuleId === id)) return 'unit3';
    return ['m8', 'm9', 'm10', 'm11', 'm12'].some(id => currentModuleId === id) ? 'unit2' : 'unit1';
  });

  useEffect(() => {
    if (currentModuleId === 'm20') {
      setActiveUnit('labs');
      return;
    }
    const isUnit5 = ['m26', 'm27', 'm28', 'm29', 'm30'].some(id => currentModuleId === id);
    const isUnit4 = ['m21', 'm22', 'm23', 'm24', 'm25'].some(id => currentModuleId === id);
    const isUnit3 = ['m13', 'm14', 'm15', 'm16', 'm17', 'm18', 'm19'].some(id => currentModuleId === id);
    const isUnit2 = ['m8', 'm9', 'm10', 'm11', 'm12'].some(id => currentModuleId === id);
    const activeModule = modules.find(m => m.id === currentModuleId);
    const activeSlide = activeModule?.slides.find(s => s.id === currentSlideId);
    const isLab = activeSlide?.interactiveType && activeSlide.interactiveType !== 'quiz';

    if (activeUnit === 'labs' && isLab) {
      return;
    }
    setActiveUnit(isUnit5 ? 'unit5' : isUnit4 ? 'unit4' : isUnit3 ? 'unit3' : isUnit2 ? 'unit2' : 'unit1');
  }, [currentModuleId, currentSlideId, modules]);

  const hasSearch = searchQuery.trim().length > 0;
  const query = searchQuery.toLowerCase().trim();

  interface SearchResult {
    slide: Slide;
    moduleId: string;
    moduleTitle: string;
    matchReason?: string;
  }

  const searchResults: SearchResult[] = [];

  if (hasSearch) {
    modules.forEach(m => {
      m.slides.forEach(s => {
        let isMatch = false;
        let reason = '';

        if (s.title.toLowerCase().includes(query)) {
          isMatch = true;
          reason = 'Slide Title';
        } else if (m.title.toLowerCase().includes(query)) {
          isMatch = true;
          reason = 'Module Topic';
        } else if (s.points?.some(pt => pt.toLowerCase().includes(query))) {
          isMatch = true;
          reason = 'Theory Content';
        } else if (s.interactiveType) {
          // Smart keyword mapping for interactive labs
          const typeKeywords: Record<string, string[]> = {
            evolution: ["evolution", "history", "timeline", "intel", "4004", "8008", "8080", "8085", "8086", "development"],
            pins: ["pin", "pins", "signals", "configuration", "dip-40", "hardware", "interconnect", "multiplexing"],
            architecture: ["architecture", "block diagram", "biu", "eu", "execution unit", "bus interface unit", "registers", "segment registers"],
            flags: ["flags", "flag register", "status register", "psw", "carry", "zero", "sign", "parity", "status"],
            'memory-calc': ["memory calculation", "physical address", "segmentation", "offset", "addressing", "segment", "stack"],
            interrupts: ["interrupts", "ivt", "vector", "interrupt vector table", "hardware interrupts", "software interrupts"],
            timing: ["timing diagram", "machine cycle", "read cycle", "write cycle", "t-state", "clock"],
            modes: ["modes", "minimum mode", "maximum mode", "operating modes", "multiprocessor", "strapping"],
            'min-mode-hardware': ["hardware", "minimum mode", "demultiplexing", "latching", "transceivers", "bus cycle", "ale", "den", "circuit"],
            'dev-pipeline': ["pipeline", "program development steps", "steps", "editor", "linker", "assembler", "debugging", "flowchart"],
            'addressing-modes': ["addressing modes", "addressing", "immediate", "register", "index", "base", "offset", "effective address"],
            'instruction-decoder': ["instructions", "instruction set", "decoder", "add", "sub", "and", "or", "alu", "data transfer"],
            'directive-sandbox': ["assembler directives", "directives", "db", "dw", "segment", "assume", "org", "end", "stack", "call", "ret", "proc", "near", "far"],
            'assembler-playground': ["write programs", "assembler", "playground", "debugger", "registers", "memory", "simulation"],
            'mcu-8051': ["8051", "microcontroller", "mcu", "block diagram", "harvard architecture", "alu", "timer", "serial", "interrupts"],
            'sfr-memory': ["sfr", "special function registers", "psw", "accumulator", "b register", "dptr", "stack pointer", "ram", "register bank"],
            'mcu-pins': ["ports", "pins", "port 0", "port 1", "port 2", "port 3", "dip-40", "pull-up", "ea", "psen", "ale"],
            'mcu-instructions': ["8051 instructions", "movx", "movc", "djnz", "cjne", "setb", "clr", "boolean", "addressing modes"],
            'mcu-alp': ["8051 assembly", "alp", "led", "simulator", "assembly programming", "code execution"],
            'mcu-timers-serial': ["8051 timers", "timer 0", "timer 1", "tmod", "tcon", "mode 0", "mode 1", "mode 2", "serial port", "uart", "baud rate", "scon", "sbuf"],
            'mcu-interrupts-lcd': ["8051 interrupts", "ie", "ip", "external interrupt", "lcd interfacing", "hd44780", "16x2 lcd", "matrix keypad", "keypad scanning"],
            'mcu-adc-dac': ["adc0804", "dac0808", "analog to digital", "digital to analog", "lm35", "temperature sensor", "sensor interfacing"],
            'mcu-stepper-wave': ["stepper motor", "stepper motor interfacing", "waveform generator", "square wave", "sine wave", "triangular wave", "sawtooth"],
            'processor-comparison': ["processor comparison", "microprocessor vs microcontroller", "8086 vs 8051", "pic vs arm", "pic microcontroller", "arm cortex"],
            quiz: ["quiz", "assessment", "mcq", "gate", "exam", "question"]
          };
          const keywords = typeKeywords[s.interactiveType] || [];
          if (keywords.some(k => k.includes(query) || query.includes(k))) {
            isMatch = true;
            reason = s.interactiveType === 'quiz' ? 'GATE MCQ Quiz' : 'Interactive Lab';
          }
        }

        if (isMatch) {
          searchResults.push({
            slide: s,
            moduleId: m.id,
            moduleTitle: m.title,
            matchReason: reason
          });
        }
      });
    });
  }

  return (
    <div
      className={`fixed inset-y-0 left-0 z-40 bg-white/80 backdrop-blur-md text-slate-800 flex flex-col border-sky-100 transition-all duration-300 ease-in-out h-full shrink-0 overflow-hidden ${
        isOpen
          ? 'w-72 opacity-100 translate-x-0 border-r'
          : 'w-0 opacity-0 -translate-x-full lg:translate-x-0 border-r-0'
      } lg:static`}
    >
      <div className="w-72 h-full flex flex-col justify-between shrink-0">
        {/* Top Scrollable/Flex Area */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-sky-100 bg-sky-50/50 flex items-center justify-between h-16 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-indigo-600 rounded-lg text-white shadow-xs">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-display font-bold text-xs tracking-wider uppercase text-slate-900 leading-tight">
                  8086 Microprocessor
                </h1>
                <span className="text-[9px] text-indigo-600 font-mono tracking-wider font-semibold uppercase">
                  {currentModuleId === 'm20' || activeUnit === 'labs'
                    ? 'UNIT-6: LAB RESOURCES & MANUALS'
                    : ['m26', 'm27', 'm28', 'm29', 'm30'].some(id => currentModuleId === id)
                    ? 'UNIT-5: MICROCONTROLLER INTERFACING'
                    : ['m21', 'm22', 'm23', 'm24', 'm25'].some(id => currentModuleId === id)
                    ? 'UNIT-4: 8051 MICROCONTROLLER'
                    : ['m13', 'm14', 'm15', 'm16', 'm17', 'm18', 'm19'].some(id => currentModuleId === id)
                    ? 'UNIT-3: 8086 INTERFACING'
                    : ['m8', 'm9', 'm10', 'm11', 'm12'].some(id => currentModuleId === id)
                    ? 'UNIT-2: 8086 PROGRAMMING'
                    : 'UNIT-1: SYSTEM ARCHITECTURE'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-slate-500 hover:text-slate-900 cursor-pointer text-xl font-bold p-1"
            >
              &times;
            </button>
          </div>

          {/* Search box */}
          <div className="p-4 pb-3 border-b border-sky-100 bg-sky-50/10 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search topics, labs, quizzes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-8 text-xs font-medium placeholder-slate-400 focus:outline-none focus:border-indigo-450 focus:ring-1 focus:ring-indigo-400 transition-all text-slate-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-650 cursor-pointer p-0.5 rounded-full hover:bg-slate-100 flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Course Navigation items (or Search Results) */}
          <div className="p-4 overflow-y-auto flex-1 space-y-3">
            {hasSearch ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest px-1">
                  <span>Search Results ({searchResults.length})</span>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-indigo-600 hover:text-indigo-805 font-extrabold normal-case font-sans hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                </div>

                {searchResults.length > 0 ? (
                  <div className="space-y-1.5 pt-1">
                    {searchResults.map(({ slide, moduleId, moduleTitle, matchReason }) => {
                      const isCurrentSlide = slide.id === currentSlideId;
                      const isSlideCompleted = completedSlides.includes(slide.id);

                      return (
                        <button
                          key={slide.id}
                          onClick={() => onSelectSlide(moduleId, slide.id)}
                          className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition-all flex flex-col gap-1 border border-transparent ${
                            isCurrentSlide
                              ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                              : 'bg-slate-50/50 hover:bg-indigo-50/50 text-slate-700 hover:text-slate-900 border-slate-100 hover:border-indigo-150'
                          }`}
                        >
                          <div className="flex items-start justify-between w-full gap-2">
                            <span className={`font-bold leading-tight ${isCurrentSlide ? 'text-white' : 'text-slate-900'}`}>
                              {slide.title}
                            </span>
                            {isSlideCompleted && (
                              <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isCurrentSlide ? 'text-indigo-200' : 'text-emerald-600'}`} />
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-mono mt-0.5">
                            <span className={`px-1.5 py-0.5 rounded uppercase font-semibold border ${
                              isCurrentSlide 
                                ? 'bg-indigo-700/55 border-indigo-500/50 text-indigo-100' 
                                : 'bg-slate-100 border-slate-200 text-slate-500'
                            }`}>
                              {moduleTitle.replace('Module ', 'M')}
                            </span>
                            
                            {slide.interactiveType && (
                              <span className={`px-1.5 py-0.5 rounded uppercase font-bold flex items-center gap-0.5 border ${
                                isCurrentSlide 
                                  ? 'bg-amber-600/60 border-amber-500/50 text-amber-100' 
                                  : 'bg-amber-50 border-amber-200 text-amber-800'
                              }`}>
                                {slide.interactiveType === 'quiz' ? (
                                  <>
                                    <GraduationCap className="w-2.5 h-2.5 shrink-0" />
                                    <span>Quiz</span>
                                  </>
                                ) : (
                                  <>
                                    <Cpu className="w-2.5 h-2.5 shrink-0" />
                                    <span>Lab</span>
                                  </>
                                )}
                              </span>
                            )}

                            {matchReason && matchReason !== 'Slide Title' && (
                              <span className={`italic px-1 ${isCurrentSlide ? 'text-indigo-200' : 'text-slate-400'}`}>
                                Matched: {matchReason}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 px-2 space-y-2">
                    <Search className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-500 leading-normal">
                      No topics found matching <strong className="text-slate-700 font-bold">&ldquo;{searchQuery}&rdquo;</strong>.
                    </p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
                    >
                      Browse all modules
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Unit Selector Dropdown */}
                <div className="relative shrink-0 px-1">
                  <label className="block text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest mb-1.5">
                    Select Syllabus Unit
                  </label>
                  <div className="relative">
                    <select
                      id="unit-selector"
                      value={activeUnit}
                      onChange={(e) => setActiveUnit(e.target.value as 'unit1' | 'unit2' | 'unit3' | 'unit4' | 'unit5' | 'labs')}
                      className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 font-bold rounded-xl text-xs shadow-xs focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer appearance-none outline-none"
                    >
                      <option value="unit1">Unit I: System Architecture</option>
                      <option value="unit2">Unit II: 8086 Programming</option>
                      <option value="unit3">Unit III: 8086 Interfacing</option>
                      <option value="unit4">Unit IV: 8051 Microcontroller</option>
                      <option value="unit5">Unit V: Microcontroller Interfacing</option>
                      <option value="labs">Unit VI: Lab Resources & Experiments Manual</option>
                    </select>
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <GraduationCap className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400 rotate-90" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest px-1 flex justify-between items-center">
                    <span>Learning Modules</span>
                    <span className="text-[9px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 font-sans">
                      {activeUnit === 'labs' ? 'Unit VI: Lab Resources' : activeUnit === 'unit5' ? 'Unit V: MCU Interfacing' : activeUnit === 'unit4' ? 'Unit IV: 8051 Microcontroller' : activeUnit === 'unit3' ? 'Unit III: Interfacing' : activeUnit === 'unit2' ? 'Unit II: Programming' : 'Unit I: Architecture'}
                    </span>
                  </div>

                  {activeUnit === 'labs' ? (() => {
                    const expSlideMap: Record<string, { moduleId: string; slideId: string }> = {
                      exp1: { moduleId: 'm20', slideId: 'm20-s1' },
                      exp2: { moduleId: 'm20', slideId: 'm20-s2' },
                      exp_math: { moduleId: 'm20', slideId: 'm20-s3' },
                      exp_bit1: { moduleId: 'm20', slideId: 'm20-s4' },
                      exp_bit2: { moduleId: 'm20', slideId: 'm20-s5' },
                      exp_bit3: { moduleId: 'm20', slideId: 'm20-s6' },
                      exp_arr1: { moduleId: 'm20', slideId: 'm20-s7' },
                      exp3: { moduleId: 'm20', slideId: 'm20-s8' },
                      exp4: { moduleId: 'm20', slideId: 'm20-s9' },
                      exp_str1: { moduleId: 'm20', slideId: 'm20-s10' },
                      exp_str2: { moduleId: 'm20', slideId: 'm20-s11' },
                      exp_str3: { moduleId: 'm20', slideId: 'm20-s12' },
                      exp_str4: { moduleId: 'm20', slideId: 'm20-s13' },
                      exp_clock1: { moduleId: 'm20', slideId: 'm20-s14' },
                      exp_clock2: { moduleId: 'm20', slideId: 'm20-s15' },
                      exp_clock3: { moduleId: 'm20', slideId: 'm20-s16' },
                      exp_stepper1: { moduleId: 'm20', slideId: 'm20-s17' },
                      exp_stepper2: { moduleId: 'm20', slideId: 'm20-s18' },
                      exp_adc: { moduleId: 'm20', slideId: 'm20-s19' },
                      exp_dac: { moduleId: 'm20', slideId: 'm20-s20' },
                      exp5: { moduleId: 'm20', slideId: 'm20-s21' },
                      exp_8051_arith: { moduleId: 'm20', slideId: 'm20-s22' },
                      exp_8051_muldiv: { moduleId: 'm20', slideId: 'm20-s23' },
                      exp_8051_logic: { moduleId: 'm20', slideId: 'm20-s24' },
                      exp_8051_regbanks: { moduleId: 'm20', slideId: 'm20-s25' },
                      exp_8051_timer0_m1: { moduleId: 'm20', slideId: 'm20-s26' },
                      exp_8051_timer1_m0: { moduleId: 'm20', slideId: 'm20-s27' },
                      exp_8051_counter0_m2: { moduleId: 'm20', slideId: 'm20-s28' },
                      exp_8051_counter1_m1: { moduleId: 'm20', slideId: 'm20-s29' },
                      exp_8051_uart_9600: { moduleId: 'm20', slideId: 'm20-s30' },
                      exp_8051_uart_4800: { moduleId: 'm20', slideId: 'm20-s31' },
                      exp_8051_uart_2400: { moduleId: 'm20', slideId: 'm20-s32' },
                      exp_8051_lcd_8bit: { moduleId: 'm20', slideId: 'm20-s33' },
                      exp_8051_lcd_4bit: { moduleId: 'm20', slideId: 'm20-s34' },
                    };

                    const groupedLabs = [
                      {
                        title: "Lab Resources 1: Arithmetic Instructions",
                        experiments: labExperiments.filter(e => typeof e.number === 'string' && (e.number === '1A' || e.number === '1B' || e.number === '1C'))
                      },
                      {
                        title: "Lab Resources 2: Bit Manipulation Instructions",
                        experiments: labExperiments.filter(e => typeof e.number === 'string' && e.number.startsWith('2'))
                      },
                      {
                        title: "Lab Resources 3: Array Operations",
                        experiments: labExperiments.filter(e => typeof e.number === 'string' && e.number.startsWith('3'))
                      },
                      {
                        title: "Lab Resources 4: String Operations",
                        experiments: labExperiments.filter(e => typeof e.number === 'string' && e.number.startsWith('4'))
                      },
                      {
                        title: "Lab Resources 5: Digital Clock Design",
                        experiments: labExperiments.filter(e => typeof e.number === 'string' && e.number.startsWith('5'))
                      },
                      {
                        title: "Lab Resources 6: Stepper Motor Interfacing",
                        experiments: labExperiments.filter(e => typeof e.number === 'string' && e.number.startsWith('6'))
                      },
                      {
                        title: "Lab Resources 7: ADC & DAC Interfacing",
                        experiments: labExperiments.filter(e => typeof e.number === 'string' && e.number.startsWith('7'))
                      },
                      {
                        title: "Lab Resources 8: Block Data Transfer",
                        experiments: labExperiments.filter(e => typeof e.number === 'string' && e.number.startsWith('8'))
                      },
                      {
                        title: "Lab Resources 9: 8051 Arithmetic & Logical Instructions",
                        experiments: labExperiments.filter(e => typeof e.number === 'string' && e.number.startsWith('9'))
                      },
                      {
                        title: "Lab Resources 10: 8051 Timers & Counters Verification",
                        experiments: labExperiments.filter(e => typeof e.number === 'string' && e.number.startsWith('10'))
                      },
                      {
                        title: "Lab Resources 11: 8051 UART Serial Operation",
                        experiments: labExperiments.filter(e => typeof e.number === 'string' && e.number.startsWith('11'))
                      },
                      {
                        title: "Lab Resources 12: 8051 16×2 LCD Interfacing",
                        experiments: labExperiments.filter(e => typeof e.number === 'string' && e.number.startsWith('12'))
                      }
                    ];

                    return (
                      <div className="space-y-5 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
                        {groupedLabs.map((group, gIdx) => {
                          if (group.experiments.length === 0) return null;
                          return (
                            <div key={gIdx} className="space-y-2">
                              <h5 className="text-[9.5px] font-black font-mono text-indigo-600 bg-indigo-50/50 px-2 py-1 rounded-lg border border-indigo-100/40 uppercase tracking-widest pl-2">
                                {group.title}
                              </h5>
                              <div className="space-y-2">
                                {group.experiments.map(exp => {
                                  const isCurrent = (currentModuleId === 'm20' || currentModuleId === 'm11') && currentLabId === exp.id;
                                  const target = expSlideMap[exp.id] || { moduleId: 'm20', slideId: 'm20-s1' };
                                  return (
                                    <button
                                      key={exp.id}
                                      onClick={() => onSelectSlide(target.moduleId, target.slideId, exp.id)}
                                      className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                                        isCurrent
                                          ? 'border-indigo-300 bg-indigo-50/70 text-indigo-950 font-semibold shadow-xs'
                                          : 'border-slate-100 bg-slate-50/35 text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-200'
                                      }`}
                                    >
                                      <div className="flex items-start justify-between w-full gap-2">
                                        <span className="flex items-center gap-2">
                                          <span className={`text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded ${
                                            isCurrent
                                              ? 'bg-indigo-600 text-white'
                                              : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                          }`}>
                                            EXP {exp.number}
                                          </span>
                                          <span className={`font-bold text-xs leading-tight ${isCurrent ? 'text-slate-900' : 'text-slate-800'}`}>
                                            {exp.title}
                                          </span>
                                        </span>
                                        {isCurrent && (
                                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 mt-1" />
                                        )}
                                      </div>
                                      <p className={`text-[10px] leading-normal font-medium line-clamp-2 ${isCurrent ? 'text-indigo-900/80' : 'text-slate-500'}`}>
                                        {exp.aim}
                                      </p>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })() : (
                    <div className="space-y-2">
                      {modules
                        .filter((m) => {
                          if (m.id === 'm20') return false;
                          const isM5 = ['m26', 'm27', 'm28', 'm29', 'm30'].includes(m.id);
                          const isM4 = ['m21', 'm22', 'm23', 'm24', 'm25'].includes(m.id);
                          const isM3 = ['m13', 'm14', 'm15', 'm16', 'm17', 'm18', 'm19'].includes(m.id);
                          const isM2 = ['m8', 'm9', 'm10', 'm11', 'm12'].includes(m.id);
                          if (activeUnit === 'unit5') return isM5;
                          if (activeUnit === 'unit4') return isM4;
                          if (activeUnit === 'unit3') return isM3;
                          if (activeUnit === 'unit2') return isM2;
                          return !isM2 && !isM3 && !isM4 && !isM5;
                        })
                        .map((m) => {
                          const mIdx = modules.findIndex(mod => mod.id === m.id);
                          const isCurrentModule = m.id === currentModuleId;
                          const moduleCompletedCount = m.slides.filter(s => completedSlides.includes(s.id)).length;
                          const isModuleFullyStudied = moduleCompletedCount === m.slides.length;
                          const displayIdx = (mIdx + 1).toString().padStart(2, '0');

                          return (
                            <div key={m.id} className="space-y-1">
                              <button
                                onClick={() => onSelectSlide(m.id, m.slides[0].id)}
                                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-xs font-medium cursor-pointer text-left ${
                                  isCurrentModule
                                    ? 'border-indigo-200 bg-indigo-50 text-indigo-800 font-semibold shadow-xs'
                                    : 'border-slate-100 bg-slate-50/30 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                              >
                                <span className="truncate flex items-center gap-2.5">
                                  <span className={`font-mono text-[10px] ${isCurrentModule ? 'text-indigo-600' : 'text-slate-400'}`}>
                                    {displayIdx}
                                  </span>
                                  {isModuleFullyStudied ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  ) : (
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isCurrentModule ? 'bg-indigo-500' : 'bg-slate-300'}`}></span>
                                  )}
                                  <span className={`truncate ${isCurrentModule ? 'font-bold text-slate-900' : ''}`}>
                                    {m.title.replace(/^Module\s+\d+:\s*/i, '')}
                                  </span>
                                </span>
                                <span className="text-[9px] font-mono text-slate-500 shrink-0 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                  {moduleCompletedCount}/{m.slides.length}
                                </span>
                              </button>

                              {/* List of slides within the current selected module */}
                              {isCurrentModule && (
                                <div className="pl-4 pr-1 border-l border-slate-200 space-y-1 py-1 ml-3 mt-1">
                                  {m.slides.map((slide) => {
                                    const isCurrentSlide = slide.id === currentSlideId;
                                    const isSlideCompleted = completedSlides.includes(slide.id);

                                    return (
                                      <button
                                        key={slide.id}
                                        onClick={() => onSelectSlide(m.id, slide.id)}
                                        className={`w-full text-left py-2 px-2.5 rounded-xl text-[11px] transition-all flex items-center justify-between group border ${
                                          isCurrentSlide
                                            ? 'bg-indigo-600 text-white font-bold shadow-md border-indigo-500 ring-2 ring-indigo-300/50 pl-2.5'
                                            : 'text-slate-600 hover:text-indigo-700 hover:bg-indigo-50/60 border-transparent hover:border-indigo-100/80'
                                        }`}
                                      >
                                        <span className="truncate pr-1 group-hover:translate-x-0.5 transition-transform duration-150 flex items-center gap-1.5">
                                          {isCurrentSlide && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />}
                                          {slide.title}
                                        </span>
                                        {isSlideCompleted && !isCurrentSlide && (
                                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-sky-100 bg-sky-50/30 text-[10px] text-slate-400 font-mono text-center flex items-center justify-center gap-2 h-14 shrink-0">
          <Layout className="w-3.5 h-3.5 text-indigo-600" />
          <span className="uppercase tracking-wider">Lab Presentation mode</span>
        </div>
      </div>
    </div>
  );
}
