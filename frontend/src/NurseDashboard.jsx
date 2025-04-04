import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import Navbar from "./components/Navbar";

const API_URL = "http://192.168.110.35:5000";
const socket = io(API_URL, { withCredentials: true, transports: ["websocket", "polling"] });

const NurseDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [selectedCubicle, setSelectedCubicle] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPatient, setEditingPatient] = useState(null);
  const [editData, setEditData] = useState({ name: "", priority: "None", cubicle: "1" });

  const priorities = ["None", "PWD", "Senior Citizen", "Pregnant"];
  const cubicles = ["Cubicle 1", "Cubicle 2", "Cubicle 3", "Cubicle 4", "Cubicle 5", "MCC", "MENTAL", "MESRU", "DENTAL"];

  useEffect(() => {
    fetchPatients();

    const handleNewPatient = (newPatient) => setPatients((prev) => [...prev, newPatient]);
    const handleUpdatedPatient = (updatedPatient) => {
      setPatients((prev) => prev.map((patient) => (patient._id === updatedPatient._id ? updatedPatient : patient)));
    };
    const handleDeletedPatient = (deletedId) => {
      setPatients((prev) => prev.filter((patient) => patient._id !== deletedId));
    };

    socket.on("newPatient", handleNewPatient);
    socket.on("updatePatient", handleUpdatedPatient);
    socket.on("removePatient", handleDeletedPatient);

    return () => {
      socket.off("newPatient", handleNewPatient);
      socket.off("updatePatient", handleUpdatedPatient);
      socket.off("removePatient", handleDeletedPatient);
    };
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/patients`);
      setPatients(response.data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async () => {
    if (!editingPatient) return;
    try {
      const response = await axios.put(`${API_URL}/api/patients/${editingPatient._id}`, {
        name: editData.name,
        priority: editData.priority,
        cubicle: editData.cubicle,
      });
      socket.emit("updatePatient", response.data.patient);
      setEditingPatient(null);
    } catch (error) {
      console.error("Error updating patient:", error);
    }
  };

  const handleRemovePatient = async (id) => {
    if (!window.confirm("Are you sure you want to remove this patient?")) return;
    try {
      await axios.delete(`${API_URL}/api/patients/${id}`);
      socket.emit("removePatient", id);
    } catch (error) {
      console.error("Error removing patient:", error);
    }
  };

  const filteredPatients = patients
    .filter((patient) => selectedCubicle === "all" || patient.cubicle === selectedCubicle)
    .filter((patient) => patient.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <>
      <Navbar role="nurse" />
      <div className="p-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Nurse Dashboard</h2>

        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block font-semibold text-gray-700">Search by Name:</label>
            <input
              type="text"
              placeholder="Enter patient name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 mt-2 border rounded-lg focus:ring focus:ring-blue-300"
            />
          </div>

          <div className="flex-1">
            <label className="block font-semibold text-gray-700">Filter by Cubicle:</label>
            <select
              className="w-full p-2 mt-2 border rounded-lg focus:ring focus:ring-blue-300"
              value={selectedCubicle}
              onChange={(e) => setSelectedCubicle(e.target.value)}
            >
              <option value="all">All</option>
              {cubicles.map((cub) => (
                <option key={cub} value={cub}>
                  {cub}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Patient List */}
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 rounded-lg shadow-md">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Priority</th>
                <th className="p-3 text-left">Cubicle</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient, index) => (
                <tr
                  key={patient._id}
                  className={`transition duration-200 ${
                    index === 0
                      ? "bg-yellow-300 border-2 border-yellow-500 font-bold"
                      : index % 2 === 0
                      ? "bg-gray-100"
                      : "bg-white"
                  } hover:bg-gray-200`}
                >
                  <td className="p-3 text-left font-semibold">{patient.name}</td>
                  <td className="p-3 text-left">{patient.priority}</td>
                  <td className="p-3 text-left">{patient.cubicle}</td>
                  <td className="p-3 text-left whitespace-nowrap">
                    <button
                      onClick={() => {
                        setEditingPatient(patient);
                        setEditData({
                          name: patient.name,
                          priority: patient.priority,
                          cubicle: patient.cubicle,
                        });
                      }}
                      className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-yellow-600 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRemovePatient(patient._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit Modal */}
        {editingPatient && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-xl font-bold mb-4 text-gray-700">Edit Patient</h2>

              <input
                type="text"
                name="name"
                value={editData.name}
                onChange={handleEditChange}
                className="border p-2 w-full mb-3 rounded-lg focus:ring focus:ring-blue-300"
              />

              <select
                name="priority"
                value={editData.priority}
                onChange={handleEditChange}
                className="border p-2 w-full mb-3 rounded-lg focus:ring focus:ring-blue-300"
              >
                {priorities.map((prio) => (
                  <option key={prio} value={prio}>
                    {prio}
                  </option>
                ))}
              </select>

              <select
                name="cubicle"
                value={editData.cubicle}
                onChange={handleEditChange}
                className="border p-2 w-full mb-3 rounded-lg focus:ring focus:ring-blue-300"
              >
                {cubicles.map((cub) => (
                  <option key={cub} value={cub}>
                    {cub}
                  </option>
                ))}
              </select>

              <button onClick={saveEdit} className="w-full p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NurseDashboard;
