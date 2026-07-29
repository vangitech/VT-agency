# Vangitech — VT Agency

Full-stack agency website and CRM platform for **Vangitech Limited**, a Nigerian technology consultancy. Serves both a public-facing corporate site and a comprehensive internal admin dashboard with deal pipeline, contact management, email, chat, SMS, project tracking, timesheets, expenses, analytics, and more.

**Live:** [vangitech.com](https://vangitech.com)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Node.js, Express 5, Mongoose 9, Socket.IO |
| **Frontend** | React 19, Vite 8, Tailwind CSS 4, React Router 7 |
| **Database** | MongoDB Atlas |
| **Auth** | JWT, bcryptjs, role-based permissions, 2FA |
| **Email** | Resend (primary), Brevo (fallback), Octomailer |
| **Real-time** | Socket.IO for live chat |
| **Scheduling** | node-cron (news fetch, follow-ups, keep-alive) |
| **Testing** | Vitest, Supertest, mongodb-memory-server |
| **Validation** | express-validator |
| **Infrastructure** | Docker, Coolify, GitHub Actions |

---

## Features

### Public Site
- **Hero carousel** — Manageable slides with CTA buttons
- **Project portfolio** — Filterable by category (software, fintech, cybersecurity, etc.)
- **Client showcase** — Active client logos and categories
- **News feed** — Auto-fetched industry news + manual articles
- **Testimonials** — Rating-based client testimonials
- **Contact form** — Auto-creates CRM contact + interaction, sends welcome email
- **Quote request** — Multi-category form (Software, Cybersecurity, ISO, Fintech) with file upload, sends notification + confirmation emails
- **Legal pages** — Privacy, Terms, FAQ, Cookie Policy (editable via admin)
- **SEO** — react-helmet-async, Open Graph, Twitter Cards, sitemap.xml, robots.txt, JSON-LD schema
- **Cookie consent** — GDPR-compliant consent banner

### Admin Dashboard (`/vaccess/*`)
- **Dashboard** — KPI cards (pipeline value, active deals, MRR, win rate), content overview, recent activity feed, quick actions
- **Content management** — Hero slides, testimonials, news (with auto-fetch from external APIs), clients, projects, legal pages
- **CRM** — Unified contact profiles, interaction history, contact deduplication and merge, read/unread tracking, inline reply
- **Deal pipeline** — Kanban-style deal management with stages, values, activities
- **Email** — Multi-account support, IMAP sync, send/receive via Resend/Brevo, email sequences
- **Chat** — Real-time chat via Socket.IO with session management, agent assignment
- **SMS** — Send and receive SMS messages linked to contacts
- **Calls** — Call logging and tracking
- **Calendar** — Event scheduling and management
- **Projects** — Full project lifecycle with status tracking
- **Timesheets** — Time tracking per project/task
- **Expenses** — Expense logging and categorization
- **Analytics & Reports** — Dashboard metrics, pipeline reporting
- **Workflows** — Automation rules engine
- **Custom Objects** — Dynamic object creation for flexible data modeling
- **Security** — Audit logging, 2FA support, IP rate limiting
- **User management** — Role-based access (superadmin, admin, editor, manager, agent), granular permissions
- **Settings** — Company info, email configuration, integrations

---

## Project Structure

```
├── backend/
│   ├── config/           # MongoDB connection
│   ├── controllers/      # Route handlers
│   ├── middleware/        # Auth, validation, file upload
│   ├── models/           # Mongoose schemas (20+ models)
│   ├── routes/           # Express route definitions
│   ├── scripts/          # CLI utilities (bootstrap)
│   ├── services/         # Email, AI, IMAP, scheduling
│   ├── tests/            # Vitest test suite
│   ├── uploads/          # Uploaded files (gitignored)
│   ├── .env.example      # Environment variable template
│   ├── Dockerfile        # Production container
│   └── vitest.config.js  # Test configuration
│
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI (layout, home sections, shadcn-style)
│   │   ├── context/      # Auth, loading providers
│   │   ├── hooks/        # Custom hooks (inactivity, etc.)
│   │   ├── pages/        # Route pages (public + admin)
│   │   └── lib/          # Utilities
│   ├── public/           # Static assets (sitemap, robots, favicon)
│   ├── Dockerfile        # Multi-stage nginx container
│   ├── nginx.conf         # SPA routing, caching, gzip
│   └── vite.config.js    # Vite + Tailwind + proxy config
│
├── .github/workflows/    # CI pipeline
└── docker-compose.yml    # Local development (optional)
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- Resend and/or Brevo API keys (for email)

### Setup

```bash
# Clone and install
git clone https://github.com/vangitech/VT-agency.git
cd VT-agency

# Backend
cd backend
cp .env.example .env    # Edit with your values
npm install
npm run dev              # Starts on :5001

# Frontend (separate terminal)
cd ../frontend
npm install
npm run dev              # Starts on :5173, proxies /api to :5001
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Backend port (default: 5001) |
| `MONGODB_URI` | **Yes** | MongoDB connection string |
| `JWT_SECRET` | **Yes** | 64+ char random hex for token signing |
| `JWT_EXPIRE` | No | Token expiry (default: 30d) |
| `CORS_ORIGIN` | No | Comma-separated allowed origins |
| `RESEND_API_KEY` | No | Resend API key for email |
| `BREVO_API_KEY` | No | Brevo API key (fallback email) |
| `BREVO_SMTP_USER` | No | Brevo SMTP sender email |
| `SUPERADMIN_PASSWORD` | No | Password for initial superadmin |
| `FIRST_RUN` | No | Set `true` to bootstrap on first deploy |
| `CLIENT_URL` | No | Frontend URL (for password reset links) |
| `TWILIO_*` | No | Twilio credentials (for SMS) |

### First-run Bootstrap

Two ways to create the initial superadmin:

1. **Env flag** — Set `FIRST_RUN=true` and `SUPERADMIN_PASSWORD=<password>`. On startup, creates the superadmin if none exists.
2. **CLI script** — Run `npm run bootstrap` to connect to MongoDB and create the superadmin.

---

## Testing

```bash
cd backend
npm test              # Run once
npm run test:watch    # Watch mode
```

**30 tests** covering:
- Auth middleware (protect, adminOnly, superadminOnly, requirePermission)
- Auth routes (login, me, forgot-password, reset-password)
- CRM routes (messages CRUD, stats, authentication guards)

Tests use **mongodb-memory-server** for isolated, disposable databases — no external dependency needed.

---

## Docker

### Backend
```bash
cd backend
docker build -t vangitech-api .
docker run -p 5001:5001 --env-file .env vangitech-api
```

### Frontend
```bash
cd frontend
docker build -t vangitech-frontend .
docker run -p 80:80 -e VITE_API_URL=https://api.yourdomain.com/api vangitech-frontend
```

---

## CI/CD

**GitHub Actions** (`.github/workflows/ci.yml`) runs on every push/PR to `main`:
- `npm ci` + `npm run lint` (frontend)
- `npm run build` (frontend)
- `npm ci` (backend)

Deployment handled by **Coolify** — auto-deploys from the `main` branch using Dockerfiles.

---

## Security

- **Authentication** — JWT with bcrypt password hashing
- **Authorization** — Role-based (superadmin, admin, editor, manager, agent) + granular resource permissions
- **Rate limiting** — 20 req/15min on login, 300 req/15min on API
- **Input validation** — express-validator on all mutation endpoints
- **CORS** — Whitelist-only origins
- **Inactivity timeout** — 10-minute auto-logout for admin sessions
- **2FA** — Time-based one-time password support (speakeasy)
- **Audit logging** — All admin actions logged
- **Password policy** — 8+ chars, capital letter, number, special character
- **Secrets management** — `.env` gitignored at root and backend level, uploads excluded from version control

---

## Key Achievements

- **Full CRM** with contact deduplication/merge, multi-provider email (Resend + Brevo + IMAP), real-time chat, SMS, calendar, deal pipeline, project tracking, timesheets, expenses, and analytics
- **Smart contact management** — Auto-creates unified contact profiles from contact forms, quote requests, emails, and chat sessions; deduplication with field-level merge
- **Multi-category quote system** — Dynamic forms per service category (Software, Cybersecurity, ISO, Fintech) with file upload and contextual email notifications
- **Email resilience** — Dual-provider email delivery via Octomailer (Resend as primary, Brevo as failover)
- **Real-time features** — Socket.IO chat with agent assignment, session management, and typing indicators
- **Content automation** — Scheduled news fetching from external APIs, automated contact follow-ups
- **Role-based admin** — 5 roles with 7 granular permission scopes
- **Clean architecture** — MVC pattern, ES modules, separation of concerns across 20+ models, 15+ route modules, and a full controller layer
- **Production-ready** — Docker multi-stage builds, nginx SPA serving, CI/CD pipeline, comprehensive test suite, input validation, and security hardening

---

## License

Proprietary — Vangitech Limited
