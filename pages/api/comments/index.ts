import { PrismaClient } from '@prisma/client';
import { verifyRefreshToken } from "../../../lib/auth";
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const user = verifyRefreshToken(req.headers.authorization as string); // Verify user's token
    
    // if (!user) { 
    //   return res.status(400).json({ message: 'Login required for commenting on a blog' });
    // }

    const { blogId, content } = req.body as { blogId: string, content: string }; // Extract blogId and content from the request body

    try {
      const newComment = await prisma.comment.create({
        data: {
          blogId: parseInt(blogId), 
          content
        },
      });
      res.status(201).json(newComment);
    } catch (error) {
      console.error("Error adding comment:", error); // Log error for debugging
      res.status(500).json({ error: 'Failed to add comment' });
    }

  } 
  else {
    res.status(405).json({ error: "Method not allowed." }); // Enforce valid requests
  }
}