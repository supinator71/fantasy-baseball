import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { getSession } from '@/lib/session';

export async function POST(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;

  if (!guid) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { trigger } = await request.json();
    let tokenType = null;
    let message = '';

    if (trigger === 'audit_aplus') {
      tokenType = 'titan_drop';
      message = 'Earned 1x Titan Syndicate Drop Pack token for a perfect A-Grade Team Audit!';
    } else if (trigger === 'audit_b') {
      tokenType = 'premium_hobby';
      message = 'Earned 1x Premium Hobby Box Pack token for a solid B-Grade Team Audit!';
    } else if (trigger === 'stolen_base_win') {
      tokenType = 'premium_hobby';
      message = 'Earned 1x Premium Hobby Box Pack token for projecting a Stolen Bases category win!';
    } else {
      return NextResponse.json({ error: `Invalid or unsupported trigger: ${trigger}` }, { status: 400 });
    }

    const tokens = db.awardToken(guid, tokenType, 1);

    return NextResponse.json({
      success: true,
      tokenEarned: tokenType,
      message,
      tokens
    });
  } catch (error) {
    console.error('Failed to award milestone token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
