import React from 'react';
import { Search } from 'lucide-react';

export default function FilterBar({ searchValue, onSearchChange, filters = [], actionButton }) {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifycontent: 'space-between',
      gap: '1rem',
      marginBottom: '1.25rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, flexWrap: 'wrap' }}>
        {onSearchChange && (
          <div style={{ position: 'relative', minWidth: '240px', flex: 1, maxWidth: '360px' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.4rem' }}
              placeholder="Search..."
              value={searchValue || ''}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}

        {filters.map((filter, idx) => (
          <select
            key={idx}
            className="form-control"
            style={{ width: 'auto', minWidth: '140px' }}
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
          >
            {filter.options.map((opt, oIdx) => (
              <option key={oIdx} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ))}
      </div>

      {actionButton && <div>{actionButton}</div>}
    </div>
  );
}
