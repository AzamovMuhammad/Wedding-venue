import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/header";
import Login from "./pages/login";
import Register from "./pages/Register";
import UserLayout from "./layout/userLayout";
import CreateVenue from "./pages/CreateVenue";


function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />


          <Route path="/createVanue" element={<CreateVenue/>} />

          <Route path="/" element={<UserLayout/>} />

          

        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
