import { MongoClient, GridFSBucket, Db, Collection, ObjectId } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;
let bucket: GridFSBucket | null = null;

export async function mongoConnect(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;
  if (!uri) {
    throw new Error('MONGODB_URI is required');
  }
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  bucket = new GridFSBucket(db, { bucketName: 'pdfs' });
}

export function getDb(): Db {
  if (!db) throw new Error('MongoDB not initialized');
  return db;
}

export function getBucket(): GridFSBucket {
  if (!bucket) throw new Error('MongoDB not initialized');
  return bucket;
}

export function invoicesCollection(): Collection {
  return getDb().collection('invoices');
}

export { ObjectId };


