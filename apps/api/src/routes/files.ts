import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getBucket } from '../lib/mongo';

const router = Router();

router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const objectId = new ObjectId(id);
    const bucket = getBucket();

    const files = await bucket.find({ _id: objectId }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = files[0] as any;
    const contentType = file.contentType || 'application/pdf';
    const filename = file.filename || `file-${id}.pdf`;

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const readStream = bucket.openDownloadStream(objectId);
    readStream.on('error', () => res.status(500).end());
    readStream.pipe(res);
  } catch (err) {
    res.status(400).json({ error: 'Invalid file id' });
  }
});

export default router;


