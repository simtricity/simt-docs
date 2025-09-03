---
sidebar_position: 1
sidebar_label: API Overview
---

# Flux API Reference

The Flux platform provides RESTful APIs for accessing telemetry data and controlling battery systems.

## Base URL

```
https://your-project.supabase.co/rest/v1/
```

## Authentication

All API requests require authentication via Supabase keys:

```bash
curl -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     https://your-project.supabase.co/rest/v1/mg_bess_readings
```

## Endpoints

### BESS Readings

Get battery telemetry data:

```http
GET /mg_bess_readings?device_id=eq.{device_id}&time=gte.{start_time}
```

### Meter Readings

Get power meter data:

```http
GET /mg_meter_readings?device_id=eq.{device_id}&time=gte.{start_time}
```

### Market Data

Get market signals:

```http
GET /market_data?type=eq.1&time=gte.{start_time}
```

## RPC Functions

### Get 30-Minute Aggregations

```sql
SELECT * FROM flux.get_meter_readings_30m(
  '2024-01-01'::timestamptz,
  '2024-01-02'::timestamptz,
  ARRAY['device-uuid']::uuid[]
);
```

## Next Steps

- [Database Schema](../database/) - Understand data structures
- [Domain Model](../domain-model/) - Entity relationships