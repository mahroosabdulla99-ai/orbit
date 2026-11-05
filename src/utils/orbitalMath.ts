/**
 * Orbital Mechanics & Trajectory Calculations
 * Inspired by Katherine Johnson's mathematical work at NASA Langley / Space Task Group
 * 
 * Note: Educational interactive models illustrating physical principles.
 */

export const EARTH_RADIUS_KM = 6371; // WGS84 volumetric mean radius
export const MU_EARTH = 398600.4418; // km^3 / s^2 (Standard gravitational parameter GM)

export interface OrbitCalculation {
  altitudeKm: number;
  orbitalRadiusKm: number;
  speedKmS: number;
  speedMph: number;
  speedKmH: number;
  periodSeconds: number;
  periodMinutes: number;
  periodHours: number;
  centripetalAccel: number; // m/s^2
  atmosphericDragRegion: string;
}

/**
 * Calculates circular orbit characteristics based on Kepler's 3rd Law & Newton's gravitation
 * v = sqrt(GM / r)
 * T = 2 * pi * sqrt(r^3 / GM)
 */
export function calculateOrbit(altitudeKm: number): OrbitCalculation {
  const r = Math.max(100, EARTH_RADIUS_KM + altitudeKm);
  const v = Math.sqrt(MU_EARTH / r); // km/s
  const speedMph = v * 2236.93629;
  const speedKmH = v * 3600;
  
  const periodSeconds = 2 * Math.PI * Math.sqrt(Math.pow(r, 3) / MU_EARTH);
  const periodMinutes = periodSeconds / 60;
  const periodHours = periodSeconds / 3600;

  // a = v^2 / r (km/s^2 * 1000 -> m/s^2)
  const centripetalAccel = (Math.pow(v, 2) / r) * 1000;

  let atmosphericDragRegion = 'Low Earth Orbit (LEO)';
  if (altitudeKm < 200) {
    atmosphericDragRegion = 'Extreme Drag (Decays in hours)';
  } else if (altitudeKm < 400) {
    atmosphericDragRegion = 'Low Earth Orbit (Mercury / ISS range)';
  } else if (altitudeKm < 1000) {
    atmosphericDragRegion = 'Stable LEO (Negligible drag)';
  } else if (altitudeKm < 20000) {
    atmosphericDragRegion = 'Medium Earth Orbit (MEO)';
  } else {
    atmosphericDragRegion = 'High / Geosynchronous Orbit';
  }

  return {
    altitudeKm,
    orbitalRadiusKm: Math.round(r * 10) / 10,
    speedKmS: Math.round(v * 1000) / 1000,
    speedMph: Math.round(speedMph),
    speedKmH: Math.round(speedKmH),
    periodSeconds: Math.round(periodSeconds),
    periodMinutes: Math.round(periodMinutes * 10) / 10,
    periodHours: Math.round(periodHours * 100) / 100,
    centripetalAccel: Math.round(centripetalAccel * 100) / 100,
    atmosphericDragRegion,
  };
}

export interface RendezvousCalculation {
  targetAltKm: number;
  chaserAltKm: number;
  initialPhaseAngleDeg: number; // degrees ahead/behind
  deltaVMs: number; // m/s impulse
  transferTimeMin: number;
  minSeparationKm: number;
  relativeVelocityMs: number;
  isDockingFeasible: boolean;
  statusMessage: string;
  verdict: 'perfect_dock' | 'close_pass' | 'lagging_behind' | 'overshoot_ahead' | 'diverging';
  orbitalAdvice: string;
}

/**
 * Calculates relative orbital drift & Hohmann phasing between two spacecraft
 */
