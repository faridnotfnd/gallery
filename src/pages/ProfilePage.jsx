import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faX } from "@fortawesome/free-solid-svg-icons";
import {
  faArrowRightFromBracket,
  faHouse,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import imageCompression from "browser-image-compression";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [galleries, setGalleries] = useState([]);
  const [activeTab, setActiveTab] = useState("gallery");
  const [albums, setAlbums] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState("");
  const [compressedFile, setCompressedFile] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingFile, setPendingFile] = useState(null); // Menyimpan file yang akan dikompresi
  const [showCompressionModal, setShowCompressionModal] = useState(false);
  const [categories, setCategories] = useState([]); // Ubah dari string ke array
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

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

  const fetchUserGalleries = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/galleries/${userId}`,
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

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 620,
      useWebWorker: true,
      initialQuality: 0.8,
    };

    try {
      setIsCompressing(true);
      const compressedBlob = await imageCompression(file, options);
      const compressedFile = new File([compressedBlob], file.name, {
        type: file.type,
      });
      setIsCompressing(false);
      return compressedFile;
    } catch (error) {
      console.error("Error compressing image:", error);
      setIsCompressing(false);
      throw error;
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedFiles(files);
      setPreviewUrl(URL.createObjectURL(files[0]));
      setShowCompressionModal(true); // Tampilkan modal konfirmasi kompresi
    }
  };

  const handleCompressDecision = async (shouldCompress) => {
    setShowCompressModal(false); // Tutup modal

    if (!pendingFile) return;

    setSelectedFiles([pendingFile]);
    setPreviewUrl(URL.createObjectURL(pendingFile));

    if (shouldCompress) {
      try {
        const compressed = await compressImage(pendingFile);
        setCompressedFile(compressed);
        setPreviewUrl(URL.createObjectURL(compressed));
      } catch (error) {
        alert("Gagal mengompres gambar. Menggunakan gambar original.");
        setCompressedFile(null);
      }
    } else {
      setCompressedFile(null);
    }

    setPendingFile(null);
  };

  // Lalu perbarui fungsi handleUpload untuk menyertakan kategori
  const handleUpload = async (e) => {
    e.preventDefault();
  
    if (!title.trim()) {
      setError("Judul harus diisi!");
      return;
    }
  
    if (categories.length === 0) {
      setError("Minimal satu kategori harus diisi!");
      return;
    }
  
    if (selectedFiles.length === 0) {
      setError("Silakan pilih gambar sebelum mengupload!");
      return;
    }
  
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description || "");
    categories.forEach((category) => {
      formData.append("categories[]", category);
    });
  
    if (compressedFile) {
      formData.append("image", compressedFile);
    } else {
      formData.append("image", selectedFiles[0]);
    }
  
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/galleries",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      setShowUploadModal(false);
  
      // Reset semua state setelah upload
      setTitle("");
      setDescription("");
      setCategories([]);
      setSelectedFiles([]);
      setCompressedFile(null);
      setPreviewUrl(null);
      setError("");
  
      // Ambil gambar baru dan masukkan secara acak
      const newImage = response.data.gallery;
      window.dispatchEvent(
        new CustomEvent("newGalleryImage", { detail: newImage })
      );
  
      // Refresh halaman setelah upload
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Gagal mengupload gambar, coba lagi!");
    }
  };
  
  
  // Fungsi untuk menambah kategori
  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory(""); // Reset input
    }
  };

  // Fungsi untuk menghapus kategori
  const handleRemoveCategory = (indexToRemove) => {
    setCategories(categories.filter((_, index) => index !== indexToRemove));
  };

  const handleGalleryClick = (galleryId) => {
    navigate(`/gallery/${galleryId}`);
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
          className="text-gray-600 hover:bg-gray-200 px-3 py-3 rounded-full text-sm font-medium">
          <FontAwesomeIcon icon={faArrowRightFromBracket} className="w-6 h-6" />
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
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Konten */}
      <div className="flex-1 p-6">
        {/* Profile Section */}
        <div className="flex flex-col items-center py-2">
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
              <FontAwesomeIcon
                icon={faX}
                className="absolute top-4 right-4 w-4 h-5 text-gray-600 hover:bg-gray-200 px-2 py-1 rounded-full text-xl cursor-pointer"
                onClick={() => setShowUploadModal(false)}
              />

              <h2 className="text-lg font-semibold mb-4">Upload Gambar</h2>

              <input
                type="text"
                placeholder="Judul"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Input field untuk kategori */}
              {/* Ganti input kategori yang lama dengan yang baru */}
              <div className="mb-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Tambah kategori"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCategory();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700">
                    Tambah
                  </button>
                </div>

                {/* Tampilkan kategori yang sudah ditambahkan */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {categories.map((cat, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                      <span>{cat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(index)}
                        className="text-gray-500 hover:text-red-500">
                        <FontAwesomeIcon icon={faX} className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <textarea
                placeholder="Deskripsi (Opsional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />

              {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full p-2 mb-3 border border-gray-300 rounded-md"
              />

              {/* Modal Konfirmasi Kompresi */}
              {showCompressionModal && (
                <div
                  className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                  onClick={() => setShowCompressionModal(false)}>
                  <div
                    className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full text-center"
                    onClick={(e) => e.stopPropagation()}>
                    <h2 className="text-lg font-semibold">Kompresi Gambar?</h2>
                    <p className="text-gray-600 mt-2">
                      Kompresi gambar akan sedikit mengurangi kualitas tetapi
                      membuat upload lebih cepat.
                    </p>
                    <div className="flex justify-center gap-4 mt-4">
                      <button
                        onClick={async () => {
                          try {
                            const compressed = await compressImage(
                              selectedFiles[0]
                            );
                            setCompressedFile(compressed);
                            setPreviewUrl(URL.createObjectURL(compressed));
                          } catch (error) {
                            alert(
                              "Gagal mengompres gambar. Menggunakan gambar original."
                            );
                            setCompressedFile(null);
                          }
                          setShowCompressionModal(false);
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-700">
                        Kompres
                      </button>
                      <button
                        onClick={() => {
                          setCompressedFile(null);
                          setShowCompressionModal(false);
                        }}
                        className="px-4 py-2 bg-gray-300 rounded-full hover:bg-gray-400">
                        Lewati
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isCompressing && (
                <p className="text-blue-500 text-sm mb-2">
                  Sedang mengompres gambar...
                </p>
              )}

              {previewUrl && (
                <div className="flex flex-col items-center">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-40 h-40 object-cover rounded-md mb-4"
                  />
                  <button
                    onClick={() => {
                      setSelectedFiles([]);
                      setCompressedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="text-blue-500 text-sm">
                    Ganti Gambar
                  </button>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={isCompressing}
                className={`mt-4 px-4 py-2 bg-blue-500 text-white rounded-full 
                  ${
                    isCompressing
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-blue-700"
                  }`}>
                {isCompressing ? "Mengompres..." : "Upload"}
              </button>
            </div>
          </div>
        )}

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
                <p className="text-gray-500 text-lg font-medium"></p>
              </div>
            )}
          </div>
        )}
        {/* Album Section */}
        {activeTab === "album" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {albums.length > 0 ? (
              albums.map((album) => (
                <div
                  key={album.id}
                  className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    if (album.album_id) {
                      navigate(`/album/${album.album_id}`);
                    } else {
                      console.error("Album ID tidak ditemukan!");
                    }
                  }}>
                  <div className="aspect-w-16 aspect-h-12 bg-gray-100">
                    <img
                      src={
                        album.cover_photo
                          ? `http://localhost:5000/${album.cover_photo}`
                          : "https://via.placeholder.com/300x200"
                      }
                      alt={album.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 truncate">
                      {album.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {album.description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full h-full flex justify-center items-center">
                <p className="text-gray-500 text-lg font-medium"></p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
