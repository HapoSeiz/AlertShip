import { NextRequest, NextResponse } from 'next/server';
import { app, getAuth } from '@/firebase/firebaseAdmin';
import { db as adminDb } from '@/firebase/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ success: false, error: 'ID token is required.' }, { status: 400 });
    }
    const auth = getAuth(app);
    const decodedToken = await auth.verifyIdToken(idToken);
    // decodedToken contains user info

    // Check if user document exists
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists) {
      await adminDb.collection('users').doc(decodedToken.uid).set({
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || '',
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true, user: decodedToken });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
} 