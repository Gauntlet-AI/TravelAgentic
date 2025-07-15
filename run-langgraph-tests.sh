#!/bin/bash
# run-langgraph-tests.sh - Run LangGraph tests in Docker environment

set -e  # Exit on any error

echo "🧪 TravelAgentic LangGraph Testing Suite"
echo "========================================"

# Available test files
TESTS=(
    "test_orchestrator.py"
    "test_webserver_client.py" 
    "test_amadeus_only.py"
    "test_orchestrator_webserver.py"
    "test_amadeus_validation.py"
    "test_component_selection.py"
    "test_simple_flight.py"
)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to run a specific test
run_test() {
    local test_file=$1
    local method=$2
    
    echo -e "\n${BLUE}🔬 Running: $test_file${NC}"
    echo "----------------------------------------"
    
    case $method in
        "exec")
            # Run in existing container
            if docker-compose ps langgraph | grep -q "Up"; then
                docker-compose exec langgraph python "$test_file"
            else
                echo -e "${RED}❌ LangGraph service not running. Start with: docker-compose up -d${NC}"
                return 1
            fi
            ;;
        "run")
            # Run in temporary container
            docker-compose run --rm langgraph python "$test_file"
            ;;
        "test-service")
            # Use dedicated test service
            docker-compose --profile testing run --rm langgraph-test python "$test_file"
            ;;
    esac
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $test_file passed${NC}"
    else
        echo -e "${RED}❌ $test_file failed${NC}"
        return 1
    fi
}

# Function to check services
check_services() {
    echo -e "\n${BLUE}🔍 Checking service status...${NC}"
    
    if docker-compose ps web | grep -q "Up"; then
        echo -e "${GREEN}✅ Web service running${NC}"
    else
        echo -e "${YELLOW}⚠️  Web service not running${NC}"
    fi
    
    if docker-compose ps langgraph | grep -q "Up"; then
        echo -e "${GREEN}✅ LangGraph service running${NC}"
    else
        echo -e "${YELLOW}⚠️  LangGraph service not running${NC}"
    fi
    
    if docker-compose ps redis | grep -q "Up"; then
        echo -e "${GREEN}✅ Redis service running${NC}"
    else
        echo -e "${YELLOW}⚠️  Redis service not running${NC}"
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [COMMAND] [TEST_FILE]"
    echo ""
    echo "Commands:"
    echo "  all                    Run all tests"
    echo "  list                   List available tests"
    echo "  status                 Check service status"
    echo "  shell                  Open interactive shell in container"
    echo "  [test_file]            Run specific test file"
    echo ""
    echo "Available tests:"
    for test in "${TESTS[@]}"; do
        echo "  - $test"
    done
    echo ""
    echo "Examples:"
    echo "  $0 all                                    # Run all tests"
    echo "  $0 test_orchestrator.py                  # Run specific test"
    echo "  $0 shell                                  # Interactive shell"
    echo "  $0 status                                 # Check services"
}

# Main script logic
case "${1:-help}" in
    "all")
        check_services
        echo -e "\n${BLUE}🚀 Running all LangGraph tests...${NC}"
        
        # Determine method based on service status
        if docker-compose ps langgraph | grep -q "Up"; then
            method="exec"
            echo -e "${GREEN}Using existing containers${NC}"
        else
            method="run"
            echo -e "${YELLOW}Starting temporary containers${NC}"
        fi
        
        failed_tests=()
        for test in "${TESTS[@]}"; do
            if ! run_test "$test" "$method"; then
                failed_tests+=("$test")
            fi
        done
        
        echo -e "\n${BLUE}📊 Test Results${NC}"
        echo "=============="
        
        if [ ${#failed_tests[@]} -eq 0 ]; then
            echo -e "${GREEN}🎉 All tests passed!${NC}"
            exit 0
        else
            echo -e "${RED}❌ Failed tests:${NC}"
            for test in "${failed_tests[@]}"; do
                echo -e "${RED}  - $test${NC}"
            done
            exit 1
        fi
        ;;
        
    "list")
        echo "Available test files:"
        for test in "${TESTS[@]}"; do
            echo "  📁 $test"
        done
        ;;
        
    "status")
        check_services
        ;;
        
    "shell")
        echo -e "${BLUE}🐚 Opening interactive shell in LangGraph container...${NC}"
        if docker-compose ps langgraph | grep -q "Up"; then
            docker-compose exec langgraph bash
        else
            echo -e "${YELLOW}Starting temporary container...${NC}"
            docker-compose run --rm langgraph bash
        fi
        ;;
        
    "help"|"-h"|"--help")
        show_usage
        ;;
        
    *.py)
        # Run specific test file
        test_file="$1"
        
        # Check if test file exists in our list
        if [[ " ${TESTS[@]} " =~ " ${test_file} " ]]; then
            check_services
            
            # Determine method
            if docker-compose ps langgraph | grep -q "Up"; then
                method="exec"
                echo -e "${GREEN}Using existing container${NC}"
            else
                method="run"
                echo -e "${YELLOW}Starting temporary container${NC}"
            fi
            
            run_test "$test_file" "$method"
        else
            echo -e "${RED}❌ Test file '$test_file' not found${NC}"
            echo -e "${BLUE}Available tests:${NC}"
            for test in "${TESTS[@]}"; do
                echo "  - $test"
            done
            exit 1
        fi
        ;;
        
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        show_usage
        exit 1
        ;;
esac 