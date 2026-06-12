/**
 * loreService.js — Galactic League Lore & Biometrics Engine
 * Generates deterministic lore stories, ratings, and specializations for all players.
 */

const LORE_TEMPLATES = {
  "Brooklyn Biotics": [
    "Equipped with industrial hydraulic wrists designed to override standard catcher target framing.",
    "A legendary Brooklyn unit whose chassis was rebuilt in the Sector 4 shipyards after a coolant leak.",
    "Features a reinforced alloy rib cage to withstand 120mph exit velocity impacts on high-heat drives.",
    "Runs on recycled subway grid power. Bat speed spikes during peak hours.",
    "Drafted after successfully batting away three security drones with an uncalibrated titanium rod."
  ],
  "Tokyo Tachyons": [
    "Equipped with experimental sub-light thrusters that trigger stadium motion sensors prematurely.",
    "A high-frequency unit whose movements are so rapid they appear as a refractive blur to second basemen.",
    "Neural reflexes run on a liquid-cooled tachyon matrix, computing swings in under 0.01 milliseconds.",
    "Possesses an override switch that temporarily halts local gravity during high-stress dive attempts.",
    "Designed for warp-speed base running, leaving glowing trail markers in the baseline dirt."
  ],
  "Neon City Sliders": [
    "Powered by high-vis neon coolant. Slider thrusters leave bright green streaks on standard turf.",
    "Features photo-reactive skin plates that adjust to nighttime stadium illumination cycles.",
    "Internal gyroscopes allow for impossible horizontal sliding catches that defy linear physics.",
    "Cybernetic eyes scan pitch trajectories using neon-spectrum laser guidelines.",
    "Designed in the underground hover-garages. Optimized for high-friction base sweeps."
  ],
  "Silicon Valley Sentinels": [
    "Swing vectors are computed in real-time by a deep neural net running on local cloud nodes.",
    "Features a modular arm slot that self-corrects after analyzing the spin rate of opposing pitches.",
    "Chassis is water-cooled and optimized to prevent thermal throttle events in extra innings.",
    "Stores a compressed database of every pitch thrown in the Grapefruit League since 2042.",
    "Uses predictive algorithms to anticipate manager signs before they are entered on the pad."
  ],
  "Dallas Tex-Mechs": [
    "Equipped with high-torque mechanical limbs originally designed for heavy ranch maintenance.",
    "Features steel-alloy pinstripe plating designed to withstand the extreme heat of the Texas sector.",
    "Maintains a traditional cowboy visor HUD that displays wind shear and ball compression coefficients.",
    "Runs on a highly efficient bio-diesel processor. Built for long-haul durability in doubleheaders.",
    "Arm pistons can launch throws from deep outfield zones at a recorded 115mph velocity."
  ],
  "Osaka Overclockers": [
    "Features an illegal manual overclock toggle that spikes bat speed by 300% in late-inning stress.",
    "Operates at near-melt temperature limits. Local mist-coolants are required between innings.",
    "Equipped with advanced heat sinks to maintain processing efficiency when batting with full count.",
    "Drafted from the gaming arcades of Dotonbori. High-leverage situations trigger boss-fight protocols.",
    "Batting logic operates on a random chaos sub-routine to bypass conventional pitcher AI models."
  ],
  "Kyoto Kaiju": [
    "Delivery is modeled on seismic wave frequencies, causing batter target sensors to regularly lose locks.",
    "Features high-durability scale plating designed to prevent wear during high-volume pitching cycles.",
    "Release point is highly unpredictable due to multi-axis shoulder joint articulation.",
    "A massive unit whose swing creates localized low-pressure systems in the batter's box.",
    "Designed to withstand extreme environmental hazards, including sub-zero weather and volcanic dust."
  ],
  "Roswell Rayguns": [
    "Scouted from a metallic wreckage field. Powered by a glowing green plasma core of unknown origin.",
    "Integrates alien-alloy structural joints that absorb 99% of exit-velocity vibrations.",
    "Operates on a frequency that occasionally overrides local stadium audio feeds with static waves.",
    "Eyes emit a low-level radiation sweep to calculate pitcher grip and ball density.",
    "Features hover-assisted cleats that allow for frictionless acceleration from the batter's box."
  ],
  "Atlanta Aerodynamics": [
    "Equipped with retractable wing-fins that adjust swing elevation mid-flight for maximum launch angle.",
    "Designed in wind tunnels. Carbon-fiber body panels reduce aerodynamic drag to near zero.",
    "Uses localized pressure gauges to predict and exploit ballpark wind drafts.",
    "Features high-altitude breathing filters to maintain CPU efficiency in high-elevation stadiums.",
    "Boasts an ultra-light hollow frame that enables exceptionally high jump heights."
  ],
  "Miami Motherboards": [
    "Water-cooled chassis specifically engineered to prevent humidity-induced circuit corrosion.",
    "Runs on high-bandwidth fiber optic connections, allowing instantaneous sign-relaying within rules.",
    "Designed with a modular glove unit that adjusts pocket size based on ball spin direction.",
    "Integrates solar-panel decals to recharge energy cells during sunny afternoon games.",
    "Boasts an internal salt-water filter to protect sensitive wiring from tropical stadium air."
  ],
  "San Juan Synthetics": [
    "A flawless 50/50 blend of human muscle fibers and flexible synthetic carbon-fiber bones.",
    "Features bio-sync sensors that match robotic joint acceleration with natural human reflexes.",
    "Chassis is designed to mirror natural biomechanics, reducing wear on long road trips.",
    "Equipped with organic-synthetic skin that automatically seals hairline fractures in real-time.",
    "Boasts a dual-core brain that processes strategy sheets while maintaining physical autopilot."
  ],
  "Havana Hover-Hounds": [
    "Magnetic levitation coils replace standard metal cleats, allowing for a frictionless slide.",
    "Features hover-assisted pitch delivery that allows the unit to launch throws from mid-air.",
    "Runs on low-frequency sound wave processors, allowing communication through ballpark noise.",
    "Chassis is constructed from recycled copper coils salvaged from the old seawalls.",
    "Mag-lev thrusters enable sudden lateral cuts, making the unit impossible to catch on pickoffs."
  ]
};

