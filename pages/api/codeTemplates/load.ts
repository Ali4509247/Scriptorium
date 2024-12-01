import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { id } = req.query as { id?: string };

    if (!id) {
      return res.status(400).json({ error: 'Template ID required' });
    }

    try {
      const template = await prisma.template.findUnique({
        where: { id: parseInt(id, 10) },
      });

      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }

      res.status(200).json({ message: 'Template retrieved', template });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}