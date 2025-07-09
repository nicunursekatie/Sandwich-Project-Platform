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
    
    // Initialize database with seed data if empty
    await initializeDatabase();
    console.log("✓ Database initialization complete");
    
    const server = await registerRoutes(app);
    console.log("✓ Routes registered successfully");
    
    // Serve static files after routes but before Vite
    app.use('/attached_assets', express.static('attached_assets'));

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error("Error:", err);
      res.status(status).json({ message });
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
      console.log("✓ Vite development server setup complete");
    } else {
      serveStatic(app);
      console.log("✓ Static file serving configured for production");
    }

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = 5000;
    
    const httpServer = server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      console.log(`✓ Server is running on http://0.0.0.0:${port}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log("✓ The Sandwich Project server is ready to handle requests");
    });

    // Graceful shutdown handlers
    const shutdown = async (signal: string) => {
      console.log(`Received ${signal}, starting graceful shutdown...`);
      
      // Stop accepting new connections
      httpServer.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.log('Forcing shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle termination signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      shutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      // Don't exit on unhandled promise rejections in production
      if (process.env.NODE_ENV !== 'production') {
        shutdown('unhandledRejection');
      }
    });

    // Keep the process alive
    return httpServer;
    
  } catch (error) {
    console.error("✗ Server startup failed:", error);
    
    // In production, try to start with minimal functionality
    if (process.env.NODE_ENV === 'production') {
      console.log("Attempting minimal startup for production deployment...");
      const fallbackServer = app.listen(5000, '0.0.0.0', () => {
        console.log('✓ Minimal fallback server listening on port 5000');
      });
      return fallbackServer;
    }
    
    process.exit(1);
  }
}

// Start the server and keep the main module active
startServer().then((server) => {
  console.log("✓ Server startup sequence completed successfully");
  // Return the server instance to prevent the module from exiting
  return server;
}).catch((error) => {
  console.error("✗ Failed to start server:", error);
  process.exit(1);
});
