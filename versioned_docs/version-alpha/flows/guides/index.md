---
sidebar_position: 1
sidebar_label: Developer Guides
---

# Developer Guides

Practical guides for common Flows platform operations.

## Quick Start Guides

### Reading Meter Data
Learn how to retrieve meter readings, consumption data, and current state.
*Full guide coming soon*

### Updating Tariffs
Step-by-step guide to updating meter tariffs safely.
*Full guide coming soon*

### Processing Tokens
Generate and apply prepayment tokens to meters.
*Full guide coming soon*

### Monitoring Health
Track meter connectivity and system health.
*Full guide coming soon*

## Common Workflows

### Get Current Meter Status

```python
import requests

# Get meter state
response = requests.get(
    "https://api.flows.simtricity.com/meter_shadows",
    params={"select": "id,balance,health,tariffs_active,meter_registry(serial,name)"},
    headers={"Authorization": f"Bearer {token}"}
)

meters = response.json()
for meter in meters:
    print(f"{meter['meter_registry']['serial']}: £{meter['balance']:.2f}")
```

### Query Consumption Data

```sql
-- Daily consumption for last 30 days
SELECT 
    DATE(timestamp) as day,
    SUM(import_interval) as daily_kwh
FROM flows.register_import ri
JOIN flows.meter_registers mr ON ri.register_id = mr.register_id
WHERE mr.meter_id = '{{meter_id}}'
  AND timestamp > NOW() - INTERVAL '30 days'
GROUP BY DATE(timestamp)
ORDER BY day DESC;
```

### Update Future Tariff

Using the Flows CLI (`emop` command):

```bash
# Install CLI tools if not already installed
pip install simt-emlite

# Update tariff
emop tariffs_future_write \
  --from-ts "2025-01-01T00:00:00" \
  --unit-rate "0.2798" \
  --standing-charge "0.6556" \
  --emergency-credit "15.00" \
  EML2137580826
```

See [CLI Documentation](../cli/) for full command reference.

## Integration Patterns

### 1. Polling Pattern
For regular data collection:

```python
import time
import schedule

def sync_meter_data():
    """Fetch latest meter readings"""
    response = requests.get(
        f"{API_URL}/meter_shadows",
        params={"updated_at": f"gte.{last_sync}"},
        headers=headers
    )
    process_updates(response.json())

# Run every 5 minutes
schedule.every(5).minutes.do(sync_meter_data)

while True:
    schedule.run_pending()
    time.sleep(1)
```

### 2. Event-Driven Pattern
React to meter events:

```python
async def handle_meter_event(event):
    """Process meter events"""
    if event['type'] == 'balance_low':
        send_low_balance_alert(event['meter_id'])
    elif event['type'] == 'offline':
        trigger_connectivity_check(event['meter_id'])
    elif event['type'] == 'tariff_activated':
        verify_tariff_update(event['meter_id'])
```

### 3. Batch Processing
Efficient bulk operations:

```python
def update_tariffs_bulk(meter_ids, tariff_config):
    """Update multiple meters efficiently"""
    
    # Build batch update
    updates = []
    for meter_id in meter_ids:
        updates.append({
            "id": meter_id,
            "tariffs_future": tariff_config
        })
    
    # Send as single request
    response = requests.patch(
        f"{API_URL}/meter_shadows",
        json=updates,
        headers=headers
    )
    
    return response.json()
```

## Data Analysis Examples

### Load Profile Analysis

```python
import pandas as pd
import matplotlib.pyplot as plt

def analyze_load_profile(meter_id, date_from, date_to):
    """Generate load profile visualization"""
    
    # Fetch half-hourly data
    params = {
        "meter_id": f"eq.{meter_id}",
        "timestamp": f"gte.{date_from}&timestamp=lte.{date_to}",
        "order": "timestamp.asc"
    }
    
    response = requests.get(
        f"{API_URL}/register_interval_hh",
        params=params,
        headers=headers
    )
    
    # Create DataFrame
    df = pd.DataFrame(response.json())
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df.set_index('timestamp', inplace=True)
    
    # Plot daily profile
    hourly = df.resample('H').sum()
    hourly.plot(kind='line', y='import_kwh')
    plt.title(f'Load Profile for Meter {meter_id}')
    plt.ylabel('Consumption (kWh)')
    plt.show()
    
    return df
```

### Consumption Comparison

```python
def compare_consumption(site_id, period='month'):
    """Compare consumption across properties in a site"""
    
    query = """
    SELECT 
        p.plot,
        DATE_TRUNC(%s, ri.timestamp) as period,
        SUM(ri.import_interval) as total_kwh
    FROM flows.properties p
    JOIN flows.properties_service_head psh ON p.id = psh.property
    JOIN flows.service_head_meter shm ON psh.service_head = shm.service_head
    JOIN flows.meter_registers mr ON shm.meter = mr.meter_id
    JOIN flows.register_import ri ON mr.register_id = ri.register_id
    WHERE p.site = %s
      AND ri.timestamp > NOW() - INTERVAL '3 months'
    GROUP BY p.plot, DATE_TRUNC(%s, ri.timestamp)
    ORDER BY period DESC, total_kwh DESC
    """
    
    results = execute_query(query, [period, site_id, period])
    return pd.DataFrame(results)
```

## Best Practices

### 1. Efficient Queries
- Always use time bounds on time-series queries
- Select only needed fields with `select` parameter
- Use aggregation views instead of raw data when possible

### 2. Error Handling
```python
def safe_api_call(endpoint, params=None, retries=3):
    """API call with retry logic"""
    for attempt in range(retries):
        try:
            response = requests.get(
                f"{API_URL}/{endpoint}",
                params=params,
                headers=headers,
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            if attempt == retries - 1:
                raise
            time.sleep(2 ** attempt)  # Exponential backoff
```

### 3. Rate Limiting
- Implement client-side rate limiting
- Batch operations where possible
- Use caching for frequently accessed data

### 4. Data Validation
```python
def validate_tariff(tariff_data):
    """Validate tariff data before sending to meter"""
    required_fields = [
        'standing_charge',
        'unit_rate_element_a',
        'activation_datetime'
    ]
    
    for field in required_fields:
        if field not in tariff_data:
            raise ValueError(f"Missing required field: {field}")
    
    # Validate ranges
    if tariff_data['standing_charge'] < 0 or tariff_data['standing_charge'] > 2:
        raise ValueError("Standing charge out of range")
    
    if tariff_data['unit_rate_element_a'] < 0 or tariff_data['unit_rate_element_a'] > 1:
        raise ValueError("Unit rate out of range")
    
    return True
```

## Troubleshooting

### Common Issues

1. **No data returned**
   - Check time range filters
   - Verify meter is in active mode
   - Confirm authentication token is valid

2. **Slow queries**
   - Add time bounds
   - Use indexed columns in filters
   - Consider using aggregation views

3. **Tariff not updating**
   - Check activation_datetime is future
   - Verify meter clock synchronization
   - Review meter_event_log for errors

## Next Steps

- [API Reference](../api/) - Complete API documentation
- [Database Schema](../database/) - Table structures
- [Domain Model](../domain-model/) - Entity relationships