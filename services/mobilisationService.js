import {
    addDoc,
    collection,
    doc,
    deleteDoc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "../firebase";

export async function sendMobilisationRequest(
  projectId,
  workerId,
  contractorId,
  projectTitle,
  workerName,
  contractorName,
) {
  const mobilisationsRef = collection(db, "mobilisations");
  const payload = {
    projectId,
    projectTitle,
    workerId,
    workerName,
    contractorId,
    contractorName,
    status: "pending",
    createdAt: serverTimestamp(),
  };

  const mobilisationDoc = await addDoc(mobilisationsRef, payload);
  return { id: mobilisationDoc.id, ...payload };
}

export async function respondToRequest(mobilisationId, response) {
  const mobilisationRef = doc(db, "mobilisations", mobilisationId);
  const status =
    response === "accept"
      ? "accepted"
      : response === "decline"
        ? "declined"
        : response;

  await updateDoc(mobilisationRef, { status });
  return { id: mobilisationId, status };
}

export async function deleteMobilisation(mobilisationId) {
  await deleteDoc(doc(db, "mobilisations", mobilisationId));
}

export async function getMobilisationsForContractor(contractorId) {
  const mobilisationsRef = collection(db, "mobilisations");
  const mobilisationsQuery = query(mobilisationsRef, where("contractorId", "==", contractorId));
  const snapshot = await getDocs(mobilisationsQuery);
  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}

export async function getMobilisationsForWorker(workerId) {
  const mobilisationsRef = collection(db, "mobilisations");
  const mobilisationsQuery = query(mobilisationsRef, where("workerId", "==", workerId));
  const snapshot = await getDocs(mobilisationsQuery);
  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}
