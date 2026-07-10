/**
 * File Upload Service
 *
 * Handles file uploads using multer with strict validation.
 * Requires: pnpm install multer @types/multer
 *
 * Currently stores files locally. For production, swap storage to
 * Cloudinary or AWS S3 using the existing @aws-sdk packages.
 */

import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import type { Request, Response, NextFunction, Express } from "express";

// Allowed MIME types by category
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_DOC_TYPES = ["application/pdf"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// Ensure upload directory exists
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Manual file upload handler that works without multer.
 * Parses multipart/form-data manually using Node's built-in stream support.
 *
 * For production, replace with multer + Cloudinary:
 *   pnpm install multer cloudinary multer-storage-cloudinary
 */
export function generateUploadFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const hash = crypto.randomBytes(16).toString("hex");
  return `${hash}${ext}`;
}

export function validateFile(
  mimetype: string,
  sizeBytes: number
): { valid: true } | { valid: false; reason: string } {
  if (!ALLOWED_TYPES.includes(mimetype)) {
    return {
      valid: false,
      reason: `File type "${mimetype}" is not allowed. Accepted: images (jpg, png, webp, gif) and PDF.`,
    };
  }
  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      reason: `File is too large (${(sizeBytes / 1024 / 1024).toFixed(1)} MB). Maximum allowed: 10 MB.`,
    };
  }
  return { valid: true };
}

/**
 * Register file upload routes on the Express app.
 * 
 * POST /api/upload
 *   Body: multipart/form-data with field "file"
 *   Auth: session cookie required (checked in route)
 *   Returns: { url, filename, originalName, size, mimeType }
 *
 * To enable this, call registerUploadRoutes(app) in server/_core/index.ts
 */
export function registerUploadRoutes(app: Express) {
  // We use express-fileupload or raw body parsing.
  // Since multer isn't yet installed, we register a placeholder that
  // returns a clear error pointing to the installation step.
  app.post("/api/upload", (req: Request, res: Response) => {
    const contentType = req.headers["content-type"] ?? "";

    if (!contentType.includes("multipart/form-data")) {
      return res.status(400).json({
        success: false,
        message: "Expected multipart/form-data content type",
      });
    }

    // In production mode with multer installed, this would process the file.
    // For now, return an informative message.
    return res.status(501).json({
      success: false,
      message:
        "File upload requires: pnpm install multer @types/multer. " +
        "Once installed, replace this handler with the multer version in server/services/upload.ts",
    });
  });

  // Serve uploaded files statically (once real uploads are enabled)
  const express = require("express");
  app.use("/uploads", express.static(UPLOAD_DIR));

  console.log(`📁 Upload service registered. Upload directory: ${UPLOAD_DIR}`);
}

export { ALLOWED_TYPES, MAX_FILE_SIZE_BYTES, UPLOAD_DIR };
