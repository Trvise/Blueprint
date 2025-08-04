# Cost Tracking Implementation Guide

## Current Implementation

The backend now includes cost tracking with:

### ✅ **What's Working:**
- **Estimated Costs**: Calculated based on Google Cloud pricing
- **Cost Structure**: Breakdown by service (Speech-to-Text, Generative AI, Cloud Storage)
- **Request Tracking**: Each request shows estimated costs
- **API Integration**: Ready for actual billing data

### 📊 **Cost Breakdown:**
- **Speech-to-Text**: $0.006 per 15 seconds
- **Generative AI**: $0.0005 per 1K characters (Gemini 1.5 Pro)
- **Cloud Storage**: $0.02 per GB per month

## 🔧 **To Get Actual Costs:**

### Option 1: Google Cloud Console (Recommended)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **Billing** → **Reports**
3. Filter by your project: `vortexlens`
4. View costs by service and time period
5. Export data for integration

### Option 2: Cloud Billing API (Advanced)
To get actual costs via API, you need:

1. **Enable Billing API**:
   ```bash
   gcloud services enable billing.googleapis.com
   ```

2. **Grant Billing Permissions**:
   - Go to IAM & Admin → IAM
   - Add role: `Billing Account Viewer` to your service account

3. **Update the `get_actual_costs` function**:
   ```python
   def get_actual_costs(project_id: str, start_time: datetime, end_time: datetime) -> Dict[str, float]:
       billing_client = billing_v1.CloudBillingClient()
       
       # Get billing account
       project_name = f"projects/{project_id}"
       project_billing_info = billing_client.get_project_billing_info(name=project_name)
       billing_account = project_billing_info.billing_account_name
       
       # Get cost data
       # Implementation would query actual billing data
       # This requires billing API access and proper permissions
   ```

### Option 3: Cloud Monitoring API
Use Cloud Monitoring to track API usage and calculate costs:

```python
from google.cloud import monitoring_v3

def get_api_usage(project_id: str, start_time: datetime, end_time: datetime):
    client = monitoring_v3.MetricServiceClient()
    project_name = f"projects/{project_id}"
    
    # Query API usage metrics
    # Calculate costs based on usage
```

## 🎯 **Current Status:**

### ✅ **Working Features:**
- Estimated cost calculation
- Cost breakdown by service
- Request-level cost tracking
- Integration ready for actual billing data

### 📈 **Cost Tracking in Response:**
```json
{
  "transcript": "...",
  "steps": [...],
  "costs": {
    "estimated": {
      "Speech-to-Text": 0.012,
      "Generative AI": 0.001,
      "Cloud Storage": 0.00002,
      "Total": 0.01302
    },
    "actual": {
      "Speech-to-Text": 0.0,
      "Generative AI": 0.0,
      "Cloud Storage": 0.0,
      "Total": 0.0
    }
  }
}
```

## 🚀 **Next Steps:**

1. **For Development**: Use estimated costs (current implementation)
2. **For Production**: Implement actual billing API integration
3. **For Monitoring**: Set up Cloud Monitoring alerts for cost thresholds

The system is ready for production use with estimated costs, and can be upgraded to actual costs when billing API permissions are configured. 