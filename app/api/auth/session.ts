import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // TODO: Implement actual session logic if needed
  return NextResponse.json({ user: null });
}
