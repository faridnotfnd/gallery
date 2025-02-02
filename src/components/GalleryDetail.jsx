import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import { faPaperPlane, faX } from "@fortawesome/free-solid-svg-icons";

const GalleryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gallery, setGallery] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
          `http://localhost:5000/api/comments/${id}`
        );
        setComments(response.data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    const fetchLikes = async () => {
      try {
        const user_id = localStorage.getItem("user_id");

        const likesResponse = await axios.get(
          `http://localhost:5000/api/likes/count/${id}`
        );
        setLikes(likesResponse.data.like_count);

        const userLikedResponse = await axios.post(
          `http://localhost:5000/api/likes/user/${id}`,
          { user_id },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setLiked(userLikedResponse.data.liked);
      } catch (error) {
        console.error("Error fetching likes:", error);
      }
    };

    fetchGalleryDetails();
    fetchComments();
    fetchLikes();
  }, [id]);

  const handleLikeToggle = async () => {
    try {
      const user_id = localStorage.getItem("user_id");
      if (!user_id) {
        console.error("User ID tidak ditemukan di localStorage.");
        return;
      }

      if (liked) {
        await axios.delete(`http://localhost:5000/api/likes/${id}`, {
          data: { user_id },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setLikes((prev) => prev - 1);
      } else {
        await axios.post(
          `http://localhost:5000/api/likes`,
          { gallery_id: id, user_id },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setLikes((prev) => prev + 1);
      }
      setLiked(!liked);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      setError(null);
      await axios.post(
        `http://localhost:5000/api/comments/${id}`,
        { comment: newComment },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const response = await axios.get(
        `http://localhost:5000/api/comments/${id}`
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

  if (!gallery) return <div></div>;

  return (
    <div className="flex justify-center items-center bg-[#faf8f4] h-screen">
      <div className="flex max-w-5xl w-full bg-white shadow-lg rounded-xl overflow-hidden relative">
        {/* Tombol Close (X) di pojok kiri atas */}
        <FontAwesomeIcon
          icon={faX}
          className="absolute top-4 left-4 text-gray-600 hover:bg-gray-200 px-3 py-2 rounded-full text-xl cursor-pointer"
          onClick={() => navigate(-1)}
        />

        {/* Bagian Gambar */}
        <div className="w-2/5">
          <img
            src={`http://localhost:5000/${gallery.image_url}`}
            alt={gallery.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Bagian Detail dan Komentar */}
        <div className="w-3/5 p-6 relative">
          {/* Tombol Like */}
          <button
            onClick={handleLikeToggle}
            className={`absolute top-6 right-8 ${
              liked ? "text-red-500" : "text-gray-500"
            } text-xl hover:scale-110 transition-transform`}>
            <FontAwesomeIcon icon={liked ? solidHeart : regularHeart} />
            <span className="ml-2">{likes}</span>
          </button>

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
              <div className="relative">
                <textarea
                  className="w-full p-3 pr-12 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tambahkan komentar..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault(); // Mencegah pembuatan baris baru
                      handleAddComment(e); // Memanggil fungsi untuk mengirim komentar
                    }
                  }}
                  rows={3}
                />
                {/* Tombol Kirim di dalam Placeholder (Textarea) */}
                <button
                  type="submit"
                  className="absolute top-3 right-3 text-gray-500 hover:text-blue-500">
                  <FontAwesomeIcon icon={faPaperPlane} className="text-lg" />
                </button>
              </div>
            </form>
            {error && <p className="text-red-500 mt-2">{error}</p>}

            {/* Daftar Komentar */}
            <div className="space-y-4 max-h-60 overflow-y-auto border-t border-gray-200 pt-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <span className="text-sm text-gray-500">
                    {comment.User?.username || "Anonim"}
                  </span>
                  <p className="text-gray-700">{comment.comment}</p>
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
