import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { json } from 'express';
import { mongoConnect } from './lib/mongo';
import uploadRouter from './routes/upload';
import extractRouter from './routes/extract';
import invoicesRouter from './routes/invoices';

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(json({ limit: '2mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/upload', uploadRouter);
app.use('/extract', extractRouter);
app.use('/invoices', invoicesRouter);

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

mongoConnect()
  .then(() => {
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`API listening on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });


