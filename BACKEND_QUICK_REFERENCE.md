# AXIOM AI Backend - Quick Reference Guide

## 🚀 Quick Start

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start server
python start_server.py

# 4. Verify
curl http://localhost:8000/api/health
```

## 📡 Essential Endpoints

### Upload Dataset
```bash
POST /api/dataset/upload
Content-Type: multipart/form-data
Body: file (CSV/Excel/JSON)
```

### Get Dataset Info
```bash
GET /api/dataset/info
```

### Descriptive Analysis
```bash
POST /api/analysis/descriptive
Body: {"analysis_type": "descriptive", "parameters": {}}
```

### Regression Analysis
```bash
POST /api/analysis/regression
Body: {
  "analysis_type": "regression",
  "parameters": {
    "dependent_variable": "Revenue",
    "independent_variables": ["Customers"]
  }
}
```

### Time Series Analysis
```bash
POST /api/analysis/timeseries
Body: {
  "analysis_type": "timeseries",
  "parameters": {
    "date_column": "Date",
    "value_column": "Revenue",
    "forecast_periods": 12
  }
}
```

### Quality Report
```bash
GET /api/cleaning/quality-report
```

### Fix Missing Values
```bash
POST /api/cleaning/fix-missing
Body: {
  "operation": "fix_missing",
  "parameters": {
    "strategy": "median",
    "column": "Revenue"
  }
}
```

### Automated Cleaning
```bash
POST /api/cleaning/automated?aggressive=false
```

## 💻 Frontend Integration

### React Hook Example

```typescript
import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8000';

export function useDataset() {
  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadDataset = async (file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE}/api/dataset/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      setDataset(data.dataset_info);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getDatasetInfo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/dataset/info`);
      
      if (!response.ok) throw new Error('Failed to get dataset info');
      
      const data = await response.json();
      setDataset(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { dataset, loading, error, uploadDataset, getDatasetInfo };
}
```

### API Service Example

```typescript
// services/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = {
  // Dataset
  uploadDataset: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/api/dataset/upload`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },

  getDatasetInfo: async () => {
    const res = await fetch(`${API_BASE}/api/dataset/info`);
    return res.json();
  },

  // Analysis
  performDescriptiveAnalysis: async () => {
    const res = await fetch(`${API_BASE}/api/analysis/descriptive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        analysis_type: 'descriptive',
        parameters: {},
      }),
    });
    return res.json();
  },

  performRegression: async (depVar: string, indepVars: string[]) => {
    const res = await fetch(`${API_BASE}/api/analysis/regression`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        analysis_type: 'regression',
        parameters: {
          dependent_variable: depVar,
          independent_variables: indepVars,
        },
      }),
    });
    return res.json();
  },

  performTimeSeries: async (dateCol: string, valueCol: string, periods: number = 12) => {
    const res = await fetch(`${API_BASE}/api/analysis/timeseries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        analysis_type: 'timeseries',
        parameters: {
          date_column: dateCol,
          value_column: valueCol,
          forecast_periods: periods,
        },
      }),
    });
    return res.json();
  },

  // Cleaning
  getQualityReport: async () => {
    const res = await fetch(`${API_BASE}/api/cleaning/quality-report`);
    return res.json();
  },

  fixMissingValues: async (column: string, strategy: string = 'median') => {
    const res = await fetch(`${API_BASE}/api/cleaning/fix-missing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'fix_missing',
        parameters: { strategy, column },
      }),
    });
    return res.json();
  },

  removeDuplicates: async () => {
    const res = await fetch(`${API_BASE}/api/cleaning/remove-duplicates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'remove_duplicates',
        parameters: { keep: 'first' },
      }),
    });
    return res.json();
  },

  applyAutomatedCleaning: async (aggressive: boolean = false) => {
    const res = await fetch(
      `${API_BASE}/api/cleaning/automated?aggressive=${aggressive}`,
      { method: 'POST' }
    );
    return res.json();
  },

  // Visualization
  createHistogram: async (column: string, bins: number = 30) => {
    const res = await fetch(
      `${API_BASE}/api/visualization/histogram?column=${column}&bins=${bins}`,
      { method: 'POST' }
    );
    return res.json();
  },

  createScatterPlot: async (xCol: string, yCol: string) => {
    const res = await fetch(
      `${API_BASE}/api/visualization/scatter?x_column=${xCol}&y_column=${yCol}`,
      { method: 'POST' }
    );
    return res.json();
  },

  getVisualizationOptions: async () => {
    const res = await fetch(`${API_BASE}/api/visualization/options`);
    return res.json();
  },
};
```

## 🔧 Configuration

### .env File
```env
DEBUG=True
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:3000
MAX_FILE_SIZE=104857600
ALLOWED_EXTENSIONS=csv,xlsx,xls,json
```

### Frontend .env
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📊 Response Formats

### Success Response
```json
{
  "status": "success",
  "message": "Operation completed",
  "data": {...}
}
```

### Error Response
```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

## 🐛 Common Issues

### 1. CORS Error
**Solution:** Add frontend URL to CORS_ORIGINS in backend/.env

### 2. No Dataset Loaded
**Solution:** Upload dataset first using /api/dataset/upload

### 3. Column Not Found
**Solution:** Check available columns using /api/dataset/info

### 4. Type Error
**Solution:** Ensure numeric columns for numeric operations

## 📚 Documentation Links

- **Full API Docs**: http://localhost:8000/docs
- **Interactive Testing**: http://localhost:8000/docs (Swagger UI)
- **Alternative Docs**: http://localhost:8000/redoc

## 🎯 Testing Endpoints

### Using curl
```bash
# Health check
curl http://localhost:8000/api/health

# Get capabilities
curl http://localhost:8000/api/capabilities

# Upload dataset
curl -X POST http://localhost:8000/api/dataset/upload \
  -F "file=@sample_data.csv"

# Get dataset info
curl http://localhost:8000/api/dataset/info

# Descriptive analysis
curl -X POST http://localhost:8000/api/analysis/descriptive \
  -H "Content-Type: application/json" \
  -d '{"analysis_type":"descriptive","parameters":{}}'
```

### Using Postman
1. Import collection from `/docs`
2. Set base URL: `http://localhost:8000`
3. Test endpoints interactively

## 💡 Tips

1. **Always check health endpoint first**
2. **Upload dataset before any analysis**
3. **Use /api/dataset/info to see available columns**
4. **Check /api/capabilities for supported operations**
5. **Use Swagger UI for interactive testing**
6. **Handle errors gracefully in frontend**
7. **Cache dataset info to reduce API calls**

---

**Quick Links:**
- [Full Documentation](./BACKEND_API_DOCUMENTATION.md)
- [Installation Guide](./INSTALLATION_GUIDE.md)
- [Main README](../README.md)
