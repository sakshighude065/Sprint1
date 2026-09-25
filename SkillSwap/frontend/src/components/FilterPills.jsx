import React from 'react';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'code', label: '💻 Code' },
  { key: 'music', label: '🎵 Music' },
  { key: 'language', label: '🗣️ Language' },
  { key: 'media', label: '📷 Media' },
  { key: 'games', label: '♟️ Games' },
];

export default function FilterPills({ active, onChange }) {
  return (
    <div className="filter-pills">
      {CATEGORIES.map((c) => (
        <button
          key={c.key}
          type="button"
          className={`pill ${active === c.key ? 'active' : ''}`}
          onClick={() => onChange(c.key)}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
