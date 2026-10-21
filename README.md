# TrailBook — Hiking Trails around Almaty

A React single-page application for browsing, searching and adding hiking trails in the mountains and canyons around Almaty (Medeu, Shymbulak, Big Almaty Lake, Kolsai, Charyn and more).

**Live demo:** https://project-react-xi-lime.vercel.app/

## Features

- **Trail list** with 120 seed records, shown as responsive cards
- **Search** by name, region or tag (debounced, 400 ms)
- **Filters** by region and difficulty, **sorting** (rating, newest, distance, elevation, name)
- **Pagination** (12 per page) — filters, sort and page are kept in the URL, so Back and shared links work
- **Detail page** for each trail with stats, tags (click a tag to search by it) and “More in this region”
- **Add trail** — controlled form with validation, saved to the simulated API
- **Delete trail** with inline confirmation
- **Loading / error / empty / success** states everywhere (skeleton cards, retry button, 404 page)
- Responsive layout from 360 px phones to desktop

## Tech stack

- React 18 (function components, `useState`, `useEffect`, `useCallback`)
- React Router 6
- Vite
- Plain CSS with custom properties (no UI library)

## Data source — simulated API

`src/api/trailsApi.js` behaves like a REST backend:

| Function | Like endpoint |
| --- | --- |
| `getTrails({ q, region, difficulty, sort, page, pageSize })` | `GET /trails?...` → `{ items, total, page, totalPages }` |
| `getTrail(id)` | `GET /trails/:id` (404 if missing) |
| `getSimilarTrails(id)` | `GET /trails/:id/similar` |
| `getRegions()` | `GET /regions` |
| `createTrail(data)` | `POST /trails` (409 on duplicate name) |
| `deleteTrail(id)` | `DELETE /trails/:id` |
| `resetDatabase()` | restores the 120 seed records |

Every call returns a **Promise** that resolves after a random 300–1100 ms delay. Data is stored as **JSON in `localStorage`**; on first launch it is seeded from `src/data/trails.json` (120 records). List requests fail with a 5 % probability (`FAIL_RATE`) to demonstrate the error state and retry. Search, filtering, sorting and pagination are performed “on the server” (inside the API), not in components.

Seed data is generated deterministically by `scripts/generate-data.mjs` (`npm run generate-data`).

## Project structure

```
src/
  api/trailsApi.js        simulated async API (Promises + delay + localStorage)
  data/trails.json        120 seed trails
  components/
    Layout.jsx            header, nav, footer, <Outlet />
    FiltersBar.jsx        search + region/difficulty/sort selects + reset
    SearchBar.jsx         controlled, debounced search input
    SelectField.jsx       reusable labelled <select>
    TrailGrid.jsx         list of TrailCards + loading skeleton
    TrailCard.jsx         one trail in the list
    Pagination.jsx        page buttons with gaps
    StatusMessage.jsx     loading / error / empty UI
    DifficultyBadge.jsx   coloured difficulty label
    Rating.jsx            star + rating + reviews
    TrailForm.jsx         controlled add-trail form with validation
    FormField.jsx         label + control + error/hint
  pages/
    TrailsPage.jsx        list view: filters (URL), data fetching, states
    TrailDetailPage.jsx   detail view, similar trails, delete
    NewTrailPage.jsx      add-trail page
    NotFoundPage.jsx      404
  utils/format.js         number/date formatting
  App.jsx                 routes only
  main.jsx                entry point
```

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run lint     # ESLint incl. react-hooks rules
```

## Deployment

Deployed on Vercel (Framework preset: Vite, build command `npm run build`, output `dist`).
`vercel.json` rewrites all paths to `index.html` so routes like `/trails/12` work on refresh. A `public/_redirects` file does the same for Netlify.

## Author

Sagyndyk Danial
