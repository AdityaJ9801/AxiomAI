# Frontend Developer Guide - AXIOM AI Backend Integration

## 🎯 Overview

This guide provides everything a frontend developer needs to integrate with the AXIOM AI backend API.

## 📋 Prerequisites

- Backend server running on `http://localhost:8000`
- Basic understanding of REST APIs
- Familiarity with async/await in JavaScript/TypeScript

## 🚀 Quick Start

### 1. Verify Backend is Running

```bash
# Check health endpoint
curl http://localhost:8000/api/health

# Expected response:
# {"status":"healthy","timestamp":"2024-04-10T12:00:00","version":"1.0.0"}
```

### 2. Configure Frontend

Add to your `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Test Connection

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

async function testConnection() {
  try {
    const response = await fetch(`${API_BASE}/api/health`);
    const data = await response.json();
    console.log('Backend connected:', data);
  } catch (error) {
    console.error('Backend connection failed:', error);
  }
}
```

## 📡 Core Workflows

### Workflow 1: Upload and Analyze Dataset

```typescript
// 1. Upload dataset
async function uploadDataset(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE}/api/dataset/upload`, {
    method: 'POST',
    body: formData,
  });
  
  const data = await response.json();
  return data.dataset_info;
}

// 2. Get dataset information
async function getDatasetInfo() {
  const response = await fetch(`${API_BASE}/api/dataset/info`);
  return await response.json();
}

// 3. Perform descriptive analysis
async function analyzeDataset() {
  const response = await fetch(`${API_BASE}/api/analysis/descriptive`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      analysis_type: 'descriptive',
      parameters: {},
    }),
  });
  
  return await response.json();
}

// Complete workflow
async function completeAnalysisWorkflow(file: File) {
  try {
    // Step 1: Upload
    const datasetInfo = await uploadDataset(file);
    console.log('Dataset uploaded:', datasetInfo);
    
    // Step 2: Get full info
    const fullInfo = await getDatasetInfo();
    console.log('Dataset info:', fullInfo);
    
    // Step 3: Analyze
    const analysis = await analyzeDataset();
    console.log('Analysis results:', analysis);
    
    return { datasetInfo, fullInfo, analysis };
  } catch (error) {
    console.error('Workflow failed:', error);
    throw error;
  }
}
```

### Workflow 2: Data Quality Check and Cleaning

```typescript
// 1. Get quality report
async function getQualityReport() {
  const response = await fetch(`${API_BASE}/api/cleaning/quality-report`);
  return await response.json();
}

// 2. Get cleaning suggestions
async function getCleaningSuggestions() {
  const response = await fetch(`${API_BASE}/api/cleaning/suggestions`);
  return await response.json();
}

// 3. Fix missing values
async function fixMissingValues(column: string, strategy: string = 'median') {
  const response = await fetch(`${API_BASE}/api/cleaning/fix-missing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'fix_missing',
      parameters: { strategy, column },
    }),
  });
  
  return await response.json();
}

// 4. Apply automated cleaning
async function applyAutomatedCleaning(aggressive: boolean = false) {
  const response = await fetch(
    `${API_BASE}/api/cleaning/automated?aggressive=${aggressive}`,
    { method: 'POST' }
  );
  
  return await response.json();
}

// Complete cleaning workflow
async function completeCleaningWorkflow() {
  try {
    // Step 1: Get quality report
    const qualityReport = await getQualityReport();
    console.log('Quality score:', qualityReport.report.data_quality_score);
    
    // Step 2: Get suggestions
    const suggestions = await getCleaningSuggestions();
    console.log('Suggestions:', suggestions);
    
    // Step 3: Apply automated cleaning
    const cleaningResult = await applyAutomatedCleaning(false);
    console.log('Cleaning complete:', cleaningResult);
    
    return { qualityReport, suggestions, cleaningResult };
  } catch (error) {
    console.error('Cleaning workflow failed:', error);
    throw error;
  }
}
```

### Workflow 3: Statistical Analysis

```typescript
// Regression analysis
async function performRegression(
  dependentVar: string,
  independentVars: string[]
) {
  const response = await fetch(`${API_BASE}/api/analysis/regression`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      analysis_type: 'regression',
      parameters: {
        dependent_variable: dependentVar,
        independent_variables: independentVars,
      },
    }),
  });
  
  return await response.json();
}

// Time series analysis
async function performTimeSeries(
  dateColumn: string,
  valueColumn: string,
  forecastPeriods: number = 12
) {
  const response = await fetch(`${API_BASE}/api/analysis/timeseries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      analysis_type: 'timeseries',
      parameters: {
        date_column: dateColumn,
        value_column: valueColumn,
        forecast_periods: forecastPeriods,
      },
    }),
  });
  
  return await response.json();
}

