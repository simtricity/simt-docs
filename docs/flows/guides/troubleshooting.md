---
sidebar_position: 1
---

# Troubleshooting Guide

Common issues and solutions for the Flows platform.

## Connection Issues

### Mediator Server Unavailable

**Symptom**: Cannot connect to meters through mediator servers

**Solutions**:
1. Check mediator server status:
   ```bash
   mediators list
   ```

2. Verify network connectivity:
   ```bash
   ping mediator.simtricity.com
   ```

3. Check authentication credentials in environment variables

### Meter Not Responding

**Symptom**: EMOP commands fail or timeout

**Solutions**:
1. Check meter signal quality:
   ```bash
   emop csq EML2137580826
   ```

2. Verify meter is powered on and in range

3. Try direct connection without mediator:
   ```bash
   emop -d meter_info EML2137580826
   ```

## Data Collection Issues

### Missing Interval Data

**Symptom**: Half-hourly interval data not appearing

**Solutions**:
1. Check meter time synchronization
2. Verify meter is configured for interval recording
3. Review meter register configuration
4. Check data export schedule

### Incorrect Readings

**Symptom**: Register values don't match expected values

**Solutions**:
1. Verify register mapping in database
2. Check unit conversion factors
3. Ensure correct meter model configuration
4. Review tariff settings

## Prepayment Issues

### Token Generation Failures

**Symptom**: Cannot generate prepayment tokens

**Solutions**:
1. Verify meter is in prepayment mode
2. Check current balance status
3. Ensure valid tariff is configured
4. Review meter credit limits

### Token Not Accepted

**Symptom**: Meter rejects valid token

**Solutions**:
1. Check token format and length
2. Verify meter key configuration
3. Ensure token hasn't expired
4. Check meter date/time settings

## Database Issues

### PostgREST API Errors

**Symptom**: API returns 4xx or 5xx errors

**Solutions**:
1. Check authentication headers
2. Verify API endpoint URL
3. Review request payload format
4. Check database permissions

### Query Performance

**Symptom**: Slow API responses

**Solutions**:
1. Use appropriate filters and limits
2. Check database indexes
3. Review query complexity
4. Consider pagination for large datasets

## CLI Tool Issues

### Installation Problems

**Symptom**: Cannot install simt-emlite package

**Solutions**:
1. Update pip:
   ```bash
   pip install --upgrade pip
   ```

2. Install with verbose output:
   ```bash
   pip install -v simt-emlite
   ```

3. Check Python version (requires 3.8+)

### Command Not Found

**Symptom**: `emop` or `mediators` commands not recognized

**Solutions**:
1. Verify installation:
   ```bash
   pip show simt-emlite
   ```

2. Check PATH environment variable

3. Try using full path:
   ```bash
   python -m simt_emlite.emop
   ```

## Common Error Messages

### "Authentication failed"
- Check API key and JWT token
- Verify credentials haven't expired
- Ensure correct environment configuration

### "Meter not found"
- Verify meter serial number
- Check meter is registered in database
- Ensure correct ESCO code

### "Invalid tariff configuration"
- Review tariff structure
- Check date ranges
- Verify rate values are numeric

### "Communication timeout"
- Check network connectivity
- Verify mediator server status
- Increase timeout values if needed

## Getting Help

If issues persist:

1. Check the [GitHub repository](https://github.com/simtricity) for known issues
2. Review API logs for detailed error messages
3. Contact technical support with:
   - Error messages
   - Command used
   - Meter serial number
   - Timestamp of issue