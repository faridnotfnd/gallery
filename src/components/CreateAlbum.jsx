import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { useRef } from "react";

const CreateAlbum = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [galleries, setGalleries] = useState([]); // Data gambar dari galeri
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const swiperRef = useRef(null);
  const [swiperInstance, setSwiperInstance] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchUserGalleries(userId);
    }
  }, [userId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/galleries");
        setGalleries(response.data.galleries);
      } catch (error) {
        console.error("Error fetching galleries:", error);
      }
    };
    fetchData();
  }, []);

  // Fetch gambar dari backend berdasarkan userId
  const fetchUserGalleries = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/galleries/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setGalleries(response.data);
    } catch (error) {
      console.error("Error fetching user galleries:", error);
    }
    console.log(galleries);
  };

  // Handle file selection (upload dari perangkat)
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setPhotos(files);

    // Preview gambar sebelum upload
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    setIsImagePickerOpen(false);
  };

  // Handle pilih gambar dari galeri
  const handleSelectGalleryImage = (imagePath) => {
    setPreviewUrls([imagePath]);
    setPhotos([imagePath]); // Simpan path gambar sebagai referensi
    setIsGalleryModalOpen(false);
    setIsImagePickerOpen(false);
  };

  // Handle submit album
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Judul album tidak boleh kosong.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("user_id", userId);

    // Jika user pilih gambar dari galeri, simpan sebagai path
    if (typeof photos[0] === "string") {
      formData.append("cover_photo", photos[0]); // Path gambar dari galeri
    } else {
      // Upload file jika bukan dari galeri
      photos.forEach((photo) => formData.append("photos", photo));
    }

    try {
      const res = await axios.post("http://localhost:5000/albums", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Album berhasil dibuat!");
      navigate("/"); // Redirect ke halaman utama
    } catch (error) {
      console.error("Gagal membuat album:", error);
      alert("Terjadi kesalahan saat membuat album.");
    }
  };

  const handlePrev = () => {
    if (swiperInstance) swiperInstance.slidePrev();
  };

  const handleNext = () => {
    if (swiperInstance) swiperInstance.slideNext();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100">
      <div className="w-[800px] border rounded-lg p-6 relative">
        <button onClick={() => navigate(-1)} className="text-lg mb-4">
          ←
        </button>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 border">
          <div className="border p-6 flex items-center justify-center bg-gray-100 h-40 mt-6 relative">
            {previewUrls.length === 0 ? (
              <span className="text-gray-500">Tidak ada gambar</span>
            ) : (
              <>
                {/* Slider */}
                <Swiper
                  modules={[Navigation]}
                  spaceBetween={10}
                  slidesPerView={1}
                  onSwiper={setSwiperInstance} // Simpan instance di state
                  className="w-full h-full">
                  {previewUrls.map((url, index) => (
                    <SwiperSlide key={index} className="flex justify-center">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="h-full rounded-lg"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Tombol Navigasi */}
                <button
                  onClick={handlePrev}
                  className="absolute left-2 bg-gray-300 px-2 py-1 rounded-full text-lg">
                  ◀
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 bg-gray-300 px-2 py-1 rounded-full text-lg">
                  ▶
                </button>
              </>
            )}
          </div>

          <div className="p-6 flex flex-col">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tambahkan judul"
              className="w-full border-b p-2 mb-4 focus:outline-none"
              required
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi"
              className="w-full border-b p-2 mb-4 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setIsImagePickerOpen(true)}
              className="bg-gray-300 px-4 py-2 rounded-lg mt-auto">
              Pilih Gambar
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4">
              Simpan Album
            </button>
          </div>
        </form>
      </div>

      {/* Modal Pilih Gambar */}
      {isImagePickerOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-10">
          <div className="bg-white p-6 rounded-lg w-[400px] relative">
            <button
              onClick={() => setIsImagePickerOpen(false)}
              className="absolute top-2 right-2 text-lg">
              ×
            </button>
            <h2 className="text-lg font-semibold mb-4">Pilih Gambar</h2>
            <div className="flex flex-col gap-4">
              <label className="bg-gray-300 px-4 py-2 rounded-lg cursor-pointer text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                Upload dari Perangkat
              </label>
              <button
                className="bg-gray-300 px-4 py-2 rounded-lg text-center"
                onClick={() => setIsGalleryModalOpen(true)}>
                Pilih dari Galeri
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Galeri */}
      {isGalleryModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-20">
          <div className="bg-white p-6 rounded-lg w-[500px] max-h-[400px] overflow-y-auto relative">
            <button
              onClick={() => setIsGalleryModalOpen(false)}
              className="absolute top-2 right-2 text-lg">
              ×
            </button>
            <h2 className="text-lg font-semibold mb-4">
              Pilih Gambar dari Galeri
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {galleries.map((gallery) => (
                <img
                  key={gallery.id}
                  src={gallery.image_url}
                  alt={gallery.title}
                  className="w-full h-24 object-cover cursor-pointer rounded-lg border"
                  onClick={() => handleSelectGalleryImage(gallery.image_url)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAlbum;