// Example usage
async function runStatisticalAnalysis() {
  try {
    // Regression: Predict Revenue based on Customers
    const regressionResult = await performRegression(
      'Revenue',
      ['Customers', 'Marketing_Spend']
    );
    console.log('R² Score:', regressionResult.results.r_squared);
    
    // Time series: Forecast Revenue
    const timeSeriesResult = await performTimeSeries(
      'Date',
      'Revenue',
      12
    );
    console.log('Forecast:', timeSeriesResult.results.forecast);
    
    return { regressionResult, timeSeriesResult };
  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  }
}
```

## 🎨 React Components

### Upload Component

```typescript
import { useState } from 'react';

export function DatasetUploader() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [datasetInfo, setDatasetInfo] = useState<any>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dataset/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setDatasetInfo(data.dataset_info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".csv,.xlsx,.xls,.json"
        onChange={handleUpload}
        disabled={uploading}
      />
      
      {uploading && <p>Uploading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {datasetInfo && (
        <div>
          <h3>Dataset Uploaded</h3>
          <p>Rows: {datasetInfo.shape[0]}</p>
          <p>Columns: {datasetInfo.shape[1]}</p>
          <p>Quality Score: {datasetInfo.quality_score}%</p>
        </div>
      )}
    </div>
  );
}
```

### Analysis Component

```typescript
import { useState, useEffect } from 'react';

export function DescriptiveAnalysis() {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/analysis/descriptive`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            analysis_type: 'descriptive',
            parameters: {},
          }),
        }
      );

      const data = await response.json();
      setAnalysis(data.results);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={runAnalysis} disabled={loading}>
        {loading ? 'Analyzing...' : 'Run Analysis'}
      </button>

      {analysis && (
        <div>
          <h3>Descriptive Statistics</h3>
          {Object.entries(analysis.numeric_summary).map(([col, stats]: [string, any]) => (
            <div key={col}>
              <h4>{col}</h4>
              <p>Mean: {stats.mean?.toFixed(2)}</p>
              <p>Std: {stats.std?.toFixed(2)}</p>
              <p>Min: {stats.min?.toFixed(2)}</p>
              <p>Max: {stats.max?.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Quality Check Component

```typescript
import { useState, useEffect } from 'react';

export function QualityChecker() {
  const [qualityReport, setQualityReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadQualityReport();
  }, []);

  const loadQualityReport = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cleaning/quality-report`
      );
      
      const data = await response.json();
      setQualityReport(data.report);
    } catch (error) {
      console.error('Failed to load quality report:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyAutomatedCleaning = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cleaning/automated`,
        { method: 'POST' }
      );
      
      const data = await response.json();
      console.log('Cleaning complete:', data);
      
      // Reload quality report
      await loadQualityReport();
    } catch (error) {
      console.error('Cleaning failed:', error);
    }
  };

  if (loading) return <p>Loading quality report...</p>;

  return (
    <div>
      {qualityReport && (
        <>
          <h3>Data Quality Score: {qualityReport.data_quality_score}%</h3>
          
          <div>
            <h4>Issues Found:</h4>
            <p>Missing Values: {qualityReport.issues?.missing_values?.total || 0}</p>
            <p>Duplicates: {qualityReport.issues?.duplicates || 0}</p>
          </div>

          <button onClick={applyAutomatedCleaning}>
            Apply Automated Cleaning
          </button>
        </>
      )}
    </div>
  );
}
```

## 🔧 Custom Hooks

### useDataset Hook

```typescript
import { useState, useCallback } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export function useDataset() {
  const [dataset, setDataset] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadDataset = useCallback(async (file: File) => {
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
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getDatasetInfo = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/dataset/info`);
      
      if (!response.ok) throw new Error('Failed to get dataset info');

      const data = await response.json();
      setDataset(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get dataset info';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    dataset,
    loading,
    error,
    uploadDataset,
    getDatasetInfo,
  };
}
```

### useAnalysis Hook

```typescript
import { useState, useCallback } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export function useAnalysis() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performDescriptive = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/analysis/descriptive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis_type: 'descriptive',
          parameters: {},
        }),
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      setResults(data.results);
      return data.results;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const performRegression = useCallback(async (
    dependentVar: string,
    independentVars: string[]
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/analysis/regression`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis_type: 'regression',
          parameters: {
            dependent_variable: dependentVar,
            independent_variables: independentVars,
          },
        }),
      });

      if (!response.ok) throw new Error('Regression failed');

      const data = await response.json();
      setResults(data.results);
      return data.results;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Regression failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    results,
    loading,
    error,
    performDescriptive,
    performRegression,
  };
}
```

## ⚠️ Error Handling

### Comprehensive Error Handler

```typescript
interface ApiError {
  error: string;
  message: string;
  detail?: string;
}

