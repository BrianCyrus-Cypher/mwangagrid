import path from "path";
import crypto from "node:crypto";
import fs from "fs";
import os from "os";
import multer from "multer";
import express from "express";
import { requireExpressAuth } from "../_core/context";
import { ENV } from "../_core/env";

const UPLOAD_DIR = path.join(
  process.env.VERCEL ? os.tmpdir() : process.cwd(),
  "uploads"
);

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, WebP, and GIF images are allowed"));
    }
  },
});

const s3Configured = () =>
  !!(ENV.s3.region && ENV.s3.accessKeyId && ENV.s3.secretAccessKey && ENV.s3.bucket);

function objectKey(ext: string): string {
  const name = crypto.randomBytes(16).toString("hex");
  return `uploads/${name}${ext}`;
}

async function uploadToS3(
  file: Express.Multer.File
): Promise<{ url: string; key: string }> {
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  const client = new S3Client({
    region: ENV.s3.region,
    credentials: {
      accessKeyId: ENV.s3.accessKeyId,
      secretAccessKey: ENV.s3.secretAccessKey,
    },
  });

  const ext = path.extname(file.originalname).toLowerCase();
  const key = objectKey(ext);

  await client.send(
    new PutObjectCommand({
      Bucket: ENV.s3.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  if (ENV.s3.publicBaseUrl) {
    return { url: `${ENV.s3.publicBaseUrl.replace(/\/+$/, "")}/${key}`, key };
  }

  const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
  const { GetObjectCommand } = await import("@aws-sdk/client-s3");
  console.warn(
    "[Upload] S3_PUBLIC_BASE_URL is not set — returning a 7-day presigned URL. " +
      "Set S3_PUBLIC_BASE_URL (public bucket or CDN) for stable image URLs."
  );
  const url = await getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: ENV.s3.bucket, Key: key }),
    { expiresIn: 60 * 60 * 24 * 7 }
  );
  return { url, key };
}

async function uploadToDisk(
  file: Express.Multer.File
): Promise<{ url: string; key: string }> {
  const ext = path.extname(file.originalname).toLowerCase();
  const key = objectKey(ext);
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  fs.writeFileSync(path.join(UPLOAD_DIR, path.basename(key)), file.buffer);
  return { url: `/uploads/${path.basename(key)}`, key };
}

async function storeFile(file: Express.Multer.File) {
  if (s3Configured()) {
    return uploadToS3(file);
  }
  return uploadToDisk(file);
}

export function registerUploadRoutes(app: express.Express) {
  try {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
  } catch (err: any) {
    console.warn("[Upload] Could not create upload dir:", err?.message || err);
  }

  app.use("/uploads", express.static(UPLOAD_DIR));

  app.post(
    "/api/upload",
    requireExpressAuth,
    upload.array("files", 5),
    async (req, res) => {
      try {
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
          return res.status(400).json({ error: "No files uploaded" });
        }
        const urls = await Promise.all(
          files.map(async f => {
            const { url, key } = await storeFile(f);
            return { url, filename: path.basename(key) };
          })
        );
        res.json({ urls, files: urls });
      } catch (err: any) {
        console.error("[Upload] failed:", err?.message || err);
        res.status(500).json({ error: "Upload failed" });
      }
    }
  );

  app.post(
    "/api/upload/single",
    requireExpressAuth,
    upload.single("file"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }
        const { url, key } = await storeFile(req.file);
        res.json({ url, filename: path.basename(key) });
      } catch (err: any) {
        console.error("[Upload] failed:", err?.message || err);
        res.status(500).json({ error: "Upload failed" });
      }
    }
  );

  app.use(
    (
      err: any,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "File too large (max 10MB)" });
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return res.status(400).json({ error: "Too many files (max 5)" });
        }
        return res.status(400).json({ error: err.message });
      }
      if (err) {
        return res.status(400).json({ error: err.message });
      }
    }
  );
}
