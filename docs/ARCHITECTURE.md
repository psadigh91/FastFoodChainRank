# 🏗️ ChainRank Architecture

Comprehensive technical architecture documentation.

---

## 📊 System Overview

ChainRank is a serverless, mobile-first web application built entirely on AWS with a Next.js frontend.

```
┌──────────────────────────────────────────────────────────┐
│                     User's Browser                        │
│             (Next.js 14 + React + Mapbox)                │
└─────────────────────┬────────────────────────────────────┘
                      │
                      │ HTTPS
                      │
┌─────────────────────▼────────────────────────────────────┐
│                  AWS Amplify                              │
│         (Static Hosting + CI/CD + CDN)                    │
└─────────────────────┬────────────────────────────────────┘
                      │
                      │ REST API (HTTPS)
                      │
┌─────────────────────▼────────────────────────────────────┐
│              AWS API Gateway                              │
│         (REST API + Request Validation)                   │
└───┬─────────┬─────────┬─────────┬────────┬───────────────┘
    │         │         │         │        │
    │ Lambda  │ Lambda  │ Lambda  │ Lambda │ Lambda
    │         │         │         │        │
    ▼         ▼         ▼         ▼        ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌──────┐ ┌──────┐
│  Auth  │ │Location│ │Reviews │ │Rceipt│ │Leader│
│Handler │ │Handler │ │Handler │ │Verify│ │board │
└───┬────┘ └───┬────┘ └───┬────┘ └───┬──┘ └───┬──┘
    │          │          │          │        │
    │          └──────────┴──────────┴────────┘
    │                     │                    │
    ▼                     ▼                    ▼
┌────────┐        ┌──────────────┐      ┌─────────┐
│Cognito │        │  DynamoDB    │      │   S3    │
│        │        │  (4 Tables)  │      │(Receipt │
│User    │        │              │      │ Images) │
│Pool    │        │- Users       │      │         │
└────────┘        │- Locations   │      │         │
                  │- Reviews     │      │         │
                  │- Leaderboard │      │         │
                  └──────────────┘      └─────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │AWS Textract  │
                  │(Receipt OCR) │
                  └──────────────┘
```

---

## 🎨 Frontend Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 14 (App Router) | SSR, routing, optimization |
| **Language** | TypeScript | Type safety |
| **UI Library** | React 18 | Component-based UI |
| **Styling** | Tailwind CSS + shadcn/ui | Utility-first CSS + accessible components |
| **State Management** | Zustand + React Query | Client state + server state |
| **Maps** | Mapbox GL JS | Interactive location maps |
| **API Client** | Axios + React Query | HTTP requests + caching |
| **Auth** | AWS Amplify (Cognito) | User authentication |

### Page Structure

```
app/
├── page.tsx                    # Home/landing page
├── layout.tsx                  # Root layout with providers
├── globals.css                 # Global styles + Tailwind
├── providers.tsx               # React Query + Auth providers
│
├── map/
│   └── page.tsx               # Interactive location map
│
├── locations/
│   ├── page.tsx               # Location list
│   └── [id]/
│       └── page.tsx           # Location detail + rankings
│
├── reviews/
│   ├── page.tsx               # Review list
│   ├── new/
│   │   └── page.tsx           # Submit review flow
│   └── [id]/
│       └── page.tsx           # Review detail
│
├── leaderboard/
│   └── page.tsx               # User rankings + badges
│
├── profile/
│   └── page.tsx               # User profile + stats
│
└── (auth)/
    ├── login/
    │   └── page.tsx           # Login page
    └── register/
        └── page.tsx           # Registration page
```

### Component Architecture

```
components/
├── ui/                         # shadcn/ui base components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   └── ...
│
├── layout/                     # Layout components
│   ├── header.tsx             # Top navigation
│   ├── footer.tsx             # Footer
│   └── mobile-nav.tsx         # Mobile navigation drawer
│
├── map/                        # Map components
│   ├── location-map.tsx       # Main map component
│   ├── location-marker.tsx    # Custom map marker
│   └── location-popup.tsx     # Marker popup
│
└── reviews/                    # Review components
    ├── review-card.tsx        # Single review card
    ├── review-form.tsx        # Review submission form
    ├── receipt-upload.tsx     # Receipt upload widget
    └── rating-input.tsx       # 1-10 rating slider
```

### State Management Strategy

**Server State (React Query):**
- API data (locations, reviews, user profile)
- Automatic caching, refetching, invalidation
- Optimistic updates

**Client State (Zustand):**
- UI state (modals, drawers, filters)
- Map viewport (center, zoom)
- Review draft (multi-step form)

