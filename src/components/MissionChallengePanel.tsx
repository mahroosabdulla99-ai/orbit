import React, { useState } from 'react';
import { evaluateMission, MissionPlan, MissionResult } from '../utils/orbitalMath';
import { Award, CheckCircle2, XCircle, Rocket, RotateCcw, ArrowRight } from 'lucide-react';

interface MissionChallengePanelProps {
  onApplyPlanToSim: (plan: MissionPlan) => void;
}

export const MissionChallengePanel: React.FC<MissionChallengePanelProps> = ({
  onApplyPlanToSim,
}) => {
  const [orbitAltKm, setOrbitAltKm] = useState<number>(280);
  const [phaseAngleDeg, setPhaseAngleDeg] = useState<number>(0);
  const [rendezvousBurnMs, setRendezvousBurnMs] = useState<number>(6);
  const [retroAngleDeg, setRetroAngleDeg] = useState<number>(-6.4);
  const [retroDeltaVMs, setRetroDeltaVMs] = useState<number>(140);

  const [result, setResult] = useState<MissionResult | null>(null);

  const handleRunMission = () => {
    const plan: MissionPlan = {
      orbitAltKm,
      phaseAngleDeg,
      rendezvousBurnMs,
      retroAngleDeg,
      retroDeltaVMs,
    };
    const evalResult = evaluateMission(plan);
    setResult(evalResult);
    onApplyPlanToSim(plan);
  };

  const handleResetChallenge = () => {
    setOrbitAltKm(280);
    setPhaseAngleDeg(0);
    setRendezvousBurnMs(6);
    setRetroAngleDeg(-6.4);
    setRetroDeltaVMs(140);
    setResult(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#080d1e]/90 border border-slate-800/80 rounded-xl p-3.5 md:p-4 text-slate-200 overflow-y-auto">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-950/70 border border-amber-500/40 text-amber-300">
              FINAL CHALLENGE
            </span>
            <h2 className="text-sm md:text-base font-bold font-display uppercase tracking-wide text-slate-100">
              Plan The Spaceflight Mission
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Synthesize all 3 orbital calculations into one flawless flight profile
          </p>
        </div>
      </div>

      <div className="mt-3.5 space-y-3.5">
        {/* Step 1: Parking Orbit */}
        <div className="bg-[#0b1329] p-3 rounded-lg border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-mono text-[10px]">1</span>
              Phase 1: Orbital Altitude Insertion
            </div>
            <span className="font-mono text-xs font-bold text-cyan-300 tabular-nums">
              {orbitAltKm} km
            </span>
          </div>
          <input
            type="range"
            min="160"
            max="450"
            step="10"
            value={orbitAltKm}
            onChange={(e) => setOrbitAltKm(Number(e.target.value))}
            className="w-full accent-cyan-400"
            aria-label="Phase 1 Orbit Altitude"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>160 km (Decay Danger)</span>
            <span className="text-cyan-400">Target: 240–340 km</span>
            <span>450 km (Heavy Atlas Booster limit)</span>
          </div>
        </div>

        {/* Step 2: Rendezvous Synchronization */}
        <div className="bg-[#0b1329] p-3 rounded-lg border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-950 border border-amber-500/40 text-amber-400 flex items-center justify-center font-mono text-[10px]">2</span>
              Phase 2: Target Rendezvous Phase & Burn
            </div>
            <span className="font-mono text-xs font-bold text-amber-300 tabular-nums">
              Δθ: {phaseAngleDeg}°, Δv: {rendezvousBurnMs} m/s
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] font-mono text-slate-400 block mb-1">Phase Lead/Lag</span>
              <input
                type="range"
                min="-20"
                max="20"
                step="2"
                value={phaseAngleDeg}
                onChange={(e) => setPhaseAngleDeg(Number(e.target.value))}
                className="w-full accent-amber-400"
                aria-label="Phase Angle"
              />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 block mb-1">Trim Burn (Δv)</span>
              <input
                type="range"
                min="0"
                max="40"
                step="2"
                value={rendezvousBurnMs}
                onChange={(e) => setRendezvousBurnMs(Number(e.target.value))}
                className="w-full accent-emerald-400"
                aria-label="Rendezvous Trim Burn"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Re-entry Corridor */}
        <div className="bg-[#0b1329] p-3 rounded-lg border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-mono text-[10px]">3</span>
              Phase 3: Re-Entry Corridor & Retrofire
            </div>
            <span className="font-mono text-xs font-bold text-emerald-300 tabular-nums">
              γ: {retroAngleDeg}°, Δv: {retroDeltaVMs} m/s
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] font-mono text-slate-400 block mb-1">Flight Path Angle γ</span>
              <input
                type="range"
                min="-8.5"
                max="-4.5"
                step="0.1"
                value={retroAngleDeg}
                onChange={(e) => setRetroAngleDeg(Number(e.target.value))}
                className="w-full accent-emerald-400"
                aria-label="Re-entry Angle"
              />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 block mb-1">Retrofire Burn (Δv)</span>
              <input
                type="range"
                min="90"
                max="200"
                step="5"
                value={retroDeltaVMs}
                onChange={(e) => setRetroDeltaVMs(Number(e.target.value))}
                className="w-full accent-amber-400"
                aria-label="Retrofire Burn"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleRunMission}
            className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(6,182,212,0.3)] active:scale-[0.98]"
          >
            <Rocket className="w-4 h-4" />
            Execute Mission Verification
          </button>
          <button
            onClick={handleResetChallenge}
            className="px-3 py-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-slate-200 border border-slate-700/40 text-xs transition-colors flex items-center gap-1"
            title="Reset flight plan to default"
            aria-label="Reset challenge"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Results & Debrief Modal Card */}
        {result && (
          <div className={`p-3.5 rounded-lg border text-xs ${
            result.passed
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
              <div className="flex items-center gap-1.5 font-bold font-display text-sm">
                {result.passed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>MISSION SUCCESS: 100/100 FLIGHT CERTIFIED</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>TRAJECTORY ABORT: {result.score}/100 SCORE</span>
                  </>
                )}
              </div>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-black/40 border border-white/10 font-bold">
                {result.score} PTS
              </span>
            </div>

            <div className="space-y-1.5 font-mono text-[11px]">
              {result.feedback.map((item, i) => (
                <div key={i} className="flex items-start gap-1 leading-snug">
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {result.passed && (
              <div className="mt-3 p-2 rounded bg-emerald-900/30 border border-emerald-500/30 text-[11px] text-emerald-300 font-sans leading-relaxed">
                <strong className="text-amber-300">Katherine Johnson Award for Mathematical Precision:</strong> You solved the multi-phase orbital equations with the rigorous precision required by NASA's Space Task Group in 1962.
              </div>
            )}
          </div>
        )}

        <div className="bg-[#121008] p-3 rounded-lg border border-amber-500/30 text-[11px] text-amber-200/90 leading-relaxed">
          <div className="font-semibold text-amber-300 flex items-center gap-1 mb-1">
            <Award className="w-3.5 h-3.5" />
            Human Computer Standards
          </div>
          Every manned spaceflight from Freedom 7 to Apollo 11 required solving simultaneous differential equations of gravity, thrust, aerodynamic drag, and planetary rotation. Katherine Johnson's calculations turned mathematical theory into human survival.
        </div>
      </div>
    </div>
  );
};
