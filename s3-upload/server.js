const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const uploadRoutes = require("./routes/uploadRoutes");
require("dotenv").config();

// Initialize Express
const app = express();

// Configure CORS for React app (http://localhost:3000)
const corsOptions = {
  origin: 'http://localhost:3000', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Connect to MongoDB
connectDB();

// Mount the upload routes
app.use("/api", uploadRoutes);

// Start Server
const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
