import React from 'react';

export default function LiquidGlassToggle({ on, onChange, label }) {
  return (
    <label className="liquid-glass-toggle" style={{ userSelect: 'none' }}>
      <span
        className={`liquid-glass-toggle-track ${on ? 'on' : ''}`}
        role="switch"
        aria-checked={on}
        tabIndex={0}
        onClick={() => onChange(!on)}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            onChange(!on);
          }
        }}
      >
        <span className="liquid-glass-toggle-knob" />
      </span>
      {label && <span className="text-secondary" style={{ fontSize: 14 }}>{label}</span>}
    </label>
  );
}
