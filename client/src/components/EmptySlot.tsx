import { useDroppable } from "@dnd-kit/core";

interface Props {
  id: string;
  column: number;
  row: number;
}

export function EmptySlot({ id, column, row }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <li
      ref={setNodeRef}
      className={`board-list-empty-slot${isOver ? " is-over" : ""}`}
      style={{ gridColumn: column, gridRow: row }}
      aria-hidden="true"
    />
  );
}
