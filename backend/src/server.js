require("dotenv").config();
const express = require("express");
const compression = require("compression");
const cors = require("cors");
const os = require("os");
const path = require("path");
const connectDB = require("./config/database");
const errorHandler = require("./middleware/errorHandler");

// Import routes
const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const chartRoutes = require("./routes/chartRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const moneyInRoutes = require("./routes/moneyInRoutes");
const landingRoutes = require("./routes/landingRoutes");

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(compression());
app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, "../public")));

// Note: Legal pages are now handled within the Next.js application

// Get network IP address
const getNetworkIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
};

const PORT = process.env.PORT || 3000;
const networkIP = getNetworkIP();

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Fynace API is running",
    timestamp: new Date().toISOString(),
    localUrl: `http://localhost:${PORT}`,
    networkUrl: `http://${networkIP}:${PORT}`,
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/chart", chartRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/money-in", moneyInRoutes);
app.use("/api/landing", landingRoutes);
app.use("/api/sync", require("./routes/syncRoutes"));
app.use("/api/banks", require("./routes/bankRoutes"));

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 Local: http://localhost:${PORT}/health`);
  console.log(`🌐 Network: http://${networkIP}:${PORT}/health`);
});
