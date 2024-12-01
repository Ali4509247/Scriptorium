import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

interface Comment {
    id: number;
    content: string;
    blogId: number;
    createdAt: Date;
    updatedAt: Date;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    try {
        const comments: Comment[] = await prisma.comment.findMany({
            where: {
                blogId: parseInt(id as string),
            },
        });
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch comments' });
    } finally {
        await prisma.$disconnect();
    }
}