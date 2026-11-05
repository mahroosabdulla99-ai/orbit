import React from 'react';
import { X, BookOpen, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';

interface HistoricalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoricalModal: React.FC<HistoricalModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-dialog-title"
    >
      <div className="bg-[#080d1e] border border-cyan-500/40 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_0_35px_rgba(6,182,212,0.25)] text-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between bg-[#0a1228]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 id="history-dialog-title" className="text-base font-bold font-display uppercase tracking-wide text-cyan-300">
                Katherine Johnson: NASA Mathematics Briefing
              </h2>
              <p className="text-xs text-slate-400">
                Langley Research Center · Space Task Group · Project Mercury & Apollo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            aria-label="Close historical briefing"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-4 text-xs md:text-sm leading-relaxed text-slate-300">
          {/* Prominent Educational Notice */}
          <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-cyan-300 text-xs font-mono uppercase tracking-wider">
                Educational Simulation Notice
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                All simulated models, sliders, and numerical readouts in this laboratory are simplified educational examples illustrating the physics of orbital mechanics. They do not claim to reproduce NASA's confidential historical raw flight tapes or Katherine Johnson's classified original handwritten worksheets.
              </p>
            </div>
          </div>

          {/* Historical Fact 1: Project Mercury */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              1. Project Mercury: Freedom 7 and Friendship 7
            </h3>
            <p className="text-slate-300">
              In 1961, Katherine Johnson calculated the trajectory for Alan Shepard’s suborbital flight on <em>Freedom 7</em>—America’s first human in space. In 1962, before John Glenn became the first American to orbit Earth in <em>Friendship 7</em>, NASA introduced electronic IBM 7090 computers. Wary of computer glitches, Glenn personally requested that Johnson verify the computer's calculations by hand: <em>"If she says they're good, then I'm ready to go."</em>
            </p>
          </div>

          {/* Historical Fact 2: Trajectory & Launch Windows */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              2. NASA Technical Report TN D-233 (1960)
            </h3>
            <p className="text-slate-300">
              Co-authored with engineer Ted Skopinski, this foundational report established the geometry and mathematical equations for satellite orbital burnout and precise ground tracking. It marked the first time a woman in NASA's Flight Research Division received author credit on a published technical paper.
            </p>
          </div>

          {/* Historical Fact 3: Apollo Moon Landings & Rendezvous */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              3. Apollo Lunar Orbit Rendezvous & Emergency Return
            </h3>
            <p className="text-slate-300">
              Her calculations synchronized the rendezvous between the Apollo Lunar Module rising from the Moon’s surface and the Command Service Module in lunar orbit. Later, during the 1970 <em>Apollo 13</em> crisis, her backup trajectory charts and star tables helped guide the crippled spacecraft and its crew safely back to Earth.
            </p>
          </div>

          {/* Legacy Quote */}
          <div className="p-4 rounded-xl bg-[#091124] border border-amber-500/30 text-amber-200/90 font-mono text-xs">
            <div className="text-amber-400 font-bold mb-1 font-display">KATHERINE JOHNSON (1918 – 2020)</div>
            <p className="italic">
              "You could not afford to make a mistake... Everything was so new, the whole idea of going into space, and there were no textbooks. We had to write them as we went along."
            </p>
            <div className="text-[11px] text-slate-400 mt-2">
              Awarded Presidential Medal of Freedom (2015) · NASA Congressional Gold Medal (2019)
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0a1228] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-colors"
          >
            Return to Mission Lab
          </button>
        </div>
      </div>
    </div>
  );
};
