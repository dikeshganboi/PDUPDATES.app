# 🚀 Blog Web Application

A modern, full-stack blog platform for influencers built with **Next.js**, **Node.js**, **Express**, and **MongoDB**.

## 📋 Features

- ✅ **Public Blog Interface** - Browse, read, and search blogs
- ✅ **Admin Dashboard** - Secure panel for content management
- ✅ **Rich Text Editor** - Professional blog writing experience
- ✅ **Image Upload** - Cloudinary integration
- ✅ **Authentication** - JWT-based auth with role-based access
- ✅ **SEO Optimized** - Server-side rendering with Next.js
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Comments & Likes** - User engagement features
- ✅ **Categories & Tags** - Organized content structure

## 🛠️ Tech Stack

### Frontend

- **Next.js** - React framework with SSR
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client
- **React Icons** - Icon library

### Backend

- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **JWT** - Authentication
- **Bcrypt** - Password hashing

## 📁 Project Structure

```
blog-app/
├── client/           # Frontend (Next.js)
│   ├── app/          # Next.js app router
│   ├── components/   # React components
│   ├── lib/          # Utilities & API calls
│   └── public/       # Static assets
├── server/           # Backend (Node.js)
│   ├── config/       # Database config
│   ├── controllers/  # Route controllers
│   ├── models/       # MongoDB models
│   ├── routes/       # API routes
│   └── middleware/   # Auth & error handling
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd BLOG_WEB_APP
```

2. **Setup Backend**

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your actual values (MongoDB URI, JWT secret, etc.)
npm run dev
```

3. **Setup Frontend**

```bash
cd ../client
npm install
cp .env.example .env.local
# Edit .env.local with your actual values
npm run dev
```

4. **Open your browser**

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🔐 Environment Variables

### Backend (server/.env)

| Variable                   | Description                                            |
| -------------------------- | ------------------------------------------------------ |
| `PORT`                     | Server port (default: 5000)                            |
| `NODE_ENV`                 | Environment mode (`development` / `production`)        |
| `MONGO_URI`                | MongoDB Atlas connection string                        |
| `JWT_SECRET`               | Secret key for JWT tokens (min 32 chars)               |
| `CLIENT_URL`               | Frontend URL for CORS (default: http://localhost:3000) |
| `ADMIN_SETUP_KEY`          | Bootstrap key for initial admin creation               |
| `MAX_COMMENT_THREAD_DEPTH` | Nested comment depth (default: 2)                      |

### Frontend (client/.env.local)

| Variable                               | Description                      |
| -------------------------------------- | -------------------------------- |
| `NEXT_PUBLIC_API_URL`                  | Backend API base URL             |
| `NEXT_PUBLIC_SOCKET_URL`               | WebSocket server URL             |
| `NEXT_PUBLIC_SITE_URL`                 | Public site URL for SEO metadata |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`    | Cloudinary cloud name            |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Cloudinary upload preset         |

## 📚 API Endpoints

```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login user
GET    /api/blogs            - Get all blogs
GET    /api/blogs/:slug      - Get single blog
POST   /api/blogs            - Create blog (admin)
PUT    /api/blogs/:id        - Update blog (admin)
DELETE /api/blogs/:id        - Delete blog (admin)
```

## 👨‍💻 Development

```bash
# Run frontend dev server
cd client && npm run dev

# Run backend dev server
cd server && npm run dev
```

## 🧪 Testing

```bash
# Frontend build
cd client && npm run build

# Test backend API
curl http://localhost:5000/api/health
```

## 📦 Deployment

- **Frontend**: [Vercel](https://vercel.com) — connect client/ directory
- **Backend**: [Render](https://render.com) — connect server/ directory
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas)

## 📄 License

ISC
