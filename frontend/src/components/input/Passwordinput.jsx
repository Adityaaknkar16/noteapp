import React, { useState } from 'react';
import { MdOutlineVisibility, MdOutlineVisibilityOff } from 'react-icons/md';

function PasswordInput({ value, onChange, placeholder }) {
  const [isShowPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = (e) => {
    e.preventDefault();
    setShowPassword(prev => !prev);
  };

  return (
    <div className='flex items-center bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 focus-within:border-blue-500 dark:focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/15 px-4 rounded-xl mb-4 transition-all duration-200 shadow-sm'>
      <input
        type={isShowPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder || 'Password'}
        className='w-full text-sm bg-transparent py-3 mr-3 outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-medium'
      />
      <button
        onClick={togglePasswordVisibility}
        type="button"
        className='text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors text-xl focus:outline-none cursor-pointer p-1 rounded-lg'
        title={isShowPassword ? 'Hide Password' : 'Show Password'}
      >
        {isShowPassword ? <MdOutlineVisibilityOff /> : <MdOutlineVisibility />}
      </button>
    </div>
  );
}

export default PasswordInput;