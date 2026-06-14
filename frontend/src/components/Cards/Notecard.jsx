import React from 'react'
import { MdCreate, MdDelete, MdOutlinePushPin, MdArchive, MdUnarchive, MdRestore } from "react-icons/md"
import moment from "moment"
import Tilt3D from "../Tilt3D/Tilt3D"

function Notecard({ isPinned, onPinNote, content, tags, onEdit, title, date, onDelete, color, isArchived, isTrashed, onArchive, onRestore, onClickCard, paperType = "plain", fontFamily = "Outfit", penColor = "#1e293b", stickers = [] }) {
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
  const selectedFontClass = fontStyleMap[fontFamily] || "font-['Outfit']";

  const getPaperBackground = () => {
    switch (paperType) {
      case "lined":
        return {
          backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.08) 1px, transparent 1px)',
          backgroundSize: '100% 1.8rem',
        };
      case "grid":
        return {
          backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.06) 1px, transparent 1px)',
          backgroundSize: '1.2rem 1.2rem',
        };
      case "dotted":
        return {
          backgroundImage: 'radial-gradient(rgba(99, 102, 241, 0.1) 1.2px, transparent 1.2px)',
          backgroundSize: '1.2rem 1.2rem',
        };
      case "pink-gingham":
        return {
          backgroundColor: '#fff0f6',
          backgroundImage: 'linear-gradient(90deg, rgba(219, 39, 119, 0.03) 50%, transparent 50%), linear-gradient(rgba(219, 39, 119, 0.03) 50%, transparent 50%)',
          backgroundSize: '1.5rem 1.5rem',
        };
      case "plain":
      default:
        return {
          backgroundColor: color || '#ffffff',
        };
    }
  };

  const cardStyle = {
    backgroundColor: paperType !== 'pink-gingham' ? (color || '#ffffff') : undefined,
    color: penColor,
    ...getPaperBackground(),
  };

  return (
    <Tilt3D className="w-full">
      <div 
        className={`border border-white/20 dark:border-slate-800/40 rounded-2xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out cursor-pointer relative flex flex-col justify-between h-[180px] w-full overflow-hidden ${selectedFontClass} bg-white/40 dark:bg-slate-900/30 backdrop-blur-md hover:scale-[1.02] hover:border-blue-500/30 dark:hover:border-blue-400/30`}
        style={cardStyle}
        onClick={onClickCard}
      >
        {/* Floating stickers preview inside card */}
        {stickers && stickers.length > 0 && (
          <div className="absolute right-4 bottom-12 flex gap-1 pointer-events-none z-10 opacity-70">
            {stickers.slice(0, 2).map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt=""
                className="w-10 h-10 object-contain rotate-[-6deg] even:rotate-[6deg]"
                style={{
                  filter: "drop-shadow(1.5px 0 0 white) drop-shadow(-1.5px 0 0 white) drop-shadow(0 1.5px 0 white) drop-shadow(0 -1.5px 0 white) drop-shadow(0 2px 4px rgba(0,0,0,0.12))"
                }}
              />
            ))}
          </div>
        )}
        {/* Margin line for lined paper preview */}
        {(paperType === "lined" || paperType === "grid") && (
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-red-400/20 pointer-events-none" />
        )}
        <div className={(paperType === "lined" || paperType === "grid") ? "pl-2" : ""}>
            <div className='flex items-center justify-between'>
                <div className='max-w-[85%]'>
                    <h6 className='text-sm font-extrabold line-clamp-1' style={{ color: penColor }}>{title}</h6>
                    <span className='text-[9px] opacity-60'>{moment(date).format("Do MMM YYYY")}</span>
                </div>

                {!isTrashed && (
                   <MdOutlinePushPin 
                     className={`icon-btn text-lg cursor-pointer shrink-0 ${isPinned ? 'text-[#2BB5FF]' : 'text-slate-350 hover:text-slate-500'}`} 
                     onClick={(e) => {
                         e.stopPropagation();
                         onPinNote();
                     }}
                   />
                )}
            </div> 
            <p 
              className='text-xs mt-2 line-clamp-3 overflow-hidden leading-relaxed opacity-85' 
              style={{ color: penColor }}
              dangerouslySetInnerHTML={{ __html: content }}
            />
        </div>

        <div className='flex items-center justify-between mt-3 pt-2 border-t border-slate-100/50'>
            <div className='text-[10px] text-slate-500 font-medium truncate max-w-[60%]'>
                {tags.map((item) => `#${item}`).join(' ')}
            </div>
            <div className='flex items-center gap-2 shrink-0'>
                {isTrashed ? (
                    <>
                        <MdRestore 
                            className='icon-btn text-slate-400 hover:text-green-600 text-lg cursor-pointer' 
                            title="Restore note"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRestore();
                            }}
                        />
                        <MdDelete 
                            className='icon-btn text-slate-400 hover:text-red-600 text-lg cursor-pointer' 
                            title="Delete permanently"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                        />
                    </>
                ) : (
                    <>
                        {!isArchived && (
                            <MdCreate 
                                className='react-btn text-slate-400 hover:text-green-600 text-lg cursor-pointer' 
                                title="Edit note"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit();
                                }}
                            />
                        )}
                        <button
                            className='icon-btn text-slate-400 hover:text-blue-500 cursor-pointer border-none bg-transparent p-0'
                            title={isArchived ? "Unarchive note" : "Archive note"}
                            onClick={(e) => {
                                e.stopPropagation();
                                onArchive();
                            }}
                        >
                            {isArchived ? <MdUnarchive className="text-lg" /> : <MdArchive className="text-lg" />}
                        </button>
                        <MdDelete 
                            className='icon-btn text-slate-400 hover:text-red-500 text-lg cursor-pointer' 
                            title="Move to trash"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                        />
                    </>
                )}
            </div>
        </div>
      </div>
    </Tilt3D>
  )
}

export default Notecard