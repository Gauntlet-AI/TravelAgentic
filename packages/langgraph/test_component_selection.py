#!/usr/bin/env python3
"""
Test component selection functionality in TravelAgentic LangGraph
Tests various combinations of optional travel components
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, Any

from travel_graphs.orchestrator_graph import TravelOrchestratorGraph

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_future_date(days_from_now: int = 30) -> str:
    """Generate a future date string in YYYY-MM-DD format"""
    return (datetime.now() + timedelta(days=days_from_now)).strftime("%Y-%m-%d")

async def test_component_selection():
    """Test component selection functionality with different combinations"""
    
    print("🧪 Testing Component Selection Feature")
    print("=" * 50)
    
    # Initialize orchestrator
    orchestrator = TravelOrchestratorGraph()
    
    # Test cases for different component combinations
    test_cases = [
        {
            "name": "All Components (Default Behavior)",
            "input": {
                "automation_level": 3,
                "preferences": {
                    "destination": "San Francisco",
                    "start_date": get_future_date(30),
                    "end_date": get_future_date(33),
                    "travelers": 2,
                    "budget": 2000
                    # No components_needed - should default to all True
                }
            },
            "expect_components": ["flights", "hotels", "activities"]
        },
        {
            "name": "Local Trip (No Flights)",
            "input": {
                "automation_level": 3,
                "preferences": {
                    "destination": "Napa Valley",
                    "start_date": get_future_date(30),
                    "end_date": get_future_date(32),
                    "travelers": 2,
                    "budget": 1200,
                    "components_needed": {
                        "flights": False,
                        "hotels": True,
                        "activities": True
                    }
                }
            },
            "expect_components": ["hotels", "activities"]
        },
        {
            "name": "Day Trip (Activities Only)",
            "input": {
                "automation_level": 3,
                "preferences": {
                    "destination": "Monterey",
                    "start_date": get_future_date(30),
                    "end_date": get_future_date(30),
                    "travelers": 4,
                    "budget": 400,
                    "components_needed": {
                        "flights": False,
                        "hotels": False,
                        "activities": True
                    }
                }
            },
            "expect_components": ["activities"]
        },
        {
            "name": "Flights Only",
            "input": {
                "automation_level": 3,
                "preferences": {
                    "destination": "Seattle",
                    "start_date": get_future_date(30),
                    "end_date": get_future_date(33),
                    "travelers": 1,
                    "budget": 600,
                    "components_needed": {
                        "flights": True,
                        "hotels": False,
                        "activities": False
                    }
                }
            },
            "expect_components": ["flights"]
        }
    ]
    
    results = []
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🔬 Test {i}/{len(test_cases)}: {test_case['name']}")
        print("-" * 40)
        
        try:
            # Execute orchestrator with test input
            result = await orchestrator.run(test_case["input"])
            
            # Check results
            success = result.get("error") is None
            shopping_cart = result.get("shopping_cart", {})
            
            # Verify component structure
            expected_components = test_case["expect_components"]
            cart_structure_correct = True
            
            for component in ["flights", "hotels", "activities"]:
                should_exist = component in expected_components
                actual_value = shopping_cart.get(component)
                
                if should_exist:
                    # Should be an array (empty or with items)
                    if actual_value is None:
                        print(f"   ❌ {component}: Expected array, got None")
                        cart_structure_correct = False
                    else:
                        print(f"   ✅ {component}: {len(actual_value)} items")
                else:
                    # Should be None
                    if actual_value is not None:
                        print(f"   ❌ {component}: Expected None, got {type(actual_value)}")
                        cart_structure_correct = False
                    else:
                        print(f"   ✅ {component}: Not requested (None)")
            
            # Check parallel search agents
            parallel_search = result.get("parallel_search", {})
            agents_executed = list(parallel_search.get("agents", {}).keys()) if parallel_search else []
            
            expected_agents = []
            if "flights" in expected_components:
                expected_agents.append("flight_agent")
            if "hotels" in expected_components:
                expected_agents.append("lodging_agent")
            if "activities" in expected_components:
                expected_agents.append("activities_agent")
            
            agents_correct = set(agents_executed) == set(expected_agents)
            if not agents_correct:
                print(f"   ❌ Agents: Expected {expected_agents}, got {agents_executed}")
            else:
                print(f"   ✅ Agents: {agents_executed}")
            
            test_result = {
                "test_name": test_case["name"],
                "success": success,
                "cart_structure_correct": cart_structure_correct,
                "agents_correct": agents_correct,
                "overall_pass": success and cart_structure_correct and agents_correct
            }
            
            status = "✅ PASS" if test_result["overall_pass"] else "❌ FAIL"
            print(f"   {status}")
            
        except Exception as e:
            print(f"   ❌ EXCEPTION: {str(e)}")
            test_result = {
                "test_name": test_case["name"],
                "success": False,
                "error": str(e),
                "overall_pass": False
            }
        
        results.append(test_result)
    
    # Print summary
    print(f"\n{'=' * 50}")
    print("COMPONENT SELECTION TEST SUMMARY")
    print(f"{'=' * 50}")
    
    total_tests = len(results)
    passed_tests = sum(1 for r in results if r.get("overall_pass", False))
    
    print(f"Total tests: {total_tests}")
    print(f"Passed: {passed_tests}/{total_tests}")
    print(f"Failed: {total_tests - passed_tests}/{total_tests}")
    
    if passed_tests == total_tests:
        print("🎉 All component selection tests PASSED!")
        return True
    else:
        print("⚠️  Some component selection tests FAILED!")
        for result in results:
            if not result.get("overall_pass", False):
                print(f"   ❌ {result['test_name']}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_component_selection())
    exit(0 if success else 1) 