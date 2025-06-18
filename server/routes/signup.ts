import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import type { InsertUser } from "@shared/schema";

const router = Router();

const signupSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  zipCode: z.string().min(5),
  role: z.enum(["volunteer", "host", "driver", "coordinator"]),
  availability: z.array(z.string()).min(1),
  interests: z.array(z.string()).optional(),
  emergencyContact: z.string().min(5),
  agreeToTerms: z.boolean().refine(val => val === true),
  agreeToBackground: z.boolean().optional(),
});

router.post("/auth/signup", async (req, res) => {
  try {
    // Validate request body
    const validatedData = signupSchema.parse(req.body);
    
    // Create user account with registration data
    const userData: InsertUser = {
      email: validatedData.email,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      role: validatedData.role,
      isActive: false, // Requires approval
    };

    const newUser = await storage.createUser(userData);

    // Store registration details in a simple format for admin review
    console.log(`
=== NEW USER REGISTRATION ===
Name: ${validatedData.firstName} ${validatedData.lastName}
Email: ${validatedData.email}
Phone: ${validatedData.phone}
Role: ${validatedData.role}
Address: ${validatedData.address}, ${validatedData.city}, ${validatedData.state} ${validatedData.zipCode}
Availability: ${validatedData.availability.join(', ')}
Interests: ${validatedData.interests?.join(', ') || 'None specified'}
Emergency Contact: ${validatedData.emergencyContact}
Terms Agreed: ${validatedData.agreeToTerms}
Background Check Consent: ${validatedData.agreeToBackground || false}
Registration Date: ${new Date().toISOString()}
=============================
    `);

    res.status(201).json({
      message: "Registration successful. Your application will be reviewed and you'll be contacted soon.",
      userId: newUser.id
    });

  } catch (error) {
    console.error("Signup error:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid registration data",
        errors: error.errors
      });
    }

    res.status(500).json({
      message: "Registration failed. Please try again later."
    });
  }
});

// Get pending registrations (admin only)
router.get("/auth/pending-registrations", async (req, res) => {
  try {
    // In a real implementation, check admin permissions here
    const users = await storage.getAllUsers();
    const pendingUsers = users.filter(user => 
      user.metadata?.status === "pending_approval" && !user.isActive
    );

    res.json(pendingUsers);
  } catch (error) {
    console.error("Error fetching pending registrations:", error);
    res.status(500).json({ message: "Failed to fetch pending registrations" });
  }
});

// Approve user registration (admin only)
router.patch("/auth/approve-user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { approved } = req.body;

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updates = {
      isActive: approved,
      metadata: {
        ...user.metadata,
        status: approved ? "approved" : "rejected",
        approvedDate: approved ? new Date().toISOString() : undefined
      }
    };

    await storage.updateUser(userId, updates);

    res.json({
      message: `User ${approved ? 'approved' : 'rejected'} successfully`
    });

  } catch (error) {
    console.error("Error updating user approval:", error);
    res.status(500).json({ message: "Failed to update user status" });
  }
});

export { router as signupRoutes };