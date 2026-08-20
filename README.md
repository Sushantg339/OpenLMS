# OpenLMS (VeoLMS)

A production-oriented, full-stack Learning Management System (LMS) for selling, managing, and streaming video-based courses. OpenLMS combines a modern Next.js frontend with an Express/TypeScript backend, PostgreSQL, Redis, Cloudflare R2, BullMQ, FFmpeg, and Razorpay.

The repository uses **VeoLMS** as the working codename for both applications (`veolms_backend` and `veolms_frontend`), while **OpenLMS** is the product/project name.

---

## Tech Stack

| Layer                  | Technology                                                                        |
| ---------------------- | --------------------------------------------------------------------------------- |
| **Frontend**           | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, hls.js, GSAP         |
| **Backend**            | Node.js, Express 5, TypeScript (ESM)                                              |
| **Database**           | PostgreSQL 17, Prisma ORM 7                                                       |
| **Caching & Sessions** | Redis, ioredis                                                                    |
| **Object Storage**     | Cloudflare R2 (S3-compatible)                                                     |
| **Video Processing**   | BullMQ, FFmpeg, HLS                                                               |
| **Payments**           | Razorpay                                                                          |
| **Authentication**     | JWT access/refresh tokens, `httpOnly` cookies, Redis-backed refresh-token storage |
| **Deployment**         | Docker Compose, GitHub Actions, AWS EC2                                           |

---

## Core Features

### Course Management

* Public course catalog with published/draft states
* Hierarchical course structure with sections and ordered lessons
* Admin course builder
* Course thumbnail and trailer uploads
* Course and lesson CRUD operations
* Section and lesson reordering

### Video Processing & Streaming

* Direct video upload workflow
* Background video processing using BullMQ
* FFmpeg-based HLS transcoding
* 720p HLS video output
* Private video storage using Cloudflare R2
* Short-lived, signed playback tokens
* API-proxied HLS segment streaming
* Path-traversal protection for HLS resources
* Adaptive playback through hls.js

### Authentication & Authorization

* JWT-based authentication
* Access and refresh token architecture
* `httpOnly` authentication cookies
* Redis-backed refresh-token storage
* Role-based access control
* `STUDENT` and `ADMIN` roles
* Redis-cached user lookups
* Route-specific rate limiting

### Student Experience

* Course enrollment
* Lesson progress tracking
* Continue-learning dashboard
* Student course dashboard
* Protected lesson/video access

### Payments

* Razorpay order creation
* Server-side course pricing
* Razorpay signature verification
* Webhook verification
* Idempotent enrollment handling
* Defense-in-depth payment confirmation through both client verification and webhooks

---

# Project Structure

```text
OpenLMS/
│
├── veolms_backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── courses/
│   │   │   ├── payments/
│   │   │   ├── dashboard/
│   │   │   └── admin/
│   │   │
│   │   ├── middlewares/
│   │   │   ├── auth/
│   │   │   ├── rate-limiting/
│   │   │   ├── upload/
│   │   │   └── error-handling/
│   │   │
│   │   ├── services/
│   │   │   ├── r2/
│   │   │   └── transcoder/
│   │   │
│   │   ├── queues/
│   │   ├── workers/
│   │   ├── lib/
│   │   │   ├── prisma/
│   │   │   ├── redis/
│   │   │   ├── r2/
│   │   │   ├── razorpay/
│   │   │   └── admin-seed/
│   │   │
│   │   └── utils/
│   │       ├── apiError/
│   │       ├── asyncHandler/
│   │       └── playback-token/
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   │
│   ├── Dockerfile
│   ├── Dockerfile.worker
│   └── docker-compose.yml
│
└── veolms_frontend/
    └── src/
        ├── app/
        │   ├── public/
        │   ├── auth/
        │   ├── dashboard/
        │   └── admin/
        │
        ├── components/
        │   ├── admin/
        │   ├── courses/
        │   ├── navbar/
        │   ├── video-player/
        │   └── ui/
        │
        ├── context/
        │   └── AuthContext/
        │
        └── lib/
            ├── axios/
            └── utils/
```

