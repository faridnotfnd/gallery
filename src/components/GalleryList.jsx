import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component"; // Import LazyLoadImage
import "react-lazy-load-image-component/src/effects/blur.css"; // Import effect
import InfiniteScroll from "react-infinite-scroll-component"; // Tambahkan infinite scroll
import { motion } from "framer-motion"; // Import framer-motion
import Masonry from "react-masonry-css";
import { ThreeDot } from "react-loading-indicators";
import Navbar from "./Navbar";

const GalleryList = () => {
  const [galleries, setGalleries] = useState([]);
  const [page, setPage] = useState(1); // Mulai dari 0
  const [hasMore, setHasMore] = useState(true); // State apakah masih ada data
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [showModal, setShowModal] = useState(false); // State untuk modal
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]); // Menyimpan daftar kategori
  const [selectedCategory, setSelectedCategory] = useState(""); // Menyimpan kategori yang dipilih
  const [allGalleries, setAllGalleries] = useState([]);  // Add new state for all galleries (unfiltered)
  const [searchQuery, setSearchQuery] = useState(""); // Tambahkan state untuk query pencarian
  const [filteredGalleries, setFilteredGalleries] = useState([]);
  const [isSearching, setIsSearching] = useState(false); // State baru untuk tracking pencarian
  const limit = 15; // Menampilkan gambar per halaman

  const handleSearch = (query) => {
    setIsSearching(true); // Set status pencarian ke true
    setSearchQuery(query); // Simpan query pencarian

    if (!query.trim()) {
      setFilteredGalleries(galleries);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const filtered = galleries.filter((gallery) => {
      const titleMatch = gallery.title?.toLowerCase().includes(lowercaseQuery);
      const categoryMatch = gallery.categories?.some((category) =>
        category.name.toLowerCase().includes(lowercaseQuery)
      );
      return titleMatch || categoryMatch;
    });

    setFilteredGalleries(filtered);
  };

  useEffect(() => {
    // After galleries are updated and if we have a searchQuery, perform the filtering
    if (searchQuery && galleries.length > 0) {
      handleSearch(searchQuery);
    } else {
      setFilteredGalleries(galleries);
    }
  }, [galleries, searchQuery]);
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    setPage(0); // Reset page ke 0
    setGalleries([]); // Reset galleries
    fetchGalleries(); // Panggil fetch pertama kali
  }, []);

  useEffect(() => {
    if (searchQuery && galleries.length > 0) {
      handleSearch(searchQuery);
    } else {
      setFilteredGalleries(galleries);
    }
  }, [galleries, searchQuery]);

  useEffect(() => {
    setFilteredGalleries(galleries);
  }, [galleries]);

  const fetchGalleries = async () => {
    if (!hasMore) return; // Jangan fetch jika tidak ada data lagi

    try {
      const response = await axios.get(
        `http://localhost:5000/api/galleries?page=${page}&limit=${limit}`
      );

      const { galleries: newGalleries, totalPages } = response.data;

      setGalleries((prev) => {
        const existingIds = new Set(prev.map((gallery) => gallery.id));
        const filteredGalleries = newGalleries.filter(
          (gallery) => !existingIds.has(gallery.id)
        );

        return [...prev, ...filteredGalleries]; // Hapus pengacakan di sini!
      });

      setPage((prev) => prev + 1);
      setHasMore(page < totalPages);
    } catch (error) {
      console.error("Error fetching galleries:", error);
      setHasMore(false);
    }
  };

  useEffect(() => {
    const handleNewImage = (event) => {
      setGalleries((prev) => {
        const newGalleryList = [...prev, event.detail]; // Masukkan di akhir
        return newGalleryList.sort(() => Math.random() - 0.5); // Acak posisi
      });
    };

    window.addEventListener("newGalleryImage", handleNewImage);

    return () => {
      window.removeEventListener("newGalleryImage", handleNewImage);
    };
  }, []);

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
    default: 6, // Tambahkan 6 kolom untuk layar besar
    1600: 5, // Layar lebih kecil
    1400: 4, // Laptop standar
    1024: 3, // Tablet landscape
    768: 2, // Tablet portrait
    480: 1, // Ponsel
  };

  return (
    <div className="min-h-screen bg-[#faf8f4] p-6 pt-20">
      <Navbar showModal={showModal} onSearch={handleSearch} />
      {searchQuery && filteredGalleries.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20">
          <div className="bg-[#faf8f4] p-8 rounded-xl max-w-md w-full text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Tidak Ada Hasil
            </h3>
            <p className="text-gray-600">
              Maaf, kami tidak dapat menemukan galeri yang sesuai dengan
              pencarian "{searchQuery}". Silakan coba dengan kata kunci yang
              berbeda.
            </p>
          </div>
        </div>
      ) : (
        <InfiniteScroll
          dataLength={filteredGalleries.length}
          next={fetchGalleries}
          hasMore={hasMore && !searchQuery} // Disable infinite scroll saat ada query pencarian
          loader={
            !searchQuery && (
              <p className="text-center text-gray-600">
                <ThreeDot color="#374151" size="medium" text="" textColor="" />
              </p>
            )
          }
          scrollThreshold={0.9}>
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="flex gap-6 w-full"
            columnClassName="masonry-column flex flex-col gap-6 w-full">
            {filteredGalleries.map((gallery) => (
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
                  placeholderSrc="https://via.placeholder.com/300x400?text=Loading"
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
      )}

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
