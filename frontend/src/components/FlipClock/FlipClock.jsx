import React, { useState, useEffect, useRef } from "react";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";

export default function FlipClock() {
  const [time, setTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const clockRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Sync fullscreen change state (e.g. if exited via Escape key)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === clockRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      clockRef.current?.requestFullscreen().catch((err) => {
        console.error("Error enabling fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Format hours, minutes, and am/pm
  let hours = time.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = time.getMinutes().toString().padStart(2, "0");

  return (
    <div className="flex items-center">
      {/* ── Clock Container ── */}
      <div
        ref={clockRef}
        onClick={toggleFullscreen}
        className={`relative flex items-center justify-center gap-3 bg-slate-900 border border-slate-950 p-2.5 rounded-xl cursor-pointer hover:scale-105 active:scale-95 transition-all select-none shadow-md ${
          isFullscreen 
            ? "fixed inset-0 w-screen h-screen flex-col bg-black border-none z-[9999] p-20 gap-8" 
            : ""
        }`}
      >
        {/* Fullscreen indicator icon (floating in top right in fullscreen mode) */}
        {isFullscreen && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className="absolute top-8 right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer text-2xl z-[100]"
          >
            <MdFullscreenExit />
          </button>
        )}

        {/* The Split Flip Cards */}
        <div className={`flex items-center gap-2 ${isFullscreen ? "gap-6 scale-125" : ""}`}>
          
          {/* Hours Card */}
          <div className={`relative ${isFullscreen ? "w-44 h-56 text-[8rem]" : "w-14 h-18 text-[2.2rem]"} bg-[#141517] rounded-xl flex flex-col justify-between items-center shadow-lg border border-[#27282c] overflow-hidden`}>
            {/* Top Half */}
            <div className="w-full h-1/2 bg-[#1b1c1e] border-b border-black/35 flex items-end justify-center overflow-hidden">
              <span className="font-bold text-[#e4e4e7] leading-none transform translate-y-1/2">{formattedHours}</span>
            </div>
            {/* Bottom Half */}
            <div className="w-full h-1/2 flex items-start justify-center overflow-hidden">
              <span className="font-bold text-[#e4e4e7] leading-none transform -translate-y-1/2">{formattedHours}</span>
            </div>
          </div>

          {/* Separator split dots */}
          <div className={`flex flex-col gap-1.5 ${isFullscreen ? "gap-4" : "gap-1.5"}`}>
            <span className={`rounded-full bg-zinc-650 ${isFullscreen ? "w-4 h-4" : "w-1 h-1"}`} />
            <span className={`rounded-full bg-zinc-650 ${isFullscreen ? "w-4 h-4" : "w-1 h-1"}`} />
          </div>

          {/* Minutes Card */}
          <div className={`relative ${isFullscreen ? "w-44 h-56 text-[8rem]" : "w-14 h-18 text-[2.2rem]"} bg-[#141517] rounded-xl flex flex-col justify-between items-center shadow-lg border border-[#27282c] overflow-hidden`}>
            {/* Top Half */}
            <div className="w-full h-1/2 bg-[#1b1c1e] border-b border-black/35 flex items-end justify-center overflow-hidden">
              <span className="font-bold text-[#e4e4e7] leading-none transform translate-y-1/2">{formattedMinutes}</span>
            </div>
            {/* Bottom Half */}
            <div className="w-full h-1/2 flex items-start justify-center overflow-hidden">
              <span className="font-bold text-[#e4e4e7] leading-none transform -translate-y-1/2">{formattedMinutes}</span>
            </div>
          </div>

        </div>

        {/* AM / PM Badge */}
        <span className={`font-bold text-[#94a3b8] ${
          isFullscreen 
            ? "text-3xl tracking-widest mt-6 uppercase" 
            : "absolute left-4 bottom-3 text-[9px] uppercase tracking-wider opacity-60"
        }`}>
          {ampm}
        </span>

        {/* Study Helper Tip */}
        {isFullscreen && (
          <span className="text-zinc-500 text-sm mt-12 font-medium tracking-wide animate-pulse">
            Study Mode Active • Click anywhere or press ESC to return
          </span>
        )}
      </div>
    </div>
  );
}
