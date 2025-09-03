---
sidebar_position: 1
sidebar_label: CLI Overview
---

# Flows CLI Tools

The Flows platform provides powerful command-line tools through the `simt-emlite` package for interacting with meters and managing the communication infrastructure.

## Installation

Install the Flows CLI tools via pip:

```bash
pip install simt-emlite
```

**Requirements:**
- Python 3.13 or higher (< 4.0)
- Network access to Flows infrastructure
- Configuration files in `~/.simt/`

**Latest Version:** 0.23.7 ([PyPI](https://pypi.org/project/simt-emlite/))

## CLI Tools Overview

The package provides two main CLI tools:

### 1. `emop` - Meter Operations
Direct interaction with Emlite meters via EMOP (Emlite Meter Operating Protocol)

### 2. `mediators` - Communication Management
Management of mediator servers that handle meter communications

## Quick Start

### Initial Setup

1. **Install the package:**
```bash
pip install simt-emlite
```

2. **Create configuration directory:**
```bash
mkdir -p ~/.simt
```

3. **Configure environment:**
```bash
# Set your environment (prod, staging, or local)
emop env_set prod

# Verify configuration
emop env_show
```

4. **Test connection:**
```bash
# List available meters and mediators
mediators list

# Check meter signal quality
emop csq EML2137580826
```

## Common Operations

### Check Meter Status
```bash
# Get prepayment balance
emop prepay_balance EML2137580826

# Check signal quality  
emop csq EML2137580826

# Alternative using -s flag
emop -s EML2137580826 csq

# Read current tariff
emop tariffs_active_read EML2137580826
```

### Update Tariffs
```bash
emop tariffs_future_write \
  --from-ts "2025-01-01T00:00:00" \
  --unit-rate "0.2798" \
  --standing-charge "0.6556" \
  --emergency-credit "15.00" \
  EML2137580826
```

### Send Prepayment Token
```bash
emop prepay_send_token EML2137580826 "12345678901234567890"
```

### Manage Mediators
```bash
# List all mediators
mediators list

# Create mediator for meter
mediators create EML2137580826

# Start mediator
mediators start EML2137580826

# Check mediator status
mediators list --meter EML2137580826
```

## Configuration

### Environment File

Create `~/.simt/emlite.env`:

```bash
# Database connection
DATABASE_URL=postgresql://user:pass@flows.simtricity.com:5432/flows

# API configuration
FLOWS_API_URL=https://api.flows.simtricity.com
JWT_SECRET=your-jwt-secret
API_TOKEN=your-api-token

# Environment selection
ENVIRONMENT=production  # or development, staging

# Mediator settings
MEDIATOR_GRPC_PORT=50051
MEDIATOR_TIMEOUT=30

# Optional: Logging
LOG_LEVEL=INFO
```

### DNS Configuration

For production access, configure DNS for wireguard if required:

```bash
# Add to /etc/hosts or configure DNS
<internal-ip-1>  flows.simtricity.com
<internal-ip-2>  mediators.simtricity.com
```

## Environment Management

The CLI supports multiple environments:

```bash
# List available environments
emop env_list

# Switch environment
emop env_set staging

# Show current environment
emop env_show
```

## Advanced Usage

### Batch Operations

Process multiple meters efficiently:

```python
#!/usr/bin/env python3
import subprocess
import json

meters = ["EML2137580826", "EML2137580827", "EML2137580828"]

for meter in meters:
    # Get balance
    result = subprocess.run(
        ["emop", "prepay_balance", meter],
        capture_output=True,
        text=True
    )
    balance = json.loads(result.stdout)
    print(f"{meter}: £{balance['balance']:.2f}")
```

### Profile Data Retrieval

Get historical consumption data:

```bash
# Get profile data for specific timestamp
emop profile_log_1 --timestamp 2024-07-19T00:00 EML2137580826

# Get latest profile
emop profile_log_latest EML2137580826
```

### Error Handling

The CLI provides detailed error messages:

```bash
# Example with error handling
if ! emop prepay_balance EML2137580826; then
    echo "Failed to read balance"
    # Check mediator status
    mediators list --meter EML2137580826
fi
```

## Troubleshooting

### Connection Issues

1. **Check environment configuration:**
```bash
emop env_show
```

2. **Verify mediator is running:**
```bash
mediators list --meter EML2137580826
```

3. **Test network connectivity:**
```bash
nc -zv flows.simtricity.com 5432
```

### Permission Errors

Ensure your API token has appropriate permissions:
```bash
# Test with explicit token
export API_TOKEN=your-token
emop list
```

### Timeout Issues

Adjust timeout in configuration:
```bash
export MEDIATOR_TIMEOUT=60  # Increase to 60 seconds
emop prepay_balance EML2137580826
```

## Command Reference

### emop Commands

Commands can be used with serial as positional argument (`emop COMMAND SERIAL`) or with -s flag (`emop -s SERIAL COMMAND`).

| Command | Description | Example |
|---------|-------------|---------|
| `csq` | Signal quality | `emop csq EML2137580826` |
| `serial_read` | Read meter serial | `emop serial_read EML2137580826` |
| `clock_time_read` | Current meter clock | `emop clock_time_read EML2137580826` |
| `instantaneous_voltage` | Current voltage | `emop instantaneous_voltage EML2137580826` |
| `read` | Current meter reading | `emop read EML2137580826` |
| `read_element_a` | Element A reading | `emop read_element_a EML2137580826` |
| `read_element_b` | Element B reading | `emop read_element_b EML2137580826` |
| `prepay_balance` | Get current balance | `emop prepay_balance EML2137580826` |
| `prepay_send_token` | Apply token | `emop prepay_send_token EML2137580826 12345678901234567890` |
| `tariffs_active_read` | Current tariff | `emop tariffs_active_read EML2137580826` |
| `tariffs_future_read` | Future tariff | `emop tariffs_future_read EML2137580826` |
| `tariffs_future_write` | Update tariff | `emop tariffs_future_write --unit-rate 0.28 EML2137580826` |
| `profile_log_1` to `profile_log_8` | Get profile data | `emop profile_log_1 --timestamp 2024-07-19 EML2137580826` |
| `backlight` | Read backlight setting | `emop backlight EML2137580826` |
| `load_switch` | Read load switch setting | `emop load_switch EML2137580826` |
| `prepay_enabled` | Check prepay mode | `emop prepay_enabled EML2137580826` |
| `env_set` | Set environment | `emop env_set prod` |
| `env_show` | Show environment | `emop env_show` |

### mediators Commands

| Command | Description | Example |
|---------|-------------|---------|
| `list` | List mediators | `mediators list` |
| `list --esco` | Filter by ESCO | `mediators list --esco wlce` |
| `list --exists` | Filter by existence | `mediators list --exists False` |
| `create` | Create mediator | `mediators create EML2137580826` |
| `destroy` | Remove mediator | `mediators destroy EML2137580826` |
| `start` | Start mediator | `mediators start EML2137580826` |
| `stop` | Stop mediator | `mediators stop EML2137580826` |
| `restart` | Restart mediator | `mediators restart EML2137580826` |
| `logs` | View logs | `mediators logs EML2137580826` |
| `env_set` | Set environment | `mediators env_set prod` |

## Integration Examples

### Python Script Integration

```python
from simt_emlite import MeterClient

# Initialize client
client = MeterClient(environment="production")

# Get meter
meter = client.get_meter("EML2137580826")

# Read balance
balance = meter.prepay_balance()
print(f"Current balance: £{balance:.2f}")

# Update tariff
meter.tariffs_future_write(
    activation_datetime="2025-01-01T00:00:00",
    unit_rate_a=0.2798,
    standing_charge=0.6556
)
```

### Shell Script Automation

```bash
#!/bin/bash

# Check all meter balances
for meter in $(emop list | jq -r '.[].serial'); do
    balance=$(emop prepay_balance $meter | jq '.balance')
    if (( $(echo "$balance < 5" | bc -l) )); then
        echo "Low balance alert: $meter has £$balance"
    fi
done
```

## Best Practices

1. **Always check meter status before operations:**
```bash
emop csq METER_SERIAL
```

2. **Use appropriate timeouts for slow networks:**
```bash
export MEDIATOR_TIMEOUT=45
```

3. **Log important operations:**
```bash
emop tariffs_future_write ... 2>&1 | tee -a /var/log/tariff-updates.log
```

4. **Handle errors gracefully in scripts:**
```bash
if ! output=$(emop prepay_balance $meter 2>&1); then
    echo "Error reading meter $meter: $output" >&2
    exit 1
fi
```

## Additional Resources

- [Installation Guide](../appendix/installation.md)
- [API Reference](../api/)
- [Troubleshooting Guide](../appendix/troubleshooting.md)
- [PyPI Package](https://pypi.org/project/simt-emlite/)
- [GitHub Repository](https://github.com/cepro/simt-emlite)