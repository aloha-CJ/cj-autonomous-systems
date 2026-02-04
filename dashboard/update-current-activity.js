#!/usr/bin/env node
/**
 * Quick activity updater - call this every time you do something
 * Usage: node dashboard/update-current-activity.js "Writing code" "Building the login system"
 */

const fs = require('fs');
const path = require('path');

const task = process.argv[2] || 'Working';
const details = process.argv[3] || '';

const activity = {
  timestamp: Date.now(),
  task: task,
  details: details,
  type: 'working'
};

fs.writeFileSync(
  path.join(__dirname, '../memory/current-activity.json'),
  JSON.stringify(activity, null, 2)
);

// Also update dashboard data immediately
const { exec } = require('child_process');
exec('node dashboard/update-data.js', (err) => {
  if (err) console.error('Dashboard update failed:', err);
});

console.log(`✅ Activity updated: ${task}`);
