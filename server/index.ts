import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
// Remove this line: import { setupVite, serveStatic, log } from "./vite";
import { initializeDatabase } from "./db-init";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

      console.log(logLine); // Changed from log() to console.log()
    }
  });

  next();
});

async function startServer() {
  try {
    console.log("🚀 Starting The Sandwich Project server...");

    // Basic health check at root - available immediately
    app.get("/", (_req: Request, res: Response) => {
      res.status(200).json({ status: "ok" });
    });

    // Basic health checkpoint endpoint - available immediately
    app.get("/health", (_req: Request, res: Response) => {
      res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
        initialized: false,
      });
    });

    // Basic error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error("Error:", err);
      res.status(status).json({ message });
    });

    // Start listening immediately on port 5000
    const port = process.env.PORT || 5000;
    const host = "0.0.0.0";

    const httpServer = app.listen(port, host, async () => {
      console.log(`✓ Server is running on http://${host}:${port}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
      console.log("✓ Basic server ready - starting heavy initialization...");

      // Now perform heavy initialization after server is listening
      try {
        // Initialize database with seed data if empty
        await initializeDatabase();
        console.log("✓ Database initialization complete");

        const server = await registerRoutes(app);
        console.log("✓ Routes registered successfully");

        // Update health endpoint to show full initialization
        app.get("/health", (_req: Request, res: Response) => {
          res.status(200).json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || "development",
            initialized: true,
          });
        });

        // Serve static files after routes but before Vite
        app.use("/attached_assets", express.static("attached_assets"));

        // Setup Vite or static serving - CHANGED TO DYNAMIC IMPORTS
        if (app.get("env") === "development") {
          const { setupVite } = await import("./vite.js");
          await setupVite(app, server);
          console.log("✓ Vite development server setup complete");
        } else {
          const { serveStatic } = await import("./vite.js");
          serveStatic(app);
          console.log("✓ Static file serving configured for production");
        }

        console.log(
          "✓ The Sandwich Project server is fully ready to handle requests",
        );
      } catch (initError) {
        console.error("✗ Heavy initialization failed:", initError);

        // In production, try to continue with minimal functionality
        if (process.env.NODE_ENV === "production") {
          console.log(
            "Continuing with minimal functionality for production deployment...",
          );
        } else {
          console.log("Continuing with minimal development server...");
        }
      }
    });

    // Graceful shutdown handlers
    const shutdown = async (signal: string) => {
      console.log(`Received ${signal}, starting graceful shutdown...`);

      // Stop accepting new connections
      httpServer.close(() => {
        console.log("HTTP server closed gracefully");
        // Only exit after confirming server is closed
        setTimeout(() => process.exit(0), 1000);
      });

      // Force shutdown after 10 seconds only if needed
      setTimeout(() => {
        console.log("Forcing shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    // Handle termination signals
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    // Handle uncaught errors
    process.on("uncaughtException", (error) => {
      console.error("Uncaught Exception:", error);
      shutdown("uncaughtException");
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("Unhandled Rejection at:", promise, "reason:", reason);
      // Don't exit on unhandled promise rejections in production
      if (process.env.NODE_ENV !== "production") {
        shutdown("unhandledRejection");
      }
    });

    // Keep the process alive
    return httpServer;
  } catch (error) {
    console.error("✗ Server startup failed:", error);

    // In production, try to start with minimal functionality
    if (process.env.NODE_ENV === "production") {
      console.log("Attempting minimal startup for production deployment...");
      const fallbackServer = app.listen(5000, "0.0.0.0", () => {
        console.log(
          "✓ Minimal fallback server listening on http://0.0.0.0:5000",
        );
      });
      return fallbackServer;
    }

    // Don't exit in development - return a minimal server to keep process alive
    console.log("Starting minimal development server to keep process alive...");
    const minimalServer = app.listen(5000, "0.0.0.0", () => {
      console.log(
        "✓ Minimal development server listening on http://0.0.0.0:5000",
      );
    });
    return minimalServer;
  }
}

// Start the server and keep the main module active
startServer()
  .then((server) => {
    console.log("✓ Server startup sequence completed successfully");
    // Keep process alive with periodic health check
    setInterval(() => {
      console.log(
        `✓ Server health check - uptime: ${Math.round(process.uptime())}s`,
      );
    }, 300000); // Every 5 minutes

    // Return the server instance to prevent the module from exiting
    return server;
  })
  .catch((error) => {
    console.error("✗ Failed to start server:", error);
    // Instead of exiting, try to start a minimal server
    console.log("Starting emergency fallback server...");
    const emergencyServer = app.listen(5000, "0.0.0.0", () => {
      console.log(
        "✓ Emergency fallback server listening on http://0.0.0.0:5000",
      );
    });
    return emergencyServer;
  });
