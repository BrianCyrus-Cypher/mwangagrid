// Vercel serverless entry point.
// The app is bundled by `npm run build` into dist/index.js (it exports the
// Express app when process.env.VERCEL is set) and serves both the tRPC API
// and the built SPA from dist/public.
module.exports = require("../dist/index.js");
