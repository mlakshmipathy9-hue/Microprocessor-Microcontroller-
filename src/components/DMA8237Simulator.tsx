import React, { useState, useEffect } from 'react';
import { Cpu, Zap, Activity, CheckCircle2, Play, Pause, RefreshCw, ArrowRight, ShieldAlert } from 'lucide-react';

export default function DMA8237Simulator() {
  const [activeTab, setActiveTab] = useState<'handshake' | 'channels'>('handshake');

  // Handshake State Machine
  const [handshakeStep, setHandshakeStep] = useState<number>(0); // 0=Idle, 1=DRQ, 2=HRQ, 3=HLDA, 4=DACK & Transfer

  // Channel Registers
  const [selectedChannel, setSelectedChannel] = useState<number>(0);
  const [transferMode, setTransferMode] = useState<'single' | 'block' | 'demand'>('block');

  const [currentAddress, setCurrentAddress] = useState<number>(0x2000);
  const [wordCount, setWordCount] = useState<number>(100);
  const [transferActive, setTransferActive] = useState<boolean>(false);

  const handleStepHandshake = () => {
    setHandshakeStep((prev) => (prev + 1) % 5);
  };

  // Block Transfer Simulation Timer
  useEffect(() => {
    let timer: any = null;
    if (transferActive && wordCount > 0) {
      timer = setInterval(() => {
        setCurrentAddress((a) => a + 1);
        setWordCount((w) => {
          if (w <= 1) {
            setTransferActive(false);
            return 0;
          }
          return w - 1;
        });
      }, 150);
    }
    return () => clearInterval(timer);
  }, [transferActive, wordCount]);

  const handleStartBlockTransfer = () => {
    setCurrentAddress(0x2000);
    setWordCount(100);
    setTransferActive(true);
  };

  return (
    <div className="bg-slate-900 text-slate-100 p-4 md:p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4 text-xs font-sans">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600/20 rounded-xl border border-indigo-500/30 text-indigo-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Intel 8237A Programmable DMA Controller</h3>
            <p className="text-[11px] text-slate-400">HRQ / HLDA Bus Master Handshake Protocol &amp; 4 Independent Channels</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 gap-1">
          <button
            onClick={() => setActiveTab('handshake')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'handshake' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Bus Master HRQ/HLDA Handshake
          </button>
          <button
            onClick={() => setActiveTab('channels')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'channels' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Channel Registers &amp; Transfers
          </button>
        </div>
      </div>

      {/* TAB 1: HRQ/HLDA Handshake */}
      {activeTab === 'handshake' && (
        <div className="space-y-3">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-300 text-xs uppercase tracking-wider">
                DMA Bus Takeover Step-by-Step Protocol
              </span>
              <button
                onClick={handleStepHandshake}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Next Handshake Step ({handshakeStep}/4)
              </button>
            </div>

            {/* Handshake Visual Pipeline */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 font-mono">
              {/* Step 1: DRQ */}
              <div className={`p-2.5 rounded-lg border transition-all ${handshakeStep >= 1 ? 'bg-indigo-950/80 border-indigo-500 text-indigo-200' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                <div className="text-[9px] text-slate-400">Step 1</div>
                <strong className="text-xs block">1. DRQ Pin Active</strong>
                <p className="text-[10px] font-sans text-slate-300 mt-1">Peripheral asserts DRQ input to 8237 DMAC.</p>
              </div>

              {/* Step 2: HRQ */}
              <div className={`p-2.5 rounded-lg border transition-all ${handshakeStep >= 2 ? 'bg-amber-950/80 border-amber-500 text-amber-200' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                <div className="text-[9px] text-slate-400">Step 2</div>
                <strong className="text-xs block">2. HRQ to 8086</strong>
                <p className="text-[10px] font-sans text-slate-300 mt-1">8237 asserts HRQ line to 8086 CPU HOLD pin.</p>
              </div>

              {/* Step 3: HLDA */}
              <div className={`p-2.5 rounded-lg border transition-all ${handshakeStep >= 3 ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                <div className="text-[9px] text-slate-400">Step 3</div>
                <strong className="text-xs block">3. HLDA Asserted</strong>
                <p className="text-[10px] font-sans text-slate-300 mt-1">8086 tri-states buses and asserts HLDA response.</p>
              </div>

              {/* Step 4: Bus Master */}
              <div className={`p-2.5 rounded-lg border transition-all ${handshakeStep === 4 ? 'bg-emerald-500 text-slate-950 font-extrabold border-emerald-400 shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                <div className="text-[9px] opacity-80">Step 4</div>
                <strong className="text-xs block">4. Bus Master Active</strong>
                <p className="text-[10px] font-sans mt-1">8237 asserts DACK &amp; transfers data directly to RAM!</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Channel Registers & Block Transfers */}
      {activeTab === 'channels' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Channel Select & Mode */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-bold uppercase tracking-wider">Select DMA Channel (Ch 0–3)</label>
                <div className="grid grid-cols-4 gap-1.5 font-mono">
                  {[0, 1, 2, 3].map((ch) => (
                    <button
                      key={ch}
                      onClick={() => setSelectedChannel(ch)}
                      className={`py-1 rounded font-bold cursor-pointer ${selectedChannel === ch ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                    >
                      CH {ch}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-bold uppercase tracking-wider">Transfer Mode</label>
                <div className="grid grid-cols-3 gap-1.5 font-semibold">
                  <button
                    onClick={() => setTransferMode('single')}
                    className={`py-1 rounded border ${transferMode === 'single' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    Single Mode
                  </button>
                  <button
                    onClick={() => setTransferMode('block')}
                    className={`py-1 rounded border ${transferMode === 'block' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    Block Mode
                  </button>
                  <button
                    onClick={() => setTransferMode('demand')}
                    className={`py-1 rounded border ${transferMode === 'demand' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    Demand Mode
                  </button>
                </div>
              </div>

              <button
                onClick={handleStartBlockTransfer}
                disabled={transferActive}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Play className="w-3.5 h-3.5" />
                {transferActive ? 'DMA Transfer Executing...' : 'Start Channel DMA Block Transfer'}
              </button>
            </div>

            {/* Current Register Status */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5 font-mono">
              <span className="font-bold text-indigo-300 text-xs uppercase tracking-wider font-sans block border-b border-slate-800 pb-1">
                Channel {selectedChannel} Hardware Registers
              </span>

              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Current Address Reg:</span>
                <strong className="text-emerald-400 font-bold">0x{currentAddress.toString(16).toUpperCase().padStart(4, '0')}H</strong>
              </div>

              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Current Word Count Reg:</span>
                <strong className="text-indigo-300 font-bold">{wordCount} Bytes Remaining</strong>
              </div>

              <div className="p-2 bg-slate-900 rounded border border-slate-800 text-[10.5px] text-slate-300 font-sans">
                Transfers data directly between I/O and RAM at speeds reaching <strong>several Megabytes per second</strong> without CPU overhead!
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
