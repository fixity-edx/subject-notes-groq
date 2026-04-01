# Integrated Subject Notes System ✅
Groq AI + JWT Auth + RBAC + Notes Library Dashboard

✅ React (Vite) + TailwindCSS (Subject tabs, card library UI)  
✅ Node.js + Express + MongoDB Atlas  
✅ Notes Upload/Download (Multer local storage)  
✅ AI: Groq summarizes notes + generates quizzes automatically  
✅ AI triggers: on upload (for .txt/.md notes) + manual run from UI  
✅ Security: JWT, bcrypt, RBAC, validation, sanitization, Helmet, rate-limit, optional CSRF  
✅ Deployable: Vercel + Render free tier

---

## Folder Structure
```
subject-notes-groq-rbac/
  frontend/
  backend/
  README.md
```

---

# Features

## Student/Faculty (User)
- Upload notes (title, subject, keywords + file)
- View notes library by subject
- Search notes
- Download notes
- AI Summary & Quiz generation

## Admin
- Manage all notes
- Delete notes
- Full visibility across subjects

---

# Important Note about AI + File Upload
This mini project keeps things simple:
- Upload **.txt** or **.md** files for best AI output (Groq reads text)
- PDF uploads are still allowed & downloadable, but AI summary might not work (PDF parsing not included)

---

# 1) Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm start
```

Backend: `http://localhost:5000`

Fill `.env`:
- `MONGODB_URI`
- `JWT_SECRET`
- `GROQ_API_KEY`

---

# 2) Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend: `http://localhost:5173`

---

# RBAC - Create Admin
All signups are created as `role=user`.

Make admin:
MongoDB Atlas → `users` collection → change role:
```json
"role": "admin"
```

Login again → admin features enabled.

---

# Groq AI Setup
From console.groq.com:
```
GROQ_API_KEY=...
GROQ_MODEL=llama-3.1-8b-instant
```

---

# Deployment (Free Tier)

## Backend → Render
- Root: `backend`
- Build: `npm install`
- Start: `npm start`

## Frontend → Vercel
- Root: `frontend`
- Env var:
```
VITE_API_BASE_URL=https://<render-backend-url>
```

---

# Security Notes (Viva)
- bcrypt hashing
- JWT + token expiry
- logout invalidation (blacklist TTL)
- helmet security headers
- rate limiter
- validation + sanitization
- optional CSRF (`ENABLE_CSRF=1`)
- HTTPS-ready

---

## Author
Final Year BTech Mini Project - Integrated Subject Notes System
