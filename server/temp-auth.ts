import type { Express, RequestHandler } from "express";
import { storage } from "./storage-wrapper";

// Extend session and request types
declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      profileImageUrl: string | null;
      role: string;
      permissions: string[];
      isActive: boolean;
    };
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        profileImageUrl: string | null;
        role: string;
        permissions: string[];
        isActive: boolean;
      };
    }
  }
}

// Temporary simple authentication for testing
export function setupTempAuth(app: Express) {
  // GET route for login page with registration capability
  app.get("/api/login", (req, res) => {
    const loginHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>The Sandwich Project - Login</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          min-height: 100vh; 
          margin: 0; 
          background-color: #f5f5f5; 
        }
        .login-card { 
          background: white; 
          padding: 2rem; 
          border-radius: 8px; 
          box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
          max-width: 400px; 
          width: 100%; 
        }
        .form-group {
          margin-bottom: 1rem;
          text-align: left;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #333;
          font-weight: bold;
        }
        .form-group input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        .btn { 
          background-color: #236383; 
          color: white; 
          border: none; 
          padding: 12px 24px; 
          border-radius: 6px; 
          cursor: pointer; 
          font-size: 16px; 
          margin: 10px 0;
          width: 100%;
        }
        .btn:hover { background-color: #1a4d61; }
        .btn-secondary {
          background-color: #6c757d;
        }
        .btn-secondary:hover {
          background-color: #545b62;
        }
        h1 { color: #236383; margin-bottom: 1rem; text-align: center; }
        p { color: #666; margin-bottom: 1.5rem; text-align: center; }
        .tab-buttons {
          display: flex;
          margin-bottom: 1rem;
        }
        .tab-btn {
          flex: 1;
          padding: 10px;
          border: none;
          background: #f8f9fa;
          cursor: pointer;
          border-bottom: 2px solid transparent;
        }
        .tab-btn.active {
          background: white;
          border-bottom-color: #236383;
          color: #236383;
        }
        .tab-content {
          display: none;
        }
        .tab-content.active {
          display: block;
        }
        .error {
          color: #dc3545;
          font-size: 14px;
          margin-top: 0.5rem;
        }
      </style>
    </head>
    <body>
      <div class="login-card">
        <h1>The Sandwich Project</h1>
        
        <div class="tab-buttons">
          <button class="tab-btn active" onclick="showTab('login')">Login</button>
          <button class="tab-btn" onclick="showTab('register')">Register</button>
        </div>

        <div id="login-tab" class="tab-content active">
          <p>Sign in to access the platform</p>
          <form id="login-form">
            <div class="form-group">
              <label for="login-email">Email:</label>
              <input type="email" id="login-email" name="email" required>
            </div>
            <div class="form-group">
              <label for="login-password">Password:</label>
              <input type="password" id="login-password" name="password" required>
            </div>
            <button type="submit" class="btn">Login</button>
          </form>
          <div id="login-error" class="error"></div>
        </div>

        <div id="register-tab" class="tab-content">
          <p>Create your account</p>
          <form id="register-form">
            <div class="form-group">
              <label for="reg-email">Email:</label>
              <input type="email" id="reg-email" name="email" required>
            </div>
            <div class="form-group">
              <label for="reg-password">Password:</label>
              <input type="password" id="reg-password" name="password" required>
            </div>
            <div class="form-group">
              <label for="reg-first-name">First Name:</label>
              <input type="text" id="reg-first-name" name="firstName" required>
            </div>
            <div class="form-group">
              <label for="reg-last-name">Last Name:</label>
              <input type="text" id="reg-last-name" name="lastName" required>
            </div>
            <button type="submit" class="btn">Register</button>
          </form>
          <div id="register-error" class="error"></div>
        </div>
      </div>

      <script>
        function showTab(tabName) {
          // Hide all tabs
          document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
          });
          document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
          });
          
          // Show selected tab
          document.getElementById(tabName + '-tab').classList.add('active');
          event.target.classList.add('active');
        }

        document.getElementById('login-form').addEventListener('submit', async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const data = Object.fromEntries(formData);
          
          try {
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
              window.location.href = '/';
            } else {
              document.getElementById('login-error').textContent = result.message || 'Login failed';
            }
          } catch (error) {
            document.getElementById('login-error').textContent = 'Login failed: ' + error.message;
          }
        });

        document.getElementById('register-form').addEventListener('submit', async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const data = Object.fromEntries(formData);
          
          try {
            const response = await fetch('/api/auth/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
              alert('Registration successful! You can now log in.');
              showTab('login');
              document.getElementById('login-email').value = data.email;
            } else {
              document.getElementById('register-error').textContent = result.message || 'Registration failed';
            }
          } catch (error) {
            document.getElementById('register-error').textContent = 'Registration failed: ' + error.message;
          }
        });
      </script>
    </body>
    </html>
    `;
    res.send(loginHtml);
  });

  // User registration endpoint
  app.post("/api/auth/register", async (req: any, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ 
          success: false, 
          message: "All fields are required" 
        });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: "User with this email already exists" 
        });
      }

      // Create new user with unique ID
      const userId = "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      const newUser = await storage.createUser({
        id: userId,
        email,
        firstName,
        lastName,
        role: "volunteer", // Default role
        permissions: ["general_chat"],
        isActive: true,
        profileImageUrl: null,
        metadata: { password } // Store password in metadata for now
      });

      res.json({ success: true, message: "Registration successful" });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ success: false, message: "Registration failed" });
    }
  });

  // User login endpoint
  app.post("/api/auth/login", async (req: any, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: "Email and password are required" 
        });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user || !user.isActive) {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid email or password" 
        });
      }

      // Check password (stored in metadata for now)
      const storedPassword = user.metadata?.password;
      if (storedPassword !== password) {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid email or password" 
        });
      }

      // Create session user object
      const sessionUser = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        role: user.role,
        permissions: user.permissions,
        isActive: user.isActive
      };

      // Store user in session
      req.session.user = sessionUser;
      req.user = sessionUser;

      res.json({ success: true, user: sessionUser });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ success: false, message: "Login failed" });
    }
  });

  // Legacy temp login endpoint (for backwards compatibility)
  app.post("/api/temp-login", async (req: any, res) => {
    try {
      // Create or get a test admin user
      const testUser = {
        id: "test-admin-user",
        email: "admin@example.com",
        firstName: "Test",
        lastName: "Admin",
        profileImageUrl: null,
        role: "admin",
        permissions: ["view_phone_directory", "edit_data", "delete_data", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "manage_users"],
        isActive: true,
      };

      // Store user in session
      req.session.user = testUser;
      
      res.json({ success: true, user: testUser });
    } catch (error) {
      console.error("Temp login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Get current user endpoint
  app.get("/api/auth/user", (req: any, res) => {
    if (req.session.user) {
      res.json(req.session.user);
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req: any, res) => {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  });
}

// Middleware to check if user is authenticated
export const isAuthenticated: RequestHandler = (req: any, res, next) => {
  if (req.session.user) {
    req.user = req.session.user;
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Permission checking middleware
export const requirePermission = (permission: string): RequestHandler => {
  return (req: any, res, next) => {
    const user = req.session.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Check role-based permissions
    if (user.role === "admin") {
      return next();
    }
    
    if (user.role === "coordinator" && !["manage_users", "system_admin"].includes(permission)) {
      return next();
    }
    
    if (user.role === "volunteer" && ["read_collections", "general_chat", "volunteer_chat"].includes(permission)) {
      return next();
    }
    
    if (user.role === "viewer" && ["read_collections", "read_reports"].includes(permission)) {
      return next();
    }
    
    res.status(403).json({ message: "Forbidden" });
  };
};

// Initialize temporary auth system with default admin user
export async function initializeTempAuth() {
  console.log("Temporary authentication system initialized");
  
  // Create default admin user if it doesn't exist
  try {
    const adminEmail = "admin@sandwich.project";
    const existingAdmin = await storage.getUserByEmail(adminEmail);
    
    if (!existingAdmin) {
      const adminId = "admin_" + Date.now();
      await storage.createUser({
        id: adminId,
        email: adminEmail,
        firstName: "Admin",
        lastName: "User",
        role: "admin",
        permissions: [],
        isActive: true,
        profileImageUrl: null,
        metadata: { password: "admin123" } // Default password for convenience
      });
      console.log("✅ Default admin user created: admin@sandwich.project / admin123");
    } else {
      console.log("✅ Default admin user already exists: admin@sandwich.project");
    }
  } catch (error) {
    console.log("❌ Could not create default admin user (using fallback):", error.message);
  }
}