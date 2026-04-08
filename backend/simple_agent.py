#!/usr/bin/env python3
"""
Simplified Economic Analysis Agent
Works without MCP tools for basic functionality
"""

import os
import sys
import pandas as pd
import numpy as np
from pathlib import Path
from rich.console import Console
from rich.panel import Panel
from rich.markdown import Markdown

# Initialize console
console = Console()

def check_basic_requirements():
    """Check if basic requirements are available"""
    try:
        import pandas
        import numpy
        console.print("✅ Basic data processing available")
        return True
    except ImportError as e:
        console.print(f"❌ Missing basic requirements: {e}")
        console.print("💡 Install with: pip install pandas numpy")
        return False

def load_dataset(file_path):
    """Load dataset from file"""
    try:
        path = Path(file_path)
        
        if not path.exists():
            return None, f"File not found: {file_path}"
        
        if path.suffix.lower() == '.csv':
            df = pd.read_csv(path)
        elif path.suffix.lower() in ['.xlsx', '.xls']:
            df = pd.read_excel(path)
        elif path.suffix.lower() == '.json':
            df = pd.read_json(path)
        else:
            return None, f"Unsupported file format: {path.suffix}"
        
        return df, None
    
    except Exception as e:
        return None, f"Error loading dataset: {str(e)}"

def analyze_dataset(df):
    """Perform basic dataset analysis"""
    try:
        analysis = {}
        
        # Basic info
        analysis['shape'] = df.shape
        analysis['columns'] = df.columns.tolist()
        analysis['dtypes'] = df.dtypes.to_dict()
        analysis['memory_mb'] = df.memory_usage(deep=True).sum() / (1024**2)
        
        # Missing values
        analysis['missing_values'] = df.isnull().sum().to_dict()
        analysis['missing_percentage'] = (df.isnull().sum() / len(df) * 100).to_dict()
        
        # Duplicates
        analysis['duplicates'] = df.duplicated().sum()
        
        # Numeric analysis
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) > 0:
            analysis['numeric_summary'] = df[numeric_cols].describe().to_dict()
            
            # Correlations
            if len(numeric_cols) > 1:
                analysis['correlations'] = df[numeric_cols].corr().to_dict()
        
        # Categorical analysis
        categorical_cols = df.select_dtypes(include=['object', 'category']).columns
        if len(categorical_cols) > 0:
            analysis['categorical_summary'] = {}
            for col in categorical_cols:
                analysis['categorical_summary'][col] = {
                    'unique_count': df[col].nunique(),
                    'top_values': df[col].value_counts().head(5).to_dict()
                }
        
        return analysis, None
    
    except Exception as e:
        return None, f"Error analyzing dataset: {str(e)}"

