# Comprehensive Chronological Demo Walkthrough & System Guide
## Multi-Category Educational E-Learning Platform & Binary MLM System

**Document Version:** 2.0.0  
**Project Root Directory:** `/Users/apple/Desktop/shamshad/e learning`  
**Execution Order:** **PHASE 1: ADMIN** ➔ **PHASE 2: TEACHER** ➔ **PHASE 3: STUDENT & AFFILIATE**  

---

# 1. Executive Demo Flow Architecture

To demonstrate the full lifecycle of the platform in logical order, the demo is structured strictly sequentially:
1. **PHASE 1: SUPER ADMIN PORTAL** — Platform initialization, setting up 6 core categories, configuring standalone e-book pricing, processing KYC identity verification approvals, and executing binary MLM commission settlement cycles.
2. **PHASE 2: TEACHER / EDUCATOR PORTAL** — Course creation, configuring 365-day annual validity, creating questions in the MCQ bank with step-by-step explanations, uploading 5 learning asset formats, embedding DRM video classes, and tracking 70% instructor royalty share earnings.
3. **PHASE 3: STUDENT LEARNER & AFFILIATE PARTNER PORTAL** — Referral registration, state regional localization (Karnataka), KYC document photo submission, course exploration, taking timed MCQ quizzes, purchasing e-books via wallet, setting binary downline leg preferences (`AUTO`/`LEFT`/`RIGHT`), viewing depth-4 binary trees, and receiving 1:1 matching payouts.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                CHRONOLOGICAL DEMO EXECUTION FLOW                                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                 │
                                                 ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
 │ PHASE 1: SUPER ADMIN PORTAL                                                                    │
 ├────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ • Step A1: Platform System Dashboard & Global Metrics                                          │
 │ • Step A2: Category Taxonomy Setup (6 Verticals) & Standalone E-Book Pricing                   │
 │ • Step A3: Student Aadhaar & PAN KYC Approval Queue Processing                                 │
 │ • Step A4: Binary MLM Payout Settlement Execution (10% Match, ₹25k Capping, 5% Admin+5% TDS)   │
 └────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                 │
                                                 ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
 │ PHASE 2: TEACHER / EDUCATOR PORTAL                                                             │
 ├────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ • Step B1: Educator Analytics Dashboard & 70% Royalty Share Tracking                           │
 │ • Step B2: Publishing Course Batches (State Code KA, 365-Day Validity, Price ₹1,499)           │
 │ • Step B3: Content Authoring — 5 Asset Formats (Lessons, Notes, MCQs, Attachments, DRM Video)  │
 │ • Step B4: Student Quiz Attempt Analytics & Royalty Payout Withdrawal Request                  │
 └────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                 │
                                                 ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
 │ PHASE 3: STUDENT LEARNER & AFFILIATE PARTNER PORTAL                                            │
 ├────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ • Step C1: Student Signup via Referral Link (EDU-99201) & State Localization (KA)              │
 │ • Step C2: KYC Document Camera/Gallery Photo Scan Submission                                   │
 │ • Step C3: Learning Asset Experience (Interactive MCQ Quizzes & Instant Solutions)             │
 │ • Step C4: Standalone E-Book Store Wallet Purchase & Instant PDF Unlocking                     │
 │ • Step C5: Binary MLM Downline Visualizer, Leg Preference Switcher (AUTO/LEFT/RIGHT), Share    │
 │ • Step C6: Wallet Payout Credit Receipt & Carry-Forward Volume Roll-over                       │
 └────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

# 2. Detailed Scenario Walkthroughs

---

## PHASE 1: SUPER ADMIN PORTAL DEMO WALKTHROUGH

### Scenario A1: Admin Login & System Overview Dashboard
- **Actor:** Super Admin Operator
- **Access Route:** Web Portal (`/admin`) or API Endpoint (`POST /api/auth/login`)
- **Demo Steps:**
  1. Open Admin Panel at `http://localhost:3000/admin`.
  2. Log in using Admin Credentials (`admin@eduverse.in` / `Admin@123`).
  3. **Dashboard Inspection:** Admin views real-time metrics across total registered users, active course subscriptions, pending KYC verification queue, wallet ledgers, and binary network point volume (PV).

---

### Scenario A2: Category Taxonomy & Standalone E-Book Store Management
- **Actor:** Super Admin Operator
- **Demo Steps:**
  1. **6 Core Verticals Verification:** Inspect the 6 core educational category models:
     - *I. School Education (Class 1 to 12)*
     - *II. School Entrance & Competitive Exams*
     - *III. Higher Education (UG & PG)*
     - *IV. State Government Jobs Prep*
     - *V. Central Government Jobs Prep*
     - *VI. Teacher Preparation & Certifications*
  2. **E-Book Pricing Engine Configuration:** Set standalone pricing for digital books outside course bundles:
     - *KAS Preparation Handbook* ➔ ₹50 (Original ₹299)
     - *Indian Constitution & Polity* ➔ ₹100 (Original ₹499)
     - *Class 10 Physics Mind Maps* ➔ ₹149 (Original ₹299)

