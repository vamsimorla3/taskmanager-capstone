import { useState, useEffect } from 'react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiHealthy, setApiHealthy] = useState(null);

  // Check API health once on load
  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then(() => setApiHealthy(true))
      .catch(() => setApiHealthy(false));
  }, []);

  // Fetch all tasks
  const fetchTasks = () => {
    setLoading(true);
    fetch(`${API_URL}/api/tasks`)
      .then((res) => res.json())
      .then((data) => {
        setTasks(data);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Create a new task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create task');
      }
      setNewTitle('');
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  // Toggle done status
  const handleToggleDone = async (task) => {
    try {
      await fetch(`${API_URL}/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: !task.done }),
      });
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete a task
  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/api/tasks/${id}`, { method: 'DELETE' });
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app">
      <h1>Task Manager</h1>

      <p className="api-status">
        API: {apiHealthy === null ? 'checking...' : apiHealthy ? '🟢 online' : '🔴 offline'}
      </p>

      {error && <p className="error">Error: {error}</p>}

      <form onSubmit={handleAddTask} className="add-form">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="What needs to be done?"
        />
        <button type="submit">Add Task</button>
      </form>

      {loading ? (
        <p>Loading tasks...</p>
      ) : error ? null : tasks.length === 0 ? (
        <p>No tasks yet — add one above.</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id} className={task.done ? 'done' : ''}>
              <span onClick={() => handleToggleDone(task)}>
                {task.done ? '✅' : '⬜'} {task.title}
              </span>
              <button onClick={() => handleDelete(task.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
