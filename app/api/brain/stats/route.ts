import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    files: 40,
    entities: 31492,
    relationships: 89122,
    lastSync: new Date().toISOString(),
    status: 'healthy',
  });
}
