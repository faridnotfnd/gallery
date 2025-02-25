import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import DashboardAdmin from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Deskripsi from "./pages/Deskripsi";
import Register from "./pages/Register";
import ProfilePage from "./pages/ProfilePage";
import AlbumDetailPage from "./pages/AlbumDetailPage";
import ProfilePagePublic from "./pages/ProfilePagePublic";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";

library.add(solidHeart, regularHeart);

// Komponen wrapper untuk Navbar
const NavbarWrapper = () => {
  const location = useLocation();
  const showNavbar = location.pathname === "/" || location.pathname === "/admin-dashboard";
  
  return showNavbar ? <Navbar /> : null;
};

const App = () => {
  return (
    <Router>
      <NavbarWrapper />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:id" element={<ProfilePagePublic />} />
        <Route path="/admin-dashboard" element={<DashboardAdmin />} />
        <Route path="/album/:albumId" element={<AlbumDetailPage />} />
        <Route path="/gallery/:id" element={<Deskripsi />} />
      </Routes>
    </Router>
  );
};

export default App;