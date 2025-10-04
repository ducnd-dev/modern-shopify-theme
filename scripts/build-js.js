#!/usr/bin/env node

/**
 * JavaScript Build Script
 * Compiles and optimizes JavaScript files for production
 */

const fs = require('fs');
const path = require('path');

// Import shared utilities
const { log } = require('./setup-dev.js');

class JSBuilder {
  constructor() {
    this.sourceDir = path.join(process.cwd(), 'assets');
    this.outputDir = path.join(process.cwd(), 'assets');
    this.sourceFiles = [
      'theme.js',
      'demo-setup.js'
    ];
  }

  async build() {
    log('🔨 Building JavaScript files...', 'cyan');
    
    for (const file of this.sourceFiles) {
      const sourcePath = path.join(this.sourceDir, file);
      
      if (!fs.existsSync(sourcePath)) {
        log(`⚠️  Source file not found: ${file}`, 'yellow');
        continue;
      }

      try {
        await this.processFile(sourcePath, file);
        log(`✅ Built: ${file}`, 'green');
      } catch (error) {
        log(`❌ Failed to build ${file}: ${error.message}`, 'red');
      }
    }

    log('✅ JavaScript build complete!', 'green');
  }

  async processFile(sourcePath, filename) {
    let content = fs.readFileSync(sourcePath, 'utf8');
    
    // Basic optimizations
    content = this.removeComments(content);
    content = this.optimizeCode(content);
    
    // For production builds, we could add minification here
    if (process.env.NODE_ENV === 'production') {
      content = this.minify(content);
    }

    // Write optimized file (for now, just ensure it's valid)
    const outputPath = path.join(this.outputDir, filename);
    fs.writeFileSync(outputPath, content);
  }

  removeComments(content) {
    // Remove single-line comments (but preserve URLs)
    content = content.replace(/^(\s*)\/\/(?!.*:\/\/).*$/gm, '');
    
    // Remove multi-line comments
    content = content.replace(/\/\*[\s\S]*?\*\//g, '');
    
    return content;
  }

  optimizeCode(content) {
    // Remove excessive whitespace
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // Remove trailing spaces
    content = content.replace(/[ \t]+$/gm, '');
    
    return content;
  }

  minify(content) {
    // Basic minification (in a real project, use a proper minifier)
    content = content
      .replace(/\s+/g, ' ')
      .replace(/;\s+/g, ';')
      .replace(/{\s+/g, '{')
      .replace(/\s+}/g, '}')
      .replace(/,\s+/g, ',');
    
    return content;
  }
}

async function main() {
  const builder = new JSBuilder();
  await builder.build();
}

if (require.main === module) {
  main().catch(error => {
    log(`❌ Build failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = JSBuilder;