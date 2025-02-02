import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Dropzone from "react-dropzone";
import { faPaperPlane, faX } from "@fortawesome/free-solid-svg-icons";
import {
  faArrowRightFromBracket,
  faHouse,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [galleries, setGalleries] = useState([]);
  const [activeTab, setActiveTab] = useState("gallery"); // 'gallery' or 'album'
  const [albums, setAlbums] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isUser, setIsUser] = useState(false); // Menambahkan state untuk memeriksa role user
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState(""); // Tambahkan ini di bagian state

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
        `http://localhost:5000/api/galleries/${userId}}`,
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

  const handleUpload = async (e) => {
    e.preventDefault();

    // Validasi input
    if (!title.trim()) {
      setError("Judul harus diisi!");
      return;
    }

    if (selectedFiles.length === 0) {
      setError("Silakan pilih gambar sebelum mengupload!");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description || ""); // Deskripsi opsional
    selectedFiles.forEach((file) => {
      formData.append("image", file);
    });

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/galleries", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Tutup modal setelah upload berhasil
      setShowUploadModal(false);

      // Tunggu modal tertutup sebelum refresh halaman
      setTimeout(() => {
        window.location.reload();
      }, 300);
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Gagal mengupload gambar, coba lagi!");
    }
  };

  // Menampilkan preview gambar setelah memilih file
  const handleDrop = (acceptedFiles) => {
    setSelectedFiles(acceptedFiles);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    navigate("/");
    window.location.reload();
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
        <button
          onClick={() => setShowLogoutModal(true)}
          className="text-gray-600 hover:bg-gray-200 px-3  py-3 rounded-full text-sm font-medium">
          <FontAwesomeIcon
            icon={faArrowRightFromBracket}
            className="w-6 h-6"
          />
        </button>
      </div>

      {/* Modal Logout */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setShowLogoutModal(false)}>
          <div
            className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full text-center"
            onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold">Konfirmasi Logout</h2>
            <p className="text-gray-600 mt-2">
              Apakah Anda yakin ingin logout?
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-full hover:bg-gray-400">
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-700">
                {" "}
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Konten dengan margin */}
      <div className="flex-1 p-6">
        {/* Profile Section */}
        <div className="flex flex-col items-center py-6">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
            alt="Profile"
            className="w-40 h-40 rounded-full border border-gray-300 mb-4"
          />
          <h2 className="text-2xl font-medium text-gray-800">{username}</h2>
          <div className="flex space-x-6 mt-4">
            <button
              onClick={() => setShowUploadModal(true)}
              className="text-sm bg-gray-800 px-12 py-3 rounded-full text-gray-100 font-medium">
              Upload
            </button>
            <button
              onClick={() => navigate("/create-album")}
              className="text-sm bg-gray-800 px-8 py-3 rounded-full text-gray-100 font-medium">
              Buat Album
            </button>
          </div>
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

        {/* Modal Upload */}
        {showUploadModal && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            onClick={() => setShowUploadModal(false)}>
            <div
              className="relative bg-white p-6 rounded-xl shadow-lg max-w-md w-full text-center"
              onClick={(e) => e.stopPropagation()}>
              {/* Tombol Close (X) di pojok kiri atas */}
              <FontAwesomeIcon
                icon={faX}
                className="absolute top-4 right-4 w-4 h-5 text-gray-600 hover:bg-gray-200 px-2 py-1 rounded-full text-xl cursor-pointer"
                onClick={() => setShowUploadModal(false)}
              />

              <h2 className="text-lg font-semibold mb-4">Upload Gambar</h2>

              {/* Input Title */}
              <input
                type="text"
                placeholder="Judul"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Input Description */}
              <textarea
                placeholder="Deskripsi (Opsional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"></textarea>

              {/* Pesan Error Jika Ada */}
              {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

              {/* Kondisi untuk menampilkan Dropzone atau Preview */}
              {selectedFiles.length === 0 ? (
                // Dropzone muncul jika belum ada file yang dipilih
                <Dropzone onDrop={handleDrop}>
                  {({ getRootProps, getInputProps }) => (
                    <div
                      {...getRootProps()}
                      className="border-2 border-dashed p-16 rounded-lg cursor-pointer bg-gray-100">
                      <input {...getInputProps()} />
                      <p className="text-gray-500">
                        Seret dan lepaskan file di sini atau klik untuk memilih
                      </p>
                    </div>
                  )}
                </Dropzone>
              ) : (
                // Preview muncul setelah file dipilih
                <div className="flex flex-col items-center">
                  <img
                    src={URL.createObjectURL(selectedFiles[0])}
                    alt="Preview"
                    className="w-40 h-40 object-cover rounded-md mb-4"
                  />
                  <button
                    onClick={() => setSelectedFiles([])}
                    className="text-blue-500 text-sm">
                    Ganti Gambar
                  </button>
                </div>
              )}

              {/* Tombol Upload */}
              <button
                onClick={handleUpload}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-700">
                Upload
              </button>
            </div>
          </div>
        )}

        {/* Gallery Section (Masonry Layout) */}
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
              <div className="ww-full flex justify-center items-center">
                <p className="text-gray-500 text-lg font-medium">
                  Belum ada foto
                </p>
              </div>
            )}
          </div>
        )}

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
                  Belum membuat album
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