**Example:**
```typescript
// Server state (React Query)
const { data: locations } = useQuery({
  queryKey: ['locations'],
  queryFn: fetchLocations,
});

// Client state (Zustand)
const { mapCenter, setMapCenter } = useMapStore();
```

---

## ☁️ Backend Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **IaC** | AWS CDK (TypeScript) | Infrastructure as Code |
| **API** | API Gateway (REST) | HTTP API routing |
| **Compute** | Lambda (Node.js 20) | Serverless functions |
| **Database** | DynamoDB | NoSQL database |
| **Storage** | S3 | Receipt image storage |
| **Auth** | Cognito | User authentication |
| **OCR** | Textract | Receipt verification |

### CDK Stack Structure

```
lib/
├── auth-stack.ts               # Cognito User Pool + Client
├── database-stack.ts           # DynamoDB tables
├── storage-stack.ts            # S3 bucket for receipts
├── api-stack.ts                # API Gateway + Lambda functions
└── monitoring-stack.ts         # CloudWatch dashboards (optional)
```

### Lambda Functions

```
lambda/
├── auth/
│   ├── register.ts            # POST /auth/register
│   ├── login.ts               # POST /auth/login
│   └── me.ts                  # GET /auth/me
│
├── locations/
│   ├── list.ts                # GET /locations
│   ├── get.ts                 # GET /locations/:id
│   └── nearby.ts              # GET /locations/nearby?lat=X&lng=Y
│
├── reviews/
│   ├── list.ts                # GET /reviews
│   ├── get.ts                 # GET /reviews/:id
│   ├── create.ts              # POST /reviews
│   └── by-location.ts         # GET /locations/:id/reviews
│
├── receipts/
│   ├── upload.ts              # POST /receipts/upload
│   └── verify.ts              # POST /receipts/verify
│
└── leaderboard/
    ├── get.ts                 # GET /leaderboard
    └── me.ts                  # GET /leaderboard/me
```

---

## 🗄️ Database Schema (DynamoDB)

### Design Principles
- **Single Table Design** - All data in one table (optional)
- **Access Patterns First** - Schema designed for query patterns
- **GSIs for Queries** - Global Secondary Indexes for alternate access

### Table 1: Users

**Primary Key:**
- `PK`: `USER#{userId}`
- `SK`: `PROFILE`

**Attributes:**
```json
{
  "userId": "uuid",
  "email": "string",
  "username": "string",
  "firstName": "string",
  "lastName": "string",
  "createdAt": "timestamp",
  "points": "number",
  "level": "number",
  "badges": ["string"],
  "reviewCount": "number"
}
```

**Access Patterns:**
- Get user by ID: `PK = USER#{id}, SK = PROFILE`
- Get user by email: GSI on `email`

---

### Table 2: Locations

**Primary Key:**
- `PK`: `LOCATION#{locationId}`
- `SK`: `METADATA`

**Attributes:**
```json
{
  "locationId": "uuid",
  "name": "string",
  "address": "string",
  "city": "string",
  "state": "string",
  "zipCode": "string",
  "lat": "number",
  "lng": "number",
  "chain": "string",
  "averageRating": "number",
  "reviewCount": "number",
  "menuItems": {
    "chicken-burrito": { "avgRating": 8.5, "count": 23 },
    "steak-bowl": { "avgRating": 7.2, "count": 18 },
    ...
  }
}
```

**GSI-1: by-chain-city**
- `PK`: `CHAIN#{chain}#CITY#{city}`
- `SK`: `LOCATION#{locationId}`

**Access Patterns:**
- Get location by ID: `PK = LOCATION#{id}`
- Get all locations in city: Query GSI-1 where `PK = CHAIN#chipotle#CITY#LA`
- Get nearby locations: Scan + filter by lat/lng (or use DynamoDB Geo Library)

---

### Table 3: Reviews

**Primary Key:**
- `PK`: `REVIEW#{reviewId}`
- `SK`: `timestamp`

**GSI-1: by-location**
- `PK`: `LOCATION#{locationId}`
- `SK`: `timestamp`

**GSI-2: by-user**
- `PK`: `USER#{userId}`
- `SK`: `timestamp`

**Attributes:**
```json
{
  "reviewId": "uuid",
  "userId": "string",
  "locationId": "string",
  "menuItem": "string",
  "rating": "number",
  "comment": "string",
  "receiptUrl": "string",
  "verified": "boolean",
  "verificationDetails": {
    "locationMatched": "boolean",
    "dateMatched": "boolean",
    "confidence": "number"
  },
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Access Patterns:**
- Get review by ID: `PK = REVIEW#{id}`
- Get reviews for location: Query GSI-1 where `PK = LOCATION#{id}`
- Get reviews by user: Query GSI-2 where `PK = USER#{id}`
- Get recent reviews: Scan + sort by timestamp (use DynamoDB Streams for recent feed)

