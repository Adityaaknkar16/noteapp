import React, { useState } from 'react';

function PasswordInput({ value, onChange, placeholder }) {
  const [isShowPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = (e) => {
    e.preventDefault(); // Prevents form reset on button click
    setShowPassword(prev => !prev);
  };

  return (
    <div className='flex items-center bg-transparent border-[1.5px] px-5 rounded mb-3'>
      <input
        type={isShowPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder || 'Password'}
        className='w-full text-sm bg-transparent py-3 mr-3 rounded outline-none'
      />
      <button
        onClick={togglePasswordVisibility}
        className='text-blue-500 text-sm focus:outline-none'
      >
        {isShowPassword ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}

export default PasswordInput;