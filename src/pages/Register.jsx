import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleNavigateToLogin = () => {
    navigate("/Login"); // Arahkan ke halaman registrasi
  };
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isAdmin
        ? "http://localhost:5000/api/auth/admin/register"
        : "http://localhost:5000/api/auth/register";
      const payload = isAdmin
        ? { username, email, password, adminCode }
        : { username, email, password };

      await axios.post(endpoint, payload);
      navigate("/login"); // Navigasi ke halaman login
    } catch (error) {
      setError("Error occurred during registration. Please try again.");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row"
      style={{ backgroundColor: "#faf8f4" }}>
      {/* Seksi Kiri */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-lg leading-relaxed font-lora text-gray-800">
          <h2 className="text-6xl mb-4">Welcome to Our Cavallery</h2>
          <p className="text-6xl">Transforming spaces with art and design</p>
        </div>
      </div>

      {/* Seksi Kanan */}
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-6 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold font-lora text-center mb-6">
            Registrasi
          </h2>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="username">
                Nama Pengguna
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border rounded w-full py-2 px-3"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border rounded w-full py-2 px-3"
                required
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="password">
                Kata Sandi
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border rounded w-full py-2 px-3"
                required
              />
            </div>
            {isAdmin && (
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="adminCode">
                  Kode Admin
                </label>
                <input
                  type="password"
                  id="adminCode"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  className="border rounded w-full py-2 px-3"
                  required
                />
              </div>
            )}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setIsAdmin(!isAdmin)}
                className="text-blue-500 hover:underline">
                Registrasi sebagai {isAdmin ? "User" : "Admin"}
              </button>
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 rounded w-full hover:bg-blue-600">
              Registrasi
            </button>
          </form>

          {/* Separator */}
          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="px-3 text-gray-500 text-sm">OR</span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>

          {/* Login */}
          <button
            type="button"
            onClick={handleNavigateToLogin}
            className="flex flex-col items-center justify-center w-full border-none rounded-lg py-2 bg-transparent">
            <span className="text-gray-500">Already have an account??</span>
            <span className="text-black font-semibold text-decoration-line: underline font-lora">
              Login Now
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
