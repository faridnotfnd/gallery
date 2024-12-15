import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateAlbum = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/albums", {
        title,
        description,
        user_id: userId,
      });
      alert("Album berhasil dibuat!");
      navigate("/"); // Redirect ke halaman utama
    } catch (error) {
      // Tampilkan pesan error
      const errorMessage = error.response?.data?.error || "Terjadi kesalahan pada server.";
      alert("Error: " + errorMessage);
    }    
  };

  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-2xl font-bold">Buat Album Baru</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Buat Album
        </button>
      </form>
    </div>
  );
};

export default CreateAlbum;