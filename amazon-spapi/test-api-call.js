// Test making an actual SP-API call
require('dotenv').config();
const axios = require('axios');
const { getAccessToken } = require('./get-access-token');

const SANDBOX_ENDPOINT = 'https://sandbox.sellingpartnerapi-na.amazon.com';
const MARKETPLACE_ID = 'ATVPDKIKX0DER'; // US

async function testCatalogAPI() {
  console.log('📦 Testing Amazon Catalog API\n');
  
  // Step 1: Get a fresh access token
  console.log('Step 1: Getting fresh access token...');
  const tokenData = await getAccessToken();
  
  if (!tokenData) {
    console.error('Failed to get access token. Cannot proceed.');
    return;
  }
  
  console.log('\nStep 2: Making API request to Catalog API...');
  
  // Use a sample ASIN (Amazon Standard Identification Number)
  const testAsin = 'B00X4WHP5E';
  console.log(`  Endpoint: /catalog/2022-04-01/items/${testAsin}`);
  console.log(`  Marketplace: ${MARKETPLACE_ID} (US)\n`);
  
  try {
    const response = await axios.get(
      `${SANDBOX_ENDPOINT}/catalog/2022-04-01/items/${testAsin}`,
      {
        headers: {
          'x-amz-access-token': tokenData.accessToken,
          'Accept': 'application/json'
        },
        params: {
          marketplaceIds: MARKETPLACE_ID,
          includedData: 'summaries,attributes,images'
        }
      }
    );
    
    console.log('✅ API Call Successful!\n');
    console.log('Response Status:', response.status);
    console.log('\nProduct Info:');
    
    const item = response.data;
    const summary = item.summaries?.[0];
    
    if (summary) {
      console.log('  ASIN:', item.asin);
      console.log('  Title:', summary.itemName);
      console.log('  Brand:', summary.brand);
      console.log('  Categories:', summary.browseClassification?.displayName || 'N/A');
    }
    
    console.log('\n📊 Full Response (first 800 chars):');
    console.log(JSON.stringify(response.data, null, 2).substring(0, 800) + '...\n');
    
    console.log('✨ Success! You can now make SP-API calls.');
    console.log('This same pattern works for ALL SP-API endpoints:\n');
    console.log('  1. Get access token (refresh when expired)');
    console.log('  2. Include it in x-amz-access-token header');
    console.log('  3. Make your API request');
    
  } catch (error) {
    console.error('❌ API call failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

testCatalogAPI();
