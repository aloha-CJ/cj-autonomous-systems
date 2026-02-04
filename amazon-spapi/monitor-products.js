/**
 * Reef Clear Product Monitor
 * Real-time dashboard for your products
 */

const { callAPI } = require('./lib/sp-api-client');

// Your products
const PRODUCTS = {
  'reef-clear-1pack': {
    name: 'Reef Clear (1-pack)',
    asin: 'B0FGW6GNT4',
    sku: 'RC-1PK', // Update if different
    targetStock: 500 // Alert threshold
  },
  'reef-clear-2pack': {
    name: 'Reef Clear (2-pack)',
    asin: 'B0G15KBHSG',
    sku: 'RC-2PK', // Update if different
    targetStock: 200
  }
};

const MARKETPLACE_ID = process.env.MARKETPLACE_ID;

/**
 * Get product catalog data
 */
async function getCatalogData(asin) {
  try {
    const result = await callAPI({
      method: 'GET',
      path: `/catalog/2022-04-01/items/${asin}`,
      query: {
        marketplaceIds: MARKETPLACE_ID,
        includedData: 'summaries,salesRanks,images'
      }
    });
    return result;
  } catch (error) {
    console.error(`  ⚠️  Catalog API error: ${error.message}`);
    return null;
  }
}

/**
 * Get competitive pricing data
 */
async function getPricingData(asin) {
  try {
    const result = await callAPI({
      method: 'GET',
      path: '/products/pricing/v0/price',
      query: {
        MarketplaceId: MARKETPLACE_ID,
        Asins: asin,
        ItemType: 'Asin'
      }
    });
    return result;
  } catch (error) {
    console.error(`  ⚠️  Pricing API error: ${error.message}`);
    return null;
  }
}

/**
 * Get inventory summary
 */
async function getInventoryData(sku) {
  try {
    const result = await callAPI({
      method: 'GET',
      path: '/fba/inventory/v1/summaries',
      query: {
        details: true,
        granularityType: 'Marketplace',
        granularityId: MARKETPLACE_ID,
        marketplaceIds: MARKETPLACE_ID,
        sellerSkus: sku
      }
    });
    return result;
  } catch (error) {
    console.error(`  ⚠️  Inventory API error: ${error.message}`);
    return null;
  }
}

/**
 * Get sales metrics (orders)
 */
async function getSalesMetrics() {
  // Get orders from last 7 days
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  
  try {
    const result = await callAPI({
      method: 'GET',
      path: '/orders/v0/orders',
      query: {
        MarketplaceIds: MARKETPLACE_ID,
        CreatedAfter: startDate.toISOString(),
        OrderStatuses: 'Unshipped,PartiallyShipped,Shipped'
      }
    });
    return result;
  } catch (error) {
    console.error(`  ⚠️  Orders API error: ${error.message}`);
    return null;
  }
}

/**
 * Monitor a single product
 */
async function monitorProduct(productKey) {
  const product = PRODUCTS[productKey];
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📦 ${product.name}`);
  console.log(`   ASIN: ${product.asin} | SKU: ${product.sku}`);
  console.log(`${'='.repeat(60)}\n`);
  
  // Catalog Data
  console.log('📊 CATALOG DATA');
  const catalog = await getCatalogData(product.asin);
  if (catalog) {
    const summary = catalog.summaries?.[0];
    console.log(`   Title: ${summary?.itemName || 'N/A'}`);
    console.log(`   Brand: ${summary?.brand || 'N/A'}`);
    
    // Sales Rank
    const salesRank = catalog.salesRanks?.[0];
    if (salesRank) {
      console.log(`   Sales Rank: #${salesRank.rank} in ${salesRank.displayGroupTitle}`);
    }
  }
  
  // Pricing Data
  console.log('\n💰 PRICING');
  const pricing = await getPricingData(product.asin);
  if (pricing?.payload?.[0]) {
    const price = pricing.payload[0];
    const listingPrice = price.Product?.Offers?.[0]?.ListingPrice;
    const buyBox = price.Product?.Offers?.[0]?.IsBuyBoxWinner;
    
    if (listingPrice) {
      console.log(`   Your Price: $${listingPrice.Amount} ${listingPrice.CurrencyCode}`);
      console.log(`   Buy Box: ${buyBox ? '✅ YOU HAVE IT' : '❌ LOST'}`);
    }
    
    // Competitive prices
    const competitivePrices = price.Product?.CompetitivePricing?.CompetitivePrices || [];
    if (competitivePrices.length > 0) {
      console.log('\n   Competitive Prices:');
      competitivePrices.forEach(cp => {
        console.log(`     ${cp.condition}: $${cp.Price.ListingPrice.Amount}`);
      });
    }
  }
  
  // Inventory Data
  console.log('\n📦 INVENTORY');
  const inventory = await getInventoryData(product.sku);
  if (inventory?.payload?.inventorySummaries?.[0]) {
    const inv = inventory.payload.inventorySummaries[0];
    const available = inv.totalQuantity || 0;
    const inbound = inv.inboundWorkingQuantity || 0;
    const reserved = inv.reservedQuantity?.totalReservedQuantity || 0;
    
    console.log(`   Available: ${available} units`);
    console.log(`   Inbound: ${inbound} units`);
    console.log(`   Reserved: ${reserved} units`);
    
    // Alert if low
    if (available < product.targetStock) {
      const daysLeft = Math.floor(available / (available / 7)); // Rough estimate
      console.log(`   ⚠️  LOW STOCK ALERT! (~${daysLeft} days remaining)`);
    } else {
      console.log(`   ✅ Stock healthy`);
    }
  }
  
  console.log('');
}

/**
 * Full dashboard
 */
async function runDashboard() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║       REEF CLEAR PRODUCT MONITORING DASHBOARD         ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log(`\n⏰ ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} CST\n`);
  
  // Monitor each product
  for (const productKey of Object.keys(PRODUCTS)) {
    await monitorProduct(productKey);
  }
  
  // Sales Summary
  console.log(`${'='.repeat(60)}`);
  console.log('📈 SALES SUMMARY (Last 7 Days)');
  console.log(`${'='.repeat(60)}\n`);
  
  const sales = await getSalesMetrics();
  if (sales?.payload?.Orders) {
    const orders = sales.payload.Orders;
    console.log(`   Total Orders: ${orders.length}`);
    
    // Count by product (would need to parse order items)
    console.log(`   Revenue: $${orders.reduce((sum, o) => {
      const amount = parseFloat(o.OrderTotal?.Amount || 0);
      return sum + amount;
    }, 0).toFixed(2)}`);
  } else {
    console.log('   No sales data available (may need authorization)');
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  console.log('💡 TIP: Run this script regularly to monitor your products!');
  console.log('   Consider setting up a cron job or scheduled task.\n');
}

// Run it
runDashboard().catch(error => {
  console.error('\n❌ Dashboard failed:', error.message);
  console.error('\nThis might be because:');
  console.error('  - Still in sandbox mode (switch to production)');
  console.error('  - Need to authorize additional API scopes');
  console.error('  - SKUs in the script need updating\n');
});
