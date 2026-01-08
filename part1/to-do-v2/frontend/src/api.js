const API_URL = import.meta.env.VITE_TODOS_URL || 'todo/api/todos';

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

export async function markTodoCompleted(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "POST",
  });
  return res.json();
}

export async function deleteAllTodos() {
  const res = await fetch(API_URL, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete todos");
  }
}
