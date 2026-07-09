# 🚀 ChainRank Setup Guide

Complete step-by-step guide to get ChainRank running locally and deployed to AWS.

---

## ⚠️ Prerequisites

Before starting, ensure you have:

- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **AWS Account** with CLI configured
- **AWS CLI** installed and configured (`aws configure`)
- **Mapbox Account** (free tier) for maps
- **Git** installed

---

## 📦 Part 1: Local Development Setup

### Step 1: Install Node.js (if not installed)

```bash
# Check if Node.js is installed
node --version
npm --version

# If not installed, download from https://nodejs.org/
# Or use nvm (recommended):
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

### Step 2: Clone and Install Dependencies

```bash
# Navigate to the project
cd chainrank

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Step 3: Set Up Mapbox API Key

1. Go to [Mapbox](https://www.mapbox.com/)
2. Sign up for free account
3. Create a new token with these scopes:
   - `styles:read`
   - `fonts:read`
   - `datasets:read`
4. Copy your token

### Step 4: Configure Environment Variables

```bash
# In frontend directory
cd frontend
cp .env.example .env.local

# Edit .env.local and add your Mapbox token:
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_actual_token_here
```

### Step 5: Run Frontend Locally

```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` - you should see the ChainRank homepage!

*Note: The app will show "API not configured" errors until you deploy the backend.*

---

## ☁️ Part 2: AWS Backend Deployment

### Step 1: Install AWS CDK

```bash
npm install -g aws-cdk
cdk --version
```

### Step 2: Configure AWS CLI

```bash
# Configure with your AWS credentials
aws configure

# Enter:
# - AWS Access Key ID
# - AWS Secret Access Key  
# - Default region: us-east-1
# - Output format: json
```

### Step 3: Bootstrap CDK (First Time Only)

```bash
cd backend
cdk bootstrap aws://YOUR-ACCOUNT-ID/us-east-1

# Find your account ID:
aws sts get-caller-identity --query Account --output text
```

### Step 4: Deploy Backend Infrastructure

```bash
cd backend

# Install dependencies
npm install

# Deploy all stacks
cdk deploy --all

# This will create:
# - DynamoDB tables (Users, Locations, Reviews, Leaderboard)
# - S3 bucket for receipt images
# - Cognito User Pool for authentication
# - API Gateway + Lambda functions
# - IAM roles and permissions

# Deployment takes ~5-10 minutes
```

### Step 5: Note Your API Endpoints

After deployment, CDK will output:

```
Outputs:
ChainRankApiStack.ApiUrl = https://abc123.execute-api.us-east-1.amazonaws.com/prod
ChainRankAuthStack.UserPoolId = us-east-1_xxxxxxxxx
ChainRankAuthStack.ClientId = xxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Copy these values!** You'll need them next.

### Step 6: Update Frontend Environment Variables

```bash
cd frontend

# Edit .env.local and add the outputs from CDK:
NEXT_PUBLIC_API_URL=https://abc123.execute-api.us-east-1.amazonaws.com/prod
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_AWS_REGION=us-east-1
```

### Step 7: Seed Initial Location Data

```bash
cd backend

# Run the seed script to add 10 LA Chipotle locations
npm run seed

# This will populate the Locations table with:
# - 10 Chipotle locations in Los Angeles
# - Menu items (chicken/steak/carnitas × burrito/bowl/tacos)
# - GPS coordinates for map display
```

### Step 8: Test the Full Stack

```bash
# Start frontend
cd frontend
npm run dev

# Visit http://localhost:3000
# - Click "View Map" - you should see 10 Chipotle locations
# - Click "Submit Review" - auth flow should work
# - Submit a test review with receipt photo
```

---

## 🚀 Part 3: Deploy Frontend to AWS Amplify

### Option A: Deploy via Amplify Console (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/chainrank.git
   git push -u origin main
   ```

2. **Connect to Amplify:**
   - Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
   - Click **"New app"** → **"Host web app"**
   - Select **GitHub** and authorize
   - Choose your `chainrank` repository
   - Branch: `main`

3. **Configure Build Settings:**
   - Amplify should auto-detect Next.js
   - Build command: `npm run build`
   - Output directory: `.next`

4. **Add Environment Variables:**
   - In Amplify Console → **Environment variables**
   - Add all variables from `.env.local`:
     ```
     NEXT_PUBLIC_API_URL=...
     NEXT_PUBLIC_COGNITO_USER_POOL_ID=...
     NEXT_PUBLIC_COGNITO_CLIENT_ID=...
     NEXT_PUBLIC_AWS_REGION=us-east-1
     NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token
     ```

5. **Deploy:**
   - Click **"Save and deploy"**
   - Deployment takes ~5 minutes
   - Your app will be live at: `https://main.xxxxx.amplifyapp.com`

### Option B: Manual Deploy via Amplify CLI

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
cd frontend
amplify init

# Add hosting
amplify add hosting

# Choose:
# - Hosting with Amplify Console (Managed hosting)
# - Manual deployment

# Deploy
amplify publish
```

---

## 🧪 Part 4: Testing the Full App

### Test 1: View Locations Map

1. Visit your deployed URL
2. Click **"View Map"**
3. You should see 10 Chipotle pins in LA
4. Click a pin → See location details

### Test 2: Submit a Review

1. Click **"Submit Review"**
2. Sign up for an account (or log in)
3. Select a location
4. Choose menu item: "Chicken Burrito"
5. Upload a receipt photo (any image works for testing)
6. Rate 1-10
7. Submit
8. Check that review appears on location page

### Test 3: Leaderboard

1. Visit **"/leaderboard"**
2. You should see yourself ranked #1 with 10 points
3. Check your badges earned

---

## 📊 Part 5: Monitor Your AWS Resources

### Check DynamoDB Tables

```bash
# List all reviews
aws dynamodb scan --table-name ChainRank-Reviews --region us-east-1

# List all locations
aws dynamodb scan --table-name ChainRank-Locations --region us-east-1
```

### Check S3 Bucket (Receipt Images)

```bash
# List uploaded receipts
aws s3 ls s3://chainrank-receipts/

# View an image
aws s3 cp s3://chainrank-receipts/receipts/abc123.jpg ./receipt.jpg
open receipt.jpg
```

### Check Lambda Logs

```bash
# View logs for reviews Lambda
aws logs tail /aws/lambda/ChainRank-ReviewsFunction --follow

# View logs for all Lambdas
aws logs tail /aws/lambda/ChainRank- --follow
```

### Check API Gateway Metrics

- Go to [API Gateway Console](https://console.aws.amazon.com/apigateway/)
- Select your `ChainRank-API`
- View **Metrics** dashboard (requests, latency, errors)

---

## 💰 Part 6: Cost Management

### Expected Costs

For development/testing (100 reviews, 10 users):
- **Total: ~$2-5/month**

For production (1,000 reviews, 100 users):
- **Total: ~$10-20/month**

### Cost Breakdown

| Service | Free Tier | Your Usage | Cost |
|---------|-----------|------------|------|
| Lambda | 1M requests/month | ~10K | $0 |
| API Gateway | 1M requests/month | ~10K | $0 |
| DynamoDB | 25 GB + 200M requests | ~1 GB | $1.25 |
| S3 | 5 GB + 20K requests | ~1 GB | $0.50 |
| Textract | 1K pages/month | ~100 | Free |
| Cognito | 50K MAUs | ~10 | Free |
| Amplify | 1 GB build minutes | ~5 min | $0 |
| **Total** | | | **~$2/month** |

### Set Up Billing Alerts

1. Go to [AWS Billing Dashboard](https://console.aws.amazon.com/billing/)
2. Click **Budgets** → **Create budget**
3. Set $10/month alert threshold
4. Add your email for notifications

---

## 🔒 Part 7: Security Best Practices

### 1. Cognito Password Policy

```bash
# Update User Pool password requirements
aws cognito-idp update-user-pool \
  --user-pool-id YOUR_POOL_ID \
  --policies "PasswordPolicy={MinimumLength=12,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=true}"
```

### 2. Enable S3 Bucket Encryption

```bash
aws s3api put-bucket-encryption \
  --bucket chainrank-receipts \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

### 3. Enable CloudWatch Logs for Lambda

All Lambda functions should have logs enabled (CDK does this automatically).

### 4. Set up WAF (Optional, for production)

Protect API Gateway from DDoS:
- Go to AWS WAF Console
- Create Web ACL
- Attach to API Gateway stage

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'next'"

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Issue: "AWS credentials not found"

**Solution:**
```bash
aws configure
# Enter your credentials again
```

### Issue: "CDK deploy fails with permissions error"

**Solution:**
```bash
# Ensure your IAM user has these policies:
# - AdministratorAccess (for initial setup)
# - Or: AWSCloudFormationFullAccess, IAMFullAccess, AmazonS3FullAccess
```

### Issue: "Mapbox map not loading"

**Solution:**
- Check that `NEXT_PUBLIC_MAPBOX_TOKEN` is set correctly in `.env.local`
- Verify token has correct scopes at https://account.mapbox.com/access-tokens/

### Issue: "Textract receipt verification failing"

**Solution:**
```bash
# Ensure Lambda has Textract permissions (CDK adds this automatically)
# Test Textract manually:
aws textract detect-document-text \
  --document '{"S3Object":{"Bucket":"chainrank-receipts","Name":"test.jpg"}}'
```

### Issue: "Reviews not appearing on map"

**Solution:**
```bash
# Check DynamoDB for data:
aws dynamodb scan --table-name ChainRank-Reviews

# Check API Gateway logs:
aws logs tail /aws/lambda/ChainRank-ReviewsFunction --follow

# Test API directly:
curl https://YOUR_API_URL/prod/reviews
```

---

## 🎯 Next Steps

Once everything is working:

1. **Seed More Data:**
   - Add more Chipotle locations (see `backend/scripts/seed-locations.ts`)
   - Generate test reviews (see `backend/scripts/seed-reviews.ts`)

2. **Customize Branding:**
   - Update logo in `frontend/public/logo.png`
   - Change colors in `tailwind.config.ts`

3. **Add Features:**
   - Video reviews
   - Social sharing
   - Friend system
   - More badges

4. **Monitor & Optimize:**
   - Set up CloudWatch dashboards
   - Enable X-Ray tracing for Lambda
   - Add error tracking (Sentry)

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Search GitHub Issues
3. Open a new issue with:
   - Error message
   - Steps to reproduce
   - Your AWS region
   - Node.js version

---

**Ready to find the best burrito in town? 🌯**
