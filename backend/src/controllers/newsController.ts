import { RequestHandler } from 'express';
import prisma from '../config/db';

export const getPublicNews: RequestHandler = async (req, res, next) => {
  try {
    const news = await prisma.news.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        isFeatured: true,
        // @ts-ignore
        imageUrl: true,
        publishedAt: true
      }
    });
    res.status(200).json(news);
  } catch(error) {
    res.status(500).json({ error: 'Error fetching public news' });
  }
};

export const getPublicNewsById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await prisma.news.findFirst({
      where: { id: id as string, status: 'PUBLISHED' }
    });
    if(!item) return res.status(404).json({ error: 'News not found' });
    res.status(200).json(item);
  } catch(error) {
    res.status(500).json({ error: 'Error fetching the news' });
  }
};
