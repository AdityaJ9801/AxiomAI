import asyncio
import os
import logging
import shutil
import uuid
from typing import Annotated, TypedDict, List, Literal
from functools import partial
from pathlib import Path

# Conditional imports - will be checked later
try:
    import pandas as pd
    PANDAS_AVAILABLE = True
except ImportError:
    PANDAS_AVAILABLE = False
    pd = None

# New Import for OpenAI
try:
    from langchain_openai import ChatOpenAI
    from langchain_ollama import ChatOllama
    from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage, AIMessage
    from langchain_mcp_adapters.client import MultiServerMCPClient
    from langgraph.graph import StateGraph, START, END
    from langgraph.graph.message import add_messages
    from langgraph.prebuilt import ToolNode
    from langgraph.checkpoint.memory import InMemorySaver
    LANGCHAIN_AVAILABLE = True
except ImportError as e:
    LANGCHAIN_AVAILABLE = False
    print(f"Warning: LangChain not available: {e}")
    print("Install with: pip install langchain langchain-openai langgraph langchain-mcp-adapters")

# Rich console for better output
try:
    from rich.console import Console
    from rich.panel import Panel
    from rich.markdown import Markdown
    console = Console()
    RICH_AVAILABLE = True
except ImportError:
    RICH_AVAILABLE = False
    console = None

# --- Configuration & Logging ---
LOG_FILE = "agent_session.log"
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.FileHandler(LOG_FILE, encoding='utf-8')]
)
logger = logging.getLogger("ResearchAgent")

# --- LLM SELECTION LOGIC ---
OPENAI_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o") # or gpt-4o-mini
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen3:0.6b")
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openai")

def get_llm():
    """Returns OpenAI if API key is present, otherwise returns Ollama."""
    if LLM_PROVIDER.lower() == "openai" and OPENAI_KEY:
        logger.info(f"Using OpenAI Model: {OPENAI_MODEL}")
        console.print("[bold green]LLM Provider: OpenAI[/bold green]")
        return ChatOpenAI(model=OPENAI_MODEL, temperature=0)
    else:
        logger.info(f"Using Ollama Model: {OLLAMA_MODEL}")
        console.print("[bold yellow]LLM Provider: Ollama (No OpenAI key found)[/bold yellow]")
        return ChatOllama(model=OLLAMA_MODEL, temperature=0)

