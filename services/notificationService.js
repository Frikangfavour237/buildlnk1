import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";

export const createNotification = async (
  recipientUid,
  type,
  message,
  relatedId = null,
) => {
  await addDoc(collection(db, "notifications", recipientUid, "items"), {
    type,
    message,
    relatedId,
    read: false,
    createdAt: serverTimestamp(),
  });
};

export const subscribeToNotifications = (uid, callback) => {
  const q = query(
    collection(db, "notifications", uid, "items"),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));
    callback(items);
  });
};

export const markNotificationRead = async (uid, notificationId) => {
  await updateDoc(doc(db, "notifications", uid, "items", notificationId), {
    read: true,
  });
};

export const markAllNotificationsRead = async (uid) => {
  const q = query(
    collection(db, "notifications", uid, "items"),
    where("read", "==", false),
  );
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  snapshot.docs.forEach((docItem) => {
    batch.update(docItem.ref, { read: true });
  });
  await batch.commit();
};

export const timeAgo = (timestamp) => {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
};
