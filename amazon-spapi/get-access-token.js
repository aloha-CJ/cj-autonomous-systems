// Amazon SP-API: How to Exchange Refresh Token for Access Token
require('dotenv').config();
const axios = require('axios');

// Amazon's OAuth endpoint (Login with Amazon - LWA)
const LWA_TOKEN_URL = 'https://api.amazon.com/auth/o2/token';

async function getAccessToken() {
  console.log('🔐 SP-API Token Exchange Process\n');
  
  // Step 1: Load credentials from .env
  const clientId = process.env.SP_API_CLIENT_ID;
  const clientSecret = process.env.SP_API_CLIENT_SECRET;
  const refreshToken = process.env.SP_API_REFRESH_TOKEN;
  
  console.log('Step 1: Loaded credentials from .env');
  console.log('  Client ID:', clientId?.substring(0, 30) + '...');
  console.log('  Client Secret:', clientSecret?.substring(0, 20) + '...');
  console.log('  Refresh Token:', refreshToken?.substring(0, 20) + '...\n');
  
  if (!clientId || !clientSecret || !refreshToken) {
    console.error('❌ Missing credentials in .env file!');
    return null;
  }
  
  try {
    // Step 2: Make the token exchange request
    console.log('Step 2: Requesting access token from Amazon LWA...');
    console.log(`  POST ${LWA_TOKEN_URL}`);
    console.log('  Body: grant_type=refresh_token, refresh_token=<your token>\n');
    
    const response = await axios.post(LWA_TOKEN_URL, {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Step 3: Extract the access token
    const accessToken = response.data.access_token;
    const expiresIn = response.data.expires_in; // seconds until expiration
    
    console.log('✅ Success! Got new access token');
    console.log('  Token:', accessToken.substring(0, 30) + '...');
    console.log(`  Expires in: ${expiresIn} seconds (${Math.floor(expiresIn / 60)} minutes)\n`);
    
    // Step 4: Show what you do with it
    console.log('Step 3: This token is what you include in API requests');
    console.log('  Header: x-amz-access-token: <access token>');
    console.log('  Use it for all SP-API calls until it expires');
    console.log('  When it expires, run this process again\n');
    
    return {
      accessToken,
      expiresIn,
      expiresAt: new Date(Date.now() + (expiresIn * 1000))
    };
    
  } catch (error) {
    console.error('❌ Token exchange failed!');
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('  Error:', error.message);
    }
    return null;
  }
}

// Run it
if (require.main === module) {
  getAccessToken();
}

module.exports = { getAccessToken };
