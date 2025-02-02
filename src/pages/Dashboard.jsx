import { useEffect, useState, useRef } from "react";
import axios from "axios";

const Dashboard = () => {
  const [galleries, setGalleries] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fileInputRef = useRef(null);

  const fetchGalleries = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/galleries/my-galleries", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGalleries(response.data);
    } catch (error) {
      setError("Gagal memuat galeri.");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleAddGallery = async (e) => {
    e.preventDefault();
    if (!title || !description || !imageFile) {
      setError("Semua bidang harus diisi, termasuk file gambar!");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("image", imageFile);

      const response = await axios.post("http://localhost:5000/api/galleries", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setGalleries([...galleries, response.data.gallery]);
      resetForm();
    } catch (error) {
      setError("Gagal menambahkan galeri.");
    }
  };

  const handleDeleteGallery = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus galeri ini?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/galleries/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGalleries(galleries.filter((gallery) => gallery.id !== id));
    } catch (error) {
      setError("Gagal menghapus galeri.");
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setImageFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const totalPages = Math.ceil(galleries.length / itemsPerPage);
  const displayedGalleries = galleries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Galeri Saya</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <form onSubmit={handleAddGallery} className="mb-6 bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-700">Judul</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="border rounded w-full py-2 px-3 bg-gray-50" required />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-700">Deskripsi</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="border rounded w-full py-2 px-3 bg-gray-50" required />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-700">Unggah Gambar</label>
          <input type="file" onChange={handleImageChange} className="border rounded w-full py-2 px-3 bg-gray-50" ref={fileInputRef} />
          {preview && <img src={preview} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />}
        </div>
        <button type="submit" className="bg-blue-500 text-white py-2 rounded w-full hover:bg-blue-600">Tambahkan Galeri</button>
      </form>
    </div>
  );
};

export default Dashboard;
