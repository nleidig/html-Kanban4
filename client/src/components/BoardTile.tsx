import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Board } from "../types";

interface Props {
  board: Board;
  column: number;
  row: number;
  onDelete: (id: string) => void;
}

export function BoardTile({ board, column, row, onDelete }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: board.id,
    data: { type: "board", board },
  });

  const style: CSSProperties = {
    gridColumn: column,
    gridRow: row,
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="board-list-item"
      {...attributes}
      {...listeners}
    >
      <Link to={`/boards/${board.id}`}>{board.title}</Link>
      <button
        className="danger"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => onDelete(board.id)}
      >
        Delete
      </button>
    </li>
  );
}
