import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faX,
  faArrowRightFromBracket,
  faHouse,
  faArrowLeft,
  faTrash,
  faImage,
  faUpload,
  faCheck,
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
  const [showCreateAlbumModal, setShowCreateAlbumModal] = useState(false);
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
  const [previewUrls, setPreviewUrls] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [showPhotoSourceModal, setShowPhotoSourceModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [userGalleries, setUserGalleries] = useState([]);
  const [selectedGalleryPhotos, setSelectedGalleryPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fungsi untuk mengambil galeri per user dari backend
  const fetchUserGalleries = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/galleries/my-galleries",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUserGalleries(response.data);
    } catch (error) {
      console.error("Error fetching user galleries:", error);
      setUserGalleries([]);
    }
  };

  // Perbarui useEffect untuk menggunakan fungsi fetchUserGalleries yang baru
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }

    // Langsung panggil fetchGalleries dan fetchUserGalleries
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
        setGalleries([]);
      }
    };

    fetchGalleries();
    fetchUserGalleries();
  }, []);

  const handlePhotoSourceSelect = (source) => {
    setShowPhotoSourceModal(false);

    if (source === "device") {
      document.getElementById("photo-upload").click();
    } else if (source === "gallery") {
      setShowGalleryModal(true);
      fetchUserGalleries(); // Tambahkan pemanggilan fetchUserGalleries di sini
    }
  };

  const handleGalleryPhotoSelect = (photo) => {
    const photoInfo = {
      id: photo.id,
      title: photo.title,
      image_url: photo.image_url,
      fromGallery: true,
    };

    if (selectedGalleryPhotos.includes(photo.id)) {
      setSelectedGalleryPhotos((prev) => prev.filter((id) => id !== photo.id));
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      setPreviewUrls((prev) =>
        prev.filter(
          (_, i) => prev[i] !== `http://localhost:5000/${photo.image_url}`
        )
      );
    } else {
      setSelectedGalleryPhotos((prev) => [...prev, photo.id]);
      setPhotos((prev) => [...prev, photoInfo]);
      setPreviewUrls((prev) => [
        ...prev,
        `http://localhost:5000/${photo.image_url}`,
      ]);
    }
  };

  // Tambahkan useEffect untuk memuat galeri saat modal dibuka
  useEffect(() => {
    if (showGalleryModal) {
      fetchUserGalleries();
    }
  }, [showGalleryModal]);

  const addSelectedPhotosToAlbum = () => {
    setShowGalleryModal(false);
  };

  // Fungsi untuk mengambil album per user dari backend
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("user_id");

        if (!userId) {
          // Tambahkan pengecekan
          console.error("User ID tidak ditemukan di localStorage");
          setAlbums([]);
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/albums/user/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data) {
          // Pastikan response.data adalah array sebelum mengatur state
          if (Array.isArray(response.data)) {
            setAlbums(response.data);
          } else {
            console.error("Data albums tidak valid:", response.data);
            setAlbums([]);
          }
        }
      } catch (error) {
        console.error("Error fetching albums:", error);
        setAlbums([]);
      }
    };

    fetchAlbums();
  }, []);

  // Fungsi untuk menangani upload file dari perangkat
  const handleFileSelect = (event) => {
    const newFiles = Array.from(event.target.files);
    setPhotos((prev) => [...prev, ...newFiles]);

    // Membuat URL sementara untuk setiap gambar yang dipilih
    const newUrls = newFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newUrls]);

    console.log("Modal upload harus tampil:", newFiles);
    setShowUploadModal(true); // Trigger modal untuk detail upload
  };

  // Fungsi untuk menghapus foto
  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (showCreateAlbumModal) {
      setShowUploadModal(false); // Menutup modal upload saat create album dibuka
    }
  }, [showCreateAlbumModal]);

  // Fungsi untuk menyimpan album
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Tambahkan indikator loading

    try {
      const userId = localStorage.getItem("user_id");

      // Validasi dasar
      if (!userId) {
        alert("User ID tidak ditemukan. Silakan login kembali");
        setIsSubmitting(false);
        return;
      }

      if (!title.trim()) {
        alert("Judul album tidak boleh kosong");
        setIsSubmitting(false);
        return;
      }

      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append("description", description?.trim() || "");
      formData.append("user_id", userId);

      // Handle foto dari perangkat
      photos.forEach((photo) => {
        if (photo instanceof File) {
          formData.append("photos", photo);
        }
      });

      // Handle foto dari galeri yang sudah ada - perbaiki format JSON
      if (photos.some((photo) => photo.fromGallery)) {
        formData.append(
          "gallery_photos",
          JSON.stringify(
            photos
              .filter((photo) => photo.fromGallery)
              .map((photo) => ({
                gallery_id: photo.id,
                title: photo.title,
                image_url: photo.image_url,
              }))
          )
        );
      }

      const response = await axios.post(
        "http://localhost:5000/api/albums",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh daftar album
      const updatedAlbumsResponse = await axios.get(
        `http://localhost:5000/api/albums/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAlbums(updatedAlbumsResponse.data);

      // Reset form dan tutup modal
      setTitle("");
      setDescription("");
      setPhotos([]);
      setPreviewUrls([]);
      setSelectedGalleryPhotos([]);
      setShowCreateAlbumModal(false); // Pastikan modal tertutup di sini

      // Tampilkan pemberitahuan keberhasilan setelah modal tertutup
      setTimeout(() => {
        alert("Album berhasil dibuat!");
      }, 300);
    } catch (error) {
      console.error("Error creating album:", error);
      alert(
        error.response?.data?.error || "Terjadi kesalahan saat membuat album"
      );
    } finally {
      setIsSubmitting(false); // Reset status loading
    }
  };
  // Fungsi untuk kompresi gambar
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
    localStorage.removeItem("user_id");
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
      {/* Modal Pembuatan Album */}
      {showCreateAlbumModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[600px] max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Buat Album Baru</h2>
              <FontAwesomeIcon
                icon={faX}
                className="cursor-pointer"
                onClick={() => setShowCreateAlbumModal(false)}
              />
            </div>

            <input
              type="text"
              placeholder="Judul Album"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 mb-4 border rounded"
            />

            <textarea
              placeholder="Deskripsi Album"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 mb-4 border rounded"
              rows="3"
            />

            <button
              onClick={() => setShowPhotoSourceModal(true)}
              className="w-full p-2 mb-4 bg-blue-500 text-white rounded hover:bg-blue-600">
              Tambah Foto
            </button>

            {/* Preview Foto */}
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full">
                      <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleSubmit}
              className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600">
              Simpan Album
            </button>
          </div>
        </div>
      )}

      {/* Modal Pemilihan Sumber Foto */}
      {showPhotoSourceModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Pilih Sumber Foto</h2>
              <FontAwesomeIcon
                icon={faX}
                className="cursor-pointer"
                onClick={() => setShowPhotoSourceModal(false)}
              />
            </div>

            <div className="space-y-4">
              <button
                onClick={() => handlePhotoSourceSelect("device")}
                className="w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-2">
                <FontAwesomeIcon icon={faUpload} />
                Unggah dari Perangkat
              </button>

              <button
                onClick={() => handlePhotoSourceSelect("gallery")}
                className="w-full p-3 bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center gap-2">
                <FontAwesomeIcon icon={faImage} />
                Pilih dari Galeri
              </button>
            </div>

            <input
              id="photo-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* Modal Galeri Foto */}
      {showGalleryModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[800px] max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Pilih Foto dari Galeri</h2>
              <FontAwesomeIcon
                icon={faX}
                className="cursor-pointer"
                onClick={() => setShowGalleryModal(false)}
              />
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
              {userGalleries.map((photo) => (
                <div
                  key={photo.id}
                  className={`relative cursor-pointer ${
                    selectedGalleryPhotos.includes(photo.id)
                      ? "ring-2 ring-blue-500"
                      : ""
                  }`}
                  onClick={() => handleGalleryPhotoSelect(photo)}>
                  <img
                    src={`http://localhost:5000/${photo.image_url}`}
                    alt={photo.title}
                    className="w-full h-32 object-cover rounded"
                  />
                  {selectedGalleryPhotos.includes(photo.id) && (
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-white text-2xl"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowGalleryModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                Batal
              </button>
              <button
                onClick={addSelectedPhotosToAlbum}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Tambahkan Foto Terpilih
              </button>
            </div>
          </div>
        </div>
      )}
      {/* end album */}

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
              onClick={() => setShowCreateAlbumModal(true)}
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
              <div className="mb-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Tambah kategori"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => {
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
                  className="border rounded-lg overflow-hidden shadow-sm transition-shadow cursor-pointer"
                  onClick={() => {
                    if (album.album_id) {
                      navigate(`/album/${album.album_id}`);
                    }
                  }}>
                  <div className="aspect-w-16 aspect-h-12 bg-gray-100 relative group">
                    {/* Gambar dan efek hover */}
                    {album.photos && album.photos.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {album.photos.slice(0, 5).map((photo) => (
                          <img
                            key={photo.id}
                            src={`http://localhost:5000/${photo.image_url}`}
                            alt={photo.title}
                            className="w-full h-auto object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                        <p>No images in this album</p>
                      </div>
                    )}

                    {/* Efek hover untuk menampilkan judul album */}
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <p className="text-white text-lg font-semibold">
                        {album.title}
                      </p>
                    </div>
                  </div>

                  {/* Deskripsi Album */}
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
              <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-gray-400 text-lg">
                Tidak ada item
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