export function calculateRendezvous(
  targetAltKm: number,
  chaserAltKm: number,
  initialPhaseAngleDeg: number,
  deltaVMs: number
): RendezvousCalculation {
  const rTarget = EARTH_RADIUS_KM + targetAltKm;
  const rChaser = EARTH_RADIUS_KM + chaserAltKm;

  const vTarget = Math.sqrt(MU_EARTH / rTarget); // km/s
  const vChaser = Math.sqrt(MU_EARTH / rChaser); // km/s

  const omegaTarget = vTarget / rTarget; // rad/s
  const omegaChaser = vChaser / rChaser; // rad/s

  // Differential angular speed in rad/s
  const deltaOmega = omegaChaser - omegaTarget;

  // Base phase angle in radians
  const initialPhaseRad = (initialPhaseAngleDeg * Math.PI) / 180;

  // The deltaV affects semi-major axis of transfer orbit
  // deltaV in m/s -> km/s
  const deltaVKmS = deltaVMs / 1000;
  
  // Hohmann transfer semi-major axis approximation
  const rTransferApo = rChaser + (2 * rChaser * deltaVKmS) / vChaser;
  const aTransfer = (rChaser + rTransferApo) / 2;
  const transferHalfPeriodSec = Math.PI * Math.sqrt(Math.pow(aTransfer, 3) / MU_EARTH);
  const transferTimeMin = Math.round((transferHalfPeriodSec / 60) * 10) / 10;

  // Angle swept by target during transfer time
  const targetSweepRad = omegaTarget * transferHalfPeriodSec;

  // In orbital rendezvous from lower orbit, target leads: ideal phase angle = pi - omegaTarget * tTransfer
  const idealPhaseAngleRad = Math.PI - targetSweepRad;
  let phaseErrorRad = (initialPhaseRad - idealPhaseAngleRad) % (2 * Math.PI);
  if (phaseErrorRad > Math.PI) phaseErrorRad -= 2 * Math.PI;
  if (phaseErrorRad < -Math.PI) phaseErrorRad += 2 * Math.PI;

  // Linear separation at encounter (km)
  const altitudeDiff = Math.abs(rTransferApo - rTarget);
  const arcDiff = rTarget * Math.abs(phaseErrorRad);
  const minSeparationKm = Math.round(Math.sqrt(Math.pow(altitudeDiff, 2) + Math.pow(arcDiff, 2)) * 10) / 10;

  const relativeVelocityMs = Math.round(Math.abs(vChaser - vTarget) * 1000 + Math.abs(deltaVMs * 0.4));

  let isDockingFeasible = false;
  let statusMessage = '';
  let verdict: RendezvousCalculation['verdict'] = 'diverging';
  let orbitalAdvice = '';

  if (minSeparationKm <= 3.5 && relativeVelocityMs <= 45) {
    isDockingFeasible = true;
    verdict = 'perfect_dock';
    statusMessage = 'NOMINAL RENDEZVOUS: Docking gate intercepted within radar tolerance.';
    orbitalAdvice = 'Perfect burn synchrony! The chaser phases precisely into the target vehicle coordinate frame.';
  } else if (minSeparationKm <= 15) {
    verdict = 'close_pass';
    statusMessage = 'CLOSE APPROACH: Within visual range (15 km) but outside docking latch window.';
    orbitalAdvice = 'Requires minor RCS vernier thruster trim to nullify closing rate.';
  } else if (rTransferApo > rTarget + 10) {
    verdict = 'overshoot_ahead';
    statusMessage = 'APOGEE OVERSHOOT: Transfer orbit expanded higher than target orbit.';
    orbitalAdvice = 'Excess delta-V pushed chaser into a slower, higher orbit, falling behind the target.';
  } else if (initialPhaseAngleDeg > 0 && deltaOmega <= 0) {
    verdict = 'lagging_behind';
    statusMessage = 'PHASING DEFICIT: Chaser is trailing and orbital period is too slow.';
    orbitalAdvice = 'To catch up to a target ahead in orbit, you must drop to a lower, faster orbit!';
  } else {
    verdict = 'diverging';
    statusMessage = 'DISPERSION: Spacecraft trajectories diverging across ground tracks.';
    orbitalAdvice = 'Katherine Johnson proved that orbital rendezvous requires solving synchronized conic intersections, not simply pointing and burning.';
  }

  return {
    targetAltKm,
    chaserAltKm,
    initialPhaseAngleDeg,
    deltaVMs,
    transferTimeMin,
    minSeparationKm,
    relativeVelocityMs,
    isDockingFeasible,
    statusMessage,
    verdict,
    orbitalAdvice,
  };
}

