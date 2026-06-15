import React, { useRef, useEffect, useState } from "react";
import { 
  MdFormatBold, 
  MdFormatItalic, 
  MdFormatUnderlined, 
  MdFormatClear,
  MdFormatColorText,
  MdBorderColor,
  MdCheck,
  MdSearch,
  MdCode,
  MdOutlineRestorePage
} from "react-icons/md";

// Available highlighter colors (vibrant, semi-transparent pastel colors)
const HIGHLIGHT_COLORS = [
  { name: "Yellow", value: "rgba(254, 240, 138, 0.8)" },
  { name: "Green", value: "rgba(187, 247, 208, 0.8)" },
  { name: "Blue", value: "rgba(191, 219, 254, 0.8)" },
  { name: "Pink", value: "rgba(251, 207, 232, 0.8)" },
  { name: "Orange", value: "rgba(254, 215, 170, 0.8)" },
  { name: "Clear", value: "transparent" }
];

// Available ink text colors
const INK_COLORS = [
  { name: "Navy/Slate", value: "#1e293b" },
  { name: "Royal Blue", value: "#1d4ed8" },
  { name: "Ruby Red", value: "#dc2626" },
  { name: "Forest Green", value: "#15803d" },
  { name: "Violet", value: "#7c3aed" },
  { name: "Hot Pink", value: "#db2777" },
  { name: "Charcoal Black", value: "#090d16" }
];

