import express from 'express';
import { setupAuth } from './replitAuth';

// Simple auth test server to isolate authentication issues
export async function createAuthTestServer() {
  const app = express();
  
  // Basic middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Basic route
  app.get('/test', (req, res) => {
    res.json({ message: 'Auth test server working' });
  });
  
  try {
    // Setup authentication
    await setupAuth(app);
    console.log('✅ Auth setup completed successfully');
  } catch (error) {
    console.error('❌ Auth setup failed:', error);
    throw error;
  }
  
  return app;
}