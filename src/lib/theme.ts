import { Platform } from "react-native";
import { useScheme } from "./use-scheme";

/** Sumwell's palette, shared with the web dashboard, in light and dark. */
const light = {
  bg: "#f5f5f2",
  surface: "#ffffff",
  surface2: "#efefea",
  ink: "#15161a",
  muted: "#62656d",
  line: "#e3e3dd",
  accent: "#4f44d4",
  accentSoft: "#ecebfd",
  accentInk: "#ffffff",
  pos: "#0b7a5c",
  neg: "#c2362f",
  income: "#0f9a72",
  shadow: "rgba(16,17,20,0.08)",
};

const dark: typeof light = {
  bg: "#0c0d10",
  surface: "#16181d",
  surface2: "#1f2228",
  ink: "#eceef2",
  muted: "#9ca1ac",
  line: "#272a32",
  accent: "#8d86ff",
  accentSoft: "#25234a",
  accentInk: "#0c0d10",
  pos: "#3fd1a0",
  neg: "#ff7a70",
  income: "#34d39f",
  shadow: "rgba(0,0,0,0.5)",
};

export type Palette = typeof light;

export function useColors(): Palette & { scheme: "light" | "dark" } {
  const scheme = useScheme();
  return { ...(scheme === "dark" ? dark : light), scheme };
}

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 };
export const radius = { sm: 10, md: 16, lg: 22, pill: 999 };

/** Tabular digits keep amounts from jiggling as they change. */
export const num = { fontVariant: ["tabular-nums" as const] };

export const font = Platform.select({
  web: { fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" },
  default: {},
});
