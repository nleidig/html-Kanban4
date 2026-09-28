import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { HttpError } from "../errors";
import { asyncHandler } from "../utils/asyncHandler";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

const createBoardSchema = z.object({
  title: z.string().min(1),
});

const updateBoardSchema = z.object({
  title: z.string().min(1).optional(),
  position: z.number().optional(),
  slotIndex: z.number().int().optional(),
});

router.get(
  "/",
  asyncHandler(async (req: AuthRequest, res) => {
    const boards = await prisma.board.findMany({
      where: { ownerId: req.userId },
      orderBy: { position: "asc" },
    });
    res.json(boards);
  }),
);

router.post(
  "/",
  asyncHandler(async (req: AuthRequest, res) => {
    const { title } = createBoardSchema.parse(req.body);
    const last = await prisma.board.findFirst({
      where: { ownerId: req.userId },
      orderBy: { position: "desc" },
    });
    const position = last ? last.position + 1 : 1;
    const lastBySlot = await prisma.board.findFirst({
      where: { ownerId: req.userId },
      orderBy: { slotIndex: "desc" },
    });
    const slotIndex = lastBySlot ? lastBySlot.slotIndex + 1 : 0;
    const board = await prisma.board.create({
      data: { title, position, slotIndex, ownerId: req.userId! },
    });
    res.status(201).json(board);
  }),
);

router.patch(
  "/:id",
  asyncHandler(async (req: AuthRequest, res) => {
    const existing = await prisma.board.findFirst({
      where: { id: req.params.id, ownerId: req.userId },
    });
    if (!existing) throw new HttpError(404, "Board not found");

    const data = updateBoardSchema.parse(req.body);
    const board = await prisma.board.update({
      where: { id: existing.id },
      data,
    });
    res.json(board);
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req: AuthRequest, res) => {
    const board = await prisma.board.findFirst({
      where: { id: req.params.id, ownerId: req.userId },
      include: {
        columns: {
          orderBy: { position: "asc" },
          include: { cards: { orderBy: { position: "asc" } } },
        },
      },
    });
    if (!board) throw new HttpError(404, "Board not found");
    res.json(board);
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req: AuthRequest, res) => {
    const board = await prisma.board.findFirst({
      where: { id: req.params.id, ownerId: req.userId },
    });
    if (!board) throw new HttpError(404, "Board not found");

    await prisma.board.delete({ where: { id: board.id } });
    res.status(204).send();
  }),
);

export default router;
