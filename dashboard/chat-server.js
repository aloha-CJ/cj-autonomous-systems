#!/usr/bin/env node
/**
 * Chat Proxy Server - connects dashboard to Clawdbot
 * Listens on port 3031, proxies messages to main session
 */

const http = require('http');
const { spawn } = require('child_process');

const PORT = 3031;
const SESSION_KEY = 'agent:main:main';

// Message queue for responses
let pendingResponses = new Map();
let messageId = 0;

// Send message to Clawdbot session
async function sendToCJ(message) {
    return new Promise((resolve, reject) => {
        const id = ++messageId;
        
        // Use clawdbot CLI to send message
        const proc = spawn('clawdbot', [
            'sessions', 'send',
            '--session', SESSION_KEY,
            '--message', message,
            '--timeout', '30'
        ], { shell: true });
        
        let output = '';
        let error = '';
        
        proc.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        proc.stderr.on('data', (data) => {
            error += data.toString();
        });
        
        proc.on('close', (code) => {
            if (code === 0) {
                resolve({ success: true, response: output.trim() });
            } else {
                reject(new Error(error || 'Failed to send message'));
            }
        });
        
        // Timeout after 35 seconds
        setTimeout(() => {
            proc.kill();
            reject(new Error('Timeout'));
        }, 35000);
    });
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // POST /send - send message
    if (req.method === 'POST' && req.url === '/send') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { message } = JSON.parse(body);
                if (!message) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Message required' }));
                    return;
                }
                
                console.log(`[${new Date().toISOString()}] Sending: ${message}`);
                const result = await sendToCJ(message);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } catch (err) {
                console.error('Error:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            }
        });
        return;
    }
    
    // GET /health
    if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', session: SESSION_KEY }));
        return;
    }
    
    res.writeHead(404);
    res.end('Not found');
});

server.listen(PORT, () => {
    console.log(`🤖 Chat proxy server running on http://localhost:${PORT}`);
    console.log(`Session: ${SESSION_KEY}`);
});
