import React from "react";
import plantImg from "../../assets/plant_transparent.png";

/**
 * FlowerDecor - Adds a subtle, aesthetically positioned flower/plant
 * decoration to any page. Fully pointer-events-none, so it never blocks UI.
 *
 * position: "bottom-right" | "bottom-left" | "top-right"
 * size:     "sm" | "md" | "lg"
 * opacity:  number 0–1 (default 0.18)
 */
export default function FlowerDecor({
  position = "bottom-right",
  size = "md",
  opacity = 0.8,
}) {
  const sizeMap = {
    sm: "w-40 h-40",
    md: "w-56 h-56",
    lg: "w-72 h-72",
  };

  const posMap = {
    "bottom-right": "bottom-0 right-0 translate-x-6 translate-y-6",
    "bottom-left": "bottom-0 left-0 -translate-x-6 translate-y-6 -scale-x-100",
    "top-right": "top-0 right-0 translate-x-6 -translate-y-6",
  };

  return (
    <div
      className={`absolute ${posMap[position]} pointer-events-none select-none z-0`}
      aria-hidden="true"
    >
      <img
        src={plantImg}
        alt=""
        className={`${sizeMap[size]} object-contain`}
        style={{
          opacity: `var(--flower-opacity, ${opacity})`,
          filter: "drop-shadow(0 12px 32px rgba(0,0,0,0.15))",
          userSelect: "none",
        }}
      />
    </div>
  );
}
