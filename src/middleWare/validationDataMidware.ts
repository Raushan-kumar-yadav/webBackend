//import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import _ from 'lodash';
import { z } from 'zod';

declare global {
  namespace Express {
    interface Request {
      cleanBody?: any;
    }
  }
}

export function validateData(schema: z.ZodObject<any, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Strip unknown keys by only picking known schema fields BEFORE validation
      const knownFields = Object.keys(schema.shape);
      const cleanedBody = _.pick(req.body, knownFields);
      
      // Now validate the cleaned body
      const result = schema.safeParse(cleanedBody);
      
      if (!result.success) {
        const errorMessages = result.error.issues.map((issue) => ({
          message: `${issue.path.join('.')} is ${issue.message}`,
        }));
        return res.status(400).json({ 
          error: 'Invalid data', 
          details: errorMessages 
        });
      }
      
      // Store the validated and cleaned data
      req.cleanBody = result.data;
      next();
    } catch (error) {
      console.error('Unexpected error in validation middleware:', error);
      
      return res.status(500).json({ 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };
}
