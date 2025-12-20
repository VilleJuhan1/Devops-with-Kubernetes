const API_URL = import.meta.env.VITE_TODOS_URL || '/api/todos';

// Haetaan todot rajapinnasta
export async function fetchTodos() {
  const res = await fetch(API_URL);
  return res.json();
}

// Lisätään uusi todo
export async function addTodo(todo) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(todo),
  });
  return res.json();
}
