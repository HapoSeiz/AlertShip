// lib/firestoreHelpers.ts
import { db } from "@/lib/firebase"
import {
  collection,
  getDocs,
  query,
  where,
  DocumentData,
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
