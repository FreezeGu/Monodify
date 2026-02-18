/**
 * Liquid Glass Music Player - 100% browser-based.
 * No server-side processing; metadata & artwork read in-browser. No installs required.
 */
document.addEventListener('DOMContentLoaded', async () => {
    // === DOM Element References ===
    const fileInput = document.getElementById('fileInput');
    const audio = document.getElementById('audioPlayer');
    const backgroundBlur = document.getElementById('background-blur');
    const fileSelectContainer = document.querySelector('.file-select-container');
    const playerWrapper = document.getElementById('player-wrapper');
    const distortedBg = document.getElementById('player-ui-distorted-bg');
    const playerUIGlass = document.getElementById('player-ui-glass');
    const albumArt = document.getElementById('albumArt');
    const artistNameEl = document.getElementById('artistName');
    const songTitleEl = document.getElementById('songTitle');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // === State ===
    let isPlaying = false;
    let hasStartedPlayback = false;
    let isUIVisible = true;
    let isInFullscreen = false;
    let isMinimalMode = false;
    let currentAudioBlobUrl = null;
    let currentArtworkBlobUrl = null;
    let mouseHideTimer;

    function revokeBlobUrls() {
        if (currentAudioBlobUrl) {
            URL.revokeObjectURL(currentAudioBlobUrl);
            currentAudioBlobUrl = null;
        }
        if (currentArtworkBlobUrl) {
            URL.revokeObjectURL(currentArtworkBlobUrl);
            currentArtworkBlobUrl = null;
        }
    }

    // === File selection: read metadata & artwork in browser, play via blob URL ===
    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        revokeBlobUrls();
        loadingOverlay.style.opacity = '1';
        loadingOverlay.style.pointerEvents = 'auto';

        const fallbackTitle = file.name.replace(/\.[^.]*$/, '') || 'Unknown Title';
        let title = fallbackTitle;
        let artist = 'Unknown Artist';
        let artworkUrl = null;

        function buildArtworkUrl(picture) {
            if (!picture || !picture.data) return null;
            const data = picture.data;
            const mime = picture.format || picture.imageFormat || picture.mimeType || 'image/jpeg';
            const bytes = data instanceof Uint8Array ? data : new Uint8Array(Array.isArray(data) ? data : Array.from(data));
            const blob = new Blob([bytes], { type: mime });
            return URL.createObjectURL(blob);
        }

        // 1) Try jsmediatags first (best for MP3/ID3, MP4, FLAC, OGG)
        if (typeof globalThis.jsmediatags !== 'undefined') {
            try {
                const tag = await new Promise((resolve, reject) => {
                    globalThis.jsmediatags.read(file, { onSuccess: resolve, onError: reject });
                });
                if (tag && tag.tags) {
                    if (tag.tags.title) title = tag.tags.title;
                    if (tag.tags.artist) artist = tag.tags.artist;
                    if (tag.tags.album) { /* optional: could show album */ }
                    const pic = tag.tags.picture;
                    if (pic) {
                        currentArtworkBlobUrl = buildArtworkUrl({ data: pic.data, format: pic.format });
                        if (currentArtworkBlobUrl) artworkUrl = currentArtworkBlobUrl;
                    }
                }
            } catch (e) {
                console.warn('jsmediatags read failed, trying fallback:', e.message);
            }
        }

        // 2) Fallback: music-metadata-browser (more formats / different tag layouts)
        const needMore = !artworkUrl || title === fallbackTitle || artist === 'Unknown Artist';
        if (needMore) {
            try {
                const mm = await import('https://cdn.skypack.dev/music-metadata-browser');
                const parseBlob = mm.parseBlob || (mm.default && mm.default.parseBlob) || mm.default;
                const metadata = await parseBlob(file);
                if (metadata && metadata.common) {
                    if (metadata.common.title) title = metadata.common.title;
                    if (metadata.common.artist) artist = metadata.common.artist;
                }
                if (!artworkUrl) {
                    const pictureList = (metadata && ((metadata.common && metadata.common.picture) || metadata.picture)) || [];
                    const picture = Array.isArray(pictureList) ? pictureList[0] : pictureList;
                    if (picture && picture.data) {
                        currentArtworkBlobUrl = buildArtworkUrl(picture);
                        if (currentArtworkBlobUrl) artworkUrl = currentArtworkBlobUrl;
                    }
                }
            } catch (metaErr) {
                console.warn('Fallback metadata parse failed:', metaErr.message);
            }
        }

        try {
            currentAudioBlobUrl = URL.createObjectURL(file);
            audio.src = currentAudioBlobUrl;
            audio.crossOrigin = 'anonymous';
            hasStartedPlayback = false;
            audio.load();

            artistNameEl.textContent = artist;
            songTitleEl.textContent = title;

            if (artworkUrl) {
                backgroundBlur.style.backgroundImage = `url(${artworkUrl})`;
                distortedBg.style.backgroundImage = `url(${artworkUrl})`;
                backgroundBlur.classList.add('active');
                albumArt.src = artworkUrl;
                albumArt.style.display = 'block';
            } else {
                backgroundBlur.style.backgroundImage = 'none';
                distortedBg.style.backgroundImage = 'none';
                backgroundBlur.classList.remove('active');
                albumArt.src = '';
                albumArt.style.display = 'none';
            }

            fileSelectContainer.style.display = 'none';
            playerWrapper.classList.remove('hidden');
            resetUIForNewSong();
        } catch (error) {
            console.error('Error setting up playback:', error);
            alert('Could not play this file. The format may not be supported by your browser.');
        } finally {
            loadingOverlay.style.opacity = '0';
            loadingOverlay.style.pointerEvents = 'none';
        }
    });

    // === Audio Playback ===
    function playAudio() { audio.play(); }
    function pauseAudio() { audio.pause(); }

    audio.addEventListener('play', () => { isPlaying = true; });
    audio.addEventListener('pause', () => { isPlaying = false; });

    audio.addEventListener('ended', () => {
        pauseAudio();
        audio.currentTime = 0;
        revokeBlobUrls();
    });

    audio.addEventListener('canplay', () => {
        if (!hasStartedPlayback) {
            playAudio();
            hasStartedPlayback = true;
        }
    });

    audio.addEventListener('loadedmetadata', () => {
        if (isFinite(audio.duration)) {
            durationEl.textContent = formatTime(audio.duration);
        }
    });

    audio.addEventListener('timeupdate', () => {
        currentTimeEl.textContent = formatTime(audio.currentTime);
        const progress = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
        if (progressBarFill) progressBarFill.style.width = `${progress}%`;
    });

    // === Keyboard Shortcuts ===
    function toggleUIVisibility() {
        isUIVisible = !isUIVisible;
        document.querySelectorAll('.setting-item').forEach(el => {
            el.classList.toggle('ui-hidden', !isUIVisible);
        });
    }

    function handleKeyPress(event) {
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
        const key = event.key.toLowerCase();
        switch (key) {
            case 'h': toggleUIVisibility(); break;
            case ' ': if (audio.src) isPlaying ? pauseAudio() : playAudio(); break;
            case 'r': if (audio.src) { audio.currentTime = 0; if (!isPlaying) playAudio(); } break;
            case 'f': toggleFullscreen(); break;
            case 'v': toggleMinimalView(); break;
            default: return;
        }
        event.preventDefault();
    }
    document.addEventListener('keydown', handleKeyPress);

    // === Fullscreen ===
    function toggleFullscreen() {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
        else if (document.exitFullscreen) document.exitFullscreen();
    }

    function handleFullscreenChange() {
        isInFullscreen = !!document.fullscreenElement;
        if (isInFullscreen) {
            resetMouseHideTimer();
            document.addEventListener('mousemove', resetMouseHideTimer);
        } else {
            showCursor();
            clearTimeout(mouseHideTimer);
            document.removeEventListener('mousemove', resetMouseHideTimer);
        }
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    function hideCursor() { document.body.style.cursor = 'none'; }
    function showCursor() { document.body.style.cursor = 'default'; }
    function resetMouseHideTimer() {
        if (isInFullscreen) {
            showCursor();
            clearTimeout(mouseHideTimer);
            mouseHideTimer = setTimeout(hideCursor, 3000);
        }
    }

    // === Minimal View ===
    function toggleMinimalView() {
        isMinimalMode = !isMinimalMode;
        playerUIGlass.classList.toggle('minimal-mode', isMinimalMode);
        const container = document.querySelector('.container');
        if (container) container.classList.toggle('minimal-active', isMinimalMode);
        if (playerWrapper) playerWrapper.classList.toggle('minimal-active', isMinimalMode);
    }

    // === Helpers ===
    function formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function resetUIForNewSong() {
        currentTimeEl.textContent = '00:00';
        durationEl.textContent = audio.duration ? formatTime(audio.duration) : '00:00';
    }
});
