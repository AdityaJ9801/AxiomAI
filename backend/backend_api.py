#!/usr/bin/env python3
"""
Economic Analysis Backend API Server
Provides REST API endpoints for economic data analysis, cleaning, and reporting
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from typing import Dict, List, Any, Optional, Union
import pandas as pd
import numpy as np
import os
import tempfile
import json
from datetime import datetime
import uvicorn

# Import our MCP tools
from mcp_tools.data_processing import DataProcessingTool
from mcp_tools.data_cleaner import DataCleaner
from mcp_tools.report_editor import ReportEditor

# Custom JSON encoder to handle numpy types
def convert_numpy_types(obj):
    """Convert numpy types to native Python types for JSON serialization"""
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, pd.Series):
        return obj.to_dict()
    elif isinstance(obj, pd.DataFrame):
        return obj.to_dict('records')
    elif isinstance(obj, (pd.Timestamp, pd.DatetimeIndex)):
        return obj.isoformat() if hasattr(obj, 'isoformat') else str(obj)
    elif isinstance(obj, pd.Timedelta):
        return str(obj)
    elif isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    elif pd.isna(obj):
        return None
    elif hasattr(obj, 'isoformat'):  # datetime objects
        return obj.isoformat()
    elif hasattr(obj, 'item'):  # numpy scalars
        return obj.item()
    return obj

def safe_datetime_convert(obj):
    """Safely convert datetime objects to ISO format strings"""
    if isinstance(obj, (pd.Timestamp, pd.DatetimeIndex)):
        return obj.isoformat() if hasattr(obj, 'isoformat') else str(obj)
    elif isinstance(obj, pd.Timedelta):
        return str(obj)
    elif hasattr(obj, 'isoformat'):  # datetime objects
        return obj.isoformat()
    elif isinstance(obj, np.datetime64):
        return pd.Timestamp(obj).isoformat()
    return obj

def safe_datetime_convert(obj):
    """Safely convert datetime objects to ISO format strings"""
    if isinstance(obj, (pd.Timestamp, pd.DatetimeIndex)):
        return obj.isoformat() if hasattr(obj, 'isoformat') else str(obj)
    elif isinstance(obj, pd.Timedelta):
        return str(obj)
    elif hasattr(obj, 'isoformat'):  # datetime objects
        return obj.isoformat()
    elif isinstance(obj, np.datetime64):
        return pd.Timestamp(obj).isoformat()
    return obj

def prepare_dataframe_for_json(df):
    """Prepare a DataFrame for JSON serialization by converting all problematic types"""
    df_copy = df.copy()
    
    for col in df_copy.columns:
        if df_copy[col].dtype == 'datetime64[ns]' or pd.api.types.is_datetime64_any_dtype(df_copy[col]):
            # Convert datetime columns to ISO format strings
            df_copy[col] = df_copy[col].apply(lambda x: x.isoformat() if pd.notna(x) else None)
        elif df_copy[col].dtype == 'timedelta64[ns]':
            # Convert timedelta columns to strings
            df_copy[col] = df_copy[col].apply(lambda x: str(x) if pd.notna(x) else None)
    
    return df_copy

def safe_json_response(data):
    """Create a JSON response with proper numpy type conversion"""
    converted_data = convert_numpy_types(data)
    return JSONResponse(content=converted_data)

# Initialize FastAPI app
app = FastAPI(
    title="Economic Analysis Backend API",
    description="Comprehensive economic data analysis, cleaning, and reporting API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances
data_processor = DataProcessingTool()
data_cleaner = DataCleaner()
report_editor = ReportEditor()

# Pydantic models for request/response
class DatasetInfo(BaseModel):
    shape: tuple
    columns: List[str]
    dtypes: Dict[str, str]
    memory_usage_mb: float
    missing_values: Dict[str, int]
    sample_data: List[Dict[str, Any]]

class AnalysisRequest(BaseModel):
    analysis_type: str
    parameters: Dict[str, Any] = {}

class CleaningRequest(BaseModel):
    operation: str
    parameters: Dict[str, Any] = {}

class ReportRequest(BaseModel):
    title: str
    author: str = "Economic Analysis System"
    sections: List[Dict[str, Any]] = []

class ValidationRules(BaseModel):
    rules: Dict[str, Dict[str, Any]]

# Dataset Management Endpoints
@app.post("/api/dataset/upload")
async def upload_dataset(file: UploadFile = File(...)):
    """Upload and load a dataset for analysis"""
    try:
        # Save uploaded file temporarily
        temp_file = f"temp_{file.filename}"
        with open(temp_file, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Load dataset
        if temp_file.endswith('.csv'):
            df = pd.read_csv(temp_file)
        elif temp_file.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(temp_file)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
        
        # Store in data processor
        data_processor.data = df
        
        # Load in data cleaner for quality analysis
        cleaner_result = data_cleaner.load_data(temp_file)
        
        # Clean up temp file
        os.remove(temp_file)
        
        # Prepare sample data for JSON serialization
        sample_df = prepare_dataframe_for_json(df.head(5))
        
        # Return dataset info
        response_data = {
            "status": "success",
            "message": f"Dataset uploaded successfully: {df.shape[0]} rows × {df.shape[1]} columns",
            "dataset_info": {
                "shape": list(df.shape),
                "columns": df.columns.tolist(),
                "dtypes": {k: str(v) for k, v in df.dtypes.to_dict().items()},
                "memory_usage_mb": float(df.memory_usage(deep=True).sum() / (1024**2)),
                "missing_values": {k: int(v) for k, v in df.isnull().sum().to_dict().items()},
                "sample_data": convert_numpy_types(sample_df.to_dict('records'))
            },
            "quality_profile": convert_numpy_types(cleaner_result.get('profile', {}))
        }
        
        return safe_json_response(response_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload dataset: {str(e)}")

@app.get("/api/dataset/info")
async def get_dataset_info():
    """Get information about the currently loaded dataset"""
    if data_processor.data is None:
        raise HTTPException(status_code=404, detail="No dataset loaded")
    
    df = data_processor.data
    
    # Prepare sample data for JSON serialization
    sample_df = prepare_dataframe_for_json(df.head(10))
    stats_df = prepare_dataframe_for_json(df.describe())
    
    response_data = {
        "shape": list(df.shape),
        "columns": df.columns.tolist(),
        "dtypes": {k: str(v) for k, v in df.dtypes.to_dict().items()},
        "memory_usage_mb": float(df.memory_usage(deep=True).sum() / (1024**2)),
        "missing_values": {k: int(v) for k, v in df.isnull().sum().to_dict().items()},
        "sample_data": convert_numpy_types(sample_df.to_dict('records')),
        "statistical_summary": convert_numpy_types(stats_df.to_dict())
    }
    
    return safe_json_response(response_data)

@app.get("/api/dataset/sample/{n}")
async def get_dataset_sample(n: int = 10):
    """Get a sample of the dataset"""
    if data_processor.data is None:
        raise HTTPException(status_code=404, detail="No dataset loaded")
    
    df = data_processor.data
    sample_size = min(n, len(df))
    
    # Prepare sample data for JSON serialization
    sample_df = prepare_dataframe_for_json(df.head(sample_size))
    
    response_data = {
        "sample_data": convert_numpy_types(sample_df.to_dict('records')),
        "total_rows": int(len(df))
    }
    
    return safe_json_response(response_data)

# Data Analysis Endpoints
@app.post("/api/analysis/descriptive")
async def perform_descriptive_analysis(request: AnalysisRequest):
    """Perform descriptive statistical analysis"""
    if data_processor.data is None:
        raise HTTPException(status_code=404, detail="No dataset loaded")
    
    try:
        df = data_processor.data
        
        # Basic descriptive statistics
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        categorical_cols = df.select_dtypes(include=['object', 'category']).columns
        
        result = {
            "numeric_summary": convert_numpy_types(df[numeric_cols].describe().to_dict()) if len(numeric_cols) > 0 else {},
            "categorical_summary": {col: convert_numpy_types(df[col].value_counts().head(10).to_dict()) for col in categorical_cols},
            "correlation_matrix": convert_numpy_types(df[numeric_cols].corr().to_dict()) if len(numeric_cols) > 1 else {},
            "missing_values": {k: int(v) for k, v in df.isnull().sum().to_dict().items()},
            "data_types": {k: str(v) for k, v in df.dtypes.to_dict().items()}
        }
        
        return safe_json_response({"status": "success", "results": result})
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/api/analysis/regression")
async def perform_regression_analysis(request: AnalysisRequest):
    """Perform regression analysis"""
    if data_processor.data is None:
        raise HTTPException(status_code=404, detail="No dataset loaded")
    
    try:
        from sklearn.linear_model import LinearRegression
        from sklearn.metrics import r2_score, mean_squared_error
        
        df = data_processor.data
        params = request.parameters
        
        dependent_var = params.get('dependent_variable')
        independent_vars = params.get('independent_variables', [])
        
        if not dependent_var or not independent_vars:
            raise HTTPException(status_code=400, detail="Missing dependent or independent variables")
        
        # Prepare data
        X = df[independent_vars].dropna()
        y = df[dependent_var].dropna()
        
        # Align X and y
        common_index = X.index.intersection(y.index)
        X = X.loc[common_index]
        y = y.loc[common_index]
        
        # Fit regression model
        model = LinearRegression()
        model.fit(X, y)
        
        # Predictions
        y_pred = model.predict(X)
        
        # Results
        result = {
            "coefficients": {var: float(coef) for var, coef in zip(independent_vars, model.coef_)},
            "intercept": float(model.intercept_),
            "r_squared": float(r2_score(y, y_pred)),
            "mse": float(mean_squared_error(y, y_pred)),
            "n_observations": int(len(X)),
            "dependent_variable": dependent_var,
            "independent_variables": independent_vars
        }
        
        return safe_json_response({"status": "success", "results": result})
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Regression analysis failed: {str(e)}")

@app.post("/api/analysis/timeseries")
async def perform_timeseries_analysis(request: AnalysisRequest):
    """Perform time series analysis and forecasting"""
    if data_processor.data is None:
        raise HTTPException(status_code=404, detail="No dataset loaded")
    
    try:
        df = data_processor.data
        params = request.parameters
        
        date_column = params.get('date_column')
        value_column = params.get('value_column')
        forecast_periods = params.get('forecast_periods', 12)
        
        if not date_column or not value_column:
            raise HTTPException(status_code=400, detail="Missing date or value column")
        
        # Validate columns exist
        if date_column not in df.columns:
            raise HTTPException(status_code=400, detail=f"Date column '{date_column}' not found in dataset")
        
        if value_column not in df.columns:
            raise HTTPException(status_code=400, detail=f"Value column '{value_column}' not found in dataset")
        
        # Validate value column is numeric
        if not pd.api.types.is_numeric_dtype(df[value_column]):
            raise HTTPException(
                status_code=400, 
                detail=f"Value column '{value_column}' must be numeric for time series analysis"
            )
        
        # Prepare time series data
        ts_data = df[[date_column, value_column]].copy()
        
        # Enhanced datetime parsing with format inference
        try:
            # First, try to infer the format from a sample of the data
            sample_dates = ts_data[date_column].dropna().head(10)
            
            # Common date formats to try
            common_formats = [
                '%Y-%m-%d',
                '%Y/%m/%d', 
                '%d/%m/%Y',
                '%m/%d/%Y',
                '%Y-%m-%d %H:%M:%S',
                '%Y/%m/%d %H:%M:%S',
                '%d-%m-%Y',
                '%m-%d-%Y'
            ]
            
            # Try to find a working format
            working_format = None
            for fmt in common_formats:
                try:
                    pd.to_datetime(sample_dates.iloc[0], format=fmt)
                    # If successful, test with a few more samples
                    success_count = 0
                    for date_val in sample_dates.head(5):
                        try:
                            pd.to_datetime(date_val, format=fmt)
                            success_count += 1
                        except:
                            break
                    
                    if success_count >= min(3, len(sample_dates)):
                        working_format = fmt
                        break
                except:
                    continue
            
            # Parse dates with the identified format or let pandas infer
            if working_format:
                ts_data[date_column] = pd.to_datetime(ts_data[date_column], format=working_format, errors='coerce')
            else:
                # Use pandas inference but suppress the warning by being explicit about it
                ts_data[date_column] = pd.to_datetime(ts_data[date_column], infer_datetime_format=True, errors='coerce')
            
        except Exception as parse_error:
            # Fallback to basic parsing
            try:
                ts_data[date_column] = pd.to_datetime(ts_data[date_column], errors='coerce')
            except Exception as fallback_error:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Unable to parse date column '{date_column}'. Please ensure it contains valid dates. Error: {str(fallback_error)}"
                )
        
        # Check if we have any valid dates after parsing
        valid_dates = ts_data[date_column].notna().sum()
        if valid_dates == 0:
            raise HTTPException(
                status_code=400,
                detail=f"No valid dates found in column '{date_column}'. Please check the date format."
            )
        
        # Remove rows with invalid dates
        original_length = len(ts_data)
        ts_data = ts_data.dropna(subset=[date_column])
        
        if len(ts_data) < original_length:
            print(f"Warning: Removed {original_length - len(ts_data)} rows with invalid dates")
        
        # Set index and sort
        ts_data = ts_data.set_index(date_column).sort_index()
        ts_data = ts_data.dropna()
        
        # Validate minimum data requirements
        if len(ts_data) < 2:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient data for time series analysis. Need at least 2 valid data points, got {len(ts_data)}"
            )
        
        # Basic time series statistics
        result = {
            "series_length": int(len(ts_data)),
            "start_date": ts_data.index.min().isoformat(),
            "end_date": ts_data.index.max().isoformat(),
            "mean": float(ts_data[value_column].mean()),
            "std": float(ts_data[value_column].std()),
            "trend": "increasing" if ts_data[value_column].iloc[-1] > ts_data[value_column].iloc[0] else "decreasing",
            "historical_data": []
        }
        
        # Convert historical data with proper datetime handling
        historical_df = ts_data.reset_index()
        for _, row in historical_df.head(20).iterrows():  # Limit to first 20 rows for performance
            row_dict = {}
            for col, val in row.items():
                if pd.isna(val):
                    row_dict[col] = None
                elif isinstance(val, (pd.Timestamp, np.datetime64)):
                    row_dict[col] = pd.Timestamp(val).isoformat()
                elif isinstance(val, (np.integer, np.floating)):
                    row_dict[col] = float(val) if isinstance(val, np.floating) else int(val)
                else:
                    row_dict[col] = str(val)
            result["historical_data"].append(row_dict)
        
        # Simple forecast (linear trend)
        if len(ts_data) >= 2:
            from sklearn.linear_model import LinearRegression
            
            X = np.arange(len(ts_data)).reshape(-1, 1)
            y = ts_data[value_column].values
            
            model = LinearRegression()
            model.fit(X, y)
            
            # Generate forecast
            future_X = np.arange(len(ts_data), len(ts_data) + forecast_periods).reshape(-1, 1)
            forecast = model.predict(future_X)
            
            # Create future dates
            last_date = ts_data.index[-1]
            freq = 'D'  # Default to daily frequency
            
            # Try to infer frequency from the data more robustly
            freq = 'D'  # Default to daily frequency
            
            if len(ts_data) > 1:
                # Calculate multiple time differences to get a better estimate
                time_diffs = []
                for i in range(1, min(len(ts_data), 6)):  # Check up to 5 intervals
                    diff = ts_data.index[i] - ts_data.index[i-1]
                    time_diffs.append(diff.total_seconds())
                
                # Use the most common time difference
                if time_diffs:
                    avg_diff_seconds = sum(time_diffs) / len(time_diffs)
                    avg_diff_days = avg_diff_seconds / (24 * 3600)
                    
                    if avg_diff_days >= 28:  # Monthly or longer
                        freq = 'M'
                    elif avg_diff_days >= 6:  # Weekly
                        freq = 'W'
                    elif avg_diff_days >= 0.9:  # Daily (with some tolerance)
                        freq = 'D'
                    elif avg_diff_seconds >= 3300:  # Hourly (with tolerance)
                        freq = 'H'
                    else:  # Sub-hourly
                        freq = 'T'  # Minute frequency
            
            try:
                future_dates = pd.date_range(
                    start=last_date + pd.Timedelta(days=1), 
                    periods=forecast_periods, 
                    freq=freq
                )
            except Exception as freq_error:
                # Fallback to daily frequency if frequency detection fails
                print(f"Warning: Frequency detection failed ({freq_error}), using daily frequency")
                future_dates = pd.date_range(
                    start=last_date + pd.Timedelta(days=1), 
                    periods=forecast_periods, 
                    freq='D'
                )
            
            result["forecast"] = {
                "periods": int(forecast_periods),
                "values": [float(v) for v in forecast],
                "dates": [d.isoformat() for d in future_dates]
            }
        
        return safe_json_response({"status": "success", "results": result})
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Time series analysis failed: {str(e)}")

# Data Cleaning Endpoints
@app.get("/api/cleaning/quality-report")
async def get_data_quality_report():
    """Get comprehensive data quality report"""
    try:
        report = data_cleaner.get_cleaning_report()
        if 'error' in report:
            raise HTTPException(status_code=404, detail=report['error'])
        
        return safe_json_response({"status": "success", "report": convert_numpy_types(report)})
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate quality report: {str(e)}")

@app.get("/api/cleaning/suggestions")
async def get_cleaning_suggestions():
    """Get automated cleaning suggestions"""
    try:
        suggestions = data_cleaner.get_cleaning_suggestions()
        return safe_json_response({"status": "success", "suggestions": convert_numpy_types(suggestions)})
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get suggestions: {str(e)}")

@app.post("/api/cleaning/fix-missing")
async def fix_missing_values(request: CleaningRequest):
    """Fix missing values in the dataset"""
    try:
        params = request.parameters
        strategy = params.get('strategy', 'auto')
        column = params.get('column')
        fill_value = params.get('fill_value')
        
        result = data_cleaner.fix_missing_values(strategy, column, fill_value)
        
        if 'error' in result:
            raise HTTPException(status_code=400, detail=result['error'])
        
        # Update data processor with cleaned data
        data_processor.data = data_cleaner.data
        
        return safe_json_response({"status": "success", "result": convert_numpy_types(result)})
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fix missing values: {str(e)}")

@app.post("/api/cleaning/remove-duplicates")
async def remove_duplicates(request: CleaningRequest):
    """Remove duplicate rows from the dataset"""
    try:
        params = request.parameters
        subset = params.get('subset')
        keep = params.get('keep', 'first')
        
        result = data_cleaner.remove_duplicates(subset, keep)
        
        if 'error' in result:
            raise HTTPException(status_code=400, detail=result['error'])
        
        # Update data processor with cleaned data
        data_processor.data = data_cleaner.data
        
        return safe_json_response({"status": "success", "result": convert_numpy_types(result)})
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to remove duplicates: {str(e)}")

@app.post("/api/cleaning/handle-outliers")
async def handle_outliers(request: CleaningRequest):
    """Handle outliers in numeric columns"""
    try:
        params = request.parameters
        method = params.get('method', 'iqr')
        columns = params.get('columns')
        threshold = params.get('threshold', 1.5)
        
        result = data_cleaner.handle_outliers(method, columns, threshold)
        
        if 'error' in result:
            raise HTTPException(status_code=400, detail=result['error'])
        
        # Update data processor with cleaned data
        data_processor.data = data_cleaner.data
        
        return safe_json_response({"status": "success", "result": convert_numpy_types(result)})
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to handle outliers: {str(e)}")

@app.post("/api/cleaning/automated")
async def apply_automated_cleaning(aggressive: bool = False):
    """Apply automated cleaning based on detected issues"""
    try:
        # Get current issues
        issues = data_cleaner.get_data_issues()
        operations_performed = []
        
        # Fix missing values
        if issues.get('missing_values'):
            result = data_cleaner.fix_missing_values('auto')
            if 'error' not in result:
                operations_performed.append(f"Fixed missing values: {result['before_count'] - result['after_count']} values")
        
        # Remove duplicates
        if issues.get('duplicates', 0) > 0:
            result = data_cleaner.remove_duplicates()
            if 'error' not in result:
                operations_performed.append(f"Removed duplicates: {result['before_count'] - result['after_count']} rows")
        
        # Fix data types
        result = data_cleaner.fix_data_types()
        if 'error' not in result and result['changes']:
            operations_performed.append(f"Fixed data types: {len(result['changes'])} columns")
        
        # Handle outliers (only if aggressive mode)
        if aggressive and issues.get('outliers'):
            result = data_cleaner.handle_outliers('iqr')
            if 'error' not in result:
                operations_performed.append(f"Handled outliers: {result['outliers_handled']} values")
        
        # Update data processor with cleaned data
        data_processor.data = data_cleaner.data
        
        # Get final quality score
        final_report = data_cleaner.get_cleaning_report()
        
        response_data = {
            "status": "success",
            "operations_performed": operations_performed,
            "final_quality_score": convert_numpy_types(final_report['data_quality_score'])
        }
        
        return safe_json_response(response_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Automated cleaning failed: {str(e)}")

@app.post("/api/cleaning/validate")
async def validate_data(request: ValidationRules):
    """Validate data against custom rules"""
    try:
        result = data_cleaner.validate_data(request.rules)
        
        if 'error' in result:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return safe_json_response({"status": "success", "validation_results": convert_numpy_types(result['validation_results'])})
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Data validation failed: {str(e)}")

# Report Generation Endpoints
@app.post("/api/reports/create")
async def create_report(request: ReportRequest):
    """Create a new report"""
    try:
        result = report_editor.create_new_report(request.title, request.author)
        
        # Add sections if provided
        for section in request.sections:
            report_editor.add_section(
                section.get('heading', 'Untitled Section'),
                section.get('content', ''),
                section.get('section_type', 'text')
            )
        
        return safe_json_response({"status": "success", "message": result})
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create report: {str(e)}")

@app.get("/api/reports/data")
async def get_report_data():
    """Get current report data"""
    try:
        data = report_editor.get_report_data()
        return safe_json_response({"status": "success", "report_data": convert_numpy_types(data)})
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get report data: {str(e)}")

@app.post("/api/reports/export/word")
async def export_report_word(filename: str = "economic_analysis_report.docx"):
    """Export report to Word document"""
    try:
        result = report_editor.export_to_word(filename)
        
        if os.path.exists(filename):
            return FileResponse(
                path=filename,
                filename=filename,
                media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to generate Word document")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Word export failed: {str(e)}")

@app.post("/api/reports/export/pdf")
async def export_report_pdf(filename: str = "economic_analysis_report.pdf"):
    """Export report to PDF document"""
    try:
        result = report_editor.export_to_pdf(filename)
        
        if os.path.exists(filename):
            return FileResponse(
                path=filename,
                filename=filename,
                media_type='application/pdf'
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to generate PDF document")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF export failed: {str(e)}")

# Utility Endpoints
# ═══════════════════════════════════════════════════════════════════════════════
# VISUALIZATION ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/api/visualization/histogram")
async def create_histogram(column: str, bins: int = 30):
    """Create histogram for a specific column"""
    try:
        if current_dataset is None:
            raise HTTPException(status_code=404, detail="No dataset loaded")
        
        if column not in current_dataset.columns:
            raise HTTPException(status_code=400, detail=f"Column '{column}' not found")
        
        # Get column data
        data = current_dataset[column].dropna()
        
        if not pd.api.types.is_numeric_dtype(data):
            raise HTTPException(status_code=400, detail=f"Column '{column}' is not numeric")
        
        # Calculate histogram
        hist, bin_edges = np.histogram(data, bins=bins)
        
        # Prepare chart data
        chart_data = []
        for i in range(len(hist)):
            chart_data.append({
                'bin_start': float(bin_edges[i]),
                'bin_end': float(bin_edges[i + 1]),
                'count': int(hist[i]),
                'label': f"{bin_edges[i]:.2f}-{bin_edges[i + 1]:.2f}"
            })
        
        return safe_json_response({
            "chart_type": "histogram",
            "column": column,
            "data": chart_data,
            "statistics": {
                "mean": float(data.mean()),
                "std": float(data.std()),
                "min": float(data.min()),
                "max": float(data.max()),
                "count": int(len(data))
            }
        })
        
    except Exception as e:
        logger.error(f"Histogram creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Histogram creation failed: {str(e)}")

@app.post("/api/visualization/scatter")
async def create_scatter_plot(x_column: str, y_column: str):
    """Create scatter plot between two columns"""
    try:
        if current_dataset is None:
            raise HTTPException(status_code=404, detail="No dataset loaded")
        
        if x_column not in current_dataset.columns:
            raise HTTPException(status_code=400, detail=f"Column '{x_column}' not found")
        
        if y_column not in current_dataset.columns:
            raise HTTPException(status_code=400, detail=f"Column '{y_column}' not found")
        
        # Get data for both columns
        data = current_dataset[[x_column, y_column]].dropna()
        
        if not pd.api.types.is_numeric_dtype(data[x_column]):
            raise HTTPException(status_code=400, detail=f"Column '{x_column}' is not numeric")
        
        if not pd.api.types.is_numeric_dtype(data[y_column]):
            raise HTTPException(status_code=400, detail=f"Column '{y_column}' is not numeric")
        
        # Prepare chart data
        chart_data = []
        for _, row in data.iterrows():
            chart_data.append({
                'x': float(row[x_column]),
                'y': float(row[y_column])
            })
        
        # Calculate correlation
        correlation = float(data[x_column].corr(data[y_column]))
        
        return safe_json_response({
            "chart_type": "scatter",
            "x_column": x_column,
            "y_column": y_column,
            "data": chart_data,
            "correlation": correlation,
            "statistics": {
                "x_stats": {
                    "mean": float(data[x_column].mean()),
                    "std": float(data[x_column].std()),
                    "min": float(data[x_column].min()),
                    "max": float(data[x_column].max())
                },
                "y_stats": {
                    "mean": float(data[y_column].mean()),
                    "std": float(data[y_column].std()),
                    "min": float(data[y_column].min()),
                    "max": float(data[y_column].max())
                }
            }
        })
        
    except Exception as e:
        logger.error(f"Scatter plot creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Scatter plot creation failed: {str(e)}")

@app.post("/api/visualization/line")
async def create_line_chart(x_column: str, y_column: str):
    """Create line chart between two columns"""
    try:
        if current_dataset is None:
            raise HTTPException(status_code=404, detail="No dataset loaded")
        
        if x_column not in current_dataset.columns:
            raise HTTPException(status_code=400, detail=f"Column '{x_column}' not found")
        
        if y_column not in current_dataset.columns:
            raise HTTPException(status_code=400, detail=f"Column '{y_column}' not found")
        
        # Get data and sort by x column
        data = current_dataset[[x_column, y_column]].dropna().sort_values(x_column)
        
        # Prepare chart data
        chart_data = []
        for _, row in data.iterrows():
            chart_data.append({
                'x': str(row[x_column]) if not pd.api.types.is_numeric_dtype(data[x_column]) else float(row[x_column]),
                'y': float(row[y_column]) if pd.api.types.is_numeric_dtype(data[y_column]) else str(row[y_column])
            })
        
        return safe_json_response({
            "chart_type": "line",
            "x_column": x_column,
            "y_column": y_column,
            "data": chart_data,
            "data_types": {
                "x_type": str(data[x_column].dtype),
                "y_type": str(data[y_column].dtype)
            }
        })
        
    except Exception as e:
        logger.error(f"Line chart creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Line chart creation failed: {str(e)}")

@app.get("/api/visualization/options")
async def get_visualization_options():
    """Get available visualization options based on current dataset"""
    try:
        if current_dataset is None:
            raise HTTPException(status_code=404, detail="No dataset loaded")
        
        numeric_columns = []
        categorical_columns = []
        date_columns = []
        
        for col in current_dataset.columns:
            dtype = current_dataset[col].dtype
            if pd.api.types.is_numeric_dtype(dtype):
                numeric_columns.append(col)
            elif pd.api.types.is_datetime64_any_dtype(dtype):
                date_columns.append(col)
            else:
                categorical_columns.append(col)
        
        # Suggest visualizations based on data types
        suggestions = []
        
        if len(numeric_columns) >= 2:
            suggestions.append({
                "type": "correlation_matrix",
                "title": "Correlation Matrix",
                "description": "Shows relationships between all numeric variables",
                "columns": numeric_columns
            })
            
            suggestions.append({
                "type": "scatter_plot",
                "title": "Scatter Plots",
                "description": "Explore relationships between pairs of numeric variables",
                "columns": numeric_columns
            })
        
        if len(numeric_columns) >= 1:
            suggestions.append({
                "type": "histogram",
                "title": "Histograms",
                "description": "Show distribution of numeric variables",
                "columns": numeric_columns
            })
            
            suggestions.append({
                "type": "box_plot",
                "title": "Box Plots",
                "description": "Identify outliers and quartiles",
                "columns": numeric_columns
            })
        
        if len(date_columns) >= 1 and len(numeric_columns) >= 1:
            suggestions.append({
                "type": "time_series",
                "title": "Time Series",
                "description": "Analyze trends over time",
                "date_columns": date_columns,
                "numeric_columns": numeric_columns
            })
        
        return safe_json_response({
            "columns": {
                "numeric": numeric_columns,
                "categorical": categorical_columns,
                "date": date_columns
            },
            "suggestions": suggestions
        })
        
    except Exception as e:
        logger.error(f"Visualization options error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get visualization options: {str(e)}")

# ═══════════════════════════════════════════════════════════════════════════════
# HEALTH AND CAPABILITIES
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.get("/api/capabilities")
async def get_capabilities():
    """Get API capabilities and available endpoints"""
    return {
        "capabilities": {
            "data_upload": ["CSV", "Excel", "JSON"],
            "analysis_types": ["descriptive", "regression", "timeseries"],
            "cleaning_operations": ["missing_values", "duplicates", "outliers", "data_types", "validation"],
            "visualization_types": ["histogram", "scatter", "line", "correlation_matrix", "box_plot"],
            "export_formats": ["CSV", "Excel", "JSON", "Word", "PDF"],
            "report_features": ["interactive_editing", "multiple_sections", "markdown_support"]
        },
        "endpoints": {
            "dataset": ["/api/dataset/upload", "/api/dataset/info", "/api/dataset/sample/{n}"],
            "analysis": ["/api/analysis/descriptive", "/api/analysis/regression", "/api/analysis/timeseries"],
            "cleaning": ["/api/cleaning/quality-report", "/api/cleaning/suggestions", "/api/cleaning/automated"],
            "visualization": ["/api/visualization/histogram", "/api/visualization/scatter", "/api/visualization/line", "/api/visualization/options"],
            "reports": ["/api/reports/create", "/api/reports/export/word", "/api/reports/export/pdf"]
        }
    }

# Error handlers
@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    """Handle JSON serialization errors"""
    error_msg = str(exc)
    if "not iterable" in error_msg or "numpy" in error_msg:
        return JSONResponse(
            status_code=500,
            content={"error": "Data serialization error", "message": "Unable to serialize response data. Please check data types."}
        )
    elif "JSON serializable" in error_msg or "Timestamp" in error_msg:
        return JSONResponse(
            status_code=500,
            content={"error": "DateTime serialization error", "message": "Unable to serialize datetime objects. Please check date column format."}
        )
    return JSONResponse(
        status_code=400,
        content={"error": "Value error", "message": str(exc)}
    )

@app.exception_handler(TypeError)
async def type_error_handler(request, exc):
    """Handle type errors including datetime serialization"""
    error_msg = str(exc)
    if "JSON serializable" in error_msg or "Timestamp" in error_msg or "datetime" in error_msg:
        return JSONResponse(
            status_code=500,
            content={"error": "DateTime serialization error", "message": "Unable to serialize datetime objects. Data has been processed to fix this issue."}
        )
    return JSONResponse(
        status_code=500,
        content={"error": "Type error", "message": str(exc)}
    )

@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"error": "Endpoint not found", "message": str(exc.detail)}
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "message": "An unexpected error occurred"}
    )

if __name__ == "__main__":
    uvicorn.run(
        "backend_api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )