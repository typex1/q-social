# Q-Social AWS Architecture

## Architecture Diagram

```
┌─────────┐
│  User   │
│ Browser │
└────┬────┘
     │
     │ HTTPS
     ▼
┌─────────────────────────────────────────────────────────┐
│                    CloudFront CDN                       │
│              (Global Edge Locations)                    │
└────┬────────────────────────────────────────────────────┘
     │
     │
     ├──────────────────────┬──────────────────────────────┐
     │                      │                              │
     │ Static Assets        │ API Requests                 │
     ▼                      ▼                              │
┌──────────────┐      ┌──────────────────────┐           │
│   S3 Bucket  │      │   API Gateway        │           │
│              │      │   /prod/api/messages │           │
│  Next.js     │      │                      │           │
│  Static Site │      │  - GET /messages     │           │
│  (HTML/CSS/  │      │  - POST /messages    │           │
│   JS/Assets) │      └──────────┬───────────┘           │
└──────────────┘                 │                        │
                                 │ Invoke                 │
                                 ▼                        │
                        ┌─────────────────┐               │
                        │  Lambda Function│               │
                        │                 │               │
                        │  - GET handler  │               │
                        │  - POST handler │               │
                        │  - Validation   │               │
                        └────────┬────────┘               │
                                 │                        │
                                 │ Read/Write             │
                                 ▼                        │
                        ┌─────────────────┐               │
                        │    DynamoDB     │               │
                        │                 │               │
                        │ q-social-       │               │
                        │ messages        │               │
                        │                 │               │
                        │ PK: id (String) │               │
                        │ - content       │               │
                        │ - createdAt     │               │
                        └─────────────────┘               │
                                                          │
┌─────────────────────────────────────────────────────────┘
│
│  CDK Stack Deployment
│
└──► Infrastructure as Code (AWS CDK)
     - DynamoDB Table
     - Lambda Function
     - API Gateway
     - S3 Bucket
     - CloudFront Distribution
     - IAM Roles & Policies
```

## Component Details

### 1. CloudFront Distribution
- **Purpose**: Global CDN for low-latency content delivery
- **Features**:
  - Caches static assets at edge locations
  - Routes API requests to API Gateway
  - HTTPS/SSL termination
  - Custom domain support (optional)

### 2. S3 Bucket (Frontend)
- **Purpose**: Hosts static Next.js build output
- **Contents**:
  - HTML pages
  - JavaScript bundles
  - CSS stylesheets
  - Static assets (images, fonts)
- **Configuration**:
  - Static website hosting enabled
  - CloudFront origin access identity

### 3. API Gateway
- **Purpose**: RESTful API endpoint
- **Endpoints**:
  - `GET /prod/api/messages` - Retrieve all messages
  - `POST /prod/api/messages` - Create new message
- **Features**:
  - Request validation
  - CORS configuration
  - Throttling and rate limiting
  - CloudWatch logging

### 4. Lambda Function
- **Purpose**: Serverless compute for business logic
- **Runtime**: Node.js 20.x
- **Handlers**:
  - GET: Scan DynamoDB and return messages sorted by timestamp
  - POST: Validate input and write to DynamoDB
- **Configuration**:
  - Memory: 256 MB (configurable)
  - Timeout: 30 seconds
  - Environment variables for DynamoDB table name

### 5. DynamoDB Table
- **Purpose**: NoSQL database for message storage
- **Table Name**: `q-social-messages`
- **Schema**:
  - `id` (String, Partition Key) - Unique message identifier
  - `content` (String) - Message text (max 280 chars)
  - `createdAt` (Number) - Unix timestamp
- **Billing**: Pay-per-request (on-demand)
- **Features**:
  - Automatic scaling
  - Point-in-time recovery (optional)
  - Encryption at rest

## Data Flow

### Creating a Message (POST)
1. User submits message via browser
2. Request goes to CloudFront
3. CloudFront routes to API Gateway
4. API Gateway invokes Lambda function
5. Lambda validates message (1-280 chars)
6. Lambda writes to DynamoDB with generated ID and timestamp
7. DynamoDB confirms write
8. Lambda returns success response
9. Response flows back through API Gateway → CloudFront → User

### Retrieving Messages (GET)
1. User loads page or refreshes feed
2. Request goes to CloudFront
3. CloudFront routes to API Gateway
4. API Gateway invokes Lambda function
5. Lambda scans DynamoDB table
6. Lambda sorts messages by timestamp (newest first)
7. Lambda returns message array
8. Response flows back through API Gateway → CloudFront → User

## Security

### IAM Roles & Policies
- **Lambda Execution Role**:
  - DynamoDB read/write permissions (scoped to specific table)
  - CloudWatch Logs write permissions
  
### Network Security
- All traffic over HTTPS
- CORS configured for specific origins (no wildcards in production)
- API Gateway throttling to prevent abuse

### Data Security
- DynamoDB encryption at rest (AWS managed keys)
- Input validation on both client and server
- XSS protection via React's automatic escaping

## Deployment

### Infrastructure (CDK)
```bash
npm run deploy:backend
```
Deploys:
- DynamoDB table
- Lambda function with code
- API Gateway with routes
- S3 bucket for frontend
- CloudFront distribution
- IAM roles and policies

### Frontend
```bash
npm run deploy:frontend
```
- Builds Next.js static export
- Uploads to S3 bucket
- Invalidates CloudFront cache

## Cost Optimization

### Pay-per-use Services
- **Lambda**: Charged per request and compute time
- **DynamoDB**: On-demand billing (no idle costs)
- **API Gateway**: Per request pricing
- **CloudFront**: Data transfer and requests

### Free Tier Eligible
- Lambda: 1M requests/month
- DynamoDB: 25 GB storage, 25 WCU, 25 RCU
- API Gateway: 1M requests/month (first 12 months)
- CloudFront: 1 TB data transfer out (first 12 months)

### Estimated Monthly Cost (Low Traffic)
- **< 100K requests/month**: ~$0-5
- **100K-1M requests/month**: ~$5-20
- **1M+ requests/month**: Scales with usage

## Monitoring & Observability

### CloudWatch Metrics
- Lambda invocations, duration, errors
- API Gateway request count, latency, 4xx/5xx errors
- DynamoDB read/write capacity, throttles

### CloudWatch Logs
- Lambda function logs (console.log output)
- API Gateway access logs
- CloudFront access logs (optional)

### Alarms (Recommended)
- Lambda error rate > 5%
- API Gateway 5xx errors
- DynamoDB throttling events

## Scalability

### Automatic Scaling
- **Lambda**: Concurrent executions scale automatically (up to account limit)
- **DynamoDB**: On-demand mode scales automatically
- **API Gateway**: Handles up to 10,000 requests/second (default)
- **CloudFront**: Global edge network scales automatically

### Performance Characteristics
- **Latency**: 50-200ms (depending on region and cold starts)
- **Throughput**: Thousands of requests/second
- **Cold Start**: ~1-2 seconds for Lambda (first request)
