import React from 'react';

export default function StreakBadge({ count, corner = false }) {
  if (!count || count < 10) return null;
  return (
    <span className={`streak-badge ${corner ? 'card-corner-badge' : ''}`} title={`${count} swaps completed`}>
      🏅 {count}
    </span>
  );
}
