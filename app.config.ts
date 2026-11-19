import type { ConfigContext, ExpoConfig } from "expo/config";

/**
 * Everything lives in app.json; this only picks the update runtime.
 * - Store and APK builds set APP_RUNTIME=build (eas.json build profiles), which both the local CLI and
 *   the cloud builder see, so they agree: updates are tied to the app version.
 * - The update published for Expo Go must use Expo Go's SDK runtime (exposdk:58.0.0).
 */
export default ({ config }: ConfigContext): ExpoConfig =>
  ({
    ...config,
    runtimeVersion: process.env.APP_RUNTIME === "build" ? { policy: "appVersion" } : { policy: "sdkVersion" },
  }) as ExpoConfig;
