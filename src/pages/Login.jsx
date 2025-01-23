import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleNavigateToRegister = () => {
    navigate("/register");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isAdmin
        ? "http://localhost:5000/api/auth/admin/login"
        : "http://localhost:5000/api/auth/login";
      const payload = isAdmin ? { email, password, adminCode } : { email, password };
  
      const response = await axios.post(endpoint, payload);
      
      // Debug: Lihat struktur response yang sebenarnya
      console.log('Full response data:', response.data);
  
      // Simpan data di localStorage setelah login berhasil
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userRole", isAdmin ? "admin" : "user");
      localStorage.setItem("username", response.data.username);
      
      // Simpan user_id dengan pengecekan
      if (response.data.id) {
        localStorage.setItem("user_id", response.data.id.toString());
      } else if (response.data.user?.id) {
        localStorage.setItem("user_id", response.data.user.id.toString());
      } else {
        console.error('User ID not found in response');
      }
  
      // Navigasi berdasarkan role
      navigate(isAdmin ? "/admin-dashboard" : "/");
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ backgroundColor: "#faf8f4" }}>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-lg leading-relaxed font-lora text-gray-800">
          <h2 className="text-6xl mb-4">Welcome to Our Cavallery</h2>
          <p className="text-6xl">Transforming spaces with art and design</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-6 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold font-lora text-center mb-6">Sign in</h2>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
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
              <label className="block text-sm font-medium mb-1" htmlFor="password">Password</label>
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
                <label className="block text-sm font-medium mb-1" htmlFor="adminCode">Admin Code</label>
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
                Login as {isAdmin ? "User" : "Admin"}
              </button>
            </div>
            <button type="submit" className="bg-blue-500 text-white py-2 rounded w-full hover:bg-blue-600">Login</button>
          </form>
          {!isAdmin && ( // Tampilkan teks hanya jika login sebagai user
            <div>
              <div className="flex items-center my-6">
                <div className="flex-grow h-px bg-gray-300"></div>
                <span className="px-3 text-gray-500 text-sm">OR</span>
                <div className="flex-grow h-px bg-gray-300"></div>
              </div>
              <button
                type="button"
                onClick={handleNavigateToRegister}
                className="flex flex-col items-center justify-center w-full border-none rounded-lg py-2 bg-transparent">
                <span className="text-gray-500">Don't have an account?</span>
                <span className="text-black font-semibold underline font-lora">Register Now</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;