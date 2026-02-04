// Test with simpler endpoint - Marketplace Participations
require('dotenv').config();
const axios = require('axios');
const { getAccessToken } = require('./get-access-token');

const SANDBOX_ENDPOINT = 'https://sandbox.sellingpartnerapi-na.amazon.com';

async function testMarketplaceAPI() {
  console.log('🌎 Testing Marketplace Participations API (simpler endpoint)\n');
  
  // Get fresh access token
  const tokenData = await getAccessToken();
  if (!tokenData) return;
  
  console.log('\nMaking API request to /sellers/v1/marketplaceParticipations...\n');
  
  try {
    const response = await axios.get(
      `${SANDBOX_ENDPOINT}/sellers/v1/marketplaceParticipations`,
      {
        headers: {
          'x-amz-access-token': tokenData.accessToken,
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('✅ API Call Successful!\n');
    console.log('Response Status:', response.status);
    console.log('\nYour Marketplace Participations:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ API call failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

testMarketplaceAPI();
