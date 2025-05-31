import React from 'react'
import { Route, Routes } from 'react-router-dom'
import UserLayout from '../layout/userLayout'
import VenuesCards from '../pages/owner/VenuesCard'
import CreateVenue from '../pages/owner/CreateVenue'
import VenueInfo from '../pages/owner/VenueInfo'

function UserRouter() {
  return (
    <Routes>
        <Route element={<UserLayout/>}>
            <Route index element={<VenuesCards/>}></Route>
            <Route path='create' element={<CreateVenue/>}></Route>
            <Route path='details/:id' element={<VenueInfo/>}></Route>
        </Route>
    </Routes>
  )
}

export default UserRouter