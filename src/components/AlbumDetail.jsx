import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const AlbumDetail = () => {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [albumTitle, setAlbumTitle] = useState("");

  useEffect(() => {
    if (!albumId) {
      console.error("Album ID is undefined");
      navigate("/profile"); // Arahkan ke halaman profil jika albumId tidak valid
      return;
    }
    const fetchPhotos = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/albums/${albumId}`
        );
        console.log("Album Data:", response.data); // Cek respons API di console
        setPhotos(response.data.photos);
        setAlbumTitle(response.data.title);
      } catch (error) {
        console.error("Error fetching album photos:", error);
      }
    };
  
    fetchPhotos();
  }, [albumId, navigate]);
  

  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center p-4">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:bg-gray-200 px-3 py-3 rounded-full text-sm font-medium">
          Kembali
        </button>
        <h1 className="ml-4 text-gray-600 text-xl font-medium">{albumTitle}</h1>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo, index) => (
              <div key={index} className="relative">
                <img
                  src={`http://localhost:5000/${photo.path}`}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-auto rounded-lg"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-lg text-center">
            Belum ada foto dalam album ini.
          </p>
        )}
      </div>
    </div>
  );
};

export default AlbumDetail;
