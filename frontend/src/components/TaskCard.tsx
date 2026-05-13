'use client';
import { useState } from 'react';
import { Task } from '../services/taskService';

interface Props {
  task: Task;
  onToggle: (id: string) => Promise<void>;
  onDelete: (id: string) => void;
  onUpdate: (id: string, payload: any) => Promise<void>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getDueStatus(dueDate: string | null): 'overdue' | 'due-soon' | 'ok' | null {
  if (!dueDate) return null;
  const now = new Date();
  const due = new Date(dueDate);
  const diff = due.getTime() - now.getTime();
  if (diff < 0) return 'overdue';
  if (diff < 86400000 * 2) return 'due-soon';
  return 'ok';
}

export default function TaskCard({ task, onToggle, onDelete, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description || '');
  const [editPriority, setEditPriority] = useState(task.priority);
  const [editDue, setEditDue] = useState(task.due_date ? task.due_date.split('T')[0] : '');
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);

  const dueStatus = getDueStatus(task.due_date);

  const handleSave = async () => {
    if (!editTitle.trim()) { setEditError('Title cannot be empty'); return; }
    setSaving(true);
    try {
      await onUpdate(task.id, {
        title: editTitle.trim(),
        description: editDesc.trim() || undefined,
        priority: editPriority,
        due_date: editDue || null,
      });
      setEditing(false);
      setEditError('');
    } catch (e: any) {
      setEditError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditPriority(task.priority);
    setEditDue(task.due_date ? task.due_date.split('T')[0] : '');
    setEditError('');
    setEditing(false);
  };

  return (
    <div className={`task-card priority-${task.priority} ${task.status === 'completed' ? 'completed' : ''}`}>
      <div className="task-main">
        <div className="checkbox-wrap">
          <div
            className={`checkbox ${task.status === 'completed' ? 'checked' : ''}`}
            onClick={() => onToggle(task.id)}
            role="checkbox"
            aria-checked={task.status === 'completed'}
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onToggle(task.id)}
            title={task.status === 'completed' ? 'Mark as pending' : 'Mark as complete'}
          >
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4l3 3 5-6" stroke="#0a0a0f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <div className="task-info">
          <div className="task-title-row">
            <span className="task-title">{task.title}</span>
            <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
          </div>

          {task.description && (
            <p className="task-description">{task.description}</p>
          )}

          <div className="task-meta">
            <span className="meta-item">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M6 3.5v2.5l1.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              {formatDate(task.created_at)}
            </span>

            {task.due_date && (
              <span className={`meta-item ${dueStatus === 'overdue' ? 'overdue' : dueStatus === 'due-soon' ? 'due-soon' : ''}`}>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M4 1v2M8 1v2M1 5h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                Due {formatDate(task.due_date)}
                {dueStatus === 'overdue' && ' · OVERDUE'}
              </span>
            )}
          </div>
        </div>

        <div className="task-actions">
          <button
            className="icon-btn"
            title="Edit task"
            onClick={() => setEditing(!editing)}
            aria-label="Edit task"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            className="icon-btn delete"
            title="Delete task"
            onClick={() => onDelete(task.id)}
            aria-label="Delete task"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M2 3.5h10M5 3.5V2h4v1.5M5.5 6v4M8.5 6v4M3 3.5l.7 8h6.6l.7-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {editing && (
        <div className="edit-form">
          <input
            className={`input ${editError ? 'error' : ''}`}
            value={editTitle}
            onChange={e => { setEditTitle(e.target.value); setEditError(''); }}
            placeholder="Task title"
            style={{ marginBottom: 8 }}
          />
          {editError && <p className="error-msg">⚠ {editError}</p>}
          <textarea
            className="textarea"
            value={editDesc}
            onChange={e => setEditDesc(e.target.value)}
            placeholder="Description (optional)"
            style={{ marginBottom: 8, marginTop: 4 }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            <select className="select" value={editPriority} onChange={e => setEditPriority(e.target.value as any)}>
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
            </select>
            <input
              className="input"
              type="date"
              value={editDue}
              onChange={e => setEditDue(e.target.value)}
            />
          </div>
          <div className="form-actions" style={{ marginTop: 0 }}>
            <button className="btn btn-ghost" onClick={handleCancel}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
