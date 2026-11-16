import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

/** Light taps on native; silently nothing on the web. */
export const tap = () => {
  if (Platform.OS !== "web") Haptics.selectionAsync().catch(() => {});
};
export const success = () => {
  if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
};
export const warn = () => {
  if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
};
