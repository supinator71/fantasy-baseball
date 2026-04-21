const express = require('express');
const router = express.Router();
const db = require('../services/database');

router.post('/', (req, res) => {
  const { text } = req.body;
  const yahooGuid = req.session?.yahoo_guid;

  if (!text) return res.status(400).json({ error: 'Text required' });

  db.addFeedback(yahooGuid, text);
  res.json({ success: true });
});

module.exports = router;
