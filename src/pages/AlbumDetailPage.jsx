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
  const { albumId } = useParams();
  const [showOptions, setShowOptions] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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

  // Handle add photos
  const handleAddPhotos = async (files) => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      files.forEach((file) => {
        formData.append("photos", file);
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
      const response = await axios.get(
        `http://localhost:5000/api/albums/${albumId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAlbum(response.data.data);
      setShowPhotoSourceModal(false);
      setShowOptions(false);
    } catch (error) {
      console.error("Error adding photos:", error);
      alert("Gagal menambahkan foto");
    }
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
                  document.getElementById("photo-upload").click();
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
        onChange={(e) => handleAddPhotos(Array.from(e.target.files))}
      />

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
                className="px-4 py-2 bg-gray-200 rounded">
                Batal
              </button>
              <button
                onClick={handleEditAlbum}
                className="px-4 py-2 bg-blue-500 text-white rounded">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-96 text-center"
            onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold">Konfirmasi Hapus</h2>
            <p className="text-gray-600 mt-2">
              Anda yakin ingin menghapus album ini?
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
