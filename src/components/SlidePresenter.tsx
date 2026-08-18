import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Slide, QuizQuestion } from '../types';
import { ChevronLeft, ChevronRight, CheckCircle, HelpCircle, GraduationCap, RefreshCw, Layers, PanelLeftClose, PanelLeftOpen, Sparkles, BookOpen, X, ZoomIn, Target, Cpu, Maximize2, Minimize2, Video, Play, Film } from 'lucide-react';

function getVideoEmbed(url: string) {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'iframe',
      src: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0`
    };
  }
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'iframe',
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}`
    };
  }
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) {
    return {
      type: 'video',
      src: url
    };
  }
  return {
    type: 'iframe',
    src: url
  };
}

// Import simulators lazily for code-splitting
const EvolutionTimeline = React.lazy(() => import('./EvolutionTimeline'));
const PinConfigurationSimulator = React.lazy(() => import('./PinConfigurationSimulator'));
const ArchitectureExplorer = React.lazy(() => import('./ArchitectureExplorer'));
const FlagRegisterSimulator = React.lazy(() => import('./FlagRegisterSimulator'));
const MemoryCalculationSimulator = React.lazy(() => import('./MemoryCalculationSimulator'));
const InterruptVectorTableSimulator = React.lazy(() => import('./InterruptVectorTableSimulator'));
const IntroInterruptsSimulator = React.lazy(() => import('./IntroInterruptsSimulator'));
const TimingDiagramSimulator = React.lazy(() => import('./TimingDiagramSimulator'));
const PipeliningSimulator = React.lazy(() => import('./PipeliningSimulator'));
const OperatingModeSimulator = React.lazy(() => import('./OperatingModeSimulator'));
const MinimumModeHardwareSimulator = React.lazy(() => import('./MinimumModeHardwareSimulator'));

// Unit II Simulators
const DevPipelineSimulator = React.lazy(() => import('./DevPipelineSimulator'));
const AddressingModesSimulator = React.lazy(() => import('./AddressingModesSimulator'));
const InstructionDecoderSimulator = React.lazy(() => import('./InstructionDecoderSimulator'));
const InstructionBuilderSimulator = React.lazy(() => import('./InstructionBuilderSimulator').then(m => ({ default: m.InstructionBuilderSimulator })));
const DirectiveSandboxSimulator = React.lazy(() => import('./DirectiveSandboxSimulator'));
const AssemblerPlaygroundSimulator = React.lazy(() => import('./AssemblerPlaygroundSimulator'));
const AssemblerPassSimulator = React.lazy(() => import('./AssemblerPassSimulator'));
const AssemblerOutputsSimulator = React.lazy(() => import('./AssemblerOutputsSimulator'));

// Unit III Simulators
const MemoryInterfacingSimulator = React.lazy(() => import('./MemoryInterfacingSimulator'));
const PPI8255Simulator = React.lazy(() => import('./PPI8255Simulator'));
const PeripheralInterfacingSimulator = React.lazy(() => import('./PeripheralInterfacingSimulator'));
const AnalogInterfacingSimulator = React.lazy(() => import('./AnalogInterfacingSimulator'));
const Interrupt8259Simulator = React.lazy(() => import('./Interrupt8259Simulator'));
const USART8251Simulator = React.lazy(() => import('./USART8251Simulator'));
const DMA8237Simulator = React.lazy(() => import('./DMA8237Simulator'));

// Unit IV & V Simulators
const MCU8051Simulator = React.lazy(() => import('./MCU8051Simulator'));
const MCU8051InterfacingSimulator = React.lazy(() => import('./MCU8051InterfacingSimulator'));

interface SlidePresenterProps {
  slide: Slide;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  onMarkComplete: (slideId: string) => void;
  completedSlides: string[];
  revealedPointsCount: number;
  incrementalRevealEnabled: boolean;
  projectorMode?: boolean;
  showInteractive?: boolean;
  activeLabId?: string;
  fullScreenMode?: boolean;
  onToggleFullScreen?: (enable?: boolean) => void;
}

