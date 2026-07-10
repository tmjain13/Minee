import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  MapPin,
  Bell,
  Mic,
  Camera,
  Database,
  ShieldCheck,
  ArrowRight,
  Loader2,
} from "lucide-react";
import PermissionCard from "./PermissionCard";

interface UnifiedPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionsUpdated?: () => void;
}

export default function UnifiedPermissionsModal({
  isOpen,
  onClose,
  onPermissionsUpdated,
}: UnifiedPermissionsModalProps) {
  // Local state representing permission checks
  const [permissions, setPermissions] = useState({
    location: {
      checked: true,
      status: "default",
      title: "Location Services",
      desc: "Required for solar angles, precise Panchang timers, and local sunrise/sunset calculations.",
    },
    notifications: {
      checked: true,
      status: "default",
      title: "Push Notifications",
      desc: "Enables daily Sadhana progress logs, fast milestones, and essential spiritual alerts.",
    },
    microphone: {
      checked: true,
      status: "default",
      title: "Sound & Audio Input",
      desc: "Empowers hand-free mantra chanting controls, vocal recitation monitoring, and AI voice queries.",
    },
    camera: {
      checked: true,
      status: "true",
      title: "Device Camera",
      desc: "Allows instant profile avatar capture and taking pictures of old manuscripts for archival submissions.",
    },
    offline: {
      checked: true,
      status: "default",
      title: "Offline Storage Cache",
      desc: "Caches the holy Terapanth canon securely in structured high-scale IndexedDB for local use.",
    },
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [grantStep, setGrantStep] = useState<string>("");

  // Auto-fill initial status upon opening
  useEffect(() => {
    if (typeof window === "undefined") return;

    const loc = localStorage.getItem("perm_location") || "default";
    const notif =
      "Notification" in window ? Notification.permission : "unsupported";
    const mic = localStorage.getItem("perm_microphone") || "default";
    const cam = localStorage.getItem("perm_camera") || "default";
    const isOfflineSaved = localStorage.getItem(
      "terapanth_ai_offline_knowledge",
    )
      ? "granted"
      : "default";

    setPermissions((prev) => ({
      ...prev,
      location: { ...prev.location, status: loc },
      notifications: { ...prev.notifications, status: notif },
      microphone: { ...prev.microphone, status: mic },
      camera: { ...prev.camera, status: cam },
      offline: { ...prev.offline, status: isOfflineSaved },
    }));
  }, [isOpen]);

  const handleGrantSequence = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // 1. Location
      if (permissions.location.checked) {
        setGrantStep("Requesting Location Access...");
        await new Promise<void>((resolve) => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                localStorage.setItem("perm_location", "granted");
                resolve();
              },
              (err) => {
                localStorage.setItem("perm_location", "denied");
                resolve();
              },
              { timeout: 4000 },
            );
          } else {
            resolve();
          }
        });
      }

      // 2. Notifications
      if (permissions.notifications.checked && "Notification" in window) {
        setGrantStep("Requesting Calendar Alerts...");
        try {
          const status = await Notification.requestPermission();
          localStorage.setItem("perm_notifications", status);
        } catch {
          // Ignores error if unsupported standard behaviors apply
        }
      }

      // 3. Microphone
      if (permissions.microphone.checked) {
        setGrantStep("Calibrating Microphone Feed...");
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              audio: true,
            });
            stream.getTracks().forEach((track) => track.stop());
            localStorage.setItem("perm_microphone", "granted");
          } catch {
            localStorage.setItem("perm_microphone", "denied");
          }
        }
      }

      // 4. Camera
      if (permissions.camera.checked) {
        setGrantStep("Initializing Camera Lens...");
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: true,
            });
            stream.getTracks().forEach((track) => track.stop());
            localStorage.setItem("perm_camera", "granted");
          } catch {
            localStorage.setItem("perm_camera", "denied");
          }
        }
      }

      // 5. Offline Structured Cache
      if (permissions.offline.checked) {
        setGrantStep("Allocating Cache Cells...");
        try {
          if (navigator.storage && navigator.storage.persist) {
            await navigator.storage.persist();
            localStorage.setItem("perm_offline", "granted");
          }
        } catch {
          // Ignore persistent error gracefully
        }
      }

      setGrantStep("Finalizing configuration settings...");
      localStorage.setItem("unified_perms_prompted", "true");

      // Delay slightly for awesome feedback transitions
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (onPermissionsUpdated) {
        onPermissionsUpdated();
      }
      onClose();
    } catch (e) {
      console.error("Unified permissions request flow failed:", e);
    } finally {
      setIsProcessing(false);
      setGrantStep("");
    }
  };

  const handleSkipOrDismiss = () => {
    localStorage.setItem("unified_perms_prompted", "true");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="unified-perms-overlay"
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
        >
          {/* Ambient Backdrop Overlay */}
          <motion.div
            id="unified-perms-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleSkipOrDismiss}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Dialog Body */}
          <motion.div
            id="unified-perms-container"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-lg bg-[#FAF9F6] dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-3xl overflow-hidden shadow-2xl border border-orange-500/10 flex flex-col max-h-[90dvh]"
          >
            {/* Elegant Header with custom style colors */}
            <div
              id="unified-perms-header"
              className="p-6 pb-4 border-b border-zinc-200/60 dark:border-zinc-800/60 flex items-start justify-between"
            >
              <div className="flex gap-3">
                <div
                  id="unified-perms-shield"
                  className="p-2.5 bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-2xl shadow-lg ring-4 ring-orange-500/15"
                >
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h2
                    id="unified-perms-title"
                    className="serif-text text-xl font-bold text-orange-950 dark:text-zinc-50 flex items-center gap-1.5 leading-none"
                  >
                    Spiritual Access Center
                  </h2>
                  <p
                    id="unified-perms-subtitle"
                    className="text-[10px] text-zinc-450 dark:text-zinc-400 font-bold uppercase tracking-widest mt-1.5"
                  >
                    Unified Privacy & Hardware Consents
                  </p>
                </div>
              </div>
              <button
                id="unified-perms-close-btn"
                onClick={handleSkipOrDismiss}
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                title="Dismiss Permissions Center"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrolling List Content */}
            <div
              id="unified-perms-list"
              className="flex-1 overflow-y-auto p-6 space-y-4"
            >
              <p
                id="unified-perms-description"
                className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-1"
              >
                To serve high-precision astrologics, audio voice-driven mantras,
                offline capability, and daily reminders, Terapanth AI requests
                access to your hardware utilities. Please accept standard
                browser alerts when prompted.
              </p>

              {/* Individual Option Rows */}
              <div className="space-y-3">
                {/* 1. Location Access Toggle */}
                <PermissionCard
                  title={permissions.location.title}
                  description={permissions.location.desc}
                  icon={<MapPin size={18} />}
                  checked={permissions.location.checked}
                  status={permissions.location.status}
                  onAllow={() =>
                    setPermissions((prev) => ({
                      ...prev,
                      location: { ...prev.location, checked: true },
                    }))
                  }
                  onIgnore={() =>
                    setPermissions((prev) => ({
                      ...prev,
                      location: { ...prev.location, checked: false },
                    }))
                  }
                />

                {/* 2. Push Notifications Toggle */}
                <PermissionCard
                  title={permissions.notifications.title}
                  description={permissions.notifications.desc}
                  icon={<Bell size={18} />}
                  checked={permissions.notifications.checked}
                  status={permissions.notifications.status}
                  onAllow={() =>
                    setPermissions((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, checked: true },
                    }))
                  }
                  onIgnore={() =>
                    setPermissions((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, checked: false },
                    }))
                  }
                />

                {/* 3. Microphone Access Toggle */}
                <PermissionCard
                  title={permissions.microphone.title}
                  description={permissions.microphone.desc}
                  icon={<Mic size={18} />}
                  checked={permissions.microphone.checked}
                  status={permissions.microphone.status}
                  onAllow={() =>
                    setPermissions((prev) => ({
                      ...prev,
                      microphone: { ...prev.microphone, checked: true },
                    }))
                  }
                  onIgnore={() =>
                    setPermissions((prev) => ({
                      ...prev,
                      microphone: { ...prev.microphone, checked: false },
                    }))
                  }
                />

                {/* 4. Camera Access Toggle */}
                <PermissionCard
                  title={permissions.camera.title}
                  description={permissions.camera.desc}
                  icon={<Camera size={18} />}
                  checked={permissions.camera.checked}
                  status={permissions.camera.status}
                  onAllow={() =>
                    setPermissions((prev) => ({
                      ...prev,
                      camera: { ...prev.camera, checked: true },
                    }))
                  }
                  onIgnore={() =>
                    setPermissions((prev) => ({
                      ...prev,
                      camera: { ...prev.camera, checked: false },
                    }))
                  }
                />

                {/* 5. Offline Cache persistent Storage */}
                <PermissionCard
                  title={permissions.offline.title}
                  description={permissions.offline.desc}
                  icon={<Database size={18} />}
                  checked={permissions.offline.checked}
                  status={permissions.offline.status}
                  onAllow={() =>
                    setPermissions((prev) => ({
                      ...prev,
                      offline: { ...prev.offline, checked: true },
                    }))
                  }
                  onIgnore={() =>
                    setPermissions((prev) => ({
                      ...prev,
                      offline: { ...prev.offline, checked: false },
                    }))
                  }
                />
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div
              id="unified-perms-footer"
              className="p-6 bg-zinc-50 dark:bg-zinc-850 border-t border-zinc-200/60 dark:border-zinc-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <button
                id="unified-perms-skip-btn"
                onClick={handleSkipOrDismiss}
                className="order-2 sm:order-1 text-xs font-black text-zinc-400 hover:text-orange-600 uppercase tracking-widest py-3 text-center transition-colors px-1 shrink-0"
              >
                Decide Later
              </button>

              <button
                id="unified-perms-grant-all-btn"
                onClick={handleGrantSequence}
                disabled={isProcessing}
                className="order-1 sm:order-2 flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:opacity-95 text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl shadow-lg active:scale-98 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>{grantStep || "Invoking Prompts..."}</span>
                  </>
                ) : (
                  <>
                    <span>Grant Selected Access</span>
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
