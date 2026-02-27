# Playwright Integration Test Suite

## Overview

Comprehensive end-to-end integration tests for Q-Social using Playwright. Tests cover all requirements from the specification.

## Test Coverage

### Requirement #1: Message Posting
- ✅ Post a valid message
- ✅ Reject empty message (button disabled)
- ✅ Reject message over 280 characters

### Requirement #2: Feed Viewing
- ✅ Messages appear in reverse chronological order (newest first)

### Requirement #4: User Interface
- ✅ Character counter updates correctly
- ✅ Character counter turns red when negative
- ✅ Timestamps are displayed
- ✅ Form clears after successful post
- ✅ Submit button disabled when textarea empty

### Requirement #7: Error Handling
- ✅ Network error handling (simulated)

## Test Files

- `playwright.config.ts` - Playwright configuration
- `tests/e2e/q-social.spec.ts` - Integration test suite (10 tests)

## Running Tests

### Prerequisites

Install browser dependencies (Linux):
```bash
sudo npx playwright install-deps
```

Or install specific packages:
```bash
sudo apt-get install libatk1.0-0t64 libatspi2.0-0t64 libxcomposite1 \
  libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2t64
```

### Run Tests

```bash
# Run all tests (headless)
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed
```

### Test Configuration

- **Base URL:** http://localhost:3000
- **Browser:** Chromium
- **Workers:** 1 (sequential execution)
- **Auto-start:** Automatically starts `npm run dev:local` before tests
- **Reporter:** HTML report generated in `playwright-report/`

## Test Details

### 1. Post a Valid Message
- Fills textarea with test message
- Clicks submit button
- Verifies message appears in feed

### 2. Reject Empty Message
- Attempts to submit without text
- Verifies submit button is disabled

### 3. Reject Message Over 280 Characters
- Fills textarea with 281 characters
- Clicks submit
- Verifies error message appears

### 4. Messages in Reverse Chronological Order
- Posts two messages sequentially
- Verifies second message appears first in feed

### 5. Character Counter Updates
- Types text in textarea
- Verifies counter shows correct remaining characters

### 6. Character Counter Turns Red
- Types 281 characters
- Verifies counter has error class

### 7. Timestamps Displayed
- Posts a message
- Verifies timestamp element is visible

### 8. Network Error Handling
- Intercepts API call and simulates failure
- Verifies error message appears

### 9. Form Clears After Post
- Posts a message
- Verifies textarea is empty after success

### 10. Submit Button State
- Verifies button disabled when empty
- Verifies button enabled when text present
- Verifies button disabled when cleared

## Troubleshooting

### Browser Dependencies Missing

**Error:** "Host system is missing dependencies to run browsers"

**Solution:**
```bash
sudo npx playwright install-deps
```

### Port Already in Use

**Error:** "Port 3000 is already in use"

**Solution:**
```bash
# Kill existing processes
pkill -f "next dev"
pkill -f "tsx backend"

# Or change port in playwright.config.ts
```

### Tests Timing Out

**Solution:**
- Increase timeout in playwright.config.ts
- Check that backend and frontend start correctly
- Verify database is accessible

## CI/CD Integration

For CI environments:

```yaml
- name: Install Playwright dependencies
  run: npx playwright install-deps

- name: Run Playwright tests
  run: npm run test:e2e
```

## Test Results

When browser dependencies are installed, all 10 tests should pass:

```
✓ Req #1: Post a valid message
✓ Req #1: Reject empty message
✓ Req #1: Reject message over 280 characters
✓ Req #2: Messages appear in reverse chronological order
✓ Req #4: Character counter updates
✓ Req #4: Character counter turns red when negative
✓ Req #4: Timestamps are displayed
✓ Req #7: Network error handling
✓ Form clears after successful post
✓ Submit button disabled when textarea empty

10 passed (Xs)
```

## Future Enhancements

- Add visual regression tests
- Test responsive design on mobile viewports
- Add accessibility tests
- Test keyboard navigation
- Add performance tests
