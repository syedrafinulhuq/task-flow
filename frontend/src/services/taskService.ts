const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : '/api';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: 'pending' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null as T;
  return res.json();
}

export const taskService = {
  async getAll(status?: string, priority?: string): Promise<Task[]> {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.set('status', status);
    if (priority && priority !== 'all') params.set('priority', priority);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/tasks${query}`);
    return handleResponse<Task[]>(res);
  },

  async create(payload: CreateTaskPayload): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<Task>(res);
  },

  async update(id: string, payload: UpdateTaskPayload): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<Task>(res);
  },

  async toggle(id: string): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks/${id}/toggle`, {
      method: 'PATCH',
    });
    return handleResponse<Task>(res);
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(res);
  },
};
