import { useSortable } from "@dnd-kit/sortable";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { Column as ColumnType, Card } from "../types";
import { CardItem } from "./CardItem";

interface Props {
  column: ColumnType;
  onAddCard: (columnId: string, title: string) => void;
  onCardClick: (card: Card) => void;
}

export function ColumnContainer({ column, onAddCard, onCardClick }: Props) {
  const [newTitle, setNewTitle] = useState("");
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: "column", column },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddCard(column.id, newTitle.trim());
    setNewTitle("");
  }

  return (
    <div ref={setNodeRef} style={style} className="column">
      <div className="column-header" {...attributes} {...listeners}>
        <h3>{column.title}</h3>
      </div>

      <SortableContext
        items={column.cards.map((c) => c.id)}
        strategy={rectSortingStrategy}
      >
        <div className="column-cards">
          {column.cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              onClick={() => onCardClick(card)}
            />
          ))}
        </div>
      </SortableContext>

      <form className="add-card-form" onSubmit={handleAdd}>
        <input
          placeholder="Add a card..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}
