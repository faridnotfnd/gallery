import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const GalleryList = () => {
  const [galleries, setGalleries] = useState([]);

  useEffect(() => {
    const fetchGalleries = async () => {
      const userId = localStorage.getItem("userId"); // Ambil user_id dari localStorage
      const token = localStorage.getItem("token");
      if (!userId || !token) {
        console.error("User not authenticated.");
        return;
      }
      try {
        const response = await axios.get(
          `http://localhost:5000/api/galleries?user_id=${userId}`, // Filter by user_id
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setGalleries(response.data);
      } catch (error) {
        console.error("Error fetching galleries:", error);
      }
    };
    fetchGalleries();
  }, []);  

  return (
    <div className="min-h-screen bg-[#faf8f4] p-6">
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
        {galleries.map((gallery) => (
          <Link
            to={`/gallery/${gallery.id}`}
            key={gallery.id}
            className="relative group overflow-hidden rounded-lg border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md"
          >
            <img
              src={`http://localhost:5000/${gallery.image_url}`}
              alt={gallery.title}
              className="w-full h-auto object-cover rounded-md transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-white/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default GalleryList;