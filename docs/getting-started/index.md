---
sidebar_position: 1
sidebar_label: Overview
---

# Getting Started

Welcome to Simtricity! This guide will help you get up and running with our energy management platform.

## Overview

Simtricity consists of several key components:

- **Flows** - Core billing and metering platform with CLI tools
- **Flux** - Realtime battery dispatch and optimisation
- **MyEnergy** - Customer portal

## Quick Start with Flows CLI

Get started quickly with the Flows command-line tools:

```bash
# Install the CLI tools
pip install simt-emlite

# Configure your environment
emop env_set prod

# List meters and their mediators
mediators list

# Check a meter's signal quality
emop csq EML2137580826

# Check prepayment balance
emop prepay_balance EML2137580826
```

For detailed CLI documentation, see [Flows CLI Tools](/docs/flows/cli/).
- **API** - RESTful API for all platform operations

## Prerequisites

Before you begin, ensure you have:

- PostgreSQL 14+ installed
- Node.js 18+ installed
- Docker (optional, for containerized deployment)
- API credentials (contact support)

## Quick Start

1. **Install Flows Database**
   ```bash
   psql -U postgres -f flows_schema.sql
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start Services**
   ```bash
   npm run start
   ```

## Next Steps

- [Flows Platform Documentation](/docs/flows)
- [Flows CLI Tools](/docs/flows/cli)
- [Installation Guide](/docs/flows/appendix/installation)

## Support

For assistance, contact our support team or check the troubleshooting guides.
