import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { getOwnedCard, getOwnedColumn } from "./ownership";

const router = Router();
router.use(authMiddleware);

const createCardSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  position: z.number(),
});

const updateCardSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  position: z.number().optional(),
  columnId: z.string().uuid().optional(),
});

router.post(
  "/columns/:columnId/cards",
  asyncHandler(async (req: AuthRequest, res) => {
    await getOwnedColumn(req.params.columnId, req.userId!);
    const { title, description, position } = createCardSchema.parse(req.body);
    const card = await prisma.card.create({
      data: { title, description, position, columnId: req.params.columnId },
    });
    res.status(201).json(card);
  }),
);

router.patch(
  "/cards/:id",
  asyncHandler(async (req: AuthRequest, res) => {
    await getOwnedCard(req.params.id, req.userId!);
    const data = updateCardSchema.parse(req.body);

    if (data.columnId) {
      await getOwnedColumn(data.columnId, req.userId!);
    }

    const card = await prisma.card.update({
      where: { id: req.params.id },
      data,
    });
    res.json(card);
  }),
);

router.delete(
  "/cards/:id",
  asyncHandler(async (req: AuthRequest, res) => {
    await getOwnedCard(req.params.id, req.userId!);
    await prisma.card.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }),
);

export default router;
