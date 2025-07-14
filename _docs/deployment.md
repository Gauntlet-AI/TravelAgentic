# TravelAgentic Deployment Guide

This guide covers deploying TravelAgentic containers to various platforms while using Supabase Cloud for the database.

## 🏗️ Architecture Overview

**Deployment Stack:**

- **Frontend + API**: Docker container (Next.js full-stack app)
- **Database**: Supabase Cloud (managed PostgreSQL)
- **AI Workflows**: LangGraph (containerized)
- **Cache**: Redis (containerized)
- **Files**: Supabase Storage

## ⚙️ Prerequisites

### Required Accounts

- **Supabase**: Create project at [supabase.com](https://supabase.com)
- **Container Registry**: DockerHub, AWS ECR, or Google Container Registry
- **Deployment Platform**: Choose from options below

### Required Environment Variables

```bash
# Supabase Cloud (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# OpenAI (Required for AI features)
OPENAI_API_KEY=your_openai_key

# Development Phase
USE_MOCK_APIS=false
DEVELOPMENT_PHASE=3

# Additional APIs (Optional - use mocks if not provided)
TEQUILA_API_KEY=your_tequila_key
BOOKING_API_KEY=your_booking_key
VIATOR_API_KEY=your_viator_key
STRIPE_SECRET_KEY=your_stripe_key
TWILIO_ACCOUNT_SID=your_twilio_sid
ELEVENLABS_API_KEY=your_elevenlabs_key

# Container-specific
REDIS_URL=redis://redis:6379
LANGGRAPH_URL=http://langgraph:8000
```

---

## 🚀 Deployment Options

### 1. AWS ECS (Fargate)

**Best for**: Production workloads, auto-scaling, enterprise deployments

#### Setup AWS ECS

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip && sudo ./aws/install

# Configure AWS
aws configure

# Create ECS cluster
aws ecs create-cluster --cluster-name travelagentic-cluster
```

#### Build and Push to ECR

```bash
# Create ECR repository
aws ecr create-repository --repository-name travelagentic

# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and push
docker build -t travelagentic .
docker tag travelagentic:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/travelagentic:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/travelagentic:latest
```

#### ECS Task Definition

```json
{
  "family": "travelagentic",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::<account>:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "web",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/travelagentic:latest",
      "portMappings": [{ "containerPort": 3000 }],
      "environment": [
        { "name": "NODE_ENV", "value": "production" },
        { "name": "SUPABASE_URL", "value": "https://your-project.supabase.co" },
        { "name": "OPENAI_API_KEY", "value": "your_key" }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/travelagentic",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### Deploy to ECS

```bash
# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster travelagentic-cluster \
  --service-name travelagentic-service \
  --task-definition travelagentic \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
```

---

### 2. Google Cloud Run

**Best for**: Serverless deployment, pay-per-request, auto-scaling to zero

#### Setup Google Cloud

```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Authenticate and set project
gcloud auth login
gcloud config set project your-project-id
gcloud services enable run.googleapis.com containerregistry.googleapis.com
```

#### Build and Deploy

```bash
# Build and push to GCR
docker build -t gcr.io/your-project-id/travelagentic .
docker push gcr.io/your-project-id/travelagentic

# Deploy to Cloud Run
gcloud run deploy travelagentic \
  --image gcr.io/your-project-id/travelagentic \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production,SUPABASE_URL=https://your-project.supabase.co,OPENAI_API_KEY=your_key" \
  --memory 2Gi \
  --cpu 2 \
  --max-instances 10
```

#### Cloud Run YAML (Alternative)

```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: travelagentic
  annotations:
    run.googleapis.com/ingress: all
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/maxScale: "10"
        run.googleapis.com/cpu-throttling: "false"
        run.googleapis.com/memory: "2Gi"
    spec:
      containerConcurrency: 80
      containers:
        - image: gcr.io/your-project-id/travelagentic
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: production
            - name: SUPABASE_URL
              value: https://your-project.supabase.co
            - name: OPENAI_API_KEY
              value: your_key
          resources:
            limits:
              cpu: "2"
              memory: "2Gi"
```

---

### 3. DigitalOcean App Platform

**Best for**: Simple deployment, managed infrastructure, developer-friendly

#### App Spec (`.do/app.yaml`)

```yaml
name: travelagentic
services:
  - name: web
    source_dir: /
    github:
      repo: your-username/travelagentic
      branch: main
    run_command: npm start
    build_command: docker build -t travelagentic .
    dockerfile_path: Dockerfile
    instance_count: 2
    instance_size_slug: professional-xs
    http_port: 3000
    env:
      - key: NODE_ENV
        value: production
      - key: SUPABASE_URL
        value: https://your-project.supabase.co
        type: SECRET
      - key: OPENAI_API_KEY
        type: SECRET
    health_check:
      http_path: /api/health
```

#### Deploy with doctl

```bash
# Install doctl
curl -sL https://github.com/digitalocean/doctl/releases/download/v1.94.0/doctl-1.94.0-linux-amd64.tar.gz | tar -xzv
sudo mv doctl /usr/local/bin

# Authenticate
doctl auth init

# Deploy app
doctl apps create --spec .do/app.yaml
```

---

### 4. Railway

**Best for**: Rapid deployment, Git-based deployment, generous free tier

#### Railway Setup

```bash
# Install Railway CLI
curl -fsSL https://railway.app/install.sh | sh

# Login and init
railway login
railway init

# Set environment variables
railway variables set NODE_ENV=production
railway variables set SUPABASE_URL=https://your-project.supabase.co
railway variables set OPENAI_API_KEY=your_key

# Deploy
railway up
```

#### railway.json

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "numReplicas": 2,
    "restartPolicyType": "ON_FAILURE",
    "sleepApplication": false
  }
}
```

---

### 5. Simple VPS Deployment

**Best for**: Cost-effective, full control, learning purposes

#### Server Setup (Ubuntu 22.04)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx for reverse proxy
sudo apt install nginx certbot python3-certbot-nginx -y
```

#### Production Environment

```bash
# Clone repository
git clone https://github.com/your-username/travelagentic.git
cd travelagentic

# Set up environment
cp .env.example .env.production
# Edit .env.production with your values

# Deploy with production compose
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

#### Nginx Configuration

```nginx
# /etc/nginx/sites-available/travelagentic
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### SSL Setup

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/travelagentic /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

---

## 🔧 Configuration Management

### Environment Variables by Platform

#### AWS ECS

- Use AWS Systems Manager Parameter Store or Secrets Manager
- Reference in task definition as `valueFrom`

#### Google Cloud Run

- Use Google Secret Manager
- Set with `gcloud run services update --set-secrets`

#### DigitalOcean

- Use App Platform environment variables
- Mark sensitive values as `SECRET`

#### Railway

- Use Railway's built-in environment variables
- Automatically encrypted and injected

#### VPS

- Use `.env.production` file
- Consider using Docker secrets for sensitive data

### Monitoring Setup

#### Health Checks

All platforms should monitor:

```bash
# Application health
GET /api/health

# Database connectivity
GET /api/health/db

# External APIs
GET /api/health/apis
```

#### Logging

```bash
# View logs by platform
aws logs tail /ecs/travelagentic              # AWS ECS
gcloud run services logs tail travelagentic   # Cloud Run
doctl apps logs your-app-id                   # DigitalOcean
railway logs                                   # Railway
docker-compose logs web                       # VPS
```

#### Metrics

- **AWS**: CloudWatch metrics and alarms
- **GCP**: Cloud Monitoring and alerting
- **DigitalOcean**: Built-in app metrics
- **Railway**: Built-in observability
- **VPS**: Consider Prometheus + Grafana

---

## 🔄 Updates and Rollbacks

### Deployment Updates

#### CI/CD Pipeline (GitHub Actions)

```yaml
# Already configured in .github/workflows/ci-cd-pipeline.yml
# Automatically builds and pushes on main branch
```

#### Manual Updates

```bash
# AWS ECS
aws ecs update-service --cluster travelagentic-cluster --service travelagentic-service --force-new-deployment

# Google Cloud Run
gcloud run deploy travelagentic --image gcr.io/your-project-id/travelagentic:latest

# DigitalOcean
doctl apps create-deployment your-app-id

# Railway
railway up

# VPS
cd travelagentic && git pull && docker-compose -f docker-compose.prod.yml up -d --build
```

### Rollback Strategies

- **AWS ECS**: Update service to previous task definition revision
- **Cloud Run**: Deploy previous image tag
- **DigitalOcean**: Rollback via control panel or CLI
- **Railway**: Deploy previous Git commit
- **VPS**: `git checkout` previous commit and rebuild

---

## 💰 Cost Estimates (Monthly)

### Small Scale (~10k requests/month)

- **AWS ECS**: $15-25
- **Google Cloud Run**: $0-5 (free tier)
- **DigitalOcean**: $12
- **Railway**: $0-5 (free tier)
- **VPS**: $5-10

### Medium Scale (~100k requests/month)

- **AWS ECS**: $50-80
- **Google Cloud Run**: $15-30
- **DigitalOcean**: $25-40
- **Railway**: $20-35
- **VPS**: $10-20

### Large Scale (~1M requests/month)

- **AWS ECS**: $200-400
- **Google Cloud Run**: $80-150
- **DigitalOcean**: $100-200
- **Railway**: $100-200
- **VPS**: $50-100

_Note: Costs exclude Supabase Cloud (free tier up to 500MB, then $25/month)_

---

## 🔍 Troubleshooting

### Common Issues

#### Container Won't Start

```bash
# Check logs
docker logs container-name

# Common fixes
- Verify environment variables
- Check Dockerfile build process
- Ensure port 3000 is exposed
- Verify Supabase URL accessibility
```

#### Database Connection Issues

```bash
# Verify Supabase connectivity
curl -H "apikey: your-anon-key" "https://your-project.supabase.co/rest/v1/"

# Check environment variables
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY
```

#### Performance Issues

- Monitor memory usage (increase to 2GB minimum)
- Check CPU allocation
- Verify Redis connectivity
- Monitor Supabase database performance

#### SSL/HTTPS Issues

- Verify domain DNS settings
- Check certificate renewal
- Ensure HTTPS redirects are configured
- Verify load balancer SSL termination

### Support Resources

- **AWS**: [ECS Documentation](https://docs.aws.amazon.com/ecs/)
- **GCP**: [Cloud Run Documentation](https://cloud.google.com/run/docs)
- **DigitalOcean**: [App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
- **Railway**: [Railway Docs](https://docs.railway.app/)
- **Supabase**: [Supabase Docs](https://supabase.com/docs)

---

## 🎯 Production Checklist

### Before Deployment

- [ ] Set up Supabase Cloud project
- [ ] Configure all required environment variables
- [ ] Test with `USE_MOCK_APIS=false` locally
- [ ] Set up container registry
- [ ] Configure domain and SSL
- [ ] Set up monitoring and alerting

### After Deployment

- [ ] Verify health endpoints respond
- [ ] Test user registration and login
- [ ] Verify API integrations work
- [ ] Test PDF generation
- [ ] Monitor error rates and performance
- [ ] Set up automated backups (Supabase handles this)
- [ ] Configure log retention policies

### Ongoing Maintenance

- [ ] Monitor application metrics
- [ ] Update dependencies regularly
- [ ] Scale resources based on usage
- [ ] Backup LangGraph configurations and data
- [ ] Monitor Supabase usage and costs
- [ ] Keep SSL certificates updated
