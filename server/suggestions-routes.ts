import { Router } from 'express';
import { z } from 'zod';
import { storage } from './storage';
import { insertSuggestionSchema, insertSuggestionResponseSchema } from "@shared/schema";
import { isAuthenticated, requirePermission } from './temp-auth';
import { PERMISSIONS } from "@shared/auth-utils";
import { sendSuggestionNotification } from './sendgrid';

const router = Router();

// Use the requirePermission middleware from temp-auth

// Get all suggestions
router.get('/', requirePermission(PERMISSIONS.ACCESS_SUGGESTIONS), async (req, res) => {
  try {
    const suggestions = await storage.getAllSuggestions();
    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

// Get single suggestion
router.get('/:id', requirePermission(PERMISSIONS.ACCESS_SUGGESTIONS), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const suggestion = await storage.getSuggestion(id);
    if (!suggestion) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }
    res.json(suggestion);
  } catch (error) {
    console.error('Error fetching suggestion:', error);
    res.status(500).json({ error: 'Failed to fetch suggestion' });
  }
});

// Create new suggestion
router.post('/', requirePermission(PERMISSIONS.SUBMIT_SUGGESTIONS), async (req, res) => {
  try {
    console.log('=== SUGGESTION SUBMISSION DEBUG ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User from request:', (req as any).user);
    console.log('Session:', req.session);
    console.log('Session user:', req.session?.user);
    
    const validatedData = insertSuggestionSchema.parse(req.body);
    
    // Add user information from session
    const user = (req as any).user || req.session?.user;
    const suggestionData = {
      ...validatedData,
      submittedBy: user?.id || 'anonymous',
      submitterEmail: user?.email || null,
      submitterName: user?.firstName 
        ? `${user.firstName} ${user.lastName || ''}`.trim()
        : null
    };
    
    const suggestion = await storage.createSuggestion(suggestionData);
    
    // Send email notification to developer (no user notification needed)
    try {
      const emailSuccess = await sendSuggestionNotification({
        title: suggestion.title,
        description: suggestion.description,
        category: suggestion.category,
        priority: suggestion.priority,
        submittedBy: suggestionData.submitterName || suggestionData.submitterEmail || 'Anonymous',
        submittedAt: suggestion.createdAt || new Date(),
      });
      
      if (emailSuccess) {
        console.log('Developer notification email sent successfully for suggestion:', suggestion.id);
      } else {
        console.warn('Failed to send developer notification email for suggestion:', suggestion.id);
      }
    } catch (emailError) {
      console.error('Error sending developer notification email:', emailError);
      // Don't fail the suggestion creation if email fails
    }
    
    res.status(201).json(suggestion);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('=== VALIDATION ERROR ===');
      console.log('Zod validation errors:', JSON.stringify(error.errors, null, 2));
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    console.error('Error creating suggestion:', error);
    res.status(500).json({ error: 'Failed to create suggestion' });
  }
});

// Update suggestion (admin only)
router.patch('/:id', requirePermission(PERMISSIONS.MANAGE_SUGGESTIONS), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    
    const suggestion = await storage.updateSuggestion(id, updates);
    if (!suggestion) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }
    res.json(suggestion);
  } catch (error) {
    console.error('Error updating suggestion:', error);
    res.status(500).json({ error: 'Failed to update suggestion' });
  }
});

// Delete suggestion (admin only)
router.delete('/:id', requirePermission(PERMISSIONS.MANAGE_SUGGESTIONS), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.deleteSuggestion(id);
    if (!success) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting suggestion:', error);
    res.status(500).json({ error: 'Failed to delete suggestion' });
  }
});

// Upvote suggestion
router.post('/:id/upvote', requirePermission(PERMISSIONS.ACCESS_SUGGESTIONS), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.upvoteSuggestion(id);
    if (!success) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error upvoting suggestion:', error);
    res.status(500).json({ error: 'Failed to upvote suggestion' });
  }
});

// Get responses for a suggestion
router.get('/:id/responses', requirePermission(PERMISSIONS.ACCESS_SUGGESTIONS), async (req, res) => {
  try {
    const suggestionId = parseInt(req.params.id);
    const responses = await storage.getSuggestionResponses(suggestionId);
    res.json(responses);
  } catch (error) {
    console.error('Error fetching suggestion responses:', error);
    res.status(500).json({ error: 'Failed to fetch responses' });
  }
});

