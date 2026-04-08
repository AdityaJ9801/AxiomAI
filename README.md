# AXIOM AI - Agentic Data Analysis Platform

A comprehensive, AI-powered data analysis platform with automated insights, quality assessment, and predictive modeling capabilities.

## 🎯 Features

- **📊 Interactive Dashboard** - Power BI-like analytics workspace with real-time KPIs
- **🧹 Data Quality Assessment** - Automatic issue detection with auto-fix recommendations
- **⚙️ Data Processing Tools** - Advanced data transformation and manipulation
- **📈 Statistical Analysis** - Descriptive statistics, correlations, and regression analysis
- **🎨 Data Visualizations** - Interactive charts and custom visualization builder
- **🤖 AI Agent Pipeline** - Automated end-to-end analysis workflow
- **📄 Report Generation** - Comprehensive, executive, and technical reports
- **📊 Dataset Preview** - Browse, search, and filter loaded data
- **🔐 Authentication** - Secure login with demo credentials

## 📋 System Requirements

- **Node.js**: 18.x or higher
- **Python**: 3.9 or higher (for backend)
- **npm** or **yarn**: Latest version
- **RAM**: 4GB minimum (8GB recommended)
- **Disk Space**: 2GB minimum

## 🚀 Installation & Setup

### Prerequisites

