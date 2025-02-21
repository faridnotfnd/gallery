import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faX,
  faUpload,
  faImage,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

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
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { albumId } = useParams();
  const [selectedPhotoId, setSelectedPhotoId] = useState(null);
  const navigate = useNavigate();

  // Fetch album data once on mount
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
        setAlbum(response.data.data); // Ubah ini dari response.data menjadi response.data.data
        setLoading(false);
      } catch (err) {
        setError("Gagal memuat album");
        setLoading(false);
        console.error("Error fetching album:", err);
      }
    };

    fetchAlbum();
  }, [albumId]);

  // Fetch user galleries when modal is shown
  useEffect(() => {
    if (showGalleryModal) {
      fetchUserGalleries();
    }
  }, [showGalleryModal]);

  // Ensure conditional rendering doesn't break hook ordering
  const handleFileSelect = (event) => {
    const newFiles = Array.from(event.target.files);

    // Filter only image files
    const validFiles = newFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    if (validFiles.length === 0) {
      alert("Hanya file gambar yang diperbolehkan!");
      return;
    }

    setPhotos((prev) => [...prev, ...validFiles]);

    // Create temporary URL for each selected image
    const newUrls = validFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newUrls]);

    console.log("File yang dipilih:", validFiles);
    setShowUploadModal(true); // Show the upload modal
  };

  const handlePhotoSourceSelect = (source) => {
    setShowPhotoSourceModal(false);

    if (source === "device") {
      document.getElementById("photo-upload").click();
    } else if (source === "gallery") {
      setShowGalleryModal(true);
      fetchUserGalleries(); // Fetch galleries when gallery is selected
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

  const fetchUserGalleries = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/galleries/my-galleries",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserGalleries(response.data);
    } catch (err) {
      console.error("Error fetching galleries:", err);
      setUserGalleries([]);
    }
  };

  const addSelectedPhotosToAlbum = () => {
    setShowGalleryModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f4] flex items-center justify-center">
        <div className="text-xl text-gray-600">Memuat...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#faf8f4] flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  // Tambahkan handler untuk klik gambar
  const handlePhotoClick = (photoId) => {
    navigate(`/gallery/${photoId}`);
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
      </div>

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
              onClick={() => setShowPhotoSourceModal(true)}
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
