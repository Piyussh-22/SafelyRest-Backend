// This file tells TypeScript what environment variables (like PORT, JWT_SECRET) exist so you don’t get errors when using process.env
declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    MONGODB_URI: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    GOOGLE_CLIENT_ID: string;
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
    FRONTEND_URL: string;
    NODE_ENV: string;
  }
}
