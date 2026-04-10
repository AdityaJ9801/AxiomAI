# AXIOM AI Backend API Documentation

## 📋 Table of Contents
- [Overview](#overview)
- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Code Examples](#code-examples)

## 🎯 Overview

The AXIOM AI Backend API is a comprehensive FastAPI-based REST API that provides:
- Dataset upload and management
- Statistical analysis (descriptive, regression, time series)
- Data quality assessment and cleaning
- Data visualization generation
- Report creation and export

### Technology Stack
- **Framework**: FastAPI 
- **Data Processing**: Pandas, NumPy
- **Analysis**: Scikit-learn, Statsmodels
- **Visualization**: Plotly
- **Documentation**: Swagger UI (auto-generated)

## 🚀 Getting Started

### Prerequisites
```bash
# Python 3.9 or higher
python --version

# Install dependencies
cd backend
pip install -r requirements.txt
```

### Starting the Server
```bash
# Development mode (with auto-reload)
python start_server.py

# Or directly with uvicorn
uvicorn backend_api:app --reload --host 0.0.0.0 --port 8000
```

### Verify Server is Running
```bash
# Health check
curl http://localhost:8000/api/health

# View API documentation
# Open browser: http://localhost:8000/docs
```

## 🔐 Authentication

Currently, the API does not require authentication. For production deployment:
- Implement JWT tokens
- Add API key authentication
- Configure CORS properly

## 🌐 Base URL

```
Development: http://localhost:8000
Production: https://your-domain.com
```

## 📡 API Endpoints

### Health & Capabilities

#### GET /api/health
Check if the API server is running.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-04-10T12:00:00",
  "version": "1.0.0"
}
```

#### GET /api/capabilities
Get available API capabilities and endpoints.

**Response:**
```json
{
  "capabilities": {
    "data_upload": ["CSV", "Excel", "JSON"],
    "analysis_types": ["descriptive", "regression", "timeseries"],
    "cleaning_operations": ["missing_values", "duplicates", "outliers"],
    "visualization_types": ["histogram", "scatter", "line"],
    "export_formats": ["CSV", "Excel", "JSON", "Word", "PDF"]
  }
}
```

---

### Dataset Management

#### POST /api/dataset/upload
Upload a dataset file for analysis.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: Form data with file field

**Supported Formats:**
- CSV (.csv)
- Excel (.xlsx, .xls)
- JSON (.json)

**Example (JavaScript):**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:8000/api/dataset/upload', {
  method: 'POST',
  body: formData
});

const data = await response.json();
```

**Response:**
```json
{
  "status": "success",
  "message": "Dataset uploaded successfully: 1250 rows × 6 columns",
  "dataset_info": {
    "shape": [1250, 6],
    "columns": ["Date", "Revenue", "Customers", "Region"],
    "dtypes": {
      "Date": "datetime64[ns]",
      "Revenue": "float64",
      "Customers": "int64",
      "Region": "object"
    },
    "memory_usage_mb": 0.058,
    "missing_values": {
      "Date": 0,
      "Revenue": 47,
      "Customers": 0,
      "Region": 0
    },
    "sample_data": [...]
  }
}
```


#### GET /api/dataset/info
Get information about the currently loaded dataset.

**Response:**
```json
{
  "shape": [1250, 6],
  "columns": ["Date", "Revenue", "Customers", "Region"],
  "dtypes": {...},
  "memory_usage_mb": 0.058,
  "missing_values": {...},
  "sample_data": [...],
  "statistical_summary": {...}
}
```

#### GET /api/dataset/sample/{n}
Get first N rows of the dataset.

**Parameters:**
- `n` (path): Number of rows to return (default: 10)

**Response:**
```json
{
  "sample_data": [...],
  "total_rows": 1250
}
```

---

### Data Analysis

#### POST /api/analysis/descriptive
Perform descriptive statistical analysis.

**Request Body:**
```json
{
  "analysis_type": "descriptive",
  "parameters": {}
}
```

