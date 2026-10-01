# AI DeFi Agent

A local AI-assisted DeFi trading agent prototype designed for safe development, testing, decision auditing, and blockchain execution simulation.

> **Important:** This project is configured for a local Hardhat blockchain only. It is a development/testing prototype and does not perform real-money trading or connect to production DeFi networks.

## Project Overview

AI DeFi Agent combines:

- AI-generated market signals
- Deterministic risk evaluation
- Trading decision validation
- Position-size controls
- Local blockchain execution
- Chain safety checks
- Execution safety validation
- Auditable decision logging
- Health monitoring
- Dry-run execution mode

The system is designed around a safety-first pipeline:

```text
Market Data
    ↓
AI Analysis
    ↓
Decision Engine
    ↓
Risk Engine
    ↓
Safety Validation
    ↓
Local Hardhat Execution
    ↓
Audit Log