def generate_report(analysis, dataset_name):
    """Generate a simple text report"""
    try:
        report = f"""# Economic Data Analysis Report: {dataset_name}

## Dataset Overview
- **Shape**: {analysis['shape'][0]:,} rows × {analysis['shape'][1]} columns
- **Memory Usage**: {analysis['memory_mb']:.2f} MB
- **Duplicate Rows**: {analysis['duplicates']:,}

## Data Quality
"""
        
        # Missing values section
        missing_total = sum(analysis['missing_values'].values())
        if missing_total > 0:
            report += f"- **Missing Values**: {missing_total:,} total\n"
            for col, count in analysis['missing_values'].items():
                if count > 0:
                    pct = analysis['missing_percentage'][col]
                    report += f"  - {col}: {count:,} ({pct:.1f}%)\n"
        else:
            report += "- **Missing Values**: None ✅\n"
        
        # Numeric analysis
        if 'numeric_summary' in analysis:
            report += "\n## Numeric Variables Summary\n"
            numeric_summary = analysis['numeric_summary']
            for col in numeric_summary:
                stats = numeric_summary[col]
                report += f"- **{col}**:\n"
                report += f"  - Mean: {stats['mean']:.2f}\n"
                report += f"  - Std: {stats['std']:.2f}\n"
                report += f"  - Min: {stats['min']:.2f}\n"
                report += f"  - Max: {stats['max']:.2f}\n"
        
        # Categorical analysis
        if 'categorical_summary' in analysis:
            report += "\n## Categorical Variables Summary\n"
            for col, info in analysis['categorical_summary'].items():
                report += f"- **{col}**: {info['unique_count']} unique values\n"
                for value, count in info['top_values'].items():
                    report += f"  - {value}: {count:,}\n"
        
        # Correlations
        if 'correlations' in analysis:
            report += "\n## Strong Correlations (|r| > 0.7)\n"
            correlations = analysis['correlations']
            strong_corr_found = False
            
            for col1 in correlations:
                for col2 in correlations[col1]:
                    if col1 != col2:
                        corr_val = correlations[col1][col2]
                        if abs(corr_val) > 0.7:
                            report += f"- {col1} ↔ {col2}: {corr_val:.3f}\n"
                            strong_corr_found = True
            
            if not strong_corr_found:
                report += "- No strong correlations found\n"
        
        report += "\n## Recommendations\n"
        
        # Data quality recommendations
        if missing_total > 0:
            report += "- **Data Cleaning**: Address missing values before analysis\n"
        
        if analysis['duplicates'] > 0:
            report += f"- **Duplicates**: Remove {analysis['duplicates']} duplicate rows\n"
        
        # Analysis recommendations
        if 'numeric_summary' in analysis and len(analysis['numeric_summary']) >= 2:
            report += "- **Statistical Analysis**: Dataset suitable for regression analysis\n"
        
        if any('date' in col.lower() or 'time' in col.lower() for col in analysis['columns']):
            report += "- **Time Series**: Dataset may be suitable for time series analysis\n"
        
        report += "- **Visualization**: Create charts to explore data patterns\n"
        report += "- **Advanced Analysis**: Consider econometric modeling for deeper insights\n"
        
        return report, None
    
    except Exception as e:
        return None, f"Error generating report: {str(e)}"

