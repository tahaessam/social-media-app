import { v2 as cloudinary } from "cloudinary";

import type { ICLOUD } from "./Cloud.interface.js";
import { CloudinryService } from "./cloudinry/cloudinry.service.js";
// import { S3Client } from "@aws-sdk/client-s3";
// import { S3CloudService } from "./S3/S3.service.js";

class NoopCloudService implements ICLOUD {
  async uploadFile(file: Express.Multer.File, path: string): Promise<string> {
    console.warn(
      `Cloud provider is not configured. Skipping upload for ${path}/${file.originalname}.`,
    );
    return "";
  }

  async deleteFile(_key: string): Promise<void> {
    return Promise.resolve();
  }

  async getFile(key: string): Promise<string> {
    return key;
  }
}

const createCloudinaryService = (): ICLOUD | null => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn(
      "Cloudinary environment variables are incomplete. Required: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.",
    );
    return null;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  const folder = process.env.CLOUDINARY_FOLDER ?? "social-media-app";
  return new CloudinryService(cloudinary, folder);
};

// S3 implementation is intentionally disabled.
// Keep this block as reference in case S3 is re-enabled later.
// const createS3Service = (): ICLOUD | null => {
//   const region = process.env.AWS_REGION;
//   const bucket = process.env.AWS_BUCKET_NAME;
//
//   if (!region || !bucket) {
//     console.warn(
//       "S3 environment variables are incomplete. Required: AWS_REGION, AWS_BUCKET_NAME.",
//     );
//     return null;
//   }
//
//   const s3Client = new S3Client({ region });
//   return new S3CloudService(s3Client, bucket);
// };

export const createCloudService = (): ICLOUD => {
  return createCloudinaryService() ?? new NoopCloudService();
};

const cloudService = createCloudService();

export default cloudService;
