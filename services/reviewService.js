import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    where,
} from "firebase/firestore";
import { auth, db } from "../firebase";

export const addReview = async (workImageId, workerId, rating, comment) => {
  const user = auth.currentUser;
  if (!user) return;

  const contractorDoc = await getDoc(doc(db, "users", user.uid));
  const contractorName = contractorDoc.data()?.fullName || "";
  const contractorCompany = contractorDoc.data()?.companyName || "";

  await addDoc(collection(db, "reviews"), {
    workImageId,
    workerId,
    contractorId: user.uid,
    contractorName,
    contractorCompany,
    rating,
    comment,
    createdAt: serverTimestamp(),
  });
};

export const getWorkImageReviews = async (workImageId) => {
  const q = query(
    collection(db, "reviews"),
    where("workImageId", "==", workImageId),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
};

export const getWorkerReviews = async (workerId) => {
  const q = query(collection(db, "reviews"), where("workerId", "==", workerId));
  const snapshot = await getDocs(q);
  const reviews = snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
  return { reviews, avgRating };
};
