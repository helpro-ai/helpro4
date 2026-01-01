#!/usr/bin/env node
// Smoke Test: Verify app boots and key assets exist
// Usage: node scripts/smoke-test.js

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(level, message) {
  const color = level === 'ERROR' ? colors.red : level === 'WARN' ? colors.yellow : colors.green;
  console.log(`${color}${level}${colors.reset} ${message}`);
}

function runTests() {
  console.log(`${colors.cyan}=== Smoke Test Suite ===${colors.reset}\n`);

  let passed = 0;
  let failed = 0;

  // Test 1: dist/index.html exists
  const indexPath = join(process.cwd(), 'dist', 'index.html');
  if (!existsSync(indexPath)) {
    log('ERROR', 'dist/index.html does not exist');
    failed++;
  } else {
    log('✓', 'dist/index.html exists');
    passed++;

    // Test 2: index.html contains root div
    const indexHtml = readFileSync(indexPath, 'utf-8');
    if (!indexHtml.includes('<div id="root"></div>')) {
      log('ERROR', 'index.html missing <div id="root">');
      failed++;
    } else {
      log('✓', 'index.html contains root div');
      passed++;
    }

    // Test 3: index.html has script tag
    if (!indexHtml.includes('<script')) {
      log('ERROR', 'index.html missing script tags');
      failed++;
    } else {
      log('✓', 'index.html contains script tags');
      passed++;
    }

    // Test 4: index.html has CSS link
    if (!indexHtml.includes('<link rel="stylesheet"')) {
      log('ERROR', 'index.html missing CSS link');
      failed++;
    } else {
      log('✓', 'index.html contains CSS link');
      passed++;
    }

    // Test 5: Extract and verify JS bundle exists
    const jsMatch = indexHtml.match(/<script[^>]+src="([^"]+)"/);
    if (!jsMatch) {
      log('ERROR', 'Could not extract JS bundle path from index.html');
      failed++;
    } else {
      const jsBundlePath = join(process.cwd(), 'dist', jsMatch[1]);
      if (!existsSync(jsBundlePath)) {
        log('ERROR', `JS bundle not found: ${jsMatch[1]}`);
        failed++;
      } else {
        log('✓', `JS bundle exists: ${jsMatch[1]}`);
        passed++;

        // Test 6: JS bundle contains React
        const jsBundle = readFileSync(jsBundlePath, 'utf-8');
        if (!jsBundle.includes('react') && !jsBundle.includes('React')) {
          log('WARN', 'JS bundle may not contain React (might be minified)');
        } else {
          log('✓', 'JS bundle contains React');
          passed++;
        }
      }
    }

    // Test 7: Extract and verify CSS bundle exists
    const cssMatch = indexHtml.match(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/);
    if (!cssMatch) {
      log('WARN', 'Could not extract CSS bundle path from index.html');
    } else {
      const cssBundlePath = join(process.cwd(), 'dist', cssMatch[1]);
      if (!existsSync(cssBundlePath)) {
        log('ERROR', `CSS bundle not found: ${cssMatch[1]}`);
        failed++;
      } else {
        log('✓', `CSS bundle exists: ${cssMatch[1]}`);
        passed++;
      }
    }
  }

  // Test 8: vercel.json exists and has correct routes
  const vercelPath = join(process.cwd(), 'vercel.json');
  if (!existsSync(vercelPath)) {
    log('ERROR', 'vercel.json does not exist');
    failed++;
  } else {
    const vercelConfig = JSON.parse(readFileSync(vercelPath, 'utf-8'));
    if (!vercelConfig.routes || !Array.isArray(vercelConfig.routes)) {
      log('ERROR', 'vercel.json missing routes array');
      failed++;
    } else if (vercelConfig.routes.some(r => r.dest === '/index.html')) {
      log('✓', 'vercel.json has index.html fallback route');
      passed++;
    } else {
      log('ERROR', 'vercel.json missing index.html fallback');
      failed++;
    }
  }

  console.log(`\n${colors.cyan}=== Summary ===${colors.reset}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`Total: ${passed + failed}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
