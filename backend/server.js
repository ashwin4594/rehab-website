// Load environment variables
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

// Express app + HTTP server
const app = express();
const server = http.createServer(app);

// ----------------------------------------------------
// ✅ ALLOWED ORIGINS (Frontend URLs)
// ----------------------------------------------------
const ALLOWED_ORIGINS = [
  "https://rehab-website-rho.vercel.app",   // your deployed frontend
  "https://rehab-website.vercel.app",       // alt domain (optional)
  "http://localhost:5173",                  // Vite local dev
  "http://localhost:3000"                   // fallback local
];

// ----------------------------------------------------
// ✅ CORS MIDDLEWARE
// ----------------------------------------------------
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow mobile apps/postman
      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      console.log("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// ----------------------------------------------------
// ✅ CONNECT MONGODB
// ----------------------------------------------------
connectDB(process.env.MONGO_URI);

// ----------------------------------------------------
// ✅ SOCKET.IO INITIALIZATION
// ----------------------------------------------------
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const connectedDoctors = {};
const connectedPatients = {};

io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  socket.on("registerDoctor", (name) => {
    connectedDoctors[name] = socket.id;
    socket.join(name);
    console.log(`👨‍⚕️ Doctor connected: ${name}`);
  });

  socket.on("registerPatient", (name) => {
    connectedPatients[name] = socket.id;
    socket.join(name);
    console.log(`🧑 Patient connected: ${name}`);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Disconnected:", socket.id);

    for (let d in connectedDoctors) {
      if (connectedDoctors[d] === socket.id) delete connectedDoctors[d];
    }

    for (let p in connectedPatients) {
      if (connectedPatients[p] === socket.id) delete connectedPatients[p];
    }
  });
});

// ----------------------------------------------------
// ✅ ROUTES
// ----------------------------------------------------
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/patient", require("./routes/patientRoutes"));
app.use("/api/doctor", require("./routes/doctorRoutes"));
app.use("/api/leave", require("./routes/leaveRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));

const adminRoutes = require("./routes/adminRoutes")(io, connectedDoctors);
app.use("/api/admin", adminRoutes);

// Optional routes
try {
  app.use("/api/programs", require("./routes/programs"));
  app.use("/api/appointments", require("./routes/appointments"));
} catch {
  console.log("ℹ️ Optional routes not available.");
}

// Test API
app.get("/api", (req, res) => {
  res.send("🏥 Rehab Backend is running successfully on Render!");
});

// ----------------------------------------------------
// ❌ REMOVE FRONTEND SERVING CODE
// ----------------------------------------------------
// Your frontend is deployed separately on Vercel, so we do NOT serve its files.
// Remove build serving — this avoids Render confusion.

// DO NOT ADD:
// app.use(express.static(...))
// app.get("*", ...)

// ----------------------------------------------------
// START SERVER
// ----------------------------------------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
