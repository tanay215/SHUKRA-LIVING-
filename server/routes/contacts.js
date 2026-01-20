
import express from 'express';
import Contact from '../models/Contact.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { catchAsync, AppError } from '../utils/errorHandler.js';

const router = express.Router();

// Public: Submit a contact message
router.post('/', catchAsync(async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        throw new AppError('Name, email, and message are required', 400);
    }

    const contact = await Contact.create({
        name,
        email,
        message
    });

    res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        contact
    });
}));

// Admin: Get all messages
router.get('/', authenticateAdmin, catchAsync(async (req, res) => {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
}));

// Admin: Update message status (e.g. mark as read)
router.put('/:id', authenticateAdmin, catchAsync(async (req, res) => {
    const { status } = req.body;

    const contact = await Contact.findByIdAndUpdate(
        req.params.id,
        {
            status,
            readAt: status === 'Read' ? new Date() : undefined
        },
        { new: true }
    );

    if (!contact) {
        throw new AppError('Message not found', 404);
    }

    res.json(contact);
}));

// Admin: Delete message
router.delete('/:id', authenticateAdmin, catchAsync(async (req, res) => {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
        throw new AppError('Message not found', 404);
    }

    res.json({ message: 'Message deleted' });
}));

export default router;
