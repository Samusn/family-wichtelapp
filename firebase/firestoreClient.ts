import { db } from "./config";
import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  addDoc,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";

/* ==========================================================
   WISHLIST FUNCTIONS
   ========================================================== */

export interface WishItem {
  text: string;
  link?: string;
  imageUrl?: string;
}

export const getWishlist = async (uid: string): Promise<WishItem[]> => {
  const docRef = doc(db, "wishlist", uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data().items || [] : [];
};

export const saveWishlist = async (uid: string, items: WishItem[]) => {
  const docRef = doc(db, "wishlist", uid);
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
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return docSnap.data() as UserData;
};

export const saveUserData = async (uid: string, data: UserData) => {
  const docRef = doc(db, "users", uid);
  await setDoc(docRef, data);
};

/* ==========================================================
   FETCH ALL USERS WITH SPECIFIC ROLE
   ========================================================== */

/**
 * Holt alle Benutzer mit einer bestimmten Rolle (z. B. 'user')
 */
export const getAllUsersWithRole = async (
  role: string,
): Promise<UserData[]> => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("role", "==", role));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => doc.data() as UserData);
};

/* ==========================================================
   SECRET SANTA MESSAGES FUNCTIONS
   ========================================================== */

export interface SecretMessage {
  id?: string;
  senderId: string;
  senderName: string;
  receiverName: string;
  message: string;
  timestamp: any;
  read?: boolean;
}

/**
 * Sendet eine Secret Santa Nachricht
 */
export const sendSecretMessage = async (
  senderId: string,
  senderName: string,
  receiverName: string,
  message: string
): Promise<void> => {
  const messagesRef = collection(db, "secretMessages");
  await addDoc(messagesRef, {
    senderId,
    senderName,
    receiverName,
    message,
    timestamp: serverTimestamp(),
    read: false,
  });
};

/**
 * Markiert eine Nachricht als gelesen
 */
export const markMessageAsRead = async (messageId: string): Promise<void> => {
  const messageRef = doc(db, "secretMessages", messageId);
  await setDoc(messageRef, { read: true }, { merge: true });
};

/**
 * Holt alle Nachrichten, die ein User erhalten hat (basierend auf seinem Namen)
 */
export const getReceivedMessages = async (
  receiverName: string
): Promise<SecretMessage[]> => {
  const messagesRef = collection(db, "secretMessages");
  const q = query(
    messagesRef,
    where("receiverName", "==", receiverName),
    orderBy("timestamp", "asc") // ASC für Chat-Ansicht (neueste unten)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as SecretMessage[];
};

/**
 * Holt alle Nachrichten, die ein User gesendet hat
 */
export const getSentMessages = async (
  senderId: string
): Promise<SecretMessage[]> => {
  const messagesRef = collection(db, "secretMessages");
  const q = query(
    messagesRef,
    where("senderId", "==", senderId),
    orderBy("timestamp", "asc") // ASC für Chat-Ansicht (neueste unten)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as SecretMessage[];
};

/**
 * Real-time Listener für eingehende Nachrichten
 */
export const subscribeToReceivedMessages = (
  receiverName: string,
  callback: (messages: SecretMessage[]) => void
): (() => void) => {
  const messagesRef = collection(db, "secretMessages");
  const q = query(
    messagesRef,
    where("receiverName", "==", receiverName),
    orderBy("timestamp", "asc") // ASC für Chat-Ansicht (neueste unten)
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as SecretMessage[];
    callback(messages);
  });
};

/**
 * Real-time Listener für gesendete Nachrichten
 */
export const subscribeToSentMessages = (
  senderId: string,
  callback: (messages: SecretMessage[]) => void
): (() => void) => {
  const messagesRef = collection(db, "secretMessages");
  const q = query(
    messagesRef,
    where("senderId", "==", senderId),
    orderBy("timestamp", "asc") // ASC für Chat-Ansicht (neueste unten)
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as SecretMessage[];
    callback(messages);
  });
};
