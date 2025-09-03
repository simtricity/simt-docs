---
sidebar_position: 1
sidebar_label: Platform Integrations
---

# Platform Integrations

Flux integrates with multiple external platforms for market trading, data storage, and energy optimization.

## Axle Energy

### Overview
Axle Energy provides flexibility trading and grid services market access.

### Integration Points

- **Dispatch Signals**: Receive power setpoint commands
- **Availability Updates**: Report battery availability
- **Settlement Data**: Energy delivered reports

### API Configuration

```yaml
integrations:
  axle:
    api_url: "https://api.axle.energy/v1"
    api_key: "${AXLE_API_KEY}"
    site_id: "wlce-001"
    update_interval: 60s
```

### Dispatch Handling

```go
// Fetch dispatch instructions
dispatch, err := axleClient.GetCurrentDispatch()
if err == nil && dispatch.Active {
    targetPower = dispatch.PowerSetpoint
    commandSource = AXLE_DISPATCH
}
```

### Webhooks

```json
{
  "event": "dispatch_update",
  "timestamp": "2024-01-01T12:00:00Z",
  "site_id": "wlce-001",
  "dispatch": {
    "start_time": "2024-01-01T12:00:00Z",
    "end_time": "2024-01-01T12:30:00Z",
    "power_kw": 50.0,
    "energy_kwh": 25.0
  }
}
```

## Modo Energy

### Overview
Modo Energy provides market intelligence and Net Imbalance Volume (NIV) estimates.

### NIV Data Access

```go
type ModoClient struct {
    apiKey string
    baseURL string
}

func (m *ModoClient) GetNIVEstimate() (float64, error) {
    resp, err := m.get("/niv/latest")
    if err != nil {
        return 0, err
    }
    return resp.NIV_MW * 1000, nil // Convert MW to kW
}
```

### Configuration

```yaml
integrations:
  modo:
    api_url: "https://api.modo.energy/v1"
    api_key: "${MODO_API_KEY}"
    refresh_interval: 60s
```

### Data Structure

```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "niv_mw": -150.5,
  "confidence": 0.85,
  "settlement_period": 24,
  "forecast_horizon": "T+0"
}
```

## Supabase

### Overview
Cloud database platform for telemetry storage and API access.

### Authentication

```go
// Service role for backend operations
client := supabase.NewClient(
    os.Getenv("SUPABASE_URL"),
    os.Getenv("SUPABASE_SERVICE_KEY"),
)

// Anon key for frontend access
publicClient := supabase.NewClient(
    os.Getenv("SUPABASE_URL"),
    os.Getenv("SUPABASE_ANON_KEY"),
)
```

### Data Upload

```go
func uploadTelemetry(readings []BessReading) error {
    // Batch insert with upsert
    resp, err := client.
        From("mg_bess_readings").
        Insert(readings).
        OnConflict("device_id,time").
        Execute()
    
    if err != nil {
        return fmt.Errorf("upload failed: %w", err)
    }
    return nil
}
```

### Real-time Subscriptions

```javascript
// Subscribe to battery state changes
const channel = supabase
  .channel('bess-updates')
  .on('postgres_changes', 
    { 
      event: 'INSERT', 
      schema: 'flux',
      table: 'mg_bess_readings',
      filter: 'device_id=eq.uuid-here'
    },
    (payload) => {
      console.log('New reading:', payload.new)
    }
  )
  .subscribe()
```

### RLS Policies

```sql
-- Allow read access to authenticated users
CREATE POLICY "Allow authenticated read" ON flux.mg_bess_readings
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Service role bypass
CREATE POLICY "Service role full access" ON flux.mg_bess_readings
    USING (auth.jwt() ->> 'role' = 'service_role');
```

## Environment Variables

### Required Keys

```bash
# Supabase
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key-here"
export SUPABASE_SERVICE_KEY="your-service-key-here"

# Axle Energy
export AXLE_API_KEY="your-axle-api-key"
export AXLE_WEBHOOK_SECRET="your-webhook-secret"

# Modo Energy  
export MODO_API_KEY="your-modo-api-key"
```

### Security Best Practices

- Store keys in secure environment files
- Use service accounts, not personal keys
- Rotate keys regularly
- Monitor API usage
- Implement rate limiting

## Webhook Handling

### Axle Dispatch Webhook

```go
func handleAxleWebhook(w http.ResponseWriter, r *http.Request) {
    // Verify signature
    signature := r.Header.Get("X-Axle-Signature")
    if !verifySignature(r.Body, signature) {
        http.Error(w, "Invalid signature", 401)
        return
    }
    
    // Process dispatch
    var dispatch AxleDispatch
    json.NewDecoder(r.Body).Decode(&dispatch)
    
    // Update controller
    controller.SetDispatch(dispatch)
    
    w.WriteHeader(200)
}
```

## Rate Limiting

### API Limits

| Platform | Limit | Window |
|----------|-------|--------|
| Supabase | 1000 req | 1 minute |
| Axle | 100 req | 1 minute |
| Modo | 60 req | 1 minute |

### Handling Rate Limits

```go
type RateLimitedClient struct {
    client *http.Client
    limiter *rate.Limiter
}

func (r *RateLimitedClient) Get(url string) (*http.Response, error) {
    // Wait for token
    err := r.limiter.Wait(context.Background())
    if err != nil {
        return nil, err
    }
    
    // Make request
    resp, err := r.client.Get(url)
    
    // Check for rate limit
    if resp.StatusCode == 429 {
        retryAfter := resp.Header.Get("Retry-After")
        time.Sleep(parseRetryAfter(retryAfter))
        return r.Get(url) // Retry
    }
    
    return resp, err
}
```

## Error Handling

### Circuit Breaker Pattern

```go
type CircuitBreaker struct {
    failures int
    threshold int
    timeout time.Duration
    lastFail time.Time
}

func (cb *CircuitBreaker) Call(fn func() error) error {
    if cb.isOpen() {
        return errors.New("circuit open")
    }
    
    err := fn()
    if err != nil {
        cb.recordFailure()
        return err
    }
    
    cb.reset()
    return nil
}
```

## Monitoring

### Integration Health Checks

```go
func checkIntegrations() map[string]bool {
    status := map[string]bool{
        "supabase": checkSupabase(),
        "axle": checkAxle(),
        "modo": checkModo(),
    }
    return status
}
```

### Metrics Collection

```yaml
metrics:
  - name: integration_requests_total
    type: counter
    labels: [platform, status]
    
  - name: integration_latency_seconds
    type: histogram
    labels: [platform, endpoint]
    
  - name: integration_errors_total
    type: counter
    labels: [platform, error_type]
```

## Next Steps

- [API Reference](../api/) - Detailed API documentation
- [Controller Architecture](../controller/) - Integration usage
- [Operations Guide](../operations/) - Monitoring setup