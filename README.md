# LazyDrop Client

LazyDrop Client is the frontend application for the LazyDrop ecosystem.  
Built with Next.js, it provides a secure, real-time interface for session-based file sharing and subscription management.

---

## 🚀 Overview

The frontend enables users to:

- Create and join Drop Sessions
- Upload and download files via signed URLs
- Receive real-time updates (file uploads, notes, participants)
- Manage subscription plans (Free, Plus, Pro)
- Authenticate securely using Supabase

The client communicates with the Spring Boot backend via REST APIs and STOMP WebSockets.

---

## 🛠️ Technology Stack

- Next.js (App Router)
- React
- Tailwind CSS
- Supabase Auth
- STOMP WebSockets
- Stripe Checkout Integration
- Vercel Deployment

---

## 🏗️ Architecture

The frontend follows a modular structure:

- `/app` → Route-based pages
- `/components` → Reusable UI components
- `/lib` → API clients and WebSocket configuration
- `/hooks` → Custom React hooks
- `/context` → Global state management

### Real-Time Subscriptions

Subscriptions connect to:

```
/topic/session/{sessionId}
```

#### Events handled:

- `PEER_JOIN`
- `PEER_LEAVE`
- `FILE_UPLOADED`
- `NOTE_CREATED`
- `SESSION_CLOSED`

---

## ⚙️ Setup

### 1️⃣ Install Dependencies

```bash
npm install
```

### 2️⃣ Configure Environment Variables

Create a `.env.local` file:

| Variable                          | Description                  |
|-----------------------------------|------------------------------|
| NEXT_PUBLIC_API_URL               | Backend base URL             |
| NEXT_PUBLIC_SUPABASE_URL          | Supabase project URL         |
| NEXT_PUBLIC_SUPABASE_ANON_KEY     | Supabase public key          |
| NEXT_PUBLIC_STRIPE_PUBLIC_KEY     | Stripe public key            |

### 3️⃣ Run Development Server

```bash
npm run dev
```

App runs at:

```
http://localhost:3000
```

---

## 🔐 Security Considerations

- JWT tokens sent via `Authorization` header  
- No secret keys exposed client-side  
- File uploads handled through signed URLs  
- Sensitive logic enforced server-side  

---

## 📦 Deployment

- Hosted on Vercel  
- Automatic builds on push to `main` branch  
- Environment variables configured per environment  

---

## 🎯 Design Principles

- Minimal friction (Scan → Drop)  
- Secure-by-default  
- Real-time responsiveness  
- Clear session boundaries  
- Defensive UI validation  

---

## ⚖️ License

[MIT License]
