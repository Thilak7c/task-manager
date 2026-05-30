// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
}

export interface TaskFilters {
  status?: 'pending' | 'completed' | '';
  priority?: 'low' | 'medium' | 'high' | '';
  search?: string;
  page?: number;
  per_page?: number;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'completed';
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorData: ApiError = await res.json().catch(() => ({
      message: `HTTP ${res.status}: ${res.statusText}`,
    }));
    throw errorData;
  }

  return res.json();
}

export const tasksApi = {
  list(filters: TaskFilters = {}): Promise<PaginatedResponse<Task>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.set(key, String(value));
      }
    });
    const qs = params.toString();
    return request<PaginatedResponse<Task>>(`/tasks${qs ? `?${qs}` : ''}`);
  },

  get(id: number): Promise<{ data: Task }> {
    return request<{ data: Task }>(`/tasks/${id}`);
  },

  create(input: CreateTaskInput): Promise<{ data: Task }> {
    return request<{ data: Task }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  update(id: number, input: UpdateTaskInput): Promise<{ data: Task }> {
    return request<{ data: Task }>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },

  delete(id: number): Promise<{ message: string }> {
    return request<{ message: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};
