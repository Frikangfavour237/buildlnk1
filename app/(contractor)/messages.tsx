import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { AppNavbar } from "../../components/AppNavbar";
import { ConversationInbox } from "../../components/ConversationInbox";
import { useAuth } from "../../context/AuthContext";
import { auth } from "../../firebase";
import { useUnreadNotifications } from "../../hooks/useUnreadNotifications";
import { subscribeToConversations } from "../../services/messageService";

export default function ContractorMessages() {
  const { currentUser } = useAuth();
  const unreadCount = useUnreadNotifications(currentUser?.uid);
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/(auth)/sign-in");
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    let unsubscribeConversations = () => {};
    let unsubscribeAuth = () => {};

    if (auth.currentUser) {
      unsubscribeConversations = subscribeToConversations(
        auth.currentUser.uid,
        (convs) => {
          console.log("Conversations received:", convs.length, convs);
          setConversations(convs);
        },
      );
    } else {
      unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        if (!user) return;
        unsubscribeConversations = subscribeToConversations(user.uid, (convs) => {
          console.log("Conversations received:", convs.length, convs);
          setConversations(convs);
        });
        unsubscribeAuth();
      });
    }

    return () => {
      unsubscribeConversations();
      unsubscribeAuth();
    };
  }, []);

  return (
    <View style={styles.container}>
      <AppNavbar
        userRole="contractor"
        userName={currentUser?.fullName || currentUser?.name || "Contractor"}
        profileImageUrl={currentUser?.profileImageUrl || null}
        unreadCount={unreadCount}
      />
      <ConversationInbox
        currentUid={currentUser?.uid || ""}
        role="contractor"
        conversations={conversations}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});
