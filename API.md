# Vangitech API Documentation

**Base URLs:** `http://localhost:5001/api` (local) · `https://api.vangitech.com/api` (production)
**Content-Type:** `application/json`
**Rate Limits:** 20 requests / 15 min per IP on `POST /auth/login`; 5000 requests / 15 min per IP on all other `/api` routes (`/api/health` excluded). Login + API limiters return CORS headers.

---

## 1. Health Check

### GET /health
Verify the API is running.

```
GET /api/health
```

**Response (200 when MongoDB connected, 503 otherwise):**
```json
{
  "status": "OK",
  "message": "Vangitech API is running",
  "uptime": 517.95,
  "timestamp": "2026-10-15T10:07:05.612Z",
  "mongo": "connected"
}
```

---

## 2. Authentication

### POST /auth/register
Create a new admin user.

```
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "string (required)",
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response (201):**
```json
{
  "_id": "string",
  "name": "string",
  "email": "string",
  "role": "admin",
  "token": "string (JWT)"
}
```

**Errors:** `400` User already exists | `500` Server error

---

### POST /auth/login
Authenticate an existing user.

```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response (200):**
```json
{
  "_id": "string",
  "name": "string",
  "email": "string",
  "role": "admin",
  "token": "string (JWT)"
}
```

**Errors:** `401` Invalid email or password | `500` Server error

---

### GET /auth/me
Get the currently authenticated user's profile.

