# Comprehensive UAT Test Cases & Requirement Traceability Matrix
## E-Learning Platform & Binary MLM System

**Document Version:** 1.0.0  
**Project Root Directory:** `/Users/apple/Desktop/shamshad/e learning`  
**Scope:** Web Application (`/client`), Mobile Android App (`/app`), and REST API Server (`/server`)  

---

# 1. UAT Strategy & Execution Framework

## 1.1 Objective
This User Acceptance Testing (UAT) suite ensures that all functional, visual, structural, and financial business requirements defined in the E-Learning & Binary MLM Specification are fully verified before production deployment.

## 1.2 Testing Environment Setup
- **Web Client:** Vite React + TypeScript (`http://localhost:3000`)
- **API Backend:** Node.js Express (`http://localhost:5000`)
- **Database:** MongoDB (`mongodb://localhost:27017/elearning_db`)
- **Mobile Android App:** React Native Android Emulator / Physical Device (`RZCY900D0JT`)

---

# 2. End-to-End UAT Test Case Matrix

## Suite 1: Authentication, Localization & User Management

### TC-AUTH-01: Student Registration with Referral Sponsor Code
- **Feature Area:** User Management & Binary Placement
- **Requirement Ref:** Section 3.1 & Section 4.1
- **Pre-conditions:** Backend server running; valid referral code available (e.g. `EDU-99201`).
- **Test Steps:**
  1. Open Signup page (`/register?ref=EDU-99201`).
  2. Enter Full Name ("Amit Verma"), Mobile Number ("9876500001"), State ("Karnataka"), and Password ("Password@123").
  3. Click **"Register Account"**.
- **Expected Outcome:** User registered successfully; JWT token generated; new user automatically placed in sponsor's binary MLM tree under selected leg preference (`AUTO`/`LEFT`/`RIGHT`).
- **Pass/Fail Criteria:** HTTP 201 response; user record created in MongoDB; `MLMNode` created with valid `parent` and `sponsor` fields.

### TC-AUTH-02: User Login via Mobile / User ID / Name
- **Feature Area:** Authentication
- **Requirement Ref:** Section 3.1
- **Pre-conditions:** Account created in TC-AUTH-01.
- **Test Steps:**
  1. Navigate to `/login`.
  2. Input Mobile Number (`9876500001`) or User ID (`EDU-99201`) and Password.
  3. Submit login form.
- **Expected Outcome:** Successful authentication; token saved to `localStorage` / SecureStore; redirected to main dashboard.
- **Pass/Fail Criteria:** User profile loaded with correct state localization and wallet balance.

### TC-AUTH-03: Regional State Localization Switching
- **Feature Area:** Localization
- **Requirement Ref:** Section 3.1 & Section 3.2
- **Pre-conditions:** Logged in as student.
- **Test Steps:**
  1. Click **"Change State Preference"** in header banner.
  2. Select state option (e.g., "Karnataka (KA)" or "Delhi NCR (DL)").
  3. Confirm selection.
- **Expected Outcome:** Dashboard dynamically updates hero banners, student count (e.g., "1.2 Lakh+ enrolled in Karnataka"), state-specific board courses (SSLC / KAS prep).
- **Pass/Fail Criteria:** State badge updates instantly; course listings reflect selected state code.

### TC-AUTH-04: 1-Year Course Subscription Validity Enforcement
- **Feature Area:** Subscription Management
- **Requirement Ref:** Section 3.1
- **Pre-conditions:** Student enrolling in course batch.
- **Test Steps:**
  1. Purchase annual pass for "CBSE Class 10 Master Course".
  2. Inspect purchase record in MongoDB database (`purchases` collection).
- **Expected Outcome:** `validUntil` timestamp set to exactly **365 days** from purchase date (`Date.now() + 365 * 24 * 60 * 60 * 1000`).
- **Pass/Fail Criteria:** Course status active for 1 full year.

---

## Suite 2: KYC Identity Verification & Upload Module

### TC-KYC-01: Aadhaar Card Number Format Validation
- **Feature Area:** KYC Module
- **Requirement Ref:** Section 3.1
- **Pre-conditions:** Student logged in; navigating to KYC tab.
- **Test Steps:**
  1. Select Document Type: **Aadhaar Card**.
  2. Enter invalid Aadhaar number (e.g. `1234-ABCD`).
  3. Click **"Submit KYC"**.
- **Expected Outcome:** Validation error displayed: *"Invalid Aadhaar Card Number! Must be exactly 12 numeric digits."* Form submission blocked.
- **Pass/Fail Criteria:** Regex validation blocks non-12-digit numeric input.

