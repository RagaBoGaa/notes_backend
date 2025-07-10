import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import notesRoutes from './routes/noteRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { connectDB } from './config/db.js';
import rateLimiter from './middleware/rateLimiter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7500;

// Middleware
app.use(express.json());
app.use(rateLimiter);
app.use(multer().none());
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://notesfs.vercel.app'],
    credentials: true,
  })
);
app.use(cookieParser());

// Routes
app.use('/api/notes', notesRoutes);
app.use('/api/users', userRoutes);

// Database Connection
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
