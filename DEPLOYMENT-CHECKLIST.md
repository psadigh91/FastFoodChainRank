# 🚀 ChainRank Deployment Checklist

This checklist ensures secure deployment to production. Complete each item before going live.

---

## ✅ Pre-Deployment (Local Development)

### 1. Environment Configuration
- [ ] Copy `backend/.env.example` to `backend/.env`
- [ ] Copy `frontend/.env.example` to `frontend/.env.local`
- [ ] Set `AWS_ACCOUNT_ID` in backend `.env`
- [ ] Set `AWS_REGION` in backend `.env` (default: `us-west-2`)
- [ ] Keep `CORS_ORIGINS=http://localhost:3000` for local testing

### 2. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Build and Validate
```bash
# Backend - TypeScript compilation
cd backend
npm run build

# Frontend - Next.js build
cd ../frontend
npm run build
```

---

## 🔐 Security Configuration (Production)

### 1. CORS Origins **[CRITICAL]**
Update `CORS_ORIGINS` environment variable before deploying:

**Option A: CDK Context (Recommended)**
```json
// backend/cdk.json - add:
{
  "context": {
    "corsOrigins": "https://your-app.amplifyapp.com,https://www.chainrank.com"
  }
}
```

**Option B: Environment Variable**
```bash
# Set before CDK deploy
export CORS_ORIGINS="https://your-app.amplifyapp.com,https://www.chainrank.com"
```

**Files to verify:**
- `backend/lib/api-stack.ts` (line 24)
- `backend/lib/storage-stack.ts` (line 52)

### 2. API Rate Limiting
✅ **Already configured** in `api-stack.ts`:
- Rate limit: 1,000 requests/second
- Burst limit: 2,000 concurrent requests

To adjust:
```typescript
// backend/lib/api-stack.ts
deployOptions: {
  throttlingRateLimit: 1000,   // Change this
  throttlingBurstLimit: 2000,  // Change this
}
```

### 3. Receipt Data Privacy
✅ **Already secured** - receipt text NOT logged or returned

Verify in `backend/lambda/receipts/verify.ts` (line 85):
- `extractedText` removed from response
- Only returns: `verified`, `confidence`, `message`

### 4. S3 Upload Size Limits
Add to `backend/lib/storage-stack.ts`:

```typescript
// Inside receiptsBucket definition
serverAccessLogsPrefix: 'access-logs/',
objectLockEnabled: false,
```

Add validation in `backend/lambda/receipts/upload.ts`:
```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
if (fileSize > MAX_FILE_SIZE) {
  return { statusCode: 413, body: 'File too large' };
}
```

---

## 📦 AWS Deployment

### 1. Bootstrap CDK (First-time only)
```bash
cd backend
npx cdk bootstrap aws://ACCOUNT-ID/REGION
```

### 2. Review Changes
```bash
npx cdk diff
```

### 3. Deploy Backend
```bash
# Deploy all stacks
npm run deploy

# Or deploy individually
npx cdk deploy ChainRankDatabaseStack
npx cdk deploy ChainRankStorageStack
npx cdk deploy ChainRankAuthStack
npx cdk deploy ChainRankApiStack
```

**Save outputs:**
- API Gateway URL
- User Pool ID
- User Pool Client ID
- S3 Bucket Name

### 4. Seed Database
```bash
npm run seed
```

### 5. Deploy Frontend (AWS Amplify)

#### Manual Setup:
1. Go to AWS Amplify Console
2. Click "New app" → "Host web app"
3. Connect to GitHub repo
4. Build settings:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: frontend/.next
    files:
      - '**/*'
  cache:
    paths:
      - frontend/node_modules/**/*
```

5. Environment variables (Amplify console):
```
NEXT_PUBLIC_API_URL=https://YOUR-API-ID.execute-api.us-west-2.amazonaws.com/prod
NEXT_PUBLIC_USER_POOL_ID=us-west-2_XXXXXXXXX
NEXT_PUBLIC_USER_POOL_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_AWS_REGION=us-west-2
NEXT_PUBLIC_RECEIPTS_BUCKET=chainrank-receipts-ACCOUNT-ID
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...  # Get from mapbox.com
```

6. Click "Save and deploy"

### 6. Update CORS with Amplify Domain
After Amplify deployment, get your domain (e.g., `https://main.d1234567890.amplifyapp.com`)

**Update backend:**
```bash
# Set environment variable
export CORS_ORIGINS="https://main.d1234567890.amplifyapp.com,https://www.chainrank.com"

# Redeploy API stack only
cd backend
npx cdk deploy ChainRankApiStack ChainRankStorageStack
```

---

## 🧪 Post-Deployment Testing

### 1. Health Checks
```bash
# Test API Gateway
curl https://YOUR-API-ID.execute-api.us-west-2.amazonaws.com/prod/locations

# Should return 200 with location list
```

### 2. Authentication Flow
- [ ] Visit your Amplify URL
- [ ] Click "Sign Up" - create test account
- [ ] Verify email via Cognito
- [ ] Log in successfully
- [ ] Check browser DevTools for JWT token

### 3. Core Features
- [ ] View locations on map page
- [ ] Click on a location
- [ ] View location details
- [ ] Submit a review (without receipt)
- [ ] Upload a receipt image
- [ ] Verify receipt processes
- [ ] Check leaderboard updates
- [ ] View user profile

