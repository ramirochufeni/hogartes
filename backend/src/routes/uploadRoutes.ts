import { Router } from 'express';
import multer from 'multer';
import path from 'path';

const router = Router();

// Storage config compartido
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Upload para imágenes (sin límite especial — ya existía)
const uploadImage = multer({ storage });

// Upload para videos: validación de tipo + límite 50MB
const ALLOWED_VIDEO_MIMES = ['video/mp4', 'video/webm', 'video/quicktime'];
const VIDEO_SIZE_LIMIT_MB = 50;

const uploadVideo = multer({
  storage,
  limits: { fileSize: VIDEO_SIZE_LIMIT_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_VIDEO_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de video no permitido. Usá MP4, WebM o MOV.'));
    }
  }
});

// POST /api/upload — imágenes (endpoint original)
router.post('/', uploadImage.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ninguna imagen' });
  }
  res.json({ url: `/uploads/${req.file.filename}` });
});

// POST /api/upload/video — videos
router.post('/video', (req, res, next) => {
  uploadVideo.single('video')(req, res, (err) => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: `El video supera el límite de ${VIDEO_SIZE_LIMIT_MB}MB.` });
    }
    if (err) {
      return res.status(400).json({ error: err.message || 'Error al subir el video.' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún video.' });
    }
    res.json({ url: `/uploads/${req.file.filename}` });
  });
});

export default router;
