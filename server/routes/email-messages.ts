import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { storage } from '../storage';

const router = Router();

// Get messages for a specific folder
router.get('/', requireAuth, async (req, res) => {
  try {
    const { folder = 'inbox', search } = req.query;
    const userId = req.user!.id;
    
    // For now, return sample data structure
    const sampleMessages = [
      {
        id: 1,
        subject: "Welcome to The Sandwich Project!",
        content: "Thank you for joining our mission to fight hunger in Georgia...",
        sender: "admin@sandwich.project",
        recipient: userId,
        timestamp: new Date().toISOString(),
        isRead: false,
        isStarred: false,
        folder: 'inbox',
        isKudos: false
      },
      {
        id: 2,
        subject: "Great work on the collection drive!",
        content: "Your efforts in organizing the community collection were outstanding. Thank you for your dedication!",
        sender: "team@sandwich.project",
        recipient: userId,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        isStarred: false,
        folder: 'kudos',
        isKudos: true
      }
    ];

    let filteredMessages = sampleMessages.filter(msg => msg.folder === folder);
    
    if (search) {
      filteredMessages = filteredMessages.filter(msg => 
        msg.subject.toLowerCase().includes(search.toString().toLowerCase()) ||
        msg.content.toLowerCase().includes(search.toString().toLowerCase()) ||
        msg.sender.toLowerCase().includes(search.toString().toLowerCase())
      );
    }

    res.json(filteredMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get email threads
router.get('/threads', requireAuth, async (req, res) => {
  try {
    const { folder = 'inbox' } = req.query;
    
    // Sample threads data
    const sampleThreads = [
      {
        id: 1,
        subject: "Project Update Discussion",
        participants: ["admin@sandwich.project", req.user!.email],
        messageCount: 3,
        lastActivity: new Date().toISOString(),
        messages: []
      }
    ];

    res.json(sampleThreads);
  } catch (error) {
    console.error('Error fetching threads:', error);
    res.status(500).json({ error: 'Failed to fetch threads' });
  }
});

// Send/create new message
router.post('/', requireAuth, async (req, res) => {
  try {
    const { to, subject, content, isKudos = false } = req.body;
    const userId = req.user!.id;
    
    const newMessage = {
      id: Date.now(), // Temporary ID generation
      subject,
      content,
      sender: req.user!.email,
      recipient: to,
      timestamp: new Date().toISOString(),
      isRead: false,
      isStarred: false,
      folder: isKudos ? 'kudos' : 'sent',
      isKudos
    };

    // In a real implementation, save to database
    console.log('New message created:', newMessage);
    
    res.json(newMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
});

// Update message (mark as read, star, move to folder)
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // In a real implementation, update in database
    console.log(`Updating message ${id}:`, updates);
    
    res.json({ success: true, id, updates });
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

// Delete message
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real implementation, delete from database
    console.log(`Deleting message ${id}`);
    
    res.json({ success: true, id });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

export default router;