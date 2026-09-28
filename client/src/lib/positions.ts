import { Card } from "../types";

export function positionForIndex(
  items: { position: number }[],
  index: number,
): number {
  if (items.length === 0) return 1;
  if (index <= 0) return items[0].position - 1;
  if (index >= items.length) return items[items.length - 1].position + 1;
  const before = items[index - 1].position;
  const after = items[index].position;
  return (before + after) / 2;
}

export function findColumnIndexByCardId(
  columns: { id: string; cards: Card[] }[],
  cardId: string,
): number {
  return columns.findIndex((col) =>
    col.cards.some((card) => card.id === cardId),
  );
}
