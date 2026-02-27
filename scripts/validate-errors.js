#!/usr/bin/env node

const http = require('http');

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function validate() {
  console.log('🧪 Q-Social Error Handling Validation\n');
  
  // Test network error (server not running)
  console.log('Testing network error handling...');
  try {
    await request('http://localhost:9999/api/messages');
    console.log('❌ Should have thrown network error');
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      console.log('✅ Network error properly thrown (ECONNREFUSED)');
    } else {
      console.log('⚠️  Network error:', err.message);
    }
  }

  // Test validation errors
  console.log('\nTesting validation error messages...');
  
  const validationTests = [
    { content: '', expected: 'empty' },
    { content: '   ', expected: 'empty' },
    { content: 'a'.repeat(281), expected: '280' }
  ];

  for (const test of validationTests) {
    try {
      const res = await request('http://localhost:3001/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: test.content })
      });
      
      if (res.status === 400 && res.data.error && res.data.code === 'VALIDATION_ERROR') {
        console.log(`✅ Validation error for "${test.content.substring(0, 20)}..." is user-friendly`);
        console.log(`   Error: ${res.data.error}`);
      } else {
        console.log(`❌ Unexpected response for validation test`);
      }
    } catch (err) {
      console.log('❌ Validation test failed:', err.message);
    }
  }

  console.log('\n✅ Error handling validation complete\n');
}

validate().catch(err => {
  console.error('❌ Validation script error:', err);
  process.exit(1);
});
