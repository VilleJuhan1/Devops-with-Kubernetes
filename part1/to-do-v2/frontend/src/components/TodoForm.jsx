import { useState } from "react";
import { addTodo } from "../api";

function TodoForm({ onAdd }) {
  const [todo, setTodo] = useState("");

  const handleSubmit = async  (e) => {
    e.preventDefault();
    console.log("Boop!");
    const newTodo = await addTodo({ todo });
    console.log("New todo added:", newTodo);
    onAdd(newTodo);
    setTodo("");

  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={todo}
        onChange={(e) => setTodo(e.target.value)}
        placeholder="Add a new todo"
      />
      <button type="submit">Add</button>
    </form>
  );
}

export default TodoForm;