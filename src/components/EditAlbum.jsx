import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const EditAlbum = () => {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const response = await axios.get(`/api/albums/${id}`);
        setTitle(response.data.title);
        setDescription(response.data.description);
      } catch (error) {
        alert("Gagal memuat data album");
      }
    };
    fetchAlbum();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem("userId");
      await axios.put(`/api/albums/${id}`, {
        title,
        description,
        user_id: userId,
      });
      alert("Album berhasil diperbarui!");
      navigate("/");
    } catch (error) {
      alert("Terjadi kesalahan: " + error.response.data.error);
    }
  };

  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-2xl font-bold">Edit Album</h1>
      <form onSubmit={handleUpdate} className="mt-6 space-y-4">
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
          Perbarui Album
        </button>
      </form>
    </div>
  );
};

export default EditAlbum;