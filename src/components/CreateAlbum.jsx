import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faImage,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";


const CreateAlbum = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setSelectedFiles((prev) => [...prev, ...files]);
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };
  

  const handleCreateAlbum = async () => {
    try {
      const userId = localStorage.getItem("user_id");
      const token = localStorage.getItem("token");
      
      console.log("User ID:", userId); // Debug: log user ID
      console.log("Token:", token); // Debug: log token
  
      // Additional detailed validation
      if (!token) {
        console.error("No token found");
        alert("Token tidak ditemukan. Silakan login kembali.");
        navigate("/login");
        return;
      }
  
      if (!userId) {
        console.error("No user ID found");
        alert("User ID tidak ditemukan. Silakan login kembali.");
        navigate("/login");
        return;
      }
  
      setIsLoading(true);
    
      // Gunakan FormData untuk mengirim album + foto sekaligus
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("user_id", parseInt(userId, 10));
  
      selectedFiles.forEach((file) => {
        formData.append("photos", file);
      });
  
      // Kirim data album + foto ke backend
      const response = await axios.post(
        "http://localhost:5000/api/albums",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      alert("Album berhasil dibuat!");
      navigate("/profile");
    } catch (error) {
      console.error("Error creating album:", error);
      alert(
        error.response?.data?.error || 
        "Terjadi kesalahan saat membuat album. Silakan coba lagi."
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center p-4">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:bg-gray-200 px-3 py-3 rounded-full text-sm font-medium">
          <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4">
        {/* Form Section */}
        <div className="mb-8">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tambahkan judul"
            className="w-full text-2xl font-medium border-b-2 border-blue-500 focus:outline-none focus:border-blue-600 pb-2 mb-4"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tambahkan deskripsi album (opsional)"
            className="w-full mt-4 p-2 border rounded-lg focus:outline-none focus:border-blue-500 min-h-[100px] text-gray-700 resize-none"
          />
        </div>

        {selectedFiles.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-xs mx-auto">
              <img
                src="/src/assets/albums.png"
                alt="Album kosong"
                className="w-full mb-4"
              />
              <h2 className="text-lg font-medium mb-4">Album Masih Kosong</h2>  
              <label className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                Tambahkan Foto
              </label>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative aspect-square group">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <FontAwesomeIcon
                  icon={faImage}
                  className="w-8 h-8 text-gray-400 mb-2"
                />
                <span className="text-sm text-gray-500">Tambah Foto Lainnya</span>
              </label>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
              <button
                onClick={handleCreateAlbum}
                disabled={isLoading || !title.trim()}
                className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed">
                {isLoading ? "Sedang membuat album..." : `Buat Album (${selectedFiles.length} foto)`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateAlbum;