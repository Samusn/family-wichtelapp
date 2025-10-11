import { db } from "./config";
import { doc, getDoc, setDoc } from "firebase/firestore";

/* ==========================================================
   WISHLIST FUNCTIONS
   ========================================================== */

/**
 * Holt die Wunschliste eines Benutzers.
 * @param uid - Firebase Auth User ID
 * @returns Array von Strings (Wünsche)
 */
export const getWishlist = async (uid: string): Promise<string[]> => {
  const docRef = doc(db, "wishlist", uid);
  const docSnap = await getDoc(docRef);

  // Wenn Dokument existiert → return items, sonst leeres Array
  return docSnap.exists() ? docSnap.data().items || [] : [];
};

/**
 * Speichert die Wunschliste eines Benutzers.
 * Überschreibt das Dokument, wenn bereits vorhanden.
 * @param uid - Firebase Auth User ID
 * @param items - Array von Wünschen
 */
export const saveWishlist = async (uid: string, items: string[]) => {
  const docRef = doc(db, "wishlist", uid);
  await setDoc(docRef, { items });
};

/* ==========================================================
   USER / ACCOUNT FUNCTIONS
   ========================================================== */

/**
 * Interface für Benutzerdaten
 */
export interface UserData {
  email: string;
  name: string;
  role: string; // z.B. "admin" oder "user"
}

/**
 * Holt Benutzerdaten aus Firestore
 * @param uid - Firebase Auth User ID
 * @returns UserData oder null wenn nicht vorhanden
 */
export const getUserData = async (uid: string): Promise<UserData | null> => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return docSnap.data() as UserData;
};

/**
 * Speichert oder aktualisiert Benutzerdaten
 * @param uid - Firebase Auth User ID
 * @param data - Objekt mit UserData Feldern
 */
export const saveUserData = async (uid: string, data: UserData) => {
  const docRef = doc(db, "users", uid);
  await setDoc(docRef, data);
};
