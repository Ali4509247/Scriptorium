import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { verifyRefreshToken } from "../../../../lib/auth";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  // ==== CHATGPT assisted code block opens ==== //

  const { id } = req.query; // Blog post ID
  const { voteType } = req.body; // 'upvote' or 'downvote'

  if (req.method === 'POST') { 

    const user = verifyRefreshToken(req.headers.authorization as string); // Verify user's token
    
    if (!user) { 
      return res.status(400).json({ message: 'Login required for rating a blog post' });
    }
    console.log(`voteType: ${voteType}`)
    const incrementValue = voteType === 'upvote' ? 1 : voteType === 'downvote' ? -1 : 0;

    // Check if incrementValue is valid
    if (incrementValue === 0) {
      return res.status(400).json({ message: 'Invalid vote type' });
    }

    // Update blog rating
    const blog = await prisma.blog.update({
      where: { id: parseInt(id as string) },
      data: {
        netRatings: {
          increment: incrementValue,
        },
      },
    });

    res.status(200).json(blog);

    // ==== CHATGPT assisted code block ends ==== //
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}