**Response:**
```json
{
  "status": "success",
  "results": {
    "numeric_summary": {
      "Revenue": {
        "count": 1250,
        "mean": 45678.32,
        "std": 12345.67,
        "min": 15000.00,
        "25%": 35000.00,
        "50%": 44500.00,
        "75%": 55000.00,
        "max": 85000.00
      }
    },
    "categorical_summary": {
      "Region": {
        "North": 350,
        "South": 320,
        "East": 290,
        "West": 290
      }
    },
    "correlation_matrix": {
      "Revenue": {"Revenue": 1.0, "Customers": 0.78},
      "Customers": {"Revenue": 0.78, "Customers": 1.0}
    },
    "missing_values": {...},
    "data_types": {...}
  }
}
```

#### POST /api/analysis/regression
Perform linear regression analysis.

**Request Body:**
```json
{
  "analysis_type": "regression",
  "parameters": {
    "dependent_variable": "Revenue",
    "independent_variables": ["Customers", "Marketing_Spend"]
  }
}
```

**Response:**
```json
{
  "status": "success",
  "results": {
    "coefficients": {
      "Customers": 123.45,
      "Marketing_Spend": 2.34
    },
    "intercept": 5000.00,
    "r_squared": 0.8234,
    "mse": 1234567.89,
    "n_observations": 1203,
    "dependent_variable": "Revenue",
    "independent_variables": ["Customers", "Marketing_Spend"]
  }
}
```

#### POST /api/analysis/timeseries
Perform time series analysis and forecasting.

**Request Body:**
```json
{
  "analysis_type": "timeseries",
  "parameters": {
    "date_column": "Date",
    "value_column": "Revenue",
    "forecast_periods": 12
  }
}
```

**Response:**
```json
{
  "status": "success",
  "results": {
    "series_length": 1250,
    "start_date": "2020-01-01",
    "end_date": "2024-04-10",
    "mean": 45678.32,
    "std": 12345.67,
    "trend": "increasing",
    "historical_data": [...],
    "forecast": {
      "periods": 12,
      "values": [48000, 49000, 50000, ...],
      "dates": ["2024-05-01", "2024-06-01", ...]
    }
  }
}
```

---

### Data Quality & Cleaning

#### GET /api/cleaning/quality-report
Get comprehensive data quality report.

**Response:**
```json
{
  "status": "success",
  "report": {
    "data_quality_score": 94,
    "total_rows": 1250,
    "total_columns": 6,
    "issues": {
      "missing_values": {
        "Revenue": 47,
        "total": 47
      },
      "duplicates": 12,
      "outliers": {
        "Revenue": 23,
        "Customers": 15
      }
    },
    "recommendations": [
      "Fix 47 missing values in Revenue column",
      "Remove 12 duplicate rows",
      "Review 38 outliers across numeric columns"
    ]
  }
}
```

#### GET /api/cleaning/suggestions
Get automated cleaning suggestions.

**Response:**
```json
{
  "status": "success",
  "suggestions": [
    {
      "operation": "fix_missing_values",
      "column": "Revenue",
      "strategy": "median",
      "priority": "high",
      "description": "Fill 47 missing values with median"
    },
    {
      "operation": "remove_duplicates",
      "priority": "medium",
      "description": "Remove 12 duplicate rows"
    }
  ]
}
```

#### POST /api/cleaning/fix-missing
Fix missing values in the dataset.

**Request Body:**
```json
{
  "operation": "fix_missing",
  "parameters": {
    "strategy": "median",
    "column": "Revenue",
    "fill_value": null
  }
}
```

**Strategies:**
- `mean`: Fill with column mean
- `median`: Fill with column median
- `mode`: Fill with most frequent value
- `forward_fill`: Forward fill
- `backward_fill`: Backward fill
- `constant`: Fill with specific value
- `auto`: Automatically choose best strategy

**Response:**
```json
{
  "status": "success",
  "result": {
    "operation": "fix_missing_values",
    "before_count": 47,
    "after_count": 0,
    "strategy_used": "median",
    "fill_value": 44500.00
  }
}
```

#### POST /api/cleaning/remove-duplicates
Remove duplicate rows from the dataset.

**Request Body:**
```json
{
  "operation": "remove_duplicates",
  "parameters": {
    "subset": null,
    "keep": "first"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "result": {
    "operation": "remove_duplicates",
    "before_count": 1250,
    "after_count": 1238,
    "duplicates_removed": 12
  }
}
```

