#!/usr/bin/env node
/**
 * Self-Signed Certificate Generator for Development
 * Generates SSL certificates for HTTPS support in development environment
 * 
 * Usage: node generate-certs.js
 * Certificates will be saved in ./certs/ directory
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const certsDir = path.join(__dirname, 'certs');

// Create certs directory if it doesn't exist
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
  console.log('✅ Created certs directory');
}

const certPath = path.join(certsDir, 'cert.pem');
const keyPath = path.join(certsDir, 'key.pem');

// Check if certificates already exist
if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  console.log('✅ Certificates already exist in ./certs/');
  console.log('   - cert.pem (certificate)');
  console.log('   - key.pem (private key)');
  process.exit(0);
}

// Generate self-signed certificate valid for 365 days
const command = `openssl req -nodes -new -x509 -keyout "${keyPath}" -out "${certPath}" -days 365 -subj "/C=IN/ST=UP/L=Noida/O=SmartYatra/CN=localhost"`;

console.log('🔒 Generating self-signed SSL certificates...');
console.log('   This certificate is for development only');

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error generating certificates:', error);
    console.error('Make sure OpenSSL is installed:');
    console.error('  Windows: https://slproweb.com/products/Win32OpenSSL.html');
    console.error('  macOS: brew install openssl');
    console.error('  Linux: apt-get install openssl');
    process.exit(1);
  }

  console.log('✅ Certificates generated successfully!');
  console.log('');
  console.log('📁 Certificate files:');
  console.log(`   - ${keyPath}`);
  console.log(`   - ${certPath}`);
  console.log('');
  console.log('⚠️  HTTPS is now enabled on port 3001');
  console.log('    Certificate: Self-signed (development only)');
  console.log('    Valid for: 365 days');
  console.log('');
  console.log('🚀 Start the server with: npm run dev');
});
