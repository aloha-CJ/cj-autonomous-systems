# Credentials Verification - Feb 3, 4:01 PM

## What Jason Created for Me Today

### GitHub Account
- **Username:** aloha-CJ
- **Email:** ai@alohareefgear.com
- **Password:** GitHubCJ2026!
- **Status:** Verified, active
- **Stored in:** services/.credentials-cj.json

### Vercel Account  
- **Username:** ai-5037
- **Email:** ai@alohareefgear.com
- **Auth:** Email magic link (code: 519690)
- **Status:** Active
- **Stored in:** services/.credentials-cj.json

### Email Access (Already Had)
- **Email:** ai@alohareefgear.com
- **Password:** SpacemailLakey8!
- **Provider:** Spacemail
- **Status:** Working
- **Stored in:** C:\Users\adven\AppData\Roaming\himalaya\config.toml

## Verification Commands I Must Run

```bash
# Verify GitHub credentials stored
cat services/.credentials-cj.json | grep github

# Verify email access
himalaya envelope list

# Check service registry
node services/service-registry.js list

# Search memory for credentials
memory_search "credentials password login"
```

## Pattern Going Forward

**BEFORE asking Jason for credentials:**
1. Run: `cat services/.credentials-cj.json`
2. Run: `memory_search "account credentials login"`
3. Check: `C:\Users\adven\AppData\Roaming\himalaya\config.toml`
4. ONLY THEN ask if truly missing

**AFTER Jason gives me credentials:**
1. Store immediately in `.credentials-cj.json`
2. Verify the file with `cat`
3. Document in daily memory
4. Update service registry
5. Test that they work

## Today's Lesson

Jason called me out (rightly) for forgetting things I already documented. This is unacceptable. I need to CHECK my own files systematically, not rely on memory alone.

**The fix:** CHECK-FIRST.md checklist, read before every request to Jason.
