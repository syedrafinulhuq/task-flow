'use client';
import { useState } from 'react';
import { CreateTaskPayload } from '../services/taskService';

interface Props {
  onAdd: (payload: CreateTaskPayload) => Promise<void>;
  onClose: () => void;
}

export default function AddTaskForm({ onAdd, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setSubmitting(true);
    try {
      await onAdd({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate || undefined,
      });
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setError('');
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
    if (e.key === 'Escape') onClose();
  };

  return (
    <div className="form-card" onKeyDown={handleKeyDown}>
      <p className="form-title">New Task</p>

      <div style={{ marginBottom: 10 }}>
        <input
          className={`input ${error ? 'error' : ''}`}
          placeholder="Task title *"
          value={title}
          onChange={e => { setTitle(e.target.value); setError(''); }}
          autoFocus
        />
        {error && <p className="error-msg">⚠ {error}</p>}
      </div>

      <div style={{ marginBottom: 10 }}>
        <textarea
          className="textarea"
          placeholder="Description (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>

      <div className="form-row-3" style={{ marginBottom: 0 }}>
        <select className="select" value={priority} onChange={e => setPriority(e.target.value as any)}>
          <option value="low">🟢 Low</option>
          <option value="medium">🟡 Medium</option>
          <option value="high">🔴 High</option>
        </select>
        <input
          className="input"
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          placeholder="Due date"
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)' }}>
            ⌘ + Enter to save
          </span>
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Adding…' : '+ Add Task'}
        </button>
      </div>
    </div>
  );
}
