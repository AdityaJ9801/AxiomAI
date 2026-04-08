# MCP Agent with Tool Registry - Setup Guide

## Quick Start

### 1. Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- Git (for version control)

### 2. Installation

```bash
# Clone the repository (if applicable)
# git clone <repository-url>
# cd <project-directory>

# Install dependencies
pip install -r requirements-minimal.txt

# Or install development dependencies
pip install -r requirements-dev.txt
```

### 3. Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit the `.env` file with your configuration:
```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o
LLM_PROVIDER=openai  # or "ollama" for local models

# Ollama Configuration (if using local models)
OLLAMA_MODEL=llama3.2:latest
OLLAMA_BASE_URL=http://localhost:11434

# MCP Server Configuration
MCP_SERVERS=eda,data_processing,viz,econometrics,report,agent_coordinator
```

### 4. Install Ollama (Optional - for local LLM)

If using Ollama for local LLM inference:

```bash
# Install Ollama (Linux/macOS)
curl -fsSL https://ollama.ai/install.sh | sh

# Or on macOS with Homebrew
brew install ollama

# Pull a model
ollama pull llama3.2:latest
```

### 5. Run the Setup Script

```bash
# Make the setup script executable
chmod +x setup.py

# Run the setup
python setup.py
```

### 6. Run the Agent

```bash
# Basic usage
python agent.py

# With custom configuration
LLM_PROVIDER=ollama python agent.py
```

## Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | (required) |
| `OPENAI_MODEL` | OpenAI model to use | `gpt-4o` |
| `OLLAMA_MODEL` | Ollama model name | `llama3.2:latest` |
| `LLM_PROVIDER` | LLM provider | `openai` or `ollama` |
| `MCP_SERVERS` | Comma-separated MCP servers | All available |

### MCP Servers

The system includes these MCP servers:

1. **EDA Server** (`eda`) - Exploratory Data Analysis
2. **Data Processing** (`data_processing`) - Data cleaning and transformation
3. **Visualization** (`viz`) - Chart and graph generation
4. **Econometrics** (`econometrics`) - Statistical analysis
5. **Reporting** (`report`) - Report generation
6. **Agent Coordinator** (`agent_coordinator`) - Multi-agent coordination

## Development

### Development Dependencies

```bash
# Install development dependencies
pip install -r requirements-dev.txt

# Run tests
pytest tests/

# Run with code quality checks
black .
flake8 .
mypy .
```

### Project Structure

```
project/
├── agent.py              # Main agent application
├── mcp_tools/           # MCP tool implementations
│   ├── tool_registry.py  # Tool registry and coordination
│   ├── mcp_eda.py       # EDA tools
│   ├── data_processing.py # Data processing tools
│   ├── visualization_mcp.py # Visualization tools
│   ├── mcp_gretl.py     # Econometrics tools
│   ├── report_mcp.py     # Reporting tools
│   └── agent_coordinator.py # Agent coordination
├── requirements.txt     # Production dependencies
├── requirements-dev.txt # Development dependencies
└── .env.example        # Environment template
```

## Troubleshooting

### Common Issues

1. **ModuleNotFoundError: No module named 'langchain'**
   ```bash
   pip install langchain langchain-openai
   ```

2. **MCP server connection issues**
   - Check if MCP servers are running
   - Verify ports are not in use
   - Check server logs for errors

3. **Ollama connection issues**
   ```bash
   # Check if Ollama is running
   curl http://localhost:11434/api/tags
   ```

### Getting Help

- Check the logs in `agent_session.log`
- Enable debug logging: `LOG_LEVEL=DEBUG python agent.py`
- Check the MCP server logs for specific errors

## License

[Your License Here]