// Create response to suggestion
router.post('/:id/responses', requirePermission(PERMISSIONS.MANAGE_SUGGESTIONS), async (req, res) => {
  try {
    const suggestionId = parseInt(req.params.id);
    const validatedData = insertSuggestionResponseSchema.parse(req.body);
    
    // Add response data with user information
    const responseData = {
      ...validatedData,
      suggestionId,
      respondedBy: (req as any).user?.id || 'anonymous',
      respondentName: (req as any).user?.firstName 
        ? `${(req as any).user.firstName} ${(req as any).user.lastName || ''}`.trim()
        : null,
      isAdminResponse: (req as any).user?.permissions?.includes(PERMISSIONS.MANAGE_SUGGESTIONS) || false
    };
    
    const response = await storage.createSuggestionResponse(responseData);
    res.status(201).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    console.error('Error creating suggestion response:', error);
    res.status(500).json({ error: 'Failed to create response' });
  }
});

// Delete response (admin or response author only)
router.delete('/responses/:responseId', requirePermission(PERMISSIONS.MANAGE_SUGGESTIONS), async (req, res) => {
  try {
    const responseId = parseInt(req.params.responseId);
    const success = await storage.deleteSuggestionResponse(responseId);
    if (!success) {
      return res.status(404).json({ error: 'Response not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting suggestion response:', error);
    res.status(500).json({ error: 'Failed to delete response' });
  }
});

// Send clarification request to suggestion creator
router.post('/:id/clarification', requirePermission(PERMISSIONS.MANAGE_SUGGESTIONS), async (req, res) => {
  try {
    const suggestionId = parseInt(req.params.id);
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Get the suggestion to find the creator
    const suggestion = await storage.getSuggestion(suggestionId);
    if (!suggestion) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }
    
    // Get the current user (who is requesting clarification)
    const currentUser = (req as any).user;
    if (!currentUser) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Get the suggestion creator's user ID
    const creatorUserId = suggestion.submittedBy;
    
    if (!creatorUserId || creatorUserId === 'anonymous') {
      return res.status(400).json({ error: 'Cannot send clarification to anonymous suggestion' });
    }
    
    console.log(`[CLARIFICATION] Sending clarification request from ${currentUser.id} to ${creatorUserId} for suggestion ${suggestionId}`);
    
    // Create or find direct conversation between current user and suggestion creator
    let conversation = await storage.getDirectConversation(currentUser.id, creatorUserId);
    
    if (!conversation) {
      // Create new direct conversation
      const conversationData = {
        name: `Direct Message`,
        description: `Direct conversation between ${currentUser.firstName || 'User'} and suggestion creator`,
        type: 'direct',
        isPrivate: true,
        createdBy: currentUser.id
      };
      
      conversation = await storage.createConversation(conversationData);
      
      // Add both participants
      await storage.addConversationParticipant({
        conversationId: conversation.id,
        userId: currentUser.id,
        role: 'admin'
      });
      
      await storage.addConversationParticipant({
        conversationId: conversation.id,
        userId: creatorUserId,
        role: 'member'
      });
      
      console.log(`[CLARIFICATION] Created new direct conversation ${conversation.id}`);
    }
    
    // Send clarification message
    const clarificationMessage = `📝 Clarification request for your suggestion "${suggestion.title}":\n\n${message}`;
    
    const messageData = {
      conversationId: conversation.id,
      userId: currentUser.id,
      content: clarificationMessage,
      sender: `${currentUser.firstName || 'Admin'} ${currentUser.lastName || 'User'}`.trim()
    };
    
    const sentMessage = await storage.createMessage(messageData);
    console.log(`[CLARIFICATION] Sent clarification message ${sentMessage.id} in conversation ${conversation.id}`);
    
    res.json({ 
      success: true, 
      message: 'Clarification request sent successfully',
      conversationId: conversation.id,
      messageId: sentMessage.id
    });
    
  } catch (error) {
    console.error('Error sending clarification request:', error);
    res.status(500).json({ error: 'Failed to send clarification request' });
  }
});

export default router;