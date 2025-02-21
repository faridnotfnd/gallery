import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Navbar = ({ showModal, onSearch }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }

    // Gunakan setTimeout hanya untuk memproses pencarian setelah navigasi
    setTimeout(() => {
      const pendingSearch = localStorage.getItem("pendingCategorySearch");
      if (pendingSearch && typeof onSearch === "function") {
        console.log("Processing pending category search:", pendingSearch);
        setSearchQuery(pendingSearch);
        onSearch(pendingSearch);
        localStorage.removeItem("pendingCategorySearch");
      } else if (
        location.state?.searchQuery &&
        typeof onSearch === "function"
      ) {
        console.log(
          "Received search query from navigation:",
          location.state.searchQuery
        );
        setSearchQuery(location.state.searchQuery);
        onSearch(location.state.searchQuery);

        setTimeout(() => {
          navigate(location.pathname, { replace: true, state: {} });
        }, 100);
      }
    }, 50); // Tambahkan delay kecil agar localStorage terbaca dengan benar
  }, [location, onSearch, navigate]); // ✅ Ini adalah cara yang benar!

  // Jika tidak berada di halaman root, tidak perlu menampilkan navbar
  if (location.pathname !== "/") {
    return null;
  }

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    // Pastikan onSearch adalah fungsi sebelum dipanggil
    if (typeof onSearch === "function") {
      onSearch(query);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Pastikan onSearch adalah fungsi sebelum dipanggil
      if (typeof onSearch === "function") {
        onSearch(searchQuery);
      }
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full p-4 z-50 ${
        showModal ? "bg-opacity-70 bg-[#faf8f4]" : "bg-[#faf8f4]"
      }`}>
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <h2 className="text-xl font-lora">Cavallery</h2>
        </Link>

        <div className="flex-1 mx-4">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            onKeyDown={handleKeyPress}
            placeholder="Telusuri Galeri"
            className="w-full p-2.5 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm text-gray-600"
          />
        </div>

        <div className="space-x-4 flex items-center">
          {isLoggedIn ? (
            <div
              className="flex items-center space-x-3 cursor-pointer border border[#ecfdf5] px-2 py-1.5 rounded-full"
              onClick={() => navigate("/profile")}>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
                alt="Profil"
                className="w-8 h-8 rounded-full border border-gray-300"
              />
              <span className="text-base text-gray-70 font-medium">
                {username}
              </span>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm bg-gray-800 border-2 border-gray-800 px-6 py-2 rounded-full text-gray-100 font-medium">
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm border-[2.5px] border-gray-800 px-6 py-2 rounded-full text-gray-900 hover:text-white hover:bg-gray-900 font-medium">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
