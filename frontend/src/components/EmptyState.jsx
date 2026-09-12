import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'No Records Found', message = 'There are no items matching your criteria.', action }) {
  return (
    <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px border-color #e2e8f0' }}>
      <Inbox size={44} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
      <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '0.4rem' }}>{title}</h3>
      <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.25rem' }}>{message}</p>
      {action}
    </div>
  );
}
