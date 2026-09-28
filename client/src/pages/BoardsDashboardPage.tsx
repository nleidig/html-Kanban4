import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CollisionDetection,
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { boardsApi } from "../api/resources";
import { Board } from "../types";
import { useAuth } from "../context/AuthContext";
import { BoardTile } from "../components/BoardTile";
import { EmptySlot } from "../components/EmptySlot";

const BOARD_GRID_COLUMNS = 6;
const BOARD_GRID_MIN_ROWS = 8;

const collisionDetection: CollisionDetection = (args) =>
  closestCenter({
    ...args,
    droppableContainers: args.droppableContainers.filter(
      (container) => container.id !== args.active.id,
    ),
  });

export function BoardsDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadBoards();
  }, []);

  async function loadBoards() {
    setLoading(true);
    setError(null);
    try {
      const data = await boardsApi.list();
      setBoards(data);
    } catch {
      setError("Failed to load boards");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const board = await boardsApi.create(newTitle.trim());
      setBoards((prev) => [...prev, board]);
      setNewTitle("");
    } catch {
      setError("Failed to create board");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this board?")) return;
    try {
      await boardsApi.remove(id);
      setBoards((prev) => prev.filter((b) => b.id !== id));
    } catch {
      setError("Failed to delete board");
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeBoard = boards.find((b) => b.id === active.id);
    if (!activeBoard) return;

    if (typeof over.id === "string" && over.id.startsWith("empty-")) {
      const targetSlot = Number(over.id.slice("empty-".length));

      setBoards((prev) =>
        prev.map((b) =>
          b.id === activeBoard.id ? { ...b, slotIndex: targetSlot } : b,
        ),
      );
      boardsApi
        .update(activeBoard.id, { slotIndex: targetSlot })
        .catch(() => loadBoards());
      return;
    }

    const overBoard = boards.find((b) => b.id === over.id);
    if (!overBoard) return;

    const activeSlot = activeBoard.slotIndex;
    const overSlot = overBoard.slotIndex;

    setBoards((prev) =>
      prev.map((b) => {
        if (b.id === activeBoard.id) return { ...b, slotIndex: overSlot };
        if (b.id === overBoard.id) return { ...b, slotIndex: activeSlot };
        return b;
      }),
    );
    boardsApi
      .update(activeBoard.id, { slotIndex: overSlot })
      .catch(() => loadBoards());
    boardsApi
      .update(overBoard.id, { slotIndex: activeSlot })
      .catch(() => loadBoards());
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>My Boards</h1>
        <div>
          <span className="user-name">{user?.name}</span>
          <button onClick={handleLogout}>Log out</button>
        </div>
      </header>

      {error && <p className="error-text">{error}</p>}

      <form className="create-board-form" onSubmit={handleCreate}>
        <input
          placeholder="New board title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button type="submit" disabled={creating}>
          {creating ? "Creating..." : "Create board"}
        </button>
      </form>

      {loading ? (
        <p>Loading boards...</p>
      ) : boards.length === 0 ? (
        <p>No boards yet. Create your first board above.</p>
      ) : (
        (() => {
          const maxUsedSlot = boards.reduce(
            (max, b) => Math.max(max, b.slotIndex),
            -1,
          );
          const rows = Math.max(
            BOARD_GRID_MIN_ROWS,
            Math.ceil((maxUsedSlot + 1) / BOARD_GRID_COLUMNS),
          );
          const totalSlots = BOARD_GRID_COLUMNS * rows;
          const usedSlots = new Set(boards.map((b) => b.slotIndex));
          const emptySlotIndexes = Array.from(
            { length: totalSlots },
            (_, i) => i,
          ).filter((i) => !usedSlots.has(i));

          return (
            <DndContext
              sensors={sensors}
              collisionDetection={collisionDetection}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={boards.map((b) => b.id)}
                strategy={rectSortingStrategy}
              >
                <ul
                  className="board-list"
                  style={{
                    gridTemplateColumns: `repeat(${BOARD_GRID_COLUMNS}, 160px)`,
                  }}
                >
                  {boards.map((board) => (
                    <BoardTile
                      key={board.id}
                      board={board}
                      column={Math.floor(board.slotIndex / rows) + 1}
                      row={(board.slotIndex % rows) + 1}
                      onDelete={handleDelete}
                    />
                  ))}
                  {emptySlotIndexes.map((slotIndex) => (
                    <EmptySlot
                      key={slotIndex}
                      id={`empty-${slotIndex}`}
                      column={Math.floor(slotIndex / rows) + 1}
                      row={(slotIndex % rows) + 1}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          );
        })()
      )}
    </div>
  );
}
