import Gallery from "../models/Gallery.js";
import User from "../models/User.js"; // Make sure to import the User model
import multer from "multer";
import path from "path";
import fs from "fs";
import cache from "../config/cache.js";

// Konfigurasi penyimpanan untuk gambar yang di-upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Menyimpan gambar di folder 'uploads'
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Menggunakan nama file unik
  },
});

// Filter untuk memeriksa apakah file adalah gambar
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"), false);
  }
};

// Setup multer dengan konfigurasi storage dan filter
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Membatasi ukuran gambar maksimal 5MB
  fileFilter: fileFilter,
});

// Create Gallery dengan upload gambar
export const createGallery = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image" });
    }

    const { title, description } = req.body;
    const image_url = req.file.path; // Path gambar yang di-upload

    const gallery = await Gallery.create({
      title,
      description,
      image_url,
      user_id: req.user.id,
    });

    // Hapus cache galleries karena ada data baru
    cache.del("galleries_page1_limit5"); // Hapus cache halaman pertama

    res.status(201).json({
      message: "Gallery created successfully",
      gallery: galleryWithCategories,
    });

  } catch (error) {
    res.status(400).json({ message: "Error creating gallery", error });
  }
};

// Modifikasi getAllGalleries
export const getAllGalleries = async (req, res) => {
  try {
    let { page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 5;

    // Buat cache key berdasarkan parameter
    const cacheKey = `galleries_page${page}_limit${limit}`;

    // Cek cache dulu
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log('Data diambil dari cache'); // Tambahkan log
      return res.status(200).json(cachedData);
    }
    

    const offset = (page - 1) * limit;
    const { count, rows } = await Gallery.findAndCountAll({
      offset,
      limit,
      order: [["createdAt", "DESC"]],
    });

    const result = {
      galleries: rows,
      total: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
    };

    // Simpan ke cache
    cache.set(cacheKey, result);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: "Error fetching galleries", error });
  }
};

export const getGalleries = async (req, res) => {
  try {
    const galleries = await Gallery.findAll({
      where: { user_id: req.user.id },
    });
    res.json(galleries);
  } catch (error) {
    res.status(500).json({ message: "Error fetching galleries", error });
  }
};

// Modifikasi getGallery untuk single gallery
export const getGallery = async (req, res) => {
  try {
    const galleryId = req.params.id;
    const cacheKey = `gallery_${galleryId}`;

    // Cek cache
    const cachedGallery = cache.get(cacheKey);
    if (cachedGallery) {
      return res.status(200).json(cachedGallery);
    }

    const gallery = await Gallery.findByPk(galleryId, {
      include: [
        {
          model: User,
          attributes: ["username"],
        },
      ],
    });

    if (!gallery) {
      return res.status(404).json({ message: "Gallery not found" });
    }

    

    const galleryWithUsername = {
      ...gallery.toJSON(),
      username: gallery.User ? gallery.User.username : null,
    };

    // Simpan ke cache
    cache.set(cacheKey, galleryWithUsername);

    res.status(200).json(galleryWithUsername);
  } catch (error) {
    res.status(400).json({ message: "Error fetching gallery", error });
  }
};

// Update Gallery dengan upload gambar baru
export const updateGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findByPk(req.params.id);
    if (!gallery) {
      return res.status(404).json({ message: "Gallery not found" });
    }

    const { title, description } = req.body;

    // Jika ada file gambar baru, hapus gambar lama dan simpan yang baru
    if (req.file) {
      if (gallery.image_url) {
        fs.unlinkSync(gallery.image_url); // Hapus gambar lama
      }
      gallery.image_url = req.file.path; // Ganti dengan gambar baru
    }

    gallery.title = title;
    gallery.description = description;

    // Hapus cache untuk gallery yang diupdate
    cache.del(`gallery_${req.params.id}`);
    cache.del("galleries_page1_limit5");

    await gallery.save();
    res.status(200).json({ message: "Gallery updated successfully", gallery });
  } catch (error) {
    res.status(400).json({ message: "Error updating gallery", error });
  }
};

// Delete Gallery
export const deleteGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findByPk(req.params.id);
    if (!gallery) {
      return res.status(404).json({ message: "Gallery not found" });
    }

    // Hapus file gambar dari sistem file
    const imagePath = path.join("uploads", path.basename(gallery.image_url));
    if (fs.existsSync(imagePath)) {
      // Periksa jika file ada sebelum menghapus
      fs.unlinkSync(imagePath);
    }

     // Hapus cache untuk gallery yang dihapus
     cache.del(`gallery_${req.params.id}`);
     cache.del('galleries_page1_limit5'); 

    await gallery.destroy();
    res.status(200).json({ message: "Gallery deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error deleting gallery", error });
  }
};

// Export multer upload untuk digunakan di route
export { upload };
