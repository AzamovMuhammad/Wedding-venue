import React from "react";
import { Route, Routes } from "react-router-dom";
import AdminLayout from "../layout/adminLayout";
import AddNewVenue from "../pages/admin/AddNewVenue";
import GetAllVenues from "../pages/admin/GetAllVenues";
import GetAllVenueOwners from "../pages/admin/GetAllVenueOwners";
import ConfirmVenue from "../pages/admin/ConfirmVenue";
import VenueDetails from "../pages/admin/VenueDetails";
import GetBron from "../pages/admin/GetBrons";
import UpdateVenues from "../pages/admin/UpdateVanue";

function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<GetAllVenues />} />
        <Route path="addVenue" element={<AddNewVenue />} />
        <Route path="getVenueOwners" element={<GetAllVenueOwners />} />
        <Route path="getBrons" element={<GetBron />} />
        <Route path="confirm" element={<ConfirmVenue />} />
        <Route path="update/:id" element={<UpdateVenues />} />
        <Route path="details/:id" element={<VenueDetails />} />
      </Route>
    </Routes>
  );
}

export default AdminRoutes;
