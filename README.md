# SkillNear

SkillNear is a full-stack hyperlocal service marketplace that connects customers with nearby skilled professionals and local service businesses. It helps users discover services by category and location, book work, chat with providers in real time, review completed services, and manage their activity from a responsive dashboard.

The project is built as a MERN-style application with three main parts:

- `client` - customer and provider web app built with React and Vite.
- `admin` - admin dashboard for platform operations.
- `backend` - Express, MongoDB, Socket.IO, Cloudinary, and email API.

Live client: [https://skillnear.vercel.app](https://skillnear.vercel.app)

---

## Table of Contents

- [Project Purpose](#project-purpose)
- [Core Features](#core-features)
- [User Roles](#user-roles)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Local Setup](#local-setup)
- [Available Scripts](#available-scripts)
- [Application URLs](#application-urls)
- [Backend API Overview](#backend-api-overview)
- [Real-Time Features](#real-time-features)
- [Database Models](#database-models)
- [Main User Flows](#main-user-flows)
- [Admin Capabilities](#admin-capabilities)
- [Seed and Demo Data Scripts](#seed-and-demo-data-scripts)
- [Deployment](#deployment)
- [Security Notes](#security-notes)
- [Troubleshooting](#troubleshooting)
- [Future Improvements](#future-improvements)

---

## Project Purpose

SkillNear is designed to solve a common local-service problem: customers often need reliable professionals nearby, while skilled local workers need better digital visibility. The platform creates a direct marketplace where users can search, compare, communicate, book, and review services without depending on offline referrals.

Typical services include:

- Home repair
- AC repair
- Plumbing
- Electricians
- Carpenters
- Cleaning
- Painting
- Tutors
- Men salon
- Women salon
- Local shops and service businesses

---

## Core Features

### Customer Features

- Register and log in securely.
- Browse services by category, keyword, location, business type, and gender filter.
- Detect current location using browser geolocation.
- Save city, state, pincode, latitude, and longitude.
- Discover nearby services on a Leaflet map.
- View detailed service pages with images, price, provider details, and reviews.
- Book a service through a structured booking flow.
- Chat with providers in real time.
- Upload files or images in chat.
- Save favorite services.
- View bookings, invoices, messages, and profile details from the dashboard.
- Leave, edit, and delete reviews where eligible.

### Provider Features

- Apply to become a provider.
- Create and manage service gigs.
- Upload service images through Cloudinary.
- Receive booking requests.
- Accept, reject, update, and complete bookings.
- Chat with customers in real time.
- Track provider stats from the dashboard.
- View reviews received from customers.
- Request withdrawals.
- Manage profile and availability information.

### Admin Features

- Secure admin login.
- View analytics and platform activity.
- Manage users.
- Create users from the admin dashboard.
- Approve or reject provider/service submissions.
- Change user roles.
- Ban or unban users.
- View user details, galleries, services, bookings, and transactions.
- Manage service listings.
- View and moderate global media.
- Review withdrawal requests and update withdrawal status.

---

## User Roles

SkillNear supports role-based behavior across the client, admin, and backend:

- `user` - standard customer account.
- `provider` - service professional who can create gigs and manage bookings.
- `admin` - platform operator with access to the admin dashboard and protected admin APIs.

Protected backend routes use JWT authentication and role-based middleware.

---

## Architecture

```text
Browser
  |
  |-- Client App: React + Vite
  |     - Customer pages
  |     - Provider dashboard
  |     - Real-time chat
  |     - Location and map discovery
  |
  |-- Admin App: React + Vite
        - Admin dashboard
        - User, service, booking, media, transaction management

Client/Admin
  |
  |-- Axios HTTP requests
  |-- Socket.IO websocket events
  |
Backend: Node.js + Express
  |
  |-- REST API routes
  |-- Socket.IO server
  |-- JWT auth middleware
  |-- Cloudinary upload handling
  |-- Brevo email notifications
  |
MongoDB Atlas / MongoDB
  |
  |-- Users
  |-- Services
  |-- Bookings
  |-- Messages
  |-- Reviews
  |-- Notifications
  |-- Withdrawals
```

---

## Tech Stack

### Frontend Client

- React 19
- Vite 7
- React Router 7
- Zustand
- Axios
- Socket.IO Client
- React Leaflet and Leaflet
- Recharts
- Lucide React
- React Hot Toast
- Custom CSS

### Admin Dashboard

- React 19
- Vite 7
- React Router 7
- Zustand
- Axios
- Recharts
- Lucide React
- React Hot Toast
- Custom CSS

### Backend

- Node.js
- Express 5
- MongoDB with Mongoose
- Socket.IO
- JSON Web Tokens
- Bcrypt.js
- Multer
- Cloudinary
- Multer Storage Cloudinary
- Brevo email API through Axios
- Morgan
- Dotenv
- Nodemon for development

### Deployment

- Vercel for frontend apps.
- Render for backend API.
- MongoDB Atlas for hosted database.
- Cloudinary for media storage.

---

## Repository Structure

```text
skillnear/
  admin/
    src/
      components/
      layouts/
      pages/
      store/
      utils/
    .env.example
    package.json
    vite.config.js
    vercel.json

  backend/
    config/
    controllers/
    middleware/
    models/
    routes/
    utils/
    .env.example
    server.js
    package.json
    createBulkHomeServices.js
    createCategoryShops.js
    createFullGigs.js
    createMoreGigs.js
    createSalonGigs.js
    createTutorGigs.js
    seedLocal.js

  client/
    public/
      images/
    src/
      assets/
      components/
      pages/
      store/
      styles/
      utils/
    .env.example
    package.json
    vite.config.js
    vercel.json

  Project_Details.md
  Project_Diagrams.md
  render.yaml
  package.json
  README.md
```

---

## Prerequisites

Install the following before running the project:

- Node.js 18 or newer
- npm
- MongoDB Atlas account or local MongoDB instance
- Cloudinary account
- Brevo account for email/OTP notifications

Recommended:

- Git
- VS Code
- Postman or Thunder Client for API testing

---

## Environment Variables

Each app has its own environment file. Copy each `.env.example` to `.env` before running locally.

### Backend: `backend/.env`

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/SkillNearDB?retryWrites=true&w=majority
JWT_SECRET=your_strong_jwt_secret_key_here

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

BREVO_API_KEY=your_brevo_api_key
ADMIN_EMAIL=your_admin_email@example.com

FRONTEND_URL=http://localhost:5173
ADMIN_FRONTEND_URL=http://localhost:5174

NODE_ENV=development
```

### Client: `client/.env`

```env
VITE_API_URL=http://localhost:5000
```

### Admin: `admin/.env`

```env
VITE_API_URL=http://localhost:5000
```

Important notes:

- Never commit real `.env` files.
- `JWT_SECRET` should be long and random.
- In production, `FRONTEND_URL` and `ADMIN_FRONTEND_URL` must match the deployed Vercel URLs.
- `VITE_API_URL` must point to the deployed backend URL in production.

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/Iamsushantgautam/skillnear.git
cd skillnear
```

### 2. Install root dependencies

```bash
npm install
```

The root package is mainly used to run all three apps together with `concurrently`.

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Install client dependencies

```bash
cd ../client
npm install
```

### 5. Install admin dependencies

```bash
cd ../admin
npm install
```

### 6. Create environment files

From the project root:

```bash
copy backend\.env.example backend\.env
copy client\.env.example client\.env
copy admin\.env.example admin\.env
```

On macOS/Linux:

```bash
cp backend/.env.example backend/.env
cp client/.env.example client/.env
cp admin/.env.example admin/.env
```

Then update the values inside each `.env` file.

### 7. Run the complete development workspace

From the project root:

```bash
npm run dev
```

This starts:

- Backend API on `http://localhost:5000`
- Client app on `http://localhost:5173`
- Admin app on `http://localhost:5174`

---

## Available Scripts

### Root

```bash
npm run dev
```

Runs backend, client, and admin together.

### Backend

```bash
npm run dev
npm start
npm test
```

- `npm run dev` starts the API with Nodemon.
- `npm start` starts the API with Node.
- `npm test` is currently a placeholder.

### Client

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

### Admin

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

---

## Application URLs

Local development:

- Client: `http://localhost:5173`
- Admin: `http://localhost:5174`
- Backend API: `http://localhost:5000`
- API health check: `http://localhost:5000/api/health`

Production examples:

- Client: `https://skillnear.vercel.app`
- Backend: Render service configured through `render.yaml`

---

## Backend API Overview

All backend routes are mounted under `/api`.

### Auth Routes: `/api/auth`

- `POST /register` - create a new account.
- `POST /login` - authenticate a user or admin.
- `POST /forgot-password` - request password reset OTP/email flow.
- `POST /reset-password` - reset password using OTP.
- `GET /profile` - get the logged-in user profile.
- `POST /become-provider` - submit provider application data.

### Service Routes: `/api/services`

Common service actions include:

- Browse services.
- Search by keyword/category/location/business type.
- Get nearby services.
- Get details for a service.
- Create provider gigs.
- Update provider gigs.
- Delete provider gigs.
- Get the logged-in provider's services.

Known route examples:

- `GET /nearby`
- `GET /mine`

### Booking Routes: `/api/bookings`

Common booking actions include:

- Create a booking.
- View customer bookings.
- View provider bookings.
- Update booking status.
- View booking details.
- Admin view of all bookings.

Known route examples:

- `GET /mybookings`
- `GET /provider`
- `GET /provider/stats`
- `GET /all`

### Message Routes: `/api/messages`

Used for chat history and room management.

Common actions include:

- Get chat rooms.
- Get messages for a room.
- Mark room messages as read.
- Delete a message or conversation.

### User Routes: `/api/users`

Common actions include:

- Get users.
- Get public profile by username.
- Update profile.
- Update saved location.
- Manage favorites.
- Admin user updates.
- Provider approval status updates.

### Upload Routes: `/api/upload`

- `POST /` - upload a file through protected middleware and store it in Cloudinary.

### Review Routes: `/api/reviews`

Known route examples:

- `GET /me` - reviews written by the logged-in user.
- `GET /provider` - reviews received by provider.
- `GET /service/:serviceId` - reviews for a service.
- `GET /check-eligibility/:serviceId` - verify if the user can review a service.

Common actions include creating, editing, and deleting reviews.

### Notification Routes: `/api/notifications`

- `GET /` - get logged-in user's notifications.
- `PUT /mark-read` - mark notifications as read.
- `DELETE /:id` - delete a notification.

### Withdrawal Routes: `/api/withdrawals`

Known route examples:

- `GET /my` - provider withdrawal history.

Common actions include creating withdrawal requests and viewing provider withdrawal status.

### Admin Routes: `/api/admin`

Known route examples:

- `GET /analytics`
- `GET /users`
- `POST /users`
- `GET /users/:userId/full-details`
- `PUT /users/:userId/role`
- `PUT /users/:userId/ban`
- `GET /services`
- `PUT /services/:serviceId/approve`
- `PUT /services/:serviceId/reject`
- `DELETE /services/:serviceId`
- `GET /media`
- `DELETE /media`
- `GET /withdrawals`
- `PUT /withdrawals/:id`

### Health Check

- `GET /api/health`

Response:

```json
{
  "status": "ok",
  "message": "SkillNear API is running"
}
```

---

## Real-Time Features

SkillNear uses Socket.IO for instant communication.

### Socket Events

Common events include:

- `setup` - joins a personal user room and marks the user online.
- `onlineUsers` - broadcasts active user IDs.
- `joinRoom` - joins a specific chat room.
- `sendMessage` - sends and persists a chat message.
- `receiveMessage` - receives a new message in real time.
- `typing` - emits typing status.
- `stopTyping` - clears typing status.
- `readMessages` - marks room messages as read.
- `messagesRead` - notifies the other user that messages were read.
- `markAsRead` - marks a single message as read.
- `messageRead` - broadcasts read status for one message.
- `newNotification` - sends notification updates instantly.
- `disconnect_user` - removes the user from active online tracking.

### Chat Storage

Messages are saved in MongoDB, which means users can reload the page and still see chat history.

### Offline Email Notification

When a provider is offline and receives a message, the backend can send an email notification using Brevo.

---

## Database Models

The backend uses Mongoose models in `backend/models`.

Main models:

- `User` - account, role, profile, location, provider status, favorites.
- `Service` - gig/service listing, category, pricing, location, provider, media.
- `Booking` - customer request, provider relationship, status, payment/revision details.
- `Message` - chat room messages, sender, receiver, read status, attachments.
- `Review` - service reviews and ratings.
- `Notification` - user notifications for messages and platform events.
- `Withdrawal` - provider payout/withdrawal requests.

---

## Main User Flows

### Customer Discovery Flow

1. User opens the client app.
2. User searches by category, keyword, or location.
3. User optionally enables geolocation.
4. App reverse-geocodes the user's location and saves city/state/pincode.
5. User views matching services or nearby map results.
6. User opens a service detail page.
7. User books the service or starts chat with the provider.

### Booking Flow

1. Customer selects a service.
2. Customer submits booking details.
3. Provider receives the request.
4. Provider accepts, rejects, or updates the booking.
5. Customer and provider communicate through chat.
6. Service is completed.
7. Customer can review the service.

### Provider Onboarding Flow

1. User creates an account.
2. User applies to become a provider.
3. Provider profile and application data are submitted.
4. Admin can review and approve provider/service details.
5. Provider creates gigs and starts receiving bookings.

### Admin Moderation Flow

1. Admin logs into the admin app.
2. Admin reviews analytics and platform activity.
3. Admin checks users, providers, services, bookings, media, and transactions.
4. Admin approves/rejects services, bans users, updates roles, and manages withdrawals.

---

## Admin Capabilities

The admin app includes pages for:

- Dashboard analytics
- Users
- User details
- User gallery
- User transactions
- Media gallery
- Services/categories
- Bookings/activity
- Transactions
- Withdrawal review
- Forgot password flow

Admin routes are protected on the frontend and backend. Only authenticated users with `admin` role should access protected admin screens.

---

## Seed and Demo Data Scripts

The backend contains helper scripts for creating local/demo service data:

- `seedLocal.js`
- `createBulkHomeServices.js`
- `createCategoryShops.js`
- `createFullGigs.js`
- `createMoreGigs.js`
- `createSalonGigs.js`
- `createTutorGigs.js`
- `createCarpenterGigs.js`

Run these only after configuring `backend/.env` with a valid MongoDB connection.

Example:

```bash
cd backend
node seedLocal.js
```

Review each script before running it, because seed scripts may create many records in the configured database.

---

## Deployment

### Backend on Render

The repository includes `render.yaml` for the backend service.

Render settings:

- Service type: Web
- Runtime: Node
- Root directory: `backend`
- Build command: `npm install`
- Start command: `node server.js`
- Default port value in config: `10000`

Required Render environment variables:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
BREVO_API_KEY=your_brevo_api_key
ADMIN_EMAIL=your_admin_email
FRONTEND_URL=your_client_vercel_url
ADMIN_FRONTEND_URL=your_admin_vercel_url
```

### Client on Vercel

Deploy the `client` folder as a Vercel project.

Set:

```env
VITE_API_URL=https://your-render-backend-url
```

Build command:

```bash
npm run build
```

Output directory:

```text
dist
```

### Admin on Vercel

Deploy the `admin` folder as a separate Vercel project.

Set:

```env
VITE_API_URL=https://your-render-backend-url
```

Build command:

```bash
npm run build
```

Output directory:

```text
dist
```

### Production CORS

The backend allows:

- `http://localhost:5173`
- `http://localhost:5174`
- `https://skillnear.sushant.online`
- `https://skillnear-admin.sushant.online`
- values from `FRONTEND_URL`
- values from `ADMIN_FRONTEND_URL`
- ngrok URLs for temporary development tunnels

Make sure production frontend URLs are set correctly in the backend environment.

---

## Security Notes

- Passwords are hashed with Bcrypt.js.
- JWT is used for protected routes.
- Admin and provider routes use role-based middleware.
- Cloudinary credentials must stay server-side only.
- Real environment values should never be committed.
- Production CORS should be kept restricted to known frontend domains.
- Use a strong `JWT_SECRET` and rotate it if leaked.
- Keep MongoDB credentials private and restrict database network access where possible.

---

## Troubleshooting

### Backend cannot connect to MongoDB

Check:

- `MONGODB_URI` is correct.
- Database user has the correct password.
- MongoDB Atlas network access allows your IP or deployment provider.
- The database name is included in the URI.

### Client cannot reach API

Check:

- Backend is running on `http://localhost:5000`.
- `client/.env` has `VITE_API_URL=http://localhost:5000`.
- Vite was restarted after changing `.env`.
- Browser console does not show CORS errors.

### Admin login fails

Check:

- The user exists in MongoDB.
- The user role is `admin`.
- `admin/.env` points to the correct backend.
- Backend JWT secret has not changed since the token was issued.

### Image upload fails

Check:

- Cloudinary environment variables are set.
- The upload route is called with authenticated request headers.
- The uploaded file field name matches backend upload middleware.

### Socket chat does not update instantly

Check:

- The frontend is connecting to the same API URL used by HTTP requests.
- Backend Socket.IO server is running.
- User ID is passed to the `setup` event.
- Both users joined the expected room.
- CORS settings include the frontend origin.

### Location detection does not work

Check:

- Browser location permission is allowed.
- The page is served over HTTPS in production.
- Localhost is allowed by the browser for geolocation testing.
- Reverse geocoding response includes city/state/pincode data for the location.

---

## Future Improvements

Possible next steps:

- Add integrated payment gateway.
- Add stronger booking lifecycle tracking.
- Add provider availability calendar.
- Add service-level coupons and promotions.
- Add Redis for online-user/session caching.
- Add automated backend tests.
- Add frontend component and route tests.
- Add admin audit logs.
- Add push notifications.
- Add stronger search with geospatial indexes.
- Add multilingual support.
- Add AI-based service recommendations.

---

## Additional Documentation

This repository also includes:

- `Project_Details.md` - deeper explanation of project goals, implementation details, and interview-style notes.
- `Project_Diagrams.md` - project diagrams and architecture references.

---

## Summary

SkillNear is a practical full-stack marketplace for local service discovery and booking. It combines location-aware search, provider dashboards, admin moderation, real-time chat, media uploads, reviews, notifications, and deployment-ready structure into one complete project.

Built for local communities, service providers, and customers who need trusted help nearby.
