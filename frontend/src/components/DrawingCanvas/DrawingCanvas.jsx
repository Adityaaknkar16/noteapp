import React, {
  useRef,
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef
} from "react";
import {
  LuPencil,
  LuEraser,
  LuUndo2,
  LuRedo2,
  LuTrash2,
  LuUndo,
  LuRedo
} from "react-icons/lu";

// Hex to RGBA helper for highlighters
const hexToRGBA = (hex, alpha) => {
  // If hex is css variable, return it directly or fallback
  if (hex.startsWith("var(")) {
    if (hex.includes("rust")) return `rgba(194, 84, 44, ${alpha})`;
    if (hex.includes("sage")) return `rgba(111, 143, 107, ${alpha})`;
    if (hex.includes("ochre")) return `rgba(214, 162, 60, ${alpha})`;
    if (hex.includes("blue")) return `rgba(92, 122, 153, ${alpha})`;
    return `rgba(43, 37, 32, ${alpha})`; // default ink
  }

  let r = 0, g = 0, b = 0;
  hex = hex.replace("#", "");
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Helper to resolve CSS variables into actual color hex/rgb strings for HTML5 Canvas
const resolveCSSColor = (colorStr) => {
  if (colorStr.startsWith("var(")) {
    const varName = colorStr.slice(4, -1).trim();
    if (typeof window !== "undefined" && window.getComputedStyle) {
      const computed = window.getComputedStyle(document.body).getPropertyValue(varName).trim();
      if (computed) return computed;
    }
    // Fallbacks
    if (varName.includes("rust")) return "#c2542c";
    if (varName.includes("sage")) return "#6f8f6b";
    if (varName.includes("ochre")) return "#d6a23c";
    if (varName.includes("blue")) return "#5c7a99";
    if (varName.includes("ink")) return "#2b2520";
    return "#2b2520";
  }
  return colorStr;
};

const DrawingCanvas = forwardRef(({ initialImage }, ref) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Tools & Styling state
  const [tool, setTool] = useState("pen"); // pen, highlighter, eraser
  const [color, setColor] = useState("var(--ink)");
  const [customColor, setCustomColor] = useState("#2b2520");
  const [brushSize, setBrushSize] = useState("medium"); // small, medium, large
  const [backgroundStyle, setBackgroundStyle] = useState("plain"); // plain, ruled, grid, dotted

  // History states
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Active drawing refs
  const activePointerIdRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });

  const colors = [
    { value: "var(--ink)", name: "Ink" },
    { value: "var(--accent-rust)", name: "Rust" },
    { value: "var(--accent-sage)", name: "Sage" },
    { value: "var(--accent-ochre)", name: "Ochre" },
    { value: "var(--accent-blue)", name: "Blue" },
  ];

  // Load and apply DPI scaling
  const resizeCanvas = (preserveContent = true) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Store current content
    let tempImage = null;
    if (preserveContent && canvas.width > 0 && canvas.height > 0) {
      tempImage = canvas.toDataURL();
    }

    // Adjust width & height
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    // Restore content
    if (tempImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = tempImage;
    }
  };

  // Setup canvas resizing
  useEffect(() => {
    resizeCanvas(false);

    // If initialImage provided, load it
    if (initialImage) {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const rect = canvas.getBoundingClientRect();
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        // Push initial state to history
        saveHistory();
      };
      img.src = initialImage;
    } else {
      // Push blank state
      setTimeout(() => {
        saveHistory();
      }, 100);
    }

    const handleResize = () => {
      resizeCanvas(true);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [initialImage]);

  // Expose exportImage method
  useImperativeHandle(ref, () => ({
    exportImage: () => {
      const canvas = canvasRef.current;
      if (!canvas) return "";

      // Create a temporary canvas to bake background pattern + user drawing
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext("2d");

      // Set scale
      tempCtx.scale(dpr, dpr);

      // 1. Draw solid surface background color
      const computedStyle = getComputedStyle(document.body);
      const surfaceColor = computedStyle.getPropertyValue("--surface").trim() || "#FCF9F2";
      const borderColor = computedStyle.getPropertyValue("--border").trim() || "#E6DCC8";
      tempCtx.fillStyle = surfaceColor;
      tempCtx.fillRect(0, 0, rect.width, rect.height);

      // 2. Draw pattern
      tempCtx.strokeStyle = borderColor;
      tempCtx.fillStyle = borderColor;
      tempCtx.lineWidth = 1;

      if (backgroundStyle === "ruled") {
        const spacing = 28;
        for (let y = spacing; y < rect.height; y += spacing) {
          tempCtx.beginPath();
          tempCtx.moveTo(0, y);
          tempCtx.lineTo(rect.width, y);
          tempCtx.stroke();
        }
      } else if (backgroundStyle === "grid") {
        const spacing = 28;
        for (let x = spacing; x < rect.width; x += spacing) {
          tempCtx.beginPath();
          tempCtx.moveTo(x, 0);
          tempCtx.lineTo(x, rect.height);
          tempCtx.stroke();
        }
        for (let y = spacing; y < rect.height; y += spacing) {
          tempCtx.beginPath();
          tempCtx.moveTo(0, y);
          tempCtx.lineTo(rect.width, y);
          tempCtx.stroke();
        }
      } else if (backgroundStyle === "dotted") {
        const spacing = 24;
        for (let x = spacing; x < rect.width; x += spacing) {
          for (let y = spacing; y < rect.height; y += spacing) {
            tempCtx.beginPath();
            tempCtx.arc(x, y, 1.5, 0, Math.PI * 2);
            tempCtx.fill();
          }
        }
      }

      // 3. Draw drawing layer
      tempCtx.drawImage(canvas, 0, 0, rect.width, rect.height);

      return tempCanvas.toDataURL("image/png");
    }
  }));

  // Undo / Redo helpers
  const saveHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    try {
      const snapshot = ctx.getImageData(0, 0, rect.width * dpr, rect.height * dpr);
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(snapshot);
      
      // Limit history to 30 steps
      if (newHistory.length > 30) {
        newHistory.shift();
      }

      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    } catch (err) {
      console.error("Failed to save drawing history:", err);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(history[nextIndex], 0, 0);
      setHistoryIndex(nextIndex);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(history[nextIndex], 0, 0);
      setHistoryIndex(nextIndex);
    }
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear this sketch?")) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      saveHistory();
    }
  };

  // Pointer Handlers
  const handlePointerDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Palm Rejection: Prioritize stylus. If drawing with stylus, ignore touch
    if (activePointerIdRef.current !== null && e.pointerId !== activePointerIdRef.current) {
      if (e.pointerType === "touch") {
        return; // Ignore palm/finger touch
      }
    }

    if (e.pointerType === "pen") {
      activePointerIdRef.current = e.pointerId;
    } else if (activePointerIdRef.current === null) {
      activePointerIdRef.current = e.pointerId;
    } else {
      return;
    }

    isDrawingRef.current = true;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch (err) {
      // Fail-safe if element does not support pointer capture
    }

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    lastPointRef.current = { x, y };

    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);

    setupStrokeStyle(ctx, e);
  };

  const handlePointerMove = (e) => {
    if (!isDrawingRef.current || e.pointerId !== activePointerIdRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");

    setupStrokeStyle(ctx, e);

    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    lastPointRef.current = { x, y };
  };

  const handlePointerUp = (e) => {
    if (e.pointerId === activePointerIdRef.current) {
      isDrawingRef.current = false;
      activePointerIdRef.current = null;
      const canvas = canvasRef.current;
      if (canvas) {
        try {
          canvas.releasePointerCapture(e.pointerId);
        } catch (err) {}
      }
      saveHistory();
    }
  };

  const handlePointerCancel = (e) => {
    handlePointerUp(e);
  };

  const setupStrokeStyle = (ctx, e) => {
    let baseWidth = 4;
    if (brushSize === "small") baseWidth = 2;
    else if (brushSize === "medium") baseWidth = 5;
    else if (brushSize === "large") baseWidth = 10;

    let width = baseWidth;
    if (e.pointerType === "pen") {
      const pressure = e.pressure !== undefined && e.pressure > 0 ? e.pressure : 0.5;
      width = baseWidth * (0.5 + pressure);
    }

    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const activeColor = color === "custom" ? customColor : color;

    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = baseWidth * 3.5;
    } else if (tool === "highlighter") {
      ctx.globalCompositeOperation = "multiply";
      ctx.strokeStyle = hexToRGBA(activeColor, 0.4);
      ctx.lineWidth = baseWidth * 3.5;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = resolveCSSColor(activeColor);
    }
  };

  // Background CSS mapping
  const getBackgroundStyle = () => {
    switch (backgroundStyle) {
      case "ruled":
        return {
          backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px)",
          backgroundSize: "100% 28px",
          backgroundColor: "var(--surface)"
        };
      case "grid":
        return {
          backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          backgroundColor: "var(--surface)"
        };
      case "dotted":
        return {
          backgroundImage: "radial-gradient(var(--border) 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
          backgroundColor: "var(--surface)"
        };
      case "plain":
      default:
        return {
          backgroundColor: "var(--surface)"
        };
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-4 w-full h-full select-none">
      {/* ── Toolbar Area ── */}
      <div className="paper-card border border-border p-3 flex flex-wrap items-center justify-between gap-4 bg-surface text-ink transition-colors">
        {/* Tool selectors */}
        <div className="flex items-center gap-1.5 bg-bg/50 p-1 rounded-md border border-border">
          <button
            onClick={() => setTool("pen")}
            className={`p-2 rounded cursor-pointer transition-colors flex items-center gap-1 ${
              tool === "pen"
                ? "bg-accent-rust text-white font-bold"
                : "hover:bg-bg text-ink-muted hover:text-ink"
            }`}
            title="Pen"
          >
            <LuPencil className="text-lg" />
            <span className="text-xs font-semibold max-sm:hidden">Pen</span>
          </button>
          <button
            onClick={() => setTool("highlighter")}
            className={`p-2 rounded cursor-pointer transition-colors flex items-center gap-1 ${
              tool === "highlighter"
                ? "bg-accent-rust text-white font-bold"
                : "hover:bg-bg text-ink-muted hover:text-ink"
            }`}
            title="Highlighter"
          >
            <span className="w-4 h-4 border border-dashed border-current rounded-full inline-block bg-accent-ochre/40"></span>
            <span className="text-xs font-semibold max-sm:hidden">Highlight</span>
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`p-2 rounded cursor-pointer transition-colors flex items-center gap-1 ${
              tool === "eraser"
                ? "bg-accent-rust text-white font-bold"
                : "hover:bg-bg text-ink-muted hover:text-ink"
            }`}
            title="Eraser"
          >
            <LuEraser className="text-lg" />
            <span className="text-xs font-semibold max-sm:hidden">Eraser</span>
          </button>
        </div>

        {/* Swatches */}
        {tool !== "eraser" && (
          <div className="flex items-center gap-1.5">
            {colors.map((c) => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                style={{ backgroundColor: c.value.startsWith("var") ? `var(${c.value.slice(4,-1)})` : c.value }}
                className={`w-6 h-6 rounded-full border cursor-pointer transition-transform ${
                  color === c.value
                    ? "border-accent-rust scale-110 ring-2 ring-accent-rust/20"
                    : "border-border hover:scale-105"
                }`}
                title={c.name}
              />
            ))}
            
            {/* Custom Color Picker */}
            <div className="relative flex items-center">
              <input
                type="color"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  setColor("custom");
                }}
                className="w-6 h-6 rounded-full cursor-pointer border border-border opacity-0 absolute z-10"
              />
              <div
                style={{ backgroundColor: customColor }}
                className={`w-6 h-6 rounded-full border transition-transform ${
                  color === "custom"
                    ? "border-accent-rust scale-110 ring-2 ring-accent-rust/20"
                    : "border-border"
                }`}
              />
            </div>
          </div>
        )}

        {/* Brush Size */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-ink-muted max-sm:hidden">Size:</span>
          <select
            value={brushSize}
            onChange={(e) => setBrushSize(e.target.value)}
            className="input-box py-1 px-2 text-xs font-semibold cursor-pointer"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        {/* Background Select */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-ink-muted max-sm:hidden">Style:</span>
          <select
            value={backgroundStyle}
            onChange={(e) => setBackgroundStyle(e.target.value)}
            className="input-box py-1 px-2 text-xs font-semibold cursor-pointer"
          >
            <option value="plain">Plain</option>
            <option value="ruled">Ruled</option>
            <option value="grid">Grid</option>
            <option value="dotted">Dotted</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 border-l border-border pl-3">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-1.5 rounded hover:bg-bg text-ink disabled:opacity-30 cursor-pointer"
            title="Undo"
          >
            <LuUndo className="text-base" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 rounded hover:bg-bg text-ink disabled:opacity-30 cursor-pointer"
            title="Redo"
          >
            <LuRedo className="text-base" />
          </button>
          <button
            onClick={handleClear}
            className="p-1.5 rounded hover:bg-bg hover:text-accent-red text-ink cursor-pointer"
            title="Clear"
          >
            <LuTrash2 className="text-base" />
          </button>
        </div>
      </div>

      {/* ── Drawing Canvas Surface ── */}
      <div className="relative flex-1 min-h-[300px] border border-border rounded-lg overflow-hidden shadow-inner">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          style={{
            ...getBackgroundStyle(),
            touchAction: "none",
            userSelect: "none",
            width: "100%",
            height: "100%"
          }}
          className="absolute inset-0 cursor-crosshair transition-colors"
        />
      </div>
    </div>
  );
});

DrawingCanvas.displayName = "DrawingCanvas";

export default DrawingCanvas;
