import React from 'react';
import { motion } from 'framer-motion';
import { useTabNavigation } from '../context/TabNavigationContext';

const slideVariants = {
  forward: {
    initial: { x: 24, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -24, opacity: 0 },
  },
  back: {
    initial: { x: -24, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 24, opacity: 0 },
  },
};

const transition = { type: 'tween', duration: 0.25, ease: [0.25, 0.1, 0.25, 1] };

export default function ScreenLayout({ children, showBackButton = true, title, rightAction }) {
  const { canGoBack, goBack, getDirection } = useTabNavigation();
  const direction = getDirection();
  const variants = slideVariants[direction] || slideVariants.forward;
  const showBack = showBackButton && canGoBack();

  return (
    <motion.div
      className="screen-layout"
      initial={variants.initial}
      animate={variants.animate}
      exit={variants.exit}
      transition={transition}
    >
      {(showBack || title != null || rightAction) && (
        <header className="screen-header">
          {showBack ? (
            <button
              type="button"
              className="screen-header-back"
              onClick={goBack}
              aria-label="Back"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          ) : (
            <div className="screen-header-spacer" />
          )}
          {title != null && <h1 className="screen-header-title">{title}</h1>}
          {rightAction != null ? (
            <div className="screen-header-action">{rightAction}</div>
          ) : (
            <div className="screen-header-spacer" />
          )}
        </header>
      )}
      <div className="screen-content">{children}</div>
    </motion.div>
  );
}
