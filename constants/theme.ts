export const COLORS = {
  primary: "#E8620A",
  primaryDark: "#1a2332",
  secondaryDark: "#2d3748",
  textPrimary: "#1a1a1a",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",
  background: "#f9fafb",
  card: "#ffffff",
  border: "#e5e7eb",
  success: "#10b981",
  error: "#ef4444",
  availableBg: "#d1fae5",
  availableText: "#065f46",
  busyBg: "#fef3c7",
  busyText: "#92400e",
  unavailableBg: "#fee2e2",
  unavailableText: "#991b1b",
  tagBg: "#f3f4f6",
  tagText: "#374151",
} as const;

export const SHADOW = {
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
} as const;

export const INPUT = {
  borderWidth: 1,
  borderColor: COLORS.border,
  borderRadius: 8,
  backgroundColor: COLORS.card,
  paddingHorizontal: 12,
  paddingVertical: 12,
  fontSize: 15,
  color: COLORS.textPrimary,
} as const;

export const CARD = {
  backgroundColor: COLORS.card,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: COLORS.border,
  padding: 16,
  ...SHADOW,
} as const;
