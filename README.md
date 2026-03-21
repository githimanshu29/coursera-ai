# Coursera-AI — AI-Powered Learning Platform

<div align="center">

![Coursera-AI Banner](public/logo.svg)

**Transform any topic into a comprehensive course with AI-generated chapters, rich content, and curated videos.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-courseraai.vercel.app-7c3aed?style=for-the-badge)](https://courseraai.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-coursera--ai-181717?style=for-the-badge&logo=github)](https://github.com/githimanshu29/coursera-ai)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com)

</div>

---

## What is Coursera-AI?

Coursera-AI is a full-stack AI-powered learning platform that allows anyone to generate a complete, structured course on any topic using Google Gemini AI. Enter a subject, configure your preferences, and the platform automatically builds a full curriculum — complete with chapter-by-chapter content, curated YouTube videos, and progress tracking.

The platform is built for learners who want personalized courses tailored to their exact goals — from beginner SQL to advanced machine learning, football tactics to digital marketing.

---

## Live Features

### Course Creation
- Enter any topic, select difficulty level, number of chapters, and category
- Gemini AI generates a complete course layout — chapter names, topics, and estimated durations
- Visual course roadmap showing the full learning path before committing

### AI Content Generation
- Full HTML-formatted content generated for every topic in every chapter
- Rich explanations, examples, code snippets, and key concepts
- Content generated in parallel using `Promise.all` — dramatically reducing wait time

### Integrated Video Learning
- YouTube Data API automatically fetches 3 relevant videos per chapter
- Videos curated based on chapter topic for maximum relevance
- Embedded directly in the study page alongside written content

### Progress Tracking
- Mark individual topics as complete
- Per-chapter and overall course progress bars
- Progress persists across sessions

### Course Management
- Dashboard showing all created and enrolled courses
- Two course states: `SETUP REQUIRED` (layout only) and `READY` (full content)
- Enroll in any ready course to start learning
- Delete courses and enrollments independently

### Study Page
- Clean two-panel layout: chapter sidebar + content area
- Chapter sidebar shows progress per topic with completion indicators
- Full AI-generated content rendered as rich HTML
- YouTube videos at the top of each chapter

### Authentication
- JWT-based authentication with access + refresh token rotation
- Refresh tokens stored in `httpOnly` cookies — not accessible by JavaScript
- Auto token refresh via Axios interceptors — seamless user experience
- Register with avatar selection and gender

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework + build tool |
| React Router v6 | Client-side routing |
| Redux Toolkit | Global state (auth, UI state) |
| TanStack Query | Server state, caching, refetching |
| Axios | HTTP client with interceptors |
| Tailwind CSS v4 | Utility-first styling |
| Pure inline styles | Component-level styling (no class conflicts) |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Primary database |
| Redis (ioredis) | Caching + rate limit store |
| JWT | Access + refresh token auth |
| bcryptjs | Password hashing |
| Winston | Structured logging |
| express-rate-limit | API rate limiting |
| cookie-parser | httpOnly cookie handling |

### AI & External APIs
| Technology | Purpose |
|---|---|
| Google Gemini 2.5 Flash Lite | Course layout + content generation |
| YouTube Data API v3 | Video recommendations per chapter |

### Infrastructure
| Technology | Purpose |
|---|---|
| MongoDB Atlas | Cloud database |
| Redis (Docker) | Local development cache |
| Vercel | Frontend deployment |

---

## Project Architecture

```
New-Coursera-AI/
├── client/                          # React frontend (Vite)
│   └── src/
│       ├── pages/
│       │   ├── Landing.jsx          # Public landing page
│       │   ├── auth/
│       │   │   ├── Login.jsx
│       │   │   └── Register.jsx
│       │   ├── workspace/
│       │   │   ├── Dashboard.jsx    # Main workspace
│       │   │   ├── EditCourse.jsx   # Course setup + generation
│       │   │   ├── ViewCourse.jsx   # Course roadmap preview
│       │   │   └── _components/
│       │   │       ├── WelcomeBanner.jsx
│       │   │       ├── CourseCard.jsx
│       │   │       ├── EnrolledCourseCard.jsx
│       │   │       ├── SkeletonCard.jsx
│       │   │       └── CreateCourseDialog.jsx
│       │   └── course/
│       │       ├── CourseView.jsx   # Study page
│       │       └── _components/
│       │           ├── ChapterSidebar.jsx
│       │           └── ChapterContent.jsx
│       ├── components/
│       │   └── layout/
│       │       ├── WorkspaceLayout.jsx
│       │       └── ProtectedRoute.jsx
│       ├── store/
│       │   ├── store.js
│       │   └── slices/
│       │       ├── authSlice.js
│       │       └── courseSlice.js
│       └── lib/
│           ├── axios.js             # Axios instance + interceptors
│           └── api.js               # All API call functions
│
└── server/                          # Node.js + Express backend
    ├── server.js                    # Entry point
    └── src/
        ├── config/
        │   └── db.js                # MongoDB connection
        ├── models/
        │   ├── User.js
        │   ├── Course.js
        │   ├── Enrollment.js
        │   └── ChatHistory.js
        ├── controllers/
        │   ├── auth.controller.js
        │   └── course/
        │       ├── generateCourseLayout.js
        │       ├── generateCourseContent.js
        │       ├── getCourses.js
        │       └── deleteCourse.js
        ├── middleware/
        │   ├── auth.js              # JWT protect middleware
        │   ├── asyncHandler.js      # Error boundary wrapper
        │   ├── errorHandler.js      # Global error handler
        │   ├── requestLogger.js     # HTTP request logging
        │   ├── rateLimiter.js       # Rate limiting (3 tiers)
        │   └── cache.js             # Redis cache middleware
        ├── routes/
        │   ├── auth.route.js
        │   ├── course.routes.js
        │   └── enrollment.routes.js
        └── lib/
            ├── gemini.js            # Gemini AI config
            ├── logger.js            # Winston logger
            └── redis.js             # Redis client
```

---

## API Reference

### Auth Routes
```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login + get tokens
POST   /api/auth/refresh-token     Refresh access token (reads cookie)
POST   /api/auth/logout            Logout + clear refresh token
```

### Course Routes
```
POST   /api/courses/generate-layout              Generate course structure (AI)
POST   /api/courses/generate-content/:courseId   Generate full content (AI)
GET    /api/courses/user-courses                 Get all courses for user
GET    /api/courses/:courseId                    Get single course
DELETE /api/courses/:courseId                    Delete course + enrollments
```

### Enrollment Routes
```
POST   /api/enrollments/enroll                   Enroll in a course
GET    /api/enrollments/                         Get all enrolled courses
GET    /api/enrollments/:courseId                Get single enrolled course
DELETE /api/enrollments/:enrollmentId            Unenroll from course
POST   /api/enrollments/complete-topic           Mark topic complete + update progress
```

---

## Key Engineering Decisions

### Why JWT refresh token rotation?
Access tokens expire in 15 minutes. When they expire, the Axios interceptor automatically calls `/refresh-token` using the `httpOnly` cookie — the user never sees a logout. On each refresh, a new refresh token is issued and the old one is invalidated — preventing token replay attacks.

### Why `Promise.all` for content generation?
Course content generation sends one Gemini API call per chapter. With 10 chapters, sequential generation would take ~90 seconds. `Promise.all` runs all chapters simultaneously, reducing this to ~15-20 seconds — the time it takes to generate the slowest single chapter.

### Why `jsonrepair` on Gemini responses?
Gemini occasionally returns malformed JSON — truncated objects, missing commas, or markdown fences. `jsonrepair` fixes these programmatically before `JSON.parse` runs, eliminating one of the most common failure modes in AI applications.

### Why Redis for rate limiting instead of in-memory?
In-memory rate limiting doesn't work across multiple server instances — instance A doesn't know about instance B's counters. Redis is shared, so limits work correctly regardless of horizontal scaling.

### Why `markModified()` for courseContent?
MongoDB/Mongoose doesn't automatically detect changes to nested `Object` type fields. Without `markModified("courseContent")`, the updated content wouldn't be saved — a subtle but critical bug when working with complex nested structures.

### Why separate `cid` from MongoDB `_id`?
The `cid` is a UUID generated on the frontend before the API call. This allows the frontend to navigate to `/workspace/edit-course/:cid` immediately after clicking "Generate Course" — without waiting for the server response. The backend then stores the course with that same `cid`.

---

## User Flow

```
1. Landing Page
   └── Register / Login

2. Workspace Dashboard
   ├── "Continue Learning" section — enrolled courses with progress
   └── "My Courses" section — created courses with status

3. Create Course
   └── Fill form (name, chapters, level, category, video toggle)
       └── AI generates course layout → redirect to Edit Course

4. Edit Course (/workspace/edit-course/:courseId)
   ├── See course info + full chapter roadmap
   └── Click "Generate Content" → AI generates all chapters
       └── Status changes to READY

5. Dashboard → Click "Enroll"
   └── Course moves to "Continue Learning"

6. Click "Continue Learning"
   └── View Course roadmap (/workspace/view-course/:courseId)
       └── Click "Start Learning"

7. Study Page (/course/:courseId)
   ├── Left sidebar: chapters + topics + progress
   ├── Main area: YouTube videos + AI-generated content per chapter
   └── "Mark as Complete" per topic → updates progress
```

---

## Production-Grade Infrastructure

### Rate Limiting (3 tiers)
```
Global:     100 requests / 15 min  → all routes
Auth:       10 requests / 15 min   → /login, /register (brute force prevention)
AI routes:  10 requests / hour     → /generate-layout, /generate-content
```

### Caching Strategy
```
GET /user-courses    → cached 5 min  (called on every dashboard load)
GET /course/:id      → cached 10 min (heavy document, rarely changes)
GET /enrollments     → cached 3 min  (called frequently)

Invalidated on:      any write to the same resource
```

### Logging (Winston)
```
logs/
├── combined.log     ← all logs (INFO + WARN + ERROR)
├── error.log        ← errors only with stack traces
```
Every request logs: method, path, status code, duration, userId

### Error Handling
- `asyncHandler` wrapper on all new controllers — no try/catch repetition
- Global `errorHandler` middleware — catches everything, logs context
- Never exposes stack traces in production responses

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Google Gemini API key
- YouTube Data API key
- Docker (for Redis locally)

### Clone the repository
```bash
git clone https://github.com/githimanshu29/coursera-ai.git
cd coursera-ai
```

### Start Redis (Docker)
```bash
docker run -d -p 6379:6379 --name redis-local redis:alpine
```

### Server setup
```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5005
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/test
CLIENT_URL=http://localhost:5173

JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

GEMINI_API_KEY=your_gemini_api_key
YOUTUBE_API_KEY=your_youtube_api_key

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

```bash
npm run dev
```

### Client setup
```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`

---

## Environment Variables

### Server
| Variable | Description |
|---|---|
| `PORT` | Server port (default 5005) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `CLIENT_URL` | Frontend URL for CORS |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |
| `GEMINI_API_KEY` | Google Gemini API key |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key |
| `REDIS_HOST` | Redis host (127.0.0.1 locally) |
| `REDIS_PORT` | Redis port (6379) |

---

## Roadmap

The following features are currently under active development and will be released progressively:

- **Step-by-Step Course Generation with RAG** — Generate courses chapter by chapter using LangChain + MongoDB Atlas Vector Search. Each chapter is aware of previous chapters via semantic retrieval. Users can customize each chapter with natural language instructions ("explain simpler", "add more code examples").

- **AI Topic Assistant** — Context-aware AI chat per topic. Gemini answers questions scoped to the exact content being studied, with full conversation history saved per topic.

- **Chapter Quiz System** — Auto-generated MCQ quizzes after each chapter. Score 80%+ to earn a badge. Badge visible on sidebar and profile.

- **Analytics Dashboard** — Track courses generated, completed, quiz scores, and skill levels earned per course.

- **Profile-Based Course Suggestions** — Trending courses suggested based on your learning profile and history.

- **AI Voice Interviewer** — Practice real interviews with an AI that listens to your spoken answers and gives structured feedback in real time.

---

## Screenshots

| Landing Page | Dashboard | Course Study |
|---|---|---|
| Dark animated hero with typewriter effect | My Courses + Continue Learning grid | Two-panel: sidebar + AI content |

---

## Author

**Himanshu Kumar**
Third-year undergraduate | MERN Stack + GenAI Engineer

[![GitHub](https://img.shields.io/badge/GitHub-githimanshu29-181717?style=flat&logo=github)](https://github.com/githimanshu29)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat&logo=linkedin)](https://linkedin.com/in/himanshu-kumar)

---

## License

MIT License — feel free to use this project as inspiration or reference.

---

<div align="center">
Built with Node.js, React, MongoDB, Redis, and Google Gemini AI
</div>
