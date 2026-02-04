# GitHub Personal Access Token Creation

## Problem
Need to authenticate gh CLI but it requires either:
1. Web browser flow (interactive)
2. Personal Access Token

## Solution Options

### Option A: Jason Creates Token
Fastest path:
1. Jason logs into https://github.com/aloha-CJ
2. Goes to Settings → Developer settings → Personal access tokens
3. Creates token with scopes: repo, read:org, gist, workflow
4. Gives me the token

### Option B: I Create Via API (Complex)
Would need to:
1. Authenticate with GitHub API using username/password
2. Handle 2FA if required
3. Create token programmatically

**Blocker:** GitHub deprecated password authentication for API in 2021

### Option C: SSH Key Method
```bash
gh auth login --git-protocol ssh --skip-ssh-key
```
This might allow authentication without token, but still needs interactive web flow.

## Recommendation
**Ask Jason to create a Personal Access Token**

Steps for Jason:
1. Go to https://github.com/settings/tokens/new (while logged in as aloha-CJ)
2. Name: "CJ CLI Access"
3. Scopes: `repo`, `read:org`, `gist`, `workflow`
4. Generate token
5. Give me the token string

Then I can:
```bash
echo "TOKEN_HERE" | gh auth login --with-token
```

## Alternative: GitHub App
Could also create a GitHub App for more granular permissions, but PAT is simpler for now.
