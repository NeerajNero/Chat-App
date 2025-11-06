# 🚀 Full-Stack Real-Time Chat Application

This is a complete, real-time chat application built from scratch with a modern monorepo structure. It features a secure NestJS backend with WebSockets and a reactive Next.js frontend.

The entire application is built with TypeScript and features a secure, cookie-based authentication system (JWT) with both local email/password and Google OAuth 2.0 strategies.

Chat App Demo

---

## ✨ Key Features

* **Real-Time Communication:** Uses **WebSockets** (Socket.IO) for instant message delivery.
* **Live User Presence:** Users appear "Online" or "Offline" to all other users in real-time.
* **Secure Authentication:** Robust auth system built with Passport.js.
    * Local (email/password) strategy with `bcrypt` hashing.
    * Google OAuth 2.0 strategy for one-click sign-in/signup.
* **`httpOnly` Cookie Sessions:** Uses secure, cookie-based JWTs for session management.
* **1-on-1 Conversations:** Users can see a list of all other users and click "Chat" to start a new 1-on-1 conversation (or open an existing one).
* **Dynamic Chat Rooms:** The backend dynamically creates Socket.IO "rooms" for each conversation, ensuring messages are private.
* **Database & ORM:** All data (`User`, `Conversation`, `Message`) is stored in a PostgreSQL database and managed with Prisma.
* **Fully Responsive:** A clean, mobile-first design using Tailwind CSS and Shadcn UI.

---

## 🛠️ Tech Stack

### 🖥️ Frontend (Client - `/web`)

* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS & Shadcn UI
* **State Management:** Tanstack Query (React Query)
* **Real-time:** `socket.io-client`
* **Helpers:** `axios`, `react-hook-form`

### ⚙️ Backend (Server - `/api`)

* **Framework:** NestJS
* **Language:** TypeScript
* **Real-time:** `@nestjs/websockets` (Socket.IO)
* **Authentication:** Passport.js (`passport-jwt`, `passport-local`, `passport-google-oauth20`)
* **Database ORM:** Prisma
* **Database:** PostgreSQL
* **Security:** `helmet`, `bcrypt`, `class-validator`, `cookie-parser`

---

## 🚀 Getting Started (Local Development)

Follow these steps to get the project running on your local machine.

### Prerequisites

* [Node.js](https://nodejs.org/en) (v18 or later)
* [Docker](https://www.docker.com/products/docker-desktop/)
* A package manager (`npm` or `yarn`)

### 1. Clone & Install Dependencies

First, clone the repository and install dependencies for both the `api` and `web` projects.

```bash
# Clone the repo
git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
cd your-repo-name

# Install backend dependencies
cd api
npm install

# Install frontend dependencies
cd ../web
npm install
