import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import Navbar from "./components/Navbar";

const API_URL = "http://192.168.110.35:5000";
const socket = io(API_URL, { transports: ["websocket"] });

const UserDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [name, setName] = useState("");
  const [priority, setPriority] = useState("None");
  const [cubicle, setCubicle] = useState("Cubicle 1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingPatient, setEditingPatient] = useState(null);
  const [editData, setEditData] = useState({ name: "", priority: "None", cubicle: "Cubicle 1" });

  const priorities = ["None", "PWD", "Senior Citizen", "Pregnant"];
  const cubicles = ["Cubicle 1", "Cubicle 2", "Cubicle 3", "Cubicle 4", "Cubicle 5", "MCC", "MENTAL", "MESRU", "DENTAL"];

  useEffect(() => {
    fetchPatients();

    socket.on("newPatient", (newPatient) => {
      setPatients((prev) => [newPatient, ...prev]);
    });

    socket.on("updatePatient", (updatedPatient) => {
      setPatients((prev) =>
        prev.map((p) => (p._id === updatedPatient._id ? updatedPatient : p))
      );
    });

    socket.on("removePatient", (deletedPatientId) => {
      setPatients((prev) => prev.filter((p) => p._id !== deletedPatientId));
    });

    return () => {
      socket.off("newPatient");
      socket.off("updatePatient");
      socket.off("removePatient");
    };
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/patients`, { withCredentials: true });
      setPatients(response.data);
    } catch (error) {
      setError("Failed to fetch patients.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async () => {
    if (!name.trim()) {
      alert("Name is required");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API_URL}/api/patients`, { name, priority, cubicle }, { withCredentials: true });
      setName("");
      setPriority("None");
      setCubicle("Cubicle 1");
    } catch (error) {
      setError("Error adding patient.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (patient) => {
    setEditingPatient(patient);
    setEditData({ name: patient.name, priority: patient.priority, cubicle: patient.cubicle });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async () => {
    if (!editingPatient) return;

    try {
      setLoading(true);
      await axios.put(`${API_URL}/api/patients/${editingPatient._id}`, editData, { withCredentials: true });
      setEditingPatient(null);
    } catch (error) {
      setError("Error updating patient.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePatient = async (id) => {
    if (!window.confirm("Are you sure you want to remove this patient?")) return;

    try {
      setLoading(true);
      await axios.delete(`${API_URL}/api/patients/${id}`, { withCredentials: true });
    } catch (error) {
      setError("Error removing patient.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar role="encoder" />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Encoder Dashboard</h1>

        {error && <p className="text-red-500 mb-2">{error}</p>}

     {/* Add Patient */}
<div className="mb-6 p-6 border rounded-lg shadow-lg bg-white">
  <h2 className="text-2xl font-bold mb-4 text-gray-700">Add Patient</h2>

  <input type="text" placeholder="Patient Name" value={name} onChange={(e) => setName(e.target.value)}
    className="border p-3 rounded w-full mb-2 focus:ring focus:ring-blue-300 outline-none" />

  <select value={priority} onChange={(e) => setPriority(e.target.value)}
    className="border p-3 rounded w-full mb-2 bg-white focus:ring focus:ring-blue-300 outline-none">
    {priorities.map((prio) => <option key={prio} value={prio}>{prio}</option>)}
  </select>

  <select value={cubicle} onChange={(e) => setCubicle(e.target.value)}
    className="border p-3 rounded w-full mb-4 bg-white focus:ring focus:ring-blue-300 outline-none">
    {cubicles.map((c, index) => <option key={index} value={c}>{c}</option>)}
  </select>

  <button onClick={handleAddPatient}
    className="bg-blue-500 hover:bg-blue-700 text-white px-5 py-3 rounded w-full font-semibold transition duration-100">
    {loading ? "Adding..." : "Add Patient"}
  </button>
</div>

{/* Patient List */}
<div className="border p-4 rounded shadow bg-white">
  <h2 className="text-xl font-semibold mb-4 text-gray-700">Patient List</h2>

  <div className="overflow-x-auto">
    <table className="w-full border-collapse border border-gray-300">
      <thead className="bg-gray-200">
        <tr>
          <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
          <th className="border border-gray-300 px-4 py-2 text-left">Priority</th>
          <th className="border border-gray-300 px-4 py-2 text-left">Cubicle</th>
          <th className="border border-gray-300 px-4 py-2 text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {patients.map((patient) => (
          <tr key={patient._id} className="hover:bg-gray-100">
            <td className="border border-gray-300 px-4 py-2">{patient.name}</td>
            <td className="border border-gray-300 px-4 py-2">{patient.priority}</td>
            <td className="border border-gray-300 px-4 py-2">{patient.cubicle}</td>
            <td className="border border-gray-300 px-4 py-2 flex justify-center space-x-2">
              <button
                onClick={() => openEditModal(patient)}
                className="bg-yellow-300 hover:bg-yellow-600 text-black px-3 py-1 rounded transition"
              >
                Edit
              </button>
              <div></div>
              <button
                onClick={() => handleRemovePatient(patient._id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
              >
                Remove
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

        {/* Edit Modal */}
        {editingPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded shadow-md w-96">
              <h2 className="text-xl font-bold mb-4">Edit Patient</h2>
              <input
                type="text"
                name="name"
                value={editData.name}
                onChange={handleEditChange}
                className="border p-2 w-full mb-2"
              />

              <select name="priority" value={editData.priority} onChange={handleEditChange} className="border p-2 w-full mb-2">
                {priorities.map((prio) => (
                  <option key={prio} value={prio}>{prio}</option>
                ))}
              </select>

              <select name="cubicle" value={editData.cubicle} onChange={handleEditChange} className="border p-2 w-full mb-2">
                {cubicles.map((cub) => (
                  <option key={cub} value={cub}>{cub}</option>
                ))}
              </select>

              <button onClick={saveEdit} className="bg-green-500 px-4 py-2 text-white rounded">Save</button>
              <button onClick={() => setEditingPatient(null)} className="ml-2 bg-gray-500 px-4 py-2 text-white rounded">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UserDashboard;
