import React, { useState } from 'react';

// Controlled tag input: type a skill, press Enter/comma to add, click × to remove.
export default function SkillTagInput({ label, hint, tags, onChange, tagClass }) {
  const [value, setValue] = useState('');

  const addTag = () => {
    const clean = value.trim().toLowerCase();
    if (clean && !tags.includes(clean)) {
      onChange([...tags, clean]);
    }
    setValue('');
  };

  const removeTag = (tag) => onChange(tags.filter((t) => t !== tag));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="field">
      <label>{label}</label>
      <div className="tag-input-preview">
        {tags.map((tag) => (
          <span key={tag} className={`tag ${tagClass}`}>
            {tag}
            <span className="tag-remove" onClick={() => removeTag(tag)}>×</span>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder="Type a skill and press Enter"
      />
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}
