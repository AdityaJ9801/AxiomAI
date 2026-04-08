# AXIOM AI - Agentic Data Analysis Platform

A comprehensive full-stack platform for AI-powered data analysis with a Power BI-like dashboard interface. The platform combines a robust FastAPI backend with a modern Next.js frontend to provide automated data analysis, cleaning, and visualization capabilities.

## 🏗️ Project Structure

```
AXIOM_AI_V4/
├── backend/                 # Python FastAPI backend
│   ├── backend_api.py      # Main API server
│   ├── agent.py            # AI agent implementation
│   ├── mcp_tools/          # Analysis and processing tools
│   ├── tests/              # Backend test suite
│   ├── sample_datasets/    # Sample data files
│   ├── uploads/            # File upload storage
│   ├── exports/            # Report exports
│   └── requirements.txt    # Python dependencies
├── frontend/               # Next.js React frontend
│   ├── app/               # Next.js app directory
│   │   ├── app/dashboard/ # Power BI-like dashboard
│   │   ├── app/upload/    # File upload interface
│   │   ├── app/analysis/  # Analysis pages
│   │   └── app/quality/   # Data quality interface
│   └── package.json       # Node.js dependencies
├── docs/                  # Documentation
├── docker-compose.yml     # Container orchestration
└── README.md             # This file
```

## 🎯 Key Features

### 🤖 **AI-Powered Analysis**
- Automated data quality assessment and cleaning
- Intelligent suggestions with explanations
- Natural language interaction via AI chatbot
- Automated report generation

### 📊 **Power BI-like Dashboard**
- Interactive data visualization with real-time updates
- Tabbed interface (Overview, Analysis, Quality, Insights)
- AI assistant chatbot in right panel
- Comprehensive data exploration tools

### 🧹 **Advanced Data Cleaning**
- Automatic quality scoring (0-100%)
- Missing value detection and handling
- Outlier identification and treatment
- Duplicate removal with smart suggestions

### 📈 **Comprehensive Analysis**
- Descriptive statistics and correlations
- Regression analysis with diagnostics
- Time series analysis and forecasting
- Interactive visualizations and charts

### 📄 **Professional Reporting**
- Automated report generation
- Export to Word and PDF formats
- Interactive report editing
- Template-based reporting system

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- Docker (optional)

### Option 1: Docker Deployment (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd AXIOM_AI_V4

# Start with Docker Compose
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2: Manual Setup

#### Backend Setup
```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Start the backend server
python start_server.py
```

#### Frontend Setup
```bash
cd frontend

# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

### Option 3: Individual Components

#### Backend Only
```bash
cd backend
python backend_api.py
# API available at http://localhost:8000
```

#### Streamlit Interface
```bash
cd backend
python streamlit_app.py
# Streamlit UI at http://localhost:8501
```

## 📡 API Overview

### Core Endpoints

| Category | Endpoint | Method | Description |
|----------|----------|---------|-------------|
| **Dataset** | `/api/dataset/upload` | POST | Upload dataset file |
| | `/api/dataset/info` | GET | Get dataset information |
| | `/api/dataset/sample/{n}` | GET | Get sample data |
| **Analysis** | `/api/analysis/descriptive` | POST | Descriptive statistics |
| | `/api/analysis/regression` | POST | Regression analysis |
| | `/api/analysis/timeseries` | POST | Time series analysis |
| **Cleaning** | `/api/cleaning/quality-report` | GET | Data quality assessment |
| | `/api/cleaning/automated` | POST | Automated cleaning |
| | `/api/cleaning/suggestions` | GET | AI cleaning suggestions |
| **Reports** | `/api/reports/create` | POST | Create new report |
| | `/api/reports/export/word` | POST | Export to Word |
| | `/api/reports/export/pdf` | POST | Export to PDF |

## 🎨 Dashboard Features

### **Power BI-like Interface**
- **Modern Design**: Professional gradient backgrounds and typography
- **Interactive Charts**: Canvas-based visualizations with hover effects
- **Responsive Layout**: Works on desktop and mobile devices
- **Real-time Updates**: Live data refresh and progress tracking

### **AI Assistant (Right Panel)**
- Natural language queries for data analysis
- Automated task execution with progress feedback
- Quick action shortcuts for common operations
- Contextual suggestions based on dataset characteristics

### **Visualization Panel (Center)**
- **Correlation Matrix**: Interactive heatmap with detailed tooltips
- **Distribution Charts**: Statistical analysis with bar and line charts
- **Scatter Plots**: Relationship analysis between variables
- **Time Series**: Trend analysis with interactive line charts
- **Box Plots**: Quartile analysis for outlier detection

### **Data Quality Insights**
- Visual quality score with color-coded indicators
- Detailed breakdown of data issues
- AI-powered suggestions with explanations
- One-click fixes for common problems



## 🔧 Configuration

### Backend Environment Variables
```env
# Server Configuration
DEBUG=False
API_HOST=0.0.0.0
API_PORT=8000

