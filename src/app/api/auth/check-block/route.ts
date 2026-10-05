import { NextRequest, NextResponse } from 'next/server';
import { isDeviceBlocked } from '@/lib/security-storage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get('deviceId') || '';
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.ip;

    const blockCheck = await isDeviceBlocked(deviceId, ip);

    return NextResponse.json({
      blocked: blockCheck.blocked,
      record: blockCheck.record,
    });
  } catch (error) {
    console.error('Check block GET error:', error);
    return NextResponse.json({ blocked: false }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { deviceId } = await req.json();
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.ip;

    const blockCheck = await isDeviceBlocked(deviceId || '', ip);

    return NextResponse.json({
      blocked: blockCheck.blocked,
      record: blockCheck.record,
    });
  } catch (error) {
    console.error('Check block error:', error);
    return NextResponse.json({ blocked: false }, { status: 500 });
  }
}

