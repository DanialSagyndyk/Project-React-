// Simulated REST API.
// Behaves like a real async backend: every call returns a Promise, resolves after a random
// network delay, can occasionally fail, and persists data in localStorage (our "database").
import seedTrails from '../data/trails.json';

const STORAGE_KEY = 'trailbook:trails:v1';
const MIN_DELAY = 300;
const MAX_DELAY = 1100;
// Probability that a list request fails, so the error state + "Retry" can be shown.
export const FAIL_RATE = 0.05;

export const DIFFICULTIES = ['easy', 'moderate', 'hard', 'expert'];
export const SEASONS = ['All year', 'Spring–Autumn', 'Summer only', 'Winter'];
export const SORT_OPTIONS = [
  { value: 'rating-desc', label: 'Top rated' },
  { value: 'newest', label: 'Newest first' },
  { value: 'distance-asc', label: 'Shortest first' },
  { value: 'distance-desc', label: 'Longest first' },
  { value: 'elevation-desc', label: 'Most climbing' },
  { value: 'name-asc', label: 'Name A–Z' },
];

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// ---------- "database" helpers ----------
function readDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // corrupted or unavailable storage → fall back to seed data
  }
  writeDb(seedTrails);
  return seedTrails;
}

function writeDb(trails) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trails));
  } catch {
    // storage may be full or blocked (private mode) — the app still works in memory
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const randomDelay = () => MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
// Return deep copies, like JSON coming over the network, so callers can't mutate the DB.
const clone = (value) => JSON.parse(JSON.stringify(value));

async function respond(handler, { canFail = false } = {}) {
  await wait(randomDelay());
  if (canFail && Math.random() < FAIL_RATE) {
    throw new ApiError('Network error: the server did not respond. Please try again.', 503);
  }
  return clone(handler());
}

// ---------- query helpers ----------
const SORTERS = {
  'rating-desc': (a, b) => b.rating - a.rating || b.reviews - a.reviews,
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  'distance-asc': (a, b) => a.distanceKm - b.distanceKm,
  'distance-desc': (a, b) => b.distanceKm - a.distanceKm,
  'elevation-desc': (a, b) => b.elevationGain - a.elevationGain,
  'name-asc': (a, b) => a.name.localeCompare(b.name),
};

function matchesQuery(trail, q) {
  if (!q) return true;
  const needle = q.toLowerCase();
  return (
    trail.name.toLowerCase().includes(needle) ||
    trail.region.toLowerCase().includes(needle) ||
    trail.tags.some((tag) => tag.includes(needle))
  );
}

// ---------- endpoints ----------

/** GET /trails?q=&region=&difficulty=&sort=&page=&pageSize= */
export function getTrails({ q = '', region = '', difficulty = '', sort = 'rating-desc', page = 1, pageSize = 12 } = {}) {
  return respond(
    () => {
      const filtered = readDb()
        .filter((t) => matchesQuery(t, q.trim()))
        .filter((t) => !region || t.region === region)
        .filter((t) => !difficulty || t.difficulty === difficulty)
        .sort(SORTERS[sort] ?? SORTERS['rating-desc']);

      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      const safePage = Math.min(Math.max(1, page), totalPages);
      const start = (safePage - 1) * pageSize;

      return { items: filtered.slice(start, start + pageSize), total, page: safePage, totalPages, pageSize };
    },
    { canFail: true },
  );
}

/** GET /trails/:id */
export function getTrail(id) {
  return respond(() => {
    const trail = readDb().find((t) => t.id === Number(id));
    if (!trail) throw new ApiError(`Trail #${id} was not found. It may have been deleted.`, 404);
    return trail;
  });
}

/** GET /regions */
export function getRegions() {
  return respond(() => [...new Set(readDb().map((t) => t.region))].sort());
}

/** GET /trails/:id/similar — same region, closest rating */
export function getSimilarTrails(id, limit = 3) {
  return respond(() => {
    const db = readDb();
    const current = db.find((t) => t.id === Number(id));
    if (!current) return [];
    return db
      .filter((t) => t.region === current.region && t.id !== current.id)
      .sort((a, b) => Math.abs(a.rating - current.rating) - Math.abs(b.rating - current.rating))
      .slice(0, limit);
  });
}

/** POST /trails */
export function createTrail(input) {
  return respond(() => {
    const db = readDb();
    if (db.some((t) => t.name.toLowerCase() === input.name.trim().toLowerCase())) {
      throw new ApiError('A trail with this name already exists.', 409);
    }
    const trail = {
      ...input,
      name: input.name.trim(),
      description: input.description.trim(),
      id: Math.max(0, ...db.map((t) => t.id)) + 1,
      reviews: 0,
      author: 'You',
      createdAt: new Date().toISOString(),
    };
    writeDb([trail, ...db]);
    return trail;
  });
}

/** DELETE /trails/:id */
export function deleteTrail(id) {
  return respond(() => {
    const db = readDb();
    if (!db.some((t) => t.id === Number(id))) throw new ApiError('Trail not found.', 404);
    writeDb(db.filter((t) => t.id !== Number(id)));
    return { ok: true };
  });
}

/** Restores the original 120 records (used by the "Reset demo data" button). */
export function resetDatabase() {
  return respond(() => {
    writeDb(seedTrails);
    return { ok: true };
  });
}
