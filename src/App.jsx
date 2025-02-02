import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import DashboardAdmin from "./pages/AdminDashboard"; // You'll need to create this component
import Login from "./pages/Login";
import Home from "./pages/Home";
import Deskripsi from "./pages/Deskripsi";
import Register from "./pages/Register";
import CreateAlbum from "./pages/BuatAlbum";
import EditAlbum from "./pages/EditAlbum";
import ProfilePage from "./pages/ProfilePage";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";

// Tambahkan ikon yang digunakan ke library
library.add(solidHeart, regularHeart);

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} /> {/* Home sebagai halaman utama */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create-album" element={<CreateAlbum />} />
        <Route path="/edit-album/:id" element={<EditAlbum />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin-dashboard" element={<DashboardAdmin />} />

        <Route path="/gallery/:id" element={<Deskripsi />} />
      </Routes>
    </Router>
  );
};

export default App;
