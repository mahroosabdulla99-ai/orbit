/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header, ExperimentType } from './components/Header';
import { SpaceCanvas } from './components/SpaceCanvas';
import { OrbitCalculatorPanel } from './components/OrbitCalculatorPanel';
import { RendezvousPanel } from './components/RendezvousPanel';
import { ReentryPanel } from './components/ReentryPanel';
import { MissionChallengePanel } from './components/MissionChallengePanel';
import { HistoricalModal } from './components/HistoricalModal';
import { 
  calculateOrbit, 
  calculateRendezvous, 
  calculateReentry, 
  MissionPlan,
  OrbitCalculation,
  RendezvousCalculation,
  ReentryCalculation
} from './utils/orbitalMath';
import { telemetryAudio } from './utils/audio';

export default function App() {
  const [activeExperiment, setActiveExperiment] = useState<ExperimentType>('orbit');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Experiment 1 State
  const [orbitAltitudeKm, setOrbitAltitudeKm] = useState<number>(300);
  const [orbitData, setOrbitData] = useState<OrbitCalculation>(() => calculateOrbit(300));
  const [hasCalculatedOrbit, setHasCalculatedOrbit] = useState<boolean>(false);

  // Experiment 2 State
  const [phaseAngleDeg, setPhaseAngleDeg] = useState<number>(0);
  const [chaserAltKm, setChaserAltKm] = useState<number>(275);
  const [deltaVMs, setDeltaVMs] = useState<number>(10);
  const [rendezvousData, setRendezvousData] = useState<RendezvousCalculation>(() => 
    calculateRendezvous(300, 275, 0, 10)
  );

  // Experiment 3 State
  const [retroDeltaVMs, setRetroDeltaVMs] = useState<number>(135);
  const [entryAngleDeg, setEntryAngleDeg] = useState<number>(-6.3);
  const [timingOffsetSec, setTimingOffsetSec] = useState<number>(0);
  const [reentryData, setReentryData] = useState<ReentryCalculation>(() =>
    calculateReentry(135, -6.3, 0)
  );
  const [reentryProgress, setReentryProgress] = useState<number>(0.1);

  // Re-entry animation timer
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlaying && activeExperiment === 'reentry') {
        setReentryProgress((prev) => (prev + dt * 0.12) % 1.0);
      }
      if (isPlaying && activeExperiment === 'reentry') {
        animId = requestAnimationFrame(loop);
      }
    };

    if (isPlaying && activeExperiment === 'reentry') {
      animId = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, activeExperiment]);

  // Handlers for Experiment 1
  const handleAltitudeChange = (alt: number) => {
    setOrbitAltitudeKm(alt);
    setOrbitData(calculateOrbit(alt));
    telemetryAudio.playClick();
  };

  const handleCalculateOrbit = () => {
    setOrbitData(calculateOrbit(orbitAltitudeKm));
    setHasCalculatedOrbit(true);
    telemetryAudio.playQuindarBeep();
  };

  const handleResetOrbit = () => {
    setOrbitAltitudeKm(300);
    setOrbitData(calculateOrbit(300));
    setHasCalculatedOrbit(false);
    telemetryAudio.playClick();
  };

  // Handlers for Experiment 2
  const handlePhaseAngleChange = (angle: number) => {
    setPhaseAngleDeg(angle);
    setRendezvousData(calculateRendezvous(300, chaserAltKm, angle, deltaVMs));
    telemetryAudio.playClick();
  };

  const handleChaserAltChange = (alt: number) => {
    setChaserAltKm(alt);
    setRendezvousData(calculateRendezvous(300, alt, phaseAngleDeg, deltaVMs));
    telemetryAudio.playClick();
  };

  const handleDeltaVChange = (dv: number) => {
    setDeltaVMs(dv);
    setRendezvousData(calculateRendezvous(300, chaserAltKm, phaseAngleDeg, dv));
    telemetryAudio.playClick();
  };

  const handleCalculateRendezvous = () => {
    setRendezvousData(calculateRendezvous(300, chaserAltKm, phaseAngleDeg, deltaVMs));
    telemetryAudio.playQuindarBeep();
  };

  const handleResetRendezvous = () => {
    setPhaseAngleDeg(0);
    setChaserAltKm(275);
    setDeltaVMs(10);
    setRendezvousData(calculateRendezvous(300, 275, 0, 10));
    telemetryAudio.playClick();
  };

  // Handlers for Experiment 3
  const handleRetroDeltaVChange = (dv: number) => {
    setRetroDeltaVMs(dv);
    setReentryData(calculateReentry(dv, entryAngleDeg, timingOffsetSec));
    telemetryAudio.playClick();
  };

  const handleEntryAngleChange = (angle: number) => {
    setEntryAngleDeg(angle);
    setReentryData(calculateReentry(retroDeltaVMs, angle, timingOffsetSec));
    telemetryAudio.playClick();
  };

  const handleTimingOffsetChange = (offset: number) => {
    setTimingOffsetSec(offset);
    setReentryData(calculateReentry(retroDeltaVMs, entryAngleDeg, offset));
    telemetryAudio.playClick();
  };

  const handleCalculateReentry = () => {
    setReentryData(calculateReentry(retroDeltaVMs, entryAngleDeg, timingOffsetSec));
    setReentryProgress(0.01);
    telemetryAudio.playQuindarBeep();
  };

  const handleResetReentry = () => {
    setRetroDeltaVMs(135);
    setEntryAngleDeg(-6.3);
    setTimingOffsetSec(0);
    setReentryData(calculateReentry(135, -6.3, 0));
    setReentryProgress(0.1);
    telemetryAudio.playClick();
  };

  // Challenge Apply to Simulation
  const handleApplyMissionPlan = (plan: MissionPlan) => {
    setOrbitAltitudeKm(plan.orbitAltKm);
    setOrbitData(calculateOrbit(plan.orbitAltKm));

    setPhaseAngleDeg(plan.phaseAngleDeg);
    setChaserAltKm(plan.orbitAltKm);
    setDeltaVMs(plan.rendezvousBurnMs);
    setRendezvousData(calculateRendezvous(300, plan.orbitAltKm, plan.phaseAngleDeg, plan.rendezvousBurnMs));

    setEntryAngleDeg(plan.retroAngleDeg);
    setRetroDeltaVMs(plan.retroDeltaVMs);
    setReentryData(calculateReentry(plan.retroDeltaVMs, plan.retroAngleDeg, 0));
    setReentryProgress(0.05);

    telemetryAudio.playQuindarBeep();
  };

  // Reset active experiment
  const handleGlobalReset = () => {
    if (activeExperiment === 'orbit') handleResetOrbit();
    else if (activeExperiment === 'rendezvous') handleResetRendezvous();
    else if (activeExperiment === 'reentry') handleResetReentry();
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    telemetryAudio.setEnabled(next);
    if (next) telemetryAudio.playQuindarBeep();
  };

  return (
    <div className="w-full h-screen bg-[#040711] text-slate-100 flex flex-col font-sans overflow-hidden select-none">
      {/* Presentation Slide Header */}
      <Header
        activeExperiment={activeExperiment}
        onSelectExperiment={(exp) => {
          setActiveExperiment(exp);
          telemetryAudio.playClick();
        }}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onReset={handleGlobalReset}
        onOpenHistory={() => setIsHistoryOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main Workspace (16:9 Landscape Layout) */}
      <main className="flex-1 min-h-0 p-2.5 md:p-3.5 grid grid-cols-1 lg:grid-cols-12 gap-2.5 md:gap-3.5 overflow-hidden">
        {/* Left / Center: Interactive Aerospace Canvas (7 Columns on large screens) */}
        <section 
          className="lg:col-span-7 h-[42vh] lg:h-full flex flex-col min-h-0 relative"
          aria-label="Aerospace Canvas Simulation"
        >
          <SpaceCanvas
            experiment={activeExperiment}
            isPlaying={isPlaying}
            orbitData={orbitData}
            rendezvousData={rendezvousData}
            reentryData={reentryData}
            reentryProgress={reentryProgress}
          />
        </section>

        {/* Right Console: Mission Control Panel (5 Columns on large screens) */}
        <section 
          className="lg:col-span-5 flex-1 lg:h-full flex flex-col min-h-0 relative"
          aria-label="Mission Control Telemetry Controls"
        >
          {activeExperiment === 'orbit' && (
            <OrbitCalculatorPanel
              altitudeKm={orbitAltitudeKm}
              onAltitudeChange={handleAltitudeChange}
              orbitData={orbitData}
              onCalculate={handleCalculateOrbit}
              onReset={handleResetOrbit}
              hasCalculated={hasCalculatedOrbit}
            />
          )}

          {activeExperiment === 'rendezvous' && (
            <RendezvousPanel
              phaseAngleDeg={phaseAngleDeg}
              onPhaseAngleChange={handlePhaseAngleChange}
              chaserAltKm={chaserAltKm}
              onChaserAltChange={handleChaserAltChange}
              deltaVMs={deltaVMs}
              onDeltaVChange={handleDeltaVChange}
              rendezvousData={rendezvousData}
              onCalculate={handleCalculateRendezvous}
              onReset={handleResetRendezvous}
            />
          )}

          {activeExperiment === 'reentry' && (
            <ReentryPanel
              retroDeltaVMs={retroDeltaVMs}
              onRetroDeltaVChange={handleRetroDeltaVChange}
              entryAngleDeg={entryAngleDeg}
              onEntryAngleChange={handleEntryAngleChange}
              timingOffsetSec={timingOffsetSec}
              onTimingOffsetChange={handleTimingOffsetChange}
              reentryData={reentryData}
              onCalculate={handleCalculateReentry}
              onReset={handleResetReentry}
            />
          )}

          {activeExperiment === 'mission' && (
            <MissionChallengePanel
              onApplyPlanToSim={handleApplyMissionPlan}
            />
          )}
        </section>
      </main>

      {/* Bottom Mission Control Status Ribbon */}
      <footer className="shrink-0 h-7 bg-[#050917] border-t border-slate-800/80 px-3.5 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            MISSION STATUS: NOMINAL
          </span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline text-slate-400">
            NASA LANGLEY HUMAN COMPUTER UNIT
          </span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-slate-400">
            PROJECT MERCURY / APOLLO
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          <span className="hidden lg:inline text-slate-500">
            * Educational simulation of orbital mechanics principles
          </span>
          <span className="text-amber-400/90 font-bold">
            16:9 GAMMA PRESENTATION SLIDE
          </span>
        </div>
      </footer>

      {/* Historical Context Modal */}
      <HistoricalModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
}
