#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');

class ExtensionPackager {
  constructor() {
    this.distDir = path.join(__dirname, '../dist');
    this.packagesDir = path.join(__dirname, '../packages');
  }

  async package() {
    console.log('📦 Packaging inline-feedback extension...');
    
    try {
      // Ensure packages directory exists
      await fs.mkdir(this.packagesDir, { recursive: true });
      
      // Read package.json for version
      const packageJson = JSON.parse(
        await fs.readFile(path.join(__dirname, '../package.json'), 'utf8')
      );
      
      const version = packageJson.version;
      const zipPath = path.join(this.packagesDir, `inline-feedback-v${version}.zip`);
      
      await this.createZip(zipPath);
      
      console.log(`✅ Extension packaged successfully: ${zipPath}`);
      
      // Also create a generic filename for CI
      const genericZipPath = path.join(this.packagesDir, 'inline-feedback.zip');
      await fs.copyFile(zipPath, genericZipPath);
      
      // Output package info
      const stats = await fs.stat(zipPath);
      console.log(`📊 Package size: ${(stats.size / 1024).toFixed(2)} KB`);
      
    } catch (error) {
      console.error('❌ Packaging failed:', error);
      process.exit(1);
    }
  }

  async createZip(outputPath) {
    return new Promise((resolve, reject) => {
      const output = require('fs').createWriteStream(outputPath);
      const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
      });

      output.on('close', () => {
        resolve();
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);

      // Add all files from dist directory
      archive.directory(this.distDir, false);

      archive.finalize();
    });
  }

  async validate() {
    console.log('🔍 Validating extension package...');
    
    try {
      // Check if dist directory exists
      await fs.access(this.distDir);
      
      // Check for required files
      const requiredFiles = [
        'manifest.json'
      ];
      
      for (const file of requiredFiles) {
        const filePath = path.join(this.distDir, file);
        try {
          await fs.access(filePath);
          console.log(`✅ Found: ${file}`);
        } catch (error) {
          console.error(`❌ Missing: ${file}`);
          throw new Error(`Required file missing: ${file}`);
        }
      }
      
      // Validate manifest.json
      const manifestPath = path.join(this.distDir, 'manifest.json');
      const manifestContent = await fs.readFile(manifestPath, 'utf8');
      const manifest = JSON.parse(manifestContent);
      
      if (!manifest.name) {
        throw new Error('Manifest missing name field');
      }
      
      if (!manifest.version) {
        throw new Error('Manifest missing version field');
      }
      
      console.log(`✅ Manifest valid: ${manifest.name} v${manifest.version}`);
      
    } catch (error) {
      console.error('❌ Validation failed:', error);
      throw error;
    }
  }
}

// CLI interface
const packager = new ExtensionPackager();

async function main() {
  try {
    await packager.validate();
    await packager.package();
  } catch (error) {
    console.error('Failed to package extension:', error);
    process.exit(1);
  }
}

main(); 