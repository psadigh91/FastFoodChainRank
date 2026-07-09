# 🌯 ChainRank - Find the Best Fast Food Location

> A hyper-local restaurant rating app that helps you find the best menu items at chain restaurants in your city. Starting with Chipotle in Los Angeles.

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**Live Demo:** Coming soon...

---

## 🎯 What is ChainRank?

Ever noticed that one Chipotle makes WAY better burritos than the others? ChainRank helps you discover which location has the best version of your favorite menu item.

### ✨ Key Features

- 🗺️ **Location Map** - See all nearby Chipotle locations with ratings
- 📸 **Receipt Verification** - All reviews require receipt proof (no fake reviews!)
- ⭐ **Menu Item Rankings** - Find the best chicken burrito, steak bowl, etc.
- 🎮 **Gamification** - Earn points, unlock badges, climb the leaderboard
- 🏆 **Leaderboard** - Become a Chipotle Explorer or Chipotle Master
- 📊 **Real-time Stats** - See which locations are highest-rated

### 🌎 Current Coverage

- **City:** Los Angeles
- **Chain:** Chipotle (10 locations)
- **Menu Items:** Chicken/Steak/Carnitas/Veggie × Burrito/Bowl/Tacos

---

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 + React + TypeScript | Mobile-responsive web app |
| **UI** | Tailwind CSS + shadcn/ui | Beautiful, accessible components |
| **Backend** | AWS Lambda + API Gateway | Serverless API |
| **Database** | DynamoDB | NoSQL database for users, reviews, locations |
| **Storage** | S3 | Receipt image storage |
| **Auth** | Cognito | User authentication |
| **OCR** | Textract | Receipt verification |
| **Maps** | Mapbox | Interactive location map |
| **Hosting** | AWS Amplify | CI/CD + hosting |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- AWS Account
- AWS CLI configured
- Mapbox API key (free tier)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/chainrank.git
cd chainrank

# Install frontend dependencies
cd frontend
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

The app will open at `http://localhost:3000`

### Backend Setup

```bash
# Install AWS CDK
npm install -g aws-cdk

# Deploy backend infrastructure
cd backend
npm install
cdk bootstrap  # First time only
cdk deploy

# Output will show your API Gateway URL
# Add this to frontend/.env.local as NEXT_PUBLIC_API_URL
```

---

## 📁 Project Structure

```
chainrank/
├── frontend/                    # Next.js frontend
│   ├── app/                    # App Router pages
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   ├── (app)/             # Main app pages
│   │   │   ├── map/           # Location map
│   │   │   ├── locations/     # Location details
│   │   │   ├── reviews/       # Review submission
│   │   │   ├── leaderboard/   # Leaderboard & profile
│   │   │   └── profile/       # User profile
│   │   └── layout.tsx
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── map/              # Map components
│   │   ├── reviews/          # Review components
│   │   └── layout/           # Layout components
│   ├── lib/                   # Utilities
│   │   ├── api/              # API hooks (React Query)
│   │   ├── auth/             # Auth helpers
│   │   └── utils.ts
│   └── types/                 # TypeScript types
│
├── backend/                    # AWS CDK Infrastructure
│   ├── lib/                   # CDK stacks
│   │   ├── api-stack.ts      # API Gateway + Lambda
│   │   ├── database-stack.ts  # DynamoDB tables
│   │   ├── auth-stack.ts     # Cognito
│   │   └── storage-stack.ts  # S3 buckets
│   ├── lambda/                # Lambda functions
│   │   ├── auth/             # Auth handlers
│   │   ├── locations/        # Location handlers
│   │   ├── reviews/          # Review handlers
│   │   ├── receipts/         # Receipt verification
│   │   └── leaderboard/      # Leaderboard handlers
│   └── bin/                   # CDK app entry point
│
├── docs/                       # Documentation
├── scripts/                    # Utility scripts
└── README.md
```

---

