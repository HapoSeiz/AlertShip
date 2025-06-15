import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, getDocs, query, where, Query, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// POST: Add outage report to the database
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const docRef = await addDoc(collection(db, 'outageReports'), {
      ...body,
      timestamp: new Date().toISOString()
    });
    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error("Error adding document:", error);
    return NextResponse.json({ success: false, error: "Failed to add report" }, { status: 500 });
  }
}

// GET: Retrieve outage reports from the database
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');

    let q: Query<DocumentData> = collection(db, 'outageReports');
    
    if (city) {
      q = query(q, where('city', '==', city));
    }

    const querySnapshot = await getDocs(q);
    const reports = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ success: true, data: reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch reports" }, { status: 500 });
  }
} 