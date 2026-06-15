import React from "react";

export function Daisy({ color = "var(--accent-sage)", size = "100px", rotate = 0, opacity = 1, className = "" }) {
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
      {/* Center circle */}
      <path d="M50 50 C48 52, 47 48, 50 47 C53 47, 52 52, 50 50 Z" />
      <path d="M49 48 C48 46, 52 46, 51 49" />
      {/* Petals */}
      <path d="M50 44 C48 34, 45 22, 50 15 C55 22, 52 34, 50 44 Z" />
      <path d="M50 56 C52 66, 55 78, 50 85 C45 78, 48 66, 50 56 Z" />
      <path d="M56 50 C66 48, 78 45, 85 50 C78 55, 66 52, 56 50 Z" />
      <path d="M44 50 C34 52, 22 55, 15 50 C22 45, 34 48, 44 50 Z" />
      <path d="M54 46 C62 38, 71 27, 75 33 C71 39, 62 42, 54 46 Z" />
      <path d="M46 54 C38 62, 27 71, 33 75 C39 71, 42 62, 46 54 Z" />
      <path d="M54 54 C62 62, 73 71, 70 77 C64 75, 59 64, 54 54 Z" />
      <path d="M46 46 C38 38, 27 29, 30 23 C36 25, 41 36, 46 46 Z" />
    </svg>
  );
}

export function RoseSwirl({ color = "var(--accent-rust)", size = "100px", rotate = 0, opacity = 1, className = "" }) {
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
      {/* Central rose swirl */}
      <path d="M48 50 C49 46, 53 47, 51 51 C48 54, 44 50, 48 45 C53 40, 58 46, 55 52 C51 60, 41 57, 43 47 C46 36, 61 38, 62 49 C63 60, 49 66, 42 59 C34 50, 43 36, 55 34 C67 32, 73 48, 67 61 C61 74, 38 72, 32 57 C25 40, 41 24, 60 27" />
      {/* Outer base leaves */}
      <path d="M30 65 C24 73, 22 83, 26 87 C34 89, 40 76, 40 68" />
      <path d="M68 65 C78 71, 86 76, 88 68 C90 60, 80 58, 72 58" />
      {/* Stem link */}
      <path d="M50 72 C49 78, 52 87, 51 94" />
    </svg>
  );
}

export function Blossom({ color = "var(--accent-ochre)", size = "100px", rotate = 0, opacity = 1, className = "" }) {
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
      {/* Tiny 5-petal blossom */}
      <path d="M50 47 C52 47, 52 53, 50 53 C48 53, 48 47, 50 47 Z" />
      {/* Petal 1 */}
      <path d="M50 47 C50 36, 58 35, 58 43 C58 47, 54 48, 50 47 Z" />
      {/* Petal 2 */}
      <path d="M52 51 C61 55, 61 63, 54 62 C50 61, 50 55, 52 51 Z" />
      {/* Petal 3 */}
      <path d="M48 52 C44 61, 36 61, 37 54 C38 50, 44 50, 48 52 Z" />
      {/* Petal 4 */}
      <path d="M47 48 C38 44, 38 36, 45 37 C49 38, 49 44, 47 48 Z" />
      {/* Petal 5 (Top/center-ish) */}
      <path d="M50 47 C53 38, 47 38, 47 43 C47 47, 49 47, 50 47 Z" />
      {/* Little pistil details */}
      <path d="M50 50 L52 49" />
      <path d="M50 50 L48 51" />
    </svg>
  );
}

export function Sprig({ color = "var(--accent-sage)", size = "100px", rotate = 0, opacity = 1, className = "" }) {
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
      {/* Main vertical sprig stem */}
      <path d="M50 90 Q46 60, 52 15" />
      {/* Little branch and leaf pairs */}
      {/* Pair 1 */}
      <path d="M51 70 Q68 62, 70 52 C64 54, 56 64, 50 71" />
      <path d="M49 73 Q32 68, 28 58 C34 58, 42 66, 49 73" />
      {/* Pair 2 */}
      <path d="M51 48 Q72 40, 68 28 C62 34, 56 42, 51 48" />
      <path d="M49 51 Q28 47, 24 37 C30 39, 41 45, 49 51" />
      {/* Top tip */}
      <path d="M52 25 Q62 12, 53 5 C48 10, 48 20, 52 25" />
    </svg>
  );
}

export default function Flowers({ variant = 1, ...props }) {
  switch (Number(variant)) {
    case 1:
      return <Daisy {...props} />;
    case 2:
      return <RoseSwirl {...props} />;
    case 3:
      return <Blossom {...props} />;
    case 4:
      return <Sprig {...props} />;
    default:
      return <Daisy {...props} />;
  }
}