### 4. Security Tests
- [ ] Try accessing API without Authorization header (should 401)
- [ ] Try uploading 20MB file (should reject if limit added)
- [ ] Check browser console - no CORS errors
- [ ] Verify receipt text NOT in API response
- [ ] Check CloudWatch Logs - no PII logged

---

## 📊 Monitoring Setup

### 1. CloudWatch Alarms (Recommended)
```bash
# Create alarm for Lambda errors
aws cloudwatch put-metric-alarm \
  --alarm-name "ChainRank-Lambda-Errors" \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --period 300 \
  --statistic Sum \
  --threshold 10 \
  --alarm-description "Alert on Lambda function errors" \
  --alarm-actions arn:aws:sns:us-west-2:ACCOUNT-ID:alerts
```

### 2. Cost Alerts
1. Go to AWS Billing Console
2. Create Budget: "ChainRank Monthly"
3. Set threshold: $50/month (adjust based on traffic)
4. Add email notification

### 3. DynamoDB Monitoring
- [ ] Enable DynamoDB Contributor Insights (optional)
- [ ] Set CloudWatch alarm for throttled requests
- [ ] Monitor read/write capacity metrics

---

## 🔒 Additional Security (Optional)

### 1. AWS WAF (Web Application Firewall)
```bash
# Protect API Gateway from common attacks
aws wafv2 create-web-acl \
  --name ChainRankWAF \
  --scope REGIONAL \
  --default-action Allow={} \
  --rules file://waf-rules.json
```

### 2. AWS GuardDuty
1. Enable GuardDuty in AWS Console
2. Set up SNS notifications for threats
3. Review findings weekly

### 3. API Key (Optional Layer)
Add API keys in API Gateway for additional auth layer:
```typescript
// In api-stack.ts
const apiKey = api.addApiKey('ChainRankApiKey');
const plan = api.addUsagePlan('ChainRankUsagePlan', {
  throttle: { rateLimit: 100, burstLimit: 200 }
});
plan.addApiKey(apiKey);
```

---

## 📋 GDPR Compliance (If targeting EU)

### 1. Add User Deletion Endpoint
Create `backend/lambda/users/delete.ts`:
```typescript
export const handler = async (event) => {
  const userId = event.requestContext.authorizer?.claims?.sub;
  
  // Delete user data from all tables
  await Promise.all([
    deleteFromUsers(userId),
    deleteReviewsByUser(userId),
    deleteFromLeaderboard(userId),
    deleteReceiptsFromS3(userId),
  ]);
  
  return { statusCode: 204 };
};
```

Add route in `api-stack.ts`:
```typescript
const deleteUserIntegration = new apigateway.LambdaIntegration(deleteUserFn);
usersResource.addMethod('DELETE', deleteUserIntegration, { authorizer });
```

### 2. Add Data Export Endpoint
Create `backend/lambda/users/export.ts` - returns all user data as JSON

### 3. Add Privacy Policy
Create `frontend/app/privacy/page.tsx` with your privacy policy

### 4. Add Terms of Service
Create `frontend/app/terms/page.tsx` with ToS

---

## ✅ Final Checklist

Before announcing to users:

- [ ] All backend services deployed
- [ ] Frontend deployed to Amplify
- [ ] CORS configured with production domain
- [ ] Database seeded with 10 LA Chipotle locations
- [ ] Rate limiting enabled (1000 req/sec)
- [ ] Receipt text NOT exposed in API
- [ ] Test user account created and verified
- [ ] All core features tested end-to-end
- [ ] CloudWatch alarms configured
- [ ] Cost alerts set ($50/month threshold)
- [ ] Security audit passed (see SECURITY-AUDIT.md)
- [ ] Privacy policy published (if GDPR applies)
- [ ] Terms of service published
- [ ] Monitoring dashboard set up
- [ ] Backup/disaster recovery plan documented

---

## 📞 Support Contacts

**AWS Support:**
- Account ID: [Your AWS Account ID]
- Primary Region: us-west-2
- Support Plan: [Basic/Developer/Business]

**Application Contacts:**
- Developer: [Your Email]
- GitHub Repo: [Your Repo URL]
- Issue Tracker: [GitHub Issues URL]

---

## 🔄 Post-Launch Maintenance

### Daily:
- [ ] Check CloudWatch Logs for errors
- [ ] Monitor AWS costs (Billing Dashboard)

### Weekly:
- [ ] Review user feedback
- [ ] Check leaderboard for abuse
- [ ] Verify receipt verification accuracy

### Monthly:
- [ ] Security audit (re-run SECURITY-AUDIT.md checks)
- [ ] Update dependencies (`npm audit`)
- [ ] Review and optimize costs
- [ ] Backup DynamoDB tables (optional: enable point-in-time recovery)

---

**Deployment Date:** _____________  
**Deployed By:** _____________  
**Production URL:** _____________  
**API Gateway URL:** _____________

---

## 🎉 Congratulations!

Your ChainRank MVP is now live. Monitor closely for the first 48 hours.

**Next Steps:**
1. Share with 10-20 beta testers in LA
2. Gather feedback on receipt verification accuracy
3. Monitor AWS costs (should be <$5/month for <100 users)
4. Iterate based on user feedback
5. Add more locations (expand beyond LA)

Good luck! 🚀
