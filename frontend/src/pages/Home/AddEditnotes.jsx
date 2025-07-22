import React, { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import Taginput from '../../components/input/Taginput';

function AddEditnotes({ type, noteData, onClose }) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (type === 'edit' && noteData) {
            setTitle(noteData.title);
            setContent(noteData.content);
            setTags(noteData.tags);
        }
    }, [type, noteData]);

    const addNewNote = async () => {
        console.log({ title, content, tags });
    };

    const editNote = async () => {
        const noteId = noteData._id;
        console.log({ noteId, title, content, tags });
    };

    const handleAddNote = () => {
        if (!title) {
            setError("Please enter a title.");
            return;
        }
        if (!content) {
            setError("Please enter content for the note.");
            return;
        }
        setError(null);

        if (type === "edit") {
            editNote();
        } else {
            addNewNote();
        }
        onClose();
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
<Taginput/>
            <button className='btn-primary font-medium mt-5 p-3' onClick={handleAddNote}>
                {type === 'edit' ? 'UPDATE' : 'ADD NOTE'}
            </button>
        </div>
    );
}

export default AddEditnotes;