### TC-KYC-02: PAN Card Format Validation
- **Feature Area:** KYC Module
- **Requirement Ref:** Section 3.1
- **Pre-conditions:** Student logged in.
- **Test Steps:**
  1. Select Document Type: **PAN Card**.
  2. Enter invalid PAN number (e.g. `12345ABCDE`).
  3. Click **"Submit KYC"**.
- **Expected Outcome:** Validation error displayed: *"Invalid PAN Card Number! Format must be 5 Letters + 4 Digits + 1 Letter."*
- **Pass/Fail Criteria:** Regex `^[A-Z]{5}[0-9]{4}[A-Z]{1}$` strictly enforced.

### TC-KYC-03: Mobile Camera/Gallery Document Image Upload
- **Feature Area:** KYC Module & Native Mobile App
- **Requirement Ref:** Section 3.1
- **Pre-conditions:** Mobile app running on device/emulator.
- **Test Steps:**
  1. Enter valid Aadhaar (`9900 1234 5678`).
  2. Click **"📷 Pick Document Image"**.
  3. Select photo from device image gallery.
  4. Submit KYC request.
- **Expected Outcome:** Image uploaded to Cloudinary/server storage; status updated to `PENDING` approval.
- **Pass/Fail Criteria:** KYC record saved in backend with `documentImage` URL and `PENDING` state.

---

## Suite 3: 6 Core Educational Verticals & Content Drilldown

### TC-EDU-01: Vertical 1 — School Education (K-12) Navigation
- **Feature Area:** Content Hierarchy
- **Requirement Ref:** Section 2 (Module I)
- **Test Steps:** Click **"School Education (K-12)"** card -> Verify State Board, CBSE, ICSE, PUC (+1/+2 Arts/Commerce/Science) categories.
- **Expected Outcome:** Displays all 24 K-12 courses with grade levels and subjects.

### TC-EDU-02: Vertical 2 — School Entrance & Competitive Exams
- **Feature Area:** Content Hierarchy
- **Requirement Ref:** Section 2 (Module II)
- **Test Steps:** Select **"School Entrance & Competitive"** -> Verify Navodaya Entrance, NTS, G-MAT, NET, NEET, JEE batches.
- **Expected Outcome:** Displays NEET & JEE ultimate crash course packages with 5000+ MCQs.

### TC-EDU-03: Vertical 3 — Higher Education (UG & PG)
- **Feature Area:** Content Hierarchy
- **Requirement Ref:** Section 2 (Module III)
- **Test Steps:** Click **"Higher Education (UG & PG)"** -> Verify M.A, M.Com, M.Sc, MBA, Custom degree modules.
- **Expected Outcome:** Displays degree courses with subject credits and chapter notes.

### TC-EDU-04: Vertical 4 — State Government Jobs Preparation
- **Feature Area:** Content Hierarchy
- **Requirement Ref:** Section 2 (Module IV)
- **Test Steps:** Select **"State Government Jobs Prep"** -> Verify SDA, FDA, GPT (Primary Teacher), KAS Officer prep.
- **Expected Outcome:** Displays KAS Officer General Studies & solved question archives.

### TC-EDU-05: Vertical 5 — Central Government Jobs Preparation
- **Feature Area:** Content Hierarchy
- **Requirement Ref:** Section 2 (Module V)
- **Test Steps:** Select **"Central Government Jobs Prep"** -> Verify Banking (IBPS/SBI), Railway RRB, IAS / Civil Services.
- **Expected Outcome:** Displays IBPS PO, RRB NTPC, and UPSC GS Paper I & II prep batches.

### TC-EDU-06: Vertical 6 — Teacher Preparation & Certifications
- **Feature Area:** Content Hierarchy
- **Requirement Ref:** Section 2 (Module VI)
- **Test Steps:** Select **"Teacher Prep & Certifications"** -> Verify B.Ed, M.Ed, State TET, CTET Paper 1 & 2.
- **Expected Outcome:** Displays teaching methodology, child pedagogy, and solved TET mock tests.

---

## Suite 4: 5 Primary Learning Asset Formats

### TC-ASSET-01: Format 1 — Text Reading Lessons
- **Test Steps:** Open Chapter 1 ("Light: Reflection & Refraction") -> Click **"Lesson Notes"**.
- **Expected Outcome:** Displays formatted reading material and key conceptual rules.

### TC-ASSET-02: Format 2 — Downloadable Notes (PDF)
- **Test Steps:** Click **"PDF Summary Notes"** icon in chapter breakdown.
- **Expected Outcome:** Opens downloadable PDF viewer window.

