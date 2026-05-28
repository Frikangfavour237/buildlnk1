import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password,
    );
    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
    const userData = userDoc.exists() ? userDoc.data() : null;

    if (!userDoc.exists() || userData?.blocked) {
      await signOut(auth);
      return {
        success: false,
        blocked: true,
        error: "Your account has been suspended. Contact support.",
      };
    }

    return {
      success: true,
      user: userCredential.user,
      profile: userData ? { id: userDoc.id, ...userData } : null,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const registerUser = async (
  email,
  password,
  fullName,
  phone,
  role,
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password,
    );
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      fullName,
      email: email.trim(),
      phone,
      role,
      blocked: false,
      createdAt: serverTimestamp(),
    });

    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export async function getUserProfile(uid) {
  const snapshot = await getDoc(doc(db, "users", uid));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function logoutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function getCurrentUser() {
  return auth.currentUser;
}
