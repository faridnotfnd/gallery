import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";

const DashboardAdmin = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserGalleries, setSelectedUserGalleries] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [galleriesPage, setGalleriesPage] = useState(1);
  const usersPerPage = 10;
  const galleriesPerPage = 20;
  const navigate = useNavigate();

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

  // DashboardAdmin.jsx
  const fetchUserGalleries = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/admin/users/${userId}/galleries`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Tambahkan pengecekan response
      if (response.data) {
        setSelectedUserGalleries(response.data);
        setGalleriesPage(1);
      }
    } catch (err) {
      console.error("Error fetching galleries:", err);
      setError(err.response?.data?.message || "Error fetching galleries.");
      setSelectedUserGalleries([]); // Reset galleries jika error
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://localhost:5000/admin/users/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Refresh data hanya jika delete berhasil
      if (response.status === 200) {
        fetchUsers();
        setSelectedUserGalleries([]); // Reset galleries view
        setError(""); // Clear error message
        alert("User deleted successfully");
      }
    } catch (err) {
      console.error("Delete user error details:", err.response?.data);
      setError(err.response?.data?.message || "Failed to delete user");
    }
  };

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const indexOfLastGallery = galleriesPage * galleriesPerPage;
  const indexOfFirstGallery = indexOfLastGallery - galleriesPerPage;
  const currentGalleries = selectedUserGalleries.slice(
    indexOfFirstGallery,
    indexOfLastGallery
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6 pt-24">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
    </div>
  );
};

export default DashboardAdmin;
