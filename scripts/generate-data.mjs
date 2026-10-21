// Generates src/data/trails.json — the seed data (120 trails) for the simulated API.
// Deterministic: the same seed always gives the same file. Run: npm run generate-data
import { writeFileSync } from 'node:fs';

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(2026);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const between = (min, max) => min + rand() * (max - min);

const REGIONS = {
  Medeu: { base: 1700, landmarks: ['Medeu Dam', 'Butakovka Falls', 'Kim Asar Gorge', 'Furmanov Peak', 'Komissarov Peak', 'Gorelnik Gorge'] },
  Shymbulak: { base: 2200, landmarks: ['Talgar Pass', 'Shymbulak Ridge', 'Tuyuksu Glacier', 'Mynzhylky Valley', 'Kumbel Peak'] },
  'Big Almaty Lake': { base: 2500, landmarks: ['Big Almaty Lake', 'Ozyorny Pass', 'Sovetov Peak', 'Tourist Pass', 'Big Almaty Peak'] },
  'Kok-Zhailau': { base: 1600, landmarks: ['Kok-Zhailau Plateau', 'Kamenka Gorge', 'Pioneer Peak', 'Bogdanovich Glade'] },
  Aksay: { base: 1500, landmarks: ['Aksay Gorge', 'Aksay Waterfall', 'Aksay Glacier', 'Zhusaly Meadow'] },
  Turgen: { base: 1400, landmarks: ['Turgen Waterfalls', 'Bear Falls', 'Kyzylbulak Springs', 'Assy Plateau', 'Batan Falls'] },
  'Kolsai Lakes': { base: 1800, landmarks: ['Lower Kolsai', 'Middle Kolsai', 'Sary-Bulak Pass', 'Saty Village'] },
  Kaindy: { base: 2000, landmarks: ['Kaindy Lake', 'Kaindy Forest', 'Zhalanash Valley'] },
  'Charyn Canyon': { base: 900, landmarks: ['Valley of Castles', 'Charyn River Bank', 'Black Canyon', 'Temirlik Canyon'] },
  Talgar: { base: 1600, landmarks: ['Left Talgar Valley', 'Kotyrbulak', 'Talgar Peak Base', 'Right Talgar Gorge'] },
  'Altyn-Emel': { base: 700, landmarks: ['Singing Dune', 'Aktau Mountains', 'Katutau Hills', 'Besshatyr Mounds'] },
};

const TYPES = ['Trail', 'Loop', 'Ridge Walk', 'Ascent', 'Path', 'Traverse', 'Viewpoint Hike', 'Circuit'];
const TAGS = ['waterfall', 'lake', 'glacier', 'forest', 'canyon', 'panorama', 'family', 'dog-friendly', 'camping', 'photography', 'wildflowers', 'river'];
const SEASONS = ['All year', 'Spring–Autumn', 'Summer only', 'Winter'];
const AUTHORS = ['Aigerim N.', 'Daniyar K.', 'Madina S.', 'Timur A.', 'Alina Zh.', 'Yerlan B.', 'Saule M.', 'Arman T.'];

const OPENERS = [
  'A well-marked route that starts near',
  'A quieter alternative to the crowded paths around',
  'A classic weekend favourite of Almaty hikers, leading from',
  'A scenic route with steady climbs above',
  'An off-the-beaten-path walk beginning close to',
];
const MIDDLES = [
  'The path winds through spruce forest and opens onto wide alpine meadows.',
  'Expect rocky sections, a couple of stream crossings and great views of the ridges.',
  'Most of the way follows a clear dirt track, with a steeper final section.',
  'The trail rewards you with sweeping views of the valley and snow-capped peaks.',
  'Shade is limited, so bring enough water and sun protection.',
];
const CLOSERS = [
  'Best started early in the morning to avoid afternoon clouds.',
  'Weather changes quickly here — pack a warm layer even in summer.',
  'Good mobile coverage for most of the route.',
  'There is a small café near the trailhead for a rest afterwards.',
  'Watch out for loose stones on the descent.',
];

function difficultyFor(distance, gain) {
  const score = distance * 0.6 + gain / 120;
  if (score < 10.5) return 'easy';
  if (score < 15.5) return 'moderate';
  if (score < 20) return 'hard';
  return 'expert';
}

const trails = [];
const usedNames = new Set();
const regionNames = Object.keys(REGIONS);
let id = 1;

while (trails.length < 120) {
  const region = regionNames[trails.length % regionNames.length];
  const { base, landmarks } = REGIONS[region];
  const landmark = pick(landmarks);
  const name = `${landmark} ${pick(TYPES)}`;
  if (usedNames.has(name)) continue;
  usedNames.add(name);

  const distanceKm = Math.round(between(2, 24) * 10) / 10;
  const elevationGain = Math.round(between(80, 1600) / 10) * 10;
  const difficulty = difficultyFor(distanceKm, elevationGain);
  const speed = { easy: 3.5, moderate: 3, hard: 2.5, expert: 2 }[difficulty];
  const durationHours = Math.round((distanceKm / speed + elevationGain / 600) * 2) / 2;
  const tagCount = 2 + Math.floor(rand() * 3);
  const tags = [...new Set(Array.from({ length: tagCount }, () => pick(TAGS)))];
  const created = new Date(Date.UTC(2023, 0, 1) + Math.floor(rand() * 1000) * 86400000);

  trails.push({
    id: id++,
    name,
    region,
    difficulty,
    distanceKm,
    elevationGain,
    maxAltitude: base + elevationGain + Math.round(between(0, 400) / 10) * 10,
    durationHours,
    season: pick(SEASONS),
    rating: Math.round(between(3.2, 5) * 10) / 10,
    reviews: Math.floor(between(3, 480)),
    tags,
    description: `${pick(OPENERS)} ${landmark}. ${pick(MIDDLES)} ${pick(CLOSERS)}`,
    author: pick(AUTHORS),
    createdAt: created.toISOString(),
  });
}

writeFileSync(new URL('../src/data/trails.json', import.meta.url), JSON.stringify(trails, null, 2));
console.log(`Generated ${trails.length} trails`);
