# RESEARCH.md

# QIE Ecosystem Research & Developer Resources

Last Updated: June 2026

This document contains developer resources, documentation links, infrastructure endpoints, SDK references, APIs, and ecosystem services relevant to building on QIE.

IMPORTANT:

* Treat all external services as potentially evolving.
* Verify endpoints before production deployment.
* Wrap integrations behind adapters.
* Never hardcode protocol assumptions.

---

# Core Documentation

Primary Documentation

https://docs.qie.digital

Overview of QIE blockchain, validator system, staking, governance, architecture, and developer onboarding.

---

# Main Website

https://www.qie.digital

Official ecosystem website.

---

# Whitepaper

https://www.qie.digital/QIE-Blockchain-Whitepaper.pdf

Protocol design and ecosystem vision.

---

# Explorer

Mainnet Explorer

https://mainnet.qie.digital

Testnet Explorer

https://testnet.qie.digital

Useful for:

* transaction lookups
* address lookups
* validator information
* contract verification
* governance inspection

---

# Explorer API

API Documentation

https://mainnet.qie.digital/api-docs

Potential source for:

* address activity
* transaction history
* token transfers
* contract data

Investigate available endpoints before implementation.

---

# Network Configuration

## Mainnet

Name:
QIE Mainnet

Chain ID:
1990

Currency:
QIEV3

RPC Endpoints:

https://rpc1mainnet.qie.digital/

https://rpc2mainnet.qie.digital/

https://rpc3mainnet.qie.digital/

https://rpc4mainnet.qie.digital/

https://rpc5mainnet.qie.digital/

Explorer:

https://mainnet.qie.digital

---

## Testnet

Name:
QIE Testnet

Chain ID:
1983

Currency:
QIE

RPC Endpoints:

https://rpc1testnet.qie.digital/

https://rpc2testnet.qie.digital/

https://rpc3testnet.qie.digital/

https://rpc4testnet.qie.digital/

https://rpc5testnet.qie.digital/

https://rpc6testnet.qie.digital/

Explorer:

https://testnet.qie.digital

Faucet:

https://www.qie.digital/faucet

---

# Blockchain Architecture

QIE V3 characteristics:

* Layer 1 blockchain
* EVM compatible
* Cosmos ecosystem integration
* Delegated Proof of Stake
* Governance support
* Validator staking
* Delegator rewards
* Near-zero fees
* Fast finality

This means Ethereum tooling should work with minimal changes.

Examples:

* ethers.js
* viem
* wagmi
* hardhat
* foundry

should be evaluated first before building custom integrations.

---

# Identity Infrastructure

## QIE Pass

Primary identity layer.

Website:

https://qiepass.qie.digital

Purpose:

* reusable identity
* ecosystem onboarding
* authentication
* credentials
* KYC-based identity

Current status:

Documentation and developer APIs should be researched further.

Create an adapter layer:

QiePassProvider

Do not tightly couple application logic directly to QIE Pass.

---

# Wallet Infrastructure

QIE Wallet

https://www.qiewallet.me

Potential integration target.

---

# Stablecoin Infrastructure

QUSDC

Website:

https://www.stable.qie.digital

Documentation:

https://docs.stable.qie.digital

Potential use cases:

* grants
* rewards
* bounty payouts
* contribution incentives

---

# DEX Infrastructure

QIEDEX

https://www.dex.qie.digital

Potential future integrations:

* liquidity participation
* reputation based incentives
* trading analytics

---

# Lending Infrastructure

QIELend

https://www.qielend.qie.digital

Potential future integrations:

* reputation-backed lending
* trust scoring

---

# Oracle Infrastructure

Free Oracle Service

https://www.oracles.qie.digital

Potential future use:

* external data feeds
* reputation enrichment
* AI-driven analytics

---

# Bridge Infrastructure

Cross-Chain Bridge

https://www.bridge.qie.digital

Potential future use:

* multichain reputation
* cross-chain identity

---

# Developer Portal

Developer Resources

https://www.qie.digital/developer

Monitor for:

* SDK releases
* grants
* tooling
* hackathons

---

# GitHub

Official Repository

https://github.com/qieadmin/qiev3-mainnet

Investigate:

* node implementation
* RPC compatibility
* contract examples
* SDK references

---

# Governance Research

Relevant Topics

* validators
* delegators
* voting
* proposals
* slashing
* rewards

Documentation:

https://docs.qie.digital

Potential reputation signals:

* votes cast
* proposals submitted
* validator participation
* delegation activity

---

# Reputation Dashboard Integration Opportunities

The following data sources could eventually contribute to reputation:

## Wallet Activity

Source:

Explorer API
RPC endpoints

Examples:

* transaction count
* active days
* contract interactions

---

## Governance Activity

Potential metrics:

* proposals created
* votes cast
* delegation participation

---

## Ecosystem Contributions

Potential metrics:

* deployed contracts
* published projects
* hackathon participation
* ecosystem badges

---

## Identity Credentials

Potential source:

QIE Pass

Examples:

* verified identity
* completed onboarding
* earned credentials

---

# Ethereum-Compatible Tooling

Preferred Stack

Frontend

* Next.js
* TypeScript
* wagmi
* viem

Backend

* Node.js
* TypeScript

Blockchain Access

* ethers.js
* viem

Contracts

* Solidity

Development

* Hardhat
* Foundry

Reason:

QIE is EVM compatible.

Avoid building custom blockchain tooling unless necessary.

---

# AI Integration Opportunities

Future AI features:

* contribution summaries
* reputation insights
* project classification
* GitHub analysis
* career recommendations
* ecosystem opportunity matching

AI should consume reputation data.

AI should not be the source of truth.

---

# Open Questions

The agent should research and document answers for:

1. Is there an official QIE Pass SDK?

2. Is there a QIE Pass OAuth flow?

3. Is there a QIE Pass JWT/session model?

4. Is there a public QIE identity API?

5. Is there an official JavaScript SDK?

6. Is there an official TypeScript SDK?

7. How are ecosystem credentials stored?

8. How can governance activity be queried?

9. Is there a public event participation API?

10. Are contribution badges already available?

Document findings here as development progresses.
