'use client';
import { useState, useEffect, useCallback } from 'react';
import { taskService, Task, CreateTaskPayload, UpdateTaskPayload } from '../services/taskService';

export type FilterStatus = 'all' | 'pending' | 'completed';
export type FilterPriority = 'all' | 'low' | 'medium' | 'high';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all');

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskService.getAll(filterStatus, filterPriority);
      setTasks(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterPriority]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (payload: CreateTaskPayload) => {
    const task = await taskService.create(payload);
    setTasks(prev => [task, ...prev]);
    return task;
  };

  const updateTask = async (id: string, payload: UpdateTaskPayload) => {
    const updated = await taskService.update(id, payload);
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
    return updated;
  };

  const toggleTask = async (id: string) => {
    const updated = await taskService.toggle(id);
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
    return updated;
  };

  const deleteTask = async (id: string) => {
    await taskService.delete(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return {
    tasks,
    loading,
    error,
    filterStatus,
    filterPriority,
    setFilterStatus,
    setFilterPriority,
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
    refetch: fetchTasks,
  };
}
