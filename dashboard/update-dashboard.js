#!/usr/bin/env node
/**
 * Dashboard Data Updater
 * Run this script to update dashboard/data.json with current system state
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DATA_FILE = path.join(__dirname, 'data.json');

async function updateDashboardData() {
    const data = {
        timestamp: Date.now(),
        cj_status: await getCJStatus(),
        agents: await getActiveAgents(),
        store: await getStoreData()
    };
    
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log('Dashboard data updated:', new Date().toLocaleString());
}

async function getCJStatus() {
    // Check if there's current activity logged
    const activityFile = path.join(__dirname, '..', 'memory', 'current-activity.json');
    
    if (fs.existsSync(activityFile)) {
        try {
            const activity = JSON.parse(fs.readFileSync(activityFile, 'utf8'));
            return {
                activity: activity.task || 'Idle',
                details: activity.details || null,
                alert_type: activity.type || 'success'
            };
        } catch (err) {
            console.error('Error reading activity file:', err);
        }
    }
    
    return {
        activity: 'Idle',
        details: 'Monitoring systems and ready for tasks',
        alert_type: 'success'
    };
}

async function getActiveAgents() {
    // This would query clawdbot sessions
    // For now, return empty array - will integrate with sessions_list via API
    return [];
}

async function getStoreData() {
    // Placeholder for Amazon SP-API integration
    // Will be populated with real data once API is connected
    
    const storeDataFile = path.join(__dirname, 'store-cache.json');
    
    if (fs.existsSync(storeDataFile)) {
        try {
            return JSON.parse(fs.readFileSync(storeDataFile, 'utf8'));
        } catch (err) {
            console.error('Error reading store cache:', err);
        }
    }
    
    return {
        revenue_30d: "Awaiting API integration",
        orders_30d: "Awaiting API integration",
        active_products: "Awaiting API integration",
        inventory_status: "Awaiting API integration",
        products: [
            {
                name: "Defog Max - Anti-Fog Spray",
                sales_30d: "Pending",
                rank: "Pending",
                stock: "Pending"
            }
        ],
        recommendations: [
            "Amazon SP-API credentials needed for real-time data sync",
            "Once connected, I'll track sales, inventory, reviews, and BSR automatically"
        ]
    };
}

// Run update
updateDashboardData().catch(console.error);
