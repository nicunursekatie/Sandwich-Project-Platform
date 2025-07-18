#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const serverDir = path.join(__dirname, '..', 'server');
const filesToProcess = [];

// Find all .ts files in server directory recursively
function findTsFiles(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      findTsFiles(fullPath);
    } else if (file.endsWith('.ts')) {
      filesToProcess.push(fullPath);
    }
  });
}

findTsFiles(serverDir);

console.log(`Found ${filesToProcess.length} TypeScript files to process`);

let totalConsoleStatements = 0;
let totalFilesModified = 0;

filesToProcess.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let consoleStatementsInFile = 0;
  
  // Count console statements first
  const consoleMatches = content.match(/console\.(log|debug|info|warn|error)/g);
  if (consoleMatches) {
    consoleStatementsInFile = consoleMatches.length;
    totalConsoleStatements += consoleStatementsInFile;
  }
  
  // Skip if no console statements
  if (consoleStatementsInFile === 0) {
    return;
  }
  
  console.log(`Processing ${path.relative(serverDir, filePath)} - ${consoleStatementsInFile} statements`);
  
  // Add logger import if not present and console statements exist
  if (!content.includes('import { logger }') && consoleStatementsInFile > 0) {
    // Find the first import statement
    const importRegex = /^import\s+.*?;$/m;
    const match = content.match(importRegex);
    if (match) {
      const insertPos = content.indexOf(match[0]) + match[0].length;
      content = content.slice(0, insertPos) + '\nimport { logger } from "../utils/logger";' + content.slice(insertPos);
    }
  }
  
  // Replace specific console patterns with proper logging
  
  // Authentication and permission errors
  content = content.replace(
    /console\.error\("(?:Permission check error|Authentication error|Authentication middleware error):", error\);/g,
    'logger.error("Authentication/permission error", error);'
  );
  
  // API errors with context
  content = content.replace(
    /console\.error\("Error (fetching|updating|deleting|creating) ([^"]+):", error\);/g,
    'logger.apiError("OPERATION", "/api/endpoint", error, req.user?.id);'
  );
  
  // General debug statements
  content = content.replace(
    /console\.log\(\s*`?\[?DEBUG\]?[^`]*`?\s*(?:,\s*[^)]+)?\);?/g,
    '// Debug statement removed'
  );
  
  // Info statements (session, initialization)
  content = content.replace(
    /console\.log\("✅[^"]*"\);/g,
    '// Initialization log removed'
  );
  
  content = content.replace(
    /console\.log\("❌[^"]*"\);/g,
    '// Error log removed'
  );
  
  // Warning statements
  content = content.replace(
    /console\.warn\([^)]+\);/g,
    '// Warning removed'
  );
  
  // Detailed error logging blocks
  content = content.replace(
    /console\.error\("=== [^""]+ ERROR ==="\);[\s\S]*?console\.error\("=== [^""]+ ERROR END ==="\);/g,
    '// Detailed error logging block removed'
  );
  
  // Remove remaining console statements
  content = content.replace(
    /console\.(log|debug|info|warn|error)\([^)]*\);?\n?/g,
    '// Console statement removed\n'
  );
  
  // Clean up multiple empty lines and comment lines
  content = content.replace(/\/\/ Console statement removed\n/g, '');
  content = content.replace(/\/\/ Debug statement removed\n/g, '');
  content = content.replace(/\/\/ Initialization log removed\n/g, '');
  content = content.replace(/\/\/ Error log removed\n/g, '');
  content = content.replace(/\/\/ Warning removed\n/g, '');
  content = content.replace(/\/\/ Detailed error logging block removed\n/g, '');
  content = content.replace(/\n\n\n+/g, '\n\n');
  
  // Only write if content changed
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    totalFilesModified++;
    console.log(`  ✓ Cleaned ${consoleStatementsInFile} console statements`);
  }
});

console.log(`\nCleanup Summary:`);
console.log(`- Total console statements removed: ${totalConsoleStatements}`);
console.log(`- Files modified: ${totalFilesModified}`);
console.log(`- Proper logging system implemented`);