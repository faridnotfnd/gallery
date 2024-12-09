import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const GalleryDetail = () => {
  const { id } = useParams();
  const [gallery, setGallery] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch gallery details and comments
  useEffect(() => {
    const fetchGalleryDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/galleries/${id}`
        );
        setGallery(response.data);
      } catch (error) {
        console.error("Error fetching gallery details:", error);
      }
    };

    const fetchComments = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/galleries/${id}/comments`
        );
        console.log("Fetched comments:", response.data);
        setComments(response.data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchGalleryDetails();
    fetchComments();
  }, [id]);

  // Handle add comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      setError(null); // Reset error before sending request
      await axios.post(
        `http://localhost:5000/api/galleries/${id}/comments`,
        { comment: newComment },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const response = await axios.get(
        `http://localhost:5000/api/galleries/${id}/comments`
      );
      setComments(response.data);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      setError("Gagal menambahkan komentar.");
    } finally {
      setLoading(false);
    }
  };

  if (!gallery) return <div>Loading...</div>;

  return (
    <div className="flex justify-center items-center bg-[#faf8f4] h-screen">
      <div className="flex max-w-5xl w-full bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Bagian Gambar */}
        <div className="w-2/5">
          <img
            src={`http://localhost:5000/${gallery.image_url}`}
            alt={gallery.title}
            className="w-full h-full object-cover"
          />
        </div>
        {/* Bagian Detail dan Komentar */}
        <div className="w-3/5 p-6">
          {/* Detail */}
          <div>
            <h1 className="text-2xl font-bold">{gallery.title}</h1>
            <p className="text-sm text-gray-500 mt-2">{gallery.description}</p>
            <div className="mt-2 text-sm text-gray-400">
              Posted by : {gallery.username || "Pengguna Tidak Diketahui"}
            </div>
          </div>
          {/* Komentar */}
          <div className="mt-6">
            <h2 className="text-lg font-bold mb-2">
              {comments.length} Komentar
            </h2>
            {/* Form Tambah Komentar */}
            <form onSubmit={handleAddComment} className="relative mb-4">
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tambahkan komentar..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment(e); // Kirim komentar saat Enter ditekan
                  }
                }}
                rows={3}
              />
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </form>
            {/* Daftar Komentar */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id || comment.createdAt}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-700">{comment.comment}</p>
                  <span className="text-sm text-gray-500">
                    Oleh: {comment.user?.username || "Anonim"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryDetail;