---

### Scenario A3: KYC Verification Queue Approval
- **Actor:** Super Admin Operator
- **Demo Steps:**
  1. Navigate to **"KYC Approval Queue"** tab.
  2. Review submitted student identification records:
     - Student: Rohan Sharma (`9876543210`)
     - Document Type: **Aadhaar Card** (`9900 1234 5678`)
     - Document Attachment: Scanned photo upload.
  3. Click **"✅ Approve KYC Verification"**.
  4. Status in database updates from `PENDING` to `VERIFIED`. Rohan is now cleared for full wallet payouts and course activations.

---

### Scenario A4: Binary MLM Payout Settlement Execution
- **Actor:** Super Admin Operator
- **Demo Steps:**
  1. Navigate to **"Binary MLM Settlement Engine"**.
  2. Click **"⚡ Execute Batch Payout Settlement Cycle"**.
  3. System executes financial payout algorithm for all binary nodes:
     - **Matching Volume:** Calculates 1:1 pair match on weaker leg PV.
     - **Matching Rate:** Calculates 10% Gross Bonus.
     - **Capping Protection Guard:** Enforces maximum **₹25,000 / day** limit per node.
     - **Statutory Deductions:** Deducts **5% Admin Fee** + **5% TDS Tax Deduction**.
     - **Wallet Credit:** Credits net payout to user's wallet.
     - **Carry Forward:** Flushes matched PV and rolls over remaining surplus PV on stronger leg indefinitely.

---

## PHASE 2: TEACHER / EDUCATOR PORTAL DEMO WALKTHROUGH

### Scenario B1: Instructor Login & Analytics Dashboard
- **Actor:** Educator / Teacher ("Prof. Ananya Sen")
- **Access Route:** Web Portal (`/teacher`)
- **Demo Steps:**
  1. Log in with Teacher credentials (`teacher@eduverse.in`).
  2. View **Educator Dashboard**:
     - Published Active Courses: 4
     - Total Enrolled Students: 1,420
     - 70% Royalty Share Earnings Balance: ₹34,500.00

---

### Scenario B2: Publishing New Course Batches
- **Actor:** Educator / Teacher
- **Demo Steps:**
  1. Click **"+ Publish New Course Batch"**.
  2. **Fill Form Data:**
     - **Title:** CBSE Class 10 Master Course (Science & Maths)
     - **Category:** I. School Education (Class 1 to 12)
     - **State Code:** `KA` (Karnataka)
     - **Board / Grade:** CBSE Class 10th
     - **Price:** ₹1,499 (Original ₹3,999)
     - **Subscription Validity:** 365 Days (1 Year)
     - **Thumbnail:** Upload 2MB course banner photo.
  3. Click **"Publish Course Batch"** ➔ Course instantly listed in student catalog.

---

### Scenario B3: Authoring 5 Primary Learning Asset Formats
- **Actor:** Educator / Teacher
- **Demo Steps:**
  1. Open Chapter 1 ("Light: Reflection & Refraction").
  2. Add assets for all 5 primary formats:
     - **Asset 1 (Lessons):** Write structured text reading notes on reflection laws and lens formulas.
     - **Asset 2 (Notes):** Attach downloadable PDF summary notes.
     - **Asset 3 (MCQ Question Bank):** Create 4-option MCQ questions:
       - *Question:* "The focal length of a spherical mirror of radius of curvature 30 cm is:"
       - *Options:* A) 30 cm | B) 15 cm | C) 60 cm | D) 7.5 cm
       - *Correct Option:* B (Index 1)
       - *Detailed Solution Explanation:* $f = R/2 = 30/2 = 15\text{ cm}$.
     - **Asset 4 (Attachments):** Attach ray diagram worksheet PDF.
     - **Asset 5 (DRM Video):** Add live Zoom/Webex meeting URL and DRM lecture video stream link.

---

### Scenario B4: Reviewing Quiz Performance & Royalty Withdrawal
- **Actor:** Educator / Teacher
- **Demo Steps:**
  1. Navigate to **"Student Quiz Attempts"** tab ➔ Review Rohan Sharma's score ($80\%$).
  2. Navigate to **"Wallet & Payouts"** ➔ Click **"Request Royalty Payout Withdrawal"** (₹10,000) to submit request to Super Admin.

---

## PHASE 3: STUDENT & AFFILIATE PARTNER DEMO WALKTHROUGH

### Scenario C1: Student Signup with Referral Link & State Localization
- **Actor:** Student Learner ("Rohan Sharma")
- **Demo Steps:**
  1. Open registration URL: `http://localhost:3000/register?ref=EDU-99201` (Sponsor: Shamshad).
  2. Fill Name ("Rohan Sharma"), Mobile (`9876543210`), Select State **"Karnataka (KA)"**, Password (`Student@123`).
  3. Click **"Register Account"**:
     - System registers Rohan.
     - System places Rohan into Shamshad's binary MLM downline tree.
  4. Dashboard opens displaying state-localized hero banners: *"Tailored Learning for Karnataka Students & Aspirants"*.

