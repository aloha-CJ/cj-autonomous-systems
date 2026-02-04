#!/usr/bin/env node
/**
 * Real Dashboard Data Updater with Error Handling & Restore Protocol
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = path.join(__dirname, '..');
const DATA_FILE = path.join(__dirname, 'data.json');
const BACKUP_FILE = path.join(__dirname, 'data.backup.json');
const MEMORY_DIR = path.join(WORKSPACE, 'memory');

// Restore protocol: always backup before writing
function safeWrite(filePath, data) {
    try {
        const jsonData = JSON.stringify(data, null, 2);
        
        // Backup existing file if it exists
        if (fs.existsSync(filePath)) {
            fs.copyFileSync(filePath, BACKUP_FILE);
        }
        
        // Write new data
        fs.writeFileSync(filePath, jsonData, 'utf8');
        return true;
    } catch (err) {
        console.error('Write failed, attempting restore:', err);
        
        // Restore from backup if write failed
        if (fs.existsSync(BACKUP_FILE)) {
            try {
                fs.copyFileSync(BACKUP_FILE, filePath);
                console.log('Restored from backup');
            } catch (restoreErr) {
                console.error('CRITICAL: Restore failed:', restoreErr);
            }
        }
        return false;
    }
}

function getCJStatus() {
    const activityFile = path.join(MEMORY_DIR, 'current-activity.json');
    
    try {
        if (fs.existsSync(activityFile)) {
            const activity = JSON.parse(fs.readFileSync(activityFile, 'utf8'));
            return {
                state: activity.state || 'active',
                task: activity.task || 'Idle',
                activity: activity.task || 'Idle',
                details: activity.details || null,
                alert_type: activity.type || 'success',
                stats: activity.stats || null
            };
        }
    } catch (err) {
        console.error('Error reading activity:', err);
    }
    
    return {
        state: 'idle',
        task: 'Idle',
        activity: 'Idle',
        details: 'Waiting for tasks',
        alert_type: 'success',
        stats: null
    };
}

function getActiveAgents() {
    // This will be populated by sessions_list data written by CJ
    const agentsFile = path.join(__dirname, 'agents-cache.json');
    
    try {
        if (fs.existsSync(agentsFile)) {
            const cache = JSON.parse(fs.readFileSync(agentsFile, 'utf8'));
            // Return just the agents array, not the whole wrapper object
            return cache.agents || [];
        }
    } catch (err) {
        console.error('Error reading agents cache:', err);
    }
    
    return [];
}

function getRecentThoughts() {
    const thoughtsFile = path.join(MEMORY_DIR, 'recent-thoughts.json');
    
    try {
        if (fs.existsSync(thoughtsFile)) {
            const thoughts = JSON.parse(fs.readFileSync(thoughtsFile, 'utf8'));
            // Return last 10 thoughts
            return thoughts.slice(-10).reverse();
        }
    } catch (err) {
        console.error('Error reading thoughts:', err);
    }
    
    return [];
}

function getMemoryFiles() {
    try {
        if (!fs.existsSync(MEMORY_DIR)) {
            return [];
        }
        
        const files = fs.readdirSync(MEMORY_DIR)
            .filter(f => f.match(/^\d{4}-\d{2}-\d{2}\.md$/))
            .sort()
            .reverse()
            .slice(0, 30); // Last 30 days
        
        return files.map(f => {
            const filePath = path.join(MEMORY_DIR, f);
            const content = fs.readFileSync(filePath, 'utf8');
            const firstLine = content.split('\n')[0] || '';
            
            return {
                date: f.replace('.md', ''),
                path: f,
                preview: firstLine.substring(0, 100),
                content: content // Include full content for modal display
            };
        });
    } catch (err) {
        console.error('Error reading memory files:', err);
        return [];
    }
}

function updateDashboard() {
    const data = {
        timestamp: Date.now(),
        cj_status: getCJStatus(),
        agents: getActiveAgents(),
        thoughts: getRecentThoughts(),
        memory_files: getMemoryFiles(),
        store: null // Will be populated when Amazon SP-API is ready
    };
    
    if (safeWrite(DATA_FILE, data)) {
        console.log('✅ Dashboard updated:', new Date().toLocaleString());
    } else {
        console.error('❌ Dashboard update failed');
    }
}

// Run update
updateDashboard();
