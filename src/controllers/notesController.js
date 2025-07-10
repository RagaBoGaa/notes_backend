import mongoose from 'mongoose';
import Note from '../models/Note.js';

// Get All Public Notes (from all users)
export const getAllPublicNotes = async (req, res) => {
  try {
    const notes = await Note.find()
      .sort({
        createdAt: -1,
      })
      .populate('user', { name: 1, email: 1 });

    res.status(200).json({
      status: true,
      code: 200,
      message: 'Public notes fetched successfully!',
      data: notes,
    });
  } catch (error) {
    console.error('Error fetching public notes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get All Notes for a User
export const getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find({
      user: req.user._id,
    })
      .sort({
        createdAt: -1,
      })
      .populate('user', { name: 1, email: 1 });

    res.status(200).json({
      status: true,
      code: 200,
      message: 'Notes fetched successfully!',
      data: notes,
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Note By Id
export const getNoteById = async (req, res) => {
  const { id } = req.params;
  const isPublicRoute = req.originalUrl.includes('/public/');

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // If accessing via protected route, check if note belongs to user
    if (!isPublicRoute && note.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        status: false,
        code: 401,
        message: 'Not authorized to access this note',
      });
    }

    // Populate user info for both public and private routes
    await note.populate('user', 'name email');

    res.status(200).json({
      status: true,
      code: 200,
      message: 'Note fetched successfully',
      data: note,
    });
  } catch (error) {
    console.error('Error fetching note:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create New Note
export const createNote = async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  try {
    const newNote = new Note({
      title,
      content,
      user: req.user._id,
    });

    await newNote.save();

    // Populate user info before returning
    await newNote.populate('user', 'name email');

    res.status(201).json({
      status: true,
      code: 201,
      message: 'Note created successfully',
      data: newNote,
    });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update Note
export const updateNote = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  if (!title && !content) {
    return res.status(400).json({ message: 'No fields to update provided' });
  }

  try {
    const noteToUpdate = await Note.findById(id);

    if (!noteToUpdate) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check if note belongs to user
    if (noteToUpdate.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        status: false,
        code: 401,
        message: 'Not authorized to update this note',
      });
    }

    if (title) noteToUpdate.title = title;
    if (content) noteToUpdate.content = content;

    const updatedNote = await noteToUpdate.save();

    // Populate user info before returning
    await updatedNote.populate('user', 'name email');

    res.status(200).json({
      status: true,
      code: 200,
      message: 'Note updated successfully',
      data: updatedNote,
    });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete Note
export const deleteNote = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const note = await Note.findById(id).populate('user', 'name email');

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check if note belongs to user
    if (note.user._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        status: false,
        code: 401,
        message: 'Not authorized to delete this note',
      });
    }

    const deletedNote = await Note.findByIdAndDelete(id);

    // Populate user info for the deleted note response
    await deletedNote.populate('user', 'name email');

    res.status(200).json({
      status: true,
      code: 200,
      message: 'Note deleted successfully',
      data: deletedNote,
    });
  } catch (error) {
    console.error('Error deleting note:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};
