import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard'; // You'll need to create this component
import Login from './pages/Login';
import Home from './pages/Home';
import Deskripsi from './pages/Deskripsi';

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} /> {/* Login sebagai halaman awal */}
        <Route path="/home" element={<Home />} /> {/* Home dipindahkan ke /home */}
        <Route path="/my-galleries" element={<Dashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/gallery/:id" element={<Deskripsi />} />
      </Routes>
    </Router>
  );
};

export default App;
