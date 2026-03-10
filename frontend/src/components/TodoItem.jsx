import React, { useState } from 'react';
import '../styles/TodoItem.css';

const TodoItem = ({ todo, onUpdateTodo, onDeleteTodo }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [editData, setEditData] = useState({
    title: todo.title,
    description: todo.description,
    priority: todo.priority,
  });

  const handleToggleComplete = () => {
    onUpdateTodo(todo._id, { completed: !todo.completed });
  };

  const handleEdit = () => {
    setShowEditConfirm(true);
  };

  const handleSaveEdit = () => {
    onUpdateTodo(todo._id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDeleteTodo(todo._id);
    setShowDeleteConfirm(false);
  };

  const confirmEdit = () => {
    setIsEditing(true);
    setShowEditConfirm(false);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isEditing) {
    return (
      <div className="todo-item editing">
        <div className="edit-form">
          <input
            type="text"
            value={editData.title}
            onChange={(e) =>
              setEditData({ ...editData, title: e.target.value })
            }
            className="edit-title"
          />
          <textarea
            value={editData.description}
            onChange={(e) =>
              setEditData({ ...editData, description: e.target.value })
            }
            className="edit-description"
          ></textarea>
          <select
            value={editData.priority}
            onChange={(e) =>
              setEditData({ ...editData, priority: e.target.value })
            }
            className="edit-priority"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <div className="edit-actions">
            <button onClick={handleSaveEdit} className="btn btn-save">
              Save
            </button>
            <button onClick={handleCancel} className="btn btn-cancel">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-checkbox">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggleComplete}
        />
      </div>

      <div className="todo-content">
        <h4 className="todo-title">{todo.title}</h4>
        {todo.description && <p className="todo-description">{todo.description}</p>}
        <div className="todo-meta">
          <span className={`todo-priority priority-${todo.priority}`}>
            {todo.priority}
          </span>
          {todo.dueDate && (
            <span className="todo-due-date">{formatDate(todo.dueDate)}</span>
          )}
        </div>
      </div>

      <div className="todo-actions">
        <button onClick={handleEdit} className="btn btn-edit">
          Edit
        </button>
        <button onClick={handleDelete} className="btn btn-delete">
          Delete
        </button>
      </div>

      {/* Delete Confirmation Overlay */}
      {showDeleteConfirm && (
        <div className="confirmation-overlay">
          <div className="confirmation-modal">
            <h3>Delete Task</h3>
            <p>Are you sure you want to delete "{todo.title}"?</p>
            <p className="warning-text">This action cannot be undone.</p>
            <div className="confirmation-actions">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-cancel"
              >
                Cancel
              </button>
              <button onClick={confirmDelete} className="btn btn-delete">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Confirmation Overlay */}
      {showEditConfirm && (
        <div className="confirmation-overlay">
          <div className="confirmation-modal">
            <h3>Edit Task</h3>
            <p>Do you want to edit "{todo.title}"?</p>
            <div className="confirmation-actions">
              <button
                onClick={() => setShowEditConfirm(false)}
                className="btn btn-cancel"
              >
                Cancel
              </button>
              <button onClick={confirmEdit} className="btn btn-primary">
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoItem;