def main():
    """Main function"""
    console.print(Panel("[bold green]Simple Economic Analysis Agent[/bold green]", title="Economic Analysis"))
    
    # Check requirements
    if not check_basic_requirements():
        return
    
    console.print("\n[cyan]This is a simplified version that works without MCP tools.[/cyan]")
    console.print("[cyan]For full functionality, use the main agent.py with MCP tools.[/cyan]")
    
    current_dataset = None
    current_analysis = None
    
    console.print(Panel("Type 'help' for commands or 'exit' to quit", title="Ready"))
    
    while True:
        try:
            user_input = console.input("\n[bold yellow]Simple Agent ❯ [/bold yellow]").strip()
            
            if not user_input:
                continue
            
            if user_input.lower() in ['exit', 'quit']:
                console.print("👋 Goodbye!")
                break
            
            if user_input.lower() == 'help':
                console.print("\n[bold]Available Commands:[/bold]")
                console.print("  [cyan]help[/cyan] - Show this help")
                console.print("  [cyan]exit[/cyan] - Exit the program")
                console.print("  [cyan]load <file>[/cyan] - Load a dataset")
                console.print("  [cyan]analyze[/cyan] - Analyze current dataset")
                console.print("  [cyan]report[/cyan] - Generate analysis report")
                console.print("  [cyan]info[/cyan] - Show dataset info")
                console.print("  [cyan]sample[/cyan] - Show dataset sample")
                console.print("\n[bold]Example:[/bold]")
                console.print("  load sample_datasets/sample_economic_data.csv")
                continue
            
            if user_input.lower().startswith('load '):
                file_path = user_input[5:].strip()
                console.print(f"[cyan]Loading dataset: {file_path}[/cyan]")
                
                df, error = load_dataset(file_path)
                if error:
                    console.print(f"[red]Error: {error}[/red]")
                else:
                    current_dataset = df
                    current_analysis = None
                    console.print(f"[green]✅ Dataset loaded successfully![/green]")
                    console.print(f"[dim]Shape: {df.shape[0]:,} rows × {df.shape[1]} columns[/dim]")
                continue
            
            if user_input.lower() == 'analyze':
                if current_dataset is None:
                    console.print("[yellow]No dataset loaded. Use 'load <file>' first.[/yellow]")
                    continue
                
                console.print("[cyan]Analyzing dataset...[/cyan]")
                analysis, error = analyze_dataset(current_dataset)
                if error:
                    console.print(f"[red]Error: {error}[/red]")
                else:
                    current_analysis = analysis
                    console.print("[green]✅ Analysis completed![/green]")
                    
                    # Show quick summary
                    console.print(f"\n[bold]Quick Summary:[/bold]")
                    console.print(f"  • Shape: {analysis['shape'][0]:,} × {analysis['shape'][1]}")
                    console.print(f"  • Missing values: {sum(analysis['missing_values'].values()):,}")
                    console.print(f"  • Duplicates: {analysis['duplicates']:,}")
                    
                    if 'numeric_summary' in analysis:
                        console.print(f"  • Numeric columns: {len(analysis['numeric_summary'])}")
                    
                    if 'categorical_summary' in analysis:
                        console.print(f"  • Categorical columns: {len(analysis['categorical_summary'])}")
                continue
            
            if user_input.lower() == 'report':
                if current_analysis is None:
                    console.print("[yellow]No analysis available. Use 'analyze' first.[/yellow]")
                    continue
                
                console.print("[cyan]Generating report...[/cyan]")
                report, error = generate_report(current_analysis, "Dataset")
                if error:
                    console.print(f"[red]Error: {error}[/red]")
                else:
                    console.print(Panel(Markdown(report), title="[bold green]Analysis Report[/bold green]"))
                continue
            
            if user_input.lower() == 'info':
                if current_dataset is None:
                    console.print("[yellow]No dataset loaded.[/yellow]")
                    continue
                
                df = current_dataset
                console.print(f"\n[bold]Dataset Information:[/bold]")
                console.print(f"  • Shape: {df.shape[0]:,} rows × {df.shape[1]} columns")
                console.print(f"  • Memory: {df.memory_usage(deep=True).sum() / (1024**2):.2f} MB")
                console.print(f"  • Columns: {', '.join(df.columns[:5])}{'...' if len(df.columns) > 5 else ''}")
                console.print(f"  • Data types: {df.dtypes.value_counts().to_dict()}")
                continue
            
            if user_input.lower() == 'sample':
                if current_dataset is None:
                    console.print("[yellow]No dataset loaded.[/yellow]")
                    continue
                
                console.print(f"\n[bold]Dataset Sample (first 5 rows):[/bold]")
                console.print(current_dataset.head().to_string())
                continue
            
            # Handle file loading without 'load' command
            if any(ext in user_input.lower() for ext in ['.csv', '.xlsx', '.json', '.parquet']):
                # Extract potential file path
                words = user_input.split()
                for word in words:
                    if any(ext in word.lower() for ext in ['.csv', '.xlsx', '.json', '.parquet']):
                        console.print(f"[cyan]Attempting to load: {word}[/cyan]")
                        df, error = load_dataset(word)
                        if error:
                            console.print(f"[red]Error: {error}[/red]")
                        else:
                            current_dataset = df
                            current_analysis = None
                            console.print(f"[green]✅ Dataset loaded successfully![/green]")
                            console.print(f"[dim]Shape: {df.shape[0]:,} rows × {df.shape[1]} columns[/dim]")
                        break
                continue
            
            # Default response
            console.print("[yellow]Unknown command. Type 'help' for available commands.[/yellow]")
        
        except KeyboardInterrupt:
            console.print("\n[yellow]Interrupted by user[/yellow]")
            break
        except Exception as e:
            console.print(f"[red]Error: {str(e)}[/red]")

if __name__ == "__main__":
    main()