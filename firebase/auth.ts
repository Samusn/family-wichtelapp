import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { app } from "./config";

export const auth = getAuth(app);

export const login = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );
  return userCredential.user;
};

export const logout = async () => signOut(auth);

export const onUserChange = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback);
