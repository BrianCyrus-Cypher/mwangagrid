// Vercel serverless entry point (ESM).
// The app is bundled by `npm run build` into dist/index.mjs (it exports the
// Express app when process.env.VERCEL is set) and serves both the tRPC API
// and the built SPA from dist/public.
let app;
try {
  const mod = await import("../dist/index.mjs");
  app = mod.default;
} catch (err) {
  console.error("[api/index.mjs] Failed to load dist/index.mjs:", err);
  app = (req, res) => {
    res.status(500).json({
      error: "Failed to load app bundle",
      message: err?.message || String(err),
      hint: "If this says 'Cannot find module ../dist/index.mjs', the Vercel build command did not run npm run build.",
    });
  };
}
export default app;