1. Install Node.js from [nodejs.org](https://nodejs.org/)
2. Install Python from [python.org](https://www.python.org/)
3. Clone the repository:
```bash
git clone <repository-url>
cd AXIOM_AI_V4
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your configuration:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

5. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a Python virtual environment:
```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Create environment file:
```bash
cp .env.example .env
```

5. Update `.env` with your configuration:
```env
FASTAPI_ENV=development
DATABASE_URL=sqlite:///./axiom.db
SECRET_KEY=your-secret-key-here
```

6. Start the backend server:
```bash
python start_server.py
```

The backend API will be available at `http://localhost:8000`

## 📁 Project Structure

```
AXIOM_AI_V4/
├── frontend/                          # Next.js 16 frontend application
│   ├── app/
│   │   ├── app/                       # Main application routes
│   │   │   ├── page.tsx               # Dashboard home
│   │   │   ├── dashboard/             # Power BI-like dashboard
│   │   │   ├── upload/                # Dataset upload page
│   │   │   ├── data/                  # Data preview & browser
│   │   │   ├── quality/               # Data quality assessment
│   │   │   ├── processing/            # Data processing tools
│   │   │   ├── analysis/              # Statistical analysis
│   │   │   ├── visualizations/        # Chart builder
│   │   │   ├── agent/                 # AI agent pipeline
│   │   │   ├── reports/               # Report generation
│   │   │   └── layout.tsx             # App layout & navigation
│   │   ├── login/                     # Authentication page
│   │   ├── page.tsx                   # Landing page
│   │   ├── layout.tsx                 # Root layout
│   │   └── globals.css                # Global styles
│   ├── package.json                   # Frontend dependencies
│   ├── next.config.ts                 # Next.js configuration
│   └── tsconfig.json                  # TypeScript configuration
│
├── backend/                           # FastAPI backend
│   ├── mcp_tools/                     # MCP tool implementations
│   │   ├── data_cleaner.py            # Data cleaning tools
│   │   ├── advanced_eda.py            # EDA analysis
│   │   ├── gretl.py                   # GRETL integration
│   │   ├── report_editor.py           # Report generation
│   │   └── visualization_mcp.py       # Visualization tools
│   ├── backend_api.py                 # FastAPI application
│   ├── agent.py                       # AI agent implementation
│   ├── requirements.txt                # Python dependencies
│   ├── start_server.py                # Server startup script
│   └── sample_datasets/               # Sample data files
│
├── nginx/                             # Nginx configuration
│   ├── nginx.conf                     # Development config
│   └── nginx.prod.conf                # Production config
│
├── docs/                              # Documentation
│   ├── INSTALLATION_GUIDE.md          # Detailed installation
│   ├── SETUP_GUIDE.md                 # Setup instructions
│   ├── DATA_PROCESSING_FEATURES.md    # Data processing docs
│   └── ECONOMIC_ANALYSIS_GUIDE.md     # Analysis guide
│
├── docker-compose.yml                 # Docker compose (dev)
├── docker-compose.prod.yml            # Docker compose (prod)
├── .gitignore                         # Git ignore rules
└── README.md                          # This file
```

## 🔐 Demo Credentials

Use these credentials to test the application:

- **Email**: `demo@axiom.ai`
- **Password**: `demo123`

## 📊 Sample Datasets

The application includes sample datasets for testing:

1. **Economic Indicators** - GDP, inflation, unemployment data
2. **Sales Performance** - Monthly sales across regions
3. **Stock Prices** - Historical stock market data
4. **Customer Analytics** - User behavior and demographics

Load these from the Upload page to test all features.

## 🎯 Workflow

### Typical Analysis Workflow

1. **Upload Dataset** (`/app/upload`)
   - Upload CSV, Excel, or JSON files
   - Or load sample datasets

2. **Preview Data** (`/app/data`)
   - Browse and search the loaded dataset
   - View column information and data types

3. **Quality Assessment** (`/app/quality`)
   - Automatic issue detection
   - View recommendations
   - Auto-fix available issues

4. **Data Processing** (`/app/processing`)
   - Apply transformations
   - Handle missing values
   - Remove duplicates and outliers

5. **Statistical Analysis** (`/app/analysis`)
   - Descriptive statistics
   - Correlation analysis
   - Regression modeling
   - Time series forecasting

6. **Visualizations** (`/app/visualizations`)
   - Create custom charts
   - Interactive visualizations
   - Export as PNG/SVG

7. **AI Agent Pipeline** (`/app/agent`)
   - Automated end-to-end analysis
   - Pattern detection
   - Predictive modeling
   - Insight generation

8. **Reports** (`/app/reports`)
   - Generate comprehensive reports
   - Executive summaries
   - Technical analysis
   - Export as PDF/DOCX

## 🛠️ Development

### Frontend Development

```bash
cd frontend

# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Backend Development

```bash
cd backend

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate     # Windows

# Run development server
python start_server.py

# Run tests
pytest

# View API documentation
# Visit http://localhost:8000/docs
```

## 📦 Dependencies

### Frontend
- **Next.js 16** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Chart.js** - Data visualization
- **Framer Motion** - Animations
- **Zustand** - State management

### Backend
- **FastAPI** - Web framework
- **Pandas** - Data manipulation
- **NumPy** - Numerical computing
- **Scikit-learn** - Machine learning
- **Matplotlib/Seaborn** - Visualization
- **SQLAlchemy** - Database ORM

## 🔧 Configuration

### Environment Variables

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=AXIOM AI
```

**Backend (.env)**
```env
FASTAPI_ENV=development
DATABASE_URL=sqlite:///./axiom.db
SECRET_KEY=your-secret-key-here
CORS_ORIGINS=http://localhost:3000
```

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🐛 Troubleshooting

### Frontend Issues

**Port 3000 already in use**
```bash
# Kill the process using port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

**Module not found errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Backend Issues

**Port 8000 already in use**
```bash
# Use a different port
python start_server.py --port 8001
```

**Python dependencies conflict**
```bash
# Recreate virtual environment
rm -rf venv
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

## 📖 Documentation

- [Installation Guide](docs/INSTALLATION_GUIDE.md)
- [Setup Guide](docs/SETUP_GUIDE.md)
- [Data Processing Features](docs/DATA_PROCESSING_FEATURES.md)
- [Economic Analysis Guide](docs/ECONOMIC_ANALYSIS_GUIDE.md)

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add new feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🆘 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review sample datasets and guides

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Pandas Documentation](https://pandas.pydata.org/docs/)
- [Chart.js Documentation](https://www.chartjs.org/docs/)

## 🚀 Performance Tips

1. **Frontend**
   - Use production builds for deployment
   - Enable caching headers
   - Optimize images and assets

2. **Backend**
   - Use connection pooling for databases
   - Implement caching for frequent queries
   - Monitor API response times

3. **Data Processing**
   - Process large datasets in chunks
   - Use appropriate data types
   - Index frequently queried columns

## 📊 Roadmap

- [ ] Real-time data streaming
- [ ] Advanced ML models
- [ ] Multi-user collaboration
- [ ] Cloud deployment templates
- [ ] Mobile app
- [ ] API rate limiting
- [ ] Advanced caching

---

**Version**: 1.0.0  
**Last Updated**: April 2026  
**Status**: Production Ready