## 🔐 Environment Variables

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_token
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_AWS_REGION=us-east-1
```

### Backend (set via CDK)

```env
DYNAMODB_USERS_TABLE=ChainRank-Users
DYNAMODB_LOCATIONS_TABLE=ChainRank-Locations
DYNAMODB_REVIEWS_TABLE=ChainRank-Reviews
DYNAMODB_LEADERBOARD_TABLE=ChainRank-Leaderboard
S3_RECEIPTS_BUCKET=chainrank-receipts
```

---

## 🎮 How It Works

### 1. **Find a Location**
- Open the map view
- See all Chipotle locations near you
- Tap a location to see ratings for each menu item

### 2. **Submit a Review**
- Visit a Chipotle location
- Order something
- Take a photo of your receipt
- Submit your review with a 1-10 rating
- Add optional comments

### 3. **Receipt Verification**
- AWS Textract scans your receipt
- Verifies location name, date, and item
- Approved reviews earn points
- Fake receipts are automatically rejected

### 4. **Earn Points & Badges**
- **10 points** per verified review
- **Bonus points** for first review at a new location
- Unlock badges: Explorer, Master, Legend
- Climb the leaderboard

### 5. **Discover the Best**
- See rankings for each menu item
- "Chicken Burrito: Location A (9.2/10) > Location B (7.8/10)"
- Make informed decisions on where to eat

---

## 📊 Database Schema

### Users Table
```
PK: userId
Attributes: email, username, points, level, badges, reviewCount
```

### Locations Table
```
PK: locationId
Attributes: name, address, lat, lng, chain, averageRating, reviewCount
```

### Reviews Table
```
PK: reviewId
SK: timestamp
GSI: locationId-timestamp
Attributes: userId, locationId, menuItem, rating, comment, receiptUrl, verified
```

### Leaderboard Table
```
PK: LEADERBOARD
SK: userId
GSI: CITY#LA-points
Attributes: username, points, reviewCount, rank
```

---

## 🛣️ Roadmap

### MVP (Current)
- [x] Project setup
- [ ] Frontend UI (map, reviews, leaderboard)
- [ ] Backend API (locations, reviews, auth)
- [ ] Receipt verification with Textract
- [ ] Basic gamification (points, levels)
- [ ] Seed 10 LA Chipotle locations

### v0.2 (Next)
- [ ] Photo uploads (food photos, not just receipts)
- [ ] Advanced badges (streak rewards, milestone badges)
- [ ] Social sharing (share your reviews on Twitter/Instagram)
- [ ] Search & filters (by menu item, rating, distance)

### v0.3 (Future)
- [ ] Expand to 50 LA locations
- [ ] Add more chains (Taco Bell, McDonald's, etc.)
- [ ] Video reviews (TikTok-style)
- [ ] Friend system (follow other reviewers)
- [ ] Expand to San Francisco, NYC

---

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test

# E2E tests
npm run test:e2e
```

---

## 🚢 Deployment

### Deploy Backend
```bash
cd backend
cdk deploy
```

### Deploy Frontend (Amplify)
1. Connect GitHub repo to AWS Amplify
2. Set environment variables in Amplify Console
3. Amplify auto-deploys on `main` branch pushes

### Manual Frontend Deploy
```bash
cd frontend
npm run build
aws s3 sync out/ s3://your-bucket-name
```

---

## 💰 Cost Estimate

For 1,000 users with 10,000 reviews:

| Service | Usage | Cost/Month |
|---------|-------|------------|
| **Lambda** | 100K invocations | $0.20 |
| **API Gateway** | 100K requests | $0.35 |
| **DynamoDB** | 10K reads, 5K writes | $1.25 |
| **S3** | 1GB storage + 10K requests | $0.50 |
| **Textract** | 1K receipt scans | $1.50 |
| **Amplify Hosting** | 5GB bandwidth | $0.15 |
| **Cognito** | 1K MAUs | Free |
| **Total** | | **~$4/month** |

At scale (100K users): ~$50-100/month

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Ways to Contribute
- Add new locations (LA Chipotles)
- Seed initial reviews
- Improve UI/UX
- Add new chains
- Write documentation
- Report bugs

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Inspired by apps like Untappd, Letterboxd, and Yelp
- Built with love for finding the best burrito in town

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/chainrank/issues)
- **Email:** psadigh91@gmil.com

---

**Made with ❤️ and 🌯 by Parham (https://github.com/psadigh91)**
