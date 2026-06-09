import { NextResponse } from 'next/server';
import { getNormalized2026Stats } from '@/lib/statsPipeline';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get('sport')?.toLowerCase(); // mlb, nba, nfl
    const prospectsOnly = searchParams.get('prospects') === 'true';

    const normalizedData = getNormalized2026Stats();

    // 1. If only prospects requested
    if (prospectsOnly) {
      return NextResponse.json({
        success: true,
        prospects: normalizedData.prospects,
        timestamp: Date.now()
      });
    }

    // 2. If a specific sport is requested
    if (sport) {
      const sportData = normalizedData.sports[sport];
      if (!sportData) {
        return NextResponse.json({ error: `Invalid sport: ${sport}` }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        sport,
        players: sportData,
        timestamp: Date.now()
      });
    }

    // 3. Return complete feed
    return NextResponse.json({
      success: true,
      sports: normalizedData.sports,
      prospects: normalizedData.prospects,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Failed to retrieve 2026 stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
