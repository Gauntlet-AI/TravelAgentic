"""
Prompt Templates for TravelAgentic LangGraph Workflows
Manages loading and accessing prompt templates from files
"""

import os
from pathlib import Path
from typing import Dict, Optional

class PromptManager:
    """
    Manages prompt templates for travel planning workflows
    """
    
    def __init__(self):
        self.prompts_dir = Path(__file__).parent.parent / "prompts"
        self._prompt_cache: Dict[str, str] = {}
    
    def load_prompt(self, prompt_name: str) -> str:
        """
        Load a prompt template from file
        
        Args:
            prompt_name: Name of the prompt file (without .txt extension)
            
        Returns:
            The prompt template content
        """
        if prompt_name in self._prompt_cache:
            return self._prompt_cache[prompt_name]
        
        prompt_file = self.prompts_dir / f"{prompt_name}.txt"
        
        if not prompt_file.exists():
            raise FileNotFoundError(f"Prompt file not found: {prompt_file}")
        
        with open(prompt_file, 'r', encoding='utf-8') as f:
            content = f.read().strip()
        
        self._prompt_cache[prompt_name] = content
        return content
    
    def get_orchestrator_prompt(self) -> str:
        """Get the orchestrator agent prompt"""
        return self.load_prompt("OrchestratorAgent")
    
    def get_flight_agent_prompt(self) -> str:
        """Get the flight agent prompt"""
        return self.load_prompt("FlightAgent")
    
    def get_lodging_agent_prompt(self) -> str:
        """Get the lodging agent prompt"""
        return self.load_prompt("LodgingAgent")
    
    def get_activities_agent_prompt(self) -> str:
        """Get the activities agent prompt"""
        return self.load_prompt("ActivitiesAgent")
    
    def list_available_prompts(self) -> list[str]:
        """List all available prompt templates"""
        if not self.prompts_dir.exists():
            return []
        
        return [
            f.stem for f in self.prompts_dir.glob("*.txt")
        ]
    
    def create_enhanced_prompt(self, base_prompt: str, **kwargs) -> str:
        """
        Create an enhanced prompt by substituting variables
        
        Args:
            base_prompt: The base prompt template
            **kwargs: Variables to substitute in the prompt
            
        Returns:
            Enhanced prompt with variables substituted
        """
        try:
            return base_prompt.format(**kwargs)
        except KeyError as e:
            raise ValueError(f"Missing variable for prompt substitution: {e}")

# Global prompt manager instance
prompt_manager = PromptManager() 