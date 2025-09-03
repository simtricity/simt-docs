---
sidebar_position: 1
sidebar_label: Operations Guide
---

# Flux Operations Guide

Day-to-day operational procedures for managing Flux deployments.

## Gap Recovery

### Identify Missing Data

```sql
-- Check for gaps in telemetry
WITH time_series AS (
  SELECT generate_series(
    '2024-01-01 00:00:00'::timestamptz,
    '2024-01-01 23:59:00'::timestamptz,
    '1 minute'::interval
  ) AS expected_time
)
SELECT 
  ts.expected_time,
  r.time IS NULL as is_missing
FROM time_series ts
LEFT JOIN flux.mg_bess_readings r 
  ON date_trunc('minute', r.time) = ts.expected_time
  AND r.device_id = 'your-device-id'
WHERE r.time IS NULL
ORDER BY ts.expected_time;
```

### Run Gap Recovery Script

```python
# gap_recovery.py
python scripts/gap_recovery.py \
  --source prod \
  --target mgf \
  --start "2024-01-01 12:00:00" \
  --end "2024-01-01 18:00:00" \
  --site WLCE
```

## Site Management

### Add New Device

1. **Update Device Registry**:
```sql
INSERT INTO flux.mg_device_registry (id, name, type, site, metadata)
VALUES (
  gen_random_uuid(),
  'WLCE-BESS-02',
  'bess',
  'WLCE',
  '{"modbus_address": 2, "max_power": 100}'::jsonb
);
```

2. **Update Site Config**:
```yaml
devices:
  bess:
    - id: "new-device-uuid"
      name: "WLCE-BESS-02"
      modbus:
        address: 2
```

3. **Deploy and Restart**:
```bash
scp config.yaml pi@site-ip:~/bess_controller/
ssh pi@site-ip "sudo systemctl restart bess_controller"
```

### Remove Device

1. Mark as inactive in registry
2. Remove from config
3. Archive historical data if needed

## Performance Tuning

### Optimize Polling Interval

```yaml
# Reduce for more responsive control
controller:
  poll_interval: 30s  # Default is 60s
```

### Batch Upload Size

```yaml
# Increase for better throughput
data_platform:
  upload:
    batch_size: 200  # Default is 100
```

### Aggregation Settings

```sql
-- Refresh continuous aggregates more frequently
ALTER MATERIALIZED VIEW flux.mg_meter_readings_5m_intermediate
  SET (timescaledb.refresh_interval = '5 minutes');
```

## Monitoring

### Health Checks

```bash
#!/bin/bash
# health_check.sh

# Check service status
if ! systemctl is-active --quiet bess_controller; then
  echo "ERROR: Service not running"
  exit 1
fi

# Check recent telemetry
RECENT=$(psql -h db.host -U user -d flux -t -c "
  SELECT COUNT(*) 
  FROM flux.mg_bess_readings 
  WHERE time > now() - interval '5 minutes'
")

if [ "$RECENT" -eq 0 ]; then
  echo "WARNING: No recent telemetry"
  exit 2
fi

echo "OK: System healthy"
```

### Alert Configuration

```yaml
# Grafana alert rules
- alert: BatterySOELow
  expr: bess_soe < 10
  for: 5m
  annotations:
    summary: "Battery SOE below 10%"
    
- alert: NoRecentTelemetry
  expr: time() - last_telemetry_time > 300
  for: 5m
  annotations:
    summary: "No telemetry for 5+ minutes"
```

## Backup and Recovery

### Database Backup

```bash
# Full backup
pg_dump -h db.host -U user -d flux --schema=flux -f flux_backup.sql

# Telemetry only (last 7 days)
pg_dump -h db.host -U user -d flux \
  --table="flux.mg_*_readings" \
  --where="time > now() - interval '7 days'" \
  -f telemetry_backup.sql
```

### Configuration Backup

```bash
# Backup all site configs
for site in wlce hmce lfce; do
  scp pi@${site}-ip:~/bess_controller/config.yaml \
    backups/${site}_config_$(date +%Y%m%d).yaml
done
```

## Maintenance Windows

### Scheduled Maintenance

```yaml
# Disable control during maintenance
controller:
  components:
    - type: "maintenance_mode"
      enabled: true
      priority: 0  # Highest priority
      schedule:
        - start: "02:00"
          end: "04:00"
          days: ["sunday"]
```

### Emergency Stop

```bash
# Immediate stop
ssh pi@site-ip "sudo systemctl stop bess_controller"

# Safe mode (0 power)
ssh pi@site-ip "
  echo 'controller:
    components:
      - type: to_soe
        config:
          target_power: 0' > ~/bess_controller/override.yaml
  sudo systemctl restart bess_controller
"
```

## Log Management

### Log Rotation

```bash
# /etc/logrotate.d/bess_controller
/var/log/bess_controller/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 640 pi pi
}
```

### Log Analysis

```bash
# Error summary
journalctl -u bess_controller --since "1 day ago" | grep ERROR | sort | uniq -c

# Performance metrics
journalctl -u bess_controller --since "1 hour ago" | grep "cycle_time"
```

## Security

### Key Rotation

1. Generate new keys in Supabase
2. Update environment files on all sites
3. Restart services
4. Verify connectivity

### Access Audit

```bash
# Check SSH access
last -n 20

# Review sudo usage
sudo journalctl -u sudo
```

## Disaster Recovery

### Site Offline

1. Check VPN connectivity
2. Contact site for physical inspection
3. Review last known telemetry
4. Prepare replacement hardware if needed

### Database Recovery

```bash
# Restore from backup
psql -h db.host -U user -d flux < flux_backup.sql

# Verify data integrity
SELECT COUNT(*), MAX(time), MIN(time) 
FROM flux.mg_bess_readings;
```

## Next Steps

- [Deployment Guide](../deployment/) - Initial setup
- [Controller Architecture](../controller/) - Technical details
- [Monitoring Setup](../guides/) - Grafana configuration