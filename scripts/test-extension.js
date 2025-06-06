#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

class ExtensionTester {
  constructor() {
    this.distDir = path.join(__dirname, '../dist');
  }

  async runTests() {
    console.log('🧪 Running extension tests...');
    
    try {
      // Run Python tests first
      await this.runPythonTests();
      
      // Run JavaScript linting
      await this.runJSLinting();
      
      // Validate extension build
      await this.validateBuild();
      
      console.log('✅ All tests passed!');
      
    } catch (error) {
      console.error('❌ Tests failed:', error);
      process.exit(1);
    }
  }

  async runPythonTests() {
    console.log('🐍 Running Python tests...');
    
    return new Promise((resolve, reject) => {
      const pytest = spawn('uv', ['run', 'pytest', 'tests/', '-v'], {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });

      pytest.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Python tests passed');
          resolve();
        } else {
          reject(new Error(`Python tests failed with exit code ${code}`));
        }
      });

      pytest.on('error', (error) => {
        reject(new Error(`Failed to run Python tests: ${error.message}`));
      });
    });
  }

  async runJSLinting() {
    console.log('🔍 Running JavaScript linting...');
    
    return new Promise((resolve, reject) => {
      const eslint = spawn('npx', ['eslint', 'src/', '--ext', '.js'], {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });

      eslint.on('close', (code) => {
        if (code === 0) {
          console.log('✅ JavaScript linting passed');
          resolve();
        } else {
          reject(new Error(`JavaScript linting failed with exit code ${code}`));
        }
      });

      eslint.on('error', (error) => {
        reject(new Error(`Failed to run ESLint: ${error.message}`));
      });
    });
  }

  async validateBuild() {
    console.log('🔍 Validating extension build...');
    
    const fs = require('fs').promises;
    
    try {
      // Check if dist directory exists
      await fs.access(this.distDir);
      
      // Check for manifest.json
      const manifestPath = path.join(this.distDir, 'manifest.json');
      const manifestContent = await fs.readFile(manifestPath, 'utf8');
      const manifest = JSON.parse(manifestContent);
      
      // Basic manifest validation
      if (!manifest.name) {
        throw new Error('Manifest missing name field');
      }
      
      if (!manifest.version) {
        throw new Error('Manifest missing version field');
      }
      
      if (!manifest.manifest_version) {
        throw new Error('Manifest missing manifest_version field');
      }
      
      console.log(`✅ Extension build valid: ${manifest.name} v${manifest.version}`);
      
    } catch (error) {
      throw new Error(`Build validation failed: ${error.message}`);
    }
  }

  async runUnit() {
    console.log('🧪 Running unit tests only...');
    
    return new Promise((resolve, reject) => {
      const pytest = spawn('uv', ['run', 'pytest', 'tests/unit/', '-v'], {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });

      pytest.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Unit tests passed');
          resolve();
        } else {
          reject(new Error(`Unit tests failed with exit code ${code}`));
        }
      });
    });
  }

  async runIntegration() {
    console.log('🧪 Running integration tests only...');
    
    return new Promise((resolve, reject) => {
      const pytest = spawn('uv', ['run', 'pytest', 'tests/integration/', '-v'], {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });

      pytest.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Integration tests passed');
          resolve();
        } else {
          reject(new Error(`Integration tests failed with exit code ${code}`));
        }
      });
    });
  }
}

// CLI interface
const args = process.argv.slice(2);
const tester = new ExtensionTester();

async function main() {
  try {
    if (args.includes('--unit')) {
      await tester.runUnit();
    } else if (args.includes('--integration')) {
      await tester.runIntegration();
    } else if (args.includes('--lint')) {
      await tester.runJSLinting();
    } else if (args.includes('--validate')) {
      await tester.validateBuild();
    } else {
      await tester.runTests();
    }
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  }
}

main(); 