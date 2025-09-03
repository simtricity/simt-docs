---
sidebar_position: 1
sidebar_label: Schema Overview
---

# Flux Database Schema

The Flux platform uses TimescaleDB (PostgreSQL extension) for storing time-series telemetry data, market signals, and device configurations. The schema is optimized for high-frequency data ingestion and efficient aggregation queries.

## Schema Design Principles

- **Time-series optimization**: Hypertables for automatic partitioning
- **Unique constraints**: Prevent duplicate readings via (device_id, time)
- **Continuous aggregates**: Automatic roll-ups for performance
- **JSON flexibility**: Metadata fields for extensibility
- **UUID identifiers**: Globally unique IDs across systems

## Core Tables

### `mg_meter_readings`

Stores power and energy measurements from site meters.

```sql
CREATE TABLE flux.mg_meter_readings (
    "time" timestamp with time zone NOT NULL,
    device_id uuid NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    frequency real,
    voltage_line_average real,
    current_phase_a real,
    current_phase_b real,
    current_phase_c real,
    current_phase_average real,
    power_phase_a_active real,
    power_phase_b_active real,
    power_phase_c_active real,
    power_total_active real,
    power_total_reactive real,
    power_total_apparent real,
    power_factor_total real,
    energy_imported_active real,
    energy_exported_active real,
    energy_imported_phase_a_active real,
    energy_exported_phase_a_active real,
    energy_imported_phase_b_active real,
    energy_exported_phase_b_active real,
    energy_imported_phase_c_active real,
    energy_exported_phase_c_active real,
    energy_imported_reactive real,
    energy_exported_reactive real,
    energy_imported_apparent real,
    energy_exported_apparent real
);

-- Convert to hypertable for time-series optimization
SELECT create_hypertable('flux.mg_meter_readings', 'time');

-- Indexes
CREATE UNIQUE INDEX mg_meter_readings_deviceid_time_idx 
    ON flux.mg_meter_readings (device_id, "time");
CREATE INDEX mg_meter_readings_time_idx 
    ON flux.mg_meter_readings ("time" DESC);
```

**Key Fields:**
- `time`: Measurement timestamp (primary time dimension)
- `device_id`: Reference to meter in device registry
- `power_total_active`: Instantaneous power (positive = import)
- `energy_*_active`: Cumulative energy counters

### `mg_bess_readings`

Stores battery system telemetry and control state.

```sql
CREATE TABLE flux.mg_bess_readings (
    "time" timestamp with time zone NOT NULL,
    device_id uuid NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    soe real,
    target_power real,
    available_inverter_blocks smallint,
    command_source smallint
);

-- Convert to hypertable
SELECT create_hypertable('flux.mg_bess_readings', 'time');

-- Indexes
CREATE UNIQUE INDEX mg_bess_readings_deviceid_time_idx 
    ON flux.mg_bess_readings (device_id, "time");
CREATE INDEX mg_bess_readings_time_idx 
    ON flux.mg_bess_readings ("time" DESC);
```

**Key Fields:**
- `soe`: State of Energy (0-100%)
- `target_power`: Commanded power setpoint (kW)
- `command_source`: Active control mode
- `available_inverter_blocks`: Capacity units available

### `mg_device_registry`

Device metadata and configuration.

```sql
CREATE TABLE flux.mg_device_registry (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    site text NOT NULL,
    metadata jsonb,
    active boolean DEFAULT true
);

-- Index for lookups
CREATE INDEX mg_device_registry_site_idx ON flux.mg_device_registry (site);
CREATE INDEX mg_device_registry_type_idx ON flux.mg_device_registry (type);
```

### `market_data`

External market signals and prices.

```sql
CREATE TABLE flux.market_data (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "time" timestamp with time zone NOT NULL,
    type integer NOT NULL,
    value real NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- Convert to hypertable
SELECT create_hypertable('flux.market_data', 'time');

-- Index
CREATE INDEX market_data_time_idx ON flux.market_data ("time" DESC);
CREATE INDEX market_data_type_time_idx ON flux.market_data (type, "time" DESC);
```

### `market_data_types`

Market data categories.

```sql
CREATE TABLE flux.market_data_types (
    id integer PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text,
    unit text,
    created_at timestamp with time zone DEFAULT now()
);

-- Standard types
INSERT INTO flux.market_data_types (id, name, description, unit) VALUES
(1, 'niv_estimate', 'Net Imbalance Volume Estimate', 'MW'),
(2, 'wholesale_price', 'Wholesale Electricity Price', '£/MWh'),
(3, 'imbalance_price', 'System Imbalance Price', '£/MWh'),
(4, 'axle_dispatch', 'Axle Platform Dispatch Signal', 'kW');
```

## Aggregation Views

### 5-Minute Meter Aggregations

