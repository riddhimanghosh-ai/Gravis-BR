import React, { useState, useRef, useEffect } from 'react';
import '../styles/MultiSelectDropdown.css';

/**
 * Compact dropdown with multi-select checkboxes.
 * Props:
 *   label     – button label prefix  e.g. "🏪 Channels"
 *   options   – string[]
 *   selected  – string[]
 *   onChange  – (newSelected: string[]) => void
 *   allLabel  – text when all selected, e.g. "All Channels"
 */
const MultiSelectDropdown = ({ label, options, selected, onChange, allLabel }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // close on outside click
  useEffect(() => {
    const handler = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = opt => {
    const next = selected.includes(opt)
      ? selected.filter(s => s !== opt)
      : [...selected, opt];
    onChange(next);
  };

  const toggleAll = () => {
    onChange(selected.length === options.length ? [] : [...options]);
  };

  const isAll  = selected.length === options.length;
  const isNone = selected.length === 0;

  const summaryText = isAll
    ? (allLabel || `All`)
    : isNone
      ? 'None'
      : selected.length <= 2
        ? selected.join(', ')
        : `${selected.slice(0, 2).join(', ')} +${selected.length - 2}`;

  return (
    <div className="msd-wrap" ref={ref}>
      {/* Trigger button */}
      <button
        className={`msd-trigger ${open ? 'msd-open' : ''} ${!isAll ? 'msd-filtered' : ''}`}
        onClick={() => setOpen(o => !o)}
        type="button"
      >
        <span className="msd-label">{label}</span>
        <span className="msd-summary">{summaryText}</span>
        <span className="msd-arrow">{open ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="msd-dropdown">
          <div className="msd-option msd-all" onClick={toggleAll}>
            <span className={`msd-check ${isAll ? 'checked' : ''}`}>{isAll ? '☑' : '☐'}</span>
            <span>{isAll ? 'Deselect All' : 'Select All'}</span>
          </div>
          <div className="msd-divider" />
          {options.map(opt => (
            <div key={opt} className="msd-option" onClick={() => toggle(opt)}>
              <span className={`msd-check ${selected.includes(opt) ? 'checked' : ''}`}>
                {selected.includes(opt) ? '☑' : '☐'}
              </span>
              <span>{opt}</span>
            </div>
          ))}
        </div>
      )}

      {/* Selected chips — only when subset selected */}
      {!isAll && selected.length > 0 && (
        <div className="msd-chips">
          {selected.map(opt => (
            <span key={opt} className="msd-chip">
              {opt}
              <button
                className="msd-chip-x"
                onClick={e => { e.stopPropagation(); toggle(opt); }}
                type="button"
              >×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
