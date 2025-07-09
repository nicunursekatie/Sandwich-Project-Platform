import { Router } from 'express';
import { z } from 'zod';
import { storage } from './storage';
import { insertSuggestionSchema, insertSuggestionResponseSchema } from "@shared/schema";
import { isAuthenticated } from './temp-auth';
import { PERMISSIONS } from "@shared/auth-utils";

const router = Router();

// Permission middleware to check user permissions
const requirePermission = (permissions: string[]) => {
  return async (req: any, res: any, next: any) => {
    try {
      // Get user from session or req.user 
      let user = req.user || req.session?.user;

      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Always fetch fresh user data from database to ensure permissions are current
      if (user.email) {
        try {
          const freshUser = await storage.getUserByEmail(user.email);
          if (freshUser) {
            user = freshUser;
            req.user = freshUser;
          }
        } catch (dbError) {
          console.error("Database error in requirePermission:", dbError);
          // Continue with session user if database fails
        }
      }

      // Check if user has any of the required permissions
      const hasAnyPermission = permissions.some(permission => {
        // Super admins have all permissions
        if (user.role === "super_admin" || user.role === "admin") {
          return true;
        }
        // Check specific permission
        return user.permissions && user.permissions.includes(permission);
      });

      if (!hasAnyPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: "Permission check failed" });
    }
  };
};

// Get all suggestions
router.get('/', requirePermission([PERMISSIONS.VIEW_SUGGESTIONS]), async (req, res) => {
  try {
    const suggestions = await storage.getAllSuggestions();
    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

// Get single suggestion
router.get('/:id', requirePermission([PERMISSIONS.VIEW_SUGGESTIONS]), async (req, res) => {
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
router.post('/', requirePermission([PERMISSIONS.SUBMIT_SUGGESTIONS]), async (req, res) => {
  try {
    const validatedData = insertSuggestionSchema.parse(req.body);
    
    // Add user information from session
    const suggestionData = {
      ...validatedData,
      submittedBy: (req as any).user?.id || 'anonymous',
      submitterEmail: (req as any).user?.email || null,
      submitterName: (req as any).user?.firstName 
        ? `${(req as any).user.firstName} ${(req as any).user.lastName || ''}`.trim()
        : null
    };
    
    const suggestion = await storage.createSuggestion(suggestionData);
    res.status(201).json(suggestion);
  } catch (error) {
    if (error instanceof z.ZodError) {
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
router.patch('/:id', requirePermission([PERMISSIONS.MANAGE_SUGGESTIONS]), async (req, res) => {
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
router.delete('/:id', requirePermission([PERMISSIONS.MANAGE_SUGGESTIONS]), async (req, res) => {
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
router.post('/:id/upvote', requirePermission([PERMISSIONS.VIEW_SUGGESTIONS]), async (req, res) => {
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
router.get('/:id/responses', requirePermission([PERMISSIONS.VIEW_SUGGESTIONS]), async (req, res) => {
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
router.post('/:id/responses', requirePermission([PERMISSIONS.RESPOND_TO_SUGGESTIONS]), async (req, res) => {
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
router.delete('/responses/:responseId', requirePermission([PERMISSIONS.RESPOND_TO_SUGGESTIONS]), async (req, res) => {
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

export default router;