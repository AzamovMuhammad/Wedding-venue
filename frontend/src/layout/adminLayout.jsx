import React from 'react'
import AdminSidebar from '../components/AdminSidebar'
import { Outlet } from 'react-router-dom'

function AdminLayout() {
  return (
    <div className='flex' >
        <AdminSidebar/>
        <Outlet/>
    </div>
  )
}

export default AdminLayout