export default function SlidePresenter({
  slide,
  onNext,
  onPrev,
  isFirst,
  isLast,
  onMarkComplete,
  completedSlides,
  revealedPointsCount,
  incrementalRevealEnabled,
  projectorMode = false,
  showInteractive = false,
  activeLabId,
  fullScreenMode = false,
  onToggleFullScreen
}: SlidePresenterProps) {
  // Quiz states
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number | null>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);

  // Video embedding custom overrides state
  const [customVideoOverrides, setCustomVideoOverrides] = useState<Record<string, { url: string; title: string }>>(() => {
    try {
      const saved = localStorage.getItem('applet_slide_video_overrides');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [inputVideoUrl, setInputVideoUrl] = useState('');
  const [inputVideoTitle, setInputVideoTitle] = useState('');

  const activeVideoUrl = customVideoOverrides[slide.id]?.url ?? slide.videoUrl ?? '';
  const activeVideoTitle = customVideoOverrides[slide.id]?.title ?? slide.videoTitle ?? 'Embedded Video Resource / Lecture';

  const handleSaveVideo = () => {
    const updated = {
      ...customVideoOverrides,
      [slide.id]: {
        url: inputVideoUrl.trim(),
        title: inputVideoTitle.trim() || 'Embedded Video Resource'
      }
    };
    setCustomVideoOverrides(updated);
    try {
      localStorage.setItem('applet_slide_video_overrides', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    setIsVideoModalOpen(false);
  };

  const handleRemoveVideo = () => {
    const updated = { ...customVideoOverrides };
    delete updated[slide.id];
    setCustomVideoOverrides(updated);
    try {
      localStorage.setItem('applet_slide_video_overrides', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    setIsVideoModalOpen(false);
  };

  // Double tap & touch swipe gesture states/refs
  const lastTapRef = useRef<number>(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleDoubleClick = (e: React.MouseEvent) => {
    // Exit full screen mode on double click
    if (fullScreenMode && onToggleFullScreen) {
      onToggleFullScreen(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const now = Date.now();
    // Double tap detection (within 300ms)
    if (now - lastTapRef.current < 300) {
      if (fullScreenMode && onToggleFullScreen) {
        onToggleFullScreen(false);
      }
    }
    lastTapRef.current = now;

    // Swipe gesture detection
    if (touchStartRef.current && e.changedTouches.length > 0) {
      const touchEnd = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      };
      const deltaX = touchEnd.x - touchStartRef.current.x;
      const deltaY = touchEnd.y - touchStartRef.current.y;

      // Ensure horizontal swipe is dominant and above 50px threshold
      if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
        if (deltaX < 0) {
          // Swipe Left -> Go to Next slide
          if (!isLast) onNext();
        } else {
          // Swipe Right -> Go to Previous slide
          if (!isFirst) onPrev();
        }
      }
    }
    touchStartRef.current = null;
  };

  // Reset quiz states when changing slides
  useEffect(() => {
    setSelectedAnswers({});
    setQuizFinished(false);
    setQuizScore(0);
    setCurrentQuestionIdx(0);
    setSidebarCollapsed(true);
    setIsExplanationOpen(false);
  }, [slide.id]);

  // Magnifier States
  const [magnifier, setMagnifier] = useState<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const [magnifierModeEnabled, setMagnifierModeEnabled] = useState(false);
  const bentoCardRef = useRef<HTMLDivElement>(null);

  const lensSize = 180;
  const zoomFactor = 2.2;

  // Reset magnifier when slide changes
  useEffect(() => {
    setMagnifier({ x: 0, y: 0, active: false });
    setMagnifierModeEnabled(false);
  }, [slide.id]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!slide.interactiveType || slide.interactiveType === 'quiz') return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    const card = bentoCardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Only update position if magnifier mode was explicitly toggled ON via button
    if (magnifierModeEnabled) {
      setMagnifier({
        x: Math.max(0, Math.min(rect.width, x)),
        y: Math.max(0, Math.min(rect.height, y)),
        active: true
      });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!slide.interactiveType || slide.interactiveType === 'quiz') return;

    const card = bentoCardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (magnifierModeEnabled) {
      setMagnifier({
        x: Math.max(0, Math.min(rect.width, x)),
        y: Math.max(0, Math.min(rect.height, y)),
        active: true
      });
    }
  };

  const handlePointerUpOrLeave = () => {
    if (!magnifierModeEnabled) {
      setMagnifier(prev => ({ ...prev, active: false }));
    }
  };

  const handleSelectAnswer = (qIdx: number, oIdx: number, correctIdx: number) => {
    if (selectedAnswers[qIdx] !== undefined && selectedAnswers[qIdx] !== null) return; // already answered
    
    setSelectedAnswers(prev => ({
      ...prev,
      [qIdx]: oIdx
    }));

    if (oIdx === correctIdx) {
      setQuizScore(prev => prev + 1);
    }
  };

  const getQuizButtonColor = (qIdx: number, oIdx: number, correctIdx: number) => {
    const selectedIdx = selectedAnswers[qIdx];
    if (selectedIdx === undefined || selectedIdx === null) {
      return 'border-slate-200 hover:bg-slate-50 text-slate-700 bg-white hover:border-slate-300 shadow-xs';
    }

    if (oIdx === correctIdx) {
      return 'bg-emerald-50 border-emerald-300 text-emerald-700 font-semibold'; // correct option
    }

    if (selectedIdx === oIdx) {
      return 'bg-rose-50 border-rose-300 text-rose-700 font-semibold'; // user selected wrong option
    }

    return 'opacity-40 border-slate-100 text-slate-400 bg-slate-50/50'; // rest
  };

  // Automatically mark standard slides complete upon reaching them
  useEffect(() => {
    if (slide.interactiveType !== 'quiz') {
      onMarkComplete(slide.id);
    } else if (quizFinished) {
      onMarkComplete(slide.id);
    }
  }, [slide.id, quizFinished, onMarkComplete, slide.interactiveType]);

  const handleFinishQuiz = () => {
    setQuizFinished(true);
    onMarkComplete(slide.id);
  };

  const handleRestartQuiz = () => {
    setSelectedAnswers({});
    setQuizFinished(false);
    setQuizScore(0);
    setCurrentQuestionIdx(0);
  };

  // Render the appropriate interactive simulator based on type
  const renderInteractive = (type: string) => {
    let component = null;
    switch (type) {
      case 'evolution':
        component = <EvolutionTimeline defaultTab={slide.id === 'm1-s3' ? 'vs' : 'timeline'} />;
        break;
      case 'pins':
        component = <PinConfigurationSimulator />;
        break;
      case 'architecture':
        component = <ArchitectureExplorer />;
        break;
      case 'flags':
        component = <FlagRegisterSimulator />;
        break;
      case 'memory-calc':
        component = (
          <MemoryCalculationSimulator 
            key={slide.id} 
            defaultTab={
              slide.id === 'm3-s4' ? 'physical-map' : ((slide.id === 'm3-s2' || slide.id === 'm3-s3') ? 'segmented-structure' : 'calculator')
            } 
            onlyDifferenceTable={slide.id === 'm3-s3'}
            onlyMemoryBanking={slide.id === 'm3-s4'}
          />
        );
        break;
      case 'intro-interrupts':
        component = <IntroInterruptsSimulator />;
        break;
      case 'interrupts':
        component = <InterruptVectorTableSimulator />;
        break;
      case 'timing':
        component = <TimingDiagramSimulator />;
        break;
      case 'pipelining':
        component = <PipeliningSimulator />;
        break;
      case 'modes':
        component = <OperatingModeSimulator />;
        break;
      case 'min-mode-hardware':
        component = <MinimumModeHardwareSimulator />;
        break;
      case 'dev-pipeline':
        component = <DevPipelineSimulator />;
        break;
      case 'addressing-modes':
        component = <AddressingModesSimulator />;
        break;
      case 'instruction-decoder':
        component = (
          <InstructionDecoderSimulator
            initialTab={slide.id === 'm10-s4' ? 'groups' : 'lab'}
            initialSubTab={slide.id === 'm10-s3' ? 'explanation' : 'instructions'}
            hideGroupsTab={slide.id === 'm10-s3'}
            hideLabTab={slide.id === 'm10-s4'}
            hideBranchingTab={slide.id === 'm10-s3'}
            hideComparisonTab={slide.id === 'm10-s3'}
            hideRememberTab={slide.id === 'm10-s3'}
            hideGuideBanner={slide.id === 'm10-s3'}
          />
        );
        break;
      case 'instruction-builder':
        component = <InstructionBuilderSimulator />;
        break;
      case 'directive-sandbox': {
        let initialTab = activeLabId;
        let allowedTabs: Array<'directives' | 'styles' | 'models' | 'nearfar' | 'sandbox' | 'multiprecision'> | undefined = undefined;

        if (slide.id === 'm11-s1') initialTab = 'directives';
        else if (slide.id === 'm11-s2') {
          initialTab = 'styles';
          allowedTabs = ['directives', 'styles'];
        }
        else if (slide.id === 'm11-s2b') {
          initialTab = 'models';
          allowedTabs = ['models', 'sandbox'];
        }
        else if (slide.id === 'm11-s2c') {
          initialTab = 'nearfar';
          allowedTabs = ['nearfar'];
        }
        else if (slide.id === 'm20-s1') initialTab = 'multiprecision';

        component = (
          <DirectiveSandboxSimulator
            initialLabId={initialTab}
            hideExp1a={slide.moduleId === 'm11'}
            allowedTabs={allowedTabs}
          />
        );
        break;
      }
      case 'assembler-playground':
        component = <AssemblerPlaygroundSimulator />;
        break;
      case 'assembler-passes':
        component = <AssemblerPassSimulator />;
        break;
      case 'assembler-outputs':
        component = <AssemblerOutputsSimulator />;
        break;
      case 'memory-interfacing':
        component = <MemoryInterfacingSimulator />;
        break;
      case 'ppi-8255':
        component = <PPI8255Simulator />;
        break;
      case 'peripheral-interfacing': {
        let mode: 'circuit' | 'stepper' | 'stepper-code' | 'display' | 'keypad' | 'traffic' | 'alp' = 'circuit';
        let allowedTabs: ('circuit' | 'stepper' | 'stepper-code' | 'display' | 'keypad' | 'traffic' | 'alp')[] | undefined = undefined;

        if (slide.id === 'm15-s1') {
          mode = 'circuit';
          allowedTabs = ['circuit', 'stepper', 'stepper-code'];
        }
        else if (slide.id === 'm15-s2') mode = 'display';
        else if (slide.id === 'm15-s3') mode = 'keypad';
        else if (slide.id === 'm15-s4') mode = 'traffic';
        else if (slide.id === 'm15-s5') mode = 'alp';

        component = <PeripheralInterfacingSimulator initialTab={mode} allowedTabs={allowedTabs} />;
        break;
      }
      case 'analog-interfacing':
        component = <AnalogInterfacingSimulator />;
        break;
      case 'interrupt-8259':
        component = <Interrupt8259Simulator />;
        break;
      case 'usart-8251':
        component = <USART8251Simulator />;
        break;
      case 'dma-8237':
        component = <DMA8237Simulator />;
        break;
      case 'mcu-8051':
        component = <MCU8051Simulator initialTab="architecture" />;
        break;
      case 'sfr-memory':
        component = <MCU8051Simulator initialTab="sfr" />;
        break;
      case 'mcu-pins':
        component = <MCU8051Simulator initialTab="pins" />;
        break;
      case 'mcu-instructions':
        component = <MCU8051Simulator initialTab="instructions" />;
        break;
      case 'mcu-alp':
        component = <MCU8051Simulator initialTab="alp" />;
        break;
      case 'mcu-timers-serial':
        component = <MCU8051InterfacingSimulator initialTab="timers" />;
        break;
      case 'mcu-interrupts-lcd':
        component = <MCU8051InterfacingSimulator initialTab="interrupts-lcd" />;
        break;
      case 'mcu-adc-dac':
        component = <MCU8051InterfacingSimulator initialTab="adc-dac" />;
        break;
      case 'mcu-stepper-wave':
        component = <MCU8051InterfacingSimulator initialTab="stepper" />;
        break;
      case 'processor-comparison':
        component = <MCU8051InterfacingSimulator initialTab="comparison" />;
        break;
      default:
        return null;
    }

    return (
      <React.Suspense fallback={
        <div className="p-8 text-center text-slate-500 font-mono text-xs flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading Interactive Simulator...</span>
        </div>
      }>
        {component}
      </React.Suspense>
    );
  };

  return (
    <div 
      onDoubleClick={handleDoubleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`flex-1 flex flex-col justify-between min-h-0 bg-transparent overflow-hidden relative select-none ${
        fullScreenMode ? 'p-2 md:p-3 bg-white border-0' : 'p-3 md:p-5'
      }`}
    >
      {/* Floating Full Screen Mode Minimal Quick Exit Icon */}
      {fullScreenMode && (
        <button
          onClick={() => onToggleFullScreen?.(false)}
          className="absolute top-3 right-3 z-50 p-2 bg-slate-900/60 hover:bg-slate-900/90 text-slate-200 hover:text-white rounded-full transition-all border border-slate-700/50 opacity-50 hover:opacity-100 shadow-sm cursor-pointer"
          title="Exit Full Screen Mode (or Double Tap)"
        >
          <Minimize2 className="w-4 h-4" />
        </button>
      )}

      {/* Slide Content Arena */}
      <div className="flex-1 flex flex-col justify-between min-h-0 overflow-y-auto pr-1 scrollbar-thin pb-2">
        {/* Core Slide body */}
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-5 min-h-0 items-stretch pr-1">
            {/* Text points (Standard Presentation Layout in a Bento Box) */}
            {(!slide.interactiveType || slide.moduleId === 'm20') && (
              slide.moduleId === 'm20' ? (
                /* Unit VI Comprehensive Experiment Layout - AIM ONLY */
                <div className="w-full max-w-full bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between xl:col-span-12 space-y-6">
                  {!fullScreenMode && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2">
                        </div>
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-full text-xs font-bold font-mono">
                          Experiment Aim
                        </span>
                      </div>

                      <motion.h2
                        key={slide.title}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-display text-2xl md:text-3xl lg:text-3.5xl font-extrabold text-slate-900 tracking-tight leading-tight"
                      >
                        {slide.title}
                      </motion.h2>

                      <div className="h-1.5 w-24 bg-gradient-to-r from-indigo-600 via-sky-500 to-indigo-400 rounded-full shadow-xs"></div>
                    </div>
                  )}

                  {/* Experiment Aim & Theory Cards */}
                  <div className="w-full space-y-2.5">
                    {slide.points && slide.points.map((pt, pIdx) => {
                      const isTheory = pt.includes('THEORY') || pt.includes('CONCEPT') || pt.includes('💡');
                      return (
                        <div 
                          key={pIdx} 
                          className={`border rounded-2xl p-4 md:p-5 shadow-xs space-y-1.5 transition-all ${
                            isTheory 
                              ? 'bg-amber-50/70 border-amber-200/90 text-amber-950' 
                              : 'bg-gradient-to-r from-indigo-50/90 via-sky-50/60 to-slate-50 border-indigo-200/90'
                          }`}
                        >
                          <div className={`flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider ${
                            isTheory ? 'text-amber-800' : 'text-indigo-700'
                          }`}>
                            {isTheory ? (
                              <BookOpen className="w-4 h-4 text-amber-600" />
                            ) : (
                              <Target className="w-4 h-4 text-indigo-600" />
                            )}
                            {isTheory ? 'Theoretical Concept & Logic' : 'Experiment Objective'}
                          </div>
                          <p className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">
                            {pt}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Embedded Interactive Interface for Unit 4 Experiments if present */}
                  {slide.interactiveType && (
                    <div className="pt-6 border-t border-slate-200/90 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-indigo-50/80 via-sky-50/40 to-slate-50 p-4 rounded-2xl border border-indigo-150">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs">
                            <Cpu className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-indigo-700 block">
                              Interactive Lab Simulator
                            </span>
                            <h3 className="font-display font-bold text-base sm:text-lg text-slate-900">
                              Multi-Precision Addition & Assembly Directive Interface
                            </h3>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-white border border-indigo-200 text-indigo-800 rounded-full text-xs font-mono font-bold shadow-2xs">
                          Live Interactive Execution
                        </span>
                      </div>

                      <div className="rounded-2xl border border-slate-200/90 overflow-hidden bg-slate-50 shadow-xs p-1">
                        {renderInteractive(slide.interactiveType)}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
                    <span>8086 Microprocessor Micro-Lab Manual</span>
                    <span>Department of Computer Engineering</span>
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-full bg-white border border-slate-200/80 rounded-3xl p-3 md:p-4 lg:p-5 shadow-xs hover:shadow-md hover:border-indigo-150 transition-all duration-300 flex flex-col justify-between xl:col-span-12">
                  <div className="space-y-2 md:space-y-2.5">
                    {!fullScreenMode && (
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider bg-indigo-50 border border-indigo-100 text-indigo-700 uppercase">
                              <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />
                              {slide.moduleTitle || 'Academic Courseware'}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-50 border border-slate-200 text-slate-500 shadow-2xs">
                              Slide ID: {slide.id}
                            </span>
                          </div>
                        </div>
                        <motion.h2
                          key={slide.title}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="font-display text-lg md:text-2xl lg:text-2.5xl font-extrabold text-slate-900 tracking-tight leading-tight"
                        >
                          {slide.title}
                        </motion.h2>
                        <div className="h-1 w-16 bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full mt-1 shadow-sm"></div>
                      </div>
                    )}

                    {/* Standard points with compact, crisp spacing */}
                    {slide.points && (
                      slide.id === 'm2-s1' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 pt-1">
                          {/* Left Column: BIU */}
                          <div className="flex flex-col justify-between space-y-2">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                                <h3 className="font-display text-sm md:text-base font-bold text-slate-900 tracking-tight uppercase">
                                  Bus Interface Unit (BIU)
                                </h3>
                              </div>
                              
                              <div className="space-y-1.5 pl-2.5">
                                {[
                                  'Fetches instructions from memory',
                                  'Generates physical addresses',
                                  'Reads and writes memory',
                                  'Stores fetched instruction bytes in the 6-byte prefetch queue',
                                  'Handles bus operations'
                                ].map((pt, idx) => (
                                  <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                                    className="flex gap-2 items-start group hover:translate-x-1 transition-transform duration-200 cursor-default"
                                  >
                                    <div className="flex items-center justify-center w-3.5 h-3.5 shrink-0 mt-0.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:scale-125 group-hover:bg-indigo-600 transition-all duration-200"></span>
                                    </div>
                                    <p className="text-slate-700 text-[13.5px] font-medium leading-tight">
                                      {pt}
                                    </p>
                                  </motion.div>
                                ))}
                              </div>
                            </div>

                            {/* Analogy Block */}
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all duration-300">
                              <p className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-wider mb-0.5">
                                Analogy
                              </p>
                              <p className="text-slate-600 text-[13px] italic leading-tight">
                                "Think of the BIU as a delivery person who brings instructions and data from memory."
                              </p>
                            </div>
                          </div>

                          {/* Right Column: EU */}
                          <div className="flex flex-col justify-between space-y-2">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                                <h3 className="font-display text-sm md:text-base font-bold text-slate-900 tracking-tight uppercase">
                                  Execution Unit (EU)
                                </h3>
                              </div>

                              <div className="space-y-1.5 pl-2.5">
                                {[
                                  'Takes instruction bytes from the prefetch queue',
                                  'Decodes instructions',
                                  'Executes instructions',
                                  'Performs arithmetic and logic operations',
                                  'Updates registers and flags'
                                ].map((pt, idx) => (
                                  <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                                    className="flex gap-2 items-start group hover:translate-x-1 transition-transform duration-200 cursor-default"
                                  >
                                    <div className="flex items-center justify-center w-3.5 h-3.5 shrink-0 mt-0.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:scale-125 group-hover:bg-indigo-600 transition-all duration-200"></span>
                                    </div>
                                    <p className="text-slate-700 text-[13.5px] font-medium leading-tight">
                                      {pt}
                                    </p>
                                  </motion.div>
                                ))}
                              </div>
                            </div>

                            {/* Analogy Block */}
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all duration-300">
                              <p className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-wider mb-0.5">
                                Analogy
                              </p>
                              <p className="text-slate-600 text-[13px] italic leading-tight">
                                "Think of the EU as the worker who understands and performs the instructions."
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className={`grid grid-cols-1 ${['m2-s3', 'm3-s2', 'm3-s3', 'm3-s4', 'm4-s1', 'm4-s2', 'm4-s3', 'm8-s1', 'm8-s4', 'm8-s5', 'm9-s1', 'm10-s1', 'm10-s2', 'm10-s3', 'm10-s4', 'm11-s1', 'm12-s1'].includes(slide.id) || slide.moduleId === 'm1' ? 'grid-cols-1' : 'md:grid-cols-2'} gap-1.5 md:gap-2 pr-1`}>
                          {slide.points.map((pt, idx) => {
                            const isRevealed = !incrementalRevealEnabled || idx < revealedPointsCount;
                            if (!isRevealed) return null;
                            return (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: idx * 0.03 }}
                                className="flex gap-2 p-2 md:p-2.5 rounded-lg bg-slate-50/60 border border-slate-100 hover:bg-white hover:border-indigo-200 hover:shadow-2xs transition-all duration-200 group items-start cursor-default"
                              >
                                <div className="flex items-center justify-center w-3.5 h-3.5 shrink-0 mt-0.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:scale-125 group-hover:bg-indigo-600 transition-all duration-200"></span>
                                </div>
                                <p className="text-slate-800 text-[13.5px] md:text-[14px] font-medium leading-snug text-justify flex-1">
                                  {pt}
                                </p>
                              </motion.div>
                            );
                          })}
                        </div>
                      )
                    )}
                  </div>


                </div>
              )
            )}

            {/* Right side: Interactive component or Quiz in Bento card container */}
            {slide.interactiveType && slide.moduleId !== 'm20' && (
              <div 
                id="interactive-bento-card"
                className="min-h-0 flex flex-col transition-all duration-300 text-slate-900 w-full max-w-full relative xl:col-span-12 space-y-3"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={slide.interactiveType}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 min-h-0"
                  >
                    {slide.interactiveType === 'quiz' ? (
                      /* QUIZ UI */
                      <div className="bg-white rounded-3xl shadow-xs border border-slate-200 p-6 space-y-6 overflow-y-auto h-full max-h-[520px]">
                        {!quizFinished ? (
                          <div className="space-y-6 flex flex-col justify-between h-full min-h-[350px]">
                            <div>
                              {/* Question Progress Tracker */}
                              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                                <span className="text-[13px] font-mono text-slate-700 font-semibold">
                                  Question <strong className="text-indigo-700 font-extrabold">{currentQuestionIdx + 1}</strong> of {slide.quizQuestions?.length || 0}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  {slide.quizQuestions?.map((_, idx) => {
                                    const isCurrent = idx === currentQuestionIdx;
                                    const isAnswered = selectedAnswers[idx] !== undefined;
                                    return (
                                      <button
                                        key={idx}
                                        onClick={() => setCurrentQuestionIdx(idx)}
                                        className={`w-6 h-1.5 rounded-full transition-all cursor-pointer ${
                                          isCurrent
                                            ? 'bg-indigo-700'
                                            : isAnswered
                                            ? 'bg-emerald-600 hover:bg-emerald-700'
                                            : 'bg-slate-200 hover:bg-slate-300'
                                        }`}
                                        title={`Go to Question ${idx + 1}`}
                                      />
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Question and Options Area */}
                              {slide.quizQuestions && slide.quizQuestions[currentQuestionIdx] && (
                                <div className="space-y-4">
                                  {slide.quizQuestions[currentQuestionIdx].isGateQuestion && (
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs uppercase font-bold tracking-wider font-mono rounded-lg shadow-2xs">
                                      <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse shrink-0" />
                                      <span>GATE Exam MCQ {slide.quizQuestions[currentQuestionIdx].gateYear ? `(${slide.quizQuestions[currentQuestionIdx].gateYear})` : ''}</span>
                                    </div>
                                  )}

                                  <h3 className="font-extrabold text-slate-950 text-[13px] md:text-base leading-relaxed flex gap-2">
                                    <span className="text-indigo-700 font-mono">Q{currentQuestionIdx + 1}.</span>
                                    {slide.quizQuestions[currentQuestionIdx].question}
                                  </h3>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {slide.quizQuestions[currentQuestionIdx].options.map((opt, oIdx) => (
                                      <button
                                        key={oIdx}
                                        onClick={() => handleSelectAnswer(currentQuestionIdx, oIdx, slide.quizQuestions![currentQuestionIdx].correctAnswer)}
                                        className={`w-full text-left py-3 px-4 text-[13px] md:text-sm border rounded-xl transition-all cursor-pointer ${getQuizButtonColor(currentQuestionIdx, oIdx, slide.quizQuestions![currentQuestionIdx].correctAnswer)}`}
                                      >
                                        {opt}
                                      </button>
                                    ))}
                                  </div>

                                  {selectedAnswers[currentQuestionIdx] !== undefined && (
                                    <motion.div
                                      initial={{ opacity: 0, y: 5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="bg-indigo-50 p-3.5 rounded-xl border border-indigo-200 text-[13px] md:text-sm text-slate-800 leading-relaxed flex items-start gap-2.5 mt-4"
                                    >
                                      <HelpCircle className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
                                      <div>
                                        <strong className="font-bold text-slate-950">Explanation: </strong>
                                        {slide.quizQuestions[currentQuestionIdx].explanation}
                                      </div>
                                    </motion.div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Navigation & Submit footer */}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-200 mt-6">
                              <button
                                onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestionIdx === 0}
                                className="px-4 py-2 text-[13px] border border-slate-200 rounded-xl text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 transition-all font-bold flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              >
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                              </button>

                              {currentQuestionIdx < (slide.quizQuestions?.length || 0) - 1 ? (
                                <button
                                  onClick={() => setCurrentQuestionIdx(prev => Math.min((slide.quizQuestions?.length || 1) - 1, prev + 1))}
                                  className="px-4 py-2 text-[13px] border border-slate-200 rounded-xl text-slate-800 bg-white hover:bg-slate-50 transition-all font-bold flex items-center gap-1.5 cursor-pointer"
                                >
                                  Next Question
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={handleFinishQuiz}
                                  disabled={Object.keys(selectedAnswers).length < (slide.quizQuestions?.length || 0)}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[13px] px-5 py-2.5 rounded-xl shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                                >
                                  {Object.keys(selectedAnswers).length < (slide.quizQuestions?.length || 0) ? (
                                    <span>Answer all questions ({Object.keys(selectedAnswers).length}/{slide.quizQuestions?.length})</span>
                                  ) : (
                                    <>
                                      <span>Complete Quiz</span>
                                      <CheckCircle className="w-4 h-4" />
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          /* QUIZ COMPLETE / RESULTS SCREEN */
                          <div className="text-center py-8 space-y-4 max-w-md mx-auto">
                            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-full inline-block border border-emerald-200">
                              <CheckCircle className="w-10 h-10" />
                            </div>
                            <div>
                              <h3 className="font-display font-bold text-xl text-slate-950">Module Quiz Completed!</h3>
                              <p className="text-[13px] text-slate-700 mt-1">Excellent effort! Let&apos;s keep studying and master the 8086 micro-course.</p>
                            </div>

                            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-200 font-mono">
                              <span className="text-slate-600 text-[13px] block uppercase tracking-wider font-semibold">Your Score</span>
                              <strong className="text-2xl text-indigo-700">{quizScore} / {slide.quizQuestions?.length} Correct</strong>
                            </div>

                            <div className="flex justify-center gap-2">
                              <button
                                onClick={handleRestartQuiz}
                                className="px-4 py-2 text-[13px] border border-slate-200 rounded-xl text-slate-800 bg-white hover:bg-slate-50 transition-all font-bold flex items-center gap-1.5 cursor-pointer"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Retake Quiz
                              </button>
                              <button
                                onClick={onNext}
                                disabled={isLast}
                                className="px-4 py-2 text-[13px] bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-all font-bold flex items-center gap-1.5 disabled:opacity-45 cursor-pointer"
                              >
                                Next Module
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div 
                        id="interactive-bento-card"
                        ref={bentoCardRef}
                        className="relative select-none overflow-hidden rounded-3xl"
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUpOrLeave}
                        onPointerCancel={handlePointerUpOrLeave}
                        onPointerLeave={handlePointerUpOrLeave}
                        style={{ cursor: magnifier.active ? 'crosshair' : 'auto', touchAction: magnifier.active ? 'none' : 'pan-y' }}
                      >
                        {/* Original Interactive Component */}
                        {renderInteractive(slide.interactiveType)}

                        {/* Circular Lens Overlay */}
                        {magnifier.active && bentoCardRef.current && (
                          <div 
                            className="absolute border-4 border-indigo-600 rounded-full pointer-events-none z-[100] bg-slate-50"
                            style={{
                              width: lensSize,
                              height: lensSize,
                              left: magnifier.x - lensSize / 2,
                              top: magnifier.y - lensSize / 2,
                              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.1)',
                            }}
                          >
                            <div 
                              className="origin-top-left absolute" 
                              style={{ 
                                transform: `scale(${zoomFactor})`, 
                                left: -magnifier.x * zoomFactor + lensSize / 2, 
                                top: -magnifier.y * zoomFactor + lensSize / 2,
                                width: bentoCardRef.current.clientWidth,
                                height: bentoCardRef.current.clientHeight,
                              }}
                            >
                              {renderInteractive(slide.interactiveType)}
                            </div>
                            {/* Inner target crosshair overlay */}
                            <div className="absolute inset-0 border border-indigo-500/20 rounded-full pointer-events-none flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-600/35 border border-indigo-500/50"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

      {/* Control Buttons (Next / Prev / Magnifier) - Hidden in Full Screen Mode */}
      {!fullScreenMode && (
        <div className="border-t border-slate-200/80 pt-2.5 mt-2 flex flex-wrap items-center justify-between gap-2.5 sm:gap-4 shrink-0 w-full z-20 bg-slate-50/95 backdrop-blur-md">
          {/* Previous Button Container */}
          <div className="flex items-center justify-start shrink-0">
            <button
              onClick={onPrev}
              disabled={isFirst}
              className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 font-bold text-xs py-2 px-3.5 bg-white border border-slate-200 rounded-xl shadow-xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
          </div>

          {/* Center Tools & Banners (Status, Dr. M Lakshmipathy, Theory, Magnifier, FullScreen) */}
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 flex-1 min-w-0 px-1">
            {/* Progress bar inside controls (Desktop only) */}
            <div className="hidden lg:flex items-center gap-2 text-slate-400 font-mono text-xs uppercase tracking-wider font-bold shrink-0">
              <span>Status:</span>
              {completedSlides.includes(slide.id) ? (
                <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-150 text-xs">
                  <CheckCircle className="w-3.5 h-3.5" /> Studied
                </span>
              ) : (
                <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-150 text-xs">
                  In Progress
                </span>
              )}
            </div>

            {/* Academic Preparedness Banner - Dr. M Lakshmipathy */}
            {!projectorMode && (
              <div className="hidden lg:flex flex-col items-center text-center bg-slate-100/60 border border-slate-200/60 rounded-xl px-3 py-1 shrink-0">
                <p className="text-[10px] font-bold text-slate-800 tracking-wide">
                  Prepared by: <span className="text-indigo-600 font-extrabold">Dr M Lakshmipathy</span>
                </p>
                <p className="text-[8px] text-slate-500 font-medium tracking-wide font-mono">
                  KEC Kuppam
                </p>
              </div>
            )}

            {/* Full Screen Mode Toggle Button (Icon only) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFullScreen?.(true);
              }}
              className="p-2 rounded-xl text-xs font-bold transition-all border shadow-xs cursor-pointer shrink-0 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-600 flex items-center justify-center"
              title="Full Screen Presentation Mode"
            >
              <Maximize2 className="w-4 h-4 text-indigo-600" />
            </button>

            {slide.interactiveType && slide.interactiveType !== 'quiz' && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const nextEnabled = !magnifierModeEnabled;
                    setMagnifierModeEnabled(nextEnabled);
                    if (!nextEnabled) {
                      setMagnifier({ x: 0, y: 0, active: false });
                    } else {
                      const card = bentoCardRef.current;
                      if (card) {
                        setMagnifier({
                          x: card.clientWidth / 2,
                          y: card.clientHeight / 2,
                          active: true
                        });
                      }
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border shadow-xs cursor-pointer shrink-0 ${
                    magnifierModeEnabled 
                      ? 'bg-indigo-600 border-indigo-700 text-white shadow-indigo-200' 
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                  title="Toggle Magnifying Glass Lens over the simulator"
                >
                  <ZoomIn className={`w-3.5 h-3.5 ${magnifierModeEnabled ? 'animate-pulse' : ''}`} />
                  <span>{magnifierModeEnabled ? 'Magnifier: ON' : 'Magnifier'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Next Button Container */}
          <div className="flex items-center justify-end shrink-0">
            <button
              onClick={onNext}
              disabled={isLast}
              className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-150 hover:bg-indigo-100/50 hover:text-indigo-700 transition-colors font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs shrink-0"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Projector-friendly Lesson Explanation Modal */}
      <AnimatePresence>
        {isExplanationOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 md:p-6"
            onClick={() => setIsExplanationOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl flex flex-col justify-between max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6">
                <div className="flex justify-between items-start gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-indigo-600 block leading-none mb-2">
                      {slide.moduleTitle}
                    </span>
                    <h2 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                      {slide.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsExplanationOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer border border-transparent hover:border-slate-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Standard points with high visibility for projector */}
                {slide.points && (
                  slide.id === 'm2-s1' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pt-2 text-left">
                      {/* Left Column: BIU */}
                      <div className="flex flex-col justify-between space-y-4">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                            <h3 className="font-display text-lg font-bold text-slate-900 tracking-tight uppercase">
                              Bus Interface Unit (BIU)
                            </h3>
                          </div>
                          
                          <div className="space-y-3 pl-4">
                            {[
                              'Fetches instructions from memory',
                              'Generates physical addresses',
                              'Reads and writes memory',
                              'Stores fetched instruction bytes in the 6-byte prefetch queue',
                              'Handles bus operations'
                            ].map((pt, idx) => (
                              <div
                                key={idx}
                                className="flex gap-3 items-start group hover:translate-x-1 transition-transform duration-200 cursor-default"
                              >
                                <div className="flex items-center justify-center w-5 h-5 shrink-0 mt-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:scale-125 group-hover:bg-indigo-600 transition-all duration-200"></span>
                                </div>
                                <p className="text-slate-750 text-[14.5px] font-medium leading-relaxed">
                                  {pt}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Analogy Block */}
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                          <p className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider mb-1">
                            Analogy
                          </p>
                          <p className="text-slate-600 text-sm italic leading-relaxed">
                            "Think of the BIU as a delivery person who brings instructions and data from memory."
                          </p>
                        </div>
                      </div>

                      {/* Right Column: EU */}
                      <div className="flex flex-col justify-between space-y-4">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                            <h3 className="font-display text-lg font-bold text-slate-900 tracking-tight uppercase">
                              Execution Unit (EU)
                            </h3>
                          </div>

                          <div className="space-y-3 pl-4">
                            {[
                              'Takes instruction bytes from the prefetch queue',
                              'Decodes instructions',
                              'Executes instructions',
                              'Performs arithmetic and logic operations',
                              'Updates registers and flags'
                            ].map((pt, idx) => (
                              <div
                                key={idx}
                                className="flex gap-3 items-start group hover:translate-x-1 transition-transform duration-200 cursor-default"
                              >
                                <div className="flex items-center justify-center w-5 h-5 shrink-0 mt-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:scale-125 group-hover:bg-indigo-600 transition-all duration-200"></span>
                                </div>
                                <p className="text-slate-750 text-[14.5px] font-medium leading-relaxed">
                                  {pt}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Analogy Block */}
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                          <p className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider mb-1">
                            Analogy
                          </p>
                          <p className="text-slate-600 text-sm italic leading-relaxed">
                            "Think of the EU as the worker who understands and performs the instructions."
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {slide.points.map((pt, idx) => (
                        <div 
                          key={idx} 
                          className="flex gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:bg-slate-50 transition-all duration-200 items-start shadow-3xs"
                        >
                          <div className="flex items-center justify-center w-5 h-5 shrink-0 mt-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                          </div>
                          <p className="text-slate-800 text-sm md:text-base font-semibold leading-relaxed text-justify flex-1 pt-0.5">
                            {pt}
                          </p>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setIsExplanationOpen(false)}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm md:text-base rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  Got it, Resume Lab!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Embed Custom Video Modal */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setIsVideoModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 text-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-rose-50 border border-rose-200/80 rounded-xl text-rose-600">
                    <Video className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-display font-extrabold text-base text-slate-900">
                      Embed Video for Slide ({slide.id})
                    </h3>
                    <p className="text-[12px] text-slate-500">
                      Supports YouTube links, Vimeo, direct MP4 video URLs, or web embeds.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsVideoModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Video Title / Heading
                  </label>
                  <input
                    type="text"
                    value={inputVideoTitle}
                    onChange={(e) => setInputVideoTitle(e.target.value)}
                    placeholder="e.g. 8086 Memory Segmentation Video Lecture"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Video URL / Link
                  </label>
                  <input
                    type="url"
                    value={inputVideoUrl}
                    onChange={(e) => setInputVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or https://.../video.mp4"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono text-slate-800"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Paste any YouTube, Vimeo, or standard video link.
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {activeVideoUrl ? (
                  <button
                    onClick={handleRemoveVideo}
                    className="px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                  >
                    Remove Video
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsVideoModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveVideo}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/15 cursor-pointer"
                  >
                    Save &amp; Embed Video
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
