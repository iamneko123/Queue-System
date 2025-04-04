const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

// Configuration
dotenv.config();
const MONGO_URI = process.env.MONGO_URI || "mongodb://192.168.110.35:27017/biometDB";
const PORT = process.env.PORT || 5000;
const HOST = "192.168.110.35";
const JWT_SECRET = process.env.JWT_SECRET || "defaultsecret";

// Initialize Express and Socket.io
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://192.168.110:35:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: ["http://192.168.110.35:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Database Models
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user", "nurse"], default: "user" },
});
const User = mongoose.model("User", UserSchema);

const PatientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  priority: { type: String, enum: ["None", "PWD", "Pregnant", "Senior Citizen"], required: true },
  cubicle: { type: String, enum: ["Cubicle 1", "Cubicle 2", "Cubicle 3", "Cubicle 4", "Cubicle 5", "MCC", "MENTAL", "MESRU", "DENTAL"], required: true },
  status: { type: String, enum: ["waiting", "in-progress", "done"], default: "waiting" },
  createdAt: { type: Date, default: Date.now },
});
const Patient = mongoose.model("Patient", PatientSchema);

// Database Initialization
const initializeDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`✅ MongoDB Connected at ${MONGO_URI}`);
    
    await ensureAdminExists();
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
  }
};

const ensureAdminExists = async () => {
  try {
    const hashedPassword = await bcrypt.hash("MHO321", 10);
    
    await User.findOneAndUpdate(
      { role: "admin" },
      { username: "RHU PANGANTUCAN", password: hashedPassword },
      { upsert: true, new: true }
    );

    console.log("🟢 Default admin ensured: RHU PANGANTUCAN / MHO321");
  } catch (error) {
    console.error("❌ Error ensuring admin exists:", error);
  }
};

// Authentication Middleware
const authenticate = (req, res, next) => {
  // Implement your authentication logic here if needed
  next();
};

// Routes
const setupRoutes = () => {
  // Auth Routes
  app.post("/api/login", handleLogin);
  app.post("/api/register", handleRegister);
  
  // User Routes
  app.get("/api/users", authenticate, getUsers);
  app.delete("/api/users/:id", authenticate, deleteUser);
  
  // Patient Routes
  app.get("/api/patients", getPatients);
  app.post("/api/patients", addPatient);
  app.put("/api/patients/:id", updatePatient);
  app.delete("/api/patients/:id", deletePatient);
  app.get("/api/queue", getQueue);
};

// Route Handlers
const handleLogin = async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "30days" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, username: user.username, role: user.role },
    });

    io.emit("userLoggedIn", { id: user._id, username: user.username, role: user.role });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const handleRegister = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, role });
    await newUser.save();

    io.emit("userAdded", newUser);
    const users = await User.find({}, "-password");
    io.emit("usersUpdated", users);

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error("❌ Error registering user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log("🛠️ Deleting user with ID:", userId);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(userId);

    console.log("✅ User successfully deleted:", user);
    io.emit("userRemoved", userId); 
    const users = await User.find({}, "-password");
    io.emit("usersUpdated", users);

    res.json({ message: "User removed successfully", userId });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    console.error("❌ Error fetching patients:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const addPatient = async (req, res) => {
  try {
    const { name, priority, cubicle } = req.body;

    if (!name || !priority || !cubicle) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newPatient = new Patient({ name, priority, cubicle });
    await newPatient.save();

    io.emit("newPatient", newPatient);
    res.status(201).json({ message: "Patient added successfully", patient: newPatient });
  } catch (error) {
    console.error("❌ Error adding patient:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updatePatient = async (req, res) => {
  try {
    const { name, priority, cubicle, status } = req.body;

    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      { name, priority, cubicle, status },
      { new: true }
    );

    if (!updatedPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    io.emit("updatePatient", updatedPatient);
    res.json({ message: "Patient updated successfully", patient: updatedPatient });
  } catch (error) {
    console.error("❌ Error updating patient:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deletePatient = async (req, res) => {
  try {
    const patientId = req.params.id;
    console.log("🛠️ Deleting patient with ID:", patientId);

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      console.error("❌ Invalid patient ID format:", patientId);
      return res.status(400).json({ message: "Invalid patient ID" });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      console.error("❌ Patient not found in database:", patientId);
      return res.status(404).json({ message: "Patient not found" });
    }

    await Patient.findByIdAndDelete(patientId);

    console.log("✅ Patient successfully deleted:", patient);
    io.emit("removePatient", patientId);
    res.json({ message: "Patient removed successfully", patientId });
  } catch (error) {
    console.error("❌ Error deleting patient:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getQueue = async (req, res) => {
  try {
    const queue = await Patient.find({ status: { $ne: "done" } })
      .populate("cubicle", "name") 
      .sort({ createdAt: -1 });

    res.json(queue);
  } catch (error) {
    console.error("❌ Error fetching queue data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Initialize and Start Server
const startServer = async () => {
  await initializeDatabase();
  setupRoutes();
  
  server.listen(PORT, HOST, () => {
    console.log(`✅ Server running on http://${HOST}:${PORT}`);
  });
};

startServer();