import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const ProfilePagePublic = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [galleries, setGalleries] = useState([]);
  const [activeTab, setActiveTab] = useState("gallery"); // 'gallery' or 'album'
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/users/${id}`
        );
        setUsername(response.data.username);
        setGalleries(response.data.galleries || []);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    if (id) {
      fetchUserProfile();
    }
  }, [id]);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/albums/user/${id}`
        );
        setAlbums(response.data);
      } catch (error) {
        console.error("Error fetching albums:", error);
      }
    };

    fetchAlbums();
  }, [id]);

  const handleGalleryClick = (galleryId) => {
    navigate(`/gallery/${galleryId}`);
  };

  return (
    <div className="bg-[#faf8f4] min-h-screen flex flex-col">
      {/* Navbar */}
      <div className="flex justify-between items-center p-4 bg-[#faf8f4]">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:bg-gray-200 px-3 py-3 rounded-full text-sm font-medium">
          <FontAwesomeIcon icon={faArrowLeft} className="w-6 h-6" />
        </button>
      </div>

      {/* Konten */}
      <div className="flex-1 p-6">
        {/* Profile Section */}
        <div className="flex flex-col items-center py-6">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
            alt="Profile"
            className="w-40 h-40 rounded-full border border-gray-300 mb-4"
          />
          <h2 className="text-2xl font-medium text-gray-800">{username}</h2>
        </div>

        {/* Tab Section */}
        <div className="flex justify-center mb-4">
          <button
            className={`text-base font-medium py-2 px-4 border-b-2 ${
              activeTab === "gallery" ? "border-black" : "border-transparent"
            }`}
            onClick={() => setActiveTab("gallery")}>
            Galeri
          </button>
          <button
            className={`text-base font-medium py-2 px-4 border-b-2 ${
              activeTab === "album" ? "border-black" : "border-transparent"
            }`}
            onClick={() => setActiveTab("album")}>
            Album
          </button>
        </div>

        {/* Gallery Section */}
        {activeTab === "gallery" && (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
            {galleries.length > 0 ? (
              galleries.map((gallery) => (
                <div
                  key={gallery.id}
                  onClick={() => handleGalleryClick(gallery.id)}
                  className="relative group overflow-hidden rounded-lg border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer">
                  <img
                    src={`http://localhost:5000/${gallery.image_url}`}
                    alt={gallery.title}
                    className="w-full h-auto object-cover rounded-md transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-white/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <p className="text-lg font-semibold text-gray-800">
                      {gallery.title}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full flex justify-center items-center">
                <p className="text-gray-500 text-lg font-medium">
                  Pengguna ini belum memiliki galeri.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Album Section */}
        {activeTab === "album" && (
          <div className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {albums.length > 0 ? (
              albums.map((album) => (
                <div
                  key={album.id}
                  className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/album/${album.id}`)}>
                  <div className="aspect-w-16 aspect-h-12 bg-gray-100">
                    <img
                      src={
                        album.cover_photo ||
                        "https://via.placeholder.com/300x200"
                      }
                      alt={album.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900">{album.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {album.description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full h-full flex justify-center items-center">
                <p className="text-gray-500 text-lg font-medium">
                  Pengguna ini belum memiliki album.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePagePublic;
