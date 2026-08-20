import React, { useState } from 'react';
import { 
  Zap, 
  RotateCw, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  Sliders, 
  Info, 
  HelpCircle, 
  ArrowRight, 
  Gauge, 
  ShieldCheck,
  Cable,
  Component,
  GitFork
} from 'lucide-react';

export default function StepperMotorTypesExplorer() {
  const [selectedType, setSelectedType] = useState<'vr' | 'pm' | 'hybrid' | 'unipolar_bipolar'>('hybrid');
  
  // Interactive Step Angle Calculator State
  const [calcPhases, setCalcPhases] = useState<number>(4); // m
  const [calcRotorTeeth, setCalcRotorTeeth] = useState<number>(50); // Nr
  const [calcStatorPoles, setCalcStatorPoles] = useState<number>(8); // Ns
  const [pulseFreqHz, setPulseFreqHz] = useState<number>(400); // f in Hz

  // Step Angle calculations
  // Formula 1: beta = 360 / (m * Nr)
  const stepAngleDeg = 360 / (calcPhases * calcRotorTeeth);
  const stepsPerRev = Math.round(360 / stepAngleDeg);
  // Speed in RPM: n = (beta * f) / 6 = (f * 60) / stepsPerRev
  const shaftRpm = ((stepAngleDeg * pulseFreqHz) / 6).toFixed(1);

  return (
    <div className="bg-white text-slate-800 p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 text-xs font-sans">
      {/* Top Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200 shadow-2xs">
            <Component className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <span>Classification &amp; Types of Stepper Motors</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                Hardware Architecture
              </span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Variable Reluctance (VR) • Permanent Magnet (PM) • Hybrid (VR+PM) • Unipolar vs. Bipolar Driver Topologies
            </p>
          </div>
        </div>

        {/* Quick Type Selection Pills */}
        <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 shadow-inner">
          {[
            { id: 'hybrid', label: '1. Hybrid (VR + PM)', tag: 'Most Popular' },
            { id: 'vr', label: '2. Variable Reluctance (VR)', tag: 'Toothed Iron' },
            { id: 'pm', label: '3. Permanent Magnet (PM)', tag: 'Magnetic Rotor' },
            { id: 'unipolar_bipolar', label: '4. Unipolar vs. Bipolar', tag: 'ULN2003 vs H-Bridge' }
          ].map((type) => {
            const isSelected = selectedType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id as any)}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 text-[11px] transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN CONTENT AREA: SELECTED MOTOR TYPE DEEP-DIVE */}
      <div className="space-y-4">
        
        {/* ========================================================================= */}
        {/* TYPE 1: HYBRID STEPPER MOTOR (VR + PM)                                    */}
        {/* ========================================================================= */}
        {selectedType === 'hybrid' && (
          <div className="space-y-4">
            <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded border border-indigo-300">
                  Standard Industry Standard (NEMA 17 / NEMA 23)
                </span>
                <h5 className="font-extrabold text-sm text-indigo-950">
                  Hybrid Stepper Motor (Combines Variable Reluctance &amp; Permanent Magnet)
                </h5>
                <p className="text-[11px] text-slate-600 max-w-2xl">
                  The hybrid motor merges the high magnetic flux of a permanent magnet rotor with the fine tooth-pitch reluctance alignment of a variable reluctance motor, achieving the highest precision and holding torque.
                </p>
              </div>
              <div className="text-right font-mono text-[11px] bg-white p-2 rounded-lg border border-indigo-200 shadow-2xs">
                <div className="text-slate-500">Typical Step Angle:</div>
                <div className="text-indigo-700 font-extrabold text-sm">1.8° (200 st/rev) or 0.9° (400 st/rev)</div>
              </div>
            </div>

            {/* Visual Diagram & Construction Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left SVG Diagram: Hybrid Stator-Rotor Structure */}
              <div className="lg:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center space-y-3 shadow-inner">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Hybrid Rotor Cross-Section &amp; Offset Teeth
                </span>

                <svg viewBox="0 0 280 240" className="w-full max-w-[260px] h-auto select-none font-mono">
                  {/* Stator Outer Ring */}
                  <circle cx="140" cy="120" r="105" fill="#f1f5f9" stroke="#64748b" strokeWidth="3" />
                  
                  {/* 8 Stator Wound Poles */}
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((ang, i) => {
                    const rad = (ang * Math.PI) / 180;
                    const x1 = 140 + Math.cos(rad) * 60;
                    const y1 = 120 + Math.sin(rad) * 60;
                    const x2 = 140 + Math.cos(rad) * 98;
                    const y2 = 120 + Math.sin(rad) * 98;
                    const isPhaseA = i === 0 || i === 4;
                    return (
                      <g key={i}>
                        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={isPhaseA ? '#4f46e5' : '#94a3b8'} strokeWidth="16" strokeLinecap="round" />
                        <circle cx={x2} cy={y2} r="6" fill={isPhaseA ? '#4f46e5' : '#cbd5e1'} />
                      </g>
                    );
                  })}

                  {/* Air Gap Circle */}
                  <circle cx="140" cy="120" r="54" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3,3" />

                  {/* Rotor Cup (Cylindrical Toothed Soft Iron + Axial PM) */}
                  <circle cx="140" cy="120" r="50" fill="#e0e7ff" stroke="#4338ca" strokeWidth="2.5" />

                  {/* 50 Rotor Fine Teeth (represented with radiating tick marks) */}
                  {Array.from({ length: 24 }).map((_, i) => {
                    const ang = (i * 360) / 24;
                    const rad = (ang * Math.PI) / 180;
                    const x1 = 140 + Math.cos(rad) * 44;
                    const y1 = 120 + Math.sin(rad) * 44;
                    const x2 = 140 + Math.cos(rad) * 52;
                    const y2 = 120 + Math.sin(rad) * 52;
                    return (
                      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#312e81" strokeWidth="2.5" />
                    );
                  })}

                  {/* Center Permanent Magnet Core */}
                  <circle cx="140" cy="120" r="24" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
                  <text x="140" y="116" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">AXIAL PM</text>
                  <text x="140" y="128" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">N / S POLE</text>

                  {/* Annotations */}
                  <text x="140" y="20" fill="#4338ca" fontSize="9" fontWeight="bold" textAnchor="middle">Phase A Stator Coil</text>
                  <text x="140" y="235" fill="#475569" fontSize="8" textAnchor="middle">50 Rotor Teeth (1.8° Step Angle)</text>
                </svg>

                <div className="text-[10px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200 w-full text-left space-y-1">
                  <div className="font-bold text-indigo-900">Key Construction Features:</div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[10px]">
                    <li>Two soft-iron rotor caps offset by <strong>1/2 tooth pitch (3.6°)</strong>.</li>
                    <li>Axially magnetized cylindrical permanent magnet inside shaft.</li>
                    <li>One cap magnetized purely <strong>NORTH</strong>; other cap purely <strong>SOUTH</strong>.</li>
                  </ul>
                </div>
              </div>

              {/* Right: Technical Specification Cards */}
              <div className="lg:col-span-7 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      Operating Principle
                    </span>
                    <p className="text-[11px] text-slate-700 leading-relaxed">
                      When stator coils are energized, magnetic flux passes axially through the rotor magnet and radially through the toothed air gap. Rotor teeth seek the path of <strong>minimum magnetic reluctance</strong> while attracted by opposite magnetic polarity.
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Key Advantages
                    </span>
                    <ul className="list-disc list-inside text-[10px] text-slate-600 space-y-1">
                      <li><strong>Small Step Angles:</strong> 1.8° (200 steps/rev) and 0.9° (400 steps/rev).</li>
                      <li><strong>High Holding Torque:</strong> Strong magnetic flux from internal PM.</li>
                      <li><strong>High Slew Speeds:</strong> Over 20,000 steps/sec with microstepping.</li>
                    </ul>
                  </div>
                </div>

                {/* Practical Industrial Applications */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider block">
                    Real-World Applications &amp; 8086 Use Cases:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[10px]">
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <strong className="text-indigo-700 block">3D Printers &amp; CNC</strong>
                      <span className="text-slate-500">X/Y/Z Lead-screw axis positioning (NEMA 17).</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <strong className="text-indigo-700 block">Robotic Manipulators</strong>
                      <span className="text-slate-500">Joint angle actuation without feedback encoders.</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <strong className="text-indigo-700 block">Medical Infusion Pumps</strong>
                      <span className="text-slate-500">Microliter fluid dosage delivery.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TYPE 2: VARIABLE RELUCTANCE (VR) MOTOR                                    */}
        {/* ========================================================================= */}
        {selectedType === 'vr' && (
          <div className="space-y-4">
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded border border-blue-300">
                  Minimum Reluctance Principle • No Permanent Magnet
                </span>
                <h5 className="font-extrabold text-sm text-blue-950">
                  Variable Reluctance (VR) Stepper Motor
                </h5>
                <p className="text-[11px] text-slate-600 max-w-2xl">
                  Features a non-magnetic, toothed soft-iron rotor. Operates purely on the principle that magnetic lines of flux seek the path of least magnetic resistance (reluctance).
                </p>
              </div>
              <div className="text-right font-mono text-[11px] bg-white p-2 rounded-lg border border-blue-200 shadow-2xs">
                <div className="text-slate-500">Typical Step Angle:</div>
                <div className="text-blue-700 font-extrabold text-sm">7.5°, 15°, or 30°</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left SVG: VR Motor Operation */}
              <div className="lg:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center space-y-3 shadow-inner">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  VR 3-Phase / 4-Rotor Tooth Alignment
                </span>

                <svg viewBox="0 0 280 220" className="w-full max-w-[260px] h-auto select-none font-mono">
                  {/* Stator Outer Ring */}
                  <circle cx="140" cy="110" r="95" fill="#f8fafc" stroke="#64748b" strokeWidth="2.5" />

                  {/* 6 Stator Poles (3 Phases: A, B, C) */}
                  {[0, 60, 120, 180, 240, 300].map((ang, i) => {
                    const rad = (ang * Math.PI) / 180;
                    const x1 = 140 + Math.cos(rad) * 55;
                    const y1 = 110 + Math.sin(rad) * 55;
                    const x2 = 140 + Math.cos(rad) * 90;
                    const y2 = 110 + Math.sin(rad) * 90;
                    const isEnergized = i === 1 || i === 4; // Phase B energized
                    return (
                      <g key={i}>
                        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={isEnergized ? '#2563eb' : '#94a3b8'} strokeWidth="18" strokeLinecap="round" />
                        <text 
                          x={140 + Math.cos(rad) * 75} 
                          y={114 + Math.sin(rad) * 75} 
                          fill="#ffffff" 
                          fontSize="8" 
                          fontWeight="bold" 
                          textAnchor="middle"
                        >
                          {i % 3 === 0 ? 'A' : i % 3 === 1 ? 'B' : 'C'}
                        </text>
                      </g>
                    );
                  })}

                  {/* 4-Toothed Soft Iron Rotor (No PM) */}
                  <path 
                    d="M 140 70 L 148 95 L 175 95 L 155 110 L 165 140 L 140 125 L 115 140 L 125 110 L 105 95 L 132 95 Z" 
                    fill="#94a3b8" 
                    stroke="#475569" 
                    strokeWidth="2" 
                    transform="rotate(30 140 110)"
                  />
                  <circle cx="140" cy="110" r="14" fill="#64748b" stroke="#334155" strokeWidth="2" />
                  <text x="140" y="113" fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle">IRON</text>

                  <text x="140" y="210" fill="#2563eb" fontSize="9" fontWeight="bold" textAnchor="middle">
                    Phase B Energized → Teeth Pull into Minimum Reluctance
                  </text>
                </svg>

                <div className="text-[10px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200 w-full text-left space-y-1">
                  <div className="font-bold text-blue-900">Distinctive VR Property:</div>
                  <p className="text-[10px] text-slate-600">
                    <strong>Zero Detent Torque:</strong> When unpowered, the rotor spins freely with zero residual magnetic cogging because the rotor contains no permanent magnet.
                  </p>
                </div>
              </div>

              {/* Right: Working Principles & Formula */}
              <div className="lg:col-span-7 space-y-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                    VR Step Angle Formula &amp; Mathematical Calculation:
                  </span>
                  <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-200 font-mono text-[11px] text-blue-950 space-y-1">
                    <div className="font-bold">
                      Step Angle (β) = <span className="underline">|Ns - Nr|</span> × 360° &nbsp;=&nbsp; <span className="underline">360°</span>
                    </div>
                    <div className="text-[10px] text-blue-800 font-normal pl-24">
                      Ns × Nr &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; m × Nr
                    </div>
                    <div className="text-[10px] text-slate-600 pt-1">
                      Where <code className="font-bold">Ns = 6</code> (stator poles), <code className="font-bold">Nr = 4</code> (rotor teeth), <code className="font-bold">m = 3</code> (phases):
                    </div>
                    <div className="font-bold text-indigo-700 bg-white p-1 rounded border border-blue-200 inline-block">
                      β = ( |6 - 4| / (6 × 4) ) × 360° = (2 / 24) × 360° = 30° / step
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase">Advantages</span>
                    <ul className="list-disc list-inside text-[10px] text-slate-600 space-y-0.5">
                      <li>Very low rotor inertia (rapid acceleration).</li>
                      <li>High stepping rates possible.</li>
                      <li>Lower manufacturing cost (no rare-earth magnets).</li>
                    </ul>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                    <span className="text-[10px] font-bold text-rose-700 uppercase">Limitations</span>
                    <ul className="list-disc list-inside text-[10px] text-slate-600 space-y-0.5">
                      <li>Lower holding torque than PM/Hybrid.</li>
                      <li>No holding torque when power is removed.</li>
                      <li>Larger step angles (coarser resolution).</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TYPE 3: PERMANENT MAGNET (PM) MOTOR                                       */}
        {/* ========================================================================= */}
        {selectedType === 'pm' && (
          <div className="space-y-4">
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                  Cylindrical Magnet Rotor • Tin-Can / Can-Stack Construction
                </span>
                <h5 className="font-extrabold text-sm text-emerald-950">
                  Permanent Magnet (PM) Stepper Motor
                </h5>
                <p className="text-[11px] text-slate-600 max-w-2xl">
                  Features a cylindrical permanent magnet rotor with alternating North and South magnetic poles along its outer circumference.
                </p>
              </div>
              <div className="text-right font-mono text-[11px] bg-white p-2 rounded-lg border border-emerald-200 shadow-2xs">
                <div className="text-slate-500">Typical Step Angle:</div>
                <div className="text-emerald-800 font-extrabold text-sm">7.5° (48 st/rev) or 15° (24 st/rev)</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left SVG: PM Motor Operation */}
              <div className="lg:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center space-y-3 shadow-inner">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  PM Rotor with Alternating Magnetic Poles
                </span>

                <svg viewBox="0 0 280 220" className="w-full max-w-[260px] h-auto select-none font-mono">
                  {/* Stator Outer Ring */}
                  <circle cx="140" cy="110" r="95" fill="#f8fafc" stroke="#64748b" strokeWidth="2.5" />

                  {/* 4 Stator Poles (A, B, C, D) */}
                  {[0, 90, 180, 270].map((ang, i) => {
                    const rad = (ang * Math.PI) / 180;
                    const x1 = 140 + Math.cos(rad) * 60;
                    const y1 = 110 + Math.sin(rad) * 60;
                    const x2 = 140 + Math.cos(rad) * 90;
                    const y2 = 110 + Math.sin(rad) * 90;
                    const isNorth = i === 0;
                    return (
                      <g key={i}>
                        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={isNorth ? '#dc2626' : '#2563eb'} strokeWidth="24" strokeLinecap="round" />
                        <text x={140 + Math.cos(rad) * 75} y={114 + Math.sin(rad) * 75} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                          {isNorth ? 'N' : 'S'}
                        </text>
                      </g>
                    );
                  })}

                  {/* Cylindrical PM Rotor with 6 Alternating Poles */}
                  <circle cx="140" cy="110" r="48" fill="#ffffff" stroke="#334155" strokeWidth="2" />
                  {[0, 60, 120, 180, 240, 300].map((ang, i) => {
                    const isNorth = i % 2 === 0;
                    const rad = (ang * Math.PI) / 180;
                    return (
                      <g key={i}>
                        <circle 
                          cx={140 + Math.cos(rad) * 34} 
                          cy={110 + Math.sin(rad) * 34} 
                          r="10" 
                          fill={isNorth ? '#fecaca' : '#bfdbfe'} 
                          stroke={isNorth ? '#ef4444' : '#3b82f6'} 
                          strokeWidth="1.5" 
                        />
                        <text 
                          x={140 + Math.cos(rad) * 34} 
                          y={113 + Math.sin(rad) * 34} 
                          fill={isNorth ? '#991b1b' : '#1e40af'} 
                          fontSize="8" 
                          fontWeight="bold" 
                          textAnchor="middle"
                        >
                          {isNorth ? 'N' : 'S'}
                        </text>
                      </g>
                    );
                  })}

                  <text x="140" y="210" fill="#059669" fontSize="9" fontWeight="bold" textAnchor="middle">
                    Magnetic Attraction &amp; Repulsion Drive Rotor
                  </text>
                </svg>

                <div className="text-[10px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200 w-full text-left space-y-1">
                  <div className="font-bold text-emerald-900">Key PM Feature (Detent Torque):</div>
                  <p className="text-[10px] text-slate-600">
                    Even when all stator coils are completely unpowered (0V), the permanent magnet maintains a <strong>detent holding torque (~5-10% of rated torque)</strong> that prevents the rotor from drifting freely.
                  </p>
                </div>
              </div>

              {/* Right: Technical Features & Uses */}
              <div className="lg:col-span-7 space-y-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Operating Principle &amp; Torque Characteristics:
                  </span>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    Electromagnetic poles created by the stator coils attract opposite poles and repel like poles on the permanent magnet rotor. Reversing the stator coil polarity steps the motor by one pole pitch.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                    <div className="bg-emerald-50/60 p-2 rounded border border-emerald-200">
                      <strong className="text-emerald-900 block">Higher Torque per Size:</strong>
                      <span className="text-slate-600">Permanent magnetic field boosts holding torque significantly over VR motors.</span>
                    </div>
                    <div className="bg-emerald-50/60 p-2 rounded border border-emerald-200">
                      <strong className="text-emerald-900 block">Can-Stack Packaging:</strong>
                      <span className="text-slate-600">Low-cost stamped sheet metal housings (tin-can steppers) for consumer electronics.</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider block">
                    Common Real-World Applications:
                  </span>
                  <ul className="list-disc list-inside text-[10px] text-slate-600 space-y-0.5">
                    <li><strong>Paper Feed Rollers:</strong> Desktop inkjet and thermal receipt printers.</li>
                    <li><strong>Optical Disc Drives:</strong> CD/DVD tray eject and laser head sled movement.</li>
                    <li><strong>HVAC Damper Actuators:</strong> Automotive climate control vent flaps.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TYPE 4: UNIPOLAR VS. BIPOLAR STEPPER MOTORS & DRIVERS                     */}
        {/* ========================================================================= */}
        {selectedType === 'unipolar_bipolar' && (
          <div className="space-y-4">
            <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded border border-purple-300">
                  Winding Architecture &amp; Driver IC Topologies
                </span>
                <h5 className="font-extrabold text-sm text-purple-950">
                  Unipolar (5/6-Wire + ULN2003A) vs. Bipolar (4-Wire + H-Bridge L293D/L298N)
                </h5>
                <p className="text-[11px] text-slate-600 max-w-2xl">
                  Stepper motors are also categorized by how their stator phase windings are wired and driven by the microprocessor interface.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* UNIPOLAR STEPPER MOTOR CARD */}
              <div className="bg-white p-4 rounded-xl border-2 border-indigo-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-indigo-100 text-indigo-700 rounded-md font-mono text-[10px] font-bold">5/6 WIRES</div>
                    <span className="font-extrabold text-xs text-indigo-950">Unipolar Stepper Motor</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-200">
                    ULN2003A Driver
                  </span>
                </div>

                <div className="space-y-2 text-[11px] text-slate-700">
                  <p>
                    <strong>Winding Structure:</strong> Each phase coil has a <strong>center-tap wire</strong> tied to <code className="bg-slate-100 px-1 rounded font-mono text-indigo-700">+12V DC</code>. Current only flows in <strong>one direction</strong> through half the coil at a time to change magnetic polarity.
                  </p>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono text-[10px] space-y-1">
                    <div className="font-bold text-slate-800">8086 Interface Mechanism:</div>
                    <div className="text-slate-600">8086 → 8255 Port A (PA0–PA3) → ULN2003A Darlington Transistors (Pin 1B–4B) → Coil Low-Side Sink</div>
                  </div>

                  <div className="space-y-1 text-[10px]">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Very simple driver circuit (Single ULN2003A IC, no H-bridge needed).</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <Info className="w-3.5 h-3.5 text-amber-500" />
                      <span>Only 50% of the winding copper is energized at any instant (~30% less torque).</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BIPOLAR STEPPER MOTOR CARD */}
              <div className="bg-white p-4 rounded-xl border-2 border-purple-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-purple-100 text-purple-700 rounded-md font-mono text-[10px] font-bold">4 WIRES</div>
                    <span className="font-extrabold text-xs text-purple-950">Bipolar Stepper Motor</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-200">
                    H-Bridge (L293D / L298N)
                  </span>
                </div>

                <div className="space-y-2 text-[11px] text-slate-700">
                  <p>
                    <strong>Winding Structure:</strong> No center taps (only 4 lead wires). Magnetic polarity is reversed by <strong>reversing current direction (+ / -)</strong> through the entire phase winding using an active H-bridge.
                  </p>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono text-[10px] space-y-1">
                    <div className="font-bold text-slate-800">8086 Interface Mechanism:</div>
                    <div className="text-slate-600">8086 → 8255 Port A → Full Dual H-Bridge Driver (L293D / L298N / A4988 / DRV8825)</div>
                  </div>

                  <div className="space-y-1 text-[10px]">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>100% of the copper winding volume is energized &rarr; Highest torque output.</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <Info className="w-3.5 h-3.5 text-amber-500" />
                      <span>Requires 8 switching transistors in H-bridge configuration to reverse polarity.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* COMPREHENSIVE STEPPER MOTOR COMPARISON MATRIX TABLE                        */}
      {/* ========================================================================= */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-600" />
            Comparison Table: Stepper Motor Types
          </span>
          <span className="text-[10px] font-mono text-slate-500">Quick Reference Matrix</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-2.5">Parameter</th>
                <th className="p-2.5 text-indigo-700">1. Hybrid (VR + PM)</th>
                <th className="p-2.5 text-blue-700">2. Variable Reluctance (VR)</th>
                <th className="p-2.5 text-emerald-700">3. Permanent Magnet (PM)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              <tr className="hover:bg-slate-50">
                <td className="p-2.5 font-bold text-slate-800 bg-slate-50/50">Rotor Construction</td>
                <td className="p-2.5 text-slate-700">Axial PM inside two toothed soft iron cups</td>
                <td className="p-2.5 text-slate-700">Toothed soft iron (no magnet)</td>
                <td className="p-2.5 text-slate-700">Cylindrical permanent magnet with N/S poles</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-2.5 font-bold text-slate-800 bg-slate-50/50">Typical Step Angles</td>
                <td className="p-2.5 font-bold text-indigo-700 font-mono">1.8° (200 st) or 0.9° (400 st)</td>
                <td className="p-2.5 font-bold text-blue-700 font-mono">7.5°, 15°, or 30°</td>
                <td className="p-2.5 font-bold text-emerald-700 font-mono">7.5° (48 st) or 15° (24 st)</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-2.5 font-bold text-slate-800 bg-slate-50/50">Holding Torque</td>
                <td className="p-2.5 text-emerald-700 font-bold">Very High (Highest)</td>
                <td className="p-2.5 text-slate-600">Moderate</td>
                <td className="p-2.5 text-slate-700">High</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-2.5 font-bold text-slate-800 bg-slate-50/50">Detent Torque (Unpowered)</td>
                <td className="p-2.5 text-slate-700">Present (moderate)</td>
                <td className="p-2.5 text-rose-700 font-bold">Zero (Free spinning)</td>
                <td className="p-2.5 text-slate-700">Present (Noticeable)</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-2.5 font-bold text-slate-800 bg-slate-50/50">Resolution &amp; Precision</td>
                <td className="p-2.5 font-bold text-indigo-700">Highest Precision</td>
                <td className="p-2.5 text-slate-600">Coarse</td>
                <td className="p-2.5 text-slate-600">Moderate</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-2.5 font-bold text-slate-800 bg-slate-50/50">Typical 8086 Applications</td>
                <td className="p-2.5 text-slate-700">3D printers, CNC mills, robotics, disk head drives</td>
                <td className="p-2.5 text-slate-700">Fast indexing tables, light positioning</td>
                <td className="p-2.5 text-slate-700">Printers (paper feed), optical drives, HVAC flaps</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE STEP ANGLE (β) & SPEED (RPM) CALCULATOR                       */}
      {/* ========================================================================= */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <span className="font-bold text-xs text-indigo-950 uppercase flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-indigo-600" />
            Interactive Step Angle (β) &amp; Shaft Speed (RPM) Calculator
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            Formula: β = 360° / (m × Nr) &nbsp;|&nbsp; n = (β × f) / 6 RPM
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px]">
          {/* Parameter 1: Stator Phases (m) */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1 shadow-2xs">
            <label className="text-[10px] font-bold text-slate-700 uppercase block">
              Stator Phases (m)
            </label>
            <div className="flex items-center gap-1">
              {[2, 3, 4, 5].map((m) => (
                <button
                  key={m}
                  onClick={() => setCalcPhases(m)}
                  className={`flex-1 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                    calcPhases === m 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <span className="text-[9px] text-slate-400">Standard: 4 Phases (A,B,C,D)</span>
          </div>

          {/* Parameter 2: Rotor Teeth (Nr) */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1 shadow-2xs">
            <label className="text-[10px] font-bold text-slate-700 uppercase block">
              Rotor Teeth (Nr): <span className="text-indigo-700 font-mono">{calcRotorTeeth}</span>
            </label>
            <input
              type="range"
              min="4"
              max="100"
              step="2"
              value={calcRotorTeeth}
              onChange={(e) => setCalcRotorTeeth(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-mono">
              <span>4 (VR/PM)</span>
              <span>50 (Hybrid 1.8°)</span>
              <span>100 (0.9°)</span>
            </div>
          </div>

          {/* Parameter 3: Pulse Frequency (f in Hz) */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1 shadow-2xs">
            <label className="text-[10px] font-bold text-slate-700 uppercase block">
              Pulse Frequency (f): <span className="text-emerald-700 font-mono">{pulseFreqHz} Hz</span>
            </label>
            <input
              type="range"
              min="50"
              max="2000"
              step="50"
              value={pulseFreqHz}
              onChange={(e) => setPulseFreqHz(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-mono">
              <span>50 Hz (Slow)</span>
              <span>400 Hz</span>
              <span>2 kHz (Fast)</span>
            </div>
          </div>

          {/* Result Summary Box */}
          <div className="bg-indigo-600 text-white p-2.5 rounded-lg space-y-1 flex flex-col justify-between shadow-xs">
            <div className="text-[10px] uppercase font-bold text-indigo-200">Calculated Output</div>
            <div className="space-y-0.5 font-mono">
              <div className="text-xs">
                Step Angle (β): <strong className="text-white text-sm">{stepAngleDeg.toFixed(2)}°</strong>
              </div>
              <div className="text-[10px] text-indigo-100">
                Steps / Rev: <strong>{stepsPerRev} steps</strong>
              </div>
              <div className="text-[10px] text-amber-200 font-bold">
                Shaft Speed: {shaftRpm} RPM
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
