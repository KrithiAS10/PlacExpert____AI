# PlacExpert AI — Complete Project Documentation

> **Pin-to-pin technical reference** for the entire PlacExpert AI codebase.
> Last updated: September 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Directory Structure](#3-project-directory-structure)
4. [Database Schema (Prisma)](#4-database-schema-prisma)
5. [Frontend — Pages and Routes](#5-frontend--pages-and-routes)
6. [Frontend — Components](#6-frontend--components)
7. [API Routes (Next.js)](#7-api-routes-nextjs)
8. [ML Layer (Python)](#8-ml-layer-python)
9. [Backend (Express.js)](#9-backend-expressjs)
10. [Authentication System](#10-authentication-system)
11. [Data Flow — End to End](#11-data-flow--end-to-end)
12. [Environment and Configuration](#12-environment-and-configuration)
13. [Running the Project](#13-running-the-project)
14. [Known Notes and TODOs](#14-known-notes-and-todos)

---

## 1. Project Overview

**PlacExpert AI** is an AI-powered career guidance and placement preparation platform built for engineering students. It combines machine learning, adaptive roadmaps, and mock interview simulation to help students get placement-ready.

### Core Features

| Feature | Description |
|---|---|
| **Student Profiling** | Multi-step questionnaire capturing domain interest, skills, aptitude, communication confidence, timeline etc. |
| **ML-Based Readiness Prediction** | XGBoost model + Bayesian domain mapper predicts placement readiness level and ideal career domain |
| **Adaptive Roadmap Generation** | Personalized day-by-day prep roadmap generated based on profiling output, scaled to the student chosen timeline |
| **Roadmap Progress Tracking** | Calendar-based day advancement, task completion, streak tracking, solved problems log |
| **Mock Interview Module** | Domain-based Q&A pulled from a curated CSV dataset with AI answer evaluation via Sentence Transformers |
| **Voice Interview** | Voice-based interview practice interface |
| **Analytics Dashboard** | Readiness score history, activity timeline, progress charts via Recharts |
| **Admin Panel** | Admin-only view for platform management |
| **Resources Page** | Curated learning resources |
| **Domain Video Recommendations** | YouTube videos tailored to user domainInterest shown on the dashboard |

---

## 2. Tech Stack

### Frontend

| Technology | Version | Role |
|---|---|---|
| Next.js | 16.2.5 | Full-stack React framework (App Router) |
| React | 19.2.4 | UI library |
| TypeScript | ^5 | Type safety |
| TailwindCSS | ^4 | Utility-first CSS |
| Framer Motion | ^12.38.0 | Animations |
| Recharts | ^3.8.1 | Data visualization charts |
| Lucide React | ^1.14.0 | Icon library |
| clsx | ^2.1.1 | Conditional class utility |
| tailwind-merge | ^3.5.0 | Tailwind class merge utility |
| Webpack | bundler via --webpack flag | Dev bundler (Turbopack disabled) |

### Backend / API

| Technology | Version | Role |
|---|---|---|
| Next.js API Routes | 16.2.5 | Primary API layer (App Router) |
| Express.js | ^5.2.1 | Standalone backend server (port 5000) |
| Prisma ORM | ^6.19.3 | Database ORM |
| SQLite | via dev.db | Local database |
| axios | ^1.18.1 | HTTP client (backend to Flask ML) |
| cors | ^2.8.6 | CORS middleware for Express server |

### ML Layer

| Technology | Role |
|---|---|
| Python | All ML scripts |
| XGBoost | Readiness level classification model |
| Sentence Transformers (all-MiniLM-L6-v2) | Semantic similarity for interview answer evaluation |
| scikit-learn | Label encoders, preprocessing |
| pandas / numpy | Data handling |
| pickle | Model serialization (.pkl files) |

### Database
- SQLite (prisma/dev.db) — local file-based DB
- Prisma manages schema, migrations, seeding

---

## 3. Project Directory Structure

```
PlacExpert_AI/
+-- src/
|   +-- app/                          # Next.js App Router pages & API
|   |   +-- page.tsx                  # Dashboard (home) — server component
|   |   +-- layout.tsx                # Root layout wrapping LayoutWrapper
|   |   +-- globals.css
|   |   +-- login/page.tsx
|   |   +-- signup/page.tsx
|   |   +-- profiling/page.tsx        # 12-step profiling questionnaire (24KB)
|   |   +-- roadmap/
|   |   |   +-- page.tsx              # Roadmap viewer (100KB)
|   |   |   +-- components/
|   |   +-- mock-interview/page.tsx   # Mock interview interface (58KB)
|   |   +-- voice-interview/
|   |   +-- analytics/page.tsx
|   |   +-- resources/
|   |   +-- admin/page.tsx
|   |   +-- api/
|   |       +-- auth/
|   |       |   +-- login/route.ts
|   |       |   +-- register/route.ts
|   |       |   +-- logout/route.ts
|   |       +-- predict/route.ts      # POST /api/predict (392 lines)
|   |       +-- roadmap/
|   |       |   +-- route.ts          # GET /api/roadmap
|   |       |   +-- task/route.ts     # POST /api/roadmap/task
|   |       |   +-- solve/route.ts
|   |       |   +-- exit/route.ts
|   |       +-- mock-interview/
|   |       |   +-- questions/route.ts
|   |       |   +-- evaluate/route.ts
|   |       +-- user/route.ts
|   |
|   +-- components/
|   |   +-- LayoutWrapper.tsx         # Auth gate + app shell (24KB)
|   |   +-- Navbar.tsx                # Top nav (16KB)
|   |   +-- Sidebar.tsx               # Left sidebar (4KB)
|   |   +-- DashboardClient.tsx       # Dashboard UI (17KB)
|   |   +-- AnalyticsClient.tsx       # Analytics UI (22KB)
|   |   +-- AdminClient.tsx           # Admin UI (14KB)
|   |   +-- WalletConnect.tsx         # Web3 wallet connect
|   |
|   +-- lib/
|       +-- prisma.ts                 # Prisma client singleton
|       +-- db-queries.ts             # getUserData() helper
|       +-- learning-streak.ts        # Streak calculation
|       +-- mock-data.ts
|       +-- mock-interview-data.ts
|       +-- voice-interview-data.ts
|       +-- ai_interview_qa_dataset.csv  # Interview Q&A source
|
+-- ml/
|   +-- predict.py                    # XGBoost + Bayesian prediction
|   +-- predict_readiness.py
|   +-- interview_evaluator.py        # Sentence Transformer evaluator
|   +-- roadmap_engine.py             # Rule-based generator (31KB, legacy)
|   +-- advanced_model.py
|   +-- bayesian_recommendation.py
|   +-- weak_area_engine.py
|   +-- train_model.py
|   +-- train_readiness.py
|   +-- advanced_analytics.pkl        # Trained XGBoost model (484KB)
|   +-- readiness_model.pkl           # Readiness model (881KB)
|   +-- datasets/
|   +-- models/
|
+-- backend/
|   +-- server.js                     # Express app (port 5000)
|   +-- db.js                         # Prisma client for Express
|   +-- package.json
|   +-- constants/
|       +-- roadmaps.js               # Hardcoded roadmap data (147KB)
|
+-- prisma/
|   +-- schema.prisma                 # DB schema (10 models)
|   +-- dev.db                        # SQLite file (508KB)
|   +-- seed.ts
|   +-- seedAllRolesFromRoadmapsJS.mjs
|   +-- migrations/
|
+-- public/
+-- next.config.ts
+-- package.json
+-- tsconfig.json
+-- postcss.config.mjs
+-- eslint.config.mjs
+-- prisma.config.ts
+-- .env                              # DATABASE_URL=file:./dev.db
+-- AGENTS.md
+-- student_dataset.csv               # Raw training data (19KB)
```

---

## 4. Database Schema (Prisma)

Provider: SQLite (prisma/dev.db)

### User — Core entity (auth + profiling answers inline)

| Field | Type | Notes |
|---|---|---|
| id | String CUID | Primary key |
| name | String? | Display name |
| email | String? @unique | Login identifier |
| username | String? @unique | Alternative login |
| phone | String? @unique | Alternative login |
| password | String? | Plain text — NOT hashed |
| image | String? | Profile picture URL |
| role | String | "USER" or "ADMIN" |
| currentDay | Int | Which roadmap day the user is on |
| readinessScore | Float | 0.0 to 10.0 dynamic score |
| streak | Int | Consecutive learning days |
| academicYear | String? | Profiling answer |
| domainInterest | String? | e.g. "Web Development" — KEY: used to detect profiling completion |
| targetCompany | String? | e.g. "FAANG", "Product Startup" |
| dsaCount | String? | DSA problems solved count |
| projects | String? | Project exposure level |
| coreCsStrength | String? | Best CS subject: DSA/DBMS/OS/Networking |
| codingPlatform | String? | LeetCode/HackerRank etc usage |
| aptitude | String? | Poor / Average / Good |
| communication | String? | Very Nervous / Nervous / Need Practice / Confident |
| mockInterviewExp | String? | Interview experience level |
| codingConfidence | String? | Self-rated coding confidence |
| dailyStudyTime | String? | e.g. "2-3 hours" |
| preferredLang | String? | Python/Java/JavaScript etc |
| placementTimeline | String? | "1 Month" / "45 Days" / "3 Months" etc |
| readinessLevel | String? | "Just Starting" / "Learning Basics" / "Actively Practicing" / "Ready for Interviews" |
| leetcodeUsername | String? | LeetCode integration |
| Relations | | roadmaps[], surveyResult?, analytics[], activities[], solvedProblems[] |

### SurveyResult — AI prediction result (one per user)

| Field | Type | Notes |
| --- | --- | --- |
| id | String UUID | PK |
| userId | String @unique | One per user |
| predictedRole | String | e.g. "Full Stack Developer" |
| allScores | String | JSON string of domain probability scores |
| createdAt | DateTime | |

### Roadmap — User active preparation plan

| Field | Type | Notes |
|---|---|---|
| id | String UUID | PK |
| title | String | e.g. "Full Stack Developer Prep Track" |
| description | String? | e.g. "Personalized 45-day plan" |
| userId | String | FK -> User |
| role | String? | Predicted role that generated this roadmap |
| status | String | "IN_PROGRESS" or "COMPLETED" |
| Relations | | phases[], tasks[] |

### Phase — Named stage of the roadmap (always 3 per roadmap)

| Field | Type | Notes |
|---|---|---|
| id | String UUID | PK |
| title | String | e.g. "Phase 1: Fundamentals & Core Concepts" |
| description | String? | Focus area e.g. "fundamentals" |
| order | Int | 1, 2, or 3 |
| roadmapId | String | FK -> Roadmap |
| Relations | | tasks[] |

### Task — Individual learning task in a roadmap

| Field | Type | Notes |
|---|---|---|
| id | String UUID | PK |
| title | String | e.g. "Arrays — Two Pointers, Sliding Window" |
| description | String? | Resource URL stored here |
| day | Int | Deadline day (course must be done by this day) |
| dayNumber | Int? | Blueprint day number from template |
| category | String? | "DSA", "DBMS", "OS", "Web", etc |
| status | String | "PENDING" or "COMPLETED" |
| type | String | "TOPIC" / "PROBLEM" / "MOCK" |
| resourceName | String | Display name for resource link |
| resourceLink | String | URL to free learning resource |
| roadmapId | String? | FK -> Roadmap |
| phaseId | String? | FK -> Phase |
| Relations | | solvedProblems[] |

### RoadmapTemplate — Blueprint tasks seeded per role

| Field | Type | Notes |
|---|---|---|
| id | String UUID | PK |
| roleName | String | e.g. "Full Stack Developer", "ML Engineer" |
| dayNumber | Int | Day in a 45-day plan |
| title | String | Task title |
| category | String | Task category |
| resourceName | String | Resource display name |
| resourceLink | String | Resource URL |
| Index | roleName | For fast role-based lookups |

### Resource — Curated learning resources (Resources page)

| Field | Type | Notes |
|---|---|---|
| id | String UUID | PK |
| title | String | Resource title |
| type | String | "VIDEO", "ARTICLE", "COURSE" |
| category | String | Domain/topic category |
| url | String | Resource URL |
| duration | String? | e.g. "9h" |
| thumbnail | String? | Thumbnail URL |
| isFeatured | Boolean | Whether to highlight |

### Analytics — Time-series readiness score snapshots

| Field | Type | Notes |
|---|---|---|
| id | String UUID | PK |
| userId | String | FK -> User |
| date | DateTime | Snapshot timestamp |
| metric | String | e.g. "Readiness" |
| value | Float | Score at that time |

### Activity — User action log

| Field | Type | Notes |
|---|---|---|
| id | String UUID | PK |
| userId | String | FK -> User |
| action | String | e.g. "Generated roadmap: Full Stack Developer Prep Track" |
| status | String? | "SUCCESS" / "FAILED" |
| timestamp | DateTime | Ordered DESC on fetch |

### SolvedProblem — Tracks tasks solved (drives streak calculation)

| Field | Type | Notes |
|---|---|---|
| id | String UUID | PK |
| userId | String | FK -> User |
| taskId | String | FK -> Task |
| solvedAt | DateTime | When solved |
| notes | String? | Optional notes |
| proofUrl | String? | Optional proof URL |
| Indexes | userId, taskId | |

---

## 5. Frontend — Pages and Routes

| Route | File | Auth | Description |
|---|---|---|---|
| / | src/app/page.tsx | Yes (LayoutWrapper) | Dashboard — profiling CTA or full dashboard |
| /login | src/app/login/page.tsx | No | Login page |
| /signup | src/app/signup/page.tsx | No | Signup page |
| /profiling | src/app/profiling/page.tsx | Yes | 12-step profiling questionnaire |
| /roadmap | src/app/roadmap/page.tsx | Yes | Adaptive roadmap viewer & task tracker |
| /mock-interview | src/app/mock-interview/page.tsx | Yes | Mock interview simulator |
| /voice-interview | src/app/voice-interview/ | Yes | Voice-based interview |
| /analytics | src/app/analytics/page.tsx | Yes | Progress analytics & charts |
| /resources | src/app/resources/ | Yes | Learning resources directory |
| /admin | src/app/admin/page.tsx | Admin only | Admin panel |

### Dashboard (/ — page.tsx)
- Server Component — reads user_email cookie server-side
- Calls getUserData(email) from lib/db-queries.ts
- Picks YouTube video recommendations from DOMAIN_VIDEOS map keyed by user.domainInterest
- Domains: "Web Development", "Full Stack", "Data Science", "Mobile App", "AI/ML", "Cloud", "Not Decided"
- Renders DashboardClient with user + recommendations props
- If user has not profiled (domainInterest is null), shows empty recommendations

---

## 6. Frontend — Components

### LayoutWrapper.tsx (24KB) — The App Shell
- Client Component — wraps every page via root layout.tsx
- Manages: session checking, sidebar state, inline auth modal, streak notifications
- On mount: calls GET /api/roadmap to verify session via cookie
- No session -> shows full-screen auth modal (register/login toggle)
- Auth pages (/login, /signup, /admin/*) bypass the session check
- Handles streak/day-advance toast notifications from API streakInfo response field
- Sidebar auto-collapses on screens under 1024px

### Navbar.tsx (16KB)
- Top navigation bar with user info, notifications, and nav links

### Sidebar.tsx (4KB)
- Left navigation sidebar
- Links: Dashboard, Roadmap, Mock Interview, Voice Interview, Analytics, Resources

### DashboardClient.tsx (17KB)
- Receives user + recommendations props from server component
- Shows: readiness score, current day, streak, weak areas, domain video recommendations
- Handles profiling CTA when domainInterest is null

### AnalyticsClient.tsx (22KB)
- Full analytics UI
- Recharts charts: readiness score history, activity heatmap, progress bars

### AdminClient.tsx (14KB)
- Admin-only management interface

### WalletConnect.tsx (4KB)
- Web3 wallet connect (MetaMask etc.)

---

## 7. API Routes (Next.js)

### POST /api/auth/register
- Accepts: { name, username, email, phone, password }
- Validates: username, email, password required
- Checks: no duplicate email/username/phone
- Creates user with role: "USER", readinessScore: 0.0, streak: 0
- Sets user_email cookie (30 days, httpOnly: false)
- Returns: { success: true, user }

### POST /api/auth/login
- Accepts: { identifier, password } (identifier = email OR username OR phone)
- Finds user via OR query on email/username/phone
- Password compared as plain text — no hashing
- Sets user_email cookie
- Returns: { success: true, user }

### POST /api/auth/logout
- Clears the user_email cookie

### POST /api/predict — (392 lines, most complex API)
Full ML prediction + roadmap generation pipeline:

1. Receives profiling answers: { domain, target, strength, platform, exposure, aptitude, comm, dailyStudyTime, preferredLang, placementTimeline }
2. Spawns ml/predict.py as child process with answers as JSON arg
3. Gets back: { readiness, readiness_confidence, domain_mapping }
4. Maps domain + preferredLang -> predictedRole
5. Fetches RoadmapTemplate tasks for predictedRole from DB
6. Falls back to "Software Engineer" template if no match found
7. Scales task deadlines proportionally to user placementTimeline (30/45/60/90/180 days)
8. Generates remediation tasks for weak areas (DSA / DBMS / OS / CN)
9. Splits all tasks into 3 phases (33% / 33% / 33% of total days)
10. Classifies each task as TOPIC, PROBLEM, or MOCK
11. Deletes existing roadmap -> creates new roadmap with phases + tasks
12. Updates user profile fields from form answers
13. Sets readinessScore: 0.0 (grows as tasks are completed)
14. Logs activity + analytics snapshot
15. Returns: { readiness, predictedRole, predictedDomain, roadmap }

Role mapping logic:
- "Full Stack" + Python -> "Python Fullstack Developer"
- "Full Stack" + Java -> "Java Fullstack Developer"
- "Full Stack" + other -> "Full Stack Developer"
- "Web Development" + JS/TS -> "Web Developer"
- "Web Development" + Python/Java/C++ -> "Backend Developer"
- "Data Science" + Python -> "AI & Data Scientist"
- "Data Science" + R/SQL -> "Data Analyst"
- "Cloud/DevOps" + Python/bash/go -> "Devops"
- "Cloud/DevOps" + other -> "Cloud Engineer"
- "Mobile/Android/iOS/App" -> "Android Developer"
- "Blockchain" -> "Blockchain"
- "Game" -> "Game Developer"
- "QA/Testing" -> "QA Engineer"
- Default -> "Software Engineer"

### GET /api/roadmap
- Reads user_email cookie
- Fetches user with full roadmap -> phases -> tasks -> solvedProblems count
- Calendar-based day advancement: calendarDays = floor((today - roadmapCreatedDate) / 86400000) + 1, advances currentDay if calendar > DB (never goes backward)
- Calculates learning streak from SolvedProblem.solvedAt dates via getLearningStreak()
- Weak areas detected dynamically from profiling answers (top 3 by priority):
  - aptitude "Poor" -> HIGH priority
  - communication "Very Nervous"/"Nervous" -> HIGH priority
  - projects "Zero" or codingPlatform "Never tried" -> HIGH priority
  - coreCsStrength not DSA -> "DSA & Problem Solving" HIGH
  - coreCsStrength not DBMS -> "SQL & Databases" MED
  - coreCsStrength not OS -> "OS & Memory" MED
  - coreCsStrength not Networking -> "Computer Networks" LOW
- Returns: { user, roadmap, weakAreas, dayAdvanced, streakInfo }

### POST /api/roadmap/task
- Accepts: { taskId, status }
- Updates task status in DB
- Recalculates readiness score: baseline + (completedTasks/totalTasks) * (10 - baseline)
  - "Just Starting" baseline = 2.0
  - "Learning Basics" baseline = 4.0
  - "Actively Practicing" baseline = 6.0
  - "Ready for Interviews" baseline = 8.0
- Advances currentDay to start of next pending task
- Saves new analytics snapshot
- Returns: { success: true, task }

### GET /api/mock-interview/questions
- Reads src/lib/ai_interview_qa_dataset.csv from disk
- Custom CSV parser (handles quoted fields with embedded commas)
- Groups questions by category column into domain objects
- Builds keyConcepts[] from answer text (excludes stop words, min 4 chars, max 10 concepts)
- Returns: { source, domains: MockInterviewDomain[] }
- Cache-Control: no-store — never cached
- Accepts ?refresh=<timestamp> param

### POST /api/mock-interview/evaluate
- Accepts: { domain, question, answer }
- Spawns ml/interview_evaluator.py with the payload as JSON arg
- Returns: { interview_score, similarity_score, concept_coverage, strengths, weaknesses, missing_concepts, mentioned_concepts, suggestions }
- On ML unavailable: graceful fallback with error: "ml_unavailable" but HTTP 200 (UI does not break)

### POST /api/quiz/generate
- Accepts: { taskTitle, category }
- Generates 5 dynamic, randomized multiple-choice questions for the specific task topic
- First tries LLM generation (OpenAI, Groq, or Gemini if API keys configured)
- Falls back to extensive procedural question pool (120+ questions across DSA, OS, DBMS, Networks, System Design, Web)
- Randomizes and shuffles options ($A, B, C, D$) to prevent answer key memorization
- Returns: { success: true, source: "ai_generated" | "generative_engine", questions: QuizQuestion[] }

### GET /api/user (legacy)
- Used by the Express backend pipeline
- Accepts: ?email=&skills=
- Creates user if not found, detects role from skills keyword string
- Returns user roadmap with tasks

---

## 8. ML Layer (Python)

### ml/predict.py — Main Prediction Script

Called by POST /api/predict via child_process.spawn
Input: JSON string as CLI argument | Output: JSON printed to stdout

Pipeline:
1. Loads ml/advanced_analytics.pkl (XGBoost model, label encoders, Bayesian mapping, features list)
2. Maps frontend field names -> model feature names (domain -> Domain_Interest, comm -> Comm_Confidence etc)
3. Encodes each feature using stored LabelEncoder (fallback: 0 for unknown values)
4. XGBoost predicts readiness class index -> inverse_transform -> human-readable label
5. Returns confidence probabilities for all readiness classes
6. Bayesian domain mapping: computes log-posterior P(Domain | Answers) for each domain
7. If user explicitly chose a domain (not "Not Decided"), forces that domain to 0.85 probability

Output format:
```json
{
  "readiness": "Actively Practicing",
  "readiness_confidence": {
    "Just Starting": 0.05,
    "Actively Practicing": 0.75,
    "Ready for Interviews": 0.20
  },
  "domain_mapping": {
    "Full Stack": 0.85,
    "AI/ML": 0.10,
    "Cloud": 0.05
  }
}
```

### ml/interview_evaluator.py — Answer Evaluator

Called by POST /api/mock-interview/evaluate via child_process.spawn
Model: sentence-transformers/all-MiniLM-L6-v2 (lazy-loaded on first use)

Pipeline:
1. Looks up question in hardcoded INTERVIEW_BANK (domains: DSA, DBMS, OS, CN, Python, JavaScript, System Design)
2. Encodes user answer + ideal answer using Sentence Transformer
3. Computes cosine similarity between embeddings
4. Checks which key_concepts appear in user answer text
5. interview_score = similarity_score * 10
6. Classifies: strengths (concepts mentioned well), weaknesses (poorly explained), missing (not mentioned)
7. Generates study resource suggestions for missing areas

Output format:
```json
{
  "interview_score": 7.2,
  "similarity_score": 0.72,
  "concept_coverage": 0.65,
  "strengths": ["contiguous memory", "O(1) access"],
  "weaknesses": ["spatial locality"],
  "missing_concepts": ["cache performance"],
  "mentioned_concepts": ["..."],
  "suggestions": ["..."]
}
```

### ml/roadmap_engine.py (31KB — not in main flow)
- Rule-based roadmap generator (replaced by DB template approach)
- Maps readiness level + domain + language + timeline -> day-by-day tasks
- All URLs point to free platforms (LeetCode, GFG, freeCodeCamp, CS50, MIT OCW, Khan Academy, YouTube)
- Task subtypes: PROBLEM, COURSE, PROJECT, MOCK

### ml/advanced_analytics.pkl (484KB)
Serialized dict containing:
- xgboost_model: trained XGBoost classifier
- label_encoders: dict of LabelEncoder per feature column
- target_encoder: LabelEncoder for readiness level labels
- features: ordered list of feature column names
- bayesian_mapping: domain priors + conditionals for Bayesian inference

### ml/readiness_model.pkl (881KB)
Standalone readiness prediction model used by predict_readiness.py

---

## 9. Backend (Express.js)

File: backend/server.js | Port: 5000 | Start: node server.js from backend/

Secondary/legacy backend from an earlier pipeline. Main app now uses Next.js API routes directly. Shares the same SQLite database via Prisma.

### Endpoints

GET / — Health check, returns "PlaceXpert AI Operational Backend is Running"

POST /api/profile/submit
- Accepts: { email, skillsString }
- Calls Flask ML at http://localhost:8000/predict for role prediction
- Falls back to rule-based keyword detection if Flask unreachable
- Fetches RoadmapTemplate tasks for predicted role with fallback resolution
- Creates/resets user roadmap in DB via Prisma transaction
- Returns: { success, detected_role, resolved_template_role, message }

GET /api/roadmap/:email
- Fetches user roadmap by email param
- If role is stale ("Backend Developer"), re-runs ML prediction
- Creates fresh roadmap if none found
- Returns roadmap with tasks ordered by dayNumber

Flask ML Server (Port 8000):
Express backend expects a Flask server at http://localhost:8000/predict.
This is a separate Python Flask app NOT in this repo.
System gracefully falls back to rule-based detection if Flask unreachable.

---

## 10. Authentication System

### Session Management
- Cookie-based (no JWT, no NextAuth)
- Cookie name: user_email
- Duration: 30 days
- httpOnly: false — readable client-side (needed by LayoutWrapper)
- Set on login/register, cleared on logout

### Auth Flow
1. User registers/logs in -> user_email cookie is set
2. LayoutWrapper calls GET /api/roadmap on every page mount
3. API reads user_email cookie -> finds user in DB
4. If no cookie -> LayoutWrapper shows full-screen auth modal
5. Auth pages (/login, /signup, /admin/*) bypass this check entirely

### Auth Gates
- Most pages: guarded by LayoutWrapper (unauthorized users see auth modal instead of page)
- Admin: route-level check for role === "ADMIN"

### Security Notes (Dev Only — NOT Production-Safe)
- Passwords stored as plain text (no bcrypt or hashing)
- Cookie not httpOnly (readable by JavaScript)
- No CSRF protection on any endpoint
- No rate limiting on auth or any other endpoint

---

## 11. Data Flow — End to End

### New User Flow
```
User lands on /
  -> LayoutWrapper checks user_email cookie
  -> No cookie -> shows auth modal
  -> User registers -> POST /api/auth/register
  -> Cookie set, user created in DB
  -> Redirect to / -> LayoutWrapper fetches user
  -> DashboardClient sees user.domainInterest = null
  -> Shows "Complete Your Profile" CTA button
  -> User clicks -> navigates to /profiling
```

### Profiling & Roadmap Generation
```
User completes 12-step profiling form on /profiling
  -> POST /api/predict with all form answers
  -> API spawns ml/predict.py as child process
  -> XGBoost predicts readiness level
  -> Bayesian mapping computes domain probabilities
  -> mapDomainAndLanguageToRole() -> predictedRole
  -> Fetch RoadmapTemplate tasks for predictedRole from DB
  -> Scale day deadlines to user placementTimeline
  -> Generate weak area remediation tasks (DSA/DBMS/OS/CN)
  -> Split into 3 phases, classify task types (TOPIC/PROBLEM/MOCK)
  -> Delete old roadmap -> Create new roadmap + phases + tasks in DB
  -> Update user profile fields in DB (all profiling answers saved)
  -> Log activity + analytics readiness snapshot
  -> Return roadmap data to client
  -> Client redirects to /roadmap
```

### Daily Usage
```
User visits /roadmap
  -> GET /api/roadmap -> calendar-based day advancement check
  -> Page renders tasks grouped by phase
  -> User marks task COMPLETED
    -> POST /api/roadmap/task { taskId, status: "COMPLETED" }
    -> Recalculates readiness score
    -> Advances currentDay to next pending task start
    -> Saves analytics snapshot
  -> User solves a problem
    -> POST /api/roadmap/solve -> creates SolvedProblem record
    -> Streak recalculated from SolvedProblem.solvedAt dates
```

### Mock Interview Flow
```
User visits /mock-interview
  -> GET /api/mock-interview/questions
    -> Reads ai_interview_qa_dataset.csv from disk
    -> Parses CSV, groups by category domain
    -> Returns all domains with questions and keyConcepts
  -> User selects domain + picks a question
  -> User types their answer
  -> POST /api/mock-interview/evaluate { domain, question, answer }
    -> Spawns ml/interview_evaluator.py
    -> Sentence Transformer computes cosine similarity
    -> Returns score, strengths, weaknesses, suggestions
  -> UI displays detailed AI feedback panel
```

---

## 12. Environment and Configuration

### .env
```
DATABASE_URL="file:./dev.db"
```

### package.json scripts
```json
{
  "dev": "next dev --webpack",
  "build": "next build",
  "start": "next start",
  "lint": "eslint"
}
```

Note: --webpack flag explicitly opts out of Turbopack (the default in Next.js 16) due to cache corruption issues.

### Path Alias
- @/ maps to src/ (configured in tsconfig.json)

### Prisma Config (prisma.config.ts)
- Loads DATABASE_URL from .env via dotenv
- Schema at prisma/schema.prisma
- Seed script: tsx prisma/seed.ts

---

## 13. Running the Project

### Prerequisites
- Node.js v18+
- Python 3.x with: xgboost, scikit-learn, pandas, numpy, sentence-transformers
- npm

### Start Next.js Dev Server
```powershell
cd e:\VSCODE\PlacExpert_AI
npm run dev
# Runs on http://localhost:3000
```

### Start Express Backend (optional, legacy)
```powershell
cd e:\VSCODE\PlacExpert_AI\backend
node server.js
# Runs on http://localhost:5000
```

### Database Commands
```powershell
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (RoadmapTemplate data)
npx prisma db seed

# OR seed all roles from roadmaps.js:
node prisma/seedAllRolesFromRoadmapsJS.mjs

# Open DB GUI
npx prisma studio
# Opens at http://localhost:5555
```

---

## 14. Known Notes and TODOs

| Area | Note |
|---|---|
| Passwords | Stored as plain text — add bcrypt before any production deployment |
| Flask ML server | Express backend expects it at port 8000, but it is NOT included in this repo |
| roadmap_engine.py | Not used in the main flow — DB template approach replaced it |
| WalletConnect.tsx | Web3 feature present but integration status is unclear |
| Turbopack | Disabled — using --webpack flag due to cache corruption issues with Turbopack |
| Admin page | Very thin (498 bytes) — delegates entirely to AdminClient.tsx |
| Mock interview CSV | ai_interview_qa_dataset.csv is the source of truth for interview questions |
| INTERVIEW_BANK | Hardcoded reference answers in interview_evaluator.py — separate from the CSV |
| generate_dataset.py | Dataset generation scripts live inside src/app/ — development artifacts |
| student_dataset.csv | Raw training data in root — used to train the ML models |
| backend/constants/roadmaps.js | 147KB hardcoded roadmap data — seeded into RoadmapTemplate via seedAllRolesFromRoadmapsJS.mjs |
| Cookie security | httpOnly: false means JS can read the user_email — fine for dev, not for prod |
| No rate limiting | API routes have no rate limiting on any endpoint |
| db-queries.ts | Only exports getUserData() — very thin utility file |
| voice-interview | Page exists but not deeply explored in this audit |
