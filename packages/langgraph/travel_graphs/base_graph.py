"""
Base Graph Class for TravelAgentic LangGraph Workflows
"""

import os
import time
import uuid
import logging
from typing import Dict, Any, Optional, TypedDict
from abc import ABC, abstractmethod

from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

logger = logging.getLogger(__name__)

class GraphState(TypedDict):
    """Base state for all travel graphs"""
    execution_id: str
    execution_time: float
    input_data: Dict[str, Any]
    output_data: Dict[str, Any]
    error: Optional[str]
    step_count: int

class BaseTravelGraph(ABC):
    """
    Base class for all travel planning graphs
    Provides common functionality and structure
    """
    
    def __init__(self, model_name: str = "gpt-4-turbo"):
        self.model_name = model_name
        self.llm = self._initialize_llm()
        self.memory = MemorySaver()
        self.graph = None
        self._build_graph()
    
    def _initialize_llm(self):
        """Initialize the language model based on configuration"""
        try:
            if self.model_name.startswith("gpt"):
                return ChatOpenAI(
                    model=self.model_name,
                    temperature=0.7,
                    max_tokens=1500,
                    openai_api_key=os.getenv("OPENAI_API_KEY")
                )
            elif self.model_name.startswith("claude"):
                return ChatAnthropic(
                    model=self.model_name,
                    temperature=0.7,
                    max_tokens=1500,
                    anthropic_api_key=os.getenv("ANTHROPIC_API_KEY")
                )
            else:
                # Default to OpenAI
                return ChatOpenAI(
                    model="gpt-4-turbo",
                    temperature=0.7,
                    max_tokens=1500,
                    openai_api_key=os.getenv("OPENAI_API_KEY")
                )
        except Exception as e:
            logger.error(f"Failed to initialize LLM: {str(e)}")
            raise
    
    @abstractmethod
    def _build_graph(self):
        """Build the LangGraph workflow - must be implemented by subclasses"""
        pass
    
    def _create_initial_state(self, input_data: Dict[str, Any]) -> GraphState:
        """Create initial state for graph execution"""
        return GraphState(
            execution_id=str(uuid.uuid4()),
            execution_time=0.0,
            input_data=input_data,
            output_data={},
            error=None,
            step_count=0
        )
    
    async def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the graph with the given input data
        """
        start_time = time.time()
        
        try:
            # Create initial state
            initial_state = self._create_initial_state(input_data)
            
            # Create configuration for checkpointer
            config = {
                "configurable": {
                    "thread_id": initial_state.get("execution_id", str(uuid.uuid4())),
                    "checkpoint_ns": "travel_planning"
                }
            }
            
            # Execute the graph with configuration
            result = await self.graph.ainvoke(initial_state, config=config)
            
            # Calculate execution time
            execution_time = time.time() - start_time
            
            # Return result with metadata
            return {
                "success": True,
                "data": result.get("output_data", {}),
                "execution_id": result.get("execution_id"),
                "execution_time": execution_time,
                "step_count": result.get("step_count", 0)
            }
            
        except Exception as e:
            logger.error(f"Graph execution failed: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "execution_id": str(uuid.uuid4()),
                "execution_time": time.time() - start_time,
                "step_count": 0
            }
    
    def get_graph_info(self) -> Dict[str, Any]:
        """Get information about the graph structure"""
        return {
            "name": self.__class__.__name__,
            "model": self.model_name,
            "nodes": list(self.graph.nodes.keys()) if self.graph else [],
            "edges": len(self.graph.edges) if self.graph else 0
        } 