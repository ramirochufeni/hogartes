import { Request, Response } from 'express';
import prisma from '../config/db';

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      include: { subcategory: true }
    });
    res.status(200).json(categories);
  } catch (error: any) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createCategoryTest = async (req: Request, res: Response): Promise<void> => {
  try {
    const cat = await prisma.category.create({
      data: {
        name: "Servicios MOCK",
        subcategory: {
          create: [
            { id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9), name: "Limpieza", updatedAt: new Date() },
            { id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9) + "x", name: "Reparación", updatedAt: new Date() }
          ]
        }
      },
      include: { subcategory: true }
    });
    res.status(201).json(cat);
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
