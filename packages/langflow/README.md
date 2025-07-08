# Langflow Package

This package contains the Langflow workflows and AI agent configurations for TravelAgentic.

## Overview

Langflow provides the visual AI workflow orchestration for TravelAgentic, handling:
- User preference processing
- Travel search coordination
- Booking automation logic
- Fallback strategies

## Directory Structure

```
packages/langflow/
├── flows/          → JSON Langflow visual agent flows
├── prompts/        → Prompt templates for agent tasks
├── data/          → Langflow data files (gitignored)
├── logs/          → Langflow logs (gitignored)
└── README.md      → This file
```

## Setup

### Local Development with Docker

```bash
# Start Langflow with the development environment
docker-compose up langflow

# Access Langflow UI
open http://localhost:7860
```

### Standalone Installation

```bash
# Install Langflow
pip install langflow

# Start Langflow
langflow run --host 0.0.0.0 --port 7860
```

## Configuration

### Environment Variables

```env
LANGFLOW_DATABASE_URL=postgresql://postgres:password@localhost:5432/travelagentic
LANGFLOW_SUPERUSER=admin
LANGFLOW_SUPERUSER_PASSWORD=admin
LANGFLOW_SECRET_KEY=your-secret-key-here
```

## Flows

### Main Workflows

1. **User Intake Flow** - Collects user preferences and constraints
2. **Search Coordination Flow** - Orchestrates flight, hotel, and activity searches
3. **Booking Flow** - Handles the booking process with fallback strategies
4. **Itinerary Generation Flow** - Creates personalized travel itineraries

### Testing Flows

Test flows are located in the `flows/` directory with the prefix `test_`.

## Usage

### Importing Flows

1. Open Langflow UI at http://localhost:7860
2. Click "Import" in the top menu
3. Select the JSON flow file from the `flows/` directory
4. Configure any required API keys in the flow settings

### Creating New Flows

1. Create new flows in the Langflow UI
2. Export as JSON to the `flows/` directory
3. Follow the naming convention: `{feature}_{version}.json`

## API Integration

Langflow exposes REST APIs for each flow:

```javascript
// Example: Trigger user intake flow
const response = await fetch('http://localhost:7860/api/v1/run/{flow_id}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${LANGFLOW_API_KEY}`
  },
  body: JSON.stringify({
    input_value: userPreferences,
    tweaks: {}
  })
});
```

## Development Guidelines

### Best Practices

- Keep flows modular and reusable
- Use meaningful names for components
- Document complex logic with comments
- Test flows with mock data before production use
- Version control all flow exports

### Testing

- Use the test flows in `flows/test_*` for development
- Validate flows with the npm script: `npm run validate:flows`
- Test with mock APIs enabled: `USE_MOCK_APIS=true`

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check that PostgreSQL is running on port 5432
   - Verify database credentials in environment variables

2. **Flow Import Errors**
   - Ensure JSON files are valid
   - Check that all required components are available

3. **API Key Issues**
   - Verify all external API keys are configured
   - Use mock APIs for development: `USE_MOCK_APIS=true`

## Contributing

When adding new flows:

1. Test thoroughly with mock APIs
2. Export as JSON to the `flows/` directory
3. Update this README with flow documentation
4. Add corresponding test flows if needed 