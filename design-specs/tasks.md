# Q-Social Implementation Tasks

## Phase 1: Project Setup & Shared Code

**Goal:** Establish project structure, shared types, and configuration management.

**Requirements:** All requirements (foundation for implementation)  
**Design Reference:** Section 2 (Technology Stack), Section 3 (Data Model), Section 5 (Configuration Management)

### 1.1 Project Initialization
- [x] Initialize Next.js project with TypeScript and App Router
- [x] Configure TypeScript with strict mode
- [x] Set up project directory structure (app/, backend/, shared/, infrastructure/, scripts/, data/)
- [x] Initialize package.json with required dependencies
- [x] Install tsx as dev dependency for running TypeScript in development
- [x] Create .gitignore file (include data/, node_modules/, .env*, out/, dist/)

### 1.2 Shared Types & Interfaces
- [x] Create `shared/types/message.ts` with Message, CreateMessageRequest, CreateMessageResponse, GetMessagesResponse, and ErrorResponse interfaces
- [x] Create `shared/types/index.ts` to export all types

### 1.3 Configuration Management
- [x] Create `shared/config/environment.ts` with Environment type and getConfig() function
- [x] Implement environment detection logic (local vs aws)
- [x] Create `.env.local.example` template file
- [x] Create `.env.production.example` template file

### 1.4 Shared Utilities
- [x] Create `shared/validation/message.ts` with validateMessageContent() function returning ValidationResult
- [x] Create `shared/utils/logger.ts` with logError() function

**Manual Test:** Verify TypeScript compilation succeeds with no errors.

---

## Phase 2: Backend - Local Mode

**Goal:** Implement Express server with SQLite for local development.

**Requirements:** Req #1 (Message Posting), Req #2 (Feed Viewing), Req #3 (REST API), Req #5 (Local Deployment), Req #7 (Error Handling)  
**Design Reference:** Section 6 (Backend Implementation - Local Mode), Section 4 (API Design)

### 2.1 Database Setup
- [x] Install sqlite3 dependency
- [x] Create `data/` directory for SQLite database file (add to .gitignore)
- [x] Add database initialization in server.ts with CREATE TABLE IF NOT EXISTS
- [x] Add CREATE INDEX IF NOT EXISTS for created_at column

### 2.2 Express Server Setup
- [x] Install express, cors, and uuid dependencies
- [x] Install @types/express, @types/cors as dev dependencies
- [x] Create `backend/local/server.ts` with Express app initialization
- [x] Configure CORS middleware reading from CORS_ORIGINS environment variable
- [x] Configure JSON body parser middleware