# CORS Configuration
CORS_ORIGINS=["http://localhost:3000"]

# File Upload Limits
MAX_FILE_SIZE=100MB
ALLOWED_EXTENSIONS=["csv", "xlsx", "json"]
```

### Frontend Environment Variables
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Development
NODE_ENV=development
```

## 📚 Documentation

- **[Backend README](backend/README.md)** - Backend-specific documentation
- **[Frontend README](frontend/README.md)** - Frontend-specific documentation
- **[Dashboard Guide](frontend/app/app/dashboard/README.md)** - Dashboard features and usage
- **[Project Documentation](PROJECT_DOCUMENTATION.md)** - Comprehensive technical docs
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Production deployment instructions

## 🔒 Security Features

- **Input Validation**: File type and size validation
- **CORS Configuration**: Cross-origin request control
- **Error Handling**: Secure error messages
- **Rate Limiting**: API usage throttling (when deployed)

## 📊 Analysis Capabilities

### **Statistical Analysis**
- Descriptive statistics with comprehensive metrics
- Correlation analysis and interactive matrices
- Distribution analysis with visual representations
- Missing value pattern analysis

### **Machine Learning**
- Linear and multiple regression analysis
- Time series forecasting with confidence intervals
- Outlier detection using multiple methods
- Automated feature engineering suggestions

### **Business Intelligence**
- KPI calculations and trend analysis
- Comparative analysis capabilities
- Performance metrics and benchmarking
- Automated insight generation

## 🚀 Deployment Options

### **Development**
```bash
# Backend
cd backend && python start_server.py

# Frontend
cd frontend && npm run dev
```

### **Production with Docker**
```bash
docker-compose up -d
```

### **Production Manual**
```bash
# Backend with Gunicorn
cd backend
gunicorn backend_api:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# Frontend build
cd frontend
npm run build
npm start
```

## 🔍 Monitoring & Health Checks

### Health Endpoints
- `/api/health` - Backend health status
- `/api/capabilities` - Available features and tools

### Monitoring Features
- Request/response logging
- Performance metrics tracking
- Error rate monitoring
- Resource usage tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes in the appropriate directory (`backend/` or `frontend/`)
4. Add tests for new functionality
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the component-specific documentation in `backend/` and `frontend/`
- Review the [dashboard guide](frontend/app/app/dashboard/README.md)
- Open an issue on GitHub
- Contact the development team

## 🔄 Version History

### v2.0.0 (Current)
- **New Architecture**: Separated backend and frontend into distinct directories
- **Power BI Dashboard**: Complete dashboard interface with AI assistant
- **Enhanced API**: Improved endpoints with better error handling
- **Docker Support**: Full containerization with docker-compose
- **Comprehensive Testing**: Expanded test coverage for both components

### v1.0.0
- Initial monolithic structure
- Basic API functionality
- Simple frontend interface
- Core analysis capabilities

---

**Built with ❤️ for intelligent data analysis and business intelligence**