export interface ReentryCalculation {
  retroDeltaVMs: number; // 90 to 220 m/s
  entryAngleDeg: number; // -4.0 to -9.0 deg (strictly negative)
  timingOffsetSec: number; // -60 to +60 sec
  outcome: 'skip_off' | 'safe_splashdown' | 'excessive_g_burnup';
  peakGForce: number;
  peakThermalC: number;
  downrangeKm: number;
  splashdownRecoveryZone: string;
  predictedCoords: string;
  corridorSummary: string;
  johnsonHistoricalNote: string;
}

/**
 * Calculates Project Mercury / Apollo Re-entry corridor physics
 * Atmospheric interface: 122 km (400,000 ft)
 * Nominal flight path angle gamma: -5.5 deg to -7.2 deg
 */
export function calculateReentry(
  retroDeltaVMs: number,
  entryAngleDeg: number,
  timingOffsetSec: number
): ReentryCalculation {
  // Flight path angle gamma (must be negative for re-entry)
  const angle = Math.abs(entryAngleDeg); // magnitude

  // G-force scales with entry angle: nominal 6.8G - 7.5G in corridor
  const angleFactor = Math.pow(angle / 6.0, 3.2);
  const baseG = 4.8 + angleFactor * 2.2 + (retroDeltaVMs / 500);
  const peakGForce = Math.round(baseG * 10) / 10;

  // Peak thermal load on blunt heat shield: nominal 1450C - 1650C in corridor
  const baseTemp = 1200 + Math.pow(angle / 5.5, 2.5) * 280 + (retroDeltaVMs * 0.4);
  const peakThermalC = Math.round(baseTemp);

  // Downrange splashdown distance relative to Cape Canaveral / Grand Turk
  // Downrange error ~ timingOffsetSec * 7.8 km/s + angular offset
  const baseDownrangeKm = 4250;
  const angleShift = (angle - 6.2) * -180; // steeper = shorter downrange
  const timeShift = timingOffsetSec * 7.8; // orbital ground track velocity
  const downrangeKm = Math.round(baseDownrangeKm + angleShift + timeShift);

  // Coordinates based on Project Mercury Friendship 7 landing area in Atlantic
  const baseLat = 21.43; // North (near Grand Turk Island)
  const baseLon = -68.65; // West
  const latOffset = (downrangeKm - 4250) * 0.007;
  const lonOffset = (downrangeKm - 4250) * 0.011;
  const landingLat = (baseLat + latOffset).toFixed(2);
  const landingLon = (baseLon + lonOffset).toFixed(2);
  const predictedCoords = `${Math.abs(Number(landingLat))}° N, ${Math.abs(Number(landingLon))}° W`;

  let outcome: ReentryCalculation['outcome'] = 'safe_splashdown';
  let splashdownRecoveryZone = '';
  let corridorSummary = '';

  if (angle < 5.4) {
    outcome = 'skip_off';
    splashdownRecoveryZone = 'OUT OF CORRIDOR — Atmospheric Skip Trajectory';
    corridorSummary = 'CRITICAL FAILURE: Entry path was too shallow (< 5.5°). The capsule bounced off the upper stratosphere back into space.';
  } else if (angle > 7.4 || peakGForce > 11.5 || peakThermalC > 2100) {
    outcome = 'excessive_g_burnup';
    splashdownRecoveryZone = 'OUT OF CORRIDOR — Structural / Thermal Limit Exceeded';
    corridorSummary = 'CRITICAL FAILURE: Entry path was too steep (> 7.4°). Deceleration exceeded astronaut physiological tolerance (> 11 G) or heat shield thermal limits.';
  } else {
    outcome = 'safe_splashdown';
    if (Math.abs(timingOffsetSec) <= 15) {
      splashdownRecoveryZone = 'PRIMARY ATLANTIC FLEET: USS Noa Recovery Perimeter (< 18 km)';
      corridorSummary = 'SUCCESSFUL RE-ENTRY: Capsule entered the precise corridor. Nominal deceleration (6.8–7.5 G) and heat-shield integrity preserved.';
    } else {
      splashdownRecoveryZone = 'SECONDARY ATLANTIC SECTOR: Destroyer Search Zone (80 km off-target)';
      corridorSummary = 'SAFE SPLASHDOWN (EXTENDED RECOVERY): Survival conditions nominal, but retrofire timing offset caused downstream landing dispersion.';
    }
  }

  const johnsonHistoricalNote = 
    "In 1962, astronaut John Glenn refused to fly Friendship 7 until Katherine Johnson personally hand-checked the electronic IBM 7090 computer trajectory and splashdown retrofire coordinates: 'If she says they're good, then I'm ready to go.'";

  return {
    retroDeltaVMs,
    entryAngleDeg: -angle,
    timingOffsetSec,
    outcome,
    peakGForce,
    peakThermalC,
    downrangeKm,
    splashdownRecoveryZone,
    predictedCoords,
    corridorSummary,
    johnsonHistoricalNote,
  };
}

