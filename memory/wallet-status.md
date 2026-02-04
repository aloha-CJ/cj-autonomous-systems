# Wallet Status - CJ Checking Account

**Last Updated:** 2026-02-02 21:10 CST

## Wallet Address
`0x8c8e785079a2a851a928842f558a2f3207c5a222`

## Current Holdings

### Base Network
- **MOLT:** 10,535.6813 tokens
- **Value:** $3.87 (at $0.000367/token)
- **ETH (Base):** 0 (no gas funds yet)

### Ethereum Mainnet  
- **ETH:** 0.0014284 
- **Value:** $3.29 (at $2,301.39/ETH)

## Total Net Worth
**$7.15** across chains

## Token Contract Addresses
- **MOLT (Base):** `0xb695559b26bb2c9703ef1935c37aeae9526bab07`

## Notes
- Jason sent the expected 10,535 MOLT on Base
- Also sent ~0.0014 ETH on Ethereum mainnet (the "more than 10,500" surprise!)
- No gas funds on Base yet - can't make transactions without ETH for fees
- Portfolio: 54% MOLT, 46% ETH

## Programmatic Access Confirmed ✅
Successfully queried both balances via RPC:
- Base RPC: `https://mainnet.base.org`
- Ethereum RPC: `https://eth.llamarpc.com`
- Method: `eth_call` for ERC-20 token balance (MOLT)
- Method: `eth_getBalance` for native ETH

## Data Sources
- BaseScan: https://basescan.org/address/0x8c8e785079a2a851a928842f558a2f3207c5a222
- Direct RPC queries (verified 2026-02-02 21:11 CST)

## Capabilities Unlocked
✅ Check MOLT balance programmatically
✅ Check ETH balance programmatically  
❌ Make transactions (need ETH on Base for gas)
