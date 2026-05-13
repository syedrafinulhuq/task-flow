'use client';
import { useState } from 'react';
import { useTasks, FilterStatus, FilterPriority } from '../hooks/useTasks';
import TaskCard from '../components/TaskCard';
import AddTaskForm from '../components/AddTaskForm';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast, ToastContainer } from '../components/Toast';

export default function HomePage() {
  const {
    tasks, loading, error,
    filterStatus, filterPriority,
    setFilterStatus, setFilterPriority,
    createTask, updateTask, toggleTask, deleteTask,
  } = useTasks();

  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { toasts, show: showToast } = useToast();

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  const handleCreate = async (payload: any) => {
    await createTask(payload);
    showToast('Task created');
  };

  const handleToggle = async (id: string) => {
    try {
      const updated = await toggleTask(id);
      showToast(updated.status === 'completed' ? 'Task completed ✓' : 'Task reopened');
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleUpdate = async (id: string, payload: any) => {
    await updateTask(id, payload);
    showToast('Task updated');
  };

  const handleDeleteRequest = (id: string) => {
    setDeleteTarget(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTask(deleteTarget);
      showToast('Task deleted');
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const statusFilters: { label: string; value: FilterStatus; className?: string }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending', className: 'status-pending' },
    { label: 'Completed', value: 'completed', className: 'status-completed' },
  ];

  const priorityFilters: { label: string; value: FilterPriority; className?: string }[] = [
    { label: 'Any', value: 'all' },
    { label: 'High', value: 'high', className: 'priority-high' },
    { label: 'Medium', value: 'medium', className: 'priority-medium' },
    { label: 'Low', value: 'low', className: 'priority-low' },
  ];

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="app-header">
        <div className="header-inner">
          <a className="logo" href="/">
            <div className="logo-mark">TF</div>
            <span className="logo-text">Task-Flow</span>
          </a>
          <div className="header-stats">
            <span className="stat-pill">
              <span className="stat-dot pending" />
              {pendingCount} pending
            </span>
            <span className="stat-pill">
              <span className="stat-dot completed" />
              {completedCount} done
            </span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="main-content">
        <div className="page-heading">
          <h1 className="page-title">Your <span>tasks</span></h1>
          <p className="page-subtitle">// {tasks.length} total · focus mode</p>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="filter-group">
            {statusFilters.map(f => (
              <button
                key={f.value}
                className={`filter-btn ${filterStatus === f.value ? `active ${f.className || ''}` : ''}`}
                onClick={() => setFilterStatus(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="filter-group">
            {priorityFilters.map(f => (
              <button
                key={f.value}
                className={`filter-btn ${filterPriority === f.value ? `active ${f.className || ''}` : ''}`}
                onClick={() => setFilterPriority(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="toolbar-spacer" />

          <button className="btn-add" onClick={() => setShowForm(s => !s)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            New Task
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <AddTaskForm
            onAdd={handleCreate}
            onClose={() => setShowForm(false)}
          />
        )}

        {/* Error state */}
        {error && (
          <div style={{
            background: 'var(--red-glow)',
            border: '1px solid rgba(240,92,92,0.3)',
            borderRadius: 'var(--radius)',
            padding: '14px 16px',
            marginBottom: 16,
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: 'var(--red)',
          }}>
            ⚠ {error} — make sure the backend is running on port 4000
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="task-list">
            {[1, 2, 3].map(i => (
              <div key={i} style={{ borderRadius: 'var(--radius)', overflow: 'hidden', height: 80 }}>
                <div className="skeleton" style={{ height: '100%' }} />
              </div>
            ))}
          </div>
        )}

        {/* Task list */}
        {!loading && (
          <>
            {tasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">◻</div>
                <p className="empty-title">
                  {filterStatus !== 'all' || filterPriority !== 'all'
                    ? 'No tasks match this filter'
                    : 'No tasks yet'}
                </p>
                <p className="empty-subtitle">
                  {filterStatus !== 'all' || filterPriority !== 'all'
                    ? 'Try a different filter'
                    : 'Click "New Task" to get started'}
                </p>
              </div>
            ) : (
              <div className="task-list">
                {tasks.map((task, i) => (
                  <div key={task.id} style={{ animationDelay: `${i * 0.03}s` }}>
                    <TaskCard
                      task={task}
                      onToggle={handleToggle}
                      onDelete={handleDeleteRequest}
                      onUpdate={handleUpdate}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Delete confirm dialog */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete this task?"
          body="This action is permanent and cannot be undone."
          confirmLabel="Delete task"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}
