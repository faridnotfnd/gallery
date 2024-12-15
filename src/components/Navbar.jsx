import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Periksa token di localStorage saat aplikasi dimuat
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [location]);

  const handleLogout = () => {
    // Hapus token dan data pengguna, ubah status login
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    navigate("/"); // Kembali ke halaman Home
  };

  // Hanya tampilkan Navbar jika di halaman '/'
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

        {/* Tombol navigasi di kanan */}
        <div className="space-x-4 flex items-center">
          {isLoggedIn ? (
            <>
              {/* Link "Buat" untuk membuat album */}
              <Link 
              to="/create-album"
              className="text-sm text-gray-700 hover:text-blue-600 font-medium">
                Buat Album
              </Link>
              {/* Link "Upload" untuk mengakses galeri pribadi */}
              <Link
                to="/my-galleries"
                className="text-sm text-gray-700 hover:text-blue-600 font-medium">
                Upload
              </Link>
              {/* Tombol Logout */}
              <button
                onClick={() => {
                  if (window.confirm("Yakin anda ingin Logout?")) {
                    // Konfirmasi logout
                    handleLogout(); // Panggil fungsi logout
                    navigate("/"); // Redirect ke halaman utama
                  }
                }}
                className="text-sm text-red-500 hover:text-red-700 font-medium">
                Logout
              </button>
            </>
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
