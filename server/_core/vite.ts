import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const viteModule = await import("vite");
  const isBundled = path.basename(__dirname) === "dist";
  const configPath = path.resolve(
    __dirname,
    isBundled ? "../vite.config.ts" : "../../vite.config.ts"
  );
  const viteConfigModule = await import(pathToFileURL(configPath).href);
  const createViteServer = viteModule.createServer;
  const viteConfig = viteConfigModule.default;

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        __dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Vercel bundles the function with dist/public included via includeFiles.
  // __dirname differs between local (dist/) and the Vercel function root,
  // so probe the candidate locations.
  const candidates =
    process.env.NODE_ENV === "development"
      ? [path.resolve(__dirname, "../..", "dist", "public")]
      : [
          path.resolve(__dirname, "public"),
          path.resolve(__dirname, "dist", "public"),
        ];
  const distPath = candidates.find(p => fs.existsSync(p)) ?? candidates[0];
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  // Cache static assets aggressively (hashed filenames have unique names)
  app.use(
    express.static(distPath, {
      maxAge: "1y",
      immutable: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        } else if (filePath.endsWith(".css") || filePath.endsWith(".js")) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else if (filePath.match(/\.(png|jpg|jpeg|gif|ico|svg|webp|avif)$/)) {
          res.setHeader("Cache-Control", "public, max-age=86400");
        } else {
          res.setHeader("Cache-Control", "public, max-age=3600");
        }
      },
    })
  );

  // fall through to index.html only for SPA routes (no file extension)
  app.use("*", (req, res) => {
    const ext = path.extname(req.path);
    if (ext) {
      return res.status(404).type("text/plain").send("Not found");
    }
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
