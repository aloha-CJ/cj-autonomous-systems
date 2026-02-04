/**
 * Test SP-API with Direct HTTP Calls
 * Uses AWS Sig V4 signing to access all endpoints
 */

const { callAPI } = require('./lib/sp-api-client');

console.log('═══════════════════════════════════════════════════════\n');
console.log('🧪 SP-API DIRECT API TEST SUITE\n');
console.log('═══════════════════════════════════════════════════════\n\n');

// Test 1: Marketplace Participations
async function test1_Marketplace() {
  console.log('📍 Test 1: Marketplace Participations');
  console.log('   Endpoint: /sellers/v1/marketplaceParticipations\n');
  
  try {
    const result = await callAPI({
      method: 'GET',
      path: '/sellers/v1/marketplaceParticipations'
    });
    
    console.log('✅ Success!');
    console.log('   Marketplaces:', result.payload?.length || 0);
    if (result.payload?.[0]) {
      console.log(`   - ${result.payload[0].marketplace.name} (${result.payload[0].marketplace.id})`);
      console.log(`     Participating: ${result.payload[0].participation.isParticipating}`);
    }
    console.log('');
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.message);
    console.log('');
    return false;
  }
}

// Test 2: Catalog API - Search Items
async function test2_CatalogSearch() {
  console.log('🔍 Test 2: Catalog Items API - Search');
  console.log('   Endpoint: /catalog/2022-04-01/items\n');
  
  try {
    const result = await callAPI({
      method: 'GET',
      path: '/catalog/2022-04-01/items',
      query: {
        keywords: 'snorkel mask',
        marketplaceIds: process.env.MARKETPLACE_ID,
        includedData: 'summaries'
      }
    });
    
    console.log('✅ Success!');
    console.log('   Total results:', result.numberOfResults || 0);
    console.log('   Items returned:', result.items?.length || 0);
    if (result.items?.[0]) {
      console.log(`   Sample: ${result.items[0].asin} - ${result.items[0].summaries?.[0]?.itemName}`);
    }
    console.log('');
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.message);
    console.log('');
    return false;
  }
}

// Test 3: Catalog API - Get Item by ASIN
async function test3_CatalogGetItem() {
  console.log('📦 Test 3: Catalog Items API - Get by ASIN');
  console.log('   Endpoint: /catalog/2022-04-01/items/{asin}\n');
  
  const testAsin = 'B00X4WHP5E'; // Test ASIN
  
  try {
    const result = await callAPI({
      method: 'GET',
      path: `/catalog/2022-04-01/items/${testAsin}`,
      query: {
        marketplaceIds: process.env.MARKETPLACE_ID,
        includedData: 'summaries,attributes'
      }
    });
    
    console.log('✅ Success!');
    console.log('   ASIN:', result.asin);
    console.log('   Title:', result.summaries?.[0]?.itemName || 'N/A');
    console.log('   Brand:', result.summaries?.[0]?.brand || 'N/A');
    console.log('');
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.message);
    console.log('');
    return false;
  }
}

// Test 4: Listings Items API - Get Product Type Definitions
async function test4_ListingsProductType() {
  console.log('📋 Test 4: Listings Items API - Product Type Definitions');
  console.log('   Endpoint: /definitions/2020-09-01/productTypes/{productType}\n');
  
  try {
    const result = await callAPI({
      method: 'GET',
      path: '/definitions/2020-09-01/productTypes/SPORTING_GOODS',
      query: {
        marketplaceIds: [process.env.MARKETPLACE_ID],
        requirements: 'LISTING'
      }
    });
    
    console.log('✅ Success!');
    console.log('   Product Type:', result.productType);
    console.log('   Display Name:', result.displayName);
    console.log('   Requirements loaded:', result.requirements ? 'Yes' : 'No');
    console.log('   This is what you need to create products!');
    console.log('');
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.message);
    console.log('');
    return false;
  }
}

// Run all tests
async function runTests() {
  const results = {
    test1: await test1_Marketplace(),
    test2: await test2_CatalogSearch(),
    test3: await test3_CatalogGetItem(),
    test4: await test4_ListingsProductType()
  };
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 RESULTS SUMMARY\n');
  console.log(`Test 1 (Marketplace):    ${results.test1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Test 2 (Catalog Search): ${results.test2 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Test 3 (Catalog Get):    ${results.test3 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Test 4 (Listings Defs):  ${results.test4 ? '✅ PASS' : '❌ FAIL'}`);
  console.log('\n═══════════════════════════════════════════════════════\n');
  
  const allPassed = Object.values(results).every(r => r);
  
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('   Your SP-API setup is complete and fully functional!');
    console.log('   You can now build the monitoring dashboard.\n');
  } else {
    const passedCount = Object.values(results).filter(r => r).length;
    console.log(`⚠️  ${passedCount}/4 TESTS PASSED`);
    console.log('   Review failed tests above for details.\n');
  }
}

runTests().catch(console.error);
