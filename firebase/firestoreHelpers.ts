// firebase/firestoreHelpers.ts
import { db } from "@/firebase/firebase"
import {
  collection,
  getDocs,
  query,
  where,
  DocumentData,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore"

export interface OutageReport extends DocumentData {
  id: string
  type: "electricity" | "water"
  description: string
  locality: string
  city: string
  state: string
  pinCode: string
  photo?: string | null
  reportedAt?: string
}

export const fetchOutageReportsByCity = async (cityName: string) => {
    const outagesRef = collection(db, "outageReports")
    const q = query(outagesRef, where("city", "==", cityName))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  }

export const fetchOutageReportsByUid = async (uid: string) => {
  const outagesRef = collection(db, "outageReports");
  const q = query(outagesRef, where("uid", "==", uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// User Profile and Saved Locations Helpers
export interface SavedLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  locality: string;
  city: string;
  state: string;
}

export const fetchUserProfile = async (uid: string) => {
  const userDocRef = doc(db, "users", uid);
  const userSnap = await getDoc(userDocRef);
  if (userSnap.exists()) {
    return userSnap.data();
  }
  return null;
};

export const saveUserProfile = async (uid: string, profile: any) => {
  const userDocRef = doc(db, "users", uid);
  await setDoc(userDocRef, profile, { merge: true });
};

export const addSavedLocation = async (uid: string, location: SavedLocation) => {
  const userDocRef = doc(db, "users", uid);
  await updateDoc(userDocRef, {
    savedLocations: arrayUnion(location),
  });
};

export const removeSavedLocation = async (uid: string, location: SavedLocation) => {
  const userDocRef = doc(db, "users", uid);
  await updateDoc(userDocRef, {
    savedLocations: arrayRemove(location),
  });
};

export const updateSavedLocations = async (uid: string, locations: SavedLocation[]) => {
  const userDocRef = doc(db, "users", uid);
  await updateDoc(userDocRef, {
    savedLocations: locations,
  });
};

export const fetchNotificationSettings = async (uid: string) => {
  const userDocRef = doc(db, "users", uid);
  const userSnap = await getDoc(userDocRef);
  if (userSnap.exists()) {
    return userSnap.data().notificationSettings || null;
  }
  return null;
};

export const updateNotificationSettings = async (uid: string, notificationSettings: any) => {
  const userDocRef = doc(db, "users", uid);
  await updateDoc(userDocRef, {
    notificationSettings,
  });
};

export const isEmailInUse = async (email: string, excludeUid?: string) => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", email));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return false;
  if (!excludeUid) return true;
  // If excludeUid is provided, ignore the current user's own document
  return snapshot.docs.some(doc => doc.data().uid !== excludeUid);
};
