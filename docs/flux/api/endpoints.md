---
sidebar_position: 2
sidebar_label: API Endpoints
---

# API Endpoints

Complete reference for all Flux platform API endpoints.

## Authentication

All API requests require authentication headers:

```http
apikey: your-anon-key
Authorization: Bearer your-anon-key
Content-Type: application/json
Prefer: return=representation
```

## Base URLs

| Environment | URL |
|-------------|-----|
| Production | `https://your-project.supabase.co/rest/v1` |
| Test | `https://test-project.supabase.co/rest/v1` |

## BESS Readings

### Get BESS Telemetry

Retrieve battery system readings.

**Endpoint:** `GET /mg_bess_readings`

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| device_id | UUID | Filter by device | `device_id=eq.123e4567-e89b-12d3-a456-426614174000` |
| time | Timestamp | Time range filter | `time=gte.2024-01-01T00:00:00Z` |
| soe | Float | SOE filter | `soe=lt.50` |
| select | String | Field selection | `select=time,device_id,soe,target_power` |
| order | String | Sort order | `order=time.desc` |
| limit | Integer | Result limit | `limit=100` |

**Example Request:**

```bash
curl -X GET \
  'https://your-project.supabase.co/rest/v1/mg_bess_readings?device_id=eq.123e4567-e89b-12d3-a456-426614174000&time=gte.2024-01-01T00:00:00Z&time=lt.2024-01-02T00:00:00Z&order=time.desc&limit=100' \
  -H 'apikey: your-anon-key' \
  -H 'Authorization: Bearer your-anon-key'
```

**Response:**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "time": "2024-01-01T12:00:00.000Z",
    "device_id": "123e4567-e89b-12d3-a456-426614174000",
    "soe": 65.5,
    "target_power": -25.0,
    "available_inverter_blocks": 4,
    "command_source": 1,
    "created_at": "2024-01-01T12:00:01.000Z"
  }
]
```

### Insert BESS Reading

Upload new telemetry data.

**Endpoint:** `POST /mg_bess_readings`

**Request Body:**

```json
{
  "device_id": "123e4567-e89b-12d3-a456-426614174000",
  "time": "2024-01-01T12:00:00.000Z",
  "soe": 65.5,
  "target_power": -25.0,
  "available_inverter_blocks": 4,
  "command_source": 1
}
```

**Response:** `201 Created`

## Meter Readings

### Get Meter Telemetry

Retrieve power meter readings.

**Endpoint:** `GET /mg_meter_readings`

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| device_id | UUID | Filter by meter | `device_id=eq.meter-uuid` |
| time | Timestamp | Time range | `time=gte.2024-01-01T00:00:00Z` |
| power_total_active | Float | Power filter | `power_total_active=gt.100` |

**Example Request:**

```bash
curl -X GET \
  'https://your-project.supabase.co/rest/v1/mg_meter_readings?device_id=eq.meter-uuid&time=gte.2024-01-01T00:00:00Z&select=time,power_total_active,energy_imported_active' \
  -H 'apikey: your-anon-key'
```

**Response:**

```json
[
  {
    "time": "2024-01-01T12:00:00.000Z",
    "power_total_active": 125.5,
    "energy_imported_active": 1234.56
  }
]
```

### Bulk Insert Meter Readings

Upload multiple readings at once.

**Endpoint:** `POST /mg_meter_readings`

**Headers:**
```http
Prefer: return=minimal
```

**Request Body:**

```json
[
  {
    "device_id": "meter-uuid",
    "time": "2024-01-01T12:00:00Z",
    "power_total_active": 125.5,
    "voltage_line_average": 415.2,
    "current_phase_average": 180.5
  },
  {
    "device_id": "meter-uuid",
    "time": "2024-01-01T12:01:00Z",
    "power_total_active": 128.3,
    "voltage_line_average": 414.8,
    "current_phase_average": 182.1
  }
]
```

## Market Data

### Get Market Signals

Retrieve market price and signal data.

**Endpoint:** `GET /market_data`

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| type | Integer | Data type ID | `type=eq.1` (NIV) |
| time | Timestamp | Time filter | `time=gte.2024-01-01T00:00:00Z` |

**Market Data Types:**
- `1` - NIV Estimate (MW)
- `2` - Wholesale Price (£/MWh)
- `3` - Imbalance Price (£/MWh)
- `4` - Axle Dispatch (kW)

**Example Request:**

```bash
# Get latest NIV estimate
curl -X GET \
  'https://your-project.supabase.co/rest/v1/market_data?type=eq.1&order=time.desc&limit=1' \
  -H 'apikey: your-anon-key'
```

**Response:**

```json
[
  {
    "id": "market-data-uuid",
    "time": "2024-01-01T12:00:00Z",
    "type": 1,
    "value": -150.5,
    "metadata": {
      "confidence": 0.85,
      "settlement_period": 24
    }
  }
]
```

## Device Registry

### List Devices

Get all registered devices.

**Endpoint:** `GET /mg_device_registry`

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| site | String | Filter by site | `site=eq.WLCE` |
| type | String | Device type | `type=eq.bess` |
| active | Boolean | Active status | `active=eq.true` |

**Example Request:**

```bash
curl -X GET \
  'https://your-project.supabase.co/rest/v1/mg_device_registry?site=eq.WLCE&active=eq.true' \
  -H 'apikey: your-anon-key'
