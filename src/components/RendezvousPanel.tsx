import React from 'react';
import { RendezvousCalculation } from '../utils/orbitalMath';
import { GitMerge, Calculator, RotateCcw, Info, ArrowUpRight, Gauge, Radio, Target } from 'lucide-react';

interface RendezvousPanelProps {
  phaseAngleDeg: number;
  onPhaseAngleChange: (val: number) => void;
  chaserAltKm: number;
  onChaserAltChange: (val: number) => void;
  deltaVMs: number;
  onDeltaVChange: (val: number) => void;
  rendezvousData: RendezvousCalculation;
  onCalculate: () => void;
  onReset: () => void;
}

export const RendezvousPanel: React.FC<RendezvousPanelProps> = ({
  phaseAngleDeg,
  onPhaseAngleChange,
  chaserAltKm,
  onChaserAltChange,
  deltaVMs,
  onDeltaVChange,
  rendezvousData,
  onCalculate,
  onReset,
}) => {
  return (
    <div className="flex flex-col h-full bg-[#080d1e]/90 border border-slate-800/80 rounded-xl p-3.5 md:p-4 text-slate-200 overflow-y-auto">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-400">
              EXPERIMENT 02
            </span>
            <h2 className="text-sm md:text-base font-bold font-display uppercase tracking-wide text-slate-100">
              Spacecraft Rendezvous & Phasing
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronizing orbital intercept geometry for Apollo & Gemini
          </p>
        </div>
      </div>

      <div className="mt-3.5 space-y-3.5">
        {/* Sliders Container */}
        <div className="space-y-3 bg-[#0b1329] p-3 rounded-lg border border-slate-800/80">
          {/* Phase Angle Slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="phase-slider" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                Initial Phase Lead/Lag (Δθ)
              </label>
              <span className="font-mono text-xs font-bold text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/20 tabular-nums">
                {phaseAngleDeg > 0 ? `+${phaseAngleDeg}` : phaseAngleDeg}°
              </span>
            </div>
            <input
              id="phase-slider"
              type="range"
              min="-25"
              max="25"
              step="1"
              value={phaseAngleDeg}
              onChange={(e) => onPhaseAngleChange(Number(e.target.value))}
              className="w-full accent-amber-400"
              aria-label="Phase Lead/Lag Angle"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-0.5">
              <span>-25° (Chaser Behind)</span>
              <span>0° (Aligned)</span>
              <span>+25° (Chaser Ahead)</span>
            </div>
          </div>

          {/* Chaser Orbit Altitude Slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="chaser-alt-slider" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                Chaser Orbit Altitude (h_c)
              </label>
              <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/20 tabular-nums">
                {chaserAltKm} km
              </span>
            </div>
            <input
              id="chaser-alt-slider"
              type="range"
              min="200"
              max="400"
              step="5"
              value={chaserAltKm}
              onChange={(e) => onChaserAltChange(Number(e.target.value))}
              className="w-full accent-cyan-400"
              aria-label="Chaser Orbit Altitude"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-0.5">
              <span>200 km (Lower/Faster)</span>
              <span>300 km (Target Orbit)</span>
              <span>400 km (Higher/Slower)</span>
            </div>
          </div>

          {/* Phasing Impulse Burn Delta-V Slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="burn-slider" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                Transfer Impulse Burn (Δv)
              </label>
              <span className="font-mono text-xs font-bold text-emerald-300 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/20 tabular-nums">
                {deltaVMs} m/s
              </span>
            </div>
            <input
              id="burn-slider"
              type="range"
              min="0"
              max="60"
              step="1"
              value={deltaVMs}
              onChange={(e) => onDeltaVChange(Number(e.target.value))}
              className="w-full accent-emerald-400"
              aria-label="Transfer Burn Delta-V"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-0.5">
              <span>0 m/s (Co-orbital)</span>
              <span>Nominal Trim (5–12 m/s)</span>
              <span>60 m/s (Overburn)</span>
            </div>
          </div>
        </div>

        {/* Live Intercept Telemetry Metrics */}
        <div className="grid grid-cols-2 gap-2">
          {/* Minimum Separation Distance */}
          <div className="bg-[#0b1329] p-2.5 rounded-lg border border-slate-800/80">
            <div className="text-[10px] font-mono uppercase text-slate-400">
              Closest Approach (Δd)
            </div>
            <div className={`text-xl font-bold font-mono mt-1 tabular-nums ${
              rendezvousData.isDockingFeasible ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {rendezvousData.minSeparationKm} <span className="text-xs font-normal text-slate-400">km</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
              Latch limit: ≤ 3.5 km
            </div>
          </div>

          {/* Relative Closure Speed */}
          <div className="bg-[#0b1329] p-2.5 rounded-lg border border-slate-800/80">
            <div className="text-[10px] font-mono uppercase text-slate-400">
              Relative Velocity (Δv_rel)
            </div>
            <div className="text-xl font-bold font-mono text-cyan-300 mt-1 tabular-nums">
              {rendezvousData.relativeVelocityMs} <span className="text-xs font-normal text-slate-400">m/s</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
              Safe latch: ≤ 45 m/s
            </div>
          </div>
        </div>

        {/* Intercept Status Banner */}
        <div className={`p-2.5 rounded-lg border text-xs font-mono ${
          rendezvousData.isDockingFeasible
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
            : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
        }`}>
          <div className="font-bold flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" />
            {rendezvousData.statusMessage}
          </div>
          <p className="text-[11px] text-slate-300 mt-1 font-sans">
            {rendezvousData.orbitalAdvice}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onCalculate}
            className="flex-1 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.15)] active:scale-[0.98]"
          >
            <Calculator className="w-3.5 h-3.5" />
            Calculate Rendezvous Vector
          </button>
          <button
            onClick={onReset}
            className="px-3 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-slate-200 border border-slate-700/40 text-xs transition-colors flex items-center gap-1"
            title="Reset rendezvous parameters"
            aria-label="Reset parameters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        {/* Mathematical Explanation */}
        <div className="bg-[#091124] p-3 rounded-lg border border-cyan-900/40 text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-bold font-display text-cyan-300 text-xs uppercase tracking-wide">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            How Math Solves Orbital Rendezvous
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            In space, steering straight toward a target fails. Firing prograde increases your orbital energy, raising your apogee into a higher, <em>slower</em> orbit.
          </p>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            To catch up to a spacecraft ahead of you, mathematicians calculate a <strong className="text-cyan-300">phasing orbit</strong>: drop to a lower orbit where angular velocity is faster, orbit until the phase angle closes, then fire a precise burn to rendezvous at the exact intercept node.
          </p>
        </div>

        {/* Katherine Johnson Apollo Contribution */}
        <div className="bg-[#121008] p-3 rounded-lg border border-amber-500/30 text-[11px] text-amber-200/90 leading-relaxed">
          <div className="font-semibold text-amber-300 flex items-center gap-1 mb-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            Apollo 11 & Lunar Module Docking
          </div>
          Katherine Johnson's calculations synchronized the rendezvous between the Apollo Lunar Module rising from the Moon and the Command Service Module in lunar orbit. Without her precise phasing geometry, the astronauts would have been stranded in lunar orbit.
        </div>

        <p className="text-[10px] text-slate-500 font-mono text-center">
          * Educational simulation model illustrating relative orbital phasing.
        </p>
      </div>
    </div>
  );
};
