require('dotenv').config();
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const yahooRoutes = require('./routes/yahoo');
const claudeRoutes = require('./routes/claude');
const draftRoutes = require('./routes/draft');
const mlbStatsRoutes = require('./routes/mlbStats');
const stripeRoutes = require('./routes/stripe');
const { checkAiLimit } = require('./middleware/subscription');

const app = express();
const PORT = process.env.PORT || 3000;

// Required for Railway (behind reverse proxy) - enables secure cookies
app.set('trust proxy', 1);

app.use(cors({ origin: true, credentials: true }));

// Stripe webhook needs raw body BEFORE json parsing
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
const fs = require('fs');

app.use(express.json());

const DB_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

app.use(session({
  store: new SQLiteStore({ db: 'sessions.sqlite', dir: './server/data' }),
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

const { router: trophyRoutes } = require('./routes/trophy');

app.use('/auth', authRoutes);
app.use('/api/yahoo', yahooLimiter, yahooRoutes);
app.use('/api/claude', aiLimiter, checkAiLimit, claudeRoutes);
app.use('/api/draft', draftRoutes);
app.use('/api/mlb', mlbStatsRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/trophy', trophyRoutes);

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
