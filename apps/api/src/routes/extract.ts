import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { ObjectId } from '../lib/mongo';
import { streamFileBuffer } from '../services/files';
import { extractInvoice } from '../services/gemini';

const router = Router();

router.post(
  '/',
  body('fileId').isString().notEmpty(),
  body('model').optional().isIn(['gemini']),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { fileId } = req.body as { fileId: string; model?: 'gemini' };
    try {
      const buffer = await streamFileBuffer(new ObjectId(fileId));
      const extracted = await extractInvoice(buffer);
      return res.json(extracted);
    } catch (err) {
      return res.status(500).json({ error: 'Extraction failed', details: String(err) });
    }
  }
);

export default router;