### TC-ASSET-03: Format 3 — Interactive MCQ Quiz Engine
- **Test Steps:**
  1. Click **"Test MCQs"**.
  2. Answer 5 questions with options (A, B, C, D).
  3. Submit Quiz.
- **Expected Outcome:** Real-time score summary (e.g., 4/5 - 80%), timer breakdown, and instant step-by-step explanations for each question.

### TC-ASSET-04: Format 4 — Supplementary PDF Attachments
- **Test Steps:** Open attachments tab -> View worksheet download link.
- **Expected Outcome:** PDF lab worksheet accessible for offline revision.

### TC-ASSET-05: Format 5 — DRM Video Lectures
- **Test Steps:** Click **"Play Video Class"** button.
- **Expected Outcome:** Video player launches with playback speed controls (1.0x, 1.25x, 1.5x) and DRM stream verification.

---

## Suite 5: Standalone E-Book Store & Instant Delivery

### TC-EBOOK-01: Standalone E-Book Catalog Browsing
- **Test Steps:** Navigate to E-Book Store -> Verify books: *KAS Prep Handbook (₹50)*, *Indian Constitution (₹100)*.
- **Expected Outcome:** Catalog displays book title, cover, author, rating, page count, and standalone price without requiring full course subscription.

### TC-EBOOK-02: E-Book Wallet Purchase & Instant Unlocking
- **Test Steps:**
  1. Click **"Buy E-Book for ₹199"** on *Indian Polity Handbook*.
  2. Confirm wallet debit.
- **Expected Outcome:** Wallet balance deducted by ₹199; transaction logged; book status instantly changes to `"PURCHASED"`; **"Read PDF"** button unlocked.

---

## Suite 6: In-App Wallet & UPI Payment Engine

### TC-WLT-01: Wallet Balance & Ledger Display
- **Test Steps:** Open Wallet tab -> Review Current Balance & Recent Transactions.
- **Expected Outcome:** Displays formatted INR balance and credit/debit list with reference IDs.

### TC-WLT-02: Razorpay UPI Wallet Top-Up
- **Test Steps:** Click **"+ Top-Up Wallet"** -> Enter amount (`₹2,500`) -> Confirm payment.
- **Expected Outcome:** Wallet balance increases by ₹2,500; `CREDIT` transaction created in database.

---

## Suite 7: Binary MLM Network Topology & Placement Engine

### TC-MLM-01: Two-Leg Binary Tree Visualization (Depth 4)
- **Test Steps:** Navigate to **"Affiliate Downline Tree"** on Web Portal.
- **Expected Outcome:** Visual hierarchical binary tree renders Root node, Left Leg node (L1), Right Leg node (R1), and Level-2 sub-nodes (L-L, L-R, R-L, R-R) with rank badges and PV metrics.

### TC-MLM-02: Downline Leg Placement Preference Selector (`AUTO`/`LEFT`/`RIGHT`)
- **Test Steps:**
  1. Select placement preference **"LEFT"**.
  2. Register a new user using referral link.
- **Expected Outcome:** New user automatically placed at extreme left vacant spot in binary tree.

### TC-MLM-03: Auto-Balance Placement Algorithm
- **Test Steps:** Set placement preference to **"AUTO"** -> Register new user.
- **Expected Outcome:** System evaluates left leg volume vs right leg volume and places new user in the weaker volume leg.

---

## Suite 8: Binary Volume Matching, Payout Capping & Deductions Engine

### TC-COMM-01: 1:1 Matched Volume & 10% Weaker Leg Payout
- **Pre-conditions:** Left Leg PV = 12,500; Right Leg PV = 9,800.
- **Test Steps:** Trigger payout preview / stats API (`GET /api/mlm/stats`).
- **Expected Outcome:**
  - Matched Volume = `min(12,500, 9,800) = 9,800 PV`
  - Gross Bonus (10%) = `₹980.00`

### TC-COMM-02: Carry Forward Volume Calculation
- **Test Steps:** Inspect carry forward values after 9,800 PV matching.
- **Expected Outcome:**
  - Carried Left PV After = `12,500 - 9,800 = 2,700 PV`
  - Carried Right PV After = `9,800 - 9,800 = 0 PV`

### TC-COMM-03: Daily Capping Protection Guard (₹25,000)
- **Pre-conditions:** Matched Volume = 300,000 PV (Gross Bonus = ₹30,000).
- **Test Steps:** Run payout calculation engine.
- **Expected Outcome:** Capped Gross Bonus capped at maximum **₹25,000** limit; `isCapped: true`.

