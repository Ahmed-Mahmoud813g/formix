# Formix — AI-Powered Form Generation SaaS Platform 🚀

![Formix Banner](https://img.shields.io/badge/Formix-AI--First%20Form%20Builder-2563EB?style=for-the-badge)
![Next.js 14](https://img.shields.io/badge/Next.js-14%20(App%20Router)-black?style=flat-square&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688?style=flat-square&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)
![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini%201.5-8E44AD?style=flat-square)

Formix is an AI-first SaaS form builder. Users describe a form in plain language → Formix generates a complete, professional form in seconds → users can edit with AI, publish, collect responses, and analyze results with real-time analytics.

---

## 🏗️ Architecture Overview

Monorepo layout:

```text
formix/
├── apps/
│   ├── web/          # Next.js 14 App Router + Tailwind CSS + Framer Motion
│   └── api/          # FastAPI async backend + SQLAlchemy + Asyncpg + Alembic
├── packages/
│   └── shared/       # Shared TypeScript interfaces & schemas
├── docker-compose.yml
└── README.md
```

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose (or local PostgreSQL 15 & Redis)

### 2. Database & Redis Setup
```bash
docker-compose up -d
```

### 3. Backend Setup (`apps/api`)
```bash
cd apps/api
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```
- API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

### 4. Frontend Setup (`apps/web`)
```bash
cd apps/web
npm install
cp .env.example .env.local
npm run dev
```
- App: [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Stack & Technologies

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Lucide React, CVA
- **Backend**: FastAPI, Async SQLAlchemy 2.0, Asyncpg, Alembic, Pydantic v2, PyJWT, Passlib (Bcrypt)
- **AI Models**: Google Gemini 1.5 Flash (Primary) + OpenAI GPT-4o-mini (Fallback)
- **Database & Cache**: PostgreSQL 15, Redis 7

---

## 👤 Owner Context
- **Developer**: Ahmed Mahmoud Khalil (AI/ML Engineer)
- **GitHub**: [@Ahmed-Mahmoud813g](https://github.com/Ahmed-Mahmoud813g)
- **Email**: ahmedmahmoudg17@gmail.com

---

## 📄 License
MIT License
