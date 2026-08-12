import {
  S3Client,
  GetObjectCommand,
} from '@aws-sdk/client-s3';

function makeClient() {
  const endpoint = process.env['B2_ENDPOINT'];
  const accessKeyId = process.env['B2_KEY_ID'] ?? '';
  const secretAccessKey = process.env['B2_APPLICATION_KEY'] ?? '';

  if (!endpoint) {
    throw new Error('B2_ENDPOINT environment variable is not set');
  }

  return new S3Client({
    endpoint,
    region: 'us-east-005',
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
  });
}

const BUCKET = () => {
  const b = process.env['B2_BUCKET_NAME'];

  if (!b) {
    throw new Error('B2_BUCKET_NAME environment variable is not set');
  }

  return b;
};

export async function getFromB2(key: string) {
  const client = makeClient();

  return client.send(
    new GetObjectCommand({
      Bucket: BUCKET(),
      Key: key,
    }),
  );
}
