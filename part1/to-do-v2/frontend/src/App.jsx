import { useState, useEffect } from 'react';
import RandomImage from './components/RandomImage.jsx';
import { fetchTodos, deleteAllTodos } from './api.js';
import TodoList from './components/TodoList.jsx';
import TodoForm from './components/TodoForm.jsx';
import TodoDelete from './components/TodoDelete.jsx';
import { markTodoCompleted } from './api.js';

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

  // Updates the completed status of a todo to the web app state
  async function handleCompleted(id) {
    await markTodoCompleted(id);
    const updatedTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: true } : todo
    );
    setTodos(updatedTodos);
  }

  return (
    <div style={{ textAlign: 'left' }}>
      <h1>The Project app</h1>
      <RandomImage />
      <TodoDelete onReset={handleReset} />
      <TodoForm onAdd={handleAdd} />
      <TodoList todos={todos} onCompleted={handleCompleted} />
    </div>
  );
}

export default App;
