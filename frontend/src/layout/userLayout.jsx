import React from "react";
import Header from "../components/header";
import { Outlet } from "react-router-dom";

function UserLayout() {
  return (
    <div>
      <Header />
      <Outlet />
    </div>
  );
}

export default UserLayout;
