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

(async () => {
  let server = null;
  
  try {
    // Initialize database with seed data if empty
    console.log("Starting database initialization...");
    await initializeDatabase();
    console.log("✓ Database initialization completed");
    
    // Register routes and create server
    console.log("Registering routes...");
    server = await registerRoutes(app);
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
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = 5000;
    
    // Enhanced server listening with better error handling
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`✓ Server successfully listening on port ${port}`);
      log(`✓ Application startup complete`);
    });
    
    // Add error handler for server listen failures
    server.on('error', (error: any) => {
      console.error('✗ Server listen error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use`);
      } else if (error.code === 'EACCES') {
        console.error(`Permission denied to bind to port ${port}`);
      }
      process.exit(1);
    });
    
  } catch (error) {
    console.error("✗ Application startup failed:", error);
    console.error("Error details:", error.message);
    
    // Provide specific guidance for deployment errors
    if (error.message?.includes('Database connection failure')) {
      console.error("\n=== DEPLOYMENT ERROR GUIDANCE ===");
      console.error("Database connection issue detected:");
      console.error("1. Check DATABASE_URL environment variable");
      console.error("2. Verify database is properly provisioned");
      console.error("3. Ensure database endpoint is enabled");
      console.error("4. Check database service status");
      console.error("=====================================\n");
    }
    
    process.exit(1);
  }

  // Graceful shutdown handlers
  const shutdown = async (signal: string) => {
    log(`Received ${signal}, starting graceful shutdown...`);
    
    // Stop accepting new connections
    server.close(() => {
      log('HTTP server closed');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      log('Forcing shutdown after timeout');
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
})();
