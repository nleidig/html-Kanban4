export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Board {
  id: string;
  title: string;
  position: number;
  slotIndex: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Card {
  id: string;
  title: string;
  description: string | null;
  position: number;
  columnId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  title: string;
  position: number;
  boardId: string;
  cards: Card[];
}

export interface BoardDetail extends Board {
  columns: Column[];
}
