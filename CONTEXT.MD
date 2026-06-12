# CONTEXT.md

# QIE Ecosystem Context

This document provides ecosystem-level context for AI coding agents working on the QIE Reputation Dashboard project.

This file is intended to explain:

* what QIE is
* what QIE Pass is
* how the reputation system fits into the ecosystem
* assumptions that should guide development

This document is not a source of guaranteed protocol specifications.

Where official documentation exists, always defer to official QIE documentation.

---

# What is QIE?

QIE is a blockchain ecosystem focused on bringing together:

* digital identity
* real-world payments
* user onboarding
* credentials
* reputation
* ecosystem participation

The ecosystem emphasizes making blockchain usable for everyday users rather than only crypto-native users.

Core themes repeatedly associated with QIE include:

* identity-first onboarding
* portable user profiles
* payment infrastructure
* verified participation
* ecosystem growth

---

# What is QIE Pass?

QIE Pass should be viewed as the identity layer of the ecosystem.

Conceptually it serves a role similar to:

* Sign In With Ethereum
* Google Login
* Apple Login
* decentralized identity systems

QIE Pass provides users with a persistent ecosystem identity.

Potential responsibilities include:

* authentication
* profile ownership
* credential storage
* reputation anchoring
* ecosystem participation tracking

For this project:

QIE Pass is treated as the source of truth for user identity.

---

# Mental Model

Think of the ecosystem like this:

Identity Layer
↓
Activity Layer
↓
Reputation Layer
↓
Opportunity Layer

Where:

Identity Layer = QIE Pass

Activity Layer = contributions, transactions, events, projects

Reputation Layer = scores, badges, rankings

Opportunity Layer = jobs, grants, scholarships, governance, rewards

This project focuses primarily on the Reputation Layer.

---

# Why Reputation Matters

Most blockchain ecosystems measure wealth.

This project measures contribution.

A user who contributes significantly should be discoverable even if they do not hold large token balances.

Examples of contribution:

* building projects
* attending events
* helping community members
* publishing tutorials
* submitting bug reports
* participating in governance

The objective is to create a verifiable contribution profile.

---

# Reputation Philosophy

The system should reward:

* consistency
* contribution
* participation
* ecosystem impact

The system should not reward:

* spam
* artificial activity
* vanity metrics

Every reputation score should be explainable.

Every reputation point should be traceable.

---

# User Identity

Each user should be represented by a persistent profile.

Conceptual fields:

* userId
* walletAddress
* username
* avatar
* bio
* interests
* skills

Identity should remain portable.

The reputation belongs to the user, not the application.

---

# Types of Contributions

The ecosystem may eventually recognize multiple forms of value.

---

## Builder Contributions

Examples:

* applications built
* smart contracts deployed
* open-source contributions
* infrastructure tools

These should generally carry high reputation weight.

---

## Community Contributions

Examples:

* tutorials
* educational content
* documentation
* community support

These contributions help ecosystem growth.

---

## Governance Contributions

Examples:

* proposal creation
* voting participation
* governance discussions

These contributions strengthen decentralization.

---

## Event Contributions

Examples:

* hackathons
* workshops
* meetups
* ecosystem challenges

These contributions indicate engagement.

---

## Ecosystem Credentials

Examples:

* certifications
* badges
* achievement records

These may be issued by ecosystem organizations.

---

# Future Data Sources

The reputation system should be designed to ingest data from multiple sources.

Examples:

* QIE APIs
* blockchain indexers
* GitHub
* hackathon platforms
* event platforms
* community platforms

All sources should be abstracted behind adapters.

Do not tightly couple reputation logic to a single provider.

---

# AI Context

AI is a supporting layer.

AI does not determine truth.

AI interprets verified data.

Examples of acceptable AI functions:

* contribution summaries
* profile descriptions
* growth recommendations
* project classification
* ecosystem insights

Examples of unacceptable AI functions:

* assigning arbitrary reputation
* modifying verified records
* overriding reputation calculations

Verified data always takes precedence over AI-generated conclusions.

---

# Long-Term Vision

The reputation system should evolve into a public ecosystem primitive.

Future applications should be able to use reputation data for:

* hiring
* grants
* accelerators
* mentorship matching
* team formation
* governance weighting
* ecosystem rewards

The reputation layer should eventually become infrastructure for the wider QIE ecosystem.

---

# Example User Journey

1. User creates a QIE identity through QIE Pass.

2. User participates in ecosystem activities.

3. Activities generate contribution records.

4. Reputation engine calculates score.

5. Dashboard visualizes growth.

6. AI generates insights and recommendations.

7. External applications consume reputation data.

This creates a positive loop where ecosystem participation generates measurable reputation and reputation unlocks opportunities.

---

# Assumptions for MVP

The following assumptions are acceptable for the hackathon version:

* Some QIE APIs may not yet exist.
* Contribution data may be mocked.
* Reputation calculations may be simplified.
* Event participation may be manually recorded.
* Project submissions may be user-provided.

The MVP should prioritize demonstrating the reputation model and user experience.

Perfect protocol accuracy is less important than proving the concept.

---

# Success Criteria

A successful implementation should allow a user to:

* authenticate with QIE identity
* maintain a contribution profile
* earn reputation
* view growth over time
* showcase ecosystem involvement
* receive AI-generated insights

The result should feel like a professional reputation passport for the QIE ecosystem.
