import React from 'react';
import { FaSearch } from 'react-icons/fa';
import {IoMdClose} from 'react-icons/io'
function SearchBar({ value, onChange, handleSearch,onClearSearch }) {
  return (
    <div className='w-60 flex items-center border border-slate-300 px-3 py-2 rounded'>
      <input
        type='text'
        placeholder='Search'
        className='w-full text-sm bg-transparent outline-none'
        value={value}
        onChange={onChange}
      />
    { value && (<IoMdClose  className='text-slate-500 text-xl cursor-pointer hover:text-black mr-3' onClick={onClearSearch}/>)}
      <FaSearch
        className='text-slate-500 text-xl cursor-pointer hover:text-black mr-3'
        onClick={handleSearch}
      />
    </div>
  );
}

export default SearchBar;