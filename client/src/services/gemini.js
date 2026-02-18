// Google Gemini API service for translating lyrics

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// Fallback: Use Google Cloud Translation if Gemini not available
// For now, we'll use a simple word-by-word approach if Gemini fails
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1';

/**
 * Translate text using Gemini API
 */
export async function translateWithGemini(text, targetLanguage = 'en', sourceLanguage = 'ar') {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  try {
    const prompt = `Translate the following ${sourceLanguage === 'ar' ? 'Arabic' : sourceLanguage} text to ${targetLanguage === 'en' ? 'English' : targetLanguage}. 
    
Preserve the meaning and style. Return only the translation, no explanations:

${text}`;

    // Try multiple model names in order of preference
    const modelsToTry = [
      'gemini-1.5-flash',      // Fast, versatile
      'gemini-1.5-pro',        // More intelligent
      'gemini-flash-latest',   // Latest flash alias
      'gemini-pro-latest',     // Latest pro alias
      'gemini-2.5-flash',      // Newer model
    ];

    let lastError = null;
    let response = null;

    for (const modelName of modelsToTry) {
      try {
        response = await fetch(
          `${GEMINI_BASE_URL}/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: prompt,
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (response.ok) {
          break; // Success, exit loop
        } else {
          const errorData = await response.json();
          lastError = errorData.error?.message || 'Translation failed';
          // Continue to next model
        }
      } catch (err) {
        lastError = err.message;
        // Continue to next model
      }
    }

    if (!response || !response.ok) {
      throw new Error(lastError || 'Translation failed - no working model found');
    }

    const data = await response.json();
    const translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!translatedText) {
      throw new Error('No translation returned');
    }

    return translatedText;
  } catch (error) {
    console.error('Gemini translation error:', error);
    throw error;
  }
}

/**
 * Translate lyrics with word-level timestamps
 * Maps translated words back to original timestamps
 */
export async function translateLyrics(lyrics, targetLanguage = 'en', sourceLanguage = 'ar') {
  try {
    // Group words into sentences/phrases for better translation
    const sentences = groupWordsIntoSentences(lyrics);
    
    // Translate each sentence
    const translatedSentences = await Promise.all(
      sentences.map(async (sentence) => {
        const text = sentence.words.map(w => w.word).join(' ');
        const translated = await translateWithGemini(text, targetLanguage, sourceLanguage);
        return {
          ...sentence,
          translatedText: translated,
        };
      })
    );

    // Split translated text back into words and map to timestamps
    const translatedLyrics = [];
    translatedSentences.forEach((sentence) => {
      const translatedWords = sentence.translatedText.split(/\s+/).filter(w => w.trim());
      const originalWords = sentence.words;
      
      // Distribute timestamps proportionally
      const totalDuration = sentence.end - sentence.start;
      const wordDuration = totalDuration / Math.max(translatedWords.length, originalWords.length);
      
      translatedWords.forEach((word, index) => {
        const start = sentence.start + (index * wordDuration);
        const end = start + wordDuration;
        
        translatedLyrics.push({
          word: word.trim(),
          start: Math.max(sentence.start, start),
          end: Math.min(sentence.end, end),
          confidence: originalWords[0]?.confidence || 0.8,
        });
      });
    });

    return translatedLyrics;
  } catch (error) {
    console.error('Lyrics translation error:', error);
    throw error;
  }
}

/**
 * Group words into sentences based on punctuation and timing
 */
function groupWordsIntoSentences(words) {
  const sentences = [];
  let currentSentence = { words: [], start: null, end: null };

  words.forEach((word) => {
    currentSentence.words.push(word);
    if (currentSentence.start === null) {
      currentSentence.start = word.start;
    }
    currentSentence.end = word.end;

    // End sentence on punctuation or long pause (>1 second)
    const isPunctuation = /[.!?،؛]/.test(word.word);
    const nextWord = words[words.indexOf(word) + 1];
    const pause = nextWord ? nextWord.start - word.end : 0;

    if (isPunctuation || pause > 1.0) {
      sentences.push({ ...currentSentence });
      currentSentence = { words: [], start: null, end: null };
    }
  });

  if (currentSentence.words.length > 0) {
    sentences.push(currentSentence);
  }

  return sentences;
}

/**
 * Alternative: Use Google Cloud Translation API (faster, better for word-by-word)
 * This requires a different API key setup
 */
export async function translateWithGoogleTranslate(text, targetLanguage = 'en', sourceLanguage = 'ar') {
  // Note: This would require Google Cloud Translation API key
  // For now, we'll use Gemini as it's simpler to set up
  return translateWithGemini(text, targetLanguage, sourceLanguage);
}
