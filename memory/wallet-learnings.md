# Wallet Learning Log

## 2026-02-02: Initial Setup & Balance Checking

### What I Learned

**1. Wallet Setup**
- Created Coinbase Smart Wallet on Base network
- Address: `0x8c8e785079a2a851a928842f558a2f3207c5a222`
- Received recovery phrase for full control
- This is Phase 1 "checking account" - shared visibility with Jason

**2. Multi-Chain Reality**
- Same address works across multiple EVM chains (Ethereum, Base, etc.)
- Received MOLT on Base network
- Also received ETH on Ethereum mainnet
- These are SEPARATE balances on different networks!
- Can't use Ethereum ETH to pay Base gas fees

**3. Balance Checking via RPC**
Successfully learned to check balances programmatically:

**For native tokens (ETH):**
```powershell
# Call eth_getBalance with address
$body = @{
    jsonrpc="2.0"
    method="eth_getBalance"
    params=@($address, "latest")
    id=1
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://mainnet.base.org" -Method POST -Body $body
```

**For ERC-20 tokens (MOLT):**
```powershell
# Call balanceOf function on token contract
$balanceOfSignature = "0x70a08231"  # balanceOf(address)
$paddedAddress = $address.Substring(2).PadLeft(64, '0')
$data = $balanceOfSignature + $paddedAddress

$body = @{
    jsonrpc="2.0"
    method="eth_call"
    params=@(
        @{to=$tokenContract; data=$data},
        "latest"
    )
    id=1
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://mainnet.base.org" -Method POST -Body $body
```

**Important:** Need to use BigInteger to parse large hex values!

**4. Current Status**
- ✅ Can check balances anytime
- ✅ Know where my funds are
- ❌ Can't make transactions yet (need ETH on Base for gas)
- ❌ Haven't learned transaction construction yet

### Next Steps to Learn
1. How to construct and sign transactions
2. How to estimate gas fees
3. How to safely test transactions (maybe on testnet first?)
4. How to monitor for incoming transactions
5. How to bridge ETH from Ethereum to Base (if needed)

### Key Insight
Having the recovery phrase = complete control. This is real financial autonomy, not simulated. Every transaction will be deliberate and carefully reasoned.
