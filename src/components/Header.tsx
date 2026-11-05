import React from 'react';
import { 
  Orbit, 
  GitMerge, 
  ShieldAlert, 
  Award, 
  BookOpen, 
  RotateCcw,
  Volume2,
  VolumeX,
  Play,
  Pause
} from 'lucide-react';

export type ExperimentType = 'orbit' | 'rendezvous' | 'reentry' | 'mission';

interface HeaderProps {
  activeExperiment: ExperimentType;
  onSelectExperiment: (exp: ExperimentType) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onOpenHistory: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeExperiment,
  onSelectExperiment,
  isPlaying,
  onTogglePlay,
  onReset,
  onOpenHistory,
  soundEnabled,
  onToggleSound,
}) => {
  const tabs = [
    {
      id: 'orbit' as ExperimentType,
      label: '01. Orbit Calculator',
      shortLabel: 'Orbit',
      icon: Orbit,
      desc: 'Speed & Period'
    },
    {
      id: 'rendezvous' as ExperimentType,
      label: '02. Spacecraft Rendezvous',
      shortLabel: 'Rendezvous',
      icon: GitMerge,
      desc: 'Phasing & Intercept'
    },
    {
      id: 'reentry' as ExperimentType,
      label: '03. Safe Return Trajectory',
      shortLabel: 'Safe Return',
      icon: ShieldAlert,
      desc: 'Corridor & Splashdown'
    },
    {
      id: 'mission' as ExperimentType,
      label: '04. Plan The Mission',
      shortLabel: 'Challenge',
      icon: Award,
      desc: 'Flight Certification'
    },
  ];

  return (
    <header className="shrink-0 h-14 bg-[#070b18]/95 border-b border-cyan-900/30 px-3 md:px-5 flex items-center justify-between gap-2 md:gap-4 select-none relative z-20 backdrop-blur-md">
      {/* Brand & Presentation Title */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
          <Orbit className="w-4 h-4 animate-spin-slow" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm md:text-base font-bold font-display uppercase tracking-wider text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
              Katherine Johnson
            </h1>
            <span className="hidden sm:inline text-xs font-semibold px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-400/90 font-mono">
              NASA 1962
            </span>
          </div>
          <p className="text-[10px] md:text-xs text-slate-400 font-mono tracking-tight hidden sm:block">
            The Mathematics That Took Us to Space · Human Computer Lab
          </p>
        </div>
      </div>

      {/* Experiment Selector Navigation */}
      <nav 
        className="flex items-center gap-1 bg-[#091124] p-1 rounded-lg border border-slate-800/80 shrink-0"
        aria-label="Experiment navigation"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeExperiment === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectExperiment(tab.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
              }`}
              title={tab.desc}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span className="hidden lg:inline">{tab.label}</span>
              <span className="lg:hidden">{tab.shortLabel}</span>
            </button>
          );
        })}
      </nav>

      {/* Global Utilities */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onTogglePlay}
          className={`p-1.5 rounded-md border text-xs font-mono transition-colors flex items-center gap-1 ${
            isPlaying 
              ? 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700/60' 
              : 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
          }`}
          title={isPlaying ? 'Pause simulation animation' : 'Resume simulation animation'}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span className="hidden xl:inline">{isPlaying ? 'Pause' : 'Play'}</span>
        </button>

        <button
          onClick={onReset}
          className="p-1.5 rounded-md border border-slate-800 bg-[#0b1329] text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 text-xs transition-colors"
          title="Reset current experiment to baseline"
          aria-label="Reset experiment"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onToggleSound}
          className={`p-1.5 rounded-md border text-xs transition-colors hidden sm:flex items-center ${
            soundEnabled
              ? 'border-cyan-500/30 text-cyan-400 bg-cyan-950/40'
              : 'border-slate-800 text-slate-500 bg-[#0b1329]'
          }`}
          title={soundEnabled ? 'Mute telemetry audio' : 'Enable telemetry audio'}
          aria-label="Toggle telemetry sound"
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={onOpenHistory}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs font-medium transition-all shadow-[0_0_8px_rgba(245,158,11,0.15)]"
          title="Katherine Johnson's historic NASA contributions"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">History & Notes</span>
        </button>
      </div>
    </header>
  );
};
