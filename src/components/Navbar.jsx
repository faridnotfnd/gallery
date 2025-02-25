import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Navbar = ({ showModal, onSearch }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");
    setIsLoggedIn(!!token);
    setIsAdmin(userRole === "admin");
    console.log("Current user role:", userRole); // untuk debugging

    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }

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
    }, 50);
  }, [location, onSearch, navigate]);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (typeof onSearch === "function") {
      onSearch(query);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (typeof onSearch === "function") {
        onSearch(searchQuery);
      }
    }
  };

  const renderSearchBar = () => {
    if (location.pathname === "/") {
      return (
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
      );
    }
    return null;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    navigate("/");
    window.location.reload();
  };

  return (
    <nav className="fixed top-0 left-0 w-full p-4 z-50 bg-[#faf8f4] bg-opacity-95">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          to="/"
          className="flex items-center border border-violet-100 px-3 py-1.5 rounded-full">
          <h2 className="text-xl font-lora">Cavallery</h2>
        </Link>

        {renderSearchBar()}

        <div className="space-x-4 flex items-center">
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <div
                className="flex items-center space-x-3 cursor-pointer border border-violet-100 px-2 py-1.5 rounded-full"
                onClick={() => navigate("/profile")}>
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
                  alt="Profil"
                  className="w-8 h-8 rounded-full border border-gray-300"
                />
                <span className="text-base text-gray-700 font-medium">
                  {username}
                </span>
              </div>
              {location.pathname === "/admin-dashboard" ? (
                <Link
                  to="/"
                  className="text-sm bg-blue-600 px-4 py-2 rounded-full text-white hover:bg-blue-700">
                  Galeri
                </Link>
              ) : isAdmin && location.pathname === "/" ? (
                <Link
                  to="/admin-dashboard"
                  className="text-sm bg-purple-600 px-4 py-2 rounded-full text-white hover:bg-purple-700">
                  Dashboard Admin
                </Link>
              ) : null}
              {isAdmin && (
                <button
                onClick={() => setShowLogoutModal(true)}
                  className="text-sm bg-red-600 px-4 py-2 rounded-full text-white hover:bg-red-700">
                  Logout
                </button>
              )}
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

        {/* Modal Logout */}
        {showLogoutModal && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            onClick={() => setShowLogoutModal(false)}>
            <div
              className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full text-center"
              onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-semibold">Konfirmasi Logout</h2>
              <p className="text-gray-600 mt-2">
                Apakah Anda yakin ingin logout?
              </p>
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded-full hover:bg-gray-400">
                  Batal
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-700">
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
