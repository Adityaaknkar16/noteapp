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
    <div className="w-60 flex items-center border border-slate-300 px-3 py-2 rounded bg-white">
      <input
        type="text"
        placeholder="Search"
        className="w-full text-sm bg-transparent outline-none"
        value={value}
        onChange={onChange}
        onKeyPress={handleKeyPress} // 🔍 Trigger search on Enter
      />

      {value && (
        <IoMdClose
          className="text-slate-500 text-xl cursor-pointer hover:text-black mr-2"
          onClick={onClearSearch}
          title="Clear"
        />
      )}

      <FaSearch
        className="text-slate-500 text-xl cursor-pointer hover:text-black"
        onClick={handleSearch}
        title="Search"
      />
    </div>
  );
}

export default SearchBar;