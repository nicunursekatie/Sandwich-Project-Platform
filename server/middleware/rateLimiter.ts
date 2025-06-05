import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum number of requests per window
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
}

export function createRateLimit(config: RateLimitConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    
    // Clean up expired entries
    if (store[key] && now > store[key].resetTime) {
      delete store[key];
    }
    
    // Initialize or update store entry
    if (!store[key]) {
      store[key] = {
        count: 1,
        resetTime: now + config.windowMs
      };
    } else {
      store[key].count++;
    }
    
    const current = store[key];
    
    // Set headers
    if (config.standardHeaders !== false) {
      res.set({
        'RateLimit-Limit': config.max.toString(),
        'RateLimit-Remaining': Math.max(0, config.max - current.count).toString(),
        'RateLimit-Reset': Math.ceil(current.resetTime / 1000).toString()
      });
    }
    
    if (config.legacyHeaders !== false) {
      res.set({
        'X-RateLimit-Limit': config.max.toString(),
        'X-RateLimit-Remaining': Math.max(0, config.max - current.count).toString(),
        'X-RateLimit-Reset': Math.ceil(current.resetTime / 1000).toString()
      });
    }
    
    // Check if limit exceeded
    if (current.count > config.max) {
      res.status(429).json({
        error: config.message || 'Too many requests, please try again later.',
        retryAfter: Math.ceil((current.resetTime - now) / 1000)
      });
      return;
    }
    
    next();
  };
}

// Predefined rate limiters
export const generalRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many requests from this IP, please try again later.'
});

export const strictRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Rate limit exceeded, please wait before trying again.'
});

export const uploadRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 uploads per minute
  message: 'Upload rate limit exceeded, please wait before uploading again.'
});