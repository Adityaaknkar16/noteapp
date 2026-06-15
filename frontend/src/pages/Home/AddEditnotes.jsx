import React, { useState, useEffect, useRef } from 'react';
import { MdClose, MdFullscreen, MdFullscreenExit } from 'react-icons/md';
import Taginput from '../../components/input/Taginput';
import axios from 'axios';
import { useAlert } from '../../components/Alert/AlertProvider';
import NotebookPaper from '../../components/NotebookPaper/NotebookPaper';
import StickerManager from '../../components/StickerManager/StickerManager';
import NotebookEditor from '../../components/NotebookEditor/NotebookEditor';
import { useSettings } from '../../components/Settings/SettingsProvider';
import VoiceInput from '../../components/VoiceInput/VoiceInput';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { LuTrash2, LuPencil, LuPlus, LuX } from 'react-icons/lu';
import DrawingCanvas from '../../components/DrawingCanvas/DrawingCanvas';

const TEMPLATES = {
  lecture: {
    title: "Lecture Notes: [Topic Name]",
    content: `<h2>Lecture Notes</h2>
<p><strong>Course/Subject:</strong> [Course Name]</p>
<p><strong>Date:</strong> [Date]</p>
<hr />
<h3>Key Concepts Discussed</h3>
<ul>
  <li><strong>Concept 1:</strong> Detail here...</li>
  <li><strong>Concept 2:</strong> Detail here...</li>
</ul>
<h3>Summary / Key Takeaways</h3>
<p>Write your summary here...</p>`
  },
  meeting: {
    title: "Meeting Notes: [Project/Team]",
    content: `<h2>Meeting Agenda & Action Items</h2>
<p><strong>Date:</strong> [Date] | <strong>Attendees:</strong> [Names]</p>
<hr />
<h3>Key Discussion Points</h3>
<ol>
  <li>Point 1...</li>
  <li>Point 2...</li>
</ol>
<h3>Action Items</h3>
<ul>
  <li>[ ] <strong>Owner:</strong> Task description...</li>
  <li>[ ] <strong>Owner:</strong> Task description...</li>
</ul>`
  },
  cornell: {
    title: "Cornell Notes: [Topic]",
    content: `<h2>Cornell Study System</h2>
<table style="width: 100%; border-collapse: collapse; border: 1px solid var(--border); margin-top: 10px;">
  <tr>
    <td style="width: 30%; border: 1px solid var(--border); padding: 8px; vertical-align: top;">
      <h4>Cues & Questions</h4>
      <p>Key terms, study questions, hints...</p>
    </td>
    <td style="width: 70%; border: 1px solid var(--border); padding: 8px; vertical-align: top;">
      <h4>Notes Section</h4>
      <p>Main lecture notes, diagrams, details...</p>
    </td>
  </tr>
</table>
<div style="margin-top: 15px; padding: 8px; border: 1px solid var(--border);">
  <h4>Summary</h4>
  <p>Summarize the entire topic in 3-4 sentences...</p>
</div>`
  }
};

