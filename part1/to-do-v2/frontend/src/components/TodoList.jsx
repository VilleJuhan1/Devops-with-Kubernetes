function TodoList({ todos = [], onCompleted }) {
  console.log('Rendering TodoList with todos:', todos);
  if (!Array.isArray(todos)) {
    console.error('todos is not an array:', todos);
    return null;
  }

  const incompleteTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  return (
    <div>
      <div>
        <h3>Active Todos</h3>
        <ul>
          {incompleteTodos.map((t) => (
            <li key={t.id}>
              {t.todo}
              {onCompleted && (
                <button onClick={() => onCompleted(t.id)}>Complete</button>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Completed Todos</h3>
        <ul>
          {completedTodos.map((t) => (
            <li key={t.id}>
              {t.todo} ✅
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default TodoList;
