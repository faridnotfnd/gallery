import React, { useEffect, useState } from "react";
import axios from "axios";

const GalleryList = () => {
  const [galleries, setGalleries] = useState([]);

  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/galleries");
        setGalleries(response.data);
      } catch (error) {
        console.error("Error fetching galleries:", error);
      }
    };
    fetchGalleries();
  }, []);

  return (
    <div className="p-4">
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {galleries.map((gallery) => (
          <div
            key={gallery.id}
            className="relative overflow-hidden rounded-lg shadow-lg break-inside p-2 hover:shadow-2xl transition-shadow duration-300"
          >
            <img
              src={`http://localhost:5000/${gallery.image_url}`}
              alt={gallery.title}
              className="w-full h-auto object-cover rounded-md hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GalleryList;