function AddEditnotes({ type, noteData, onClose, getAllNotes, onUpdateTab }) {
    const alert = useAlert();
    const { defaultPaper, defaultFont, defaultPenColor } = useSettings();
    const [title, setTitle] = useState(noteData?.title || "");
    const [content, setContent] = useState(noteData?.content || "");
    const [tags, setTags] = useState(noteData?.tags || []);
    const [color, setColor] = useState(noteData?.color || "#ffffff");
    const [paperType, setPaperType] = useState(noteData?.paperType || defaultPaper);
    const [fontFamily, setFontFamily] = useState(noteData?.fontFamily || defaultFont);
    const [penColor, setPenColor] = useState(noteData?.penColor || defaultPenColor);
    const [stickers, setStickers] = useState(noteData?.stickers || []);
    const [collaborators, setCollaborators] = useState(noteData?.collaborators || []);
    const [collabEmail, setCollabEmail] = useState("");
    const [showCollab, setShowCollab] = useState(false);
    const [isEditorFullscreen, setIsEditorFullscreen] = useState(false);
    const [error, setError] = useState(null);

    // Voice Notes state & Recording UI
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [voiceNotes, setVoiceNotes] = useState(noteData?.voiceNotes || []);
    const recordingIntervalRef = useRef(null);

    // Sketches state & modal
    const [sketches, setSketches] = useState(noteData?.sketches || []);
    const [isSketchModalOpen, setIsSketchModalOpen] = useState(false);
    const sketchCanvasRef = useRef(null);

    // PIN lock & Public Shareable URL states
    const [isLocked, setIsLocked] = useState(noteData?.isLocked || false);
    const [shareToken, setShareToken] = useState(noteData?.shareToken || null);

    const prevIdRef = useRef(noteData?._id);

    useEffect(() => {
        if (noteData && noteData._id !== prevIdRef.current) {
            prevIdRef.current = noteData._id;
            setTitle(noteData.title || "");
            setContent(noteData.content || "");
            setTags(noteData.tags || []);
            setColor(noteData.color || "#ffffff");
            setPaperType(noteData.paperType || "lined");
            setFontFamily(noteData.fontFamily || "Outfit");
            setPenColor(noteData.penColor || "#1e293b");
            setStickers(noteData.stickers || []);
            setCollaborators(noteData.collaborators || []);
            setVoiceNotes(noteData.voiceNotes || []);
            setSketches(noteData.sketches || []);
            setIsLocked(noteData.isLocked || false);
            setShareToken(noteData.shareToken || null);
        }
    }, [noteData]);

    useEffect(() => {
        if (onUpdateTab && noteData) {
            onUpdateTab({
                ...noteData,
                title,
                content,
                tags,
                color,
                paperType,
                fontFamily,
                penColor,
                stickers,
                collaborators,
                voiceNotes,
                sketches,
                isLocked,
                shareToken
            });
        }
    }, [title, content, tags, color, paperType, fontFamily, penColor, stickers, collaborators, voiceNotes, sketches, isLocked, shareToken]);

    // Timer logic for audio recording
    useEffect(() => {
        if (isRecording) {
            recordingIntervalRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(recordingIntervalRef.current);
            setRecordingDuration(0);
        }
        return () => clearInterval(recordingIntervalRef.current);
    }, [isRecording]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            recorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                    const base64data = reader.result;
                    setVoiceNotes(prev => [...prev, base64data]);
                    alert.show("Audio memo added!", "success");
                };
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (err) {
            alert.show("Microphone access denied or unavailable", "error");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    const deleteVoiceNote = (index) => {
        setVoiceNotes(prev => prev.filter((_, idx) => idx !== index));
    };

    const formatDuration = (sec) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // PIN lock Handlers
    const handleSetPinLock = async () => {
        const pin = prompt("Enter a 4-digit PIN passcode for locking:");
        if (!pin) return;
        if (pin.length !== 4 || isNaN(pin)) {
            alert.show("PIN must be exactly 4 digits", "error");
            return;
        }

        try {
            const res = await axios.post(`/api/note/lock/${noteData._id}`, { pin }, { withCredentials: true });
            if (res.data.success) {
                alert.show("Note PIN lock activated!", "success");
                setIsLocked(true);
                if (getAllNotes) getAllNotes();
            }
        } catch (err) {
            alert.show(err.response?.data?.message || "Failed to set PIN", "error");
        }
    };

    const handleRemovePinLock = async () => {
        const pin = prompt("Enter your current 4-digit PIN passcode to unlock:");
        if (!pin) return;

        try {
            const res = await axios.post(`/api/note/unlock/${noteData._id}`, { pin }, { withCredentials: true });
            if (res.data.success) {
                alert.show("PIN passcode removed successfully", "success");
                setIsLocked(false);
                if (getAllNotes) getAllNotes();
            }
        } catch (err) {
            alert.show(err.response?.data?.message || "Incorrect PIN passcode", "error");
        }
    };

    // Public sharing Handlers
    const handleGeneratePublicShare = async () => {
        try {
            const res = await axios.post(`/api/note/share/generate/${noteData._id}`, {}, { withCredentials: true });
            if (res.data.success) {
                alert.show("Public share link activated!", "success");
                setShareToken(res.data.shareToken);
                if (getAllNotes) getAllNotes();
            }
        } catch (err) {
            alert.show("Failed to generate share link", "error");
        }
    };

    const handleRevokePublicShare = async () => {
        try {
            const res = await axios.post(`/api/note/share/revoke/${noteData._id}`, {}, { withCredentials: true });
            if (res.data.success) {
                alert.show("Public share link revoked!", "success");
                setShareToken(null);
                if (getAllNotes) getAllNotes();
            }
        } catch (err) {
            alert.show("Failed to revoke share link", "error");
        }
    };

    const handleCopyShareLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/shared/${shareToken}`);
        alert.show("Public share URL copied to clipboard!", "success");
    };

    const addNewNote = async () => {
        try {
            const res = await axios.post("/api/note/add", { title, content, tags, color, paperType, fontFamily, penColor, stickers, voiceNotes, sketches }, { withCredentials: true })
            if (res.data.success == false) {
                setError(res.data.message);
                alert.error(res.data.message);
                return;
            }
            alert.success("Note added successfully!");
            getAllNotes();
            onClose();
        } catch (error) {
            setError(error.response?.data?.message || error.message);
            alert.error(error.response?.data?.message || "Failed to add note");
        }
    };

    const editNote = async () => {
        if (!noteData || !noteData._id) {
            alert.error("Note ID not found");
            return;
        }
        const noteId = noteData._id;
        try {
            const res = await axios.post(`/api/note/edit/${noteId}`, 
                { title, content, tags, color, paperType, fontFamily, penColor, stickers, voiceNotes, sketches }, 
                { withCredentials: true }
            );
            if (res.data && res.data.success === false) {
                setError(res.data.message);
                alert.error(res.data.message);
                return;
            }
            alert.success("Note updated successfully!");
            getAllNotes();
            onClose();
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to update note";
            setError(errorMessage);
            alert.error(errorMessage);
        }
    };

    const handleBackgroundAutoSave = async (updatedContent) => {
        if (type === 'edit' && noteData?._id) {
            try {
                await axios.post(`/api/note/edit/${noteData._id}`, 
                    { title, content: updatedContent, tags, color, paperType, fontFamily, penColor, stickers, voiceNotes, sketches }, 
                    { withCredentials: true }
                );
            } catch (err) {
                console.error("Auto-save background error:", err);
            }
        }
    };

    const handleInviteCollaborator = async () => {
        if (!collabEmail) {
            alert.error("Please enter email");
            return;
        }
        try {
            const res = await axios.post(`/api/note/invite/${noteData._id}`, { email: collabEmail }, { withCredentials: true });
            if (res.data.success) {
                alert.success("Collaborator invited!");
                setCollaborators(prev => [...prev, collabEmail]);
                setCollabEmail("");
                setShowCollab(false);
                if (getAllNotes) getAllNotes();
            } else {
                alert.error(res.data.message || "Failed to invite collaborator");
            }
        } catch (err) {
            alert.error(err.response?.data?.message || "Failed to invite collaborator");
        }
    };

    const handleAddNote = () => {
        if (!title) {
            setError("Please enter a title.");
            alert.error("Please enter a title.");
            return;
        }
        if (!content) {
            setError("Please enter content for the note.");
            alert.error("Please enter content for the note.");
            return;
        }
        setError(null);
        if (type === "edit") {
            editNote();
        } else {
            addNewNote();
        }
    };

    const exportPDF = async () => {
      const element = document.getElementById("notebook-paper-editor");
      if (!element) return;
      try {
        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        pdf.save(`${title || 'Note'}.pdf`);
        alert.success("PDF exported successfully!");
      } catch (err) {
        alert.error("Failed to export PDF: " + err.message);
      }
    };

    const applyTemplate = (key) => {
      const tmpl = TEMPLATES[key];
      if (tmpl) {
        setTitle(tmpl.title);
        setContent(tmpl.content);
        alert.success(`${key.toUpperCase()} template applied!`);
      }
    };

    const getWordCount = () => {
      const text = content ? content.replace(/<[^>]*>/g, ' ') : '';
      const words = text.trim().split(/\s+/).filter(w => w.length > 0);
      return words.length;
    };

    const getReadingTime = () => {
      const words = getWordCount();
      const time = Math.max(1, Math.ceil(words / 200));
      return `${time} min read`;
    };

    return (
        <div className={`relative flex flex-col ${isEditorFullscreen ? 'fixed inset-0 w-screen h-screen z-[99999] bg-bg p-8 overflow-y-auto' : ''}`}>
            {/* Header controls for Notebook Styles */}
            <div className={`flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-border ${isEditorFullscreen ? 'max-w-4xl mx-auto w-full' : ''}`}>
                <div className="flex flex-wrap items-center gap-4">
                    {/* Paper Type Selector */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">Paper Style</label>
                        <select 
                            value={paperType} 
                            onChange={(e) => setPaperType(e.target.value)}
                            className="bg-surface text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border outline-none text-ink cursor-pointer"
                        >
                            <option value="lined">Ruled Lines</option>
                            <option value="grid">Grid Math</option>
                            <option value="dotted">Dotted Grid</option>
                            <option value="pink-gingham">Pink Checked</option>
                            <option value="plain">Clean Plain</option>
                        </select>
                    </div>

                    {/* Font Selector */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">Ink Font</label>
                        <select 
                            value={fontFamily} 
                            onChange={(e) => setFontFamily(e.target.value)}
                            className="bg-surface text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border outline-none text-ink cursor-pointer"
                        >
                            <option value="Outfit">Outfit (Sans)</option>
                            <option value="Kalam">Kalam (Handwriting)</option>
                            <option value="Patrick Hand">Patrick Hand (Cute)</option>
                            <option value="Playpen Sans">Playpen (Comic)</option>
                            <option value="Special Elite">Special Elite (Typewriter)</option>
                            <option value="Architects Daughter">Architect (Draft)</option>
                            <option value="Great Vibes">Great Vibes (Cursive)</option>
                            <option value="Sacramento">Sacramento (Elegant)</option>
                            <option value="Rochester">Rochester (Script)</option>
                            <option value="Reenie Beanie">Reenie Beanie (Artist)</option>
                        </select>
                    </div>

                    {/* Pen Ink Selector */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">Pen Color</label>
                        <div className="flex gap-1.5 items-center h-8">
                            {[
                                { name: "Slate", value: "#1e293b" },
                                { name: "Royal Blue", value: "#1d4ed8" },
                                { name: "Ruby Red", value: "#dc2626" },
                                { name: "Forest Green", value: "#15803d" },
                                { name: "Violet", value: "#7c3aed" },
                                { name: "Hot Pink", value: "#db2777" }
                            ].map((p) => (
                                <button
                                    key={p.value}
                                    type="button"
                                    onClick={() => setPenColor(p.value)}
                                    className={`w-5 h-5 rounded-full border transition-all ${penColor === p.value ? 'ring-2 ring-accent-rust scale-110' : 'opacity-70 hover:opacity-100'}`}
                                    style={{ backgroundColor: p.value }}
                                    title={p.name}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Template Trigger */}
                    {(!content || content === "<p></p>") && (
                      <div className="flex gap-1">
                        <button type="button" onClick={() => applyTemplate("lecture")} className="px-2 py-1 bg-surface text-ink border border-border hover:bg-bg transition-colors rounded text-[10px] font-bold">Lecture</button>
                        <button type="button" onClick={() => applyTemplate("meeting")} className="px-2 py-1 bg-surface text-ink border border-border hover:bg-bg transition-colors rounded text-[10px] font-bold">Meeting</button>
                        <button type="button" onClick={() => applyTemplate("cornell")} className="px-2 py-1 bg-surface text-ink border border-border hover:bg-bg transition-colors rounded text-[10px] font-bold">Cornell</button>
                      </div>
                    )}

                    {/* Export PDF Button */}
                    <button
                      type="button"
                      onClick={exportPDF}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface border border-border text-ink hover:bg-bg transition-all cursor-pointer shadow-sm"
                    >
                      📄 Export PDF
                    </button>

                    {/* Share Button (only if edit mode) */}
                    {type === "edit" && noteData?._id && (
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCollab(!showCollab);
                                }}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent-rust/10 hover:bg-accent-rust/20 text-accent-rust border border-accent-rust/20 shadow-sm flex items-center gap-1 cursor-pointer transition-colors"
                            >
                                👥 Share
                            </button>
                            {showCollab && (
                                <div className="absolute top-10 right-0 p-4 bg-surface border border-border rounded-lg shadow-xl z-[999] w-72 flex flex-col gap-3">
                                    <h4 className="text-xs font-bold text-ink uppercase tracking-wide">Invite Collaborator</h4>
                                    <div className="flex gap-2">
                                        <input
                                            type="email"
                                            placeholder="Enter registered email..."
                                            value={collabEmail}
                                            onChange={(e) => setCollabEmail(e.target.value)}
                                            className="flex-1 text-xs px-3 py-2 rounded-lg border border-border bg-bg outline-none text-ink"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleInviteCollaborator}
                                            className="bg-accent-rust hover:brightness-110 text-white font-bold text-xs px-3 py-2 rounded-lg cursor-pointer transition-all"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    {collaborators && collaborators.length > 0 && (
                                        <div className="flex flex-col gap-1.5 border-t border-border pt-2.5">
                                            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-widest block">Collaborators ({collaborators.length})</span>
                                            <div className="max-h-24 overflow-y-auto flex flex-col gap-1 pr-1">
                                                {collaborators.map((email) => (
                                                    <span key={email} className="text-[11px] font-semibold text-ink bg-bg border border-border px-2 py-1 rounded-lg truncate" title={email}>
                                                        {email}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Fullscreen Focus Toggle */}
                    <button
                        type="button"
                        onClick={() => setIsEditorFullscreen(!isEditorFullscreen)}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface transition-colors"
                        title={isEditorFullscreen ? "Exit Focus" : "Fullscreen Focus"}
                    >
                        {isEditorFullscreen ? (
                            <MdFullscreenExit className="text-xl text-accent-rust" />
                        ) : (
                            <MdFullscreen className="text-xl text-ink-muted hover:text-accent-rust" />
                        )}
                    </button>

                    <button
                        className='w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface transition-colors'
                        onClick={onClose}
                    >
                        <MdClose className='text-xl text-ink-muted' />
                    </button>
                </div>
            </div>

            {/* Notebook Paper Surface */}
            <div id="notebook-paper-editor" className={`${isEditorFullscreen ? 'max-w-4xl mx-auto w-full flex-1' : ''}`}>
                <NotebookPaper
                    paperType={paperType}
                    fontFamily={fontFamily}
                    penColor={penColor}
                    bgColor={color}
                    className="w-full"
                >
                    <div className='flex items-center gap-3 w-full'>
                        <input
                            type="text"
                            className='text-2xl font-bold outline-none bg-transparent flex-1 border-none'
                            placeholder='Title your thoughts...'
                            value={title}
                            onChange={({ target }) => setTitle(target.value)}
                            style={{ color: penColor }}
                        />
                        <VoiceInput onTranscript={(text) => setTitle(prev => prev + " " + text)} />
                    </div>

                    <div className='flex flex-col gap-2 mt-4 relative'>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">Notebook Content</label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setIsSketchModalOpen(true)}
                              className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-accent-rust/10 hover:bg-accent-rust/20 text-accent-rust border border-accent-rust/25 flex items-center gap-1 cursor-pointer transition-all"
                            >
                              <LuPencil className="text-[11px]" />
                              <span>Insert Sketch</span>
                            </button>
                            <VoiceInput onTranscript={(text) => setContent(prev => prev + " " + text)} />
                          </div>
                        </div>
                        <NotebookEditor
                            value={content}
                            onChange={setContent}
                            placeholder='Write down your notes...'
                            fontFamily={fontFamily}
                            penColor={penColor}
                            setPenColor={setPenColor}
                            noteId={noteData?._id || "new"}
                            onAutoSave={handleBackgroundAutoSave}
                            isFullscreen={isEditorFullscreen}
                        />
                    </div>

                    {/* Notebook Stickers Showcase */}
                    {stickers && stickers.length > 0 && (
                        <div className="flex flex-wrap gap-4 mt-8 pt-4 border-t border-slate-200/25">
                            {stickers.map((src, idx) => (
                                <img
                                    key={idx}
                                    src={src}
                                    alt="sticker"
                                    className="max-w-[80px] max-h-[80px] object-contain rotate-[-3deg] hover:rotate-[3deg] transition-all cursor-default"
                                    style={{
                                        filter: "drop-shadow(2.5px 0 0 white) drop-shadow(-2.5px 0 0 white) drop-shadow(0 2.5px 0 white) drop-shadow(0 -2.5px 0 white) drop-shadow(0 4px 8px rgba(0,0,0,0.18))"
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Notebook Sketches Showcase */}
                    {sketches && sketches.length > 0 && (
                        <div className="flex flex-wrap gap-4 mt-8 pt-4 border-t border-slate-200/25">
                            {sketches.map((src, idx) => (
                                <div key={idx} className="relative group max-w-[150px] max-h-[120px] border border-border rounded-lg bg-surface/50 overflow-hidden shadow-sm">
                                    <img
                                        src={src}
                                        alt="sketch"
                                        className="w-full h-full object-contain"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setSketches(prev => prev.filter((_, i) => i !== idx))}
                                        className="absolute top-1 right-1 p-1 rounded-full bg-accent-red text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm hover:scale-105"
                                        title="Delete Sketch"
                                    >
                                        <LuX className="text-[10px]" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </NotebookPaper>
            </div>

            {/* Sticker Upload and Management Panel */}
            <div className={`${isEditorFullscreen ? 'max-w-4xl mx-auto w-full' : ''}`}>
                <StickerManager stickers={stickers} setStickers={setStickers} penColor={penColor} />
            </div>

            {/* Voice Memos list / Recording Panel */}
            <div className={`paper-card p-4 sm:p-5 mt-6 shadow-sm flex flex-col h-fit ${isEditorFullscreen ? 'max-w-4xl mx-auto w-full' : ''}`}>
                <span className="text-[9px] font-mono font-bold text-accent-rust uppercase tracking-widest block mb-3">
                  Voice Memo Attachments
                </span>
                
                <div className="flex items-center gap-4 flex-wrap mb-4">
                  {isRecording ? (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="px-4 py-2 bg-accent-red text-white font-bold text-xs rounded-lg animate-pulse cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" /> Stop Recording ({formatDuration(recordingDuration)})
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="px-4 py-2 bg-accent-rust text-white font-bold text-xs rounded-lg hover:filter hover:brightness-110 cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      🎙️ Record Voice Memo
                    </button>
                  )}
                </div>

                {voiceNotes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {voiceNotes.map((src, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-bg/40">
                        <audio src={src} controls className="max-w-[200px] h-8 shrink-0" />
                        <button
                          type="button"
                          onClick={() => deleteVoiceNote(idx)}
                          className="p-1 rounded text-ink-muted hover:text-accent-red hover:bg-bg transition-all cursor-pointer"
                          title="Delete memo"
                        >
                          <LuTrash2 className="text-xs" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-ink-muted italic">No voice memos recorded for this note.</p>
                )}
            </div>

            {/* Security Passcode & Public Link generation */}
            {type === 'edit' && noteData?._id && (
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 ${isEditorFullscreen ? 'max-w-4xl mx-auto w-full' : ''}`}>
                {/* Passcode Panel */}
                <div className="paper-card p-4 sm:p-5 shadow-sm">
                  <span className="text-[9px] font-mono font-bold text-accent-rust uppercase tracking-widest block mb-3">
                    Security Passcode
                  </span>
                  
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-ink flex items-center gap-1">
                        {isLocked ? "🔒 PIN Protected" : "🔓 Unlocked Note"}
                      </p>
                      <p className="text-[10px] text-ink-muted mt-0.5 leading-relaxed">
                        {isLocked ? "Requires your 4-digit PIN code to view." : "Unlocked notes can be viewed directly."}
                      </p>
                    </div>

                    {isLocked ? (
                      <button
                        type="button"
                        onClick={handleRemovePinLock}
                        className="px-3 py-1.5 bg-accent-red/10 border border-accent-red/35 text-accent-red hover:bg-accent-red hover:text-white transition-all text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Remove Lock
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSetPinLock}
                        className="px-3 py-1.5 bg-accent-rust text-white hover:brightness-110 transition-all text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Lock Note
                      </button>
                    )}
                  </div>
                </div>

                {/* Share URL Panel */}
                <div className="paper-card p-4 sm:p-5 shadow-sm">
                  <span className="text-[9px] font-mono font-bold text-accent-sage uppercase tracking-widest block mb-3">
                    Public Shareable Link
                  </span>
                  
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-ink">
                        {shareToken ? "🔗 Public Link Active" : "📡 Public Sharing Off"}
                      </p>
                      {shareToken ? (
                        <button
                          type="button"
                          onClick={handleRevokePublicShare}
                          className="px-3 py-1 bg-accent-red/10 border border-accent-red/35 text-accent-red hover:bg-accent-red hover:text-white transition-all text-[10px] font-bold rounded-lg cursor-pointer"
                        >
                          Revoke
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleGeneratePublicShare}
                          className="px-3 py-1 bg-accent-sage text-white hover:brightness-110 transition-all text-[10px] font-bold rounded-lg cursor-pointer"
                        >
                          Activate
                        </button>
                      )}
                    </div>

                    {shareToken && (
                      <div className="flex gap-1.5 items-center bg-bg/50 border border-border p-1.5 rounded-lg">
                        <input
                          type="text"
                          readOnly
                          value={`${window.location.origin}/shared/${shareToken}`}
                          className="flex-1 text-[10px] bg-transparent outline-none text-ink-muted truncate font-mono select-all"
                        />
                        <button
                          type="button"
                          onClick={handleCopyShareLink}
                          className="px-2.5 py-1 bg-accent-rust text-white text-[10px] font-mono rounded cursor-pointer font-bold shrink-0 hover:brightness-105"
                        >
                          Copy
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Footer with stats, tag list, and background color controls */}
            <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6 ${isEditorFullscreen ? 'max-w-4xl mx-auto w-full' : ''}`}>
                {/* Background Selector */}
                <div className='flex flex-col gap-1.5'>
                    <label className='text-[10px] font-bold text-ink-muted uppercase tracking-widest'>Paper Color</label>
                    <div className='flex gap-2 items-center'>
                        {[
                            { name: 'White', value: '#ffffff' },
                            { name: 'Yellow', value: '#fff9db' },
                            { name: 'Blue', value: '#e7f5ff' },
                            { name: 'Green', value: '#e6fcf5' },
                            { name: 'Pink', value: '#fff0f6' },
                            { name: 'Purple', value: '#f3f0ff' },
                            { name: 'Orange', value: '#fff4e6' }
                        ].map((c) => (
                            <button
                                key={c.value}
                                type="button"
                                className={`w-7 h-7 rounded-full border transition-all cursor-pointer hover:scale-105 ${color === c.value ? 'scale-110 border-ink shadow-md ring-2 ring-accent-rust' : 'border-border'}`}
                                style={{ backgroundColor: c.value }}
                                onClick={() => setColor(c.value)}
                                title={c.name}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex-1 max-w-xs">
                    <Taginput tags={tags} setTags={setTags} className='text-ink' />
                </div>
            </div>

            {/* Stats section */}
            <div className={`mt-4 pt-3 border-t border-border flex justify-between text-[11px] font-mono text-ink-muted ${isEditorFullscreen ? 'max-w-4xl mx-auto w-full' : ''}`}>
              <span>Words: {getWordCount()}</span>
              <span>Est. Reading Time: {getReadingTime()}</span>
            </div>

            {error && <p className='text-accent-red text-xs pt-4 font-semibold'>{error}</p>}
            <div className={`${isEditorFullscreen ? 'max-w-4xl mx-auto w-full mb-8' : ''}`}>
                <button className='btn-primary font-bold mt-6 p-3.5 shadow-md uppercase tracking-wider' onClick={handleAddNote}>
                    {type === 'edit' ? 'UPDATE NOTE' : 'ADD NOTE'}
                </button>
            </div>
            {isSketchModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 select-none">
                    <div className="paper-card border border-border p-6 flex flex-col gap-4 bg-surface rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] min-h-[500px]">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <h3 className="text-lg font-bold text-ink flex items-center gap-2">
                                <LuPencil className="text-accent-rust text-xl" />
                                <span>Draw & Insert Sketch</span>
                            </h3>
                            <button
                                onClick={() => setIsSketchModalOpen(false)}
                                className="p-1 rounded-full hover:bg-bg text-ink-muted hover:text-ink cursor-pointer"
                            >
                                <LuX className="text-lg" />
                            </button>
                        </div>
                        <div className="flex-1 min-h-0">
                            <DrawingCanvas ref={sketchCanvasRef} />
                        </div>
                        <div className="flex justify-end gap-3 pt-3 border-t border-border">
                            <button
                                onClick={() => setIsSketchModalOpen(false)}
                                className="btn-secondary py-2 px-4 text-sm font-semibold cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (sketchCanvasRef.current) {
                                        const imgData = sketchCanvasRef.current.exportImage();
                                        if (imgData) {
                                            setSketches(prev => [...prev, imgData]);
                                            alert.success("Sketch inserted into note content!");
                                        }
                                    }
                                    setIsSketchModalOpen(false);
                                }}
                                className="btn-primary py-2 px-4 text-sm font-semibold cursor-pointer"
                            >
                                Insert into Note
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AddEditnotes;
