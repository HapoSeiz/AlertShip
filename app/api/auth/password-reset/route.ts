import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/firebase/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }
    const auth = getAuth();
    const link = await auth.generatePasswordResetLink(email);
    // Here you would send the link via your own email service if needed
    return NextResponse.json({ success: true, link });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
} 