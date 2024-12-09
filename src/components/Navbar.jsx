import { Link, useLocation } from 'react-router-dom';
import iconImage from '../../public/img/iconicHutao.png';// Pastikan path benar

const Navbar = () => {
  const location = useLocation();

  // Hanya tampilkan Navbar di halaman Home
  if (location.pathname !== '/Home') {
    return null;
  }

  return (
    <nav className="bg-[#faf8f4] shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Gambar icon di sebelah kiri */}
        <Link to="/" className="flex items-center">
        <h2 className="text-xl font-lora mr-15">Gallery</h2>
        </Link>

        {/* Search bar di tengah */}
        <div className="flex-1 mx-4">
          <input
            type="text"
            placeholder="Telusuri Galeri"
            className="w-full p-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm text-gray-600"
          />
        </div>

        {/* Link Login di sebelah kanan */}
        <Link
          to="/my-galleries"
          className="text-sm text-gray-700 hover:text-blue-600 font-medium"
        >
          Upload
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