# --- 1. State Definition ---
class State(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    context: str     
    iterations: int  
    plan: str
    phase: str
    dataset_path: str

# --- 2. Resource Initialization ---
MCP_CONFIG = {
    "eda": {"command": "python", "args": [os.path.abspath("mcp_tools/mcp_eda.py")], "transport": "stdio"},
    "data_cleaning": {"command": "python", "args": [os.path.abspath("mcp_tools/data_cleaning_mcp.py")], "transport": "stdio"},
    "viz": {"command": "python", "args": [os.path.abspath("mcp_tools/visualization_mcp.py")], "transport": "stdio"},
    "econometrics": {"command": "python", "args": [os.path.abspath("mcp_tools/mcp_gretl.py")], "transport": "stdio"},
    "report": {"command": "python", "args": [os.path.abspath("mcp_tools/report_mcp.py")], "transport": "stdio"}
}

def validate_mcp_servers():
    """Validate that MCP server files exist and are accessible."""
    issues = []
    
    # First check if required packages are available
    try:
        import mcp
        import fastmcp
        import pandas
        import numpy
    except ImportError as e:
        issues.append(f"Missing required packages: {e}")
        issues.append("Run: pip install -r requirements.txt")
        return issues
    
    for server_name, config in MCP_CONFIG.items():
        if config["args"]:
            server_file = config["args"][0]
            if not os.path.exists(server_file):
                issues.append(f"Server file missing: {server_file}")
            elif not os.access(server_file, os.R_OK):
                issues.append(f"Server file not readable: {server_file}")
    
    return issues
    return issues

def clear_rag_storage():
    """Deletes the persistent FAISS index to ensure a clean start."""
    if os.path.exists("faiss_index"):
        try:
            shutil.rmtree("faiss_index")
            logger.info("Cleared RAG storage.")
        except Exception as e:
            logger.error(f"Failed to clear RAG storage: {e}")

def detect_dataset_path(user_input: str) -> str:
    """Detect dataset file path from user input."""
    # Look for common file extensions
    extensions = ['.csv', '.parquet', '.json', '.xlsx', '.xls']
    words = user_input.split()
    
    for word in words:
        for ext in extensions:
            if word.lower().endswith(ext):
                return word
    
    # Look for quoted file paths
    import re
    quoted_paths = re.findall(r'"([^"]*)"', user_input) + re.findall(r"'([^']*)'", user_input)
    for path in quoted_paths:
        for ext in extensions:
            if path.lower().endswith(ext):
                return path
    
    return ""

def validate_dataset_file(file_path: str) -> dict:
    """Validate if the dataset file exists and is readable."""
    if not file_path:
        return {"valid": False, "error": "No file path provided"}
    
    path = Path(file_path)
    
    # Check if file exists
    if not path.exists():
        return {"valid": False, "error": f"File not found: {file_path}"}
    
    # Check file extension
    supported_extensions = ['.csv', '.parquet', '.json', '.xlsx', '.xls']
    if path.suffix.lower() not in supported_extensions:
        return {"valid": False, "error": f"Unsupported file format: {path.suffix}"}
    
    # Check file size (limit to 100MB for prototype)
    try:
        file_size = path.stat().st_size
        max_size = 100 * 1024 * 1024  # 100MB
        if file_size > max_size:
            return {"valid": False, "error": f"File too large: {file_size / (1024*1024):.1f}MB (max 100MB)"}
    except Exception as e:
        return {"valid": False, "error": f"Cannot access file: {e}"}
    
    return {"valid": True, "path": str(path.resolve()), "size_mb": file_size / (1024*1024)}

def load_dataset_preview(file_path: str) -> dict:
    """Load a preview of the dataset to show basic info."""
    try:
        path = Path(file_path)
        
        # Load based on file extension
        if path.suffix.lower() == '.csv':
            df = pd.read_csv(file_path, nrows=1000)  # Preview first 1000 rows
        elif path.suffix.lower() == '.parquet':
            df = pd.read_parquet(file_path)
            if len(df) > 1000:
                df = df.head(1000)
        elif path.suffix.lower() == '.json':
            df = pd.read_json(file_path, nrows=1000)
        elif path.suffix.lower() in ['.xlsx', '.xls']:
            df = pd.read_excel(file_path, nrows=1000)
        else:
            return {"success": False, "error": "Unsupported file format"}
        
        # Get basic info
        info = {
            "success": True,
            "shape": df.shape,
            "columns": list(df.columns),
            "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
            "preview": df.head(3).to_dict('records'),
            "missing_values": df.isnull().sum().to_dict(),
            "memory_usage_mb": df.memory_usage(deep=True).sum() / (1024*1024)
        }
        
        return info
        
    except Exception as e:
        return {"success": False, "error": str(e)}

# --- 3. Graph Nodes ---
async def planner(state: State, llm):
    user_messages = [m for m in state["messages"] if isinstance(m, HumanMessage)]
    user_query = user_messages[-1].content if user_messages else "No query found."
    phase = state.get("phase", "eda_validation")
    dataset_path = state.get("dataset_path", "")
    
    # Check if user is trying to load a dataset
    if not dataset_path and any(keyword in user_query.lower() for keyword in ['load', 'analyze', 'dataset', 'data']):
        detected_file = detect_dataset_path(user_query)
        if detected_file:
            return {"plan": f"DECISION: DATASET_LOADING - User wants to load {detected_file}. Instruct them to specify the correct file path if needed."}
        else:
            return {"plan": "DECISION: DIRECT_ANSWER - Ask the user to specify a dataset file to load (e.g., 'load sales_data.csv')."}
    
    if phase == "eda_validation":
        if not dataset_path:
            instructions = f"""
PHASE: Dataset Loading
NO DATASET LOADED

TASK:
1. Ask the user to load a dataset first
2. Supported formats: CSV, Parquet, JSON, Excel
3. Example: "Please load a dataset file like 'sales_data.csv' to begin analysis"
4. Output "DECISION: DIRECT_ANSWER" with the request
"""
        else:
            instructions = f"""
PHASE: Exploratory Data Analysis & Validation
DATASET: {dataset_path}

AVAILABLE TOOLS:
- analyze_dataset: Run EDA on datasets
- intelligent_data_modification: Modify data using natural language requests
- execute_pandas_script: Run custom pandas code
- load_and_analyze_dataset: Load and analyze dataset comprehensively
- power_bi_visualize: Create charts and visualizations

TASK:
1. If user wants EDA, use 'analyze_dataset' or 'load_and_analyze_dataset' and ask for validation
2. If user wants modifications, use 'intelligent_data_modification' for natural language requests
3. If user wants custom code, use 'execute_pandas_script'
4. If user validates data, output "DECISION: VALIDATED"
5. Otherwise output "DECISION: TOOL_PLAN" with specific tools to use
"""
    else:
        instructions = f"""
PHASE: Analysis & Reporting
DATASET: {dataset_path}

AVAILABLE TOOLS:
- load_economic_data: Load data for analysis
- run_ols_regression: Run regression analysis
- time_series_forecast: Create forecasts
- power_bi_visualize: Create visualizations
- generate_word_report: Generate reports

TASK:
1. Use econometric tools for statistical analysis
2. Use visualization tools for charts
3. Use reporting tools for final reports
4. Output "DECISION: TOOL_PLAN" with specific tools to use
"""

    planner_prompt = f"""You are a Strategic Planning Agent. 
USER QUERY: "{user_query}"

{instructions}

Be decisive and choose appropriate tools."""
    
    response = await llm.ainvoke([HumanMessage(content=planner_prompt)])
    console.print(Panel(response.content, title="[bold cyan]PLANNER DECISION[/bold cyan]"))
    return {"plan": response.content}

async def chatbot(state: State, llm_with_tools):
    plan = state.get('plan', '')
    phase = state.get('phase', 'eda_validation')
    dataset_path = state.get('dataset_path', '')
    
    if phase == "eda_validation" and "DECISION: VALIDATED" in plan:
        msg = AIMessage(content="Data validation complete! Moving to Analysis & Reporting phase. What analysis would you like me to perform?")
        return {"messages": [msg], "phase": "analysis_report", "plan": ""}
    
    if "DECISION: DATASET_LOADING" in plan:
        content = plan.split("-", 1)[1].strip() if "-" in plan else "Please specify a dataset file to load."
        return {"messages": [AIMessage(content=content)]}
        
    if "DECISION: DIRECT_ANSWER" in plan or "DECISION: UNSUPPORTED" in plan:
        content = plan.split(":", 1)[1].replace("DIRECT_ANSWER", "").replace("UNSUPPORTED", "").strip()
        return {"messages": [AIMessage(content=content)]}

    # Check if dataset is loaded
    if not dataset_path and phase == "eda_validation":
        msg = AIMessage(content="I need a dataset to analyze. Please load a dataset file first. For example: 'load sales_data.csv' or 'analyze customer_data.parquet'. Supported formats: CSV, Parquet, JSON, Excel.")
        return {"messages": [msg]}

    # Check if MCP tools are available
    has_tools = hasattr(llm_with_tools, 'bind_tools') and len(getattr(llm_with_tools, 'tools', [])) > 0
    
    if not has_tools:
        # Fallback mode without MCP tools
        msg = AIMessage(content=f"""I understand you want to work with the dataset: {dataset_path if dataset_path else 'No dataset loaded'}

Unfortunately, the MCP tools are not currently available, so I can't directly execute data analysis tools. However, I can help you by:

1. **Providing guidance** on data analysis approaches
2. **Suggesting Python code** you can run manually
3. **Explaining analysis techniques** for your specific use case
4. **Recommending next steps** for your analysis

What specific analysis would you like help with? I can provide detailed guidance even without direct tool access.""")
        return {"messages": [msg]}

    system_prompt = f"""You are an AI Data Analysis Agent.

CURRENT PHASE: {phase}
DATASET: {dataset_path if dataset_path else "No dataset loaded"}
PLAN: {plan}

AVAILABLE TOOLS:
- analyze_dataset: Run EDA on datasets
- intelligent_data_modification: Modify data using natural language (e.g., "remove missing values", "create new column")
- execute_pandas_script: Run custom pandas code
- load_and_analyze_dataset: Load and comprehensively analyze dataset
- power_bi_visualize: Create visualizations
- load_economic_data: Load data for econometric analysis
- run_ols_regression: Run regression analysis
- time_series_forecast: Create forecasts
- generate_word_report: Generate reports

INSTRUCTIONS:
1. Follow the planner's instructions exactly
2. If no dataset is loaded, ask user to load one first
3. In EDA phase: Use analyze_dataset or load_and_analyze_dataset, then ask for validation
4. For data modifications: Use intelligent_data_modification with natural language requests
5. In Analysis phase: Use econometric and visualization tools
6. Always explain your actions clearly
7. Ask for clarification if unsure

INTELLIGENT DATA MODIFICATION EXAMPLES:
- "Remove all rows with missing values"
- "Create a new column 'profit' as revenue minus cost"
- "Filter data to only include customers over age 25"
- "Convert date column to datetime format"
- "Remove outliers using IQR method"
"""
    
    messages = [SystemMessage(content=system_prompt)] + state["messages"]
    response = await llm_with_tools.ainvoke(messages)
    return {"messages": [response]}

async def reflector(state: State, llm):
    plan = state.get('plan', '')
    if "DECISION: DIRECT_ANSWER" in plan or "DECISION: UNSUPPORTED" in plan:
        return {"iterations": 4}

    user_query = [m for m in state["messages"] if isinstance(m, HumanMessage)][-1].content
    last_ai_msg = state["messages"][-1].content
    
    critique_prompt = f"Does this answer '{user_query}'? Answer: '{last_ai_msg}'. Reply 'CORRECT' or 'REFINE: [reason]'."
    eval_res = await llm.ainvoke([HumanMessage(content=critique_prompt)])
    
    if "CORRECT" in eval_res.content.upper():
        return {"iterations": 4}
    
    return {"messages": [HumanMessage(content=f"REFINE: {eval_res.content}")], "iterations": state.get("iterations", 0) + 1}

def should_continue(state: State) -> Literal["tools", "reflector", "__end__"]:
    last_msg = state["messages"][-1]
    if isinstance(last_msg, AIMessage) and getattr(last_msg, 'tool_calls', None):
        return "tools"
    if state.get("iterations", 0) >= 3:
        return "__end__"
    return "reflector"

# --- 4. Execution Loop ---
async def run_agent():
    # Check for critical dependencies first
    if not LANGCHAIN_AVAILABLE:
        print("❌ Critical Error: LangChain packages not available")
        print("This agent requires LangChain for AI functionality.")
        print("\n💡 Install with:")
        print("pip install langchain langchain-openai langgraph langchain-mcp-adapters")
        print("\n🔄 Alternative: Use the backend API or Streamlit GUI:")
        print("python backend_api.py")
        print("streamlit run streamlit_app.py")
        return
    
    if not PANDAS_AVAILABLE:
        print("❌ Critical Error: pandas not available")
        print("This agent requires pandas for data processing.")
        print("\n💡 Install with:")
        print("pip install pandas numpy")
        print("\n🔄 Alternative: Use the backend API or Streamlit GUI:")
        print("python backend_api.py")
        print("streamlit run streamlit_app.py")
        return

    if not RICH_AVAILABLE:
        print("❌ Warning: Rich not available - using basic output")
        print("Install with: pip install rich")
        
        # Use basic print instead of rich console
        def basic_print(text, **kwargs):
            print(text)
        console_print = basic_print
    else:
        console_print = console.print
        console_print(Panel("[bold green]Initializing Research Agent V4...[/bold green]", title="Research Agent V4"))
    
    clear_rag_storage()
    
    # Get the appropriate LLM
    llm = get_llm()
    
    # Initialize tool registry
    try:
        from mcp_tools.tool_registry import initialize_default_tools
        from mcp_tools.agent_coordinator import initialize_default_agents
        
        console.print("[cyan]Initializing tools and agents...[/cyan]")
        initialize_default_tools()
        initialize_default_agents()
        console.print("[green]✓ Tools and agents initialized[/green]")
    except Exception as e:
        console.print(f"[yellow]⚠ Tool initialization warning: {e}[/yellow]")
    
    # Validate MCP servers before trying to load them
    console.print("[cyan]Validating MCP servers...[/cyan]")
    server_issues = validate_mcp_servers()
    if server_issues:
        console.print("[yellow]⚠ MCP Server Issues Found:[/yellow]")
        for issue in server_issues:
            console.print(f"  [red]• {issue}[/red]")
        console.print("[yellow]Some tools may not be available[/yellow]")
    else:
        console.print("[green]✓ All MCP server files found[/green]")
    
    # Check for required dependencies
    console.print("[cyan]Checking dependencies...[/cyan]")
    missing_deps = []
    try:
        import pandas
        import numpy
        import scipy
    except ImportError as e:
        missing_deps.append(f"Data science packages: {e}")
    
    try:
        import plotly
    except ImportError as e:
        missing_deps.append(f"Visualization: {e}")
    
    try:
        import statsmodels
    except ImportError as e:
        missing_deps.append(f"Advanced statistics: {e}")
    
    if missing_deps:
        console.print("[bold red]⚠ Missing Dependencies:[/bold red]")
        for dep in missing_deps:
            console.print(f"  [red]• {dep}[/red]")
        console.print("\n[bold yellow]To install dependencies, run:[/bold yellow]")
        console.print("[cyan]pip install -r requirements.txt[/cyan]")
        console.print("\n[yellow]Continuing with limited functionality...[/yellow]")
    else:
        console.print("[green]✓ All dependencies available[/green]")
    
    # Initialize MCP client with all available servers
    console.print("[cyan]Loading MCP tools...[/cyan]")
    client = MultiServerMCPClient(MCP_CONFIG)
    
    try:
        mcp_tools = await client.get_tools()
        console.print(f"[green]✓ Loaded {len(mcp_tools)} MCP tools[/green]")
        llm_with_tools = llm.bind_tools(mcp_tools)
    except Exception as e:
        console.print(f"[bold red]Tool Loading Error: {e}[/bold red]")
        
        # Show detailed error information
        import traceback
        error_details = traceback.format_exc()
        console.print(f"[red]Detailed error:[/red]")
        console.print(f"[dim]{error_details}[/dim]")
        
        # Try to identify the specific issue
        if "Connection" in str(e) or "connect" in str(e).lower():
            console.print("[yellow]💡 This appears to be a connection issue with MCP servers[/yellow]")
            console.print("[yellow]   The servers might not be running or accessible[/yellow]")
        elif "TaskGroup" in str(e):
            console.print("[yellow]💡 Multiple MCP servers failed to start[/yellow]")
            console.print("[yellow]   Trying to start servers individually...[/yellow]")
            
            # Try to start servers one by one to identify which ones fail
            working_servers = {}
            for server_name, config in MCP_CONFIG.items():
                try:
                    console.print(f"[cyan]  Testing {server_name}...[/cyan]")
                    single_client = MultiServerMCPClient({server_name: config})
                    tools = await single_client.get_tools()
                    working_servers[server_name] = config
                    console.print(f"[green]  ✓ {server_name}: {len(tools)} tools[/green]")
                except Exception as server_error:
                    console.print(f"[red]  ✗ {server_name}: {server_error}[/red]")
            
            if working_servers:
                console.print(f"[yellow]Continuing with {len(working_servers)} working servers...[/yellow]")
                try:
                    client = MultiServerMCPClient(working_servers)
                    mcp_tools = await client.get_tools()
                    llm_with_tools = llm.bind_tools(mcp_tools)
                    console.print(f"[green]✓ Loaded {len(mcp_tools)} tools from working servers[/green]")
                    
                    # Show which tools are available
                    if mcp_tools:
                        console.print("[cyan]Available tools:[/cyan]")
                        for tool in mcp_tools:
                            console.print(f"  • [green]{tool.name}[/green]")
                    
                except Exception as retry_error:
                    console.print(f"[red]Still failed: {retry_error}[/red]")
                    mcp_tools = []
                    llm_with_tools = llm
            else:
                console.print("[red]No MCP servers are working[/red]")
                console.print("[yellow]💡 This might be due to:[/yellow]")
                console.print("  • Missing Python dependencies (pandas, fastmcp, etc.)")
                console.print("  • Import errors in MCP server files")
                console.print("  • File permission issues")
                console.print("  • Environment configuration problems")
                mcp_tools = []
                llm_with_tools = llm
        else:
            console.print(f"[yellow]💡 Unknown MCP error: {type(e).__name__}[/yellow]")
            mcp_tools = []
            llm_with_tools = llm
        
        console.print("[yellow]Continuing with limited functionality (no MCP tools)...[/yellow]")
        if not mcp_tools:
            mcp_tools = []
            llm_with_tools = llm

    workflow = StateGraph(State)
    workflow.add_node("planner", partial(planner, llm=llm))
    workflow.add_node("chatbot", partial(chatbot, llm_with_tools=llm_with_tools))
    workflow.add_node("tools", ToolNode(mcp_tools))
    workflow.add_node("reflector", partial(reflector, llm=llm))
    
    workflow.add_edge(START, "planner")
    workflow.add_edge("planner", "chatbot")
    workflow.add_conditional_edges("chatbot", should_continue)
    workflow.add_edge("tools", "chatbot")
    workflow.add_conditional_edges("reflector", lambda s: "chatbot" if s["iterations"] < 4 else "__end__")

    app = workflow.compile(checkpointer=InMemorySaver())
    session_id = str(uuid.uuid4())
    config = {"configurable": {"thread_id": session_id}}

    console.print(Panel("System Online. Type 'exit' to quit or 'help' for commands.", title="READY"))

    while True:
        try:
            user_input = console.input("\n[bold yellow]User ❯ [/bold yellow]").strip()
            if not user_input: continue
            
            # Handle special commands
            if user_input.lower() in ["exit", "quit"]: break
            
            if user_input.lower() == "help":
                console.print("\n[bold]Available Commands:[/bold]")
                console.print("  [cyan]help[/cyan] - Show this help")
                console.print("  [cyan]exit[/cyan] - Exit the program")
                console.print("  [cyan]clear[/cyan] - Clear session")
                console.print("  [cyan]tools[/cyan] - List available tools")
                console.print("  [cyan]dataset[/cyan] - Show current dataset info")
                console.print("  [cyan]status[/cyan] - Show system status")
                console.print("\n[bold]Dataset Loading:[/bold]")
                console.print("  Just mention a file: 'load sales_data.csv'")
                console.print("  Supported formats: .csv, .parquet, .json, .xlsx")
                continue
                
            if user_input.lower() == "clear":
                clear_rag_storage()
                session_id = str(uuid.uuid4())
                config = {"configurable": {"thread_id": session_id}}
                console.print("[green]✓ Session cleared[/green]")
                continue
                
            if user_input.lower() == "tools":
                console.print("\n[bold]Available Tools:[/bold]")
                if mcp_tools:
                    for tool in mcp_tools:
                        console.print(f"  • [cyan]{tool.name}[/cyan]")
                else:
                    console.print("  [yellow]No tools loaded[/yellow]")
                continue
                
            if user_input.lower() == "dataset":
                current_dataset = config.get("configurable", {}).get("dataset_path", "")
                if current_dataset:
                    console.print(f"\n[bold]Current Dataset:[/bold] {current_dataset}")
                    # Show dataset info
                    preview = load_dataset_preview(current_dataset)
                    if preview["success"]:
                        console.print(f"  • Shape: {preview['shape']}")
                        console.print(f"  • Columns: {len(preview['columns'])}")
                        console.print(f"  • Memory: {preview['memory_usage_mb']:.1f}MB")
                        console.print(f"  • Missing values: {sum(preview['missing_values'].values())}")
                    else:
                        console.print(f"  [red]Error loading info: {preview['error']}[/red]")
                else:
                    console.print("\n[yellow]No dataset loaded[/yellow]")
                    console.print("Load a dataset by mentioning a file: 'load data.csv'")
                continue
                
            if user_input.lower() == "status":
                console.print(f"\n[bold]System Status:[/bold]")
                console.print(f"  • LLM Provider: {LLM_PROVIDER}")
                console.print(f"  • LLM Model: {OPENAI_MODEL if LLM_PROVIDER == 'openai' else OLLAMA_MODEL}")
                console.print(f"  • MCP Tools Loaded: {len(mcp_tools)}")
                
                current_dataset = config.get("configurable", {}).get("dataset_path", "")
                console.print(f"  • Dataset: {current_dataset if current_dataset else 'None'}")
                
                # Show current phase
                try:
                    current_state = app.get_state(config)
                    if current_state and current_state.values:
                        phase = current_state.values.get("phase", "eda_validation")
                        console.print(f"  • Current Phase: {phase}")
                except:
                    console.print(f"  • Current Phase: eda_validation (default)")
                
                # Show MCP server status
                if mcp_tools:
                    console.print(f"  • MCP Status: [green]✓ Working[/green]")
                else:
                    console.print(f"  • MCP Status: [red]✗ Not available[/red]")
                    console.print(f"    [dim]Agent will work in guidance mode[/dim]")
                continue

            # Detect and validate dataset files
            detected_dataset = detect_dataset_path(user_input)
            current_dataset = config.get("configurable", {}).get("dataset_path", "")
            
            if detected_dataset:
                validation = validate_dataset_file(detected_dataset)
                if validation["valid"]:
                    # Load dataset preview
                    preview = load_dataset_preview(detected_dataset)
                    if preview["success"]:
                        config["configurable"]["dataset_path"] = validation["path"]
                        console.print(f"[bold green]✓ Dataset loaded:[/bold green] {detected_dataset}")
                        console.print(f"[dim]Shape: {preview['shape']}, Size: {validation['size_mb']:.1f}MB[/dim]")
                        console.print(f"[dim]Columns: {', '.join(preview['columns'][:5])}{'...' if len(preview['columns']) > 5 else ''}[/dim]")
                        current_dataset = validation["path"]
                    else:
                        console.print(f"[bold red]✗ Failed to load dataset:[/bold red] {preview['error']}")
                        continue
                else:
                    console.print(f"[bold red]✗ Invalid dataset:[/bold red] {validation['error']}")
                    continue
            elif any(keyword in user_input.lower() for keyword in ['load', 'dataset', 'data', 'file', 'csv', 'parquet']):
                # User mentioned data-related keywords but no file detected
                console.print("[yellow]💡 Tip: Specify a dataset file (e.g., 'load sales_data.csv' or 'analyze data.parquet')[/yellow]")

            inputs = {
                "messages": [HumanMessage(content=user_input)], 
                "iterations": 0,
                "dataset_path": current_dataset
            }
            
            # Initialize phase to avoid empty state issues on first run if not set
            if "phase" not in inputs:
                 state_phase = "eda_validation" # default
                 try:
                     st = app.get_state(config)
                     if st and st.values and st.values.get("phase"):
                         state_phase = st.values.get("phase")
                 except Exception:
                     pass
                 inputs["phase"] = state_phase

            with console.status("[bold cyan]Agent is thinking...", spinner="dots"):
                try:
                    async for event in app.astream(inputs, config, stream_mode="updates"):
                        for node, state_update in event.items():
                            if node == "chatbot":
                                msg = state_update["messages"][-1]
                                if isinstance(msg, AIMessage) and getattr(msg, 'tool_calls', None):
                                    for tc in msg.tool_calls:
                                        console.print(f"[bold magenta]THOUGHT:[/bold magenta] Calling [cyan]{tc['name']}[/cyan]")
                            
                            elif node == "reflector":
                                if state_update.get("iterations", 0) >= 4:
                                    final_state = app.get_state(config)
                                    final_msg = final_state.values["messages"][-1].content
                                    console.print(Panel(Markdown(final_msg), title="[bold green]AI Assistant[/bold green]"))
                except Exception as stream_error:
                    console.print(f"[bold red]Execution Error:[/bold red] {stream_error}")
                    
                    # Show detailed error for debugging
                    import traceback
                    error_details = traceback.format_exc()
                    console.print(f"[red]Details:[/red]")
                    console.print(f"[dim]{error_details}[/dim]")
                    
                    # Provide fallback response
                    console.print(Panel(
                        "I encountered an error while processing your request. This might be due to MCP tool issues. "
                        "You can try rephrasing your request or use the 'status' command to check system health.",
                        title="[bold yellow]Error Recovery[/bold yellow]"
                    ))

        except KeyboardInterrupt:
            console.print("\n[bold yellow]Interrupted by user[/bold yellow]")
            break
        except Exception as e:
            console.print(f"[bold red]Runtime Error:[/bold red] {e}")
            
            # Show detailed error information
            import traceback
            error_details = traceback.format_exc()
            console.print(f"[red]Details:[/red]")
            console.print(f"[dim]{error_details}[/dim]")
            
            # Suggest recovery actions
            console.print("[yellow]💡 Try:[/yellow]")
            console.print("  • Type 'status' to check system health")
            console.print("  • Type 'clear' to reset the session")
            console.print("  • Type 'help' for available commands")

if __name__ == "__main__":
    try:
        asyncio.run(run_agent())
    except KeyboardInterrupt:
        console.print("\n[bold red]Shutdown.[/bold red]")