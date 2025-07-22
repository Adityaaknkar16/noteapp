import React from 'react'
import {getInitials} from "../../utlis/helper"

function ProfileInfo({onLogout}) {
  return (
    <div className='flex items-center gap-3'>
      <div className='w-12 h-12 flex items-center justify-center bg-slate-100'>
        {getInitials("Aditya Akankar")}
      </div> 
      <div><p className='text-sm font-medium' >Aditya</p></div>
      <button className='text-sm bg-red-500 p-1 rounded-md text-white
      hover:opacity-80' onClick={onLogout}>Logout</button>
    </div>
  )
}

export default ProfileInfo