---

### Table 4: Leaderboard

**Primary Key:**
- `PK`: `LEADERBOARD`
- `SK`: `USER#{userId}`

**GSI-1: by-points (for ranking)**
- `PK`: `CITY#{city}`
- `SK`: `points##{points}#{userId}` (composite for sorting)

**Attributes:**
```json
{
  "userId": "string",
  "username": "string",
  "city": "string",
  "points": "number",
  "reviewCount": "number",
  "badges": ["string"],
  "rank": "number",
  "lastUpdated": "timestamp"
}
```

**Access Patterns:**
- Get user rank: `PK = LEADERBOARD, SK = USER#{id}`
- Get top 100 users: Query GSI-1 where `PK = CITY#LA`, sort by `SK` descending, limit 100

---

## 🔐 Authentication Flow

### Registration

```
User → Frontend → API Gateway → Lambda (register) → Cognito
                                     ↓
                                 DynamoDB (create user record)
                                     ↓
                                  Return JWT
```

### Login

```
User → Frontend → API Gateway → Lambda (login) → Cognito (verify)
                                     ↓
                                  Return JWT + Refresh Token
```

### Authenticated Requests

```
User → Frontend (includes JWT) → API Gateway (JWT Authorizer) → Lambda
                                         ↓
                                    Validate JWT with Cognito
                                         ↓
                                    Allow/Deny request
```

---

## 📸 Receipt Verification Flow

```
1. User uploads receipt image
   ↓
2. Frontend → S3 (presigned URL upload)
   ↓
3. Frontend → Lambda (trigger verification)
   ↓
4. Lambda → Textract (extract text from image)
   ↓
5. Lambda → Parse Textract response
   - Extract location name
   - Extract date
   - Extract menu items
   ↓
6. Lambda → Validate against review
   - Does location match?
   - Is date within 24 hours?
   - Are items plausible?
   ↓
7. Lambda → Update review record
   - Set verified=true/false
   - Add verificationDetails
   ↓
8. Lambda → Update user points (if verified)
   ↓
9. Return verification result to frontend
```

---

## 🎮 Gamification System

### Points

| Action | Points |
|--------|--------|
| Submit verified review | 10 |
| First review at new location | 20 (bonus) |
| Review with photo | 5 (bonus) |
| Review with detailed comment | 5 (bonus) |

### Levels

| Level | Points Required | Title |
|-------|----------------|-------|
| 1 | 0 | Novice |
| 2 | 50 | Explorer |
| 3 | 200 | Enthusiast |
| 4 | 500 | Expert |
| 5 | 1000 | Master |
| 6 | 2500 | Legend |

### Badges

| Badge | Requirement |
|-------|------------|
| 🌟 First Review | Submit 1 review |
| 🔥 Hot Streak | 7 days in a row |
| 🗺️ Explorer | Visit 5 different locations |
| 📸 Photographer | 10 reviews with photos |
| ✍️ Critic | 10 reviews with detailed comments |
| 🏆 Top 10 | Reach top 10 on leaderboard |
| 👑 #1 Ranked | Reach #1 on leaderboard |
| 💯 Perfectionist | Give 10 reviews rated 10/10 |
| 🌯 Burrito Master | Rate 50 burritos |
| 🥗 Bowl Boss | Rate 50 bowls |
| 🌮 Taco Titan | Rate 50 tacos |
| 📍 Local Legend | 100 reviews in one city |

---

## 📊 Performance Optimizations

### Frontend

**1. Image Optimization:**
- Use Next.js `<Image>` component
- Lazy load receipt images
- WebP format with fallbacks

**2. Code Splitting:**
- Route-based splitting (automatic in Next.js)
- Dynamic imports for heavy components (Mapbox)

**3. Caching:**
- React Query cache (5 minutes for locations)
- Service Worker for offline support (optional)

**4. Mapbox Optimization:**
- Cluster markers when zoomed out
- Lazy load map (only render when visible)
- Throttle map move events

### Backend

**1. DynamoDB:**
- Use BatchGetItem for multiple items
- Enable DynamoDB caching (DAX) for hot data
- Use sparse GSIs to reduce storage

**2. Lambda:**
- Reuse HTTP connections (keep-alive)
- Use Lambda layers for shared code
- Enable Provisioned Concurrency for critical functions (optional)

**3. API Gateway:**
- Enable caching (5-minute TTL for locations)
- Use request validation to reject bad requests early

**4. S3:**
- Enable CloudFront CDN for receipt images (optional)
- Use intelligent tiering for cost optimization

---

## 💰 Cost Optimization

### Monthly Cost Estimate (1,000 reviews, 100 users)