```

**Response:**

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "WLCE-BESS-01",
    "type": "bess",
    "site": "WLCE",
    "metadata": {
      "max_power": 100,
      "capacity_kwh": 500,
      "modbus_address": 1
    },
    "active": true,
    "created_at": "2023-01-01T00:00:00Z"
  }
]
```

### Register Device

Add a new device to the registry.

**Endpoint:** `POST /mg_device_registry`

**Request Body:**

```json
{
  "name": "WLCE-BESS-02",
  "type": "bess",
  "site": "WLCE",
  "metadata": {
    "manufacturer": "PowerPack",
    "model": "PP-500",
    "capacity_kwh": 500,
    "max_power_kw": 100
  }
}
```

## RPC Functions

### Get 5-Minute Aggregations

**Endpoint:** `POST /rpc/get_meter_readings_5m`

**Request Body:**

```json
{
  "start_time": "2024-01-01T00:00:00Z",
  "end_time": "2024-01-02T00:00:00Z",
  "device_ids": ["meter-uuid"]
}
```

**Response:**

```json
[
  {
    "time_b": "2024-01-01T00:00:00Z",
    "device_id": "meter-uuid",
    "power_total_active_avg": 125.5,
    "energy_imported_active_delta": 10.5
  }
]
```

### Get 30-Minute Settlement Data

**Endpoint:** `POST /rpc/get_meter_readings_30m`

**Request Body:**

```json
{
  "start_time": "2024-01-01T00:00:00Z",
  "end_time": "2024-01-02T00:00:00Z",
  "device_ids": null
}
```

**Response:**

```json
[
  {
    "time_b": "2024-01-01T00:00:00Z",
    "device_id": "meter-uuid",
    "power_total_active_avg": 125.5,
    "energy_imported_active_delta": 62.75,
    "energy_exported_active_delta": 0
  }
]
```

## Real-time Subscriptions

### WebSocket Connection

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, anonKey)

// Subscribe to BESS updates
const channel = supabase
  .channel('bess-realtime')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'flux',
      table: 'mg_bess_readings',
      filter: 'device_id=eq.123e4567-e89b-12d3-a456-426614174000'
    },
    (payload) => {
      console.log('New reading:', payload.new)
    }
  )
  .subscribe()
```

## Error Responses

### Common Error Codes

| Status | Description | Example |
|--------|-------------|---------|
| 400 | Bad Request | Invalid query parameter |
| 401 | Unauthorized | Missing or invalid API key |
| 409 | Conflict | Duplicate key violation |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal error |

### Error Response Format

```json
{
  "code": "23505",
  "details": "Key (device_id, time)=(123e4567, 2024-01-01T00:00:00) already exists.",
  "hint": null,
  "message": "duplicate key value violates unique constraint"
}
```

## Rate Limits

| Tier | Requests/min | Burst |
|------|--------------|-------|
| Anon | 60 | 100 |
| Auth | 300 | 500 |
| Service | 1000 | 2000 |

### Rate Limit Headers

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1704110460
```

## Pagination

### Using Cursors

```bash
# Page 1
curl 'https://api.url/mg_bess_readings?limit=100&order=time.desc'

# Page 2 - use last timestamp from page 1
curl 'https://api.url/mg_bess_readings?limit=100&time=lt.2024-01-01T12:00:00Z&order=time.desc'
```

### Using Offset

```bash
# Page 1
curl 'https://api.url/mg_bess_readings?limit=100&offset=0'

# Page 2
curl 'https://api.url/mg_bess_readings?limit=100&offset=100'
```

## Filtering

### Operators

| Operator | Description | Example |
|----------|-------------|---------|
| eq | Equals | `soe=eq.50` |
| neq | Not equals | `command_source=neq.0` |
| gt | Greater than | `power=gt.0` |
| gte | Greater than or equal | `time=gte.2024-01-01` |
| lt | Less than | `soe=lt.20` |
| lte | Less than or equal | `power=lte.100` |
| like | Pattern match | `name=like.*BESS*` |
| in | In list | `site=in.(WLCE,HMCE)` |
| is | IS (for NULL) | `metadata=is.null` |

### Complex Filters

```bash
# AND conditions
curl 'https://api.url/mg_bess_readings?device_id=eq.uuid&soe=gt.50&soe=lt.80'

# OR conditions (use or parameter)
curl 'https://api.url/mg_bess_readings?or=(soe.lt.20,soe.gt.80)'

# Nested conditions
curl 'https://api.url/mg_bess_readings?and=(device_id.eq.uuid,or=(soe.lt.20,soe.gt.80))'
```

## Next Steps

- [Database Schema](../database/) - Understand data structures
- [Controller Architecture](../controller/) - How data is generated
- [Operations Guide](../operations/) - Monitor API usage