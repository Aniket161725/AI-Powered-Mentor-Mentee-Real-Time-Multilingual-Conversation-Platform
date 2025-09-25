import { Router } from 'express';
const router = Router();
import chat from '../model/chatModel.js';

router.route('/:userId/:receiverId').get(async (req, res) => {
  const { userId, receiverId } = req.params;

  console.log('Fetching chat history for:', userId, receiverId);

  try {
    const messages = await chat.find({
      $or: [
        { sender: userId, receiver: receiverId },
        { sender: receiverId, receiver: userId }
      ]
    })
      .sort({ createdAt: 1 }) // sort messages in chronological order
      .lean(); // faster read, no mongoose instance

      console.log('Chat messages:', messages);
    res.json(messages);
  } catch (err) {
    console.error('Error fetching chat messages:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
