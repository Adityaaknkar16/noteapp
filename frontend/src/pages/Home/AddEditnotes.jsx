import React, { useState, useEffect } from 'react';
import { MdClose, MdFullscreen, MdFullscreenExit } from 'react-icons/md';
import Taginput from '../../components/input/Taginput';
import axios from 'axios';
import { useAlert } from '../../components/Alert/AlertProvider';
import NotebookPaper from '../../components/NotebookPaper/NotebookPaper';
import StickerManager from '../../components/StickerManager/StickerManager';
import NotebookEditor from '../../components/NotebookEditor/NotebookEditor';
import { useSettings } from '../../components/Settings/SettingsProvider';

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

    useEffect(() => {
        if (noteData) {
            setTitle(noteData.title || "");
            setContent(noteData.content || "");
            setTags(noteData.tags || []);
            setColor(noteData.color || "#ffffff");
            setPaperType(noteData.paperType || "lined");
            setFontFamily(noteData.fontFamily || "Outfit");
            setPenColor(noteData.penColor || "#1e293b");
            setStickers(noteData.stickers || []);
            setCollaborators(noteData.collaborators || []);
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
                collaborators
            });
        }
    }, [title, content, tags, color, paperType, fontFamily, penColor, stickers, collaborators]);

    const addNewNote = async () => {
        try {
            const res = await axios.post("http://localhost:3000/api/note/add", { title, content, tags, color, paperType, fontFamily, penColor, stickers }, { withCredentials: true })
            if (res.data.success == false) {
                console.log(res.data.message);
                setError(res.data.message);
                alert.error(res.data.message);
                return;
            }
            alert.success("Note added successfully!");
            getAllNotes();
            onClose();
        } catch (error) {
            console.log(error.response?.data?.message || error.message);
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
            const res = await axios.post(`http://localhost:3000/api/note/edit/${noteId}`, 
                { title, content, tags, color, paperType, fontFamily, penColor, stickers }, 
                { withCredentials: true }
            );

            if (res.data && res.data.success === false) {
                console.log(res.data.message);
                setError(res.data.message);
                alert.error(res.data.message);
                return;
            }
            
            alert.success("Note updated successfully!");
            getAllNotes();
            onClose();

        } catch (error) {
            console.error("Edit note error:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to update note";
            setError(errorMessage);
            alert.error(errorMessage);
        }
    };

    const handleBackgroundAutoSave = async (updatedContent) => {
        if (type === 'edit' && noteData?._id) {
            try {
                await axios.post(`http://localhost:3000/api/note/edit/${noteData._id}`, 
                    { title, content: updatedContent, tags, color, paperType, fontFamily, penColor, stickers }, 
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
            const res = await axios.post(`http://localhost:3000/api/note/invite/${noteData._id}`, { email: collabEmail }, { withCredentials: true });
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
        // Removed onClose() from here as it's already called in addNewNote and editNote
    };

    return (
        <div className={`relative flex flex-col ${isEditorFullscreen ? 'fixed inset-0 w-screen h-screen z-[99999] bg-[#07090e]/95 backdrop-blur-xl p-8 overflow-y-auto' : ''}`}>
            {isEditorFullscreen && (
                <>
                    <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full mesh-glow-1 blur-[120px] pointer-events-none opacity-40" />
                    <div className="absolute bottom-[-15%] left-[-10%] w-[550px] h-[550px] rounded-full mesh-glow-2 blur-[120px] pointer-events-none opacity-40" />
                </>
            )}
            {/* Header controls for Notebook Styles */}
            <div className={`flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800 ${isEditorFullscreen ? 'max-w-4xl mx-auto w-full' : ''}`}>
                <div className="flex flex-wrap items-center gap-4">
                    {/* Paper Type Selector */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Paper Style</label>
                        <select 
                            value={paperType} 
                            onChange={(e) => setPaperType(e.target.value)}
                            className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold px-2.5 py-1.5 rounded-lg border-none outline-none text-slate-700 dark:text-slate-200 cursor-pointer"
                        >
                            <option value="lined">📝 Ruled Lines</option>
                            <option value="grid">📐 Grid Math</option>
                            <option value="dotted">⚪ Dotted Grid</option>
                            <option value="pink-gingham">🌸 Pink Checked</option>
                            <option value="plain">📄 Clean Plain</option>
                        </select>
                    </div>

                    {/* Font Selector */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Ink Font</label>
                        <select 
                            value={fontFamily} 
                            onChange={(e) => setFontFamily(e.target.value)}
                            className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold px-2.5 py-1.5 rounded-lg border-none outline-none text-slate-700 dark:text-slate-200 cursor-pointer"
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
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Pen Color</label>
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
                                    className={`w-5 h-5 rounded-full border transition-all ${penColor === p.value ? 'ring-2 ring-blue-500 scale-110' : 'opacity-70 hover:opacity-100'}`}
                                    style={{ backgroundColor: p.value }}
                                    title={p.name}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Share Button (only if edit mode) */}
                    {type === "edit" && noteData?._id && (
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCollab(!showCollab);
                                }}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/10 hover:bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-sm flex items-center gap-1 cursor-pointer transition-colors"
                            >
                                👥 Share
                            </button>
                            {showCollab && (
                                <div className="absolute top-10 right-0 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-[999] w-72 flex flex-col gap-3">
                                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Invite Collaborator</h4>
                                    <div className="flex gap-2">
                                        <input
                                            type="email"
                                            placeholder="Enter registered email..."
                                            value={collabEmail}
                                            onChange={(e) => setCollabEmail(e.target.value)}
                                            className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none text-slate-800 dark:text-slate-100"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleInviteCollaborator}
                                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3 py-2 rounded-xl cursor-pointer transition-all"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    {collaborators && collaborators.length > 0 && (
                                        <div className="flex flex-col gap-1.5 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Collaborators ({collaborators.length})</span>
                                            <div className="max-h-24 overflow-y-auto flex flex-col gap-1 pr-1">
                                                {collaborators.map((email) => (
                                                    <span key={email} className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 px-2 py-1 rounded-lg truncate" title={email}>
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
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title={isEditorFullscreen ? "Exit Focus Mode" : "Fullscreen Focus Mode"}
                    >
                        {isEditorFullscreen ? (
                            <MdFullscreenExit className="text-xl text-blue-500" />
                        ) : (
                            <MdFullscreen className="text-xl text-slate-400 hover:text-blue-500" />
                        )}
                    </button>

                    <button
                        className='w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                        onClick={onClose}
                    >
                        <MdClose className='text-xl text-slate-400' />
                    </button>
                </div>
            </div>

            {/* Notebook Paper Surface */}
            <div className={`${isEditorFullscreen ? 'max-w-4xl mx-auto w-full flex-1' : ''}`}>
                <NotebookPaper
                    paperType={paperType}
                    fontFamily={fontFamily}
                    penColor={penColor}
                    bgColor={color}
                    className="w-full"
                >
                    <div className='flex flex-col gap-2'>
                        <input
                            type="text"
                            className='text-2xl font-bold outline-none bg-transparent w-full border-none'
                            placeholder='Title your thoughts...'
                            value={title}
                            onChange={({ target }) => setTitle(target.value)}
                            style={{ color: penColor }}
                        />
                    </div>

                    <div className='flex flex-col gap-2 mt-4'>
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
                </NotebookPaper>
            </div>

            {/* Sticker Upload and Management Panel */}
            <div className={`${isEditorFullscreen ? 'max-w-4xl mx-auto w-full' : ''}`}>
                <StickerManager stickers={stickers} setStickers={setStickers} penColor={penColor} />
            </div>

            {/* Tag Selection & Background Color Controls */}
            <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6 ${isEditorFullscreen ? 'max-w-4xl mx-auto w-full' : ''}`}>
                {/* Background Selector */}
                <div className='flex flex-col gap-1.5'>
                    <label className='text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest'>Paper Color</label>
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
                                className={`w-7 h-7 rounded-full border transition-all cursor-pointer hover:scale-105 ${color === c.value ? 'scale-110 border-slate-900 dark:border-white shadow-md ring-2 ring-blue-400' : 'border-slate-300 dark:border-slate-800'}`}
                                style={{ backgroundColor: c.value }}
                                onClick={() => setColor(c.value)}
                                title={c.name}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex-1 max-w-xs">
                    <Taginput tags={tags} setTags={setTags} className='text-slate-900' />
                </div>
            </div>

            {error && <p className='text-red-500 text-xs pt-4 font-semibold'>{error}</p>}
            <div className={`${isEditorFullscreen ? 'max-w-4xl mx-auto w-full mb-8' : ''}`}>
                <button className='btn-primary font-bold mt-6 p-3.5 shadow-md uppercase tracking-wider' onClick={handleAddNote}>
                    {type === 'edit' ? 'UPDATE NOTE' : 'ADD NOTE'}
                </button>
            </div>
        </div>
    );
}

export default AddEditnotes;