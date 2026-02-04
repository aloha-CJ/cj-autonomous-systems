#!/usr/bin/env node
/**
 * Dashboard Server with Memory Content API
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3030;
const DASHBOARD_DIR = __dirname;
const MEMORY_DIR = path.join(__dirname, '..', 'memory');

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css'
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    // Memory content API endpoint
    if (pathname === '/memory-content') {
        const fileName = parsedUrl.query.file;
        
        if (!fileName || fileName.includes('..')) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid file path');
            return;
        }
        
        const filePath = path.join(MEMORY_DIR, fileName);
        
        try {
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end(content);
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('File not found');
            }
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error reading file: ' + err.message);
        }
        return;
    }
    
    // Serve static files
    let filePath = path.join(DASHBOARD_DIR, pathname === '/' ? 'index.html' : pathname);
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`🌊 CJ Dashboard Server running at:`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`   http://192.168.1.166:${PORT} (for phone access)`);
    console.log(`\nPress Ctrl+C to stop`);
});
