import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { verifyRefreshToken } from "../../../lib/auth";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method === 'POST') { // Reserved for authenticated users
    // create a new blog post
    const user = verifyRefreshToken(req.headers.authorization || '');

    if (!user) {
      res.status(400).json({ message: 'Login required for blog post creation.' });
      return;
    }
    const { title, description, comments, codeTemplates, tags } = req.body as {
      title: string;
      description: string;
      comments: string;
      codeTemplates: string;
      tags: string;
    };

    try {
      const newPost = await prisma.blog.create({
        data: { 
          title, 
          description, 
          userId: parseInt(user.userId),
          comments,
          codeTemplates,
          tags
        },
      });
      res.status(201).json(newPost); // Return the created post
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(500).json({ message: "Failed to create blog post", error: (error as Error).message });
    }
  } else if (req.method === 'PUT') { // No special access required

    // ==== Code Block from ChatGPT opens =====
    const { title, description, codeTemplates, tags } = req.body as {
      title: string;
      description: string;
      codeTemplates: string;
      tags: string;
    };

    try {  
      // Build the "where" clause dynamically based on query parameters
      const whereClause = {
        ...(title && { title: { contains: title} }),
        ...(description && { description: { contains: description} }),
        ...(codeTemplates && { codeTemplates: { contains: codeTemplates } }),
        ...(tags && { tags: { contains: tags } }),
      };
      console.log(whereClause);
      // If there are no query parameters, return all blogs
      const blogs = await prisma.blog.findMany({
        where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      });
  
      res.status(200).json(blogs);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }

    // ==== Code Block from ChatGPT ends =====

  } else {
    res.status(405).json({ error: 'Method not allowed' }); // Enforce valid requests
  }
}
