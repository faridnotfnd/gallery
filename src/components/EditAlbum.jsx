import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EditAlbum = () => {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem("token");

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setSelectedFiles((prev) => [...prev, ...files]);
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const handleUploadPhotos = async () => {
    if (selectedFiles.length === 0) {
      alert("Silakan pilih foto terlebih dahulu.");
      return;
    }

    try {
      setIsLoading(true);

      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("photos", file);
      });

      await axios.post(`http://localhost:5000/api/albums/${albumId}/photos`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Foto berhasil ditambahkan!");
      navigate("/profile");
    } catch (error) {
      console.error("Error uploading photos:", error);
      alert("Gagal mengunggah foto.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Tambah Foto ke Album</h1>

      <label className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 cursor-pointer">
        <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
        Pilih Foto
      </label>

      {previewUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-4">
          {previewUrls.map((url, index) => (
            <img key={index} src={url} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
          ))}
        </div>
      )}

      <button
        onClick={handleUploadPhotos}
        disabled={isLoading || selectedFiles.length === 0}
        className="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-300"
      >
        {isLoading ? "Mengunggah..." : "Unggah Foto"}
      </button>
    </div>
  );
};

export default EditAlbum;