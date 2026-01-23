import React from 'react';
import { getInitials } from '../../utlis/helper';

function ProfileInfo({ onLogout, userInfo }) {
  const username = userInfo?.username || 'Guest';

  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-full font-semibold text-slate-700">
        {getInitials(username)}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-800">{username}</p>
      </div>
      <button
        className="text-sm bg-red-500 px-3 py-1 rounded-md text-white hover:opacity-80 transition"
        onClick={onLogout}
        title="Log out"
      >
        Logout
      </button>
    </div>
  );
}

export default ProfileInfo;