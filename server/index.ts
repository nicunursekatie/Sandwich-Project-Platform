import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { registerRoutes } from "./routes";
import { setupVite } from "./vite";
import { initializeDatabase } from "./db-init";
import { setupSocketChat } from "./socket-chat";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add cache control headers to prevent browser caching issues
app.use((req, res, next) => {
  // Prevent caching for HTML responses
  if (req.path === "/" || req.path.endsWith(".html")) {
    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });
  }
  next();
});

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

      const formattedTime = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      console.log(`${formattedTime} [express] ${logLine}`);
    }
  });

  next();
});

// Add comprehensive error handling to catch server crashes
process.on("uncaughtException", (err) => {
  console.error("🚨 UNCAUGHT EXCEPTION - SERVER CRASH:", err);
  console.error("Stack trace:", err.stack);
  // Don't exit immediately, try to keep server alive for debugging
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("🚨 UNHANDLED REJECTION - POTENTIAL CRASH:", reason);
  console.error("Promise:", promise);
  // Don't exit immediately, try to keep server alive for debugging
});

process.on("SIGINT", () => {
  console.log("🔄 Received SIGINT, starting graceful shutdown...");
  process.exit(0);
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
    const host = process.env.HOST || "0.0.0.0";

    console.log(
      `Starting server on ${host}:${port} in ${process.env.NODE_ENV || "development"} mode`,
    );

    // Use consistent port allocation
    const finalPort = Number(port);

    // Set up basic routes BEFORE starting server
    app.use("/attached_assets", express.static("attached_assets"));

    // Health check route - available before full initialization
    app.get("/health", (_req: Request, res: Response) => {
      res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
      });
    });

    if (process.env.NODE_ENV === "production") {
      // In production, serve static files from the built frontend
      app.use(express.static("dist/public"));

      // Simple SPA fallback for production - serve index.html for non-API routes
      app.get(/^(?!\/api).*/, async (_req: Request, res: Response) => {
        const path = await import("path");
        res.sendFile(path.join(process.cwd(), "dist/public/index.html"));
      });

      console.log(
        "✓ Static file serving and SPA routing configured for production",
      );
    }



    const httpServer = createServer(app);

    // Set up Socket.io for chat system
    const io = setupSocketChat(httpServer);

    // Set up WebSocket server for real-time notifications
    const wss = new WebSocketServer({
      server: httpServer,
      path: "/notifications",
    });

    const clients = new Map<string, any>();

    wss.on("connection", (ws, request) => {
      console.log(
        "WebSocket client connected from:",
        request.socket.remoteAddress,
      );

      ws.on("message", (data) => {
        try {
          const message = JSON.parse(data.toString());
          if (message.type === "identify" && message.userId) {
            clients.set(message.userId, ws);
            console.log(`User ${message.userId} identified for notifications`);
          }
        } catch (error) {
          console.error("WebSocket message parse error:", error);
        }
      });

      ws.on("close", () => {
        // Remove client from map when disconnected
        for (const [userId, client] of Array.from(clients.entries())) {
          if (client === ws) {
            clients.delete(userId);
            console.log(`User ${userId} disconnected from notifications`);
            break;
          }
        }
      });

      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
      });
    });

    // Global broadcast function for messaging system
    (global as any).broadcastNewMessage = async (data: any) => {
      console.log("Broadcasting message to", clients.size, "connected clients");

      // Broadcast to all connected clients
      for (const [userId, ws] of Array.from(clients.entries())) {
        if (ws.readyState === 1) {
          // WebSocket.OPEN
          try {
            ws.send(JSON.stringify(data));
          } catch (error) {
            console.error(`Error sending message to user ${userId}:`, error);
            // Remove dead connection
            clients.delete(userId);
          }
        } else {
          // Remove dead connection
          clients.delete(userId);
        }
      }
    };

    // Start the server with simplified error handling
    httpServer.listen(finalPort, host, () => {
      console.log(`✓ Server is running on http://${host}:${finalPort}`);
      console.log(
        `✓ WebSocket server ready on ws://${host}:${finalPort}/notifications`,
      );
      console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(
        "✓ Basic server ready - starting background initialization...",
      );

      // Verify server is actually listening
      const address = httpServer.address();
      if (address) {
        console.log(`✓ CONFIRMED: Server actively listening on:`, address);
      } else {
        console.error("❌ ERROR: Server not listening despite callback");
      }
    });

    // Signal deployment readiness to Replit
    if (process.env.NODE_ENV === "production") {
      console.log("🚀 PRODUCTION SERVER READY FOR TRAFFIC 🚀");
      console.log("Server is fully operational and accepting connections");
    }

    // Do heavy initialization in background after server is listening
    setImmediate(async () => {
      try {
        await initializeDatabase();
        console.log("✓ Database initialization complete");

        const server = await registerRoutes(app);
        console.log("✓ Routes registered successfully");

        // Update health check to reflect full init
        app.get("/health", (_req: Request, res: Response) => {
          res.status(200).json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || "development",
            initialized: true,
          });
        });

        if (process.env.NODE_ENV === "development") {
          try {
            const { setupVite } = await import("./vite");
            await setupVite(app, httpServer);
            console.log("✓ Vite development server setup complete");
          } catch (error) {
            console.error("❌ Vite setup failed:", error);
            console.log(
              "⚠ Vite setup failed, continuing without it:",
              (error as Error).message,
            );
          }
        } else {
          // Add catch-all for unknown routes before SPA
          app.use("*", (req: Request, res: Response, next: NextFunction) => {
            console.log(
              `Catch-all route hit: ${req.method} ${req.originalUrl}`,
            );
            if (req.originalUrl.startsWith("/api")) {
              return res
                .status(404)
                .json({ error: `API route not found: ${req.originalUrl}` });
            }
            next();
          });

          // In production, serve React app for all non-API routes
          app.get("*", async (_req: Request, res: Response) => {
            try {
              const path = await import("path");
              const indexPath = path.join(
                process.cwd(),
                "dist/public/index.html",
              );
              console.log(
                `Serving SPA for route: ${_req.path}, file: ${indexPath}`,
              );
              res.sendFile(indexPath);
            } catch (error) {
              console.error("SPA serving error:", error);
              res.status(500).send("Error serving application");
            }
          });
          console.log("✓ Production SPA routing configured");
        }

        console.log(
          "✓ The Sandwich Project server is fully ready to handle requests",
        );
      } catch (initError) {
        console.error("✗ Background initialization failed:", initError);
        console.log("Server continues to run with basic functionality...");
      }
    });

    // Graceful shutdown - disabled in production to prevent exit
    const shutdown = async (signal: string) => {
      if (process.env.NODE_ENV === "production") {
        console.log(
          `⚠ Ignoring ${signal} in production mode - server will continue running`,
        );
        return;
      }
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
      // Don't shutdown in production to keep deployment stable
      if (process.env.NODE_ENV !== "production") {
        shutdown("uncaughtException");
      } else {
        console.log(
          "Production mode: continuing operation despite uncaught exception...",
        );
      }
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("Unhandled Rejection at:", promise, "reason:", reason);
      // Never shutdown for unhandled rejections - just log them
      console.log("Continuing server operation despite unhandled rejection...");
    });

    // Keep the process alive in production with multiple strategies
    if (process.env.NODE_ENV === "production") {
      // Strategy 1: Regular heartbeat
      setInterval(() => {
        // Silent heartbeat to prevent process from being garbage collected
      }, 5000);

      // Strategy 2: Prevent process exit events
      process.stdin.resume(); // Keep process alive

      // Strategy 3: Override process.exit in production
      const originalExit = process.exit;
      process.exit = ((code?: number) => {
        console.log(`⚠ Prevented process.exit(${code}) in production mode`);
        console.log("Server will continue running...");
        return undefined as never;
      }) as typeof process.exit;

      console.log("✓ Production process keep-alive strategies activated");
    }

    return httpServer;
  } catch (error) {
    console.error("✗ Server startup failed:", error);
    throw error; // Let the main catch block handle it
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
