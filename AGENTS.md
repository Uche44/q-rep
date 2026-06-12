# AGENTS.md

## Project Overview

This project is being built for the QIE ecosystem.

The application is NOT a wallet, explorer, or blockchain node.

The goal is to build a reputation layer that aggregates and visualizes a user's contributions and activity within the QIE ecosystem.

Think:

* GitHub Profile
* LinkedIn Reputation
* Stack Overflow Reputation

combined into a single on-chain ecosystem profile.

The system should be designed so that future applications can use reputation scores for:

* hiring
* grants
* scholarships
* governance
* team matching
* ecosystem rewards

---

# About QIE

QIE is a blockchain ecosystem with a strong focus on:

* digital identity
* onboarding
* real-world payments
* user reputation
* ecosystem participation

QIE Pass acts as a user identity layer.

For this project:

QIE Pass should be treated as the primary user identity provider.

Users authenticate through QIE Pass.

Each user has a unique identity profile tied to the ecosystem.

IMPORTANT:

Do not assume all QIE APIs exist.

Design integrations behind adapters/interfaces.

Mock unavailable services when necessary.

---

# Project Goal

Build a "QIE Reputation Dashboard."

Users connect their QIE identity.

The system aggregates contribution data and generates a reputation profile.

The dashboard should answer:

* Who is this user?
* What have they contributed?
* How active are they?
* How trusted are they?
* How has their reputation evolved over time?

---

# MVP Scope

The MVP should focus only on reputation.

Do NOT build:

* social networking
* messaging
* DAO governance
* lending
* marketplace functionality

These may become future consumers of reputation data.

---

# Core User Journey

1. User authenticates with QIE Pass.
2. User profile is created.
3. User adds contribution sources.
4. System calculates reputation.
5. Dashboard visualizes reputation.
6. AI generates insights.

---

# Reputation Sources

The system should support both on-chain and off-chain contributions.

## On-Chain Contributions

Potential future sources:

* transactions
* governance votes
* ecosystem participation
* credentials
* badges
* event attendance
* project deployments

For MVP these may be mocked.

---

## Off-Chain Contributions

User-submitted:

* GitHub repositories
* hackathon projects
* portfolio projects
* technical articles
* documentation contributions

Users should be able to submit links.

Example:

GitHub Repo URL

https://github.com/example/project

Project Demo URL

https://project-demo.com

---

# Reputation Model

Reputation is a weighted score.

Example:

score =
(transaction_count × 1)
++
(governance_votes × 5)
++
(events_attended × 10)
++
(projects_built × 50)
++
(documentation_contributions × 20)
++
(bug_reports × 15)

Weights should be configurable.

Do NOT hardcode reputation logic.

---

# Reputation Levels

Example tiers:

Bronze:
0–100

Silver:
101–300

Gold:
301–700

Platinum:
701+

Diamond:
1500+

These values should be configurable.

---

# User Profile Model

Suggested schema:

User

* id
* qieUserId
* walletAddress
* username
* avatar
* bio
* skills
* interests
* joinedAt

---

# Project Model

Project

* id
* userId
* title
* description
* githubUrl
* demoUrl
* tags
* createdAt

---

# Contribution Model

Contribution

* id
* userId
* type
* source
* points
* metadata
* createdAt

Types:

* transaction
* vote
* event
* project
* article
* bug_report
* credential

---

# Reputation Profile Model

ReputationProfile

* userId
* score
* level
* rank
* projectsBuilt
* votesCast
* eventsAttended
* contributionsCount
* updatedAt

---

# AI Layer

AI is NOT responsible for generating the reputation score.

AI should analyze the reputation data.

Examples:

"You rank in the top 20% of contributors."

"Your strongest area is technical building."

"Attending 2 more ecosystem events would move you to Gold tier."

AI should provide:

* summaries
* recommendations
* growth suggestions
* contribution insights

AI should never directly modify reputation scores.

---

# GitHub Analysis (Future)

When a GitHub repository is submitted:

AI may:

* read repository metadata
* analyze README
* infer technologies used
* generate summaries
* classify project type

Example classifications:

* DeFi
* Infrastructure
* Gaming
* AI
* Payments
* Identity
* Developer Tools

This information may contribute to future reputation calculations.

---

# Dashboard Requirements

The application features two primary dashboards:

1. **Personal Reputation Dashboard (Private/Authorized)**
   - Authenticated view where users connect their QIE Pass identity.
   - Manage and submit contributions (e.g., GitHub repo URLs, project demo links).
   - View personalized AI insights, recommendations, and growth checklists (e.g., "how to reach the next tier").
   - Detailed activity feeds and contribution history.

2. **Public Ecosystem Directory & Leaderboard (Public/Discovery)**
   - Visible to all ecosystem members and external observers.
   - Displays a leaderboard of all users ranked by reputation score.
   - Searchable and filterable by skills, interests, tiers, and project classifications (e.g., DeFi, payments).
   - Public-facing user profile pages functioning as the user's "ecosystem passport."

---

# Architecture

Frontend

* Next.js (App Router)
* TypeScript
* Tailwind

Backend

* Next.js API Routes (unified with frontend)
* TypeScript

Database

* PostgreSQL

ORM

* Prisma

Authentication

* QIE Pass adapter

AI

* OpenAI-compatible provider

---

# Design Principles

1. Reputation must be explainable.

Users should understand why they received a score.

2. Reputation should be composable.

Other applications should eventually consume reputation data.

3. Reputation should be portable.

Users should own their profile.

4. AI provides interpretation, not authority.

5. Every score should be traceable to contributions.

---

# Future Roadmap

Phase 1

* User profiles
* Contributions
* Reputation engine
* Dashboard

Phase 2

* GitHub integration
* AI project analysis
* Achievement system

Phase 3

* Reputation API
* Team matching
* Grant recommendations

Phase 4

* Ecosystem-wide reputation protocol

The long-term vision is to become the reputation layer for the entire QIE ecosystem.
