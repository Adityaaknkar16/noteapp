import React from 'react';
import PageDecor from '../Doodles/PageDecor';

function EmptyCard({ message }) {
  return (
    <div className='flex flex-col items-center justify-center mt-20 text-center px-4'>
      {/* Aesthetic Empty State SVG Illustration */}
      <div className="relative mb-6 flex items-center justify-center">
        {/* Soft background glow */}
        <div className="absolute w-32 h-32 rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-xl"></div>
        
        <svg 
          width="160" 
          height="160" 
          viewBox="0 0 160 160" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="text-slate-300 dark:text-slate-700 relative z-10"
        >
          {/* Main Document / Note Page outline */}
          <path 
            d="M45 25H95L115 45V125C115 130.523 110.523 135 105 135H45C39.4772 135 35 130.523 35 125V35C35 29.4772 39.4772 25 45 25Z" 
            stroke="currentColor" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="text-blue-500/40 dark:text-blue-400/20"
          />
          {/* Folded paper corner */}
          <path 
            d="M95 25V45H115" 
            stroke="currentColor" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="text-blue-500/45 dark:text-blue-400/25"
          />
          {/* Lines on the document */}
          <path 
            d="M50 65H100" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round" 
            className="text-slate-300 dark:text-slate-800"
          />
          <path 
            d="M50 85H100" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round" 
            className="text-slate-300 dark:text-slate-800"
          />
          <path 
            d="M50 105H80" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round" 
            className="text-slate-300 dark:text-slate-800"
          />
          
          {/* Floating Sparkles / Bubbles */}
          <circle cx="125" cy="85" r="5" className="fill-blue-400/50 dark:fill-blue-500/30 animate-pulse" />
          <circle cx="30" cy="55" r="3" className="fill-purple-400/40 dark:fill-purple-500/20" />
          <circle cx="110" cy="115" r="4" className="fill-indigo-400/40 dark:fill-indigo-500/20" />
          
          {/* Sparkle star */}
          <path 
            d="M125 35L127 40L132 42L127 44L125 49L123 44L118 42L123 40L125 35Z" 
            className="fill-amber-400/60 dark:fill-amber-500/40"
          />
        </svg>
      </div>

      <PageDecor variant="empty-state" />

      <p className='w-full max-w-sm text-sm font-semibold text-slate-400 dark:text-slate-500 leading-relaxed mt-2'>
        {message}
      </p>
    </div>
  )
}

export default EmptyCard