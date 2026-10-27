import React from "react";
import { 
  LuCheckCircle2, 
  LuAlertCircle, 
  LuAlertTriangle, 
  LuInfo, 
  LuX 
} from "react-icons/lu";

const TYPE_CONFIG = {
  success: {
    label: "Success",
    icon: LuCheckCircle2,
    badgeClass: "bg-accent-sage/15 text-accent-sage border-accent-sage/30",
    barClass: "bg-accent-sage",
    textClass: "text-accent-sage",
    containerBg: "bg-accent-sage/5",
  },
  error: {
    label: "Error",
    icon: LuAlertCircle,
    badgeClass: "bg-accent-red/15 text-accent-red border-accent-red/30",
    barClass: "bg-accent-red",
    textClass: "text-accent-red",
    containerBg: "bg-accent-red/5",
  },
  warning: {
    label: "Warning",
    icon: LuAlertTriangle,
    badgeClass: "bg-accent-ochre/15 text-accent-ochre border-accent-ochre/30",
    barClass: "bg-accent-ochre",
    textClass: "text-accent-ochre",
    containerBg: "bg-accent-ochre/5",
  },
  info: {
    label: "Note",
    icon: LuInfo,
    badgeClass: "bg-accent-blue/15 text-accent-blue border-accent-blue/30",
    barClass: "bg-accent-blue",
    textClass: "text-accent-blue",
    containerBg: "bg-accent-blue/5",
  },
};

/**
 * An inline error/success/warning/info message banner that
 * seamlessly matches the Inkwell theme (Cream, Lavender, Midnight, Dark).
 */
export default function AlertMessage({ 
  type = "error", 
  message, 
  title, 
  onClose,
  className = "" 
}) {
  if (!message) return null;

  const config = TYPE_CONFIG[type] || TYPE_CONFIG.info;
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={`
        relative overflow-hidden w-full
        flex items-start gap-3 p-3.5 rounded-xl border border-border
        bg-surface text-ink shadow-sm transition-all
        ${config.containerBg}
        ${className}
      `}
    >
      {/* Theme Status Accent Strip */}
      <span 
        aria-hidden="true" 
        className={`absolute left-0 top-0 bottom-0 w-1.5 ${config.barClass}`}
      />

      {/* Icon Badge */}
      <div 
        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border shadow-2xs ${config.badgeClass} ml-1`}
      >
        <Icon className="text-lg" />
      </div>

      {/* Message content */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${config.textClass}`}>
            {title || config.label}
          </span>
        </div>
        <div className="text-xs md:text-sm font-medium text-ink leading-relaxed break-words">
          {message}
        </div>
      </div>

      {/* Optional dismiss button */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss alert"
          className="flex-shrink-0 text-ink-muted hover:text-ink hover:bg-border/40 rounded-lg p-1 transition-colors cursor-pointer"
        >
          <LuX className="text-base" />
        </button>
      )}
    </div>
  );
}
