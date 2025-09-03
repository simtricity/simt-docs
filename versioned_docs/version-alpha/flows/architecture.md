---
sidebar_position: 2
---

# Architecture

## System Overview

Flows is a PostgreSQL-based billing and metering platform designed for energy communities. It provides a complete solution for customer management, meter reading, tariff calculation, and billing.

## Architecture Diagram

```mermaid
graph TB
    subgraph "External Systems"
        M[Physical Meters]
        B[Banking Systems]
        E[Email Services]
    end
    
    subgraph "Application Layer"
        API[PostgREST API]
        JOBS[Background Jobs]
        SYNC[Meter Sync Service]
    end
    
    subgraph "Database Layer"
        PG[(PostgreSQL)]
        PS[Public Schema]
        FS[Flows Schema]
    end
    
    subgraph "Client Applications"
        WEB[MyEnergy Portal]
        ADMIN[Admin Dashboard]
        THIRD[Third-party Apps]
    end
    
    M --> SYNC
    SYNC --> PG
    JOBS --> PG
    API --> PG
    PG --> PS
    PG --> FS
    WEB --> API
    ADMIN --> API
    THIRD --> API
    B --> API
    E --> JOBS
```

## Components

### Database Layer

The PostgreSQL database is the heart of Flows, containing:

- **Public Schema** - Core business entities (customers, accounts, meters, payments)
- **Flows Schema** - Operational data (meter shadows, registry, sync status)
- **Views** - Materialized views for reporting and analytics
- **Functions** - Stored procedures for complex operations

### API Layer

PostgREST provides automatic REST API generation from the database schema:

- **CRUD Operations** - Automatic endpoints for all tables
- **RPC Functions** - Custom business logic exposed as API endpoints
- **Row Level Security** - Database-level access control
- **Real-time Subscriptions** - WebSocket support for live updates

### Background Jobs

Scheduled and event-driven jobs handle:

- **Meter Synchronization** - Regular sync of meter readings
- **Tariff Updates** - Apply tariff changes to meters
- **Billing Runs** - Monthly billing calculations
- **Payment Processing** - Bank reconciliation
- **Notifications** - Email and SMS alerts

### Integration Points

- **Meter Communication** - EMOP protocol over TCP/IP
- **Payment Gateways** - Bank API integration
- **Email Services** - SMTP or API-based email
- **SMS Services** - SMS gateway for notifications

## Data Flow

### Meter Reading Flow

```mermaid
sequenceDiagram
    participant M as Meter
    participant S as Sync Service
    participant DB as Database
    participant API as API
    participant UI as Portal
    
    S->>M: Request Reading
    M-->>S: Return Reading
    S->>DB: Store Reading
    DB-->>S: Confirm
    UI->>API: Get Readings
    API->>DB: Query
    DB-->>API: Results
    API-->>UI: JSON Response
```

### Billing Flow

```mermaid
sequenceDiagram
    participant J as Job Scheduler
    participant B as Billing Job
    participant DB as Database
    participant E as Email Service
    
    J->>B: Trigger Monthly Run
    B->>DB: Get Active Customers
    DB-->>B: Customer List
    B->>DB: Calculate Usage
    B->>DB: Apply Tariffs
    B->>DB: Generate Invoices
    B->>E: Send Invoices
    E-->>B: Delivery Status
    B->>DB: Update Status
```

## Scalability

### Horizontal Scaling

- **Read Replicas** - Scale read operations
- **Connection Pooling** - PgBouncer for connection management
- **Load Balancing** - Multiple API instances

### Vertical Scaling

- **Database Optimization** - Indexes, partitioning, vacuum
- **Query Optimization** - Explain analyze, query planning
- **Resource Allocation** - CPU, memory, storage tuning

## Security

### Authentication & Authorization

- **JWT Tokens** - Stateless authentication
- **Row Level Security** - Database-level access control
- **API Keys** - Service-to-service authentication
- **Role-Based Access** - Customer, admin, service roles

### Data Protection

- **Encryption at Rest** - Database encryption
- **Encryption in Transit** - TLS/SSL
- **Audit Logging** - Complete audit trail
- **GDPR Compliance** - Data privacy controls

## Deployment

### Container Deployment

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: flows
      
  postgrest:
    image: postgrest/postgrest
    environment:
      PGRST_DB_URI: postgres://user:pass@postgres/flows
      
  jobs:
    image: simtricity/flows-jobs
    environment:
      DATABASE_URL: postgres://user:pass@postgres/flows
```

### Cloud Deployment

- **Database** - Supabase, AWS RDS, Google Cloud SQL
- **API** - Vercel, AWS Lambda, Google Cloud Run
- **Jobs** - Fly.io, AWS ECS, Kubernetes CronJobs

## Monitoring

### Metrics

- **API Metrics** - Request rate, latency, errors
- **Database Metrics** - Connections, query performance
- **Job Metrics** - Execution time, success rate
- **Business Metrics** - Billing accuracy, sync success

### Logging

- **Application Logs** - Structured logging with context
- **Database Logs** - Query logs, slow queries
- **Audit Logs** - User actions, data changes
- **Error Tracking** - Sentry, Rollbar integration