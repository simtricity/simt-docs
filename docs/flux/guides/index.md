---
sidebar_position: 1
sidebar_label: Developer Guides
---

# Flux Developer Guides

Practical guides for working with the Flux platform.

## Building from Source

### Prerequisites
- Go 1.20 or higher
- Git
- Make (optional)

### Clone and Build

```bash
# Clone repository
git clone https://github.com/cepro/simt-flux.git
cd simt-flux/bess_controller/src

# Build for local testing
go build -o bess_controller main.go

# Cross-compile for RevPi
env GOARCH=arm64 GOOS=linux go build -o bess_controller_rpi main.go
```

## Running Locally

### Debug Configuration

Create a debug configuration file:

```yaml
# debug.yaml
debug:
  enabled: true
  mock_devices: true
  log_level: debug

controller:
  poll_interval: 10s
  
  components:
    - type: "to_soe"
      enabled: true
      config:
        target_soe: 50.0
```

### Run with Mock Devices

```bash
go run main.go -f debug.yaml
```

## Adding a New Control Mode

### 1. Implement the Interface

```go
// comp_my_mode.go
type MyModeComponent struct {
    config MyModeConfig
}

func (m *MyModeComponent) Name() string {
    return "my_mode"
}

func (m *MyModeComponent) Priority() int {
    return m.config.Priority
}

func (m *MyModeComponent) IsActive(t time.Time) bool {
    return m.schedule.IsActive(t)
}

func (m *MyModeComponent) CalculateTarget(state SystemState) (float64, error) {
    // Your control logic here
    return 0.0, nil
}
```

### 2. Register the Component

```go
// controller.go
func NewController(config Config) *Controller {
    components := []ControlComponent{
        NewMyModeComponent(config.MyMode),
        // ... other components
    }
}
```

## Database Migrations

### Using Sqitch

```bash
cd simt-flux/db/sqitch

# Add a new migration
sqitch add my_feature -n "Add my feature"

# Edit the deploy script
edit deploy/my_feature.sql

# Deploy to test environment
sqitch deploy --target timescale-test
```

## Testing

### Unit Tests

```bash
cd bess_controller/src
go test ./... -v
```

### Integration Tests

```bash
# Start mock Modbus server
docker run -d -p 5020:5020 oitc/modbus-server

# Run integration tests
go test -tags=integration ./...
```

## Monitoring

### Grafana Dashboard

Import the Flux dashboard:

1. Open Grafana
2. Import dashboard from JSON
3. Select Flux datasource

### Key Metrics

- Battery SOE trends
- Power import/export
- Control mode activity
- Market signal correlation

## Troubleshooting

### Common Issues

**Problem**: Controller not connecting to BESS

**Solution**:
```bash
# Check network connectivity
ping 192.168.1.100

# Test Modbus connection
modpoll -m tcp -a 1 -r 2000 -c 10 192.168.1.100
```

**Problem**: Data not appearing in database

**Solution**:
```bash
# Check Supabase credentials
echo $SUPABASE_URL

# Test API access
curl -H "apikey: $SUPABASE_ANON_KEY" \
  $SUPABASE_URL/rest/v1/mg_bess_readings?limit=1
```

## Best Practices

- Always test control modes with mock devices first
- Use appropriate logging levels in production
- Monitor SOE limits to prevent battery damage
- Implement gradual ramping for power changes
- Handle network disconnections gracefully

## Next Steps

- [Controller Architecture](../controller/) - Technical details
- [Deployment Guide](../deployment/) - Production deployment
- [API Reference](../api/) - Integration points