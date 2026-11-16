import { useColorScheme } from "react-native";

/** On iOS and Android the system scheme is known from the first frame. */
export function useScheme(): "light" | "dark" {
  return useColorScheme() === "dark" ? "dark" : "light";
}
