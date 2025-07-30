import React, { useState } from 'react'
import SearchBar from './SearchBar/SearchBar'
import ProfileInfo from './Cards/ProfileInfo'
import {useNavigate} from 'react-router-dom'
import {Link} from 'react-router-dom'


function Navbar() {
  const[searchQuery,setsearchQuery]= useState("")
  const handleSearch=() =>{}
  const navigate =useNavigate()
  const onClearSearch=() =>{
    setsearchQuery("")
  }
   const onLogout=() =>{
navigate("/login")
   }
  return (
    <div className='bg-white  justify-between flex items-center px-6 py-2 drop-shadow'>
      <Link to ={'/'}>
        <h2 className='text-xl font-medium text-black py-2'><span className='text-slate-500'>Task</span>
        
        <span className='text-slate-900'>Note</span></h2>
        </Link>
   <SearchBar value={searchQuery} onChange={({ target }) => setsearchQuery(target.value)} 
    handleSearch={{handleSearch}}
    onClearSearch={onClearSearch}/>
       <ProfileInfo onLogout={onLogout}/>
    </div>
  )
}

export default Navbar