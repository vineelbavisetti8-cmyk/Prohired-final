import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import AppHeader from "./AppHeader";
import AppBottomNav from "./AppBottomNav";
import AppSpotlight from "./AppSpotlight";

const isNative = Capacitor.isNativePlatform();

export default function AppShell() {
  // On a real device build there is no "preview as phone/tablet" — you ARE the phone.
  const [deviceMode, setDeviceMode] = useState<"phone" | "tablet" | "full">("full");
  const [searchOpen, setSearchOpen] = useState(false);
  const effectiveMode = isNative ? "full" : deviceMode;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-start transition-colors selection:bg-orange-500/30">
      {/* Search spotlight palette */}
      <AppSpotlight isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Frame wrapper for Device Preview switcher (web-only; irrelevant on native builds) */}
      <div
        className={`w-full transition-all duration-300 ${
          effectiveMode === "phone"
            ? "my-6 device-mockup-phone shadow-[0_25px_70px_rgba(0,0,0,0.8)] border border-gray-200 bg-white relative flex flex-col h-[844px] overflow-hidden"
            : effectiveMode === "tablet"
            ? "my-6 device-mockup-tablet shadow-[0_25px_70px_rgba(0,0,0,0.8)] border border-gray-200 bg-white relative flex flex-col h-[1024px] overflow-hidden"
            : "max-w-full min-h-screen flex flex-col"
        }`}
      >
        {/* Top Header Bar */}
        <AppHeader
          deviceMode={effectiveMode}
          setDeviceMode={setDeviceMode}
          onOpenSearch={() => setSearchOpen(true)}
          hideDeviceSwitcher={isNative}
        />

        {/* Main Content Area */}
        <main
          className={`flex-1 w-full overflow-x-hidden min-w-0 ${
            effectiveMode === "full"
              ? "pt-14 sm:pt-16 pb-24 lg:pb-12"
              : "overflow-y-auto pb-24 sm:pb-28"
          }`}
        >
          <Outlet />
        </main>

        {/* Bottom Navigation Bar: always visible on native; on web, mobile-width or preview simulation */}
        <AppBottomNav className={effectiveMode === "full" && !isNative ? "lg:hidden" : ""} />
      </div>
    </div>
  );
}