### TC-COMM-04: Mandatory Deductions (5% Admin + 5% TDS)
- **Pre-conditions:** Capped Gross Bonus = ₹25,000.
- **Test Steps:** Verify net payout breakdown.
- **Expected Outcome:**
  - Admin Fee (5%) = `₹1,250.00`
  - TDS Deduction (5%) = `₹1,250.00`
  - Net Payable Payout = `₹25,000 - ₹2,500 = ₹22,500.00`

---

## Suite 9: Native Mobile Experience & 1-Click Referral Share

### TC-MOB-01: Dual Theme System (Light / Dark Mode Toggle)
- **Test Steps:** Open Mobile App -> Tap **"☀️ Light" / "🌙 Dark"** toggle button.
- **Expected Outcome:** App theme seamlessly switches background, text, card borders, and metrics colors without layout glitch.

### TC-MOB-02: 1-Click Clipboard Link Copy
- **Test Steps:** Tap **"📋 Copy Link"** in MLM tab.
- **Expected Outcome:** Copies referral link (`http://<ip>:3000/register?ref=EDU-99201`) to device clipboard; displays alert toast.

### TC-MOB-03: OS Native Share Sheet Integration
- **Test Steps:** Tap **"📲 Share Link"** on Android device.
- **Expected Outcome:** Opens Android native share sheet allowing 1-click sharing to WhatsApp, Telegram, SMS, and Email.

---

## Suite 10: Admin Panel & Settlement Execution Engine

### TC-ADM-01: Batch Binary MLM Payout Settlement Cycle
- **Test Steps:** Log in as Super Admin -> Click **"⚡ Run Payout Settlement"**.
- **Expected Outcome:** Executes settlement for all accounts with matched PV; credits net payouts to user wallets; updates carry-forward volumes; logs transaction and `MlmPayout` audit records.

---

# 3. Requirement Traceability Matrix (RTM)

| Requirement Description | Specification Ref | Primary Code Module | Verifying UAT Test Case IDs |
| :--- | :--- | :--- | :--- |
| **User Login & Registration** | Sec 3.1 | `authController.js`, `AuthScreen.tsx` | TC-AUTH-01, TC-AUTH-02 |
| **State Regional Localization** | Sec 3.1 | `StatePickerModal.tsx`, `State.js` | TC-AUTH-03 |
| **Aadhaar & PAN KYC Scanner** | Sec 3.1 | `kycController.js`, `StudentHomeScreen.tsx` | TC-KYC-01, TC-KYC-02, TC-KYC-03 |
| **1-Year Subscription Period** | Sec 3.1 | `Purchase.js`, `purchaseController.js` | TC-AUTH-04 |
| **6 Core Verticals Taxonomy** | Sec 2 | `ContentHierarchy.tsx`, `mockData.ts` | TC-EDU-01 to TC-EDU-06 |
| **5 Primary Asset Formats** | Sec 3.3 | `LearningAsset.js`, `McqQuizEngine.tsx` | TC-ASSET-01 to TC-ASSET-05 |
| **Standalone E-Book Store** | Sec 3.4 | `ebookController.js`, `WalletEbookStore.tsx` | TC-EBOOK-01, TC-EBOOK-02 |
| **In-App Digital Wallet** | Sec 3.5 | `walletController.js`, `Wallet.js` | TC-WLT-01, TC-WLT-02 |
| **Two-Leg Binary Tree Topology** | Sec 4.1 | `MLMNode.js`, `MlmTreeVisualizer.tsx` | TC-MLM-01, TC-MLM-02, TC-MLM-03 |
| **1:1 Pair Match & 10% Bonus** | Sec 4.2 | `mlmController.js`, `mlmService.js` | TC-COMM-01 |
| **Carry Forward PV Roll-over** | Sec 4.2 | `mlmController.js`, `MLMNode.js` | TC-COMM-02 |
| **₹25,000 Daily Capping Guard** | Sec 4.3 | `mlmController.js`, `MlmPayout.js` | TC-COMM-03 |
| **5% Admin + 5% TDS Deductions**| Sec 4.3 | `mlmController.js`, `AdminPanel.tsx` | TC-COMM-04 |
| **Mobile Dual Theme & Share** | Sec 1.2 | `StudentHomeScreen.tsx` | TC-MOB-01, TC-MOB-02, TC-MOB-03 |
| **Admin Settlement Engine** | Sec 3.5 | `mlmController.js` | TC-ADM-01 |

---
**Approval Signature:** ___________________________ (Lead QA Architect)  
**Date of Execution:** 04 / September / 2026
