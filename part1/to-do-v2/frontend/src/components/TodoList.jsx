function TodoList({ todos = [] }) {
  console.log('Rendering TodoList with todos:', todos);
  if (!Array.isArray(todos)) {
    console.error('todos is not an array:', todos);
    return null;
  }

  return (
    <ul>
      {todos.map((t) => (
        <li key={t.id}>
          {t.todo}
          {t.completed && ' ✅'}
        </li>
      ))}
    </ul>
  );
}

export default TodoList;
