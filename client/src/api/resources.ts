import { api } from "./client";
import { Board, BoardDetail, User } from "../types";

export interface AuthResponse {
  token: string;
  user: User;
}

export const authApi = {
  register: (email: string, password: string, name: string) =>
    api.post<AuthResponse>("/auth/register", { email, password, name }),
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }),
};

export const boardsApi = {
  list: () => api.get<Board[]>("/boards"),
  create: (title: string) => api.post<Board>("/boards", { title }),
  get: (id: string) => api.get<BoardDetail>(`/boards/${id}`),
  update: (
    id: string,
    data: { title?: string; position?: number; slotIndex?: number },
  ) => api.patch<Board>(`/boards/${id}`, data),
  remove: (id: string) => api.delete<void>(`/boards/${id}`),
};

export const columnsApi = {
  create: (boardId: string, title: string, position: number) =>
    api.post(`/boards/${boardId}/columns`, { title, position }),
  update: (id: string, data: { title?: string; position?: number }) =>
    api.patch(`/columns/${id}`, data),
  remove: (id: string) => api.delete<void>(`/columns/${id}`),
};

export const cardsApi = {
  create: (
    columnId: string,
    title: string,
    position: number,
    description?: string,
  ) => api.post(`/columns/${columnId}/cards`, { title, position, description }),
  update: (
    id: string,
    data: {
      title?: string;
      description?: string | null;
      position?: number;
      columnId?: string;
    },
  ) => api.patch(`/cards/${id}`, data),
  remove: (id: string) => api.delete<void>(`/cards/${id}`),
};
