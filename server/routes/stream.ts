import { Router } from "express";
import { StreamChat } from "stream-chat";

export const streamRoutes = Router();

// Initialize Stream Chat server client (server-side only)
let streamServerClient: StreamChat | null = null;

const initializeStreamServer = () => {
  try {
    const apiKey = process.env.STREAM_API_KEY;
    const apiSecret = process.env.STREAM_API_SECRET;
    
    if (!apiKey || !apiSecret) {
      console.log('Stream Chat credentials not found in environment variables');
      return null;
    }
    
    streamServerClient = StreamChat.getInstance(apiKey, apiSecret);
    return streamServerClient;
  } catch (error) {
    console.error('Failed to initialize Stream Chat server:', error);
    return null;
  }
};

// Get Stream Chat credentials and generate user token
streamRoutes.post("/credentials", async (req, res) => {
  try {
    console.log('=== STREAM CREDENTIALS ENDPOINT ===');
    console.log('User from req.user:', req.user);
    console.log('User from session:', req.session?.user);
    console.log('Session exists:', !!req.session);
    console.log('Session ID:', req.sessionID);
    
    const user = req.user || req.session?.user;
    if (!user) {
      console.log('❌ No user found in request or session');
      return res.status(401).json({ error: "Authentication required" });
    }
    
    console.log('✅ User authenticated:', user.email);

    const apiKey = process.env.STREAM_API_KEY;
    const apiSecret = process.env.STREAM_API_SECRET;

    if (!apiKey || !apiSecret) {
      return res.status(500).json({ 
        error: "Stream Chat not configured",
        message: "Please add STREAM_API_KEY and STREAM_API_SECRET to environment variables"
      });
    }

    // Initialize server client if not already done
    if (!streamServerClient) {
      streamServerClient = initializeStreamServer();
      if (!streamServerClient) {
        return res.status(500).json({ error: "Failed to initialize Stream Chat" });
      }
    }

    // Create Stream user ID based on app user ID
    const streamUserId = `user_${user.id}`;

    try {
      // Create or update user in Stream
      await streamServerClient.upsertUser({
        id: streamUserId,
        name: `${user.firstName} ${user.lastName}` || user.email,
        email: user.email,
        role: user.role || 'user'
      });

      // Generate user token
      const userToken = streamServerClient.createToken(streamUserId);

      res.json({
        apiKey,
        userToken,
        streamUserId
      });

    } catch (streamError) {
      console.error('❌ Stream Chat user creation error:', streamError);
      res.status(500).json({ 
        error: "Failed to create Stream user",
        message: streamError.message || "Check Stream Chat credentials and network connectivity"
      });
    }

  } catch (error) {
    console.error('❌ Stream credentials error:', error);
    res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
});

// Create a channel for messaging
streamRoutes.post("/channels", async (req, res) => {
  try {
    const user = req.user || req.session?.user;
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { participants, channelType = 'messaging' } = req.body;

    if (!streamServerClient) {
      return res.status(500).json({ error: "Stream Chat not initialized" });
    }

    const streamUserId = `user_${user.id}`;
    
    // Create channel
    const channel = streamServerClient.channel(channelType, {
      members: [streamUserId, ...participants.map((p: string) => `user_${p}`)],
      created_by_id: streamUserId,
    });

    await channel.create();

    res.json({
      channelId: channel.id,
      channelType: channel.type,
      members: channel.data?.members || []
    });

  } catch (error) {
    console.error('Channel creation error:', error);
    res.status(500).json({ error: "Failed to create channel" });
  }
});