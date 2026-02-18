import React, { memo } from 'react';

const GlassCard = memo(function GlassCard({ 
  children, 
  onClick, 
  className = '',
  hoverable = true,
  ...props 
}) {
  const classes = `liquid-glass-card glass-card-tile ${hoverable ? '' : 'no-hover'} ${className}`.trim();
  
  return (
    <div
      className={classes}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      {...props}
    >
      {children}
    </div>
  );
});

export default GlassCard;
