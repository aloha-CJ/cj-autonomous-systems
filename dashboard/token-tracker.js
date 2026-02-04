#!/usr/bin/env node
/**
 * Token Usage Tracker
 * Logs and aggregates token usage across time periods
 */

const fs = require('fs');
const path = require('path');

const TOKENS_LOG = path.join(__dirname, '..', 'memory', 'token-usage.jsonl');
const TOKENS_SUMMARY = path.join(__dirname, 'token-summary.json');

// Claude Sonnet 4.5 pricing (as of Feb 2026)
const PRICING = {
  'claude-sonnet-4-5': {
    input: 3.00 / 1_000_000,   // $3 per million input tokens
    output: 15.00 / 1_000_000   // $15 per million output tokens
  }
};

/**
 * Log a token usage event
 */
function logTokenUsage({ model = 'claude-sonnet-4-5', inputTokens, outputTokens, context }) {
  const entry = {
    timestamp: Date.now(),
    date: new Date().toISOString().split('T')[0],
    model,
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    cost: calculateCost(model, inputTokens, outputTokens),
    context: context || 'unknown'
  };
  
  // Append to log file
  const logDir = path.dirname(TOKENS_LOG);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  fs.appendFileSync(TOKENS_LOG, JSON.stringify(entry) + '\n');
  
  return entry;
}

/**
 * Calculate cost for token usage
 */
function calculateCost(model, inputTokens, outputTokens) {
  const pricing = PRICING[model] || PRICING['claude-sonnet-4-5'];
  return (inputTokens * pricing.input) + (outputTokens * pricing.output);
}

/**
 * Get token usage summary for different time periods
 */
function getTokenSummary() {
  if (!fs.existsSync(TOKENS_LOG)) {
    return {
      last24h: { inputTokens: 0, outputTokens: 0, totalTokens: 0, cost: 0, interactions: 0 },
      last7d: { inputTokens: 0, outputTokens: 0, totalTokens: 0, cost: 0, interactions: 0 },
      last30d: { inputTokens: 0, outputTokens: 0, totalTokens: 0, cost: 0, interactions: 0 },
      allTime: { inputTokens: 0, outputTokens: 0, totalTokens: 0, cost: 0, interactions: 0 }
    };
  }
  
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  
  const periods = {
    last24h: { cutoff: now - day, data: { inputTokens: 0, outputTokens: 0, totalTokens: 0, cost: 0, interactions: 0 } },
    last7d: { cutoff: now - (7 * day), data: { inputTokens: 0, outputTokens: 0, totalTokens: 0, cost: 0, interactions: 0 } },
    last30d: { cutoff: now - (30 * day), data: { inputTokens: 0, outputTokens: 0, totalTokens: 0, cost: 0, interactions: 0 } },
    allTime: { cutoff: 0, data: { inputTokens: 0, outputTokens: 0, totalTokens: 0, cost: 0, interactions: 0 } }
  };
  
  // Read and aggregate log entries
  const lines = fs.readFileSync(TOKENS_LOG, 'utf8').trim().split('\n').filter(Boolean);
  
  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      
      // Add to each applicable period
      for (const [periodName, period] of Object.entries(periods)) {
        if (entry.timestamp >= period.cutoff) {
          period.data.inputTokens += entry.inputTokens;
          period.data.outputTokens += entry.outputTokens;
          period.data.totalTokens += entry.totalTokens;
          period.data.cost += entry.cost;
          period.data.interactions += 1;
        }
      }
    } catch (err) {
      console.error('Error parsing log line:', err);
    }
  }
  
  // Extract just the data
  const summary = {};
  for (const [periodName, period] of Object.entries(periods)) {
    summary[periodName] = {
      ...period.data,
      cost: Math.round(period.data.cost * 100) / 100 // Round to 2 decimals
    };
  }
  
  return summary;
}

/**
 * Update and save summary
 */
function updateSummary() {
  const summary = getTokenSummary();
  summary.lastUpdated = new Date().toISOString();
  
  fs.writeFileSync(TOKENS_SUMMARY, JSON.stringify(summary, null, 2));
  console.log('✅ Token usage summary updated');
  
  return summary;
}

// CLI usage
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'log') {
    // Log usage: node token-tracker.js log <input> <output>
    const inputTokens = parseInt(process.argv[3]) || 0;
    const outputTokens = parseInt(process.argv[4]) || 0;
    const context = process.argv[5] || 'manual';
    
    const entry = logTokenUsage({ inputTokens, outputTokens, context });
    console.log('✅ Logged:', entry);
  } else if (command === 'summary') {
    // Show summary
    const summary = getTokenSummary();
    console.log(JSON.stringify(summary, null, 2));
  } else {
    // Default: update summary file
    updateSummary();
  }
}

module.exports = { logTokenUsage, getTokenSummary, updateSummary };
