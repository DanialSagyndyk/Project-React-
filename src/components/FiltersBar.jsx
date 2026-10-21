import SearchBar from './SearchBar';
import SelectField from './SelectField';
import { DIFFICULTIES, SORT_OPTIONS } from '../api/trailsApi';
import { capitalize } from '../utils/format';

const difficultyOptions = DIFFICULTIES.map((d) => ({ value: d, label: capitalize(d) }));

/** Presentational: receives current filters + callbacks from TrailsPage. */
export default function FiltersBar({ filters, regions, onChange, onSearch, onReset, resetKey, hasActiveFilters }) {
  const regionOptions = regions.map((r) => ({ value: r, label: r }));

  return (
    <section className="filters" aria-label="Search and filters">
      {/* key changes on "Reset" → React remounts SearchBar, so its local draft state resets */}
      <SearchBar
        key={resetKey}
        value={filters.q}
        onSearch={onSearch}
        placeholder="Search by name, region or tag (e.g. waterfall)"
      />
      <div className="filter-row">
        <SelectField
          id="region"
          label="Region"
          value={filters.region}
          onChange={(region) => onChange({ region })}
          options={regionOptions}
          placeholder="All regions"
        />
        <SelectField
          id="difficulty"
          label="Difficulty"
          value={filters.difficulty}
          onChange={(difficulty) => onChange({ difficulty })}
          options={difficultyOptions}
          placeholder="Any difficulty"
        />
        <SelectField
          id="sort"
          label="Sort by"
          value={filters.sort}
          onChange={(sort) => onChange({ sort })}
          options={SORT_OPTIONS}
        />
        <button type="button" className="btn btn-ghost reset-btn" onClick={onReset} disabled={!hasActiveFilters}>
          Reset filters
        </button>
      </div>
    </section>
  );
}
