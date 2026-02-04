/**
 * Direct SP-API Client with AWS Signature V4
 * Makes raw HTTPS calls to SP-API endpoints with proper signing
 */

require('dotenv').config();
const axios = require('axios');
const aws4 = require('aws4');

// Get LWA access token
async function getAccessToken() {
  const response = await axios.post('https://api.amazon.com/auth/o2/token', {
    grant_type: 'refresh_token',
    refresh_token: process.env.SP_API_REFRESH_TOKEN,
    client_id: process.env.SP_API_CLIENT_ID,
    client_secret: process.env.SP_API_CLIENT_SECRET
  });
  
  return response.data.access_token;
}

/**
 * Make a signed SP-API request
 * @param {Object} options - Request options
 * @param {string} options.method - HTTP method (GET, POST, etc.)
 * @param {string} options.path - API path (e.g., /sellers/v1/marketplaceParticipations)
 * @param {Object} options.query - Query parameters
 * @param {Object} options.body - Request body (for POST/PUT)
 * @returns {Promise<Object>} API response data
 */
async function callAPI(options) {
  const {
    method = 'GET',
    path,
    query = {},
    body = null
  } = options;
  
  // Get access token
  const accessToken = await getAccessToken();
  
  // Build endpoint
  const endpoint = process.env.ENVIRONMENT === 'sandbox'
    ? 'sandbox.sellingpartnerapi-na.amazon.com'
    : 'sellingpartnerapi-na.amazon.com';
  
  // Build query string
  const queryString = Object.keys(query).length > 0
    ? '?' + new URLSearchParams(query).toString()
    : '';
  
  // Prepare request for AWS signing
  const request = {
    host: endpoint,
    method,
    path: path + queryString,
    headers: {
      'x-amz-access-token': accessToken,
      'Content-Type': 'application/json'
    },
    service: 'execute-api',
    region: 'us-east-1'
  };
  
  // Add body if present
  if (body) {
    request.body = JSON.stringify(body);
    request.headers['Content-Length'] = Buffer.byteLength(request.body);
  }
  
  // Sign request with AWS Sig V4
  aws4.sign(request, {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  });
  
  // Make request
  const url = `https://${endpoint}${path}${queryString}`;
  
  try {
    const response = await axios({
      method,
      url,
      headers: request.headers,
      data: body || undefined
    });
    
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`SP-API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

module.exports = { callAPI, getAccessToken };
