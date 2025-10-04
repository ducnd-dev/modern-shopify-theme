#!/usr/bin/env node

/**
 * Development Setup Script
 * Automates the setup of development environment for Modern Shopify Theme
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  try {
    log(`\n📋 ${description}`, 'cyan');
    log(`Running: ${command}`, 'yellow');
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completed successfully`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'red');
    return false;
  }
}

function createEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const envExample = `# Shopify Development Configuration
# Copy this file to .env and fill in your store URLs

# Development Store (password protected for private testing)
DEV_STORE=your-dev-store.myshopify.com

# Staging Store (final validation before production)
STAGING_STORE=allstore-staging.myshopify.com

# Production Demo Store (public for Theme Store submission)
PRODUCTION_STORE=allstore-blueprint.myshopify.com

# Development Configuration
NODE_ENV=development
SHOPIFY_CLI_THEME_TOKEN=

# Performance Testing
LIGHTHOUSE_CI=false
PERFORMANCE_BUDGET=75

# Testing Configuration
ACCESSIBILITY_THRESHOLD=90
BROWSER_TEST_HEADLESS=true
`;

  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envExample);
    log('📄 Created .env file with configuration templates', 'green');
  } else {
    log('📄 .env file already exists', 'yellow');
  }
}

function createGitIgnore() {
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  const gitignoreContent = `# Environment variables
.env
.env.local
.env.development
.env.staging
.env.production

# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
*.compiled.css
*.min.js
*.min.css

# Shopify CLI
.shopify/

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output/

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Backup files
*.bak
*.backup
*.old

# Test results
test-results/
screenshots/
lighthouse-reports/
`;

  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, gitignoreContent);
    log('📄 Created .gitignore file', 'green');
  } else {
    log('📄 .gitignore file already exists', 'yellow');
  }
}

async function main() {
  log('🚀 Setting up Modern Shopify Theme Development Environment', 'bright');
  log('='.repeat(60), 'cyan');

  // Check Node.js version
  const nodeVersion = process.version;
  log(`Node.js version: ${nodeVersion}`, 'blue');
  
  if (parseInt(nodeVersion.slice(1)) < 16) {
    log('❌ Node.js 16+ is required. Please update Node.js.', 'red');
    process.exit(1);
  }

  // Create configuration files
  log('\n📁 Creating configuration files...', 'bright');
  createEnvFile();
  createGitIgnore();

  // Check if Shopify CLI is installed
  log('\n🛠️  Checking Shopify CLI installation...', 'bright');
  try {
    execSync('shopify version', { stdio: 'pipe' });
    log('✅ Shopify CLI is installed', 'green');
  } catch (error) {
    log('⚠️  Shopify CLI not found. Installing...', 'yellow');
    if (!runCommand('npm install -g @shopify/cli @shopify/theme', 'Install Shopify CLI')) {
      log('❌ Failed to install Shopify CLI. Please install manually.', 'red');
      process.exit(1);
    }
  }

  // Install project dependencies
  log('\n📦 Installing project dependencies...', 'bright');
  if (!runCommand('npm install', 'Install npm dependencies')) {
    log('❌ Failed to install dependencies.', 'red');
    process.exit(1);
  }

  // Build theme assets
  log('\n🔨 Building theme assets...', 'bright');
  if (!runCommand('npm run build', 'Build theme assets')) {
    log('⚠️  Asset build failed. You may need to run this manually later.', 'yellow');
  }

  // Setup complete
  log('\n🎉 Development environment setup complete!', 'bright');
  log('='.repeat(60), 'cyan');
  
  log('\n📋 Next Steps:', 'bright');
  log('1. Edit .env file with your store URLs', 'blue');
  log('2. Authenticate with Shopify: shopify auth login', 'blue');
  log('3. Start development: npm run dev', 'blue');
  log('4. Or serve locally: npm run serve', 'blue');
  
  log('\n🏪 Store Setup Order:', 'bright');
  log('1. Development Store (private testing)', 'blue');
  log('2. Staging Store (final validation)', 'blue');
  log('3. Production Store (Theme Store submission)', 'blue');
  
  log('\n📚 Available Commands:', 'bright');
  log('npm run dev          - Start development with live reload', 'blue');
  log('npm run test         - Run all tests (performance, accessibility)', 'blue');
  log('npm run deploy:dev   - Deploy to development store', 'blue');
  log('npm run deploy:staging - Deploy to staging store', 'blue');
  log('npm run deploy:production - Deploy to production store', 'blue');
  log('npm run package      - Package theme for submission', 'blue');
  
  log('\n📖 Documentation:', 'bright');
  log('- Development Workflow: docs/DEVELOPMENT_WORKFLOW.md', 'blue');
  log('- Demo Guide: docs/DEMO_GUIDE.md', 'blue');
  log('- Testing Guide: docs/TESTING_GUIDE.md', 'blue');
  log('- Submission Guide: docs/SHOPIFY_SUBMISSION.md', 'blue');
}

if (require.main === module) {
  main().catch(error => {
    log(`❌ Setup failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { log, runCommand };