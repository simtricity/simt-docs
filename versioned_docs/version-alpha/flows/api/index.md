---
sidebar_position: 1
sidebar_label: API Overview
---

# Flows API Reference

The Flows platform exposes a RESTful API through PostgREST, providing direct database access with authentication and authorization.

## Base URL

```
Production: https://api.flows.simtricity.com
Development: https://api-dev.flows.simtricity.com
```

## Authentication

API requests require JWT authentication:

```bash
curl https://api.flows.simtricity.com/meter_registry \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Common Endpoints

### Meters
- `GET /meter_registry` - List all meters
- `GET /meter_shadows` - Current meter states
- `GET /meter_shadows_tariffs` - Tariff information

### Data Collection
- `GET /register_import` - Import readings
- `GET /register_export` - Export readings
- `GET /register_interval_hh` - Half-hourly data

### Infrastructure
- `GET /properties` - Property listings
- `GET /circuits` - Circuit definitions
- `GET /escos` - Energy communities

## Query Parameters

PostgREST supports powerful query options:

### Filtering
```bash
# Equals
GET /meter_registry?serial=eq.EML2137580826

# Pattern matching
GET /meter_registry?name=like.*Water*

# Multiple conditions
GET /meter_registry?mode=eq.active&esco=eq.UUID
```

### Selecting Fields
```bash
# Specific columns
GET /meter_registry?select=id,serial,name

# With relationships
GET /meter_shadows?select=id,balance,meter_registry(serial,name)
```

### Ordering
```bash
# Sort by field
GET /register_import?order=timestamp.desc

# Multiple sorts
GET /meter_registry?order=esco.asc,name.asc
```

### Pagination
```bash
# Limit and offset
GET /register_interval_hh?limit=100&offset=200

# Range headers
GET /meter_registry
  -H "Range: 0-9"
  -H "Range-Unit: items"
```

## RPC Functions

Call stored procedures via `/rpc/` endpoint:

```bash
POST /rpc/get_meters_for_cli
Content-Type: application/json

{
  "esco_filter": "WLCE",
  "feeder_filter": null
}
```

## Response Format

Responses are JSON arrays:

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "serial": "EML2137580826",
    "name": "WL-01 Supply",
    "mode": "active",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

## Error Handling

HTTP status codes:
- `200 OK` - Success
- `201 Created` - Resource created
- `204 No Content` - Success with no body
- `400 Bad Request` - Invalid query
- `401 Unauthorized` - Missing/invalid auth
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Constraint violation

Error response:
```json
{
  "code": "23505",
  "details": "Key (serial)=(EML2137580826) already exists.",
  "hint": null,
  "message": "duplicate key value violates unique constraint"
}
```

## Next Steps

- Meter Operations - *Documentation coming soon*
- Data Queries - *Documentation coming soon*
- Real-time Updates - *Documentation coming soon*