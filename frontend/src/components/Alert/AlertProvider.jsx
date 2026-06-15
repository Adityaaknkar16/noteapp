import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { MdCheckCircle, MdErrorOutline, MdInfoOutline, MdWarningAmber, MdClose } from "react-icons/md";

const AlertContext = createContext(null);

const ICONS = {
  success: MdCheckCircle,
  error: MdErrorOutline,
  info: MdInfoOutline,
  warning: MdWarningAmber,
};

const STYLES = {
  success: {
    bar: "bg-emerald-400",
    icon: "text-emerald-400",
    ring: "border-emerald-400/20",
    glow: "shadow-emerald-500/10",
    bg: "from-emerald-500/10 to-transparent",
  },
  error: {
    bar: "bg-rose-400",
    icon: "text-rose-400",
    ring: "border-rose-400/20",
    glow: "shadow-rose-500/10",
    bg: "from-rose-500/10 to-transparent",
  },
  info: {
    bar: "bg-blue-400",
    icon: "text-blue-400",
    ring: "border-blue-400/20",
    glow: "shadow-blue-500/10",
    bg: "from-blue-500/10 to-transparent",
  },
  warning: {
    bar: "bg-amber-400",
    icon: "text-amber-400",
    ring: "border-amber-400/20",
    glow: "shadow-amber-500/10",
    bg: "from-amber-500/10 to-transparent",
  },
};

let idCounter = 0;

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);

  const dismiss = useCallback((id) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, leaving: true } : a))
    );
    setTimeout(() => setAlerts((prev) => prev.filter((a) => a.id !== id)), 380);
  }, []);

  const show = useCallback(
    (message, type = "info", duration = 3500) => {
      const id = ++idCounter;
      setAlerts((prev) => [...prev, { id, message, type, leaving: false }]);
      if (duration > 0) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const alert = {
    success: (msg, dur) => show(msg, "success", dur),
    error: (msg, dur) => show(msg, "error", dur),
    info: (msg, dur) => show(msg, "info", dur),
    warning: (msg, dur) => show(msg, "warning", dur),
  };

  return (
    <AlertContext.Provider value={alert}>
      {children}

      {/* Alert Stack — top-center */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-3 pointer-events-none w-full max-w-sm px-4">
        {alerts.map((a) => {
          const s = STYLES[a.type] || STYLES.info;
          const Icon = ICONS[a.type] || MdInfoOutline;
          return (
            <div
              key={a.id}
              className={`
                pointer-events-auto w-full
                flex items-center gap-3.5 px-4 py-3.5
                rounded-2xl border backdrop-blur-xl
                bg-slate-900/90 dark:bg-slate-950/95
                shadow-2xl ${s.ring} ${s.glow}
                transition-all duration-300 ease-out
                ${a.leaving
                  ? "opacity-0 -translate-y-2 scale-95"
                  : "opacity-100 translate-y-0 scale-100"}
              `}
              style={{ willChange: "transform, opacity" }}
            >
              {/* Left color bar */}
              <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${s.bar} ml-0`}
                style={{ position: 'absolute', left: 0, top: '12px', bottom: '12px', width: '3px', borderRadius: '4px' }}
              />

              {/* Icon */}
              <span className={`text-xl flex-shrink-0 ml-2 ${s.icon}`}>
                <Icon />
              </span>

              {/* Message */}
              <p className="flex-1 text-sm font-semibold text-white leading-snug">{a.message}</p>

              {/* Close */}
              <button
                onClick={() => dismiss(a.id)}
                className="flex-shrink-0 text-slate-500 hover:text-white transition-colors cursor-pointer rounded-lg p-0.5"
              >
                <MdClose className="text-base" />
              </button>
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
