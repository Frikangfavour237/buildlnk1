import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import {
  markMessagesAsRead,
  sendMessage,
  subscribeToMessages,
} from "../services/messageService";
import { createNotification } from "../services/notificationService";

type MessageItem = {
  id: string;
  senderId: string;
  text: string;
  timestamp?: { toDate?: () => Date } | Date | null;
};

type Props = {
  conversationId: string;
  currentUid: string;
  receiverId: string;
  otherName: string;
  otherPhoto?: string | null;
};

function formatTime(value?: MessageItem["timestamp"]) {
  const date =
    typeof (value as any)?.toDate === "function"
      ? (value as any).toDate()
      : value instanceof Date
        ? value
        : null;
  if (!date) return "";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function initials(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "?";
  return trimmed
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function avatarColor(value: string) {
  const palette = ["#E8620A", "#1a2332", "#475569", "#0f766e", "#7c3aed"];
  const hash = value.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return palette[hash % palette.length];
}

export function ChatScreen({
  conversationId,
  currentUid,
  receiverId,
  otherName,
  otherPhoto,
}: Props) {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList<MessageItem>>(null);

  useEffect(() => {
    if (!conversationId || !currentUid) return;

    void markMessagesAsRead(conversationId, currentUid);

    const unsubscribe = subscribeToMessages(conversationId, (msgs) => {
      setMessages(msgs);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return () => unsubscribe();
  }, [conversationId, currentUid]);

  const canSend = useMemo(() => text.trim().length > 0 && !sending, [sending, text]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    try {
      setSending(true);
      await sendMessage(conversationId, currentUid, trimmed, receiverId);
      await createNotification(
        receiverId,
        "message",
        `New message from ${currentUser?.fullName || currentUser?.name || "Someone"}: "${trimmed.substring(0, 50)}${trimmed.length > 50 ? "..." : ""}"`,
        conversationId,
      );
      setText("");
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={24} color="#ffffff" />
        </TouchableOpacity>

        {otherPhoto ? (
          <Image source={{ uri: otherPhoto }} style={styles.headerAvatar} />
        ) : (
          <View
            style={[
              styles.headerAvatar,
              { backgroundColor: avatarColor(otherName) },
            ]}
          >
            <Text style={styles.headerAvatarText}>{initials(otherName)}</Text>
          </View>
        )}

        <View style={styles.headerText}>
          <Text numberOfLines={1} style={styles.headerName}>
            {otherName}
          </Text>
          <Text style={styles.headerSub}>Active conversation</Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContent}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const isMine = item.senderId === currentUid;
          return (
            <View
              style={[
                styles.messageRow,
                isMine ? styles.messageRowMine : styles.messageRowTheirs,
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  isMine ? styles.bubbleMine : styles.bubbleTheirs,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    isMine ? styles.messageTextMine : styles.messageTextTheirs,
                  ]}
                >
                  {item.text}
                </Text>
              </View>
              <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
            </View>
          );
        }}
      />

      <View style={styles.composerWrap}>
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Message..."
            placeholderTextColor="#9ca3af"
            multiline
          />
          <Pressable
            onPress={handleSend}
            style={({ pressed }) => [
              styles.sendBtn,
              !canSend && styles.sendBtnDisabled,
              pressed && canSend && styles.sendBtnPressed,
            ]}
          >
            <Ionicons name="send" size={18} color="#ffffff" />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: COLORS.primaryDark,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  headerAvatarText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "800",
  },
  headerSub: {
    marginTop: 2,
    color: "#cbd5e1",
    fontSize: 12,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 10,
  },
  messageRow: {
    maxWidth: "84%",
    gap: 4,
  },
  messageRowMine: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  messageRowTheirs: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleMine: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 6,
  },
  bubbleTheirs: {
    backgroundColor: "#f3f4f6",
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextMine: {
    color: "#ffffff",
  },
  messageTextTheirs: {
    color: "#111827",
  },
  timestamp: {
    color: "#9ca3af",
    fontSize: 11,
    fontWeight: "600",
  },
  composerWrap: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    backgroundColor: "#f3f4f6",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    minHeight: 22,
    maxHeight: 110,
    color: "#111827",
    fontSize: 15,
    paddingTop: 0,
    paddingBottom: 0,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnPressed: {
    opacity: 0.9,
  },
  sendBtnDisabled: {
    opacity: 0.45,
  },
});
