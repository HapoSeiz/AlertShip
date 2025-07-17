import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, getDocs, query, where, Query, DocumentData } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import { getAuth } from '@/firebase/firebaseAdmin';
// For server-side geocoding
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_GEOCODING_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// POST: Add outage report to the database
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let userEmail = body.email;
    // If uid is provided, fetch email from Firebase Admin
    if (body.uid) {
      try {
        const userRecord = await getAuth().getUser(body.uid);
        userEmail = userRecord.email;
      } catch (e) {
        // fallback to body.email if lookup fails
      }
    }
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

    const docRef = await addDoc(collection(db, 'outageReports'), {
      ...body,
      uid: body.uid,
      email: userEmail,
      source,
      lat,
      lng,
      timestamp: new Date().toISOString()
    });
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