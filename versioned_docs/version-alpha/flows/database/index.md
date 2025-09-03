---
sidebar_position: 1
sidebar_label: Database Overview
---

# Flows Database

The Flows platform uses TimescaleDB (PostgreSQL extension) for efficient time-series data storage and querying.

## Schema Organization

The database is organized into the `flows` schema containing all meter and infrastructure tables:

```
flows.
├── meter_*         # Meter-related tables
├── register_*      # Consumption data
├── circuit_*       # Circuit definitions and data
├── service_head_*  # Electrical topology
├── properties      # Physical locations
├── sites_new       # Site groupings
└── escos          # Energy communities
```

## Key Technologies

### TimescaleDB
- **Hypertables** for time-series data partitioning
- **Continuous aggregates** for real-time materialized views
- **Compression** policies for historical data
- **Retention** policies for data lifecycle

### PostgREST
- Automatic REST API generation from schema
- Row-level security (RLS)
- JWT authentication
- OpenAPI documentation

## Table Categories

### Configuration Tables
Static or slowly changing data:
- `meter_registry` - Meter configurations
- `circuits` - Circuit definitions
- `properties` - Property information
- `escos` - Organization data

### State Tables
Current state snapshots:
- `meter_shadows` - Real-time meter state
- `meter_prepay_balance` - Current balances

### Time-Series Tables
High-frequency measurement data:
- `register_import` - Consumption readings
- `register_export` - Generation readings
- `register_interval_hh` - Half-hourly aggregates
- `meter_voltage` - Voltage measurements
- `meter_csq` - Signal quality

### Junction Tables
Many-to-many relationships:
- `circuit_register` - Circuit to register mapping
- `service_head_meter` - Service head to meter
- `properties_service_head` - Property connections

## Performance Optimizations

### Indexing Strategy
```sql
-- Time-series indexes
CREATE INDEX idx_register_import_time 
ON flows.register_import(timestamp DESC);

-- Foreign key indexes
CREATE INDEX idx_meter_shadows_id 
ON flows.meter_shadows(id);

-- Composite indexes for common queries
CREATE INDEX idx_register_import_composite 
ON flows.register_import(register_id, timestamp DESC);
```

### Partitioning
TimescaleDB automatically partitions by time:
```sql
-- Convert to hypertable
SELECT create_hypertable('flows.register_import', 'timestamp');

-- Set chunk interval to 1 day
SELECT set_chunk_time_interval('flows.register_import', INTERVAL '1 day');
```

### Compression
Historical data compression:
```sql
-- Add compression policy
ALTER TABLE flows.register_import 
SET (timescaledb.compress);

-- Compress data older than 7 days
SELECT add_compression_policy('flows.register_import', INTERVAL '7 days');
```

## Views and Aggregations

### Continuous Aggregates
Real-time materialized views:
```sql
CREATE MATERIALIZED VIEW flows.circuit_interval_daily
WITH (timescaledb.continuous) AS
SELECT 
    circuit_id,
    time_bucket('1 day', timestamp) AS day,
    SUM(import_kwh) as total_import_kwh,
    SUM(export_kwh) as total_export_kwh
FROM flows.register_interval_hh rih
JOIN flows.circuit_register cr ON rih.register_id = cr.register
GROUP BY circuit_id, day;
```

### Standard Views
Logical data representations:
- `meter_shadows_tariffs` - Denormalized tariff data
- `meters_low_balance` - Meters needing top-up
- `meters_offline_recently` - Connectivity monitoring

## Access Control

### Roles
- `tsdbadmin` - Full administrative access
- `flows` - Application read/write access
- `grafanareader` - Read-only for monitoring
- `public_backend` - API access

### Row-Level Security
```sql
-- Enable RLS
ALTER TABLE flows.meter_registry ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY meter_esco_isolation ON flows.meter_registry
FOR ALL
TO flows
USING (esco = current_setting('app.current_esco')::uuid);
```

## Backup and Recovery

### Backup Strategy
- **Continuous backups** via WAL archiving
- **Daily snapshots** of full database
- **Retention**: 30 days of point-in-time recovery

### Recovery Procedures
```bash
# Point-in-time recovery
pg_restore --dbname=flows --clean --create flows_backup.dump

# Specific table recovery
pg_restore --dbname=flows --table=meter_registry flows_backup.dump
```

## Monitoring

### Key Metrics
- Table sizes and growth rates
- Query performance (pg_stat_statements)
- Connection pool usage
- Replication lag

### Health Checks
```sql
-- Check chunk sizes
SELECT 
    hypertable_name,
    chunk_name,
    pg_size_pretty(total_bytes) as size
FROM timescaledb_information.chunks
WHERE hypertable_name = 'register_import'
ORDER BY total_bytes DESC
LIMIT 10;

-- Check compression status
SELECT 
    hypertable_name,
    uncompressed_total_bytes,
    compressed_total_bytes,
    compression_ratio
FROM timescaledb_information.hypertable_compression_stats;
```

## Maintenance Tasks

### Regular Operations
```sql
-- Update statistics
ANALYZE flows.register_import;

-- Reindex for performance
REINDEX TABLE flows.meter_shadows;

-- Vacuum to reclaim space
VACUUM ANALYZE flows.register_interval_hh;
```

### Data Retention
```sql
-- Add retention policy (keep 2 years)
SELECT add_retention_policy('flows.register_import', INTERVAL '2 years');

-- Manual data pruning
DELETE FROM flows.meter_event_log 
WHERE timestamp < NOW() - INTERVAL '90 days';
```

## Next Steps

- Schema Reference - *Documentation coming soon*
- Query Patterns - *Documentation coming soon*  
- Migration Guide - *Documentation coming soon*