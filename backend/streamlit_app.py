#!/usr/bin/env python3
"""
Economic Analysis Streamlit Web Application
Provides a web-based GUI interface for the economic analysis system
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import os
import tempfile
from datetime import datetime
import json

# Configure Streamlit page
st.set_page_config(
    page_title="Economic Analysis System",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize session state
if 'dataset' not in st.session_state:
    st.session_state.dataset = None
if 'analysis_results' not in st.session_state:
    st.session_state.analysis_results = {}
if 'cleaning_report' not in st.session_state:
    st.session_state.cleaning_report = None

def main():
    """Main application function"""
    st.title("📊 Economic Analysis System")
    st.markdown("Comprehensive data analysis, cleaning, and reporting platform")
    
    # Sidebar navigation
    with st.sidebar:
        st.header("Navigation")
        page = st.selectbox(
            "Choose a section:",
            [
                "🏠 Home",
                "📁 Data Upload",
                "🧹 Data Cleaning", 
                "📊 Descriptive Analysis",
                "📈 Regression Analysis",
                "⏰ Time Series Analysis",
                "💰 Business Intelligence",
                "📄 Report Generator"
            ]
        )
    
    # Route to different pages
    if page == "🏠 Home":
        show_home()
    elif page == "📁 Data Upload":
        show_data_upload()
    elif page == "🧹 Data Cleaning":
        show_data_cleaning()
    elif page == "📊 Descriptive Analysis":
        show_descriptive_analysis()
    elif page == "📈 Regression Analysis":
        show_regression_analysis()
    elif page == "⏰ Time Series Analysis":
        show_time_series_analysis()
    elif page == "💰 Business Intelligence":
        show_business_intelligence()
    elif page == "📄 Report Generator":
        show_report_generator()

def show_home():
    """Show home page with overview"""
    col1, col2, col3 = st.columns([1, 2, 1])
    
    with col2:
        st.markdown("""
        ## Welcome to the Economic Analysis System
        
        This comprehensive platform provides advanced tools for:
        
        ### 📊 Data Management
        - Multi-format data upload (CSV, Excel, JSON)
        - Automated data quality assessment
        - Interactive data cleaning tools
        
        ### 📈 Economic Analysis
        - Descriptive statistics and correlation analysis
        - Linear and multiple regression analysis
        - Time series analysis and forecasting
        - Business intelligence dashboards
        
        ### 📄 Report Generation
        - Interactive report builder
        - Professional Word and PDF exports
        - Automated report generation from analysis
        
        ### 🚀 Getting Started
        1. **Upload your dataset** using the Data Upload section
        2. **Clean and validate** your data with our quality tools
        3. **Perform analysis** using various statistical methods
        4. **Generate reports** with your findings and insights
        """)
    
    # Show system status
    if st.session_state.dataset is not None:
        st.success(f"✅ Dataset loaded: {st.session_state.dataset.shape[0]} rows × {st.session_state.dataset.shape[1]} columns")
    else:
        st.info("👆 Start by uploading a dataset in the Data Upload section")

def show_data_upload():
    """Show data upload interface"""
    st.header("📁 Data Upload & Management")
    
    # File upload
    uploaded_file = st.file_uploader(
        "Choose a file",
        type=['csv', 'xlsx', 'xls', 'json'],
        help="Upload CSV, Excel, or JSON files for analysis"
    )
    
    if uploaded_file is not None:
        try:
            # Load the dataset based on file type
            if uploaded_file.name.endswith('.csv'):
                df = pd.read_csv(uploaded_file)
            elif uploaded_file.name.endswith(('.xlsx', '.xls')):
                df = pd.read_excel(uploaded_file)
            elif uploaded_file.name.endswith('.json'):
                df = pd.read_json(uploaded_file)
            
            st.session_state.dataset = df
            
            st.success(f"✅ File uploaded successfully!")
            
            # Show dataset info
            col1, col2, col3, col4 = st.columns(4)
            
            with col1:
                st.metric("Rows", f"{df.shape[0]:,}")
            with col2:
                st.metric("Columns", df.shape[1])
            with col3:
                st.metric("Memory Usage", f"{df.memory_usage(deep=True).sum() / 1024**2:.1f} MB")
            with col4:
                st.metric("Missing Values", f"{df.isnull().sum().sum():,}")
            
            # Show data preview
            st.subheader("📋 Data Preview")
            st.dataframe(df.head(10), use_container_width=True)
            
            # Show column information
            st.subheader("📊 Column Information")
            col_info = pd.DataFrame({
                'Column': df.columns,
                'Data Type': df.dtypes.astype(str),
                'Non-Null Count': df.count(),
                'Null Count': df.isnull().sum(),
                'Null %': (df.isnull().sum() / len(df) * 100).round(2)
            })
            st.dataframe(col_info, use_container_width=True)
            
        except Exception as e:
            st.error(f"Error loading file: {str(e)}")
    
    # Sample datasets section
    st.subheader("📊 Try Sample Datasets")
    
    sample_datasets = {
        "Clean Economic Data": "sample_datasets/sample_economic_data.csv",
        "Messy Economic Data": "sample_datasets/messy_economic_data.csv", 
        "Complex Economic Data": "sample_datasets/complex_economic_data.csv",
        "Problematic Business Data": "sample_datasets/problematic_data.csv"
    }
    
    selected_sample = st.selectbox("Choose a sample dataset:", list(sample_datasets.keys()))
    
    if st.button("Load Sample Dataset"):
        try:
            sample_path = sample_datasets[selected_sample]
            if os.path.exists(sample_path):
                df = pd.read_csv(sample_path)
                st.session_state.dataset = df
                st.success(f"✅ Sample dataset '{selected_sample}' loaded successfully!")
                st.rerun()
            else:
                st.error(f"Sample dataset not found: {sample_path}")
        except Exception as e:
            st.error(f"Error loading sample dataset: {str(e)}")

def show_data_cleaning():
    """Show data cleaning interface"""
    st.header("🧹 Data Cleaning & Quality Control")
    
    if st.session_state.dataset is None:
        st.warning("Please upload a dataset first.")
        return
    
    df = st.session_state.dataset
    
    # Data quality overview
    st.subheader("📊 Data Quality Overview")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        missing_pct = (df.isnull().sum().sum() / (df.shape[0] * df.shape[1])) * 100
        st.metric("Missing Data %", f"{missing_pct:.1f}%")
    
    with col2:
        duplicates = df.duplicated().sum()
        st.metric("Duplicate Rows", duplicates)
    
    with col3:
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        quality_score = max(0, 100 - missing_pct - (duplicates/len(df)*10))
        st.metric("Quality Score", f"{quality_score:.0f}/100")
    
    with col4:
        data_types = len(df.dtypes.unique())
        st.metric("Data Types", data_types)
    
    # Missing values analysis
    st.subheader("🔍 Missing Values Analysis")
    
    missing_data = df.isnull().sum()
    missing_data = missing_data[missing_data > 0].sort_values(ascending=False)
    
    if len(missing_data) > 0:
        fig = px.bar(
            x=missing_data.values,
            y=missing_data.index,
            orientation='h',
            title="Missing Values by Column",
            labels={'x': 'Missing Count', 'y': 'Column'}
        )
        st.plotly_chart(fig, use_container_width=True)
        
        # Missing value treatment options
        st.subheader("🔧 Missing Value Treatment")
        
        col1, col2 = st.columns(2)
        
        with col1:
            missing_strategy = st.selectbox(
                "Treatment Strategy",
                ["Drop rows with missing values", "Fill with mean/mode", "Forward fill", "Backward fill"]
            )
        
        with col2:
            if st.button("Apply Treatment"):
                if missing_strategy == "Drop rows with missing values":
                    st.session_state.dataset = df.dropna()
                    st.success("Rows with missing values removed")
                elif missing_strategy == "Fill with mean/mode":
                    df_filled = df.copy()
                    for col in df.columns:
                        if df[col].dtype in ['int64', 'float64']:
                            df_filled[col].fillna(df[col].mean(), inplace=True)
                        else:
                            df_filled[col].fillna(df[col].mode()[0] if len(df[col].mode()) > 0 else 'Unknown', inplace=True)
                    st.session_state.dataset = df_filled
                    st.success("Missing values filled with mean/mode")
                elif missing_strategy == "Forward fill":
                    st.session_state.dataset = df.fillna(method='ffill')
                    st.success("Missing values forward filled")
                elif missing_strategy == "Backward fill":
                    st.session_state.dataset = df.fillna(method='bfill')
                    st.success("Missing values backward filled")
                st.rerun()
    else:
        st.success("✅ No missing values found!")
    
    # Duplicate analysis
    st.subheader("🔍 Duplicate Analysis")
    
    if duplicates > 0:
        st.warning(f"Found {duplicates} duplicate rows")
        
        if st.button("Remove Duplicates"):
            st.session_state.dataset = df.drop_duplicates()
            st.success("Duplicate rows removed")
            st.rerun()
    else:
        st.success("✅ No duplicate rows found!")
    
    # Outlier detection
    st.subheader("📊 Outlier Detection")
    
    if len(numeric_cols) > 0:
        selected_col = st.selectbox("Select column for outlier analysis:", numeric_cols)
        
        if selected_col:
            col_data = df[selected_col].dropna()
            
            # Calculate outliers using IQR method
            Q1 = col_data.quantile(0.25)
            Q3 = col_data.quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            outliers = col_data[(col_data < lower_bound) | (col_data > upper_bound)]
            
            col1, col2 = st.columns(2)
            
            with col1:
                st.metric("Outliers Found", len(outliers))
                st.metric("Outlier %", f"{len(outliers)/len(col_data)*100:.1f}%")
            
            with col2:
                # Box plot
                fig = px.box(y=col_data, title=f"Box Plot: {selected_col}")
                st.plotly_chart(fig, use_container_width=True)
    else:
        st.info("No numeric columns available for outlier analysis")

def show_descriptive_analysis():
    """Show descriptive analysis interface"""
    st.header("📊 Descriptive Analysis")
    
    if st.session_state.dataset is None:
        st.warning("Please upload a dataset first.")
        return
    
    df = st.session_state.dataset
    
    # Summary statistics
    st.subheader("📈 Summary Statistics")
    
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    categorical_cols = df.select_dtypes(include=['object', 'category']).columns
    
    if len(numeric_cols) > 0:
        st.markdown("**Numeric Variables:**")
        st.dataframe(df[numeric_cols].describe(), use_container_width=True)
    
    if len(categorical_cols) > 0:
        st.markdown("**Categorical Variables:**")
        cat_summary = pd.DataFrame({
            'Column': categorical_cols,
            'Unique Values': [df[col].nunique() for col in categorical_cols],
            'Most Frequent': [df[col].mode()[0] if len(df[col].mode()) > 0 else 'N/A' for col in categorical_cols],
            'Frequency': [df[col].value_counts().iloc[0] if len(df[col].value_counts()) > 0 else 0 for col in categorical_cols]
        })
        st.dataframe(cat_summary, use_container_width=True)
    
    # Correlation analysis
    if len(numeric_cols) > 1:
        st.subheader("🔗 Correlation Analysis")
        
        correlation_matrix = df[numeric_cols].corr()
        
        fig = px.imshow(
            correlation_matrix,
            title="Correlation Matrix",
            color_continuous_scale="RdBu",
            aspect="auto"
        )
        st.plotly_chart(fig, use_container_width=True)
        
        # Strong correlations
        st.subheader("💪 Strong Correlations (|r| > 0.7)")
        strong_corr = []
        for i in range(len(correlation_matrix.columns)):
            for j in range(i+1, len(correlation_matrix.columns)):
                corr_val = correlation_matrix.iloc[i, j]
                if abs(corr_val) > 0.7:
                    strong_corr.append({
                        'Variable 1': correlation_matrix.columns[i],
                        'Variable 2': correlation_matrix.columns[j],
                        'Correlation': round(corr_val, 3)
                    })
        
        if strong_corr:
            st.dataframe(pd.DataFrame(strong_corr), use_container_width=True)
        else:
            st.info("No strong correlations found (|r| > 0.7)")
    
    # Distribution analysis
    st.subheader("📊 Distribution Analysis")
    
    if len(numeric_cols) > 0:
        selected_var = st.selectbox("Select variable for distribution analysis:", numeric_cols)
        
        col1, col2 = st.columns(2)
        
        with col1:
            # Histogram
            fig = px.histogram(df, x=selected_var, title=f"Distribution of {selected_var}")
            st.plotly_chart(fig, use_container_width=True)
        
        with col2:
            # Box plot
            fig = px.box(df, y=selected_var, title=f"Box Plot of {selected_var}")
            st.plotly_chart(fig, use_container_width=True)

def show_regression_analysis():
    """Show regression analysis interface"""
    st.header("📈 Regression Analysis")
    
    if st.session_state.dataset is None:
        st.warning("Please upload a dataset first.")
        return
    
    df = st.session_state.dataset
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    
    if len(numeric_cols) < 2:
        st.error("Need at least 2 numeric columns for regression analysis.")
        return
    
    # Variable selection
    st.subheader("🎯 Variable Selection")
    
    col1, col2 = st.columns(2)
    
    with col1:
        dependent_var = st.selectbox("Dependent Variable (Y):", numeric_cols)
    
    with col2:
        independent_vars = st.multiselect("Independent Variables (X):", 
                                        [col for col in numeric_cols if col != dependent_var])
    
    if dependent_var and independent_vars:
        if st.button("Run Regression Analysis"):
            try:
                from sklearn.linear_model import LinearRegression
                from sklearn.metrics import r2_score, mean_squared_error
                import scipy.stats as stats
                
                # Prepare data
                X = df[independent_vars].dropna()
                y = df[dependent_var].dropna()
                
                # Align X and y
                common_index = X.index.intersection(y.index)
                X = X.loc[common_index]
                y = y.loc[common_index]
                
                # Fit model
                model = LinearRegression()
                model.fit(X, y)
                
                # Predictions
                y_pred = model.predict(X)
                
                # Results
                r2 = r2_score(y, y_pred)
                mse = mean_squared_error(y, y_pred)
                rmse = np.sqrt(mse)
                
                # Display results
                st.subheader("📊 Regression Results")
                
                col1, col2, col3 = st.columns(3)
                
                with col1:
                    st.metric("R-squared", f"{r2:.4f}")
                with col2:
                    st.metric("RMSE", f"{rmse:.4f}")
                with col3:
                    st.metric("Observations", len(X))
                
                # Coefficients
                st.subheader("📈 Coefficients")
                coef_df = pd.DataFrame({
                    'Variable': ['Intercept'] + independent_vars,
                    'Coefficient': [model.intercept_] + list(model.coef_),
                })
                st.dataframe(coef_df, use_container_width=True)
                
                # Residual plot
                st.subheader("📊 Residual Analysis")
                residuals = y - y_pred
                
                col1, col2 = st.columns(2)
                
                with col1:
                    fig = px.scatter(x=y_pred, y=residuals, title="Residuals vs Fitted Values")
                    fig.add_hline(y=0, line_dash="dash", line_color="red")
                    st.plotly_chart(fig, use_container_width=True)
                
                with col2:
                    fig = px.histogram(residuals, title="Distribution of Residuals")
                    st.plotly_chart(fig, use_container_width=True)
                
                # Store results
                st.session_state.analysis_results['regression'] = {
                    'r2': r2,
                    'rmse': rmse,
                    'coefficients': coef_df.to_dict('records'),
                    'dependent_var': dependent_var,
                    'independent_vars': independent_vars
                }
                
            except Exception as e:
                st.error(f"Error in regression analysis: {str(e)}")

def show_time_series_analysis():
    """Show time series analysis interface"""
    st.header("⏰ Time Series Analysis")
    
    if st.session_state.dataset is None:
        st.warning("Please upload a dataset first.")
        return
    
    df = st.session_state.dataset
    
    # Date column selection
    date_cols = []
    for col in df.columns:
        if df[col].dtype == 'object':
            # Try to parse as date
            try:
                pd.to_datetime(df[col].head())
                date_cols.append(col)
            except:
                pass
    
    if not date_cols:
        st.error("No date columns found. Please ensure your dataset has a date column.")
        return
    
    st.subheader("📅 Time Series Configuration")
    
    col1, col2 = st.columns(2)
    
    with col1:
        date_col = st.selectbox("Date Column:", date_cols)
    
    with col2:
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        value_col = st.selectbox("Value Column:", numeric_cols)
    
    if date_col and value_col:
        try:
            # Prepare time series data
            ts_df = df[[date_col, value_col]].copy()
            ts_df[date_col] = pd.to_datetime(ts_df[date_col])
            ts_df = ts_df.set_index(date_col).sort_index()
            ts_df = ts_df.dropna()
            
            # Time series plot
            st.subheader("📈 Time Series Plot")
            fig = px.line(ts_df, y=value_col, title=f"Time Series: {value_col}")
            st.plotly_chart(fig, use_container_width=True)
            
            # Basic statistics
            st.subheader("📊 Time Series Statistics")
            
            col1, col2, col3, col4 = st.columns(4)
            
            with col1:
                st.metric("Observations", len(ts_df))
            with col2:
                st.metric("Mean", f"{ts_df[value_col].mean():.2f}")
            with col3:
                st.metric("Std Dev", f"{ts_df[value_col].std():.2f}")
            with col4:
                trend = "Increasing" if ts_df[value_col].iloc[-1] > ts_df[value_col].iloc[0] else "Decreasing"
                st.metric("Trend", trend)
            
            # Simple forecasting
            st.subheader("🔮 Simple Forecast")
            
            forecast_periods = st.slider("Forecast Periods:", 1, 24, 12)
            
            if st.button("Generate Forecast"):
                try:
                    from sklearn.linear_model import LinearRegression
                    
                    # Simple linear trend forecast
                    X = np.arange(len(ts_df)).reshape(-1, 1)
                    y = ts_df[value_col].values
                    
                    model = LinearRegression()
                    model.fit(X, y)
                    
                    # Generate forecast
                    future_X = np.arange(len(ts_df), len(ts_df) + forecast_periods).reshape(-1, 1)
                    forecast = model.predict(future_X)
                    
                    # Create forecast dates
                    last_date = ts_df.index[-1]
                    future_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), 
                                               periods=forecast_periods, freq='D')
                    
                    # Plot with forecast
                    fig = go.Figure()
                    
                    # Historical data
                    fig.add_trace(go.Scatter(
                        x=ts_df.index,
                        y=ts_df[value_col],
                        mode='lines',
                        name='Historical',
                        line=dict(color='blue')
                    ))
                    
                    # Forecast
                    fig.add_trace(go.Scatter(
                        x=future_dates,
                        y=forecast,
                        mode='lines',
                        name='Forecast',
                        line=dict(color='red', dash='dash')
                    ))
                    
                    fig.update_layout(title=f"Forecast: {value_col}")
                    st.plotly_chart(fig, use_container_width=True)
                    
                    # Store results
                    st.session_state.analysis_results['timeseries'] = {
                        'forecast_values': forecast.tolist(),
                        'forecast_dates': future_dates.strftime('%Y-%m-%d').tolist(),
                        'periods': forecast_periods
                    }
                    
                except Exception as e:
                    st.error(f"Error in forecasting: {str(e)}")
        
        except Exception as e:
            st.error(f"Error processing time series data: {str(e)}")

def show_business_intelligence():
    """Show business intelligence dashboard"""
    st.header("💰 Business Intelligence Dashboard")
    
    if st.session_state.dataset is None:
        st.warning("Please upload a dataset first.")
        return
    
    df = st.session_state.dataset
    
    # KPI Overview
    st.subheader("📊 Key Performance Indicators")
    
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    
    if len(numeric_cols) >= 4:
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            kpi1 = df[numeric_cols[0]].sum()
            st.metric(f"Total {numeric_cols[0]}", f"{kpi1:,.0f}")
        
        with col2:
            kpi2 = df[numeric_cols[1]].mean()
            st.metric(f"Avg {numeric_cols[1]}", f"{kpi2:.2f}")
        
        with col3:
            kpi3 = df[numeric_cols[2]].max()
            st.metric(f"Max {numeric_cols[2]}", f"{kpi3:.2f}")
        
        with col4:
            kpi4 = len(df)
            st.metric("Total Records", f"{kpi4:,}")
    
    # Interactive charts
    st.subheader("📈 Interactive Visualizations")
    
    if len(numeric_cols) > 0:
        chart_type = st.selectbox("Chart Type:", ["Bar Chart", "Line Chart", "Scatter Plot", "Pie Chart"])
        
        if chart_type in ["Bar Chart", "Line Chart", "Scatter Plot"]:
            col1, col2 = st.columns(2)
            
            with col1:
                x_axis = st.selectbox("X-axis:", df.columns)
            
            with col2:
                y_axis = st.selectbox("Y-axis:", numeric_cols)
            
            if x_axis and y_axis:
                if chart_type == "Bar Chart":
                    fig = px.bar(df.head(20), x=x_axis, y=y_axis, title=f"{y_axis} by {x_axis}")
                elif chart_type == "Line Chart":
                    fig = px.line(df.head(50), x=x_axis, y=y_axis, title=f"{y_axis} over {x_axis}")
                elif chart_type == "Scatter Plot":
                    fig = px.scatter(df, x=x_axis, y=y_axis, title=f"{y_axis} vs {x_axis}")
                
                st.plotly_chart(fig, use_container_width=True)
        
        elif chart_type == "Pie Chart":
            categorical_cols = df.select_dtypes(include=['object']).columns
            if len(categorical_cols) > 0:
                pie_col = st.selectbox("Category Column:", categorical_cols)
                if pie_col:
                    value_counts = df[pie_col].value_counts().head(10)
                    fig = px.pie(values=value_counts.values, names=value_counts.index, 
                               title=f"Distribution of {pie_col}")
                    st.plotly_chart(fig, use_container_width=True)
    
    # Data insights
    st.subheader("🔍 Data Insights")
    
    insights = []
    
    # Missing data insight
    missing_pct = (df.isnull().sum().sum() / (df.shape[0] * df.shape[1])) * 100
    if missing_pct > 5:
        insights.append(f"⚠️ High missing data: {missing_pct:.1f}% of values are missing")
    elif missing_pct > 0:
        insights.append(f"ℹ️ Some missing data: {missing_pct:.1f}% of values are missing")
    else:
        insights.append("✅ No missing data found")
    
    # Duplicate insight
    duplicates = df.duplicated().sum()
    if duplicates > 0:
        insights.append(f"⚠️ Found {duplicates} duplicate rows ({duplicates/len(df)*100:.1f}%)")
    else:
        insights.append("✅ No duplicate rows found")
    
    # Data distribution insights
    for col in numeric_cols[:3]:  # Check first 3 numeric columns
        skewness = df[col].skew()
        if abs(skewness) > 1:
            insights.append(f"📊 {col} is highly skewed (skewness: {skewness:.2f})")
    
    for insight in insights:
        st.write(insight)

def show_report_generator():
    """Show report generation interface"""
    st.header("📄 Report Generator")
    
    if st.session_state.dataset is None:
        st.warning("Please upload a dataset first.")
        return
    
    # Report configuration
    st.subheader("⚙️ Report Configuration")
    
    col1, col2 = st.columns(2)
    
    with col1:
        report_title = st.text_input("Report Title", "Economic Analysis Report")
        report_author = st.text_input("Author", "Data Analyst")
    
    with col2:
        report_format = st.selectbox("Export Format", ["Word Document", "PDF Document"])
        include_charts = st.checkbox("Include Charts", True)
    
    # Report sections
    st.subheader("📋 Report Sections")
    
    sections = []
    
    # Executive Summary
    if st.checkbox("Executive Summary", True):
        exec_summary = st.text_area(
            "Executive Summary Content",
            "This report presents a comprehensive analysis of the economic dataset...",
            height=100
        )
        sections.append({"heading": "Executive Summary", "content": exec_summary})
    
    # Dataset Overview
    if st.checkbox("Dataset Overview", True):
        df = st.session_state.dataset
        overview_content = f"""
        The dataset contains {df.shape[0]:,} observations across {df.shape[1]} variables.
        
        **Key Statistics:**
        - Total records: {len(df):,}
        - Numeric variables: {len(df.select_dtypes(include=[np.number]).columns)}
        - Categorical variables: {len(df.select_dtypes(include=['object']).columns)}
        - Missing values: {df.isnull().sum().sum():,} ({(df.isnull().sum().sum()/(df.shape[0]*df.shape[1])*100):.1f}%)
        """
        sections.append({"heading": "Dataset Overview", "content": overview_content})
    
    # Analysis Results
    if st.checkbox("Analysis Results", True):
        analysis_content = "## Analysis Results\n\n"
        
        if 'regression' in st.session_state.analysis_results:
            reg_results = st.session_state.analysis_results['regression']
            analysis_content += f"""
            ### Regression Analysis
            - R-squared: {reg_results['r2']:.4f}
            - RMSE: {reg_results['rmse']:.4f}
            - Dependent Variable: {reg_results['dependent_var']}
            - Independent Variables: {', '.join(reg_results['independent_vars'])}
            
            """
        
        if 'timeseries' in st.session_state.analysis_results:
            ts_results = st.session_state.analysis_results['timeseries']
            analysis_content += f"""
            ### Time Series Forecast
            - Forecast periods: {ts_results['periods']}
            - Forecast generated for future trends
            
            """
        
        if analysis_content == "## Analysis Results\n\n":
            analysis_content += "No analysis results available. Please run some analysis first."
        
        sections.append({"heading": "Analysis Results", "content": analysis_content})
    
    # Generate report
    st.subheader("🚀 Generate Report")
    
    if st.button("Generate Report", type="primary"):
        try:
            # Import report generation tools
            from mcp_tools.report_editor import ReportEditor
            
            # Create report
            report_editor = ReportEditor()
            report_editor.create_new_report(report_title, report_author)
            
            # Add sections
            for section in sections:
                report_editor.add_section(section["heading"], section["content"])
            
            # Export report
            if report_format == "Word Document":
                filename = f"{report_title.replace(' ', '_')}.docx"
                result = report_editor.export_to_word(filename)
                
                if os.path.exists(filename):
                    with open(filename, "rb") as file:
                        st.download_button(
                            label="📄 Download Word Report",
                            data=file.read(),
                            file_name=filename,
                            mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        )
                    st.success("✅ Word report generated successfully!")
                else:
                    st.error("Failed to generate Word report")
            
            elif report_format == "PDF Document":
                filename = f"{report_title.replace(' ', '_')}.pdf"
                result = report_editor.export_to_pdf(filename)
                
                if os.path.exists(filename):
                    with open(filename, "rb") as file:
                        st.download_button(
                            label="📑 Download PDF Report",
                            data=file.read(),
                            file_name=filename,
                            mime="application/pdf"
                        )
                    st.success("✅ PDF report generated successfully!")
                else:
                    st.error("Failed to generate PDF report")
        
        except Exception as e:
            st.error(f"Error generating report: {str(e)}")
    
    # Report preview
    if sections:
        st.subheader("👀 Report Preview")
        
        st.markdown(f"# {report_title}")
        st.markdown(f"**Author:** {report_author}")
        st.markdown(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        st.markdown("---")
        
        for section in sections:
            st.markdown(f"## {section['heading']}")
            st.markdown(section['content'])
            st.markdown("---")

if __name__ == "__main__":
    main()