import React from "react";

export function CornerTopLeft({ color = "var(--accent-sage)", size = "100px", opacity = 0.25, className = "" }) {
  const style = { color, opacity, transition: "color 0.3s ease" };
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      style={style}
      className={`select-none pointer-events-none ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Corner border guidelines */}
      <path d="M10 90 L10 10 Q10 10, 90 10" strokeWidth="1.2" strokeDasharray="3 3" />
      {/* Botanical swirls */}
      <path d="M10 10 Q40 40, 70 20 Q50 60, 20 70" />
      {/* Leaves branching from corner */}
      <path d="M10 10 Q18 45, 30 50 Q18 35, 10 10" />
      <path d="M10 10 Q45 18, 50 30 Q35 18, 10 10" />
      <path d="M30 30 C34 22, 42 22, 40 34 C34 40, 26 34, 30 30 Z" />
    </svg>
  );
}

export function CornerTopRight({ color = "var(--accent-sage)", size = "100px", opacity = 0.25, className = "" }) {
  const style = { color, opacity, transition: "color 0.3s ease" };
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      style={style}
      className={`select-none pointer-events-none ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M110 90 L110 10 Q110 10, 30 10" strokeWidth="1.2" strokeDasharray="3 3" />
      <path d="M110 10 Q80 40, 50 20 Q70 60, 100 70" />
      <path d="M110 10 Q102 45, 90 50 Q102 35, 110 10" />
      <path d="M110 10 Q75 18, 70 30 Q85 18, 110 10" />
      <path d="M90 30 C86 22, 78 22, 80 34 C86 40, 94 34, 90 30 Z" />
    </svg>
  );
}

export function CornerBottomLeft({ color = "var(--accent-sage)", size = "100px", opacity = 0.25, className = "" }) {
  const style = { color, opacity, transition: "color 0.3s ease" };
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      style={style}
      className={`select-none pointer-events-none ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 30 L10 110 Q10 110, 90 110" strokeWidth="1.2" strokeDasharray="3 3" />
      <path d="M10 110 Q40 80, 70 100 Q50 60, 20 50" />
      <path d="M10 110 Q18 75, 30 70 Q18 85, 10 110" />
      <path d="M10 110 Q45 102, 50 90 Q35 102, 10 110" />
      <path d="M30 90 C34 98, 42 98, 40 86 C34 80, 26 86, 30 90 Z" />
    </svg>
  );
}

export function CornerBottomRight({ color = "var(--accent-sage)", size = "100px", opacity = 0.25, className = "" }) {
  const style = { color, opacity, transition: "color 0.3s ease" };
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      style={style}
      className={`select-none pointer-events-none ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M110 30 L110 110 Q110 110, 30 110" strokeWidth="1.2" strokeDasharray="3 3" />
      <path d="M110 110 Q80 80, 50 100 Q70 60, 100 50" />
      <path d="M110 110 Q102 75, 90 70 Q102 85, 110 110" />
      <path d="M110 110 Q75 102, 70 90 Q85 102, 110 110" />
      <path d="M90 90 C86 98, 78 98, 80 86 C86 80, 94 86, 90 90 Z" />
    </svg>
  );
}
