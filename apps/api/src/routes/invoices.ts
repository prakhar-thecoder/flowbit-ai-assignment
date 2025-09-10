import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { invoicesCollection, ObjectId } from '../lib/mongo';

const router = Router();

const invoiceShape = {
  fileId: 'string',
  fileName: 'string',
  vendor: {
    name: 'string',
    address: 'string?',
    taxId: 'string?'
  },
  invoice: {
    number: 'string',
    date: 'string',
    currency: 'string?',
    subtotal: 'number?',
    taxPercent: 'number?',
    total: 'number?',
    poNumber: 'string?',
    poDate: 'string?',
    lineItems: 'Array'
  }
};

router.get('/', query('q').optional().isString(), async (req: Request, res: Response) => {
  const q = ((req.query as any)?.q as string) || '';
  const filter = q
    ? {
        $or: [
          { 'vendor.name': { $regex: q, $options: 'i' } },
          { 'invoice.number': { $regex: q, $options: 'i' } }
        ]
      }
    : {};
  const docs = await invoicesCollection()
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();
  res.json(docs.map((d: any) => ({ ...d, id: String(d._id), _id: undefined })));
});

router.get('/:id', param('id').isString(), async (req: Request<{ id: string }>, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const id = req.params.id;
  const doc = await invoicesCollection().findOne({ _id: new ObjectId(id) });
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json({ ...doc, id: String(doc._id), _id: undefined });
});

router.post(
  '/',
  body('fileId').optional({ nullable: true }).isString(),
  body('fileName').optional({ nullable: true }).isString(),
  body('vendor.name').isString(),
  body('vendor.address').optional({ nullable: true }).isString(),
  body('vendor.taxId').optional({ nullable: true }).isString(),
  body('invoice.number').isString(),
  body('invoice.date').optional({ nullable: true }).isString(),
  body('invoice.currency').optional({ nullable: true }).isString(),
  body('invoice.subtotal').optional({ nullable: true }).isNumeric(),
  body('invoice.taxPercent').optional({ nullable: true }).isNumeric(),
  body('invoice.total').optional({ nullable: true }).isNumeric(),
  body('invoice.poNumber').optional({ nullable: true }).isString(),
  body('invoice.poDate').optional({ nullable: true }).isString(),
  body('invoice.lineItems').optional({ nullable: true }).isArray(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    console.log(errors.array());
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const now = new Date().toISOString();
    const doc = { ...req.body, createdAt: now, updatedAt: now };
    const result = await invoicesCollection().insertOne(doc);
    res.status(201).json({ id: String(result.insertedId), ...doc });
  }
);

router.put(
  '/:id',
  param('id').isString(),
  body('fileId').optional({ nullable: true }).isString(),
  body('fileName').optional({ nullable: true }).isString(),
  body('vendor.name').optional({ nullable: true }).isString(),
  body('vendor.address').optional({ nullable: true }).isString(),
  body('vendor.taxId').optional({ nullable: true }).isString(),
  body('invoice.number').optional({ nullable: true }).isString(),
  body('invoice.date').optional({ nullable: true }).isString(),
  body('invoice.currency').optional({ nullable: true }).isString(),
  body('invoice.subtotal').optional({ nullable: true }).isNumeric(),
  body('invoice.taxPercent').optional({ nullable: true }).isNumeric(),
  body('invoice.total').optional({ nullable: true }).isNumeric(),
  body('invoice.poNumber').optional({ nullable: true }).isString(),
  body('invoice.poDate').optional({ nullable: true }).isString(),
  body('invoice.lineItems').optional({ nullable: true }).isArray(),
  async (req: Request<{ id: string }>, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const id = req.params.id;
    const updateResult = await invoicesCollection().updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...req.body, updatedAt: new Date().toISOString() } }
    );
    if (!updateResult.matchedCount) return res.status(404).json({ error: 'Not found' });
    const doc = await invoicesCollection().findOne({ _id: new ObjectId(id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json({ ...doc, id: String(doc._id), _id: undefined });
  }
);

router.delete('/:id', param('id').isString(), async (req: Request<{ id: string }>, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const id = req.params.id;
  const result = await invoicesCollection().deleteOne({ _id: new ObjectId(id) });
  if (!result.deletedCount) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

export default router;


