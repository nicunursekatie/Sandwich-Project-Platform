#!/usr/bin/env node

// Production startup script for deployment
// This ensures the server starts properly in production mode

console.log('🚀 Starting The Sandwich Project server...');

// Set NODE_ENV to production if not already set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

console.log(`Environment: ${process.env.NODE_ENV}`);
console.log(`Node version: ${process.version}`);
console.log(`Platform: ${process.platform}`);

// Import and start the TypeScript server using tsx
import { spawn } from 'child_process';

const server = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production'
  }
});

server.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`Server process exited with code ${code}`);
  // Don't exit the parent process - let Replit handle restart
  if (code !== 0) {
    console.log('Server exited with error code, but keeping parent process alive for restart');
  }
});

// Keep the parent process alive
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  server.kill('SIGINT');
});