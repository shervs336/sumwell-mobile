import { useSyncExternalStore } from "react";
import { useColorScheme } from "react-native";

/**
 * The web build is pre-rendered as static HTML without knowing the viewer's color scheme, so it's
 * rendered light. Using light during hydration, then the real scheme, makes React re-render with
 * the right colors instead of leaving mismatched server styles in place.
 */
const subscribe = () => () => {};
export function useScheme(): "light" | "dark" {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const scheme = useColorScheme();
  return hydrated && scheme === "dark" ? "dark" : "light";
}
