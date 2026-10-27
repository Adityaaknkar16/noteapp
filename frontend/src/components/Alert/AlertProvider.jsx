import React, { createContext, useContext, useState, useCallback } from "react";
import { 
  LuCheckCircle2, 
  LuAlertCircle, 
  LuAlertTriangle, 
  LuInfo, 
  LuX 
} from "react-icons/lu";

const AlertContext = createContext(null);

const ALERT_CONFIG = {
  success: {
    label: "Success",
    icon: LuCheckCircle2,
    badgeClass: "bg-accent-sage/15 text-accent-sage border-accent-sage/30",
    barClass: "bg-accent-sage",
    textClass: "text-accent-sage",
    progressClass: "bg-accent-sage/60",
    glow: "shadow-accent-sage/10",
  },
  error: {
    label: "Error",
    icon: LuAlertCircle,
    badgeClass: "bg-accent-red/15 text-accent-red border-accent-red/30",
    barClass: "bg-accent-red",
    textClass: "text-accent-red",
    progressClass: "bg-accent-red/60",
    glow: "shadow-accent-red/10",
  },
  warning: {
    label: "Warning",
    icon: LuAlertTriangle,
    badgeClass: "bg-accent-ochre/15 text-accent-ochre border-accent-ochre/30",
    barClass: "bg-accent-ochre",
    textClass: "text-accent-ochre",
    progressClass: "bg-accent-ochre/60",
    glow: "shadow-accent-ochre/10",
  },
  info: {
    label: "Note",
    icon: LuInfo,
    badgeClass: "bg-accent-blue/15 text-accent-blue border-accent-blue/30",
    barClass: "bg-accent-blue",
    textClass: "text-accent-blue",
    progressClass: "bg-accent-blue/60",
    glow: "shadow-accent-blue/10",
  },
};

let idCounter = 0;

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);

  const dismiss = useCallback((id) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, leaving: true } : a))
    );
    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }, 320);
  }, []);

  const show = useCallback(
    (message, type = "info", options = {}) => {
      const id = ++idCounter;
      const duration = typeof options === "number" ? options : (options.duration ?? 3800);
      const title = typeof options === "object" ? options.title : undefined;

      setAlerts((prev) => [
        ...prev, 
        { 
          id, 
          message, 
          type, 
          title, 
          duration, 
          createdAt: Date.now(),
          leaving: false 
        }
      ]);

      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  const alert = {
    success: (msg, opts) => show(msg, "success", opts),
    error: (msg, opts) => show(msg, "error", opts),
    info: (msg, opts) => show(msg, "info", opts),
    warning: (msg, opts) => show(msg, "warning", opts),
    dismiss,
  };

  return (
    <AlertContext.Provider value={alert}>
      {children}

      {/* Alert Notification Toast Stack — top center, floating in app theme */}
      <div 
        aria-live="polite"
        className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2.5 pointer-events-none w-full max-w-md px-4"
      >
        {alerts.map((a) => {
          const cfg = ALERT_CONFIG[a.type] || ALERT_CONFIG.info;
          const Icon = cfg.icon;

          return (
            <div
              key={a.id}
              role="alert"
              className={`
                pointer-events-auto w-full relative overflow-hidden
                flex items-center gap-3.5 px-4 py-3.5
                rounded-2xl border border-border/80 backdrop-blur-xl
                bg-surface/95 text-ink
                shadow-xl shadow-ink/10 ${cfg.glow}
                transition-all duration-300 ease-out
                ${a.leaving
                  ? "opacity-0 -translate-y-3 scale-95"
                  : "opacity-100 translate-y-0 scale-100"}
              `}
              style={{ willChange: "transform, opacity" }}
            >
              {/* Left Theme Status Accent Stripe */}
              <div 
                className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full ${cfg.barClass}`}
              />

              {/* Status Icon Badge */}
              <div 
                className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border shadow-2xs ${cfg.badgeClass} ml-1`}
              >
                <Icon className="text-lg" />
              </div>

              {/* Content text */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.textClass}`}>
                    {a.title || cfg.label}
                  </span>
                </div>
                <p className="text-sm font-semibold text-ink leading-snug break-words mt-0.5">
                  {a.message}
                </p>
              </div>

              {/* Dismiss Button */}
              <button
                type="button"
                onClick={() => dismiss(a.id)}
                aria-label="Dismiss message"
                className="flex-shrink-0 text-ink-muted hover:text-ink hover:bg-border/40 rounded-lg p-1.5 transition-colors cursor-pointer"
              >
                <LuX className="text-base" />
              </button>

              {/* Auto-dismiss countdown bar at bottom */}
              {a.duration > 0 && (
                <div 
                  className={`absolute left-0 bottom-0 h-[2.5px] ${cfg.progressClass}`}
                  style={{
                    animation: `shrinkWidth ${a.duration}ms linear forwards`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAlert must be used inside <AlertProvider>");
  return ctx;
}
