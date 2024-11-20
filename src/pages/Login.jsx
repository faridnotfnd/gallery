import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (isAdmin) {
        response = await axios.post('http://localhost:5000/api/auth/admin/login', { email, password, adminCode });
      } else {
        response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      }
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', isAdmin ? 'admin' : 'user');
      navigate(isAdmin ? '/admin-dashboard' : '/my-galleries');
    } catch (error) {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('img/wallpaperflare.com_wallpaper.jpg')" }}>
      <div
        className="bg-white p-8 rounded-lg shadow-md w-96 bg-cover bg-center"
        style={{ backgroundImage: "url('https://i.pinimg.com/736x/04/48/6e/04486e81a5a2692e8f0b65a9a4b6db73.jpg')" }}
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Login</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="mb-4 text-start">
            <span className="text-white">Login sebagai </span>
            <button
              type="button"
              onClick={() => setIsAdmin(!isAdmin)}
              className="text-blue-300 hover:text-blue-100 focus:outline-none"
            >
              {isAdmin ? 'User' : 'Admin'}
            </button>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-white" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded w-full py-2 px-3 bg-opacity-50 bg-white"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-white" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border rounded w-full py-2 px-3 bg-opacity-50 bg-white"
              required
            />
          </div>
          {isAdmin && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-white" htmlFor="adminCode">Admin Code</label>
              <input
                type="password"
                id="adminCode"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="border rounded w-full py-2 px-3 bg-opacity-50 bg-white"
                required
              />
            </div>
          )}
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 rounded w-full hover:bg-blue-600"
          >
            Login as {isAdmin ? 'Admin' : 'User'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;