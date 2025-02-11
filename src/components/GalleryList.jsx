import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component"; // Import LazyLoadImage
import "react-lazy-load-image-component/src/effects/blur.css"; // Import effect
import InfiniteScroll from "react-infinite-scroll-component"; // Tambahkan infinite scroll
import { motion } from "framer-motion"; // Import framer-motion
import Masonry from "react-masonry-css";

const GalleryList = () => {
  const [galleries, setGalleries] = useState([]);
  const [page, setPage] = useState(1); // Mulai dari 0
  const [hasMore, setHasMore] = useState(true); // State apakah masih ada data
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [showModal, setShowModal] = useState(false); // State untuk modal
  const navigate = useNavigate();
  const limit = 12; // Menampilkan gambar per halaman

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (token) {
      axios
        .get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setIsUser(response.data.role === "user");
        })
        .catch((error) => console.error("Error fetching user role:", error));
    }
    setPage(0); // Reset page ke 0
    setGalleries([]); // Reset galleries
    fetchGalleries(); // Panggil fetch pertama kali
  }, []);

  const fetchGalleries = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/galleries?page=${page}&limit=${limit}`
      );
      
      console.log('Fetched data:', response.data); // Untuk debugging

      const { galleries: newGalleries, totalPages } = response.data;

      setGalleries((prev) => {
        const existingIds = new Set(prev.map((gallery) => gallery.id));
        const filteredGalleries = newGalleries.filter(
          (gallery) => !existingIds.has(gallery.id)
        );
        return [...prev, ...filteredGalleries];
      });

      setHasMore(page < totalPages);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error("Error fetching galleries:", error);
    }
  };

  const handleGalleryClick = (galleryId) => {
    if (!isLoggedIn) {
      setShowModal(true);
      return;
    }
    navigate(`/gallery/${galleryId}`);
  };

  const handleLogin = () => {
    navigate("/login");
    setShowModal(false);
  };

  const closeModal = (e) => {
    if (e.target === e.currentTarget) {
      setShowModal(false);
    }
  };

  const breakpointColumnsObj = {
    default: 5,
    1400: 4,
    1300: 3,
    800: 2,
    700: 1,
  };
  return (
    <div className="min-h-screen bg-[#faf8f4] p-6 pt-20">
      <InfiniteScroll
        dataLength={galleries.length}
        next={fetchGalleries}
        hasMore={hasMore}
        loader={<p className="text-center text-gray-600">Loading...</p>}>
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="flex gap-6 w-full"
          columnClassName="masonry-column flex flex-col gap-6 w-full">
          {galleries.map((gallery) => (
            <motion.div
              key={gallery.id}
              onClick={() => handleGalleryClick(gallery.id)}
              className="relative group overflow-hidden rounded-xl transition-all duration-300 hover:cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}>
              <LazyLoadImage
                key={gallery.id}
                src={`http://localhost:5000/${gallery.image_url}`}
                alt={gallery.title}
                className="w-full h-auto object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                effect="blur"
                loading="lazy"
              />

              <div className="absolute inset-0 bg-white/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <p className="text-lg font-semibold text-gray-800">
                  {gallery.title}
                </p>
              </div>
            </motion.div>
          ))}
        </Masonry>
      </InfiniteScroll>

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
          onClick={closeModal}>
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full text-center">
            <h2 className="text-lg font-semibold">Unable to View Gallery</h2>
            <p className="text-gray-600 mt-2">
              Silakan login untuk melihat detail galeri.
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={handleLogin}
                className="px-4 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-900">
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
