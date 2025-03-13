require("dotenv").config();
const express = require("express");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");
const File = require("../models/File");
const router = express.Router();

// Remove extra Express app and CORS initialization here

// AWS S3 Configuration (AWS SDK v3)
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Multer S3 Storage Configuration
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      console.log("Uploading file:", file.originalname); // Debugging
      cb(null, `uploads/${Date.now()}-${file.originalname}`);
    },
  }),
  fileFilter: function (req, file, cb) {
    console.log("File type:", file.mimetype); // Debugging
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed!"), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit: 5MB
});

// 📌 Upload File to S3 & Save to DB
router.post("/upload", upload.single("pdf"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  try {
    const newFile = new File({
      filename: req.file.originalname,
      fileUrl: req.file.location,
    });

    await newFile.save();
    res.json({ message: "File uploaded successfully!", fileUrl: req.file.location });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: "File upload failed." });
  }
});

// 📌 Fetch All Uploaded Files
router.get("/files", async (req, res) => {
  try {
    const files = await File.find().sort({ uploadedAt: -1 });
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve files." });
  }
});

module.exports = router;
  