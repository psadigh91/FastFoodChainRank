# ⚡ ChainRank Quick Start

**Get running in 5 minutes!**

---

## 🎯 Prerequisites Check

Before you start, verify you have:

```bash
# Check Node.js (need 18+)
node --version
# If not installed: https://nodejs.org/

# Check npm
npm --version

# Check AWS CLI (need 2.x)
aws --version
# If not installed: https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html

# Configure AWS (if not done)
aws configure
# Enter your Access Key, Secret Key, Region (us-east-1), Output (json)
```

---

## ⚙️ Installation (2 minutes)

```bash
# Navigate to project
cd chainrank

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Install AWS CDK globally
npm install -g aws-cdk
```

---

## ☁️ Deploy Backend (5 minutes)

```bash
cd backend

# Bootstrap CDK (first time only)
cdk bootstrap

# Deploy all infrastructure
cdk deploy --all
# Type 'y' when prompted
# Wait 5-10 minutes for deployment

# Copy the outputs:
# - ChainRankApiStack.ApiUrl
# - ChainRankAuthStack.UserPoolId
# - ChainRankAuthStack.ClientId
```

---

## 🎨 Configure Frontend (1 minute)

```bash
cd frontend

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your values:
# (Use outputs from CDK deploy above)

NEXT_PUBLIC_API_URL=https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_token_here
```

**Get Mapbox token:**
1. Go to [Mapbox.com](https://account.mapbox.com/)
2. Sign up (free)
3. Create a token
4. Copy and paste into `.env.local`

---

## 🚀 Run Locally (1 minute)

```bash
cd frontend

# Start development server
npm run dev

# Open browser
open http://localhost:3000
```

**You should see:**
- ✅ ChainRank homepage
- ✅ "View Map" button
- ✅ "Leaderboard" button
- ✅ 4 feature cards

---

## 📍 Seed Location Data (1 minute)

```bash
cd backend

# Run seed script
npm run seed

# This adds:
# - 10 LA Chipotle locations
# - Menu items (chicken/steak/carnitas × burrito/bowl/tacos)
# - Badges
```

---

## ✅ Test the App

### 1. View Map
- Click **"View Map"**
- You should see 10 Chipotle pins in Los Angeles
- Click a pin to see location details

### 2. Create Account
- Click **"Submit Review"**
- You'll be prompted to log in
- Click **"Sign Up"**
- Enter email + password
- Verify email (check inbox)

### 3. Submit Review
- Select a location
- Choose menu item: "Chicken Burrito"
- Upload a receipt photo (any image works for testing)
- Rate 1-10
- Add comment (optional)
- Submit

### 4. Check Leaderboard
- Visit `/leaderboard`
- You should see yourself ranked #1 with 10 points
- Check your badges

---

## 🌐 Deploy to Production (Optional)

### Deploy Frontend to AWS Amplify

```bash
# Option A: Via Amplify Console
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/chainrank.git
git push -u origin main

# 2. Go to AWS Amplify Console
# 3. Connect GitHub repo
# 4. Amplify auto-deploys

# Option B: Via Amplify CLI
npm install -g @aws-amplify/cli
cd frontend
amplify init
amplify add hosting
amplify publish
```

---

## 🐛 Troubleshooting

### "Cannot find module 'next'"
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### "AWS credentials not found"
```bash
aws configure
# Re-enter your credentials
```

### "CDK deploy fails"
```bash
# Ensure you have AdministratorAccess IAM policy
# Or at minimum: CloudFormation, Lambda, DynamoDB, S3, IAM permissions
```

### "Mapbox map not loading"
- Check `NEXT_PUBLIC_MAPBOX_TOKEN` is set in `.env.local`
- Verify token is valid at https://account.mapbox.com/access-tokens/

### "API calls failing"
- Check `NEXT_PUBLIC_API_URL` matches CDK output
- Open browser console (F12) for error details
- Check Lambda logs: `aws logs tail /aws/lambda/ChainRank- --follow`

---

## 📊 Verify Everything Works

Run these commands to verify deployment:

```bash
# Check DynamoDB tables exist
aws dynamodb list-tables | grep ChainRank

# Check S3 bucket exists
aws s3 ls | grep chainrank

# Check API Gateway
curl https://YOUR_API_URL/prod/locations

# Check Lambda functions
aws lambda list-functions | grep ChainRank
```

---

## 💡 What's Next?

Now that it's running:

1. **Customize** - Change colors, logo, branding
2. **Expand** - Add more locations, chains, cities
3. **Enhance** - Add video reviews, social features
4. **Deploy** - Push to Amplify for live demo
5. **Share** - Add to portfolio, GitHub, resume

---

## 📞 Need Help?

- **Full setup guide:** Read `SETUP.md`
- **Architecture docs:** Read `docs/ARCHITECTURE.md`
- **Project overview:** Read `README.md`
- **GitHub issues:** Open an issue if stuck

---

## ✨ You're Done!

Your app is now:
- ✅ Running locally
- ✅ Connected to AWS backend
- ✅ Seeded with 10 locations
- ✅ Ready to demo

**Time to find the best burrito in LA! 🌯**

---

## 📋 Quick Reference

```bash
# Start frontend
cd frontend && npm run dev

# Deploy backend
cd backend && cdk deploy --all

# View logs
aws logs tail /aws/lambda/ChainRank- --follow

# Check DynamoDB data
aws dynamodb scan --table-name ChainRank-Locations

# Push to GitHub
git add . && git commit -m "Update" && git push
```

---

**Happy coding! 🚀**
