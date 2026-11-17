import type { ConfigContext, ExpoConfig } from "expo/config";

/**
 * Everything lives in app.json; this only picks the update runtime.
 * - Store and APK builds (EAS sets EAS_BUILD_PROFILE) tie updates to the app version.
 * - The update published for Expo Go must use Expo Go's SDK runtime (exposdk:58.0.0).
 */
export default ({ config }: ConfigContext): ExpoConfig =>
  ({
    ...config,
    runtimeVersion: process.env.EAS_BUILD_PROFILE ? { policy: "appVersion" } : { policy: "sdkVersion" },
  }) as ExpoConfig;
