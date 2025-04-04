import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import io from "socket.io-client"; 

const socket = io("http://192.168.110.35:5000"); 

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: "", password: "", role: "user" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [removingUserId, setRemovingUserId] = useState(null);
  const navigate = useNavigate();

  const API_URL = "http://192.168.110.35:5000/api"; 

  useEffect(() => {
    fetchUsers();

    socket.on("userAdded", (newUser) => {
      setUsers((prevUsers) => [...prevUsers, newUser]);
    });

    socket.on("userRemoved", (userId) => {
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
    });

    socket.on("usersUpdated", (updatedUsers) => {
      setUsers(updatedUsers);
    });

    socket.on("userLoggedOut", (userId) => {
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
    });

    return () => {
      socket.off("userAdded");
      socket.off("userRemoved");
      socket.off("usersUpdated");
      socket.off("userLoggedOut");
    };
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users`);
      if (!response.ok) {
        throw new Error("Failed to fetch users.");
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      setError("Error fetching users.");
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Error registering user.");
      }

      alert("User registered successfully");
      setNewUser({ username: "", password: "", role: "user" });
    } catch (error) {
      setError(error.message || "Error registering user.");
      console.error("Error registering user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId, username) => {
    if (username === "RHU PANGANTUCAN") {
      alert("Cannot remove the default admin.");
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${username}?`)) {
      setRemovingUserId(userId);
      setError("");

      try {
        const response = await fetch(`${API_URL}/users/${userId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });

        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (error) {
          throw new Error("Server returned an unexpected response.");
        }

        if (!response.ok) {
          throw new Error(data.message || "Error removing user.");
        }

        alert("User removed successfully");
      } catch (error) {
        setError(error.message || "Error removing user.");
        console.error("Error removing user:", error);
      } finally {
        setRemovingUserId(null);
      }
    }
  };

  const handleLogout = () => {
    const userId = localStorage.getItem("userId"); 
    socket.emit("logout", userId); 

    localStorage.removeItem("token"); 
    localStorage.removeItem("userId"); 
    navigate("/login"); 
  };

  return (
    <div className="p-6">
      {/* ✅ Header with Logout Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <button 
          onClick={handleLogout} 
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* ✅ User Registration Form */}
      <form onSubmit={handleRegister} className="mb-6 p-4 border rounded shadow-md bg-white">
        <h3 className="text-lg font-semibold mb-2">Register User</h3>
        {error && <p className="text-red-500">{error}</p>} 

        <input
          type="text"
          placeholder="Username"
          value={newUser.username}
          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          required
          className="p-2 border rounded mb-2 w-full"
        />
        <input
          type="password"
          placeholder="Password"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          required
          className="p-2 border rounded mb-2 w-full"
        />
        <select
          value={newUser.role}
          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          className="p-2 border rounded mb-2 w-full"
        >
          <option value="user">User</option>
          <option value="nurse">Nurse</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600 transition"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      {/* ✅ User List */}
      <h3 className="text-xl font-bold mb-2">Registered Users</h3>
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table className="w-full border-collapse border bg-white shadow-md">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Username</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border">
                <td className="p-2 border">{user.username}</td>
                <td className="p-2 border">{user.role}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => handleRemove(user._id, user.username)}
                    className={`bg-red-500 text-white p-1 rounded hover:bg-red-600 transition ${
                      removingUserId === user._id ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={removingUserId === user._id}
                  >
                    {removingUserId === user._id ? "Removing..." : "Remove"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminDashboard;
