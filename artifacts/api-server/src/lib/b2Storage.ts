import { S3Client, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Readable } from 'stream';

function makeClient() {
  const endpoint = process.env['B2_ENDPOINT'];
  const accessKeyId = process.env['B2_KEY_ID'] ?? '';
  const secretAccessKey = process.env['B2_APPLICATION_KEY'] ?? '';

  if (!endpoint) {
    throw new Error('B2_ENDPOINT environment variable is not set');
  }

  return new S3Client({
    endpoint,
    region: 'auto',
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true, // required for Backblaze B2 S3-compatible API
  });
}

const BUCKET = () => {
  const b = process.env['B2_BUCKET_NAME'];
  if (!b) throw new Error('B2_BUCKET_NAME environment variable is not set');
  return b;
};

/**
 * Stream-upload a file to Backblaze B2.
 * Returns the object key (not a URL) — call getPresignedUrl to get a readable link.
 */
export async function uploadToB2(
  body: Readable | Buffer,
  key: string,
  contentType: string,
): Promise<string> {
  const client = makeClient();
  const upload = new Upload({
    client,
    params: {
      Bucket: BUCKET(),
      Key: key,
      Body: body,
      ContentType: contentType,
    },
  });
  await upload.done();
  return key;
}

/**
 * Generate a time-limited pre-signed URL for a stored object.
 * Default TTL is 1 hour.
 */
export async function getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
  const client = makeClient();
  const cmd = new GetObjectCommand({ Bucket: BUCKET(), Key: key });
  return getSignedUrl(client, cmd, { expiresIn });
}

/**
 * Permanently delete an object from B2.
 */
export async function deleteFromB2(key: string): Promise<void> {
  const client = makeClient();
  await client.send(new DeleteObjectCommand({ Bucket: BUCKET(), Key: key }));
}
