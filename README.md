# SkillNear: Premium Hyperlocal Service Marketplace

SkillNear is a comprehensive, full-stack service ecosystem designed to bridge the gap between skilled local professionals and people in need of home services. It acts as a digital bridge, allowing users to find, communicate with, and hire experts like electricians, tutors, salon professionals, and more, within their immediate vicinity.

---

## 🚀 Overview
SkillNear leverages a modern tech stack to provide a seamless, real-time experience for both service consumers and providers. Inspired by high-end platforms like Urban Company, it prioritizes a premium user interface, location-aware discovery, and instant communication.

### 🌐 Live Demo
Experience the platform live: **[skillnear.vercel.app](https://skillnear.vercel.app)**

### The Mission
To empower local skilled workers by providing them with digital visibility and to offer consumers a trustworthy, fast, and convenient way to access essential services at their doorstep.

---

## ✨ Key Features

### 🔍 Hyperlocal Discovery
- **Automatic Location Detection:** Uses advanced Geolocation APIs to find services in your current city and pincode.
- **Category Filtering:** Browse organized sections for diverse needs: Home Repair, Personal Care, Education, and more.
- **Interactive Maps:** Visualized service availability using integrated interactive mapping systems.

### 💬 Real-Time Ecosystem
- **Instant Messaging:** A secure chat system featuring typing indicators and online/offline status tracking.
- **Live Notifications:** Stay updated on booking requests and message arrivals instantly.

### 💼 Provider Management
- **Gig Creation:** Providers can showcase their skills with high-quality images, detailed descriptions, and custom pricing.
- **Dashboard Suite:** Comprehensive management for both desktop and mobile, allowing providers to track earnings, manage requests, and update their availability.
- **Payment Request System:** Streamlined flow for delivering services and requesting payments.

### 🛡️ Security & Reliability
- **Verified Profiles:** Clear badges for verified customers and top-rated professionals.
- **Secure Authentication:** Robust JWT-based login system with encrypted password protection.
- **Privacy Controls:** Selective visibility of customer contact details based on order status.

---

## 🛠️ Technology Stack

### Frontend (Modern UI/UX)
- **Framework:** React 19 (Vite)
- **State Management:** Zustand (Lightweight & Fast)
- **Routing:** React Router 7
- **Styling:** Custom CSS with Premium Design Tokens (Glassmorphism, High-contrast aesthetics)
- **Icons:** Lucide React
- **Real-time:** Socket.io-client

### Backend (Robust & Scalable)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **Real-time:** Socket.io
- **Media Management:** Cloudinary Integration for high-performance image storage.

---

## 🔄 How it Works

### 1. Discovery
Users enter the platform and either auto-detect their location or manually select their region. They can then browse or search for specific services available near them.

### 2. Interaction
A user selects a service and can initiate a chat with the provider to discuss details, or directly send a booking request.

### 3. Execution
The provider receives the request on their dashboard. Once accepted, the provider can navigate to the customer's location using integrated map links. After the service is started and completed, the provider requests payment.

### 4. Finalization
The customer approves the delivery, the payment is processed (digitally or via pre-defined methods), and both parties can leave reviews to maintain the community's trust.

---

## 🌟 Benefits
- **For Users:** Quick access to trusted experts, transparent pricing, and instant communication.
- **For Providers:** Professional digital presence, direct customer acquisition, and zero high-commission fees.
- **For the Community:** Strengthening the local economy by promoting "Skill Near You."

---

## ⚙️ Installation & Usage

### Prerequisites
- Node.js (Latest LTS)
- MongoDB Account

### Setup Steps
1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/skillnear.git
   ```
2. **Install Dependencies:**
   - For Backend: `cd backend && npm install`
   - For Client: `cd client && npm install`
3. **Configuration:**
   - Create a `.env` file in the root and backend directories.
   - Configure your MongoDB URI and Cloudinary credentials (refer to the documentation).
4. **Run the Application:**
   - Backend: `npm run dev` (from backend folder)
   - Client: `npm run dev` (from client folder)

---

## 📈 Future Scope
- **Integrated Payment Gateway:** Direct in-app transactions.
- **AI-Powered Matching:** Smart recommendations based on user behavior.
- **Global Expansion:** Multi-language support and internationalization for broader service reach.

---

*Built with ❤️ for the Local Community.*
