import React, { useRef, useState } from "react";

/**
 * Tilt3D - A component that wraps children to give them a premium 3D tilt hover effect.
 * It tracks mouse movement over the element and tilts it dynamically.
 */
export default function Tilt3D({ children, className = "", maxTilt = 15, scale = 1.03 }) {
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({});

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    // Position of cursor relative to element
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalize position from -0.5 to 0.5
    const normalizedX = x / rect.width - 0.5;
    const normalizedY = y / rect.height - 0.5;
    
    // Calculate rotation:
    // Moving mouse to the right (positive normalizedX) rotates around Y-axis (positive/negative rotation depending on preference)
    // Moving mouse to the bottom (positive normalizedY) rotates around X-axis (negative/positive rotation depending on preference)
    const rotateX = (-normalizedY * maxTilt).toFixed(2);
    const rotateY = (normalizedX * maxTilt).toFixed(2);

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`,
      transition: "transform 0.1s ease-out, box-shadow 0.1s ease-out",
      boxShadow: "0 20px 35px rgba(0, 0, 0, 0.15), 0 15px 15px rgba(66, 133, 244, 0.05)",
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.5s cubic-bezier(0.25, 1, 0.5, 1)",
      boxShadow: "none",
    });
  };

  return (
    <div
      ref={cardRef}
      className={`transition-all duration-300 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        willChange: "transform",
        ...tiltStyle,
      }}
    >
      {children}
    </div>
  );
}
