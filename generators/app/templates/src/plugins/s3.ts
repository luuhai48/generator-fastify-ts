import { extname } from 'path';

import { GetObjectCommandOutput, S3 } from '@aws-sdk/client-s3';
import { MultipartFile } from '@fastify/multipart';
import fp from 'fastify-plugin';
import slugify from 'slugify';

export interface UploadedFile {
  path: string;
}

declare module 'fastify' {
  interface FastifyInstance {
    s3: {
      upload: (
        files: MultipartFile | MultipartFile[],
      ) => Promise<UploadedFile | UploadedFile[] | undefined>;

      getFile: (fileKey: string) => Promise<GetObjectCommandOutput | undefined>;
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

  const uploadFile = async (file: MultipartFile) => {
    const timestamp = Date.now();
    const fileKey = `${slugify(file.filename)}-${timestamp}${extname(file.filename)}`;
    await s3Client.putObject({
      Bucket: bucketName,
      Key: fileKey,
      ContentType: file.mimetype,
      Body: await file.toBuffer(),
    });

    return {
      path: fileKey,
    };
  };

  app.decorate('s3', {
    upload: async (
      files: MultipartFile | MultipartFile[],
    ): Promise<UploadedFile | UploadedFile[] | undefined> => {
      try {
        if (Array.isArray(files)) {
          return Promise.all(files.map(async (file) => uploadFile(file)));
        }
        return uploadFile(files);
      } catch {
        return undefined;
      }
    },

    getFile: async (fileKey: string) => {
      try {
        return s3Client.getObject({
          Bucket: bucketName,
          Key: fileKey,
        });
      } catch {
        return undefined;
      }
    },
  });
});
