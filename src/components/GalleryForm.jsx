import React, { useState } from 'react';
import axios from 'axios';

const GalleryForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token'); // Ambil token dari local storage
      await axios.post('http://localhost:5000/api/galleries', {
        title,
        description,
        image_url: imageUrl,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Reset form setelah sukses
      setTitle('');
      setDescription('');
      setImageUrl('');
    } catch (error) {
      console.error('Error adding gallery:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
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
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Tambah
      </button>
    </form>
  );
};

export default GalleryForm;
