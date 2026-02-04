# Amazon SP-API Integration

Automated product submission and management for Adventure Cat LLC / Aloha Reef Gear.

## 🎯 Purpose

Automate the process of:
- Creating new product listings on Amazon
- Updating existing products (prices, inventory, descriptions)
- Managing catalog data
- Retrieving product information

## 🔐 Authentication Overview

Amazon SP-API requires **two layers** of authentication:

### 1. LWA (Login with Amazon) OAuth
- **What:** Proves your app has permission to access your seller account
- **Components:**
  - Client ID (app identifier)
  - Client Secret (app password)
  - Refresh Token (long-lived access permission)
- **Gets you:** Short-lived access tokens (1 hour)

### 2. AWS IAM Signature V4
- **What:** Signs each API request to prove it came from authorized AWS identity
- **Components:**
  - AWS Access Key ID
  - AWS Secret Access Key
  - IAM Role ARN (with SP-API permissions)
- **Required for:** Most write operations, some read operations

**Both are required for full functionality.**

## 📁 Project Structure

```
amazon-spapi/
├── .env                      # Your secrets (NEVER COMMIT!)
├── .env.example             # Template showing what to fill in
├── .gitignore               # Protects secrets from git
├── package.json             # Dependencies
├── lib/
│   └── sp-client.js         # Reusable API client setup
├── test-with-library.js     # Comprehensive test suite
└── README.md                # This file
```

## 🚀 Setup Instructions

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Credentials

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your credentials in `.env`:

   **LWA Credentials** (you already have these):
   - Get from [Seller Central Developer Console](https://sellercentral.amazon.com/apps/manage)
   - Solution Provider Portal > Your App > View Credentials

   **AWS IAM Credentials** (still needed):
   - Go to [AWS IAM Console](https://console.aws.amazon.com/iam)
   - Follow the "AWS Setup" section below

### Step 3: AWS IAM Setup

1. **Create IAM User:**
   - Go to IAM > Users > Create user
   - Name: `sp-api-user` (or whatever you prefer)
   - Enable "Programmatic access"

2. **Attach Policy:**
   - Create custom policy with SP-API permissions
   - Or attach AWS-managed policy (if available)

3. **Create Access Key:**
   - User details > Security credentials > Create access key
   - Copy Access Key ID and Secret Access Key to `.env`

4. **Create IAM Role:**
   - IAM > Roles > Create role
   - Trusted entity: Your AWS account
   - Attach SP-API permissions
   - Copy Role ARN to `.env`

5. **Link Role to SP-API App:**
   - In Seller Central Developer Console
   - Add the IAM Role ARN to your app configuration

### Step 4: Test Your Setup

```bash
node test-with-library.js
```

This runs 3 tests:
- **Test 1:** Basic auth (LWA only)
- **Test 2:** Catalog search (may need AWS)
- **Test 3:** Listings metadata (definitely needs AWS)

## 📊 Current Status

✅ **Completed:**
- LWA OAuth setup (Client ID, Secret, Refresh Token)
- Sandbox app created and authorized
- Basic authentication working
- Test suite created
- Security setup (.gitignore)
- Proper SP-API library installed (`amazon-sp-api`)

⚠️ **Needs Completion:**
- AWS IAM credentials configuration
- IAM role creation and linking
- Full API access verification
- Product submission workflow implementation

## 🔧 Usage Examples

### Get Marketplace Info
```javascript
const { createClient } = require('./lib/sp-client');

const client = createClient();
const marketplaces = await client.callAPI({
  operation: 'getMarketplaceParticipations',
  endpoint: 'sellers'
});
```

### Search Catalog
```javascript
const results = await client.callAPI({
  operation: 'searchCatalogItems',
  endpoint: 'catalog',
  query: {
    keywords: ['snorkel', 'mask'],
    marketplaceIds: ['ATVPDKIKX0DER']
  }
});
```

### Create Product (once AWS credentials added)
```javascript
const result = await client.callAPI({
  operation: 'putListingsItem',
  endpoint: 'listings',
  path: {
    sellerId: 'YOUR_SELLER_ID',
    sku: 'ALOHA-001'
  },
  body: {
    productType: 'SPORTING_GOODS',
    requirements: 'LISTING',
    attributes: {
      // Product data here
    }
  }
});
```

## 🔒 Security Notes

- **NEVER commit `.env`** - it's in `.gitignore` for a reason
- Client Secret rotates on: **2026-08-02** (set calendar reminder)
- Refresh tokens don't expire but can be revoked
- Access tokens expire every hour (library auto-refreshes)
- AWS credentials should be rotated periodically

## 📚 Resources

- [SP-API Documentation](https://developer-docs.amazon.com/sp-api/)
- [amazon-sp-api Library](https://github.com/amz-tools/amazon-sp-api)
- [AWS IAM Setup Guide](https://developer-docs.amazon.com/sp-api/docs/creating-and-configuring-iam-policies-and-entities)

## 🐛 Troubleshooting

### "Unauthorized" errors
- Check refresh token is correct
- Verify client ID and secret match
- Ensure app is authorized in Seller Central

### "Access Denied" errors
- Usually means AWS credentials missing or incorrect
- Check IAM role has proper permissions
- Verify role ARN is correct in `.env`

### Rate limiting
- The library handles auto-retry for throttled requests
- If persistent, you may need to implement additional delays

## 📝 Next Steps

1. Complete AWS IAM setup
2. Run full test suite to verify everything works
3. Build product submission workflow
4. Test in sandbox with sample products
5. Move to production credentials
6. Deploy automation
