import React from "react";

export function Squiggle({ color = "var(--accent-rust)", size = "40px", rotate = 0, opacity = 1, className = "" }) {
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
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 50 Q25 20, 40 50 T70 50 T90 45" />
    </svg>
  );
}

export function Sparkle({ color = "var(--accent-ochre)", size = "40px", rotate = 0, opacity = 1, className = "" }) {
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
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M50 10 Q50 45, 10 50 Q45 50, 50 90 Q50 55, 90 50 Q55 50, 50 10 Z" />
    </svg>
  );
}

export function Swirl({ color = "var(--accent-blue)", size = "40px", rotate = 0, opacity = 1, className = "" }) {
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
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M50 50 C55 45, 50 35, 45 40 C35 50, 55 65, 65 50 C75 30, 45 20, 30 45 C15 70, 55 85, 80 60" />
    </svg>
  );
}

export function Asterisk({ color = "var(--accent-rust)", size = "30px", rotate = 0, opacity = 1, className = "" }) {
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
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M50 15 L50 85" />
      <path d="M15 50 L85 50" />
      <path d="M25 25 L75 75" />
      <path d="M75 25 L25 75" />
    </svg>
  );
}

export function WavyDivider({ color = "var(--border)", size = "120px", rotate = 0, opacity = 1, className = "" }) {
  const style = {
    color,
    transform: `rotate(${rotate}deg)`,
    opacity,
    transition: "color 0.3s ease, transform 0.3s ease",
  };

  return (
    <svg
      viewBox="0 0 200 40"
      width={size}
      height="auto"
      style={style}
      className={`select-none pointer-events-none ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 20 Q30 5, 50 20 T90 20 T130 20 T170 20 T190 20" />
    </svg>
  );
}
