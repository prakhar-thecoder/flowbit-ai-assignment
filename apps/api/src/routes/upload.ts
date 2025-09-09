import { Router } from 'express';
import multer from 'multer';
import { getBucket } from '../lib/mongo';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const bucket = getBucket();
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype || 'application/pdf'
    });
    uploadStream.end(req.file.buffer);
    uploadStream.on('error', (err) => {
      res.status(500).json({ error: 'Upload failed', details: String(err) });
    });
    uploadStream.on('finish', () => {
      res.json({ fileId: String(uploadStream.id), fileName: req.file!.originalname });
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal error', details: String(err) });
  }
});

export default router;


