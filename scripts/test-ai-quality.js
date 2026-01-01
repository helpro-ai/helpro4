#!/usr/bin/env node
// AI Quality Test Script - Tests intent, category, entities, and flow
// Usage: node scripts/test-ai-quality.js

import { analyzeMessage } from '../api/utils/nlp.js';
import { generateAssistantResponse } from '../api/utils/assistantEngine.js';

// Test cases covering short ambiguous messages, realistic booking, provider signup, KB questions, mixed language
const TEST_CASES = [
  // === SHORT AMBIGUOUS MESSAGES (FA/SV/EN) ===
  {
    id: 'FA-SHORT-1',
    message: 'نظافت',
    locale: 'fa',
    expected: {
      intent: 'BOOK_SERVICE',
      category: 'cleaning',
      hasCategory: true,
    },
  },
  {
    id: 'FA-SHORT-2',
    message: 'کمک',
    locale: 'fa',
    expected: {
      intent: 'UNKNOWN', // Too ambiguous
      category: undefined,
    },
  },
  {
    id: 'SV-SHORT-1',
    message: 'moving',
    locale: 'sv',
    expected: {
      intent: 'BOOK_SERVICE',
      category: 'moving-delivery',
      hasCategory: true,
    },
  },
  {
    id: 'SV-SHORT-2',
    message: 'städning',
    locale: 'sv',
    expected: {
      intent: 'BOOK_SERVICE',
      category: 'cleaning',
      hasCategory: true,
    },
  },
  {
    id: 'EN-SHORT-1',
    message: 'price?',
    locale: 'en',
    expected: {
      intent: 'GENERAL_QA',
      category: undefined,
    },
  },

  // === REALISTIC BOOKING MESSAGES WITH ENTITIES ===
  {
    id: 'FA-BOOKING-1',
    message: 'نیاز به نظافت خانه در استکهلم فردا ۳ اتاق',
    locale: 'fa',
    expected: {
      intent: 'BOOK_SERVICE',
      category: 'cleaning',
      entities: { location: 'استکهلم', timing: 'فردا', rooms: 3 },
    },
  },
  {
    id: 'FA-BOOKING-2',
    message: 'می‌خواهم اسباب‌کشی کنم امروز ۴ ساعت',
    locale: 'fa',
    expected: {
      intent: 'BOOK_SERVICE',
      category: 'moving-delivery',
      entities: { timing: 'امروز', hours: 4 },
    },
  },
  {
    id: 'SV-BOOKING-1',
    message: 'behöver städning imorgon 2 rum',
    locale: 'sv',
    expected: {
      intent: 'BOOK_SERVICE',
      category: 'cleaning',
      entities: { timing: 'imorgon', rooms: 2 },
    },
  },
  {
    id: 'SV-BOOKING-2',
    message: 'vill ha flytt idag stockholm 5 timmar',
    locale: 'sv',
    expected: {
      intent: 'BOOK_SERVICE',
      category: 'moving-delivery',
      entities: { location: 'stockholm', timing: 'idag', hours: 5 },
    },
  },
  {
    id: 'EN-BOOKING-1',
    message: 'I need cleaning today 3 rooms in Stockholm',
    locale: 'en',
    expected: {
      intent: 'BOOK_SERVICE',
      category: 'cleaning',
      entities: { location: 'Stockholm', timing: 'today', rooms: 3 },
    },
  },
  {
    id: 'EN-BOOKING-2',
    message: 'looking for handyman to fix my door tomorrow',
    locale: 'en',
    expected: {
      intent: 'BOOK_SERVICE',
      category: 'repairs',
      entities: { timing: 'tomorrow' },
    },
  },

  // === PROVIDER SIGNUP MESSAGES ===
  {
    id: 'FA-SIGNUP-1',
    message: 'می‌خواهم ثبت نام کنم',
    locale: 'fa',
    expected: {
      intent: 'PROVIDER_SIGNUP',
      category: undefined,
    },
  },
  {
    id: 'SV-SIGNUP-1',
    message: 'bli hjälpare',
    locale: 'sv',
    expected: {
      intent: 'PROVIDER_SIGNUP',
      category: undefined,
    },
  },
  {
    id: 'EN-SIGNUP-1',
    message: 'I want to become a helper',
    locale: 'en',
    expected: {
      intent: 'PROVIDER_SIGNUP',
      category: undefined,
    },
  },

  // === KB QUESTIONS (payment/refund/insurance) ===
  {
    id: 'FA-KB-1',
    message: 'چطور پرداخت می‌شود؟',
    locale: 'fa',
    expected: {
      intent: 'GENERAL_QA',
      category: undefined,
      shouldAnswerFromKB: true,
    },
  },
  {
    id: 'FA-KB-2',
    message: 'قیمت چقدر است؟',
    locale: 'fa',
    expected: {
      intent: 'GENERAL_QA',
      category: undefined,
      shouldAnswerFromKB: true,
    },
  },
  {
    id: 'FA-KB-3',
    message: 'بیمه دارید؟',
    locale: 'fa',
    expected: {
      intent: 'GENERAL_QA',
      category: undefined,
      shouldAnswerFromKB: true,
    },
  },
  {
    id: 'SV-KB-1',
    message: 'hur fungerar betalning?',
    locale: 'sv',
    expected: {
      intent: 'GENERAL_QA',
      category: undefined,
      shouldAnswerFromKB: true,
    },
  },
  {
    id: 'EN-KB-1',
    message: 'how much does it cost?',
    locale: 'en',
    expected: {
      intent: 'GENERAL_QA',
      category: undefined,
      shouldAnswerFromKB: true,
    },
  },
  {
    id: 'EN-KB-2',
    message: 'Do you have insurance?',
    locale: 'en',
    expected: {
      intent: 'GENERAL_QA',
      category: undefined,
      shouldAnswerFromKB: true,
    },
  },

  // === MIXED LANGUAGE / EDGE CASES ===
  {
    id: 'FA-EDGE-1',
    message: 'نظافت home',
    locale: 'fa',
    expected: {
      intent: 'BOOK_SERVICE',
      category: 'cleaning',
    },
  },
  {
    id: 'SV-EDGE-1',
    message: 'montering ikea',
    locale: 'sv',
    expected: {
      intent: 'BOOK_SERVICE',
      category: 'assembly',
    },
  },
  {
    id: 'EN-EDGE-1',
    message: 'mounting tv',
    locale: 'en',
    expected: {
      intent: 'BOOK_SERVICE',
      category: 'mounting',
    },
  },

  // === COMMON COLLOQUIAL PHRASES ===
  {
    id: 'FA-COLLOQUIAL-1',
    message: 'خونه رو نظافت کنید',
    locale: 'fa',
    expected: {
      intent: 'BOOK_SERVICE',
      category: 'cleaning',
    },
  },
  {
    id: 'SV-COLLOQUIAL-1',
    message: 'kan ni städa idag?',
    locale: 'sv',
    expected: {
      intent: 'BOOK_SERVICE',
      category: 'cleaning',
      entities: { timing: 'idag' },
    },
  },
];

