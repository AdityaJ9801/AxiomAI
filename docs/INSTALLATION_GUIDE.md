# Installation Guide - Data Analysis Agent GUI

## 🚀 Quick Setup

### Step 1: Install Dependencies

First, make sure you have Python 3.8+ installed. Then install the required packages:

```bash
pip install -r requirements.txt
```

If you encounter any issues, try installing packages individually:

```bash
# Core packages
pip install streamlit pandas numpy plotly

# Additional packages
pip install scipy scikit-learn statsmodels openpyxl xlsxwriter

# LangChain packages (for advanced features)
pip install langchain langchain-openai langchain-ollama langchain-core
pip install langchain-mcp-adapters langgraph mcp fastmcp

# Other utilities
pip install rich python-dotenv python-docx
```

### Step 2: Launch the GUI

Choose one of these methods:

**Method 1: Using the launcher script (Recommended)**
```bash
python run_gui.py
```

**Method 2: Direct Streamlit command**
```bash
streamlit run streamlit_app.py
```

**Method 3: Windows batch file**
```bash
start_gui.bat
```

### Step 3: Access the Interface

Open your web browser and go to: `http://localhost:8501`

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. "ModuleNotFoundError: No module named 'pandas'"

**Solution:** Install the missing package
```bash
pip install pandas numpy plotly streamlit
```

#### 2. "NameError: name 'show_economic_analysis_tab' is not defined"

**Solution:** This has been fixed in the latest version
- The function definitions are now properly ordered
- Make sure you're using the updated `streamlit_app.py`
- If you still see this error, restart your Streamlit server

#### 3. "ValueError: could not convert string to float"

This error has been fixed in the latest version. If you still encounter it:
- Make sure you're using the updated `streamlit_app.py`
- The app now properly handles mixed data types
- Try uploading a different dataset to test

#### 4. "Port 8501 is already in use"

**Solution:** Either:
- Kill the existing Streamlit process
- Use a different port:
```bash
streamlit run streamlit_app.py --server.port 8502
```

#### 5. Visualization errors

**Solution:**
- Ensure your dataset has appropriate column types
- Check that numeric columns contain actual numbers
- Try with the sample datasets first

#### 6. Large file upload issues

**Solution:**
- For files > 200MB, consider using Parquet format
- Use data sampling for very large datasets
- Increase Streamlit's file upload limit:
```bash
streamlit run streamlit_app.py --server.maxUploadSize 500
```

## 📊 Testing with Sample Data

Generate sample datasets for testing:

```bash
python sample_data.py
```

This creates:
- `sample_sales_data.csv` - Sales transaction data
- `sample_employee_data.csv` - Employee information
- `sample_financial_data.csv` - Financial time series data
- `sample_sales_data.parquet` - Parquet format example
- `sample_employee_data.xlsx` - Excel format example

## 🎯 Supported File Formats

- **CSV** (.csv) - Comma-separated values
- **Excel** (.xlsx, .xls) - Microsoft Excel files
- **Parquet** (.parquet) - Columnar storage format
- **JSON** (.json) - JavaScript Object Notation

## 💡 Tips for Best Experience

1. **Start Small**: Begin with datasets < 50MB for best performance
2. **Clean Data**: Remove or handle special characters in column names
3. **Consistent Types**: Ensure columns have consistent data types
4. **Memory**: Monitor system memory usage with large datasets
5. **Browser**: Use Chrome or Firefox for best compatibility

## 🔍 Feature Overview

### Dataset Loading
- Drag and drop file upload
- Automatic format detection
- Data validation and preview
- Memory usage monitoring

### EDA Analysis
- Automated statistical summaries
- Correlation analysis with safety checks
- Missing value detection
- Data quality scoring

### Visualizations
- Interactive Plotly charts
- Multiple chart types
- Dynamic configuration
- Export capabilities

### AI Chat
- Natural language queries
- Intelligent responses
- Quick question templates
- Context-aware analysis

### Report Generation
- Professional HTML reports
- Customizable sections
- Automated insights
- Export functionality

## 🛠️ Advanced Configuration

### Environment Variables

Create a `.env` file for advanced configuration:

```env
# LLM Configuration (for advanced features)
OPENAI_API_KEY=your_openai_key_here
OPENAI_MODEL=gpt-4o
OLLAMA_MODEL=llama3.2:latest
LLM_PROVIDER=openai

# Data Configuration
DEFAULT_DATA_PATH=data.csv
MAX_FILE_SIZE_MB=100
```

### Streamlit Configuration

Create `.streamlit/config.toml` for custom settings:

```toml
[server]
port = 8501
maxUploadSize = 200

[theme]
primaryColor = "#0078d4"
backgroundColor = "#ffffff"
secondaryBackgroundColor = "#f0f2f6"
textColor = "#262730"
```

## 📞 Getting Help

If you encounter issues:

1. **Check the console output** for detailed error messages
2. **Verify all dependencies** are installed correctly
3. **Try with sample data** to isolate the issue
4. **Check file format** and data quality
5. **Restart the application** if needed

## 🔄 Updates and Maintenance

To update the application:

1. Pull the latest code
2. Update dependencies: `pip install -r requirements.txt --upgrade`
3. Restart the Streamlit server

## 🎉 Success Indicators

You'll know everything is working when:

- ✅ Streamlit starts without errors
- ✅ The web interface loads at `http://localhost:8501`
- ✅ You can upload and preview datasets
- ✅ EDA analysis completes without errors
- ✅ Visualizations render correctly
- ✅ Chat interface responds to queries
- ✅ Reports generate successfully

Happy analyzing! 📊