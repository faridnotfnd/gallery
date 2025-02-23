import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisV,
  faPen,
  faTrash,
  faImage,
  faArrowLeft,
  faX,
  faCheck,
  faUpload,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import imageCompression from "browser-image-compression";

const AlbumDetailPage = () => {
  const [showPhotoSourceModal, setShowPhotoSourceModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [userGalleries, setUserGalleries] = useState([]);
  const [selectedGalleryPhotos, setSelectedGalleryPhotos] = useState([]);
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const { albumId } = useParams();
  const [showOptions, setShowOptions] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingPhotoIndex, setEditingPhotoIndex] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [compressedFile, setCompressedFile] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [showCompressionModal, setShowCompressionModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [photoCategories, setPhotoCategories] = useState({});
  const [originalGalleries, setOriginalGalleries] = useState([]);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
  });
  const navigate = useNavigate();

  // Fetch album data
  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/albums/${albumId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAlbum(response.data.data);
        setEditFormData({
          title: response.data.data.title,
          description: response.data.data.description || "",
        });
        setLoading(false);
      } catch (err) {
        setError("Gagal memuat album");
        setLoading(false);
        console.error("Error fetching album:", err);
      }
    };

    fetchAlbum();
  }, [albumId]);

  // Handle edit album
  const handleEditAlbum = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/albums/${albumId}`,
        editFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setShowEditModal(false);
      // Refresh album data
      const response = await axios.get(
        `http://localhost:5000/api/albums/${albumId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAlbum(response.data.data);
    } catch (error) {
      console.error("Error updating album:", error);
      alert("Gagal mengupdate album");
    }
  };

  // Fetch user galleries
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

  // Tambahkan useEffect untuk memuat galeri saat modal dibuka
  useEffect(() => {
    if (showGalleryModal) {
      const fetchData = async () => {
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
          setOriginalGalleries(response.data); // Simpan data original
        } catch (error) {
          console.error("Error fetching user galleries:", error);
          setUserGalleries([]);
          setOriginalGalleries([]);
        }
      };
      fetchData();
    }
  }, [showGalleryModal]);

  // Handle photo source selection
  const handlePhotoSourceSelect = (source) => {
    setShowPhotoSourceModal(false);

    if (source === "device") {
      document.getElementById("photo-upload").click();
    } else if (source === "gallery") {
      setShowGalleryModal(true);
      fetchUserGalleries();
    }
  };

  // Handle gallery photo selection
  const handleGalleryPhotoSelect = (photo) => {
    const photoInfo = {
      id: photo.id,
      title: photo.title,
      image_url: photo.image_url,
      fromGallery: true,
    };

    // Cek apakah foto sudah dipilih sebelumnya
    if (selectedGalleryPhotos.includes(photo.id)) {
      // Jika foto sudah dipilih, hapus dari state selectedGalleryPhotos dan previewUrls
      setSelectedGalleryPhotos((prev) => prev.filter((id) => id !== photo.id));
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      setPreviewUrls((prev) =>
        prev.filter((url) => url !== `http://localhost:5000/${photo.image_url}`)
      );
    } else {
      // Jika foto belum dipilih, tambahkan ke selectedGalleryPhotos dan previewUrls
      setSelectedGalleryPhotos((prev) => [...prev, photo.id]);
      setPhotos((prev) => [...prev, photoInfo]);
      setPreviewUrls((prev) => [
        ...prev,
        `http://localhost:5000/${photo.image_url}`,
      ]);
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

  // Handle file selection from device
  const handleFileSelect = (event) => {
    const newFiles = Array.from(event.target.files);

    if (newFiles.length > 0) {
      setSelectedFiles(newFiles);
      setPendingFile(newFiles[0]);
      setShowCompressionModal(true);
      setShowPhotoSourceModal(false);
    }
  };

  // Handle compression decision
  const handleCompressDecision = async (shouldCompress) => {
    setShowCompressionModal(false);

    if (!pendingFile) return;

    let fileToUse = pendingFile;

    if (shouldCompress) {
      try {
        setIsCompressing(true);
        const compressed = await compressImage(pendingFile);
        fileToUse = compressed;
        setCompressedFile(compressed);
      } catch (error) {
        alert("Gagal mengompres gambar. Menggunakan gambar original.");
      } finally {
        setIsCompressing(false);
      }
    }

    // Create a new photo object with the file
    const newPhoto = {
      file: fileToUse,
      title: "",
      description: "",
      fromDevice: true,
    };

    // Add to photos array
    setPhotos((prev) => {
      const newPhotos = [...prev, newPhoto];
      setTimeout(() => {
        setEditingPhotoIndex(newPhotos.length - 1);
      }, 100);
      return newPhotos;
    });

    // Create preview URL
    const newUrl = URL.createObjectURL(fileToUse);
    setPreviewUrls((prev) => [...prev, newUrl]);

    // Reset states
    setPendingFile(null);
  };

  const handleAddPhotos = async () => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
  
      // Handle photos from device with categories
      const devicePhotos = photos.filter((photo) => photo.fromDevice);
      devicePhotos.forEach((photo) => {
        formData.append("photos", photo.file);
        
        // Append categories langsung seperti di galeri
        if (photo.categories && photo.categories.length > 0) {
          photo.categories.forEach(category => {
            formData.append("categories", category.trim());
          });
        }
      });
  
      // Handle metadata
      const photoDetails = photos.map((p) => ({
        title: p.title || "Untitled",
        description: p.description || "",
        categories: p.categories || [],
      }));
      formData.append("photos_metadata", JSON.stringify(photoDetails));
  
      // Handle gallery photos
      const galleryPhotos = photos.filter((photo) => photo.fromGallery);
      if (galleryPhotos.length > 0) {
        formData.append(
          "gallery_photos",
          JSON.stringify(
            galleryPhotos.map((photo) => ({
              gallery_id: photo.id,
              title: photo.title || "Untitled",
              description: photo.description || "",
              image_url: photo.image_url,
              categories: photo.categories || [],
            }))
          )
        );
      }
  
      // Debug log
      console.log("Sending categories data:", {
        devicePhotos: devicePhotos.map(p => p.categories),
        galleryPhotos: galleryPhotos.map(p => p.categories)
      });
  
      await axios.post(
        `http://localhost:5000/api/albums/${albumId}/photos`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      // Refresh album data
      const albumResponse = await axios.get(
        `http://localhost:5000/api/albums/${albumId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAlbum(albumResponse.data.data);
  
      // Reset states
      setPhotos([]);
      setPreviewUrls([]);
      setSelectedGalleryPhotos([]);
      setPhotoCategories({});
      setCategories([]);
      setShowOptions(false);
  
      // Tutup semua modal
      setShowPhotoSourceModal(false);
      setShowGalleryModal(false);
      setEditingPhotoIndex(null);
  
    } catch (error) {
      console.error("Error adding photos:", error);
      console.error("Response data:", error.response?.data);
      alert(
        "Gagal menambahkan foto: " +
          (error.response?.data?.details ||
            error.response?.data?.error ||
            "Terjadi kesalahan")
      );
    }
  };
  
  const handleCancel = () => {
    // Ketika batal, hanya hapus foto yang baru dipilih
    setSelectedGalleryPhotos([]);
    setShowGalleryModal(false); // Menutup modal
  };
  // Add selected photos to album
  const addSelectedPhotosToAlbum = () => {
    setShowGalleryModal(false);
  };

  // Handle delete album
  const handleDeleteAlbum = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/albums/${albumId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      navigate("/profile"); // Redirect to profile page after deleting the album
    } catch (error) {
      console.error("Error deleting album:", error);
      alert("Gagal menghapus album");
    }
  };

  // Handle photo detail change
  const handlePhotoDetailChange = (index, field, value) => {
    setPhotos((prevPhotos) => {
      const newPhotos = [...prevPhotos];
      if (field === "categories") {
        // Ensure categories is always an array
        const categoriesArray = Array.isArray(value) ? value : [value];
        newPhotos[index] = {
          ...newPhotos[index],
          categories: categoriesArray,
        };
      } else {
        newPhotos[index] = {
          ...newPhotos[index],
          [field]: value,
        };
      }
      return newPhotos;
    });
  };

  // Handle adding a new category
  const handleAddCategory = (index) => {
    if (newCategory.trim()) {
      const photo = photos[index];
      const currentCategories = photo?.categories || [];

      // Check for duplicates
      if (!currentCategories.includes(newCategory.trim())) {
        handlePhotoDetailChange(index, "categories", [
          ...currentCategories,
          newCategory.trim(),
        ]);
      }
      setNewCategory("");
    }
  };

  // Handle removing a category
  const handleRemoveCategory = (photoIndex, categoryIndex) => {
    const photo = photos[photoIndex];
    const currentCategories = [...(photo?.categories || [])];
    currentCategories.splice(categoryIndex, 1);
    handlePhotoDetailChange(photoIndex, "categories", currentCategories);
  };

  // Remove photo
  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));

    // Jika foto yang dihapus adalah foto yang sedang diedit, tutup modal edit
    if (editingPhotoIndex === index) {
      setEditingPhotoIndex(null);
    } else if (editingPhotoIndex !== null && editingPhotoIndex > index) {
      // Jika foto yang dihapus berada sebelum foto yang sedang diedit, sesuaikan indeks
      setEditingPhotoIndex(editingPhotoIndex - 1);
    }
  };

  const handlePhotoClick = (photoId) => {
    navigate(`/gallery/${photoId}`); // Navigate to the gallery detail page using the photo ID
  };

  return (
    <div className="min-h-screen bg-[#faf8f4]">
      {/* Header */}
      <div className="p-4">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:bg-gray-200 px-3 py-3 rounded-full text-sm font-medium">
          <FontAwesomeIcon icon={faArrowLeft} className="w-6 h-6" />
        </button>

        <div className="absolute top-3 right-8 z-50">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="text-gray-600 text-2xl hover:scale-110 transition-transform p-2">
            <FontAwesomeIcon icon={faEllipsisV} />
          </button>

          {showOptions && (
            <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-xl w-48">
              <button
                onClick={() => {
                  setShowEditModal(true);
                  setShowOptions(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                <FontAwesomeIcon icon={faPen} className="mr-2" />
                Edit Album
              </button>
              <button
                onClick={() => {
                  setShowPhotoSourceModal(true);
                  setShowOptions(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                <FontAwesomeIcon icon={faImage} className="mr-2" />
                Tambah Gambar
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">
                <FontAwesomeIcon icon={faTrash} className="mr-2" />
                Hapus Album
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        id="photo-upload"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit Album</h2>
            <input
              type="text"
              value={editFormData.title}
              onChange={(e) =>
                setEditFormData({ ...editFormData, title: e.target.value })
              }
              className="w-full p-2 border rounded mb-4"
              placeholder="Judul Album"
            />
            <textarea
              value={editFormData.description}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  description: e.target.value,
                })
              }
              className="w-full p-2 border rounded mb-4"
              placeholder="Deskripsi"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-full">
                Batal
              </button>
              <button
                onClick={handleEditAlbum}
                className="px-4 py-2 bg-blue-500 text-white rounded-full">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-96 text-center"
            onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold">Hapus Album?</h2>
            <p className="text-gray-600 mt-2">
              Album akan dihapus secara permanen. Foto dari album yang dihapus
              tetap ada di Galeri.
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-full hover:bg-gray-400">
                Batal
              </button>
              <button
                onClick={() => {
                  handleDeleteAlbum();
                  setShowDeleteModal(false);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-700">
                Hapus Album
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Source Modal */}
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
                className="w-full p-3 bg-sky-500 text-white rounded-full hover:bg-sky-600 flex items-center justify-center gap-2">
                <FontAwesomeIcon icon={faUpload} />
                Unggah dari Perangkat
              </button>

              <button
                onClick={() => handlePhotoSourceSelect("gallery")}
                className="w-full p-3 bg-cyan-800 text-white rounded-full hover:bg-cyan-900 flex items-center justify-center gap-2">
                <FontAwesomeIcon icon={faImage} />
                Pilih dari Galeri
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compression Confirmation Modal */}
      {showCompressionModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full text-center">
            <h2 className="text-lg font-semibold">Kompresi Gambar?</h2>
            <p className="text-gray-600 mt-2">
              Kompresi gambar akan sedikit mengurangi kualitas tetapi membuat
              upload lebih cepat.
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => handleCompressDecision(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-700">
                Kompres
              </button>
              <button
                onClick={() => handleCompressDecision(false)}
                className="px-4 py-2 bg-gray-300 rounded-full hover:bg-gray-400">
                Lewati
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
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

            {/* Search Bar */}
            <div className="mb-6">
              <input
                type="text"
                onChange={(e) => {
                  const searchQuery = e.target.value.toLowerCase();
                  if (!searchQuery) {
                    fetchUserGalleries(); // Reset ke data original
                    return;
                  }
                  const filteredGalleries = userGalleries.filter(
                    (photo) =>
                      photo.title?.toLowerCase().includes(searchQuery) ||
                      photo.description?.toLowerCase().includes(searchQuery) ||
                      photo.categories?.some((category) =>
                        category.name.toLowerCase().includes(searchQuery)
                      )
                  );
                  setUserGalleries(filteredGalleries);
                }}
                placeholder="Cari Gambar..."
                className="w-full p-2.5 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm text-gray-600"
              />
            </div>

            {/* Foto Galeri */}
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 mb-4">
              {userGalleries.map((photo) => (
                <div
                  key={photo.id}
                  className={`relative mb-4 cursor-pointer ${
                    selectedGalleryPhotos.includes(photo.id) ? "" : ""
                  }`}
                  onClick={() => handleGalleryPhotoSelect(photo)}>
                  <div className="w-full h-48 flex items-center justify-center overflow-hidden rounded">
                    <img
                      src={`http://localhost:5000/${photo.image_url}`}
                      alt={photo.title}
                      className="max-w-full max-h-48 object-cover transition-transform duration-300"
                    />
                  </div>
                  {selectedGalleryPhotos.includes(photo.id) && (
                    <div className="absolute inset-0 flex items-center justify-center rounded">
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-white bg-sky-400 rounded-full p-2 text-2xl"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  handleCancel();
                  setPhotos([]);
                  setPreviewUrls([]);
                  setShowGalleryModal(false);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600">
                Batal
              </button>
              <button
                onClick={addSelectedPhotosToAlbum}
                className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
                Tambahkan Foto Terpilih
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Photo Detail Modal */}
      {editingPhotoIndex !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Edit Detail Foto</h2>
              <FontAwesomeIcon
                icon={faX}
                className="cursor-pointer"
                onClick={() => setEditingPhotoIndex(null)}
              />
            </div>

            <div className="w-full flex flex-col items-center">
              <div className="w-40 h-40 flex items-center justify-center overflow-hidden mb-4 rounded-md">
                <img
                  src={previewUrls[editingPhotoIndex]}
                  alt="Preview"
                  className="max-w-full max-h-40 object-contain"
                />
              </div>
              {isCompressing && (
                <p className="text-blue-500 text-sm mb-2">
                  Sedang mengompres gambar...
                </p>
              )}
            </div>

            <input
              type="text"
              placeholder="Judul Foto"
              value={photos[editingPhotoIndex]?.title || ""}
              onChange={(e) =>
                handlePhotoDetailChange(
                  editingPhotoIndex,
                  "title",
                  e.target.value
                )
              }
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
                      handleAddCategory(editingPhotoIndex);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleAddCategory(editingPhotoIndex)}
                  className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700">
                  Tambah
                </button>
              </div>

              {/* Tampilkan kategori yang sudah ditambahkan */}
              <div className="flex flex-wrap gap-2 mt-2">
                {(photos[editingPhotoIndex]?.categories || []).map(
                  (cat, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                      <span>{cat}</span>
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveCategory(editingPhotoIndex, index)
                        }
                        className="text-gray-500 hover:text-red-500">
                        <FontAwesomeIcon icon={faX} className="w-3 h-3" />
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>

            <textarea
              placeholder="Deskripsi Foto (Opsional)"
              value={photos[editingPhotoIndex]?.description || ""}
              onChange={(e) =>
                handlePhotoDetailChange(
                  editingPhotoIndex,
                  "description",
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  // Update photo with compressed file if available
                  if (compressedFile && editingPhotoIndex !== null) {
                    const updatedPhotos = [...photos];
                    updatedPhotos[editingPhotoIndex] = {
                      ...updatedPhotos[editingPhotoIndex],
                      file: compressedFile,
                      categories:
                        photoCategories[
                          updatedPhotos[editingPhotoIndex].id ||
                            `temp-${editingPhotoIndex}`
                        ] || [],
                    };
                    setPhotos(updatedPhotos);
                    
                    const newPreviewUrls = [...previewUrls];
                    newPreviewUrls[editingPhotoIndex] =
                      URL.createObjectURL(compressedFile);
                    setPreviewUrls(newPreviewUrls);
                    setCompressedFile(null);
                  } else {
                    const updatedPhotos = [...photos];
                    updatedPhotos[editingPhotoIndex] = {
                      ...updatedPhotos[editingPhotoIndex],
                      categories:
                        photoCategories[
                          updatedPhotos[editingPhotoIndex].id ||
                            `temp-${editingPhotoIndex}`
                        ] || [],
                    };
                    setPhotos(updatedPhotos);
                  }
                  setEditingPhotoIndex(null);
                }
              }}
              className="w-full p-2 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />

            <button
              onClick={() => {
                // Assign compressed file if available
                if (compressedFile && editingPhotoIndex !== null) {
                  const updatedPhotos = [...photos];
                  updatedPhotos[editingPhotoIndex] = {
                    ...updatedPhotos[editingPhotoIndex],
                    file: compressedFile,
                    // Store categories with the photo
                    categories:
                      photoCategories[
                        updatedPhotos[editingPhotoIndex].id ||
                          `temp-${editingPhotoIndex}`
                      ] || [],
                  };
                  setPhotos(updatedPhotos);

                  // Update preview URL
                  const newPreviewUrls = [...previewUrls];
                  newPreviewUrls[editingPhotoIndex] =
                    URL.createObjectURL(compressedFile);
                  setPreviewUrls(newPreviewUrls);

                  // Reset compression state
                  setCompressedFile(null);
                } else {
                  // Just update categories if no new file
                  const updatedPhotos = [...photos];
                  updatedPhotos[editingPhotoIndex] = {
                    ...updatedPhotos[editingPhotoIndex],
                    categories:
                      photoCategories[
                        updatedPhotos[editingPhotoIndex].id ||
                          `temp-${editingPhotoIndex}`
                      ] || [],
                  };
                  setPhotos(updatedPhotos);
                }
                setEditingPhotoIndex(null);
              }}
              disabled={isCompressing}
              className={`w-full p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 ${
                isCompressing ? "opacity-50 cursor-not-allowed" : ""
              }`}>
              {isCompressing ? "Mengompres..." : "Simpan Detail"}
            </button>
          </div>
        </div>
      )}

      {/* Preview Photos with edit/delete options - shown when photos are selected */}
      {previewUrls.length > 0 && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[600px] max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Tambah Foto ke Album</h2>
              <FontAwesomeIcon
                icon={faX}
                className="cursor-pointer"
                onClick={() => {
                  setPhotos([]);
                  setPreviewUrls([]);
                  setSelectedGalleryPhotos([]);
                }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative">
                  <div className="w-full h-24 overflow-hidden rounded">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="absolute top-1 right-1 flex space-x-1">
                    <button
                      onClick={() => setEditingPhotoIndex(index)}
                      className="bg-blue-500 text-white p-1 rounded-full"
                      title="Edit detail foto">
                      <FontAwesomeIcon
                        icon={faPenToSquare}
                        className="w-6 h-4"
                      />
                    </button>
                    <button
                      onClick={() => removePhoto(index)}
                      className="bg-red-500 text-white p-1 rounded-full"
                      title="Hapus foto">
                      <FontAwesomeIcon icon={faTrash} className="w-6 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setShowPhotoSourceModal(true)}
                className="px-4 py-2 bg-sky-500 text-white rounded-full hover:bg-sky-600">
                Tambah Foto Lainnya
              </button>

              <button
                onClick={handleAddPhotos}
                className="px-4 py-2 bg-cyan-800 text-white rounded-full hover:bg-cyan-900">
                Simpan ke Album
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Album Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Album Info */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {album?.title}
          </h1>
          {album?.description && (
            <p className="text-gray-600 text-lg mb-6">{album.description}</p>
          )}
          <div className="mb-8"></div>
        </div>

        {/* Photos Grid */}
        {!album?.photos || album.photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <img
              src="../src/assets/albums.png"
              alt="book"
              className="w-64 h-auto cursor-pointer"
              onClick={() => {
                setShowPhotoSourceModal(true);
                setShowOptions(false);
              }}
            />
            <p className="text-gray-700 text-lg font-medium mt-4">
              Album kosong
            </p>
            <button
              onClick={() => setShowPhotoSourceModal(true)}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Tambahkan Foto
            </button>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {album.photos.map((photo, index) => (
              <div
                key={photo.id || index}
                onClick={() => handlePhotoClick(photo.id)}
                className="break-inside-avoid relative group overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer">
                <img
                  src={`http://localhost:5000/${photo.image_url}`}
                  alt={photo.title || `Photo ${index + 1}`}
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {photo.title && (
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <p className="text-white p-4 w-full text-center">
                      {photo.title}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbumDetailPage;
