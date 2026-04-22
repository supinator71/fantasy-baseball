import { NextResponse } from 'next/server';
import { getLeagues } from '@/lib/yahooService';
import { getSession } from '@/lib/session';

export async function GET(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;

  if (!guid) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const data = await getLeagues(guid);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