async function handleApiCall<T>(
  apiCall: () => Promise<Response>
): Promise<T> {
  try {
    const response = await apiCall();

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.message || 'API call failed');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      // Network error or parsing error
      console.error('API Error:', error.message);
      throw error;
    }
    throw new Error('Unknown error occurred');
  }
}

// Usage
async function uploadWithErrorHandling(file: File) {
  try {
    const data = await handleApiCall<any>(() =>
      fetch(`${API_BASE}/api/dataset/upload`, {
        method: 'POST',
        body: (() => {
          const formData = new FormData();
          formData.append('file', file);
          return formData;
        })(),
      })
    );

    return data;
  } catch (error) {
    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('No dataset loaded')) {
        alert('Please upload a dataset first');
      } else if (error.message.includes('Column not found')) {
        alert('Invalid column name');
      } else {
        alert(`Error: ${error.message}`);
      }
    }
    throw error;
  }
}
```

## 💡 Best Practices

### 1. Always Check Backend Health

```typescript
async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE}/api/health`);
    const data = await response.json();
    return data.status === 'healthy';
  } catch {
    return false;
  }
}

// Use in app initialization
useEffect(() => {
  checkBackendHealth().then(isHealthy => {
    if (!isHealthy) {
      console.error('Backend is not available');
      // Show error message to user
    }
  });
}, []);
```

### 2. Cache Dataset Info

```typescript
const datasetCache = new Map<string, any>();

async function getCachedDatasetInfo() {
  const cacheKey = 'current_dataset';
  
  if (datasetCache.has(cacheKey)) {
    return datasetCache.get(cacheKey);
  }

  const data = await fetch(`${API_BASE}/api/dataset/info`).then(r => r.json());
  datasetCache.set(cacheKey, data);
  
  return data;
}
```

### 3. Show Loading States

```typescript
function AnalysisButton() {
  const [loading, setLoading] = useState(false);

  const handleAnalysis = async () => {
    setLoading(true);
    try {
      await performAnalysis();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleAnalysis} disabled={loading}>
      {loading ? 'Analyzing...' : 'Run Analysis'}
    </button>
  );
}
```

### 4. Validate Before API Calls

```typescript
function validateRegressionParams(
  dependentVar: string,
  independentVars: string[]
): string | null {
  if (!dependentVar) {
    return 'Dependent variable is required';
  }

  if (independentVars.length === 0) {
    return 'At least one independent variable is required';
  }

  if (independentVars.includes(dependentVar)) {
    return 'Dependent variable cannot be in independent variables';
  }

  return null;
}

// Usage
const error = validateRegressionParams(depVar, indepVars);
if (error) {
  alert(error);
  return;
}

await performRegression(depVar, indepVars);
```

## 🐛 Common Issues & Solutions

### Issue 1: CORS Error

**Error:** `Access to fetch has been blocked by CORS policy`

**Solution:**
1. Check backend `.env` file has your frontend URL in CORS_ORIGINS
2. Restart backend server after changing `.env`

### Issue 2: 404 No Dataset Loaded

**Error:** `{"error": "No dataset loaded"}`

**Solution:**
```typescript
// Always upload dataset first
await uploadDataset(file);
// Then perform operations
await performAnalysis();
```

### Issue 3: Column Not Found

**Error:** `{"error": "Column 'InvalidColumn' not found"}`

**Solution:**
```typescript
// Get available columns first
const info = await getDatasetInfo();
const availableColumns = info.columns;
console.log('Available columns:', availableColumns);
```

## 📚 Additional Resources

- **Full API Documentation:** [BACKEND_API_DOCUMENTATION.md](./BACKEND_API_DOCUMENTATION.md)
- **Quick Reference:** [BACKEND_QUICK_REFERENCE.md](./BACKEND_QUICK_REFERENCE.md)
- **Interactive API Docs:** http://localhost:8000/docs (when server running)

---

**Need Help?**
1. Check API documentation at `/docs`
2. Verify backend is running with `/api/health`
3. Check browser console for errors
4. Review server logs in `backend/logs/`

**Last Updated:** April 2026
