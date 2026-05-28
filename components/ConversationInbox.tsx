import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { COLORS } from "../constants/theme";

type Conversation = {
  id: string;
  participants?: string[];
  participantNames?: Record<string, string>;
  participantPhotos?: Record<string, string>;
  lastMessage?: string;
  lastMessageTime?: { toDate?: () => Date } | Date | null;
  unreadCount?: Record<string, number>;
};

type Props = {
  currentUid: string;
  role: "worker" | "contractor";
  conversations: Conversation[];
};

function initials(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "?";
  return trimmed
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function hashColor(value: string) {
  const palette = ["#E8620A", "#1a2332", "#475569", "#8b5cf6", "#0f766e"];
  const hash = value.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return palette[hash % palette.length];
}

function formatConversationTime(value?: Conversation["lastMessageTime"]) {
  const date =
    typeof (value as any)?.toDate === "function"
      ? (value as any).toDate()
      : value instanceof Date
        ? value
        : null;
  if (!date) return "";
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  return sameDay
    ? date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function ConversationInbox({ currentUid, role, conversations }: Props) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return conversations.filter((conversation) => {
      if (!term) return true;
      const participants = conversation.participants || [];
      const otherId = participants.find((participant) => participant !== currentUid);
      const otherName = otherId
        ? conversation.participantNames?.[otherId] || ""
        : "";
      const preview = conversation.lastMessage || "";
      return (
        otherName.toLowerCase().includes(term) ||
        preview.toLowerCase().includes(term)
      );
    });
  }, [conversations, currentUid, search]);

  const openConversation = (conversation: Conversation) => {
    const participants = conversation.participants || [];
    const otherId = participants.find((participant) => participant !== currentUid);
    if (!otherId) return;

    const otherName =
      conversation.participantNames?.[otherId] || "Conversation";
    const otherPhoto = conversation.participantPhotos?.[otherId] || "";

    router.push({
      pathname: role === "worker" ? "/(worker)/chat" : "/(contractor)/chat",
      params: {
        conversationId: conversation.id,
        otherName,
        otherPhoto,
        otherUid: otherId,
      },
    } as never);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchWrap}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search..."
          placeholderTextColor="#9ca3af"
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptyText}>
              Messages will show up here when someone reaches out.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const participants = item.participants || [];
          const otherId = participants.find((participant) => participant !== currentUid);
          if (!otherId) return null;

          const name = item.participantNames?.[otherId] || "Conversation";
          const photo = item.participantPhotos?.[otherId] || "";
          const unreadCount = Number(item.unreadCount?.[currentUid] || 0);
          const timeLabel = formatConversationTime(item.lastMessageTime);

          return (
            <Pressable
              onPress={() => openConversation(item)}
              style={({ pressed }) => [
                styles.row,
                pressed && styles.rowPressed,
              ]}
            >
              {photo ? (
                <Image source={{ uri: photo }} style={styles.avatar} />
              ) : (
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: hashColor(name || otherId) },
                  ]}
                >
                  <Text style={styles.avatarText}>{initials(name || otherId)}</Text>
                </View>
              )}

              <View style={styles.rowBody}>
                <View style={styles.rowTop}>
                  <Text numberOfLines={1} style={styles.name}>
                    {name}
                  </Text>
                  <Text style={styles.time}>{timeLabel}</Text>
                </View>
                <View style={styles.rowBottom}>
                  <Text numberOfLines={1} style={styles.preview}>
                    {item.lastMessage || "No messages yet"}
                  </Text>
                  {unreadCount > 0 ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{unreadCount}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  searchWrap: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
    backgroundColor: "#f3f4f6",
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    justifyContent: "center",
  },
  searchInput: {
    color: "#111827",
    fontSize: 15,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
  },
  rowPressed: {
    backgroundColor: "#f9fafb",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  rowBody: {
    flex: 1,
    gap: 6,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  name: {
    flex: 1,
    color: "#1a1a1a",
    fontSize: 16,
    fontWeight: "800",
  },
  time: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "600",
  },
  rowBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  preview: {
    flex: 1,
    color: "#6b7280",
    fontSize: 13,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
  },
  separator: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginLeft: 76,
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
  },
  emptyTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "800",
  },
  emptyText: {
    marginTop: 6,
    color: "#6b7280",
    textAlign: "center",
  },
});
