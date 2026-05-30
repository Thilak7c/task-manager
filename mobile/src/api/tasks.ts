// src/api/tasks.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://172.31.72.81:8000/api';

export type TaskStatus = 'pending' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
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
  };
}

export interface TaskFilters {
  status?: TaskStatus | '';
  priority?: TaskPriority | '';
  page?: number;
  per_page?: number;
}

const CACHE_KEY = 'tasks_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

async function getCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) return null;
    return entry.data;
  } catch {
    return null;
  }
}

async function setCache<T>(key: string, data: T): Promise<void> {
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    await AsyncStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Silently fail on cache writes
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  useCache = false
): Promise<T> {
  const url = `${API_URL}${path}`;

  if (useCache) {
    const cached = await getCache<T>(url);
    if (cached) return cached;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },
      ...options,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
      throw errData;
    }

    const data: T = await res.json();

    if (useCache) {
      await setCache(url, data);
    }

    return data;
  } catch (err: any) {
    clearTimeout(timeout);

    // Network error — try offline cache
    if (useCache) {
      const stale = await AsyncStorage.getItem(url);
      if (stale) {
        const entry: CacheEntry<T> = JSON.parse(stale);
        return entry.data;
      }
    }

    throw err;
  }
}

export const tasksApi = {
  list(filters: TaskFilters = {}): Promise<PaginatedResponse<Task>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.set(k, String(v));
    });
    const qs = params.toString();
    return request<PaginatedResponse<Task>>(
      `/tasks${qs ? `?${qs}` : ''}`,
      {},
      true
    );
  },

  update(id: number, data: Partial<Task>): Promise<{ data: Task }> {
    return request<{ data: Task }>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(id: number): Promise<{ message: string }> {
    return request<{ message: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};