#### POST /api/cleaning/handle-outliers
Handle outliers in numeric columns.

**Request Body:**
```json
{
  "operation": "handle_outliers",
  "parameters": {
    "method": "iqr",
    "columns": ["Revenue", "Customers"],
    "threshold": 1.5
  }
}
```

**Methods:**
- `iqr`: Interquartile range method
- `zscore`: Z-score method
- `isolation_forest`: Isolation forest algorithm

**Response:**
```json
{
  "status": "success",
  "result": {
    "operation": "handle_outliers",
    "method": "iqr",
    "outliers_handled": 38,
    "columns_processed": ["Revenue", "Customers"]
  }
}
```

#### POST /api/cleaning/automated
Apply automated cleaning based on detected issues.

**Query Parameters:**
- `aggressive` (boolean): Apply aggressive cleaning (default: false)

**Response:**
```json
{
  "status": "success",
  "operations_performed": [
    "Fixed missing values: 47 values",
    "Removed duplicates: 12 rows",
    "Fixed data types: 2 columns"
  ],
  "final_quality_score": 98
}
```

---

### Visualization

#### POST /api/visualization/histogram
Create histogram for a numeric column.

**Query Parameters:**
- `column` (string): Column name
- `bins` (integer): Number of bins (default: 30)

**Response:**
```json
{
  "chart_type": "histogram",
  "column": "Revenue",
  "data": [
    {
      "bin_start": 15000.0,
      "bin_end": 17500.0,
      "count": 45,
      "label": "15000.00-17500.00"
    },
    ...
  ],
  "statistics": {
    "mean": 45678.32,
    "std": 12345.67,
    "min": 15000.00,
    "max": 85000.00,
    "count": 1203
  }
}
```

#### POST /api/visualization/scatter
Create scatter plot between two columns.

**Query Parameters:**
- `x_column` (string): X-axis column name
- `y_column` (string): Y-axis column name

**Response:**
```json
{
  "chart_type": "scatter",
  "x_column": "Customers",
  "y_column": "Revenue",
  "data": [
    {"x": 150, "y": 35000},
    {"x": 200, "y": 45000},
    ...
  ],
  "correlation": 0.78,
  "statistics": {
    "x_stats": {...},
    "y_stats": {...}
  }
}
```

#### POST /api/visualization/line
Create line chart between two columns.

**Query Parameters:**
- `x_column` (string): X-axis column name
- `y_column` (string): Y-axis column name

**Response:**
```json
{
  "chart_type": "line",
  "x_column": "Date",
  "y_column": "Revenue",
  "data": [
    {"x": "2024-01-01", "y": 45000},
    {"x": "2024-01-02", "y": 46000},
    ...
  ],
  "data_types": {
    "x_type": "datetime64[ns]",
    "y_type": "float64"
  }
}
```

#### GET /api/visualization/options
Get available visualization options based on current dataset.

**Response:**
```json
{
  "columns": {
    "numeric": ["Revenue", "Customers", "Marketing_Spend"],
    "categorical": ["Region", "Product_Category"],
    "date": ["Date"]
  },
  "suggestions": [
    {
      "type": "correlation_matrix",
      "title": "Correlation Matrix",
      "description": "Shows relationships between all numeric variables",
      "columns": ["Revenue", "Customers", "Marketing_Spend"]
    },
    {
      "type": "time_series",
      "title": "Time Series",
      "description": "Analyze trends over time",
      "date_columns": ["Date"],
      "numeric_columns": ["Revenue", "Customers"]
    }
  ]
}
```

---

### Report Generation

#### POST /api/reports/create
Create a new report.

**Request Body:**
```json
{
  "title": "Economic Analysis Report",
  "author": "Data Analyst",
  "sections": [
    {
      "heading": "Executive Summary",
      "content": "This report analyzes...",
      "section_type": "text"
    },
    {
      "heading": "Key Findings",
      "content": "- Revenue increased by 12%\n- Customer growth of 8%",
      "section_type": "markdown"
    }
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Report created successfully"
}
```

#### GET /api/reports/data
Get current report data.

