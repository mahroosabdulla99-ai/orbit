import React from 'react';
import { ReentryCalculation } from '../utils/orbitalMath';
import { ShieldAlert, Calculator, RotateCcw, Info, ArrowUpRight, Flame, Anchor, Compass } from 'lucide-react';

interface ReentryPanelProps {
  retroDeltaVMs: number;
  onRetroDeltaVChange: (val: number) => void;
  entryAngleDeg: number;
  onEntryAngleChange: (val: number) => void;
  timingOffsetSec: number;
  onTimingOffsetChange: (val: number) => void;
  reentryData: ReentryCalculation;
  onCalculate: () => void;
  onReset: () => void;
}

export const ReentryPanel: React.FC<ReentryPanelProps> = ({
  retroDeltaVMs,
  onRetroDeltaVChange,
  entryAngleDeg,
  onEntryAngleChange,
  timingOffsetSec,
  onTimingOffsetChange,
  reentryData,
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
              EXPERIMENT 03
            </span>
            <h2 className="text-sm md:text-base font-bold font-display uppercase tracking-wide text-slate-100">
              Safe Return Trajectory & Re-Entry Corridor
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Atmospheric interface physics, thermal limits, & splashdown zones
          </p>
        </div>
      </div>

      <div className="mt-3.5 space-y-3.5">
        {/* Sliders Container */}
        <div className="space-y-3 bg-[#0b1329] p-3 rounded-lg border border-slate-800/80">
          {/* Entry Flight Path Angle Gamma Slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="angle-slider" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                Flight Path Angle (γ) at 122 km
              </label>
              <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border tabular-nums ${
                reentryData.outcome === 'safe_splashdown'
                  ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-950/50 text-rose-300 border-rose-500/30'
              }`}>
                {entryAngleDeg}°
              </span>
            </div>
            <input
              id="angle-slider"
              type="range"
              min="-8.5"
              max="-4.5"
              step="0.1"
              value={entryAngleDeg}
              onChange={(e) => onEntryAngleChange(Number(e.target.value))}
              className="w-full accent-cyan-400"
              aria-label="Flight Path Angle at Entry"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-0.5">
              <span className="text-rose-400">-8.5° (Too Steep: High G)</span>
              <span className="text-emerald-400 font-semibold">-6.3° (Safe Corridor)</span>
              <span className="text-sky-400">-4.5° (Too Shallow: Skip)</span>
            </div>
          </div>

          {/* Retrofire Delta-V Slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="retro-slider" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Retro-Rocket Burn (Δv)
              </label>
              <span className="font-mono text-xs font-bold text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/20 tabular-nums">
                {retroDeltaVMs} m/s
              </span>
            </div>
            <input
              id="retro-slider"
              type="range"
              min="90"
              max="220"
              step="5"
              value={retroDeltaVMs}
              onChange={(e) => onRetroDeltaVChange(Number(e.target.value))}
              className="w-full accent-amber-400"
              aria-label="Retro-Rocket Burn Delta-V"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-0.5">
              <span>90 m/s (Underburn)</span>
              <span>135 m/s (Mercury Baseline)</span>
              <span>220 m/s (Steep De-orbit)</span>
            </div>
          </div>

          {/* Retrofire Timing Offset */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="timing-slider" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Anchor className="w-3.5 h-3.5 text-emerald-400" />
                Burn Timing Offset (Δt)
              </label>
              <span className="font-mono text-xs font-bold text-slate-300 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/40 tabular-nums">
                {timingOffsetSec > 0 ? `+${timingOffsetSec}` : timingOffsetSec} sec
              </span>
            </div>
            <input
              id="timing-slider"
              type="range"
              min="-45"
              max="45"
              step="5"
              value={timingOffsetSec}
              onChange={(e) => onTimingOffsetChange(Number(e.target.value))}
              className="w-full accent-slate-400"
              aria-label="Retrofire Timing Offset"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-0.5">
              <span>-45 s (Short Landing)</span>
              <span>0 s (Primary Carrier Fleet)</span>
              <span>+45 s (Long Landing)</span>
            </div>
          </div>
        </div>

        {/* Corridor Outcome Telemetry */}
        <div className="grid grid-cols-2 gap-2">
          {/* Peak Deceleration */}
          <div className="bg-[#0b1329] p-2.5 rounded-lg border border-slate-800/80">
            <div className="text-[10px] font-mono uppercase text-slate-400">
              Peak Deceleration (G-Load)
            </div>
            <div className={`text-xl font-bold font-mono mt-1 tabular-nums ${
              reentryData.peakGForce > 11 ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {reentryData.peakGForce} <span className="text-xs font-normal text-slate-400">G</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
              Human limit: ≤ 11.5 G
            </div>
          </div>

          {/* Peak Heat Shield Thermal Load */}
          <div className="bg-[#0b1329] p-2.5 rounded-lg border border-slate-800/80">
            <div className="text-[10px] font-mono uppercase text-slate-400">
              Peak Thermal Load
            </div>
            <div className={`text-xl font-bold font-mono mt-1 tabular-nums ${
              reentryData.peakThermalC > 2000 ? 'text-rose-400' : 'text-amber-400'
            }`}>
              {reentryData.peakThermalC.toLocaleString()} <span className="text-xs font-normal text-slate-400">°C</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
              Shield tolerance: 2,100°C
            </div>
          </div>
        </div>

        {/* Landing Recovery Sector */}
        <div className={`p-3 rounded-lg border text-xs font-mono ${
          reentryData.outcome === 'safe_splashdown'
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
            : reentryData.outcome === 'skip_off'
            ? 'bg-sky-950/30 border-sky-500/40 text-sky-300'
            : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
        }`}>
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5">
              <Anchor className="w-3.5 h-3.5" />
              {reentryData.splashdownRecoveryZone}
            </span>
          </div>
          <div className="text-[11px] text-slate-300 mt-1 font-sans">
            {reentryData.corridorSummary}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Coordinates: <strong className="text-cyan-300">{reentryData.predictedCoords}</strong></span>
            <span>Downrange: <strong className="text-amber-300">{reentryData.downrangeKm} km</strong></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onCalculate}
            className="flex-1 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.15)] active:scale-[0.98]"
          >
            <Calculator className="w-3.5 h-3.5" />
            Simulate Re-Entry Corridor
          </button>
          <button
            onClick={onReset}
            className="px-3 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-slate-200 border border-slate-700/40 text-xs transition-colors flex items-center gap-1"
            title="Reset re-entry parameters"
            aria-label="Reset parameters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        {/* Mathematical Re-entry Corridor Physics */}
        <div className="bg-[#091124] p-3 rounded-lg border border-cyan-900/40 text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-bold font-display text-cyan-300 text-xs uppercase tracking-wide">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            Why Flight Path Angle (γ) Is Life-or-Death
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            The atmospheric re-entry corridor is razor-thin:
          </p>
          <ul className="text-[11px] text-slate-300 space-y-1 pl-2">
            <li>• <strong className="text-sky-300">Too Shallow (γ &gt; -5.5°):</strong> Insufficient atmospheric density to slow the craft. The capsule bounces off the upper stratosphere back into space.</li>
            <li>• <strong className="text-rose-400">Too Steep (γ &lt; -7.4°):</strong> Severe atmospheric drag causes deceleration spikes exceeding 12 Gs and temperatures exceeding the heat shield's ablation limit.</li>
          </ul>
        </div>

        {/* John Glenn Friendship 7 Quote */}
        <div className="bg-[#121008] p-3 rounded-lg border border-amber-500/30 text-[11px] text-amber-200/90 leading-relaxed">
          <div className="font-semibold text-amber-300 flex items-center gap-1 mb-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            John Glenn's Historical Directive (1962)
          </div>
          <blockquote className="italic border-l-2 border-amber-400 pl-2 my-1 text-slate-200">
            "Get the girl to check the numbers... If she says they're good, then I'm ready to go."
          </blockquote>
          Astronaut John Glenn trusted Katherine Johnson's hand-calculated trajectory equations and retrofire splashdown coordinates over the newly programmed electronic IBM 7090 computers before his historic orbital flight.
        </div>

        <p className="text-[10px] text-slate-500 font-mono text-center">
          * Educational simulation model illustrating Mercury re-entry corridor parameters.
        </p>
      </div>
    </div>
  );
};
