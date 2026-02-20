import React, { useRef, useCallback, useEffect, useState } from 'react';

/**
 * Apple liquid glass–style slider. Draggable thumb with touch support (scrollable on iPhone).
 * value and onChange are in 0..1.
 */
export default function LiquidGlassSlider({ value = 0, onChange, className = '', style = {} }) {
  const containerRef = useRef(null);
  const thumbRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const [localValue, setLocalValue] = useState(value);
  const localValueRef = useRef(value);

  // Sync local value with prop when not dragging
  useEffect(() => {
    if (!isDragging) {
      setLocalValue(value);
      localValueRef.current = value;
    }
  }, [value, isDragging]);

  const clamp = (v) => Math.max(0, Math.min(1, v));

  const getPercentFromClientX = useCallback((clientX) => {
    const el = containerRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    return clamp((offsetX / rect.width) * 100) / 100;
  }, []);

  const handleMove = useCallback(
    (clientX) => {
      const p = getPercentFromClientX(clientX);
      setLocalValue(p);
      localValueRef.current = p;
      // Don't call onChange during drag - only update visual position
      // onChange will be called when drag ends
    },
    [getPercentFromClientX]
  );

  const onPointerDown = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(true);
      isDraggingRef.current = true;
      if (thumbRef.current) thumbRef.current.classList.add('active');
      handleMove(e.clientX);
    },
    [handleMove]
  );

  const onTrackPointerDown = useCallback(
    (e) => {
      if (e.target === thumbRef.current || thumbRef.current?.contains(e.target)) return;
      e.preventDefault();
      const p = getPercentFromClientX(e.clientX);
      setIsDragging(true);
      isDraggingRef.current = true;
      if (thumbRef.current) thumbRef.current.classList.add('active');
      setLocalValue(p);
      localValueRef.current = p;
      // For track clicks, call onChange immediately
      onChange(p);
    },
    [getPercentFromClientX, onChange]
  );

  // Touch handlers - removed preventDefault from React handlers since they're passive
  // We'll use native listeners instead (defined in useEffect below)

  const stopDrag = useCallback(() => {
    if (isDraggingRef.current) {
      // Call onChange with final value when drag ends
      onChange(localValueRef.current);
    }
    setIsDragging(false);
    isDraggingRef.current = false;
    if (thumbRef.current) thumbRef.current.classList.remove('active');
    // Sync with prop value after drag ends
    setLocalValue(value);
    localValueRef.current = value;
  }, [value, onChange]);

  useEffect(() => {
    const container = containerRef.current;
    const thumb = thumbRef.current;
    if (!container || !thumb) return;

    const onMouseMove = (e) => {
      if (isDraggingRef.current) handleMove(e.clientX);
    };
    const onMouseUp = () => stopDrag();

    // Native touch handlers with passive: false so we can preventDefault
    const onContainerTouchStart = (e) => {
      if (e.target === thumb || thumb.contains(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      const p = getPercentFromClientX(e.touches[0].clientX);
      setIsDragging(true);
      isDraggingRef.current = true;
      if (thumb) thumb.classList.add('active');
      setLocalValue(p);
      localValueRef.current = p;
      // For track touches, call onChange immediately
      onChange(p);
    };

    const onThumbTouchStart = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      isDraggingRef.current = true;
      if (thumb) thumb.classList.add('active');
      handleMove(e.touches[0].clientX);
    };

    const onTouchMove = (e) => {
      if (isDraggingRef.current && e.cancelable) {
        e.preventDefault();
        handleMove(e.touches[0].clientX);
      }
    };

    const onTouchEnd = () => stopDrag();
    const onTouchCancel = () => stopDrag();

    // Mouse events
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    
    // Touch events - use native listeners with passive: false
    container.addEventListener('touchstart', onContainerTouchStart, { passive: false });
    thumb.addEventListener('touchstart', onThumbTouchStart, { passive: false });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
    document.addEventListener('touchcancel', onTouchCancel);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('touchstart', onContainerTouchStart);
      thumb.removeEventListener('touchstart', onThumbTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('touchcancel', onTouchCancel);
    };
  }, [handleMove, stopDrag, getPercentFromClientX, onChange]);

  // Use local value when dragging, prop value otherwise
  const displayValue = isDragging ? localValue : value;
  const percent = clamp(displayValue);
  const leftPx = percent * 100;

  return (
    <div
      ref={containerRef}
      className={`apple-liquid-slider ${className}`.trim()}
      style={style}
      role="slider"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={1}
      tabIndex={0}
      onMouseDown={onTrackPointerDown}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="apple-liquid-slider-progress"
        style={{ width: `${percent * 100}%` }}
        aria-hidden
      />
      <div
        ref={thumbRef}
        className="apple-liquid-slider-thumb"
        style={{ left: `${leftPx}%` }}
        onMouseDown={onPointerDown}
        aria-hidden
      >
        <div className="apple-liquid-slider-thumb-filter" />
        <div className="apple-liquid-slider-thumb-overlay" />
        <div className="apple-liquid-slider-thumb-specular" />
      </div>
    </div>
  );
}
