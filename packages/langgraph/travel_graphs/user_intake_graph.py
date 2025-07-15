"""
User Intake Graph for TravelAgentic
Converts the langflow user intake flow to LangGraph
Generates dynamic preference questions based on destination and travel details
"""

import json
import logging
from typing import Dict, Any, List

from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.graph import StateGraph, END

from .base_graph import BaseTravelGraph, GraphState

logger = logging.getLogger(__name__)

class UserIntakeGraph(BaseTravelGraph):
    """
    LangGraph implementation of the user intake workflow
    Generates contextual preference questions based on travel destination and details
    """
    
    def _build_graph(self):
        """Build the user intake graph workflow"""
        # Create the graph
        workflow = StateGraph(GraphState)
        
        # Add nodes
        workflow.add_node("validate_input", self._validate_input)
        workflow.add_node("generate_questions", self._generate_questions)
        workflow.add_node("validate_output", self._validate_output)
        
        # Add edges
        workflow.add_edge("validate_input", "generate_questions")
        workflow.add_edge("generate_questions", "validate_output")
        workflow.add_edge("validate_output", END)
        
        # Set entry point
        workflow.set_entry_point("validate_input")
        
        # Compile the graph
        self.graph = workflow.compile()
    
    async def _validate_input(self, state: GraphState) -> GraphState:
        """Validate the input data"""
        logger.info("Validating user intake input")
        
        input_data = state["input_data"]
        required_fields = ["destination", "start_date", "end_date", "travelers"]
        
        for field in required_fields:
            if field not in input_data:
                state["error"] = f"Missing required field: {field}"
                return state
        
        state["step_count"] += 1
        logger.info("Input validation successful")
        return state
    
    async def _generate_questions(self, state: GraphState) -> GraphState:
        """Generate dynamic preference questions using LLM"""
        logger.info("Generating preference questions")
        
        if state.get("error"):
            return state
        
        input_data = state["input_data"]
        
        # Create system message with travel context
        system_prompt = """You are TravelAgentic's intelligent preference collection agent. Based on the provided travel details, generate 3-5 contextually relevant multiple choice questions to understand the user's travel preferences better.

Focus on:
1. **Component Selection**: Which travel components are needed (flights, accommodation, activities)
2. Travel style (adventure, relaxation, cultural, business, mixed)
3. Accommodation preferences (hotel, Airbnb, hostel, resort, boutique)
4. Activity interests based on destination (outdoor, museums, nightlife, food, shopping, culture)
5. Budget allocation priorities (luxury accommodations, unique experiences, fine dining, balanced)
6. Special requirements (dietary, accessibility, pets, group dynamics)

ALWAYS include a component selection question as the first question to understand what the user needs:
{
  "id": "components_needed",
  "question": "Which travel components do you need help with?",
  "options": ["Flights + Hotels + Activities", "Hotels + Activities (I have my own transportation)", "Flights + Activities (I have accommodation)", "Activities only (I have flights and hotels)", "Flights + Hotels (just need transport and accommodation)", "Flights only (just need transportation)"],
  "required": true,
  "category": "components",
  "help_text": "This helps us focus on what you actually need"
}

For specific destinations, add contextually relevant questions:
- Tokyo/Japan: Traditional culture, modern technology, cuisine, pop culture, nature
- Paris/France: Art and museums, fashion, cuisine, history, romance
- London/UK: History, theater, pubs, royal sites, modern attractions
- New York: Broadway, museums, food scene, nightlife, shopping
- Bali: Beaches, temples, wellness, adventure, local culture

Return ONLY a JSON object in this exact format:
{
  "questions": [
    {
      "id": "travel_style",
      "question": "What's your primary travel style?",
      "options": ["Adventure", "Relaxation", "Cultural", "Business", "Mixed"],
      "required": true,
      "category": "general",
      "help_text": "This helps us tailor activity recommendations"
    }
  ]
}

Ensure questions are:
- Specific to the destination and season
- Appropriate for the number of travelers
- Considerate of the stated budget range
- Clear and easy to understand
- Focused on actionable preferences that affect booking decisions"""
        
        user_prompt = f"""Generate preference questions for this travel plan:

Destination: {input_data['destination']}
Travel dates: {input_data['start_date']} to {input_data['end_date']}
Number of travelers: {input_data['travelers']}
Budget: ${input_data.get('budget', 5000)}

Please generate 3-5 contextually relevant questions for this specific trip."""
        
        try:
            # Create messages
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ]
            
            # Get LLM response
            response = await self.llm.ainvoke(messages)
            
            # Parse the JSON response
            questions_data = json.loads(response.content)
            
            state["output_data"] = questions_data
            state["step_count"] += 1
            
            logger.info(f"Generated {len(questions_data.get('questions', []))} questions")
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {str(e)}")
            state["error"] = f"Invalid JSON response from LLM: {str(e)}"
        except Exception as e:
            logger.error(f"Question generation failed: {str(e)}")
            state["error"] = f"Question generation failed: {str(e)}"
        
        return state
    
    async def _validate_output(self, state: GraphState) -> GraphState:
        """Validate the generated questions"""
        logger.info("Validating generated questions")
        
        if state.get("error"):
            return state
        
        output_data = state.get("output_data", {})
        
        # Check if questions were generated
        if "questions" not in output_data:
            state["error"] = "No questions generated"
            return state
        
        questions = output_data["questions"]
        
        # Validate each question
        for i, question in enumerate(questions):
            required_fields = ["id", "question", "options", "required", "category"]
            for field in required_fields:
                if field not in question:
                    state["error"] = f"Question {i+1} missing required field: {field}"
                    return state
            
            # Validate options
            if not isinstance(question["options"], list) or len(question["options"]) < 2:
                state["error"] = f"Question {i+1} must have at least 2 options"
                return state
        
        state["step_count"] += 1
        logger.info(f"Validated {len(questions)} questions successfully")
        
        return state 