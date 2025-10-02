require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Test endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// In-memory storage
let urls = [];
let counter = 1;

// POST /api/shorturl
app.post('/api/shorturl', (req, res) => {
  const inputUrl = req.body.url;

  // Must start with http:// or https://
  const regex = /^https?:\/\/(.*)/;

  if (!regex.test(inputUrl)) {
    return res.json({ error: 'invalid url' });
  }

  try {
    const urlObj = new URL(inputUrl);

    dns.lookup(urlObj.hostname, (err) => {
      if (err) return res.json({ error: 'invalid url' });

      let existing = urls.find(u => u.original_url === inputUrl);
      if (existing) return res.json(existing);

      let newEntry = { original_url: inputUrl, short_url: counter++ };
      urls.push(newEntry);

      res.json(newEntry);
    });
  } catch {
    res.json({ error: 'invalid url' });
  }
});

// GET /api/shorturl/:id
app.get('/api/shorturl/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const found = urls.find(u => u.short_url === id);

  if (found) {
    return res.redirect(found.original_url);
  } else {
    return res.json({ error: 'No short URL found' });
  }
});