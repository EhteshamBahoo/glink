import { NextResponse } from 'next/server';
import { getStats } from '@/lib/brain';

export async function GET() {
  try {
    const stats = getStats();
    return NextResponse.json({
      files: stats.files,
      entities: stats.entities,
      relationships: stats.relationships,
      sources: stats.sources,
      lastSync: new Date().toISOString(),
      status: 'healthy',
    });
  } catch (e) {
    return NextResponse.json({
      files: 0, entities: 0, relationships: 0,
      lastSync: new Date().toISOString(),
      status: 'error',
    });
  }
}
