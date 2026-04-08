#!/usr/bin/env python3
"""
Agent Coordinator MCP Tool
Coordinates multiple agents and manages workflow
"""

from typing import Dict, Any, List, Optional
from .base_mcp_tool import BaseMCPTool
from .tool_registry import registry

class AgentCoordinator(BaseMCPTool):
    """MCP tool for coordinating multiple agents"""
    
    def __init__(self):
        super().__init__("agent_coordinator")
        self.active_workflows = {}
        self.workflow_history = []
        
    def get_capabilities(self) -> Dict[str, Any]:
        """Return tool capabilities"""
        return {
            "name": "agent_coordinator",
            "description": "Coordinates multiple agents and manages workflows",
            "actions": [
                "create_workflow",
                "execute_workflow",
                "get_workflow_status",
                "list_workflows",
                "coordinate_agents",
                "get_agent_status"
            ]
        }
    
    def execute(self, action: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute coordination action"""
        try:
            if action == "create_workflow":
                return self.create_workflow(
                    parameters.get("name"),
                    parameters.get("steps", [])
                )
            elif action == "execute_workflow":
                return self.execute_workflow(parameters.get("workflow_id"))
            elif action == "get_workflow_status":
                return self.get_workflow_status(parameters.get("workflow_id"))
            elif action == "list_workflows":
                return self.list_workflows()
            elif action == "coordinate_agents":
                return self.coordinate_agents(parameters.get("task"))
            elif action == "get_agent_status":
                return self.get_agent_status()
            else:
                return {"success": False, "error": f"Unknown action: {action}"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def create_workflow(self, name: str, steps: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Create a new workflow"""
        workflow_id = f"workflow_{len(self.active_workflows) + 1}"
        
        workflow = {
            "id": workflow_id,
            "name": name,
            "steps": steps,
            "status": "created",
            "current_step": 0,
            "results": [],
            "created_at": "2024-01-01T00:00:00"  # Placeholder
        }
        
        self.active_workflows[workflow_id] = workflow
        
        return {
            "success": True,
            "workflow_id": workflow_id,
            "message": f"Workflow '{name}' created with {len(steps)} steps"
        }
    
    def execute_workflow(self, workflow_id: str) -> Dict[str, Any]:
        """Execute a workflow"""
        if workflow_id not in self.active_workflows:
            return {"success": False, "error": "Workflow not found"}
        
        workflow = self.active_workflows[workflow_id]
        workflow["status"] = "running"
        
        results = []
        
        for i, step in enumerate(workflow["steps"]):
            workflow["current_step"] = i
            
            tool_name = step.get("tool")
            action = step.get("action")
            parameters = step.get("parameters", {})
            
            if not tool_name or not action:
                result = {"success": False, "error": "Invalid step configuration"}
            else:
                # Execute step using tool registry
                result = registry.execute_tool_action(tool_name, action, parameters)
            
            results.append({
                "step": i,
                "tool": tool_name,
                "action": action,
                "result": result
            })
            
            # Stop on error if configured
            if not result.get("success", False) and step.get("stop_on_error", True):
                workflow["status"] = "failed"
                break
        
        if workflow["status"] != "failed":
            workflow["status"] = "completed"
        
        workflow["results"] = results
        
        return {
            "success": True,
            "workflow_id": workflow_id,
            "status": workflow["status"],
            "steps_completed": len(results),
            "results": results
        }
    
    def get_workflow_status(self, workflow_id: str) -> Dict[str, Any]:
        """Get workflow status"""
        if workflow_id not in self.active_workflows:
            return {"success": False, "error": "Workflow not found"}
        
        workflow = self.active_workflows[workflow_id]
        
        return {
            "success": True,
            "workflow": {
                "id": workflow["id"],
                "name": workflow["name"],
                "status": workflow["status"],
                "current_step": workflow["current_step"],
                "total_steps": len(workflow["steps"]),
                "progress_percentage": (workflow["current_step"] / len(workflow["steps"])) * 100
            }
        }
    
    def list_workflows(self) -> Dict[str, Any]:
        """List all workflows"""
        workflows = []
        
        for workflow_id, workflow in self.active_workflows.items():
            workflows.append({
                "id": workflow_id,
                "name": workflow["name"],
                "status": workflow["status"],
                "steps": len(workflow["steps"]),
                "created_at": workflow["created_at"]
            })
        
        return {
            "success": True,
            "workflows": workflows,
            "total_workflows": len(workflows)
        }
    
    def coordinate_agents(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Coordinate multiple agents for a complex task"""
        task_type = task.get("type")
        
        if task_type == "full_analysis":
            # Create a comprehensive analysis workflow
            steps = [
                {
                    "tool": "data_processing",
                    "action": "get_info",
                    "parameters": {}
                },
                {
                    "tool": "data_cleaner",
                    "action": "assess_quality",
                    "parameters": {}
                },
                {
                    "tool": "advanced_eda",
                    "action": "data_profiling",
                    "parameters": {}
                },
                {
                    "tool": "advanced_eda",
                    "action": "correlation_analysis",
                    "parameters": {"method": "pearson"}
                },
                {
                    "tool": "report_editor",
                    "action": "create_new_report",
                    "parameters": {
                        "title": "Comprehensive Data Analysis Report",
                        "author": "AI Agent System"
                    }
                }
            ]
            
            return self.create_workflow("Full Analysis Pipeline", steps)
        
        elif task_type == "data_cleaning":
            # Create a data cleaning workflow
            steps = [
                {
                    "tool": "data_cleaner",
                    "action": "assess_quality",
                    "parameters": {}
                },
                {
                    "tool": "data_cleaner",
                    "action": "fix_missing_values",
                    "parameters": {"strategy": "auto"}
                },
                {
                    "tool": "data_cleaner",
                    "action": "remove_duplicates",
                    "parameters": {}
                },
                {
                    "tool": "data_cleaner",
                    "action": "fix_data_types",
                    "parameters": {}
                }
            ]
            
            return self.create_workflow("Data Cleaning Pipeline", steps)
        
        else:
            return {"success": False, "error": f"Unknown task type: {task_type}"}
    
    def get_agent_status(self) -> Dict[str, Any]:
        """Get status of all available agents"""
        tools = registry.list_tools()
        
        agent_status = []
        for tool in tools:
            status = {
                "name": tool["name"],
                "description": tool["description"],
                "available_actions": len(tool["actions"]),
                "status": "active" if tool["instantiated"] else "available"
            }
            agent_status.append(status)
        
        return {
            "success": True,
            "agents": agent_status,
            "total_agents": len(agent_status),
            "active_agents": len([a for a in agent_status if a["status"] == "active"])
        }