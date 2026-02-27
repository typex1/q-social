#!/usr/bin/env node

const http = require('http');

const API_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:3000';

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data), headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function validate() {
  console.log('🧪 Q-Social Local Environment Validation\n');
  
  let passed = 0;
  let failed = 0;

  // Test 1: Backend responds
  try {
    const res = await request(`${API_URL}/api/messages`);
    if (res.status === 200) {
      console.log('✅ Backend responds at http://localhost:3001/api/messages');
      passed++;
    } else {
      console.log(`❌ Backend returned status ${res.status}`);
      failed++;
    }
  } catch (err) {
    console.log('❌ Backend not responding:', err.message);
    failed++;
  }

  // Test 2: POST valid message
  try {
    const res = await request(`${API_URL}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Test message from validation script' })
    });
    if (res.status === 201 && res.data.message) {
      console.log('✅ POST /api/messages returns 201 with message object');
      console.log(`   Message ID: ${res.data.message.id}`);
      passed++;
      
      // Verify UUID format
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(res.data.message.id)) {
        console.log('✅ Message ID is valid UUID');
        passed++;
      } else {
        console.log('❌ Message ID is not a valid UUID');
        failed++;
      }
      
      // Verify timestamp
      if (typeof res.data.message.createdAt === 'number' && res.data.message.createdAt > 0) {
        console.log('✅ Timestamp is Unix timestamp in milliseconds');
        passed++;
      } else {
        console.log('❌ Timestamp format invalid');
        failed++;
      }
    } else {
      console.log(`❌ POST /api/messages returned status ${res.status}`);
      failed++;
    }
  } catch (err) {
    console.log('❌ POST /api/messages failed:', err.message);
    failed++;
  }

  // Test 3: GET messages
  try {
    const res = await request(`${API_URL}/api/messages`);
    if (res.status === 200 && Array.isArray(res.data.messages)) {
      console.log('✅ GET /api/messages returns 200 with messages array');
      console.log(`   Found ${res.data.messages.length} messages`);
      passed++;
      
      // Verify order (newest first)
      if (res.data.messages.length > 1) {
        const sorted = res.data.messages.every((msg, i) => 
          i === 0 || res.data.messages[i-1].createdAt >= msg.createdAt
        );
        if (sorted) {
          console.log('✅ Messages ordered by newest first');
          passed++;
        } else {
          console.log('❌ Messages not properly ordered');
          failed++;
        }
      }
    } else {
      console.log(`❌ GET /api/messages returned status ${res.status}`);
      failed++;
    }
  } catch (err) {
    console.log('❌ GET /api/messages failed:', err.message);
    failed++;
  }

  // Test 4: POST empty message
  try {
    const res = await request(`${API_URL}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: '   ' })
    });
    if (res.status === 400 && res.data.error && res.data.code === 'VALIDATION_ERROR') {
      console.log('✅ Empty message returns 400 with error and code');
      passed++;
    } else {
      console.log(`❌ Empty message validation failed (status: ${res.status})`);
      failed++;
    }
  } catch (err) {
    console.log('❌ Empty message test failed:', err.message);
    failed++;
  }

  // Test 5: POST message over 280 characters
  try {
    const res = await request(`${API_URL}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'a'.repeat(281) })
    });
    if (res.status === 400 && res.data.error && res.data.code === 'VALIDATION_ERROR') {
      console.log('✅ Message over 280 chars returns 400 with error and code');
      passed++;
    } else {
      console.log(`❌ Long message validation failed (status: ${res.status})`);
      failed++;
    }
  } catch (err) {
    console.log('❌ Long message test failed:', err.message);
    failed++;
  }

  // Test 6: CORS headers
  try {
    const res = await request(`${API_URL}/api/messages`, {
      method: 'OPTIONS',
      headers: { 'Origin': 'http://localhost:3000' }
    });
    if (res.headers['access-control-allow-origin']) {
      console.log('✅ CORS headers present');
      passed++;
    } else {
      console.log('❌ CORS headers missing');
      failed++;
    }
  } catch (err) {
    console.log('⚠️  CORS test skipped:', err.message);
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('✅ All validation tests passed!\n');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed\n');
    process.exit(1);
  }
}

validate().catch(err => {
  console.error('❌ Validation script error:', err);
  process.exit(1);
});
