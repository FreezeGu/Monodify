import React from 'react';

export default function GlassListRow({ 
  children, 
  onClick, 
  className = '',
  leftContent,
  rightContent,
  ...props 
}) {
  return (
    <div
      className={`glass-list-row ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      {...props}
    >
      {leftContent && <div className="glass-list-row-left">{leftContent}</div>}
      <div className="glass-list-row-content" style={{ flex: 1 }}>
        {children}
      </div>
      {rightContent && <div className="glass-list-row-right">{rightContent}</div>}
    </div>
  );
}
