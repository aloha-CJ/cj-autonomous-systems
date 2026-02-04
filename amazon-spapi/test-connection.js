// Quick SP-API connection test
require('dotenv').config();
const axios = require('axios');

const SANDBOX_ENDPOINT = 'https://sandbox.sellingpartnerapi-na.amazon.com';
const MARKETPLACE_ID = 'ATVPDKIKX0DER'; // US

async function testConnection() {
  console.log('🧪 Testing SP-API Connection...\n');
  
  const accessToken = process.env.SP_API_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.error('❌ No access token found in .env');
    return;
  }
  
  console.log('✅ Access token loaded');
  console.log('Token starts with:', accessToken.substring(0, 20) + '...\n');
  
  try {
    // Test 1: Get Catalog Item (use a known ASIN for testing)
    const testAsin = 'B00X4WHP5E'; // Random test ASIN
    console.log(`Testing Catalog API with ASIN: ${testAsin}...`);
    
    const response = await axios.get(
      `${SANDBOX_ENDPOINT}/catalog/2022-04-01/items/${testAsin}`,
      {
        headers: {
          'x-amz-access-token': accessToken,
          'Accept': 'application/json'
        },
        params: {
          marketplaceIds: MARKETPLACE_ID,
          includedData: 'summaries,attributes'
        }
      }
    );
    
    console.log('✅ API Connection successful!');
    console.log('\nResponse status:', response.status);
    console.log('Product title:', response.data.summaries?.[0]?.itemName || 'N/A');
    console.log('\nFull response preview:');
    console.log(JSON.stringify(response.data, null, 2).substring(0, 500) + '...');
    
  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status);
      console.error('Message:', error.response.data);
    } else {
      console.error('❌ Request failed:', error.message);
    }
  }
}

testConnection();
