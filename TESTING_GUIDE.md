# 🧪 LangGraph Testing Guide

## 📋 **Available Test Files**

Your LangGraph service includes several test files for different components:

- **`test_orchestrator.py`** - Tests the main orchestrator workflow
- **`test_webserver_client.py`** - Tests web server API integration
- **`test_amadeus_only.py`** - Tests Amadeus API wrapper only
- **`test_orchestrator_webserver.py`** - Tests full orchestrator + webserver integration

## 🚀 **Quick Start Testing**

### **Run All Tests** (Recommended)
```bash
# Make script executable (first time only)
chmod +x run-langgraph-tests.sh

# Run all tests
./run-langgraph-tests.sh all
```

### **Run Specific Test**
```bash
# Run individual test files
./run-langgraph-tests.sh test_orchestrator.py
./run-langgraph-tests.sh test_webserver_client.py
```

### **Interactive Testing**
```bash
# Get a shell inside the container
./run-langgraph-tests.sh shell

# Inside the container, run any test
python test_orchestrator.py
python test_webserver_client.py
```

## 🛠️ **Manual Docker Commands**

### **Method 1: Use Existing Containers**
```bash
# Start services first
docker-compose up -d

# Run tests in existing containers
docker-compose exec langgraph python test_orchestrator.py
docker-compose exec langgraph python test_webserver_client.py
docker-compose exec langgraph python test_amadeus_only.py
```

### **Method 2: Temporary Test Containers**
```bash
# Run tests in temporary containers (services don't need to be running)
docker-compose run --rm langgraph python test_orchestrator.py
docker-compose run --rm langgraph python test_webserver_client.py
```

### **Method 3: Dedicated Test Service**
```bash
# Use the dedicated testing service (includes test environment variables)
docker-compose --profile testing run --rm langgraph-test python test_orchestrator.py
```

## 📊 **Test Script Features**

The `run-langgraph-tests.sh` script provides:

### **🔍 Commands Available**
```bash
./run-langgraph-tests.sh all               # Run all tests
./run-langgraph-tests.sh list              # List available tests  
./run-langgraph-tests.sh status            # Check service status
./run-langgraph-tests.sh shell             # Interactive container shell
./run-langgraph-tests.sh test_orchestrator.py  # Run specific test
```

### **✅ Smart Features**
- ✅ **Auto-detects** if services are running
- ✅ **Color-coded output** for easy reading
- ✅ **Service status checking** before running tests
- ✅ **Comprehensive error handling**
- ✅ **Multiple execution methods** (exec vs run)

## 🎯 **Test Descriptions**

### **`test_orchestrator.py`**
Tests the main LangGraph orchestrator:
- ✅ Orchestrator initialization
- ✅ Conversation flow
- ✅ Agent coordination
- ✅ Mock data integration

### **`test_webserver_client.py`**
Tests the web server API client:
- ✅ Flight search via web API
- ✅ Hotel search via web API
- ✅ Activity search via web API
- ✅ Data format conversion

### **`test_amadeus_only.py`**
Tests only the web server API integration:
- ✅ Amadeus API wrapper calls
- ✅ Fallback mechanisms
- ✅ Response formatting

### **`test_orchestrator_webserver.py`**
Tests full integration:
- ✅ Orchestrator → WebServer communication
- ✅ End-to-end travel planning flow
- ✅ Complete system integration

## 🔧 **Environment Variables for Testing**

The tests use these environment settings:
```bash
# Automatically set by test scripts
USE_MOCK_DATA=true
AMADEUS_API_KEY=test_key
AMADEUS_API_SECRET=test_secret
WEBSERVER_URL=http://web:3000  # In Docker
```

## 🚨 **Prerequisites**

### **For All Testing Methods:**
1. ✅ Docker and Docker Compose installed
2. ✅ Root `.env` file configured with `OPENAI_API_KEY`
3. ✅ Services built: `docker-compose build`

### **For Full Integration Tests:**
4. ✅ Web service running: `docker-compose up web -d`
5. ✅ Redis service running: `docker-compose up redis -d`

## 🎯 **Troubleshooting**

### **"Connection Refused" Errors**
```bash
# Check service status
./run-langgraph-tests.sh status

# Start required services
docker-compose up web redis -d

# Try again
./run-langgraph-tests.sh test_webserver_client.py
```

### **"Module Not Found" Errors**
```bash
# Rebuild the container
docker-compose build langgraph

# Try tests again
./run-langgraph-tests.sh all
```

### **Test Environment Issues**
```bash
# Use dedicated test service with clean environment
docker-compose --profile testing run --rm langgraph-test python test_orchestrator.py
```

## 📈 **CI/CD Integration**

### **GitHub Actions Example**
```yaml
# .github/workflows/test-langgraph.yml
name: LangGraph Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run LangGraph Tests
        run: |
          chmod +x run-langgraph-tests.sh
          ./run-langgraph-tests.sh all
```

### **Pre-commit Hook**
```bash
# Add to .git/hooks/pre-commit
#!/bin/bash
echo "Running LangGraph tests..."
./run-langgraph-tests.sh all
```

## 🎉 **Best Practices**

1. **🔄 Run tests regularly** during development
2. **🐳 Use Docker consistently** (don't mix local Python with Docker)
3. **🔍 Check service status** before running integration tests
4. **📊 Run all tests** before committing code
5. **🧪 Use interactive shell** for debugging failing tests

---

*Testing made simple with Docker! 🚀* 