**Response:**
```json
{
  "status": "success",
  "report_data": {
    "title": "Economic Analysis Report",
    "author": "Data Analyst",
    "created_date": "2024-04-10",
    "sections": [...]
  }
}
```

#### POST /api/reports/export/word
Export report to Word document.

**Query Parameters:**
- `filename` (string): Output filename (default: "economic_analysis_report.docx")

**Response:**
- File download (application/vnd.openxmlformats-officedocument.wordprocessingml.document)

#### POST /api/reports/export/pdf
Export report to PDF document.

**Query Parameters:**
- `filename` (string): Output filename (default: "economic_analysis_report.pdf")

**Response:**
- File download (application/pdf)

---

## 📊 Data Models

### DatasetInfo
```typescript
interface DatasetInfo {
  shape: [number, number];
  columns: string[];
  dtypes: Record<string, string>;
  memory_usage_mb: number;
  missing_values: Record<string, number>;
  sample_data: Array<Record<string, any>>;
}
```

### AnalysisRequest
```typescript
interface AnalysisRequest {
  analysis_type: 'descriptive' | 'regression' | 'timeseries';
  parameters: {
    // For regression
    dependent_variable?: string;
    independent_variables?: string[];
    
    // For timeseries
    date_column?: string;
    value_column?: string;
    forecast_periods?: number;
  };
}
```

### CleaningRequest
```typescript
interface CleaningRequest {
  operation: 'fix_missing' | 'remove_duplicates' | 'handle_outliers';
  parameters: {
    // For fix_missing
    strategy?: 'mean' | 'median' | 'mode' | 'forward_fill' | 'backward_fill' | 'constant' | 'auto';
    column?: string;
    fill_value?: any;
    
    // For remove_duplicates
    subset?: string[];
    keep?: 'first' | 'last' | false;
    
    // For handle_outliers
    method?: 'iqr' | 'zscore' | 'isolation_forest';
    columns?: string[];
    threshold?: number;
  };
}
```

---

## ⚠️ Error Handling

### Error Response Format
```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "detail": "Additional details (optional)"
}
```

### Common HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid request parameters |
| 404 | Not Found | Resource not found (e.g., no dataset loaded) |
| 500 | Internal Server Error | Server-side error |

### Common Errors

#### No Dataset Loaded
```json
{
  "error": "No dataset loaded",
  "message": "Please upload a dataset first"
}
```

**Solution:** Upload a dataset using `/api/dataset/upload`

#### Invalid Column Name
```json
{
  "error": "Column not found",
  "message": "Column 'InvalidColumn' not found in dataset"
}
```

**Solution:** Check available columns using `/api/dataset/info`

#### Data Type Mismatch
```json
{
  "error": "Type error",
  "message": "Column 'Region' is not numeric"
}
```

**Solution:** Ensure you're using numeric columns for numeric operations

---

## 💻 Code Examples

### React/TypeScript Example

```typescript
// API client setup
const API_BASE_URL = 'http://localhost:8000';

// Upload dataset
async function uploadDataset(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE_URL}/api/dataset/upload`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Upload failed');
  }
  
  return await response.json();
}

// Get dataset info
async function getDatasetInfo() {
  const response = await fetch(`${API_BASE_URL}/api/dataset/info`);
  
  if (!response.ok) {
    throw new Error('Failed to get dataset info');
  }
  
  return await response.json();
}

// Perform descriptive analysis
async function performDescriptiveAnalysis() {
  const response = await fetch(`${API_BASE_URL}/api/analysis/descriptive`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      analysis_type: 'descriptive',
      parameters: {},
    }),
  });
  
  if (!response.ok) {
    throw new Error('Analysis failed');
  }
  
  return await response.json();
}

// Perform regression analysis
async function performRegression(
  dependentVar: string,
  independentVars: string[]
) {
  const response = await fetch(`${API_BASE_URL}/api/analysis/regression`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      analysis_type: 'regression',
      parameters: {
        dependent_variable: dependentVar,
        independent_variables: independentVars,
      },
    }),
  });
  
  if (!response.ok) {
    throw new Error('Regression analysis failed');
  }
  
  return await response.json();
}

