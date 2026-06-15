import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import NotebookPaper from "../../components/NotebookPaper/NotebookPaper";
import PageDecor from "../../components/Doodles/PageDecor";
import axios from "axios";

export default function SharedNoteView() {
  const { token } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSharedNote = async () => {
      try {
        const res = await axios.get(`/api/note/shared/${token}`);
        if (res.data.success) {
          setNote(res.data.note);
        }
      } catch (err) {
        setError(err.response?.data?.message || "This shareable note does not exist, or has been revoked by the owner.");
      } finally {
        setLoading(false);
      }
    };
    fetchSharedNote();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center text-ink font-mono text-xs">
        Loading shared note...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center text-ink p-6">
        <PageDecor />
        <div className="paper-card p-8 text-center max-w-md shadow-md border border-border">
          <span className="text-3xl block mb-3">📡</span>
          <h2 className="text-sm font-bold text-ink mb-2">Access Revoked or Expired</h2>
          <p className="text-xs text-ink-muted leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  if (!note) return null;

  const fontStyleMap = {
    Outfit: "font-['Outfit']",
    Kalam: "font-['Kalam']",
    "Patrick Hand": "font-['Patrick_Hand']",
    "Playpen Sans": "font-['Playpen_Sans']",
    "Special Elite": "font-['Special_Elite']",
    "Architects Daughter": "font-['Architects_Daughter']",
    "Great Vibes": "font-['Great_Vibes'] text-base",
    "Sacramento": "font-['Sacramento'] text-lg",
    "Rochester": "font-['Rochester'] text-sm",
    "Reenie Beanie": "font-['Reenie_Beanie'] text-lg font-medium"
  };
  const selectedFontClass = fontStyleMap[note.fontFamily] || "font-['Outfit']";

  return (
    <div className="min-h-screen bg-bg p-4 sm:p-8 flex items-center justify-center text-ink relative transition-colors duration-300">
      <PageDecor />
      
      <div className="w-full max-w-3xl shadow-xl rounded-lg overflow-hidden my-8">
        <NotebookPaper
          paperType={note.paperType || "plain"}
          fontFamily={note.fontFamily || "Outfit"}
          penColor={note.penColor || "#1e293b"}
          bgColor={note.color || "#ffffff"}
          className="w-full"
        >
          <div className={`flex flex-col gap-4 ${selectedFontClass}`}>
            <h1 className="text-2xl font-bold border-b border-border pb-3" style={{ color: note.penColor }}>
              {note.title}
            </h1>
            
            <div 
              className="text-sm leading-[2.2rem] whitespace-pre-line min-h-[300px]"
              style={{ color: note.penColor }}
              dangerouslySetInnerHTML={{ __html: note.content }}
            />

            {/* Voice Notes list if exists */}
            {note.voiceNotes && note.voiceNotes.length > 0 && (
              <div className="mt-8 pt-4 border-t border-border/40">
                <span className="text-[9px] font-mono font-bold text-accent-rust uppercase tracking-widest block mb-2.5">
                  Voice Memo Attachments
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {note.voiceNotes.map((src, idx) => (
                    <div key={idx} className="p-2 bg-bg/40 border border-border rounded-lg flex items-center justify-center">
                      <audio src={src} controls className="max-w-xs h-8" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* stickers showcase inside shared view */}
            {note.stickers && note.stickers.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-8 pt-4 border-t border-border/40">
                {note.stickers.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt=""
                    className="max-w-[70px] max-h-[70px] object-contain rotate-[-3deg]"
                    style={{
                      filter: "drop-shadow(2px 0 0 white) drop-shadow(-2px 0 0 white) drop-shadow(0 2px 0 white) drop-shadow(0 -2px 0 white) drop-shadow(0 3px 6px rgba(0,0,0,0.12))"
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </NotebookPaper>
        
        {/* Footnote */}
        <div className="bg-surface/90 border-t border-border p-3 text-center text-[10px] font-mono text-ink-muted">
          Published via Inkwell Notes Planner • Read-only view
        </div>
      </div>
    </div>
  );
}
