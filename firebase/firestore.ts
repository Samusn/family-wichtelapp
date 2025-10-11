import { db } from "./config";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Wunschliste abrufen
export const getWishlist = async (uid: string): Promise<string[]> => {
  const docRef = doc(db, "wishlist", uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data().items || [] : [];
};

// Wunschliste speichern
export const saveWishlist = async (uid: string, items: string[]) => {
  const docRef = doc(db, "wishlist", uid);
  await setDoc(docRef, { items });
};
