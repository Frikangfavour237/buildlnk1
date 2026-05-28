import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { AppNavbar } from "../../components/AppNavbar";
import { COLORS } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import { useUnreadNotifications } from "../../hooks/useUnreadNotifications";
import { getOrCreateConversation } from "../../services/messageService";
import { createNotification } from "../../services/notificationService";
import {
    getWorkImageReviews,
    getWorkerReviews,
} from "../../services/reviewService";
import {
    getWorkerWorkImages,
    uploadWorkPhoto as uploadWorkPhotoService,
} from "../../services/storageService";
import {
    getWorkerMobilisations,
    updateWorkerAvailability,
} from "../../services/workerService";

const C = {
  orange: COLORS.primary,
  bg: COLORS.background,
  surface: COLORS.card,
  border: COLORS.border,
  text: COLORS.textPrimary,
  textSub: COLORS.textSecondary,
  textSecondary: COLORS.textSecondary,
  textMuted: COLORS.textMuted,
  textInert: COLORS.textMuted,
  textStrong: COLORS.textPrimary,
  green: COLORS.success,
  yellow: COLORS.busyText,
  red: COLORS.error,
};

export default function WorkerDashboard() {
  const { currentUser } = useAuth();
  const unreadCount = useUnreadNotifications(currentUser?.uid);
  const [availability, setAvailability] = useState("available");
  const [profile, setProfile] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [jobsAppliedCount, setJobsAppliedCount] = useState(0);
  const [workImages, setWorkImages] = useState<any[]>([]);
  const [selectedWorkImage, setSelectedWorkImage] = useState<any>(null);
  const [reviewsForImage, setReviewsForImage] = useState<any[]>([]);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadProjectName, setUploadProjectName] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadUri, setUploadUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [ratingStats, setRatingStats] = useState({ avgRating: 0, count: 0 });

  const profileImageUrl =
    profile?.profileImageUrl || currentUser?.profileImageUrl || null;

  const profileCompletion = useMemo(() => {
    const fields = [
      profile?.fullName,
      profile?.bio,
      profile?.skills?.length,
      profile?.location,
      profile?.availability,
      profileImageUrl,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile, profileImageUrl]);

  useEffect(() => {
    if (!currentUser?.uid) return;
    let active = true;
    let unsubscribeWorker = () => {};
    let unsubscribeApplications = () => {};
    const loadData = async () => {
      try {
        unsubscribeWorker = onSnapshot(
          doc(db, "workers", currentUser.uid),
          (snapshot) => {
            if (!active) return;
            const workerProfile: any = snapshot.exists()
              ? { id: snapshot.id, ...snapshot.data() }
              : null;
            setProfile(workerProfile);
            setAvailability(workerProfile?.availability || "available");
          },
          (error) => {
            console.log("worker profile error:", (error as Error)?.message || error);
          },
        );
      } catch (error) {
        console.log("worker profile error:", (error as Error)?.message || error);
      }

      try {
        const applicantQuery = query(
          collection(db, "applications"),
          where("applicantId", "==", currentUser.uid),
        );
        const workerIdQuery = query(
          collection(db, "applications"),
          where("workerId", "==", currentUser.uid),
        );
        unsubscribeApplications = onSnapshot(
          applicantQuery,
          async (applicantSnapshot) => {
            try {
              const workerSnapshot = await getDocs(workerIdQuery);
              if (!active) return;

              const ids = new Set<string>();
              applicantSnapshot.docs.forEach((docItem) => ids.add(docItem.id));
              workerSnapshot.docs.forEach((docItem) => ids.add(docItem.id));
              setJobsAppliedCount(ids.size);
            } catch (error) {
              console.log(
                "applications error:",
                (error as Error)?.message || error,
              );
              if (active) {
                setJobsAppliedCount(0);
              }
            }
          },
          (error) => {
            console.log("applications error:", (error as Error)?.message || error);
            if (active) {
              setJobsAppliedCount(0);
            }
          },
        );
      } catch (error) {
        console.log("applications error:", (error as Error)?.message || error);
      }

      try {
        const mobilisations = await getWorkerMobilisations(currentUser.uid);
        if (!active) return;
        setRequests(Array.isArray(mobilisations) ? mobilisations : []);
      } catch (error) {
        console.log("mobilisations error:", (error as Error)?.message || error);
        if (active) {
          setRequests([]);
        }
      }

      try {
        const workImagesData = await getWorkerWorkImages(currentUser.uid);
        if (!active) return;
        setWorkImages(Array.isArray(workImagesData) ? workImagesData : []);
      } catch (error) {
        console.log("workImages error:", (error as Error)?.message || error);
        if (active) {
          setWorkImages([]);
        }
      }

      try {
        const workerReviews = await getWorkerReviews(currentUser.uid);
        if (!active) return;
        setRatingStats({
          avgRating: workerReviews.avgRating,
          count: workerReviews.reviews.length,
        });
      } catch (error) {
        console.log("reviews error:", (error as Error)?.message || error);
        if (active) {
          setRatingStats({ avgRating: 0, count: 0 });
        }
      }
    };

    loadData();
    return () => {
      active = false;
      unsubscribeWorker();
      unsubscribeApplications();
    };
  }, [currentUser?.uid]);

  const changeAvailability = async (next: string) => {
    if (!currentUser) return;
    try {
      await updateWorkerAvailability(currentUser.uid, next);
      setAvailability(next);
      setProfile((prev: any) => ({ ...prev, availability: next }));
    } catch {
      Alert.alert("Update failed", "Could not update availability right now.");
    }
  };

  const handleRequest = async (item: any, response: "accept" | "decline") => {
    if (!currentUser) return;
    const status = response === "accept" ? "accepted" : "declined";
    try {
      if (response === "accept") {
        await updateDoc(doc(db, "mobilisations", item.id), {
          status,
        });
        await createNotification(
          item.contractorId,
          "mobilisation_accepted",
          `${currentUser.fullName || currentUser.name || "Worker"} accepted your mobilisation request for "${item.projectTitle || "this project"}"`,
          item.id,
        );
      } else {
        await deleteDoc(doc(db, "mobilisations", item.id));
        await createNotification(
          item.contractorId,
          "mobilisation_declined",
          `Your mobilisation request for "${item.projectTitle || "this project"}" was declined.`,
          item.id,
        );
      }

      setRequests((prev) =>
        response === "decline"
          ? prev.filter((request) => request.id !== item.id)
          : prev.map((request) =>
              request.id === item.id
                ? {
                    ...request,
                    status,
                  }
                : request,
            ),
      );
    } catch {
      Alert.alert("Action failed", "Could not update the request.");
    }
  };

  const messageContractor = async (item: any) => {
    if (!currentUser) return;
    const conversationId = await getOrCreateConversation(
      currentUser.uid,
      item.contractorId,
      item.contractorName,
      item.contractorPhoto || "",
      currentUser.fullName || currentUser.name || "Worker",
      currentUser.profileImageUrl || "",
    );

    router.push({
      pathname: "/(worker)/chat",
      params: {
        conversationId,
        otherName: item.contractorName,
        otherPhoto: item.contractorPhoto || "",
        otherUid: item.contractorId,
      },
    } as never);
  };

  const onSelectWorkImage = async (workImage: any) => {
    setSelectedWorkImage(workImage);
    const reviews = await getWorkImageReviews(workImage.id);
    setReviewsForImage(reviews);
  };

  const openImagePicker = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow photo access.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    setUploadUri(result.assets[0].uri);
    setUploadModalVisible(true);
  };

  const handleUploadWorkPhoto = async () => {
    if (!uploadUri || !uploadProjectName) {
      Alert.alert(
        "Missing info",
        "Please choose an image and add a project name.",
      );
      return;
    }
    if (!currentUser) return;
    setIsUploading(true);
    try {
      const result = await uploadWorkPhotoService(
        uploadUri,
        uploadProjectName,
        uploadDescription,
      );
      if (!result) {
        throw new Error("Upload failed");
      }
      const refreshed = await getWorkerWorkImages(currentUser.uid);
      setWorkImages(refreshed);
      setUploadModalVisible(false);
      setUploadProjectName("");
      setUploadDescription("");
      setUploadUri(null);
      Alert.alert("Success", "Work image uploaded successfully.");
    } catch {
      Alert.alert(
        "Upload Failed",
        "Unable to upload photo at the moment. Please check your internet connection and try again.",
        [{ text: "OK" }],
      );
    } finally {
      setIsUploading(false);
    }
  };

  const stats = [
    { label: "Jobs Applied", value: jobsAppliedCount },
    { label: "Mobilisations", value: requests.length },
    { label: "Profile Views", value: profile?.profileViews ?? 0 },
    { label: "Reviews", value: ratingStats.count },
  ];

  return (
    <View style={styles.container}>
      {isUploading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#E8620A" />
            <Text style={styles.loadingText}>Uploading...</Text>
          </View>
        </View>
      )}
      <AppNavbar
        userRole="worker"
        userName={
          profile?.fullName ||
          currentUser?.fullName ||
          currentUser?.name ||
          "Worker"
        }
        profileImageUrl={profileImageUrl}
        unreadCount={unreadCount}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>
              Profile {profileCompletion}% complete
            </Text>
            <Text style={styles.progressValue}>{profileCompletion}%</Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${profileCompletion}%` },
              ]}
            />
          </View>
        </View>

        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View
              key={stat.label}
              style={[
                styles.statCard,
                stat.label === "Reviews" && styles.highlightCard,
              ]}
            >
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() =>
              changeAvailability(
                availability === "available" ? "busy" : "available",
              )
            }
          >
            <Text style={styles.quickActionText}>Update Availability</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={openImagePicker}
          >
            <Text style={styles.quickActionText}>Add Work Photos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push("/(worker)/profile")}
          >
            <Text style={styles.quickActionText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeadingRow}>
            <Text style={styles.sectionTitle}>My Portfolio</Text>
            <TouchableOpacity
              onPress={() => router.push("/(worker)/portfolio")}
            >
              <Text style={styles.link}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.portfolioPreviewRow}
          >
            {workImages.slice(0, 4).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.portfolioPreviewThumb}
                onPress={() => onSelectWorkImage(item)}
              >
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.portfolioPreviewImage}
                />
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.portfolioPreviewThumb, styles.portfolioPreviewAdd]}
              onPress={openImagePicker}
            >
              <Ionicons name="add" size={28} color={COLORS.primaryDark} />
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeadingRow}>
            <Text style={styles.sectionTitle}>
              Recent Mobilisation Requests
            </Text>
            <Text style={styles.sectionHint}>{requests.length} total</Text>
          </View>
          {requests.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={28}
                color={C.textInert}
              />
              <Text style={styles.emptyTitle}>No recent requests</Text>
              <Text style={styles.emptyText}>
                Requests from contractors will appear here.
              </Text>
            </View>
          ) : (
            requests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <Text style={styles.requestTitle}>
                    {request.projectTitle || "Mobilisation"}
                  </Text>
                  <View
                    style={[
                      styles.requestStatus,
                      request.status === "pending"
                        ? styles.statusPending
                        : request.status === "accepted"
                          ? styles.statusAccepted
                          : styles.statusDeclined,
                    ]}
                  >
                    <Text
                      style={[
                        styles.requestStatusText,
                        request.status === "pending"
                          ? styles.statusPendingText
                          : request.status === "accepted"
                            ? styles.statusAcceptedText
                            : styles.statusDeclinedText,
                      ]}
                    >
                      {(request.status || "pending").toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.requestSub}>
                  From {request.contractorName || "Contractor"}
                </Text>
                <Text style={styles.requestMeta}>
                  {request.createdAt?.toDate
                    ? request.createdAt.toDate().toLocaleDateString()
                    : "Date not set"}
                </Text>
                <View style={styles.requestActions}>
                  {request.status !== "accepted" && request.status !== "declined" ? (
                    <TouchableOpacity
                      style={[styles.requestActionBtn, styles.acceptBtn]}
                      onPress={() => handleRequest(request, "accept")}
                    >
                      <Ionicons name="checkmark" size={14} color="#ffffff" />
                      <Text style={styles.acceptBtnText}>Accept</Text>
                    </TouchableOpacity>
                  ) : null}
                  {request.status !== "accepted" && request.status !== "declined" ? (
                    <TouchableOpacity
                      style={[styles.requestActionBtn, styles.declineBtn]}
                      onPress={() => handleRequest(request, "decline")}
                    >
                      <Ionicons name="close" size={14} color="#ef4444" />
                      <Text style={styles.declineBtnText}>Decline</Text>
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity
                    style={[styles.requestActionBtn, styles.messageBtn]}
                    onPress={() => messageContractor(request)}
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={14}
                      color="#1a2332"
                    />
                    <Text style={styles.messageBtnText}>Message</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal visible={!!selectedWorkImage} transparent animationType="slide">
        <View style={styles.modalOverlayLarge}>
          <View style={styles.modalCardLarge}>
            <TouchableOpacity
              style={styles.closeModal}
              onPress={() => setSelectedWorkImage(null)}
            >
              <Ionicons name="close" size={24} color={C.textStrong} />
            </TouchableOpacity>
            {selectedWorkImage && (
              <>
                <Image
                  source={{ uri: selectedWorkImage.imageUrl }}
                  style={styles.fullImage}
                />
                <Text style={styles.modalTitle}>
                  {selectedWorkImage.projectName}
                </Text>
                <Text style={styles.modalDescription}>
                  {selectedWorkImage.description || "No description provided."}
                </Text>
                <Text style={styles.modalMeta}>
                  {selectedWorkImage.createdAt?.toDate
                    ? selectedWorkImage.createdAt.toDate().toLocaleDateString()
                    : "Date unavailable"}
                </Text>
                <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
                  Reviews
                </Text>
                {reviewsForImage.length === 0 ? (
                  <Text style={styles.emptyText}>
                    No reviews yet for this work.
                  </Text>
                ) : (
                  reviewsForImage.map((review) => (
                    <View key={review.id} style={styles.reviewCard}>
                      <Text style={styles.reviewAuthor}>
                        {review.contractorName} • {review.contractorCompany}
                      </Text>
                      <Text style={styles.reviewStars}>
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </Text>
                      <Text style={styles.reviewComment}>{review.comment}</Text>
                      <Text style={styles.reviewDate}>
                        {review.createdAt?.toDate
                          ? review.createdAt.toDate().toLocaleDateString()
                          : ""}
                      </Text>
                    </View>
                  ))
                )}
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={uploadModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlayLarge}>
          <View style={styles.uploadCard}>
            <Text style={styles.modalTitle}>Upload Work Photo</Text>
            <TextInput
              style={styles.input}
              placeholder="Project name"
              value={uploadProjectName}
              onChangeText={setUploadProjectName}
            />
            <TextInput
              style={[styles.input, { minHeight: 80 }]}
              placeholder="Description"
              value={uploadDescription}
              onChangeText={setUploadDescription}
              multiline
            />
            <View style={styles.uploadActions}>
              <TouchableOpacity
                style={styles.uploadCancel}
                onPress={() => setUploadModalVisible(false)}
              >
                <Text style={styles.uploadCancelText}>Cancel</Text>
              </TouchableOpacity>
                <TouchableOpacity
                style={styles.uploadBtn}
                onPress={handleUploadWorkPhoto}
                disabled={isUploading}
              >
                <Text style={styles.uploadBtnText}>
                  {isUploading ? "Uploading..." : "Upload"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  loadingCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "#1a1a1a",
    fontWeight: "600",
  },
  content: { paddingBottom: 24 },
  progressCard: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 18,
    backgroundColor: C.surface,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressLabel: { color: C.textStrong, fontWeight: "700" },
  progressValue: { color: C.textSecondary, fontWeight: "700" },
  progressBarBackground: {
    width: "100%",
    height: 10,
    borderRadius: 999,
    backgroundColor: COLORS.border,
  },
  progressBarFill: {
    height: 10,
    borderRadius: 999,
    backgroundColor: COLORS.primaryDark,
  },
  statsRow: {
    marginHorizontal: 16,
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "48%",
    padding: 16,
    borderRadius: 18,
    backgroundColor: C.surface,
  },
  highlightCard: { borderWidth: 1, borderColor: COLORS.primaryDark },
  statValue: { color: C.textStrong, fontSize: 22, fontWeight: "900" },
  statLabel: { color: C.textSub, marginTop: 8 },
  actionsRow: {
    marginHorizontal: 16,
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickAction: {
    flex: 1,
    minWidth: "30%",
    padding: 14,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  quickActionText: { color: "#fff", fontWeight: "800", textAlign: "center" },
  section: { marginHorizontal: 16, marginTop: 16 },
  sectionHeadingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { color: C.textStrong, fontSize: 18, fontWeight: "700" },
  sectionHint: { color: C.textSecondary, fontSize: 13 },
  link: { color: COLORS.primary, fontWeight: "700" },
  portfolioPreviewRow: {
    flexDirection: "row",
    paddingVertical: 4,
    gap: 12,
  },
  portfolioPreviewThumb: {
    width: 120,
    height: 120,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: C.surface,
  },
  portfolioPreviewImage: { width: "100%", height: "100%" },
  portfolioPreviewAdd: {
    justifyContent: "center",
    alignItems: "center",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  portfolioGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  portfolioCard: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: C.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  portfolioImage: { width: "100%", height: "100%" },
  portfolioOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  portfolioLabel: { color: "#fff", fontWeight: "700", fontSize: 12 },
  addCard: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addText: { marginTop: 8, color: C.textStrong, fontWeight: "700" },
  emptyCard: {
    marginTop: 12,
    padding: 20,
    borderRadius: 16,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: { color: C.textStrong, fontWeight: "800" },
  emptyText: { color: C.textSub, textAlign: "center" },
  requestCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  requestTitle: { color: C.textStrong, fontSize: 15, fontWeight: "800" },
  requestSub: { color: C.textSecondary, marginBottom: 4 },
  requestMeta: { color: C.textMuted, fontSize: 12 },
  statusPending: { backgroundColor: "#fef3c7" },
  statusAccepted: { backgroundColor: "#d1fae5" },
  statusDeclined: { backgroundColor: "#fee2e2" },
  requestStatusText: {
    fontWeight: "700",
    fontSize: 11,
    textTransform: "uppercase",
  },
  statusPendingText: { color: "#92400e" },
  statusAcceptedText: { color: "#065f46" },
  statusDeclinedText: { color: "#991b1b" },
  requestActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    alignItems: "center",
  },
  requestActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  acceptBtn: {
    backgroundColor: "#1a2332",
  },
  acceptBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
  declineBtn: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
  },
  declineBtnText: {
    color: "#ef4444",
    fontSize: 13,
    fontWeight: "600",
  },
  messageBtn: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
  },
  messageBtnText: {
    color: "#1a2332",
    fontSize: 13,
    fontWeight: "600",
  },
  requestStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlayLarge: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCardLarge: {
    width: "100%",
    maxHeight: "90%",
    padding: 16,
    borderRadius: 18,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
  },
  closeModal: { position: "absolute", top: 16, right: 16, zIndex: 1 },
  fullImage: { width: "100%", height: 200, borderRadius: 16, marginBottom: 12 },
  modalTitle: {
    color: C.textStrong,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 8,
  },
  modalDescription: { color: C.textSecondary, lineHeight: 20 },
  modalMeta: { color: C.textMuted, marginTop: 6, fontSize: 12 },
  reviewCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: C.surface,
  },
  reviewAuthor: { color: C.textStrong, fontWeight: "700" },
  reviewStars: { color: COLORS.primaryDark, marginTop: 4 },
  reviewComment: { color: C.textSub, marginTop: 8 },
  reviewDate: { color: C.textMuted, marginTop: 4, fontSize: 12 },
  uploadCard: {
    width: "90%",
    padding: 20,
    borderRadius: 18,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
  },
  input: {
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    color: C.textStrong,
    marginTop: 12,
  },
  uploadActions: { marginTop: 18, flexDirection: "row", gap: 12 },
  uploadCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
  },
  uploadCancelText: { color: C.textStrong, fontWeight: "800" },
  uploadBtn: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  uploadBtnText: { color: "#fff", fontWeight: "900" },
});
