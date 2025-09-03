---
sidebar_position: 1
sidebar_label: Overview
---

# Getting Started

Welcome to Simtricity! This guide will help you get up and running with our energy management platform.!!!!

## Overview

Simtricity consists of several key components:

- **Flows** - Core billing and metering platform
- **Flux** - Real-time data processing 
- **MyEnergy** - Customer portal
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

- [Flows Installation Guide](/docs/getting-started/flows-installation)
- [API Authentication Setup](/docs/api-reference/authentication)
- [Your First API Call](/docs/getting-started/first-api-call)

## Support

For assistance, contact our support team or check the troubleshooting guides.