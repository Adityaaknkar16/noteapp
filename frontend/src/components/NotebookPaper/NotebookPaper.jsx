import { DetailedLeaf } from "../Doodles/Leaves";

/**
 * NotebookPaper - A component that wraps an editor or notepad content with a
 * spiral binder, lined pages, margins, custom fonts, and pen ink styling.
 */
export default function NotebookPaper({
  paperType = "lined", // "lined" | "grid" | "plain" | "pink-gingham"
  fontFamily = "Outfit",
  penColor = "#1e293b",
  bgColor = "#ffffff",
  children,
  className = "",
}) {
  // Map font class name
  const fontStyleMap = {
    Outfit: "font-['Outfit']",
    Kalam: "font-['Kalam']",
    "Patrick Hand": "font-['Patrick_Hand']",
    "Playpen Sans": "font-['Playpen_Sans']",
    "Special Elite": "font-['Special_Elite']",
    "Architects Daughter": "font-['Architects_Daughter']",
    "Great Vibes": "font-[ 'Great_Vibes'] text-[1.5rem]",
    "Sacramento": "font-['Sacramento'] text-[1.65rem]",
    "Rochester": "font-['Rochester'] text-[1.4rem]",
    "Reenie Beanie": "font-['Reenie_Beanie'] text-[1.65rem] font-medium",
  };

  const selectedFontClass = fontStyleMap[fontFamily] || "font-['Outfit']";

  // Paper styling class
  const getPaperStyles = () => {
    switch (paperType) {
      case "lined":
        return {
          backgroundImage: "linear-gradient(rgba(59, 130, 246, 0.12) 1px, transparent 1px)",
          backgroundSize: "100% 2.2rem",
          lineHeight: "2.2rem",
        };
      case "grid":
        return {
          backgroundImage:
            "linear-gradient(rgba(16, 185, 129, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.08) 1px, transparent 1px)",
          backgroundSize: "1.8rem 1.8rem",
          lineHeight: "1.8rem",
        };
      case "dotted":
        return {
          backgroundImage: "radial-gradient(rgba(99, 102, 241, 0.15) 1.5px, transparent 1.5px)",
          backgroundSize: "1.8rem 1.8rem",
          lineHeight: "1.8rem",
        };
      case "pink-gingham":
        return {
          backgroundColor: "#fff0f6",
          backgroundImage:
            "linear-gradient(90deg, rgba(219, 39, 119, 0.04) 50%, transparent 50%), linear-gradient(rgba(219, 39, 119, 0.04) 50%, transparent 50%)",
          backgroundSize: "2rem 2rem",
        };
      case "plain":
      default:
        return {
          backgroundColor: bgColor,
        };
    }
  };

  const paperStyle = {
    backgroundColor: paperType !== "pink-gingham" ? bgColor : undefined,
    color: penColor,
    ...getPaperStyles(),
  };

  // Generate spiral binder rings (usually 10 rings spaced down the left edge)
  const rings = Array.from({ length: 12 });

  return (
    <div className={`relative rounded-3xl overflow-hidden shadow-2xl border border-slate-250/50 dark:border-slate-800 flex ${className}`}>
      {/* ── Left Side Spiral Binder ── */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-slate-100/80 dark:bg-slate-900/80 border-r border-slate-200/50 dark:border-slate-800 flex flex-col justify-around items-center py-4 z-20 pointer-events-none select-none">
        {rings.map((_, idx) => (
          <div key={idx} className="relative w-8 h-4 flex items-center justify-center">
            {/* The metal ring coil */}
            <div className="w-10 h-3.5 rounded-full bg-gradient-to-r from-slate-300 via-slate-100 to-slate-400 dark:from-slate-700 dark:via-slate-800 dark:to-slate-600 border border-slate-400/30 dark:border-slate-500/25 shadow-md transform -rotate-12 absolute left-1" />
            {/* The punching holes */}
            <div className="w-2.5 h-2.5 rounded-full bg-slate-400/40 dark:bg-slate-950 absolute left-0 shadow-inner" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-400/40 dark:bg-slate-950 absolute -right-2.5 shadow-inner" />
          </div>
        ))}
      </div>

      {/* ── Left Red Margin Line (like real ruled notebook) ── */}
      {(paperType === "lined" || paperType === "grid") && (
        <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-red-400/40 dark:bg-red-500/35 pointer-events-none z-10" />
      )}

      {/* ── Ruled Note Paper Surface ── */}
      <div
        className={`w-full h-full min-h-[450px] pl-20 pr-8 pt-8 pb-8 transition-all duration-300 relative ${selectedFontClass}`}
        style={paperStyle}
      >
        <div className="absolute bottom-4 right-4 pointer-events-none select-none opacity-10">
          <DetailedLeaf size="80px" color="var(--accent-sage)" />
        </div>
        {children}
      </div>
    </div>
  );
}
