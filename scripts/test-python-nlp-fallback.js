#!/usr/bin/env node
// Test Python NLP fallback behavior
// Usage: node scripts/test-python-nlp-fallback.js

import { analyzeMessageWithPython, getCircuitBreakerStatus } from '../api/utils/pythonNlpClient.js';

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

async function runTests() {
  console.log(`${colors.cyan}=== Python NLP Fallback Tests ===${colors.reset}\n`);

  let passed = 0;
  let failed = 0;

  // Test 1: NLP_URL not set (should return null immediately)
  console.log('Test 1: NLP_URL not set...');
  const originalNlpUrl = process.env.NLP_URL;
  delete process.env.NLP_URL;

  const result1 = await analyzeMessageWithPython('cleaning', 'en', 'test-1');
  if (result1 === null) {
    log('✓', 'Returns null when NLP_URL not set');
    passed++;
  } else {
    log('ERROR', 'Should return null when NLP_URL not set');
    failed++;
  }

  // Test 2: NLP_URL set to invalid URL (should timeout and return null)
  console.log('\nTest 2: Invalid NLP_URL (should timeout)...');
  process.env.NLP_URL = 'http://invalid-nlp-service.example.com';
  process.env.NLP_TIMEOUT_MS = '1000'; // 1 second timeout for test

  const start = Date.now();
  const result2 = await analyzeMessageWithPython('cleaning', 'en', 'test-2');
  const elapsed = Date.now() - start;

  if (result2 === null) {
    log('✓', `Returns null on timeout (took ${elapsed}ms)`);
    passed++;
  } else {
    log('ERROR', 'Should return null on timeout');
    failed++;
  }

  if (elapsed >= 1000 && elapsed < 1500) {
    log('✓', 'Timeout respected (1000ms)');
    passed++;
  } else {
    log('WARN', `Timeout might not be working correctly (expected ~1000ms, got ${elapsed}ms)`);
  }

  // Test 3: Circuit breaker status
  console.log('\nTest 3: Circuit breaker status...');
  const status = getCircuitBreakerStatus();

  if (status.failureCount > 0) {
    log('✓', `Circuit breaker tracking failures (count: ${status.failureCount})`);
    passed++;
  } else {
    log('WARN', 'Circuit breaker failure count should be > 0 after failed requests');
  }

  // Test 4: Verify circuit doesn't break the app
  console.log('\nTest 4: Multiple failures don\'t crash...');
  try {
    await analyzeMessageWithPython('test', 'en', 'test-4-1');
    await analyzeMessageWithPython('test', 'en', 'test-4-2');
    await analyzeMessageWithPython('test', 'en', 'test-4-3');
    log('✓', 'Multiple failures handled gracefully');
    passed++;
  } catch (error) {
    log('ERROR', `Multiple failures should not throw: ${error.message}`);
    failed++;
  }

  // Test 5: Circuit breaker opens after threshold
  const statusAfter = getCircuitBreakerStatus();
  if (statusAfter.state === 'OPEN') {
    log('✓', `Circuit breaker opened after ${statusAfter.failureCount} failures`);
    passed++;
  } else if (statusAfter.failureCount >= 3) {
    log('WARN', `Circuit breaker should be OPEN after 3+ failures (current: ${statusAfter.state})`);
  }

  // Restore original NLP_URL
  if (originalNlpUrl) {
    process.env.NLP_URL = originalNlpUrl;
  } else {
    delete process.env.NLP_URL;
  }

  console.log(`\n${colors.cyan}=== Summary ===${colors.reset}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`Total: ${passed + failed}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(error => {
  console.error('Test script error:', error);
  process.exit(1);
});
