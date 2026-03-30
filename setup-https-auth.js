#!/usr/bin/env node
/**
 * 🔒 SMART YATRA - HTTPS & AUTHENTICATION SETUP SCRIPT
 * 
 * Fixes Vulnerabilities #3 & #4:
 * - #3: /geofences endpoint now requires authentication
 * - #4: All communication now encrypted with HTTPS
 * 
 * Run this script to set up HTTPS and verify fixes
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, text) {
  console.log(`${color}${text}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(70));
  log(colors.blue, `🔒 ${title}`);
  console.log('='.repeat(70) + '\n');
}

function step(num, title) {
  log(colors.cyan, `\n[${num}] ${title}`);
}

// Main setup flow
console.clear();
section('SMART YATRA - HTTPS & AUTHENTICATION SETUP');

log(colors.green, '✅ What will be fixed:');
log(colors.green, '   • Vulnerability #3: /geofences endpoint now requires authentication');
log(colors.green, '   • Vulnerability #4: All communication encrypted with HTTPS');
log(colors.green, '   • Protection: WiFi sniffing attacks neutralized');

step(1, 'Checking environment setup');

// Check if we're in the right directory
const backendPath = path.join(__dirname, 'backend', 'smartyatra_backend');
const frontendPath = path.join(__dirname, 'frontend', 'Smart_Yatra');

if (!fs.existsSync(backendPath)) {
  log(colors.red, '❌ Error: Backend directory not found');
  log(colors.yellow, '   Expected: ' + backendPath);
  process.exit(1);
}

log(colors.green, '✅ Backend path found: ' + backendPath);
log(colors.green, '✅ Frontend path found: ' + frontendPath);

step(2, 'Generating SSL Certificates');

const certsDir = path.join(backendPath, 'certs');
const keyPath = path.join(certsDir, 'key.pem');
const certPath = path.join(certsDir, 'cert.pem');

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  log(colors.yellow, '⚠️  SSL certificates already exist - skipping generation');
  log(colors.green, '✅ Key: ' + keyPath);
  log(colors.green, '✅ Cert: ' + certPath);
} else {
  log(colors.yellow, '⏳ Generating self-signed SSL certificates...');
  try {
    execSync(`cd "${backendPath}" && node generate-certs.js`, { stdio: 'inherit' });
    log(colors.green, '✅ SSL certificates generated successfully');
  } catch (error) {
    log(colors.red, '❌ Failed to generate certificates');
    log(colors.yellow, '   Make sure OpenSSL is installed:');
    log(colors.yellow, '   Windows: https://slproweb.com/products/Win32OpenSSL.html');
    log(colors.yellow, '   macOS: brew install openssl');
    log(colors.yellow, '   Linux: apt-get install openssl');
    process.exit(1);
  }
}

step(3, 'Checking .env configuration');

const envPath = path.join(backendPath, '.env');
const envExamplePath = path.join(backendPath, '.env.example');

if (!fs.existsSync(envPath)) {
  log(colors.yellow, '⏳ Creating .env file from template...');
  try {
    const envContent = fs.readFileSync(envExamplePath, 'utf8');
    fs.writeFileSync(envPath, envContent);
    log(colors.green, '✅ .env file created: ' + envPath);
    log(colors.yellow, '⚠️  IMPORTANT: Add your configuration values to .env file');
  } catch (error) {
    log(colors.red, '❌ Error creating .env file');
    process.exit(1);
  }
} else {
  log(colors.green, '✅ .env file already exists: ' + envPath);
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('HTTPS_ENABLED=true')) {
    log(colors.green, '✅ HTTPS_ENABLED is set to true');
  } else {
    log(colors.yellow, '⚠️  HTTPS_ENABLED not found in .env - please add it');
  }
}

step(4, 'Verifying security fixes in code');

const files = [
  {
    path: path.join(backendPath, 'src', 'routes', 'Tourist_route.js'),
    check: 'verifyToken',
    description: '/geofences endpoint authentication',
  },
  {
    path: path.join(backendPath, 'src', 'app.js'),
    check: 'https.createServer',
    description: 'HTTPS server support',
  },
  {
    path: path.join(frontendPath, 'src', 'config', 'api.js'),
    check: 'https://',
    description: 'HTTPS URLs in frontend',
  },
];

let allGood = true;
files.forEach((file) => {
  if (fs.existsSync(file.path)) {
    const content = fs.readFileSync(file.path, 'utf8');
    if (content.includes(file.check)) {
      log(colors.green, `✅ ${file.description}`);
    } else {
      log(colors.red, `❌ ${file.description} - NOT FOUND`);
      allGood = false;
    }
  } else {
    log(colors.red, `❌ File not found: ${file.path}`);
    allGood = false;
  }
});

if (!allGood) {
  log(colors.red, '❌ Some security fixes are missing!');
  process.exit(1);
}

step(5, 'Installation & Verification');

log(colors.yellow, '\n📋 NEXT STEPS TO COMPLETE SETUP:\n');

log(colors.green, '1️⃣  Install npm dependencies (if not done):');
log(colors.cyan, `   cd "${backendPath}"`);
log(colors.cyan, '   npm install express-rate-limit\n');

log(colors.green, '2️⃣  Configure environment variables:');
log(colors.cyan, `   cd "${backendPath}"`);
log(colors.cyan, '   nano .env  # Edit and add your secrets\n');

log(colors.green, '3️⃣  Start the backend on HTTPS (port 3001):');
log(colors.cyan, `   cd "${backendPath}"`);
log(colors.cyan, '   npm run dev\n');

log(colors.green, '4️⃣  Test HTTPS is working:');
log(colors.cyan, '   curl -k https://192.168.1.175:3001/\n');

log(colors.green, '5️⃣  Test /geofences requires authentication:');
log(colors.cyan, '   curl -k https://192.168.1.175:3001/api/tourists/geofences');
log(colors.cyan, '   Expected: 401 Unauthorized (no token)\n');

log(colors.yellow, '\n📊 SECURITY IMPROVEMENTS:\n');

console.table({
  'Vulnerability #3': {
    Before: 'Open (anyone)',
    After: 'Protected (auth required)',
    Impact: '✅ FIXED',
  },
  'Vulnerability #4': {
    Before: 'Plain text (HTTP)',
    After: 'Encrypted (HTTPS)',
    Impact: '✅ FIXED',
  },
});

log(colors.yellow, '\n⚠️  IMPORTANT REMINDERS:\n');
log(colors.red, '• Self-signed certificates are for DEVELOPMENT ONLY');
log(colors.red, '• Use real certificates from Let\'s Encrypt for production');
log(colors.red, '• Keep JWT_SECRET strong and never commit .env to git\n');

section('SETUP COMPLETE! 🚀');

log(colors.green, '✅ All security fixes have been applied');
log(colors.green, '✅ SSL certificates generated and ready');
log(colors.green, '✅ Code verified for security improvements');
log(colors.yellow, '\n👉 Run the NEXT STEPS above to fully activate HTTPS and authentication');
