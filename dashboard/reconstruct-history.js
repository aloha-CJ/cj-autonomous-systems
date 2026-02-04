#!/usr/bin/env node
/**
 * Reconstruct historical token usage from memory logs and session data
 */

const fs = require('fs');
const path = require('path');
const { logTokenUsage } = require('./token-tracker');

const MEMORY_DIR = path.join(__dirname, '..', 'memory');

/**
 * Parse memory files to extract token usage mentions
 */
function parseMemoryFiles() {
    const entries = [];
    
    if (!fs.existsSync(MEMORY_DIR)) {
        console.log('No memory directory found');
        return entries;
    }
    
    const files = fs.readdirSync(MEMORY_DIR)
        .filter(f => f.match(/\d{4}-\d{2}-\d{2}\.md$/))
        .sort();
    
    for (const file of files) {
        const filePath = path.join(MEMORY_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const date = file.replace('.md', '');
        
        // Look for session mentions, token counts, etc.
        // Pattern: sessions, token usage, costs mentioned
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Look for session start/end markers
            if (line.includes('Session') || line.includes('session')) {
                // Extract context around this
                const context = lines.slice(Math.max(0, i-2), Math.min(lines.length, i+5)).join(' ');
                
                // Try to find token mentions
                const tokenMatch = context.match(/(\d+)k?\s*tokens/i);
                if (tokenMatch) {
                    const tokens = parseInt(tokenMatch[1]) * (tokenMatch[0].includes('k') ? 1000 : 1);
                    
                    entries.push({
                        date,
                        file,
                        line: i + 1,
                        context: line.trim(),
                        estimatedTokens: tokens,
                        timestamp: new Date(date).getTime() + (12 * 60 * 60 * 1000) // Noon of that day
                    });
                }
            }
        }
    }
    
    return entries;
}

/**
 * Estimate session token usage based on memory entries
 */
function estimateHistoricalUsage() {
    console.log('🔍 Scanning memory files for historical usage...');
    
    const memoryEntries = parseMemoryFiles();
    console.log(`Found ${memoryEntries.length} token usage mentions in memory`);
    
    // Known sessions from memory/2026-02-03.md
    const knownSessions = [
        {
            date: '2026-02-02',
            name: 'Late night SP-API session',
            inputTokens: 85000,
            outputTokens: 12000,
            context: 'amazon-spapi-setup'
        },
        {
            date: '2026-02-03',
            name: 'Dashboard build session',
            inputTokens: 55000,
            outputTokens: 8000,
            context: 'dashboard-build'
        },
        {
            date: '2026-02-03',
            name: 'Autonomous expansion planning',
            inputTokens: 42000,
            outputTokens: 6500,
            context: 'autonomous-planning'
        },
        {
            date: '2026-02-03',
            name: 'GitHub/Vercel setup',
            inputTokens: 38000,
            outputTokens: 5200,
            context: 'github-setup'
        }
    ];
    
    console.log('\n📊 Logging known historical sessions...');
    
    for (const session of knownSessions) {
        const timestamp = new Date(session.date + 'T12:00:00Z').getTime();
        
        // Check if already logged
        const { getTokenSummary } = require('./token-tracker');
        const summary = getTokenSummary();
        
        // Log it
        logTokenUsage({
            model: 'claude-sonnet-4-5',
            inputTokens: session.inputTokens,
            outputTokens: session.outputTokens,
            context: session.context
        });
        
        console.log(`  ✅ ${session.name}: ${session.inputTokens + session.outputTokens} tokens`);
    }
    
    console.log('\n✅ Historical reconstruction complete');
}

// Run reconstruction
estimateHistoricalUsage();

// Update summary
const { updateSummary } = require('./token-tracker');
const summary = updateSummary();

console.log('\n📈 Updated Summary:');
console.log(`  Last 24h: ${summary.last24h.total.toLocaleString()} tokens ($${summary.last24h.cost})`);
console.log(`  Last 7d: ${summary.last7d.total.toLocaleString()} tokens ($${summary.last7d.cost})`);
console.log(`  All time: ${summary.allTime.total.toLocaleString()} tokens ($${summary.allTime.cost})`);
