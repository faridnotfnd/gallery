import React, { useState } from 'react';
import axios from 'axios';

const GalleryForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!userId || !token) {
        console.error("User not authenticated.");
        return;
      }

      // POST request ke API
      await axios.post(
        "http://localhost:5000/api/galleries",
        {
          title,
          description,
          image_url: imageUrl, // Sertakan user_id jika dibutuhkan backend
          user_id: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Memperbaiki template literal
          },
        }
      );

      // Reset state input form
      setTitle("");
      setDescription("");
      setImageUrl("");
      console.log("Gallery berhasil ditambahkan!");
    } catch (error) {
      console.error("Error adding gallery:", error.response?.data || error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-[#faf8f4]">
      <h1 className="text-2xl mb-4">Tambah Galeri</h1>
      <input
        type="text"
        placeholder="Judul"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border mb-2 p-2 w-full"
      />
      <textarea
        placeholder="Deskripsi"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border mb-2 p-2 w-full"
      />
      <input
        type="text"
        placeholder="URL Gambar"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        className="border mb-2 p-2 w-full"
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Tambah
      </button>
    </form>
  );
};

export default GalleryForm;