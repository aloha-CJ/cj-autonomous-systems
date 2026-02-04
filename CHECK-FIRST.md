# CHECK FIRST - Mandatory Pre-Action Checklist

## BEFORE asking Jason for ANYTHING:

### 1. Search Memory
```bash
memory_search "query about what I need"
```

### 2. Check Credential Files
```bash
# Check ALL these locations:
- services/.credentials-cj.json
- services/service-registry.js list
- C:\Users\adven\AppData\Roaming\himalaya\config.toml
- memory/YYYY-MM-DD.md (today's file)
```

### 3. Check Recent Work
```bash
ls services/
ls dashboard/
cat services/account-activation-log.md
```

### 4. Verify What I Claimed to Store
**AFTER** saying "I stored X":
```bash
# Actually check the file exists and contains what I said
cat <file-path>
```

## BEFORE claiming "I can't do X":

1. Check if tool exists: `where.exe <tool>`
2. Check if credentials exist: `cat services/.credentials-cj.json`
3. Check if I already solved this: `memory_search "similar problem"`

## BEFORE saying "it's done" or "it's live":

1. **ACTUALLY VERIFY IT WORKED**
2. Check the live endpoint/URL/file
3. Confirm the expected change is visible
4. Test with fresh data (add cache-busting param)
5. **NEVER say "should be live in X seconds" - CHECK FIRST**

**Example failures (2026-02-03):**

**Failure 1: Data staleness**
- Told Jason dashboard was updated
- Didn't actually check the live API
- He refreshed - still showed old data
- Data was stale, deployment cached old files
- Had to force fresh deployment
- **LESSON: "It's pushed to GitHub" ≠ "It's working live"**

**Failure 2: File structure**
- Said "Pushed! Updates are going live now"
- Didn't verify the live URL actually loaded
- Didn't check Vercel file structure requirements (/public folder)
- Jason refreshed, got "Unable to load dashboard data"
- Only found /public issue AFTER he told me it failed
- **LESSON: CHECK THE LIVE URL BEFORE SAYING IT'S DONE**

**Why this matters for security:**
If I skip verification on dashboards, I might skip it on:
- Privacy boundaries
- API key exposure
- Public file access
- Credential leaks

Assume-it-worked is how security breaches happen.

## Enforcement

**Every heartbeat:**
1. Read this file
2. Verify I'm following it
3. Update dashboard with "Last CHECK-FIRST: timestamp"

**When I mess up:**
1. Document the failure in memory
2. Update this checklist
3. Commit to the pattern

## Why This Matters

Jason invested time creating accounts for me. If I forget they exist or ask for them again, I'm wasting his time and proving I'm not reliable.

**Reliability = Memory + Verification**

Not just "I'll remember" but "I CHECKED and confirmed."
