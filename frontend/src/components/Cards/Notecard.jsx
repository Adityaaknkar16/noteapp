import React from 'react'
import { LuPencil, LuTrash2, LuPin, LuArchive, LuFolderUp, LuHistory, LuLock } from "react-icons/lu"
import moment from "moment"
import Tilt3D from "../Tilt3D/Tilt3D"

function Notecard({ isPinned, onPinNote, content, tags, onEdit, title, date, onDelete, color, isArchived, isTrashed, onArchive, onRestore, onClickCard, paperType = "plain", fontFamily = "Outfit", penColor = "#1e293b", stickers = [], isLocked = false }) {
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
          backgroundImage: 'linear-gradient(rgba(194, 84, 44, 0.08) 1px, transparent 1px)',
          backgroundSize: '100% 1.8rem',
        };
      case "grid":
        return {
          backgroundImage: 'linear-gradient(rgba(111, 143, 107, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(111, 143, 107, 0.06) 1px, transparent 1px)',
          backgroundSize: '1.2rem 1.2rem',
        };
      case "dotted":
        return {
          backgroundImage: 'radial-gradient(rgba(92, 122, 153, 0.1) 1.2px, transparent 1.2px)',
          backgroundSize: '1.2rem 1.2rem',
        };
      case "pink-gingham":
        return {
          backgroundColor: 'var(--surface)',
          backgroundImage: 'linear-gradient(90deg, rgba(179, 67, 58, 0.03) 50%, transparent 50%), linear-gradient(rgba(179, 67, 58, 0.03) 50%, transparent 50%)',
          backgroundSize: '1.5rem 1.5rem',
        };
      case "plain":
      default:
        return {
          backgroundColor: color || 'var(--surface)',
        };
    }
  };

  const cardStyle = {
    backgroundColor: paperType !== 'pink-gingham' ? (color || 'var(--surface)') : undefined,
    color: penColor,
    ...getPaperBackground(),
  };

  return (
    <Tilt3D className="w-full">
      <div 
        className={`border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out cursor-pointer relative flex flex-col justify-between h-[180px] w-full overflow-hidden ${selectedFontClass} hover:scale-[1.02] hover:border-accent-rust`}
        style={cardStyle}
        onClick={onClickCard}
      >
        {/* Floating stickers preview inside card */}
        {stickers && stickers.length > 0 && !isLocked && (
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
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-accent-red/20 pointer-events-none" />
        )}
        <div className={(paperType === "lined" || paperType === "grid") ? "pl-2" : ""}>
            <div className='flex items-center justify-between'>
                <div className='max-w-[85%] flex flex-col'>
                    <h6 className='text-sm font-extrabold line-clamp-1 flex items-center gap-1.5' style={{ color: penColor }}>
                      {isLocked && <LuLock className="text-accent-rust text-xs shrink-0" />}
                      {title}
                    </h6>
                    <span className='text-[9px] opacity-60'>{moment(date).format("Do MMM YYYY")}</span>
                </div>

                {!isTrashed && (
                   <LuPin 
                     className={`icon-btn text-base cursor-pointer shrink-0 ${isPinned ? 'text-accent-rust' : 'text-ink-muted hover:text-ink'}`} 
                     onClick={(e) => {
                         e.stopPropagation();
                         onPinNote();
                     }}
                   />
                )}
            </div> 
            <p 
              className={`text-xs mt-2 line-clamp-3 overflow-hidden leading-relaxed opacity-85 ${isLocked ? 'blur-xs select-none' : ''}`} 
              style={{ color: penColor }}
              dangerouslySetInnerHTML={{ __html: isLocked ? "This note is locked under password security. Click this card to unlock using your 4-digit PIN." : content }}
            />
        </div>

        <div className='flex items-center justify-between mt-3 pt-2 border-t border-border'>
            <div className='text-[10px] text-ink-muted font-medium truncate max-w-[60%]'>
                {tags.map((item) => `#${item}`).join(' ')}
            </div>
            <div className='flex items-center gap-2 shrink-0'>
                {isTrashed ? (
                    <>
                        <LuHistory 
                            className='icon-btn text-ink-muted hover:text-accent-sage text-base cursor-pointer' 
                            title="Restore note"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRestore();
                            }}
                        />
                        <LuTrash2 
                            className='icon-btn text-ink-muted hover:text-accent-red text-base cursor-pointer' 
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
                            <LuPencil 
                                className='icon-btn text-ink-muted hover:text-accent-sage text-base cursor-pointer' 
                                title="Edit note"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit();
                                }}
                            />
                        )}
                        <button
                            className='icon-btn text-ink-muted hover:text-accent-rust cursor-pointer border-none bg-transparent p-0 flex items-center justify-center'
                            title={isArchived ? "Unarchive note" : "Archive note"}
                            onClick={(e) => {
                                e.stopPropagation();
                                onArchive();
                            }}
                        >
                            {isArchived ? <LuFolderUp className="text-base" /> : <LuArchive className="text-base" />}
                        </button>
                        <LuTrash2 
                            className='icon-btn text-ink-muted hover:text-accent-red text-base cursor-pointer' 
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
