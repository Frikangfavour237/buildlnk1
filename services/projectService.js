import {
    addDoc,
    collection,
    doc,
    deleteDoc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    where,
} from "firebase/firestore";
import { db } from "../firebase";

const JOB_COLLECTIONS = ["jobs", "projects"];

const normalizeDateValue = (value) => {
  if (!value) return null;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  if (typeof value?.toDate === "function") {
    return value.toDate().toISOString().slice(0, 10);
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toISOString().slice(0, 10);
};

const mapSnapshot = (snapshot) =>
  snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));

const mergeDocuments = (lists) => {
  const merged = new Map();
  lists.flat().forEach((item) => {
    merged.set(item.id, item);
  });
  return [...merged.values()];
};

export async function createProject(contractorUid, projectData) {
  const projectsRef = collection(db, "jobs");
  const payload = {
    ...projectData,
    contractorUid,
    status: projectData.status || "pending",
    startDate: normalizeDateValue(projectData.startDate),
    applicationDeadline: normalizeDateValue(projectData.applicationDeadline),
    createdAt: serverTimestamp(),
  };

  const projectDoc = await addDoc(projectsRef, payload);
  return { id: projectDoc.id, ...payload };
}

export async function getProjects(contractorUid) {
  const queries = JOB_COLLECTIONS.map((collectionName) => {
    const ref = collection(db, collectionName);
    return contractorUid
      ? getDocs(
          query(
            ref,
            where("contractorUid", "==", contractorUid),
            where("status", "==", "active"),
          ),
        )
      : getDocs(query(ref, where("status", "==", "active")));
  });

  const snapshots = await Promise.all(queries);
  return mergeDocuments(snapshots.map(mapSnapshot));
}

export async function deleteProject(projectId) {
  for (const collectionName of JOB_COLLECTIONS) {
    const jobRef = doc(db, collectionName, projectId);
    const snapshot = await getDoc(jobRef);
    if (snapshot.exists()) {
      await deleteDoc(jobRef);
    }
  }
}

export async function getProjectById(projectId) {
  for (const collectionName of JOB_COLLECTIONS) {
    const snapshot = await getDoc(doc(db, collectionName, projectId));
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
  }
  return null;
}

export async function getOpenProjects() {
  const snapshots = await Promise.all(
    JOB_COLLECTIONS.map((collectionName) =>
      getDocs(
        query(collection(db, collectionName), where("status", "==", "active")),
      ),
    ),
  );
  return mergeDocuments(snapshots.map(mapSnapshot));
}

export async function createApplication(applicationData) {
  const applicationsRef = collection(db, "applications");
  const payload = {
    projectId: applicationData.projectId,
    workerId: applicationData.workerId,
    workerName: applicationData.workerName,
    workerPhoto: applicationData.workerPhoto || "",
    workerSkills: applicationData.workerSkills || [],
    workerExperience: applicationData.workerExperience || 0,
    applicantId: applicationData.applicantId || applicationData.workerId || "",
    contractorUid: applicationData.contractorUid || "",
    status: "pending",
    appliedAt: serverTimestamp(),
  };
  const applicationDoc = await addDoc(applicationsRef, payload);
  return { id: applicationDoc.id, ...payload };
}

export async function getApplicationsForProject(projectId) {
  const applicationsSnapshot = await getDocs(
    query(collection(db, "applications"), where("projectId", "==", projectId)),
  );
  return applicationsSnapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}

export async function getApplicationsForContractor(contractorUid) {
  const projectsSnapshots = await Promise.all(
    JOB_COLLECTIONS.map((collectionName) =>
      getDocs(
        query(collection(db, collectionName), where("contractorUid", "==", contractorUid)),
      ),
    ),
  );
  const projectIds = new Set(
    mergeDocuments(projectsSnapshots.map(mapSnapshot)).map((item) => item.id),
  );
  const applicationsSnapshot = await getDocs(collection(db, "applications"));
  return applicationsSnapshot.docs
    .map((docItem) => ({ id: docItem.id, ...docItem.data() }))
    .filter((application) => projectIds.has(application.projectId));
}
