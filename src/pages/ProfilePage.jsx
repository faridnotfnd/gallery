import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faHouse,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [galleries, setGalleries] = useState([]);
  const [activeTab, setActiveTab] = useState("gallery"); // 'gallery' or 'album'
  const [albums, setAlbums] = useState([]);

  const [isUser, setIsUser] = useState(false); // Menambahkan state untuk memeriksa role user

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    // Ambil username dan userId dari localStorage
    const storedUsername = localStorage.getItem("username");
    const userId = localStorage.getItem("userId");

    if (storedUsername) {
      setUsername(storedUsername);
    }

    if (userId) {
      fetchUserGalleries(userId);
    }

    const fetchGalleries = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/galleries/my-galleries",
          {
            headers: {
              Authorization: `Bearer ${token}`, // Kirim token jika login
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

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        const response = await axios.get(
          `http://localhost:5000/api/albums/user/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAlbums(response.data);
      } catch (error) {
        console.error("Error fetching albums:", error);
      }
    };

    fetchAlbums();
  }, []);

  const handleGalleryClick = (galleryId) => {
    navigate(`/gallery/${galleryId}`); // Arahkan ke detail galeri
  };

  const fetchUserGalleries = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/galleries/${id}}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setGalleries(response.data);
    } catch (error) {
      console.error("Error fetching user galleries:", error);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Yakin ingin logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("username");
      navigate("/");
      window.location.reload();
    }
  };

  return (
    <div className="bg-[#faf8f4] min-h-screen flex flex-col">
      {/* Navbar */}
      <div className="flex justify-between items-center p-4 bg-[#faf8f4]">
        <button
          onClick={() => navigate("/")}
          className="text-gray-600 hover:text-gray-900 text-sm font-medium">
          <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
        </button>
        <button
          onClick={handleLogout}
          className="text-gray-600 hover:text-red-500 text-sm font-medium">
          <FontAwesomeIcon icon={faArrowRightFromBracket} className="w-4 h-4" />
        </button>
      </div>

      {/* Konten dengan margin */}
      <div className="flex-1 p-6">
        {/* Profile Section */}
        <div className="flex flex-col items-center py-6">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
            alt="Profile"
            className="w-32 h-32 rounded-full border border-gray-300 mb-4"
          />
          <h2 className="text-lg font-medium text-gray-800">{username}</h2>
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-gray-200 hover:bg-gray-300 text-sm font-medium py-2 px-4 rounded-lg">
              Upload
            </button>
            <button
              onClick={() => navigate("/create-album")}
              className="bg-gray-200 hover:bg-gray-300 text-sm font-medium py-2 px-4 rounded-lg">
              Buat Album
            </button>
          </div>
        </div>

        {/* Tab Section */}
        <div className="flex justify-center border-b border-gray-300 mb-4">
          <button
            className={`text-sm font-medium py-2 px-4 border-b-2 ${
              activeTab === "gallery" ? "border-black" : "border-transparent"
            }`}
            onClick={() => setActiveTab("gallery")}>
            Galeri
          </button>
          <button
            className={`text-sm font-medium py-2 px-4 border-b-2 ${
              activeTab === "album" ? "border-black" : "border-transparent"
            }`}
            onClick={() => setActiveTab("album")}>
            Album
          </button>
        </div>

        {/* Gallery Section (Masonry Layout) */}
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
          {galleries.map((gallery) => (
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
          ))}
        </div>
        {/* Content Section */}
        {activeTab === "gallery" ? (
          // Your existing gallery grid
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
            {/* ... existing gallery content ... */}
          </div>
        ) : (
          // New Album Grid
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {albums.map((album) => (
              <div
                key={album.id}
                className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/album/${album.id}`)}>
                <div className="aspect-w-16 aspect-h-12 bg-gray-100">
                  {/* You'll need to add a thumbnail or cover photo field to your album model */}
                  <img
                    src={
                      album.cover_photo || "https://via.placeholder.com/300x200"
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
                  {/* You might want to add photo count here */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