---

# Getting Started

## Prerequisites

Ensure the following are installed and configured:

* Node.js 20+
* Docker
* PostgreSQL 17
* Redis
* FFmpeg (automatically installed in the worker Docker image)
* Cloudflare R2 bucket and API credentials
* Razorpay account with test-mode credentials

If running the worker outside Docker, install FFmpeg locally:

```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# macOS
brew install ffmpeg
```

---

## 1. Backend Setup

```bash
cd veolms_backend
npm install
```

Create `veolms_backend/.env`:

```env
PORT=3000
NODE_ENV=development

DATABASE_URL=postgresql://postgres:root@localhost:5432/lms
REDIS_URL=redis://localhost:6379

ACCESS_TOKEN_SECRET=replace-with-a-long-random-secret
REFRESH_TOKEN_SECRET=replace-with-a-different-long-random-secret

ADMIN_NAME=Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me

R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_BASE_URL=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

FRONTEND_URL=http://localhost:5000
```

Start PostgreSQL and Redis:

```bash
docker compose up -d lms_db cache_db
```

Initialize Prisma and seed the admin account:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Start the API:

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:3000
```

Start the video-processing worker in a separate terminal:

```bash
npm run worker
```

### Run the complete backend stack with Docker

```bash
docker compose up -d --build
```

This starts PostgreSQL, Redis, the API, and the FFmpeg worker.

---

# 2. Frontend Setup

```bash
cd veolms_frontend
npm install
```

Create `veolms_frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:5000
```

Use the seeded administrator credentials to access `/admin` and begin creating courses.

---

# API Overview

The API uses `/api/v1` as its base path.

| Module        | Endpoints                                                                  |
| ------------- | -------------------------------------------------------------------------- |
| **Auth**      | `POST /auth/signup`, `/login`, `/refresh`, `/logout`                       |
| **Courses**   | `GET /courses`, `GET /courses/:slug`, admin CRUD, thumbnail/trailer upload |
| **Sections**  | Admin create, update, delete, reorder                                      |
| **Lessons**   | Admin CRUD/reorder, video, playback token, HLS streaming                   |
| **Payments**  | `POST /payments/create-order`, `/verify`, `/webhook`                       |
| **Dashboard** | My courses, continue learning, progress updates                            |
| **Admin**     | Students, student details, enrollments                                     |

### Video Endpoints

```text
GET /lessons/:id/video
GET /lessons/:id/playback-token
GET /lessons/:id/hls/*
```

The HLS route is protected and designed to prevent direct exposure of private R2 objects.

---

# Architecture Overview

OpenLMS follows a service-oriented backend architecture:

```text
                         ┌─────────────────────┐
                         │   Next.js Frontend  │
                         │     React + hls.js  │
                         └──────────┬──────────┘
                                    │
                              REST / HTTP
                                    │
                         ┌──────────▼──────────┐
                         │   Express API       │
                         │   Authentication    │
                         │   Authorization     │
                         │   Business Logic    │
                         └──────┬──────┬────────┘
                                │      │
                    ┌───────────┘      └────────────┐
                    ▼                              ▼
             ┌────────────┐                  ┌────────────┐
             │ PostgreSQL │                  │   Redis    │
             │  + Prisma  │                  │ Cache/Jobs │
             └────────────┘                  └─────┬──────┘
                                                   │
                                              BullMQ Queue
                                                   │
                                                   ▼
                                            ┌────────────┐
                                            │   Worker   │
                                            │  FFmpeg    │
                                            └─────┬──────┘
                                                  │
                                                  ▼
                                            ┌────────────┐
                                            │ Cloudflare  │
                                            │     R2     │
                                            └────────────┘

                         ┌─────────────────────┐
                         │      Razorpay       │
                         │      Payments       │
                         └─────────────────────┘
```

---

# Video Processing Pipeline

The video pipeline is designed to keep CPU-intensive transcoding work outside the API process.

```text
Video Upload
     │
     ▼
Cloudflare R2
     │
     ▼
BullMQ Job
     │
     ▼
FFmpeg Worker
     │
     ▼
HLS Transcoding
     │
     ├── playlist.m3u8
     ├── segment_001.ts
     ├── segment_002.ts
     └── ...
     │
     ▼
Cloudflare R2
     │
     ▼
Short-lived Playback Token
     │
     ▼
Protected HLS API
     │
     ▼
hls.js Video Player
```

This architecture prevents long-running FFmpeg processes from blocking the Express API and keeps the R2 bucket private from direct public access.

---

# Security Considerations

OpenLMS implements several security mechanisms across authentication, payments, uploads, and video delivery.

### Authentication

* JWT access and refresh tokens
* `httpOnly` cookies
* Redis-backed refresh-token storage
* Role-based authorization
* Rate limiting on authentication endpoints

### Payment Security

* Server-side pricing
* Razorpay signature verification
* Webhook signature verification
* Idempotent enrollment
* Defense-in-depth confirmation through both callback and webhook flows

### Video Security

* Private R2 storage
* Short-lived signed playback tokens
* Protected HLS endpoints
* Path-traversal protection
* Server-side authorization before video access

### Upload Security

* Multipart upload restrictions
* File-size limits
* MIME-type validation
* Isolated background processing

---

# Recommended Improvements

The current implementation provides a strong foundation, particularly around authentication, payments, and protected video delivery. The following improvements would further increase reliability, security, and production readiness.

## 1. Automated Testing

There is currently no automated test suite for the backend or frontend.

Priority test areas:

* Authentication and token lifecycle
* Razorpay order creation and verification
* Razorpay webhook handling
* Enrollment idempotency
* HLS path-traversal protection
* Authorization and role checks
* Course/lesson CRUD operations

A CI pipeline should execute the test suite before deployment.

---

## 2. Environment Templates

Add `.env.example` files to both applications.

This allows contributors to understand the required configuration without inspecting source code.

Recommended files:

```text
veolms_backend/.env.example
veolms_frontend/.env.example
```

Sensitive credentials should never be committed.

---

## 3. Multi-Device Refresh Sessions

Refresh tokens are currently stored using a user-based Redis key:

```text
refresh_token:<user_id>
```

As a result, logging in from another device can invalidate the previous session.

A more scalable design would associate refresh tokens with a unique session/device identifier:

```text
refresh_token:<user_id>:<session_id>
```

This enables independent session management and future features such as:

* View active sessions
* Revoke individual sessions
* Logout from all devices
* Device/session metadata

---

## 4. Server-Side File-Type Validation

The current upload middleware relies on the client-provided MIME type.

Since multipart MIME metadata can be spoofed, production uploads should additionally inspect the actual file contents.

Recommended approaches include:

* `file-type` for binary signature detection
* `ffprobe` for video validation
* Validation before submitting the file to the transcoding queue

---

## 5. Resolve Upload Limit Inconsistency

The image-upload middleware currently documents a `10 MB` limit while the configured limit is `5 MB`.

The documentation and implementation should be aligned to prevent future confusion.

---

## 6. Timing-Safe Signature Comparison

Razorpay HMAC signatures are currently compared using ordinary string comparison.

For additional cryptographic hardening, use:

```text
crypto.timingSafeEqual()
```

after converting both signatures into buffers of equal length.

This should be applied consistently to both webhook and client-side signature verification.

---

## 7. Dedicated HLS Rate Limiting

The general API limiter currently applies to HLS segment requests.

For example, a configuration such as:

```text
300 requests / 15 minutes / IP
```

may eventually become restrictive for users behind shared IPs, such as:

* Universities
* Offices
* Mobile carrier NAT
* Public networks

A dedicated HLS limiter with a higher threshold would better match normal streaming traffic.

---

# Product Improvements

## 8. Adaptive Bitrate Streaming

The current transcoding pipeline generates a single 720p rendition.

A production-grade video platform could generate multiple renditions:

```text
360p
480p
720p
```

and produce a master HLS playlist.

This would allow the player to dynamically select the appropriate quality based on available bandwidth and device capabilities.

---

## 9. Email Verification & Password Recovery

The authentication system should eventually support:

* Email verification
* Forgot-password flow
* Password reset tokens
* Expiring verification/reset links
* Password-change functionality

---

## 10. Course Discovery

The public course catalog can be expanded with:

* Search
* Category filtering
* Price filtering
* Sorting
* Pagination
* Course ratings
* Course reviews

These features become increasingly important as the number of courses grows.

---

## 11. Refund Handling

Payment and enrollment models should eventually support refund states and Razorpay refund events.

Potential payment lifecycle:

```text
CREATED
   │
   ▼
PAID
   │
   ├──────────────► REFUNDED
   │
   └──────────────► FAILED
```

Webhook-driven refund processing would keep enrollment and payment state consistent.

---

## 12. Course Completion & Certificates

The existing lesson-progress system provides the foundation for course completion tracking.

A future implementation could calculate:

```text
Completed Lessons
----------------- × 100
Total Lessons
```

and issue certificates once the completion threshold is reached.

Possible additions include:

* Certificate generation
* Unique certificate IDs
* Verification URLs
* PDF certificates
* Completion timestamps

---

# Project Hygiene

## 13. Open-Source License

If OpenLMS is intended to be publicly distributed, add a root-level `LICENSE` file.

The license should be selected according to the project's intended usage and contribution model.

---

## 14. Remove Default Next.js Assets

The frontend still contains unused `create-next-app` assets such as:

```text
file.svg
globe.svg
next.svg
vercel.svg
window.svg
```

These can be removed once the application has its final branding and assets.

The default README should also be replaced with project-specific documentation.

---

## 15. Strengthen CI/CD

The current deployment workflow focuses primarily on backend deployment to EC2.

Before production deployment, CI should verify both applications.

Recommended pipeline:

```text
Pull Request
     │
     ├── Backend Typecheck
     ├── Backend Lint
     ├── Backend Tests
     │
     ├── Frontend Typecheck
     ├── Frontend Lint
     └── Frontend Build
              │
              ▼
          Merge
              │
              ▼
       Production Deploy
```

This prevents broken code from reaching the deployment stage.

---

# Recommended Development Priorities

The most valuable improvements can be implemented in the following order:

### Priority 1 — Reliability

1. Add automated tests
2. Add backend/frontend `.env.example`
3. Add typecheck and lint gates to CI
4. Add frontend CI/build verification

### Priority 2 — Security Hardening

5. Validate actual uploaded file contents
6. Use timing-safe signature comparison
7. Improve refresh-token/session architecture
8. Introduce dedicated HLS rate limiting

### Priority 3 — Video Platform Improvements

9. Add 360p/480p/720p adaptive bitrate streaming
10. Improve video processing observability and failure handling

### Priority 4 — Product Features

11. Email verification
12. Password reset
13. Search and filtering
14. Reviews and ratings
15. Refund handling
16. Course completion and certificates

### Priority 5 — Open-Source & Project Hygiene

17. Add LICENSE
18. Remove unused boilerplate
19. Improve contributor documentation

---

# Conclusion

OpenLMS is structured as a modern, scalable LMS with a clear separation between the frontend, API, background processing, persistence, caching, object storage, and payment infrastructure.

The architecture already addresses several production-critical concerns, including:

* Server-side payment validation
* Webhook verification
* Idempotent enrollment
* JWT-based authentication
* Redis-backed sessions
* Private object storage
* Signed video playback
* Protected HLS streaming
* Background FFmpeg processing
* Role-based access control
* Route-specific rate limiting

The most important next step is to establish a **strong automated testing and CI foundation**. Once that is in place, the project can safely evolve toward multi-device sessions, adaptive bitrate streaming, improved upload validation, and additional LMS features such as reviews, refunds, password recovery, and certificates.

OpenLMS therefore provides a solid foundation for a production-oriented video learning platform while leaving clear paths for further scalability, security hardening, and product expansion.
