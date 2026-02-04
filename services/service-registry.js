#!/usr/bin/env node
/**
 * CJ Service Registry
 * Tracks all autonomous service signups, credentials, and capabilities
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const REGISTRY_FILE = path.join(__dirname, 'registry.json');
const CREDENTIALS_FILE = path.join(__dirname, '.credentials.enc');
const KEY_FILE = path.join(__dirname, '.key');

// Initialize encryption key
function getEncryptionKey() {
    if (!fs.existsSync(KEY_FILE)) {
        const key = crypto.randomBytes(32);
        fs.writeFileSync(KEY_FILE, key.toString('hex'));
    }
    return Buffer.from(fs.readFileSync(KEY_FILE, 'utf8'), 'hex');
}

// Encrypt sensitive data
function encrypt(text) {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

// Decrypt sensitive data
function decrypt(encrypted) {
    const key = getEncryptionKey();
    const parts = encrypted.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// Load registry
function loadRegistry() {
    if (!fs.existsSync(REGISTRY_FILE)) {
        return { services: {}, created: Date.now(), updated: Date.now() };
    }
    return JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
}

// Save registry
function saveRegistry(registry) {
    registry.updated = Date.now();
    fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2));
}

// Add service
function addService(name, config) {
    const registry = loadRegistry();
    
    registry.services[name] = {
        name,
        added: Date.now(),
        status: 'active',
        tier: config.tier || 'free',
        url: config.url,
        features: config.features || [],
        notes: config.notes || '',
        credentials_stored: false
    };
    
    if (config.credentials) {
        storeCredentials(name, config.credentials);
        registry.services[name].credentials_stored = true;
    }
    
    saveRegistry(registry);
    console.log(`✅ Added service: ${name}`);
}

// Store credentials (encrypted)
function storeCredentials(serviceName, credentials) {
    let allCreds = {};
    if (fs.existsSync(CREDENTIALS_FILE)) {
        const encrypted = fs.readFileSync(CREDENTIALS_FILE, 'utf8');
        allCreds = JSON.parse(decrypt(encrypted));
    }
    
    allCreds[serviceName] = {
        ...credentials,
        stored: Date.now()
    };
    
    const encrypted = encrypt(JSON.stringify(allCreds));
    fs.writeFileSync(CREDENTIALS_FILE, encrypted);
}

// Get credentials
function getCredentials(serviceName) {
    if (!fs.existsSync(CREDENTIALS_FILE)) {
        return null;
    }
    
    const encrypted = fs.readFileSync(CREDENTIALS_FILE, 'utf8');
    const allCreds = JSON.parse(decrypt(encrypted));
    return allCreds[serviceName] || null;
}

// List services
function listServices() {
    const registry = loadRegistry();
    console.log('\n🌊 CJ Service Registry\n');
    
    if (Object.keys(registry.services).length === 0) {
        console.log('No services registered yet.');
        return;
    }
    
    Object.values(registry.services).forEach(service => {
        console.log(`\n📦 ${service.name}`);
        console.log(`   Status: ${service.status}`);
        console.log(`   Tier: ${service.tier}`);
        console.log(`   URL: ${service.url}`);
        if (service.features.length > 0) {
            console.log(`   Features: ${service.features.join(', ')}`);
        }
        if (service.credentials_stored) {
            console.log(`   🔐 Credentials stored securely`);
        }
        console.log(`   Added: ${new Date(service.added).toLocaleString()}`);
    });
    
    console.log(`\nTotal services: ${Object.keys(registry.services).length}`);
}

// CLI
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
    case 'add':
        const name = args[1];
        const url = args[2];
        const tier = args[3] || 'free';
        if (!name || !url) {
            console.error('Usage: node service-registry.js add <name> <url> [tier]');
            process.exit(1);
        }
        addService(name, { url, tier });
        break;
        
    case 'list':
        listServices();
        break;
        
    case 'export':
        const registry = loadRegistry();
        console.log(JSON.stringify(registry, null, 2));
        break;
        
    default:
        console.log('Usage:');
        console.log('  node service-registry.js add <name> <url> [tier]');
        console.log('  node service-registry.js list');
        console.log('  node service-registry.js export');
}

module.exports = { addService, getCredentials, listServices, loadRegistry };
