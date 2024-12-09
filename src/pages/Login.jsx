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

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (isAdmin) {
        response = await axios.post(
          "http://localhost:5000/api/auth/admin/login",
          { email, password, adminCode }
        );
      } else {
        response = await axios.post("http://localhost:5000/api/auth/login", {
          email,
          password,
        });
      }
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userRole", isAdmin ? "admin" : "user");
      localStorage.setItem("userId", response.data.user_id); // Simpan user_id
      navigate(isAdmin ? "/admin-dashboard" : "/Home");
    } catch (error) {
      setError("Incorrect email or password.");
    }
  };  

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row"
      style={{ backgroundColor: "#faf8f4" }}>
      {/* Left Section */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-lg leading-relaxed font-lora text-gray-800">
          <h2 className="text-6xl mb-4">Welcome to Our Gallery</h2>
          <p className="text-6xl">Transforming spaces with art and design</p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-6 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-center mb-6">
            Sign in
          </h2>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <form onSubmit={handleLogin}>
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
                Password
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
                  Admin Code
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
                Login sebagai {isAdmin ? "User" : "Admin"}
              </button>
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 rounded w-full hover:bg-blue-600">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