// Fix missing values
async function fixMissingValues(
  column: string,
  strategy: string = 'median'
) {
  const response = await fetch(`${API_BASE_URL}/api/cleaning/fix-missing`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      operation: 'fix_missing',
      parameters: {
        strategy,
        column,
      },
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fix missing values');
  }
  
  return await response.json();
}

// Create histogram
async function createHistogram(column: string, bins: number = 30) {
  const response = await fetch(
    `${API_BASE_URL}/api/visualization/histogram?column=${column}&bins=${bins}`,
    {
      method: 'POST',
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to create histogram');
  }
  
  return await response.json();
}
```

### Axios Example

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Upload dataset
export const uploadDataset = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const { data } = await api.post('/api/dataset/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return data;
};

// Get dataset info
export const getDatasetInfo = async () => {
  const { data } = await api.get('/api/dataset/info');
  return data;
};

// Perform analysis
export const performAnalysis = async (
  analysisType: string,
  parameters: any
) => {
  const { data } = await api.post(`/api/analysis/${analysisType}`, {
    analysis_type: analysisType,
    parameters,
  });
  
  return data;
};

// Get quality report
export const getQualityReport = async () => {
  const { data } = await api.get('/api/cleaning/quality-report');
  return data;
};

// Apply automated cleaning
export const applyAutomatedCleaning = async (aggressive: boolean = false) => {
  const { data } = await api.post(
    `/api/cleaning/automated?aggressive=${aggressive}`
  );
  
  return data;
};
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
DEBUG=True
API_HOST=0.0.0.0
API_PORT=8000

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# File Upload Configuration
MAX_FILE_SIZE=104857600  # 100MB
ALLOWED_EXTENSIONS=csv,xlsx,xls,json

# Processing Limits
MAX_DATASET_ROWS=1000000
MAX_ANALYSIS_TIME=300

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/api.log
```

### CORS Configuration

For production, update CORS settings in `backend_api.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📝 Best Practices

### 1. Error Handling
Always wrap API calls in try-catch blocks:

```typescript
try {
  const data = await uploadDataset(file);
  console.log('Upload successful:', data);
} catch (error) {
  console.error('Upload failed:', error);
  // Show user-friendly error message
}
```

### 2. Loading States
Show loading indicators during API calls:

```typescript
const [loading, setLoading] = useState(false);

async function loadData() {
  setLoading(true);
  try {
    const data = await getDatasetInfo();
    // Process data
  } catch (error) {
    // Handle error
  } finally {
    setLoading(false);
  }
}
```

### 3. Data Validation
Validate data before sending to API:

```typescript
function validateAnalysisParams(params: any) {
  if (!params.dependent_variable) {
    throw new Error('Dependent variable is required');
  }
  
  if (!params.independent_variables || params.independent_variables.length === 0) {
    throw new Error('At least one independent variable is required');
  }
}
```

### 4. Caching
Cache frequently accessed data:

```typescript
const datasetInfoCache = new Map();

async function getCachedDatasetInfo() {
  if (datasetInfoCache.has('current')) {
    return datasetInfoCache.get('current');
  }
  
  const data = await getDatasetInfo();
  datasetInfoCache.set('current', data);
  return data;
}
```

---

## 🐛 Troubleshooting

### Server Won't Start

**Problem:** `ModuleNotFoundError: No module named 'fastapi'`

**Solution:**
```bash
pip install -r requirements.txt
```

### CORS Errors

**Problem:** `Access to fetch at 'http://localhost:8000' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Solution:** Add your frontend URL to CORS_ORIGINS in `.env` file

### Upload Fails

**Problem:** `413 Request Entity Too Large`

**Solution:** Increase MAX_FILE_SIZE in `.env` or compress your dataset

### Analysis Timeout

**Problem:** `504 Gateway Timeout`

**Solution:** Increase MAX_ANALYSIS_TIME in `.env` or reduce dataset size

---

## 📚 Additional Resources

- **API Documentation**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Pandas Docs**: https://pandas.pydata.org/docs/

---

## 🆘 Support

For issues or questions:
1. Check the API documentation at `/docs`
2. Review error messages in server logs
3. Verify dataset format and column names
4. Test endpoints using Swagger UI

---

**Last Updated:** April 2026  
**API Version:** 1.0.0  
**Maintained By:** AXIOM AI Team