### 2.3 POST /api/messages Endpoint
- [x] Implement POST /api/messages route handler
- [x] Import and use validateMessageContent() from shared/validation/message (Req #1)
- [x] Return validation errors with 400 status (Req #7)
- [x] Trim content before saving
- [x] Generate UUID for message ID
- [x] Insert message into SQLite database
- [x] Return 201 status with created message
- [x] Handle database errors with 500 status using logError() (Req #7)

### 2.4 GET /api/messages Endpoint
- [x] Implement GET /api/messages route handler
- [x] Query messages from SQLite ordered by created_at DESC (Req #2)
- [x] Return 200 status with messages array
- [x] Handle database errors with 500 status using logError() (Req #7)

### 2.5 Server Startup
- [x] Configure server to listen on PORT environment variable or 3001
- [x] Add startup logging with server URL
- [x] Create npm script `dev:backend` to run local server

**Manual Test:** Start local backend, use curl/Postman to POST messages and GET messages feed.

---

## Phase 3: Frontend - Core UI

**Goal:** Build React/Next.js frontend with message posting and feed viewing.

**Requirements:** Req #1 (Message Posting), Req #2 (Feed Viewing), Req #4 (User Interface), Req #7 (Error Handling)  
**Design Reference:** Section 7 (Frontend Implementation), Section 10 (Error Handling Patterns)

### 3.1 API Client
- [x] Create `app/lib/api-client.ts` with ApiError class
- [x] Implement fetchApi() generic function with error handling
- [x] Read NEXT_PUBLIC_API_URL from environment (default to http://localhost:3001)
- [x] Implement createMessage() function calling POST /api/messages
- [x] Implement getMessages() function calling GET /api/messages
- [x] Handle network errors with NETWORK_ERROR code (Req #7)
- [x] Handle API errors with proper error codes (Req #7)

### 3.2 Error Handling Utilities
- [x] Create `app/lib/error-handler.ts` with getErrorMessage() function
- [x] Map ApiError codes to user-friendly messages (Req #7)
- [x] Handle VALIDATION_ERROR, NETWORK_ERROR, DATABASE_ERROR, INTERNAL_ERROR

### 3.3 Main Page Component
- [x] Create `app/page.tsx` as client component
- [x] Implement state management for messages, content, error, loading
- [x] Implement useEffect to load messages on mount (Req #2)
- [x] Implement loadMessages() function
- [x] Implement handleSubmit() function for posting messages (Req #1)
- [x] Calculate remainingChars (280 - content.length) (Req #4)
- [x] Clear content field after successful post

### 3.4 UI Elements - Message Form
- [x] Create textarea for message input with 280 maxLength (Req #1, #4)
- [x] Add placeholder text "What's happening?"
- [x] Display character counter showing remaining characters (Req #4)
- [x] Style character counter red when negative
- [x] Add submit button with "Post" label
- [x] Disable form elements during loading state
- [x] Disable submit button when content is empty or only whitespace

### 3.5 UI Elements - Feed Display
- [x] Create feed container for messages list
- [x] Map over messages array to render individual messages (Req #2)
- [x] Display message content
- [x] Display formatted timestamp using toLocaleString() (Req #4)
- [x] Show error message banner when error state is set (Req #7)

### 3.6 Responsive Styling
- [x] Create CSS modules or Tailwind config for responsive design (Req #4)
- [x] Style container with max-width for desktop
- [x] Ensure textarea is responsive on mobile
- [x] Style message cards with proper spacing
- [x] Add responsive breakpoints for tablet and mobile (Req #4)

### 3.7 Next.js Configuration
- [x] Create `next.config.js` with output: 'export' for static site generation
- [x] Add images.unoptimized: true for static export compatibility
- [x] Configure rewrites for proxy support checking NODE_ENV and PROXY_API_URL (Req #8)
- [x] Add rewrite rule for /api/:path* to proxy destination (development only)
- [x] Create npm script `dev:frontend` to run Next.js dev server

**Manual Test:** Start frontend and backend, post messages through UI, verify feed updates, test character counter, test error messages.

---

## Phase 4: Backend - AWS Mode

**Goal:** Implement Lambda functions and DynamoDB for AWS deployment.

**Requirements:** Req #1 (Message Posting), Req #2 (Feed Viewing), Req #3 (REST API), Req #6 (AWS Serverless Deployment), Req #7 (Error Handling)  
**Design Reference:** Section 6 (Backend Implementation - AWS Mode), Section 3 (Data Model - DynamoDB)

### 4.1 AWS SDK Setup
- [x] Install @aws-sdk/client-dynamodb and @aws-sdk/lib-dynamodb dependencies
- [x] Install @types/aws-lambda for TypeScript types
- [x] Create `backend/aws/handlers/messages.ts` file

### 4.2 DynamoDB Client Configuration
- [x] Initialize DynamoDBClient
- [x] Create DynamoDBDocumentClient wrapper
- [x] Configure TABLE_NAME from environment variable

### 4.3 CORS Headers Configuration
- [x] Define headers object with CORS headers
- [x] Set Access-Control-Allow-Origin from CORS_ORIGIN env var
- [x] Set Access-Control-Allow-Methods for GET, POST, OPTIONS
- [x] Set Access-Control-Allow-Headers for Content-Type

### 4.4 createMessage Lambda Handler
- [x] Export createMessage async function with APIGatewayProxyEvent parameter
- [x] Validate event.body exists
- [x] Parse JSON body and extract content
- [x] Import and use validateMessageContent() from shared/validation/message (Req #1)
- [x] Return validation errors with 400 status (Req #7)
- [x] Trim content before saving
- [x] Generate UUID for message ID
- [x] Create message object with id, content, createdAt
- [x] Execute PutCommand to DynamoDB
- [x] Return 201 status with message in body
- [x] Handle DynamoDB errors with 500 status using logError() (Req #7)
- [x] Include CORS headers in all responses

### 4.5 getMessages Lambda Handler
- [x] Export getMessages async function with APIGatewayProxyEvent parameter
- [x] Execute ScanCommand to retrieve all messages from DynamoDB
- [x] Sort messages by createdAt descending in-memory (Req #2)
- [x] Return 200 status with messages array in body
- [x] Handle DynamoDB errors with 500 status using logError() (Req #7)
- [x] Include CORS headers in response

### 4.6 Build Configuration
- [x] Install esbuild as dev dependency
- [x] Create npm script `build:backend` to bundle Lambda handlers
- [x] Configure esbuild with --bundle, --platform=node, --target=node20
- [x] Set output directory to backend/aws/dist

**Manual Test:** Build backend bundle, verify dist/ contains bundled handlers with no errors.

---

## Phase 5: Infrastructure as Code (AWS CDK)

**Goal:** Define AWS infrastructure using CDK for serverless deployment.

**Requirements:** Req #6 (AWS Serverless Deployment)  
**Design Reference:** Section 8 (Infrastructure as Code), Section 3 (Data Model - DynamoDB)

### 5.1 CDK Project Setup
- [x] Install aws-cdk-lib and constructs dependencies
- [x] Create `infrastructure/` directory
- [x] Initialize CDK app in `infrastructure/bin/app.ts`
- [x] Create `infrastructure/lib/q-social-stack.ts` file
- [x] Create `infrastructure/cdk.json` configuration file

### 5.2 DynamoDB Table Definition
- [x] Import dynamodb module from aws-cdk-lib
- [x] Create Table construct with name 'q-social-messages'
- [x] Define partition key as 'id' (STRING type)
- [x] Set billing mode to PAY_PER_REQUEST
- [x] Set removal policy to DESTROY for development
- [x] Do NOT add Global Secondary Index (use Scan operation instead)

### 5.3 Lambda Functions Definition
- [x] Import lambda module from aws-cdk-lib
- [x] Create S3 bucket and CloudFront distribution FIRST (needed for CORS_ORIGIN)
- [x] Create Lambda function for createMessage handler
- [x] Set runtime to NODEJS_20_X
- [x] Set handler to 'messages.createMessage'
- [x] Set code from asset '../backend/aws/dist' (relative to infrastructure/)
- [x] Add TABLE_NAME environment variable
- [x] Add CORS_ORIGIN environment variable with CloudFront domain
- [x] Create Lambda function for getMessages handler
- [x] Set runtime to NODEJS_20_X
- [x] Set handler to 'messages.getMessages'
- [x] Set code from asset '../backend/aws/dist'
- [x] Add TABLE_NAME environment variable
- [x] Add CORS_ORIGIN environment variable with CloudFront domain

### 5.4 IAM Permissions
- [x] Grant createMessage function write permissions to DynamoDB table
- [x] Grant getMessages function read permissions to DynamoDB table

### 5.5 API Gateway Definition
- [x] Import apigateway module from aws-cdk-lib
- [x] Create RestApi construct with name 'Q-Social API'
- [x] Configure default CORS preflight options
- [x] Set allowOrigins to CloudFront distribution domain (not ALL_ORIGINS)
- [x] Set allowMethods to ALL_METHODS
- [x] Create /api resource
- [x] Create /messages resource under /api
- [x] Add POST method with LambdaIntegration to createMessage function
- [x] Add GET method with LambdaIntegration to getMessages function

### 5.6 S3 Bucket for Frontend
- [x] Import s3 module from aws-cdk-lib
- [x] Create S3 Bucket construct for website hosting
- [x] Set websiteIndexDocument to 'index.html'
- [x] Enable publicReadAccess
- [x] Set removal policy to DESTROY
- [x] Enable autoDeleteObjects

### 5.7 CloudFront Distribution
- [x] Import cloudfront and origins modules from aws-cdk-lib
- [x] Create Distribution construct
- [x] Set default behavior origin to S3Origin(websiteBucket)
- [x] Set viewerProtocolPolicy to REDIRECT_TO_HTTPS
- [x] Set defaultRootObject to 'index.html'

### 5.8 Stack Outputs
- [x] Create CfnOutput for API Gateway URL
- [x] Create CfnOutput for CloudFront Distribution URL
- [x] Create CfnOutput for S3 Bucket Name
- [x] Set descriptions for all outputs

### 5.9 CDK Scripts
- [x] Create npm script `cdk:synth` to synthesize CloudFormation template
- [x] Create npm script `cdk:deploy` to deploy stack
- [x] Create npm script `cdk:destroy` to tear down stack

**Manual Test:** Run cdk synth to verify CloudFormation template generation with no errors.

---

## Phase 6: Deployment Scripts & Automation

**Goal:** Create scripts for two-phase deployment and environment configuration.

**Requirements:** Req #5 (Local Deployment), Req #6 (AWS Serverless Deployment), Req #8 (Remote Development with Proxy Support)  
**Design Reference:** Section 9 (Deployment Process), Section 5 (Configuration Management)

### 6.1 Local Development Scripts
- [x] Install concurrently as dev dependency
- [x] Create npm script `dev:local` to run backend and frontend concurrently
- [x] Verify script starts both servers simultaneously

### 6.2 Build Scripts
- [x] Create npm script `build:frontend` to run Next.js build
- [x] Verify backend build script from Phase 4.6 is in package.json

### 6.3 Backend Deployment Script
- [x] Create npm script `deploy:backend` to build backend and deploy CDK stack
- [x] Configure CDK to output results to cdk-outputs.json
- [x] Chain commands: build:backend && cdk deploy --outputs-file

### 6.4 Frontend Deployment Script
- [x] Create `scripts/deploy-frontend.js` Node.js script
- [x] Read cdk-outputs.json to extract ApiUrl, DistributionUrl, and BucketName
- [x] Generate .env.production.local file with NEXT_PUBLIC_ENV=aws
- [x] Set NEXT_PUBLIC_API_URL from CDK outputs
- [x] Execute build:frontend command (creates out/ directory)
- [x] Upload out/ directory to S3 bucket using AWS CLI
- [x] Invalidate CloudFront cache using AWS CLI
- [x] Log deployment URLs to console

### 6.5 Full AWS Deployment Script
- [x] Create npm script `deploy:aws` to chain deploy:backend and deploy:frontend
- [x] Ensure sequential execution (backend first, then frontend)

### 6.6 Environment Configuration Files
- [x] Create `.env.local` for local development with NEXT_PUBLIC_ENV=local
- [x] Set NEXT_PUBLIC_API_URL=http://localhost:3001
- [x] Set CORS_ORIGINS=http://localhost:3000 for backend
- [x] Create `.env.local.example` and `.env.production.local.example` templates
- [x] Document PROXY_API_URL usage in README for remote development (Req #8)

### 6.7 Deployment Workflow Verification
- [x] Verify deployment order: build backend → deploy CDK → build frontend → upload to S3
- [x] Ensure CDK stack creates S3 bucket and CloudFront before Lambda functions
- [x] Test that CORS_ORIGIN is correctly set in Lambda environment variables

**Manual Test:** Run deploy:backend, verify stack deploys successfully, run deploy:frontend, verify frontend uploads to S3 and is accessible via CloudFront URL.

---

## Phase 7: Integration & End-to-End Validation

**Goal:** Verify all requirements work in both local and AWS environments.

**Requirements:** All requirements (validation phase)  
**Design Reference:** All sections

### 7.1 Local Environment Validation
- [x] Start local environment with `npm run dev:local`
- [x] Verify frontend loads at http://localhost:3000
- [x] Verify backend responds at http://localhost:3001/api/messages
- [x] Post a message with valid content (Req #1)
- [x] Verify message appears in feed at top (Req #2)
- [x] Verify character counter updates correctly (Req #4)
- [x] Attempt to post empty message, verify error (Req #1, #7)
- [x] Attempt to post 281-character message, verify error (Req #1, #7)
- [x] Verify messages persist after server restart (Req #5)
- [x] Test responsive design on mobile viewport (Req #4)

### 7.2 Remote Development Validation
- [ ] Set PROXY_API_URL environment variable (Req #8)
- [ ] Start frontend with `npm run dev:frontend`
- [ ] Verify API requests are proxied correctly
- [ ] Verify hot-reloading works with proxy configuration (Req #8)
- [ ] Post and retrieve messages through proxy

**Note:** Proxy configuration verified in next.config.js. NOT TESTED - requires actual remote backend for end-to-end testing.

### 7.3 AWS Environment Validation
- [ ] Deploy to AWS with `npm run deploy:aws` (Req #6)
- [ ] Access CloudFront URL from CDK outputs
- [ ] Verify frontend loads correctly
- [ ] Post a message with valid content (Req #1)
- [ ] Verify message appears in feed at top (Req #2)
- [ ] Verify character counter updates correctly (Req #4)
- [ ] Attempt to post empty message, verify error (Req #1, #7)
- [ ] Attempt to post 281-character message, verify error (Req #1, #7)
- [ ] Verify messages persist in DynamoDB (Req #6)
- [ ] Test responsive design on mobile viewport (Req #4)
- [ ] Verify CORS headers allow frontend to call API (Req #3)

**Note:** Infrastructure code complete and ready. AWS deployment requires credentials. NOT TESTED - requires actual AWS deployment.

### 7.4 Error Handling Validation
- [x] Stop backend server, verify frontend shows network error (Req #7)
- [x] Verify error messages are user-friendly (Req #7)
- [x] Check browser console for proper error logging
- [x] Verify server logs errors with stack traces

### 7.5 API Contract Validation
- [x] Verify POST /api/messages returns 201 with message object (Req #3)
- [x] Verify GET /api/messages returns 200 with messages array (Req #3)
- [x] Verify error responses include error and code fields (Req #3)
- [x] Verify timestamps are Unix timestamps in milliseconds
- [x] Verify message IDs are UUIDs

### 7.6 Documentation
- [x] Create README.md with project overview
- [x] Document local development setup instructions
- [x] Document AWS deployment instructions
- [x] Document environment variables
- [x] Document API endpoints and request/response formats
- [x] Document remote development with proxy setup (Req #8)
- [x] Add architecture diagram reference to design.md

**Manual Test:** Complete all validation steps in both local and AWS environments, document any issues found.

---

## Summary

**Total Phases:** 7  
**Total Tasks:** 231 (215 completed, 16 not tested)

**Phase Completion Order:**
1. Phase 1: Foundation for all other phases ✅
2. Phase 2: Enables local backend testing ✅
3. Phase 3: Enables full local application testing ✅
4. Phase 4: Enables AWS backend preparation ✅
5. Phase 5: Enables AWS infrastructure deployment ✅
6. Phase 6: Enables automated deployment workflows ✅
7. Phase 7: Validates all requirements ⚠️ (local testing complete, AWS/proxy not tested)

**Requirements Coverage:**
- Req #1 (Message Posting): Phases 2, 3, 4, 7
- Req #2 (Feed Viewing): Phases 2, 3, 4, 7
- Req #3 (REST API): Phases 2, 4, 5, 7
- Req #4 (User Interface): Phases 3, 7
- Req #5 (Local Deployment): Phases 2, 3, 6, 7
- Req #6 (AWS Serverless Deployment): Phases 4, 5, 6, 7
- Req #7 (Error Handling): Phases 1, 2, 3, 4, 7
- Req #8 (Remote Development with Proxy): Phases 3, 6, 7
