// 1. Load env vars immediately for local development
import "dotenv/config"; 

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { connectToDatabase } from "./db";

console.log("VERCEL:", !!process.env.VERCEL);
console.log("MONGODB_URI defined:", !!process.env.MONGODB_URI);

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// --- HELPER: Setup the App ---
// We keep this separate so we can call it differently for Vercel vs Local
async function bootstrap() {
  await connectToDatabase();
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  
  return server;
}

// --- 2. LOCAL / RENDER EXECUTION ---
// If we are NOT on Vercel, we start the server listening on a port immediately.
if (!process.env.VERCEL) {
  (async () => {
    const server = await bootstrap();
    const port = parseInt(process.env.PORT || '5000', 10);
    
    server.listen({
      port,
      host: "0.0.0.0",
    }, () => {
      log(`serving on port ${port}`);
    });
  })();
}

// --- 3. VERCEL HANDLER ---
// We define this handler for Vercel, but we only "export" it.
// We do NOT call .listen() here.
let isReady = false;

const vercelHandler = async (req: Request, res: Response) => {
  if (!isReady) {
    await bootstrap();
    isReady = true;
  }
  // Pass the request to Express
  app(req, res);
};

// --- 4. EXPORT DEFAULT (Must be top-level) ---
// Vercel looks for this. Local execution ignores it.
export default vercelHandler;