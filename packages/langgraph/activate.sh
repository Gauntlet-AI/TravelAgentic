#!/bin/bash
# Helper script to activate the LangGraph virtual environment

# Check if .venv exists
if [ ! -d ".venv" ]; then
    echo "Virtual environment not found. Please run 'python3 -m venv .venv' first."
    exit 1
fi

# Activate the virtual environment
source .venv/bin/activate

# Show activation message
echo "✅ LangGraph virtual environment activated!"
echo "Python version: $(python --version)"
echo "To deactivate, run: deactivate"
echo ""
echo "Available commands:"
echo "  python main.py              - Start the LangGraph server"
echo "  pip install -r requirements.txt - Install/update dependencies"
echo "  pip list                    - Show installed packages" 