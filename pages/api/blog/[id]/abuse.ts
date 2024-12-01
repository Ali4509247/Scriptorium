import { NextApiRequest, NextApiResponse } from 'next';
import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const blogId  = req.query.id as string;
    const content = req.body.reason as string;

    if (!blogId) {
        return res.status(400).json({ message: 'Blog ID is required' });
    }

    try {
        // update blog abuse reports
        const updatedBlog = await prisma.blog.update({
            where: {
              id: parseInt(blogId), // The unique identifier of the blog you want to update
            },
            data: {
              abuseReports: {
                increment: 1, // Increment the abuseReports field by 1
              },
            },
          });

          const abuseReport = await prisma.abuseReports.create({
            data: {
              content,
              blogId: parseInt(blogId),
            },
          });

        res.status(200).json({ message: 'Abuse report incremented successfully' });
    } catch (error) {
        console.error('Failed to toggle abuse report:', error);
        res.status(500).json({ message: 'Internal server error' });
    }

}