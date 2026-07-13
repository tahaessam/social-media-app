import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

import type { ICLOUD } from "../Cloud.interface.js";

export class CloudinryService implements ICLOUD {
  constructor(
    private readonly cloudinaryClient: typeof cloudinary,
    private readonly baseFolder: string,
  ) {}

  async uploadFile(file: Express.Multer.File, path: string): Promise<string> {
    const targetPath = this.buildTargetPath(path, file.originalname);

    const uploadResult = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        const stream = this.cloudinaryClient.uploader.upload_stream(
          {
            public_id: targetPath,
            resource_type: "auto",
            overwrite: false,
          },
          (error, result) => {
            if (error || !result) {
              reject(error ?? new Error("Cloudinary upload failed"));
              return;
            }

            resolve(result);
          },
        );

        stream.end(file.buffer);
      },
    );

    return uploadResult.secure_url;
  }

  async deleteFile(key: string): Promise<void> {
    const publicId = this.extractPublicId(key);
    await this.cloudinaryClient.uploader.destroy(publicId, { invalidate: true });
  }

  async getFile(key: string): Promise<string> {
    const publicId = this.extractPublicId(key);
    return this.cloudinaryClient.url(publicId, { secure: true });
  }

  private buildTargetPath(path: string, fileName: string): string {
    const safeName = fileName.replace(/\s+/g, "-");
    const timestamp = Date.now();
    return `${this.baseFolder}/${path}/${timestamp}-${safeName}`;
  }

  private extractPublicId(key: string): string {
    if (!key.startsWith("http")) {
      return key;
    }

    const marker = "/upload/";
    const markerIndex = key.indexOf(marker);

    if (markerIndex === -1) {
      return key;
    }

    const afterUpload = key.slice(markerIndex + marker.length);
    const withoutVersion = afterUpload.replace(/^v\d+\//, "");
    const withoutExtension = withoutVersion.replace(/\.[^.]+$/, "");

    return withoutExtension;
  }
}
