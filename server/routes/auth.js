const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../db/database');

const YAHOO_AUTH_URL = 'https://api.login.yahoo.com/oauth2/request_auth';
const YAHOO_TOKEN_URL = 'https://api.login.yahoo.com/oauth2/get_token';

// Step 1: Redirect user to Yahoo login
router.get('/yahoo', (req, res) => {
  const redirect_uri = (process.env.YAHOO_REDIRECT_URI || 'https://goinyard.app/auth/callback').trim();
  const clientId = (process.env.YAHOO_CLIENT_ID || '').trim();
  
  console.log('Starting Yahoo auth. CLIENT_ID:', clientId ? 'SET' : 'MISSING', 'REDIRECT_URI:', redirect_uri);
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirect_uri,
    response_type: 'code',
    scope: 'fspt-r'
  });
  const redirectUrl = `${YAHOO_AUTH_URL}?${params.toString()}`;
  console.log('Redirecting to:', redirectUrl);
  res.redirect(redirectUrl);
});

// Step 2: Yahoo redirects back with auth code
router.get('/callback', async (req, res) => {
  console.log('OAuth callback received:', JSON.stringify(req.query));
  const { code, error, error_description } = req.query;
  if (error) return res.status(400).json({ error, error_description, query: req.query });
  if (!code) return res.status(400).json({ error: 'No authorization code received', query: req.query });

  try {
    const clientId = (process.env.YAHOO_CLIENT_ID || '').trim();
    const clientSecret = (process.env.YAHOO_CLIENT_SECRET || '').trim();
    
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const redirect_uri = (process.env.YAHOO_REDIRECT_URI || 'https://goinyard.app/auth/callback').trim();

    const response = await axios.post(YAHOO_TOKEN_URL,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirect_uri
      }),
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;
    const expiresAt = Date.now() + expires_in * 1000;

    // Fetch Yahoo user profile to get unique GUID
    let yahooGuid = null;
    let userName = null;
    let userEmail = null;
    try {
      const profile = await axios.get('https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1?format=json', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      const userNode = profile.data?.fantasy_content?.users?.['0']?.user?.[0];
      if (userNode) {
        yahooGuid = userNode.guid;
        userName = userNode.nickname || null;
      }
      userEmail = null; // Fantasy API doesn't return email, which is fine
      
      // Store user profile for subscription tracking
      if (yahooGuid) {
        db.setUserProfile(yahooGuid, {
          name: userName,
          email: userEmail,
          yahoo_guid: yahooGuid,
          created_at: db.getUserProfile(yahooGuid)?.created_at || Date.now()
        });
      }
    } catch (profileErr) {
      console.log('[Auth] Yahoo profile fetch skipped:', profileErr.message);
    }

    // Store tokens in session
    req.session.tokens = { access_token, refresh_token, expires_at: expiresAt };
    req.session.yahoo_guid = yahooGuid;

    // Store in DB for persistence keyed by user GUID
    if (yahooGuid) {
      db.setToken(yahooGuid, { access_token, refresh_token, expires_at: expiresAt });
    } else {
      console.error('[Auth] Failed to get yahooGuid. Token not saved to DB!');
    }

    res.redirect('/?auth=success');
  } catch (err) {
    console.error('Auth error:', err.response?.data || err.message);
    res.redirect('/?auth=error');
  }
});

// Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const guid = req.session?.yahoo_guid;
    if (!guid) return res.status(401).json({ error: 'Not authenticated (missing session guid)' });
    
    const row = db.getToken(guid);
    if (!row) return res.status(401).json({ error: 'Not authenticated (missing db token)' });

    const credentials = Buffer.from(
      `${process.env.YAHOO_CLIENT_ID}:${process.env.YAHOO_CLIENT_SECRET}`
    ).toString('base64');

    const response = await axios.post(YAHOO_TOKEN_URL,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: row.refresh_token
      }),
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;
    const expiresAt = Date.now() + expires_in * 1000;

    req.session.tokens = { access_token, refresh_token, expires_at: expiresAt };
    db.setToken(req.session.yahoo_guid, { access_token, refresh_token, expires_at: expiresAt });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// Check auth status
router.get('/status', (req, res) => {
  const yahooGuid = req.session?.yahoo_guid || null;
  const row = db.getToken(yahooGuid);
  const subscription = yahooGuid ? db.getSubscription(yahooGuid) : null;
  const aiUsage = yahooGuid ? db.getAiUsage(yahooGuid) : { count: 0 };
  
  res.json({ 
    authenticated: !!row, 
    expires_at: row?.expires_at,
    yahoo_guid: yahooGuid,
    subscription: subscription || { plan: 'free', max_leagues: 1 },
    ai_usage: aiUsage
  });
});

// Logout
router.post('/logout', (req, res) => {
  const guid = req.session?.yahoo_guid;
  if (guid) db.deleteToken(guid);
  req.session.destroy();
  res.json({ success: true });
});

module.exports = router;
