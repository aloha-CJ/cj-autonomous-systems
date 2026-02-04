#!/usr/bin/env node
/**
 * Helper to log CJ activity
 * Usage: node dashboard/log-activity.js "task" "details" [type]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);

if (args.length < 1) {
    console.error('Usage: node log-activity.js "task" ["details"] ["type"]');
    process.exit(1);
}

const activityFile = path.join(__dirname, '..', 'memory', 'current-activity.json');

const activity = {
    task: args[0],
    details: args[1] || null,
    type: args[2] || 'success',
    timestamp: Date.now()
};

fs.writeFileSync(activityFile, JSON.stringify(activity, null, 2));
console.log('✅ Activity logged:', activity.task);

// Update dashboard
try {
    execSync('node ' + path.join(__dirname, 'update-data.js'), { stdio: 'inherit' });
} catch (err) {
    console.error('Failed to update dashboard:', err.message);
}