export default function NotebookEditor({ 
  value = "", 
  onChange, 
  placeholder = "Write your thoughts...",
  fontFamily = "Outfit",
  penColor = "#1e293b",
  setPenColor,
  noteId = "new",
  onAutoSave,
  isFullscreen = false,
  className = "" 
}) {
  const editorRef = useRef(null);
  const lineNumbersRef = useRef(null);

  // States
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [replaceQuery, setReplaceQuery] = useState("");
  const [matchCase, setMatchCase] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  
  // Line numbering state
  const [lineCount, setLineCount] = useState(1);

  // Draft recovery state
  const [hasDraft, setHasDraft] = useState(false);
  const [draftContent, setDraftContent] = useState("");

  // Sync initial content on mount or note change
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value;
      updateLineNumbers();
    }
  }, [noteId]);

  // Draft Recovery Check on Mount / noteId change
  useEffect(() => {
    const draftKey = `noteapp_draft_${noteId}`;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft && savedDraft !== value && savedDraft.trim() !== "" && savedDraft !== "<div><br></div>") {
      setHasDraft(true);
      setDraftContent(savedDraft);
    } else {
      setHasDraft(false);
    }
  }, [noteId]);

  const restoreDraft = () => {
    if (onChange) {
      onChange(draftContent);
    }
    if (editorRef.current) {
      editorRef.current.innerHTML = draftContent;
    }
    setHasDraft(false);
    updateLineNumbers();
  };

  const discardDraft = () => {
    localStorage.removeItem(`noteapp_draft_${noteId}`);
    setHasDraft(false);
  };

  // Auto-save timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (editorRef.current) {
        const currentHTML = editorRef.current.innerHTML;
        if (currentHTML && currentHTML !== value) {
          localStorage.setItem(`noteapp_draft_${noteId}`, currentHTML);
          if (onAutoSave) {
            onAutoSave(currentHTML);
          }
        }
      }
    }, 4000); // every 4 seconds

    return () => clearInterval(interval);
  }, [value, noteId]);

  // Update line counts
  const updateLineNumbers = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || "";
      // Count lines by splits, ensuring at least 1 line
      const lines = text.split("\n");
      setLineCount(Math.max(1, lines.length));
    }
  };

  const handleInput = () => {
    if (editorRef.current && onChange) {
      const html = editorRef.current.innerHTML;
      onChange(html);
      updateLineNumbers();
    }
  };

  // Run formatting command
  const executeCommand = (command, val = null) => {
    document.execCommand(command, false, val);
    handleInput();
  };

  // Insert Code Block
  const insertCodeBlock = () => {
    const codeTemplate = `<pre class="language-javascript" style="background: #1e1e2e; color: #cdd6f4; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 13px; line-height: 1.5; margin: 10px 0; overflow-x: auto; border: 1px solid #313244; display: block;"><code style="font-family: monospace;">// Write your code here\\nconsole.log("Hello World");</code></pre><div><br></div>`;
    executeCommand("insertHTML", codeTemplate);
  };

  // Apply highlight
  const applyHighlight = (color) => {
    executeCommand("backColor", color);
    setShowHighlightMenu(false);
  };

  // Apply custom ink color
  const applyInkColor = (color) => {
    executeCommand("foreColor", color);
    if (setPenColor) setPenColor(color);
    setShowColorMenu(false);
  };

  // Search & Replace logic
  const handleSearch = (next = true) => {
    if (!searchQuery) return;

    if (!useRegex) {
      // Standard search using window.find
      // window.find(aString, aCaseSensitive, aBackwards, aWrapAround, aWholeWord, aSearchInFrames, aShowDialog)
      window.find(searchQuery, matchCase, !next, true, false, false, false);
    } else {
      // Regex Search logic using DOM ranges
      try {
        const selection = window.getSelection();
        const range = document.createRange();
        const text = editorRef.current.innerText;
        const flags = "g" + (matchCase ? "" : "i");
        const regex = new RegExp(searchQuery, flags);
        
        let match;
        const currentIndex = selection.anchorOffset;
        let foundMatch = null;

        // Search text
        while ((match = regex.exec(text)) !== null) {
          if (match.index >= currentIndex) {
            foundMatch = match;
            break;
          }
        }
        
        // Wrap around if no match found ahead of cursor
        if (!foundMatch) {
          regex.lastIndex = 0;
          foundMatch = regex.exec(text);
        }

        if (foundMatch) {
          // Find text node containing match
          const textNodes = [];
          const findTextNodes = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
              textNodes.push(node);
            } else {
              for (let child of node.childNodes) {
                findTextNodes(child);
              }
            }
          };
          findTextNodes(editorRef.current);

          let charCount = 0;
          let startNode = null, startOffset = 0;
          let endNode = null, endOffset = 0;

          for (let node of textNodes) {
            const nodeLength = node.textContent.length;
            if (!startNode && charCount + nodeLength >= foundMatch.index) {
              startNode = node;
              startOffset = foundMatch.index - charCount;
            }
            if (charCount + nodeLength >= foundMatch.index + foundMatch[0].length) {
              endNode = node;
              endOffset = (foundMatch.index + foundMatch[0].length) - charCount;
              break;
            }
            charCount += nodeLength;
          }

          if (startNode && endNode) {
            range.setStart(startNode, startOffset);
            range.setEnd(endNode, endOffset);
            selection.removeAllRanges();
            selection.addRange(range);
            // Scroll to selection
            startNode.parentElement?.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        }
      } catch (e) {
        console.error("Regex Search Error", e);
      }
    }
  };

  const handleReplace = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed) {
      handleSearch(true);
      return;
    }

    // Replace selected text
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(replaceQuery));
    handleInput();
    
    // Find next match
    handleSearch(true);
  };

  const handleReplaceAll = () => {
    if (!searchQuery) return;
    if (editorRef.current) {
      const text = editorRef.current.innerHTML;
      const flags = "g" + (matchCase ? "" : "i");
      let newText;
      if (useRegex) {
        newText = text.replace(new RegExp(searchQuery, flags), replaceQuery);
      } else {
        // Escape special regex chars for literal replace all
        const escapedQuery = searchQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        newText = text.replace(new RegExp(escapedQuery, flags), replaceQuery);
      }
      editorRef.current.innerHTML = newText;
      handleInput();
    }
  };

  return (
    <div className={`flex flex-col gap-3 relative ${className}`}>
      
      {/* ── Draft Recovery Banner ── */}
      {hasDraft && (
        <div className="flex items-center justify-between gap-3 p-3 bg-amber-500/10 border border-amber-500/35 rounded-2xl animate-pulse text-xs text-amber-700 dark:text-amber-400 font-semibold mb-2">
          <span className="flex items-center gap-1.5">
            <MdOutlineRestorePage className="text-base" />
            Unsaved local draft found! Would you like to restore it?
          </span>
          <div className="flex gap-2">
            <button 
              type="button" 
              onClick={restoreDraft}
              className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded-lg font-bold transition-all cursor-pointer"
            >
              Restore
            </button>
            <button 
              type="button" 
              onClick={discardDraft}
              className="text-amber-600 dark:text-amber-400 font-bold hover:underline px-2 cursor-pointer"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-100/80 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-700/50 select-none">
        
        {/* Bold */}
        <button
          type="button"
          onClick={() => executeCommand("bold")}
          className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          title="Bold"
        >
          <MdFormatBold className="text-lg" />
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => executeCommand("italic")}
          className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          title="Italic"
        >
          <MdFormatItalic className="text-lg" />
        </button>

        {/* Underline */}
        <button
          type="button"
          onClick={() => executeCommand("underline")}
          className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          title="Underline"
        >
          <MdFormatUnderlined className="text-lg" />
        </button>

        <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* Highlighter Tool */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowHighlightMenu(!showHighlightMenu);
              setShowColorMenu(false);
            }}
            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-300 transition-colors flex items-center gap-1"
            title="Text Highlighter Pen"
          >
            <MdBorderColor className="text-lg text-yellow-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Highlight</span>
          </button>

          {showHighlightMenu && (
            <div className="absolute left-0 mt-1.5 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 flex gap-1.5">
              {HIGHLIGHT_COLORS.map((hc) => (
                <button
                  key={hc.name}
                  type="button"
                  onClick={() => applyHighlight(hc.value)}
                  className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-600 transition-transform hover:scale-115 flex items-center justify-center"
                  style={{ backgroundColor: hc.value }}
                  title={hc.name}
                >
                  {hc.value === "transparent" && <span className="text-[10px] text-red-500 font-bold">X</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Custom Text/Ink Color Tool */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowColorMenu(!showColorMenu);
              setShowHighlightMenu(false);
            }}
            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-300 transition-colors flex items-center gap-1"
            title="Text Ink Color"
          >
            <MdFormatColorText className="text-lg" style={{ color: penColor }} />
            <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Ink Color</span>
          </button>

          {showColorMenu && (
            <div className="absolute left-0 mt-1.5 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 flex gap-1.5">
              {INK_COLORS.map((ic) => (
                <button
                  key={ic.name}
                  type="button"
                  onClick={() => applyInkColor(ic.value)}
                  className="w-6 h-6 rounded-full border border-slate-350 dark:border-slate-600 transition-transform hover:scale-115 flex items-center justify-center"
                  style={{ backgroundColor: ic.value }}
                  title={ic.name}
                >
                  {penColor === ic.value && <MdCheck className="text-xs text-white drop-shadow-md" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* Code Block Inserter */}
        <button
          type="button"
          onClick={insertCodeBlock}
          className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1"
          title="Insert Monospace Code Block"
        >
          <MdCode className="text-lg text-emerald-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Code</span>
        </button>

        {/* Search Toggle */}
        <button
          type="button"
          onClick={() => setShowSearchBar(!showSearchBar)}
          className={`p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 ${showSearchBar ? 'bg-blue-500/10 text-blue-500' : 'text-slate-600 dark:text-slate-300'}`}
          title="Search & Replace"
        >
          <MdSearch className="text-lg" />
          <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Find & Replace</span>
        </button>

        {/* Clear formatting */}
        <button
          type="button"
          onClick={() => executeCommand("removeFormat")}
          className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-605 dark:text-slate-300 transition-colors ml-auto"
          title="Clear Format"
        >
          <MdFormatClear className="text-lg" />
        </button>

      </div>

      {/* ── Collapsible Search & Replace Bar ── */}
      {showSearchBar && (
        <div className="flex flex-col gap-2 p-3 bg-slate-100/50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Search query..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-[150px] text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none text-slate-800 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={() => handleSearch(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer"
            >
              Find Next
            </button>
            <button
              type="button"
              onClick={() => handleSearch(false)}
              className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-250 font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer"
            >
              Find Prev
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Replace with..."
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              className="flex-1 min-w-[150px] text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none text-slate-805 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={handleReplace}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleReplaceAll}
              className="bg-indigo-700 hover:bg-indigo-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer"
            >
              Replace All
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 pl-1 mt-1 select-none">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={matchCase}
                onChange={(e) => setMatchCase(e.target.checked)}
                className="accent-blue-600"
              />
              Match Case
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={useRegex}
                onChange={(e) => setUseRegex(e.target.checked)}
                className="accent-blue-600"
              />
              Use Regex
            </label>
          </div>
        </div>
      )}

      {/* ── Editor Container with Line Numbers ── */}
      <div className="flex relative w-full border border-slate-200/40 dark:border-slate-800/40 rounded-2xl overflow-hidden bg-white/10 dark:bg-slate-900/10">
        
        {/* Left Line Number Sheet column */}
        <div 
          ref={lineNumbersRef}
          className="w-9 bg-slate-100/30 dark:bg-slate-900/30 border-r border-slate-250/20 py-4 flex flex-col items-end pr-2 text-[10px] font-bold text-slate-400 select-none leading-[2.2rem]"
          style={{ fontFamily: fontFamily }}
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="h-[2.2rem] flex items-center justify-end">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Right ContentEditable Editor */}
        <div className="flex-1 relative min-h-[300px]">
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className={`w-full outline-none bg-transparent py-4 px-4 leading-[2.2rem] text-sm overflow-y-auto whitespace-pre-line select-text ${isFullscreen ? 'min-h-[50vh]' : 'min-h-[300px]'}`}
            style={{ 
              color: penColor,
              fontFamily: fontFamily 
            }}
            data-placeholder={placeholder}
          />
          
          {/* Placeholder styling helper */}
          {!value && (
            <span className="absolute top-4 left-4 pointer-events-none text-slate-405/50 dark:text-slate-500/50 text-sm select-none leading-[2.2rem]">
              {placeholder}
            </span>
          )}
        </div>
      </div>

    </div>
  );
}
