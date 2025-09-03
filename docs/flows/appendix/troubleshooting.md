---
sidebar_position: 2
sidebar_label: Troubleshooting
---

# Troubleshooting Guide

Common issues and solutions for the Flows platform.

## Meter Communication Issues

### Meter Not Responding

**Symptoms:**
- No recent data in meter_shadows
- Commands timeout
- Health status shows "unhealthy"

**Diagnosis:**
```sql
-- Check last communication
SELECT 
    mr.serial,
    ms.health,
    ms.updated_at,
    ms.csq,
    EXTRACT(EPOCH FROM (NOW() - ms.updated_at))/60 as minutes_offline
FROM flows.meter_registry mr
JOIN flows.meter_shadows ms ON mr.id = ms.id
WHERE mr.serial = 'EML2137580826';

-- Check recent events
SELECT timestamp, event_type, details
FROM flows.meter_event_log
WHERE meter_id = '{{meter_id}}'
ORDER BY timestamp DESC
LIMIT 10;
```

**Solutions:**
1. Check network connectivity (CSQ > 10)
2. Restart mediator server
3. Verify meter IP address is correct
4. Check meter power supply
5. Review firewall rules

### Low Signal Quality

**Symptoms:**
- CSQ consistently below 10
- Intermittent communication
- Frequent timeouts

**Diagnosis:**
```sql
-- Signal quality history
SELECT 
    DATE_TRUNC('hour', timestamp) as hour,
    AVG(csq) as avg_csq,
    MIN(csq) as min_csq,
    MAX(csq) as max_csq
FROM flows.meter_csq
WHERE meter_id = '{{meter_id}}'
  AND timestamp > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;
```

**Solutions:**
1. Check antenna connection
2. Consider signal booster
3. Relocate meter if possible
4. Switch to wired connection
5. Contact network provider

## Data Collection Problems

### Missing Interval Data

**Symptoms:**
- Gaps in register_interval_hh
- Incomplete daily aggregates
- Billing calculation errors

**Diagnosis:**
```sql
-- Find missing intervals
WITH expected AS (
    SELECT generate_series(
        DATE_TRUNC('day', NOW() - INTERVAL '7 days'),
        DATE_TRUNC('day', NOW()),
        INTERVAL '30 minutes'
    ) as timestamp
),
actual AS (
    SELECT timestamp 
    FROM flows.register_interval_hh
    WHERE register_id = '{{register_id}}'
      AND timestamp > NOW() - INTERVAL '7 days'
)
SELECT e.timestamp as missing_timestamp
FROM expected e
LEFT JOIN actual a ON e.timestamp = a.timestamp
WHERE a.timestamp IS NULL
ORDER BY e.timestamp;
```

**Solutions:**
1. Trigger manual meter read
2. Check meter clock synchronization
3. Verify register configuration
4. Run data backfill job
5. Check for meter resets

### Abnormal Consumption Values

**Symptoms:**
- Sudden spikes in readings
- Negative consumption values
- Unrealistic usage patterns

**Diagnosis:**
```sql
-- Detect anomalies
WITH consumption AS (
    SELECT 
        timestamp,
        import_interval,
        LAG(import_interval) OVER (ORDER BY timestamp) as prev_interval,
        AVG(import_interval) OVER (ORDER BY timestamp 
            ROWS BETWEEN 48 PRECEDING AND CURRENT ROW) as avg_48
    FROM flows.register_import
    WHERE register_id = '{{register_id}}'
      AND timestamp > NOW() - INTERVAL '7 days'
)
SELECT 
    timestamp,
    import_interval,
    prev_interval,
    avg_48,
    CASE 
        WHEN import_interval > avg_48 * 3 THEN 'SPIKE'
        WHEN import_interval < 0 THEN 'NEGATIVE'
        ELSE 'OK'
    END as status
FROM consumption
WHERE import_interval > avg_48 * 3 
   OR import_interval < 0
ORDER BY timestamp DESC;
```

**Solutions:**
1. Check for meter tampering
2. Verify register direction settings
3. Look for power quality issues
4. Validate meter firmware version
5. Recalibrate meter if needed

## Tariff Update Issues

### Tariff Not Activating

**Symptoms:**
- Future tariff past activation date
- Active tariff not updated
- Billing using wrong rates

**Diagnosis:**
```sql
-- Check tariff status
SELECT 
    serial,
    active_unit_rate_a,
    future_unit_rate_a,
    future_activation_datetime,
    NOW() > future_activation_datetime as should_be_active
FROM flows.meter_shadows_tariffs
WHERE id = '{{meter_id}}';

-- Check meter clock
SELECT 
    mr.serial,
    ms.clock_time_diff_seconds,
    mr.daylight_savings_correction_enabled
FROM flows.meter_registry mr
JOIN flows.meter_shadows ms ON mr.id = ms.id
WHERE mr.id = '{{meter_id}}';
```

