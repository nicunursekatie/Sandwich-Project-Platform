import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
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

      log(logLine);
    }
  });

  next();
});

async function startServer() {
  try {
    console.log("🚀 Starting The Sandwich Project server...");

    // Health check route
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

    const port = process.env.PORT || 5000;
    const host = "0.0.0.0";

    const httpServer = app.listen(port, host, async () => {
      console.log(`✓ Server is running on http://${host}:${port}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
      console.log("✓ Basic server ready - starting heavy initialization...");

      try {
        await initializeDatabase();
        console.log("✓ Database initialization complete");

        const server = await registerRoutes(app);
        console.log("✓ Routes registered successfully");

        // Re-define health check to reflect full init
        app.get("/health", (_req: Request, res: Response) => {
          res.status(200).json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || "development",
            initialized: true,
          });
        });

        // Root route will be handled by Vite in development

        app.use("/attached_assets", express.static("attached_assets"));

        if (process.env.NODE_ENV === "development") {
          try {
            const { setupVite } = await import("./vite");
            await setupVite(app, server);
            console.log("✓ Vite development server setup complete");
          } catch (error) {
            console.log(
              "⚠ Vite setup failed, continuing without it:",
              error.message,
            );
          }
        } else {
          app.use(express.static("dist/public"));
          console.log("✓ Static file serving configured for production");
        }

        console.log(
          "✓ The Sandwich Project server is fully ready to handle requests",
        );
      } catch (initError) {
        console.error("✗ Heavy initialization failed:", initError);
        if (process.env.NODE_ENV === "production") {
          console.log(
            "Continuing with minimal functionality for production deployment...",
          );
        } else {
          console.log("Continuing with minimal development server...");
        }
      }
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`Received ${signal}, starting graceful shutdown...`);
      httpServer.close(() => {
        console.log("HTTP server closed gracefully");
        setTimeout(() => process.exit(0), 1000);
      });
      setTimeout(() => {
        console.log("Forcing shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    process.on("uncaughtException", (error) => {
      console.error("Uncaught Exception:", error);
      shutdown("uncaughtException");
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("Unhandled Rejection at:", promise, "reason:", reason);
      if (process.env.NODE_ENV !== "production") {
        shutdown("unhandledRejection");
      }
    });

    return httpServer;
  } catch (error) {
    console.error("✗ Server startup failed:", error);
    const fallbackServer = app.listen(5000, "0.0.0.0", () => {
      console.log("✓ Minimal fallback server listening on http://0.0.0.0:5000");
    });
    return fallbackServer;
  }
}

// Final launch
startServer()
  .then((server) => {
    console.log("✓ Server startup sequence completed successfully");
    console.log("✓ Server object:", server ? "EXISTS" : "NULL");

    setInterval(() => {
      console.log(
        `✓ KEEPALIVE - Server still listening: ${server?.listening || "UNKNOWN"}`,
      );
    }, 30000);
  })
  .catch((error) => {
    console.error("✗ Failed to start server:", error);
    process.exit(1);
  });
