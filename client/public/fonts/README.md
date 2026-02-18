# SF Pro Font Setup

This directory is for SF Pro font files.

## Where to Place Your Font File

**Place your SF Pro WOFF2 file in this directory:** `client/public/fonts/`

## Supported File Names

The CSS will automatically detect SF Pro files with these common naming patterns:

**For Regular (400 weight):**
- `SF-Pro-Display-Regular.woff2`
- `SF-Pro-Text-Regular.woff2`
- `SF-Pro-Regular.woff2`
- `sf-pro.woff2`

**For Medium (500 weight):**
- `SF-Pro-Display-Medium.woff2`
- `SF-Pro-Text-Medium.woff2`
- `SF-Pro-Medium.woff2`

**For Semibold (600 weight):**
- `SF-Pro-Display-Semibold.woff2`
- `SF-Pro-Text-Semibold.woff2`
- `SF-Pro-Semibold.woff2`

**For Bold (700 weight):**
- `SF-Pro-Display-Bold.woff2`
- `SF-Pro-Text-Bold.woff2`
- `SF-Pro-Bold.woff2`

## Single File Setup

If you only have one SF Pro file, rename it to one of the Regular weight names above (e.g., `sf-pro.woff2` or `SF-Pro-Regular.woff2`), and the app will use it for all weights.

## After Adding Fonts

Once you've added the font file(s), restart your dev server:
```bash
cd client
npm run dev
```

The app will automatically use SF Pro throughout the interface. If the font file isn't found, it will fall back to the system font (-apple-system on macOS/iOS, Segoe UI on Windows).
