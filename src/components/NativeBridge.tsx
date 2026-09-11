import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Capacitor } from "@capacitor/core";

/**
 * Bridges native (Capacitor/Android) platform behavior into the React app:
 *  - Hardware back button navigates the in-app router history instead of
 *    immediately exiting, and only exits the app from the root/home screens.
 *  - Status bar is themed to match the new light + coral design system.
 * No-ops entirely on web, so it's always safe to mount.
 */
export function NativeBridge() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let backListener: { remove: () => void } | undefined;
    let mounted = true;

    (async () => {
      const [{ App: CapacitorApp }, { StatusBar, Style }] = await Promise.all([
        import("@capacitor/app"),
        import("@capacitor/status-bar"),
      ]);

      if (!mounted) return;

      // Theme the native status bar to match the light app shell
      try {
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setBackgroundColor({ color: "#FAF9F7" });
        await StatusBar.setOverlaysWebView({ overlay: false });
      } catch {
        // StatusBar plugin may be unavailable on some devices/emulators — non-fatal
      }

      const ROOT_PATHS = ["/", "/app/explore", "/app/dashboard"];

      backListener = await CapacitorApp.addListener("backButton", () => {
        const atRoot = ROOT_PATHS.includes(window.location.pathname);
        if (atRoot) {
          CapacitorApp.exitApp();
        } else {
          navigate(-1);
        }
      });
    })();

    return () => {
      mounted = false;
      backListener?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-checking on every route change isn't required for correctness here since
  // the back button reads window.location fresh on each press, but keeping the
  // dependency documents intent for future readers.
  void location;

  return null;
}
