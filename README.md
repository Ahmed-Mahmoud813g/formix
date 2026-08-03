# Formix — AI-Powered Form Generation SaaS Platform

<div align="center">

![Formix Banner](https://img.shields.io/badge/Formix-AI%20SaaS-2563EB?style=for-the-badge&logo=sparkles&logoColor=white)
![Next.js 14](https://img.shields.io/badge/Next.js%2014-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Gemini 2.0](https://img.shields.io/badge/Google%20Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

</div>

---

## 🚀 Overview

**Formix** is an AI-first SaaS platform that transforms natural language prompts into complete, professional form schemas in seconds. Users can refine forms using conversational AI instructions, customize themes and fields, publish with single-click public URLs and embed codes, collect responses, and analyze detailed response analytics.

Developed by **Ahmed Mahmoud Khalil**.

---

## ✨ Features

- **⚡ Instant AI Form Generation:** Powered by Google Gemini 2.0 Flash with automatic OpenAI GPT-4o-mini fallback.
- **🪄 Conversational AI Editing:** Modify existing forms on the fly ("Make all fields required", "Translate to Arabic", etc.).
- **🎨 Interactive Form Builder:** Drag-and-drop section/field management, validation controls, and theme customizer.
- **🌐 One-Click Publishing:** Generates clean public links (`/f/[slug]`) and responsive `<iframe>` embed codes.
- **📊 Real-time Response Analytics:** Instant metrics on views, submissions, completion rates, field frequency charts, and CSV exports.
- **💳 Wallet-based Subscriptions:** Tiered pricing (Free / Pro 80 EGP / Max 150 EGP) with manual wallet payment flow.
- **🛡️ Admin Panel:** Platform-wide monitoring, user management, and subscription approval/rejection dashboard.
- **🔐 Secure Authentication:** JWT dual-token architecture (httpOnly cookies) with OTP verification logic.

---

## 🛠️ Monorepo Architecture

```
formix/
├── apps/
│   ├── web/                     # Next.js 14 Frontend (App Router, Tailwind CSS, Framer Motion)
│   └── api/                     # FastAPI Backend (Python 3.11+, SQLAlchemy Async, Alembic)
├── packages/
│   └── shared/                  # Shared TypeScript interfaces & types
├── docker-compose.yml           # Local PostgreSQL + Redis development environment
└── README.md
```

---

## 🏁 Quick Start

### 1. Prerequisites
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose (or local PostgreSQL 15 & Redis)

### 2. Infrastructure Setup
```bash
docker-compose up -d
```

### 3. Backend Setup
```bash
cd apps/api
python -m venv .venv
# On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 4. Frontend Setup
```bash
cd apps/web
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) for the Next.js Web App and [http://localhost:8000/docs](http://localhost:8000/docs) for the FastAPI Swagger API Explorer.

---

## 📄 License

MIT License © 2026 Ahmed Mahmoud Khalil.
