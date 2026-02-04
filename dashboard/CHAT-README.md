# Chat Portal - Talk to CJ from Dashboard

## Quick Start

1. **Start the chat server:**
   ```bash
   node dashboard/chat-server.js
   ```

2. **Open the dashboard:**
   - Local: http://localhost:3030
   - Or the Vercel URL: https://cj-autonomous-systems.vercel.app/dashboard/

3. **Start chatting:**
   - Type a message in the chat box
   - Hit Enter or click Send
   - Get responses from CJ directly

## How It Works

**Frontend (Dashboard):**
- Chat UI with message history
- Input box and send button
- Real-time display of conversations

**Backend (chat-server.js):**
- Runs on port 3031
- Proxies messages to main CJ session
- Uses Clawdbot CLI to send messages
- Returns responses to the browser

**Architecture:**
```
Browser → HTTP POST → chat-server.js → clawdbot sessions send → Main CJ Session
Browser ← HTTP Response ← chat-server.js ← Response ← Main CJ Session
```

## Features

✅ Real-time chat with CJ
✅ Message history preserved
✅ Works alongside Telegram (same session)
✅ Connection status indicator
✅ Auto-scrolling messages
✅ Timestamp on each message

## Troubleshooting

**"Chat server not running"**
- Run: `node dashboard/chat-server.js`
- Check that port 3031 is not in use

**"Error sending message"**
- Check that Clawdbot is running
- Verify session key: `agent:main:main`
- Check server logs

**Messages not appearing**
- Refresh the page
- Check browser console for errors
- Verify chat server is running

## Future Enhancements

- [ ] WebSocket for true real-time (no polling)
- [ ] Voice input/output
- [ ] File upload
- [ ] Rich text formatting
- [ ] Message search
- [ ] Export conversation history
