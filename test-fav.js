/**
 * Fav System Test File
 * 
 * This file contains test cases to verify the fav system functionality.
 * 
 * Prerequisites:
 * 1. Backend server must be running on http://localhost:8080
 * 2. Database must be connected
 * 3. You need a valid user token (login first to get token)
 * 
 * Usage:
 * 1. Update BASE_URL if your server runs on a different port
 * 2. Update USER_TOKEN with a valid JWT token from login
 * 3. Update PRODUCT_ID with a valid product ID from your database
 * 4. Run: node test-fav.js
 */

const BASE_URL = 'http://localhost:8080';
const USER_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Get this from login endpoint
const PRODUCT_ID = 'YOUR_PRODUCT_ID_HERE'; // Get this from products endpoint

// Test helper function
async function testEndpoint(name, method, url, body = null, token = null) {
  console.log(`\n🧪 Testing: ${name}`);
  console.log(`   ${method} ${url}`);
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    if (token) {
      options.headers['Cookie'] = `token=${token}`;
    }

    const response = await fetch(url, options);
    const data = await response.json();

    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, JSON.stringify(data, null, 2));

    return { success: response.ok, status: response.status, data };
  } catch (error) {
    console.error(`   ❌ Error:`, error.message);
    return { success: false, error: error.message };
  }
}

// Main test function
async function runTests() {
  console.log('='.repeat(60));
  console.log('FAV SYSTEM TEST SUITE');
  console.log('='.repeat(60));

  if (USER_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
    console.log('\n⚠️  WARNING: Please update USER_TOKEN in test-fav.js');
    console.log('   Get token by logging in: POST /api/auth/login');
    return;
  }

  if (PRODUCT_ID === 'YOUR_PRODUCT_ID_HERE') {
    console.log('\n⚠️  WARNING: Please update PRODUCT_ID in test-fav.js');
    console.log('   Get product ID from: GET /api/products');
    return;
  }

  // Test 1: Get user favorites (should be empty initially)
  console.log('\n📋 Test 1: Get User Favorites (Initial)');
  const getFavs1 = await testEndpoint(
    'Get User Favorites',
    'GET',
    `${BASE_URL}/api/fav/user`,
    null,
    USER_TOKEN
  );

  // Test 2: Add product to favorites
  console.log('\n📋 Test 2: Add Product to Favorites');
  const addFav = await testEndpoint(
    'Add to Favorites',
    'POST',
    `${BASE_URL}/api/fav/add`,
    { productId: PRODUCT_ID },
    USER_TOKEN
  );

  // Test 3: Get user favorites (should contain the added product)
  console.log('\n📋 Test 3: Get User Favorites (After Add)');
  const getFavs2 = await testEndpoint(
    'Get User Favorites',
    'GET',
    `${BASE_URL}/api/fav/user`,
    null,
    USER_TOKEN
  );

  // Test 4: Try to add same product again (should fail)
  console.log('\n📋 Test 4: Add Duplicate Product (Should Fail)');
  const addDuplicate = await testEndpoint(
    'Add Duplicate to Favorites',
    'POST',
    `${BASE_URL}/api/fav/add`,
    { productId: PRODUCT_ID },
    USER_TOKEN
  );

  // Test 5: Remove product from favorites
  console.log('\n📋 Test 5: Remove Product from Favorites');
  const removeFav = await testEndpoint(
    'Remove from Favorites',
    'DELETE',
    `${BASE_URL}/api/fav/remove/${PRODUCT_ID}`,
    null,
    USER_TOKEN
  );

  // Test 6: Get user favorites (should be empty again)
  console.log('\n📋 Test 6: Get User Favorites (After Remove)');
  const getFavs3 = await testEndpoint(
    'Get User Favorites',
    'GET',
    `${BASE_URL}/api/fav/user`,
    null,
    USER_TOKEN
  );

  // Test 7: Try to remove non-existent favorite (should fail)
  console.log('\n📋 Test 7: Remove Non-existent Favorite (Should Fail)');
  const removeNonExistent = await testEndpoint(
    'Remove Non-existent Favorite',
    'DELETE',
    `${BASE_URL}/api/fav/remove/${PRODUCT_ID}`,
    null,
    USER_TOKEN
  );

  // Test 8: Test without token (should fail)
  console.log('\n📋 Test 8: Access Without Token (Should Fail)');
  const noToken = await testEndpoint(
    'Get Favorites Without Token',
    'GET',
    `${BASE_URL}/api/fav/user`
  );

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  
  const tests = [
    { name: 'Get Favorites (Initial)', result: getFavs1 },
    { name: 'Add to Favorites', result: addFav },
    { name: 'Get Favorites (After Add)', result: getFavs2 },
    { name: 'Add Duplicate (Should Fail)', result: addDuplicate },
    { name: 'Remove from Favorites', result: removeFav },
    { name: 'Get Favorites (After Remove)', result: getFavs3 },
    { name: 'Remove Non-existent (Should Fail)', result: removeNonExistent },
    { name: 'Access Without Token (Should Fail)', result: noToken },
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach((test, index) => {
    const expectedSuccess = [
      true,   // Get initial - should succeed
      true,   // Add - should succeed
      true,   // Get after add - should succeed
      false,  // Add duplicate - should fail
      true,   // Remove - should succeed
      true,   // Get after remove - should succeed
      false,  // Remove non-existent - should fail
      false,  // No token - should fail
    ][index];

    const actualSuccess = test.result.success === expectedSuccess;
    const status = actualSuccess ? '✅ PASS' : '❌ FAIL';
    
    console.log(`${status} - ${test.name}`);
    
    if (actualSuccess) {
      passed++;
    } else {
      failed++;
      console.log(`   Expected: ${expectedSuccess ? 'success' : 'failure'}, Got: ${test.result.success ? 'success' : 'failure'}`);
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log(`Total: ${tests.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log('='.repeat(60));
}

// Run tests
runTests().catch(console.error);

