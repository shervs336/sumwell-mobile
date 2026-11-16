import type { ReactNode } from "react";

/** On phones the app fills the screen; the web version (web-frame.web.tsx) adds a device frame. */
export function WebFrame({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
