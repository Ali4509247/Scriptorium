import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { verifyRefreshToken } from "../../../lib/auth";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const user = verifyRefreshToken(req.headers.authorization || '');
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const { title, explanation, userID, language, tags, code, forked } = req.body as {
      title: string;
      explanation: string;
      userID: number;
      language: string;
      tags?: string;
      code: string;
      forked?: boolean;
    };

    if (!title || !explanation || !code || !userID) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const tagsValue = tags || "";

    try {
      const user = await prisma.user.findUnique({
        where: { id: userID },
      });

      if (!user) {
        return res.status(400).json({ message: "Invalid User" });
      }

      var forked_Template = false;
      if (forked){
        forked_Template = true;
      }

      const newTemplate = await prisma.template.create({
        data: {
          title,
          explanation,
          language,
          tags: tagsValue,
          code,
          userId: userID,
          forked: forked_Template
        },
      });

      res.status(201).json(newTemplate);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error creating template' });
    }

  } else if (req.method === "GET") {
    const { id, title, language, tags, userID } = req.query as {
      id?: string;
      title?: string;
      language?: string;
      tags?: string;
      userID?: string;
    };

    try {
      const filters: Record<string, any> = {};

      if (language) {
        filters.language = {
          contains: language,
        };
      }

      if (id) {
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId)) {
          return res.status(400).json({ message: "Invalid id" });
        }
        filters.id = parsedId;
      }

      if (title) {
        filters.title = {
          contains: title,
        };
      }

      if (userID) {
        filters.userID = {
          contains: userID,
        };
      }

      if (tags) {
        const tagsArray = tags.trim().split(',');
        filters.tags = {
          some: {
            name: {
              in: tagsArray,
            },
          },
        };
      }

      const templates = await prisma.template.findMany({
        where: filters,
      });

      if (id && templates.length === 0) {
        return res.status(404).json({ message: "Template not found" });
      }

      return res.status(200).json(templates);

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }

  } else if (req.method === 'PUT') {
    
    const { title, tags, code, userId } = req.body;

    try {
      // Define filters based on provided fields
      const filters: Record<string, any> = {};
  
      if (title) {
        filters.title = {
          contains: title,
        };
      }
  
      if (tags) {
        filters.tags = {
          contains: tags,
        };
      }
  
      if (code) {
        filters.code = {
          contains: code,
        };
      }
  
      if (userId) {
        const parsedUserId = parseInt(userId, 10);
        if (isNaN(parsedUserId)) {
          return res.status(400).json({ error: 'Invalid userID' });
        }
        filters.userId = parsedUserId;
      }
  
      // Query templates using the filters
      const templates = await prisma.template.findMany({
        where: filters,
      });
  
      res.status(200).json(templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      res.status(500).json({ error: 'Failed to fetch code Templates' });
    }
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}