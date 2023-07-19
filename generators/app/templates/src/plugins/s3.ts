import { extname } from 'path';

import { GetObjectCommand, GetObjectCommandOutput, S3 } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fp from 'fastify-plugin';
import slugify from 'slugify';

import type { File } from 'fastify-multer/lib/interfaces';

export interface UploadedFile {
  path: string;
}

declare module 'fastify' {
  interface FastifyInstance {
    s3: {
      upload: (
        files: File | File[],
        includeTimestamp?: boolean,
      ) => Promise<UploadedFile | UploadedFile[] | null>;
      getFile: (fileKey: string) => Promise<GetObjectCommandOutput | null>;
      getPresignedUrl: (fileKey: string) => Promise<string | null>;
      getFileSize: (fileKey: string) => Promise<number | null>;
    };
  }
}

export interface IS3PluginOpts {
  provider: 'aws' | 'digitalocean';
  region: string;
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export const s3Plugin = fp(async (app, opts: IS3PluginOpts) => {
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

  app.decorate('s3', {
    upload: async (
      files: File | File[],
      includeTimestamp = true,
    ): Promise<UploadedFile | UploadedFile[] | null> => {
      if (!files) {
        return [];
      }

      try {
        if (Array.isArray(files)) {
          return await Promise.all(files.map(async (file) => uploadFile(file)));
        }
        return await uploadFile(files, includeTimestamp);
      } catch {
        return null;
      }
    },

    getFile: async (fileKey: string) => {
      try {
        return await s3Client.getObject({
          Bucket: bucketName,
          Key: fileKey,
        });
      } catch {
        return null;
      }
    },

    getPresignedUrl: async (fileKey: string) => {
      try {
        const url = await getSignedUrl(
          s3Client,
          new GetObjectCommand({
            Bucket: bucketName,
            Key: fileKey,
          }),
          { expiresIn: 60 * 15 },
        );
        return url;
      } catch {
        return null;
      }
    },

    getFileSize: async (fileKey: string) => {
      try {
        const fileInfo = await s3Client.headObject({
          Key: fileKey,
          Bucket: bucketName,
        });
        return fileInfo.ContentLength || null;
      } catch {
        return null;
      }
    },
  });
});
