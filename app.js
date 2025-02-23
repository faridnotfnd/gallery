import "./models/associations.js"; // Ini akan memastikan relasi dimuat lebih dulu
import cors from "cors";
import express from "express";
import sequelize from "./config/database.js";
import authRoutes from "./routes/auth.js";
import galleryRoutes from "./routes/gallery.js";
import commentRoutes from "./routes/comment.js";
import albumRoutes from "./routes/albumRoutes.js";
import likeRoutes from "./routes/likeRoutes.js"; // Impor likeRoutes
import adminRoutes from "./routes/adminRoutes.js";
import dotenv from "dotenv";
import { imageCacheMiddleware } from "./middleware/imageCache.js";

// Memuat variabel lingkungan
dotenv.config();

const app = express();

// Konfigurasi CORS
app.use(
  cors({
    origin: "http://localhost:5174", // Alamat frontend React
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Menyediakan folder 'uploads' untuk file gambar
app.use("/uploads", imageCacheMiddleware, express.static("uploads"));

app.use("/admin", adminRoutes);

// Rute
app.use("/api/auth", authRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/galleries", galleryRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);

// Sinkronisasi dan jalankan server
sequelize.sync().then(() => {
  app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
  });
});
