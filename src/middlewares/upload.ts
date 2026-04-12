//Configures file upload middleware using Multer with Cloudinary storage for optimized image uploads.
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.config.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req: any, _file: any) => ({
    folder: "houses",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 800, quality: "auto" }],
  }),
});

export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
});