---

### Scenario C2: Student KYC Document Photo Submission
- **Actor:** Student Learner
- **Demo Steps:**
  1. Open KYC Verification tab on Mobile App.
  2. Select **"Aadhaar Card"** ➔ Input `9900 1234 5678`.
  3. Tap **"📷 Pick Document Image"** ➔ Select Aadhaar photo scan from mobile gallery.
  4. Submit ➔ Status changes to `PENDING APPROVAL` (Approved by Admin in Scenario A3).

---

### Scenario C3: Learning Asset Experience & Interactive MCQ Quiz
- **Actor:** Student Learner
- **Demo Steps:**
  1. Open **"CBSE Class 10 Master Course"** published by Prof. Ananya Sen in Scenario B2.
  2. Open Chapter 1 ("Light: Reflection & Refraction"):
     - Read **Lesson Text Notes**.
     - Download **PDF Revision Notes**.
     - Launch **Interactive MCQ Quiz**: Answer 5 questions with timer ➔ Submit ➔ Real-time score ($80\%$) + instant step-by-step mathematical explanations ($f = R/2 = 15\text{ cm}$).
     - Play **DRM Video Lecture** with speed control ($1.25\times$).

---

### Scenario C4: Standalone E-Book Store Purchase via Wallet
- **Actor:** Student Learner
- **Demo Steps:**
  1. Open **"Wallet & E-Book Store"**.
  2. Select *Mastering Indian Polity & Constitution* (₹199).
  3. Click **"Buy E-Book for ₹199"**:
     - Wallet balance debited by ₹199 (Balance: ₹2,301).
     - Transaction ledger logs `DEBIT` record (`TXN-EB9021`).
     - E-book unlocked ➔ **"Read PDF Reader"** mode activated.

---

### Scenario C5: Binary MLM Downline Visualizer & Leg Placement Control
- **Actor:** Affiliate Partner ("Shamshad" - `EDU-99201`)
- **Demo Steps:**
  1. Log in as Shamshad ➔ Open **"Binary MLM Network"**.
  2. View **Depth-4 Binary Tree Visualizer**:
     - Root: Shamshad (Diamond)
     - Left Leg: Rahul Sharma (Gold, L: 2200 PV, R: 2300 PV)
     - Right Leg: Kavita Singh (Gold, L: 1900 PV, R: 1900 PV)
  3. Set **Placement Leg Preference**: Click **"👈 Left Leg"** or **"⚖️ Auto"**.
  4. Share Referral Link: Tap **"📋 Copy Link"** or **"📲 Share Link"** on mobile app.

---

### Scenario C6: Binary Payout Receipt & Carry-Forward Calculation
- **Actor:** Affiliate Partner ("Shamshad")
- **Parameters:** Left Leg = 12,500 PV | Right Leg = 9,800 PV
- **Calculations:**
  1. **Matched PV:** $\min(12,500, 9,800) = \mathbf{9,800 \text{ PV}}$
  2. **Gross 10% Bonus:** $9,800 \text{ PV} \times 10\% = \mathbf{₹980.00}$
  3. **Daily Capping Guard:** $₹980.00 \le ₹25,000 \implies \mathbf{₹980.00}$
  4. **Deductions:** $5\%\text{ Admin (₹49)} + 5\%\text{ TDS (₹49)} = \mathbf{₹98.00}$
  5. **Net Wallet Payout:** $₹980.00 - ₹98.00 = \mathbf{₹882.00}$
  6. **Carry Forward:** Left Leg = $\mathbf{2,700 \text{ PV}}$ | Right Leg = $\mathbf{0 \text{ PV}}$
- **Result:** Net payout of **₹882.00** credited to Shamshad's wallet following Admin Settlement Execution in Scenario A4.

---

# 3. Role Sequence Verification Matrix

| Execution Sequence | Persona Role | Key Actions & Functions Demonstrated | Status |
| :--- | :--- | :--- | :--- |
| **PHASE 1 (1st)** | **SUPER ADMIN** | Dashboard, 6 Categories Setup, E-Book Pricing, KYC Approvals, Binary MLM Payout Settlement Execution | ✅ **VERIFIED & IMPLEMENTED** |
| **PHASE 2 (2nd)** | **TEACHER** | Educator Dashboard, Publishing 365-Day Courses (State KA, ₹1,499), Authoring 5 Asset Formats, MCQ Bank, DRM Video | ✅ **VERIFIED & IMPLEMENTED** |
| **PHASE 3 (3rd)** | **STUDENT & AFFILIATE** | Referral Registration, State Localization (KA), KYC Document Scan, Timed MCQ Quiz, E-Book Purchase, Binary Tree Visualizer, Payout Receipt | ✅ **VERIFIED & IMPLEMENTED** |

---
**Document Approved By:** Product & Technical Operations Team  
**System Status:** Order Strictly Verified (Admin ➔ Teacher ➔ Student)
