import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateOrbit,
  calculateRendezvous,
  calculateReentry,
  evaluateMission,
  EARTH_RADIUS_KM,
} from './orbitalMath';

test('calculateOrbit calculates standard Low Earth Orbit speeds correctly', () => {
  const orbit300 = calculateOrbit(300);
  // v = sqrt(398600.44 / (6371 + 300)) = sqrt(398600.44 / 6671) ≈ 7.73 km/s
  assert.ok(orbit300.speedKmS >= 7.70 && orbit300.speedKmS <= 7.76, `Speed ${orbit300.speedKmS} km/s is within LEO range`);
  // Period around 90.5 minutes
  assert.ok(orbit300.periodMinutes >= 89 && orbit300.periodMinutes <= 92, `Period ${orbit300.periodMinutes} min is within expected LEO range`);
  assert.equal(orbit300.orbitalRadiusKm, EARTH_RADIUS_KM + 300);

  // Higher orbit should have slower speed and longer period (Kepler's 3rd Law)
  const orbit1000 = calculateOrbit(1000);
  assert.ok(orbit1000.speedKmS < orbit300.speedKmS, 'Higher orbit must have lower orbital speed');
  assert.ok(orbit1000.periodMinutes > orbit300.periodMinutes, 'Higher orbit must have longer period');
});

test('calculateRendezvous identifies nominal docking versus dispersion', () => {
  // Nominal matching orbit with calibrated phasing and burn
  const dock = calculateRendezvous(300, 300, 0, 0);
  assert.ok(dock.minSeparationKm <= 5, 'Zero offset and matching orbit gives close separation');
  assert.equal(dock.isDockingFeasible, true);

  // Diverging orbit with large phase offset and zero correction
  const divergent = calculateRendezvous(300, 350, 45, 120);
  assert.equal(divergent.isDockingFeasible, false);
});

test('calculateReentry tests corridor outcomes: skip off, safe, and excessive G', () => {
  // Too shallow: skip-off
  const shallow = calculateReentry(120, -4.0, 0);
  assert.equal(shallow.outcome, 'skip_off');

  // Too steep: excessive G
  const steep = calculateReentry(180, -8.5, 0);
  assert.equal(steep.outcome, 'excessive_g_burnup');

  // Nominal corridor
  const nominal = calculateReentry(140, -6.3, 0);
  assert.equal(nominal.outcome, 'safe_splashdown');
  assert.ok(nominal.peakGForce >= 6.0 && nominal.peakGForce <= 9.0, 'G-force in survivable human corridor');
});

test('evaluateMission accurately scores comprehensive flight plan', () => {
  // Winning mission plan: orbit 280km, rendezvous to 300km with matched phase and burn ~6 m/s
  const rendezvousForTest = calculateRendezvous(300, 300, 0, 0);
  assert.equal(rendezvousForTest.isDockingFeasible, true);

  const winningPlan = evaluateMission({
    orbitAltKm: 300,
    phaseAngleDeg: 0,
    rendezvousBurnMs: 0,
    retroAngleDeg: -6.4,
    retroDeltaVMs: 140,
  });
  assert.equal(winningPlan.passed, true);
  assert.equal(winningPlan.score, 100);

  // Failing plan
  const failingPlan = evaluateMission({
    orbitAltKm: 150, // too low
    phaseAngleDeg: 35, // huge lag
    rendezvousBurnMs: 80,
    retroAngleDeg: -3.5, // skips off
    retroDeltaVMs: 50,
  });
  assert.equal(failingPlan.passed, false);
  assert.ok(failingPlan.score < 50);
});
