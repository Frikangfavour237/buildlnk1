import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";

export function useUnreadNotifications(uid?: string | null) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!uid) {
      setUnreadCount(0);
      return;
    }

    const notificationsRef = collection(db, "notifications", uid, "items");
    const unreadQuery = query(notificationsRef, where("read", "==", false));

    const unsubscribe = onSnapshot(unreadQuery, (snapshot) => {
      setUnreadCount(snapshot.size);
    });

    return unsubscribe;
  }, [uid]);

  return unreadCount;
}
