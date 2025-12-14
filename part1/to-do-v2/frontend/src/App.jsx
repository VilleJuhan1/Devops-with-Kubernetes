import { useState, useEffect } from 'react';
import RandomImage from './components/RandomImage.jsx';
import TodoList from './components/TodoList.jsx';
import TodoForm from './components/TodoForm.jsx';

function App() {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_TODOS_URL || '/api/assets/todos';
    const fetchTodos = async () => {
      try {
        const response = await fetch(`${API_URL}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTodos(data);
      } catch (error) {
        console.error('Error fetching todos:', error);
      }
    };

    fetchTodos();
  }, []);

  return (
    <div style={{ textAlign: 'left' }}>
      <h1>The Project app</h1>
      <RandomImage />
      <h2>To do</h2>
      <TodoForm />
      <TodoList todos={todos} />
    </div>
  );
}

export default App;
