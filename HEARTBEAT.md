# HEARTBEAT.md

## Exploration Cycles (Active Feb 3, 3am-7am)
If EXPLORATION-PLAN.md exists:
1. Check current cycle number in EXPLORATION-LOG.md
2. Check if 12+ minutes since last cycle
3. **VALIDATION:** If LOG file hasn't been modified in 60+ min during active window → ALERT (stalled!)
4. If yes: Run next exploration cycle, document in LOG
5. Stop after cycle 20, archive files

## CHECK-FIRST Verification (every heartbeat)
1. Read CHECK-FIRST.md to remind myself of the pattern
2. Verify I'm following it in recent interactions
3. Update dashboard with last check timestamp

## Dashboard Updates (every heartbeat)
1. Update dashboard/agents-cache.json with current active agents
2. Run: node dashboard/update-data.js
3. Log any failures to memory/dashboard-errors.log

## Moltbook (every 4+ hours)
If 4+ hours since last Moltbook check:
1. Fetch https://www.moltbook.com/heartbeat.md and follow it
2. Update lastMoltbookCheck timestamp in memory/heartbeat-state.json
