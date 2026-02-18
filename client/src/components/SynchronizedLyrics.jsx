import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Apple Music-style synchronized lyrics component
 * Displays word-by-word highlighting as audio plays
 */
export default function SynchronizedLyrics({ lyrics, currentTime, language = 'original' }) {
  const containerRef = useRef(null);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const activeLineRef = useRef(null);

  // Select which lyrics to display (original or translated)
  const displayLyrics = language === 'translated' && lyrics?.translated?.length > 0 
    ? lyrics.translated 
    : lyrics?.original || [];

  // Find active word based on current playback time
  useEffect(() => {
    if (!displayLyrics.length || currentTime === undefined) return;

    // Find the word that should be active based on current time
    let index = -1;
    for (let i = 0; i < displayLyrics.length; i++) {
      const word = displayLyrics[i];
      if (currentTime >= word.start && currentTime < word.end) {
        index = i;
        break;
      }
      // If we've passed this word, mark it as past
      if (currentTime > word.end && i === displayLyrics.length - 1) {
        index = i; // Last word if we're past everything
      }
    }

    if (index !== -1 && index !== activeWordIndex) {
      setActiveWordIndex(index);
    }
  }, [currentTime, displayLyrics, activeWordIndex]);

  // Scroll to active word smoothly
  useEffect(() => {
    if (activeWordIndex === -1 || !containerRef.current) return;

    const activeElement = containerRef.current.querySelector(`[data-word-index="${activeWordIndex}"]`);
    if (activeElement && activeLineRef.current !== activeElement.closest('[data-line-index]')) {
      activeLineRef.current = activeElement.closest('[data-line-index]');
      activeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    }
  }, [activeWordIndex]);

  if (!displayLyrics.length) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: 'var(--secondary-text)' }}>
        No lyrics available
      </div>
    );
  }

  // Group words into lines for better display
  const lines = groupWordsIntoLines(displayLyrics);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '20px 16px',
        scrollBehavior: 'smooth',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          alignItems: 'center',
          minHeight: '100%',
          justifyContent: 'center',
        }}
      >
        {lines.map((line, lineIndex) => {
          const hasActiveWord = line.words.some(w => w.index === activeWordIndex);
          
          return (
            <motion.div
              key={lineIndex}
              data-line-index={lineIndex}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 8,
                alignItems: 'center',
                padding: '12px 20px',
                borderRadius: 12,
                background: hasActiveWord ? 'rgba(255,255,255,0.08)' : 'transparent',
                transition: 'all 0.3s ease',
                minWidth: 'fit-content',
              }}
              animate={{
                scale: hasActiveWord ? 1.02 : 1,
                opacity: hasActiveWord ? 1 : 0.7,
              }}
            >
              {line.words.map((wordData) => {
                const word = wordData.word;
                const index = wordData.index;
                const isActive = index === activeWordIndex;
                const isPast = index < activeWordIndex;
                const isFuture = index > activeWordIndex;

                return (
                  <motion.span
                    key={index}
                    data-word-index={index}
                    style={{
                      fontSize: isActive ? 24 : 18,
                      fontWeight: isActive ? 700 : 400,
                      color: isActive 
                        ? 'var(--primary-text)' 
                        : isPast 
                        ? 'var(--secondary-text)' 
                        : 'var(--tertiary-text)',
                      transition: 'all 0.2s ease',
                      cursor: 'default',
                      display: 'inline-block',
                      lineHeight: 1.5,
                    }}
                    animate={{
                      scale: isActive ? 1.15 : 1,
                      y: isActive ? -2 : 0,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  >
                    {word}
                  </motion.span>
                );
              })}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Group words into lines based on timing and punctuation
 */
function groupWordsIntoLines(words) {
  const lines = [];
  let currentLine = { words: [], start: null, end: null };

  words.forEach((word, index) => {
    currentLine.words.push({ word: word.word, index });
    if (currentLine.start === null) {
      currentLine.start = word.start;
    }
    currentLine.end = word.end;

    // End line on punctuation or long pause
    const isPunctuation = /[.!?،؛]/.test(word.word);
    const nextWord = words[index + 1];
    const pause = nextWord ? nextWord.start - word.end : 0;

    if (isPunctuation || pause > 1.5 || currentLine.words.length >= 8) {
      lines.push({ ...currentLine });
      currentLine = { words: [], start: null, end: null };
    }
  });

  if (currentLine.words.length > 0) {
    lines.push(currentLine);
  }

  return lines;
}
