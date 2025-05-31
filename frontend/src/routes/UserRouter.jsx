import React from 'react'
import { Route, Routes } from 'react-router-dom'
import UserLayout from '../layout/userLayout'
import VenuesCards from '../pages/owner/VenuesCard'
import CreateVenue from '../pages/owner/CreateVenue'

function UserRouter() {
  return (
    <Routes>
        <Route element={<UserLayout/>}>
            <Route index element={<VenuesCards/>}></Route>
            <Route path='create' element={<CreateVenue/>}></Route>
        </Route>
    </Routes>
  )
}

export default UserRouter