// Color helpers for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

async function runTests() {
  console.log(`${colors.cyan}=== AI Quality Test Suite ===${colors.reset}\n`);
  console.log(`Running ${TEST_CASES.length} test cases...\n`);

  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const testCase of TEST_CASES) {
    const nlpResult = analyzeMessage(testCase.message, testCase.locale);
    const assistantResponse = await generateAssistantResponse(testCase.message, testCase.locale, null, 'test-req-id');

    let testPassed = true;
    const errors = [];

    // Check intent
    if (testCase.expected.intent && nlpResult.intent !== testCase.expected.intent) {
      errors.push(
        `Intent mismatch: expected ${testCase.expected.intent}, got ${nlpResult.intent}`
      );
      testPassed = false;
    }

    // Check category
    if (testCase.expected.hasCategory && !nlpResult.category) {
      errors.push(`Expected category to be detected, got ${nlpResult.category}`);
      testPassed = false;
    }

    if (testCase.expected.category && nlpResult.category !== testCase.expected.category) {
      errors.push(
        `Category mismatch: expected ${testCase.expected.category}, got ${nlpResult.category}`
      );
      testPassed = false;
    }

    // Check entities
    if (testCase.expected.entities) {
      const { entities } = nlpResult;
      for (const [key, expectedValue] of Object.entries(testCase.expected.entities)) {
        if (entities[key] !== expectedValue) {
          errors.push(
            `Entity ${key} mismatch: expected ${expectedValue}, got ${entities[key]}`
          );
          testPassed = false;
        }
      }
    }

    // Check KB answer
    if (testCase.expected.shouldAnswerFromKB) {
      if (assistantResponse.nextState.step !== 'COMPLETE') {
        errors.push(
          `Expected KB answer (step=COMPLETE), got step=${assistantResponse.nextState.step}`
        );
        testPassed = false;
      }
    }

    if (testPassed) {
      passed++;
      console.log(`${colors.green}✓${colors.reset} ${testCase.id}: ${testCase.message.substring(0, 40)}`);
    } else {
      failed++;
      console.log(`${colors.red}✗${colors.reset} ${testCase.id}: ${testCase.message.substring(0, 40)}`);
      failures.push({
        id: testCase.id,
        message: testCase.message,
        locale: testCase.locale,
        errors,
        actual: {
          intent: nlpResult.intent,
          category: nlpResult.category,
          entities: nlpResult.entities,
          nextStep: assistantResponse.nextState.step,
        },
        expected: testCase.expected,
      });
    }
  }

  console.log(`\n${colors.cyan}=== Summary ===${colors.reset}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`Total: ${TEST_CASES.length}\n`);

  if (failures.length > 0) {
    console.log(`${colors.yellow}=== Failure Details ===${colors.reset}\n`);
    for (const failure of failures) {
      console.log(`${colors.red}${failure.id}${colors.reset}: "${failure.message}" [${failure.locale}]`);
      for (const error of failure.errors) {
        console.log(`  - ${error}`);
      }
      console.log(`  Actual: intent=${failure.actual.intent}, category=${failure.actual.category}, step=${failure.actual.nextStep}`);
      console.log(`  Expected: ${JSON.stringify(failure.expected)}`);
      console.log('');
    }
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
