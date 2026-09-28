import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "../types";

interface Props {
  card: Card;
  onClick: () => void;
}

export function CardItem({ card, onClick }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: "card", card },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="card-item"
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      <p className="card-title">{card.title}</p>
      {card.description && (
        <p className="card-description">{card.description}</p>
      )}
    </div>
  );
}