```sql
CREATE MATERIALIZED VIEW flux.mg_meter_readings_5m_intermediate
WITH (timescaledb.continuous) AS
SELECT 
    time_bucket('5 minutes', time) AS time_b,
    device_id,
    avg(frequency) AS frequency_avg,
    avg(voltage_line_average) AS voltage_line_average_avg,
    avg(current_phase_average) AS current_phase_average_avg,
    avg(power_total_active) AS power_total_active_avg,
    avg(power_total_reactive) AS power_total_reactive_avg,
    avg(power_factor_total) AS power_factor_total_avg,
    min(energy_imported_active) AS energy_imported_active_min,
    max(energy_imported_active) AS energy_imported_active_max,
    min(energy_exported_active) AS energy_exported_active_min,
    max(energy_exported_active) AS energy_exported_active_max,
    -- Counter aggregates for delta calculation
    counter_agg(time, energy_imported_active) AS energy_imported_active_counter_agg,
    counter_agg(time, energy_exported_active) AS energy_exported_active_counter_agg
FROM flux.mg_meter_readings
GROUP BY time_b, device_id;
```

### 30-Minute Settlement Periods

```sql
CREATE OR REPLACE FUNCTION flux.get_meter_readings_30m(
    start_time timestamptz DEFAULT now() - '24 hours'::interval,
    end_time timestamptz DEFAULT now(),
    device_ids uuid[] DEFAULT NULL
)
RETURNS TABLE (
    time_b timestamptz,
    device_id uuid,
    power_total_active_avg double precision,
    energy_imported_active_delta double precision,
    energy_exported_active_delta double precision,
    -- Additional fields...
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.time_b,
        t.device_id,
        t.power_total_active_avg,
        -- Calculate energy deltas using interpolation
        interpolated_delta(
            t.energy_imported_active_counter_agg, 
            t.time_b, 
            '30m',
            LAG(t.energy_imported_active_counter_agg) OVER w,
            LEAD(t.energy_imported_active_counter_agg) OVER w
        ) AS energy_imported_active_delta,
        interpolated_delta(
            t.energy_exported_active_counter_agg,
            t.time_b,
            '30m', 
            LAG(t.energy_exported_active_counter_agg) OVER w,
            LEAD(t.energy_exported_active_counter_agg) OVER w
        ) AS energy_exported_active_delta
    FROM flux.mg_meter_readings_30m_intermediate t
    WHERE t.time_b BETWEEN start_time AND end_time
        AND (device_ids IS NULL OR t.device_id = ANY(device_ids))
    WINDOW w AS (PARTITION BY t.device_id ORDER BY t.time_b);
END;
$$ LANGUAGE plpgsql;
```

## Indexes and Constraints

### Unique Constraints
Prevent duplicate readings:
```sql
-- Ensures only one reading per device per timestamp
CREATE UNIQUE INDEX mg_meter_readings_deviceid_time_idx 
    ON flux.mg_meter_readings (device_id, "time");
    
CREATE UNIQUE INDEX mg_bess_readings_deviceid_time_idx 
    ON flux.mg_bess_readings (device_id, "time");
```

### Performance Indexes
Optimize common queries:
```sql
-- Time-based queries (most recent first)
CREATE INDEX mg_meter_readings_time_idx 
    ON flux.mg_meter_readings ("time" DESC);
    
-- Device-specific queries
CREATE INDEX mg_meter_readings_device_time_idx 
    ON flux.mg_meter_readings (device_id, "time" DESC);
    
-- Market data by type
CREATE INDEX market_data_type_time_idx 
    ON flux.market_data (type, "time" DESC);
```

## Data Types

### Custom Types

```sql
-- Market data input type for bulk inserts
CREATE TYPE flux.market_data_input AS (
    "time" timestamp with time zone,
    type integer,
    value real
);
```

### JSON Metadata Fields

Used for extensible data storage:
```json
{
  "location": "WLCE",
  "firmware_version": "2.1.3",
  "modbus_address": 1,
  "polling_interval": 60,
  "max_power": 100
}
```

## Migration Management

Using Sqitch for version control:

```bash
# Check current schema version
sqitch status --target timescale-mgf

# Deploy new migrations
sqitch deploy --target timescale-mgf

# Rollback if needed
sqitch revert --target timescale-mgf
```

## Query Examples

### Recent BESS Readings
```sql
SELECT time, device_id, soe, target_power
FROM flux.mg_bess_readings
WHERE device_id = '123e4567-e89b-12d3-a456-426614174000'
  AND time > now() - interval '1 hour'
ORDER BY time DESC;
```

### Energy Consumption (30-min periods)
```sql
SELECT * FROM flux.get_meter_readings_30m(
    start_time => '2024-01-01',
    end_time => '2024-01-02',
    device_ids => ARRAY['device-uuid']::uuid[]
);
```

### Market Signal Correlation
```sql
SELECT 
    b.time,
    b.soe,
    b.target_power,
    m.value as niv_estimate
FROM flux.mg_bess_readings b
JOIN flux.market_data m 
    ON date_trunc('minute', b.time) = date_trunc('minute', m.time)
    AND m.type = 1  -- NIV estimate
WHERE b.time > now() - interval '1 day'
ORDER BY b.time;
```

## Performance Considerations

- **Hypertables**: Automatic partitioning by time
- **Compression**: 10x reduction after 7 days
- **Retention**: Automatic cleanup of old partitions
- **Continuous Aggregates**: Pre-computed roll-ups
- **Parallel Queries**: Leverage TimescaleDB parallelization

## Next Steps

- [API Reference](../api/) - Query the database via REST
- [Domain Model](../domain-model/) - Understand entity relationships
- [Operations Guide](../operations/) - Database maintenance