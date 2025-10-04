#!/usr/bin/env node

/**
 * JavaScript Watch Script
 * Watches JavaScript files for changes and rebuilds automatically
 */

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

// Import shared utilities
const { log } = require('./setup-dev.js');
const JSBuilder = require('./build-js.js');

class JSWatcher {
  constructor() {
    this.builder = new JSBuilder();
    this.sourceDir = path.join(process.cwd(), 'assets');
    this.watchPatterns = [
      path.join(this.sourceDir, '*.js'),
      path.join(this.sourceDir, '**/*.js')
    ];
  }

  start() {
    log('👀 Starting JavaScript file watcher...', 'cyan');
    log(`Watching: ${this.sourceDir}`, 'blue');

    // Initial build
    this.builder.build();

    // Set up file watcher
    const watcher = chokidar.watch(this.watchPatterns, {
      ignored: [
        '**/node_modules/**',
        '**/*.min.js',
        '**/*.compiled.js'
      ],
      persistent: true,
      ignoreInitial: true
    });

    watcher
      .on('change', (filePath) => {
        const filename = path.basename(filePath);
        log(`\n📝 File changed: ${filename}`, 'yellow');
        this.rebuildFile(filePath);
      })
      .on('add', (filePath) => {
        const filename = path.basename(filePath);
        log(`\n➕ File added: ${filename}`, 'green');
        this.rebuildFile(filePath);
      })
      .on('unlink', (filePath) => {
        const filename = path.basename(filePath);
        log(`\n➖ File removed: ${filename}`, 'red');
      })
      .on('error', (error) => {
        log(`❌ Watcher error: ${error.message}`, 'red');
      });

    log('✅ JavaScript watcher started. Press Ctrl+C to stop.', 'green');

    // Keep the process running
    process.on('SIGINT', () => {
      log('\n👋 Stopping JavaScript watcher...', 'yellow');
      watcher.close();
      process.exit(0);
    });
  }

  async rebuildFile(filePath) {
    try {
      const startTime = Date.now();
      
      // Rebuild specific file
      const filename = path.basename(filePath);
      await this.builder.processFile(filePath, filename);
      
      const buildTime = Date.now() - startTime;
      log(`✅ Rebuilt: ${filename} (${buildTime}ms)`, 'green');
      
    } catch (error) {
      log(`❌ Build error: ${error.message}`, 'red');
    }
  }
}

async function main() {
  const watcher = new JSWatcher();
  watcher.start();
}

if (require.main === module) {
  main().catch(error => {
    log(`❌ Watcher failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = JSWatcher;