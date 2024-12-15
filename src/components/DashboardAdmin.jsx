import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DashboardAdmin = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserGalleries, setSelectedUserGalleries] = useState([]);
  const [error, setError] = useState("");
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

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-bold mb-4">All Users</h2>
          <ul className="bg-white shadow rounded-lg p-4">
            {users.map((user) => (
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
        </div>
        <div>
          <h2 className="text-xl font-bold mb-4">User Galleries</h2>
          <ul className="bg-white shadow rounded-lg p-4">
            {selectedUserGalleries.map((gallery) => (
              <li
                key={gallery.id}
                className="flex justify-between items-center py-2 border-b">
                <span>{gallery.title}</span>
                <button
                  className="text-red-500 hover:underline"
                  onClick={() =>
                    handleDeleteGallery(gallery.user_id, gallery.id)
                  }>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
