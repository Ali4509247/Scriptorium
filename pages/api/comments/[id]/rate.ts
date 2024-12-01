import { PrismaClient } from '@prisma/client';
import { verifyRefreshToken } from "../../../../lib/auth";
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query; // Comment ID
  const { voteType } = req.body; // 'upvote' or 'downvote'

  if (req.method === 'POST') {  

    const user = verifyRefreshToken(req.headers.authorization || ''); // Verify user's token
    
    // if (!user) { 
    //   return res.status(400).json({ message: 'Login required for rating a comment' });
    // }

    try {
      const incrementValue = voteType === 'upvote' ? 1 : voteType === 'downvote' ? -1 : 0;

      // Check if incrementValue is valid
      if (incrementValue === 0) {
        return res.status(400).json({ message: 'Invalid vote type' });
      }

      // Update comment rating
      const comment = await prisma.comment.update({
        where: { id: parseInt(id as string) },
        data: {
          netRatings: {
            increment: incrementValue,
          },
        },
      });

      res.status(200).json(comment);
    } catch (error) {
      console.error("Error updating comment rating:", error);
      res.status(500).json({ error: 'Failed to update comment rating' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}