| Service | Usage | Cost |
|---------|-------|------|
| **Lambda** | 50K invocations @ 512MB, 1s avg | $0.20 |
| **API Gateway** | 50K requests | $0.18 |
| **DynamoDB** | 1 GB storage, 10K reads, 5K writes | $1.25 |
| **S3** | 1 GB storage, 5K GET, 1K PUT | $0.50 |
| **Textract** | 1K receipt scans | $1.50 |
| **Cognito** | 100 MAUs | Free |
| **Amplify** | 1 app, 5 GB bandwidth | $0.15 |
| **CloudWatch** | 5 GB logs | $0.25 |
| **Total** | | **~$4/month** |

### Cost Optimization Strategies

1. **DynamoDB:** Use on-demand billing (pay per request)
2. **S3:** Enable lifecycle policies (move old receipts to Glacier after 90 days)
3. **Lambda:** Right-size memory (use Lambda Power Tuning tool)
4. **API Gateway:** Use HTTP API instead of REST API (60% cheaper)
5. **Textract:** Batch process receipts (async) to reduce costs

---

## 🔒 Security Best Practices

### 1. Authentication
- ✅ JWT tokens with 15-minute expiration
- ✅ Refresh tokens with 7-day expiration
- ✅ Cognito password policy (12+ chars, complexity)
- ✅ HTTPS only (enforced by API Gateway)

### 2. Authorization
- ✅ API Gateway JWT Authorizer
- ✅ Lambda checks user owns resource before update/delete
- ✅ S3 bucket not publicly readable (use presigned URLs)

### 3. Input Validation
- ✅ API Gateway request validation
- ✅ Lambda validates all inputs
- ✅ DynamoDB transactions for critical writes

### 4. Data Protection
- ✅ S3 bucket encryption at rest (AES-256)
- ✅ DynamoDB encryption at rest
- ✅ CloudWatch log encryption
- ✅ No sensitive data in logs

### 5. Rate Limiting
- ✅ API Gateway throttling (1000 req/sec per user)
- ✅ Cognito rate limits on auth endpoints
- ✅ DynamoDB auto-scaling for traffic spikes

---

## 📈 Monitoring & Observability

### CloudWatch Metrics

**Lambda:**
- Invocations
- Duration
- Errors
- Throttles

**API Gateway:**
- Request count
- Latency (p50, p99)
- 4XX/5XX errors

**DynamoDB:**
- Read/write capacity
- Throttled requests
- Item count

### CloudWatch Alarms

1. **High Error Rate:** Lambda errors > 5% in 5 minutes
2. **High Latency:** API Gateway p99 > 3 seconds
3. **DynamoDB Throttles:** > 10 throttled requests
4. **S3 Upload Failures:** > 5% failed uploads

### Logging Strategy

- **Lambda:** Structured JSON logs
- **API Gateway:** Access logs to S3
- **CloudWatch Insights:** Query logs for debugging

Example log query:
```
fields @timestamp, @message
| filter statusCode >= 500
| sort @timestamp desc
| limit 20
```

---

## 🧪 Testing Strategy

### Frontend Tests

**Unit Tests (Jest + React Testing Library):**
- Component rendering
- User interactions
- Form validation

**E2E Tests (Playwright):**
- User registration flow
- Review submission flow
- Map interaction

### Backend Tests

**Unit Tests (Jest):**
- Lambda handler logic
- Input validation
- Business logic

**Integration Tests:**
- DynamoDB operations
- S3 uploads
- Textract integration

**Load Tests (Artillery):**
- API Gateway throughput
- Lambda concurrency limits
- DynamoDB scaling

---

## 🚀 Deployment Pipeline

```
Developer Push → GitHub → Amplify CI/CD
                              ↓
                      1. Install dependencies
                      2. Run tests
                      3. Build Next.js app
                      4. Deploy to Amplify
                      5. Notify team (Slack/Email)
```

### Deployment Strategy

- **Main branch:** Production deployment
- **Feature branches:** Preview deployments (unique URLs)
- **Pull requests:** Automatic preview + tests

---

## 📚 Future Enhancements

### Phase 2
- [ ] Video reviews (15-60 second TikTok-style)
- [ ] Social features (follow users, comment on reviews)
- [ ] Push notifications (new review at your favorite location)

### Phase 3
- [ ] Multi-chain support (Taco Bell, McDonald's, etc.)
- [ ] Real-time leaderboard (WebSockets via API Gateway)
- [ ] Recommendation engine (ML-based)

### Phase 4
- [ ] Mobile app (React Native)
- [ ] Advanced analytics (data visualization)
- [ ] B2B dashboard for franchise owners

---

**Questions? Open an issue on GitHub!** 🚀
