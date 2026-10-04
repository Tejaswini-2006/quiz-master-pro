# Quiz Master Pro

![Quiz Master Pro](https://img.shields.io/badge/Quiz%20Master-Pro-blueviolet?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwindcss)

A modern, responsive, full-featured web-based quiz application designed for test-takers, students, and educators. **Quiz Master Pro** offers an interactive, timed quiz experience with custom category and difficulty filtering, real-time question navigation, instant automatic score calculation, answer review breakdown, and historical progress tracking.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [How to Run](#how-to-run)
- [Build](#build)
- [Quiz Functionality](#quiz-functionality)
- [API Documentation](#api-documentation)
- [Database](#database)
- [Authentication](#authentication)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Future Improvements](#future-improvements)
- [Author](#author)
- [License](#license)

---

## Project Overview
**Quiz Master Pro** is a dynamic web application built with React, TypeScript, Vite, Tailwind CSS, and Supabase. Users can register/login or explore in Guest mode, customize their quiz parameters (Category, Difficulty, Time Duration), complete timed multiple-choice assessments with an interactive question grid, and review detailed diagnostic reports showing correct vs. incorrect answers.

## Problem Statement
Traditional online quiz tools are often rigid, lack offline capability or fallback mechanisms, suffer from poor user interfaces, fail to track detailed historical results per question, and provide inadequate feedback when learning new topics.

## Solution
Quiz Master Pro solves this by offering:
- **Resilient Multi-Layer Data**: Integrates seamlessly with Supabase backend with zero-friction fallback to an offline local question bank and LocalStorage caching.
- **Interactive Exam Suite**: Features a live countdown timer, question jumper navigator grid, category/difficulty filtering, and auto-submit upon expiration.
- **Diagnostic Score Analytics**: Generates instant pass/fail feedback, overall percentage scores, and question-by-question answer reviews detailing the correct answer versus the user's selected choice.
- **Guest & Authenticated Access**: Enables instant one-click Guest testing as well as full persistent email/password authentication.

---

## Features
- 🔐 **Authentication & Guest Mode**: Secure Supabase email/password login and one-click Guest access.
- 🎯 **Category & Difficulty Selection**: Filter questions by Web Development, Science, General Knowledge, History, or select All Categories.
- ⏱️ **Configurable Timer & Auto-Submit**: Choose 5, 10, or 15-minute exam durations with live visual countdown and auto-submission on timeout.
- 🗂️ **Interactive Question Grid**: Jump directly to any question and visually track answered vs. unanswered questions.
- 🧮 **Automatic Mathematical Scoring**: Accurate percentage calculations (`score = (correct / total) * 100`) with pass (≥60%) / fail badges.
- 📝 **Comprehensive Answer Review**: Detailed summary cards highlighting correct options (✓) vs. user choices (✗) and unanswered indicators.
- 📊 **Dashboard Stats & Historical Attempts**: Real-time stats showing total quizzes taken, best score, average score, and overall pass rate.
- 📱 **Responsive Glassmorphism UI**: Beautiful, accessible, mobile-first design system built with Radix UI and Tailwind CSS.

---

## Tech Stack
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool & Dev Server**: Vite 5
- **Styling & Design System**: Tailwind CSS 3, Lucide React icons, Radix UI primitive components
- **State & Data Management**: React Hooks, TanStack React Query v5
- **Backend & Database**: Supabase (PostgreSQL with Row Level Security, Auth Services)
- **Unit & Integration Testing**: Vitest, `@testing-library/react`
- **Routing**: React Router DOM v6

---

## Project Structure
```text
quiz-master-pro/
├── public/                 # Static assets and favicons
├── src/
│   ├── components/         # Reusable UI components (Button, Progress, Select, ProtectedRoute, etc.)
│   │   └── ui/             # Radix UI styled primitives
│   ├── contexts/           # AuthContext (Supabase Auth & Guest session state)
│   ├── data/               # Default question bank (questionsData.ts)
│   ├── hooks/              # Custom hooks (useToast, useMobile)
│   ├── integrations/       # Supabase client setup & TypeScript database types
│   ├── lib/                # Utility modules (quizUtils.ts, utils.ts)
│   ├── pages/              # Main application views
│   │   ├── Dashboard.tsx   # Quiz configuration, stats overview, recent results
│   │   ├── Quiz.tsx        # Active quiz arena, timer, question card & navigation grid
│   │   ├── Results.tsx     # Score breakdown, answer review diagnostics
│   │   ├── Login.tsx       # Sign in & Guest access
│   │   ├── Register.tsx    # User registration
│   │   └── NotFound.tsx   # 404 page
│   ├── test/               # Vitest unit test suites (quizUtils.test.ts, setup.ts)
│   ├── App.tsx             # Route definitions & global providers
│   ├── index.css           # Design tokens, Tailwind base & utility layers
│   └── main.tsx            # Application entry point
├── supabase/
│   └── migrations/         # PostgreSQL schema migration files (profiles, questions, quiz_results)
├── .env.example            # Environment variables template
├── eslint.config.js        # ESLint configuration
├── package.json            # Project dependencies & scripts
├── tailwind.config.ts      # Tailwind CSS theme extension
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
└── vitest.config.ts        # Vitest test runner configuration
```

---

## Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher (or `bun` / `pnpm` / `yarn`)

---

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Tejaswini-2006/quiz-master-pro.git
   cd quiz-master-pro
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

---

## Environment Variables
Copy `.env.example` to `.env` and fill in your Supabase credentials if using a live Supabase backend:

```bash
cp .env.example .env
```

`.env.example`:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-anon-key
```

> **Note**: Quiz Master Pro includes an automatic local fallback mechanism so you can run, test, and take quizzes even without a live Supabase server configured.

---

## How to Run

Start the local development server:
```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

---

## Build

To build the production-ready application bundle:
```bash
npm run build
```

To preview the built production bundle locally:
```bash
npm run preview
```

---

## Quiz Functionality

1. **Quiz Start & Parameter Selection**:
   - On the Dashboard, choose your preferred **Category** (e.g., Web Development, Science), **Difficulty** (Easy, Medium, Hard), and **Time Limit** (5, 10, 15 min).
   - Click **Start Quiz Now**.

2. **Question Arena & Navigation**:
   - Read the question and choose an option (A, B, C, D).
   - Use the **Question Navigator Grid** at the top to jump directly to any question or track answered items.
   - Use **Next** / **Previous** buttons to navigate through the quiz.

3. **Timer & Submission**:
   - The countdown timer displays remaining time in `MM:SS`. When less than 1 minute remains, the timer flashes as a reminder.
   - Click **Submit Quiz** or allow the timer to expire to trigger automatic grading.

4. **Results & Answer Review**:
   - View your overall score percentage, pass/fail status, correct count, wrong count, and completion time.
   - Review each question with visual indicators:
     - 🟢 **Correct Answer (✓)**: Highlighted in green.
     - 🔴 **Your Answer (✗)**: Highlighted in red if incorrect.
     - ⚠️ **Not Answered**: Flagged clearly if skipped.
   - Click **Retake Quiz** to try again or **Go to Dashboard** to view updated history.

---

## API Documentation

Quiz Master Pro communicates with Supabase Database tables via REST/PostgREST:

### `questions` Table
- `GET /rest/v1/questions`: Fetch available quiz questions.
- **Fields**: `id` (UUID), `question` (Text), `options` (JSONB array), `correct_answer` (Integer 0-indexed), `category` (Text), `difficulty` (Text).

### `quiz_results` Table
- `POST /rest/v1/quiz_results`: Insert completed quiz scores and user answer breakdown.
- `GET /rest/v1/quiz_results?user_id=eq.{user_id}`: Retrieve past attempts for the logged-in user.
- **Fields**: `id` (UUID), `user_id` (UUID), `score` (Integer), `total_questions` (Integer), `correct_count` (Integer), `wrong_count` (Integer), `answers` (JSONB array), `time_taken` (Integer seconds), `created_at` (Timestamp).

---

## Database

The PostgreSQL database schema and RLS (Row Level Security) policies are documented in `supabase/migrations/20260222172314_b8002d89-67eb-483e-aa41-f610c1f90e30.sql`:

Tables:
- `profiles`: Auto-created on user registration (`user_id`, `name`, `email`).
- `questions`: Stores public multiple-choice questions with options array.
- `quiz_results`: Stores historical attempts with full answer diagnostics.

---

## Authentication
Authentication is powered by Supabase Auth with standard password hashing and JWT sessions.
- **Email / Password**: User sign up (`signUp`) and sign in (`signInWithPassword`).
- **Guest Session**: Instant zero-config demo mode (`signInAsGuest`) using LocalStorage session state.

---

## Testing

Run unit tests using Vitest:
```bash
npm test
```

Watch mode for development:
```bash
npm run test:watch
```

---

## Troubleshooting

- **CSS `@import` Warning**: Resolved by placing `@import` font calls at the top of `src/index.css`.
- **Blank Quiz / Database Connection Issue**: Quiz Master Pro features built-in fallback questions in `src/data/questionsData.ts` so the application continues to function smoothly if Supabase connection is offline.
- **LocalStorage Data Clearing**: If you wish to reset local guest scores, clear `quiz_local_results` from your browser's Developer Tools -> Application -> Local Storage.

---

## Future Improvements
- 🏆 Global Leaderboard ranking high scorers across all categories.
- ➕ Admin Panel for creating, editing, and managing custom questions and categories.
- ⏱️ Per-question time tracking and speed bonuses.
- 📥 Export quiz score reports as downloadable PDF / CSV files.

---

## Author

**Tejaswini Rakhunde**
- GitHub: [@Tejaswini-2006](https://github.com/Tejaswini-2006)

---

## License

This project is licensed under the [MIT License](LICENSE).
