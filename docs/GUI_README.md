# Data Analysis Agent - GUI Interface

A Power BI-style web interface for comprehensive data analysis with AI-powered insights.

## 🌟 Features

### 📊 Dataset Management
- **Multi-format Support**: CSV, Excel, Parquet, JSON
- **Automatic Validation**: File format and structure validation
- **Memory Optimization**: Efficient loading for large datasets
- **Real-time Preview**: Instant dataset overview and statistics

### 🔍 Exploratory Data Analysis (EDA)
- **Automated Analysis**: Comprehensive statistical summaries
- **Data Quality Assessment**: Missing values, duplicates, outliers
- **Correlation Analysis**: Interactive correlation heatmaps
- **Distribution Analysis**: Histograms, box plots, and statistical insights

### 📈 Interactive Visualizations
- **Chart Types**: Histogram, Scatter, Box, Bar, Line, Correlation Heatmap
- **Dynamic Configuration**: Real-time chart customization
- **Smart Insights**: Automatic interpretation of visualizations
- **Export Ready**: High-quality plots for reports

### 💬 AI-Powered Chat Interface
- **Natural Language Queries**: Ask questions about your data
- **Intelligent Responses**: Context-aware analysis and recommendations
- **Quick Questions**: Pre-built queries for common analysis tasks
- **Real-time Insights**: Instant feedback on data patterns

### 📋 Professional Report Builder
- **Customizable Reports**: Choose sections and visualizations
- **Multiple Formats**: HTML export with professional styling
- **Automated Insights**: AI-generated recommendations and findings
- **Publication Ready**: Professional formatting for presentations

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Launch the GUI
```bash
python run_gui.py
```

Or directly with Streamlit:
```bash
streamlit run streamlit_app.py
```

### 3. Access the Interface
Open your browser and navigate to: `http://localhost:8501`

## 📱 Interface Layout

### Power BI-Style Design
```
┌─────────────────────────────────────────────────────────────┐
│                    📊 Data Analysis Agent                    │
├─────────────────┬───────────────────────────┬───────────────┤
│   📂 Dataset    │                           │   💬 Chat &   │
│   Management    │      📊 Main Content      │   Insights    │
│                 │                           │               │
│   • Upload      │   ┌─ Overview ─────────┐  │   • AI Chat   │
│   • Validation  │   │ ┌─ EDA Analysis ──┐ │  │   • History   │
│   • Info        │   │ │ ┌─ Visualizations │  │   • Quick Q's │
│                 │   │ │ │ ┌─ Reports ───┐ │  │               │
│   📊 Metrics    │   │ │ │ │             │ │  │   📋 Dataset  │
│   • Rows        │   │ │ │ │   Content   │ │  │   Info        │
│   • Columns     │   │ │ │ │             │ │  │               │
│   • Quality     │   │ │ │ └─────────────┘ │  │   🔄 Recent   │
│   • Memory      │   │ │ └─────────────────┘  │   Changes     │
│                 │   │ └───────────────────────  │               │
│   🧭 Navigation │   └─────────────────────────┘  │               │
│   • Overview    │                               │               │
│   • EDA         │                               │               │
│   • Viz         │                               │               │
│   • Chat        │                               │               │
│   • Reports     │                               │               │
└─────────────────┴───────────────────────────────┴───────────────┘
```

## 🎯 Usage Guide

### 1. Loading Data
1. Click "Upload Dataset" in the sidebar
2. Select your file (CSV, Excel, Parquet, JSON)
3. Click "Load Dataset" to process
4. Review the automatic validation and summary

### 2. Exploring Data
- **Overview Tab**: Dataset summary, preview, column information
- **EDA Analysis Tab**: Statistical summaries, correlations, distributions
- **Visualizations Tab**: Interactive charts and plots
- **Data Quality Tab**: Missing values, outliers, recommendations

### 3. AI Chat Interface
- Ask natural language questions about your data
- Use quick questions for common analysis tasks
- Get intelligent recommendations for data cleaning
- Receive insights about patterns and relationships

