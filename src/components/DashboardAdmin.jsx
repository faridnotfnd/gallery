import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const DashboardAdmin = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserGalleries, setSelectedUserGalleries] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [galleriesPage, setGalleriesPage] = useState(1);
  const usersPerPage = 10;
  const galleriesPerPage = 20;
  const navigate = useNavigate();

  // Ambil daftar semua pengguna
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err) {
      setError("Error fetching users.");
    }
  };

  // Ambil galeri dari pengguna tertentu
  const fetchUserGalleries = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/admin/users/${userId}/galleries`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedUserGalleries(response.data);
      setGalleriesPage(1);
    } catch (err) {
      setError("Error fetching galleries.");
    }
  };

  // Hapus pengguna dan galeri mereka
  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
      alert("User and their galleries deleted successfully.");
    } catch (err) {
      setError("Error deleting user.");
    }
  };

  // Hapus galeri spesifik
  const handleDeleteGallery = async (userId, galleryId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/admin/users/${userId}/galleries/${galleryId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUserGalleries(userId);
      alert("Gallery deleted successfully.");
    } catch (err) {
      setError("Error deleting gallery.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Pagination untuk Users
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  // Pagination untuk Galleries
  const indexOfLastGallery = galleriesPage * galleriesPerPage;
  const indexOfFirstGallery = indexOfLastGallery - galleriesPerPage;
  const currentGalleries = selectedUserGalleries.slice(
    indexOfFirstGallery,
    indexOfLastGallery
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daftar Pengguna */}
        <div>
          <h2 className="text-xl font-bold mb-4">All Users</h2>
          <ul className="bg-white shadow rounded-lg p-4">
            {currentUsers.map((user) => (
              <li
                key={user.id}
                className="flex justify-between items-center py-2 border-b">
                <span>
                  {user.username} ({user.email})
                </span>
                <div>
                  <button
                    className="text-blue-500 hover:underline mr-4"
                    onClick={() => fetchUserGalleries(user.id)}>
                    View Galleries
                  </button>
                  <button
                    className="text-red-500 hover:underline"
                    onClick={() => handleDeleteUser(user.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination untuk Users */}
          <div className="flex justify-center mt-4 items-center space-x-2">
            <button
              className={`px-4 py-2 border rounded ${
                currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}>
              Prev
            </button>

            <span className="text-sm font-semibold">{currentPage}</span>

            <button
              className={`px-4 py-2 border rounded ${
                indexOfLastUser >= users.length
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={indexOfLastUser >= users.length}>
              Next
            </button>
          </div>
        </div>

        {/* Galeri Pengguna */}
        <div>
          <h2 className="text-xl font-bold mb-4">User Galleries</h2>
          <ul className="bg-white shadow rounded-lg p-4 grid grid-cols-2 gap-4">
            {currentGalleries.map((gallery) => (
              <li key={gallery.id} className="flex flex-col items-center">
                <img
                  src={`http://localhost:5000/${gallery.image_url}`}
                  alt={gallery.title}
                  className="w-32 h-32 object-cover rounded-lg shadow"
                />
                <span className="text-sm mt-2">{gallery.title}</span>
                <button
                  className="text-red-500 hover:underline mt-2"
                  onClick={() =>
                    handleDeleteGallery(gallery.user_id, gallery.id)
                  }>
                  Delete
                </button>
              </li>
            ))}
          </ul>

          {/* Pagination untuk Galleries */}
          {selectedUserGalleries.length > galleriesPerPage && (
            <div className="flex justify-center mt-4 items-center space-x-2">
              <button
                className={`px-4 py-2 border rounded ${
                  galleriesPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => setGalleriesPage(galleriesPage - 1)}
                disabled={galleriesPage === 1}>
                Prev
              </button>

              <span className="text-sm font-semibold">{galleriesPage}</span>

              <button
                className={`px-4 py-2 border rounded ${
                  indexOfLastGallery >= selectedUserGalleries.length
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={() => setGalleriesPage(galleriesPage + 1)}
                disabled={indexOfLastGallery >= selectedUserGalleries.length}>
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
