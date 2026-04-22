import { NextResponse } from 'next/server';

const YAHOO_AUTH_URL = 'https://api.login.yahoo.com/oauth2/request_auth';

export async function GET() {
  const clientId = process.env.YAHOO_CLIENT_ID?.trim();
  const redirectUri = process.env.YAHOO_REDIRECT_URI?.trim();

  console.log('[Auth] Initiating Yahoo OAuth:', { clientId, redirectUri });

  if (!clientId) {
    return NextResponse.json({ error: 'YAHOO_CLIENT_ID is not configured' }, { status: 500 });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri || 'https://localhost:3000/auth/yahoo/callback',
    response_type: 'code',
    scope: 'fspt-r',
  });

  return NextResponse.redirect(`${YAHOO_AUTH_URL}?${params.toString()}`);
}
