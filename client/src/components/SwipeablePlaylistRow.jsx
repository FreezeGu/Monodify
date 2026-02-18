import React, { useState, useRef } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';

const REMOVE_WIDTH = 80;
const SWIPE_THRESHOLD = REMOVE_WIDTH * 0.6;

/**
 * A playlist row that can be swiped left to reveal a "Remove" action.
 * Use for user-owned playlists only.
 */
export default function SwipeablePlaylistRow({
  children,
  leftContent,
  rightContent,
  onClick,
  onRemove,
  disabled = false,
}) {
  const x = useMotionValue(0);
  const [removing, setRemoving] = useState(false);
  const containerRef = useRef(null);

  const handleDragEnd = (_, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    if (offset < -SWIPE_THRESHOLD || velocity < -200) {
      // Snap to reveal Remove
      animate(x, -REMOVE_WIDTH, { type: 'spring', stiffness: 400, damping: 35 });
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 35 });
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (removing || disabled) return;
    setRemoving(true);
    onRemove?.();
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 12,
      }}
    >
      {/* Back layer: Remove action */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: REMOVE_WIDTH,
          background: 'rgba(255, 107, 107, 0.35)',
          borderLeft: '1px solid rgba(255, 107, 107, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 0,
        }}
      >
        <button
          type="button"
          onClick={handleRemove}
          disabled={removing || disabled}
          style={{
            padding: '8px 14px',
            fontSize: 13,
            fontWeight: 600,
            color: '#ff6b6b',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: 8,
            cursor: disabled || removing ? 'not-allowed' : 'pointer',
          }}
        >
          Remove
        </button>
      </div>

      {/* Draggable front layer */}
      <motion.div
        className="glass-list-row"
        style={{
          x,
          position: 'relative',
          zIndex: 1,
          cursor: onClick ? 'pointer' : 'default',
          minHeight: 72,
        }}
        drag={disabled ? false : 'x'}
        dragConstraints={{ left: -REMOVE_WIDTH, right: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        onClick={onClick}
        onKeyDown={onClick && (e => e.key === 'Enter' && onClick())}
        tabIndex={onClick ? 0 : undefined}
        role={onClick ? 'button' : undefined}
      >
        {leftContent && <div className="glass-list-row-left">{leftContent}</div>}
        <div className="glass-list-row-content" style={{ flex: 1 }}>{children}</div>
        {rightContent && <div className="glass-list-row-right">{rightContent}</div>}
      </motion.div>
    </div>
  );
}
