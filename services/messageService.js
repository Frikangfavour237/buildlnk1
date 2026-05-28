import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    increment,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "../firebase";

export function getConversationId(userA, userB) {
  return [userA, userB].sort().join("_");
}

export async function getOrCreateConversation(
  currentUid,
  otherUid,
  otherName,
  otherPhoto,
  currentName = "",
  currentPhoto = "",
) {
  const conversationId = [currentUid, otherUid].sort().join("_");
  const convRef = doc(db, "conversations", conversationId);
  const convSnap = await getDoc(convRef);

  if (!convSnap.exists()) {
    await setDoc(convRef, {
      participants: [currentUid, otherUid],
      participantNames: {
        [currentUid]: currentName,
        [otherUid]: otherName,
      },
      participantPhotos: {
        [currentUid]: currentPhoto || "",
        [otherUid]: otherPhoto || "",
      },
      lastMessage: "",
      lastMessageTime: serverTimestamp(),
      unreadCount: {
        [currentUid]: 0,
        [otherUid]: 0,
      },
      createdAt: serverTimestamp(),
    });
  }

  return conversationId;
}

export async function sendMessage(conversationId, senderId, text, receiverId) {
  if (!text.trim()) return null;

  const trimmedText = text.trim();
  const messageDoc = await addDoc(
    collection(db, "conversations", conversationId, "messages"),
    {
      senderId,
      text: trimmedText,
      timestamp: serverTimestamp(),
      read: false,
    },
  );

  const updates = {
    lastMessage: trimmedText,
    lastMessageTime: serverTimestamp(),
  };

  if (receiverId) {
    updates[`unreadCount.${receiverId}`] = increment(1);
  }

  await updateDoc(doc(db, "conversations", conversationId), updates);

  return {
    id: messageDoc.id,
    conversationId,
    senderId,
    text: trimmedText,
  };
}

export function subscribeToConversations(uid, callback) {
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", uid),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const convs = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));
      convs.sort((a, b) => {
        const aTime = a.lastMessageTime?.seconds || 0;
        const bTime = b.lastMessageTime?.seconds || 0;
        return bTime - aTime;
      });
      callback(convs);
    },
    (error) => {
      console.error("Conversations subscription error:", error);
    },
  );
}

export function subscribeToMessages(conversationId, callback) {
  const messagesRef = collection(db, "conversations", conversationId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
        timestamp: docItem.data().timestamp,
      }));
      callback(messages);
    },
    (error) => {
      console.error("Messages subscription error:", error);
    },
  );
}

export async function markMessagesAsRead(conversationId, uid) {
  const conversationRef = doc(db, "conversations", conversationId);
  const messagesRef = collection(db, "conversations", conversationId, "messages");
  const unreadQuery = query(messagesRef, where("read", "==", false));
  const snapshot = await getDocs(unreadQuery);

  const unreadMessages = snapshot.docs.filter(
    (docItem) => docItem.data()?.senderId !== uid,
  );

  await Promise.all(
    unreadMessages.map((docItem) =>
      updateDoc(doc(db, "conversations", conversationId, "messages", docItem.id), {
        read: true,
      }),
    ),
  );

  await updateDoc(conversationRef, {
    [`unreadCount.${uid}`]: 0,
  });
}
