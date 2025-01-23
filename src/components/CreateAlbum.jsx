import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateAlbum = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [step, setStep] = useState(1);
  const [createdAlbumId, setCreatedAlbumId] = useState(null);
  const [userGalleries, setUserGalleries] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const navigate = useNavigate();

  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      
      if (!userId) {
        alert("User ID tidak ditemukan. Silakan login ulang.");
        return;
      }
  
      const albumData = {
        title: title.trim(),
        description: description.trim(),
        user_id: parseInt(userId, 10),
      };
  
      const response = await axios.post(
        "http://localhost:5000/api/albums",
        albumData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      // Pastikan respons memiliki field `album`
      if (!response.data.album || !response.data.album.album_id) {
        throw new Error("Respons server tidak valid.");
      }
  
      setCreatedAlbumId(response.data.album.album_id);
      setStep(2);
      fetchUserGalleries();
    } catch (error) {
      console.error("Error saat membuat album:", error.response?.data || error.message);
      alert("Gagal membuat album: " + (error.response?.data?.error || error.message));
    }
  };
  
  const fetchUserGalleries = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      
      console.log('Fetching galleries for user:', userId); // Debug log
      
      const response = await axios.get(
        `http://localhost:5000/api/galleries/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setUserGalleries(response.data);
    } catch (error) {
      console.error('Error fetching galleries:', error);
      alert("Error mengambil galeri: " + error.message);
    }
  };

  // Tambahkan fungsi-fungsi yang hilang
const handlePhotoSelection = (photoId) => {
  setSelectedPhotos(prev => 
    prev.includes(photoId) 
      ? prev.filter(id => id !== photoId)
      : [...prev, photoId]
  );
};

const handleFinish = async () => {
  try {
    const token = localStorage.getItem("token");
    
    // Kirim data foto yang dipilih ke endpoint yang sesuai
    await axios.post(
      `http://localhost:5000/api/albums/${createdAlbumId}/photos`,
      { photoIds: selectedPhotos },
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    alert("Album berhasil dibuat!");
    navigate("/albums"); // Arahkan ke halaman daftar album
  } catch (error) {
    console.error("Error menambahkan foto:", error);
    alert("Error menambahkan foto ke album: " + 
      (error.response?.data?.error || error.message));
  }
};

  // ... rest of the component code remains the same ...

  return (
    <div className="container mx-auto mt-10 px-4">
      {step === 1 ? (
        // Form pembuatan album
        <div>
          <h1 className="text-2xl font-bold">Buat Album Baru</h1>
          <form onSubmit={handleCreateAlbum} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium">Judul Album</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Deskripsi</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="pt-4">
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Lanjut ke Pemilihan Foto
              </button>
            </div>
          </form>
        </div>
      ) : (
        // Bagian pemilihan foto
        <div>
          <h1 className="text-2xl font-bold">Pilih Foto untuk Album</h1>
          <p className="mt-2 text-gray-600">
            Pilih foto-foto yang ingin ditambahkan ke album "{title}"
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            {userGalleries.map((gallery) => (
              <div
                key={gallery.id}
                className={`relative cursor-pointer group ${
                  selectedPhotos.includes(gallery.id) ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handlePhotoSelection(gallery.id)}
              >
                <img
                  src={`http://localhost:5000/${gallery.image_url}`}
                  alt={gallery.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className={`absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center ${
                  selectedPhotos.includes(gallery.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                } transition-opacity`}>
                  <span className="text-white text-lg">
                    {selectedPhotos.includes(gallery.id) ? '✓' : '+'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Kembali
            </button>
            <button
              onClick={handleFinish}
              disabled={selectedPhotos.length === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Selesai ({selectedPhotos.length} foto dipilih)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAlbum;