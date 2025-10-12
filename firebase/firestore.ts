import { db } from './config';
import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
} from 'firebase/firestore';

/* ==========================================================
   WISHLIST FUNCTIONS
   ========================================================== */

export const getWishlist = async (uid: string): Promise<string[]> => {
  const docRef = doc(db, 'wishlist', uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data().items || [] : [];
};

export const saveWishlist = async (uid: string, items: string[]) => {
  const docRef = doc(db, 'wishlist', uid);
  await setDoc(docRef, { items });
};

/* ==========================================================
   USER / ACCOUNT FUNCTIONS
   ========================================================== */

export interface UserData {
  email: string;
  name: string;
  role: string; // z. B. "admin" oder "user"
}

export const getUserData = async (uid: string): Promise<UserData | null> => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return docSnap.data() as UserData;
};

export const saveUserData = async (uid: string, data: UserData) => {
  const docRef = doc(db, 'users', uid);
  await setDoc(docRef, data);
};

/* ==========================================================
   FETCH ALL USERS WITH SPECIFIC ROLE
   ========================================================== */

/**
 * Holt alle Benutzer mit einer bestimmten Rolle (z. B. 'user')
 */
export const getAllUsersWithRole = async (role: string): Promise<UserData[]> => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('role', '==', role));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => doc.data() as UserData);
};
