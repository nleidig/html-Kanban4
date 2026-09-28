import { prisma } from "../prisma";
import { HttpError } from "../errors";

export async function getOwnedBoard(boardId: string, userId: string) {
  const board = await prisma.board.findFirst({
    where: { id: boardId, ownerId: userId },
  });
  if (!board) throw new HttpError(404, "Board not found");
  return board;
}

export async function getOwnedColumn(columnId: string, userId: string) {
  const column = await prisma.column.findFirst({
    where: { id: columnId, board: { ownerId: userId } },
  });
  if (!column) throw new HttpError(404, "Column not found");
  return column;
}

export async function getOwnedCard(cardId: string, userId: string) {
  const card = await prisma.card.findFirst({
    where: { id: cardId, column: { board: { ownerId: userId } } },
  });
  if (!card) throw new HttpError(404, "Card not found");
  return card;
}