**Solutions:**
1. Sync meter clock
2. Re-send future tariff
3. Check DST settings
4. Manually trigger activation
5. Verify meter firmware supports tariff updates

### Tariff Sync Failures

**Symptoms:**
- Tariff push commands fail
- Inconsistent tariff data
- Meters reverting to default rates

**Diagnosis:**
```bash
# Check mediator logs
mediators logs EML2137580826 --lines 100

# Test tariff read
emop tariffs_active_read EML2137580826
emop tariffs_future_read EML2137580826
```

**Solutions:**
1. Check meter memory capacity
2. Verify tariff data format
3. Update meter firmware
4. Clear meter tariff memory
5. Use smaller tariff update batches

## Prepayment Issues

### Balance Not Updating

**Symptoms:**
- Token accepted but balance unchanged
- Balance stuck at specific value
- Emergency credit not activating

**Diagnosis:**
```sql
-- Balance history
SELECT 
    timestamp,
    balance,
    emergency_credit,
    balance - LAG(balance) OVER (ORDER BY timestamp) as change
FROM flows.meter_prepay_balance
WHERE meter_id = '{{meter_id}}'
  AND timestamp > NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC;

-- Check recent tokens
SELECT 
    timestamp,
    event_type,
    details->>'token' as token,
    details->>'amount' as amount
FROM flows.meter_event_log
WHERE meter_id = '{{meter_id}}'
  AND event_type LIKE '%token%'
  AND timestamp > NOW() - INTERVAL '7 days'
ORDER BY timestamp DESC;
```

**Solutions:**
1. Verify token generation algorithm
2. Check meter token counter
3. Clear meter token memory
4. Reset meter prepayment module
5. Manually adjust balance via API

### Emergency Credit Problems

**Symptoms:**
- Emergency credit not available
- Wrong emergency credit amount
- Auto-disconnect despite credit

**Diagnosis:**
```sql
-- Check emergency credit config
SELECT 
    serial,
    active_emergency_credit,
    active_ecredit_availability,
    balance,
    emergency_credit
FROM flows.meter_shadows_tariffs mst
JOIN flows.meter_shadows ms ON mst.id = ms.id
WHERE mst.id = '{{meter_id}}';
```

**Solutions:**
1. Verify tariff emergency credit settings
2. Check meter configuration flags
3. Review debt recovery settings
4. Update meter firmware
5. Manually override emergency credit

## Performance Issues

### Slow Queries

**Symptoms:**
- API timeouts
- Dashboard loading slowly
- Report generation failures

**Diagnosis:**
```sql
-- Check query performance
EXPLAIN ANALYZE
SELECT /* your slow query here */;

-- Find slow queries
SELECT 
    mean_exec_time,
    calls,
    query
FROM pg_stat_statements
WHERE mean_exec_time > 1000  -- queries over 1 second
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**Solutions:**
1. Add appropriate indexes
2. Use time bounds on queries
3. Leverage aggregation views
4. Increase connection pool size
5. Optimize query structure

### Database Storage Issues

**Symptoms:**
- Disk space warnings
- Compression not working
- Backup failures

**Diagnosis:**
```sql
-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'flows'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check compression status
SELECT * FROM timescaledb_information.hypertable_compression_stats;
```

**Solutions:**
1. Enable compression policies
2. Adjust retention policies
3. Archive old data
4. Add more storage
5. Optimize chunk sizes

## System Health Checks

### Daily Health Report

```sql
-- System overview
WITH meter_stats AS (
    SELECT 
        COUNT(*) as total_meters,
        COUNT(*) FILTER (WHERE health = 'healthy') as healthy_meters,
        COUNT(*) FILTER (WHERE updated_at > NOW() - INTERVAL '1 hour') as recently_updated
    FROM flows.meter_shadows
),
data_stats AS (
    SELECT 
        COUNT(*) as readings_today,
        COUNT(DISTINCT register_id) as active_registers
    FROM flows.register_import
    WHERE timestamp > CURRENT_DATE
),
alert_stats AS (
    SELECT 
        COUNT(*) FILTER (WHERE balance < 5) as low_balance_count,
        COUNT(*) FILTER (WHERE csq < 10) as low_signal_count
    FROM flows.meter_shadows
)
SELECT * FROM meter_stats, data_stats, alert_stats;
```

## Getting Help

### Support Channels

1. **Technical Support**: support@simtricity.com
2. **API Status**: https://status.simtricity.com
3. **Documentation**: https://docs.simtricity.com
4. **GitHub Issues**: https://github.com/simtricity/simt-emlite/issues

### Information to Provide

When reporting issues, include:
- Meter serial number
- Timestamp of issue
- Error messages
- Relevant log entries
- Steps to reproduce
- Expected vs actual behavior

### Emergency Procedures

For critical issues:
1. Check system status page
2. Review recent deployments
3. Contact on-call engineer
4. Escalate to management if needed