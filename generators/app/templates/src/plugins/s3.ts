import { extname } from 'path';

import { GetObjectCommand, S3 } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fp from 'fastify-plugin';
import slugify from 'slugify';

import type { File } from 'fastify-multer/lib/interfaces';

export interface UploadedFile {
  path: string;
}

declare module 'fastify' {
  interface FastifyInstance {
    s3: ReturnType<typeof s3PluginFuncs>;
  }
}

export interface IS3PluginOpts {
  provider?: 'aws' | 'digitalocean';
  region: string;
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
}

const s3PluginFuncs = (opts: IS3PluginOpts) => {
  const { provider, region, bucketName, accessKeyId, secretAccessKey } = opts;

  const s3Client = new S3({
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    ...(provider === 'aws'
      ? {
        region,
      }
      : {
        forcePathStyle: false,
        endpoint: `https://${region}.digitaloceanspaces.com`,
        region: 'us-east-1',
      }),
  });

  const uploadFile = async (file: File, includeTimestamp = true) => {
    const timestamp = Date.now();
    const fileKey = `${slugify(file.originalname)}${includeTimestamp ? '-' + timestamp : ''
      }${extname(file.originalname)}`;

    await s3Client.putObject({
      Bucket: bucketName,
      Key: fileKey,
      ContentType: file.mimetype,
      Body: file.buffer,
    });

    return {
      path: fileKey,
    };
  };

  async function upload(files: File, includeTimestamp?: boolean): Promise<UploadedFile>;
  async function upload(files: File[], includeTimestamp?: boolean): Promise<UploadedFile[]>;
  async function upload(
    files: File | File[],
    includeTimestamp = true,
  ): Promise<UploadedFile | UploadedFile[]> {
    if (!files) {
      return [];
    }
    if (Array.isArray(files)) {
      return await Promise.all(files.map(async (file) => uploadFile(file)));
    }
    return await uploadFile(files, includeTimestamp);
  }

  async function getFile(fileKey: string) {
    return s3Client.getObject({
      Bucket: bucketName,
      Key: fileKey,
    });
  }

  async function getPresignedUrl(fileKey: string, timeoutSeconds = 60 * 15) {
    return getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
      }),
      { expiresIn: timeoutSeconds },
    );
  }

  async function getFileSize(fileKey: string) {
    const fileInfo = await s3Client.headObject({
      Key: fileKey,
      Bucket: bucketName,
    });
    return fileInfo.ContentLength || null;
  }

  return {
    upload,
    getFile,
    getPresignedUrl,
    getFileSize,
  };
};

export const s3Plugin = fp(
  async (app, opts: IS3PluginOpts) => {
    app.decorate('s3', s3PluginFuncs(opts));
  },
  {
    name: 's3',
    dependencies: ['cfg'],
  },
);