```
GET /api/auth/me
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "_id": "string",
  "name": "string",
  "email": "string",
  "role": "string",
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

**Errors:** `401` Not authorized

---

## 3. Public Endpoints (No Auth Required)

### GET /public/hero
Get all active hero slides sorted by display order.

```
GET /api/public/hero
```

**Response (200):**
```json
[
  {
    "_id": "string",
    "title": "string",
    "subtitle": "string",
    "description": "string",
    "image": "string (URL)",
    "ctaText": "string",
    "ctaLink": "string",
    "order": "number",
    "isActive": "boolean",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
]
```

---

### GET /public/testimonials
Get all active testimonials (newest first).

```
GET /api/public/testimonials
```

**Response (200):**
```json
[
  {
    "_id": "string",
    "name": "string",
    "position": "string",
    "company": "string",
    "content": "string",
    "avatar": "string (URL)",
    "rating": "number (1-5)",
    "isActive": "boolean",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
]
```

---

### GET /public/news
Get the 6 most recent active news items.

```
GET /api/public/news
```

**Response (200):**
```json
[
  {
    "_id": "string",
    "title": "string",
    "summary": "string",
    "content": "string",
    "image": "string (URL)",
    "source": "string",
    "url": "string",
    "category": "string",
    "isActive": "boolean",
    "publishedAt": "ISO date",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
]
```

---

### GET /public/clients
Get all active clients sorted alphabetically.

```
GET /api/public/clients
```

**Response (200):**
```json
[
  {
    "_id": "string",
    "name": "string",
    "logo": "string (URL)",
    "website": "string",
    "category": "string (enum)",
    "isActive": "boolean",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
]
```

**`category` enum:** `finance`, `education`, `healthcare`, `technology`, `government`, `other`

---

### GET /public/projects
Get all active projects (newest first).

```
GET /api/public/projects
```

**Response (200):**
```json
[
  {
    "_id": "string",
    "title": "string",
    "description": "string",
    "image": "string (URL)",
    "category": "string (enum)",
    "technologies": ["string"],
    "client": "string",
    "completionDate": "ISO date | null",
    "isActive": "boolean",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
]
```

**`category` enum:** `software`, `cybersecurity`, `fintech`, `edutech`, `medical`, `consulting`

---

### GET /public/page-content/:page
Get content for a specific page.

```
GET /api/public/page-content/{page}
```

**Path Parameters:** `page` — one of `home`, `about`, `contact`, `projects`

**Response (200):**
```json
{
  "_id": "string",
  "page": "string",
  "sections": { "any valid JSON" },
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

**Errors:** `404` Page content not found

---

### GET /public/news/:id
Get a single news article by ID.

```
GET /api/public/news/{id}
```

**Errors:** `404` News article not found

---

### GET /public/settings
Get public company settings (name, email, phone, address, social URLs, footer text).

```
GET /api/public/settings
```

**Response (200):**
```json
{
  "companyName": "Vangitech Limited",
  "companyEmail": "support@vangitech.com",
  "companyPhone": "+234 806 975 2912",
  "companyAddress": "House C18A FRSC Estate Lokogoma FCT-Abuja",
  "facebookUrl": "",
  "twitterUrl": "",
  "linkedinUrl": "",
  "youtubeUrl": "",
  "footerCopyright": "All rights reserved."
}
```

---

### POST /public/contact
Submit the contact form. Creates a `ContactMessage`, auto-creates/updates the unified `Contact` profile, logs `Interaction` records, sends a support-team notification email and a welcome email to the visitor (email failures are logged, not fatal).

```
POST /api/public/contact
```

**Request Body:**
```json
{
  "name": "string (required)",
  "email": "string (required, valid email)",
  "subject": "string (required)",
  "message": "string (required)"
}
```

**Response (201):**
```json
{
  "message": "Message sent successfully",
  "id": "string (ContactMessage _id)"
}
```

**Errors:** `400` All fields are required / validation messages | `500` Server error

---

### POST /public/quote-request
Submit a multi-category quote request (`Software Development`, `Cyber-Security`, `ISO Implementation`, `Fintech Solutions`). Accepts `multipart/form-data` with optional `document` file upload. Creates a `QuoteRequest`, upserts the `Contact` profile, sends a sales-team notification and a confirmation email to the requester.

```
POST /api/public/quote-request
Content-Type: multipart/form-data
```

**Required fields:** `name`, `email`, `category`

**Response (201):**
```json
{
  "message": "Quote request submitted successfully",
  "id": "string (QuoteRequest _id)"
}
```

**Errors:** `400` Name, email, and category are required | `500` Server error

---

### GET /api/proxy-image
Proxy an external image through the API (avoids `ERR_BLOCKED_BY_ORB` for hotlinked images). Cached for 24h.

```
GET /api/proxy-image?url={encoded-image-url}
```

**Errors:** `400` URL parameter required | `500` Image proxy error

---

## 4. Admin Endpoints (JWT Required + Admin Role)

All admin endpoints require:
```
Authorization: Bearer <token>
```
Responses return `401` if token is missing/invalid, or `403` if user is not an admin.

### Hero Slides

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/hero` | Get all hero slides |
| POST | `/api/admin/hero` | Create a hero slide |
| PUT | `/api/admin/hero/:id` | Update a hero slide |
| DELETE | `/api/admin/hero/:id` | Delete a hero slide |

**POST/PUT Body:**
```json
{
  "title": "string (required)",
  "subtitle": "string (required)",
  "description": "string (required)",
  "image": "string (required, URL)",
  "ctaText": "string (default: 'Learn More')",
  "ctaLink": "string (default: '#')",
  "order": "number (default: 0)",
  "isActive": "boolean (default: true)"
}
```

---

### Testimonials

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/testimonials` | Get all testimonials |
| POST | `/api/admin/testimonials` | Create a testimonial |
| PUT | `/api/admin/testimonials/:id` | Update a testimonial |
| DELETE | `/api/admin/testimonials/:id` | Delete a testimonial |

**POST/PUT Body:**
```json
{
  "name": "string (required)",
  "position": "string (required)",
  "company": "string (required)",
  "content": "string (required)",
  "avatar": "string (URL)",
  "rating": "number (1-5, default: 5)",
  "isActive": "boolean (default: true)"
}
```

---

### News

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/news` | Get all news items |
| POST | `/api/admin/news` | Create a news item |
| PUT | `/api/admin/news/:id` | Update a news item |
| DELETE | `/api/admin/news/:id` | Delete a news item |

**POST/PUT Body:**
```json
{
  "title": "string (required)",
  "summary": "string (required)",
  "content": "string (required)",
  "image": "string (URL)",
  "source": "string (default: 'Vangitech')",
  "url": "string",
  "category": "string (default: 'Technology')",
  "isActive": "boolean (default: true)",
  "publishedAt": "ISO date (default: now)"
}
```

---

### Clients

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/clients` | Get all clients |
| POST | `/api/admin/clients` | Create a client |
| PUT | `/api/admin/clients/:id` | Update a client |
| DELETE | `/api/admin/clients/:id` | Delete a client |

**POST/PUT Body:**
```json
{
  "name": "string (required)",
  "logo": "string (required, URL)",
  "website": "string",
  "category": "string (enum: finance, education, healthcare, technology, government, other)",
  "isActive": "boolean (default: true)"
}
```

---

### Projects

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/projects` | Get all projects |
| POST | `/api/admin/projects` | Create a project |
| PUT | `/api/admin/projects/:id` | Update a project |
| DELETE | `/api/admin/projects/:id` | Delete a project |

**POST/PUT Body:**
```json
{
  "title": "string (required)",
  "description": "string (required)",
  "image": "string (URL)",
  "category": "string (required, enum: software, cybersecurity, fintech, edutech, medical, consulting)",
  "technologies": ["string"],
  "client": "string",
  "completionDate": "ISO date",
  "isActive": "boolean (default: true)"
}
```

---

### Page Content

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/page-content/:page` | Get page content by page name |
| PUT | `/api/admin/page-content/:page` | Create or update page content (upsert) |

**Path Parameters:** `page` — one of `home`, `about`, `contact`, `projects`

**PUT Body:** Any JSON object (stored as the `sections` field)

---

### Settings

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/settings` | Get all settings as a key-value map |
| PUT | `/api/admin/settings` | Bulk update settings |

**GET Response:**
```json
{
  "key1": "value1",
  "key2": "value2"
}
```

**PUT Body:**
```json
{
  "site_name": "Vangitech",
  "support_email": "hello@vangitech.com"
}
```

All key-value pairs in the request body are upserted.

---

## 5. Additional API Modules (JWT Required)

Beyond auth/public/admin, the API mounts these modules (see `backend/routes/*.js` as source of truth — all require `Authorization: Bearer <token>` unless noted):

| Prefix | Module | Notes |
|--------|--------|-------|
| `/api/crm` | Contacts, contact messages, interactions, replies | Contact dedup/merge, read/unread, inline reply sends email |
| `/api/email` | Multi-account email, IMAP sync, sequences | Send/receive via Resend/Brevo |
| `/api/chat` | Real-time chat sessions + messages | Socket.IO live agent messaging |
| `/api/sms` | Send/receive SMS linked to contacts | Twilio credentials required |
| `/api/calls` | Call logging and tracking | Linked to contacts |
| `/api/calendar` | Event scheduling | — |
| `/api/deals` | Deal pipeline (Kanban stages, values, activities) | — |
| `/api/projects` | Internal project lifecycle tracking | Distinct from public portfolio projects |
| `/api/timesheets` | Time tracking per project/task | — |
| `/api/expenses` | Expense logging and categorization | — |
| `/api/resources` | Generic resource management | — |
| `/api/analytics` | Dashboard metrics, pipeline reporting | — |
| `/api/workflows` | Automation rules engine | — |
| `/api/ai` | AI-assisted features | Requires AI provider key |
| `/api/custom-objects` | Dynamic object modeling | — |
| `/api/security` | Audit logs, 2FA, sessions | `superadminOnly` on sensitive routes |

Role model: `superadmin`, `admin`, `editor`, `manager`, `agent` + granular resource permissions (see `backend/middleware/auth.js`: `protect`, `adminOnly`, `superadminOnly`, `requirePermission`).

---

## 6. Error Responses

| Status | Meaning |
|--------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad request (e.g., duplicate email) |
| `401` | Unauthorized (missing/invalid token or bad credentials) |
| `403` | Forbidden (user is not admin) |
| `404` | Resource not found |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

All errors return:
```json
{ "message": "string" }
```

---

## 7. Standard Response Patterns

- **List endpoints** return a JSON array (empty `[]` if no data).
- **Single resource** endpoints return a JSON object.
- **Create** endpoints return `201` with the created object.
- **Delete** endpoints return `200` with `{ "message": "... deleted successfully" }`.
- All timestamps are ISO 8601 format.
- Mongoose `__v` field is included in all resource responses.
