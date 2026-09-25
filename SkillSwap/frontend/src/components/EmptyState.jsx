import React from 'react';
import { Link } from 'react-router-dom';

export default function EmptyState({ icon, title, message, ctaLabel, ctaTo }) {
  return (
    <div className="empty-state">
      <div className="empty-state-badge">{icon}</div>
      <h3>{title}</h3>
      <p>{message}</p>
      {ctaLabel && ctaTo && (
        <Link to={ctaTo} className="btn btn-primary">{ctaLabel}</Link>
      )}
    </div>
  );
}
