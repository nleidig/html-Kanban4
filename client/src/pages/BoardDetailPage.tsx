import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { boardsApi, cardsApi, columnsApi } from "../api/resources";
import { BoardDetail, Card, Column } from "../types";
import { ColumnContainer } from "../components/ColumnContainer";
import { CardModal } from "../components/CardModal";
import { positionForIndex } from "../lib/positions";

export function BoardDetailPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const [board, setBoard] = useState<BoardDetail | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  useEffect(() => {
    if (boardId) loadBoard(boardId);
  }, [boardId]);

  async function loadBoard(id: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await boardsApi.get(id);
      setBoard(data);
      setColumns(data.columns);
    } catch {
      setError("Failed to load board");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddColumn(e: React.FormEvent) {
    e.preventDefault();
    if (!boardId || !newColumnTitle.trim()) return;
    const position =
      columns.length > 0 ? columns[columns.length - 1].position + 1 : 1;
    try {
      const column = await columnsApi.create(
        boardId,
        newColumnTitle.trim(),
        position,
      );
      setColumns((prev) => [...prev, { ...(column as Column), cards: [] }]);
      setNewColumnTitle("");
    } catch {
      setError("Failed to create column");
    }
  }

  async function handleAddCard(columnId: string, title: string) {
    const column = columns.find((c) => c.id === columnId);
    const position =
      column && column.cards.length > 0
        ? column.cards[column.cards.length - 1].position + 1
        : 1;
    try {
      const card = await cardsApi.create(columnId, title, position);
      setColumns((prev) =>
        prev.map((c) =>
          c.id === columnId ? { ...c, cards: [...c.cards, card as Card] } : c,
        ),
      );
    } catch {
      setError("Failed to create card");
    }
  }

  async function handleSaveCard(title: string, description: string) {
    if (!selectedCard) return;
    try {
      const updated = await cardsApi.update(selectedCard.id, {
        title,
        description,
      });
      setColumns((prev) =>
        prev.map((c) => ({
          ...c,
          cards: c.cards.map((card) =>
            card.id === selectedCard.id ? (updated as Card) : card,
          ),
        })),
      );
      setSelectedCard(null);
    } catch {
      setError("Failed to update card");
    }
  }

  async function handleDeleteCard() {
    if (!selectedCard) return;
    try {
      await cardsApi.remove(selectedCard.id);
      setColumns((prev) =>
        prev.map((c) => ({
          ...c,
          cards: c.cards.filter((card) => card.id !== selectedCard.id),
        })),
      );
      setSelectedCard(null);
    } catch {
      setError("Failed to delete card");
    }
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    if (active.data.current?.type === "card") {
      setActiveCard(active.data.current.card as Card);
    } else if (active.data.current?.type === "column") {
      setActiveColumn(active.data.current.column as Column);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveCard(null);
    setActiveColumn(null);
    if (!over || active.id === over.id) return;

    const activeType = active.data.current?.type;

    if (activeType === "column") {
      setColumns((prev) => {
        const oldIndex = prev.findIndex((c) => c.id === active.id);
        const newIndex = prev.findIndex((c) => c.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;
        const reordered = arrayMove(prev, oldIndex, newIndex);
        const moved = reordered[newIndex];
        const siblings = reordered.filter((c) => c.id !== moved.id);
        const newPosition = positionForIndex(siblings, newIndex);
        columnsApi
          .update(moved.id, { position: newPosition })
          .catch(() => loadBoard(boardId!));
        return reordered.map((c) =>
          c.id === moved.id ? { ...c, position: newPosition } : c,
        );
      });
      return;
    }

    if (activeType === "card") {
      const cardId = active.id as string;
      setColumns((prev) => {
        const sourceColIndex = prev.findIndex((c) =>
          c.cards.some((card) => card.id === cardId),
        );
        if (sourceColIndex === -1) return prev;
        const movingCard = prev[sourceColIndex].cards.find(
          (c) => c.id === cardId,
        );
        if (!movingCard) return prev;

        const next = prev.map((c) => ({ ...c, cards: [...c.cards] }));
        next[sourceColIndex].cards = next[sourceColIndex].cards.filter(
          (c) => c.id !== cardId,
        );

        let destColIndex = next.findIndex((c) => c.id === over.id);
        let destIndex: number;
        if (destColIndex !== -1) {
          destIndex = next[destColIndex].cards.length;
        } else {
          destColIndex = next.findIndex((c) =>
            c.cards.some((card) => card.id === over.id),
          );
          if (destColIndex === -1) return prev;
          destIndex = next[destColIndex].cards.findIndex(
            (c) => c.id === over.id,
          );
        }

        const destCol = next[destColIndex];
        const siblings = destCol.cards;
        const newPosition = positionForIndex(siblings, destIndex);
        const updatedCard = {
          ...movingCard,
          position: newPosition,
          columnId: destCol.id,
        };
        destCol.cards = [
          ...siblings.slice(0, destIndex),
          updatedCard,
          ...siblings.slice(destIndex),
        ];

        cardsApi
          .update(cardId, { columnId: destCol.id, position: newPosition })
          .catch(() => loadBoard(boardId!));

        return next;
      });
    }
  }

  if (loading) return <p className="page-status">Loading board...</p>;
  if (error && !board) return <p className="page-status error-text">{error}</p>;
  if (!board) return null;

  return (
    <div className="board-page">
      <header className="board-header">
        <Link to="/">← Boards</Link>
        <h1>{board.title}</h1>
      </header>

      {error && <p className="error-text">{error}</p>}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={columns.map((c) => c.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="columns-row">
            {columns.map((column) => (
              <ColumnContainer
                key={column.id}
                column={column}
                onAddCard={handleAddCard}
                onCardClick={setSelectedCard}
              />
            ))}

            <form className="add-column-form" onSubmit={handleAddColumn}>
              <input
                placeholder="New column title"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
              />
              <button type="submit">Add column</button>
            </form>
          </div>
        </SortableContext>

        <DragOverlay>
          {activeCard && (
            <div className="card-item">
              <p className="card-title">{activeCard.title}</p>
            </div>
          )}
          {activeColumn && (
            <div className="column">
              <div className="column-header">
                <h3>{activeColumn.title}</h3>
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onSave={handleSaveCard}
          onDelete={handleDeleteCard}
        />
      )}
    </div>
  );
}
