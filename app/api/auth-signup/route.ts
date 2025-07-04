import { NextRequest, NextResponse } from 'next/server';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { app as clientApp } from '@/firebase/firebase';
import { db as adminDb } from '@/firebase/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required.' }, { status: 400 });
    }
    const auth = getAuth(clientApp);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user document in Firestore 'users' collection
    await adminDb.collection('users').doc(user.uid).set({
      uid: user.uid,
      email: user.email,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
} 