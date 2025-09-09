import { ObjectId } from 'mongodb';
import { getBucket } from '../lib/mongo';

export async function streamFileBuffer(id: ObjectId): Promise<Buffer> {
  const bucket = getBucket();
  const chunks: Buffer[] = [];
  return new Promise<Buffer>((resolve, reject) => {
    const stream = bucket.openDownloadStream(id);
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}


