<div align="center">

# 📘 E-LEARNING PLATFORM
## Project Implementation Plan

**Multi-Category Educational & E-Learning Platform**  
*Web Application + Android Mobile App*

---

| | |
|---|---|
| **Document Type** | Project Implementation Plan |
| **Version** | 1.0 |
| **Prepared By** | Development Team Lead |
| **Date** | 24 August 2026 |
| **Sprint Duration** | 7 Working Days (25 Aug – 31 Aug 2026) |
| **Confidentiality** | Internal Use Only |

---

</div>

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Overview](#2-project-overview)
3. [Technology Stack](#3-technology-stack)
4. [Team Allocation Matrix](#4-team-allocation-matrix)
5. [System Architecture](#5-system-architecture)
6. [Core Modules Breakdown](#6-core-modules-breakdown)
7. [Day-by-Day Sprint Plan](#7-day-by-day-sprint-plan)
8. [Database Schema Design](#8-database-schema-design)
9. [API Endpoints Summary](#9-api-endpoints-summary)
10. [Effort Estimation Summary](#10-effort-estimation-summary)
11. [Risk Assessment & Mitigation](#11-risk-assessment--mitigation)
12. [MVP Scope vs Deferred Features](#12-mvp-scope-vs-deferred-features)
13. [Deliverables Checklist](#13-deliverables-checklist)
14. [Post-Sprint Roadmap](#14-post-sprint-roadmap-weeks-2-8)
15. [Pre-Sprint Prerequisites](#15-pre-sprint-prerequisites)
16. [Sign-Off](#16-sign-off)

---

## 1. Executive Summary

This document presents a **7-day intensive sprint plan** to build the MVP (Minimum Viable Product) of a **multi-category E-Learning Platform** serving Indian state-specific educational content across Web and Android.

The platform covers **6 core educational modules** — School Education (K-12), Competitive Exam Preparation, Higher Education (UG/PG), State & Central Government Jobs Preparation, and Teacher Certification — with integrated **wallet-based payments**, a **digital e-book library**, and a **Binary MLM affiliate network**.

**Key Metrics:**

| Metric | Value |
|--------|-------|
| Total Estimated Effort | **238 person-hours** |
| Team Size Required | **6 developers** |
| Sprint Duration | **7 working days** |
| Total API Endpoints | **~53** |
| Database Tables | **19 core tables** |
| Platform Targets | **Web (Responsive) + Android App** |

> **⚠️ Important Note:** A 1-week timeline delivers a functional MVP with core user flows operational. A fully production-ready, polished product would realistically require **8–12 weeks** with the same team.

---

## 2. Project Overview

### 2.1 Purpose
Build a comprehensive mobile/web platform enabling users to register, browse state-specific educational content, purchase individual courses or e-books via an integrated wallet, and access multi-format learning materials (Videos, Notes, MCQs, Attachments, Lessons).

### 2.2 Key Features
- **User Authentication** — Login via User ID / Mobile / Name + Password with OTP verification
- **State-wise Localization** — Content personalized by Indian state selection
- **KYC Verification** — Identity verification for paid course access
- **6-Level Content Hierarchy** — State → Category → Course → Subject → Chapter → Assets
- **5 Learning Asset Types** — Lessons, Notes, MCQs, Attachments, Videos
- **Digital Wallet** — In-app wallet with payment gateway integration
- **E-Book Store** — Standalone purchase catalog with instant delivery
- **Binary MLM Network** — Affiliate referral system with binary income model
- **Admin Dashboard** — Complete content & user management panel

### 2.3 Target Users
| User Type | Description |
|-----------|-------------|
| Students (K-12) | School students from Class 1 to Class 12 |
| Competitive Exam Aspirants | NEET, JEE, NET, GMAT, Navodaya candidates |
| Higher Education Students | UG/PG students (MA, MCom, MSc, MBA) |
| Government Job Aspirants | State & Central government exam candidates |
| Teachers | B.Ed, M.Ed, TET, CTET aspirants |
| Affiliates/Partners | MLM network participants promoting the platform |

---

## 3. Technology Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Frontend (Web)** | React.js 18 + Vite | Component-based, fast build tooling, large ecosystem |
| **Frontend (Mobile)** | React Native / Flutter | Cross-platform development (Android + future iOS readiness) |
| **Backend API** | Node.js + Express.js | JavaScript ecosystem consistency, rapid API development |
| **Database (Primary)** | PostgreSQL | Relational integrity for complex content hierarchy |
| **Database (Cache)** | Redis | Session management, API response caching |
| **Authentication** | JWT + OTP (MSG91/Twilio) | Secure token-based auth with mobile OTP support |
| **File Storage** | AWS S3 / Firebase Storage | Scalable media storage for videos, PDFs, e-books |
| **Video Streaming** | HLS via Vdocipher / AWS CloudFront | DRM-protected video delivery with adaptive bitrate |
| **Payment Gateway** | Razorpay / Cashfree | Indian payment gateway with UPI, cards, net banking |
| **Admin Panel** | React.js Dashboard | Unified content management interface |
| **Deployment** | AWS (EC2 + RDS + S3 + CloudFront) | Production-grade, scalable cloud infrastructure |
| **CI/CD** | GitHub Actions | Automated build, test, and deployment pipeline |

---

## 4. Team Allocation Matrix

| # | Role | Count | Key Responsibilities |
|---|------|:-----:|---------------------|
| 1 | Backend Developer (Senior) | 1 | API architecture, DB schema, authentication, payment integration, MLM logic |
| 2 | Backend Developer (Mid-Level) | 1 | Content APIs, e-book module, progress tracking, subscription engine |
| 3 | Frontend Developer (Web) | 1 | Web dashboard, content pages, wallet UI, MCQ engine, video player |
| 4 | Mobile Developer (Android) | 1 | Android app, native features, offline capability, push notifications |
| 5 | Full-Stack / UI Developer | 1 | Admin panel, design system, responsive layouts, bulk upload tools |
| 6 | QA Engineer / DevOps | 1 | Testing, CI/CD pipeline, deployment, security audit |

**Total Team Size: 6 dedicated developers**

---

## 5. System Architecture

### 5.1 Content Hierarchy (6 Levels)

The platform follows a strict **6-level drill-down architecture**:

```
Level 1: STATE SELECTION
   └── Karnataka, Delhi, Goa, Maharashtra, Tamil Nadu...
       │
Level 2: MAIN CATEGORY
   └── School Education | Competitive Exams | Higher Education | State Govt Jobs | Central Govt Jobs | Teacher Preparation
       │
Level 3: COURSE / BOARD / GRADE
   └── State Board | CBSE | ICSE | PUC (+1/+2) | KAS | Banking...
       │
Level 4: SUBJECT
   └── English | Kannada | Hindi | Science | Maths | Social Science...
       │
Level 5: CHAPTER / LESSON
   └── Chapter 1 | Chapter 2 | Chapter 3 | Chapter 4...
       │
Level 6: LEARNING ASSETS
   └── 📖 Lessons | 📝 Notes | ❓ MCQs | 📎 Attachments | 🎥 Videos
```

### 5.2 High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  React Web   │  │ Android App  │  │    Admin Dashboard   │  │
│  │  (Vite PWA)  │  │(React Native)│  │     (React.js)       │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
└─────────┼─────────────────┼─────────────────────┼──────────────┘
          │                 │                     │
          ▼                 ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (REST)                         │
│           Node.js + Express.js | JWT Auth Middleware             │
│       Rate Limiting | Input Validation | Error Handling          │
└────────────────────────────┬────────────────────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
│   PostgreSQL     │ │    Redis     │ │    AWS S3        │
│   (Primary DB)   │ │   (Cache)    │ │  (File Storage)  │
│  Users, Content, │ │  Sessions,   │ │  Videos, PDFs,   │
│  Payments, MLM   │ │  API Cache   │ │  E-books, Images │
└──────────────────┘ └──────────────┘ └──────────────────┘
                                              │
                                              ▼
                                    ┌──────────────────┐
                                    │   CloudFront     │
                                    │  (CDN + Video    │
                                    │   Streaming)     │
                                    └──────────────────┘
```

---

## 6. Core Modules Breakdown

### Module I — School Education (Class 1 to 12)

| Sub-Module | Details |
|-----------|---------|
| State Board | State Medium / Bilingual (Classes 1–10) + English Medium (Classes 1–10) |
| CBSE Board | Classes 1–10 |
| ICSE Board | Classes 1–10 |
| PUC / Senior Secondary (+1 & +2) | Arts Stream (6 subjects), Commerce Stream (6 subjects), Science Stream (6 subjects) |

### Module II — School Entrance & Competitive Exams

| Exam | Type |
|------|------|
| Navodaya Entrance Exam | School Entrance |
| NTS (National Talent Search) | Talent Assessment |
| G-MAT | Management Aptitude |
| NET | National Eligibility |
| NEET | Medical Entrance |
| JEE | Engineering Entrance |

### Module III — Higher Education (UG & PG)

| Course | Level |
|--------|-------|
| M.A (Master of Arts) | PG |
| M.Com (Master of Commerce) | PG |
| M.Sc (Master of Science) | PG |
| MBA (Master of Business Administration) | PG |
| Custom / Other UG-PG Courses | UG/PG |

### Module IV — State Government Jobs Preparation

| Exam | Full Form |
|------|-----------|
| SDA | Second Division Assistant |
| FDA | First Division Assistant |
| GPT | General Primary Teacher |
| KAS | Karnataka Administrative Services |
| Other State Exams | Various |

### Module V — Central Government Jobs Preparation

| Exam | Full Form |
|------|-----------|
| Banking Exams | IBPS, SBI, etc. |
| Railway (RRB) | Railway Recruitment Board |
| IAS / Civil Services | Indian Administrative Service |
| Other Central Exams | Various |

### Module VI — Teacher Preparation & Certifications

| Certification | Full Form |
|--------------|-----------|
| B.Ed | Bachelor of Education |
| M.Ed | Master of Education |
| TET | Teacher Eligibility Test |
| CTET | Central Teacher Eligibility Test |
| Other Teaching Exams | Various |

---

## 7. Day-by-Day Sprint Plan

### 📅 DAY 1 — Monday, 25 August | Foundation & Architecture Setup

| Time | Task | Owner | Hours |
|------|------|-------|:-----:|
| 09:00–11:00 | Project scaffolding: React (Vite) web app, Node.js/Express backend, React Native mobile | All Devs | 2 |
| 09:00–11:00 | PostgreSQL database schema design — all 6 levels of content hierarchy | Backend Sr. | 2 |
| 11:00–13:00 | Design system: color palette, typography, component library (buttons, cards, modals, nav) | UI Dev | 2 |
| 11:00–13:00 | Database tables: `users`, `states`, `categories`, `courses`, `subjects`, `chapters`, `learning_assets` | Backend Sr. | 2 |
| 14:00–16:00 | Database tables: `wallets`, `transactions`, `ebooks`, `purchases`, `kyc_records`, `mlm_tree` | Backend Mid | 2 |
| 14:00–16:00 | API route structure & middleware (auth, validation, error handling, rate limiting) | Backend Sr. | 2 |
| 16:00–18:00 | Seed data: 36 states/UTs, 6 main categories, sample courses & subjects | Backend Mid | 2 |
| 16:00–18:00 | CI/CD pipeline setup, Docker configuration, staging environment provisioning | QA/DevOps | 2 |

**✅ Day 1 Deliverables:**
- Project repositories initialized (Web, API, Mobile, Admin)
- Complete database schema with migrations & seed data
- API skeleton with middleware pipeline
- Design system & component library foundation
- CI/CD pipeline operational

---

### 📅 DAY 2 — Tuesday, 26 August | Authentication, KYC & User Management

| Time | Task | Owner | Hours |
|------|------|-------|:-----:|
| 09:00–11:00 | Auth APIs: Register, Login (UserID/Mobile/Name + Password), OTP verification | Backend Sr. | 2 |
| 09:00–11:00 | Web: Login/Register screens with form validation, OTP input UI | Frontend Web | 2 |
| 09:00–11:00 | Mobile: Splash screen, onboarding flow, login/register screens | Mobile Dev | 2 |
| 11:00–13:00 | Auth APIs: JWT generation, refresh tokens, session management, logout | Backend Sr. | 2 |
| 11:00–13:00 | KYC Module API: Document upload (Aadhaar/PAN), verification status tracking | Backend Mid | 2 |
| 14:00–16:00 | State Selection Flow: First-login state picker → persist preference → content routing | Backend Sr. + Web | 2 |
| 14:00–16:00 | KYC UI (Web + Mobile): Document upload form, verification status, approval flow | Web + Mobile | 2 |
| 16:00–18:00 | User Profile APIs: View/edit profile, change password, photo upload | Backend Mid | 2 |
| 16:00–18:00 | Admin Panel: User management table (list, search, filter, block/unblock, KYC approval) | UI Dev | 2 |

**✅ Day 2 Deliverables:**
- Full authentication flow (Register → OTP → Login → JWT)
- State selection on first login with persistence
- KYC document upload & verification pipeline
- User profile CRUD operations
- Admin user management dashboard

---

### 📅 DAY 3 — Wednesday, 27 August | Dashboard & Content Navigation (Levels 1–4)

| Time | Task | Owner | Hours |
|------|------|-------|:-----:|
| 09:00–11:00 | Dashboard APIs: Banners, video ads, announcements, featured courses | Backend Sr. | 2 |
| 09:00–11:00 | Web Dashboard: Hero banner carousel, promo ads section, announcement ticker | Frontend Web | 2 |
| 09:00–11:00 | Mobile Dashboard: Home screen with banner slider, category grid, quick-access cards | Mobile Dev | 2 |
| 11:00–13:00 | Content APIs (Level 2): GET categories by state, category detail with subcategories | Backend Mid | 2 |
| 11:00–13:00 | Web: 6 Main Category cards with icons, descriptions & hover animations | Frontend Web | 2 |
| 14:00–16:00 | Content APIs (Level 3): GET courses/boards/grades by category | Backend Mid | 2 |
| 14:00–16:00 | Web: Course/Board selection grid with breadcrumb navigation | Frontend Web | 2 |
| 14:00–16:00 | Mobile: Category → Course drill-down screens with transitions | Mobile Dev | 2 |
| 16:00–18:00 | Content APIs (Level 4): GET subjects by course with progress data | Backend Mid | 2 |
| 16:00–18:00 | Web + Mobile: Subject listing with progress indicators, lock states | Web + Mobile | 2 |
| 16:00–18:00 | Admin Panel: Content CRUD — categories, courses, subjects (drag-drop ordering) | UI Dev | 2 |

**✅ Day 3 Deliverables:**
- Fully functional home dashboard with banners & announcements
- 6 main category navigation with state-specific filtering
- Course/Board selection (Level 3) with all boards
- Subject listing (Level 4) with progress tracking
- Admin content management (Levels 1–4)

---

### 📅 DAY 4 — Thursday, 28 August | Content Delivery (Levels 5–6) & Learning Assets

| Time | Task | Owner | Hours |
|------|------|-------|:-----:|
| 09:00–11:00 | Chapter APIs (Level 5): GET chapters by subject, chapter detail, ordering | Backend Sr. | 2 |
| 09:00–11:00 | Learning Asset APIs (Level 6): CRUD for Lessons, Notes, MCQs, Attachments, Videos | Backend Mid | 2 |
| 09:00–11:00 | Web: Chapter listing with expandable accordion, completion checkmarks | Frontend Web | 2 |
| 11:00–13:00 | Lesson Viewer: Rich text renderer with bookmarking, font-size control | Frontend Web | 2 |
| 11:00–13:00 | Notes Module: PDF viewer, downloadable summary notes | Frontend Web | 2 |
| 11:00–13:00 | Mobile: Chapter listing + asset tabs (Lessons, Notes, MCQ, Attachments, Videos) | Mobile Dev | 2 |
| 14:00–16:00 | MCQ Engine: Interactive quiz UI — timer, scoring, explanations, result summary | Web + Backend | 2 |
| 14:00–16:00 | Video Player: Embedded player with speed control, quality selector, resume | Frontend Web | 2 |
| 14:00–16:00 | Mobile: Video player with PiP support, offline download | Mobile Dev | 2 |
| 16:00–18:00 | Attachments Module: PDF/document viewer, download manager | Frontend Web | 2 |
| 16:00–18:00 | Progress Tracking API: Lesson completion, video %, MCQ scores per user | Backend Mid | 2 |
| 16:00–18:00 | Admin: Content upload — bulk lessons, notes (PDF), MCQs (CSV), videos (URL) | UI Dev | 2 |

**✅ Day 4 Deliverables:**
- Complete chapter/lesson navigation (Level 5)
- All 5 learning asset types functional
- Interactive MCQ engine with scoring
- DRM-protected video streaming
- User progress tracking
- Admin bulk content upload tools

---

### 📅 DAY 5 — Friday, 29 August | Wallet, Payments & E-Book Library

| Time | Task | Owner | Hours |
|------|------|-------|:-----:|
| 09:00–11:00 | Wallet APIs: Create wallet, top-up (Razorpay), balance check, deduction | Backend Sr. | 2 |
| 09:00–11:00 | Payment Gateway: Razorpay setup, webhook handlers, payment verification | Backend Sr. | 2 |
| 09:00–11:00 | Web: Wallet dashboard — balance, top-up modal, transaction history | Frontend Web | 2 |
| 11:00–13:00 | Course Purchase Flow: Browse → Select → Price → Wallet deduction → Unlock | Backend + Web | 2 |
| 11:00–13:00 | Subscription Engine: 1-year validity, expiry notifications, renewal | Backend Mid | 2 |
| 11:00–13:00 | Mobile: Wallet screen, payment flow, purchase confirmation | Mobile Dev | 2 |
| 14:00–16:00 | E-Book Library APIs: Catalog, individual purchase, instant delivery, user library | Backend Mid | 2 |
| 14:00–16:00 | Web: E-Book Store — catalog with categories, pricing, "My Library" | Frontend Web | 2 |
| 14:00–16:00 | E-Book Reader: In-app PDF/EPUB reader with bookmarks | Frontend Web | 2 |
| 16:00–18:00 | Pricing Engine: Variable pricing for e-books, packages, annual passes | Backend Sr. | 2 |
| 16:00–18:00 | Mobile: E-Book store, download, offline reading | Mobile Dev | 2 |
| 16:00–18:00 | Admin: Pricing management, e-book upload, revenue reports | UI Dev | 2 |

**✅ Day 5 Deliverables:**
- Integrated wallet with Razorpay payment gateway
- Course purchase flow with 1-year subscription
- Transaction history with detailed logging
- E-Book store with instant delivery
- In-app e-book reader
- Variable pricing engine
- Admin pricing & revenue dashboard

---

### 📅 DAY 6 — Saturday, 30 August | Binary MLM Network & Affiliate System

| Time | Task | Owner | Hours |
|------|------|-------|:-----:|
| 09:00–11:00 | MLM Database: Binary tree structure, referral codes, placement logic | Backend Sr. | 2 |
| 09:00–11:00 | Referral APIs: Generate code, join via referral, auto-placement (left/right) | Backend Sr. | 2 |
| 11:00–13:00 | Binary Income: Matching volume (weaker leg), income cycle processing | Backend Sr. | 2 |
| 11:00–13:00 | MLM APIs: Tree view (downline), team volume, earnings, rank progression | Backend Mid | 2 |
| 14:00–16:00 | Web: MLM Dashboard — interactive tree visualization, team stats, earnings | Frontend Web | 2 |
| 14:00–16:00 | Web: Referral sharing, direct referral list, placement history | Frontend Web | 2 |
| 14:00–16:00 | Mobile: MLM dashboard, tree viewer, referral sharing (WhatsApp/SMS) | Mobile Dev | 2 |
| 16:00–18:00 | Bonus Engine: Leadership bonuses, rank rewards, matching income payouts | Backend Mid | 2 |
| 16:00–18:00 | Admin: MLM management — tree explorer, payout processing, commission reports | UI Dev | 2 |
| 16:00–18:00 | Payout Integration: Wallet credit for earnings, payout request workflow | Backend Sr. | 2 |

**✅ Day 6 Deliverables:**
- Binary MLM tree with auto-placement
- Referral system with shareable codes/links
- Binary income calculation (weaker leg matching)
- Interactive tree visualization
- Leadership bonuses & rank system
- Admin MLM management & payouts

---

### 📅 DAY 7 — Sunday, 31 August | Integration Testing, Polish & Deployment

| Time | Task | Owner | Hours |
|------|------|-------|:-----:|
| 09:00–11:00 | Integration Testing: E2E user flow (Register → Browse → Purchase → Learn) | QA + All | 2 |
| 09:00–11:00 | Critical Bug Fixes from integration testing | All Devs | 2 |
| 11:00–13:00 | Performance: API tuning, DB indexing, image/asset optimization | Backend + DevOps | 2 |
| 11:00–13:00 | UI Polish: Responsive fixes, animations, loading/error/empty states | Web + Mobile | 2 |
| 14:00–16:00 | Security: Input validation, SQL injection, XSS, rate limiting, JWT hardening | Backend Sr. | 2 |
| 14:00–16:00 | Android APK: Final build, app signing, Play Store prep | Mobile Dev | 2 |
| 16:00–18:00 | Staging Deployment: Web app, API, database deployed to staging | DevOps | 2 |
| 16:00–18:00 | Documentation: API docs (Swagger/Postman), deployment guide | Backend + UI | 2 |
| 16:00–18:00 | Demo Prep: Sample data, stakeholder demo walkthrough script | All Devs | 2 |

**✅ Day 7 Deliverables:**
- All integration tests passing
- Performance-optimized APIs (< 200ms response)
- Security-hardened application
- Android APK ready for distribution
- Staging environment live
- API documentation complete
- Demo-ready with sample data

---

## 8. Database Schema Design

### 8.1 Core Tables (19 Tables)

| # | Table Name | Description | Key Relationships |
|---|-----------|-------------|-------------------|
| 1 | `users` | User profile, credentials, state preference | → wallets, kyc, purchases |
| 2 | `states` | Indian states & UTs (36 entries) | → categories |
| 3 | `categories` | 6 main modules per state | → courses |
| 4 | `courses` | Boards/Grades/Exams | → subjects |
| 5 | `subjects` | Subject listing per course | → chapters |
| 6 | `chapters` | Chapter listing per subject | → learning_assets |
| 7 | `learning_assets` | Lessons, Notes, MCQs, Attachments, Videos | → chapters |
| 8 | `mcq_questions` | MCQ question bank with options & explanations | → learning_assets |
| 9 | `mcq_attempts` | User MCQ attempt records & scores | → users, mcq_questions |
| 10 | `wallets` | User wallet balance & status | → users |
| 11 | `transactions` | All wallet transactions | → wallets |
| 12 | `purchases` | Course/e-book purchase records with validity dates | → users, courses, ebooks |
| 13 | `ebooks` | E-book catalog (title, price, file, category) | → purchases |
| 14 | `kyc_records` | KYC documents & verification status | → users |
| 15 | `banners` | Promotional banners & video ads | — |
| 16 | `announcements` | Dashboard announcements | — |
| 17 | `mlm_tree` | Binary tree (parent, left_child, right_child) | → users |
| 18 | `mlm_earnings` | Affiliate earnings, bonuses, payouts | → users, mlm_tree |
| 19 | `user_progress` | Lesson completion, video %, bookmarks | → users, learning_assets |

### 8.2 Entity Relationship Summary

```
users ──┬── wallets ── transactions
        ├── purchases ──┬── courses
        │               └── ebooks
        ├── kyc_records
        ├── mlm_tree ── mlm_earnings
        ├── mcq_attempts
        └── user_progress

states ── categories ── courses ── subjects ── chapters ── learning_assets
                                                              └── mcq_questions
```

---

## 9. API Endpoints Summary

### 9.1 Authentication & Users (11 endpoints)
```
POST   /api/auth/register            — New user registration
POST   /api/auth/login               — Login (UserID / Mobile / Name + Password)
POST   /api/auth/verify-otp          — OTP verification
POST   /api/auth/refresh-token       — JWT refresh
POST   /api/auth/forgot-password     — Password reset initiation
PUT    /api/auth/reset-password      — Password reset execution
GET    /api/users/profile            — Get user profile
PUT    /api/users/profile            — Update profile
POST   /api/users/kyc               — Submit KYC documents
GET    /api/users/kyc/status         — KYC verification status
PUT    /api/users/state              — Update state preference
```

### 9.2 Content Hierarchy (10 endpoints)
```
GET    /api/states                   — List all states
GET    /api/categories/:stateId      — Categories by state
GET    /api/courses/:categoryId      — Courses by category
GET    /api/subjects/:courseId       — Subjects by course
GET    /api/chapters/:subjectId     — Chapters by subject
GET    /api/assets/:chapterId       — Assets by chapter
GET    /api/assets/:id/content      — Specific asset content
GET    /api/mcq/:assetId            — MCQ questions
POST   /api/mcq/:assetId/submit    — Submit MCQ answers
GET    /api/search                   — Global content search
```

### 9.3 Wallet & Payments (6 endpoints)
```
GET    /api/wallet/balance           — Wallet balance
POST   /api/wallet/topup             — Initiate top-up
POST   /api/wallet/topup/verify      — Payment verification (webhook)
GET    /api/wallet/transactions      — Transaction history
POST   /api/purchases/course         — Purchase course
POST   /api/purchases/ebook          — Purchase e-book
```

### 9.4 E-Book Library (4 endpoints)
```
GET    /api/ebooks                   — Browse catalog
GET    /api/ebooks/:id               — E-book detail
GET    /api/ebooks/my-library        — User's purchased e-books
GET    /api/ebooks/:id/read          — Open e-book reader
```

### 9.5 MLM / Affiliate (7 endpoints)
```
GET    /api/mlm/referral-code        — Get/generate referral code
POST   /api/mlm/join                 — Join via referral
GET    /api/mlm/tree                 — View binary tree
GET    /api/mlm/earnings             — Earnings dashboard
GET    /api/mlm/team-stats           — Team volume & stats
POST   /api/mlm/payout-request       — Request payout
GET    /api/mlm/ranks                — Rank progression
```

### 9.6 Dashboard (3 endpoints)
```
GET    /api/dashboard/banners        — Active banners
GET    /api/dashboard/announcements  — Announcements
GET    /api/dashboard/featured       — Featured courses
```

### 9.7 Admin Panel (12+ endpoints)
```
CRUD   /api/admin/users              — User management
CRUD   /api/admin/content/*          — Content management
CRUD   /api/admin/ebooks             — E-book management
CRUD   /api/admin/banners            — Banner management
PUT    /api/admin/kyc/:id/verify     — KYC verification
GET    /api/admin/analytics/*        — Analytics & reports
PUT    /api/admin/mlm/payouts        — Payout processing
POST   /api/admin/content/bulk       — Bulk content upload
```

**Total: ~53 API endpoints**

---

## 10. Effort Estimation Summary

### 10.1 Module-wise Breakdown

| Module | Backend | Web Frontend | Mobile | Admin Panel | **Total** |
|--------|:-------:|:------------:|:------:|:-----------:|:---------:|
| Project Setup & Architecture | 8h | 4h | 4h | 2h | **18h** |
| Authentication & KYC | 10h | 6h | 6h | 4h | **26h** |
| Dashboard & Navigation | 6h | 8h | 6h | 4h | **24h** |
| Content Hierarchy (L1–L4) | 8h | 8h | 6h | 6h | **28h** |
| Learning Assets (L5–L6) | 10h | 12h | 8h | 6h | **36h** |
| Wallet & Payments | 10h | 6h | 6h | 4h | **26h** |
| E-Book Library | 8h | 8h | 6h | 4h | **26h** |
| Binary MLM Network | 12h | 8h | 6h | 4h | **30h** |
| Testing & QA | 4h | 4h | 4h | 2h | **14h** |
| Deployment & Docs | 4h | 2h | 2h | 2h | **10h** |
| **TOTAL** | **80h** | **66h** | **54h** | **38h** | **238h** |

### 10.2 Per-Developer Load

| Developer | Total Hours | Hours/Day (7 days) | Load Factor |
|-----------|:----------:|:-------------------:|:-----------:|
| Backend Senior | 80h (shared) | ~6.5h | 🟡 High |
| Backend Mid | 80h (shared) | ~6.5h | 🟡 High |
| Frontend Web | 66h | ~9.4h | 🔴 Very High |
| Mobile Developer | 54h | ~7.7h | 🟡 High |
| UI / Admin Developer | 38h | ~5.4h | 🟢 Manageable |
| QA / DevOps | 14h + support | ~4h | 🟢 Manageable |

> **Note:** 238 person-hours ÷ 6 developers ÷ 8 hrs/day = ~5 working days at 100% efficiency. With realistic overhead (meetings, code reviews, blockers), 7 days is the minimum with this team size.

---

## 11. Risk Assessment & Mitigation

| # | Risk | Impact | Probability | Mitigation Strategy |
|---|------|:------:|:-----------:|---------------------|
| 1 | Payment gateway integration delays (sandbox approval) | 🔴 High | Medium | Start Razorpay account setup before Day 1, use sandbox immediately |
| 2 | Video DRM/streaming complexity | 🟡 Medium | High | Use Vdocipher (pre-built DRM) instead of custom HLS pipeline |
| 3 | Binary MLM tree performance at scale | 🟡 Medium | Low | Adjacency list + materialized path, recursive CTEs, pagination |
| 4 | Mobile app build failures | 🟡 Medium | Medium | Maintain working build from Day 1, incremental feature additions |
| 5 | Scope creep mid-sprint | 🔴 High | High | Strict MVP scope lock — defer all non-critical features to Sprint 2 |
| 6 | No actual content (courses/videos) ready | 🟡 Medium | High | Prepare realistic demo content + seed scripts with placeholder videos |
| 7 | Team member unavailability | 🔴 High | Low | Cross-training on Day 1, documented APIs, modular architecture |
| 8 | Third-party API downtime (SMS, Payment) | 🟡 Medium | Low | Implement fallback mechanisms, mock services for development |

---

## 12. MVP Scope vs Deferred Features

### ✅ Included in MVP (This Sprint)

| Feature | Priority |
|---------|:--------:|
| User Registration & Login (Mobile + Password + OTP) | P0 |
| State Selection & Localized Content | P0 |
| 6 Main Category Navigation | P0 |
| Content Hierarchy Drill-down (all 6 levels) | P0 |
| Lesson Viewer & Notes Viewer | P0 |
| Video Player (DRM) | P0 |
| Basic MCQ Engine (single correct, instant scoring) | P0 |
| Wallet Top-up & Course Purchase | P0 |
| E-Book Store & Reader | P1 |
| Binary MLM Tree & Referral System | P1 |
| Basic Admin Panel (CRUD for all entities) | P0 |
| KYC Module | P1 |

### 🔲 Deferred to Sprint 2+ (Post-MVP)

| Feature | Estimated Sprint |
|---------|:----------------:|
| Push Notifications (FCM) | Sprint 2 |
| Offline Mode & Content Download (Mobile) | Sprint 2 |
| Advanced MCQ (timed tests, sections, negative marking) | Sprint 2 |
| Certificate Generation (course completion) | Sprint 3 |
| Discussion Forum / Community | Sprint 3 |
| Live Classes / Webinar Integration | Sprint 3 |
| Multi-language UI (Kannada, Hindi, etc.) | Sprint 4 |
| Advanced Analytics Dashboard | Sprint 4 |
| iOS App | Sprint 4 |
| Automated MLM Payout Processing | Sprint 3 |
| SEO Optimization | Sprint 2 |
| PWA Support | Sprint 2 |

---

## 13. Deliverables Checklist

| # | Deliverable | Format | Status |
|---|------------|--------|:------:|
| 1 | Web Application (Responsive) | Deployed on staging URL | ⬜ |
| 2 | Android APK (Debug + Release) | APK file + Play Store draft | ⬜ |
| 3 | Backend API Server | Deployed on staging with Swagger | ⬜ |
| 4 | Admin Panel | Deployed on staging URL | ⬜ |
| 5 | Database with Seed Data | PostgreSQL dump + migration scripts | ⬜ |
| 6 | API Documentation | Postman Collection + Swagger | ⬜ |
| 7 | Source Code Repositories | GitHub (4 repos) | ⬜ |
| 8 | Deployment Guide | Markdown document | ⬜ |
| 9 | Demo Video / Walkthrough | 5-minute screen recording | ⬜ |

---

## 14. Post-Sprint Roadmap (Weeks 2–8)

| Week | Focus Area | Key Deliverables |
|:----:|-----------|-----------------|
| 2 | Bug Fixes & Polish | User testing feedback, UI fixes, performance tuning |
| 3 | Notifications & Advanced MCQ | Push notifications, timed tests, MCQ analytics |
| 4 | Multi-language & Certificates | Kannada/Hindi UI, course completion certificates |
| 5 | Live Classes & Community | Webinar integration, discussion forums |
| 6 | Advanced Analytics & MLM | Dashboard analytics, automated MLM payouts |
| 7 | iOS & PWA | iOS app release, Progressive Web App |
| 8 | Security & Production | Security audit, load testing, production deployment |

---

## 15. Pre-Sprint Prerequisites

> **⚠️ These items MUST be completed BEFORE Day 1 (25 August) to avoid sprint delays:**

| # | Prerequisite | Owner | Deadline |
|---|-------------|-------|----------|
| 1 | Razorpay / Cashfree account creation + sandbox credentials | Project Manager | 24 Aug |
| 2 | AWS account with S3, EC2, RDS access provisioned | DevOps | 24 Aug |
| 3 | SMS Gateway (MSG91/Twilio) account for OTP service | Backend Lead | 24 Aug |
| 4 | Video hosting (Vdocipher) account for DRM streaming | Backend Lead | 24 Aug |
| 5 | GitHub organization + repositories created with branch rules | DevOps | 24 Aug |
| 6 | Domain name purchased + DNS configured | Project Manager | 24 Aug |
| 7 | Sample educational content prepared (2+ courses, 5+ chapters) | Content Team | 24 Aug |
| 8 | UI/UX wireframes reviewed and approved | Design Lead | 24 Aug |

---

## 16. Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Manager | | | |
| Technical Lead | | | |
| Development Team Lead | | | |
| Client / Stakeholder | | | |

---

<div align="center">

*This document is confidential and intended for internal project planning.*  
*All timelines assume dedicated full-time resources with no context switching.*

**© 2026 — E-Learning Platform Development Team**

</div>
