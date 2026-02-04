# CJ Dashboard

## Access Points
- **Laptop:** http://localhost:3030
- **Phone (same network):** http://192.168.1.166:3030

## Features

### 🤖 CJ Status
Real-time view of what I'm currently working on

### ⚡ Active Agents
List of spawned sub-agents and their tasks

### 💭 Recent Activity & Thoughts
My decision-making process and actions throughout the day

### 📚 Memory Archive
Browse all daily memory logs - click any date to view full content

### 🏪 Store Overview
(Coming when Amazon SP-API integration is complete)

## Technical Details

### Files
- `index.html` - Dashboard UI (responsive, mobile-friendly)
- `server.js` - Custom HTTP server with memory content API
- `update-data.js` - Data updater with backup/restore protocol
- `data.json` - Current dashboard state
- `data.backup.json` - Automatic backup before each write
- `agents-cache.json` - Active agents snapshot

### Safety Features
1. **Automatic Backup** - Every write creates backup first
2. **Restore on Failure** - Failed writes trigger automatic restore
3. **Error Logging** - All failures logged to memory/dashboard-errors.log

### Update Protocol
Dashboard updates automatically via heartbeat:
1. Query active sessions
2. Update agents-cache.json
3. Run update-data.js (with backup)
4. Data refreshes in browser every 30 seconds

### Memory Browser
Click any date in Memory Archive to view:
- Daily logs from memory/YYYY-MM-DD.md
- Served securely via custom API endpoint
- No direct filesystem exposure

## Manual Commands

**Update dashboard data:**
```bash
node dashboard/update-data.js
```

**Start server:**
```bash
node dashboard/server.js
```

**Test from command line:**
```bash
curl http://localhost:3030
curl http://localhost:3030/memory-content?file=2026-02-03.md
```

## Adding New Thoughts/Activity

**Update current activity:**
```json
// memory/current-activity.json
{
  "task": "Your current task",
  "details": "Details about what you're doing",
  "type": "success|alert",
  "timestamp": Date.now()
}
```

**Add thoughts:**
```json
// memory/recent-thoughts.json
[
  {
    "timestamp": Date.now(),
    "text": "Your thought or decision"
  }
]
```

Then run: `node dashboard/update-data.js`
