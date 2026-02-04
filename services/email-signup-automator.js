#!/usr/bin/env node
/**
 * Email Signup Automator
 * Monitors email for verification links and automates confirmation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class EmailSignupAutomator {
    constructor() {
        this.signupQueue = [];
        this.monitoringInterval = 30000; // Check every 30 seconds
    }
    
    // Add service to signup queue
    queueSignup(serviceName, signupUrl, email = 'ai@alohareefgear.com') {
        this.signupQueue.push({
            service: serviceName,
            url: signupUrl,
            email,
            status: 'pending',
            queued: Date.now()
        });
        
        console.log(`✅ Queued signup for ${serviceName}`);
        this.saveQueue();
    }
    
    // Check email for verification links
    checkForVerificationEmail(serviceName) {
        try {
            // List recent emails
            const output = execSync('himalaya envelope list --page-size 10', { encoding: 'utf8' });
            
            // Look for emails from service
            const lines = output.split('\n');
            for (const line of lines) {
                if (line.toLowerCase().includes(serviceName.toLowerCase()) || 
                    line.toLowerCase().includes('verif')) {
                    console.log(`📧 Found potential verification email for ${serviceName}`);
                    return true;
                }
            }
        } catch (err) {
            console.error('Error checking email:', err.message);
        }
        
        return false;
    }
    
    // Extract verification link from email
    extractVerificationLink(emailId) {
        try {
            const output = execSync(`himalaya message read ${emailId}`, { encoding: 'utf8' });
            
            // Look for common verification link patterns
            const urlRegex = /(https?:\/\/[^\s]+(?:verify|confirm|activate)[^\s]*)/gi;
            const matches = output.match(urlRegex);
            
            if (matches && matches.length > 0) {
                return matches[0];
            }
        } catch (err) {
            console.error('Error extracting link:', err.message);
        }
        
        return null;
    }
    
    // Click verification link (using curl)
    clickVerificationLink(url) {
        try {
            console.log(`🔗 Clicking verification link: ${url}`);
            execSync(`curl -L "${url}"`, { encoding: 'utf8' });
            console.log('✅ Verification link clicked');
            return true;
        } catch (err) {
            console.error('Error clicking link:', err.message);
            return false;
        }
    }
    
    // Save queue to disk
    saveQueue() {
        const queueFile = path.join(__dirname, 'signup-queue.json');
        fs.writeFileSync(queueFile, JSON.stringify(this.signupQueue, null, 2));
    }
    
    // Load queue from disk
    loadQueue() {
        const queueFile = path.join(__dirname, 'signup-queue.json');
        if (fs.existsSync(queueFile)) {
            this.signupQueue = JSON.parse(fs.readFileSync(queueFile, 'utf8'));
        }
    }
    
    // Monitor and process signups
    async monitor() {
        console.log('👀 Monitoring for verification emails...');
        
        for (const signup of this.signupQueue) {
            if (signup.status === 'verified') continue;
            
            if (this.checkForVerificationEmail(signup.service)) {
                console.log(`📬 Processing ${signup.service} verification...`);
                signup.status = 'verifying';
                this.saveQueue();
                
                // In a real implementation, we'd:
                // 1. Read the specific email
                // 2. Extract verification link
                // 3. Click it
                // 4. Mark as verified
            }
        }
    }
    
    // Start monitoring loop
    startMonitoring() {
        console.log('🚀 Starting email signup automator...\n');
        this.loadQueue();
        
        setInterval(() => {
            this.monitor();
        }, this.monitoringInterval);
        
        // Run once immediately
        this.monitor();
    }
}

// CLI
if (require.main === module) {
    const automator = new EmailSignupAutomator();
    
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
        case 'queue':
            const service = args[1];
            const url = args[2];
            if (!service || !url) {
                console.error('Usage: node email-signup-automator.js queue <service> <url>');
                process.exit(1);
            }
            automator.queueSignup(service, url);
            break;
            
        case 'monitor':
            automator.startMonitoring();
            break;
            
        default:
            console.log('Usage:');
            console.log('  node email-signup-automator.js queue <service> <url>');
            console.log('  node email-signup-automator.js monitor');
    }
}

module.exports = EmailSignupAutomator;
