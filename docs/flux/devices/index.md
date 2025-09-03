---
sidebar_position: 1
sidebar_label: Device Integrations
---

# Device Integrations

Flux communicates with physical devices using ModbusTCP protocol for real-time monitoring and control.

## PowerPack BESS

### Overview
PowerPack battery energy storage systems provide grid-scale energy storage with advanced control capabilities.

### Specifications
- **Capacity**: 100-500 kWh
- **Power**: 50-250 kW
- **Communication**: ModbusTCP
- **Response Time**: &lt;1 second

### Modbus Registers

| Register | Address | Type | Description |
|----------|---------|------|-------------|
| Target Power | 2008 | RW | Power setpoint (kW) |
| SOE | 2026 | RO | State of Energy (%) |
| Status | 2000 | RO | System status |
| Available Blocks | 2028 | RO | Inverter capacity |
| Command Source | 2010 | RW | Control mode ID |

### Control Sequence

```go
// Read current state
soe := client.ReadRegister(2026)
status := client.ReadRegister(2000)

// Calculate and send command
if status == READY {
    target := calculateTarget(soe)
    client.WriteRegister(2008, target)
}
```

## Acuvim II Meters

### Overview
High-accuracy power meters for monitoring site electrical parameters.

### Measurements
- Voltage (L-L, L-N)
- Current (per phase)
- Power (active, reactive, apparent)
- Energy (import/export)
- Power factor
- Frequency

### Modbus Configuration

```yaml
meter:
  type: acuvim2
  modbus:
    address: 1
    baud: 9600
    parity: none
    data_bits: 8
    stop_bits: 1
```

### Register Map

| Parameter | Start Address | Data Type | Scale |
|-----------|--------------|-----------|-------|
| Voltage L1-N | 0x0000 | Float32 | 1 |
| Current L1 | 0x0010 | Float32 | 1 |
| Power Total | 0x0040 | Float32 | 1000 |
| Energy Import | 0x0100 | Float32 | 1 |

## Communication Protocol

### ModbusTCP Frame

```
Transaction ID: 2 bytes
Protocol ID: 2 bytes (0x0000)
Length: 2 bytes
Unit ID: 1 byte
Function Code: 1 byte
Data: Variable
```

### Read Holding Registers (0x03)

```go
// Read 10 registers starting at 2000
request := []byte{
    0x00, 0x01,  // Transaction ID
    0x00, 0x00,  // Protocol ID
    0x00, 0x06,  // Length
    0x01,        // Unit ID
    0x03,        // Function Code
    0x07, 0xD0,  // Start Address (2000)
    0x00, 0x0A,  // Quantity (10)
}
```

### Write Single Register (0x06)

```go
// Write value to register 2008
request := []byte{
    0x00, 0x01,  // Transaction ID
    0x00, 0x00,  // Protocol ID
    0x00, 0x06,  // Length
    0x01,        // Unit ID
    0x06,        // Function Code
    0x07, 0xD8,  // Register Address (2008)
    0x00, 0x64,  // Value (100)
}
```

## Error Handling

### Common Modbus Exceptions

| Code | Name | Description |
|------|------|-------------|
| 0x01 | Illegal Function | Function code not supported |
| 0x02 | Illegal Address | Register address invalid |
| 0x03 | Illegal Value | Value outside valid range |
| 0x04 | Device Failure | Device unable to process |

### Retry Logic

```go
func readWithRetry(addr uint16, retries int) (uint16, error) {
    for i := 0; i < retries; i++ {
        val, err := client.ReadRegister(addr)
        if err == nil {
            return val, nil
        }
        time.Sleep(time.Second * time.Duration(i+1))
    }
    return 0, fmt.Errorf("max retries exceeded")
}
```

## Configuration Examples

### BESS Configuration

```yaml
devices:
  bess:
    - id: "uuid-here"
      name: "Site-BESS-01"
      type: "powerpack"
      modbus:
        host: "192.168.1.100"
        port: 502
        address: 1
        timeout: 5s
        retry_count: 3
```

### Meter Configuration

```yaml
devices:
  meters:
    - id: "uuid-here"
      name: "Grid-Meter"
      type: "acuvim2"
      modbus:
        host: "192.168.1.101"
        port: 502
        address: 2
        timeout: 5s
```

## Testing Tools

### modpoll
```bash
# Read BESS SOE
modpoll -m tcp -a 1 -r 2026 -c 1 192.168.1.100

# Write target power
modpoll -m tcp -a 1 -r 2008 -c 1 192.168.1.100 50
```

### mbscan
```bash
# Scan for devices
mbscan -p 502 192.168.1.0/24
```

## Next Steps

- [Controller Architecture](../controller/) - How devices are managed
- [Deployment Guide](../deployment/) - Network setup
- [API Reference](../api/) - Device data access