import React from 'react';

export default function StatCard({ label, value, icon: Icon, color = '#2563eb', bg = '#eff6ff' }) {
  return (
    <div className="stat-card">
      <div className="stat-card-accent-bar" style={{ backgroundColor: color }} />
      <div className="stat-card-body">
        <div className="stat-label" title={label}>{label}</div>
        <div className="stat-value">{value}</div>
      </div>
      <div className="stat-icon" style={{ backgroundColor: bg, color: color }}>
        <Icon size={22} strokeWidth={2.2} />
      </div>
    </div>
  );
}
