const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 6969;
const clientDist = path.join(__dirname, 'client', 'dist');
const hasClientBuild = fs.existsSync(clientDist);

// API (for future auth, uploads to server, etc.)
app.get('/api/health', (req, res) => res.json({ ok: true, app: 'Monody' }));

// Static files from project root (legacy / shared assets)
app.use('/static', express.static(path.join(__dirname, 'static')));

if (hasClientBuild) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    const p = path.join(clientDist, req.path);
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return res.sendFile(p);
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
}

app.listen(PORT, () => {
  console.log(`Monody running at http://127.0.0.1:${PORT}`);
  if (!hasClientBuild) console.log('Tip: Build React app with: cd client && npm install && npm run build');
});
