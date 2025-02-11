import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import { faPaperPlane, faX } from "@fortawesome/free-solid-svg-icons";
import { faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

const GalleryDetail = () => {
  const userId = parseInt(
    localStorage.getItem("userId") || localStorage.getItem("user_id")
  );
  const { id } = useParams();
  const navigate = useNavigate();
  const [gallery, setGallery] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/galleries/${id}`)
      .then((res) => setGallery(res.data))
      .catch(() => console.error("Gagal mengambil detail galeri"));

    const fetchGalleryDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/galleries/${id}`
        );
        if (response.data) {
          // Transform user_id to number immediately when setting gallery data
          const galleryData = {
            ...response.data,
            user_id: parseInt(response.data.user_id),
          };
          setGallery(galleryData);

          // Debug logs dengan tipe data
          console.log("Gallery Data:", galleryData);
          console.log("Current userId:", userId, "Type:", typeof userId);
          console.log(
            "Gallery user_id:",
            galleryData.user_id,
            "Type:",
            typeof galleryData.user_id
          );
          console.log("Are IDs equal?", userId === galleryData.user_id);
        }
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

  const handleEditGallery = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/galleries/${id}`,
        { title: editTitle, description: editDescription },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setShowEditModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Error updating gallery:", error);
    }
  };

  const handleDeleteGallery = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/galleries/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      navigate("/");
    } catch (error) {
      console.error("Error deleting gallery:", error);
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

  // Add function to handle image download
  const handleDownload = async () => {
    try {
      const response = await axios({
        url: `http://localhost:5000/${gallery.image_url}`,
        method: "GET",
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      // Extract original filename from image_url or use a default name
      const filename = gallery.image_url.split("/").pop() || "image.jpg";
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };
  if (!gallery) return <div></div>;
  // Explicit type conversion and comparison
  const isOwner = Number(userId) === Number(gallery.user_id);
  console.log("Is owner check:", isOwner, {
    userId: Number(userId),
    userIdType: typeof Number(userId),
    galleryUserId: Number(gallery.user_id),
    galleryUserIdType: typeof Number(gallery.user_id),
  });

  return (
    <div className="flex justify-center items-center bg-[#faf8f4] h-screen">
      <div className="flex max-w-5xl w-full bg-white shadow-lg rounded-xl overflow-hidden relative">
        {/* Tombol Close (X) */}
        <FontAwesomeIcon
          icon={faX}
          className="absolute top-4 left-4 text-gray-600 bg-[#f5efeb] hover:bg-[#2f4156] hover:text-white px-3 py-2.5 rounded-full text-xl cursor-pointer"
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
          {/* Tombol Elipsis */}
          <div className="absolute top-3 right-8 z-50">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="text-gray-600 text-3xl hover:scale-110 transition-transform p-2">
              <FontAwesomeIcon icon={faEllipsisH} />
            </button>

            {showOptions && (
              <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-xl w-48">
                {isOwner ? (
                  <>
                    <button
                      onClick={() => {
                        setEditTitle(gallery.title);
                        setEditDescription(gallery.description);
                        setShowEditModal(true);
                        setShowOptions(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                      Edit Galeri
                    </button>
                    <button
                      onClick={handleDeleteGallery}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">
                      Hapus Galeri
                    </button>
                  </>
                ) : null}
                <button
                  onClick={() => {
                    handleDownload();
                    setShowOptions(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                  <FontAwesomeIcon icon={faDownload} className="mr-2" />
                  Unduh Gambar
                </button>
              </div>
            )}
          </div>

          {showEditModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
              <div
                className="relative bg-white p-6 rounded-xl shadow-lg max-w-md w-full text-center"
                onClick={(e) => e.stopPropagation()}>
                <FontAwesomeIcon
                  icon={faX}
                  className="absolute top-3 right-3 w-4 h-5 text-gray-600 hover:bg-gray-200 px-2 py-1.5 rounded-full text-xl cursor-pointer"
                  onClick={() => setShowEditModal(false)}
                />

                <h2 className="text-lg font-semibold mb-4">Edit Galeri</h2>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2 mb-3 border rounded-md"
                  placeholder="Judul baru"
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-2 mb-3 border rounded-md"
                  placeholder="Deskripsi baru"
                  rows="3"></textarea>
                <div className="flex justify-center">
                  <button
                    onClick={handleEditGallery}
                    className="px-4 py-2 bg-blue-500 text-white rounded-full text-center">
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Tombol Like */}
          <button
            onClick={handleLikeToggle}
            className={`absolute top-6 right-24 ${
              liked ? "text-red-500" : "text-gray-500"
            } text-xl hover:scale-110 transition-transform`}>
            <FontAwesomeIcon icon={liked ? solidHeart : regularHeart} />
            <span className="ml-2">{likes}</span>
          </button>

          {/* Detail */}
          <div className="mt-2 text-sm text-gray-400 flex items-center">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
              alt="Profile"
              className="w-6 h-6 rounded-full mr-2"
            />
            <span
              className="text-blue-500 cursor-pointer hover:underline"
              onClick={() => {
                if (gallery && gallery.user_id) {
                  // Jika user yang sedang login adalah pemilik galeri, arahkan ke ProfilePage.jsx
                  if (gallery.user_id === userId) {
                    navigate(`/profile`);
                  } else {
                    // Jika bukan pemilik, arahkan ke ProfilePagePublic.jsx
                    navigate(`/profile/${gallery.user_id}`);
                  }
                } else {
                  console.error("User ID tidak ditemukan:", gallery);
                }
              }}>
              {gallery?.username || "Pengguna Tidak Diketahui"}
            </span>
          </div>
          {/* Deskripsi dan Tanggal Upload */}
          <p className="text-gray-600 mt-3">{gallery.description}</p>
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
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-start">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
                    alt="Profile"
                    className="w-6 h-6 rounded-full mr-2"
                  />
                  <div>
                    <span
                      className="text-sm text-blue-500 cursor-pointer hover:underline"
                      onClick={() => navigate(`/profile/${comment.User?.id}`)}>
                      {comment.User?.username || "Anonim"}
                    </span>
                    <p className="text-gray-700">{comment.comment}</p>
                  </div>
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
