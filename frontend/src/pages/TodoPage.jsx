import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { todoAPI } from '../services/api';
import TodoList from '../components/TodoList';
import Navbar from '../components/Navbar';
import '../styles/Todo.css';

const TodoPage = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('active'); // all, active, completed
  const { user, isAuthenticated, loading: authLoading, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Fetch todos
  useEffect(() => {
    if (isAuthenticated) {
      fetchTodos();
    }
  }, [isAuthenticated]);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await todoAPI.getTodos();
      setTodos(response.data.data);
    } catch (err) {
      setError('Failed to load todos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTodo = async (id, updates) => {
    try {
      const response = await todoAPI.updateTodo(id, updates);
      setTodos(todos.map((t) => (t._id === id ? response.data.data : t)));
      setError('');
    } catch (err) {
      setError('Failed to update todo');
      console.error(err);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await todoAPI.deleteTodo(id);
      setTodos(todos.filter((t) => t._id !== id));
      setError('');
    } catch (err) {
      setError('Failed to delete todo');
      console.error(err);
    }
  };

  const handleAddTask = () => {
    navigate('/add-task');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Filter and sort todos
  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  }).sort((a, b) => {
    // Priority order: high > medium > low
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const completedCount = todos.filter((t) => t.completed).length;
  const activeCount = todos.length - completedCount;

  if (!isAuthenticated || authLoading) {
    return null;
  }

  return (
    <div className="todo-page">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="todo-container">
        <div className="todo-header">
          <div>
            <h1>My Tasks</h1>
            <p className="welcome-text">Welcome back, {user?.name}!</p>
          </div>
          <button onClick={handleAddTask} className="btn btn-primary add-task-btn">
            + Add New Task
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({todos.length})
          </button>
          <button
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active ({activeCount})
          </button>
          <button
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed ({completedCount})
          </button>
        </div>

        {loading ? (
          <p className="loading">Loading tasks...</p>
        ) : filteredTodos.length === 0 ? (
          <p className="no-todos">
            {todos.length === 0
              ? 'No tasks yet. Create one to get started!'
              : 'No tasks in this category'}
          </p>
        ) : (
          <TodoList
            todos={filteredTodos}
            onUpdateTodo={handleUpdateTodo}
            onDeleteTodo={handleDeleteTodo}
          />
        )}
      </div>
    </div>
  );
};

export default TodoPage;
