import express from 'express';
import {
  createNote,
  deleteNote,
  getAllNotes,
  getNoteById,
  updateNote,
  getAllPublicNotes,
} from '../controllers/notesController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/public', getAllPublicNotes);
router.get('/public/:id', getNoteById);

// Protected routes
router.use(protect);

// Get user's notes
router.get('/', getAllNotes);
router.get('/:id', getNoteById);

// Create New
router.post('/', createNote);

// Update
router.put('/:id', updateNote);

// Delete
router.delete('/:id', deleteNote);

export default router;
