import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    // Ambil username dari localStorage jika tersedia
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, [location]);

  if (location.pathname !== "/") {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 w-full bg-[#faf8f4] p-4 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo di kiri */}
        <Link to="/" className="flex items-center">
          <h2 className="text-xl font-lora">Cavallery</h2>
        </Link>

        {/* Search bar di tengah */}
        <div className="flex-1 mx-4">
          <input
            type="text"
            placeholder="Telusuri Galeri"
            className="w-full p-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm text-gray-600"
          />
        </div>

        {/* Navigasi di kanan */}
        <div className="space-x-4 flex items-center">
          {isLoggedIn ? (
            <div className="flex items-center space-x-2">
              {/* Gambar Profil */}
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
                alt="Profil"
                className="w-8 h-8 rounded-full border border-gray-300 cursor-pointer"
                title="Klik untuk ke halaman Profile"
                onClick={() => navigate("/profile")}
              />
              {/* Username */}
              <span
                onClick={() => navigate("/profile")}
                className="text-sm text-gray-700 font-medium cursor-pointer">
                {username}
              </span>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-sm text-gray-700 hover:text-blue-600 font-medium">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
