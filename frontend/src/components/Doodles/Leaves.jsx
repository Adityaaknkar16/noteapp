import React from "react";

export function FernFrond({ color = "var(--accent-sage)", size = "100px", rotate = 0, opacity = 1, className = "" }) {
  const style = {
    color,
    transform: `rotate(${rotate}deg)`,
    opacity,
    transition: "color 0.3s ease, transform 0.3s ease",
  };

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={style}
      className={`select-none pointer-events-none ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Curved main stem */}
      <path d="M15 85 Q45 80, 75 25" />
      {/* Right side leaflets */}
      <path d="M28 81 C38 78, 45 76, 50 82" />
      <path d="M37 73 C48 68, 55 64, 59 70" />
      <path d="M46 62 C57 55, 64 51, 68 56" />
      <path d="M55 50 C66 42, 73 37, 76 42" />
      <path d="M63 38 C72 29, 78 24, 82 28" />
      
      {/* Left side leaflets */}
      <path d="M22 83 C16 75, 12 70, 18 68" />
      <path d="M30 76 C22 68, 18 62, 23 60" />
      <path d="M38 67 C30 58, 25 52, 30 50" />
      <path d="M47 57 C38 47, 33 41, 38 39" />
      <path d="M56 46 C47 35, 42 29, 46 27" />
      
      {/* Top frond tip */}
      <path d="M72 29 Q82 15, 84 10" />
    </svg>
  );
}

export function DetailedLeaf({ color = "var(--accent-sage)", size = "100px", rotate = 0, opacity = 1, className = "" }) {
  const style = {
    color,
    transform: `rotate(${rotate}deg)`,
    opacity,
    transition: "color 0.3s ease, transform 0.3s ease",
  };

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={style}
      className={`select-none pointer-events-none ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Main stem and center vein */}
      <path d="M50 95 C50 80, 52 40, 50 5" />
      {/* Leaf outline left side */}
      <path d="M50 5 C32 20, 20 45, 25 70 C28 80, 42 85, 50 90" />
      {/* Leaf outline right side */}
      <path d="M50 5 C68 20, 80 45, 75 70 C72 80, 58 85, 50 90" />
      {/* Left veins */}
      <path d="M50 72 C42 66, 34 65, 30 68" />
      <path d="M50 52 C38 45, 28 46, 26 53" />
      <path d="M50 32 C40 26, 32 28, 31 34" />
      {/* Right veins */}
      <path d="M50 72 C58 66, 66 65, 70 68" />
      <path d="M50 52 C62 45, 72 46, 74 53" />
      <path d="M50 32 C60 26, 68 28, 69 34" />
    </svg>
  );
}

export function LeafyStem({ color = "var(--accent-sage)", size = "100px", rotate = 0, opacity = 1, className = "" }) {
  const style = {
    color,
    transform: `rotate(${rotate}deg)`,
    opacity,
    transition: "color 0.3s ease, transform 0.3s ease",
  };

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={style}
      className={`select-none pointer-events-none ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Stem */}
      <path d="M30 90 Q50 60, 45 10" />
      {/* Alternate leaves */}
      {/* Leaf 1 (Left low) */}
      <path d="M34 78 C22 75, 14 62, 22 55 C28 50, 36 62, 38 72" />
      {/* Leaf 2 (Right mid) */}
      <path d="M42 63 C55 62, 65 52, 60 42 C56 34, 46 44, 44 54" />
      {/* Leaf 3 (Left high) */}
      <path d="M45 42 C35 38, 28 26, 34 18 C40 12, 45 25, 46 32" />
      {/* Leaf 4 (Right high) */}
      <path d="M46 25 C56 22, 62 10, 56 4 C50 -2, 47 12, 46 17" />
    </svg>
  );
}

export function OliveSprig({ color = "var(--accent-sage)", size = "100px", rotate = 0, opacity = 1, className = "" }) {
  const style = {
    color,
    transform: `rotate(${rotate}deg)`,
    opacity,
    transition: "color 0.3s ease, transform 0.3s ease",
  };

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={style}
      className={`select-none pointer-events-none ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Stem */}
      <path d="M50 90 Q50 45, 50 15" />
      {/* Long narrow olive-style leaves */}
      {/* Lowest pair */}
      <path d="M50 75 Q72 70, 78 58 Q60 62, 50 75" />
      <path d="M50 75 Q28 70, 22 58 Q40 62, 50 75" />
      {/* Middle pair */}
      <path d="M50 50 Q75 42, 80 28 Q58 35, 50 50" />
      <path d="M50 50 Q25 42, 20 28 Q42 35, 50 50" />
      {/* Top pair */}
      <path d="M50 28 Q70 18, 72 4 Q54 12, 50 28" />
      <path d="M50 28 Q30 18, 28 4 Q46 12, 50 28" />
    </svg>
  );
}

export default function Leaves({ variant = 1, ...props }) {
  switch (Number(variant)) {
    case 1:
      return <FernFrond {...props} />;
    case 2:
      return <DetailedLeaf {...props} />;
    case 3:
      return <LeafyStem {...props} />;
    case 4:
      return <OliveSprig {...props} />;
    default:
      return <FernFrond {...props} />;
  }
}
