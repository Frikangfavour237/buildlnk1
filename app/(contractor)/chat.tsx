import { router, useLocalSearchParams } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { ChatScreen } from "../../components/ChatScreen";
import { useAuth } from "../../context/AuthContext";
import { auth } from "../../firebase";

export default function ContractorChat() {
  const { currentUser } = useAuth();
  const params = useLocalSearchParams<{
    conversationId?: string;
    otherName?: string;
    otherPhoto?: string;
    otherUid?: string;
  }>();
  const conversationId =
    typeof params.conversationId === "string" ? params.conversationId : "";
  const otherName =
    typeof params.otherName === "string" ? params.otherName : "";
  const otherPhoto =
    typeof params.otherPhoto === "string" ? params.otherPhoto : "";
  const otherUid =
    typeof params.otherUid === "string" ? params.otherUid : "";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/(auth)/sign-in");
      }
    });
    return unsubscribe;
  }, []);

  if (!conversationId) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No conversation selected.</Text>
      </View>
    );
  }

  if (!currentUser?.uid || !otherName || !otherUid) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#E8620A" />
      </View>
    );
  }

  return (
    <ChatScreen
      conversationId={conversationId}
      currentUid={currentUser.uid}
      receiverId={otherUid}
      otherName={otherName}
      otherPhoto={otherPhoto}
    />
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
    paddingHorizontal: 24,
  },
  emptyText: {
    color: "#1a2332",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
});
