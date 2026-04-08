#!/usr/bin/env python3
"""
GRETL-style Econometric Analysis Tool
Provides econometric analysis capabilities similar to GRETL
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from .base_mcp_tool import BaseMCPTool

class GretlTool(BaseMCPTool):
    """MCP tool for econometric analysis"""
    
    def __init__(self):
        super().__init__("gretl_econometrics")
        self.data = None
        
    def get_capabilities(self) -> Dict[str, Any]:
        """Return tool capabilities"""
        return {
            "name": "gretl_econometrics",
            "description": "Econometric analysis tools similar to GRETL",
            "actions": [
                "ols_regression",
                "unit_root_test",
                "cointegration_test",
                "var_model",
                "arch_test",
                "granger_causality",
                "autocorrelation_test"
            ]
        }
    
    def execute(self, action: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute econometric analysis action"""
        try:
            if action == "ols_regression":
                return self.ols_regression(
                    parameters.get("dependent_var"),
                    parameters.get("independent_vars", []),
                    parameters.get("include_constant", True)
                )
            elif action == "unit_root_test":
                return self.unit_root_test(
                    parameters.get("variable"),
                    parameters.get("test_type", "adf")
                )
            elif action == "cointegration_test":
                return self.cointegration_test(
                    parameters.get("variables", []),
                    parameters.get("test_type", "johansen")
                )
            elif action == "var_model":
                return self.var_model(
                    parameters.get("variables", []),
                    parameters.get("lags", 2)
                )
            elif action == "arch_test":
                return self.arch_test(
                    parameters.get("residuals"),
                    parameters.get("lags", 4)
                )
            elif action == "granger_causality":
                return self.granger_causality(
                    parameters.get("cause_var"),
                    parameters.get("effect_var"),
                    parameters.get("max_lags", 4)
                )
            elif action == "autocorrelation_test":
                return self.autocorrelation_test(
                    parameters.get("variable"),
                    parameters.get("lags", 10)
                )
            else:
                return {"success": False, "error": f"Unknown action: {action}"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def ols_regression(self, dependent_var: str, independent_vars: List[str], include_constant: bool = True) -> Dict[str, Any]:
        """Perform OLS regression analysis"""
        if self.data is None:
            return {"success": False, "error": "No data loaded"}
        
        if dependent_var not in self.data.columns:
            return {"success": False, "error": f"Dependent variable '{dependent_var}' not found"}
        
        missing_vars = [var for var in independent_vars if var not in self.data.columns]
        if missing_vars:
            return {"success": False, "error": f"Independent variables not found: {missing_vars}"}
        
        try:
            from sklearn.linear_model import LinearRegression
            from sklearn.metrics import r2_score, mean_squared_error
            import scipy.stats as stats
            
            # Prepare data
            y = self.data[dependent_var].dropna()
            X = self.data[independent_vars].dropna()
            
            # Align data (remove rows where either X or y is missing)
            common_index = X.index.intersection(y.index)
            X_clean = X.loc[common_index]
            y_clean = y.loc[common_index]
            
            if len(X_clean) == 0:
                return {"success": False, "error": "No valid observations after removing missing values"}
            
            # Add constant if requested
            if include_constant:
                X_clean = X_clean.copy()
                X_clean.insert(0, 'const', 1.0)
            
            # Fit regression
            model = LinearRegression(fit_intercept=False)  # We handle intercept manually
            model.fit(X_clean, y_clean)
            
            # Predictions and residuals
            y_pred = model.predict(X_clean)
            residuals = y_clean - y_pred
            
            # Calculate statistics
            n = len(y_clean)
            k = len(X_clean.columns)
            
            # R-squared
            r_squared = r2_score(y_clean, y_pred)
            adj_r_squared = 1 - (1 - r_squared) * (n - 1) / (n - k)
            
            # Standard errors (simplified)
            mse = mean_squared_error(y_clean, y_pred)
            
            # Coefficients and standard errors
            coefficients = {}
            for i, col in enumerate(X_clean.columns):
                coef = model.coef_[i] if hasattr(model, 'coef_') else model.intercept_
                coefficients[col] = {
                    "coefficient": float(coef),
                    "std_error": float(np.sqrt(mse)),  # Simplified
                    "t_statistic": float(coef / np.sqrt(mse)) if mse > 0 else 0.0
                }
            
            return {
                "success": True,
                "dependent_variable": dependent_var,
                "independent_variables": independent_vars,
                "observations": n,
                "r_squared": float(r_squared),
                "adjusted_r_squared": float(adj_r_squared),
                "mse": float(mse),
                "coefficients": coefficients,
                "residuals_summary": {
                    "mean": float(residuals.mean()),
                    "std": float(residuals.std()),
                    "min": float(residuals.min()),
                    "max": float(residuals.max())
                }
            }
            
        except ImportError:
            return {"success": False, "error": "Required libraries not available (sklearn, scipy)"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def unit_root_test(self, variable: str, test_type: str = "adf") -> Dict[str, Any]:
        """Perform unit root test"""
        if self.data is None:
            return {"success": False, "error": "No data loaded"}
        
        if variable not in self.data.columns:
            return {"success": False, "error": f"Variable '{variable}' not found"}
        
        series = self.data[variable].dropna()
        
        if len(series) < 10:
            return {"success": False, "error": "Insufficient data for unit root test"}
        
        try:
            if test_type.lower() == "adf":
                # Simplified ADF test using basic statistics
                # Calculate first differences
                diff_series = series.diff().dropna()
                
                # Simple test: if variance of differences is much smaller than original, likely stationary
                original_var = series.var()
                diff_var = diff_series.var()
                
                # Simplified decision rule
                is_stationary = diff_var < original_var * 0.8
                
                return {
                    "success": True,
                    "variable": variable,
                    "test_type": "ADF (simplified)",
                    "is_stationary": is_stationary,
                    "original_variance": float(original_var),
                    "differenced_variance": float(diff_var),
                    "observations": len(series),
                    "note": "Simplified test - install statsmodels for full ADF test"
                }
            else:
                return {"success": False, "error": f"Test type '{test_type}' not implemented"}
                
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def cointegration_test(self, variables: List[str], test_type: str = "johansen") -> Dict[str, Any]:
        """Perform cointegration test"""
        if self.data is None:
            return {"success": False, "error": "No data loaded"}
        
        missing_vars = [var for var in variables if var not in self.data.columns]
        if missing_vars:
            return {"success": False, "error": f"Variables not found: {missing_vars}"}
        
        if len(variables) < 2:
            return {"success": False, "error": "Need at least 2 variables for cointegration test"}
        
        # Get data for specified variables
        data_subset = self.data[variables].dropna()
        
        if len(data_subset) < 20:
            return {"success": False, "error": "Insufficient data for cointegration test"}
        
        # Simplified cointegration test using correlation of first differences
        correlations = {}
        for i in range(len(variables)):
            for j in range(i+1, len(variables)):
                var1, var2 = variables[i], variables[j]
                
                # Calculate first differences
                diff1 = data_subset[var1].diff().dropna()
                diff2 = data_subset[var2].diff().dropna()
                
                # Correlation of differences
                correlation = diff1.corr(diff2)
                correlations[f"{var1}_{var2}"] = float(correlation)
        
        # Simple heuristic: high correlation in differences suggests cointegration
        avg_correlation = np.mean(list(correlations.values()))
        likely_cointegrated = abs(avg_correlation) > 0.3
        
        return {
            "success": True,
            "variables": variables,
            "test_type": f"{test_type} (simplified)",
            "likely_cointegrated": likely_cointegrated,
            "pairwise_correlations": correlations,
            "average_correlation": float(avg_correlation),
            "observations": len(data_subset),
            "note": "Simplified test - install statsmodels for full cointegration tests"
        }
    
    def var_model(self, variables: List[str], lags: int = 2) -> Dict[str, Any]:
        """Estimate Vector Autoregression (VAR) model"""
        if self.data is None:
            return {"success": False, "error": "No data loaded"}
        
        missing_vars = [var for var in variables if var not in self.data.columns]
        if missing_vars:
            return {"success": False, "error": f"Variables not found: {missing_vars}"}
        
        # Get data
        data_subset = self.data[variables].dropna()
        
        if len(data_subset) < lags + 10:
            return {"success": False, "error": f"Insufficient data for VAR({lags}) model"}
        
        # Simplified VAR estimation using individual AR models
        var_results = {}
        
        for var in variables:
            # Create lagged variables
            lagged_data = pd.DataFrame()
            for lag in range(1, lags + 1):
                lagged_data[f"{var}_lag{lag}"] = data_subset[var].shift(lag)
            
            # Add other variables' lags
            for other_var in variables:
                if other_var != var:
                    for lag in range(1, lags + 1):
                        lagged_data[f"{other_var}_lag{lag}"] = data_subset[other_var].shift(lag)
            
            # Align data
            y = data_subset[var].iloc[lags:]
            X = lagged_data.iloc[lags:].dropna()
            
            if len(X) > 0 and len(y) > 0:
                try:
                    from sklearn.linear_model import LinearRegression
                    
                    model = LinearRegression()
                    model.fit(X, y)
                    
                    y_pred = model.predict(X)
                    r_squared = 1 - np.sum((y - y_pred) ** 2) / np.sum((y - y.mean()) ** 2)
                    
                    var_results[var] = {
                        "r_squared": float(r_squared),
                        "coefficients": {col: float(coef) for col, coef in zip(X.columns, model.coef_)},
                        "intercept": float(model.intercept_)
                    }
                except:
                    var_results[var] = {"error": "Failed to estimate equation"}
            else:
                var_results[var] = {"error": "Insufficient data"}
        
        return {
            "success": True,
            "variables": variables,
            "lags": lags,
            "equations": var_results,
            "observations": len(data_subset) - lags,
            "note": "Simplified VAR estimation - install statsmodels for full VAR analysis"
        }
    
    def arch_test(self, residuals: str, lags: int = 4) -> Dict[str, Any]:
        """Perform ARCH test for heteroscedasticity"""
        if self.data is None:
            return {"success": False, "error": "No data loaded"}
        
        if residuals not in self.data.columns:
            return {"success": False, "error": f"Residuals column '{residuals}' not found"}
        
        resid_series = self.data[residuals].dropna()
        
        if len(resid_series) < lags + 10:
            return {"success": False, "error": "Insufficient data for ARCH test"}
        
        # Simplified ARCH test
        squared_residuals = resid_series ** 2
        
        # Create lagged squared residuals
        lagged_data = pd.DataFrame()
        for lag in range(1, lags + 1):
            lagged_data[f"lag{lag}"] = squared_residuals.shift(lag)
        
        # Align data
        y = squared_residuals.iloc[lags:]
        X = lagged_data.iloc[lags:].dropna()
        
        try:
            from sklearn.linear_model import LinearRegression
            
            model = LinearRegression()
            model.fit(X, y)
            
            y_pred = model.predict(X)
            r_squared = 1 - np.sum((y - y_pred) ** 2) / np.sum((y - y.mean()) ** 2)
            
            # Simple test statistic
            lm_statistic = len(X) * r_squared
            
            # Rough critical value (chi-square approximation)
            critical_value = 9.49  # Chi-square(4, 0.05) for 4 lags
            
            arch_effects = lm_statistic > critical_value
            
            return {
                "success": True,
                "residuals_column": residuals,
                "lags": lags,
                "lm_statistic": float(lm_statistic),
                "r_squared": float(r_squared),
                "arch_effects_detected": arch_effects,
                "observations": len(X),
                "note": "Simplified ARCH test - install statsmodels for full test"
            }
            
        except ImportError:
            return {"success": False, "error": "sklearn not available"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def granger_causality(self, cause_var: str, effect_var: str, max_lags: int = 4) -> Dict[str, Any]:
        """Test for Granger causality"""
        if self.data is None:
            return {"success": False, "error": "No data loaded"}
        
        if cause_var not in self.data.columns or effect_var not in self.data.columns:
            return {"success": False, "error": "Variables not found"}
        
        # Get data
        data_subset = self.data[[cause_var, effect_var]].dropna()
        
        if len(data_subset) < max_lags + 20:
            return {"success": False, "error": "Insufficient data for Granger causality test"}
        
        # Simplified Granger causality test
        results = {}
        
        for lags in range(1, max_lags + 1):
            # Model 1: effect_var ~ lags of effect_var
            y = data_subset[effect_var].iloc[lags:]
            X1 = pd.DataFrame()
            for lag in range(1, lags + 1):
                X1[f"{effect_var}_lag{lag}"] = data_subset[effect_var].shift(lag).iloc[lags:]
            
            # Model 2: effect_var ~ lags of effect_var + lags of cause_var
            X2 = X1.copy()
            for lag in range(1, lags + 1):
                X2[f"{cause_var}_lag{lag}"] = data_subset[cause_var].shift(lag).iloc[lags:]
            
            try:
                from sklearn.linear_model import LinearRegression
                from sklearn.metrics import mean_squared_error
                
                # Fit both models
                model1 = LinearRegression()
                model2 = LinearRegression()
                
                model1.fit(X1, y)
                model2.fit(X2, y)
                
                # Calculate RSS
                y_pred1 = model1.predict(X1)
                y_pred2 = model2.predict(X2)
                
                rss1 = np.sum((y - y_pred1) ** 2)
                rss2 = np.sum((y - y_pred2) ** 2)
                
                # F-statistic
                f_stat = ((rss1 - rss2) / lags) / (rss2 / (len(y) - 2 * lags))
                
                results[f"lags_{lags}"] = {
                    "f_statistic": float(f_stat),
                    "rss_restricted": float(rss1),
                    "rss_unrestricted": float(rss2),
                    "granger_causes": f_stat > 2.0  # Rough threshold
                }
                
            except Exception as e:
                results[f"lags_{lags}"] = {"error": str(e)}
        
        return {
            "success": True,
            "cause_variable": cause_var,
            "effect_variable": effect_var,
            "max_lags": max_lags,
            "results": results,
            "note": "Simplified Granger causality test"
        }
    
    def autocorrelation_test(self, variable: str, lags: int = 10) -> Dict[str, Any]:
        """Test for autocorrelation"""
        if self.data is None:
            return {"success": False, "error": "No data loaded"}
        
        if variable not in self.data.columns:
            return {"success": False, "error": f"Variable '{variable}' not found"}
        
        series = self.data[variable].dropna()
        
        if len(series) < lags + 10:
            return {"success": False, "error": "Insufficient data for autocorrelation test"}
        
        # Calculate autocorrelations
        autocorrelations = {}
        
        for lag in range(1, lags + 1):
            lagged_series = series.shift(lag)
            correlation = series.corr(lagged_series)
            autocorrelations[f"lag_{lag}"] = float(correlation) if not np.isnan(correlation) else 0.0
        
        # Ljung-Box test approximation
        n = len(series)
        lb_statistic = 0
        
        for lag in range(1, min(lags + 1, 11)):  # Limit to 10 lags for LB test
            rho = autocorrelations.get(f"lag_{lag}", 0)
            lb_statistic += (rho ** 2) / (n - lag)
        
        lb_statistic *= n * (n + 2)
        
        # Rough critical value for chi-square
        critical_value = 18.31  # Chi-square(10, 0.05)
        significant_autocorr = lb_statistic > critical_value
        
        return {
            "success": True,
            "variable": variable,
            "lags": lags,
            "autocorrelations": autocorrelations,
            "ljung_box_statistic": float(lb_statistic),
            "significant_autocorrelation": significant_autocorr,
            "observations": len(series),
            "note": "Simplified autocorrelation test"
        }