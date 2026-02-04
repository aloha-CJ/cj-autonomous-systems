/**
 * Comprehensive SP-API Test Suite
 * Tests multiple endpoints to verify complete setup
 */

const { createClient } = require('./lib/sp-client');

// Test 1: Marketplace Participations (simplest)
async function testMarketplaceParticipations(client) {
  console.log('📍 Test 1: Marketplace Participations API');
  console.log('   Purpose: Verify basic authentication works');
  console.log('   Requires: LWA tokens only\n');
  
  try {
    const result = await client.callAPI({
      operation: 'getMarketplaceParticipations',
      endpoint: 'sellers'
    });
    
    console.log('✅ Success!');
    console.log('   Marketplaces:', result.length);
    result.forEach(mp => {
      console.log(`   - ${mp.marketplace.name} (${mp.marketplace.id})`);
      console.log(`     Participating: ${mp.participation.isParticipating}`);
    });
    console.log('');
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.message);
    if (error.response) {
      console.error('   Response:', JSON.stringify(error.response, null, 2));
    }
    console.log('');
    return false;
  }
}

// Test 2: Catalog Items (read-only, may need AWS signing)
async function testCatalogSearch(client) {
  console.log('🔍 Test 2: Catalog Items API');
  console.log('   Purpose: Search catalog by keywords');
  console.log('   Requires: LWA + possibly AWS signing\n');
  
  try {
    const result = await client.callAPI({
      operation: 'searchCatalogItems',
      endpoint: 'catalog',
      query: {
        keywords: ['snorkel', 'mask'],
        marketplaceIds: [process.env.MARKETPLACE_ID],
        includedData: ['summaries']
      }
    });
    
    console.log('✅ Success!');
    console.log('   Total results:', result.numberOfResults);
    console.log('   Items returned:', result.items?.length || 0);
    if (result.items?.[0]) {
      console.log(`   Sample: ${result.items[0].summaries?.[0]?.itemName}`);
    }
    console.log('');
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.message);
    console.error('   This may require AWS IAM credentials');
    if (error.response) {
      console.error('   Details:', error.response.errors?.[0]?.message || error.message);
    }
    console.log('');
    return false;
  }
}

// Test 3: Listings Items (requires AWS signing + write permissions)
async function testListingsMetadata(client) {
  console.log('📦 Test 3: Listings Items API');
  console.log('   Purpose: Get product type definitions (needed for creating products)');
  console.log('   Requires: LWA + AWS signing + permissions\n');
  
  try {
    const result = await client.callAPI({
      operation: 'getDefinitionsProductType',
      endpoint: 'listings',
      path: {
        productType: 'SPORTING_GOODS'  // Aloha Reef products
      },
      query: {
        marketplaceIds: [process.env.MARKETPLACE_ID],
        requirements: 'LISTING'
      }
    });
    
    console.log('✅ Success!');
    console.log('   Product Type:', result.productType);
    console.log('   Requirements loaded:', result.requirements?.length || 0);
    console.log('   This is what you need to create products!');
    console.log('');
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.message);
    console.error('   This definitely requires AWS IAM credentials + role');
    if (error.response) {
      console.error('   Details:', error.response.errors?.[0]?.message || error.message);
    }
    console.log('');
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('═══════════════════════════════════════════════════════\n');
  console.log('🧪 SP-API COMPREHENSIVE TEST SUITE\n');
  console.log('═══════════════════════════════════════════════════════\n\n');
  
  let client;
  try {
    client = createClient();
  } catch (error) {
    console.error('Failed to create client. Check your .env credentials.');
    return;
  }
  
  const results = {
    test1: await testMarketplaceParticipations(client),
    test2: await testCatalogSearch(client),
    test3: await testListingsMetadata(client)
  };
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 RESULTS SUMMARY\n');
  console.log(`Test 1 (Marketplace): ${results.test1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Test 2 (Catalog):     ${results.test2 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Test 3 (Listings):    ${results.test3 ? '✅ PASS' : '❌ FAIL'}`);
  console.log('\n═══════════════════════════════════════════════════════\n');
  
  // Interpretation
  if (results.test1 && results.test2 && results.test3) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('   Your setup is complete and ready for production!\n');
  } else if (results.test1 && !results.test2 && !results.test3) {
    console.log('⚠️  PARTIAL SUCCESS');
    console.log('   Basic auth works, but you need AWS IAM credentials.');
    console.log('   Action: Set up AWS IAM user with SP-API permissions\n');
  } else if (!results.test1) {
    console.log('❌ AUTHENTICATION FAILED');
    console.log('   Check your LWA credentials in .env\n');
  }
}

// Run it
runTests().catch(console.error);
