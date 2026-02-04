/**
 * Amazon SP-API Client
 * Uses amazon-sp-api library which handles:
 * - LWA token refresh automatically
 * - AWS Signature V4 signing
 * - Rate limiting and throttling
 * - Error handling and retries
 */

require('dotenv').config();
const SellingPartnerAPI = require('amazon-sp-api');

/**
 * Create and configure SP-API client
 * @returns {SellingPartnerAPI} Configured client instance
 */
function createClient() {
  const config = {
    region: 'na',  // North America (na, eu, or fe)
    
    // LWA credentials (required)
    refresh_token: process.env.SP_API_REFRESH_TOKEN,
    credentials: {
      SELLING_PARTNER_APP_CLIENT_ID: process.env.SP_API_CLIENT_ID,
      SELLING_PARTNER_APP_CLIENT_SECRET: process.env.SP_API_CLIENT_SECRET,
    },
    
    // AWS credentials (required for production, optional for some sandbox endpoints)
    // Uncomment when you have AWS IAM credentials:
    /*
    access_token: process.env.AWS_ACCESS_KEY_ID,
    secret_key: process.env.AWS_SECRET_ACCESS_KEY,
    role_credentials: {
      id: process.env.AWS_SELLING_PARTNER_ROLE
    },
    */
    
    // Options
    options: {
      auto_request_tokens: true,  // Automatically refresh tokens when expired
      auto_request_throttled: true,  // Auto-retry when rate limited
      debug_log: true,  // Log requests for debugging
      only_grantless_operations: false,
      use_sandbox: process.env.ENVIRONMENT === 'sandbox',  // Use sandbox environment
    }
  };
  
  console.log('🔧 Creating SP-API client...');
  console.log('  Environment:', process.env.ENVIRONMENT);
  console.log('  Region:', config.region);
  console.log('  Sandbox mode:', config.options.use_sandbox);
  console.log('  Auto token refresh:', config.options.auto_request_tokens);
  console.log('  Auto retry throttled:', config.options.auto_request_throttled);
  console.log('');
  
  try {
    const client = new SellingPartnerAPI(config);
    console.log('✅ Client created successfully\n');
    return client;
  } catch (error) {
    console.error('❌ Failed to create client:', error.message);
    throw error;
  }
}

module.exports = { createClient };