### 4. Creating Reports
1. Navigate to "Report Builder"
2. Configure report sections and visualizations
3. Generate comprehensive analysis report
4. Download as HTML for sharing

## 🔧 Advanced Features

### Custom Visualizations
```python
# The interface supports dynamic chart creation
chart_types = [
    "Histogram",           # Distribution analysis
    "Scatter Plot",        # Relationship analysis  
    "Box Plot",           # Outlier detection
    "Bar Chart",          # Category comparison
    "Line Chart",         # Trend analysis
    "Correlation Heatmap" # Correlation matrix
]
```

### AI Chat Capabilities
- **Data Insights**: "What are the key insights from this dataset?"
- **Missing Values**: "Which columns have missing values?"
- **Correlations**: "What are the strongest correlations?"
- **Outliers**: "Are there any outliers I should know about?"
- **Recommendations**: "What data cleaning steps do you recommend?"

### Report Customization
- Choose specific sections to include
- Select visualizations for the report
- Add custom titles and author information
- Export in multiple formats

## 🎨 Styling and Themes

The interface uses a Power BI-inspired design with:
- **Professional Color Scheme**: Blue gradients and clean whites
- **Responsive Layout**: Adapts to different screen sizes
- **Interactive Elements**: Hover effects and smooth transitions
- **Consistent Typography**: Clear, readable fonts throughout

## 🔍 Data Quality Features

### Automatic Assessment
- **Quality Score**: 0-100 scale based on completeness and consistency
- **Missing Value Analysis**: Detailed breakdown by column
- **Duplicate Detection**: Identification of duplicate rows
- **Outlier Detection**: Statistical outlier identification using IQR method

### Smart Recommendations
- **Data Cleaning**: Automated suggestions for improvement
- **Column Analysis**: Identification of potential identifier columns
- **Correlation Warnings**: Alerts for multicollinearity issues
- **Memory Optimization**: Suggestions for reducing dataset size

## 🚀 Performance Optimization

### Large Dataset Handling
- **Chunked Loading**: Efficient processing of large files
- **Memory Monitoring**: Real-time memory usage tracking
- **Sampling Options**: Work with representative samples
- **Lazy Evaluation**: On-demand computation for better performance

### Caching Strategy
- **Session State**: Persistent data across interactions
- **Computation Cache**: Avoid redundant calculations
- **Visualization Cache**: Store generated charts for quick access

## 🛠️ Troubleshooting

### Common Issues

**1. Import Errors**
```bash
# Install missing dependencies
pip install -r requirements.txt
```

**2. Large File Issues**
- Use sampling for files > 100MB
- Consider converting to Parquet format
- Check available system memory

**3. Visualization Problems**
- Ensure Plotly is properly installed
- Check browser compatibility
- Clear browser cache if needed

**4. Chat Not Responding**
- Verify dataset is loaded
- Check for proper column types
- Try simpler questions first

## 📈 Future Enhancements

### Planned Features
- **Advanced ML Integration**: Automated model building
- **Real-time Data Streaming**: Live data analysis
- **Collaborative Features**: Multi-user analysis sessions
- **Advanced Export Options**: PDF reports, PowerPoint integration
- **Custom Plugins**: Extensible analysis modules

### Integration Possibilities
- **Database Connections**: Direct SQL database access
- **Cloud Storage**: S3, Google Drive, OneDrive integration
- **API Endpoints**: REST API for programmatic access
- **Jupyter Integration**: Export analysis to notebooks

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the console output for error messages
3. Ensure all dependencies are properly installed
4. Verify your dataset format is supported

## 🎉 Getting Started Tips

1. **Start Small**: Begin with a small, clean dataset to familiarize yourself
2. **Explore Gradually**: Use each tab to understand the full capabilities
3. **Ask Questions**: Use the chat interface to discover insights
4. **Generate Reports**: Create professional reports for sharing findings
5. **Experiment**: Try different visualizations and analysis approaches

The Data Analysis Agent GUI provides a comprehensive, user-friendly interface for data analysis that rivals commercial tools while being completely customizable and extensible.