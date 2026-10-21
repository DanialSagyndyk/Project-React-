import { useEffect, useState } from 'react';

const DEBOUNCE_MS = 400;

/**
 * Controlled search input with debounce.
 * `draft` is local UI state (updates on every keystroke);
 * `onSearch` is called only after the user stops typing for 400 ms.
 * The parent resets this component by changing its `key`.
 */
export default function SearchBar({ value, onSearch, placeholder = 'Search…' }) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (draft.trim() === value) return; // nothing new to commit
    const timerId = setTimeout(() => onSearch(draft.trim()), DEBOUNCE_MS);
    // Cleanup: if draft changes before 400 ms pass, the old timer is cancelled.
    return () => clearTimeout(timerId);
  }, [draft, value, onSearch]);

  return (
    <div className="search-bar">
      <svg className="search-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        aria-label="Search trails"
      />
      {draft && (
        <button type="button" className="search-clear" onClick={() => setDraft('')} aria-label="Clear search">
          ×
        </button>
      )}
    </div>
  );
}
