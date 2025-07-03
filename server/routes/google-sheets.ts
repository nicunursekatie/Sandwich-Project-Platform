import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { googleSheets, insertGoogleSheetSchema } from '@shared/schema';
import { isAuthenticated } from '../temp-auth';

const router = Router();

// Helper function to generate URLs from sheet ID
function generateSheetUrls(sheetId: string) {
  const embedUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit?usp=sharing&widget=true&headers=false`;
  const directUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit?usp=sharing`;
  return { embedUrl, directUrl };
}

// Get all Google Sheets
router.get('/', async (req, res) => {
  try {
    const sheets = await db
      .select()
      .from(googleSheets)
      .orderBy(googleSheets.createdAt);

    res.json(sheets);
  } catch (error) {
    console.error('Error fetching Google Sheets:', error);
    res.status(500).json({ message: 'Failed to fetch Google Sheets' });
  }
});

// Get a specific Google Sheet
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid sheet ID' });
    }

    const [sheet] = await db
      .select()
      .from(googleSheets)
      .where(eq(googleSheets.id, id));

    if (!sheet) {
      return res.status(404).json({ message: 'Google Sheet not found' });
    }

    res.json(sheet);
  } catch (error) {
    console.error('Error fetching Google Sheet:', error);
    res.status(500).json({ message: 'Failed to fetch Google Sheet' });
  }
});

// Create a new Google Sheet entry
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const validatedData = insertGoogleSheetSchema.parse(req.body);
    const { embedUrl, directUrl } = generateSheetUrls(validatedData.sheetId);
    
    const user = (req as any).user;
    const userId = user?.id || user?.claims?.sub;

    const [newSheet] = await db
      .insert(googleSheets)
      .values({
        ...validatedData,
        embedUrl,
        directUrl,
        createdBy: userId,
      })
      .returning();

    res.status(201).json(newSheet);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Invalid input data',
        errors: error.errors 
      });
    }
    
    console.error('Error creating Google Sheet:', error);
    res.status(500).json({ message: 'Failed to create Google Sheet' });
  }
});

// Update a Google Sheet
router.patch('/:id', isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid sheet ID' });
    }

    const updateData = insertGoogleSheetSchema.partial().parse(req.body);
    
    // If sheetId is being updated, regenerate URLs
    let urlData = {};
    if (updateData.sheetId) {
      const { embedUrl, directUrl } = generateSheetUrls(updateData.sheetId);
      urlData = { embedUrl, directUrl };
    }

    const [updatedSheet] = await db
      .update(googleSheets)
      .set({
        ...updateData,
        ...urlData,
        updatedAt: new Date(),
      })
      .where(eq(googleSheets.id, id))
      .returning();

    if (!updatedSheet) {
      return res.status(404).json({ message: 'Google Sheet not found' });
    }

    res.json(updatedSheet);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Invalid input data',
        errors: error.errors 
      });
    }
    
    console.error('Error updating Google Sheet:', error);
    res.status(500).json({ message: 'Failed to update Google Sheet' });
  }
});

// Delete a Google Sheet
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid sheet ID' });
    }

    const [deletedSheet] = await db
      .delete(googleSheets)
      .where(eq(googleSheets.id, id))
      .returning();

    if (!deletedSheet) {
      return res.status(404).json({ message: 'Google Sheet not found' });
    }

    res.json({ message: 'Google Sheet deleted successfully' });
  } catch (error) {
    console.error('Error deleting Google Sheet:', error);
    res.status(500).json({ message: 'Failed to delete Google Sheet' });
  }
});

// Test Google Sheet accessibility
router.post('/:id/test', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid sheet ID' });
    }

    const [sheet] = await db
      .select()
      .from(googleSheets)
      .where(eq(googleSheets.id, id));

    if (!sheet) {
      return res.status(404).json({ message: 'Google Sheet not found' });
    }

    // Test if the sheet is accessible by making a simple HTTP request
    const response = await fetch(sheet.directUrl, { method: 'HEAD' });
    
    res.json({ 
      accessible: response.ok,
      status: response.status,
      message: response.ok ? 'Sheet is accessible' : 'Sheet may not be publicly accessible'
    });
  } catch (error) {
    console.error('Error testing Google Sheet accessibility:', error);
    res.json({ 
      accessible: false,
      message: 'Unable to test sheet accessibility'
    });
  }
});

export default router;