import React, { useEffect, useState } from "react";
import axios from "axios";
import localforage from "localforage";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import InfiniteScroll from "react-infinite-scroll-component";
import { motion } from "framer-motion";
import Masonry from "react-masonry-css";
import { ThreeDot } from "react-loading-indicators";
import Navbar from "./Navbar";

const GalleryList = () => {
  const [galleries, setGalleries] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredGalleries, setFilteredGalleries] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [imageUrls, setImageUrls] = useState({});
  const limit = 15;

  const handleSearch = (query) => {
    setIsSearching(true);
    setSearchQuery(query);

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
    if (searchQuery && galleries.length > 0) {
      handleSearch(searchQuery);
    } else {
      setFilteredGalleries(galleries);
    }
  }, [galleries, searchQuery]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    // Reset state saat mount
    setPage(1);
    setGalleries([]);
    setFilteredGalleries([]);
    setHasMore(true);

    fetchGalleries();

    // Cleanup function
    return () => {
      setGalleries([]);
      setFilteredGalleries([]);
    };
  }, []);

  // Fungsi untuk cache gambar
  const cacheImages = async (galleries) => {
    if (!Array.isArray(galleries)) return;

    const cachePromises = galleries.map(async (gallery) => {
      if (!gallery?.image_url) return;

      const imageUrl = `http://localhost:5000/${gallery.image_url}`;
      const cacheKey = `image_${gallery.id}`;

      try {
        // Cek apakah gambar sudah ada di cache
        const cachedImage = await localforage.getItem(cacheKey);
        if (!cachedImage) {
          const response = await fetch(imageUrl);
          if (!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);
          const blob = await response.blob();
          await localforage.setItem(cacheKey, blob);
          console.log(`Successfully cached image ${gallery.id}`);
        }
      } catch (error) {
        console.error(`Failed to cache image ${gallery.id}:`, error);
      }
    });

    await Promise.allSettled(cachePromises);
  };

  // Update fetchGalleries to include caching
  const fetchGalleries = async () => {
    try {
      const nextPage = page;
      const cacheKey = `galleries_page_${nextPage}`;

      // Online fetch
      try {
        const response = await axios.get(
          `http://localhost:5000/api/galleries?page=${nextPage}&limit=${limit}&t=${Date.now()}`
        );

        // Cache data dan gambar
        await localforage.setItem(cacheKey, response.data);
        await cacheImages(response.data.galleries);

        setGalleries(prev => {
          const existingIds = new Set(prev.map(gallery => gallery.id));
          const newGalleries = response.data.galleries.filter(
            gallery => !existingIds.has(gallery.id)
          );
          return [...prev, ...newGalleries];
        });

        setHasMore(nextPage < response.data.totalPages);
        setPage(prev => prev + 1);
        return;
      } catch (error) {
        console.log("Failed to fetch new data, trying cache...");
      }

      // Offline/fallback: ambil dari cache
      const cachedData = await localforage.getItem(cacheKey);
      if (cachedData) {
        console.log("Data diambil dari client cache");
        setGalleries(prev => {
          const existingIds = new Set(prev.map(gallery => gallery.id));
          const cachedGalleries = cachedData.galleries.filter(
            gallery => !existingIds.has(gallery.id)
          );
          return [...prev, ...cachedGalleries];
        });
        setHasMore(nextPage < cachedData.totalPages);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error in fetchGalleries:", error);
    }
  };

  useEffect(() => {
    if (galleries.length > 0) {
      cacheImages(galleries);
    }
  }, [galleries]);

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

// Fungsi untuk mendapatkan URL gambar
const getImageUrl = async (gallery) => {
  try {
    const cacheKey = `image_${gallery.id}`;
    const cachedImage = await localforage.getItem(cacheKey);
    if (cachedImage) {
      const url = URL.createObjectURL(cachedImage);
      setImageUrls(prev => ({ ...prev, [gallery.id]: url }));
      return url;
    }
    return `http://localhost:5000/${gallery.image_url}`;
  } catch (error) {
    console.error("Error getting image URL:", error);
    return `http://localhost:5000/${gallery.image_url}`;
  }
};

  // Tambahkan useEffect untuk cleanup URL objects
  useEffect(() => {
    return () => {
      Object.values(imageUrls).forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [imageUrls]);

  useEffect(() => {
    if (galleries.length > 0) {
      galleries.forEach((gallery) => {
        getImageUrl(gallery); // Pre-load and cache images
      });
    }
  }, [galleries]);

  const breakpointColumnsObj = {
    default: 6,
    1600: 5,
    1400: 4,
    1024: 3,
    768: 2,
    480: 1,
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">
            Error Loading Galleries
          </h2>
          <p className="text-gray-600 mt-2">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setPage(1);
              fetchGalleries();
            }}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
          hasMore={hasMore && !searchQuery}
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
                  src={
                    imageUrls[gallery.id] ||
                    `http://localhost:5000/${gallery.image_url}`
                  }
                  alt={gallery.title}
                  className="w-full h-auto object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                  effect="blur"
                  placeholderSrc="https://via.placeholder.com/300x400?text=Loading"
                  loading="lazy"
                  onError={async (e) => {
                    try {
                      const url = await getImageUrl(gallery);
                      e.target.src = url;
                    } catch (error) {
                      console.error("Error loading image:", error);
                      e.target.src = `http://localhost:5000/${gallery.image_url}`;
                    }
                  }}
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
