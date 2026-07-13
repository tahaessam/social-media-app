// aws>>s3>>return Key>>string>>path of file>> "url of file"
export interface ICLOUD {
  uploadFile(file: Express.Multer.File, path: string): Promise<string>;
  deleteFile(key: string): Promise<void>;
  getFile(key: string): Promise<string>; // return file as string (nodejs.ReadableStream)

}
