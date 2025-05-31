import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/Register";
import AdminRoutes from "./routes/AdminRoutes";
import UserRouter from "./routes/UserRouter";


function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />

          <Route path="/*" element={<UserRouter/>} />
          <Route path="/admin/*" element={<AdminRoutes/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
