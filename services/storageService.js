import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { auth, db } from "../firebase";

const convertToBase64 = async (uri) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Image conversion error:", error);
    return null;
  }
};

export const uploadProfilePicture = async (uri) => {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const base64Image = await convertToBase64(uri);
    if (!base64Image) return null;

    await updateDoc(doc(db, "users", user.uid), {
      profileImageUrl: base64Image,
    });

    await updateDoc(doc(db, "workers", user.uid), {
      profileImageUrl: base64Image,
    }).catch(() => {});

    return base64Image;
  } catch (error) {
    console.error("Upload error:", error);
    return null;
  }
};

export const uploadWorkPhoto = async (uri, projectName, description) => {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const base64Image = await convertToBase64(uri);
    if (!base64Image) return null;

    const docRef = await addDoc(collection(db, "workImages"), {
      workerId: user.uid,
      imageUrl: base64Image,
      projectName: projectName || "Untitled",
      description: description || "",
      createdAt: serverTimestamp(),
    });

    return { url: base64Image, id: docRef.id };
  } catch (error) {
    console.error("Upload error:", error);
    return null;
  }
};

export const getWorkerPortfolio = async (workerId) => {
  const q = query(
    collection(db, "workImages"),
    where("workerId", "==", workerId),
    orderBy("createdAt", "desc"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
};

export const deleteWorkPhoto = async (imageId, imagePath) => {
  const user = auth.currentUser;
  if (!user) return;

  await deleteDoc(doc(db, "workImages", imageId));
};

export const subscribeToPortfolio = (workerId, callback) => {
  const q = query(
    collection(db, "workImages"),
    where("workerId", "==", workerId),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(q, (snapshot) => {
    const images = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(images);
  });
};

export const uploadWorkImage = uploadWorkPhoto;

export const getWorkerWorkImages = async (workerId) => {
  const q = query(
    collection(db, "workImages"),
    where("workerId", "==", workerId),
    orderBy("createdAt", "desc"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
};
