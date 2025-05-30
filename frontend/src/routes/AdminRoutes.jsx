import React from "react";
import { Route, Routes } from "react-router-dom";
import AdminLayout from "../layout/adminLayout";
import AddNewVenue from "../pages/admin/AddNewVenue";
import GetAllVenues from "../pages/admin/GetAllVenues";
import GetAllVenueOwners from "../pages/admin/GetAllVenueOwners";
import GetBrons from "../pages/admin/GetBrons";
import GetVenues from "../pages/admin/GetVenues";
import ConfirmVenue from "../pages/admin/ConfirmVenue";

function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<GetAllVenues />} />
        <Route path="addVenue" element={<AddNewVenue />} />
        <Route path="getVenueOwners" element={<GetAllVenueOwners />} />
        <Route path="getBrons" element={<GetBrons />} />
        <Route path="getVenues" element={<GetVenues />} />
        <Route path="confirm" element={<ConfirmVenue />} />
      </Route>
    </Routes>
  );
}

export default AdminRoutes;
