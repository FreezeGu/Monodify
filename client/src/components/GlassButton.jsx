import React from 'react';

export default function GlassButton({ 
  children, 
  variant = 'primary', 
  icon, 
  onClick, 
  disabled,
  className = '',
  ...props 
}) {
  const baseClass = variant === 'icon' ? 'glass-btn-icon' : `glass-btn-${variant}`;
  const classes = `liquid-glass-btn ${baseClass} ${className}`.trim();
  
  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="glass-btn-icon-wrapper">{icon}</span>}
      {children}
    </button>
  );
}
