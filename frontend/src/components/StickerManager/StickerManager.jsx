import React, { useState, useRef } from "react";
import { MdCloudUpload, MdLayersClear, MdDeleteOutline, MdSettings } from "react-icons/md";
import { useAlert } from "../Alert/AlertProvider";

export default function StickerManager({ stickers = [], setStickers, penColor = "#3B82F6" }) {
  const alert = useAlert();
  const fileInputRef = useRef(null);
  const [threshold, setThreshold] = useState(230); // Default white threshold
  const [processing, setProcessing] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const processImage = (file, threshVal = threshold) => {
    setProcessing(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Convert near-white background pixels to transparent
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // If R, G, B are all above threshold, set alpha to 0
          if (r > threshVal && g > threshVal && b > threshVal) {
            data[i + 3] = 0;
          }
        }

        ctx.putImageData(imageData, 0, 0);
        const processedBase64 = canvas.toDataURL("image/png");
        
        // Add to stickers array
        setStickers((prev) => [...prev, processedBase64]);
        setProcessing(false);
        alert.success("Diagram added as a sticker!");
      };
    };
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert.error("Please upload an image file");
      return;
    }
    processImage(file);
  };

  const handleRemoveSticker = (indexToRemove) => {
    setStickers((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    alert.success("Sticker removed");
  };

  return (
    <div className="mt-6 border-t border-slate-200/50 dark:border-slate-800/80 pt-4">
      <div className="flex items-center justify-between mb-3">
        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
          ✏️ Notepad Stickers & Diagrams
        </label>
        
        <button
          type="button"
          onClick={() => setShowConfig(!showConfig)}
          className="text-xs font-bold text-slate-500 hover:text-blue-500 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <MdSettings className="text-sm" /> Sticker Settings
        </button>
      </div>

      {showConfig && (
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl mb-4 border border-slate-100 dark:border-slate-800/60 transition-all">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
            Background Removal Sensitivity: {threshold}
          </label>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block mb-2 leading-relaxed">
            Lower value removes more light shades (e.g. shadows), higher value preserves more detail.
          </span>
          <input
            type="range"
            min="150"
            max="250"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      )}

      {/* Stickers Grid */}
      <div className="flex flex-wrap gap-4 items-center mb-4 min-h-[60px] p-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10">
        {stickers.map((src, idx) => (
          <div
            key={idx}
            className="relative group w-24 h-24 flex items-center justify-center bg-white/40 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800/60"
          >
            {/* The base64 processed image style with die-cut white outline & shadow */}
            <img
              src={src}
              alt="Sticker"
              className="max-w-[80px] max-h-[80px] object-contain transition-transform group-hover:scale-105"
              style={{
                filter: "drop-shadow(2px 0 0 white) drop-shadow(-2px 0 0 white) drop-shadow(0 2px 0 white) drop-shadow(0 -2px 0 white) drop-shadow(0 4px 6px rgba(0,0,0,0.15))"
              }}
            />
            <button
              type="button"
              onClick={() => handleRemoveSticker(idx)}
              className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-red-600"
            >
              <MdDeleteOutline className="text-sm" />
            </button>
          </div>
        ))}

        {processing ? (
          <div className="w-24 h-24 flex flex-col items-center justify-center text-[10px] font-bold text-blue-500 dark:text-blue-400 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl border border-blue-200 animate-pulse">
            <span className="mb-1">Stickerifying...</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-24 flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-900/60 text-slate-400 hover:text-blue-500 cursor-pointer transition-all duration-200"
          >
            <MdCloudUpload className="text-2xl" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Add Sticker</span>
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
