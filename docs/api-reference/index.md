---
sidebar_position: 1
sidebar_label: Overview
---

# API Reference

Complete API documentation for the Simtricity platform.

## Overview

The Simtricity API is built on PostgREST, providing a RESTful interface to the PostgreSQL database. All API endpoints automatically support:

- **CRUD Operations** - Create, Read, Update, Delete
- **Filtering** - Advanced query capabilities
- **Pagination** - Limit and offset support
- **Sorting** - Order by any column
- **Embedding** - Join related resources

## Base URL

```
https://api.simtricity.com/rest/v1
```

## Authentication

All API requests require authentication via JWT tokens:

```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN',
  'apikey': 'YOUR_API_KEY'
}
```

## Core Endpoints

### Customer Management
- `GET /customers` - List customers
- `POST /customers` - Create customer
- `PATCH /customers?id=eq.{id}` - Update customer
- `DELETE /customers?id=eq.{id}` - Delete customer

### Account Management
- `GET /accounts` - List accounts
- `GET /customer_accounts` - Customer-account relationships

### Meter Operations
- `GET /meters` - List meters
- `GET /meter_readings` - Get meter readings
- `POST /meter_readings` - Submit readings

### Billing & Payments
- `GET /payments` - List payments
- `POST /payments` - Record payment
- `GET /monthly_costs` - Monthly cost calculations

## RPC Functions

Special operations are available as RPC functions:

```javascript
POST /rpc/meters_missing_future_tariffs
{
  "esco_code_in": "wlce"
}
```

Available RPC functions:
- `meters_missing_future_tariffs` - Find meters needing tariff updates
- `generate_new_quarter_tariffs` - Generate quarterly tariffs
- `monthly_costs_compute` - Calculate monthly costs

## Query Examples

### Filter by field
```
GET /customers?status=eq.active
```

### Select specific columns
```
GET /customers?select=id,email,name
```

### Join related data
```
GET /properties?select=*,meters(*)
```

### Pagination
```
GET /customers?limit=10&offset=20
```

## Error Handling

API errors follow standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

## Next Steps

- [Authentication Guide](/docs/api-reference/authentication)
- [Flows API Reference](/docs/api-reference/flows/)
- [Code Examples](/docs/api-reference/examples/)