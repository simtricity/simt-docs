---
sidebar_position: 1
sidebar_label: Installation
---

# Installation & Setup

This guide covers setting up connections to the Flows platform. Note: This assumes Flows is already deployed and running.

## Prerequisites

- Python 3.8+ for simt-emlite
- PostgreSQL client tools
- Network access to Flows API
- Authentication credentials

## Client Installation

### Flows CLI Tools (simt-emlite)

The Flows CLI tools provide the `emop` and `mediators` commands for meter operations:

```bash
# Install from PyPI (recommended)
pip install simt-emlite

# Check installation
emop --version
mediators --version

# Or install from source for development
git clone https://github.com/simtricity/simt-emlite.git
cd simt-emlite
pip install -e .
```

**Latest Version:** 0.23.7 - [View on PyPI](https://pypi.org/project/simt-emlite/)

### Configuration

Create configuration file at `~/.simt/emlite.env`:

```bash
# Database connection
DATABASE_URL=postgresql://user:pass@flows.simtricity.com:5432/flows
FLOWS_API_URL=https://api.flows.simtricity.com

# Authentication
JWT_SECRET=your-jwt-secret
API_TOKEN=your-api-token

# Environment
ENVIRONMENT=production  # or development, staging

# Meter communication
MEDIATOR_GRPC_PORT=50051
MEDIATOR_TIMEOUT=30
```

### CLI Setup

Configure the emop CLI:

```bash
# Set environment
emop env_set prod

# Test connection
emop env_show

# List available meters
emop list
```

## Database Connection

### Direct PostgreSQL Access

```bash
# Connect via psql
psql postgresql://user:pass@flows.simtricity.com:5432/flows

# Set search path
SET search_path TO flows, public;

# Test query
SELECT COUNT(*) FROM meter_registry WHERE mode = 'active';
```

### Python Database Access

```python
import psycopg2
from psycopg2.extras import RealDictCursor

# Connect to database
conn = psycopg2.connect(
    host="flows.simtricity.com",
    port=5432,
    database="flows",
    user="your_user",
    password="your_password"
)

# Query with dict cursor
with conn.cursor(cursor_factory=RealDictCursor) as cur:
    cur.execute("""
        SELECT serial, name, balance 
        FROM meter_registry mr
        JOIN meter_shadows ms ON mr.id = ms.id
        WHERE mr.mode = 'active'
    """)
    meters = cur.fetchall()
```

## API Setup

### Authentication

Generate JWT token:

```python
import jwt
import datetime

def generate_token(secret, user_id, esco_id):
    payload = {
        'user_id': user_id,
        'esco_id': esco_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24),
        'iat': datetime.datetime.utcnow()
    }
    return jwt.encode(payload, secret, algorithm='HS256')

token = generate_token(JWT_SECRET, 'user123', 'esco-uuid')
```

### API Client

```python
import requests

class FlowsAPIClient:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    
    def get_meters(self):
        response = requests.get(
            f"{self.base_url}/meter_registry",
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()
    
    def get_meter_state(self, meter_id):
        response = requests.get(
            f"{self.base_url}/meter_shadows",
            params={'id': f'eq.{meter_id}'},
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()[0] if response.json() else None
```

## Mediator Server Setup

### Local Development

Run mediator server locally for testing:

```bash
# Start mediator for a specific meter
mediators create EML2137580826
mediators start EML2137580826

# Check status
mediators list
```

### Production Deployment

Mediators run on Fly.io:

```bash
# Deploy mediator app
fly deploy --app mediators-wlce

# Scale mediators
fly scale count 10 --app mediators-wlce

# Check logs
fly logs --app mediators-wlce
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/flows` |
| `FLOWS_API_URL` | API endpoint | `https://api.flows.simtricity.com` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `ESCO_ID` | Energy community ID | `550e8400-e29b-41d4-a716-446655440000` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LOG_LEVEL` | Logging verbosity | `INFO` |
| `API_TIMEOUT` | Request timeout (seconds) | `30` |
| `RETRY_COUNT` | API retry attempts | `3` |
| `CACHE_TTL` | Cache duration (seconds) | `300` |

## Network Requirements

### Firewall Rules

Required outbound connections:

| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| PostgreSQL | 5432 | TCP | Database access |
| API | 443 | HTTPS | REST API |
| Mediator | 50051 | gRPC | Meter communication |
| Meter | Various | TCP | Direct meter access |

### VPN Configuration

For secure access to production:

```bash
# Connect to VPN
openvpn --config flows-production.ovpn

# Test connectivity
ping flows.simtricity.com
nc -zv flows.simtricity.com 5432
```

## Verification

### Check Installation

```python
def verify_installation():
    """Verify Flows platform access"""
    
    checks = []
    
    # Check database connection
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.close()
        checks.append("✓ Database connection")
    except Exception as e:
        checks.append(f"✗ Database connection: {e}")
    
    # Check API access
    try:
        response = requests.get(f"{FLOWS_API_URL}/", headers=headers)
        response.raise_for_status()
        checks.append("✓ API access")
    except Exception as e:
        checks.append(f"✗ API access: {e}")
    
    # Check meter communication
    try:
        import simt_emlite
        checks.append("✓ simt-emlite installed")
    except ImportError:
        checks.append("✗ simt-emlite not installed")
    
    return checks

# Run verification
for check in verify_installation():
    print(check)
```

### Test Queries

```sql
-- Check meter count
SELECT COUNT(*) FROM flows.meter_registry WHERE mode = 'active';

-- Check recent data
SELECT MAX(timestamp) as latest_reading 
FROM flows.register_import
WHERE timestamp > NOW() - INTERVAL '1 hour';

-- Check system health
SELECT 
    COUNT(DISTINCT meter_id) as reporting_meters,
    MIN(timestamp) as oldest,
    MAX(timestamp) as newest
FROM flows.meter_csq
WHERE timestamp > NOW() - INTERVAL '1 hour';
```

## Next Steps

- [Troubleshooting Guide](./troubleshooting.md) - Common issues
- [API Reference](../api/) - API documentation
- [Developer Guides](../guides/) - Usage examples