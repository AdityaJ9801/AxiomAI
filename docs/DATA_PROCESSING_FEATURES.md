# Enhanced Data Processing MCP Server

## Overview
The enhanced data processing MCP server provides intelligent data manipulation using LLM-generated pandas queries and modular components for reuse across projects.

## Key Features

### 1. **Intelligent Data Modification**
- **Natural Language Processing**: Converts user requests to pandas code
- **LLM Integration**: Uses same LLM provider as the main agent
- **Smart Code Generation**: Generates appropriate pandas operations

**Example Usage:**
```python
# User request: "Remove all rows with missing values"
# Generated code: df = df.dropna()

# User request: "Create a profit column as revenue minus cost"  
# Generated code: df['profit'] = df['revenue'] - df['cost']
```

### 2. **Modular Design**
- **DataLoader**: Handles multiple file formats (CSV, Parquet, JSON, Excel)
- **LLMQueryGenerator**: Generates pandas code using LLM
- **DataProcessor**: Executes code safely with error handling

### 3. **Enhanced Data Loading**
- **Format Detection**: Automatic file format detection
- **Validation**: File size and format validation
- **Comprehensive Analysis**: Detailed dataset information
- **Error Handling**: Graceful error handling and reporting

### 4. **Safety Features**
- **Sandboxed Execution**: Safe code execution environment
- **Error Recovery**: Detailed error reporting and recovery
- **Backup Handling**: Works on data copies to prevent corruption

## Available Tools

### `intelligent_data_modification`
Modify dataset using natural language requests.
- **Input**: Natural language description
- **Output**: Generated and executed pandas code
- **Features**: LLM-powered query generation

### `execute_pandas_script`
Execute custom pandas code on dataset.
- **Input**: Raw pandas code
- **Output**: Execution results and changes
- **Features**: Safe execution with detailed feedback

### `load_and_analyze_dataset`
Load and comprehensively analyze dataset.
- **Input**: Dataset file path
- **Output**: Detailed dataset analysis
- **Features**: Multi-format support, comprehensive statistics

### `get_data_processing_help`
Get help and examples for data processing.
- **Output**: Usage examples and configuration info

## Configuration

### Environment Variables
```bash
# LLM Configuration (matches agent)
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4o
OLLAMA_MODEL=llama3.2:latest
LLM_PROVIDER=openai  # or ollama

# Data Processing Configuration
DEFAULT_DATA_PATH=data.csv
MAX_FILE_SIZE_MB=100
SUPPORTED_FORMATS=csv,parquet,json,xlsx
```

### Supported File Formats
- **CSV**: Comma-separated values
- **Parquet**: Apache Parquet format
- **JSON**: JavaScript Object Notation
- **Excel**: .xlsx and .xls files

## Integration with Agent

The enhanced data processing server integrates seamlessly with the main agent:

1. **Same LLM Provider**: Uses identical LLM configuration
2. **Natural Language Interface**: Accepts human-readable requests
3. **Detailed Feedback**: Provides comprehensive operation results
4. **Error Handling**: Graceful degradation when LLM unavailable

## Example Workflows

### Basic Data Cleaning
```
User: "Remove missing values and outliers from the sales column"
Agent: Uses intelligent_data_modification
Result: Generated pandas code + execution results
```

### Custom Analysis
```
User: "Group by category and calculate average price"
Agent: Uses intelligent_data_modification  
Result: Grouped data with statistics
```

### Data Transformation
```
User: "Convert date strings to datetime and extract month"
Agent: Uses intelligent_data_modification
Result: New datetime column and month extraction
```

## Modular Components

### DataLoader Class
```python
# Reusable across projects
loader = DataLoader()
result = loader.load_dataset("data.csv")
info = loader.get_dataset_info(df)
```

### LLMQueryGenerator Class
```python
# Generates pandas code from natural language
generator = LLMQueryGenerator()
result = generator.generate_pandas_query(request, dataset_info)
```

### DataProcessor Class
```python
# Safe code execution with detailed feedback
processor = DataProcessor()
result = processor.execute_pandas_code(df, code)
```

## Benefits

1. **User-Friendly**: Natural language data manipulation
2. **Intelligent**: LLM-powered code generation
3. **Safe**: Sandboxed execution with error handling
4. **Modular**: Reusable components across projects
5. **Comprehensive**: Detailed analysis and feedback
6. **Flexible**: Supports multiple file formats and operations