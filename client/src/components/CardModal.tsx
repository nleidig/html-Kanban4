import { FormEvent, useState } from "react";
import { Card } from "../types";

interface Props {
  card: Card;
  onClose: () => void;
  onSave: (title: string, description: string) => void;
  onDelete: () => void;
}

export function CardModal({ card, onClose, onSave, onDelete }: Props) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? "");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(title.trim(), description.trim());
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        className="modal card-modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <label>
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <label>
          Description
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <div className="modal-actions">
          <button type="button" className="danger" onClick={onDelete}>
            Delete
          </button>
          <div>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">Save</button>
          </div>
        </div>
      </form>
    </div>
  );
}
