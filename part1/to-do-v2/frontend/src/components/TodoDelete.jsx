function TodoDelete({ onReset }) {
  return (
    <button
      onClick={onReset}
      style={{ marginTop: "1rem", background: "red", color: "white" }}
    >
      Delete all todos (DEV)
    </button>
  );
}
export default TodoDelete;