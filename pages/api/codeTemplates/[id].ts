import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { verifyRefreshToken } from "../../../lib/auth";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const currentUser = verifyRefreshToken(req.headers.authorization || '');
  const { id } = req.query as { id: string };

  // if (!currentUser) {
  //   return res.status(401).json({ message: "Unauthorized" });
  // }

  if (req.method === "PUT") {
    const { title, explanation, tags, code } = req.body as {
      title?: string;
      explanation?: string;
      tags?: string;
      code?: string;
    };

    try {
      if (!id) {
        return res.status(400).json({ message: "Template ID is required" });
      }
      const parsedId = parseInt(id as string, 10);
      if (isNaN(parsedId)) {
        return res.status(400).json({ message: "Invalid Template ID" });
      }

      const existingTemplate = await prisma.template.findUnique({
        where: { id: parsedId },
      });

      if (!existingTemplate) {
        return res.status(404).json({ message: "Template not found" });
      }


      const updatedTemplate = await prisma.template.update({
        where: { id: parsedId },
        data: {
          title: title !== undefined ? title : existingTemplate.title,
          explanation: explanation !== undefined && explanation !== null && explanation !== '' ? explanation : existingTemplate.explanation,
          tags: tags !== undefined ? tags : existingTemplate.tags,
          code: code !== undefined ? code : existingTemplate.code,
        },
      });

      return res.status(200).json(updatedTemplate);

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }

  } else if (req.method === "DELETE") {
    try {
      if (!id) {
        return res.status(400).json({ message: "Template ID is required" });
      }
      const parsedId = parseInt(id as string, 10);
      if (isNaN(parsedId)) {
        return res.status(400).json({ message: "Invalid Template ID" });
      }

      const existingTemplate = await prisma.template.findUnique({
        where: { id: parsedId },
      });

      if (!existingTemplate) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      await prisma.template.delete({
        where: { id: parsedId },
      });

      return res.status(200).json({ message: "Template deleted successfully" });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }

  } else if (req.method === 'GET') {
    // Get a template post by ID
    console.log(id);
    try {
      const newCodeTemplate = await prisma.template.findUnique({ 
        where: { id: parseInt(id) },
      });
      if (newCodeTemplate) {
        res.status(200).json(newCodeTemplate);
      } else {
        res.status(404).json({ error: 'code template not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve code template' });
    } 
    
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
}