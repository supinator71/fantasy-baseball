require('dotenv').config();
const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const yahooRoutes = require('./routes/yahoo');
const claudeRoutes = require('./routes/claude');
const draftRoutes = require('./routes/draft');
const mlbStatsRoutes = require('./routes/mlbStats');

const app = express();
const PORT = process.env.PORT || 3000;

// Required for Railway (behind reverse proxy) - enables secure cookies
app.set('trust proxy', 1);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use(session({
  store: new FileStore({ path: './server/db/sessions', retries: 0, logFn: () => {} }),
  secret: process.env.SESSION_SECRET || 'fantasy-baseball-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

// Rate Limiters
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 insights per hour
  message: { error: 'Our AI needs a quick breather! You\'ve reached your hourly insight limit. Check back soon.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const yahooLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 150, // 150 requests per hour
  message: { error: 'You are refreshing too fast! Please wait a moment before fetching more live data.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/auth', authRoutes);
app.use('/api/yahoo', yahooLimiter, yahooRoutes);
app.use('/api/claude', aiLimiter, claudeRoutes);
app.use('/api/draft', draftRoutes);
app.use('/api/mlb', mlbStatsRoutes);

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Fantasy Baseball Server running on port ${PORT}`);
});
