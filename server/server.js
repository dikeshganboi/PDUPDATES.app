import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Server as SocketIOServer } from 'socket.io';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL, process.env.CLIENT_URL.replace('https://', 'https://www.')]
  : ['http://localhost:3000'];

const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  socket.on('joinUser', (userId) => {
    if (userId) {
      socket.join(`user:${userId}`);
    }
  });

  socket.on('leaveUser', (userId) => {
    if (userId) {
      socket.leave(`user:${userId}`);
    }
  });

  socket.on('joinBlog', (blogId) => {
    if (blogId) {
      socket.join(`blog:${blogId}`);
    }
  });

  socket.on('leaveBlog', (blogId) => {
    if (blogId) {
      socket.leave(`blog:${blogId}`);
    }
  });
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth attempts, please try again later.' },
});

// Routes
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Blog API is running!',
    status: 'success',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    message: '✅ Test route is working',
    status: 'ok',
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: 'connected',
    uptime: process.uptime(),
  });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/blogs', apiLimiter, blogRoutes);
app.use('/api/comments', apiLimiter, commentRoutes);
app.use('/api/users', apiLimiter, userRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
