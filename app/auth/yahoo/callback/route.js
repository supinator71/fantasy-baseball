import { NextResponse } from 'next/server';
import axios from 'axios';
import { getSession } from '@/lib/session';
import { db } from '@/lib/database';

// Use public app URL — request.url resolves to Railway's internal localhost:8080
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://goinyard.app').replace(/\/$/, '');

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    console.error('[Auth Callback] No code received');
    return NextResponse.redirect(`${APP_URL}/`);
  }

  const clientId     = process.env.YAHOO_CLIENT_ID?.trim();
  const clientSecret = process.env.YAHOO_CLIENT_SECRET?.trim();
  const redirectUri  = process.env.YAHOO_REDIRECT_URI?.trim() || 'https://goinyard.app/auth/yahoo/callback';

  if (!clientId || !clientSecret) {
    console.error('[Auth Callback] Missing YAHOO_CLIENT_ID or YAHOO_CLIENT_SECRET');
    return NextResponse.redirect(`${APP_URL}/?error=server_config_error`);
  }

  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    console.log('[Auth Callback] Exchanging code for token...');

    const { data } = await axios.post(
      'https://api.login.yahoo.com/oauth2/get_token',
      new URLSearchParams({
        client_id:     clientId,
        client_secret: clientSecret,
        redirect_uri:  redirectUri,
        code,
        grant_type: 'authorization_code',
      }),
      {
        headers: {
          Authorization:  `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    console.log('[Auth Callback] Token exchange response:', data);
    let guid = data.xoauth_yahoo_guid || data.guid;

    // If GUID is missing from token response, fetch it from the profile API
    if (!guid) {
      console.log('[Auth Callback] GUID missing from token response, fetching from profile API...');
      try {
        const profileResponse = await axios.get(
          'https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1?format=json',
          { headers: { Authorization: `Bearer ${data.access_token}` } }
        );
        const userNode = profileResponse.data?.fantasy_content?.users?.['0']?.user?.[0];
        if (userNode) guid = userNode.guid;
      } catch (profileErr) {
        console.error('[Auth Callback] Profile fetch failed:', profileErr.message);
      }
    }

    if (!guid) throw new Error('Failed to retrieve Yahoo GUID');

    const expiresAt = Date.now() + data.expires_in * 1000;
    console.log('[Auth Callback] Success! GUID:', guid);

    db.setToken(guid, {
      access_token:  data.access_token,
      refresh_token: data.refresh_token,
      expires_at:    expiresAt,
    });

    const session = await getSession();
    session.yahoo_guid = guid;
    await session.save();

    return NextResponse.redirect(`${APP_URL}/`);
  } catch (err) {
    console.error('Yahoo Auth Error:', err.response?.data || err.message);
    return NextResponse.redirect(`${APP_URL}/?error=auth_failed`);
  }
}
