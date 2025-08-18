import { NextResponse } from 'next/server';
import { db } from '@/firebase/firebaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;


export async function GET() {
  try {
    // Fetch the latest 4 reports, ordered by timestamp descending
    const snapshot = await db.collection('outageReports')
      .orderBy('timestamp', 'desc')
      .limit(4)
      .get();

    const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return new NextResponse(
      JSON.stringify({ reports }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store'
        }
      }
    );
  } catch (error) {
    console.error('Error fetching latest reports:', error);
    return NextResponse.json({ error: 'Failed to fetch latest reports.' }, { status: 500 });
  }
}
