require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const path = require("path");

// ✅ Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);

// ✅ Initialize Socket.IO for real-time communication
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// ✅ Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

// ✅ MongoDB Connection
connectDB(process.env.MONGO_URI);

// ✅ Store active users (doctors and patients)
const connectedDoctors = {};
const connectedPatients = {};

// ✅ Socket.IO Logic
io.on("connection", (socket) => {
  console.log("🟢 New connection:", socket.id);

  // Doctor joins when logged in
  socket.on("registerDoctor", (doctorName) => {
    connectedDoctors[doctorName] = socket.id;
    socket.join(doctorName);
    console.log(`👨‍⚕️ Doctor connected: ${doctorName}`);
  });

  // Patient joins when logged in
  socket.on("registerPatient", (patientName) => {
    connectedPatients[patientName] = socket.id;
    socket.join(patientName);
    console.log(`🧑‍⚕️ Patient connected: ${patientName}`);
  });

  // On disconnect
  socket.on("disconnect", () => {
    console.log("🔴 Disconnected:", socket.id);

    // Remove from doctor list
    for (const name in connectedDoctors) {
      if (connectedDoctors[name] === socket.id) {
        delete connectedDoctors[name];
        console.log(`❌ Doctor disconnected: ${name}`);
        break;
      }
    }

    // Remove from patient list
    for (const name in connectedPatients) {
      if (connectedPatients[name] === socket.id) {
        delete connectedPatients[name];
        console.log(`❌ Patient disconnected: ${name}`);
        break;
      }
    }
  });
});

/* ===================================================
   🩺 ROUTES SECTION
   =================================================== */
const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const authRoutes = require("./routes/authRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const contactRoutes = require("./routes/contactRoutes");

// ✅ Pass io and connectedDoctors to admin routes for real-time updates
const adminRoutes = require("./routes/adminRoutes")(io, connectedDoctors);

// ✅ Register All Routes
app.use("/api/auth", authRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);

// Optional extra routes
try {
  app.use("/api/programs", require("./routes/programs"));
  app.use("/api/appointments", require("./routes/appointments"));
} catch (error) {
  console.log("ℹ️ Optional routes not found, skipping...");
}

// ✅ Test route
app.get("/api", (req, res) => res.send("🏥 Rehab backend running successfully!"));

// ✅ Serve Frontend React Build in Production
const __dirnamePath = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirnamePath, "../frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirnamePath, "../frontend/build", "index.html"));
  });
}

// ✅ Attach io to app (for access in other routes)
app.set("io", io);

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

