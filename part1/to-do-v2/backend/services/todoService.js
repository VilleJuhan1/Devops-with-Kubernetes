let todos = [ { id: 1, todo: "Learn Kubernetes", completed: true }, { id: 2, todo: "Build a To-Do App", completed: false } ];
let nextId = 3;

function getAllTodos() {
  console.log("Getting all todos:", todos);
  return todos;
}

function addTodo({ todo }) {
  
  const newTodo = { id: nextId++, todo, completed: false };
  todos.push(newTodo);
  return newTodo;
}

export default {
  getAllTodos,
  addTodo,
};