import { NextRequest, NextResponse } from 'next/server';
// No need to import collection/addDoc from admin SDK
import { db, getAuth } from '@/firebase/firebaseAdmin';
// For server-side geocoding
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_GEOCODING_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// POST: Add outage report to the database
export async function POST(request: NextRequest) {
  try {
    // Get ID token from Authorization header
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    let decodedToken = null;
    console.log('[API] Received POST /api/outageReports');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1];
      try {
        decodedToken = await getAuth().verifyIdToken(idToken);
        console.log('[API] Decoded Firebase ID token:', decodedToken);
      } catch (err) {
        console.error('[API] Invalid or expired Firebase ID token', err);
        return NextResponse.json({ success: false, error: 'Unauthorized: Invalid or expired token' }, { status: 401 });
      }
    } else {
      console.error('[API] No Authorization header provided');
      return NextResponse.json({ success: false, error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    let body = null;
    try {
      body = await request.json();
      console.log('[API] Parsed request body:', body);
    } catch (err) {
      console.error('[API] Error parsing request body:', err);
      return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
    }

    // Use user info from decoded token
    const userEmail = decodedToken.email;
    const userUid = decodedToken.uid;
    const source = userEmail === 'alertshipdotco@gmail.com' ? 'official' : 'crowdsourced';

    // Geocode address on the server with detailed logging
    let lat = null, lng = null, geocodeStatus = null, geocodeError = null, geocodeApiResponse = null;
    try {
      let address = `${body.locality}, ${body.city}, ${body.state}`;
      if (body.pinCode) address += `, ${body.pinCode}`;
      console.log("[Geocoding] Address:", address);
      let geoRes = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
      );
      let geoData = await geoRes.json();
      geocodeApiResponse = geoData;
      console.log("[Geocoding] API response (with pin):", geoData);
      // If not found, try without pin code
      if ((!geoData.results || geoData.results.length === 0) && body.pinCode) {
        address = `${body.locality}, ${body.city}, ${body.state}`;
        console.log("[Geocoding] Retrying without pin code:", address);
        geoRes = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
        );
        geoData = await geoRes.json();
        geocodeApiResponse = geoData;
        console.log("[Geocoding] API response (without pin):", geoData);
      }
      geocodeStatus = geoData.status;
      if (geoData.status === "OK" && geoData.results.length > 0) {
        lat = geoData.results[0].geometry.location.lat;
        lng = geoData.results[0].geometry.location.lng;
        console.log("[Geocoding] Extracted lat/lng:", lat, lng);
      } else {
        console.warn("[Geocoding] No result found for address:", address);
      }
    } catch (geoErr) {
      geocodeError = (geoErr && typeof geoErr === 'object' && 'message' in geoErr) ? geoErr.message : String(geoErr);
      console.error("[Geocoding] Server-side geocoding failed", geoErr);
    }

    let docRef = null;
    try {
      docRef = await db.collection('outageReports').add({
        ...body,
        uid: userUid,
        email: userEmail,
        source,
        lat,
        lng,
        timestamp: new Date().toISOString()
      });
      console.log('[API] Successfully added outage report. Doc ID:', docRef.id);
    } catch (err) {
      console.error('[API] Error adding document to Firestore:', err);
      return NextResponse.json({ success: false, error: 'Failed to add report (Firestore error)' }, { status: 500 });
    }
    return NextResponse.json({
      success: true,
      id: docRef.id,
      geocodeStatus,
      geocodeError,
      lat,
      lng,
      geocodeApiResponse
    });
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

    let ref: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = db.collection('outageReports');
    if (city) {
      ref = ref.where('city', '==', city);
    }

    const snapshot = await ref.get();
    const reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ success: true, data: reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch reports" }, { status: 500 });
  }
} 