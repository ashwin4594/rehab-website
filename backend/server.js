require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const path = require("path");
const fs = require("fs");

// ✅ Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);

// ✅ Allowed Frontend URLs
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,              // from .env (Netlify or other)
  "https://elite-rehab.netlify.app",     // ✅ your deployed frontend
  "http://localhost:5173",               // ✅ for local dev (Vite)
  "http://localhost:3000",               // optional fallback
].filter(Boolean);

// ✅ Initialize Socket.IO for real-time communication
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

// ✅ Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("❌ Blocked by CORS:", origin);
        callback(new Error("CORS policy: Origin not allowed"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

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

    // Remove doctor
    for (const name in connectedDoctors) {
      if (connectedDoctors[name] === socket.id) {
        delete connectedDoctors[name];
        console.log(`❌ Doctor disconnected: ${name}`);
      }
    }

    // Remove patient
    for (const name in connectedPatients) {
      if (connectedPatients[name] === socket.id) {
        delete connectedPatients[name];
        console.log(`❌ Patient disconnected: ${name}`);
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
  const frontendDistPath = path.join(__dirnamePath, "../frontend/dist");

  if (!fs.existsSync(frontendDistPath)) {
    console.warn(
      `⚠️ Frontend dist folder not found at ${frontendDistPath}. ` +
        `Make sure you ran 'npm run build' in the frontend.`
    );
  } else {
    app.use(express.static(frontendDistPath));

    app.get("*", (req, res) => {
      res.sendFile(path.join(frontendDistPath, "index.html"), (err) => {
        if (err) {
          console.error("Error serving index.html:", err);
          res.status(500).send("Error loading app");
        }
      });
    });
  }
}

// ✅ Attach io to app (for access in other routes)
app.set("io", io);

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
