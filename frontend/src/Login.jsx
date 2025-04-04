import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

// Auto-detect local network IP for multi-device access
const localIP = window.location.hostname;
const backendURL = `http://${localIP}:5000`; // Backend URL

// Initialize Socket.IO
const socket = io(backendURL, {
  transports: ["websocket", "polling"],
  withCredentials: true,
});

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("userLoggedIn", (user) => {
      console.log(`🔹 Real-time: ${user.username} just logged in`);
    });

    return () => {
      socket.off("userLoggedIn");
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }

    try {
      const response = await fetch(`${backendURL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      const data = await response.json();
      console.log("🔍 Login Response:", data); // Debugging

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (!data.user || !data.user.role) {
        throw new Error("Invalid server response: Missing user data.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "admin") {
        navigate("/admin-dashboard");
      } else if (data.user.role === "nurse") {
        navigate("/nurse-dashboard");
      } else {
        navigate("/user-dashboard");
      }

      socket.emit("userLoggedIn", data.user);
    } catch (err) {
      console.error("❌ Login Error:", err.message);
      setError(err.message);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-b from-blue-100 to-white">
      <div className="relative w-full max-w-md p-8 bg-white bg-opacity-90 backdrop-blur-md shadow-lg rounded-2xl border border-gray-300">
        {/* Hospital Logo Placeholder */}
        <div>
</div>
          <div className="flex justify-center animate-fadeIn mb-4">
          <img 
  src="../src/rhu.jpg" 
  className="h-[170px]" 
/>
        </div>

        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6 font-serif animate-pulse tracking-wide drop-shadow-lg">
  RHU PANGANTUCAN
</h2>
        {error && <p className="text-red-600 text-center bg-red-100 p-2 rounded-md">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <label className="block text-gray-700 font-medium">Username</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <label className="block text-gray-700 font-medium">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