export function getPlayerLore(player) {
  const team = player.team || "Brooklyn Biotics";
  const templates = LORE_TEMPLATES[team] || LORE_TEMPLATES["Brooklyn Biotics"];
  const idNum = parseInt(String(player.id || '').replace(/[^0-9]/g, ''), 10) || player.jersey_number || 0;
  const template = templates[idNum % templates.length];
  return `${player.name} was drafted from ${player.home_planet || 'Earth'}. ${template}`;
}

export function getPlayerSpecialization(position) {
  const pos = String(position || '').toUpperCase();
  if (pos.includes('PITCHER')) {
    if (pos.includes('RELIEF') || pos.includes('CLOSER')) return 'Pulse Save';
    return 'Heat Sink Power';
  }
  if (pos.includes('SHORTSTOP')) return 'Kinetic Burst';
  if (pos.includes('HEAVY') || pos.includes('1B')) return 'Balanced Offense';
  if (pos.includes('OUTFIELDER') || pos.includes('OF')) return 'Photon Reach';
  if (pos.includes('STEALER')) return 'Hyper-Drive';
  if (pos.includes('CATCHER')) return 'Refractive Shield';
  if (pos.includes('MANAGER')) return 'Neural Strategy';
  if (pos.includes('HACKER')) return 'Master Logic';
  return 'Total Spectrum';
}

export function getPlayerRatings(player) {
  const idSum = String(player.id || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const basePower = 60 + (idSum % 31); // 60 to 90
  const baseSpeed = 60 + ((idSum * 7) % 31); // 60 to 90
  const baseCalib = 60 + ((idSum * 13) % 31); // 60 to 90

  // Adjust by position
  const pos = String(player.position || '').toUpperCase();
  let power = basePower;
  let speed = baseSpeed;
  let calibration = baseCalib;

  if (pos.includes('HEAVY') || pos.includes('1B') || pos.includes('PITCHER')) {
    power = Math.min(99, power + 10);
  }
  if (pos.includes('STEALER') || pos.includes('SHORTSTOP') || pos.includes('OUTFIELDER')) {
    speed = Math.min(99, speed + 10);
  }
  if (pos.includes('HACKER') || pos.includes('MANAGER') || pos.includes('CATCHER')) {
    calibration = Math.min(99, calibration + 10);
  }

  return { power, speed, calibration };
}
