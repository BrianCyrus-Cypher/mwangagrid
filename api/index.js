// Vercel serverless entry point.
// The app is bundled by `npm run build` into dist/index.js (it exports the
// Express app when process.env.VERCEL is set) and serves both the tRPC API
// and the built SPA from dist/public.
let app;
try {
  app = require("../dist/index.js");
} catch (err) {
  console.error("[api/index.js] Failed to load dist/index.js:", err);
  app = (req, res) => {
    res.status(500).json({
      error: "Failed to load app bundle",
      message: err?.message || String(err),
      hint: "If this says 'Cannot find module ../dist/index.js', the Vercel build command did not run npm run build.",
    });
  };
}
module.exports = app;
