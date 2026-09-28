import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { getOwnedBoard, getOwnedColumn } from "./ownership";

const router = Router();
router.use(authMiddleware);

const createColumnSchema = z.object({
  title: z.string().min(1),
  position: z.number(),
});

const updateColumnSchema = z.object({
  title: z.string().min(1).optional(),
  position: z.number().optional(),
});

router.post(
  "/boards/:boardId/columns",
  asyncHandler(async (req: AuthRequest, res) => {
    await getOwnedBoard(req.params.boardId, req.userId!);
    const { title, position } = createColumnSchema.parse(req.body);
    const column = await prisma.column.create({
      data: { title, position, boardId: req.params.boardId },
    });
    res.status(201).json(column);
  }),
);

router.patch(
  "/columns/:id",
  asyncHandler(async (req: AuthRequest, res) => {
    await getOwnedColumn(req.params.id, req.userId!);
    const data = updateColumnSchema.parse(req.body);
    const column = await prisma.column.update({
      where: { id: req.params.id },
      data,
    });
    res.json(column);
  }),
);

router.delete(
  "/columns/:id",
  asyncHandler(async (req: AuthRequest, res) => {
    await getOwnedColumn(req.params.id, req.userId!);
    await prisma.column.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }),
);

export default router;
