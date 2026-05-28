import {
    increment,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "../firebase";

export async function createWorkerProfile(uid, profileData) {
  const workerRef = doc(db, "workers", uid);
  const payload = {
    uid,
    ...profileData,
    bio: profileData.bio || "",
    skills: profileData.skills || [profileData.skillCategory].filter(Boolean),
    certifications: profileData.certifications || [],
    profileImageUrl: profileData.profileImageUrl || null,
    availability: profileData.availability || "available",
    createdAt: serverTimestamp(),
  };

  await setDoc(workerRef, payload, { merge: true });
  return { id: uid, ...payload };
}

export async function getWorkers(filters = {}) {
  let workersQuery = collection(db, "workers");

  if (filters.skill) {
    workersQuery = query(
      workersQuery,
      where("skills", "array-contains", filters.skill),
    );
  }

  if (filters.location) {
    workersQuery = query(
      workersQuery,
      where("location", "==", filters.location),
    );
  }

  if (filters.availability) {
    workersQuery = query(
      workersQuery,
      where("availability", "==", filters.availability),
    );
  }

  const snapshot = await getDocs(workersQuery);
  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}

export async function getWorkerProfile(uid) {
  const snapshot = await getDoc(doc(db, "workers", uid));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function updateWorkerAvailability(uid, availability) {
  await updateDoc(doc(db, "workers", uid), { availability });
}

export async function incrementWorkerProfileViews(uid) {
  await updateDoc(doc(db, "workers", uid), {
    profileViews: increment(1),
  });
}

export async function getWorkerMobilisations(uid) {
  const mobilisationsRef = collection(db, "mobilisations");
  const mobilisationsQuery = query(
    mobilisationsRef,
    where("workerId", "==", uid),
  );
  const snapshot = await getDocs(mobilisationsQuery);
  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}
