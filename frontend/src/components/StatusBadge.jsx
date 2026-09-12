import React from 'react';

export default function StatusBadge({ status }) {
  if (!status) return null;
  const formattedStatus = status.toString().toUpperCase().replace(/\s+/g, '_');
  const className = `badge badge-${formattedStatus.toLowerCase()}`;

  return (
    <span className={className}>
      {status.toString().replace(/_/g, ' ')}
    </span>
  );
}
