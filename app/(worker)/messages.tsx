import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { AppNavbar } from "../../components/AppNavbar";
import { ConversationInbox } from "../../components/ConversationInbox";
import { useAuth } from "../../context/AuthContext";
import { useUnreadNotifications } from "../../hooks/useUnreadNotifications";
import { subscribeToConversations } from "../../services/messageService";

export default function WorkerMessages() {
  const { currentUser } = useAuth();
  const unreadCount = useUnreadNotifications(currentUser?.uid);
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    if (!currentUser?.uid) return;
    let unsubscribeConversations = () => {};
    unsubscribeConversations = subscribeToConversations(
      currentUser.uid,
      (convs: any[]) => {
        console.log("Conversations received:", convs.length, convs);
        setConversations(convs);
      },
    );

    return () => {
      unsubscribeConversations();
    };
  }, [currentUser?.uid]);

  return (
    <View style={styles.container}>
      <AppNavbar
        userRole="worker"
        userName={currentUser?.fullName || currentUser?.name || "Worker"}
        profileImageUrl={currentUser?.profileImageUrl || null}
        unreadCount={unreadCount}
      />
      <ConversationInbox
        currentUid={currentUser?.uid || ""}
        role="worker"
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
