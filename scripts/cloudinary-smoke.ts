import { readFile } from "node:fs/promises";
import path from "node:path";
import { config } from "dotenv";

config();

const run = async () => {
  const { default: cloudService } = await import(
    "../src/common/Cloud/cloud.provider.js"
  );

  const imagePath = path.resolve("src/Fallow-deer-dama-dama.webp");
  const buffer = await readFile(imagePath);

  const file = {
    fieldname: "file",
    originalname: path.basename(imagePath),
    encoding: "7bit",
    mimetype: "image/webp",
    size: buffer.length,
    buffer,
    destination: "",
    filename: path.basename(imagePath),
    path: imagePath,
    stream: undefined,
  } as unknown as Express.Multer.File;

  console.log("Starting Cloudinary smoke test...");

  const uploadedUrl = await cloudService.uploadFile(file, "smoke-tests");
  console.log("Uploaded URL:", uploadedUrl || "<empty>");

  if (!uploadedUrl) {
    throw new Error(
      "Upload returned empty URL. Check CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET in .env.",
    );
  }

  const readUrl = await cloudService.getFile(uploadedUrl);
  console.log("Resolved URL:", readUrl);

  await cloudService.deleteFile(uploadedUrl);
  console.log("Delete completed.");
};

run().catch((error) => {
  console.error("Cloudinary smoke test failed:", (error as Error).message);
  process.exitCode = 1;
});
