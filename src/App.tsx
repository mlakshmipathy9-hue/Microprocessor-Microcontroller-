import React, { useState, useEffect, useRef } from 'react';
import { courseData } from './data/courseData';
import { labExperiments } from './data/labExperimentsData';
import Sidebar from './components/Sidebar';
import SlidePresenter from './components/SlidePresenter';
import { 
  Menu, BookOpen, Layers, Award, Sparkles, Tv, Cast, 
  Maximize2, Minimize2, Smartphone, Play, Pause, RotateCcw, 
  Info, Eye, Sun, Moon, Sparkle, RefreshCw, Sliders, ChevronRight
} from 'lucide-react';

export default function App() {
  // Navigation states
  const [currentModuleIdx, setCurrentModuleIdx] = useState(0);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);

  // Sidebar toggle - responsive: default closed on mobile, open on larger screens
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  // Projector / Cast / Fullscreen Presentation States
  const [projectorMode, setProjectorMode] = useState(false);
  const [fullScreenMode, setFullScreenMode] = useState(false);
  const [projectorScale, setProjectorScale] = useState(1.0); // scale multiplier for projectors

  const handleToggleFullScreen = (enable?: boolean) => {
    const nextState = enable !== undefined ? enable : !fullScreenMode;
    setFullScreenMode(nextState);

    if (nextState) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setFullScreenMode(false);
      }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);
  const [contrastMode, setContrastMode] = useState<'normal' | 'high-contrast-light' | 'high-contrast-dark'>('normal');
  const [laserPointerActive, setLaserPointerActive] = useState(false);
  const [hudMinimized, setHudMinimized] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Floating HUD auto-hide states for Projector Mode
  const [hudVisible, setHudVisible] = useState(true);
  const [hudHovered, setHudHovered] = useState(false);
  const hudHoveredRef = useRef(false);
  const hudTimeoutRef = useRef<any>(null);

  useEffect(() => {
    hudHoveredRef.current = hudHovered;
  }, [hudHovered]);

  useEffect(() => {
    if (!projectorMode) {
      setHudVisible(true);
      setHudMinimized(false);
      return;
    }

    const showHUDAndResetTimer = () => {
      setHudVisible(true);
      if (hudTimeoutRef.current) {
        clearTimeout(hudTimeoutRef.current);
      }
      if (hudHoveredRef.current) {
        return;
      }
      hudTimeoutRef.current = setTimeout(() => {
        if (!hudHoveredRef.current) {
          setHudVisible(false);
        }
      }, 3000);
    };

    // Initially show HUD and start timer
    showHUDAndResetTimer();

    window.addEventListener('mousemove', showHUDAndResetTimer);
    window.addEventListener('keydown', showHUDAndResetTimer);
    window.addEventListener('click', showHUDAndResetTimer);

    return () => {
      window.removeEventListener('mousemove', showHUDAndResetTimer);
      window.removeEventListener('keydown', showHUDAndResetTimer);
      window.removeEventListener('click', showHUDAndResetTimer);
      if (hudTimeoutRef.current) {
        clearTimeout(hudTimeoutRef.current);
      }
    };
  }, [projectorMode]);

  // Mobile Remote Presenter States
  const [remoteModeActive, setRemoteModeActive] = useState(false);
  const [remoteTimer, setRemoteTimer] = useState(0);
  const [remoteTimerRunning, setRemoteTimerRunning] = useState(false);
  const [vibrateOnNext, setVibrateOnNext] = useState(true);
  const [incrementalReveal, setIncrementalReveal] = useState(false);
  const [revealedPointsCount, setRevealedPointsCount] = useState(1);

  // Progress state with localStorage persistence
  const [completedSlides, setCompletedSlides] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('8086_completed_slides');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Presentation State to split theoretical bullets and interactive lab on same slide
  const [showInteractiveOnSlide, setShowInteractiveOnSlide] = useState(false);

  // Active lab experiment under directives/sandbox (e.g., 'exp1', 'exp2'...)
  const [activeLabId, setActiveLabId] = useState<string>('exp1');

  // Reset interactive view when moving between slides
  useEffect(() => {
    setShowInteractiveOnSlide(false);
  }, [currentModuleIdx, currentSlideIdx]);

  // Persist completed slides to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('8086_completed_slides', JSON.stringify(completedSlides));
    } catch (e) {
      console.error('Failed to save progress to localStorage', e);
    }
  }, [completedSlides]);

  const currentModule = courseData[currentModuleIdx];
  const currentSlide = currentModule.slides[currentSlideIdx];

  // Flat list helper of all slides to handle simple next/prev across modules
  const allSlidesWithModuleInfo = courseData.flatMap((m, mIdx) => 
    m.slides.map((s, sIdx) => ({
      ...s,
      mIdx,
      sIdx
    }))
  );

  const flatCurrentIdx = allSlidesWithModuleInfo.findIndex(
    s => s.moduleId === currentModule.id && s.id === currentSlide.id
  );

  const handleNext = () => {
    // 1. If we are on text view and have more points to reveal, reveal them first
    if (incrementalReveal && !showInteractiveOnSlide && currentSlide.points && revealedPointsCount < currentSlide.points.length) {
      setRevealedPointsCount(prev => prev + 1);
      if (vibrateOnNext && typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(40);
      }
      return;
    }

    // 2. If the current slide has an interactive component (and is not a quiz) and we are not showing it yet, transition to it
    if (currentSlide.interactiveType && currentSlide.interactiveType !== 'quiz' && !showInteractiveOnSlide) {
      setShowInteractiveOnSlide(true);
      if (vibrateOnNext && typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(40);
      }
      return;
    }

    // 3. Otherwise, move to the next slide
    if (flatCurrentIdx < allSlidesWithModuleInfo.length - 1) {
      const nextSlide = allSlidesWithModuleInfo[flatCurrentIdx + 1];
      setCurrentModuleIdx(nextSlide.mIdx);
      setCurrentSlideIdx(nextSlide.sIdx);
      setRevealedPointsCount(1); // Start next slide with first point revealed
      setShowInteractiveOnSlide(false);
      
      // Automatic haptic feedback on mobile devices supporting standard navigator.vibrate
      if (vibrateOnNext && typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(40);
      }
    }
  };

  const handlePrev = () => {
    // 1. If we are showing the interactive component, go back to the text view (with all points revealed)
    if (currentSlide.interactiveType && currentSlide.interactiveType !== 'quiz' && showInteractiveOnSlide) {
      setShowInteractiveOnSlide(false);
      if (currentSlide.points) {
        setRevealedPointsCount(currentSlide.points.length);
      }
      if (vibrateOnNext && typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(30);
      }
      return;
    }

    // 2. If we are in text view and can un-reveal a point, do so
    if (incrementalReveal && !showInteractiveOnSlide && currentSlide.points && revealedPointsCount > 1) {
      setRevealedPointsCount(prev => prev - 1);
      if (vibrateOnNext && typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(30);
      }
      return;
    }

    // 3. Otherwise, move to the previous slide
    if (flatCurrentIdx > 0) {
      const prevSlide = allSlidesWithModuleInfo[flatCurrentIdx - 1];
      setCurrentModuleIdx(prevSlide.mIdx);
      setCurrentSlideIdx(prevSlide.sIdx);
      
      // If the previous slide has an interactive simulator, enter directly into its simulator view
      if (prevSlide.interactiveType && prevSlide.interactiveType !== 'quiz') {
        setShowInteractiveOnSlide(true);
        setRevealedPointsCount(prevSlide.points ? prevSlide.points.length : 1);
      } else {
        setShowInteractiveOnSlide(false);
        if (incrementalReveal && prevSlide.points) {
          setRevealedPointsCount(prevSlide.points.length);
        } else {
          setRevealedPointsCount(1);
        }
      }
      
      if (vibrateOnNext && typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(30);
      }
    }
  };

  const handleSelectSlide = (moduleId: string, slideId: string, labId?: string) => {
    const mIdx = courseData.findIndex(m => m.id === moduleId);
    if (mIdx !== -1) {
      const sIdx = courseData[mIdx].slides.findIndex(s => s.id === slideId);
      if (sIdx !== -1) {
        setCurrentModuleIdx(mIdx);
        setCurrentSlideIdx(sIdx);
        setRevealedPointsCount(1); // Reset to first point
        
        const selectedSlide = courseData[mIdx].slides[sIdx];
        const isLab = selectedSlide.interactiveType && selectedSlide.interactiveType !== 'quiz';
        setShowInteractiveOnSlide(isLab ? true : false);

        if (labId) {
          setActiveLabId(labId);
        }

        // Automatically close sidebar on mobile when selecting a slide
        if (window.innerWidth < 1024) {
          setSidebarOpen(false);
        }
      }
    }
  };

  const handleMarkComplete = (slideId: string) => {
    if (!completedSlides.includes(slideId)) {
      setCompletedSlides(prev => [...prev, slideId]);
    }
  };

  // Keyboard navigation & wireless clicker listener (Space / ArrowRight / ArrowLeft / P / L)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting keyboard events when typing in input boxes
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          if (e.key === ' ') e.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
          handlePrev();
          break;
        case 'p':
        case 'P':
          setProjectorMode(prev => !prev);
          break;
        case 'l':
        case 'L':
          setLaserPointerActive(prev => !prev);
          break;
        case 'r':
        case 'R':
          setRemoteModeActive(prev => !prev);
          break;
        case '+':
        case '=':
          setProjectorScale(prev => Math.min(1.35, prev + 0.05));
          break;
        case '-':
        case '_':
          setProjectorScale(prev => Math.max(0.85, prev - 0.05));
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flatCurrentIdx, vibrateOnNext, revealedPointsCount, incrementalReveal, currentSlide]);

  // Track cursor movement for virtual laser pointer
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!laserPointerActive) return;
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  // Mobile Remote Timer Logic
  useEffect(() => {
    let interval: any;
    if (remoteTimerRunning) {
      interval = setInterval(() => {
        setRemoteTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [remoteTimerRunning]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const totalCourseSlides = allSlidesWithModuleInfo.length;
  const isFirstSlide = flatCurrentIdx === 0;
  const isLastSlide = flatCurrentIdx === totalCourseSlides - 1;

  // Compute contrast visual modifiers
  const contrastClasses = 
    contrastMode === 'high-contrast-light' 
      ? 'contrast-125 saturate-125 brightness-100 filter [&_*]:!text-black [&_button]:!border-slate-800'
      : contrastMode === 'high-contrast-dark'
      ? 'bg-neutral-950 text-neutral-100 filter brightness-95 contrast-125 [&_*]:!text-neutral-100 [&_div]:!bg-neutral-900 [&_button]:!bg-neutral-800 [&_button]:!border-neutral-700'
      : '';

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`flex h-screen w-screen overflow-hidden text-slate-800 font-sans transition-all duration-350 relative ${
        contrastMode === 'high-contrast-dark' ? 'bg-neutral-950' : 'bg-sky-100'
      } ${contrastClasses}`}
    >
      {/* 🔴 Virtual Laser Pointer Overlay */}
      {laserPointerActive && (
        <div 
          className="pointer-events-none absolute w-8 h-8 rounded-full bg-red-600/30 border border-red-500/70 shadow-[0_0_20px_10px_rgba(239,68,68,0.7)] transition-all duration-75 ease-out z-50 flex items-center justify-center animate-pulse"
          style={{ 
            left: `${mousePos.x}px`, 
            top: `${mousePos.y}px`,
            transform: 'translate(-50%, -50%)' 
          }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_4px_rgba(255,255,255,1)]"></div>
        </div>
      )}

      {/* 📱 MOBILE PRESENTER REMOTE VIEW (Clicker Dashboard Overlay) */}
      {remoteModeActive && (
        <div className="absolute inset-0 bg-slate-900 text-white z-50 flex flex-col p-4 md:p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Remote Top Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-indigo-400 animate-bounce" />
              <div>
                <h2 className="text-sm font-bold tracking-tight">8086 Presenter Remote</h2>
                <span className="text-[10px] text-slate-400 font-mono">Mobile Cast Interface</span>
              </div>
            </div>
            <button 
              onClick={() => {
                setRemoteModeActive(false);
                setRemoteTimerRunning(false);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-700 text-red-400"
            >
              Exit Remote
            </button>
          </div>

          {/* Remote Content Row */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 my-4 overflow-y-auto">
            {/* Stopwatch & Stats */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 block mb-1">
                  Presentation Time
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-mono font-extrabold text-indigo-400 tracking-tight">
                    {formatTimer(remoteTimer)}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setRemoteTimerRunning(!remoteTimerRunning)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-slate-200"
                      title={remoteTimerRunning ? "Pause Timer" : "Start Timer"}
                    >
                      {remoteTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress Detail */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-mono">Slide Index:</span>
                  <span className="font-bold font-mono text-indigo-300">{(flatCurrentIdx + 1).toString().padStart(2, '0')} / {totalCourseSlides.toString().padStart(2, '0')}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${((flatCurrentIdx + 1) / totalCourseSlides) * 100}%` }}
                  ></div>
                </div>
                <div className="text-[11px] text-slate-400 font-medium leading-tight">
                  Current: <strong className="text-white">{currentSlide.title}</strong>
                </div>
              </div>

              {/* Vibration and Haptic Config */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Tactile Vibrate Feedback:</span>
                  <button
                    onClick={() => setVibrateOnNext(!vibrateOnNext)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[10px] tracking-wider uppercase transition-all ${
                      vibrateOnNext 
                        ? 'bg-indigo-600 text-white border border-indigo-500 shadow-xs' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {vibrateOnNext ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                

              </div>
            </div>

            {/* Presenter Talking Points/Notes */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex justify-between items-center mb-2 border-b border-slate-800 pb-2">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">
                  Presenter Talking Notes
                </span>
                {currentSlide.interactiveType && currentSlide.interactiveType !== 'quiz' ? (
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                    showInteractiveOnSlide 
                      ? 'text-emerald-400 bg-emerald-950/80 border-emerald-900/60' 
                      : 'text-amber-400 bg-amber-950/80 border-amber-900/60'
                  }`}>
                    {showInteractiveOnSlide ? 'Stage: Demoing Simulator' : 'Stage: Talking Theory'}
                  </span>
                ) : currentSlide.points && incrementalReveal && (
                  <span className="text-[9px] font-mono font-bold text-indigo-400 bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-900/60">
                    Step {revealedPointsCount}/{currentSlide.points.length}
                  </span>
                )}
              </div>
              <div className="flex-1 overflow-y-auto space-y-3.5 max-h-[220px] pr-1 font-sans text-xs flex flex-col justify-start">
                {currentSlide.interactiveType && currentSlide.interactiveType !== 'quiz' && showInteractiveOnSlide ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-xl space-y-2 text-center my-auto">
                    <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] font-mono">Simulator Demo Active</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      The interactive lab simulator is currently casted to the main screen. Demonstrate and explain its visual elements to the class!
                    </p>
                    <button
                      onClick={() => setShowInteractiveOnSlide(false)}
                      className="px-3 py-1.5 mt-1 text-[10px] font-bold bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-indigo-300 hover:text-indigo-200 transition-colors cursor-pointer"
                    >
                      &larr; Switch Back to Slide Notes
                    </button>
                  </div>
                ) : currentSlide.points && currentSlide.points.length > 0 ? (
                  currentSlide.points.map((pt, i) => {
                    const isRevealed = !incrementalReveal || i < revealedPointsCount;
                    const isCurrentActive = incrementalReveal && i === revealedPointsCount - 1;
                    return (
                      <div 
                        key={i} 
                        className={`flex items-start gap-2.5 p-2 rounded-xl transition-all duration-300 ${
                          isCurrentActive 
                            ? 'bg-indigo-950/50 border border-indigo-750/70 shadow-md shadow-indigo-950/40' 
                            : 'border border-transparent'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 transition-all ${
                          isCurrentActive 
                            ? 'bg-indigo-400 scale-125 ring-2 ring-indigo-500/50' 
                            : isRevealed 
                            ? 'bg-indigo-600' 
                            : 'bg-slate-800 opacity-45'
                        }`}></span>
                        <p className={`font-medium leading-relaxed text-[13px] transition-all duration-300 ${
                          isCurrentActive 
                            ? 'text-white' 
                            : isRevealed 
                            ? 'text-slate-300' 
                            : 'text-slate-500 opacity-30'
                        }`}>
                          {pt}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-500 italic">No notes written for this interactive lab. Focus on displaying the simulator modules to the projected screen!</p>
                )}
              </div>
            </div>
          </div>

          {/* Large Tactile Clicker Buttons */}
          <div className="grid grid-cols-2 gap-4 h-[40vh] shrink-0 mt-auto">
            <button
              onClick={handlePrev}
              disabled={isFirstSlide}
              className="h-full rounded-2xl bg-slate-850 hover:bg-slate-800 border-2 border-slate-700 active:bg-slate-750 active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-2 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="text-slate-400 uppercase text-[10px] font-mono tracking-widest font-bold">Previous Slide</span>
              <span className="text-xl font-black text-white">&larr; Back</span>
            </button>
            <button
              onClick={handleNext}
              disabled={isLastSlide}
              className="h-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 border-2 border-indigo-500 active:bg-indigo-700 active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-2 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
            >
              <span className="text-indigo-200 uppercase text-[10px] font-mono tracking-widest font-bold">Advance Slide</span>
              <span className="text-xl font-black text-white">Next &rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* Backdrop overlay for mobile/tablet when sidebar is open */}
      {!projectorMode && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden animate-in fade-in duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Navigation Sidebar (Collapsible) - Hidden when Projector or FullScreen Mode is Active */}
      {!projectorMode && !fullScreenMode && (
        <Sidebar
          modules={courseData}
          currentModuleId={currentModule.id}
          currentSlideId={currentSlide.id}
          completedSlides={completedSlides}
          onSelectSlide={handleSelectSlide}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          currentLabId={activeLabId}
        />
      )}

      {/* Main Classroom Screen */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* 🛠️ Floating Projector HUD Panel (Only visible in Projector Mode) */}
        {projectorMode && (
          hudMinimized ? (
            <div 
              onMouseEnter={() => setHudHovered(true)}
              onMouseLeave={() => setHudHovered(false)}
              className={`absolute top-4 right-4 bg-slate-900/95 hover:bg-slate-950 backdrop-blur-md border border-slate-800 rounded-full p-1 px-1.5 shadow-2xl z-45 flex items-center gap-2 text-white transition-all duration-350 ease-in-out ${
                hudVisible || hudHovered 
                  ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
                  : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
              }`}
            >
              <div className="flex items-center justify-center pl-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <button
                onClick={() => setHudMinimized(false)}
                className="p-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-full transition-all border border-indigo-500 text-white shrink-0 flex items-center justify-center cursor-pointer shadow-sm"
                title="Maximize Control Panel"
              >
                <Sliders className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div 
              onMouseEnter={() => setHudHovered(true)}
              onMouseLeave={() => setHudHovered(false)}
              className={`absolute top-4 right-4 bg-slate-900/90 hover:bg-slate-900 backdrop-blur-md border border-slate-750/80 rounded-xl p-1.5 px-2.5 shadow-2xl z-45 flex items-center gap-2 text-white transition-all duration-350 ease-in-out ${
                hudVisible || hudHovered 
                  ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
                  : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
              }`}
            >
              <div className="flex items-center gap-1.5 border-r border-slate-800 pr-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-emerald-400">Live</span>
              </div>

              {/* Scale control */}
              <div className="flex items-center gap-1 bg-slate-950/40 px-1.5 py-0.5 rounded-lg border border-slate-800">
                <button 
                  onClick={() => setProjectorScale(prev => Math.max(0.85, prev - 0.05))}
                  className="w-5 h-5 flex items-center justify-center hover:bg-slate-800 rounded-md text-slate-300 text-xs font-bold"
                  title="Decrease Projection Scale (-)"
                >
                  -
                </button>
                <span className="text-[10px] font-mono font-bold w-10 text-center text-indigo-300">
                  {Math.round(projectorScale * 100)}%
                </span>
                <button 
                  onClick={() => setProjectorScale(prev => Math.min(1.35, prev + 0.05))}
                  className="w-5 h-5 flex items-center justify-center hover:bg-slate-800 rounded-md text-slate-300 text-xs font-bold"
                  title="Increase Projection Scale (+)"
                >
                  +
                </button>
              </div>

              {/* Contrast toggles */}
              <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
                <button
                  onClick={() => setContrastMode('normal')}
                  className={`p-1 rounded-md border transition-colors ${
                    contrastMode === 'normal' 
                      ? 'bg-indigo-600 border-indigo-500 text-white' 
                      : 'bg-slate-850 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Normal Theme colors"
                >
                  <Sun className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setContrastMode('high-contrast-light')}
                  className={`p-1 rounded-md border transition-colors ${
                    contrastMode === 'high-contrast-light' 
                      ? 'bg-indigo-600 border-indigo-500 text-white' 
                      : 'bg-slate-850 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="High Contrast Light"
                >
                  <Eye className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setContrastMode('high-contrast-dark')}
                  className={`p-1 rounded-md border transition-colors ${
                    contrastMode === 'high-contrast-dark' 
                      ? 'bg-indigo-600 border-indigo-500 text-white' 
                      : 'bg-slate-850 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="High Contrast Dark"
                >
                  <Moon className="w-3 h-3" />
                </button>
              </div>

              {/* Laser pointer toggle */}
              <button
                onClick={() => setLaserPointerActive(!laserPointerActive)}
                className={`p-1 px-1.5 rounded-md border transition-all ${
                  laserPointerActive 
                    ? 'bg-red-600 border-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)] animate-pulse' 
                    : 'bg-slate-850 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Toggle Laser Pointer (Key: L)"
              >
                <span className="flex items-center gap-1 text-[10px] font-bold">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span> Pointer
                </span>
              </button>



              {/* Minimize Panel Button */}
              <button
                onClick={() => setHudMinimized(true)}
                className="p-1 bg-slate-850 hover:bg-slate-800 text-xs font-bold rounded-md transition-all border border-slate-800 text-indigo-400 hover:text-indigo-300 ml-1 shrink-0"
                title="Minimize Control Panel"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Exit Projector View */}
              <button
                onClick={() => {
                  setProjectorMode(false);
                  setProjectorScale(1.0);
                  setContrastMode('normal');
                  setLaserPointerActive(false);
                }}
                className="p-1 bg-slate-850 hover:bg-slate-800 text-xs font-bold rounded-md transition-all border border-slate-800 text-red-400 hover:text-red-300 shrink-0"
                title="Exit Projector Mode (Key: P)"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        )}

        {/* Top Navbar / Header banner - Hidden when Projector or FullScreen Mode is Active */}
        {!projectorMode && !fullScreenMode && (
          <header className="h-16 bg-white/75 backdrop-blur-md border-b border-sky-200/50 flex items-center justify-between px-4 md:px-6 shrink-0 shadow-xs relative z-10">
            <div className="flex items-center gap-2.5 md:gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-slate-500 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-all shrink-0"
                title="Toggle Syllabus Directory"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <div className="bg-indigo-600 p-1.5 rounded-lg text-white hidden sm:block shrink-0">
                  <BookOpen className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div className="truncate">
                  <h1 id="header-slide-title" className="text-xs md:text-sm lg:text-base font-bold tracking-tight text-slate-900 uppercase leading-tight truncate">
                    {currentSlide.title}
                  </h1>
                </div>
              </div>
            </div>

            {/* Cast & Present Mode Trigger Buttons */}
            <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
              {/* Progress counter */}
              <div className="text-xs font-mono text-indigo-600 font-bold bg-indigo-50 px-2 md:px-2.5 py-1 rounded-md border border-indigo-150 shrink-0">
                {completedSlides.length.toString().padStart(2, '0')}/{totalCourseSlides.toString().padStart(2, '0')}
              </div>
            </div>
          </header>
        )}

        {/* Central PowerPoint Presentation viewport with scalable projection layer */}
        <main 
          className="flex-1 min-h-0 flex flex-col overflow-hidden transition-transform duration-300"
          style={{ 
            transform: `scale(${projectorScale})`,
            transformOrigin: 'top center',
            maxHeight: projectorMode ? `${100 / projectorScale}%` : '100%',
            width: projectorMode ? `${100 / projectorScale}%` : '100%',
          }}
        >
          <SlidePresenter
            slide={currentSlide}
            onNext={handleNext}
            onPrev={handlePrev}
            isFirst={isFirstSlide}
            isLast={isLastSlide}
            onMarkComplete={handleMarkComplete}
            completedSlides={completedSlides}
            revealedPointsCount={revealedPointsCount}
            incrementalRevealEnabled={incrementalReveal}
            projectorMode={projectorMode}
            showInteractive={showInteractiveOnSlide}
            activeLabId={activeLabId}
            fullScreenMode={fullScreenMode}
            onToggleFullScreen={handleToggleFullScreen}
          />
        </main>
      </div>
    </div>
  );
}

