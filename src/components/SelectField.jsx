/**
 * Reusable labelled <select>. Used for region, difficulty and sort.
 * options: [{ value, label }]
 */
export default function SelectField({ label, value, onChange, options, placeholder, id }) {
  return (
    <label className="select-field" htmlFor={id}>
      <span className="field-label">{label}</span>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
