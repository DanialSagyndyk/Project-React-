import { useState } from 'react';
import FormField from './FormField';
import { DIFFICULTIES, SEASONS } from '../api/trailsApi';
import { capitalize } from '../utils/format';

const TAG_OPTIONS = ['waterfall', 'lake', 'glacier', 'forest', 'canyon', 'panorama', 'family', 'dog-friendly', 'camping', 'photography', 'wildflowers', 'river'];

const INITIAL_FORM = {
  name: '',
  region: '',
  difficulty: 'moderate',
  distanceKm: '',
  elevationGain: '',
  maxAltitude: '',
  durationHours: '',
  season: SEASONS[1],
  rating: '4.5',
  tags: [],
  description: '',
};

export function validate(form) {
  const errors = {};
  const num = (v) => Number(v);
  if (form.name.trim().length < 3) errors.name = 'Name must be at least 3 characters.';
  else if (form.name.trim().length > 60) errors.name = 'Name must be 60 characters or fewer.';
  if (!form.region) errors.region = 'Choose a region.';
  if (form.distanceKm === '' || num(form.distanceKm) <= 0 || num(form.distanceKm) > 100)
    errors.distanceKm = 'Enter a distance between 0.1 and 100 km.';
  if (form.elevationGain === '' || num(form.elevationGain) < 0 || num(form.elevationGain) > 5000)
    errors.elevationGain = 'Enter 0–5000 m.';
  if (form.maxAltitude === '' || num(form.maxAltitude) < 300 || num(form.maxAltitude) > 7500)
    errors.maxAltitude = 'Enter 300–7500 m.';
  if (form.durationHours === '' || num(form.durationHours) <= 0 || num(form.durationHours) > 72)
    errors.durationHours = 'Enter 0.5–72 hours.';
  if (form.description.trim().length < 20) errors.description = 'Describe the trail in at least 20 characters.';
  if (form.tags.length === 0) errors.tags = 'Pick at least one tag.';
  return errors;
}

/**
 * Controlled form: every input's value comes from `form` state and every change goes
 * through setForm. The parent decides what "submit" means via onSubmit (returns a Promise).
 */
export default function TrailForm({ regions, onSubmit, submitError }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Derived state: errors are calculated from form on each render, not stored separately.
  const errors = validate(form);
  const showError = (field) => (touched[field] || submitted) && errors[field];

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value })); // immutable update
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  function toggleTag(tag) {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }));
    setTouched((prev) => ({ ...prev, tags: true }));
  }

  function handleReset() {
    setForm(INITIAL_FORM);
    setTouched({});
    setSubmitted(false);
  }

  async function handleSubmit(e) {
    e.preventDefault(); // stop the browser's full-page form submit
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit({
        name: form.name,
        region: form.region,
        difficulty: form.difficulty,
        distanceKm: Number(form.distanceKm),
        elevationGain: Number(form.elevationGain),
        maxAltitude: Number(form.maxAltitude),
        durationHours: Number(form.durationHours),
        season: form.season,
        rating: Number(form.rating),
        tags: form.tags,
        description: form.description,
      });
    } catch {
      setSubmitting(false); // parent shows submitError; keep the user's input
    }
  }

  const inputProps = (name) => ({
    id: name,
    name,
    value: form[name],
    onChange: handleChange,
    onBlur: handleBlur,
    'aria-invalid': Boolean(showError(name)),
  });

  return (
    <form className="trail-form" onSubmit={handleSubmit} noValidate>
      <FormField label="Trail name" htmlFor="name" error={showError('name')}>
        <input type="text" placeholder="e.g. Butakovka Falls Loop" maxLength={60} {...inputProps('name')} />
      </FormField>

      <div className="form-grid">
        <FormField label="Region" htmlFor="region" error={showError('region')}>
          <select {...inputProps('region')}>
            <option value="">Select a region…</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Season" htmlFor="season">
          <select {...inputProps('season')}>
            {SEASONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <fieldset className="form-field">
        <legend className="field-label">Difficulty</legend>
        <div className="segmented">
          {DIFFICULTIES.map((d) => (
            <label key={d} className={form.difficulty === d ? 'selected' : undefined}>
              <input
                type="radio"
                name="difficulty"
                value={d}
                checked={form.difficulty === d}
                onChange={handleChange}
              />
              {capitalize(d)}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="form-grid form-grid-4">
        <FormField label="Distance, km" htmlFor="distanceKm" error={showError('distanceKm')}>
          <input type="number" step="0.1" min="0" inputMode="decimal" {...inputProps('distanceKm')} />
        </FormField>
        <FormField label="Elevation gain, m" htmlFor="elevationGain" error={showError('elevationGain')}>
          <input type="number" step="10" min="0" inputMode="numeric" {...inputProps('elevationGain')} />
        </FormField>
        <FormField label="Max altitude, m" htmlFor="maxAltitude" error={showError('maxAltitude')}>
          <input type="number" step="10" min="0" inputMode="numeric" {...inputProps('maxAltitude')} />
        </FormField>
        <FormField label="Duration, hours" htmlFor="durationHours" error={showError('durationHours')}>
          <input type="number" step="0.5" min="0" inputMode="decimal" {...inputProps('durationHours')} />
        </FormField>
      </div>

      <FormField label={`Your rating: ${Number(form.rating).toFixed(1)} / 5`} htmlFor="rating">
        <input type="range" min="1" max="5" step="0.1" {...inputProps('rating')} />
      </FormField>

      <fieldset className="form-field">
        <legend className="field-label">Tags</legend>
        <div className="tag-picker">
          {TAG_OPTIONS.map((tag) => (
            <button
              type="button"
              key={tag}
              className={`tag${form.tags.includes(tag) ? ' tag-selected' : ''}`}
              aria-pressed={form.tags.includes(tag)}
              onClick={() => toggleTag(tag)}
            >
              #{tag}
            </button>
          ))}
        </div>
        {showError('tags') && <p className="field-error">{errors.tags}</p>}
      </fieldset>

      <FormField
        label="Description"
        htmlFor="description"
        error={showError('description')}
        hint={`${form.description.trim().length} / 20+ characters`}
      >
        <textarea rows={5} placeholder="Where does it start, what will hikers see, any tips?" {...inputProps('description')} />
      </FormField>

      {submitError && (
        <div className="notice notice-error" role="alert">
          {submitError}
        </div>
      )}

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={handleReset} disabled={submitting}>
          Clear form
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Publishing…' : 'Publish trail'}
        </button>
      </div>
    </form>
  );
}
