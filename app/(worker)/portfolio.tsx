import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
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
import { useUnreadNotifications } from "../../hooks/useUnreadNotifications";
import { getWorkImageReviews } from "../../services/reviewService";
import {
    deleteWorkPhoto,
    subscribeToPortfolio,
    uploadWorkPhoto as uploadWorkPhotoService,
} from "../../services/storageService";

export default function WorkerPortfolio() {
  const { currentUser } = useAuth();
  const unreadCount = useUnreadNotifications(currentUser?.uid);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const descriptionCount = description.length;
  const canUpload = !!imageUri && projectName.trim().length > 0 && !isUploading;

  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribePortfolio = subscribeToPortfolio(
      currentUser.uid,
      setPortfolio,
    );

    return () => {
      unsubscribePortfolio();
    };
  }, [currentUser?.uid]);

  const openImagePicker = async (source: "library" | "camera") => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow photo access.");
      return;
    }

    const picker =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
          });

    if (picker.canceled || !picker.assets?.[0]?.uri) return;
    setImageUri(picker.assets[0].uri);
    setUploadModalVisible(true);
  };

  const chooseUploadSource = () => {
    Alert.alert("Add Work Photo", "Choose an image source", [
      {
        text: "Take Photo",
        onPress: () => openImagePicker("camera"),
      },
      {
        text: "Photo Library",
        onPress: () => openImagePicker("library"),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const handleUpload = async () => {
    if (!canUpload || !currentUser || !imageUri) return;
    setIsUploading(true);
    try {
      const result = await uploadWorkPhotoService(
        imageUri,
        projectName.trim(),
        description.trim(),
      );
      if (!result) {
        throw new Error("Upload failed");
      }
      setUploadModalVisible(false);
      setImageUri(null);
      setProjectName("");
      setDescription("");
      Alert.alert("Success", "Work photo added to portfolio!");
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

  const openCard = async (item: any) => {
    setSelectedItem(item);
    const imageReviews = await getWorkImageReviews(item.id);
    setReviews(imageReviews);
  };

  const confirmDelete = (item: any) => {
    Alert.alert(
      "Remove Work Photo",
      "Are you sure you want to delete this portfolio item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deletePhoto(item),
        },
      ],
    );
  };

  const deletePhoto = async (item: any) => {
    if (!item?.id) return;
    setIsSaving(true);
    try {
      await deleteWorkPhoto(item.id);
    } catch {
      Alert.alert("Delete failed", "Could not remove the work photo.");
    } finally {
      setIsSaving(false);
    }
  };

  const averageRating = useMemo(() => {
    if (selectedItem?.averageRating) {
      return selectedItem.averageRating;
    }
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    return total / reviews.length;
  }, [reviews, selectedItem]);

  const ratingStars = (rating: number) => {
    const filled = Math.round(rating);
    return "★".repeat(filled) + "☆".repeat(5 - filled);
  };

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

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
        userName={currentUser?.fullName || currentUser?.name || "Worker"}
        profileImageUrl={currentUser?.profileImageUrl || null}
        unreadCount={unreadCount}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {portfolio.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="images-outline" size={36} color={COLORS.primary} />
            <Text style={styles.emptyTitle}>No portfolio items yet</Text>
            <Text style={styles.emptyText}>
              Add photos of completed jobs to build your public portfolio.
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {portfolio.map((item) => (
              <View key={item.id} style={styles.card}>
                <TouchableOpacity
                  style={styles.cardImageWrapper}
                  onPress={() => openCard(item)}
                >
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.cardImage}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => confirmDelete(item)}
                >
                  <Ionicons name="trash-outline" size={18} color="#fff" />
                </TouchableOpacity>
                <View style={styles.cardBody}>
                  <Text numberOfLines={1} style={styles.cardTitle}>
                    {item.projectName || "Untitled Project"}
                  </Text>
                  <Text numberOfLines={2} style={styles.cardDescription}>
                    {item.description || "No description provided."}
                  </Text>
                  <View style={styles.cardMetaRow}>
                    <Text style={styles.cardMeta}>
                      {item.createdAt?.toDate
                        ? item.createdAt.toDate().toLocaleDateString()
                        : "Unknown date"}
                    </Text>
                    <Text style={styles.cardMeta}>
                      {item.reviewCount || 0} reviews
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={chooseUploadSource}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={!!selectedItem} transparent animationType="slide">
        <View style={styles.modalOverlayLarge}>
          <View style={styles.modalCardLarge}>
            <TouchableOpacity
              style={styles.closeModal}
              onPress={() => setSelectedItem(null)}
            >
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            {selectedItem && (
              <ScrollView>
                <Image
                  source={{ uri: selectedItem.imageUrl }}
                  style={styles.fullImage}
                />
                <Text style={styles.modalTitle}>
                  {selectedItem.projectName}
                </Text>
                <Text style={styles.modalDescription}>
                  {selectedItem.description || "No description available."}
                </Text>
                <Text style={styles.modalMeta}>
                  Posted on{" "}
                  {selectedItem.createdAt?.toDate
                    ? selectedItem.createdAt.toDate().toLocaleDateString()
                    : "Unknown"}
                </Text>
                <Text style={styles.reviewSummary}>
                  {ratingStars(averageRating)} • {reviews.length} review
                  {reviews.length === 1 ? "" : "s"}
                </Text>
                {reviews.length === 0 ? (
                  <Text style={[styles.emptyText, { marginTop: 16 }]}>
                    No reviews yet.
                  </Text>
                ) : (
                  reviews.map((review) => (
                    <View key={review.id} style={styles.reviewCard}>
                      <View style={styles.reviewTopRow}>
                        <View style={styles.reviewerAvatar}>
                          {review.contractorPhotoUrl ? (
                            <Image
                              source={{ uri: review.contractorPhotoUrl }}
                              style={styles.reviewerAvatarImage}
                            />
                          ) : (
                            <Text style={styles.reviewerAvatarLabel}>
                              {review.contractorName
                                ?.slice(0, 2)
                                .toUpperCase() || "C"}
                            </Text>
                          )}
                        </View>
                        <View style={styles.reviewAuthorRow}>
                          <Text style={styles.reviewAuthor}>
                            {review.contractorName}
                          </Text>
                          <Text style={styles.reviewMeta}>
                            {review.contractorCompany || "Contractor"}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.reviewStars}>
                        {ratingStars(review.rating || 0)}
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
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={uploadModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlayLarge}>
          <View style={styles.uploadCard}>
            <Text style={styles.modalTitle}>Add Work Photo</Text>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : null}
            <TextInput
              style={styles.input}
              placeholder="Project Name"
              value={projectName}
              onChangeText={setProjectName}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={description}
              onChangeText={(value) => setDescription(value.slice(0, 300))}
              multiline
            />
            <Text style={styles.characterCounter}>{descriptionCount}/300</Text>
            <View style={styles.uploadActions}>
              <TouchableOpacity
                style={styles.uploadCancel}
                onPress={() => {
                  setUploadModalVisible(false);
                  setImageUri(null);
                  setProjectName("");
                  setDescription("");
                }}
              >
                <Text style={styles.uploadCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.uploadBtn,
                  !canUpload && styles.uploadBtnDisabled,
                ]}
                onPress={handleUpload}
                disabled={!canUpload}
              >
                {isUploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.uploadBtnText}>Upload</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
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
  content: { paddingBottom: 120 },
  emptyCard: {
    margin: 16,
    padding: 24,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    gap: 10,
  },
  emptyTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: "800" },
  emptyText: { color: COLORS.textSecondary, textAlign: "center", marginTop: 8 },
  grid: {
    marginHorizontal: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  card: {
    width: "48%",
    borderRadius: 18,
    backgroundColor: COLORS.card,
    overflow: "hidden",
    marginBottom: 12,
  },
  cardImageWrapper: { width: "100%", aspectRatio: 1.05 },
  cardImage: { width: "100%", height: "100%" },
  deleteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardBody: { padding: 12 },
  cardTitle: { color: COLORS.textPrimary, fontWeight: "800", fontSize: 14 },
  cardDescription: {
    color: COLORS.textSecondary,
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
  },
  cardMetaRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  cardMeta: { color: COLORS.textSecondary, fontSize: 11 },
  floatingButton: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
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
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  closeModal: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 2,
  },
  fullImage: { width: "100%", height: 220, borderRadius: 16, marginBottom: 12 },
  modalTitle: { color: COLORS.textPrimary, fontSize: 20, fontWeight: "900" },
  modalDescription: {
    color: COLORS.textSecondary,
    marginTop: 8,
    lineHeight: 20,
  },
  modalMeta: { color: COLORS.textSecondary, marginTop: 10, fontSize: 12 },
  reviewSummary: {
    color: COLORS.textPrimary,
    marginTop: 16,
    fontWeight: "700",
  },
  reviewCard: {
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: COLORS.card,
  },
  reviewTopRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  reviewerAvatarImage: { width: "100%", height: "100%" },
  reviewerAvatarLabel: { color: "#fff", fontWeight: "900" },
  reviewAuthorRow: { flex: 1 },
  reviewAuthor: { color: COLORS.textPrimary, fontWeight: "800" },
  reviewMeta: { color: COLORS.textSecondary, fontSize: 12 },
  reviewStars: { color: COLORS.primaryDark, marginTop: 10 },
  reviewComment: { color: COLORS.textSecondary, marginTop: 8, lineHeight: 20 },
  reviewDate: { color: COLORS.textMuted, marginTop: 8, fontSize: 12 },
  uploadCard: {
    width: "90%",
    padding: 20,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewImage: {
    width: "100%",
    height: 160,
    borderRadius: 14,
    marginBottom: 14,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  textArea: { minHeight: 100, textAlignVertical: "top" },
  characterCounter: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 6,
    textAlign: "right",
  },
  uploadActions: { marginTop: 18, flexDirection: "row", gap: 12 },
  uploadCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  uploadCancelText: { color: COLORS.textPrimary, fontWeight: "800" },
  uploadBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadBtnDisabled: { opacity: 0.5 },
  uploadBtnText: { color: "#fff", fontWeight: "900" },
});
