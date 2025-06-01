import React from 'react'
import { Route, Routes } from 'react-router-dom'
import UserLayout from '../layout/userLayout'
import VenuesCards from '../pages/owner/VenuesCard'
import CreateVenue from '../pages/owner/CreateVenue'
import VenueInfo from '../pages/owner/VenueInfo'
import ViewBron from '../pages/owner/viewBron'
import UpdateVenues from '../pages/owner/UpdateVenue'
import BookingCalendar from '../pages/owner/BookingDate'

function UserRouter() {
  return (
    <Routes>
        <Route element={<UserLayout/>}>
            <Route index element={<VenuesCards/>}></Route>
            <Route path='create' element={<CreateVenue/>}></Route>
            <Route path='details/:id' element={<VenueInfo/>}></Route>
            <Route path='viewBookings' element={<ViewBron/>}></Route>
            <Route path='bookingDate' element={<BookingCalendar/>}></Route>
            <Route path='update/:id' element={<UpdateVenues/>}></Route>
        </Route>
    </Routes>
  )
}

export default UserRouter