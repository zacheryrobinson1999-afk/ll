import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Readable } from 'stream';

function getEndpoint(): string {
  const raw = process.env['B2_ENDPOINT']?.trim();

  if (!raw) {
    throw new Error('B2_ENDPOINT environment variable is not set');
  }

  const value = raw.includes('://') ? raw : `https://${raw}`;
  const url = new URL(value);

  // Backblaze S3 endpoints must use s3.<region>.backblazeb2.com
  if (
    url.hostname.endsWith('.backblazeb2.com') &&
    !url.hostname.startsWith('s3.')
  ) {
    url.hostname = `s3.${url.hostname}`;
  }

  return url.toString().replace(/\/$/, '');
}

function getRegion(): string {
  const endpoint = new URL(getEndpoint());
  const match = endpoint.hostname.match(
    /^s3\.([a-z0-9-]+)\.backblazeb2\.com$/,
  );

  if (!match) {
    throw new Error(
      'Invalid B2_ENDPOINT. Expected something like s3.us-east-005.backblazeb2.com',
    );
  }

  return match[1];
}

function makeClient() {
  const accessKeyId = process.env['B2_KEY_ID'] ?? '';
  const secretAccessKey = process.env['B2_APPLICATION_KEY'] ?? '';

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('B2 credentials are not configured');
  }

  return new S3Client({
    endpoint: getEndpoint(),
    region: getRegion(),
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
  });
}

const BUCKET = () => {
  const bucket = process.env['B2_BUCKET_NAME'];

  if (!bucket) {
    throw new Error('B2_BUCKET_NAME environment variable is not set');
  }

  return bucket;
};

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

export async function getPresignedUrl(
  key: string,
  expiresIn = 3600,
): Promise<string> {
  const client = makeClient();

  const command = new GetObjectCommand({
    Bucket: BUCKET(),
    Key: key,
  });

  return getSignedUrl(client, command, { expiresIn });
}

export async function getFromB2(key: string) {
  const client = makeClient();

  return client.send(
    new GetObjectCommand({
      Bucket: BUCKET(),
      Key: key,
    }),
  );
}

export async function deleteFromB2(key: string): Promise<void> {
  const client = makeClient();

  await client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET(),
      Key: key,
    }),
  );
}
