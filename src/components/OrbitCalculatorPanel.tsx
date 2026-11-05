import React from 'react';
import { OrbitCalculation } from '../utils/orbitalMath';
import { Calculator, RotateCcw, Info, ArrowUpRight, Gauge, Clock, Compass } from 'lucide-react';

interface OrbitCalculatorPanelProps {
  altitudeKm: number;
  onAltitudeChange: (val: number) => void;
  orbitData: OrbitCalculation;
  onCalculate: () => void;
  onReset: () => void;
  hasCalculated: boolean;
}

export const OrbitCalculatorPanel: React.FC<OrbitCalculatorPanelProps> = ({
  altitudeKm,
  onAltitudeChange,
  orbitData,
  onCalculate,
  onReset,
  hasCalculated,
}) => {
  return (
    <div className="flex flex-col h-full bg-[#080d1e]/90 border border-slate-800/80 rounded-xl p-3.5 md:p-4 text-slate-200 overflow-y-auto">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-400">
              EXPERIMENT 01
            </span>
            <h2 className="text-sm md:text-base font-bold font-display uppercase tracking-wide text-slate-100">
              Orbital Speed & Period Calculator
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Keplerian celestial mechanics & orbital equilibrium
          </p>
        </div>
      </div>

      {/* Main Interactive Controls & Sliders */}
      <div className="mt-3.5 space-y-3.5">
        {/* Altitude Slider */}
        <div className="bg-[#0b1329] p-3 rounded-lg border border-slate-800/80">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="altitude-slider" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              Orbital Altitude (h)
            </label>
            <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/20 tabular-nums">
              {altitudeKm} km
            </span>
          </div>

          <input
            id="altitude-slider"
            type="range"
            min="150"
            max="1200"
            step="10"
            value={altitudeKm}
            onChange={(e) => onAltitudeChange(Number(e.target.value))}
            className="w-full accent-cyan-400"
            aria-label="Orbital Altitude"
          />

          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span>150 km (Low Orbit)</span>
            <span>300 km (Mercury / Glenn)</span>
            <span>1,200 km (High LEO)</span>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex gap-1.5 mt-2.5">
            <button
              onClick={() => onAltitudeChange(180)}
              className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 border border-slate-700/40 transition-colors"
            >
              Shepard (186 km)
            </button>
            <button
              onClick={() => onAltitudeChange(260)}
              className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 border border-slate-700/40 transition-colors"
            >
              Glenn Friendship 7 (260 km)
            </button>
            <button
              onClick={() => onAltitudeChange(420)}
              className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 border border-slate-700/40 transition-colors"
            >
              Space Station (420 km)
            </button>
          </div>
        </div>

        {/* Live Computed Telemetry Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Orbital Speed */}
          <div className="bg-[#0b1329] p-2.5 rounded-lg border border-slate-800/80">
            <div className="flex items-center gap-1 text-[10px] font-mono uppercase text-slate-400">
              <Gauge className="w-3 h-3 text-cyan-400" />
              Orbital Speed (v)
            </div>
            <div className="text-xl font-bold font-mono text-cyan-300 mt-1 tabular-nums">
              {orbitData.speedKmS} <span className="text-xs font-normal text-slate-400">km/s</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5 tabular-nums">
              {orbitData.speedMph.toLocaleString()} mph
            </div>
          </div>

          {/* Orbital Period */}
          <div className="bg-[#0b1329] p-2.5 rounded-lg border border-slate-800/80">
            <div className="flex items-center gap-1 text-[10px] font-mono uppercase text-slate-400">
              <Clock className="w-3 h-3 text-amber-400" />
              Orbital Period (T)
            </div>
            <div className="text-xl font-bold font-mono text-amber-300 mt-1 tabular-nums">
              {orbitData.periodMinutes} <span className="text-xs font-normal text-slate-400">min</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5 tabular-nums">
              {orbitData.periodHours} hours / rev
            </div>
          </div>
        </div>

        {/* Dynamic Secondary Telemetry Readout */}
        <div className="bg-[#091024] px-3 py-2 rounded-lg border border-slate-800/60 flex items-center justify-between text-xs font-mono text-slate-300">
          <div>
            <span className="text-slate-500">RADIUS (r = R_E + h):</span>{' '}
            <span className="text-cyan-400 font-bold">{orbitData.orbitalRadiusKm} km</span>
          </div>
          <div>
            <span className="text-slate-500">CENTRIPETAL ACCEL:</span>{' '}
            <span className="text-amber-400 font-bold">{orbitData.centripetalAccel} m/s²</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onCalculate}
            className="flex-1 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.15)] active:scale-[0.98]"
          >
            <Calculator className="w-3.5 h-3.5" />
            Calculate & Synchronize
          </button>
          <button
            onClick={onReset}
            className="px-3 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-slate-200 border border-slate-700/40 text-xs transition-colors flex items-center gap-1"
            title="Reset altitude to baseline"
            aria-label="Reset altitude"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        {/* Mathematical Explanation Section */}
        <div className="bg-[#091124] p-3 rounded-lg border border-cyan-900/40 text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-bold font-display text-cyan-300 text-xs uppercase tracking-wide">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            The Mathematics of Circular Orbit
          </div>

          <div className="bg-[#060a17] p-2 rounded border border-slate-800/80 font-mono text-[11px] text-cyan-200 space-y-1">
            <div className="flex items-center justify-between">
              <span>Velocity Formula:</span>
              <span className="font-bold text-amber-300">v = √(GM / r)</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Period Formula:</span>
              <span className="font-bold text-amber-300">T = 2π √(r³ / GM)</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            In circular orbit, the spacecraft stays aloft because gravitational attraction balances the required centripetal acceleration (m·v² / r = G·M·m / r²).
          </p>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            <strong className="text-amber-300">Counter-intuitive Principle:</strong> As altitude increases, orbital radius r grows, meaning the required orbital velocity actually <span className="underline decoration-cyan-400">decreases</span>, while the time to complete an orbit dramatically increases.
          </p>
        </div>

        {/* Katherine Johnson Context Note */}
        <div className="bg-[#121008] p-2.5 rounded-lg border border-amber-500/30 text-[11px] text-amber-200/90 leading-relaxed">
          <div className="font-semibold text-amber-300 flex items-center gap-1 mb-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" />
            Katherine Johnson's Landmark Work
          </div>
          In 1960, Katherine Johnson co-authored NASA Technical Report <em>TN D-233</em>, establishing the orbital flight equations that determined exact burnout azimuths and launch windows for placing spacecraft into precision Earth orbits.
        </div>

        {/* Educational Disclaimer */}
        <p className="text-[10px] text-slate-500 font-mono text-center">
          * Educational simulation model illustrating Keplerian mechanics.
        </p>
      </div>
    </div>
  );
};
