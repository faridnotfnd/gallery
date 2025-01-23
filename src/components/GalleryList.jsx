import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const GalleryList = () => {
  const [galleries, setGalleries] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isUser, setIsUser] = useState(false); // Menambahkan state untuk memeriksa role user
  const navigate = useNavigate(); // Untuk navigasi

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token); // Menentukan status login pengguna

    // Memeriksa apakah user adalah user atau guest
    if (token) {
      axios
        .get("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setIsUser(response.data.role === "user"); // Mengatur role user jika role-nya adalah 'user'
        })
        .catch((error) => {
          console.error("Error fetching user role:", error);
        });
    }

    const fetchGalleries = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/galleries", {
          headers: {
            Authorization: `Bearer ${token}`, // Kirim token jika login
          },
        });
        setGalleries(response.data);
      } catch (error) {
        console.error("Error fetching galleries:", error);
      }
    };

    fetchGalleries();
  }, []);

  const handleGalleryClick = (galleryId) => {
    if (!isLoggedIn) {
      alert("Silakan login untuk melihat detail galeri.");
      navigate("/login"); // Arahkan ke halaman login jika belum login
      return;
    }
    navigate(`/gallery/${galleryId}`); // Arahkan ke detail galeri jika sudah login
  };

  return (
    <div className="min-h-screen bg-[#faf8f4] p-6">
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
        {galleries.map((gallery) => (
          <div
            key={gallery.id}
            onClick={() => handleGalleryClick(gallery.id)}
            className="relative group overflow-hidden rounded-lg border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer"
          >
            <img
              src={`http://localhost:5000/${gallery.image_url}`}
              alt={gallery.title}
              className="w-full h-auto object-cover rounded-md transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-white/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <p className="text-lg font-semibold text-gray-800">{gallery.title}</p>
            </div>
          </div>
        ))}
      </div>

      {isUser && (
        <div className="mt-4 text-center">
          <Link to="/dashboard" className="text-blue-500 hover:text-blue-700">
            Upload New Gallery
          </Link>
        </div>
      )}
    </div>
  );
};

export default GalleryList;