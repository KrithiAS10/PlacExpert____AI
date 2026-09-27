# 🎯 PlaceXpert AI

**An Intelligent Placement Preparation Platform** powered by Machine Learning, Bayesian Inference, and Semantic NLP — built to guide engineering students from profiling to placement-ready.

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [ML Pipeline & Models Tried](#-ml-pipeline--models-tried)
- [Model Comparison & Accuracy](#model-comparison--accuracy-results)
- [Bayesian Recommendation Engine](#bayesian-recommendation-engine)
- [Interview Evaluator (NLP)](#interview-evaluator-nlp)
- [Weak Area Detection Engine](#weak-area-detection-engine)
- [Adaptive Roadmap Engine](#adaptive-roadmap-engine)
- [Tech Stack](#-tech-stack)
- [Dataset](#-dataset)
- [Database Schema](#-database-schema)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [ML Scripts Reference](#-ml-scripts-reference)

---

## 🧠 About the Project

**PlaceXpert AI** is a full-stack, AI-driven placement preparation system designed for engineering students. Instead of a one-size-fits-all approach, it profiles each student through a multi-step questionnaire and uses a trained ML pipeline to:

1. **Predict Readiness Level** (Beginner / Intermediate / Advanced)
2. **Recommend Career Domains** using Bayesian Inference
3. **Generate a Personalized 45-Day Roadmap** based on the student's profile
4. **Evaluate Mock Interview Answers** using Sentence Transformers + Cosine Similarity
5. **Detect Weak Areas** from interview and quiz performance
6. **Track Progress** with streaks, daily tasks, and analytics

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔍 **Student Profiling** | Multi-step questionnaire capturing academic year, domain interest, DSA count, projects, aptitude, and more |
| 🤖 **Readiness Prediction** | XGBoost classifier predicts Beginner / Intermediate / Advanced with confidence scores |
| 🎯 **Domain Recommendation** | Bayesian Naïve Bayes with Laplace smoothing ranks career domains by probability |
| 🗺️ **Adaptive Roadmap** | Rule-based engine generating day-wise study plans with free resources (LeetCode, GFG, freeCodeCamp) |
| 🎤 **Mock Interview Evaluator** | Sentence Transformers (all-MiniLM-L6-v2) for semantic answer evaluation |
| 📉 **Weak Area Detection** | Rule-based engine detecting critical/high/medium/low severity gaps from interview scores |
| 📊 **Analytics Dashboard** | Progress tracking with streaks, solved problems, and daily activity |

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                       PlaceXpert AI System                       │
├─────────────────┬────────────────────┬───────────────────────────┤
│   Frontend      │     Backend        │      ML Engine (Python)   │
│   (Next.js 16)  │  (Express.js +     │                           │
│                 │   Node.js)         │  Step 1: train_readiness  │
│  ┌───────────┐  │  ┌──────────────┐  │  Step 2: predict_readiness│
│  │ Dashboard │  │  │  REST API    │  │  Step 3: bayesian_rec     │
│  │ Profiling │──│─▶│  Port 5000   │──│  Step 4: roadmap_engine   │
│  │ Roadmap   │  │  │              │  │  Step 5: interview_eval   │
│  │ Interview │  │  └──────┬───────┘  │  Step 6: weak_area_engine │
│  │ Analytics │  │         │          │                           │
│  └───────────┘  │  ┌──────▼───────┐  └───────────────────────────┘
│                 │  │   Prisma ORM │
│                 │  │  SQLite DB   │
│                 │  └──────────────┘
└─────────────────┴────────────────────────────────────────────────┘
```

---

## 🤖 ML Pipeline & Models Tried

The ML pipeline runs in **6 sequential steps**, each addressing a distinct placement preparation problem.

### Model Comparison & Accuracy Results

**Step 1 → 2A: Readiness Classification**

The pipeline trains and compares three classifiers to predict a student's placement readiness level: `Beginner`, `Intermediate`, or `Advanced`.

- **Dataset**: `student_dataset.csv` — 11 features per student
- **Train/Test Split**: 80% / 20% (stratified)
- **Evaluation Metrics**: Accuracy, Precision, Recall, F1 Score (weighted)

| Model | Accuracy | Precision | Recall | F1 Score | Selected |
|---|---|---|---|---|---|
| **Decision Tree** | 95.00% | 95.63% | 95.00% | 94.97% | ❌ |
| **Random Forest** | **100.00%** | **100.00%** | **100.00%** | **100.00%** | ❌ |
| **XGBoost** ⭐ | **100.00%** | **100.00%** | **100.00%** | **100.00%** | ✅ **Final** |

> **Why XGBoost was selected as the final model:**
> XGBoost matched Random Forest at 100% F1 but is more production-friendly — it supports faster inference, serializes more compactly, provides native feature importance, and handles unknown categories gracefully. It was further tuned with `GridSearchCV` (3-fold CV).

#### XGBoost Hyperparameter Search Space (GridSearchCV)

```python
param_grid = {
    "n_estimators": [50, 100, 200],
    "max_depth": [3, 5, 7],
    "learning_rate": [0.05, 0.1, 0.2],
    "subsample": [0.8, 1.0],
}
# Scoring: f1_weighted | CV: 3-fold
```

#### Feature Engineering

| Feature | Encoding | Notes |
|---|---|---|
| `Academic_Year` | Ordinal | 2nd Year → Graduate |
| `DSA_Count` | Ordinal | 0-20 → 300+ |
| `Projects` | Ordinal | None → 4+ |
| `Aptitude` | Ordinal | Poor → Excellent |
| `Communication` | Ordinal | Very Nervous → Very Confident |
| `Mock_Interview_Experience` | Ordinal | Never → Frequently |
| `Coding_Confidence` | Ordinal | Low → Excellent |
| `Domain_Interest` | Label Encoding | Nominal |
| `Target_Company` | Label Encoding | Nominal |
| `Core_CS_Strength` | Label Encoding | Nominal |
| `Coding_Platform` | Label Encoding | Nominal |

#### Top Feature Importances (XGBoost)

Highest contributing features for predicting readiness:
- `DSA_Count` — number of DSA problems solved
- `Coding_Confidence` — self-reported confidence level
- `Mock_Interview_Experience` — past mock interview frequency
- `Academic_Year` — academic stage
- `Projects` — number of projects built

#### Saved Artifacts

| File | Description |
|---|---|
| `ml/models/readiness_model.pkl` | Final XGBoost model + encoders + metadata |
| `ml/models/model_comparison_report.json` | Accuracy/F1 comparison across all 3 models |
| `ml/models/bayesian_probabilities.json` | Trained Bayesian domain probabilities |
| `ml/advanced_analytics.pkl` | XGBoost + Bayesian combined artifact (v2) |
| `ml/readiness_model.pkl` | Legacy RandomForest model (v1) |

---

### Bayesian Recommendation Engine

**Step 3 — `bayesian_recommendation.py`**

Uses **Naïve Bayes with Laplace smoothing** to rank career domains by posterior probability given the student's profile answers.

**Algorithm:**
```
P(Domain | Answers) ∝ P(Domain) × ∏ P(Answer_i | Domain)
```

- **Prior**: `P(Domain)` computed from domain frequency in dataset
- **Likelihood**: `P(Feature_Value | Domain)` with Laplace smoothing to handle unseen values:
  ```
  P(value | domain) = (count + 1) / (|domain| + |unique_values|)
  ```
- **Inference**: Log-space computation to prevent numerical underflow
- **Output**: Ranked list of domains with normalized probabilities

**Supported Domains:**
`AI/ML`, `Data Science`, `Web Development`, `Mobile App Development`, `Cloud Computing`, `DevOps`, `Cybersecurity`, `Blockchain`, `System Design`, `Embedded Systems`, `CN`, `OS`

**Output Format:**
```json
{
  "recommendations": [
    {"domain": "AI/ML", "probability": 0.35},
    {"domain": "Data Science", "probability": 0.28}
  ],
  "top_domain": "AI/ML"
}
```

---

### Interview Evaluator (NLP)

**Step 5 — `interview_evaluator.py`**

Uses **Sentence Transformers (`all-MiniLM-L6-v2`)** + **Cosine Similarity** to semantically evaluate mock interview answers.

**Model:** `sentence-transformers/all-MiniLM-L6-v2`
- Embedding dimension: 384
- Optimized for semantic textual similarity tasks

**Evaluation Pipeline:**
1. Encode student answer + reference ideal answer → sentence embeddings
2. Compute cosine similarity score (0.0 – 1.0)
3. Map similarity to interview score (0–10 scale): `score = min(10, similarity × 12.5)`
4. Check key concept coverage via keyword matching
5. Return strengths, weaknesses, missing concepts, and study suggestions

**Domains Covered:**

| Domain | Questions Available |
|---|---|
| DSA | 3 (Arrays, Dynamic Programming, BFS/DFS) |
| DBMS | 2 (Normalization, SQL JOINs) |
| OS | 1 (Deadlock & Coffman Conditions) |
| CN | 1 (OSI Model) |
| Web Development | 1 (REST vs GraphQL) |

**Output Format:**
```json
{
  "similarity_score": 0.82,
  "interview_score": 8.5,
  "concept_coverage": 77.8,
  "strengths": ["Strong semantic understanding", "Detailed explanation"],
  "weaknesses": ["Missing key concepts: spatial locality, cache performance"],
  "missing_concepts": ["spatial locality"],
  "mentioned_concepts": ["contiguous memory", "random access"],
  "suggestions": ["Practice on LeetCode/HackerRank. Watch Abdul Bari's algorithm videos."]
}
```

---

### Weak Area Detection Engine

**Step 6 — `weak_area_engine.py`**

Rule-based engine that classifies topic performance into severity levels based on average interview scores.

**Severity Thresholds:**

| Severity | Score Range | Action |
|---|---|---|
| 🔴 **CRITICAL** | < 3.0 | Immediate focused study |
| 🟠 **HIGH** | 3.0 – 5.0 | High-priority weak area |
| 🟡 **MEDIUM** | 5.0 – 6.5 | Needs improvement |
| 🔵 **LOW** | 6.5 – 8.0 | Minor gap |
| ✅ **NONE** | ≥ 8.0 | Strong area |

**Performance Levels:**

| Level | Score Range |
|---|---|
| Excellent | 8.0 – 10.0 |
| Good | 6.5 – 8.0 |
| Average | 5.0 – 6.5 |
| Below Average | 3.0 – 5.0 |
| Poor | 0.0 – 3.0 |

---

### Adaptive Roadmap Engine

**Step 4 — `roadmap_engine.py`**

Rule-based personalized roadmap generator producing day-wise study plans.

**Inputs:**
- Readiness level (`Beginner` / `Intermediate` / `Advanced`)
- Detected weak areas from interview scores
- Daily study time preference
- Preferred programming language
- Placement timeline

**Output:**
- Structured 45-day preparation plan
- Tasks tagged with: `PROBLEM`, `COURSE`, `PROJECT`, or `MOCK`
- All resources from **100% FREE platforms**: LeetCode, GeeksForGeeks, freeCodeCamp, The Odin Project, CS50, Khan Academy, MIT OpenCourseWare, MDN Web Docs

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.2.5 | React framework with App Router |
| **React** | 19.2.4 | UI library |
| **TypeScript** | ^5 | Type safety |
| **TailwindCSS** | ^4 | Utility-first CSS styling |
| **Framer Motion** | ^12.38.0 | Animations & transitions |
| **Recharts** | ^3.8.1 | Data visualization & charts |
| **Lucide React** | ^1.14.0 | Icon library |
| **clsx + tailwind-merge** | latest | Conditional class utilities |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | LTS | Runtime |
| **Express.js** | latest | REST API server (Port 5000) |
| **Prisma ORM** | ^6.19.3 | Database access layer |
| **SQLite** | via Prisma | Local file-based database |
| **Axios** | latest | HTTP client for ML service calls |
| **CORS** | latest | Cross-origin request handling |

### Machine Learning (Python)
| Library | Purpose |
|---|---|
| **scikit-learn** | Decision Tree, Random Forest, GridSearchCV, OrdinalEncoder, LabelEncoder, Cosine Similarity |
| **XGBoost** | Final readiness classification model |
| **sentence-transformers** | `all-MiniLM-L6-v2` for mock interview semantic evaluation |
| **pandas** | Dataset loading and manipulation |
| **numpy** | Numerical computation and log-probability calculations |
| **joblib** | Model serialization and loading |

### Database
| Technology | Details |
|---|---|
| **SQLite** | Local file-based database (`prisma/dev.db`) |
| **Prisma** | Schema management, migrations, and seeding |

### Dev Tools
| Tool | Purpose |
|---|---|
| **ESLint** | Code linting (Next.js config) |
| **tsx** | TypeScript execution for Prisma seed scripts |
| **PostCSS** | CSS processing for TailwindCSS |

---

## 📊 Dataset

**Files:** `student_dataset.csv` / `ml/datasets/student_dataset.csv`

A synthetic student dataset used to train the readiness prediction models.

| Column | Type | Sample Values |
|---|---|---|
| `Academic_Year` | Ordinal | 2nd Year, 3rd Year, 4th Year, Graduate |
| `Domain_Interest` | Nominal | AI/ML, Web Development, Data Science, CN, OS, etc. |
| `Target_Company` | Nominal | FAANG, Product, Service, Startup, etc. |
| `DSA_Count` | Ordinal | 0-20, 20-100, 100-300, 300+ |
| `Projects` | Ordinal | None, 1, 2-3, 4+ |
| `Core_CS_Strength` | Nominal | DSA, DBMS, OS, CN, OOP, etc. |
| `Coding_Platform` | Nominal | LeetCode, HackerRank, CodeChef, Codeforces |
| `Aptitude` | Ordinal | Poor, Average, Good, Excellent |
| `Communication` | Ordinal | Very Nervous → Very Confident (5 levels) |
| `Mock_Interview_Experience` | Ordinal | Never, Once, 2-5 Times, Frequently |
| `Coding_Confidence` | Ordinal | Low, Medium, High, Excellent |
| **`Readiness_Level`** | **Target** | **Beginner, Intermediate, Advanced** |

---

## 🗄️ Database Schema

The application uses **SQLite** via **Prisma ORM** with the following models:

| Model | Description |
|---|---|
| `User` | Student profile, progress tracking, streak, and all profiling answers |
| `SurveyResult` | Stores ML prediction output — predicted role and domain scores |
| `Roadmap` | Student's active learning roadmap (role, status) |
| `Phase` | Ordered phases within a roadmap |
| `Task` | Day-wise tasks with status, category, and resource links |
| `RoadmapTemplate` | Seeded day-by-day templates for each tech role (45 days) |
| `Resource` | Curated external study resource library |
| `Analytics` | Time-series metric events for the progress dashboard |
| `Activity` | User activity log (task completions, logins, etc.) |
| `SolvedProblem` | Tracks which coding problems the student has solved |

---

## 📁 Project Structure

```
PlaceXpert_AI/
├── src/                              # Next.js frontend source
│   ├── app/                          # App Router pages & layouts
│   ├── components/                   # Reusable React components
│   └── lib/                          # Utility functions & helpers
├── backend/
│   ├── server.js                     # Express REST API (Port 5000)
│   ├── db.js                         # Prisma client singleton
│   └── package.json
├── ml/
│   ├── train_readiness.py            # Step 1 & 2A: Model training & comparison
│   ├── predict_readiness.py          # Step 2: Readiness prediction interface
│   ├── bayesian_recommendation.py    # Step 3: Domain recommendation (Bayesian)
│   ├── roadmap_engine.py             # Step 4: Adaptive roadmap generator
│   ├── interview_evaluator.py        # Step 5: Mock interview evaluator (NLP)
│   ├── weak_area_engine.py           # Step 6: Weak area detection engine
│   ├── advanced_model.py             # XGBoost + Bayesian combined model (v2)
│   ├── train_model.py                # Initial RandomForest trainer (v1)
│   ├── predict.py                    # Legacy prediction interface
│   ├── datasets/
│   │   └── student_dataset.csv       # Training dataset
│   └── models/
│       ├── readiness_model.pkl               # Final XGBoost model artifact
│       ├── bayesian_probabilities.json       # Trained Bayesian domain probabilities
│       └── model_comparison_report.json      # Accuracy comparison across 3 models
├── prisma/
│   ├── schema.prisma                 # Database schema definition
│   ├── seed.ts                       # Database seeder (RoadmapTemplate data)
│   └── dev.db                        # SQLite database file
├── student_dataset.csv               # Root-level dataset copy
├── package.json                      # Frontend dependencies
├── next.config.ts                    # Next.js configuration
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- npm

### 1. Install Frontend Dependencies

```bash
npm install
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Python ML Dependencies

```bash
pip install pandas numpy scikit-learn xgboost sentence-transformers joblib
```

### 4. Set Up Environment Variables

Create a `.env` file in the root directory (see [Environment Variables](#-environment-variables)).

### 5. Initialize the Database

```bash
npx prisma migrate dev
npx tsx prisma/seed.ts
```

### 6. Train the ML Models

```bash
# Train the main readiness classification model (XGBoost + comparison)
python ml/train_readiness.py

# Train the Bayesian domain recommendation model
python ml/bayesian_recommendation.py --train
```

### 7. Run the Application

**Frontend (Next.js — Port 3000):**
```bash
npm run dev
```

**Backend (Express API — Port 5000):**
```bash
cd backend
node server.js
```

Open [http://localhost:3000](http://localhost:3000) to access the app.

---

## 🔐 Environment Variables

Create a `.env` file at the project root:

```env
DATABASE_URL="file:./prisma/dev.db"
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check — server status |
| `POST` | `/api/profile/submit` | Submit student profile, run ML prediction, generate roadmap |
| `GET` | `/api/roadmap/:email` | Fetch active roadmap and tasks for a student |

### POST `/api/profile/submit`

**Request:**
```json
{
  "email": "student@example.com",
  "skillsString": "react javascript nextjs postgresql fullstack"
}
```

**Response:**
```json
{
  "success": true,
  "detected_role": "Frontend Developer",
  "resolved_template_role": "Frontend Developer",
  "message": "Successfully structured a 45-Day path for Frontend Developer"
}
```

---

## 🐍 ML Scripts Reference

| Script | Step | Description | CLI Usage |
|---|---|---|---|
| `train_readiness.py` | 1 & 2A | Train & compare Decision Tree, Random Forest, XGBoost | `python ml/train_readiness.py` |
| `predict_readiness.py` | 2 | Predict readiness from student answers | `python ml/predict_readiness.py '{"Academic_Year":"3rd Year",...}'` |
| `bayesian_recommendation.py` | 3 | Train/infer domain recommendations | `python ml/bayesian_recommendation.py --train` |
| `roadmap_engine.py` | 4 | Generate personalized study roadmap | Called internally by backend |
| `interview_evaluator.py` | 5 | Evaluate mock interview answer semantically | `python ml/interview_evaluator.py '{"domain":"DSA","question":"...","answer":"..."}'` |
| `weak_area_engine.py` | 6 | Detect weak areas from topic scores | `python ml/weak_area_engine.py '{"scores":{"DSA":[3,4,6]}}'` |

---

## 📈 Model Evolution

| Version | Model | Accuracy | Notes |
|---|---|---|---|
| **v1** | RandomForest (100 trees, basic label encoding) | ~95%+ | Initial baseline — saved to `ml/readiness_model.pkl` |
| **v2** | XGBoost (n=100, max_depth=6, lr=0.1) | ~100% | Added Bayesian domain mapping — `ml/advanced_analytics.pkl` |
| **v3 (Final)** | XGBoost + GridSearchCV + Ordinal/Label Encoding | **100%** | Proper ordinal encoding, hyperparameter tuning, production artifact at `ml/models/readiness_model.pkl` |

---

## 👩‍💻 Author

Built as a capstone project demonstrating end-to-end AI-powered career guidance using real-world ML techniques: classification, Bayesian inference, NLP, and rule-based engines.

---

*PlaceXpert AI — From profiling to placement-ready, powered by AI.*
