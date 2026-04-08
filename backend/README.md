# AXIOM AI Backend

This directory contains all backend-related components for the AXIOM AI data analysis platform.

## Directory Structure

```
backend/
├── backend_api.py          # Main FastAPI application
├── agent.py               # AI agent implementation
├── simple_agent.py        # Simplified agent version
├── start_server.py        # Server startup script
├── run_gui.py            # GUI runner
├── streamlit_app.py      # Streamlit interface
├── sample_data.py        # Sample data generator
├── check_environment.py  # Environment validation
├── requirements.txt      # Python dependencies
├── Dockerfile           # Docker configuration
├── .env                 # Environment variables
├── .env.example         # Environment template
├── mcp_tools/           # MCP (Model Context Protocol) tools
├── tests/               # Test suite
├── sample_datasets/     # Sample data files
├── uploads/             # File upload storage
├── exports/             # Export output directory
├── logs/                # Application logs
└── temp/                # Temporary files
```

## Core Components

### 🚀 **Main API Server** (`backend_api.py`)
- FastAPI-based REST API
- Data upload and processing endpoints
- Analysis and visualization services
- Data quality assessment
- Report generation

### 🤖 **AI Agents**
- `agent.py` - Full-featured AI agent with MCP integration
- `simple_agent.py` - Lightweight agent for basic tasks

### 🛠 **MCP Tools** (`mcp_tools/`)
- `data_cleaner.py` - Data cleaning and quality assessment
- `data_processing.py` - Data transformation and analysis
- `advanced_eda.py` - Exploratory data analysis
- `visualization_mcp.py` - Chart and graph generation
- `report_mcp.py` - Report generation tools
- `gretl.py` - Econometric analysis integration

### 🧪 **Testing** (`tests/`)
- Comprehensive test suite for all components
- Data validation tests
- API endpoint testing
- MCP tool validation

## Quick Start

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Set Environment Variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start the Server
```bash
python start_server.py
```

### 4. Alternative Interfaces
```bash
# Streamlit interface
python streamlit_app.py

# GUI interface
python run_gui.py
```

## API Endpoints

### Data Management
- `POST /api/upload` - Upload datasets
- `GET /api/dataset/info` - Get dataset information
- `GET /api/dataset/sample` - Get data sample

### Analysis
- `POST /api/analysis/descriptive` - Descriptive statistics
- `POST /api/analysis/regression` - Regression analysis
- `POST /api/analysis/timeseries` - Time series analysis

### Data Quality
- `GET /api/cleaning/quality-report` - Quality assessment
- `GET /api/cleaning/suggestions` - AI suggestions
- `POST /api/cleaning/automated` - Automated cleaning

### Reports
- `POST /api/reports/create` - Generate reports
- `GET /api/reports/export/pdf` - Export PDF
- `GET /api/reports/export/word` - Export Word document

## Environment Variables

```bash
# API Configuration
API_HOST=localhost
API_PORT=8000
DEBUG=true

# Database (if used)
DATABASE_URL=sqlite:///./data.db

# External Services
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here

# File Storage
UPLOAD_DIR=./uploads
EXPORT_DIR=./exports
LOG_DIR=./logs
```

## Docker Deployment

```bash
# Build image
docker build -t axiom-ai-backend .

# Run container
docker run -p 8000:8000 -v $(pwd)/uploads:/app/uploads axiom-ai-backend
```

## Development

### Running Tests
```bash
python -m pytest tests/
```

### Code Quality
```bash
# Format code
black .

# Lint code
flake8 .

# Type checking
mypy .
```

### Adding New MCP Tools
1. Create new tool in `mcp_tools/`
2. Inherit from `BaseMCPTool`
3. Register in `tool_registry.py`
4. Add tests in `tests/`

## Monitoring

- Logs are stored in `logs/` directory
- Health check endpoint: `GET /api/health`
- Capabilities endpoint: `GET /api/capabilities`

## Integration with Frontend

The backend serves the Next.js frontend located in `../frontend/`. The API is designed to work seamlessly with the Power BI-like dashboard interface.

### CORS Configuration
The API is configured to accept requests from:
- `http://localhost:3000` (Next.js dev server)
- `http://localhost:3001` (Alternative frontend port)

## Troubleshooting

### Common Issues
1. **Port already in use**: Change `API_PORT` in `.env`
2. **Missing dependencies**: Run `pip install -r requirements.txt`
3. **File upload errors**: Check `uploads/` directory permissions
4. **Database errors**: Verify `DATABASE_URL` configuration

### Debug Mode
Set `DEBUG=true` in `.env` for detailed error messages and auto-reload.

## Contributing

1. Follow PEP 8 style guidelines
2. Add tests for new features
3. Update documentation
4. Use type hints
5. Handle errors gracefully

## License

This project is part of the AXIOM AI platform. See main project README for license information.