#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const chokidar = require('chokidar');

class ExtensionBuilder {
  constructor(options = {}) {
    this.watch = options.watch || false;
    this.production = options.production || false;
    this.srcDir = path.join(__dirname, '../src');
    this.distDir = path.join(__dirname, '../dist');
  }

  async build() {
    console.log('🚀 Building inline-feedback extension...');
    
    try {
      await this.clean();
      await this.copyStaticFiles();
      await this.processManifest();
      await this.copyJavaScript();
      await this.copyCSS();
      await this.copyIcons();
      
      console.log('✅ Build completed successfully');
      
      if (this.watch) {
        this.startWatcher();
      }
    } catch (error) {
      console.error('❌ Build failed:', error);
      process.exit(1);
    }
  }

  async clean() {
    try {
      await fs.rmdir(this.distDir, { recursive: true });
    } catch (error) {
      // Directory might not exist
    }
    await fs.mkdir(this.distDir, { recursive: true });
  }

  async copyStaticFiles() {
    const staticFiles = [
      'popup/popup.html'
    ];

    for (const file of staticFiles) {
      const srcPath = path.join(this.srcDir, file);
      const distPath = path.join(this.distDir, file);
      
      try {
        await fs.mkdir(path.dirname(distPath), { recursive: true });
        await fs.copyFile(srcPath, distPath);
      } catch (error) {
        console.warn(`⚠️ ${file} not found, skipping...`);
      }
    }
  }

  async processManifest() {
    const manifestPath = path.join(this.srcDir, 'manifest.json');
    const distManifestPath = path.join(this.distDir, 'manifest.json');
    
    try {
      const manifestContent = await fs.readFile(manifestPath, 'utf8');
      await fs.writeFile(distManifestPath, manifestContent);
    } catch (error) {
      console.warn('⚠️ manifest.json not found, skipping...');
    }
  }

  async copyJavaScript() {
    const jsFiles = [
      'background/service-worker.js',
      'background/api-handler.js',
      'background/storage-manager.js',
      'content/content-script.js',
      'content/pdf-extractor.js',
      'content/ontology-highlighter.js',
      'content/ui-feedback.js',
      'popup/popup.js',
      'ontology/medical-materials.js',
      'ontology/medical-devices.js',
      'ontology/base-ontology.js'
    ];

    for (const file of jsFiles) {
      const srcPath = path.join(this.srcDir, file);
      const distPath = path.join(this.distDir, file);
      
      try {
        await fs.mkdir(path.dirname(distPath), { recursive: true });
        await fs.copyFile(srcPath, distPath);
      } catch (error) {
        console.warn(`⚠️ ${file} not found, skipping...`);
      }
    }
  }

  async copyCSS() {
    const cssFiles = [
      'styles/overlay.css',
      'styles/ontology.css',
      'popup/popup.css'
    ];

    for (const file of cssFiles) {
      const srcPath = path.join(this.srcDir, file);
      const distPath = path.join(this.distDir, file);
      
      try {
        await fs.mkdir(path.dirname(distPath), { recursive: true });
        await fs.copyFile(srcPath, distPath);
      } catch (error) {
        console.warn(`⚠️ ${file} not found, skipping...`);
      }
    }
  }

  async copyIcons() {
    const iconFiles = [
      'icons/icon16.png',
      'icons/icon48.png',
      'icons/icon128.png'
    ];

    for (const file of iconFiles) {
      const srcPath = path.join(this.srcDir, file);
      const distPath = path.join(this.distDir, file);
      
      try {
        await fs.mkdir(path.dirname(distPath), { recursive: true });
        await fs.copyFile(srcPath, distPath);
      } catch (error) {
        console.warn(`⚠️ ${file} not found, skipping...`);
      }
    }
  }

  startWatcher() {
    console.log('👀 Watching for changes...');
    
    chokidar.watch(this.srcDir).on('change', async (filePath) => {
      console.log(`📝 File changed: ${filePath}`);
      
      // Rebuild only the changed file type
      const ext = path.extname(filePath);
      const relativePath = path.relative(this.srcDir, filePath);
      
      try {
        if (ext === '.js') {
          const distPath = path.join(this.distDir, relativePath);
          await fs.mkdir(path.dirname(distPath), { recursive: true });
          await fs.copyFile(filePath, distPath);
        } else if (ext === '.css') {
          const distPath = path.join(this.distDir, relativePath);
          await fs.mkdir(path.dirname(distPath), { recursive: true });
          await fs.copyFile(filePath, distPath);
        } else if (relativePath === 'manifest.json') {
          await this.processManifest();
        } else {
          await this.build();
        }
        console.log('✅ Rebuild completed');
      } catch (error) {
        console.error('❌ Rebuild failed:', error);
      }
    });
  }
}

// CLI interface
const args = process.argv.slice(2);
const options = {
  watch: args.includes('--watch'),
  production: args.includes('--production')
};

new ExtensionBuilder(options).build(); 