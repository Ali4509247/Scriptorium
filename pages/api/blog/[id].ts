import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Blog } from '@prisma/client';
import { verifyRefreshToken } from "../../../lib/auth";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };

  if (req.method === 'GET') {
    // Get a blog post by ID
    try {
      const post = await prisma.blog.findUnique({ 
        where: { id: parseInt(id) },
        // include: { codeTemplates: true }, // Include related templates for the response
      });
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({ error: 'Blog post not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve blog post' });
    }

  } else if (req.method === 'PUT') {

    const user = verifyRefreshToken(req.headers.authorization || ''); // Verify user's token
    
    if (!user) { 
      return res.status(400).json({ message: 'Login required for blog post editing.' });
    }

    const { title, description, comments, codeTemplates, tags } = req.body as {
      title: string;
      description: string;
      comments: string;
      codeTemplates: string;
      tags: string;
    };

    try {
      // Prepare the blog data, excluding templates initially
      const data = { title, description, comments, codeTemplates, tags };

      const updatedPost: Blog = await prisma.blog.update({
        where: { id: parseInt(id) },
        data
      });

      res.status(200).json(updatedPost);
    } catch (error) {
      console.error("Error updating blog post:", error);
      res.status(500).json({ error: 'Failed to update blog post' });
    }

  } else if (req.method === 'DELETE') {

    const user = verifyRefreshToken(req.headers.authorization || '');
    
    if (!user) {
      return res.status(400).json({ message: 'Login required for blog post deletion' });
    }

    try {
      await prisma.blog.delete({ where: { id: parseInt(id) } });
      res.status(204).json({ message: 'Blog post deleted' });
    } catch (error) { 
      res.status(500).json({ error: 'Failed to delete blog post' });
    }

  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}