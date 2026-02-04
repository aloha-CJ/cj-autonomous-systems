#!/usr/bin/env node
/**
 * Helper to log CJ thoughts
 * Usage: node dashboard/log-thought.js "your thought"
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);

if (args.length < 1) {
    console.error('Usage: node log-thought.js "your thought"');
    process.exit(1);
}

const thoughtsFile = path.join(__dirname, '..', 'memory', 'recent-thoughts.json');
let thoughts = [];

try {
    if (fs.existsSync(thoughtsFile)) {
        thoughts = JSON.parse(fs.readFileSync(thoughtsFile, 'utf8'));
    }
} catch (err) {
    console.error('Error reading thoughts:', err);
}

thoughts.push({
    timestamp: Date.now(),
    text: args[0]
});

// Keep last 50 thoughts
if (thoughts.length > 50) {
    thoughts = thoughts.slice(-50);
}

fs.writeFileSync(thoughtsFile, JSON.stringify(thoughts, null, 2));
console.log('✅ Thought logged');

// Update dashboard
try {
    execSync('node ' + path.join(__dirname, 'update-data.js'), { stdio: 'inherit' });
} catch (err) {
    console.error('Failed to update dashboard:', err.message);
}
