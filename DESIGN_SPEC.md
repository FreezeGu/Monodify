# Monody — Complete UI/UX Design Specification
## Premium Liquid Glass Music Streaming Experience

---

## Table of Contents
1. [Information Architecture & Screens](#information-architecture--screens)
2. [Navigation System](#navigation-system)
3. [Now Playing UI](#now-playing-ui)
4. [Mini Player](#mini-player)
5. [Liquid Glass Design System](#liquid-glass-design-system)
6. [UI Component Library](#ui-component-library)
7. [Feature List](#feature-list)
8. [Web Implementation Notes](#web-implementation-notes)

---

## 1. Information Architecture & Screens

### 1.1 Home / Listen Now
**Purpose**: Personalized discovery hub, equivalent to Apple Music's "Listen Now"

**Layout Structure**:
```
┌─────────────────────────────────┐
│ [Header: "Good [time], [Name]" ]│
│ [Search icon]                   │
├─────────────────────────────────┤
│ [Hero Section]                  │
│ - Large featured album/playlist │
│ - Play button overlay          │
├─────────────────────────────────┤
│ Recently Played (horizontal)   │
│ [Album] [Album] [Album] →      │
├─────────────────────────────────┤
│ Made for You                   │
│ [Mix card] [Mix card] →        │
├─────────────────────────────────┤
│ New Releases                    │
│ [Album grid 2x2] →             │
├─────────────────────────────────┤
│ Top Charts                     │
│ [Ranked list]                  │
├─────────────────────────────────┤
│ [Mini Player Dock]             │
└─────────────────────────────────┘
```

**Content Hierarchy**:
- **Hero**: Large glass card (elevated) with album art, title, artist, play button
- **Horizontal Scrolls**: Glass cards in carousel, swipeable
- **Grids**: 2-column on mobile, 3-4 on tablet/desktop
- **Lists**: Glass rows with artwork thumbnail, title, artist, duration

**Behavior**:
- Pull-to-refresh at top
- Infinite scroll (load more as user scrolls)
- Tap hero → full album page
- Tap card → album/playlist page
- Long-press → context menu (Add to Library, Share, etc.)

---

### 1.2 Browse
**Purpose**: Discover new content by category, genre, mood

**Layout Structure**:
```
┌─────────────────────────────────┐
│ Browse                          │
│ [Search]                        │
├─────────────────────────────────┤
│ Categories (horizontal tabs)    │
│ [All] [Nasheeds] [Quran] [Duas]│
├─────────────────────────────────┤
│ Featured                        │
│ [Large banner card]             │
├─────────────────────────────────┤
│ New & Notable                   │
│ [Grid 2x2]                      │
├─────────────────────────────────┤
│ Genres                          │
│ [Genre cards 2x2]               │
├─────────────────────────────────┤
│ Moods & Activities              │
│ [Mood cards horizontal]         │
└─────────────────────────────────┘
```

**Content Types**:
- Category cards: Large glass cards with genre image, title, play count
- Genre grid: Square glass tiles with icon/artwork
- Mood cards: Horizontal glass cards with gradient backgrounds

---

### 1.3 Search
**Purpose**: Find artists, albums, songs, playlists

**Layout Structure**:
```
┌─────────────────────────────────┐
│ [Search Bar (sticky top)]       │
├─────────────────────────────────┤
│ Recent Searches                 │
│ [Search chip] [Search chip]     │
├─────────────────────────────────┤
│ Top Results                     │
│ [Artist card]                   │
│ [Album card]                    │
│ [Song row]                      │
├─────────────────────────────────┤
│ Songs                           │
│ [List with artwork]             │
├─────────────────────────────────┤
│ Albums                          │
│ [Grid]                          │
├─────────────────────────────────┤
│ Artists                         │
│ [Grid]                          │
└─────────────────────────────────┘
```

**Behavior**:
- Real-time search as user types (debounced 300ms)
- Search suggestions dropdown (glass popover)
- Recent searches persist in localStorage
- Clear recent searches button
- Voice search button (optional)

---

### 1.4 Library
**Purpose**: User's saved content, playlists, downloads

**Layout Structure**:
```
┌─────────────────────────────────┐
│ Library                         │
│ [Filter/Sort button]            │
├─────────────────────────────────┤
│ [Segmented Control]             │
│ [Playlists] [Artists] [Albums]  │
│        [Songs] [Downloaded]     │
├─────────────────────────────────┤
│ [Content List/Grid]             │
│ - Playlist rows                 │
│ - Artist cards                  │
│ - Album grids                   │
│ - Song list                     │
└─────────────────────────────────┘
```

**Views**:
- **Playlists**: List with artwork, title, song count, edit button
- **Artists**: Grid 2x2 with circular artwork
- **Albums**: Grid 2x2 with square artwork
- **Songs**: List with artwork, title, artist, duration, menu
- **Downloaded**: Filtered view of offline content

**Actions**:
- Create playlist button (floating action button)
- Edit mode: Multi-select, delete, reorder
- Sort: Recently Added, A-Z, Recently Played

---

### 1.5 Now Playing (Full Screen)
**Purpose**: Immersive playback experience

**Layout Structure**:
```
┌─────────────────────────────────┐
│ [Drag handle]                   │
├─────────────────────────────────┤
│                                 │
│      [Album Art (large)]        │
│                                 │
├─────────────────────────────────┤
│ [Title]                         │
│ [Artist]                        │
├─────────────────────────────────┤
│ [Heart icon] [Lyrics] [Queue]   │
├─────────────────────────────────┤
│ [Progress scrubber]             │
│ [Current time]    [Duration]    │
├─────────────────────────────────┤
│ [Shuffle] [Previous] [Play]    │
│         [Next]                  │
│ [Repeat]                        │
├─────────────────────────────────┤
│ [Volume slider]                 │
│ [Output device selector]        │
└─────────────────────────────────┘
```

**Details**: See section 3

---

### 1.6 Queue
**Purpose**: View and reorder upcoming tracks

**Layout Structure**:
```
┌─────────────────────────────────┐
│ Queue                           │
│ [Clear Queue] [Shuffle]         │
├─────────────────────────────────┤
│ Now Playing                     │
│ [Current track - highlighted]   │
├─────────────────────────────────┤
│ Next                            │
│ [Track row]                     │
│ [Track row]                     │
│ [Track row]                     │
│ ...                             │
└─────────────────────────────────┘
```

**Behavior**:
- Drag handles on each row for reordering
- Swipe left to remove from queue
- Tap to jump to track
- Clear all button
- Shuffle queue button

---

### 1.7 Lyrics
**Purpose**: Display synchronized lyrics

**Layout Structure**:
```
┌─────────────────────────────────┐
│ Lyrics                          │
│ [Font size] [Share]             │
├─────────────────────────────────┤
│                                 │
│ [Lyric line]                    │
│ [Highlighted lyric line]        │
│ [Lyric line]                    │
│                                 │
│ (scrollable, auto-scrolls)      │
│                                 │
└─────────────────────────────────┘
```

**Behavior**:
- Auto-scrolls to current lyric
- Highlight current line (animated)
- Font size adjustment
- Share lyric snippet (optional)
- Falls back to static lyrics if sync unavailable

---

### 1.8 Album Page
**Purpose**: View album details and tracklist

**Layout Structure**:
```
┌─────────────────────────────────┐
│ [Back button]                   │
├─────────────────────────────────┤
│ [Large album art]               │
│ [Title]                         │
│ [Artist] [Follow button]        │
│ [Play button] [Shuffle]         │
├─────────────────────────────────┤
│ [Description/About]             │
├─────────────────────────────────┤
│ Tracklist                       │
│ 1. [Track row]                  │
│ 2. [Track row]                  │
│ 3. [Track row]                  │
└─────────────────────────────────┘
```

**Actions**:
- Play album (starts from track 1)
- Shuffle album
- Add to Library
- Share album
- Follow artist

---

### 1.9 Artist Page
**Purpose**: Artist profile, discography, related artists

**Layout Structure**:
```
┌─────────────────────────────────┐
│ [Back]                          │
├─────────────────────────────────┤
│ [Artist image/avatar]           │
│ [Artist name]                   │
│ [Follow button] [Shuffle]       │
├─────────────────────────────────┤
│ Popular                         │
│ [Top 5 tracks list]             │
├─────────────────────────────────┤
│ Albums                          │
│ [Album grid]                    │
├─────────────────────────────────┤
│ Singles & EPs                   │
│ [Album grid]                    │
├─────────────────────────────────┤
│ Related Artists                 │
│ [Artist cards horizontal]       │
└─────────────────────────────────┘
```

---

### 1.10 Playlist Page
**Purpose**: View playlist details, edit tracks

**Layout Structure**:
```
┌─────────────────────────────────┐
│ [Back] [Edit] [More]            │
├─────────────────────────────────┤
│ [Playlist artwork]              │
│ [Playlist name]                 │
│ [Description]                   │
│ [Play] [Shuffle]                │
├─────────────────────────────────┤
│ [Owner info] [Song count]       │
├─────────────────────────────────┤
│ Tracklist                       │
│ [Track rows with drag handles]  │
└─────────────────────────────────┘
```

**Edit Mode**:
- Drag to reorder
- Swipe to delete
- Add songs button
- Change artwork
- Edit name/description

---

### 1.11 Downloads / Offline
**Purpose**: Manage offline content

**Layout Structure**:
```
┌─────────────────────────────────┐
│ Downloads                      │
│ [Download quality selector]    │
├─────────────────────────────────┤
│ Downloaded Albums               │
│ [Album grid]                    │
├─────────────────────────────────┤
│ Downloaded Playlists            │
│ [Playlist list]                 │
└─────────────────────────────────┘
```

**Features**:
- Download quality settings (High, Standard, Low)
- Storage usage indicator
- Auto-download toggle for playlists
- Remove downloads

---

### 1.12 Settings
**Purpose**: App preferences and account management

**Layout Structure**:
```
┌─────────────────────────────────┐
│ Settings                       │
├─────────────────────────────────┤
│ Account                         │
│ [Profile] [Subscription]        │
├─────────────────────────────────┤
│ Playback                        │
│ [Crossfade] [Gapless]          │
│ [Audio Quality]                 │
├─────────────────────────────────┤
│ Downloads                       │
│ [Quality] [Storage location]    │
├─────────────────────────────────┤
│ Appearance                      │
│ [Theme] [Background]            │
├─────────────────────────────────┤
│ Privacy & Data                  │
│ [Clear cache] [Export data]     │
└─────────────────────────────────┘
```

---

### 1.13 Profile
**Purpose**: User profile, public settings

**Layout Structure**:
```
┌─────────────────────────────────┐
│ [Edit]                          │
├─────────────────────────────────┤
│ [Profile picture]               │
│ [Display name]                  │
│ [@username]                     │
│ [Bio]                           │
├─────────────────────────────────┤
│ Stats                           │
│ [Playlists] [Followers] [Following]
├─────────────────────────────────┤
│ Public Playlists                │
│ [Playlist grid]                 │
└─────────────────────────────────┘
```

---

### 1.14 Recently Played
**Purpose**: History of played content

**Layout Structure**:
```
┌─────────────────────────────────┐
│ Recently Played                │
│ [Clear History]                 │
├─────────────────────────────────┤
│ [Grouped by date]               │
│ Today                           │
│ [Track rows with timestamps]    │
│ Yesterday                       │
│ [Track rows]                    │
└─────────────────────────────────┘
```

---

### 1.15 Favorites / Liked
**Purpose**: User's liked songs

**Layout Structure**:
```
┌─────────────────────────────────┐
│ Liked Songs                    │
│ [Play] [Shuffle]               │
├─────────────────────────────────┤
│ [Track list]                    │
└─────────────────────────────────┘
```

---

## 2. Navigation System

### 2.1 Bottom Tab Bar
**Structure**:
- Fixed at bottom, above safe area
- 5 tabs: Home, Browse, Search, Library, Profile
- Active tab: Highlighted with accent color and icon state
- Inactive tabs: Muted with secondary text color

**Behavior**:
- Tap to navigate
- Badge indicators (e.g., new content)
- Swipe between tabs (optional, mobile)

**Liquid Glass Styling**:
- Glass background: `rgba(0, 0, 0, 0.2)` with `blur(20px)`
- Border top: `1px solid rgba(255, 255, 255, 0.1)`
- Specular highlight: `inset 0 1px 0 rgba(255, 255, 255, 0.05)`
- Shadow: `0 -4px 24px rgba(0, 0, 0, 0.2)`

---

### 2.2 Mini Player Dock
**Position**: Between content and tab bar

**Behavior**:
- **Collapsed**: Shows album art thumbnail, title, artist, play/pause, skip forward
- **Expanding**: Tap or swipe up → full Now Playing screen
- **Sticky**: Remains visible while scrolling content
- **Transform**: Smooth scale/translate on expand/collapse

**Scroll Behavior**:
- Content scrolls behind mini player
- Mini player stays fixed
- On scroll down: Slight fade/scale down (optional)
- On scroll up: Return to full opacity

---

### 2.3 Gesture Patterns

#### Swipe to Expand Player
- **Swipe up on mini player**: Expands to full screen
- **Swipe down on full player**: Collapses to mini player
- **Threshold**: 30% of screen height
- **Animation**: Spring physics, 400ms duration

#### Swipe on List Rows
- **Swipe left**: Reveal actions (Add to Queue, Remove, etc.)
- **Swipe right**: Reveal secondary actions (Share, etc.)
- **Threshold**: 50px
- **Snap back**: If threshold not met

#### Long-Press Context Menus
- **Trigger**: 500ms hold
- **Feedback**: Haptic (if available) + visual highlight
- **Menu**: Glass popover with actions
- **Position**: Near touch point, avoid edges

#### Pull-to-Refresh
- **Trigger**: Pull down at top of scrollable content
- **Indicator**: Glass spinner/loader
- **Threshold**: 80px
- **Release**: Triggers refresh

#### Back Navigation
- **Mobile**: Swipe from left edge OR back button
- **Desktop**: Browser back OR back button in header
- **Animation**: Slide out right, slide in left

---

### 2.4 Desktop Adaptations
- **Sidebar Navigation**: Replace bottom tabs with left sidebar
- **Multi-column Layouts**: 3-4 columns for grids
- **Hover States**: All interactive elements
- **Keyboard Navigation**: Full support (Tab, Enter, Arrow keys)
- **Right-click Context Menus**: Desktop-specific actions

---

## 3. Now Playing UI

### 3.1 Layout Specification

**Container**:
- Full viewport height (minus safe areas)
- Glass background: `rgba(0, 0, 0, 0.25)` with `blur(30px)`
- Backdrop: Blurred album art or background image

**Drag Handle**:
- Top center, 40px width, 4px height
- Rounded pill shape
- Glass styling: `rgba(255, 255, 255, 0.2)` with `blur(10px)`
- Drag down to dismiss

**Album Art**:
- Size: 80vw max width, square aspect ratio
- Border radius: 24px
- Shadow: `0 20px 60px rgba(0, 0, 0, 0.4)`
- Position: Centered, 40px from top (after handle)

**Title & Artist**:
- Title: 28px font, bold, white
- Artist: 18px font, regular, `rgba(255, 255, 255, 0.7)`
- Spacing: 16px gap between title and artist
- Alignment: Center, 32px below album art

**Action Row**:
- Heart, Lyrics, Queue icons
- Size: 24px icons, 48px touch targets
- Spacing: 32px gap between icons
- Alignment: Center, 24px below artist

**Progress Scrubber**:
- Height: 4px track, 20px thumb
- Track: Glass with `rgba(0, 0, 0, 0.2)` background
- Fill: White with `rgba(255, 255, 255, 0.3)` overlay
- Thumb: White circle, 20px diameter
- Time labels: 12px font, `rgba(255, 255, 255, 0.6)`
- Spacing: 16px above and below scrubber

**Playback Controls**:
- Previous, Play/Pause, Next buttons
- Size: 64px touch targets (Play), 48px (Previous/Next)
- Spacing: 24px gap between buttons
- Alignment: Center, 32px below progress

**Secondary Controls**:
- Shuffle, Repeat buttons
- Size: 32px icons, 48px touch targets
- Position: Below playback controls, 24px gap

**Volume & Output**:
- Volume slider: Same styling as progress scrubber
- Output selector: Glass button, shows current device
- Position: Bottom, 24px above safe area

---

### 3.2 States & Animations

**Loading State**:
- Skeleton loader with glass shimmer effect
- Album art: Pulsing glass placeholder
- Controls: Disabled with reduced opacity

**Playing State**:
- Play button → Pause icon
- Album art: Subtle scale animation (1.0 → 1.02, loop)
- Progress: Smooth update every 100ms

**Paused State**:
- Pause button → Play icon
- Album art: Static

**Error State**:
- Toast notification (glass)
- Retry button
- Error message

**Transitions**:
- **Open**: Slide up from bottom, 400ms spring
- **Close**: Slide down, 300ms ease-out
- **Track Change**: Crossfade album art, 300ms
- **Control Press**: Scale down to 0.9, 100ms

---

## 4. Mini Player

### 4.1 Structure

**Container**:
- Height: 56px
- Width: 100% (minus 32px horizontal padding)
- Position: Fixed, above tab bar
- Border radius: 16px
- Glass background: `rgba(0, 0, 0, 0.15)` with `blur(20px)`
- Border: `1px solid rgba(255, 255, 255, 0.1)`
- Shadow: `0 4px 24px rgba(0, 0, 0, 0.2)`

**Content Layout**:
```
[Album Art 40x40] [Title/Artist] [Play] [Skip]
```

**Album Art**:
- Size: 40px × 40px
- Border radius: 8px
- Margin: 8px left, 12px right

**Text**:
- Title: 14px, bold, white, truncate
- Artist: 12px, regular, `rgba(255, 255, 255, 0.7)`, truncate
- Container: Flex, flex-grow, min-width 0 (for truncation)
- Margin: 0 12px

**Controls**:
- Play/Pause: 24px icon, 40px touch target
- Skip Forward: 20px icon, 36px touch target
- Gap: 8px between controls
- Margin: 8px right

---

### 4.2 Expand Behavior

**Trigger**:
- Tap anywhere on mini player
- Swipe up gesture

**Animation**:
- Start: Mini player position
- End: Full screen Now Playing
- Duration: 400ms spring animation
- Easing: `cubic-bezier(0.175, 0.885, 0.32, 1.275)`

**Transform Origin**:
- Album art scales from mini player position
- Text fades and repositions
- Controls fade out, new controls fade in

---

### 4.3 Scroll Behavior

**Sticky**:
- Mini player remains fixed while content scrolls
- Content padding-bottom: 80px (mini player height + gap)

**Scroll Effects** (Optional):
- On scroll down: Slight opacity reduction (1.0 → 0.9)
- On scroll up: Return to full opacity
- Smooth transition: 200ms

---

## 5. Liquid Glass Design System

### 5.1 Design Tokens

#### Blur Levels
```css
--blur-xs: 8px;      /* Subtle, for small elements */
--blur-sm: 12px;     /* Small cards, inputs */
--blur-md: 20px;     /* Standard cards, buttons */
--blur-lg: 30px;     /* Large panels, modals */
--blur-xl: 40px;     /* Full-screen overlays */
```

#### Opacity Ranges (Background)
```css
--glass-bg-subtle: rgba(0, 0, 0, 0.1);    /* Very transparent */
--glass-bg-base: rgba(0, 0, 0, 0.15);    /* Standard */
--glass-bg-elevated: rgba(0, 0, 0, 0.2);  /* Elevated cards */
--glass-bg-ultra: rgba(0, 0, 0, 0.25);   /* Modals, sheets */
--glass-bg-overlay: rgba(0, 0, 0, 0.3);  /* Dark overlays */
```

#### Border (Hairline)
```css
--glass-border-subtle: rgba(255, 255, 255, 0.08);
--glass-border-base: rgba(255, 255, 255, 0.1);
--glass-border-visible: rgba(255, 255, 255, 0.15);
--glass-border-strong: rgba(255, 255, 255, 0.2);
```

#### Specular Highlights
```css
--glass-highlight-subtle: rgba(255, 255, 255, 0.05);
--glass-highlight-base: rgba(255, 255, 255, 0.1);
--glass-highlight-visible: rgba(255, 255, 255, 0.15);
```

#### Saturation
```css
--glass-saturate-subtle: 1.1;
--glass-saturate-base: 1.2;
--glass-saturate-strong: 1.3;
```

#### Corner Radius Scale
```css
--radius-xs: 8px;    /* Small buttons, chips */
--radius-sm: 12px;   /* Inputs, small cards */
--radius-md: 16px;   /* Standard cards */
--radius-lg: 20px;   /* Large cards, panels */
--radius-xl: 24px;   /* Modals, sheets */
--radius-full: 999px; /* Pills, circles */
```

#### Spacing Scale
```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 12px;
--space-lg: 16px;
--space-xl: 24px;
--space-2xl: 32px;
--space-3xl: 48px;
--space-4xl: 64px;
```

#### Typography Scale
```css
--text-xs: 11px;
--text-sm: 12px;
--text-base: 14px;
--text-md: 16px;
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 28px;
--text-4xl: 32px;
```

#### Shadows
```css
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.15);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.2);
--shadow-xl: 0 12px 32px rgba(0, 0, 0, 0.25);
--shadow-inset: inset 1px 1px 0 rgba(255, 255, 255, 0.1);
```

---

### 5.2 Material Layers

#### Base Glass
- Background: `rgba(0, 0, 0, 0.15)`
- Blur: `20px`
- Border: `1px solid rgba(255, 255, 255, 0.1)`
- Use: Standard cards, buttons, inputs

#### Elevated Glass
- Background: `rgba(0, 0, 0, 0.2)`
- Blur: `20px`
- Border: `1px solid rgba(255, 255, 255, 0.15)`
- Shadow: `0 8px 24px rgba(0, 0, 0, 0.2)`
- Use: Hovered cards, active buttons, modals

#### Ultra-Elevated Glass
- Background: `rgba(0, 0, 0, 0.25)`
- Blur: `30px`
- Border: `1px solid rgba(255, 255, 255, 0.2)`
- Shadow: `0 12px 32px rgba(0, 0, 0, 0.3)`
- Use: Full-screen overlays, Now Playing, bottom sheets

#### Overlay Glass
- Background: `rgba(0, 0, 0, 0.3)`
- Blur: `40px`
- Border: `1px solid rgba(255, 255, 255, 0.1)`
- Use: Dark overlays behind modals, context menus

---

### 5.3 Background Compatibility

#### Readability Rules
1. **Text Contrast**: Always ensure WCAG AA contrast (4.5:1 for normal text)
2. **Dark Overlay**: Apply dark gradient overlay on bright backgrounds
3. **Text Shadows**: Subtle text shadow for readability: `0 1px 2px rgba(0, 0, 0, 0.3)`
4. **Adaptive Borders**: Increase border opacity on bright areas
5. **Backdrop Dimming**: Dim background image when glass overlays are present

#### Implementation
```css
/* Adaptive text shadow */
.text-on-glass {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* Dark overlay for bright backgrounds */
.glass-overlay-bright {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.4) 0%,
    rgba(0, 0, 0, 0.2) 100%
  );
}

/* Enhanced border on bright areas */
.glass-bright-area {
  border-color: rgba(255, 255, 255, 0.25);
}
```

---

### 5.4 Motion & Animation

#### Timing Functions
```css
--ease-out: cubic-bezier(0.0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
```

#### Durations
```css
--duration-fast: 150ms;
--duration-base: 200ms;
--duration-slow: 300ms;
--duration-slower: 400ms;
```

#### Transitions
- **Hover**: 200ms ease-out
- **Active/Press**: 100ms ease-in
- **Page Transitions**: 300ms ease-in-out
- **Modal Open/Close**: 400ms spring
- **Player Expand/Collapse**: 400ms spring

---

### 5.5 Light/Dark Mode Rules

#### Dark Mode (Default)
- Glass backgrounds: Dark (`rgba(0, 0, 0, ...)`)
- Text: Light (`#ffffff`, `rgba(255, 255, 255, 0.7)`)
- Borders: Light (`rgba(255, 255, 255, ...)`)

#### Light Mode (Optional)
- Glass backgrounds: Light (`rgba(255, 255, 255, ...)`)
- Text: Dark (`#000000`, `rgba(0, 0, 0, 0.7)`)
- Borders: Dark (`rgba(0, 0, 0, ...)`)
- Adjust opacity values for light mode

---

## 6. UI Component Library

### 6.1 Glass Buttons

#### Primary Button
```css
.glass-btn-primary {
  background: rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(20px) saturate(1.2);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #ffffff;
  padding: 12px 24px;
  border-radius: 20px;
  font-size: 15px;
  font-weight: 500;
  box-shadow: 
    inset 1px 1px 0 rgba(255, 255, 255, 0.1),
    0 4px 16px rgba(0, 0, 0, 0.15);
}

.glass-btn-primary:hover {
  background: rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.2);
}

.glass-btn-primary:active {
  transform: scale(0.98);
  box-shadow: inset 1px 1px 2px rgba(0, 0, 0, 0.2);
}
```

#### Secondary Button
- Same as primary, but with `rgba(255, 255, 255, 0.1)` border
- Lower opacity background

#### Tertiary Button
- Text-only, no background
- Hover: Add subtle glass background

#### Icon Button
- Circular, 40px diameter
- Same glass styling
- Icon centered, 20px size

#### Disabled State
- Opacity: 0.4
- Pointer-events: none
- Cursor: not-allowed

---

### 6.2 Glass Sliders

#### Progress Scrubber
```css
.glass-slider-track {
  height: 4px;
  background: rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(20px);
  border-radius: 2px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-slider-fill {
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(8px);
  border-radius: 2px;
}

.glass-slider-thumb {
  width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  box-shadow: 
    inset 1px 1px 0 rgba(255, 255, 255, 1),
    0 2px 6px rgba(0, 0, 0, 0.25);
}
```

**States**:
- Default: Thumb hidden until hover
- Hover: Thumb appears, scale 1.0
- Active/Dragging: Thumb scale 1.2, enhanced shadow

---

### 6.3 Glass List Rows

```css
.glass-list-row {
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.glass-list-row:hover {
  background: rgba(0, 0, 0, 0.15);
}

.glass-list-row:active {
  background: rgba(0, 0, 0, 0.2);
}
```

**Content**:
- Artwork thumbnail (40px)
- Title, Artist (flex-grow)
- Duration (right-aligned)
- Menu button (optional)

---

### 6.4 Glass Cards/Tiles

```css
.glass-card {
  background: rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(20px) saturate(1.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 
    inset 1px 1px 0 rgba(255, 255, 255, 0.1),
    0 4px 16px rgba(0, 0, 0, 0.15);
}

.glass-card:hover {
  background: rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}
```

**Variants**:
- **Album Card**: Square artwork, title, artist
- **Playlist Card**: Artwork grid, title, song count
- **Artist Card**: Circular artwork, name

---

### 6.5 Glass Bottom Sheets

```css
.glass-bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(30px) saturate(1.2);
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.3);
  max-height: 90vh;
  overflow-y: auto;
}
```

**Behavior**:
- Drag handle at top
- Swipe down to dismiss
- Backdrop dimming behind sheet

---

### 6.6 Glass Modals

```css
.glass-modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.glass-modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(40px);
}

.glass-modal-content {
  position: relative;
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(30px) saturate(1.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 24px;
  max-width: 90vw;
  max-height: 90vh;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}
```

---

### 6.7 Glass Popovers

```css
.glass-popover {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(20px) saturate(1.2);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  min-width: 200px;
}
```

**Positioning**:
- Arrow/triangle pointing to trigger
- Avoid viewport edges
- Reposition on scroll

---

### 6.8 Glass Context Menus

```css
.glass-context-menu {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(20px) saturate(1.2);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  min-width: 180px;
}

.glass-context-menu-item {
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.glass-context-menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
}
```

---

### 6.9 Glass Search Bar

```css
.glass-search-bar {
  background: rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(20px) saturate(1.2);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.glass-search-bar input {
  background: transparent;
  border: none;
  outline: none;
  color: #ffffff;
  flex: 1;
  font-size: 16px;
}

.glass-search-bar:focus-within {
  border-color: rgba(255, 255, 255, 0.25);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
}
```

---

### 6.10 Glass Segmented Control

```css
.glass-segmented-control {
  background: rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 4px;
  display: flex;
  gap: 4px;
}

.glass-segmented-control-item {
  flex: 1;
  padding: 8px 16px;
  border-radius: 8px;
  text-align: center;
  transition: all 200ms;
}

.glass-segmented-control-item.active {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  box-shadow: inset 1px 1px 0 rgba(255, 255, 255, 0.1);
}
```

---

### 6.11 Glass Tabs

```css
.glass-tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-tab {
  padding: 12px 20px;
  border-bottom: 2px solid transparent;
  color: rgba(255, 255, 255, 0.6);
  transition: all 200ms;
}

.glass-tab.active {
  color: #ffffff;
  border-bottom-color: rgba(255, 255, 255, 0.3);
}
```

---

### 6.12 Glass Toast/Snackbar

```css
.glass-toast {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(20px) saturate(1.2);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 300px;
  max-width: 90vw;
}
```

**Position**: Bottom center, above mini player
**Animation**: Slide up from bottom, fade in
**Auto-dismiss**: 3 seconds (configurable)

---

### 6.13 Skeleton Loaders (Shimmer)

```css
.glass-skeleton {
  background: rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(20px);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.glass-skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 100%
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

---

## 7. Feature List

### 7.1 Playback Features

#### Gapless Playback
- **Value**: Smooth transitions between tracks
- **UX**: No silence between tracks in albums/playlists
- **Placement**: Settings → Playback → "Gapless Playback" toggle

#### Crossfade (Optional)
- **Value**: Overlapping audio for smooth transitions
- **UX**: Fade out current, fade in next (1-12 seconds)
- **Placement**: Settings → Playback → Crossfade slider

#### Queue Management
- **Value**: Control playback order
- **UX**: Queue screen, drag to reorder, swipe to remove
- **Placement**: Queue button in Now Playing, context menu "Add to Queue"

#### Repeat Modes
- **Value**: Control playback loop
- **UX**: Off → All → One (cycle on repeat button)
- **Placement**: Repeat button in Now Playing

#### Shuffle
- **Value**: Randomize playback order
- **UX**: Toggle shuffle button, visual indicator
- **Placement**: Shuffle button in Now Playing, album/playlist pages

---

### 7.2 Library Features

#### Add/Remove from Library
- **Value**: Save favorite content
- **UX**: Heart icon, "Add to Library" in context menu
- **Placement**: Everywhere (cards, rows, Now Playing)

#### Downloads/Offline
- **Value**: Listen without internet
- **UX**: Download button, offline indicator, Downloads screen
- **Placement**: Album/playlist pages, Settings → Downloads

#### Smart Playlists (Optional)
- **Value**: Auto-generated playlists based on criteria
- **UX**: Create playlist → "Smart Playlist" option
- **Placement**: Library → Playlists → Create

---

### 7.3 Discovery Features

#### Recommendations
- **Value**: Discover new content
- **UX**: "Made for You" section on Home
- **Placement**: Home screen, prominent placement

#### Mixes
- **Value**: Curated playlists for user
- **UX**: Large cards with artwork, "Play" button
- **Placement**: Home screen, Browse

#### Radio-like Stations
- **Value**: Continuous playback based on seed
- **UX**: "Start Station" from artist/song
- **Placement**: Context menu, artist pages

---

### 7.4 Search Features

#### Recent Searches
- **Value**: Quick access to past searches
- **UX**: Chips below search bar
- **Placement**: Search screen, top section

#### Search Suggestions
- **Value**: Faster search, autocomplete
- **UX**: Dropdown popover as user types
- **Placement**: Search bar, real-time

---

### 7.5 Lyrics Features

#### Synchronized Lyrics
- **Value**: Follow along with music
- **UX**: Auto-scrolling, highlighted current line
- **Placement**: Lyrics button in Now Playing, full-screen view

#### Share Lyric Snippet (Optional)
- **Value**: Share favorite lyrics
- **UX**: Long-press lyric line → Share
- **Placement**: Lyrics screen, context menu

---

### 7.6 Social Features (Optional)

#### Sharing
- **Value**: Share content with others
- **UX**: Share button → native share sheet
- **Placement**: Context menus, Now Playing

#### Collaborative Playlists (Optional)
- **Value**: Multiple users edit same playlist
- **UX**: "Collaborative" toggle in playlist settings
- **Placement**: Playlist page → Edit → Settings

---

### 7.7 Audio Quality Features

#### Quality Badges
- **Value**: Show audio quality (High, Lossless, Hi-Res)
- **UX**: Badge on album/track cards
- **Placement**: Album pages, track rows

#### Quality Settings
- **Value**: Control streaming/download quality
- **UX**: Settings → Audio Quality → Select quality
- **Placement**: Settings screen

---

### 7.8 Personalization Features

#### Play History
- **Value**: Track listening habits
- **UX**: Recently Played screen, grouped by date
- **Placement**: Library → Recently Played

#### Liked Content
- **Value**: Quick access to favorites
- **UX**: Favorites/Liked screen, heart icon everywhere
- **Placement**: Library → Liked Songs

#### "Made for You" Content
- **Value**: Personalized recommendations
- **UX**: Dedicated section on Home
- **Placement**: Home screen, top section

---

### 7.9 Accessibility Features

#### Keyboard Navigation
- **Value**: Use app without mouse/touch
- **UX**: Tab, Enter, Arrow keys, Escape
- **Placement**: All interactive elements

#### Screen Reader Support
- **Value**: Use with assistive technology
- **UX**: ARIA labels, semantic HTML, announcements
- **Placement**: All components

#### Reduced Motion
- **Value**: Respect user preferences
- **UX**: Disable animations if `prefers-reduced-motion`
- **Placement**: Global CSS, respect system setting

---

## 8. Web Implementation Notes

### 8.1 DOM Structure Per Screen

#### Standard Screen Template
```html
<div class="app-shell">
  <div class="app-background"></div>
  <header class="glass-header">
    <!-- Header content -->
  </header>
  <main class="main-content">
    <!-- Screen-specific content -->
  </main>
  <div class="mini-player-container">
    <!-- Mini player -->
  </div>
  <nav class="bottom-nav liquid-glass-menu">
    <!-- Tab bar -->
  </nav>
</div>
```

#### Now Playing Overlay
```html
<div class="player-overlay">
  <div class="glass-filter"></div>
  <div class="glass-overlay"></div>
  <div class="glass-specular"></div>
  <div class="glass-content">
    <!-- Now Playing content -->
  </div>
</div>
```

---

### 8.2 Backdrop-Filter Performance

#### Optimization Strategies
1. **Limit Blur Amount**: Use minimum blur needed (20px standard)
2. **Reduce Saturation**: Lower saturation values (1.2 vs 1.8)
3. **Use `will-change`**: Hint browser for transform/opacity changes
4. **Isolate Stacking Contexts**: Use `isolation: isolate` on glass layers
5. **Avoid Nested Blurs**: Don't blur already-blurred elements
6. **Use `transform: translateZ(0)`**: Force GPU acceleration

#### Fallback for Browsers Without Backdrop-Filter
```css
.glass-element {
  background: rgba(0, 0, 0, 0.3); /* Darker fallback */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

@supports not (backdrop-filter: blur(20px)) {
  .glass-element {
    background: rgba(0, 0, 0, 0.4); /* More opaque fallback */
  }
}
```

---

### 8.3 Layering Strategy (Z-Index)

```css
/* Z-index scale */
--z-base: 1;
--z-elevated: 10;
--z-sticky: 50;
--z-mini-player: 99;
--z-nav: 100;
--z-modal-backdrop: 999;
--z-modal: 1000;
--z-toast: 1001;
--z-tooltip: 1002;
```

**Rules**:
- Use CSS variables for consistency
- Avoid arbitrary high values
- Document z-index usage
- Test stacking contexts

---

### 8.4 Keeping Blur Consistent While Scrolling

#### Problem
- Backdrop-filter can cause performance issues during scroll
- Blur may appear inconsistent if content moves

#### Solutions
1. **Fixed Background**: Keep background image fixed
2. **Throttle Scroll Events**: Update blur/effects max 60fps
3. **Use `position: fixed`**: For glass overlays that shouldn't scroll
4. **Transform Instead of Position**: Use `transform: translateY()` for scroll

---

### 8.5 Responsive Behavior

#### Breakpoints
```css
--breakpoint-sm: 640px;   /* Mobile */
--breakpoint-md: 768px;   /* Tablet */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large desktop */
```

#### Mobile-First Approach
- Base styles for mobile
- Use `min-width` media queries
- Adjust grid columns: 1 → 2 → 3 → 4
- Adjust spacing: Smaller on mobile, larger on desktop
- Adjust typography: Smaller on mobile

#### Touch Targets
- Minimum 44px × 44px (iOS HIG)
- 48px × 48px recommended
- Adequate spacing between targets (8px minimum)

---

### 8.6 Implementation Checklist

#### HTML Structure
- [ ] Semantic HTML5 elements
- [ ] ARIA labels where needed
- [ ] Proper heading hierarchy
- [ ] Alt text for images

#### CSS
- [ ] CSS variables for tokens
- [ ] Mobile-first responsive design
- [ ] Backdrop-filter fallbacks
- [ ] Reduced motion support
- [ ] Print styles (optional)

#### JavaScript
- [ ] Debounce scroll/resize events
- [ ] Throttle animation updates
- [ ] Lazy load images/content
- [ ] Handle touch gestures
- [ ] Keyboard navigation
- [ ] Focus management for modals

#### Performance
- [ ] Optimize images (WebP, lazy loading)
- [ ] Minimize reflows/repaints
- [ ] Use CSS transforms for animations
- [ ] Code splitting for large apps
- [ ] Service worker for offline (optional)

---

## Conclusion

This design specification provides a complete blueprint for building a premium liquid glass music streaming app that feels like Apple Music while maintaining a consistent glassmorphism aesthetic. Follow these guidelines to ensure:

1. **Consistency**: Every UI element uses liquid glass
2. **Premium Feel**: Subtle depth, fine borders, specular highlights
3. **Accessibility**: Readable on any background, keyboard/screen reader support
4. **Performance**: Optimized blur, smooth animations
5. **Polish**: Apple-level attention to detail

Implement incrementally, test on real devices, and iterate based on user feedback.

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-15  
**Author**: Design System Team
