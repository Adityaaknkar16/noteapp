import React, { useState } from "react";
import { LuX, LuDelete } from "react-icons/lu";

export default function Calculator({ onResult, onClose }) {
  const [display, setDisplay] = useState("");

  const handleBtnClick = (val) => {
    setDisplay((prev) => prev + val);
  };

  const handleClear = () => {
    setDisplay("");
  };

  const handleBackspace = () => {
    setDisplay((prev) => prev.slice(0, -1));
  };

  const handleCalculate = () => {
    try {
      // Safe evaluation of standard math characters
      // We sanitise characters to prevent arbitrary script running
      const sanitized = display.replace(/[^0-9+\-*/%.]/g, "");
      // Evaluate percentage (e.g. 50% = 0.5)
      // replace "number%" with "(number/100)"
      const pctEval = sanitized.replace(/(\d+)%/g, "($1/100)");
      
      const computed = Function(`"use strict"; return (${pctEval})`)();
      if (computed !== undefined && !isNaN(computed)) {
        setDisplay(String(computed));
        if (onResult) {
          onResult(computed);
        }
      } else {
        setDisplay("Error");
      }
    } catch (err) {
      setDisplay("Error");
    }
  };

  const handleConfirm = () => {
    const val = Number(display);
    if (!isNaN(val) && onResult) {
      onResult(val);
    }
    if (onClose) onClose();
  };

  const buttons = [
    { label: "C", action: handleClear, style: "text-accent-rust font-bold" },
    { label: "⌫", action: handleBackspace, style: "text-accent-rust" },
    { label: "%", action: () => handleBtnClick("%"), style: "text-ink-muted" },
    { label: "/", action: () => handleBtnClick("/"), style: "text-accent-rust font-bold" },

    { label: "7", action: () => handleBtnClick("7") },
    { label: "8", action: () => handleBtnClick("8") },
    { label: "9", action: () => handleBtnClick("9") },
    { label: "*", action: () => handleBtnClick("*"), style: "text-accent-rust font-bold" },

    { label: "4", action: () => handleBtnClick("4") },
    { label: "5", action: () => handleBtnClick("5") },
    { label: "6", action: () => handleBtnClick("6") },
    { label: "-", action: () => handleBtnClick("-"), style: "text-accent-rust font-bold" },

    { label: "1", action: () => handleBtnClick("1") },
    { label: "2", action: () => handleBtnClick("2") },
    { label: "3", action: () => handleBtnClick("3") },
    { label: "+", action: () => handleBtnClick("+"), style: "text-accent-rust font-bold" },

    { label: "0", action: () => handleBtnClick("0"), span: true },
    { label: ".", action: () => handleBtnClick(".") },
    { label: "=", action: handleCalculate, style: "bg-accent-rust text-white font-bold rounded-lg" }
  ];

  return (
    <div className="bg-surface border border-border rounded-lg shadow-xl p-4 w-60 select-none text-ink text-xs flex flex-col gap-3 z-[9999]">
      <div className="flex justify-between items-center border-b border-border pb-2">
        <span className="font-mono font-bold tracking-wider text-[10px] text-ink-muted uppercase">Inkwell Calculator</span>
        <button onClick={onClose} className="text-ink-muted hover:text-ink cursor-pointer"><LuX className="text-sm" /></button>
      </div>

      {/* Screen display */}
      <div className="bg-bg border border-border p-2.5 rounded font-mono text-right text-base font-bold min-h-[42px] break-all">
        {display || "0"}
      </div>

      {/* Button Grid */}
      <div className="grid grid-cols-4 gap-2">
        {buttons.map((btn, idx) => (
          <button
            key={idx}
            type="button"
            onClick={btn.action}
            className={`h-9 flex items-center justify-center border border-border rounded-md font-semibold bg-surface hover:bg-bg transition-colors cursor-pointer ${
              btn.span ? "col-span-2" : ""
            } ${btn.style || ""}`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <button 
        type="button" 
        onClick={handleConfirm}
        className="btn-primary py-2 text-xs font-bold w-full"
      >
        Use Value
      </button>
    </div>
  );
}
