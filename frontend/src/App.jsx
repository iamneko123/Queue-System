import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';
import NurseDashboard from './NurseDashboard';
import TVDisplay from './pages/TVDisplay'; 

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin-dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        <Route path="/user-dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
        <Route path="/nurse-dashboard" element={<PrivateRoute><NurseDashboard /></PrivateRoute>} />
        <Route path="/tv-display" element={<TVDisplay />} /> {/* ✅ Added TV Display Route */}
        <Route path="*" element={window.location.pathname === "/tv-display" ? <TVDisplay /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
