import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';

function SearchBar({ value, onChange, handleSearch, onClearSearch }) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-60 flex items-center border border-slate-300 dark:border-slate-700 px-3 py-2 rounded bg-white dark:bg-slate-800 transition-colors">
      <input
        type="text"
        placeholder="Search"
        className="w-full text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
        value={value}
        onChange={onChange}
        onKeyPress={handleKeyPress} // 🔍 Trigger search on Enter
      />

      {value && (
        <IoMdClose
          className="text-slate-500 dark:text-slate-400 text-xl cursor-pointer hover:text-black dark:hover:text-white mr-2"
          onClick={onClearSearch}
          title="Clear"
        />
      )}

      <FaSearch
        className="text-slate-500 dark:text-slate-400 text-xl cursor-pointer hover:text-black dark:hover:text-white"
        onClick={handleSearch}
        title="Search"
      />
    </div>
  );
}

export default SearchBar;
