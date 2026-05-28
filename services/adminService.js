import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { createNotification } from "./notificationService";

const JOB_COLLECTIONS = ["jobs", "projects"];

export const ADMIN_EMAIL = "admin@buildin.cm";

export async function verifyAdminCredentials(username, password) {
  const snapshot = await getDocs(
    query(collection(db, "admins"), where("username", "==", username)),
  );

  const match = snapshot.docs.find((docItem) => {
    const data = docItem.data();
    return data.password === password;
  });

  if (!match) return null;

  return { id: match.id, ...match.data() };
}

export async function approveJob(job) {
  const jobRef = doc(db, "jobs", job.id);
  await updateDoc(jobRef, { status: "active" });

  if (job.contractorUid) {
    await createNotification(
      job.contractorUid,
      "job_approved",
      `Your job '${job.title}' has been approved and is now live.`,
      job.id,
    );
  }
}

export async function rejectJob(job) {
  const jobRef = doc(db, "jobs", job.id);
  await updateDoc(jobRef, { status: "rejected" });

  if (job.contractorUid) {
    await createNotification(
      job.contractorUid,
      "job_rejected",
      `Your job '${job.title}' was not approved.`,
      job.id,
    );
  }
}

export async function blockUser(user) {
  await updateDoc(doc(db, "users", user.id), { blocked: true });

  if (user.role === "worker") {
    await updateDoc(doc(db, "workers", user.id), { blocked: true });
  }
}

export async function unblockUser(user) {
  await updateDoc(doc(db, "users", user.id), { blocked: false });

  if (user.role === "worker") {
    await updateDoc(doc(db, "workers", user.id), { blocked: false });
  }
}

async function deleteCollectionDocuments(collectionName, fieldName, fieldValue) {
  const snapshot = await getDocs(
    query(collection(db, collectionName), where(fieldName, "==", fieldValue)),
  );

  for (const item of snapshot.docs) {
    await deleteDoc(doc(db, collectionName, item.id));
  }
}

export async function deleteUserData(user) {
  await deleteDoc(doc(db, "users", user.id));

  if (user.role === "worker") {
    const workerSnapshot = await getDoc(doc(db, "workers", user.id));
    if (workerSnapshot.exists()) {
      await deleteDoc(doc(db, "workers", user.id));
    }

    await deleteCollectionDocuments("workImages", "workerId", user.id);
    await deleteCollectionDocuments("applications", "workerId", user.id);
    await deleteCollectionDocuments("applications", "applicantId", user.id);
    await deleteCollectionDocuments("mobilisations", "workerId", user.id);
  }

  if (user.role === "contractor") {
    for (const collectionName of JOB_COLLECTIONS) {
      await deleteCollectionDocuments(collectionName, "contractorUid", user.id);
    }

    await deleteCollectionDocuments("mobilisations", "contractorId", user.id);
    await deleteCollectionDocuments("applications", "contractorUid", user.id);
  }
}
