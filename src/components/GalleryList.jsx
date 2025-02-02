import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component"; // Import LazyLoadImage
import "react-lazy-load-image-component/src/effects/blur.css"; // Import effect

const GalleryList = () => {
  const [galleries, setGalleries] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [showModal, setShowModal] = useState(false); // State untuk modal
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (token) {
      axios
        .get("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setIsUser(response.data.role === "user");
        })
        .catch((error) => {
          console.error("Error fetching user role:", error);
        });
    }

    const fetchGalleries = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/galleries", {
          headers: {
            Authorization: `Bearer ${token}`,
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
      setShowModal(true); // Tampilkan modal untuk login
      return;
    }
    navigate(`/gallery/${galleryId}`);
  };

  const handleLogin = () => {
    // Arahkan ke halaman login
    navigate("/login");
    setShowModal(false); // Tutup modal setelah redirect
  };

  const closeModal = (e) => {
    // Cek apakah klik dilakukan di luar modal
    if (e.target === e.currentTarget) {
      setShowModal(false);
    }
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
            {/* LazyLoadImage untuk gambar dengan efek blur saat loading */}
            <LazyLoadImage
              src={`http://localhost:5000/${gallery.image_url}`}
              alt={gallery.title}
              className="w-full h-auto object-cover rounded-md transition-transform duration-300 group-hover:scale-105"
              effect="blur" // Efek blur saat gambar dimuat
              loading="lazy" // Mengaktifkan lazy loading native
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

      {/* Modal untuk login */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={closeModal}
        >
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full text-center">
            <h2 className="text-lg font-semibold">Unable to View Gallery</h2>
            <p className="text-gray-600 mt-2">Silakan login untuk melihat detail galeri.</p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={handleLogin}
                className="px-4 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-900"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryList;