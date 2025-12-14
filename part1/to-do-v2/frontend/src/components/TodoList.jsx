function TodoList({ todos = [] }) {
  if (!Array.isArray(todos)) {
    console.error('todos is not an array:', todos);
    return null;
  }

  return (
    <ul>
      {todos.map(({ id, task, completed }) => (
        <li key={id}>
          {task}
          {completed && ' ✅'}
        </li>
      ))}
    </ul>
  );
}

export default TodoList;
