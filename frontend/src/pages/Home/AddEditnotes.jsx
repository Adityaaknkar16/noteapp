import React, { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import Taginput from '../../components/input/Taginput';
import axios from 'axios';
import { toast } from 'react-toastify';

function AddEditnotes({ type, noteData, onClose, getAllNotes }) {
    const [title, setTitle] = useState(noteData?.title || "")
    const [content, setContent] = useState(noteData?.content || "")
    const [tags, setTags] = useState(noteData?.tags || []); // Fixed: removed array wrapping
    const [error, setError] = useState(null);

    useEffect(() => {
        if (type === 'edit' && noteData) {
            setTitle(noteData.title);
            setContent(noteData.content);
            setTags(noteData.tags);
        }
    }, [type, noteData]);

    const addNewNote = async () => {
        try {
            const res = await axios.post("http://localhost:3000/api/note/add", { title, content, tags }, { withCredentials: true })
            if (res.data.success == false) {
                console.log(res.data.message)
                setError(res.data.message)
                toast.error(res.data.message, {
                    autoClose: 2000, // 2 seconds - fast
                    hideProgressBar: true, // hide progress bar
                    closeOnClick: true,
                    pauseOnHover: false, // don't pause on hover
                    closeButton: true, // show X close button
                });
                return
            }
            toast.success("Note added successfully!", {
                autoClose: 1500, // 1.5 seconds - fast
                hideProgressBar: true, // hide progress bar
                closeOnClick: true,
                pauseOnHover: false, // don't pause on hover for faster notification
                closeButton: true, // show X close button
            });
            getAllNotes()
            onClose()
        } catch (error) {
            console.log(error.response?.data?.message || error.message) // Fixed: better error handling
            setError(error.response?.data?.message || error.message)
            toast.error(error.response?.data?.message || "Failed to add note", {
                autoClose: 2500, // 2.5 seconds for errors
                hideProgressBar: true, // hide progress bar
                closeOnClick: true,
                pauseOnHover: false, // don't pause on hover
                closeButton: true, // show X close button
            });
        }
    };

    const editNote = async () => {
        if (!noteData || !noteData._id) {
            toast.error("Note ID not found", {
                autoClose: 2000, // 2 seconds - fast
                hideProgressBar: true, // hide progress bar
                closeOnClick: true,
                pauseOnHover: false, // don't pause on hover
                closeButton: true, // show X close button
            });
            return;
        }

        const noteId = noteData._id;

        try {
            const res = await axios.post(`http://localhost:3000/api/note/edit/${noteId}`, 
                { title, content, tags }, 
                { withCredentials: true }
            );

            if (res.data && res.data.success === false) {
                console.log(res.data.message)
                setError(res.data.message)
                toast.error(res.data.message, {
                    autoClose: 2000, // 2 seconds - fast
                    hideProgressBar: true, // hide progress bar
                    closeOnClick: true,
                    pauseOnHover: false, // don't pause on hover
                    closeButton: true, // show X close button
                });
                return
            }
            
            toast.success("Note updated successfully!", {
                autoClose: 1500, // 1.5 seconds - fast
                hideProgressBar: true, // hide progress bar
                closeOnClick: true,
                pauseOnHover: false, // don't pause on hover
                closeButton: true, // show X close button
            });
            getAllNotes()
            onClose()

        } catch (error) {
            console.error("Edit note error:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to update note";
            setError(errorMessage);
            toast.error(errorMessage, {
                autoClose: 2500, // 2.5 seconds for errors
                hideProgressBar: true, // hide progress bar
                closeOnClick: true,
                pauseOnHover: false, // don't pause on hover
                closeButton: true, // show X close button
            });
        }
    };

    const handleAddNote = () => {
        if (!title) {
            setError("Please enter a title.");
            toast.error("Please enter a title.", {
                autoClose: 1500, // 1.5 seconds for validation - very fast
                hideProgressBar: true, // hide progress bar
                closeOnClick: true,
                pauseOnHover: false, // don't pause on hover
                closeButton: true, // show X close button
            });
            return;
        }
        if (!content) {
            setError("Please enter content for the note.");
            toast.error("Please enter content for the note.", {
                autoClose: 1500, // 1.5 seconds for validation - very fast
                hideProgressBar: true, // hide progress bar
                closeOnClick: true,
                pauseOnHover: false, // don't pause on hover
                closeButton: true, // show X close button
            });
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
        <div className='relative flex flex-col'>
            <button
                className='w-10 h-10 rounded-full flex items-center justify-center absolute -top-3 -right-3 hover:bg-slate-100'
                onClick={onClose}
            >
                <MdClose className='text-xl text-slate-400' />
            </button>

            <div className='flex flex-col gap-2'>
                <label className='input-label'>TITLE</label>
                <input
                    type="text"
                    className='text-2xl text-slate-950 outline-none bg-transparent'
                    placeholder='Wake up at 6 AM'
                    value={title}
                    onChange={({ target }) => setTitle(target.value)}
                />
            </div>

            <div className='flex flex-col gap-2 mt-4'>
                <label className='input-label'>CONTENT</label>
                <textarea
                    className='text-sm text-slate-950 outline-none bg-slate-50 p-2 rounded'
                    placeholder='Start the day with a workout.'
                    rows={10}
                    value={content}
                    onChange={({ target }) => setContent(target.value)}
                />
            </div>

            {error && <p className='text-red-500 text-xs pt-4'>{error}</p>}
            <Taginput tags={tags} setTags={setTags} className='text-slate-900' />
            <button className='btn-primary font-medium mt-5 p-3' onClick={handleAddNote}>
                {type === 'edit' ? 'UPDATE' : 'ADD NOTE'}
            </button>
        </div>
    );
}

export default AddEditnotes;