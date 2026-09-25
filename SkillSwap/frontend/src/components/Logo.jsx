import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo({ to = '/', asSpan = false }) {
  const content = (
    <>
      <span className="pin-dot"></span>SkillSwap
    </>
  );
  if (asSpan) return <span className="logo">{content}</span>;
  return (
    <Link to={to} className="logo">
      {content}
    </Link>
  );
}