export interface MissionPlan {
  orbitAltKm: number;
  phaseAngleDeg: number;
  rendezvousBurnMs: number;
  retroAngleDeg: number;
  retroDeltaVMs: number;
}

export interface MissionResult {
  passed: boolean;
  score: number; // 0 to 100
  orbitPass: boolean;
  rendezvousPass: boolean;
  reentryPass: boolean;
  feedback: string[];
}

export function evaluateMission(plan: MissionPlan): MissionResult {
  const feedback: string[] = [];
  let score = 0;

  // Step 1: Orbit
  const orbitPass = plan.orbitAltKm >= 240 && plan.orbitAltKm <= 340;
  if (orbitPass) {
    score += 35;
    feedback.push('✓ Orbital Insertion: Stable Mercury orbit established with nominal dynamic pressure.');
  } else {
    feedback.push('✗ Orbital Insertion: Altitude out of envelope. Decays prematurely (< 240 km) or exceeds Atlas booster limit.');
  }

  // Step 2: Rendezvous Phasing
  const rendezvous = calculateRendezvous(300, plan.orbitAltKm, plan.phaseAngleDeg, plan.rendezvousBurnMs);
  const rendezvousPass = rendezvous.minSeparationKm <= 15;
  if (rendezvousPass) {
    score += 35;
    feedback.push(`✓ Rendezvous Maneuver: Spacecraft achieved close encounter (${rendezvous.minSeparationKm} km) within radar intercept envelope.`);
  } else {
    feedback.push(`✗ Rendezvous Maneuver: Spacecraft separation was ${rendezvous.minSeparationKm} km (${rendezvous.statusMessage}).`);
  }

  // Step 3: Reentry
  const reentry = calculateReentry(plan.retroDeltaVMs, plan.retroAngleDeg, 0);
  const reentryPass = reentry.outcome === 'safe_splashdown';
  if (reentryPass) {
    score += 30;
    feedback.push('✓ Safe Atmospheric Corridor: Controlled deceleration within naval recovery fleet perimeter.');
  } else {
    feedback.push(`✗ Re-entry Trajectory: Re-entry failed (${reentry.corridorSummary}).`);
  }

  return {
    passed: orbitPass && rendezvousPass && reentryPass,
    score,
    orbitPass,
    rendezvousPass,
    reentryPass,
    feedback,
  };
}
