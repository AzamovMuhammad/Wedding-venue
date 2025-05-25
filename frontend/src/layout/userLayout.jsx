import React from "react";
import Header from "../components/header";
import Corusel from "../components/corusel";
import VenuesCards from "../components/VenuesCard";

function UserLayout() {
  return (
    <div>
      <Header />
      <Corusel />

      <div className="mt-10 w-full flex justify-center items-center flex-col font-bold">
        <h1 className="text-5xl text-pink-400">Venues</h1>
        <div className="w-full ">
          <VenuesCards />
        </div>
      </div>
    </div>
  );
}

export default UserLayout;
