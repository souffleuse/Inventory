// Inventory server — API + static file serving
// Dev:  node server.cjs          (port 3001, proxied by Vite)
// Prod: PORT=80 node server.cjs  (serves built React app + API)

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'inventory.json');
const DIST_DIR = path.join(__dirname, 'dist');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Ensure data directory and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ items: [], rooms: [] }, null, 2), 'utf-8');
  console.log(`Created data file: ${DATA_FILE}`);
}

// GET /api/inventory — read full data
app.get('/api/inventory', (req, res) => {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    res.json(JSON.parse(raw));
  } catch (err) {
    res.status(500).json({ error: 'Failed to read data file' });
  }
});

// POST /api/inventory — overwrite full data
app.post('/api/inventory', (req, res) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2), 'utf-8');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to write data file' });
  }
});

// Serve built React app (production)
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  // SPA fallback — all non-API routes return index.html
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
  console.log(`Serving React app from: ${DIST_DIR}`);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Inventory server → http://localhost:${PORT}`);
  console.log(`Data file        → ${DATA_FILE}`);
});
