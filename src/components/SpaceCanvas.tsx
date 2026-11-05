import React, { useEffect, useRef, useState } from 'react';
import { 
  OrbitCalculation, 
  RendezvousCalculation, 
  ReentryCalculation,
  EARTH_RADIUS_KM
} from '../utils/orbitalMath';
import { ExperimentType } from './Header';
import { Eye, Compass, Zap, RotateCcw } from 'lucide-react';

interface SpaceCanvasProps {
  experiment: ExperimentType;
  isPlaying: boolean;
  orbitData: OrbitCalculation;
  rendezvousData: RendezvousCalculation;
  reentryData: ReentryCalculation;
  reentryProgress: number; // 0 to 1 for animated re-entry descent
  onTriggerReentryAnim?: () => void;
}

export const SpaceCanvas: React.FC<SpaceCanvasProps> = ({
  experiment,
  isPlaying,
  orbitData,
  rendezvousData,
  reentryData,
  reentryProgress,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  // Canvas visual toggles
  const [showVectors, setShowVectors] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showTrails, setShowTrails] = useState(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);

  // Spacecraft orbital angles (radians)
  const orbitAngleRef = useRef<number>(0);
  const targetAngleRef = useRef<number>(0.8);
  const chaserAngleRef = useRef<number>(0.2);

  // Orbit trail history
  const trailRef = useRef<Array<{ x: number; y: number; alpha: number }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTimestamp = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTimestamp) / 1000, 0.1);
      lastTimestamp = now;

      if (isPlaying) {
        timeRef.current += dt * simSpeed;
      }

      // Handle High-DPI
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width;
      const height = rect.height;

      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Deep space background gradient
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, Math.max(width, height) * 0.8);
      bgGrad.addColorStop(0, '#060a17');
      bgGrad.addColorStop(0.6, '#040711');
      bgGrad.addColorStop(1, '#020308');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Render subtle starfield
      drawStars(ctx, width, height);

      // Render grid/radar circles if enabled
      if (showGrid) {
        drawTelemetryGrid(ctx, width, height, experiment);
      }

      // Render experiment-specific visuals
      if (experiment === 'orbit' || experiment === 'mission') {
        renderOrbitExperiment(ctx, width, height, dt);
      } else if (experiment === 'rendezvous') {
        renderRendezvousExperiment(ctx, width, height, dt);
      } else if (experiment === 'reentry') {
        renderReentryExperiment(ctx, width, height);
      }

      ctx.restore();

      if (isPlaying) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    render(performance.now());

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [experiment, isPlaying, orbitData, rendezvousData, reentryData, reentryProgress, showVectors, showGrid, showTrails, simSpeed]);

  // Starfield helper with seeded random positions
  const drawStars = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    // Draw 70 crisp stars
    const seed = 42;
    for (let i = 0; i < 70; i++) {
      const x = (Math.sin(i * 99 + seed) * 0.5 + 0.5) * width;
      const y = (Math.cos(i * 33 + seed) * 0.5 + 0.5) * height;
      const r = (i % 5 === 0) ? 1.5 : (i % 3 === 0) ? 1.0 : 0.6;
      const twinkle = Math.sin(timeRef.current * 2 + i) * 0.2 + 0.8;
      ctx.fillStyle = `rgba(186, 230, 253, ${0.4 * twinkle})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Telemetry coordinate grid
  const drawTelemetryGrid = (ctx: CanvasRenderingContext2D, width: number, height: number, mode: ExperimentType) => {
    ctx.strokeStyle = 'rgba(14, 165, 233, 0.08)';
    ctx.lineWidth = 1;

    if (mode === 'reentry') {
      // Linear height altitude grid for re-entry
      for (let y = 40; y < height - 40; y += 40) {
        ctx.beginPath();
        ctx.moveTo(30, y);
        ctx.lineTo(width - 30, y);
        ctx.stroke();
      }
      return;
    }

    // Concentric orbital distance range rings
    const cx = width / 2;
    const cy = height / 2;
    const maxRadius = Math.min(width, height) * 0.46;

    for (let r = 80; r <= maxRadius; r += 50) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Radial coordinate axes
    ctx.strokeStyle = 'rgba(14, 165, 233, 0.05)';
    ctx.beginPath();
    ctx.moveTo(cx - maxRadius, cy);
    ctx.lineTo(cx + maxRadius, cy);
    ctx.moveTo(cx, cy - maxRadius);
    ctx.lineTo(cx, cy + maxRadius);
    ctx.stroke();
  };

  // Render Earth sphere
  const drawEarth = (ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) => {
    // Outer atmospheric glow
    const atmosGrad = ctx.createRadialGradient(cx, cy, radius * 0.95, cx, cy, radius * 1.25);
    atmosGrad.addColorStop(0, 'rgba(6, 182, 212, 0.45)');
    atmosGrad.addColorStop(0.5, 'rgba(14, 165, 233, 0.15)');
    atmosGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
    ctx.fillStyle = atmosGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.25, 0, Math.PI * 2);
    ctx.fill();

    // Earth Body
    const earthGrad = ctx.createRadialGradient(cx - radius * 0.35, cy - radius * 0.35, radius * 0.1, cx, cy, radius);
    earthGrad.addColorStop(0, '#1e40af'); // Sunlit ocean
    earthGrad.addColorStop(0.5, '#0f172a'); // Mid tone ocean
    earthGrad.addColorStop(1, '#020617'); // Dark limb
    ctx.fillStyle = earthGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Earth Continents silhouette (vector stylization)
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 1, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = '#10b98126'; // Emerald/cyan landmass outline
    ctx.strokeStyle = '#06b6d440';
    ctx.lineWidth = 1.5;

    // Stylized landmass blobs
    const continents = [
      { x: cx - radius * 0.4, y: cy - radius * 0.2, rx: radius * 0.35, ry: radius * 0.25 },
      { x: cx + radius * 0.3, y: cy - radius * 0.1, rx: radius * 0.4, ry: radius * 0.3 },
      { x: cx - radius * 0.1, y: cy + radius * 0.35, rx: radius * 0.3, ry: radius * 0.22 },
    ];

    continents.forEach(c => {
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, c.rx, c.ry, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // Terminator line (Day/Night shadow)
    const shadowGrad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
    shadowGrad.addColorStop(0, 'rgba(2, 6, 23, 0)');
    shadowGrad.addColorStop(0.55, 'rgba(2, 6, 23, 0.25)');
    shadowGrad.addColorStop(1, 'rgba(2, 6, 23, 0.85)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Thin atmospheric rim
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  };

  // ----------------------------------------------------
  // EXPERIMENT 1: ORBIT CALCULATOR RENDERER
  // ----------------------------------------------------
  const renderOrbitExperiment = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number,
    dt: number
  ) => {
    const cx = width / 2;
    const cy = height / 2;

    const earthR = Math.min(width, height) * 0.22;
    drawEarth(ctx, cx, cy, earthR);

    // Orbital radius mapped dynamically
    // Min altitude 150 km -> earthR + 30px, Max altitude 1200 km -> earthR + 130px
    const maxPixelAlt = Math.min(width, height) * 0.22;
    const orbitPixelRadius = earthR + 25 + ((orbitData.altitudeKm - 150) / 1050) * maxPixelAlt;

    // Draw Orbit Path
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(cx, cy, orbitPixelRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Update capsule angle based on orbital period: higher orbit = slower angular rate!
    // Real period ~ 90 min (5400s). In sim, period scales from 8s to 18s
    const simOrbitalPeriod = 7 + (orbitData.periodMinutes / 120) * 11;
    if (isPlaying) {
      orbitAngleRef.current += ((2 * Math.PI) / simOrbitalPeriod) * dt * simSpeed;
    }
    const angle = orbitAngleRef.current;

    const shipX = cx + Math.cos(angle) * orbitPixelRadius;
    const shipY = cy + Math.sin(angle) * orbitPixelRadius;

    // Orbit trail history
    if (showTrails) {
      trailRef.current.push({ x: shipX, y: shipY, alpha: 1.0 });
      if (trailRef.current.length > 50) trailRef.current.shift();

      ctx.save();
      for (let i = 0; i < trailRef.current.length; i++) {
        const pt = trailRef.current[i];
        const ageAlpha = (i / trailRef.current.length) * 0.6;
        ctx.fillStyle = `rgba(6, 182, 212, ${ageAlpha})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Altitude measurement line
    const earthSurfaceX = cx + Math.cos(angle) * earthR;
    const earthSurfaceY = cy + Math.sin(angle) * earthR;
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(earthSurfaceX, earthSurfaceY);
    ctx.lineTo(shipX, shipY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Spacecraft (Project Mercury Capsule)
    drawCapsule(ctx, shipX, shipY, angle + Math.PI / 2, '#38bdf8', '#0284c7');

    // Tangent velocity vector
    if (showVectors) {
      const vVectorLen = 35 + (orbitData.speedKmS - 7.2) * 20;
      const vx = shipX - Math.sin(angle) * vVectorLen;
      const vy = shipY + Math.cos(angle) * vVectorLen;

      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(shipX, shipY);
      ctx.lineTo(vx, vy);
      ctx.stroke();

      // Arrowhead
      drawArrowHead(ctx, vx, vy, Math.atan2(vy - shipY, vx - shipX), '#06b6d4');

      // Vector label
      ctx.fillStyle = '#67e8f9';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(`v = ${orbitData.speedKmS} km/s`, vx + 8, vy);
    }

    // Telemetry label on canvas
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
    ctx.lineWidth = 1;
    ctx.fillRect(16, 16, 195, 82);
    ctx.strokeRect(16, 16, 195, 82);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText('ACTIVE ORBIT TELEMETRY', 26, 32);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillText(`ALTITUDE: ${orbitData.altitudeKm} km`, 26, 48);
    ctx.fillText(`VELOCITY: ${orbitData.speedKmS} km/s (${orbitData.speedMph.toLocaleString()} mph)`, 26, 64);
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`PERIOD:   ${orbitData.periodMinutes} min (${orbitData.periodHours} h)`, 26, 80);
  };

  // ----------------------------------------------------
  // EXPERIMENT 2: SPACECRAFT RENDEZVOUS RENDERER
  // ----------------------------------------------------
  const renderRendezvousExperiment = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dt: number
  ) => {
    const cx = width / 2;
    const cy = height / 2;

    const earthR = Math.min(width, height) * 0.20;
    drawEarth(ctx, cx, cy, earthR);

    // Radii of Target and Chaser
    const targetPixelR = earthR + 55;
    const chaserPixelR = earthR + 35 + ((rendezvousData.chaserAltKm - 200) / 250) * 45;

    // Target Orbit Ring (Amber)
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.arc(cx, cy, targetPixelR, 0, Math.PI * 2);
    ctx.stroke();

    // Chaser Orbit Ring (Cyan)
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.beginPath();
    ctx.arc(cx, cy, chaserPixelR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Update positions:
    // Target moves at nominal target angular velocity
    const targetOmega = 0.45;
    // Chaser angular velocity depends on altitude: lower = faster angular velocity!
    const chaserOmega = targetOmega * Math.pow(targetPixelR / chaserPixelR, 1.5) + (rendezvousData.deltaVMs / 500);

    if (isPlaying) {
      targetAngleRef.current += targetOmega * dt * simSpeed;
      chaserAngleRef.current += chaserOmega * dt * simSpeed;
    }

    const tAngle = targetAngleRef.current;
    // Initial phase angle offset applied
    const cAngle = chaserAngleRef.current + (rendezvousData.initialPhaseAngleDeg * Math.PI) / 180;

    const targetX = cx + Math.cos(tAngle) * targetPixelR;
    const targetY = cy + Math.sin(tAngle) * targetPixelR;

    const chaserX = cx + Math.cos(cAngle) * chaserPixelR;
    const chaserY = cy + Math.sin(cAngle) * chaserPixelR;

    // Proximity Radar Line
    const distPx = Math.hypot(targetX - chaserX, targetY - chaserY);
    const isDocked = rendezvousData.isDockingFeasible && distPx < 28;

    ctx.strokeStyle = isDocked ? 'rgba(52, 211, 153, 0.8)' : 'rgba(245, 158, 11, 0.6)';
    ctx.lineWidth = isDocked ? 2 : 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(targetX, targetY);
    ctx.lineTo(chaserX, chaserY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Range circle around target
    ctx.strokeStyle = isDocked ? 'rgba(52, 211, 153, 0.4)' : 'rgba(245, 158, 11, 0.2)';
    ctx.beginPath();
    ctx.arc(targetX, targetY, 28, 0, Math.PI * 2);
    ctx.stroke();

    // Draw Target Satellite (Agena Target Vehicle / Lunar Module)
    drawSatellite(ctx, targetX, targetY, tAngle + Math.PI / 2, '#fbbf24', 'TARGET VEHICLE');

    // Draw Chaser Capsule (Gemini / Apollo CSM)
    drawCapsule(ctx, chaserX, chaserY, cAngle + Math.PI / 2, '#38bdf8', '#0284c7', 'CHASER');

    // Docking capture animation if docked
    if (isDocked) {
      const pulse = Math.sin(timeRef.current * 8) * 4 + 20;
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc((targetX + chaserX) / 2, (targetY + chaserY) / 2, pulse, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.fillText('DOCKING LATCH ENGAGED', (targetX + chaserX) / 2 + 15, (targetY + chaserY) / 2 - 15);
    }

    // Telemetry Box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = isDocked ? 'rgba(52, 211, 153, 0.5)' : 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 1;
    ctx.fillRect(16, 16, 230, 94);
    ctx.strokeRect(16, 16, 230, 94);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText('PROXIMITY RADAR INTERCEPT', 26, 32);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillText(`TARGET ALT: ${rendezvousData.targetAltKm} km`, 26, 48);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`CHASER ALT: ${rendezvousData.chaserAltKm} km (Δv: ${rendezvousData.deltaVMs} m/s)`, 26, 64);
    ctx.fillStyle = isDocked ? '#34d399' : '#f59e0b';
    ctx.fillText(`RANGE: ${rendezvousData.minSeparationKm} km (${rendezvousData.relativeVelocityMs} m/s)`, 26, 80);
    ctx.font = '10px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = isDocked ? '#6ee7b7' : '#fcd34d';
    ctx.fillText(isDocked ? 'STATUS: CAPTURE ACHIEVED' : 'STATUS: PHASING DRIFT', 26, 96);
  };

  // ----------------------------------------------------
  // EXPERIMENT 3: SAFE RETURN TRAJECTORY RENDERER
  // ----------------------------------------------------
  const renderReentryExperiment = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    // Re-entry profile: atmospheric curvature from space (top) to ocean splashdown (bottom)
    const oceanY = height - 70;
    const entryInterfaceY = 90;
    const midAtmosY = (oceanY + entryInterfaceY) / 2;

    // Atmospheric layer bands with gradient
    // Safe corridor band (highlighted zone)
    const corridorTop = entryInterfaceY + (oceanY - entryInterfaceY) * 0.28;
    const corridorBottom = entryInterfaceY + (oceanY - entryInterfaceY) * 0.72;

    const atmosGrad = ctx.createLinearGradient(0, entryInterfaceY, 0, oceanY);
    atmosGrad.addColorStop(0, 'rgba(6, 182, 212, 0.05)'); // Space boundary 122 km
    atmosGrad.addColorStop(0.3, 'rgba(14, 165, 233, 0.15)'); // Mesosphere
    atmosGrad.addColorStop(0.7, 'rgba(30, 58, 138, 0.35)'); // Stratosphere
    atmosGrad.addColorStop(1, 'rgba(15, 23, 42, 0.9)'); // Troposphere
    ctx.fillStyle = atmosGrad;
    ctx.fillRect(40, entryInterfaceY, width - 80, oceanY - entryInterfaceY);

    // Ocean Surface at bottom
    ctx.fillStyle = '#0f2b48';
    ctx.fillRect(40, oceanY, width - 80, height - oceanY);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(40, oceanY);
    ctx.lineTo(width - 80, oceanY);
    ctx.stroke();

    // Ocean waves animation
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 1;
    for (let x = 50; x < width - 90; x += 30) {
      const wave = Math.sin(timeRef.current * 3 + x * 0.05) * 2;
      ctx.beginPath();
      ctx.arc(x, oceanY + 8 + wave, 6, Math.PI, 0);
      ctx.stroke();
    }

    // US Navy Recovery Ship (USS Noa / USS Randolph) in Ocean
    const recoveryShipX = width * 0.65;
    drawRecoveryShip(ctx, recoveryShipX, oceanY);

    // Entry Interface line (122 km / 400,000 ft)
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(40, entryInterfaceY);
    ctx.lineTo(width - 80, entryInterfaceY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#67e8f9';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText('ENTRY INTERFACE (122 km / 400,000 ft)', 50, entryInterfaceY - 6);

    // Safe Corridor visual envelope (-5.5° to -7.2°)
    ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, entryInterfaceY);
    ctx.lineTo(width * 0.75, oceanY);
    ctx.lineTo(width * 0.55, oceanY);
    ctx.lineTo(50, entryInterfaceY);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#34d399';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText('SAFE RE-ENTRY CORRIDOR (γ = -5.5° to -7.2°)', width * 0.35, midAtmosY - 15);

    // Re-entry Trajectory Curve calculation
    // Start at top left, curve downwards based on entryAngleDeg
    const angle = Math.abs(reentryData.entryAngleDeg); // 4.0 to 9.0
    const startX = 60;
    const startY = 50;

    // Bezier control points dictated by flight path angle
    // Shallow: flies long, skips up or overshoots
    // Steep: plunges straight down fast
    // Nominal: lands on recovery ship
    let endX = recoveryShipX;
    let endY = oceanY;
    let ctrl1X = startX + 180;
    let ctrl1Y = entryInterfaceY + 10;
    let ctrl2X = width * 0.5;
    let ctrl2Y = oceanY - 80;

    if (reentryData.outcome === 'skip_off') {
      // Skips out of atmosphere
      endX = width - 60;
      endY = entryInterfaceY - 30;
      ctrl1X = width * 0.35;
      ctrl1Y = entryInterfaceY + 40;
      ctrl2X = width * 0.65;
      ctrl2Y = entryInterfaceY + 10;
    } else if (reentryData.outcome === 'excessive_g_burnup') {
      // Steep crash down
      endX = width * 0.38;
      endY = oceanY;
      ctrl1X = startX + 80;
      ctrl1Y = entryInterfaceY + 80;
      ctrl2X = width * 0.32;
      ctrl2Y = oceanY - 40;
    } else {
      // Safe corridor landing near recovery ship
      endX = recoveryShipX + (reentryData.timingOffsetSec * 1.5);
      endY = oceanY;
      ctrl1X = startX + 160;
      ctrl1Y = entryInterfaceY + 40;
      ctrl2X = endX - 80;
      ctrl2Y = oceanY - 60;
    }

    // Draw the Trajectory Curve
    ctx.strokeStyle = 
      reentryData.outcome === 'safe_splashdown' ? '#10b981' :
      reentryData.outcome === 'skip_off' ? '#38bdf8' : '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, endX, endY);
    ctx.stroke();

    // Position of capsule along the curve driven by reentryProgress (0 to 1)
    const t = isPlaying ? (reentryProgress % 1.0) : 0.65;
    const capsulePos = getCubicBezierXY(startX, startY, ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, endX, endY, t);

    // Tangent angle
    const tNext = Math.min(1, t + 0.02);
    const capsuleNext = getCubicBezierXY(startX, startY, ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, endX, endY, tNext);
    const tangentAngle = Math.atan2(capsuleNext.y - capsulePos.y, capsuleNext.x - capsulePos.x);

    // Plasma ionization fire plume during hypersonic re-entry
    if (t > 0.15 && t < 0.85 && reentryData.outcome !== 'skip_off') {
      const plumeGrad = ctx.createRadialGradient(capsulePos.x, capsulePos.y, 5, capsulePos.x, capsulePos.y, 25);
      const isExtreme = reentryData.outcome === 'excessive_g_burnup';
      plumeGrad.addColorStop(0, isExtreme ? 'rgba(239, 68, 68, 0.9)' : 'rgba(245, 158, 11, 0.8)');
      plumeGrad.addColorStop(0.5, isExtreme ? 'rgba(249, 115, 22, 0.5)' : 'rgba(251, 191, 36, 0.4)');
      plumeGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = plumeGrad;
      ctx.beginPath();
      ctx.arc(capsulePos.x, capsulePos.y, 24, 0, Math.PI * 2);
      ctx.fill();
    }

    // Parachute deployment near water for safe return
    if (t > 0.82 && reentryData.outcome === 'safe_splashdown') {
      drawParachute(ctx, capsulePos.x, capsulePos.y - 20, '#ef4444', '#f8fafc');
    }

    // Draw the returning capsule
    drawCapsule(ctx, capsulePos.x, capsulePos.y, tangentAngle, '#f8fafc', '#0284c7');

    // Outcome HUD banner
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = 
      reentryData.outcome === 'safe_splashdown' ? 'rgba(16, 185, 129, 0.5)' :
      reentryData.outcome === 'skip_off' ? 'rgba(56, 189, 248, 0.5)' : 'rgba(239, 68, 68, 0.5)';
    ctx.lineWidth = 1;
    ctx.fillRect(16, 16, 250, 102);
    ctx.strokeRect(16, 16, 250, 102);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText('RE-ENTRY TRAJECTORY TELEMETRY', 26, 32);

    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillStyle = 
      reentryData.outcome === 'safe_splashdown' ? '#34d399' :
      reentryData.outcome === 'skip_off' ? '#38bdf8' : '#f87171';
    ctx.fillText(`FLIGHT PATH γ: ${reentryData.entryAngleDeg}°`, 26, 48);

    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(`DECELERATION: ${reentryData.peakGForce} G`, 26, 64);
    ctx.fillText(`HEAT SHIELD:  ${reentryData.peakThermalC}°C`, 26, 78);
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`DOWNRANGE:    ${reentryData.downrangeKm} km`, 26, 92);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`SPLASHDOWN:   ${reentryData.predictedCoords}`, 26, 106);
  };

  // Helper to calculate cubic bezier coordinate
  const getCubicBezierXY = (
    p0x: number, p0y: number,
    p1x: number, p1y: number,
    p2x: number, p2y: number,
    p3x: number, p3y: number,
    t: number
  ) => {
    const cx = 3 * (p1x - p0x);
    const bx = 3 * (p2x - p1x) - cx;
    const ax = p3x - p0x - cx - bx;

    const cy = 3 * (p1y - p0y);
    const by = 3 * (p2y - p1y) - cy;
    const ay = p3y - p0y - cy - by;

    const x = ax * Math.pow(t, 3) + bx * Math.pow(t, 2) + cx * t + p0x;
    const y = ay * Math.pow(t, 3) + by * Math.pow(t, 2) + cy * t + p0y;
    return { x, y };
  };

  // Draw Spacecraft Capsule (Mercury / Apollo shape)
  const drawCapsule = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    rotation: number,
    accentColor: string,
    bodyColor: string,
    label?: string
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Heat shield base
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(0, 6, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Conical capsule hull
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(-7, 5);
    ctx.lineTo(-3, -7);
    ctx.lineTo(3, -7);
    ctx.lineTo(7, 5);
    ctx.closePath();
    ctx.fill();

    // Antenna cap
    ctx.fillStyle = accentColor;
    ctx.fillRect(-2, -10, 4, 3);

    // Capsule window
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(0, -1, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    if (label) {
      ctx.fillStyle = accentColor;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText(label, x - 15, y - 14);
    }
  };

  // Draw Satellite Target Vehicle
  const drawSatellite = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    rotation: number,
    color: string,
    label?: string
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Solar panels
    ctx.fillStyle = '#0284c7';
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.fillRect(-16, -3, 9, 6);
    ctx.strokeRect(-16, -3, 9, 6);
    ctx.fillRect(7, -3, 9, 6);
    ctx.strokeRect(7, -3, 9, 6);

    // Body
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-5, -5, 10, 10);
    ctx.strokeRect(-5, -5, 10, 10);

    // Docking port cone
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-3, -5);
    ctx.lineTo(0, -9);
    ctx.lineTo(3, -5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    if (label) {
      ctx.fillStyle = color;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText(label, x - 24, y - 14);
    }
  };

  // Draw Recovery Ship (USS Noa)
  const drawRecoveryShip = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save();
    ctx.translate(x, y);

    // Hull
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(-25, 0);
    ctx.lineTo(25, 0);
    ctx.lineTo(20, 8);
    ctx.lineTo(-20, 8);
    ctx.closePath();
    ctx.fill();

    // Superstructure
    ctx.fillStyle = '#475569';
    ctx.fillRect(-10, -8, 14, 8);
    // Radar mast
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-3, -8);
    ctx.lineTo(-3, -16);
    ctx.stroke();

    // Searchlight beam toward landing area
    const searchGrad = ctx.createLinearGradient(-3, -16, -60, -80);
    searchGrad.addColorStop(0, 'rgba(251, 191, 36, 0.4)');
    searchGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = searchGrad;
    ctx.beginPath();
    ctx.moveTo(-3, -16);
    ctx.lineTo(-80, -90);
    ctx.lineTo(-40, -110);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    ctx.fillStyle = '#fbbf24';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillText('NAVY RECOVERY FLEET (USS NOA)', x - 40, y + 20);
  };

  // Draw Parachute
  const drawParachute = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color1: string,
    color2: string
  ) => {
    ctx.save();
    ctx.translate(x, y);

    // Parachute canopy dome
    ctx.fillStyle = color1;
    ctx.beginPath();
    ctx.arc(0, -10, 16, Math.PI, 0);
    ctx.fill();

    // White stripes
    ctx.fillStyle = color2;
    ctx.beginPath();
    ctx.arc(0, -10, 8, Math.PI, 0);
    ctx.fill();

    // Rigging cords
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-16, -10);
    ctx.lineTo(0, 14);
    ctx.moveTo(16, -10);
    ctx.lineTo(0, 14);
    ctx.moveTo(-6, -10);
    ctx.lineTo(0, 14);
    ctx.moveTo(6, -10);
    ctx.lineTo(0, 14);
    ctx.stroke();

    ctx.restore();
  };

  const drawArrowHead = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, color: string) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-7, -4);
    ctx.lineTo(-7, 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  return (
    <div className="relative w-full h-full bg-[#040711] overflow-hidden rounded-xl border border-slate-800/80 shadow-2xl flex flex-col">
      {/* Simulation Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full flex-1 block cursor-crosshair"
      />

      {/* Floating HUD Controls Toolbar */}
      <div className="absolute bottom-2.5 right-3 flex items-center gap-1.5 bg-[#091124]/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-800/80 text-xs font-mono z-10">
        <button
          onClick={() => setShowVectors(!showVectors)}
          className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
            showVectors ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'
          }`}
          title="Toggle velocity vector arrows"
        >
          <Zap className="w-3 h-3" />
          <span className="hidden sm:inline">Vectors</span>
        </button>

        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
            showGrid ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'
          }`}
          title="Toggle coordinate radar grid"
        >
          <Compass className="w-3 h-3" />
          <span className="hidden sm:inline">Grid</span>
        </button>

        <button
          onClick={() => setShowTrails(!showTrails)}
          className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
            showTrails ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'
          }`}
          title="Toggle orbital flight path trail"
        >
          <Eye className="w-3 h-3" />
          <span className="hidden sm:inline">Trails</span>
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <span>Speed:</span>
          {[0.5, 1, 2].map(speed => (
            <button
              key={speed}
              onClick={() => setSimSpeed(speed)}
              className={`px-1.5 py-0.5 rounded ${
                simSpeed === speed ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'hover:text-slate-200'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
