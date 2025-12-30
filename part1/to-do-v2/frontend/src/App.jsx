import { useState, useEffect } from 'react';
import RandomImage from './components/RandomImage.jsx';
import { fetchTodos, deleteAllTodos } from './api.js';
import TodoList from './components/TodoList.jsx';
import TodoForm from './components/TodoForm.jsx';
import TodoDelete from './components/TodoDelete.jsx';

function App() {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    fetchTodos().then(setTodos);
  }, []);

  function handleAdd(todo) {
    setTodos((prev) => [...prev, todo]);
  }

  async function handleReset() {
    await deleteAllTodos();
    await fetchTodos().then(setTodos);
  }

  return (
    <div style={{ textAlign: 'left' }}>
      <h1>The Project app</h1>
      <RandomImage />
      <h2>To do</h2>
      <TodoDelete onReset={handleReset} />
      <TodoForm onAdd={handleAdd} />
      <TodoList todos={todos} />
    </div>
  );
}

export default App;
